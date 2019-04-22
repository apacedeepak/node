var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe');'use strict';
var dateFormat = require('dateformat');

module.exports = function(Masteruserlog) {
    Masteruserlog.lastlogin= function (req, cb) {
        var resp = {};
        if (!req.user_id) {
            resp.status = "201";
            resp.message = "User id cannot be empty";
            return cb(null, resp);
        }
        
        let successMessageTotal = {};
        let errorMessageTotal = {};
        var user_id = req.user_id;
        Masteruserlog.find(
            {     fields:["user_id","login_status","logout_time"],
            where:{user_id: user_id,login_status:'logout'},


            order: ['id DESC']
             } ,
             function (err, res) {
               let array=[];
                if(err)
                {
                    errorMessageTotal.status = "201";
                    errorMessageTotal.message = "Error Occured";
                return cb(null,errorMessageTotal);
                }
                successMessageTotal.status = "200";
                successMessageTotal.message = "Information fetched successfully";
                // res.forEach(obj => {
                //     if(obj.logout_time!=null){
                   
                //         array=obj;
                //     }
                //  });   
             
                if(res.length>0){
           
               var lengthres=res.length;
              array=res[0];
            //   var resparr=[];
              var resobj={}
              resobj["logout_time"]= dateFormat(res[0].logout_time, "yyyy-mm-dd HH:MM:ss");
              resobj["logout_time_app"]= dateFormat(res[0].logout_time, "isoDateTime");
              resobj["user_id"]= res[0].user_id;
            //         resparr.push(resobj);
            //   console.log(resparr);
             
                }
                return cb(null,successMessageTotal,resobj);
            }

           )      

    }
    Masteruserlog.remoteMethod(
        'lastlogin',
        {
            http: {verb: 'post'},
            description: 'display last login time',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });
        
        
     
    Masteruserlog.loginlogout= function (req, cb) {
        let successMessageTotal = {};
        let errorMessageTotal = {};
        
        
        if(!req){
            errorMessageTotal.status = "201";
            errorMessageTotal.message = "Request cannot be empty";
            return cb(null, errorMessageTotal);
        }
        if(!req.user_id){
            errorMessageTotal.status = "201";
            errorMessageTotal.message = "User id cannot be empty";
            return cb(null, errorMessageTotal);
        }
        if(!req.user_session_id){
            errorMessageTotal.status = "201";
            errorMessageTotal.message = "User session id cannot be empty";
            return cb(null, errorMessageTotal);
        }
        if(!req.login_status){
            errorMessageTotal.status = "201";
            errorMessageTotal.message = "Login status cannot be empty";
            return cb(null, errorMessageTotal);
        }
        
        if(req.login_status != 'login' && req.login_status != 'logout'){
            errorMessageTotal.status = "201";
            errorMessageTotal.message = "Login status should be login or logout";
            return cb(null, errorMessageTotal);
        }
        
        const userSessionId = 'sess_'+req.user_session_id;
        
        if(req.login_status == 'login'){
            let param = {
                user_id: req.user_id,
                login_time: dateFormat(Date(), "yyyy-mm-dd HH:MM:ss"),
                login_status: req.login_status,
                last_activity_time : dateFormat(Date(), "yyyy-mm-dd HH:MM:ss"),
                user_session_id: userSessionId,
                login_return: req
            }

            Masteruserlog.upsert(param,(err, response)=>{
                successMessageTotal.status = "200";
                successMessageTotal.message = "Record inserted successfully";

                return cb(null, successMessageTotal);
            });
        }
        
        if(req.login_status == 'logout'){
            let param = {
                logout_time: dateFormat(Date(), "yyyy-mm-dd HH:MM:ss"),
                login_status: req.login_status,
                last_activity_time : dateFormat(Date(), "yyyy-mm-dd HH:MM:ss")
            }
            
            let where = {
                user_id: req.user_id,
                user_session_id: userSessionId
            }

            Masteruserlog.upsertWithWhere(where,param, (err, response)=>{
                successMessageTotal.status = "200";
                successMessageTotal.message = "Record updated successfully";

                return cb(null, successMessageTotal);
            });
        }
        
        
        
        
        
    }
    
    Masteruserlog.remoteMethod(
        'loginlogout',
        {
            http: {verb: 'post'},
            description: 'login logout status',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });    


    Masteruserlog.usermasterlog = function(data, cb){
        Masteruserlog.findOne({
            where:{user_id: data.user_id},
            order: 'id DESC' 
        },function(err, masterLog){
            return cb(null, masterLog)
        })
    }
    
    Masteruserlog.remoteMethod(
        "usermasterlog",
        {
            http: {path:'/usermasterlog', verb: 'post'},
            description: 'Master User Log',
            accepts: {arg:"data", type:"object", http: {source: "body"} },
            returns: [{ arg: 'response', type: 'json' }]
        }
    );

        
};
