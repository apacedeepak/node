'use strict';

module.exports = function(Revenuetargetfeeterm) {

    Revenuetargetfeeterm.addRevenueTargetFeeTerm=function(req,cb) {

        Revenuetargetfeeterm.upsert(req,function(err,res){

            if(err) {
                cb(err,null);
            } else {
                               
                cb(null,res);
            }


        });
    }



    Revenuetargetfeeterm.updateRevenueTargetFeeTerm = function(req,cb){
            var  conditions = {};
            var  updateData = {};
            updateData.amount=req.amount;
            
            conditions.revenue_target_id=req.revenue_target_id;
            conditions.month=req.month;
            conditions.fee_term_id=req.fee_term_id;
            Revenuetargetfeeterm.updateAll(conditions,updateData,function(err,res){
                if(err) {
                    cb(err,null);
                } else {
                                   
                    cb(null,res);
                }
    
    
            });
    }


    Revenuetargetfeeterm.getRevenueTargetFeeTerm=function(req,cb) {
        var conditions={};
        if(req.revenue_target_id) conditions.revenue_target_id=req.revenue_target_id;
        if(req.fee_structure_id) conditions.fee_structure_id=req.fee_structure_id;
        if(req.month) conditions.month=req.month;
       //console.log(conditions);
        Revenuetargetfeeterm.find(
            {
               where:conditions

            },function(err,res){
                if(err) cb(err,null);
                               
                cb(null,res);


            });

    }


    Revenuetargetfeeterm.remoteMethod(
        'addRevenueTargetFeeTerm',
        {
            http:{ path:'/addrevenuetargetfeeterm',verb:'post'},
            description:'To Add Revenue Target Fee Term',
            accepts:{arg:'data',type:'object',http:{source:'body'} },
            returns:  { arg: 'response', type: 'json' }
        }
        

    );

};
