'use strict';

module.exports = function(Usertype) {
    Usertype.getusertype = function(req , cb){
        Usertype.findOne({
          where: {"type": req.type, "status":"Active"}
        }, function (err, res) {
            if(err){
                cb(null,err);
            }
            cb(null,res)
        });
    }
    
    Usertype.remoteMethod(
            'getusertype',
            {
                http: {path: '/getusertype', verb: 'post'},
                description: 'Get user school',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
};
