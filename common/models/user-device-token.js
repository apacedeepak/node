'use strict';

module.exports = function(Userdevicetoken) {
    Userdevicetoken.usertoken = function (userId, cb) {
        Userdevicetoken.find({
            where: { userId: userId, status:1 }
        },function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });

    };
    
    Userdevicetoken.remoteMethod(
        'usertoken',
        {
            http: {path: '/usertoken', verb: 'get'},
            description: 'User Token List',
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    /* Save Multiople Device token For User */
    Userdevicetoken.userdevicetoken = function (req, cb) {
        var userId = req.user_id;
        var deviceToken = req.device_token;
        var deviceType = req.device_type;
        var networkId = req.network_id;
        
        var errorMessage = {};
        var successMessage = {};
        
        if (!userId) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Please provide user id";
            return cb(null,errorMessage);
        }
        if (!deviceToken) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Please provide the device token";
            return cb(null,errorMessage);
        }
        if (!deviceType) {
            errorMessage.responseCode = "201";
            errorMessage.responseMessage = "Please provide the device type";
            return cb(null,errorMessage);
        }
        
        var request = {"userId":userId, "device_token": deviceToken, "device_type": deviceType, "network_id": networkId};
        Userdevicetoken.create( request, function (err) {
            if (err) {
                cb(null, err);
            } else {
                successMessage.responseCode = "200";
                successMessage.responseMessage = "Success";
                cb(null,successMessage);
            }
        });
    };
    
    Userdevicetoken.remoteMethod(
        'userdevicetoken',
        {
            http: {path: '/userdevicetoken', verb: 'get'},
            description: 'User Token List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: {arg: 'response', type: 'json'}
        }
    );
    
};
