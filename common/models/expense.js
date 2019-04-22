'use strict';
var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe');

module.exports = function(Expense) {
    Expense.totalExpense = function (req, cb) {
        // console.log(req);
        // return;
        let successMessageTotal = {};
        let finalarr = [];
        let   totalexpenseobj={};
        var totalexpensevar = 0;
        let errorMessageTotal = {};
        var resp = {};
        if (!req.userId) {
            resp.status = "201";
            resp.message = "User id cannot be empty";
            cb(null, resp);
        }
        if (!req.sessionId) {
            resp.status = "201";
            resp.message = "Session id cannot be empty";
            cb(null, resp);
        }

        
        var userId = req.userId;
        
        var sessionId = req.sessionId;
       
        if(req.fromDate){
            var fromDateVar = dateFormat(req.fromDate, "isoDate");
        }
        else{
            var fromDateVar = dateFormat(new Date(),"yyyy-mm-01");
        }
        if(req.toDate){
            var toDateVar = dateFormat(req.toDate, "isoDate");
        }
        else{
            var toDateVar = dateFormat(new Date(),"yyyy-mm-dd");
        }
        
        var headNames = undefined
       // {inq: ['Tahour']}
         if(req.headName){
             var arr = [];
            arr.push(req.headName)
            headNames = {inq: arr}
         }
    
         Expense.find(
            {     fields:["amount"],
            where:{userId: userId, sessionId: sessionId,
                and:
                [ 
                    { amount_date: { lt: dateFormat(fromDateVar, "yyyy-mm-dd'T'00:00:00") } },
                                
                ],
            },

    order: ['amount_date DESC']
             } ,
             (error, resp) => {
                if(resp.length > 0)
                { 
             
                 resp.forEach(obj => {
                    totalexpensevar +=obj.amount;
                 });
                //  console.log(totalexpensevar)
             } }  )      

                        
                        Expense.find(
                            {
                                fields: ["bill_no", "expense_head_name", "amount", "amount_date"],
                                where: {userId: userId, sessionId: sessionId,
                                        and: [
                                            { amount_date: { gte: dateFormat(fromDateVar, "yyyy-mm-dd'T'00:00:00") } },
                                            { amount_date: { lte: dateFormat(toDateVar, "yyyy-mm-dd'T'23:59:59") } },
                                        ],
                                        expense_head_name: headNames
                                },
                                order: ['bill_no ASC']
                            },
                            function (err, res) {
                                // console.log(res)
                                let uniquearray = [];
                                if(err)
                                {
                                    errorMessageTotal.status = "201";
                                    errorMessageTotal.message = "Error Occured";
                                return cb(null,errorMessageTotal);
                                }
                                successMessageTotal.status = "200";
                                successMessageTotal.message = "Information fetched successfully";
                                
                                
                                if(res.length>0)
                                { 
                                    uniquearray = Dedupe(res,['bill_no']);
                                    // var i;
                                    
                                        // uniquearray[i].total_expense =totalexpensevar;
                                        // delete expenseArr[i].amount_date;
                                  
                                    // totalexpenseobj.totalamountexp=totalexpensevar;
                                    //  finalarr = uniquearray.concat(totalexpenseobj); 
                                }
                                
                                var finalobj = {};
                                finalobj.billInfo = uniquearray;
                                finalobj.totalamountexp = totalexpensevar;
                                // console.log( finalobj.totalamountexp);
                                return cb(null,successMessageTotal,finalobj);
                            });
                          
        }
                    

    Expense.getHeadName = function (req, cb) {
        let successMessage = {};
        let errorMessage = {};
    Expense.find(
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
                uniquearr = Dedupe(res,['expense_head_name']);

                uniquearr.forEach(function(data){
                let responseobj = {};
               
                responseobj.headName =  data.expense_head_name;
             
              
                responsearr.push(responseobj);
             })
            }
            return cb(null,successMessage,responsearr);
        }
    )

       
    }

    Expense.remoteMethod(
        'getHeadName',
        {
            http: {path: '/getHeadName', verb: 'get'},
            description: 'Get all the Head Name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });

    Expense.remoteMethod(
        'totalExpense',
        {
            http: {verb: 'post'},
            description: 'get total expense of student',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });
       




    };
