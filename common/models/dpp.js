'use strict';
var dateFormat = require('dateformat');
var md5 = require('md5');
var request = require('request');
var constantval = require('./constant');
module.exports = function (Dpp) {
Dpp.adddailypracticepaper= function(data,cb){
    var msg={},promises=[]
    if(!data){
        msg.status="201",
        msg.message="No requested Data Found"
        cb(null,msg)
    }

var temp=data.lms_data.board_id +':' +data.lms_data.class_id+':' +data.lms_data.batch_id+ ':' +data.lms_data.teacher_id
var checksumString = temp.toUpperCase();
data.lms_data.checksum=md5(checksumString);



let jsonVal = {"center_id":data.lms_data.center_id,"board_id":data.lms_data.board_id,"class_id":data.lms_data.class_id,"class_name":data.lms_data.class_name,"erp_class_id":data.lms_data.erp_class_id,"subject_id":data.lms_data.subject_id,"batch_id":data.lms_data.batch_id,"batch_name":data.lms_data.batch_name,"teacher_id":data.lms_data.teacher_id,"topic_ids":data.lms_data.topic_ids,"checksum":data.lms_data.checksum}

promises.push(new Promise((resolve, reject) => {
    request.post({
        headers: { 'content-type' : 'application/json'},
        url:  constantval.dpp_lms_URL ,
        json:   jsonVal
        }, function(error, response, body){
  
  
            data.data.forEach(element => {
                element.lms_dpp_message=body.message
                promises.push(new Promise((resolve, reject) => {
                    Dpp.create(element, function (err, res) {
                        if (err) reject(err);
                        if(res) resolve("success");
                    });
                }));
            });
            resolve("success");
        
      
       
        })
    }));

Promise.all(promises).then(res => {

  
    
    msg.status = "200";
    msg.message = "Information inserted successfully";
    return cb(null, msg);
})   
}
Dpp.remoteMethod(
    'adddailypracticepaper',
    {
        http: {path: '/adddailypracticepaper', verb: 'post'},
        description: 'adddailypracticepaper',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response_status', type: 'json'}
    }
);
Dpp.getalldonetopics= function(data,cb){
    var msg={}
Dpp.find({

where :{ userId:data.userId,schoolId:data.schoolId,sectionId:data.sectionId,subjectId:data.subjectId,test_date:data.test_date}

},function(err,res){
    if(err){
        msg.status="201";
        msg.message="error occured"
        return cb(null,msg)
    }
    if (res){
        var topics=[];
        var lmm_status=[];
        res.forEach(element => {
            topics.push(element.topicId)
            lmm_status.push(element.lms_dpp_message)
        });
       
        msg.status="200";
        msg.message="data fetched" 
        return cb(null,msg,res)
    }
})
}
Dpp.remoteMethod(
    'getalldonetopics',
    {
        http: {path: '/getalldonetopics', verb: 'post'},
        description: 'getalldonetopics',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
    }
);


Dpp.getBatchCoverage = function (req) {
    var conditions={};var response={};
    if(req.section_id) conditions.sectionId=req.section_id;
    if(req.subject_id) conditions.subjectId=req.subject_id;
    
  
    return new Promise(function(resolve,reject){
        Dpp.find({
        include:{
            relation:"user",
            scope:{
                fields:['user_name']
            }
        },
        where:conditions
       }, function (err, res) {
        if(err) {
          reject(err)
        } else {
               
          response.coverage=res;
          resolve(response)
        } 
          
        });
    }) 
  
  }




};
