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

    return BaseController.extend('sap.ui.time.mvc.controller.timeAttendance.Main', {
      initializeModel() {
        return {
          Auth: this.currentAuth(),
          busy: false,
          list: [],
          listInfo: { rowCount: 1 },
          contentsBusy: {
            button: false,
            search: false,
            table: false,
          },
          PersaList: [],
          SchkzList: [],
          SearchType: [
            { code: 'A', text: '기간' },
            { code: 'B', text: '최신' },
          ],
          searchConditions: {
            Werks: '',
            Orgeh: '',
            Orgtx: '',
            Ename: '',
            Pernr: '',
            Werks: '',
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

        // this.handleSelectToday();
        // this.getTargetOrgList();
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
          oViewModel.setProperty('/searchConditions/Dispck', 'A');
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
          // await this.setSchkzList();
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

      async setSchkzList() {
        const oViewModel = this.getViewModel();
        var vSchkz = [];
        oViewModel.setProperty('/SchkzList', vSchkz);
        const rYyyymm = oViewModel.getProperty('/dialog/data/Yyyymm');
        const rPernr = oViewModel.getProperty('/dialog/data/Pernr');

        if (rYyyymm && rYyyymm != '' && rPernr && rPernr != '') {
          try {
            oViewModel.setProperty('/busy', true);
            const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'SchkzList', {
              Pernr: this.getAppointeeProperty('Pernr'),
              Persa: oViewModel.getProperty('/searchConditions/Werks'),
              Yyyymm: rYyyymm,
            });

            for (var i = 0; i < aRowData.length; i++) {
              vSchkz.push({
                Schkz: aRowData[i].Schkz,
                Schkztx: await this.setSchkztx(aRowData[i]),
              });
            }

            // Default 근무일정 설정
            if (aRowData.length > 0) {
              oViewModel.setProperty('/dialog/data/Schkz', aRowData[0].Schkz);
            }

            oViewModel.setProperty('/SchkzList', vSchkz);
          } catch (oError) {
            throw oError;
          }
        }
      },

      async setSchkztx(aData) {
        if (!aData.Schkztx || aData.Schkztx == '') return '';

        let vSchkztx = aData.Schkztx + ' ( 휴게: ' + aData.Pamodtx1;
        if (aData.Pamodtx2 != '') vSchkztx += ', ' + aData.Pamodtx2;
        if (aData.Pamodtx3 != '') vSchkztx += ', ' + aData.Pamodtx3;
        vSchkztx += ' )';

        return vSchkztx;
      },

      async onChangeYyyymm() {
        const oViewModel = this.getViewModel();
        // 근무일정 초기화
        oViewModel.setProperty('/dialog/data/Schkz', '');
        this.setSchkzList();
      },

      async onPressSearch() {
        const oViewModel = this.getViewModel();
        this.setContentsBusy(true, ['search', 'table']);

        try {
          const oTable = this.byId('Table');
          const vWerks = oViewModel.getProperty('/searchConditions/Werks');

          if (!vWerks) return;

          oViewModel.setProperty('/list', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);

          const sAppstateNullText = this.getBundleText('LABEL_00102');
          const vBegda = oViewModel.getProperty('/searchConditions/Begda');
          const vEndda = oViewModel.getProperty('/searchConditions/Endda');

          var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'Schkzapply', {
            Werks: vWerks,
            Austy: oViewModel.getProperty('/Auth'),
            Orgeh: oViewModel.getProperty('/searchConditions/Orgeh'),
            Pernr: oViewModel.getProperty('/searchConditions/Pernr'),
            Begda: this.DateUtils.parse(vBegda),
            Endda: this.DateUtils.parse(vEndda),
            Dispck: oViewModel.getProperty('/searchConditions/Dispck'),
          });

          oViewModel.setProperty('/listInfo', {
            ...oViewModel.getProperty('/listInfo'),
            ...this.TableUtils.count({ oTable, aRowData }),
          });

          for (var i = 0; i < aRowData.length; i++) {
            if (aRowData[i].Zzcheck === 'X') aRowData[i].Zzchecktx = '선택적근로시간제도';
            else aRowData[i].Zzchecktx = '시차출퇴근제도';

            if (aRowData[i].Zzcheck2 === 'X') aRowData[i].Zzchecktx2 = '선택적근로시간제도';
            else aRowData[i].Zzchecktx2 = '시차출퇴근제도';

            aRowData[i].Schkztx = await this.setSchkztx(aRowData[i]);

            aRowData[i].Selected = false;
          }

          oViewModel.setProperty('/list', aRowData);

          // oViewModel.setProperty(
          //   '/list',
          //   _.map(aRowData, (o) => ({
          //     ...o,
          //     OtypeText: o.Otype === 'O' ? '조직' : o.Otype === 'P' ? '개인' : _.toNumber(o.Objid) === 0 && o.Otype === '' ? '회사' : '',
          //     Begda: moment(o.Begda).format('YYYY.MM.DD'),
          //     Endda: moment(o.Endda).format('YYYY.MM.DD'),
          //     Otype: o.Otype === '' ? 'C' : o.Otype,
          //     Stval1: o.Stval3 === '' ? o.Stval1 : '',
          //     Stval2: o.Stval3 === '' ? o.Stval2 : '',
          //     // Usgyn: o.Usgyn === 'X' ? true : false
          //   }))
          // );

          // oViewModel.setProperty('/searchConditions/SearchWerks', vWerks);

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

      onPressExcelDownload() {},

      getCurrentLocationText() {
        return '근태제도변경';
      },

      getBreadcrumbsLinks() {
        return [{ name: this.getBundleText('LABEL_01001') }]; // My Time
      },

      async onPressSave() {
        const oViewModel = this.getViewModel();
        var vData = _.cloneDeep(oViewModel.getProperty('/dialog/data'));
        if (!vData.Yyyymm || vData.Yyyymm == '') {
          MessageBox.alert('적용년월을 입력하여 주시기 바랍니다.');
          return;
        }

        if (!vData.Gubun) {
          MessageBox.alert('근무제도를 선택하여 주시기 바랍니다.');
          return;
        }

        if (!vData.Schkz) {
          MessageBox.alert('근무일정을 선택하여 주시기 바랍니다.');
          return;
        }

        if (!vData.Pernr) {
          MessageBox.alert('대상자를 입력하여 주시기 바랍니다.');
          return;
        }

        if (!vData.Dtrsn) {
          MessageBox.alert('사유를 입력하여 주시기 바랍니다.');
          return;
        }
        this.setContentsBusy(true);

        if (oViewModel.getProperty('/Auth') != 'H') {
          const curDate = new Date();
          const nextDate = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1);
          const nextYyyymm = _.toNumber(nextDate.getFullYear() + String(nextDate.getMonth() + 1).padStart(2, '0'));

          if (nextYyyymm > _.toNumber(vData.Yyyymm)) {
            MessageBox.alert('적용년월은 익월부터 입력이 가능합니다.');
            return;
          }
        }

        // {신청}하시겠습니까?
        MessageBox.confirm(this.getBundleText('MSG_00006', 'LABEL_00121'), {
          actions: [this.getBundleText('LABEL_00121'), MessageBox.Action.CANCEL],
          onClose: async (sAction) => {
            if (!sAction || sAction === MessageBox.Action.CANCEL) {
              this.setContentsBusy(false);
              return;
            }

            try {
              this.setContentsBusy(true);

              await this.createProcess();
            } catch (oError) {
              this.debug('Controller > overtime Detail > onPressApproval Error', oError);

              AppUtils.handleError(oError);
            } finally {
              this.setContentsBusy(false);
            }
          },
        });
      },

      async createProcess() {
        const oViewModel = this.getViewModel();
        try {
          var vData = _.cloneDeep(oViewModel.getProperty('/dialog/data'));
          vData.Zzcheck = vData.Gubun === 1 ? 'X' : '';
          const mResult = await Client.create(this.getViewModel(ServiceNames.MYTIME), 'Schkzapply', vData);

          if (mResult && mResult != '') {
            // 결재선 저장
            await this.approvalSave(mResult.Appno);
            // {신청}되었습니다.
            MessageBox.success(this.getBundleText('MSG_00007', this.getBundleText('LABEL_00121')), {
              onClose: () => {
                this.FormDialog.close();
                this.onPressSearch();
              },
            });
          } else {
            MessageBox.alert('저장 처리가 실패하였습니다');
            return;
          }
        } catch (oError) {
          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'all');
        }
      },

      /*
        신규 생성
      */
      async onPressNew() {
        const oViewModel = this.getViewModel();
        this.ClearFormData();

        if (!this.FormDialog) {
          const oView = this.getView();
          this.FormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeAttendance.fragment.FormDialog',
            controller: this,
          });

          oView.addDependent(this.FormDialog);
        }

        const curDate = new Date();
        const nextDate = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1);
        const nextYyyymm = '' + nextDate.getFullYear() + String(nextDate.getMonth() + 1).padStart(2, '0');

        oViewModel.setProperty('/dialog/data/Yyyymm', nextYyyymm);
        oViewModel.setProperty('/dialog/data/Werks', oViewModel.getProperty('/Auth') == 'E' ? this.getAppointeeProperty('Persa') : '');
        oViewModel.setProperty('/dialog/data/Orgeh', oViewModel.getProperty('/Auth') == 'E' ? this.getAppointeeProperty('Orgeh') : '');
        oViewModel.setProperty('/dialog/data/Prcty', 'S');
        oViewModel.setProperty('/dialog/data/Appno', '');
        oViewModel.setProperty('/dialog/data/Ename', oViewModel.getProperty('/Auth') == 'E' ? this.getAppointeeProperty('Ename') : '');
        oViewModel.setProperty('/dialog/data/Pernr', oViewModel.getProperty('/Auth') == 'E' ? this.getAppointeeProperty('Pernr') : '');
        oViewModel.setProperty('/dialog/data/Austy', oViewModel.getProperty('/Auth'));

        await this.setSchkzList();
        if (oViewModel.getProperty('/Auth') != 'H') {
          await this.retrieveApplyList();
        }
        this.FormDialog.open();
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

      async onSelectRow(oEvent) {
        const oViewModel = this.getViewModel();
        const aSelectedData = _.cloneDeep(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath));
        this.ClearFormData();

        if (!this.FormDialog) {
          const oView = this.getView();
          this.FormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeAttendance.fragment.FormDialog',
            controller: this,
          });

          oView.addDependent(this.FormDialog);
        }

        oViewModel.setProperty('/dialog/data', aSelectedData);
        oViewModel.setProperty('/dialog/data/Prcty', 'M');

        this.FormDialog.open();
      },

      /*
       결재 리스트 조회
      */
      async retrieveApplyList() {
        const oViewModel = this.getViewModel();

        try {
          var aResults = [];
          if (oViewModel.getProperty('/dialog/data/Pernr') && oViewModel.getProperty('/dialog/data/Pernr') != '') {
            aResults = await Client.getEntitySet(this.getModel(ServiceNames.APPROVAL), 'ApproverList', {
              Pernr: oViewModel.getProperty('/dialog/data/Pernr'),
              Appty: 'TS',
              Appno: oViewModel.getProperty('/dialog/data/Appno'),
            });
          }

          oViewModel.setProperty('/approval/list', aResults);
          oViewModel.setProperty('/approval/rowCount', Math.min(aResults.length, 5));

          this.setDetailsTableStyle();
        } catch (oError) {
          this.debug('Controller > TimeRegistration > getAbsenceDataInfo Error', oError);

          AppUtils.handleError(oError);
          return 'Error';
        }
        return '';
      },

      setDetailsTableStyle() {
        setTimeout(() => {
          const oTable = this.byId('approvalStatusTable');
          const sDomTableId = oTable.getId();

          oTable.getRows().forEach((row, i) => {
            const mRowData = row.getBindingContext().getObject();

            if (mRowData.Linty === '40') {
              $(`#${sDomTableId}-rowsel${i}`).removeClass('disabled-table-selection');
            } else {
              $(`#${sDomTableId}-rowsel${i}`).addClass('disabled-table-selection');
            }
          });
        }, 100);
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

          if (oViewModel.getProperty('/Auth') == 'H') {
            await Client.create(oModel, 'ApprovalProcess', {
              Appno: sAppno,
              Appst: '30',
              Appty: 'TS',
              Austy: 'H',
            });
          } else {
            const sUri = 'http://hrwdp.doosan.com/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fDoosanGHRIS!2fiViews!2fTA!2fFP_Approvalbox?sap-config-mode=true%26gAppty=TS';

            await Client.getEntitySet(oModel, 'SendApprovalMail', {
              Appno: sAppno,
              Appst: '20',
              Uri: sUri,
            });
          }
        } catch (oError) {
          throw oError;
        }
      },

      async ClearFormData() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/dialog/data/Ename', '');
        oViewModel.setProperty('/dialog/data/Pernr', '');
        oViewModel.setProperty('/dialog/data/Schkz', '');
        oViewModel.setProperty('/dialog/data/Gubun', null);
        oViewModel.setProperty('/dialog/data/Prcty', '');
        oViewModel.setProperty('/dialog/data/Yyyymm', '');
        oViewModel.setProperty('/dialog/data/Dtrsn', '');
      },

      async onPressFormDialogClose() {
        const oViewModel = this.getViewModel();

        this.FormDialog.close();
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
        if (!Pernr) return false;

        const oViewModel = this.getViewModel();

        oViewModel.setProperty('/dialog/data/Objid', Pernr);
        oViewModel.setProperty('/dialog/data/Otext', Ename);
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

      onTargetUserChange() {
        this.onEmployeeSearchOpen();
      },

      async callbackAppointeeChange({ Pernr, Ename, Werks, Pbtxt, Orgtx, Orgeh }) {
        if (!Pernr) return false;
        const oViewModel = this.getViewModel();

        if (this.FormDialog && this.FormDialog.open()) {
          oViewModel.setProperty('/dialog/data/Pernr', Pernr);
          oViewModel.setProperty('/dialog/data/Ename', Ename);
          oViewModel.setProperty('/dialog/data/Werks', Werks);
          oViewModel.setProperty('/dialog/data/Orgeh', Orgeh);
          await this.retrieveApplyList();
          await this.setSchkzList();
        } else {
          oViewModel.setProperty('/searchConditions/Pernr', Pernr);
          oViewModel.setProperty('/searchConditions/Ename', Ename);
          oViewModel.setProperty('/searchConditions/Werks', Werks);
          oViewModel.setProperty('/searchConditions/Orgeh', Orgeh);
          await this.onPressSearch();
        }

        oViewModel.refresh(true);
      },

      onCheckBoxSelect(oEvent) {
        const oViewModel = this.getViewModel();
        const selectedIdxArrays = oEvent.getSource().getParent().getBindingContext().sPath.split('/');
        const selectedIdx = selectedIdxArrays[selectedIdxArrays.length - 1];

        for (let i = 0; i < oViewModel.getProperty('/list').length; i++) {
          if (i != selectedIdx) oViewModel.setProperty('/list/' + i + '/Selected', false);
        }
      },

      onPressManual() {
        const mUrl = 'https://mytime.doosan.com/sap/bc/ui5_ui5/sap/ZHRXX_TMAPP/manual/Manual_Sub_01.pdf';
        window.open(mUrl, '_blank');
      },

      onPressExcelDownload() {
        let oTable = this.byId('Table');
        let sFileName = '근태제도변경';

        this.TableUtils.export({ oTable, sFileName });
      },

      onPressDelete() {
        const oViewModel = this.getViewModel();
        var selectedData = {};
        var selectedCount = 0;

        for (let i = 0; i < oViewModel.getProperty('/list').length; i++) {
          if (oViewModel.getProperty('/list')[i].Selected == true) {
            if (selectedCount != 0) {
              MessageBox.alert('단일 건만 취소가 가능합니다.');
              return;
            }
            selectedData = _.cloneDeep(oViewModel.getProperty('/list')[i]);
            selectedCount++;
          }
        }

        if (selectedCount == 0) {
          MessageBox.alert('취소할 데이터를 선택하시기 바랍니다.');
          return;
        }

        MessageBox.confirm(this.getBundleText('선택한 데이터를 취소하시겠습니까?', 'LABEL_00121'), {
          actions: ['예', '아니오'],
          onClose: async (sAction) => {
            if (!sAction || sAction === '아니오') {
              this.setContentsBusy(false);
              return;
            }

            try {
              selectedData.Prcty = 'B';

              const mResult = await Client.create(this.getViewModel(ServiceNames.MYTIME), 'Schkzapply', selectedData);

              if (mResult && mResult != '') {
                // {신청}되었습니다.
                MessageBox.success(this.getBundleText('취소가 완료되었습니다.', this.getBundleText('LABEL_00121')), {
                  onClose: () => {
                    this.onPressSearch();
                  },
                });
              } else {
                MessageBox.alert('취소 처리가 실패하였습니다');
                return;
              }
            } catch (oError) {
              AppUtils.handleError(oError);
            } finally {
              this.setContentsBusy(false, 'all');
            }
          },
        });
      },
    });
  }
);
