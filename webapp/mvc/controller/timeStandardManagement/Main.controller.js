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

    return BaseController.extend('sap.ui.time.mvc.controller.timeStandardManagement.Main', {
      initializeModel() {
        return {
          busy: false,
          list: [],
          listInfo: { rowCount: 1 },
          contentsBusy: {
            button: false,
            search: false,
            table: false,
          },
          PersaList: [],
          searchConditions: {
            Werks: '',
            SearchWerks: '',
          },
          dialog: {
            data: {
              Stval1: '',
              Stval2: '',
              Stval3: '',
              Objid: '',
              Stitm: '',
              Begda: '',
              Endda: '',
            },
            StitmTypeList: [],
            OtypeList: [
              { Otype: 'C', Otext: '회사' },
              { Otype: 'O', Otext: '부서' },
              { Otype: 'P', Otext: '직원' },
            ],
            StynList: [
              { Code: 'Y', Text: 'Y' },
              { Code: 'N', Text: 'N' },
            ],
            newButtonAct: false,
            minutesStep: 10,
            initBeguz: moment('0900', 'hhmm').toDate(),
            initEnduz: moment('1800', 'hhmm').toDate(),
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
          await Promise.all([this.setPersaList(), this.setStitmTypeList()]);
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

      async setStitmTypeList() {
        const oViewModel = this.getViewModel();
        var vWerks = [];
        try {
          oViewModel.setProperty('/busy', true);
          const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'StitmTypeList', {});

          for (var i = 0; i < aRowData.length; i++) {
            vWerks.push({
              code: aRowData[i].Persa,
              text: aRowData[i].Pbtxt,
            });
          }

          oViewModel.setProperty('/dialog/StitmTypeList', aRowData);
        } catch (oError) {
          throw oError;
        }
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
          var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'SelectTimeBasis', {
            Werks: vWerks,
          });

          oViewModel.setProperty('/listInfo', {
            ...oViewModel.getProperty('/listInfo'),
            ...this.TableUtils.count({ oTable, aRowData }),
          });

          oViewModel.setProperty(
            '/list',
            _.map(aRowData, (o) => ({
              ...o,
              OtypeText: o.Otype === 'O' ? '조직' : o.Otype === 'P' ? '개인' : _.toNumber(o.Objid) === 0 && o.Otype === '' ? '회사' : '',
              Begda: moment(o.Begda).format('YYYY.MM.DD'),
              Endda: moment(o.Endda).format('YYYY.MM.DD'),
              Otype: o.Otype === '' ? 'C' : o.Otype,
              Stval1: o.Stval3 === '' ? o.Stval1 : '',
              Stval2: o.Stval3 === '' ? o.Stval2 : '',
              // Usgyn: o.Usgyn === 'X' ? true : false
            }))
          );

          oViewModel.setProperty('/searchConditions/SearchWerks', vWerks);

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
        return '선택적 근무제도 기준관리';
      },

      onPressSave() {
        this.setContentsBusy(true);

        // {저장}하시겠습니까?
        MessageBox.confirm(this.getBundleText('MSG_00006', 'LABEL_00103'), {
          actions: [this.getBundleText('LABEL_00103'), MessageBox.Action.CANCEL],
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
          vData.Begda = this.DateUtils.parse(vData.Begda);
          vData.Endda = this.DateUtils.parse(vData.Endda);
          vData.Otype = vData.Otype === 'C' ? '' : vData.Otype;

          if (vData.Stval1 == null || vData.Stval1 == '') delete vData.Stval1;
          if (vData.Stval2 == null || vData.Stval2 == '') delete vData.Stval2;

          const mResult = await Client.create(this.getViewModel(ServiceNames.MYTIME), 'SelectTimeBasis', vData);

          if (mResult && mResult != '') {
            // {저장}되었습니다.
            MessageBox.success(this.getBundleText('MSG_00007', this.getBundleText('LABEL_00103')), {
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

      async onPressModify(oEvent) {
        const oViewModel = this.getViewModel();
        const aSelectedData = _.cloneDeep(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath));
        this.ClearFormData();

        if (!this.FormDialog) {
          const oView = this.getView();
          this.FormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeStandardManagement.fragment.FormDialog',
            controller: this,
          });

          oView.addDependent(this.FormDialog);
        }

        oViewModel.setProperty('/dialog/newButtonAct', false);
        oViewModel.setProperty('/dialog/data', aSelectedData);
        oViewModel.setProperty('/dialog/data/Prcty', 'M');
        // if (aSelectedData.Stval1 != '') oViewModel.setProperty('/dialog/data/Stval1', this.TimeUtils.toEdm(aSelectedData.Stval1));
        // if (aSelectedData.Stval2 != '') oViewModel.setProperty('/dialog/data/Stval2', this.TimeUtils.toEdm(aSelectedData.Stval2));

        this.FormDialog.open();
      },

      onPressDelete(oEvent) {
        const oViewModel = this.getViewModel();
        const aSelectedData = _.cloneDeep(oViewModel.getProperty(oEvent.getSource().getParent().getBindingContext().sPath));
        try {
          // 선택된 신청 건을 삭제하겠습니까 ?
          MessageBox.confirm(this.getBundleText('MSG_00021'), {
            onClose: async function (sAction) {
              if (MessageBox.Action.CANCEL === sAction) return;

              this.setContentsBusy(true);

              try {
                await this.deleteAddWorkingProcess(aSelectedData);
              } catch (oError) {
                this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

                AppUtils.handleError(oError);
              } finally {
                this.setContentsBusy(false);
              }
            }.bind(this),
          });
        } catch (oError) {
          this.debug('Controller > shiftChange Detail > onPressApprove Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'all');
        }
      },

      async deleteAddWorkingProcess(vData) {
        const oViewModel = this.getViewModel();

        try {
          const oModel = this.getModel(ServiceNames.MYTIME);

          await Client.remove(oModel, 'SelectTimeBasis', {
            Werks: vData.Werks,
            Otype: vData.Otype,
            Objid: vData.Objid,
            Stitm: vData.Stitm,
            Begda: this.DateUtils.parse(vData.Begda),
          });

          MessageBox.success(this.getBundleText('삭제되었습니다.'));
          this.onPressSearch();
        } catch (oError) {
          this.debug('Controller > shiftChange Detail > deleteProcess Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async ClearFormData() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/dialog/newButtonAct', false);
        oViewModel.setProperty('/dialog/data/Werks', '');
        oViewModel.setProperty('/dialog/data/Stitm', '');
        oViewModel.setProperty('/dialog/data/Prcty', '');
        oViewModel.setProperty('/dialog/data/Otype', '');
        oViewModel.setProperty('/dialog/data/Objid', '');
        oViewModel.setProperty('/dialog/data/Otext', '');
        oViewModel.setProperty('/dialog/data/Begda', '');
        oViewModel.setProperty('/dialog/data/Endda', '');
        oViewModel.setProperty('/dialog/data/Stval1', '');
        oViewModel.setProperty('/dialog/data/Stval2', '');
        oViewModel.setProperty('/dialog/data/Stval3', '');
        oViewModel.setProperty('/dialog/data/Styn', '');
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
            name: 'sap.ui.time.mvc.view.timeStandardManagement.fragment.FormDialog',
            controller: this,
          });

          oView.addDependent(this.FormDialog);
        }

        oViewModel.setProperty('/dialog/newButtonAct', true);
        oViewModel.setProperty('/dialog/data/Werks', oViewModel.getProperty('/searchConditions/SearchWerks'));
        oViewModel.setProperty('/dialog/data/Prcty', 'C');
        this.FormDialog.open();
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
            Persa: oViewModel.getProperty('/searchConditions/SearchWerks'),
          },
        };
      },

      callbackForRef({ Pernr, Ename }) {
        if (!Pernr) return false;

        const oViewModel = this.getViewModel();

        oViewModel.setProperty('/dialog/data/Objid', Pernr);
        oViewModel.setProperty('/dialog/data/Otext', Ename);
      },

      callbackOrg(mReturnData) {
        const oViewModel = this.getViewModel();

        if (mReturnData && mReturnData.length > 0) {
          oViewModel.setProperty('/dialog/data/Objid', mReturnData[0].Orgeh);
          oViewModel.setProperty('/dialog/data/Otext', mReturnData[0].Stext);
        }
      },

      onPressExcelDownload() {
        let oTable, sFileName;
        oTable = this.byId('Table');
        sFileName = '선택적시간제 기준설정';

        this.TableUtils.export({ oTable, sFileName });
      },
    });
  }
);
