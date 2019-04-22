"use strict";

module.exports = function(Doubtsmaster) {
  /**
   * Add/Edit Duration
   * * */
  var dateFormat = require('dateformat');

  Doubtsmaster.adddoubts = (ctx, options, cb) => {
    var FileUpload = Doubtsmaster.app.models.fileupload;
    var errorMessage = {};
    var successMessage = {};
    var DoubtsArr = {};
  
    


    FileUpload.fileupload(ctx, options, "doubts", function(err, data) {
      if (
        data.status != undefined &&
        (data.status == "201" || data.status == "000")
      ) {
        errorMessage.status = data.status;
        errorMessage.message = data.message;
        return cb(null, errorMessage);
      }

      // var c = new Class();
      // for (var m = 0; m < data.file_path.length; m++) {

      //     c.__addAttr__(m, "integer", data.file_path[m], "string");
      // }
      // var filepath = '';
      // if (data.file_path.length > 0){
      //     filepath = serialize(c, "array");
      // }


      // console.log("json test master"+JSON.stringify(data));

      var filepath = data.file_path[0];

      DoubtsArr.userId = data.userId;
      DoubtsArr.title = data.title;
      DoubtsArr.subjectId = data.subjectId;
      DoubtsArr.topic = data.topic;
      DoubtsArr.enter_doubts = data.enter_doubts;
      DoubtsArr.upload_file = filepath;
      DoubtsArr.status = "Doubt Raised";
      DoubtsArr.sessionId = data.sessionId;
      DoubtsArr.schoolId = data.schoolId;
      DoubtsArr.sectionId = data.sectionId;

      if (data.id >0) {
        DoubtsArr.id = data.id;
        DoubtsArr.userId = data.userId;
        DoubtsArr.title = data.title;
        DoubtsArr.subjectId = data.subjectId;
        DoubtsArr.topic = data.topic;
        DoubtsArr.enter_doubts = data.enter_doubts;
        DoubtsArr.upload_file = filepath;
        DoubtsArr.status = "Doubt Raised";
        DoubtsArr.sessionId = data.sessionId;
        DoubtsArr.schoolId = data.schoolId;
        DoubtsArr.sectionId = data.sectionId;
        }
     
  
      Doubtsmaster.upsert(DoubtsArr, function(err, result) {
        if (err) {
          return cb(null, err);
        }
        successMessage.status = "200";
        successMessage.message = "Record Submitted Successfully.";
        successMessage.detail = result;
        return cb(null, successMessage);
      });
    });
  };

  Doubtsmaster.remoteMethod("adddoubts", {
    description: "Add/Edit New Doubts",
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

  /*****/
  Doubtsmaster.updatedoubts = function(data, cb) {
    Doubtsmaster.upsert(data, (err, result) => {
      if (err) {
        cb(null, err);
      } else {
        cb(null, result);
      }
    });
  };

  Doubtsmaster.remoteMethod("updatedoubts", {
    http: { path: "/updatedoubts", verb: "post" },
    description: "Edit  Doubts without file upload",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  /***/

  /**
   * Get Row By Doubts Id
   * * */

  Doubtsmaster.getdoubtsrow = function(id, cb) {
    Doubtsmaster.findOne(
      {
        include: [
          {
            relation: "doubtsSubject",
            scope: {
              fields: ["subject_name"]
            }
          },
          {
            relation: "doubtsSolutioin",
            scope: {
              fields: ["solution", "upload_file"]
            }
          }
        ],
        where: { id: id }
      },
      function(err, res) {
        if (err) {
          cb(null, err);
        }
        cb(null, res);
      }
    );
  };

  Doubtsmaster.remoteMethod("getdoubtsrow", {
    http: { path: "/getdoubtsrow", verb: "get" },
    description: "Get Row by Doubts Id",
    accepts: { arg: "id", type: "number", required: true },
    returns: { arg: "response", type: "json" }
  });

  /*
   * Get All  Doubts
   */
  Doubtsmaster.getalldoubts = function(userId, subjectId, status, cb) {
    let where_cond = {};
    where_cond.userId = userId;
    if (status != "undefined" && status != 0) {
      
      where_cond.status = status;
    }

    if (subjectId != "undefined" && subjectId != 0) {
      where_cond.subjectId = subjectId;
    }
    
    Doubtsmaster.find(
      {
        //where: { status: { between: ['Doubt Raised','Doubt Owned','Doubt Solved'] } },
        where: where_cond,
        include: [
          {
            relation: "doubtsUser",
            scope: {
              fields: ["user_name"]
            }
          },
          {
            relation: "doubtsStudentUser",
            scope: {
              fields: ["name"]
            }
          },
          {
            relation: "doubtsSubject",
            scope: {
              fields: ["subject_name"]
            }
          },
          {
            relation: "doubtsSolutioin",
            scope: {
              fields: ["solution"]
            }
          }
        ],
        order: "id DESC"
      },
      function(err, stdObj) {
        return cb(null, stdObj);
      }
    );
  };

  Doubtsmaster.remoteMethod("getalldoubts", {
    http: { path: "/getalldoubts", verb: "get" },
    description: "Get All doubts",
    accepts: [
      { arg: "userId", type: "number", required: true },
      { arg: "subjectId", type: "string", required: false },
      { arg: "status", type: "string", required: false }
    ],
    returns: { arg: "response", type: "json" }
  });

  /*
   * Get All Doubts & Quries with Solution
   */
  Doubtsmaster.getalldoubts = function(userId, subjectId, status, cb) {
    let where_cond = {};
    where_cond.userId = userId;
    if (status != "undefined" && status != 0) {
      where_cond.status = status;
    }

    if (subjectId != "undefined" && subjectId != 0) {
      where_cond.subjectId = subjectId;
    }
    Doubtsmaster.find(
      {
        //where: { status: { between: ['Doubt Raised','Doubt Owned','Doubt Solved'] } },
        where: where_cond,
        include: [
          {
            relation: "doubtsUser",
            scope: {
              fields: ["user_name"]
            }
          },
          {
            relation: "doubtsStudentUser",
            scope: {
              fields: ["name"]
            }
          },
          {
            relation: "doubtsSubject",
            scope: {
              fields: ["subject_name"]
            }
          },
          {
            relation: "doubtsSolutioin",
            scope: {
              fields: ["solution"]
            }
          },
          {
            relation: "doubtsFacultyUser",
            scope: {
              fields: ["user_name"],
              include: {
                relation: "user_belongs_to_staff",
                scope: {
                  fields: ["name"]
                }
              }
            }
          }
        ],
        order: "id DESC"
      },
      function(err, stdObj) {
        let finalArr = [];
        stdObj.forEach(function(element) {
          let finalObj = {};
          finalObj.title = element.title;
          finalObj.userId = element.userId;
          finalObj.subjectId = element.subjectId;
          finalObj.topic = element.topic;
          finalObj.enter_doubts = element.enter_doubts;
          finalObj.upload_file = element.upload_file;
          finalObj.facultyuserId = element.facultyuserId;
          finalObj.status = element.status;
          finalObj.added_date = element.added_date;
          finalObj.id = element.id;

          if (element.doubtsSubject() != null) {
            finalObj.student_subject = element.doubtsSubject().subject_name;
          } else {
            finalObj.student_subject = "";
          }

          if (element.doubtsStudentUser() != null) {
            finalObj.student_user = element.doubtsStudentUser().name;
          } else {
            finalObj.student_user = "";
          }

          if (element.doubtsFacultyUser() != null) {
            finalObj.studentFacultyUser = element
              .doubtsFacultyUser()
              .user_belongs_to_staff().name;
          } else {
            finalObj.studentFacultyUser = element.doubtsFacultyUser();
          }

          finalArr.push(finalObj);
        });
        return cb(null, finalArr);
      }
    );
  };

  Doubtsmaster.remoteMethod("getalldoubts", {
    http: { path: "/getalldoubts", verb: "get" },
    description: "Get All doubts",
    accepts: [
      { arg: "userId", type: "number", required: true },
      { arg: "subjectId", type: "string", required: false },
      { arg: "status", type: "string", required: false }
    ],
    returns: { arg: "response", type: "json" }
  });

  /*
   * Get All  Doubts list for Faculty
   */
  Doubtsmaster.getalldoubtsfaculty = function(
    facultyuserId,
    subjectId,
    status,
    schoolId,
    cb
  ) {
    console.log(schoolId)
    var subjectIdArr = subjectId.split(",");

    //var setStatus = ["Doubt Raised", "Doubt Owned", "Doubt Solved"];
    let where_cond = {};

    if (status != "" && status != 0) {
      var setStatus = status;
      where_cond = {
        and: [
          { subjectId: { inq: subjectIdArr } },{schoolId:schoolId},
          {
            status: {
              inq: [setStatus]
            }
          }
        ]
      };
    } else {
      where_cond = {
        and: [
          { subjectId: { inq: subjectIdArr } },{schoolId:schoolId},
          {
            or: [
              { facultyuserId: facultyuserId },
              {
                status: {
                  inq: ["Doubt Raised", "Doubt Owned", "Doubt Solved"]
                }
              }
            ]
          }
        ]
      };
    }
 
    Doubtsmaster.find(
      {
        where: where_cond,
        include: [
          {
            relation: "doubtsUser",
            scope: {
              fields: ["user_name"],
              include: {
                relation: "user_have_section",
                scope: {
                  fields: ["sectionId"],
                  include: {
                    relation: "assigned_sections",
                    scope: {
                      fields: ["section_name", "classId"],
                      include: {
                        relation: "section_class",
                        scope: {
                          fields: ["boardId"],
                          include: {
                            relation: "board",
                            scope: {
                              fields: ["board_name", "boardId"]
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            relation: "doubtsStudentDataUser",
            scope: { 
              fields:["user_name"],
              include: {
                relation: "students",
                scope: {
                  fields: ["name","userId"]
                }
              }

            }
          },
          {
            relation: "doubtsSubject",
            scope: {
              fields: ["subject_name"]
            }
          },
          {
            relation: "doubtsSolutioin",
            scope: {
              fields: ["solution"]
            }
          }
        ],
        order: "id DESC"
      },
      function(err, stdObj) {
        /************** */
         //console.log(JSON.stringify(stdObj));
        let finalArr = [];
        stdObj.forEach(function(element) {
          
          let finalObj = {};
          finalObj.title = element.title;
          finalObj.userId = element.userId;
          finalObj.subjectId = element.subjectId;
          finalObj.topic = element.topic;
          finalObj.enter_doubts = element.enter_doubts;
          finalObj.upload_file = element.upload_file;
          finalObj.facultyuserId = element.facultyuserId;
          finalObj.status = element.status;
          finalObj.added_date = element.added_date;
          finalObj.id = element.id;

          if (element.doubtsSubject() != "") {
            finalObj.student_subject = element.doubtsSubject().subject_name;
          } else {
            finalObj.student_subject = "";
          }

          if (
            element
              .doubtsUser()
              .user_have_section()
              .assigned_sections() != ""
          ) {
            finalObj.course_type_section_name = element
              .doubtsUser()
              .user_have_section()
              .assigned_sections().section_name;
          } else {
            finalObj.course_type_section_name = "";
          }

          if (
            element
              .doubtsUser()
              .user_have_section()
              .assigned_sections()
              .section_class()
              .board() != ""
          ) {
            finalObj.brand_Course_name = element
              .doubtsUser()
              .user_have_section()
              .assigned_sections()
              .section_class()
              .board().board_name;
          } else {
            finalObj.brand_Course_name = "";
          }

          if (element.doubtsStudentDataUser().students() != "") {
            finalObj.student_user = element.doubtsStudentDataUser().students().name;
            // finalObj.student_user = "";
          } else {
            finalObj.student_user = "";
          }

          finalArr.push(finalObj);
        });

        /*************** */

        return cb(null, finalArr);
      }
    );
  };

  Doubtsmaster.remoteMethod("getalldoubtsfaculty", {
    http: { path: "/getalldoubtsfaculty", verb: "get" },
    description: "Get All doubts faculty",
    accepts: [
      { arg: "facultyuserId", type: "number", required: true },
      { arg: "subjectId", type: "string", required: true },
      { arg: "status", type: "string", required: true },
      { arg: "schoolId", type: "string", required: true }
    ],
    returns: { arg: "response", type: "json" }
  });


  Doubtsmaster.getDashboardData=function (req,cb) {
    
      Doubtsmaster.find({
        include : {
            relation:"doubtsSolutioin"          
        },
        where : { and:[
                  {schoolId:req.school_id,sessionId:req.session_id},
                  {added_date: {lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
                }
        },function (err,res) {
            if(err) cb(err,null);
            var response={};var doubtAsked={};var avgOwnershipTime={};var avgResponseTime={};
            var doubtAskedToday=0;var doubtAskedLastMonth=0;var doubtAskedTillDate=0;
            var doubtAskedTodayOwn=0;var doubtAskedLastMonthOwn=0;var doubtAskedTillDateOwn=0;
            var todayResponse=0;var lastMonthResponse=0;var tillDateResponse=0;
            var ownershipTimeToday=0;var ownershipTimeLastMonth=0;var ownershipTimeTillDate=0;
            var avgOwnershipTimeToday=0;var avgOwnershipTimeLastMonth=0;var avgOwnershipTimeTillDate=0;
            var responseTimeToday=0;var responseTimeLastMonth=0;var responseTimeTillDate=0;
            var avgResponseTimeToday=0;var avgResponseTimeLastMonth=0;var avgResponseTimeTillDate=0;
            let todayobj = new Date();
            var todayDate=dateFormat(todayobj, "isoDate");
            //console.log(res);
            if(res.length > 0) {
              for(let doubt of res) {
                if(todayDate==dateFormat(doubt.added_date, "isoDate")) {
                  doubtAskedToday +=1;
                  if(doubt.faculty_own_date) {
                    doubtAskedTodayOwn +=1;
                    ownershipTimeToday=ownershipTimeToday+((new Date(doubt.faculty_own_date).getTime()-new Date(doubt.added_date).getTime())/(1000*60));
                  }
                  

                  if(doubt.doubtsSolutioin()) {
                   
                    todayResponse +=1;
                    responseTimeToday=responseTimeToday+((new Date(doubt.doubtsSolutioin().added_date).getTime()-new Date(doubt.added_date).getTime())/(1000*60));
                  }
                  
                  
                } 
                if(new Date(doubt.added_date).getMonth() == todayobj.getMonth()-1) {
                  doubtAskedLastMonth += 1;
                  if(doubt.faculty_own_date) {
                    doubtAskedLastMonthOwn += 1;
                    ownershipTimeLastMonth=ownershipTimeLastMonth+((new Date(doubt.faculty_own_date).getTime()-new Date(doubt.added_date).getTime())/(1000*60));
                  }

                  if(doubt.doubtsSolutioin()) {
                    lastMonthResponse +=1;
                    responseTimeLastMonth=responseTimeLastMonth+((new Date(doubt.doubtsSolutioin().added_date).getTime()-new Date(doubt.added_date).getTime())/(1000*60));
                  }
                  
                } 
                doubtAskedTillDate +=1;
                if(doubt.faculty_own_date) {
                  doubtAskedTillDateOwn +=1;
                  ownershipTimeTillDate=ownershipTimeTillDate+((new Date(doubt.faculty_own_date).getTime()-new Date(doubt.added_date).getTime())/(1000*60));
                }
                if(doubt.doubtsSolutioin()) {
                  tillDateResponse +=1;
                  responseTimeTillDate=responseTimeTillDate+((new Date(doubt.doubtsSolutioin().added_date).getTime()-new Date(doubt.added_date).getTime())/(1000*60));
                }
                   
                //nothing
              }

            /* Average Ownership time*/
              if(ownershipTimeToday > 0) {
                avgOwnershipTimeToday=Math.round(ownershipTimeToday/doubtAskedTodayOwn);
                let hours = Math.round( avgOwnershipTimeToday / 60);          
                let minutes =Math.round( avgOwnershipTimeToday % 60);
                avgOwnershipTimeToday=hours+'h '+minutes+'m';

              }
              
              if(ownershipTimeLastMonth > 0) {
                avgOwnershipTimeLastMonth=Math.round(ownershipTimeLastMonth/doubtAskedLastMonthOwn);
                let hours = Math.round( avgOwnershipTimeLastMonth / 60);          
                let minutes =Math.round( avgOwnershipTimeLastMonth % 60);
                avgOwnershipTimeLastMonth=hours+'h '+minutes+'m';

              }
              
              if(ownershipTimeTillDate > 0) {
                avgOwnershipTimeTillDate=Math.round(ownershipTimeTillDate/doubtAskedTillDateOwn);
                let hours = Math.round( avgOwnershipTimeTillDate / 60);          
                let minutes =Math.round( avgOwnershipTimeTillDate % 60);
                avgOwnershipTimeTillDate=hours+'h '+minutes+'m';

              }

              /* Average response time*/
              
              if(responseTimeToday > 0) {
                avgResponseTimeToday=Math.round(responseTimeToday/todayResponse);
                let hours = Math.round( avgResponseTimeToday / 60);          
                let minutes =Math.round( avgResponseTimeToday % 60);
                avgResponseTimeToday=hours+'h '+minutes+'m';

              }
              if(responseTimeLastMonth > 0) {
                avgResponseTimeLastMonth=Math.round(responseTimeLastMonth/lastMonthResponse);
                let hours = Math.round( avgResponseTimeLastMonth / 60);          
                let minutes =Math.round( avgResponseTimeLastMonth % 60);
                avgResponseTimeLastMonth=hours+'h '+minutes+'m';

              }

              if(responseTimeTillDate > 0) {
                avgResponseTimeTillDate=Math.round(responseTimeTillDate/tillDateResponse);
                let hours = Math.round( avgResponseTimeTillDate / 60);          
                let minutes =Math.round( avgResponseTimeTillDate % 60);
                avgResponseTimeTillDate=hours+'h '+minutes+'m';

              }
            }
            doubtAsked.today=doubtAskedToday;
            doubtAsked.lastMonth=doubtAskedLastMonth;
            doubtAsked.tillDate=doubtAskedTillDate;
            avgOwnershipTime.today=avgOwnershipTimeToday;
            avgOwnershipTime.lastMonth=avgOwnershipTimeLastMonth;
            avgOwnershipTime.tillDate=avgOwnershipTimeTillDate;
            avgResponseTime.today=avgResponseTimeToday;
            avgResponseTime.lastMonth=avgResponseTimeLastMonth;
            avgResponseTime.tillDate=avgResponseTimeTillDate;
            response.doubtAsked=doubtAsked;
            response.avgOwnershipTime=avgOwnershipTime;
            response.avgResponseTime=avgResponseTime;
            cb(null,response);
        }
      
    )
   
  }


};
