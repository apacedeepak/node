'use strict';
var constantval = require('./constant');

module.exports = function(Oauthclient) {
    
    var DEFAULT_TTL = 1800000;//it is 30 min time
    var algorithm = 'aes-256-ctr';
    var privateKey = 'Extr@@123';
    var crypto = require("crypto");
    
    Oauthclient.login = function (credential, cb) {
        var errorMessage= {};
        if(credential.callfrom==undefined || credential.callfrom=='' || credential.callfrom==null)
        {
            errorMessage.status = '201';
            errorMessage.message = "callfrom can't be blank";
            return cb(null,errorMessage);
        }
        
            var currentTimeSecond = new Date();
            var currentsecond = currentTimeSecond.getTime();
            var currentTtl = parseInt(currentsecond + DEFAULT_TTL);
      
        var tokenParam = credential.email + credential.password;
        
        const buf = crypto.randomBytes(32);
       
        var token = buf.toString('hex');
        let oldUserId = credential.userinfo?credential.userinfo.user_id:0;
       
        var Oauthtoken = Oauthclient.app.models.oauthaccestoken;
        var detail = {};
        var User = Oauthclient.app.models.User;
        Oauthclient.findOne({
            where: {client_id: credential.email, client_secret: credential.password}
        }, function (err, stdObj) { 
            User.getuserbyoldid(oldUserId,function(err,res) {
                if(parseInt(res.id)>0) {
                    if(stdObj){
                        let newUserId = res.id;
                        detail.userId = newUserId;
                        detail.token = token;
                        detail.email = stdObj.client_id;
                        detail.port = constantval.LOCAL_PORT;
                        var request = {"access_token":token, "client_id":stdObj.client_id,"user_id":newUserId,"expires":currentTtl,"callfrom":credential.callfrom}
                        Oauthtoken.create( request, function (err) {
                        });
                    
                        cb(err, detail);
                    }else{
                        cb(null, "username and password does not match");
                    }

                }else{
                    cb(null, "userId does not found in new database");
                }
            });
        });

    };

    Oauthclient.getsecretinformation = function(cb)
    {
        var successMessage = {};
         Oauthclient.findOne({}, function (err, stdObj) {
            if(stdObj){
                successMessage.status = '200';
                successMessage.message = 'Information Fetched Successfully'
                
                cb(err, successMessage,stdObj);
            }else{
                var errorMessage = {};
                errorMessage.status = '201';
                errorMessage.message = "Error occurred";
                cb(null, errorMessage);
            }
        });
    }
    
    Oauthclient.remoteMethod(
        'login',
        {
            http: {verb: 'post'},
            description: 'User Login API',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{arg: 'response', type: 'json'}, {arg: 'profile_detail', type: 'json'}]
        }
    ); 
    Oauthclient.remoteMethod(
        'getsecretinformation',
        {
            http: { verb: 'get' },
            description: 'Get secret information',
            returns: [{arg: 'response_status', type: 'json'},{arg: 'response', type: 'json'}]
            
        }
    );


    Oauthclient.createauthtoken = function (credential, cb) {
        var errorMessage= {};
        if(credential.callfrom==undefined || credential.callfrom=='' || credential.callfrom==null)
        {
            errorMessage.status = '201';
            errorMessage.message = "callfrom can't be blank";
            return cb(null,errorMessage);
        }
        
        var currentTimeSecond = new Date();
        var currentsecond = currentTimeSecond.getTime();
        var currentTtl = parseInt(currentsecond + DEFAULT_TTL);
        
        const buf = crypto.randomBytes(32);
        var token = buf.toString('hex');
       
        var Oauthtoken = Oauthclient.app.models.oauthaccestoken;
        var detail = {};
        var User = Oauthclient.app.models.User;
        Oauthclient.findOne({
            where: {client_id: credential.email, client_secret: credential.password}
        }, function (err, stdObj) { 
            if(stdObj){
                let newUserId = credential.user_id;
                detail.userId = newUserId;
                detail.token = token;
                detail.email = stdObj.client_id;
                detail.port = constantval.LOCAL_PORT;
                var request = {"access_token":token, "client_id":stdObj.client_id,"user_id":newUserId,"expires":currentTtl,"callfrom":credential.callfrom}
                Oauthtoken.create( request, function (err) {
                    cb(err, detail);
                });
              
            }else{
                cb(null, "username and password does not match");
            }
        });
    };

    Oauthclient.remoteMethod(
        'createauthtoken',
        {
            http: {verb: 'post'},
            description: 'User Login API',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{arg: 'response', type: 'json'}, {arg: 'profile_detail', type: 'json'}]
        }
    );
};
