'use strict';
var Dedupe = require('array-dedupe');
var arraySort = require('array-sort');
module.exports = function (Staff) {
    var errorMessage = {};
    var successMessage = {};
    Staff.addstaff = function (data, cb) {
        Staff.upsert(data, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });

    };


    Staff.stafflist = function (cb) {
        Staff.find(function (err, result) {
            let res = {}
            if (err) {
                cb(null, err);
            } else {
                res.stafflist = result;
                res.response_status = {
                    "status": "200",
                    "message": "Inforamtion Fetched Successfully."
                };
                cb(null, res);
            }
        });

    };

    Staff.department = function (cb) {
        Staff.find({
            fields: 'department'
        }, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                var uniqueArray = Dedupe(result, ['department']);
                var archivedSort = arraySort(uniqueArray, 'department');
                cb(null, archivedSort);
            }
        });

    };
    Staff.remoteMethod(
            'department',
            {
                http: {path: '/department', verb: 'post'},
                description: 'Staff department',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Staff.designation = function (cb) {
        Staff.find({
            fields: 'designation'
        }, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                var uniqueArray = Dedupe(result, ['designation']);
                var archivedSort = arraySort(uniqueArray, 'designation');
                cb(null, archivedSort);
            }
        });

    };
    Staff.remoteMethod(
            'designation',
            {
                http: {path: '/designation', verb: 'post'},
                description: 'Staff designation',
                returns: {arg: 'response', type: 'json'}
            }
    );


    Staff.staffrelationupdate = function (cb) {
        Staff.find(function (err, result) {
            result.forEach(function (value) {
                Staff.upsert(value, function (err, data) {

                });

            });
            cb(null, result);
        });
    };

    Staff.removestaff = function (cb) {
        Staff.destroyAll(function (err, result) {
            return cb(result);
        })
    };

    Staff.updatestaffrecord = function (data, cb) {
        let param = {};
        if (data.flag == 'mobile') {
            param.mobile = data.updateData;
        } else if (data.flag == 'email') {
            param.email = data.updateData;
        }
        Staff.upsertWithWhere({userId: data.user_id}, param, function (err, data) {
            cb(null, data);
        });

    }
    Staff.remoteMethod(
            'updatestaffrecord',
            {
                http: {path: '/updatestaffrecord', verb: 'post'},
                description: 'update staff record',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Staff.remoteMethod(
            'addstaff',
            {
                http: {path: '/addstaff', verb: 'post'},
                description: 'add Staff',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Staff.stafflistbyschoolid = function (data, cb) {
        var User_School = Staff.app.models.user_school;
        User_School.find({
            where: {userId:{nin: [data.user_id]},schoolId: data.school_id, user_type: "Teacher", status: 'Active'},
            include: {
                relation: "assigned_users",
                scope: {
                    include: {
                        relation: "staff"
                    }
                }
            }
        }, (err, res) => {
            var stafflist = [];
            if (err) {
                errorMessage.status = "201";
                errorMessage.message = "Error Occurred";
                return cb(null, errorMessage, err);
            } else {
                if (res.length == 0) {
                    successMessage.status = "200";
                    successMessage.message = "No record found.";
                    return cb(null, successMessage, res);
                } else {
                    for (let key in res) {
                        stafflist.push({
                            name: res[key].assigned_users().staff().name,
                            userId: res[key].assigned_users().staff().userId
                        });
                    }
                    successMessage.status = "200";
                    successMessage.message = "Record fetched.";
                    return cb(null, successMessage, stafflist);
                }


            }
        });
    };

    Staff.remoteMethod(
            'stafflistbyschoolid',
            {
                http: {path: '/stafflistbyschoolid', verb: 'post'},
                description: 'Staff list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Staff.remoteMethod(
            'stafflist',
            {
                http: {path: '/stafflist', verb: 'post'},
                description: 'Staff list',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Staff.remoteMethod(
            'staffrelationupdate',
            {
                http: {path: '/staffrelationupdate', verb: 'post'},
                description: 'Staff list',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Staff.remoteMethod(
            'removestaff',
            {
                http: {path: '/removestaff', verb: 'post'},
                description: 'Remove staff',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Staff.departmentdesignationlist = function (req, cb) {
        var unique = require('array-unique');
        var msg = {};
        var resp = {};
        Staff.find(
                {fields: "department",
                    where: {schoolId: req.school_id},
                    group: "department",
                    order: ["department ASC"]
                },
                function (err, res) {
                    if (err)
                        throw(err);
                    var departmentArr = [];
                    res.forEach(function (value) {
                        departmentArr.push(value.department);
                    });

                    Staff.find(
                            {fields: "designation",
                                where: {schoolId: req.school_id},
                                group: "designation",
                                order: ["designation ASC"]
                            }, function (err, res) {
                        if (err)
                            throw(err);
                        var designationArr = [];
                        res.forEach(function (value) {

                            designationArr.push(value.designation);
                        });
                        resp.departments = unique(departmentArr);
                        resp.designations = unique(designationArr);
                        msg.status = "200";
                        msg.message = "Data fetched successfully";
                        cb(null, msg, resp);
                    });

                })

    }

    Staff.remoteMethod(
            'departmentdesignationlist',
            {
                http: {path: '/departmentdesignationlist', verb: 'post'},
                description: 'Department/Designation List',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Staff.getstafflist = function (req, cb) {
        var msg = {};
        var resp = {};
        Staff.find({
            where: {and: [{department: req.department}, {designation: req.designation}]},
            include: {
                relation: "assigned_leaves"
            }
        }, function (err, res) {

            if (err)
                throw(err);
            msg.status = "200";
            msg.message = "Data fetched successfully";
            var staffListArr = [];
            res.forEach(function (value) {
                var obj = {
                    staff_code: value.staff_code,
                    id: value.userId,
                    staff_name: value.name,
                }
                staffListArr.push(obj);
            });
            resp.staffList = staffListArr;
            cb(null, msg, resp);
        });
    }

    Staff.remoteMethod(
            'getstafflist',
            {
                http: {path: '/getstafflist', verb: 'post'},
                description: 'Department/Designation List',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );


    Staff.getstafbystaffcode = function (staffCode, cb) {
        Staff.findOne({
            where: {"status": "Active", "staff_code": staffCode}
        }, function (err, res) {
            if (err) {
                cb(null, err);
            }
            cb(null, res)
        });
    }

    Staff.remoteMethod(
            'getstafbystaffcode',
            {
                http: {path: '/getstafbystaffcode', verb: 'get'},
                description: 'Get Staff By Staff Code',
                accepts: {arg: 'staff_code', type: 'string', required: true},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Staff.updatestaff = function (data, cb) {

        var msg = {};

        let userModel = Staff.app.models.user;
        userModel.getuserbyoldid(data.user_id, function (err, userData) {
            if (userData) {
                var userId = userData.id;
                Staff.updateAll({userId: userId}, data, function (err, result) {
                                   if (err) {
                        cb(null, err);
                    } else {
                         let successMessage = {};
                        successMessage.status = "200";
                        successMessage.message = "success";
                        cb(null, successMessage);

                    }

                });
            }
        });

    };
     Staff.inactivestaff = function (data) {
         return new Promise(function (resolve, reject) {
         Staff.upsert(data, function (err, result) {
            if (err) {
                console.log("Error Occurred:-"+err);
                reject('error');
            } else {
                resolve('success');
            }
        });
        });
     }
    Staff.remoteMethod(
            'updatestaff',
            {
                http: {path: '/updatestaff', verb: 'post'},
                description: 'Update Staff',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Staff.updatestaffinfo = function(data, cb){
        var successMessage = {};
        var errors = {};

        var userId = data.user_id;

        if (!userId) {
            cb(null,'201','Error Occured UserId Blank');
        }else{
            Staff.beginTransaction('READ COMMITTED', function(err, tx) {
            var options = {transaction: tx};
            try {
                var staffObj = {
                    name: data.name,
                    gender: data.gender,
                    dob: data.dob,
                    profile_image: data.photo,
                    designation: data.designation,
                    department: data.department,
                    date_of_join: data.date_of_join,
                    address: data.address,
                    mobile: data.mobile,
                    email: data.email,
                    online_test: data.online_test,
                }

                Staff.upsertWithWhere({userId: userId}, staffObj, options, function (err, result) {
                    if(err){
                        errors.responseMessage = "Error Occured";
                        errors.responseCode = "201";
                        Staff.customerror(errors, tx, cb);
                    }else{
                        tx.commit(function(err){});
                        cb(null,'200','Updated Successfully');
                    }
                });

            }catch (error) {
                tx.rollback(function(err){});
                cb(null, error);
            }

            });
        }
    }


    Staff.remoteMethod(
        'updatestaffinfo',
        {
            http: {path: '/updatestaffinfo', verb: 'post'},
            description : 'Update Staff Record',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'responseCode', type: 'json'},{arg: 'responseMessage', type: 'json'}]
        }
    );

    Staff.customerror = function(error, tx, cb){
        tx.rollback(function(err){});
        cb(null, error);
    };

    Staff.staffprofile = (data, cb) => {
        var msg = {};
        if(!data){
            msg.status_code = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        else if(!data.school_id){
            msg.status_code = "201";
            msg.message = "School Id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.user_id){
            msg.status_code = "201";
            msg.message = "User Id cannot be blank";
            return cb(null, msg);
        }

        var user = Staff.app.models.user;

        user.findOne({
            fields: "id",
            where: { id: data.user_id, status: "Active" },
            include: [
                {
                    relation: "user_have_multiple_section",
                    scope: {
                        fields: ["class_teacher", "sectionId"],
                        where: {status: 'Active', schoolId: data.school_id},
                        include:
                        {
                            relation: "assigned_sections",
                            where: {schoolId: data.school_id},
                            scope: {

                            }
                        }
                    }
                },
                {
                    relation: "user_have_subjects",
                    scope: {
                        where: {status: 'Active', schoolId: data.school_id},
                    }
                },
                {
                    relation: "user_belongs_to_staff",
                    scope:
                    {
                        where: {status: 'Active', schoolId: data.school_id},
                        fields: ["name", "profile_image", "category", "designation", "department", "dob", "date_of_join", "nationality", "address", "gender", "staff_code", "email", "bank_acc_no", "mobile"]
                    }
                }
        ]
        }
        , (err, res) => {
            if(err){
                console.log("The error occurred ",err);
                return;
            }
            if(res){
                msg.status_code = "200";
                msg.message = "Information fetched successfully";
                return cb(null, msg, res);
            }
        })
    }

    Staff.remoteMethod(
        'staffprofile',
        {
            http: {path: '/staffprofile', verb: 'post'},
            description : 'Get staff profile information',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'responseMessage', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );
    Staff.getuseridbystaffcode = function (req, cb) {
        var msg = {};

       if(!req.staff_code){
        msg.status = "201";
        msg.message = "Staff code cannot be blank";
        cb(null, msg);
       }
        Staff.findOne(
                {
                    where: {staff_code: req.staff_code},
                    include:{
                   relation:"reporter",
                 scope:  {
                    fields:"role_name"
                   }
                }

                },
                function (err, res) {



                        if (err) {
                            return   cb(null, err);
                        }
                    if(!res){
                        msg.status = "200";
                        msg.message = "wrong staff code";
                        cb(null, msg, res);
                    }
                    else{
                        msg.status = "200";
                        msg.message = "Data fetched successfully";
                        cb(null, msg, res);
                    }
                    });


    }

    Staff.remoteMethod(
            'getuseridbystaffcode',
            {
                http: {path: '/getuseridbystaffcode', verb: 'post'},
                description: 'Get userid by staff code',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Staff.staffdetailsbyuserid = function (req, cb) {
        var msg = {};

       if(!req.user_id){
        msg.status = "201";
        msg.message = "User Id cannot be blank";
        return cb(null, msg);
       }
        Staff.findOne(
                {
                    where: {userId: req.user_id},
                    include:{
                   relation:"reporter",
                 scope:  {
                    fields:"role_name"
                   }
                }

                },
                function (err, res) {



                        if (err) {
                            return   cb(null, err);
                        }

                        msg.status = "200";
                        msg.message = "Data fetched successfully";
                        cb(null, msg, res);

                    });


    }

    Staff.remoteMethod(
            'staffdetailsbyuserid',
            {
                http: {path: '/staffdetailsbyuserid', verb: 'post'},
                description: 'Get details by user id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Staff.assignandcreatestaff = function (req, cb) {
        var registrationObj = Staff.app.models.registration;
        var staffObj = Staff.app.models.staff;
        var userSchoolObj = Staff.app.models.user_school;
        let schoolObj = Staff.app.models.school;
        staffObj.getstafbystaffcode(req.staff_code, function(err, result){
            if(err){ return cb(null, err); }
            if(result == null){
                registrationObj.userregistration(req, function(err, success){
                    if(err){ return cb(null, err); }
                    let schoolUpdateArr = { "id": req.school_id, "contact_person_userId": success.user_id};
                    schoolObj.addschool(schoolUpdateArr, function(err, data){
                        successMessage.status = 200;
                        successMessage.message = "Submitted Successfully.";
                        return cb(null, successMessage);
                    });
                });
            }else{
                var params = {
                    "userId" : result.userId,
                    "schoolId" :  req.school_id,
                    "user_type" : "Teacher",
                    "created_date" : req.date,
                    "status" : "Active"
                };
                userSchoolObj.create(params, function (err, res) {
                    if (err) { return cb(null, err);}
                    let schoolUpdateArr = { "id": req.school_id, "contact_person_userId": result.userId};
                    schoolObj.addschool(schoolUpdateArr, function(err, data){
                        successMessage.status = 200;
                        successMessage.message = "Submitted Successfully.";
                        return cb(null, successMessage);
                    });
                });
            }
        });
    }

    Staff.remoteMethod(
        'assignandcreatestaff',
        {
            http: {path: '/assignandcreatestaff', verb: 'post'},
            description: 'Assign and create staff',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );


    Staff.getstaffcodebyassignschool = function (staffCode, cb) {
        Staff.findOne({
            where: {"status": "Active", "staff_code": staffCode},
            include:
            {
                relation: 'assigned_user',
                scope: {
                    include:{
                        relation: 'user_have_assign_schools'
                    }
                }
            }
        }, function (err, res) {
            if (err) {
                cb(null, err);
            }
            cb(null, res)
        });
    }

    Staff.remoteMethod(
        'getstaffcodebyassignschool',
        {
            http: {path: '/getstaffcodebyassignschool', verb: 'post'},
            description: 'Get Staff By Staff Code',
            accepts: {arg: 'staff_code', type: 'string', required: true},
            returns: {arg: 'response', type: 'json'}
        }
    );


    /***Get All Staff by School Id** */

    Staff.getstaffbyschool = function(schoolId, cb) {
      Staff.find(
          {
            where: { schoolId: schoolId},
          },
          function(err, result) {
            if (err) {
              return cb(null, err);
            }
            return cb(null, result);
          }
      );
    };

    Staff.remoteMethod("getstaffbyschool", {
      http: { path: "/getstaffbyschool", verb: "get" },
      description: "Get Staff by school Id",
      accepts: [
        { arg: "schoolId", type: "number", required: true }
      ],
      returns: { arg: "response", type: "array" }
    });



};
