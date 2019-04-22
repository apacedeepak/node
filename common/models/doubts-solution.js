"use strict";

module.exports = function(Doubtssolution) {
  /**
   * Add/Edit Duration
   * * */

  Doubtssolution.adddoubtsolution = function(data, cb) {
    Doubtssolution.upsert(data, (err, result) => {
      if (err) {
        cb(null, err);
      } else {
        cb(null, result);
      }
    });
  };

  Doubtssolution.remoteMethod("adddoubtsolution", {
    http: { path: "/adddoubtsolution", verb: "post" },
    description: "Add/Edit Doubtssolution",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  /**
   * Add/Edit Duration with file upload
   * * */

  Doubtssolution.addsolution = (ctx, options, cb) => {
    var FileUpload = Doubtssolution.app.models.fileupload;
    var errorMessage = {};
    var successMessage = {};
    var DoubtsArr = {};

    FileUpload.fileupload(ctx, options, "doubtsolution", function(err, data) {
      if (
        data.status != undefined &&
        (data.status == "201" || data.status == "000")
      ) {
        errorMessage.status = data.status;
        errorMessage.message = data.message;
        return cb(null, errorMessage);
      }

      // var c = new Class();
      // for (var m = 0; m < data.file_path.length; m++) {

      //     c.__addAttr__(m, "integer", data.file_path[m], "string");
      // }
      // var filepath = '';
      // if (data.file_path.length > 0){
      //     filepath = serialize(c, "array");
      // }

      var filepath = data.file_path[0];

      console.log(filepath + "****");

      if (data.userId != "") {
        DoubtsArr.userId = data.userId;
      }
      DoubtsArr.userId = data.userId;
      DoubtsArr.doubtsId = data.doubtsId;
      DoubtsArr.solution = data.solution;
      DoubtsArr.upload_file = filepath;
      DoubtsArr.schoolId = data.schoolId;
      DoubtsArr.sessionId = data.sessionId;
      Doubtssolution.upsert(DoubtsArr, function(err, result) {
        if (err) {
          return cb(null, err);
        }
        successMessage.status = "200";
        successMessage.message = "Record Submitted Successfully.";
        successMessage.detail = result;
        return cb(null, successMessage);
      });
    });
  };

  Doubtssolution.remoteMethod("addsolution", {
    description: "Add/Edit New Doubts Solution",
    accepts: [
      { arg: "ctx", type: "object", http: { source: "context" } },
      { arg: "options", type: "object", http: { source: "query" } }
    ],
    returns: {
      arg: "fileObject",
      type: "object",
      root: true
    },
    http: { verb: "post" }
  });

  /*****/

  /**
   * Get Solution Row By Doubts Id
   * * */

  Doubtssolution.getsolutionbydoubtrow = function(doubtsId, cb) {
    Doubtssolution.findOne(
      {
        where: {
          doubtsId: doubtsId
        }
      },
      function(err, res) {
        if (err) {
          cb(null, err);
        }
        cb(null, res);
      }
    );
  };

  Doubtssolution.remoteMethod("getsolutionbydoubtrow", {
    http: {
      path: "/getsolutionbydoubtrow",
      verb: "get"
    },
    description: "Get Solution Row by Doubts Id",
    accepts: { arg: "doubtsId", type: "number", required: true },
    returns: { arg: "response", type: "json" }
  });
};
