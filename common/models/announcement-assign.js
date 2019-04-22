'use strict';
var dateFormat = require('dateformat');
var arraySort = require('array-sort');
var constantval = require('./constant');
module.exports = function (Announcementassign) {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '-' + mm + '-' + dd;

    Announcementassign.createannouncementassign = (data, cb) => {
        let success = {};
        let User = Announcementassign.app.models.user;
        for (let key in data.userId) {
            //            User.getuserbyolduserid({"user_id": data.userId[key]}, (err,res)=>{
            //              if(res != '' && res != undefined && res != ''){
            let param = {
                'userId': data.userId[key],
                'user_type': data.user_type,
                'announcementId': data.announcementId,
                'status': data.status,
                'read_status': data.read_status,
                //'schoolId':data.school_id
            };
            Announcementassign.upsert(param, (err, details) => {
            });
            //              }
            //            })
        }
        success.message = "200";
        cb(null, success);

    };

    Announcementassign.remoteMethod(
        'createannouncementassign',
        {
            http: { path: '/createannouncementassign', verb: 'post' },
            description: 'create notice and circular',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    Announcementassign.announcereadstatus = (data, cb) => {

        Announcementassign.upsert(data, (err, details) => {
            // success.message = "200";
            // cb(null,success);
        });



    };

    Announcementassign.remoteMethod(
        'announcereadstatus',
        {
            http: { path: '/announcereadstatus', verb: 'post' },
            description: 'create notice and circular',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


    Announcementassign.assignedannouncments = function (req, cb) {
        var msg = {};
        if (!req.user_id) {
            msg.status = "201";
            msg.message = "User id cannot empty";
            cb(null, msg);
            return;
        }
        if (!req.school_id) {
            msg.status = "201";
            msg.message = "School id cannot empty";
            cb(null, msg);
            return;
        }
        if (!req.user_type) {
            msg.status = "201";
            msg.message = "User Type cannot empty";
            cb(null, msg);
            return;
        }
        var parentFlag = 0;
        if (req.user_type.toLowerCase() == 'teacher') {
            var school_id_check = req.school_id;
        }

        if (req.user_type.toLowerCase() == 'parent') {
            parentFlag = 1;
        }


        Announcementassign.find(
            {
                include: {
                    relation: "announcement",
                    scope: {
                        where: { type: req.type }
                    }
                },
                where: { and: [{ userId: req.user_id }, { type: req.type }, { announcementId: req.announce_id }, { is_parent: parentFlag }] },
                limit: req.limit,
            }, function (err, res) {


                if (err)
                    throw (err);


                if (req.announce_id) {
                    let sendParam = {
                        userId: res[0].userId,
                        user_type: res[0].user_type,
                        announcementId: res[0].announcementId,
                        status: res[0].status,
                        read_status: 1,
                        id: res[0].id
                    };
                    Announcementassign.announcereadstatus(sendParam, (err, getData) => { });

                }
                var noticeArr = [];
                var circularArr = [];
                var noticeCircular = [];
                let noticeCount = 0;
                let circularCount = 0;
                let allNotCirCount = 0;
                res.forEach(function (value) {
                    value = value.toJSON();

                    if (value.announcement && dateFormat(value.announcement.end_date, "yyyy-mm-dd") >= dateFormat(Date(), "yyyy-mm-dd")) {
                        if (value.read_status == 0) {
                            allNotCirCount = allNotCirCount + 1;
                        }

                        var objects = {
                            title: value.announcement.title,
                            description: value.announcement.description.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
                            attachments: value.announcement.attachments,
                            created_date: dateFormat(value.announcement.created_date, "yyyy-mm-dd HH:MM:ss"),
                            created_date_app: dateFormat(value.announcement.created_date, "isoDateTime"),
                            start_date: dateFormat(value.announcement.start_date, "isoDate"),
                            end_date: dateFormat(value.announcement.end_date, "isoDate"),
                            isread: value.read_status,
                            announce_id: value.announcementId,
                            displayName: value.announcement.type,
                            projectName: constantval.PROJECT_NAME,
                            today_date: today,
                            displayTime: Date.parse(today) == Date.parse(dateFormat(value.announcement.created_date, "yyyy-mm-dd")) ? '1' : '0'
                        }
                        noticeCircular.push(objects);


                        if (value.announcement.type == 'Notice') {
                            if (value.read_status == 0) {
                                noticeCount = noticeCount + 1;
                            }
                            var obj = {
                                title: value.announcement.title,
                                description: value.announcement.description.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
                                attachments: value.announcement.attachments,
                                created_date: dateFormat(value.announcement.created_date, "yyyy-mm-dd HH:MM:ss"),
                                created_date_app: dateFormat(value.announcement.created_date, "isoDateTime"),
                                start_date: dateFormat(value.announcement.start_date, "isoDate"),
                                end_date: dateFormat(value.announcement.end_date, "isoDate"),
                                isread: value.read_status,
                                announce_id: value.announcementId,
                                projectName: constantval.PROJECT_NAME,
                                today_date: today,
                                displayTime: Date.parse(today) == Date.parse(dateFormat(value.announcement.created_date, "yyyy-mm-dd")) ? '1' : '0'
                            }
                            noticeArr.push(obj);
                        } else {
                            if (value.read_status == 0) {
                                circularCount = circularCount + 1;
                            }
                            var obj = {
                                title: value.announcement.title,
                                description: value.announcement.description.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
                                attachments: value.announcement.attachments,
                                created_date: dateFormat(value.announcement.created_date, "yyyy-mm-dd HH:MM:ss"),
                                created_date_app: dateFormat(value.announcement.created_date, "isoDateTime"),
                                start_date: dateFormat(value.announcement.start_date, "isoDate"),
                                end_date: dateFormat(value.announcement.end_date, "isoDate"),
                                isread: value.read_status,
                                announce_id: value.announcementId,
                                projectName: constantval.PROJECT_NAME,
                                today_date: today,
                                displayTime: Date.parse(today) == Date.parse(dateFormat(value.announcement.created_date, "yyyy-mm-dd")) ? '1' : '0'
                            }
                            circularArr.push(obj);
                        }
                    }
                });

                var res = {};
                var noticeArr = arraySort(noticeArr, 'announce_id', { reverse: true });
                var circularArr = arraySort(circularArr, 'announce_id', { reverse: true });
                var noticeCircular = arraySort(noticeCircular, 'announce_id', { reverse: true });
                res.notice = noticeArr;
                res.circular = circularArr;
                res.noticeCount = noticeCount;
                res.circularCount = circularCount;
                res.noticeCircular = noticeCircular;
                res.allNotCirCount = allNotCirCount;
                msg.status = "200";
                msg.message = "Data fetched successfully";
                cb(null, msg, res)
            });
    }

    Announcementassign.remoteMethod(
        'assignedannouncments',
        {
            http: { path: '/assignedannouncments', verb: 'post' },
            description: 'Get notice and circular',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

    Announcementassign.assignannouncement = (data, cb) => {
        let success = {};
        let User = Announcementassign.app.models.user;
        for (let key in data.userId) {
            let param = {};
            param = {
                'userId': data.userId[key],
                'user_type': data.user_type,
                'announcementId': data.announcementId,
                'status': data.status,
                'read_status': data.read_status
            };

            Announcementassign.upsert(param, (err, details) => {
                if (err) {
                    return err;
                } else {
                    //success.status = "200";
                    //success.message = "Created Successfully";
                    // cb(null,success);
                }
            });
        }
        success.status = "200";
        success.message = "Created Successfully";
        cb(null, success);
    };

    Announcementassign.remoteMethod(
        'assignannouncement',
        {
            http: { path: '/assignannouncement', verb: 'post' },
            description: 'create notice and circular',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


    /*
  * Get All Send user list of Announcement
  */
    Announcementassign.getalluserlistannouncement = function (announcementId, cb) {
        let msg = {};
        Announcementassign.find(
            {
                where: { announcementId: announcementId},
                include:
                    [
                        {
                            relation: "announcementUser",
                            scope: {
                                fields: ["user_name"],
                                include: [
                                    {
                                        relation: "user_belongs_to_staff",
                                        scope: {
                                            fields: ["name"]
                                        }
                                    }, {
                                        relation: "students",
                                        scope: {
                                          fields: ["name","userId"]
                                        }
                                    }
                                ]
                            }
                        }
                    ]

            }, (err, res) => {
                if (err)
                    console.error(err);
                if(res){
                    let finalArr = [];
                    res.forEach(function(element) {
                        let finalObj = {};
                        finalObj.userId = element.userId;
                        finalObj.user_type = element.user_type;
                        if(element.user_type=='Student' && element.announcementUser().students()!=""){
                            finalObj.announcement_user_name =element.announcementUser().students().name
                        }else if(element.user_type=='Teacher' && element.announcementUser().user_belongs_to_staff()!=""){
                            finalObj.announcement_user_name =element.announcementUser().user_belongs_to_staff().name
                        }else{
                            finalObj.announcement_user_name =""; 
                        }

                        if(element.announcementUser()!=""){
                           finalObj.announcement_userName =element.announcementUser().user_name; 
                        }else{
                           finalObj.announcement_userName ="";   
                        }
 
                        finalArr.push(finalObj);
                    });
                    return cb(null, finalArr);
                }else{
                    msg.status = '201';
                    msg.message = "No Result";
                    return cb(null, msg); 
                }    
            });
         
  }

  Announcementassign.remoteMethod("getalluserlistannouncement", {
        http: { path: "/getalluserlistbyannouncement", verb: "get" },
        description: "Get All user list by announcement Id ",
        accepts: { arg: "announcementId", type: "number", required: true },
        returns: { arg: "response", type: "json" }

        // http: { path: '/getalluserlistbyannouncement', verb: 'post' },
        // description: "Get All user list by announcement Id ",
        // accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        // returns: { arg: 'response', type: 'json' }
  });

};
