'use strict';
var dateFormat = require('dateformat');
var unique = require('array-unique');
module.exports = function (Imprestrequest) {
  Imprestrequest.addImprestrequest = (data, cb) => {
    var today = new Date();
    var errorMessage = {};
    var successMessage = {};
    var insertObj = {};
    if (data.id > 0) {
      insertObj.id = data.id;
      insertObj.modified_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
      insertObj.modified_by = data.user_id;
      successMessage.message = "Record Updated Successfully.";
    } else {
      insertObj.created_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
      insertObj.created_by = data.user_id;
      insertObj.session_id = data.session_id;
      successMessage.message = "Record Inserted Successfully.";
    }
    insertObj.center_id = data.center_id;
    insertObj.amount = data.imprest_amount;
    insertObj.approved_amount = data.imprest_amount;
    insertObj.approved_status = 1;
    insertObj.status = 1;
    Imprestrequest.upsert(insertObj, (err, result) => {
      if (err) {
        errorMessage.status = '201';
        errorMessage.message = "Error Occurred";
        return cb(err, errorMessage);
      }
      successMessage.status = "200";
      successMessage.detail = result;
      return cb(null, successMessage);
    });

  }
  Imprestrequest.remoteMethod(
    'addImprestrequest',
    {
      http: { path: '/addImprestrequest', verb: 'post' },
      description: 'Add expense master for imprest',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  );
  Imprestrequest.deletecategorymasterdata = function (data, cb) {
    var errorMessage = {};
    var successMessage = {};
    var insertObj = {};
    if (!data) {
      errorMessage.status = "201";
      errorMessage.message = "Bad Request";
      return cb(null, errorMessage);
    }
    insertObj.id = data.id;
    insertObj.status = 0;

    //console.log(insertObj);  
    Imprestrequest.upsert(insertObj, (err, result) => {
      if (err) {
        errorMessage.status = '201';
        errorMessage.message = "Error Occurred";
        return cb(null, errorMessage);
      }
      successMessage.status = "200";
      successMessage.message = "Record Deleted Successfully.";
      successMessage.detail = result;
      return cb(null, successMessage);
    });

  };

  Imprestrequest.remoteMethod(
    'deletecategorymasterdata',
    {
      http: { path: '/deletecategorymasterdata', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  )
  Imprestrequest.imprestapprovalupdate = function (req, cb) {
    var today = new Date();
    var errorMessage = {};
    var successMessage = {};    
    if (!req) {
      errorMessage.status = "201";
      errorMessage.message = "Bad Request";
      return cb(null, errorMessage);
    }
    for (var i = 0; i < req.imprest_id.length; i++) { 
      var insertObj = {};               
      insertObj.id = req.imprest_id[i];
      insertObj.approved_amount =req.approved_amount[i];
      insertObj.approved_status =req.approval_status[i]; 
      insertObj.modified_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
      insertObj.approved_by = req.user_id;     
      Imprestrequest.upsert(insertObj, (err, result) => {
        if (err) {
          errorMessage.status = '201';
          errorMessage.message = "Error Occurred";
          return cb(null, errorMessage);
        }              
      });
    }  
    successMessage.status = "200";
    successMessage.message = "Status Updated Successfully.";    
    return cb(null, successMessage);    
  };
  // Imprestrequest.imprestapprovalupdate = function (req, cb) {
  //   var today = new Date();    
  //   Imprestrequest.beginTransaction('READ COMMITTED', function (err, tx) {
  //     var errorMessage = {};
  //     var successMessage = {};
  //     try {        
  //       var options = {
  //         transaction: tx
  //       };
  //       for (var i = 0; i < req.imprest_id.length; i++) {
  //         var insertObj = {};
  //         insertObj.id = req.imprest_id[i];
  //         insertObj.approved_amount = req.approved_amount[i];
  //         insertObj.approved_status = req.approval_status[i];
  //         insertObj.modified_on = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
  //         insertObj.approved_by = req.user_id;
  //         Imprestrequest.upsert(insertObj,options, (err, result) => {
  //           if (err) throw (err);
  //         });
  //       }
  //       tx.commit(function (err) {});
  //       successMessage.status = "200";
  //       successMessage.message = "Status Updated Successfully.";
  //       return cb(null, successMessage);
  //     } catch (error) {
  //       tx.rollback(function (err) { });
  //       errorMessage.status = '201';
  //       errorMessage.message = "Error Occurred";
  //       return cb(null, errorMessage);
  //     }
  //   })

  // }
  Imprestrequest.remoteMethod(
    'imprestapprovalupdate',
    {
      http: { path: '/imprestapprovalupdate', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  )
  Imprestrequest.getImprestrequest = function (id, cb) {
    Imprestrequest.findOne(
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

  Imprestrequest.remoteMethod("getImprestrequest", {
    http: { path: "/getImprestrequest", verb: "get" },
    description: "Get Row by Doubts Id",
    accepts: { arg: "id", type: "number", required: true },
    returns: { arg: "response", type: "json" }
  });
  Imprestrequest.getallImprestrequest = function (userId, cb) {
    var Userschool = Imprestrequest.app.models.user_school;
    Userschool.find({
      fields: ["schoolId"],
      where: { "userId": userId, "status": "Active" }
    }, function (err, res) {
      var schoolIdArr = [];
      res.forEach(function (value, index) {
        schoolIdArr.push(value.schoolId);
      }); 
      var schoolIdUniqueArr = unique(schoolIdArr);
      let where_cond = { status: 1, center_id: { inq: schoolIdUniqueArr } };      
      Imprestrequest.find(
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
              relation: "school",
              scope: {
                fields: ["school_name"]
              }
            }
          ],
          order: "id DESC"
        },
        function (err, stdObj) {
          return cb(null, stdObj);
        }
      );

    });
  };
  Imprestrequest.remoteMethod("getallImprestrequest", {
    http: { path: '/getallImprestrequest', verb: 'get' },
    description: 'get the all imprest request',
    accepts: { arg: "userId", type: "number", required: true },
    returns: { arg: "response", type: "json" }
  });

  Imprestrequest.getallImprestApproval = function (userId,center_id,approval_status,cb) {
    var Userschool = Imprestrequest.app.models.user_school;
    Userschool.find({
      fields: ["schoolId"],
      where: { "userId": userId, "status": "Active" }
    }, function (err, res) {
      var schoolIdArr = [];
      res.forEach(function (value, index) {
        schoolIdArr.push(value.schoolId);
      });            
      var schoolIdUniqueArr = unique(schoolIdArr);      
      let where_cond = { status: 1, center_id: { inq: schoolIdUniqueArr } };    
      if (approval_status != 0) {       
        where_cond.approved_status = approval_status;
      }
  
      if (center_id != 0) {      
        where_cond.center_id = center_id;
      }  
      Imprestrequest.find(
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
              relation: "school",
              scope: {
                fields: ["school_name"]
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
  };
  Imprestrequest.remoteMethod("getallImprestApproval", {
    http: { path: '/getallImprestApproval', verb: 'get' },
    description: 'get the all imprest request',
    accepts: [
      { arg: "userId", type: "number", required: true },
      { arg: "center_id", type: "number", required: false },
      { arg: "approval_status", type: "number", required: false },
  
  ],
    returns: { arg: "response", type: "json" }
  });
};
