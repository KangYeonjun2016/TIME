sap.ui.define(
    [
      'sap/m/FlexBox', //
    ],
    function (FlexBox) {
      'use strict';
  
      return FlexBox.extend('sap.ui.time.control.DayBox', {
        metadata: {
          events: {
            press: {},
            hover: {},
            leave: {},
          },
        },
  
        renderer: {},
  
        onclick() {
          this.firePress();
        },
  
        onmouseover() {
          this.fireHover();
        },
  
        onmouseout() {
          this.fireLeave();
        },
      });
    }
  );