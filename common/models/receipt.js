'use strict';
var Dedupe = require('array-dedupe');
var constant = require('./constant');
module.exports = function (Receipt) {


    var dateFormat = require('dateformat');
    var unique = require('array-unique');
    var fs = require('fs');
    var converter = require('number-to-words');
    var pdf = require('html-pdf');
    var constantval = require('./constant');


    Receipt.addreceipt = function (req, cb) {
        var receipt = req.receipt;
        var detail = req.detail;
        var oldUserId = receipt.user_id;
        var oldSessionId = receipt.session_id;
        var userModel = Receipt.app.models.user;
        var sessionObj = Receipt.app.models.session;
        var detailObj = Receipt.app.models.receipt_detail;
        sessionObj.sessionfromerpsessionid(oldSessionId, function (err, sessionData) {
            if (err)
                throw(err);
            var sessionId = sessionData.id;
            userModel.getuserbyoldid(oldUserId, function (err, userData) {
                if (err)
                    throw(err);
                if (userData) {
                    var userId = userData.id;
                }

                var receiptObj = {
                    userId: userId,
                    sessionId: sessionId,
                    section_name: receipt.section_name,
                    class_name: receipt.class_name,
                    feereceiptno: receipt.feereceiptno,
                    feereceiptid: receipt.feereceiptid,
                    receiptdate: dateFormat(receipt.receiptdate, "isoDate"),
                    cheque_date: dateFormat(receipt.cheque_date, "isoDate"),
                    payment_type: receipt.payment_type,
                    cheque_dd_no: receipt.cheque_dd_no,
                    challan_no: receipt.challan_no,
                    total_amount: receipt.total_amount,
                    fine_amount: receipt.fine_amount,
                    waive_off_amount: receipt.waive_off_amount,
                    cheque_bounce_fine: receipt.cheque_bounce_fine,
                    bank_name: receipt.bank_name,
                    bank_branch: receipt.bank_branch,
                    cheque_dd_status: receipt.cheque_dd_status,
                    cheque_payble_fine: receipt.cheque_payble_fine,
                    created_by: receipt.created_by,
                };
                Receipt.create(receiptObj, function (err, res) {
                    var receiptId = res.id;
                    detail.forEach(function (value) {
                        var obj = {
                            receiptId: receiptId,
                            fee_head_id: value.fee_head_id,
                            fee_head_name: value.fee_head_name,
                            amount: value.amount,
                            term_id: value.term_id,
                            term_name: value.term_name
                        };
                        detailObj.create(obj, function (err, res) {
                            if (err)
                                throw(err);
                        });
                    });

                });
                var res = {};
                res.status = "200";
                res.message = "Successfully";
                cb(null, res);

            });
        });
    };
    Receipt.deletereceipt = function (req, cb) {
        var receiptId = req.receipt_id;
        var detailObj = Receipt.app.models.receipt_detail;
        if (receiptId) {
            Receipt.findOne(
                    {
                        where: {feereceiptid: receiptId}
                    },
                    function (err, res) {
                        if (err)
                            throw(err);
                        if (res) {
                            var receiptId = res.id;
                            Receipt.destroyById(receiptId, function (err, res) {
                                if (err)
                                    throw(err)
                                detailObj.destroyAll(
                                        {
                                            receiptId: receiptId
                                        },
                                        function (err, res) {
                                            if (err)
                                                throw(err)
                                            var resp = {};
                                            resp.status = "200";
                                            resp.message = "Deleted";
                                            cb(null, resp);

                                        });

                            })
                        }
                    });
        }

    }
    Receipt.bouncereceipt = function (req, cb) {
        if (req) {
            var receiptDetails = req.detail;
            receiptDetails.forEach(function (value) {
                var feereceiptid = value.feereceiptid;
                var obj = {
                    bounce_date: dateFormat(value.bounce_date, "isoDate"),
                    cheque_dd_status: value.cheque_dd_status,
                    cheque_payble_fine: value.cheque_payble_fine
                };
                Receipt.updateAll({feereceiptid: feereceiptid}, obj, function (err, res) {
                    if (err)
                        throw(err)
                    var resp = {};
                    resp.status = "200";
                    resp.message = "Bounced";
                    cb(null, resp);
                });

            });

        }
    }
    Receipt.studentreceipts = function (req, cb) {
        var msg = {};
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
        if (!req.school_id) {
            resp.status = "201";
            resp.message = "School id cannot be empty";
            cb(null, resp);
        }
        var schoolObj = Receipt.app.models.school;
        schoolObj.schooldetail({school_id: req.school_id}, function (err, schoolDetails) {
            var schoolDetailObj = {
                school_name: schoolDetails.school_name,
                contact_no: schoolDetails.contact_no,
                school_email: schoolDetails.school_email,
                school_address: schoolDetails.school_address,
                school_pin: schoolDetails.school_pin
            };



            Receipt.find(
                    {
                        where: {userId: req.user_id, sessionId: req.session_id},
                        include: [{
                                relation: "receipt_detail",
                                scope: {
                                    where: {amount: {gt: 0}}
                                }
                            },
                            {
                                relation: "user",
                                scope: {
                                    fields: "id",
                                    include: {
                                        relation: "students",
                                        scope: {
                                            fields: ["name", "admission_no", "parentId"],

                                            include: {
                                                relation: "studentbelongtoparent",
                                                scope: {
                                                    fields: ["father_name"]
                                                }
                                            }

                                        }
                                    }
                                }

                            }]
                    },
                    function (err, res) {


                        if (err) {
                            msg.status = "201";
                            msg.message = "Error occourd";
                            return cb(null, msg);
                        }
                        var receiptArr = [];
                        res.forEach(function (value) {
                            value = value.toJSON();

                            var obj = {
                                receipt_id: value.id,
                                receiptno: value.feereceiptno,
                                receipt_date: dateFormat(value.receiptdate, "yyyy-mmm-dd"),
                                cheque_date: dateFormat(value.cheque_date, "yyyy-mmm-dd"),
                                payment_type: value.payment_type,
                                cheque_dd_no: value.cheque_dd_no,
                                challan_no: value.challan_no,
                                total_amount: value.total_amount,
                                fine_amount: value.fine_amount,
                                waive_off_amount: value.waive_off_amount,
                                cheque_bounce_fine: value.cheque_bounce_fine,
                                bank_name: value.bank_name,
                                bank_branch: value.bank_branch,
                                class_name: value.class_name,
                                section_name: value.section_name,
                                admission_no: value.user.students.admission_no,
                                student_name: value.user.students.name,
                                father_name: value.user.students.studentbelongtoparent.father_name,
                                cheque_dd_status: value.cheque_dd_status
                            }

                            var termArr = [];
                            var detailArr = [];
                            if (value.receipt_detail) {

                                value.receipt_detail.forEach(function (detail) {
                                    var detailObj = {
                                        fee_head_name: detail.fee_head_name,
                                        amount: detail.amount,
                                        term_name: detail.term_name,
                                    }
                                    detailArr.push(detailObj);
                                    termArr.push(detail.term_name);
                                });
                                termArr = unique(termArr);

                                if (termArr.length == 1) {
                                    obj.term_name = termArr[0];
                                } else {
                                    obj.term_name = termArr[0] + "-" + termArr.slice(-1)[0];
                                }

                                obj.receipt_details = detailArr;
                            }
                            receiptArr.push(obj);



                        });
                        var combine = {};
                        combine.receiptDetails = receiptArr;
                        combine.school_details = schoolDetailObj;
                        //receiptArr.push({school_details:schoolDetailObj});
                        msg.status = "200";
                        msg.message = "Record fetched";
                        cb(null, msg, combine);

                    });
        });

    }
    Receipt.receiptdetail = function (req, cb) {
        var resp = {};
        var msg = {};
        if (!req.receipt_id) {
            msg.status = "201";
            msg.message = "receipt id cannot be empty";
            return cb(null, msg);
        }
        if (!req.school_id) {
            msg.status = "201";
            msg.message = "School id cannot be empty";
            return cb(null, msg);
        }
        var templatePath = '../' + constantval.PROJECT_NAME + '/upload/fee_receipt/receipt_template.html';
        var htmlPath = '../' + constantval.PROJECT_NAME + '/upload/fee_receipt/receipt_html/' + req.receipt_id + '.html';
        var pdfPath = '../' + constantval.PROJECT_NAME + '/upload/fee_receipt/receipt_pdf/' + req.receipt_id + '.pdf';


        var receiptTemplate = fs.readFileSync(templatePath, 'utf8');


        var schoolObj = Receipt.app.models.school;
        schoolObj.schooldetail({school_id: req.school_id}, function (err, schoolDetails) {
            if (schoolDetails === null) {
                msg.status = "201";
                msg.message = "School details not found";
                return  cb(null, msg);
            }
            receiptTemplate = receiptTemplate.replace(/SCHOOL_LOGO/, constantval.LOCAL_URL + '/' + constantval.PROJECT_NAME + '/' + schoolDetails.school_logo);
            receiptTemplate = receiptTemplate.replace(/SCHOOL_NAME/, schoolDetails.school_name);
            receiptTemplate = receiptTemplate.replace(/PHONE/, schoolDetails.contact_no);
            receiptTemplate = receiptTemplate.replace(/SCHOOL_EMAIL/, schoolDetails.school_email);
            receiptTemplate = receiptTemplate.replace(/SCHOOL_ADDRESS/, schoolDetails.school_address);





            Receipt.findById(req.receipt_id,
                    {
                        include: [{
                                relation: "receipt_detail",
                                scope: {
                                    where: {amount: {gt: 0}}
                                }
                            },
                            {
                                relation: "user",
                                scope: {
                                    fields: "id",
                                    include: {
                                        relation: "students",
                                        scope: {
                                            fields: ["name", "admission_no", "parentId"],

                                            include: {
                                                relation: "studentbelongtoparent",
                                                scope: {
                                                    fields: ["father_name"]
                                                }
                                            }

                                        }
                                    }
                                }

                            }]
                    },
                    function (err, res) {
                        if (err) {
                            msg.status = "201";
                            msg.message = "Error occourd";
                            return cb(null, msg);
                        }
                        var value = res.toJSON();


                        receiptTemplate = receiptTemplate.replace(/RECEIPT_NO/, value.feereceiptno);
                        receiptTemplate = receiptTemplate.replace(/RECEIPT_DATE/, dateFormat(value.receiptdate, "yyyy-mmm-dd"));
                        receiptTemplate = receiptTemplate.replace(/STUDENT_NAME/, value.user.students.name);
                        receiptTemplate = receiptTemplate.replace(/ADMISSION_NO/, value.user.students.admission_no);
                        receiptTemplate = receiptTemplate.replace(/SECTION_NAME/, value.section_name);
                        receiptTemplate = receiptTemplate.replace(/FATHER_NAME/, value.user.students.studentbelongtoparent.father_name);

                        var termArr = [];
                        var html = '';
                        var total = 0;
                        value.receipt_detail.forEach(function (detail) {
                            total = total + detail.amount;
                            termArr.push(detail.term_name);
                            html = html + '<tr>' +
                                    '<td style="text-align: left;" width="75%">' + detail.fee_head_name + '</td>' +
                                    '<td width="25%" align="right">' + detail.amount + '</td></tr>';

                        });
                        if (value.fine_amount > 0) {
                            total = total + value.fine_amount;
                            html = html + '<tr>' +
                                    '<td style="text-align: left;" width="75%">Fine Amount</td>' +
                                    '<td width="25%" align="right">' + value.fine_amount + '</td></tr>';
                        }
                        if (value.cheque_bounce_fine > 0) {
                            total = total + value.cheque_bounce_fine;
                            html = html + '<tr>' +
                                    '<td style="text-align: left;" width="75%">Cheque Bounce Fine</td>' +
                                    '<td width="25%" align="right">' + value.cheque_bounce_fine + '</td></tr>';
                        }
                        var amountInWords = converter.toWords(total);
                        receiptTemplate = receiptTemplate.replace(/RECEIPT_BODY/, html);
                        receiptTemplate = receiptTemplate.replace(/AMOUNT/, total);
                        receiptTemplate = receiptTemplate.replace(/WORDS_AMOUNT/, amountInWords);

                        termArr = unique(termArr);

                        if (termArr.length == 1) {
                            var termName = termArr[0];
                        } else {
                            var termName = termArr[0] + "-" + termArr.slice(-1)[0];
                        }
                        receiptTemplate = receiptTemplate.replace(/FEE_TERMS/, termName);
                        var paymentDetail = '';
                        if (value.payment_type == 'CA') {
                            paymentDetail = '<tr> <td style="float:left; padding:5px; font-weight:bold;" >Payment Mode:CASH</td> </tr>';
                        } else if (value.payment_type == 'CH') {
                            paymentDetail = '<tr> <td style="float:left; padding:5px; font-weight:bold;" >Payment Mode:Cheque</td> \n\
<td style="float:left; padding:5px; font-weight:bold;">Cheque Date :  ' + dateFormat(value.cheque_date, "yyyy-mmm-dd") + '</td></tr>';

                            paymentDetail = paymentDetail + '<tr> <td style="float:left; padding:5px; font-weight:bold;" >Cheque no:' + value.value.cheque_dd_no + '</td> \n\
<td style="float:left; padding:5px; font-weight:bold;">Cheque Status :  ' + value.cheque_dd_status + '</td></tr>';
                        } else if (value.payment_type = 'DD') {
                            paymentDetail = '<tr> <td style="float:left; padding:5px; font-weight:bold;" >Payment Mode:Demand Draft</td> \n\
<td style="float:left; padding:5px; font-weight:bold;">Challan no :  ' + value.challan_no + '</td></tr>';

                        } else {
                            paymentDetail = '<tr> <td style="float:left; padding:5px; font-weight:bold;" >Payment Mode:Online</td> \n\
<td style="float:left; padding:5px; font-weight:bold;">Bank Name :' + value.bank_name + '</td>\n\
</tr>';
                            paymentDetail = paymentDetail + '<tr> <td style="float:left; padding:5px; font-weight:bold;" >Bank Branch:' + value.bank_name + '</td></tr>';
                        }

                        receiptTemplate = receiptTemplate.replace(/PAYMENT_DETAIL/, paymentDetail);
                        fs.writeFile(htmlPath, receiptTemplate, function (err) {
                            console.log(err);
                            if (err)
                                return cb(null, err);
                            fs.chmod(htmlPath, '0777', function (err) {
                                if (err)
                                    return cb(null, err);
                            });
                        });

                        var options = {format: 'A4'};

                        pdf.create(receiptTemplate, options).toFile(pdfPath, function (err, res) {
                            if (err)
                                return cb(null, err);
                            fs.chmod(pdfPath, '0777', function (err) {
                                if (err)
                                    return cb(null, err);
                            });
                        });

                        msg.status = "200";
                        msg.message = "Fetched successfull";


                        resp.html = constantval.LOCAL_URL + '/' + constantval.PROJECT_NAME + '/upload/fee_receipt/receipt_html/' + req.receipt_id + '.html';
                        ;
                        resp.pdf = constantval.LOCAL_URL + '/' + constantval.PROJECT_NAME + '/upload/fee_receipt/receipt_pdf/' + req.receipt_id + '.pdf';
                        cb(null, msg, resp);

                    });
        });




    }



    Receipt.remoteMethod(
            'addreceipt',
            {
                http: {verb: 'post'},
                description: 'Add receipt',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Receipt.remoteMethod(
            'deletereceipt',
            {
                http: {verb: 'post'},
                description: 'Delete receipt',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Receipt.remoteMethod(
            'bouncereceipt',
            {
                http: {verb: 'post'},
                description: 'Bounce receipt',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Receipt.remoteMethod(
            'studentreceipts',
            {
                http: {verb: 'post'},
                description: 'Get student receipts',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Receipt.remoteMethod(
            'receiptdetail',
            {
                http: {verb: 'post'},
                description: 'Get student receipts',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );


    Receipt.feecollection = (req, cb) => {
        let response = {}, msg = {};
        if (!req)
            return cb(null, {status: "201", message: "Bad Request"});
        if (!req.session_id)
            return cb(null, {status: "201", message: "Session Id cannot be blank"});
        Receipt.find(
                {
                    where: {sessionId: req.session_id, status: "Active"},
                    include: {
                        relation: "receipt_detail",
                        scope: {
                            fields: "amount",
                            where: {amount: {gt: 0}}
                        }
                    }
                },
                (err, res) => {
            if (err)
                throw err;
            if (res) {
                let till_date = 0, last_month = 0, today = 0;
                let todayobj = new Date();
                let todayDate = Receipt.getisoDate(todayobj);
                let formulae;
                res.forEach(value => {
                    formulae = (value.fine_amount + value.cheque_bounce_fine) - value.waive_off_amount;
                    if(value.receipt_detail()){
                        value.receipt_detail().forEach(obj => {
                            formulae += obj.amount;
                        })
                    } 
                    if(value.receiptdate){ 
                        if(Receipt.getisoDate(value.receiptdate) == todayDate)
                            today += formulae;
                        else if(value.receiptdate.getMonth() < todayobj.getMonth() && value.receiptdate.getMonth()+1 == todayobj.getMonth())
                            last_month += formulae;
                    }
                    
                    till_date += formulae;
                });

                response = {
                    "fee_collection": {
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

    Receipt.remoteMethod(
            'feecollection',
            {
                http: {verb: 'post'},
                description: 'Get fee collection',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );


    Receipt.feecollectionpercent = (req, cb) => {
        let response = {}, msg = {};
        if (!req)
            return cb(null, {status: "201", message: "Bad Request"});
        else if (!req.session_id)
            return cb(null, {status: "201", message: "Session Id cannot be blank"});
        else if (!req.from_date)
            return cb(null, {status: "201", message: "From date cannot be blank"});
        else if (!req.to_date)
            return cb(null, {status: "201", message: "To date cannot be blank"});    
        Receipt.find(
                {
                    where: {and: [{sessionId: req.session_id, status: "Active"}, 
                    {receiptdate: {gte: dateFormat(req.from_date, "isoDate")}},
                    {receiptdate: {lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59")}} ]
                    },
                    include: {
                        relation: "receipt_detail",
                        scope: {
                            fields: "amount",
                            where: {amount: {gt: 0}}
                        }
                    }
                },
                (err, res) => {
            if (err)
                throw err;
            if (res) {
                let sum = 0;
                res.forEach(value => {
                    sum = (value.fine_amount + value.cheque_bounce_fine) - value.waive_off_amount;
                    if(value.receipt_detail()){
                        value.receipt_detail().forEach(obj => {
                            sum += obj.amount;
                        })
                    } 
                }); 

                response = {
                    "fee_collection": sum
                }
                msg = {
                    status: "200",
                    message: "Information fetched successfully"
                }
                cb(null, msg, response);
            }
        });
    }

    Receipt.remoteMethod(
            'feecollectionpercent',
            {
                http: {verb: 'post'},
                description: 'Get fee collection percentage',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Receipt.isValidDate = d => {
        return d instanceof Date && !isNaN(d);
    } 	
    Receipt.getisoDate = dateobj => {
	if(!Receipt.isValidDate(dateobj)){
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

    Receipt.studentReceiptDetail = function (req, cb) {
        Receipt.findOne(
                {
                    fileds: ["id"],
                    where: {userId: req.userId, sessionId: req.sessionId},
                    include: {
                        relation: "receipt_detail",
                        scope: {
                            where: {amount: {gt: 0}, term_id: req.termId},
                        }
                    }
                }, function (err, res) {
            cb(null, res);
        });
    }

    //Active Session collection of school by Ravi 
    //Start
    Receipt.sessioncollection = (req, cb) => {
        var msgObj = {};
        var respObj = {};
        if (!req) {
            msgObj.status = '201';
            msgObj.message = 'Request Cannot be empty';
            return cb(null, msgObj);
        }

        if (!req.session_id) {
            msgObj.status = '201';
            msgObj.message = 'Session id Cannot be empty';
            return cb(null, msgObj);
        }
        var obj = {};
        if(req.from_date){
            //var fromDateVar = dateFormat(req.from_date, "isoDate");
            obj = {receiptdate: { gte: dateFormat(req.from_date, "yyyy-mm-dd") } };
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
        if(req.section_name){
            var class_section_name=req.section_name;
          }
          else{
            var class_section_name=undefined;
          }
          if(req.pay_mode){
            var payment_mode=req.pay_mode;
          }
else{
    var payment_mode=undefined;
}
 

          if(req.created_user){
         var created_id=req.created_user;
            
         }
         else{
            var created_id=undefined;
         }
      


        Receipt.find({
            where: {sessionId: req.session_id,section_name:class_section_name,payment_type:payment_mode,
                and: [
                  obj,
                    { receiptdate: { lte: dateFormat(toDateVar, "yyyy-mm-dd") } },
                ],created_by:created_id

            },
            include:[ {
                relation: "receipt_detail",
                scope: {
                    fields: ["amount",],
                    where:  {amount: {gt: 0}}
                }
            },
            {
                relation: "createdby",
                scope: {
                    fields: ["id",'user_name'],
                  
                }
            }],
            order:'section_name ASC'
        }, (err, res) => {
       
            if (err) {
                msgObj.status = '201';
                msgObj.message = 'Error occurd';
                return cb(null, msgObj);
            } else if (res) {
                msgObj.status = '200';
                msgObj.message = 'Information fetched successfully';

                var sectionObj = {};
                var receiptCount = 0;
                var amountSum = 0;
                res.forEach((value) => {
                    var detailAmount = 0;
                    var receiptAmount = 0;
                    value = value.toJSON();
                    var sectionName = value.section_name;
                    var className = value.class_name;
                  
                    if (value.receipt_detail) {
                        value.receipt_detail.forEach((detail) => {
                            detailAmount = detailAmount + detail.amount;
                        });
                        receiptAmount = (detailAmount + value.fine_amount + value.cheque_bounce_fine) - value.waive_off_amount;
                    
                  
                    if(className in sectionObj ){
                        if(sectionName in sectionObj[className]){
                            amountSum = amountSum + receiptAmount;
                            
                            receiptCount = receiptCount +1;
                            var obj =  {
                                amount : amountSum,
                                receipt_count : receiptCount
                            }
                            sectionObj[className][sectionName] = obj;
                        }else{
                            amountSum = receiptAmount;
                            receiptCount = 1;
                            var obj =  {
                                amount : amountSum,
                                receipt_count : receiptCount
                            }
                             sectionObj[className][sectionName] = obj;
                        }
                        
                    }else{
                        amountSum = receiptAmount;
                            receiptCount = 1;
                            var obj =  {
                                amount : receiptAmount,
                                receipt_count : receiptCount
                            }
                        sectionObj[className] = {};
                        sectionObj[className][sectionName] = obj;
                      
                    }
                   
                }
                     });
                        var arr = [];
                        //console.log(sectionObj)
                      for(var className in sectionObj){
                        
                          var sectionArr = [];
                          var classAmount = 0;
                          for(var sectionName in  sectionObj[className]){
                              classAmount = classAmount + sectionObj[className][sectionName].amount;
                              sectionArr.push({section_name:sectionName,receipt_count:sectionObj[className][sectionName].receipt_count,amount :sectionObj[className][sectionName].amount })
                        
                          }
                          arr.push({class_name:className,class_amount : classAmount,section_list : sectionArr})
                         
                      }
              
                return cb(null, msgObj, arr);
            } else {
                msgObj.status = '200';
                msgObj.message = 'No record found';
                return cb(null, msgObj);
            }

        })

    }
    Receipt.remoteMethod(
            'sessioncollection',
            {
                http: {verb: 'post'},
                description: 'Get session fee Collection',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Receipt.receiptcreatorname=function(req,cb){
        let msg = {}, resarr = [];

        if (!req.session_id){
            return cb(null, {status: "201", message: "Session Id cannot be blank"});
        }
        Receipt.find(
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
  

        res.forEach( obj => {
            if(obj.created_by){
            let user_name, staff_name;
            if(obj.createdby()){
            user_name=obj.createdby().user_name;

            staff_name = (obj.createdby().staff()) ? obj.createdby().staff().name : obj.createdby().user_name;
            }
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
    Receipt.remoteMethod(
        'receiptcreatorname',
        {
            http: {verb: 'post'},
            description: 'Get User Name of Receipt maker',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
);

Receipt.detailedsessionfee=function(req,cb){
    let msg = {}, resarr = [];

    if (!req.session_id){
        return cb(null, {status: "201", message: "Session Id cannot be blank"});
    }
    var obj = {};
    if(req.from_date){
        //var fromDateVar = dateFormat(req.from_date, "isoDate");
        obj = {receiptdate: { gte: dateFormat(req.from_date, "yyyy-mm-dd") } };
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
    if(req.section_name){
        var class_section_name=req.section_name;
      }
      else{
        var class_section_name=undefined;
      }
      if(req.pay_mode){
        var payment_mode=req.pay_mode;
      }
else{
var payment_mode=undefined;
}


      if(req.created_user){
     var created_id=req.created_user;
        
     }
     else{
        var created_id=undefined;
     }
  

    Receipt.find(
        {    fields:['receiptId','feereceiptno','receiptdate','userId','payment_type','total_amount','section_name'],   
            where: {sessionId: req.session_id,section_name:class_section_name,payment_type:payment_mode,
                and: [
                   obj,
                    { receiptdate: { lte: dateFormat(toDateVar, "yyyy-mm-dd") } },
                ],created_by:created_id}, 
            include:[
                
            {
                relation: "user",
                scope: {
                    fields: ["id"],
                    include:
                    {
                        relation: "students",
                        scope: {
                            fields: ['name','admission_no']
                        }
                    }
                }

            }
       
        ],
            order:'section_name ASC'
            
        },
        (err, res) => {
    if (err)
        throw err;
    if (res) {
  
    let user_name, staff_name;
let array=[];
let object={};
let name, admission_no;
if(res){
    res.forEach( obj => {
    name = '';
    if(obj.user()){
        if(obj.user().students())
        name=obj.user().students().name;
    }
    admission_no = '';
       if(obj.user()){
          if(obj.user().students())
          admission_no=obj.user().students().admission_no;
       }
       
       admission_no= admission_no.substr(constant.ADM.length, admission_no.length)
        array.push({user_id: obj.userId,head_name:obj.fee_head_name,receipt_date:  dateFormat(obj.receiptdate, "dd-mm-yyyy"), receipt_no: obj.feereceiptno,section_name:obj.section_name,payment_type:obj.payment_type,amount:obj.total_amount,name:name,admission_no:admission_no});
    });
    msg = {
            status: "200",
            message: "Information fetched successfully"
    }
}

    return cb(null, msg, array);
    }
});

}
Receipt.remoteMethod(
    'detailedsessionfee',
    {
        http: {verb: 'post'},
        description: 'Get  Details of All students for fee',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
    }
);

Receipt.paymodename=function(req,cb){
    let msg = {}, resarr = [];

   
    Receipt.find(
        {    fields:['payment_type'],   
          
           
            
        },
        (err, res) => {
    if (err)
        throw err;
    if (res) {
  
        res = Dedupe(res, ['payment_type']);

    return cb(null, msg, res);
    }
});

}
Receipt.remoteMethod(
    'paymodename',
    {
        http: {path: '/paymodename', verb: 'get'},
        description: 'Get all the Head Name',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
    });
    Receipt.clasnames=function(req,cb){
        let msg = {}, resarr = [];
    
       
        Receipt.find(
            {    fields:['section_name'],   
              
               
                order:'section_name ASC'
            },
            (err, res) => {
        if (err)
            throw err;
        if (res) {
      
            res = Dedupe(res, ['section_name']);
    
        return cb(null, msg, res);
        }
    });
    
    }
    Receipt.remoteMethod(
        'clasnames',
        {
            http: {path: '/clasnames', verb: 'get'},
            description: 'Get all the Head Name',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });
    //End




    Receipt.addfee = (function(req,cb){

        
        var msg = {};
        //console.log(req.detail_req.length);cb(null, msg);
        var receipt_req = {
            feereceiptid:"100",
            feereceiptno: req.fee_receipt_no,
            receiptdate:dateFormat(req.fee_receipt_date, "isoDate"),
            userId:req.userId,
            section_name: req.section_name,
            sessionId:req.session_id,
            schoolId:req.school_id,
            status:"Active",
            payment_type:req.payment_mode,
            bank_name: req.bank_name,
            bank_branch: req.bank_branch,
            challan_no: req.challan_no,
            cheque_dd_no: req.cheque_dd_no,
            challan_date: dateFormat(req.challan_date,"isoDate"),
            cheque_date: dateFormat(req.cheque_date,"isoDate"),
            dd_date:dateFormat(req.dd_date,"isoDate"),
            card_no:req.card_no,
            account_no:req.account_no,
            transaction_id:req.transaction_id,
            transaction_date:dateFormat(req.transaction_date,"isoDate"),
            serial_no:req.serial_no,
            rrn_no:req.rrn_no,
            order_id:req.order_id,
            loan_no:req.loan_no,
            proforma_on_name_of:req.proforma_on_name_of,
            name_on_proforma:req.name_on_proforma,
            fine_amount:req.fine_amount,
            total_amount:req.total_paid,
            remark:req.remark,
            created_by:req.created_by
        }

        //console.log(receipt_req);

        Receipt.create(receipt_req, function (err, res) {
            if (err) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            } else {
                var receipt_detail = Receipt.app.models.receipt_detail;
                        var head_index=0;
                        var term_index=0;
                        let promisearr = [];
                        var arrTermNameId = [];
                        var arrTermName = [];
                        var arrTermAmount = [];
                        var detail_req;
                        var index = 0;

                        
                        for(index=0;index < req.detail_req.length;index++){
                            
                           

                                detail_req = {
                                    receiptId:res.id,
                                    fee_head_name:req.detail_req[index].fee_head_name,
                                    fee_head_id:req.detail_req[index].fee_head_id,
                                    sac_hsn_code:req.detail_req[index].dueshead.sac_hsn_code,
                                    amount:req.detail_req[index].going_to_pay,
                                    term_id:req.detail_req[index].term_name_id,
                                    term_name:req.detail_req[index].term_name,
                                    session_id:req.session_id,
                                    schoolId:req.school_id,
                                    section_id:req.section_id,
                                    fee_structure_id:req.fee_structure_id,
                                    userId:req.userId,
                                    cgst:req.detail_req[index].cgst,
                                    sgst:req.detail_req[index].sgst,
                                    igst:req.detail_req[index].igst,
                                    priority:req.detail_req[index].dueshead.priority,
                                };   

                            promisearr.push(Receipt.createDetailEntry(receipt_detail,detail_req));

                            
                        }   

                        Promise.all(promisearr).then(function(data){

                        // reset defaulter..............
                        var fee_defaulter_model = Receipt.app.models.fee_defaulter;
                        var resetDefaulterJson = {
                                    session_id:req.session_id,
                                    section_id:req.section_id,
                                    fee_structure_id:req.fee_structure_id,
                                    userId:req.userId,
                        }
                        fee_defaulter_model.resetfeedefaulter(resetDefaulterJson, (errp, resp)=>{

                            msg.status = 200;
                            msg.id = res.id;
                            msg.messasge = "fee saved and defaulter settllment executed successfully";
                            cb(null, msg);

                        });

                        
                        }).catch(function(error){

                            // delete the failed record...rollback code start here....

                        })
            }

        });    


    });

    Receipt.remoteMethod(
        'addfee',
        {
            http: { path: '/addfee', verb: 'post' },
            description: 'addfee',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

    Receipt.createDetailEntry = function(modelName,createObj)
    {
        return new Promise(function(resolve,reject){
            modelName.create(createObj,function (err, res){
                if(err) reject(err)
                else resolve('success')


            });

        })
        
    }

    Receipt.dailycollectionreport = (function(req,cb){

        //console.log(req);
        
        var msg = {};

        if(req.from_date){
            var from_date= dateFormat(req.from_date,'yyyy-mm-dd')
          }
        else{
        var from_date=undefined;
        }
        //console.log(typeof(from_date));
        if(req.to_date){
            var to_date= dateFormat(req.to_date,'yyyy-mm-dd')
          }
        else{
        var to_date=undefined;
        }


        if(req.payment_mode){
            var payment_mode={inq:req.payment_mode}
          }
        else{
        var payment_mode=undefined;
        }
        if(req.session_id){
            var session_id={inq:req.session_id}
          }
        else{
        var session_id=undefined;
        }

        if(req.fee_head_id){
            var fee_head_id={inq:req.fee_head_id}
          }
        else{
        var fee_head_id=undefined;
        }
        Receipt.find(
            {    fields:['id','receiptId','feereceiptno','receiptdate','userId','payment_type','total_amount','section_name','fine_amount','cheque_bounce_fine'],   
               
                  where:{and : [
                    {payment_type : payment_mode},
                    {sessionId:session_id},
                    {userId: {gt: 0}},
                    {receiptdate: {gte: dateFormat(req.from_date, "isoDate")}},
                    {receiptdate: {lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59")}}
                  ]
                  },
                 
                 /*where: {sessionId: req.session_id,section_name:class_section_name,payment_type:payment_mode,
                    and: [
                       obj,
                        { receiptdate: { lte: dateFormat(toDateVar, "yyyy-mm-dd") } },
                    ],created_by:created_id},*/ 
                include:[
                    {
                        relation: "receipt_detail",
                        scope: {
                            where: {amount: {gt: 0}}
                            //where: {amount: {gt: 0},fee_head_id:fee_head_id}
                        }
                    },
                {
                    relation: "user",
                    scope: {
                        fields: ["id"],
                        include:
                        {
                            relation: "students",
                            scope: {
                                fields: ['name','admission_no']
                            }
                        }
                    }
    
                }
           
            ]
                //order:'section_name ASC'
                
            },
            (err, res) => {
        if (err){console.log(err);
        msg.status = 201;
        msg.messasge = "Error occured";
        cb(null, msg);}
        else{

        msg.status = 200;
        msg.messasge = "collection report fetched successfully...";
        cb(null, msg,res);
        }


    });

});

    Receipt.remoteMethod(
        'dailycollectionreport',
        {
            http: { path: '/dailycollectionreport', verb: 'post' },
            description: 'Daily collection report',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
 
    Receipt.getcollectedfee = function (req){
        var response={};
    return new Promise(function(resolve,reject){

        Receipt.find(
            {
                where: {and: [
                    {status: "Active"},
                    {sessionId: {inq:req.sessionIds }},
                    {schoolId: {inq:req.schoolIds}},
                    {receiptdate: {gte: dateFormat(req.from_date, "isoDate")}},
                    {receiptdate: {lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59")}} 
                ]
                }                    
             }
             ,function(err,res){
                if(err) {
                    reject(err)
                } else {
                    response.fees=res;
                    resolve(response)
                } 
                
            
            }
        );
          
      })

    }



    Receipt.getProfitLossData = function (req, cb) {

        var promises = []; var response = {}, msg = {};
        
        var expenseRequestObj = Receipt.app.models.expense_request;
        var feeRefundObj = Receipt.app.models.fee_refund_request_master;
        promises.push(Receipt.getcollectedfee(req));
        promises.push(feeRefundObj.getRefundedFees(req));
        promises.push(expenseRequestObj.getSchoolsExpense(req));

        Promise.all(promises).then(function(res){ 
            response.status= "200",
            response.message="Success"
            response.data=res;
            return cb(null, response);
        }).catch(function(err){
            return cb(err, null);
        });



    }
  

    Receipt.remoteMethod(
            'getProfitLossData',
            {
                http: {path: '/getprofitlossdata',verb: 'post'},
                description: 'Get fee collection ',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Receipt.totalamountpaid=function(req, cb){
    Receipt.find({where:{userId:req.userId,sessionId:{inq:req.session_id}}},
        function(err,res){

            var amount_total=0;
            res.forEach(element => {
                amount_total=amount_total+element.total_amount
            });
            cb(null,amount_total)
        }
    )
    }


    Receipt.remoteMethod(
        'totalamountpaid',
        {
            http: {path: '/totalamountpaid',verb: 'post'},
            description: 'totalamountpaid ',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
);




    

Receipt.list = (function(req,cb){

    //console.log(req);
    
    var msg = {};

    if(req.payment_mode){
        var payment_mode = req.payment_mode;
    }else{
        var payment_mode = undefined;
    }

    if(req.cheque_dd_no){
        var cheque_dd_no = req.cheque_dd_no;
    }else{
        var cheque_dd_no = undefined;
    }

    if(req.school_id){
        var school_id=req.school_id;
      }
    else{
    var school_id=undefined;
    }
    Receipt.find(
        {    fields:['id','receiptId','feereceiptno','receiptdate','userId','payment_type','total_amount','section_name','fine_amount','cheque_bounce_fine'],   
           
              where:{and : [
                {payment_type : payment_mode},
                {cheque_dd_no : cheque_dd_no},
                {schoolId : school_id}
              ]
              },
             
             
            include:[
                
                {
                    relation: "user",
                    scope: {
                        fields: ["id"],
                        include:
                        {
                            relation: "students",
                            scope: {
                                fields: ['name','admission_no']
                            }
                        }
                    }

                }
       
        ]
            //order:'section_name ASC'
            
        },
        (err, res) => {
    
    if(err){
    msg.status = 201;
    msg.messasge = "Error occured";
    cb(null, msg);
    }
    else{

    msg.status = 200;
    msg.messasge = "Invoice list fetched successfully";
    cb(null, msg,res);
    }


});

});

Receipt.remoteMethod(
    'list',
    {
        http: { path: '/list', verb: 'post' },
        description: 'list invoice',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);



Receipt.cancelinvoice = function (req, cb) {


    var msg = {};
    if(req.id){
        Receipt.find({
            include:[
                {
                    relation: "receipt_detail",
                    scope: {
                        fields: ["id","session_id","schoolId","section_id","userId","fee_structure_id"]
                    }
                }
            ],
            where:{
                id:req.id
            }
            },function(err,res){

            if(err){
                msg.status = 201;
                msg.message = "Error occured";
                cb(null,msg);
            }else{

                // cancel invoice...
                var updateData = {
                    bounce_date: dateFormat(value.bounce_date, "isoDate"),
                    //cheque_dd_status: value.cheque_dd_status,
                    //cheque_payble_fine: value.cheque_payble_fine
                };
                Receipt.updateAll({id: req.id}, updateData, function(e, r) {
                    if(e){
                        msg.status = 201;
                        msg.message = "Error occured";
                        cb(null,msg);
                    }else{

                        // call reset defaulter....
                       // reset defaulter..............
                       var fee_defaulter_model = Receipt.app.models.fee_defaulter;
                       var resetDefaulterJson = {
                                   session_id:res.receipt_detail()[0].session_id,
                                   section_id:res.receipt_detail()[0].section_id,
                                   fee_structure_id:res.receipt_detail()[0].fee_structure_id,
                                   userId:res.receipt_detail()[0].userId,
                       }
                       fee_defaulter_model.resetfeedefaulter(resetDefaulterJson, (errp, resp)=>{

                        if(errp){
                        msg.status = 200;
                           msg.messasge = "invoice cancelled but defaulter execution stopped";
                           cb(null, msg);
                        }else{
                           msg.status = 200;
                           msg.messasge = "Invoice cancelled and defaulter executed";
                           cb(null, msg);
                        }
                       });


                    }
                });

            }
        })

    }else{
        msg.status = 201;
        msg.message = "Invalid id supplied"
        cb(null,msg);
    }



    // if (req) {
    //     var receiptDetails = req.detail;
    //     receiptDetails.forEach(function (value) {
    //         var feereceiptid = value.feereceiptid;
    //         var obj = {
    //             bounce_date: dateFormat(value.bounce_date, "isoDate"),
    //             cheque_dd_status: value.cheque_dd_status,
    //             cheque_payble_fine: value.cheque_payble_fine
    //         };
    //         Receipt.updateAll({feereceiptid: feereceiptid}, obj, function (err, res) {
    //             if()
    //         });

    //     });

    // }
}

Receipt.remoteMethod(
    'cancelinvoice',
    {
        http: { path: '/cancelinvoice', verb: 'post' },
        description: 'cancel invoice',
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
    }
);






}

