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
    'sap/viz/ui5/data/FlattenedDataset',
    'sap/viz/ui5/format/ChartFormatter',
    'sap/ui/model/json/JSONModel',
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
    Fragment,
    FlattenedDataset,
    ChartFormatter,
    JSONModel
  ) => {
    'use strict';

    return BaseController.extend('sap.ui.time.mvc.controller.timeReport.Main', {
      initializeModel() {
        return {
          busy: false,
          Auth: this.currentAuth(),
          _firstTime: true,
          Checkty: '',
          searchConditions: {
            Werks: '',
            Orgeh: '',
            Otext: '',
            YYYYMM: moment(new Date()).format('YYYYMM'),
            SelectOrgeh: '',
          },
          TeamList: [],
          TeamListInfo: { rowCount: 1 },
          EmployeeList: [],
          EmployeeListInfo: { rowCount: 1 },
          contentsBusy: {
            button: false,
            search: false,
            table: false,
          },
          PersaList: [],
          Monitoring: {
            Npcnt: '',
            Npccnt: '',
            Ncpcnt: '',
            Idlecnt: '',
            Latecnt: '',
            Earlycnt: '',
            Ovriskcnt: '',
            Undercnt: '',
            Addcnt: '',
          },

          Data1: [
            // 근무계획 미입력
            { Month: '1월', Count: 1, Revenue: 1 },
            { Month: '2월', Count: 2, Revenue: 2 },
            { Month: '3월', Count: 3, Revenue: 3 },
            { Month: '4월', Count: 4, Revenue: 4 },
            { Month: '5월', Count: 5, Revenue: 5 },
            { Month: '6월', Count: 6, Revenue: 6 },
            { Month: '7월', Count: 7, Revenue: 7 },
            { Month: '8월', Count: 8, Revenue: 8 },
            { Month: '9월', Count: 9, Revenue: 9 },
            { Month: '10월', Count: 10, Revenue: 10 },
            { Month: '11월', Count: 5, Revenue: 5 },
            { Month: '12월', Count: 12, Revenue: 12 },
          ],
          Data2: [
            // 실적 미확정
            { Month: '1월', Count: 10, Revenue: 10 },
            { Month: '2월', Count: 12, Revenue: 10 },
            { Month: '3월', Count: 13, Revenue: 10 },
            { Month: '4월', Count: 14, Revenue: 10 },
            { Month: '5월', Count: 15, Revenue: 10 },
            { Month: '6월', Count: 16, Revenue: 10 },
            { Month: '7월', Count: 17, Revenue: 10 },
            { Month: '8월', Count: 18, Revenue: 10 },
            { Month: '9월', Count: 19, Revenue: 10 },
            { Month: '10월', Count: 15, Revenue: 10 },
            { Month: '11월', Count: 10, Revenue: 10 },
            { Month: '12월', Count: 12, Revenue: 10 },
          ],
          Data3: [
            // 마감 미진행
            { Month: '1월', Count: 12 },
            { Month: '2월', Count: 11 },
            { Month: '3월', Count: 10 },
            { Month: '4월', Count: 9 },
            { Month: '5월', Count: 8 },
            { Month: '6월', Count: 7 },
            { Month: '7월', Count: 6 },
            { Month: '8월', Count: 5 },
            { Month: '9월', Count: 10 },
            { Month: '10월', Count: 12 },
            { Month: '11월', Count: 5 },
            { Month: '12월', Count: 1 },
          ],
          Data4: [
            // 이석 발생
            { Month: '1월', Count: 10 },
            { Month: '2월', Count: 8 },
            { Month: '3월', Count: 6 },
            { Month: '4월', Count: 4 },
            { Month: '5월', Count: 8 },
            { Month: '6월', Count: 10 },
            { Month: '7월', Count: 6 },
            { Month: '8월', Count: 5 },
            { Month: '9월', Count: 10 },
            { Month: '10월', Count: 12 },
            { Month: '11월', Count: 10 },
            { Month: '12월', Count: 8 },
          ],
          Data5: [
            // 지각 발생
            { Month: '1월', Count: 8 },
            { Month: '2월', Count: 10 },
            { Month: '3월', Count: 6 },
            { Month: '4월', Count: 4 },
            { Month: '5월', Count: 10 },
            { Month: '6월', Count: 10 },
            { Month: '7월', Count: 8 },
            { Month: '8월', Count: 8 },
            { Month: '9월', Count: 10 },
            { Month: '10월', Count: 10 },
            { Month: '11월', Count: 8 },
            { Month: '12월', Count: 2 },
          ],
          Data6: [
            // 조퇴 발생
            { Month: '1월', Count: 10 },
            { Month: '2월', Count: 8 },
            { Month: '3월', Count: 6 },
            { Month: '4월', Count: 4 },
            { Month: '5월', Count: 8 },
            { Month: '6월', Count: 10 },
            { Month: '7월', Count: 6 },
            { Month: '8월', Count: 5 },
            { Month: '9월', Count: 10 },
            { Month: '10월', Count: 12 },
            { Month: '11월', Count: 10 },
            { Month: '12월', Count: 8 },
          ],
          Data7: [
            // 근무초과 위험
            { Month: '1월', Count: 12 },
            { Month: '2월', Count: 11 },
            { Month: '3월', Count: 10 },
            { Month: '4월', Count: 9 },
            { Month: '5월', Count: 8 },
            { Month: '6월', Count: 7 },
            { Month: '7월', Count: 6 },
            { Month: '8월', Count: 5 },
            { Month: '9월', Count: 10 },
            { Month: '10월', Count: 5 },
            { Month: '11월', Count: 3 },
            { Month: '12월', Count: 1 },
          ],
          Data8: [
            // 근무 미달
            { Month: '1월', Count: 10 },
            { Month: '2월', Count: 10 },
            { Month: '3월', Count: 10 },
            { Month: '4월', Count: 9 },
            { Month: '5월', Count: 9 },
            { Month: '6월', Count: 9 },
            { Month: '7월', Count: 6 },
            { Month: '8월', Count: 6 },
            { Month: '9월', Count: 6 },
            { Month: '10월', Count: 5 },
            { Month: '11월', Count: 5 },
            { Month: '12월', Count: 5 },
          ],
          Data9: [
            // 근무 미달
            { Month: '1월', Count: 2 },
            { Month: '2월', Count: 2 },
            { Month: '3월', Count: 2 },
            { Month: '4월', Count: 4 },
            { Month: '5월', Count: 4 },
            { Month: '6월', Count: 4 },
            { Month: '7월', Count: 6 },
            { Month: '8월', Count: 6 },
            { Month: '9월', Count: 6 },
            { Month: '10월', Count: 8 },
            { Month: '11월', Count: 8 },
            { Month: '12월', Count: 8 },
          ],
          MonitoringList1: [
            {
              Ename: '홍길동',
              Zzjobgrtx: '사무직',
              Zzcaltltx: '수석',
              Zzpsgrptx: '',
              Orgtx: '제조팀',
              Tmdat: '2024.10.01',
              Begda: '',
              Endda: '',
              Pcbegtm: '',
              Pcendtm: '',
              Test: '',
              Ratnan: '',
              Ratnans: '',
            },
            {
              Ename: '홍길순',
              Zzjobgrtx: '전문직',
              Zzcaltltx: '선임',
              Zzpsgrptx: '',
              Orgtx: '영업팀',
              Tmdat: '2024.10.01',
              Begda: '',
              Endda: '',
              Pcbegtm: '',
              Pcendtm: '',
              Test: '',
              Ratnan: '',
              Ratnans: '',
            },
            {
              Ename: '홍길이',
              Zzjobgrtx: '사무직',
              Zzcaltltx: '선임',
              Zzpsgrptx: '',
              Orgtx: '영업팀',
              Tmdat: '2024.10.01',
              Begda: '',
              Endda: '',
              Pcbegtm: '',
              Pcendtm: '',
              Test: '',
              Ratnan: '',
              Ratnans: '',
            },
          ],
          MonitoringListInfo1: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListInfoA1: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListInfoA2: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListInfoA3: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListA1: [],
          MonitoringListA2: [],
          MonitoringListA3: [],
          MonitoringListInfoC1: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListInfoC2: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListInfoC3: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListC1: [],
          MonitoringListC2: [],
          MonitoringListC3: [],
          MonitoringListB1: [],
          MonitoringList2: [],
          MonitoringListInfoB1: {
            rowCount: 3,
            visible: false,
          },
          MonitoringListInfo2: {
            rowCount: 3,
            visible: false,
          },
          vizFrameList: [],
          VizFrameVisible: false,
          VizFrameLabel: '근무계획 미입력 건 수',
          VizFrameLabelVisible: false,
          settingsModel: {
            dataset: {
              name: 'Dataset',
              defaultSelected: 1,
              values: [
                {
                  name: 'Small',
                  value: '/betterSmall.json',
                },
                {
                  name: 'Medium',
                  value: '/betterMedium.json',
                },
                {
                  name: 'Large',
                  value: '/betterLarge.json',
                },
              ],
            },
            series: {
              name: 'Series',
              defaultSelected: 0,
              values: [
                {
                  name: '1 Series',
                  value: ['Revenue'],
                },
                {
                  name: '2 Series',
                  value: ['Revenue', 'Cost'],
                },
              ],
            },
            dataLabel: {
              name: 'Value Label',
              defaultState: true,
            },
            axisTitle: {
              name: 'Axis Title',
              defaultState: false,
            },
            dimensions: {
              Small: [
                {
                  name: 'Seasons',
                  value: '{Seasons}',
                },
              ],
              Medium: [
                {
                  name: 'Week',
                  value: '{Week}',
                },
              ],
              Large: [
                {
                  name: 'Week',
                  value: '{Week}',
                },
              ],
            },
            measures: [
              {
                name: 'Revenue',
                value: '{Revenue}',
              },
              {
                name: 'Cost',
                value: '{Cost}',
              },
            ],
          },

          loadData: {
            milk: [
              {
                Budget: 210000,
                Cost: 230000,
                Cost1: 24800.63,
                Cost2: 205199.37,
                Cost3: 199999.37,
                Revenue: 431000.22,
                Target: 500000,
                Week: 'Week 1 - 4',
              },
              {
                Budget: 224000,
                Cost: 238000,
                Cost1: 99200.39,
                Cost2: 138799.61,
                Cost3: 200199.37,
                Revenue: 494000.3,
                Target: 500000,
                Week: 'Week 5 - 8',
              },
              {
                Budget: 238000,
                Cost: 221000,
                Cost1: 70200.54,
                Cost2: 150799.46,
                Cost3: 80799.46,
                Revenue: 491000.17,
                Target: 500000,
                Week: 'Week 9 - 12',
              },
              {
                Budget: 252000,
                Cost: 280000,
                Cost1: 158800.73,
                Cost2: 121199.27,
                Cost3: 108800.46,
                Revenue: 536000.34,
                Target: 500000,
                Week: 'Week 13 - 16',
              },
              {
                Budget: 266000,
                Cost: 230000,
                Cost1: 140000.91,
                Cost2: 89999.09,
                Cost3: 100099.09,
                Revenue: 675000,
                Target: 600000,
                Week: 'Week 17 - 20',
              },
              {
                Budget: 280000,
                Cost: 250000,
                Cost1: 172800.15,
                Cost2: 77199.85,
                Cost3: 57199.85,
                Revenue: 680000,
                Target: 600000,
                Week: 'Week 21 - 24',
              },
              {
                Budget: 294000,
                Cost: 325000,
                Cost1: 237200.74,
                Cost2: 87799.26,
                Cost3: 187799.26,
                Revenue: 659000.14,
                Target: 600000,
                Week: 'Week 25 - 28',
              },
              {
                Budget: 308000,
                Cost: 350000,
                Cost1: 243200.18,
                Cost2: 106799.82,
                Cost3: 206799.82,
                Revenue: 610000,
                Target: 600000,
                Week: 'Week 29 - 32',
              },
              {
                Budget: 322000,
                Cost: 390000,
                Cost1: 280800.24,
                Cost2: 109199.76,
                Cost3: 209199.76,
                Revenue: 751000.83,
                Target: 600000,
                Week: 'Week 33 - 37',
              },
              {
                Budget: 336000,
                Cost: 450000,
                Cost1: 320000.08,
                Cost2: 129999.92,
                Cost3: 409199.76,
                Revenue: 800000.63,
                Target: 700000,
                Week: 'Week 38 - 42',
              },
              { Budget: 350000, Cost: 480000, Cost1: 360800.09, Cost2: 119199.91, Cost3: 210109.01, Revenue: 881000.19, Target: 700000, Week: 'Week 43 - 47' },
              {
                Budget: 364000,
                Cost: 560000,
                Cost1: 403200.08,
                Cost2: 156799.92,
                Cost3: 139199.01,
                Revenue: 904000.04,
                Target: 700000,
                Week: 'Week 47 - 52',
              },
            ],
          },
        };
      },

      /**
       * @override
       */
      onBeforeShow() {
        BaseController.prototype.onBeforeShow.apply(this, arguments);

        this.TableUtils.adjustRowSpan({
          oTable: this.byId('MonitoringTableA1'),
          aColIndices: [0, 1, 2, 3, 4, 5, 6, 9],
          sTheadOrTbody: 'thead',
        });

        this.TableUtils.adjustRowSpan({
          oTable: this.byId('MonitoringTableA2'),
          aColIndices: [0, 1, 2, 3, 4, 5, 6, 9],
          sTheadOrTbody: 'thead',
        });

        this.TableUtils.adjustRowSpan({
          oTable: this.byId('MonitoringTableA3'),
          aColIndices: [0, 1, 2, 3, 4, 5, 6, 9],
          sTheadOrTbody: 'thead',
        });
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

          var oVizFrame = this.byId('idVizFrame');
          var formatPattern = ChartFormatter.DefaultPattern;
          oVizFrame.setVizProperties({
            plotArea: {
              dataLabel: {
                // formatString: formatPattern.LONGFLOAT,
                visible: true,
              },
            },
            valueAxis: {
              label: {
                // formatString: formatPattern.LONGFLOAT,
              },
              title: {
                visible: false,
              },
            },
            categoryAxis: {
              title: {
                visible: false,
              },
            },
            title: {
              visible: false,
              text: 'Revenue by City and Store Name',
            },
          });

          await this.setPersaList();
          if (this.currentAuth() === 'M' || this.currentAuth() === 'E') {
            oViewModel.setProperty('/searchConditions/Orgeh', this.getAppointeeProperty('Orgeh'));
            oViewModel.setProperty('/searchConditions/Otext', this.getAppointeeProperty('Stext'));
            if (this.currentAuth() === 'E') {
              oViewModel.setProperty('/searchConditions/Ename', this.getAppointeeProperty('Ename'));
              oViewModel.setProperty('/searchConditions/Pernr', this.getAppointeeProperty('Pernr'));
            }
          }

          // await this.onPressSearch();
          if (this.currentAuth() === 'E') {
            await this.retrieveEmployeeWorking();
            await this.retrieveOverallStatus();
          } else if (this.currentAuth() === 'M') {
            await this.retrieveTeamWorking();
            await this.retrieveEmployeeWorking();
            await this.retrieveOverallStatus();
          } else if (this.currentAuth() === 'H') {
            await this.retrieveTeamWorking();
          }
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

      /* oEvent 가 null 이 아닐 경우는 조회 버튼을 클릭 할 경우 
         null 이면서 Hass 일 경우에는 팀원 근무시간 현황을 
      */
      async onPressSearch(oEvent) {
        const oViewModel = this.getViewModel();
        this.setContentsBusy(true, ['search', 'table']);

        try {
          const oEmployeeTable = this.byId('EmployeeTable');
          const vWerks = oViewModel.getProperty('/searchConditions/Werks'),
            vYYYYMM = oViewModel.getProperty('/searchConditions/YYYYMM'),
            vOrgeh = oViewModel.getProperty('/searchConditions/Orgeh'),
            vPernr = oViewModel.getProperty('/searchConditions/Pernr');
          var vEmployeePromise = [];
          if (!vWerks || !vYYYYMM) return;

          const vBegdaO = moment(vYYYYMM + '01');
          const vEnddaO = vBegdaO.clone().endOf('month');
          const vBegda = this.DateUtils.parse(vBegdaO._d);
          const vEndda = this.DateUtils.parse(vEnddaO._d);

          // HASS 팀 리스트에서 선택한 조직을 초기화
          oViewModel.setProperty('/searchConditions/SelectOrgeh', '');
          oViewModel.setProperty('/searchConditions/Click', '');

          // 팀 근무시간 현황
          if (this.currentAuth() === 'M' || this.currentAuth() === 'H') {
            const oTeamTable = this.byId('TeamTable');
            oViewModel.setProperty('/TeamList', []);
            oViewModel.refresh(true);
            this.TableUtils.clearTablePicker(oTeamTable);
            this.TableUtils.clearTable(oTeamTable);

            var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
              Werks: vWerks,
              Zzmonth: vYYYYMM,
              Austy: this.currentAuth(),
              Begda: vBegda,
              Endda: vEndda,
              Disty: '1',
              Orgeh: vOrgeh,
            });

            for (var i = 0; i < aRowData.length; i++) {
              aRowData[i].Month = vYYYYMM.substring(4, 6) + '월';
            }

            oViewModel.setProperty('/TeamList', aRowData);
            oViewModel.setProperty('/TeamListInfo/rowCount', aRowData.length > 10 ? 10 : aRowData.length);

            // 팀원 근무시간 현황
            if (vPernr != '') {
              vEmployeePromise.push(
                await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
                  Werks: vWerks,
                  Zzmonth: vYYYYMM,
                  Austy: this.currentAuth(),
                  Begda: vBegda,
                  Endda: vEndda,
                  Disty: '2',
                  Orgeh: vOrgeh,
                  Pernr: vPernr,
                })
              );
            } else {
              for (var i = 0; i < aRowData.length; i++) {
                vEmployeePromise.push(
                  await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
                    Werks: vWerks,
                    Zzmonth: vYYYYMM,
                    Austy: this.currentAuth(),
                    Begda: vBegda,
                    Endda: vEndda,
                    Disty: '2',
                    Orgeh: aRowData[i].Orgeh,
                  })
                );
              }
            }

            // setTimeout(() => oTable.setFirstVisibleRow(), 100);
            this.TableUtils.clearTable(oTeamTable);
            oViewModel.refresh(true);
          } else {
            vEmployeePromise.push(
              await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
                Werks: vWerks,
                Zzmonth: vYYYYMM,
                Begda: vBegda,
                Endda: vEndda,
                Austy: this.currentAuth(),
                Disty: '2',
                Pernr: vPernr,
                Orgeh: vOrgeh,
              })
            );
          }

          const aEmployeeResults = await Promise.all(vEmployeePromise);
          let vEmployeeList = [];
          for (var i = 0; i < aEmployeeResults.length; i++) {
            for (var j = 0; j < aEmployeeResults[i].length; j++) {
              aEmployeeResults[i][j].Month = vYYYYMM.substring(4, 6) + '월';
              vEmployeeList.push(aEmployeeResults[i][j]);
            }
          }

          oViewModel.setProperty('/EmployeeList', vEmployeeList);
          oViewModel.setProperty('/EmployeeListInfo/rowCount', vEmployeeList.length > 10 ? 10 : vEmployeeList.length);

          var aOverallRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorOverallStatus', {
            Werks: vWerks,
            Austy: this.currentAuth(),
            Begda: vBegda,
            Endda: vEndda,
            // Disty: vPernr && vPernr != '' ? '2' : '1',
            Disty: this.currentAuth() == 'E' ? '2' : '1',
            Orgeh: vOrgeh,
            Pernr: vPernr,
          });

          oViewModel.setProperty('/Monitoring', aOverallRowData[0]);
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveList Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async retrieveTeamWorking() {
        const oViewModel = this.getViewModel();

        try {
          const vWerks = oViewModel.getProperty('/searchConditions/Werks'),
            vYYYYMM = oViewModel.getProperty('/searchConditions/YYYYMM'),
            vOrgeh = oViewModel.getProperty('/searchConditions/Orgeh');
          if (!vWerks || !vYYYYMM) return;

          const vBegdaO = moment(vYYYYMM + '01');
          const vEnddaO = vBegdaO.clone().endOf('month');
          const vBegda = this.DateUtils.parse(vBegdaO._d);
          const vEndda = this.DateUtils.parse(vEnddaO._d);

          // 팀 근무시간 현황
          const oTeamTable = this.byId('TeamTable');
          oViewModel.setProperty('/TeamList', []);
          oViewModel.refresh(true);
          this.TableUtils.clearTablePicker(oTeamTable);

          var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
            Werks: vWerks,
            Zzmonth: vYYYYMM,
            Austy: this.currentAuth(),
            Begda: vBegda,
            Endda: vEndda,
            Disty: '1',
            Orgeh: vOrgeh,
          });

          for (var i = 0; i < aRowData.length; i++) {
            aRowData[i].Month = vYYYYMM.substring(4, 6) + '월';
          }

          oViewModel.setProperty('/TeamList', aRowData);
          oViewModel.setProperty('/TeamListInfo/rowCount', aRowData.length > 10 ? 10 : aRowData.length);
          this.TableUtils.clearTable(oTeamTable);
          oViewModel.refresh(true);
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveTeamWorking Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async onSelectionTeam(oEvent) {
        const oViewModel = this.getViewModel();

        const oEventSource = oEvent.getSource();
        const aSelected = oEventSource.getSelectedIndices();
        const iSelectedRowIndex = oEvent.getParameter('rowIndex');
        const aTeamTable = this.byId('TeamTable');

        if (!aSelected) {
          // HASS 팀 리스트에서 선택한 조직을 초기화
          oViewModel.setProperty('/searchConditions/SelectOrgeh', '');
          return;
        }

        oEventSource.setSelectionInterval(iSelectedRowIndex, iSelectedRowIndex);
        if (aTeamTable.getRows()[oEvent.getSource().getSelectedIndex()].getBindingContext()) {
          oViewModel.setProperty('/searchConditions/SelectOrgeh', aTeamTable.getRows()[oEvent.getSource().getSelectedIndex()].getBindingContext().getObject().Orgeh);
          await this.retrieveEmployeeWorking(aTeamTable.getRows()[oEvent.getSource().getSelectedIndex()].getBindingContext().getObject().Orgeh);
          await this.retrieveOverallStatus(aTeamTable.getRows()[oEvent.getSource().getSelectedIndex()].getBindingContext().getObject().Orgeh, '2');
          switch (oViewModel.getProperty('/searchConditions/Click')) {
            case '1':
              this.onClick1();
              break;
            case '2':
              this.onClick2();
              break;
            case '3':
              this.onClick3();
              break;
            case '4':
              this.onClick4();
              break;
            case '5':
              this.onClick5();
              break;
            case '6':
              this.onClick6();
              break;
            case '7':
              this.onClick7();
              break;
            case '8':
              this.onClick8();
              break;
            case '9':
              this.onClick9();
              break;
          }
        }
      },

      // async onSelectionTeam(oEvent) {
      //   const oViewModel = this.getViewModel();

      //   const oEventSource = oEvent.getSource();
      //   const aSelected = oEventSource.getSelectedIndices();
      //   const iSelectedRowIndex = oEvent.getParameter('rowIndex');
      //   const aTeamTable = this.byId('TeamTable'); .getRows()[oEvent.getSource().getSelectedIndex()].getBindingContext().getObject()

      //   if (!aSelected) {
      //     // HASS 팀 리스트에서 선택한 조직을 초기화
      //     oViewModel.setProperty('/searchConditions/SelectOrgeh', '');
      //     return;
      //   }

      //   oEventSource.setSelectionInterval(iSelectedRowIndex, iSelectedRowIndex);
      //   if (oViewModel.getProperty('/TeamList')[iSelectedRowIndex]) {
      //     oViewModel.setProperty('/searchConditions/SelectOrgeh', oViewModel.getProperty('/TeamList')[iSelectedRowIndex].Orgeh);
      //     await this.retrieveEmployeeWorking(oViewModel.getProperty('/TeamList')[iSelectedRowIndex].Orgeh);
      //     await this.retrieveOverallStatus(oViewModel.getProperty('/TeamList')[iSelectedRowIndex].Orgeh, '2');
      //     switch (oViewModel.getProperty('/searchConditions/Click')) {
      //       case '1':
      //         this.onClick1();
      //         break;
      //       case '2':
      //         this.onClick2();
      //         break;
      //       case '3':
      //         this.onClick3();
      //         break;
      //       case '4':
      //         this.onClick4();
      //         break;
      //       case '5':
      //         this.onClick5();
      //         break;
      //       case '6':
      //         this.onClick6();
      //         break;
      //       case '7':
      //         this.onClick7();
      //         break;
      //       case '8':
      //         this.onClick8();
      //         break;
      //       case '9':
      //         this.onClick9();
      //         break;
      //     }
      //   }
      // },

      async retrieveEmployeeWorking(rOrgeh = '') {
        const oViewModel = this.getViewModel();
        const vWerks = oViewModel.getProperty('/searchConditions/Werks'),
          vYYYYMM = oViewModel.getProperty('/searchConditions/YYYYMM'),
          vOrgeh = oViewModel.getProperty('/searchConditions/Orgeh'),
          vPernr = oViewModel.getProperty('/searchConditions/Pernr');

        const vBegdaO = moment(vYYYYMM + '01');
        const vEnddaO = vBegdaO.clone().endOf('month');
        const vBegda = this.DateUtils.parse(vBegdaO._d);
        const vEndda = this.DateUtils.parse(vEnddaO._d);
        var vEmployeePromise = [];
        const aRowData = oViewModel.getProperty('/TeamList');
        // 팀원 근무시간 현황
        if (rOrgeh != '') {
          vEmployeePromise.push(
            await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
              Werks: vWerks,
              Zzmonth: vYYYYMM,
              Austy: this.currentAuth(),
              Begda: vBegda,
              Endda: vEndda,
              Disty: '2',
              Orgeh: rOrgeh,
            })
          );
        } else if (vPernr && vPernr != '') {
          vEmployeePromise.push(
            await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
              Werks: vWerks,
              Zzmonth: vYYYYMM,
              Austy: this.currentAuth(),
              Begda: vBegda,
              Endda: vEndda,
              Disty: '2',
              Pernr: vPernr,
            })
          );
        } else {
          for (var i = 0; i < aRowData.length; i++) {
            vEmployeePromise.push(
              await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorWorkingTime', {
                Werks: vWerks,
                Zzmonth: vYYYYMM,
                Austy: this.currentAuth(),
                Begda: vBegda,
                Endda: vEndda,
                Disty: '2',
                Orgeh: aRowData[i].Orgeh,
              })
            );
          }
        }

        const aEmployeeResults = await Promise.all(vEmployeePromise);
        let vEmployeeList = [];
        for (var i = 0; i < aEmployeeResults.length; i++) {
          for (var j = 0; j < aEmployeeResults[i].length; j++) {
            aEmployeeResults[i][j].Month = vYYYYMM.substring(4, 6) + '월';
            vEmployeeList.push(aEmployeeResults[i][j]);
          }
        }

        oViewModel.setProperty('/EmployeeList', vEmployeeList);
        oViewModel.setProperty('/EmployeeListInfo/rowCount', vEmployeeList.length > 10 ? 10 : vEmployeeList.length);
      },

      async retrieveOverallStatus(rOrgeh = '', rDisty = '') {
        this.setContentsBusy(true, ['search', 'table']);
        try {
          const oViewModel = this.getViewModel();
          const vWerks = oViewModel.getProperty('/searchConditions/Werks'),
            vYYYYMM = oViewModel.getProperty('/searchConditions/YYYYMM'),
            vOrgeh = oViewModel.getProperty('/searchConditions/Orgeh'),
            vPernr = oViewModel.getProperty('/searchConditions/Pernr');
          const vBegdaO = moment(vYYYYMM + '01');
          const vEnddaO = vBegdaO.clone().endOf('month');
          const vBegda = this.DateUtils.parse(vBegdaO._d);
          const vEndda = this.DateUtils.parse(vEnddaO._d);

          var aOverallRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorOverallStatus', {
            Werks: vWerks,
            Austy: this.currentAuth(),
            Begda: vBegda,
            Endda: vEndda,
            // Disty: rDisty != '' ? rDisty : vPernr && vPernr != '' ? '2' : '1',
            Disty: this.currentAuth() == 'E' ? '2' : '1',
            Orgeh: rOrgeh != '' ? rOrgeh : vOrgeh,
            Pernr: vPernr,
          });

          oViewModel.setProperty('/Monitoring', aOverallRowData[0]);
        } catch (oError) {
          this.debug('Controller > commuteCheck > retrieveOverallStatus Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setContentsBusy(false);
        }
      },

      onPressExcelDownload() {},

      getCurrentLocationText() {
        return '월 근태 현황';
      },

      getBreadcrumbsLinks() {
        return [{ name: this.getBundleText('LABEL_01001') }]; // My Time
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

      onSearchPernr() {
        this.onEmployeeSearchOpenForRef();
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
        if (Pernr && Pernr != '') {
          oViewModel.setProperty('/searchConditions/Pernr', Pernr);
          oViewModel.setProperty('/searchConditions/Ename', Ename);
        } else {
          oViewModel.setProperty('/searchConditions/Pernr', '');
          oViewModel.setProperty('/searchConditions/Ename', '');
        }
      },

      onClick1() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '1');
        this.setMonitoringTableVisible('A1');
        this.getMonitoringTableData('A', 'A1');
        this.setVizframe('1');
      },
      onClick2() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '2');
        this.setMonitoringTableVisible('A2');
        this.getMonitoringTableData('B', 'A2');
        this.setVizframe('2');
      },
      onClick3() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '3');
        this.setMonitoringTableVisible('A3');
        this.getMonitoringTableData('C', 'A3');
        this.setVizframe('3');
      },
      onClick4() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '4');
        this.setMonitoringTableVisible('B1');
        this.getMonitoringTableData('G', 'B1');
        this.setVizframe('4');
      },
      onClick5() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '5');
        this.setMonitoringTableVisible('2');
        this.getMonitoringTableData('H', '2');
        this.setVizframe('5');
      },
      onClick6() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '6');
        this.setMonitoringTableVisible('2');
        this.getMonitoringTableData('I', '2');
        this.setVizframe('6');
      },
      onClick7() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '7');
        this.setMonitoringTableVisible('C1');
        this.getMonitoringTableData('D', 'C1');
        this.setVizframe('7');
      },
      onClick8() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '8');
        this.setMonitoringTableVisible('C2');
        this.getMonitoringTableData('E', 'C2');
        this.setVizframe('8');
      },
      onClick9() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/searchConditions/Click', '9');
        this.setMonitoringTableVisible('C2');
        this.getMonitoringTableData('F', 'C2');
        this.setVizframe('9');
      },
      onClickForTable1() {
        // this.setMonitoringTableVisible('1');
      },
      async onClickForTable2() {
        // this.setMonitoringTableVisible('2');
        // this.getMonitoringTableData2();
      },
      onClickForTable3() {
        // this.setMonitoringTableVisible('3');
        // this.getMonitoringTableData2();
      },

      async setMonitoringTableVisible(aFlag) {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/MonitoringListInfoA1/visible', false);
        oViewModel.setProperty('/MonitoringListInfoA2/visible', false);
        oViewModel.setProperty('/MonitoringListInfoA3/visible', false);
        oViewModel.setProperty('/MonitoringListInfoB1/visible', false);
        oViewModel.setProperty('/MonitoringListInfo2/visible', false);
        oViewModel.setProperty('/MonitoringListInfoC1/visible', false);
        oViewModel.setProperty('/MonitoringListInfoC2/visible', false);
        oViewModel.setProperty('/MonitoringListInfoC3/visible', false);

        oViewModel.setProperty('/MonitoringListInfo' + aFlag + '/visible', true);
      },

      async getMonitoringTableData(aCheckty, aTable) {
        const oViewModel = this.getViewModel();
        this.setContentsBusy(true, ['search', 'table']);

        try {
          const vWerks = oViewModel.getProperty('/searchConditions/Werks'),
            vYYYYMM = oViewModel.getProperty('/searchConditions/YYYYMM'),
            vOrgeh = oViewModel.getProperty('/searchConditions/Orgeh'),
            vPernr = oViewModel.getProperty('/searchConditions/Pernr');
          var vEmployeePromise = [];
          if (!vWerks || !vYYYYMM) return;

          const vBegdaO = moment(vYYYYMM + '01');
          const vEnddaO = vBegdaO.clone().endOf('month');
          const vBegda = this.DateUtils.parse(vBegdaO._d);
          const vEndda = this.DateUtils.parse(vEnddaO._d);
          const oTable = this.byId('MonitoringTable' + aTable);

          oViewModel.setProperty('/MonitoringList' + aTable, []);
          oViewModel.refresh(true);
          this.TableUtils.clearTable(oTable);

          var aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'TeamMonitorOverallStatus2', {
            Werks: vWerks,
            Zzmonth: vYYYYMM,
            Austy: this.currentAuth(),
            Begda: vBegda,
            Endda: vEndda,
            // Disty: '2',
            Disty: this.currentAuth() == 'E' ? '2' : '1',
            Orgeh:
              oViewModel.getProperty('/searchConditions/SelectOrgeh') && oViewModel.getProperty('/searchConditions/SelectOrgeh') != ''
                ? oViewModel.getProperty('/searchConditions/SelectOrgeh')
                : vOrgeh,
            Pernr: vPernr,
            Checkty: aCheckty,
          });

          for (var i = 0; i < aRowData.length; i++) {
            aRowData[i].Tmdat = aRowData[i].Tmdat && aRowData[i].Tmdat != '' ? moment(aRowData[i].Tmdat).format('YYYY.MM.DD') : '';
            aRowData[i].Begda = aRowData[i].Begda && aRowData[i].Begda != '' ? moment(aRowData[i].Begda).format('YYYY.MM.DD') : '';
            aRowData[i].Endda = aRowData[i].Endda && aRowData[i].Endda != '' ? moment(aRowData[i].Endda).format('YYYY.MM.DD') : '';
            aRowData[i].Pcbegtm = aRowData[i].Pcbegtm && aRowData[i].Pcbegtm != '' ? this.TimeUtils.format(aRowData[i].Pcbegtm, 'HH:mm') : '';
            aRowData[i].Pcendtm = aRowData[i].Pcendtm && aRowData[i].Pcendtm != '' ? this.TimeUtils.format(aRowData[i].Pcendtm, 'HH:mm') : '';
            aRowData[i].Scbegtm = aRowData[i].Scbegtm && aRowData[i].Scbegtm != '' ? this.TimeUtils.format(aRowData[i].Scbegtm, 'HH:mm') : '';
            aRowData[i].Scendtm = aRowData[i].Scendtm && aRowData[i].Scendtm != '' ? this.TimeUtils.format(aRowData[i].Scendtm, 'HH:mm') : '';
          }

          oViewModel.setProperty('/MonitoringList' + aTable, aRowData);
          oViewModel.setProperty('/MonitoringListInfo' + aTable + '/rowCount', aRowData.length > 10 ? 10 : aRowData.length);
          oViewModel.setProperty('/Checkty', aCheckty);
          oViewModel.refresh(true);
        } catch (oError) {
          this.debug('Controller > commuteCheck > getMonitoringTableData2 Error', oError);

          AppUtils.handleError(oError);
          this.setContentsBusy(false);
        } finally {
          this.setTableColorStyleA1();
          this.setTableColorStyleA2();
          this.setTableColorStyleA3();
          this.setTableColorStyleC1();
          this.setTableColorStyleC2();
          this.setTableColorStyleB1();
          this.setContentsBusy(false);
        }
      },

      onSortAndFilter(oEvent) {
        console.log(oEvent);
        this.setTableColorStyleA1();
        this.setTableColorStyleA2();
        this.setTableColorStyleA3();
        this.setTableColorStyleC1();
        this.setTableColorStyleC2();
        this.setTableColorStyleB1();
      },

      setTableColorStyleA1() {
        const oTable = this.byId('MonitoringTableA1');

        setTimeout(() => {
          this.TableUtils.setColorColumn({
            oTable,
            mColorMap: {
              6: 'MonitoringTableCoreBackground',
            },
          });
        }, 100);
      },

      setTableColorStyleA2() {
        const oTable = this.byId('MonitoringTableA2');

        if (oTable) {
          setTimeout(() => {
            this.TableUtils.setColorColumn({
              oTable,
              mColorMap: {
                8: 'MonitoringTableCoreBackground',
              },
            });
          }, 100);
        }
      },

      setTableColorStyleA3() {
        const oTable = this.byId('MonitoringTableA3');
        if (oTable) {
          setTimeout(() => {
            this.TableUtils.setColorColumn({
              oTable,
              mColorMap: {
                9: 'MonitoringTableCoreBackground',
              },
            });
          }, 100);
        }
      },

      setTableColorStyleC1() {
        const oTable = this.byId('MonitoringTableC1');
        if (oTable) {
          setTimeout(() => {
            this.TableUtils.setColorColumn({
              oTable,
              mColorMap: {
                11: 'MonitoringTableCoreBackground',
                12: 'MonitoringTableCoreBackground',
              },
            });
          }, 100);
        }
      },

      setTableColorStyleC2() {
        const oTable = this.byId('MonitoringTableC2');
        if (oTable) {
          setTimeout(() => {
            this.TableUtils.setColorColumn({
              oTable,
              mColorMap: {
                7: 'MonitoringTableCoreBackground',
                9: 'MonitoringTableCoreBackground',
                10: 'MonitoringTableCoreBackground',
              },
            });
          }, 100);
        }
      },

      setTableColorStyleB1() {
        const oTable = this.byId('MonitoringTableB1');
        if (oTable) {
          setTimeout(() => {
            this.TableUtils.setColorColumn({
              oTable,
              mColorMap: {
                10: 'MonitoringTableCoreBackground',
              },
            });
          }, 100);
        }
      },

      async setVizframe(aFlag) {
        const oViewModel = this.getViewModel();
        if (aFlag != '') {
          // oViewModel.setProperty('/VizFrameVisible', true);
          oViewModel.setProperty('/VizFrameVisible', false);
          oViewModel.setProperty('/VizFrameLabelVisible', true);
        } else {
          oViewModel.setProperty('/VizFrameVisible', false);
          oViewModel.setProperty('/VizFrameLabelVisible', false);
        }
        const oVizFrame = this.byId('idVizFrame');
        var vizFrameData = [];
        // var jsonModel = new sap.ui.model.json.JSONModel();
        if (aFlag === '1') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data1'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 근무계획 미입력 건 수');
        } else if (aFlag === '2') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data2'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 실적 미확정 건 수');
        } else if (aFlag === '3') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data3'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 마감 미진행 건 수');
        } else if (aFlag === '4') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data4'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 이석 발생 건 수');
        } else if (aFlag === '5') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data5'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 지각 발생 건 수');
        } else if (aFlag === '6') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data6'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 조퇴 발생 건 수');
        } else if (aFlag === '7') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data7'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 근무초과 위험 건 수');
        } else if (aFlag === '8') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data8'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 근무 미달 건 수');
        } else if (aFlag === '9') {
          // vizFrameData = _.cloneDeep(oViewModel.getProperty('/Data9'));
          oViewModel.setProperty('/VizFrameLabel', '당월 근태 Monitoring 상세 현황 - 근무 추가 건 수');
        }
      },

      onPressExcelDownloadForTeam() {
        let oTable, sFileName;
        oTable = this.byId('TeamTable');
        sFileName = '팀 근무시간 현황';

        this.TableUtils.export({ oTable, sFileName });
      },

      onPressExcelDownloadForEmployee() {
        let oTable, sFileName;
        oTable = this.byId('EmployeeTable');
        sFileName = '팀원 근무시간 현황';

        this.TableUtils.export({ oTable, sFileName });
      },

      onPressExcelDownloadForEmployee() {
        let oTable, sFileName;
        oTable = this.byId('EmployeeTable');
        sFileName = '팀원 근무시간 현황';

        this.TableUtils.export({ oTable, sFileName });
      },
      onPressExcelDownloadForMonitoring() {
        const oViewModel = this.getViewModel();
        let oTable, sFileName;
        oTable = this.byId('MonitoringTable1');
        sFileName = '팀원 근무시간 현황';
        if (oViewModel.getProperty('/MonitoringListInfoA1/visible')) {
          oTable = this.byId('MonitoringTableA1');
        } else if (oViewModel.getProperty('/MonitoringListInfoA2/visible')) {
          oTable = this.byId('MonitoringTableA2');
        } else if (oViewModel.getProperty('/MonitoringListInfoA3/visible')) {
          oTable = this.byId('MonitoringTableA3');
        } else if (oViewModel.getProperty('/MonitoringListInfoC1/visible')) {
          oTable = this.byId('MonitoringTableC1');
        } else if (oViewModel.getProperty('/MonitoringListInfoC2/visible')) {
          oTable = this.byId('MonitoringTableC2');
        } else if (oViewModel.getProperty('/MonitoringListInfo2/visible')) {
          oTable = this.byId('MonitoringTable2');
        } else if (oViewModel.getProperty('/MonitoringListInfoB1/visible')) {
          oTable = this.byId('MonitoringTableB1');
        }
        sFileName = oViewModel.getProperty('/VizFrameLabel');
        this.TableUtils.export({ oTable, sFileName });
      },
    });
  }
);
