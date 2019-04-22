'use strict';

var async = require('async');

module.exports = function (Class) {
    Class.getschoolclass = function (schoolId, cb) {

      Class.find({
        where: {
          "schoolId": schoolId
        },
      }, function (err, result) {
        if (err) {
          return cb(null, err);
        }
        return cb(null, result);
      });
    };

    Class.remoteMethod(
      'getschoolclass', {
        http: {
          path: '/getschoolclass',
          verb: 'get'
        },
        description: 'Get School Class',
        returns: {
          arg: 'response',
          type: 'array'
        }
      }
    );


  Class.remoteMethod("getschoolclass", {
    http: { path: "/getschoolclass", verb: "get" },
    description: "Get School Class",
    returns: { arg: "response", type: "array" }
  });

  /*
class list updation...
*/

    Class.getclasslist = function (req, cb) {

      var msg = {};
      var conditions = {
        and: [{
            schoolId: req.school_id
          },
          {
            status: req.status
          },
          {
            boardId: {gt:0}
          }
        ]
      };
      Class.find({
        include: {
          relation: "board",
          scope:{
              fields : ['board_name']
          }
      },
        where: conditions
      }, function (error, response) {

        if (error) {
          msg.status = "201";
          msg.messasge = "error occured";
          cb(null, msg);
        } else {
          msg.status = "200";
          msg.messasge = "Details fetched";
          cb(null, msg, response);
        }

      });

    }

    Class.remoteMethod(
      'getclasslist', {
        http: {
          path: '/getclasslist',
          verb: 'post'
        },
        description: 'getclasslist',
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
          type: 'json'
        }]
      }
    );

    /*
     * Create Class
     */

    Class.createclass = function (req, cb) {
      var successMessage = {};
      Class.upsert(req, function (error, inserted) {
        if (error) {
          return cb(null, error);
        }

        successMessage.status = '200';
        successMessage.message = "Class Created Successfully";
        return cb(null, successMessage);
      })
    }

    Class.remoteMethod(
      'createclass', {
        http: {
          path: '/createclass',
          verb: 'post'
        },
        description: 'Create Class',
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


    /*
     * Assign Board wise Class
     */

    Class.assignboardclass = function (data, cb) {
        var tempClassArray = data.postvalue;
        var dbBoardData = data.dbvalue;
         
        var errorMessage = {};
        var successMessage = {};
        
        async.each(tempClassArray, (element, cb) => {
            let params = {
                "boardId" : data.board_id,
                "classId" : element.rack_id,
                "class_name": element.rack_name,
                "status" : "Active",
                "added_by": data.added_by,
                "added_date": data.date,
                "schoolId" : null //data.school_id
            };

            var updateParam = {"status":"Inactive"};

            Class.update({ boardId:data.board_id, schoolId: null }, updateParam, function(err, result){

                if (err) { return cb(null, err);}

                if( dbBoardData.includes(element.rack_id)){
                    var updateActiveParam = {"status":"Active"};
                    Class.updateAll({ classId: element.rack_id, schoolId: null }, updateActiveParam, function (err, res) {
                        if (err) { return cb(null, err);}

                        successMessage.status = 200;
                        successMessage.message = "Class assign successfully";
                        //return cb(null, successMessage);
                    });
                }else{
                    let searchReq = {'board_id': data.board_id, 'rack_id': element.rack_id, 'lms_board_id': data.lms_board_id};
                    Class.getSubjectList(searchReq, params);
                }
            });



        });
       
      successMessage.message = "Course Assign/Unassign Successfully.";
      return cb(null, successMessage);
    }

    Class.getSubjectList = async (searchReq, insertClassArr) => {
      let lmsObj = Class.app.models.lmsapi;
      lmsObj.getsubjectlist(searchReq, (err, subjectArr) => {
        if (subjectArr.status == 200) {
          Class.CreateClass(insertClassArr, searchReq);
          async.each(subjectArr.data, (subjectVal, cb) => {
            Class.subjectmasterentry(subjectVal, insertClassArr.date, searchReq);
            
          });
        }
      });
    }

    Class.CreateClass = async (params, searchReq) => {
      let search = { "boardId": searchReq.board_id, "classId": searchReq.rack_id};
      Class.getboardclasswise(search, function (err, classBoard) {
        if (err) {
          return cb(null, err);
        }
        if (classBoard.length == 0) {
          let schoolObj = Class.app.models.school;
          Class.upsert(params, (err, res) => {
            if (err) {
              return cb(null, err);
            }
          });
          schoolObj.schoollist( function(err, schoolResult){
            if(schoolResult.length > 0)
            {
              schoolResult.forEach(schoolArr => {
                params.schoolId = schoolArr.id;
                Class.upsert(params, (err, res) => {
                  if (err) {
                    return cb(null, err);
                  }
                });
              });
            }
          });
        }
      });
    }

    Class.insertSubject = async (subjectArr, searchReq, date, subjectId) => {
      let lmsSubObj = Class.app.models.lms_class_subject;
      let subjectInsertObj = {
        classId: searchReq.rack_id,
        subjectId: subjectId,
        lms_subjectId: subjectArr.rack_id,
        boardId: searchReq.lms_board_id,
        subject_name: subjectArr.rack_name,
        subject_code: "",
        status: "Active",
        created_date: date
      }
      lmsSubObj.upsert(subjectInsertObj, (err, subjectResponse) => {
        if (err) {
          return cb(null, err);
        }
      });
    }

    Class.remoteMethod(
      'assignboardclass', {
        http: {
          path: '/assignboardclass',
          verb: 'post'
        },
        description: 'Assign Board wise Class',
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

    /* Insert Master Subject */
    Class.subjectmasterentry = async (subjectVal, date, searchReq) => {
      let subObj = Class.app.models.subject;
      let subjectParam = {
        subject_name: subjectVal.rack_name
      };
      
      subObj.getsubjectbyname(subjectParam, (err, subjectExist) => {
        if (err) {
          return cb(null, err);
        }
        if (subjectExist.length <=0) {
          let subjectInsertObj = {
            subject_name: subjectVal.rack_name,
            source: "lms",
            status: "Active",
            schoolId: 1,
            created_date: date
          }
          subObj.create(subjectInsertObj, (err, subjectEntry) => {
            if (err) {
              return cb(null, err);
            }
            Class.insertSubject(subjectVal, searchReq, date, subjectEntry.id);
          });
        }else{
          Class.insertSubject(subjectVal, searchReq, date, subjectExist.pop().id);
        }
      });
    }
 
    Class.getclasslistbyboardId = function (req, cb) {

      var msg = {};
      var conditions={};
      if(req.boardId) conditions.boardId=req.boardId;
      if(req.school_id) conditions.schoolId=req.school_id;
      Class.find({
        where: conditions
      }, function (error, response) {
        //console.log(response);
        if (error) {
          msg.status = "201";
          msg.messasge = "error occured";
          cb(null, msg);
        } else {
          msg.status = "200";
          msg.messasge = "Details fetched";
          cb(null, msg, response);
        }

      });

    }

    Class.remoteMethod(
      'getclasslistbyboardId', {
        http: {
          path: '/getclasslistbyboardId',
          verb: 'post'
        },
        description: 'getclasslistbyboardId',
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
          type: 'json'
        }]
      }
    );

    /*
     * Get Board Class
     */

    Class.getboardclasses = function (req, cb) {
      var msg = {};
      Class.find(req, function (error, response) {
        if (error) {
          msg.status = "201";
          msg.messasge = "error occured";
          cb(null, msg);
        } else {
          msg.status = "200";
          msg.messasge = "Details fetched";
          cb(null, msg, response);
        }

      });
    }

    Class.remoteMethod (
      'getboardclasses', {
        http: {
          path: '/getboardclasses',
          verb: 'post'
        },
        description: 'Get Board Classes',
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
          type: 'json'
        }]
      }
    );

    Class.getboardwiseclass = (req, cb) => {
        Class.find({
            where: {
                "boardId": req.board_id,
                "schoolId": null
            },
        }, function (err, result) {
            if (err) {
                return cb(err);
            }

            cb(null, result);
        });
    };

    Class.remoteMethod(
      'getboardwiseclass', {
        http: {
          path: '/getboardwiseclass',
          verb: 'post'
        },
        description: 'Get Board Wise Classes',
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

    Class.getclassdata = function (classId, cb) {
      Class.findOne({
        where: {
          id: classId
        },
      }, function (err, stdObj) {
        return cb(null, stdObj);
      });
    };

    Class.remoteMethod(
        'getclassdata', {
            http: { path: '/getclassdata', verb: 'get' },
            description: 'Get Class Info',
            accepts: { arg: 'classId', type: 'string', required: true },
            returns: { arg: 'response', type: 'json' }
        }
    );

    Class.getboardclasswise = (req, cb) => {
        Class.find({
          where: {
            "boardId": req.boardId,
            "classId": req.classId
          },
        }, function (err, result) {
          if (err) {
            return cb(err);
          }

          cb(null, result);
        });
      }

      Class.remoteMethod(
        'getboardclasswise', {
          http: {
            path: '/getboardclasswise',
            verb: 'post'
          },
          description: 'Get Board Wise Classes',
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

      /*
       * Get all active class who is null school id
       */

      Class.getclassnullschoolid = (cb) => {
        Class.find({
          where: {
            "status": "Active",
            "schoolId": null
          },
        }, function (err, result) {
          if (err) {
            return cb(err);
          }

          cb(null, result);
        });
      }


  Class.remoteMethod("getclassnullschoolid", {
    http: { path: "/getclassnullschoolid", verb: "post" },
    description: "Get Board Wise Classes",
    returns: [{ arg: "response", type: "json" }]
  });

   /***Get All active class by Board Id** */

   Class.getschoolclassbyboard = function(boardId, cb) {
    Class.find(
      {
        where: { status: "Active", boardId: boardId }
      },
      function(err, result) {
        if (err) {
          return cb(null, err);
        }
        return cb(null, result);
      }
    );
  };

  Class.remoteMethod("getschoolclassbyboard", {
    http: { path: "/getschoolclassbyboard", verb: "get" },
    description: "Get School Class by Board Id",
    accepts: { arg: "boardId", type: "number", required: true },
    returns: { arg: "response", type: "array" }
  });


  Class.schoolwiseclasscheck = function(req, cb) {
    Class.find(
      {
        where: { schoolId: req.school_id, class_name:req.class_name }
      },
      function(err, result) {
        if (err) {
          return cb(null, err);
        }
        return cb(null, result);
      }
    );
  };

  Class.remoteMethod("schoolwiseclasscheck", {
    http: { path: "/schoolwiseclasscheck", verb: "post" },
    description: "Get School Class by Board Id",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' }},
    returns: { arg: "response", type: "json" }
  });


  };
