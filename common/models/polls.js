'use strict';
var dateFormat = require('dateformat');
var serialize = require("php-serialization").serialize;
var Class = require("php-serialization").Class;
var unserialize = require("php-serialization").unserialize;

module.exports = function(Polls) {
    
    var errorMessage = {};
    var successMessage = {};
    
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = yyyy + '-' + mm + '-' + dd;
    
    
    Polls.createpoll = function (data, cb) { 
        
        if (!data){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Request cannot be empty";
            return cb(null, errorMessage);
        }
        if (!data.poll_title){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Poll name cannot be empty";
            return cb(null, errorMessage);
        }
        if (!data.user_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "User id cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.token){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Token cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.school_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "School id cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.class_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Class id cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.section_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Section id cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.subject_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Subject id cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.poll_duration){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Poll duration cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.poll_question){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Poll question cannot be empty";
            return cb(null, errorMessage);
        }
        if(data.placeholder == 'shared' && data.group_id.length==0 && data.class_section.length==0){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Group array and class section array cannot be empty";
            return cb(null, errorMessage);
        }
        
        if(data.placeholder != 'shared' && data.placeholder != 'save'){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Data placeholder should be shared or save";
            return cb(null, errorMessage);
        }
        
        if(!data.poll_type){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Poll  cannot be empty";
            return cb(null, errorMessage);
        }
        
        if(data.poll_type != "mcq" && data.poll_type != "tf" && data.poll_type != "descriptive"){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Poll type should be mcq or tf or descriptive.";
            return cb(null, errorMessage);
        }
        
        
        var total_answer= 0;
        if(data.poll_type.toLowerCase() == "mcq"){ 
            total_answer = data.poll_answer.length;
        }else if(data.poll_type.toLowerCase() == "tf"){
            total_answer = 2;
        }else{
            total_answer = 1;
        }
        
        var answers = "";
        var c = new Class();
        if(data.poll_answer.length > 0){
            for (var m = 0; m < data.poll_answer.length; m++) {
                    c.__addAttr__(m, "integer", data.poll_answer[m], "string");
                }
                
                if (data.poll_answer.length > 0){
                    answers = serialize(c, "array");
                }
        }
        
        
        var placeHolder = 'save';
        var channel = '';
        if(data.placeholder.toLowerCase() == 'shared'){
            var c = new Class();
            placeHolder = 'shared';
            var channelId = '';
            
            if(data.group_id.length > 0){
                channel = "group";
                for (var m = 0; m < data.group_id.length; m++) {
                    c.__addAttr__(m, "integer", data.group_id[m], "string");
                }
                
                if (data.group_id.length > 0){
                    channelId = serialize(c, "array");
                }
                
            }else{
                channel = "classsection";
                for (var m = 0; m < data.class_section.length; m++) {
                    c.__addAttr__(m, "integer", data.class_section[m], "string");
                }
                
                if (data.class_section.length > 0){
                    channelId = serialize(c, "array");
                }
            }
        }
        
        
        var createParam = {
            poll_title: data.poll_title,
            poll_question: data.poll_question,
            question_type: data.poll_type,
            total_answer: total_answer,
            duration: data.poll_duration,
            poll_status: 'Active',
            schoolId: data.school_id,
            userId: data.user_id,
            placeholder: placeHolder,
            answers: answers,
            correct_answer: data.correct_answer,
            classId: data.class_id,
            sectionId: data.section_id,
            subjectId: data.subject_id,
            sessionId: data.session_id,
            channel: channel,
            channel_id: channelId,
            modified_date: dateFormat(new Date(), "yyyy-mm-dd H:MM:ss"),
            created_date: dateFormat(new Date(), "yyyy-mm-dd H:MM:ss"),
            data: data
        }
        
        
        if(data.poll_id){
            var now = new Date();
            createParam['id'] = data.poll_id;
            createParam['modified_date'] = dateFormat(new Date(), "yyyy-mm-dd H:MM:ss");
        }
        
        var getParam = {
            user_id: data.user_id,
            school_id: data.school_id,
            token: data.token,
            class_id:data.class_id,
            section_id:data.section_id,
            subject_id:data.subject_id
        }
        
        var createPollFlag = true; 
        
        Polls.mypolls(getParam, function(mypollErr, mypollRes, mypollData){
            if(mypollErr){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error";
                return cb(null, errorMessage, err);
            }
            
            if(mypollData.length > 0){
                for(var i in mypollData){
                    if(mypollData[i].shared_status == 'Running'){
                        createPollFlag = false;
                    }
                }
            }
            
            if(createPollFlag){
                Polls.upsert(createParam, function(err, res){
                if(err){
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Error";
                    return cb(null, errorMessage, err);
                }

                if(data.placeholder.toLowerCase() == 'shared'){
                    var pollAssignParam = {
                        poll_id: res.id,
                        group_id: data.group_id,
                        class_section: data.class_section,
                        channel: channel,
                        subject_id: data.subject_id,
                        user_id: data.user_id,
                        session_id: data.session_id,
                    }
                    Polls.createuserpoll(pollAssignParam, function(error, response){
                        if(response.responseCode == "200"){
                            successMessage.responseCode = "200";
                            successMessage.responseMessage = "Created successfully";
                            return cb(null, successMessage);
                        }else if(response.responseCode == "202"){

                            Polls.destroyById(response.id, function(desErr, desRes){
                                errorMessage.responseCode = "201";
                                errorMessage.responseMessage = "No group exist.";
                                return cb(null, errorMessage);
                            });

                        }else if(response.responseCode == "203"){
                            Polls.destroyById(response.id, function(desErr, desRes){
                                errorMessage.responseCode = "201";
                                errorMessage.responseMessage = "No student in this class section.";
                                return cb(null, errorMessage);
                            });
                        }else{
                            Polls.destroyById(response.id, function(desErr, desRes){
                                errorMessage.responseCode = "201";
                                errorMessage.responseMessage = "Some error occurs.";
                                return cb(null, errorMessage);
                            });


                        }


                    });
                }else{
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Created successfully";
                    return cb(null, successMessage);
                }

            });
            }else{
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Poll is already running.";
                return cb(null, errorMessage);
            }
        })

    }
    
    
    Polls.createuserpoll = function(data, cb){
        var pollUsersObj = Polls.app.models.poll_users;
        var userArray = [];
        var notificationarr = [];
        if(data.channel == 'group'){
            var groupObj = Polls.app.models.groups;
            
            groupObj.find({
                where: {id : {inq: data.group_id}},
                include: {
                    relation: 'group_users'
                }
            }, function(err, groupData){
                
                if(err){
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Error Occur";
                    return cb(null, errorMessage, err);
                }
                if(groupData.length > 0){
                    for(var i in groupData){
                        if(groupData[i].group_users && groupData[i].group_users.length > 0){
                            var userGroup = groupData[i].group_users();
                            for(var k in userGroup){
                                userArray.push(userGroup[k].userId)
                                var pollUserParam = {
                                    pollId: data.poll_id,
                                    userId: userGroup[k].userId,
                                    channel: data.channel,
                                    channelId: userGroup[k].groupsId
                                };
                                
                                var notificationobj = {};
                                
                                notificationobj.user_id = userGroup[k].userId;
                                notificationobj.module_key_id = data.poll_id;
                                notificationobj.type = 11;
                                notificationobj.title = "Poll Assigned";
                                notificationobj.notification_text = "";
                                notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                                notificationarr.push(notificationobj);
                                
                                
                                pollUsersObj.create(pollUserParam, function(pollUserError, pollUserRes){
                                    
                                    
                                });
                            }
                        }
                    }
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Created successfully";
                    if (notificationarr.length > 0) {
                        var Notification = Polls.app.models.notification;
                        Notification.sendnotification(notificationarr);   
                    }
                    return cb(null, successMessage, notificationarr);
                }else{
                    successMessage.responseCode = "202";
                    successMessage.responseMessage = "No data";
                    return cb(null, successMessage, pollUserRes);
                }
                
            });
        }else{
            var userSubjectObj = Polls.app.models.user_subject;
            var userSubParam = {
                sectionId: data.class_section,
                user_type: "Student",
                sessionId: data.session_id,
                subjectId: data.subject_id
            }
            userSubjectObj.subjectusers(userSubParam, function(userSubError, userSubResponse){
                if(userSubError){
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Error Occur";
                    return cb(null, errorMessage, userSubError);
                }
                if(userSubResponse.length > 0){
                    for(var k in userSubResponse){
                        userArray.push(userSubResponse[k].userId)
                        var pollUserParam = {
                            pollId: data.poll_id,
                            userId: userSubResponse[k].userId,
                            channel: data.channel,
                            channelId: userSubResponse[k].sectionId
                        };
                        var notificationobj = {};
                                
                        notificationobj.user_id = userSubResponse[k].userId;
                        notificationobj.module_key_id = data.poll_id;
                        notificationobj.type = 11;
                        notificationobj.title = "Poll Assigned";
                        notificationobj.notification_text = "";
                        notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                        notificationarr.push(notificationobj);
                                
                        pollUsersObj.create(pollUserParam, function(pollUserError, pollUserRes){
                            
                        });
                    }
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Created successfully";
                    if (notificationarr.length > 0) {
                        var Notification = Polls.app.models.notification;
                        Notification.sendnotification(notificationarr);   
                    }
                    return cb(null, successMessage);
                }else{
                    successMessage.responseCode = "203";
                    successMessage.responseMessage = "No data";
                    return cb(null, successMessage, pollUserRes);
                }
            });
        }
    }
    
    
    
    Polls.remoteMethod(
        "createpoll",
        {
            http: {path:'/createpoll', verb: 'post'},
            description: 'create poll',
            accepts: {arg:"data", type:"object", http: {source: "body"} },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

    
    Polls.stoppoll= function(data, cb){
        
        if(!data.token){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Token cannot be empty";
            return cb(null, errorMessage);
        }
        
        if(!data.poll_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Poll id cannot be empty";
            return cb(null, errorMessage);
        }
        
        Polls.upsertWithWhere({id : data.poll_id} , {poll_status: "Inactive"}, function(err, updatedUser){
            
            if(err){
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Error Occur";
                    return cb(null, errorMessage, err);
            }
            
            Polls.findById(data.poll_id,{
                include:{
                    relation: "user_polls",
                }
            }, function(error, res){
                if(error){
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Error Occur";
                    return cb(null, errorMessage, err);
                }
                 var notificationarr = [];
                 
                 
                if(res && res.user_polls()){
                    for(var i in res.user_polls()){
                        var notificationobj = {};
                                
                        notificationobj.user_id = res.user_polls()[i].userId;
                        notificationobj.module_key_id = data.poll_id;
                        notificationobj.type = 13;
                        notificationobj.title = "Poll stops";
                        notificationobj.notification_text = "";
                        notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                        notificationarr.push(notificationobj);
                    }
                }
                if (notificationarr.length > 0) {
                        var Notification = Polls.app.models.notification;
                        Notification.sendnotification(notificationarr);   
                }
                
                
                successMessage.responseCode = "200";
                successMessage.responseMessage = "Poll is stopped";

                var result = {
                    poll_id : data.poll_id
                }
                return cb(null, successMessage, result);
                
                
            })
            
            
            
        });
    }
    
    Polls.remoteMethod(
        "stoppoll",
        {
            http: {path:'/stoppoll', verb: 'post'},
            description: 'stop poll',
            accepts: {arg:"data", type:"object", http: {source: "body"} },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    
    
    Polls.mypolls = function(data, cb){
        
        if(!data.school_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "School id cannot be empty";
            return cb(null, errorMessage);
        }
        
        if(!data.user_id){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "User id cannot be empty";
            return cb(null, errorMessage);
        }
        
        if(!data.token){
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Token cannot be empty";
            return cb(null, errorMessage);
        }
        if(!data.class_id){
            data.class_id = undefined;
        }
        if(!data.section_id){
            data.section_id = undefined;
        }
        if(!data.subject_id){
            data.subject_id = undefined;
        }
        if(!data.from_date){
            data.from_date = undefined;
        }
        if(!data.to_date){
            data.to_date = undefined;
        }
        if(!data.poll_id){
            data.poll_id = undefined;
        }
        
        
        var userObj = Polls.app.models.user;
        
        userObj.findById(data.user_id,function(err, userRes){
            if(userRes.user_type.toLowerCase() == "student"){
                var studParam = {
                    user_id: data.user_id,
                    school_id: data.school_id,
                    session_id: data.sessionId
                }
                
                Polls.receiverpoll(studParam, function(err, studata){
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Record fetch successfully";
                    return cb(null, successMessage, studata);
                })
            }else{
                var condition = {};
        if(data.from_date){
            condition.and = [
                    { userId: data.user_id}, 
                    {schoolId: data.school_id},
                    {sessionId: data.sessionId},
                    {classId: data.class_id},
                    {sectionId: data.section_id},
                    {subjectId: data.subject_id},
                    {id: data.poll_id},
                    {modified_date: { gte: dateFormat(data.from_date, "isoDateTime") }},
                    {modified_date: { lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59") }}
                ];
        }else{
            condition.userId = data.user_id; 
            condition.schoolId = data.school_id; 
            condition.sessionId = data.sessionId; 
            condition.classId = data.class_id; 
            condition.sectionId = data.section_id; 
            condition.subjectId = data.subject_id; 
            condition.id = data.poll_id; 
        }
        
        Polls.find({
            where: condition,
            include:[{
                    relation: "user_polls",
                    scope:{
                        include:{
                            relation: "getgroup",
                            scope:{
//                                where:{channel: 'group'}
                            }
                        }
                    }
            },{
                relation: "class"
            },{
                relation: "section"
            },{
                relation: "subject"
            },{
                relation: "users",
                scope:{
                    include:{
                        relation: "staff"
                    }
                }
            }]
        },function(err, res){
            var userPoll = [];
            
            if(err){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error Occur";
                return cb(null, errorMessage, err);
            }
            
            if(res && res.length > 0){
                
                for(var i in res){
                    var polls = {};
                    var answers = [];
                    polls.poll_id = res[i].id
                    polls.poll_title = res[i].poll_title
                    polls.school_id = res[i].schoolId
                    polls.class_id = res[i].classId
                    polls.class_name = res[i].class().class_name
                    polls.section_id = res[i].sectionId
                    polls.section_name = res[i].section().section_name
                    polls.subjectId = res[i].subjectId
                    polls.subject_name = res[i].subject().subject_name
                    polls.poll_question = res[i].poll_question
                    
                    if (res[i].answers) {
                        var DataUnserileRst = unserialize(res[i].answers);
                        for (var keys in DataUnserileRst.__attr__) {

                            answers.push(DataUnserileRst.__attr__[keys].val);
                            
                        }
                    }
                    
                    for(var k in answers){
                        var num = +k;
                        num = num + 1;
                        polls["poll_answer_"+num+"_count"] = 0;
                    }
                    polls.poll_answers = answers
                    polls.num_answers = answers.length
                    polls.correct_answer = res[i].correct_answer
                    var index = res[i].correct_answer - 1;
                    polls.correct_answer_name = answers[index]
                    polls.poll_type = res[i].question_type
                    polls.poll_duration = res[i].duration
                    polls.date_created = dateFormat(res[i].created_date, "yyyy-mm-dd H:MM:ss");
                    polls.poll_status = res[i].poll_status
                    
                    var splits= res[i].duration.split(":")
                    var hoursToSec = (+splits[0]) * 3600;
                    var minToSec = (+splits[1]) * 60;
                    var totalSec = hoursToSec + minToSec + (+splits[2]);
                    
                    
                    
                    var getSharedDate = dateFormat(res[i].modified_date, "yyyy-mm-dd");
                    var getSharedTime = dateFormat(res[i].modified_date, "HH:MM:ss").split(":");
                    var sharedHoursToSec = (+getSharedTime[0]) * 3600;
                    var sharedMinToSec = (+getSharedTime[1]) * 60;
                    var sharedTotalSec = sharedHoursToSec + sharedMinToSec + (+getSharedTime[2]);
                    var durationSharedTime = totalSec + sharedTotalSec;
                    
                    
                    var currentDate = dateFormat(new Date(), "yyyy-mm-dd");
                    var currentTime = dateFormat(new Date(), "HH:MM:ss").split(":");
                    var currentHoursToSec = (+currentTime[0]) * 3600;
                    var currentMinToSec = (+currentTime[1]) * 60;
                    var currentTotalSec = currentHoursToSec + currentMinToSec + (+currentTime[2]);
                    
                    polls.shared_status = "Created";
                    polls.remaining_time = 0;
                    
                    
                    if(res[i].placeholder.toLowerCase() == 'shared' && 
                        getSharedDate == currentDate && durationSharedTime >= currentTotalSec){
                        polls.shared_status = "Running";
                        polls.remaining_time = durationSharedTime - currentTotalSec;
                    }else if(res[i].placeholder.toLowerCase() == 'shared' && 
                        (getSharedDate < currentDate)){
                        polls.shared_status = "Stop";
                    }else if(res[i].placeholder.toLowerCase() == 'shared' && getSharedDate == currentDate
                            && durationSharedTime < currentTotalSec){
                        polls.shared_status = "Stop";
                    }  
                    
                    if(res[i].poll_status.toLowerCase() == "inactive"){
                        polls.shared_status = "Stop";
                    }
                    
                    
                    
                    var sharedWith = "";
                    if(res[i].channel == 'group'){
                        sharedWith = "group";
                    }else{
                        sharedWith = "class";
                    }
                    
                    polls.shared_with =  sharedWith;
                    polls.shared_date =  dateFormat(res[i].modified_date, "yyyy-mm-dd H:MM:ss");
                    polls.user_id =  res[i].userId;
                    
                    
                    
                    polls.total_present =  0;
                    polls.total_participants =  0;
                    polls.total_absent =  0;
                    
                    var totalPaticipants = 0;
                    
                    var channelId = [];
                    var groupId = [];
                    if(res[i].user_polls() && res[i].user_polls().length > 0){
                        polls.total_present = res[i].user_polls().length;
                        polls.group_name =  "";

                        for(var k in res[i].user_polls()){
                            if(res[i].user_polls()[k].student_answer){
                                totalPaticipants++;
                            }
                        }
                        
                        for(var k in answers){
                            var num = +k;
                            num = num + 1;
                            for(var j in res[i].user_polls()){
                                if(res[i].user_polls()[j].student_answer == answers[k]){
                                    polls["poll_answer_"+num+"_count"]++;
                                }
                            }
                        }
                        if(sharedWith == "group"){
                            if(groupId.indexOf(res[i].user_polls()[j].getgroup().id) == -1){
                                if(res[i].user_polls()[j].getgroup()){
                                    groupId.push(res[i].user_polls()[j].getgroup().id);
                                    channelId.push({
                                        group_id: res[i].user_polls()[j].getgroup().id,
                                        group_name: res[i].user_polls()[j].getgroup().group_name
                                    });
                                }
                            }
                        }
                    }
                    
                    
                    if(sharedWith == "class"){
                        if (res[i].channel_id) {
                            var DataUnserileRst = unserialize(res[i].channel_id);
                            for (var keys in DataUnserileRst.__attr__) {
                            
                                channelId.push({class_section_id: DataUnserileRst.__attr__[keys].val});
                            }
                        }
                    }
                    
                    polls.posted_to_ids =  channelId;
                    
                    polls.total_participants =  totalPaticipants;
                    polls.total_absent =  polls.total_present - totalPaticipants;
                    polls.shared_by =  res[i].users().staff().name;
                    
                    userPoll.push(polls);
                }
                
                successMessage.responseCode = "200";
                successMessage.responseMessage = "Record fetch successfully";
                return cb(null, successMessage, userPoll);
            }else{
                successMessage.responseCode = "200";
                successMessage.responseMessage = "No record found";
                return cb(null, successMessage, res);
            }
            
//            return cb(null, errorMessage, res);
        });
            }
        });
        
    }
    
    Polls.receiverpoll = function(data, cb){
        
        var pollUserObj = Polls.app.models.poll_users;
        pollUserObj.find({
            where: {userId: data.user_id},
            include:[{
                    relation: "polls",
                    scope:{
                        where:{sessionId: data.session_id,
                                schoolId: data.school_id},
                        include:[{
                            relation: "class"
                        },{
                            relation: "section"
                        },{
                            relation: "subject"
                        },{
                            relation: "users",
                            scope:{
                                include:{
                                    relation: "staff"
                                }
                            }
                        }]
                    }
            },{
                relation: "users",
                scope:{
                    include:{
                        relation: "students"
                    }
                }
            },{
                relation: 'getgroup'
            }]
        }, function(err, res){
            
            
            var userPoll = [];
            
            var pollIdArr = [];
            
            if(err){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error Occur";
                return cb(null, errorMessage, err);
            }
            
            
            
            if(res && res.length > 0){
                for(var i in res){
                    if(res[i].polls()){
                    var polls = {};
                    var answers = [];
                    pollIdArr.push(res[i].polls().id);
                    polls.poll_id = res[i].polls().id
                    polls.poll_title = res[i].polls().poll_title
                    polls.school_id = res[i].polls().schoolId
                    polls.class_id = res[i].polls().classId
                    polls.class_name = res[i].polls().class().class_name
                    polls.section_id = res[i].polls().sectionId
                    polls.section_name = res[i].polls().section().section_name
                    polls.subjectId = res[i].polls().subjectId
                    polls.subject_name = res[i].polls().subject().subject_name
                    polls.poll_question = res[i].polls().poll_question
                
                    if (res[i].polls().answers) {
                        var DataUnserileRst = unserialize(res[i].polls().answers);
                        for (var keys in DataUnserileRst.__attr__) {

                            answers.push(DataUnserileRst.__attr__[keys].val);
                            
                        }
                    }
                    
                    for(var k in answers){
                        var num = +k;
                        num = num + 1;
                        polls["poll_answer_"+num+"_count"] = 0;
                    }
                    
                    polls.poll_answers = answers
                    polls.num_answers = answers.length
                    polls.correct_answer = res[i].polls().correct_answer
                    var index = res[i].polls().correct_answer - 1;
                    polls.correct_answer_name = answers[index]
                    polls.poll_type = res[i].polls().question_type
                    polls.poll_duration = res[i].polls().duration
                    polls.date_created = dateFormat(res[i].polls().created_date, "yyyy-mm-dd H:MM:ss");
                    polls.poll_status = res[i].polls().poll_status
                
                    var splits= res[i].polls().duration.split(":")
                    var hoursToSec = (+splits[0]) * 3600;
                    var minToSec = (+splits[1]) * 60;
                    var totalSec = hoursToSec + minToSec + (+splits[2]);
                
                    var getSharedDate = dateFormat(res[i].polls().modified_date, "yyyy-mm-dd");
                    var getSharedTime = dateFormat(res[i].polls().modified_date, "HH:MM:ss").split(":");
                    var sharedHoursToSec = (+getSharedTime[0]) * 3600;
                    var sharedMinToSec = (+getSharedTime[1]) * 60;
                    var sharedTotalSec = sharedHoursToSec + sharedMinToSec + (+getSharedTime[2]);
                    var durationSharedTime = totalSec + sharedTotalSec;
                
                    var currentDate = dateFormat(new Date(), "yyyy-mm-dd");
                    var currentTime = dateFormat(new Date(), "HH:MM:ss").split(":");
                    var currentHoursToSec = (+currentTime[0]) * 3600;
                    var currentMinToSec = (+currentTime[1]) * 60;
                    var currentTotalSec = currentHoursToSec + currentMinToSec + (+currentTime[2]);
                    
                    polls.remaining_time = 0;
                    polls.shared_status = "Created";
                    if(res[i].polls().placeholder.toLowerCase() == 'shared' && 
                        getSharedDate == currentDate && durationSharedTime >= currentTotalSec){
                        polls.shared_status = "Running";
                        polls.remaining_time = durationSharedTime - currentTotalSec;
                    }else if(res[i].polls().placeholder.toLowerCase() == 'shared' && 
                        (getSharedDate < currentDate)){
                        polls.shared_status = "Stop";
                    }else if(res[i].polls().placeholder.toLowerCase() == 'shared' && getSharedDate == currentDate
                            && durationSharedTime < currentTotalSec){
                        polls.shared_status = "Stop";
                    }
                    
                    if(res[i].polls().poll_status.toLowerCase() == "inactive"){
                        polls.shared_status = "Stop";
                    }
                    
                    var sharedWith = "";
                    if(res[i].polls().channel == 'group'){
                        sharedWith = "group";
                    }else{
                        sharedWith = "class";
                    }
                    
                    
                    polls.shared_with =  sharedWith;
                    polls.shared_date =  dateFormat(res[i].polls().modified_date, "yyyy-mm-dd H:MM:ss");
                    polls.user_id =  res[i].polls().userId;
                    
                    polls.total_present =  0;
                    polls.total_participants =  0;
                    polls.total_absent =  0;
                    
                    
                    var channelId = [];
                    var groupId = [];
                    
                    if(res[i].channel == 'group' && groupId.indexOf(res[i].channelId) == -1){
                            if(res[i].getgroup()){
                                groupId.push(res[i].getgroup().id);
                                channelId.push({
                                    group_id: res[i].getgroup().id,
                                    group_name: res[i].getgroup().group_name
                                });
                            }
                        }
                    
                    if (res[i].polls().channel_id) {
                        var DataUnserileRst = unserialize(res[i].polls().channel_id);
                        for (var keys in DataUnserileRst.__attr__) {
                            if(sharedWith == "class"){
                                channelId.push({class_section_id: DataUnserileRst.__attr__[keys].val});
                            }
                        }
                    }
                    
                    polls.posted_to_ids =  channelId;
                    
                    polls.shared_by =  res[i].polls().users().staff().name;
                    
                    polls.user_answer =  '';
                    
                    userPoll.push(polls);
                    
                    }
                }
                var params = {
                    pollIdArr: pollIdArr
                }; 
                Polls.getStudentsPoll(params, function(err, getRes){
                    if(getRes.length > 0){
                        for(let i in getRes){
                            if(getRes[i].user_polls() && getRes[i].user_polls().length > 0){
                                var index = pollIdArr.indexOf(getRes[i].id);
                                userPoll[index].total_participants = getRes[i].user_polls().length;
                                
                                var countTotalPresent = 0; 
                                var countTotalAbsent = 0; 
                                for(let j in getRes[i].user_polls()){
                                    if(getRes[i].user_polls()[j].student_answer){
                                        countTotalPresent++;
                                    }else{
                                        countTotalAbsent++;
                                    }
                                    
                                    if(getRes[i].user_polls()[j].userId == data.user_id){
                                        if(getRes[i].user_polls()[j].student_answer)
                                        userPoll[index].user_answer = getRes[i].user_polls()[j].student_answer
                                    }
                                }
                                
                                for(var k in userPoll[index].poll_answers){
                                    var num = +k;
                                    num = num + 1;
                                    for(var j in getRes[i].user_polls()){
                                        if(getRes[i].user_polls()[j].student_answer == userPoll[index].poll_answers[k]){
                                            userPoll[index]["poll_answer_"+num+"_count"]++;
                                        }
                                    }
                                }
                                
                                
                                userPoll[index].total_present = countTotalPresent;
                                userPoll[index].total_absent = countTotalAbsent;
                            }
                        }
                    }
                    
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Record fetch successfully";
                    return cb(null, userPoll);
                })
                
                
            }else{
                return cb(null, userPoll);
            }
        });
    }
    
    
    Polls.getStudentsPoll = function(data, cb){
        Polls.find({
            where:{id: {inq: data.pollIdArr}},
            include:{
                relation: "user_polls"
            }
        },function(err, userPoll){
            return cb(null, userPoll)
        })
    }
    
    Polls.remoteMethod(
        "mypolls",
        {
            http: {path:'/mypolls', verb: 'post'},
            description: 'Getting Polls',
            accepts: {arg:"data", type:"object", http: {source: "body"} },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    
};
