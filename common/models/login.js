'use strict';
var md5 = require('md5');
var dateFormat = require('dateformat');
var constantval = require('./constant');
var request = require('request');
module.exports = function (Login) {

    Login.login = function (req, cb) {


        var Devicetoken = Login.app.models.user_device_token;
        var Userlog = Login.app.models.master_user_log;
        var User = Login.app.models.user;
        var Student = Login.app.models.student;
        var School = Login.app.models.school;
        var Parent = Login.app.models.parent;
        var TleConfig = Login.app.models.tle_config;
        var websiteObj = Login.app.models.website;

        var detailData = {};
        var details = {};
        var studetail = {};

        var errorMessage = {};
        var successMessage = {};

        var currentTimeSecond = Date.now();
        var currentTtl = Math.round(parseInt(currentTimeSecond) / 1000);


        if (!req.username || !req.password) {
            errorMessage.status = '201';
            errorMessage.message = "Username And Password Can't Be Blank";
            cb(null, errorMessage);
        } else {
            var ssaLoginObj = {};
            var flag = true;
            TleConfig.configuration(function (err, tleConfigArr) {
                var ssaData;
                var webpath;
                var redirectUrl;
                if (tleConfigArr && tleConfigArr.status == 1) {
                    ssaData = tleConfigArr.status;
                    webpath = tleConfigArr.webpath;
                    var paramRequest = {
                        username : req.username,
                        password : req.password,
                        path : webpath,
                        web_api_key : tleConfigArr.web_api_key,
                        web_api_salt : tleConfigArr.web_api_salt
                    }
                    websiteObj.websiteloginapi(paramRequest, function (err, websiteRes) {
                        redirectUrl = websiteRes.redirect_url;
                        if(websiteRes.status == 1){
                            flag = true;
                        }else{
                            flag = false;
                        }
                    })

                } else {
                    ssaData = 0;
                    webpath = "";
                    redirectUrl = "";
                    flag = true;
                }
                ssaLoginObj.ssa_login = ssaData;
                ssaLoginObj.ssa_webpath_url = webpath;
                ssaLoginObj.redirect_url = redirectUrl;
            });


            if(flag == true){
                var qEncoded = md5(req.password);

                User.findOne({
                    where: { user_name: req.username, password: qEncoded },
                }, function (err, resultArr) {
                    if(err){ cb(null, err);}
                    
                    if(resultArr != null){
                    if(resultArr.role_name.toLowerCase() == 'superadmin'){
                        var detail = {};
                        detail.username = resultArr.user_name;
                        detail.user_type = resultArr.user_type;
                        detail.role_name = resultArr.role_name;
                        detail.logined_id = resultArr.id;
                        
                        var detailRecord = {};
                        var de = {};
                        de.user_id = resultArr.id;
                        detailRecord.user_detail = de;
                        (async () => {
                            await Login.CreateToken(detailRecord).then(val => {
                            
                                detail.token = val.user_detail.token;
                                successMessage.status = '200';
                                successMessage.message = 'Logged in successfully.';

                                detailData.user_detail = detail;
                                let arr = {
                                    product_type : constantval.product_type,
                                    school_id : "",
                                    session_id : ""
                                };
                                detailData.school_detail = arr;
                    
                            
                                cb(null, successMessage, detailData);
                            })
                        })();
                        
                    }else{
    
                {
                    User.findOne({
                        where: { user_name: req.username, password: qEncoded },
                        include: [{
                            relation: 'students',
                            scope: {
                                // fields: ['name']
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
                            relation: 'user_have_schools',
                            scope: {
                                include: {
                                    relation: 'has_many_sessions',
                                    where: { status: "Active" }

                                }
                            }
                        }],
                    }, function (err, result) {
                        var detail = {};

                        if (err) {
                            return cb(null, err);
                        }
                        if (result) {

                            if (result.status.toLowerCase() == 'inactive') {
                                errorMessage.status = '201';
                                errorMessage.message = "User Is Inactive";
                                return cb(null, errorMessage);

                            }


                            if (result.user_type.toLowerCase() == 'student') {
                                if (result.students().status != 'Active') {
                                    errorMessage.status = '201';
                                    errorMessage.message = "User Is Inactive";
                                    return cb(null, errorMessage);
                                }
                            }
                            if (result.user_type.toLowerCase() == 'teacher') {
                                if (result.user_belongs_to_staff().status != 'Active') {
                                    errorMessage.status = '201';
                                    errorMessage.message = "User Is Inactive";
                                    return cb(null, errorMessage);
                                }
                            }
                            var today = new Date()
                            var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");

                            /* ===================== insert update in master user log table ===================== */
                            Userlog.find({
                                where: { user_id: result.id }
                            }, function (err, masterLog) {
                                if (masterLog && masterLog.length == 0) {
                                    var loginRequest = { "user_id": result.id, "login_time": currentDatess, "login_status": 'login', "last_activity_time": currentDatess, "user_session_id": '', "login_return": "" };
                                    Userlog.create(loginRequest, function (err) {
                                        if (err)
                                            return err;
                                    });
                                } else {
                                    var logoutRequest = { "logout_time": currentDatess, "login_status": 'logout' };
                                    Userlog.updateAll({ user_id: result.id }, logoutRequest, function (err) {
                                        if (err)
                                            return err;
                                        var loginRequest = { "user_id": result.id, "login_time": currentDatess, "login_status": 'login', "last_activity_time": currentDatess, "user_session_id": '', "login_return": "" };
                                        Userlog.create(loginRequest, function (err) {
                                            if (err)
                                                return err;
                                        });
                                    });
                                }
                            });
                            /* ===================== End insert update in master user log table ===================== */

                            /* ===================== Start update in user_login table ===================== */

                            if (req.device_type.toLowerCase() == 'web') {
                                User.updateAll({ id: result.id }, { user_login_erp: 1 }, function (err) {
                                    if (err)
                                        return err;
                                });
                            } else if (req.device_type.toLowerCase() == 'ctp') {
                                User.updateAll({ id: result.id }, { user_login_ctp: 1 }, function (err) {
                                    if (err)
                                        return err;
                                });
                            } else if (req.device_type.toLowerCase() == 'mobile') {
                                User.updateAll({ id: result.id }, { user_login_mobileapp: 1 }, function (err) {
                                    if (err)
                                        return err;
                                });
                            }
                            /* ===================== End update in user_login table ===================== */

                            /* ===================== Start user_device insert update ===================== */
                            if (req.refrence_id && result.id) {
                                Devicetoken.find({
                                    where: { device_token: req.refrence_id }
                                }, function (err, deviceArr) {
                                    if (deviceArr.length == 0) {
                                        var request = { "userId": result.id, "device_token": req.refrence_id, "device_type": req.device_type, "network_id": req.network_id };
                                        Devicetoken.create(request, function (err) {
                                            if (err)
                                                return err;
                                        });
                                    } else {
                                        var whereObj = { "device_token": req.refrence_id };
                                        Devicetoken.destroyAll(whereObj, function (err) {
                                            if (err) {
                                                return err;
                                            } else {
                                                var request = { "userId": result.id, "device_token": req.refrence_id, "device_type": req.device_type, "network_id": req.network_id };
                                                Devicetoken.create(request, function (err) {
                                                    if (err)
                                                        return err;
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            /* ===================== End user_device insert update ===================== */

                            var detailRecord = {};
                            var de = {};
                            de.user_id = result.id;
                            detailRecord.user_detail = de;
                            (async () => {


                            await Login.CreateToken(detailRecord).then(val => {
                                detail.token = val.user_detail.token;
                            })
                        
                            //Login.setZendSession(result).then(data => {});

                            var schoolId = result.user_have_schools()[0].id;
                            if (result.user_type == 'Teacher') {

                                User.getuserbyid(result.id, function (err, staffArr) {
                                    var stafflist = staffArr.user_belongs_to_staff();

                                    School.schooldetail({ "school_id": schoolId }, function (err, schoolArr) {
                                        var sessionArr = schoolArr.has_many_sessions();
                                        var sessionId = "";
                                        var sessionStartDate = "";
                                        var sessionEndDate = "";
                                        sessionArr.forEach(function (session) {
                                            sessionId = session.id;
                                            sessionStartDate = dateFormat(session.start_date, "yyyy-mm-dd");
                                            sessionEndDate = dateFormat(session.end_date, "yyyy-mm-dd");
                                        });
                                        var Usersection = Login.app.models.user_sections;

                                        Usersection.sectionbyuserid({ "user_id": stafflist.userId, "session_id": sessionId }, function (err, assignedClass) {

                                            detail.user_id = stafflist.userId;
                                            detail.username = result.user_name;
                                            detail.role_name = result.role_name;
                                            detail.logined_id = stafflist.userId;
                                            detail.ssa_login = ssaLoginObj.ssa_login;
                                            detail.ssa_webpath_url = ssaLoginObj.ssa_webpath_url;
                                            detail.staff_code = stafflist.staff_code;
                                            detail.user_type = result.user_type;
                                            detail.name = stafflist.name;
                                            detail.contact = "";
                                            detail.date_of_join = dateFormat(stafflist.date_of_join, "yyyy-mm-dd HH:MM:ss");
                                            detail.department_Name = stafflist.department;
                                            detail.designation_Name = stafflist.designation;
                                            detail.blood_group = "";
                                            //detail.session_id  = "";
                                            //detail.school_id = stafflist.schoolId;
                                            detail.profile_image = stafflist.profile_image ? constantval.PROJECT_NAME + "/" + stafflist.profile_image : '';
                                            details.school_id = schoolArr.id;
                                            details.school_name = schoolArr.school_name;
                                            details.school_code = schoolArr.school_code;
                                            details.school_address = schoolArr.school_address;
                                            details.school_logo = schoolArr.school_logo;
                                            details.school_email = schoolArr.school_email;
                                            details.contact_no = schoolArr.contact_no;
                                            details.session_id = sessionId;
                                            details.session_start_date = sessionStartDate;
                                            details.session_end_date = sessionEndDate;
                                            details.product_type = constantval.product_type;
                                            detailData.school_detail = details;
                                            if (assignedClass.length == 0) {
                                                detail.isClassTecher = "";
                                                detail.class_teacher_class_id = "";
                                                detail.class_teacher_section_id = "";
                                                detailData.user_detail = detail;
                                                successMessage.status = '200';
                                                successMessage.message = 'Logged in successfully.';
                                                return cb(null, successMessage, detailData);
                                            } else {

                                                for (let key in assignedClass) {
                                                    if (assignedClass[key].sessionId == sessionId &&
                                                        assignedClass[key].class_teacher.toLowerCase() == 'yes' &&
                                                        assignedClass[key].status.toLowerCase() == 'active') {

                                                        detail.class_teacher_section_id = assignedClass[key].sectionId;
                                                    }
                                                }
                                                Usersection.getsectionbyuserid({ "user_id": stafflist.userId, "section_id": detail.class_teacher_section_id }, function (err, assignedClass) {

                                                    detail.isClassTecher = assignedClass[0].section_name;
                                                    detail.class_teacher_class_id = assignedClass[0].class_id;
                                                    detailData.user_detail = detail;
                                                    successMessage.status = '200';
                                                    successMessage.message = 'Logged in successfully.';
                                                    return cb(null, successMessage, detailData);

                                                });
                                            }




                                        });

                                    });
                                });
                            } else if (result.user_type == 'Student') {

                                let current_datetime = new Date().toISOString();




                                //detail = result;
                                var student_user_id = '';
                                var student_section_id = '';

                                Student.getstudentbyuserid({ "user_id": result.id }, function (err, studentArr) {
                                    var studentData = studentArr.student;
                                    School.schooldetail({ "school_id": schoolId }, function (err, schoolArr) {

                                        var parentData = studentArr.parent;
                                        var Usersection = Login.app.models.user_sections;

                                        var sessionArr = schoolArr.has_many_sessions();
                                        var sessionId = "";
                                        var sessionStartDate = "";
                                        var sessionEndDate = "";
                                        sessionArr.forEach(function (session) {
                                            sessionId = session.id;
                                            sessionStartDate = dateFormat(session.start_date, "yyyy-mm-dd");
                                            sessionEndDate = dateFormat(session.end_date, "yyyy-mm-dd");
                                        });

                                        Usersection.getsectionbyuserid({ "user_id": studentData.userId, "session_id": sessionId }, function (err, resultdata) {
                                            detail.class_section = resultdata[0].section_name;
                                            detail.section_id = resultdata[0].section_id;
                                            student_section_id = resultdata[0].section_id;
                                            detail.user_id = studentData.userId;
                                            detail.username = result.user_name;
                                            detail.role_name = result.role_name;
                                            student_user_id = studentData.userId;
                                            detail.logined_id = studentData.userId;
                                            detail.name = studentData.name;
                                            detail.student_id = studentData.id;
                                            detail.user_type = result.user_type;
                                            //detail.SSA_Login = ssaData[0].status;
                                            //detail.classTeacher = staffData[0].staff_name;
                                            //detail.sectionId = staffData[0].assigned_sections;
                                            detail.ssa_login = ssaLoginObj.ssa_login;
                                            detail.ssa_webpath_url = ssaLoginObj.ssa_webpath_url;
                                            detail.dob = studentData.dob;
                                            detail.address = studentData.address;
                                            detail.profile_image = studentData.student_photo ? constantval.PROJECT_NAME + "/" + studentData.student_photo : '';
                                            detail.admission_no = studentData.admission_no;
                                            detail.dateofadmission = studentData.dateofadmission;
                                            detail.student_type = studentData.student_type;
                                            //detail.section_name = studentlist.section_name;
                                            //detail.session_id = sessionId;
                                            // detail.school_id = studentData.schoolId;
                                            detail.parent_id = studentData.parentId;
                                            detail.father_name = parentData.father_name;
                                            detail.father_mobile_num = parentData.father_contact;
                                            detail.father_email = parentData.father_email;
                                            detail.mother_name = parentData.mother_name;
                                            detail.mother_mobile_num = parentData.mother_contact;
                                            detail.mother_email = parentData.mother_email;
                                            detail.mother_photo = parentData.mother_photo;
                                            detail.father_photo = parentData.father_photo;
                                            detail.father_occupation = parentData.father_occupation;
                                            detail.mother_occupation = parentData.mother_occupation;
                                            detail.guardian_name = studentData.guardian_name;
                                            detail.guardian_relation = studentData.guardian_relation;
                                            detail.guardian_telephone = studentData.guardian_telephone;
                                            detail.guardian_address = studentData.guardian_address;
                                            detail.guardian_photo = studentData.guardian_photo;
                                            detail.board_id = resultdata[0].boardId;
                                            detail.nemr_class_id = resultdata[0].emscc_class_id;

                                            let data = {
                                                applicable_date: new Date().toISOString(),
                                                session_id: sessionId,
                                                section_id: detail.section_id
                                            }

                                            //  Login.notif(data);

                                            Usersection.getStudentRollNo(student_user_id, sessionId, student_section_id).then(function (resultdata) {

                                                detail.roll_no = resultdata[0].roll_no;
                                                detailData.user_detail = detail;
                                                details.school_id = schoolArr.id;
                                                details.school_name = schoolArr.school_name;
                                                details.school_code = schoolArr.school_code;
                                                details.school_address = schoolArr.school_address;
                                                details.school_logo = schoolArr.school_logo;
                                                details.contact_no = schoolArr.contact_no;
                                                details.school_email = schoolArr.school_email;
                                                details.session_id = sessionId;
                                                details.session_start_date = sessionStartDate;
                                                details.session_end_date = sessionEndDate;
                                                details.product_type = constantval.product_type;
                                                detailData.school_detail = details;
                                                successMessage.status = '200';
                                                successMessage.message = 'Logged in successfully.';
                                                return cb(null, successMessage, detailData);
                                            });
                                        });
                                    });
                                });
                            } else if (result.user_type == 'Parent') {
                                var stuArr = [];


                                var studentdetail = {};
                                var userIds = {};
                                var section = "";
                                var sectionArr = [];
                                var promise = [];
                                Parent.getparentbyuserid({ "user_id": result.id }, function (err, parentArr) {
                                    School.schooldetail({ "school_id": schoolId }, function (err, schoolArr) {
                                        var sessionArr = schoolArr.has_many_sessions();
                                        var sessionId = "";
                                        var sessionStartDate = "";
                                        var sessionEndDate = "";
                                        sessionArr.forEach(function (session) {
                                            sessionId = session.id;
                                            sessionStartDate = dateFormat(session.start_date, "yyyy-mm-dd");
                                            sessionEndDate = dateFormat(session.end_date, "yyyy-mm-dd");
                                        });
                                        details.school_id = schoolArr.id;
                                        details.school_name = schoolArr.school_name;
                                        details.school_code = schoolArr.school_code;
                                        details.school_address = schoolArr.school_address;
                                        details.school_logo = schoolArr.school_logo;
                                        details.contact_no = schoolArr.contact_no;
                                        details.school_email = schoolArr.school_email;
                                        details.session_id = sessionId;
                                        details.session_start_date = sessionStartDate;
                                        details.session_end_date = sessionEndDate;
                                        details.product_type = constantval.product_type;
                                        detailData.school_detail = details;
                                        detail.logined_id = parentArr.parent.userId;
                                        detail.username = result.user_name;
                                        detail.role_name = result.role_name;
                                        detail.ssa_login = ssaLoginObj.ssa_login;
                                        detail.ssa_webpath_url = ssaLoginObj.ssa_webpath_url;
                                        detail.name = parentArr.parent.father_name;
                                        detail.user_type = result.user_type;
                                        detail.contact = parentArr.parent.father_contact;
                                        detail.email = parentArr.parent.father_email;
                                        detail.profile_image = parentArr.parent.father_photo ? constantval.PROJECT_NAME + "/" + parentArr.parent.father_photo : '';

                                        //console.log(parentArr.student);

                                        parentArr.student.forEach(function (studentArr) {
                                            studentArr = studentArr.toJSON();
                                            // console.log(studentArr.students.user_have_sections);

                                            // User.assignedsection({"user_id":studentArr.userId, "session_id":sessionId}, function (err, message, assignedClass) {
                                            //     var section = assignedClass.assigned_sections;
                                            //     section.forEach(function(sectionList){
                                            //         //console.log(sectionList.section_id)

                                            //     });
                                            // });
                                            promise.push(Login.getalldata(studentArr.userId).then(function (response) {
                                                var studentdetail = {
                                                    user_id: studentArr.userId,
                                                    name: studentArr.name,
                                                    student_id: studentArr.id,
                                                    house: studentArr.house,
                                                    dob: studentArr.dob,
                                                    address: studentArr.address,
                                                    class_teacher: response.class_teacher,
                                                    profile_image: studentArr.student_photo ? constantval.PROJECT_NAME + "/" + studentArr.student_photo : '',
                                                    admission_no: studentArr.admission_no,
                                                    dateofadmission: studentArr.dateofadmission,
                                                    student_type: studentArr.student_type,
                                                    father_name: parentArr.parent.father_name,
                                                    father_mobile_num: parentArr.parent.father_contact,
                                                    father_email: parentArr.parent.father_email,
                                                    mother_name: parentArr.parent.mother_name,
                                                    mother_mobile_num: parentArr.parent.mother_contact,
                                                    mother_email: parentArr.parent.mother_email,
                                                    mother_photo: parentArr.parent.mother_photo ? constantval.PROJECT_NAME + "/" + parentArr.parent.mother_photo : '',
                                                    father_photo: parentArr.parent.father_photo ? constantval.PROJECT_NAME + "/" + parentArr.parent.father_photo : '',
                                                    father_occupation: parentArr.parent.father_occupation,
                                                    mother_occupation: parentArr.parent.mother_occupation,
                                                    guardian_name: studentArr.guardian_name,
                                                    guardian_relation: studentArr.guardian_relation,
                                                    guardian_telephone: studentArr.guardian_contact,
                                                    guardian_photo: studentArr.guardian_photo,
                                                    guardian_address: studentArr.guardian_address,
                                                    section_name: studentArr.students.user_have_sections[0].section_name,
                                                    section_id: studentArr.students.user_have_sections[0].id,
                                                    roll_no: response.roll_no
                                                }
                                                stuArr.push(studentdetail);
                                                userIds.user_id = studentArr.userId;
                                            }))

                                        });
                                        Promise.all(promise).then(function (response) {
                                            detail.user_id = userIds.user_id;
                                            detailData.user_detail = detail;
                                            detailData.child_list = stuArr;

                                            successMessage.status = '200';
                                            successMessage.message = 'Logged in successfully.';
                                            return cb(null, successMessage, detailData);
                                        })


                                    });


                                });


                            } else if (result.user_type == 'Management' || result.user_type == 'School' || result.user_type == 'Non_Teacher') {
                                result = result.toJSON();
                            
                                detail.username = result.user_name;
                                detail.user_type = result.user_type;
                                detail.role_name = result.role_name;
                                detail.logined_id = result.id;

                                
                                User.getuserbyid(result.id, function (err, staffArr) {
                                    
                                    var stafflist = staffArr.user_belongs_to_staff();
                                    detail.name = stafflist.name;
                                
                                    if (result.user_have_schools && detail.name) {

                                        var schoolDetail = {};
                                        result.user_have_schools.forEach((schoolArr) => {
                                            schoolDetail.school_id = schoolArr.id;
                                            schoolDetail.school_name = schoolArr.school_name;
                                            schoolDetail.school_code = schoolArr.school_code;
                                            schoolDetail.school_address = schoolArr.school_address;
                                            schoolDetail.school_logo = schoolArr.school_logo;
                                            schoolDetail.school_email = schoolArr.school_email;
                                            ;

                                            var sessionId = "";
                                            if (schoolArr.has_many_sessions) {
                                                schoolArr.has_many_sessions.forEach(function (session) {
                                                    sessionId = session.id;
                                                });
                                            }

                                            schoolDetail.session_id = sessionId;
                                            schoolDetail.product_type = constantval.product_type;
                                        });

                                        successMessage.status = '200';
                                        successMessage.message = 'Logged in successfully.';

                                        detailData.user_detail = detail;
                                        detailData.school_detail = schoolDetail;
                                        cb(null, successMessage, detailData);
                                    }
                                });

                            } else if (result.user_type == 'Other') {
                                result = result.toJSON();
                        
                                detail.username = result.user_name;
                                detail.user_type = result.user_type;
                                detail.role_name = result.role_name;
                                detail.logined_id = result.id;
                                

                                if (result.user_have_schools) {
                                    var schoolDetail = {};
                                    result.user_have_schools.forEach((schoolArr) => {
                                        schoolDetail.school_id = schoolArr.id;
                                        schoolDetail.school_name = schoolArr.school_name;
                                        schoolDetail.school_code = schoolArr.school_code;
                                        schoolDetail.school_address = schoolArr.school_address;
                                        schoolDetail.school_logo = schoolArr.school_logo;
                                        schoolDetail.school_email = schoolArr.school_email;

                                        var sessionId = "";
                                        if (schoolArr.has_many_sessions) {
                                            schoolArr.has_many_sessions.forEach(function (session) {
                                                sessionId = session.id;
                                            });
                                        }

                                        schoolDetail.session_id = sessionId;
                                        schoolDetail.product_type = constantval.product_type;
                                    });
                                }
                                successMessage.status = '200';
                                successMessage.message = 'Logged in successfully.';

                                detailData.user_detail = detail;
                                detailData.school_detail = schoolDetail;
                                cb(null, successMessage, detailData);

                            }
                            })();
                        } else {
                            errorMessage.status = '201';
                            errorMessage.message = 'Invalid username and password';
                            cb(null, errorMessage);
                        }
                    });
                }
                }
                }else{
                    errorMessage.status = '201';
                    errorMessage.message = 'Invalid username and password';
                    cb(null, errorMessage);
                }
                });
            }else{
                errorMessage.status = '201';
                errorMessage.message = 'Invalid username and password';
                cb(null, errorMessage);
            }
        }

    };

    Login.CreateToken = detailData => {
        return new Promise((resolve, reject) => {
            var oauthToken = Login.app.models.oauthclient;
            let userId = detailData.user_detail.user_id;
            let credential = { "email": "erp@extramarks.com", "password": "Extra@123", "callfrom": "web", "user_id": userId }
            oauthToken.createauthtoken(credential, function (error, data) {
                if (error) {
                    reject(error);
                } else {

                    detailData.user_detail.token = data.token;
                    resolve(detailData);

                }
            });

        }).catch(err => console.log(err))
    }


    Login.setZendSession = detailData => {
        return new Promise((resolve, reject) => {
            var userSchoolObj = Login.app.models.user_school;
            var param = {"user_id" : detailData.id};
            
            userSchoolObj.getuserschoolbyid(param, function(err, result){
                var postjson = { "user_id": detailData.id, "school_id": result.schoolId, "role_id": "", "username": detailData.user_name, "password": detailData.password, "status": detailData.status, "user_type_id": "", "new_user_id": detailData.id, "user_login_id": detailData.id}
                request.post({
                    headers: { 'content-type': 'application/json' },
                    url: constantval.SCHOOLERP_URL + "login/sessionsetzendstorage",
                    json: postjson
                }, function (error, response, body) {
                    if (error) {
                        reject(error);
                    }else{
                        resolve(body);
                    }
                });
            });
        }).catch(err => console.log(err))
    }



    Login.notif = request => {
        Login.checkholiday(request).then(val => {

        })
    }

    Login.checkholiday = request => {
        return new Promise((resolve, reject) => {
            let Holidaymaster = Login.app.models.holiday_master;
            Holidaymaster.find({
                fields: ["id"],
                where: {
                    sessionId: request.session_id,
                    applicable_date: dateFormat(request.applicable_date, "isoDate")
                },
                include: {
                    relation: "assigned_holidays",
                    scope: {
                        where: { sectionId: request.section_id, status: 'Active' }
                    },
                }
            }, (err, res) => {
                if (err)
                    reject(err);
                resolve(res);

            })
        }).catch(err => console.log(err))
    }

    Login.remoteMethod(
        'login',
        {
            http: { path: '/login', verb: 'post' },
            description: 'Remove users',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    /* Logout API */
    Login.logout = function (req, cb) {
        var userId = req.user_id;
        var token = req.device_token;

        var Devicetoken = Login.app.models.user_device_token;

        var errorMessage = {};
        var successMessage = {};

        if (!userId) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Please provide user id";
            return cb(null, errorMessage);
        }
        if (!token) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Please provide the device token";
            return cb(null, errorMessage);
        }

        var Userlog = Login.app.models.master_user_log;

        var today = new Date()
        var currentDatess = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
        var logoutRequest = { "logout_time": currentDatess, "login_status": 'logout' };
        Userlog.updateAll({ user_id: userId }, logoutRequest, function (err) {
            if (err)
                return err;

            var whereObj = { "userId": userId, "device_token": token };
            Devicetoken.destroyAll(whereObj, function (err) {
                if (err) {
                    cb(null, err);
                } else {
                    successMessage.responseCode = "200";
                    successMessage.responseMessage = "Logout Successfully.";
                    cb(null, successMessage);
                }
            });
        });

    }

    Login.remoteMethod(
        'logout',
        {
            http: { path: '/logout', verb: 'post' },
            description: 'User Token List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


    function parentDetail(stdObj) {
        var allObj = {};
        var staffRecord = {};
        stdObj.forEach(function (staffArr) {

            var staffDetail = staffArr.user_belongs_to_staff();
            allObj.teacher_id = staffDetail.id;
            allObj.name = staffDetail.name;
            allObj.profile_image = staffDetail.profile_image ? constantval.PROJECT_NAME + "/" + staffDetail.profile_image : '';
            allObj.staff_code = staffDetail.staff_code;
            allObj.dob = dateFormat(staffDetail.dob, "yyyy-mm-dd");
            allObj.gender = staffDetail.gender;
            allObj.department = staffDetail.department;
            allObj.designation = staffDetail.designation;
            allObj.date_of_join = dateFormat(staffDetail.date_of_join, "yyyy-mm-dd");
            allObj.school_id = staffDetail.schoolId;
            allObj.user_id = staffDetail.userId;
            allObj.address = staffDetail.address;
            allObj.category = staffDetail.category;
            //staffRecord.push({'staffdetail':allObj});
            allObj.user_type = staffArr.user_type;
        });
        staffRecord.staffdetail = allObj;
        staffRecord.sectionlist = [{ "classId": 5 }];
        return staffRecord;
    }

    Login.getalldata = function (userid) {
        return new Promise(function (resolve, reject) {
            var Usersection = Login.app.models.user_sections;

            var returnobj = {};
            Usersection.getsectionbyuserid({ "user_id": userid }, function (err, result) {
                var assign_section = result[0].section_id;
                var roll_no = result[0].roll_no;
                Usersection.getsectionteachers({ "section_id": assign_section, "user_type": "Teacher" }, function (err, result) {
                    if (result.length == 0) {
                        returnobj.class_teacher = '';
                    } else {
                        var class_teacher = ''
                        for (let key in result) {
                            if (result[key].class_teacher.toLowerCase() == 'yes') {
                                class_teacher = result[key].name;
                            }
                        }
                        returnobj.class_teacher = class_teacher;
                        returnobj.roll_no = roll_no;
                    }

                    resolve(returnobj);

                })
            });
        })
    }

};
