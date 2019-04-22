'use strict';
//var dateFormat = require('dateformat');
var request = require('request');
var fs = require('fs');
var rp = require('request-promise');
var dateFormat = require('dateformat');
var constantval = require('./constant');
var local_url = constantval.LOCAL_URL;
var local_port = constantval.LOCAL_PORT;
var serialize = require("php-serialization").serialize;
var unserialize = require("php-serialization").unserialize;
var Class = require("php-serialization").Class;
module.exports = function (Notes) {

    Notes.validaterequest = function (data) {

        var msg = {};
        var notesObj = {};
        if (data.section_id) {
            notesObj.sectionId = data.section_id;
        }
        if (data.id) {
            notesObj.id = data.id;
        }

        if (data.notes_title) {
            notesObj.notes_title = data.notes_title;
        } else {
            msg.status = '201';
            msg.message = "Notes title cannot blank";
            return msg;
        }
        if (data.notes_text) {
            notesObj.notes_text = data.notes_text;
        } else {
            msg.status = '201';
            msg.message = "Notes text cannot blank";
            return  msg;
        }

        if (data.session_id) {
            notesObj.sessionId = data.session_id;
        } else {

            msg.status = '201';
            msg.message = "Session cannot blank";
            return   msg;
        }
        if (data.school_id) {
            notesObj.schoolId = data.school_id;
        } else {

            msg.status = '201';
            msg.message = "School cannot blank";
            return   msg;
        }
        if (data.subject_id) {
            notesObj.subjectId = data.subject_id;
        } else {

            msg.status = '201';
            msg.message = "Subject cannot blank";
            return   msg;
        }
        if (data.attachments) {
            notesObj.attachments = data.attachments;
        }
        if (data.author) {
            notesObj.author = data.author;
            notesObj.userId = data.author;
        } else {
            msg.status = '201';
            msg.message = "Author cannot blank";
            return   msg;
        }
        notesObj.created_date = new Date();
        notesObj.notes_type = "Draft";
        notesObj.share_status = "Active";
        msg.status = '200';
        msg.message = "Success";
        msg.data = notesObj;
        return msg;
    }


    Notes.getnotes = function (cb) {

        Notes.find(function (err, result) {
            if (err) {
                return  cb(null, err);
            }
            return  cb(null, result);
        });
    };
    Notes.getnotesdetails = function (data, cb) {
        var msg = {};
        if (!data) {
            msg.status = '201';
            msg.message = "Request cannot be empty";
            cb(null, msg);
        }
        var notesId = data.notes_id;
        Notes.findById(notesId,
                {
                    include: [{
                        relation: "have_assignee",
                        scope: {
                            fields: ["userId","shared_with","shared_date","sender"],
                            where:{placeholder:"Inbox"},
                            include: [{
                                relation: "users",
                                scope: {
                                    fields:["user_type"],
                                    include: [{
                                            relation: "students",
                                            scope: {
                                                fields: ['name', 'admission_no'],
                                            }
                                        }, {
                                            relation: "staff",
                                            scope: {
                                                fields: ['name','staff_code'],
                                            }
                                        }]
                                },
                            },{
                                relation : "sender_user",
                                scope: {
                                    fields:["user_type"],
                                    include: [{
                                            relation: "students",
                                            scope: {
                                                fields: ['name',"student_photo"],
                                            }
                                        }, {
                                            relation: "staff",
                                            scope: {
                                                fields: ['name','profile_image'],
                                            }
                                        }]
                                },
                            }]
                        }
                    },{
                            relation : "author",
                            scope: {
                                    fields:["user_type"],
                                    include: [{
                                            relation: "students",
                                            scope: {
                                                fields: ['name'],
                                            }
                                        }, {
                                            relation: "staff",
                                            scope: {
                                                fields: ['name'],
                                            }
                                        }]
                                },
                       
                    }],
                },
                function (err, result) {
                    if (err) {
                        msg.status = '201';
                        msg.message = "Fail";
                        msg.data = err;
                       return cb(null, msg);
                    }
                    if(result.length == 0){
                        msg.status = '200';
                        msg.message = "No record found";
                        msg.data = err;
                       return cb(null, msg);
                    }
                  
                    var userArr = [];
                    
                      var value = result.toJSON();
                
                       var obj = {};
                       obj.notes_title = value.notes_title;
                       obj.section_id = value.sectionId;
                       obj.subject_id = value.subjectId;
                       obj.notes_title = value.notes_title;
                       obj.notes_text = value.notes_text;
                       obj.created_date = dateFormat(value.created_date,"isoDate");
                       if(value.author && value.author.students){
                           obj.author = value.author.students.name;
                       }
                       if(value.author && value.author.staff){
                           obj.author = value.author.staff.name;
                       }
                       
                       var attch = [];
                       if(value.attachments){
                           var DataUnserileRst = unserialize(value.attachments);
                                for (var key3 in DataUnserileRst.__attr__) {

                                    attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key3].val);
                                }
                       }
                       
                       obj.attachments = attch;
                       
                       if(value.have_assignee){
                           var assigne = value.have_assignee;
                        
                               assigne.forEach(function(usrs){
                                   if(usrs.users) {
                                       var users = usrs.users;
                                       var sender = usrs.sender_user;
                                       var senderName = '';
                                       var senderImage = '';
                                 if(sender.user_type == 'Student'){
                                     senderName = sender.students.name;
                                     senderImage = constantval.PROJECT_NAME + "/" + sender.students.student_photo;
                                 }else if(sender.user_type == 'Teacher'){
                                     
                                     senderName = sender.staff.name;
                                     senderImage = constantval.PROJECT_NAME + "/" + sender.staff.profile_image;
                                 }
                                 if(users.user_type == 'Student'){
                                     
                                     var userObj = {
                                         name : users.students.name, 
                                         username : users.students.admission_no
                                         
                                     }
                                      userObj.shared_date = dateFormat(usrs.shared_date,"isoDate");
                                     userObj.sender = senderName;
                                     userObj.sender_image = senderImage;
                                     userArr.push(userObj);
                                 }else if(users.user_type == 'Teacher'){
                                     var userObj = {
                                         name : users.staff.name, 
                                         username : users.staff.staff_code
                                       
                                     }
                                     userObj.shared_date = dateFormat(usrs.shared_date,"isoDate");
                                     userObj.sender = senderName;
                                      userArr.push(userObj);
                                 }
                                   }
                                   
                               });
                               obj.users = userArr;
                          
                           
                       }
                   
                    msg.status = '200';
                    msg.message = "Success";
                    msg.data = obj;
                    cb(null, msg);
                });
    };

    Notes.remoteMethod(
            'getnotes',
            {
                http: {path: '/getnotes', verb: 'post'},
                description: 'Get notes',
                // accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'array'}
            }
    );
    Notes.remoteMethod(
            'getnotesdetails',
            {
                http: {path: '/getnotesdetails', verb: 'post'},
                description: 'Get notes detail by id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'array'}
            }
    );

    Notes.createnotes = function (ctx, options, cb) {
        var c = new Class();
        var FileUpload = Notes.app.models.fileupload;
        var msg = {};
        if (!ctx) {
            msg.status = '201';
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        //console.log(ctx)
        //var request = Notes.validaterequest(ctx);
        //if (request.status == '201') {
        //return  cb(null, request);
        // }

        FileUpload.fileupload(ctx, options, 'notes', function (err, responseData) {

            if (responseData.status != undefined && (responseData.status == '201' || responseData.status == '000'))
            {
                msg.status = responseData.status;
                msg.message = responseData.message;
                cb(null, msg);
            } else
            {
                var filepath = '';
                if (responseData.attachments.length > 0)
                {
                    for (var m = 0; m < responseData.attachments.length; m++) {

                        c.__addAttr__(m, "integer", responseData.attachments[m], "string");
                    }
                    filepath = serialize(c, "array");
                }

                var request = {
                   "notes_title": responseData.notes_title, "notes_text": responseData.notes_text, "author": responseData.author, "sessionId": responseData.sessionId, "schoolId": responseData.schoolId,
                    "subjectId": responseData.subjectId, "sectionId": responseData.sectionId, "share_status": 'Active', "created_date": responseData.created_date, "attachments": filepath
                };
                if(responseData.notes_id){
                    request.id =  responseData.notes_id;
                }
                
                Notes.upsert(request, function (err, response) {
                    if (err) {
                        msg.status = '201';
                        msg.message = "Error Occured!";
                        cb(null, msg);
                    } else {

                        msg.status = '200';
                        msg.message = "Notes created successfully";
                        var attch = [];
                        if (response.attachments) {
                            var DataUnserileRst = unserialize(response.attachments);
                            for (var key in DataUnserileRst.__attr__) {

                                attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);
                            }
                        }
                        response.attachments = attch;
                        response.created_date = dateFormat(response.created_date, "isoDate");
                        msg.data = response;
                        cb(null, msg);
                    }
                });
            }
        });
    };
    Notes.remoteMethod(
            'createnotes',
            {
                description: 'Add Notes',
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
};
