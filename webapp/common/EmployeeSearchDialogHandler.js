sap.ui.define(
  [
    // prettier 방지용 주석
    'sap/ui/base/Object',
    'sap/ui/core/Fragment',
    'sap/ui/model/json/JSONModel',
    'sap/ui/time/common/AppUtils',
    'sap/ui/time/common/ComboEntry',
    'sap/ui/time/common/exceptions/UI5Error',
    'sap/ui/time/common/GroupDialogHandler',
    'sap/ui/time/common/odata/Client',
    'sap/ui/time/common/odata/ServiceNames',
  ],
  (
    // prettier 방지용 주석
    BaseObject,
    Fragment,
    JSONModel,
    AppUtils,
    ComboEntry,
    UI5Error,
    GroupDialogHandler,
    Client,
    ServiceNames
  ) => {
    'use strict';

    return BaseObject.extend('sap.ui.time.common.EmployeeSearchDialogHandler', {
      oController: null,
      oCommonEmployeeSearchDialog: null,
      oGroupDialogHandler: null,
      oResultTable: null,
      fCallback: null,
      mOptions: {},
      bMultiSelect: false,
      bOnLoadSearch: false,
      bOpenByAppointee: false,

      constructor: function (oController) {
        this.oController = oController;

        this.oGroupDialogHandler = new GroupDialogHandler(this.oController, ([mOrgData]) => {
          const oEmployeeDialogModel = this.oCommonEmployeeSearchDialog.getModel();
          const { Orgeh } = oEmployeeDialogModel.getProperty('/settings/searchConditions');

          Orgeh.push({ Orgeh: mOrgData.Orgeh, Orgtx: mOrgData.Stext });
          oEmployeeDialogModel.setProperty('/settings/searchConditions/Orgeh', Orgeh);
        });
      },

      activeMultiSelect() {
        this.bMultiSelect = true;

        return this;
      },

      setCallback(fnCallback) {
        if (fnCallback && typeof fnCallback === 'function') this.fCallback = fnCallback;

        return this;
      },

      setOptions(mOptions) {
        if (_.isObject(mOptions)) this.mOptions = mOptions;

        return this;
      },

      setOnLoadSearch(bOnLoadSearch) {
        if (_.isBoolean(bOnLoadSearch)) this.bOnLoadSearch = bOnLoadSearch;

        return this;
      },

      setChangeAppointee(bOpenByAppointee) {
        if (_.isBoolean(bOpenByAppointee)) this.bOpenByAppointee = bOpenByAppointee;

        return this;
      },

      getInitData() {
        return {
          busy: true,
          settings: {
            searchConditions: { Accty: null, Persa: 'ALL', Ename: null, Orgeh: [], Stat2: '3', Persg: 'ALL', Persk: 'ALL' },
            fieldEnabled: { Persa: true, Ename: true, Orgeh: true, Stat2: true, Persg: true, Persk: true },
            fieldVisible: { Pernr: true, Ename: true, Fulln: true, Zzjikgbt: true, Zzjikcht: true, Stat2tx: true, Entda: true, Retdt: true },
            fieldBusy: { Persk: false },
          },
          entry: {
            persArea: [],
            workType: [],
            empGroup: [],
            subEmpGroup: [],
          },
          results: {
            rowCount: 0,
            list: [],
          },
        };
      },

      async openDialog() {
        if (!this.oCommonEmployeeSearchDialog) {
          this.oCommonEmployeeSearchDialog = await Fragment.load({
            name: 'sap.ui.time.fragment.EmployeeSearchDialog',
            controller: this,
          });

          this.oCommonEmployeeSearchDialog.setModel(new JSONModel(this.getInitData())).attachBeforeOpen(async () => {
            this.oCommonEmployeeSearchDialog.getModel().setData(this.getInitData());

            await this.assignCustomSettings();
            await this.readEntryData();
            await this.initialLoaded();
          });

          this.oController.getView().addDependent(this.oCommonEmployeeSearchDialog);
        }

        this.oCommonEmployeeSearchDialog.open();
      },

      assignCustomSettings() {
        const mEmployeeModelSettings = this.oCommonEmployeeSearchDialog.getModel().getProperty('/settings');

        _.forEach(this.mOptions, (v, p) => _.set(mEmployeeModelSettings, p, _.assignIn(mEmployeeModelSettings[p], v)));
      },

      initialLoaded() {
        try {
          const oEmployeeDialogModel = this.oCommonEmployeeSearchDialog.getModel();

          this.oResultTable = this.oCommonEmployeeSearchDialog.getContent()[0].getItems()[1].getItems()[1];
          this.oResultTable.toggleStyleClass('radio-selection-table', !this.bMultiSelect);
          this.oResultTable.clearSelection();

          if (this.bOnLoadSearch) this.readData();
          else oEmployeeDialogModel.setProperty('/busy', false);
        } catch (oError) {
          AppUtils.debug('Common > EmployeeSearchDialogHandler > initialLoaded Error', oError);
          AppUtils.handleError(oError);
        }
      },

      async readEntryData() {
        try {
          const oEmployeeDialogModel = this.oCommonEmployeeSearchDialog.getModel();
          const mEmployeeConditionSetting = _.get(this.mOptions, 'searchConditions', {});
          const mSearchConditions = oEmployeeDialogModel.getProperty('/settings/searchConditions');
          const oLanchpadModel = this.oController.getModel(ServiceNames.LANCHPADSTATUS);
          const oCommonModel = this.oController.getModel(ServiceNames.COMMON);

          const aAreaList = await Client.getEntitySet(oLanchpadModel, 'TMPersAreaList', { Actty: '1', Wave: '1' });
          oEmployeeDialogModel.setProperty('/entry/persArea', new ComboEntry({ codeKey: 'Werks', valueKey: 'Pbtxt', aEntries: aAreaList.map((el) => ({ ...el, Werks: el.Persa })) }));

          const mFilters = {
            Persa: mEmployeeConditionSetting.Persa,
            Actda: moment().hours(0).toDate(),
          };
          const [aStat1, aZzjobgr, aPersg] = await Promise.all([
            Client.getEntitySet(oCommonModel, 'EmpCodeList', { ...mFilters, Field: 'Stat1' }), //
            Client.getEntitySet(oCommonModel, 'EmpCodeList', { ...mFilters, Field: 'Zzjobgr' }), //
            Client.getEntitySet(oCommonModel, 'EmpCodeList', { ...mFilters, Field: 'Persg' }), //
          ]);

          oEmployeeDialogModel.setProperty('/entry/workType', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aStat1 }));
          oEmployeeDialogModel.setProperty('/entry/Zzjobgr', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aZzjobgr }));
          oEmployeeDialogModel.setProperty('/entry/Persg', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aPersg }));

          oEmployeeDialogModel.setProperty(
            '/settings/searchConditions',
            _.chain(mSearchConditions)
              .set('Persa', _.isEmpty(mEmployeeConditionSetting.Persa) ? 'ALL' : mEmployeeConditionSetting.Persa)
              .set('Stat2', _.isEmpty(mEmployeeConditionSetting.Stat2) ? '3' : mEmployeeConditionSetting.Stat2)
              .set('Persg', _.isEmpty(mEmployeeConditionSetting.Persg) ? 'ALL' : mEmployeeConditionSetting.Persg)
              .set('Zzjobgr', _.isEmpty(mEmployeeConditionSetting.Zzjobgr) ? 'ALL' : mEmployeeConditionSetting.Zzjobgr)
              .set('Persk', _.isEmpty(mEmployeeConditionSetting.Persk) ? 'ALL' : mEmployeeConditionSetting.Persk)
              .value()
          );
        } catch (oError) {
          AppUtils.debug('Common > EmployeeSearchDialogHandler > readEntryData Error', oError);
          AppUtils.handleError(oError);
        }
      },

      async readData() {
        const oEmployeeDialogModel = this.oCommonEmployeeSearchDialog.getModel();

        oEmployeeDialogModel.setProperty('/busy', true);

        try {
          if (this.oResultTable) this.oResultTable.clearSelection();

          const { Persa, Ename, Orgeh, Stat2, Persg, Zzjobgr, Persk } = oEmployeeDialogModel.getProperty('/settings/searchConditions');
          var aResults = '';
          if (this.bOpenByAppointee) {
            aResults = await Client.getEntitySet(this.oController.getModel(ServiceNames.COMMON), 'EmpSearchResult', {
              Actda: moment().hours(9).toDate(),
              Accty: this.oController.currentAuth(),
              Persa,
              Ename,
              Orgeh: _.map(Orgeh, 'Orgeh'),
              Stat1: Stat2,
              Persg,
              Zzjobgr,
              Persk,
            });
          } else {
            aResults = await Client.getEntitySet(this.oController.getModel(ServiceNames.TMCOMMON), 'TMEmpSearchResult', {
              Actda: moment().hours(9).toDate(),
              Accty: 'R',
              Persa,
              Ename,
              Orgeh: _.map(Orgeh, 'Orgeh'),
              Stat1: Stat2,
              Persg,
              Zzjobgr,
              Persk,
            });
          }

          oEmployeeDialogModel.setProperty('/results/list', aResults);
          oEmployeeDialogModel.setProperty('/results/rowCount', Math.min(aResults.length, 15));
        } catch (oError) {
          throw oError;
        } finally {
          oEmployeeDialogModel.setProperty('/busy', false);
        }
      },

      async onSearch() {
        try {
          await this.readData();
        } catch (oError) {
          AppUtils.debug('Common > EmployeeSearchDialogHandler > onSearch Error', oError);
          AppUtils.handleError(oError);
        }
      },

      onRowSelection(oEvent) {
        if (this.bMultiSelect) return;

        const oEventSource = oEvent.getSource();
        const aSelected = oEventSource.getSelectedIndices();
        const iSelectedRowIndex = oEvent.getParameter('rowIndex');

        if (!aSelected) return;

        oEventSource.setSelectionInterval(iSelectedRowIndex, iSelectedRowIndex);
      },

      onConfirm() {
        const oEmployeeDialogModel = this.oCommonEmployeeSearchDialog.getModel();

        try {
          const aSelectedIndices = _.reject(this.oResultTable.getSelectedIndices(), (d) => d === -1);

          if (_.isEmpty(aSelectedIndices)) throw new UI5Error({ code: 'A', message: AppUtils.getBundleText('MSG_00050') }); // 사원을 선택하세요.

          if (this.bMultiSelect) {
            const aEmployeeData = _.map(aSelectedIndices, (d) => oEmployeeDialogModel.getProperty(`/results/list/${d}`));

            if (this.fCallback && typeof this.fCallback === 'function') this.fCallback(aEmployeeData);
          } else {
            const mEmployeeData = oEmployeeDialogModel.getProperty(`/results/list/${aSelectedIndices[0]}`);

            if (this.bOpenByAppointee)
              this.oController.getViewModel('appointeeModel').setData(_.chain(mEmployeeData).set('Werks', mEmployeeData.Persa).set('Orgtx', mEmployeeData.Fulln).value(), true);
            if (this.fCallback && typeof this.fCallback === 'function') this.fCallback(mEmployeeData);
          }

          this.oCommonEmployeeSearchDialog.close();
        } catch (oError) {
          AppUtils.debug('Common > EmployeeSearchDialogHandler > onConfirm Error', oError);
          AppUtils.handleError(oError);
        }
      },

      onGroupOpen() {
        const { Persa } = this.oCommonEmployeeSearchDialog.getModel().getProperty('/settings/searchConditions');
        this.oGroupDialogHandler.setPersa(Persa).openDialog();
      },

      async onChangeEmpGroup() {
        const oEmployeeDialogModel = this.oCommonEmployeeSearchDialog.getModel();

        oEmployeeDialogModel.setProperty('/settings/fieldBusy/Persk', true);

        try {
          const { Persa, Persg } = oEmployeeDialogModel.getProperty('/settings/searchConditions');

          oEmployeeDialogModel.setProperty('/entry/subEmpGroup', []);
          oEmployeeDialogModel.setProperty('/settings/searchConditions/Persk', 'ALL');

          if (!sKey || sKey === 'ALL') return;

          const aSubEmpGroups = await Client.getEntitySet(this.oController.getModel(ServiceNames.COMMON), 'EmpCodeList', {
            Persa,
            Actda: moment().hours(0).toDate(),
            Field: 'Persk',
            Excod: Persg,
          });

          oEmployeeDialogModel.setProperty('/entry/subEmpGroup', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aSubEmpGroups }));
        } catch (oError) {
          AppUtils.debug('Common > EmployeeSearchDialogHandler > onChangeEmpGroup Error', oError);
          AppUtils.handleError(oError);
        } finally {
          oEmployeeDialogModel.setProperty('/settings/fieldBusy/Persk', false);
        }
      },

      onMultiInputTokenUpdate(oEvent) {
        const oEmployeeDialogModel = this.oCommonEmployeeSearchDialog.getModel();
        const [oRemoveToken] = oEvent.getParameter('removedTokens');
        const { Orgeh } = oEmployeeDialogModel.getProperty('/settings/searchConditions');

        oEmployeeDialogModel.setProperty(
          '/settings/searchConditions/Orgeh',
          Orgeh.filter((el) => el.Orgeh !== oRemoveToken.getKey())
        );
      },

      onClose() {
        this.oCommonEmployeeSearchDialog.close();
        if (this.fCallback && typeof this.fCallback === 'function') this.fCallback('', '');
      },
    });
  }
);
