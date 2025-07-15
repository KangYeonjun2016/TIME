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

    return BaseObject.extend('sap.ui.time.common.OrgSearchDialogHandler', {
      oController: null,
      oOrgSearchDialog: null,
      oGroupDialogHandler: null,
      oResultTable: null,
      fCallback: null,
      mOptions: {},
      bMultiSelect: false,
      bOnLoadSearch: false,
      bOpenByAppointee: false,
      sPersa: null,

      constructor: function (oController) {
        this.oController = oController;

        this.oGroupDialogHandler = new GroupDialogHandler(this.oController, ([mOrgData]) => {
          // const oOrgSearchDialogModel = this.oOrgSearchDialog.getModel();
          // const { Orgeh } = oOrgSearchDialogModel.getProperty('/settings/searchConditions');
          // Orgeh.push({ Orgeh: mOrgData.Orgeh, Orgtx: mOrgData.Stext });
          // oOrgSearchDialogModel.setProperty('/searchConditions/Orgeh', Orgeh);
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

      setPersa(sPersa) {
        this.sPersa = sPersa;
        return this;
      },

      setOnLoadSearch(bOnLoadSearch) {
        if (_.isBoolean(bOnLoadSearch)) this.bOnLoadSearch = bOnLoadSearch;

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
        if (!this.oOrgSearchDialog) {
          this.oOrgSearchDialog = await Fragment.load({
            name: 'sap.ui.time.fragment.OrganizationDialog',
            controller: this,
          });

          // this.oOrgSearchDialog.getModel().setProperty('/settings/searchConditions', {});
          this.oGroupDialogHandler.setPersa(this.sPersa).openDialog();

          this.oController.getView().addDependent(this.oOrgSearchDialog);
        }

        this.oOrgSearchDialog.open();
      },

      assignCustomSettings() {
        const mOrgModelSettings = this.oOrgSearchDialog.getModel().getProperty('/settings');

        _.forEach(this.mOptions, (v, p) => _.set(mOrgModelSettings, p, _.assignIn(mOrgModelSettings[p], v)));
      },

      initialLoaded() {
        try {
          const oOrgDialogModel = this.oOrgSearchDialog.getModel();

          this.oResultTable = this.oOrgSearchDialog.getContent()[0].getItems()[1].getItems()[1];
          this.oResultTable.toggleStyleClass('radio-selection-table', !this.bMultiSelect);
          this.oResultTable.clearSelection();

          if (this.bOnLoadSearch) this.readData();
          else oOrgDialogModel.setProperty('/busy', false);
        } catch (oError) {
          AppUtils.debug('Common > OrgSearchDialogHandler > initialLoaded Error', oError);
          AppUtils.handleError(oError);
        }
      },

      async readEntryData() {
        try {
          const oOrgDialogModel = this.oCommonOrgSearchDialog.getModel();
          const mOrgConditionSetting = _.get(this.mOptions, 'searchConditions', {});
          const mSearchConditions = oOrgDialogModel.getProperty('/settings/searchConditions');
          const oLanchpadModel = this.oController.getModel(ServiceNames.LANCHPADSTATUS);
          const oCommonModel = this.oController.getModel(ServiceNames.COMMON);

          const aAreaList = await Client.getEntitySet(oLanchpadModel, 'TMPersAreaList', { Actty: '1', Wave: '1' });
          oOrgDialogModel.setProperty('/entry/persArea', new ComboEntry({ codeKey: 'Werks', valueKey: 'Pbtxt', aEntries: aAreaList.map((el) => ({ ...el, Werks: el.Persa })) }));

          const mFilters = {
            Persa: mOrgConditionSetting.Persa,
            Actda: moment().hours(0).toDate(),
          };
          const [aStat1, aZzjobgr, aPersg] = await Promise.all([
            Client.getEntitySet(oCommonModel, 'EmpCodeList', { ...mFilters, Field: 'Stat1' }), //
            Client.getEntitySet(oCommonModel, 'EmpCodeList', { ...mFilters, Field: 'Zzjobgr' }), //
            Client.getEntitySet(oCommonModel, 'EmpCodeList', { ...mFilters, Field: 'Persg' }), //
          ]);

          oOrgDialogModel.setProperty('/entry/workType', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aStat1 }));
          oOrgDialogModel.setProperty('/entry/Zzjobgr', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aZzjobgr }));
          oOrgDialogModel.setProperty('/entry/Persg', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aPersg }));

          oOrgDialogModel.setProperty(
            '/settings/searchConditions',
            _.chain(mSearchConditions)
              .set('Persa', _.isEmpty(mOrgConditionSetting.Persa) ? 'ALL' : mOrgConditionSetting.Persa)
              .set('Stat2', _.isEmpty(mOrgConditionSetting.Stat2) ? '3' : mOrgConditionSetting.Stat2)
              .set('Persg', _.isEmpty(mOrgConditionSetting.Persg) ? 'ALL' : mOrgConditionSetting.Persg)
              .set('Zzjobgr', _.isEmpty(mOrgConditionSetting.Zzjobgr) ? 'ALL' : mOrgConditionSetting.Zzjobgr)
              .set('Persk', _.isEmpty(mOrgConditionSetting.Persk) ? 'ALL' : mOrgConditionSetting.Persk)
              .value()
          );
        } catch (oError) {
          AppUtils.debug('Common > OrgSearchDialogHandler > readEntryData Error', oError);
          AppUtils.handleError(oError);
        }
      },

      async readData() {
        const oOrgDialogModel = this.oCommonOrgSearchDialog.getModel();

        oOrgDialogModel.setProperty('/busy', true);

        try {
          if (this.oResultTable) this.oResultTable.clearSelection();

          const { Persa, Ename, Orgeh, Stat2, Persg, Zzjobgr, Persk } = oOrgDialogModel.getProperty('/settings/searchConditions');
          const aResults = await Client.getEntitySet(this.oController.getModel(ServiceNames.COMMON), 'EmpSearchResult', {
            Actda: moment().hours(0).toDate(),
            Accty: this.oController.currentAuth(),
            Persa,
            Ename,
            Orgeh: _.map(Orgeh, 'Orgeh'),
            Stat1: Stat2,
            Persg,
            Zzjobgr,
            Persk,
          });

          oOrgDialogModel.setProperty('/results/list', aResults);
          oOrgDialogModel.setProperty('/results/rowCount', Math.min(aResults.length, 15));
        } catch (oError) {
          throw oError;
        } finally {
          oOrgDialogModel.setProperty('/busy', false);
        }
      },

      async onSearch() {
        try {
          await this.readData();
        } catch (oError) {
          AppUtils.debug('Common > OrgSearchDialogHandler > onSearch Error', oError);
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
        const oOrgDialogModel = this.oCommonOrgSearchDialog.getModel();

        try {
          const aSelectedIndices = _.reject(this.oResultTable.getSelectedIndices(), (d) => d === -1);

          if (_.isEmpty(aSelectedIndices)) throw new UI5Error({ code: 'A', message: AppUtils.getBundleText('MSG_00050') }); // 사원을 선택하세요.

          if (this.bMultiSelect) {
            const aOrgData = _.map(aSelectedIndices, (d) => oOrgDialogModel.getProperty(`/results/list/${d}`));

            if (this.fCallback && typeof this.fCallback === 'function') this.fCallback(aOrgData);
          } else {
            const mOrgData = oOrgDialogModel.getProperty(`/results/list/${aSelectedIndices[0]}`);

            if (this.bOpenByAppointee) this.oController.getViewModel('appointeeModel').setData(_.chain(mOrgData).set('Werks', mOrgData.Persa).set('Orgtx', mOrgData.Fulln).value(), true);
            if (this.fCallback && typeof this.fCallback === 'function') this.fCallback(mOrgData);
          }

          this.onClose();
        } catch (oError) {
          AppUtils.debug('Common > OrgSearchDialogHandler > onConfirm Error', oError);
          AppUtils.handleError(oError);
        }
      },

      onGroupOpen() {
        const { Persa } = this.oCommonOrgSearchDialog.getModel().getProperty('/settings/searchConditions');
        this.oGroupDialogHandler.setPersa(Persa).openDialog();
      },

      async onChangeEmpGroup() {
        const oOrgDialogModel = this.oCommonOrgSearchDialog.getModel();

        oOrgDialogModel.setProperty('/settings/fieldBusy/Persk', true);

        try {
          const { Persa, Persg } = oOrgDialogModel.getProperty('/settings/searchConditions');

          oOrgDialogModel.setProperty('/entry/subEmpGroup', []);
          oOrgDialogModel.setProperty('/settings/searchConditions/Persk', 'ALL');

          if (!sKey || sKey === 'ALL') return;

          const aSubEmpGroups = await Client.getEntitySet(this.oController.getModel(ServiceNames.COMMON), 'EmpCodeList', {
            Persa,
            Actda: moment().hours(0).toDate(),
            Field: 'Persk',
            Excod: Persg,
          });

          oOrgDialogModel.setProperty('/entry/subEmpGroup', new ComboEntry({ codeKey: 'Ecode', valueKey: 'Etext', aEntries: aSubEmpGroups }));
        } catch (oError) {
          AppUtils.debug('Common > OrgSearchDialogHandler > onChangeEmpGroup Error', oError);
          AppUtils.handleError(oError);
        } finally {
          oOrgDialogModel.setProperty('/settings/fieldBusy/Persk', false);
        }
      },

      onMultiInputTokenUpdate(oEvent) {
        const oOrgDialogModel = this.oCommonOrgSearchDialog.getModel();
        const [oRemoveToken] = oEvent.getParameter('removedTokens');
        const { Orgeh } = oOrgDialogModel.getProperty('/settings/searchConditions');

        oOrgDialogModel.setProperty(
          '/settings/searchConditions/Orgeh',
          Orgeh.filter((el) => el.Orgeh !== oRemoveToken.getKey())
        );
      },

      onClose() {
        this.oCommonOrgSearchDialog.close();
      },
    });
  }
);
