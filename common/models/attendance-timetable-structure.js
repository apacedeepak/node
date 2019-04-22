'use strict';

module.exports = function(Attendancetimetablestructure) {

    Attendancetimetablestructure.getattenflag = (data, cb) => {
        let msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        else if(!data.school_auto_id){
            msg.status = "201";
            msg.message = "School auto id cannot be blank";
            return cb(null, msg);
        }

        Attendancetimetablestructure.findOne({
            fields: "attend_flag",
            where: { status: "Active", school_auto_id: data.school_auto_id } 
        }, (err, res) => {
            if (err)
                console.error(err);
            if(res){
                msg.status = '200';
                msg.message = "Information fetched successfully";
                return cb(null, msg, res);
            }else{
                msg.status = '201';
                msg.message = "No Result";
                return cb(null, msg); 
            }    
        });

    }

    Attendancetimetablestructure.remoteMethod(
        'getattenflag',
        {
            http: {path: '/getattenflag', verb: 'post'},
            description: 'Get lecture attendance flag',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_type', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );

};
