'use strict';
var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe')
var request = require('request');
var rp = require('request-promise');
var fs = require('fs');
var constantval = require('./constant');
var local_url = constantval.LOCAL_URL;
var local_port = constantval.LOCAL_PORT;
var Class = require("php-serialization").Class;
var serialize = require("php-serialization").serialize;
var unserialize = require("php-serialization").unserialize;
module.exports = function (Studyplan) {

    Studyplan.createstudyplan = function (ctx, options, cb) {
        return new Promise(function (resolve, reject) {
        var FileUpload = Studyplan.app.models.fileupload;
          var msg = {};

     
        FileUpload.fileupload(ctx, options, 'studyplan', function (err, data) {
           if(data.status!=undefined && (data.status=='201' || data.status=='000'))
                    {
                            msg.status = data.status;
                            msg.message = data.message;
                            cb(null, msg);
                    }else{
                        
                        if(data.id == "")
                                {
                                    if(data.section_id == "")
                                        {
                                            msg.status = '201';
                                            msg.message = "Request cannot be blank";
                                            cb(null, msg);
                                            return;  
                                        } 
                                    if(data.subject_id == "")
                                        {
                                            msg.status = '201';
                                            msg.message = "Request cannot be blank";
                                            cb(null, msg);
                                            return;  
                                        }
                                }

                            var c = new Class();
                            var filepath = '';
                            if (data.file_path.length > 0) {
                                for (var m = 0; m < data.file_path.length; m++) {
                                    c.__addAttr__(m, "integer", data.file_path[m], "string");
                                }
                                filepath = serialize(c, "array");
                            }
                        
 
                           if(data.id == "")
                                {
                            var studyplanData = {};
                            studyplanData.sectionId = data.section_id;
                            studyplanData.subjectId = data.subject_id;
                            studyplanData.attachments = filepath;
                            studyplanData.sessionId  = data.session_id;
                            studyplanData.schoolId = data.schoolId;
                            studyplanData.status = 'Active';
                            studyplanData.userId = data.user_id;
                            studyplanData.classId = data.class_id;
                            studyplanData.created_date = dateFormat(new Date(), "isoDate");
                            studyplanData.modified_date = dateFormat(new Date(), "isoDate");
                            
                                }else{
                                         var studyplanData = {};
                                         studyplanData.id = data.id;
                                         studyplanData.attachments = filepath;
                                }
                              Studyplan.upsert(studyplanData, function (err, response) {
                                    if (err) {
                                        msg.status = '201';
                                            msg.message = "Error Occurred";
                                            cb(null, msg);
                                    }
                                    // var attch = [];
                                    var DataUnserileRst = unserialize(response.attachments);
                                    var attch = DataUnserileRst.__attr__;
                                    // for (var key in DataUnserileRst.__attr__) {
                                    //     attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);
                                    // }
                                    if(data.id == ""){
                                    msg.status = '200';
                                    msg.message = "study plan created successfully";
                                    msg.attachments = constantval.PROJECT_NAME +"/"+attch[0].val;
                                    return cb(null, msg);
                                    }else{
                                    msg.status = '200';
                                    msg.message = "study plan update Successfully";
                                    return cb(null, msg);  
                                    }
                            });
                    } 
             });
                  });
    };


    Studyplan.getstudyplanlist = function (data, cb) {
          var errorMessage = {};
         if (!data) {
            errorMessage.status = '201';
            errorMessage.message = "Request cannot be blank";
            cb(null, errorMessage);
            return;
        }
        
        if(!data.section_id){
            data.section_id = undefined;
        }
        if(!data.class_id){
            data.class_id = undefined;
        }
        if(!data.subject_id){
            data.subject_id = undefined;
        }
        
        var sectionId = data.section_id;
        var subjectId = data.subject_id;
        var sessionId = data.session_id;
        var where_cond = {};
        var successMessage = {};
      
        var msg = {};
        var token = data.token;
        
           Studyplan.find({
            where: {userId: data.user_id,
                    classId: data.class_id,
                    sectionId:data.section_id,
                    subjectId: data.subject_id,
                    sessionId: data.session_id
                },
            include : [{
                    relation : "assigned_sections",
                      scpoe: {
                    fields: ["section_name"]
                }
            },
            {
                relation: 'belgons_to_subject',
                scpoe: {
                    fields: ["subject_name"],
                }
            }]
            }, 
          function (err, res) {
               if(err)
                    {
                            errorMessage.status = '201';
                            errorMessage.message = "Error Occurred";
                            cb(null, msg);
                    }else{
                      
                    var responseArray = [];
                    var subjectArray = [];
                    var responseObj = {};
                    res.forEach(function (data) {
                        data = data.toJSON();
                        let subjectname = data.belgons_to_subject.subject_name;
                        let attch = [];
                        var DataUnserileRst = unserialize(data.attachments);
                        for (var key in DataUnserileRst.__attr__) {
                            attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);
                        }
                        // responseObj = {};
                        //  var attch = [];
                        // responseObj.schoolId = data.schoolId;
                        // responseObj.section_name = data.assigned_sections.section_name;
                        // responseObj.subject_name = data.belgons_to_subject.subject_name;
                        // responseObj.sessionId = data.sessionId;
                        // responseObj.sectionId = data.sectionId;
                        // responseObj.subjectId = data.subjectId;
                        // responseObj.id = data.id;
                        // var DataUnserileRst = unserialize(data.attachments);
                        // for (var key in DataUnserileRst.__attr__) {
                        //     attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);
                        // }
                        // responseObj.attachments = attch;
                        // responseObj.status = data.status;
                        // responseObj.created_date = dateFormat(data.created_date,"yyyy-mm-dd HH:MM:ss");
                        // responseObj.modified_date = data.modified_date;
                        // responseArray.push(responseObj);

                        if(responseArray.indexOf(subjectname) == -1){

                            subjectArray.push({
                                [subjectname]: [{
                                "id" : data.id,
                                "schoolId": data.schoolId,
                                "sectionName": data.assigned_sections.section_name,
                                "subjectName": data.belgons_to_subject.subject_name,
                                "sessionId": data.sessionId,
                                "sectionId": data.sectionId,
                                "subjectId": data.subjectId,
                                "attachments":attch,
                                "status":data.status,
                                "createdDate":dateFormat(data.created_date,"yyyy-mm-dd HH:MM:ss"),
                                "modifiedDate":dateFormat(data.modified_date,"yyyy-mm-dd"),
                            }]
                            });

                           responseArray.push(subjectname);

                        }else{
                            let subjectIndex = responseArray.indexOf(subjectname);
                           for(let k in subjectArray[subjectIndex]){
                               subjectArray[subjectIndex][k].push({
                                "id" : data.id,  
                                "schoolId": data.schoolId,
                                "sectionName": data.assigned_sections.section_name,
                                "subjectName": data.belgons_to_subject.subject_name,
                                "sessionId": data.sessionId,
                                "sectionId": data.sectionId,
                                "subjectId": data.subjectId,
                                "attachments":attch,
                                "status":data.status,
                                "createdDate":dateFormat(data.created_date,"yyyy-mm-dd HH:MM:ss"),
                                "modifiedDate":dateFormat(data.modified_date,"yyyy-mm-dd"),

                            })

                           }
                        }
                    })
                    responseObj.data = subjectArray;
                       successMessage.status = '200';
                       successMessage.message = "Study plan fetched successfully";
                    cb(null, successMessage,responseObj);
                    }
        });
    };

    Studyplan.studyplanlist = function (data, cb) {
          var errorMessage = {};
         if (!data) {
            errorMessage.status = '201';
            errorMessage.message = "Request cannot be blank";
            cb(null, errorMessage);
            return;
        }
        var sessionId = data.session_id;
        var successMessage = {};
      
        var msg = {};
        var token = data.token;
      
          Studyplan.find({where: {status: 'Active'}, 
            include : [{
                relation: 'belgons_to_subject',
                scpoe: {
                    fields: ["subject_name"],
                }
            }]
          }, 
        function (err, res) {
           
               if(err)
                    {
                            errorMessage.status = '201';
                            errorMessage.message = "Error Occurred";
                            cb(null, msg);
                    }else{
                    
                     let studyArr = [];
                     let subjectArr = [];
                     var responseArray = [];
                     var responseObj = {};
                     let count = res.length - 1 ;
                    let  attch=[];
                     
                         for(let key in res){
                            var DataUnserileRst=unserialize(res[key].attachments);
                            for (var keys in DataUnserileRst.__attr__) {

                                attch=constantval.LOCAL_URL+'/'+ constantval.PROJECT_NAME +'/' + DataUnserileRst.__attr__[keys].val;
                              
                            }
                        let subject_name = res[key].belgons_to_subject().subject_name;
                        
                        if(subjectArr.indexOf(subject_name) == -1){

                            studyArr.push({
                                [subject_name]: [{
                                "schoolId": res[key].schoolId,
                                "sessionId": res[key].sessionId,
                                "id": res[key].id,
                                "attachments": attch,
                                "status": res[key].status,
                                "created_date": res[key].created_date,
                                "classId":res[key].classId,
                                "sectionId":res[key].sectionId
                            }]
                            });
                           subjectArr.push(subject_name);

                            }else{
                                let subjectname = subjectArr.indexOf(subject_name);
                            for(let k in studyArr[subjectname]){
                                studyArr[subjectname][k].push({
                                        "schoolId": res[key].schoolId,
                                        "sessionId": res[key].sessionId,
                                        "id": res[key].id,
                                        "attachments":attch,
                                        "status": res[key].status,
                                        "created_date":res[key].created_date,
                                        "classId":res[key].classId,
                                        "sectionId":res[key].sectionId
                                })
                                }
                       
                            }
                       
                        if(key  == count ){
                         
                             successMessage.status = '200';
                            successMessage.message = "Study plan fetched successfully";
                           return cb(null, successMessage,studyArr);
                           
                        }
                           
                        } 
                        
                       console.log(studyArr); 
                    // res.forEach(function (data) {
                    //     data = data.toJSON();
                    //     responseObj = {};
                    //      var attch = [];
                    //     responseObj.schoolId = data.schoolId;
                    //     responseObj.sessionId = data.sessionId;
                    //     responseObj.subject_name = data.belgons_to_subject.subject_name;
                    //     responseObj.id = data.id;
                    //     var DataUnserileRst = unserialize(data.attachments);
                    //     for (var key in DataUnserileRst.__attr__) {
                    //         attch.push(constantval.PROJECT_NAME + "/" + DataUnserileRst.__attr__[key].val);
                    //     }
                    //     responseObj.attachments = attch;
                    //     responseObj.status = data.status;
                    //     responseObj.created_date = data.created_date.toISOString().replace('Z', '').replace('T', ' ').replace('.000','');
                    //     responseArray.push(responseObj);
                    // })
                      
                   
                    }
        });
    };
   Studyplan.timetable = function(req,cb)
   {
    var errorMessage = {};
    var successMessage = {};
     if (!req.userType) {
      errorMessage.status = "201";
      errorMessage.message = "User Type can't blank";
      return cb(null, errorMessage);
    }
    if (req.userType.toLowerCase()=='teacher') {
        if (!req.olduserId)
            {
            errorMessage.status = "201";
            errorMessage.message = "Teacher user id can't blank";
            return cb(null, errorMessage);
            }
    }
         if (req.userType.toLowerCase()=='student' || req.userType.toLowerCase()=='parent') {
        if (!req.classSection)
            {
            errorMessage.status = "201";
            errorMessage.message = "Class Section can't blank";
            return cb(null, errorMessage);
            }
    }
                var url = '';
                if(req.userType.toLowerCase()=='student' || req.userType.toLowerCase()=='parent')
                    {
                        url = '/erpapi/index/studenttimetable/filename/'+req.classSection+'/flag/classtimetable';
                        
                    }
                    if(req.userType.toLowerCase()=='teacher')
                    {
                       url = '/erpapi/index/studenttimetable/filename/'+req.olduserId+'/flag/stafftimetable'; 
                       
                    }
                var options = {
                    method: 'get',
                    uri: constantval.LOCAL_URL + '/'+constantval.PROJECT_NAME+url,
                   
                  };
                   rp(options)
        .then(function (response) {
            response = JSON.parse(response);
            // console.log(response);
         if(response.responseCode=="200")
            {
             successMessage.status = "200";   
             successMessage.message = "File Exist";
             var responseobj = {};
             responseobj.filepath = response.filepath;
             return cb(null, successMessage,responseobj);
            }
             else if(response.responseCode=="000")
            {
             successMessage.status = "200";   
             successMessage.message = "File Does not Exist";
              var responseobj = {};
             responseobj.filepath = '';
             return cb(null, successMessage,responseobj);
            }
        }).catch(function(error){
            errorMessage.status = "201";
            errorMessage.message = "error occured";
            return cb(null, errorMessage);

        })
   }


    Studyplan.remoteMethod(
        'studyplanlist',
        {
            http: { path: '/studyplanlist', verb: 'post' },
            description: 'get study plan list of student base',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'successMessage', type: 'json' },{ arg: 'response', type: 'json' }]
        }
    );

    Studyplan.deletestudyplan = function(data,cb){
          var errorMessage = {};
          var successMessage = {};
            Studyplan.destroyById(data.id, 
            function(err, res) {
            if (err) {
            // throw err;
             errorMessage.status = "201";
             errorMessage.message = "User Type can't blank";
             return cb(null, errorMessage);
            }
            successMessage.status = '200';
            successMessage.message = "Study plan delete successfully";
            cb(null,successMessage);
            })
    }

    Studyplan.remoteMethod(
        'deletestudyplan',
        {
            http: { path: '/deletestudyplan', verb: 'post' },
            description: 'group id to a group delete',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'successMessage', type: 'json' },{ arg: 'response', type: 'json' }]
        }
    );

      Studyplan.remoteMethod(
        'getstudyplanlist',
        {
            http: { path: '/getstudyplanlist', verb: 'post' },
            description: 'group id to a group delete',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'successMessage', type: 'json' },{ arg: 'response', type: 'json' }]
        }
    );

    Studyplan.remoteMethod(
        'createstudyplan',
        {
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } },
                { arg: 'options', type: 'object', http: { source: 'query' } },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: { verb: 'post' }
        }
    );

    Studyplan.remoteMethod(
        'timetable',
        {
            http: { path: '/timetable', verb: 'post' },
            description: 'API for get timetable of user',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{arg: 'response_status', type: 'json'},{arg: 'response', type: 'json'}]
        }
    );

};
