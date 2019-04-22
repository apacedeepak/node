'use strict';

module.exports = function(Attendancemaster) {
    Attendancemaster.setAttendanceMaster = function (data, cb) {
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
        }

        var response = Attendancemaster.validaterequest(data);
        if (response.statusCode == "201")
        {
            cb(null, response);
        }

        var insertObj = {
                            userId: data.user_id,
                            sectionId: data.section_id,
                            sessionId: data.session_id,
                            schoolId: data.school_id,
                            status: data.attendance_status,
                            attendanceDate: dateFormat(data.attendance_date, "isoDate"),
                            addedBy: data.added_by,
                            addedDate: dateFormat(data.added_date, "isoDate"),
                            modifiedBy: data.modified_by,
                            modofiedDate: dateFormat(data.modified_date, "isoDate")
                        };
        Attendancemaster.upsert(insertobj, (err, response)=> {
            if(err){
                msg.status = '201';
                msg.message = "Error Occurred";
                cb(null, msg);  
            }
        });                

     };

    Attendancemaster.remoteMethod(
        'setAttendanceMaster',
        {
            http: {path: '/setAttendanceMaster', verb: 'post'},
            description: 'Set the master attentdance parameters',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Attendancemaster.validaterequest = function (data) {
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
