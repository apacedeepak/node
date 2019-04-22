'use strict';

module.exports = function (Studentfeestructure) {


    Studentfeestructure.savestudentfee = function (req, cb) {
        var msg = {};
        var conditions = {};
        var cgst;
        var sgst;
        var igst;
        if (req.fee_structure_id > 0
            && req.userId > 0
            && req.session_id > 0
            && req.school_id > 0 && req.section_id > 0) {


           var feeHeadModel = Studentfeestructure.app.models.fee_head_master;

           feeHeadModel.find(
            {     
            where:{status:"Active"
               
            },

   
             } ,
             (et, rt) => {
                
                if(et)
                {
                    msg.status = "201";
                    msg.message = "Error Occured";
                    cb(null,msg);
                }else{

                    
            var assign_term_fee = Studentfeestructure.app.models.assign_term_fee;


            assign_term_fee.find(
                {
                    where: {
                        fee_structure_id: req.fee_structure_id,
                        session_id: req.session_id,
                        school_id: req.school_id
                    }
                }, function (e, r) {
                    if (e) {
                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    } else {
                        if (r.length == 0) {
                            msg.status = "201";
                            msg.messasge = "No fee head assign to this fee structure.";
                            cb(null, msg);
                        }
                        else {
                            // validate then assign feestructure to student...
                            var insertArr = {
                                fee_structure_id: req.fee_structure_id,
                                userId: req.userId,
                                session_id: req.session_id,
                                school_id: req.school_id,
                                applicable_from_term: req.applicable_from_term > 0 ? req.applicable_from_term : 0,
                                advance_amount: req.advance_amount > 0 ? req.advance_amount : 0.00,
                                fee_type: req.fee_type,
                                status: "Active",
                                discount_category:req.discount_category,
                                discount_subCategory:req.discount_subCategory,
                                assign_date: new Date()
                            };
                            Studentfeestructure.create(insertArr, function (err, res) {
                                if (err) {
                                    msg.status = "201";
                                    msg.messasge = "error occured";
                                    cb(null, msg);
                                } else {
                                    // After structure assignment copy the Assign term-fee into student_fee table.
                                    // assign fee strcuture to student...

                                    let promiseArr = [];
                                    var x = 0;
                                    //console.log(r);
                                    var base_price_after_discount;
                                    var amount_with_tax;
                                    var student_fee = Studentfeestructure.app.models.student_fee;
                                    for (x = 0; x < r.length; x++) {
                                        if(req.optional && req.optional.length>0){
                                        var option=req.optional.includes( r[x].fee_head_id)
                                        if(option==true){
                                            continue;
                                        }}
                                        var percentage=0;
                                        if (req.discount && req.discount.length > 0) {

                                            req.discount.forEach(element => {
                                                //console.log("dhid"+element.fee_head_id)
                                                //console.log(">>>>");
                                                //console.log("hid="+r[x].fee_head_id)
                                                if (element.fee_head_id == r[x].fee_head_id) {
                                                    percentage = element.discount_percent;
                                                  
                                                } 

                                            });


                                        } else {
                               
                                            percentage = 0
                                        }


                                        if(rt.find(o=> (o.id == r[x].fee_head_id)).cgst == undefined){
                                            cgst = 0;
                                        }else{
                                            cgst = rt.find(o=> (o.id == r[x].fee_head_id)).cgst;
                                        }


                                        if(rt.find(o=> (o.id == r[x].fee_head_id)).sgst == undefined){
                                            sgst = 0;
                                        }else{
                                            sgst = rt.find(o=> (o.id == r[x].fee_head_id)).sgst;
                                        }

                                        if(rt.find(o=> (o.id == r[x].fee_head_id)).igst == undefined){
                                            igst = 0;
                                        }else{
                                            igst = rt.find(o=> (o.id == r[x].fee_head_id)).igst;
                                        }

                                        base_price_after_discount = parseFloat(((r[x].amount) - ((r[x].amount * percentage)/100)).toFixed(2));
                                        
                                        amount_with_tax = parseFloat(((base_price_after_discount + ((base_price_after_discount*cgst)/100) + ((base_price_after_discount*sgst)/100) + ((base_price_after_discount*igst)/100) )).toFixed(2));
                                        
                                        var feeArr = {
                                            section_id: req.section_id,
                                            session_id: req.session_id,
                                            userId: req.userId,
                                            term_id: r[x].term_name_id,
                                            fee_structure_term_id: r[x].fee_structure_term_id,
                                            feehead_id: r[x].fee_head_id,  //optional head check need to write...
                                            group_head: 0,
                                            fee_structure_id: req.fee_structure_id,
                                            base_price:r[x].amount,
                                            base_price_after_discount:base_price_after_discount,
                                            amount: amount_with_tax,
                                            fee_type: r[x].fee_type,
                                            added_by: req.added_by,
                                            added_date: new Date(),
                                            status: "Active",
                                            discount: percentage,
                                            cgst: cgst,
                                            sgst: sgst,
                                            igst: igst
                                        };
                                 
                                        promiseArr.push(Studentfeestructure.createDetailEntry(student_fee, feeArr));
                                    }

                                    Promise.all(promiseArr).then(function (data) {
                                        // After saving Fee ,get due fee and reset the defaulter table
                                        // defaulter table is just used to get the due balance term-wise...

                                        //var defaulterModel =  Studentfeestructure.app.models.fee_defaulter;
                                        var defaulterJsonReq = {
                                            section_id: req.section_id,
                                            session_id: req.session_id,
                                            userId: req.userId,
                                            fee_structure_id: req.fee_structure_id
                                        };

                                        var promissDefaulter = [];
                                        promissDefaulter.push(Studentfeestructure.resetfeedefaulter(defaulterJsonReq));

                                        Promise.all(promissDefaulter).then(function (data) {
                                            msg.status = "200";
                                            msg.messasge = "Fee added successfully...";
                                            cb(null, msg);

                                        }).catch(function (defaultererror) {
                                            //console.log(defaultererror);
                                        });





                                    }).catch(function (error) {

                                        // delete the failed record...rollback code start here....

                                    });

                                }
                            });

                        }


                    }

                });
                }

                
              
                
               }); 



        
        
        
    




        
        
            }
        else {
            msg.status = "201";
            msg.messasge = "fee_structure_id,userId,session_id,school_id can not be empty...";
            cb(null, msg);
        }


    }
    Studentfeestructure.createDetailEntry = function (modelName, createObj) {
        return new Promise(function (resolve, reject) {
            modelName.create(createObj, function (er, re) {
                if (er) { console.log(er); reject(er) }
                else resolve('success')


            });

        })

    }



    Studentfeestructure.resetfeedefaulter = function (req) {

        var defaulterModel = Studentfeestructure.app.models.fee_defaulter;
        return new Promise(function (resolve, reject) {

            var jsonReq = {
                section_id: req.section_id,
                session_id: req.session_id,
                userId: req.userId,
                fee_structure_id: req.fee_structure_id,
                status: "Active"
            }

            var studentFeeModel = Studentfeestructure.app.models.student_fee;

            studentFeeModel.find({
                include: [{
                    relation: 'dueshead',
                },
                {
                    relation: 'term',
                }
                ],
                where: jsonReq
            }, function (err, res) {

                if (err) {
                    reject(err);
                } else {
                    if (res.length == 0) {
                        resolve('success');
                    } else {

                        var promiseArr = [];
                        //console.log(res);
                        let i = 0;
                        var due_amount = 0.00;
                        var feeDefaulterArr = [];
                        for (i = 0; i < res.length; i++) {


                            var paid_fee = 0.00;
                            due_amount = res[i].amount - paid_fee;
                            var pushJson = {
                                sectionId: req.section_id,
                                sessionId: req.session_id,
                                userId: req.userId,
                                fee_structure_id: req.fee_structure_id,
                                term_name_id: res[i].term_id,
                                term_name: res[i].term().term_name,
                                fee_head_id: res[i].feehead_id,
                                fee_head_name: res[i].dueshead().fee_head_name,
                                priority: res[i].dueshead().priority,
                                cgst:res[i].cgst,
                                sgst:res[i].sgst,
                                igst:res[i].igst,
                                //amount:res[i].amount,
                                due_amount: due_amount,
                                status: "Active"
                            };
                            //console.log(pushJson);
                            promiseArr.push(
                                new Promise(function (rslv, rej) {
                                    defaulterModel.create(pushJson, function (er, re) {
                                        if (er) rej(er)
                                        else rslv('success')
                                    });
                                }));

                        }

                        Promise.all(promiseArr).then(function (data) {

                            resolve('success');
                        });



                    }
                }

            });


            // defaulterModel.resetfeedefaulter(req, function (er, re) {
            //     if (er){ console.log(er);reject(er)}
            //     else resolve('success')


            // });

        });

    }






    Studentfeestructure.remoteMethod(
        'savestudentfee',
        {
            http: { path: '/savestudentfee', verb: 'post' },
            description: 'savestudentfee',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    Studentfeestructure.savemigratedstudentfee = function (req, cb) {
        var msg = {};
        var conditions = {};
        var cgst;
        var sgst;
        var igst;
        var due_fee;
        if(req.due_fee == undefined){
            due_fee = 0;
        }else{
            due_fee = req.due_fee;
        }
        var due_fee = req.due_fee;
        if (req.fee_structure_id > 0
            && req.userId > 0
            && req.session_id > 0
            && req.school_id > 0 && req.section_id > 0) {


           var feeHeadModel = Studentfeestructure.app.models.fee_head_master;

           feeHeadModel.find(
            {     
            where:{status:"Active"
               
            },

   
             } ,
             (et, rt) => {
                
                if(et)
                {
                    msg.status = "201";
                    msg.message = "Error Occured";
                    cb(null,msg);
                }else{

                    
            var assign_term_fee = Studentfeestructure.app.models.assign_term_fee;


            assign_term_fee.find(
                {
                    include: [{
                        relation: 'fee_head',
                        fields: ['fee_head_name','priority']
                    },
                    ],
                    where: {
                        fee_structure_id: req.fee_structure_id,
                        session_id: req.session_id,
                        school_id: req.school_id
                    }
                }, function (e, r) {
                    if (e) {
                        msg.status = "201";
                        msg.messasge = "error occured";
                        cb(null, msg);
                    } else {
                        if (r.length == 0) {
                            msg.status = "201";
                            msg.messasge = "No fee head assign to this fee structure.";
                            cb(null, msg);
                        }
                        else {

                            // refine 
                            //console.log(r);
                            var atf = [];
                            var headStr;
                            r.forEach(function(o,i){
                                atf[i] = {};
                                
                            atf[i].term_name_id = o.term_name_id;
                            atf[i].fee_structure_term_id = o.fee_structure_term_id;
                            atf[i].session_id = o.session_id;
                            atf[i].fee_structure_id = o.fee_structure_id;
                            atf[i].school_id = o.school_id;
                            atf[i].status = o.status;
                            atf[i].fee_head_id = o.fee_head_id;
                            atf[i].fee_type = o.fee_type;
                            atf[i].amount = o.amount;
                            atf[i].added_by = o.added_by;
                            atf[i].added_date = o.added_date;
                            atf[i].id = o.id;
                            atf[i].fee_head_name = o.fee_head().fee_head_name;
                            atf[i].priority = o.fee_head().priority;


                            if(o.fee_head().fee_head_name.toLowerCase() == 'STUDENT KIT'.toLowerCase()){
                                atf[i].custompriority = -1;

                            }else if(o.fee_head().fee_head_name.toLowerCase() == 'TUTION'.toLowerCase()){
                                atf[i].custompriority = 0;
                            }
                            else{
                                atf[i].custompriority = o.fee_head().priority;
                            }
                            
                            });
                            //console.log(atf);
                            atf.sort((a,b)=>{
                                if(a.custompriority == b.custompriority){
                                    return a.term_name_id-b.term_name_id;
                                }
                                return a.custompriority > b.custompriority ? 1 : -1;
                                // if(a.term_name_id == b.term_name_id){
                                //     return a.custompriority-b.custompriority;
                                // }
                                // return a.term_name_id > b.term_name_id ? 1 : -1;
                            });
                            //after sorting apply Head wise then term wis to fullfill the max utilization of Student Kit and Tution Fee");
                            //console.log(atf); //distribution arra is ready here...
                            //console.log("----");
                            r = [];
                            var tempAmount = due_fee;
                            atf.forEach(function(o,i){
                                r[i] = {};
                                if(o.amount <= tempAmount){
                                    r[i].amount = o.amount;
                                    tempAmount = tempAmount - o.amount;
                                }else{
                                    r[i].amount = tempAmount;
                                    tempAmount = 0;
                                }
                                r[i].term_name_id = o.term_name_id;
                                r[i].fee_structure_term_id = o.fee_structure_term_id;
                                r[i].session_id = o.session_id;
                                r[i].fee_structure_id = o.fee_structure_id;
                                r[i].school_id = o.school_id;
                                r[i].status = o.status;
                                r[i].fee_head_id = o.fee_head_id;
                                r[i].fee_type = o.fee_type;
                                
                                r[i].added_by = o.added_by;
                                r[i].added_date = o.added_date;
                                r[i].id = o.id;
                                r[i].fee_head_name = o.fee_head_name;
                                r[i].priority = o.priority;
                                r[i].custompriority = o.custompriority;

                            });

                           // console.log(r);
                            


                            // validate then assign feestructure to student...
                            var insertArr = {
                                fee_structure_id: req.fee_structure_id,
                                userId: req.userId,
                                session_id: req.session_id,
                                school_id: req.school_id,
                                applicable_from_term: req.applicable_from_term > 0 ? req.applicable_from_term : 0,
                                advance_amount: req.advance_amount > 0 ? req.advance_amount : 0.00,
                                fee_type: req.fee_type,
                                status: "Active",
                                discount_category:req.discount_category,
                                discount_subCategory:req.discount_subCategory,
                                assign_date: new Date()
                            };
                            Studentfeestructure.create(insertArr, function (err, res) {
                                if (err) {
                                    msg.status = "201";
                                    msg.messasge = "error occured";
                                    cb(null, msg);
                                } else {
                                    // After structure assignment copy the Assign term-fee into student_fee table.
                                    // assign fee strcuture to student...

                                    let promiseArr = [];
                                    var x = 0;
                                    //console.log(r);
                                    var base_price_after_discount;
                                    var amount_with_tax;
                                    var student_fee = Studentfeestructure.app.models.student_fee;
                                    for (x = 0; x < r.length; x++) {
                                        
                                        var percentage=0;
                                        
                                        if(rt.find(o=> (o.id == r[x].fee_head_id)).cgst == undefined){
                                            cgst = 0;
                                        }else{
                                            cgst = rt.find(o=> (o.id == r[x].fee_head_id)).cgst;
                                        }


                                        if(rt.find(o=> (o.id == r[x].fee_head_id)).sgst == undefined){
                                            sgst = 0;
                                        }else{
                                            sgst = rt.find(o=> (o.id == r[x].fee_head_id)).sgst;
                                        }

                                        if(rt.find(o=> (o.id == r[x].fee_head_id)).igst == undefined){
                                            igst = 0;
                                        }else{
                                            igst = rt.find(o=> (o.id == r[x].fee_head_id)).igst;
                                        }

                                        base_price_after_discount = parseFloat(((r[x].amount) - ((r[x].amount * percentage)/100)).toFixed(2));
                                        
                                        amount_with_tax = parseFloat(((base_price_after_discount + ((base_price_after_discount*cgst)/100) + ((base_price_after_discount*sgst)/100) + ((base_price_after_discount*igst)/100) )).toFixed(2));
                                        
                                        var feeArr = {
                                            section_id: req.section_id,
                                            session_id: req.session_id,
                                            userId: req.userId,
                                            term_id: r[x].term_name_id,
                                            fee_structure_term_id: r[x].fee_structure_term_id,
                                            feehead_id: r[x].fee_head_id,  //optional head check need to write...
                                            group_head: 0,
                                            fee_structure_id: req.fee_structure_id,
                                            base_price:r[x].amount,
                                            base_price_after_discount:base_price_after_discount,
                                            amount: amount_with_tax,
                                            fee_type: r[x].fee_type,
                                            added_by: req.added_by,
                                            added_date: new Date(),
                                            status: "Active",
                                            discount: percentage,
                                            cgst: cgst,
                                            sgst: sgst,
                                            igst: igst
                                        };
                                 
                                        promiseArr.push(Studentfeestructure.createDetailEntry(student_fee, feeArr));
                                    }

                                    Promise.all(promiseArr).then(function (data) {
                                        // After saving Fee ,get due fee and reset the defaulter table
                                        // defaulter table is just used to get the due balance term-wise...

                                        //var defaulterModel =  Studentfeestructure.app.models.fee_defaulter;
                                        var defaulterJsonReq = {
                                            section_id: req.section_id,
                                            session_id: req.session_id,
                                            userId: req.userId,
                                            fee_structure_id: req.fee_structure_id
                                        };

                                        var promissDefaulter = [];
                                        promissDefaulter.push(Studentfeestructure.resetfeedefaulter(defaulterJsonReq));

                                        Promise.all(promissDefaulter).then(function (data) {
                                            msg.status = "200";
                                            msg.messasge = "Fee migrated successfully...";
                                            cb(null, msg);

                                        }).catch(function (defaultererror) {
                                            //console.log(defaultererror);
                                        });





                                    }).catch(function (error) {

                                        // delete the failed record...rollback code start here....

                                    });

                                }
                            });

                        }


                    }

                });
                }

                
              
                
               }); 



        
        
        
    




        
        
            }
        else {
            msg.status = "201";
            msg.messasge = "fee_structure_id,userId,session_id,school_id can not be empty...";
            cb(null, msg);
        }


    }
    
    Studentfeestructure.remoteMethod(
        'savemigratedstudentfee',
        {
            http: { path: '/savemigratedstudentfee', verb: 'post' },
            description: 'savestudentfee',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );


    Studentfeestructure.assignnewpayemnt = function (req, cb) {
        var msg={}
    var obj={
        "reason":req.reason,
        "status":req.status
    }
    var student_fee_obj={
        "status":req.status
    }
    var assignstudentfee={
        "userId":req.userId,
        "fee_structure_id":req.fee_structure_id,
    "section_id":req.section_id,
    "session_id":req.session_id,
    "school_id":req.school_id
    }
    var studentFeeModel = Studentfeestructure.app.models.student_fee;
    var defaulter = Studentfeestructure.app.models.fee_defaulter;
    var receipt = Studentfeestructure.app.models.receipt;
    var session=Studentfeestructure.app.models.session;
    Studentfeestructure.updateAll({userId:req.userId},obj,function(err,res){
        if(err){
            msg.status="201",
            msg.message="Error Occured"
            cb(null,msg)
        }
        if(res){
            studentFeeModel.updateAll({userId:req.userId},student_fee_obj,function(errr,response){
                if(errr){
                    msg.status="201",
                    msg.message="Error Occured"
                    cb(null,msg)
                }
                if(response){
                    msg.status="200",
                    msg.message="SuccessFull"
                    defaulter.updateAll({userId:req.userId},student_fee_obj,function(errors,respo){
                if(respo){
                Studentfeestructure.savestudentfee(assignstudentfee ,function(errs,resp){
                    if(resp){
                        console.log(resp)
                        session.allsessionofacademicsession({"id":req.session_id},function(e,r){
                            if(r){
                              
                                var receipt_obj={
                                    "userId":req.userId,
                                    "session_id":r

                                }
                            
                                receipt.totalamountpaid(receipt_obj,function(prob,result){
                                   var total_paid=result 
                                var update_defaulter={
                                    "userId":req.userId,
                                    "sessionId":req.session_id,
                                    "total_paid":total_paid
                                }
                                console.log(update_defaulter)
                                defaulter.updateduesafterfeestructurechange(update_defaulter,function(errrs,data){
                                    if(data){
                                        msg.status="200",
                                        msg.message="SuccessFull"
                                        cb(null,msg)
                                    }
                                })
                                 
                                })  

                            }
                        })
                   
                       
                    }
                })
            }
            })
            }
            })
        }
    }) 
    
    }
    Studentfeestructure.remoteMethod(
        'assignnewpayemnt',
        {
            http: { path: '/assignnewpayemnt', verb: 'post' },
            description: 'assignnewpayemnt',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response_status', type: 'json' }
        }
    );






};
