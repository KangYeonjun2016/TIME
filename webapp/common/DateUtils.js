sap.ui.define(
  [
    // prettier 방지용 주석
    'sap/ui/model/FormatException',
    'sap/ui/model/ParseException',
    'sap/ui/time/common/AppUtils',
  ],
  (
    // prettier 방지용 주석
    FormatException,
    ParseException,
    AppUtils
  ) => {
    ('use strict');

    /**
     * 주의 : formatter 사용시 format으로 변환된 값은 해당 control에만 적용되며
     *        model이 TwoWay binding mode라도 model에는 저장되지 않음
     *        model에도 저장이 되도록 하려면 SimpleType을 확장하여 커스텀 type을 만들어 사용해야함
     *        예) sap.ui.time.mvc.model.type.Date
     */
    const DateUtils = {
      format(vValue) {
        if (!vValue) {
          return null;
        }
        const sDTFMT = AppUtils.getAppComponent().getSessionModel().getProperty('/DTFMT');
        if (vValue instanceof Date) {
          return moment(vValue).format(sDTFMT);
        }
        if (vValue instanceof String || typeof vValue === 'string') {
          if (/^\/Date/.test(vValue)) {
            const iTime = parseInt(vValue.replace(/\/Date\((-?\d+)\)\//, '$1'), 10);
            return moment(iTime).format(sDTFMT);
          }
          const sDateString = vValue.replace(/[^\d]/g, '');
          return moment(sDateString, 'YYYYMMDD').format(sDTFMT);
        }
        throw new FormatException(`Don't know how to format Date from ${vValue}`);
      },

      parse(vValue) {
        if (!vValue) {
          return null;
        }
        if (vValue instanceof Date) {
          return moment(vValue).hour(9).toDate();
        }
        if (vValue instanceof String || typeof vValue === 'string') {
          if (/^\/Date/.test(vValue)) {
            const iTime = parseInt(vValue.replace(/\/Date\((-?\d+)\)\//, '$1'), 10);
            return new Date(iTime);
          }
          const sDateString = vValue.replace(/[^\d]/g, '');
          return moment(sDateString, 'YYYYMMDD').hour(9).toDate();
        }
        throw new ParseException(`Don't know how to parse Date from ${vValue}`);
      },

      formatDateToYYYYMMDD(date) {
        // 연도, 월, 일을 추출
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(date.getDate()).padStart(2, '0');

        // yyyyMMdd 형식으로 포맷
        return `${year}${month}${day}`;
      },

      toDate(vValue) {
        const year = vValue.substring(0, 4);
        const month = '' + (_.toNumber(vValue.substring(4, 6)) - 1);
        const day = vValue.substring(6, 8);
        const time = vValue.substring(8, 10);
        const minute = vValue.substring(10, 12);
        return new Date(year, month, day, time, minute);
      },

      toConvertKoreaDate(oValue) {
        var vTmp1 = new Date(oValue);

        if (vTmp1.getTimezoneOffset() < 0) {
          vTmp1.setTime(vTmp1.getTime() - vTmp1.getTimezoneOffset() * 60000);
        } else {
          vTmp1.setTime(vTmp1.getTime() + vTmp1.getTimezoneOffset() * 60000);
        }

        return vTmp1;
      },

      toConvertKoreaDate2(oValue) {
        // var vTmp1 = new Date(oValue);

        // const seoulTime = vTmp1.toLocaleString('en-US', {
        //   timeZone: 'Asia/Seoul',
        //   hour12: false,
        // });

        // return seoulTime;

        const nyDate = new Date(oValue);

        // 서울 시간으로 변환해서 문자열 출력
        const seoulTime = nyDate.toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });

        console.log(seoulTime);
      },
    };

    return DateUtils;
  }
);
