'use strict';
var dateFormat = require('dateformat');
var constantval = require('./constant');
var request = require('request');
var Dedupe = require('array-dedupe');
var arraySort = require('array-sort');
module.exports = function (Section) {

  Section.addsection = function (data, cb) {
    Section.upsert(data, function (err, section) {
      if (err) {
        cb(null, err);
      } else {
        cb(null, section);
      }
    });

  };


  Section.sectionlist = function (cb) {
    Section.find({
      include: {
        relation: "section_subjects",
      }

    }, function (err, section) {
      if (err) {
        cb(null, err);
      } else {
        var archivedSort = arraySort(section, ['class_order', 'section']);
        cb(null, archivedSort);
      }
    });

  };

  Section.classlist = function (data, cb) {

    var param = {};
    if (data.class_from != undefined && data.class_from != '' && data.class_from != null) {
      param.class_order = {
        gte: data.class_from
      }
    }
    Section.find({
      where: param
    }, function (err, section) {
      if (err) {
        cb(null, err);
      } else {
        var uniqueArray = Dedupe(section, ['class_name']);
        var archivedSort = arraySort(uniqueArray, 'class_order');
        cb(null, archivedSort);
      }
    });

  };

  Section.remoteMethod(
    'classlist', {
      http: {
        path: '/classlist',
        verb: 'post'
      },
      description: 'class list',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.usersbysection = function (data, cb) {
    var sectionId = data.section_id;
    var userType = data.user_type;

    var message = {};
    if (!sectionId) {
      message.status = '201';
      message.message = "section_id cannot blank";
      cb(null, message);
    }
    if (!userType) {
      message.status = '201';
      message.message = "user_type cannot blank";
      cb(null, message);
    }
    Section.findById(sectionId, {
      fields: 'id',
      include: {
        relation: "section_have_users",
        scope: {
          fields: ['user_name', 'id'],
          where: {
            user_type: userType
          }
        }

      },
    }, function (err, section) {
      if (err) {
        message.status = '201';
        message.message = "Fail";
        cb(null, message);
      } else {
        message.status = '200';
        message.message = "success";
        message.data = section;
        cb(null, message);
      }
    });

  };

  Section.getuserbysection = function (data, cb) {
    var sectionId = data.section_id;
    var userType = data.user_type;

    var message = {};
    if (!sectionId) {
      message.status = '201';
      message.message = "section_id cannot blank";
      return cb(null, message);
    }
    if (!userType) {
      message.status = '201';
      message.message = "user_type cannot blank";
      return cb(null, message);
    }
    Section.findById(sectionId, {
      //fields: 'id',
      include: {
        relation: "section_have_users",
        scope: {
          //fields: ['user_name', 'id'],
          where: {
            user_type: userType,
            status: "Active"
          },
          include: {
            relation: "students",
            scope: {
              include: {
                relation: "studentbelongtoparent"
              }
            }
          }

        }

      },
    }, function (err, section) {
      console.log(err)
      if (err) {
        message.status = '201';
        message.message = "Fail";
        return cb(null, message);
      } else {
        message.status = '200';
        message.message = "success";
        message.data = section;
        return cb(null, message);
      }
    });

  };

  Section.remoteMethod(
    'getuserbysection', {
      http: {
        path: '/getuserbysection',
        verb: 'post'
      },
      description: 'Section list',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.getuserlistbysection = function (data, cb) {
    var sectionId = data.section_id;
    var userType = data.user_type;

    var message = {};
    if (!sectionId) {
      message.status = '201';
      message.message = "section_id cannot blank";
      cb(null, message);
    }
    if (!userType) {
      message.status = '201';
      message.message = "user_type cannot blank";
      cb(null, message);
    }
    Section.findById(sectionId, {
      //fields: 'id',
      include: {
        relation: "section_have_users",
        scope: {
          //fields: ['user_name', 'id'],
          where: {
            user_type: userType
          },
          include: [{
            relation: "students",
            scope: {
              include: {
                relation: "studentbelongtoparent"
              }
            }
          }, {
            relation: 'user_attendance'
          }, {
            relation: "user_have_section"
          }]
        }

      },
    }, function (err, section) {
      if (err) {
        message.status = '201';
        message.message = "Fail";
        cb(null, message);
      } else {
        message.status = '200';
        message.message = "success";
        message.data = section;
        cb(null, message);
      }
    });

  };

  Section.remoteMethod(
    'getuserlistbysection', {
      http: {
        path: '/getuserlistbysection',
        verb: 'post'
      },
      description: 'Section list',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.remoteMethod(
    'usersbysection', {
      http: {
        path: '/usersbysection',
        verb: 'post'
      },
      description: 'Section list',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );



  Section.deletesection = function (cb) {
    Section.destroyAll(function (err, result) {
      if (err) {
        cb(null, err);
      }
      cb(null, result);
    })
  };

  Section.getsectionbyname = function (data, cb) {
    Section.findOne({
      fields: ["id"],
      where: {
        "section_name": data.section_name
      },
    }, function (err, stdObj) {
      if (data.flag == 'delete') {
        Section.destroyById(stdObj.id, (err, data) => {});
        return cb(null, stdObj);
      } else if (data.flag == 'update') {
        if (stdObj == null || stdObj == '') {
          var Class = Section.app.models.class;
          Class.findOne({
            fields: ["id"],
            where: {
              "schoolId": data.schoolId,
              "class_name": data.class_name
            },
          }, function (err, classObj) {
            if (err) {
              return cb(null, err);
            } else {
              var param = {
                "section_name": data.section_name,
                "classId": classObj.id,
                "class_name": data.class_name,
                "class_order": data.class_order,
                "stream_name": data.stream_name,
                "section_seats": data.section_seats,
                "schoolId": data.schoolId,
                "section": data.section,
              };

              Section.create(param, function (err, section) {
                if (err) {
                  return console.log(err)
                }
                let classId = classObj.id
                if (classId) {
                  Section.getsubjectbyclassid(classId).then(class_subject_arr => {
                    if (class_subject_arr.length > 0 && Array.isArray(class_subject_arr)) {
                      var classSubject = Section.app.models.class_subject;
                      var promise = [];
                      class_subject_arr.forEach(obj => {
                        obj['sectionId'] = section.id;
                        obj['status'] = "Active"
                        obj['classId'] = classId
                        obj['created_date'] = dateFormat(new Date(), "yyyy-mm-dd hh:mm:dd");
                        promise.push(Section.classubjectexecute(obj, classSubject))
                      })

                      Promise.all(promise).then(res => {
                        return cb(null, stdObj);
                      }).catch(obj => console.log(obj))
                    } else {
                      return cb(null, stdObj);
                    }
                  }).catch(obj => console.log(obj))
                } else {
                  return cb(null, stdObj);
                }
              });
            }
          });
        } else {
          return cb(null, stdObj);
        }
      } else {
        return cb(null, stdObj);
      }
    });
  };

  Section.classubjectexecute = function (obj, classSubject) {
    return new Promise((resolve, reject) => {
      classSubject.create(obj, function (err, res) {
        if (err) reject(err)
        if (res) resolve("success")
      })
    })
  }

  Section.getsubjectbyclassid = function (classId) {
    if (classId) {
      var classSubject = Section.app.models.class_subject;
      return new Promise(function (resolve, reject) {
        classSubject.find({
          fields: ["subjectId", "subject_type", "sessionId", "schoolId", "subject_code"],
          where: {
            "classId": classId
          },
        }, function (err, data) {
          if (err) reject(err)
          if (data.length > 0) {
            resolve(data);
          } else {
            resolve([]);
          }
        });
      });
    } else {
      reject("Class id cannot be empty")
    }
  }

  Section.getsectionbyclassname = function (data, cb) {

    Section.find({
      fields: ["id"],
      where: {
        "class_name": data.class_name
      },
    }, function (err, stdObj) {

      return cb(null, stdObj);
    });
  };

  Section.remoteMethod(
    'addsection', {
      http: {
        path: '/addsection',
        verb: 'post'
      },
      description: 'Add Section',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.remoteMethod(
    'sectionlist', {
      http: {
        path: '/sectionlist',
        verb: 'post'
      },
      description: 'Section list',
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );
  Section.remoteMethod(
    'deletesection', {
      http: {
        path: '/deletesection',
        verb: 'post'
      },
      description: 'Delete Section',
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.remoteMethod(
    'getsectionbyname', {
      http: {
        path: '/getsectionbyname',
        verb: 'post'
      },
      description: 'Get section by section name',
      accepts: {
        arg: 'section_name',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.remoteMethod(
    'getsectionbyclassname', {
      http: {
        path: '/getsectionbyclassname',
        verb: 'post'
      },
      description: 'Get sections by class name',
      accepts: {
        arg: 'section_name',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );


  Section.getSession = function (schoolId) {
    var Session = Section.app.models.session;
    return new Promise(function (resolve, reject) {
      Session.getactiveschoolsession({
        "school_id": schoolId
      }, function (err, sessionData) {
        if (err) {
          return cb(null, err);
        }
        resolve(sessionData);
      })
    });
  }

  Section.getsectionbynameschool = function (data, cb) {

    Section.findOne({
      fields: ["id"],
      where: {
        "section_name": data.section_name,
        "schoolId": data.school_id
      },
    }, function (err, stdObj) {

      return cb(null, stdObj);
    });
  };

  Section.remoteMethod(
    'getsectionbynameschool', {
      http: {
        path: '/getsectionbynameschool',
        verb: 'post'
      },
      description: 'Get Section by schoolid and name',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );


  Section.batchcreation = function (req, cb) {

    var successMessage = {};
    var errorMessage = {};
    var errors = {};
    req.location = "insert";
    Section.checkbatchValidation(req, function (error, validateResponse) {
      if (validateResponse.responseCode == '200') {
        var Session = Section.app.models.session;
        var Subject = Section.app.models.subject;
        var Classsubject = Section.app.models.class_subject;
        var Usersection = Section.app.models.user_sections;
        var Usersubject = Section.app.models.user_subject;
        var Emsccsynclog = Section.app.models.emscc_sync_log;
        var Userschool = Section.app.models.user_school;
        var Class = Section.app.models.class;
        var batchDetail = req.batch_details;
        var batchAssignDetail = req.batch_assign_details;

        var batchName = batchDetail.batch_name;
        var schoolId = batchDetail.center_id;
        var classId = batchDetail.course_type_id;
        var className = batchDetail.course_type_name;

        var classSection = className + '-' + batchName;


        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");

        Section.beginTransaction('READ COMMITTED', function (err, tx) {
          try {
            var options = {
              transaction: tx
            };
            var userArr = [];
            var userSubjectArray = [];
            var userSchoolArray = [];
            Session.findOne({
              where: {
                "status": "Active",
                "schoolId": schoolId
              }
            }, options, function (err, sessionData) {
              if (err) {
                if (err) throw (err);
              } else {
                Class.findOne({
                  where: {
                    "class_name": className,
                    "schoolId": schoolId
                  }
                }, options, function (err, classData) {
                  if (err) {
                    if (err) throw (err);
                  } else {
                    if (classData) {
                      var classIds = classData.id;
                      Section.findOne({
                        fields: ["id"],
                        where: {
                          "section_name": classSection,
                          "schoolId": schoolId
                        },
                      }, options, function (err, ClassArr) {
                        if (err) {
                          if (err) throw (err);
                        } else {
                          if (ClassArr == null) {
                            var sectionArr = {
                              "section_name": classSection,
                              "class_name": className,
                              "class_order": 1,
                              "stream_name": "GENERAL",
                              "section_seats": 50,
                              "schoolId": schoolId,
                              "section": batchName,
                              "classId": classIds
                            };
                            Section.create(sectionArr, options, function (err, response) {
                              if (err) {
                                if (err) throw (err);
                              } else {
                                var sectionId = response.id;
                                Subject.find({
                                  where: {
                                    "schoolId": schoolId
                                  },
                                }, options, function (err, subjectData) {
                                  if (err) throw (err);

                                  if (subjectData) {
                                    subjectData.forEach(function (subject) {
                                      var subjectId = subject.id;
                                      var classsubjectArr = {
                                        "sectionId": sectionId,
                                        "subjectId": subjectId,
                                        "subject_type": 'Main',
                                        "sessionId": sessionData.id,
                                        "subject_code": subject.subject_code,
                                        "status": 'Active',
                                        "schoolId": schoolId,
                                        "created_date": currentDates,
                                        "classId": classIds
                                      };
                                      Classsubject.create(classsubjectArr, options, function (err, response) {
                                        if (err) throw (err);
                                      });
                                    });
                                  } else {
                                    errors.responseMessage = "No any subject in this school";
                                    errors.responseCode = "201";
                                    Section.customerror(errors, tx, cb);
                                  }


                                  batchAssignDetail.forEach(function (batchUser) {
                                    var userId = batchUser.tle_user_id;
                                    var subjectName = batchUser.subject_name;
                                    if (userId) {
                                      var schoolFlag = true;

                                      for (var k in userSchoolArray) {
                                        if (userSchoolArray[k].userId == userId && userSchoolArray[k].schoolId == schoolId) {
                                          schoolFlag = false;
                                        }
                                      }

                                      if (schoolFlag) {
                                        userSchoolArray.push({
                                          userId: userId,
                                          schoolId: schoolId
                                        });
                                        Userschool.findOne({
                                          where: {
                                            "userId": userId,
                                            "schoolId": schoolId
                                          }
                                        }, options, function (err, schoolData) {
                                          if (err) throw (err);
                                          if (schoolData == null) {
                                            var userSchoolRequest = {
                                              "userId": userId,
                                              "schoolId": schoolId,
                                              "user_type": 'Teacher',
                                              "created_date": currentDates
                                            };
                                            Userschool.upsert(userSchoolRequest, options, function (err) {
                                              if (err) throw (err);
                                            });
                                          }

                                        });
                                      }

                                      var userSectionArr = {
                                        "userId": userId,
                                        "sectionId": sectionId,
                                        "sessionId": sessionData.id,
                                        "class_teacher": 'No',
                                        "user_type": "Teacher",
                                        "roll_no": 0,
                                        "status": 'Active',
                                        "schoolId": schoolId
                                      };

                                      if (userArr.indexOf(userId) == -1) {
                                        userArr.push(userId);
                                        Usersection.find({
                                          where: {
                                            "userId": userId,
                                            "schoolId": schoolId,
                                            "sessionId": sessionData.id,
                                            "user_type": "Teacher",
                                            "sectionId": sectionId,
                                            "status": "Active"
                                          },
                                        }, options, function (err, userSectionData) {

                                          if (userSectionData.length == 0) {
                                            Usersection.create(userSectionArr, options, function (err, result) {
                                              if (err) throw (err);
                                            });
                                          }
                                        });
                                      }

                                      Subject.findOne({
                                        where: {
                                          "schoolId": schoolId,
                                          "subject_name": subjectName
                                        },
                                      }, options, function (err, assignedSubject) {
                                        if (err) throw (err);

                                        if (assignedSubject != null) {
                                          var subjectId = assignedSubject.id;



                                          var userSubFlag = true;
                                          for (var i in userSubjectArray) {
                                            if (userSubjectArray[i].userId == userId && userSubjectArray[i].subjectId == subjectId && userSubjectArray[i].sectionId == sectionId) {
                                              userSubFlag = false;
                                            }
                                          }
                                          if (userSubFlag) {
                                            userSubjectArray.push({
                                              sectionId: sectionId,
                                              subjectId: subjectId,
                                              userId: userId
                                            })
                                            Usersubject.findOne({
                                              where: {
                                                "schoolId": schoolId,
                                                "subjectId": subjectId,
                                                "userId": userId,
                                                "sectionId": sectionId
                                              },
                                            }, options, function (err, userSubjects) {
                                              if (err) throw (err);

                                              if (userSubjects == null) {
                                                Classsubject.findOne({
                                                  where: {
                                                    sectionId: sectionId,
                                                    subjectId: subjectId,
                                                    schoolId: schoolId,
                                                    sessionId: sessionData.id
                                                  }
                                                }, options, function (err, subjectClass) {

                                                  if (err) throw (err);

                                                  if (subjectClass != null) {
                                                    var classSubjectId = subjectClass.id;
                                                    var userSubjectArr = {
                                                      "userId": userId,
                                                      "sessionId": sessionData.id,
                                                      "sectionId": sectionId,
                                                      "subjectId": subjectId,
                                                      "status": 'Active',
                                                      "schoolId": schoolId,
                                                      "user_type": "Teacher",
                                                      "created_date": currentDates,
                                                      "class_subjectId": classSubjectId
                                                    };
                                                    Usersubject.upsert(userSubjectArr, options, function (err, result) {
                                                      if (err) throw (err);

                                                      tx.commit(function (err) {});
                                                      successMessage.responseCode = "200";
                                                      successMessage.tle_batch_id = sectionId;
                                                      successMessage.responseMessage = "Added Successfully ";

                                                    });
                                                  } else {
                                                    errors.responseMessage = "Class subject id is null";
                                                    errors.responseCode = "201";
                                                    Section.customerror(errors, tx, cb);
                                                  }

                                                });
                                              }
                                            });
                                          }

                                        } else {
                                          errors.responseMessage = "Subject Not Match";
                                          errors.responseCode = "201";
                                          Section.customerror(errors, tx, cb);
                                        }

                                      });
                                    }
                                  });
                                  successMessage.responseCode = "200";
                                  successMessage.tle_batch_id = sectionId;
                                  successMessage.responseMessage = "Added Successfully ";
                                  cb(null, successMessage, sectionId, '200');
                                });
                              }
                            });
                          } else {
                            errors.responseMessage = "Section name Already exist";
                            errors.responseCode = "201";
                            Section.customerror(errors, tx, cb);
                          }
                        }
                      });
                    } else {
                      errors.responseMessage = "Class name not exist";
                      errors.responseCode = "201";
                      Section.customerror(errors, tx, cb);
                    }
                  }
                });
              }
            });

          } catch (error) {
            tx.rollback(function (err) {});
            cb(null, error);
          }

        });
      } else {
        errors.responseMessage = validateResponse.responseMessage;
        errors.responseCode = "201";
        return cb(null, errors, null, '201');
      }
    })


  };

  Section.remoteMethod(
    'batchcreation', {
      http: {
        path: '/batchcreation',
        verb: 'post'
      },
      description: 'Get Section by schoolid and name',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }, {
        arg: 'tle_batch_id',
        type: 'json'
      }, {
        arg: 'responseCode',
        type: 'json'
      }]
    }
  );


  Section.updatebatchold = function (req, cb) {
    var successMessage = {};
    var errorMessage = {};
    var errors = {};
    req.location = "updateBatch";
    Section.checkbatchValidation(req, function (error, validateResponse) {
      if (validateResponse.responseCode == '200') {
        var Session = Section.app.models.session;
        var Subject = Section.app.models.subject;
        var Classsubject = Section.app.models.class_subject;
        var Usersection = Section.app.models.user_sections;
        var Usersubject = Section.app.models.user_subject;
        var Emsccsynclog = Section.app.models.emscc_sync_log;
        var Userschool = Section.app.models.user_school;
        var Class = Section.app.models.class;
        var batchDetail = req.batch_details;
        var batchAssignDetail = req.batch_assign_details;

        var schoolId = batchDetail.center_id;
        var tleBatchId = batchDetail.tle_batch_id;



        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");
        var userSchoolArray = [];
        Section.beginTransaction('READ COMMITTED', function (err, tx) {
          try {
            var options = {
              transaction: tx
            };
            var userArr = [];
            Session.findOne({
              where: {
                "status": "Active",
                "schoolId": schoolId
              }
            }, options, function (err, sessionData) {

              if (err) {
                if (err) throw (err);
              } else {
                var sessionId = sessionData.id;
                Usersection.find({
                  fields: 'userId',
                  where: {
                    "schoolId": schoolId,
                    "sessionId": sessionId,
                    "user_type": "Teacher",
                    "sectionId": tleBatchId,
                    "status": "Active"
                  },
                }, options, function (err, userSectionData) {
                  if (err) throw (err);
                  batchAssignDetail.forEach(function (batchUser) {
                    var userId = batchUser.tle_user_id;
                    var subjectName = batchUser.subject_name;

                    var result = userSectionData.map(a => a.userId);
                    var variable = Object.keys(result).find(key => result[key] == userId)

                    if (variable) {
                      // update

                      Subject.findOne({
                        where: {
                          "schoolId": schoolId,
                          "subject_name": subjectName
                        },
                      }, options, function (err, assignedSubject) {
                        if (err) throw (err);

                        if (assignedSubject != null) {
                          var subjectId = assignedSubject.id;

                          Usersubject.findOne({
                            where: {
                              "schoolId": schoolId,
                              "subjectId": subjectId,
                              "userId": userId,
                              "sectionId": tleBatchId
                            },
                          }, options, function (err, userSubjects) {
                            if (err) throw (err);

                            if (userSubjects == null) {

                              Classsubject.findOne({
                                where: {
                                  sectionId: tleBatchId,
                                  subjectId: subjectId,
                                  schoolId: schoolId,
                                  sessionId: sessionId
                                }
                              }, options, function (err, subjectClass) {

                                var classSubjectId = subjectClass.id;
                                var userSubjectArr = {
                                  "userId": userId,
                                  "sessionId": sessionId,
                                  "sectionId": tleBatchId,
                                  "subjectId": subjectId,
                                  "status": 'Active',
                                  "schoolId": schoolId,
                                  "user_type": "Teacher",
                                  "created_date": currentDates,
                                  "class_subjectId": classSubjectId
                                };

                                Usersubject.upsert(userSubjectArr, options, function (err, result) {
                                  if (err) throw (err);

                                  successMessage.responseCode = "200";
                                  successMessage.tle_batch_id = tleBatchId;
                                  successMessage.responseMessage = "Batch Updated Successfully";
                                  tx.commit(function (err) {});
                                });
                              });
                            } else {
                              successMessage.responseCode = "200";
                              successMessage.tle_batch_id = tleBatchId;
                              successMessage.responseMessage = "Batch Updated Successfully";
                            }

                          });
                        }
                      });

                    } else {
                      // insert
                      var schoolFlag = true;

                      for (var k in userSchoolArray) {
                        if (userSchoolArray[k].userId == userId && userSchoolArray[k].schoolId == schoolId) {
                          schoolFlag = false;
                        }
                      }

                      if (schoolFlag) {
                        userSchoolArray.push({
                          userId: userId,
                          schoolId: schoolId
                        });
                        Userschool.findOne({
                          where: {
                            "userId": userId,
                            "schoolId": schoolId
                          }
                        }, options, function (err, schoolData) {
                          if (err) throw (err);

                          if (schoolData == null) {
                            var userSchoolRequest = {
                              "userId": userId,
                              "schoolId": schoolId,
                              "user_type": 'Teacher',
                              "created_date": currentDates
                            };
                            Userschool.upsert(userSchoolRequest, options, function (err) {
                              if (err) throw (err);
                            });
                          }
                        });
                      }


                      var userSectionArr = {
                        "userId": userId,
                        "sectionId": tleBatchId,
                        "sessionId": sessionId,
                        "class_teacher": 'No',
                        "user_type": "Teacher",
                        "roll_no": 0,
                        "status": 'Active',
                        "schoolId": schoolId
                      };
                      if (userArr.indexOf(userId) == -1) {
                        userArr.push(userId);
                        Usersection.find({
                          where: {
                            "userId": userId,
                            "schoolId": schoolId,
                            "sessionId": sessionId,
                            "user_type": "Teacher",
                            "sectionId": tleBatchId,
                            "status": "Active"
                          },
                        }, options, function (err, userSectionData) {

                          if (userSectionData.length == 0) {
                            Usersection.create(userSectionArr, options, function (err, result) {
                              if (err) throw (err);
                            });
                          }
                        });
                      }


                      Subject.findOne({
                        where: {
                          "schoolId": schoolId,
                          "subject_name": subjectName
                        },
                      }, options, function (err, assignedSubject) {
                        if (err) throw (err);

                        if (assignedSubject != null) {
                          var subjectId = assignedSubject.id;

                          Classsubject.findOne({
                            where: {
                              sectionId: tleBatchId,
                              subjectId: subjectId,
                              schoolId: schoolId,
                              sessionId: sessionId
                            }
                          }, options, function (err, subjectClass) {

                            if (err) throw (err);

                            if (subjectClass != null) {
                              var classSubjectId = subjectClass.id;
                              var userSubjectArr = {
                                "userId": userId,
                                "sessionId": sessionId,
                                "sectionId": tleBatchId,
                                "subjectId": subjectId,
                                "status": 'Active',
                                "schoolId": schoolId,
                                "user_type": "Teacher",
                                "created_date": currentDates,
                                "class_subjectId": classSubjectId
                              };
                              Usersubject.upsert(userSubjectArr, options, function (err, result) {
                                if (err) throw (err);

                                successMessage.responseCode = "200";
                                successMessage.tle_batch_id = tleBatchId;
                                successMessage.responseMessage = "Batch Updated Successfully";
                                tx.commit(function (err) {});

                              });
                            } else {
                              errors.responseMessage = "Class subject id is null";
                              errors.responseCode = "201";
                              Section.customerror(errors, tx, cb);
                            }

                          });

                        } else {
                          errors.responseMessage = "Subject Not Match";
                          errors.responseCode = "201";
                          Section.customerror(errors, tx, cb);
                        }

                      });

                    }
                  });

                });
              }
            });
            successMessage.responseCode = "200";
            successMessage.tle_batch_id = tleBatchId;
            successMessage.responseMessage = "Batch Updated Successfully";
            return cb(null, successMessage, tleBatchId, '200');

          } catch (error) {
            tx.rollback(function (err) {});
            return cb(null, error);
          }
        });
      } else {
        errors.responseMessage = validateResponse.responseMessage;
        errors.responseCode = "201";
        return cb(null, errors, null, '201');
      }
    })

  };

  Section.remoteMethod(
    'updatebatchold', {
      http: {
        path: '/updatebatchold',
        verb: 'post'
      },
      description: 'Update Batch Detail',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }, {
        arg: 'tle_batch_id',
        type: 'json'
      }, {
        arg: 'responseCode',
        type: 'json'
      }]
    }
  );


  Section.customerror = function (error, tx, cb) {
    //console.log(error);
    tx.rollback(function (err) {});
    return cb(null, error);
  };

  Section.checkbatchValidation = function (allfields, cb) {
    var errors = {};
    var successMessage = {};
    var batch_details = allfields.batch_details;
    var batch_assign_details = allfields.batch_assign_details;
    if (batch_assign_details.length <= 0) {
      errors.responseMessage = "Batch assign detail array can't blank";
      errors.responseCode = "201";
      return cb(null, errors);
    }
    if (!batch_details.center_id) {
      errors.responseMessage = "Center id cannot be blank";
      errors.responseCode = "201";
      return cb(null, errors);
    }
    if (!batch_details.batch_name) {
      errors.responseMessage = "Batch name cannot be blank";
      errors.responseCode = "201";
      return cb(null, errors);
    }
    if (!batch_details.course_type_name) {
      errors.responseMessage = "Course type name cannot be blank";
      errors.responseCode = "201";
      return cb(null, errors);
    }
    if (!batch_details.center_code) {
      errors.responseMessage = "Center code cannot be blank";
      errors.responseCode = "201";
      return cb(null, errors);
    }
    for (var i in batch_assign_details) {
      if (!batch_assign_details[i].subject_name) {
        errors.responseMessage = "subject name cannot be blank";
        errors.responseCode = "201";
        return cb(null, errors);
      }
    }
    if (allfields.location == 'updateBatch' && !batch_details.tle_batch_id) {
      errors.responseMessage = "Tle batch id cannot be blank";
      errors.responseCode = "201";
      return cb(null, errors);
    }
    successMessage.responseMessage = "Data verified successfully";
    successMessage.responseCode = "200";
    return cb(null, successMessage);

  }

  Section.remoteMethod(
    'checkbatchValidation', {
      http: {
        path: '/checkbatchValidation',
        verb: 'post'
      },
      description: 'validation check',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'responseStatus',
        type: 'json'
      }]
    }
  );

  /*
   * Get school wise section list
   */
  Section.schoolwisesectionlist = function (data, cb) {
    var schoolId = data.school_id;

    var errors = {};
    var success = {};
    if (schoolId == "") {
      errors.responseMessage = "School id cannot be blank";
      errors.responseCode = "201";
      return cb(null, errors);
    }
    Section.find({
      where: {
        schoolId: schoolId
      },
      include: {
        relation: "section_subjects",
      }

    }, function (err, section) {
      if (err) {
        cb(null, err);
      } else {
        var archivedSort = arraySort(section, ['class_order', 'section']);
        cb(null, archivedSort);
      }
    });

  };

  Section.remoteMethod(
    'schoolwisesectionlist', {
      http: {
        path: '/schoolwisesectionlist',
        verb: 'post'
      },
      description: 'Get school wise section list',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );

  Section.updatebatch = function (req, cb) {
    var successMessage = {};
    var errorMessage = {};
    var errors = {};
    req.location = "updateBatch";

    Section.checkbatchValidation(req, function (error, validateResponse) {
      if (validateResponse.responseCode == '200') {
        var Session = Section.app.models.session;
        var Subject = Section.app.models.subject;
        var Classsubject = Section.app.models.class_subject;
        var Usersection = Section.app.models.user_sections;
        var Usersubject = Section.app.models.user_subject;
        var Emsccsynclog = Section.app.models.emscc_sync_log;
        var Userschool = Section.app.models.user_school;
        var Class = Section.app.models.class;
        var batchDetail = req.batch_details;
        var batchAssignDetail = req.batch_assign_details;

        var batchName = batchDetail.batch_name;
        var schoolId = batchDetail.center_id;
        var classId = batchDetail.course_type_id;
        var className = batchDetail.course_type_name;
        var classSection = className + '-' + batchName;
        var tleBatchId = batchDetail.tle_batch_id;

        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");

        Section.beginTransaction('READ COMMITTED', function (err, tx) {
          try {
            var options = {
              transaction: tx
            };
            var userArr = [];
            var userSubjectArray = [];
            var userSchoolArray = [];

            Session.findOne({
              where: {
                "status": "Active",
                "schoolId": schoolId
              }
            }, options, function (err, sessionData) {
              if (err) {
                if (err) throw (err);
              } else {
                Usersection.destroyAll({
                  sectionId: tleBatchId,
                  schoolId: schoolId,
                  sessionId: sessionData.id,
                  user_type: "Teacher"
                }, options, function (err, response) {
                  if (err) {
                    if (err) throw (err);
                  } else {
                    Usersubject.destroyAll({
                      sectionId: tleBatchId,
                      schoolId: schoolId,
                      sessionId: sessionData.id,
                      user_type: "Teacher"
                    }, options, function (err, response) {
                      if (err) {
                        if (err) throw (err);
                      } else {
                        if (batchAssignDetail.length > 0) {
                          batchAssignDetail.forEach(function (batchUser) {
                            var userId = batchUser.tle_user_id;
                            var subjectName = batchUser.subject_name;
                            if (userId) {
                              var userSectionArr = {
                                "userId": userId,
                                "sectionId": tleBatchId,
                                "sessionId": sessionData.id,
                                "class_teacher": 'No',
                                "user_type": "Teacher",
                                "roll_no": 0,
                                "status": 'Active',
                                "schoolId": schoolId
                              };

                              if (userArr.indexOf(userId) == -1) {
                                userArr.push(userId);
                                Usersection.find({
                                  where: {
                                    "userId": userId,
                                    "schoolId": schoolId,
                                    "sessionId": sessionData.id,
                                    "user_type": "Teacher",
                                    "sectionId": tleBatchId,
                                    "status": "Active"
                                  },
                                }, options, function (err, userSectionData) {

                                  if (userSectionData.length == 0) {
                                    Usersection.create(userSectionArr, options, function (err, result) {
                                      if (err) throw (err);
                                    });
                                  }
                                });
                              }


                              /* Insert in user subject subject */
                              Subject.findOne({
                                where: {
                                  "schoolId": schoolId,
                                  "subject_name": subjectName
                                },
                              }, options, function (err, assignedSubject) {
                                if (err) throw (err);
                                if (assignedSubject != null) {
                                  var subjectId = assignedSubject.id;

                                  var userSubFlag = true;
                                  for (var i in userSubjectArray) {
                                    if (userSubjectArray[i].userId == userId && userSubjectArray[i].subjectId == subjectId && userSubjectArray[i].sectionId == tleBatchId) {
                                      userSubFlag = false;
                                    }
                                  }
                                  if (userSubFlag) {
                                    userSubjectArray.push({
                                      sectionId: tleBatchId,
                                      subjectId: subjectId,
                                      userId: userId
                                    });

                                    Usersubject.findOne({
                                      where: {
                                        "schoolId": schoolId,
                                        "subjectId": subjectId,
                                        "userId": userId,
                                        "sectionId": tleBatchId
                                      },
                                    }, options, function (err, userSubjects) {
                                      if (err) throw (err);

                                      if (userSubjects == null) {
                                        Classsubject.findOne({
                                          where: {
                                            sectionId: tleBatchId,
                                            subjectId: subjectId,
                                            schoolId: schoolId,
                                            sessionId: sessionData.id
                                          }
                                        }, options, function (err, subjectClass) {
                                          if (err) throw (err);

                                          if (subjectClass != null) {
                                            var classSubjectId = subjectClass.id;
                                            var userSubjectArr = {
                                              "userId": userId,
                                              "sessionId": sessionData.id,
                                              "sectionId": tleBatchId,
                                              "subjectId": subjectId,
                                              "status": 'Active',
                                              "schoolId": schoolId,
                                              "user_type": "Teacher",
                                              "created_date": currentDates,
                                              "class_subjectId": classSubjectId
                                            };
                                            Usersubject.upsert(userSubjectArr, options, function (err, result) {
                                              if (err) throw (err);

                                              tx.commit(function (err) {});
                                              successMessage.responseCode = "200";
                                              successMessage.tle_batch_id = tleBatchId;
                                              successMessage.responseMessage = "Updated Successfully ";

                                            });
                                          } else {
                                            errors.responseMessage = "Class subject id is null";
                                            errors.responseCode = "201";
                                            Section.customerror(errors, tx, cb);
                                          }
                                        })
                                      }

                                    });
                                  }
                                } else {
                                  errors.responseMessage = "Subject Not Match";
                                  errors.responseCode = "201";
                                  Section.customerror(errors, tx, cb);
                                }
                              });
                            }
                          });
                          successMessage.responseCode = "200";
                          successMessage.tle_batch_id = tleBatchId;
                          successMessage.responseMessage = "Added Successfully ";
                          cb(null, successMessage, tleBatchId, '200');
                        } else {
                          errors.responseMessage = "Batch assign detail array can't blank";
                          errors.responseCode = "201";
                          Section.customerror(errors, tx, cb);
                        }
                      }
                    });
                  }
                });
              }
            });

          } catch (error) {
            tx.rollback(function (err) {});
            cb(null, error);
          }
        });
      }
    });
  }

  Section.remoteMethod(
    'updatebatch', {
      http: {
        path: '/updatebatch',
        verb: 'post'
      },
      description: 'Update Batch Detail',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }, {
        arg: 'tle_batch_id',
        type: 'json'
      }, {
        arg: 'responseCode',
        type: 'json'
      }]
    }
  );
  Section.clasnames = function (req, cb) {
    let msg = {},
      resarr = [];


    Section.find({
        fields: ['section_name'],


        order: 'classId ASC'
      },
      (err, res) => {
        if (err)
          throw err;
        if (res) {

          res = Dedupe(res, ['section_name']);

          return cb(null, msg, res);
        }
      });

  }
  Section.remoteMethod(
    'clasnames', {
      http: {
        path: '/clasnames',
        verb: 'get'
      },
      description: 'Get all the Head Name',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response_status',
        type: 'json'
      }, {
        arg: 'response',
        type: 'object'
      }]
    });
  Section.classesnames = function (req, cb) {
    let msg = {},
      resarr = [];


    Section.find({
        fields: ['class_name'],


        order: 'classId ASC'
      },
      (err, res) => {
        if (err)
          throw err;
        if (res) {

          res = Dedupe(res, ['class_name']);

          return cb(null, msg, res);
        }
      });

  }
  Section.remoteMethod(
    'classesnames', {
      http: {
        path: '/classesnames',
        verb: 'get'
      },
      description: 'Get all the Head Name',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response_status',
        type: 'json'
      }, {
        arg: 'response',
        type: 'object'
      }]
    });
  Section.allsectionbyclassid = function (req, cb) {
    let message = {},
      resarr = [];

    if (!req) {
      message.status = '201';
      message.message = "Class id cannot blank";
      cb(null, message);
    }
    var coursemode;
    if (req.course_mode_id) {
      coursemode = req.course_mode_id
    } else {
      coursemode = undefined
    }

    Section.find({
        fields: ['id', 'section_name', 'boardId', 'course_mode_id'],
        where: {
          classId: req.class_id,
          course_mode_id: coursemode
        },

        order: 'id ASC'
      },
      (err, resp) => {
        if (err)
          throw err;
        if (resp) {

          message.status = '200';
          message.message = "Data fetch successfully";

          return cb(null, message, resp);
        }
      });

  }
  Section.remoteMethod(
    'allsectionbyclassid', {
      http: {
        path: '/allsectionbyclassid',
        verb: 'post'
      },
      description: 'Get Assigned Classes',
      accepts: [{
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      }],
      returns: [{
        arg: 'response_status',
        type: 'json'
      }, {
        arg: 'response',
        type: 'json'
      }]
    }
  );

  Section.sectionbyid = function (data, cb) {
    Section.findOne({
      where: {
        id: data.section_id
      },
      include: [{
        relation: "section_class"
      }, {
        relation: "board"
      }],
      order: 'id DESC'
    }, function (err, result) {
      if (err) {
        console.error("Some error occurred", err);
      } else {
        cb(null, result);
      }
    });
  };

  Section.remoteMethod(
    'sectionbyid', {
      http: {
        path: '/sectionbyid',
        verb: 'post'
      },
      description: 'sectionbyid ',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );


  Section.getbatchdetails = function (data, cb) {

    Section.find(data, function (err, res) {
      let result = '';
      if (err) {
        result = {
          status: '201',
          message: 'Something went wrong',
          data: err
        };
        console.error("", result);
      } else {
        if (res.length > 0) {
          result = {
            status: '200',
            message: 'Success',
            data: res
          };
        } else {
          result = {
            status: '202',
            message: 'Fail',
            data: res
          };
        }
        cb(null, result);
      }
    });
  };

  Section.remoteMethod(
    'getbatchdetails', {
      http: {
        path: '/getbatchdetails',
        verb: 'post'
      },
      description: 'Get Batch Details',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );

  Section.updatebatchdetails = function (data, cb) {

    Section.update(data.where, data.params, function (err, res) {
      let result = '';
      if (err) {
        result = {
          status: '201',
          message: 'Something went wrong',
          data: err
        };
        console.error("", result);
      } else {
        if (res.length > 0) {
          result = {
            status: '200',
            message: 'Success',
            data: res
          };
        } else {
          result = {
            status: '202',
            message: 'Fail',
            data: res
          };
        }
        cb(null, result);
      }
    });
  };

  Section.remoteMethod(
    'updatebatchdetails', {
      http: {
        path: '/updatebatchdetails',
        verb: 'post'
      },
      description: 'Get Batch Details',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );

  Section.savebatchdetails = function (data, cb) {
    let batchId = (data.id) ? data.id : 0;
    let coursModeObj = Section.app.models.course_mode
    let courseModeId = data.course_mode_id;
    coursModeObj.getcoursebyid(courseModeId, (err, cmres) => {
      var streamName = cmres.course_mode_name
      data.stream_name = streamName;
      let classId = data.classId
      let classObj = Section.app.models.class;
      classObj.getclassdata(classId, (err, clsres) => {
        let className = clsres.class_name;
        let classOrder = clsres.class_order;
        let lmsClassId = clsres.classId;
        data.class_name = className;
        data.class_order = classOrder;

        let roomId = data.room_id
        let roomObj = Section.app.models.center_room_master;
        roomObj.getrowdata(roomId, (err, roomres) => {
          if (roomres) {
            const today = new Date();
            let currentDate = {
              year: today.getFullYear(),
              month: today.getMonth() + 1,
              day: today.getDate()
            };

            var roomCapacity = roomres.sitting_capacity;
            data.section_seats = roomCapacity;
            let sectionStr = data.section;
            let sectionName = className + '-' + sectionStr;
            data.section_name = sectionName;

            var monthStr = (currentDate.month > 9) ? currentDate.month : '0' + currentDate.month;
            var dayStr = (currentDate.day > 9) ? currentDate.day : '0' + currentDate.day;
            let dateStr = currentDate.year + '-' + monthStr + '-' + dayStr;

            let existingConditions = {
              where: {
                schoolId: data.schoolId,
                session_id: data.session_id,
                boardId: data.boardId,
                classId: data.classId,
                section: data.section
              },
              order: 'id DESC'
            };

            let result = {};
            Section.getbatchdetails(existingConditions, (err, secRes) => {
              //console.log("*******************************");
              //console.log(secRes);
              if (secRes.status == '200' && batchId == 0) {
                let message = 'This batch is already exist in this class & secssion.';
                result.status = '201';
                result.message = message;
                result.data = secRes;
                cb(null, result);
              } else {
                let classSubjectObj = Section.app.models.class_subject;

                Section.addsection(data, (err, saveResult) => {
                  //console.log("ADD RESULT");
                  //console.log(saveResult);
                  if (saveResult.id > 0) {
                    let batchAutoId = saveResult.id;
                    let removeData = {
                      where: {
                        sectionId: batchAutoId
                      },
                      params: {
                        status: 'Inactive'
                      }
                    };
                    var subjectList = [];
                    var batchSubData = [];
                    var extClsSubData = [];
                    const subjectInputs = {
                      where: {
                        //boardId: data.boardId,
                        classId: lmsClassId,
                        status: 'Active'
                      },
                      order: 'id DESC'
                    };
                    let lmsClassSbj = Section.app.models.lms_class_subject;
                    lmsClassSbj.classsubjectList(subjectInputs, (err, resSubject) => {
                      //console.log("BOARD CLASS");
                      //console.log(resSubject);
                      if (resSubject.data) {
                        subjectList = resSubject.data;

                        if (subjectList.length > 0) {
                          subjectList.forEach((val, key) => {
                            extClsSubData[key] = {
                              where: {
                                sectionId: batchAutoId,
                                classId: data.classId,
                                subjectId: val.subjectId,
                                sessionId: data.session_id,
                                schoolId: data.schoolId,
                                status: 'Active'
                              }
                            };

                            classSubjectObj.classsubjectList(extClsSubData[key], (cb, existingData) => {
                              var extArr = existingData.data
                              if (extArr.length > 0) {
                                // Already Exist extArr.id
                                //console.log('Already Exist' + extArr.id);

                              } else {
                                batchSubData[key] = {
                                  sectionId: batchAutoId,
                                  classId: data.classId,
                                  subjectId: val.subjectId,
                                  sessionId: data.session_id,
                                  schoolId: data.schoolId,
                                  status: 'Active',
                                  created_date: new Date(),
                                  school_code: val.school_code
                                };
                                classSubjectObj.savedata(batchSubData[key], (err, batchSubjects) => { });
                              }
                            });
                          });
                        }
                      }
                      //cb(null, saveResult);
                    });
                    var message = (data.id > 0) ? "Batch details updated successfully." : "Batch Created successfully.";
                    result.status = '200';
                    result.message = message;
                    result.data = saveResult;
                    cb(null, result);
                  }
                });
              }
            });

          }
        });

      });

    })


  };

  Section.remoteMethod(
    'savebatchdetails', {
      http: {
        path: '/savebatchdetails',
        verb: 'post'
      },
      description: 'Add Section',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.list = function (data, cb) {

    Section.find(data, (err, res) => {
      if (err) {
        let result = {
          status: '201',
          message: 'Something went wrong'
        }
        cb(null, result);
      }
      let result = {
        status: '200',
        message: 'Success',
        data: res
      }
      cb(null, result);
    })
  }

  Section.remoteMethod(
    'list', {
      http: {
        path: '/list',
        verb: 'post'
      },
      description: 'Get All Batch List',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.batchsummary = function (data, cb) {

    const batchListConditions = {
      where: {
        schoolId: data.school_id
      },
      include: [{
          relation: "board",
          scope: {
            fields: ['board_name']
          }
        },
        {
          relation: "section_class",
          scope: {
            fields: ['class_name', 'id']
          }
        },
        {
          relation: "startdateData",
          scope: {
            fields: ['batch_start_date', 'id']
          }
        },
        {
          relation: "sessionData",
          scope: {
            fields: ['session_name', 'start_date', 'end_date', 'id']
          }
        },
        {
          relation: "roomData",
          scope: {
            fields: ['room_name', 'sitting_capacity', 'id']
          }
        },
        {
          relation: "userData",
          scope: {
            where: {
              status: 'Active'
            },
            fields: ['userId']
          }
        }

      ],
      order: 'id DESC'

    };

    Section.find(batchListConditions, (err, res) => {
      if (err) {
        let result = {
          status: '201',
          message: 'Something went wrong'
        };
        cb(null, result);
      }
      let result = {
        status: '200',
        message: 'Success',
        data: res
      };
      //console.log(res);
      cb(null, result);
    });
  }

  Section.remoteMethod(
    'batchsummary', {
      http: {
        path: '/batchsummary',
        verb: 'post'
      },
      description: 'Batch Summary',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );


  /***Get All Section by class Id** */

  Section.getsectionbyclass = function (classId, cb) {
    Section.find({
        where: {
          classId: classId
        }
      },
      function (err, result) {
        if (err) {
          return cb(null, err);
        }
        return cb(null, result);
      }
    );
  };

  Section.remoteMethod("getsectionbyclass", {
    http: {
      path: "/getsectionbyclass",
      verb: "get"
    },
    description: "Get Section by class Id",
    accepts: {
      arg: "classId",
      type: "number",
      required: true
    },
    returns: {
      arg: "response",
      type: "array"
    }
  });


  Section.getsectionbynameboardschool = function (data, cb) {
    Section.findOne({
      fields: ["id"],
      where: {
        section_name: data.section_name,
        schoolId: data.school_id,
        boardId: data.board_id
      },
    }, function (err, stdObj) {
      if (err) {
        return cb(null, err);
      }

      return cb(null, stdObj);
    });
  };


  Section.remoteMethod(
    'getsectionbynameboardschool', {
      http: {
        path: '/getsectionbynameboardschool',
        verb: 'post'
      },
      description: 'Get section by section name',
      accepts: {
        arg: 'section_name',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Section.getSectionList = function (req,cb) {
    var conditions={};
    if(req.school_id) conditions.schoolId=req.school_id;
    if(req.course_mode) conditions.course_mode_id=req.course_mode;
    if(req.course_id) conditions.boardId=req.course_id;
    if(req.course_type) conditions.classId=req.course_type;
    if(req.batch_name)  conditions.section_name={like:'%'+req.batch_name+'%'} 
       
   
    //console.log(conditions);
    var userCond={};
    Section.find({
      include:[
        {
          relation: "user_sections",
          scope: {
              where: userCond,
              fields: ['id','user_type'],
              
          }

        },
        {
          relation: "board",
          scope: {
              fields: ['board_name']
            
          }     
        },
        {
          relation: "schools",
          scope: {
              fields: ['school_name','school_code']
            
          }     
        },
        {
          relation: "startdateData",
          scope: {
              fields: ['batch_start_date']
            
          }     
        }
        
    ],
    where:conditions
    }, function (err, res) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, res);
      }
    });

  };

  Section.remoteMethod(
    'getSectionList',
    {
        http: {path: '/getsectionlist',verb: 'post'},
        description: 'Get Section list ',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response', type: 'json'}
    }
);

  /* get assigned lms board class to user */
  Section.getassignedlmsboardclass = function (data, cb) {
    Section.findOne({
      include: [
        {
          relation: "section_class",
          scope: {
            fields: ['classId'],
            where: {
              status: "Active"
            }
          }
        },
        {
          relation: "section_board",
          scope: {
            fields: ['boardId',"board_name"],
            where: {
              status: "Active"
            }
          }
        }
      ],
      where: {
        id: data.sectionId,
        schoolId: data.schoolId,
        sessionId: data.sessionId
      },
    }, function (err, stdObj) {
      if (err) {
        cb(null, err);
      }
      cb(null, stdObj);
    });
  };

  Section.remoteMethod(
    'getassignedlmsboardclass', {
      http: { path: '/getassignedlmsboardclass', verb: 'post' },
      description: 'Get section by section name',
      accepts: { arg: 'section_name', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  );

};
