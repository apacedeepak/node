'use strict';
var dateFormat = require('dateformat');
const Dedupe = require('array-dedupe')
var constantval = require('./constant');
var rp = require('request-promise');
var request = require('request');
module.exports = function (User) {
    var errorMessage = {};
    var successMessage = {};
    const md5 = require('md5');
    var mergeJSON = require("merge-json");

    User.createuser = function (data, cb) {
        var Userschool = User.app.models.user_school;
        if (data['flag'] == "No") {

        } else {
            data['password'] = md5(data['password']);
        }
        User.upsert(data, function (err, user) {
            if (err) {
                cb(null, err);
            } else {
                var today = new Date()
                var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
                var userSchoolRequest = { "userId": user.id, "schoolId": data.schoolId, "user_type": user.user_type, "created_date": currentDatess };
                Userschool.upsert(userSchoolRequest, function (err) {
                    if (err) return err;
                    cb(null, user);
                });
            }

        });

    };


    User.getuserbyoldid = function (user_id, cb) {
        User.findOne({
            fields: ["id"],
            where: { old_user_id: user_id }
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };

    User.getuserbyolduserid = function (data, cb) {
        let userids = data.user_id.toString().split(',');

        User.find({
            fields: ["id"],
            where: { old_user_id: { inq: userids } },
            order: 'id DESC',
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });

    };

    User.getuserbyid = function (user_id, cb) {

        User.findById(user_id,
            {
                // fields: ['id', 'user_type','old_user_id', 'user_name'],
                include: [{
                    relation: 'students',
                    scope: {
                        include: {
                            relation: 'studentbelongtoparent'
                        }
                    }
                }, {
                    relation: 'user_belongs_to_staff',
                    scope: {
                        // fields: ['name']
                    }
                }, {
                    relation: 'parents',
                    scope: {
                        //fields: ['name']
                    }
                }, {
                    relation: 'other_user_registration',
                    scope: {
                        //fields: ['name']
                    }
                }],
            }, function (err, stdObj) {

                cb(null, stdObj);
            });


    };

    User.getuserdetailsbyid = function (user_id, cb) {

        User.find(
            {
                where: { id: user_id },
                fields: ['id', 'user_type', 'old_user_id', 'user_name'],
                include: [{
                    relation: 'students',
                    scope: {
                        include: {
                            relation: 'school',
                        },
                    }
                }, {
                    relation: 'user_belongs_to_staff',
                    scope: {
                        include: {
                            relation: 'school',
                        },
                    }
                }, {
                    relation: 'parents',
                    scope: {
                        include: {
                            relation: 'school',
                        },
                    }
                }],
            }, function (err, stdObj) {
                cb(null, stdObj);
            });


    };
    User.getuserdetailsbyoldid = function (user_id, cb) {

        User.find(
            {
                where: { old_user_id: user_id },
                fields: ['id', 'user_type', 'old_user_id', 'user_name'],
                include: [{
                    relation: 'students',
                    scope: {
                        include: {
                            relation: 'school',
                        },
                    }
                }, {
                    relation: 'user_belongs_to_staff',
                    scope: {
                        include: {
                            relation: 'school',
                        },
                    }
                }, {
                    relation: 'parents',
                    scope: {
                        include: {
                            relation: 'school',
                        },
                    }
                }],
            }, function (err, stdObj) {
                cb(null, stdObj);
            });


    };

    User.getuserdatabytype = function (data, cb) {
        const user_type = data.user_type.toLowerCase();
        let relationtype = '';
        if (user_type == 'parent') {
            relationtype = 'parents';
        } else if (user_type == 'student') {
            relationtype = 'students';
        } else if (user_type == 'teacher') {
            relationtype = 'user_belongs_to_staff';
        } else if (user_type == 'other') {
            relationtype = 'other_user_registration';
        }
        User.find(
            {
                //fields:['id'],
                where: { id: data.user_id, user_type: data.user_type },
                include: {
                    relation: relationtype,
                    scope: {
                        //fields:['name'],
                    }
                },
            }, function (err, stdObj) {

                return cb(null, stdObj);
            });

    };

    User.removeusers = function (cb) {
        User.destroyAll(function (err, result) {
            return cb(result);
        })
    };

    User.usersectionsbyid = function (data, cb) {
        var message = {};
        if (data) {
            var id = '';
            if (data.user_id) {
                id = data.user_id;
            }
        }

        User.findOne({
            fields: 'id',
            where: { old_user_id: id }
        }, function (err, res) {

            if (err)
                throw (err);
            var userId = res.id;
            User.findById(userId, {
                fields: ["id", 'user_type'],
                include: {
                    relation: "user_have_sections",
                    scope: {
                        fields: ["section_name", "class_name"],
                    }

                },
                where: { userId: userId }
            }, function (err, res) {

                if (err) {
                    message.status = '201';
                    message.message = "Fail";
                    cb(null, message);
                } else {
                    message.status = '200';
                    message.message = "Success";

                    res = res.toJSON();
                    var classObj = {};
                    var tempArr = {};
                    res.user_have_sections.forEach(function (value, index) {

                        var classArr = {
                            section_id: value.id,
                            section_name: value.section_name
                        }

                        var className = value.class_name;
                        if ([className] in classObj) {
                            tempArr[className] = {
                                [index]: classArr
                            }
                            classObj[className] = mergeJSON.merge(classObj[className], tempArr[className]);
                        } else {
                            classObj[className] = {
                                [index]: classArr
                            }
                        }
                    });
                    message.data = classObj;
                    cb(null, message);
                }
            });
        });

    };

    User.assignedclass = function (data, cb) {
        var message = {};
        if (!data) {
            message.status = "201";
            message.message = "Request cannot be empty";
            return cb(null, message);
        }
        if (!data.session_id) {
            message.status = "201";
            message.message = "Session Id cannot be blank";
            return cb(null, message);
        }
        if (!data.user_id) {
            message.status = "201";
            message.message = "User Id cannot be blank";
            return cb(null, message);
        }
        if (!data.school_id) {
            message.status = "201";
            message.message = "School Id cannot be blank";
            return cb(null, message);
        }

        var userId = data.user_id;
        var sessionId = data.session_id;
        var schoolId = data.school_id;
        User.findById(userId, {
            fields: ["id", 'user_type'],
            include: [{
                relation: "user_have_sections",
                scope: {
                    fields: ["section_name", "class_name", "boardId", "class_order", "classId", "id"],
                    where: { schoolId: schoolId },
                    group: "class_name",
                    order: "class_order ASC"

                }
            },
            {
                relation: "user_have_schools",
                scope: {
                    fields: [],
                    where: { schoolId: schoolId }


                }
            }
            ],
            where: { sessionId: sessionId },

        }, function (err, res) {

            if (err) {
                message.status = '201';
                message.message = "Fail";
                return cb(null, message);
            } else {
                message.status = '200';
                message.message = "Inforamtion Fetched Successfully";

                if (res != null && res != undefined) {
                    res = res.toJSON();
                    var classArr = [];
                    res.user_have_sections.forEach(function (value) {
                        var classObj = {
                            class_id: value.classId,
                            class_name: value.class_name,
                            section_id: value.id,
                            boardId: value.boardId
                        }
                        classArr.push(classObj);
                    });
                    var finalArr = [];
                    finalArr = Dedupe(classArr, ['class_name'])
                    var data = {
                        assigned_classes: finalArr
                    }

                }

                return cb(null, message, data);
            }
        });

    };




    User.assignedsection = function (data, cb) {
        var message = {};

        if (!data) {
            message.status = "201";
            message.message = "Request cannot be empty";
            return cb(null, message);
        }
        if (!data.session_id) {
            message.status = "201";
            message.message = "Session Id cannot be blank";
            return cb(null, message);
        }
        if (!data.user_id) {
            message.status = "201";
            message.message = "User Id cannot be blank";

            return cb(null, message);
        }



        var userId = data.user_id;
        var sessionId = data.session_id;
        var class_id = data.class_id;
        var where_condition = {};
      if (class_id) {
            
            var classess = User.app.models.class;
            classess.findById(class_id,function(errs,respo){
                console.log(errs);
                console.log(respo)
                where_condition.first = { class_name: respo.class_name};
           
        
  
        User.findById(userId, {
            fields: ["id", 'user_type'],
            include: {
                relation: "user_have_sections",
                scope: {
                    fields: ["section_name", "class_name", "class_order", "section", "classId"],
                    where: where_condition.first,

                    group: "class_name",
                    order: "class_order ASC"
                }
            },
            //where: where_condition.second,

        }, function (err, res) {

            if (res == null || res == undefined || res == '') {
                message.status = '200';
                message.message = "No section assigned.";

                return cb(null, message);
            }

            if (err) {
                message.status = '201';
                message.message = "Fail";

                return cb(null, message);
            } else {
                message.status = '200';
                message.message = "Inforamtion Fetched Successfully";
                var promise = [];
                res = res.toJSON();
                var sectionArr = [];
                var resCount = res.length - 1;
                //promise.push(new Promise(function(resolve, reject){
                res.user_have_sections.forEach(function (value, index) {
                    var sectionObj = {
                        section_id: value.id,
                        section_name: value.section,
                        class_name: value.class_name,
                        class_id: value.classId,
                        class_section_name: value.section_name
                    }
                    sectionArr.push(sectionObj);
                    //                    if(resCount == index){
                    //                        resolve(finaldraft)
                    //                      }
                });
                // }));

                //Promise.all(promise).then(function(response){
                var finalArr = [];
                finalArr = Dedupe(sectionArr, ['section_id'])
                var data = {
                    assigned_sections: finalArr
                }
                return cb(null, message, data);
                //});

            }
        })
    })
    }
    };

    User.remoteMethod(
        'createuser',
        {
            http: { path: '/createuser', verb: 'post' },
            description: 'Create user',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.remoteMethod(
        'getuserbyoldid',
        {
            http: { verb: 'get' },
            description: 'Get username of user',
            accepts: [{ arg: 'user_id', type: 'number' }],
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.remoteMethod(
        'getuserbyolduserid',
        {
            http: { path: '/getuserbyolduserid', verb: 'post' },
            description: 'Get username of user',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.remoteMethod(
        'getuserbyid',
        {
            http: { verb: 'get' },
            description: 'Get profile ',
            accepts: [{ arg: 'user_id', type: 'string' }],
            returns: { arg: 'response', type: 'json' }
        }
    );
    User.remoteMethod(
        'getuserdetailsbyid',
        {
            http: { verb: 'get' },
            description: 'Get User Data',
            accepts: [{ arg: 'user_id', type: 'string' }],
            returns: { arg: 'response', type: 'json' }
        }
    );
    User.remoteMethod(
        'getuserdetailsbyoldid',
        {
            http: { verb: 'get' },
            description: 'Get User Data',
            accepts: [{ arg: 'user_id', type: 'string' }],
            returns: { arg: 'response', type: 'json' }
        }
    );



    User.remoteMethod(
        'removeusers',
        {
            http: { path: '/removeusers', verb: 'post' },
            description: 'Remove users',
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.getalluser = function (cb) {

        User.find({
            include: {
                relation: "have_notes",
            },
            where: { placeholder: "Inbox" }
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            return cb(null, result);
        });

    };

    User.userrelationupdate = function (cb) {
        User.find(function (err, result) {
            result.forEach(function (value) {
                User.upsert(value, function (err, data) {

                });
            });
            cb(null, result);
        });
    };

    User.remoteMethod(
        'getalluser',
        {
            http: { path: '/getalluser', verb: 'post' },
            description: 'Remove users',
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.remoteMethod(
        'usersectionsbyid',
        {
            http: { path: '/usersectionsbyid', verb: 'post' },
            description: 'Usersections list by user',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { arg: 'response', type: 'json' }
        }
    );
    User.remoteMethod(
        'assignedclass',
        {
            http: { path: '/assignedclass', verb: 'post' },
            description: 'Get Assigned Classes',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    User.remoteMethod(
        'assignedsection',
        {
            http: { path: '/assignedsection', verb: 'post' },
            description: 'Get Assigned Section',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    User.remoteMethod(
        'getuserdatabytype',
        {
            http: { path: '/getuserdatabytype', verb: 'post' },
            description: 'user type list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.remoteMethod(
        'userrelationupdate',
        {
            http: { path: '/userrelationupdate', verb: 'post' },
            description: 'update user relations',
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.profiles = function (data, cb) {
        const userType = data.type;
        const school_id = data.school_id;
        const session_id = data.session_id;
        const user_id = data.user_id;

        User.findById(user_id,
            {
                //fields:['id'],
                where: { user_type: userType },
                include: [{
                    relation: "user_belongs_to_staff",
                    scope: {
                        fields: ['name'],
                    },
                }, {
                    relation: "students",
                    scope: {
                        fields: ['name'],
                    },
                }, {
                    relation: "user_have_sections",
                    scope: {
                        fields: ["section_name", "section"],
                    },
                }, {
                    relation: "user_belongsto_subjects",
                    scope: {
                        //fields: ["section_name", "section"],
                    },
                }]
            }, function (err, stdObj) {
                
                let result = {};
                if (err) {
                cb(null,err)
                } 

                cb(null, stdObj);
            });
    };

    User.remoteMethod(
        'profiles',
        {
            http: { path: '/profiledetail', verb: 'post' },
            description: 'user profile data',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { arg: 'response', type: 'json' }
        }
    );


    User.userdetail = function (data, cb) {
        var allObj = {};
        var errorMessage = {};
        var successMessage = {};
        var user_type = data.type.toLowerCase();
        var relationtype = '';
        var condition = [];
        var status;
        if (data.status) {
            status = data.status
        }
        else {
            status = "Active"
        }
        if (user_type == 'parent') {
            relationtype = 'parents';
            condition = [{
                relation: relationtype,
                scope: {
                    //fields:['name'],
                }
            }];
        } else if (user_type == 'student') {
            relationtype = 'students';
            condition = [{
                relation: relationtype,
                scope: {
                    include: {
                        relation: "studentbelongtoparent"
                    }
                }
            }, {
                relation: "user_have_section",
                scope: {
                    where: { status: status },
                    include: {
                        relation: "assigned_sections"
                    }
                }

            }, {
                relation: "user_have_sections"
            },
            {
                relation: "user_has_fee_structure",
                scope: {
                    fields: ['fee_structure_id', 'session_id'],
                    where: { status: "Active" }
                }
            }
            ];
        } else {
            relationtype = 'user_belongs_to_staff';
            condition = [{
                relation: relationtype,
                scope: {
                    //fields:['name'],
                }
            },
            {
                relation: "user_have_schools",
                scope: {
                    include: {
                        relation: "has_many_sessions",
                        scope: { where: { status: 'Active' } },
                    }
                }
            },
            {
                relation: "user_have_multiple_section",
                scope: {
                    where: { sessionId: data.session_id },
                    include: {
                        relation: 'assigned_sections'
                    }
                }
            }
            ];
        } 
        User.findOne(
            {
                where: { id: data.user_id },
                include: condition,
            }, function (err, stdObj) {

 
                //  return cb(null,stdObj)
                if (err) return err;
                if (user_type == 'student') {
                    studentProfile(stdObj, cb);

                }  else if (user_type == 'parent') {
                    let promise = new Promise((resolve, reject) => {
                        var parentArr = parentProfile(stdObj);
                        resolve(parentArr);
                    }).then((data) => {
                        successMessage.status = '200';
                        successMessage.message = 'Information Fetched Successfully.';
                        cb(null, successMessage, data);
                    })

                } else  {
                    staffProfile(stdObj, data.user_id, data.session_id, cb);


                }
            });

    };

    User.remoteMethod(
        'userdetail',
        {
            http: { path: '/userdetail', verb: 'post' },
            description: 'user profile data',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

    function staffProfile(stdObj, userId, sessionId, cb) {
        var errorMessage = {};
        var successMessage = {};
        var UserSubject = User.app.models.user_subject;
        var allObj = {};
        let sectionArr = [];
        allObj.teacher_id = stdObj.id;
        allObj.name = stdObj.user_belongs_to_staff().name;
        allObj.profile_image = stdObj.user_belongs_to_staff().profile_image ? constantval.PROJECT_NAME + "/" + stdObj.user_belongs_to_staff().profile_image : '';
        allObj.staff_code = stdObj.user_belongs_to_staff().staff_code;
        allObj.dob = dateFormat(stdObj.user_belongs_to_staff().dob, "yyyy-mm-dd");
        allObj.gender = stdObj.user_belongs_to_staff().gender;
        allObj.department = stdObj.user_belongs_to_staff().department;
        allObj.designation = stdObj.user_belongs_to_staff().designation;
        allObj.date_of_join = dateFormat(stdObj.user_belongs_to_staff().date_of_join, "yyyy-mm-dd");
        allObj.school_id = stdObj.user_belongs_to_staff().schoolId;
        allObj.user_id = stdObj.user_belongs_to_staff().userId;
        allObj.address = stdObj.user_belongs_to_staff().address;
        allObj.category = stdObj.user_belongs_to_staff().category;
        allObj.mobile = stdObj.user_belongs_to_staff().mobile;
        allObj.bank_acc_no = stdObj.user_belongs_to_staff().bank_acc_no;
        allObj.email = stdObj.user_belongs_to_staff().email;
        allObj.blood_group = "";
        allObj.class_teacher = "No";
        allObj.class_teacher_section = "";
        allObj.user_type = stdObj.user_type;
        allObj.sectionlist = [];
        allObj.username = stdObj.user_name;
        //        if(stdObj.user_have_multiple_section().length==0)
        //            {
        //                errorMessage.status = '201';
        //                errorMessage.message = 'No Class section assign to this teacher';
        //                return cb(null,errorMessage);
        //            }
        let multipleSec = stdObj.user_have_multiple_section();

        if (multipleSec.length > 0) {
            for (let i in multipleSec) {
                if (multipleSec[i].status.toLowerCase() == 'active') {
                    sectionArr.push(multipleSec[i].sectionId);
                    if (multipleSec[i].class_teacher == 'Yes') {
                        allObj.class_teacher = multipleSec[i].assigned_sections().section_name;
                        allObj.class_teacher_section = multipleSec[i].assigned_sections().id;
                    }
                }
            }
        }


        UserSubject.find({
            where: { sectionId: { inq: sectionArr }, userId: userId },

            include: [{
                relation: 'subjects'
            }, {
                relation: 'assigned_section'
            }]

        }, (err, subData) => {
            if (err) {
                errorMessage.status = '201';
                errorMessage.message = 'Error';
                return cb(null, errorMessage);
            }
            let sec_id_arr = [];

            for (let i in subData) {
                let index = sec_id_arr.indexOf(subData[i].sectionId);
                if (index == -1) {
                    sec_id_arr.push(subData[i].sectionId);
                    allObj.sectionlist.push({
                        section_id: subData[i].sectionId,
                        section_name: subData[i].assigned_section().section,
                        class_id: subData[i].assigned_section().classId,
                        class_section_name: subData[i].assigned_section().section_name,
                        subjectlist: [{
                            subject_id: subData[i].subjects().id,
                            subject_name: subData[i].subjects().subject_name
                        }]
                    });


                } else {

                    allObj.sectionlist[index].subjectlist.push({
                        subject_id: subData[i].subjects().id,
                        subject_name: subData[i].subjects().subject_name
                    });

                }
            }
            let finalarr = {
                multi_school_detail: stdObj.user_have_schools(),

                staffdetail: allObj
            };

            successMessage.status = '200';
            successMessage.message = 'Information Fetched Successfully.';
            return cb(null, successMessage, finalarr);
        });
    }



    function studentProfile(stdObj, cb) {
        var Usersection = User.app.models.user_sections;
        var allObj = {};
        var parentObj = {};
        var successMessage = {};
        var Parent = User.app.models.parent;

        var studentArr = stdObj;

        var studentDetail = studentArr.students();
        var sectionDetail = studentArr.user_have_section();
        var sectionSection = studentArr.user_have_section().assigned_sections();
        var assignSectionDetail = studentArr.user_have_sections();
        var studentFeeStructure = studentArr.user_has_fee_structure();

        var parentDetail = studentArr.students().studentbelongtoparent();
        allObj.student_id = studentDetail.id;
        allObj.name = studentDetail.name;
        allObj.admission_no = studentDetail.admission_no;
        allObj.dob = dateFormat(studentDetail.dob, "yyyy-mm-dd");
        allObj.doa = dateFormat(studentDetail.dateofadmission, "yyyy-mm-dd");
        allObj.gender = studentDetail.gender;
        allObj.student_photo = studentDetail.student_photo ? constantval.PROJECT_NAME + "/" + studentDetail.student_photo : '';
        allObj.school_id = studentDetail.schoolId;
        allObj.user_id = studentDetail.userId;
        allObj.guardian_name = studentDetail.guardian_name;
        allObj.guardian_address = studentDetail.guardian_address;
        allObj.guardian_contact = studentDetail.guardian_contact;
        allObj.guardian_relation = studentDetail.guardian_relation;
        allObj.guardian_photo = studentDetail.guardian_photo ? constantval.PROJECT_NAME + "/" + studentDetail.guardian_photo : '';
        allObj.guardian_pics = "",
            allObj.user_type = studentArr.user_type;
        allObj.address = studentDetail.address;
        allObj.house = studentDetail.house;
        allObj.bloodGroup = studentDetail.blood_group;
        allObj.hostel = "";
        allObj.transport = "";
        allObj.emergency_number = studentDetail.emergency_number;
        allObj.class_section = sectionSection.section_name;
        allObj.section_id = sectionDetail.sectionId;
        allObj.school_id = sectionDetail.schoolId;
        allObj.roll_no = sectionDetail.roll_no;
        allObj.parentId = studentDetail.parentId;
        allObj.father_name = parentDetail.father_name;
        allObj.father_contact = parentDetail.father_contact;
        allObj.father_name = parentDetail.father_name;
        allObj.mother_name = parentDetail.mother_name;
        allObj.mother_contact = parentDetail.mother_contact;
        allObj.father_photo = parentDetail.father_photo ? constantval.PROJECT_NAME + "/" + parentDetail.father_photo : '';
        allObj.mother_photo = parentDetail.mother_photo ? constantval.PROJECT_NAME + "/" + parentDetail.mother_photo : '';
        allObj.father_email = parentDetail.father_email;
        allObj.mother_email = parentDetail.mother_email;
        allObj.father_occupation = parentDetail.father_occupation;
        allObj.mother_occupation = parentDetail.mother_occupation;
        allObj.mobile = parentDetail.father_contact;
        allObj.emsccId = studentArr.web_user_id;
        allObj.username = studentArr.user_name;
        if (studentFeeStructure) {
            if (studentFeeStructure.fee_structure_id) {
                allObj.fee_structure_id = studentFeeStructure.fee_structure_id;
            }
            if (studentFeeStructure.session_id) {
                allObj.session_id = studentFeeStructure.session_id;

            }
        }

        var param = {
            'section_id': allObj.section_id,
            'school_id': allObj.school_id
        }
        Usersection.getsectionteachers(param, (err, res) => {
            allObj.classTeacher_name = '';
            if (res.length == 0) {
                allObj.classTeacher_name = '';
                successMessage.status = '200';
                successMessage.message = 'Information Fetched Successfully.';
                cb(null, successMessage, allObj);
            } else {
                for (let i in res) {
                    if (res[i].class_teacher == 'Yes') {
                        allObj.classTeacher_name = res[i].name;
                    }
                }
                successMessage.status = '200';
                successMessage.message = 'Information Fetched Successfully.';
                cb(null, successMessage, allObj);
            }
        });



        if (stdObj[0] != undefined) {
            allObj.emsccId = stdObj[0].web_user_id;
        }

        return allObj;
    }
    function parentProfile(stdObj) {
        var Student = User.app.models.student;
        var Usersection = User.app.models.user_sections;
        var allObj = {};
        var parentArr = stdObj;
        var parentDetail = parentArr.parents();
        allObj.id = parentDetail.id;
        allObj.name = parentDetail.father_name;
        allObj.father_contact = parentDetail.father_contact;
        allObj.mother_name = parentDetail.mother_name;
        allObj.mother_contact = parentDetail.mother_contact;
        allObj.father_photo = parentDetail.father_photo ? constantval.PROJECT_NAME + "/" + parentDetail.father_photo : '';
        allObj.mother_photo = parentDetail.mother_photo ? constantval.PROJECT_NAME + "/" + parentDetail.mother_photo : '';
        allObj.school_id = parentDetail.schoolId;
        allObj.user_type = parentArr.user_type;
        allObj.mobile = parentArr.father_contact;
        allObj.emergency_number = parentArr.emergency_number;
        allObj.username = parentArr.user_name;
        allObj.fee = "";


        var studentdetail = {};
        var stuArr = [];
        return new Promise((resolve, reject) => {
            Student.getstudentbyparentid({ "parent_id": allObj.id }, (err, studentData) => {

                studentData.forEach((studentArr) => {

                    let section_name = '';
                    let section_id = '';
                    if (studentArr.students() == null) {
                        //
                    }
                    else {
                        section_name = studentArr.students().user_have_sections()[0].section_name;
                        section_id = studentArr.students().user_have_sections()[0].id;
                    }

                    var parentDetails = stdObj.parents();
                    var studentdetail = {
                        user_id: studentArr.userId,
                        name: studentArr.name,
                        student_id: studentArr.id,
                        dob: dateFormat(studentArr.dob, "yyyy-mm-dd"),
                        address: studentArr.address,
                        profile_image: studentArr.student_photo ? constantval.PROJECT_NAME + "/" + studentArr.student_photo : '',
                        admission_no: studentArr.admission_no,
                        dateofadmission: dateFormat(studentArr.dateofadmission, "yyyy-mm-dd"),
                        student_type: studentArr.student_type,
                        guardian_name: studentArr.guardian_name,
                        guardian_relation: studentArr.guardian_relation,
                        guardian_telephone: studentArr.guardian_telephone,
                        house: studentArr.house,
                        hostel: "",
                        transport: "",
                        section_name: section_name,
                        section_id: section_id,
                        "father_name": parentDetails.father_name,
                        "father_mobile_num": parentDetails.father_contact,
                        "father_email": parentDetails.father_email,
                        "mother_name": parentDetails.mother_name,
                        "mother_mobile_num": parentDetails.mother_contact,
                        "mother_email": parentDetails.mother_email,
                        "mother_photo": parentDetails.mother_photo ? constantval.PROJECT_NAME + "/" + parentDetails.mother_photo : '',
                        "father_photo": parentDetails.father_photo ? constantval.PROJECT_NAME + "/" + parentDetails.father_photo : '',
                        "father_occupation": parentDetails.father_occupation,
                        "mother_occupation": parentDetails.mother_occupation,
                        "roll_no": studentArr.students().user_have_section().roll_no
                    }

                    stuArr.push(studentdetail);

                });

                allObj.child_list = stuArr;
                resolve(allObj);
            });
        });



    }
    /** ping API **/
    User.ping = function (cb) {
        var detail = {};
        detail.live = 1;
        var now = new Date();
        var today = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
        detail.today_date = today;
        cb(null, detail);
    };

    User.getassignedsubjects = function (sectionid, userId, sessionId) {
        return new Promise(function (resolve, reject) {
            var UserSubject = User.app.models.user_subject;
            UserSubject.find(
                {
                    fields: ["userId", "subjectId"],
                    include: {
                        relation: "subjects",
                        scope: {
                            fields: "subject_name"
                        }
                    },
                    where: { userId: userId, sessionId: sessionId, status: "Active", sectionId: sectionid }
                }, function (err, res) {

                    resolve(res);



                });

        });
    }

    User.remoteMethod(
        'profiles/ping',
        {
            http: { verb: 'get' },
            description: 'Ping API',
            returns: [{ arg: 'response', type: 'json' }]
        }
    );




    User.getuserbyusertype = (data, cb) => {
 
        if (data.user_type[0] == 'School' ||data.user_type[1] == 'Non_Teacher'|| data.user_type[1] == 'Management') {
          
            User.find({
                where: { user_type: {inq:data.user_type}, status: 'Active' },
                include: [{
                    relation: 'user_have_assign_schools',
                    scope: { where: { schoolId: data.schoolId } }
                },{relation:"staff"}]
            }, (err, res) => {

                return cb(null, res);
            })
        }
        else {
            User.find({
                where: { user_type: data.user_type, status: 'Active' },
            }, (err, res) => {
                return cb(null, res);
            })
        }
    }

    User.remoteMethod(
        'getuserbyusertype',
        {
            http: { path: '/getuserbyusertype', verb: 'post' },
            description: 'get users by user type',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.getolduserid = (data, cb) => {
        User.find({
            where: { id: { inq: data.user_id } },
        }, (err, res) => {
            return cb(null, res);
        })
    }

    User.remoteMethod(
        'getolduserid',
        {
            http: { path: '/getolduserid', verb: 'post' },
            description: 'get old user id by new user id',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.usernamecheck = (data, cb) => {

        var userTypeObj = User.app.models.user_type;
        var sessionObj = User.app.models.session;
        var userSecObj = User.app.models.user_sections;
        var staffObj = User.app.models.staff;

        var errorMessage = {};
        var successMessage = {};

        var detail = {};
        User.findOne({
            where: { user_name: data.user_name },
            include: [{
                relation: 'user_have_schools'
            }],
        }, (err, res) => {

            if (err) { return err; }
            if (res) {

                successMessage.status = '200';
                successMessage.message = 'Information Fetched Successfully.';

                detail.user_id = res.id;
                detail.id = res.id;
                detail.user_name = res.user_name;
                detail.old_user_id = res.old_user_id;
                detail.user_type = res.user_type;
                detail.user_login_mobileapp = res.user_login_mobileapp;
                detail.user_login_ctp = res.user_login_ctp;
                detail.user_login_erp = res.user_login_erp;
                detail.web_user_id = res.web_user_id;
                detail.website_user_id = res.website_user_id;
                detail.web_session_key = res.web_session_key;
                detail.school_id = res.user_have_schools()[0].id;
                detail.product_type = constantval.product_type;
                detail.board_id = "";
                detail.course_type_id = "";
                detail.online_test = "";

                userTypeObj.getusertype({ "type": res.user_type }, function (err, userTypeArr) {
                    if (err) { return err; }
                    if (userTypeArr) {
                        detail.user_type_id = userTypeArr.id;
                        sessionObj.findOne({
                            where: { "status": "Active", "schoolId": detail.school_id }
                        }, function (err, sessionData) {
                            if (sessionData) {
                                var sessionId = sessionData.id;
                                if (res.user_type == "School") {
                                    return cb(null, successMessage, detail);
                                } else if (res.user_type == "Teacher") {
                                    staffObj.staffdetailsbyuserid({ "user_id": detail.user_id }, function (err, data, resultStaff) {
                                        if (resultStaff) {
                                            detail.online_test = resultStaff.online_test;
                                        }
                                        return cb(null, successMessage, detail);
                                    });
                                } else if (res.user_type == "Student") {
                                    userSecObj.usersectiondetail({ "userId": detail.user_id, "schoolId": detail.school_id, "sessionId": sessionId, "user_type": res.user_type }, function (err, sectionArr) {
                                        if (sectionArr.length > 0) {

                                            if (sectionArr[0].boardId) detail.board_id = sectionArr[0].boardId;
                                            if (sectionArr[0].emscc_class_id) detail.course_type_id = sectionArr[0].emscc_class_id;
                                        }
                                        return cb(null, successMessage, detail);
                                    });
                                } else {
                                    return cb(null, successMessage, detail);
                                }
                            }
                        });

                    }

                });
            } else {

                errorMessage.status = '201';
                errorMessage.message = 'Error Occured!';
                return cb(null, null);
            }
        })
    }

    User.remoteMethod(
        'usernamecheck',
        {
            http: { path: '/usernamecheck', verb: 'post' },
            description: 'get already exist user check',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

    User.changepassword = (data, cb) => {
        var userLogin = User.app.models.user_login;
        var tleConfig = User.app.models.tle_config;

        var errorMessage = {};
        var successMessage = {};

        var userId = data.user_id;
        var userType = data.user_type;

        var newPass = data.password;
        var oldPassword = data.old_password;

        var password = md5(data.password);
        var oldPass = md5(data.old_password);

        if (userId == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = 'Invalid User Id.';
            return cb(null, errorMessage);
        } else if (newPass == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "New password can't be blank.";
            return cb(null, errorMessage);
        } else if (newPass == oldPassword) {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "New password and old password should not same.";
            return cb(null, errorMessage);
        } else {
            if (data.callfrom == 'Admin') {
                if (userType != 'Parent' && userType != 'Student' && userType != 'Teacher') {
                    var updateRequest = { "password": password };
                    User.updateAll({ id: res.id }, updateRequest, function (err) {
                        if (err) {
                            return cb(null, err);
                        } else {
                            var oldupdateRequest = { "password": password };
                            userLogin.updateAll({ user_id: userId }, oldupdateRequest, function (err) {
                                if (err) {
                                    return cb(null, err);
                                } else {
                                    successMessage.responseCode = '200';
                                    successMessage.responseMessage = 'Password has been change successfully';
                                    return cb(null, successMessage);
                                }
                            });
                        }
                    });
                } else {
                    User.findOne({
                        where: { old_user_id: userId },
                    }, function (err, res) {
                        if (err) {
                            errorMessage.responseCode = '201';
                            errorMessage.responseMessage = 'Please enter correct old password';
                            return cb(null, errorMessage);
                        }

                        if (userType == 'Parent' || userType == 'Student' || userType == 'Teacher') {
                            var decriptOldPass = 1;
                            var webUserId = res.web_user_id;

                            var updateRequest = { "password": password };
                            User.updateAll({ id: res.id }, updateRequest, function (err) {
                                if (err) {
                                    return cb(null, err);
                                } else {
                                    var oldupdateRequest = { "password": password };
                                    userLogin.updateAll({ user_id: userId }, oldupdateRequest, function (err) {
                                        if (err) {
                                            return cb(null, err);
                                        } else {
                                            successMessage.responseCode = '200';
                                            successMessage.responseMessage = 'Password has been change successfully';
                                            return cb(null, successMessage);
                                        }
                                    });
                                }
                            });

                        }
                    });
                }
            } else {

                tleConfig.findOne(function (err, result) {
                    if (result != null) {
                        if (result.ldap_status == 1) {
                            User.findById(userId, {
                                where: { id: userId },
                            }, function (err, res) {
                                var LDAP_SALT = result.ldap_salt;
                                var LDAP_KEY = result.ldap_api_key;
                                var LDAP_URL = result.ldap_url;
                                var checksumString = LDAP_SALT + ':' + LDAP_KEY + ":" + res.user_name;
                                var checksum = md5(checksumString);

                                //                                var postjson = {
                                //                                    "change_details":{
                                //                                        "username":res.user_name,
                                //                                        "password":newPass,
                                //                                        "register_type":"schoolerp"
                                //                                    },
                                //                                    "api_details":{
                                //                                        "apikey":LDAP_KEY,
                                //                                        "checksum":checksum
                                //                                    }
                                //                                }

                                var postData = "change_details[username]=" + res.user_name + "&change_details[password]=" + newPass + "&change_details[register_type]=schoolerp&api_details[apikey]=" + LDAP_KEY + "&api_details[checksum]=" + checksum;

                                request.post({
                                    headers: {
                                        'content-type': 'application/x-www-form-urlencoded'
                                    },
                                    url: LDAP_URL + "/user/changeldappassword",
                                    body: postData,
                                    method: 'POST'
                                }, function (error, response, body) {

                                    console.log(body);

                                    let finalRes = JSON.parse(body);

                                    if (finalRes.status == 1) {
                                        User.findById(userId, {
                                            where: { id: userId },
                                        }, function (err, res) {
                                            if (err) {
                                                errorMessage.responseCode = '201';
                                                errorMessage.responseMessage = 'Please enter correct old password';
                                                return cb(null, errorMessage);
                                            }
                                            if (constantval.product_type.toLowerCase() == 'emscc') {
                                                var webUserId = res.website_user_id;
                                            } else {
                                                var webUserId = res.web_user_id;
                                            }
                                            var updateRequest = { "password": password };
                                            User.updateAll({ id: userId }, updateRequest, function (err) {
                                                if (err) {
                                                    return cb(null, err);
                                                } else {
                                                    var oldupdateRequest = { "password": password };
                                                    userLogin.updateAll({ user_id: res.old_user_id }, oldupdateRequest, function (err) {
                                                        if (err) {
                                                            return cb(null, err);
                                                        } else {
                                                            if (constantval.product_type.toLowerCase() == 'emscc') {
                                                                var options = {
                                                                    method: 'post',
                                                                    uri: constantval.LOCAL_URL + '/' + 'admin/schedulertle/sync/sync-password',
                                                                    body: {
                                                                        "emscc_user_id": webUserId,
                                                                        "user_type": userType,
                                                                        "new_password": data.password
                                                                    },
                                                                    json: true
                                                                };
                                                                rp(options)
                                                                    .then(function (response) {
                                                                        successMessage.responseCode = '200';
                                                                        successMessage.responseMessage = 'Password has been change successfully';
                                                                        return cb(null, successMessage);
                                                                    }).catch(function (error) {
                                                                        errorMessage.status = "201";
                                                                        errorMessage.message = "Error Occurred";
                                                                        return cb(null, errorMessage);

                                                                    })

                                                            } else {
                                                                successMessage.responseCode = '200';
                                                                successMessage.responseMessage = 'Password has been change successfully';
                                                                return cb(null, successMessage);
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    } else {
                                        errorMessage.status = "201";
                                        errorMessage.message = "Error Occurred";
                                        return cb(null, errorMessage);
                                    }
                                    if (error) {
                                        console.log('Error while notification')
                                    }
                                });
                            });

                        } else {
                            User.findById(userId, {
                                where: { id: userId },
                            }, function (err, res) {
                                if (err) {
                                    errorMessage.responseCode = '201';
                                    errorMessage.responseMessage = 'Please enter correct old password';
                                    return cb(null, errorMessage);
                                }
                                var oldP = res.password;
                                if (oldP != oldPass) {
                                    errorMessage.responseCode = '201';
                                    errorMessage.responseMessage = 'Please enter correct old password';
                                    return cb(null, errorMessage);
                                } else {
                                    if (userType == 'Parent' || userType == 'Student' || userType == 'Teacher') {
                                        var decriptOldPass = oldPassword;
                                        if (constantval.product_type.toLowerCase() == 'emscc') {
                                            var webUserId = res.website_user_id;
                                        } else {
                                            var webUserId = res.web_user_id;
                                        }

                                        if (oldP != password) {

                                            /* website changes password */
                                            tleConfig.findOne(function (err, result) {
                                                if (result != null) {
                                                    if (result.status > 0) {
                                                        var WEB_API_KEY = constantval.WEB_API_KEY;
                                                        var WEB_API_SALT = constantval.WEB_API_SALT;
                                                        var webChecsum = md5('change_password' + ':' + 'erp' + ':' + webUserId + ':' + decriptOldPass + ':' + newPass + ':' + WEB_API_KEY + ':' + WEB_API_SALT);

                                                        var postjson = {
                                                            "action": "change_password",
                                                            "app_name": "erp",
                                                            "change_pwd_details": {
                                                                "user_id": webUserId,
                                                                "oldpwd": decriptOldPass,
                                                                "newpwd": newPass
                                                            },
                                                            "api_details": {
                                                                "apikey": WEB_API_KEY,
                                                                "checksum": webChecsum
                                                            }
                                                        }
                                                        request.post({
                                                            headers: { 'content-type': 'application/json' },
                                                            url: result.webpath + "v1.3/tabletregistration",
                                                            json: postjson
                                                        }, function (error, response, body) {
                                                            console.log(body);
                                                            if (error) {
                                                                console.log('Error while notification')
                                                            }
                                                        });
                                                    }
                                                }
                                            });



                                            var updateRequest = { "password": password };
                                            User.updateAll({ id: userId }, updateRequest, function (err) {
                                                if (err) {
                                                    return cb(null, err);
                                                } else {
                                                    //successMessage.responseCode = '200';
                                                    //successMessage.responseMessage = 'Password has been change successfully';
                                                    //return cb(null, successMessage);
                                                     //changing
                                                     var MYHR_API_KEY = constantval.MYHR_API_KEY;
                                                    var MYHR_API_SALT = constantval.MYHR_API_SALT;
                                                    var myHrChecsum = md5(res.user_name + ':' + MYHR_API_SALT);
                                                    if (constantval.product_type.toLowerCase() == 'emscc') {
                                                         var options = {
                                                             method: 'post',
                                                             uri: constantval.MYHR_API_URL + '/' + '/apis/password/post',
                                                             body: {
                                                                "api_key": MYHR_API_KEY,
                                                                "checksum": MYHR_API_SALT,
                                                                "username":res.user_name,
                                                                "password":newPass
                                                             },
                                                             json: true
                                                         };
                                                         console.log(res.user_name);
                                                         console.log(options);
                                                         rp(options)
                                                             .then(function (response) {
                                                                 successMessage.responseCode = '200';
                                                                 successMessage.responseMessage = 'Password has been change successfully';
                                                                 return cb(null, successMessage);
                                                             }).catch(function (error) {
                                                                 errorMessage.status = "201";
                                                                 errorMessage.message = "Error Occurred";
                                                                 return cb(null, errorMessage);
 
                                                             })
 
                                                     } else {
                                                         successMessage.responseCode = '200';
                                                         successMessage.responseMessage = 'Password has been change successfully';
                                                         return cb(null, successMessage);
                                                     } 

                                                }
                                            });
                                        } else {
                                            errorMessage.responseCode = '201';
                                            errorMessage.responseMessage = 'Old Password cannot be same as New Password';
                                            return cb(null, errorMessage);
                                        }
                                    } else {
                                        var updateRequest = { "password": password };
                                        User.updateAll({ id: userId }, updateRequest, function (err) {
                                            if (err) {
                                                return cb(null, err);
                                            } else {
                                                var oldupdateRequest = { "password": password };
                                                userLogin.updateAll({ user_id: res.old_user_id }, oldupdateRequest, function (err) {
                                                    if (err) {
                                                        return cb(null, err);
                                                    } else {
                                                        successMessage.responseCode = '200';
                                                        successMessage.responseMessage = 'Password has been change successfully';
                                                        return cb(null, successMessage);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });

            }
        }
    }

    User.remoteMethod(
        'changepassword',
        {
            http: { path: '/changepassword', verb: 'post' },
            description: 'Change user password',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    User.userswhoseroleother = function (data, cb) {
        User.find(
            {
                where: { user_type: data.user_type },
                include: [{
                    relation: 'user_role',
                    scope: {
                        where: { communicate_two_way: 'Y' },
                    }
                }, {
                    relation: "other_user_registration",
                }
                ],
            }, function (err, stdObj) {
                if (err) {
                    successMessage.status = "201";
                    successMessage.message = "Error Occur.";
                    return cb(null, successMessage, err);
                } else {
                    successMessage.status = "200";
                    successMessage.message = "Information Fetched Successfully.";
                    return cb(null, successMessage, stdObj);
                }
            });

    };

    User.remoteMethod(
        'userswhoseroleother',
        {
            http: { path: '/userswhoseroleother', verb: 'post' },
            description: 'Get used data by role',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }]
        }
    );


    User.userdropout = (data, cb) => {

        var studentObj = User.app.models.student;
        var staffObj = User.app.models.staff;
        var parentObj = User.app.models.parent;

        if (data.user_id == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "User id can't blank";
            return cb(null, errorMessage, "201");
        }
        if (data.type == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "Type can't blank";
            return cb(null, errorMessage, "201");
        }

        if (data.remark) {
            var remark = data.remark;
        } else {
            var remark = undefined;
        }



        User.beginTransaction('READ COMMITTED', function (err, tx) {
            try {
                var options = { transaction: tx };
                var updateRequest = { "status": 'Inactive' };
                User.updateAll({ id: data.user_id }, updateRequest, options, function (err) {
                    if (err) throw (err);

                    if (data.type.toLowerCase() == 'student') {
                        var studentRequest = { "status": 'Inactive', "inactive_reason": remark };
                        studentObj.updateAll({ userId: data.user_id }, studentRequest, options, function (err) {
                            if (err) throw (err);

                            studentObj.findOne({
                                where: { userId: data.user_id }
                            }, options, function (err, studentArr) {
                                if (err) throw (err);

                                var parentId = studentArr.parentId;
                                studentObj.find({
                                    where: { parentId: parentId }
                                }, options, function (err, parentStudentArr) {
                                    if (err) throw (err);

                                    if (parentStudentArr.length == 1) {
                                        parentObj.findOne({
                                            where: { id: parentId }
                                        }, options, function (err, parentArr) {
                                            if (err) throw (err);

                                            var pUserId = parentArr.userId;
                                            User.updateAll({ id: pUserId }, updateRequest, options, function (err) {
                                                if (err) throw (err);

                                                tx.commit(function (err) { });
                                                successMessage.responseCode = '200';
                                                successMessage.responseMessage = "Updated Successfully";
                                                cb(null, successMessage, "200");
                                            });
                                        });
                                    } else {
                                        tx.commit(function (err) { });
                                        successMessage.responseCode = '200';
                                        successMessage.responseMessage = "Updated Successfully";
                                        cb(null, successMessage, "200");
                                    }
                                });
                            });
                        });
                    } else if (data.type.toLowerCase() == 'staff') {
                        var staffRequest = { "status": 'Inactive' };
                        staffObj.updateAll({ userId: data.user_id }, staffRequest, options, function (err) {
                            if (err) throw (err);

                            tx.commit(function (err) { });
                            successMessage.responseCode = '200';
                            successMessage.responseMessage = "Updated Successfully";
                            cb(null, successMessage, "200");
                        });
                    }
                });

            } catch (error) {
                tx.rollback(function (err) { });
                errorMessage.responseCode = '201';
                errorMessage.responseMessage = "Error Occured";
                cb(null, errorMessage, "201");
            }
        });


    }

    User.remoteMethod(
        'userdropout',
        {
            http: { path: '/userdropout', verb: 'post' },
            description: 'Update User Info',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'responseCode', type: 'json' }]
        }
    );


    User.getuserinfobyuserid = (data, cb) => {
        if (data.user_id == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "User id can't blank";
            return cb(null, errorMessage);
        }

        if (data.user_type == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "User type can't blank";
            return cb(null, errorMessage);
        }

        if (data.school_id == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "School id can't blank";
            return cb(null, errorMessage);
        }
        const user_type = data.user_type.toLowerCase();
        let relationtype = '';
        let includeRelation = {};
        if (user_type == 'parent') {
            relationtype = 'parents';
            includeRelation = {
                include: {
                    relation: "parentbelongstostudent"
                }
            }
        } else if (user_type == 'student') {
            relationtype = 'students';
        } else if (user_type == 'teacher') {
            relationtype = 'user_belongs_to_staff';
        } else if (user_type == 'other') {
            relationtype = 'other_user_registration';
        }

        User.find(
            {
                //fields:['id'],
                where: { id: data.user_id, user_type: data.user_type },
                include: [{
                    relation: relationtype,
                    scope: includeRelation,
                }],
            }, function (err, stdObj) {
                if (err) {
                    errorMessage.responseCode = '201';
                    errorMessage.responseMessage = "Error Occur";
                    return cb(null, errorMessage, stdObj);
                }

                if (stdObj.length == 0) {
                    errorMessage.responseCode = '200';
                    errorMessage.responseMessage = "No record found";
                    return cb(null, successMessage, stdObj);
                } else {

                    let schoolObj = User.app.models.school;
                    schoolObj.schooldetail({ school_id: data.school_id }, (err, schoolData) => {
                        let schoolCode = schoolData.school_code;
                        if (schoolData.school_acronym) {
                            schoolCode = schoolData.school_acronym;
                        }

                        let dataObj = {};
                        if (user_type == 'teacher') {
                            dataObj = {
                                'name': stdObj[0].user_belongs_to_staff().name,
                                'website_auth': stdObj[0].website_auth,
                                'phone': stdObj[0].user_belongs_to_staff().mobile,
                                'email': stdObj[0].user_belongs_to_staff().email,
                                'admission_no': stdObj[0].user_belongs_to_staff().staff_code,
                                'current_userName': stdObj[0].user_name,
                                'school_code': schoolCode,
                            };
                            successMessage.responseCode = '200';
                            successMessage.responseMessage = "Record fetched";
                            return cb(null, successMessage, dataObj);
                        } else if (user_type == 'student') {
                            //let admisssionNo = stdObj[0].students().admission_no.split("_");
                            dataObj = {
                                'name': stdObj[0].students().name,
                                'website_auth': stdObj[0].website_auth,
                                'phone': stdObj[0].students().student_phone,
                                'email': stdObj[0].students().student_email,
                                'admission_no': stdObj[0].students().admission_no,
                                'current_userName': stdObj[0].user_name,
                                'school_code': schoolCode,
                            };
                            successMessage.responseCode = '200';
                            successMessage.responseMessage = "Record fetched";
                            return cb(null, successMessage, dataObj);
                        } else if (user_type == 'parent') {
                            User.findOne({
                                where: { id: data.student_user_id, user_type: 'Student' },
                                include: {
                                    relation: 'students'
                                }
                            }, (error, studDetail) => {
                                let admisssionNo = studDetail.students().admission_no.split("_");
                                dataObj = {
                                    'name': stdObj[0].parents().father_name,
                                    'website_auth': stdObj[0].website_auth,
                                    'phone': stdObj[0].parents().father_contact,
                                    'email': stdObj[0].parents().father_email,
                                    'admission_no': 'p' + admisssionNo[1],
                                    'current_userName': stdObj[0].user_name,
                                    'school_code': schoolCode,
                                };
                                successMessage.responseCode = '200';
                                successMessage.responseMessage = "Record fetched";
                                return cb(null, successMessage, dataObj);
                            });
                        }

                    })
                }
            });
    };


    User.remoteMethod(
        'getuserinfobyuserid',
        {
            http: { path: '/getuserinfobyuserid', verb: 'post' },
            description: 'get User Info',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }]
        }
    );

    User.updateuserinfo = (data, cb) => {
        var studentObj = User.app.models.student;
        var staffObj = User.app.models.staff;
        var parentObj = User.app.models.parent;

        if (data.user_id == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "User id can't blank";
            return cb(null, errorMessage);
        }
    }

    User.remoteMethod(
        'updateuserinfo',
        {
            http: { path: '/updateuserinfo', verb: 'post' },
            description: 'Update User Info',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }]
        }
    );


    User.updateuserlogininfo = (data, cb) => {

        if (data.user_id == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "User id can't blank";
            return cb(null, errorMessage);
        }
        if (data.user_type == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "User type can't blank";
            return cb(null, errorMessage);
        }
        if (data.status == "") {
            errorMessage.responseCode = '201';
            errorMessage.responseMessage = "Status can't blank";
            return cb(null, errorMessage);
        }

        User.findOne({
            fields: ["id"],
            where: { "user_name": data.user_name },
        }, function (err, stdObj) {
            if (err) {
                errorMessage.responseCode = '202';
                errorMessage.responseMessage = "Error occur.";
                return cb(null, errorMessage, err);
            }
            let emsccEmailNumber = {};
            if (stdObj) {

                if (data.status == 3) {
                    let param = {
                        website_auth: data.status
                    };
                    User.upsertWithWhere({ id: data.user_id }, param, function (err, updatedUser) {
                        if (err) {
                            errorMessage.responseCode = '202';
                            errorMessage.responseMessage = "Error in username update.";
                            return cb(null, errorMessage, err);
                        }
                        errorMessage.responseCode = '202';
                        errorMessage.responseMessage = "Username already exist.";
                        return cb(null, errorMessage, data);
                    });
                } else {
                    errorMessage.responseCode = '202';
                    errorMessage.responseMessage = "Username already exist.";
                    return cb(null, errorMessage, data);
                }

            } else {
                var userName = data.user_name;


                let param = {
                    user_name: userName,
                    website_auth: data.status
                };
                User.upsertWithWhere({ id: data.user_id }, param, function (err, updatedUser) {
                    if (err) {
                        errorMessage.responseCode = '202';
                        errorMessage.responseMessage = "Error in username update.";
                        return cb(null, errorMessage, err);
                    }
                    if (data.user_type.toLowerCase() == 'teacher') {
                        var staffObj = User.app.models.staff;

                        let params = {
                            "flag": '',
                            "updateData": userName,
                            "user_id": data.user_id
                        }
                        if (data.status == 1) {
                            params.flag = 'mobile';
                            emsccEmailNumber.mobile_number = userName;
                        } else if (data.status == 2) {
                            params.flag = 'email';

                        }
                        staffObj.updatestaffrecord(params, (err, update) => {
                            if (err) {
                                errorMessage.responseCode = '202';
                                errorMessage.responseMessage = "Error in staff update.";
                                return cb(null, errorMessage, err);
                            }

                            var options = {
                                method: 'post',
                                uri: constantval.LOCAL_URL + '/' + 'admin/schedulertle/sync/personalization',
                                body: {
                                    user_type: 'teacher',
                                    emscc_user_id: updatedUser.web_user_id,
                                    user_info: emsccEmailNumber
                                },
                                json: true
                            };
                            rp(options)
                                .then(function (response) {
                                    successMessage.responseCode = '200';
                                    successMessage.responseMessage = "Username changed";
                                    return cb(null, successMessage, data);
                                }).catch(function (error) {
                                    errorMessage.status = "201";
                                    errorMessage.message = "Error Occurred";
                                    return cb(null, errorMessage);

                                })

                        });


                    } else if (data.user_type.toLowerCase() == 'parent') {
                        var parentObj = User.app.models.parent;

                        let params = {
                            "flag": '',
                            "updateData": userName,
                            "user_id": data.user_id
                        }
                        if (data.status == 1) {
                            params.flag = 'mobile';
                        } else if (data.status == 2) {
                            params.flag = 'email';
                        }
                        parentObj.updateparentrecord(params, (err, update) => {
                            if (err) {
                                errorMessage.responseCode = '202';
                                errorMessage.responseMessage = "Error in parent update.";
                                return cb(null, errorMessage, err);
                            }
                            successMessage.responseCode = '200';
                            successMessage.responseMessage = "Username changed";
                            return cb(null, successMessage, data);
                        });
                    } else if (data.user_type.toLowerCase() == 'student') {
                        var studentObj = User.app.models.student;

                        let params = {
                            "flag": '',
                            "updateData": userName,
                            "user_id": data.user_id
                        }
                        if (data.status == 1) {
                            params.flag = 'mobile';
                            emsccEmailNumber.mobile_number = userName;
                        } else if (data.status == 2) {
                            params.flag = 'email';
                            emsccEmailNumber.email = userName;
                        }
                        studentObj.updatestudentrecord(params, (err, update) => {
                            if (err) {
                                errorMessage.responseCode = '202';
                                errorMessage.responseMessage = "Error in student update.";
                                return cb(null, errorMessage, err);
                            }
                            var options = {
                                method: 'post',
                                uri: constantval.LOCAL_URL + '/' + 'admin/schedulertle/sync/personalization',
                                body: {
                                    user_type: 'student',
                                    emscc_user_id: updatedUser.web_user_id,
                                    user_info: emsccEmailNumber
                                },
                                json: true
                            };
                            rp(options)
                                .then(function (response) {
                                    successMessage.responseCode = '200';
                                    successMessage.responseMessage = "Username changed";
                                    return cb(null, successMessage, data);
                                }).catch(function (error) {
                                    errorMessage.status = "201";
                                    errorMessage.message = "Error Occurred";
                                    return cb(null, errorMessage);

                                })
                        });
                    }

                });
            }
        });
    }

    User.remoteMethod(
        'updateuserlogininfo',
        {
            http: { path: '/updateuserlogininfo', verb: 'post' },
            description: 'Update User Info',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }]
        }
    );



    User.updateusername = function (data, cb) {
        User.upsert(data, function (err) {
            if (err) return err;
            cb(null, "updated");
        });
    };


    User.remoteMethod(
        'updateusername',
        {
            http: { path: '/updateusername', verb: 'post' },
            description: 'Update User Name',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


    User.personalization = function (data, cb) {
        var errorMessage = {};
        var successMessage = {};

        var studentObj = User.app.models.student;
        var staffObj = User.app.models.staff;
        var parentObj = User.app.models.parent;

        var userType = data.user_type;
        var userId = data.user_id;


        var message = {};
        if (!data) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Request cannot be empty";
            return cb(null, errorMessage, errorMessage.responseCode, errorMessage.responseMessage);
        }
        if (!userType) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Invalid user type.";
            return cb(null, errorMessage, errorMessage.responseCode, errorMessage.responseMessage);
        }
        if (!userId) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Invalid user id";
            return cb(null, errorMessage, errorMessage.responseCode, errorMessage.responseMessage);
        }

        if (userType.toLowerCase() == 'student-parent') {

            var studentRequest = {};
            if (data.student_info) {
                if (data.student_info.email) {
                    studentRequest['student_email'] = data.student_info.email;
                }
                if (data.student_info.mobile) {
                    studentRequest['student_phone'] = data.student_info.mobile;
                }
            }

            var parentRequest = {};
            if (data.parent_info) {
                if (data.parent_info.email) {
                    parentRequest['father_email'] = data.parent_info.email;
                }
                if (data.parent_info.mobile) {
                    parentRequest['father_contact'] = data.parent_info.mobile;
                }
            }

            if (data.student_info && data.parent_info) {
                studentObj.updateAll({ userId: userId }, studentRequest, function (err) {
                    if (err) {
                        return cb(null, err);
                    } else {
                        studentObj.findOne({
                            where: { userId: userId }
                        }, function (err, studentArr) {
                            if (err) { return cb(null, err); }
                            var parentId = studentArr.parentId;
                            parentObj.findById(parentId, function (err, parentDetail) {
                                if (err) { return cb(null, err); }
                                var pUserId = parentDetail.userId;
                                parentObj.updateAll({ userId: pUserId }, parentRequest, function (err) {
                                    if (err) {
                                        return cb(null, err);
                                    } else {
                                        successMessage.responseCode = "200";
                                        successMessage.responseMessage = "Updated Successfully.";
                                        return cb(null, successMessage, successMessage.responseCode, successMessage.responseMessage);
                                    }
                                });

                            });
                        });
                    }
                });
            } else if (data.student_info) {
                studentObj.updateAll({ userId: userId }, studentRequest, function (err) {
                    if (err) {
                        return cb(null, err);
                    } else {
                        successMessage.responseCode = "200";
                        successMessage.responseMessage = "Updated Successfully.";
                        return cb(null, successMessage, successMessage.responseCode, successMessage.responseMessage);
                    }
                });
            } else if (data.parent_info) {
                studentObj.findOne({
                    where: { userId: userId }
                }, function (err, studentArr) {
                    if (err) { return cb(null, err); }
                    var parentId = studentArr.parentId;
                    parentObj.findById(parentId, function (err, parentDetail) {
                        if (err) { return cb(null, err); }
                        var pUserId = parentDetail.userId;
                        parentObj.updateAll({ userId: pUserId }, parentRequest, function (err) {
                            if (err) {
                                return cb(null, err);
                            } else {
                                successMessage.responseCode = "200";
                                successMessage.responseMessage = "Updated Successfully.";
                                return cb(null, successMessage, successMessage.responseCode, successMessage.responseMessage);
                            }
                        });

                    });
                });
            }

        } else if (userType.toLowerCase() == 'staff') {
            var updateRequest = {
                "mobile": mobile
            };
            staffObj.updateAll({ userId: userId }, updateRequest, function (err) {
                if (err) {
                    return cb(null, err);
                } else {
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Updated Successfully.";
                    return cb(null, successMessage, successMessage.responseCode, successMessage.responseMessage);
                }
            });
        }
    };

    User.updateuserstatus = function (data, cb) {
        return new Promise(function (resolve, reject) {
            var errrorMessage = {};
            var successMessage = {};
            User.upsert(data, function (err, response) {
                if (err) {
                    console.log("Error Occurred:-" + err);
                    reject('error');
                }
                else {
                    resolve('success');
                }

            })
        })
    }

    User.remoteMethod(
        'personalization',
        {
            http: { path: '/personalization', verb: 'post' },
            description: 'User Personalization',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response', type: 'json' }, { arg: 'responseCode', type: 'json' }, { arg: 'responseMessage', type: 'json' }]
        }
    );

    User.deleteparent = function (data, cb) {
        User.destroyAll({ old_user_id: data.old_parentuser_id }, (err, result) => {
            if (result)
                return cb(null, "200", "Deleted successfully");
        })
    };

    User.remoteMethod('deleteparent', {
        http: { path: '/deleteparent', verb: 'post' },
        description: 'Delete parent',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'responseMessage', type: 'json' }]
    });

    User.updteparentuser = (data, cb) => {
        if (!data) {
            cb(null, { status: "201", message: "Bad Request" })
            return;
        }
        else if (!data.oldparentUserId) {
            cb(null, { status: "201", message: "Old parent Id cannot blank" })
            return;
        }
        else if (!data.pid) {
            cb(null, { status: "201", message: "Parent primary id cannot be blank" });
            return;
        }

        User.updateAll({ id: data.pid }, { old_user_id: data.oldparentUserId }, (err, res) => {
            if (err) throw err;
            if (res) {
                cb(null, { status: "200", message: "updated successfully" });
                return;
            }
        });

    }

    User.remoteMethod('updteparentuser', {
        http: { path: '/updteparentuser', verb: 'post' },
        description: 'update parent user',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'responseMessage', type: 'json' }]
    });


    User.checkparent = (data, cb) => {
        if (!data) return cb(null, { status: "201", message: "Bad Request" });
        else if (!data.user_name) return cb(null, { status: "201", message: "User name cannot be empty" });

        User.findOne(
            {
                fields: ["id"],
                where: { user_name: data.user_name }
            },
            (err, stdObj) => { return cb(null, "200", stdObj) }
        )

    }

    User.remoteMethod('checkparent', {
        http: { path: '/checkparent', verb: 'post' },
        description: 'Check parent user',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'response', type: 'json' }]
    });


    User.emsccuser = (data, cb) => {
        if (!data) return cb(null, { status: "201", message: "Bad Request" });
        else if (!data.user_id) return cb(null, { status: "201", message: "User Id cannot be blank" });

        User.findOne({
            fields: ["user_login_erp", "web_user_id"],
            where: { "id": data.user_id }
        }, (err, res) => {
            if (err) throw err;
            if (res) {
                cb(null, { status: "200", message: "Information fetched successfully" }, res)
            }
        })
    }

    User.remoteMethod('emsccuser', {
        http: { path: '/emsccuser', verb: 'post' },
        description: 'Emscc user',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'response', type: 'json' }]
    })

    User.getusername = (data, cb) => {
        if (!data) return cb(null, { status: "201", message: "Bad Request" });
        else if (!data.user_id) return cb(null, { status: "201", message: "User Id cannot be blank" });

        User.find({
            fields: "user_name",
            where: { id: { inq: data.user_id } }
        }, (err, res) => {
            if (err) throw err;
            if (res) {
                cb(null, { status: "200", message: "Information fetched successfully" }, res)
            }
        })
    }

    User.remoteMethod('getusername', {
        http: { path: '/getusername', verb: 'post' },
        description: 'Get user names',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'response', type: 'json' }]
    })

    User.getrecordcount = (data, cb) => {
        if (!data) return cb(null, { status: "201", message: "Bad Request" });
        else if (!data.user_name) return cb(null, { status: "201", message: "Username cannot be blank" });

        User.find({
            fields: "id",
            where: { user_name: data.user_name }
        }, (err, res) => {
            if (err) throw err;
            if (res) {
                cb(null, { status: "200", message: "Information fetched successfully" }, res)
            }
        })
    }

    User.remoteMethod('getrecordcount', {
        http: { path: '/getrecordcount', verb: 'post' },
        description: 'Get record count',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'response', type: 'json' }]
    })


    User.usagetracker = (data, cb) => {
        if (!data) return cb(null, { status: "201", message: "Bad Request" });
        else if (!data.user_type) return cb(null, { status: "201", message: "User type cannot be blank" });
        else if (!data.session_id) return cb(null, { status: "201", message: "Session id cannot be blank" });
        else if (!data.school_id) return cb(null, { status: "201", message: "School id cannot be blank" });


        var sectionObj = User.app.models.section;
        var studentSubjectAttObj = User.app.models.student_subject_attendance;
        var studentObj = User.app.models.student;

        var userType = data.user_type;
        var schoolId = data.school_id;
        var sessionId = data.session_id;

        var whereCond = { "school_id": schoolId };
        sectionObj.schoolwisesectionlist(whereCond, function (err, sectionArr) {
            var sectionIdArr = [];
            var sectionNameArr = [];
            var classNameArr = [];
            var classNameUniqueArr = [];
            var classIdArr = [];
            var finalClassArr = [];
            for (var i in sectionArr) {
                sectionIdArr.push(sectionArr[i].id);
                sectionNameArr.push(sectionArr[i].section_name);
                classNameArr.push(sectionArr[i].class_name);
                classIdArr.push(sectionArr[i].classId);
                if (classNameUniqueArr.indexOf(sectionArr[i].class_name) == -1) {
                    classNameUniqueArr.push(sectionArr[i].class_name)
                }

            }

            for (let i in classNameUniqueArr) {
                var count = 0;
                var classCountArr = classNameArr.map((className) => className == classNameUniqueArr[i]);

                for (let j in classCountArr) {
                    if (classCountArr[j]) {
                        count++;
                    }
                }

                finalClassArr.push({
                    [classNameUniqueArr[i]]: count
                })
            }



            var param = { "school_id": schoolId, "session_id": sessionId, "section_id_arr": sectionIdArr, "user_type": userType, "type": "usage" };

            studentSubjectAttObj.getClassWiseStudent(param, function (err, studentArr) {
                var userdetail = studentArr.userStudentRes;

                var viewAllArr = [];
                var studenAssignSecArr = [];
                var totalUserCount = 0;
                var totalMobileActive = 0;
                var totalMobileInactive = 0;
                var totalErpActive = 0;
                var totalErpInactive = 0;
                var totalCtpActive = 0;
                var totalCtpInactive = 0;
                var finalObj = {};

                var erpClassActiveCount = 0
                var erpClassInactiveCount = 0
                var mobileClassActiveCount = 0
                var mobileClassInactiveCount = 0
                var ctpClassActiveCount = 0
                var ctpClassInactiveCount = 0

                var counts = 1;

                for (var i in sectionIdArr) {
                    var viewObj = {};

                    viewObj['classSection'] = sectionNameArr[i];
                    viewObj['class_section_id'] = sectionIdArr[i];
                    viewObj['class_name'] = classNameArr[i];
                    viewObj['user_type'] = userType;
                    var userResArr = userdetail.map((studentData) => studentData.sectionId == sectionIdArr[i]);

                    var mobileActive = 0;
                    var mobileInactive = 0;
                    var erpActive = 0;
                    var erpInactive = 0;
                    var ctpActive = 0;
                    var ctpInactive = 0;
                    var userArr = 0;



                    //var parentDetail = userdetail[i].users().students().studentbelongtoparent().parentidbyuser();
                    var parentResDetail = userdetail.map((studentData) => studentData.sectionId == sectionIdArr[i]);

                    if (userType == "Parent") {
                        for (var k in parentResDetail) {
                            if (userResArr[k]) {
                                if (userdetail[k].users() != null) {
                                    var userDetailArr = userdetail[k].users().students().studentbelongtoparent().parentidbyuser();
                                    if (userDetailArr.user_login_erp == "1") {
                                        erpActive++;
                                    }
                                    if (!userDetailArr.user_login_erp || parseInt(userDetailArr.user_login_erp) == 0) {
                                        erpInactive++;
                                    }
                                    if (userDetailArr.user_login_mobileapp == "1") {
                                        mobileActive++;
                                    }
                                    if (!userDetailArr.user_login_mobileapp || parseInt(userDetailArr.user_login_mobileapp) == 0) {
                                        mobileInactive++;
                                    }
                                    if (userDetailArr.user_login_ctp == "1") {
                                        ctpActive++;
                                    }
                                    if (!userDetailArr.user_login_ctp || parseInt(userDetailArr.user_login_ctp) == 0) {
                                        ctpInactive++;
                                    }
                                    userArr++;
                                }
                            }
                        }
                    } else {
                        for (var j in userResArr) {
                            if (userResArr[j]) {
                                if (userdetail[j].users() != null) {
                                    if (userdetail[j].users().user_login_erp == "1") {
                                        erpActive++;
                                    }
                                    if (!userdetail[j].users().user_login_erp || parseInt(userdetail[j].user_login_erp) == 0) {
                                        erpInactive++;
                                    }
                                    if (userdetail[j].users().user_login_mobileapp == "1") {
                                        mobileActive++;
                                    }
                                    if (!userdetail[j].users().user_login_mobileapp || parseInt(userdetail[j].user_login_mobileapp) == 0) {
                                        mobileInactive++;
                                    }
                                    if (userdetail[j].users().user_login_ctp == "1") {
                                        ctpActive++;
                                    }
                                    if (!userdetail[j].users().user_login_ctp || parseInt(userdetail[j].user_login_ctp) == 0) {
                                        ctpInactive++;
                                    }
                                    userArr++;
                                }
                            }
                        }
                    }


                    viewObj['mobileActive'] = mobileActive;
                    viewObj['mobileInactive'] = mobileInactive;
                    viewObj['erpActive'] = erpActive;
                    viewObj['erpInactive'] = erpInactive;
                    viewObj['ctpActive'] = ctpActive;
                    viewObj['ctpInactive'] = ctpInactive;
                    viewObj['userCount'] = userArr;



                    viewAllArr.push(viewObj);


                    erpClassActiveCount = erpClassActiveCount + erpActive;
                    erpClassInactiveCount = erpClassInactiveCount + erpInactive;
                    mobileClassActiveCount = mobileClassActiveCount + mobileActive;
                    mobileClassInactiveCount = mobileClassInactiveCount + mobileInactive;
                    ctpClassActiveCount = ctpClassActiveCount + ctpActive;
                    ctpClassInactiveCount = ctpClassInactiveCount + ctpInactive;


                    for (let a in finalClassArr) {

                        for (let b in finalClassArr[a]) {

                            if (classNameArr[i] == b) {
                                if (counts == finalClassArr[a][b]) {
                                    viewAllArr.push({
                                        mobileActive: mobileClassActiveCount,
                                        mobileInactive: mobileClassInactiveCount,
                                        erpActive: erpClassActiveCount,
                                        erpInactive: erpClassInactiveCount,
                                        ctpActive: ctpClassActiveCount,
                                        ctpInactive: ctpClassInactiveCount,
                                        userCount: '',
                                        classSection: '',
                                        class_section_id: '',
                                        class_name: b,
                                        user_type: '',
                                    });
                                    counts = 1;

                                    erpClassActiveCount = 0
                                    erpClassInactiveCount = 0
                                    mobileClassActiveCount = 0
                                    mobileClassInactiveCount = 0
                                    ctpClassActiveCount = 0
                                    ctpClassInactiveCount = 0

                                } else {
                                    counts++;
                                }
                            }
                        }
                    }


                    totalErpActive = totalErpActive + erpActive;
                    totalErpInactive = totalErpInactive + erpInactive;

                    totalMobileActive = totalMobileActive + mobileActive;
                    totalMobileInactive = totalMobileInactive + mobileInactive;

                    totalCtpActive = totalCtpActive + ctpActive;
                    totalCtpInactive = totalCtpInactive + ctpInactive;

                    totalUserCount = totalUserCount + userArr;
                }




                finalObj.usagelist = viewAllArr;

                finalObj.totalErpActive = totalErpActive;
                finalObj.totalErpInactive = totalErpInactive;

                finalObj.totalMobileActive = totalMobileActive;
                finalObj.totalMobileInactive = totalMobileInactive;

                finalObj.totalCtpActive = totalCtpActive;
                finalObj.totalCtpInactive = totalCtpInactive;

                finalObj.totalUserCount = totalUserCount;

                return cb(null, null, finalObj);
            });
        });

    }

    User.remoteMethod('usagetracker', {
        http: { path: '/usagetracker', verb: 'post' },
        description: 'Get Usage Tracker',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'response', type: 'json' }]
    })


    User.updateuserdetail = function (param, cb) {
        User.upsertWithWhere({ id: param.user_id }, param.postdata, function (err, updatedUser) {
            if (err) {
                errorMessage.responseCode = '202';
                errorMessage.responseMessage = "Error in username update.";
                return cb(null, errorMessage, err);
            } else {

                var tleConfig = User.app.models.tle_config;
                tleConfig.findOne(function (err, result) {
                    if (result != null) {
                        if (result.ldap_status == 1) {
                            User.findById(param.user_id, {
                                where: { id: param.user_id },
                            }, function (err, res) {
                                var LDAP_SALT = result.ldap_salt;
                                var LDAP_KEY = result.ldap_api_key;
                                var LDAP_URL = result.ldap_url;
                                var checksumString = LDAP_SALT + ':' + LDAP_KEY;
                                var checksum = md5(checksumString);

                                request.post({
                                    headers: { 'content-type': 'application/json' },
                                    url: LDAP_URL + "/user/updateregistrationstatus/" + res.user_name + "/schoolerp/" + checksum
                                }, function (error, response, body) {
                                    console.log(body);
                                    if (error) {
                                        console.log('Error while notification')
                                    }
                                });
                            });
                        }
                    }
                });

                successMessage.responseCode = '200';
                successMessage.responseMessage = "Updated successfully.";
                return cb(null, successMessage, updatedUser);
            }
        });
    };

    User.remoteMethod('updateuserdetail', {
        http: { path: '/updateuserdetail', verb: 'post' },
        description: 'Get Usage Tracker',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'response', type: 'json' }]
    })
    User.getoldidbynewid = function (data, cb) {

        User.findOne({
            where: { id: data.user_id },

        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    User.remoteMethod(
        'getoldidbynewid',
        {
            http: { path: '/getoldidbynewid', verb: 'post' },
            description: 'getoldidbynewid',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );



    /***Get All Staff by School Id ** */

    User.getstaffbyschool = function (schoolId, cb) {

        User.find(
            {
                //  fields: ["userId", "subjectId"],
                include: {
                    relation: "user_belongs_to_staff",
                    scope: {
                        fields: ["name", "userId"],
                    }
                },
                where: { schoolId: schoolId, status: "Active", user_type: "Teacher" },
            },
            function (err, result) {
                // console.log(result);
                /***/
                let finalArr = [];
                result.forEach(function (element) {

                    if (element.user_belongs_to_staff() != null) {
                        var finalObj = {};
                        finalObj.userId = element.user_belongs_to_staff().userId;
                        finalObj.name = element.user_belongs_to_staff().name;
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

    User.remoteMethod("getstaffbyschool", {
        http: { path: "/getstaffbyschool", verb: "get" },
        description: "Get Staff by School Id ",
        accepts: [
            { arg: "schoolId", type: "number", required: true }
        ],
        returns: { arg: "response", type: "array" }
    });

    User.updatestatus = function (data, cb) {
        var param = {
            "status": "Active",
            "user_name": data.user_name
        }
        var msg = {};
        User.upsertWithWhere({ id: data.user_id }, param, function (err, updatedUser) {
            if (err) return err
            if (updatedUser) {
                msg.status = "200"
                msg.message = "Updated"
                cb(null, updatedUser)
            }
        });

    };
    User.remoteMethod(
        'updatestatus',
        {
            http: { path: '/updatestatus', verb: 'post' },
            description: 'updatestatus',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response_status', type: 'json' }
        }
    );

    User.changeuserpassword = (data, cb) => {
        var MYHR_API_KEY = constantval.MYHR_API_KEY;
        var MYHR_API_SALT = constantval.MYHR_API_SALT;
        var myHrChecsum = md5(data.username + ':' + MYHR_API_SALT);
        var param = {
            "password": data.password
        }
        var msg = {};
        if (!data.username) {
            msg.status = "0"
            msg.message = "User name is empty"
            cb(null, msg)
        }else if(MYHR_API_KEY != data.api_key){
            msg.status = "0"
            msg.message = "Salt key not match"
            cb(null, msg)
        }else if(myHrChecsum != data.checksum){
            msg.status = "0"
            msg.message = "Checksum not match"
            cb(null, msg)
        }
        User.upsertWithWhere({ user_name: data.username }, param, function (err, updateresponse) {
            if (err) {
                msg.status = "0"
                msg.message = "Password update fail"
                cb(null, msg)
            }
            if (updateresponse) {
                msg.status = "1"
                msg.message = "Password updated successfully"
                cb(null, msg)
            }
        });
    };
    User.remoteMethod(
        'changeuserpassword',
        {
            http: { path: '/changeuserpassword', verb: 'post' },
            description: 'changeuserpassword',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


    User.getuserdetails = function(userName , cb){
        let myHrObj = User.app.models.myhr;

        User.findOne({
          where: {"user_name": userName, "status":"Active"}
        }, function (err, res) {
            if(err){
                cb(null,err);
            }
            var passwordData = res.password;
            var checkSum = md5(userName + ':' + constantval.MYHR_API_SALT);
            var pchecksum = md5(userName + ':' + passwordData);
 
            let loginUrl = constantval.MYHR_API_URL + '/apis/auth/get/username/' + userName + '/checksum/' + checkSum + '/pchecksum/' + pchecksum;
            let param = {url: loginUrl}; 
            cb(null, loginUrl);
            // myHrObj.myhrlogin(param, function(err,data){
            //     cb(null, loginUrl);
            // });
        });
    }
    
    User.remoteMethod("getuserdetails", {
        http: { path: "/getuserdetails", verb: "get" },
        description: "Get user detail by user name",
        accepts: [
            { arg: "userName", type: "text", required: true }
        ],
        returns: { arg: "response", type: "array" }
    });

};
