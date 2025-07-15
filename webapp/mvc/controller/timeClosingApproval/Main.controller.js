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

    return BaseController.extend('sap.ui.time.mvc.controller.timeClosingApproval.Main', {
      initializeModel() {
        return {
          busy: false,
          Appno: '',
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
            Yyyymm: moment(new Date()).format('YYYYMM'),
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
          },
          Pernr: this.getAppointeeProperty('Pernr'),
          Auth: this.currentAuth(),
          selectedICBar: '1',
          InitClosingTime: moment('0800', 'hhmm').toDate(),
          ClosingMinutesStep: 30,
          Approval: {
            Pernr: '',
            Werks: '',
            Appno: '',
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
          aColIndices: [0, 1, 2, 3, 4, 7, 10, 11, 12, 13, 14, 15],
          sTheadOrTbody: 'thead',
        });

        // const oCloseObjectPageLayout = this.byId('CloseObjectPageLayout');
        // oCloseObjectPageLayout.addEventDelegate({
        //   onAfterRendering() {
        //     $('#CloseObjectPageLayout').scroll(function (oEvent) {
        //       console.log('on content scroll');
        //     });
        //   },
        // });
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
          await this.setRatnansTypeList();
          const aApprovalParam = AppUtils.getAppComponent().getAppModel().getData();

          // aApprovalParam.Pernr = '02606389';
          // aApprovalParam.Werks = '7700';
          // aApprovalParam.Option = '03075892|202411';

          oViewModel.setProperty('/Approval/Pernr', aApprovalParam.Pernr);
          oViewModel.setProperty('/Approval/Werks', aApprovalParam.Werks);
          oViewModel.setProperty('/Approval/Appno', aApprovalParam.Appno);
          oViewModel.setProperty('/Approval/Orgeh', aApprovalParam.Option.split('|')[0]);
          oViewModel.setProperty('/Approval/Zyyyymm', aApprovalParam.Option.split('|')[1]);
          await this.onPressSearch();
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async onPressSearch(oEvent) {
        const oViewModel = this.getViewModel();
        this.setContentsBusy(true, ['search', 'table']);

        try {
          oViewModel.setProperty('/entry/MytimeMonthlyOrgeh', []);
          oViewModel.refresh(true);

          const aApprovalParam = oViewModel.getProperty('/Approval');
          const aMytimeMonthlyOrgeh = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MytimeMonthlyOrgeh', {
            Werks: aApprovalParam.Werks,
            // Orgeh: aApprovalParam.Orgeh,
            Yyyymm: aApprovalParam.Zyyyymm,
            Austy: this.currentAuth(),
            Pernr: aApprovalParam.Pernr,
            // Pernr: '02606389',
          });

          // oViewModel.setProperty('/entry/MytimeMonthlyOrgeh', aRowData);
          // oViewModel.setProperty('/entry/MytimeMonthlyPersonRowCount', 0);
          // oViewModel.setProperty('/entry/MytimeMonthlyPerson', []);
          // oViewModel.refresh(true);

          if (aMytimeMonthlyOrgeh.length > 0) {
            for (var i = 0; i < aMytimeMonthlyOrgeh.length; i++) {
              if (aMytimeMonthlyOrgeh[i].Pernr === aApprovalParam.Pernr) {
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
          this.debug('Controller > commuteCheck > retrieveList Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
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

      async onSearchDetail() {
        try {
          const oViewModel = this.getViewModel();
          const vSelectedMaster = oViewModel.getProperty('/entry/MytimeHeader');
          const oTable = this.byId('MainTable');
          oViewModel.setProperty('/entry/MytimeMonthlyPerson', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTable);
          var aRowData = [];

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
          }

          oViewModel.setProperty('/entry/MytimeMonthlyPerson', aRowData);
          oViewModel.setProperty('/entry/MytimeMonthlyPersonRowCount', this.TableUtils.count({ oTable, aRowData }).rowCount);

          await this.retrieveMyMonthlyStatus(); // 필요, 계획, 실적 시간 조회

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
            Calyn: 'X',
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
            MyMonthlyStatus.ResultmhT = MyMonthlyStatus.Resultmh + ' H';
            // 연장근무 시간
            MyMonthlyStatus.AddhrA = _.toNumber(aResults[0].AddhrA);
            MyMonthlyStatus.AddhrAT = MyMonthlyStatus.AddhrA + ' H';
            // 야간근무 시간
            MyMonthlyStatus.NgthrA = _.toNumber(aResults[0].NgthrA);
            MyMonthlyStatus.NgthrAT = MyMonthlyStatus.NgthrA + ' H';
            // 기본근무 시간
            MyMonthlyStatus.HwkhrA = _.toNumber(aResults[0].HwkhrA);
            MyMonthlyStatus.HwkhrAT = MyMonthlyStatus.HwkhrA + ' H';

            MyMonthlyStatus.Reducttmh = (MyMonthlyStatus.Monmh - MyMonthlyStatus.Resultmh).toFixed(2);
            MyMonthlyStatus.ReducttmhT = MyMonthlyStatus.Reducttmh + ' H';
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

        var aSelectedData = [];
        const MytimeMonthlyPerson = oViewModel.getProperty('/entry/MytimeMonthlyPerson');
        for (var i = 0; i < MytimeMonthlyPerson.length; i++) {
          const aMytimeMonthlyPerson = _.cloneDeep(MytimeMonthlyPerson[i]);
          // 상세 사유
          // if ((aMytimeMonthlyPerson.Confirmyn === '' || aMytimeMonthlyPerson.Confirmyn === 'C') && aMytimeMonthlyPerson.Idledtrsn != null) {
          //   aMytimeMonthlyPerson.Ratnrsn = aMytimeMonthlyPerson.Idledtrsn;
          // }
          // // 사유
          // if ((aMytimeMonthlyPerson.Confirmyn === '' || aMytimeMonthlyPerson.Confirmyn === 'C') && aMytimeMonthlyPerson.Idlersncd != null) {
          //   aMytimeMonthlyPerson.Ratnans = aMytimeMonthlyPerson.Idlersncd;
          // }

          if ((aMytimeMonthlyPerson.Confirmyn === '' || aMytimeMonthlyPerson.Confirmyn === 'C') && aMytimeMonthlyPerson.Result != null) {
            aMytimeMonthlyPerson.Resulthrs = this.TimeUtils.toString(aMytimeMonthlyPerson.Result, 'HHmm').substring(0, 2);
            aMytimeMonthlyPerson.Resultmin = this.TimeUtils.toString(aMytimeMonthlyPerson.Result, 'HHmm').substring(2, 4);
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
        }
      },

      async onPressComplete() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');
        const aSelectedIndices = oTable.getSelectedIndices();
        const aTableData = oViewModel.getProperty('/entry/MytimeMonthlyPerson');

        if (aSelectedIndices.length < 1) {
          MessageBox.alert(this.getBundleText('MSG_00020', '확정')); // {확정}할 행을 선택하세요.
          return;
        }

        var aSelectedData = [];
        for (var i = 0; i < aSelectedIndices.length; i++) {
          const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[aSelectedIndices[i]]);

          // // 상세 사유
          // if ((aMytimeMonthlyPerson.Confirmyn === '' || aMytimeMonthlyPerson.Confirmyn === 'C') && aMytimeMonthlyPerson.Idledtrsn != null) {
          //   aMytimeMonthlyPerson.Ratnrsn = aMytimeMonthlyPerson.Idledtrsn;
          // }
          // // 사유
          // if ((aMytimeMonthlyPerson.Confirmyn === '' || aMytimeMonthlyPerson.Confirmyn === 'C') && aMytimeMonthlyPerson.Idlersncd != null) {
          //   aMytimeMonthlyPerson.Ratnans = aMytimeMonthlyPerson.Idlersncd;
          // }

          if ((aMytimeMonthlyPerson.Confirmyn === '' || aMytimeMonthlyPerson.Confirmyn === 'C') && aMytimeMonthlyPerson.Result != null) {
            aMytimeMonthlyPerson.Resulthrs = this.TimeUtils.toString(aMytimeMonthlyPerson.Result, 'HHmm').substring(0, 2);
            aMytimeMonthlyPerson.Resultmin = this.TimeUtils.toString(aMytimeMonthlyPerson.Result, 'HHmm').substring(2, 4);
            aSelectedData.push(aMytimeMonthlyPerson);
          }
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

        try {
          const oTable = this.byId('MainTable');

          await Client.deep(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyPClosing', {
            Gubun: 'S',
            MytimeMonthlyPClosingITemSet: completeData,
          });

          // {확정}되었습니다.
          MessageBox.success(this.getBundleText('MSG_00007', '확정'), {
            onClose: () => {
              oTable.clearSelection();
              this.onRefreshAfterUpdate(completeData[0].Pernr);
              // this.onSearchDetail();
            },
          });
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        }
      },

      onPressCancel() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');
        const aSelectedIndices = oTable.getSelectedIndices();

        if (aSelectedIndices.length < 1) {
          MessageBox.alert(this.getBundleText('MSG_00020', '확정취소')); // {확정취소}할 행을 선택하세요.
          return;
        }

        var aSelectedData = [];
        for (var i = 0; i < aSelectedIndices.length; i++) {
          const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[aSelectedIndices[i]]);
          if (aMytimeMonthlyPerson.Confirmyn === 'X') aSelectedData.push(aMytimeMonthlyPerson);
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
        try {
          const oTable = this.byId('MainTable');

          await Client.deep(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyPClosing', {
            Gubun: 'D',
            MytimeMonthlyPClosingITemSet: cancelData,
          });

          // {확정취소}되었습니다.
          MessageBox.success(this.getBundleText('MSG_00007', '확정취소'), {
            onClose: () => {
              oTable.clearSelection();
              // this.onSearchDetail();
              this.onRefreshAfterUpdate(cancelData[0].Pernr);
            },
          });
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        }
      },

      async onPressCloseRequest() {
        const oViewModel = this.getViewModel();
        const oTable = this.byId('MainTable');
        // const aSelectedIndices = oTable.getSelectedIndices();

        // if (aSelectedIndices.length < 1) {
        //   MessageBox.alert(this.getBundleText('MSG_00020', '마감신청')); // {확정취소}할 행을 선택하세요.
        //   return;
        // }

        // for (var i = 0; i < aSelectedIndices.length; i++) {
        //   const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[aSelectedIndices[i]]);
        //   // 상세 사유
        //   if (aMytimeMonthlyPerson.Idledtrsn != null) {
        //     aMytimeMonthlyPerson.Ratnrsn = aMytimeMonthlyPerson.Idledtrsn;
        //   }
        //   // 사유
        //   if (aMytimeMonthlyPerson.Idlersncd != null) {
        //     aMytimeMonthlyPerson.Ratnans = aMytimeMonthlyPerson.Idlersncd;
        //   }

        //   if (aMytimeMonthlyPerson.Result != null) {
        //     aMytimeMonthlyPerson.Resulthrs = this.TimeUtils.toString(aMytimeMonthlyPerson.Result, 'HHmm').substring(0, 2);
        //     aMytimeMonthlyPerson.Resultmin = this.TimeUtils.toString(aMytimeMonthlyPerson.Result, 'HHmm').substring(2, 4);
        //   }

        //   aSelectedData.push(aMytimeMonthlyPerson);
        // }

        var aSelectedData = [];
        const aMytimeMonthlyPerson = _.cloneDeep(oViewModel.getProperty('/entry/MytimeMonthlyPerson')[0]);
        aSelectedData.push(aMytimeMonthlyPerson);

        // 선택된 행을 마감신청하시겠습니까?
        MessageBox.confirm('선택한 행을 마감신청하시겠습니까?', {
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
      },

      async closeRequestProcess(requestData) {
        try {
          const oTable = this.byId('MainTable');
          const aAppno = requestData[0].Appno;
          await Client.deep(this.getModel(ServiceNames.MYTIME), 'MytimeMonthlyPClosing', {
            Gubun: 'M',
            MytimeMonthlyPClosingITemSet: requestData,
          });

          await this.retrieveApplyList();
          await this.approvalSave(aAppno);
          // {마감신청}되었습니다.
          MessageBox.success(this.getBundleText('MSG_00007', '마감신청'), {
            onClose: async () => {
              oTable.clearSelection();
              await this.onRefreshAfterUpdate(requestData[0].Pernr);
            },
          });
        } catch (oError) {
          this.debug('Controller > shiftChange-detail > onPressDelBtn Error', oError);

          AppUtils.handleError(oError);
        }
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
