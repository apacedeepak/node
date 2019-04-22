'use strict';

module.exports = function (Feeheadmaster) {
    Feeheadmaster.addfeehead = function (req, cb) {


        var msg = {};

        var conditions = {
            and:[
                    {or:
                        [
                            {fee_head_name:req.fee_head_name},
                            {fee_head_short_name:req.fee_head_short_name},
                           
                        ]
                    },    
                {status:"Active"},
            
                {school_id:req.school_id}
                ]
        };

        
        Feeheadmaster.find(
            {
                where:conditions
            }, function (error, response) {

               
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }
            else if (response.length == 0) {
                Feeheadmaster.create(req, function (err, res) {
                    if (err) {

                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    } else {
                        msg.status = "200";
                        msg.messasge = "Fee head added successfully";
                        cb(null, msg);
                    }
                });
            }
            else if (response.length > 0) {
                msg.status = "202";
                msg.messasge = "Fee head or Short name already exist.";
                cb(null, msg);
            }

            else {
                msg.status = "201";
                msg.messasge = "Somethinfg went wrong...";
                cb(null, msg);
            }
        });

    }

    Feeheadmaster.remoteMethod(
        'addfeehead',
        {
            http: { path: '/addfeehead', verb: 'post' },
            description: 'addfeehead',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    Feeheadmaster.getfeeheadlist = function(req,cb){
        var msg = {};
        var  conditions = {status:"Active",school_id:req.school_id};

        if(req.is_refundable == undefined){
            conditions.is_refundable = undefined;
            
        }else{
            conditions.is_refundable = req.is_refundable;
        }

        Feeheadmaster.find({where:conditions,order: 'id DESC'},function(error,response){
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }else{

                msg.status = "200";
                msg.messasge = "Fee Head Listing";
                cb(null, msg,response);
            }


        });
    }

    Feeheadmaster.remoteMethod(
        'getfeeheadlist',
        {
            http: { path: '/getfeeheadlist', verb: 'post' },
            description: 'getfeeheadlist',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );




    /*
     Delete the Fee Head...
    */

   Feeheadmaster.deletefeehead = function(req,cb){
    var msg = {};
        var  conditions = {id:req.id};
        var  updateData = {status:"Inactive"};
        Feeheadmaster.upsertWithWhere(conditions,updateData,function(error,response){
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            }else{

                msg.status = "200";
                msg.messasge = "Fee head deleted successfully";
                cb(null, msg,response);// or cb(null, msg);
            }


        });
}

Feeheadmaster.remoteMethod(
    'deletefeehead',
    {
        http: { path: '/deletefeehead', verb: 'post' },
        description: 'deletefeehead',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);

/*
fee head detail updation...
*/

Feeheadmaster.feeheaddetails = function(req,cb){
    
    var msg = {};
    var  conditions = {id:req.id};
    Feeheadmaster.findOne({where:conditions},function(error,response){
        
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

Feeheadmaster.remoteMethod(
    'feeheaddetails',
    {
        http: { path: '/feeheaddetails', verb: 'post' },
        description: 'feeheaddetails',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);


/*
     Edit the Fee Head...
    */

   Feeheadmaster.editfeehead = function(req,cb){console.log(req);
    var msg = {};
        var  updateconditions = {id:req.id};
        
        var conditions = {
            and:[
                    {or:
                        [
                            {fee_head_name:req.fee_head_name},
                            {fee_head_short_name:req.fee_head_short_name}
                        ]
                    },    
                {status:"Active"},
                {id:{"neq":req.id}}
                
                ]
        };


        Feeheadmaster.find({where:conditions},function(err,resp){
            
            if(err){
               var flag = false;
               msg.status = "201";
               msg.messasge = "error occured";
               cb(null, msg);
            }
            else if (resp.length == 0) {
                // update fee head detail by id...

                var updateData = req;
                delete updateData.id;
                //console.log(updateData);
                
                Feeheadmaster.upsertWithWhere(updateconditions,updateData,function(error,response){
                    if (error) {
                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    }else{

                        msg.status = "200";
                        msg.messasge = "Fee head updated successfully";
                        cb(null, msg,response);// or cb(null, msg);
                    }


        });



            }
            else if (resp.length > 0) {
                msg.status = "202";
                msg.messasge = "Fee head or Short name already exist.";
                cb(null, msg);
            }

            else {
                msg.status = "201";
                msg.messasge = "Somethinfg went wrong...";
                cb(null, msg);
            }


        })

        

}

Feeheadmaster.remoteMethod(
    'editfeehead',
    {
        http: { path: '/editfeehead', verb: 'post' },
        description: 'editfeehead',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);


};
