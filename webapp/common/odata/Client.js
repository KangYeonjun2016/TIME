/* eslint-disable no-else-return */
sap.ui.define(
  [
    // prettier 방지용 주석
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/time/common/AppUtils',
    'sap/ui/time/common/exceptions/ODataReadError',
    'sap/ui/time/common/exceptions/ODataCreateError',
    'sap/ui/time/common/exceptions/ODataDeleteError',
  ],
  (
    // prettier 방지용 주석
    Filter,
    FilterOperator,
    AppUtils,
    ODataReadError,
    ODataCreateError,
    ODataDeleteError
  ) => {
    'use strict';

    return {
      getEntitySet: _.curry((oModel, sUrl, mFilters = {}) => {
        return new Promise((resolve, reject) => {
          oModel.read(`/${sUrl}Set`, {
            filters: _.chain(mFilters)
              .omitBy(_.isNil)
              .omitBy((fv) => _.isEqual(fv, '') || _.isEqual(fv, 'ALL') || (_.isArray(fv) && _.isEmpty(fv)))
              .map((v, p) => {
                if (_.isArray(v)) {
                  return new Filter({
                    filters: _.map(v, (value) => new Filter(p, FilterOperator.EQ, value)),
                    and: false,
                  });
                } else {
                  return new Filter(p, FilterOperator.EQ, v === 'all' ? 'ALL' : v);
                }
              })
              .value(),
            success: (oData) => {
              AppUtils.debug(`${sUrl} get-entityset success.`, oData);

              resolve(oData.results.map(({ ['__metadata']: _, ...obj }) => obj) ?? []);
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} get-entityset error.`, oError);

              AppUtils.handleSessionTimeout(new ODataReadError(oError), reject);
            },
          });
        });
      }),

      getEntity: _.curry((oModel, sUrl, mFilters = {}) => {
        return new Promise((resolve, reject) => {
          oModel.read(`/${sUrl}`, {
            filters: _.chain(mFilters)
              .omitBy(_.isNil)
              .omitBy((fv) => _.isEqual(fv, 'ALL'))
              .map((v, p) => {
                if (_.isArray(v)) {
                  return new Filter({
                    filters: _.map(v, (value) => new Filter(p, FilterOperator.EQ, value)),
                    and: false,
                  });
                } else {
                  return new Filter(p, FilterOperator.EQ, v === 'all' ? 'ALL' : v);
                }
              })
              .value(),
            success: (oData) => {
              AppUtils.debug(`${sUrl} get-entityset success.`, oData);

              resolve(oData.results.map(({ ['__metadata']: _, ...obj }) => obj) ?? []);
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} get-entityset error.`, oError);

              AppUtils.handleSessionTimeout(new ODataReadError(oError), reject);
            },
          });
        });
      }),

      get: _.curry((oModel, sUrl, mKeyMap = {}) => {
        return new Promise((resolve, reject) => {
          oModel.read(oModel.createKey(`/${sUrl}Set`, mKeyMap), {
            success: (oData) => {
              AppUtils.debug(`${sUrl} get success.`, oData);

              resolve(oData ?? {});
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} get error.`, oError);

              AppUtils.handleSessionTimeout(new ODataReadError(oError), reject);
            },
          });
        });
      }),

      // update: _.curry((oModel, sUrl, mKeyMap = {}, sParaObject = {}) => {
      //   return new Promise((resolve, reject) => {
      //     oModel.update(oModel.createKey(`/${sUrl}Set`, mKeyMap, sParaObject), {
      //       success: (oData) => {
      //         AppUtils.debug(`${sUrl} update success.`, oData);

      //         resolve(oData ?? {});
      //       },
      //       error: (oError) => {
      //         AppUtils.debug(`${sUrl} update error.`, oError);

      //         AppUtils.handleSessionTimeout(new ODataReadError(oError), reject);
      //       },
      //     });
      //   });
      // }),

      update: _.curry((oModel, sUrl, mKeyMap = {}, mPayload = {}) => {
        return new Promise((resolve, reject) => {
          oModel.update(oModel.createKey(`/${sUrl}Set`, mKeyMap), mPayload, {
            success: (oData) => {
              AppUtils.debug(`${sUrl} update success.`, oData);

              resolve(oData ?? {});
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} update error.`, oError);

              AppUtils.handleSessionTimeout(new ODataReadError(oError), reject);
            },
          });
        });
      }),

      // create: _.curry((oModel, sUrl, mPayload, sSet) => {
      //   const vUrl = "/" + sUrl  + ( sSet == "X" ? "" : "Set" );
      //   return new Promise((resolve, reject) => {
      //     oModel.create(vUrl, mPayload, {
      //       success: (oData) => {
      //         AppUtils.debug(`${sUrl} create success.`, oData);

      //         resolve(oData ?? {});
      //       },
      //       error: (oError) => {
      //         AppUtils.debug(`${sUrl} create error.`, oError);

      //         AppUtils.handleSessionTimeout(new ODataCreateError({ oError }), reject);
      //       },
      //     });
      //   });
      // }),
      create: _.curry((oModel, sUrl, mPayload) => {
        return new Promise((resolve, reject) => {
          oModel.create(`/${sUrl}Set`, mPayload, {
            success: (oData) => {
              AppUtils.debug(`${sUrl} create success.`, oData);

              resolve(oData ?? {});
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} create error.`, oError);

              AppUtils.handleSessionTimeout(new ODataCreateError({ oError }), reject);
            },
          });
        });
      }),

      deep: _.curry((oModel, sUrl, mPayload) => {
        return new Promise((resolve, reject) => {
          oModel.create(`/${sUrl}Set`, mPayload, {
            success: (oData) => {
              AppUtils.debug(`${sUrl} deep success.`, oData);

              resolve(oData ?? {});
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} deep error.`, oError);

              AppUtils.handleSessionTimeout(new ODataReadError(oError), reject);
            },
          });
        });
      }),

      deepNoSet: _.curry((oModel, sUrl, mPayload) => {
        return new Promise((resolve, reject) => {
          oModel.create(`/${sUrl}`, mPayload, {
            success: (oData) => {
              AppUtils.debug(`${sUrl} deep success.`, oData);

              resolve(oData ?? {});
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} deep error.`, oError);

              AppUtils.handleSessionTimeout(new ODataReadError(oError), reject);
            },
          });
        });
      }),

      remove: _.curry((oModel, sUrl, mKeyMap = {}) => {
        return new Promise((resolve, reject) => {
          oModel.remove(oModel.createKey(`/${sUrl}Set`, mKeyMap), {
            success: (oData) => {
              AppUtils.debug(`${sUrl} remove success.`, oData);

              resolve(oData ?? {});
            },
            error: (oError) => {
              AppUtils.debug(`${sUrl} remove error.`, oError);

              AppUtils.handleSessionTimeout(new ODataDeleteError(oError), reject);
            },
          });
        });
      }),
    };
  }
);
