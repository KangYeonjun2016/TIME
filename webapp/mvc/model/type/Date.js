sap.ui.define(
  [
    // prettier 방지용 주석
    'sap/ui/model/FormatException',
    'sap/ui/model/ParseException',
    'sap/ui/model/SimpleType',
    'sap/ui/time/common/AppUtils',
  ],
  (
    // prettier 방지용 주석
    FormatException,
    ParseException,
    SimpleType,
    AppUtils
  ) => {
    'use strict';

    /**
     * Edm.DateTime
     */
    return SimpleType.extend('sap.ui.time.mvc.model.type.Date', {
      constructor: function (...args) {
        SimpleType.apply(this, args);

        const formatPattern = this.getSessionProperty('/Dtfmt');
        const oFormatOptions = {
          pattern: formatPattern,
        };
        this.setFormatOptions(oFormatOptions);
        this.sName = 'CustomDate';
      },

      formatValue(oValue, sTargetType) {
        switch (this.getPrimitiveType(sTargetType)) {
          case 'string':
          case 'any':
            return this._toString(oValue, sTargetType);
          case 'object':
            return this._toObject(oValue, sTargetType);
          default:
            throw new FormatException(`Don't know how to format Date to ${sTargetType}`);
        }
      },

      parseValue(oValue, sTargetType) {
        switch (this.getPrimitiveType(sTargetType)) {
          case 'string':
            return this._toString(oValue, sTargetType);
          case 'object':
          case 'any':
            return this._toObject(oValue, sTargetType);
          default:
            throw new ParseException(`Don't know how to parse Date from ${sTargetType}`);
        }
      },

      validateValue() {
        return true;
      },

      // 해외 시간 ( 예: UTC -6:00 미국, 캐나다) 를 사용하는 경우 일자가 -1일 되는 현상 수정
      _toString(oValue, sTargetType) {
        if (!oValue) {
          return '';
        }

        const sDTFMT = this.getFormatPatternForMoment();

        if (oValue instanceof Date) {
          var vTmp1 = new Date(oValue);

          if (vTmp1.getTimezoneOffset() < 0) {
            vTmp1.setTime(vTmp1.getTime() - vTmp1.getTimezoneOffset() * 60000);
          } else {
            vTmp1.setTime(vTmp1.getTime() + vTmp1.getTimezoneOffset() * 60000);
          }
          return moment(vTmp1).format(sDTFMT);
        }

        if (typeof oValue === 'string' || oValue instanceof String) {
          return this.getMoment(oValue).format(sDTFMT);
        }

        throw new FormatException(`Don't know how to format Date to ${sTargetType}`);
      },

      _toObject(oValue, sTargetType) {
        if (!oValue) {
          return null;
        }

        if (oValue instanceof Date) {
          return oValue;
        }

        if (typeof oValue === 'string' || oValue instanceof String) {
          return this.getMoment(oValue).toDate();
        }

        throw new ParseException(`Don't know how to parse Date from ${sTargetType}`);
      },

      getFormatPatternForMoment() {
        return this.getSessionProperty('/DTFMT');
      },

      getParsePatternForMoment() {
        return 'YYYYMMDD';
      },

      getMoment(oValue) {
        if (/^\/Date/.test(oValue)) {
          const iTime = parseInt(oValue.replace(/\/Date\((-?\d+)\)\//, '$1'), 10);
          return moment(iTime).hour(9);
        }

        const sDateString = oValue.replace(/[^\d]/g, '');
        return moment(sDateString, this.getParsePatternForMoment()).hour(9);
      },

      getSessionProperty(sPath) {
        return AppUtils.getAppComponent().getSessionModel().getProperty(sPath);
      },
    });
  }
);
