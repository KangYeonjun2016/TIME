sap.ui.define(
  [
    //
    'sap/ui/time/common/AppUtils',
    'sap/ui/time/mvc/controller/BaseController',
    'sap/ui/time/common/odata/Client',
    'sap/ui/time/common/odata/ServiceNames',
    'sap/base/Log',
    "sap/gantt/misc/Format",
    "sap/ui/core/Fragment",
    "sap/ui/time/control/Tooltip",
	  "sap/gantt/library"
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
    GanttLibrary
  ) => {
    'use strict';

    return BaseController.extend('sap.ui.time.mvc.controller.teamWorkingState.Main', {
      first : "",

      initializeModel() {
        return {
          contentsBusy: false,
          listInfo: {
            rowCount: 1,
          },
          list: [],          
          // targetList : [
          //   {
          //     "text": "HCM팀",
          //     "targetVisble" : true,
          //     "selected": false,
          //     "orgId" : "1",
          //     "nodes":[
          //       {
          //         "text": "이석재 팀장",
          //         "targetVisble" : false,
          //         "orgId" : "1",
          //         "pernr" : "1-1",
          //         "selected": false
          //       },
          //       {
          //         "text": "김홍렬 수석",
          //         "targetVisble" : false,
          //         "orgId" : "1",
          //         "pernr" : "1-2",
          //         "selected": false
          //       },
          //       {
          //         "text": "박진수 수석",
          //         "targetVisble" : false,
          //         "orgId" : "1",
          //         "pernr" : "1-3",
          //         "selected": false
          //       },
          //       {
          //         "text": "백광현 수석",
          //         "targetVisble" : false,
          //         "orgId" : "1",
          //         "pernr" : "1-4",
          //         "selected": false
          //       },
          //     ]
          //   },
          //   {
          //     "text": "HCM팀 GHRIS Part",
          //     "targetVisble" : true,
          //     "selected": false,
          //     "orgId" : "2",
          //     "nodes":[
          //       {
          //         "text": "김보슬 수석",
          //         "targetVisble" : false,
          //         "orgId" : "2",
          //         "pernr" : "2-1",
          //         "selected": false
          //       },
          //       {
          //         "text": "옥지선 수석",
          //         "targetVisble" : false,
          //         "orgId" : "2",
          //         "pernr" : "2-2",
          //         "selected": false
          //       },
          //       {
          //         "text": "임미정 수석",
          //         "targetVisble" : false,
          //         "orgId" : "2",
          //         "pernr" : "2-3",
          //         "selected": false
          //       },
          //       {
          //         "text": "정송이 수석",
          //         "targetVisble" : false,
          //         "orgId" : "2",
          //         "pernr" : "2-4",
          //         "selected": false
          //       },
          //       {
          //         "text": "조민구 수석",
          //         "targetVisble" : false,
          //         "orgId" : "2",
          //         "pernr" : "2-5",
          //         "selected": false
          //       }
          //     ]
          //   },
          //   {
          //     "text": "HCM팀 Peoply Part",
          //     "targetVisble" : true,
          //     "orgId" : "3",
          //     "selected": false,
          //     "nodes":[
          //       {
          //         "text": "김보슬2 수석",
          //         "targetVisble" : false,
          //         "orgId" : "3",
          //         "pernr" : "3-1",
          //         "selected": false
          //       },
          //       {
          //         "text": "옥지선2 수석",
          //         "targetVisble" : false,
          //         "orgId" : "3",
          //         "pernr" : "3-2",
          //         "selected": false
          //       },
          //       {
          //         "text": "임미정2 수석",
          //         "targetVisble" : false,
          //         "orgId" : "3",
          //         "pernr" : "3-3",
          //         "selected": false
          //       },
          //       {
          //         "text": "정송이2 수석",
          //         "targetVisble" : false,
          //         "orgId" : "3",
          //         "pernr" : "3-4",
          //         "selected": false
          //       },
          //       {
          //         "text": "조민구2 수석",
          //         "targetVisble" : false,
          //         "orgId" : "3",
          //         "pernr" : "3-5",
          //         "selected": false
          //       }
          //     ]
          //   }
          // ],
          targetList : [],
          TimeTypes : [
            { Colty: "F", Coltytx: "근무"},
            { Colty: "A", Coltytx: "휴가/휴무"},
            { Colty: "B", Coltytx: "교육/출장/기타근무"},
            { Colty: "C", Coltytx: "휴직"},
          ],
          startDate:  new Date("2024", "7", "24", "08", "00"),
          startNumber:  "",
          endNumber:  "",
          startWorkingNumber:  "20240825083000",
          endWorkingNumber:  "20240826173000",
          startDateText:  "",
          root: {
            children: []
          },

          selectDateText : "",
          selectDateText1 : "<" ,
          selectDateText2 : ">",
          selectDateText3 : "오늘",


          oProportionTimeLineOptions : {
            "50Milliseconds": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.millisecond,
                span: 50,
                range: 90,
                selector: function (diff) {
                  return diff >= 35;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 1,
                pattern: "ha / HH:mm:ss"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.millisecond,
                span: 50,
                pattern: "SSS"
              }
            },
            "100Milliseconds": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.millisecond,
                span: 100,
                range: 90,
                selector: function (diff) {
                  return diff >= 30;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 1,
                pattern: "ha / HH:mm:ss"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.millisecond,
                span: 100,
                pattern: "SSS"
              }
            },
            "500Milliseconds": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.millisecond,
                span: 500,
                range: 90,
                selector: function (diff) {
                  return diff >= 60;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 1,
                pattern: "ha / HH:mm:ss"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.millisecond,
                span: 500,
                pattern: "SSS"
              }
            },
            "1seconds": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 1,
                range: 90,
                selector: function (diff) {
                  return diff >= 25;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.minute,
                span: 1,
                pattern: "ha / HH:mm"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 1,
                pattern: "ss"
              }
            },
            "5seconds": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 5,
                range: 90,
                selector: function (diff) {
                  return diff >= 45;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.minute,
                span: 1,
                pattern: "ha / HH:mm"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 5,
                pattern: "ss"
              }
            },
            "15seconds": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 15,
                range: 90,
                selector: function (diff) {
                  return diff >= 35;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.minute,
                span: 1,
                pattern: "ha / HH:mm"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 15,
                pattern: "ss"
              }
            },
            "30seconds": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 30,
                range: 90,
                selector: function (diff) {
                  return diff >= 60;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.minute,
                span: 1,
                pattern: "ha / HH:mm"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.second,
                span: 30,
                pattern: "ss"
              }
            },
            "1min": {
              innerInterval: {
                unit: GanttLibrary.config.TimeUnit.day,
                span: 1,
                range: 10,
                selector: function (diff) {
                  return diff >= 10;
                }
              },
              largeInterval: {
                unit: GanttLibrary.config.TimeUnit.day,
                span: 1,
                pattern: "cccc dd.M.yyyy"
              },
              smallInterval: {
                unit: GanttLibrary.config.TimeUnit.hour ,
                span: 1,
                pattern: "HH:mm",
                relativeTime: false
              }
            }
          }
        }
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
          this.setContentsBusy(true);    
          this.handleSelectToday();
          // setTimeout(() => this.getTargetOrgList( this.getAppointeeProperty('Teamcode'), "X" ), 0);

          this.getTargetOrgList( this.getAppointeeProperty('Teamcode'), "X" );
          this.setContentsBusy(false);
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/busy', false);
        }
      },

      // onPressSearch() {},

      onPressExcelDownload() {},

      getCurrentLocationText() {
        return "팀 근무 현황"; // 팀 근무 현황
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

      handleCalendarSelect(oEvent){
        const oCalendar = oEvent.getSource();
        var vSelectedDate = new Date();
        

        if(oEvent.getParameters().didSelect == true){
          vSelectedDate =  new Date(oEvent.getParameters().date);
        }

        this.calCalendarSelect(vSelectedDate);
      },


      handleSelectToday() {
        var oCalendar = this.byId("calendar");
        oCalendar.unselectAllDates();
        this.calCalendarSelect(new Date());
      },

      handleSelectYesterday() {
        const oViewModel = this.getViewModel();
        var oCalendar = this.byId("calendar"),
            yesterday = oViewModel.getProperty("/startDate");
            yesterday.setDate(yesterday.getDate() - 1);
        oCalendar.unselectAllDates();
        // oCalendar.

        /*
        var selectedDate = new Date(2024, 7, 16); // Example date: August 26, 2024

          // Use the setSelectedDates method to select the date
          // oCalendar.setSelectedDates([
          //     new sap.ui.unified.DateRange({
          //         startDate: selectedDate,
          //         endDate: selectedDate
          //     })
          // ]);

        var formattedDate = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "yyyy-MM-dd"
        }).format(selectedDate);

          oCalendar.fireTapOnDate({
            date: selectedDate
        });
        */
        this.calCalendarSelect(yesterday);
        
      },

      handleSelectTomorrow() {
        const oViewModel = this.getViewModel();
        var oCalendar = this.byId("calendar"),
            tomorrow = oViewModel.getProperty("/startDate");
            tomorrow.setDate(tomorrow.getDate() + 1);
        oCalendar.unselectAllDates();
        this.calCalendarSelect(tomorrow);
        
      },

      calCalendarSelect(vSelectedDate){
        var oCalendar = this.byId("calendar");
        const oViewModel = this.getViewModel();
        var   vStartDate = "",
              vStartNumber = "",
              vEndNumber = "",
              vStartDateText = "",
              vStartWorkingNumber = "",
              vEndWorkingNumber = "",
              tomorrow = new Date(vSelectedDate);
              tomorrow.setDate(vSelectedDate.getDate() + 1);

        vStartNumber = "" + vSelectedDate.getFullYear() + this.calMonth(vSelectedDate.getMonth()) + this.calDate(vSelectedDate.getDate()) + "060000";
        vEndNumber =  "" + tomorrow.getFullYear() + this.calMonth(tomorrow.getMonth()) + this.calDate(tomorrow.getDate()) + "060000";
        vStartWorkingNumber = "" + vSelectedDate.getFullYear() + this.calMonth(vSelectedDate.getMonth()) + this.calDate(vSelectedDate.getDate()) + "090000";
        vEndWorkingNumber = "" + vSelectedDate.getFullYear() + this.calMonth(vSelectedDate.getMonth()) + this.calDate(vSelectedDate.getDate()) + "180000";

        const vDay = this.calDay(vSelectedDate.getDay());
        vStartDateText = "" + this.calMonth(vSelectedDate.getMonth()) + "." + this.calDate(vSelectedDate.getDate()) + " (" + vDay +")";

        oViewModel.setProperty('/startDate',vSelectedDate );
        oViewModel.setProperty('/startNumber',Format.abapTimestampToDate(vStartNumber));
        oViewModel.setProperty('/endNumber',Format.abapTimestampToDate(vEndNumber));
        oViewModel.setProperty('/startNumber',vStartNumber);
        oViewModel.setProperty('/endNumber',vEndNumber);
        oViewModel.setProperty('/startWorkingNumber',vStartWorkingNumber );
        oViewModel.setProperty('/endWorkingNumber',vEndWorkingNumber );
        oViewModel.setProperty('/startDateText',vStartDateText );        

        var oDailyWorkStateGantt = this.byId("DailyWorkStateGantt");
        oDailyWorkStateGantt.removeAllItems();
        oDailyWorkStateGantt.destroyItems();

        if (this._oFragment) {
          // Fragment가 추가된 컨테이너에서 Fragment를 제거합니다.
          this.getView().byId("DailyWorkStateGantt").removeItem(this._oFragment);
          this._oFragment.destroy(); // Fragment의 리소스를 해제합니다.
          this._oFragment = null; // 참조를 해제합니다.
        }


        Fragment.load({
          id: this.getView().getId(),
          name: "sap.ui.time.mvc.view.teamWorkingState.fragment.DailyWorkStateGantt",
          controller: this
        }).then(function (oFragment) {
            // 로드된 Fragment를 컨트롤러에 저장합니다.
            this._oFragment = oFragment;
            // Fragment를 컨테이너에 추가합니다.
            this.getView().byId("DailyWorkStateGantt").addItem(this._oFragment);
            this.byId("gantt").getAxisTimeStrategy().getVisibleHorizon().setStartTime(Format.abapTimestampToDate(vStartNumber));
            this.byId("gantt").getAxisTimeStrategy().getTotalHorizon().setStartTime(Format.abapTimestampToDate(vStartNumber));
            this.byId("gantt").getAxisTimeStrategy().getVisibleHorizon().setEndTime(Format.abapTimestampToDate(vEndNumber));
            this.byId("gantt").getAxisTimeStrategy().getTotalHorizon().setEndTime(Format.abapTimestampToDate(vEndNumber));


            // if(this.byId("proportion")){

            //   const oProportionTimeLineOptions = oViewModel.getProperty('/oProportionTimeLineOptions')
            //   var oProportion = this.byId("proportion");
            //   // oProportion.setTimeLineOptions(oProportionTimeLineOptions);
            //   oProportion.setTimeLineOption(oProportionTimeLineOptions["1min"]);

            //   // oProportion.setCoarsestTimeLineOption(oProportionTimeLineOptions["1min"]);
            //   // oProportion.setFinestTimeLineOption(oProportionTimeLineOptions["1min"]);

            // }



            // this.byId("GanttChartContainer").addEventDelegate({
            //   onAfterRendering: () => {
            //     var elements = document.querySelectorAll('.sapGanttTimeHeaderSvgText1');
            //     elements.forEach(function(element) {
            //         if (element.innerHTML.substring(0,5) === "00:00") {
            //             const remainingString = element.innerHTML.substring(5);
            //             element.innerHTML = '24:00' + remainingString;
            //         }
            //     });
            //   },
            // });
    

        }.bind(this));

        this.onSearchTeamWorkState();

      },
      
      hanleDateChangeWorkState (oEvent){
        var oStatePanel = oEvent.getSource();
        const oPC1 = oEvent.getSource();
        const vSelectStartDate = oEvent.getSource().getStartDate();
        oPC1.setStartDate(new Date(vSelectStartDate.getFullYear(), vSelectStartDate.getMonth(), vSelectStartDate.getDate(), "08" , "00"));
        


        Log.error("Running the app with mock data");
      },
      
      calMonth(rMonth){
        if(rMonth + 1 < 10)
          return "0" + ( rMonth + 1 );
        else
          return "" + ( rMonth + 1 );
      },

      calDate(rDate){
        if(rDate < 10)
          return "0" + rDate;
        else
          return "" + rDate;
      },

      calDay(rDay){
        switch(rDay){
          case 0 :
            rDay = "일";
            break;
          case 1 :
            rDay = "월";
            break;
          case 2 :
            rDay = "화";
            break;
          case 3 :
            rDay = "수";
            break;
          case 4 :
            rDay = "목";
            break;
          case 5 :
            rDay = "금";
            break;
          case 6 :
            rDay = "토";
            break;
        }

        return rDay;
      },


      formatTooltip: function (sText) {
        return new CustomTooltip({
            text: sText,
            openDelay : 100,
            offset : "10 -5",
            closeDuration : 0
        });
      },

      fnTimeConverter : function (sTimestamp) {
        return Format.abapTimestampToDate(sTimestamp);
      },

      async onPressSearch() {
        const oViewModel = this.getViewModel();

        try {
          oViewModel.setProperty('/busy', true);
          await this.retrieveList();
        } catch (oError) {
          this.debug('Controller > Attendance List > onPressSearch Error', oError);

          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/busy', false);
        }
      },


      /* MyTimeOrgTree 을 호출하여   조회 , 
         first : first 인 경우 본인 조직일 경우 Default select 처리
         최초 한번만 실행됨.
      */
      async getTargetOrgList(rOrgeh,  rFirst = "" ) {
        const oViewModel = this.getViewModel();
        var vTargetList = [],
            vLevel1TreeList = [];

        try {
          const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeOrgTree', {
            Orgeh: rOrgeh,
            Datum: this.DateUtils.parse(new Date())
          });

          for(var i=0;i<aRowData.length;i++){
            vTargetList.push({
              "Text"  : aRowData[i].Stext,
              "Orgeh" : aRowData[i].Orgeh,
              "Childyn" : aRowData[i].Childyn,
              "Mssty" : aRowData[i].Mssty,
              "Uporgeh" : aRowData[i].Uporgeh,
              "TargetVisble" : true,
              "Selected" : rFirst =="X" && this.getAppointeeProperty('Teamcode') == aRowData[i].Orgeh ? true : false,
              // "Nodes" : await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty),
              "Nodes" : [],
              "CheckChildYn" : "X"  // OData Check 완료
            });

            const vTargetLength = vTargetList.length - 1;
            //하위 조직 조회
            if(aRowData[i].Childyn == "X"){
              const { vTargetChildList , vLevel1Tree }   = await this.getTargetOrgChildList(aRowData[i].Orgeh, rFirst);
              if(vTargetChildList && vTargetChildList.length > 0){
                // 해당 조직의 조직원 조회
                const rEmpList = await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty);
                if(rEmpList.length > 0){
                  for(let j=0; j<rEmpList.length; j++){
                    vTargetList[vTargetLength].Nodes.push(rEmpList[j]);
                  }
                }
                for(let j=0; j<vTargetChildList.length; j++){
                  vTargetList[vTargetLength].Nodes.push(vTargetChildList[j]);
                }
              }
              if(vLevel1Tree && vLevel1Tree.length > 0){ 
                for(let j=0; j<vLevel1Tree.length; j++){
                  vLevel1TreeList.push(vLevel1Tree[j]);
                }
              }
            }else{
              const rEmpList = await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty);
                if(rEmpList.length > 0){
                  // vTargetList[vTargetLength].Nodes.push(rEmpList);
                  for(let j=0; j<rEmpList.length; j++){
                    vTargetList[vTargetLength].Nodes.push(rEmpList[j]);
                  }
                }
            }
            // vTargetList.push(vTarget);

          }
          //1Level 적용
          if(vLevel1TreeList.length > 0){
            for(let i=0; i<vLevel1TreeList.length; i++){
              vTargetList.push(vLevel1TreeList[i]);
            }
          }

          oViewModel.setProperty('/targetList', vTargetList);

          this.byId("TargetList").addEventDelegate({
            onAfterRendering: () => {
              if(this.first == ""){
                if(this.byId("TargetList").getItems() && this.byId("TargetList").getItems().length > 0){
                  // this.byId("TargetList").getItems()[0].setExpanded(true);
                  this.byId("TargetList").onItemExpanderPressed(this.byId("TargetList").getItems()[0], true);
                  this.first = "X";
                }
              }
              
            }
          });
          // 최초 Loading 시에만 Worklist 를 조회
          if(rFirst == "X"){
            this.onSearchTeamWorkState();
          }
            
        } catch (oError) {
          throw oError;
        }
      }, 

      /*
        하위 부서를 조회 & 조회한 하위 부서의 하위 부서가 존재하는 지 확인
      */
      async getTargetOrgChildList(rOrgeh, rFirst = "" ){
        const oViewModel = this.getViewModel();
        var vPromise = [], vTargetChildList = [], vMyTimeOrgTree = [], vLevel1Tree = [], vLevel1Count = 0,  vTargetListCount = 1;
        if(oViewModel.getProperty('/targetList')){
          vTargetListCount = oViewModel.getProperty('/targetList').length;
        }
        
        // 하위 부서 조회
        const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartTree', {
          Orgeh: rOrgeh,
          Datum: this.DateUtils.parse(new Date()),
          Vwtyp : "30",
          Subty : "3010",
          Otype : "O", 
          Rooto : rOrgeh
        });

        for(let i=0; i<aRowData.length; i++){
          
          var vTargetChild = {
            "Text"  : aRowData[i].Stext,
            "Orgeh" : aRowData[i].Orgeh,
            "Childyn" : "",
            "Mssty" : "",
            "TargetVisble" : true,
            "Uporgeh" : "",
            "Selected" : rFirst =="X" && this.getAppointeeProperty('Teamcode') == aRowData[i].Orgeh ? true : false,
            "CheckChildYn" : "", // OData Check 를 하지 않음. 차후 Node 확장 버튼 클릭 시 호출
            /* 하위 조직이 존재하지만 Nodes 가 비었을 때는 임시로 Nodes 를 채워줌 
              Nodes 가 하나라도 존재해야지 Collapse 버튼이 활성화
            */
            "Nodes" : [{
              Text : " ",
              Orgeh : "123",
              TargetVisble : false
            }] ,
          };

          // 조직이 Level 1으로 구성되어야 하는지, Sort Order(배열에 해당조직이 위치한 순서) 를 계산하여 입력
          if(vTargetChild.Orgeh == this.getAppointeeProperty('Teamcode') 
            // ||  정송이 수석에게 확인 필요. 해당 코드를 적용하면 본인 조직 아래의 조직도 같은 Level 로 보여짐 
            // vTargetChild.Uporgeh == this.getAppointeeProperty('Teamcode')
            ){
            vLevel1Tree.push(vTargetChild);
            vLevel1Count++;
          }else{
            vTargetChildList.push(vTargetChild);
          }
        }

        return {"vTargetChildList" : vTargetChildList, "vLevel1Tree" : vLevel1Tree};
      },

      // async getTargetOrgChildList(rOrgeh, rFirst = "" ){
      //   const oViewModel = this.getViewModel();
      //   var vPromise = [], vTargetChildList = [], vMyTimeOrgTree = [], vLevel1Tree = [], vLevel1Count = 0,  vTargetListCount = 1;
      //   if(oViewModel.getProperty('/targetList')){
      //     vTargetListCount = oViewModel.getProperty('/targetList').length;
      //   }
        
      //   // 하위 부서 조회
      //   const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartTree', {
      //     Orgeh: rOrgeh,
      //     Datum: this.DateUtils.parse(new Date()),
      //     Vwtyp : "30",
      //     Subty : "3010",
      //     Otype : "O", 
      //     Rooto : rOrgeh
      //   });

      //   for(let i=0; i<aRowData.length; i++){
          
      //     const vMyTimeOrgTree = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeOrgTree', {
      //       Orgeh: aRowData[i].Orgeh,
      //       Datum: this.DateUtils.parse(new Date())
      //     })
      //     // MyTimeOrgTree 의 Return 이 n 개 ( 중요 )
      //     // 하위 부서의 하위 부서가 존재하는지 확인
      //     for(var j=0; j<vMyTimeOrgTree.length;j++){
      //       // 하위 부서 객체 생성
      //       var vTargetChild = {
      //         "Text"  : vMyTimeOrgTree[j].Stext,
      //         "Orgeh" : vMyTimeOrgTree[j].Orgeh,
      //         "Childyn" : vMyTimeOrgTree[j].Childyn,
      //         "Mssty" : vMyTimeOrgTree[j].Mssty,
      //         "TargetVisble" : true,
      //         "Uporgeh" : vMyTimeOrgTree[j].Uporgeh,
      //         "Selected" : rFirst =="X" && this.getAppointeeProperty('Teamcode') == vMyTimeOrgTree[j].Orgeh ? true : false,
      //         "CheckChildYn" : "", // OData Check 를 하지 않음. 차후 Node 확장 버튼 클릭 시 호출
      //         "Nodes" : await this.getTargetEmpList(vMyTimeOrgTree[j].Orgeh, vMyTimeOrgTree[j].Mssty) ,
      //       };

      //       /* 하위 조직이 존재하지만 Nodes 가 비었을 때는 임시로 Nodes 를 채워줌 
      //         Nodes 가 하나라도 존재해야지 Collapse 버튼이 활성화
      //       */
      //       if( vTargetChild.Childyn == "X" && vTargetChild.Nodes.length ==  0){
      //         vTargetChild.Nodes.push({
      //           "Text" : " ",
      //           "Orgeh" : "123",
      //           "TargetVisble" : false,
      //         });
      //       }
      //     }

      //     // 조직이 Level 1으로 구성되어야 하는지, Sort Order(배열에 해당조직이 위치한 순서) 를 계산하여 입력
      //     if(vTargetChild.Orgeh == this.getAppointeeProperty('Teamcode') 
      //       // ||  정송이 수석에게 확인 필요. 해당 코드를 적용하면 본인 조직 아래의 조직도 같은 Level 로 보여짐 
      //       // vTargetChild.Uporgeh == this.getAppointeeProperty('Teamcode')
      //       ){
      //       vLevel1Tree.push(vTargetChild);
      //       vLevel1Count++;
      //     }else{
      //       vTargetChildList.push(vTargetChild);
      //     }
      //   }

      //   return {"vTargetChildList" : vTargetChildList, "vLevel1Tree" : vLevel1Tree};
      // },
      

      // Promise 를 쓰는 경우 
      // async getTargetOrgChildList(rOrgeh, rFirst = "" , rSortOrder = "0"){
      //   const oViewModel = this.getViewModel();
      //   var vPromise = [], vTargetChildList = [], vMyTimeOrgTree = [], vLevel1Tree = [], vLevel1Count = 0,  vTargetListCount = 1;
      //   if(oViewModel.getProperty('/targetList')){
      //     vTargetListCount = oViewModel.getProperty('/targetList').length;
      //   }
        
      //   // 하위 부서 조회
      //   const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartTree', {
      //     Orgeh: rOrgeh,
      //     Datum: this.DateUtils.parse(new Date()),
      //     Vwtyp : "30",
      //     Subty : "3010",
      //     Otype : "O", 
      //     Rooto : rOrgeh
      //   });

      //   // 조회한 하위 부서의 하위 부서가 존재하는 지 확인
      //   for(var i=0; i<aRowData.length; i++){
      //     vPromise.push(
      //       await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeOrgTree', {
      //         Orgeh: aRowData[i].Orgeh,
      //         Datum: this.DateUtils.parse(new Date())
      //       })
      //     );
      //   }

      //   vMyTimeOrgTree = await Promise.all(vPromise);

      //   for(let i=0; i<aRowData.length; i++){
      //     // 하위 부서 객체 생성
      //     var vTargetChild = {
      //       "Text"  : aRowData[i].Stext,
      //       "Orgeh" : aRowData[i].Orgeh,
      //       "Childyn" : "",
      //       "Mssty" : "",
      //       "TargetVisble" : true,
      //       "Uporgeh" : "",
      //       "Selected" : rFirst =="X" && this.getAppointeeProperty('Teamcode') == aRowData[i].Orgeh ? true : false,
      //       "CheckChildYn" : "X",
      //       "Nodes" : await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty) ,
      //       "SortOrder" : ""
      //     };

      //     // 하위 부서의 하위 부서가 존재하는지 확인
      //     for(var j=0; j<vMyTimeOrgTree.length;j++){
      //       if(aRowData[i].Orgeh == vMyTimeOrgTree[j].Orgeh){
      //           vTargetChild.Childyn = vMyTimeOrgTree[j].Childyn;
      //           vTargetChild.Mssty = vMyTimeOrgTree[j].Mssty;
      //           vTargetChild.Uporgeh = vMyTimeOrgTree[i][0].Uporgeh;
      //           /* 하위 조직이 존재하지만 Nodes 가 비었을 때는 임시로 Nodes 를 채워줌 
      //              Nodes 가 하나라도 존재해야지 Collapse 버튼이 활성화
      //           */
      //           if( vTargetChild.Childyn == "X" && vTargetChild.Nodes.length ==  0){
      //             vTargetChild.Nodes.push({
      //               "Text" : " ",
      //               "Orgeh" : "123",
      //               "TargetVisble" : false,
      //             });
      //           }
      //           break;
      //       }
      //     }

      //     // 조직이 Level 1으로 구성되어야 하는지, Sort Order(배열에 해당조직이 위치한 순서) 를 계산하여 입력
      //     if(vTargetChild.Orgeh == this.getAppointeeProperty('Teamcode') || vTargetChild.Uporgeh == this.getAppointeeProperty('Teamcode')){
      //       vTargetChild.SortOrder = "" + ( vTargetListCount + vLevel1Count );
      //       vLevel1Tree.push(vTargetChild);
      //       vLevel1Count++;
      //     }else{
      //       vTargetChild.SortOrder = rSortOrder + "|" + i ;
      //       vTargetChildList.push(vTargetChild);
      //     }
      //   }

      //   return {"vTargetChildList" : vTargetChildList, "vLevel1Tree" : vLevel1Tree};
      // },

       /* 대상자 조직의 인원 조회 */
       async getTargetEmpList(rOrgeh, rMssty) {
        var aRowData = '[]', vDchif ="", rEmpList = [];
        // if(rMssty == "X"){
        //   callODataEntity = 'OrgChartEmpList';
        //   vDchif = 'X';
        // }
        
        if(rMssty == "X"){
          aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartEmpList', {
            Vwtyp: '30',
            Subty: '3010',
            Orgeh: rOrgeh,
            Dchif: 'X',
            // Datum: this.DateUtils.parse(new Date())
          });
        }else{
          aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeEmp', {
            Vwtyp: '30',
            Subty: '3010',
            Orgeh: rOrgeh,
            Dchif: '',
            // Datum: this.DateUtils.parse(new Date())
          });
        }

        for(let i = 0; i < aRowData.length; i++){
          rEmpList.push({
            "Text" : aRowData[i].Ename + " " + aRowData[i].Zzpsgrptx,
            "Orgeh" : aRowData[i].Orgeh,
            "Pernr" : aRowData[i].Pernr,
            "Childyn" : "",
            "Mssty" : "",
            "TargetVisble" : false,
            "Uporgeh" : "",
            "Selected" : false,
            "CheckChildYn" : "",
            "Nodes" : [] 
          });
        }

        return rEmpList;
      },

      async onTreeToggle(oEvent){
        const rIndex = oEvent.getParameters().itemContext.sPath;
        const vSelectTarget = this.getViewModel().getProperty(rIndex);
        if(oEvent.getParameters().expanded == true && vSelectTarget.Childyn == "X" && vSelectTarget.TargetVisble == true && vSelectTarget.CheckChildYn == ""){
          const oViewModel = this.getViewModel();
          var vLevel1TreeList = [];

          try {
            const aRowData = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeOrgTree', {
              Orgeh: vSelectTarget.Orgeh,
              Datum: this.DateUtils.parse(new Date())
            });
            // Nodes 확장 버튼 활성화를 위한 임시 데이터 삭제
            vSelectTarget.Nodes = [];
            vSelectTarget.CheckChildYn = "X"; // 다음 버튼 클릭 시 OData 호출을 하지 않게 하기 위한 flag
            for(var i=0;i<aRowData.length;i++){
              if(vSelectTarget.Orgeh == aRowData[i].Orgeh){
                vSelectTarget.Orgeh
                vSelectTarget.Nodes.push({
                  "Text"  : aRowData[i].Stext,
                  "Orgeh" : aRowData[i].Orgeh,
                  "Childyn" : aRowData[i].Childyn,
                  "Mssty" : aRowData[i].Mssty,
                  "Uporgeh" : aRowData[i].Uporgeh,
                  "TargetVisble" : true,
                  "Selected" : false,
                  "Nodes" : [],
                  "CheckChildYn" : "X"  // OData Check 완료
                });
              }else{
                vSelectTarget.Nodes.push({
                  "Text"  : aRowData[i].Stext,
                  "Orgeh" : aRowData[i].Orgeh,
                  "Childyn" : aRowData[i].Childyn,
                  "Mssty" : aRowData[i].Mssty,
                  "Uporgeh" : aRowData[i].Uporgeh,
                  "TargetVisble" : true,
                  "Selected" : false,
                  "Nodes" : [],
                  "CheckChildYn" : "X"  // OData Check 완료
                });
              }
              
              //하위 조직 조회
              if(aRowData[i].Childyn == "X"){
                const { vTargetChildList , vLevel1Tree }   = await this.getTargetOrgChildList(aRowData[i].Orgeh, "");
                // 하위 조직이 존재하지 않을 경우에만 
                if(vTargetChildList && vTargetChildList.length > 0 && aRowData[i].Chilidyn == ""){
                  // 해당 조직의 조직원 조회
                  const rEmpList = await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty);
                  if(rEmpList.length > 0){
                    for(let j=0; j<rEmpList.length; j++){
                      vSelectTarget.Nodes.push(rEmpList[j]);
                    }
                  }
                  for(let j=0; j<vTargetChildList.length; j++){
                    vSelectTarget.Nodes.push(rEmpList[j]);
                  }
                }
                if(vLevel1Tree && vLevel1Tree.length > 0){ 
                  for(let j=0; j<vLevel1Tree.length; j++){
                    vLevel1TreeList.push(vLevel1Tree[j]);
                  }
                }
              }else{
                const rEmpList = await this.getTargetEmpList(aRowData[i].Orgeh, aRowData[i].Mssty);
                  if(rEmpList.length > 0){
                    for(let j=0; j<rEmpList.length; j++){
                      vSelectTarget.Nodes.push(rEmpList[j]);
                    }
                  }
              }
            }


            oViewModel.setProperty(rIndex, vSelectTarget);
            var vTargetList = oViewModel.getProperty('/targetList');

            //1Level 적용
            if(vLevel1TreeList.length > 0){
              for(let i=0; i<vLevel1TreeList.length; i++){
                vTargetList.push(vLevel1TreeList[i]);
              }
            }
            
            oViewModel.setProperty('/targetList', vTargetList);
              
          } catch (oError) {
            throw oError;
          }
        }else if(oEvent.getParameters().expanded == true && vSelectTarget.Childyn == "" && vSelectTarget.TargetVisble == true && vSelectTarget.CheckChildYn == ""){
          // 조직 구성원 조회 조회
          const rEmpList = await this.getTargetEmpList(vSelectTarget.Orgeh, vSelectTarget.Mssty);
          vSelectTarget.Nodes = [];
          if(rEmpList.length > 0){
            for(let j=0; j<rEmpList.length; j++){
              vSelectTarget.Nodes.push(rEmpList[j]);
            }
          } 
          oViewModel.setProperty(rIndex, vSelectTarget);
        }
      },

      // /* 대상자 조직의 인원 조회 */
      // async getTargetEmpList() {
      //   const oViewModel = this.getViewModel();
      //   var vTargetList = oViewModel.getProperty('/targetList'),
      //       vPromise = [];

      //   for(var i=0; i<vTargetList.length;i++){
      //     if(vTargetList[i].Mssty == "X"){
      //       vPromise.push(
      //         await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeEmp', {
      //           Vwtyp: '30',
      //           Subty: '3010',
      //           Orgeh: vTargetList[i].orgeh,
      //           // Dchif: 'X'
      //           // Orgeh: this.getAppointeeProperty('Teamcode'),
      //           Datum: this.DateUtils.parse(new Date())
      //         })
      //       );
      //     }else{
      //       vPromise.push(
      //         await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartEmpList', {
      //           Vwtyp: '30',
      //           Subty: '3010',
      //           Orgeh: vTargetList[i].orgeh,
      //           Dchif: 'X',
      //           Datum: this.DateUtils.parse(new Date())
      //         })
      //       );
      //     }
      //     for(j=0; j<vTargetList[i].nodes; j++){
      //       if(vTargetList[i].nodes[j].Mssty == "X"){
      //         vPromise.push(
      //           await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeEmp', {
      //             Vwtyp: '30',
      //             Subty: '3010',
      //             Orgeh: vTargetList[i].nodes[j].orgeh,
      //             // Dchif: 'X'
      //             // Orgeh: this.getAppointeeProperty('Teamcode'),
      //             Datum: this.DateUtils.parse(new Date())
      //           })
      //         );
      //       }else{
      //         vPromise.push(
      //           await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartEmpList', {
      //             Vwtyp: '30',
      //             Subty: '3010',
      //             Orgeh: vTargetList[i].nodes[j].orgeh,
      //             Dchif: 'X',
      //             Datum: this.DateUtils.parse(new Date())
      //           })
      //         );
      //       }
      //     }
          
      //   }

      //   return await Promise.all(vPromise);
      // },

      /* 대상자 조직의 인원 조회 */
      // async getTargetEmpList(rOrgeh, rMssty) {
      //   const oViewModel = this.getViewModel();
      //   var vTargetList = oViewModel.getProperty('/targetList'),
      //       vPromise = [];

      //   for(var i=0; i<vTargetList.length;i++){
      //     if(vTargetList[i].Mssty == "X"){
      //       vPromise.push(
      //         await Client.getEntitySet(this.getViewModel(ServiceNames.COMMON), 'OrgChartEmpList', {
      //           Vwtyp: '30',
      //           Subty: '3010',
      //           Orgeh: vTargetList[i].orgeh,
      //           Dchif: 'X',
      //           Datum: this.DateUtils.parse(new Date())
      //         })
      //       );
      //     }else{
      //       vPromise.push(
      //         await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTimeEmp', {
      //           Vwtyp: '30',
      //           Subty: '3010',
      //           Orgeh: vTargetList[i].orgeh,
      //           // Dchif: 'X'
      //           // Orgeh: this.getAppointeeProperty('Teamcode'),
      //           Datum: this.DateUtils.parse(new Date())
      //         })
      //       ); 
      //     }    
      //   }

      //   return await Promise.all(vPromise);
      // },

      /* 선택된 조직-조직원의 근태 조회 */
      async getWorkList () {
        const oViewModel = this.getViewModel();
        var vTargetList = oViewModel.getProperty('/targetList'),
            vPromise = [], vSelectedOrgList = [];

        for(var i=0; i< vTargetList.length; i++){
          if(vTargetList[i].TargetVisble == true){
            if(vTargetList[i].Selected == true){
              vSelectedOrgList.push(vTargetList[i].Orgeh);
            }
            if(vTargetList[i].Nodes && vTargetList[i].Nodes.length > 0){
              this.collectOrgList(vTargetList[i].Nodes, vSelectedOrgList);
            }
          }
        }

        for(var i=0; i< vSelectedOrgList.length; i++){
          vPromise.push(
            await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTeamCalendar', {
              Tmdat:  this.DateUtils.parse(oViewModel.getProperty("/startDate")),
              Orgeh:  vSelectedOrgList[i],
              Werks:  this.getAppointeeProperty('Persa')
            })
          );
        }
        console.log(vPromise);
        return Promise.all(vPromise);
      }, 


      collectOrgList(rNode, rSelectedOrgList){
        for(var i =0; i< rNode.length ; i++){
          if(rNode[i].TargetVisble == true){
            if(rNode[i].Selected == true){
              rSelectedOrgList.push(
                rNode[i].Orgeh
              );
            }
            if(rNode[i].Nodes && rNode[i].Nodes.length > 0){
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


      // /* 선택된 조직-조직원의 근태 조회 */
      // async getWorkList () {
      //   const oViewModel = this.getViewModel();
      //   var vTargetList = oViewModel.getProperty('/targetList'),
      //       vPromise = [];

      //   for(var i=0; i< vTargetList.length; i++){
      //     if(vTargetList[i].targetVisble == true && vTargetList[i].selected == true){
      //       vPromise.push(
      //         await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'MyTeamCalendar', {
      //           Tmdat:  this.DateUtils.parse(oViewModel.getProperty("/startDate")),
      //           Orgeh:  vTargetList[i].orgeh,
      //           Werks:  this.getAppointeeProperty('Persa')
      //         })
      //       );
      //     }
      //   }

      //   return Promise.all(vPromise);
      // }, 



      setTaskItem (){

      },

      /* 선택된 조직-조직원의 근태 조회 */
      async onSearchTeamWorkState (){
        const oViewModel = this.getViewModel();
        const vTargetList = oViewModel.getProperty('/targetList');
        const vRoot = { children : []};
        var   vPromise =[];
        
        this.setContentsBusy(true);
        const workList = await this.getWorkList();

        for(var i=0; i<workList.length;i++){ // 선택한 조직원 리스트
          var workingData = workList[i];
          for(var j=0; j<workingData.length;j++){ // 조직원의 근태 데이터
            var workingDataDetail = workingData[j];
            // Core 근무 정보 
            var vChildrenItem = { subtask : []};
            var vTask = [];
            var vTaskItem = {};
            vChildrenItem.id =  workingDataDetail.Pernr;
            vChildrenItem.text =  workingDataDetail.Ename;
            vTaskItem.id = workingDataDetail.Pernr + "_Core" ;
            vTaskItem.startTime =  this.DateUtils.formatDateToYYYYMMDD(workingDataDetail.Tmdat) +  workingDataDetail.BeguzC + "00";
            vTaskItem.endTime =  this.DateUtils.formatDateToYYYYMMDD(workingDataDetail.Tmdat) +  workingDataDetail.EnduzC + "00";
            if(workingDataDetail.Holyn == "X"){
              vTaskItem.fillColor = "#ededec";
              vTaskItem.title = "공휴일";            
            }else{
              vTaskItem.fillColor = "#B4C7E7";
              vTaskItem.title = "근무 (" + this.TimeUtils.format(workingDataDetail.BeguzC, 'HH:mm')   + "~" +  this.TimeUtils.format(workingDataDetail.EnduzC, 'HH:mm') + ")";
            }
          
            vChildrenItem.subtask.push(vTaskItem);
            
            
            for(var k=1; k<6; k++){ // 근태 1 ~ 근태 5 까지의 데이터
              var vAwart = "", vAtext = "", vAwbeguz = "", vAwenduz = "", vAwrsn = "", vAwrsntx = "", vBeguzC = "", vEnduzC = ""; 
              eval("vAwart = workingDataDetail.Awart" + k +";");
              eval("vAtext = workingDataDetail.Atext" + k +";");
              eval("vAwbeguz = workingDataDetail.Awbeguz" + k +";");
              eval("vAwenduz = workingDataDetail.Awenduz" + k +";");
              eval("vAwrsn = workingDataDetail.Awrsn" + k +";");
              eval("vAwrsntx = workingDataDetail.Awrsntx" + k +";");
              eval("vBeguzC = workingDataDetail.Beguz" + k +"C;");
              eval("vEnduzC = workingDataDetail.Enduz" + k +"C;");

              if( vBeguzC != "" && vBeguzC != "0000"){
                var vTaskItem = {};
                vTaskItem.id = workingDataDetail.Pernr + "_" + vAtext;
                vTaskItem.startTime =  this.DateUtils.formatDateToYYYYMMDD(workingDataDetail.Tmdat) +  vBeguzC + "00";
                vTaskItem.endTime =  this.DateUtils.formatDateToYYYYMMDD(workingDataDetail.Tmdat) +  vEnduzC + "00";
                // vTaskItem.startTime =  this.DateUtils.formatDateToYYYYMMDD(workingDataDetail.Tmdat) +  vAwbeguz + "00";
                // vTaskItem.endTime =  this.DateUtils.formatDateToYYYYMMDD(workingDataDetail.Tmdat) +  vAwenduz + "00";
                vTaskItem.title = vAtext + " (" + this.TimeUtils.format(vAwbeguz, 'HH:mm')   + "~" +  this.TimeUtils.format(vAwenduz, 'HH:mm') + ")";
                
                if(workingDataDetail.Colty == "A" || vAwart.charAt(0) == "A" || vAwart.charAt(0) == "C"){
                  vTaskItem.fillColor = "#FFE699";
                  // vTaskItem.title = "휴무";
                }else if(workingDataDetail.Colty == "D"){
                  vTaskItem.fillColor = "#BBC7E4";
                  // vTaskItem.title = "근무";
                }else if(workingDataDetail.Colty == "B" || vAwart.charAt(0) == "B"){
                  vTaskItem.fillColor = "#C5E0B4";
                  // vTaskItem.title = "교육/출장/기타근무";
                }else if(workingDataDetail.Colty == "C" || vAwart.charAt(0) == "D"){
                  vTaskItem.fillColor = "#D8D8D8";
                  // vTaskItem.title = "휴직";
                }else{
                  vTaskItem.fillColor = "#B4C7E7";
                  // vTaskItem.title = "근무";
                }
                
                vChildrenItem.subtask.push(vTaskItem);
              }
            }

            vRoot.children.push(vChildrenItem);
          }
        }

        oViewModel.setProperty('/root', vRoot);
        if(this.byId('ganttTable')){
          this.byId('ganttTable').setMinAutoRowCount(20);
          this.byId('ganttTable').setFixedRowCount(20);
          this.byId("ganttTable").addEventDelegate({
            onAfterRendering: () => {
              var elements = document.querySelectorAll('.sapGanttTimeHeaderSvgText1');
              elements.forEach(function(element) {
                  if (element.innerHTML.substring(0,5) === "00:00") {
                      const remainingString = element.innerHTML.substring(5);
                      element.innerHTML = '24:00' + remainingString;
                  }
              });
            },
          });
        }
        this.setContentsBusy(false);
      }
    });
  }
);
