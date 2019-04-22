'use strict';
var dateFormat = require('dateformat');
module.exports = function (Invitemmaster) {
  Invitemmaster.additemmaster = function (ctx, options, cb) {
    var FileUpload = Invitemmaster.app.models.fileupload;
    var today = new Date();
    var errorMessage = {};
    var successMessage = {};
    var insertObj = {};
    FileUpload.fileupload(ctx, options, 'inventory_item_master', function (err, data) {console.log(data);
    if (data.id >0) {
       insertObj.id = data.id;
       insertObj.modified_date = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
       successMessage.message = "Record Updated Successfully.";
     } else {
       insertObj.created_date = dateFormat(today, "yyyy-mm-dd HH:MM:ss");
       successMessage.message = "Record Inserted Successfully.";
     } 
     var filepath = data.file_path[0];
     insertObj.inv_category_master_id = data.inv_category_master_id;
     insertObj.item_name = data.item_name;
     insertObj.unit_id = data.unit_id;        
     insertObj.price = data.price;
     insertObj.description = data.description;
     insertObj.status = 1;
     insertObj.item_image = filepath;
     insertObj.created_by = data.user_id;
    Invitemmaster.upsert(insertObj, (err, result) => {
      if (err) {
        errorMessage.status = '201';
        errorMessage.message = "Error Occurred";
        return cb(null, errorMessage);
      }
      successMessage.status = "200";
      successMessage.detail = result;
      return cb(null, successMessage);
    });
  });
  }
  Invitemmaster.remoteMethod(
    'additemmaster',
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
  );
  Invitemmaster.deleteitemmasterdata = function (data, cb) {
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
    Invitemmaster.upsert(insertObj, (err, result) => {
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

  Invitemmaster.remoteMethod(
    'deleteitemmasterdata',
    {
      http: { path: '/deleteitemmasterdata', verb: 'post' },
      description: 'Set the item master parameters',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'response', type: 'json' }
    }
  )
  
  Invitemmaster.getcategoryitem = function (data, cb) {
    let where_cond = {};
    where_cond.inv_category_master_id = data.item_category_id;
    where_cond.status = 1;
    Invitemmaster.find(
      {
        where: where_cond,
        order: "id DESC"
      },
      function (err, stdObj) {
        return cb(null, stdObj);
      }
    );
  };
  Invitemmaster.remoteMethod("getcategoryitem", {
    http: { path: '/getcategoryitem', verb: 'post' },
    description: 'Set the item master parameters',
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'response', type: 'json' }
  });

  
  Invitemmaster.getallitemmaster = function (userId, cb) {
    let where_cond = {};
    where_cond.status = 1;
    Invitemmaster.find(
      {
        where: where_cond,
        include: [
          {
            relation: "itemMasterUser",
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
            relation: "itemMasterUnit",
            scope: {
              fields: ["unit_name"]
            }
          }
        ],
        order: "id DESC"
      },
      function (err, stdObj) {
        return cb(null, stdObj);
      }
    );
  };
  Invitemmaster.remoteMethod("getallitemmaster", {
    http: { path: "/getallitemmaster", verb: "get" },
    description: "Get All doubts",
    accepts: [
      { arg: "userId", type: "number", required: true }
    ],
    returns: { arg: "response", type: "json" }
  });
  Invitemmaster.getitemmaster = function (id, cb) {
    Invitemmaster.findOne(
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

  Invitemmaster.remoteMethod("getitemmaster", {
    http: { path: "/getitemmaster", verb: "get" },
    description: "Get Row by Doubts Id",
    accepts: { arg: "id", type: "number", required: true },
    returns: { arg: "response", type: "json" }
  });
};
