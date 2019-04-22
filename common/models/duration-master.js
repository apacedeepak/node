"use strict";

/**
 * Add/Edit Duration
 * * */

module.exports = function (Durationmaster) {
  Durationmaster.addduration = function (data, cb) {
    var chkData = [];
    var resData = {};
    let condition = {
      where: {
        school_id: data.school_id,
        duration_name: data.duration_name
      }
    };
    let autoId = (data.id) ? data.id : 0;
    Durationmaster.find(condition, (err, chkData) => {
      //console.log(chkData);
      if (chkData.length > 0 && autoId==0) {
        resData.status = '201'
        resData.message = 'This Duration details already exist in this Center';
        resData.data = chkData;
        cb(null, resData);
      } else {
        Durationmaster.upsert(data, (err, result) => {
          if (err) {
            resData.status = '202'
            resData.message = 'Something went wrong'
            resData.data = err;
            cb(null, err);
          } else {
            resData.status = '200'
            resData.message = 'Duration saved succesfully';
            resData.data = result;
            cb(null, resData);
          }
        });
      }
    });


  };

  Durationmaster.remoteMethod("addduration", {
    http: {
      path: "/addduration",
      verb: "post"
    },
    description: "Add/Edit New Duration",
    accepts: {
      arg: "data",
      type: "object",
      http: {
        source: "body"
      }
    },
    returns: {
      arg: "response",
      type: "json"
    }
  });

  /**
   * Get Row By Duration Id
   * * */

  Durationmaster.getdurationrow = function (id, cb) {
    Durationmaster.findOne({
        where: {
          id: id
        }
      },
      function (err, res) {
        if (err) {
          cb(null, err);
        }
        cb(null, res);
      }
    );
  };

  Durationmaster.remoteMethod("getdurationrow", {
    http: {
      path: "/getdurationrow",
      verb: "get"
    },
    description: "Get Row by Duration Id",
    accepts: {
      arg: "id",
      type: "number",
      required: true
    },
    returns: {
      arg: "response",
      type: "json"
    }
  });

  /**
   * Delete Row By Duration Id
   * * */

  Durationmaster.deleteduration = function (data, cb) {
    var DurationId = data.id;
    Durationmaster.destroyAll({
      id: DurationId
    }, (err, result) => {
      if (result) return cb(null, "200", "Deleted successfully");
    });
  };

  Durationmaster.remoteMethod("deleteduration", {
    http: {
      path: "/deleteduration",
      verb: "get"
    },
    description: "Delete duration by Duration id",
    accepts: {
      arg: "data",
      type: "object",
      http: {
        source: "body"
      }
    },
    returns: [{
        arg: "responseCode",
        type: "json"
      },
      {
        arg: "responseMessage",
        type: "json"
      }
    ]
  });

  /*
   * Get All Active Duration
   */
  Durationmaster.getallduration = function (cb) {
    Durationmaster.find({
        where: {
          status: {
            between: [0, 1]
          }
        },
        order: "id DESC"
      },
      function (err, stdObj) {
        return cb(null, stdObj);
      }
    );
  };

  Durationmaster.remoteMethod("getallduration", {
    http: {
      path: "/getallduration",
      verb: "get"
    },
    description: "Get All duration",
    returns: {
      arg: "response",
      type: "json"
    }
  });


  /*
   * Get All Active Duration
   */
  Durationmaster.getalldurationschool = function (school_id, cb) {
    let where_cond = {};
    where_cond = {
      and: [{
          school_id: school_id
        },
        {
          status: 1
        }
      ]
    }
    Durationmaster.find({
        where: where_cond,
        order: "id DESC"
      },
      function (err, stdObj) {
        return cb(null, stdObj);
      }
    );
  };

  Durationmaster.remoteMethod("getalldurationschool", {
    http: {
      path: "/getalldurationschool",
      verb: "get"
    },
    description: "Get All duration school",
    accepts: {
      arg: "school_id",
      type: "number",
      required: true
    },
    returns: {
      arg: "response",
      type: "json"
    }
  });



};
