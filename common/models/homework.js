'use strict';
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
var arraySort = require('array-sort');
var Dedupe = require('array-dedupe');

module.exports = function (Homework) {
    var errorMessage = {};
    var successMessage = {};
    var notificationarr = [];
    var notificationsubjectname = "";
    var notificationhometitle = "";
    var today = dateFormat(Date(), "yyyy-mm-dd");
    
    Homework.homework = function (req, cb) {
        
    
        var User = Homework.app.models.user;
        var user_id = req.user_id;
        var data = {};
        var assignmentDetailArr = [];
        var homeworkArr = [];
        var subjectArr = [];
        var homeAssignCount = 0;
        var homeRecevCount = 0;
        var homeChckCount = 0;
        successMessage.status = "200";
        successMessage.message = "Information Fetched Successfully.";
        var Oauthtoken = Homework.app.models.oauthaccestoken;
        Homework.validateCheck('list', req, cb);




        var date_where_condition = {};
        //Commented by Dheeraj, because below where condition is throwing error
        // var classsec_where_condition = {};
        // var subject_where_condition = {};
        // if (req.class_id && !req.section_id) {
        //     classsec_where_condition.where = { classId: req.class_id, schoolId: req.school_id }

        // }
        // else if (req.class_id && req.section_id && !req.section_id) {
        //     classsec_where_condition.where = { classId: req.class_id, id: req.section_id, schoolId: req.school_id }

        // }
        // else if (req.class_id && req.section_id && req.subject_id) {
        //     subject_where_condition.where = { id: req.subject_id, schoolId: req.school_id }

        // }

        if (req.from_date && req.to_date) {
            date_where_condition.where = {
                and: [
                    { created_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                    { created_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                    { type: 'homework', userId: req.user_id }
                ]
            }

        }
        else {
            date_where_condition.where = { type: 'homework', userId: req.user_id }
        }


        Homework.find({
            include: [{
                relation: "createdForSubject",
                scope: {
                    fields: ['schoolId', 'subject_name', 'subject_icon'],
                    //where: { schoolId: req.school_id },
                }

            },
            {
                relation: "homework_assign",
                scope: {
                    fields: ['homeworkId'],
                    where: { schoolId: req.school_id },
                }

            },
            {
                relation: "homework_section",
                scope: {
                    fields: ['schoolId', 'section_name', 'classId'],
                    where: { schoolId: req.school_id },
                }

            },
            {
                relation: "homework_submit",
                scope: {
                    fields: ['homeworkId', 'remark_date'],
                    where: { schoolId: req.school_id },
                }

            }
            ],
            where: date_where_condition.where,
            order: 'created_date desc',
        }, function (err, response) {
            if (err) {
                Homework.errMessage(cb);
            }
            else {
                if (response.length > 0) {
                    var homeworkid = [];


                    var promises = [];
                    response.forEach(function (responsedata) {
                        if (responsedata.createdForSubject()) {
                            var allobject = {};
                            allobject.homework_id = responsedata.id;
                            allobject.homework_title = responsedata.title;
                            allobject.homework_content = responsedata.content;
                            allobject.type = responsedata.type;
                            allobject.added_date = dateFormat(responsedata.created_date, "yyyy-mm-dd HH:MM:ss");
                            allobject.added_date_app = dateFormat(responsedata.created_date, "isoDateTime");
                            allobject.displayTime = Date.parse(today) == Date.parse(dateFormat(responsedata.created_date, "yyyy-mm-dd"))?'1':'0';
                            allobject.target_date = dateFormat(responsedata.submission_date, "yyyy-mm-dd HH:MM:ss");
                            allobject.target_date_app = dateFormat(responsedata.submission_date, "isoDateTime");
                            allobject.subject_name = responsedata.createdForSubject().subject_name;
                            allobject.subject_image = responsedata.createdForSubject().subject_icon;
                            allobject.subject_id = responsedata.createdForSubject().id;
                            allobject.class_section_name = responsedata.homework_section().section_name;
                            allobject.class_id = responsedata.homework_section().classId;
                            allobject.section_id = responsedata.homework_section().id;
                            allobject.homework_assigned_count = responsedata.homework_assign().length;
                            allobject.homework_received_count = responsedata.homework_submit().length;
                            var classSubUnqId = '';

                            if (responsedata.attachment == '') {
                                allobject.attachment_count = 0;
                            }
                            else {
                                var DataUnserileRst = unserialize(responsedata.attachment);

                                for (var key in DataUnserileRst.__attr__) {

                                    allobject.attachment_count = 1;

                                }

                            }
                            var rmkCount = 0;
                            if (responsedata.homework_submit().length == 0)
                                allobject.homework_checked_count = 0;
                            else {

                                responsedata.homework_submit().forEach(function (rmkdata) {
                                    if (rmkdata.remark_date != null && rmkdata.remark_date != '') {
                                        rmkCount++;
                                    }
                                })
                                allobject.homework_checked_count = rmkCount;
                            }
                            if (req.class_id && req.class_id == allobject.class_id && !req.section_id && !req.subject_id) {
                                assignmentDetailArr.push(allobject);
                            }
                            else if (req.class_id && req.class_id == allobject.class_id && req.section_id && req.section_id == allobject.section_id && !req.subject_id) {
                                assignmentDetailArr.push(allobject);
                            }
                            else if (req.class_id && req.class_id == allobject.class_id && req.section_id && req.section_id == allobject.section_id && req.subject_id && req.subject_id == allobject.subject_id) {
                                assignmentDetailArr.push(allobject);
                            }
                            else if (!req.class_id && !req.section_id && !req.subject_id) {
                                assignmentDetailArr.push(allobject);
                            }




                        }
                    });


                    var finalDetailArr = [];
                    var archivedSort = arraySort(assignmentDetailArr, 'added_date', { reverse: true });
                    assignmentDetailArr = [];
                    assignmentDetailArr = archivedSort;


                    var finallist = {}; finallist.homework = assignmentDetailArr;

                    cb(null, successMessage, finallist);


                }
                else {
                    var finallist = {}; finallist.homework = [];
                    cb(null, successMessage, finallist);
                }
            }
        });







    };
    Homework.createhomework = function (ctx, options, cb) {

        var Oauthtoken = Homework.app.models.oauthaccestoken;
        var FileUpload = Homework.app.models.fileupload;
        notificationarr = [];
        FileUpload.fileupload(ctx, options, 'homework', function (err, responseuploaddata) {

            if (responseuploaddata.status != undefined && (responseuploaddata.status == '201' || responseuploaddata.status == '000')) {
                errorMessage.status = responseuploaddata.status;
                errorMessage.message = responseuploaddata.message;
                return cb(null, errorMessage);
            }
            else {
              
                        var promises = [];
                        var counter = 0;
                        var assign_to_ids = [];
                        if (responseuploaddata.assign_to.toLowerCase() == 'class') {
                            assign_to_ids = responseuploaddata.classsec_ids.split(',');
                        }
                        if (responseuploaddata.assign_to.toLowerCase() == 'group') {
                            assign_to_ids = responseuploaddata.group_ids.split(',');
                        }
                        if (responseuploaddata.type.toLowerCase() == 'homework') {
                            assign_to_ids.forEach(function (id) {
                                promises.push(Homework.addHomework(responseuploaddata, id, counter, cb).then(function (response) {


                                })
                                );
                                counter++;

                            })
                        }
                        else if (responseuploaddata.type.toLowerCase() == 'draft') {
                            promises.push(Homework.addHomework(responseuploaddata, assign_to_ids[0], undefined, cb).then(function (response) {


                            })
                            );
                        }


                        Promise.all(promises).then(function (data) {
                            if (notificationarr.length > 0) {
                                Homework.setParentNotification(notificationarr);
                                if(constantval.SYNC_PROCESS=='1')
                                    {
                                    var SyncDetail = Homework.app.models.syncdetail;
                                    SyncDetail.adddetail(4,notificationarr);
                                    }

                            }


                            successMessage.status = "200";
                            if (responseuploaddata.type.toLowerCase() == 'homework') {
                                successMessage.message = "Homework created successfully";
                            }
                            else {
                                successMessage.message = "Homework draft successfully";
                            }
                            cb(null, successMessage);

                        })
                    
            }



        });


    };

    Homework.studenthomeworksubmit = function (ctx, options, cb) {
        notificationarr = [];
        var Oauthtoken = Homework.app.models.oauthaccestoken;
        var FileUpload = Homework.app.models.fileupload;
        FileUpload.fileupload(ctx, options, 'studenthomeworksubmit', function (err, responseuploaddata) {
            if (responseuploaddata.status != undefined && (responseuploaddata.status == '201' || responseuploaddata.status == '000')) {
                errorMessage.status = responseuploaddata.status;
                errorMessage.message = responseuploaddata.message;
                return cb(null, errorMessage);
            }
            else {
                
                        var promises = [];
                        Homework.findById(responseuploaddata.homework_id, function (err, detail) {
                            promises.push(Homework.homeworksubmitandcheckexecute(detail.userId, responseuploaddata.user_id, responseuploaddata.homework_id, detail.title, 0, '', responseuploaddata.content, responseuploaddata.file_path, cb));
                            Promise.all(promises).then(function (final) {
                                successMessage.status = "200";
                                successMessage.message = "Homework submitted successfully";

                                if (notificationarr.length > 0) {
                                    var Notification = Homework.app.models.notification;
                                    Notification.pushnotification(notificationarr);
                                    if(constantval.SYNC_PROCESS=='1')
                                        {
                                        var SyncDetail = Homework.app.models.syncdetail;
                                        SyncDetail.adddetail(4,notificationarr);
                                        }
                                }
                                return cb(null, successMessage);



                            })
                        })
                   
            }



        });
    }



    Homework.addHomework = function (request, id, loopcount, cb) {
        return new Promise(function (resolve, reject) {
            var c = new Class();



            var filepath = '';
            if (request.file_path.length > 0) {
                for (var m = 0; m < request.file_path.length; m++) {

                    c.__addAttr__(m, "integer", request.file_path[m], "string");

                }
                filepath = serialize(c, "array");
            }
            var homeworkData = {};
            var draftdata = [];
            if (request.type.toLowerCase() == 'draft' && request.assign_to.toLowerCase() == 'class') {
                draftdata = request.classsec_ids.split(',');
                var draftjson = {
                    assign_to: 'class',
                    class_id: request.class_id,
                    section_id: request.section_id,
                    subject_id: request.subject_id,
                    all_ids: draftdata
                };
                homeworkData.draft_data = JSON.stringify(draftjson);
            }
            else if (request.type.toLowerCase() == 'draft' && request.assign_to.toLowerCase() == 'group') {
                draftdata = request.group_ids.split(',');
                var draftjson = {
                    assign_to: 'group',
                    class_id: request.class_id,
                    section_id: request.section_id,
                    subject_id: request.subject_id,
                    all_ids: draftdata
                };
                homeworkData.draft_data = JSON.stringify(draftjson);
            }
            else {
                homeworkData.draft_data = '';
            }
            if (request.homework_id != '' && request.type.toLowerCase() == 'draft') {
                homeworkData.id = request.homework_id;
            }
            if (request.homework_id != '' && request.type.toLowerCase() == 'homework' && loopcount == 0) {
                homeworkData.id = request.homework_id;
            }
            homeworkData.subjectId = request.subject_id;
            homeworkData.title = request.title;
            homeworkData.content = !request.content?' ':request.content;
            homeworkData.attachment = filepath;
            homeworkData.submission_date = request.target_date;
            homeworkData.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
            homeworkData.origin = request.origin;
            homeworkData.channel = request.channel;
            homeworkData.type = request.type;
            homeworkData.userId = request.user_id;
            homeworkData.timestamp = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
            homeworkData.createdById = request.user_id;
            if (request.assign_to.toLowerCase() == 'class')
                homeworkData.sectionId = id;
            else if (request.assign_to.toLowerCase() == 'group')
                homeworkData.sectionId = request.section_id;
            var homeworkid = '';
            Homework.upsert(homeworkData, function (err, response) {
                if (err) {
                    Homework.errMessage(cb);
                }
                else {

                    if (request.type.toLowerCase() == 'homework') {
                        var Subject = Homework.app.models.subject;
                        Subject.findById(request.subject_id, function (err, subjectdetail) {
                            notificationsubjectname = subjectdetail.subject_name;
                            notificationhometitle = request.title;

                            if (request.homework_id == '') {
                                homeworkid = response.id;
                            }
                            else if (request.homework_id != '' && loopcount == 0) {
                                homeworkid = request.homework_id;
                            }
                            else if (request.homework_id != '' && loopcount != undefined && loopcount > 0) {
                                homeworkid = response.id;
                            }
                            // Homework.getHomeworkSection(request.subject_id).then(function (sectiondata) {

                            // if (err) {
                            // Homework.errMessage(cb);
                            //}
                            //else {
                            if (request.assign_to.toLowerCase() == 'group') {
                                var GroupUser = Homework.app.models.groups;
                                var sendobj = { 'group_id': id, 'user_type': 'Student' }
                                GroupUser.assignedgroupbyid(sendobj, function (err, userdata) {
                                    if (userdata.length == 0) {
                                        Homework.errMessage(cb);
                                    }
                                    else {
                                        Homework.addStudentHomework(userdata, homeworkid,'group' ,cb).then(function (response) {
                                            resolve(response)

                                        })

                                    }

                                });

                            }
                            else {
                                Homework.getStudentList(request.subject_id, request.session_id, id, cb).then(function (userdata) {
                                    if (userdata.length == 0) {
                                        Homework.errMessage(cb);
                                    }
                                    else {
                                        Homework.addStudentHomework(userdata, homeworkid,'homework', cb).then(function (response) {
                                            resolve(response)

                                        })

                                    }

                                });
                            }
                            //}

                            // });
                        });
                    }
                    else {
                        resolve(response)
                    }
                }


            });

        });
    }

    Homework.getHomeworkSubjectDetails = function (subjectId) {
        return new Promise(function (resolve, reject) {

            var Subject = Homework.app.models.subject;
            Subject.findById(subjectId, function (err, subjectdata) {

                resolve(subjectdata);
            })
        });
    }


    Homework.getHomeworkRemarkCount = function (homeworkId) {
        return new Promise(function (resolve, reject) {
            var submittedHomework = Homework.app.models.submitted_homework;
            var filter = { "homeworkId": homeworkId };
            submittedHomework.find(
                { where: filter }
                , function (err, submitdata) {
                    resolve(submitdata);
                });

        });

    }
    Homework.getStudentHomeworkDetail = function (user_id, homeworkId, cb) {
        return new Promise(function (resolve, reject) {
            var SubmittedHomework = Homework.app.models.submitted_homework;
            SubmittedHomework.find({
                where: {
                    userId: user_id, homeworkId: homeworkId
                }
            },
                function (err, response) {
                    if (err) {
                        Homework.errMessage(cb);
                    }
                    else {
                        resolve(response);
                    }

                });

        });

    };
    Homework.getStudentHomeworkDetails = function (homeworkId) {
        return new Promise(function (resolve, reject) {
            var Student = Homework.app.models.student;
            var UserSections = Homework.app.models.user_sections;
            var SubmittedHomework = Homework.app.models.submitted_homework;
            var StudentHomework = Homework.app.models.student_homework;
            StudentHomework.find({
                where: { homeworkId: homeworkId }
            }, function (err, response) {


                var user_arr = [];
                response.forEach(function (stuid) {
                    user_arr.push(stuid.userId);
                })
                Student.find({
                    where: {
                        userId: { inq: user_arr }
                    }
                },
                    function (err, studentdata) {
                        UserSections.find({
                            where: {
                                userId: { inq: user_arr }
                            }
                        },
                            function (err, usersectiondata) {
                                SubmittedHomework.find({
                                    where: {
                                        userId: { inq: user_arr }, homeworkId: homeworkId
                                    }
                                },
                                    function (err, submitdata) {
                                        var studentHomeObarr = [];
                                        var counter = 0;
                                        studentdata.forEach(function (finaldata) {
                                            var studentHomeObj = {};
                                            studentHomeObj.name = finaldata.name;
                                            studentHomeObj.user_id = finaldata.userId;
                                            studentHomeObj.admission_no = finaldata.admission_no;
                                            studentHomeObj.homework_id = homeworkId;
                                            var tempflag = false;
                                            studentHomeObj.submitted_date = '';
                                            studentHomeObj.remark_date = '';
                                            studentHomeObj.roll_no = usersectiondata[counter].roll_no;
                                            counter++;
                                            submitdata.forEach(function (finalsbtdata) {
                                                if (finalsbtdata.userId == finaldata.userId) {
                                                    tempflag = true;
                                                    studentHomeObj.submitted_date = dateFormat(finalsbtdata.submitted_date, "yyyy-mm-dd");
                                                    studentHomeObj.remark_date = finalsbtdata.remark_date == null ? '' : dateFormat(finalsbtdata.remark_date, "yyyy-mm-dd");
                                                }
                                                if (!tempflag) {
                                                    studentHomeObj.submitted_date = '';
                                                    studentHomeObj.remark_date = '';
                                                }
                                            })
                                            studentHomeObarr.push(studentHomeObj);
                                        })
                                        resolve(studentHomeObarr);

                                    });


                            });
                    });



            })


        });

    }
    Homework.errMessage = function (cb) {

        errorMessage.status = "201";
        errorMessage.message = "Error Occurred";
        return cb(null, errorMessage);


    }
    Homework.validateCheck = function (callfrom, req, cb) {
        switch (callfrom) {
            case "list":
                if (req.user_id == undefined || req.user_id == '' || req.user_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "User id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.school_id == undefined || req.school_id == '' || req.school_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "School id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.from_date != undefined && req.from_date != '' && req.to_date == '') {
                    errorMessage.status = "201";
                    errorMessage.message = "To Date can't blank";
                    return cb(null, errorMessage);
                }
                if (req.to_date != undefined && req.to_date != '' && req.from_date == '') {
                    errorMessage.status = "201";
                    errorMessage.message = "From Date can't blank";
                    return cb(null, errorMessage);
                }
                break;
            case "studenthomework":
                if (req.user_id == undefined || req.user_id == '' || req.user_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "User id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.search_for != undefined && req.search_for != '') {
                    if (req.from_date == undefined || req.from_date == '') {
                        errorMessage.status = "201";
                        errorMessage.message = "From date can't blank";
                        return cb(null, errorMessage);
                    }
                    if (req.to_date == undefined || req.to_date == '') {
                        errorMessage.status = "201";
                        errorMessage.message = "To date can't blank";
                        return cb(null, errorMessage);
                    }
                }
                if (req.search_for == undefined || req.search_for == '') {
                    if ((req.from_date != undefined && req.from_date != '') || (req.to_date != undefined && req.to_date != '')) {
                        errorMessage.status = "201";
                        errorMessage.message = "Search for can't blank";
                        return cb(null, errorMessage);
                    }
                }
                break;



            case "detail":
                if (req.homework_id == undefined || req.homework_id == '' || req.homework_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Homework id can't blank";
                    return cb(null, errorMessage);
                }
                break;
            case "draft":
                if (req.user_id == undefined || req.user_id == '' || req.user_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "User id can't blank";
                    return cb(null, errorMessage);
                }
                if ((req.draft_id == undefined || req.draft_id == '' || req.draft_id == null) && (req.school_id == undefined || req.school_id == '' || req.school_id == null)) {
                    errorMessage.status = "201";
                    errorMessage.message = "School id can't blank";
                    return cb(null, errorMessage);
                }
                break;
            case "discard":
                if (req.homework_id == undefined || req.homework_id == '' || req.homework_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Homework id can't blank";
                    return cb(null, errorMessage);
                }
                break;
            case "submitncheck":
                if (req.homework_id == undefined || req.homework_id == '' || req.homework_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Homework id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.user_id == undefined || req.user_id == '' || req.user_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "User id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.check_uncheck == undefined || req.check_uncheck == '' || req.check_uncheck == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Check/Uncheck  can't blank";
                    return cb(null, errorMessage);
                }
                break;
            case "remarkdetail":
                if (req.homework_id == undefined || req.homework_id == '' || req.homework_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Homework id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.user_id == undefined || req.user_id == '' || req.user_id == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "User id can't blank";
                    return cb(null, errorMessage);
                }

                break;


        }

    }


    Homework.getClassSection = function (sectionid) {
        return new Promise(function (resolve, reject) {

            var Section = Homework.app.models.section;
            Section.findById(sectionid, function (err, sectiondata) {

                resolve(sectiondata);
            })

        });

    }

    Homework.getStudentList = function (subject_id, session_id, id, cb) {
        return new Promise(function (resolve, reject) {

            var UserSubject = Homework.app.models.user_subject;
            var inputdata = { sectionId: [id], user_type: 'Student', subjectId: subject_id, sessionId: session_id };
            UserSubject.subjectusers(inputdata, function (err, usrsectiondata) {
                if (usrsectiondata.length == 0) {
                    Homework.errMessage(cb);
                }
                else {

                    resolve(usrsectiondata);
                }


            });
        });
    }

    Homework.addStudentHomework = function (list, homework_id,assignType, cb) {
        return new Promise(function (resolve, reject) {
            if (list.length == 0) {
                Homework.errMessage(cb);
            }
            else {
                var studentHomework = Homework.app.models.student_homework;
                var studenthomeworkArr = [];
                list.forEach(function (studentuserid) {
                    if((assignType.toLowerCase() == 'group') ||( (assignType.toLowerCase() == 'homework' && studentuserid.user()))){
                    Homework.addNotificationList(studentuserid.userId, homework_id, 'New Homework', notificationsubjectname + " : " + notificationhometitle);
                    var studenthomeworkData = {};
                    studenthomeworkData.userId = studentuserid.userId;
                    studenthomeworkData.homeworkId = homework_id;
                    studenthomeworkArr.push(studenthomeworkData);
                    studentHomework.upsert(studenthomeworkData, function (err, response) {
                        if (err) {
                            Homework.errMessage(cb);
                        }
                        else {
                            resolve(response);
                        }

                    })
                }


                });



            }

        });
    }

    Homework.addNotificationList = function (userid, homework_id, title, notificationtext) {
        var notificationobj = {};
        notificationobj.user_id = userid;
        notificationobj.module_key_id = homework_id;
        notificationobj.type = 4;
        notificationobj.title = title;
        notificationobj.notification_text = notificationtext;
        notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
        notificationarr.push(notificationobj);
    }
    Homework.discard = function (req, cb) {
        Homework.validateCheck('discard', req, cb);
        var Oauthtoken = Homework.app.models.oauthaccestoken;
       
                Homework.destroyById(req.homework_id, function (err, response) {
                    if (err) {
                        Homework.errMessage(cb);
                    }
                    else {

                        successMessage.status = "200";
                        successMessage.message = "Discard successfully";
                        cb(null, successMessage);

                    }
                });
          

    }
    Homework.homeworksubmitandcheck = function (req, cb) {
        Homework.validateCheck('submitncheck', req, cb);
        var Oauthtoken = Homework.app.models.oauthaccestoken;
        notificationarr = [];
       
                var allusers = req.user_id.split(',');
                var chkunchk = req.check_uncheck.split(',');
                var homework_id = req.homework_id;
                var promises = [];
                var counter = 0;
                var remark = '';
                var content = '';
                var teacher_name = '';
                var homework_title = '';
                if (req.content != undefined)
                    content = req.content;
                if (req.remark != undefined) {
                    remark = req.remark;
                }
                Homework.findById(homework_id, function (err, detail) {
                    homework_title = detail.title;
                    var Staff = Homework.app.models.staff;
                    Staff.find({
                        where: { userId: detail.userId }
                    }, function (err, staffdata) {
                        teacher_name = staffdata[0].name;



                        allusers.forEach(function (userid) {
                            promises.push(Homework.homeworksubmitandcheckexecute(detail.userId, userid, homework_id, homework_title, chkunchk[counter], remark, content, [], cb));
                            if (chkunchk[counter] == 1 || chkunchk[counter] == "1") {
                                let passtext = "<" + teacher_name + "> has checked your homework <" + homework_title + ">";
                                Homework.addNotificationList(userid, homework_id, 'Homework Remark', passtext);
                            }
                            counter++;
                        });
                        Promise.all(promises).then(function (final) {
                            if (notificationarr.length > 0) {
                                Homework.setParentNotification(notificationarr);
                                if(constantval.SYNC_PROCESS=='1')
                                    {
                                    var SyncDetail = Homework.app.models.syncdetail;
                                    SyncDetail.adddetail(4,notificationarr);
                                    }

                            }
                            successMessage.status = "200";
                            if (remark == '') {
                                successMessage.message = "Homework submitted/checked successfully";
                            }
                            else {
                                successMessage.message = "Homework checked successfully";
                            }
                            cb(null, successMessage);
                        });
                    })
                })
          

    };
    Homework.homeworksubmitandcheckexecute = function (teacher_user_id, user_id, homeworkId, title, chkunchk, remarkdta, content, file_path, cb) {
        return new Promise(function (resolve, reject) {
            var c = new Class();



            var filepath = '';
            if (file_path.length > 0) {
                for (var m = 0; m < file_path.length; m++) {

                    c.__addAttr__(m, "integer", file_path[m], "string");

                }
                filepath = serialize(c, "array");
            }
            var SubmittedHomework = Homework.app.models.submitted_homework;
            SubmittedHomework.find({
                where: {
                    userId: user_id, homeworkId: homeworkId
                }
            },
                function (err, response) {
                    if (err) {
                        Homework.errMessage(cb);
                    }
                    else {
                        var submitncheckdata = {};
                        if (response.length > 0) {
                            submitncheckdata.id = response[0].id;

                        }
                        else {
                            submitncheckdata.submitted_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                            submitncheckdata.homeworkId = homeworkId;
                            submitncheckdata.userId = user_id;
                            submitncheckdata.attachment = filepath;
                            submitncheckdata.content = content;
                            var notificationobj = {};
                            notificationobj.user_id = teacher_user_id;
                            notificationobj.module_key_id = homeworkId;
                            notificationobj.type = 4;
                            notificationobj.title = "Student Homework Submit";
                            notificationobj.notification_text = "Student has submit homework ( " + title + " )";
                            notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                            notificationarr.push(notificationobj);
                        }
                        if (chkunchk == 1 || chkunchk == '1') {

                            submitncheckdata.remark_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                        }


                        submitncheckdata.teacher_remark = remarkdta;
                        SubmittedHomework.upsert(submitncheckdata, function (err, response) {
                            if (err) {
                                Homework.errMessage(cb);
                            }
                            else {
                                resolve(response);
                            }
                        })
                    }

                });
        });

    };
    Homework.homeworksubmitandremarkdetail = function (req, cb) {
        Homework.validateCheck('remarkdetail', req, cb);
        var Oauthtoken = Homework.app.models.oauthaccestoken;
        
                var user_id = req.user_id;
                var homework_id = req.homework_id;
                var promises = [];
                var data = {};
                var allobject = {};
                Homework.findById(homework_id, function (err, returnval) {
                    allobject.creation_date = dateFormat(returnval.created_date, "yyyy-mm-dd");
                    allobject.target_date = dateFormat(returnval.submission_date, "yyyy-mm-dd");
                    allobject.title = returnval.title;
                    allobject.user_id = returnval.userId;
                    allobject.content = returnval.content;
                    var attch = [];
                    if (returnval.attachment == '') {
                        allobject.attachments = attch;
                    }
                    else {
                        var DataUnserileRst = unserialize(returnval.attachment);

                        for (var key in DataUnserileRst.__attr__) {

                            attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);

                        }
                        allobject.attachments = attch;

                    }

                    promises.push(
                        Homework.getHomeworkSubjectDetails(returnval.subjectId).then(function (dataval) {


                            //dataval = JSON.parse(dataval);
                            allobject.subject_name = dataval.subject_name;




                        }),
                        Homework.getTeacherDetail(returnval.userId, cb).then(function (dataval) {
                            allobject.teacher_name = dataval[0].name;
                            allobject.teacher_image = dataval[0].profile_image?constantval.PROJECT_NAME + "/" +dataval[0].profile_image:'';

                            data.teacher_homework_detail = allobject;
                        }),
                        Homework.getStudentDetail(user_id, cb).then(function (dataval) {
                            if (dataval.length > 0) {
                                data.student_name = dataval[0].name;
                                if (dataval[0].student_photo != null && dataval[0].student_photo != '') {
                                    data.student_image = constantval.PROJECT_NAME + "/" +dataval[0].student_photo;
                                }
                                else {
                                    data.student_image = '';
                                }
                            }
                        }),
                        Homework.getStudentHomeworkDetail(user_id, homework_id, cb).then(function (response) {
                            var allobjectnew = {};
                            if (response.length > 0) {

                                allobjectnew.submitted_date = dateFormat(response[0].submitted_date, "yyyy-mm-dd");
                                allobjectnew.submitted_content = response[0].content;
                                var attch = [];
                                if (response[0].attachment == '') {
                                    allobjectnew.submitted_attachment = attch;
                                }
                                else {
                                    var DataUnserileRst = unserialize(response[0].attachment);

                                    for (var key in DataUnserileRst.__attr__) {

                                        attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);

                                    }
                                    allobjectnew.submitted_attachment = attch;

                                }
                                allobjectnew.remark_content = response[0].teacher_remark;
                                if (response[0].remark_date != null)
                                    allobjectnew.remark_date = dateFormat(response[0].remark_date, "yyyy-mm-dd");
                                else
                                    allobjectnew.remark_date = '';
                            }
                            data.submit_remark_detail = allobjectnew;




                        }));

                    Promise.all(promises).then(function (final) {
                        successMessage.status = "200";
                        successMessage.message = "Information Fetched Successfully";
                        cb(null, successMessage, data);
                    });
                });

           

    };

    Homework.draft = function (req, cb) {


        var user_id = req.user_id;
        var draft_id = req.draft_id;
        var data = {};
        var assignmentDetailArr = [];
        var where_condition = {};
        var classsec_where_condition = {};
        var subject_where_condition = {};
        var date_where_condition = {};
        var date_where_condition = {};
        successMessage.status = "200";
        successMessage.message = "Information Fetched Successfully.";
        var Oauthtoken = Homework.app.models.oauthaccestoken;
        Homework.validateCheck('draft', req, cb);
        
                if (draft_id != undefined && draft_id != '') {
                    where_condition.where = {
                        and: [{ type: 'draft' },
                        { id: draft_id }, { userId: user_id }
                        ]
                    };

                }
                else {
                    if (req.from_date && req.to_date) {
                        where_condition.where = {
                            and: [
                                { created_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                                { created_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                                { type: 'draft', userId: req.user_id }
                            ]
                        }
                    }
                    else {
                        where_condition.where = { type: 'draft', userId: user_id };
                    }
                }

                Homework.find({
                    include: [{
                        relation: "createdForSubject",
                        scope: {
                            fields: ['schoolId', 'subject_name', 'subject_icon'],
                            //where: { schoolId: req.school_id },
                        }

                    },
                    {
                        relation: "homework_section",
                        scope: {
                            fields: ['schoolId', 'section_name', 'classId'],
                            where: { schoolId: req.school_id },
                        }

                    }],
                    where: where_condition.where,
                    order: 'created_date desc',
                }, function (err, response) {
                    if (err) {
                        Homework.errMessage(cb);
                    }
                    else {
                        if (response.length > 0) {
                            var homeworkid = [];

                            response.forEach(function (responsedata) {
                                if (responsedata.createdForSubject()) {

                                    if (responsedata.type.toLowerCase() == 'draft') {
                                        var allobject = {};
                                        allobject.homework_id = responsedata.id;
                                        allobject.homework_title = responsedata.title;
                                        allobject.homework_content = responsedata.content;
                                        allobject.type = responsedata.type;
                                        allobject.added_date = dateFormat(responsedata.created_date, "yyyy-mm-dd HH:MM:ss");
                                        allobject.added_date_app = dateFormat(responsedata.created_date, "isoDateTime");
                                        allobject.displayTime = Date.parse(today) == Date.parse(dateFormat(responsedata.created_date, "yyyy-mm-dd"))?'1':'0';
                                        allobject.target_date = dateFormat(responsedata.submission_date, "yyyy-mm-dd HH:MM:ss");
                                        allobject.target_date_app = dateFormat(responsedata.submission_date, "isoDateTime");
                                        allobject.draft_data = JSON.parse(responsedata.draft_data);
                                        var classSubUnqId = '';
                                        var attch = [];
                                        if (responsedata.attachment == '') {
                                            allobject.attachment_count = 0;
                                        }
                                        else {
                                            var DataUnserileRst = unserialize(responsedata.attachment);

                                            for (var key in DataUnserileRst.__attr__) {

                                                allobject.attachment_count = 1;
                                                attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);

                                            }



                                        }
                                        allobject.attachments = attch;
                                        allobject.subject_name = responsedata.createdForSubject().subject_name;
                                        allobject.subject_image = responsedata.createdForSubject().subject_icon;
                                        allobject.subject_id = responsedata.createdForSubject().id;
                                        allobject.class_section_name = responsedata.homework_section().section_name;
                                        allobject.class_id = responsedata.homework_section().classId;
                                        allobject.section_id = responsedata.homework_section().id;
                                        if (req.class_id && req.class_id == allobject.class_id && !req.section_id && !req.subject_id) {
                                            assignmentDetailArr.push(allobject);
                                        }
                                        else if (req.class_id && req.class_id == allobject.class_id && req.section_id && req.section_id == allobject.section_id && !req.subject_id) {
                                            assignmentDetailArr.push(allobject);
                                        }
                                        else if (req.class_id && req.class_id == allobject.class_id && req.section_id && req.section_id == allobject.section_id && req.subject_id && req.subject_id == allobject.subject_id) {
                                            assignmentDetailArr.push(allobject);
                                        }
                                        else if (!req.class_id && !req.section_id && !req.subject_id) {
                                            assignmentDetailArr.push(allobject);
                                        }





                                    }

                                }
                            });

                            var finalDetailArr = [];
                            if (draft_id != undefined && draft_id != '') {
                                cb(null, successMessage, assignmentDetailArr[0]);
                            }
                            else {


                                finalDetailArr = assignmentDetailArr;

                                var archivedSort = arraySort(finalDetailArr, 'homework_id', { reverse: true });
                                assignmentDetailArr = [];
                                assignmentDetailArr = archivedSort;
                                cb(null, successMessage, assignmentDetailArr);
                            }


                        }
                        else {
                            cb(null, successMessage, assignmentDetailArr);
                        }
                    }

                });

           

    }
    Homework.homeworkdetail = function (req, cb) {


        var homework_id = req.homework_id;
        var data = {};
        var assignmentDetailArr = [];
        successMessage.status = "200";
        successMessage.message = "Information Fetched Successfully.";
        var Oauthtoken = Homework.app.models.oauthaccestoken;
        Homework.validateCheck('detail', req, cb);
       
                var promises = [];
                var allobject = {};
                Homework.findById(homework_id, function (err, returnval) {
                    allobject.creation_date = dateFormat(returnval.created_date, "yyyy-mm-dd");
                    allobject.target_date = dateFormat(returnval.submission_date, "yyyy-mm-dd");
                    allobject.title = returnval.title;
                    allobject.content = returnval.content;
                    allobject.class_section_subject_id = returnval.subjectId;
                    var attch = [];
                    if (returnval.attachment == '') {
                        allobject.attachments = attch;
                    }
                    else {
                        var DataUnserileRst = unserialize(returnval.attachment);

                        for (var key in DataUnserileRst.__attr__) {

                            attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);

                        }
                        allobject.attachments = attch;

                    }
                    promises.push(Homework.getClassSection(returnval.sectionId).then(function (sectiondata) {

                        // sectiondata = JSON.parse(sectiondata);
                        allobject.class_section_name = sectiondata.section_name;



                    }),
                        Homework.getHomeworkSubjectDetails(returnval.subjectId).then(function (retrnsub) {


                            //retrnsub = JSON.parse(retrnsub);
                            allobject.subject = retrnsub.subject_name;
                            data.homework_detail = allobject;


                        }),
                        Homework.getStudentHomeworkDetails(homework_id).then(function (studentdata) {
                            var stuarray = [];

                            data.student_detail = studentdata;



                        })


                    );
                    Promise.all(promises).then(function (final) {
                        cb(null, successMessage, data);
                    });
                })


            

    }

    Homework.studenthomework = function (req, cb) {
        var User = Homework.app.models.user;


        var user_id = req.user_id;
        var sectionId = req.section_id;
        var assignmentDetailArr = [];
        successMessage.status = "200";
        successMessage.message = "Information Fetched Successfully.";
        var Oauthtoken = Homework.app.models.oauthaccestoken;
        Homework.validateCheck('studenthomework', req, cb);
        var subject_id = [];
        var where_condition = {};

        if (subject_id.length == 0) {
            // subject_id = '';
        }
        if (req.search_for != undefined && req.search_for != '') {
            if (req.search_for.toLowerCase() == 'assignment') {

            }
        }

       
                var StudentHomework = Homework.app.models.student_homework;
                StudentHomework.find({
                    where: {
                        userId: user_id
                    }
                },
                    function (err, response) {
                        if (err) {
                            Homework.errMessage(cb);
                        }
                        else {
                            if (response.length > 0) {
                                var homearr = [];
                                response.forEach(function (data) {
                                    homearr.push(data.homeworkId);
                                });
                                if (req.subject_id != undefined && req.subject_id != '') {
                                    subject_id = req.subject_id.split(",");
                                    if (req.from_date != undefined && req.from_date != '' && req.to_date != undefined && req.to_date != '') {
                                        if (req.search_for.toLowerCase() == 'assignment') {
                                            where_condition.where = {
                                                and: [
                                                    { created_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                                                    { created_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                                                    { id: { inq: homearr } },
                                                    { subjectId: { inq: subject_id } }
                                                ]
                                            };
                                        }
                                        if (req.search_for.toLowerCase() == 'submit') {
                                            where_condition.where = {
                                                and: [
                                                    { submission_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                                                    { submission_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                                                    { id: { inq: homearr } },
                                                    { subjectId: { inq: subject_id } }
                                                ]
                                            };
                                        }
                                    }
                                    else {
                                        where_condition.where = {
                                            and: [

                                                { id: { inq: homearr } },
                                                { subjectId: { inq: subject_id } }
                                            ]
                                        };
                                    }


                                }
                                else if (req.from_date != undefined && req.from_date != '' && req.to_date != undefined && req.to_date != '') {
                                    if (req.subject_id != undefined && req.subject_id != '') {
                                        subject_id = req.subject_id.split(",");
                                        if (req.search_for.toLowerCase() == 'assignment') {
                                            where_condition.where = {
                                                and: [
                                                    { created_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                                                    { created_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                                                    { id: { inq: homearr } },
                                                    { subjectId: { inq: subject_id } }
                                                ]
                                            };
                                        }
                                        if (req.search_for.toLowerCase() == 'submit') {
                                            where_condition.where = {
                                                and: [
                                                    { submission_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                                                    { submission_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                                                    { id: { inq: homearr } },
                                                    { subjectId: { inq: subject_id } }
                                                ]
                                            };
                                        }
                                    }
                                    else {
                                        if (req.search_for.toLowerCase() == 'assignment') {
                                            where_condition.where = {
                                                and: [
                                                    { created_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                                                    { created_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                                                    { id: { inq: homearr } }
                                                ]
                                            };
                                        }
                                        if (req.search_for.toLowerCase() == 'submit') {
                                            where_condition.where = {
                                                and: [
                                                    { submission_date: { gte: dateFormat(req.from_date, "isoDateTime") } },
                                                    { submission_date: { lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59") } },
                                                    { id: { inq: homearr } }
                                                ]
                                            };
                                        }
                                    }
                                }
                                else {
                                    where_condition.where = {
                                        and:[
                                            { sectionId : sectionId},
                                            { id: { inq: homearr }}
                                        ]
                                    };
                                }

                                Homework.find({
                                    where: where_condition.where
                                },
                                    function (err, homedatadata) {
                                        if (err) {
                                            Homework.errMessage(cb);
                                        }
                                        else {
                                            var promises = [];
                                            homedatadata.forEach(function (responsedata) {
                                                if (responsedata.type.toLowerCase() == 'homework') {
                                                    var allobject = {};
                                                    allobject.homework_id = responsedata.id;
                                                    allobject.homework_title = responsedata.title;
                                                    allobject.homework_content = responsedata.content;
                                                    allobject.type = responsedata.type;
                                                    allobject.subject_id = responsedata.subjectId;
                                                    //console.log(responsedata.created_date.toISOString().replace('Z', ' ').replace('T', ' ').replace('.000',''));
                                                    allobject.added_date = dateFormat(responsedata.created_date, "yyyy-mm-dd HH:MM:ss");
                                                    allobject.added_date_app = dateFormat(responsedata.created_date, "isoDateTime");
                                                    allobject.displayTime = Date.parse(today) == Date.parse(dateFormat(responsedata.created_date, "yyyy-mm-dd"))?'1':'0';
                                                    allobject.target_date = dateFormat(responsedata.submission_date, "yyyy-mm-dd HH:MM:ss");
                                                    allobject.target_date_app = dateFormat(responsedata.submission_date, "isoDateTime");
                                                    var currentdate = dateFormat(Date(), "yyyy-mm-dd");

                                                    var classSubUnqId = '';

                                                    if (responsedata.attachment == '') {
                                                        allobject.attachment_count = 0;
                                                    }
                                                    else {
                                                        var DataUnserileRst = unserialize(responsedata.attachment);

                                                        for (var key in DataUnserileRst.__attr__) {

                                                            allobject.attachment_count = 1;

                                                        }

                                                    }


                                                    promises.push(
                                                        Homework.getStudentHomeworkDetail(user_id, responsedata.id, cb).then(function (data) {

                                                            allobject.submitted = 0;
                                                            allobject.submitted_date = '';
                                                            allobject.checked = 0;
                                                            if (Date.parse(currentdate) > Date.parse(dateFormat(responsedata.submission_date, "yyyy-mm-dd"))) {
                                                                allobject.lateflag = true;
                                                            }
                                                            else {
                                                                allobject.lateflag = false;
                                                            }
                                                            
                                                            if (data.length > 0) {
                                                                allobject.submitted_date = dateFormat(data[0].submitted_date, "yyyy-mm-dd");
                                                                allobject.submitted = 1;
                                                                allobject.lateflag = false;
                                                                if (data[0].remark_date != null)
                                                                    allobject.checked = 1;
                                                            }




                                                        }),
                                                        Homework.getHomeworkSubjectDetails(responsedata.subjectId).then(function (data) {


                                                            //data = JSON.parse(data);
                                                            allobject.subject_name = data.subject_name;
                                                            allobject.subject_image = data.subject_icon;




                                                        }),
                                                        Homework.getTeacherDetail(responsedata.userId, cb).then(function (data) {
                                                            allobject.teacher_name = data[0].name;
                                                            assignmentDetailArr.push(allobject);

                                                        })

                                                    );

                                                }

                                            });
                                            Promise.all(promises).then(function (data) {
                                                var archivedSort = arraySort(assignmentDetailArr, 'homework_id', { reverse: true });
                                                assignmentDetailArr = [];
                                                assignmentDetailArr = archivedSort;
                                                cb(null, successMessage, assignmentDetailArr);
                                            });
                                        }

                                    });
                            }
                            else {
                                cb(null, successMessage, assignmentDetailArr);
                            }
                        }

                    });
            

    }
    Homework.getTeacherDetail = function (teacher_user_id, cb) {
        return new Promise(function (resolve, reject) {
            var Staff = Homework.app.models.staff;

            Staff.find({
                where: {
                    userId: teacher_user_id
                }
            }, function (err, response) {
                if (err) {
                    Homework.errMessage(cb);
                }
                else {
                    resolve(response);
                }

            });
        });
    }
    Homework.getStudentDetail = function (student_user_id, cb) {
        return new Promise(function (resolve, reject) {
            var Student = Homework.app.models.student;

            Student.find({
                where: {
                    userId: student_user_id
                }
            }, function (err, response) {
                if (err) {
                    Homework.errMessage(cb);
                }
                else {
                    resolve(response);
                }

            });
        });
    }


    Homework.setParentNotification = function (notiarr) {
        let tempuserids = [];
        let homeworkid = notiarr[0].module_key_id;
        let title = notiarr[0].title;
        let notification_text = notiarr[0].notification_text;
        let counter = 0;
        for (let key in notiarr) {
            tempuserids.push(notiarr[key].user_id); counter++;
        }
        var Student = Homework.app.models.student;
        Student.find({
            fields: ["parentId"],
            where: {
                userId: { inq: tempuserids }
            }
        },
            function (err, studentdata) {
                tempuserids = [];
                for (let key in studentdata) {
                    tempuserids.push(studentdata[key].parentId);
                }
                var Parent = Homework.app.models.parent;
                Parent.find({
                    fields: ["userId"],
                    where: {
                        id: { inq: tempuserids }
                    }
                },
                    function (err, parentdata) {
                        for (let key in parentdata) {
                            Homework.addNotificationList(parentdata[key].userId, homeworkid, title, notification_text);
                        }
                        var Notification = Homework.app.models.notification;
                        Notification.pushnotification(notificationarr);
                    })
            });

    }

    Homework.remoteMethod(
        'homework',
        {
            http: { verb: 'post' },
            description: 'get Teacher homework lists',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );
    Homework.remoteMethod(
        'studenthomework',
        {
            http: { verb: 'post' },
            description: 'get Student homework lists',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );
    Homework.remoteMethod(
        'homeworkdetail',
        {
            http: { verb: 'post' },
            description: 'get homework detail',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );

    Homework.remoteMethod(
        'draft',
        {
            http: { verb: 'post' },
            description: 'get homework draft lists',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );
    Homework.remoteMethod(
        'discard',
        {
            http: { verb: 'post' },
            description: 'Discard Draft homework',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );
    Homework.remoteMethod(
        'homeworksubmitandcheck',
        {
            http: { verb: 'post' },
            description: 'Homework submit and check',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );
    Homework.remoteMethod(
        'homeworksubmitandremarkdetail',
        {
            http: { verb: 'post' },
            description: 'Homework remark,submit detail',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );

    Homework.remoteMethod(
        'createhomework',
        {

            description: 'Create homework',
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } },
                { arg: 'options', type: 'object', http: { source: 'query' } },
            ],
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }],
            http: { verb: 'post' }
        }
    );
    Homework.remoteMethod(
        'studenthomeworksubmit',
        {

            description: 'Student homework submit',
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } },
                { arg: 'options', type: 'object', http: { source: 'query' } },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: { verb: 'post' }
        }
    );


    Homework.gethomeworkbystaffsectionsub = function (data, cb) {
        Homework.find({
            where: { id: data.id, subjectId: data.subject_id, userId: data.user_id, sectionId: data.section_id }
        }, (err, res) => {
            let data = {};
            if (err) {
                data.message = 'Error';
                data.assignedHomework = [];
                return cb(null, data);
            } else {
                if (res.length == 0) {
                    data.message = 'No record found';
                    data.assignedHomework = res;
                    return cb(null, data);
                } else {
                    data.message = 'Record found';
                    var homeworkSort = arraySort(res, 'id', { reverse: true });
                    data.assignedHomework = homeworkSort;
                    return cb(null, data);
                }
            }
        });
    }



    Homework.remoteMethod(
        'gethomeworkbystaffsectionsub',
        {
            http: { path: '/gethomeworkbystaffsectionsub', verb: 'post' },
            description: 'get homework by staff section subject wise',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
};
