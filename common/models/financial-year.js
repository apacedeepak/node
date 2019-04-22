'use strict';
var dateFormat = require('dateformat');
module.exports = function (Financialyear) {

    Financialyear.createleaveyear = function (req, cb) {
        var currdate=new Date();
  
      
        Financialyear.find(function(error,resp){
            if(resp){
                var startflag="",endflag="",duplicateflag="";
                var msg = {};
                // new Promise((resolve, reject) => {
                resp.forEach(element => {
                
                  
                    if(Date.parse(element.start_date) <  Date.parse(req.leave_start_date) && Date.parse(req.leave_start_date)<Date.parse(element.end_date) ) 
                       {
                  
                        startflag="yes";
                    }      
                    if((Date.parse(element.start_date) <  Date.parse(req.leave_end_date)) && (Date.parse(req.leave_end_date) < Date.parse(element.end_date)) ) 
                    {
                        console.log(Date.parse(element.start_date))
                        console.log(Date.parse(req.leave_end_date))
                        console.log(Date.parse(element.end_date))
                        endflag="yes";
                    }     
                    if(Date.parse(element.start_date) ==  Date.parse(req.leave_start_date) && Date.parse(req.leave_end_date) == Date.parse(element.end_date) )  {
                        duplicateflag="yes";
                    } 
                });
            // });
            if(startflag=="yes"){
                msg.status = "201";
                msg.message = "start Date overlap";
                cb(null, msg);
            }
           else if(endflag=="yes"){
                msg.status = "201";
                msg.message = "End Date overlap";
                cb(null, msg);

            }
            else if(duplicateflag=="yes"){
                msg.status = "201";
                msg.message = "Duplicate value";
                cb(null, msg);

            }
            // Promise.then(resp => {
               else {
                var obj = {
       
                    id: req.id,
                    start_date: dateFormat(req.leave_start_date, 'isoDate'),
                    end_date: dateFormat(req.leave_end_date, "isoDate"),
                    added_date: dateFormat(currdate, "isoDate"),
                    added_by: req.loggedinId
                }
                Financialyear.upsert(obj, function (err, res) {
                    if (err)
                        throw(err);
   
                    msg.status = "200";
                    msg.message = "Leave year updated successfully";
                    cb(null, msg);
                });}
            // });
            }
        })
   
    }

    Financialyear.getleaveyear = function (req, cb) {
        var msg = {};
        var resp = {};
        Financialyear.find(function (err, res) {
            if (err)
                throw(err);
            var arr = [];
            res.forEach(function (value) {
                value = value.toJSON();
                var obj = {
                    id: value.id,
                    start_date: dateFormat(value.start_date, "isoDate"),
                    end_date: dateFormat(value.end_date, "isoDate"),
                }
                arr.push(obj);
            });
            resp.staffYearDetails = arr;
            msg.status = "200";
            msg.message = "Data fetched successfully";
            cb(null, msg, resp);
        });
    }

    Financialyear.remoteMethod(
            'createleaveyear',
            {
                http: {path: '/createleaveyear', verb: 'post'},
                description: 'Create leave  year',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Financialyear.remoteMethod(
            'getleaveyear',
            {
                http: {path: '/getleaveyear', verb: 'get'},
                description: 'Get leave year list ',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
};
