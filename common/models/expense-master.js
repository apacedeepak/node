'use strict';
var dateFormat = require('dateformat');
module.exports = function(Expensemaster) {
    Expensemaster.addexpensemaster = (data, cb)=>{        
        var today = new Date();
        var errorMessage = {};
        var successMessage = {};
        var insertObj = {};      
        if (data.id >0) {
           insertObj.id = data.id;
           insertObj.modified_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
           insertObj.modified_by = data.user_id;
           successMessage.message = "Record Updated Successfully.";
         } else {
           insertObj.created_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
           insertObj.created_by = data.user_id;
           successMessage.message = "Record Inserted Successfully.";
         }                   
        insertObj.expense_name = data.expense_name; 
        insertObj.expense_category = data.expense_category; 
        insertObj.expense_for = data.expense_for; 
        insertObj.expense_name = data.expense_name; 
        insertObj.status = 1;                    
        Expensemaster.upsert(insertObj, (err, result) => {
          if (err) {
            errorMessage.status = '201';
            errorMessage.message = "Error Occurred";
            return cb(err, errorMessage);
          }
          successMessage.status = "200";
          successMessage.detail = result;
          return cb(null, successMessage);
        });
   
      }
      Expensemaster.remoteMethod(
        'addexpensemaster',        
            {
                http: {path: '/addexpensemaster', verb: 'post'},
                description: 'Add expense master for imprest',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
      );
      Expensemaster.deletecategorymasterdata = function (data, cb) {
        var errorMessage = {};
        var successMessage = {};
        var insertObj = {};
        if (!data) {
          errorMessage.status = "201";
          errorMessage.message = "Bad Request";
          return cb(null, errorMessage);
        }
        insertObj.id = data.id;
        insertObj.status = 0;
    
        //console.log(insertObj);  
        Expensemaster.upsert(insertObj, (err, result) => {
          if (err) {
            errorMessage.status = '201';
            errorMessage.message = "Error Occurred";
            return cb(null, errorMessage);
          }
          successMessage.status = "200";
          successMessage.message = "Record Deleted Successfully.";
          successMessage.detail = result;
          return cb(null, successMessage);
        });
    
      };
    
      Expensemaster.remoteMethod(
        'deletecategorymasterdata',
        {
          http: { path: '/deletecategorymasterdata', verb: 'post' },
          description: 'Set the item master parameters',
          accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
          returns: { arg: 'response', type: 'json' }
        }
      )
      
      Expensemaster.getexpensemaster = function (id, cb) {
        Expensemaster.findOne(
          {
            where: { id: id }
          },
          function (err, res) {
            if (err) {
              cb(null, err);
            }
            cb(null, res);
          }
        );
      };
    
      Expensemaster.remoteMethod("getexpensemaster", {
        http: { path: "/getexpensemaster", verb: "get" },
        description: "Get Row by Doubts Id",
        accepts: { arg: "id", type: "number", required: true },
        returns: { arg: "response", type: "json" }
      });
      Expensemaster.getallexpensemaster = function (userId, cb) {
        let where_cond = {};        
        where_cond.status = 1;       
        Expensemaster.find(
          {
            where: where_cond,
            include: [
              {
                relation: "user",
                scope: {
                  fields: ["user_name"]
                }
              },
              {
                relation: "expenseFor",
                scope: {
                  fields: ["name"]
                }
              },
              {
                relation: "expenseCategory",
                scope: {
                  fields: ["category_name"]
                }
              }
            ],
            order: "id DESC"
          },
          function (err, stdObj) {
            return cb(null, stdObj);
          }
        );
      };
      Expensemaster.remoteMethod("getallexpensemaster", {
        http: { path: '/getallexpensemaster', verb: 'get' },
        description: 'Set the item master parameters',
        accepts: { arg: "userId", type: "number", required: true },
        returns: { arg: "response", type: "json" }
      });

      Expensemaster.getexpensemasterbycategoryid = function (expense_category_id,cb) {
        let where_cond = {};        
        where_cond.status = 1; 
        where_cond.expense_category = expense_category_id;          
        Expensemaster.find(
          {
            where: where_cond,            
            order: "id DESC"
          },
          function (err, stdObj) {
            return cb(err, stdObj);
          }
        );
      };
      Expensemaster.remoteMethod("getexpensemasterbycategoryid", {
        http: { path: '/getexpensemasterbycategoryid', verb: 'get' },
        description: 'Set the item master parameters',
        accepts: [{ arg: "expense_category_id", type: "number", required: true }],
        returns: { arg: "response", type: "json" }
      });      
};
