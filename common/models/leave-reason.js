'use strict';

module.exports = function(Leavereason) {
    Leavereason.leavereason = function (data, cb) {

            let msg = {};

            if(!data.school_id){
                msg.status = '201';
                msg.message = "School id cannot be blank";
                return msg;
            }

            Leavereason.find({
                fields: ["reason_name","id"],
                where: {status: 1, schoolId: data.school_id},
            }, function (err, res) {
                if(err)
                    throw err;
                
                if(res){
                    let reason_arr = [];
                    res.forEach((obj)=>{
			var tempobj = {reason_name:obj.reason_name,
				      reason_id:obj.id		
					}
                        reason_arr.push(tempobj);
                    });
                    let result = {"reason": reason_arr};
                    msg.status = '200';
                    msg.message = "Information Fetched Successfully.";
                    cb(null, msg, result);  
                }    
            });
    };

    
    Leavereason.remoteMethod(
        'leavereason',
        {
            http: {path: '/leavereason', verb: 'post'},
            description: 'Get Leave reasons for student',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );

};
