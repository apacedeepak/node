'use strict';
var dateFormat = require('dateformat');

module.exports = function (Transfer) {
    var notificationarr = [];
    Transfer.addtransfer = function (data, cb) {

        let msg = {};

        Transfer.find({
            where: { status: {inq:['pending','forward']}, userId: data.userId },

        }, function (err, result) {
            if (err) {

                msg.status = "201";
                msg.message = "error occured";
                return cb(null, msg);
            } if (result.length > 0) {
                msg.status = "200";
                msg.message = "more than 1";
                return cb(null, msg);
            }

            Transfer.upsert(data, function (error, res) {
                if (error) {
                    console.log(error);
                    msg.status = "201";
                    msg.message = "error occured";
                    return cb(null, msg);
                }
           
                msg.status = "200";
                msg.message = "successful";
                var transfer_id = res.id
                var notification_text = "Transfer Request Has Been Raised"
                Transfer.addNotificationList(data.userId, transfer_id, "Transfer", notification_text);
                var Notification = Transfer.app.models.notification;
                Notification.pushnotification(notificationarr);
                return cb(null, msg);
            });
        });
    };
    Transfer.remoteMethod(
        'addtransfer',
        {
            http: { path: '/addtransfer', verb: 'post' },
            description: 'Add transfer request',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Transfer.transferdetails = function (data, cb) {

        Transfer.find({
            where: { userId: data.userId },
            include: [{ relation: "assigned_sections" }, { relation: "requested_sections" },
            { relation: "assigned_center" }, { relation: "requested_center" }
            ]
        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'transferdetails',
        {
            http: { path: '/transferdetails', verb: 'post' },
            description: 'display transfer request',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Transfer.allcenterrecords = function (data, cb) {
        Transfer.find({
            where: { school_id: data.school_id, transfer_type: "Center Transfer" },
            include: [{
                relation: "section",
                scope: {
                    include: [{ relation: "board" }]

                }
            }, { relation: "course_mode" }, { relation: "transfer_from_center" }, { relation: "transfer_to_center" },
            {
                relation: "user",
                scope: { include: { relation: "students" } }
            }
            ]
        }, function (err, result) {

            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'allcenterrecords',
        {
            http: { path: '/allcenterrecords', verb: 'post' },
            description: 'allcenterrecords',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Transfer.allbatchrecords = function (data, cb) {
        Transfer.find({
            where: { school_id: data.school_id, transfer_type: "Batch Transfer" },
            include: [{
                relation: "section",
                scope: {
                    include: [{ relation: "board" }]

                }
            }, { relation: "course_mode" }, { relation: "transfer_from_batch" }, { relation: "transfer_to_batch" },
            {
                relation: "user",
                scope: { include: { relation: "students" } }
            }
            ]
        }, function (err, result) {

            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'allbatchrecords',
        {
            http: { path: '/allbatchrecords', verb: 'post' },
            description: 'allbatchrecords',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Transfer.filterrecordscenter = function (data, cb) {
      
        var whereObj = {};

        var userId;
        var status
        if (data.userId) {
            userId = data.userId
        }
        if (data.status) {
            status = data.status
        }



        whereObj = {
            transfer_type: "Center Transfer",
            userId: userId,status:status,assigned_school_id:data.school_id

        }



        Transfer.find({
            where: whereObj,
            include: [{ relation: "assigned_sections" }, { relation: "requested_sections" },
            { relation: "assigned_center" }, { relation: "requested_center" },
            { relation: "assigned_boards" },{ relation: "requested_boards" }
            ]
        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'filterrecordscenter',
        {
            http: { path: '/filterrecordscenter', verb: 'post' },
            description: 'filterrecordscenter',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Transfer.forwardedrequest = function (data, cb) {
      
        var whereObj = {};

        // var userId;
        var status
        // if (data.userId) {
        //     userId = data.userId
        // }
        if (data.status) {
            status = data.status
        }



        whereObj = {
            transfer_type: "Center Transfer",
           status:status,	requested_school_id:data.school_id

        }



        Transfer.find({
            where: whereObj,
            include: [{ relation: "assigned_sections" }, { relation: "requested_sections" },
            { relation: "assigned_center" }, { relation: "requested_center" },
            { relation: "assigned_boards" },{ relation: "requested_boards" },
            {relation:"user",
            scope: {
                include: [{ relation: "students" }]

            }
        }
            ]
        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'forwardedrequest',
        {
            http: { path: '/forwardedrequest', verb: 'post' },
            description: 'forwardedrequest',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );



    Transfer.filterrecordsbatch = function (data, cb) {

        var whereObj = {};

        var userId;

        var status

        if (data.userId) {
            userId = data.userId
        }
        if (data.status) {
            status = data.status
        }


        whereObj = { userId: userId, transfer_type: "Batch Transfer",status:status,assigned_school_id:data.school_id}


        Transfer.find({
            where: whereObj,
            include: [{ relation: "assigned_sections" }, { relation: "requested_sections" },
            { relation: "assigned_center" }, { relation: "requested_center" },
            { relation: "assigned_boards" },{ relation: "requested_boards" }
            ]
        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'filterrecordsbatch',
        {
            http: { path: '/filterrecordsbatch', verb: 'post' },
            description: 'filterrecordsbatch',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


    Transfer.approvebatch = function (req, cb) {
        var msg = {};

        var obj = {
            'status': req.status,
            "requested_sectionId":req.sectionId,
            "requested_boardId":req.boardId,
            "requested_classId":req.classId,
            "approve_reject_date":new Date()
        }

        Transfer.upsertWithWhere({ userId: req.userId, status: "pending" }, obj, function (err, data) {
            if (err) {
                throw (err);
            }
            msg.status = "200";
            msg.message = "data added successfully";
            var transfer_id = data.id
            var notification_text = "Transfer Request Has Been Approved"
            Transfer.addNotificationList(req.userId, transfer_id, "Transfer", notification_text);
            var Notification = Transfer.app.models.notification;
            Notification.pushnotification(notificationarr);
            cb(null, msg, data);

        });
    }
    Transfer.remoteMethod(
        'approvebatch',
        {
            http: { path: '/approvebatch', verb: 'post' },
            description: 'approvebatch',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    Transfer.approvecenter = function (req, cb) {
        var msg = {};

        var obj = {
            'status': req.status,
            "requested_sectionId":req.sectionId,
            "requested_boardId":req.boardId,
            "requested_classId":req.classId,
            "approve_reject_date":new Date()
        }

        Transfer.upsertWithWhere({ userId: req.userId, status: "forward" }, obj, function (err, data) {
            if (err) {
                throw (err);
            }
            msg.status = "200";
            msg.message = "data added successfully";
            var transfer_id = data.id
            var notification_text = "Transfer Request Has Been Approved"
            Transfer.addNotificationList(req.userId, transfer_id, "Transfer", notification_text);
            var Notification = Transfer.app.models.notification;
            Notification.pushnotification(notificationarr);
            cb(null, msg, data);

        });
    }
    Transfer.remoteMethod(
        'approvecenter',
        {
            http: { path: '/approvecenter', verb: 'post' },
            description: 'approvecenter',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    Transfer.rejectrequest = function (req, cb) {
        var msg = {};

        var obj = {
            'status': req.status,
            'response_date': new Date()
        }

        Transfer.upsertWithWhere({ userId: req.userId, status: "pending" }, obj, function (err, data) {
            if (err) {
                throw (err);
            }
            msg.status = "200";
            msg.message = "Request rejected successfully";
            var transfer_id = data.id
            var notification_text = "Transfer Request Has Been Rejected"
            Transfer.addNotificationList(req.userId, transfer_id, "Transfer", notification_text);
            var Notification = Transfer.app.models.notification;
            Notification.pushnotification(notificationarr);
            cb(null, msg, data);

        });
    }
    Transfer.remoteMethod(
        'rejectrequest',
        {
            http: { path: '/rejectrequest', verb: 'post' },
            description: 'rejectrequest',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    Transfer.transferpending = function (data, cb) {

        Transfer.find({
            where: { userId: data.userId, status: 'pending', transfer_type: "Batch Transfer" },
            include: [{ relation: "sections" }, { relation: "course_mode" }
            ]
        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'transferpending',
        {
            http: { path: '/transferpending', verb: 'post' },
            description: 'display transfer request',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Transfer.transferforward = function (data, cb) {

        Transfer.findOne({
            where: { userId: data.userId, status: data.status, transfer_type: "Center Transfer", school_id: data.schoolId },
            include: [{ relation: "sections" }, { relation: "course_mode" }
            ]
        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Transfer.remoteMethod(
        'transferforward',
        {
            http: { path: '/transferforward', verb: 'post' },
            description: 'transferforward',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Transfer.updateschool = function (req, cb) {
        var msg = {};

        var obj = {
            'status': req.status,
          
        }

        Transfer.upsertWithWhere({ userId: req.userId, status: "pending" }, obj, function (err, data) {
            if (err) {
                throw (err);
            }
            msg.status = "200";
            msg.message = "data added successfully";
            var transfer_id = data.id
            var notification_text = "Transfer Request Has Been Forward"
            Transfer.addNotificationList(req.userId, transfer_id, "Transfer", notification_text);
            var Notification = Transfer.app.models.notification;
            Notification.pushnotification(notificationarr);
            cb(null, msg, data);

        });
    }
    Transfer.remoteMethod(
        'updateschool',
        {
            http: { path: '/updateschool', verb: 'post' },
            description: 'updateschool',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    Transfer.updatesrejectstatus = function (req, cb) {
        var msg = {};

        var obj = {
            'status': req.status
         
        }

        Transfer.upsertWithWhere({ userId: req.userId, status: "forward",requested_school_id:req.school_id }, obj, function (err, data) {
            if (err) {
                throw (err);
            }
            msg.status = "200";
            msg.message = "data added successfully";
            var transfer_id = data.id
            var notification_text = "Transfer Request Has Been Rejected"
            Transfer.addNotificationList(req.userId, transfer_id, "Transfer", notification_text);
            var Notification = Transfer.app.models.notification;

            Notification.pushnotification(notificationarr);
            cb(null, msg, data);

        });
    }
    Transfer.remoteMethod(
        'updatesrejectstatus',
        {
            http: { path: '/updatesrejectstatus', verb: 'post' },
            description: 'updatesrejectstatus',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    Transfer.updatesforwardstatus = function (req, cb) {
        var msg = {};

        var obj = {
            'status': req.status,
            "sectionId": req.sectionId,
            "sessionId": req.sessionId
        }

        Transfer.upsertWithWhere({ userId: req.userId }, obj, function (err, data) {
            if (err) {
                throw (err);
            }
            msg.status = "200";
            msg.message = "data added successfully";
            var transfer_id = data.id
            var notification_text = "Transfer Request Has Been Accepted"
            Transfer.addNotificationList(req.userId, transfer_id, "Transfer", notification_text);
            var Notification = Transfer.app.models.notification;
            Notification.pushnotification(notificationarr);
            cb(null, msg, data);

        });
    }
    Transfer.remoteMethod(
        'updatesforwardstatus',
        {
            http: { path: '/updatesforwardstatus', verb: 'post' },
            description: 'updatesforwardstatus',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    Transfer.addNotificationList = function (userid, transfer_id, title, notificationtext) {
        var notificationobj = {};
        notificationobj.user_id = userid;
        notificationobj.module_key_id = transfer_id;
        notificationobj.type = 4;
        notificationobj.title = title;
        notificationobj.notification_text = notificationtext;
        notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
        notificationarr.push(notificationobj);
    }
};
