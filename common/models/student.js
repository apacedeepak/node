'use strict';

var dateFormat = require('dateformat');
var async = require("async");

module.exports = function (Student) {
    Student.addstudent = function (data, cb) {
        Student.upsert(data, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });

    };


    Student.studentlist = function (req,cb) {
        var school_id;
        var session;
        if(req.school_id){
            school_id=req.school_id
        }
        else{

            school_id=undefined
        }
        if(req.session_id){
            session=req.session_id
        }
        else{

            session=undefined
        }
        Student.find({
            where:{schoolId:school_id,status:{"neq":"Unpaid"}},
            order: ["id DESC"],
            include: [{
                relation: "students",
                scope: {
                    fields: ["id"],
                    include: [{
                        relation: "user_have_sections",
                        scope: {
                            fields: ["section_name", "id","course_mode_id","class_name","boardId"],
                            include:[{
                                relation:"coursemode"
                            },{
                                relation:"board"
                            }
                        ]
                        }
                    },{relation:"receipt"},{relation:"defaulter", 
                        scope:{
                            where:{sessionId:session,status:"Active"}
                        }
                    }
                ]
                }
            }]

        },function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });

    };

    Student.removestudents = function (cb) {
        Student.destroyAll(function (err, result) {
            return cb(result);  
        })
    };

    Student.getstudentbyuserid = (data, cb) => {
        var detail = {};

        Student.findOne({
            where: {userId: data.user_id},
            include:{
                relation: 'students',
                scope:{
                    include:{
                        relation: 'user_have_section',
                        scope:{
                            where: {status: 'Active'}
                        }
                    }
                }
            }
        }, (err, studDetail) => {
            if (err) {
                cb(null, err);
            } else {
                if (studDetail == null || studDetail == '') {
                    detail.parent = '';
                    return cb(null, detail);
                }

                let parentModel = Student.app.models.parent;
                let param = {
                    id: studDetail.parentId
                };

                detail.student = studDetail;
                parentModel.getparentbyid(param, (err, getParent) => {
                    detail.parent = getParent;
                    cb(null, detail);
                });
            }
        });
    }

    Student.getstudentbyparentid = (data, cb) => {
        var detail = {};
        Student.find({
            where: {parentId: data.parent_id},
            include: {
                relation: "students",
                scope: {
                    include: [{
                        relation: "user_have_sections",
                    },{
                        relation: "user_have_section",
                    }]
                }
            }
        }, (err, studDetail) => {
            if (err) {
                cb(null, err);
            } else {
                //detail.student = studDetail;
                cb(null, studDetail);
            }
        });
    }


    Student.updatestudentrecord = function (data, cb) {
        let param = {};
        if (data.flag == 'mobile') {
            param.mobile = data.updateData;
        } else if (data.flag == 'email') {
            param.email = data.updateData;
        }
        Student.upsertWithWhere({userId: data.user_id}, param, function (err, data) {
            cb(null, data);
        });

    }
    Student.remoteMethod(
            'updatestudentrecord',
            {
                http: {path: '/updatestudentrecord', verb: 'post'},
                description: 'update student record',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.getstudentdetailbyadmno = function (data, cb) {
        let detail = {};
        if(data.status){
            var status = data.status;
        }else{
            var status = undefined;
        }

        if(data.school_id){
           var school_id=data.school_id;
        }
        else{

           var school_id=undefined;
        }

        Student.find({
            fields: ["id", "userId", "name","admission_no","parentId","student_photo","dateofadmission"],
            where: {admission_no: data.admission_no,status:status,schoolId:school_id},
            include: [{
                relation: "students",
                scope: {
                    fields: ["id"],
                    include: {
                        relation: "user_have_sections",
                        scope: {
                            fields: ["section_name", "id","session_id"],
                            where: {sessionId: data.session_id}
                        }
                    }
                }
            },{
                relation: "studentbelongtoparent",
                scope:{
                    fields: ["id","father_name","userId"]
                }
            }]
        }, (err, studDetail) => {
            if (err) {
                cb(null, err);
            } else {
                cb(null, studDetail);
            }
        });
    }
    Student.remoteMethod(
            'getstudentdetailbyadmno',
            {
                http: {path: '/getstudentdetailbyadmno', verb: 'post'},
                description: 'Get Student Detail By Admission No.',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Student.getstudentdetailbyadmnovialike = function (data, cb) {
        let detail = {};
        Student.find({
            fields: ["id", "userId", "name", "admission_no"],
            where: {admission_no: {like: '%' + data.q + '%'}},
            include: {
                relation: "students",
                scope: {
                    fields: ["id"],
                    include: {
                        relation: "user_have_sections",
                        scope: {
                            fields: ["section_name", "id"],
                            where: {sessionId: data.session_id}
                        }
                    }
                }
            }
        }, (err, studDetail) => {
            if (err) {
                cb(null, err);
            } else {
                cb(null, studDetail);
            }
        });
    }
    Student.remoteMethod(
            'getstudentdetailbyadmnovialike',
            {
                http: {path: '/getstudentdetailbyadmnovialike', verb: 'post'},
                description: 'Get Student Detail By Admission No. via like',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Student.remoteMethod(
            'addstudent',
            {
                http: {path: '/addstudent', verb: 'post'},
                description: 'add Student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.remoteMethod(
            'getstudentbyparentid',
            {
                http: {path: '/getstudentbyparentid', verb: 'post'},
                description: 'Get Student Detail',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    Student.remoteMethod(
            'studentlist',
            {
                http: {path: '/studentlist', verb: 'post'},
                description: 'Get Student List',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.remoteMethod(
            'removestudents',
            {
                http: {path: '/removestudents', verb: 'post'},
                description: 'Remove students',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.remoteMethod(
            'getstudentbyuserid',
            {
                http: {path: '/getstudentbyuserid', verb: 'post'},
                description: 'add Student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Student.updatestudent = function (data, cb) {
        // console.log(data);
        var msg = {};
        let userModel = Student.app.models.user;
        let parentModel = Student.app.models.parent;
        userModel.getuserbyoldid(data.student_user_id, function (err, userData) {
            if (userData) {
                var userId = userData.id;
              
                var studentObj = {
                    name: data.student_name,
                    gender: data.gender,
                    dob: data.dob,
                    student_photo: data.student_photo,
                    student_uidai: data.student_uidai,
                    board_registration_no: data.board_registration_no,
                    registration_no: data.registration_no,
                    emergency_number:data.emergency_number,
                    guardian_name: data.guardian_name,
		            guardian_photo: data.guardian_photo,
                    guardian_address: data.guardian_address,
                    guardian_contact: data.guardian_contact,
                    sibling: data.sibling,
                    guardian_relation: data.guardian_relation,
                    dateofadmission: data.dateofadmission,
                    address: data.address,
                    house: data.house_name,
                    nationality: data.nationality,
                    religion: data.religion,
                    category: data.category,
                    admission_no: data.admission_no,
                    student_email: data.studentemail,
                    //student_phone: data.phone
                }
                Student.updateAll({userId: userId}, studentObj, function (err, res) {
                    if (err)
                        throw(err);
                    userModel.getuserbyoldid(data.parent_user_id, function (err, parentData) {
                        if(parentData)
                            var parentUserId = parentData.id;

                        var parentObj = {
                            father_name: data.father_name,
                            father_contact: data.father_contact,
                            mother_contact: data.mother_contact,
                            father_photo: data.father_photo,
                            mother_photo: data.mother_photo,
                            mother_name: data.mother_name,
                            father_email: data.father_email,
                            mother_email: data.mother_email,
                            father_occupation: data.father_occupation,
                            mother_occupation: data.mother_occupation,
                        }
                        parentModel.updateAll({userId: parentUserId}, parentObj, function (err, res) {
                            if (err)
                                throw(err);
                            parentModel.findOne(
                                    {
                                        where: {userId: parentUserId},
                                    }
                            , function (err, res) {
                                if (err)
                                    throw(err)
                                  
                                if(res != null && res != undefined){
                                    if(res.id != null && res.id != undefined)  {  
                                        var parentId = res.id;
                                        Student.updateAll({userId: userId}, {parentId: parentId}, function (err, res) {
                                            if (err)
                                                throw(err);
                                        })
                                    }
                                }
                            })
                            msg.status = "200";
                            msg.message = "updated";
                            cb(null, msg);
                        })


                    });
                })

            }
        });

    }
    Student.remoteMethod(
            'updatestudent',
            {
                http: {path: '/updatestudent', verb: 'post'},
                description: 'update student record',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    
    Student.updatestudentrecord = function (data, cb) {
      let param = {};
       if(data.flag == 'mobile'){
          param.student_phone = data.updateData;
       }else if(data.flag == 'email'){
          param.student_email = data.updateData;
       }
        Student.upsertWithWhere({userId : data.user_id} , param, function(err, res){
            cb(null, res);
        });

    }
      Student.remoteMethod(
            'updatestudentrecord',
            {
                http: {path: '/updatestudentrecord', verb: 'post'},
                description: 'update parent record',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    
    Student.updateparent = (data, cb)=>{
        let msg = {};
        let where = {
            userId: data.user_id
        }, dataobj = {
            'sibling': data.sibling,
            'parentId': data.parent_id
        };

        if(data.flag != undefined && data.flag == 'multiple'){
            where = {userId: { inq: data.user_id}}; 
        }
        else if(data.update_sibling_status != undefined){
            where = {parentId: data.parent_id}; 
            dataobj = { sibling: data.sibling };
        }
      
        Student.updateAll(where, dataobj, (err, res)=>{
          
            if(err){
                msg.status = '201';
                msg.message = 'Error occurred';
                cb(null, msg);
            }
            if(res){
                msg.status = '200';
                msg.message = 'Updated successfully';
                cb(null, msg);
            }
        });
    }
    Student.remoteMethod(
            'updateparent',
            {
                http: {path: '/updateparent', verb: 'post'},
                description: 'Update parent details in student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.studentid = (data, cb)=>{
        let msg = {};
        Student.findOne({
            where: {userId: data.user_id},
        },
        (err, res)=>{
            if(err){
                msg.status = "201";
                msg.message = "Error occurred";
                cb(null, msg, err);
                return;
            }
            else if(res){
                msg.status = "201";
                msg.message = "Information fetched successfully." 
                cb(null, msg, {"student_id": res.id} );
            }
        });
    }
    Student.remoteMethod(
            'studentid',
            {
                http: {path: '/studentid', verb: 'post'},
                description: 'Get student id by new user id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_type', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Student.parentid = function (data, cb) {
        let detail = {};
        let whereobj = {};
        if(data.admission_no != undefined){
            whereobj = {
                admission_no: data.admission_no
             };
        }else if(data.user_id != undefined){
            whereobj = {
                userId: data.user_id
             };
        }

        Student.find({
            fields: ["parentId", "userId"],
            where: whereobj
        }, (err, res) => {
            if (err) {
                cb(null, err);
            } else {
                cb(null, res);
            }
        });
    }
    Student.remoteMethod(
            'parentid',
            {
                http: {path: '/parentid', verb: 'post'},
                description: 'Get parent id by admission no.',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    
    
    Student.updatestudentparentinfo = function(data, cb){
        var successMessage = {};
        var errorMessage = {};
        var errors = {};
       
        let parentModel = Student.app.models.parent;
        let classObj = Student.app.models.class;
        let sectionObj = Student.app.models.section;
        let userSectionObj = Student.app.models.user_sections;
        let userSubjectObj = Student.app.models.user_subject;
        var subjectObj = Student.app.models.subject;
        var classsubjectObj = Student.app.models.class_subject;
        var sessionObj = Student.app.models.session;
        
        var userId              = data.user_id;
        var schoolId            = data.school_id;
        var className           = data.class_name;
        var sectionName         = data.section_name;
        var name                = data.name;
        var gender              = data.gender;
        var dob                 = data.dob;
        var photo               = data.photo;
        var admissionDate       = data.admission_date;
        var studentMobile       = data.student_mobile;
        var studentUidai        = data.student_uidai;
        var fatherName          = data.father_name;
        var motherName          = data.mother_name;
        var fatherContact       = data.father_contact;
        var motherContact       = data.mother_contact;
        
        var today = new Date();
        var currentDate = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
        
        var sessionId = "";
        var sessionDataId = "";
        var arr = {};
        var arr1 = {};
        if (userId!="") {
            Student.beginTransaction('READ COMMITTED', function(err, tx) {
//            if(className){
//                async.waterfall([
//                    function (callback) { console.log("first");
//                        sessionObj.getactiveschoolsession( schoolId, function (err, sessionData) {
//                            sessionId = sessionData.id;
//                            arr.sessionId = sessionId;
//                            return callback(null, arr);
//                        })
//                    } ,
//                    function (callback) { console.log("second");
//                        sessionObj.getactiveschoolsession( schoolId, function (err, sessionArr) {
//                            sessionDataId = sessionArr.id;
//                            arr1.sessionIds = sessionDataId;
//                            return callback(null, arr1);
//                        })
//                    }
//                ], function (err, result) {
//                    console.log(err);
//                    console.log(result);
//                });
//            }
//            return false;
            /*if(className){
                sessionObj.getactiveschoolsession( schoolId, function (err, sessionData) {
                    if(err){ 
                        return cb(null, err);
                    }else{
                        var sessionId = sessionData.id;
                        classObj.findOne({
                            where: {"schoolId": schoolId, "class_name": className},
                        }, function (err, result) {
                            if (err) {
                                return  cb(null, err);
                            }else{
                                var classId = result.id;
                                if(classId){
                                    sectionObj.findOne({
                                        where : {"schoolId":schoolId, "classId":classId},
                                    }, function (err, sectionArr) {
                                        if(sectionArr){
                                            var sectionId = sectionArr.id;
                                            if(sectionId){
                                                userSectionObj.findOne({
                                                    where : {"userId":userId, "sectionId":sectionId, "sessionId":sessionId,"status":"Active"},
                                                },function (err, userSec){  
                                                    if(userSec == null){ 
                                                        var updateArr = {"status":"Inactive"};
                                                        var insertArr = {"userId":userId, "user_type": "Student", "sectionId":sectionId, "sessionId":sessionId,"schoolId":schoolId, "class_teacher":"No", "roll_no":0,"status":"Active","boardId":"", "emscc_class_id":""};
                                                        userSectionObj.upsertWithWhere({"userId":userId, "schoolId":schoolId, "status":"Active", "sessionId":sessionId}, updateArr,function(err,response){ 
                                                            if(err) return err;
                                                            userSectionObj.create(insertArr,function(err,response){ 
                                                                var updateSubArr = {"status":"Inactive"};
                                                                var insertSubArr = {"userId":userId, "subjectId":"", "class_subjectId":"", "user_type": "Student", "sectionId":sectionId, "sessionId":sessionId,"schoolId":schoolId, "status":"Active","created_date":currentDate};
                                                                userSubjectObj.upsertWithWhere({"userId":userId, "schoolId":schoolId, "status":"Active", "sessionId":sessionId}, updateSubArr,function(err,response){ 
                                                                    subjectObj.getschoolsubjects(schoolId, function (err, subjectData) {
                                                                        if(err){ 
                                                                            return cb(null, err);
                                                                        }else{
                                                                            subjectData.forEach(function(subject){
                                                                                var subjectId = subject.id;
                                                                                var classParam = {
                                                                                    "section_id" : sectionId,
                                                                                    "subject_id" : subjectId,
                                                                                    "school_id"  : schoolId,
                                                                                    "session_id" : sessionId
                                                                                };
                                                                                classsubjectObj.getclasssubjectid(classParam, function (err, subjectClass) {
                                                                                    var classSubjectId = subjectClass.id;
                                                                                    var userSubjectArr = {
                                                                                        "userId" : userId,
                                                                                        "subjectId" : subjectId,
                                                                                        "class_subjectId" : classSubjectId,
                                                                                        "user_type" : "student",
                                                                                        "sessionId" : sessionId,
                                                                                        "sectionId" : sectionId,
                                                                                        "schoolId" : schoolId,
                                                                                        "status" : "Active",
                                                                                        "created_date" : currentDate
                                                                                    };

                                                                                    userSubjectObj.assignsubject(userSubjectArr, function(err, result){});
                                                                                });
                                                                            });
                                                                            cb(null, "Updated Successfully.");
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    }else{
                                                        console.log("no");
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }

                        });
                    }
                });
            } */
            
            var options = {transaction: tx};
            try {
                var studentObj = {
                    name: name,
                    gender: gender,
                    dob: dob,
                    student_photo: photo,
                    dateofadmission: admissionDate,
                    student_phone: studentMobile,
                    student_uidai: studentUidai
                }
                
                Student.upsertWithWhere({userId: userId}, studentObj, options, function (err, result) {
                    if(err){
                        errors.responseMessage = "Error Occured on Student Updation";
                        errors.responseCode = "201";
                        Student.customerror(errors, tx, cb);
                    }else{
                        var parentId = result.parentId;
                        var parentObj = {
                            father_name: fatherName,
                            mother_name: motherName,
                            father_contact: fatherContact,
                            mother_contact: motherContact
                        }
                        parentModel.upsertWithWhere({id: parentId}, parentObj, options, function (err, res) {
                            if(err){
                                errors.responseMessage = "Error Occured on Parent Updation";
                                errors.responseCode = "201";
                                Student.customerror(errors, tx, cb);
                            }else{
                                successMessage.responseCode = "200";
                                successMessage.responseMessage = "Updated Successfully";
                                tx.commit(function(err){});
                                cb(null,successMessage,'200','Updated Successfully');
                            }
                        });
                    } 
                });
                
            }catch (error) {
                tx.rollback(function(err){});
                cb(null, error);
            }
            
            });
        }else{
            errors.responseMessage = "Error Occured UserId Blank";
            errors.responseCode = "201";
            cb(null,errors,'201','Error Occured UserId Blank');
        }
    }
    
    
    Student.remoteMethod(
        'updatestudentparentinfo',
        {
            http: {path: '/updatestudentparentinfo', verb: 'post'},
            description : 'Update Student Parent Record',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'},{arg: 'responseCode', type: 'json'},{arg: 'responseMessage', type: 'json'}]
        }
    );
    
    Student.customerror = function(error, tx, cb){
        tx.rollback(function(err){});
        cb(null, error);
    };


    Student.checkstudent = function (data, cb) {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.parent_id) return cb(null, {status: "201", message: "Parent Id cannot be blank"})

        Student.find({
            fields: ["userId", "admission_no"],
            where: {parentId: data.parent_id, sibling: "Yes"}
        }, (err, res) => {
            if (err)
                cb(null, err);
            else
                cb(null, res);
            
        });
    }
    Student.remoteMethod(
            'checkstudent',
            {
                http: {path: '/checkstudent', verb: 'post'},
                description: 'Check student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.updateparentother = (data, cb)=>{
        let msg = {};
        let where = {
            userId: { inq: data.user_id}
        }, dataobj = {
            'sibling': data.sibling
        };

        Student.updateAll(where, dataobj, (err, res)=>{
          
            if(err){
                msg.status = '201';
                msg.message = 'Error occurred';
                cb(null, msg);
            }
            if(res){
                msg.status = '200';
                msg.message = 'Updated successfully';
                cb(null, msg);
            }
        });
    }
    Student.remoteMethod(
            'updateparentother',
            {
                http: {path: '/updateparentother', verb: 'post'},
                description: 'Update parent details in student other',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.parentbyuserid = function (data, cb) {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.student_user_id) return cb(null, {status: "201", message: "Student user id cannot be blank"})

        Student.find({
            fields: ["parentId"],
            where: {userId: data.student_user_id}
        }, (err, res) => {
            if (err)
                cb(null, err);
            else
                cb(null, res);
            
        });
    }
    Student.remoteMethod(
            'parentbyuserid',
            {
                http: {path: '/parentbyuserid', verb: 'post'},
                description: 'parent by user id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.studentbyparentid = function (data, cb) {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.parent_id) return cb(null, {status: "201", message: "Parent Id cannot be blank"})

        Student.find({
            fields: ["userId", "admission_no"],
            where: {parentId: data.parent_id}
        }, (err, res) => {
            if (err)
                cb(null, err);
            else
                cb(null, res);
            
        });
    }
    Student.remoteMethod(
            'studentbyparentid',
            {
                http: {path: '/studentbyparentid', verb: 'post'},
                description: 'student by parent id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Student.studentbyuserid = function (data, cb) {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.user_id) return cb(null, {status: "201", message: "User Id cannot be blank"})

        Student.find({
            fields: ["parentId"],
            where: {userId: data.user_id}
        }, (err, res) => {
            if (err)
                cb(null, err);
            else
                cb(null, res);
            
        });
    }
    Student.remoteMethod(
            'studentbyuserid',
            {
                http: {path: '/studentbyuserid', verb: 'post'},
                description: 'student by user id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    
    Student.studentparentsdetail = (data,cb)=>{
        Student.find({
            where: {userId: {inq:data.userArr}},
            include:{
                relation:'studentbelongtoparent'
            }
        },(err,details)=>{
            return cb(null,details);
        });
    }


    Student.studentprofile = (data, cb) => {
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

        Student.findOne({
            where: {schoolId: data.school_id, userId: data.user_id, status: "Active"},
            order: ["id DESC"]
        }, (err, res) => {
            if(err){
                console.log("The error occured ", err);
                return;
            }
            if(res){
                console.log(res)
                msg.status_code = "200";
                msg.message = "Information fetched successfully";
                return cb(null, msg, res);
            }
        })
    }

    Student.remoteMethod(
        'studentprofile',
        {
            http: {path: '/studentprofile', verb: 'post'},
            description: 'Student profile by student id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );
    
    Student.updatestudentdata = function (data, cb) {
        var userId = data.user_id;
        delete data["user_id"];
        Student.upsertWithWhere({userId: userId}, data,  function (err, result) {
            cb(null, result);
        });
    };
    
    Student.remoteMethod(
        'updatestudentdata',
        {
            http: {path: '/updatestudentdata', verb: 'post'},
            description: 'Update student data',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    /*
     * EMSCC student center/batch transfer
     */
    Student.emscccentertransfer = function (data, cb) {
        var successResponse = {};
        var errorResponse = {};
        
        var today = new Date()
        var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
                                        
        var userSchoolObj   = Student.app.models.user_school;
        var sessionObj      = Student.app.models.session;
        var userObj         = Student.app.models.user;
        var parentObj=Student.app.models.parent;
        
        var detail = data.student_details;
        console.log(detail)
        for(var i in detail){
            if(!detail[i].tle_user_id){
                errorResponse.responseMessage = "Enter valid tle user id";
                errorResponse.responseCode = "201";
                return cb(null, errorResponse, '201', "Enter valid tle user id");
            }
            if(!detail[i].center_id){
                errorResponse.responseMessage = "Enter center id";
                errorResponse.responseCode = "201";
                return cb(null, errorResponse, '201', "Enter center id");
            }
            if(!detail[i].class_section_name){
                errorResponse.responseMessage = "Enter class section name";
                errorResponse.responseCode = "201";
                return cb(null, errorResponse, '201', "Enter class section name");
            }
        }
        
//        var userId              = data.tle_user_id;
//        var schoolId            = data.center_id;
//        var classSectionNname   = data.class_section_name;
//         
//        if(Object.keys(data).length < 3){
//            errorResponse.responseCode = "201";
//            errorResponse.responseMessage = "Enter required parameters";
//            return cb(null, errorResponse);
//        }
//        if(userId == ""){
//            errorResponse.responseCode = "201";
//            errorResponse.responseMessage = "Enter valid tle user id.";
//            return cb(null, errorResponse);
//        }
//        if(schoolId == ""){
//            errorResponse.responseCode = "201";
//            errorResponse.responseMessage = "Enter center id";
//            return cb(null, errorResponse);
//        }
//        if(classSectionNname == ""){
//            errorResponse.responseCode = "201";
//            errorResponse.responseMessage = "Enter class section name";
//            return cb(null, errorResponse);
//        }
        
        detail.forEach(function(centerUser){
            var userId              = centerUser.tle_user_id;
            var schoolId            = centerUser.center_id;
            var classSectionNname   = centerUser.class_section_name;
            var admissionNo         = centerUser.admission_no;
        
//            var userSectionObj  = Student.app.models.user_sections;
//            userSectionObj.find({
//                where: {userId: userId}
//            }, function(err, result){
//                console.log(result);
//            });
//        return false;
            var param = { "user_id" : userId,"school_id" : schoolId } 

            sessionObj.getactiveschoolsession(schoolId, (err, sessionArr) => {
                if(sessionArr != null){
                    var sessionId = sessionArr.id;
                    userSchoolObj.getuserschool(param, (err, getSchool) => {
                        if(getSchool){
                            //=================================== Batch Transfer ========================================
                            Student.batchTransfer(centerUser, sessionId, function(err, result){
                                var responseCode = result.responseCode;
                                var responseMessage = result.responseMessage;
                                cb(null, result, responseCode, responseMessage);
                            });
                        }else{
                            //=================================== Center Transfer =======================================
                            var updateArr = {"status": "Inactive"};
                            userSchoolObj.updateAll({userId: userId, status:"Active"}, updateArr,  function (err, result) {
                                if(err){
                                    return cb(null, err);
                                }else{
                                    var createSchool = {"userId":userId, "schoolId":schoolId, "user_type":"Student", "created_date":currentDatess, "status":"Active"};
                                    var updateschool_id = {"userId":userId, "schoolId":schoolId};
                                    Student.updateschoolid(updateschool_id,function(checkerr,respon){

                                    })
                                    userSchoolObj.create(createSchool, function(err, result){

                                        if(err){
                                            return cb(null, err);
                                        }else{
                                            userObj.getuserbyid(userId, (err, parentData) => {
                                                if(parentData){
                                                    var parentUserId = parentData.students().studentbelongtoparent().userId;
                                                    var updateschool_id_parent = {"userId":parentUserId, "schoolId":schoolId};
                                                    parentObj.updateschoolid(updateschool_id_parent,function(checkerrs,responsee){})
                                                    userSchoolObj.updateAll({userId: parentUserId, status:"Active"}, updateArr,  function (err, result) {
                                                        if(err){
                                                            return cb(null, err);
                                                        }else{
                                                            var createSchool = {"userId":parentUserId, "schoolId":schoolId, "user_type":"Parent", "created_date":currentDatess, "status":"Active"};
                                                            userSchoolObj.create(createSchool, function(err, result){
                                                                if(admissionNo){
                                                                    var updateAdmissionNo = {"admission_no": admissionNo};
                                                                    Student.updateAll( {userId: userId}, updateAdmissionNo, function (err, res) {
                                                                        if(err){
                                                                            return cb(null, err);
                                                                        }else{
                                                                            Student.batchTransfer(centerUser, sessionId, function(err, result){
                                                                                var responseCode = result.responseCode;
                                                                                var responseMessage = result.responseMessage;
                                                                                cb(null, result, responseCode, responseMessage);
                                                                            });
                                                                        }
                                                                    });
                                                                }else{
                                                                    errorResponse.responseCode = "201";
                                                                    errorResponse.responseMessage = "Please Enter valid admission no.";
                                                                    return cb(null, errorResponse, '201', "Please Enter valid admission no.");
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        }
                    });
                }else{
                    errorResponse.responseCode = "201";
                    errorResponse.responseMessage = "Enter valid center id";
                    return cb(null, errorResponse, '201', "Enter valid center id");
                }
            });
        });
        
    };
    
    Student.remoteMethod(
        'emscccentertransfer',
        {
            http: {path: '/emscccentertransfer', verb: 'post'},
            description: 'Update student data',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'}, {arg: 'responseCode', type: 'json'}, {arg: 'responseMessage', type: 'json'}]
        }
    );
    
    
    Student.batchTransfer = function (stdObj, sessionId, cb){
         
        var successResponse = {};
        var errorResponse = {};
        
        var today = new Date()
        var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
                                        
        var userSchoolObj   = Student.app.models.user_school;
        var sectionObj      = Student.app.models.section;
        var userSectionObj  = Student.app.models.user_sections;
        var sessionObj      = Student.app.models.session;
        var subjectObj      = Student.app.models.subject;
        var userSubjectObj  = Student.app.models.user_subject;
        var classSubjectObj = Student.app.models.class_subject;
        var userObj         = Student.app.models.user;
        
        var userId              = stdObj.tle_user_id;
        var schoolId            = stdObj.center_id;
        var classSectionNname   = stdObj.class_section_name;
        var boardId             = stdObj.board_id;
        var emsccClassId        = stdObj.class_id;
        
        sectionObj.getsectionbynameschool({"section_name" : classSectionNname, "school_id" : schoolId}, (err, sectionArr) => {
            if(sectionArr){
                var sectionId = sectionArr.id;
                var sectionRequest = {"user_id":userId, "section_id": sectionId, "session_id":sessionId, "school_id":schoolId};
                userSectionObj.getsectionbyuserid(sectionRequest, (err, userSectionArr) => {
                 
                    if(userSectionArr.length <= 0){ 
             
                        //var updateArr = {"status": "Inactive"};
                        //userSectionObj.updateAll({userId: userId}, updateArr,  function (err, result) {
                            userSectionObj.destroyAll({userId: userId},function(err, result){
                            if(err){
                                errorResponse.responseCode = "201";
                                errorResponse.responseMessage = "Error Occured!";
                                return cb(null, errorResponse, '201', "Error Occured!");
                            }else{
                                var createSectionObj = {"userId":userId, "user_type":"Student", "sectionId":sectionId, "sessionId":sessionId, "schoolId":schoolId, "class_teacher":"No", "roll_no":"", "status":"Active", "boardId":boardId, "emscc_class_id":emsccClassId};
                                userSectionObj.create(createSectionObj, function(err, result){
                                    if(err){
                                        cb(null, err);
                                    }else{
                                        var assignedSubjectObj = {"user_id":userId, "school_id":schoolId, "session_id":sessionId, "section_id":sectionId};
                                        userSubjectObj.getassignedusersubject(assignedSubjectObj, (err, assignedSubjectArr) => {
                                            if(assignedSubjectArr.length <= 0){
                                                var updateArr = {"status": "Inactive"};
                                                userSubjectObj.updateAll({userId: userId}, updateArr,  function (err, result) {
                                                    if(err){
                                                        errorResponse.responseCode = "201";
                                                        errorResponse.responseMessage = "Error Occured!";
                                                        return cb(null, errorResponse, '201', "Error Occured!");
                                                    }else{
                                                        subjectObj.getschoolsubjects(undefined, function (err, subjectData) {
                                                            if(err){ 
                                                                return cb(null, err);
                                                            }else{
                                                                if(subjectData.length > 0){
                                                                    subjectData.forEach(function(subject){
                                                                        var subjectId = subject.id;
                                                                        var classParam = {
                                                                            "section_id" : sectionId,
                                                                            "subject_id" : subjectId,
                                                                            "school_id"  : schoolId,
                                                                            "session_id" : sessionId
                                                                        };
                                                                       
                                                                        
                                                                        classSubjectObj.getclasssubjectid(classParam, function (err, subjectClass) {
                                                                            if(subjectClass){
                                                                            var classSubjectId = subjectClass.id;
                                                                            var userSubjectArr = {
                                                                                "userId" : userId,
                                                                                "subjectId" : subjectId,
                                                                                "class_subjectId" : classSubjectId,
                                                                                "user_type" : "student",
                                                                                "sessionId" : sessionId,
                                                                                "sectionId" : sectionId,
                                                                                "schoolId" : schoolId,
                                                                                "status" : "Active",
                                                                                "created_date" : currentDatess
                                                                            };

                                                                            userSubjectObj.create(userSubjectArr, function(err, result){
                                                                                if(err){
                                                                                    return cb(null, err);
                                                                                }
                                                                            });
                                                                        }
                                                                        });
                                                                    });
                                                                    successResponse.responseCode = "200";
                                                                    successResponse.responseMessage = "Transfer Center/Branch Successfully";
                                                                    return cb(null, successResponse, '200', "Transfer Center/Branch Successfully");
                                                                }else{
                                                                    errorResponse.responseCode = "201";
                                                                    errorResponse.responseMessage = "Please create master subject for this school";
                                                                    return cb(null, errorResponse, '201', "Please create master subject for this school");
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }else{
                        errorResponse.responseCode = "202";
                        errorResponse.responseMessage = "No batch transfer";
                        return cb(null, errorResponse, '202', "No batch transfer");
                    }
                });
            }else{
                errorResponse.responseCode = "201";
                errorResponse.responseMessage = "Class section name not exist for this center";
                return cb(null, errorResponse, '201', "Class section name not exist for this center");
            }
        });
        
    }
    
    Student.updateschoolid = function (req, cb) {
        var msg = {};
     
    
    var obj={
   
    "schoolId":req.schoolId
    }
    
    Student.upsertWithWhere({userId: req.userId}, obj, function (err, data) {
            if (err)
            {
                throw(err);
            }
            msg.status = "200";
            msg.message = "data added successfully";
            cb(null, msg, data);
    
    });
    }
    Student.remoteMethod(
            'updateschoolid',
            {
                http: {path: '/updateschoolid', verb: 'post'},
                description: 'updateschoolid',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );



    /*
    get Student List ....
    */

   Student.studentsearchlist = function(req,cb){
    
    var msg = {};
    var filtered = {};
    var classsectionconditions = {};
    var  conditions = {};

    if(!req.admission_number){
    req.admission_number = undefined;
    }
    
    if(!req.student_name){
        req.student_name = undefined;
    }else{
        req.student_name = {like: '%' + req.student_name + '%'};
    }

    if(!req.class_id){
        req.class_id = undefined;
    }

    if(!req.section_id){
        req.section_id = undefined;
    }

    if(!req.school_id){
        req.school_id = undefined;
    }

    conditions = {and:[
        {admission_no : req.admission_number},
        {name     : req.student_name},
        //{classId  : req.class_id},
        //{sectionId: req.section_id},
        {schoolId : req.school_id},
        {status:"Active"}
        ]
    };

    classsectionconditions = {and:[
        {classId  : req.class_id},
        {id: req.section_id},
        {status:"Active"}
        ]
    };
    
    classsectionconditions = {};
   // conditions= {};
    
    //console.log(classsectionconditions);
    Student.find(
        
        {
            include: {
                relation: "students",
                
                scope: {
                    where: { status: "Active" },
                    fields: ['id'],
                    include: {
                        relation: "user_have_sections",
                        scope:{
                            fields : ['section_name','classId']
                            //where  : classsectionconditions
                        }
                    }
                    
                }
    
            },    
        where:conditions, order: 'id DESC'},function(error,response){
        if (error) { 
            msg.status = "201";
            msg.messasge = "error occured";
            cb(null, msg);
        }else{
            //console.log(response);
            filtered = response;
            var filtered1;
            var filtered2;
            if(req.class_id){
            filtered1 = response.filter(obj=> obj.students().user_have_sections()[0].classId == req.class_id);
            filtered = filtered1;
            if(req.section_id){
                filtered2 = filtered1.filter(obj=> obj.students().user_have_sections()[0].id == req.section_id);
                filtered = filtered2;
            }
        }

            
            //console.log(filtered);
            msg.status = "200";
            msg.messasge = "Student Listing";
            cb(null, msg,filtered);
        }


    });
}

Student.remoteMethod(
    'studentsearchlist',
    {
        http: { path: '/studentsearchlist', verb: 'post' },
        description: 'studentsearchlist',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);


Student.updatestatus = function (data, cb) {
    var param={
        "status":"Active",
        "admission_no":data.admission_no
    }
    var msg={};
    Student.upsertWithWhere({ userId: data.user_id }, param, function (err, updatedUser) {
            if(err)return err
            if(updatedUser){
                msg.status="200"
                msg.message="Updated"
                cb(null,updatedUser)
            }
        });
    
    };
    Student.remoteMethod(
        'updatestatus',
        {
            http: { path: '/updatestatus', verb: 'post' },
            description: 'updatestatus',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response_status', type: 'json' }
        }
    );

    Student.studentslistbyschool = function(req,cb){
      
        Student.find(
            
            {
                
            where:{schoolId:req.school_id},function(error,response){
            if (error) { 
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }else{
    
                msg.status = "200";
                msg.messasge = "Student Listing";
                cb(null, msg,response);
            }
    
    
        }});
    }
    
    Student.remoteMethod(
        'studentslistbyschool',
        {
            http: { path: '/studentslistbyschool', verb: 'post' },
            description: 'studentslistbyschool',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    
};
