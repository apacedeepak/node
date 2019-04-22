'use strict';

module.exports = function(Role) {
    Role.addrole = function (data, cb) {
        Role.upsert(data, function (err, role) {
            if(err){
                return cb(null, err);
            }
            return cb(null, role);
        });

    };
    
    Role.remoteMethod(
        'addrole',
        {
            http: {path: '/addrole', verb: 'post'},
            description: 'Add Role',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    
};
