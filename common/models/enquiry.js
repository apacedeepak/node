'use strict';
var constantval = require('./constant');
var request = require('request');
module.exports = function(Enquiry) {

    //es6 way 
    Enquiry.createennq=function(data,cb){ 
var arr=[];

var array=[{"student_name":data.name,"mobile_no":data.mobile,"email_id":data.email,"preferred_service_id":data.service_type,"center_id":data.center_code,"board_id":data.course}];
        request.post({
            headers: { 'content-type' : 'application/json'},
            url:     constantval.creat_enquiry_URl,
            json:    array
            }, function(error, response, body){
               
            
                return cb(null, body);
            })

    }
Enquiry.remoteMethod("createennq",{
    http:{path:"/createennq",verb:"post"},
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    description :"This fucntion is used to create Enquiry into Our focus Applciation",
    returns:[{arg:"response",type:"json"}]

})
Enquiry.retrieve=function(data,cb){ 
      
    request.post({
        headers: { 'content-type' : 'application/json'},
        url:     constantval.retrieve_enquiry_URl,
        json:    data
        }, function(error, response, body){
      
            return cb(null,response, body);
        })

}
Enquiry.remoteMethod("retrieve",{
    http:{path:"/retrieve",verb:"post"},
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    description :"This fucntion is used to retrieve Enquiry from Our focus Applciation",
    returns:[{arg:"response",type:"json"}]

})

Enquiry.centerwiselist=function(data,cb){ 

request.post({
    headers: { 'content-type' : 'application/json'},
    url:     constantval.enquiry_list_URl,
    json:    data
    }, function(error, response, body){
  
        return cb(null, body);
    })

}
Enquiry.remoteMethod("centerwiselist",{
http:{path:"/centerwiselist",verb:"post"},
accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
description :"This fucntion is used to retrieve Enquiry from Our focus Applciation",
returns:[{arg:"response",type:"json"}]

})
Enquiry.updatestatus=function(data,cb){ 

    
    var obj={"enquiry_number":data.enquiry_number,"enq_regis_status":data.enq_regis_status};
            request.post({
                headers: { 'content-type' : 'application/json'},
                url:     constantval.enquiry_status_update,
                json:    obj
                }, function(error, response, body){
                   
       
                    return cb(null, body);
                })
    
        }
    Enquiry.remoteMethod("updatestatus",{
        http:{path:"/updatestatus",verb:"post"},
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        description :"This fucntion is used to create Enquiry into Our focus Applciation",
        returns:[{arg:"response",type:"json"}]
    
    })
};
    