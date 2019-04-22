'use strict';

module.exports = function(Applicantinfo) { 
    
    Applicantinfo.addapplicant = function (data, cb) {
        Applicantinfo.create(data, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });
    };
    
    Applicantinfo.remoteMethod(
            'addapplicant',
            {
                http: {path: '/addapplicant', verb: 'post'},
                description: 'add Applicant',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
};
