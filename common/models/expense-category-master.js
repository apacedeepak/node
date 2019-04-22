'use strict';
var dateFormat = require('dateformat');
module.exports = function(Expensecategorymaster) {  
        Expensecategorymaster.addcategorymaster = (data, cb)=>{        
        var today = new Date();
        var errorMessage = {};
        var successMessage = {};
        var insertObj = {};      
        if (data.id >0) {
           insertObj.id = data.id;
           insertObj.modified_date = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
           insertObj.modified_by = data.user_id;
           successMessage.message = "Record Updated Successfully.";
         } else {
           insertObj.created_date = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
           insertObj.created_by = data.user_id;
           successMessage.message = "Record Inserted Successfully.";
         }                   
        insertObj.category_name = data.category_name; 
        insertObj.category_for = data.category_for; 
        insertObj.status = 1;                    
        Expensecategorymaster.upsert(insertObj, (err, result) => {
          if (err) {
            errorMessage.status = '201';
            errorMessage.message = "Error Occurred";
            return cb(null, errorMessage);
          }
          successMessage.status = "200";
          successMessage.detail = result;
          return cb(null, successMessage);
        });
   
      }
      Expensecategorymaster.remoteMethod(
        'addcategorymaster',        
            {
                http: {path: '/addcategorymaster', verb: 'post'},
                description: 'Add category master for imprest',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
      );
      Expensecategorymaster.deletecategorymasterdata = function (data, cb) {
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
        Expensecategorymaster.upsert(insertObj, (err, result) => {
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
    
      Expensecategorymaster.remoteMethod(
        'deletecategorymasterdata',
        {
          http: { path: '/deletecategorymasterdata', verb: 'post' },
          description: 'Set the item master parameters',
          accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
          returns: { arg: 'response', type: 'json' }
        }
      )
      
      Expensecategorymaster.getcategorymaster = function (id, cb) {
        Expensecategorymaster.findOne(
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
    
      Expensecategorymaster.remoteMethod("getcategorymaster", {
        http: { path: "/getcategorymaster", verb: "get" },
        description: "Get Row by Doubts Id",
        accepts: { arg: "id", type: "number", required: true },
        returns: { arg: "response", type: "json" }
      });
      Expensecategorymaster.getallcategorymaster = function (cb) {
        let where_cond = {};        
        where_cond.status = 1;       
        Expensecategorymaster.find(
          {
            where: where_cond,
            order: "id DESC"
          },
          function (err, stdObj) {
            return cb(null, stdObj);
          }
        );
      };
      Expensecategorymaster.remoteMethod("getallcategorymaster", {
        http: { path: '/getallcategorymaster', verb: 'get' },
        description: 'Set the item master parameters',
        //accepts: { arg: "userId", type: "number", required: true },
        returns: { arg: "response", type: "json" }
      });
      Expensecategorymaster.getcategoryreimbursment = function (cb) {
        let where_cond = {};        
        where_cond.status = 1;   
        where_cond.category_for = 1;     
        Expensecategorymaster.find(
          {
            where: where_cond,
            order: "id DESC"
          },
          function (err, stdObj) {
            return cb(null, stdObj);
          }
        );
      };
      Expensecategorymaster.remoteMethod("getcategoryreimbursment", {
        http: { path: '/getcategoryreimbursment', verb: 'get' },
        description: 'Set the item master parameters',
        //accepts: { arg: "userId", type: "number", required: true },
        returns: { arg: "response", type: "json" }
      });
};
