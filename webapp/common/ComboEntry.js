sap.ui.define(
  [
    'sap/ui/base/Object', //
    'sap/ui/time/common/AppUtils',
  ],
  function (BaseObject, AppUtils) {
    'use strict';

    return BaseObject.extend('sap.ui.time.common.ComboEntry', {
      /**
       * @override
       * @returns {sap.ui.base.Object}
       */
      constructor: function ({ codeKey = 'code', valueKey = 'text', aEntries = [] }) {
        return [{ [codeKey]: 'ALL', [valueKey]: AppUtils.getBundleText('LABEL_00187') }, ...aEntries];
      },
    });
  }
);
