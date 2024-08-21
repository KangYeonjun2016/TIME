sap.ui.define(
    [
      // prettier 방지용 주석
      'sap/ui/base/Object',
      'sap/ui/time/common/AppUtils',
    ],
    (
      // prettier 방지용 주석
      BaseObject,
      AppUtils
    ) => {
      'use strict';
  
      return BaseObject.extend('sap.ui.time.common.Debuggable', {
        debug(...aArgs) {
          AppUtils.debug(...aArgs);
          return this;
        },
      });
    }
  );