'use strict';
var dateFormat = require('dateformat');
var unique = require('array-unique');
module.exports = function(Userfeedbackfrequency) {
    Userfeedbackfrequency.addUserfeedbackfrequency = (data, cb) => {
        var today = new Date();
        var errorMessage = {};
        var successMessage = {};
        var insertObj = {};
        if (data.id > 0) {
          insertObj.id = data.id;
          successMessage.message = "Record Updated Successfully.";
        } else {
          insertObj.created_date = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
          insertObj.created_by = data.user_id;          
          successMessage.message = "Record Inserted Successfully.";
        }
        insertObj.no_of_days = data.no_of_days;        
        insertObj.status = 1;
        Userfeedbackfrequency.upsert(insertObj, (err, result) => {
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
      Userfeedbackfrequency.remoteMethod(
        'addUserfeedbackfrequency',
        {
          http: { path: '/addUserfeedbackfrequency', verb: 'post' },
          description: 'Add expense master for imprest',
          accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
          returns: { arg: 'response', type: 'json' }
        }
      );
      Userfeedbackfrequency.getUserfeedbackfrequency = function (id, cb) {
        Userfeedbackfrequency.findOne(
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
    
      Userfeedbackfrequency.remoteMethod("getUserfeedbackfrequency", {
        http: { path: "/getUserfeedbackfrequency", verb: "get" },
        description: "Get Row by Doubts Id",
        accepts: { arg: "id", type: "number", required: true },
        returns: { arg: "response", type: "json" }
      });
      Userfeedbackfrequency.getallUserfeedbackfrequency = function (cb) {       
        Userfeedbackfrequency.find({         
          where: { "status": "1" }
        }, function (err, res) {
            if (err) {
                cb(null, err);
              }
              cb(null, res);
    
        });
      };
      Userfeedbackfrequency.remoteMethod("getallUserfeedbackfrequency", {
        http: { path: '/getallUserfeedbackfrequency', verb: 'get' },
        description: 'get the all imprest request',
       // accepts: { arg: "userId", type: "number", required: true },
        returns: { arg: "response", type: "json" }
      });
    
     
};
