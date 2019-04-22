'use strict';

module.exports = function(Revenuetarget) {

    Revenuetarget.addRevenueTarget=function(req,cb) {
        var msg = {};var revenueMonths;var revenueFeeTerms;var refRevenueFeeTerms;
        var Feestructuretermmaster=Revenuetarget.app.models.fee_structure_term_master;
        var Revenuetargetfeeterm=Revenuetarget.app.models.revenue_target_fee_term;
        var params={};
        var termArr=[];
        params.fee_structure_id=req.fee_structure_id;
        params.session_id=req.session_id;
        params.school_id=req.school_id;
            

        

        Feestructuretermmaster.getFeeStructureTerm(req,function(err,res){
            if(err) cb(err,null);

            if(res.length > 0){
                
                Revenuetarget.beginTransaction('READ COMMITTED', function (err, tx) {
                    try {
                        var options = { transaction: tx };
                        req['revenue_target']=0;
                        req['added_date']=new Date();
                        req['modified_date']=new Date();
                        Revenuetarget.upsert(req,options,function(err,result){
        
                            if(err) {
                                throw (err);
                            } else {
                                var revenueAmount=0;
                                var i=0;
                                 
                                 for(let feeTerm of res) {
                                     let objDate = new Date(feeTerm.start_date);
                                     let year=objDate.getFullYear();
                                     let month=objDate.getMonth()+1;
                                     month=('0' + month).slice(-2);
                                     let yearMonth=year+month;
                                     var termAmount=0;
                                     var revenueMonth=parseInt(yearMonth);
                                                                   
                 
                                         for(let termFee of feeTerm.term_fee()) {
                                             var headAmount=0;
                                             if(termFee.fee_head().is_offer_applicable) {
                                                 let headDiscount= termFee.amount*req.discount_target/100;
                                                 headAmount=parseFloat(termFee.amount)-parseFloat(headDiscount);
                                             } else {
                                                 headAmount=termFee.amount;
                                             }
                                         
                                             termAmount=termAmount+headAmount*req.admission_target;
                                         }
        
                                         //to get revenue month
                                        if(parseInt(req.month) < parseInt(yearMonth) && i<1) {
                                            revenueMonth=req.month;
                                        } else  {
                                            if(parseInt(req.month) >= parseInt(yearMonth)) {
                                                revenueMonth=req.month;
                                            } else {
                                                revenueMonth=yearMonth;
                                            }
                                            
                                        }
        
                                        
        
                                         // To add in table revenue_target_fee_term
                                         let termData={};
                                         termData.fee_term_id=feeTerm.id;
                                         termData.fee_structure_id=req.fee_structure_id;
                                         termData.amount=termAmount;
                                         termData.month=revenueMonth;
                                         termData.revenue_target_id=result.id;
                                         
                                        if(req.id) {
                                            var  conditions = {};
                                            var  updateData = {};
                                            updateData.amount=termData.amount;
            
                                            conditions.revenue_target_id=termData.revenue_target_id;
                                            conditions.month=termData.month;
                                            conditions.fee_term_id=termData.fee_term_id;
                                            Revenuetargetfeeterm.updateAll(conditions,updateData,options,function(err,res){
                                                if(err) throw(err);
                                            });
                                            msg.message = "Revenue Target updated Successfully";
                                        } else {
                                            Revenuetargetfeeterm.upsert(termData,options,function(err,res){
                                                if(err) throw (err);
                                            });
                                           
                                            msg.message = "Revenue Target Added Successfully";
                                        }
                                     
                                                                           
                                     i=parseInt(i)+1;
                                 }

                                tx.commit(function (err) { 


                                    Revenuetargetfeeterm.getRevenueTargetFeeTerm(req,function(err,res) {
                                        if(err) {
                                            msg.status = "401";
                                            msg.message="Error Occurred";
                                            cb(err,msg,null);
                                        } else {
                                            //console.log(res);
                                            if(res.length > 0) {
                                                for(let revenueFeeTerm of res) {
                                                    revenueAmount=revenueAmount+parseFloat(revenueFeeTerm.amount);
                                                }
                                            }
                                            msg.status = "200";
                                            result.revenue_target=revenueAmount;
                                            cb(null,msg,result);
                                        }  
    
                                       
    
                                    });


                                });
                              
                                
                                
        
                                
                            }
        
                        });



                    } catch (error) {

                        tx.rollback(function (err) {});
                        return cb(error, null);

                    }
               


                });

                
            } else {
                msg.status = "201";
                msg.message = "Fee term not configured";
                cb(null,msg,res);
            }



        });



        


    }




    Revenuetarget.getMonthRevenueTarget=function(req,cb) {
        var conditions={};
        var revenueCondition={};
        if(req.session_id) conditions.session_id=req.session_id;
        if(req.school_id) { conditions.school_id=req.school_id; }
        if(req.fee_structure_id) conditions.fee_structure_id=req.fee_structure_id;
        if(req.month) { conditions.month=req.month; revenueCondition.month = req.month; }
        if(req.status) conditions.status=req.status;
        
        Revenuetarget.find(
            {
                include:[{
                    relation:"fee_structure",
                    scope: {
                        include:{
                            relation: "revenue_target_fee_term",
                                
                                scope: {
                                    where: revenueCondition,
                                    fields: ['id','amount','fee_term_id','month'],
                                    
                                }
                        },
                        fields:['fee_structure_name','session_id']

                    }

                }],
                where:conditions

            },function(err,res){
                if(err)
                cb(err,null);
                else 
                cb(null,res);


            });

        
    }

    Revenuetarget.updateStatus=function(req,cb) {

        Revenuetarget.beginTransaction('READ COMMITTED',function(err,tx){
         try {
            var msg={};
            var options = {
                transaction: tx
              };
              for (var i = 0; i < req.id.length; i++) {
                var data={};
                data.id=req.id[i];
                data.status=req.status[i];
                Revenuetarget.upsert(data,options,function(err,res){
                    if(err) throw (err);
                });
                
              }
            
            tx.commit(function (err) {});
            msg.status = "200";
            msg.message = "Status Updated Successfully";
            cb(null,msg)
            
         } catch (error) {

            tx.rollback(function (err) {});
            return cb(error, null);

         }

           

        })

        

    }



    Revenuetarget.remoteMethod(
        'addRevenueTarget',
        {
            http:{ path:'/addrevenuetarget',verb:'post'},
            description:'To Add Revenue Target',
            accepts:{arg:'data',type:'object',http:{source:'body'} },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
        

    );


    Revenuetarget.remoteMethod(
        'getMonthRevenueTarget',
        {
            http:{ path:'/getmonthrevenuetarget',verb:'post'},
            description:'To get month Revenue Target',
            accepts:{arg:'data',type:'object',http:{source:'body'} },
            returns:{ arg: 'response', type: 'json' }
        }
        

    );


    Revenuetarget.remoteMethod(
        'updateStatus',
        {
            http:{ path:'/updatestatus',verb:'post'},
            description:'To update month Revenue Target',
            accepts:{arg:'data',type:'object',http:{source:'body'} },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
        

    );

    


};
