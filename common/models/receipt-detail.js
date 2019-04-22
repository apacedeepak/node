'use strict';
var Dedupe = require('array-dedupe');
module.exports = function(Receiptdetail) {
    Receiptdetail.getHeadName=function(req,cb){
        let msg = {}, resarr = [];
    
       
        Receiptdetail.find(
            {    fields:['fee_head_name'],   
              
               
                
            },
            (err, res) => {
        if (err)
            throw err;
        if (res) {
      
            res = Dedupe(res, ['fee_head_name']);
    
        return cb(null, msg, res);
        }
    });
    
    }
    Receiptdetail.remoteMethod(
        'getHeadName',
        {
            http: {path: '/getHeadName', verb: 'get'},
            description: 'Get all the Head Name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });






        /**
         * 
         * Get receipt details start here.....
         */

        Receiptdetail.getreceiptdetails=function(req,cb){
            let msg = {}
        
           if(req.receipt_id){
            Receiptdetail.find(
                {   
                    include :[{
                        relation:'map_receipt',
                        scope:{
                        
                            fields:['id','feereceiptid','feereceiptno','userId','receiptdate'],
                            where:{status:"Active"}
                        }
                        
                        },
                        {
                            relation: 'map_user',
                            scope:{
                                fields:['id'],
                                    include: [{
                                        relation: "students",
                                        scope: { 
                                            fields:['name','address','student_phone','admission_no'],
                                         }
                                    },{
                                        relation: "user_have_schools",
                                        scope: { 
                                            fields:['school_name','school_code','school_address','gstin_no','city','state','school_logo'],

                                         }
                                    }]
                            }
                        }
                    ], 
                
                where: {status:"Active",receiptId:req.receipt_id,amount:{gt:0}},   
                order: "priority ASC"    
                },
                (err, res) => {
                if(err){
                    msg.status = 201;
                    msg.message = "Something went wrong";
                    cb(null,msg,res)
                }else{
                msg.status = 200;
                msg.message = "Receipt details fetched successfully";
                cb(null,msg,res);
                }
                    
            
        });
        }else{

            msg.status = 201;
            msg.message = "Receipt ID is not valid";
            cb(null,msg)
        }
        
        }
        Receiptdetail.remoteMethod(
            'getreceiptdetails',
            {
                http: { path: '/getreceiptdetails', verb: 'post' },
                description: 'getreceiptdetails',
                accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
                returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
            }
        );
        





};
