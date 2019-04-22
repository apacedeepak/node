'use strict';

var constantval = require('./constant');
var request = require('request');
const md5 = require('md5');

module.exports = function(Lmsapi) {
    var errorMessage = {};
    var successMessage = {};
    var SALT = "EXTRAMARKS@123";
    var KEY = "Y654H6A7D695B0OI897656GF4";
    //var staticUrl = "http://schooltest.extramarks.com/school_lms/public/api/v1.0/";
    var staticUrl = constantval.LMS_API_URL;

  /*
   * Get Board list from lms
   */
  Lmsapi.boardlist = (cb) => {
    let productId = "75";
    var checksumString = SALT + ":" + productId;
    let checksum = md5(checksumString);
    let url = staticUrl + "getcustomboard/?apikey=" + KEY + "&checksum=" + checksum + "&product_id=" + productId;
    
    request(url, {
      json: true
    }, (err, res, body) => {
      if (err) {
        return cb(null, err);
      }
      return cb(null, body);
    });
  }

  Lmsapi.remoteMethod(
    'boardlist', {
      http: {
        path: '/boardlist',
        verb: 'get'
      },
      description: 'Board List',
      //accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );

  /* 
   * get class list by board id
   */
  Lmsapi.classlist = (req, cb) => {
    let boardId = req.board_id;
    let rackId = req.rack_id;

    var checksumString = SALT + ":" + boardId + ":" + rackId;
    let checksum = md5(checksumString);
    let url = staticUrl + "getcurriculum/?apikey=" + KEY + "&checksum=" + checksum + "&custom_board_id=" + boardId + "&rack_id=" + rackId;
    request(url, {
      json: true
    }, (err, res, body) => {
      if (err) {
        return cb(null, err);
      }
      return cb(null, body);
    });
  }

  Lmsapi.remoteMethod(
    'classlist', {
      http: {
        path: '/classlist',
        verb: 'post'
      },
      description: 'Class List',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );

  /*
   * Get Subject List
   */

  Lmsapi.getsubjectlist = (req, cb) => {
    let boardId = req.lms_board_id;
    let rackId = req.rack_id;

    var checksumString = SALT + ":" + boardId + ":" + rackId;
    let checksum = md5(checksumString);
    let url = staticUrl + "getcurriculum/?apikey=" + KEY + "&checksum=" + checksum + "&custom_board_id=" + boardId + "&rack_id=" + rackId;
    request(url, {
      json: true
    }, (err, res, body) => {
      if (err) {
        return cb(null, err);
      }
      return cb(null, body);
    });
  }

  Lmsapi.remoteMethod(
    'getsubjectlist', {
      http: {
        path: '/getsubjectlist',
        verb: 'post'
      },
      description: 'Get Subject List',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );

  /*
   * Get Subject List
   */

  Lmsapi.syllabusData = (req, cb) => {
    let subjectId = req.subject_id;
    let customBoardId = req.board_id;
    var checksumString = SALT + ":" + customBoardId + ":"+ subjectId;
    let checksum = md5(checksumString);
    let url = staticUrl + "getcurriculumtree/?apikey="+ KEY +"&checksum="+ checksum +"&custom_board_id=" + customBoardId + "&rack_id="+ subjectId;
    //let url = "http://10.1.17.217/school_lms/public/api/v1.0/getcurriculumtree/?apikey="+ KEY +"&checksum="+ checksum +"&custom_board_id=" + customBoardId + "&rack_id="+ subjectId;
    //let url = "http://10.1.17.217/school_lms/public/api/v1.0/getcurriculumtree/?apikey=Y654H6A7D695B0OI897656GF4&checksum=xxxxx&&custom_board_id=180&rack_id=89";
    request(url, {
      json: true
    }, (err, res, body) => {
      if (err) {
        return cb(null, err);
      }
      return cb(null, body);
    });
  }

  Lmsapi.remoteMethod(
    'syllabusData', {
      http: {
        path: '/syllabusData',
        verb: 'post'
      },
      description: 'Get Syllabus List',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );
};
