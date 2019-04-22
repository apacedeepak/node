'use strict';

module.exports = function(Userinouttime) {
    Userinouttime.masterentry = function (req, cb) {
        var msg = {};

       
        Userinouttime.upsertWithWhere({userId: req.userId},req, function (err, res) {
            if (err)
                throw(err);

            msg.status = "200";
            msg.message = "Leave updated Successfully";
            cb(null, msg, res);
        });

    }

    
    Userinouttime.remoteMethod(
        'masterentry',
        {
            http: {path: '/masterentry', verb: 'post'},
            description: 'Assign leaves',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response_status', type: 'json'}
        }
);
};
