'use strict';
var dateFormat = require('dateformat');
var request = require('request');
var rp = require('request-promise');
var constantval = require('./constant');
var Dedupe = require('array-dedupe');
var arraySort = require('array-sort');
var DateDiff = require('date-diff');
var in_array = require('in-array');
var unique = require('array-unique');


module.exports = function (Studentsubjectattendance) {
    const  Studentatendance = Studentsubjectattendance;
    var notificationarr = [];
    const lecture_name = 'lecture';
    var primaryidarr = [];
    var subjectidlist = [];
    var notificationobj = {};
    Studentatendance.markattendance = (data, cb) => {
        let tempuserids = [];
        let parentids = [];
        notificationarr = [];

        let promise1 = [];
        let i = 0, gen;
        var leaveparams = {}, parms_1 = {};
        let insertflag = false;
        let insertObj = {};
        let generator, prmis;

        let studentnames = [];
        var msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
            return;
        } else if (!data.attendance_date) {
            msg.status = "201";
            msg.message = "Attendance date cannot be blank";
            cb(null, msg);
            return;
        }
        var d1 = new Date(data.attendance_date),
                d2 = new Date();

        d1.setHours(0, 0, 0, 0)
        d2.setHours(0, 0, 0, 0)
        var diff = d2 - d1;

        if (!data.user_id) {
            msg.status = "201";
            msg.message = "User id cannot be blank";
            cb(null, msg);
            return;
        } else if (diff < 0) {
            msg.status = "201";
            msg.message = "Attendance for future date is not allowed";
            cb(null, msg);
            return;
        } else if (!data.attendanceid) {
            msg.status = "201";
            msg.message = "Attendance id cannot be blank";
            cb(null, msg);
            return;
        } else if (!data.section_id) {
            msg.status = "201";
            msg.message = "Section id cannot be blank";
            cb(null, msg);
            return;
        }

//        if (data.subject_id > 0) {
//            if (!data.batch_start_time) {
//                msg.status = "201";
//                msg.message = "Batch start time cannot be blank";
//                cb(null, msg);
//                return;
//            } else if (!data.batch_end_time) {
//                msg.status = "201";
//                msg.message = "Batch end time cannot be blank";
//                cb(null, msg);
//                return;
//            }
//        }



        var leaveApplyStudent = Studentatendance.app.models.leaveApplyStudent;

        /* holiday check */
        var holiday_master = Studentatendance.app.models.holiday_master;
        var prms = {
            "section_id": data.section_id,
            "session_id": data.session_id,
            "applicable_date": dateFormat(data.attendance_date, "isoDate")
        }
        holiday_master.checkHoliday(prms, (err, res) => {
            if (err)
                throw(err);
            if (res) {
                var response = Studentatendance.validaterequest(data);
                if (response.statusCode == "201")
                {
                    return cb(null, response);
                }

                if (res.flag == 'No') {
                    msg.status = "201";
                    msg.message = "Attendance not applicable today";
                    return cb(null, msg);
                }

                if (res.flag == undefined) {
                    res.flag = 'Yes';
                }
                if (res.flag == 'Yes') {
                    if (data.user_id.length > 0) {
                        subjectidlist.length = 0;
                        var Notification = Studentatendance.app.models.notification;
                        if (data.subject_id == null || data.subject_id == '') {
                            data.subject_id = '0';
                        }
                        let attenddatei = dateFormat(data.attendance_date, "isoDate");
                        let attenddatef = dateFormat(data.attendance_date, "yyyy-mm-dd'T'23:59:59");
                        var promise = [];
                        data.user_id.forEach((userId, key) => {
                            leaveparams =
                                    {
                                        user_id: userId,
                                        session_id: data.session_id,
                                        school_id: data.school_id,
                                        attendance_date: dateFormat(data.attendance_date, "isoDate")
                                    }

                            // if(data.attendanceid.length == 0 || data.attendanceid[key] || data.subject_id > 0){  

                            insertObj = {
                                userId: userId,
                                sectionId: data.section_id,
                                sessionId: data.session_id,
                                schoolId: data.school_id,
                                subjectId: data.subject_id,
                                attendance_status: data.attendance_status[key],
                                attendance_date: dateFormat(data.attendance_date, "isoDate"),
                                added_by: data.added_by,
                                added_date: dateFormat(data.added_date, "isoDateTime")
                            };

                            if (data.attendanceid[key]) {
                                insertObj.id = data.attendanceid[key];
                            }

                            if (data.subject_id > 0) {
                                insertObj['batch_start_time'] = data.batch_start_time;
                                insertObj['batch_end_time'] = data.batch_end_time;
                                insertObj['lecture_id'] = data.lecture_id;
                            }

                            if (data.attendance_status[key] === "A")
                                subjectidlist.push(data.subject_id);
                            //  }
                            promise.push(Studentatendance.markAttendanceExecute(leaveparams, leaveApplyStudent, insertObj, data.attendance_status[key], cb));

                        })

                        Promise.all(promise).then(res2 => {
                            msg.status = "200";
                            msg.message = "Attendance marked successfully";

                            if (notificationarr !== undefined && notificationarr.length > 0) {
                                let useridfirst = notificationarr[0].user_id;
                                var UserSchool = Studentatendance.app.models.user_school;
                                UserSchool.find({
                                    fields: ["schoolId"],
                                    where: {
                                        userId: useridfirst
                                    }
                                }, function (err, userschooldata) {
                                    var SchoolData = Studentatendance.app.models.school;
                                    SchoolData.findById(userschooldata[0].schoolId, function (err, schoolname) {
                                        Studentatendance.setParentNotification(response.id, notificationarr, primaryidarr, subjectidlist, schoolname.school_code);

                                    })
                                })
                            }
                            return cb(null, msg);
                        }).catch(error => console.log(error))
                    }
                }
            }
        })
    }

    Studentatendance.promiseattend = (userId, attenddatei, attenddatef, data) => {
        return new Promise((resolve, reject) => {
            Studentatendance.find({
                fields: ["id"],
                where: {
                    userId: userId,
                    attendance_date: {between: [attenddatei, attenddatef]},
                    sessionId: data.session_id,
                    schoolId: data.school_id,
                    subjectId: data.subject_id
                }
            },
                    (err, res) => {

                if (err)
                    reject(err)
                if (res)
                    resolve(res)
            })
        }).catch(err => console.log(err));
    }

    Studentatendance.setParentNotification = function (id, notiarr, attenarr, subjectidlist, schoolcode) {
        let tempuserids = [];
        let studentnames = [];
        let sectionnames = [];
        let parentids = [];
        let user_id = [];
        let subjectnames = [];
        let counter = 0;
        let subject_name = '';
        var user_have_subjects;

        for (let key in notiarr) {
            user_id.push(notiarr[key].user_id);
            counter++;
        }

        var Student = Studentatendance.app.models.student;
        Student.find({
            include: {
                relation: "students",
                scope: {
                    include: [{
                            relation: "user_have_sections",
                        }, {
                            relation: "user_have_subjects",
                        }]
                }
            },
            where: {
                userId: {inq: user_id}
            }
        },
                (err, studentdata) => {

            tempuserids = [];
            studentnames = [];
            let studentuserid = [];

            for (let key in studentdata) {
                tempuserids.push(studentdata[key].parentId);
                studentnames.push(studentdata[key].name);
                studentuserid.push(studentdata[key].userId);

                user_have_subjects = studentdata[key].students().user_have_subjects();

                for (let key in subjectidlist) {
                    for (let key1 in user_have_subjects) {
                        if (user_have_subjects[key1].id == subjectidlist[key]) {
                            subject_name = user_have_subjects[key1].subject_name;
                        } else {
                            continue;
                        }
                    }
                }

                sectionnames.push(studentdata[key].students().user_have_sections()[0].section_name);
                subjectnames.push(subject_name);

            }

            var Parent = Studentatendance.app.models.parent;
            Parent.find({
                fields: ["userId", "father_contact"],
                where: {
                    id: {inq: tempuserids}
                }
            },
                    function (err, parentdata) {
                        parentids = [];
                        notificationarr = [];


                        for (let key in parentdata) {
                            var notificationobj = {};

                            if (studentnames[key] != '') {
                                studentnames[key] = studentnames[key].trim();
                            }

                            notificationobj.user_id = parentdata[key].userId;
                            notificationobj.module_key_id = id;
                            notificationobj.type = 6;

                            let regardsMsg = constantval.product_type.toLowerCase() == 'emscc' ? 'Regards EMSCC Team' : 'Regards ' + schoolcode;
                            notificationobj.title = "Your Student " + studentnames[key] + " is absent in " + sectionnames[key] + " -" + subjectnames[key] + ". " + regardsMsg;

                            notificationobj.notification_text = '';
                            notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");

                            notificationarr.push(notificationobj);
                            Studentsubjectattendance.sendsms(parentdata[key].father_contact, dateFormat(Date(), "yyyy-mm-dd"), sectionnames[key], studentnames[key], subjectnames[key], regardsMsg);
                        }
                        var Notification = Studentatendance.app.models.notification;
                        Notification.pushnotification(notificationarr);
                    })

        });
    }

    Studentatendance.remoteMethod(
            'markattendance',
            {
                http: {path: '/markattendance', verb: 'post'},
                description: 'Mark subject wise attendance',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Studentatendance.validaterequest = function (data) {
        var msg = {};

        if (!data.session_id) {
            msg.status = '201';
            msg.message = "Session id cannot blank";
            return   msg;
        }
        if (!data.section_id) {
            msg.status = '201';
            msg.message = "Section id Cannot blank";
            return   msg;

        }
        // if (!data.subject_id) {
        //     msg.status = '201';
        //     msg.message = "Subject id Cannot blank";
        //     return   msg;
        // }
        if (!data.school_id) {
            msg.status = '201';
            msg.message = "School id Cannot blank";
            return   msg;
        }
        if (!data.attendance_status) {
            msg.status = '201';
            msg.message = "Attendance status Cannot blank";
            return   msg;
        }
        if (!data.attendance_date) {
            msg.status = '201';
            msg.message = "Attendance date Cannot blank";
            return   msg;
        }
        if (!data.user_id) {
            msg.status = '201';
            msg.message = "User id Cannot blank";
            return   msg;
        }

        msg.status = '200';
        msg.message = "Success";
        return msg;
    }

    Studentatendance.validatelistrequest = function (data) {
        var msg = {};

        if (!data.session_id) {
            msg.status = '201';
            msg.message = "Session id cannot blank";
            return   msg;
        }
        if (!data.section_id) {
            msg.status = '201';
            msg.message = "Section id Cannot blank";
            return   msg;

        }
        // if (!data.subject_id) {
        //     msg.status = '201';
        //     msg.message = "Subject id Cannot blank";
        //     return   msg;
        // }
        if (!data.attendance_date) {
            msg.status = '201';
            msg.message = "Attendance date Cannot blank";
            return   msg;
        }


        msg.status = '200';
        msg.message = "Success";
        return msg;
    }

    Studentatendance.validaterequestother = function (data) {
        var msg = {};

        if (!data.session_id) {
            msg.status = '201';
            msg.message = "Session id cannot blank";
            return   msg;
        }
        if (!data.section_id) {
            msg.status = '201';
            msg.message = "Section id Cannot blank";
            return   msg;

        }

        msg.status = '200';
        msg.message = "Success";
        return msg;
    }

    Studentatendance.subjectattendance = function (data, cb) {

        let msg = {}, result = {}, attendstatus, ppcount = 0, acount = 0, pcount = 0, lcount = 0;
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        let whereobj = {batch_start_time: data.start_time, batch_end_time: data.end_time, lecture_id:data.lecture_id,sectionId: data.section_id, sessionId: data.session_id, subjectId: data.subject_id, attendance_date: dateFormat(data.attendance_date, "isoDateTime")};
        if (data.subflag != undefined) {
            whereobj = {sectionId: data.section_id, sessionId: data.session_id,
                attendance_date: {between: [dateFormat(data.from_date, "isoDate"), dateFormat(data.to_date, "isoDate")]}};
        }


        var response = Studentatendance.validaterequestother(data);

        if (response.status == "201")
        {
            return cb(null, response);
        }
        for (let key in whereobj) {
            if (whereobj.hasOwnProperty(key) && whereobj[key] != "") {
                result[key] = whereobj[key];
            }
        }
        whereobj = result;
        whereobj['subjectId'] = data.subject_id;

        var user_subject = Studentatendance.app.models.user_subject;
        user_subject.find({
            where: {user_type: "Student", sectionId: data.section_id, class_subjectId: data.subject_id, sessionId: data.session_id, status: 'Active'},

            include: {
                relation: "user",
                scope: {
                    include: [{
                            relation: "students",
                        }, {
                            relation: "user_have_attendance",
                            scope: {
                                where: whereobj
                            }
                        }, {
                            relation: "user_devices",
                            scope: {
                                fields: ["network_id"],
                            }
                        },
                        {
                            relation: "user_log",
                            scope: {
                                where: { and : [
                                    {login_status: 'login'},
                                    {login_time: {gte: dateFormat(data.attendance_date, "isoDate")}},
                                    {login_time: {lte: dateFormat(data.attendance_date, "yyyy-mm-dd'T'23:59:59")}}
                                ]},
                                fields: ["id"]
                            }
                        }
                    ]
                }
            },
            order: 'userId ASC',
        }, function (err, res) {

            if (err)
                throw(err);

            var attendanceArr = [];
            var promise = []; 
            let attendancestatus = "";
            let priority;

            res.forEach(function (value) {
                value = value.toJSON();
                if (value.user) {
                    if (value.user.user_have_attendance.length == 0) {
                        if(constantval.product_type.toLowerCase() == 'emscc') {
                            attendancestatus = (value.user.user_log.length > 0) ? "P" : "A"; 
                        }else{
                            attendancestatus = ""; 
                        }
                        var obj = {
                            id: "",
                            user_id: value.user.id,
                            attendance_status: attendancestatus,
                            attendance_date: "",
                            student_name: value.user.students.name,
                            admission_no: value.user.students.admission_no,
                            parent_id: value.user.students.parentId
                        };
                        
                    } else {

                        attendstatus = value.user.user_have_attendance[0].attendance_status;
                        if (attendstatus == "PP") {
                            ppcount += 1;
                        } else if (attendstatus == "P") {
                            pcount += 1;
                        } else if (attendstatus == "A") {
                            acount += 1;
                        } else if (attendstatus == "L") {
                            lcount += 1;
                        }

                        var obj = {
                            id: value.user.user_have_attendance[0].id,
                            user_id: value.user.id,
                            attendance_status: value.user.user_have_attendance[0].attendance_status,
                            attendance_date: dateFormat(value.user.user_have_attendance[0].attendance_date, "isoDate"),
                            student_name: value.user.students.name,
                            admission_no: value.user.students.admission_no,
                            parent_id: value.user.students.parentId
                        };
                    }
                    if(constantval.product_type.toLowerCase() == 'emscc') {
                        priority = (obj.attendance_status == 'P') ? 1 : 2;
                        obj.priority = priority;
                    }
                    var networkIdArr = [];
                    if (value.user.user_devices.length > 0) {
                        value.user.user_devices.forEach(function (deviceInfo) {
                            if (deviceInfo.network_id) {
                                networkIdArr.push(deviceInfo.network_id);
                            }
                        });
                    }

                    obj.network_id = networkIdArr;

                    attendanceArr.push(obj);
                }

            });
            if(constantval.product_type.toLowerCase() == 'emscc') {
                attendanceArr.sort(function(a,b) {return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);} ); 
            }

            msg.status = '200';
            msg.message = "Success";
            return cb(null, msg, {attendcount: {ppcount: ppcount, acount: acount, pcount: pcount, lcount: lcount}, dataobj: attendanceArr});
        });

    };

    Studentatendance.remoteMethod(
            'subjectattendance',
            {
                http: {path: '/subjectattendance', verb: 'post'},
                description: 'Get subject wise attendance list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.getsubjectattendancedetailswithoutsubjectid = function (data, cb) {
        var msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        var response = {};
        if (!data.user_id) {
            response.status = '201';
            response.message = "User id cannot be blank";
        } else if (!data.first_day) {
            response.status = '201';
            response.message = "First day cannot be blank";
        } else if (!data.last_day) {
            response.status = '201';
            response.message = "Last day cannot be blank";
        } else if (!data.school_id) {
            response.status = '201';
            response.message = "School id cannot be blank";
        } else if (!data.session_id) {
            response.status = '201';
            response.message = "Session id cannot be blank";
        }

        if (response.status == '201')
        {
            return cb(null, response);
        }
        Studentatendance.find({
            include: {
                relation: "users",
                scope: {
                    fields: "id",
                    include: {
                        relation: "students",
                        scope: {
                            fields: ["sectionId", "subjectId", "attendance_status", "attendance_date"]
                        }
                    }
                }
            },
            where: {and: [
                    {attendance_date: {gte: dateFormat(data.first_day, "isoDateTime")}},
                    {attendance_date: {lte: dateFormat(data.last_day, "yyyy-mm-dd'T'23:59:59")}},
                    {userId: data.user_id},
                    {sessionId: data.session_id},
                    {schoolId: data.school_id}
                ]},
        }, function (err, res) {

            if (err)
                throw(err);
            var attendanceArr = [];

            res.forEach(function (value) {
                value = value.toJSON();
                var obj = {
                    subject_id: value.subjectId,
                    section_id: value.sectionId,
                    attendance_status: value.attendance_status,
                    attendance_date: value.attendance_date,
                };
                attendanceArr.push(obj);
            });

            msg.status = '200';
            msg.message = "Success";

            let status = ["A", "P", "L"];
            attendanceArr = attendanceArr.filter(obj => {
                if (status.indexOf(obj.attendance_status) >= 0) {
                    return obj;
                }
            });
            if (constantval.product_type.toLowerCase() != 'emscc') {
                var obj = {};
                for (var i = 0, len = attendanceArr.length; i < len; i++) {
                    if (!obj[attendanceArr[i]['attendance_date']])
                        obj[attendanceArr[i]['attendance_date']] = attendanceArr[i];
                }
                var newArr = [];
                for (var key in obj)
                    newArr.push(obj[key]);
                attendanceArr = newArr;
            }
            var dateArr = [];
            var obj = [];
            var arr = [];
           
            attendanceArr.forEach((value) => {
                var attendanceDate = dateFormat(value.attendance_date, "isoDate");

                if (!in_array(dateArr, attendanceDate)) {
                    dateArr.push(attendanceDate);
                    obj[attendanceDate] = [value.attendance_status];
                } else {
                    obj[attendanceDate].push(value.attendance_status);

                }
            });

            var respObj = [];
            var absentCount = 0;
            var presentCount = 0;
            var leaveCount = 0;
            var partialPresentCount = 0;
            for (var key in obj) {

                var attendanceStatus = unique(obj[key]);
                  var attendance = '';
                 
                if (attendanceStatus.length > 1) {
                    partialPresentCount++;
                    attendance = 'PP';
                } else if (attendanceStatus.length == 1 && attendanceStatus[0] == 'A') {
                    absentCount++;
                    attendance = 'A';
                } else if (attendanceStatus.length == 1 && attendanceStatus[0] == 'P') {
                    presentCount++;
                    attendance = 'P';
                } else {
                    attendance = 'L';
                    leaveCount++;
                }
                var attendObj = {
                    attendance_date: key,
                    attendance_status: attendance,
                }
                respObj.push(attendObj);

            }
            ;
            var respDataObj = {};
            respDataObj.attendance_list = respObj;
            respDataObj.absent_count = absentCount;
            respDataObj.present_count = presentCount;
            respDataObj.leave_count = leaveCount;
            respDataObj.partial_present_count = partialPresentCount;
            cb(null, respDataObj, msg);
        });
    };


    Studentatendance.remoteMethod(
            'getsubjectattendancedetailswithoutsubjectid',
            {
                http: {path: '/getsubjectattendancedetailswithoutsubjectid', verb: 'post'},
                description: 'Get monthly student attendance without subject id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response', type: 'json'}, {arg: 'response_status', type: 'json'}]
            }
    );

    Studentatendance.studentattendancemanagement = (data, cb) => {

        var msg = {};
        let whereobj = {};

        whereobj = {and: [{attendance_date: {between: [dateFormat(data.from_date, "isoDate"), dateFormat(data.to_date, "isoDate")]}}
                , {sessionId: data.session_id}, {schoolId: data.school_id}]};

        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }
        var response = {};

        if (!data.from_date) {
            response.status = '201';
            response.message = "From date cannot be blank";
        }

        if (!data.to_date) {
            response.status = '201';
            response.message = "To date cannot be blank";
        }

        if (response.status == '201')
        {
            return cb(null, response);
        }
        Studentatendance.find({
            where: whereobj,
        }, (err, res) => {
            if (err)
                throw(err);
            let attendanceArr = [];
            let acount = 0, pcount = 0, lcount = 0, account = 0, pccount = 0, lccount = 0;
            let pre_acount = 0, pre_pcount = 0, pre_lcount = 0, cnot_taken = 0, pre_not_taken = 0, not_taken = 0;
            let c_taken_counter = 0, pre_taken_counter = 0, taken_counter = 0;
            let dataobj = {};
            let current_month_data = [];
            let previous_month_data = [];

            res.forEach(value => {
                value = value.toJSON();
                if (value.attendance_date.getMonth() + 1 == data.current_month) {
                    // current month
                    if (value.attendance_status == "A") {
                        account += 1;
                    } else if (value.attendance_status == "P") {
                        pccount += 1;
                    } else if (value.attendance_status == "L") {
                        lccount += 1;

                    }
                    c_taken_counter++;
                } else if (value.attendance_date.getMonth() + 1 == data.current_month - 1) {
                    // previous month
                    if (value.attendance_status == "A") {
                        pre_acount += 1;
                    } else if (value.attendance_status == "P") {
                        pre_pcount += 1;
                    } else if (value.attendance_status == "L") {
                        pre_lcount += 1;
                    }
                    pre_taken_counter++
                } else if (data.current_date.substr(0, 10) == value.attendance_date.toISOString().substr(0, 10)) {
                    if (value.attendance_status == "A") {
                        acount += 1;
                    } else if (value.attendance_status == "P") {
                        pcount += 1;
                    } else if (value.attendance_status == "L") {
                        lcount += 1;
                    }
                    taken_counter++;
                }
            });
            let now = new Date();
            let current_days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            let previous_days = new Date(now.getFullYear(), now.getMonth(), 0).getDate();

            cnot_taken = current_days - c_taken_counter;
            pre_not_taken = previous_days - pre_taken_counter;
            if (taken_counter == 0)
                not_taken = 1;

            dataobj = {
                "present": {
                    "today": pcount,
                    "current_month": pccount,
                    "last_month": pre_pcount
                },
                "absent": {
                    "today": acount,
                    "current_month": account,
                    "last_month": pre_acount
                },
                "leave": {
                    "today": lcount,
                    "current_month": lccount,
                    "last_month": pre_lcount
                },
                "not_taken": {
                    "today": not_taken,
                    "current_month": Math.abs(cnot_taken),
                    "last_month": Math.abs(pre_not_taken)
                }
            }

            msg.status = '200';
            msg.message = "Information fetched successfully.";
            cb(null, msg, dataobj);
        });
    }

    Studentatendance.remoteMethod(
            'studentattendancemanagement',
            {
                http: {path: '/studentattendancemanagement', verb: 'post'},
                description: 'Get monthly student attendance for management dashboard',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
            }
    );


    Studentatendance.studentattendance = (data, cb) => {
        var msg = {};
        let whereobj = {};
        if (data.management_flag != undefined && data.management_flag == "1") {
            whereobj = {and: [{attendance_date: {between: [dateFormat(data.from_date, "isoDate"), dateFormat(data.to_date, "isoDate")]}}
                    , {sessionId: data.session_id}, {schoolId: data.school_id}]};
        } else if (data.management_flag == undefined) {
            whereobj = {and: [{attendance_date: {between: [data.from_date, data.to_date]}}, {userId: data.user_id}
                    , {sessionId: data.session_id}, {schoolId: data.school_id}]};
        }

        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }
        var response = {};
        if (!data.user_id && data.management_flag == undefined && data.management_flag != "1") {
            response.status = '201';
            response.message = "User id cannot be blank";
        }

        if (!data.from_date) {
            response.status = '201';
            response.message = "From date cannot be blank";
        }

        if (!data.to_date) {
            response.status = '201';
            response.message = "To date cannot be blank";
        }

        if (response.status == '201')
        {
            return cb(null, response);
        }
        Studentatendance.find({
            include: {
                relation: "users",
                scope: {
                    fields: "id",
                    include: {
                        relation: "students",
                        scope: {
                            fields: ["sectionId", "subjectId", "attendance_status", "attendance_date"]
                        }
                    }
                }
            },
            where: whereobj,
        }, (err, res) => {
            if (err)
                throw(err);
            let attendanceArr = [];
            let acount = 0, pcount = 0, ppcount = 0, lcount = 0, account = 0, pccount = 0, pcpcount = 0, lccount = 0;
            let pre_acount = 0, pre_pcount = 0, pre_ppcount = 0, pre_lcount = 0;
            let dataobj = {};
            if (data.management_flag != undefined && data.management_flag == "1") {
                let current_month_data = [];
                let previous_month_data = [];

                res.forEach(value => {
                    value = value.toJSON();

                    if (value.attendance_date.getMonth() + 1 == data.current_month) {
                        // current month
                        if (value.attendance_status == "A") {
                            account += 1;
                        }
                        if (value.attendance_status == "P") {
                            pccount += 1;
                        }
                        if (value.attendance_status == "L") {
                            lccount += 1;
                        }
                    }

                    if (value.attendance_date.getMonth() + 1 == data.current_month - 1) {
                        // previous month
                        if (value.attendance_status == "A") {
                            pre_acount += 1;
                        }
                        if (value.attendance_status == "P") {
                            pre_pcount += 1;
                        }
                        if (value.attendance_status == "L") {
                            pre_lcount += 1;
                        }
                    }

                    if (data.current_date.substr(0, 10) == value.attendance_date.toISOString().substr(0, 10)) {
                        if (value.attendance_status == "A") {
                            acount += 1;
                        }
                        if (value.attendance_status == "P") {
                            pcount += 1;
                        }
                        if (value.attendance_status == "L") {
                            lcount += 1;
                        }
                    }

                });

                dataobj = {
                    "current_month": {
                        "absent": account,
                        "present": pccount,
                        "not_taken": pcpcount,
                        "leave": lccount
                    },
                    "previous_month": {
                        "absent": pre_acount,
                        "present": pre_pcount,
                        "not_taken": pre_ppcount,
                        "leave": pre_lcount
                    },
                    "today": {
                        "absent": acount,
                        "present": pcount,
                        "not_taken": ppcount,
                        "leave": lcount
                    }
                };

            } else {
                res.forEach(function (value) {
                    value = value.toJSON();
                    if (value.attendance_status == "A") {
                        acount += 1;
                    }
                    if (value.attendance_status == "P") {
                        pcount += 1;
                    }
                    if (value.attendance_status == "L") {
                        lcount += 1;
                    }

                    let obj = {
                        attendance_status: value.attendance_status,
                        attendance_date: dateFormat(value.attendance_date, "yyyy-mm-dd"),
                    };
                    attendanceArr.push(obj);
                });
                dataobj = {"datewise": attendanceArr, "Absent": acount, "Present": pcount, "Leave": lcount};
            }

            msg.status = '200';
            msg.message = "Information Fetched Successfully.";
            cb(null, msg, dataobj);
        });
    };


    Studentatendance.remoteMethod(
            'studentattendance',
            {
                http: {path: '/studentattendance', verb: 'post'},
                description: 'Get monthly student attendance',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
            }
    );



    Studentatendance.getsubjectattendancedetails = function (data, cb) {

        var msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }
        var response = {};
        if (!data.user_id) {
            response.status = '201';
            response.message = "User id cannot be blank";
        }

        if (response.status == '201')
        {
            return cb(null, response);
        }
        Studentatendance.find({
            include: {
                relation: "users",
                scope: {
                    fields: "id",
                    include: {
                        relation: "students",
                        scope: {
                            fields: ["sectionId", "subjectId", "attendance_status", "attendance_date"]
                        }
                    }
                }
            },
            where: {userId: data.user_id, schoolId: data.school_id, sessionId: data.session_id, subjectId: data.subject_id},
        }, function (err, res) {

            if (err)
                throw(err);
            var attendanceArr = [];

            res.forEach(function (value) {
                value = value.toJSON();
                var obj = {
                    subject_id: value.subjectId,
                    section_id: value.sectionId,
                    attendance_status: value.attendance_status,
                    attendance_date: value.attendance_date,
                };
                attendanceArr.push(obj);
            });

            msg.status = '200';
            msg.message = "Success";

            cb(null, attendanceArr, msg);
        });
    };


    Studentatendance.markAttendanceExecute = (params, leaveApplyStudent, insertObj, attend_status, cb) =>
    {
        let id, msg = {};
        return new Promise((resolve, reject) => {
            let fromdate = '', todate = '', prms = {};
            leaveApplyStudent.checkleavestatus(params, (err, res) => {

                if (err)
                    reject(err)
                if (res) {
                    if (res.leave_applied == "yes") {

                        let status_arr = ["A", "P"];
                        if (status_arr.indexOf(attend_status) >= 0) {
                            prms['status'] = "Rejected";
                            prms['reject_reason'] = "Rejected by class teacher";
                        } else if (attend_status === "L") {
                            prms['status'] = "Approved";
                        }
                        res.result.forEach(obj => {
                            fromdate = obj.fromDate.toISOString().substr(0, 10);
                            todate = obj.toDate.toISOString().substr(0, 10);
                            if (fromdate >= insertObj.attendance_date && todate <= insertObj.attendance_date) {
                                prms['id'] = obj.id;
                                leaveApplyStudent.updateleavestatus(prms, (err, res) => {
                                })
                            }
                        })
                    }
                    Studentatendance.upsert(insertObj, (err, response) => {
                        if (response.attendance_status === 'A') {
                            primaryidarr.push({"user_id": response.userId, "id": response.id});

                            notificationobj = {};
                            notificationobj.user_id = response.userId;
                            notificationobj.module_key_id = response.id;
                            notificationobj.type = 6;
                            notificationobj.title = '';
                            notificationobj.notification_text = '';
                            notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");

                            notificationarr.push(notificationobj);
                        }
                        resolve("success");
                    })
                }
            })
        })
    }
    Studentatendance.remoteMethod(
            'getsubjectattendancedetails',
            {
                http: {path: '/getsubjectattendancedetails', verb: 'post'},
                description: 'Get monthly student attendance',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.getStudentPresentList = (data, cb) =>
    {
        var msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }
        var response = {};
        if (!data.user_id) {
            response.status = '201';
            response.message = "User id cannot be blank";
        }

        if (response.status == '201')
        {
            return cb(null, response);
        }
        Studentatendance.find({
            include: {
                relation: "users",
                scope: {
                    fields: "id",
                    include: {
                        relation: "students",
                        scope: {
                            fields: ["sectionId", "subjectId", "attendance_status", "attendance_date"]
                        }
                    }
                }
            },
            where: {userId: data.user_id, sessionId: data.session_id, attendance_status: 'P',
                attendance_date: {between: [data.from_date, data.to_date]}
            },
        }, function (err, res) {

            if (err)
                throw(err);
            var attendanceArr = [];

            res.forEach(function (value) {
                value = value.toJSON();
                var obj = {
                    subject_id: value.subjectId,
                    section_id: value.sectionId,
                    attendance_status: value.attendance_status,
                    attendance_date: value.attendance_date,
                };
                attendanceArr.push(obj);
            });

            msg.status = '200';
            msg.message = "Success";
            cb(null, attendanceArr, msg);
        });
    }
    Studentatendance.remoteMethod(
            'getStudentPresentList',
            {
                http: {path: '/getStudentPresentList', verb: 'post'},
                description: 'Get student present attendance list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response', type: 'json'}, {arg: 'response_status', type: 'json'}]
            }
    );

    Studentatendance.absentmarker = (data, cb) =>
    {
        var msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }

        let whereobj = {
            and: [{
                    userId: {
                        inq: data.student_id
                    }
                }, {
                    sectionId: {
                        inq: data.section_id
                    }
                }]
        };
        Studentatendance.updateAll(whereobj, {attendance_status: 'A'}, function (err, res) {
            if (err) {
                throw err;
            }
            if (res) {
                cb(null, res);
            }
        });
    }
    Studentsubjectattendance.sendsms = function (number, date, sectionname, studentname, subjectname, rgrdmsg)
    {
        var absentmessage = "Your Student " + studentname + " is absent in " + sectionname + " -" + subjectname + ". " + rgrdmsg;
        var options = {
            method: 'get',
            uri: constantval.SMS_URL1 + '&dest_mobileno=' + number + '&message=' + absentmessage + '&response=Y',
        };
        rp(options)
                .then(function (response) {
                    console.log("Message  sent to:-" + number + "------" + response);
                }).catch(function (error) {
            console.log("Message not sent to:-" + number + "------" + error);
        })
    }
    Studentatendance.remoteMethod(
            'absentmarker',
            {
                http: {path: '/absentmarker', verb: 'post'},
                description: 'Absent marker',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response', type: 'json'}, {arg: 'response_status', type: 'json'}]
            }
    );

    Studentatendance.attendanceuser = function (data, cb) {

        let msg = {};

        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
            return;
        }

        var response = Studentatendance.validaterequestother(data);

        if (response.status == "201")
        {
            return cb(null, response);
        }
        var user_section = Studentatendance.app.models.user_sections;
        user_section.find({
            where: {user_type: "Student", sectionId: data.section_id, sessionId: data.session_id, status: 'Active'},
            include: {
                relation: "users",
                scope: {
                    where: {status: 'Active'},
                    include: [{
                            relation: "students",
                            scope: {
                                where: {status: 'Active'}
                            }
                        }, {
                            relation: "user_have_attendance",
                            scope: {
                                where: {sectionId: data.section_id, sessionId: data.session_id, subjectId: data.subject_id, attendance_date: dateFormat(data.attendance_date, "isoDateTime")}
                            }
                        }]
                }
            },
            order: 'userId ASC',
        }, function (err, res) {

            if (err)
                throw(err);

            var attendanceArr = [];
            var promise = [];
            var UserSection = Studentatendance.app.models.user_sections;
            res.forEach(function (value) {
                value = value.toJSON();
                if (value.users) {
                    promise.push(UserSection.getStudentRollNo(value.users.id, data.session_id, data.section_id).then(function (rolldata) {
                        // roll_no:rolldata.length==0?'':rolldata[0].roll_no
                        if (value.users.user_have_attendance.length == 0) {
                            var obj = {
                                id: "",
                                user_id: value.users.id,
                                attendance_status: "",
                                attendance_date: "",
                                student_name: value.users.students.name,
                                admission_no: value.users.students.admission_no,
                                roll_no: rolldata.length == 0 ? '' : rolldata[0].roll_no,
                                parent_id: value.users.students.parentId
                            };

                        } else {
                            var obj = {
                                id: value.users.user_have_attendance[0].id,
                                user_id: value.users.id,
                                attendance_status: value.users.user_have_attendance[0].attendance_status,
                                attendance_date: dateFormat(value.users.user_have_attendance[0].attendance_date, "isoDate"),
                                student_name: value.users.students.name,
                                admission_no: value.users.students.admission_no,
                                roll_no: rolldata.length == 0 ? '' : rolldata[0].roll_no,
                                parent_id: value.users.students.parentId
                            };

                        }
                        attendanceArr.push(obj);

                    }));
                }

            });

            Promise.all(promise).then(function (response) {
                msg.status = '200';
                msg.message = "Success";
                attendanceArr.sort((a, b) =>
                {
                    if (a.user_id < b.user_id) {
                        return -1;
                    } else if (a.user_id > b.user_id) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                return cb(null, msg, attendanceArr);

            })
        });

    };

    Studentatendance.remoteMethod(
            'attendanceuser',
            {
                http: {path: '/attendanceuser', verb: 'post'},
                description: 'Get user attendance list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.studentdailyattendance = (data, cb) => {
        let msg = {};

        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
            return;
        }
        const objectdata = {
            "Session id": data.session_id,
            "School id": data.school_id,
            "Section id": data.section_id,
            "From date": data.from_date,
            "To date": data.to_date
        };

        Studentatendance.validatereq(objectdata, cb);

        Studentatendance.find({
            include: {
                relation: "users",
                scope: {
                    fields: "id",
                    include: {
                        relation: "students",
                        scope: {
                            fields: ["attendance_status", "attendance_date"]
                        }
                    }
                }
            },
            where: 
               { and: [
                    {sectionId: data.section_id},
                    { sessionId: data.session_id},
                    {schoolId: data.school_id},
                    {attendance_date: {gte: dateFormat(data.from_date, "isoDate")}},
                    {attendance_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            },
            order: 'attendance_date ASC',
        }, (err, res) => {
            if (err)
                throw(err);
            if (res) {
                msg.status = "200";
                msg.message = "Information fetched successfully";
                let previous_date = '', previous_status = '', pcount = 0, acount = 0, lcount = 0, total = 0, listarr = [];
                let flag_other = 0, date1, date2, timeDiff, diffDays = -1, counter = 0, dd = '', mm = '', yyyy = '', gen, flag = 0, i = 0, len = res.length;

                res.forEach(obj => { 
                    if (previous_date != '') {
                        date1 = new Date(obj.attendance_date);
                        date2 = new Date(previous_date);
                        timeDiff = Math.abs(date2.getTime() - date1.getTime());
                        diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    }

                    if (previous_date == '' || diffDays == 0) {
                        gen = Studentatendance.statuscountgenerator(obj.attendance_status, pcount, acount, lcount);
                        pcount = gen.next().value;
                        acount = gen.next().value;
                        lcount = gen.next().value;
                        counter++;
                    } else {
                        if (counter % 2 != 0) {
                            gen = Studentatendance.statuscountgenerator(previous_status, pcount, acount, lcount);
                            pcount = gen.next().value;
                            acount = gen.next().value;
                            lcount = gen.next().value;
                        }
                        flag = 1;
                    }
                    i++;
                    flag_other = (len == i) ? 1 : 0;

                    if (flag || flag_other) {
                        total = pcount + acount + lcount;
                        listarr.push({
                            "date": Studentatendance.isodate(previous_date),
                            "present": pcount,
                            "absent": acount,
                            "leave": lcount,
                            "total": total
                        });
                        pcount = 0;
                        acount = 0;
                        lcount = 0;
                    }
                    flag = 0;

                    previous_date = obj.attendance_date;
                    previous_status = obj.attendance_status;
                });

                cb(null, msg, {"attendance": listarr});
                return;
            }
            ;
        });

    }

    Studentatendance.remoteMethod(
            'studentdailyattendance',
            {
                http: {path: '/studentdailyattendance', verb: 'post'},
                description: 'Student daily attendance list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.statuscountgenerator = function* (status, pcount, acount, lcount) {
        switch (status) {
            case "P":
                pcount++;
                break;
            case "A":
                acount++;
                break;
            case "L":
                lcount++;
                break;
            default:
                break;
        }
        yield pcount;
        yield acount;
        yield lcount;
    }

    Studentatendance.isodate = previous_date => {
        var dd = previous_date.getDate();
        var mm = previous_date.getMonth() + 1;
        var yyyy = previous_date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        return `${yyyy}-${mm}-${dd}`;
    }

    Studentatendance.checkattend = (data, cb) => {
        if (!data)
            return cb(null, {status: "201", message: "Bad Request"})
        else if (!data.user_id)
            return cb(null, {status: "201", message: "User id cannot be blank"})
        else if (!data.school_id)
            return cb(null, {status: "201", message: "School id cannot be blank"})
        else if (!data.session_id)
            return cb(null, {status: "201", message: "Session id cannot be blank"})
        else if (!data.from_date)
            return cb(null, {status: "201", message: "From date cannot be blank"})
        else if (!data.to_date)
            return cb(null, {status: "201", message: "To date cannot be blank"})

        Studentatendance.find({
            field: "id",
            where: {
                userId: data.user_id,
                schoolId: data.school_id,
                sessionId: data.session_id,
                subject_id: data.subject_id,
                attendance_date: {between: [dateFormat(data.from_date, "isoDateTime"), dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")]}
            }
        },
                (err, res) => {
            if (err)
                throw err;
            if (res) {
                let response = (res.length > 0) ? "yes" : "no";
                return cb(null, {"attend": response})
            } else {
                return cb(null, {"attend": "none"})
            }
        })
    }

    Studentatendance.remoteMethod(
            'checkattend',
            {
                http: {path: '/checkattend', verb: 'post'},
                description: 'check attendance',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Studentatendance.dashboardattendance = function (data, cb) {

        var errorMessage = {};
        var successMessage = {};
        if (!data.session_id) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Session id cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.school_id) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "School id cannot be blank";
            return cb(null, errorMessage);
        }
        var todayDate = dateFormat(new Date(), "yyyy-mm-dd")

        var todayParam = {
            from_date: todayDate,
            to_date: todayDate,
            session_id: data.session_id,
            school_id: data.school_id
        }
        Studentatendance.datewiseattendance(todayParam, function (err, todayAtten) {
        Studentatendance.attendancenottaken(todayParam, function (err, status,todayAttenNottaken) {
            
            if (err) {

                errorMessage.status = '201';
                errorMessage.message = "fail";
                return cb(null, errorMessage);
            }
            var todaypresentCount = 0;
            var dailyAtt=[];
            var todayabsentCount = 0;
            var todayleaveCount = 0;
            var todayattnotakenCount = 0;
            todayAtten.forEach(element => {
                if(element.subjectId==0){
                    dailyAtt.push(element);
                }
            
        });
            todayAtten = Dedupe(todayAtten, ['userId']);
//  console.log(dailyAtt);
            var present = dailyAtt.map((present) => present.attendance_status == 'P');
            var absent = dailyAtt.map((absent) => absent.attendance_status == 'A');
            var leave = dailyAtt.map((leave) => leave.attendance_status == 'L');

            for (var i in present) {
                if (present[i]) {
                    todaypresentCount++;
                }
            }
            for (var i in absent) {
                if (absent[i]) {
                    todayabsentCount++;
                }
            }
            for (var i in leave) {
                if (leave[i]) {
                    todayleaveCount++;
                }
            }
            
            
            todayattnotakenCount = todayAttenNottaken.notTakenTotalCount;
            

            var curentMonStartDate = dateFormat(new Date(), "yyyy-mm-01")

            var currentMonthParam = {
                from_date: curentMonStartDate,
                to_date: todayDate,
                session_id: data.session_id,
                school_id: data.school_id
            }


            Studentatendance.datewiseattendance(currentMonthParam, function (err, currentMonAtten) {
                
            Studentatendance.attendancenottaken(currentMonthParam, function (err, status,currentMonAttenNottaken) {    
                if (err) {

                    errorMessage.status = '201';
                    errorMessage.message = "fail";
                    return cb(null, errorMessage);
                }
                var currentMonpresentCount = 0;
                var currentMonabsentCount = 0;
                var currentMonleaveCount = 0;
                var currentMonAttNotTakenCount = 0;

                var currentMonpresent = currentMonAtten.map((currentMonpresent) => currentMonpresent.attendance_status == 'P');
                var currentMonabsent = currentMonAtten.map((currentMonabsent) => currentMonabsent.attendance_status == 'A');
                var currentMonleave = currentMonAtten.map((currentMonleave) => currentMonleave.attendance_status == 'L');

                for (var i in currentMonpresent) {
                    if (currentMonpresent[i]) {
                        currentMonpresentCount++;
                    }
                }
                for (var i in currentMonabsent) {
                    if (currentMonabsent[i]) {
                        currentMonabsentCount++;
                    }
                }
                for (var i in currentMonleave) {
                    if (currentMonleave[i]) {
                        currentMonleaveCount++;
                    }
                }
                currentMonAttNotTakenCount = currentMonAttenNottaken.notTakenTotalCount;

                var now = new Date();
                var prevMonthEndDate = dateFormat(new Date(now.getFullYear(), now.getMonth(), 0), "yyyy-mm-dd");
                var prevMonthfirstDate = dateFormat(new Date(now.getFullYear(), now.getMonth(), 0), "yyyy-mm-01");

                var lastMonthParam = {
                    from_date: prevMonthfirstDate,
                    to_date: prevMonthEndDate,
                    session_id: data.session_id,
                    school_id: data.school_id
                }

                Studentatendance.datewiseattendance(lastMonthParam, function (err, lastMonAtten) {
                    Studentatendance.attendancenottaken(lastMonthParam, function (err, status,lastMonAttenNottaken) { 
                    if (err) {

                        errorMessage.status = '201';
                        errorMessage.message = "fail";
                        return cb(null, errorMessage);
                    }
                    var lastMonpresentCount = 0;
                    var lastMonabsentCount = 0;
                    var lastMonleaveCount = 0;
                    var lastMonAttNotTakenCount = 0;

                    var lastMonpresent = lastMonAtten.map((lastMonpresent) => lastMonpresent.attendance_status == 'P');
                    var lastMonabsent = lastMonAtten.map((lastMonabsent) => lastMonabsent.attendance_status == 'A');
                    var lastMonleave = lastMonAtten.map((lastMonleave) => lastMonleave.attendance_status == 'L');

                    for (var i in lastMonpresent) {
                        if (lastMonpresent[i]) {
                            lastMonpresentCount++;
                        }
                    }
                    for (var i in lastMonabsent) {
                        if (lastMonabsent[i]) {
                            lastMonabsentCount++;
                        }
                    }
                    for (var i in lastMonleave) {
                        if (lastMonleave[i]) {
                            lastMonleaveCount++;
                        }
                    }
                    lastMonAttNotTakenCount = lastMonAttenNottaken.notTakenTotalCount

                    var sessionObj = Studentatendance.app.models.session;


                    sessionObj.sessionfromsessionid(data.session_id, function (err, sessionData) {

                        var sessionStartDate = dateFormat(sessionData.start_date, "yyyy-mm-dd");


                        var tillParam = {
                            from_date: sessionStartDate,
                            to_date: todayDate,
                            session_id: data.session_id,
                            school_id: data.school_id,
                            token: data.token
                        }

                        Studentatendance.datewiseattendance(tillParam, function (err, tillAtten) {
                            
                        Studentatendance.attendancenottaken(tillParam, function (err, status,tillAttenNottaken) { 
                            var tillPresentCount = 0;
                            var tillAbsentCount = 0;
                            var tillLeaveCount = 0;
                            var tillDateAttNotTakenCount = 0;

                            if (err) {

                                errorMessage.status = '201';
                                errorMessage.message = "fail";
                                return cb(null, errorMessage);
                            }

                            var tillpresent = tillAtten.map((tillpresent) => tillpresent.attendance_status == 'P');
                            var tillabsent = tillAtten.map((tillabsent) => tillabsent.attendance_status == 'A');
                            var tillleave = tillAtten.map((tillleave) => tillleave.attendance_status == 'L');

                            for (var i in tillpresent) {
                                if (tillpresent[i]) {
                                    tillPresentCount++;
                                }
                            }
                            for (var i in tillabsent) {
                                if (tillabsent[i]) {
                                    tillAbsentCount++;
                                }
                            }
                            for (var i in tillleave) {
                                if (tillleave[i]) {
                                    tillLeaveCount++;
                                }
                            }

                            tillDateAttNotTakenCount= tillAttenNottaken.notTakenTotalCount;
                                    
                            var attendanceCount = {
                                todaypresentCount: todaypresentCount,
                                todayabsentCount: todayabsentCount,
                                todayleaveCount: todayleaveCount,
                                todayAttNotTakenCount: todayattnotakenCount,
                                currentMonthpresentCount: currentMonpresentCount,
                                currentMonthabsentCount: currentMonabsentCount,
                                currentMonthleaveCount: currentMonleaveCount,
                                currentMonthAttNotTAkenCount: currentMonAttNotTakenCount,
                                lastMonthpresentCount: lastMonpresentCount,
                                lastMonthabsentCount: lastMonabsentCount,
                                lastMonthleaveCount: lastMonleaveCount,
                                lastMonthAttNotTakenCount: lastMonAttNotTakenCount,
                                tillPresentCount: tillPresentCount,
                                tillAbsentCount: tillAbsentCount,
                                tillLeaveCount: tillLeaveCount,
                                tillDateAttNotTakenCount: tillDateAttNotTakenCount,
                            }

                            successMessage.status = '200';
                            successMessage.message = "Data fetched successfully";

                            return cb(null, successMessage, attendanceCount)
                        })
                    })
                });
            });
        });
        });
        });
        });
        });
    }

    Studentatendance.datewiseattendance = function (data, cb) {

        if(data.from_date && !data.to_date){
            data.to_date = data.from_date;
        }
        Studentatendance.find({
            where: {
                and: [
                    {sessionId: data.session_id},
                    {schoolId: data.school_id},
                    {attendance_date: {gte: dateFormat(data.from_date, "isoDateTime")}},
                    {attendance_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            }
        }, function (err, res) {
            return cb(null, res)
        });
    }

    Studentatendance.getattendancelist = function (data, cb) {
        var errorMessage = {};
        var successMessage = {};

        if (!data.token) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Token cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.session_id) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Session id cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.school_id) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "School id cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.date) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Date cannot be blank";
            return cb(null, errorMessage);
        }
        if (!data.attendanceStatus) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Attendance Status cannot be blank";
            return cb(null, errorMessage);
        }
        var todayDate = dateFormat(new Date(), "yyyy-mm-dd")



        Studentatendance.find({
            where: {
                and: [
                    {sessionId: data.sesion_id},
                    {schoolId: data.school_id},
                    {sectionId: data.section_id},
                    {attendance_status: data.attendanceStatus},
                    {attendance_date: {gte: dateFormat(data.date, "isoDateTime")}},
                    {attendance_date: {lte: dateFormat(data.date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            },
            include: [{
                    relation: "users",
                    scope: {
                        include: [{
                                relation: "students"
                            }, {
                                relation: "user_have_section"
                            }]
                    }
                }, {
                    relation: "section"
                }, {
                    relation: "applyleave"
                }]
        }, function (err, resp) { 
            resp = Dedupe(resp, ['userId']);
            let res=[];
            resp.forEach(element => {
                if(element.subjectId==0){
                    res.push(element)
                }
            });
        //  console.log(res);
            var sectionArr = [];
            if (err) {
                errorMessage.status = '201';
                errorMessage.message = "fail";
                return cb(null, errorMessage, err);
            }
            if (res.length > 0) {
                var result = [];
                var temArr = [];

                for (var i in res) {

                    var reason = "NA";
                    var appliedOn = "NA";
                    var leaveDate = "NA";
                    var leaveStatus = "NA";

                    if (res[i].applyleave()) {
                        reason = res[i].applyleave().reason;
                        appliedOn = dateFormat(res[i].applyleave().addedDate, "yyyy-mm-dd");
                        leaveDate = dateFormat(res[i].applyleave().fromDate, "yyyy-mm-dd")+'to'+dateFormat(res[i].applyleave().toDate, "yyyy-mm-dd");
                        leaveStatus = "Granted"
                    }
                    
                    var admission_no = res[i].users().students().admission_no.split('_');

                    temArr.push({
                        roll_no: res[i].users().user_have_section().roll_no,
                        student_name: res[i].users().students().name,
                        admission_no: admission_no[1],
                        status: res[i].attendance_status,
                        reason: reason,
                        classOrder: res[i].section().class_order,
                        section: res[i].section().section,
                        section_name: res[i].section().section_name,
                        sectionId: res[i].sectionId,
                        appliedOn: appliedOn,
                        leaveDate: leaveDate,
                        leaveStatus: leaveStatus
                    })
                }

                var tempArr = arraySort(temArr, ['classOrder', 'section', 'student_name']);


                for (var i in tempArr) {
                    if (sectionArr.indexOf(tempArr[i].sectionId) == -1) {
                        sectionArr.push(tempArr[i].sectionId);

                        result.push({
                            [tempArr[i].section_name]: [{
                                    index: 1,
                                    roll_no: tempArr[i].roll_no,
                                    student_name: tempArr[i].student_name,
                                    status: tempArr[i].status,
                                    reason: tempArr[i].reason,
                                    admission_no: tempArr[i].admission_no,
                                    appliedOn: tempArr[i].appliedOn,
                                    leaveDate: tempArr[i].leaveDate,
                                    leaveStatus: tempArr[i].leaveStatus
                                }]
                        });
                    } else {
                        let index = sectionArr.indexOf(tempArr[i].sectionId);
                        for (let k in result[index]) {
                            var count = result[index][k].length + 1;
                            result[index][k].push({
                                index: count,
                                roll_no: tempArr[i].roll_no,
                                student_name: tempArr[i].student_name,
                                status: tempArr[i].status,
                                reason: tempArr[i].reason,
                                admission_no: tempArr[i].admission_no,
                                appliedOn: tempArr[i].appliedOn,
                                leaveDate: tempArr[i].leaveDate,
                                leaveStatus: tempArr[i].leaveStatus
                            });
                            
                        }
                    }
                }
           
               
                successMessage.status = '200';
                successMessage.message = "Data fetched successfully";
                return cb(null, successMessage, result);

            } else {
                successMessage.status = '200';
                successMessage.message = "No Record found";
                return cb(null, successMessage,res);
            }
        })
    }



    Studentatendance.remoteMethod(
            'getattendancelist',
            {
                http: {path: '/getattendancelist', verb: 'post'},
                description: 'management dashboard Attendance List',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.remoteMethod(
            'dashboardattendance',
            {
                http: {path: '/dashboardattendance', verb: 'post'},
                description: 'management dashboard Attendance',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.attendancenottaken = function(data, cb){
        var successMessage = {};
        var sessionObj = Studentatendance.app.models.session;
        var holidayMasterObj = Studentatendance.app.models.holiday_master;
        
        var sectionObj = Studentatendance.app.models.section;
        
        var finalArr = [];
        
        var dateDiffParam = {
            from_date: data.from_date,
            to_date: data.to_date,
        }
        
        sectionObj.sectionlist(function(err,allSection){
            var sectionIdArr = [];
            var sectionNameArr = [];
            
            for(var i in allSection){
                sectionIdArr.push(allSection[i].id);
                sectionNameArr.push(allSection[i].section_name);
                
            }
            
            var param = {
                from_date: data.from_date,
                to_date: data.to_date,
                school_id: data.school_id,
                session_id: data.session_id,
                section_id_arr: sectionIdArr
            }
            
          Studentatendance.datewiseandsecattendance(param,function(err, attRes){
          
             holidayMasterObj.getHolidaysList(param,(err, holidayList)=>{ 
                var classTeacParam = {
                    school_id: data.school_id,
                    session_id: data.session_id,
                    section_id_arr: sectionIdArr,
                    from_date: data.from_date
                }
            
                Studentatendance.getClassWiseClassTeacher(classTeacParam,(err, userSectionRes)=>{
                
                 
                
                var difDateParam = {
                    from_date: data.from_date,
                    to_date: data.to_date
                }
                
                Studentatendance.getAllDatesBwDates(difDateParam, (err, dateList)=>{
                    
                   
                    var clasTeacher = userSectionRes.userSecRes;
                    var count = 0;
                    var totalCount = 0;
                    var denoTotal = 0;
                    for(var i in sectionIdArr){
                        var viewObj = {};
                        viewObj['section_id'] = sectionIdArr[i];
                        viewObj['section_name'] = sectionNameArr[i];
                        
                        var classTeacherList = clasTeacher.map((teacherIn)=> teacherIn.sectionId == sectionIdArr[i]);
                    
                        viewObj['classTeacher'] = "NA";

                        for(var j in classTeacherList){
                            if(classTeacherList[j]){
                                if(clasTeacher[j].users()){
                                    if(clasTeacher[j].users().staff())
                                        viewObj['classTeacher'] = clasTeacher[j].users().staff().name;
                                    else
                                        viewObj['classTeacher'] = "";     
                                }
                                
                            }
                        }
                        
                        
                        var sectionCheck = attRes.map((section)=> section.sectionId == sectionIdArr[i]);
                        
                        
                        
                        var secFlag = false;
                        var sectionDateArr = [];
                        for(var j in sectionCheck){
                            if(sectionCheck[j]){
                                secFlag = true;
                                sectionDateArr.push(attRes[j].date)
                            }
                        }
                        
                        for(var k in dateList){
                            if(dateList[k] <= data.to_date && !secFlag && holidayList.indexOf(dateList[k]) == -1){
                                count++;
                            }else if(dateList[k] <= data.to_date && secFlag && sectionDateArr.indexOf(dateList[k]) == -1){
                                if(holidayList.indexOf(dateList[k]) == -1){
                                    count++;
                                }
                            }
                        }
                        
                        var dateCount = 0;
                        for(var k in dateList){
                            if(dateList[k] <= data.to_date){
                                dateCount++;
                            }
                        }
                        
                        
                        viewObj['notTakenCount'] = count;
                        viewObj['totalCount'] = dateCount - holidayList.length;
                        denoTotal += dateCount - holidayList.length;
                        viewObj['remark'] = "NA";
                        
                        finalArr.push(viewObj);
                        
                        totalCount = totalCount + count;
                        count = 0;
                    }
                    
                    var result = {
                        notTakenList: finalArr,
                        notTakenTotalCount: totalCount,
                        allSectionTotalCount: denoTotal
                    }
                    
                    successMessage.status = '200';
                    successMessage.message = "Data found successfully";
                    return cb(null, successMessage, result);  
                });
            })
            });
        });
        });
    }
    
    
    Studentatendance.datewiseandsecattendance = function (data, cb) {

        if(data.from_date && !data.to_date){
            data.to_date = data.from_date;
        }
        Studentatendance.find({
            where: {
                and: [
                    {sessionId: data.session_id},
                    {schoolId: data.school_id},
                    {sectionId: {inq: data.section_id_arr}},
                    {attendance_date: {gte: dateFormat(data.from_date, "isoDateTime")}},
                    {attendance_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            }
        }, function (err, attRes) {
            
            var dateArr = [];
                for(var i in attRes){
                    dateArr.push({sectionId: attRes[i].sectionId,date:dateFormat(attRes[i].attendance_date, "yyyy-mm-dd")});
                }
                
                var attData = Dedupe(dateArr, ['date']);
            return cb(null, attData)
        });
    }
    
    Studentatendance.getAllDatesBwDates = function(data,cb){
        var dates =[];
            var start = new Date(data.from_date),
               end = new Date(data.to_date),
                year = start.getFullYear(),
                month = start.getMonth(),
                day = start.getDate(),
                dates = [start];
            while(dates[dates.length-1] < end) {
              dates.push(new Date(year, month, ++day));
            }
            var dateArr = [];
            for(var i in dates){
                dateArr.push({date: dateFormat(dates[i], "yyyy-mm-dd")});
            }
            
            var finalDates = Dedupe(dateArr, ['date']);
            
            
            var date = [];
            for(var i in finalDates){
                date.push(finalDates[i].date);
            }
            
            return cb(null, date); 
    }
    
    Studentatendance.diffbtwdates = function(data, cb){
        
        var daysCount = new DateDiff(data.from_date, data.to_date).days();
        
        return cb(null, daysCount)
    }
    
    Studentatendance.remoteMethod(
        'attendancenottaken',
        {
            http: {path: '/attendancenottaken', verb: 'post'},
            description: 'management dashboard Attendance',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );


    Studentatendance.timeslot = (data, cb) => { 
        if (!data)
            return cb(null, {status: "201", message: "Bad Request"})
        else if(!data.section_id)
            return cb(null, {status: "201", message: "Section id cannot be blank"})
        else if (!data.user_id)
            return cb(null, {status: "201", message: "User id cannot be blank"})

      
            /* for TLE */ 
            if (!data.subject_id)
                return cb(null, {status: "201", message: "Subject id cannot be blank"})
            
                let attendanceTimetableDetail = Studentatendance.app.models.attendance_timetable_detail;
                const dataobj ={
                    "section_id": data.section_id,
                    "faculty_id": data.user_id,
                    "subject_id": data.subject_id,
                    "date":data.date
                }
                let res = [], resarr = [];
               
                Studentatendance.periodslotpromise(dataobj, attendanceTimetableDetail, res).then( objct => { 
                    if(objct.length > 0){
                        objct.forEach(obj => {
                            resarr.push({
                                "start_time": obj.start_time,
                                "end_time": obj.end_time,
                                "schedule_id": "",
                                "lecture_id": obj.period,
                                "lecture_name":  obj.start_time +' to '+ obj.end_time
                            });
                        })
                    }

                return cb(null, {status: "200", message: "Information fetched successfully"}, resarr);
                    }).catch( err => { return cb(null, {status: "201", message: "some error"}, err) } );     
        
    }

    Studentatendance.periodslotpromise = (data, attendanceTimetableDetail, res) => {
        return new Promise((resolve, reject) => {
            attendanceTimetableDetail.timetabledetail(data, (err, msg, response) => { 
                if(err) reject(err);
                else if(msg.status == '201') resolve([])
                else resolve(response);
            });
        });
    }

    Studentatendance.remoteMethod(
            'timeslot',
            {
                http: {path: '/timeslot', verb: 'post'},
                description: 'Get time slots of lectures',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'successMessage', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );


    Studentatendance.viewallattendance = function (data, cb) {

        var sectionObj = Studentatendance.app.models.section;

        sectionObj.sectionlist(function (err, allSection) {
            var sectionIdArr = [];
            var sectionNameArr = [];
            
            for(var i in allSection){
                if(data.sectionArr && data.sectionArr.length > 0){
                    if(data.sectionArr.indexOf(allSection[i].id) >= 0){
                        sectionIdArr.push(allSection[i].id);
                        sectionNameArr.push(allSection[i].section_name);
                    }
                }else{
                    sectionIdArr.push(allSection[i].id);
                    sectionNameArr.push(allSection[i].section_name);
                }
            }
            
            
        var classTeacParam = {
            school_id: data.school_id,
            session_id: data.session_id,
            section_id_arr: sectionIdArr,
            from_date: data.from_date
        }
            
            Studentatendance.getClassWiseClassTeacher(classTeacParam,function(err, userSectionRes){
                
                var clasTeacher = userSectionRes.userSecRes;
                var studInSec = userSectionRes.userStudentRes;
                var attenRes = userSectionRes.attenRes;

                var viewAllArr = [];
                var studenAssignSecArr = [];

                for (var i in sectionIdArr) {
                    var viewObj = {};
                    viewObj['classSection'] = sectionNameArr[i];
                    viewObj['classSectionId'] = sectionIdArr[i];


                    var classTeacherList = clasTeacher.map((teacherIn) => teacherIn.sectionId == sectionIdArr[i]);

                    viewObj['classTeacher'] = "NA";

                    for (var j in classTeacherList) {
                        if (classTeacherList[j]) {
                            if(clasTeacher[j].users()){
                                if(clasTeacher[j].users().staff())
                                viewObj['classTeacher'] = clasTeacher[j].users().staff().name;
                            }
                        }
                    }

                    for (var j in clasTeacher) {
                        if (sectionIdArr[i] == clasTeacher[j].sectionId) {
                            viewObj['classSection'] = sectionNameArr[i];
                            viewObj['classTeacher'] = '';
                            if(clasTeacher[j]){
                                if(clasTeacher[j].users()){
                                    if(clasTeacher[j].users().staff()) viewObj['classTeacher'] = clasTeacher[j].users().staff().name;
                                }
                            }
                            
                            viewAllArr.push(viewObj);
                        }
                    }

                    var studentList = studInSec.map((studentIn) => studentIn.sectionId == sectionIdArr[i]);

                    var studentCount = 0;
                    for (var j in studentList) {
                        if (studentList[j]) {
                            studentCount++;
                        }
                    }
                    attenRes = Dedupe(attenRes, ['userId'])
                    var attenResArr = attenRes.map((studentAtt) => studentAtt.sectionId == sectionIdArr[i]);

                    var present = 0;
                    var absent = 0;
                    let leave = 0;
                    var reason = "NA";
                    
                    for (var j in attenResArr) {
                        if (attenResArr[j]) {
                            if (attenRes[j].attendance_status == "P") {
                                present++;
                            }
                            if (attenRes[j].attendance_status == "A") {
                                absent++;
                            }
                            if (attenRes[j].attendance_status == "L") { 
                                leave++;
                                if (attenRes[j].applyleave()) {
                                    reason = attenRes[j].applyleave().reason;
                                }
                            }
                        }
                    }

                    viewObj['totalStudent'] = studentCount;
                    viewObj['present'] = present;
                    viewObj['absent'] = absent;
                    viewObj['leave'] = leave;
                    viewObj['reason'] = "NA"

                    viewAllArr.push(viewObj);
                }

                viewAllArr = Dedupe(viewAllArr, ['classSection']);

                return cb(null, null, viewAllArr);
            });
        });


    }

    Studentatendance.getClassWiseClassTeacher = function (data, cb) {
        var userSectionObj = Studentatendance.app.models.user_sections;
        userSectionObj.find({
            where: {schoolId: data.school_id,
                sessionId: data.session_id,
                section: {inq: data.section_id_arr},
                class_teacher: "Yes",
                user_type: "Teacher"
            },
            include: {
                relation: 'users',
                scope: {
                    include: {
                        relation: 'staff'
                    }
                }
            }
        }, function (err, userSecRes) {
            userSecRes = Dedupe(userSecRes, ['userId'])
            var classStudParam = {
                school_id: data.school_id,
                session_id: data.session_id,
                section_id_arr: data.section_id_arr,
                allData: userSecRes,
                from_date: data.from_date
            }
            Studentatendance.getClassWiseStudent(classStudParam, function (err, classWiseStud) {

                classWiseStud['userSecRes'] = userSecRes;

                return cb(null, classWiseStud)
            });

        });

    };

    Studentatendance.getClassWiseStudent = function (data, cb) {
        var userSectionObj = Studentatendance.app.models.user_sections;
        if(!data.user_type){
            data.user_type = "Student";
        }
        if(data.user_type == 'Parent'){
            data.user_type = "Student"
        }
        
        var userRelations = {};
        
        if (data.type == 'usage') {
            userRelations.include = {
                relation: 'users',
                scope: {
                    where:{status:'Active'},
                    include:{
                        relation:"students",
                        scope:{
                            where:{status:'Active'},
                            include : {
                                relation :"studentbelongtoparent",
                                scope :{
                                    include :{
                                        relation : "parentidbyuser"
                                    }
                                }
                            }
                        },
                    }
                }
            };
        }else{
            userRelations.include = {
                relation: 'users'
            }
        }
        
        userSectionObj.find({
            where: {schoolId: data.school_id,
                    sessionId: data.session_id,
                    section: {inq: data.section_id_arr},
                    user_type: data.user_type
                },
                include:userRelations.include
                
            }, function(err, userStudentRes){
                 
                var attenObj = {
                    school_id: data.school_id,
                    session_id: data.session_id,
                    section_id_arr: data.section_id_arr,
                    from_date: data.from_date
                    };
                Studentatendance.totalAttendance(attenObj, function(err, attenRes){
                var result = {
                    userStudentRes: userStudentRes,
                    attenRes: attenRes
                };
                return cb(null, result);
            })


        })
    };

    Studentatendance.totalAttendance = function (data, cb) {



        if (data.from_date && !data.to_date) {
            data.to_date = data.from_date;
        }
        Studentatendance.find({
            where: {
                and: [
                    {sessionId: data.session_id},
                    {schoolId: data.school_id},
                    {sectionId: {inq: data.section_id_arr}},
                    {attendance_date: {gte: dateFormat(data.from_date, "isoDateTime")}},
                    {attendance_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            },
            include: [{
                    relation: "users",
                    scope: {
                        include: {
                            relation: "students"
                        }
                    }
                }, {
                    relation: "applyleave"
                }]
        }, function (err, res) {
            return cb(null, res)
        });
    }


    Studentatendance.remoteMethod(
            'viewallattendance',
            {
                http: {path: '/viewallattendance', verb: 'post'},
                description: 'view all class wise attendance',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'successMessage', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.attendancepercent = (data, cb) => {
        const objectdata = {
            "Session id": data.session_id,
            "School id": data.school_id,
            "From date": data.from_date,
            "To date": data.to_date
        };

        Studentatendance.validatereq(objectdata, cb);

        Studentatendance.find({
            fields: ["attendance_date", "attendance_status"],
            where: {
                and: [
                    {subjectId: data.subject_id},
                    {sessionId: data.session_id},
                    {schoolId: data.school_id},
                    {attendance_date: {gte: dateFormat(data.from_date, "isoDate")}},
                    {attendance_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            }
        }, (err, res) => {
            let pcount = 0, acount = 0, lcount = 0, ncount = 0, overall = 0, attendance_datearr = []; 
            
            res.forEach( val => {
                attendance_datearr.push(new Date(val.attendance_date).getDate());
                if(val.attendance_status == "P")
                    pcount += 1;
                else if(val.attendance_status == "A")
                    acount += 1; 
                else if(val.attendance_status == "L")
                    lcount += 1; 
            })
            

            let reslength = res.length;
            if(reslength > 0){
                pcount = (pcount/reslength)*100
                acount = (acount/reslength)*100
                lcount = (lcount/reslength)*100
            }

            var todate = new Date(data.to_date);
            var daysrange = [];
            for (var d = new Date(data.from_date); d <= todate; d.setDate(d.getDate() + 1)) {
                daysrange.push(new Date(d).getDate());
            }

            var param = {
                from_date: Studentatendance.getisoDate(new Date(data.from_date)),
                to_date: Studentatendance.getisoDate(new Date(data.to_date)),
                session_id: data.session_id,
                school_id: data.school_id
            }  
            
            Studentatendance.attendancenottaken(param, (err, status, attenNottaken) => { 
                ncount = Math.abs((attenNottaken.notTakenTotalCount/ attenNottaken.allSectionTotalCount)*100);
                overall = (pcount + acount + lcount)/3;

                let Obj = {
                    "present": pcount,
                    "absent": acount,
                    "leave": lcount,
                    "not_taken": ncount,
                    "overall": overall
                }
                return cb(null, {status: "200", message: "Information fetched successfully"}, Obj)
            })
        });
    }

    Studentatendance.isValidDate = d => {
        return d instanceof Date && !isNaN(d);
    }

    Studentatendance.getisoDate = dateobj => {
        if(!Studentatendance.isValidDate(dateobj)){
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
    
    Studentatendance.remoteMethod(
            'attendancepercent',
            {
                http: {path: '/attendancepercent', verb: 'post'},
                description: 'Attendance counts percentage',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'successMessage', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Studentatendance.validatereq = (objectdata, cb) => {
        let msg = {};
        for (var key in objectdata) {
            if (objectdata.hasOwnProperty(key)) {
                if (!objectdata[key]) {
                    msg.status = "201";
                    msg.message = `${key} cannot be blank`;
                    cb(null, msg);
                    return;
                }
            }
        }
    }

    Studentatendance.periodattendance = (data, cb) => {
        const objectdata = {
            "User Id": data.user_id,
            "Section Id": data.section_id,
            "Session id": data.session_id,
            "School id": data.school_id,
            "date": data.attendance_date
        };

        Studentatendance.validatereq(objectdata, cb);
        Studentatendance.find({
            fields: ["batch_start_time", "attendance_status", "subjectId"],
            include: {
                relation: "subject",
                scope: {
                    fields: "subject_name"
                }
            },
            where: 
            {
                and: [
                    {sectionId: data.section_id},
                    {sessionId: data.session_id},
                    {schoolId: data.school_id},
                    {userId: data.user_id},
                    {attendance_date: {gte: dateFormat(data.attendance_date, "isoDate")}},
                    {attendance_date: {lte: dateFormat(data.attendance_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            }
        }, (err, res) => {
            if(err) throw err;
            if(res){ 
                let resarr = [], subject_name;
                res.forEach( obj => {
                    subject_name = '';
                    if(obj.subject()){
                        subject_name = obj.subject().subject_name;  
                    }
                    resarr.push({period: obj.batch_start_time, attendance_status: obj.attendance_status, subject_name: subject_name});
                })
                return cb(null, {status: "200", message: "Information fetched successfully"}, resarr)
            }
        });
       
    }
    
    Studentatendance.remoteMethod(
            'periodattendance',
            {
                http: {path: '/periodattendance', verb: 'post'},
                description: 'Period attendance detail of student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'successMessage', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

};
