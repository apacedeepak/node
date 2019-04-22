'use strict';

module.exports = function(Tleconfig) {
    
    Tleconfig.configuration = function (cb) {
        Tleconfig.findOne(function (err, result) {
            if(err)return err;
            
            cb(null, result);
        });
    }
    Tleconfig.remoteMethod(
        'configuration',
        {
            http: {verb: 'get'},
            description: 'Get product version and website ON/OFF',
            returns: {arg: 'content', type: 'json'}
        }
    );
    
    Tleconfig.createtleconfig = function (data, cb) {
        Tleconfig.upsert(data, function (err, config) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, config);
            }
        });
    }
    
    Tleconfig.remoteMethod(
        'createtleconfig',
        {
            http: {path: '/createtleconfig', verb: 'post'},
            description: 'Create Tle Configuration',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
};
