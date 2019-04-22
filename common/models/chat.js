'use strict';

var dateFormat = require('dateformat');
var serialize = require("php-serialization").serialize;
var Class = require("php-serialization").Class;
var unserialize = require("php-serialization").unserialize;

module.exports = function (Chat) {

    var errorMessage = {};
    var successMessage = {};


    Chat.createchat = function (ctx, options, cb) {

        var errorMessage = {};
        var successMessage = {};

        var notificationarr = [];
        var FileUpload = Chat.app.models.fileupload;
        FileUpload.fileupload(ctx, options, 'chat', function (err, data) {

            if (!data.user_type) {
                errorMessage.status = '201';
                errorMessage.message = "userType cannot be blank";
                return cb(null, errorMessage);
            }
            if (!data.user_id) {
                errorMessage.status = '201';
                errorMessage.message = "user id cannot be blank";
                return cb(null, errorMessage);
            }

            if (!data.group_id) {
                errorMessage.status = '201';
                errorMessage.message = "Group id cannot be blank";
                return cb(null, errorMessage);
            }

            if (!data.chat_message) {
                errorMessage.status = '201';
                errorMessage.message = "Message cannot be blank";
                return cb(null, errorMessage);
            }
            if (!data.school_id) {
                errorMessage.status = '201';
                errorMessage.message = "School id cannot be blank";
                return cb(null, errorMessage);
            }
            if (!data.session_id) {
                errorMessage.status = '201';
                errorMessage.message = "Session id cannot be blank";
                return cb(null, errorMessage);
            }

            var groupObj = Chat.app.models.groups;
            var userArray = [];

            var groupArr = [];
            groupArr.push(data.group_id);

            groupObj.find({
                where: {id: {inq: groupArr}, status: "Active"},
                include: {
                    relation: 'group_users',
                    scope: {
                        where: {status: "Active"}
                    }
                }
            }, function (err, groupData) {

                if (err) {
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Error Occur";
                    return cb(null, errorMessage, err);
                }
                if (groupData.length > 0) {
                    for (var i in groupData) {
                        userArray.push(groupData[i].created_by)
                        if (groupData[i].group_users && groupData[i].group_users.length > 0) {
                            var userGroup = groupData[i].group_users();
                            for (var k in userGroup) {
                                userArray.push(userGroup[k].userId)
                            }
                        }
                    }



                    var channelIds = "";
                    var c = new Class();
                    if (userArray.length > 0) {
                        for (var m = 0; m < userArray.length; m++) {

                            var notificationobj = {};
                            if (userArray[m] != data.user_id) {
                                notificationobj.user_id = userArray[m];
                                notificationobj.module_key_id = data.group_id;
                                notificationobj.type = 12;
                                notificationobj.title = "New Chat";
                                notificationobj.notification_text = "";
                                notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                                notificationarr.push(notificationobj);
                            }


                            c.__addAttr__(m, "integer", userArray[m], "string");
                        }

                        if (userArray.length > 0) {
                            channelIds = serialize(c, "array");
                        }
                    }

                    var charParam = {
                        userId: data.user_id,
                        channel: 'group',
                        channel_id: channelIds,
                        schoolId: data.school_id,
                        sessionId: data.session_id,
                        user_type: data.user_type,
                        chat_message: data.chat_message,
                        groupId: data.group_id
                    }


                    Chat.upsert(charParam, function (error, inserted) {
                        if (notificationarr.length > 0) {
                            var Notification = Chat.app.models.notification;
                            Notification.sendnotification(notificationarr);
                        }
                        successMessage.status = '200';
                        successMessage.message = "Chat Sent Successfully";
                        return cb(null, successMessage);
                    })

                } else {
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Group has no users";
                    return cb(null, errorMessage);
                }

            });

        })
    }

    Chat.remoteMethod(
            'createchat',
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


    Chat.getchat = function (data, cb) {

        var errorMessage = {};
        var successMessage = {};

        if (!data.group_id) {
            errorMessage.status = '201';
            errorMessage.message = "Group id cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.user_type) {
            errorMessage.status = '201';
            errorMessage.message = "User type cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.user_id) {
            errorMessage.status = '201';
            errorMessage.message = "User id cannot be blank";
            return cb(null, errorMessage);
        }

        if (!data.token) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Token cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.school_id) {
            errorMessage.status = '201';
            errorMessage.message = "School id cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.session_id) {
            errorMessage.status = '201';
            errorMessage.message = "Session id cannot be blank";
            return cb(null, errorMessage);
        }

        Chat.find({
            where: {groupId: data.group_id, sessionId: data.session_id, schoolId: data.school_id},
            include: {
                relation: "users",
                scope: {
                    include: [{
                            relation: "students",
                        }, {
                            relation: "staff"
                        }]
                }
            }
        }, function (err, res) {

            if (err) {
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error Occur";
                return cb(null, errorMessage, err);
            }
            var finalArr = [];
            if (res && res.length > 0) {

                for (var i in res) {
                    var name = ""
                    if (res[i].users()) {
                        if (res[i].users().user_type.toLowerCase() == 'student' && res[i].users().students()) {
                            name = res[i].users().students().name;
                        } else if (res[i].users().user_type.toLowerCase() == 'teacher' && res[i].users().staff()) {
                            name = res[i].users().staff().name;
                        }
                    }

                    finalArr.push({
                        chat_message: res[i].chat_message,
                        group_id: res[i].groupId,
                        sender_name: name,
                        sender_id: res[i].userId,
                        create_date: dateFormat(res[i].created_date, "yyyy-mm-dd HH:MM:ss")
                    });

                }

                successMessage.responseCode = "200";
                successMessage.responseMessage = "Data found";
                return cb(null, successMessage, finalArr);

            } else {
                successMessage.responseCode = "200";
                successMessage.responseMessage = "No data found";
                return cb(null, successMessage);
            }
        });
    }

    Chat.remoteMethod(
            "getchat",
            {
                http: {path: '/getchat', verb: 'post'},
                description: 'get chat',
                accepts: {arg: "data", type: "object", http: {source: "body"}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

};
