sap.ui.define(
    [
      "sap/ui/core/Control",
      "sap/ui/core/TooltipBase",
      "sap/ui/time/control/TooltipRenderer",
    ],
    function (Control, TooltipBase, TooltipRenderer) {
      'use strict';
  
      return TooltipBase.extend('sap.ui.time.control.Tooltip', {
        renderer: TooltipRenderer,
        metadata: {
          interfaces: [
            "sap.ui.core.PopupInterface",
          ],
          properties: {
            "width": {
              type: "sap.ui.core.CSSSize",
              defaultValue: "100%",
            },
            // ... and other properties inherited from TooltipBase such as "text".
            // See https://openui5.hana.ondemand.com/api/sap.ui.core.TooltipBase
          },
          aggregations: {
            "content": {
              type: "sap.ui.core.Control",
              multiple: false,
              bindable: true,
            },
          },
          defaultAggregation: "content",
        },
    
        // Issue: https://github.com/SAP/openui5/issues/3168
        // This whole tooltip is added as a delegate to the owner. Not sure why.
        // Thus the events here are handled for the owner as well. E.g.:
        onfocusin() {
          // Will be called on focus of this tooltip. But ...
          // Will be called on focus of the owner too, even if this is not rendered.
          // debugger;
          TooltipBase.prototype.onfocusin.apply(this, arguments);
          // Enable "Emulate a focused page" for better debugging.
          // See https://stackoverflow.com/a/65188771/5846045
        },
        onlocalizationChanged() {
          // debugger; // https://github.com/SAP/openui5/issues/3168
        },
        onThemeChanged() {
          // debugger; // https://github.com/SAP/openui5/issues/3168
        },
    
      });
  });