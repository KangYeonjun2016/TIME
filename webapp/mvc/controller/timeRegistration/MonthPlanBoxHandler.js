sap.ui.define(
  [
    // prettier 방지용 주석
    'sap/ui/time/common/AppUtils',
    'sap/ui/base/Object',
    'sap/ui/core/Fragment',
    'sap/ui/time/common/odata/Client',
    'sap/ui/time/common/odata/ServiceNames',
    'sap/m/Button',
  ],
  (
    // prettier 방지용 주석
    AppUtils,
    BaseObject,
    Fragment,
    Client,
    ServiceNames,
    Button
  ) => {
    'use strict';

    return BaseObject.extend('sap.ui.time.mvc.controller.timeRegistration.MonthPlanBoxHandler', {
      constructor: function ({ oController, sPernr, sYear, sMonth }) {
        this.oController = oController;
        this.sPernr = sPernr;
        // this.sYYYYMM = sYYYYMM;
        this.aWorkTimes = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '1', '2', '3', '4', '5'];
        this.startNoWorkTime = 22;
        this.endNoWorkTime = 6;
        this.dayboxWidth = 0;
        this.dayboxHeight = 41;
        this.startDayTime = 6;
        this.endDayTime = 30;
        // this.getMonthPlan(sMonth);
        this.makeCalendarControl(sYear, sMonth);
      },

      makeCalendarControl(sYear = String(moment().year()), sMonth = String(moment().month())) {
        const oViewModel = this.oController.getViewModel();
        const mPlanDays = this.getPlanDays(sYear, sMonth);
        const currentData = new Date();
        const nowYear = '' + currentData.getFullYear(),
          nowMonth = '' + currentData.getMonth(),
          nowDay = currentData.getDate();

        const calMonth = String(_.toNumber(nowMonth) + 1).padStart(2, '0');
        const calDay = String(nowDay).padStart(2, '0');
        const calTmDat = `${nowYear}${calMonth}${calDay}`; // 현재일자

        var daysInfo = [];
        // Cell 배경 작업
        for (let i = 0; i < mPlanDays.length; i++) {
          /* Class 변경
            현재 일자와 동일 시 
            토, 일, 공휴일 
            색상 중요도 today > 휴일 > core time 
          */
          mPlanDays[i].tmDat == calTmDat ? 'TodayCell' : 'Normal';

          const oMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/')[i];
          const CtbegMin = _.toNumber(oMyCoreTimeCalendar.Ctbeg.slice(-2));
          const CtendMin = _.toNumber(oMyCoreTimeCalendar.Ctend.slice(-2));
          const CtbegHour = _.toNumber(oMyCoreTimeCalendar.Ctbeg.slice(0, 2));
          const CtendHour = _.toNumber(oMyCoreTimeCalendar.Ctend.slice(0, 2));

          // 특수문자 및 문자 제거
          // let regex = /[^0-9]/g;
          // let vDainf = oMyCoreTimeCalendar.Dainf.replace(regex, '');
          // let vDainfYYYYYMM = vDainf.substring(0,6);

          for (let j = 0; j < this.aWorkTimes.length; j++) {
            let vClassName = 'Normal';
            if (i == 0 && _.toNumber(this.aWorkTimes[j]) >= 6 && _.toNumber(this.aWorkTimes[j]) <= 23) {
              vClassName = 'Holiday';
            } else if (i == 0 && oViewModel.getProperty('/MyCoreTimeCalendar/')[i + 1].Holyn == 'X') {
              vClassName = 'Holiday';
            } else if (
              i == mPlanDays.length - 1 &&
              (this.aWorkTimes[j] == '24' || this.aWorkTimes[j] == '1' || this.aWorkTimes[j] == '2' || this.aWorkTimes[j] == '3' || this.aWorkTimes[j] == '4' || this.aWorkTimes[j] == '5')
            ) {
              vClassName = 'Holiday';
            } else if (mPlanDays[i].tmDat == calTmDat) {
              vClassName = 'TodayCell';
            } else if (oMyCoreTimeCalendar.Holyn == 'X') {
              vClassName = 'Holiday';
            } else if (_.toNumber(this.aWorkTimes[j]) == CtbegHour) {
              vClassName = 'CoreTimeBeg' + CtbegMin;
            } else if (_.toNumber(this.aWorkTimes[j]) == CtendHour) {
              vClassName = 'CoreTimeEnd' + CtendMin;
            } else if (_.toNumber(this.aWorkTimes[j]) * 100 >= _.toNumber(oMyCoreTimeCalendar.Ctbeg) && _.toNumber(this.aWorkTimes[j]) * 100 < _.toNumber(oMyCoreTimeCalendar.Ctend)) {
              vClassName = 'CoreTime';
            }

            daysInfo.push({ time: this.aWorkTimes[j], fullDate: mPlanDays[i].tmDat, classNames: vClassName, day: i });
          }

          // for (let j = 0; j < this.aWorkTimes.length; j++) {
          //   let vClassName = 'Normal';
          //   if (mPlanDays[i].tmDat == calTmDat) {
          //     vClassName = 'TodayCell';
          //   } else if (oMyCoreTimeCalendar.Holyn == 'X') {
          //     vClassName = 'Holiday';
          //   } else if (CtbegMin != '00' || CtendMin != '00') {
          //     // CoreTime 이 분단위 일 경우
          //     if (_.toNumber(this.aWorkTimes[j]) = CtbegHour ) {
          //       vClassName = 'CoreTime';
          //     }

          //   } else if (_.toNumber(this.aWorkTimes[j]) * 100 >= _.toNumber(oMyCoreTimeCalendar.Ctbeg) && _.toNumber(this.aWorkTimes[j]) * 100 < _.toNumber(oMyCoreTimeCalendar.Ctend)) {
          //     vClassName = 'CoreTime';
          //   }

          //   daysInfo.push({ time: this.aWorkTimes[j], fullDate: mPlanDays[i].tmDat, classNames: vClassName, day: i });
          // }
        }
        // 최상단 Header
        oViewModel.setProperty('/plansHeader', [...this.getHeader()]);
        // 좌측 Line Header
        oViewModel.setProperty('/planDays', [...mPlanDays]);
        oViewModel.setProperty('/plans', [...daysInfo]);
        this.makeCalendarControlBar(sYear, sMonth);

        const oMyCalendarBox = this.oController.byId('myCalendarBox');

        oMyCalendarBox.addEventDelegate({
          // 오늘 일자로 Scroll 이동
          onAfterRendering() {
            var elements = document.querySelector('.year-plan-grid .sapMFlexBox[data-style="Today"]');
            if (elements) {
              elements.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          },
        });
      },

      /* CoreTime Bar 생성 */
      // async makeCalendarCoreTimeBar(sYear, sMonth) {
      //   const oViewModel = this.oController.getViewModel();
      //   const myCalendarBox = this.oController.byId('myCalendarBox');

      //   var elements = document.querySelectorAll('.NavigationCoreTimeBar');

      //   // 기존에 생성되었던 Bar 를 삭제처리
      //   elements.forEach(function (element) {
      //     myCalendarBox.removeItem(element.id);
      //   });

      //   // 개인별 근태 캘린더 조회
      //   try {
      //     // Cell 너비를 저장
      //     this.dayboxWidth = 52.3;

      //     const regex = /(\d{2}):(\d{2})\s~\s(\d{2}):(\d{2})/;
      //     for (var i = 0; i < oViewModel.getProperty('/MyCoreTimeCalendar').length; i++) {
      //       const oMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/' + i);
      //       let ctime = '';

      //       let ADetailList = oMyCoreTimeCalendar.Adetail.split('|');
      //       let ColtyList = oMyCoreTimeCalendar.Coltys.split('|');
      //       let StattList = oMyCoreTimeCalendar.Statt.split('|');

      //       for (var j = 0; j < ADetailList.length; j++) {
      //         var oMyCoreTimeCalendarBar = {};
      //         const aAwrsn = ADetailList[j].substring(0, 8);
      //         const startTime = ADetailList[j].substring(8, 12); // 0900
      //         const endTime = ADetailList[j].substring(14, 18); // 1800
      //         oMyCoreTimeCalendarBar.CtbegHour = _.toNumber(startTime.substring(0, 2));
      //         oMyCoreTimeCalendarBar.CtbegMinute = _.toNumber(startTime.substring(2));
      //         if (oMyCoreTimeCalendarBar.CtbegMinute == 0) oMyCoreTimeCalendarBar.StartTime = oMyCoreTimeCalendarBar.CtbegHour;
      //         else {
      //           let StartTimeMinute = _.toNumber((oMyCoreTimeCalendarBar.CtbegMinute / 60).toFixed(1));
      //           oMyCoreTimeCalendarBar.StartTime = oMyCoreTimeCalendarBar.CtbegHour + StartTimeMinute;
      //         }
      //         oMyCoreTimeCalendarBar.CtendHour = _.toNumber(endTime.substring(0, 2));
      //         oMyCoreTimeCalendarBar.CtendMinute = _.toNumber(endTime.substring(2));
      //         if (oMyCoreTimeCalendarBar.CtendMinute == 0) oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.CtendHour;
      //         else {
      //           let EndTimeMinute = _.toNumber((oMyCoreTimeCalendarBar.CtendMinute / 60).toFixed(1));
      //           oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.CtendHour + EndTimeMinute;
      //         }
      //         //
      //         var nextDay = 0;
      //         if (oMyCoreTimeCalendarBar.StartTime > oMyCoreTimeCalendarBar.EndTime) {
      //           oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.EndTime + 24;
      //         } else if (oMyCoreTimeCalendarBar.StartTime < 6 && oMyCoreTimeCalendarBar.EndTime < 6) {
      //           oMyCoreTimeCalendarBar.StartTime = oMyCoreTimeCalendarBar.StartTime + 24;
      //           oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.EndTime + 24;
      //           nextDay = 1;
      //         }

      //         // OData 변환시 사용 필요
      //         oMyCoreTimeCalendarBar.TmDay = _.toNumber(this.oController.DateUtils.formatDateToYYYYMMDD(oMyCoreTimeCalendar.Tmdat).slice(-2));
      //         oMyCoreTimeCalendarBar.TmDay = oMyCoreTimeCalendarBar.TmDay == 1 ? oMyCoreTimeCalendarBar.TmDay : oMyCoreTimeCalendarBar.TmDay - nextDay;

      //         var vLeftPosition = '',
      //           vTopPosition = '',
      //           BarClassName = '';
      //         vLeftPosition = 'left-' + ((oMyCoreTimeCalendarBar.StartTime - this.startDayTime) * this.dayboxWidth).toFixed(1);
      //         vLeftPosition = vLeftPosition.replace('.', '_');
      //         vTopPosition = 'top-' + ((oMyCoreTimeCalendarBar.TmDay - 1) * this.dayboxHeight + 7).toFixed(1);
      //         vTopPosition = vTopPosition.replace('.', '_');

      //         BarClassName = this.getWorkingColorClass(oMyCoreTimeCalendar.Temty, StattList[j], ColtyList[j]);
      //         var that = this;
      //         myCalendarBox.addItem(
      //           new sap.m.VBox({
      //             width: (oMyCoreTimeCalendarBar.EndTime - oMyCoreTimeCalendarBar.StartTime) * this.dayboxWidth + 'px',
      //             height: '28px',
      //           })
      //             .addStyleClass('overlappingBox ' + vLeftPosition + ' ' + vTopPosition + ' ' + BarClassName)
      //             .addStyleClass('NavigationBar')
      //             .attachBrowserEvent('click', this.oController.pFormDialogWithAppno)
      //             .addCustomData(new sap.ui.core.CustomData({ key: 'That', value: that }))
      //             .addCustomData(
      //               new sap.ui.core.CustomData({
      //                 key: 'Tmdat',
      //                 value: oMyCoreTimeCalendar.Tmdat && oMyCoreTimeCalendar.Tmdat != '' ? this.oController.DateUtils.parse(oMyCoreTimeCalendar.Tmdat) : '',
      //               })
      //             )
      //             .addCustomData(new sap.ui.core.CustomData({ key: 'Appno', value: oMyCoreTimeCalendar.Appno && oMyCoreTimeCalendar.Appno != '' ? oMyCoreTimeCalendar.Appno : '' }))
      //             .addCustomData(new sap.ui.core.CustomData({ key: 'Beguz', value: startTime }))
      //             .addCustomData(new sap.ui.core.CustomData({ key: 'Enduz', value: endTime }))
      //         );
      //       }
      //     }

      //     oViewModel.refresh(true);
      //   } catch (oError) {
      //     this.oController.debug('Controller > home > onObjectMatched Error', oError);

      //     AppUtils.handleError(oError);
      //   } finally {
      //     oViewModel.setProperty('/busy', false);
      //   }
      // },

      /* 근태 시간 Bar 생성 */
      async makeCalendarControlBar(sYear, sMonth) {
        const oViewModel = this.oController.getViewModel();
        const myCalendarBox = this.oController.byId('myCalendarBox');

        var elements = document.querySelectorAll('.NavigationBar');

        // 기존에 생성되었던 Bar 를 삭제처리
        elements.forEach(function (element) {
          myCalendarBox.removeItem(element.id);
        });

        // 개인별 근태 캘린더 조회
        try {
          // Cell 너비를 저장
          this.dayboxWidth = 52.3;

          const regex = /(\d{2}):(\d{2})\s~\s(\d{2}):(\d{2})/;
          for (var i = 0; i < oViewModel.getProperty('/MyCoreTimeCalendar').length; i++) {
            const oMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/' + i);
            let ctime = '';

            let ADetailList = oMyCoreTimeCalendar.Adetail.split('|');
            let ColtyList = oMyCoreTimeCalendar.Coltys.split('|');
            let StattList = oMyCoreTimeCalendar.Statt.split('|');

            for (var j = 0; j < ADetailList.length; j++) {
              var oMyCoreTimeCalendarBar = {};
              const aAwrsn = ADetailList[j].substring(0, 8);
              const startTime = ADetailList[j].substring(8, 12); // 0900
              const endTime = ADetailList[j].substring(14, 18); // 1800
              oMyCoreTimeCalendarBar.CtbegHour = _.toNumber(startTime.substring(0, 2));
              oMyCoreTimeCalendarBar.CtbegMinute = _.toNumber(startTime.substring(2));
              if (oMyCoreTimeCalendarBar.CtbegMinute == 0) oMyCoreTimeCalendarBar.StartTime = oMyCoreTimeCalendarBar.CtbegHour;
              else {
                let StartTimeMinute = _.toNumber((oMyCoreTimeCalendarBar.CtbegMinute / 60).toFixed(1));
                oMyCoreTimeCalendarBar.StartTime = oMyCoreTimeCalendarBar.CtbegHour + StartTimeMinute;
              }
              oMyCoreTimeCalendarBar.CtendHour = _.toNumber(endTime.substring(0, 2));
              oMyCoreTimeCalendarBar.CtendMinute = _.toNumber(endTime.substring(2));
              if (oMyCoreTimeCalendarBar.CtendMinute == 0) oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.CtendHour;
              else {
                let EndTimeMinute = _.toNumber((oMyCoreTimeCalendarBar.CtendMinute / 60).toFixed(1));
                oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.CtendHour + EndTimeMinute;
              }
              //
              var nextDay = 0;
              if (oMyCoreTimeCalendarBar.StartTime > oMyCoreTimeCalendarBar.EndTime) {
                oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.EndTime + 24;
              } else if (oMyCoreTimeCalendarBar.StartTime < 6 && oMyCoreTimeCalendarBar.EndTime <= 6) {
                oMyCoreTimeCalendarBar.StartTime = oMyCoreTimeCalendarBar.StartTime + 24;
                oMyCoreTimeCalendarBar.EndTime = oMyCoreTimeCalendarBar.EndTime + 24;
                nextDay = 1;
              }

              // OData 변환시 사용 필요
              oMyCoreTimeCalendarBar.TmDay = _.toNumber(this.oController.DateUtils.formatDateToYYYYMMDD(oMyCoreTimeCalendar.Tmdat).slice(-2));
              oMyCoreTimeCalendarBar.TmDay = oMyCoreTimeCalendarBar.TmDay == 1 ? oMyCoreTimeCalendarBar.TmDay : oMyCoreTimeCalendarBar.TmDay - nextDay;

              var vLeftPosition = '',
                vTopPosition = '',
                BarClassName = '';
              vLeftPosition = 'left-' + ((oMyCoreTimeCalendarBar.StartTime - this.startDayTime) * this.dayboxWidth).toFixed(1);
              vLeftPosition = vLeftPosition.replace('.', '_');
              // vTopPosition = 'top-' + ((oMyCoreTimeCalendarBar.TmDay - 1) * this.dayboxHeight + 7).toFixed(1);
              vTopPosition = 'top-' + ((i - nextDay) * this.dayboxHeight + 7).toFixed(1);
              vTopPosition = vTopPosition.replace('.', '_');

              BarClassName = this.getWorkingColorClass(oMyCoreTimeCalendar.Temty, StattList[j], ColtyList[j]);
              var that = this;
              myCalendarBox.addItem(
                new sap.m.VBox({
                  width: (oMyCoreTimeCalendarBar.EndTime - oMyCoreTimeCalendarBar.StartTime) * this.dayboxWidth + 'px',
                  height: '28px',
                })
                  .addStyleClass('overlappingBox ' + vLeftPosition + ' ' + vTopPosition + ' ' + BarClassName)
                  .addStyleClass('NavigationBar')
                  .attachBrowserEvent('click', this.oController.pFormDialogWithAppno)
                  .addCustomData(new sap.ui.core.CustomData({ key: 'That', value: that }))
                  .addCustomData(
                    new sap.ui.core.CustomData({
                      key: 'Tmdat',
                      value: oMyCoreTimeCalendar.Tmdat && oMyCoreTimeCalendar.Tmdat != '' ? this.oController.DateUtils.parse(oMyCoreTimeCalendar.Tmdat) : '',
                    })
                  )
                  .addCustomData(new sap.ui.core.CustomData({ key: 'Appno', value: oMyCoreTimeCalendar.Appno && oMyCoreTimeCalendar.Appno != '' ? oMyCoreTimeCalendar.Appno : '' }))
                  .addCustomData(new sap.ui.core.CustomData({ key: 'Beguz', value: startTime }))
                  .addCustomData(new sap.ui.core.CustomData({ key: 'Enduz', value: endTime }))
              );
            }
          }

          oViewModel.refresh(true);
        } catch (oError) {
          this.oController.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/busy', false);
        }
      },

      getWorkingColorClass(rTemty, rStatt, rColty) {
        if (rStatt == '결재중') {
          if (rColty == 'F') return 'backgroundFStatt';
          else if (rColty == 'A') return 'backgroundAStatt';
          else if (rColty == 'B') return 'backgroundBStatt';
          else if (rColty == 'C') return 'backgroundCStatt';
          else if (rColty == 'G') return 'backgroundGStatt';
        } else {
          if (rColty == 'F') return 'backgroundCoreF';
          else if (rColty == 'A') return 'backgroundCoreA';
          else if (rColty == 'B') return 'backgroundCoreB';
          else if (rColty == 'C') return 'backgroundCoreC';
          else if (rColty == 'G') return 'backgroundCoreG';
          else return 'backgroundCoreC';
        }
      },

      getHeader() {
        // const mHeaders = this.aWorkTimes.map((o) =>  this.getBoxObject({ label: o, classNames: 'Header' , time : "8시간" }));
        const oViewModel = this.oController.getViewModel();
        const MyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
        const coreBeguz = _.toNumber(MyMonthlyStatus.Cbeg1),
          coreEnduz = _.toNumber(MyMonthlyStatus.Cend1);

        const mHeaders = this.aWorkTimes.map((o) => {
          // if (_.toNumber(o) * 100 >= coreBeguz && _.toNumber(o) * 100 <= coreEnduz) {
          //   return this.getBoxObject({ label: o, classNames: 'Header', time: '8시간', holiday: 'CoreTime' });
          //   // CoreTime
          // } else

          if (_.toNumber(o) >= this.startNoWorkTime || _.toNumber(o) < this.endNoWorkTime) {
            return this.getBoxObject({ label: o, classNames: 'Header', time: '8시간', holiday: 'NoWorking' });
          } else {
            return this.getBoxObject({ label: o, classNames: 'Header', time: '8시간' });
          }
        });

        return [...mHeaders];
      },

      getPlanDays(sYear = String(moment().year()), sMonth = String(moment().month())) {
        // 해당 월의 첫 번째 날과 마지막 날을 구합니다.
        const lastDayOfMonth = moment({ y: _.toNumber(sYear), M: _.toNumber(sMonth) }).endOf('month');
        const oViewModel = this.oController.getViewModel();
        // 해당 월의 일수와 요일을 구합니다.
        const daysInMonth = lastDayOfMonth.toDate().getDate();
        const daysInfo = [];
        const currentData = new Date();
        // const CompareDate = new Date( currentData.getFullYear(), currentData.getMonth(), currentData.getDate() );
        const nowYear = '' + currentData.getFullYear(),
          nowMonth = '' + currentData.getMonth(),
          nowDay = currentData.getDate();

        // 이전 달 마지막 날 추가

        const oPreMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/')[0];
        const preDate = new Date(
          oViewModel.getProperty('/MyCoreTimeCalendar/')[0].Tmdat.getFullYear(),
          oViewModel.getProperty('/MyCoreTimeCalendar/')[0].Tmdat.getMonth(),
          oViewModel.getProperty('/MyCoreTimeCalendar/')[0].Tmdat.getDate()
        );
        const preDayOfWeek = preDate.toLocaleString('ko-KR', { weekday: 'long' });
        const preCalMonth = String(_.toNumber(preDate.getMonth()) + 1).padStart(2, '0');
        const preCalDay = String(preDate.getDate()).padStart(2, '0');
        const preCalTmDat = `${preDate.getFullYear()}${preCalMonth}${preCalDay}`;

        // if (oPreMyCoreTimeCalendar.Susdayn == 'X') { // 대체 휴일 근무 일 경우
        //   daysInfo.push(
        //     this.getBoxObject({
        //       label: preCalDay + '(' + preDayOfWeek.charAt(0) + ')',
        //       classNames: 'Holiday',
        //       holiday: 'NoWorking',
        //       time: oPreMyCoreTimeCalendar.Stdaztx,
        //       displayTime: oPreMyCoreTimeCalendar.Stdaz != '0.00' && oPreMyCoreTimeCalendar.Stdaz != '' ? 'DisplayTime' : '',
        //       day: preDate.getDate(),
        //       fullDate: '' + preDate,
        //       tmDat: preCalTmDat,
        //       Ltext: oPreMyCoreTimeCalendar.Ltext,
        //       Cfmyn: oPreMyCoreTimeCalendar.Cfmyn,
        //     })
        //   );
        // }else
        if (oPreMyCoreTimeCalendar.Holyn == 'X') {
          daysInfo.push(
            this.getBoxObject({
              label: preCalDay + '(' + preDayOfWeek.charAt(0) + ')',
              classNames: 'Holiday',
              holiday: 'NoWorking',
              time: oPreMyCoreTimeCalendar.Stdaztx,
              displayTime: oPreMyCoreTimeCalendar.Stdaz != '0.00' && oPreMyCoreTimeCalendar.Stdaz != '' ? 'DisplayTime' : '',
              day: preDate.getDate(),
              fullDate: '' + preDate,
              tmDat: preCalTmDat,
              Ltext: oPreMyCoreTimeCalendar.Ltext,
              Cfmyn: oPreMyCoreTimeCalendar.Cfmyn,
            })
          );
        } else {
          daysInfo.push(
            this.getBoxObject({
              label: preCalDay + '(' + preDayOfWeek.charAt(0) + ')',
              classNames: 'Header',
              time: oPreMyCoreTimeCalendar.Stdaztx,
              displayTime: oPreMyCoreTimeCalendar.Stdaz != '0.00' && oPreMyCoreTimeCalendar.Stdaz != '' ? 'DisplayTime' : '',
              day: preDate.getDate(),
              fullDate: '' + preDate,
              tmDat: preCalTmDat,
              Ltext: oPreMyCoreTimeCalendar.Ltext,
              Cfmyn: oPreMyCoreTimeCalendar.Cfmyn,
            })
          );
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(sYear, sMonth, day);
          const dayOfWeek = date.toLocaleString('ko-KR', { weekday: 'long' });
          const calMonth = String(_.toNumber(sMonth) + 1).padStart(2, '0');
          const calDay = String(day).padStart(2, '0');
          const calTmDat = `${sYear}${calMonth}${calDay}`;
          const oMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/')[day];

          if (nowYear === _.toString(sYear) && nowMonth === _.toString(sMonth) && nowDay === day) {
            daysInfo.push(
              this.getBoxObject({
                label: 'Today',
                classNames: 'Today',
                time: oMyCoreTimeCalendar.Stdaztx,
                displayTime: oMyCoreTimeCalendar.Stdaz != '0.00' && oMyCoreTimeCalendar.Stdaz != '' ? 'DisplayTime' : '',
                day: day,
                fullDate: '' + date,
                tmDat: calTmDat,
                Ltext: oMyCoreTimeCalendar.Ltext,
                Cfmyn: oMyCoreTimeCalendar.Cfmyn,
              })
            );
          } else if (oMyCoreTimeCalendar.Holyn == 'X') {
            daysInfo.push(
              this.getBoxObject({
                label: day + '(' + dayOfWeek.charAt(0) + ')',
                classNames: 'Holiday',
                holiday: 'NoWorking',
                time: oMyCoreTimeCalendar.Stdaztx,
                displayTime: oMyCoreTimeCalendar.Stdaz != '0.00' && oMyCoreTimeCalendar.Stdaz != '' ? 'DisplayTime' : '',
                day: day,
                fullDate: '' + date,
                tmDat: calTmDat,
                Ltext: oMyCoreTimeCalendar.Ltext,
                Cfmyn: oMyCoreTimeCalendar.Cfmyn,
              })
            );
          } else {
            daysInfo.push(
              this.getBoxObject({
                label: day + '(' + dayOfWeek.charAt(0) + ')',
                classNames: 'Header',
                time: oMyCoreTimeCalendar.Stdaztx,
                displayTime: oMyCoreTimeCalendar.Stdaz != '0.00' && oMyCoreTimeCalendar.Stdaz != '' ? 'DisplayTime' : '',
                day: day,
                fullDate: '' + date,
                tmDat: calTmDat,
                Ltext: oMyCoreTimeCalendar.Ltext,
                Cfmyn: oMyCoreTimeCalendar.Cfmyn,
              })
            );
          }
        }
        return daysInfo;
      },

      getMonthPlan(sMonth = String(moment().month())) {
        setTimeout(async () => {
          const oViewModel = this.oController.getViewModel();
          const sPersa = this.oController.getAppointeeProperty('Persa');

          const aTimeTypes = oViewModel.getProperty('/TimeTypes');

          this.makeCalendarControl();
        }, 0);
      },

      getBoxObject({
        day = 'NONE',
        label = '',
        dayOrNight = '',
        classNames = '',
        borderNames = 'Default',
        stripes = 'None',
        holiday = 'None',
        time = '',
        fullDate = '' + new Date(),
        tmDat = '',
        displayTime = '',
        Ltext = '',
        Cfmyn = '',
      }) {
        return { day, label, dayOrNight, classNames, borderNames, stripes, holiday, time, fullDate, tmDat, displayTime, Ltext, Cfmyn };
      },
    });
  }
);
