'use strict';
var dateFormat = require('dateformat');
module.exports = function (Invraiserequest) {
  Invraiserequest.raiserequest = function (ctx, options, cb) {
    var FileUpload = Invraiserequest.app.models.fileupload;
    var today = new Date();
    var errorMessage = {};
    var successMessage = {};
    var insertObj = {};
    FileUpload.fileupload(ctx, options, 'inventory_raise_request', function (err, data) {
      if (data.id > 0) {
        insertObj.id = data.id;
        insertObj.modified_date = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
        insertObj.modified_by = data.user_id;               
        successMessage.message = "Record Updated Successfully.";
      } else {
        insertObj.created_date = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
        insertObj.created_by = data.user_id;
        insertObj.inv_request_status = 1;
        insertObj.status = 1;
        successMessage.message = "Record Inserted Successfully.";
      }
      var now = new Date();
      var yeartoday = now.getFullYear().toString(); // 2011
      var uniqueNumber = new Date().getTime();
      var filepath = data.file_path[0];
      insertObj.request_id = yeartoday + '/' + uniqueNumber;
      insertObj.inv_category_master_id = data.inv_category_master_id;
      insertObj.inv_item_master_id = data.inv_item_master_id;
      insertObj.quantity = data.quantity;
      insertObj.price = data.price;
      insertObj.total_price = data.item_total_price;
      insertObj.description = data.description;
      insertObj.image_path = filepath;            
      insertObj.center_id = data.center_id;      
      Invraiserequest.upsert(insertObj, (err, result) => {
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
  Invraiserequest.remoteMethod(
    'raiserequest',
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
  Invraiserequest.getallraiserequest = function (cb) {
    let where_cond = {};
    where_cond.status = 1;
    Invraiserequest.find(
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
            relation: "itemMasterCategory",
            scope: {
              fields: ["category_name"]
            }
          },
          {
            relation: "itemMaster",
            scope: {
              fields: ["item_name"]
            }
          },
          {
            relation: "school",
            scope: {
              fields: ["school_name"]
            }
          },{
            relation: "inv_request_status",
            scope: {
              fields: ["status_name","display_label"]
            }
          }
        ],
        order: "id DESC"
      },
      function (err, stdObj) {
        return cb(null, stdObj);
      }
    );
  }
  Invraiserequest.remoteMethod("getallraiserequest", {
    http: { path: "/getallraiserequest", verb: "get" },
    description: "Get All doubts",
    accepts: [
    ],
    returns: { arg: "response", type: "json" }
  });
  Invraiserequest.deleteraiserequest = function (data, cb) {
    var errorMessage = {};
    var successMessage = {};
    var insertObj = {};
    if (!data) {
      errorMessage.status = "201";
      errorMessage.message = "Bad Request";
      return cb(null, errorMessage);
    }
    insertObj.id = data.id;
    insertObj.status = '0';

    console.log(insertObj);  
    Invraiserequest.upsert(insertObj, (err, result) => {
      if (err) {
        errorMessage.status = '201';
        errorMessage.message = "Error Occurred";
        return cb(err, errorMessage);
      }
      successMessage.status = "200";
      successMessage.message = "Record Deleted Successfully.";
      successMessage.detail = result;
      return cb(null, successMessage);
    });

  };

  Invraiserequest.remoteMethod(
    'deleteraiserequest',
    {
      http: { path: '/deleteraiserequest', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  )
  Invraiserequest.getraiserequestdetail = function (id, cb) {
    Invraiserequest.findOne(
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

  Invraiserequest.remoteMethod("getraiserequestdetail", {
    http: { path: "/getraiserequestdetail", verb: "get" },
    description: "Get Row by Doubts Id",
    accepts: { arg: "id", type: "number", required: true },
    returns: { arg: "response", type: "json" }
  });
};
