'use strict';

var rp = require('request-promise');
var dateFormat = require('dateformat');
var serialize = require("php-serialization").serialize;
var unserialize = require("php-serialization").unserialize;
var constantval = require('./constant');
module.exports = function (Usernotes) {

    Usernotes.assignnotes = function (data, cb) {

        Usernotes.upsert(data, function (err) {
            return cb(err);
        });

    };


    Usernotes.sharenotes = function (data, cb) {
        var msg = {};
        var userNotesObj = {};
        var notesData = {};
        var userIds = [];
        var userType = 'Student';

        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }

        var response = Usernotes.validaterequest(data);
        if (response.statusCode == "201")
        {
            cb(null, response);
        }
        var notesObj = Usernotes.app.models.notes;
        notesObj.findById(data.notes_id, function (err, res) {
            if (!res) {
                msg.status = "201";
                msg.message = "No Record found";
                cb(null, msg);
            }

            var subjectId = res.subjectId;

            if (data.user_ids && (typeof data.user_ids == 'object')) {
                userIds = data.user_ids;
            }
            userNotesObj.shared_with = data.share_with;

            if (data.sender) {
                userNotesObj.sender = data.sender;
            }
            userNotesObj.notesId = data.notes_id;
            userNotesObj.sessionId = data.session_id;
            userNotesObj.user_type = userType;
            userNotesObj.schoolId = data.school_id;
            userNotesObj.shared_date = dateFormat(data.shared_date, "isoDate");

            if (data.share_with == 'Section') {
                var request = {
                    sectionId: data.section_id,
                    user_type: "Student",
                    sessionId: data.session_id,
                    subjectId: subjectId
                };

                var userSubjectObj = Usernotes.app.models.user_subject;

                userSubjectObj.subjectusers(request, function (err, res) {
                    res.forEach(function (userInfo) {
                        userNotesObj.userId = userInfo.userId;
                        userNotesObj.sectionId = userInfo.sectionId;
                        userNotesObj.receiver = userInfo.userId;
                        userNotesObj.placeholder = "Inbox";
                        Usernotes.create(userNotesObj, function (err, result) {

                        });
                    });

                });
            } else if (data.share_with == 'Group') {
                var request = {
                    groupId: data.group_id,
                    sessionId: data.session_id,
                    subjectId: subjectId
                };

                var userGroupObj = Usernotes.app.models.group_users;

                userGroupObj.groupusers(request, function (err, res) {

                    res.forEach(function (userInfo) {
                        userNotesObj.userId = userInfo.userId;
                        userNotesObj.receiver = userInfo.userId;
                        userNotesObj.groupsId = userInfo.groupsId;
                        userNotesObj.placeholder = "Inbox";
                        Usernotes.create(userNotesObj, function (err, result) {

                        });
                    });

                });

            } else if (data.share_with == 'Teacher') {
                userIds.forEach(function (userId) {
                    userNotesObj.userId = userId;
                    userNotesObj.placeholder = "Inbox";
                    userNotesObj.user_type = "Teacher";
                    userNotesObj.receiver = userId;
                    Usernotes.create(userNotesObj, function (err, result) {

                    });
                });
            } else if (data.share_with == 'School') {
                userNotesObj.userId = data.school_id;
                userNotesObj.receiver = data.school_id;
                userNotesObj.placeholder = "Inbox";
                userNotesObj.user_type = "School";
                Usernotes.create(userNotesObj, function (err, result) {

                });

            } else if (data.share_with == 'Individual' && userIds) {
                userIds.forEach(function (userId) {
                    userNotesObj.userId = userId;
                    userNotesObj.notesId = data.notes_id;
                    userNotesObj.sessionId = data.session_id;
                    userNotesObj.placeholder = "Inbox";
                    userNotesObj.user_type = userType;
                    userNotesObj.receiver = userId;
                    Usernotes.create(userNotesObj, function (err, result) {

                    });
                });

            } else {
                msg.status = "201";
                msg.message = "No user to share";
                cb(null, msg);
            }
            userNotesObj.userId = data.sender;
            userNotesObj.placeholder = "Sent";
            userNotesObj.user_type = data.share_with;
            userNotesObj.receiver = data.sender;
            Usernotes.create(userNotesObj, function (err) {

            });
            var notesObj = Usernotes.app.models.notes;
            notesData.id = data.notes_id;
            notesData.notes_type = 'Shared';
            notesObj.upsert(notesData, function (err) {

            });
            msg.status = "200";
            msg.message = "Success";
            cb(null, msg);

        });
    };
    Usernotes.sharenotes.promisify = true;
    Usernotes.remoteMethod(
            'sharenotes',
            {
                http: {path: '/sharenotes', verb: 'post'},
                description: 'Share notes',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Usernotes.getusernotes = function (data, cb) {

        var userId = data.user_id;
        var placeholder = data.placeholder;
        var sectionId = data.section_id;
        var subjectId = data.subject_id;
        var notesTitle = data.notes_title;
        var schoolId = data.school_id;
        //var notes_date = data.notes_date;
        var data = [];


        var errorMessage = {};
        var successMessage = {};
        if (!userId) {
            errorMessage.status = '201';
            errorMessage.message = "user_id cannot blank";
           return cb(null, errorMessage);
        }
        if (!placeholder) {
            errorMessage.status = '201';
            errorMessage.message = "placeholder cannot blank";
           return cb(null, errorMessage);
        }

        if (placeholder.toLowerCase() == 'draft')
        {
            var Notes = Usernotes.app.models.notes;
            Notes.find(
                    {include: [{
                                relation: "belongs_to_subject"
                            },
                            {
                                relation: "belongs_to_section"
                            }],
                        where: {author: userId, notes_type: 'draft'},
                        order: "id DESC"

                    }, function (err, response) {
                if (err) {
                    errorMessage.status = '201';
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);
                } else {
                    successMessage.status = '200';
                    successMessage.message = "Data Fetched Successfully";

                    if (response.length > 0)
                    {

                        for (let key in response)
                        {
                            var allobj = {};
                            allobj.notes_id = response[key].id;
                            allobj.notes_title = response[key].notes_title;
                            allobj.notes_text = response[key].notes_text;
                            allobj.share_status = response[key].notes_type;
                             allobj.subject_id = response[key].subjectId;
                             allobj.section_id = response[key].sectionId;
                            allobj.session_id = response[key].sessionId;
                            allobj.school_id = response[key].schoolId;
                            allobj.subject = '';
                            if (response[key].belongs_to_subject()) {
                                allobj.subject = response[key].belongs_to_subject().subject_name;
                            }
                            allobj.class_section = '';
                            if (response[key].belongs_to_section()) {
                                allobj.class_section = response[key].belongs_to_section().section_name;
                            }
                            allobj.attachments = response[key].attachments != '' ? 1 : 0;
                            allobj.created_date = dateFormat(response[key].created_date, "yyyy-mm-dd HH:MM:ss");
                            allobj.created_date_app = dateFormat(response[key].created_date, "isoDateTime");
                            var attch = [];
                            if (response[key].attachments) {
                                var DataUnserileRst = unserialize(response[key].attachments);
                                for (var key3 in DataUnserileRst.__attr__) {

                                    attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key3].val);
                                }
                            }
                            allobj.attachment_path = attch;
                            data.push(allobj);
                        }
                    }
                    var finaldata = {};
                    finaldata.notes = data;
                    cb(null, successMessage, finaldata);
                }
            })
        } else
        {
            Usernotes.find({
                fields: ["notesId", "shared_with", "sender", "schoolId", "sessionId", "sectionId"],
                include:
                        [{
                                relation: "notes",
                                scope: {
                                    fields: ['notes_title', 'notes_text', 'notes_type', 'attachments', 'created_date', 'author', "subjectId", "sectionId"],
                                    include: [{
                                            relation: "belongs_to_subject",
                                            scope: {
                                                fields: ["subject_name"]
                                            }
                                        }, {
                                            relation: "belongs_to_section",
                                            scope: {
                                                fields: ["section_name"]
                                            }
                                        }]
                                }
                            }, {
                                relation: "sender_user",
                                scope: {
                                    fields: ["user_type"],
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

                where:
                        {
                            or: [
                                {and: [{userId: userId}, {placeholder: placeholder}]},
                                {userId: schoolId, placeholder: placeholder, shared_with: 'School'},
                            ]
                        },
                order: "notesId DESC"
            }, function (err, result) {

                if (err) {
                    errorMessage.status = '201';
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);
                } else {
                    if (result.length > 0)
                    {
                        for (let key in result)
                        {
                            var tempval = result[key].toJSON();

                            var allobj = {};
                            allobj.notes_id = tempval.notes.id;
                            allobj.notes_title = tempval.notes.notes_title;
                            allobj.notes_text = tempval.notes.notes_text;
                            allobj.share_status = tempval.notes.notes_type;
                            allobj.subject_id = tempval.notes.subjectId;
                            allobj.section_id = tempval.notes.sectionId;
                            allobj.session_id = tempval.sessionId;
                            allobj.school_id = tempval.schoolId;
                            allobj.sender_id = tempval.sender;
                            allobj.sender_name = '';

                            if (tempval.sender_user.user_type == 'Student') {
                                allobj.sender_name = tempval.sender_user.students.name;
                            } else if (tempval.sender_user.user_type == 'Teacher') {
                                allobj.sender_name = tempval.sender_user.staff.name;
                            }

                            allobj.subject = '';
                            allobj.class_section = '';
                            if (tempval.notes.belongs_to_subject && tempval.notes.belongs_to_subject.subject_name) {
                                allobj.subject = tempval.notes.belongs_to_subject.subject_name;
                            }
                            if (tempval.notes.belongs_to_section && tempval.notes.belongs_to_section.section_name) {
                                allobj.class_section = tempval.notes.belongs_to_section.section_name;
                            }
                            allobj.attachments = tempval.notes.attachments != '' ? 1 : 0;
                            allobj.created_date = dateFormat(tempval.notes.created_date, "yyyy-mm-dd HH:MM:ss");
                            allobj.created_date_app = dateFormat(tempval.notes.created_date, "isoDateTime");
                            var attch = [];
                            if (tempval.notes.attachments) {
                                var DataUnserileRst = unserialize(tempval.notes.attachments);
                                for (var key2 in DataUnserileRst.__attr__) {

                                    attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key2].val);
                                }
                            }
                            allobj.attachment_path = attch;
                            data.push(allobj);

                        }

                    }
                    var finaldata = {};
                    finaldata.notes = data;
                    successMessage.status = '200';
                    successMessage.message = "Data Fetched Successfully";
                    cb(null, successMessage, finaldata);

                }
            }
            );
        }

    };

    Usernotes.getnotesdetails = function (data, cb) {
        var msg = {};

        if (!data) {
            msg.status = '201';
            msg.message = "Request cannot be empty";
            cb(null, msg);
        }
        if (!data.notes_id) {
            msg.status = '201';
            msg.message = "Notes id cannot be empty";
            cb(null, msg);
        }
        var notesId = data.notes_id;
        Usernotes.find(
                {
                    include:
                            {
                                relation: "notes",
                                scope: {
                                    fields: ['notes_title', 'notes_text', 'attchements', 'created_date', 'author']
                                }
                            },
                    where: {notesId: notesId}
                },
                function (err, result) {
                    if (err) {
                        return  cb(null, err);
                    }
                    return  cb(null, result);
                });

    };
    Usernotes.remoteMethod(
            'getnotesdetails',
            {
                http: {path: '/getnotesdetails', verb: 'post'},
                description: 'Get notes detail by id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'array'}
            }
    );


    Usernotes.validaterequest = function (data) {
        var msg = {};
        if (!data.notes_id) {
            msg.status = '201';
            msg.message = "Notes id cannot blank";
            return msg;
        }
        if (!data.session_id) {
            msg.status = '201';
            msg.message = "Session cannot blank";
            return   msg;
        }
        if (!data.share_with) {
            msg.status = '201';
            msg.message = "Share with cannot blank";
            return   msg;
        }
        if (!data.section_id && data.share_with == 'Section') {
            msg.status = '201';
            msg.message = "Section Cannot blank";
            return   msg;

        }

        if (!data.group_id && data.share_with == 'Group') {
            msg.status = '201';
            msg.message = "Group Cannot blank";
            return   msg;
        }
        if (!data.school_id) {
            msg.status = '201';
            msg.message = "School id Cannot blank";
            return   msg;
        }
        



        msg.status = '200';
        msg.message = "Success";
        return msg;
    }
    Usernotes.getsectionusers = function (request) {

        return new Promise(function (resolve, reject) {
            var userSubjectObj = Usernotes.app.models.user_subject;
            userSubjectObj.subjectusers(request, function (err, result) {
                resolve(result);
            });
        });
    }


    Usernotes.remoteMethod(
            'assignnotes',
            {
                http: {path: '/assignnotes', verb: 'post'},
                description: 'Assign notes',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Usernotes.remoteMethod(
            'getusernotes',
            {
                http: {path: '/getusernotes', verb: 'post'},
                description: 'Get notes',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}],
            }
    );
};