'use strict';

module.exports = function (Notification) {
    var constantval = require('./constant');
    
     var RabbitMQ = require('rabbitmq-node');
     
     if(constantval.RABBITMQ_PUSH=='1')
    var rabbitmq = new RabbitMQ('amqp://localhost');
    Notification.pushnotification = function (requestarr) {
        var promise = [];
        var Uploadtobroker = Notification.app.models.uploadbroker;
        for (let key in requestarr) {
            promise.push(Notification.addnotification(requestarr[key]));
        }

        Promise.all(promise).then(function(response){
           // if(constantval.FCM_PUSH=='1')
                //{
                Notification.sendnotification(requestarr);
                //}

        }).catch(function(error){
            console.log("Error Occurred during sending notification");

        })
    }
    Notification.pushnotificationall = function (req,cb) {
        var successMessage = {};
        var errorMessage = {};
        if(req.notification_array==undefined || req.notification_array == null || req.notification_array=='')
            {
                 errorMessage.status = "201";
                 errorMessage.message = "Kindly provide notification data";
                 return cb(null, errorMessage);
            }
        else if(req.notification_array.length==0)
            {
                errorMessage.status = "201";
                errorMessage.message = "Kindly provide notification data";
                return cb(null, errorMessage);
            }
        var promise = [];

        for (let key in req.notification_array) {
            promise.push(Notification.addnotification(req.notification_array[key]));
        }

        Promise.all(promise).then(function(response){
            if(constantval.FCM_PUSH=='1')
                {
                Notification.sendnotification(req.notification_array);
                }
            successMessage.status = "200";
            successMessage.message = "Notification sent Successfully";
            return cb(null, successMessage);
        }).catch(function(error){
            console.log("Error Occurred during sending notification");
            errorMessage.status = "201";
            errorMessage.message = "Error Ocurred";
            return cb(null, errorMessage);
        })
    }

    Notification.addnotification = function (notfdata) {
        return new Promise(function(resolve,reject){
            var User = Notification.app.models.user;
//            if(notfdata.type == 7){
//                User.getuserbyolduserid({user_id: notfdata.user_id}, (err, getdata) => {
//                    notfdata.user_id = getdata[0].id;
//                    Notification.upsert(notfdata,function(err,response){
//                        if(err)
//                            {
//                               console.log("Error Occurred during adding notification");
//                            }
//                        else
//                            {
//                               resolve('suucess') ;
//                            }
//                    })
//                });
           // }else{
                Notification.upsert(notfdata,function(err,response){
                    if(err)
                        {
                           console.log("Error Occurred during adding notification");
                        }
                    else
                        {
                            var socket = Notification.app.io;
                            var socketService = Notification.app.models.socketservice;
                            socketService.publish(socket,{
                                collectionName : 'notify'+notfdata.user_id,
                                data: notfdata.user_id,
                                method: 'POST'
                             })
                            resolve('suucess') ;

                        }
                })
           // }

        })

    }
     Notification.sendnotification = function (notfdata) {

            var UserDeviceToken = Notification.app.models.user_device_token;
            var userarr = [];
            for (let key in notfdata) {
            userarr.push(notfdata[key].user_id);
        }
            UserDeviceToken.find({
                where : {userId: { inq: userarr }
            }},function(err,response){
                if(err)
                    {
                       console.log("Error Occurred during sending notification");
                    }
                else
                    { if(response.length > 0)
                        {
                          var iosdevicetokenarr = [];
                          var androiddevicetokenarr = [];
                          var rabbitmqarr = [];
                          for(let key in response)
                            {
                                if(response[key].device_type.toLowerCase()=='ios')
                                    {
                                       iosdevicetokenarr.push(response[key].device_token) ;
                                    }
                                    else if(response[key].device_type.toLowerCase()=='android')
                                        {
                                       androiddevicetokenarr.push(response[key].device_token) ;
                                    }
                                    if(constantval.RABBITMQ_PUSH=='1')
                                    rabbitmqarr.push(response[key].device_token);
                            }
                                var promise = [];
                                if(rabbitmqarr.length > 0)
                                    {
                                        var rabbitmqmessagebody = {
                                            'module_key_id': notfdata[0].module_key_id,
                                            'type': notfdata[0].type,
                                            'title': notfdata[0].title,
                                            'message': notfdata[0].notification_text
                                        };
                                        promise.push(Notification.sendRabbitMqNotification(rabbitmqarr,rabbitmqmessagebody));
                                    }
                                if(androiddevicetokenarr.length > 0)
                                    {
                                        var androidmessagebody = [];
                                        androidmessagebody['message'] = notfdata[0].notification_text;
                                        androidmessagebody['title'] = notfdata[0].title;
                                        androidmessagebody['image'] = notfdata[0].type+'-'+notfdata[0].module_key_id;
                                        promise.push(Notification.sendAndroidNotification(androiddevicetokenarr,androidmessagebody));
                                    }
                                    if(iosdevicetokenarr.length > 0)
                                    {
                                       var iosmessagebody = [];
                                       var iosinnermessagebody = [];
                                       var iosallaray = [];

                                        iosinnermessagebody['body'] = notfdata[0].notification_text;
                                        iosinnermessagebody['title'] = notfdata[0].title;
                                        iosallaray['alert'] = iosinnermessagebody;
                                        iosallaray['sound'] = 'default';
                                        iosallaray['type'] = notfdata[0].type;
                                        iosallaray['id'] = notfdata[0].module_key_id;
                                        iosmessagebody['aps'] = iosallaray;
                                        for(let key in iosdevicetokenarr) {
                                           // promise.push(Notification.sendIosNotification(iosdevicetokenarr[key],iosmessagebody));

                                        }
                                    }
                                    if(promise.length>0)
                                        {
                                            Promise.all(promise).then(function(resolve,reject){

                                            }).catch(function(error){
                                                 console.log("Error Occurred during sending notification");
                                            })
                                        }
                        }

                    }
            })



    }

    Notification.sendRabbitMqNotification = function(alltokens,allmessage)
        {
          return new Promise(function(resolve,reject){

              alltokens.forEach(function(uniqueid)
                            {
                              rabbitmq.push('msgs:'+uniqueid, allmessage);  
                              resolve('success');
                            });


          })
        }
        Notification.sendAndroidNotification = function(alltokens,allmessage)
        {
          return new Promise(function(resolve,reject){

              var striptags = require('striptags');
              var request = require('request');
              var messagearr = {};
              var finalarr = {};
              var headerarr = {'Content-Type': 'application/json',
                                'Authorization':'key='+constantval.FIREBASE_API_KEY
                                };


              messagearr.message = striptags(allmessage['message'], ['<br>']);
              messagearr.title = striptags(allmessage['title'], ['<br>']);
              messagearr.image = allmessage['image'];
              finalarr.registration_ids = alltokens;
              finalarr.data = messagearr;
              finalarr = JSON.stringify(finalarr);
              request({
                                headers: headerarr,
                                uri:     'https://fcm.googleapis.com/fcm/send',
                                method: 'POST',
                                body:    finalarr
                             }, function(error, response, body){

                                if(error){
                                    console.log('Error while notification to FCM')
                                }
                                else
                                {console.log(body)
                                    resolve('success');
                                }

                             });


          })
        }

        // Notification.sendIosNotification = function(alltokens,allmessage)
        // {

        // }

        Notification.notification = function (req, cb) {
            //var Oauthtoken = Notification.app.models.oauthaccestoken;
            var currentTimeSecond = Date.now();
            var currentTtl = Math.round(parseInt(currentTimeSecond) / 1000);
            var errorMessage = {};
            var successMessage = {};
            var whereClause = {};
              if (!req.user_id) {
                        errorMessage.status = "201";
                        errorMessage.message = "User id can't blank";
                        return cb(null, errorMessage);
                    }
            if (!req.token) {
               errorMessage.status = "201";
               errorMessage.message = "Token can't blank";
               return cb(null, errorMessage);

           }
//                    whereClause = {user_id: req.user_id}
//                    if(req.old_user_id != undefined && req.old_user_id != '' && req.old_user_id != null){
//                        whereClause = { user_id:{inq:[req.user_id,req.old_user_id]}};
//                    }

                            Notification.find({
                                fields:['id','title', 'module_key_id','notification_text', 'is_read', 'created_date', 'type', 'user_id'],
                                where: {user_id: req.user_id},
                                order: 'id desc',
                                limit: '100'
                            },function(err, notificationArr){
                                if(err)
                                    {
                                         errorMessage.status = "201";
                                         errorMessage.message = "Error Ocurred";
                                         return cb(null, errorMessage);
                                    }
                                let finalarr = {};
                                if(notificationArr){
                                    Notification.find({
                                        where: {user_id: req.user_id, is_read: '0'}
                                    },function(err, notifiCount){
                                        if(err)
                                    {
                                            errorMessage.status = "201";
                                            errorMessage.message = "Error Ocurred";
                                            return cb(null, errorMessage);
                                    }
                                        successMessage.status = "200";
                                        successMessage.message = "Information Fetched Successfully";
                                        finalarr.notificationCount = notifiCount.length;
                                        finalarr.notificationArr = notificationArr;
                                        cb(null, successMessage, finalarr);
                                    });
                                }
                            });

    };

     Notification.updatenotificationall = function (req, cb) {
          var errorMessage = {};
          var successMessage = {};
              if (req.user_id == undefined || req.user_id == '' || req.user_id == null) {
                        errorMessage.status = "201";
                        errorMessage.message = "User id can't blank";
                        return cb(null, errorMessage);
                    }
                     if (req.token == undefined || req.token == '' || req.token == null) {
                        errorMessage.status = "201";
                        errorMessage.message = "Token can't blank";
                        return cb(null, errorMessage);
                    }

                     Notification.find({
                         where: { user_id: req.user_id, is_read: '0' }
                     }, function (err, notificationArr) {
                         var temparr = [];
                         var param = {};
                         param.is_read = 1;
                         if (notificationArr.length > 0) {
                             Notification.update( {user_id: req.user_id}, param,  function (err, responsedata) {
                                 if (err) {
                                     errorMessage.status = "201";
                                     errorMessage.message = "Error Ocurred";
                                     return cb(null, errorMessage);
                                 } else {
                                     successMessage.status = "200";
                                     successMessage.message = "Updated Successfully";
                                     return cb(null, successMessage);
                                 }
                             });
                         }
                            else
                                {
                                     successMessage.status = "200";
                                     successMessage.message = "No Record to update";
                                     return cb(null, successMessage);
                                }
                     })

     };

     Notification.updatemodulenotification = function (req, cb) {
          var errorMessage = {};
          var successMessage = {};
              if (req.user_id == undefined || req.user_id == '' || req.user_id == null) {
                        errorMessage.status = "201";
                        errorMessage.message = "User id can't blank";
                        return cb(null, errorMessage);
                    }
                     if (req.token == undefined || req.token == '' || req.token == null) {
                        errorMessage.status = "201";
                        errorMessage.message = "Token can't blank";
                        return cb(null, errorMessage);
                    }
                    if (req.type == undefined || req.type == '' || req.type == null) {
                        errorMessage.status = "201";
                        errorMessage.message = "Type can't blank";
                        return cb(null, errorMessage);
                    }
                    else if(req.type.length==0)
                        {
                          errorMessage.status = "201";
                         errorMessage.message = "Type can't blank";
                         return cb(null, errorMessage);
                        }
                    var promise = [];
                    for(let key in req.type)
                        {
                         promise.push(Notification.updatemodulenotificationexecute(req.user_id,req.type[key],cb));
                        }
                        Promise.all(promise).then(function(response){
                            successMessage.status = "200";
                            successMessage.message = "Updated Successfully";
                            return cb(null, successMessage);

                        }).catch(function(error){
                            errorMessage.status = "201";
                            errorMessage.message = "Error Ocurred";
                            return cb(null, errorMessage);
                        })


     };
    Notification.updatemodulenotificationexecute = function(user_id,typeid,cb)
    {

                         var errorMessage = {};
                         var param = {};
                         param.is_read = 1;

                        Notification.update( {user_id: user_id,type:typeid}, param,  function (err, responsedata) {
                            if (err) {
                                errorMessage.status = "201";
                                errorMessage.message = "Error Ocurred";
                                return cb(null, errorMessage);
                            }
                        });


    }
        Notification.remoteMethod(
		'notification',
		{
		    http: { verb: 'post' },
		    description: 'Get list of notification',
		    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
		}
        );

        Notification.remoteMethod(
		'updatenotificationall',
		{
		    http: { verb: 'post' },
		    description: 'Update all notification of user',
		    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
		}
        );

        Notification.remoteMethod(
		'updatemodulenotification',
		{
		    http: { verb: 'post' },
		    description: 'Update all notification of particular Module',
		    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
		}
        );
    Notification.remoteMethod(
		'pushnotificationall',
		{
		    http: { verb: 'post' },
		    description: 'Push notification API',
		    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'string' }]
		}
    	);

};
