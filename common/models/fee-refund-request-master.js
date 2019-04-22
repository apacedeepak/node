'use strict';
var dateFormat = require('dateformat');
module.exports = function (Feerefundrequestmaster) {


    Feerefundrequestmaster.refundrequest = function (req, cb) {
        var msg = {};

        if (!req.user_id) {
            msg.status = 201;
            msg.message = "User_id required";
            cb(null, msg);
        } else {

            // raised the request...

            var requestCondition = {
                and: [
                    { status: "Active" },
                    { user_id: req.user_id },
                    { refund_status: { neq: "Rejected" } }

                ]

            }
            Feerefundrequestmaster.find({ where: requestCondition }, function (error, response) {

                if (error) {
                    msg.status = 201;
                    msg.message = "Error occured";
                    cb(null, msg);
                } else {
                    if (response.length == 0) {
                        // raise request...

                        var refundrequest = {
                            student_id: req.student_id,
                            user_id: req.user_id,
                            school_id: req.school_id,
                            session_id: req.session_id,
                            total_refundable_amount: req.total_refundable_amount,
                            mode_of_refund: req.mode_of_refund,

                            refund_status: req.refund_status,
                            requested_by: req.requested_by,
                            status: 'Active',
                            remarks: req.remarks,
                            requested_date: dateFormat(Date(), "yyyy-mm-dd HH:MM:ss")
                        };

                        if (req.mode_of_refund == "Cheque") {
                            refundrequest.cheque_to_be_name_of = req.cheque_to_be_name_of;

                        }
                        else if (req.mode_of_refund == "NEFT") {

                            refundrequest.beneficiary_name = req.beneficiary_name;
                            refundrequest.account_number = req.account_number;
                            refundrequest.ifsc = req.ifsc;
                            refundrequest.bank_name = req.bank_name;
                        }

                        Feerefundrequestmaster.create(refundrequest, function (err, res) {
                            if (err) {
                                msg.status = "201";
                                msg.messasge = "error occured";
                                cb(null, msg);
                            } else {

                                // start request details entry
                                //refund_request_details
                                var refund_detail = Feerefundrequestmaster.app.models.fee_refund_request_detail_master;
                                var x = 0;
                                let promisearr = [];
                                var req_detail = req.refund_request_details;
                                for (x = 0; x < req_detail.length; x++) {
                                    promisearr.push(Feerefundrequestmaster.createDetailEntry(refund_detail,
                                        {
                                            refundRequestId: res.id,
                                            fee_head_id: req_detail[x].fee_head_id,
                                            fee_head_refund_amount: req_detail[x].refund_amount,
                                            status: "Active"
                                        }
                                    ));


                                }

                                Promise.all(promisearr).then(function (data) {
                                    msg.status = 200;
                                    msg.messasge = "Refund request raised successfully";
                                    cb(null, msg);
                                }).catch(function (error) {

                                    // delete the failed record...rollback code start here....

                                })
                            }
                        });


                    } else {
                        msg.status = 202;
                        msg.message = "Refund request already raised";
                        cb(null, msg);
                    }
                }

            });



        }



    }

    Feerefundrequestmaster.createDetailEntry = function (modelName, createObj) {
        return new Promise(function (resolve, reject) {
            modelName.create(createObj, function (err, res) {
                if (err) reject(err)
                else resolve('success')


            });

        })

    }

    Feerefundrequestmaster.remoteMethod(
        'refundrequest',
        {
            http: { path: '/refundrequest', verb: 'post' },
            description: 'Raise refund request',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );



    Feerefundrequestmaster.refundrequestlist = function (req, cb) {
        var msg = {};
        var admission_number;
        var requestCondition = { status: "Active" };
        if (req.admission_number) {
            admission_number = req.admission_number;
        } else {
            admission_number = undefined;
        }

        if (req.refund_status) {
            requestCondition.refund_status = req.refund_status;
        } else {
            requestCondition.refund_status = undefined;
        }


        Feerefundrequestmaster.find(
            {
                include: [
                    {
                        relation: "student",
                        scope: {
                            fields: ["id", "name", "admission_no"]
                        }
                    },


                ],
                where: requestCondition
            }, function (error, response) {

                if (error) {
                    msg.status = 201;
                    msg.message = "Error occured";
                    cb(null, msg);
                } else {
                    
                    var finalResponse;
                    if(admission_number == undefined){
                         finalResponse = response;
                    }else{
                        finalResponse = response.filter(o => o.student().admission_no == admission_number);
                    }
                    msg.status = 200;
                    msg.message = "Refund request fetched successfully";
                    cb(null, msg, finalResponse);

                }


            });
    };

    Feerefundrequestmaster.remoteMethod(
        'refundrequestlist',
        {
            http: { path: '/refundrequestlist', verb: 'post' },
            description: 'Raise refund request list',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    Feerefundrequestmaster.updaterequest = function (req, cb) {
        var msg = {};
 
        if (!req.id) {
            msg.status = "201";
            msg.messasge = "request id can not be blank";
            cb(null, msg);
        }
        if (!req.refund_status) {
            msg.status = "201";
            msg.messasge = "Refund status can not be blank";
            cb(null, msg);
        }
        if (!req.action_by) {
            msg.status = "201";
            msg.messasge = "Action by can not be blank";
            cb(null, msg);
        }
        var conditions = { id: req.id };
        var updateData = { 
            refund_status : req.refund_status,
            action_by : req.action_by,
            action_date: dateFormat(Date(), "yyyy-mm-dd HH:MM:ss")
        };
        Feerefundrequestmaster.upsertWithWhere(conditions, updateData, function (error, response) {
            if (error) {
                msg.status = "201";
                msg.messasge = "error occured";
                cb(null, msg);
            } else {

                msg.status = "200";
                msg.messasge = "Refund request has been " + req.refund_status + " successfully";
                cb(null, msg, response);
            }


        });
    }

    Feerefundrequestmaster.remoteMethod(
        'updaterequest',
        {
            http: { path: '/updaterequest', verb: 'post' },
            description: 'approve/reject the refund request',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );




    Feerefundrequestmaster.getRefundedFees = function (req){
        var response={};
        return new Promise(function(resolve,reject){

            Feerefundrequestmaster.find(
                {
                    where: {and: [
                        {status: "Active",refund_status:req.refund_status},
                        {sessionId: {inq:req.sessionIds }},
                        {schoolId: {inq:req.schoolIds}},
                        {requested_date: {gte: dateFormat(req.from_date, "isoDate")}},
                        {requested_date: {lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59")}} 
                    ]
                    }                    
                }
                ,function(err,res){
                    if(err) {
                        reject(err)
                    } else {
                        response.refunds=res;
                        resolve(response)
                    } 
                    
                
                }
            );
            
        })

    }


};
