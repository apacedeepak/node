'use strict';

module.exports = function(Ssourlconfiguration) {
    
    
    Ssourlconfiguration.insertssourl = function (data, cb) {
        Ssourlconfiguration.upsert(data, function (err, config) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, config);
            }
        });
    }
    
    Ssourlconfiguration.remoteMethod(
        'insertssourl',
        {
            http: {path: '/insertssourl', verb: 'post'},
            description: 'Insert Sso Url',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    
     Ssourlconfiguration.getssourl = function (data, cb) {
         let errorMessage = {};
         let successMessage = {};
        Ssourlconfiguration.find(data, function (err, config) {
            if (err) {
                errorMessage.status = "201";
                errorMessage.message = "Error Occurred";
                cb(null, errorMessage);
            } else {
                successMessage.status = "200";
                successMessage.message = "Data fetched successfully";
                cb(null, successMessage,config);
            }
        });
    }
    
    Ssourlconfiguration.remoteMethod(
        'getssourl',
        {
            http: {path: '/getssourl', verb: 'post'},
            description: 'get data Sso Url',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response_status', type: 'string' },{arg: 'response', type: 'json'}]
        }
    );
    
    Ssourlconfiguration.callById  =function (data, cb) {
         let errorMessage = {};
         let successMessage = {};
        Ssourlconfiguration.findById (data.id, function (err, result) {
            if (err) {
                errorMessage.status = "201";
                errorMessage.message = "Error Occurred";
                cb(null, err);
            } else {
                successMessage.status = "200";
                successMessage.message = "Data fetched successfully";
                cb(null, result);
            }
        });
    }
    
    Ssourlconfiguration.remoteMethod(
        'callById',
        {
            http: {path: '/callById', verb: 'post'},
            description: 'Insert Sso Url',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
};
