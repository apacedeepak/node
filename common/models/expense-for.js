'use strict';

module.exports = function(Expensefor) {
    Expensefor.getallexpensefor = function (cb) {
        let where_cond = {};        
        where_cond.status = 1;       
        Expensefor.find(
          {
            where: where_cond,
            order: "id DESC"
          },
          function (err, stdObj) {
            return cb(null, stdObj);
          }
        );
      };
      Expensefor.remoteMethod("getallexpensefor", {
        http: { path: '/getallexpensefor', verb: 'get' },
        description: 'Set the expense for parameters',        
        returns: { arg: "response", type: "json" }
      });
};
