'use strict';
var dateFormat = require('dateformat');
var constantval = require('./constant');
var request = require('request');
var Dedupe = require('array-dedupe');
var arraySort = require('array-sort');
module.exports = function (Section) {

    Section.addsection = function (data, cb) {
        Section.create(data, function (err, section) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, section);
            }
        });

    };


    Section.sectionlist = function (cb) {
        Section.find({
            include:
                    {
                        relation: "section_subjects",
                    }

        }, function (err, section) {
            if (err) {
                cb(null, err);
            } else {
                var archivedSort = arraySort(section, ['class_order','section']);
                cb(null, archivedSort);
            }
        });

    };
    
    Section.classlist = function (data, cb) {
        
        var param = {};
        if(data.class_from != undefined && data.class_from != '' && data.class_from != null){
            param.class_order = {gte: data.class_from}
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
            'classlist',
            {
                http: {path: '/classlist', verb: 'post'},
                description: 'class list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
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
            include:
                    {
                        relation: "section_have_users",
                        scope: {
                            fields: ['user_name', 'id'],
                            where: {user_type: userType}
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
            cb(null, message);
        }
        if (!userType) {
            message.status = '201';
            message.message = "user_type cannot blank";
            cb(null, message);
        }
        Section.findById(sectionId, {
            //fields: 'id',
            include:
                    {
                        relation: "section_have_users",
                        scope: {
                            //fields: ['user_name', 'id'],
                            where: {user_type: userType},
                                  include:{
                                    relation: "students",
                                    scope: {
                                      include:{
                                        relation: "studentbelongtoparent"
                                      }
                                    }
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

     Section.remoteMethod(
            'getuserbysection',
            {
                http: {path: '/getuserbysection', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
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
            include:
                    {
                        relation: "section_have_users",
                        scope: {
                            //fields: ['user_name', 'id'],
                            where: {user_type: userType},
                                  include:[{
                                    relation: "students",
                                    scope: {
                                      include:{
                                        relation: "studentbelongtoparent"
                                        }
                                      }
                                    },{
                                          relation: 'user_attendance'
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
            'getuserlistbysection',
            {
                http: {path: '/getuserlistbysection', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Section.remoteMethod(
            'usersbysection',
            {
                http: {path: '/usersbysection', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
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
            where: {"section_name": data.section_name},
        }, function (err, stdObj) {
            if(data.flag == 'delete'){
                Section.destroyById(stdObj.id,(err,data)=>{});
                
                return cb(null, stdObj);
            }else if(data.flag == 'update'){
                if(stdObj == null || stdObj == ''){ 
                    var Class = Section.app.models.class;
                    Class.findOne({
                        fields: ["id"],
                        where: {"schoolId": data.schoolId, "class_name": data.class_name},
                    }, function (err, classObj) {
                        if(err){
                            return cb(null, err);
                        }else{
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
                               return cb(null, stdObj);
                            });
                        }
                    });
                    
                }
            }else{
                return cb(null, stdObj);
            }
        });
    };

    Section.getsectionbyclassname = function (data, cb) {

        Section.find({
            fields: ["id"],
            where: {"class_name": data.class_name},
        }, function (err, stdObj) {

            return cb(null, stdObj);
        });
    };

    Section.remoteMethod(
            'addsection',
            {
                http: {path: '/addsection', verb: 'post'},
                description: 'Add Section',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Section.remoteMethod(
            'sectionlist',
            {
                http: {path: '/sectionlist', verb: 'post'},
                description: 'Section list',
                returns: {arg: 'response', type: 'json'}
            }
    );
    Section.remoteMethod(
            'deletesection',
            {
                http: {path: '/deletesection', verb: 'post'},
                description: 'Delete Section',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Section.remoteMethod(
            'getsectionbyname',
            {
                http: {path: '/getsectionbyname', verb: 'post'},
                description: 'Get section by section name',
                accepts: {arg: 'section_name', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Section.remoteMethod(
            'getsectionbyclassname',
            {
                http: {path: '/getsectionbyclassname', verb: 'post'},
                description: 'Get sections by class name',
                accepts: {arg: 'section_name', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    /* Batch Creation */
    Section.batchcreation = function (req, cb) {

        var Session = Section.app.models.session;
        var Subject = Section.app.models.subject;
        var Classsubject = Section.app.models.class_subject;
        var Usersection = Section.app.models.user_sections;
        var Usersubject = Section.app.models.user_subject;
        var Emsccsynclog = Section.app.models.emscc_sync_log;
        var Userschool = Section.app.models.user_school;
        var Class       = Section.app.models.class;
        
        var batchDetail = req.batch_details;
        var batchAssignDetail = req.batch_assign_details;
        
        var batchName = batchDetail.batch_name;
        var schoolId = batchDetail.center_id;
        var classId = batchDetail.course_type_id;
        var className = batchDetail.course_type_name;
        
        var classSection = className+'-'+batchName;
        
        var successMessage = {};
        var errorMessage = {};
        
        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");
        
        request.post({
            headers: {'content-type' : 'application/json'},
            url:     constantval.LOCAL_URL+'/'+constantval.PROJECT_NAME+'/erpapi/index/batchcreation',
            json:    req
         }, function(error, response, body){
              
            if(error){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = error;
                var log = {
                    "userId" : "",
                    "emsccUserId" : "",
                    "request_json" : JSON.stringify(req),
                    "response_json" : JSON.stringify(errorMessage),
                    "created_date" : currentDates
                };
                Emsccsynclog.create( log, function (err, transaction) {
			return cb(null,errorMessage,null,'201');
		});
               // return cb(null,errorMessage,null,'201');
            }
            else
            {

                if(body.responseCode == '200'){
                    var log = {
                            "userId" : "",
                            "emsccUserId" : "",
                            "request_json" : JSON.stringify(req),
                            "response_json" : "",
                            "created_date" : currentDates
                        };
            
                    Emsccsynclog.create( log, function (err, transaction) {});
                    
                    Session.getactiveschoolsession( schoolId, function (err, sessionData) {
                        if(err){ 
                            errorMessage.responseCode = "201";
                            errorMessage.responseMessage = err;
                            return cb(null,errorMessage,null,'201');
                        }else{ 
                            if(sessionData != null){
                                
                                Class.findOne({
                                    where: {"class_name": className, "schoolId":schoolId}
                                }, function (err, classData) {
                                    if(err){
                                        errorMessage.responseCode = "201";
                                        errorMessage.responseMessage = err;
                                        return cb(null,errorMessage,null,'201');
                                    }else{
                                        if(classData){
                                            var classIds = classData.id;
                                            
                                            Section.getsectionbynameschool({"section_name":classSection, school_id:schoolId}, function (err, ClassArr) {
                                                if(err){ 
                                                    errorMessage.responseCode = "201";
                                                    errorMessage.responseMessage = err;
                                                    return cb(null,errorMessage,null,'201');
                                                }else{ 
                                                    if(ClassArr == null){
                                                        var sectionArr = {
                                                            "section_name" : classSection,
                                                            "class_name" : className,
                                                            "class_order" : 1,
                                                            "stream_name" : "GENERAL",
                                                            "section_seats" : 50,
                                                            "schoolId" : schoolId,
                                                            "section" : batchName,
                                                            "classId" : classIds
                                                        };

                                                        Section.addsection(sectionArr, function(err ,response){
                                                            if(err){ 
                                                                errorMessage.responseCode = "201";
                                                                errorMessage.responseMessage = err;
                                                                return cb(null,errorMessage,null,'201');
                                                            }
                                                            var sectionId = response.id;
                                                            Subject.getschoolsubjects( schoolId, function (err, subjectData) {
                                                                if(err){ 
                                                                    errorMessage.responseCode = "201";
                                                                    errorMessage.responseMessage = err;
                                                                    return cb(null,errorMessage,null,'201');
                                                                }else{
                                                                    subjectData.forEach(function(subject){
                                                                        var subjectId = subject.id;
                                                                        var classsubjectArr = {
                                                                            "sectionId" : sectionId,
                                                                            "subjectId" : subjectId,
                                                                            "subject_type" : 'Main',
                                                                            "sessionId" : sessionData.id,
                                                                            "subject_code" : subject.subject_code,
                                                                            "status" : 'Active',
                                                                            "schoolId":schoolId,
                                                                            "created_date" : currentDates,
                                                                            "classId" : classIds
                                                                        };

                                                                        Classsubject.assignsubject(classsubjectArr, function(err, response){
                                                                            if(err){ 
                                                                                errorMessage.responseCode = "201";
                                                                                errorMessage.responseMessage = err;
                                                                                return cb(null,errorMessage,null,'201');
                                                                            }
                                                                        });
                                                                    });

                                                                    batchAssignDetail.forEach(function(batchUser){
                                                                        var userId = batchUser.tle_user_id;
                                                                        var subjectName = batchUser.subject_name;


                                                                        Userschool.getuserschool({"school_id":schoolId, "user_id":userId}, function (err, schoolData) {
                                                                            if(err){ 
                                                                                errorMessage.responseCode = "201";
                                                                                errorMessage.responseMessage = err;
                                                                                return cb(null,errorMessage,null,'201');
                                                                            }else{
                                                                                if(schoolData == null){
                                                                                    var userSchoolRequest = {"userId":userId, "schoolId": schoolId, "user_type": 'Teacher', "created_date": currentDates};
                                                                                    Userschool.upsert( userSchoolRequest, function (err) {
                                                                                        if(err) return err; 
                                                                                    });
                                                                               }
                                                                            }
                                                                        });

                                                                        var userSectionArr = {
                                                                            "userId" : userId,
                                                                            "sectionId" : sectionId,
                                                                            "sessionId" : sessionData.id,
                                                                            "class_teacher" : 'No',
                                                                            "user_type" : "Teacher",
                                                                            "roll_no" : 0,
                                                                            "status" : 'Active',
                                                                            "schoolId":schoolId
                                                                        };
                                                                        Usersection.assignsection(userSectionArr, function(err, result){
                                                                            if(err){ 
                                                                                errorMessage.responseCode = "201";
                                                                                errorMessage.responseMessage = err;
                                                                                return cb(null,errorMessage,null,'201');
                                                                            }
                                                                        });

                                                                        Subject.getsectionsubjects({"school_id":schoolId, "subject_name":subjectName}, function (err, assignedSubject) {
                                                                            if(err){ 
                                                                                errorMessage.responseCode = "201";
                                                                                errorMessage.responseMessage = err;
                                                                                return cb(null,errorMessage,null,'201');
                                                                            }else{
                                                                                var subjectId = assignedSubject.id;
                                                                                if(subjectId){

                                                                                    var classParam = {
                                                                                        "section_id" : sectionId,
                                                                                        "subject_id" : subjectId,
                                                                                        "school_id"  : schoolId,
                                                                                        "session_id" : sessionData.id
                                                                                    };
                                                                                    Classsubject.getclasssubjectid(classParam, function (err, subjectClass) {
                                                                                        if(err){ 
                                                                                            errorMessage.responseCode = "201";
                                                                                            errorMessage.responseMessage = err;
                                                                                            return cb(null,errorMessage,null,'201');
                                                                                        }
                                                                                        var classSubjectId = subjectClass.id;
                                                                                        var userSubjectArr = {
                                                                                            "userId" : userId,
                                                                                            "sessionId" : sessionData.id,
                                                                                            "sectionId" : sectionId,
                                                                                            "subjectId" : subjectId,
                                                                                            "status" : 'Active',
                                                                                            "schoolId" : schoolId,
                                                                                            "user_type" : "Teacher",
                                                                                            "created_date" : currentDates,
                                                                                            "class_subjectId" : classSubjectId
                                                                                        };
                                                                                        Usersubject.assignsubject(userSubjectArr, function(err, result){
                                                                                            if(err){ 
                                                                                                errorMessage.responseCode = "201";
                                                                                                errorMessage.responseMessage = err;
                                                                                                var log = {
                                                                                                    "userId" : userId,
                                                                                                    "emsccUserId" : "",
                                                                                                    "request_json" : JSON.stringify(req),
                                                                                                    "response_json" : errorMessage,
                                                                                                    "created_date" : currentDates
                                                                                                };
                                                                                                Emsccsynclog.create( log, function (err, transaction) {
                                                                                                    return cb(null,errorMessage,null,'201');
                                                                                                });

                                                                                            }
                                                                                            successMessage.responseCode = "200";
                                                                                            successMessage.tle_batch_id = sectionId;
                                                                                            successMessage.responseMessage = "Added Successfully ";

                                                                                            var log = {
                                                                                                    "userId" : userId,
                                                                                                    "emsccUserId" : "",
                                                                                                    "request_json" : JSON.stringify(req),
                                                                                                    "response_json" : JSON.stringify(successMessage),
                                                                                                    "created_date" : currentDates
                                                                                                };
                                                                                            Emsccsynclog.create( log, function (err, transaction) {
                                                                                                    cb(null,successMessage,sectionId,'200');
                                                                                            });

                                                                                           // cb(null,successMessage,sectionId,'200');
                                                                                        });
                                                                                    });
                                                                                }
                                                                            }
                                                                        });

                                                                    });

                                                                }

                                                            })

                                                        });
                                                    }else{
                                                         var log = {
                                                            "userId" : "",
                                                            "emsccUserId" : "",
                                                            "request_json" : JSON.stringify(req),
                                                            "response_json" : "class Array null",
                                                            "created_date" : currentDates
                                                        };
                                                        Emsccsynclog.create( log, function (err, transaction) {});
                                                        return cb(null, "class Array null");
                                                    }
                                                }
                                            });
                                            
                                        }else{
                                            errorMessage.responseCode = "201";
                                            errorMessage.responseMessage = "Class name not exist";
                                            return cb(null,errorMessage,null,'201');
                                        }
                                    }
                                });
                                
                            }
                        }
                    });
                }else if(body.responseCode == '204'){
                    successMessage.responseCode = "200";
                    successMessage.tle_batch_id = body.tle_batch_id;
                    successMessage.responseMessage = "Batch Name Already Exist";
                    cb(null,successMessage, body.tle_batch_id, '200');
                }
            }
        });
    };
    
    Section.getSession = function(schoolId)
    {
        var Session = Section.app.models.session;
        return new Promise(function(resolve,reject){
            Session.getactiveschoolsession( {"school_id":schoolId}, function (err, sessionData) {
                if(err){ 
                    return cb(null, err);
                }
                resolve(sessionData);
            })
        });
    }
    Section.remoteMethod(
        'batchcreation',
        {
            http: {path: '/batchcreation', verb: 'post'},
            description: 'Get sections by class name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'},{arg: 'tle_batch_id', type: 'json'},{arg: 'responseCode', type: 'json'}]
        }
    );

    Section.getsectionbynameschool = function (data, cb) {

        Section.findOne({
            fields: ["id"],
            where: {"section_name": data.section_name, "schoolId":data.school_id},
        }, function (err, stdObj) {

            return cb(null, stdObj);
        });
    };
    Section.remoteMethod(
        'getsectionbynameschool',
        {
            http: {path: '/getsectionbynameschool', verb: 'post'},
            description: 'Get Section by schoolid and name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    
    Section.batch = function (req, cb) {
        var Session = Section.app.models.session;
        var Subject = Section.app.models.subject;
        var Classsubject = Section.app.models.class_subject;
        var Usersection = Section.app.models.user_sections;
        var Usersubject = Section.app.models.user_subject;
        var Emsccsynclog = Section.app.models.emscc_sync_log;
        var Userschool = Section.app.models.user_school;
        
        var batchDetail = req.batch_details;
        var batchAssignDetail = req.batch_assign_details;
        
        var batchName = batchDetail.batch_name;
        var schoolId = batchDetail.center_id;
        var classId = batchDetail.course_type_id;
        var className = batchDetail.course_type_name;
        
        var classSection = className+'-'+batchName;
        
        var successMessage = {};
        var errorMessage = {};
        
        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd hh:mm:dd");
         
        request.post({
            headers: {'content-type' : 'application/json'},
            url:     constantval.LOCAL_URL+'/'+constantval.PROJECT_NAME+'/erpapi/index/batchcreation',
            json:    req
         }, function(error, response, body){
              
            if(error){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = error;
                var log = {
                    "userId" : "",
                    "emsccUserId" : "",
                    "request_json" : JSON.stringify(req),
                    "response_json" : JSON.stringify(errorMessage),
                    "created_date" : currentDates
                };
                Emsccsynclog.create( log, function (err, transaction) {
			return cb(null,errorMessage,null,'201');
		});
               // return cb(null,errorMessage,null,'201');
            }
            else
            {  
                if(body.responseCode == '200'){
                    console.log("yes");
                    Section.beginTransaction('READ COMMITTED', function(err, tx) {
                        var options = {transaction: tx};
                        Session.findOne({
                            where: {"status": "Active", "schoolId":schoolId}
                        }, options, function (err, sessionData) {
                            if(err){
                                tx.rollback(function(err){});
                                cb(null, "Error Occured session "+err);
                            }else{
                                Section.findOne({
                                    fields: ["id"],
                                    where: {"section_name": classSection, "schoolId":schoolId},
                                }, options, function (err, ClassArr) {
                                    if(err){
                                        tx.rollback(function(err){});
                                        cb(null, "Error Occured section find "+err);
                                    }else{
                                        if(ClassArr == null){
                                            var sectionArr = {
                                                "section_name" : classSection,
                                                "class_name" : className,
                                                "class_order" : 1,
                                                "stream_name" : "GENERAL",
                                                "section_seats" : 50,
                                                "schoolId" : schoolId,
                                                "section" : batchName
                                            };
                                            Section.create(sectionArr, options, function(err ,response){
                                                if(err){
                                                    tx.rollback(function(err){});
                                                    cb(null, "Error Occured section create "+err);
                                                }else{
                                                    var sectionId = response.id;
                                                    Subject.find({
                                                        where: {"schoolId": schoolId},
                                                    }, options, function (err, subjectData) {
                                                        if (err) {
                                                            tx.rollback(function(err){});
                                                            cb(null, "Error Occured subject find "+err);
                                                        }else{
                                                            
                                                            subjectData.forEach(function(subject){
                                                                var subjectId = subject.id;
                                                                var classsubjectArr = {
                                                                    "sectionId" : sectionId,
                                                                    "subjectId" : subjectId,
                                                                    "subject_type" : 'Main',
                                                                    "sessionId" : sessionData.id,
                                                                    "subject_code" : subject.subject_code,
                                                                    "status" : 'Active',
                                                                    "schoolId":schoolId,
                                                                    "created_date" : currentDates
                                                                };
                                                                Classsubject.create(classsubjectArr, options, function(err, response){
                                                                    if (err) {
                                                                        tx.rollback(function(err){});
                                                                        cb(null, "Error Occured classsubject create "+err);
                                                                    }
                                                                });
                                                            });
                                                            
                                                            
                                                            batchAssignDetail.forEach(function(batchUser){
                                                                var userId = batchUser.tle_user_id;
                                                                var subjectName = batchUser.subject_name;
                                                                
                                                                Userschool.findOne({
                                                                    where: {"userId": userId, "schoolId":schoolId}
                                                                }, options, function (err, schoolData) {
                                                                    if(err){
                                                                        tx.rollback(function(err){});
                                                                        cb(null, "Error Occured user school find "+err);
                                                                    }else{
                                                                        if(schoolData == null){
                                                                            var userSchoolRequest = {"userId":userId, "schoolId": schoolId, "user_type": 'Teacher', "created_date": currentDates};
                                                                            Userschool.upsert( userSchoolRequest, options, function (err) {
                                                                                tx.rollback(function(err){});
                                                                                cb(null, "Error Occured user school create "+err); 
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                
                                                                var userSectionArr = {
                                                                    "userId" : userId,
                                                                    "sectionId" : sectionId,
                                                                    "sessionId" : sessionData.id,
                                                                    "class_teacher" : 'No',
                                                                    "user_type" : "Teacher",
                                                                    "roll_no" : 0,
                                                                    "status" : 'Active',
                                                                    "schoolId":schoolId
                                                                };
                                                                Usersection.create(userSectionArr, options, function(err, result){
                                                                    if(err){
                                                                        tx.rollback(function(err){});
                                                                        cb(null, "Error Occured user section create "+err);
                                                                    }
                                                                });
                                                                
                                                                Subject.findOne({
                                                                    where: {"schoolId": schoolId,"subject_name":subjectName},
                                                                }, options, function (err, assignedSubject) {
                                                                    if (err) {
                                                                        tx.rollback(function(err){});
                                                                        cb(null, "Error Occured subject again find "+err);
                                                                    }else{
                                                                        var subjectId = assignedSubject.id;
                                                                        if(subjectId){
                                                                            Classsubject.findOne({
                                                                                where: {sectionId: sectionId, subjectId: subjectId, schoolId:schoolId, sessionId:sessionData.id}
                                                                            }, options, function (err, subjectClass){
                                                                                if(err){
                                                                                    tx.rollback(function(err){});
                                                                                    cb(null, "Error Occured class subject find "+err);
                                                                                }else{
                                                                                    subjectClass = null;
                                                                                    if(subjectClass!=null){
                                                                                        var classSubjectId = subjectClass.id;
                                                                                        var userSubjectArr = {
                                                                                            "userId" : userId,
                                                                                            "sessionId" : sessionData.id,
                                                                                            "sectionId" : sectionId,
                                                                                            "subjectId" : subjectId,
                                                                                            "status" : 'Active',
                                                                                            "schoolId" : schoolId,
                                                                                            "user_type" : "Teacher",
                                                                                            "created_date" : currentDates,
                                                                                            "class_subjectId" : classSubjectId
                                                                                        };
                                                                                        Usersubject.upsert(userSubjectArr, options, function (err, result) {
                                                                                            if (err) {
                                                                                                tx.rollback(function(err){});
                                                                                                cb(null, "Error Occured user subject create "+err);
                                                                                            } else {
                                                                                                successMessage.responseCode = "200";
                                                                                                successMessage.tle_batch_id = sectionId;
                                                                                                successMessage.responseMessage = "Added Successfully ";

                                                                                                tx.commit(function(err){});
                                                                                                cb(null,successMessage,sectionId,'200');
                                                                                            }
                                                                                        });
                                                                                    }else{
                                                                                        tx.rollback(function(err){});
                                                                                        cb(null, "Error Occured class subject id is null"+err);
                                                                                    }
                                                                                }
                                                                            });
                                                                            
                                                                        }
                                                                    }
                                                                });
                                                                
                                                            });
                                                            
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                        
                    });
                }
            }
        });
        
    };
    
    Section.remoteMethod(
        'batch',
        {
            http: {path: '/batch', verb: 'post'},
            description: 'Get Section by schoolid and name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'},{arg: 'tle_batch_id', type: 'json'},{arg: 'responseCode', type: 'json'}]
        }
    );

};