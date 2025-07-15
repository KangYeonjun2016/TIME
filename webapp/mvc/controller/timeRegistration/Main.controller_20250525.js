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
    'sap/ui/time/mvc/controller/timeRegistration/MonthPlanBoxHandler',
    'sap/ui/time/control/MessageBox',
    'sap/ui/time/common/ApprovalStatusHandler',
    'sap/ui/time/common/FileAttachmentBoxHandler',
    'sap/ui/commons/Message',
    'sap/ca/ui/model/type/Number',
    'sap/ui/time/common/aes',
    'sap/ui/time/common/AesUtil',
    'sap/ui/time/common/pbkdf2',
    'sap/ui/core/date/UI5Date',
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
    MonthPlanBoxHandler,
    MessageBox,
    ApprovalStatusHandler,
    FileAttachmentBoxHandler,
    Message,
    Number,
    aes,
    AesUtil,
    pbkdf2
  ) => {
    'use strict';

    return BaseController.extend('sap.ui.time.mvc.controller.timeRegistration.Main', {
      sCombiChartId: 'combiChart',
      sDoughChartId: 'doughChart',
      sDialChartId: 'WeekWorkDialChart',
      sDialChartDiv: 'chart-weekWork-app-dial-container',

      FileAttachmentBoxHandler: null,

      ApprovalStatusHandler: null,

      AesUtil: AesUtil,

      initializeModel() {
        return {
          auth: '',
          FullYear: '',
          ename: '',
          pernr: '',
          year: moment().get('year'),
          month: moment().get('month'),
          Appno: '',
          Wrkty: 'C',
          loginInfo: this.getAppointeeProperty('LastLoginInfo'),
          busy: false,
          contentsBusy: {
            plan: false,
            calendar: false,
          },
          TimeTypes: [
            { Colty: 'F', Coltytx: '근무', Width: '100px' },
            { Colty: 'A', Coltytx: '휴가/휴무', Width: '120px' },
            { Colty: 'B', Coltytx: '교육/출장/기타근무', Width: '180px' },
            { Colty: 'C', Coltytx: '휴직', Width: '100px' },
            { Colty: 'D', Coltytx: '임시저장 / 결재중', Width: '180px' },
            { Colty: 'E', Coltytx: 'CoreTime', Width: '120px' },
          ],
          selectMonth: '2024년 9월',
          inputDate: null,
          selectedDatePlan: [
            {
              title: '',
              detail: [
                {
                  Atext1: '',
                  Appsttx1: '',
                  Ename: '',
                  Ename: '',
                },
              ],
            },
          ],
          apply: {
            MyCoreTimeCalendarLis: [],
          },
          dialog: {
            StartTmdat: new Date(),
            EndTmdat: new Date(),
            WorkType: '',
            minutesStep: 10,
            initBeguz: moment('0900', 'hhmm').toDate(),
            initEnduz: moment('1800', 'hhmm').toDate(),
            BBeguz: null,
            BEnduz: null,
            addButtonAct: true,
          },
          ConsentPrivacy: {
            check1: false,
            check2: false,
          },
          OverseasBR: {
            check: false,
          },
          Checklist: {
            dialog: {
              Placeyn: 0, //현장 방문 여부
              Checked: false,
              Begda: moment().hours(9).toDate(),
              completePledgeYN: '',
            },
          },
          plansHeader: [], // Header 시간
          planDays: [], // 좌측 일자 ( 요일 )
          plans: [], // Detail 시간
          entry: {
            TimePersInfo: {},
            TimePersProfileInfo: {},
            TimeTypes: [],
            TimeTypesFilter: [],
            TimeReasons: [],
            AllTimeReason: [],
            MyMonthlyStatus: {},
            Preas: [],
          },
          form: {
            dialog: {
              minutesStep: 10,
              initBeguz: moment('0900', 'hhmm').toDate(),
              initEnduz: moment('1800', 'hhmm').toDate(),
              data: {},
              list: [],
              MyDailyWorkTimeList: [],
              tmdatList: [],
              rowCount: 5,
            },
          },
          contentsBusy: {
            all: false,
            button: false,
            table: false,
            dialog: false,
            period: false,
          },
          MyCoreTimeCalendar: [],
          Allform: {
            dialog: {
              dayOfTheWeek: [],
              MyCoreTimeAllApply: [],
              rowCount: 10,
              Gubun: 1,
            },
          },
          approval: {
            rowCount: 1,
            list: [],
            Employees: [],
          },
          Target: {},
          viewMore: false,
          viewMoreText: '',
          checkPernrList: [
            '00119973',
            '00301700',
            '00451588',
            '01454571',
            '01482724',
            '01499100',
            '01517878',
            '01528739',
            '01604686',
            '01616094',
            '01637143',
            '02000795',
            '02003132',
            '02607751',
            '02617329',
            '02618109',
            '02619530',
            '02627565',
            '02628251',
            '02633560',
            '02634576',
            '02645931',
            '02646219',
            '02656965',
            '02662768',
            '02669876',
            '02669906',
            '02670097',
            '02672599',
            '02674083',
            '02674551',
            '02674819',
            '02674886',
            '02675086',
            '02678408',
            '02678412',
            '02678414',
            '02678415',
            '02679406',
            '02679890',
            '02680322',
            '02680517',
            '02680519',
            '02680520',
            '02682407',
            '02682733',
            '02688057',
            '02689130',
            '02689337',
            '02690722',
            '02691652',
            '02691968',
            '02692402',
            '02694726',
            '02695396',
            '02696385',
            '02696905',
            '02697162',
            '02697759',
            '02699095',
          ],
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

      async onObjectMatched(oParameter) {
        const oViewModel = this.getViewModel();
        const oView = this.getView();
        oViewModel.setSizeLimit(5000);
        this.initializeDatePopover();
        try {
          oViewModel.setData(this.initializeModel());
          oViewModel.setProperty('/busy', true);
          oViewModel.setProperty('/viewMore', false);
          oViewModel.setProperty('/viewMoreText', '+ 더보기');
          // Parameter (익월 적용 여부)
          let vNMonth = AppUtils.getAppComponent().getAppModel().getData().NMonth;
          if (vNMonth == 'X') {
            const curDate = new Date();
            const nextDate = new Date(curDate.getFullYear(), curDate.getMonth() + 1, curDate.getDate());
            oParameter.year = nextDate.getFullYear();
            oParameter.month = nextDate.getMonth();
          }

          // 결재함에서 전송된 Parameter
          var vAppno = AppUtils.getAppComponent().getAppModel().getData().Appno;
          // vAppno = '0000016569';
          if (vAppno && vAppno != '') {
            /* 결재함을 통해 접속된 경우  */
            const aApprovalParam = AppUtils.getAppComponent().getAppModel().getData();
            oViewModel.setProperty('/Pernr', aApprovalParam.Pernr);
            oViewModel.setProperty('/Werks', aApprovalParam.Werks);
            oViewModel.setProperty('/Appno', aApprovalParam.Appno);
            oViewModel.setProperty('/ViewType', 'ApprovalBox');
            // 신청 인원의 대상자 정보
            const oEmployeeInfo = await this.getEmployeeInfoForApproval(aApprovalParam.Pernr);

            oViewModel.setProperty('/entry/TimePersProfileInfo/ProfileName', oEmployeeInfo.Ename);
            oViewModel.setProperty('/entry/TimePersProfileInfo/ProfilePb', oEmployeeInfo.Pbtxt);
            oViewModel.setProperty('/entry/TimePersProfileInfo/Photo', oEmployeeInfo.Photo);

            // 신청 내역 조회
            await this.retrieveMyCoreTimeApplyList();

            const MyCoreTimeApplyList = oViewModel.getProperty('/apply/MyCoreTimeApplyList');
            if (MyCoreTimeApplyList.length > 0) {
              const sYYYYMMDD = this.DateUtils.formatDateToYYYYMMDD(MyCoreTimeApplyList[0].Tmdat);
              const sYear = MyCoreTimeApplyList[0].Tmdat.getFullYear();
              const sMonth = String(MyCoreTimeApplyList[0].Tmdat.getMonth() + 1).padStart(2, '0');
              // 해당 월의 일수와 요일을 구합니다.
              const lastDayOfMonth = new Date(sYear, sMonth, 0);
              const daysInMonth = lastDayOfMonth.getDate();
              const sFirtDay = '' + sYear + sMonth + '01';
              const sLastDay = '' + sYear + sMonth + String(daysInMonth);

              // const sFirtDay = this.DateUtils.formatDateToYYYYMMDD(MyCoreTimeApplyList[0].Tmdat).substring(0, 6) + '01';
              oViewModel.setProperty('/selectMonth', moment(sYYYYMMDD).format('YYYY년 MM월'));
              oViewModel.setProperty('/firstDay', sFirtDay);
              oViewModel.setProperty('/lastDay', sLastDay);
              oViewModel.setProperty('/year', _.toNumber(sYear));
              oViewModel.setProperty('/month', _.toNumber(sMonth) - 1);

              await Promise.all([
                this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
                this.retrieveTimePersInfo(),
              ]);

              this._setScrollContainerHeight();
              window.addEventListener('resize', this._setScrollContainerHeight.bind(this));
              // Indicator Graph Data 입력
              setTimeout(() => this.retrieveMonth(), 0);
              // this.setTableColorStyle();
            }
          } else {
            // 신청
            oViewModel.setProperty('/ViewType', 'ESS');

            if (!this.PernrCheckFormDialog) {
              this.PernrCheckFormDialog = await Fragment.load({
                id: oView.getId(),
                name: 'sap.ui.time.mvc.view.timeRegistration.fragment.PernrCheckFormDialog',
                controller: this,
              });

              oView.addDependent(this.PernrCheckFormDialog);
            }

            /* 결재함을 통해 접속되지 않은 경우  */
            const sPernr = oParameter.pernr ?? this.getAppointeeProperty('Pernr');
            const sYear = oParameter.year ?? moment().get('year');
            const sMonth = oParameter.month ?? moment().get('month');
            const sYYMM = '' + sYear + String(sMonth + 1).padStart(2, '0');
            // 해당 월의 일수와 요일을 구합니다.
            const lastDayOfMonth = new Date(sYear, sMonth + 1, 0);
            const daysInMonth = lastDayOfMonth.getDate();
            const sFirtDay = sYYMM + '01';
            const sLastDay = sYYMM + String(daysInMonth);
            const sAuth = this.currentAuth();

            oViewModel.setProperty('/auth', sAuth);
            oViewModel.setProperty('/pernr', sPernr);
            oViewModel.setProperty('/Pernr', sPernr);
            oViewModel.setProperty('/Werks', this.getAppointeeProperty('Persa'));
            oViewModel.setProperty('/entry/TimePersProfileInfo/ProfileName', this.getAppointeeProperty('Pernm'));
            oViewModel.setProperty('/entry/TimePersProfileInfo/ProfilePb', this.getAppointeeProperty('Pbtxt'));
            oViewModel.setProperty('/entry/TimePersProfileInfo/ProfileTeam', this.getAppointeeProperty('Stext'));
            oViewModel.setProperty('/entry/TimePersProfileInfo/Photo', this.getAppointeeProperty('Photo'));

            oViewModel.setProperty('/year', _.toNumber(sYear));
            oViewModel.setProperty('/month', _.toNumber(sMonth));
            oViewModel.setProperty('/firstDay', sFirtDay);
            oViewModel.setProperty('/lastDay', sLastDay);
            oViewModel.setProperty('/selectMonth', moment(sFirtDay).format('YYYY년 MM월'));

            await this.createAppnoWithAccess(); // 최초 로그인 시 Appno 생성

            await Promise.all([
              // this.createAppnoWithAccessClearAppnos(), // 최초 로그인 시 Appno 생성
              this.retrieveTimeTypeaList(),
              this.retrieveTimeReasonList(true), //사유 코드 전체 조회
              this.retrievePreasList(),
              // await this.retrieveMyMonthlyStatus(), // Default 근무 시간 및 휴게시간
              this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
              this.retrieveTimePersInfo(), //
              this.retrieveMyCoreTimeCalendar(),
            ]);

            this.MonthPlanBoxHandler = new MonthPlanBoxHandler({ oController: this, sPernr, sYear, sMonth });

            this._setScrollContainerHeight();
            window.addEventListener('resize', this._setScrollContainerHeight.bind(this));
            // Indicator Graph Data 입력
            setTimeout(() => this.retrieveMonth(), 0);

            if (sAuth === 'E') {
              const vCheckYN = oViewModel.getProperty('/checkPernrList').filter((o) => o === this.getAppointeeProperty('Pernr'));
              if (vCheckYN && vCheckYN.length > 0) {
                const vCheckResult = await this.retrievePernrCheck();
                if (vCheckResult == '') {
                  this.PernrCheckFormDialog.open();
                }
              }
            }
          }
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
        } finally {
          const oSelectMonth = this.byId('selectMonth');
          oSelectMonth.attachBrowserEvent('click', this.showDatePopover).addCustomData(new sap.ui.core.CustomData({ key: 'That', value: this }));

          oViewModel.setProperty('/busy', false);
        }
      },

      _setScrollContainerHeight(sViewMore) {
        const oScrollContainer = this.byId('ScrollContainer');
        const iBodyHeight = $('body').height();
        if (oScrollContainer.$() && oScrollContainer.$().offset()) {
          const iContentsTopPosition = oScrollContainer.$().offset().top;
          const iWindowHeight = iBodyHeight - iContentsTopPosition - 100;
          oScrollContainer.setHeight(iWindowHeight + 'px');
        }
        // if (sViewMore != undefined && sViewMore) oScrollContainer.setHeight(iWindowHeight + 50 + 'px');
        // else if (sViewMore != undefined && !sViewMore) oScrollContainer.setHeight(iWindowHeight - 50 + 'px');
        // else oScrollContainer.setHeight(iWindowHeight + 'px');

        // const oScrollContainer = this.byId('ScrollContainer');
        // const oScrollContainerBox = this.byId('ScrollContainerBox');
        // const iHeightVacationStatus = this.byId('vacationStatus').$().height();
        // const iWindowHeight = window.innerHeight - iHeightVacationStatus - 250; // 브라우저 창의 높이
        // const iWindowDataHeight = window.innerHeight - 130; // 브라우저 창의 높이
        // // var iWindowHeight = 700; // 브라우저 창의 높이
        // oScrollContainer.setHeight(iWindowHeight + 'px');
        // oScrollContainerBox.setHeight(iWindowDataHeight + 'px');
      },

      async getEmployeeInfoForApproval(sPernr) {
        const oViewModel = this.getViewModel();
        const aResult = await Client.getEntitySet(this.getModel(ServiceNames.TMCOMMON), 'TMEmpSearchResult', {
          Ename: sPernr,
          Actda: moment().hours(9).toDate(),
        });
        return aResult.length > 0 ? aResult[0] : {};
      },

      // onPressSearch() {},

      onPressExcelDownload() {},

      getCurrentLocationText() {
        return '월 근무 계획 입력';
      },

      getBreadcrumbsLinks() {
        return [{ name: this.getBundleText('LABEL_01001') }]; // My Time
      },

      async handleSelectLastMonth() {
        const oViewModel = this.getViewModel();

        try {
          oViewModel.setProperty('/contentsBusy/plan', true);
          oViewModel.setProperty('/contentsBusy/calendar', true);

          const dCurrentDate = moment(oViewModel.getProperty('/firstDay'));
          const dPreviousFirstDate = dCurrentDate.subtract(1, 'months');
          const dPreviousLastDate = dPreviousFirstDate.clone().endOf('month');

          oViewModel.setProperty('/year', dPreviousFirstDate.year());
          oViewModel.setProperty('/month', dPreviousFirstDate.month());
          oViewModel.setProperty('/firstDay', dPreviousFirstDate.format('YYYYMMDD'));
          oViewModel.setProperty('/lastDay', dPreviousLastDate.format('YYYYMMDD'));
          oViewModel.setProperty('/selectMonth', dPreviousFirstDate.format('YYYY년 MM월'));
          // Calender 의 달을 변경 시 Appno 생성
          await this.createAppnoWithAccess();

          await Promise.all([
            // this.retrieveMyMonthlyStatus(), // Default 근무 시간 및 휴게시간
            this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
            this.retrieveMyCoreTimeCalendar(),
          ]);

          this.MonthPlanBoxHandler.makeCalendarControl(_.toString(dPreviousFirstDate.year()), _.toString(dPreviousFirstDate.month()));
          // Indicator Graph Data 입력
          setTimeout(() => this.retrieveMonth(), 0);
        } catch (oError) {
          this.debug('Controller > TimeRegistration > handleSelectLastMonth Error', oError);
          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/contentsBusy/plan', false);
          oViewModel.setProperty('/contentsBusy/calendar', false);
        }
      },

      async handleSelectNextMonth() {
        const oViewModel = this.getViewModel();

        try {
          oViewModel.setProperty('/contentsBusy/plan', true);
          oViewModel.setProperty('/contentsBusy/calendar', true);

          const dCurrentDate = moment(oViewModel.getProperty('/firstDay'));
          const dPreviousFirstDate = dCurrentDate.add(1, 'months');
          const dPreviousLastDate = dPreviousFirstDate.clone().endOf('month');

          oViewModel.setProperty('/year', dPreviousFirstDate.year());
          oViewModel.setProperty('/month', dPreviousFirstDate.month());
          oViewModel.setProperty('/firstDay', dPreviousFirstDate.format('YYYYMMDD'));
          oViewModel.setProperty('/lastDay', dPreviousLastDate.format('YYYYMMDD'));
          oViewModel.setProperty('/selectMonth', dPreviousFirstDate.format('YYYY년 MM월'));
          // Calender 의 달을 변경 시 Appno 생성
          await this.createAppnoWithAccess();

          await Promise.all([
            // this.retrieveMyMonthlyStatus(), // Default 근무 시간 및 휴게시간
            this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
            this.retrieveMyCoreTimeCalendar(),
          ]);

          this.MonthPlanBoxHandler.makeCalendarControl(_.toString(dPreviousFirstDate.year()), _.toString(dPreviousFirstDate.month()));
          // Indicator Graph Data 입력
          setTimeout(() => this.retrieveMonth(), 0);
        } catch (oError) {
          this.debug('Controller > TimeRegistration > handleSelectNextMonth Error', oError);
          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/contentsBusy/plan', false);
          oViewModel.setProperty('/contentsBusy/calendar', false);
        }
      },

      async onPressChangeDate(oEvent) {
        const oViewModel = this.getViewModel();

        try {
          oViewModel.setProperty('/contentsBusy/plan', true);
          oViewModel.setProperty('/contentsBusy/calendar', true);

          const dInputDate = oViewModel.getProperty('/inputDate');

          if (!dInputDate || dInputDate == '') return;

          const dPreviousFirstDate = moment(dInputDate + '01');
          const dPreviousLastDate = dPreviousFirstDate.clone().endOf('month');

          oViewModel.setProperty('/year', dPreviousFirstDate.year());
          oViewModel.setProperty('/month', dPreviousFirstDate.month());
          oViewModel.setProperty('/firstDay', dPreviousFirstDate.format('YYYYMMDD'));
          oViewModel.setProperty('/lastDay', dPreviousLastDate.format('YYYYMMDD'));
          oViewModel.setProperty('/selectMonth', dPreviousFirstDate.format('YYYY년 MM월'));
          // Calender 의 달을 변경 시 Appno 생성
          await this.createAppnoWithAccess();

          await Promise.all([
            // this.retrieveMyMonthlyStatus(), // Default 근무 시간 및 휴게시간
            this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
            this.retrieveMyCoreTimeCalendar(),
          ]);

          this.MonthPlanBoxHandler.makeCalendarControl(_.toString(dPreviousFirstDate.year()), _.toString(dPreviousFirstDate.month()));
          // Indicator Graph Data 입력
          setTimeout(() => this.retrieveMonth(), 0);
        } catch (oError) {
          this.debug('Controller > TimeRegistration > handleSelectNextMonth Error', oError);
          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/contentsBusy/plan', false);
          oViewModel.setProperty('/contentsBusy/calendar', false);
          this._oDatePopover.close();
        }
      },

      getApprovalType() {
        return 'TM';
      },

      // 근무/휴무 코드 조회
      async retrieveTimeTypeaList() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          var aResults = await Client.getEntitySet(oModel, 'TimeTypeList', {
            Werks: this.getAppointeeProperty('Persa'),
            Austy: oViewModel.getProperty('/auth') === 'H' ? 'H' : '',
            Wrkty: oViewModel.getProperty('/auth') === 'H' ? 'C' : '',
          });
          for (var i = 0; i < aResults.length; i++) {
            if (aResults[i].Awart.charAt(0) == 'B') aResults[i].AwartType = 'B';
            else aResults[i].AwartType = 'A';
          }
          oViewModel.setProperty('/entry/TimeTypes', aResults);
        } catch (oError) {
          throw oError;
        }
      },

      // 사유 조회
      async retrieveTimeReasonList(bReadAll = false, reload = '') {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          const mFormData = oViewModel.getProperty('/form');
          const sAuth = oViewModel.getProperty('/auth');
          if (!bReadAll && (!mFormData.dialog.data.Awart || mFormData.dialog.data.Awart == '' || mFormData.dialog.data.Awart == null)) {
            oViewModel.setProperty('/entry/TimeReasons', []);
            return;
          }

          const aResults = await Client.getEntitySet(oModel, 'TimeReasonList', {
            Austy: sAuth,
            // Prcty: bReadAll || sAuth == 'H' ? 'P' : 'L',
            Prcty: bReadAll ? 'P' : 'L',
            Werks: this.getAppointeeProperty('Persa'),
            Awart: bReadAll ? undefined : mFormData.dialog.data.Awart,
            Wrkty: oViewModel.getProperty('/Wrkty'),
          });

          if (bReadAll) {
            oViewModel.setProperty(
              '/entry/AllTimeReason',
              aResults
              // _.chain(aResults)
              //   .uniqBy('Tmgrp')
              //   .map((o) => ({
              //     ..._.pick(o, ['Tmgrp', 'Tmgrptx']),
              //     items: _.chain(aResults)
              //       .reject((o) => _.includes(['A1KR0030', 'A1KR0040', 'A1KR0080', 'A1KR0090'], o.Awrsn)) // 반반차,1년미만 반반차 제외로직 추가 22/10/18
              //       .filter({ Tmgrp: o.Tmgrp })
              //       .map((t) => _.set(t, 'Awrsntx', _.replace(t.Awrsntx, '@', '')))
              //       .value(),
              //   }))
              //   .value()
            );
          } else {
            if (reload == '') {
              oViewModel.setProperty('/form/dialog/data/Awrsn', null);
            }
            oViewModel.setProperty(
              '/entry/TimeReasons',
              aResults
              // _.chain(aResults)
              //   .reject((o) => _.includes(['A1KR0030', 'A1KR0040', 'A1KR0080', 'A1KR0090'], o.Awrsn)) // 반반차,1년미만 반반차 제외로직 추가 22/10/18
              //   .map((o) => _.omit(o, '__metadata'))
              //   .value()
            );
          }
        } catch (oError) {
          throw oError;
        }
      },

      async retrievePernrCheck() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.MYTIME);
          var aResults = await Client.get(oModel, 'PernrCheckYn', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Begda: this.DateUtils.parse(new Date()),
          });

          return aResults.Checkyn;
        } catch (oError) {
          throw oError;
        }
      },

      // 사유 코드 조회
      async retrievePreasList() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          var aResults = await Client.getEntitySet(oModel, 'AddWorkingReason', {
            Werks: this.getAppointeeProperty('Persa'),
            Begda: this.DateUtils.parse(new Date()), // 임시
          });

          oViewModel.setProperty('/entry/Preas', aResults);
        } catch (oError) {
          throw oError;
        }
      },

      async setPreasList() {
        try {
          const oViewModel = this.getViewModel();
          const formData = oViewModel.getProperty('/form/dialog/data');
          var vPreasListWith80 = oViewModel.getProperty('/entry/Preas').filter((o) => o.Preas === '12' || o.Preas == '13');
          var vPreasListWithout80 = oViewModel.getProperty('/entry/Preas').filter((o) => o.Preas !== '12' && o.Preas !== '13');
          if (formData.Holyn == 'X' && formData.Tmdat.slice(-4) != '0501') {
            if (vPreasListWith80.length === 0) {
              vPreasListWithout80.push({ Preas: '12', Rtext: '해외출장(휴일대체)' });
              vPreasListWithout80.push({ Preas: '13', Rtext: '해외출장(현지근무)' });
              oViewModel.setProperty('/entry/Preas', vPreasListWithout80);
            }
          } else {
            if (vPreasListWith80.length > 0) {
              oViewModel.setProperty('/entry/Preas', vPreasListWithout80);
            }
          }
        } catch (oError) {
          throw oError;
        }
      },

      async retrieveMyMonthlyStatus(CalynFlag = '') {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.MYTIME);
          var MyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          oViewModel.getProperty('/firstDay');
          oViewModel.getProperty('/lastDay');

          // 정송이 수석에게 확인 BEGDA ENDDA 는 해당 월 첫째 일 ~ 막날 조회 ?
          const aResults = await Client.getEntitySet(oModel, 'MyMonthlyStatus', {
            Pernr: oViewModel.getProperty('/Pernr'), //this.getAppointeeProperty('Pernr'),
            Persa: oViewModel.getProperty('/Werks'),
            Begda: this.DateUtils.parse(oViewModel.getProperty('/firstDay')),
            Endda: this.DateUtils.parse(oViewModel.getProperty('/lastDay')),
            Calyn: CalynFlag,
          });

          if (aResults && aResults.length > 0) {
            // MyMonthlyStatus = aResults[0];
            MyMonthlyStatus.Cbeg1 = aResults[0].Cbeg1;
            MyMonthlyStatus.Cend1 = aResults[0].Cend1;
            MyMonthlyStatus.Pbeg1 = aResults[0].Pbeg1;
            MyMonthlyStatus.Pbeg2 = aResults[0].Pbeg2;
            MyMonthlyStatus.Pend1 = aResults[0].Pend1;
            MyMonthlyStatus.Pend2 = aResults[0].Pend2;
            MyMonthlyStatus.Pstatus = aResults[0].Pstatus;
            MyMonthlyStatus.Hiredate = aResults[0].Hiredate && aResults[0].Hiredate != '' ? this.DateUtils.formatDateToYYYYMMDD(aResults[0].Hiredate) : '';
            MyMonthlyStatus.Retiredate = aResults[0].Retiredate && aResults[0].Retiredate != '' ? this.DateUtils.formatDateToYYYYMMDD(aResults[0].Retiredate) : '';

            if (CalynFlag == 'X') {
              // 필수 근무 시간
              MyMonthlyStatus.Monwh = _.toNumber(aResults[0].Monwh);
              MyMonthlyStatus.MonwhT = MyMonthlyStatus.Monwh + ' H';
              // 법정 최대 근무 시간
              MyMonthlyStatus.Monmh = _.toNumber(aResults[0].Monmh);
              MyMonthlyStatus.MonmhT = MyMonthlyStatus.Monmh + ' H';
              // 실적 시간
              MyMonthlyStatus.Resultmh = _.toNumber(aResults[0].Resultmh);
              MyMonthlyStatus.ResultmhT = MyMonthlyStatus.Resultmh + ' H';
              // 기본근무 시간
              MyMonthlyStatus.BashrA = _.toNumber(aResults[0].BashrA);
              MyMonthlyStatus.BashrAT = MyMonthlyStatus.BashrA + ' H';
              // 연장근무 시간
              MyMonthlyStatus.AddhrA = _.toNumber(aResults[0].AddhrA);
              MyMonthlyStatus.AddhrAT = MyMonthlyStatus.AddhrA + ' H';

              // 휴일
              MyMonthlyStatus.HwkexhrA = _.toNumber(aResults[0].HwkexhrA);
              MyMonthlyStatus.HwkhrA = _.toNumber(aResults[0].HwkhrA);
              MyMonthlyStatus.HwkhrAT = MyMonthlyStatus.HwkexhrA + MyMonthlyStatus.HwkhrA + ' H';

              // 야간근무 시간
              MyMonthlyStatus.NgthrA = _.toNumber(aResults[0].NgthrA);
              MyMonthlyStatus.NgthrAT = MyMonthlyStatus.NgthrA + ' H';
              // 기본근무 시간
              // MyMonthlyStatus.HwkhrA = _.toNumber(aResults[0].HwkhrA);
              // MyMonthlyStatus.HwkhrAT = MyMonthlyStatus.HwkhrA + ' H';

              // 잔여 필요 근무시간(CoreTime 포함)
              MyMonthlyStatus.Remhrc = _.toNumber(aResults[0].Remhrc);
              MyMonthlyStatus.RemhrcT = MyMonthlyStatus.Remhrc + ' H';
              // 잔여 필요 근무시간(CoreTime 미포함)
              MyMonthlyStatus.Remhre = _.toNumber(aResults[0].Remhre);
              MyMonthlyStatus.RemhreT = MyMonthlyStatus.Remhre + ' H';
              //고정OT(합계)
              MyMonthlyStatus.FixTotOt = _.toNumber(aResults[0].FixTotOt);
            }
          }

          oViewModel.setProperty('/entry/MyMonthlyStatus', MyMonthlyStatus);
        } catch (oError) {
          throw oError;
        }
      },

      /*
      async retrieveMyMonthlyStatus(CalynFlag = '') {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.MYTIME);
          var MyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          oViewModel.getProperty('/firstDay');
          oViewModel.getProperty('/lastDay');

          // 정송이 수석에게 확인 BEGDA ENDDA 는 해당 월 첫째 일 ~ 막날 조회 ?
          const aResults = await Client.getEntitySet(oModel, 'MyMonthlyStatus', {
            Pernr: oViewModel.getProperty('/Pernr'), //this.getAppointeeProperty('Pernr'),
            Persa: oViewModel.getProperty('/Werks'),
            Begda: this.DateUtils.parse(oViewModel.getProperty('/firstDay')),
            Endda: this.DateUtils.parse(oViewModel.getProperty('/lastDay')),
            Calyn: CalynFlag,
          });

          if (aResults && aResults.length > 0) {
            // MyMonthlyStatus = aResults[0];
            if (CalynFlag == '') {
              MyMonthlyStatus.Cbeg1 = aResults[0].Cbeg1;
              MyMonthlyStatus.Cend1 = aResults[0].Cend1;
              MyMonthlyStatus.Pbeg1 = aResults[0].Pbeg1;
              MyMonthlyStatus.Pbeg2 = aResults[0].Pbeg2;
              MyMonthlyStatus.Pend1 = aResults[0].Pend1;
              MyMonthlyStatus.Pend2 = aResults[0].Pend2;
              MyMonthlyStatus.Pstatus = aResults[0].Pstatus;
              MyMonthlyStatus.Hiredate = aResults[0].Hiredate && aResults[0].Hiredate != '' ? this.DateUtils.formatDateToYYYYMMDD(aResults[0].Hiredate) : '';
              MyMonthlyStatus.Retiredate = aResults[0].Retiredate && aResults[0].Retiredate != '' ? this.DateUtils.formatDateToYYYYMMDD(aResults[0].Retiredate) : '';
              // 전반 3
              // MyMonthlyStatus.Pbeg1 = '1020';
              // MyMonthlyStatus.Pend1 = '1240';

              // 전반 2
              // MyMonthlyStatus.Pbeg1 = '1020';
              // MyMonthlyStatus.Pend1 = '1110';

              // 전반 1
              // MyMonthlyStatus.Pbeg1 = '0920';
              // MyMonthlyStatus.Pend1 = '1040';

              // 후반 3
              // MyMonthlyStatus.Pbeg1 = '1420';
              // MyMonthlyStatus.Pend1 = '1540';

              // 후반 2
              // MyMonthlyStatus.Pbeg1 = '1320';
              // MyMonthlyStatus.Pend1 = '1440';

              // 후반 1
              // MyMonthlyStatus.Pbeg1 = '1220';
              // MyMonthlyStatus.Pend1 = '1440';
            } else {
              // 필수 근무 시간
              MyMonthlyStatus.Monwh = _.toNumber(aResults[0].Monwh);
              MyMonthlyStatus.MonwhT = MyMonthlyStatus.Monwh + ' H';
              // 법정 최대 근무 시간
              MyMonthlyStatus.Monmh = _.toNumber(aResults[0].Monmh);
              MyMonthlyStatus.MonmhT = MyMonthlyStatus.Monmh + ' H';
              // 실적 시간
              MyMonthlyStatus.Resultmh = _.toNumber(aResults[0].Resultmh);
              MyMonthlyStatus.ResultmhT = MyMonthlyStatus.Resultmh + ' H';
              // 기본근무 시간
              MyMonthlyStatus.BashrA = _.toNumber(aResults[0].BashrA);
              MyMonthlyStatus.BashrAT = MyMonthlyStatus.BashrA + ' H';
              // 연장근무 시간
              MyMonthlyStatus.AddhrA = _.toNumber(aResults[0].AddhrA);
              MyMonthlyStatus.AddhrAT = MyMonthlyStatus.AddhrA + ' H';

              // 휴일
              MyMonthlyStatus.HwkexhrA = _.toNumber(aResults[0].HwkexhrA);
              MyMonthlyStatus.HwkhrA = _.toNumber(aResults[0].HwkhrA);
              MyMonthlyStatus.HwkhrAT = MyMonthlyStatus.HwkexhrA + MyMonthlyStatus.HwkhrA + ' H';

              // 야간근무 시간
              MyMonthlyStatus.NgthrA = _.toNumber(aResults[0].NgthrA);
              MyMonthlyStatus.NgthrAT = MyMonthlyStatus.NgthrA + ' H';
              // 기본근무 시간
              // MyMonthlyStatus.HwkhrA = _.toNumber(aResults[0].HwkhrA);
              // MyMonthlyStatus.HwkhrAT = MyMonthlyStatus.HwkhrA + ' H';

              // 잔여 필요 근무시간(CoreTime 포함)
              MyMonthlyStatus.Remhrc = _.toNumber(aResults[0].Remhrc);
              MyMonthlyStatus.RemhrcT = MyMonthlyStatus.Remhrc + ' H';
              // 잔여 필요 근무시간(CoreTime 미포함)
              MyMonthlyStatus.Remhre = _.toNumber(aResults[0].Remhre);
              MyMonthlyStatus.RemhreT = MyMonthlyStatus.Remhre + ' H';
              //고정OT(합계)
              MyMonthlyStatus.FixTotOt = _.toNumber(aResults[0].FixTotOt);
            }
          }

          oViewModel.setProperty('/entry/MyMonthlyStatus', MyMonthlyStatus);

          // 추가 버튼을 클릭
          if (CalynFlag == 'X') {
          }
        } catch (oError) {
          throw oError;
        }
      },
      */

      // 연차 현황 조회
      async retrieveTimePersInfo() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          const [mResult] = await Client.getEntitySet(oModel, 'TimePersInfo', {
            Pernr: oViewModel.getProperty('/Pernr'),
            Zyymm: '' + oViewModel.getProperty('/year') + this.calMonth(oViewModel.getProperty('/month')),
          });

          // 연차
          mResult.Crcnt1 = _.toNumber(mResult.Crcnt1);
          mResult.Crcnt1N = 100;
          // mResult.Crcnt1Tx = '24일 4시간';
          mResult.Uscnt1 = _.toNumber(mResult.Uscnt1);
          mResult.Rate1 = _.toNumber(mResult.Rate1);
          // mResult.Uscnt1Tx = '6일 4시간';
          mResult.Blcnt1 = _.toNumber(mResult.Blcnt1);
          // mResult.Blcnt1Tx = '18일';

          // 하기휴가
          mResult.Crcnt2 = _.toNumber(mResult.Crcnt2);
          mResult.Crcnt2N = 100;
          // mResult.Crcnt2Tx = '5일';
          mResult.Uscnt2 = _.toNumber(mResult.Uscnt2);
          mResult.Rate2 = _.toNumber(mResult.Rate2);
          // mResult.Uscnt2Tx = '0일';
          mResult.Blcnt2 = _.toNumber(mResult.Blcnt2);
          // mResult.Blcnt1Tx = '5일';

          // 보상휴가
          mResult.Crcnt3 = _.toNumber(mResult.Crcnt3);
          mResult.Crcnt3N = 100;
          // mResult.Crcnt3Tx = '7일 2시간 20분';
          mResult.Crcnt3Visible = true;
          mResult.Uscnt3 = _.toNumber(mResult.Uscnt3);
          mResult.Rate3 = _.toNumber(mResult.Rate3);
          // mResult.Uscnt3Tx = '20분';
          mResult.Blcnt3 = _.toNumber(mResult.Blcnt3);
          // mResult.Blcnt3Tx = '7일 2시간';

          // 적치연차
          mResult.Crcnt4 = _.toNumber(mResult.Crcnt4);
          mResult.Crcnt4N = 100;
          // mResult.Crcnt4Tx = '1일';
          mResult.Crcnt4Visible = mResult.Crcnt4 !== 0;
          mResult.Uscnt4 = _.toNumber(mResult.Uscnt4);
          mResult.Rate4 = _.toNumber(mResult.Rate4);
          // mResult.Uscnt4Tx = '0일';
          mResult.Blcnt4 = _.toNumber(mResult.Blcnt4);
          // mResult.Blcnt4Tx = '1일';

          // 1년미만연차
          mResult.Crcnt5 = _.toNumber(mResult.Crcnt5);
          mResult.Crcnt5N = 100;
          // mResult.Crcnt5Tx = '2일';
          mResult.Crcnt5Visible = mResult.Crcnt5 !== 0;
          mResult.Uscnt5 = _.toNumber(mResult.Uscnt5);
          mResult.Rate5 = _.toNumber(mResult.Rate5);
          // mResult.Uscnt5Tx = '0일';
          mResult.Blcnt5 = _.toNumber(mResult.Blcnt5);
          // mResult.Blcnt5Tx = '2일';

          oViewModel.setProperty('/entry/TimePersInfo', mResult);

          if (oViewModel.getProperty('/ViewType') == 'ApprovalBox') {
            oViewModel.setProperty('/entry/TimePersProfileInfo/ProfileTeam', mResult.Orgtx);
          }
        } catch (oError) {
          throw oError;
        }
      },

      // Default 휴게 시간 조회
      async getBreakTime() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.TIMEMANAGEMENT);
          const aResults = await Client.getEntitySet(oModel, 'TimeEtcBasis', {
            Werks: this.getAppointeeProperty('Persa'),
          });
        } catch (oError) {
          throw oError;
        }
      },

      /* 
         PersTimeAbsence 조회 Appno 를 이용해서
         하루만 조회
      */
      async getMySusdaList() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          const vStatt = oViewModel.getProperty('/form/dialog/data/Statt');
          var vPromise = [];
          const Tmdat = oViewModel.getProperty('/form/dialog/data/Tmdat');
          const Daylst = typeof Tmdat === 'string' ? Tmdat : this.DateUtils.formatDateToYYYYMMDD(Tmdat);

          // 선택적 근로 (근태)
          vPromise.push(
            await Client.getEntitySet(this.getViewModel(ServiceNames.HRCALENDAR), 'PersTimeAbsence', {
              Pernr: this.getAppointeeProperty('Pernr'),
              Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
              Daylst: oViewModel.getProperty('/form/dialog/data/Tmdat'),
            })
          );

          const aResults = await Promise.all(vPromise);

          const formatTime = (time) => {
            const hours = String(Math.floor(time / 100)).padStart(2, '0');
            const minutes = String(time % 100).padStart(2, '0');
            return hours + ':' + minutes;
          };

          var MyDailyWorkTimeList = [];

          for (var i = 0; i < aResults.length; i++) {
            // 결재 상태값(Statt) 을  MyCoreTimeCalendar 에서 조회하여  MyDailyWorkTimeList 에 입력
            var aResult = aResults[i];
            // i = 0 일 때는 PersTimeAbsence
            // i = 1 일 때는 PersTimeAddWorking
            for (var j = 0; j < aResult.length; j++) {
              const startTime = formatTime(aResult[j].Beguz); // "09:00"
              const endTime = formatTime(aResult[j].Enduz); // "18:00"

              aResult[j].WorkTime = `${startTime} ~ ${endTime}`;
              aResult[j].Statt = aResult[j].Tmatx; // 결재 상태

              if (i == 0) {
                aResult[j].OrderType = 'PersTimeAbsence';
              } else {
                //PersTimeAddWorking 일 경우에는 근태 유형 과 사유를 고정 ( Return 구조에 해당 필드 미존재)
                aResult[j].OrderType = 'PersTimeAddWorking';
                aResult[j].Awart = 'B300';
                aResult[j].Awrsn = 'B3KR0120';
                aResult[j].Atext = '근무';
                aResult[j].Awrsntx = '근무';
              }

              // 결재 상태 와 Appno 에 따른 처리(X) 버튼 활성화 처리
              let DeclineVisible = false;
              if (oViewModel.getProperty('/form/dialog/data/Appno') == oViewModel.getProperty('/Appno')) {
                if (
                  aResult[j].Temty == 'A' ||
                  aResult[j].Tmatx == '신규' ||
                  aResult[j].Tmatx == '삭제' ||
                  aResult[j].Tmatx == '승인' ||
                  aResult[j].Tmatx == 'New' ||
                  aResult[j].Tmatx == 'Cancel' ||
                  aResult[j].Tmatx == 'Approved'
                ) {
                  DeclineVisible = true;
                }
              } else {
                DeclineVisible = true;
                // 결재 상태 일 경우에는 모두 Select 처리
                aResult[j].Selected = true;
              }
              aResult[j].DeclineVisible = DeclineVisible;
              aResult[j].TmdatTx = moment(aResult[j].Tmdat).format('YYYY.MM.DD') + ' (' + aResult[j].Weekt + ')';

              MyDailyWorkTimeList.push(aResult[j]);
            }
          }

          let rRowCount = 5;
          if (MyDailyWorkTimeList.length > 5 && MyDailyWorkTimeList.length <= 8) {
            rRowCount = MyDailyWorkTimeList.length;
          } else {
            rRowCount = 8;
          }

          oViewModel.setProperty('/form/dialog/rowCount', rRowCount);
          oViewModel.setProperty('/form/dialog/MyDailyWorkTimeList', MyDailyWorkTimeList);
        } catch (oError) {
          throw oError;
        }
      },

      /* 
         PersTimeAbsence 조회 Appno 를 이용해서
         하루만 조회
      */
      async getMyDailyWorkTimeList() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          const vStatt = oViewModel.getProperty('/form/dialog/data/Statt');
          var vPromise = [];
          const Tmdat = oViewModel.getProperty('/form/dialog/data/Tmdat');
          const Daylst = typeof Tmdat === 'string' ? Tmdat : this.DateUtils.formatDateToYYYYMMDD(Tmdat);

          // 선택적 근로 (근태)
          vPromise.push(
            await Client.getEntitySet(this.getViewModel(ServiceNames.HRCALENDAR), 'PersTimeAbsence', {
              Pernr: this.getAppointeeProperty('Pernr'),
              Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
              Daylst: oViewModel.getProperty('/form/dialog/data/Daylst'),
            })
          );
          // 추가 근무
          vPromise.push(
            Client.getEntitySet(this.getViewModel(ServiceNames.HRCALENDAR), 'PersTimeAddWorking', {
              Pernr: this.getAppointeeProperty('Pernr'),
              Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
              Daylst: oViewModel.getProperty('/form/dialog/data/Daylst'),
            })
          );
          const aResults = await Promise.all(vPromise);

          const formatTime = (time) => {
            const hours = String(Math.floor(time / 100)).padStart(2, '0');
            const minutes = String(time % 100).padStart(2, '0');
            return hours + ':' + minutes;
          };

          var MyDailyWorkTimeList = [];

          for (var i = 0; i < aResults.length; i++) {
            // 결재 상태값(Statt) 을  MyCoreTimeCalendar 에서 조회하여  MyDailyWorkTimeList 에 입력
            var aResult = aResults[i];
            // i = 0 일 때는 PersTimeAbsence
            // i = 1 일 때는 PersTimeAddWorking
            for (var j = 0; j < aResult.length; j++) {
              const startTime = formatTime(aResult[j].Beguz); // "09:00"
              const endTime = formatTime(aResult[j].Enduz); // "18:00"

              aResult[j].WorkTime = `${startTime} ~ ${endTime}`;
              aResult[j].Statt = aResult[j].Tmatx; // 결재 상태

              if (i == 0) {
                aResult[j].OrderType = 'PersTimeAbsence';
              } else {
                //PersTimeAddWorking 일 경우에는 근태 유형 과 사유를 고정 ( Return 구조에 해당 필드 미존재)
                aResult[j].OrderType = 'PersTimeAddWorking';
                aResult[j].Awart = 'B300';
                aResult[j].Awrsn = 'B3KR0120';
                aResult[j].Atext = '근무';
                aResult[j].Awrsntx = '근무';
              }

              // 결재 상태 와 Appno 에 따른 처리(X) 버튼 활성화 처리
              let DeclineVisible = false;
              if (oViewModel.getProperty('/form/dialog/data/Appno') == oViewModel.getProperty('/Appno')) {
                if (
                  aResult[j].Temty == 'A' ||
                  aResult[j].Tmatx == '신규' ||
                  aResult[j].Tmatx == '삭제' ||
                  aResult[j].Tmatx == '승인' ||
                  aResult[j].Tmatx == 'New' ||
                  aResult[j].Tmatx == 'Cancel' ||
                  aResult[j].Tmatx == 'Approved'
                ) {
                  DeclineVisible = true;
                }
              } else {
                DeclineVisible = true;
                // 결재 상태 일 경우에는 모두 Select 처리
                aResult[j].Selected = true;
              }
              aResult[j].DeclineVisible = DeclineVisible;
              aResult[j].Tmdat = this.DateUtils.toConvertKoreaDate(aResult[j].Tmdat);
              aResult[j].TmdatTx = moment(aResult[j].Tmdat).format('YYYY.MM.DD') + ' (' + aResult[j].Weekt + ')';

              MyDailyWorkTimeList.push(aResult[j]);
            }
          }

          let rRowCount = 5;
          if (MyDailyWorkTimeList.length > 5 && MyDailyWorkTimeList.length <= 8) {
            rRowCount = MyDailyWorkTimeList.length;
          } else {
            rRowCount = 8;
          }

          oViewModel.setProperty('/form/dialog/rowCount', rRowCount);
          oViewModel.setProperty('/form/dialog/MyDailyWorkTimeList', MyDailyWorkTimeList);
        } catch (oError) {
          throw oError;
        }
      },

      async getMyDailyWorkTimeListMultiDays() {
        try {
          const oViewModel = this.getViewModel();
          var vPromise = [];
          var aTmdatList = oViewModel.getProperty('/form/dialog/tmdatList');
          const set = new Set(aTmdatList);
          const uniqueTmdatList = [...set];
          for (var i = 0; i < uniqueTmdatList.length; i++) {
            // 선택적 근로 (근태)
            vPromise.push(
              await Client.getEntitySet(this.getViewModel(ServiceNames.HRCALENDAR), 'PersTimeAbsence', {
                Pernr: this.getAppointeeProperty('Pernr'),
                Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
                Daylst: uniqueTmdatList[i],
              })
            );
            // 추가 근무
            vPromise.push(
              Client.getEntitySet(this.getViewModel(ServiceNames.HRCALENDAR), 'PersTimeAddWorking', {
                Pernr: this.getAppointeeProperty('Pernr'),
                Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
                Daylst: uniqueTmdatList[i],
              })
            );
          }

          const aResults = await Promise.all(vPromise);

          const formatTime = (time) => {
            const hours = String(Math.floor(time / 100)).padStart(2, '0');
            const minutes = String(time % 100).padStart(2, '0');
            // return `${hours}:${minutes}`
            return hours + ':' + minutes;
          };

          var MyDailyWorkTimeList = [];

          for (var i = 0; i < aResults.length; i++) {
            // 결재 상태값(Statt) 을  MyCoreTimeCalendar 에서 조회하여  MyDailyWorkTimeList 에 입력
            var aResult = aResults[i];
            // i = 0 일 때는 PersTimeAbsence
            // i = 1 일 때는 PersTimeAddWorking
            for (var j = 0; j < aResult.length; j++) {
              const startTime = formatTime(aResult[j].Beguz); // "09:00"
              const endTime = formatTime(aResult[j].Enduz); // "18:00"

              aResult[j].WorkTime = `${startTime} ~ ${endTime}`;
              aResult[j].Statt = aResult[j].Tmatx; // 결재 상태

              if (aResult[j].TimeAttdListSet) {
                aResult[j].OrderType = 'PersTimeAbsence';
              } else {
                //PersTimeAddWorking 일 경우에는 근태 유형 과 사유를 고정 ( Return 구조에 해당 필드 미존재)
                aResult[j].OrderType = 'PersTimeAddWorking';
                aResult[j].Awart = 'B300';
                aResult[j].Awrsn = 'B3KR0120';
                aResult[j].Atext = '근무';
                aResult[j].Awrsntx = '근무';
              }

              // 결재 상태 와 Appno 에 따른 처리(X) 버튼 활성화 처리
              let DeclineVisible = false;
              if (oViewModel.getProperty('/form/dialog/data/Appno') == oViewModel.getProperty('/Appno')) {
                if (
                  aResult[j].Temty == 'A' ||
                  aResult[j].Tmatx == '신규' ||
                  aResult[j].Tmatx == '삭제' ||
                  aResult[j].Tmatx == '승인' ||
                  aResult[j].Tmatx == 'New' ||
                  aResult[j].Tmatx == 'Cancel' ||
                  aResult[j].Tmatx == 'Approved'
                ) {
                  DeclineVisible = true;
                }
              } else {
                DeclineVisible = true;
                // 결재 상태 일 경우에는 모두 Select 처리
                aResult[j].Selected = true;
              }
              aResult[j].DeclineVisible = DeclineVisible;
              aResult[j].Tmdat = this.DateUtils.toConvertKoreaDate(aResult[j].Tmdat);
              aResult[j].TmdatTx = moment(aResult[j].Tmdat).format('YYYY.MM.DD') + ' (' + aResult[j].Weekt + ')';

              MyDailyWorkTimeList.push(aResult[j]);
            }
          }

          let rRowCount = 5;
          if (MyDailyWorkTimeList.length > 5 && MyDailyWorkTimeList.length <= 8) {
            rRowCount = MyDailyWorkTimeList.length;
          } else {
            rRowCount = 8;
          }

          oViewModel.setProperty('/form/dialog/rowCount', rRowCount);
          oViewModel.setProperty('/form/dialog/MyDailyWorkTimeList', MyDailyWorkTimeList);
          oViewModel.setProperty('/form/dialog/tmdatList', uniqueTmdatList);
        } catch (oError) {
          throw oError;
        }
      },

      /*
        개인 근태 조회
      */
      async retrieveMyCoreTimeCalendar() {
        const oViewModel = this.getViewModel();

        try {
          const oModel = this.getModel(ServiceNames.MYTIME);
          const sFirstDay = oViewModel.getProperty('/firstDay');
          const Zyymm = moment(sFirstDay).format('YYYYMM');

          var keySize = 256;
          var iterationCount = 1000;
          var iv = 'F27D5C9927726BCEFE7510B1BDD3D137';
          var salt = '3FF342';
          var passPhrase = 'passPhrase';

          var encrypt = this.AesUtil.prototype.encrypt(keySize, iterationCount, salt, iv, passPhrase, this.getAppointeeProperty('Pernr'));

          // var aesUtil = new AesUtil(keySize, iterationCount);
          // var encrypt = aesUtil.encrypt(salt, iv, passPhrase, this.getAppointeeProperty('Pernr'));

          var encrypt2 = encodeURIComponent(encrypt.replace(/=/gi, '_G_'));

          var vResults = await Client.getEntitySet(oModel, 'MyCoreTimeCalendar', {
            Werks: this.getAppointeeProperty('Persa'),
            // Pernr: this.getAppointeeProperty('Pernr'),
            Pernr: encrypt2,
            Zyymm,
          });

          for (let i = 0; i < vResults.length; i++) {
            if (vResults[i].Tmdat != '') {
              vResults[i].Tmdat = this.DateUtils.toConvertKoreaDate(vResults[i].Tmdat);
            }
          }

          oViewModel.setProperty('/MyCoreTimeCalendar', vResults);
        } catch (oError) {
          oViewModel.setProperty('/contentsBusy/dialog', true);
          throw oError;
        }
      },

      /*
        결재 신청하기 시 호출
      */
      async retrieveMyCoreTimeApplyList() {
        try {
          const oViewModel = this.getViewModel();

          var sMyCoreTimeApplyList = await Client.getEntity(this.getModel(ServiceNames.MYTIME), 'MyCoreTimeApplyList', {
            Werks: oViewModel.getProperty('/Werks'),
            Appno: oViewModel.getProperty('/Appno'),
            Wrkty: oViewModel.getProperty('/Wrkty'), //고정
          });

          for (var i = 0; i < sMyCoreTimeApplyList.length; i++) {
            if (sMyCoreTimeApplyList[i].Awrsntx == '야간근무' || sMyCoreTimeApplyList[i].Awrsntx == '휴일근무' || sMyCoreTimeApplyList[i].Awrsntx == '휴일야간근무') {
              sMyCoreTimeApplyList[i].CellCheck = 'CELLCHECK';
            } else {
              sMyCoreTimeApplyList[i].CellCheck = '';
            }
          }
          oViewModel.setProperty('/apply/MyCoreTimeApplyList', sMyCoreTimeApplyList);
        } catch (oError) {
          this.debug('Controller > TimeRegistration > getAbsenceDataInfo Error', oError);

          AppUtils.handleError(oError);
          return 'Error';
        }

        return '';
      },

      async readEmployees() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.COMMON);
          // const mAppointeeData = this.getAppointeeData();
          const aResults = await Client.getEntitySet(oModel, 'EmpSearchResult', {
            // Accty: 'Z',
            Persa: this.getAppointeeProperty('Persa'),
            // Orgeh: mAppointeeData.Orgeh,
            // Stat1: '3',
          });

          oViewModel.setProperty(
            '/approval/Employees',
            _.map(aResults, (o) => _.omit(o, '__metadata'))
          );
        } catch (oError) {
          AppUtils.handleError(oError);
        }
      },

      async retrieveApplyList() {
        const oViewModel = this.getViewModel();

        try {
          const aResults = await Client.getEntitySet(this.getModel(ServiceNames.APPROVAL), 'ApproverList', { Pernr: this.getAppointeeProperty('Pernr'), Appty: 'TM' });

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

      callbackForRef({ Pernr, Ename, Orgtx, Zzcaltltx, Zzpsgrptx }) {
        if (!Pernr) return false;

        const oViewModel = this.getViewModel();
        const aApprovals = oViewModel.getProperty('/approval/list');

        oViewModel.setProperty('/approval/rowCount', Math.min(aApprovals.length + 1, 5));
        oViewModel.setProperty('/approval/list', [
          ...aApprovals,
          {
            enabledComments: false,
            Appno: '0000000000',
            Appty: 'TM',
            Seqnr: _.toString(aApprovals.length + 1),
            Linty: '40',
            Lintytx: this.getBundleText('LABEL_00231'), // 참조
            Perpic: '',
            Pernr,
            Ename,
            Zzcaltltx,
            Zzpsgrptx,
            Orgtx,
            Appsttx: '',
            Sgntm: '',
          },
        ]);

        this.setDetailsTableStyle();
      },

      getEmployeeSearchDialogCustomOptions() {
        return {
          searchConditions: {
            Persa: this.getAppointeeProperty('Persa'),
          },
        };
      },

      onRefAdd() {
        this.onEmployeeSearchOpenForRef();
      },

      onRefDel() {
        const oViewModel = this.getViewModel();
        const aApprovals = oViewModel.getProperty('/approval/list');
        const oTable = this.byId('approvalStatusTable');
        const aSelectedIndices = oTable.getSelectedIndices();

        if (aSelectedIndices.length < 1) {
          MessageBox.alert(this.getBundleText('MSG_00020', 'LABEL_00110')); // {삭제}할 행을 선택하세요.
          return;
        }

        // 선택된 행을 삭제하시겠습니까?
        MessageBox.confirm(this.getBundleText('MSG_00021'), {
          onClose: (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;

            const aUnSelectedData = aApprovals.filter((elem, idx) => {
              return !aSelectedIndices.some(function (iIndex) {
                return iIndex === idx;
              });
            });

            oViewModel.setProperty(
              '/approval/list',
              _.map(aUnSelectedData, (o, i) => _.set(o, 'Seqnr', _.toString(i + 1)))
            );
            oViewModel.setProperty('/approval/rowCount', Math.min(aUnSelectedData.length, 5));

            oTable.clearSelection();
            this.setDetailsTableStyle();
          },
        });
      },

      onApprovalRefSelectSuggest(oEvent) {
        const oViewModel = this.getViewModel();
        const oInput = oEvent.getSource();
        const oSelectedSuggestionRow = oEvent.getParameter('selectedRow');

        if (oSelectedSuggestionRow) {
          const oContext = oSelectedSuggestionRow.getBindingContext();
          const mSuggestionData = oContext.getObject();
          const sRowPath = oInput.getParent().getBindingContext().getPath();

          oInput.setValue(mSuggestionData.Ename);

          oViewModel.setProperty(`${sRowPath}/Perpic`, mSuggestionData.Picurl);
          oViewModel.setProperty(`${sRowPath}/Pernr`, mSuggestionData.Pernr);
          oViewModel.setProperty(`${sRowPath}/Orgeh`, mSuggestionData.Orgeh);
          oViewModel.setProperty(`${sRowPath}/Orgtx`, mSuggestionData.Orgtx);
          oViewModel.setProperty(`${sRowPath}/Zzcaltl`, mSuggestionData.Zzcaltl);
          oViewModel.setProperty(`${sRowPath}/Zzcaltltx`, mSuggestionData.Zzcaltltx);
          oViewModel.setProperty(`${sRowPath}/Zzpsgrptx`, mSuggestionData.Zzpsgrptx);
        }

        oInput.getBinding('suggestionRows').filter([]);
      },

      onApprovalRefSubmitSuggest(oEvent) {
        const oViewModel = this.getViewModel();
        const oInput = oEvent.getSource();
        const oContext = oInput.getParent().getBindingContext();
        const sRowPath = oContext.getPath();
        const sInputValue = oEvent.getParameter('value');

        if (!sInputValue) {
          oViewModel.setProperty(`${sRowPath}/Perpic`, null);
          oViewModel.setProperty(`${sRowPath}/Ename`, null);
          oViewModel.setProperty(`${sRowPath}/Pernr`, null);
          oViewModel.setProperty(`${sRowPath}/Orgeh`, null);
          oViewModel.setProperty(`${sRowPath}/Orgtx`, null);
          oViewModel.setProperty(`${sRowPath}/Zzcaltl`, null);
          oViewModel.setProperty(`${sRowPath}/Zzcaltltx`, null);
          oViewModel.setProperty(`${sRowPath}/Zzpsgrptx`, null);

          return;
        }

        const aEmployees = oViewModel.getProperty('/settings/Employees');
        const [mEmployee] = _.filter(aEmployees, (o) => _.startsWith(o.Ename, sInputValue));

        if (!_.isEmpty(mEmployee)) {
          oViewModel.setProperty(`${sRowPath}/Perpic`, mEmployee.Picurl);
          oViewModel.setProperty(`${sRowPath}/Pernr`, mEmployee.Pernr);
          oViewModel.setProperty(`${sRowPath}/Orgeh`, mEmployee.Orgeh);
          oViewModel.setProperty(`${sRowPath}/Orgtx`, mEmployee.Orgtx);
          oViewModel.setProperty(`${sRowPath}/Zzcaltl`, mEmployee.Zzcaltl);
          oViewModel.setProperty(`${sRowPath}/Zzcaltltx`, mEmployee.Zzcaltltx);
          oViewModel.setProperty(`${sRowPath}/Zzpsgrptx`, mEmployee.Zzpsgrptx);
        }
      },

      onTargetUserChange() {
        this.onEmployeeSearchOpen();
      },

      async callbackAppointeeChange({ Pernr, Ename, Werks, Pbtxt, Orgtx }) {
        if (!Pernr) return false;

        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/pernr', Pernr);
        oViewModel.setProperty('/Pernr', Pernr);
        oViewModel.setProperty('/Werks', Werks);
        oViewModel.setProperty('/entry/TimePersProfileInfo/ProfileName', Ename);
        oViewModel.setProperty('/entry/TimePersProfileInfo/ProfilePb', Pbtxt);
        oViewModel.setProperty('/entry/TimePersProfileInfo/ProfileTeam', Orgtx);
        oViewModel.setProperty('/entry/TimePersProfileInfo/Photo', this.getAppointeeProperty('Photo'));

        oViewModel.setProperty('/Checklist/dialog/completePledgeYN', 'N');

        await this.createAppnoWithAccess(); // 최초 로그인 시 Appno 생성

        await Promise.all([
          // await this.retrieveMyMonthlyStatus(), // Default 근무 시간 및 휴게시간
          this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
          this.retrieveTimePersInfo(), //
          this.retrieveMyCoreTimeCalendar(),
        ]);

        if (!this.MonthPlanBoxHandler) {
          await this.setMonthPlanBoxHandler();

          this._setScrollContainerHeight();
          window.addEventListener('resize', this._setScrollContainerHeight.bind(this));
          //  // Indicator Graph Data 입력
          //  setTimeout(() => this.retrieveMonth(), 0);
        }
        this.MonthPlanBoxHandler.makeCalendarControl(oViewModel.getProperty('/year'), oViewModel.getProperty('/month'));
        // Indicator Graph Data 입력
        setTimeout(() => this.retrieveMonth(), 0);
      },

      async setMonthPlanBoxHandler() {
        const oViewModel = this.getViewModel();
        const sYear = oViewModel.getProperty('/year'),
          sMonth = oViewModel.getProperty('/month'),
          sPernr = oViewModel.getProperty('/pernr');

        this.MonthPlanBoxHandler = new MonthPlanBoxHandler({ oController: this, sPernr, sYear, sMonth });
      },

      // 해당 일자의 휴무 신청 내역
      async getAbsenceData() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          const vAppno = oViewModel.setProperty('/form/Appno');
          if (vAppno == '') return [];
          const aResults = await Client.getEntitySet(oModel, 'PersTimeAbsence', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Appno: vAppno,
          });
        } catch (oError) {
          throw oError;
        }
      },

      // 첨부파일 조회를 위한 Old Appno 조회
      async readAttachAppno() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          const aResults = await Client.getEntitySet(oModel, 'PersTimeAbsence', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Daylst: oViewModel.getProperty('/form/dialog/data/Daylst'),
            Prcty: 'R',
          });

          oViewModel.setProperty('/form/dialog/data/FileAppno', aResults[0].Appno);
        } catch (oError) {
          throw oError;
        }
      },

      /*
      저장하기 전 Stdaz, Abrtg, Abrst 조회
      */
      async getAbsenceDataInfo() {
        try {
          const oViewModel = this.getViewModel();
          const vFormData = _.cloneDeep(oViewModel.getProperty('/form/dialog/data'));

          // http://dsghrerpq01.corp.doosan.com:8000/sap/opu/odata/sap/ZHRXX_HRCALENDAR_SRV/PersTimeAbsenceSet(Tmdat=datetime'2024-10-29T00:00:00',Awart='A100',Appno='0003705145',Pernr='01616119',Awrsn='A1KR0020',Datim='T',Beguz='',Enduz='')

          const aResults = await Client.getEntitySet(this.getViewModel(ServiceNames.MYTIME), 'NewPersTimeAbsence', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Appno: vFormData.Appno,
            Tmdat: this.DateUtils.parse(vFormData.Tmdat), //
            Awrsn: vFormData.Awrsn,
            Awart: vFormData.Awart,
            Datim: vFormData.Gubun === 0 ? 'D' : vFormData.Gubun === 1 || vFormData.Gubun === 2 || vFormData.Gubun === 3 || vFormData.Gubun === 4 ? 'T' : null,
            Beguz: vFormData.Beguz ? this.TimeUtils.toString(vFormData.Beguz, 'HHmm') : '',
            Enduz: vFormData.Enduz ? this.TimeUtils.toString(vFormData.Enduz, 'HHmm') : '',
            Pbeg1: vFormData.Pbeg1 ? this.TimeUtils.toString(vFormData.Pbeg1, 'HHmm') : '',
            Pend1: vFormData.Pend1 ? this.TimeUtils.toString(vFormData.Pend1, 'HHmm') : '',
            Pbeg2: vFormData.Pbeg2 && vFormData.Pbeg2.ms !== vFormData.Pend2.ms ? this.TimeUtils.toString(vFormData.Pbeg2, 'HHmm') : '',
            Pend2: vFormData.Pend2 && vFormData.Pbeg2.ms !== vFormData.Pend2.ms ? this.TimeUtils.toString(vFormData.Pend2, 'HHmm') : '',
          });

          // const aResults = await Client.get(this.getViewModel(ServiceNames.HRCALENDAR), oPath, {

          // });

          if (aResults && aResults.length > 0) {
            oViewModel.setProperty('/form/dialog/data/Stdaz', aResults[0].Stdaz);
            oViewModel.setProperty('/form/dialog/data/Abrtg', aResults[0].Abrtg);
            oViewModel.setProperty('/form/dialog/data/Abrst', aResults[0].Abrst);
          } else {
            oViewModel.setProperty('/form/dialog/data/Stdaz', '0.0');
            oViewModel.setProperty('/form/dialog/data/Abrtg', '0.0');
            oViewModel.setProperty('/form/dialog/data/Abrst', '0.0');
          }
          return '';
        } catch (oError) {
          this.debug('Controller > TimeRegistration > getAbsenceDataInfo Error', oError);

          AppUtils.handleError(oError);
          return 'Error';
        }
      },

      async deleteAbsenceDataCallCreate(vData) {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);

          var sParaObject = {
            Pernr: this.getAppointeeProperty('Pernr'),
            // Appno: vData.Appno,
            Appno: oViewModel.getProperty('/Appno'),
            Wrkty: 'C', //고정
            Tmaty: 'D',
            Temty: 'A',
            Awrsn: vData.Awrsn,
            Awart: vData.Awart,
            Beguz: vData.Beguz,
            Enduz: vData.Enduz,
            Daylst: vData.Tmdat,
            Dtrsn: vData.Dtrsn,
            Datim: vData.Datim, // 임시로 지정
            Tmdat: this.DateUtils.parse(vData.Tmdat), //
            // 정송이 수석 확인
            Begda: this.DateUtils.parse(vData.Tmdat), // 임시
            Endda: this.DateUtils.parse(vData.Tmdat), // 임시
            Stdaz: vData.Stdaz,
            Abrtg: vData.Abrtg,
            Abrst: vData.Abrst,
            Pbeg1: vData.Pbeg1,
            Pbeg2: vData.Pbeg2,
            Pend1: vData.Pend1,
            Pend2: vData.Pend2,
            Punb1: vData.Punb1,
            Punb2: vData.Punb2,
          };

          const mResult = await Client.create(oModel, 'PersTimeAbsence', sParaObject);

          if (mResult && mResult != '') {
            this.ClearFormData();
            await this.getMyDailyWorkTimeListMultiDays();
          } else {
            MessageBox.alert('삭제 처리가 실패하였습니다');
            return;
          }
        } catch (oError) {
          this.debug('Controller > Main > deleteProcess Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'dialog');
        }
      },

      async deleteAddWorkingDataCallCreate(vData) {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          var sParaObject = {
            Pernr: this.getAppointeeProperty('Pernr'),
            Appno: vData.Appno,
            Wrkty: 'C', // 고정
            Tmaty: 'D',
            Temty: 'A',
            Awrsn: vData.Awrsn,
            Awart: vData.Awart,
            Beguz: vData.Beguz,
            Enduz: vData.Enduz,
            Daylst: vData.Tmdat,
            Dtrsn: vData.Dtrsn,
            Datim: vData.Datim, // 임시로 지정
            Tmdat: this.DateUtils.parse(vData.Tmdat), //
            // 정송이 수석 확인
            Begda: this.DateUtils.parse(vData.Tmdat), // 임시
            Endda: this.DateUtils.parse(vData.Tmdat), // 임시
            Stdaz: vData.Stdaz,
            Abrtg: vData.Abrtg,
            Abrst: vData.Abrst,
          };

          const mResult = await Client.create(oModel, 'PersTimeAddWorking', sParaObject);

          if (mResult && mResult != '') {
            this.ClearFormData();
            await this.getMyDailyWorkTimeListMultiDays();
          } else {
            MessageBox.alert('삭제 처리가 실패하였습니다');
            return;
          }
        } catch (oError) {
          this.debug('Controller > Main > deleteProcess Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'dialog');
        }
      },
      /*
       삭제 시 신규 Appno 로 호출하도록 처리
      */
      async updatePersAddCoreTimeData(vData) {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.MYTIME);

          var sKey = {
            Pernr: this.getAppointeeProperty('Pernr'),
            // Appno: vData.Appno,
            Appno: oViewModel.getProperty('/Appno'),
            Tmdat: this.DateUtils.parse(vData.Tmdat), //
            Beguz: vData.Beguz,
            Enduz: vData.Enduz,
            Awart: vData.Awart == null ? '' : vData.Awart,
            Awrsn: vData.Awrsn == null ? '' : vData.Awrsn,
            Wrkty: oViewModel.getProperty('/Wrkty'),
          };

          const mResult = await Client.get(oModel, 'PersAddCoreTime', sKey);

          if (mResult && typeof mResult == 'object') {
            this.ClearFormData();
            await this.getMyDailyWorkTimeListMultiDays();
          } else {
            MessageBox.alert('삭제 처리가 실패하였습니다');
            return;
          }
        } catch (oError) {
          this.debug('Controller > Main > deleteProcess Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'dialog');
        }
      },

      async deleteAbsenceProcess(vData) {
        const oViewModel = this.getViewModel();

        try {
          const oModel = this.getModel(ServiceNames.HRCALENDAR);

          await Client.remove(oModel, 'PersTimeAbsence', {
            // Appno: vData.Appno,
            Appno: oViewModel.getProperty('/Appno'),
            Beguz: vData.Beguz,
            Enduz: vData.Enduz,
            Pernr: this.getAppointeeProperty('Pernr'),
            Tmdat: this.DateUtils.parse(vData.Tmdat),
            Awart: vData.Awart,
            Awrsn: vData.Awrsn,
            Datim: vData.Datim,
          });

          this.ClearFormData();
          MessageBox.success(this.getBundleText('삭제되었습니다.'), {
            onClose: () => this.getMyDailyWorkTimeListMultiDays(),
          });
        } catch (oError) {
          this.debug('Controller > shiftChange Detail > deleteProcess Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async deleteAddWorkingProcess(vData) {
        const oViewModel = this.getViewModel();

        try {
          const oModel = this.getModel(ServiceNames.HRCALENDAR);
          // const vData = oViewModel.getProperty('/form/dialog/data');

          await Client.remove(oModel, 'PersTimeAddWorking', {
            Appno: vData.Appno,
            Beguz: vData.Beguz,
            Enduz: vData.Enduz,
            Pbeg1: vData.Pbeg1,
            Pend1: vData.Pend1,
            Pbeg2: vData.Pbeg2,
            Pend2: vData.Pend2,
            Pbeg3: '',
            Pend3: '',
            Pernr: this.getAppointeeProperty('Pernr'),
            Tmdat: this.DateUtils.parse(vData.Tmdat),
            Prcty: vData.Prcty, // 'T',
          });
          this.ClearFormData();
          MessageBox.success(this.getBundleText('삭제되었습니다.'), {
            onClose: () => this.getMyDailyWorkTimeListMultiDays(),
          });
        } catch (oError) {
          this.debug('Controller > shiftChange Detail > deleteProcess Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false);
        }
      },

      async deleteAbsenceData(rFormData) {
        try {
          // 선택된 신청 건을 삭제하겠습니까 ?
          MessageBox.confirm('선택된 신청 건을 삭제하겠습니까 ?', {
            onClose: async function (sAction) {
              if (MessageBox.Action.CANCEL === sAction) return;

              this.setContentsBusy(true);

              try {
                await this.deleteAbsenceProcess(rFormData);
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

      async deleteAddWorkingData(rFormData) {
        try {
          // 선택된 신청 건을 삭제하겠습니까 ?
          MessageBox.confirm('선택된 신청 건을 삭제하겠습니까 ?', {
            onClose: async function (sAction) {
              if (MessageBox.Action.CANCEL === sAction) return;

              this.setContentsBusy(true);

              try {
                await this.deleteAddWorkingProcess(rFormData);
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

      async createAppnoWithAccess() {
        const oViewModel = this.getViewModel();
        const oModel = this.getModel(ServiceNames.HRCALENDAR);
        const sFirtDay = oViewModel.getProperty('/firstDay'),
          sLastDay = oViewModel.getProperty('/lastDay');

        console.log('oModel_' + oModel);
        console.log('sFirtDay_' + sFirtDay);
        console.log('sLastDay_' + sLastDay);
        try {
          const mResult = await Client.create(oModel, 'PersTimeApply', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Begda: this.DateUtils.parse(sFirtDay),
            Endda: this.DateUtils.parse(sLastDay),
            Wrkty: oViewModel.getProperty('/Wrkty'),
          });

          oViewModel.setProperty('/Appno', mResult.Appno);
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwartCombo Error', oError);

          AppUtils.handleError(oError);
        }
      },

      async onChangeAwartCombo() {
        try {
          await this.retrieveTimeReasonList();
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwartCombo Error', oError);

          AppUtils.handleError(oError);
        }
      },

      //Datim 을 조회 및 입력,
      async onChangeAwrsnCombo(oEvent) {
        const oViewModel = this.getViewModel();
        const oEventSource = oEvent.getSource();
        const pSelectedKey = oEvent.getSource().getSelectedKey();
        try {
          const vReason = _.find(oViewModel.getProperty('/entry/AllTimeReason'), { Awrsn: pSelectedKey });

          // 국내출장 OR 해외출장일 경우 && 중공업 인 경우 출장자 안전 cHECK LIST 및 서약서 팝업 오픈
          if (['B2XXXX10', 'B2XXXX20'].includes(pSelectedKey) && this.getAppointeeProperty('Persa') === '0900') this.callTravelPledgePopup();

          if (pSelectedKey == 'C2XXXX50') {
            MessageBox.alert('본 근태사유는 BG HR팀과 사전 협의한 후 지정하시기 바랍니다.');
          }

          // 사유가 반차일 경우 설정
          // if (vReason.Awrsn === 'A1KR0110') {
          //   const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');

          //   oViewModel.setProperty('/form/dialog/data/Datim', vReason.Datim);
          //   oViewModel.setProperty('/form/dialog/data/RadioControl', '');
          //   oViewModel.setProperty('/form/dialog/data/Gubun', 2);
          //   oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(vMyMonthlyStatus.Cbeg1));
          //   oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(vMyMonthlyStatus.Cend1));
          // } else {
          //   oViewModel.setProperty('/form/dialog/data/Datim', vReason.Datim);
          //   oViewModel.setProperty('/form/dialog/data/RadioControl', this.getDatimToRadioControl(pSelectedKey));
          //   oViewModel.setProperty('/form/dialog/data/Gubun', vReason.Datim === 'D' ? 0 : vReason.Datim === 'T' ? 1 : null);
          //   // 시간 조회
          //   if (vReason.Datim != 'X') {
          //     await this.getWorkingTime();
          //   }
          // }
          if (pSelectedKey == '') {
            oViewModel.setProperty('/form/dialog/data/Datim', null);
            oViewModel.setProperty('/form/dialog/data/RadioControl', null);
            oViewModel.setProperty('/form/dialog/data/Gubun', null);
            oViewModel.setProperty('/form/dialog/data/Atcyn', null);
          } else {
            oViewModel.setProperty('/form/dialog/data/Datim', vReason.Datim);
            oViewModel.setProperty('/form/dialog/data/RadioControl', this.getDatimToRadioControl(pSelectedKey));
            oViewModel.setProperty('/form/dialog/data/Gubun', vReason.Datim === 'D' ? 0 : vReason.Datim === 'T' ? 1 : null);
            oViewModel.setProperty('/form/dialog/data/Atcyn', vReason.Atcyn);
            if (pSelectedKey == 'C2XXXX50') {
              oViewModel.setProperty('/form/dialog/data/Gubun', 2);
              oViewModel.setProperty('/form/dialog/data/RadioControl', '');
              oViewModel.setProperty('/form/dialog/data/Atcyn', 'X');
              vReason.Atcyn = 'X';
            }
          }

          // 시간 조회
          if (vReason && vReason.Datim != 'X' && pSelectedKey != 'C2XXXX50') {
            await this.getWorkingTime();
          }
          // 시간 Control Editable 설정
          await this.setBeguzEditable();
          // 휴게 Control Visible 설정
          await this.checkPBBox();
          // Default Break Time 설정
          this.setDefaultBreakTime();
          // 반차, 반반차일 경우 RadioButton 을 Edit 할 수 있도록 설정
          if (vReason && (vReason.Awrsn === 'A1KR0110' || vReason.Awrsn === 'A1KR0120' || vReason.Awrsn === 'A1KR0140' || vReason.Awrsn === 'A1KR0150')) {
            oViewModel.setProperty('/form/dialog/data/RadioControl', 'X');
          }
          // 첨부파일 기본 설정(조회)
          if (vReason && vReason.Atcyn === 'X') {
            this.readAttachAppno();
            this.settingsAttachTable();
          }

          if (pSelectedKey == 'C2XXXX50') {
            await this.onSelectGubunRadion();
          }
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwrsnCombo Error', oError);

          AppUtils.handleError(oError);
        }
      },

      async getWorkingTime() {
        const oViewModel = this.getViewModel();
        const mDialogFormData = oViewModel.getProperty('/form/dialog/data');

        try {
          const mResult = await Client.get(this.getViewModel(ServiceNames.HRCALENDAR), 'PersTimeAbsence', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Appno: mDialogFormData.Appno,
            Tmdat: this.DateUtils.parse(mDialogFormData.Tmdat), //
            Awrsn: mDialogFormData.Awrsn,
            Awart: mDialogFormData.Awart,
            Datim: mDialogFormData.Datim,
            Beguz: '',
            Enduz: '',
          });

          oViewModel.setProperty('/form/dialog/data/Datim', mResult.Datim);
          oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(mResult.Beguz));
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(mResult.Enduz));
          oViewModel.setProperty('/form/dialog/data/Stdaz', mResult.Stdaz);
          oViewModel.setProperty('/form/dialog/data/Abrtg', mResult.Abrtg);
          oViewModel.setProperty('/form/dialog/data/Abrst', mResult.Abrst);
          oViewModel.setProperty('/form/dialog/data/Gubun', mResult.Datim === 'D' ? 0 : mResult.Datim === 'T' || mResult.Datim === 'X' ? 1 : null);
        } catch (oError) {
          // 에러시 Clear 는 추가 확인 필요
          // oViewModel.setProperty('/form/dialog/data/Datim', null);
          // oViewModel.setProperty('/form/dialog/data/Beguz', null);
          // oViewModel.setProperty('/form/dialog/data/Enduz', null);
          // oViewModel.setProperty('/form/dialog/data/Stdaz', null);
          // oViewModel.setProperty('/form/dialog/data/Abrtg', null);
          // oViewModel.setProperty('/form/dialog/data/Abrst', null);
          // oViewModel.setProperty('/form/dialog/data/Info', null);

          // this.byId('startWorkTime').setValue(null).setDateValue(null);
          // this.byId('endWorkTime').setValue(null).setDateValue(null);

          this.debug('Controller > TimeRegistration Detail > getWorkingTime Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.setContentsBusy(false, 'period');
        }
      },

      async setBeguzEditable() {
        const oViewModel = this.getViewModel();
        const mDialogFormData = oViewModel.getProperty('/form/dialog/data');
        /*
        if (
          mDialogFormData.Awart == 'A100' &&
          mDialogFormData.Awrsn != 'A1KR0050' &&
          mDialogFormData.Awrsn != 'A1KR0110' &&
          mDialogFormData.Awrsn != 'A1KR0120' &&
          mDialogFormData.Awrsn != 'A1KR0130'
        ) {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
        } else if (mDialogFormData.Awart == 'A150' && mDialogFormData.Awrsn != 'A1KR0100' && mDialogFormData.Awrsn != 'A1KR0150' && mDialogFormData.Awrsn != 'A1KR0160') {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
        } else if (mDialogFormData.Awrsn == 'A4XXXX30' || mDialogFormData.Awrsn == 'A4XXXX40') {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
        } else if (mDialogFormData.Gubun == 2) {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
        } else if (oViewModel.getProperty('/form/dialog/data/OrderType') == '' && mDialogFormData.Gubun == 1) {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', true);
        } else {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
        }*/

        if (oViewModel.getProperty('/form/dialog/data/OrderType') == '' && mDialogFormData.Gubun == 1) {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', true);
        } else {
          oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
        }
      },

      async retrieveMonth() {
        const oViewModel = this.getViewModel();
        const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');

        const mWeekTimeData = {
          Alwtm: _.toString(vMyMonthlyStatus.Monwh), // 당월 필요근무 시간
          Datum: null,
          Maxtm: _.toString(vMyMonthlyStatus.Monmh), // 법정최대근무 시간
          Reltm: _.toString(vMyMonthlyStatus.Resultmh), // 근무 실적 (임시)
          Trendpoint1: _.toString(vMyMonthlyStatus.BashrA), // 당월 근무 계획 시간
          Trendpoint1T: _.toString(vMyMonthlyStatus.BashrAT),
        };

        await this.buildDialChart(mWeekTimeData);

        // setTimeout(() => {
        //   var element = document.querySelector('[class$=dataset-top-label]');
        //   if (element) {
        //     element.innerHTML =
        //       "<text opacity='1' fill-opacity='1' fill='#333333' x='80' text-anchor='end' stroke='none' y='180' style='text-anchor: end;'>0H</text><text opacity='1' fill-opacity='1' fill='#333333' x='240' text-anchor='start' stroke='none' y='180' style='text-anchor: start;'>222H</text>";
        //   }
        // }, 100);

        setTimeout(
          async () => {
            console.log('vMyMonthlyStatus_' + vMyMonthlyStatus);
            var element = document.querySelector('[class$=dataset-top-label]');
            if (element) {
              element.innerHTML =
                "<text opacity='1' fill-opacity='1' fill='#333333' x='80' text-anchor='end' stroke='none' y='180' style='text-anchor: end;'>0H</text><text opacity='1' fill-opacity='1' fill='#333333' x='240' text-anchor='start' stroke='none' y='180' style='text-anchor: start;'>" +
                '<title>법정 최대 근무 가능시간​</title>' +
                vMyMonthlyStatus.MonmhT +
                '</text>';
            }
            var element2 = document.querySelector('[class$=axis-trend-label]');
            if (element2) {
              // const idx = element2.innerHTML.indexOf('>');
              // const length = element2.innerHTML.length;
              // // element2.innerHTML = element2.innerHTML.substring(0, idx + 1) + '<title>당월 계획근무 시간​</title>' + element2.innerHTML.substring(idx + 1, length);
              // element2.innerHTML = element2.innerHTML.substring(0, idx + 1) + element2.innerHTML.substring(idx + 1, length);
            }
          },
          100,
          vMyMonthlyStatus
        );
      },

      buildDialChart(mWeekTimeData) {
        const oChart = FusionCharts(this.sDialChartId);
        const iGaugeOriginY = 150; // 150 + 75 : (chart box height 50%) + (chart real height 50%)

        if (!oChart) {
          FusionCharts.ready(() => {
            FusionCharts.getInstance({
              id: this.sDialChartId,
              type: 'angulargauge',
              renderAt: this.sDialChartDiv,
              width: 320,
              height: 180,
              dataFormat: 'json',
              dataSource: {
                chart: this.getDialChartOption(iGaugeOriginY),
                colorrange: {
                  // minvalue: 0,
                  startlabel: '0HHH',
                  endlabel: '222HHH',
                  color: [
                    {
                      minvalue: 0,
                      maxvalue: mWeekTimeData.Alwtm,
                      code: '#34649d',
                      displayvalue: '000000',
                    },
                    {
                      minvalue: mWeekTimeData.Alwtm,
                      maxvalue: mWeekTimeData.Maxtm,
                      code: '#fdde17',
                      displayvalue: '1111111',
                    },
                  ],
                },
                dials: {
                  dial: [
                    {
                      showValue: 1,
                      value: mWeekTimeData.Reltm,
                      valueY: iGaugeOriginY + 13,
                      baseWidth: 4,
                      rearExtension: 0,
                      toolText: '근무 실적시간 (마감 실적 누계)​',
                    },
                  ],
                },
                trendpoints: {
                  point: [
                    {
                      startvalue: mWeekTimeData.Trendpoint1,
                      displayvalue: mWeekTimeData.Trendpoint1T,
                      entityToolText: '당월 계획 근무시간​',
                      // displayvalue: '22222222',

                      thickness: '1',
                      color: '#333333',
                      usemarker: '1',
                      markerbordercolor: '#333333',
                      // markertooltext: mWeekTimeData.Trendpoint1T,
                      markertooltext: '당월 계획 근무시간​',
                      tooltext: '당월 계획 근무시간​',
                    },
                  ],
                },
              },
            }).render();
          });
        } else {
          oChart.setChartData(
            {
              chart: this.getDialChartOption(iGaugeOriginY),
              colorrange: {
                color: [
                  {
                    minvalue: 0,
                    maxvalue: mWeekTimeData.Alwtm,
                    code: '#34649d',
                    displayvalue: '000000',
                  },
                  {
                    minvalue: mWeekTimeData.Alwtm,
                    maxvalue: mWeekTimeData.Maxtm,
                    code: '#fdde17',
                    displayvalue: '11111',
                  },
                ],
              },
              dials: {
                dial: [
                  {
                    showValue: 1,
                    value: mWeekTimeData.Reltm,
                    valueY: iGaugeOriginY + 13,
                    baseWidth: 4,
                    rearExtension: 0,
                    toolText: '근무 실적시간 (마감 실적 누계)​',
                  },
                ],
              },
              trendpoints: {
                point: [
                  {
                    startvalue: mWeekTimeData.Trendpoint1,
                    displayvalue: mWeekTimeData.Trendpoint1T,
                    thickness: '1',
                    color: '#333333',
                    usemarker: '1',
                    markerbordercolor: '#333333',
                    // markertooltext: mWeekTimeData.Trendpoint1T,
                    markertooltext: '당월 계획 근무시간​',
                  },
                ],
              },
            },
            'json'
          );
          oChart.render();
        }
      },

      // WeekWorkTime Chart
      getDialChartOption(iGaugeOriginY) {
        return FusionCharts.curryChartOptions({
          gaugeOriginY: iGaugeOriginY,
          gaugeOuterRadius: 90,
          gaugeInnerRadius: 60,
          majorTMNumber: 13,
          majorTMColor: '#333333',
          majorTMHeight: -2.5,
          majorTMThickness: 0,
          tickValueDistance: 10,
          tickValueStep: 20,
          showPlotBorder: 0,
          showGaugeBorder: 0,
          showPivotBorder: 0,
          // lowerlimit: "0",
          // upperlimit: "238.3",
          // pivotRadius: 3,
          pivotFillColor: '#000000',
          showTooltip: 1,
          numbersuffix: 'H',
          // placeTicksInside: '1',
          // placeValuesInside: '1'
        });
      },

      async onClickSusda(oEvent) {
        const oViewModel = this.getViewModel();
        const oEventSource = oEvent.getSource();
        const mSelectedInfo = oEventSource.data();

        const oView = this.getView();

        if (!this.pFormDialog) {
          this.pFormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeRegistration.fragment.FormDialog',
            controller: this,
          });

          oView.addDependent(this.pFormDialog);
        }

        const index = mSelectedInfo.day;
        var vMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/' + index);

        if (vMyCoreTimeCalendar.Susdayn !== 'X') return;

        const checkResult = await this.checkPossiblePopupOpen(this.DateUtils.formatDateToYYYYMMDD(vMyCoreTimeCalendar.Tmdat), vMyCoreTimeCalendar);
        if (!checkResult) {
          return;
        }

        let vTmdatlist = [];
        vTmdatlist.push(this.DateUtils.formatDateToYYYYMMDD(vMyCoreTimeCalendar.Tmdat));
        oViewModel.setProperty('/form/dialog/tmdatList', vTmdatlist); // 팝업에서 선택한 일자 리스트를 저장
        oViewModel.setProperty('/form/dialog/data/Tmdat', this.DateUtils.formatDateToYYYYMMDD(vMyCoreTimeCalendar.Tmdat));
        oViewModel.setProperty('/form/dialog/data/DialogTmdat', this.DateUtils.formatDateToYYYYMMDD(vMyCoreTimeCalendar.Tmdat));
        // oViewModel.setProperty('/form/dialog/data/Appno', vMyCoreTimeCalendar.Appno2);
        oViewModel.setProperty('/form/dialog/data/Appno', oViewModel.getProperty('/Appno'));
        oViewModel.setProperty('/form/dialog/data/Holyn', vMyCoreTimeCalendar.Holyn);
        oViewModel.setProperty('/form/dialog/data/Stdaz', vMyCoreTimeCalendar.Stdaz);
        oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
        oViewModel.setProperty('/form/dialog/data/Temty', vMyCoreTimeCalendar.Temty);
        oViewModel.setProperty('/form/dialog/data/Pernr', vMyCoreTimeCalendar.Pernr);
        // oViewModel.setProperty('/form/dialog/data/Beguz', oController.TimeUtils.toEdm(vBeguz));
        // oViewModel.setProperty('/form/dialog/data/Enduz', oController.TimeUtils.toEdm(vEnduz));
        oViewModel.setProperty('/form/dialog/data/SusdaYN', ''); // 휴일대체 존재여부
        // "|" 구분자로 데이터를 받는 항목들
        oViewModel.setProperty('/form/dialog/data/Statt', vMyCoreTimeCalendar.Statt);
        oViewModel.setProperty('/dialog/addButtonAct', false);

        // 팝업 버튼 활성화 여부
        // 선택한 Cell 의 Appno 와 신규 생성된 Appno 가 같으면 버튼 활성화
        // 팝업의 안내 문구 활성화 여부
        if (oViewModel.getProperty('/form/dialog/data/Appno') == oViewModel.getProperty('/Appno')) {
          oViewModel.setProperty('/form/dialog/data/InfoOtherAppno', false);
          oViewModel.setProperty('/dialog/newButtonAct', true);
          oViewModel.setProperty('/form/dialog/data/Daylst', this.DateUtils.formatDateToYYYYMMDD(vMyCoreTimeCalendar.Tmdat));
        } else {
          oViewModel.setProperty('/form/dialog/data/InfoOtherAppno', true);
          oViewModel.setProperty('/dialog/newButtonAct', false);
          oViewModel.setProperty('/form/dialog/data/Daylst', await this.getBegdaFromAppnoList(oViewModel.getProperty('/form/dialog/data/Appno')));
        }

        await this.getMySusdaList();

        const vMyDailyWorkTimeList = oViewModel.getProperty('/form/dialog/MyDailyWorkTimeList');
        var vTmatx = '';
        oViewModel.setProperty('/form/dialog/data/Tmdat', this.DateUtils.formatDateToYYYYMMDD(vMyDailyWorkTimeList[0].Tmdat));
        oViewModel.setProperty('/form/dialog/data/DialogTmdat', this.DateUtils.formatDateToYYYYMMDD(vMyDailyWorkTimeList[0].Tmdat));
        let vAwartType = vMyDailyWorkTimeList[0].Awart.charAt(0) == 'C' ? 'A' : vMyDailyWorkTimeList[0].Awart.charAt(0);
        oViewModel.setProperty('/form/dialog/data/WorkButtonType', vAwartType == 'B' ? 'Emphasized' : 'Default');
        oViewModel.setProperty('/form/dialog/data/NoWorkButtonType', vAwartType == 'A' ? 'Emphasized' : 'Default');
        oViewModel.setProperty('/form/dialog/data/Awart', vMyDailyWorkTimeList[0].Awart); //
        oViewModel.setProperty('/form/dialog/data/Awrsn', vMyDailyWorkTimeList[0].Awrsn); //
        oViewModel.setProperty('/form/dialog/data/Dtrsn', vMyDailyWorkTimeList[0].Dtrsn); //
        oViewModel.setProperty('/form/dialog/data/Preas', vMyDailyWorkTimeList[0].Preas); ///
        oViewModel.setProperty('/form/dialog/data/AwartType', vAwartType); //
        oViewModel.setProperty('/form/dialog/MyDailyWorkTimeList/' + 0 + '/Selected', true);
        oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(vMyDailyWorkTimeList[0].Beguz));
        oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(vMyDailyWorkTimeList[0].Enduz));
        oViewModel.setProperty('/form/dialog/data/Pbeg1', this.TimeUtils.toEdm(vMyDailyWorkTimeList[0].Pbeg1));
        oViewModel.setProperty('/form/dialog/data/Pend1', this.TimeUtils.toEdm(vMyDailyWorkTimeList[0].Pend1));
        oViewModel.setProperty('/form/dialog/data/Pbeg2', this.TimeUtils.toEdm(vMyDailyWorkTimeList[0].Pbeg2));
        oViewModel.setProperty('/form/dialog/data/Pend2', this.TimeUtils.toEdm(vMyDailyWorkTimeList[0].Pend2));
        oViewModel.setProperty('/form/dialog/data/RadioControl', vMyDailyWorkTimeList[0].Datim);
        oViewModel.setProperty('/form/dialog/data/Datim', vMyDailyWorkTimeList[0].Datim);
        oViewModel.setProperty('/form/dialog/data/Gubun', vMyDailyWorkTimeList[0].Datim === 'D' ? 0 : vMyDailyWorkTimeList[0].Datim === 'T' ? 1 : null); // 시간근태로 설정
        oViewModel.setProperty('/form/dialog/data/OrderType', 'Susda'); //휴일대체
        oViewModel.setProperty('/form/dialog/data/Atcyn', '');
        // 우측 리스트의 Appno 를 입력
        oViewModel.setProperty('/form/dialog/data/Appno', vMyDailyWorkTimeList[0].Appno); //
        oViewModel.setProperty(
          '/form/dialog/data/Susda',
          vMyDailyWorkTimeList[0].Susda && vMyDailyWorkTimeList[0].Susda != '' ? this.DateUtils.formatDateToYYYYMMDD(vMyDailyWorkTimeList[0].Susda) : null
        ); // 대체 휴무일

        vTmatx = vMyDailyWorkTimeList[0].Tmatx;
        if (oViewModel.getProperty('/form/dialog/data/Atcyn') === 'X') {
          this.settingsAttachTable();
        }

        this.onSetAwartList();
        this.retrieveTimeReasonList(false, 'X');
        // 상황에 따른 휴계시간 박스 활성화
        this.checkPBBox();

        this.setBeguzEditable();

        // 사유 Entry 재설정
        await this.setPreasList();

        // 이후 Action 은 신규 Appno 로 처리
        // oViewModel.setProperty('/form/dialog/data/Appno', oViewModel.getProperty('/Appno'));

        this.pFormDialog.open();
      },

      async onClickDay(oEvent) {
        const oViewModel = this.getViewModel();
        const oEventSource = oEvent.getSource();
        const mSelectedInfo = oEventSource.data();

        const oView = this.getView();

        if (!this.pFormDialog) {
          this.pFormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeRegistration.fragment.FormDialog',
            controller: this,
          });

          oView.addDependent(this.pFormDialog);
        }
        const index = mSelectedInfo.day;
        var vMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/' + index);

        let vAwartType = 'B'; // 근무 vMyCoreTimeCalendar.Awart.charAt(0) == "C" ? "A" :  vMyCoreTimeCalendar.Awart.charAt(0);
        // let v00to06 = false;
        // 선택한 시간대가 아래와 같을 경우 1일 +
        if (mSelectedInfo.time == 24 || (mSelectedInfo.time >= 1 && mSelectedInfo.time <= 5)) {
          const sYear = mSelectedInfo.fullDate.substring(0, 4),
            sMonth = String(_.toNumber(mSelectedInfo.fullDate.substring(4, 6)) - 1),
            sDay = String(_.toNumber(mSelectedInfo.fullDate.substring(6, 8)) + 1);
          const tempDate = new Date(sYear, sMonth, sDay);
          mSelectedInfo.fullDate = this.DateUtils.formatDateToYYYYMMDD(tempDate);
          // v00to06 = true;
          vMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar')[index + 1];
        }

        const checkResult = await this.checkPossiblePopupOpen(mSelectedInfo.fullDate, vMyCoreTimeCalendar);
        if (!checkResult) {
          return;
        }

        // if (v00to06) vMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar')[index + 1];

        let vTmdatlist = [];
        vTmdatlist.push(mSelectedInfo.fullDate);
        oViewModel.setProperty('/form/dialog/tmdatList', vTmdatlist); // 팝업에서 선택한 일자 리스트를 저장
        oViewModel.setProperty('/form/dialog/data/Tmdat', mSelectedInfo.fullDate); // yyyymmdd
        oViewModel.setProperty('/form/dialog/data/DialogTmdat', mSelectedInfo.fullDate); // yyyymmdd
        oViewModel.setProperty('/form/dialog/data/WorkButtonType', vAwartType == 'B' ? 'Emphasized' : 'Default'); // 근무  "B300"
        oViewModel.setProperty('/form/dialog/data/NoWorkButtonType', vAwartType == 'A' ? 'Emphasized' : 'Default'); // 근무 "B3KR0120"
        oViewModel.setProperty('/form/dialog/data/Awart', 'B300');
        oViewModel.setProperty('/form/dialog/data/Awrsn', 'B3KR0120');
        oViewModel.setProperty('/form/dialog/data/AwartType', vAwartType); // 근무로 설정 "B"
        oViewModel.setProperty('/form/dialog/data/Appno', vMyCoreTimeCalendar.Appno === '0000000000' ? oViewModel.getProperty('/Appno') : vMyCoreTimeCalendar.Appno);
        oViewModel.setProperty('/form/dialog/data/Holyn', vMyCoreTimeCalendar.Holyn);
        oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
        oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(this.timeChange(mSelectedInfo.time)));
        oViewModel.setProperty('/form/dialog/data/Enduz', '');
        oViewModel.setProperty('/form/dialog/data/Tmdatyyyymmdd', moment(mSelectedInfo.fullDate).format('YYYY.MM.DD'));
        oViewModel.setProperty('/form/dialog/data/Wrkty', 'C'); // 근무로 설정
        oViewModel.setProperty('/form/dialog/data/Temty', vMyCoreTimeCalendar.Temty); // A
        oViewModel.setProperty('/form/dialog/data/Tmaty', vMyCoreTimeCalendar.Tmaty); // C
        oViewModel.setProperty('/form/dialog/data/RadioControl', this.getDatimToRadioControl(oViewModel.getProperty('/form/dialog/data/Awrsn')));
        oViewModel.setProperty('/form/dialog/data/Pernr', this.getAppointeeProperty('Pernr'));
        oViewModel.setProperty('/form/dialog/data/Datim', 'X'); // 근무 - 근무 X로 설정
        oViewModel.setProperty('/form/dialog/data/Gubun', 1); // 시간근태로 설정
        oViewModel.setProperty('/form/dialog/data/Pbeg1', '');
        oViewModel.setProperty('/form/dialog/data/Pbeg2', '');
        oViewModel.setProperty('/form/dialog/data/Pend1', '');
        oViewModel.setProperty('/form/dialog/data/Pend2', '');
        oViewModel.setProperty('/form/dialog/data/Preas', '');
        oViewModel.setProperty('/form/dialog/data/OrderType', '');
        oViewModel.setProperty('/form/dialog/data/Atcyn', this.getAtcyn(oViewModel.getProperty('/form/dialog/data/Awrsn')));
        oViewModel.setProperty('/form/dialog/data/Susda', null); // 대체 휴무일
        oViewModel.setProperty('/form/dialog/data/Ltext', vMyCoreTimeCalendar.Ltext);
        oViewModel.setProperty('/form/dialog/data/SusdaYN', vMyCoreTimeCalendar.Ltext.includes('휴일대체')); // 휴일대체 존재여부

        // 팝업 버튼 활성화 여부
        // 선택한 Cell 의 Appno 와 신규 생성된 Appno 가 같으면 버튼 활성화
        // 팝업의 안내 문구 활성화 여부
        if (oViewModel.getProperty('/form/dialog/data/Appno') == oViewModel.getProperty('/Appno')) {
          oViewModel.setProperty('/dialog/newButtonAct', true);
          oViewModel.setProperty('/dialog/addButtonAct', true);
          oViewModel.setProperty('/form/dialog/data/InfoOtherAppno', false);
          oViewModel.setProperty('/form/dialog/data/Daylst', mSelectedInfo.fullDate);
        } else {
          oViewModel.setProperty('/dialog/newButtonAct', false);
          oViewModel.setProperty('/dialog/addButtonAct', false);
          oViewModel.setProperty('/form/dialog/data/InfoOtherAppno', true);
          // 버튼들을 비활성화 처리하기 위해 임시로 X 를 입력
          oViewModel.setProperty('/form/dialog/data/OrderType', 'X');
          // 결재중인 Appno 를 조회하여 Appno 에 해당하는 모든 Begda 를 조회, Daylst 에 입력
          oViewModel.setProperty('/form/dialog/data/Daylst', await this.getBegdaFromAppnoList(oViewModel.getProperty('/form/dialog/data/Appno')));
        }

        this.onSetAwartList();
        // this.getBreakTime();
        this.retrieveTimeReasonList(false, 'X');
        // Appno 에 해당하는 신청 내역 조회
        await this.getMyDailyWorkTimeList();
        // 상황에 따른 휴계시간 박스 활성화
        await this.checkPBBox();
        // Default Break Time 설정
        await this.setDefaultBreakTime();

        await this.setBeguzEditable();
        // 사유 Entry 재설정
        await this.setPreasList();
        // Holiday Setting
        await this.checkHoliday();

        if (oViewModel.getProperty('/form/dialog/data/Appno') != oViewModel.getProperty('/Appno')) {
          MessageBox.information(this.getBundleText('MSG_00022'), {
            onClose: () => this.pFormDialog.open(),
          });
        } else {
          this.pFormDialog.open();
        }
      },

      changeTmdate() {},

      // 9 -> 0900 으로 변환
      timeChange(rDay) {
        rDay = rDay.padStart(2, '0') + '00';
        return rDay;
      },

      async getBegdaFromAppnoList(sAppno) {
        var aDaylst = '';
        try {
          const aResults = await Client.getEntitySet(this.getModel(ServiceNames.HRCALENDAR), 'PersTimeApply', { Appno: sAppno });

          for (var i = 0; i < aResults.length; i++) {
            if (aDaylst == '') aDaylst = this.DateUtils.formatDateToYYYYMMDD(aResults[i].Begda);
            else aDaylst = aDaylst + '/' + this.DateUtils.formatDateToYYYYMMDD(aResults[i].Begda);
          }
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwartCombo Error', oError);

          AppUtils.handleError(oError);
        }
        return aDaylst;
      },

      async pFormDialogWithAppno() {
        const oControl = this;
        const oController = oControl.getCustomData()[0].getValue().oController;
        const oViewModel = oController.getViewModel();
        const oView = oController.getView();
        var { Appno: vAppno, Tmdat: vTmdat, Beguz: vBeguz, Enduz: vEnduz } = oControl.data();

        if (!oController.pFormDialog) {
          oController.pFormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeRegistration.fragment.FormDialog',
            controller: oController,
          });

          oView.addDependent(oController.pFormDialog);
        }

        const day = _.toNumber(oController.DateUtils.formatDateToYYYYMMDD(vTmdat).substring(6, 8));
        const vMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar')[day];
        const checkResult = await oController.checkPossiblePopupOpen(oController.DateUtils.formatDateToYYYYMMDD(vTmdat), vMyCoreTimeCalendar);
        if (!checkResult) {
          return;
        }

        let vTmdatlist = [];
        vTmdatlist.push(oController.DateUtils.formatDateToYYYYMMDD(vTmdat));
        oViewModel.setProperty('/form/dialog/tmdatList', vTmdatlist); // 팝업에서 선택한 일자 리스트를 저장
        oViewModel.setProperty('/form/dialog/data/Tmdat', oController.DateUtils.formatDateToYYYYMMDD(vTmdat));
        oViewModel.setProperty('/form/dialog/data/DialogTmdat', oController.DateUtils.formatDateToYYYYMMDD(vTmdat));
        oViewModel.setProperty('/form/dialog/data/Appno', vAppno == '0000000000' ? oViewModel.getProperty('/Appno') : vAppno);
        oViewModel.setProperty('/form/dialog/data/Holyn', vMyCoreTimeCalendar.Holyn);
        oViewModel.setProperty('/form/dialog/data/Stdaz', vMyCoreTimeCalendar.Stdaz);
        oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
        oViewModel.setProperty('/form/dialog/data/Temty', vMyCoreTimeCalendar.Temty);
        oViewModel.setProperty('/form/dialog/data/Pernr', oController.getAppointeeProperty('Pernr'));
        oViewModel.setProperty('/form/dialog/data/Beguz', oController.TimeUtils.toEdm(vBeguz));
        oViewModel.setProperty('/form/dialog/data/Enduz', oController.TimeUtils.toEdm(vEnduz));
        oViewModel.setProperty('/form/dialog/data/SusdaYN', vMyCoreTimeCalendar.Ltext.includes('휴일대체')); // 휴일대체 존재여부
        // "|" 구분자로 데이터를 받는 항목들
        oViewModel.setProperty('/form/dialog/data/Statt', vMyCoreTimeCalendar.Statt);
        oViewModel.setProperty('/dialog/addButtonAct', false);

        // 팝업 버튼 활성화 여부
        // 선택한 Cell 의 Appno 와 신규 생성된 Appno 가 같으면 버튼 활성화
        // 팝업의 안내 문구 활성화 여부
        if (oViewModel.getProperty('/form/dialog/data/Appno') == oViewModel.getProperty('/Appno')) {
          oViewModel.setProperty('/form/dialog/data/InfoOtherAppno', false);
          oViewModel.setProperty('/dialog/newButtonAct', true);
          oViewModel.setProperty('/form/dialog/data/Daylst', oController.DateUtils.formatDateToYYYYMMDD(vTmdat));
        } else {
          oViewModel.setProperty('/form/dialog/data/InfoOtherAppno', true);
          oViewModel.setProperty('/dialog/newButtonAct', false);
          oViewModel.setProperty('/form/dialog/data/Daylst', await oController.getBegdaFromAppnoList(oViewModel.getProperty('/form/dialog/data/Appno')));
        }

        /*
          아래는 팝업 오픈 후 우측 신청 리스트에서 시작 시간이 같은 Data 조회
        */
        await oController.getMyDailyWorkTimeList();

        const vMyDailyWorkTimeList = oViewModel.getProperty('/form/dialog/MyDailyWorkTimeList');
        var vTmatx = '';
        for (var i = 0; i < vMyDailyWorkTimeList.length; i++) {
          if (vMyDailyWorkTimeList[i].Beguz == vBeguz && vMyDailyWorkTimeList[i].Enduz == vEnduz) {
            let vAwartType = vMyDailyWorkTimeList[i].Awart.charAt(0) == 'C' ? 'A' : vMyDailyWorkTimeList[i].Awart.charAt(0);
            oViewModel.setProperty('/form/dialog/data/WorkButtonType', vAwartType == 'B' ? 'Emphasized' : 'Default');
            oViewModel.setProperty('/form/dialog/data/NoWorkButtonType', vAwartType == 'A' ? 'Emphasized' : 'Default');
            oViewModel.setProperty('/form/dialog/data/Awart', vMyDailyWorkTimeList[i].Awart); //
            oViewModel.setProperty('/form/dialog/data/Awrsn', vMyDailyWorkTimeList[i].Awrsn); //
            oViewModel.setProperty('/form/dialog/data/Dtrsn', vMyDailyWorkTimeList[i].Dtrsn); //
            oViewModel.setProperty('/form/dialog/data/Preas', vMyDailyWorkTimeList[i].Preas); ///
            oViewModel.setProperty('/form/dialog/data/AwartType', vAwartType); //
            oViewModel.setProperty('/form/dialog/MyDailyWorkTimeList/' + i + '/Selected', true);
            oViewModel.setProperty('/form/dialog/data/Pbeg1', oController.TimeUtils.toEdm(vMyDailyWorkTimeList[i].Pbeg1));
            oViewModel.setProperty('/form/dialog/data/Pend1', oController.TimeUtils.toEdm(vMyDailyWorkTimeList[i].Pend1));
            oViewModel.setProperty('/form/dialog/data/Pbeg2', oController.TimeUtils.toEdm(vMyDailyWorkTimeList[i].Pbeg2));
            oViewModel.setProperty('/form/dialog/data/Pend2', oController.TimeUtils.toEdm(vMyDailyWorkTimeList[i].Pend2));
            oViewModel.setProperty('/form/dialog/data/RadioControl', oController.getDatimToRadioControl(vMyDailyWorkTimeList[i].Awrsn));
            oViewModel.setProperty('/form/dialog/data/Datim', vMyDailyWorkTimeList[i].Datim);
            oViewModel.setProperty('/form/dialog/data/Gubun', vMyDailyWorkTimeList[i].Datim === 'D' ? 0 : vMyDailyWorkTimeList[i].Datim === 'T' ? 1 : null); // 시간근태로 설정
            oViewModel.setProperty('/form/dialog/data/OrderType', vMyDailyWorkTimeList[i].OrderType);
            oViewModel.setProperty('/form/dialog/data/Atcyn', oController.getAtcyn(oViewModel.getProperty('/form/dialog/data/Awrsn')));
            // 우측 리스트의 Appno 를 입력
            oViewModel.setProperty('/form/dialog/data/Appno', vMyDailyWorkTimeList[i].Appno); //
            oViewModel.setProperty(
              '/form/dialog/data/Susda',
              vMyDailyWorkTimeList[i].Susda && vMyDailyWorkTimeList[i].Susda != '' ? oController.DateUtils.formatDateToYYYYMMDD(vMyDailyWorkTimeList[i].Susda) : null
            ); // 대체 휴무일
            vTmatx = vMyDailyWorkTimeList[i].Tmatx;
            if (oViewModel.getProperty('/form/dialog/data/Atcyn') === 'X') {
              oController.settingsAttachTable();
            }
            break;
          }
        }

        oController.onSetAwartList();
        // oController.getBreakTime();
        oController.retrieveTimeReasonList(false, 'X');
        // 상황에 따른 휴계시간 박스 활성화
        oController.checkPBBox();

        oController.setBeguzEditable();

        // 사유 Entry 재설정
        await oController.setPreasList();

        await oController.checkHoliday();

        if (oViewModel.getProperty('/form/dialog/data/Appno') != oViewModel.getProperty('/Appno') && vTmatx != '승인' && vTmatx != 'Approve') {
          MessageBox.information(oController.getBundleText('MSG_00022'), {
            onClose: () => oController.pFormDialog.open(),
          });
        } else {
          oController.pFormDialog.open();
        }
      },

      getAppnos() {
        const oViewModel = this.getViewModel();
        const vMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar');
        const vTmDat = oViewModel.getProperty('/form/dialog/data/Tmdat');
        var rAppnos = '';

        for (var i = 0; i < vMyCoreTimeCalendar.length; i++) {
          if (vTmDat == this.DateUtils.formatDateToYYYYMMDD(vMyCoreTimeCalendar[i].Tmdat)) {
            if (vMyCoreTimeCalendar[i].Appno != '' && vMyCoreTimeCalendar[i].Appno != '0000000000') {
              if (rAppnos != '') {
                rAppnos = rAppnos + '|' + vMyCoreTimeCalendar[i].Appno;
              } else {
                rAppnos = vMyCoreTimeCalendar[i].Appno;
              }
            }
          }
        }

        return rAppnos;
      },

      setAppnos(rAppno, rFlag = 'C') {
        const oViewModel = this.getViewModel();
        const oldAppnos = oViewModel.getProperty('/form/dialog/data/Appnos');
        if ((rFlag = 'C')) {
          if (oldAppnos && oldAppnos != '') {
            const splitAppno = oldAppnos.split('|');
            for (var i = 0; i < splitAppno.length; i++) {
              if (rAppno == splitAppno[i]) {
                return;
              }
            }
            oViewModel.setProperty('/form/dialog/data/Appnos', oldAppnos + '|' + rAppno);
          } else {
            oViewModel.setProperty('/form/dialog/data/Appnos', rAppno);
          }
        } else if ((rFlag = 'D')) {
          // 삭제일 경우 기존 Appno
          // 삭제 시에는 임시로 Appno 를 포함, Appno 에 다른 근태가 존재할 수 있음
          // if(oldAppnos && oldAppnos != ""){
          //   const splitAppno = oldAppnos.split("|");
          //   var newAppnos = "";
          //   for(var i=0; i< splitAppno.length; i++){
          //     if(rAppno == splitAppno[i]){
          //       if(newAppnos == "") newAppnos = splitAppno[i];
          //       else newAppnos = newAppnos + "|" +  splitAppno[i];
          //     }
          //   }
          //   oViewModel.setProperty('/form/dialog/data/Appnos',newAppnos);
          // }else{
          //   oViewModel.setProperty('/form/dialog/data/Appnos', "" );
          // }
        }
      },

      onSetAwartList(refreshReason = '') {
        const oViewModel = this.getViewModel();
        const vAwartType = oViewModel.getProperty('/form/dialog/data/AwartType'),
          vTimeTypes = oViewModel.getProperty('/entry/TimeTypes');
        var TimeTypesFilter = [];

        for (var i = 0; i < vTimeTypes.length; i++) {
          if (vTimeTypes[i].AwartType == vAwartType) {
            TimeTypesFilter.push(vTimeTypes[i]);
          }
        }
        oViewModel.setProperty('/entry/TimeTypesFilter', TimeTypesFilter);
        // 사유는 초기화
        if (refreshReason == 'X') oViewModel.setProperty('/entry/TimeReasons', []);
      },

      async onChangeAwartCombo() {
        try {
          const oViewModel = this.getViewModel();
          // 파일 첨부 비활성화
          oViewModel.setProperty('/form/dialog/data/Atcyn', '');

          await this.retrieveTimeReasonList();

          // this.setWorkPeriod();
          // this.callValidWorkTime();
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwartCombo Error', oError);

          AppUtils.handleError(oError);
        }
      },

      async onChangePreas() {
        // const oViewModel = this.getViewModel();
        // // 해외출장(휴일대체) 선택 시 근태구분은 일근태로 고정 && 에너빌리티
        // if (oViewModel.getProperty('/form/dialog/data/Preas') === '12' && this.getAppointeeProperty('Persa') === '0900') {
        //   // Radio 버튼 Editable False
        //   oViewModel.setProperty('/form/dialog/data/RadioControl', '');
        //   // Datim = D 로 설정
        //   oViewModel.setProperty('/form/dialog/data/Gubun', 0);
        //   oViewModel.setProperty('/form/dialog/data/Datim', 'D');
        //   // this.onSelectGubunRadion();
        //   // 근무 일자, 휴계시간 Editable false
        //   oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
        //   oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
        //   oViewModel.setProperty('/form/dialog/data/Pbeg1', this.TimeUtils.toEdm('1200'));
        //   oViewModel.setProperty('/form/dialog/data/Pend1', this.TimeUtils.toEdm('1300'));
        //   oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm('0800'));
        //   oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm('1700'));
        // }
      },

      async onChangeSusda() {
        const oViewModel = this.getViewModel();

        // if (oViewModel.getProperty('/form/dialog/data/Susda') != '') {
        //   if (oViewModel.getProperty('/form/dialog/data/Tmdat').substring(0, 6) != oViewModel.getProperty('/form/dialog/data/Susda').substring(0, 6)) {
        //     oViewModel.setProperty('/form/dialog/data/Susda', null);
        //     MessageBox.alert('휴일대체는 근태일자에 해당하는 월만 가능합니다.');
        //   }
        // }

        // 해외출장(휴일대체) 선택 시 근태구분은 일근태로 고정 && 에너빌리티
        if (this.getAppointeeProperty('Persa') === '0900' && oViewModel.getProperty('/form/dialog/data/Susda') != '') {
          // Radio 버튼 Editable False
          oViewModel.setProperty('/form/dialog/data/RadioControl', '');
          // Datim = D 로 설정
          oViewModel.setProperty('/form/dialog/data/Gubun', 0);
          oViewModel.setProperty('/form/dialog/data/Datim', 'D');
          // this.onSelectGubunRadion();
          // 근무 일자, 휴계시간 Editable false
          oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
          oViewModel.setProperty('/form/dialog/data/TimeEditable', false);
          oViewModel.setProperty('/form/dialog/data/Pbeg1', this.TimeUtils.toEdm('1200'));
          oViewModel.setProperty('/form/dialog/data/Pend1', this.TimeUtils.toEdm('1300'));
          oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm('0800'));
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm('1700'));
        } else if (this.getAppointeeProperty('Persa') === '0900') {
          // Radio 버튼 Editable True
          oViewModel.setProperty('/form/dialog/data/RadioControl', 'X');
          oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
          oViewModel.setProperty('/form/dialog/data/TimeEditable', true);
        }
      },

      /*
        닫기 버튼
      */
      async onPressFormDialogClose() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/form/dialog/data/Beguz', '');
        oViewModel.setProperty('/form/dialog/data/Enduz', '');
        oViewModel.setProperty('/form/dialog/data/Pbeg1', '');
        oViewModel.setProperty('/form/dialog/data/Pend1', '');
        oViewModel.setProperty('/form/dialog/data/Pbeg2', '');
        oViewModel.setProperty('/form/dialog/data/Pend2', '');
        oViewModel.setProperty('/form/dialog/data/Dtrsn', '');

        // 닫기 버튼 클릭 시 삭제를 한 건이 존재하면 팝업창 호출
        const MyDailyWorkTimeList = oViewModel.getProperty('/form/dialog/MyDailyWorkTimeList');
        var Delyn = '';
        for (var i = 0; i < MyDailyWorkTimeList.length; i++) {
          // 신규 Appno 이면서 삭제
          if (MyDailyWorkTimeList[i].Appno === oViewModel.getProperty('/Appno') && MyDailyWorkTimeList[i].Tmaty === 'D') {
            Delyn = 'X';
            break;
          }
        }

        if (Delyn == 'X') {
          MessageBox.alert('삭제 건이 있습니다. \n 반드시 하단의 신청하기 버튼을 눌러주셔야 신청/저장이 완료됩니다.');
        }

        oViewModel.setProperty('/contentsBusy/dialog', true);
        // 닫기 버튼 클릭 시 달력 조회
        await this.retrieveMyMonthlyStatus('X'); // 법정근무시간 등
        await this.retrieveMyCoreTimeCalendar();
        this.MonthPlanBoxHandler.makeCalendarControl(oViewModel.getProperty('/year'), oViewModel.getProperty('/month'));
        // Indicator Graph Data 입력
        setTimeout(() => this.retrieveMonth(), 0);
        this.pFormDialog.close();
        oViewModel.setProperty('/contentsBusy/dialog', false);
      },

      async onPressFormDialogCloseWithoutAction() {
        this.ClearFormData();
        this.pFormDialog.close();
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

      calMonth(rMonth) {
        if (rMonth + 1 < 10) return '0' + (rMonth + 1);
        else return '' + (rMonth + 1);
      },

      /* 등록 팝업에서 근무 버튼을 클릭 시 */
      onPressWorkButton() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/form/dialog/data/WorkButtonType', 'Emphasized');
        oViewModel.setProperty('/form/dialog/data/NoWorkButtonType', 'Default');
        oViewModel.setProperty('/form/dialog/data/Awart', '');
        oViewModel.setProperty('/form/dialog/data/Awrsn', '');
        oViewModel.setProperty('/form/dialog/data/AwartType', 'B'); // 근무로 설정
        this.onSetAwartList('X');
        // this.getBreakTime();
      },

      /* 등록 팝업에서 휴무 버튼을 클릭 시 */
      onPressNoWorkButton() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/form/dialog/data/WorkButtonType', 'Default');
        oViewModel.setProperty('/form/dialog/data/NoWorkButtonType', 'Emphasized');
        oViewModel.setProperty('/form/dialog/data/Awart', '');
        oViewModel.setProperty('/form/dialog/data/Awrsn', '');
        oViewModel.setProperty('/form/dialog/data/AwartType', 'A'); // 휴무 휴직
        this.onSetAwartList('X');
      },

      /* 적용버튼 클릭 */
      async onPressAddButton() {
        const oViewModel = this.getViewModel();

        var oFormData = oViewModel.getProperty('/form/dialog/data');
        const Beguz = _.toNumber(this.TimeUtils.toString(oFormData.Beguz, 'HHmm')),
          Enduz = _.toNumber(this.TimeUtils.toString(oFormData.Enduz, 'HHmm')),
          Pbeg1 = _.toNumber(this.TimeUtils.toString(oFormData.Pbeg1, 'HHmm')),
          Pbeg2 = _.toNumber(this.TimeUtils.toString(oFormData.Pbeg2, 'HHmm')),
          Pend1 = _.toNumber(this.TimeUtils.toString(oFormData.Pend1, 'HHmm')),
          Pend2 = _.toNumber(this.TimeUtils.toString(oFormData.Pend2, 'HHmm'));

        if (oFormData.Awrsn != 'A6XXXX10' && oFormData.Awrsn != 'A6XXXX20') {
          // 추가 버튼 클릭시 Validation Check
          if (Beguz % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Beguz', null);
            return;
          }
          if (Enduz % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Enduz', null);
            return;
          }

          // 10분단위 입력 여부 체크
          if (Pbeg1 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pbeg1', null);
            return;
          }
          if (Pbeg2 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pbeg2', null);
            return;
          }
          if (Pend1 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pend1', null);
            return;
          }
          if (Pend2 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pend2', null);
            return;
          }
        }

        if (oFormData.Awart == 'B300' && oFormData.Awrsn == 'B3KR0120') {
          if (Beguz < _.toNumber(this.TimeUtils.toString(oFormData.Enduz, 'HHmm')) && Beguz < 600 && Enduz > 600) {
            MessageBox.alert('야간근무(22:00 ~ 6:00)와 휴일연장근무(휴일 근무 8시간 초과)는 분리하여 등록 부탁 드립니다.​​​');
            return;
          } // ex. 03시 ~ 08시 신청

          if (Beguz > Enduz && Enduz > 600) {
            MessageBox.alert('야간근무(22:00 ~ 6:00)와 휴일연장근무(휴일 근무 8시간 초과)는 분리하여 등록 부탁 드립니다.');
            return;
          } // ex. 23시 ~ (D+1)08시 신청
        }

        if (Beguz < _.toNumber(this.TimeUtils.toString(oFormData.Enduz, 'HHmm')) && Beguz < 2200 && Enduz > 2200) {
          MessageBox.alert('근무시간이 야간근무와 겹치는 경우에는 분리하여 등록 부탁 드립니다. 예) 21:00~22:00 / 22:00~23:00​​​');
          return;
        } // // ex. 21시 ~ 23시 신청

        if (Beguz > Enduz && Beguz < 2200) {
          MessageBox.alert('근무시간이 야간근무와 겹치는 경우에는 분리하여 등록 부탁 드립니다. 예) 21:00~22:00 / 22:00~23:00​​​');
          return;
        } // ex. 21시 ~ (D+1)02시 신청

        if (Beguz >= 2200 && Enduz <= 600) {
          if (oFormData.Awart != 'B300' || oFormData.Awrsn != 'B3KR0120') {
            MessageBox.alert('22시 ~ 06시에는 근무 - 근무 만 신청 바랍니다.');
            return;
          }
        }
        // 코어타임휴무(야간대체)은 첨부파일 필수 체크하지 않음.
        if (oFormData.Atcyn === 'X' && oFormData.Awrsn != 'C2XXXX50' && this.FileAttachmentBoxHandler.getFileCount() < 1) {
          MessageBox.alert('선택한 사유일 경우 첨부파일 등록이 필수 입니다. 첨부파일 등록 바랍니다.');
          return;
        }

        if (oFormData.Susda != null && oFormData.Tmdat.substring(0, 6) > oFormData.Susda.substring(0, 6)) {
          MessageBox.alert('입력한 휴일대체의 년월은 근태일자의 년월보다 작을 수 없습니다.');
          return;
        }

        /* 추가하기 전에 근태시간 계산 호출*/
        const aResult = await this.getAbsenceDataInfo();

        if (aResult == '') {
          const aStdaz = _.cloneDeep(oViewModel.getProperty('/form/dialog/data/Stdaz')),
            aHolyn = oViewModel.getProperty('/form/dialog/data/Holyn');

          if (aStdaz && _.toNumber(aStdaz) > 8 && aHolyn == 'X') {
            MessageBox.alert('휴일 근무 8시간 초과 하는 경우에는 8시간 초과하는 근무시간을 분리하여 등록 부탁 드립니다.​​​​​​​​');
            return;
          }

          if (oViewModel.getProperty('/Werks') === 'IB00' && oFormData.Holyn === 'X' && oFormData.Susda != null) {
            MessageBox.alert('휴일대체 사용은 가급적 해당 주 평일 사용, 업무 상 어려운 경우 앞 뒤 2주 내 사용 부탁 드립니다​​​​​​​​', {
              onClose: () => {
                oViewModel.setProperty('/contentsBusy/dialog', true);
                this.createPersAddCoreTime();
              },
            });
          } else if (oViewModel.getProperty('/Werks') === '0111' && oFormData.Awart === 'A400') {
            MessageBox.alert('무급휴가 사용 희망시 HR에 사전 문의 바랍니다.', {
              onClose: () => {
                oViewModel.setProperty('/contentsBusy/dialog', true);
                this.createPersAddCoreTime();
              },
            });
          } else if (oViewModel.getProperty('/Werks') === '0111' && oFormData.Awrsn === 'B2XXXX20') {
            // } else if (oFormData.Awrsn === 'B2XXXX20') {
            if (!this.OverseasBRDialog) {
              const oView = this.getView();
              this.OverseasBRDialog = await Fragment.load({
                id: oView.getId(),
                name: 'sap.ui.time.mvc.view.timeRegistration.fragment.OverseasBRDialog',
                controller: this,
              });

              oView.addDependent(this.OverseasBRDialog);
            }
            oViewModel.setProperty('/OverseasBR/check', false);
            this.OverseasBRDialog.open();
          } else {
            oViewModel.setProperty('/contentsBusy/dialog', true);
            this.createPersAddCoreTime();
          }
        }
      },

      // 근태 추가
      async createPersAddCoreTime() {
        const oViewModel = this.getViewModel();
        const oModel = this.getModel(ServiceNames.MYTIME);
        const sAppno = oViewModel.getProperty('/Appno');
        const formData = oViewModel.getProperty('/form/dialog/data/');
        const Daylst = typeof formData.Tmdat === 'string' ? formData.Tmdat : this.DateUtils.formatDateToYYYYMMDD(formData.Tmdat);

        try {
          var vTmdat = _.cloneDeep(formData.Tmdat),
            vBeguz = formData.Beguz ? this.TimeUtils.toString(formData.Beguz, 'HHmm') : '',
            vEnduz = formData.Enduz ? this.TimeUtils.toString(formData.Enduz, 'HHmm') : '';

          // Beguz>=0000 AND Enduz <= 0600인 경우, ​일자를 +1일
          // if (vBeguz >= 0 && vEnduz <= 600) {
          //   const sYear = vTmdat.substring(0, 4),
          //     sMonth = String(_.toNumber(vTmdat.substring(4, 6)) - 1),
          //     sDay = String(_.toNumber(vTmdat.substring(6, 8)) + 1);
          //   const tempDate = new Date(sYear, sMonth, sDay);
          //   vTmdat = tempDate.getFullYear() + String(tempDate.getMonth() + 1).padStart(2, '0') + String(tempDate.getDate()).padStart(2, '0');
          // }

          const mResult = await Client.create(oModel, 'PersAddCoreTime', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Appno: sAppno,
            Daylst: vTmdat,
            Tmdat: this.DateUtils.parse(vTmdat),
            Begda: this.DateUtils.parse(vTmdat),
            Endda: this.DateUtils.parse(vTmdat),
            Beguz: formData.Beguz ? this.TimeUtils.toString(formData.Beguz, 'HHmm') : '',
            Enduz: formData.Enduz ? this.TimeUtils.toString(formData.Enduz, 'HHmm') : '',
            Pbeg1: formData.Pbeg1 ? this.TimeUtils.toString(formData.Pbeg1, 'HHmm') : '',
            Pend1: formData.Pend1 ? this.TimeUtils.toString(formData.Pend1, 'HHmm') : '',
            Pbeg2: formData.Pbeg2 ? this.TimeUtils.toString(formData.Pbeg2, 'HHmm') : '',
            Pend2: formData.Pend2 ? this.TimeUtils.toString(formData.Pend2, 'HHmm') : '',
            Datim: formData.Gubun === 0 ? 'D' : formData.Gubun === 1 || formData.Gubun === 2 || formData.Gubun === 3 || formData.Gubun === 4 ? 'T' : null,
            Stdaz: formData.Stdaz == '' ? '0.0' : formData.Stdaz,
            Tmaty: 'C', // 고정
            Temty: 'A', // 고정
            Awrsn: formData.Awrsn,
            Awart: formData.Awart,
            // Comstdaz :
            Abrst: formData.Abrst == '' ? '0.0' : formData.Abrst,
            Abrtg: formData.Abrtg == '' ? '0.0' : formData.Abrtg,
            Preas: formData.Awart == 'B300' && formData.Awrsn == 'B3KR0120' ? formData.Preas : '',
            Austy: 'E',
            Dtrsn: formData.Dtrsn,
            Wrkty: 'C',
            Temty: !formData.Temty || formData.Temty == '' ? 'A' : formData.Temty, // 임시저장 여부
            Susda: formData.Susda && formData.Susda != '' ? this.DateUtils.parse(formData.Susda) : null,
          });

          if (formData.Atcyn === 'X' && this.FileAttachmentBoxHandler.getFileCount() > 0) {
            const oFileError = await this.FileAttachmentBoxHandler.upload(sAppno, formData.Tmdat);
            if (oFileError && oFileError.code === 'E') throw oFileError;
          }

          if (mResult.Msgtx && mResult.Msgtx != null) {
            MessageBox.alert(mResult.Msgtx, {
              onClose: () => {
                MessageBox.success(this.getBundleText('MSG_00007', this.getBundleText('LABEL_00107')), {
                  onClose: () => this.getMyDailyWorkTimeListMultiDays(),
                });
              },
            });
          } else {
            MessageBox.success(this.getBundleText('MSG_00007', this.getBundleText('LABEL_00107')), {
              onClose: () => this.getMyDailyWorkTimeListMultiDays(),
            });
          }
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwartCombo Error', oError);
          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/contentsBusy/dialog', false);
        }
      },

      /*
        등록 Form 의 데이터를 모두 Clear
      */
      async ClearFormData() {
        const oViewModel = this.getViewModel();
        // 대체 휴가 일 경우에 처리
        if (oViewModel.getProperty('/form/dialog/data/OrderType') === 'Susda') {
          oViewModel.setProperty('/form/dialog/data/OrderType', 'DeletedSusda');
          oViewModel.setProperty('/dialog/addButtonAct', true);
        } else {
          oViewModel.setProperty('/form/dialog/data/Beguz', '');
          // 종료 시간 Event Clear 를 위해 임의로 0900 입력
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm('0900'));
          // oViewModel.setProperty('/form/dialog/data/Enduz', null);
          const oEnduz = this.byId('oEnduz');
          this.byId('oBeguz').setValue(null).setDateValue(null);
          this.byId('oEnduz').setValue(null).setDateValue(null);
          // oEnduz.fireChange();

          oViewModel.setProperty('/form/dialog/data/FileAppno', '');
          oViewModel.setProperty('/form/dialog/data/Pbeg1', '');
          oViewModel.setProperty('/form/dialog/data/Pend1', '');
          oViewModel.setProperty('/form/dialog/data/Pbeg2', '');
          oViewModel.setProperty('/form/dialog/data/Pend2', '');
          oViewModel.setProperty('/form/dialog/data/Dtrsn', null);
          oViewModel.setProperty('/form/dialog/data/Awart', null);
          oViewModel.setProperty('/form/dialog/data/AwartType', null);
          oViewModel.setProperty('/form/dialog/data/Awrsn', null);
          // Appno 는 최초 로그인 시 생성된 Appno 사용
          oViewModel.setProperty('/form/dialog/data/Appno', oViewModel.getProperty('/Appno'));
          oViewModel.setProperty('/form/dialog/data/Temty', null);
          oViewModel.setProperty('/form/dialog/data/Stdaz', null);
          oViewModel.setProperty('/form/dialog/data/WorkButtonType', 'Emphasized');
          oViewModel.setProperty('/form/dialog/data/NoWorkButtonType', 'Default');
          // oViewModel.setProperty('/form/dialog/data/Awart', 'B300'); // 근무
          // oViewModel.setProperty('/form/dialog/data/Awrsn', "B3KR0120"); // 근무
          // oViewModel.setProperty('/form/dialog/data/Awrsn', null); // 근무
          oViewModel.setProperty('/form/dialog/data/AwartType', 'B'); // 근무로 설정
          oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
          oViewModel.setProperty('/form/dialog/data/Wrkty', 'C'); // 근무로 설정
          oViewModel.setProperty('/form/dialog/data/Temty', 'A'); //
          oViewModel.setProperty('/form/dialog/data/Tmaty', 'C'); //
          oViewModel.setProperty('/form/dialog/data/Gubun', null); //
          oViewModel.setProperty('/form/dialog/data/Datim', null); //
          oViewModel.setProperty('/form/dialog/data/RadioControl', null); //
          oViewModel.setProperty('/form/dialog/data/OrderType', ''); //
          oViewModel.setProperty('/form/dialog/data/Tmatx', ''); //
          oViewModel.setProperty('/dialog/addButtonAct', true);
          oViewModel.setProperty('/form/dialog/data/Atcyn', '');
          oViewModel.setProperty('/form/dialog/data/Susda', null);
          /* Clear 되지 않는 항목
            Holyn, Appnos, Pernr , Tmdat, Begda, Endda
          */

          this.onSetAwartList('X');
          this.retrieveTimeReasonList(false, 'X');

          // 우측 리스트 Select 초기화

          for (var i = 0; i < oViewModel.getProperty('/form/dialog/MyDailyWorkTimeList').length; i++) {
            oViewModel.setProperty('/form/dialog/MyDailyWorkTimeList/' + i + '/Selected', false);
          }

          oViewModel.refresh(true);
          // 상황에 따른 휴계시간 박스 활성화
          // this.checkPBBox();
        }
      },

      // 신청 버튼 클릭 처리
      async onPressApplyButton() {
        const oViewModel = this.getViewModel();
        const oModel = this.getModel(ServiceNames.MYTIME);
        const sAppno = oViewModel.getProperty('/Appno');
        const sFirtDay = oViewModel.getProperty('/firstDay'),
          sLastDay = oViewModel.getProperty('/lastDay');
        oViewModel.setProperty('/contentsBusy/calendar', true);
        try {
          await this.retrieveMyMonthlyStatus('X');

          const aValidResult = await this.validateApply();
          if (aValidResult == 'E') return;

          // Check 하는 로직 잠시 주석 처리 20241009
          const oMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          const mResult = await Client.get(oModel, 'MyMonthlyApplyCheck', {
            Appno: sAppno,
            Pstatus: oMyMonthlyStatus.Pstatus,
            Begda: this.DateUtils.parse(sFirtDay),
            Endda: this.DateUtils.parse(sLastDay),
            Pernr: this.getAppointeeProperty('Pernr'),
          });
          // HASS 인 경우에는 B 로 무조건 처리 ( 승인프로세스를 수행하지 않음)
          mResult.Appchk = oViewModel.getProperty('/auth') == 'H' && mResult.Appchk === 'A' ? 'B' : mResult.Appchk;

          if (mResult.Appchk == 'A') {
            oViewModel.setProperty('/contentsBusy/calendar', false);
            if (!this.ApplyFormDialog) {
              const oView = this.getView();
              this.ApplyFormDialog = await Fragment.load({
                id: oView.getId(),
                name: 'sap.ui.time.mvc.view.timeRegistration.fragment.ApplyFormDialog',
                controller: this,
              });

              this.ApplyFormDialog.attachBeforeOpen(async () => {
                const aEmployees = oViewModel.getProperty('/approval/Employees');

                if (aEmployees.length < 1) this.readEmployees();
                await this.retrieveApplyList();
              }).attachAfterOpen(() => this.setDetailsTableStyle());

              oView.addDependent(this.ApplyFormDialog);
            }

            // 결재상태 및 결재 Line 조회
            this.settingsApprovalStatus();

            // 임시 저장한 상태의 리스트(Appno 에 해당하는)  내역 조회
            const aResult = await this.retrieveMyCoreTimeApplyList();

            if (aResult == 'Error') return;

            this.ApplyFormDialog.open();

            /* 근태 사유가 확진휴가(계절독감)가 존재할 경우 개인정보 및 민감정보 수집 이용 동의 팝업 출력 */
            const A3KR00N0Exit = oViewModel.getProperty('/apply/MyCoreTimeApplyList').filter((o) => o.Awrsn === 'A3KR00N0' && o.Tmaty === 'C');

            if (A3KR00N0Exit.length > 0) {
              if (!this.ConsentPrivacyDialog) {
                const oView = this.getView();
                this.ConsentPrivacyDialog = await Fragment.load({
                  id: oView.getId(),
                  name: 'sap.ui.time.mvc.view.timeRegistration.fragment.ConsentPrivacy',
                  controller: this,
                });

                oView.addDependent(this.ConsentPrivacyDialog);
              }

              oViewModel.setProperty('/ConsentPrivacy/check1', false);
              oViewModel.setProperty('/ConsentPrivacy/check2', false);
              this.ConsentPrivacyDialog.open();
            }
          } else if (mResult.Appchk == 'B') {
            //바로 결재되는 OData 호출
            // this.onPressApplyRequest();

            await Client.create(this.getModel(ServiceNames.HRCALENDAR), 'PersTimeApply', {
              Appno: sAppno,
              Austy: 'H',
              Begda: this.DateUtils.parse(sFirtDay),
              Endda: this.DateUtils.parse(sLastDay),
              Prcty: 'S',
              Pernr: this.getAppointeeProperty('Pernr'),
              Wrkty: oViewModel.getProperty('/Wrkty'),
            });

            const sUri = 'http://hrwdp.doosan.com/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fDoosanGHRIS!2fiViews!2fTA!2fFP_Approvalbox?sap-config-mode=true%26gAppty=TM';

            await Client.getEntitySet(this.getModel(ServiceNames.APPROVAL), 'SendApprovalMail', {
              Appno: sAppno,
              Appst: '30',
              Uri: sUri,
            });

            await Promise.all([
              this.createAppnoWithAccess(), // 최초 로그인 시 Appno 생성
              // this.retrieveMyMonthlyStatus(), // Default 근무 시간 및 휴게시간
              this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
              this.retrieveTimePersInfo(),
            ]);

            await this.retrieveMyCoreTimeCalendar();
            // 근무 계획에 반영되었습니다.
            MessageBox.success(this.getBundleText('MSG_00064'), {
              onClose: () => {
                this.MonthPlanBoxHandler.makeCalendarControl(oViewModel.getProperty('/year'), oViewModel.getProperty('/month'));
                // Indicator Graph Data 입력
                setTimeout(() => this.retrieveMonth(), 0);
              },
            });
          } else {
            const aMessage = mResult.Cterdatum.replace('<br>', '\n');
            MessageBox.alert(aMessage);
            return;
          }
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwartCombo Error', oError);

          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/contentsBusy/calendar', false);
        }
      },

      async onPressOverseasBRDialogClose() {
        this.OverseasBRDialog.close();
      },

      async onPressAddOverseasBR() {
        const oViewModel = this.getViewModel();
        if (oViewModel.getProperty('/OverseasBR/check') !== true) {
          MessageBox.alert('[위 내용을 모두 확인하고 이해하였습니다.]를 확인하셔야 다음단계로 진행이 가능합니다.'); //
          return;
        }

        setTimeout(() => this.createPersAddCoreTime(), 0);
        oViewModel.setProperty('/contentsBusy/dialog', true);
        this.OverseasBRDialog.close();
      },

      async onPressDownloadOverseasManual() {
        window.open('/sap/bc/ui5_ui5/sap/zhrxx_tmapp/manual/ESS_OverseasBusinessTrip_Manual.pdf');
      },

      async validateApply() {
        const oViewModel = this.getViewModel();
        const MyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');

        if (MyMonthlyStatus.Monwh > MyMonthlyStatus.BashrA) {
          MessageBox.alert('당월 필요 근무시간 만큼 계획을 수립해주세요.'); //
          return 'E';
        }
        if (MyMonthlyStatus.BashrA > MyMonthlyStatus.Monmh) {
          MessageBox.alert('법정 최대 근무 가능시간을 초과하였습니다.'); //
          return 'E';
        }

        return '';
      },

      async onPressDeleteButton(oEvent) {
        const oViewModel = this.getViewModel();
        const MyDailyWorkTimeData = oViewModel.getProperty(oEvent.getSource().getBindingContext().sPath);

        if (MyDailyWorkTimeData.Tmatx == '승인' || MyDailyWorkTimeData.Tmatx == 'Approved') {
          if (MyDailyWorkTimeData.OrderType == 'PersTimeAbsence') {
            await this.deleteAbsenceDataCallCreate(MyDailyWorkTimeData); // Create 호출
          } else if (MyDailyWorkTimeData.OrderType == 'PersTimeAddWorking') {
            await this.deleteAddWorkingDataCallCreate(MyDailyWorkTimeData); // Create 호출
          }
        } else if (MyDailyWorkTimeData.Tmatx == '신규' || MyDailyWorkTimeData.Tmatx == 'New' || MyDailyWorkTimeData.Tmatx == '삭제' || MyDailyWorkTimeData.Tmatx == 'Cancel') {
          if (MyDailyWorkTimeData.OrderType == 'PersTimeAbsence') {
            await this.deleteAbsenceData(MyDailyWorkTimeData); // Remove 호출
          } else if (MyDailyWorkTimeData.OrderType == 'PersTimeAddWorking') {
            await this.deleteAddWorkingData(MyDailyWorkTimeData); // Remove 호출
          }
        }
      },

      /*
        닫기 버튼
      */
      onPressApplyFormDialogClose() {
        this.ApplyFormDialog.close();
      },

      async onPressApplyFormDialogCloseWithRefresh() {
        const oViewModel = this.getViewModel();
        await this.createAppnoWithAccess(); // 최초 로그인 시 Appno 생성

        await Promise.all([
          // this.retrieveMyMonthlyStatus(), // Default 근무 시간 및 휴게시간
          this.retrieveMyMonthlyStatus('X'), // 법정근무시간 등
          this.retrieveTimePersInfo(), //
          this.retrieveMyCoreTimeCalendar(),
        ]);

        this.MonthPlanBoxHandler.makeCalendarControl(oViewModel.getProperty('/year'), oViewModel.getProperty('/month'));
        // Indicator Graph Data 입력
        setTimeout(() => this.retrieveMonth(), 0);
        this.ApplyFormDialog.close();
      },

      async onPressApplyRequestMySelfDailog() {
        MessageBox.confirm('긴급본인결재로 설정하시겠습니까?', {
          onClose: async (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;
            await this.onPressApplyMySelfRequest(); // 긴급본인결재 설정 OData 호출
          },
        });
      },

      async onPressApplyMySelfRequest() {
        const oViewModel = this.getViewModel();
        const oModel = this.getModel(ServiceNames.APPROVAL);
        var oData = oViewModel.getProperty('/approval/list');

        if (oData[0].Check == 'X') {
          Message.alert('긴급본인결재 이미 처리되었습니다.');
          return;
        }

        try {
          const rData = await Client.getEntitySet(oModel, 'EmgcSelfyn', {
            Appno: oViewModel.getProperty('/Appno'),
            Pernr: this.getAppointeeProperty('Pernr'),
            Wrkty: oViewModel.getProperty('/Wrkty'),
          });
          var vData = { Data: [] };
          if (rData && rData.length) {
            if (rData[0].Emgcselfyn == 'X') {
              for (var i = 0; i < oData.length; i++) {
                vData.Data.push({
                  // Idx: i == 0 ? i + 1 : i + 2,
                  Seqnr: i == 0 ? '' + (i + 1) : '' + (i + 2),
                  Appty: oData[i].Appty,
                  Pernr: oData[i].Pernr,
                  Ename: oData[i].Ename,
                  Perpic: oData[i].Perpic,
                  Zzcaltltx: oData[i].Zzcaltltx,
                  Zzpsgrptx: oData[i].Zzpsgrptx,
                  Orgtx: oData[i].Orgtx,
                  Linty: i == 0 ? oData[i].Linty : '40',
                  Lintytx: i == 0 ? oData[i].Lintytx : this.getBundleText('LABEL_00231'),
                  Appst: oData[i].Appst,
                  Pageid: oData[i].Pageid,
                  Werks: oData[i].Werks,
                  Check: oData[i].Linty == '10' || oData[i].Linty == '20' ? 'X' : '', // 긴급결재여부 버튼을 선택했음을 표시하기 위함 - 기안/결재인 경우만 X로 표시함
                  Enabled: 'X', // 참조자 삭제버튼 비활성화
                });

                // 결재자를 본인으로 지정
                if (i == 0) {
                  vData.Data.push({
                    // Idx: i + 2,
                    Seqnr: '' + (i + 2),
                    Appty: oData[0].Appty,
                    Pernr: oData[0].Pernr,
                    Ename: oData[0].Ename,
                    Perpic: oData[0].Perpic,
                    Zzcaltltx: oData[0].Zzcaltltx,
                    Zzpsgrptx: oData[0].Zzpsgrptx,
                    Orgtx: oData[0].Orgtx,
                    Linty: oData[1].Linty,
                    Lintytx: oData[1].Lintytx,
                    Appst: oData[0].Appst,
                    Pageid: oData[0].Pageid,
                    Werks: oData[0].Werks,
                    Check: 'X',
                  });
                }
              }

              oViewModel.setProperty('/approval/list', vData.Data);
            }
          }
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onPressApplyMySelfRequest Error', oError);

          AppUtils.handleError(oError);
        }
      },

      /*
        승인 확정 문의
      */
      async onPressApplyRequestDailog() {
        MessageBox.confirm('최종 승인 요청하시겠습니까 ?', {
          onClose: (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;

            this.onPressApplyRequest(); // 결재선 호출 여부
          },
        });
      },

      /*
        승인요청하기 버튼 클릭
      */
      async onPressApplyRequest() {
        const oViewModel = this.getViewModel();
        const oModel = this.getModel(ServiceNames.HRCALENDAR);
        const sAppno = oViewModel.getProperty('/Appno');
        const sFirtDay = oViewModel.getProperty('/firstDay'),
          sLastDay = oViewModel.getProperty('/lastDay');
        oViewModel.setProperty('/contentsBusy/calendar', true);

        try {
          const mResult = await Client.create(oModel, 'PersTimeApply', {
            Pernr: this.getAppointeeProperty('Pernr'),
            Austy: 'E',
            Appno: sAppno,
            Prcty: 'S',
            Pernrlst: '',
            Begda: this.DateUtils.parse(sFirtDay),
            Endda: this.DateUtils.parse(sLastDay),
            Wrkty: oViewModel.getProperty('/Wrkty'), // 고정
          });

          // 결재선 저장
          await this.approvalSave(sAppno);

          // {신청}되었습니다.
          MessageBox.success(this.getBundleText('MSG_00007', this.getBundleText('LABEL_00121')), {
            onClose: () => this.onPressApplyFormDialogCloseWithRefresh(),
          });
        } catch (oError) {
          this.debug('Controller > timeRegistration Main > onChangeAwartCombo Error', oError);

          AppUtils.handleError(oError);
        } finally {
          oViewModel.setProperty('/contentsBusy/calendar', false);
        }
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

          const sUri = 'http://hrwdp.doosan.com/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fDoosanGHRIS!2fiViews!2fTA!2fFP_Approvalbox?sap-config-mode=true%26gAppty=TM';

          await Client.getEntitySet(oModel, 'SendApprovalMail', {
            Appno: sAppno,
            Appst: '20',
            Uri: sUri,
          });
        } catch (oError) {
          throw oError;
        }
      },

      /*
        팝업의 우측 리스트 창에서 데이터 선택 
      */
      SelectMyDailyWorkTime(oEvent) {
        const oViewModel = this.getViewModel();

        // MyDailyWorkTime Data 를 왼쪽 신청 Form Dialog 에 입력
        if (oEvent.getSource().getSelected() == true) {
          const vMyDailyWorkTime = oViewModel.getProperty(oEvent.getSource().getBindingContext().sPath);

          oViewModel.setProperty('/form/dialog/data/Appno', vMyDailyWorkTime.Appno);

          let vAwartType = 'B';
          if (vMyDailyWorkTime.OrderType == 'PersTimeAbsence') {
            vAwartType = vMyDailyWorkTime.Awart.charAt(0) == 'C' ? 'A' : vMyDailyWorkTime.Awart.charAt(0);
          } else {
          }

          oViewModel.setProperty('/form/dialog/data/Awart', vMyDailyWorkTime.Awart);
          oViewModel.setProperty('/form/dialog/data/Awrsn', vMyDailyWorkTime.Awrsn);
          oViewModel.setProperty('/form/dialog/data/Tmaty', vMyDailyWorkTime.Tmaty);
          oViewModel.setProperty('/form/dialog/data/Datim', vMyDailyWorkTime.Datim);
          oViewModel.setProperty('/form/dialog/data/Dtrsn', vMyDailyWorkTime.Dtrsn);
          oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(vMyDailyWorkTime.Beguz));
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(vMyDailyWorkTime.Enduz));
          oViewModel.setProperty('/form/dialog/data/Pbeg1', this.TimeUtils.toEdm(vMyDailyWorkTime.Pbeg1));
          oViewModel.setProperty('/form/dialog/data/Pend1', this.TimeUtils.toEdm(vMyDailyWorkTime.Pend1));
          oViewModel.setProperty('/form/dialog/data/Pbeg2', this.TimeUtils.toEdm(vMyDailyWorkTime.Pbeg2));
          oViewModel.setProperty('/form/dialog/data/Pend2', this.TimeUtils.toEdm(vMyDailyWorkTime.Pend2));
          oViewModel.setProperty('/form/dialog/data/Temty', vMyDailyWorkTime.Temty);
          oViewModel.setProperty('/form/dialog/data/Stdaz', vMyDailyWorkTime.Stdaz);
          oViewModel.setProperty('/form/dialog/data/Preas', vMyDailyWorkTime.Preas);
          oViewModel.setProperty('/form/dialog/data/WorkButtonType', vAwartType == 'B' ? 'Emphasized' : 'Default');
          oViewModel.setProperty('/form/dialog/data/NoWorkButtonType', vAwartType != 'B' ? 'Emphasized' : 'Default');
          oViewModel.setProperty('/form/dialog/data/AwartType', vAwartType);
          oViewModel.setProperty('/form/dialog/data/Tmdat', this.DateUtils.formatDateToYYYYMMDD(vMyDailyWorkTime.Tmdat));
          oViewModel.setProperty('/form/dialog/data/DialogTmdat', this.DateUtils.formatDateToYYYYMMDD(vMyDailyWorkTime.Tmdat));
          oViewModel.setProperty('/form/dialog/data/Begda', vMyDailyWorkTime.Tmdat);
          oViewModel.setProperty('/form/dialog/data/Endda', vMyDailyWorkTime.Tmdat);
          oViewModel.setProperty('/form/dialog/data/Gubun', vMyDailyWorkTime.Datim === 'D' ? 0 : vMyDailyWorkTime.Datim === 'T' ? 1 : null);
          oViewModel.setProperty('/form/dialog/data/RadioControl', this.getDatimToRadioControl(vMyDailyWorkTime.Awrsn));
          oViewModel.setProperty('/form/dialog/data/OrderType', vMyDailyWorkTime.OrderType); // 선택한 우측 리스트가 Absence or AddWorking
          oViewModel.setProperty('/form/dialog/data/Tmatx', vMyDailyWorkTime.Tmatx);
          oViewModel.setProperty('/dialog/addButtonAct', false);
          oViewModel.setProperty('/form/dialog/data/Atcyn', this.getAtcyn(oViewModel.getProperty('/form/dialog/data/Awrsn')));

          if (oViewModel.getProperty('/form/dialog/data/Atcyn') === 'X') {
            this.settingsAttachTable();
          }
          this.onSetAwartList();
          this.retrieveTimeReasonList(false, 'X');
          this.checkPBBox();
          this.setBeguzEditable();
          // check box 를 클릭 시 이외의 check box 는 deselect 처리
          const index = _.toNumber(oEvent.getSource().getBindingContext().sPath.split('/')[4]);
          const MyDailyWorkTimeList = oViewModel.getProperty('/form/dialog/MyDailyWorkTimeList');
          for (var i = 0; i < MyDailyWorkTimeList.length; i++) {
            if (index == i) {
            } else {
              oViewModel.setProperty('/form/dialog/MyDailyWorkTimeList/' + i + '/Selected', false);
            }
          }
        } else {
          // 모든 Check box 가 deselect 가 되므로 초기에 생성한 Appno 로 설정
          oViewModel.setProperty('/form/dialog/data/Appno', oViewModel.getProperty('/Appno'));
          this.checkPBBox(false);
          this.retrieveTimeReasonList(false, 'X');
        }
      },

      changeTimes() {
        const oViewModel = this.getViewModel(),
          Pbeg1 = _.toNumber(this.TimeUtils.toString(oViewModel.getProperty('/form/dialog/data/Pbeg1'), 'HHmm')),
          Pbeg2 = _.toNumber(this.TimeUtils.toString(oViewModel.getProperty('/form/dialog/data/Pbeg2'), 'HHmm')),
          Pend1 = _.toNumber(this.TimeUtils.toString(oViewModel.getProperty('/form/dialog/data/Pend1'), 'HHmm')),
          Pend2 = _.toNumber(this.TimeUtils.toString(oViewModel.getProperty('/form/dialog/data/Pend2'), 'HHmm'));

        var oFormData = oViewModel.getProperty('/form/dialog/data');

        if (oFormData.Awrsn != 'A6XXXX10' && oFormData.Awrsn != 'A6XXXX20') {
          // 10분단위 입력 여부 체크

          if (Pbeg1 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pbeg1', null);
            return;
          }
          if (Pbeg2 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pbeg2', null);
            return;
          }
          if (Pend1 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pend1', null);
            return;
          }
          if (Pend2 % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Pend2', null);
            return;
          }
        }
      },

      async checkPBBox(oEvent) {
        const oViewModel = this.getViewModel();
        const formData = oViewModel.getProperty('/form/dialog/data');
        const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus'),
          Beguz = _.toNumber(this.TimeUtils.toString(formData.Beguz, 'HHmm')),
          Enduz = _.toNumber(this.TimeUtils.toString(formData.Enduz, 'HHmm')),
          Pbeg1 = _.toNumber(vMyMonthlyStatus.Pbeg1),
          Pbeg2 = _.toNumber(vMyMonthlyStatus.Pbeg2),
          Pend1 = _.toNumber(vMyMonthlyStatus.Pend1),
          Pend2 = _.toNumber(vMyMonthlyStatus.Pend2),
          Cbeg1 = _.toNumber(vMyMonthlyStatus.Cbeg1),
          Cend1 = _.toNumber(vMyMonthlyStatus.Cend1);

        if (formData.Awrsn != 'A6XXXX10' && formData.Awrsn != 'A6XXXX20') {
          // 10분단위 입력 여부 체크
          if (oEvent && Beguz % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Beguz', null);
            return;
          }
          if (oEvent && Enduz % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Enduz', null);
            return;
          }
        }

        // 근무 - 근무
        oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
        if (formData.OrderType == '') {
          if (formData.Beguz && formData.Enduz) {
            if (formData.Beguz > formData.Enduz) Enduz = Enduz + 2400;
            if (formData.Awart == 'B300' && formData.Awrsn == 'B3KR0120') {
              // 코어타임 시작 <= 입력 근무 시작시간 < 코어타임 종료
              if (Cbeg1 <= Beguz && Cend1 > Beguz) {
                oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              }
              // 코어타임 시작 < 입력 근무 종료시간 <= 코어타임 종료
              else if (Cbeg1 < Enduz && Cend1 >= Enduz) {
                oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              }
              // 입력근무시작시간 <= 코어타임시작시간 AND 입력근무종료시간 >= 코어타임종료시간
              else if (Beguz <= Cbeg1 && Enduz >= Cend1) {
                oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              }
              // // 시작시간이 코어 시작시간과 종료시간 사이
              // if (((Beguz >= Cbeg1 && Beguz <= Cend1) || (Enduz >= Cbeg1 && Enduz <= Cend1)) && (Beguz <=  {
              //   oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              // }
              // // 종료시간이 코어 시작시간과 종료시간 사이
              // else if (Enduz >= Cbeg1 && Enduz <= Cend1) {
              //   oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              // }
            }
          }
        }

        // 사유 Box 활성화 설정
        this.setPreasVisible();

        // 시간을 직접 입력한 경우 Default 휴게 시간 설정
        if (oEvent) {
          this.setDefaultBreakTime();
        }
      },

      async onTimePickerChange(oEvent) {
        const oViewModel = this.getViewModel();
        const formData = oViewModel.getProperty('/form/dialog/data');
        const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus'),
          Beguz = _.toNumber(this.TimeUtils.toString(formData.Beguz, 'HHmm')),
          Enduz = _.toNumber(this.TimeUtils.toString(formData.Enduz, 'HHmm')),
          Pbeg1 = _.toNumber(vMyMonthlyStatus.Pbeg1),
          Pbeg2 = _.toNumber(vMyMonthlyStatus.Pbeg2),
          Pend1 = _.toNumber(vMyMonthlyStatus.Pend1),
          Pend2 = _.toNumber(vMyMonthlyStatus.Pend2),
          Cbeg1 = _.toNumber(vMyMonthlyStatus.Cbeg1),
          Cend1 = _.toNumber(vMyMonthlyStatus.Cend1);

        if (formData.Awrsn != 'A6XXXX10' && formData.Awrsn != 'A6XXXX20') {
          // 10분단위 입력 여부 체크
          if (oEvent && Beguz % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Beguz', null);
            return;
          }
          if (oEvent && Enduz % 10 != 0) {
            MessageBox.alert('시간은 10분 단위로 입력이 가능합니다.');
            oViewModel.setProperty('/form/dialog/data/Enduz', null);
            return;
          }
        }

        // 근무 - 근무
        oViewModel.setProperty('/form/dialog/data/PbBoxVisible', false);
        if (formData.OrderType == '') {
          if (formData.Beguz && formData.Enduz) {
            if (formData.Beguz > formData.Enduz) Enduz = Enduz + 2400;
            if (formData.Awart == 'B300' && formData.Awrsn == 'B3KR0120') {
              // 코어타임 시작 <= 입력 근무 시작시간 < 코어타임 종료
              if (Cbeg1 <= Beguz && Cend1 > Beguz) {
                oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              }
              // 코어타임 시작 < 입력 근무 종료시간 <= 코어타임 종료
              else if (Cbeg1 < Enduz && Cend1 >= Enduz) {
                oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              }
              // 입력근무시작시간 <= 코어타임시작시간 AND 입력근무종료시간 >= 코어타임종료시간
              else if (Beguz <= Cbeg1 && Enduz >= Cend1) {
                oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              }
              // // 시작시간이 코어 시작시간과 종료시간 사이
              // if (((Beguz >= Cbeg1 && Beguz <= Cend1) || (Enduz >= Cbeg1 && Enduz <= Cend1)) && (Beguz <=  {
              //   oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              // }
              // // 종료시간이 코어 시작시간과 종료시간 사이
              // else if (Enduz >= Cbeg1 && Enduz <= Cend1) {
              //   oViewModel.setProperty('/form/dialog/data/PbBoxVisible', true);
              // }
            }
          }
        }

        // 사유 Box 활성화 설정
        this.setPreasVisible();

        // 시간을 직접 입력한 경우 Default 휴게 시간 설정
        if (oEvent) {
          this.setDefaultBreakTime();
        }
      },

      setPreasVisible() {
        const oViewModel = this.getViewModel();
        const formData = oViewModel.getProperty('/form/dialog/data'),
          Beguz = _.toNumber(this.TimeUtils.toString(formData.Beguz, 'HHmm')),
          Enduz = _.toNumber(this.TimeUtils.toString(formData.Enduz, 'HHmm'));

        const DayMyDailyWorkTime = oViewModel
          .getProperty('/form/dialog/MyDailyWorkTimeList')
          .filter((o) => o.OrderType === 'PersTimeAbsence' && o.Datim === 'D' && (o.Tmatx === '신규' || o.Tmatx === '승인' || o.Tmatx === 'New' || o.Tmatx === 'Approved'));

        if (formData.Holyn == 'X') {
          oViewModel.setProperty('/form/dialog/data/PreasVisible', true);
        } else if (formData.Awrsn === 'B3KR0120' && (Beguz >= 2200 || (formData.Enduz && formData.Enduz != '' && Enduz <= 600))) {
          oViewModel.setProperty('/form/dialog/data/PreasVisible', true);
        } else if (
          formData.Awrsn === 'B3KR0120' &&
          DayMyDailyWorkTime &&
          DayMyDailyWorkTime.length > 0 &&
          ((formData.Enduz && formData.Enduz != '' && Enduz <= _.toNumber(DayMyDailyWorkTime[0].Beguz)) || Beguz >= _.toNumber(DayMyDailyWorkTime[0].Enduz))
        ) {
          oViewModel.setProperty('/form/dialog/data/PreasVisible', true);
        } else if (formData.OrderType === 'PersTimeAddWorking' && formData.Preas != '') {
          oViewModel.setProperty('/form/dialog/data/PreasVisible', true);
        } else {
          oViewModel.setProperty('/form/dialog/data/PreasVisible', false);
        }
      },

      async setDefaultBreakTime() {
        const oViewModel = this.getViewModel();
        const formData = oViewModel.getProperty('/form/dialog/data');
        const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus'),
          Beguz = _.toNumber(this.TimeUtils.toString(formData.Beguz, 'HHmm')),
          Enduz = _.toNumber(this.TimeUtils.toString(formData.Enduz, 'HHmm')),
          Pbeg1 = _.toNumber(this.TimeUtils.toString(formData.Pbeg1, 'HHmm')),
          Pend1 = _.toNumber(this.TimeUtils.toString(formData.Pend1, 'HHmm')),
          Pbeg2 = _.toNumber(this.TimeUtils.toString(formData.Pbeg2, 'HHmm')),
          Pend2 = _.toNumber(this.TimeUtils.toString(formData.Pend2, 'HHmm'));

        oViewModel.setProperty('/form/dialog/data/Pbeg1', '');
        oViewModel.setProperty('/form/dialog/data/Pend1', '');
        oViewModel.setProperty('/form/dialog/data/Pbeg2', '');
        oViewModel.setProperty('/form/dialog/data/Pend2', '');

        // 반반차 일 경우
        if ((formData.Awrsn === 'A1KR0120' || formData.Awrsn === 'A1KR0150') && Beguz != 0 && Enduz != 0 && formData.Holyn != 'X') {
          // 근무시작시간 <= 휴게 시작시간 <= 근무 종료시간 || 입력하는 근무 시작시간 <= 휴게종료시간 <= 근무종료시간
          if (
            (Beguz <= _.toNumber(vMyMonthlyStatus.Pbeg1) && Enduz > _.toNumber(vMyMonthlyStatus.Pbeg1)) ||
            (Enduz >= _.toNumber(vMyMonthlyStatus.Pend1) && Beguz < _.toNumber(vMyMonthlyStatus.Pend1))
          ) {
            oViewModel.setProperty('/form/dialog/data/Pbeg1', this.TimeUtils.toEdm(vMyMonthlyStatus.Pbeg1));
            oViewModel.setProperty('/form/dialog/data/Pend1', this.TimeUtils.toEdm(vMyMonthlyStatus.Pend1));
          }

          if (
            (Beguz <= _.toNumber(vMyMonthlyStatus.Pbeg2) && Enduz >= _.toNumber(vMyMonthlyStatus.Pbeg2)) ||
            (Enduz >= _.toNumber(vMyMonthlyStatus.Pend2) && Beguz <= _.toNumber(vMyMonthlyStatus.Pend2))
          ) {
            oViewModel.setProperty('/form/dialog/data/Pbeg2', this.TimeUtils.toEdm(vMyMonthlyStatus.Pbeg2));
            oViewModel.setProperty('/form/dialog/data/Pend2', this.TimeUtils.toEdm(vMyMonthlyStatus.Pend2));
          }
        } else if (Beguz != 0 && Enduz != 0 && formData.Holyn != 'X') {
          // 근무시작시간 <= 휴게 시작시간 <= 근무 종료시간 && 입력하는 근무 시작시간 <= 휴게종료시간 <= 근무종료시간
          if (
            Beguz <= _.toNumber(vMyMonthlyStatus.Pbeg1) &&
            _.toNumber(vMyMonthlyStatus.Pbeg1) <= Enduz &&
            Enduz >= _.toNumber(vMyMonthlyStatus.Pend1) &&
            _.toNumber(vMyMonthlyStatus.Pend1) >= Beguz
          ) {
            oViewModel.setProperty('/form/dialog/data/Pbeg1', this.TimeUtils.toEdm(vMyMonthlyStatus.Pbeg1));
            oViewModel.setProperty('/form/dialog/data/Pend1', this.TimeUtils.toEdm(vMyMonthlyStatus.Pend1));
          }

          if (
            Beguz <= _.toNumber(vMyMonthlyStatus.Pbeg2) &&
            _.toNumber(vMyMonthlyStatus.Pbeg2) <= Enduz &&
            Enduz >= _.toNumber(vMyMonthlyStatus.Pend2) &&
            _.toNumber(vMyMonthlyStatus.Pend2) >= Beguz
          ) {
            oViewModel.setProperty('/form/dialog/data/Pbeg2', this.TimeUtils.toEdm(vMyMonthlyStatus.Pbeg2));
            oViewModel.setProperty('/form/dialog/data/Pend2', this.TimeUtils.toEdm(vMyMonthlyStatus.Pend2));
          }
        }

        // }
      },

      async onSelectGubunRadion(oEvent) {
        const oViewModel = this.getViewModel();
        const iGubun = oEvent ? oEvent.getParameter('selectedIndex') : oViewModel.getProperty('/form/dialog/data/Gubun');
        const sDatim = oViewModel.getProperty('/form/dialog/data/Datim');

        oViewModel.setProperty('/form/dialog/data/Gubun', iGubun);
        oViewModel.setProperty('/form/dialog/data/Datim', iGubun === 0 ? 'D' : iGubun === 1 || iGubun === 2 ? 'T' : sDatim);

        if (oViewModel.getProperty('/form/dialog/data/Awrsn') === 'A1KR0110' || oViewModel.getProperty('/form/dialog/data/Awrsn') === 'A1KR0140') {
          const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(vMyMonthlyStatus.Cbeg1));
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(vMyMonthlyStatus.Cend1));
          oViewModel.setProperty('/form/dialog/data/RadioControl', 'X');
        } else if (oViewModel.getProperty('/form/dialog/data/Awrsn') === 'C2XXXX50') {
          // 코어타임휴무(야간대체)
          const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(vMyMonthlyStatus.Cbeg1));
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(vMyMonthlyStatus.Cend1));
        }
        // 반반차 And 코어 전반
        else if (iGubun === 3 && (oViewModel.getProperty('/form/dialog/data/Awrsn') === 'A1KR0120' || oViewModel.getProperty('/form/dialog/data/Awrsn') === 'A1KR0150')) {
          const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          let vCbegN = _.toNumber(vMyMonthlyStatus.Cbeg1),
            vCendN = null,
            vPbeg1N = _.toNumber(vMyMonthlyStatus.Pbeg1),
            vPend1N = _.toNumber(vMyMonthlyStatus.Pend1),
            vPbeg2N = _.toNumber(vMyMonthlyStatus.Pbeg2),
            vPend2N = _.toNumber(vMyMonthlyStatus.Pend2);

          vCendN = vCbegN + 200; // 종료시간은 시작시간 + 2시간

          /* 종료 시간이 휴계시간에 포함되는지 확인 참 일시  */
          var vDiffer;
          if (vPend1N != 0 && vPbeg1N != 0 && vCendN > vPbeg1N && vPend1N > vCbegN) {
            if (vCendN >= vPend1N && vCbegN >= vPbeg1N) {
              let vMinute1 = vPend1N % 100;
              let vHour1 = parseInt(vPend1N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vCbegN % 100;
              let vHour2 = parseInt(vCbegN / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // 1번 Case
              // vCendN = vCendN + (vPend1N - vCbegN);
              // vDiffer = vPend1N - vCbegN;
            } else if (vCendN >= vPend1N && vCbegN < vPbeg1N) {
              let vMinute1 = vPend1N % 100;
              let vHour1 = parseInt(vPend1N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg1N % 100;
              let vHour2 = parseInt(vPbeg1N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // 2번 Case
              // vCendN = vCendN + (vPend1N - vPbeg1N);
              // vDiffer = vPend1N - vPbeg1N;
            } else if (vCendN < vPend1N && vCbegN <= vPbeg1N) {
              let vMinute1 = vCendN % 100;
              let vHour1 = parseInt(vCendN / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg1N % 100;
              let vHour2 = parseInt(vPbeg1N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;
              vCendN = vPend1N;
            }
          }

          if (vPend2N != 0 && vPbeg2N != 0 && vCendN > vPbeg2N && vPend2N > vCbegN) {
            if (vCendN >= vPend2N && vCbegN >= vPbeg2N) {
              let vMinute1 = vPend2N % 100;
              let vHour1 = parseInt(vPend2N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vCbegN % 100;
              let vHour2 = parseInt(vCbegN / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // 1번 Case
              // vCendN = vCendN + (vPend2N - vCbegN);
              // vDiffer = vPend2N - vCbegN;
            } else if (vCendN >= vPend2N && vCbegN < vPbeg2N) {
              let vMinute1 = vPend2N % 100;
              let vHour1 = parseInt(vPend2N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg2N % 100;
              let vHour2 = parseInt(vPbeg2N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // 2번 Case
              // vCendN = vCendN + (vPend2N - vPbeg2N);
              // vDiffer = vPend2N - vPbeg2N;
            } else if (vCendN < vPend2N && vCbegN <= vPbeg2N) {
              let vMinute1 = vCendN % 100;
              let vHour1 = parseInt(vCendN / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg2N % 100;
              let vHour2 = parseInt(vPbeg2N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;
              vCendN = vPend2N;
            }
          }

          var vHours = Math.floor((vDiffer % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          var vMinutes = Math.floor((vDiffer % (1000 * 60 * 60)) / (1000 * 60));
          let vMinute1 = vCendN % 100;
          let vHour1 = parseInt(vCendN / 100);
          var vEndDate = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
          if (vHours > 0) {
            vEndDate.setHours(vEndDate.getHours() + vHours);
          }
          if (vMinutes > 0) {
            vEndDate.setMinutes(vEndDate.getMinutes() + vMinutes);
          }

          var vResultEndN = String(vEndDate.getHours()).padStart(2, '0') + String(vEndDate.getMinutes()).padStart(2, '0');
          oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(vCbegN));
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(vResultEndN));
          oViewModel.setProperty('/form/dialog/data/RadioControl', 'X');
        } else if (iGubun === 4 && (oViewModel.getProperty('/form/dialog/data/Awrsn') === 'A1KR0120' || oViewModel.getProperty('/form/dialog/data/Awrsn') === 'A1KR0150')) {
          const vMyMonthlyStatus = oViewModel.getProperty('/entry/MyMonthlyStatus');
          let vCbegN = null,
            vCendN = _.toNumber(vMyMonthlyStatus.Cend1),
            vPbeg1N = _.toNumber(vMyMonthlyStatus.Pbeg1),
            vPend1N = _.toNumber(vMyMonthlyStatus.Pend1),
            vPbeg2N = _.toNumber(vMyMonthlyStatus.Pbeg2),
            vPend2N = _.toNumber(vMyMonthlyStatus.Pend2);

          vCbegN = vCendN - 200;

          /* 종료 시간이 휴계시간에 포함되는지 확인 참 일시  */
          var vDiffer;
          if (vPend1N != 0 && vPbeg1N != 0 && vCendN > vPbeg1N && vPend1N > vCbegN) {
            if (vCendN >= vPend1N && vCbegN >= vPbeg1N) {
              // 1번 Case
              let vMinute1 = vPend1N % 100;
              let vHour1 = parseInt(vPend1N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vCbegN % 100;
              let vHour2 = parseInt(vCbegN / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;
              vCbegN = vPbeg1N;
              // vCbegN = vPbeg1N - (vPend1N - vCbegN);
            } else if (vCendN >= vPend1N && vCbegN < vPbeg1N) {
              let vMinute1 = vPend1N % 100;
              let vHour1 = parseInt(vPend1N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg1N % 100;
              let vHour2 = parseInt(vPbeg1N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // vCbegN = vCbegN - (vPend1N - vPbeg1N);
            } else if (vCendN < vPend1N && vCbegN <= vPbeg1N) {
              let vMinute1 = vCendN % 100;
              let vHour1 = parseInt(vCendN / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg1N % 100;
              let vHour2 = parseInt(vPbeg1N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // vCbegN = vCbegN - (vCendN - vPbeg1N);
            }
          }

          if (vPend2N != 0 && vPbeg2N != 0 && vCendN > vPbeg2N && vPend2N > vCbegN) {
            if (vCendN >= vPend2N && vCbegN >= vPbeg2N) {
              let vMinute1 = vPend2N % 100;
              let vHour1 = parseInt(vPend2N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vCbegN % 100;
              let vHour2 = parseInt(vCbegN / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;
              vCbegN = vPbeg2N;
              // vCbegN = vPbeg2N - (vPend2N - vCbegN);
            } else if (vCendN >= vPend2N && vCbegN < vPbeg2N) {
              let vMinute1 = vPend2N % 100;
              let vHour1 = parseInt(vPend2N / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg2N % 100;
              let vHour2 = parseInt(vPbeg2N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // vCbegN = vCbegN - (vPend2N - vPbeg2N);
            } else if (vCendN < vPend2N && vCbegN <= vPbeg2N) {
              let vMinute1 = vCendN % 100;
              let vHour1 = parseInt(vCendN / 100);
              var vDate1 = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
              let vMinute2 = vPbeg2N % 100;
              let vHour2 = parseInt(vPbeg2N / 100);
              var vDate2 = new Date('2024-01-10 ' + vHour2 + ':' + vMinute2 + ':00');
              vDiffer = vDate1 - vDate2;

              // vCbegN = vCbegN - (vCendN - vPbeg2N);
            }
          }

          // let vCbegHourC = vCbegN % 100;
          // let vCbegHour = parseInt(vCbegN / 100) * 100;
          // if (vCbegHourC >= 60) vCbegN = vCbegHour + 60 - (vCbegHourC - 60);

          var vHours = Math.floor((vDiffer % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          var vMinutes = Math.floor((vDiffer % (1000 * 60 * 60)) / (1000 * 60));
          let vMinute1 = vCbegN % 100;
          let vHour1 = parseInt(vCbegN / 100);
          var vBegDate = new Date('2024-01-10 ' + vHour1 + ':' + vMinute1 + ':00');
          if (vHours > 0) {
            vBegDate.setHours(vBegDate.getHours() - vHours);
          }
          if (vMinutes > 0) {
            vBegDate.setMinutes(vBegDate.getMinutes() - vMinutes);
          }

          var vResultBegN = String(vBegDate.getHours()).padStart(2, '0') + String(vBegDate.getMinutes()).padStart(2, '0');
          oViewModel.setProperty('/form/dialog/data/Beguz', this.TimeUtils.toEdm(vResultBegN));
          oViewModel.setProperty('/form/dialog/data/Enduz', this.TimeUtils.toEdm(vCendN));
          oViewModel.setProperty('/form/dialog/data/RadioControl', 'X');
        } else {
          oViewModel.setProperty('/form/dialog/data/Beguz', null);
          oViewModel.setProperty('/form/dialog/data/Enduz', null);
          oViewModel.setProperty('/form/dialog/data/Stdaz', null);
          oViewModel.setProperty('/form/dialog/data/Abrtg', null);
          oViewModel.setProperty('/form/dialog/data/Abrst', null);
        }

        // 시간 근태로 변경 시에는 Clear
        if (iGubun != 0) {
          oViewModel.setProperty('/form/dialog/data/Pbeg1', null);
          oViewModel.setProperty('/form/dialog/data/Pbeg2', null);
          oViewModel.setProperty('/form/dialog/data/Pend1', null);
          oViewModel.setProperty('/form/dialog/data/Pend2', null);
        }

        oViewModel.refresh();

        // this.byId('startWorkTime').setValue(null).setDateValue(null);
        // this.byId('endWorkTime').setValue(null).setDateValue(null);

        // 일 근태일 경우 시작시간과 종료시간 조회
        if (iGubun === 0) {
          await this.getWorkingTime();
        }
        // 시간 Control Editable 설정
        await this.setBeguzEditable();

        await this.checkPBBox();
        // Default Break Time 설정
        await this.setDefaultBreakTime();
      },

      // 결재 관련 구현

      settingsApprovalStatus() {
        const oViewModel = this.getViewModel();
        const mFormData = oViewModel.getProperty('/form');
        const sAuth = oViewModel.getProperty('/auth');
        const sPernr = this.getAppointeeProperty('Pernr');

        this.ApprovalStatusHandler = new ApprovalStatusHandler(this, {
          Pernr: sPernr,
          Mode: mFormData.Appno && mFormData.Appst !== '10' ? 'D' : 'N',
          EndPoint: this.DISPLAY_MODE,
          Austy: sAuth,
          Appty: this.getApprovalType(),
          ..._.pick(mFormData, ['Appno', 'Orgeh']),
        });
      },

      async onPressBulkApply() {
        const oViewModel = this.getViewModel();
        const oView = this.getView();

        if (!this.bulkFormDialog) {
          this.bulkFormDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeRegistration.fragment.BulkFormDialog',
            controller: this,
          });

          oView.addDependent(this.bulkFormDialog);
        }

        // 요일 선택 초기화
        oViewModel.setProperty('/Allform/dialog/dayOfTheWeek', [
          {
            select1: false,
            select2: false,
            select3: false,
            select4: false,
            select5: false,
          },
        ]);

        oViewModel.setProperty('/Allform/dialog/Gubun', -1);
        oViewModel.setProperty('/Allform/dialog/SelectReflection', 0);
        // 우측 리스트 조회
        await this.retrieveAllApplyList();

        this.bulkFormDialog.open();
      },

      async retrieveAllApplyList() {
        try {
          const oViewModel = this.getViewModel();
          const oModel = this.getModel(ServiceNames.MYTIME);
          const sFirstDay = oViewModel.getProperty('/firstDay');
          const Zyymm = moment(sFirstDay).format('YYYYMM');
          const oTable = this.byId('approvalStatusTable');
          var MyCoreTimeCalendar = await Client.getEntitySet(oModel, 'MyCoreTimeCalendar', {
            Werks: this.getAppointeeProperty('Persa'),
            Pernr: this.getAppointeeProperty('Pernr'),
            Zyymm: Zyymm,
          });
          var aMyCoreTimeCalendarWithoutHolyn = [];

          for (var i = 1; i < MyCoreTimeCalendar.length; i++) {
            if (MyCoreTimeCalendar[i].Holyn !== 'X') {
              MyCoreTimeCalendar[i].DayOfTheWeek = MyCoreTimeCalendar[i].Dainf.substring(12, 13);
              MyCoreTimeCalendar[i].Tmdatx = MyCoreTimeCalendar[i].Dainf.substring(0, 10);
              MyCoreTimeCalendar[i].Selected1 = false;
              MyCoreTimeCalendar[i].Selected2 = false;
              MyCoreTimeCalendar[i].Bigo = '';
              aMyCoreTimeCalendarWithoutHolyn.push(MyCoreTimeCalendar[i]);
            }
          }

          oViewModel.setProperty('/Allform/dialog/MyCoreTimeAllApply', aMyCoreTimeCalendarWithoutHolyn);
          oViewModel.setProperty('/Allform/dialog/rowCount', Math.min(aMyCoreTimeCalendarWithoutHolyn.length, 10));
        } catch (oError) {
          throw oError;
        }
      },

      async SelectCopyOriginData(oEvent) {
        const oViewModel = this.getViewModel();
        const index = _.toNumber(oEvent.getSource().getBindingContext().sPath.split('/')[4]);
        const MyCoreTimeAllApply = oViewModel.getProperty('/Allform/dialog/MyCoreTimeAllApply');
        for (var i = 0; i < MyCoreTimeAllApply.length; i++) {
          if (index == i) {
            // 선택한 Row 는 적용에 포함되지 않도록 처리
            oViewModel.setProperty('/Allform/dialog/MyCoreTimeAllApply/' + i + '/Selected2', false);
          } else {
            oViewModel.setProperty('/Allform/dialog/MyCoreTimeAllApply/' + i + '/Selected1', false);
          }
        }
      },

      async SelectReflection(oEvent) {
        const oViewModel = this.getViewModel();
        const MyCoreTimeAllApply = oViewModel.getProperty('/Allform/dialog/MyCoreTimeAllApply');
        var SelectReflection = 0;
        for (var i = 0; i < MyCoreTimeAllApply.length; i++) {
          if (MyCoreTimeAllApply[i].Selected2 == true) {
            SelectReflection++;
            if (SelectReflection > 0) break;
          }
        }

        oViewModel.setProperty('/Allform/dialog/SelectReflection', SelectReflection);
      },

      async selectedAllformGubun(oEvent) {
        const oViewModel = this.getViewModel();
        const iGubun = oEvent.getParameter('selectedIndex');
        var MyCoreTimeAllApply = oViewModel.getProperty('/Allform/dialog/MyCoreTimeAllApply');
        const sFirstDay = oViewModel.getProperty('/firstDay');
        const cMonth = moment(sFirstDay).format('YYYYMM').substring(4, 6);

        if (iGubun == 0) {
          MessageBox.confirm(this.getBundleText('MSG_10000', cMonth), {
            onClose: (sAction) => {
              if (MessageBox.Action.CANCEL === sAction) {
                // this.bulkFormDialog.close();
                return;
              }

              for (var i = 0; i < MyCoreTimeAllApply.length; i++) {
                if (MyCoreTimeAllApply[i].Holyn === 'X' || MyCoreTimeAllApply[i].Selected1 === true) {
                  MyCoreTimeAllApply[i].Selected2 = false;
                } else {
                  MyCoreTimeAllApply[i].Selected2 = true;
                }
              }
              oViewModel.setProperty('/Allform/dialog/MyCoreTimeAllApply', MyCoreTimeAllApply);
              this.SelectReflection();
            },
          });
        } else if (iGubun == 1) {
          MessageBox.information(this.getBundleText('MSG_10001'));
        }
      },
      clearAllForm() {
        const oViewModel = this.getViewModel();
        var MyCoreTimeCalendar = oViewModel.getProperty('/Allform/dialog/MyCoreTimeAllApply');

        for (var i = 0; i < MyCoreTimeCalendar.length; i++) {
          MyCoreTimeCalendar[i].Selected1 = false;
          MyCoreTimeCalendar[i].Selected2 = false;
        }

        oViewModel.setProperty('/Allform/dialog/MyCoreTimeAllApply', MyCoreTimeCalendar);

        oViewModel.setProperty('/Allform/dialog/dayOfTheWeek', [
          {
            select1: false,
            select2: false,
            select3: false,
            select4: false,
            select5: false,
          },
        ]);

        oViewModel.setProperty('/Allform/dialog/Gubun', null);
        oViewModel.setProperty('/Allform/dialog/SelectReflection', 0);
      },

      onPressDayOfTheWeek() {
        const oViewModel = this.getViewModel();
        const dayOfTheWeek = oViewModel.getProperty('/Allform/dialog/dayOfTheWeek')[0];
        let selectDayOfTheWeek = [];

        if (dayOfTheWeek.select1 == true) {
          selectDayOfTheWeek.push('월');
        }
        if (dayOfTheWeek.select2 == true) {
          selectDayOfTheWeek.push('화');
        }
        if (dayOfTheWeek.select3 == true) {
          selectDayOfTheWeek.push('수');
        }
        if (dayOfTheWeek.select4 == true) {
          selectDayOfTheWeek.push('목');
        }
        if (dayOfTheWeek.select5 == true) {
          selectDayOfTheWeek.push('금');
        }

        if (selectDayOfTheWeek.length == 0) {
          MessageBox.alert('요일을 선택하시기 바랍니다.'); //
          return;
        }

        var MyCoreTimeCalendar = oViewModel.getProperty('/Allform/dialog/MyCoreTimeAllApply');

        for (var i = 0; i < MyCoreTimeCalendar.length; i++) {
          for (var j = 0; j < selectDayOfTheWeek.length; j++) {
            if (selectDayOfTheWeek[j] == MyCoreTimeCalendar[i].DayOfTheWeek && MyCoreTimeCalendar[i].Selected1 != true) {
              MyCoreTimeCalendar[i].Selected2 = true;
              break;
            } else {
              MyCoreTimeCalendar[i].Selected2 = false;
            }
          }
        }

        oViewModel.setProperty('/Allform/dialog/MyCoreTimeAllApply', MyCoreTimeCalendar);
        this.SelectReflection();
      },

      onPressAllFormDialogClose() {
        this.bulkFormDialog.close();
      },

      // setTableColorStyle() {
      //   const oTable = this.byId('ApplyListForApprovalBox');

      //   setTimeout(() => {
      //     this.TableUtils.setColorColumnWithCondition({
      //       oTable,
      //       mColorMap: {
      //         // 4: 'ApplyBGType1',
      //         5: 'ApplyBGType1',
      //       },
      //     });
      //   }, 100);
      // },

      async initializeDatePopover() {
        const oView = this.getView();

        this._oDatePopover = await Fragment.load({
          id: oView.getId(),
          name: 'sap.ui.time.mvc.view.timeRegistration.fragment.DatePopover',
          controller: this,
        });

        oView.addDependent(this._oDatePopover);
      },

      async showDatePopover(oEvent) {
        const oControl = this;
        const oController = oControl.getCustomData()[0].getValue();
        const selectMonth = oController.byId('selectMonth');
        const oViewModel = oController.getViewModel();
        oViewModel.setProperty('/inputDate', oViewModel.getProperty('/firstDay').substring(0, 6));

        oController._oDatePopover.openBy(selectMonth);
      },

      //승인요청취소
      onPressApplyCancel() {
        const oViewModel = this.getViewModel();
        const MyDailyWorkTimeList = oViewModel.getProperty('/form/dialog/MyDailyWorkTimeList');

        // var MyTimeMassCreateList = [];
        // for (var i = 0; i < MyDailyWorkTimeList.length; i++) {
        //   MyTimeMassCreateList.push({
        //     Gubun: 'A',
        //     Tmdat: this.DateUtils.parse(MyDailyWorkTimeList[i].Tmdat),
        //     Pernr: MyDailyWorkTimeList[i].Pernr,
        //     Appno: MyDailyWorkTimeList[i].Appno,
        //   });
        // }

        // PersTimeApplySet;

        // 승인요청취소하시겠습니까
        MessageBox.confirm(this.getBundleText('MSG_00024'), {
          onClose: (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;
            this.executeApplyCancel();
          },
        });
      },

      async executeApplyCancel(MyTimeMassCreateList) {
        const oViewModel = this.getViewModel();

        try {
          await Client.create(this.getModel(ServiceNames.APPROVAL), 'ApprovalProcess', {
            Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
            Appst: '90',
            Appty: 'TM',
          });

          const sUri = 'http://hrwdp.doosan.com/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fDoosanGHRIS!2fiViews!2fTA!2fFP_Approvalbox?sap-config-mode=true%26gAppty=TM';

          await Client.getEntitySet(this.getModel(ServiceNames.APPROVAL), 'SendApprovalMail', {
            Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
            Appst: '90',
            Uri: sUri,
          });

          MessageBox.success(this.getBundleText('MSG_00023'), {
            onClose: () => this.onPressFormDialogClose(),
          });
        } catch (oError) {
          this.debug('Controller > home > onPressApplyCancel Error', oError);

          AppUtils.handleError(oError);
        } finally {
        }
      },

      async executeApplyAll(MyTimeMassCreateList) {
        const oViewModel = this.getViewModel();
        try {
          const { Appno } = await Client.deep(this.getModel(ServiceNames.MYTIME), 'MyTimeMassCreate', {
            Gubun: 'G',
            Tmdat: MyTimeMassCreateList[0].Tmdat,
            Appno: MyTimeMassCreateList[0].Appno,
            Pernr: MyTimeMassCreateList[0].Pernr,
            MyTimeMassCreate01: MyTimeMassCreateList,
          });

          MessageBox.success('일정적용 완료 되었습니다.');
        } catch (oError) {
          this.debug('Controller > home > onPressApplyCancel Error', oError);
          if (oError.httpStatusCode && oError.httpStatusCode === 400) {
            // MessageBox.success('일정적용 완료 되었습니다.');

            const vError = AppUtils.parseError(oError);
            console.log(vError);
            MessageBox.success(vError.message);
          } else {
            AppUtils.handleError(oError);
          }
        } finally {
          // 닫기 버튼 클릭 시 달력 조회
          await this.retrieveMyMonthlyStatus('X'); // 법정근무시간 등
          await this.retrieveMyCoreTimeCalendar();
          this.MonthPlanBoxHandler.makeCalendarControl(this.getViewModel().getProperty('/year'), this.getViewModel().getProperty('/month'));
          // Indicator Graph Data 입력
          setTimeout(() => this.retrieveMonth(), 0);
          this.onPressAllFormDialogClose();
          oViewModel.setProperty('/contentsBusy/dialog', false);
        }
      },

      async onPressApplyAll() {
        const oViewModel = this.getViewModel();
        const oMyCoreTimeAllApply = _.cloneDeep(oViewModel.getProperty('/Allform/dialog/MyCoreTimeAllApply'));
        var MyTimeMassCreateList = [];

        const aStandardSelectedData = oMyCoreTimeAllApply.filter((o) => o.Selected1 === true);
        if (!aStandardSelectedData || aStandardSelectedData.length == 0) {
          MessageBox.alert(this.getBundleText('적용할 기준 일자를 선택하세요')); //
          return;
        }

        const aSelectApplyList = oMyCoreTimeAllApply.filter((o) => o.Selected2 === true);
        if (!aSelectApplyList || aSelectApplyList.length == 0) {
          MessageBox.alert(this.getBundleText('적용할 일자를 선택하세요')); //
          return;
        }

        var _StandardSelectedData = _.cloneDeep(aStandardSelectedData[0]);
        _StandardSelectedData.Gubun = 'S';
        _StandardSelectedData.Appno = oViewModel.getProperty('/Appno');

        for (var i = 0; i < aSelectApplyList.length; i++) {
          aSelectApplyList[i].Gubun = 'A';
          aSelectApplyList[i].Appno = oViewModel.getProperty('/Appno');
        }
        aSelectApplyList.unshift(_StandardSelectedData);

        // PersTimeApplySet;

        // 일정 적용 하시겠습니까 ?
        MessageBox.confirm('여러 일자의 근무일정을 일괄 변경하는 프로세스가 진행됨에 따라 1분 이상 시간이 소요될 수 있습니다.\n 일괄적용 하시겠습니까?', {
          onClose: (sAction) => {
            if (MessageBox.Action.CANCEL === sAction) return;
            oViewModel.setProperty('/contentsBusy/dialog', true);
            this.executeApplyAll(aSelectApplyList);
          },
        });
      },

      async onPressPernrCheckFormDialogClose() {
        // OData
        const oViewModel = this.getViewModel();
        const oModel = this.getModel(ServiceNames.MYTIME);
        var sParaObject = {
          Pernr: this.getAppointeeProperty('Pernr'),
          Checkyn: 'X',
          Begda: this.DateUtils.parse(new Date()),
        };

        try {
          await Client.create(oModel, 'PernrCheckYn', sParaObject);
        } catch (oError) {
          this.debug('Controller > home > onObjectMatched Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this.PernrCheckFormDialog.close();
        }
      },

      getDatimToRadioControl(fAwrsn) {
        const oViewModel = this.getViewModel();
        const vReason = _.find(oViewModel.getProperty('/entry/AllTimeReason'), { Awrsn: fAwrsn });
        return vReason.Datim;
      },

      getAtcyn(fAwrsn) {
        const oViewModel = this.getViewModel();
        const vReason = _.find(oViewModel.getProperty('/entry/AllTimeReason'), { Awrsn: fAwrsn });
        return vReason.Atcyn;
      },

      settingsAttachTable() {
        const oViewModel = this.getViewModel();
        const sOrderType = oViewModel.getProperty('/form/dialog/data/OrderType');
        const sAppno = oViewModel.getProperty('/form/dialog/data/Appno') || '';
        const sTmdat = oViewModel.getProperty('/form/dialog/data/Tmdat') || '';

        if (!this.FileAttachmentBoxHandler) {
          this.FileAttachmentBoxHandler = new FileAttachmentBoxHandler(this, {
            editable: !sOrderType || sOrderType === '',
            appno: sAppno,
            appty: this.getApprovalType(),
            maxFileCount: 3,
            tmdat: sTmdat,
            // tmdat: sTmdat && sTmdat != '' ? this.DateUtils.parse(sTmdat) : '',
            // tmdat: "datetime'2024-10-29T00%3A00%3A00'",
          });
        } else {
          this.FileAttachmentBoxHandler.readFileListWithAppnoEdit(sAppno, sTmdat, !sOrderType || sOrderType === '');
        }
      },

      onClickConfigureViewMore() {
        const oViewModel = this.getViewModel();
        const sViewMore = oViewModel.getProperty('/viewMore');
        oViewModel.setProperty('/viewMore', !sViewMore);
        oViewModel.setProperty('/viewMoreText', oViewModel.getProperty('/viewMore') ? '- 숨기기' : '+ 더보기');
        // this._setScrollContainerHeight(!sViewMore);
      },

      /* 팝업 상에서 일자를 변경할 경우 Event */
      async onChangeTmdatFromPopup(oEvent) {
        const oViewModel = this.getViewModel();
        const vTmdat = oViewModel.getProperty('/form/dialog/data/Tmdat');
        const vTmdatList = oViewModel.getProperty('/form/dialog/tmdatList');
        if (!oEvent.getParameters().value && oEvent.getParameters().value == '') return;

        if (vTmdat.substring(0, 6) != oEvent.getParameters().value.substring(0, 6)) {
          oViewModel.setProperty('/form/dialog/data/DialogTmdat', oViewModel.getProperty('/form/dialog/data/Tmdat'));
          MessageBox.alert('당월만 변경이 가능합니다.');
          return;
        } else {
          oViewModel.setProperty('/form/dialog/data/Tmdat', oEvent.getParameters().value);
          oViewModel.setProperty('/form/dialog/data/Daylst', oEvent.getParameters().value);
          oViewModel.setProperty('/form/dialog/data/Susda', null);
        }

        //해당 일자의 정보를 변경
        const vMyCoreTimeCalendar = oViewModel.getProperty('/MyCoreTimeCalendar/').filter((o) => this.DateUtils.formatDateToYYYYMMDD(o.Tmdat) === oEvent.getParameters().value);
        if (vMyCoreTimeCalendar.length > 0) {
          oViewModel.setProperty('/form/dialog/data/Holyn', vMyCoreTimeCalendar[0].Holyn);
        }

        vTmdatList.push(oEvent.getParameters().value);

        oViewModel.setProperty('/form/dialog/tmdatList', vTmdatList); // 팝업에서 선택한 일자 리스트를 저장

        await this.setPreasVisible();
        // 사유 Entry 재설정
        await this.setPreasList();
        // 날짜 변경 시 우측 리스트 변경
        await this.getMyDailyWorkTimeListMultiDays();
        // Holiday 일 경우 Setting
        await this.checkHoliday();
      },

      /*
        Holiday 일 경우에는 근무 - 근무로 설정
      */
      async checkHoliday() {
        const oViewModel = this.getViewModel();
        if (oViewModel.getProperty('/form/dialog/data/Holyn') == 'X') {
          oViewModel.setProperty('/form/dialog/data/Awart', 'B300');
          oViewModel.setProperty('/form/dialog/data/Awrsn', 'B3KR0120');
          oViewModel.setProperty('/form/dialog/data/AwartType', 'B');
        }
      },

      async checkPossiblePopupOpen(rSelectDate, rMyCoreTimeCalendar) {
        const oViewModel = this.getViewModel();
        var rCheckResult = false;
        const vHiredate = oViewModel.getProperty('/entry/MyMonthlyStatus/Hiredate'),
          vRetiredate = oViewModel.getProperty('/entry/MyMonthlyStatus/Retiredate');

        if (rSelectDate) {
          if (vHiredate != '' && vHiredate > rSelectDate) {
            MessageBox.alert(this.getBundleText('입사일자 이전 데이터는 입력이 제한됩니다.', 'LABEL_00110'));
          } else if (vRetiredate != '' && vRetiredate < rSelectDate) {
            MessageBox.alert(this.getBundleText('퇴사일자 이후 데이터는 입력이 제한됩니다.', 'LABEL_00110'));
          } else if (!rMyCoreTimeCalendar || rSelectDate.substring(0, 6) != rMyCoreTimeCalendar.Zyymm) {
            MessageBox.alert(this.getBundleText('당월 데이터만 처리가 가능합니다.', 'LABEL_00110'));
          } else if (rMyCoreTimeCalendar.Cfmyn == 'X') {
            MessageBox.alert(this.getBundleText('확정 일자의 데이터 수정은 제한됩니다.', 'LABEL_00110'));
          } else {
            rCheckResult = true;
          }
        }

        return rCheckResult;
      },

      async callTravelPledgePopup() {
        const oView = this.getView();
        const oViewModel = this.getViewModel();

        if (!this._TravelPledgeDialog) {
          this._TravelPledgeDialog = await Fragment.load({
            id: oView.getId(),
            name: 'sap.ui.time.mvc.view.timeRegistration.fragment.TravelPledgeDialog',
            controller: this,
          });

          oView.addDependent(this._TravelPledgeDialog);
        }

        // if (oViewModel.getProperty('/Checklist/dialog/completePledgeYN') === 'Y' || this.getAppointeeProperty('Persa') != '0900') return;
        if (oViewModel.getProperty('/Checklist/dialog/completePledgeYN') === 'Y') return;

        oViewModel.setProperty('/Checklist/dialog/Placeyn', 0);
        oViewModel.setProperty('/Checklist/dialog/Checked', false);
        oViewModel.setProperty('/Checklist/dialog/Begda', moment(new Date()).format('YYYY.MM.DD'));

        this._TravelPledgeDialog.open();
      },

      async onPressConfirmTravelPledgeDialog() {
        const oViewModel = this.getViewModel();
        const oModel = this.getModel(ServiceNames.HRCALENDAR);
        var sParaObject = {
          Werks: this.getAppointeeProperty('Persa'),
          Pernr: this.getAppointeeProperty('Pernr'),
          Appno: oViewModel.getProperty('/form/dialog/data/Appno'),
          Placeyn: oViewModel.getProperty('/Checklist/dialog/Placeyn') == 0 ? 'Y' : 'N',
        };

        try {
          await Client.create(oModel, 'TripOathList', sParaObject);
          oViewModel.setProperty('/Checklist/dialog/completePledgeYN', 'Y');
        } catch (oError) {
          this.debug('Controller > home > TripOathList Error', oError);

          AppUtils.handleError(oError);
        } finally {
          this._TravelPledgeDialog.close();
        }
      },

      async onPressCloseTravelPledgeDialog() {
        const oViewModel = this.getViewModel();
        oViewModel.setProperty('/form/dialog/data/Awart', null);
        oViewModel.setProperty('/form/dialog/data/Awrsn', null);

        this._TravelPledgeDialog.close();
      },

      async onWorkHistoryProcess() {
        this.ConsentPrivacyDialog.close();
      },

      async onWorkHistoryProcessClose() {
        MessageBox.alert('개인정보 및 민감정보 수집 이용 동의를 하지 않아 신청이 불가 합니다. 신청 팝업이 종료됩니다.', {
          onClose: () => {
            this.ConsentPrivacyDialog.close();
            this.ApplyFormDialog.close();
          },
        });
      },
    });
  }
);
