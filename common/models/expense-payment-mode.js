'use strict';

module.exports = function(Expensepaymentmode) {
    Expensepaymentmode.getexpensepaymentmode = function (cb) {
        let where_cond = {};        
        where_cond.status = 1;                
        Expensepaymentmode.find(
          {
            where: where_cond,            
            order: "id DESC"
          },
          function (err, stdObj) {
            return cb(null, stdObj);
          }
        );
      };
      Expensepaymentmode.remoteMethod("getexpensepaymentmode", {
        http: { path: '/getexpensepaymentmode', verb: 'get' },
        description: 'Set the item master parameters',        
        returns: { arg: "response", type: "json" }
      });
};
