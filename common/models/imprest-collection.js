'use strict';
var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe');
var pdf = require('html-pdf');
var constantval = require('./constant');
var fs = require('fs');
module.exports = function (Imprestcollection) {
    Imprestcollection.totalDeposit = (req, cb) => {

        let successMessageTotal = {}, errorMessageTotal = {}, expenseArray = [], finalarr = [];
        let resp = {};
        var finalobj = {};
        var totalbalnace = 0;
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



        if (req.fromDate) {
            var fromDateVar = dateFormat(req.fromDate, "isoDate");
        } else {
            var fromDateVar = dateFormat(new Date(), "yyyy-mm-01");
        }
        if (req.toDate) {
            var toDateVar = dateFormat(req.toDate, "isoDate");
        } else {
            var toDateVar = dateFormat(new Date(), "yyyy-mm-dd");
        }

        var ExpenseObj = Imprestcollection.app.models.expense;
        var reqobj = {userId: req.userId, sessionId: req.sessionId, fromDate: req.fromDate, toDate: req.toDate};

        new Promise((resolve, reject) => {
            ExpenseObj.totalExpense(reqobj, (err, response, data) => {
                expenseArray = data;


//   console.log(data);

// if(expenseArray.billInfo.length==0 && expenseArray.billInfo)
// {  var finalobj = {};
//     finalobj.receipt = [];
//                         finalobj.openingbalance = 0;


//                         return cb(null, successMessageTotal, finalobj);
// }
                resolve(expenseArray);
            })
        }).then(expenseArr => {
            // console.log("hjhkjhjk");
            var opening_balance = 0;
            var totalimprestdeposit = 0;
            let totalamount = expenseArr.totalamountexp;
            //   console.log(totalamount);
            Imprestcollection.find(
                    {fields: ["amount"],
                        where: {userId: userId, sessionId: sessionId,
                            and:
                                    [
                                        {receipt_date: {lt: dateFormat(fromDateVar, "yyyy-mm-dd'T'00:00:00")}},
                                    ],
                        },

                        order: ['receipt_date DESC']
                    },
                    (error, resp) => {
                //  console.log(resp);
                // if(error)
                // {
                //     errorMessageTotal.status = "201";
                //     errorMessageTotal.message = "Error Occured";

                //     return cb(null, errorMessageTotal);
                // }
                //  console.log("---------"+totalamount);
                if (resp)

                {
                    if (resp.length > 0)
                    {
                        resp.forEach(obj => {
                            totalimprestdeposit += obj.amount;
                        });
                    }
                    if (totalimprestdeposit == 0) {
                        opening_balance -= totalamount;
                    } else {
                        opening_balance = totalimprestdeposit - totalamount;
                    }

                    // console.log(opening_balance);

                    Imprestcollection.find(
                            {
                                fields: ["receipt_no", "amount", "receipt_date", "payment_mode"],
                                where: {userId: userId, sessionId: sessionId,
                                    and:
                                            [
                                                {receipt_date: {gte: dateFormat(fromDateVar, "yyyy-mm-dd'T'00:00:00")}},
                                                {receipt_date: {lte: dateFormat(toDateVar, "yyyy-mm-dd'T'23:59:59")}},
                                            ],

                                },
                                order: ['receipt_date DESC']

                            },
                            (err, res) => {

                        let uniquearray = [];

                        if (err)
                        {
                            errorMessageTotal.status = "201";
                            errorMessageTotal.message = "Error Occured";

                            return cb(null, errorMessageTotal);
                        }
                        successMessageTotal.status = "200";
                        successMessageTotal.message = "Information fetched successfully";

                        if (res)
                        {
                            //  console.log(expenseArr.billInfo)
                            // console.log(expenseArr.totalamountexp)
                            uniquearray = Dedupe(res, ['receipt_no']);
                            expenseArr = Dedupe(expenseArr.billInfo, ['bill_no']);

                            var i;
                            for (i = 0; i < uniquearray.length; i++) {
                                uniquearray[i].cmndate = uniquearray[i]['receipt_date'];
                                delete uniquearray[i].receipt_date;
                            }
                            var totalimprestdeposit = 0;
                            var totalexpenseamount = 0;
                            var totalopeningbalance = 0;

                            var i;
                            for (i = 0; i < expenseArr.length; i++) {
                                expenseArr[i].cmndate = expenseArr[i]['amount_date'];
                                delete expenseArr[i].amount_date;
                            }
                            finalarr = uniquearray.concat(expenseArr);

                            finalarr.sort((a, b) => {
                                return (a.cmndate > b.cmndate) ? 1 : ((b.cmndate > a.cmndate) ? -1 : 0);
                            });





                        }
                        finalobj.receipt = finalarr;
                        finalobj.openingbalance = opening_balance;
                        // console.log("+++" + finalobj.openingbalance);

                        return cb(null, successMessageTotal, finalobj);
                    });

                }
            });
            //console.log("+++"+opening_balance);






        })
    }
    Imprestcollection.studentledger = (req, cb) => {
        let successMessageTotal = {}, errorMessageTotal = {};
        if (req.posthtml) {
            var posthtml = req.posthtml;
            // console.log(req);
            var pdfPath = constantval.LOCAL_URL + '/' + constantval.PROJECT_NAME + '/upload/studentledger/' + 1 + '.pdf';
            var pdfpath2 = '../' + constantval.PROJECT_NAME + '/upload/studentledger/' + 1 + '.pdf';
        }
        var options = {format: 'A4',encode :'utf8'};

        pdf.create(posthtml, options).toFile(pdfpath2, function (err, res) {
            if (err)
            {
                errorMessageTotal.status = "201";
                errorMessageTotal.message = "Error Occured";

                return cb(null, errorMessageTotal);
            }
            successMessageTotal.status = "200";
            successMessageTotal.message = "Information fetched successfully";

            fs.chmod(pdfPath, '0777', function (err) {
                if (err)
                    return cb(null, err);
            });

            return cb(null, pdfPath);
        });


    }
    Imprestcollection.remoteMethod(
            'studentledger',
            {
                http: {verb: 'post'},
                description: 'get pdf of student ledger',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            });

    Imprestcollection.remoteMethod(
            'totalDeposit',
            {
                http: {verb: 'post'},
                description: 'get total Deposit of student',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            });

    //Api for management dashboard by Ravi 

    Imprestcollection.miscellaneous = (req, cb) => {
        var msg = {};
        var response = {};
        if (!req) {
            msg.status = '201';
            msg.message = 'Request cannot be blank';
            return cb(null, msg);
        }
        Imprestcollection.find(
                {
                    where: {type: "Other"}
                },
                (err, resp) => {
            if (err) {
                msg.status = '201';
                msg.message = 'Error occurd';
                return cb(null, msg);
            }
            if (resp) {
                msg.status = 200;
                msg.message = 'Information fetched successfully';

                let till_date = 0, last_month = 0, today = 0;
                let todayobj = new Date();
                let todayDate = Imprestcollection.getisoDate(todayobj);
                resp.forEach(value => {
                    if (Imprestcollection.getisoDate(value.receipt_date) == todayDate)
                        today += value.amount;
                    else if (value.receipt_date.getMonth() < todayobj.getMonth() && value.receipt_date.getMonth() + 1 == todayobj.getMonth())
                        last_month += value.amount;

                    till_date += value.amount;
                });
                response = {
                    "misc_collection": {
                        "today": today,
                        "last_month": last_month,
                        "till_date": till_date
                    }
                }
                msg = {
                    status: "200",
                    message: "Information fetched successfully"
                }
                cb(null, msg, response);
            }
        });
    }

    Imprestcollection.remoteMethod(
            'miscellaneous', {
                http: {verb: 'post'},
                description: 'Get miscellaneous collection amount',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            }
    );

    Imprestcollection.miscellaneouspercent = (req, cb) => {
        var msg = {};
        var response = {};
        if (!req) {
            msg.status = '201';
            msg.message = 'Request cannot be blank';
            return cb(null, msg);
        }
        Imprestcollection.find(
                {
                    where: {type: "Other"}
                },
                (err, resp) => {
            if (err) {
                msg.status = '201';
                msg.message = 'Error occurd';
                return cb(null, msg);
            }
            if (resp) {
                msg.status = 200;
                msg.message = 'Information fetched successfully';
                let sum = 0;
                resp.forEach(value => {
                    sum += value.amount;
                });
                response = {
                    "misc_collection": sum
                }
                msg = {
                    status: "200",
                    message: "Information fetched successfully"
                }
                cb(null, msg, response);
            }
        });
    }

    Imprestcollection.remoteMethod(
            'miscellaneouspercent', {
                http: {verb: 'post'},
                description: 'Get miscellaneous collection amount percent',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            }
    );
    Imprestcollection.isValidDate = d => {
        return d instanceof Date && !isNaN(d);
    } 
    Imprestcollection.getisoDate = dateobj => {
	if(!Imprestcollection.isValidDate(dateobj)){
            dateobj = new Date(dateobj);
        }
        var dd = dateobj.getDate();
        var mm = dateobj.getMonth() + 1;
        var yyyy = dateobj.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        return yyyy + '-' + mm + '-' + dd;
    }

    // Miscellaneous collection session Wise 

    Imprestcollection.miscellaneouscollection = (req, cb) => {
        var msg = {};
        if (!req) {
            msg.status = '201';
            msg.message = 'Request cannot be empty';
            return cb(null, msg);
        }
        if (!req.session_id) {
            msg.status = '201';
            msg.message = 'Session id cannot be empty';
            return cb(null, msg);
        }
        var obj = {};
        if(req.from_date){
            //var fromDateVar = dateFormat(req.from_date, "isoDate");
            obj = {receipt_date: { gte: dateFormat(req.from_date, "yyyy-mm-dd") } };
        }
       
        if(req.to_date){
            var toDateVar = dateFormat(req.to_date, "isoDate");
        }
        else{
            var toDateVar = dateFormat(new Date(),"yyyy-mm-dd");
        }
        if(req.income_type){
            var incomeType=req.income_type;
          }
          else{
            var incomeType=undefined;
          }
          if(req.created_by){
            var createdBy=req.created_by;
          }
else{
    var createdBy=undefined;
}


        Imprestcollection.find(
                {
                    where: {type: "Other", sessionId: req.session_id,income_name:incomeType,
                    and: [
                         obj,
                        { receipt_date: { lte: dateFormat(toDateVar, "yyyy-mm-dd") } },
                    ],created_by:createdBy},
                    order : "income_name ASC"
                }
        , (err, resp) => {
            if (err) {
                msg.status = 'Error occurd';
                msg.message = 'Request cannot be empty';
                return cb(null, msg);
            }
            if (resp) {
                var arr = [];
               var count = 0;
               var amount = 0;
                resp.forEach((collection) => {
                    
                    var incomeName = collection.income_name;
                    if (incomeName in arr) {

                          amount = amount + collection.amount;
                        count = count +  1;
                        
                        obj = {
                            income_name : incomeName,
                            receipt_count : count,
                            receipt_amount : amount
                        }

                    } else {
                        amount = collection.amount;
                        count = 1;
                        var obj = {
                            income_name : incomeName,
                            receipt_count :count,
                            receipt_amount : amount
                        }
                        
                        
                    }
                    arr[incomeName] = obj;
                  
                });
                var tempArr = [];
                for(var key in arr){
                    tempArr.push(arr[key]);
                }
                
            }
            msg.status = '200';
            msg.message = 'Information fetched successfully';
            cb(null, msg, tempArr)

        })

    }

    Imprestcollection.remoteMethod(
            'miscellaneouscollection', {
                http: {verb: 'post'},
                description: 'Get miscellaneous collection amount session wise',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            }
    );



    Imprestcollection.feecollectorname=function(req,cb){
        let msg = {}, resarr = [];

        if (!req.session_id){
            return cb(null, {status: "201", message: "Session Id cannot be blank"});
        }
        Imprestcollection.find(
            {   
                fields:['created_by'],   
                where: {sessionId: req.session_id}, 
                include:
                {
                    relation: "createdby",
                    scope: {
                        fields: ["user_name", "id"],
                        include:
                        {
                            relation: "staff",
                            scope: {
                                fields: ["name"]
                            }
                        }
                    }

                }
            },
            (err, res) => {
        if (err)
            throw err;
        if (res) {
        let user_name, staff_name;

        res.forEach( obj => {
            if(obj.created_by){
            user_name=obj.createdby().user_name;
            staff_name = (obj.createdby().staff()) ? obj.createdby().staff().name : obj.createdby().user_name;
            resarr.push({user_id: obj.created_by,user_name: user_name, name: staff_name});
            }
        });
        msg = {
                status: "200",
                message: "Information fetched successfully"
        }
        resarr = Dedupe(resarr, ['user_id']);

        return cb(null, msg, resarr);
        }
    });

    }
    Imprestcollection.remoteMethod(
        'feecollectorname',
        {
            http: {verb: 'post'},
            description: 'Get User Name of fee collecor',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
);

Imprestcollection.sessiondetailedreceipt=function(req,cb){
    let msg = {}, resarr = [];

    if (!req.session_id){
        return cb(null, {status: "201", message: "Session Id cannot be blank"});
    }
    var obj = {};
    if(req.from_date){
        //var fromDateVar = dateFormat(req.from_date, "isoDate");
        obj = {receipt_date: { gte: dateFormat(req.from_date, "yyyy-mm-dd") } };
    }
    else{
        var fromDateVar = '';//dateFormat(new Date(),"yyyy-mm-dd");
    }
    if(req.to_date){
        var toDateVar = dateFormat(req.to_date, "isoDate");
    }
    else{
        var toDateVar = dateFormat(new Date(),"yyyy-mm-dd");
    }
    if(req.income_type){
        var incomeType=req.income_type;
      }
      else{
        var incomeType=undefined;
      }
      if(req.created_by){
        var createdBy=req.created_by;
      }
else{
var createdBy=undefined;
}
    Imprestcollection.find(
        {   
            fields:['userId','amount','receipt_no','description_type','income_name'],   
            where: {sessionId: req.session_id,userId:0,income_name:incomeType,
                and: [
                  obj,
                    { receipt_date: { lte: dateFormat(toDateVar, "yyyy-mm-dd") } },
                ],created_by:createdBy}, 
            
        },
        (err, res) => {
    if (err)
        throw err;
    if (res) {
    let user_name, staff_name;

   
    msg = {
            status: "200",
            message: "Information fetched successfully"
    }


    return cb(null, msg, res);
    }
});

}
Imprestcollection.remoteMethod(
    'sessiondetailedreceipt',
    {
        http: {verb: 'post'},
        description: 'Detailed view of session wise collection',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
    }
);
Imprestcollection.incomename=function(req,cb){
    let msg = {}, resarr = [];

   
    Imprestcollection.find(
        {    fields:['income_name'],
          where:{userId:0

          },   
          
           
          
        },
        (err, res) => {
    if (err)
        throw err;
    if (res) {
  
        res = Dedupe(res, ['income_name']);

    return cb(null, msg, res);
    }
});

}
Imprestcollection.remoteMethod(
    'incomename',
    {
        http: {path: '/incomename', verb: 'get'},
        description: 'Get all the Head Name',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
    });














};
