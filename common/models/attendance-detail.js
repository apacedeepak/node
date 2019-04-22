'use strict';

module.exports = function(Attendancedetail) {
    Attendancedetail.setAttendanceMaster = function (data, cb) {
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }

        var response = Attendancedetail.validaterequest(data);
        if(response.statusCode == "201")
        {
            cb(null, response);
        }

        var insertObj = {
                            attendanceMasterId: data.attendance_master_id,
                            userId: data.user_id,
                            status: data.status,
                            attendanceStatus: data.attendance_status,
                            remark: data.remark,
                            addedBy: data.added_by,
                            addedDate: dateFormat(data.added_date, "isoDate"),
                            modifiedBy: data.modified_by,
                            modofiedDate: dateFormat(data.modified_date, "isoDate")
                        };
        Attendancedetail.upsert(insertobj, (err, response)=> {
            if(err){
                msg.status = '201';
                msg.message = "Error Occurred";
                cb(null, msg);  
            }
        });                

     };

    Attendancedetail.remoteMethod(
        'setAttendancedetail',
        {
            http: {path: '/setAttendancedetail', verb: 'post'},
            description: 'Set the master attentdance parameters',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Attendancedetail.validaterequest = function (data) {
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
        if (!data.subject_id) {
            msg.status = '201';
            msg.message = "Subject id Cannot blank";
            return   msg;
        }
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
};
