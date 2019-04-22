'use strict';

var serialize = require("php-serialization").serialize;
var Class = require("php-serialization").Class;
var unserialize = require("php-serialization").unserialize;
var constantval = require('./constant');
var arraySort = require('array-sort');
var Dedupe = require('array-dedupe')
var dateFormat = require('dateformat');
module.exports = function (Communication) {
    
    var today = dateFormat(Date(), "yyyy-mm-dd");
    // var dd = today.getDate();
    // var mm = today.getMonth()+1; //January is 0!
    // var yyyy = today.getFullYear();

    // if(dd<10) {
    //     dd = '0'+dd
    // } 

    // if(mm<10) {
    //     mm = '0'+mm
    // } 

    // today = yyyy + '-' + mm + '-' + dd;
    
    // var dateFormat = require('dateformat');
    var tempArr = [];
    var school_id_check = undefined;
    Communication.compose = function (ctx, options, cb) {
        var errorMessage = {};
        var successMessage = {};
        const messageObj = {};


        var FileUpload = Communication.app.models.fileupload;
        FileUpload.fileupload(ctx, options, 'message', function (err, data) {
            
            let notificationarr = [];

            if(data.status!=undefined && (data.status=='201'|| data.status=='000'))
            {
              errorMessage.status = data.status;
              errorMessage.message = data.message;
              cb(null,errorMessage);
            }
            if (data.user_type) {
                messageObj.user_type = data.user_type;
            } else {
                errorMessage.status = '201';
                errorMessage.message = "userType cannot be blank";
                return cb(null, errorMessage);
            }
            if (data.user_id) {
                messageObj.message_createdby = data.user_id;
            } else {
                errorMessage.status = '201';
                errorMessage.message = "sender_id cannot be blank";
                return cb(null, errorMessage);
            }
            var c = new Class();
            for (var m = 0; m < data.file_path.length; m++) {

                c.__addAttr__(m, "integer", data.file_path[m], "string");

            }

            var filepath = '';
            if (data.file_path.length > 0)
                filepath = serialize(c, "array");
            messageObj.placeholder = "message";

            var draftuserIdArr = [];
            var draftgarbageIdArr = [];
            if (data.message_type.toLowerCase() == 'draft') {
                var draftStudId = [];
                messageObj.placeholder = "Draft";
                
               data.student_user_id_flag.forEach(function (userId, key) {
                   if(userId && userId != 0){
                       draftStudId.push(userId);
                   }else{
                       draftStudId.push(0);
                   }
               });
                data.receipient_id.forEach(function (userId, key) {
                    draftuserIdArr.push(userId);
                    if(draftStudId.length == 0){
                        draftgarbageIdArr.push(draftStudId.toString());
                    }else{
                        draftgarbageIdArr.push(draftStudId);
                    }
                    
                });
            }

            var studentUserIds = ''
            if(data.user_type.toLowerCase() == 'parent'){
                studentUserIds = data.student_user_id_flag[0]
            }

            messageObj.message_subject = data.subject;
            messageObj.message_body = data.content;
            messageObj.attachments = filepath;
            messageObj.schoolId = data.school_id;
            messageObj.message_date = new Date();
            messageObj.userId = data.user_id;
            messageObj.draft_data = draftuserIdArr;
            messageObj.channel = JSON.stringify(data.channel);
            messageObj.studentuserId = studentUserIds;
            messageObj.draft_student_id = draftgarbageIdArr;
            messageObj.post_by = data.post_by;
            
            if (data.message_id) {
                messageObj.id = data.message_id;
                messageObj.draft_data = '';
                messageObj.placeholder = "message";
            }
            if (data.draft_id) {
                messageObj.id = data.draft_id;
            }
            if(!(data.user_type == "Parent" && studentUserIds == "")){

            Communication.upsert(messageObj, function (err, message) {
                var sendFlag = true;
              let promises = [];
                if (err) {

                    errorMessage.status = '201';
                    errorMessage.message = "fail";
                    return cb(null, errorMessage);
                }

                if (data.receipient_id) {
                    if (data.message_type.toLowerCase() == 'draft') {

                        successMessage.status = '200';
                        successMessage.message = "Message Draft Successfully";
                        successMessage.messageInsert = message;
                        return cb(null, successMessage);


                    } else {
                        var MessageRecipient = Communication.app.models.message_recipient;

                        let recipientCount = data.receipient_id[0].length - 1;
                        notificationarr = [];

                        data.receipient_id[0].forEach(function (userId,key) {
                          let notificationobj = {};

                          var user = Communication.app.models.user;

                            user.getuserbyid(userId, function (err, getUserData) {
                                let userType = getUserData.user_type;
                              user.getuserbyid(data.user_id, function (err, getSenderData) {

                                let sendNotName = "";
                                if(getSenderData.user_type == "Student"){
                                    sendNotName = getSenderData.students().name;
                                }else if(getSenderData.user_type == "Teacher"){
                                    sendNotName = getSenderData.user_belongs_to_staff().name;
                                }else if(getSenderData.user_type == "Parent"){
                                    sendNotName = "Father";
                                }else{
                                  sendNotName = getSenderData.user_name;
                                }
                                 

                                    notificationobj.user_id = userId;
                                    notificationobj.module_key_id = message.id;
                                    notificationobj.type = 1;
                                    notificationobj.title = "New Message Received";
                                    notificationobj.notification_text = "Message From "+sendNotName+" ("+message.user_type+")";
                                    notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                                    notificationarr.push(notificationobj);

                                let params = {
                                    user_id: userId,
                                    user_type: userType.toLowerCase()
                                };
                                
                                var studentUserId = ''
                                if(data.student_user_id_flag[key] && userType.toLowerCase() == 'parent'){
                                    studentUserId = data.student_user_id_flag[key]
                                }
                            if(!(userType == "Parent" && studentUserId == "")){
                                var message_recipientObj = {
                                    "messageId": message.id,
                                    "senderId": data.user_id,
                                    "receiverId": userId,
                                    "placeholder": 'Inbox',
                                    "message_isread": "No",
                                    "user_type": userType,
                                    "created_date": new Date(),
                                    "userId": userId,
                                    "schoolId": data.school_id,
                                    "studentuserId": studentUserId
                                };
                                

                                MessageRecipient.create(message_recipientObj, function (err) {
                                    if(recipientCount == key){
                                        if(notificationarr.length>0)
                                          {   var Notification = Communication.app.models.notification;
                                              Notification.pushnotification(notificationarr);
                                          }
                                    }

                                });
                            }else{
                                
                                sendFlag = false;
                                
                            }
                            });
                            });
                            });

                            
                            var studentUserIds = ''
                            if(data.user_type.toLowerCase() == 'parent'){
                                studentUserIds = data.student_user_id_flag[0]
                            }
                        if(!(data.user_type == "Parent" && studentUserIds == '')){
                            var message_recipientObj = {
                                "messageId": message.id,
                                "senderId": data.user_id,
                                "receiverId": data.user_id,
                                "placeholder": "Sent",
                                "message_isread": "Yes",
                                "user_type": data.user_type,
                                "created_date": new Date(),
                                "userId": data.user_id,
                                "schoolId": data.school_id,
                                "studentuserId": studentUserIds
                            };
                            MessageRecipient.create(message_recipientObj, function (err) {

                            });
                        }
                    }
                }
                setTimeout(function(){
                    if(sendFlag){
                        successMessage.status = '200';
                        successMessage.message = "Message Sent Successfully";
                        return cb(null, successMessage);
                    }else{
                        MessageRecipient.destroyAll({messageId: message.id}, function (err, obj) {
                            Communication.destroyAll({id: message.id}, function (errMess, objMess) {
                                errorMessage.status = '201';
                                errorMessage.message = "student_user_id_flag cannot blank it message send by parent";
                                return cb(null, errorMessage);
                            });

                        });
                    }
                },1000);
            });
        }else{
            errorMessage.status = '201';
            errorMessage.message = "student_user_id_flag cannot blank it message send by parent";
            return cb(null, errorMessage);
            
        }

        })


    }

    Communication.getallmessage = function (cb) {
        Communication.find({
            include: {
                relation: "message_users"
            },
            where: {placeholder: "Inbox"}
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            } else {
                return cb(null, result);
            }
        });
    }
    
    Communication.inboxdata = (data, cb) => {
        let messageRecipientObj = Communication.app.models.message_recipient;
        let userModel = Communication.app.models.user;
        let user_id = data.user_id;
        let user_type = data.user_type.toLowerCase();
        let userRelations = {};
        var message = {};
        var attch = [];
        
        if (user_type == 'teacher') {
            userRelations.include = {
                relation: 'staff',
                scope: {}
            };
             school_id_check = data.school_id;
            
        } else if (user_type == 'student') {
            userRelations.include = {
                relation: 'students',
                scope: {}
            };
        } else if (user_type == 'parent') {
            userRelations.include = {
                relation: 'parents',
                scope: {}
            };
        }
        let relation = {};
        if(user_type == 'parent'){
                //relation.userId = user_id;
                relation.schoolId = school_id_check;
                relation.studentuserId = data.student_user_id;
                relation.placeholder= {inq: ['Inbox']};
            }else{
              relation.userId = user_id;
              relation.schoolId = school_id_check;
              relation.placeholder= {inq: ['Inbox']};
        }
        
        messageRecipientObj.find(
                {
                    where: relation,
                    include: [{relation: "messages",
                            
                            order: 'message_date DESC',
                            scope: {
                                include: {
                                    relation: 'users',
                                    scope: {}
                                }
                            }
                        },
                        {
                            relation: 'users',
                            scope: userRelations
                        }],
                   // limit: 3,
                    order: 'messageId ASC',
                }, function (err, res) {
                    
                    let result = {};
                    let inbox = [];
                    let promiseInbox = [];
                    let senderName = {};
                    let inboxUnreadCount = 0;
                    
                    
                    for (let key in res) {
                        if(res[key].messages() && res[key].messages().users()){
                        if (res[key].placeholder == 'Inbox') {
                            let attch = [];
                            let images = '';
                            promiseInbox = new Promise((resolve, reject) => {
                                var userTYPE = res[key].messages().users().user_type;
                                var userID = res[key].messages().users().id;

                                if(res[key].messages().user_type.toLowerCase() == 'parent'){
                                    userTYPE = 'Student';
                                    userID = res[key].messages().studentuserId;
                                }
                                let param = {
                                    user_type: res[key].messages().users().user_type,
                                    user_id: res[key].messages().users().id
                                }
                                let params = {
                                    user_type: userTYPE,
                                    user_id: userID
                                }

                                userModel.getuserdatabytype(param, function (err, respo) {

                                    userModel.getuserdatabytype(params, function (err, respos) {
                                        senderName = {};

                                        if (respo[0].user_type == 'Parent') {
                                            senderName.name = respos[0].students().name+ " (P)";
                                            senderName.id = respo[0].parents().userId;
                                            senderName.type = respo[0].user_type;
                                            images = respo[0].parents().father_photo;
                                            resolve(senderName);
                                        } else if (respo[0].user_type == 'Student') {
                                            senderName.name = respo[0].students().name;
                                            senderName.id = respo[0].students().userId;
                                            senderName.type = respo[0].user_type;
                                            images = respo[0].students().student_photo;
                                            resolve(senderName);
                                        } else if (respo[0].user_type == 'Teacher') {
                                            senderName.name = respo[0].user_belongs_to_staff().name;
                                            senderName.id = respo[0].user_belongs_to_staff().userId;
                                            images = respo[0].user_belongs_to_staff().profile_image;
                                            senderName.type = respo[0].user_type;
                                            resolve(senderName);
                                        }else if (respo[0].user_type == 'Other') {
                                            senderName.name = respo[0].other_user_registration().name;
                                            senderName.id = respo[0].other_user_registration().userId;
                                            senderName.type = respo[0].user_type;
                                            resolve(senderName);
                                        }else{
                                            senderName.name = respo[0].user_name;
                                            senderName.id = respo[0].id;
                                            senderName.type = respo[0].user_type;
                                            resolve(senderName);
                                        }
                                    });

                                });
                            }).then((senderName) => {
                                return new Promise((resolve, reject) => {
                                    if (res[key].messages().attachments != '') {
                                        var DataUnserileRst = unserialize(res[key].messages().attachments);
                                        for (var keys in DataUnserileRst.__attr__) {

                                            attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[keys].val);
                                        }
                                    }

                                    if(res[key].message_isread == 'No'){
                                        inboxUnreadCount++;
                                    }
                                    inbox.push({
                                        "message_id": res[key].messageId,
                                        "message_subject": res[key].messages().message_subject,
                                        "message_body": res[key].messages().message_body,
                                        "attachment_count": attch.length,
                                        "message_date": dateFormat(res[key].messages().message_date, "yyyy-mm-dd HH:MM:ss"),
                                        "message_date_app": dateFormat(res[key].messages().message_date, "isoDateTime"),
                                        "message_time": dateFormat(res[key].messages().message_date, "H:MM:ss"),
                                        "message_onlydate": dateFormat(res[key].messages().message_date, "yyyy-mm-dd"),
                                        "attachments": attch,
                                        "display_name": senderName.name,
                                        "display_id": senderName.id,
                                        "display_type": senderName.type,
                                        "student_user_id": res[key].messages().studentuserId,
                                        "message_isimportant": res[key].message_isimportant,
                                        "message_isread": res[key].message_isread,
                                        "images": images,
                                        "today_date": today,
                                        "displayTime":Date.parse(today) == Date.parse(dateFormat(res[key].messages().message_date, "yyyy-mm-dd"))?'1':'0'
                                    });
                                  
                                  var inboxSort = arraySort(inbox, 'message_id', {reverse: true});
                                    resolve(inboxSort);
                                })

                            });

                        }

                    }
                    }
                    
                    Promise.all([promiseInbox]).then((result) => {
                        var res = {};
                        res.inbox = result[0];
                        res.inboxUnreadCount = inboxUnreadCount;
                        message.status = "200";
                        message.message = "Data fetched successfully";
                        return cb(null, message, res);
                    });
                });
    }
    
    Communication.remoteMethod(
            'inboxdata',
            {
                http: {path: '/inboxdata', verb: 'post'},
                description: 'messages in inbox',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    
    
    Communication.getinboxarchive = function (data, cb){
     
        var errorMessage = {};
        var successMessage = {};
        
        let messageRecipientObj = Communication.app.models.message_recipient;
        
        if(data.user_type){
            let user_type = data.user_type.toLowerCase();
            if(user_type == 'parent'){
                data.user_id = undefined;
                data.school_id = undefined;
            }else if(user_type == 'teacher'||user_type == 'school'){
                data.student_user_id = undefined;
            }else if(user_type == 'student'){
                data.student_user_id = undefined;
                data.school_id = undefined;
            }
        }else{
            data.user_id = undefined;
            data.school_id = undefined;
            data.student_user_id = undefined;
        }
        
        if(!data.search_id){
            data.search_id = [];
        }
        
        
        if(data.message_id && data.place && data.place.toLowerCase() == "inbox"){
          let parametr = {
              message_id: data.message_id,
              user_id: data.user_id,
              markasread: 'markasread'
          };
          messageRecipientObj.markasimportant(parametr,(err, mesgeRead)=>{

          })
        }
        
        var whereRealtion = {};
        
        if(data.from_date){
           whereRealtion.and = [
                    {userId: data.user_id},
                    {messageId:data.message_id},
                    {placeholder:{inq: ['Inbox', 'Archived']}},
                    {created_date: { gte: dateFormat(data.from_date, "isoDateTime") }},
                    {created_date: { lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59") }}
                  ]; 
        }else{
            
            whereRealtion.receiverId = data.user_id,
            whereRealtion.messageId = data.message_id,
            whereRealtion.schoolId= data.school_id,
            whereRealtion.studentuserId= data.student_user_id,
            whereRealtion.placeholder= {inq: ['Inbox', 'Archived']}
        }
        
        
        
        messageRecipientObj.find({
            where: whereRealtion,
            include:[{
                relation: "messages",
                scope:{
                    include:[{
                        relation: 'users',
                        scope:{
                            include:[{
                                relation: 'staff'  
                            },{
                                relation: "students",
                                scope:{
                                    include:{
                                        relation: "studentbelongtoparent"
                                    }
                                }
                            },{
                                relation: 'parents'
                            },{
                                relation: 'other_user_registration'
                            }]
                        }
                    },{
                        relation: 'userbelong',
                        scope:{
                                include:{
                                    relation: "students",
                                    scope:{
                                        include:{
                                            relation: "studentbelongtoparent"
                                        }
                                    }
                                }
                            }
                    }]
                }
            },{
                relation: "users",
                scope:{
                    include:[{
                        relation: 'staff'  
                    },{
                        relation: "students",
                        scope:{
                            include:{
                                relation: "studentbelongtoparent"
                            }
                        }
                    },{
                        relation: 'parents'
                    },{
                        relation: 'other_user_registration'
                    }]
                }
            },{
                relation: 'user',
                scope:{
                        include:{
                            relation: "students",
                            scope:{
                                include:{
                                    relation: "studentbelongtoparent"
                                }
                            }
                        }
                    }
            }]
        }, function(err, res){
            
            var archived = [];
            var inbox = [];
            
            if(err){
                errorMessage.status = "201";
                errorMessage.message = "Error in inbox";
                return cb(null, errorMessage);
            }
            
            var inboxUnreadCount = 0;
            var result = {
                    inbox: [],
                    archived: [],
                    inboxUnreadCount: 0
                }
                successMessage.status = "200";
                successMessage.message = "Data fetched successfully";
            if(res.length > 0){
                for(let key in res){
                    var attch = [];
                    if(res[key].messages() && res[key].messages().users()){
                        attch = [];
                        if (res[key].messages().attachments) {
                                var DataUnserileRst = unserialize(res[key].messages().attachments);
                                for (var keys in DataUnserileRst.__attr__) {

                                    attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[keys].val);
                                }
                        }
                        var senderName = "";
                        var senderId = "";
                        var senderType = "";
                        var images = "";
                        
                        if(res[key].messages().user_type.toLowerCase() == 'parent'){
                            if(res[key].messages().userbelong()){
                                senderName = res[key].messages().userbelong().students().name + " (P)";
                                senderId = res[key].messages().userbelong().students().studentbelongtoparent().userId;
                                senderType = res[key].messages().user_type;
                                images = res[key].messages().userbelong().students().studentbelongtoparent().father_photo;
                            }
                        }else if(res[key].messages().user_type.toLowerCase() == 'student'){
                            senderName = res[key].messages().users().students().name;
                            senderId = res[key].messages().users().students().userId;
                            senderType = res[key].messages().user_type;
                            images = res[key].messages().users().students().student_photo;
                            
                        }else if(res[key].messages().user_type.toLowerCase() == 'teacher'){
                            senderName = res[key].messages().users().staff().name;
                            senderId = res[key].messages().users().staff().userId;
                            senderType = res[key].messages().user_type;
                            images = res[key].messages().users().staff().profile_image;
                            
                        }else if(res[key].messages().user_type.toLowerCase() == 'other'){
                            senderName = res[key].messages().users().other_user_registration().name;
                            senderId = res[key].messages().users().other_user_registration().userId;
                            senderType = res[key].messages().user_type;
                            
                        }else{
                            senderName = res[key].messages().users().user_name;
                            senderId = res[key].messages().users().id;
                            senderType = res[key].messages().users().user_type;
                            
                        }
                    }else{
                        if(res[key].messages() && res[key].messages().userbelong()){
                            senderName = res[key].messages().userbelong().students().name + " (P)";
                            senderId = res[key].messages().userbelong().students().studentbelongtoparent().userId;
                            senderType = res[key].messages().user_type;
                            images = res[key].messages().userbelong().students().studentbelongtoparent().father_photo;
                        }
                    }
                    if(res[key].messages()){
                        
                        if(res[key].placeholder == 'Archived'){
                            let index = data.search_id.indexOf(senderId);
                            if(data.search_id.length > 0){
                                if( index != -1){
                                    archived.push({
                                        "message_id": res[key].messageId,
                                        "message_subject": res[key].messages().message_subject,
                                        "message_body": res[key].messages().message_body,
                                        "attachment_count": attch.length,
                                        "message_date": dateFormat(res[key].messages().message_date, "yyyy-mm-dd HH:MM:ss"),
                                        "message_date_app": dateFormat(res[key].messages().message_date, "isoDateTime"),
                                        "message_time": dateFormat(res[key].messages().message_date, "H:MM:ss"),
                                        "message_onlydate": dateFormat(res[key].messages().message_date, "yyyy-mm-dd"),
                                        "attachments": attch,
                                        "display_name": senderName,
                                        "display_id": senderId,
                                        "display_type": senderType,
                                        "student_user_id": res[key].messages().studentuserId,
                                        "message_isimportant": res[key].message_isimportant,
                                        "message_isread": res[key].message_isread,
                                        "images": images,
                                        "today_date": today,
                                        "displayTime":Date.parse(today) == Date.parse(dateFormat(res[key].messages().message_date, "yyyy-mm-dd"))?'1':'0'
                                    });
                                }
                            }else{
                                archived.push({
                                    "message_id": res[key].messageId,
                                    "message_subject": res[key].messages().message_subject,
                                    "message_body": res[key].messages().message_body,
                                    "attachment_count": attch.length,
                                    "message_date": dateFormat(res[key].messages().message_date, "yyyy-mm-dd HH:MM:ss"),
                                    "message_date_app": dateFormat(res[key].messages().message_date, "isoDateTime"),
                                    "message_time": dateFormat(res[key].messages().message_date, "H:MM:ss"),
                                    "message_onlydate": dateFormat(res[key].messages().message_date, "yyyy-mm-dd"),
                                    "attachments": attch,
                                    "display_name": senderName,
                                    "display_id": senderId,
                                    "display_type": senderType,
                                    "student_user_id": res[key].messages().studentuserId,
                                    "message_isimportant": res[key].message_isimportant,
                                    "message_isread": res[key].message_isread,
                                    "images": images,
                                    "today_date": today,
                                    "displayTime":Date.parse(today) == Date.parse(dateFormat(res[key].messages().message_date, "yyyy-mm-dd"))?'1':'0'
                                });
                            }
                        }else if(res[key].placeholder == 'Inbox'){
                            let index = data.search_id.indexOf(senderId);
                            
                            if(res[key].message_isread == 'No'){
                                inboxUnreadCount++;
                            }
                            if(data.search_id.length > 0){
                                if(index != -1){
                                    inbox.push({
                                        "message_id": res[key].messageId,
                                        "message_subject": res[key].messages().message_subject,
                                        "message_body": res[key].messages().message_body,
                                        "attachment_count": attch.length,
                                        "message_date": dateFormat(res[key].messages().message_date, "yyyy-mm-dd HH:MM:ss"),
                                        "message_date_app": dateFormat(res[key].messages().message_date, "isoDateTime"),
                                        "message_time": dateFormat(res[key].messages().message_date, "H:MM:ss"),
                                        "message_onlydate": dateFormat(res[key].messages().message_date, "yyyy-mm-dd"),
                                        "attachments": attch,
                                        "display_name": senderName,
                                        "display_id": senderId,
                                        "display_type": senderType,
                                        "student_user_id": res[key].messages().studentuserId,
                                        "message_isimportant": res[key].message_isimportant,
                                        "message_isread": res[key].message_isread,
                                        "images": images,
                                        "today_date": today,
                                        "displayTime":Date.parse(today) == Date.parse(dateFormat(res[key].messages().message_date, "yyyy-mm-dd"))?'1':'0'
                                    });
                                }
                            }else{
                                inbox.push({
                                    "message_id": res[key].messageId,
                                    "message_subject": res[key].messages().message_subject,
                                    "message_body": res[key].messages().message_body,
                                    "attachment_count": attch.length,
                                    "message_date": dateFormat(res[key].messages().message_date, "yyyy-mm-dd HH:MM:ss"),
                                    "message_date_app": dateFormat(res[key].messages().message_date, "isoDateTime"),
                                    "message_time": dateFormat(res[key].messages().message_date, "H:MM:ss"),
                                    "message_onlydate": dateFormat(res[key].messages().message_date, "yyyy-mm-dd"),
                                    "attachments": attch,
                                    "display_name": senderName,
                                    "display_id": senderId,
                                    "display_type": senderType,
                                    "student_user_id": res[key].messages().studentuserId,
                                    "message_isimportant": res[key].message_isimportant,
                                    "message_isread": res[key].message_isread,
                                    "images": images,
                                    "today_date": today,
                                    "displayTime":Date.parse(today) == Date.parse(dateFormat(res[key].messages().message_date, "yyyy-mm-dd"))?'1':'0'
                                });
                            }
                        }
                    }
                }
                
                
                
                
                 result = {
                    inbox: inbox,
                    archived: archived,
                    inboxUnreadCount: inboxUnreadCount
                }
                
               
            }
             return cb(null, successMessage, result)
            
        });
        
    }
    
    
    Communication.remoteMethod(
            'getinboxarchive',
            {
                http: {path: '/getinboxarchive', verb: 'post'},
                description: 'messages in inbox, archieve',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    
    
    Communication.communication = function (data, cb) {
        
        var errorMessage = {};
        
        var res = {
                inbox: [],
                sent: [],
                draft: [],
                archived: [],
                inboxUnreadCount: 0
            };
            
        Communication.draftData(data,function(errDraft, getDraft){    
        
        Communication.getinboxarchive(data, function(errInbox, inboxStatus,getInbox){
            
            if(errInbox){
                errorMessage.status = "201";
                errorMessage.message = "Error in inbox";
                return cb(null, errorMessage);
            }
            if(inboxStatus.status == "201"){
                errorMessage.status = "201";
                errorMessage.message = "Error in inbox";
                return cb(null, errorMessage);
            }
            
            Communication.getsentmessage(data, function(errSent, sentStatus,getSent){
                
                if(errSent){
                    errorMessage.status = "201";
                    errorMessage.message = "Error in sent";
                    return cb(null, errorMessage);
                }
                if(sentStatus.status == "201"){
                    errorMessage.status = "201";
                    errorMessage.message = "Error in sent";
                    return cb(null, errorMessage);
                }
                
                
                    
                    if(errDraft){
                        errorMessage.status = "201";
                        errorMessage.message = "Error in Draft";
                        return cb(null, errorMessage);
                    }
                    
                    
                    var message = {};

                    var inbox = arraySort(getInbox.inbox, 'message_id', {reverse: true});
                    var sent = arraySort(getSent, 'message_date', {reverse: true});
                    var archieve = arraySort(getInbox.archived, 'message_id', {reverse: true});


                    res.inbox = inbox;
                    res.sent = sent;
                    res.draft = getDraft;
                    res.archived = archieve;
                    res.inboxUnreadCount = getInbox.inboxUnreadCount;
                    message.status = "200";
                    message.message = "Data fetched successfully";
                    return cb(null, message, res);
                });
            });
        });
    }
    
   
    
    Communication.draftData = (data, cb)=>{
        
        var draft = [];
        let promiseDraft = new Promise((resolve, reject) => {
              let param = {};
                if(data.message_id){
                    param.user_id = data.user_id;
                    param.message_id= data.message_id;
                }else{
                  param.user_id = data.user_id;
                }
                if(data.user_type.toLowerCase() == 'parent'){
                    param.student_user_id = data.student_user_id
                }
                param.user_type = data.user_type;
                Communication.getdraftrecord(param, (err, getDetails) => {
                  const detData = getDetails[0];

                  resolve(detData);
                });
            }).then((details) => {
                return new Promise((resolve, reject) => {
                    for (let key in details) {

                         let attch = [];
                        if (details[key].attachments != '')
                        {
                            var DataUnserileRst = unserialize(details[key].attachments);
                            for (var keys in DataUnserileRst.__attr__)
                            {

                                attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[keys].val);
                            }

                        }

                        draft.push(
                                {
                                    "message_id": details[key].id,
                                    "message_subject": details[key].message_subject,
                                    "message_body": details[key].message_body,
                                    "attachment_count": attch.length,
                                    "message_date": dateFormat(details[key].message_date, "yyyy-mm-dd HH:MM:ss"),
                                    "message_date_app": dateFormat(details[key].message_date, "isoDateTime"),
                                    "message_time": dateFormat(details[key].message_date, "HH:MM:ss"),
                                    "message_onlydate": dateFormat(details[key].message_date, "yyyy-mm-dd"),
                                    "attachments": attch,
                                    "display_name": details[key].receive,
                                    "draft_id": details[key].receiveId,
                                    "draftName": details[key].draftName,
                                    "display_id": details[key].draft_data,
                                    "message_isimportant": '',
                                    "message_isread": '',
                                    "images": '',
                                    "today_date": today,
                                    "displayTime":Date.parse(today) == Date.parse(dateFormat(details[key].message_date, "yyyy-mm-dd"))?'1':'0'
                                }
                        );
                     }
                 var draftSort = arraySort(draft, 'message_id', {reverse: true});
                 resolve(draftSort);
                });
            });
            
            Promise.all([promiseDraft]).then((result) => {
                return cb(null,  result[0]);
            });
            
    }
    

    Communication.getdraftrecord = (data, cb) => {

        if(data.user_type.toLowerCase() == 'parent'){
            data.user_id = undefined;
        }

        Communication.find(
                {
                    where: {  userId: data.user_id,
                              placeholder: 'Draft',
                              id: data.message_id,
                              schoolId:school_id_check,
                              studentuserId: data.student_user_id
                            //	message_date: { gte: dateFormat(data.from_date, "isoDateTime") },
                             //	message_date: { lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59") }
                            },
                    order: 'id',
                }, (err, res) => {

                  if(res.length == 0){
                    return cb(null, res);
                  }
                  var promise = [];
                  let finaldraft = [];
                  let resCount = res.length - 1;
                promise.push(new Promise(function(resolve, reject){
                res.forEach(function(allval,index){
                    Communication.getUserData(allval).then((finalRespo) => {
                      finaldraft.push(finalRespo)
                      if(resCount == index){
                        resolve(finaldraft)
                      }
                    });

                  })
                }))

                Promise.all(promise).then(function(response){
                    return cb(null, response);
                }).catch(function(error){
                    return cb(null, error);
                })


        });
    };
  Communication.getUserData = function(allval)
  {
   var promise1 = [];
   return new Promise(function(resolve, reject){
    var alluser = allval.draft_data.split(",");
    var allstuduser = allval.draft_student_id.split(",");
    var alldataobj = {};
    var alldataarr = [];
    alldataobj.id = allval.id;
    alldataobj.message_subject = allval.message_subject;
    alldataobj.message_body = allval.message_body;
    alldataobj.message_date = allval.message_date;
    alldataobj.draft_data = allval.draft_data;
    alldataobj.attachments = allval.attachments;
    if(allval.draft_data)
      {
        Communication.getUserName(alluser,allstuduser, allval.user_type).then((data) => {
           alldataobj.receive = data.draftName;
           alldataobj.receiveId = data.draftUserId;
           alldataobj.draftName = data.draftParentUserID;
           
           //alldataarr.push(alldataobj)
           resolve(alldataobj);

        });
      }else{
        alldataobj.receive = '';
        alldataobj.receiveId = '';
        alldataobj.draftName = '';
        resolve(alldataobj);

      }
   });

  }

  Communication.getUserName = function(userids, allstuduser, user_type)
  {
    let User = Communication.app.models.user;
    let tempArr = [];
    let dataObj = [];
    let draftUserID = [];
    let draftParentUserID = [];
    let finalObj = {};
    let useridsCount = userids.length - 1;
    return new Promise(function(resolve, reject){

    userids.forEach(function(userid,key){
       
        if(allstuduser[key] && allstuduser[key] != 0 && allstuduser[key] != "[]" && user_type.toLowerCase() != "parent"){
            userid = allstuduser[key];
        }
       
          User.getuserbyid(userid,function(err, resp){
              
            if(resp.user_type == 'Student'){
                if(allstuduser[key] && allstuduser[key] != 0 && allstuduser[key] != "[]"){
                    let studParet = resp.students().name + " (P)"
                    dataObj.push(studParet);
                    draftUserID.push(resp.students().userId);
                    draftParentUserID.push(studParet);
                }else{
                    dataObj.push(resp.students().name);
                    //draftUserID.push(resp.students().userId);
                }
                
            }else if(resp.user_type == 'Teacher'){
                dataObj.push(resp.user_belongs_to_staff().name);
                //draftUserID.push(resp.user_belongs_to_staff().userId);
            }else if(resp.user_type == 'Parent'){
                dataObj.push(resp.parents().father_name);
                //draftUserID.push(resp.parents().userId);
            }else if(resp.user_type == 'Other'){
                dataObj.push(resp.other_user_registration().name);
                //draftUserID.push(resp.other_user_registration());
            }else{
                dataObj.push(resp.user_name);
                //draftUserID.push(resp.id);
            }

            if(useridsCount == key){
                finalObj['draftName'] = dataObj;
                finalObj['draftUserId'] = draftUserID;
                finalObj['draftParentUserID'] = draftParentUserID;
             resolve(finalObj);
            }

          })

     });

    });


  }
  
 Communication.getsentmessage = (data, cb) => {
     
     var errorMessage = {};
    var successMessage = {};

     if(data.user_type)
        {
     if(data.user_type.toLowerCase() == 'parent'){
         data.user_id = undefined;
     } 
     if(!data.user_type.toLowerCase() == 'teacher'){
         data.school_id = undefined;
     }
    }
    else{
        data.user_id = undefined;
        data.school_id = undefined;
    }
    
    if(!data.search_id){
        data.search_id = [];
    }
    
    
     var whereRealtion = {};
      if(data.from_date && data.to_date ){
           whereRealtion.and = [
                    {userId: data.user_id},
                    {id:data.message_id},
                   { placeholder: 'message'},
                   {schoolId: data.school_id},
                   {studentuserId : data.student_user_id},
                    {message_date: { gte: dateFormat(data.from_date, "isoDateTime") }},
                    {message_date: { lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59") }}
                  ]; 
      }
                else{
                    whereRealtion.and = [
                    {userId: data.user_id},
                    {id:data.message_id},
                    { placeholder: 'message'},
                    {schoolId: data.school_id},
                    {studentuserId : data.student_user_id},
                    
                  ];
                }
     
     Communication.find({
         where:whereRealtion,
         include:[{
               relation: 'messages',
               scope: {
                   where: {
                       placeholder: {inq: ['Inbox', 'Archived']},
                   },
                
                    include:[
                        { relation:"users",
                            scope: {
                                include:[{
                                        relation: 'students',
                                        scope:{
                                            include:{
                                                relation: "studentbelongtoparent"
                                            }
                                        }
                                    }, {
                                        relation: 'staff'

                                    }, {
                                        relation: 'parents'

                                    },{
                                        relation: 'other_user_registration'

                                    }]
                            }
                        },{
                            relation: "user",
                            scope:{
                                include: {
                                    relation: 'students',
                                    scope:{
                                        include:{
                                            relation: "studentbelongtoparent"
                                        }
                                    }
                                }
                            }
                        }]
                
                
               }
         },{
           relation: "userbelong",
           scope:{
               include: {
                   relation: 'students',
                   scope:{
                       include:{
                           relation: "studentbelongtoparent"
                       }
                   }
               }
           }
       },{
           relation: "users",
           scope: {
               include: [{
                       relation: 'students',
                       scope:{
                           include:{
                               relation: "studentbelongtoparent"
                           }
                       }
                   }, {
                       relation: 'staff'
                   }, {
                       relation: 'parents'
                   },{
                       relation: 'other_user_registration'
                   }]
           }
       }]
     }, function(err, details){
         var sent = [];
         
         if(err){
            errorMessage.status = "201";
            errorMessage.message = "Error Occur";
            return cb(null, errorMessage, err);
         }
         
         if(details.length == 0){
            successMessage.status = '200';
            successMessage.message = "No data found.";
            return cb(null, successMessage,sent);
         }else{
             
             for(let key in details){
                 if(details[key].messages() && details[key].messages().length > 0){
                     
                     var attch = [];
                     var receiverName = [];
                     var receiverId = [];
                     var senderName = '';
                     var senderType = '';
                     var images = '';
                     
                     
                     if (details[key].attachments)
                        {
                            var DataUnserileRst = unserialize(details[key].attachments);
                            for (var keys in DataUnserileRst.__attr__)
                            {

                                attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[keys].val);
                            }

                        }
                    
                        senderType = details[key].user_type;
                        if(details[key].user_type.toLowerCase() == 'parent'){
                            senderName = details[key].userbelong().students().name + " (P)";
                        }else if(details[key].user_type.toLowerCase() == 'student'){
                            senderName = details[key].users().students().name;
                        }else if(details[key].user_type.toLowerCase() == 'teacher'){
                            senderName = details[key].users().staff().name;
                        }else if(details[key].user_type.toLowerCase() == 'other'){
                            senderName = details[key].users().other_user_registration().name;
                        }else if(details[key].user_type.toLowerCase() == 'school'){
                            senderName = details[key].users().user_name;
                        }else{
                            senderName = '';
                        }
                        
                        var userIdSearch = '';
                        
                        if(details[key].messages().length == 1){
                            
                            if(!details[key].messages()[0].user_type.toLowerCase() == 'parent'){
                                userIdSearch = details[key].messages()[0].users().id;
                            }
                            if(details[key].messages()[0].user_type.toLowerCase() == 'parent'){
                                userIdSearch = details[key].messages()[0].user().students().studentbelongtoparent().userId;
                                images = details[key].messages()[0].user().students().studentbelongtoparent().father_name;
                            }else if(details[key].messages()[0].user_type.toLowerCase() == 'student'){
                                images = details[key].messages()[0].users().students().student_photo;
                            }else if(details[key].messages()[0].user_type.toLowerCase() == 'teacher'){
                                images = details[key].messages()[0].users().staff().profie_image;
                            }else if(details[key].messages()[0].user_type.toLowerCase() == 'other'){
                                images = '';
                            }else if(details[key].messages()[0].user_type.toLowerCase() == 'school'){
                                images = '';
                            }
                        }
                        
                        for(var i in details[key].messages()){
                            if(details[key].messages()[i].user_type.toLowerCase() == 'parent'){
                                
                                receiverName.push(details[key].messages()[i].user().students().name+ " (P)");
                                receiverId.push(details[key].messages()[i].user().students().studentbelongtoparent().userId);
                            }else if(details[key].messages()[i].user_type.toLowerCase() == 'student'){
                                receiverName.push(details[key].messages()[i].users().students().name);
                                receiverId.push(details[key].messages()[i].users().students().userId);
                                
                            }else if(details[key].messages()[i].user_type.toLowerCase() == 'teacher'){
                                receiverName.push(details[key].messages()[i].users().staff().name);
                                receiverId.push(details[key].messages()[i].users().staff().userId);
                            }else if(details[key].messages()[i].user_type.toLowerCase() == 'other'){
                                receiverName.push(details[key].messages()[i].users().other_user_registration().name);
                                receiverId.push(details[key].messages()[i].users().other_user_registration().userId);
                                
                            }else if(details[key].messages()[i].user_type.toLowerCase() == 'school'){
                                receiverName.push(details[key].messages()[i].users().user_name);
                                receiverId.push(details[key].messages()[i].users().id);
                            }
                        }
                     
                     
                     
                     
                     if(data.search_id.length > 0){
                         let indexFlag = false;
                         for(let h in receiverId){
                             let index = data.search_id.indexOf(receiverId[h]);
                              if(index != -1){ 
                                  indexFlag = true;
                              }
                         }
                        if(indexFlag){ 
                          sent.push(
                          {
                              "user_id": details[key].userId,
                              "message_id": details[key].id,
                              "message_subject": details[key].message_subject,
                              "message_body": details[key].message_body,
                              "attachment_count": attch.length,
                              "message_date": dateFormat(details[key].message_date, "yyyy-mm-dd HH:MM:ss"),
                              "message_date_app": dateFormat(details[key].message_date, "isoDateTime"),
                              "message_time": dateFormat(details[key].message_date, "H:MM:ss"),
                              "message_onlydate": dateFormat(details[key].message_date, "yyyy-mm-dd"),
                              "attachments": attch,
                              "display_name": receiverName,
                              "display_id": receiverId,
                              "message_isimportant": '',
                              "message_isread": '',
                              "images": images,
                              "today_date": today,
                              "displayTime":Date.parse(today) == Date.parse(dateFormat(details[key].message_date, "yyyy-mm-dd"))?'1':'0',
                              "senderName": senderName,
                              "senderType":senderType
                          }
                        );
                              }
                        }else{ 
                            sent.push(
                                {
                                    "user_id": details[key].userId,
                                    "message_id": details[key].id,
                                    "message_subject": details[key].message_subject,
                                    "message_body": details[key].message_body,
                                    "attachment_count": attch.length,
                                    "message_date": dateFormat(details[key].message_date, "yyyy-mm-dd HH:MM:ss"),
                                    "message_date_app": dateFormat(details[key].message_date, "isoDateTime"),
                                    "message_time": dateFormat(details[key].message_date, "H:MM:ss"),
                                    "message_onlydate": dateFormat(details[key].message_date, "yyyy-mm-dd"),
                                    "attachments": attch,
                                    "display_name": receiverName,
                                    "display_id": receiverId,
                                    "message_isimportant": '',
                                    "message_isread": '',
                                    "images": images,
                                    "today_date": today,
                                    "displayTime":Date.parse(today) == Date.parse(dateFormat(details[key].message_date, "yyyy-mm-dd"))?'1':'0',
                                    "senderName": senderName,
                                    "senderType":senderType
                                }
                            );
                        }
                    }
                }
                successMessage.status = '200';
                successMessage.message = "Data fetched successfully";
                return cb(null, successMessage, sent);
            }
        });
 }


    Communication.getsentrecord = (data, cb) => {
      let relation = {};
         if(data.from_date){
             if(data.user_type.toLowerCase() == 'parent'){
                  relation.and = [
                    //{userId: data.user_id},
                    {placeholder: 'message'},
                    {schoolId:school_id_check},
                    {studentuserId: data.student_user_id},
                    {id: data.message_id},
                    {message_date: { gte: dateFormat(data.from_date, "isoDateTime") }},
                    {message_date: { lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59") }}
                  ];
             }else{
                  relation.and = [
                    {userId: data.user_id},
                    {placeholder: 'message'},
                    {schoolId:school_id_check},
                    {id: data.message_id},
                    {message_date: { gte: dateFormat(data.from_date, "isoDateTime") }},
                    {message_date: { lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59") }}
                  ];
             }
                 
        }else{
            if(data.user_type.toLowerCase() != 'parent'){
              relation.userId = data.user_id;
            }
              relation.placeholder = 'message';
              relation.id = data.message_id;
              relation.schoolId = school_id_check;
              relation.studentuserId = data.student_user_id;
        }

        Communication.find(
                {
                    //fields: [],
                    where: relation,
                    include: [{
                            relation: 'messages',
                            scope: {
                                where: {
                                    placeholder: {inq: ['Inbox', 'Archived']},
                                },
                                include: [{
                                    relation: 'users',
                                    scope: {
                                        //fields: ['user_name'],
                                        include: [{
                                                relation: 'students',
                                                scope: {
                                                    //fields: ['name','	student_photo']
                                                }
                                            }, {
                                                relation: 'staff',
                                                scope: {
                                                   // fields: ['name','	profile_image']
                                                }
                                            }, {
                                                relation: 'parents',
                                                scope: {
                                                    //fields: ['name']
                                                }
                                            },{
                                                relation: 'other_user_registration',
                                                scope: {
                                                    //fields: ['name']
                                                }
                                            }]
                                    }
                                },{
                                    relation: "user",
                                    scope:{
                                        include:{
                                            relation: 'students',
                                            scope:{
                                                include:{
                                                    relation: "studentbelongtoparent"
                                                }
                                            }
                                        }
                                    }
                                }]
                            }
                        }]
                }, function (err, res) {

            return cb(null, res)
        });
    };

    Communication.remoteMethod(
            'getdraftrecord',
            {
                http: {path: '/getdraftrecord', verb: 'post'},
                description: 'messages in draft',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Communication.remoteMethod(
            'getsentrecord',
            {
                http: {path: '/getsentrecord', verb: 'post'},
                description: 'messages in sent',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    
    Communication.remoteMethod(
            'getsentmessage',
            {
                http: {path: '/getsentmessage', verb: 'post'},
                description: 'messages in sent',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
            }
    );


    Communication.discard = (data, cb) => {
        let response_status = {};
        let successMessage = {};
        let messageObj = {};
        messageObj.id = data.message_id;
        messageObj.placeholder = 'Discard';

        Communication.upsert(messageObj, (err, message) => {

            if (err) {

                errorMessage.status = '201';
                errorMessage.message = "fail";
                return cb(null, errorMessage);
            } else {
                response_status.status = '200';
                response_status.message = "Message Discarded Successfully.";
                return cb(null, response_status);
            }

        });
    };




    Communication.remoteMethod(
            'compose',
            {

                accepts: [
                    {arg: 'ctx', type: 'object', http: {source: 'context'}},
                    {arg: 'options', type: 'object', http: {source: 'query'}},
                ],
                returns: {
                    arg: 'fileObject', type: 'object', root: true
                },
                http: {verb: 'post'}
            }
    );

    Communication.remoteMethod(
            'getallmessage',
            {
                http: {path: '/getallmessage', verb: 'get'},
                description: 'get all messages',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Communication.remoteMethod(
            'communication',
            {
                http: {path: '/communication', verb: 'post'},
                description: 'messages in inbox, sent, draft',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Communication.remoteMethod(
            'discard',
            {
                http: {path: '/discard', verb: 'post'},
                description: 'discard draft message',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    
    Communication.getcomposepopdata = (data, cb) => {
        let result = {};
        result.admin = [];
        result.assignClass = [];
        result.assignteachers = [];
        result.response_status = {
          "status": "200",
          "message": "Inforamtion Fetched Successfully."
        };
        
        let User = Communication.app.models.user;
        let User_Section = Communication.app.models.user_sections;
        
        let paramet = {user_type: ['School','Non_Teacher','Management'],schoolId:data.school_id};
        User.getuserbyusertype(paramet, (err, resdata) => {
           
            for (let i in resdata) {
              
                if(resdata[i].user_have_assign_schools().length>0){
                    if(resdata[i].id!=data.user_id){
                result.admin.push({
                    user_id: resdata[i].id,
                    name: resdata[i].staff().name +'('+resdata[i].role_name+')'
                });
            }}
            }

            var secIdArr = [];
            var secNameArr = [];
            var userId=data.user_id
            if(data.user_type=='School' ||data.user_type=='Non_Teacher'||data.user_type=='Management'){
                userId=undefined
            }
            let param = {user_id:userId, section_id: data.section_id,school_id: data.school_id, session_id: data.session_id};
            User_Section.getsectionbyuserid(param, (err, getsections) => { 
                if(getsections.length > 0){
                  for(let k in getsections){
                      secIdArr.push(getsections[k].section_id);
                      secNameArr.push(getsections[k].section_name);
                  }
       
                }
                if(data.user_type == "School"|| data.user_type=='Non_Teacher'||data.user_type=='Management' ){
                    let params = {
                        section_id: secIdArr,
                        user_type: 'Teacher',
                        session_id: data.session_id,
                        school_id: data.school_id,
                        flag: 1
                    }
                User_Section.getsectionteachers(params, (err, getdata) => {
                    if(getdata){
                        if(getdata.length>0){
                        for (let ind in getdata) {
                            result.assignteachers.push({
                                name: getdata[ind].name,
                                user_id: getdata[ind].user_id,
                                class_teacher: getdata[ind].class_teacher
                            });
                        }}
                        let params = {
                            section_id: secIdArr,
                            user_type: 'Student',
                            session_id: data.session_id,
                            school_id: data.school_id,
                            flag: 1
                        }
                        
                        User_Section.sectionbysectionid(params, (err, getdata) => {
                            
                            for(let k in secIdArr){
                                result.assignClass.push({
                                    section_id: secIdArr[k],
                                    section_name: secNameArr[k],
                                    assignStudent: []
                                });
                                
                                if(getdata.length > 0){
                                    for(let ind in getdata){
                                        if(secIdArr[k] == getdata[ind].sectionId){
                                            if(getdata[ind].users() && getdata[ind].users().students() && getdata[ind].users().students().studentbelongtoparent()){
                                                result.assignClass[k].assignStudent.push({
                                                    user_id: getdata[ind].users().id,
                                                    old_user_id: getdata[ind].users().old_user_id,
                                                    student_name: getdata[ind].users().students().name,
                                                    admission_no: getdata[ind].users().students().admission_no,
                                                    parent_userId: getdata[ind].users().students().studentbelongtoparent().userId
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                            
                            var finalObj = {};
                            finalObj.admin = result.admin;
                            finalObj.assignClass = Dedupe(result.assignClass, ['section_id']);
                            finalObj.assignteachers = Dedupe(result.assignteachers,['user_id']);
                            finalObj.response_status = result.response_status;
                            
                            var finalArr = [];
                            finalArr.push(finalObj)
                       
                            return cb(null, finalArr);
                        })

                    }})
                }
                if (data.user_type == "Student" || data.user_type == "Parent") {
                
                    let params = {
                            section_id: secIdArr,
                            user_type: 'Teacher',
                            session_id: data.session_id,
                            school_id: data.school_id,
                            flag: 1
                        }
                    User_Section.getsectionteachers(params, (err, getdata) => {
                        if(getdata.length > 0){
                            for (let ind in getdata) {
                                result.assignteachers.push({
                                    name: getdata[ind].name,
                                    user_id: getdata[ind].user_id,
                                    class_teacher: getdata[ind].class_teacher
                                });
                            }

                        }
                        
                        var finalObj = {};
                        
                        finalObj.admin = result.admin;
                        finalObj.assignClass = Dedupe(result.assignClass, ['section_id']);
                        finalObj.assignteachers = Dedupe(result.assignteachers,['user_id']);
                        finalObj.response_status = result.response_status;
                        
                        var finalArr = [];
                        finalArr.push(finalObj)
                      
                        return cb(null, finalArr);
                    });
                }
                
                if(data.user_type == "Teacher"){
                    
                    
                    let params = {
                        section_id: secIdArr,
                        user_type: 'Student',
                        session_id: data.session_id,
                        school_id: data.school_id,
                        flag: 1
                    }
                    
                    User_Section.sectionbysectionid(params, (err, getdata) => {
                        
                        for(let k in secIdArr){
                            result.assignClass.push({
                                section_id: secIdArr[k],
                                section_name: secNameArr[k],
                                assignStudent: []
                            });
                            
                            if(getdata.length > 0){
                                for(let ind in getdata){
                                    if(secIdArr[k] == getdata[ind].sectionId){
                                        if(getdata[ind].users() && getdata[ind].users().students() && getdata[ind].users().students().studentbelongtoparent()){
                                            result.assignClass[k].assignStudent.push({
                                                user_id: getdata[ind].users().id,
                                                old_user_id: getdata[ind].users().old_user_id,
                                                student_name: getdata[ind].users().students().name,
                                                admission_no: getdata[ind].users().students().admission_no,
                                                parent_userId: getdata[ind].users().students().studentbelongtoparent().userId
                                            })
                                        }
                                    }
                                }
                            }
                        }
                        
                        var finalObj = {};
                        finalObj.admin = result.admin;
                        finalObj.assignClass = Dedupe(result.assignClass, ['section_id']);
                        finalObj.assignteachers = Dedupe(result.assignteachers,['user_id']);
                        finalObj.response_status = result.response_status;
                        
                        var finalArr = [];
                        finalArr.push(finalObj)
                      
                        return cb(null, finalArr);
                    })
                }
                
            })
        });
        
    }
    



    Communication.remoteMethod(
            'getcomposepopdata',
            {
                http: {path: '/getcomposepopdata', verb: 'post'},
                description: 'get compose popup data',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Communication.getattachment = (data, cb) => {

        Communication.findOne(
                {
                    where: {id: data.message_id},
                    fields: ["attachments"]

                }, (err, res) => {

            return cb(null, res);

        });
    };

     Communication.remoteMethod(
            'getattachment',
            {
                http: {path: '/getattachment', verb: 'post'},
                description: 'get data',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Communication.countannouncement = type => {

       return new Promise((resolve, reject) => {
        if(!type) return;
        let announcements = Communication.app.models.announcement;
        announcements.find({
            fields: ["type", "id", "created_date"],
            where: {"type": type}
        }, (err, res) => {
            if(err) throw err;
            if(res){
                let today = 0, current_month = 0, last_month = 0, till_date = 0;
                let todayobj = new Date();
                let todayDate = Communication.getisoDate(todayobj);
               

                res.forEach( value => {
                    if(todayDate == Communication.getisoDate(value.created_date))
                       today += 1;
                    if(value.created_date.getMonth()+1 == todayobj.getMonth())
                       last_month += 1; 
                    till_date += 1;     
                })

                let objct = {
                    "today": today,
                    "last_month": last_month,
                    "till_date": till_date
                } 

                resolve(objct);
            }
        })
        })
    }

    Communication.countmessage = (data, cb) => {
        let response = {};
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        if(!data.placeholder) return cb(null, {status: "201", message: "placeholder cannot be blank"});

        Communication.find({
            fields: ["id", "message_date"],
            where: {"status": "Active", "placeholder": data.placeholder}
        }, (err, res) => {
            if(err) throw err;
            if(res){ 
                let today = 0, till_date = 0, current_month = 0, last_month = 0, notice = {}, circular = {};
                let todayobj = new Date(), promise = [];
                let todayDate = Communication.getisoDate(todayobj);
                promise.push(Communication.countannouncement("Notice"));
                promise.push(Communication.countannouncement("Circular"));

                Promise.all(promise).then( result => {
                   notice = result[0];
                   circular = result[1];

                Communication.getsentmessage(data, function(errSent, sentStatus,getSent){
                    if(errSent) {
                        console.error("The error occured", errSent);
                        return;
                    }
                    getSent.forEach( value => {
                        if(todayDate == Communication.getisoDate(value.message_date))
                           today += 1;
                        if(new Date(value.message_date).getMonth() == todayobj.getMonth()-1)
                           last_month += 1; 
                           
                        till_date += 1;  
                    })

                response = { 
                            "message": {
                                "today": today,
                                "last_month": last_month,
                                "till_date": till_date
                            },
                            "notice": notice,
                            "circular": circular 
                        }
                cb(null, {status: "200", message: "Information fetched successfully"}, response);
            })
            })  
            }
        })
    }

    Communication.remoteMethod(
        'countmessage',
        {
            http: {path: '/countmessage', verb: 'post'},
            description: 'get message count',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    Communication.communicationall = function(req,cb)
    {
        var errorMessage = {};
        var successMessage = {};
        Communication.getsentmessage(req,function(err,responsemsg, responsedata){ 
            if(err)
                {
                   errorMessage.status = "201" ;
                   errorMessage.message = "Error Occurred";
                   return cb(null,errorMessage);
                }
                successMessage.status = "200" ;
                successMessage.message = "Information Fetched Successfully";
                var Announcement = Communication.app.models.announcement;
                Announcement.allannouncement(req,function(err,announcedata){
                     if(err)
                    {
                    errorMessage.status = "201" ;
                    errorMessage.message = "Error Occurred";
                    return cb(null,errorMessage);
                    }
                    var messagearr = [];
                    var noticearr = [];
                    var circulararr = [];
                    if(responsedata.length>0)
                        {
                            for(let key in responsedata)
                                {
                                  messagearr.push(responsedata[key])  ;
                                }
                        }
                          
                    
                if(announcedata.length==0)
                    {
                       var response = {message:messagearr,notice:noticearr,circular:circulararr}  
                    }
                    else
                        {
                           for(let key in announcedata) 
                            {
                                if(announcedata[key].type.toLowerCase()=="notice")
                                    {
                                     var noticeobj = {
                                                     
                                                      senderName:announcedata[key].createdBy().user_name,
                                                      sentOn:dateFormat(announcedata[key].created_date, "yyyy-mm-dd"),
                                                      subject:announcedata[key].title,
                                                      id:announcedata[key].id,
                                                      message:announcedata[key].description
                                                    };
                                                    noticearr.push(noticeobj);

                                    }
                                    if(announcedata[key].type.toLowerCase()=="circular")
                                    {
                                        var circularobj = {
                                                     
                                                      senderName:announcedata[key].createdBy().user_name,
                                                      sentOn:dateFormat(announcedata[key].created_date, "yyyy-mm-dd"),
                                                      subject:announcedata[key].title,
                                                      id:announcedata[key].id,
                                                      message:announcedata[key].description
                                                    };
                                                    circulararr.push(circularobj);

                                    }
                                        
                                    }
                            }
                            var noticearrrev = arraySort(noticearr, 'id', {reverse: true});
                            var circulararrrev = arraySort(circulararr, 'id', {reverse: true});
                            var messagearrrev = arraySort(messagearr, 'message_id', {reverse: true});
                                 var response = {message:messagearrrev,notice:noticearrrev,circular:circulararrrev} ;
                                  return cb(null,successMessage,response); 
                        })
                })
                
               

        }

        Communication.communicationdetail = function(req,cb)
          {
        var errorMessage = {};
        var successMessage = {};
        if(!req.type)
            {
              errorMessage.status = "201" ;
              errorMessage.message = "Type can't be blank";
              return cb(null,errorMessage);   
            }
            if(!req.id)
            {
              errorMessage.status = "201" ;
              errorMessage.message = "Id can't be blank";
              return cb(null,errorMessage);   
            }
            if(req.type.toLowerCase()=='message')
                {
                    let reqparam = {message_id:req.id};
                    Communication.getsentmessage(reqparam,function(err,remsg, responsedata){
            if(err)
                {
                   errorMessage.status = "201" ;
                   errorMessage.message = "Error Occurred";
                   return cb(null,errorMessage);
                }
                successMessage.status = "200" ;
                successMessage.message = "Information Fetched Successfully";
                if(responsedata.length>0)
                        {
                            return cb(null,successMessage,responsedata[0]); 
                        }
                        return cb(null,successMessage,[]); 
                    })
                }
                if(req.type.toLowerCase()=='announcement')
                {
                    let reqparam = {id:req.id};
                    var Announcement = Communication.app.models.announcement;
                    Announcement.allannouncement(reqparam,function(err,announcedata){
                     if(err)
                    {
                    errorMessage.status = "201" ;
                    errorMessage.message = "Error Occurred";
                    return cb(null,errorMessage);
                    }
                    successMessage.status = "200" ;
                    successMessage.message = "Information Fetched Successfully";
                    if(announcedata.length>0)
                        {
                             var announceobj = {
                                        
                                        senderName:announcedata[0].createdBy().user_name,
                                        sentOn:dateFormat(announcedata[0].created_date, "yyyy-mm-dd"),
                                        subject:announcedata[0].title,
                                        attachment:announcedata[0].attachments?constantval.PROJECT_NAME +announcedata[0].attachments:'',
                                        message:announcedata[0].description
                                                    };
                            return cb(null,successMessage,announceobj); 
                        }
                        return cb(null,successMessage,[]);
                })
    
        }
          }
     Communication.remoteMethod(
        'communicationall',
        {
            http: {path: '/communicationall', verb: 'post'},
            description: 'get all communication',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );
     Communication.remoteMethod(
        'communicationdetail',
        {
            http: {path: '/communicationdetail', verb: 'post'},
            description: 'get  communication detail',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );

    Communication.commgraph = (data, cb) => {
        let response = {};
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.placeholder) return cb(null, {status: "201", message: "placeholder cannot be blank"});
        else if(!data.from_date) return cb(null, {status: "201", message: "From date cannot be blank"});
        else if(!data.to_date) return cb(null, {status: "201", message: "To date cannot be blank"});

        Communication.find({
            fields: ["id", "message_date"],
            where: {
                    and: [
                        {"status": "Active"},
                        {"placeholder": data.placeholder},
                        {message_date: {gte: dateFormat(data.from_date, "isoDate")}},
                        {message_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                    ]
            }
        }, (err, res) => {
            if(err) throw err;
            if(res){ 
                let countmessage = 0, countnotice = 0, countcircular = 0;
                let data_circular = {
                    from_date: data.from_date,
                    to_date: data.to_date,
                    type: "Circular"
                };
                let data_notice = {
                    from_date: data.from_date,
                    to_date: data.to_date,
                    type: "Notice"
                };

                let promise = [], circularresp = [], noticeresp = [], noticearr = [], circulararr = [], messagearr = [];

                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                    ];
                
                let toDate = new Date(new Date(data.to_date).setDate(new Date(data.to_date).getDate() + 1)); 
                let fromDate = new Date(data.from_date);
                let nextDate =  fromDate;

                do{
                    messagearr.push({"fullDate": nextDate.getFullYear() + "-" + (nextDate.getMonth()+1) + "-" +nextDate.getDate(), "day": nextDate.getDate(), "date": nextDate.getDate() + " " + monthNames[nextDate.getMonth()], messagecount: 0});
                    circulararr.push({"fullDate": nextDate.getFullYear() + "-" + (nextDate.getMonth()+1) + "-" +nextDate.getDate(), "date": nextDate.getDate() + " " + monthNames[nextDate.getMonth()], circularcount: 0});
                    noticearr.push({"fullDate": nextDate.getFullYear() + "-" + (nextDate.getMonth()+1) + "-" +nextDate.getDate(), "date": nextDate.getDate() + " " + monthNames[nextDate.getMonth()], noticecount: 0});
                    nextDate=new Date(fromDate.setDate(fromDate.getDate() + 1));
                }while(!(nextDate.getTime() === toDate.getTime()));


                promise.push(Communication.countannouncementgraph(data_circular, circularresp));
                promise.push(Communication.countannouncementgraph(data_notice, noticeresp));
                let formattedDate;
                Promise.all(promise).then( data => { 
                    Communication.getsentmessage(data, function(errSent, sentStatus,getSent){
                        if(errSent) {
                            console.error("The error occured", errSent);
                            return;
                        }
                        getSent.forEach( val => {
                            countmessage = getSent.filter(obj => Communication.getisoDate(obj.message_date) === Communication.getisoDate(val.message_date)).length;
                            formattedDate = new Date(val.message_date).getDate() + " " + monthNames[new Date(val.message_date).getMonth()];
                            messagearr.filter(obj => {
                                if(obj.date === formattedDate){
                                    obj.messagecount = countmessage;
                                }
                            }); 
                        })
                   
                    if(noticeresp[0].length > 0){ 
                        noticeresp[0].forEach(val => { 
                            countnotice = noticeresp[0].filter(obj => Communication.getisoDate(obj.created_date) === Communication.getisoDate(val.created_date)).length;
                            
                            formattedDate = new Date(val.created_date).getDate() + " " + monthNames[val.created_date.getMonth()];
                            noticearr.filter(obj => {
                                if(obj.date === formattedDate){
                                    obj.noticecount = countnotice;
                                }
                            });    
                        })
                    }
                    if(circularresp[0].length > 0){
                        circularresp[0].forEach(val => {
                            countcircular = circularresp[0].filter(obj => Communication.getisoDate(obj.created_date) === Communication.getisoDate(val.created_date)).length;
                            formattedDate = new Date(val.created_date).getDate() + " " + monthNames[val.created_date.getMonth()];
                            circulararr.filter(obj => {
                                if(obj.date === formattedDate){
                                    obj.circularcount = countcircular;
                                }
                            });
                        })
                    }
                        return cb(null, {"message": Dedupe(messagearr, ['date']), "notice": Dedupe(noticearr, ['date']), "circular": Dedupe(circulararr, ['date'])});
                    })
                });
            }
        })
    }

    Communication.remoteMethod(
        'commgraph',
        {
            http: {path: '/commgraph', verb: 'post'},
            description: 'get message count',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Communication.countannouncementgraph = (data, resp) => {
        return new Promise((resolve, reject) => {
         if(!data.type) return;
         let announcements = Communication.app.models.announcement;
         announcements.find({
             fields: ["created_date", "id"],
             where: {
                and: [
                    {"type": data.type},
                    {created_date: {gte: dateFormat(data.from_date, "isoDate")}},
                    {created_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            }
         }, (err, res) => {
             if(err) reject(err);
             if(res) {
                resp.push(res);
                resolve('success');
             }
         })
         })
     }

    Communication.isValidDate = d => {
        return d instanceof Date && !isNaN(d);
    } 

    Communication.getisoDate = dateobj => {
        if(!Communication.isValidDate(dateobj)){
            dateobj = new Date(dateobj);
        }
        var dd = dateobj.getDate();
        var mm = dateobj.getMonth()+1; 
        var yyyy = dateobj.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        } 

        return yyyy + '-' + mm + '-' + dd;
    }

    Communication.viewprofile = (data, cb) => {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.user_type) return cb(null, {status: "201", message: "UserType cannot be blank"});
        else if(!data.school_id) return cb(null, {status: "201", message: "School Id cannot be blank"});
        else if(!data.user_id) return cb(null, {status: "201", message: "User Id cannot be blank"});
        let res = [], promises = [];
        if(data.user_type.toLowerCase() == 'teacher'){
            let staff = Communication.app.models.staff;
            promises.push(Communication.staffpromise(data, staff)); 
        }
        else if(data.user_type.toLowerCase() == 'student'){
            let student = Communication.app.models.student;
            promises.push(Communication.studentpromise(data, student)); 
        }
        else if(data.user_type.toLowerCase() == 'parent'){
            let parent = Communication.app.models.parent;
            promises.push(Communication.parentpromise(data, parent)); 
        }
        else if(data.user_type.toLowerCase() == 'school'){
            let school = Communication.app.models.school;
            promises.push(Communication.schoolpromise(data, school)); 
        }

        Promise.all(promises).then( data => { 
            return cb(null, {status: "200", message: "Information fetched successfully"}, data);
        }).catch( err => { return cb(null, {status: "201", message: "some error"}, err) } );

    }

    Communication.getPathPrefix = (uri) => {
        if(!uri) return;
        return constantval.LOCAL_URL + "/"+ constantval.PROJECT_NAME + "/" + uri
    }

    Communication.staffpromise = (data, staff) => {
        return new Promise((resolve, reject) => {
            staff.staffprofile(data, (err, msg, response) => {
                if(err) reject(err);
                
                if(response) {  
                    let resp = [], respo = [];
                    if(response.user_belongs_to_staff()){ 
                        let staffinfo = response.user_belongs_to_staff();
                        respo.push({key: "photo", value: (staffinfo.profile_image) ? Communication.getPathPrefix(staffinfo.profile_image): ''})
                        respo.push({key: "Name", value: (staffinfo.name) ? staffinfo.name: '-'})
                        respo.push({key: "Employee ID", value: (staffinfo.staff_code) ? staffinfo.staff_code: '-'})
                        respo.push({key: "Designation", value: (staffinfo.designation) ? staffinfo.designation: '-'})
                        respo.push({key: "Email ID", value: (staffinfo.email) ? staffinfo.email: '-'})
                        respo.push({key: "Contact No", value: (staffinfo.mobile) ? staffinfo.mobile: '-'})

                        resp.push({key: "Date of Joining", value: Communication.getisoDate(staffinfo.date_of_join)})
                        if(response.user_have_multiple_section()){
                            let temparr = [], class_teacher_flag = '', classTeacherArr = [];
                            for(var key in response.user_have_multiple_section()){
                                classTeacherArr.push(response.user_have_multiple_section()[key].class_teacher.toLowerCase())    
                                if(response.user_have_multiple_section()[key].assigned_sections())
                                    temparr.push(response.user_have_multiple_section()[key].assigned_sections().section_name) 
                            }
                            if(temparr.length >0){
                                let section_name = '',res_section_name = '';
                                for(var pos in temparr){ 
                                    res_section_name = temparr[pos]
                                    if(res_section_name && pos>0)
                                        section_name = section_name + ", " + res_section_name
                                    else 
                                        section_name = res_section_name    
                                } 
                                resp.push({key: "Class & Section", value: section_name})
                            }
                            else
                                resp.push({key: "Class & Section", value: '-'}) 
                            class_teacher_flag = classTeacherArr.indexOf("yes")>=0 ? "Yes" : "No";
                            if(class_teacher_flag)
                                resp.push({key: "Class Teacher", value: class_teacher_flag})
                            else
                                resp.push({key: "Class Teacher", value: '-'})        
                        }
                        if(response.user_have_subjects()){
                            let res_subject_name = '', subject_name = '', repeated = [];
                            for(var pos in response.user_have_subjects()){
                                res_subject_name = response.user_have_subjects()[pos].subject_name
                                if(res_subject_name && pos>0 && repeated.indexOf(res_subject_name) == -1)
                                    subject_name = subject_name + ", " + res_subject_name
                                else if(pos == 0)
                                    subject_name = res_subject_name
                                repeated.push(res_subject_name);    
                            }  
                            resp.push({key: "Subjects Assigned", value: subject_name})    
                        }else{
                            resp.push({key: "Subjects Assigned", value: 'NA'})
                        }
                        
                        resp.push({key: "Additional Duties Assigned", value: 'NA'})
                        resp.push({key: "Bank Account Number", value: (staffinfo.bank_acc_no) ? staffinfo.bank_acc_no : '-'})
                        resp.push({key: "Blood Group", value: 'NA'})
                        resp.push({key: "Special Allergies", value: 'NA'})
                    }
                    
                    resolve({first: respo, second: resp});
                }
            });
        });
    }

    Communication.studentpromise = (data, student) => {
        return new Promise((resolve, reject) => {
            student.studentprofile(data, (err, msg, response) => { 
                if(err) reject(err);
                if(response) {
                    let info = response, resp = [], respo = [];
                  
                    respo.push({key: "photo", value: (info.student_photo)? Communication.getPathPrefix(info.student_photo): ''})
                    respo.push({key: "Name", value: (info.name)? info.name: '-'})
                    respo.push({key: "Employee ID", value: (info.admission_no)? info.admission_no: '-'})
                    respo.push({key: "emergency Contact", value: (info.emergency_number)? info.emergency_number: '-'  }) 

                    resp.push({key: "Date of Admission", value: (Communication.getisoDate(info.dateofadmission)) ? Communication.getisoDate(info.dateofadmission) : '-' })
                    resp.push({key: "Guardian Name", value: (info.guardian_name) ? info.guardian_name: '-'})
                    resp.push({key: "Guardian Address", value: (info.guardian_address) ? info.guardian_address: '-'})
                    respo.push({key: "Guardian Contact", value: (info.guardian_contact) ? info.guardian_contact: '-' })
                    resolve({first: respo, second: resp});
                };
            });
        });
    }

    Communication.parentpromise = (data, parent) => { 
        
        return new Promise((resolve, reject) => {
            parent.parentprofile(data, (err, msg, response) => { 
                if(err) reject(err);
                let resp = [], respo = []
                if(response && msg.status_code == '200') {
                    let info = response[0];
                    respo.push({key: "photo", value: (info.father_photo) ? Communication.getPathPrefix(info.father_photo): ''})
                    respo.push({key: "Father Name", value: (info.father_name) ? info.father_name : '-'})
                    respo.push({key: "Father Contact", value: (info.father_contact) ? info.father_contact : '-'})
                    respo.push({key: "Mother Name", value: (info.mother_name) ? info.mother_name : '-'})
                    respo.push({key: "Mother Contact", value: (info.mother_contact) ? info.mother_contact : '-'})
                    respo.push({key: "Emergency Contact", value: (info.father_name) ? info.father_name : '-'}) 

                    resp.push({key: "Father Email", value: (info.father_email) ? info.father_email : '-'})
                    resp.push({key: "Mother Email", value: (info.mother_email) ? info.mother_email : '-'})
                    resp.push({key: "Father Occupation", value: (info.father_occupation) ? info.father_occupation : '-'})
                    resp.push({key: "Mother Occupation", value: (info.mother_occupation) ? info.mother_occupation : '-'})
                    resolve({first: respo, second: resp});
                }else{
                    respo.push({key: "photo", value: ''})
                    respo.push({key: "Father Name", value: '-'})
                    respo.push({key: "Father Contact", value: '-'})
                    respo.push({key: "Mother Name", value: '-'})
                    respo.push({key: "Mother Contact", value: '-'})
                    respo.push({key: "Emergency Contact", value: '-'}) 

                    resp.push({key: "Father Email", value: '-'})
                    resp.push({key: "Mother Email", value: '-'})
                    resp.push({key: "Father Occupation", value: '-'})
                    resp.push({key: "Mother Occupation", value: '-'})
                    resolve({first: respo, second: resp});
                }
            });
        });
    }

    Communication.schoolpromise = (data, school) => {
        return new Promise((resolve, reject) => {
            school.schoolprofile(data, (err, response) => { 
                if(err) reject(err);
                if(response) {
                    let info = response, resp = [], respo = [];
                    respo.push({key: "photo", value: ''})
                    respo.push({key: "School Name", value: (info.school_name) ? info.school_name : '-'})
                    resp.push({key: "School address", value: (info.school_address) ? info.school_address : '-'})
                    resp.push({key: "School Pin", value: (info.school_pin) ? info.school_pin : '-'})
                    
                    resolve({first: respo, second: resp});
                };
            });
        });
    }

    Communication.remoteMethod(
        'viewprofile',
        {
            http: {path: '/viewprofile', verb: 'post'},
            description: 'View profile information by user type and user id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );


};
