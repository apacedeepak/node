'use strict';
var async = require("async");
var dateFormat = require('dateformat');
var constantval = require('./constant');
var DataSource = require('loopback-datasource-juggler').DataSource;
module.exports = function (Syncdata) {
    var Homework, StudentHomework, SubmittedHomeWork, SyncDetail;
    Syncdata.sendhometoserver = function (homeobj, syncid, syncdata_id) {
        //console.log(constantval.SERVER_DB_CONFIG);
        //console.log(Syncdata.app.dataSources.mysqlolddb);return;
        Syncdata.setserverdatasource();

        SyncDetail = Syncdata.app.models.syncdetail;
        if (syncid > 0) {
            Syncdata.removeallhomework(syncid).then(function (response) {

            });
        }
        let insertobj = {
            subjectId: homeobj.subjectId,
            sectionId: homeobj.sectionId,
            title: homeobj.title,
            content: homeobj.content,
            attachment: homeobj.attachment,
            submission_date: homeobj.submission_date,
            created_date: homeobj.created_date,
            origin: homeobj.origin,
            channel: homeobj.channel,
            type: homeobj.type,
            draft_data: homeobj.draft_data,
            userId: homeobj.userId,
            timestamp: homeobj.timestamp,
            createdById: homeobj.createdById
        }


        Homework.upsert(insertobj, function (err, output) {
            if (err) {

            }
            else {
                let lastinsertid = output.id;
                let homeAssignCount = homeobj.homework_assign().length;
                let homeSubmitCount = homeobj.homework_submit().length;
                let homeAssignResCount = 0;
                let homeSubmitResCount = 0;

                async.parallel([
                    function (callback) {

                        for (let key in homeobj.homework_assign()) {
                            let insertobj = {
                                homeworkId: lastinsertid,
                                userId: homeobj.homework_assign()[key].userId
                            };
                            StudentHomework.upsert(insertobj, function (err, outputfinal) {
                                if (key == homeAssignCount - 1) {
                                    callback(null);
                                }
                            })
                        }

                    },
                    function (callback) {
                        if (homeobj.homework_submit().length == 0)
                            callback(null, 'success');
                        for (let key in homeobj.homework_submit()) {
                            let insertobj = {
                                homeworkId: lastinsertid,
                                userId: homeobj.homework_submit()[key].userId,
                                attachment: homeobj.homework_submit()[key].attachment,
                                content: homeobj.homework_submit()[key].content,
                                submitted_date: homeobj.homework_submit()[key].submitted_date,
                                teacher_remark: homeobj.homework_submit()[key].teacher_remark,
                                remark_date: homeobj.homework_submit()[key].remark_date,
                                remark_attachment: homeobj.homework_submit()[key].remark_attachment,
                            };
                            SubmittedHomeWork.upsert(insertobj, function (err, outputfinal) {
                                if (key == homeSubmitCount - 1) {
                                    callback(null, 'success');
                                }
                            })
                        }

                    }
                ], function (err, results) {
                    StudentHomework.find({ where: { homeworkId: lastinsertid } }, function (err, rescount) {
                        homeAssignResCount = rescount.length;
                        SubmittedHomeWork.find({ where: { homeworkId: lastinsertid } }, function (err, rescount) {
                            homeSubmitResCount = rescount.length;
                            if (homeAssignCount == homeAssignResCount && homeSubmitCount == homeSubmitResCount) {
                                let successdata = {
                                    id: lastinsertid,
                                    status: 'success'
                                }
                                let jsondata = JSON.stringify(successdata);
                                let updatedata = {
                                    id: syncdata_id,
                                    status: 1,
                                    response_data: jsondata,
                                    updated_date: dateFormat(Date(), "yyyy-mm-dd HH:MM:ss")

                                }
                                SyncDetail.upsert(updatedata, function (err, response) {
                                    Syncdata.setclientdatasource();

                                })
                            }
                            else {
                                Syncdata.removeallhomework(lastinsertid).then(function (response) {
                                    Syncdata.setclientdatasource();
                                })

                            }

                        })

                    })
                });



            }
        })
    }

    Syncdata.removeallhomework = function (homeid) {
        return new Promise(function (resolve, reject) {

            Homework.destroyAll({ id: homeid }, function (err, output) {
                StudentHomework.destroyAll({ homeworkId: homeid }, function (err, output) {
                    SubmittedHomeWork.destroyAll({ homeworkId: homeid }, function (err, output) {
                        resolve('success');
                    })
                })
            })



        })


    }
    Syncdata.setserverdatasource = function () {
       var ds = new DataSource(constantval.SERVER_CONFIG.DB_CONFIG);
        Syncdata.app.models.homework.attachTo(ds);
        Homework = Syncdata.app.models.homework;
        Syncdata.app.models.student_homework.attachTo(ds);
        StudentHomework = Syncdata.app.models.student_homework;
        Syncdata.app.models.submitted_homework.attachTo(ds);
        SubmittedHomeWork = Syncdata.app.models.submitted_homework;
    }
    Syncdata.setclientdatasource = function () {
        //ds = new DataSource(Syncdata.app.dataSources.mysqldb);
        Syncdata.app.models.homework.attachTo(Syncdata.app.dataSources.mysqldb);
       // Homework = Syncdata.app.models.homework;
        Syncdata.app.models.student_homework.attachTo(Syncdata.app.dataSources.mysqldb);
       // StudentHomework = Syncdata.app.models.student_homework;
        Syncdata.app.models.submitted_homework.attachTo(Syncdata.app.dataSources.mysqldb);
       // SubmittedHomeWork = Syncdata.app.models.submitted_homework;
    }

};
