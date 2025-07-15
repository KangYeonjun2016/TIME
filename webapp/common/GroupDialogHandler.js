sap.ui.define(
  [
    // prettier 방지용 주석
    'sap/ui/base/Object',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Fragment',
    'sap/ui/time/control/MessageBox',
    'sap/ui/time/common/AppUtils',
    'sap/ui/time/common/odata/Client',
    'sap/ui/time/common/odata/ServiceNames',
  ],
  (
    // prettier 방지용 주석
    BaseObject,
    JSONModel,
    Fragment,
    MessageBox,
    AppUtils,
    Client,
    ServiceNames
  ) => {
    'use strict';

    return BaseObject.extend('sap.ui.time.common.GroupDialogHandler', {
      oController: null,
      oGroupDialog: null,
      oTable: null,
      oTreeTable: null,
      fCallback: null,
      sPersa: null,

      constructor: function (oController, fCallback) {
        this.oController = oController;
        this.fCallback = fCallback;
      },

      setPersa(sPersa) {
        this.sPersa = sPersa;
        return this;
      },

      async openDialog() {
        if (!this.oGroupDialog) {
          this.oGroupDialog = await Fragment.load({
            name: 'sap.ui.time.fragment.OrganizationDialog',
            controller: this,
          });

          this.oGroupDialog
            .setModel(new JSONModel(this.getInitData()))
            .attachBeforeOpen(() => {
              this.oTable = this.oGroupDialog.getContent()[1].getItems()[0].getItems()[0].getContent()[0];
              // this.oTreeTable = this.oGroupDialog.getContent()[1].getItems()[0].getItems()[1].getContent()[0].getItems()[0];
              this.oTreeTable = this.oGroupDialog.getContent()[1].getItems()[0].getItems()[1].getContent()[0].getContent()[0];
              this.buildTreeData();
            })
            .attachAfterOpen(() => {
              this.oTable.clearSelection();
              this.oTreeTable.removeSelections();

              this.oGroupDialog.getModel().setProperty('/Stext', '');
              this.oGroupDialog.getModel().setProperty('/orglist', []);
              this.oGroupDialog.getModel().setProperty('/rowcount', 1);
              this.oGroupDialog.getModel().setProperty('/selectedTab', 'A');
            })
            .attachAfterClose(() => {
              this.oTable.clearSelection();
              this.oTreeTable.collapseAll();
              this.oTreeTable.expandToLevel(1);
            });
        }

        this.oController.getView().addDependent(this.oGroupDialog);
        this.oGroupDialog.open();
      },

      getInitData() {
        return {
          busy: false,
          treeBusy: false,
          tree: [],
          Datum: moment().toDate(),
          Stext: '',
          orglist: [],
          selectedTab: 'A',
          rowcount: 1,
        };
      },

      _convertTreeData(aOriginData) {
        const mGroupedByParents = _.groupBy(aOriginData, 'OrgehUp');
        const mCatsById = _.keyBy(aOriginData, 'Orgeh');

        _.each(_.omit(mGroupedByParents, '00000000'), (children, parentId) => (mCatsById[parentId].nodes = children));

        return mGroupedByParents['00000000'];
      },

      buildTreeData() {
        const oDialogModel = this.oGroupDialog.getModel();
        const aTreeData = oDialogModel.getProperty('/tree');

        if (aTreeData.length) return;

        oDialogModel.setProperty('/treeBusy', true);

        setTimeout(async () => {
          const oDialogModel = this.oGroupDialog.getModel();
          const oDialogData = oDialogModel.getData();
          const aTreeData = await Client.getEntitySet(this.oController.getModel(ServiceNames.COMMON), 'OrgList', {
            Datum: oDialogData.Datum,
            Stype: '2',
          });
          const aConvertedTree = this._convertTreeData(aTreeData.map((el) => _.omit(el, 'Datum')));

          oDialogModel.setProperty('/tree', aConvertedTree);
          oDialogModel.setProperty('/treeBusy', false);

          this.oTreeTable.expandToLevel(1);
        }, 0);
      },

      async readDialogData() {
        const oDialogModel = this.oGroupDialog.getModel();

        try {
          oDialogModel.setProperty('/busy', true);

          const oDialogData = oDialogModel.getData();
          const aOrgList = await Client.getEntitySet(this.oController.getModel(ServiceNames.COMMON), 'OrgList', {
            Persa: this.sPersa,
            Datum: oDialogData.Datum,
            Stype: '1',
            Stext: oDialogData.Stext || _.noop(),
          });

          _.chain(oDialogData)
            .set('orglist', aOrgList ?? [])
            .set('rowcount', Math.min(5, aOrgList.length || 1))
            .commit();
        } catch (oError) {
          AppUtils.debug('Controller > GroupDialogHandler > readDialogData Error', oError);

          AppUtils.handleError(oError);
        }

        oDialogModel.setProperty('/busy', false);
      },

      onPressSelectOrg() {
        const oDialogModel = this.oGroupDialog.getModel();
        const sSelectedTab = oDialogModel.getProperty('/selectedTab');
        let mReturnData = {};

        if (sSelectedTab === 'A') {
          const aOrgList = this.oGroupDialog.getModel().getProperty('/orglist');
          const aSelectedIndices = this.oTable.getSelectedIndices();

          mReturnData = _.map(aSelectedIndices, (v) => _.get(aOrgList, v))[0];
        } else {
          mReturnData = this.oTreeTable.getSelectedItem().getBindingContext().getProperty();
        }

        this.fCallback([mReturnData]);
        this.oGroupDialog.close();
      },

      onPressCloseOrg() {
        this.oGroupDialog.close();
      },

      onPressSearchOrg() {
        this.readDialogData();
      },

      onOrganizationRowSelection(oEvent) {
        const iSelectedRowIndex = oEvent.getParameter('rowIndex');

        oEvent.getSource().setSelectionInterval(iSelectedRowIndex, iSelectedRowIndex);
      },
    });
  }
);
