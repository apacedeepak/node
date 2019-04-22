'use strict';
var arraySort = require('array-sort');
var dateFormat = require('dateformat');
module.exports = function(Studentremark) {
    var errorMessage = {};
    var successMessage = {};
    
    Studentremark.createremark= (data, cb)=>{
        Studentremark.upsert(data, (err, res)=>{
            if(err){
                errorMessage.status = "201";
                errorMessage.message = "Error Occur";
                return cb(null, errorMessage, err);
            }else{
                successMessage.status = "200";
                successMessage.message = "Record created";
                return cb(null, successMessage, res);
            }
        });
    }
    
    Studentremark.remoteMethod(
            'createremark',
            {
                http: {path: '/createremark', verb: 'post'},
                description: 'create remark',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }],
            }
    );
    
    Studentremark.getremarkbyuserid= (data, cb)=>{
        Studentremark.find({
            where: {userId: data.user_id}
        }, (err, res)=>{
            if(err){
                errorMessage.status = "201";
                errorMessage.message = "Error Occur";
                return cb(null, errorMessage, err);
            }else{
                successMessage.status = "200";
                successMessage.message = "Record fetched.";
                var remarkSort = arraySort(res, 'remark_date', {reverse: true});
                return cb(null, successMessage, remarkSort);
            }
        });
    }
    
    Studentremark.remoteMethod(
            'getremarkbyuserid',
            {
                http: {path: '/getremarkbyuserid', verb: 'post'},
                description: 'get remark by user id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }],
            }
    );
    
    Studentremark.getremarkbyuseridandfetchaccdate= (data, cb)=>{
        
        let category = undefined;
        if(data.category){
            if(data.category == 'indiscipline'){
                category = 'In-discipline';
            }else{
                category = "Achievements";
            }
        }
        
        Studentremark.find({
            where: {userId: data.user_id, category:category},
            include:{
                relation: 'remark_send_by',
                scope:{
                    include:{
                        relation: 'staff'
                    }
                }
            }
        }, (err, res)=>{
            if(err){
                errorMessage.status = "201";
                errorMessage.message = "Error Occur";
                return cb(null, errorMessage, err);
            }else{
                if(res.length > 0){
                let remarks = [];
                let dateArr = [];
                successMessage.status = "200";
                successMessage.message = "Record fetched.";
                var remarkSort = arraySort(res, 'remark_date', {reverse: true});
                    const remarkCount = remarkSort.length - 1;
                    for(let key in remarkSort){
                        let remarkDate = dateFormat(remarkSort[key].remark_date, "mmm yyyy");
                        let senderName = '';
                        if(remarkSort[key].remark_send_by() && remarkSort[key].remark_send_by().user_type == "School"){
                            senderName = remarkSort[key].remark_send_by().user_name;
                        }else if(remarkSort[key].remark_send_by() && remarkSort[key].remark_send_by().user_type == "Teacher"){
                            senderName = remarkSort[key].remark_send_by().staff().name + " ("+remarkSort[key].remark_send_by().staff().staff_code+")"
                        }
                        if(dateArr.indexOf(remarkDate) == -1){
                            
                            remarks.push({
                                [remarkDate]: [{
                                "userId": remarkSort[key].userId,
                                "remark": remarkSort[key].remark,
                                "created_by": remarkSort[key].senderId,
                                "added_date": remarkSort[key].added_date,
				"category": remarkSort[key].category,
                                "remark_date": dateFormat(remarkSort[key].remark_date, "dd mmm, yyyy"),
                                "id": remarkSort[key].id,
                                "senderName": senderName
                            }]
                            });

                           dateArr.push(remarkDate);

                        }else{
                            let dateIndex = dateArr.indexOf(remarkDate);
                           for(let k in remarks[dateIndex]){
                               remarks[dateIndex][k].push({
                                    "userId": remarkSort[key].userId,
                                    "remark": remarkSort[key].remark,
                                    "created_by": remarkSort[key].senderId,
                                    "added_date": remarkSort[key].added_date,
				    "category": remarkSort[key].category,
                                    "remark_date": dateFormat(remarkSort[key].remark_date, "dd mmm, yyyy"),
                                    "id": remarkSort[key].id,
                                    "senderName": senderName
                            })

                           }
                        }
                   
                    if(key == remarkCount){ 
                        return cb(null, successMessage, remarks);
                    }
                    
                }
            }else{
                successMessage.status = "200";
                successMessage.message = "No record found.";
                return cb(null, successMessage, res);
            }
                
            }
        });
    }
    
    Studentremark.remoteMethod(
            'getremarkbyuseridandfetchaccdate',
            {
                http: {path: '/getremarkbyuseridandfetchaccdate', verb: 'post'},
                description: 'get remark by user id',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }],
            }
    );
    
    
};
