'use strict';

module.exports = function(Attendencerule) {
    Attendencerule.ruleentry = function (req, cb) {
        var msg = {};


        Attendencerule.upsertWithWhere({id:1},req, function (err, res) {
            if (err)
                throw(err);

            msg.status = "200";
            msg.message = "Leave updated Successfully";
            cb(null, msg, res);
        });

    }

    Attendencerule.remoteMethod(
        'ruleentry',
        {
            http: {path: '/ruleentry', verb: 'post'},
            description: 'Assign leaves',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response_status', type: 'json'}
        }
);

};
