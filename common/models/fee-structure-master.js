'use strict';

module.exports = function(Feestructuremaster) {


    Feestructuremaster.getfeestructurelist = function(req,cb){
        var msg = {};
        
        var  conditions = {"status":"Active"};

        if(req.session_id){
        conditions.session_id = req.session_id;
        }

        if(req.school_id){
        conditions.school_id = req.school_id;
        }
        
       Feestructuremaster.find(
            
            {
                include: {
                    relation: "fee_strcuture_master_map_fee_structure_detail",
                    
                    scope: {
                        where: { status: "Active" },
                        fields: ['section_id'],
                        include: {
                            relation: "section",
                            scope:{
                                fields : ['section_name']
                            }
                        }
                        //where: { schoolId: req.school_id },
                    }
        
                },     
            where:conditions, order: 'id DESC'},function(error,response){
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

    Feestructuremaster.remoteMethod(
        'getfeestructurelist',
        {
            http: { path: '/getfeestructurelist', verb: 'post' },
            description: 'getfeestructurelist',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    Feestructuremaster.addfeestructure = function (req, cb) {

        
        var master_req = req;
        var detail_req = req.class_sections;
        delete master_req.class_sections;
        
        var msg = {};

        var conditions = {
            and:[
                {fee_structure_name:req.fee_structure_name},
                {session_id:req.session_id},
                {school_id:req.school_id},        
                {status:"Active"}
            ]
        };

        
        Feestructuremaster.find(
            {
                where:conditions
            }, function (error, response) {

              
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }
            else if (response.length == 0) {
                Feestructuremaster.create(master_req, function (err, res) {
                    if (err) {

                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    } else {
                        msg.status = "200";
                        var fee_structure_detail = Feestructuremaster.app.models.fee_structure_detail;
                        var x=0;
                        let promisearr = [];
                        for(x=0;x<detail_req.length;x++){
                            promisearr.push(Feestructuremaster.createDetailEntry(fee_structure_detail,{fee_structure_id:res.id,section_id:detail_req[x]}));

                            
                        }

                        Promise.all(promisearr).then(function(data){

                            

                            msg.messasge = "Fee structure added successfully";
                            cb(null, msg);
                        }).catch(function(error){

                            // delete the failed record...rollback code start here....

                        })
                       
                    }
                });
            }
            else if (response.length > 0) {
                msg.status = "202";
                msg.messasge = "Fee structure already exist.";
                cb(null, msg);
            }

            else {
                msg.status = "201";
                msg.messasge = "Somethinfg went wrong...";
                cb(null, msg);
            }
        });

    }
    Feestructuremaster.createDetailEntry = function(modelName,createObj)
    {
        return new Promise(function(resolve,reject){
            modelName.create(createObj,function (err, res){
                if(err) reject(err)
                else resolve('success')


            });

        })
        
    }
    Feestructuremaster.remoteMethod(
        'addfeestructure',
        {
            http: { path: '/addfeestructure', verb: 'post' },
            description: 'addfeestructure',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

     /*
     Delete the Fee structure...
    */

   Feestructuremaster.deletefeestructure = function(req,cb){
    var msg = {};
        var  conditions = {id:req.id};
        var  updateData = {status:"Inactive"};
        Feestructuremaster.upsertWithWhere(conditions,updateData,function(error,response){
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }else{

                msg.status = "200";
                msg.messasge = "Fee structure deleted successfully";
                cb(null, msg,response);// or cb(null, msg);
            }


        });
}

Feestructuremaster.remoteMethod(
    'deletefeestructure',
    {
        http: { path: '/deletefeestructure', verb: 'post' },
        description: 'deletefeestructure',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);

/*
fee structure detail updation...
*/


Feestructuremaster.feestructuredetails = function(req,cb){
    
    var msg = {};
    var  conditions = {id:req.id,status:"Active"};
    Feestructuremaster.findOne({
        include: {
            relation: "fee_strcuture_master_map_fee_structure_detail",
            
            scope: {
                where: { status: "Active" },
                fields: ['section_id'],
                include: {
                    relation: "section",
                    scope:{
                        fields : ['section_name']
                    }
                }
                //where: { schoolId: req.school_id },
            }

        },
        where:conditions},function(error,response){
        
        if (error) {
            msg.status = "201";
            msg.messasge = "error occured";
            cb(null, msg);
        }else{
            msg.status = "200";
            msg.messasge = "Details fetched";
            cb(null, msg,response);
        }

    });
        
}

Feestructuremaster.remoteMethod(
    'feestructuredetails',
    {
        http: { path: '/feestructuredetails', verb: 'post' },
        description: 'feestructuredetails',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);


/*
     Edit the Fee Structure...
    */

   Feestructuremaster.editfeestructure = function(req,cb){
    var msg = {};
        var  updateconditions = {id:req.id};
        
        var conditions = {
            and:[  
                    {fee_structure_name:req.fee_structure_name},
                    {session_id:req.session_id},
                    {school_id:req.school_id},        
                    {status:"Active"},  
                    {id:{"neq":req.id}}
                
                ]
        };


        Feestructuremaster.find({where:conditions},function(err,resp){
            
            if(err){
               var flag = false;
               msg.status = "201";
               msg.messasge = "error occured";
               cb(null, msg);
            }
            else if (resp.length == 0) {
                // update fee structure detail by id...

                var updateData = req;
                delete updateData.id;
                //console.log(updateData);
                
                Feestructuremaster.upsertWithWhere(updateconditions,updateData,function(error,response){
                    if (error) {
                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    }else{
                        //msg.status = "200";
                        //msg.messasge = "Fee structure updated successfully";


                        // delete entry...
                        var fee_structure_detail = Feestructuremaster.app.models.fee_structure_detail;
                        var feeStrcutureDetailUpdateData = {status:"Inactive"};
                        var feeStrcutureDetailUpdateCondition = {fee_structure_id:updateconditions.id};
                        
                        fee_structure_detail.updateAll(feeStrcutureDetailUpdateCondition,feeStrcutureDetailUpdateData,function(e,r){
                            //console.log(e);
                            if (e) {
                                msg.status = "201";
                                msg.messasge = "error occured";
                                cb(null, msg);
                            }else{
                                //insert....
                                let promisearr=[];
                                for(let k=0;k<req.class_sections.length;k++){
                                var insertObj = {fee_structure_id:updateconditions.id,section_id:req.class_sections[k]};
                                promisearr.push(Feestructuremaster.createDetailEntry(fee_structure_detail,insertObj));                          
                     
                                }


                                Promise.all(promisearr).then(function(data){
                                    msg.status = "200";
                                    msg.messasge = "Fee structure updated successfully";
                                    cb(null, msg);
                                }).catch(function(error){
        
                                    // delete the failed record...rollback code start here....
                                    msg.status = "201";
                                    msg.messasge = "error occured";
                                    cb(null, msg);
                                })  

                            }
                        });

                        


                        //cb(null, msg,response);// or cb(null, msg);
                    }


            });
            }
            else if (resp.length > 0) {
                msg.status = "202";
                msg.messasge = "Fee structure name already exist.";
                cb(null, msg);
            }

            else {
                msg.status = "201";
                msg.messasge = "Something went wrong...";
                cb(null, msg);
            }


        })

        

}

Feestructuremaster.remoteMethod(
    'editfeestructure',
    {
        http: { path: '/editfeestructure', verb: 'post' },
        description: 'editfeestructure',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);





Feestructuremaster.feestructurerevenuetarget = function(req,cb){
    var msg = {};
    
    var  conditions = {"status":"Active"};
    var  termConditions = {"status":"Active"};
    var  revenueCondition = {};
    var  revenueTermCondition = {};

    if(req.session_id){
    conditions.session_id = req.session_id;
    revenueCondition.session_id== req.session_id;
    }

    if(req.school_id){
    conditions.school_id = req.school_id;
    revenueCondition.school_id = req.school_id;

    }
    if(req.month) {
        revenueTermCondition.month=req.month;
        revenueCondition.month = req.month;
    }
    
   Feestructuremaster.find(
        
        {
            include: [{
                relation: "fee_revenue_target",
                
                scope: {
                    where: revenueCondition,
                    fields: ['id','admission_target','discount_target','revenue_target','status'],
                    
                }
    
            },
            {
                relation: "revenue_target_fee_term",
                
                scope: {
                    where: revenueTermCondition,
                    fields: ['id','amount','fee_term_id','month'],
                    
                }
    
            },
            {
                relation: "fee_strcuture_map_term_master",
                
                scope: {
                    where: termConditions,
                    fields: ['term_name_id','status'],
                    
                }
    
            }],    
        where:conditions, order: 'id ASC'},function(error,response){
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

Feestructuremaster.remoteMethod(
    'feestructurerevenuetarget',
    {
        http: { path: '/feestructurerevenuetarget', verb: 'post' },
        description: 'feestructurerevenuetarget',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);





};
