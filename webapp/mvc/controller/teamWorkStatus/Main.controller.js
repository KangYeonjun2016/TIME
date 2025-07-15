sap.ui.define(
  [
    //
    'sap/ui/time/common/AppUtils',
    'sap/ui/time/mvc/controller/BaseController',
    'sap/ui/time/common/odata/Client',
    'sap/ui/time/common/odata/ServiceNames',
    'sap/base/Log',
    'sap/gantt/misc/Format',
    'sap/ui/core/Fragment',
    'sap/ui/time/control/Tooltip',
    'sap/ui/unified/library',
    'sap/ui/unified/DateRange',
  ],
  (
    //
    AppUtils,
    BaseController,
    Client,
    ServiceNames,
    Log,
    Format,
    Fragment,
    CustomTooltip,
    unifiedLibrary,
    DateRange
  ) => {
    'use strict';

    return BaseController.extend('sap.ui.time.mvc.controller.teamWorkStatus.Main', {
      first: '',

      initializeModel() {
        return {
          contentsBusy: {
            all: false,
            plan: false,
          },
          listInfo: {
            rowCount: 1,
          },
          list: [],
          targetList: [],
          TimeTypes: [
            { Colty: 'F', Coltytx: '근무', Width: '120px' },
            { Colty: 'A', Coltytx: '휴가/휴무', Width: '140px' },
            { Colty: 'B', Coltytx: '교육/출장/기타근무', Width: '200px' },
            { Colty: 'C', Coltytx: '휴직', Width: '120px' },
          ],
          startNumber: '',
          endNumber: '',
          startDateText: '',
          root: {
            children: [],
          },
          viewType: 'Monthly',
          holidayText: '',
          startDailyDate: new Date('2024', '9', '15', '6', '0'),
          startMonthlyDate: new Date('2024', '9', '1', '6', '0'),
          minDate: new Date('2024', '9', '16', '6', '0'),
          MonthlyAppointments: [],
          DetailAppointData: {},
        };
      },

      /**
       * @override
       */
      onBeforeShow() {
        BaseController.prototype.onBeforeShow.apply(this, arguments);
        // this.handleSelectToday();
      },

      async onObjectMatched() {
        const oViewModel = this.getViewModel();
        try {
          oViewModel.setData(this.initializeModel());
          this.setContentsBusy(true, 'all');

          const curDate = new Date();
          oViewModel.setProperty('/startDailyDate', new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), '6', '0'));
          oViewModel.setProperty('/startMonthlyDate', new Date(curDate.getFullYear(), curDate.getMonth(), '1', '9', '0'));

          this.getTargetOrgList(this.getAppointeeProperty('Teamcode'), 'X');
          this.initializeDetailAppointmentPopover();
          this.setContentsBusy(false, 'all');
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'all');
        }
      },

      // onPressSearch() {},

      onPressExcelDownload() {},

      getCurrentLocationText() {
        return '팀근태 Calendar';
      },

      getBreadcrumbsLinks() {
        return [{ name: this.getBundleText('LABEL_01001') }]; // My Time
      },

      async initializeDetailAppointmentPopover() {
        const oView = this.getView();

        this._oDetailAppointmentPopover = await Fragment.load({
          id: oView.getId(),
          name: 'sap.ui.time.mvc.view.teamWorkStatus.fragment.DetailAppointmentPopover',
          controller: this,
        });

        oView.addDependent(this._oDetailAppointmentPopover);
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

      async handleCalendarSelect(oEvent) {
        const oViewModel = this.getViewModel();
        const vSelectedDate = oEvent.getSource().getSelectedDates()[0].getStartDate();
        oViewModel.setProperty('/startMonthlyDate', new Date(vSelectedDate.getFullYear(), vSelectedDate.getMonth(), '1', '9', '0'));
        oViewModel.setProperty('/startDailyDate', new Date(vSelectedDate.getFullYear(), vSelectedDate.getMonth(), vSelectedDate.getDate(), '9', '0'));
        await this.getWorkList();
      },

      /* MyTimeOrgTree 을 호출하여   조회 , 
         first : first 인 경우 본인 조직일 경우 Default select 처리
         최초 한번만 실행됨.
      */
      async getTargetOrgList(rOrgeh, rFirst = '') {
        const oViewModel = this.getViewModel();
        var vTargetList = [],
          vLevel1TreeList = [];

        try {
          const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeOrgTree', {
            Orgeh: rOrgeh,
            Datum: this.DateUtils.parse(new Date()),
          });

          for (var i = 0; i < aRowData.length; i++) {
            const selectedCheckBox = rFirst == 'X' && this.getAppointeeProperty('Teamcode') == aRowData[i].Orgeh ? true : false;
            vTargetList.push({
              Text: aRowData[i].Stext,
              Orgeh: aRowData[i].Orgeh,
              Childyn: aRowData[i].Childyn,
              Mssty: aRowData[i].Mssty,
              Uporgeh: aRowData[i].Uporgeh,
              TargetVisible: true,
              Selected: rFirst == 'X' && this.getAppointeeProperty('Teamcode') == aRowData[i].Orgeh ? true : false,
              Nodes: [],
              CheckChildYn: 'X', // OData Check 완료
            });

            const vTargetLength = vTargetList.length - 1;
            //하위 조직 조회
            // 해당 조직의 조직원 조회
            const rEmpList = await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty);
            if (rEmpList.length > 0) {
              for (let j = 0; j < rEmpList.length; j++) {
                rEmpList[j].Selected = selectedCheckBox;
                vTargetList[vTargetLength].Nodes.push(rEmpList[j]);
              }
            }

            if (aRowData[i].Childyn == 'X') {
              const { vTargetChildList, vLevel1Tree } = await this.getTargetOrgChildList(aRowData[i].Orgeh, rFirst);

              if (vTargetChildList && vTargetChildList.length > 0) {
                for (let j = 0; j < vTargetChildList.length; j++) {
                  vTargetList[vTargetLength].Nodes.push(vTargetChildList[j]);
                }
              }
              if (vLevel1Tree && vLevel1Tree.length > 0) {
                for (let j = 0; j < vLevel1Tree.length; j++) {
                  vLevel1TreeList.push(vLevel1Tree[j]);
                }
              }
            }
            // vTargetList.push(vTarget);
          }
          //1Level 적용
          if (vLevel1TreeList.length > 0) {
            for (let i = 0; i < vLevel1TreeList.length; i++) {
              vTargetList.push(vLevel1TreeList[i]);
            }
          }

          oViewModel.setProperty('/targetList', vTargetList);

          this.byId('TargetList').addEventDelegate({
            onAfterRendering: () => {
              if (this.first == '') {
                if (this.byId('TargetList').getItems() && this.byId('TargetList').getItems().length > 0) {
                  // this.byId("TargetList").getItems()[0].setExpanded(true);
                  this.byId('TargetList').onItemExpanderPressed(this.byId('TargetList').getItems()[0], true);
                  this.first = 'X';
                }
              }
            },
          });
          // 최초 Loading 시에만 Worklist 를 조회
          if (rFirst == 'X') {
            this.onSearchTeamWorkState();
          }
        } catch (oError) {
          throw oError;
        }
      },

      /*
        하위 부서를 조회 & 조회한 하위 부서의 하위 부서가 존재하는 지 확인
      */
      async getTargetOrgChildList(rOrgeh, rFirst = '') {
        const oViewModel = this.getViewModel();
        var vPromise = [],
          vTargetChildList = [],
          vMyTimeOrgTree = [],
          vLevel1Tree = [],
          vLevel1Count = 0,
          vTargetListCount = 1;
        if (oViewModel.getProperty('/targetList')) {
          vTargetListCount = oViewModel.getProperty('/targetList').length;
        }

        // 하위 부서 조회
        const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartTree', {
          Orgeh: rOrgeh,
          Datum: this.DateUtils.parse(new Date()),
          Vwtyp: '30',
          Subty: '3010',
          Otype: 'O',
          Rooto: rOrgeh,
        });

        for (let i = 0; i < aRowData.length; i++) {
          const vMyTimeOrgTreeAll = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeOrgTree', {
            Orgeh: aRowData[i].Orgeh,
            Datum: this.DateUtils.parse(new Date()),
          });

          // 겸직의 조직 코드는 제외하고 조회조건의 조직과 동일한 코드만 처리
          const vMyTimeOrgTree = vMyTimeOrgTreeAll.filter((o) => o.Orgeh === aRowData[i].Orgeh);

          // MyTimeOrgTree 의 Return 이 n 개 ( 중요 )
          // 하위 부서의 하위 부서가 존재하는지 확인
          for (var j = 0; j < vMyTimeOrgTree.length; j++) {
            // 하위 부서 객체 생성
            var vTargetChild = {
              Text: vMyTimeOrgTree[j].Stext,
              Orgeh: vMyTimeOrgTree[j].Orgeh,
              Childyn: vMyTimeOrgTree[j].Childyn,
              Mssty: vMyTimeOrgTree[j].Mssty,
              TargetVisible: true,
              Uporgeh: vMyTimeOrgTree[j].Uporgeh,
              Selected: rFirst == 'X' && this.getAppointeeProperty('Teamcode') == vMyTimeOrgTree[j].Orgeh ? true : false,
              CheckChildYn: '', // OData Check 를 하지 않음. 차후 Node 확장 버튼 클릭 시 호출
              Nodes: await this.getTargetEmpList(vMyTimeOrgTree[j].Orgeh, vMyTimeOrgTree[j].Mssty),
            };

            /* 하위 조직이 존재하지만 Nodes 가 비었을 때는 임시로 Nodes 를 채워줌 
                Nodes 가 하나라도 존재해야지 Collapse 버튼이 활성화
              */
            if (vTargetChild.Childyn == 'X' && vTargetChild.Nodes.length == 0) {
              vTargetChild.Nodes.push({
                Text: ' ',
                Orgeh: '123',
                TargetVisible: false,
              });
            }

            // 조직이 Level 1으로 구성되어야 하는지, Sort Order(배열에 해당조직이 위치한 순서) 를 계산하여 입력
            if (
              vTargetChild.Orgeh == this.getAppointeeProperty('Teamcode')
              // || vTargetChild.Uporgeh == this.getAppointeeProperty('Teamcode') // 정송이 수석에게 확인 필요. 해당 코드를 적용하면 본인 조직 아래의 조직도 같은 Level 로 보여짐
            ) {
              vLevel1Tree.push(vTargetChild);
              vLevel1Count++;
            } else {
              vTargetChildList.push(vTargetChild);
            }
          }

          // // 조직이 Level 1으로 구성되어야 하는지, Sort Order(배열에 해당조직이 위치한 순서) 를 계산하여 입력
          // if (
          //   vTargetChild.Orgeh == this.getAppointeeProperty('Teamcode') || // 정송이 수석에게 확인 필요. 해당 코드를 적용하면 본인 조직 아래의 조직도 같은 Level 로 보여짐
          //   vTargetChild.Uporgeh == this.getAppointeeProperty('Teamcode')
          // ) {
          //   vLevel1Tree.push(vTargetChild);
          //   vLevel1Count++;
          // } else {
          //   vTargetChildList.push(vTargetChild);
          // }
        }

        return { vTargetChildList: vTargetChildList, vLevel1Tree: vLevel1Tree };
      },

      /* 대상자 조직의 인원 조회 */
      async getTargetEmpList(rOrgeh, rMssty) {
        var aRowData = '[]',
          rEmpList = [];

        if (rMssty == 'X') {
          aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartEmpList', {
            Vwtyp: '30',
            Subty: '3010',
            Orgeh: rOrgeh,
            // Datum: this.DateUtils.parse(new Date())
          });
        } else {
          aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeEmp', {
            Vwtyp: '30',
            Subty: '3010',
            Orgeh: rOrgeh,
            Dchif: '',
            // Datum: this.DateUtils.parse(new Date())
          });
        }

        for (let i = 0; i < aRowData.length; i++) {
          rEmpList.push({
            Text: aRowData[i].Ename + ' ' + aRowData[i].Zzpsgrptx,
            Orgeh: aRowData[i].Orgeh,
            Pernr: aRowData[i].Pernr,
            Childyn: '',
            Mssty: '',
            TargetVisible: false,
            Uporgeh: '',
            Selected: false,
            CheckChildYn: '',
            Nodes: [],
          });
        }

        return rEmpList;
      },

      async onTreeToggle(oEvent) {
        const rIndex = oEvent.getParameters().itemContext.sPath;
        const vSelectTarget = this.getViewModel().getProperty(rIndex);
        const oViewModel = this.getViewModel();
        if (oEvent.getParameters().expanded == true && vSelectTarget.Childyn == 'X' && vSelectTarget.TargetVisible == true && vSelectTarget.CheckChildYn == '') {
          var vLevel1TreeList = [];

          try {
            const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeOrgTree', {
              Orgeh: vSelectTarget.Orgeh,
              Datum: this.DateUtils.parse(new Date()),
            });
            // Nodes 확장 버튼 활성화를 위한 임시 데이터 삭제
            vSelectTarget.Nodes = [];
            vSelectTarget.CheckChildYn = 'X'; // 다음 버튼 클릭 시 OData 호출을 하지 않게 하기 위한 flag
            for (var i = 0; i < aRowData.length; i++) {
              if (vSelectTarget.Orgeh == aRowData[i].Orgeh) {
              } else {
                vSelectTarget.Nodes.push({
                  Text: aRowData[i].Stext,
                  Orgeh: aRowData[i].Orgeh,
                  Childyn: aRowData[i].Childyn,
                  Mssty: aRowData[i].Mssty,
                  Uporgeh: aRowData[i].Uporgeh,
                  TargetVisible: true,
                  Selected: false,
                  Nodes: [],
                  CheckChildYn: 'X', // OData Check 완료
                });
              }

              //하위 조직 조회
              if (aRowData[i].Childyn == 'X') {
                const { vTargetChildList, vLevel1Tree } = await this.getTargetOrgChildList(aRowData[i].Orgeh, '');
                // 하위 조직이 존재하지 않을 경우에만
                if (vTargetChildList && vTargetChildList.length > 0) {
                  // 해당 조직의 조직원 조회
                  const rEmpList = await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty);
                  if (rEmpList.length > 0) {
                    for (let j = 0; j < rEmpList.length; j++) {
                      vSelectTarget.Nodes.push(rEmpList[j]);
                    }
                  }
                  for (let j = 0; j < vTargetChildList.length; j++) {
                    vSelectTarget.Nodes.push(vTargetChildList[j]);
                  }
                }
                if (vLevel1Tree && vLevel1Tree.length > 0) {
                  for (let j = 0; j < vLevel1Tree.length; j++) {
                    vLevel1TreeList.push(vLevel1Tree[j]);
                  }
                }
              } else {
                const rEmpList = await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty);
                if (rEmpList.length > 0) {
                  for (let j = 0; j < rEmpList.length; j++) {
                    vSelectTarget.Nodes.push(rEmpList[j]);
                  }
                }
              }
            }

            oViewModel.setProperty(rIndex, vSelectTarget);
            var vTargetList = oViewModel.getProperty('/targetList');

            //1Level 적용
            if (vLevel1TreeList.length > 0) {
              for (let i = 0; i < vLevel1TreeList.length; i++) {
                vTargetList.push(vLevel1TreeList[i]);
              }
            }

            oViewModel.setProperty('/targetList', vTargetList);
          } catch (oError) {
            throw oError;
          }
        } else if (oEvent.getParameters().expanded == true && vSelectTarget.Childyn == '' && vSelectTarget.TargetVisible == true && vSelectTarget.CheckChildYn == '') {
          // 조직 구성원 조회 조회
          const rEmpList = await this.getTargetEmpList(vSelectTarget.Orgeh, vSelectTarget.Mssty);
          vSelectTarget.Nodes = [];
          if (rEmpList.length > 0) {
            for (let j = 0; j < rEmpList.length; j++) {
              vSelectTarget.Nodes.push(rEmpList[j]);
            }
          }
          oViewModel.setProperty(rIndex, vSelectTarget);
        }
      },

      /* 선택된 조직-조직원의 근태 조회 */
      async getWorkList() {
        this.setContentsBusy(true, 'all');
        const oViewModel = this.getViewModel();
        var vTargetList = oViewModel.getProperty('/targetList'),
          vPromise = [],
          vSelectedOrgList = [],
          vBegda,
          vEndda;

        // ViewType 에 따라 Begda , Endda 조정
        const oViewType = oViewModel.getProperty('/viewType');
        if (oViewType === 'Monthly') {
          // Date 형식
          console.log(oViewModel.getProperty('/startMonthlyDate'));
          const sMonthlyCalendarStartDate = oViewModel.getProperty('/startMonthlyDate');
          const sYear = sMonthlyCalendarStartDate.getFullYear();
          const sMonth = String(sMonthlyCalendarStartDate.getMonth() + 1).padStart(2, '0');
          // 해당 월의 일수와 요일을 구합니다.
          const lastDayOfMonth = new Date(sYear, sMonth, 0);

          vBegda = this.DateUtils.parse(sMonthlyCalendarStartDate);
          vEndda = this.DateUtils.parse(lastDayOfMonth);
        } else {
          // Date 형식
          vBegda = this.DateUtils.parse(oViewModel.getProperty('/startDailyDate'));
          vEndda = this.DateUtils.parse(oViewModel.getProperty('/startDailyDate'));
        }

        for (var i = 0; i < vTargetList.length; i++) {
          if (vTargetList[i].TargetVisible == true) {
            if (vTargetList[i].Selected == true) {
              vSelectedOrgList.push(vTargetList[i].Orgeh);
            }
            if (vTargetList[i].Nodes && vTargetList[i].Nodes.length > 0) {
              this.collectOrgList(vTargetList[i].Nodes, vSelectedOrgList);
            }
          }
        }

        for (var i = 0; i < vSelectedOrgList.length; i++) {
          vPromise.push(
            await Client.deep(this.getModel(ServiceNames.MYTIME), 'MyNewTeamCal', {
              Orgeh: vSelectedOrgList[i],
              Begda: vBegda,
              Endda: vEndda,
              Werks: this.getAppointeeProperty('Persa'), // oViewModel.getProperty('/Werks'),
              MyNewTeamItem1: [{}],
              MyNewTeamItem2: [{}],
              MyNewTeamCal1: [{}],
            })
          );
        }

        const aResults = await Promise.all(vPromise);
        var oMyNewTeamCalItem = [];
        var oMyNewTeamCalItemArray = [];
        var oMyNewTeamItem = [];
        var oMyNewTeamItemHolCalendar = [];
        var oMonthlyAppointments = [];

        if (aResults.length > 0) {
          for (var k = 0; k < aResults.length; k++) {
            // 인원 정보
            if (aResults[k].MyNewTeamCal1 && aResults[k].MyNewTeamCal1.results && aResults[k].MyNewTeamCal1.results.length > 0) {
              oMyNewTeamCalItem = _.cloneDeep(aResults[k].MyNewTeamCal1.results);
            } else {
              break;
            }
            // 인원 별 근태
            if (aResults[k].MyNewTeamItem1 && aResults[k].MyNewTeamItem1.results && aResults[k].MyNewTeamItem1.results.length > 0) {
              oMyNewTeamItem = _.cloneDeep(aResults[k].MyNewTeamItem1.results);
            }

            // 달력
            if (aResults[k].MyNewTeamItem2 && aResults[k].MyNewTeamItem2.results && aResults[k].MyNewTeamItem2.results.length > 0) {
              oMyNewTeamItemHolCalendar = _.cloneDeep(aResults[k].MyNewTeamItem2.results).filter((o) => o.Holyn === 'X');
              if (oViewType === 'Daily') {
                // 공휴일 텍스트
                oViewModel.setProperty('/holidayText', aResults[k].MyNewTeamItem2.results[0].Ltext);
              }
            }

            for (var i = 0; i < oMyNewTeamCalItem.length; i++) {
              oMyNewTeamCalItem[i].MyNewTeamItem = [];
              for (var j = 0; j < oMyNewTeamItem.length; j++) {
                if (oMyNewTeamCalItem[i].Pernr == oMyNewTeamItem[j].Pernr) {
                  oMyNewTeamItem[j].Start = this.DateUtils.toDate(oMyNewTeamItem[j].Startdatetime);
                  oMyNewTeamItem[j].End = this.DateUtils.toDate(oMyNewTeamItem[j].Enddatetime);
                  oMyNewTeamItem[j].StartDate = oMyNewTeamItem[j].Startdatetime.substring(0, 8);
                  oMyNewTeamItem[j].EndDate = oMyNewTeamItem[j].Enddatetime.substring(0, 8);
                  oMyNewTeamItem[j].StartFormatted = moment(oMyNewTeamItem[j].Start).format('YYYY.MM.DD');
                  oMyNewTeamItem[j].EndFormatted = moment(oMyNewTeamItem[j].End).format('YYYY.MM.DD');
                  oMyNewTeamItem[j].Title = oMyNewTeamCalItem[i].Ename + '/' + oMyNewTeamItem[j].Awrsntx;
                  oMyNewTeamItem[j].Ename = oMyNewTeamCalItem[i].Ename;
                  oMyNewTeamItem[j].Type = this.coltyToType(oMyNewTeamItem[j].Colty);

                  // if (!oMyNewTeamCalItem[i].MyNewTeamItem) oMyNewTeamCalItem[i].MyNewTeamItem = [];
                  oMyNewTeamCalItem[i].MyNewTeamItem.push(oMyNewTeamItem[j]);
                  oMonthlyAppointments.push(oMyNewTeamItem[j]);
                }
              }
              oMyNewTeamCalItemArray.push(oMyNewTeamCalItem[i]);
            }
          }
        }

        // 월간 근태
        oViewModel.setProperty('/MonthlyAppointments', oMonthlyAppointments);
        // 일간 근태
        oViewModel.setProperty('/MyNewTeamCalItem', oMyNewTeamCalItemArray);
        // return Promise.all(vPromise);

        oViewModel.refresh();

        setTimeout(async () => {
          var elements = document.querySelectorAll('.sapMSPCMonthDay');

          for (var i = 0; i < oMyNewTeamItemHolCalendar.length; i++) {
            const YYYYMMDD = this.DateUtils.formatDateToYYYYMMDD(oMyNewTeamItemHolCalendar[i].Datum);
            for (var j = 0; j < elements.length; j++) {
              const element = elements[j];
              const elementYYYYMMDD = element.getAttribute('aria-labelledby').substring(0, 8);
              if (YYYYMMDD === elementYYYYMMDD) {
                $(element).addClass('calendarHolidayCell');
                const childElement = element.querySelector('.sapMSPCMonthDayNumber');
                if (childElement) {
                  childElement.innerText = _.toNumber(elementYYYYMMDD.substring(6, 8)) + 'ㅤ' + oMyNewTeamItemHolCalendar[i].Ltext;
                  $(childElement).addClass('calendarHolidayText');
                }
                break;
              }
            }
          }
          const aSelectMM = this.DateUtils.formatDateToYYYYMMDD(vBegda).substring(4, 6);

          for (var i = 0; i < elements.length; i++) {
            const element = elements[i];
            const elementMM = element.getAttribute('aria-labelledby').substring(4, 6);
            if (aSelectMM != elementMM) {
              $(element).addClass('calendarOtherMonthCell');
            }
          }
          var vdiElement = document.getElementById('container-ehr---teamWorkStatus--SPC1-Header-NavToolbar-PickerBtn-BDI-content');
          if (vdiElement) {
            vdiElement.textContent = vdiElement.textContent.substring(0, vdiElement.textContent.indexOf('월') + 1);
          }

          var elementsWeekNumbers = document.querySelectorAll('.sapMSPCMonthWeekNumber');
          for (var i = 0; i < elementsWeekNumbers.length; i++) {
            if (elementsWeekNumbers[i].innerHTML.indexOf('주') == -1) elementsWeekNumbers[i].innerHTML = elementsWeekNumbers[i].innerHTML + ' 주';
          }

          if (oViewType === 'Daily') {
            //   var elementTableRows = document.querySelectorAll('.sapUiCalendarRowApps');
            //   const vIsWeekend = vBegda.getDay();
            //   if (oViewModel.getProperty('/holidayText') != '') {
            //     for (var i = 0; i < elementTableRows.length; i++) {
            //       const elementTableRow = elementTableRows[i];
            //       $(elementTableRow).removeClass('calendarOtherMonthCell');
            //       $(elementTableRow).addClass('calendarHolidayCell');
            //     }
            //   } else if (vIsWeekend === 0 || vIsWeekend === 6) {
            //     for (var i = 0; i < elementTableRows.length; i++) {
            //       const elementTableRow = elementTableRows[i];
            //       $(elementTableRow).removeClass('calendarHolidayCell');
            //       $(elementTableRow).addClass('calendarOtherMonthCell');
            //     }
            //   } else {
            //     for (var i = 0; i < elementTableRows.length; i++) {
            //       const elementTableRow = elementTableRows[i];
            //       $(elementTableRow).removeClass('calendarHolidayCell');
            //       $(elementTableRow).removeClass('calendarOtherMonthCell');
            //     }
            //   }
            var elementTableCells = document.querySelectorAll('.sapUiCalendarRowAppsInt');
            const vIsWeekend = vBegda.getDay();
            if (oViewModel.getProperty('/holidayText') != '') {
              for (var i = 0; i < elementTableCells.length; i++) {
                const elementTableCell = elementTableCells[i];
                const index = elementTableCell.id.indexOf('AppsInt') + 7;
                if (_.toNumber(elementTableCell.id.substring(index, elementTableCell.id.length)) < 18) {
                  $(elementTableCell).removeClass('calendarOtherMonthCell');
                  $(elementTableCell).addClass('calendarHolidayCell');
                }
              }
            } else if (vIsWeekend === 0 || vIsWeekend === 6) {
              for (var i = 0; i < elementTableCells.length; i++) {
                const elementTableCell = elementTableCells[i];
                const index = elementTableCell.id.indexOf('AppsInt') + 7;
                if (_.toNumber(elementTableCell.id.substring(index, elementTableCell.id.length)) < 18) {
                  $(elementTableCell).removeClass('calendarHolidayCell');
                  $(elementTableCell).addClass('calendarOtherMonthCell');
                }
              }
            } else {
              for (var i = 0; i < elementTableCells.length; i++) {
                const elementTableCell = elementTableCells[i];
                $(elementTableCell).removeClass('calendarHolidayCell');
                $(elementTableCell).removeClass('calendarOtherMonthCell');
              }
            }
          }

          this.setContentsBusy(false, 'all');
        }, 0);
      },

      async isWeekend(_date) {
        const someday = new Date();
        const dayOfWeek = someday.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

        // 토요일(6) 또는 일요일(0)일 경우 주말
        return dayOfWeek === 0 || dayOfWeek === 6;
      },

      coltyToType(vColty) {
        switch (vColty) {
          case 'A':
            vColty = 'Type01';
            break;
          case 'B': // 교육
            vColty = 'Type02';
            break;
          case 'C':
            vColty = 'Type03';
            break;
          case 'D':
            vColty = 'Type04';
            break;
          case 'F': // 근무
            vColty = 'Type05';
            break;
          default:
            vColty = 'Type06';
            break;
        }

        return vColty;
      },

      collectOrgList(rNode, rSelectedOrgList) {
        for (var i = 0; i < rNode.length; i++) {
          if (rNode[i].TargetVisible == true) {
            if (rNode[i].Selected == true) {
              rSelectedOrgList.push(rNode[i].Orgeh);
            }
            if (rNode[i].Nodes && rNode[i].Nodes.length > 0) {
              this.collectOrgList(rNode[i].Nodes, rSelectedOrgList);
            }
          }
        }
      },

      collectValuesInNestedArray(arr) {
        let resultPromise = []; // Select 한 조직만 Promise

        function helper(current) {
          if (Array.isArray(current)) {
            for (let item of current) {
              helper(item); // 배열인 경우 재귀 호출
            }
          } else if (typeof current === 'object' && current !== null) {
            for (let key in current) {
              helper(current[key]); // 객체인 경우 재귀 호출
            }
          } else if (current === target) {
            result.push(current); // 찾은 값 추가
          }
        }

        helper(arr); // 초기 배열을 전달
        return resultPromise; // 결과 배열 반환
      },

      setTaskItem() {},

      /* 선택된 조직-조직원의 근태 조회 */
      async onSearchTeamWorkState(oEvent) {
        const oViewModel = this.getViewModel();
        const vTargetList = oViewModel.getProperty('/targetList');
        const vRoot = { children: [] };
        var vPromise = [];

        this.setContentsBusy(true);
        const workList = await this.getWorkList();
        this.setContentsBusy(false);
      },

      async onPressChangeViewTypeToMonthly() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/viewType', 'Monthly');
        // Daily 로

        await this.getWorkList();
      },

      async onPressChangeViewTypeToDaily() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/viewType', 'Daily');
        // this.getDailyDataFromMontly();
        await this.getWorkList();
      },

      async handleMoreLinkPress(oEvent) {
        const oViewModel = this.getViewModel();
        const oDate = oEvent.getParameter('date');
        oViewModel.setProperty('/viewType', 'Daily');
        oViewModel.setProperty('/startDailyDate', new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), '6', '0'));
        await this.getWorkList();
      },

      async changeDailyStartDate(oEvent) {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/startMonthlyDate', new Date(oViewModel.getProperty('/startDailyDate').getFullYear(), oViewModel.getProperty('/startDailyDate').getMonth(), '1', '9', '0'));
        await this.getWorkList();
      },

      async changeMonthlyStartDate(oEvent) {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/startMonthlyDate', new Date(oEvent.getParameters().date.getFullYear(), oEvent.getParameters().date.getMonth(), '1', '9', '0'));
        await this.getWorkList();
      },

      async getDailyDataFromMontly() {
        const oViewModel = this.getViewModel();
        const oSelectDailyDate = this.DateUtils.formatDateToYYYYMMDD(oViewModel.getProperty('/startDailyDate'));
      },

      async handleAppointmentSelect(oEvent) {
        const oViewModel = this.getViewModel();
        const oAppointment = oEvent.getParameter('appointment');

        if (oAppointment === undefined) {
          return;
        }

        if (!oAppointment.getSelected()) {
          this._oDetailAppointmentPopover.close();
          return;
        }

        const aDetailAppointData = _.cloneDeep(oViewModel.getProperty(oEvent.getParameter('appointment').getBindingContext().sPath));
        oViewModel.setProperty('/DetailAppointData', aDetailAppointData);

        this._oDetailAppointmentPopover.openBy(oAppointment);
      },

      async clickMoreInfo(oEvent) {
        const oViewModel = this.getViewModel();
        console.log(oEvent.getParameters().date);
      },
    });
  }
);
