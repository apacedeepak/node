'use strict';
var dateFormat = require('dateformat');
module.exports = function (Leavescheme) {

    Leavescheme.createleavescheme = function (req, cb) {

        var schemeDetailsObj = Leavescheme.app.models.leave_scheme_details;
        var msg = {};
        var resp = {};

        if (!req.leave_scheme_name) {
            msg.status = "201";
            msg.message = "Leave scheme name cannot be empty";
            return cb(null, msg);
        }
        if (!req.leave_id) {
            msg.status = "201";
            msg.message = "Please select leave";
            return cb(null, msg);
        }

        Leavescheme.find({
            where:{ scheme_name:req.leave_scheme_name}
        }, function (errors, resp){
            if(resp.length>0){
                if(resp[0].id==req.id){
                    console.log(resp[0].id)
                    console.log(req.id);
                    var leaveIdArr = req.leave_id;
                    var loggedinId = req.loggedinId;
                    var leaveYear = req.leave_year;
            
                    var obj = {
                        scheme_name: req.leave_scheme_name,
                        id: req.id
                    };
                    Leavescheme.upsert(obj, function (err, res) {
            
                        leaveIdArr.forEach(function (leaveId, key) {
                            var detailsObj = {
                                leave_schemeId: res.id,
                                financial_yearId: leaveYear,
                                leave_masterId: leaveId,
                                accumulation: req.accumulation[key],
                                min_days: req.min_days_required[key],
                                no_of_days:req.no_of_days[key],
                                max_limit: req.max_limit[key],
                                added_by: loggedinId,
                                added_date: dateFormat(new Date(),'isoDate')
                            };
             

                         
                                            schemeDetailsObj.update(detailsObj,  {
                                                where:{leave_masterId:detailsObj.leave_masterId ,leave_schemeId:detailsObj.leave_schemeId },},
                                                (err, res) =>{
                                                    console.log
                                            });

                           
                                      
                         
                        });
                        msg.status = "200";
                        msg.message = "Data Updated successfully";
                        return cb(null, msg);
            
                    });
                }
                else{
                    msg.status = "201";
                    msg.message = "Leave Name Cannot be Same";
                    return cb(null, msg);
                }
            }
            else{
                var leaveIdArr = req.leave_id;
                var loggedinId = req.loggedinId;
                var leaveYear = req.leave_year;
        
                var obj = {
                    scheme_name: req.leave_scheme_name,
                    id: req.id
                };
                Leavescheme.upsert(obj, function (err, res) {
        
                    leaveIdArr.forEach(function (leaveId, key) {
                        var detailsObj = {
                            leave_schemeId: res.id,
                            financial_yearId: leaveYear,
                            leave_masterId: leaveId,
                            accumulation: req.accumulation[key],
                            min_days: req.min_days_required[key],
                            no_of_days:req.no_of_days[key],
                            max_limit: req.max_limit[key],
                            added_by: loggedinId,
                            added_date: dateFormat(new Date(),'isoDate')
                        };
        
                        schemeDetailsObj.create(detailsObj, function (err, res) {
        
                        });
                    });
                    msg.status = "200";
                    msg.message = "Data Updated successfully";
                    return cb(null, msg);
        
                });
            }
        }
        )
     

    }
    Leavescheme.remoteMethod(
            'createleavescheme',
            {
                http: {path: '/createleavescheme', verb: 'post'},
                description: 'Create leave scheme and assign leaves to leave scheme',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Leavescheme.getschemename = function (req, cb) {
        let successMessage = {};
        let errorMessage = {};
        Leavescheme.find(
        function (err, res) {
            if(err)
            {
            errorMessage.status = "201";
            errorMessage.message =err ;
            return cb(null,errorMessage);
            }
            successMessage.status = "200";
            successMessage.message = "Information fetched successfully";
            let responsearr = [];
            
            if(res.length>0)
            { 
                var Dedupe = require('array-dedupe');
                let uniquearr = [];
                uniquearr = Dedupe(res,['scheme_name']);

                uniquearr.forEach(function(data){
                let responseobj = {};
                responseobj.id =  data.id;
                responseobj.leave_scheme_name =  data.scheme_name;
             
              
                responsearr.push(responseobj);
             })
            }
            return cb(null,successMessage,responsearr);
        }
    )

       
    }

    Leavescheme.remoteMethod(
        'getschemename',
        {
            http: {path: '/getschemename', verb: 'get'},
            description: 'Get all the Scheme Name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });

};
