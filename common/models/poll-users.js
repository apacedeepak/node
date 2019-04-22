'use strict';

var dateFormat = require('dateformat');

module.exports = function(Pollusers) {
    
    Pollusers.pollsubmission = function(data, cb){
        var errorMessage = {};
    var successMessage = {};
        if (!data){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Request cannot be empty";
            return cb(null, errorMessage);
        }
        if (!data.poll_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Poll id cannot be empty";
            return cb(null, errorMessage);
        }
        if (!data.user_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "User id cannot be empty";
            return cb(null, errorMessage);
        }
        if (!data.answer){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Answer cannot be empty";
            return cb(null, errorMessage);
        }
        
        if(!data.token){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Token cannot be empty";
            return cb(null, errorMessage);
        }
        
        var param = {
            student_answer: data.answer,
            user_submission_date: dateFormat(new Date(), "yyyy-mm-dd H:MM:ss")
        };
        
        var pollObj = Pollusers.app.models.polls;
        
        
        Pollusers.upsertWithWhere({pollId : data.poll_id, userId: data.user_id} , param, function(err, updatedUser){
            
            
            if(err){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error";
                return cb(null, errorMessage, err);
            }
            if(updatedUser){
                
                pollObj.findById(data.poll_id, (err, getData)=>{
                    
                    var notificationarr =[];
                    var notificationobj = {};
                                
                    notificationobj.user_id = getData.userId;
                    notificationobj.module_key_id = data.poll_id;
                    notificationobj.type = 14;
                    notificationobj.title = "Poll submission";
                    notificationobj.notification_text = "";
                    notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                    notificationarr.push(notificationobj);
                    
                    if (notificationarr.length > 0) {
                        var Notification = Pollusers.app.models.notification;
                        Notification.sendnotification(notificationarr);   
                    }
                    
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Answer submitted successfully";
                    return cb(null, successMessage);
                    
                })
                
                
                
                
            }else{
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error Occur";
                return cb(null, errorMessage);
            }
            
        });
        
    }
    
    Pollusers.remoteMethod(
        "pollsubmission",
        {
            http: {path:'/pollsubmission', verb: 'post'},
            description: 'poll answer submission',
            accepts: {arg:"data", type:"object", http: {source: "body"} },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    
    
    Pollusers.studentreceivepoll = function(data, cb){
        
    }
    
    Pollusers.remoteMethod(
        "studentreceivepoll",
        {
            http: {path:'/studentreceivepoll', verb: 'post'},
            description: 'student receive poll',
            accepts: {arg:"data", type:"object", http: {source: "body"} },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
};
