'use strict';
var dateFormat = require('dateformat');
module.exports = function(Userfeedback) {
    Userfeedback.addFacultyFeedback = (data, cb)=>{        
        var today = new Date();
        var errorMessage = {};
        var successMessage = {}; 
        var feedbackJsonArr=[
            {"feedbackparams":'Knowledge Of Subject',"feedbackparamvalue":data.knowledgeOfSubject},
            {"feedbackparams":'Concept delivery',"feedbackparamvalue":data.conceptDelivery},
            {"feedbackparams":'Doubt solving ability',"feedbackparamvalue":data.doubtSolvingAbility},
            {"feedbackparams":'Post test discussion',"feedbackparamvalue":data.postTestDiscussion},
            {"feedbackparams":'Pace of topic coverage',"feedbackparamvalue":data.paceOfTopicCoverage},
            {"feedbackparams":'Discipline in class',"feedbackparamvalue":data.disciplineInClass},
            {"feedbackparams":'Communication Skills',"feedbackparamvalue":data.communicationSkills},
            {"feedbackparams":'Motivational Skills',"feedbackparamvalue":data.motivationalSkills}
        ];    
        var finalFeedbackJson={
            "feedback_type":"Faculty",
            "subject_id":data.studentsubject,
            "faculty_id":data.subjectfaculty,
            "feedbackJsonArr":feedbackJsonArr
        };           
        var insertObj = {
            "user_id": data.user_id,
            "feedback_type":data.feedback_type,
            "feedback_for_id":data.subjectfaculty,
            "feedback_subject_id":data.studentsubject,
            "feedback_json":JSON.stringify(finalFeedbackJson),
            "feedback_date":dateFormat(today, "yyyy-mm-dd HH:MM:ss"),
            "status":1
        }
    
        Userfeedback.create(insertObj, function (err, res) {
          if (err) {
            errorMessage.status = '201';
            errorMessage.message = "Error Occurred";
            return cb(err, errorMessage);
          }
          successMessage.status = "200";
          successMessage.message = "Feedback added successfully";
          successMessage.detail = res;
          return cb(null, successMessage);
        });
   
      }
      Userfeedback.remoteMethod(
        'addFacultyFeedback',        
            {
                http: {path: '/addFacultyFeedback', verb: 'post'},
                description: 'Add feedback',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
      );
      Userfeedback.addAdministartionFeedback = (data, cb)=>{        
        var today = new Date();
        var errorMessage = {};
        var successMessage = {}; 
        var feedbackJsonArr=[
            {"feedbackparams":'Classroom',"feedbackparamvalue":data.classroom},           
            {"feedbackparams":'Staff',"feedbackparamvalue":data.staff},
            {"feedbackparams":'Transportation',"feedbackparamvalue":data.transportation},
            {"feedbackparams":'Washroom',"feedbackparamvalue":data.washroom},
            {"feedbackparams":'Others',"feedbackparamvalue":data.others}          
        ];       
        var finalFeedbackJson={
            "feedback_type":"Administartion",
            "feedbackJsonArr":feedbackJsonArr
        };           
        var insertObj = {
            "user_id": data.user_id,
            "feedback_type":data.feedback_type,
            "feedback_for_id":1,
            "feedback_json":JSON.stringify(finalFeedbackJson),
            "feedback_date":dateFormat(today, "yyyy-mm-dd HH:MM:ss"),
            "status":1
        }
    
        Userfeedback.create(insertObj, function (err, res) {
          if (err) {
            errorMessage.status = '201';
            errorMessage.message = "Error Occurred";
            return cb(err, errorMessage);
          }
          successMessage.status = "200";
          successMessage.message = "Feedback added successfully";
          successMessage.detail = res;
          return cb(null, successMessage);
        });
   
      }
      Userfeedback.remoteMethod(
        'addAdministartionFeedback',        
            {
                http: {path: '/addAdministartionFeedback', verb: 'post'},
                description: 'Add feedback',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
      );
      Userfeedback.addCoureseFeedback = (data, cb)=>{        
        var today = new Date();
        var errorMessage = {};
        var successMessage = {}; 
        Userfeedback.beginTransaction('READ COMMITTED', function (err, tx) { 
          try {        
            var options = {
              transaction: tx
            };       
        for (var i = 0; i < data.subjectIds.length; i++) { 
            var feedbackJsonArr={"coverageOfBoardSyllabus":data.boardSyllabusFeedback[i],"qualityOfCourseContent":data.qualityCourseFeedback[i]};                    
            var finalFeedbackJson={
                "feedback_type":"Course",
                "feedbackJsonArr":feedbackJsonArr
            };           
            var insertObj = {
                "user_id": data.user_id,
                "feedback_type":data.feedback_type,
                "feedback_for_id":data.subjectIds[i],
                "feedback_json":JSON.stringify(finalFeedbackJson),
                "feedback_date":dateFormat(today, "yyyy-mm-dd HH:MM:ss"),
                "status":1
            }   
            Userfeedback.create(insertObj,options,function (err, res) {
                if (err) {
                  errorMessage.status = '201';
                  errorMessage.message = "Error Occurred";
                  return cb(err, errorMessage);
                }                
              });            
          }  
          tx.commit(function (err) {
            if(err) {
              msg.status = "401";
              msg.message="Error Occurred";
              cb(err,msg,null);
          }else{
            successMessage.status = "200";
            successMessage.message = "Feedback added successfully";          
            return cb(null, successMessage);
          }
          });
          
        } catch (error) {
          tx.rollback(function (err) { });
          errorMessage.status = '201';
          errorMessage.message = "Error Occurred";
          return cb(null, errorMessage);
        }
        });
   
      }
      Userfeedback.remoteMethod(
        'addCoureseFeedback',        
            {
                http: {path: '/addCoureseFeedback', verb: 'post'},
                description: 'Add feedback',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
      );

      Userfeedback.getFacultyFeedback = function (data, cb) {  
        var where_condition = {};    
        let where_cond= { "user_id": data.user_id,"feedback_subject_id":data.subjectId,"feedback_for_id": data.facultyId, "feedback_type": data.feedback_type, "status": 1 };
        where_condition = {
          and: [
            {
              feedback_date: {
                gte: dateFormat(data.fromCurrentMonthDate, "isoDate")
              }
            },
            {
              feedback_date: {
                lte: dateFormat(data.toCurrentMonthDate, "yyyy-mm-dd'T'23:59:59")
              }
            },
            where_cond
          ]
        };                   
        Userfeedback.find({  
            include: [
                {
                 relation: "user",
                 scope: {
                   include: [
                     {
                       relation: "user_belongs_to_staff",
                       scope: {
                         fields: ["name","userId"],
                       }  
                     }
                   ]
                 }
                }
               ],       
          where: where_condition
        }, function (err, res) { 
          if(err){
            cb(err,res);
          }
          cb(null,res);
        });           
      }
    
      Userfeedback.remoteMethod(
        'getFacultyFeedback',
        {
          http: { path: '/getFacultyFeedback', verb: 'post' },
          description: 'Get faculty feedback',
          accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
          returns: { arg: 'response', type: 'json' }
        }
      )

      Userfeedback.getAdministrationFeedback = function (data, cb) {  
        var where_condition = {};     
        let where_cond= { "user_id": data.user_id,"feedback_type": data.feedback_type, "status": 1 };
        where_condition = {
          and: [
            {
              feedback_date: {
                gte: dateFormat(data.fromCurrentMonthDate, "yyyy-mm-dd'T'00:00:00")
              }
            },
            {
              feedback_date: {
                lte: dateFormat(data.toCurrentMonthDate, "yyyy-mm-dd'T'23:59:59")
              }
            },
            where_cond
          ]
        };                
        Userfeedback.find({              
          where: where_condition
        }, function (err, res) { 
          if(err){
            cb(err,res);
          }
          cb(null,res);
        });           
      }
    
      Userfeedback.remoteMethod(
        'getAdministrationFeedback',
        {
          http: { path: '/getAdministrationFeedback', verb: 'post' },
          description: 'Get faculty feedback',
          accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
          returns: { arg: 'response', type: 'json' }
        }
      )
      Userfeedback.getCourseFeedback = function (data, cb) { 
        var where_condition = {};        
        let where_cond= { "user_id": data.user_id,"feedback_type": data.feedback_type, "status": 1 };
        where_condition = {
          and: [
            {
              feedback_date: {
                gte: dateFormat(data.fromCurrentMonthDate, "yyyy-mm-dd'T'00:00:00")
              }
            },
            {
              feedback_date: {
                lte: dateFormat(data.toCurrentMonthDate, "yyyy-mm-dd'T'23:59:59")
              }
            },
            where_cond
          ]
        };                  
        Userfeedback.find({  
          where: where_condition,
          include: [
            {
             relation: "subjects",             
            }
           ]           
          
        }, function (err, res) { 
          if(err){
            cb(err,res);
          }
          cb(null,res);
        });           
      }
    
      Userfeedback.remoteMethod(
        'getCourseFeedback',
        {
          http: { path: '/getCourseFeedback', verb: 'post' },
          description: 'Get faculty feedback',
          accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
          returns: { arg: 'response', type: 'json' }
        }
      )
};
