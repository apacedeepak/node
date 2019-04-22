'use strict';

module.exports = function(Refundconfiguration) {

    Refundconfiguration.addconfig = function (req, cb) {


        var msg = {};

        if(req.fee_head_id > 0 && req.refund_on!='' && req.refund_ratio!=''){

        var conditions = {status:"Active",fee_head_id:req.fee_head_id,day_of_refund_in_days:req.day_of_refund_in_days};

        
        Refundconfiguration.find(
            {
                where:conditions
            }, function (error, response) {

               
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }
            else if (response.length == 0) {
                Refundconfiguration.create(req, function (err, res) {
                    if (err) {

                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    } else {
                        msg.status = "200";
                        msg.messasge = "Refund configuration added successfully";
                        cb(null, msg);
                    }
                });
            }
            else if (response.length > 0) {
                msg.status = "202";
                msg.messasge = "Refund configuration on selected Fee head already exist.";
                cb(null, msg);
            }

            else {
                msg.status = "201";
                msg.messasge = "Somethinfg went wrong...";
                cb(null, msg);
            }
        });

        }else{
            msg.status = 201;
            msg.messasge = "fee_head_id, refund_on and refund_ration is required";
            cb(null,msg);
        }

    }

    Refundconfiguration.remoteMethod(
        'addconfig',
        {
            http: { path: '/addconfig', verb: 'post' },
            description: 'addconfig',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );



    /*
     Edit the refund configuration...
    */

   Refundconfiguration.editconfig = function(req,cb){
    var msg = {};
        var  updateconditions = {id:req.id};
        if(req.id > 0){
        var conditions = {
            and:[
                {fee_head_id:req.fee_head_id},
                {day_of_refund_in_days:req.day_of_refund_in_days},
                {status:"Active"},
                {id:{"neq":req.id}}
                
                ]
        };


        Refundconfiguration.find({where:conditions},function(err,resp){
            
            if(err){
               var flag = false;
               msg.status = "201";
               msg.messasge = "error occured";
               cb(null, msg);
            }
            else if (resp.length == 0) {
                // update fee configuration detail by id...

                var updateData = req;
                delete updateData.id;
                //console.log(updateData);
                
                Refundconfiguration.upsertWithWhere(updateconditions,updateData,function(error,response){
                    if (error) {
                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    }else{
                        msg.status = "200";
                        msg.messasge = "Refund configuration updated successfully";
                        cb(null, msg,response);// or cb(null, msg);
                    }


        });



            }
            else if (resp.length > 0) {
                msg.status = "202";
                msg.messasge = "Refund configuration on selected Fee head already exist.";
                cb(null, msg);
            }

            else {
                msg.status = "201";
                msg.messasge = "Somethinfg went wrong...";
                cb(null, msg);
            }


        })
        }
        else{
            msg.status=201;
            msg.message="id is required";
            cb(null,msg);
        }
        

}

Refundconfiguration.remoteMethod(
    'editconfig',
    {
        http: { path: '/editconfig', verb: 'post' },
        description: 'editconfig',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);

    Refundconfiguration.getrefundconfiguration = function(req,cb){
        var msg = {};
        var  conditions = {status:req.status};

       

        Refundconfiguration.find({
            include:{
                relation:"head",
                scope:{
                    fields:["id","fee_head_name"]
                }
            },
            where:conditions,
            order: 'id DESC'
        },function(error,response){
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }else{

                msg.status = "200";
                msg.messasge = "Configuration fetched successfully";
                cb(null, msg,response);
            }


        });
    }

    Refundconfiguration.remoteMethod(
        'getrefundconfiguration',
        {
            http: { path: '/getrefundconfiguration', verb: 'post' },
            description: 'get refund congiguration list',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    /*
     Delete the Fee Head...
    */

   Refundconfiguration.deleteconfig = function(req,cb){
    var msg = {};
        var  conditions = {id:req.id};
        var  updateData = {status:"Inactive"};
        Refundconfiguration.upsertWithWhere(conditions,updateData,function(error,response){
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }else{

                msg.status = "200";
                msg.messasge = "Configuration deleted successfully";
                cb(null, msg,response);// or cb(null, msg);
            }


        });
}

Refundconfiguration.remoteMethod(
    'deleteconfig',
    {
        http: { path: '/deleteconfig', verb: 'post' },
        description: 'deleteconfig',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);

/*
config detail ...
*/

Refundconfiguration.configdetails = function(req,cb){
    
    var msg = {};
    var  conditions = {id:req.id};
    Refundconfiguration.findOne({where:conditions},function(error,response){
        
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

Refundconfiguration.remoteMethod(
    'configdetails',
    {
        http: { path: '/configdetails', verb: 'post' },
        description: 'configdetails',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);

};
