sap.ui.define(['sap/ui/core/Renderer'], (Renderer) => {
  'use strict';

  return Renderer.extend('sap.ui.time.control.TooltipRenderer', {
    apiVersion: 2, // Try also with 4
    render(renderManager, control) {
      // Issue: render function is called twice.
      // See: https://github.com/SAP/openui5/issues/3169
      // Update: fixed since 1.88

      const child = control.getAggregation('content');
      if (child && child.isA('sap.ui.core.Control') && child.getText() != '') {
        // && child.getText() != ''
        // console.log(child.getText());
        renderManager
          .openStart('div', control)
          .accessibilityState(control, { role: 'tooltip' })
          .style('width', control.getWidth())
          .style('max-width', '23rem')
          .class('sapMPopup-CTX')
          .class('customTooltipBox')
          .openEnd()
          .renderControl(child)
          .close('div');
      } else {
        if (control.getText() && control.getText() != '') {
          renderManager
            .openStart('span', control)
            .accessibilityState(control, { role: 'tooltip' })
            .style('max-width', '24rem')
            // .style("display", "inline-block")
            .style('word-wrap', 'break-word')
            .style('width', 'auto')
            .style('padding', '0.75rem')
            .class('sapThemeBaseBG-asBackgroundColor')
            .class('sapMPopup-CTX')
            .class('customTooltipBox')
            .openEnd()
            .text(control.getText())
            .close('span');
        }
      }
    },
  });
});
