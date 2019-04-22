'use strict';
var dateFormat = require('dateformat');

module.exports = function (Assigntermfee) {
    Assigntermfee.assigntermfee = function (data, cb) {

        let msg={}, promises = [];
        ;
        var i;
        console.log(data.data.length)
        for (i=0;i<data.data.length;i++){
            var obj={
                "term_name_id":data.data[i].termId,
                "session_id":data.data[i].sessionId,
                "school_id":data.data[i].schoolId,
                "status":"Active",
                "amount":data.data[i].amount,
                "added_by":data.data[i].addedby,
                "added_date":new Date(),
                "fee_type":data.data[i].feetype,
                "fee_head_id":data.data[i].headId,
                "fee_structure_id":data.data[i].fee_struct_id
            }
            promises.push(new Promise((resolve, reject) => {
                Assigntermfee.create(obj, function (err, res) {
                    if (err) reject(err);
                    if(res) resolve("success");
                });
            }));
        }
        Promise.all(promises).then(res => {
            msg.status = "200";
            msg.message = "Information inserted successfully";
            return cb(null, msg);
        })   
    }
    Assigntermfee.remoteMethod(
        'assigntermfee',
        {
            http: {path: '/assigntermfee', verb: 'post'},
            description: 'assigntermfee',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response_status', type: 'json'}
        }
);
Assigntermfee.getfeeheadsbyfeestructure = function (data,cb) {  
var msg={};
    Assigntermfee.find({
        where: {status:'Active',fee_structure_id:data.fee_structure_id},
        include:{relation:"fee_head"}
    }, function (err, stdObj) {
        msg.status = "200";
        msg.message = "Information inserted successfully";
        return cb(null,msg, stdObj);
    });
};

Assigntermfee.remoteMethod(
    'getfeeheadsbyfeestructure',
    {
        http: {path: '/getfeeheadsbyfeestructure', verb: 'post'},
        description: 'getfeeheadsbyfeestructure',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
    }
);
};
