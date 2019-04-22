'use strict';

module.exports = function(Leaveschemedetails) {
    var errorMessage = {};
    var successMessage = {};
    Leaveschemedetails.leaveschemelist = function (data, cb) {
 
        Leaveschemedetails.find({
         
            include: [{
                relation: "leavemaster"
            },
            {
                relation: "leavescheme"
            }
                
            ]
        }, (err, res) => {
            var stafflist = [];
            if (err) {
                errorMessage.status = "201";
                errorMessage.message = "Error Occurred";
                return cb(null, errorMessage, err);
            } else {
                if (res.length == 0) {
                    successMessage.status = "200";
                    successMessage.message = "No record found.";
                    return cb(null, successMessage, res);
                } 
          else{
         var schemename='';
         var leavename='';
         var resarr=[];
        res.forEach( obj => {
            if(obj.leave_schemeId){
            schemename=obj.leavescheme().scheme_name
            
            if(obj.leave_masterId){

            leavename =obj.leavemaster().leave_name
            }
            resarr.push({schemeId: obj.leave_schemeId,leave_masterId: obj.leave_masterId, scheme_name: schemename,leave_name:leavename});
        }
        });
                    successMessage.status = "200";
                    successMessage.message = "Record fetched.";
       

         
            return cb(null, successMessage, resarr);}}
        });
    };

    Leaveschemedetails.remoteMethod(
            'leaveschemelist',
            {
                http: {path: '/leaveschemelist', verb: 'post'},
                description: 'Leave scheme list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );


    Leaveschemedetails.leaveschemedetail = function (req, cb) {
    
        var flag=0, promises = [];
        if(!req.leave_schemeId){
            return cb(null, {response_code: "201", message: "Leave scheme id cannot be blank"}); 
        }
        Leaveschemedetails.find({
         where:{  leave_schemeId: req.leave_schemeId  },
         include: {
            relation: "leavescheme",
            scope: {
                fields: ["scheme_name"],
            }
        },
         
        }, (err, res) => {
         
            if (err) {
                errorMessage.status = "201";
                errorMessage.message = "Error occurred";
                return console.error(err);
            } 
            if (res.length == 0) {
                successMessage.status = "200";
                successMessage.message = "No record found.";
                flag = 1;
            } 
            else{
                //  console.log(res);
                successMessage.status = "200";
                successMessage.message = "Record fetched.";
                flag = 1;
            }
            if(flag) return cb(null, successMessage, res);
        }
    );
    }

    Leaveschemedetails.remoteMethod(
            'leaveschemedetail',
            {
                http: {path: '/leaveschemedetail', verb: 'post'},
                description: 'Leave scheme list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Leaveschemedetails.leaveschemedetailsarr = function (req, cb) {

           var flag=0, promises = [];
           if(!req.leave_schemeId){
               return cb(null, {response_code: "201", message: "Leave scheme id cannot be blank"}); 
           }
           for (let i=0;i<req['leave_schemeId'].length;i++){
               if(req['leave_schemeId'][i]!=""){
                Leaveschemedetails.find({
                    where:{  leave_schemeId: req['leave_schemeId'][i]  },
                    include: {
                       relation: "leavescheme",
                       scope: {
                           fields: ["scheme_name"],
                       }
                   },
                    
                   }, (err, res) => {
                    
                       if (err) {
                           errorMessage.status = "201";
                           errorMessage.message = "Error occurred";
                           return console.error(err);
                       } 
                       if (res.length == 0) {
                           successMessage.status = "200";
                           successMessage.message = "No record found.";
                           flag = 1;
                       } 
                       else{
                           //  console.log(res);
                           successMessage.status = "200";
                           successMessage.message = "Record fetched.";
                           flag = 1;
                       }
                       if(flag) return cb(null, successMessage, res);
                   }
               );
               }
           }
       
       }
   
       Leaveschemedetails.remoteMethod(
               'leaveschemedetailsarr',
               {
                   http: {path: '/leaveschemedetailsarr', verb: 'post'},
                   description: 'Leave scheme list',
                   accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                   returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
               }
       );
};
