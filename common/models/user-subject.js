"use strict";
var arraySort = require("array-sort");
var Dedupe = require("array-dedupe");

module.exports = function(Usersubject) {
  var globalsubjectarr = [];
  Usersubject.assignsubject = function(data, cb) {
    Usersubject.findOne({
      where: {userId: data.userId, sessionId: data.sessionId, sectionId: data.sectionId,subjectId:data.subjectId}
    },function(errr,resp){
      if(errr){
        cb(null,errr)
      }
      if(!resp){
        Usersubject.create(data, function(err, subject) {
          if (err) {
            cb(null, err);
          } else {
            cb(null, subject);
          }
        });
      }
      else{
        return cb(null);
      }
    })

  };

  Usersubject.usersubjectlist = function(cb) {
    Usersubject.find(function(err, section) {
      if (err) {
        cb(null, err);
      } else {
        cb(null, section);
      }
    });
  };

  Usersubject.subjectusers = function(request, cb) {
    var sectionId = request.sectionId;
    var user_type = request.user_type;
    var sessionId = request.sessionId;
    var subjectId = request.subjectId;
    Usersubject.find(
      {
        //fields: "userId",
        include: {
          relation: "user",
          scope: {
            where: { status: "Active" }
          }
        },
        where: {
          sectionId: { inq: sectionId },
          user_type: user_type,
          subjectId: subjectId,
          sessionId: sessionId,
          status: "Active"
        }
      },
      function(err, res) {
        cb(null, res);
      }
    );
  };

  Usersubject.assignedsubjects = function(request, cb) {
    var sectionId = request.section_id;
    var userId = request.user_id;
    var sessionId = request.session_id;
    var message = {};

    if (!sectionId) {
      message.status = "201";
      message.message = "Section id cannot be null";

      cb(null, message);
    }
    if (!sessionId) {
      message.status = "201";
      message.message = "Session id cannot be null";

      cb(null, message);
    }
    if (!userId) {
      message.status = "201";
      message.message = "User id cannot be null";

      cb(null, message);
    }

    var sectionIdArr = [];

    if (request.time_table) {
      sectionIdArr = sectionId.split(",");
    } else {
      sectionIdArr.push(sectionId);
    }

    Usersubject.find(
      {
        fields: ["userId", "subjectId","class_subjectId"],
        include: {
          relation: "subjects",
          scope: {
            fields: "subject_name"
          }
        },
        where: {
          userId: userId,
          sessionId: sessionId,
          status: "Active",
          sectionId: { inq: sectionIdArr }
        }
      },
      function(err, res) {
        if (err) {
          message.status = "201";
          message.message = "Fail";

          cb(null, message);
        } else {
          message.status = "200";
          message.message = "Success";

          var data = [];
          res.forEach(function(value, index) {
            value = value.toJSON();

            var obj = {
              class_subjectId: value.class_subjectId,
              subject_id: value.subjectId,
              subject_name: value.subjects.subject_name
            };

            data.push(obj);
          });

          //data = Dedupe(data, ["subject_id"]);
          var resp = {
            assigned_subjects: data
          };
          cb(null, message, resp);
        }
      }
    );
  };

  Usersubject.subjectwisesections = function(request, cb) {
    var msg = {};
    if (!request.user_id) {
      msg.status = "201";
      msg.status = "User id cannot be blank";
      cb(null, msg);
    }
    if (!request.subject_id) {
      msg.status = "201";
      msg.status = "Subject id cannot be blank";
      cb(null, msg);
    }
    if (!request.session_id) {
      msg.status = "201";
      msg.status = "Session id cannot be blank";
      cb(null, msg);
    }
    if (!request.class_id) {
      msg.status = "201";
      msg.status = "Class id cannot be blank";
      cb(null, msg);
    }
    Usersubject.find(
      {
        fields: ["sectionId", "id"],
        include: {
          relation: "assigned_section",
          scope: {
            fields: ["section_name", "id"],
            where: { classId: request.class_id },
            include: {
              relation: "user_have_subject",
              scope: {
                where: { user_type: "Student" }
              }
            }
          }
        },
        where: {
          subjectId: request.subject_id,
          sessionId: request.session_id,
          userId: request.user_id
        }
      },
      function(err, res) {
        if (err) {
          msg.status = "201";
          msg.status = "No record Found";
          cb(null, msg);
        } else {
          msg.status = "200";
          msg.message = "Inforamtion Fetched Successfully";

          var sectionArr = [];
          res.forEach(function(value) {
            value = value.toJSON();

            if (value.assigned_section) {
              var sectionObj = {
                section_id: value.assigned_section.id,
                section_name: value.assigned_section.section_name,
                student_count: value.assigned_section.user_have_subject.length
              };
              sectionArr.push(sectionObj);
            }
          });

          return cb(null, msg, sectionArr);
        }
      }
    );
  };

  Usersubject.deletesection = function(cb) {
    Usersubject.destroyAll(function(err, result) {
      if (err) {
        cb(null, err);
      }
      cb(null, result);
    });
  };

  Usersubject.remoteMethod("assignsubject", {
    http: { path: "/assignsubject", verb: "post" },
    description: "Assign Subject to user",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Usersubject.remoteMethod("assignedsubjects", {
    http: { path: "/assignedsubjects", verb: "post" },
    description: "Assign Subject to user",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });
  Usersubject.remoteMethod("subjectusers", {
    http: { path: "/subjectusers", verb: "post" },
    description: "Subject users list section wise",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Usersubject.remoteMethod("usersubjectlist", {
    http: { path: "/usersubjectlist", verb: "post" },
    description: "User subject list",
    returns: { arg: "response", type: "json" }
  });
  Usersubject.remoteMethod("deletesection", {
    http: { path: "/deletesection", verb: "post" },
    description: "Delete Usersubject",
    returns: { arg: "response", type: "json" }
  });
  Usersubject.remoteMethod("subjectwisesections", {
    http: { path: "/subjectwisesections", verb: "post" },
    description: "Subject Wise sections",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });

  Usersubject.relationupdate = function(cb) {
    Usersubject.find(function(err, result) {
      result.forEach(function(value) {
        Usersubject.upsert(value, function(err, data) {});
      });
      cb(null, result);
    });
  };

  Usersubject.remoteMethod("relationupdate", {
    http: { path: "/relationupdate", verb: "post" },
    description: "update user relations",
    returns: { arg: "response", type: "json" }
  });
  Usersubject.subjectwiseusers = function(request, cb) {
    var sectionId = request.section_id;
    var user_type = request.user_type;
    var sessionId = request.session_id;
    var subjectId = request.subject_id;
    var msg = {};
    Usersubject.find(
      {
        fields: "userId",
        include: {
          relation: "user",

          scope: {
            fields: "id",
            where: { status: "Active" },
            include: {
              relation: "students",
              scope: {
                fields: ["admission_no", "name"]
              }
            }
          }
        },
        where: {
          and: [
            { sectionId: sectionId },
            { user_type: user_type },
            { subjectId: subjectId },
            { sessionId: sessionId },
            { status: "Active" }
          ]
        },
        order: "userId ASC"
      },
      function(err, res) {
        var resArr = [];
        var promise = [];
        res.forEach(function(value) {
          if (value.user()) {
            value = value.toJSON();
            var UserSection = Usersubject.app.models.user_sections;
            promise.push(
              UserSection.getStudentRollNo(
                value.userId,
                sessionId,
                sectionId
              ).then(function(rolldata) {
                var obj = {
                  user_id: value.userId,
                  student_name: value.user.students.name,
                  admission_no: value.user.students.admission_no,
                  roll_no: rolldata.length == 0 ? "" : rolldata[0].roll_no
                };
                resArr.push(obj);
              })
            );
          }
        });
        Promise.all(promise).then(function(response) {
          msg.status = "200";
          msg.message = "Information Fetched Successfully";
          var userIdSort = arraySort(resArr, "user_id", { reverse: false });
          cb(null, msg, userIdSort);
        });
      }
    );
  };

  Usersubject.remoteMethod("subjectwiseusers", {
    http: { path: "/subjectwiseusers", verb: "post" },
    description: "Subject section wise student list",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });

  Usersubject.getusers = function(request, cb) {
    var sectionId = request.section_id;
    var user_type = request.user_type;
    var sessionId = request.session_id;
    var msg = {};
    Usersubject.find(
      {
        fields: "userId",
        include: {
          relation: "user",

          scope: {
            fields: "id",
            include: {
              relation: "students",
              scope: {
                fields: ["admission_no", "name"]
              }
            }
          }
        },
        where: {
          and: [
            { sectionId: sectionId },
            { user_type: user_type },
            { sessionId: sessionId },
            { status: "Active" }
          ]
        },
        order: "userId ASC"
      },
      function(err, res) {
        var resArr = [];
        res.forEach(function(value) {
          value = value.toJSON();
          var obj = {
            user_id: value.userId,
            student_name: value.user.students.name,
            admission_no: value.user.students.admission_no
          };
          resArr.push(obj);
        });
        msg.status = "200";
        msg.message = "Inforamtion Fetched Successfully";
        cb(null, msg, resArr);
      }
    );
  };
  Usersubject.remoteMethod("getusers", {
    http: { path: "/getusers", verb: "post" },
    description: "Section wise student list",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });

  Usersubject.getstaffcode = function(request, cb) {
    var sectionId = request.section_id;
    var user_type = request.user_type;
    var sessionId = request.session_id;
    var msg = {};
    Usersubject.find(
      {
        where: {
          and: [
            { userId: request.user_id },
            { sectionId: sectionId },
            { user_type: user_type },
            { sessionId: sessionId },
            { status: "Active" }
          ]
        },
        include: {
          relation: "subjects"
        }
      },
      function(err, res) {
        let arr = [];
        let count = res.length - 1;
        var promise = [];
        globalsubjectarr = [];
        for (let key in res) {
          let param = {
            subject_id: res[key].subjectId,
            user_type: "Teacher",
            section_id: sectionId
          };
          promise.push(Usersubject.getsubjectusersexecute(param));
        }
        Promise.all(promise).then(function(finalresponse) {
          msg.status = "200";
          msg.message = "Information Fetched Successfully";
          cb(null, msg, globalsubjectarr);
        });
      }
    );
  };

  Usersubject.getsubjectusersexecute = data => {
    return new Promise(function(resolve, reject) {
      let arr = [];
      Usersubject.find(
        {
          where: {
            subjectId: data.subject_id,
            user_type: data.user_type,
            sectionId: data.section_id
          },
          include: [
            {
              relation: "user",
              scope: {
                include: [
                  {
                    relation: "staff"
                  },
                  {
                    relation: "user_have_section"
                  }
                ]
              }
            },
            {
              relation: "subjects"
            }
          ]
        },
        (err, response) => {
          if (response.length == 0) {
          } else {
            if (response[0].user() && response[0].subjects()) {
              globalsubjectarr.push({
                subject_id: response[0].subjectId,
                subject_name: response[0].subjects().subject_name,
                staff_name: response[0].user().staff().name,
                staff_code: response[0].user().staff().staff_code,
                staff_id: response[0].user().web_user_id,
                is_classTeacher: response[0].user().user_have_section()
                  .class_teacher,
                staff_user_id: response[0].user().id
              });
            }
          }
          resolve("success");
          //cb(null, arr)
        }
      );
    });
  };

  Usersubject.getstaffcodelist = function(request, cb) {
    var sectionId = request.section_id;
    var user_type = request.user_type;
    var sessionId = request.session_id;
    var msg = {};
    Usersubject.find(
      {
        where: {
          and: [
            { userId: request.user_id },
            { sectionId: sectionId },
            { user_type: user_type },
            { sessionId: sessionId },
            { status: "Active" }
          ]
        }
      },
      function(err, res) {
        let subjectArr = [];
        let count = res.length - 1;

        globalsubjectarr = [];
        for (let key in res) {
          subjectArr.push(res[key].subjectId);
        }

        Usersubject.find(
          {
            where: {
              subject_id: { inq: subjectArr },
              user_type: "Teacher",
              sectionId: sectionId,
              status: "Active"
            },
            include: [
              {
                relation: "user",
                scope: {
                  include: [
                    {
                      relation: "staff"
                    },
                    {
                      relation: "user_have_section",
                      scope: {
                        where: { schoolId: request.school_id }
                      }
                    }
                  ]
                }
              },
              {
                relation: "subjects"
              }
            ]
          },
          (error, response) => {
            let globalsubjectarr = [];
            for (let key in response) {
              if (
                response[key].user() &&
                response[key].user().user_have_section()
              ) {
                globalsubjectarr.push({
                  subject_id: response[key].subjectId,
                  subject_name: response[key].subjects().subject_name,
                  staff_name: response[key].user().staff().name,
                  staff_code: response[key].user().staff().staff_code,
                  is_classTeacher: response[key].user().user_have_section()
                    .class_teacher,
                  staff_user_id: response[key].user().id
                });
              }
            }

            msg.status = "200";
            msg.message = "Information Fetched Successfully";
            cb(null, msg, globalsubjectarr);
          }
        );
      }
    );
  };

  Usersubject.remoteMethod("getstaffcodelist", {
    http: { path: "/getstaffcodelist", verb: "post" },
    description: "Get staff",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });

  Usersubject.remoteMethod("getsubjectusers", {
    http: { path: "/getsubjectusers", verb: "post" },
    description: "Get subject users",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });

  Usersubject.remoteMethod("getstaffcode", {
    http: { path: "/getstaffcode", verb: "post" },
    description: "Get staff code",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });

  Usersubject.getsubjectname = function(request, cb) {
    var sectionId = request.section_id;
    var user_type = request.user_type;
    var sessionId = request.session_id;
    var msg = {};
    Usersubject.find(
      {
        fields: ["userId", "subjectId"],
        include: {
          relation: "subjects",
          scope: {
            fields: ["subject_name", "id"]
          }
        },
        where: {
          and: [
            { sectionId: sectionId },
            { user_type: user_type },
            { sessionId: sessionId },
            { status: "Active" }
          ]
        }
      },
      function(err, res) {
        var resArr = [];
        res.forEach(function(value) {
          value = value.toJSON();

          var obj = {
            user_id: value.userId,
            subject_name: value.subjects.subject_name,
            subject_id: value.subjects.id
          };
          resArr.push(obj);
        });
        msg.status = "200";
        msg.message = "Information Fetched Successfully";
        cb(null, msg, resArr);
      }
    );
  };
  Usersubject.remoteMethod("getsubjectname", {
    http: { path: "/getsubjectname", verb: "post" },
    description: "Get subject name",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });

  Usersubject.unassignsubject = function(request, cb) {
    var flag = request.flag;

    var sessionModel = Usersubject.app.models.session;
    var userModel = Usersubject.app.models.user;
    var sectionModel = Usersubject.app.models.section;
    var subjectModel = Usersubject.app.models.subject;
    var usersectionModel = Usersubject.app.models.user_sections;

    sessionModel.sessionfromerpsessionid(request.session_id, function(
      err,
      sessionData
    ) {
      if (err) {
        return cb(null, err);
      }

      var sessionId = sessionData.id;
      userModel.getuserbyoldid(request.user_id, function(err, userData) {
        if (err) {
          return cb(null, err);
        }
        var userId = userData.id;

        sectionModel.getsectionbyname(
          { section_name: request.section_name },
          function(err, sectionData) {
            if (err) {
              return cb(null, err);
            }

            var sectionId = sectionData.id;
            if (flag == "delete") {
              subjectModel.getsubjectbyname(
                { subject_name: request.subject_name },
                function(err, subjectData) {
                  if (err) {
                    return cb(null, err);
                  }

                  var subjectId = subjectData.id;

                  if (userId && sessionId && sectionId && subjectId) {
                    Usersubject.destroyAll(
                      {
                        userId: userId,
                        sessionId: sessionId,
                        subjectId: subjectId,
                        sectionId: sectionId
                      },
                      function(err, obj) {
                        if (err) {
                          return cb(null, err);
                        }

                        Usersubject.findOne(
                          {
                            where: {
                              userId: userId,
                              sessionId: sessionId,
                              sectionId: sectionId
                            }
                          },
                          function(err, assignedSubjects) {
                            if (!assignedSubjects) {
                              usersectionModel.destroyAll(
                                {
                                  userId: userId,
                                  sessionId: sessionId,
                                  sectionId: sectionId
                                },
                                function(err, res) {
                                  if (err) {
                                    return cb(null, err);
                                  }
                                  return cb(null, res);
                                }
                              );
                            }
                          }
                        );
                      }
                    );
                  }
                  return cb(null, null);
                }
              );
            } else if (flag == "class_teacher") {
              var classTeacher = "No";
              if (request.class_teacher) {
                classTeacher = "Yes";
              }
              usersectionModel.updateAll(
                { userId: userId, sessionId: sessionId, sectionId: sectionId },
                { class_teacher: classTeacher },
                function(err, res) {
                  if (err) {
                    return cb(null, err);
                  }
                  return cb(null, res);
                }
              );
            }
          }
        );
      });
    });
  };

  Usersubject.remoteMethod("unassignsubject", {
    http: { path: "/unassignsubject", verb: "post" },
    description: "Un-assign Subject to user",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Usersubject.getusersubjectid = function(data, cb) {
    Usersubject.findOne(
      {
        where: {
          userId: data.user_id,
          subjectId: data.subject_id,
          sessionId: data.session_id,
          sectionId: data.section_id
        },
        order: "id DESC"
      },
      function(err, res) {
        if (err) {
          return cb(null, err);
        }
        return cb(null, res);
      }
    );
  };

  Usersubject.remoteMethod("getusersubjectid", {
    http: { path: "/getusersubjectid", verb: "post" },
    description: "get user subject id",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Usersubject.deleteassignsubject = function(data, cb) {
    Usersubject.destroyAll(
      {
        userId: data.user_id,
        subjectId: data.subject_id,
        sessionId: data.session_id,
        sectionId: data.section_id
      },
      function(err, res) {
        if (err) {
          return cb(null, err);
        }
        return cb(null, res);
      }
    );
  };

  Usersubject.remoteMethod("deleteassignsubject", {
    http: { path: "/deleteassignsubject", verb: "post" },
    description: "delete assign subject to user",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Usersubject.getassignedusersubject = function(data, cb) {
    Usersubject.find(
      {
        where: {
          userId: data.user_id,
          schoolId: data.school_id,
          sessionId: data.session_id,
          sectionId: data.section_id,
          status: "Active"
        },
        order: "id DESC"
      },
      function(err, res) {
        if (err) {
          return cb(null, err);
        }
        return cb(null, res);
      }
    );
  };

  Usersubject.remoteMethod("getassignedusersubject", {
    http: { path: "/getassignedusersubject", verb: "post" },
    description: "get user subject id",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Usersubject.assignedsubjectsteacher = function(request, cb) {
    var userId = request.user_id;
    var sessionId = request.session_id;
    var message = {};

    if (!sessionId) {
      message.status = "201";
      message.message = "Session id cannot be null";

      cb(null, message);
    }
    if (!userId) {
      message.status = "201";
      message.message = "User id cannot be null";

      cb(null, message);
    }

    Usersubject.find(
      {
        fields: ["userId", "subjectId"],
        include: {
          relation: "subjects",
          scope: {
            fields: "subject_name"
          }
        },
        where: { userId: userId, sessionId: sessionId, status: "Active" }
      },
      function(err, res) {
        if (err) {
          message.status = "201";
          message.message = "Fail";

          cb(null, message);
        } else {
          message.status = "200";
          message.message = "Success";

          var data = [];
          res.forEach(function(value, index) {
            value = value.toJSON();

            var obj = {
              subject_id: value.subjectId,
              subject_name: value.subjects.subject_name
            };

            data.push(obj);
          });

          data = Dedupe(data, ["subject_id"]);
          var resp = {
            assigned_subjects: data
          };
          cb(null, message, resp);
        }
      }
    );
  };

  Usersubject.remoteMethod("assignedsubjectsteacher", {
    http: { path: "/assignedsubjectsteacher", verb: "post" },
    description: "Assign Subject to user Teacher",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response_status", type: "json" },
      { arg: "response", type: "json" }
    ]
  });


   /***Get All Staff by School Id,sessionId,sectionId,subjectId  ** */

   Usersubject.getstaffbyschoolandsubject = function(schoolId,sessionId,sectionId,subjectId, cb) {
    Usersubject.find(
        {
        //  fields: ["userId", "subjectId"],
          include: {
            relation: "staff_users",
            scope: {
              fields: ["name","userId"],
            }
          },
          where: { schoolId: schoolId,sessionId:sessionId,sectionId:sectionId,subjectId:subjectId, status: "Active",user_type:"Teacher"},
        },
        function(err, result) {
          console.log(result);
          /***/
          let finalArr = [];
          result.forEach(function(element) {

            if(element.staff_users()!=null){
              var  finalObj = {};
              finalObj.userId = element.staff_users().userId;
              finalObj.name = element.staff_users().name;
              finalArr.push(finalObj);
            }
          })
          console.log(finalArr);
          /** */

          if (err) {
            return cb(null, err);
          }
          return cb(null, finalArr);
        }
    );
  };

  Usersubject.remoteMethod("getstaffbyschoolandsubject", {
    http: { path: "/getstaffbyschoolandsubject", verb: "get" },
    description: "Get Staff by School Id,sessionId,sectionId,subjectId ",
    accepts: [
      { arg: "schoolId", type: "number", required: true },
      { arg: "sessionId", type: "number", required: true },
      { arg: "sectionId", type: "number", required: true },
      { arg: "subjectId", type: "number", required: false }
    ],
    returns: { arg: "response", type: "array" }
  });

  Usersubject.userassignsubject = function(request, cb) {    
    var user_type = request.user_type;
    var sessionId = request.session_id;
    var user_id = request.user_id;
    var schoolId = request.schoolId;
    var sectionId = request.section_id;
    var msg = {};
    var sectionIdArr = [];   
    sectionIdArr = sectionId.split(",");   
    let where_cond = {schoolId: schoolId,user_type: user_type, userId: user_id,sessionId:sessionId,sectionId: { inq: sectionIdArr },status:"Active"};   
    Usersubject.find(
      {   
          where: where_cond,       
            include: {
              relation: "subjects",
              scope: {
                fields: ["subject_name","id"],
              }                 
        }, 
        //groupby: 'subjectId',       
        order: "userId ASC"
      },
      function(err, res) {
        var resArr = [];
        let subjectIdsArr=[];        
        res.forEach(function(value) {
          if (value.subjects()) {
            value = value.toJSON();
            var obj = {
              user_id: value.userId,
              subject_id: value.subjects.id,
              subject_name: value.subjects.subject_name                  
            };
            if (subjectIdsArr.indexOf(value.subjects.id) === -1){
            resArr.push(obj);
            subjectIdsArr.push(value.subjects.id);
            }
          }
        }); 
        cb(null,resArr);       
      }
    );
  };

  Usersubject.remoteMethod("userassignsubject", {
    http: { path: "/userassignsubject", verb: "post" },
    description: "Subject section wise student list",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response", type: "json" },
      { arg: "response", type: "json" }
    ]
  });
  Usersubject.facultyassignsubject = function(request, cb) {    
    var user_type = request.user_type;
    var sessionId = request.session_id;
    var subject_id = request.subject_id;
    var schoolId = request.schoolId;
    var sectionId = request.section_id;

    var sectionIdArr = [];   
      sectionIdArr = sectionId.split(",");    
    var msg = {};
    //let where_cond = { user_type: user_type, userId: user_id,sessionId:sessionId,status:"Active"};   
    Usersubject.find(
      {
          fields: ["userId", "subjectId"],
          include: [
           {
            relation: "user",
            scope: {
              include: [
                {
                  relation: "user_belongs_to_staff",
                  scope: {
                    fields: ["name","userId"],
                  }  
                }
              ]
            }
           }
          ],
          where: { schoolId: schoolId,sessionId:sessionId,subjectId:subject_id,sectionId: { inq: sectionIdArr }, status: "Active",user_type:user_type},                    
        },
        function(err, result) {
          //console.log(result);
          /***/
          let finalArr = [];
          let userIdsArr=[];
          result.forEach(function(element) {          
            if(element.user().user_belongs_to_staff()!=null){
              var  finalObj = {};
              finalObj.userId = element.user().user_belongs_to_staff().userId;
              finalObj.name = element.user().user_belongs_to_staff().name;
              if (userIdsArr.indexOf(element.user().user_belongs_to_staff().userId) === -1){
                finalArr.push(finalObj);
                userIdsArr.push(element.user().user_belongs_to_staff().userId);
              }
            }
            
          })          
          if (err) {
            return cb(err, err);
          }
          return cb(err, finalArr);
        }
    );
  };

  Usersubject.remoteMethod("facultyassignsubject", {
    http: { path: "/facultyassignsubject", verb: "post" },
    description: "Subject section wise student list",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: [
      { arg: "response", type: "json" },
      { arg: "response", type: "json" }
    ]
  });
  
};
