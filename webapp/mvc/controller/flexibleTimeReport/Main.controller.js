sap.ui.define(
  [
    //
    'sap/ui/time/common/AppUtils',
    'sap/ui/time/mvc/controller/BaseController',
    'sap/ui/time/common/odata/Client',
    'sap/ui/time/common/odata/ServiceNames',
    'sap/base/Log',
    'sap/gantt/misc/Format',
    'sap/ui/time/control/MessageBox',
    'sap/ui/core/Fragment',
  ],
  (
    //
    AppUtils,
    BaseController,
    Client,
    ServiceNames,
    Log,
    Format,
    MessageBox,
    Fragment
  ) => {
    'use strict';

    return BaseController.extend('sap.ui.time.mvc.controller.flexibleTimeReport.Main', {
      initializeModel() {
        return {
          Auth: this.currentAuth(),
          busy: false,
          list: [],
          listInfo: { rowCount: 1 },
          header: {
            Period01Visible: false,
            Period02Visible: false,
            Period03Visible: true,
            Period01: '20250101',
          },
          contentsBusy: {
            button: false,
            search: false,
            table: false,
            FormTable: false,
          },
          PersaList: [],
          SchkzList: [],
          searchConditions: {
            Werks: '',
            Orgeh: '',
            Orgtx: '',
            Ename: '',
            Pernr: '',
            Werks: '',
            Begda: '',
            Endda: '',
            SearchType: '',
            SearchTypeVisible: '',
          },
          dialog: {
            data: {},

            OtypeList: [
              { Otype: 'C', Otext: '회사' },
              { Otype: 'O', Otext: '부서' },
              { Otype: 'P', Otext: '직원' },
            ],
            StynList: [
              { Code: 'Y', Text: 'Y' },
              { Code: 'N', Text: 'N' },
            ],

            minutesStep: 10,
            initBeguz: moment('0900', 'hhmm').toDate(),
            initEnduz: moment('1800', 'hhmm').toDate(),
          },
          approval: {
            rowCount: 1,
            list: [],
            Employees: [],
          },
        };
      },

      /**
       * @override
       */
      onBeforeShow() {
        BaseController.prototype.onBeforeShow.apply(this, arguments);
        this.onSetTableHeaderSpan();
      },

      setContentsBusy(bContentsBusy = true, vTarget = []) {
        const oViewModel = this.getViewModel();
        const mBusy = oViewModel.getProperty('/contentsBusy');

        if (_.isEmpty(vTarget)) {
          _.forOwn(mBusy, (v, p) => _.set(mBusy, p, bContentsBusy));
        } else {
          if (_.isArray(vTarget)) {
            _.forEach(vTarget, (s) => _.set(mBusy, s, bContentsBusy));
          } else {
            _.set(mBusy, vTarget, bContentsBusy);
          }
        }

        oViewModel.refresh();
      },

      async onObjectMatched() {
        const oViewModel = this.getViewModel();
        try {
          oViewModel.setSizeLimit(5000);
          this.setContentsBusy(true);
          oViewModel.setData(this.initializeModel());
          oViewModel.setProperty('/busy', true);

          if (this.currentAuth() === 'M' || this.currentAuth() === 'E') {
            oViewModel.setProperty('/searchConditions/Orgeh', this.getAppointeeProperty('Orgeh'));
            oViewModel.setProperty('/searchConditions/Otext', this.getAppointeeProperty('Stext'));
            if (this.currentAuth() === 'E') {
              oViewModel.setProperty('/searchConditions/Ename', this.getAppointeeProperty('Ename'));
              oViewModel.setProperty('/searchConditions/Pernr', this.getAppointeeProperty('Pernr'));
            }
          }

          const curDate = new Date();
          oViewModel.setProperty('/searchConditions/Begda', moment(new Date(curDate.getFullYear(), curDate.getMonth(), '1')).format('YYYYMMDD'));
          oViewModel.setProperty('/searchConditions/Endda', moment(new Date()).format('YYYYMMDD'));
          oViewModel.setProperty('/searchConditions/SearchType', 'A');

          await this.setPersaList();
          await this.onPressSearch();
          oViewModel.refresh(true);
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      // Table Header 합치기 설정
      async onSetTableHeaderSpan() {
        const oViewModel = this.getViewModel();

        this.TableUtils.adjustRowSpan({
          oTable: this.byId('PersonTable'),
          aColIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 19],
          sTheadOrTbody: 'thead',
        });

        // var vColIndex = [0, 1, 2, 3, 4, 8];
        this.TableUtils.adjustRowSpan({
          oTable: this.byId('TeamTable'),
          aColIndices: [0, 1, 2, 3, 4, 5, 9],
          sTheadOrTbody: 'thead',
        });
      },

      async setPersaList() {
        const oViewModel = this.getViewModel();
        var vWerks = [];
        try {
          oViewModel.setProperty('/busy', true);
          const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'PersAreaList', {
            Actty: '1',
            Wave: '1',
          });

          for (var i = 0; i < aRowData.length; i++) {
            vWerks.push({
              code: aRowData[i].Persa,
              text: aRowData[i].Pbtxt,
            });
          }

          oViewModel.setProperty('/PersaList', vWerks);
          oViewModel.setProperty('/searchConditions/Werks', this.getAppointeeProperty('Persa'));
        } catch (oError) {
          throw oError;
        }
      },

      async onChangeEndda() {
        const oViewModel = this.getViewModel();
        if (oViewModel.getProperty('/Auth') === 'E') {
          const oEndda = oViewModel.getProperty('/searchConditions/Endda');
          const curDate = moment(new Date()).format('YYYYMM');
          if (oEndda > curDate) {
            MessageBox.alert('종료일자는 미래일자로 입력할 수 없습니다.');
            oViewModel.setProperty('/searchConditions/Endda', '');
          }
        }
      },

      async onPressSearch() {
        const oViewModel = this.getViewModel();
        if (oViewModel.getProperty('/searchConditions/SearchType') == 'A') {
          this.onPressSearchPerson();
        } else {
          this.onPressSearchTeam();
        }
      },

      async onPressSearchPerson() {
        const oViewModel = this.getViewModel();
        this.setContentsBusy(true, ['search', 'PersonTable']);

        try {
          const oTable = this.byId('PersonTable');
          const vWerks = oViewModel.getProperty('/searchConditions/Werks');
          const vBegda = oViewModel.getProperty('/searchConditions/Begda');
          const vEndda = oViewModel.getProperty('/searchConditions/Endda');
          const vPernr = oViewModel.getProperty('/searchConditions/Pernr');

          oViewModel.setProperty('/searchConditions/SearchTypeVisible', 'A');
          if (!vWerks || !vBegda || !vEndda) return;

          oViewModel.setProperty('/Personlist', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);

          const sAppstateNullText = this.getBundleText('LABEL_00102');
          var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.FLEXIBLETIME), 'FlexibleStatusP', {
            Austy: oViewModel.getProperty('/Auth'),
            Werks: vWerks,
            Orgeh: oViewModel.getProperty('/searchConditions/Orgeh'),
            Pernr: oViewModel.getProperty('/searchConditions/Pernr'),
            Begda: this.DateUtils.parse(vBegda),
            Endda: this.DateUtils.parse(vEndda),
            FlexibleStatusSet: [],
          });

          for (var i = 0; i < aRowData.length; i++) {
            aRowData[i].Wktimtx = aRowData[i].Wktimtx.replace('\\n', '<br>');
            aRowData[i].Cutimtx = aRowData[i].Cutimtx.replace('\\n', '<br>');
            aRowData[i].Perid = aRowData[i].Perid.replace('\\n', '<br>');
          }

          oViewModel.setProperty('/PersonlistInfo', {
            ...oViewModel.getProperty('/PersonlistInfo'),
            ...this.TableUtils.count({ oTable, aRowData }),
          });

          oViewModel.setProperty('/Personlist', aRowData);

          setTimeout(() => oTable.setFirstVisibleRow(), 100);
          this.TableUtils.clearTable(oTable);
          oViewModel.refresh(true);
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveList Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async onPressSearchTeam() {
        const oViewModel = this.getViewModel();
        this.setContentsBusy(true, ['search', 'TeamTable']);

        try {
          const oTable = this.byId('TeamTable');
          const vWerks = oViewModel.getProperty('/searchConditions/Werks');
          const vBegda = oViewModel.getProperty('/searchConditions/Begda');
          const vEndda = oViewModel.getProperty('/searchConditions/Endda');
          const vHeaderCount = 110;
          var vHeaderContents = {};
          var vTeamTaleList = [];
          var vHeaderPeridCount = 1;
          for (let i = 1; i <= vHeaderCount; i++) {
            if (i < 10) {
              eval('vHeaderContents.Perid0' + i + " = '';");
              eval('vHeaderContents.Perid0' + i + 'Visible = false;');
            } else {
              eval('vHeaderContents.Perid' + i + " = '';");
              eval('vHeaderContents.Perid' + i + 'Visible = false;');
            }
          }
          oViewModel.setProperty('/header', vHeaderContents);
          oViewModel.setProperty('/header/count', vHeaderPeridCount);
          oViewModel.setProperty('/searchConditions/SearchTypeVisible', 'B');
          if (!vWerks || !vBegda || !vEndda) return;

          oViewModel.setProperty('/list', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);

          const sAppstateNullText = this.getBundleText('LABEL_00102');
          var aRowData = await Client.deep(this.getViewModel(ServiceNames.FLEXIBLETIME), 'FlexibleStatus', {
            Werks: vWerks,
            Austy: oViewModel.getProperty('/Auth'),
            Orgeh: oViewModel.getProperty('/searchConditions/Orgeh'),
            Pernr: oViewModel.getProperty('/searchConditions/Pernr'),
            Begda: this.DateUtils.parse(vBegda),
            Endda: this.DateUtils.parse(vEndda),
            FlexiblePeriodSet: [],
            FlexibleStatusSet: [],
          });

          // Table Header 설정
          if (aRowData.FlexiblePeriodSet.results && aRowData.FlexiblePeriodSet.results.length > 0) {
            vHeaderContents = {};
            var vHeaderPerid = '';
            for (let i = 1; i <= vHeaderCount; i++) {
              if (i < 10) {
                eval('vHeaderPerid = aRowData.FlexiblePeriodSet.results[0].Perid0' + i + ';');
                eval('vHeaderContents.Perid0' + i + ' = vHeaderPerid ;');
                if (vHeaderPerid != '') {
                  eval('vHeaderContents.Perid0' + i + 'Visible = true;');
                } else {
                  eval('vHeaderContents.Perid0' + i + 'Visible = false;');
                }
              } else {
                eval('vHeaderPerid = aRowData.FlexiblePeriodSet.results[0].Perid' + i + ';');
                eval('vHeaderContents.Perid' + i + ' = vHeaderPerid ;');
                if (vHeaderPerid != '') {
                  eval('vHeaderContents.Perid' + i + 'Visible = true;');
                } else {
                  eval('vHeaderContents.Perid' + i + 'Visible = false;');
                }
              }
              // 주차별 근무 기간 Header Count 설정
              if (vHeaderPeridCount == 1 && vHeaderPerid == '') {
                vHeaderPeridCount = i;
              }
            }

            oViewModel.setProperty('/header', vHeaderContents);
            oViewModel.setProperty('/header/count', vHeaderPeridCount);
          }

          // Table 내용 적용
          if (aRowData.FlexibleStatusSet.results && aRowData.FlexibleStatusSet.results.length > 0) {
            // vTeamTaleList = aRowData.FlexibleStatusSet.results;
            for (var i = 0; i < aRowData.FlexibleStatusSet.results.length; i++) {
              if (aRowData.FlexibleStatusSet.results[i].Begda && aRowData.FlexibleStatusSet.results[i].Begda != '') {
                aRowData.FlexibleStatusSet.results[i].Begda = moment(aRowData.FlexibleStatusSet.results[i].Begda).format('YYYY-MM-DD');
              }
              if (aRowData.FlexibleStatusSet.results[i].Endda && aRowData.FlexibleStatusSet.results[i].Endda != '') {
                aRowData.FlexibleStatusSet.results[i].Endda = moment(aRowData.FlexibleStatusSet.results[i].Endda).format('YYYY-MM-DD');
              }
              vTeamTaleList.push(aRowData.FlexibleStatusSet.results[i]);
            }
          }
          oViewModel.setProperty('/Teamlist', vTeamTaleList);

          oViewModel.setProperty('/TeamlistInfo', {
            ...oViewModel.getProperty('/TeamlistInfo'),
            ...this.TableUtils.count({ oTable, aRowData }),
          });

          setTimeout(() => oTable.setFirstVisibleRow(), 100);
          this.TableUtils.clearTable(oTable);
          oViewModel.refresh(true);
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveList Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      onPressExcelDownload() {
        const oViewModel = this.getViewModel();
        let oTable, sFileName;
        sFileName = '보상 휴가 현황';
        oTable = this.byId('Table');
        this.TableUtils.export({ oTable, sFileName });
      },

      getCurrentLocationText() {
        return '탄력근무현황';
      },

      getBreadcrumbsLinks() {
        return [{ name: this.getBundleText('LABEL_01001') }]; // My Time
      },

      // 적용 대상 구분 변경 시 적용 대상 Clear
      async onChangeOtype() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/dialog/data/Otext', '');
        oViewModel.setProperty('/dialog/data/Objid', '');
      },

      getEmployeeSearchDialogCustomOptions() {
        const oViewModel = this.getViewModel();
        return {
          searchConditions: {
            Persa: oViewModel.getProperty('/searchConditions/Werks'),
          },
        };
      },

      callbackForRef({ Pernr, Ename }) {
        const oViewModel = this.getViewModel();
        if (!Pernr) {
          oViewModel.setProperty('/dialog/data/Objid', Pernr);
          oViewModel.setProperty('/dialog/data/Otext', Ename);
        } else {
          oViewModel.setProperty('/dialog/data/Objid', '');
          oViewModel.setProperty('/dialog/data/Otext', '');
        }
      },

      async onSearchOrg(oEvent) {
        const oViewModel = this.getViewModel();
        if (oViewModel.getProperty('/searchConditions/Werks') == '') return;
        this.onOrgSearchOpen(oViewModel.getProperty('/searchConditions/Werks'));
      },

      callbackOrg(mReturnData) {
        const oViewModel = this.getViewModel();

        if (mReturnData && mReturnData.length > 0) {
          oViewModel.setProperty('/searchConditions/Orgeh', mReturnData[0].Orgeh);
          oViewModel.setProperty('/searchConditions/Otext', mReturnData[0].Stext);
        } else {
          oViewModel.setProperty('/searchConditions/Orgeh', '');
          oViewModel.setProperty('/searchConditions/Otext', '');
        }
      },

      onTargetUserChange() {
        this.onEmployeeSearchOpen();
      },

      async callbackAppointeeChange({ Pernr, Ename, Werks, Pbtxt, Orgtx, Orgeh }) {
        // if (!Pernr) return false;
        const oViewModel = this.getViewModel();
        if (!Pernr) {
          oViewModel.setProperty('/searchConditions/Pernr', '');
          oViewModel.setProperty('/searchConditions/Ename', '');
          return;
        }

        oViewModel.setProperty('/searchConditions/Pernr', Pernr);
        oViewModel.setProperty('/searchConditions/Ename', Ename);
        await this.onPressSearch();

        oViewModel.refresh(true);
      },

      async replaceAll(str, searchStr, replaceStr) {
        return str.split(searchStr).join(replaceStr);
      },
    });
  }
);
