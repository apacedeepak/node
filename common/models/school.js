'use strict';
var dateFormat = require('dateformat');
var constantval = require('./constant');
var request = require('request');
var serialize = require("php-serialization").serialize;
var Class = require("php-serialization").Class;
var unserialize = require("php-serialization").unserialize;

module.exports = function (School) {
    School.addschool = function (data, cb) {
        School.upsert(data, function (err, school) {
            if(err){
                return cb(null, err);
            }
            return cb(null, school);
        });

    };

    School.schoollist = function (cb) {
        School.find({
            where: {status: 'Active'},
            include: {relation: "has_many_sessions"}
        }, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });

    };

    School.schooldetail = (data, cb) => {  
        let conditions={};
        if(!data.allstatus){  
            conditions.status="Active";          
        }    
        School.findById(data.school_id,{
          include: [{
              relation: "has_many_sessions",
              scope:{
                where:conditions
              }
            },
            {
                relation: "school_have_contact_users",
                scope:{
                    where:{status:"Active"},
                    include: {
                        relation: "staff",
                    }
                }
            }
        ]
            },(err, result)=>{
             return cb(null, result);
        });
    };
    
    School.centercreate = (req, cb) => {
        var Session = School.app.models.session;
        var Subject = School.app.models.subject;
        var classObj = School.app.models.class;

        var schoolId           =  req.school_id;
        var schoolCode         =  req.school_code;
        var schoolName         =  req.school_name;
        var schoolAddress      =  req.school_address;
        var schoolPin          =  req.school_pin;
        var affiliationNo      =  req.affiliation_no;
        var schoolLogo         =  req.school_logo;
        var schoolEmail        =  req.school_email;
        var phone              =  req.phone;
        var principalName      =  req.principal_name;
        var schoolAcronym      =  req.school_acronym;


        var errorMessage = {};
        var successMessage = {};

        var today = new Date();
        var currentDates = dateFormat(today, "yyyy-mm-dd");
        var year = dateFormat(today, "yyyy");
        var nextYear = Number(year) + Number('1');


//        request.post({
//            headers: {'content-type' : 'application/json'},
//            url:     constantval.LOCAL_URL+'/'+constantval.PROJECT_NAME+'/erpapi/index/centercreate',
//            json:    req
//         }, function(error, response, body){
//
//            if(error){
//                console.log('Error while notification')
//            }
//            else
//            {
//                if(body.responseCode == '200')
//                {

                    School.schooldetail({ "school_id": schoolId}, function (err, schooldetails) {
                        if(err){ return cb(null, err); }
                        if(schooldetails == null){
                            var schoolRequest = {
                                "id":schoolId,
                                "school_id":schoolId,
                                "country_id": '110',
                                "school_code": schoolCode,
                                "school_name": schoolName,
                                "school_address": schoolAddress,
                                "school_pin": schoolPin,
                                "affiliation_no": affiliationNo,
                                "school_logo":  schoolLogo,
                                "school_email": schoolEmail,
                                "status": 'Active',
                                "contact_no": phone,
                                "school_master_id": schoolId,
                                "principal_name": principalName,
                                "school_acronym": schoolAcronym
                            };

                            School.create(schoolRequest, function (err, school) {
                                if(err){
                                    return cb(null, err);
                                }else{
                                    var school_auto_id = school.id;
                                    Session.getactiveschoolsession( schoolId, function (err, sessionData) {

                            if(err){
                                return cb(null, err);
                            } else{

                                if(sessionData == null){
                                    var sessionObj = {
                                        "schoolId" : schoolId,
                                        "session_name" : year+"-"+nextYear,
                                        "start_date" :year+"-04-01",
                                        "end_date" : nextYear+"-03-31",
                                        "status" : "Active"
                                    };

                                    Session.upsert(sessionObj, function (err, session) {
                                        if(err){
                                            return cb(null, err);
                                        }else{

                                            School.getSubject().then(function(subjectData){
                                                subjectData.forEach(function(subject){

                                                    var subjectArr = {
                                                        "subject_name" : subject.subject_name,
                                                        "subject_abbriviation" : subject.subject_abbriviation,
                                                        "subject_icon" : subject.subject_icon,
                                                        "subject_order" : subject.subject_order,
                                                        "subject_code" : subject.subject_code,
                                                        "source" : subject.source,
                                                        "status" : subject.status,
                                                        "schoolId":schoolId,
                                                        "created_date" : currentDates
                                                    };

                                                        Subject.createsubject(subjectArr, function(err, response){});
                                                });
                                            });
                                            
                                            School.getClass().then(function(classData){
                                                classData.forEach(function(classes){

                                                    var classArr = {
                                                        "class_name" : classes.class_name,
                                                        "class_code" : classes.class_code,
                                                        "class_order" : classes.class_order,
                                                        "status" : 1,
                                                        "schoolId":schoolId,
                                                        "added_date" : currentDates
                                                    };

                                                    classObj.create(classArr, function(err, response){});
                                                });
                                            });

                                                    successMessage.status = '200';
                                                    successMessage.school_id = schoolId;
                                                    successMessage.message = "Added Successfully.";
                                                    cb(null,successMessage,schoolId,'200');
                                                    }
                                                });
                                            }else{
                                                errorMessage.status = '201';
                                                errorMessage.message = "session already exist.";
                                                cb(null,errorMessage);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });

//                }else{
//                    errorMessage.status = '201';
//                    errorMessage.message = "Error Occured.";
//                    cb(null,errorMessage);
//                }
//            }
//
//         });


    };

    School.getSubject = function()
    {
        var Subject = School.app.models.subject;

        return new Promise(function(resolve,reject){
            School.getsingleschool(function (err, subjectDetail) {
                if(err){
                    return cb(null, err);
                }else{
                    var preSchoolId = subjectDetail.id;
                    Subject.getschoolsubjects( preSchoolId, function (err, subjectData) {
                        if(err){
                            return cb(null, err);
                        }
                        resolve(subjectData);
                    })
                }
            });
        });
    }
    
    
    School.getClass = function()
    {
        var classObj = School.app.models.class;

        return new Promise(function(resolve,reject){
            School.getsingleschool(function (err, schoolDetail) {
                if(err){
                    return cb(null, err);
                }else{
                    var preSchoolId = schoolDetail.id;
                    classObj.getschoolclass( preSchoolId, function (err, classData) {
                        if(err){
                            return cb(null, err);
                        }
                        resolve(classData);
                    })
                }
            });
        });
    }

    School.remoteMethod(
            'addschool',
            {
                http: {path: '/addschool', verb: 'post'},
                description: 'Add school',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    School.remoteMethod(
            'schoollist',
            {
                http: {path: '/schoollist', verb: 'post'},
                description: 'school list',
                returns: {arg: 'response', type: 'json'}
            }
    );

    School.remoteMethod(
            'schooldetail',
            {
                http: {path: '/schooldetail', verb: 'post'},
                description: 'school by id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    School.schooldetailbyoldschoolid = (data, cb)=>{
          School.find({
            where: {id: data.school_id},
          },(err, res)=>{
            cb(null, res)
          });
    }

    School.remoteMethod(

            'schooldetailbyoldschoolid',
            {
                http: {path: '/schooldetailbyoldschoolid', verb: 'post'},
                description: 'school by id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    School.remoteMethod(
        'centercreate',
        {
            http: {path: '/centercreate', verb: 'post'},
            description: 'Create Center',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'},{arg: 'school_id', type: 'json'},{arg: 'responseCode', type: 'json'}]
        }
    );

    School.getsingleschool = function (cb) {
        School.findOne({
            where: {status: 'Active'},
            order: 'id DESC',
            limit: 1
        }, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });
    };
    School.remoteMethod(
        'getsingleschool',
        {
            http: {path: '/getsingleschool', verb: 'post'},
            description: 'Get Single School Id',
            returns: {arg: 'response', type: 'json'}
        }
    );

    School.schoolprofile = function (data, cb) {
        School.findOne({
            where: {status: 'Active', school_id: data.school_id},
            order: 'id DESC'
        }, function (err, result) {
            if (err) {
                console.error("Some error occurred", err);
            } else { 
                cb(null, result);
            }
        });
    };
    School.remoteMethod(
        'schoolprofile',
        {
            http: {path: '/schoolprofile', verb: 'post'},
            description: 'Create Center',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response', type: 'json'}]
        }
    );
    School.getcenterbycity = (data, cb)=>{
        let msg={}
        if(!data.city){
            msg.status = '201';
            
            msg.message = "city Cannot be empty";
            cb(null,msg);
        }
        School.find({
          where: {state: data.state,city:data.city},
        },(err, res)=>{
            console.log(res)
          cb(null, res)
        });
  }

  School.remoteMethod(

          'getcenterbycity',
          {
              http: {path: '/getcenterbycity', verb: 'post'},
              description: 'school by city',
              accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
              returns: {arg: 'response', type: 'json'}
          }
  );

  /*
  * Add Center Master
  */ 

  School.addcenter = (ctx, options, cb)=>{
    var FileUpload = School.app.models.fileupload;
    var userSchoolObj =  School.app.models.user_school;
    var academicSessObj = School.app.models.academic_session_master;
    var sessionObj = School.app.models.session;

    var errorMessage = {};
    var successMessage = {};
    var centerArr = {};
    var staffArr = {};

    FileUpload.fileupload(ctx, options, 'center', function (err, data) {
        if(data.status != undefined && (data.status == '201'|| data.status == '000'))
        {
            errorMessage.status = data.status;
            errorMessage.message = data.message;
            return cb(null,errorMessage);
        }
        
        // var c = new Class();
        // for (var m = 0; m < data.file_path.length; m++) {
            
        //     c.__addAttr__(m, "integer", data.file_path[m], "string");
        // }
        // var filepath = '';
        // if (data.file_path.length > 0){
        //     filepath = serialize(c, "array");
        // }
        var filepath = data.file_path[0];
        centerArr.school_id = 1;
        centerArr.school_name = data.center_name;
        centerArr.school_code = data.center_code;
        centerArr.school_acronym = data.center_code;
        centerArr.state = data.state;
        centerArr.city = data.city;
        centerArr.school_address = data.address;
        centerArr.contact_no = data.mobile;
        centerArr.status = "Active";
        centerArr.school_logo = filepath;
        centerArr.gstin_no = data.gstin_no;
        centerArr.school_email = data.school_email;
        
        if(data.id){
            delete centerArr.state;
            delete centerArr.city;
            if(!filepath){
                centerArr.school_logo = data.image_path;    
            }
            centerArr.id = data.id;
            School.upsert(centerArr, function (err, result) {
                if(err){ return cb(null, err); }
                successMessage.status = "200";
                successMessage.message = "Updated Successfully.";
                successMessage.detail = result;
                return cb(null, successMessage);
            });
        }else{
            School.upsert(centerArr, function (err, result) {
                if(err){ return cb(null, err); }
                
                if(result.id){
                    academicSessObj.getactivefuturesession(function(err, sessionArr){
                        if(err){ return cb(null, err); }
                        if(sessionArr){
                            sessionArr.forEach(session => {
                                if(session.status == 1){
                                    var status = "Active";
                                }else{
                                    var status = "Inactive";
                                }
                                var requestObj = {
                                    schoolId : result.id,
                                    session_id : session.id,
                                    session_name : session.session_name,
                                    start_date : session.start_date,
                                    end_date : session.end_date,
                                    status : status
                                }
                                sessionObj.createsession(requestObj, function(err, sessionResponse){
                                    if(err){ return cb(null, err); }
                                });
                            });
                            successMessage.status = "200";
                            successMessage.message = "Center Added Successfully";
                            successMessage.detail = result;
                            return cb(null, successMessage);
                        }
                    });
                    School.insertCenterClass(result.id);
                }
            });
        }   
    });
  }

  School.insertCenterClass = (schoolId) => {
    let classObj = School.app.models.class;
    var today = new Date();
    var currentDates = dateFormat(today, "yyyy-mm-dd");
    classObj.getclassnullschoolid((err, classArr) => {
        if(classArr.length > 0 ){
            classArr.forEach(classVal => {
                let param = {"school_id":schoolId, "class_name": classVal.class_name};
                classObj.schoolwiseclasscheck(param, (err, classExist) => {
                    if(classExist.length <= 0){
                        let params = {
                            "boardId" : classVal.boardId,
                            "classId" : classVal.classId,
                            "class_name": classVal.class_name,
                            "status" : "Active",
                            "added_by": classVal.added_by,
                            "added_date": currentDates,
                            "schoolId" : schoolId
                        };
                        
                        classObj.upsert(params, (err, res) => {
                            if (err) { return cb(null, err);}
                        });
                    }
                });
            });
        }
    });
}

  School.remoteMethod(
      'addcenter',
      {
        accepts: [
            {arg: 'ctx', type: 'object', http: {source: 'context'}},
            {arg: 'options', type: 'object', http: {source: 'query'}},
        ],
        returns: {
            arg: 'fileObject', type: 'object', root: true
        },
        http: {verb: 'post'}
    }
  );


    School.getallschoollist = function (cb) {
        School.find({
            where: {status: 'Active'},
            order : 'id DESC',
            include:{
                relation: "school_have_contact_users",
                scope:{
                    where:{status:"Active"},
                    include: {
                        relation: "staff",
                    }
                }
            }
        }, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });
    };

    School.remoteMethod(
        'getallschoollist',
        {
            http: {path: '/getallschoollist', verb: 'post'},
            description: 'School list',
            returns: {arg: 'response', type: 'json'}
        }
    );

    School.getschoolbystaffcode = function (data, cb) {
        School.find({
            where: {school_code: data.school_code}
        }, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });
    };
    
    School.remoteMethod(
        'getschoolbystaffcode',
        {
            http: {path: '/getschoolbystaffcode', verb: 'post'},
            description: 'School list',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

};
