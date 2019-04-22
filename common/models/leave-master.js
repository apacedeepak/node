'use strict';

module.exports = function (Leavemaster) {

    Leavemaster.createleave = function (req, cb) {
        var msg = {};
        req.added_by = 1;

        Leavemaster.find(
            {
                where:{leave_name:req.leave_name},
                limit:1,
            },function(error,resp){
                if(resp.length>0){
                    if(resp[0].id!=req.id){
                    msg.status = "201";
                    msg.message = "Duplicate Leave Name";
                    cb(null, msg);}
                
                else{
                    Leavemaster.upsert(req, function (err, res) {
                        if (err)
                            throw(err);
            
                        msg.status = "200";
                        msg.message = "Leave updated Successfully";
                        cb(null, msg, res);
                    });
                }
                
            }
            else{
                Leavemaster.upsert(req, function (err, res) {
                    if (err)
                        throw(err);
        
                    msg.status = "200";
                    msg.message = "Leave updated Successfully";
                    cb(null, msg, res);
                });
            }
        }

        )
       

    }
    Leavemaster.remoteMethod(
            'createleave',
            {
                http: {path: '/createleave', verb: 'post'},
                description: 'Create leaves',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Leavemaster.leavedeatils = function (cb) {
        var msg = {};
        var leaves = {};
        Leavemaster.find(function (err, res) {
            if (err)
                throw(err);
            var leaveArr = [];
            res.forEach(function (value) {
                var obj = {
                    id: value.id,
                    leave_name: value.leave_name,
                    abbrevation: value.abbrevation,
                    halfday_applicable: value.halfday_applicable,
                    gender: value.gender,
                    leave_id: value.id
                }
                leaveArr.push(obj);
            });

            leaves.staffleave = leaveArr;
            msg.status = '200';
            msg.message = 'Data fetched successfully';
            cb(null, msg, leaves);
        });

    }

    Leavemaster.remoteMethod(
            'leavedeatils',
            {
                http: {path: '/leavedeatils', verb: 'get'},
                description: 'Get all leaves',
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );


};
