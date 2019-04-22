'use strict';

module.exports = function(Otherregistration) {
    
     Otherregistration.createuser = function (data, cb) {
        var errorMessage = {};
        var successMessage = {};
        Otherregistration.upsert(data, function (err, user) {
            if (err) {
                errorMessage.status = '201';
                errorMessage.message = 'Error occur.';
                cb(null,errorMessage, err);
            } else {
                successMessage.status = '200';
                successMessage.message = 'Record Inserted';
                cb(null,errorMessage, err);
            }

        });

    };
    
    Otherregistration.remoteMethod(
        'createuser',
        {
          http: {path: '/createuser', verb: 'post'},
          description: 'create user',
          accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
          returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }]
        }
    );
    Otherregistration.managementdetails = function (data, cb) {
        var resp = {};
        if (!data.user_id) {
            resp.status = "201";
            resp.message = "User id cannot be empty";
            cb(null, resp);
        }
        Otherregistration.find(
            {    
            where:{userId: data.user_id,
               
            },


             } ,
             (error, res) => {
                 if(error){
                    resp.status = "201";
                    resp.message = "Error Occured";
                    return;
                 }
                if(res)
                {  resp.status = "200";
                resp.message = "Success";
     
             
             }
             return cb(null,resp,res);
             }  )   ;

    };
    Otherregistration.remoteMethod(
        'managementdetails',
        {
          http: {path: '/managementdetails', verb: 'post'},
          description: 'managment details',
          accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
          returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }]
        }
    );
};
