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
    // 'sap/ui/core/date/UI5Date'
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
    // UI5Date
  ) => {
    'use strict';

    return BaseController.extend('sap.ui.time.mvc.controller.timeClosing.Main', {
      initializeModel() {
        return {
          busy: false,
          Appno: '',
          loginInfo: this.getAppointeeProperty('LastLoginInfo'),
          contentsBusy: {
            button: false,
            search: false,
            table: false,
          },
          PersaList: [],
          searchConditions: {
            Werks: '',
            Orgeh: '',
          },
          searchDatas: {
            Werks: '',
            Orgeh: '',
            Otext: '',
            Yyyymm: moment(new Date()).format('YYYYMM'),
            Retirees: false,
          },
          entry: {
            RatnansTypeList: [],
            MytimeMonthlyOrgeh: [],
            MytimeMonthlyPerson: [],
            MyMonthlyStatus: {},
            MytimeHeader: {
              Ename: '',
              ClosingButtonVisible: true,
            },
            MytimeMonthlyPersonRowCount: 0,
            MytimeMonthlyOrgehSearchEname: '',
            MytimeMonthlyOrgehSearchTitletx: '',
            Total: 0,
            Complete: 0,
            Incomplete: 0,
            Confirm: 0,
            Save: 0,
            Holiday: 0,
          },
          Pernr: this.getAppointeeProperty('Pernr'),
          Auth: this.currentAuth(),
          selectedICBar: '1',
          InitClosingTime: moment('0800', 'hhmm').toDate(),
          ClosingMinutesStep: 30,
          Agree: false,
          approval: {
            rowCount: 1,
            list: [],
            Employees: [],
          },
          Deduction: {
            Month: '',
            NextMonth: '',
            Shortage: '',
          },
        };
      },

      /**
       * @override
       */
      onBeforeShow() {
        BaseController.prototype.onBeforeShow.apply(this, arguments);

        this.TableUtils.adjustRowSpan({
          oTable: this.byId('MainTable'),
          aColIndices: [0, 1, 2, 3, 4, 5, 8, 11, 12, 13, 14, 15, 16],
          sTheadOrTbody: 'thead',
        });
      },

      eventListener: function (e) {
        console.log(e);
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

          /*
            익월 여부 Parameter 수신일 경우
          */
          let vNMonth = AppUtils.getAppComponent().getAppModel().getData().NMonth;
          if (vNMonth == 'X') {
            const curDate = new Date();
            const nextDate = moment(new Date(curDate.getFullYear(), curDate.getMonth() - 1, curDate.getDate())).format('YYYYMM');
            oViewModel.setProperty('/searchDatas/Yyyymm', nextDate);
          }

          oViewModel.setProperty('/Pernr', this.getAppointeeProperty('Pernr'));
          await this.setPersaList();
          await this.setRatnansTypeList();
          // await this.setOrgehList();
          oViewModel.setProperty(
            '/searchDatas/Orgeh',
            this.getAppointeeProperty('DisOrgeh') && this.getAppointeeProperty('DisOrgeh') != '' ? this.getAppointeeProperty('DisOrgeh') : this.getAppointeeProperty('Teamcode')
          );
          oViewModel.setProperty(
            '/searchDatas/Otext',
            this.getAppointeeProperty('DisOrgeh') && this.getAppointeeProperty('DisOrgeh') != '' ? this.getAppointeeProperty('DisStext') : this.getAppointeeProperty('Stext')
          );
          await this.onPressSearch();

          const aMytimeMonthlyOrgeh = oViewModel.getProperty('/entry/MytimeMonthlyOrgeh');
          if (aMytimeMonthlyOrgeh.length > 0) {
            for (var i = 0; i < aMytimeMonthlyOrgeh.length; i++) {
              if (aMytimeMonthlyOrgeh[i].Pernr === this.getAppointeeProperty('Pernr')) {
                // 상위 화면의 정보 변경
                var oMytimeHeader = _.cloneDeep(aMytimeMonthlyOrgeh[i]);
                oMytimeHeader.Title = oMytimeHeader.Orgtx + ' ' + oMytimeHeader.Titletx;
                oMytimeHeader.Month = oMytimeHeader.Yyyymm.substring(4, 6);
                oMytimeHeader.SamePerson = true;
                oViewModel.setProperty('/entry/MytimeHeader', oMytimeHeader);

                await this.onSearchDetail();
                oViewModel.refresh(true);
                break;
              }
            }
          }
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
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
          oViewModel.setProperty('/searchDatas/Werks', this.getAppointeeProperty('Persa'));
        } catch (oError) {
          throw oError;
        }
      },

      async setOrgehList(oEvent) {
        const oViewModel = this.getViewModel();
        try {
          oViewModel.setProperty('/busy', true);
          if (oViewModel.getProperty('/searchDatas/Werks') == '') return;

          const aOrgList = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgList', {
            Persa: oViewModel.getProperty('/searchDatas/Werks'),
            Datum: this.DateUtils.parse(new Date()),
            Stype: '1',
          });

          oViewModel.setProperty('/OrgehList', aOrgList);

          if (!oEvent) {
            oViewModel.setProperty('/searchDatas/Orgeh', this.getAppointeeProperty('Orgeh'));
          }
        } catch (oError) {
          throw oError;
        }
      },

      async onSearchOrg(oEvent) {
        const oViewModel = this.getViewModel();
        if (oViewModel.getProperty('/searchDatas/Werks') == '') return;
        this.onOrgSearchOpen(oViewModel.getProperty('/searchDatas/Werks'));
      },

      callbackOrg(mReturnData) {
        const oViewModel = this.getViewModel();

        if (mReturnData && mReturnData.length > 0) {
          oViewModel.setProperty('/searchDatas/Orgeh', mReturnData[0].Orgeh);
          oViewModel.setProperty('/searchDatas/Otext', mReturnData[0].Stext);
        }
      },

      async setRatnansTypeList() {
        const oViewModel = this.getViewModel();
        var vRatnansTypeList = [];
        try {
          oViewModel.setProperty('/busy', true);
          const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'RatnansTypeList');

          for (var i = 0; i < aRowData.length; i++) {
            vRatnansTypeList.push({
              code: aRowData[i].Ratnans,
              text: aRowData[i].Ratnanstx,
            });
          }

          oViewModel.setProperty('/entry/RatnansTypeList', vRatnansTypeList);
        } catch (oError) {
          throw oError;
        }
      },

      SelectDetailAll(oEvent) {
        const oViewModel = this.getViewModel();
        const rSelected = oEvent.getSource().getSelected();
        var aRowData = oViewModel.getProperty('/entry/MytimeMonthlyPerson');

        for (var i = 0; i < aRowData.length; i++) {
          if (aRowData[i].Confirmyn == 'A') aRowData[i].Selected = false;
          else aRowData[i].Selected = rSelected;
        }

        oViewModel.setProperty('/entry/MytimeMonthlyPerson', aRowData);
      },

      async getSelectedRows(oEvent) {
        const oViewModel = this.getViewModel();
        var aRowData = oViewModel.getProperty('/entry/MytimeMonthlyPerson');
        var aSelectedIndexs = [];
        for (var i = 0; i < aRowData.length; i++) {
          if (aRowData[i].Selected) aSelectedIndexs.push(i);
        }
        return aSelectedIndexs;
      },

      onIconTabSelect(oEvent) {
        const oTable = this.byId('MainTable');
        oTable.getBinding().filter(null);
        var sKey = oEvent.getParameter('selectedKey'),
          oFilters = [];

        if (sKey === 'Complete') {
          oFilters.push(new sap.ui.model.Filter('Confirmyn', 'EQ', 'X'));
        } else if (sKey === 'Save') {
          oFilters.push(new sap.ui.model.Filter('Confirmyn', 'EQ', 'C'));
        } else if (sKey === 'Incomplete') {
          oFilters.push(new sap.ui.model.Filter('Confirmyn', 'EQ', ''));
        } else if (sKey === 'Holiday') {
          oFilters.push(new sap.ui.model.Filter('Confirmyn', 'EQ', 'A'));
        } else if (sKey === 'Confirm') {
          oFilters.push(new sap.ui.model.Filter('Checklist2', 'NE', ''));
        }

        oTable.getBinding().filter(oFilters, 'Application');
      },

      async onPressSearch(oEvent) {
        const oViewModel = this.getViewModel();
        const vSelectedICBar = oViewModel.getProperty('/selectedICBar');

        this.setContentsBusy(true, ['search', 'table']);

        try {
          const oTable = this.byId('MainTable');
          // const EntityName = vSelectedICBar == '1' ? 'FlexibleTimeDws' : vSelectedICBar == '2' ? 'FlexibleEtcInput' : vSelectedICBar == '3' ? 'SelectTimeBasis' : '';
          const vSearchDatas = oViewModel.getProperty('/searchDatas');

          if (!vSearchDatas.Werks || !vSearchDatas.Orgeh || !vSearchDatas.Yyyymm) return;

          oViewModel.setProperty('/entry/MytimeMonthlyOrgeh', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);

          // const sAppstateNullText = this.getBundleText('LABEL_00102');

          var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MytimeMonthlyOrgeh', {
            Werks: vSearchDatas.Werks,
            Orgeh: vSearchDatas.Orgeh,
            Yyyymm: vSearchDatas.Yyyymm,
            Austy: this.currentAuth(),
          });

          oViewModel.setProperty('/entry/MytimeMonthlyOrgeh', aRowData);
          oViewModel.setProperty('/entry/MytimeMonthlyPersonRowCount', 0);
          oViewModel.setProperty('/entry/MytimeMonthlyPerson', []);

          setTimeout(() => oTable.setFirstVisibleRow(), 100);
          this.TableUtils.clearTable(oTable);

          // 직접 조회 버튼을 클릭 한 경우 Header Clear 처리
          if (oEvent && oEvent != '') {
          }
          oViewModel.refresh(true);
          // this.setDetailsTableStyle();
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveList Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async onPressSearchWithCheckHeader(oEvent) {
        const oViewModel = this.getViewModel();
        const vSelectedICBar = oViewModel.getProperty('/selectedICBar');

        this.setContentsBusy(true, ['search', 'table']);

        try {
          const oTable = this.byId('MainTable');
          // const EntityName = vSelectedICBar == '1' ? 'FlexibleTimeDws' : vSelectedICBar == '2' ? 'FlexibleEtcInput' : vSelectedICBar == '3' ? 'SelectTimeBasis' : '';
          const vSearchDatas = oViewModel.getProperty('/searchDatas');

          if (!vSearchDatas.Werks || !vSearchDatas.Orgeh || !vSearchDatas.Yyyymm) return;

          oViewModel.setProperty('/entry/MytimeMonthlyOrgeh', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);

          // const sAppstateNullText = this.getBundleText('LABEL_00102');

          const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MytimeMonthlyOrgeh', {
            Werks: vSearchDatas.Werks,
            Orgeh: vSearchDatas.Orgeh,
            Yyyymm: vSearchDatas.Yyyymm,
            Austy: this.currentAuth(),
            Retirechk: vSearchDatas.Retirees === true ? 'X' : '',
          });

          oViewModel.setProperty('/entry/MytimeMonthlyOrgeh', aRowData);
          oViewModel.setProperty('/entry/MytimeMonthlyPersonRowCount', 0);
          oViewModel.setProperty('/entry/MytimeMonthlyPerson', []);

          setTimeout(() => oTable.setFirstVisibleRow(), 100);
          this.TableUtils.clearTable(oTable);

          //Header에 현재 데이터가 존재하는지 확인
          const aMytimeHeader = oViewModel.getProperty('/entry/MytimeHeader');

          if (aMytimeHeader.Pernr !== '') {
            const aMytimeMonthlyOrgeh = oViewModel.getProperty('/entry/MytimeMonthlyOrgeh');
            if (aMytimeMonthlyOrgeh.length > 0) {
              for (var i = 0; i < aMytimeMonthlyOrgeh.length; i++) {
                if (aMytimeMonthlyOrgeh[i].Pernr === aMytimeHeader.Pernr) {
                  // 상위 화면의 정보 변경
                  var oMytimeHeader = _.cloneDeep(aMytimeMonthlyOrgeh[i]);
                  oMytimeHeader.Title = oMytimeHeader.Orgtx + ' ' + oMytimeHeader.Titletx;
                  oMytimeHeader.Month = oMytimeHeader.Yyyymm.substring(4, 6);
                  oViewModel.setProperty('/entry/MytimeHeader', oMytimeHeader);

                  await this.onSearchDetail();
                  break;
                }
              }
            }
          }

          oViewModel.refresh(true);
          // this.setDetailsTableStyle();
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveList Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      // 좌측 리스트에서 인원을 선택한 경우
      async onSelectionMaster(oEvent) {
        const oViewModel = this.getViewModel();
        const vSelectedMaster = oViewModel.getProperty(oEvent.getParameters().listItem.getBindingContextPath());
        const vSearchDatas = oViewModel.getProperty('/searchDatas');

        // 상위 화면의 정보 변경
        var oMytimeHeader = _.cloneDeep(oViewModel.getProperty(oEvent.getParameters().listItem.getBindingContextPath()));
        oMytimeHeader.Title = vSelectedMaster.Orgtx + ' ' + vSelectedMaster.Titletx;
        oMytimeHeader.Month = vSelectedMaster.Yyyymm.substring(4, 6);

        oMytimeHeader.SamePerson = oMytimeHeader.Pernr == this.getAppointeeProperty('Pernr') ? true : false;

        oViewModel.setProperty('/entry/MytimeHeader', oMytimeHeader);
        //Table Header Check box Clear
        oViewModel.setProperty('/entry/SelectedAll', false);

        await this.onSearchDetail();
      },

      async onSearchDetail() {
        try {
          const oViewModel = this.getViewModel();
          const vSelectedMaster = oViewModel.getProperty('/entry/MytimeHeader');
          const oTable = this.byId('MainTable');
          const oList = this.byId('masterList');
          let vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          this.setContentsBusy(true, 'table');
          oViewModel.setProperty('/entry/MytimeMonthlyPerson', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);
          oList.removeSelections();
          var aRowData = [];
          // 선택 인원이 본인일 경우에만 리스트에 출력
          // if(oMytimeHeader.Pernr === this.getAppointeeProperty('Pernr')){

          aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MytimeMonthlyPerson', {
            Werks: vSelectedMaster.Werks,
            Pernr: vSelectedMaster.Pernr,
            Yyyymm: vSelectedMaster.Yyyymm,
            Austy: this.currentAuth(),
          });

          // }

          for (var i = 0; i < aRowData.length; i++) {
            if (aRowData[i].Resulthrs != '' || aRowData[i].Resultmin != '') {
              let total = '',
                hour = '',
                minute = '';
              hour = aRowData[i].Resulthrs.padStart(2, '0');
              minute = aRowData[i].Resultmin.padStart(2, '0');
              total = '' + hour + '시간' + minute + '분';
              // aRowData[i].Result = this.TimeUtils.toEdm(total);
              aRowData[i].Result = total;
            }
            aRowData[i].PcResult = '';
            if (_.toNumber(aRowData[i].Pchrs.trim()) != 0) {
              let hour = aRowData[i].Pchrs.trim().padStart(2, '0') + '시간';
              aRowData[i].PcResult = hour;
            }

            if (_.toNumber(aRowData[i].Pcmin) != 0) {
              let minute = aRowData[i].Pcmin.trim().padStart(2, '0') + '분';
              if (aRowData[i].PcResult == '') aRowData[i].PcResult = minute;
              else aRowData[i].PcResult = aRowData[i].PcResult + ' ' + minute;
            }

            aRowData[i].ScResult = '';
            if (_.toNumber(aRowData[i].Schrs) != 0) {
              let hour = aRowData[i].Schrs.trim().padStart(2, '0') + '시간';
              aRowData[i].ScResult = hour;
            }

            if (_.toNumber(aRowData[i].Scmin) != 0) {
              let minute = aRowData[i].Scmin.trim().padStart(2, '0') + '분';
              if (aRowData[i].ScResult == '') aRowData[i].ScResult = minute;
              else aRowData[i].ScResult = aRowData[i].ScResult + ' ' + minute;
            }

            aRowData[i].Idlelist = await this.replaceAll(aRowData[i].Idlelist, '<br>', '\n');

            if (aRowData[i].Confirmyn === 'X') {
              aRowData[i].Confirmyntx = '확정';
            } else if (aRowData[i].Confirmyn === 'C') {
              aRowData[i].Confirmyntx = '저장';
            } else if (aRowData[i].Confirmyn === 'A') {
              aRowData[i].Confirmyntx = '휴무';
            } else {
              aRowData[i].Confirmyntx = '미확정';
            }
            // aRowData[i].Idlelist = aRowData[i].Idlelist.replace('<br>', '\n');
            // aRowData[i].Idlelist = aRowData[i].Idlelist.replace('<br>', '\n');
          }

          oViewModel.setProperty('/entry/MytimeMonthlyPerson', aRowData);
          oViewModel.setProperty('/entry/MytimeMonthlyPersonRowCount', this.TableUtils.count({ oTable, aRowData }).rowCount);

          var vComplete = 0,
            vIncomplete = 0,
            vSave = 0,
            vHoliday = 0,
            vConfirm = 0;
          for (var i = 0; i < aRowData.length; i++) {
            if (aRowData[i].Confirmyn === 'X') vComplete++;
            else if (aRowData[i].Confirmyn === 'C') vSave++;
            else if (aRowData[i].Confirmyn === 'A') vHoliday++;
            else vIncomplete++;

            if (aRowData[i].Checklist2 != '') vConfirm++;
          }
          oViewModel.setProperty('/entry/Total', aRowData.length);
          oViewModel.setProperty('/entry/Complete', vComplete);
          oViewModel.setProperty('/entry/Incomplete', vIncomplete);
          oViewModel.setProperty('/entry/Save', vSave);
          oViewModel.setProperty('/entry/Holiday', vHoliday);
          oViewModel.setProperty('/entry/Confirm', vConfirm);
          oViewModel.setProperty('/entry/MytimeHeader/ClosingButtonVisible', aRowData.length > 0 && aRowData.length == vComplete ? true : false);

          await this.retrieveMyMonthlyStatus(); // 필요, 계획, 실적 시간 조회

          oViewModel.refresh(true);

          setTimeout(() => oTable.setFirstVisibleRow(), 100);
          this.TableUtils.clearTable(oTable);
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveList Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
          // this.setContentsBusy(false, 'table');
        } finally {
          this.setContentsBusy(false);
        }
      },

      async replaceAll(str, searchStr, replaceStr) {
        return str.split(searchStr).join(replaceStr);
      },

      async onPressExcelDownload() {
        const oViewModel = this.getViewModel();
        /*
         근무실적 Combobox
        */
        for (var i = 0; i < oViewModel.getProperty('/entry/MytimeMonthlyPerson').length; i++) {
          if (oViewModel.getProperty('/entry/MytimeMonthlyPerson')[i].Ratnans != '') {
            oViewModel.setProperty('/entry/MytimeMonthlyPerson/' + i + '/Ratnanstx', await this.getRatnansType(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[i].Ratnans));
          } else {
            oViewModel.setProperty('/entry/MytimeMonthlyPerson/' + i + '/Ratnanstx', '');
          }
        }

        let oTable, sFileName;
        sFileName = '월 근무 실적 입력';
        oTable = this.byId('MainTable');
        this.TableUtils.export({ oTable, sFileName });
      },

      async getRatnansType(rCode) {
        const oViewModel = this.getViewModel();

        const selectedRatnans = oViewModel.getProperty('/entry/RatnansTypeList').filter((o) => o.code === rCode);
        return selectedRatnans.length > 0 && selectedRatnans[0].text ? selectedRatnans[0].text : '';
      },

      getCurrentLocationText() {
        return '월 근무 실적 입력';
      },

      getBreadcrumbsLinks() {
        return [{ name: this.getBundleText('LABEL_01001') }]; // My Time
      },

      async onSearchMaster(oEvent) {
        console.log(oEvent);
      },

      async retrieveMyMonthlyStatus() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.MYTIME);
          var MytimeHeader = oViewModel.getProperty('/entry/MytimeHeader'),
            MyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');

          const sYear = MytimeHeader.Yyyymm.substring(0, 4);
          const sMonth = MytimeHeader.Yyyymm.substring(4, 6);
          // 해당 월의 일수와 요일을 구합니다.
          const lastDayOfMonth = new Date(sYear, sMonth, 0);
          const daysInMonth = lastDayOfMonth.getDate();
          const sFirtDay = '' + sYear + sMonth + '01';
          const sLastDay = '' + sYear + sMonth + String(daysInMonth);

          oViewModel.setProperty('/entry/MytimeHeader/firstDay', sFirtDay);
          oViewModel.setProperty('/entry/MytimeHeader/lastDay', sLastDay);

          const MytimeMonthlyPerson = oViewModel.getProperty('/entry/MytimeMonthlyPerson');

          const aResults = await Client.getEntitySet(oModel, 'MyMonthlyStatus', {
            Pernr: MytimeHeader.Pernr,
            Persa: MytimeHeader.Werks,
            Begda: this.DateUtils.parse(sFirtDay),
            Endda: this.DateUtils.parse(sLastDay),
            // Calyn: 'X',
            Calyn: '',
          });

          if (aResults && aResults.length > 0) {
            // 필수 근무 시간
            MyMonthlyStatus.Monwh = _.toNumber(aResults[0].Monwh);
            MyMonthlyStatus.MonwhT = MyMonthlyStatus.Monwh + ' H';
            // 법정 최대 근무 시간
            MyMonthlyStatus.Monmh = _.toNumber(aResults[0].Monmh);
            MyMonthlyStatus.MonmhT = MyMonthlyStatus.Monmh + ' H';
            // 기본근무 시간
            MyMonthlyStatus.BashrA2 = _.toNumber(aResults[0].BashrA2);
            MyMonthlyStatus.BashrAT = MyMonthlyStatus.BashrA2 + ' H';
            // 실적 시간
            MyMonthlyStatus.Resultmh = _.toNumber(aResults[0].Resultmh);
            MyMonthlyStatus.ResultmhT =
              !MyMonthlyStatus.Monwh || MyMonthlyStatus.Monwh == 0
                ? '　'
                : MyMonthlyStatus.Resultmh + ' H ( 월 필요 근무시간 대비 ' + ((MyMonthlyStatus.Resultmh / MyMonthlyStatus.Monwh) * 100).toFixed(0) + '% )';
            // 연장근무 시간
            MyMonthlyStatus.AddhrA = _.toNumber(aResults[0].AddhrA);
            MyMonthlyStatus.AddhrAT = MyMonthlyStatus.AddhrA + ' H';
            // 야간근무 시간
            MyMonthlyStatus.NgthrA = _.toNumber(aResults[0].NgthrA);
            MyMonthlyStatus.NgthrAT = MyMonthlyStatus.NgthrA + ' H';
            // 기본근무 시간
            MyMonthlyStatus.HwkhrA = _.toNumber(aResults[0].HwkhrA);
            MyMonthlyStatus.HwkhrAT = MyMonthlyStatus.HwkhrA + ' H';
            // 공제시간 총합  = 월 필요 근무시간 -
            MyMonthlyStatus.Reducttmh = ((MyMonthlyStatus.Monwh - MyMonthlyStatus.Resultmh).toFixed(2) / MyMonthlyStatus.Monwh).toFixed(2);
            MyMonthlyStatus.ReducttmhT = MyMonthlyStatus.Reducttmh + '(%)';
          }

          var vTotalidleh = 0,
            vTotalidlet = 0;
          for (var i = 0; i < MytimeMonthlyPerson.length; i++) {
            if (MytimeMonthlyPerson[i].Totalidle != '') {
              let regex = /[^0-9]/g;
              let vTotalidle = MytimeMonthlyPerson[i].Totalidle.replace(regex, '');
              vTotalidleh = vTotalidleh + _.toNumber(vTotalidle.substring(0, 2));
              vTotalidlet = vTotalidlet + _.toNumber(vTotalidle.substring(2, 4));
            }
          }

          vTotalidleh = vTotalidleh + _.toNumber(vTotalidlet / 60);
          MyMonthlyStatus.TotalidlA = vTotalidleh == 0 ? 0 : vTotalidleh.toFixed(2);
          MyMonthlyStatus.TotalidlAT = MyMonthlyStatus.TotalidlA + ' H';
          oViewModel.setProperty('/entry/MyMonthlyStatus', MyMonthlyStatus);
        } catch (oError) {
          throw oError;
        }
      },

      async onPressSave() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');
        this.setContentsBusy(true);
        var aSelectedData = [];
        const MytimeMonthlyPerson = oViewModel.getProperty('/entry/MytimeMonthlyPerson');
        for (var i = 0; i < MytimeMonthlyPerson.length; i++) {
          const aMytimeMonthlyPerson = _.cloneDeep(MytimeMonthlyPerson[i]);

          if ((aMytimeMonthlyPerson.Confirmyn === '' || aMytimeMonthlyPerson.Confirmyn === 'C') && aMytimeMonthlyPerson.Result && aMytimeMonthlyPerson.Result != '') {
            aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('시간', '');
            aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('분', '');
            if (aMytimeMonthlyPerson.Result.length != 4) {
              MessageBox.error(this.getBundleText('근무 실적시간에 유효하지 않은 값을 입력하였습니다. 확인 후 다시 저장하여 주시기 바랍니다.'));
              return;
            }
            aMytimeMonthlyPerson.Resulthrs = aMytimeMonthlyPerson.Result.substring(0, 2);
            aMytimeMonthlyPerson.Resultmin = aMytimeMonthlyPerson.Result.substring(2, 4);
            if (isNaN(aMytimeMonthlyPerson.Resulthrs) || isNaN(aMytimeMonthlyPerson.Resultmin)) {
              MessageBox.error(this.getBundleText('근무 실적시간에 유효하지 않은 값을 입력하였습니다. 확인 후 다시 저장하여 주시기 바랍니다.'));
              return;
            }

            if (aMytimeMonthlyPerson.Idlelist && aMytimeMonthlyPerson.Idlelist != '') {
              aMytimeMonthlyPerson.Idlelist = await this.replaceAll(aMytimeMonthlyPerson.Idlelist, '\n', '<br>');
            }

            if (aMytimeMonthlyPerson.Tmdat && aMytimeMonthlyPerson.Tmdat != '') {
              aMytimeMonthlyPerson.Tmdat = this.DateUtils.toConvertKoreaDate(aMytimeMonthlyPerson.Tmdat);
            }

            aSelectedData.push(aMytimeMonthlyPerson);
          }
        }

        if (aSelectedData.length < 1) {
          MessageBox.alert(this.getBundleText('현재 미확정 건수가 0 건입니다.'));
          return;
        }

        await this.saveProcess(aSelectedData);
      },

      async saveProcess(saveData) {
        const oViewModel = this.getViewModel();

        try {
          const oTable = this.byId('MainTable');

          await Client.deep(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyPClosing', {
            Gubun: 'C',
            MytimeMonthlyPClosingITemSet: saveData,
          });

          // {저장}되었습니다.
          MessageBox.success(this.getBundleText('MSG_00007', '저장'), {
            onClose: () => {
              oTable.clearSelection();
              this.onRefreshAfterUpdate(saveData[0].Pernr);
              // this.onSearchDetail();
            },
          });
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async onPressComplete() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');
        const aSelectedIndices = await this.getSelectedRows();
        const aTableData = oViewModel.getProperty('/entry/MytimeMonthlyPerson');

        if (aSelectedIndices.length < 1) {
          MessageBox.alert(this.getBundleText('MSG_00020', '확정')); // {확정}할 행을 선택하세요.
          return;
        }

        var aSelectedData = [];
        for (var i = 0; i < aSelectedIndices.length; i++) {
          const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[aSelectedIndices[i]]);

          if (aMytimeMonthlyPerson.Result && aMytimeMonthlyPerson.Result != '') {
            aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('시간', '');
            aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('분', '');
            if (aMytimeMonthlyPerson.Result.length != 4) {
              MessageBox.error(this.getBundleText('근무 실적시간에 유효하지 않은 값을 입력하였습니다. 확인 후 다시 저장하여 주시기 바랍니다.'));
              return;
            }
            aMytimeMonthlyPerson.Resulthrs = aMytimeMonthlyPerson.Result.substring(0, 2);
            aMytimeMonthlyPerson.Resultmin = aMytimeMonthlyPerson.Result.substring(2, 4);
            if (isNaN(aMytimeMonthlyPerson.Resulthrs) || isNaN(aMytimeMonthlyPerson.Resultmin)) {
              MessageBox.error(this.getBundleText('근무 실적시간에 유효하지 않은 값을 입력하였습니다. 확인 후 다시 저장하여 주시기 바랍니다.'));
              return;
            }
          } else {
            aMytimeMonthlyPerson.Resulthrs = '';
            aMytimeMonthlyPerson.Resultmin = '';
          }

          if (aMytimeMonthlyPerson.Idlelist && aMytimeMonthlyPerson.Idlelist != '') {
            aMytimeMonthlyPerson.Idlelist = await this.replaceAll(aMytimeMonthlyPerson.Idlelist, '\n', '<br>');
          }

          if (aMytimeMonthlyPerson.Tmdat && aMytimeMonthlyPerson.Tmdat != '') {
            aMytimeMonthlyPerson.Tmdat = this.DateUtils.toConvertKoreaDate(aMytimeMonthlyPerson.Tmdat);
          }

          aSelectedData.push(aMytimeMonthlyPerson);
        }

        if (aSelectedData.length < 1) {
          MessageBox.alert(this.getBundleText('선택한 행 중에 미확정 건수가 0 건입니다. 미확정 건을 선택하세요'));
          return;
        }

        MessageBox.confirm('선택한 행을 확정하시겠습니까?', {
          onClose: (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;

            // this.setContentsBusy(true);

            try {
              this.completeProcess(aSelectedData);
            } catch (oError) {
              this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

              AppUtils.handleError(oError);
            } finally {
              // this.setContentsBusy(false);
            }
          },
        });
      },

      async completeProcess(completeData) {
        const oViewModel = this.getViewModel();
        this.setContentsBusy(true);
        try {
          const oTable = this.byId('MainTable');

          await Client.deep(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyPClosing', {
            Gubun: 'S',
            MytimeMonthlyPClosingITemSet: completeData,
          });

          // 확정되었습니다. 미래 일자 포함시 확정 대상에서 제외됩니다.​
          MessageBox.success('확정되었습니다. \n 미래 일자 포함시 확정 대상에서 제외됩니다.', {
            onClose: () => {
              oTable.clearSelection();
              this.onRefreshAfterUpdate(completeData[0].Pernr);
              // this.onSearchDetail();
            },
          });
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async onPressCancel() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');
        const aSelectedIndices = await this.getSelectedRows();

        if (aSelectedIndices.length < 1) {
          MessageBox.alert(this.getBundleText('MSG_00020', '확정취소')); // {확정취소}할 행을 선택하세요.
          return;
        }

        var aSelectedData = [];
        for (var i = 0; i < aSelectedIndices.length; i++) {
          const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[aSelectedIndices[i]]);
          // if (aMytimeMonthlyPerson.Confirmyn === 'X')
          if (aMytimeMonthlyPerson.Result && aMytimeMonthlyPerson.Result != '') {
            aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('시간', '');
            aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('분', '');
            aMytimeMonthlyPerson.Resulthrs = aMytimeMonthlyPerson.Result.substring(0, 2);
            aMytimeMonthlyPerson.Resultmin = aMytimeMonthlyPerson.Result.substring(2, 4);
          }

          if (aMytimeMonthlyPerson.Idlelist && aMytimeMonthlyPerson.Idlelist != '') {
            aMytimeMonthlyPerson.Idlelist = await this.replaceAll(aMytimeMonthlyPerson.Idlelist, '\n', '<br>');
          }

          if (aMytimeMonthlyPerson.Tmdat && aMytimeMonthlyPerson.Tmdat != '') {
            aMytimeMonthlyPerson.Tmdat = this.DateUtils.toConvertKoreaDate(aMytimeMonthlyPerson.Tmdat);
          }

          aSelectedData.push(aMytimeMonthlyPerson);
        }

        if (aSelectedData.length < 1) {
          MessageBox.alert(this.getBundleText('선택한 행 중에 확정 건수가 0 건입니다. 확정 건을 선택하세요'));
          return;
        }

        // 선택된 행을 삭제하시겠습니까?
        MessageBox.confirm('선택한 행을 확정취소하시겠습니까?', {
          onClose: (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;

            // this.setContentsBusy(true);

            try {
              this.cancelProcess(aSelectedData);
            } catch (oError) {
              this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

              AppUtils.handleError(oError);
            } finally {
              // this.setContentsBusy(false);
            }
          },
        });
      },

      async cancelProcess(cancelData) {
        this.setContentsBusy(true);
        try {
          const oTable = this.byId('MainTable');
          await Client.deep(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyPClosing', {
            Gubun: 'D',
            MytimeMonthlyPClosingITemSet: cancelData,
          });

          MessageBox.success(this.getBundleText('MSG_00007', '확정취소'), {
            onClose: async () => {
              oTable.clearSelection();
              await this.onRefreshAfterUpdate(cancelData[0].Pernr);
            },
          });
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false);
        }
      },

      /*
       월 마감 취소
      */
      onPressCancelCloseRequest() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');
        const aSelectedIndices = oTable.getModel();

        // 선택된 행을 삭제하시겠습니까?
        MessageBox.confirm('마감신청 취소할까요?', {
          onClose: (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;

            try {
              this.cancelCloseRequestProcess();
            } catch (oError) {
              this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

              AppUtils.handleError(oError);
            } finally {
              // this.setContentsBusy(false);
            }
          },
        });
      },

      async cancelCloseRequestProcess(requestData) {
        try {
          const oViewModel = this.getViewModel();
          const sAppno = oViewModel.getProperty('/entry/MytimeMonthlyPerson')[0].Appno;
          const sPernr = oViewModel.getProperty('/entry/MytimeMonthlyPerson')[0].Pernr;
          const oTable = this.byId('MainTable');

          await Client.create(this.getModel(ServiceNames.APPROVAL), 'ApprovalProcess', {
            Appno: sAppno,
            Appst: '90',
            Appty: 'TP',
          });

          // const sUri = 'http://hrwdp.doosan.com/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fDoosanGHRIS!2fiViews!2fTA!2fFP_Approvalbox?sap-config-mode=true%26gAppty=TP';

          // await Client.getEntitySet(oModel, 'SendApprovalMail', {
          //   Appno: sAppno,
          //   Appst: '90',
          //   Uri: sUri,
          // });

          // {마감신청}되었습니다.
          MessageBox.success(this.getBundleText('MSG_00007', '마감신청취소'), {
            onClose: async () => {
              oTable.clearSelection();
              await this.onRefreshAfterUpdate(sPernr);
            },
          });
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        }
      },

      async onPressCloseRequestCheck() {
        const oViewModel = this.getViewModel();
        const oView = this.getView();

        if (!this.pFormDialog) {
          this.pFormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeClosing.fragment.FormDialog',
            controller: this,
          });

          oView.addDependent(this.pFormDialog);
        }

        let vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
        if (vMyMonthlyStatus.Monwh > vMyMonthlyStatus.Resultmh) {
          oViewModel.setProperty('/Agree', false); // 동의 여부 - 미동의
          this.pFormDialog.open();
        } else {
          this.onPressCloseRequest();
        }
      },

      async onPressCloseRequestFromDialog() {
        const oViewModel = this.getViewModel();
        const oView = this.getView();
        const vAgree = oViewModel.getProperty('/Agree');

        if (vAgree == true) {
          this.pFormDialog.close();
          this.pDeductionFormDialog.close();
          this.onPressCloseRequest();
        } else {
          MessageBox.error('동의여부를 선택 후 마감신청을 하시기 바랍니다.');
        }
      },

      async subtractDecimals(a, b) {
        const factor = 100; // 소수점 두 자리까지 처리
        const result = String((Math.round(a * factor) - Math.round(b * factor)) / factor);

        return result;
      },

      async onPressCloseRequestNewOData() {
        try {
          const oViewModel = this.getViewModel();
          const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[0]);
          let vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          let vMytimeMonthlyOrgeh = oViewModel.getProperty('/entry/MytimeMonthlyOrgeh')[0];
          await Client.create(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyClosing', {
            Pernr: aMytimeMonthlyPerson.Pernr,
            Yyyymm: vMytimeMonthlyOrgeh.Yyyymm,
            Bashr: vMyMonthlyStatus.BashrA2,
            Monwh: vMyMonthlyStatus.Monwh,
            Resultmh: vMyMonthlyStatus.Resultmh,
            // Dedhr: String(_.toNumber(vMyMonthlyStatus.Monwh) - _.toNumber(vMyMonthlyStatus.Resultmh)),
            Dedhr: await this.subtractDecimals(_.toNumber(vMyMonthlyStatus.Monwh), _.toNumber(vMyMonthlyStatus.Resultmh)),
            Chkyn: 'Y',
          });

          return true;
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
          return false;
        }
      },

      async onPressCloseRequest() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');

        var aSelectedData = [];
        const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[0]);

        if (aMytimeMonthlyPerson.Result && aMytimeMonthlyPerson.Result != '') {
          aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('시간', '');
          aMytimeMonthlyPerson.Result = aMytimeMonthlyPerson.Result.replace('분', '');
          aMytimeMonthlyPerson.Resulthrs = aMytimeMonthlyPerson.Result.substring(0, 2);
          aMytimeMonthlyPerson.Resultmin = aMytimeMonthlyPerson.Result.substring(2, 4);
          if (aMytimeMonthlyPerson.Result.length != 4) {
            MessageBox.error(this.getBundleText('근무 실적시간에 유효하지 않은 값을 입력하였습니다. 확인 후 다시 저장하여 주시기 바랍니다.'));
            return;
          }
          aMytimeMonthlyPerson.Resulthrs = aMytimeMonthlyPerson.Result.substring(0, 2);
          aMytimeMonthlyPerson.Resultmin = aMytimeMonthlyPerson.Result.substring(2, 4);
          if (isNaN(aMytimeMonthlyPerson.Resulthrs) || isNaN(aMytimeMonthlyPerson.Resultmin)) {
            MessageBox.error(this.getBundleText('근무 실적시간에 유효하지 않은 값을 입력하였습니다. 확인 후 다시 저장하여 주시기 바랍니다.'));
            return;
          }
        }

        if (aMytimeMonthlyPerson.Idlelist && aMytimeMonthlyPerson.Idlelist != '') {
          aMytimeMonthlyPerson.Idlelist = await this.replaceAll(aMytimeMonthlyPerson.Idlelist, '\n', '<br>');
        }

        let vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
        // 2025-02-10 임시 주석 처리 차후 주석 해제
        aMytimeMonthlyPerson.Resultmh = vMyMonthlyStatus.Resultmh;
        aMytimeMonthlyPerson.Bashr = vMyMonthlyStatus.BashrA;

        if (aMytimeMonthlyPerson.Tmdat && aMytimeMonthlyPerson.Tmdat != '') {
          aMytimeMonthlyPerson.Tmdat = this.DateUtils.toConvertKoreaDate(aMytimeMonthlyPerson.Tmdat);
        }

        aSelectedData.push(aMytimeMonthlyPerson);

        if (vMyMonthlyStatus.Monwh > vMyMonthlyStatus.Resultmh) {
          const result = await this.onPressCloseRequestNewOData();
          if (!result) return;
          this.closeRequestProcess(aSelectedData);
        } else {
          MessageBox.confirm('마감신청하시겠습니까?', {
            onClose: (sAction) => {
              if (MessageBox.Action.CANCEL === sAction) return;

              // this.setContentsBusy(true);

              try {
                this.closeRequestProcess(aSelectedData);
              } catch (oError) {
                this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

                AppUtils.handleError(oError);
              } finally {
                // this.setContentsBusy(false);
              }
            },
          });
        }
      },

      async closeRequestProcess(requestData) {
        try {
          const oTable = this.byId('MainTable');
          const aAppno = requestData[0].Appno;

          await Client.deep(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyPClosing', {
            Gubun: 'M',
            Austy: this.currentAuth(),
            MytimeMonthlyPClosingITemSet: requestData,
          });

          let vRreturn = '';
          if (this.currentAuth() === 'H') {
            vRreturn = await this.sendApprovalMail(aAppno);
          } else {
            await this.retrieveApplyList();
            await this.approvalSave(aAppno);
          }

          if (vRreturn == '') {
            // {마감신청}되었습니다.
            MessageBox.success(this.getBundleText('MSG_00007', '마감신청'), {
              onClose: async () => {
                oTable.clearSelection();
                await this.onRefreshAfterUpdate(requestData[0].Pernr);
              },
            });
          }
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        }
      },

      async sendApprovalMail(sAppno) {
        const oViewModel = this.getViewModel();

        try {
          const sUri = 'http://hrwdp.doosan.com/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fDoosanGHRIS!2fiViews!2fTA!2fFP_Approvalbox?sap-config-mode=true%26gAppty=TP';

          await Client.getEntitySet(this.getModel(ServiceNames.APPROVAL), 'SendApprovalMail', {
            Appno: sAppno,
            Appst: '30',
            Uri: sUri,
          });
        } catch (oError) {
          this.debug('Controller > TimeClosing > sendApprovalMail Error', oError);

          AppUtils.handleError(oError);
          return 'Error';
        }

        return '';
      },

      async retrieveApplyList() {
        const oViewModel = this.getViewModel();

        try {
          const aResults = await Client.getEntitySet(this.getModel(ServiceNames.APPROVAL), 'ApproverList', { Pernr: this.getAppointeeProperty('Pernr'), Appty: 'TP' });

          oViewModel.setProperty('/approval/list', aResults);
          oViewModel.setProperty('/approval/rowCount', Math.min(aResults.length, 5));
        } catch (oError) {
          this.debug('Controller > TimeRegistration > getAbsenceDataInfo Error', oError);

          AppUtils.handleError(oError);
          return 'Error';
        }

        return '';
      },

      async approvalSave(sAppno) {
        try {
          const oModel = this.getModel(ServiceNames.APPROVAL);
          const oViewModel = this.getViewModel();
          const aRowData = oViewModel.getProperty('/approval/list') || [];

          await Client.deep(oModel, 'ApproverHeader', {
            Appno: sAppno,
            ApproverListNav: [
              ..._.chain(aRowData)
                .filter((o) => !_.isEmpty(o.Pernr))
                .map((o) => ({ ...o, Appno: sAppno }))
                .value(),
            ],
          });

          const sUri = 'http://hrwdp.doosan.com/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fDoosanGHRIS!2fiViews!2fTA!2fFP_Approvalbox?sap-config-mode=true%26gAppty=TP';

          await Client.getEntitySet(oModel, 'SendApprovalMail', {
            Appno: sAppno,
            Appst: '20',
            Uri: sUri,
          });
        } catch (oError) {
          throw oError;
        }
      },

      // 업데이트(저장, 확정, 확정취소) 이후 좌측 리스트, Header, 상세 리스트 조회
      async onRefreshAfterUpdate(aPernr) {
        const oViewModel = this.getViewModel();
        try {
          await this.onPressSearch();
          const aMytimeMonthlyOrgeh = oViewModel.getProperty('/entry/MytimeMonthlyOrgeh');
          if (aMytimeMonthlyOrgeh.length > 0) {
            for (var i = 0; i < aMytimeMonthlyOrgeh.length; i++) {
              if (aMytimeMonthlyOrgeh[i].Pernr === aPernr) {
                // 상위 화면의 정보 변경
                var oMytimeHeader = _.cloneDeep(aMytimeMonthlyOrgeh[i]);
                oMytimeHeader.Title = oMytimeHeader.Orgtx + ' ' + oMytimeHeader.Titletx;
                oMytimeHeader.Month = oMytimeHeader.Yyyymm.substring(4, 6);
                oViewModel.setProperty('/entry/MytimeHeader', oMytimeHeader);

                await this.onSearchDetail();
                break;
              }
            }
          }
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        }
      },

      onPressFormDialogClose() {
        this.pFormDialog.close();
      },

      onPressMoveToTimeRegistration() {
        location.href = '/sap/bc/ui5_ui5/sap/ZHRXX_TIME/index.html#/timeRegistration';
      },

      async onPressCloseRequestDeductionDialog() {
        const oViewModel = this.getViewModel();
        const oView = this.getView();

        if (!this.pDeductionFormDialog) {
          this.pDeductionFormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeClosing.fragment.DeductionFormDialog',
            controller: this,
          });

          oView.addDependent(this.pDeductionFormDialog);
        }

        oViewModel.setProperty('/Agree', false); // 동의 여부 - 미동의

        let vMonth = _.toNumber(oViewModel.getProperty('/entry/MytimeHeader/Month')) + 1;
        if (vMonth > 12) vMonth = 1;
        oViewModel.setProperty('/Deduction/Month', oViewModel.getProperty('/entry/MytimeHeader/Month'));
        oViewModel.setProperty('/Deduction/NextMonth', '' + vMonth);
        let vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
        let vShortageN = vMyMonthlyStatus.Monwh - vMyMonthlyStatus.Resultmh;
        let vShortageT = '';
        let vHour = parseInt(vShortageN);
        let vMinute = (vShortageN - vHour).toFixed(2) * 60;
        if (vHour > 0) vShortageT = vHour + ' 시간';
        if (vMinute > 0) vShortageT = vShortageT + ' ' + vMinute + ' 분';
        oViewModel.setProperty('/Deduction/Shortage', vShortageT);

        this.pDeductionFormDialog.open();
      },

      onPressDeductionFormDialogClose() {
        this.pDeductionFormDialog.close();
      },
    });
  }
);
