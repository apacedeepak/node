'use strict';
var dateFormat = require('dateformat');

module.exports = function(Ctp) {
    var notificationarr = [];
    Ctp.ctpnotification = function (req, cb) {
        
        var msg = {};
        if (!req.section_id) {
            msg.status = '201';
            msg.status = 'Section id cannot be blank';
           return cb(null, msg);
        }
        if (!req.session_id) {
            msg.status = '201';
            msg.status = 'Session id cannot be blank';
           return cb(null, msg);
        }
        if (!req.subject_id) {
            msg.status = '201';
            msg.status = 'Subject id cannot be blank';
           return cb(null, msg);
        }
        if (!req.ctp_action) {
            msg.status = '201';
            msg.status = 'Action cannot be blank';
           return cb(null, msg);
        }
        var returnMessage = {};
        var UserSubject = Ctp.app.models.user_subject;
        var sendobj = { 'section_id': req.section_id, 'session_id': req.session_id, 'subject_id': req.subject_id, 'user_type': 'Student' }
        UserSubject.subjectwiseusers(sendobj, function (err, message, userdata) {
            

                userdata.forEach(function (data) {
                Ctp.addNotificationList(data.user_id, '', req.ctp_action, 'Ctp Class');
                });
              if (notificationarr.length > 0) {
                var Notification = Ctp.app.models.notification;
                Notification.pushnotification(notificationarr);
                returnMessage.status = "200";
                returnMessage.message = "success";
                return cb(null,returnMessage);
                                }
            else
                {
                    returnMessage.status = "200";
                    returnMessage.message = "No students are assigned to this class section subject";
                    return cb(null,returnMessage);
                }

        })
              
        
    };

  Ctp.addNotificationList = function(userid, keyid, title, notificationtext)
  {
        var notificationobj = {};
        notificationobj.user_id = userid;
        notificationobj.module_key_id = keyid;
        notificationobj.type = title.toLowerCase()=='startclass'?9:10;
        notificationobj.title = title;
        notificationobj.notification_text = notificationtext;
        notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
        notificationarr.push(notificationobj);
  }
  Ctp.remoteMethod(
        'ctpnotification',
        { 
            http: {verb: 'post'},
            description: 'Sending ctp notification to student',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{arg: 'response', type: 'json'}]
        }
    );
    
    
};
