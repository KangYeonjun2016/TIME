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

        // this.TableUtils.adjustRowSpan({
        //   oTable: this.byId('Table'),
        //   aColIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        //   sTheadOrTbody: 'thead',
        // });
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

          this.initializePopover();

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

          await this.setPersaList();
          // await this.onPressSearch();
          oViewModel.refresh(true);
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async initializePopover() {
        const oView = this.getView();

        this._Popover = await Fragment.load({
          id: oView.getId(),
          name: 'sap.ui.time.mvc.view.flexibleTimeReport.fragment.FormPopover',
          controller: this,
        });

        oView.addDependent(this._Popover);

        this.onAfterRenderingPopOver();
      },

      async onAfterRenderingPopOver() {
        const oViewModel = this.getViewModel();
        this.byId('PopoverTable').addEventDelegate({
          onAfterRendering: () => {
            const vWerks = oViewModel.getProperty('/searchConditions/Werks');
            const colIndex = oViewModel.getProperty('/Auth') === 'E' ? 2 : 5;
            if (vWerks === '0900') {
              // this.TableUtils._rederTableRowspan(this.byId('PopoverTable'), [5], 7, 0, 1);
              this.TableUtils._rederAwardTableRowspan(this.byId('PopoverTable'), [colIndex], vWerks, 0, 1);
            } else {
              // this.TableUtils._rederTableRowspan(this.byId('PopoverTable'), [5], 7, 0, 2);
              this.TableUtils._rederAwardTableRowspan(this.byId('PopoverTable'), [colIndex], vWerks, 0, 2);
            }
          },
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
        this.setContentsBusy(true, ['search', 'table']);

        try {
          const oTable = this.byId('Table');
          const vWerks = oViewModel.getProperty('/searchConditions/Werks');
          const vBegda = oViewModel.getProperty('/searchConditions/Begda');
          const vEndda = oViewModel.getProperty('/searchConditions/Endda');

          if (!vWerks || !vBegda || !vEndda) return;

          oViewModel.setProperty('/list', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);

          const sAppstateNullText = this.getBundleText('LABEL_00102');
          var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'ReadBosangcnt', {
            Persa: vWerks,
            Austy: oViewModel.getProperty('/Auth'),
            Orgeh: oViewModel.getProperty('/searchConditions/Orgeh'),
            Pernr: oViewModel.getProperty('/searchConditions/Pernr'),
            Begda: this.DateUtils.parse(vBegda),
            Endda: this.DateUtils.parse(vEndda),
          });

          oViewModel.setProperty('/listInfo', {
            ...oViewModel.getProperty('/listInfo'),
            ...this.TableUtils.count({ oTable, aRowData }),
          });

          for (var i = 0; i < aRowData.length; i++) {
            if (aRowData[i].Tmdat != '') {
              const tempTmdat = this.DateUtils.formatDateToYYYYMMDD(aRowData[i].Tmdat);
              if (aRowData[i].Zzcheck == '' || aRowData[i].Persa == '0900') {
                aRowData[i].TmdatTx = tempTmdat.substring(0, 4) + '.' + tempTmdat.substring(4, 6) + '.' + tempTmdat.substring(6, 8);
              } else {
                aRowData[i].TmdatTx = tempTmdat.substring(0, 4) + '.' + tempTmdat.substring(4, 6);
              }
            }
          }

          oViewModel.setProperty('/list', aRowData);

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

      /*
        List Click -> Popup Open ( Read Olny )
      */
      // onSelectRow(oEvent) {
      //   const sPath = oEvent.getParameters().rowBindingContext.getPath();
      //   const mRowData = this.getViewModel().getProperty(sPath);

      //   this.getRouter().navTo(`${this.ROUTE_NAME}-detail`, {
      //     appno: mRowData.Appno,
      //     werks: mRowData.Werks,
      //     orgeh: mRowData.Orgeh,
      //     kostl: mRowData.Kostl,
      //   });
      // },

      // 평일연장
      async onPressAddhr(oEvent) {
        const oViewModel = this.getViewModel();
        const oSource = oEvent.getSource();

        const aReturn = await this.getFormData(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath), 'AD');

        if (aReturn) this._Popover.openBy(oSource);
      },

      // 야간근무
      async onPressNgthr(oEvent) {
        const oViewModel = this.getViewModel();
        const oSource = oEvent.getSource();

        const aReturn = await this.getFormData(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath), 'NH');

        if (aReturn) this._Popover.openBy(oSource);
      },

      // 휴일근무
      async onPressHwkhr(oEvent) {
        const oViewModel = this.getViewModel();
        const oSource = oEvent.getSource();

        const aReturn = await this.getFormData(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath), 'HH');

        if (aReturn) this._Popover.openBy(oSource);
      },

      // 휴일연장
      async onPressHwkexhr(oEvent) {
        const oViewModel = this.getViewModel();
        const oSource = oEvent.getSource();

        const aReturn = await this.getFormData(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath), 'HX');

        if (aReturn) this._Popover.openBy(oSource);
      },

      // 발생시간
      async onPressCrecnt(oEvent) {
        const oViewModel = this.getViewModel();
        const oSource = oEvent.getSource();

        const aReturn = await this.getFormData(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath), 'CR');
        if (aReturn) this._Popover.openBy(oSource);
      },

      async getFormData(rData, rType) {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('FormTable');

        let numbers = await this.replaceAll(rData.TmdatTx, '.', '');
        if (numbers.length == 6) {
          numbers = _.toString(numbers) + '01';
        } else if (numbers.length == 8) {
        } else {
          MessageBox.alert('잘못된 근태 기간값이 입력되어 있습니다.');
          return;
        }

        var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'Subty30BaseEntitlement', {
          Pernr: rData.Pernr,
          Begda: this.DateUtils.parse(numbers),
        });

        aRowData = aRowData.filter((o) => _.toNumber(o.Weight) > 0);

        for (var i = 0; i < aRowData.length; i++) {
          if (aRowData[i].Begda != '') {
            aRowData[i].Begda = moment(aRowData[i].Begda).format('YYYY.MM.DD');
          }
        }

        oViewModel.setProperty('/Formlist', aRowData);
        oViewModel.setProperty('/FormlistInfo/rowCount', aRowData.length);
        return true;
      },

      async onSelectRow(oEvent) {
        const oViewModel = this.getViewModel();
        const aSelectedData = _.cloneDeep(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath));

        // if (!this.FormDialog) {
        //   const oView = this.getView();
        //   this.FormDialog = await Fragment.load({
        //     id: oView.getId(),
        //     name: 'sap.ui.time.mvc.view.flexibleTimeReport.fragment.FormDialog',
        //     controller: this,
        //   });

        //   oView.addDependent(this.FormDialog);
        // }

        oViewModel.setProperty('/dialog/data', aSelectedData);
        oViewModel.setProperty('/dialog/data/Prcty', 'M');

        // this.FormDialog.open();
      },

      async onSearchOType() {
        const oViewModel = this.getViewModel();
        const aOtype = oViewModel.getProperty('/dialog/data/Otype');
        if (aOtype === 'P') {
          //개인
          this.onEmployeeSearchOpenForRef();
        } else if (aOtype === 'O') {
          this.onOrgSearchOpen(oViewModel.getProperty('/dialog/data/Werks'));
          //조직
        }
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
