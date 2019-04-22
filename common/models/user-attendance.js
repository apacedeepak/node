'use strict';
var dateFormat = require('dateformat');
module.exports = function (Userattendance) {
    Userattendance.markattendence = function (req, cb) {
        var flag="",promises=[],msg = {};
        console.log()
        req.forEach(function (element) {
            if(element.userId){
            var obj = {
                userId: element.userId,
                in_time: element.in_time,
                out_time: element.out_time,
                extra_day: element.extra_day,
                attendance_status: element.attendance_status,
                date: dateFormat(element.date, "isoDate"),
                schoolId:element.schoolId
            }

            promises.push(new Promise((resolve, reject) => {
            Userattendance.upsertWithWhere({userId: obj.userId, date: obj.date}, obj, function (err, res) {
                if (err) reject(err);
                if(res) resolve("success");
            });
        }));
        }
        }, this);
        Promise.all(promises).then(res => {
            msg.status = "200";
            msg.message = "Information inserted successfully";
            return cb(null, msg);
        })  ; 
}

    

    Userattendance.remoteMethod(
            'markattendence',
            {
                http: {path: '/markattendence', verb: 'post'},
                description: 'Mark user attendece',
                accepts: {arg: 'data', type: 'array', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Userattendance.userattendance = function (req, cb) {
        var msg = {};
        var resp = {};

        if (!req.user_id) {
            msg.status = '201';
            msg.message = 'User id cannot be blank';
            cb(null, msg);
            return;
        }
        if (!req.school_id) {
            msg.status = '201';
            msg.message = 'School id cannot be blank';
            cb(null, msg);
            return;
        }

        var holidayObj = Userattendance.app.models.holiday_master;
        if (!req.month_date) {
            var d = new Date();
            var currentDate = dateFormat(new Date(), "isoDate");
            var day = dateFormat(currentDate, "dd");
            var currentWeekDay = dateFormat(currentDate, "dddd");
            var currentYear = dateFormat(currentDate, "mmmm yyyy");

        } else {
            var currentDate = dateFormat(req.month_date, "isoDate");
            var day = dateFormat(currentDate, "dd");
            var currentWeekDay = dateFormat(currentDate, "dddd");
            var currentYear = dateFormat(currentDate, "mmmm yyyy");
        }
        var fromDate = dateFormat(d, 'yyyy-mm-01');
        var d = new Date(currentDate);
        var toDate = dateFormat(new Date(d.getFullYear(), d.getMonth() + 1, 0), "isoDate");
        resp.currentDate = currentDate;
        resp.currentDay = day;
        resp.currentWeekDay = currentWeekDay;
        resp.currentYear = currentYear;


        var holidayReq = {
            school_id: req.school_id,
            applicable_for: "staff",
            from_date: fromDate,
            to_date: toDate,
        };
        holidayObj.getholidays(holidayReq, function (err, msg, holidays) {
            resp.eventList = holidays.eventList;
            resp.holidayList = holidays.holidayList;
            var attendanceRequest = {
                user_id: req.user_id,
                from_date: fromDate,
                to_date: toDate,
            };
            Userattendance.getuserattendance(attendanceRequest, function (err, msg, attendanceDetails) {
                resp.leaveList = attendanceDetails.leaveList;
                resp.staffAttnDetails = attendanceDetails.staffAttnDetails;
                resp.absentList = attendanceDetails.absentList;

                msg.status = "200";
                msg.message = "Data fetched successfully";
                cb(null, msg, resp)
            });
        });





    }


    Userattendance.remoteMethod(
            'userattendance',
            {
                http: {path: '/userattendance', verb: 'post'},
                description: 'User holiday ,leave and attendance details',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Userattendance.getuserattendance = function (req, cb) {
        var msg = {};
        var resp = {};
        Userattendance.find({
            include: {
                relation: "leave_apply"
            },
            where: {and: [{userId: req.user_id}, {date: {gte: dateFormat(req.from_date, "isoDate")}}, {date: {lte: dateFormat(req.to_date, "isoDate")}}]}

        }, function (err, res) {
            if (err)
                throw(err);
            var userAttendanceDetails = [];
            var absentDetails = [];
            var userleaveDetails = [];
            res.forEach(function (value) {
                value = value.toJSON();
                if (value.leave_applyId) {
                    var obj = {
                        fix_date: dateFormat(value.date, "isoDate"),
                        date: dateFormat(value.date, "dd"),
                        day: dateFormat(value.date, "dddd"),
                        from_date: dateFormat(value.leave_apply.from_date, "isoDate"),
                        to_date: dateFormat(value.leave_apply.to_date, "isoDate"),
                        reason: value.leave_apply.cause,
                        reject_reason: value.leave_apply.reject_reason,
                        atten_status: value.attendance_status,
                        leave_status: value.status,
                    };
                    userleaveDetails.push(obj);

                } else {
                    var obj = {
                        fix_date: dateFormat(value.date, "isoDate"),
                        date: dateFormat(value.date, "dd"),
                        day: dateFormat(value.date, "dddd"),
                        in_time: value.in_time,
                        out_time: value.out_time,
                        atten_status: value.attendance_status,
                        leave_status: value.status,
                    };
                    if (value.attendance_status == 'Absent') {
                        absentDetails.push(obj);
                    } else {
                        userAttendanceDetails.push(obj);
                    }

                }


            });
            msg.status = '200';
            msg.message = 'Data fetched successfully';
            resp.leaveList = userleaveDetails;
            resp.staffAttnDetails = userAttendanceDetails;
            resp.absentList = absentDetails;
            cb(null, msg, resp);
        });
    }

};
