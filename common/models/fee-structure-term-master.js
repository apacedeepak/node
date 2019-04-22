'use strict';
var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe');
module.exports = function (Feestructuretermmaster) {
    let msg={}, promises = [];
    Feestructuretermmaster.termaster = function (data, cb) {
    var i;
    for (i=0;i<data.term_id.length;i++){
        var obj={
            "term_name_id":data.term_id[i],
            "session_id":data.session_id,
            "school_id":data.school_id,
            "status":"Active",
            "fee_structure_id":data.fee_struct_id,
            "added_by":data.added_by,
            "added_date":new Date(),
            "fine_amount":data.finecharge,
            "fine_charge_basis":data.finebasis,
            "fine_applicable_from":data.fineapplicable,
            "start_date":data.start[i],
            "end_date":data.end[i],

        }
        promises.push(new Promise((resolve, reject) => {
            Feestructuretermmaster.create(obj, function (err, res) {
                if (err) reject(err);
                if(res){ 
    
                    var assign_term_fee=Feestructuretermmaster.app.models.assign_term_fee;
                    var j;
                    for (j=0;j<data.data.length;j++){
                        if(res.term_name_id==data.data[j].termId && res.fee_structure_id==data.data[j].fee_struct_id){
                        var object={
                            "fee_structure_term_id":res.id,
                            "term_name_id":data.data[j].termId,
                            "session_id":data.data[j].sessionId,
                            "school_id":data.data[j].schoolId,
                            "status":"Active",
                            "amount":data.data[j].amount,
                            "added_by":data.data[j].addedby,
                            "added_date":new Date(),
                            "fee_type":data.data[j].feetype,
                            "fee_head_id":data.data[j].headId,
                            "fee_structure_id":data.data[j].fee_struct_id
                        }
                        assign_term_fee.create(object)}
                    }
                    resolve("success")};
            });
        }));
    }
    Promise.all(promises).then(res => {
        msg.status = "200";
        msg.message = "Information inserted successfully";
        return cb(null, msg);
    })   
}
Feestructuretermmaster.remoteMethod(
    'termaster',
    {
        http: {path: '/termaster', verb: 'post'},
        description: 'termaster',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response_status', type: 'json'}
    }
);
Feestructuretermmaster.getalluniquefeestructure = function (data,cb) {
    var uniquearray=[]
    Feestructuretermmaster.find({
        where: {status:data.status },
       
    }, function (err, result) {
        if (err) {

           return cb(null, err);
        } else {
   
           uniquearray = Dedupe(result, ['fee_structure_id']);
   
           return cb(null, uniquearray);
        }
    });

};
Feestructuretermmaster.remoteMethod(
    'getalluniquefeestructure',
    {
        http: {path: '/getalluniquefeestructure', verb: 'post'},
        description: 'getalluniquefeestructure',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response', type: 'json'}
    }
);


Feestructuretermmaster.getFeeStructureTerm=function(req,cb) {
    var  conditions = {"status":"Active"};
    if(req.fee_structure_id) {
        conditions.fee_structure_id=req.fee_structure_id;
    }
    var termfeecond={"status":"Active"};
    Feestructuretermmaster.find(
    {
        include: {
            relation:"term_fee",
            scope: {
                where:termfeecond,
                fields: ['fee_head_id','amount','fee_type'],
                include : {
                    relation:"fee_head",
                    scope: {
                        fields:['fee_head_name','is_offer_applicable']
                    }
                    
                }
            }
        },
        where:conditions,
        order:'id ASC'
    },function(err,res) {
        if(err) {
            cb(err,null);
        } else {
            cb(null,res);
        }
    }

    );


}


}
