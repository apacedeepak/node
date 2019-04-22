'use strict';
var dateFormat = require('dateformat');
var DateDiff = require('date-diff');
module.exports = function (Studentfee) {


    Studentfee.studentrefundfeedetails = function (req, cb) {

        var msg = {};
        var conditions = {};
        var paymentdetails;
        var dateofadmission = dateFormat(req.dateofadmission, "yyyy-mm-dd");
        var today = new Date();
        var requested_date = dateFormat(today, "yyyy-mm-dd");

        var diff = new DateDiff(requested_date, dateofadmission);


        var date1 = new Date(requested_date);
        var date2 = new Date(dateofadmission);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        
        //console.log(diffDays);

        if (
            req.userId > 0
            && req.session_id > 0
            && req.section_id > 0) {



            var refundConfigModel = Studentfee.app.models.refund_configuration;

            refundConfigModel.find({
                where: {
                    and: [
                        { day_of_refund_in_days: { gte: diffDays } },
                        { status: "Active" }
                    ]
                }, order: "day_of_refund_in_days ASC"
            }, function (er, re) {


                var receiptDetailModel = Studentfee.app.models.receipt_detail;

                receiptDetailModel.find({
                    fields: ["id", "fee_head_id", "amount"],
                    include: {
                        relation: "dueshead",
                        scope: {
                            fields: ["id", "fee_head_name", "priority", "is_refundable"]
                        }
                    },
                    where: {
                        fee_structure_id: req.fee_structure_id,
                        session_id: req.session_id,
                        section_id: req.section_id,
                        userId: req.userId,
                        amount: { gt: 0 },
                        status: "Active"
                    }
                }, function (e, r) {

                    if (e) {
                        msg.status = "201";
                        msg.messasge = "Error occured";
                        cb(null, msg);
                    } else {
                        //make array of payment

                        var arrhid = [];
                        var tempPaymentArr = [];
                        var paid_amount = 0.00;

                        r.forEach(ele => {

                            if (arrhid.indexOf(ele.fee_head_id) >= 0) {
                                // already considered
                                tempPaymentArr[ele.fee_head_id].amount = tempPaymentArr[ele.fee_head_id].amount + ele.amount;
                            } else {
                                arrhid.push(ele.fee_head_id);
                                tempPaymentArr[ele.fee_head_id] = {
                                    fee_head_id: ele.fee_head_id,
                                    fee_head_name: ele.dueshead().fee_head_name,
                                    priority: ele.dueshead().priority,
                                    amount: ele.amount,
                                    is_refundable: ele.dueshead().is_refundable
                                };
                            }




                        });



                        // calculate head wise actual fee...

                        Studentfee.find({
                            fields: ["id", "feehead_id", "amount"],
                            include: {
                                relation: "dueshead",
                                scope: {
                                    fields: ["id", "fee_head_name", "priority", "is_refundable"]
                                }
                            },
                            where: {
                                //fee_structure_id: req.fee_structure_id,
                                session_id: req.session_id,
                                section_id: req.section_id,
                                userId: req.userId,
                                amount: { gt: 0 },
                                status: "Active"
                            }
                        }, function (err, res) {

                            if (err) {
                                msg.status = "201";
                                msg.messasge = "Error occured";
                                cb(null, msg);
                            } else {

                                var arr = [];
                                var temparr = [];
                                var amount = 0.00;
                                console.log(res.length);

                                res.forEach(element => {

                                    if (arr.indexOf(element.feehead_id) >= 0) {
                                        // already considered
                                        temparr[element.feehead_id].amount = temparr[element.feehead_id].amount + element.amount;
                                    } else {
                                        if (tempPaymentArr[element.feehead_id] == undefined) {
                                            paid_amount = 0.00;
                                        } else {
                                            paid_amount = tempPaymentArr[element.feehead_id].amount;
                                        }

                                        arr.push(element.feehead_id);


                                        temparr[element.feehead_id] = {
                                            fee_head_id: element.feehead_id,
                                            fee_head_name: element.dueshead().fee_head_name,
                                            priority: element.dueshead().priority,
                                            amount: element.amount,
                                            paid_amount: paid_amount,
                                            is_refundable: element.dueshead().is_refundable
                                            //refund_amount: 
                                        };
                                    }




                                });
                                var policyObj;
                                var refund_amount;
                                var refund_details = [];
                                temparr.forEach((refundObj, i) => {

                                    policyObj = re.find(o => (o.fee_head_id == refundObj.fee_head_id));
                                    
                                    if (policyObj) {

                                        if (policyObj.refund_on == 'Total Fee' || policyObj.refund_on == 'Booked Fee') {

                                            if (policyObj.refund_ratio == 'percentage') {

                                                refund_amount = ((refundObj.amount * policyObj.percentage_or_amount) / 100).toFixed(2);
                                            }
                                            else if (policyObj.refund_ratio == 'amount') {
                                                refund_amount =  percentage_or_amount;
                                            }
                                            else {
                                                refund_amount = 0;
                                            }

                                        } else if (policyObj.refund_on == 'Paid Fee') {

                                            if (policyObj.refund_ratio == 'percentage') {

                                                refund_amount = ((refundObj.paid_amount * policyObj.percentage_or_amount) / 100).toFixed(2);
                                            }
                                            else if (policyObj.refund_ratio == 'amount') {
                                                refund_amount =  percentage_or_amount;
                                            }
                                            else {
                                                refund_amount = 0;
                                            }
                                        }
                                        else if (policyObj.refund_on == 'Due Fee') {
                                            if (policyObj.refund_ratio == 'percentage') {

                                                refund_amount = ((((refundObj.amount - refundObj.paid_amount)) * policyObj.percentage_or_amount) / 100).toFixed(2);
                                            }
                                            else if (policyObj.refund_ratio == 'amount') {
                                                refund_amount = percentage_or_amount;
                                            }
                                            else {
                                                refund_amount = 0;
                                            }
                                        }
                                        else {
                                            refund_amount = 0;
                                        }


                                    } else {
                                        refund_amount = 0;
                                    }

                                    if (refund_amount < 0) {
                                        refund_amount = 0;
                                    }
                                    refund_details[refundObj.fee_head_id] = {
                                        fee_head_id: refundObj.fee_head_id,
                                        fee_head_name: refundObj.fee_head_name,
                                        priority: refundObj.priority,
                                        amount: refundObj.amount,
                                        paid_amount: refundObj.paid_amount,
                                        due_amount: (refundObj.amount - refundObj.paid_amount),
                                        is_refundable: refundObj.is_refundable,
                                        refund_amount: refund_amount,
                                        
                                    };
                                });





                                refund_details.sort((a, b) => {
                                    return parseInt(a.priority) - parseInt(b.priority)
                                });


                                var feedetails;
                                if (req.is_refundable == undefined) {
                                    feedetails = refund_details.filter(Boolean);
                                } else {
                                    var feedetails1 = refund_details.filter(o => o.is_refundable == req.is_refundable);
                                    feedetails = feedetails1.filter(Boolean);
                                }

                                
                                msg.status = "200";
                                msg.messasge = "fee details fetched";
                                cb(null, msg, feedetails);
                            }

                        });

                    }

                });


            });







        }
        else {
            msg.status = "201";
            msg.messasge = "fee_structure_id,userId,session_id can not be empty...";
            cb(null, msg);
        }


    }

    Studentfee.remoteMethod(
        'studentrefundfeedetails',
        {
            http: { path: '/studentrefundfeedetails', verb: 'post' },
            description: 'fetch student refund  fee details',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


};
