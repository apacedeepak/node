'use strict';

module.exports = function(Indiscipline) {
    var errorMessage = {};
    var successMessage = {};
    Indiscipline.createindisciplinetype = (data, cb) => {
        Indiscipline.upsert(data, (err, res)=>{
            if(err){
                errorMessage.status = '201';
                errorMessage.message = 'Error occur.';
                return cb(null,errorMessage, err);
            }else{
                successMessage.status = '200';
                successMessage.message = 'Record inserted.';
                return cb(null,successMessage, res);
            }
            
        });
    };
    
    Indiscipline.remoteMethod(
            'createindisciplinetype',
            {
                http: {path: '/createindisciplinetype', verb: 'post'},
                description: 'create indiscipline type',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'string'},{arg: 'response', type: 'json'}]
            }
    );
};
