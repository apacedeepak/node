'use strict';
var dateFormat = require('dateformat');
var unique = require('array-unique');
module.exports = function (Expenserequest) {  
  Expenserequest.fileexpenserequest = function (ctx, options, cb) {
    var FileUpload = Expenserequest.app.models.fileupload;
    var today = new Date();
    var errorMessage = {};
    var successMessage = {};
    var insertObj = {};
    FileUpload.fileupload(ctx, options, 'expense_request', function (err, data) {
      if (data.id > 0) {
        insertObj.id = data.id;
        insertObj.modified_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
        insertObj.modified_by = data.user_id;
        successMessage.message = "Expense Updated Successfully.";
      } else {
        insertObj.created_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
        insertObj.created_by = data.user_id;
        insertObj.approval_status = 1;
        insertObj.status = 1;
        successMessage.message = "Expense Added Sucessfully.";
      }

      var filepath = data.file_path[0];
      insertObj.session_id = data.session_id;
      insertObj.center_id = data.center_id;
      insertObj.expense_date = data.expense_date;
      insertObj.expense_for = data.expense_for;
      insertObj.expense_category = data.expense_category;
      insertObj.expense_master_id = data.expense_master_id;
      insertObj.payment_mode = data.payment_mode;
      insertObj.amount = data.amount;
      insertObj.gst_amount = data.gst_amount;
      insertObj.total_amount = data.total_amount;
      insertObj.expense_type = data.expense_type;
      insertObj.bill_doc = filepath;

      Expenserequest.upsert(insertObj, (err, result) => {
        if (err) {
          errorMessage.status = '201';
          errorMessage.message = "Error Occurred";
          return cb(err, errorMessage);
        }
        successMessage.status = "200";
        successMessage.detail = result;
        return cb(null, successMessage);
      });
    });
  }
  Expenserequest.remoteMethod(
    'fileexpenserequest',
    {
      accepts: [
        { arg: 'ctx', type: 'object', http: { source: 'context' } },
        { arg: 'options', type: 'object', http: { source: 'query' } },
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true
      },
      http: { verb: 'post' }
    }
  )
    
  Expenserequest.getapprovalexpenselist = function (data, cb) {
    var Userschool = Expenserequest.app.models.user_school;
    Userschool.find({
      fields: ["schoolId"],
      where: { "userId": data.user_id, "status": "Active" }
    }, function (err, res) {
      var schoolIdArr = [];  
      var where_condition = {};    
      res.forEach(function (value, index) {
        schoolIdArr.push(value.schoolId);
      });
      var schoolIdUniqueArr = unique(schoolIdArr);
      let where_cond = { status: 1,expense_type:data.expense_type, center_id: { inq: schoolIdUniqueArr } };
      if (data.approval_status != 0) {
        where_cond.approval_status = data.approval_status;
      }
      if (data.center_id != 0) {
        where_cond.center_id = data.center_id;
      }
      if (data.from_date && data.to_date) {
        where_condition = {
          and: [
            {
              expense_date: {
                gte: dateFormat(data.from_date, "yyyy-mm-dd'T'00:00:00")
              }
            },
            {
              expense_date: {
                lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")
              }
            },
            where_cond
          ]
        };
      }else{
        where_condition=where_cond;
      }
      Expenserequest.find(
        {
          where: where_condition,
          include: [
            {
              relation: "user",
              scope: {
                fields: ["user_name"]
              }
            },
            {
              relation: "expenseFor",
              scope: {
                fields: ["name"]
              }
            },
            {
              relation: "expenseCategory",
              scope: {
                fields: ["category_name"]
              }
            },
            {
              relation: "expenseMode",
              scope: {
                fields: ["payment_mode"]
              }
            },
            {
              relation: "school",
              scope: {
                fields: ["school_name"]
              }
            }, {
              relation: "expenseMaster",
              scope: {
                fields: ["expense_name"]
              }
            }
          ],
          order: "id DESC"
        },
        function (err, stdObj) {
          return cb(err, stdObj);
        }
      );
    });
  }
  Expenserequest.remoteMethod(
    'getapprovalexpenselist',
    {
      http: { path: '/getapprovalexpenselist', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  ) 
  Expenserequest.centerSessionExpenseAmount = function (data, cb) {
    var imprestRequestObj = Expenserequest.app.models.imprest_request;
    var statusArr=[1,2];
    var imprestApprovedAmt = 0;
    var expenseApprovedAmt = 0;
    var centerSessionExpenseDetail= {};    
    imprestRequestObj.find({
      fields: ["approved_amount"],
      where: { "session_id": data.session_id, "center_id": data.center_id, "approved_status": 2, "status": 1 }
    }, function (err, res) { 
      if(err){
        return cb(err,res);
      }     
      res.forEach(function (value, index) {
        imprestApprovedAmt = imprestApprovedAmt + value.approved_amount;
      });       
      Expenserequest.find(
        {
          fields: ["total_amount"],
          where: { "session_id": data.session_id, "center_id":data.center_id, "expense_type": 1, "status": 1,"approval_status": { inq: statusArr } }
        },
        function (err, stdObj) {
          if(err){
            return cb(err,stdObj);
          } 
          stdObj.forEach(function (value, index) {
            expenseApprovedAmt = expenseApprovedAmt + value.total_amount;
          });
          centerSessionExpenseDetail.imprest_approved_amt=imprestApprovedAmt;
          centerSessionExpenseDetail.expense_approved_amt=expenseApprovedAmt;
          centerSessionExpenseDetail.available_approved_amt=imprestApprovedAmt - expenseApprovedAmt;
          return cb(err, centerSessionExpenseDetail);
        }
      );

    });

   
  }

  Expenserequest.remoteMethod(
    'centerSessionExpenseAmount',
    {
      http: { path: '/centerSessionExpenseAmount', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  ) 
  
  Expenserequest.getfileexpensedetail = function (id, cb) {
    Expenserequest.findOne(
      {
        where: { id: id }
      },
      function (err, res) {
        if (err) {
          cb(null, err);
        }
        cb(null, res);
      }
    );
  };
  Expenserequest.remoteMethod("getfileexpensedetail", {
    http: { path: "/getfileexpensedetail", verb: "get" },
    description: "Get Row by Doubts Id",
    accepts: { arg: "id", type: "number", required: true },
    returns: { arg: "response", type: "json" }
  });

  
  Expenserequest.updateexpenseapproval = function (data, cb) {
    var errorMessage = {};
    var successMessage = {};
    var insertObj = {};
    if (!data) {
      errorMessage.status = "201";
      errorMessage.message = "Bad Request";
      return cb(null, errorMessage);
    }
    insertObj.id = data.id;
    insertObj.approval_status =data.approval_status;

    //console.log(insertObj);
    Expenserequest.upsert(insertObj, (err, result) => {
      if (err) {
        errorMessage.status = '201';
        errorMessage.message = "Error Occurred";
        return cb(err, errorMessage);
      }
      successMessage.status = "200";
      successMessage.message = "";
      if(data.approval_status=='2'){
        successMessage.message = "Approved Successfully.";
      }else if(data.approval_status=='3'){
        successMessage.message = "Rejected Successfully.";
      }
      
      successMessage.detail = result;
      return cb(null, successMessage);
    });

  };

  Expenserequest.remoteMethod(
    'updateexpenseapproval',
    {
      http: { path: '/updateexpenseapproval', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  )
  
  Expenserequest.getserachexpense = function (postdata, cb) {
    var Userschool = Expenserequest.app.models.user_school;
    Userschool.find({
      fields: ["schoolId"],
      where: { "userId": postdata.user_id, "status": "Active" }
    }, function (err, res) {
      var schoolIdArr = [];
      res.forEach(function (value, index) {
        schoolIdArr.push(value.schoolId);
      });
      var schoolIdUniqueArr = unique(schoolIdArr);
      let where_cond = { status: 1,expense_type:postdata.expense_type,center_id: { inq: schoolIdUniqueArr } };
      if (postdata.approval_status != 0) {
        where_cond.approval_status = postdata.approval_status;
      }
      if (postdata.center_id != 0) {
        where_cond.center_id = postdata.center_id;
      }
      Expenserequest.find(
        {
          where: where_cond,
          include: [
            {
              relation: "user",
              scope: {
                fields: ["user_name"]
              }
            },
            {
              relation: "expenseFor",
              scope: {
                fields: ["name"]
              }
            },
            {
              relation: "expenseCategory",
              scope: {
                fields: ["category_name"]
              }
            },
            {
              relation: "expenseMode",
              scope: {
                fields: ["payment_mode"]
              }
            },
            {
              relation: "school",
              scope: {
                fields: ["school_name"]
              }
            }, {
              relation: "expenseMaster",
              scope: {
                fields: ["expense_name"]
              }
            }
          ],
          order: "id DESC"
        },
        function (err, stdObj) {
          return cb(err, stdObj);
        }
      );
    });
  }

  Expenserequest.remoteMethod(
    'getserachexpense',
    {
      http: { path: '/getserachexpense', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  );

  Expenserequest.getSchoolsExpense = (req) => {
    let response = {}
    return new Promise(function(resolve,reject){

      Expenserequest.find(
        {
            where: {and: [
                {status: req.status,approval_status:req.approval_status},
                {session_id: {inq:req.sessionIds }},
                {center_id: {inq:req.schoolIds}},
                {expense_date: {gte: dateFormat(req.from_date, "isoDate")}},
                {expense_date: {lte: dateFormat(req.to_date, "yyyy-mm-dd'T'23:59:59")}} 
            ]
            }                    
         }
         ,function(err,res){
          if(err) {
            reject(err)
          } else {
            response.expenses=res
            resolve(response);

          } 
          
            
     });
      

    })

    
  }






  




}
