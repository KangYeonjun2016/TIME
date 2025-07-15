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

    return BaseController.extend('sap.ui.time.mvc.controller.workStandardManagement.Main', {
      initializeModel() {
        return {
          busy: false,
          list1: [],
          list2: [],
          list3: [],
          listInfo1: { rowCount: 1 },
          listInfo2: { rowCount: 1 },
          listInfo3: { rowCount: 1 },
          contentsBusy: {
            button: false,
            search: false,
            table: false,
          },
          PersaList: [],
          searchConditions: {
            Werks: '',
          },
          entry: {
            OtypeList: [
              { Otype: 'O', Otext: '부서' },
              { Otype: 'P', Otext: '직원' },
            ],
            OtypeList2: [
              { Otype: 'C', Otext: '회사' },
              { Otype: 'O', Otext: '부서' },
              { Otype: 'P', Otext: '직원' },
            ],
          },
          selectedICBar: '1',
        };
      },

      /**
       * @override
       */
      onBeforeShow() {
        BaseController.prototype.onBeforeShow.apply(this, arguments);

        this.TableUtils.adjustRowSpan({
          oTable: this.byId('Table1'),
          aColIndices: [8, 9, 10],
          sTheadOrTbody: 'thead',
        });

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
          this.setPersaList();
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

      // async onPressSearch() {
      //   const oViewModel = this.getViewModel();
      //   this.setContentsBusy(true, ['search', 'table']);
      //   const vSelectedICBar = oViewModel.getProperty('/selectedICBar');
      //   if(vSelectedICBar == "1"){
      //     setTimeout(async () => await this.retrieveList1(), 0);
      //   }

      // },

      // async retrieveList1() {
      //   const oViewModel = this.getViewModel();

      //   try {
      //     const oTable = this.byId("Table1");
      //     const vWerks = oViewModel.getProperty('/searchConditions/Werks');

      //     if (!vWerks) return;

      //     oViewModel.setProperty('/list1', []);
      //     oViewModel.refresh(true);
      //     this.TableUtils.clearTablePicker(oTable);

      //     const sAppstateNullText = this.getBundleText('LABEL_00102');
      //     const aRowData = await Client.getEntity(this.getViewModel(ServiceNames.FLEXIBLETIME), 'FlexibleTimeDws', {
      //       Werks: vWerks
      //     });

      //     oViewModel.setProperty('/listInfo1', {
      //       ...oViewModel.getProperty('/listInfo1'),
      //       ...this.TableUtils.count({ oTable, aRowData }),
      //     });

      //     oViewModel.setProperty(
      //       '/list1',
      //       _.map(aRowData, (o) => ({
      //         ...o,
      //         Usgyn: o.Usgyn === 'X' ? true : false
      //       }))
      //     );

      //     setTimeout(() => oTable.setFirstVisibleRow(), 100);
      //     this.TableUtils.clearTable(oTable);
      //     oViewModel.refresh(true);
      //     // this.setDetailsTableStyle();
      //   } catch (oError) {
      //     this.debug('Controller > commuteCheck > retrieveList Error', oError);

      //     AppUtils.handleError(oError);
      //     this.setContentsBusy(false);
      //   } finally {
      //     this.setContentsBusy(false);
      //   }
      // },

      async onPressSearch() {
        const oViewModel = this.getViewModel();
        const vSelectedICBar = oViewModel.getProperty('/selectedICBar');

        this.setContentsBusy(true, ['search', 'table']);

        try {
          const oTable = vSelectedICBar == '1' ? this.byId('Table1') : vSelectedICBar == '2' ? this.byId('Table2') : vSelectedICBar == '3' ? this.byId('Table3') : '';
          const EntityName = vSelectedICBar == '1' ? 'FlexibleTimeDws' : vSelectedICBar == '2' ? 'FlexibleEtcInput' : vSelectedICBar == '3' ? 'SelectTimeBasis' : '';
          const vWerks = oViewModel.getProperty('/searchConditions/Werks');
          const listProperty = vSelectedICBar == '1' ? '/list1' : vSelectedICBar == '2' ? '/list2' : vSelectedICBar == '3' ? '/list3' : '';
          const listInfoProperty = vSelectedICBar == '1' ? '/listInfo1' : vSelectedICBar == '2' ? '/listInfo2' : vSelectedICBar == '3' ? '/listInfo3' : '';

          if (!vWerks) return;

          oViewModel.setProperty(listProperty, []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);

          const sAppstateNullText = this.getBundleText('LABEL_00102');
          var aRowData = [];
          if (vSelectedICBar == '1') {
            aRowData = await Client.getEntity(this.getViewModel(ServiceNames.FLEXIBLETIME), EntityName, {
              Werks: vWerks,
            });
          } else if (vSelectedICBar == '2') {
            aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.FLEXIBLETIME), EntityName, {
              Werks: vWerks,
            });
          } else {
            aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), EntityName, {
              Werks: vWerks,
            });
          }

          oViewModel.setProperty(listInfoProperty, {
            ...oViewModel.getProperty(listInfoProperty),
            ...this.TableUtils.count({ oTable, aRowData }),
          });

          if (vSelectedICBar == '1') {
            oViewModel.setProperty(
              listProperty,
              _.map(aRowData, (o) => ({
                ...o,
                Usgyn: o.Usgyn === 'X' ? true : false,
                SobegT: o.Sobeg.length == 6 ? o.Sobeg.substr(0, 4) : o.Sobeg,
                SoendT: o.Soend.length == 6 ? o.Soend.substr(0, 4) : o.Soend,
              }))
            );
          } else {
            oViewModel.setProperty(
              listProperty,
              _.map(aRowData, (o) => ({
                ...o,
                // Usgyn: o.Usgyn === 'X' ? true : false
              }))
            );
          }

          setTimeout(() => oTable.setFirstVisibleRow(), 100);
          this.TableUtils.clearTable(oTable);
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
        const aTableList = _.cloneDeep(this.getViewModel().getProperty('/list1'));

        try {
          var vFlexibleTimeDwsDetailSet = aTableList.map((item) => ({
            Werks: this.getViewModel().getProperty('/searchConditions/Werks'),
            Tprog: item.Tprog,
            Usgyn: item.Usgyn == true ? 'X' : '',
          }));

          const mResult = Client.deepNoSet(this.getViewModel(ServiceNames.FLEXIBLETIME), 'FlexibleTimeDws', {
            Werks: this.getViewModel().getProperty('/searchConditions/Werks'),
            FlexibleTimeDwsDetailSet: vFlexibleTimeDwsDetailSet,
          });

          // {저장}되었습니다.
          MessageBox.success(this.getBundleText('MSG_00007', this.getBundleText('LABEL_00103')), {
            onClose: () => this.onPressSearch(),
          });
        } catch (oError) {
          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'all');
        }
      },

      onPressEtModify(oEvent) {
        const oViewModel = this.getViewModel();

        oEvent.getSource().getParent().getBindingContext().sPath;
      },

      onPressEtcDelete(oEvent) {
        const oViewModel = this.getViewModel();

        oEvent.getSource().getParent().getBindingContext().sPath;
      },
      /* 대상자 조직의 인원 조회 */
      getTargetEmpList() {
        const oViewModel = this.getViewModel();
        var vTargetList = oViewModel.getProperty('/targetList'),
          vPromise = [];

        for (var i = 0; i < vTargetList.length; i++) {
          vPromise.push(
            Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartEmpList', {
              Vwtyp: '30',
              Subty: '3010',
              Orgeh: vTargetList[i].orgeh,
              Dchif: 'X',
            })
          );

          vPromise.push(
            Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartEmpList', {
              Vwtyp: '30',
              Subty: '3010',
              Orgeh: vTargetList[i].orgeh,
            })
          );
        }

        return Promise.all(vPromise);
      },

      /* 선택된 조직-조직원의 근태 조회 */
      getWorkList() {
        const oViewModel = this.getViewModel();
        var vTargetList = oViewModel.getProperty('/targetList'),
          vPromise = [];

        for (var i = 0; i < vTargetList.length; i++) {
          if (vTargetList[i].targetVisble == true && vTargetList[i].selected == true) {
            vPromise.push(
              Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTeamCalendar', {
                Tmdat: oViewModel.getProperty('/startDate'),
                Orgeh: vTargetList[i].Orgeh,
                Werks: this.getAppointeeProperty('Werks'),
                Orgeh: vTargetList[i].orgeh,
              })
            );
          }
        }

        return Promise.all(vPromise);
      },

      async handleIconTabBarSelect() {
        this.onPressSearch();
      },

      /*
        선택적시간제 적용대상 신규 생성
      */
      async onPressEtcNew() {
        if (!this.EtcFormDialog) {
          const oView = this.getView();
          this.EtcFormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.workStandardManagement.fragment.EtcFormDialog',
            controller: this,
          });

          // this.ApplyFormDialog.attachBeforeOpen(async () => {
          //   const aEmployees = oViewModel.getProperty('/approval/Employees');

          //   if (aEmployees.length < 1) this.readEmployees();
          //   await this.retrieveApplyList();
          // }).attachAfterOpen(() => this.setDetailsTableStyle());

          oView.addDependent(this.EtcFormDialog);
        }

        this.EtcFormDialog.open();
      },

      async onPressEtcFormDialogClose() {
        const oViewModel = this.getViewModel();
        // oViewModel.setProperty('/form/dialog/data/Beguz', '');
        // oViewModel.setProperty('/form/dialog/data/Enduz', '');
        // oViewModel.setProperty('/form/dialog/data/Pbeg1', '');
        // oViewModel.setProperty('/form/dialog/data/Pend1', '');
        // oViewModel.setProperty('/form/dialog/data/Pbeg2', '');
        // oViewModel.setProperty('/form/dialog/data/Pend2', '');
        // oViewModel.setProperty('/form/dialog/data/Dtrsn', '');

        // // 닫기 버튼 클릭 시 달력 조회
        // await this.retrieveMyCoreTimeCalendar();
        // this.retrieveMyMonthlyStatus('X'); // 법정근무시간 등
        // this.MonthPlanBoxHandler.makeCalendarControl(oViewModel.getProperty('/year'), oViewModel.getProperty('/month'));

        this.EtcFormDialog.close();
      },

      onPressExcelDownload() {
        const oWorkICBar = this.byId('WorkICBar');
        let oTable, sFileName;

        if (oWorkICBar.getSelectedKey() == '1') {
          oTable = this.byId('Table1');
          sFileName = '시차출퇴근제 허용근무일정';
        } else if (oWorkICBar.getSelectedKey() == '2') {
          oTable = this.byId('Table2');
          sFileName = '선택적시간제 적용대상';
        } else if (oWorkICBar.getSelectedKey() == '3') {
          oTable = this.byId('Table3');
          sFileName = '선택적시간제 기준설정';
        }

        this.TableUtils.export({ oTable, sFileName });
      },
    });
  }
);
