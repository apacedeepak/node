'use strict';
var dateFormat = require('dateformat');

module.exports = function (Leaveapply) {

    Leaveapply.userleaves = function (data, cb) {
        var msg = {};
        if (!data.user_id) {
            msg.status = '201';
            msg.message = 'User id cannot be empty';
            cb(null, msg);
        }
        Leaveapply.find({
            fields: ["id", "leave_date", "cause", "day", "from_date", "to_date", "leave_masterId", "status","added_date","day","reject_reason"],
            include: {
                relation: "leave_master",
                scope: {
                    fields: ["leave_name", "halfday_applicable", "abbrevation"],
                }
            },
            where: {userId: data.user_id}
        }, function (err, result) {

            if (err) {
                msg.status = '201';
                msg.message = 'No Record Found';
                cb(null, msg);

            } else {
                var responseArr = [];
                result.forEach(function (value) {
                    value = value.toJSON();
                    var responseObj = {
                        id: value.id,
                        leave_name: value.leave_master.leave_name,
                        abbrevation: value.leave_master.abbrevation,
                        from_date: dateFormat(value.from_date, "isoDate"),
                        to_date: dateFormat(value.to_date, "isoDate"),
                        status: value.status,
                        added_date:dateFormat(value.added_date, "isoDate"),
                        cause: value.cause,
                        day:value.day,
                        reject_reason:value.reject_reason
                    }
                    responseArr.push(responseObj);
                });
                msg.status = '200';
                msg.message = 'Record Fetched Successfully';
                cb(null, msg, responseArr);
            }

        })
    };

    Leaveapply.validateleave = function (filterObj, leaveDate,cb) {
     
        return new Promise(function (resolve, reject) {

            var attendanceObj = Leaveapply.app.models.user_attendance;
            attendanceObj.find({
                where: filterObj
            }, function (err, res) {
                if (res.length > 0) {
                    resolve(false);
                } else {
                    resolve(leaveDate);
                }


            });
        })
    }
    Leaveapply.applyleave = function (data, cb) {

        var msg = {};
        var attendanceObj = Leaveapply.app.models.user_attendance;
        var leaveDetailObj = Leaveapply.app.models.leave_details;

        var res = Leaveapply.validaterequest(data);
        if (res.status == '201') {
            cb(null, data);
        }
        var fromDate = dateFormat(data.from_date);
        var toDate = dateFormat(data.to_date);
        var now = new Date(toDate);
        var promise = [];
        for (var d = new Date(fromDate); d <= now; d.setDate(d.getDate() + 1)) {
            var leaveDate = dateFormat(d, "isoDate");
            var filterObj = {and: [{date: leaveDate}, {userId: data.userId}, {status: "Applied"}]};
            promise.push(Leaveapply.validateleave(filterObj,leaveDate));


        }


        Promise.all(promise).then(function (response) {
     
            if (response == false) {
                msg.status = "201";
                msg.message = "Leave already applied";
                return cb(null, msg);
            }
            if (response.length > 0) {
                var req = {
                    leave_id: data.leave_masterId,
                    user_id: data.userId,
                    financial_year: dateFormat.financial_yearId
                };
                leaveDetailObj.userleave(req, function (err, leaves) {
                   
                    if (leaves) {
                      
                        var leaveBalance = leaves.gain - leaves.taken;

                        if (response.length > leaveBalance) {
                            msg.status = "201";
                            msg.message = "cannot apply leave";
                            return cb(null, msg);
                        }
                        var takenLeaves = leaves.taken + response.length;

                        leaveDetailObj.update({id: leaves.id}, {taken: takenLeaves}, function (res, err) {

                        });

                        var insertObj = {
                            userId: data.userId,
                            leave_masterId: data.leave_masterId,
                            leave_schemeId: data.leave_schemeId,
                            financial_yearId: data.financial_yearId,
                            cause: data.cause,
                            status: "Applied",
                            day: response.length,
                            from_date: data.from_date,
                            to_date: data.to_date,
                            added_date: dateFormat(new Date(), "isoDate"),
                            reporting_to: data.reporting_to,
                            halfday_start: data.halfday_start,
                            halfday_end: data.halfday_end,
                            schoolId: data.school_auto_id,
                        }
                    
                        Leaveapply.create(insertObj, function (err, res) {
                            var attendObj = {
                                userId: data.userId,
                                leave_applyId: res.id,
                                schoolId: data.school_auto_id,
                                status: "Applied",
                            };
                            response.forEach(function (leaveDate) {
                            
                                attendObj.date = leaveDate;
                                attendanceObj.create(attendObj, function (err, res) {
                                    if (err)
                                        throw(err);
                                });
                            });

                            if (res) {
                                msg.status = "200";
                                msg.message = "leave marked successfully";
                                cb(null, msg);
                            }
                        });
                    }
                    else{
                        msg.status = "201";
                        msg.message = "No Leaves Available";
                        cb(null, msg);

                    }
                });

            } else {
                msg.status = "201";
                msg.message = "Cannot apply leave";
                cb(null, msg);
            }
        });

    };

    Leaveapply.remoteMethod(
            'userleaves',
            {
                http: {path: '/userleaves', verb: 'post'},
                description: 'Get user balance leaves',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Leaveapply.remoteMethod(
            'applyleave',
            {
                http: {path: '/applyleave', verb: 'post'},
                description: 'Apply leave',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Leaveapply.validaterequest = function (data) {
        var msg = {};

        if (!data.user_id) {
            msg.status = '201';
            msg.status = 'User Id cannot be blank ';
        }
        if (!data.leave_id) {
            msg.status = '201';
            msg.status = 'Leave Id cannot be blank ';
        }
        if (!data.from_date) {
            msg.status = '201';
            msg.status = 'From date cannot be blank ';
        }
        if (!data.to_date) {
            msg.status = '201';
            msg.status = 'To date cannot be blank ';
        }
        if (!data.cause) {
            msg.status = '201';
            msg.status = 'Cause cannot be blank ';
        }

        msg.status = '200';
        msg.message = "Success";
        return msg;
    }
    Leaveapply.cancelleave = function (request, cb) {
        var msg = {};
        var userAttendanceObj = Leaveapply.app.models.user_attendance;
        var leaveDetailsObj = Leaveapply.app.models.leave_details;
        if (!request.leave_id) {
            msg.status = "201";
            msg.message = "Leave id cannot be empty";
            return cb(null, msg);
        }
        var leaveId = request.leave_id;
        Leaveapply.findOne({
            where: {status: "Applied", id: leaveId},
        },
                function (err, res) {
                    if (res) {
                        var taken = res.day;
                        var req = {
                            leave_id: res.leave_masterId,
                            user_id: res.userId,
                            financial_year: res.financial_yearId
                        };

                        var updateObj = {
                            status: "Canceled"
                        };
                        Leaveapply.update({id: leaveId}, updateObj, function (res, err) {
                            userAttendanceObj.update({leave_applyId: leaveId}, updateObj, function (res, err) {

                                leaveDetailsObj.userleave(req, function (err, leaves) {
                                    var leaveBalance = leaves.taken - taken;
                                    leaveDetailsObj.update({id: leaves.id}, {taken: leaveBalance}, function (res, err) {
                                        msg.status = "200";
                                        msg.message = "Leave canceled successfully";
                                        return cb(null, msg);
                                    });
                                });
                            });

                        });
                    } else {
                        msg.status = "201";
                        msg.message = "Cannot cancel leave";
                        return cb(null, msg);
                    }

                });


    };
    Leaveapply.remoteMethod(
            'cancelleave',
            {
                http: {path: '/cancelleave', verb: 'post'},
                description: 'Cancel Leave',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    /*Get all applied leaves*/

    Leaveapply.getappliedleaves = function (req, cb) {
        var msg = {};
        var resp = {};
        Leaveapply.find(
                {
                    fields: ["id", "leave_masterId", "day", "status", "cause", "from_date", "to_date", "userId"],
                    include: {
                        relation: "user",
                        scope: {
                            fields: ["id"],
                            include:
                                    {
                                        relation: "staff",
                                        scope: {
                                            fields: ["staff_code", "name"]
                                        }
                                    }
                        }
                    },
                    where: {and: [{schoolId: req.school_id, status: "Applied"}]}
                }, function (err, res) {
            if (err)
                throw(err);
            var leaveArr = [];
            if (res.length) {
                res.forEach(function (value) {
                    value = value.toJSON();
                    var obj = {
                        id: value.id,
                        from_date: dateFormat(value.from_date, "isoDate"),
                        to_date: dateFormat(value.to_date, "isoDate"),
                        day: value.day,
                        cause: value.cause,
                        status: value.status,
                        staff_code: value.user.staff.staff_code,
                        staff_name: value.user.staff.name,
                    }
                    leaveArr.push(obj);
                });
            }
            msg.status = "200";
            msg.message = "Data fetched successfully";
            resp.appliedleaves = leaveArr;
            cb(null, msg, resp);
        });

    }

    Leaveapply.remoteMethod(
            'getappliedleaves',
            {
                http: {path: '/getappliedleaves', verb: 'post'},
                description: 'Get applied leaves list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Leaveapply.updateleavestatus = function (request, cb) {
        var msg = {};
        if (!request.id) {
            msg.status = "201";
            msg.message = "Leave id cannot be blank";
            cb(null, msg);
        }
        if (!request.status) {
            msg.status = "201";
            msg.message = "Status cannot be blank";
            cb(null, msg);
        }

        var userAttendanceObj = Leaveapply.app.models.user_attendance;
        var leaveDetailsObj = Leaveapply.app.models.leave_details;

        var leaveIdArr = request.id;
        var leaveStatusArr = request.status;
        var rejectReasonArr = request.rejectreason;
        leaveIdArr.forEach(function (value, key) {
            const leaveId = value;
            const leaveStatus = leaveStatusArr[key];
            const rejectReason = rejectReasonArr[key];

            Leaveapply.findOne({
                where: {status: "Applied", id: leaveId},
            }, function (err, res) {
                var taken = res.day;
                var req = {
                    leave_id: res.leave_masterId,
                    user_id: res.userId,
                    financial_year: res.financial_yearId,
                };


                if (leaveStatus == "Granted") {
                    Leaveapply.update({id: leaveId}, {status: "Granted"}, function (res, err) {
                        userAttendanceObj.update({leave_applyId: leaveId}, {status: "Granted"}, function (res, err) {

                        });
                    });

                } else {
                    Leaveapply.update({id: leaveId}, {status: "Rejected", reject_reason: rejectReason}, function (res, err) {
                        userAttendanceObj.update({leave_applyId: leaveId}, {status: "Rejected"}, function (res, err) {
                            
                            leaveDetailsObj.userleave(req, function (err, leaves) {
                    
                                var leaveBalance = leaves.count - taken;
                                leaveDetailsObj.update({id: leaves.id}, {taken: leaveBalance}, function (res, err) {

                                });
                            });
                        });

                    });
                }
            });

        });
        msg.status = "200";
        msg.message = "Leave updated successfully";
        cb(null, msg);

    };
    Leaveapply.remoteMethod(
            'updateleavestatus',
            {
                http: {path: '/updateleavestatus', verb: 'post'},
                description: 'Approve/Reject leave',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

};
