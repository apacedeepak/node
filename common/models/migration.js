'use strict';

module.exports = function(Migration) {



    Migration.getstudentlist = function(req,cb){

        var msg = {};
        Migration.find({
            where:{migration_status:0}
        }
        ,function(err,res){

            if(err){
                msg.status = 201;
                msg.message = "Error occured";
                cb(null,msg);

            }else{

                msg.status = 200;
                msg.message = "Data fetched for migration";
                cb(null,msg,res);

            }
        });

    };

    Migration.remoteMethod(
        'getstudentlist',
        {
            http: { path: '/getstudentlist', verb: 'post' },
            description: 'getstudentlist',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

};
