'use strict';
var dateFormat = require('dateformat');

module.exports = function (Leavedetails) {
    Leavedetails.userbalanceleaves = function (data, cb) {
        var userId = data.user_id;
        var msg = {};
        if (!userId) {
            msg.status = "201";
            msg.message = "User Id cannot be blank";
            cb(null, msg);
        }
        Leavedetails.find({
            fields: ["gain", "taken", "id", "leave_masterId","leave_schemeId"],
            include: {
                relation: "leave_master",
                scope: {
                    fields: ["leave_name", "halfday_applicable", "abbrevation", "leave_masterId",],
                }
            },
            where: {userId: userId,status:"Active"}
        }, function (err, result) {

            if (err) {
                return   cb(null, err);
            }
            var res = [];
            result.forEach(function (userInfo) {
                userInfo = userInfo.toJSON();
            
                var obj = {
                    leave_schemeId:userInfo.leave_schemeId,
                    leave_id: userInfo.leave_masterId,
                    gain: userInfo.gain,
                    taken: userInfo.taken,
                    leave_name: userInfo.leave_master.leave_name,
                    abbrevation: userInfo.leave_master.abbrevation,
                    halfday_applicable: userInfo.leave_master.halfday_applicable,
                }
                res.push(obj);
            });
            msg.status = '200';
            msg.Message = 'Information fetched successfull';
            return cb(null, msg, res);
        })
    };
    Leavedetails.userleave = function (req, cb) {
        
        Leavedetails.findOne(
                {
                    where: {and: [{userId: req.user_id}, {leave_masterId: req.leave_id}, {financial_yearId: req.financial_year}]}
                },
                function (err, res) {
                   return cb(null, res);
                });
    }

    Leavedetails.remoteMethod(
            'userbalanceleaves',
            {
                http: {path: '/userbalanceleaves', verb: 'post'},
                description: 'Get user balance leaves',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Leavedetails.assignleave = function (req, cb) {
 
        var msg = {}, obj = {},obje={} ,flag = false, promises = [];
            
    
                for(let i=0; i<req['leave_schemeId'].length; i++){
                
                       
                    if(req['leave_schemeId'][i]!=""){

                                     obje={
                                        status:"Inactive"
                                    }
                                                                               
                 Leavedetails.updateAll({userId:req['userId'][i]},obje,function (errss,resp){
                     if(resp){

                                   
                    var leave_scheme_details = Leavedetails.app.models.leave_scheme_details;
                
                    for(let j=0;j<req['leave_scheme_id'].length;j++){

                        if(req['leave_schemeId'][i]==req['leave_scheme_id'][j]){
                        obj = {
                            leave_schemeId: req['leave_schemeId'][i], 
                            userId: req['userId'][i], 
                            financial_yearId: req['financial_yearId'][j],
                            added_date: dateFormat(new Date(), "isoDateTime"),
                            min_days_required:req['min_days_required'][j],
                            max_limit:req['max_limit'][j],
                            leave_masterId:req['leave_masterId'][j],
                            gain:req['gain'][j]
                        }
             
                    promises.push(new Promise((resolve, reject) => {
                        Leavedetails.upsert(obj, function (err, res) {
                            if (err) reject(err);
                            if(res) resolve("success");
                        });
                    }));
                }
                }
                
                     }

                            }
                            )  
                                
                        }
                            
                        
             
                }
          
            Promise.all(promises).then(res => {
                msg.status = "200";
                msg.message = "Information inserted successfully";
                return cb(null, msg);
            })   
    }
    Leavedetails.remoteMethod(
            'assignleave',
            {
                http: {path: '/assignleave', verb: 'post'},
                description: 'Assign leaves',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response_status', type: 'json'}
            }
    );

    

};
