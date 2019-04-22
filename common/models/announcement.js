"use strict";
var Dedupe = require("array-dedupe");
var arraySort = require("array-sort");
var dateFormat = require("dateformat");
module.exports = function (Announcement) {
  var notificationarr = [];
  Announcement.createannouncement = (data, cb) => {
    let announcementAssignObj = Announcement.app.models.announcement_assign;
    let userObj = Announcement.app.models.user;

    let successMessage = {};


    let param = {
      type: data.type,
      title: data.title,
      description: data.description,
      attachments: data.attachments,
      start_date: data.start_date,
      end_date: data.end_date,
      status: "Active",
      created_date: data.created_date,
      userId: data.senderId
    };

    Announcement.upsert(param, (err, res) => {
      if (err) {
        cb(null, err);
      } else {
        let notificationarrForParent = [];
        let notificationarr = [];
        let type = 3;
        if (res.type == "Notice") {
          type = 2;
        }
        let promise = [];
        var lengthCount = data.userId.length - 1;
        for (let key in data.userId) {
          promise = new Promise((resolve, reject) => { });
          if (res.userId > 0 && data.userId[key]) {
            userObj.getuserbyid(res.userId, function (err, getSenderData) {

              if (data.user_type == 'Teacher') {
                var dataSet = [];
                dataSet.push(data);
                dataSet.push(res);
                dataSet.push(getSenderData);
                Announcement.teacherannouncement(dataSet, (err, ress) => {
                  //  console.log("createannouncement---------teacherannouncement");
                });

              } else {

                userObj.getuserbyid(data.userId[key], function (err, getParentData) {
                  let notificationobj = {};
                  let notificationobjForParent = {};

                  notificationobj.user_id = data.userId[key];
                  notificationobj.module_key_id = res.id;
                  notificationobj.type = type;
                  notificationobj.title = "New " + res.type + " Received";
                  notificationobj.notification_text =
                    res.type + " From " + getSenderData.user_name;
                  notificationobj.created_date = dateFormat(
                    Date(),
                    "yyyy-mm-dd HH:MM:ss"
                  );
                  notificationarr.push(notificationobj);

                  if (
                    data.user_type.toLowerCase() == "student" &&
                    getParentData.students().studentbelongtoparent()
                  ) {
                    if (getParentData.students()) {
                      notificationobjForParent.user_id = getParentData
                        .students()
                        .studentbelongtoparent().userId;
                      notificationobjForParent.module_key_id = res.id;
                      notificationobjForParent.type = type;
                      notificationobjForParent.title =
                        "New " + res.type + " Received";
                      notificationobjForParent.notification_text =
                        res.type + " From " + getSenderData.user_name;
                      notificationobjForParent.created_date = dateFormat(
                        Date(),
                        "yyyy-mm-dd HH:MM:ss"
                      );
                      notificationarrForParent.push(notificationobjForParent);
                    }
                  }


                  let params = {
                    userId: data.userId[key],
                    user_type: data.user_type,
                    announcementId: res.id,
                    status: data.status,
                    read_status: data.read_status,
                    schoolId: data.assign_centre,
                    is_parent: 0
                  };

                  announcementAssignObj.upsert(params, (err, details) => {
                    if (params.user_type.toLowerCase() == "student") {
                      params.is_parent = 1;
                      announcementAssignObj.upsert(
                        params,
                        (error, parentInsert) => { }
                      );
                    }
                    if (notificationarr.length > 0 && lengthCount == key) {
                      var Notification = Announcement.app.models.notification;

                      Notification.pushnotification(notificationarr);
                      if (data.user_type.toLowerCase() == "student") {
                        Notification.pushnotification(notificationarrForParent);
                      }
                    }
                  });
                });

              }

            });

          }
        }

        successMessage.status = "200";
        successMessage.message = "Message Sent Successfully";
        return cb(null, res);
      }
    });
  };

  Announcement.updateannouncement = (data, cb) => {
    let successMessage = {};
    Announcement.upsert(data, (err, res) => {
      if (err) {
        cb(null, err);
      } else {
        successMessage.status = "200";
        successMessage.message = "Message Updated Successfully";
        return cb(null, res);
      }
    });
  };

  Announcement.remoteMethod("updateannouncement", {
    http: { path: "/updateannouncement", verb: "post" },
    description: "create notice and circular",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Announcement.remoteMethod("createannouncement", {
    http: { path: "/createannouncement", verb: "post" },
    description: "create notice and circular",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Announcement.allannouncement = (data, cb) => {
    var where_condition = {};
    if (data.from_date && data.to_date) {
      where_condition.where = {
        and: [
          {
            created_date: {
              gte: dateFormat(data.from_date, "yyyy-mm-dd'T'00:00:00")
            }
          },
          {
            created_date: {
              lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")
            }
          },
          { status: "Active", id: data.id }
        ]
      };
    } else {
      where_condition.where = { status: "Active", id: data.id };
    }

    Announcement.find(
      {
        where: where_condition.where,
        include: [
          {
            relation: "announcements"
          },
          {
            relation: "createdBy"
          }
        ]
      },
      (err, res) => {
        if (err) {
          return cb(null, err);
        } else {
          var archivedSort = arraySort(res, "created_date", { reverse: true });
          return cb(null, archivedSort);
        }
      }
    );
  };

  Announcement.remoteMethod("allannouncement", {
    http: { path: "/allannouncement", verb: "post" },
    description: "get all announcement",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  /*******Add Announcement************** */

  Announcement.teacherannouncement = (datas, cb) => {
    let announcementAssignObj = Announcement.app.models.announcement_assign;
    var data = datas[0];
    var res = datas[1];
    var getSenderData = datas[2];
    let notificationarr = [];

    var lengthCount = data.userId.length - 1;
    for (let key in data.userId) {

      let type = 3;
        if (data.type == "Notice") {
          type = 2;
        }

      let notificationobj = {};
      notificationobj.user_id = data.userId[key];
      notificationobj.module_key_id = res.id;
      notificationobj.type = type;
      notificationobj.title = "New " + res.type + " Received";
      notificationobj.notification_text =
        res.type + " From " + getSenderData.user_name;
      notificationobj.created_date = dateFormat(
        Date(),
        "yyyy-mm-dd HH:MM:ss"
      );
      //notificationarr.push(notificationobj);

      let params = {
        userId: data.userId[key],
        user_type: data.user_type,
        announcementId: res.id,
        status: data.status,
        read_status: data.read_status,
        schoolId: data.assign_centre,
        is_parent: 0
      };

      announcementAssignObj.upsert(params, (err, details) => {
        if (params.user_type.toLowerCase() == "teacher") {
          params.is_parent = 1;
          announcementAssignObj.upsert(
            params,
            (error, parentInsert) => { }
          );
        }
        notificationarr.push(notificationobj);
        if (notificationarr.length > 0 ) {
          var Notification = Announcement.app.models.notification;
          Notification.pushnotification(notificationarr);
        }
      });
      /********************* */

    }



  }






  Announcement.addannouncement = (ctx, options, cb) => {
    var FileUpload = Announcement.app.models.fileupload;
    var errorMessage = {};
    var successMessage = {};
    var AnnounceMentArr = {};

    FileUpload.fileupload(ctx, options, "announcement", function (err, data) {
      if (
        data.status != undefined &&
        (data.status == "201" || data.status == "000")
      ) {
        errorMessage.status = data.status;
        errorMessage.message = data.message;
        return cb(null, errorMessage);
      }

      var filepath = data.file_path[0];

      var reqParam = {
        school_id: data.assign_centre
      }
      var dataSetArry = "";
      if (data.batch == "student") {
        var UserSet = [];
        var UserSchools = Announcement.app.models.user_school;
        UserSchools.getallstudentuserbyschoolid(reqParam, function (err, resStudentData) {
          resStudentData.data.forEach(element => {
            var studentbelongtoparent = {
              userId: element.user_id
            };

            UserSet.push(element.user_id);

          });

          dataSetArry = UserSet;
          AnnounceMentArr = {
            senderId: data.senderId,
            title: data.title,
            type: data.type,
            batch: data.batch,
            description: data.description,
            attachments: filepath,
            status: data.status,
            start_date: data.start_date,
            end_date: data.end_date,
            created_date:new Date(),
            assign_centre: data.assign_centre,
            userId: UserSet,
            user_type: "Student"
          };


          Announcement.createannouncement(AnnounceMentArr, (err, ress) => {
            cb(null, ress);
          });
        })
      }

      if (data.batch == "teacher") {
        var UserSet = [];
        var UserSchools = Announcement.app.models.user_school;
        UserSchools.getalluserbyschoolid(reqParam, function (err, resStudentData) {
          resStudentData.data.forEach(element => {
            var studentbelongtoparent = {
              userId: element.user_id
            };

            UserSet.push(element.user_id);

          });
          dataSetArry = UserSet;
          AnnounceMentArr = {
            senderId: data.senderId,
            title: data.title,
            type: data.type,
            batch: data.batch,
            description: data.description,
            attachments: filepath,
            status: data.status,
            start_date: data.start_date,
            end_date: data.end_date,
            assign_centre: data.assign_centre,
            userId: UserSet,
            user_type: "Teacher"
          };

          Announcement.createannouncement(AnnounceMentArr, (err, ress) => {

            cb(null, ress);
          });
        })
      }




    });
  };

  Announcement.remoteMethod("addannouncement", {
    description: "Add/Edit Announcement",
    accepts: [
      { arg: "ctx", type: "object", http: { source: "context" } },
      { arg: "options", type: "object", http: { source: "query" } }
    ],
    returns: {
      arg: "fileObject",
      type: "object",
      root: true
    },
    http: { verb: "post" }
  });






};
