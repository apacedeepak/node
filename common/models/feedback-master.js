'use strict';
var dateFormat = require('dateformat');
module.exports = function(Feedbackmaster) {
    
    /*
     * 
     * @param {json} data
     * @param {callback} cb
     * @returns {return inserted data}
     */
    Feedbackmaster.createfeedback = function (data, cb) {
        data.isAdmin = 1
        Feedbackmaster.upsert(data, function (err, user) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, user);
            }
        });
    };
    
    Feedbackmaster.remoteMethod(
        'createfeedback',
        {
            http: {path: '/createfeedback', verb: 'post'},
            description: 'Create user',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    /*
     * 
     * @param {json} data
     * @param {callback} cb
     * @returns {return object}
     */
    Feedbackmaster.getremarks = function (data, cb) {
        Feedbackmaster.find({
            where: {remarks_name: data.remarks_name, remarks_category: data.remarks_category, schoolId: data.schoolId, status: 1},
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };
    
    Feedbackmaster.remoteMethod(
        'getremarks',
        {
            http: {path: '/getremarks', verb: 'post'},
            description: 'Get username of user',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    /*
     * Get All Active Feedback
     */
    Feedbackmaster.getallremarks = function (cb) {
        Feedbackmaster.find({
            where: {status: 1},
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };
    
    Feedbackmaster.remoteMethod(
        'getallremarks',
        {
            http: {path: '/getallremarks', verb: 'get'},
            description: 'Get username of user',
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    /*
     * Get Remarks by id
     */
    Feedbackmaster.getremarkbyid = function (data, cb) {
        var feedbackId = data.id;
        Feedbackmaster.findById(feedbackId, {
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };
    
    Feedbackmaster.remoteMethod(
        'getremarkbyid',
        {
            http: {path: '/getremarkbyid', verb: 'post'},
            description: 'Get username of user',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    /*
     * Feedback delete API
     */
    Feedbackmaster.deletefeedback = function (data, cb) {
        var feedbackId = data.id;
        Feedbackmaster.destroyAll({id : feedbackId}, (err, result) => {
            if(result)
                return cb(null, "200", "Deleted successfully");
        });
    };
    
    Feedbackmaster.remoteMethod(
        'deletefeedback',
        {
            http: {path: '/deletefeedback', verb: 'post'},
            description: 'Get username of user',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'responseMessage', type: 'json' }]
        }
    );

    Feedbackmaster.createfeedbackother = (ctx, options, cb) => {
        let msg = {}

        var FileUpload = Feedbackmaster.app.models.fileupload;

        FileUpload.fileupload(ctx, options, 'feedback', function (err, response) {
            if(!response){
                msg.status = '201';
                msg.message = 'Response cannot be empty';
                return cb(null, msg, );
            }
            response.isAdmin = 1
            Feedbackmaster.upsert(response, function (err, user) {
                if (err) {
                    return cb(null, err);
                } else {
                    msg.status = '200';
                    msg.message = 'Information submitted successfully';
                    return cb(null, msg);
                }
            });
        });
    };

    Feedbackmaster.remoteMethod(
        'createfeedbackother',
        {

            description: 'Create user with image',
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } },
                { arg: 'options', type: 'object', http: { source: 'query' } },
            ],
            returns: [{ arg: 'response_status', type: 'string' }],
            http: { verb: 'post' }
        }
    );
    Feedbackmaster.createfeedbackmaster = function (ctx, options, cb) {
        var FileUpload = Feedbackmaster.app.models.fileupload;
        var today = new Date();
        var errorMessage = {};
        var successMessage = {};
        var insertObj = {};
        FileUpload.fileupload(ctx, options, 'feedback_master', function (err, data) {
          if (data.id > 0) {
            insertObj.id = data.id;            
            successMessage.message = "Expense Updated Successfully.";
          } else {            
            successMessage.message = "Expense Added Sucessfully.";
          }
         
         // console.log(data.file_path.length)
          var filepath = data.file_path[0];
          insertObj.remarks_icon = filepath;   
          insertObj.remarks_name = data.remarks_name;
          insertObj.status = data.status;
          insertObj.schoolId = data.schoolId;
          insertObj.added_by = data.added_by;
          insertObj.remarks_category = data.remarks_category;          
          
          insertObj.added_date= dateFormat(Date(), "isoDateTime");
    
          Feedbackmaster.upsert(insertObj, (err, result) => {
            if (err) {
              errorMessage.status = '201';
              errorMessage.message = "Error Occurred";
              return cb(err, errorMessage);
            }
            successMessage.status = "200";
            successMessage.detail = result;
            return cb(null, successMessage);
          });
        });
      }
      Feedbackmaster.remoteMethod(
        'createfeedbackmaster',
        {
          accepts: [
            { arg: 'ctx', type: 'object', http: { source: 'context' } },
            { arg: 'options', type: 'object', http: { source: 'query' } },
          ],
          returns: {
            arg: 'fileObject', type: 'object', root: true
          },
          http: { verb: 'post' }
        }
      )

      Feedbackmaster.getallremarksother = function (data, cb) {
        
        let whereobj = (data.user_id)? { status: 1, added_by: data.user_id }: {status: 1} 
      
        Feedbackmaster.find({
            where: whereobj,
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };
    
    Feedbackmaster.remoteMethod(
        'getallremarksother',
        {
            http: {path: '/getallremarksother', verb: 'post'},
            description: 'Get username of user other',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

};


