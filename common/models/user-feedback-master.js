'use strict';

module.exports = function(Userfeedbackmaster) {
    Userfeedbackmaster.createfeedback = (ctx, options, cb) => {
        let msg = {}

        var FileUpload = Userfeedbackmaster.app.models.fileupload;

        FileUpload.fileupload(ctx, options, 'feedback', function (err, response) { 
          
            if(!response){
                msg.status = '201';
                msg.message = 'Response cannot be empty';
                return cb(null, msg);
            }
            response.isAdmin = 0
            if(!response.remarks_name) {
                msg.status = '201';
                msg.message = 'Some error';
                return cb(null, msg); 
            }
            Userfeedbackmaster.find({
                where: {status: 1, remarks_name: response.remarks_name},
            }, function (err, stdObj) {
                if(stdObj.length > 0 && !response.id){
                    msg.status = '201';
                    msg.message = 'Remark already present';
                    return cb(null, msg);
                }
                var user_feedback_master = Userfeedbackmaster.app.models.user_feedback_master
                user_feedback_master.find({
                    where: {status: 1, remarks_name: response.remarks_name},
                }, function (err, stdObj) {
                    if(stdObj.length > 0 && !response.id) {
                        msg.status = '201';
                        msg.message = 'Remark already present';
                        return cb(null, msg);
                    }

                Userfeedbackmaster.upsert(response, (err, res) => {
                    if (err) {
                        return cb(null, err);
                    } else {
                        msg.status = '200';
                        msg.message = (response.id)? "Information updated successfully": 'Information submitted successfully';
                        return cb(null, msg, {remarks_icon: response.remarks_icon});
                    }
                });

            });
            });
        });
    };

    Userfeedbackmaster.remoteMethod(
        'createfeedback',
        {
            description: 'Create user with image',
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } },
                { arg: 'options', type: 'object', http: { source: 'query' } },
            ],
            returns: [{arg: 'response_type', type: 'json'}, {arg: 'response', type: 'json'}],
            http: { verb: 'post' }
        }
    );

    Userfeedbackmaster.createfeedbackother = function (data, cb) {
        let msg = {}
        data.isAdmin = 0
        if(!data.remarks_name) {
            msg.status = '201';
            msg.message = 'Some error';
            return cb(null, msg); 
        }
        Userfeedbackmaster.find({
            where: {status: 1, remarks_name: data.remarks_name},
        }, function (err, stdObj) {
            if(stdObj.length > 0){
                msg.status = '201';
                msg.message = 'Remark already present';
                return cb(null, msg);
            }
            var user_feedback_master = Userfeedbackmaster.app.models.user_feedback_master
            user_feedback_master.find({
                where: {status: 1, remarks_name: data.remarks_name},
            }, function (err, stdObj) {
                if(stdObj.length > 0) {
                    msg.status = '201';
                    msg.message = 'Remark already present';
                    return cb(null, msg);
                }
        Userfeedbackmaster.upsert(data, function (err, user) {
            if (err) {
                cb(null, err);
            } else {
                msg.status = '200';
                msg.message = "Information submitted successfully"
                return cb(null, msg);
            }
        });
    });
});
    };
    
    Userfeedbackmaster.remoteMethod(
        'createfeedbackother',
        {
            http: {path: '/createfeedbackother', verb: 'post'},
            description: 'Create user without image',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response_type', type: 'json'}
        }
    );


    Userfeedbackmaster.getallremarks = function (cb) {
        Userfeedbackmaster.find({
            where: {status: 1},
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };
    
    Userfeedbackmaster.remoteMethod(
        'getallremarks',
        {
            http: {path: '/getallremarks', verb: 'get'},
            description: 'Get username of user',
            returns: {arg: 'response', type: 'json'}
        }
    );


    Userfeedbackmaster.getallremarksother = function (data, cb) {
        
        let whereobj = (data.user_id)? { status: 1, added_by: data.user_id }: {status: 1} 
      
        Userfeedbackmaster.find({
            where: whereobj,
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };
    
    Userfeedbackmaster.remoteMethod(
        'getallremarksother',
        {
            http: {path: '/getallremarksother', verb: 'post'},
            description: 'Get username of user other',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

};
