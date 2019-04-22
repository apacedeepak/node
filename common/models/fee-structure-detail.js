'use strict';

module.exports = function(Feestructuredetail) {

    Feestructuredetail.getfeestructurebysection = function(req,cb){
        var msg = {};
        
  
        
        Feestructuredetail.find(
            
            {
                include: {
                    relation: "fee_structure_master",
                    
                    scope: {
                        where: { status: "Active" },
                     
                        //where: { schoolId: req.school_id },
                    }
        
                },     
            where:{"status":"Active",section_id:req.section_id}, order: 'id DESC'},function(error,response){
            if (error) { 
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }else{

                msg.status = "200";
                msg.messasge = "Fee structure Listing";
                cb(null, msg,response);
            }


        });
    }

    Feestructuredetail.remoteMethod(
        'getfeestructurebysection',
        {
            http: { path: '/getfeestructurebysection', verb: 'post' },
            description: 'getfeestructurebysection',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

};
