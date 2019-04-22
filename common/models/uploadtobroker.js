'use strict';

module.exports = function(Uploadtobroker) {
    
    Uploadtobroker.uploadtobroker = function (req, cb) {
    
    var errorMessage = {};
    var successMessage = {};
    
    var Usersubject = Uploadtobroker.app.models.user_subject;
    var Usertoken = Uploadtobroker.app.models.user_device_token;
    
    var ds = Uploadtobroker.dataSource;    
    var modulename = req[0].typefor;
    var RabbitMQ = require('rabbitmq-node');
    var rabbitmq = new RabbitMQ('amqp://localhost');
      
        switch(modulename)
        {
            case "message":
            {
             var userlist = '';
             req.forEach(function(information){

                      if(information.send_to=='parent')
                      {
                      var sql = "select user_id from parent_master where id =(select parent_id from student where user_id='"+information.user_id+"')";  
                      ds.connector.query(sql, function (err, parentresponse) {
                      var sql = "SELECT mac_id from ctp_assigned_tablet_license where status = 'Active' and user_type ='student' and user_id="+parentresponse[0].user_id;
                      ds.connector.query(sql, function (err, response) {
                      if(response.length>0)
                        {
                            response.forEach(function(uniqueid)
                            {
                              rabbitmq.push('msgs:'+uniqueid.mac_id, {'typefor':'message','user_id':parentresponse[0].user_id,'type':'1','send_to':'parent'});  
                            });
                            
                        }

                      });    
                          
                      });
                      }
                      else
                      {
                      var sql = "SELECT mac_id from ctp_assigned_tablet_license where status = 'Active' and user_type ='student' and user_id="+information.user_id;
                      ds.connector.query(sql, function (err, response) {
                      if(response.length>0)
                        {
                            response.forEach(function(uniqueid)
                            {
                              rabbitmq.push('msgs:'+uniqueid.mac_id, information);  
                            });
                            
                        }

                      }); 
                      }
                    
             }); 
             break;
            }
            case "ctp_class":
            {
                var dateFormat = require('dateformat');
                var todaydate = dateFormat(Date(), "yyyy-mm-dd");
                var queryresult = {};
                
                if(req[0].send_to=='Student')
                    
                    
                    var request = {"sectionId" : req[0].section_id, "user_type": req[0].send_to, "subjectId": req[0].subject_id, "sessionId":req[0].session_id};
                    Usersubject.subjectusers(request,  function(err, studentlist) {
                        if(err==null)
                        {
                            studentlist.forEach(function(userData){
                                
                                Usertoken.usertoken(userData.userId,  function(err, tokenData){
                                    if(tokenData.length > 0){
                                        tokenData.forEach(function(tokenUser){
                                            rabbitmq.push('msgs:'+tokenUser.device_token, {'typefor':'ctp_class','user_id':tokenUser.userId,'ctp_action':req[0].ctp_action,'network_id':req[0].network_id});  
                                        })
                                    }else{
                                        errorMessage.status = '201';
                                        errorMessage.message = "No record Found.";
                                    }
                                });
                            });
                            successMessage.status = '200';
                            successMessage.message = "Success";
                        }
                        else
                        {
                            errorMessage.status = '201';
                            errorMessage.message = "Error";
                        }

                    });
                     cb(null, errorMessage);
                
               break;  
            }
        }

//      var RabbitMQ = require('rabbitmq-node');
//      var rabbitmq = new RabbitMQ('amqp://localhost');
//      rabbitmq.push('testpull', { message: 'Hello World' });
//      rabbitmq.on('message', function(channel, message) {
//      console.log(message);
//    });
//    rabbitmq.on('error', function(err) {
//    console.error(err);
//    });
    };
    
      Uploadtobroker.remoteMethod(
        'uploadtobroker',
        {
            http: {verb: 'post'},
            description: 'upload events in broker message server',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{arg: 'response_status', type: 'string'},{arg: 'response', type: 'string'}]
        }
    );

};
