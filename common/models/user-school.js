'use strict';

module.exports = function(Userschool) {
    Userschool.getuserschool = function(req , cb){
        Userschool.findOne({
          where: {"userId": req.user_id, "schoolId":req.school_id, "status":"Active"}
        }, function (err, res) {
            if(err){
                cb(null,err);
            }
            cb(null,res)
        });
    }

    Userschool.remoteMethod(
            'getuserschool',
            {
                http: {path: '/getuserschool', verb: 'post'},
                description: 'Get user school',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    /*
    * Get user school by user id
    */
    Userschool.getuserschoolbyid = function(req , cb){
        Userschool.findOne({
          where: {"userId": req.user_id, "status":"Active"}
        }, function (err, res) {
            if(err){
                cb(null,err);
            }
            cb(null,res)
        });
    }

    Userschool.remoteMethod(
            'getuserschoolbyid',
            {
                http: {path: '/getuserschoolbyid', verb: 'post'},
                description: 'Get user school',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    /*
    * Assign User Center
    */

    Userschool.assignusercenter = function(req, cb){
        var tempCenterArray = req.postvalue;
        var dbBoardData = req.dbvalue;
        var errorMessage = {};
        var successMessage = {};

        var registrationObj = Userschool.app.models.registration;
        var staffObj = Userschool.app.models.staff;
        var userObj = Userschool.app.models.user;

        if(req.source == 'center'){
            tempCenterArray.forEach(element => {
                // if staff not created then create staff
                staffObj.getstafbystaffcode(element.staff_code, function(err, result){
                    if(err){ return cb(null, err); }
                    if(result == null){
                        registrationObj.userregistration(element, function(err, success){
                            console.log(success);
                        });
                    }else{
                        var params = {
                            "userId" : result.userId,
                            "schoolId" :  element.school_id,
                            "user_type" : req.user_type,
                            "created_date" : element.date,
                            "status" : "Active"
                        };

                        var updateParam = {"status":"Inactive"};
                       // Userschool.updateAll({schoolId: element.school_id}, updateParam, function(err, updateresult){
                        Userschool.destroyAll({schoolId: element.school_id}, function(err, updateresult){
                            if (err) { return cb(null, err);}

                            // if( dbBoardData.includes(element.staff_code)){
                            //     var statusParam = {"status":"Active"};
                            //     Userschool.updateAll({ userId: result.userId, schoolId: element.school_id }, statusParam, function (err, res) {
                            //         if (err) { return cb(null, err);}
                            //         successMessage.status = 200;
                            //         successMessage.message = "Submitted Successfully.";
                            //     });
                            // }else{
                            //     Userschool.upsert(params, function (err, res) {
                            //         if (err) { return cb(null, err);}
                            //         successMessage.status = 200;
                            //         successMessage.message = "Submitted Successfully.";
                            //     });
                            // }
                            Userschool.upsert(params, function (err, res) {
                                         if (err) { return cb(null, err);}
                                     successMessage.status = 200;
                                        successMessage.message = "Submitted Successfully.";
                                     });
                        });
                    }
                });
            });

        }else if(req.source == 'staff'){
            var staffArrData = req.staff_detail;

            let today = req.date;
            var tempObj = {
                type : "staff",
                staff_code: staffArrData.emp_code,
                name : staffArrData.emp_name,
                date : today,
                email : staffArrData.official_email,
                gender : staffArrData.emp_gender,
                dob : staffArrData.emp_dob,
                date_of_join : staffArrData.emp_doj,
                mobile : staffArrData.emp_mobile_no,
                emp_status : staffArrData.emp_status,
                department_name : staffArrData.dep_name,
                designation_name : staffArrData.deg_name,
                school_id : tempCenterArray[0].school_id,
                user_type : req.user_type,
                role : req.role
            }

            staffObj.getstafbystaffcode(staffArrData.emp_code, function(err, result){
                if(err){ return cb(null, err); }
                if(result == null){
                    registrationObj.userregistration(tempObj, function(err, success){
                        if(err){ return cb(null, err);}
                        tempCenterArray.forEach(element => {
                            var searchReq = {"user_id": success.user_id, "school_id":element.school_id};
                            Userschool.getuserschool(searchReq, function(err, responseData){
                                if(err){ return cb(null, err);}
                                if(responseData == null){
                                    var params = {
                                        "userId" : success.user_id,
                                        "schoolId" :  element.school_id,
                                        "user_type" : req.user_type,
                                        "created_date" : element.date,
                                        "status" : "Active"
                                    };
                                    Userschool.upsert(params, function (err, res) {
                                        if (err) { return cb(null, err);}
                                        successMessage.status = 200;
                                        successMessage.message = "Submitted Successfully.";
                                    });
                                }
                            });
                        });
                    });
                }else{
                    tempCenterArray.forEach(element => {
                        var params = {
                            "userId" : result.userId,
                            "schoolId" :  element.school_id,
                            "user_type" : req.user_type,
                            "created_date" : element.date,
                            "status" : "Active"
                        };
                        var updateUser = {
                            "user_type" : req.user_type,
                            "role_name" : req.role,
                        };
                        
                        var updateParam = {"status":"Inactive"};
                        //Userschool.updateAll({userId: result.userId}, updateParam, function(err, resultData){
                            Userschool.destroyAll({userId: result.userId},function(err, resultData){
                            if (err) { return cb(null, err);}
                            // if( dbBoardData.includes(element.school_id)){
                            //     var statusParam = {"status":"Active", user_type: req.user_type};
                            //     Userschool.upsertWithWhere({ userId: result.userId, schoolId: element.school_id }, statusParam, function (err, res) {
                            //         if (err) { return cb(null, err);}
                            //         userObj.updateAll({id: result.userId}, updateUser, function(err, userUpdateArr){
                            //             successMessage.status = 200;
                            //             successMessage.message = "Submitted Successfully.";
                            //         });
                            //     });
                            // }else{  
                            //     Userschool.upsert(params, function (err, res) {
                            //         if (err) { return cb(null, err);}
                            //         userObj.updateAll({id: result.userId}, updateUser, function(err, userUpdateArr){
                            //             successMessage.status = 200;
                            //             successMessage.message = "Submitted Successfully.";
                            //         });
                            //     });
                            // }
                                   Userschool.upsert(params, function (err, res) {
                                     if (err) { return cb(null, err);}
                                     userObj.updateAll({id: result.userId}, updateUser, function(err, userUpdateArr){
                                         successMessage.status = 200;
                                         successMessage.message = "Submitted Successfully.";
                                     });
                                 });
                             
                        });

                    });
                }
            });
        }
        successMessage.message = "Staff assigned successfully";
        return cb(null, successMessage);
    }

    Userschool.remoteMethod(
        'assignusercenter',
        {
            http: {path: '/assignusercenter', verb: 'post'},
            description: 'Assign user school',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );


    /*
    * Get All Active data by user id
    */
    Userschool.getalldatabyuserid = function(req , cb){
        Userschool.find({
        where: {"userId": req.staff_code}
        }, function (err, res) {
            if(err){
                cb(null,err);
            }
            cb(null,res)
        });
    }

    Userschool.remoteMethod(
        'getalldatabyuserid',
        {
            http: {path: '/getalldatabyuserid', verb: 'post'},
            description: 'Get All Active data by user id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    /*
    * Get All user by school Id
    */
    Userschool.getalluserbyschoolid = function(req , cb){
        
        Userschool.find({
        where: {"schoolId": req.school_id, "user_type" : req.user_type, "status":req.status},
        include:[
            {
                relation: 'assigned_users',
                scope: {
                    include: {
                        relation: 'user_belongs_to_staff',
                        scope: {
                            //fields: ['staff_code', 'name']
                        }
                    }
                }
            }
        ]
        }, function (err, res) {
            if(err){
                cb(null,err);
            }
            var data = [];
            
            if(res.length > 0){
                res.forEach(function (value, index) {
                    
                    value = value.toJSON();
                     
                    if(value.assigned_users.user_belongs_to_staff){
                        var staffData = value.assigned_users.user_belongs_to_staff;
                        
                        var obj = {
                            "user_id": staffData.userId,
                            "staff_code": staffData.staff_code,
                            "status": value.status,
                            "name": staffData.name,
                            "designation": staffData.designation,
                            "department": staffData.department,
                            "dob": staffData.dob,
                            "gender": staffData.gender,
                            "mobile": staffData.mobile
                        };
                        data.push(obj);
                    }
                    
                });
            }
            var resp = {
                'data' : data
            }
           
            cb(null,resp)
        });
    }

    Userschool.remoteMethod(
        'getalluserbyschoolid',
        {
            http: {path: '/getalluserbyschoolid', verb: 'post'},
            description: 'Get All user data by school id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    /*
    * Get user school by user id
    */
   Userschool.assignedSchoolListByUserId = function(req , cb){      
    Userschool.find({            
          where: {"userId": req.userId},
          include: [            
            {
              relation: "assigned_schools",
              scope: {
                fields: ["school_name"]
              }
            }
          ]
        }, function (err, res) {           
            cb(err,res)
        });
    }
    
    Userschool.remoteMethod(
            'assignedSchoolListByUserId',
            {
                http: {path: '/assignedSchoolListByUserId', verb: 'post'},
                description: 'Get user school',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

      /***Get All Staff by School Id** */

      Userschool.getstafflistbyschool = function(schoolId, cb) {
        Userschool.find(
            {
              include: {
                relation: "staff_users_lists",
                scope: {
                  fields: ["name","userId"],
                }
              },
              where: { schoolId: schoolId},
            },
            function(err, result) {
              let finalArr = [];
              result.forEach(function(element) {
                if(element.staff_users_lists()!=null){
                  var  finalObj = {};
                  finalObj.userId = element.staff_users_lists().userId;
                  finalObj.name = element.staff_users_lists().name;
                  finalArr.push(finalObj);
                }
              })
              console.log(finalArr);
              if (err) {
                return cb(null, err);
              }
              return cb(null, finalArr);
            }
        );
      };

      Userschool.remoteMethod("getstafflistbyschool", {
        http: { path: "/getstafflistbyschool", verb: "get" },
        description: "Get Staff by school Id",
        accepts: [
          { arg: "schoolId", type: "number", required: true }
        ],
        returns: { arg: "response", type: "array" }
      });


      /*
    * Get All Student user by school Id
    */
    Userschool.getallstudentuserbyschoolid = function(req , cb){
      Userschool.find({
      where: {"schoolId": req.school_id, "user_type":"Student"},
      include:[
          {
              relation: 'assigned_users',
              scope: {
                  include: {
                      relation: 'students',
                      scope: {
                          //fields: ['staff_code', 'name']
                      }
                  }
              }
          }
      ]
      }, function (err, res) {
          if(err){
              cb(null,err);
          }
          var data = [];

          if(res.length > 0){
              res.forEach(function (value, index) {
                  value = value.toJSON();
                  var studentData = value.assigned_users.students;
                  var obj = {
                      "user_id": studentData.userId,
                      "status": studentData.status,
                      "name": studentData.name,
                      "dob": studentData.dob,
                      "gender": studentData.gender,
                      "mobile": studentData.guardian_contact
                  };
                  data.push(obj);
              });
          }
          var resp = {
              'data' : data
          }
          cb(null,resp)
      });
  }

  Userschool.remoteMethod(
      'getallstudentuserbyschoolid',
      {
          http: {path: '/getallstudentuserbyschoolid', verb: 'post'},
          description: 'Get All student data by school id',
          accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
          returns: {arg: 'response', type: 'json'}
      }
  );

};
