'use strict';
var dateFormat = require('dateformat');
var in_array = require('in-array');
var DateDiff = require('date-diff');
var async = require("async");
var Dedupe = require('array-dedupe');
var constant = require('./constant');
module.exports = function (Feedefaulter) {

    Feedefaulter.updatedefaulter = function (req, cb) {

        var defaulter = req.data;
        var oldUserId = req.user_id;
        var oldSessionId = req.session_id;
        var userModel = Feedefaulter.app.models.user;
        var Usersection = Feedefaulter.app.models.user_sections;
        var sessionObj = Feedefaulter.app.models.session;
        sessionObj.sessionfromerpsessionid(oldSessionId, function (err, sessionData) {
            if (err)
                return cb(null, err);
            var sessionId = sessionData.id;
            userModel.getuserbyoldid(oldUserId, function (err, userData) {
                if (err)
                    return cb(null, err);
                if (userData) {
                    var userId = userData.id;
                    Feedefaulter.destroyAll({userId: userId, sessionId: sessionId}, function (err, obj) {
                        if (err)
                            return cb(null, err);
                    });
                    Usersection.getsectionbyuserid({user_id: userId, session_id: sessionId}, function (err, sectionData) {
                        if (err)
                            throw(err);
                        if (sectionData.length > 0) {
                            var sectionId = sectionData[0].section_id;
                            var sectionName = sectionData[0].section_name;
                            var className = sectionData[0].class_name;
                            defaulter.forEach(function (value) {
                                var insertObj = {
                                    userId: userId,
                                    sectionId: sectionId,
                                    section_name: sectionName,
                                    class_name: className,
                                    sessionId: sessionId,
                                    termId: value.term_id,
                                    term_name: value.term_name,
                                    term_name_id: value.termname_id,
                                    due_date: value.fine_applicable_from,
                                    fine_amount: value.fine_amount,
                                    fee_head_id: value.fee_head_id,
                                    fee_head_name: value.fee_head,
                                    due_amount: value.due_amount,
                                    fine_basis: value.fine_charge_basis,
                                    term_start_date: dateFormat(value.term_start_date, "isoDate"),
                                    term_end_date: dateFormat(value.term_end_date, "isoDate")
                                };
                                Feedefaulter.create(insertObj, function (err, res) {
                                    if (err)
                                        return cb(null, err);
                                })
                            });
                            var res = {};
                            res.statusCode = 200;
                            res.status = "Updated Successfulyy";
                            return cb(null, res);
                        }
                    })


                }
            });
        });
    }

    Feedefaulter.duefee = function (req, cb) {
        var resp = {};
        if (!req.user_id) {
            resp.status = "201";
            resp.message = "User id cannot be empty";
            cb(null, resp);
        }
        if (!req.session_id) {
            resp.status = "201";
            resp.message = "Session id cannot be empty";
            cb(null, resp);
        }

        var studentModel = Feedefaulter.app.models.student;
        var receiptModel = Feedefaulter.app.models.receipt;
        var sessionId = req.session_id;
        var userId = req.user_id;
        var resultArr = [];
        var totalDue = 0;
        var respon = {}
console.log(userId);
        studentModel.findOne({
            where: {userId: userId},
            fields: ["dateofadmission"]
        }, function (err, res) {
            if (err) {
                if (err) {
                    resp.status = "201";
                    resp.message = "Error occurred";
                    return cb(null, resp);
                }
            }

            var dateOfAdmission = '';
            if (res.dateofadmission) {
                dateOfAdmission = res.dateofadmission;
            }

            Feedefaulter.find(
                    {
                        fields: ["termId", "term_name", "due_amount", "due_date", "fine_amount", "term_start_date", "term_end_date", "fine_basis"],
                        where: {userId: userId, sessionId: sessionId, due_amount: {gt: 0}},
                        order: ['termId ASC']
                    },
                    function (err, res) {
                        if (err) {
                            resp.status = "201";
                            resp.message = "Error occurred";
                            return cb(null, resp);
                        }
                        var termArr = [];
                        var amountArr = [];
                        var amount = 0;
                        res.forEach(function (value) {
                            var termId = value.termId;
                            if (!in_array(termArr, termId)) {
                                amount = parseInt(value.due_amount);
                                termArr.push(termId);
                            } else {
                                amount += parseInt(value.due_amount);
                            }
                            var obj = {
                                due_amount: amount,
                                term_id: termId,
                                term_name: value.term_name,
                                due_date: value.due_date,
                                fine_amount: value.fine_amount,
                                fine_basis: value.fine_basis,
                                term_start_date: value.term_start_date
                            };
                            amountArr[termId] = obj;
                        });
                        async.forEachOf(amountArr, function (value, index, callback) {

                            if (!value) {
                                callback(null);
                            } else {
                                var fineDay = value.due_date;
                                var currentDate = dateFormat(new Date(), "isoDate");
                                var termStartDate = dateFormat(value.term_start_date, "yyyy-mm-" + fineDay);
                                async.waterfall(
                                        [
                                            function (callback) {
                                                receiptModel.studentReceiptDetail({userId: userId, termId: value.term_id, sessionId: sessionId}, function (err, res) {
                                                    if (res == null) {
                                                        if (dateOfAdmission) {
                                                            var termDate = dateFormat(value.term_start_date, "isoDate");
                                                            dateOfAdmission = dateFormat(dateOfAdmission, "isoDate");
                                                            if (dateOfAdmission > termDate) {
                                                                termStartDate = dateFormat(dateOfAdmission, "yyyy-mm-" + fineDay);
                                                            }
                                                        }

                                                        if (termStartDate <= currentDate) {
                                                            var diff = new DateDiff(new Date(currentDate), new Date(termStartDate));
                                                            if (value.fine_basis == 'monthly') {
                                                                value.due_amount = value.due_amount + parseInt(value.fine_amount) * parseInt(diff.months());
                                                            } else {
                                                                value.due_amount = value.due_amount + parseInt(value.fine_amount) * parseInt(diff.days());
                                                            }
                                                        }

                                                    } else {

                                                        value.due_amount = value.due_amount;
                                                    }

                                                    totalDue = totalDue + value.due_amount;
                                                    var obj = {
                                                        term_id: value.term_id,
                                                        term_name: value.term_name,
                                                        due_date: termStartDate,
                                                        due_amount: value.due_amount
                                                    }
                                                    resultArr.push(obj);
                                                    callback(null, resultArr);
                                                });

                                            }
                                        ], function (err, res) {
                                    callback(null, res);
                                });

                            }


                        }, function (err, res) {
                            respon.dueList = resultArr;
                            respon.totalDues = totalDue;
                            resp.status = "200";
                            resp.message = "Record found";
                            cb(null, resp, respon);
                        });

                    });
        });
    }
    Feedefaulter.termwiseduefee = function (req, cb) {
        var resp = {};
        if (!req.user_id) {
            resp.status = "201";
            resp.message = "User id cannot be empty";
            cb(null, resp);
        }
        if (!req.session_id) {
            resp.status = "201";
            resp.message = "Session id cannot be empty";
            cb(null, resp);
        }

        if (!req.term_id) {
            resp.status = "201";
            resp.message = "Term id cannot be empty";
            cb(null, resp);
        }
        var userId = req.user_id;
        var sessionId = req.session_id;
        var termId = req.term_id;
        var amountArr = {};
        var respArr = [];
        var receiptModel = Feedefaulter.app.models.receipt;
        var studentModel = Feedefaulter.app.models.student;

        studentModel.findOne({
            where: {userId: userId},
            fields: ["dateofadmission"]
        }, function (err, res) {
            if (err) {
                if (err) {
                    resp.status = "201";
                    resp.message = "Error occurred";
                    return cb(null, resp);
                }
            }

            var dateOfAdmission = '';
            if (res.dateofadmission) {
                dateOfAdmission = res.dateofadmission;
            }
            Feedefaulter.find(
                    {
                        fields: ["termId", "term_name", "due_amount", "due_date", "fine_amount", "term_start_date", "term_end_date", "fine_basis", "fee_head_name", "fee_head_id"],
                        where: {userId: userId, sessionId: sessionId, termId: {inq: termId}, due_amount: {gt: 0}},
                        order: ['termId ASC']
                    },
                    function (err, res) {
                        if (err) {
                            resp.status = "201";
                            resp.message = "Error occurred";
                            return cb(null, resp);
                        }


                        var fineAmount = 0;
                        var dueDate = '';
                        var termStartDate = '';
                        var fineBasis = '';
                        var currentDate = dateFormat(new Date(), "isoDate");
                        var fineTermArr = [];
                        async.forEachOf(res, function (value, index, eachcallback) {
                            if (!value) {
                                eachcallback();
                            } else {

                                dueDate = value.due_date;
                                termStartDate = value.term_start_date;
                                fineBasis = value.fine_basis;
                                if (amountArr[value.fee_head_name]) {
                                    amountArr[value.fee_head_name] = amountArr[value.fee_head_name] + value.due_amount;
                                } else {
                                    amountArr[value.fee_head_name] = value.due_amount;
                                }

                                respArr[value.fee_head_id] = {fee_head: value.fee_head_name, due_amount: amountArr[value.fee_head_name]};


                                async.waterfall([
                                    function (callback) {

                                        if (in_array(fineTermArr, value.termId)) {
                                            callback();
                                        } else {
                                            fineTermArr.push(value.termId);
                                            receiptModel.studentReceiptDetail({userId: userId, termId: value.term_id, sessionId: sessionId}, function (err, res) {
                                                if (res == null) {
                                                    var termStartDate = dateFormat(termStartDate, "yyyy-mm-" + dueDate);
                                                    if (dateOfAdmission) {
                                                        var termDate = dateFormat(value.term_start_date, "isoDate");
                                                        dateOfAdmission = dateFormat(dateOfAdmission, "isoDate");
                                                        if (dateOfAdmission > termDate) {
                                                            termStartDate = dateFormat(dateOfAdmission, "yyyy-mm-" + dueDate);
                                                        }
                                                    }

                                                    if (termStartDate <= currentDate) {
                                                        var diff = new DateDiff(new Date(currentDate), new Date(termStartDate));
                                                        if (fineBasis == 'daily') {
                                                            fineAmount = fineAmount + parseInt(value.fine_amount) * parseInt(diff.days());
                                                        } else {
                                                            fineAmount = fineAmount + parseInt(value.fine_amount) * parseInt(diff.months());
                                                        }
                                                    }
                                                } else {
                                                    fineAmount = fineAmount;
                                                }
                                                
                                                callback();

                                            });
                                        }
                                    }
                                ], function (err, res) {

                                    eachcallback(null);
                                });

                            }
                        }, function (err, res) {
                            respArr.push({fee_head: "Fine Amount", due_amount: fineAmount});
                            respArr = respArr.filter(function (val) {
                                return val !== null;
                            });
                            resp.status = "200";
                            resp.message = "Record found";
                            cb(null, resp, respArr);
                        });

                    });
        });
    }

    Feedefaulter.remoteMethod(
            'updatedefaulter',
            {
                http: {verb: 'post'},
                description: 'Update Defaulter',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Feedefaulter.remoteMethod(
            'duefee',
            {
                http: {verb: 'post'},
                description: 'get due fee of student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            });
    Feedefaulter.remoteMethod(
            'termwiseduefee',
            {
                http: {verb: 'post'},
                description: 'get due fee of student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            });
    /* defaulter API by arjun */        
    Feedefaulter.defaulter = (data, cb) => {
        if (!data)
            return cb(null, {status: "201", message: "Bad Request"});
        else if (!data.session_id)
            return cb(null, {status: "201", message: "Session Id cannot be blank"});
        Feedefaulter.find(
                {
                    fields: ["userId", "termId", "term_name", "due_amount", "due_date", "fine_amount", "term_start_date", "term_end_date", "fine_basis", "fee_head_name", "fee_head_id"],
                    where: {"sessionId": data.session_id, "due_amount": {gt: 0}, status: 'Active'},
                    include: {
                        relation: "user",
                        scope: { fields:"status",
                            where: {status: 'Active'}
                        }
                    }
                },
                (err, res) => {
                    
            if (err)
                throw err;
            if (res) {

                let currentDate = dateFormat(new Date(), "isoDate");
                let dueDate = '';
                let termStartDate = '';
                let arr = [];
                arr = res.filter(value => {
                    termStartDate = dateFormat(value.term_start_date, "yyyy-mm-" + value.due_date);
                    if (termStartDate <= currentDate && value.user()) {
                        return value.termId;
                    }
                })
                let arrs = Dedupe(arr, ['userId']);
                let defaulter_count = arrs.length;
                cb(null, {
                    status: "200",
                    message: "Information fetched successfully"
                },
                        {
                            "defaulter_count": defaulter_count
                        }
                );
            }
        }
        )
    }

    Feedefaulter.remoteMethod(
            'defaulter',
            {
                http: {verb: "POST"},
                description: "Know about fee defaulter",
                accepts: {arg: "data", type: "object", http: {source: "body"}},
                returns: [{arg: "response_status", type: "json"}, {arg: "response", type: "object"}]
            })

            Feedefaulter.sessionfeedefaulter=function(req,cb){
                let msg = {}, resarr = [];
        
                if (!req.session_id){
                    return cb(null, {status: "201", message: "Session Id cannot be blank"});
                }
                if(req.term){
                    var term_name=req.term;
                }
                else{
                    var term_name=undefined;
                }
                if(req.fee_head){
                    var feeHead=req.fee_head;
                }
                else{
                    var feeHead=undefined;
                }
         var class_name;
                         if(req.class_name){
                         class_name=req.class_name;
                }
                
                Feedefaulter.find(
                    {   
                        fields:['sectionId','due_amount','userId','term_name','fee_head_name'],   
                        where: {sessionId: req.session_id,due_amount: {gt: 0}, term_name:term_name,fee_head_name:feeHead,status:'Active'}, 
                        include:
                           [
                               {
                                   relation: "section",
                                    scope: {
                                        fields: ["section_name", "id", "class_name", "classId"],
                                        where:{class_name:class_name}
                                    }
                                },
                                {
                                    relation: 'user',
                                    scope:{
                                        where: {status: 'Active'}
                                    }
                                }
                            ],
                        order:"sectionId ASC",   
                    },
                    (err, res) => { 
                    if (err)
                        throw err;
                    if (res) {
                    msg = {
                            status: "200",
                            message: "Information fetched successfully"
                    }
                    var arr = [];
                var count = 0;
                
                var total=0;
                var amount = 0;
                var sectionarr=[];  
            
                var obj={};    
                var userIdArr = {};
                     /* sort */
                    //  console.log(section().classId);
                    res.sort((a,b)=>
                    {if(a.section() && b.section()){
                            if (a.section().classId < b.section().classId) {
                                return -1;
                            } else   if (a.section().classId > b.section().classId)  {
                                return 1;
                            } else {
                                return 0;
                            }
                            }
                    });
                    /* ends */
                    res.forEach((value) => {
                        value = value.toJSON();
                        if(value.section && value.user) {
                        var className = value.section.class_name;
                        if(className  in obj){
                            if(!(value.userId in userIdArr)){
                                userIdArr[value.userId] = value.userId;
                                count++;
                            }
                            
                            amount = amount + value.due_amount;
                            obj[className] = {due_amount:amount,user_count :count,class_name:className };
                        }else{
                        
                            amount = value.due_amount;
                            userIdArr[value.userId] = value.userId;
                            count = 1;
                            obj[className] = {due_amount : amount,user_count : count,class_name : className};
                        count=1;
                        }
                    }
                    });
                   
                    var respArr = [];
                    for(var key in obj){
                        respArr.push(obj[key]);
                    }
                   
                    return cb(null, msg, respArr);         
            }
            });
        
            }
            Feedefaulter.remoteMethod(
                'sessionfeedefaulter',
                {
                    http: {verb: 'post'},
                    description: 'Get all the fee defaulter of a session',
                    accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                    returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
                }
        );

        Feedefaulter.sessiondetaileddefaulter=function(req,cb){
            let msg = {}, resarr = [];
    
            if (!req.session_id){
                return cb(null, {status: "201", message: "Session Id cannot be blank"});
            }
            if(req.term){
                var term_name=req.term;
            }
            else{
                var term_name=undefined;
            }
            if(req.fee_head){
                var feeHead=req.fee_head;
            }
            else{
                var feeHead=undefined;
            }
            Feedefaulter.find(
                {   
                    fields:['sectionId','due_amount','userId','term_name', 'termId'],   
                    where: {sessionId: req.session_id,due_amount: {gt: 0},term_name:term_name,fee_head_name:feeHead,status:'Active'}, 
                    include:[
                    {
                        relation: "section",
                        scope: {
                            fields: ["class_name"],
                          } 
                        },
                             {   relation: "user",
                                scope: {
                                    fields: ["id"],
                                    where: {status: 'Active'},
                                    include:
                                    {
                                        relation: "students",
                                        scope: {
                                            fields: ['name','admission_no']
                                        }
                                    }
                                }}
                            ],
                            
                        
    
                    
                    order:["sectionId ASC", "termId ASC"],
                   
                },
                (err, res) => {
            if (err)
                throw err;
            if (res) {
                var admission_no,class_name,name;
                var array=[];
      msg = {
                    status: "200",
                    message: "Information fetched successfully"
            }
            let userObj = {}, amountSum = 0;
            
            res.forEach( obj => {
                
                if(obj.user()){
                if(obj.userId in userObj ){
                    if(obj.termId in userObj[obj.userId]){
                        amountSum = amountSum + obj.due_amount;
                        obj.due_amount = amountSum;
                        userObj[obj.userId][obj.termId] = obj;
                    }else{
                        amountSum = obj.due_amount;
                        obj.due_amount = amountSum;
                        userObj[obj.userId][obj.termId] = obj;
                    }
                    
                    }else{
                        amountSum = obj.due_amount;
                        obj.due_amount = amountSum;
                        userObj[obj.userId] = {};
                        userObj[obj.userId][obj.termId] = obj;
                    
                    }
                }
                });

                    var arr = [], objctt = {};
                       
                    for(var userId in userObj){
                        
                        var sectionArr = [];
                        var classAmount = 0;
                        for(var termId in  userObj[userId]){
                            name = '';
                            admission_no = '';
                            objctt = userObj[userId][termId]
                            if(objctt.user()){  
                                if(objctt.user().students())
                                name=objctt.user().students().name;
                                admission_no=objctt.user().students().admission_no;
                            }
                            if(objctt.section()){
                                class_name=objctt.section().class_name
                            }
                            
                            admission_no= admission_no.substr(constant.ADM.length, admission_no.length)
                            array.push({term_id: objctt.termId, user_id: objctt.userId,term_name: objctt.term_name , amount: objctt.due_amount,class:class_name,name:name,admission_no:admission_no});
               
                      
                        }
                       
                    }
                

                    
            return cb(null, msg, array);
                                     
        }
        });
    
        }
        Feedefaulter.remoteMethod(
            'sessiondetaileddefaulter',
            {
                http: {verb: 'post'},
                description: 'Get all the fee defaulter of a session',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Feedefaulter.getHeadName=function(req,cb){
        let msg = {}, resarr = [];
    
       
        Feedefaulter.find(
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
    Feedefaulter.remoteMethod(
        'getHeadName',
        {
            http: {path: '/getHeadName', verb: 'get'},
            description: 'Get all the Head Name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });


        Feedefaulter.getTermname=function(req,cb){
            let msg = {}, resarr = [];
        
           
            Feedefaulter.find(
                {    fields:['term_name'],   
                  
                   
                    
                },
                (err, res) => {
            if (err)
                throw err;
            if (res) {
          
                res = Dedupe(res, ['term_name']);
        
            return cb(null, msg, res);
            }
        });
        
        }
        Feedefaulter.remoteMethod(
            'getTermname',
            {
                http: {path: '/getTermname', verb: 'get'},
                description: 'Get all the Head Name',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            });
    

        
            
        Feedefaulter.getstudentdues = function(req,cb){

            var msg = {};
            var conditions = {};
            if(req.fee_structure_id > 0 && req.section_id > 0 && req.session_id > 0 && req.userId > 0){

                Feedefaulter.find({
                    include :[{
                        relation:'dueshead',
                        scope:{
                            fields:['fee_head_name','priority','id','cgst','sgst','igst','sac_hsn_code','priority'],
                            
                        },
                          
                        },
                        {
                            relation: 'term',
                            scope:{fields:['term_name']}                            
                        }
                    ],
                    where:{
                        sectionId: req.section_id,
                        sessionId: req.session_id,
                        fee_structure_id: req.fee_structure_id,
                        userId: req.userId,
                        status:"Active",
                        due_amount:{gt:0}
                    },order:["term_name_id ASC","priority ASC"]
                },function(error,response){

                    if(error){
                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    }else{
                        msg.status = "200";
                        msg.messasge = "Due Fee Listing term and head wise...";
                        cb(null, msg, response);
                    }

                });
                    
               

            }
            else{
                msg.status = "201";
                msg.messasge = "fee_strcuture_id,section_id,session_id,user_id,fee_head_id > 0";
                cb(null,msg);
            }

        };

        Feedefaulter.remoteMethod(
            'getstudentdues',
            {
                http: { path: '/getstudentdues', verb: 'post' },
                description: 'getstudentdues',
                accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
                returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
            }
        );





        Feedefaulter.resetfeedefaulter = function(req,cb){

            var msg = {};
            var defaulterModel =  Feedefaulter.app.models.fee_defaulter;
            var receiptDetailModel = Feedefaulter.app.models.receipt_detail;
                
            var jsonReq = {
                section_id:req.section_id,
                session_id:req.session_id,
                userId:req.userId,
                fee_structure_id:req.fee_structure_id,
                status:"Active"
            };
            receiptDetailModel.find({where:jsonReq},function(e,rd){

                if(e){
                    msg.status = 201;
                    msg.message = "Something went wrong..."
                    cb(null,msg);
                }
                else{
                    
                    var jsonReq = {
                        section_id:req.section_id,
                        session_id:req.session_id,
                        userId:req.userId,
                        fee_structure_id:req.fee_structure_id,
                        status:"Active"
                    }
        
                  var studentFeeModel =  Feedefaulter.app.models.student_fee;
        
                  studentFeeModel.find({
                    include :[{
                        relation:'dueshead',
                        },
                        {
                            relation: 'term',
                        }
                    ],  
                    where:jsonReq},function(err,res){
        
                    if(err){
                    msg.status = "201";
                    msg.messasge = "Error occured";
                    cb(null,msg);
                    }else{
                        if(res.length == 0){
                            msg.status = "200";
                            msg.messasge = "No fee assigned...";
                            cb(null,msg);
                        }else{
                            
                            // make previuos defaulter entries blank...

                            defaulterModel.updateAll(jsonReq, {status:"Inactive"}, function (updateerr, updateData) {
                                if(updateerr) {
                                    msg.status = "201";
                                    msg.messasge = "Something went wrong...";
                                    cb(null,msg);
                                }else{
                                    var promiseArr = [];
                            
                            let i=0;
                            var due_amount = 0.00;
                            var feeDefaulterArr = [];
                            for(i=0;i<res.length;i++){
                                var pushJson = {};
                                var paid_fee = 0;

                                if(rd.length == 0){
                                    paid_fee = 0;
                                }else{
                                var temparr = rd.filter(ele => (ele.term_id == res[i].term_id && ele.fee_head_id == res[i].feehead_id));
                                // calculate paid fee to reset the defaulter table...
    
                                temparr.forEach(function(tempObj){
                                    paid_fee = paid_fee + parseFloat(tempObj.amount);
                                });
                                }

                                
                                due_amount = res[i].amount - paid_fee;
                                
                                 pushJson = {
                                    sectionId:req.section_id,
                                    sessionId:req.session_id,
                                    userId:req.userId,
                                    fee_structure_id:req.fee_structure_id,
                                    term_name_id:res[i].term_id,
                                    term_name:res[i].term().term_name,
                                    fee_head_id:res[i].feehead_id,
                                    fee_head_name:res[i].dueshead().fee_head_name,
                                    priority:res[i].dueshead().priority,
                                    cgst:res[i].cgst,
                                    sgst:res[i].sgst,
                                    igst:res[i].igst,
                                    due_amount:due_amount,
                                    status:"Active"
                                };
                                
                                promiseArr.push(defaulterModel.create(pushJson));
                                            
                                 
                                
                            }
        
                            Promise.all(promiseArr).then(function(data){
        
                                msg.status = "200";
                                msg.messasge = "Reset defaulter executed successfully...";
                                cb(null,msg);
                            });
                                }
                            });

                                    
        
                        }
                    }
        
                  });





                }

            });    

                
                
            
           
    
        }
    
    
         
    
    
        
        Feedefaulter.remoteMethod(
            'resetfeedefaulter',
            {
                http: { path: '/resetfeedefaulter', verb: 'post' },
                description: 'resetfeedefaulter',
                accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
                returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
            }
        );

        Feedefaulter.updateduesafterfeestructurechange=function(req,cb){
        Feedefaulter.find({where:{userId:req.userId,sessionId:req.sessionId,status:'Active'},
            order:['term_name_id ASC','priority ASC'],
         include:{   relation:"dueshead"}

        },function(err,res){
            if(res){
              
              var arr_filter=  res.filter(
                  index => index.dueshead().is_optional != 1
                );
                // console.log(arr_filter)
                var total_paid_amount=req.total_paid
                var index;
                arr_filter.every((element,val) => {
  
                    // if(element.dueshead().is_optional==0){
                     total_paid_amount=total_paid_amount - element.due_amount
                   
                    if(total_paid_amount<0)
                    { console.log(total_paid_amount)
                     
                        index=val
                        console.log(index)
                        //  console.log(total_paid_amount);
                        return false;
                    }
                    else{
                        return true;
                    }
                    // return true;
                // }
                });
                if(index ||index==0){
                    console.log(index)
                    arr_filter[index].due_amount=Math.abs(total_paid_amount);
                var i;
                var newdata=[];
                    for (i=index;i<arr_filter.length;i++){
                        // delete res[i].id;
                        // console.log(res[i])
                        newdata.push(arr_filter[i])
                    }
                  
                    Feedefaulter.updateAll({userId:req.userId,sessionId:req.sessionId},{"status":"Inactive"},function(errs,respo){
                    if(respo){
                        var promises=[]
                        newdata.forEach(element => {
                            var obj={
                                "sectionId":element.sectionId,
                                "sessionId":element.sessionId,
                                "userId":element.userId,
                                "termId":element.termId,
                                "term_name":element.term_name,
                                "term_name_id":element.term_name_id,
                                "fee_head_id":element.fee_head_id,
                                "fee_head_name":element.fee_head_name,
                                "priority":element.priority,
                                "fee_structure_id":element.fee_structure_id,
                                "due_amount":element.due_amount,
                                "cgst": element.cgst,
                                "sgst": element.sgst,
                                "igst": element.igst,
                                "status": 'Active',
                                "due_date": element.due_date,
                                "fine_amount": element.fine_amount,
                                "fine_basis": element.fine_basis,
                                "term_start_date": element.term_start_date,
                                "term_end_date": element.term_end_date,
                              
                            }
                         
                            // console.log(element)
                            // promises.push(new Promise((resolve, reject) => {
                                Feedefaulter.create(obj,function(e,r){
                                    // console.log("hello")
                                // if(e){
                                //     console.log(e)
                                //     reject(e)
                                // }
                                // if(r){
                                //     resolve("success")
                                // }
                            })
                        // }));
                        });
                        // Promise.all(promises).then(respon => {
                        //     console.log(respon)
                        //     var msg;
                        //     msg.status = "200";
                        //     msg.message = "Information inserted successfully";
                        //     return cb(null, msg);
                        //   })  
                        cb(null,arr_filter)
                    }
                })
            }
               else if((index ==undefined ||index<0)  && total_paid_amount>=0){
                Feedefaulter.updateAll({userId:req.userId,sessionId:req.sessionId},{"status":"Inactive"},function(errs,respo){
                if(respo){
                    cb(null,respo)
                }
                })

               }
            
            }
        })
        
        }
        Feedefaulter.remoteMethod(
            'updateduesafterfeestructurechange',
            {
                http: { path: '/updateduesafterfeestructurechange', verb: 'post' },
                description: 'updateduesafterfeestructurechange',
                accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
                returns:  { arg: 'response_status', type: 'json' }
            }
        );
};
