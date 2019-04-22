'use strict';

module.exports = function(Invitemunitmaster) {
    Invitemunitmaster.itemunitlist = function (data, cb) {
        Invitemunitmaster.find({
            where: {status: "1" },
            order: "id DESC"
        }, function (err, res) {
            if (err) {
                return cb(null, err);
            }
            return cb(null, res);
        });
    }
    Invitemunitmaster.remoteMethod(
        'itemunitlist',
        {
            http: { path: '/itemunitlist', verb: 'post' },
            description: 'Item Unit List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'item_unit_list', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
};
