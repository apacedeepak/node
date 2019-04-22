'use strict';
var md5 = require('md5');
var dateFormat = require('dateformat');
var constantval = require('./constant');
var request = require('request');
module.exports = function (Registration) {
    Registration.userregistration = function (data, cb) {
        var User = Registration.app.models.user;
        var Staff = Registration.app.models.staff;
        var School = Registration.app.models.school;
        var Session = Registration.app.models.session;
        var Parent = Registration.app.models.parent;
        var Student = Registration.app.models.student;
        var UserSection = Registration.app.models.user_sections;
        var Section = Registration.app.models.section;
        var Subject = Section.app.models.subject;
        var Usersubject = Section.app.models.user_subject;
        var Classsubject = Section.app.models.class_subject;
        var Userschool = Registration.app.models.user_school;
        var tleConfig = User.app.models.tle_config;
        var otherRegObj = User.app.models.other_registration;
        
        var successResponse = {};
        var errorResponse = {};
                
        var type           = data.type;
        var fullName       = data.name;
        var email          = data.email;
        var mobile         = data.mobile;
        
        var genders        = data.gender;
        var gender         = genders.charAt(0).toUpperCase() + genders.slice(1)
        var dob            = data.dob;
        var schoolId       = data.school_id;
        

        var fatherName     = data.father_name;
        var motherName     = data.mother_name;
        var fname          = data.fname;
        var mname          = data.mname;
        var lname          = data.lname;
        var classSection   = data.class_section;
        var boardId        = data.board_id;
        var fatherEmail    = data.father_email;
        var source         = data.source;
        var username       = "temp";
        var staffCode      = data.staff_code;
        var cityId         = data.city_id;
        var department_name= data.department_name;
        var designation_name= data.designation_name;
        var doj            = data.date_of_join;
        var userEmsccId    = data.user_id;
        var emsccClassId    = data.class_id;
        
        var dobpassword = dateFormat(dob, "yyyymmdd");
        var passwordEncoded = md5(dobpassword);
        var userloginname = "";
        var status='';
        if(data.status){
            status=data.status
        }
        else{
            status="Active"
        }
        
        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");
        
        if(type == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Type can't be blank.";
            return cb(null, errorResponse);
        }
        if(mobile == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Phone no. can't be blank.";
            return cb(null, errorResponse);
        }
        if(gender == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Gender can't be blank.";
            return cb(null, errorResponse);
        }
        if(dob == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Date of birth can't be blank.";
            return cb(null, errorResponse);
        }
        if(schoolId == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "School Id can't be blank.";
            return cb(null, errorResponse);
        }
        
        if(type.toLowerCase() == 'student'){
            if(fatherName == ""){
                errorResponse.responseCode = "201";
                errorResponse.responseMessage = "Father name can't be blank.";
                return cb(null, errorResponse);
            }
            if(motherName == ""){
                errorResponse.responseCode = "201";
                errorResponse.responseMessage = "Mother name can't be blank.";
                return cb(null, errorResponse);
            }
            
            Session.getactiveschoolsession( schoolId, function (err, sessionData) {
                if(err){ 
                    return cb(null, err);
                }else{
                    var sessionId = sessionData.id;

                    if(username == ""){
                        errorResponse.responseCode = "201";
                        errorResponse.responseMessage = "Username can't be blank.";
                        return cb(null, errorResponse);
                    }
                    // console.log(schoolId)
                    School.schooldetailbyoldschoolid({"school_id":schoolId}, function(err, schoolDetail){
                        if(err){ 
                            return cb(null, err);
                        }else{
                            var postFix = schoolDetail[0].school_code;

                            var employeecode = username +'@'+postFix;
                            var admissionNo = constantval.ADM+employeecode;
                            var admission_no = constantval.ADM+username;
                            var parentUserName = 'p'+employeecode;
               
                              

                                    var parentlogindata = {
                                        "role_name" : "Parent",
                                        "roleId" : 5,
                                        "user_name" : parentUserName,
                                        "old_user_id" : "",
                                        "password" : passwordEncoded,
                                        "user_type" : "Parent",
                                        "status" : status,
                                        "is_excel" : source
                                    };
                                    User.upsert(parentlogindata, function (err, userData) {
                                        var parentUserId = userData.id

                                        var today = new Date()
                                        var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
                                        var parentSchoolRequest = {"userId":parentUserId, "schoolId": schoolId, "user_type": 'Parent', "created_date": currentDatess};
                                        Userschool.upsert( parentSchoolRequest, function (err) {
                                            if(err) return err; 
                                        });

                                        var parentMasterdata = {
                                            "userId" : parentUserId,
                                            "father_name" : fatherName,
                                            "father_contact" : mobile,
                                            "mother_contact" : "",
                                            "father_photo" : "",
                                            "mother_photo" : "",
                                            "schoolId" : schoolId,
                                            "old_parent_id" : "",
                                            "mother_name" : motherName,
                                            "father_email" : fatherEmail,
                                            "mother_email" : "",
                                            "father_occupation" : "",
                                            "mother_occupation" : ""
                                        };
                                        Parent.addparent(parentMasterdata, function(err, parentData){
                                            var parentId = parentData.id;

                                            var studentUserLogindata = {
                                                "role_name" : "Student",
                                                "roleId" : 4,
                                                "user_name" : admissionNo,
                                                "old_user_id" : "",
                                                "password" : passwordEncoded,
                                                "user_type" : "Student",
                                                "status" : status,
                                                "is_excel" : source,
                                                "web_user_id" : userEmsccId
                                            };
                                            User.upsert(studentUserLogindata, function (err, studentUserData) {
                                                var studentUserId = studentUserData.id;

                                                var studentSchoolRequest = {"userId":studentUserId, "schoolId": schoolId, "user_type": 'Student', "created_date": currentDatess};
                                                Userschool.upsert( studentSchoolRequest, function (err) {
                                                    if(err) return err; 
                                                });

                                                var studentTbldata = {
                                                    "userId" : studentUserId,
                                                    "name" : fname+' '+mname+' '+lname,
                                                    "gender" : gender,
                                                    "dob" : dob,
                                                    "student_photo" : "",
                                                    "admission_no" : admission_no,
                                                    "schoolId" : schoolId,
                                                    "status" : status,
                                                    "student_type" : "new",
                                                    "parentId" : parentId,
                                                    "sibling" : "No",
                                                    "dateofadmission" : currentDatess
                                                };
                                                Student.addstudent(studentTbldata, function(err, studentData){
                                                    Section.getsectionbynameboardschool({"section_name":classSection,"board_id":boardId, "school_id":schoolId}, function(err, sectionArr){
                                                        if(sectionArr == null || sectionArr == ""){
                                                            errorResponse.responseCode = "201";
                                                            errorResponse.responseMessage = "Course Type Name and Batch Name Not Found.";
                                                            return cb(null, errorResponse);
                                                        }else{
                                                            var usersectiondata = {
                                                                "userId" : studentUserId,
                                                                "sectionId" : sectionArr.id,
                                                                "sessionId" : sessionId,
                                                                "class_teacher" : "No",
                                                                "roll_no" : "",
                                                                "user_type" : "Student",
                                                                "schoolId" : schoolId,
                                                                "status" : status,
                                                                "boardId" : boardId,
                                                                "emscc_class_id" : emsccClassId
                                                            };
                                                            UserSection.assignsection(usersectiondata,function(err, assignedSection){
                                                                if(err){
                                                                    cb(null, err);
                                                                }else{
                                                                    let classParam = {
                                                                        "section_id" : sectionArr.id,
                                                                        "school_id"  : schoolId,
                                                                        "session_id" : sessionId
                                                                    };
                                                                    Classsubject.getclasssubjectdata(classParam, function(err, subjectClass){
                                                                        if(subjectClass){
                                                                            subjectClass.forEach(function(subject){
                                                                                var classSubjectId = subject.id;
                                                                                var userSubjectArr = {
                                                                                    "userId" : studentUserId,
                                                                                    "subjectId" : subject.subjectId,
                                                                                    "class_subjectId" : classSubjectId,
                                                                                    "user_type" : "Student",
                                                                                    "sessionId" : sessionId,
                                                                                    "sectionId" : sectionArr.id,
                                                                                    "schoolId" : schoolId,
                                                                                    "status" : status,
                                                                                    "created_date" : currentDatess
                                                                                };

                                                                                Usersubject.assignsubject(userSubjectArr, function(err, result){});
                                                                            });

                                                                            /* website entry */
                                                                            
                                                                         

                                                                            successResponse.user_id 	= studentUserId;
                                                                            successResponse.parent_username = parentUserName;
                                                                            successResponse.parent_password = dobpassword;
                                                                            successResponse.student_username= admissionNo;
                                                                            successResponse.student_password= dobpassword;
                                                                            cb(null, successResponse, studentUserId, '200');
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    });
                                
                           
                        }
                    });
                }
            });
        }else if(type.toLowerCase() == 'staff'){
            
            // School.schooldetailbyoldschoolid({"school_id":schoolId}, function(err, schoolDetail){
            //     if(err){ 
            //         return cb(null, err);
            //     }else{
            //         if(schoolDetail.length > 0){
            //         var postFix = schoolDetail[0].school_code;
                    
                    var userloginname = staffCode;
                    if(data.password){
                        passwordEncoded = data.password;
                    }
                    var userInsertArr = {
                        "role_name" : data.role,
                        "roleId" : 13,
                        "user_name" : userloginname,
                        "old_user_id" : "",
                        "password" : passwordEncoded,
                        "user_type" : data.user_type,
                        //"schoolId" : schoolId,
                        "status" : "Active",
                        "is_excel" : source,
                        "web_user_id" : userEmsccId
                    };

                    User.upsert(userInsertArr, function (err, userData) {
                        var userId = userData.id

                        var today = new Date()
                        var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
                        var staffSchoolRequest = {"userId":userId, "schoolId": schoolId, "user_type": data.user_type, "created_date": currentDatess};
                        Userschool.upsert( staffSchoolRequest, function (err) {
                            if(err) return err; 
                        });

                        var staffInsertArr = {
                            "userId"        : userId,
                            "name"          : fullName,
                            "category"      : "Permanent",
                            "designation"   : designation_name,
                            "department"    : department_name,
                            "dob"           : dob,
                            "date_of_join"  : doj,
                            "nationality"   : "",
                            "address"       : "",
                            "gender"        : gender,
                            "status"        : "Active",
                            "schoolId"      : schoolId,
                            "staff_code"    : staffCode,
                            "old_user_id"   : "",
                            "profile_image" : "",
                            "email"         : email,
                            "bank_acc_no"   : "",
                            "mobile"        : mobile
                        };
                        Staff.addstaff(staffInsertArr, function (err, staffArr) {
                            
                            tleConfig.findOne(function (err, result) {
                                if(result != null){
                                    if(result.status > 0){
                                        var WEB_API_KEY = result.web_api_key;
                                        var WEB_API_SALT = result.web_api_salt;
                                        var webChecsum = md5('erp' + ':' + '' + ':' + dobpassword + ':' + fullName + ':' + gender + ':' + 'erp' + ':' + userloginname + ':' + WEB_API_KEY + ':' + WEB_API_SALT);
                                        var postjson = {
                                            "action":"erp",
                                            "login_details":{
                                                "email_address":    '',
                                                "password":         dobpassword,
                                                "mobile_nu":        mobile,
                                                "dob":              dob,
                                                "name":             fullName,
                                                "gender":           gender,
                                                "source":           'erp',
                                                "unique_id":        userloginname,
                                                "user_type_id":     3
                                            },
                                            "api_details":{
                                                "apikey":           WEB_API_KEY,
                                                "checksum":         webChecsum
                                            }
                                        }
                                        request.post({
                                            headers: {'content-type' : 'application/json'},
                                            url:     result.webpath+"v1.1/tabletregistration",
                                            json:    postjson
                                            }, function(error, response, body){
                                                var webUserId = body.content.user_id;
                                                var updateArr = {"website_user_id" : webUserId};
                                                User.updateAll({id: userId}, updateArr, function (err, userData) {
                                                    if(err) return err;
                                                });
                                                //console.log(body);
                                            if(error){
                                                console.log('Error while notification')
                                            }
                                        });
                                    }
                                }
                            });
                            
                            successResponse.user_id = userId;
                            successResponse.staff_username = userloginname;
                            successResponse.staff_password = dobpassword;
                            cb(null, successResponse,userId, '200');
                        });
                    });
            //         }else{
            //             errorResponse.responseCode = "201";
            //             errorResponse.responseMessage = "School Id proper not sync with TLE "+schoolId;
            //             cb(null, errorResponse,null, '201');
            //         }
            //     }
            // });
        }else if(type.toLowerCase() == 'centermanager'){
            School.schooldetailbyoldschoolid({"school_id":schoolId}, function(err, schoolDetail){
                if(err){ 
                    return cb(null, err);
                }else{
                    if(schoolDetail.length > 0){
                        var postFix = schoolDetail[0].school_code;
                        var userloginname = staffCode;

                        var userInsertArr = {
                            "role_name" : "Management Role",
                            "roleId" : 2,
                            "user_name" : userloginname,
                            "old_user_id" : "",
                            "password" : passwordEncoded,
                            "user_type" : "Management",
                            "status" : "Active",
                            "is_excel" : source,
                            "web_user_id" : userEmsccId
                        };

                        User.upsert(userInsertArr, function (err, userData) {
                            var userId = userData.id

                            var today = new Date();
                            var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
                            var managementSchoolRequest = {"userId":userId, "schoolId": schoolId, "user_type": 'Management', "created_date": currentDatess};
                            Userschool.upsert( managementSchoolRequest, function (err) {
                                if(err) return err; 
                            });

                            var managementInsertArr = {
                                "userId"        : userId,
                                "name"          : fullName,
                                "gender"        : gender,
                                "address"       : "",
                                "mobile_number" : mobile,
                                "status"        : "Active",
                                "created_by"    : 1,
                                "created_date"  : currentDatess
                            };
                            otherRegObj.createuser(managementInsertArr, function (err, managementArr) {
                                if(err) return err;
                                
                                successResponse.user_id = userId;
                                successResponse.management_username = userloginname;
                                successResponse.management_password = dobpassword;
                                cb(null, successResponse,userId, '200');
                            });
                        });
                    }else{
                        errorResponse.responseCode = "201";
                        errorResponse.responseMessage = "School Id proper not sync with TLE "+schoolId;
                        cb(null, errorResponse,null, '201');
                    }
                }
            });
        }
    };

    Registration.remoteMethod(
        'userregistration',
        {
            http: {path: '/userregistration', verb: 'post'},
            description: 'User Registration',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'},{arg: 'user_id', type: 'json'},{arg: 'responseCode', type: 'json'}]
        }
    );
    
    
    Registration.applicantregistration = function (data, cb) {
        var User = Registration.app.models.user;
        var Userschool = Registration.app.models.user_school;
        var ApplicantInfo = Registration.app.models.applicant_info;
        var tleConfig = User.app.models.tle_config;
        
        var successResponse = {};
        var errorResponse = {};
        
        var user_id     = data.user_id;
        var class_id    = data.class_id;
        var exam_type   = data.exam_type;
        var user_type   = data.user_type;
        var fname       = data.fname;
        var lname       = data.lname;
        var email       = data.email;
        var mobile      = data.mobile;
        var board_id    = data.board_id;
        var class_name  = data.class_name;
        var source      = data.source;
        var school_id   = data.school_id;
        
        var passwordEncoded = md5(mobile);
        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");
        
        if(user_id == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "user id can't be blank.";
            return cb(null, errorResponse);
        }
        if(fname == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "First name can't be blank.";
            return cb(null, errorResponse);
        }
        if(user_type == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "user type can't be blank.";
            return cb(null, errorResponse);
        }
        if(mobile == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Phone no. can't be blank.";
            return cb(null, errorResponse);
        }
        if(email == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Email id can't be blank.";
            return cb(null, errorResponse);
        }
        if(school_id == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "School Id can't be blank.";
            return cb(null, errorResponse);
        }
        
        if(user_type.toLowerCase() == 'applicant'){
            User.usernamecheck({"user_name":email}, function(err, userDetail){
                if(err)return err;
                if(userDetail){
                    errorResponse.responseCode = "200";
                    errorResponse.responseMessage = "user name already exist.";
                    errorResponse.user_id 	= userDetail.id;
                    errorResponse.username = email;
                    return cb(null, errorResponse, userDetail.id, '201');
                }else{

                    var logindata = {
                        "role_name" : "Applicant Role",
                        "roleId" : 4,
                        "user_name" : email,
                        "old_user_id" : "",
                        "password" : passwordEncoded,
                        "user_type" : 'Applicant',
                        "status" : "Active",
                        "is_excel" : source
                    };
                    User.upsert(logindata, function (err, userData) {
                        var userId = userData.id

                        var schoolRequest = {"userId":userId, "schoolId": school_id, "user_type": user_type, "created_date": currentDates};
                        Userschool.upsert( schoolRequest, function (err) {
                            if(err) return err; 
                        });

                        var applicantMasterdata = {
                            "user_id" : userId,
                            "class_id" : class_id,
                            "exam_type" : mobile,
                            "user_type" : 'Applicant',
                            "fname" : fname,
                            "lname" : lname,
                            "email" : email,
                            "mobile" : mobile,
                            "board_id" : board_id,
                            "class_name" : class_name,
                            "source" : source,
                            "status" : 1,
                            "school_id" : school_id,
                            "added_by" : "",
                            "added_date" : currentDates
                        };
                        ApplicantInfo.addapplicant(applicantMasterdata, function(err, applicantData){
                            if(err) return err; 
                            
                            
                            
                            successResponse.user_id     = userId;
                            successResponse.username    = email;
                            successResponse.password    = mobile;
                            cb(null, successResponse, userId, '200');
                        });
                    });
                }
            });
        }
    };

    Registration.remoteMethod(
        'applicantregistration',
        {
            http: {path: '/applicantregistration', verb: 'post'},
            description: 'Applicant Registration',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'},{arg: 'tle_user_id', type: 'json'},{arg: 'responseCode', type: 'json'}]
        }
    );
    Registration.updatestatus = function (data, cb) {
        var msg={};
        var School = Registration.app.models.school;
        var Student = Registration.app.models.student;
        if(!data){
            msg.status="201",
            msg.message="bad request"
            cb(null,msg)
        }
       var schoolId=data.school_id
        Student.studentlist({"school_id":schoolId}, function(errors, studentdetail){
            if(errors){ 
                return cb(null, err);
            }
            else{
                var username=studentdetail.length +1
            School.schooldetailbyoldschoolid({"school_id":schoolId}, function(err, schoolDetail){
        
                        if(err){ 
                            return cb(null, err);
                        }else{
                            var postFix = schoolDetail[0].school_code;

                            var employeecode = username +'@'+postFix;
                            var admissionNo = constantval.ADM+employeecode;
                            var admission_no = constantval.ADM+username;
                            var parentUserName = 'p'+employeecode;
        var userId=data.user_id
        var parentid=data.user_id-1;
        var Student = Registration.app.models.student;
        var UserSection = Registration.app.models.user_sections;
        var User = Registration.app.models.user;
        var userSubObj = Registration.app.models.user_subject;
        var Parent = Registration.app.models.parent;
        User.updatestatus({"user_id":userId,"user_name":admissionNo}, function(err, userDetail){
       if(err) return err;
       if(userDetail){
        //    console.log(userDetail)
        //    console.log(parentid)
        User.updatestatus({"user_id":parentid,"user_name":parentUserName}, function(e, u){  
    
       UserSection.updatestatus({"user_id":userId}, function(error, respo){ 
       if(error) return error;
       if(respo){
        Student.updatestatus({"user_id":userId,"admission_no":admission_no}, function(errors, res){ 
            if(error)return error;
            if(res){
                let paramSub = {"status":"Active"};
                userSubObj.updateAll({userId:userId}, paramSub, function(err, responses){
                    Parent.getparentbyuserid({"user_id":parentid}, function(errs, responseparentrespos){

                    msg.status="200",
                    msg.message="Status Updated Successfully"
                    // console.log(userDetail)
                    // console.log(u)
                    // console.log(res)
                    // console.log(responses)
                    // console.log(responseparentrespos)
                    var fatherObj={
                        "passsword":u.password,
                        "dob":res.dob,
                        "mobile":responseparentrespos.parent.father_contact,
                        "gender":res.gender,
                        "fathername":responseparentrespos.parent.father_name,
                        "parentusername":u.user_name,
                        "userId":u.id
                    }
                    var studentObj={
                        "passsword":userDetail.password,
                        "dob":res.dob,
                        "mobile":responseparentrespos.parent.father_contact,
                        "gender":res.gender,
                        "studetnanme":res.name,
                        "studentusername":userDetail.user_name,
                        "classId":data.class_id,
                        "boardId":data.board_id,
                        "userId":userDetail.id
                    }

                     Registration.websiteregister(fatherObj,studentObj)
                    cb(null,msg)
                    })
                });
          
           
            }
        })
        }
    }) 
}) 
    }

        })
    }
    })
}
})
    }
    Registration.remoteMethod(
        'updatestatus',
        {
            http: {path: '/updatestatus', verb: 'post'},
            description: 'updatestatus of unpaid students',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
);
Registration.websiteregister=function(fatherObj,studetnObj){
   var dobpassword=fatherObj.passsword;
    var fatherName=fatherObj.fathername;
    var gender=fatherObj.gender;
    var dob=fatherObj.dob;
    var mobile=fatherObj.mobile;
    var parentUserName=fatherObj.parentusername;
    var  studentName=studetnObj.studetnanme;
    var admissionNo=studetnObj.studentusername;
    var boardId=studetnObj.boardId;
    var emsccClassId=studetnObj.classId
    var studentUserId=studetnObj.userId;
    var parentUserId=fatherObj.userId
    var tleConfig = Registration.app.models.tle_config;
    var User=Registration.app.models.user;
    tleConfig.findOne(function (err, result) {
     
        if(result != null){
            if(result.status > 0){
                var WEB_API_KEY = result.web_api_key;
                var WEB_API_SALT = result.web_api_salt;
                
                /* Parent Creation */
                var webChecsum = md5('erp' + ':' + '' + ':' + dobpassword + ':' + fatherName + ':' + gender + ':' + 'erp' + ':' + parentUserName + ':' + WEB_API_KEY + ':' + WEB_API_SALT);
                var parentPostJson = {
                    "action":"erp",
                    "login_details":{
                        "email_address":    '',
                        "password":         dobpassword,
                        "mobile_nu":        mobile,
                        "dob":              dob,
                        "name":             fatherName,
                        "gender":           gender,
                        "source":           'erp',
                        "unique_id":        parentUserName,
                        "user_type_id":     2
                    },
                    "api_details":{
                        "apikey":           WEB_API_KEY,
                        "checksum":         webChecsum
                    }
                }
              
                request.post({
                    headers: {'content-type' : 'application/json'},
                    url:     result.webpath+"v1.1/tabletregistration",
                    json:    parentPostJson
                    }, function(error, response, body){
                        var parentWebUserId = body.content.user_id;
                        
                        var updateParArr = {"website_user_id" : parentWebUserId};
                        User.updateAll({id: parentUserId}, updateParArr, function (err, userData) {
                            if(err) return err;
                        });
                        
                        /* Student Creation */
                 
                        var studentWebChecsum = md5('erp' + ':' + '' + ':' + dobpassword + ':' + studentName + ':' + gender + ':' + 'erp' + ':' + admissionNo + ':' + WEB_API_KEY + ':' + WEB_API_SALT);
                        var studentPostJson = {
                            "action":"erp",
                            "login_details":{
                                "email_address":    '',
                                "password":         dobpassword,
                                "mobile_nu":        mobile,
                                "dob":              dob,
                                "name":             studentName,
                                "gender":           gender,
                                "source":           'erp',
                                "unique_id":        admissionNo,
                                "is_child":         1,
                                "parent_id":        parentWebUserId,
                                "user_type_id":     1,
                                "board_id":         boardId,
                                "class_id":         emsccClassId
                            },
                            "api_details":{
                                "apikey":           WEB_API_KEY,
                                "checksum":         studentWebChecsum
                            }
                        }
               
                        request.post({
                            headers: {'content-type' : 'application/json'},
                            url:     result.webpath+"v1.1/tabletregistration",
                            json:    studentPostJson
                            }, function(error, response, body){
                         
                                var studentWebUserId = body.content.user_id;
                                var updateArr = {"website_user_id" : studentWebUserId};
                        
                                User.updateAll({id: studentUserId}, updateArr, function (err, userData) {
                                 
                                    if(err) return err;
                                });
                            if(error){
                                console.log('Error while notification')
                            }
                        });
                    if(error){
                        console.log('Error while notification')
                    }
                });
            }
        }
    });
}



// migrate student and regiter as per the policy of ERP...


Registration.userregistrationmigration = function (data, cb) {
    var User = Registration.app.models.user;
    var Staff = Registration.app.models.staff;
    var School = Registration.app.models.school;
    var Session = Registration.app.models.session;
    var Parent = Registration.app.models.parent;
    var Student = Registration.app.models.student;
    var UserSection = Registration.app.models.user_sections;
    var Section = Registration.app.models.section;
    var Subject = Section.app.models.subject;
    var Usersubject = Section.app.models.user_subject;
    var Classsubject = Section.app.models.class_subject;
    var Userschool = Registration.app.models.user_school;
    var tleConfig = User.app.models.tle_config;
    var otherRegObj = User.app.models.other_registration;

    var feeStructureObj = Registration.app.models.student_fee_structure;
    
    var successResponse = {};
    var errorResponse = {};
            
    var type           = data.type;
    var fullName       = data.name;
    var email          = data.email;
    var mobile         = data.mobile;
    var migration_id   = data.migration_id
    var genders        = data.gender;
    var gender         = genders.charAt(0).toUpperCase() + genders.slice(1)
    var dob            = data.dob;
    var schoolId       = data.school_id;
    var sectionId       = data.section_id;
    var fee_structure_id       = data.fee_structure_id;
   
    var fatherName     = data.father_name;
    var motherName     = data.mother_name;
    var fname          = data.fname;
    var mname          = data.mname;
    var lname          = data.lname;
    var classSection   = data.class_section;
    var boardId        = data.board_id;
    var fatherEmail    = data.father_email;
    var source         = data.source;
    var username       = data.admission_no;
    var staffCode      = data.staff_code;
    var cityId         = data.city_id;
    var department_name= data.department_name;
    var designation_name= data.designation_name;
    var doj            = data.date_of_join;
    var userEmsccId    = data.user_id;
    var emsccClassId    = data.class_id;
    var due_fee = data.due_fee;
    
    var dobpassword = dateFormat(dob, "yyyymmdd");
    var passwordEncoded = md5(dobpassword);
    var userloginname = "";
    var status='';
    if(data.status){
        status=data.status
    }
    else{
        status="Active"
    }
    
    var admission_date = dateFormat(data.admission_date, "yyyy-mm-dd hh:mm:dd");
    var today = new Date();
    var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");

    
    if(type == ""){
        errorResponse.responseCode = "201";
        errorResponse.responseMessage = "Type can't be blank.";
        return cb(null, errorResponse);
    }
    if(mobile == ""){
        errorResponse.responseCode = "201";
        errorResponse.responseMessage = "Phone no. can't be blank.";
        return cb(null, errorResponse);
    }
    if(gender == ""){
        errorResponse.responseCode = "201";
        errorResponse.responseMessage = "Gender can't be blank.";
        return cb(null, errorResponse);
    }
    if(dob == ""){
        errorResponse.responseCode = "201";
        errorResponse.responseMessage = "Date of birth can't be blank.";
        return cb(null, errorResponse);
    }
    if(schoolId == ""){
        errorResponse.responseCode = "201";
        errorResponse.responseMessage = "School Id can't be blank.";
        return cb(null, errorResponse);
    }
    if(sectionId == ""){
        errorResponse.responseCode = "201";
        errorResponse.responseMessage = "sectionId can't be blank.";
        return cb(null, errorResponse);
    }
    if(fee_structure_id == ""){
        errorResponse.responseCode = "201";
        errorResponse.responseMessage = "fee structure Id can't be blank.";
        return cb(null, errorResponse);
    }
    
    if(type.toLowerCase() == 'student'){
        if(fatherName == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Father name can't be blank.";
            return cb(null, errorResponse);
        }
        if(motherName == ""){
            errorResponse.responseCode = "201";
            errorResponse.responseMessage = "Mother name can't be blank.";
            return cb(null, errorResponse);
        }
        
        Session.getactiveschoolsession( schoolId, function (err, sessionData) {
            if(err){ 
                return cb(null, err);
            }else{
                var sessionId = sessionData.id;

                if(username == ""){
                    errorResponse.responseCode = "201";
                    errorResponse.responseMessage = "Admission no can't be blank.";
                    return cb(null, errorResponse);
                }
                // console.log(schoolId)
                School.schooldetailbyoldschoolid({"school_id":schoolId}, function(err, schoolDetail){
                    if(err){ 
                        return cb(null, err);
                    }else{
                        var postFix = schoolDetail[0].school_code;

                        var employeecode = username +'@'+postFix;
                        var admissionNo = constantval.ADM+employeecode;
                        var admission_no = constantval.ADM+username;
                        var parentUserName = 'p'+employeecode;
           
                          

                                var parentlogindata = {
                                    "role_name" : "Parent",
                                    "roleId" : 5,
                                    "user_name" : parentUserName,
                                    "old_user_id" : "",
                                    "password" : passwordEncoded,
                                    "user_type" : "Parent",
                                    "status" : status,
                                    "is_excel" : source
                                };
                                User.upsert(parentlogindata, function (err, userData) {
                                    var parentUserId = userData.id

                                    var today = new Date()
                                    var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
                                    var parentSchoolRequest = {"userId":parentUserId, "schoolId": schoolId, "user_type": 'Parent', "created_date": currentDatess};
                                    Userschool.upsert( parentSchoolRequest, function (err) {
                                        if(err) return err; 
                                    });

                                    var parentMasterdata = {
                                        "userId" : parentUserId,
                                        "father_name" : fatherName,
                                        "father_contact" : mobile,
                                        "mother_contact" : "",
                                        "father_photo" : "",
                                        "mother_photo" : "",
                                        "schoolId" : schoolId,
                                        "old_parent_id" : "",
                                        "mother_name" : motherName,
                                        "father_email" : fatherEmail,
                                        "mother_email" : "",
                                        "father_occupation" : "",
                                        "mother_occupation" : ""
                                    };
                                    Parent.addparent(parentMasterdata, function(err, parentData){console.log(parentData)
                                        var parentId = parentData.id;

                                        var studentUserLogindata = {
                                            "role_name" : "Student",
                                            "roleId" : 4,
                                            "user_name" : admissionNo,
                                            "old_user_id" : "",
                                            "password" : passwordEncoded,
                                            "user_type" : "Student",
                                            "status" : status,
                                            "is_excel" : source,
                                            "web_user_id" : userEmsccId
                                        };
                                        User.upsert(studentUserLogindata, function (err, studentUserData) {
                                            var studentUserId = studentUserData.id;

                                            var studentSchoolRequest = {"userId":studentUserId, "schoolId": schoolId, "user_type": 'Student', "created_date": currentDatess};
                                            Userschool.upsert( studentSchoolRequest, function (err) {
                                                if(err) return err; 
                                            });

                                            var studentTbldata = {
                                                "userId" : studentUserId,
                                                "name" : fname+' '+mname+' '+lname,
                                                "gender" : gender,
                                                "dob" : dob,
                                                "student_photo" : "",
                                                "admission_no" : admission_no,
                                                "schoolId" : schoolId,
                                                "status" : status,
                                                "student_type" : "new",
                                                "parentId" : parentId,
                                                "sibling" : "No",
                                                "dateofadmission" : admission_date
                                            };
                                            Student.addstudent(studentTbldata, function(err, studentData){
                                               
                                                        var usersectiondata = {
                                                            "userId" : studentUserId,
                                                            "sectionId" : sectionId,
                                                            "sessionId" : sessionId,
                                                            "class_teacher" : "No",
                                                            "roll_no" : "",
                                                            "user_type" : "Student",
                                                            "schoolId" : schoolId,
                                                            "status" : status,
                                                            "boardId" : boardId,
                                                            "emscc_class_id" : emsccClassId
                                                        };
                                                        UserSection.assignsection(usersectiondata,function(err, assignedSection){
                                                            if(err){
                                                                cb(null, err);
                                                            }else{
                                                                let classParam = {
                                                                    "section_id" : sectionId,
                                                                    "school_id"  : schoolId,
                                                                    "session_id" : sessionId
                                                                };
                                                                Classsubject.getclasssubjectdata(classParam, function(err, subjectClass){
                                                                    if(subjectClass){
                                                                        subjectClass.forEach(function(subject){
                                                                            var classSubjectId = subject.id;
                                                                            var userSubjectArr = {
                                                                                "userId" : studentUserId,
                                                                                "subjectId" : subject.subjectId,
                                                                                "class_subjectId" : classSubjectId,
                                                                                "user_type" : "Student",
                                                                                "sessionId" : sessionId,
                                                                                "sectionId" : sectionId,
                                                                                "schoolId" : schoolId,
                                                                                "status" : status,
                                                                                "created_date" : currentDatess
                                                                            };

                                                                            Usersubject.assignsubject(userSubjectArr, function(err, result){});
                                                                        });

                                                                        // save migrated student fee...

                                                                        var mreq = {

                                                                            fee_structure_id:fee_structure_id,
                                                                            userId:studentUserId,
                                                                            session_id:sessionId,
                                                                            school_id:schoolId,
                                                                            section_id:sectionId,
                                                                            due_fee:due_fee

                                                                        };
                                                                        feeStructureObj.savemigratedstudentfee(mreq, (merr, mresp)=>{
                                                                            if(merr){
                                                                                errorResponse.responseCode = "201";
                                                                                errorResponse.responseMessage = "Error occured";
                                                                                return cb(null, errorResponse);

                                                                            }else{
                                                                              
                                                                                // now save student fee and resetr defaulter as per migration logic => (Fill Student Kit First the other head by distributing Due Fee amount)
                                                                            console.log(mresp);
                                                                                
                                                                                if(mresp.status == '200'){
                                                                                    var updateData = {
                                                                                        migration_status:1,
                                                                                        id:migration_id
                                                                                    };
                                                                                    
                                                                                    var migrationObj = Registration.app.models.migration;
                                                                                    migrationObj.upsert(updateData,function(errm,respm){
                                                                                      
                                                                                        if (errm) { 
                                                                                            errorResponse.responseCode = "201";
                                                                                            errorResponse.responseMessage = "Error occured during migration";
                                                                                            return cb(null, errorResponse);
                                                                                        }else{
                                                                                            console.log(respm);
                                                                                            successResponse.responseCode = "200";
                                                                                            successResponse.user_id 	= studentUserId;
                                                                                            successResponse.parent_username = parentUserName;
                                                                                            successResponse.parent_password = dobpassword;
                                                                                            successResponse.student_username= admissionNo;
                                                                                            successResponse.student_password= dobpassword;
                                                                                            cb(null, successResponse, studentUserId, '200');
                                                                                        }
                                                                            
                                                                            
                                                                                    });

                                                                                }else{
                                                                                errorResponse.responseCode = "201";
                                                                                errorResponse.responseMessage = "Error occured during migration";
                                                                                return cb(null, errorResponse);
                                                                                }
                                                                                

                                                                                
                                                                            }


                                                                        });


                                                                        
                                                                        // successResponse.responseCode = "200";
                                                                        // successResponse.user_id 	= studentUserId;
                                                                        // successResponse.parent_username = parentUserName;
                                                                        // successResponse.parent_password = dobpassword;
                                                                        // successResponse.student_username= admissionNo;
                                                                        // successResponse.student_password= dobpassword;
                                                                        // cb(null, successResponse, studentUserId, '200');
                                                                    }
                                                                });
                                                            }
                                                        });
                                                 
                                            });
                                        });
                                    });
                                });
                            
                       
                    }
                });
            }
        });
    }
};

Registration.remoteMethod(
    'userregistrationmigration',
    {
        http: {path: '/userregistrationmigration', verb: 'post'},
        description: 'User Registration migration',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response', type: 'json'},{arg: 'user_id', type: 'json'},{arg: 'responseCode', type: 'json'}]
    }
);





};
