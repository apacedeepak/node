'use strict';
module.exports = function (Invcategorymaster) {
    Invcategorymaster.itemcategorylist = function (data, cb) {
        Invcategorymaster.find({
            where: {status: "1" },
            order: "id DESC"
        }, function (err, res) {

            if (err) {
                return cb(null, err);
            }
            return cb(null, res);
        });
    }
    Invcategorymaster.remoteMethod(
        'itemcategorylist',
        {
            http: { path: '/itemcategorylist', verb: 'post' },
            description: 'Item Category List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'item_category_list', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
};
