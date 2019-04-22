"use strict";
var request = require("request");
var constantval = require('./constant');

module.exports = function(Myhr) {
  var myhrUrl = constantval.MYHR_API_URL; 
  var staticUrl = myhrUrl+"/api/getfaculty/apiKey/NXQhp0p2wnY1Rc8aGKcGi0WNSV2XH6";

  Myhr.getfaculty = function(cb) {
    request(staticUrl, { json: true }, (err, res, body) => {
      if (err) {
        return cb(null, err);
      }
      return cb(null, body);
    });
  };

  Myhr.remoteMethod("getfaculty", {
    http: { path: "/getfaculty", verb: "post" },
    description: "Get All Active data by user id",
    //accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
    returns: { arg: "response", type: "json" }
  });

  Myhr.myhrlogin = function(req, cb) {
    request(req.url, { json: true }, (err, res, body) => {
      if (err) {
        cb(null, err);
      }
      cb(null, body);
    });
  };

  Myhr.remoteMethod("myhrlogin", {
    http: { path: "/myhrlogin", verb: "post" },
    description: "Get All Active data by user id",
    accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
    returns: { arg: "response", type: "json" }
  });

};
