'use strict';
var constantval = require('./constant');
var request = require('request');
const md5 = require('md5');

module.exports = function(Iitjeereport) {
    var errorMessage = {};
    var successMessage = {};
    var SALT = "36384A9EA3";
    var KEY = "BEBB2FDD4A9A7205";
    var iitJeeUrl = "http://emscc.extramarks.com/school_lms/public/assessnew/apiVersion1";

    Iitjeereport.questionsubjectanalysis = (requestData, cb) => { 
        let url = iitJeeUrl+"/difficulty-wise-weekly-report";
        
        var checksumString = requestData.weeklytest_Id +':'+ requestData.user_id +':'+ requestData.student_type +':'+ requestData.type +':'+ requestData.paper_type +':'+ requestData.paper_id +':'+ requestData.subject_id +':'+ SALT +':'+ KEY;
        var checksumString = checksumString.toUpperCase();
        var checksum = md5(checksumString);
        requestData.checksum = checksum;
        
        request.post({
            headers: { 'content-type' : 'application/json'},
            url:     url,
            json:    requestData
            }, function(error, response, body){
                return cb(null, body);
            }
        );
    }

    Iitjeereport.remoteMethod(
        'questionsubjectanalysis',
        {
            http: {path: '/questionsubjectanalysis', verb: 'post'},
            description: 'Question Subject Wise Analysis',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response', type: 'json' }]
        }
    );

    /*
    * Weekly test over all performance report
    */
    Iitjeereport.performanceoverviewweekly = (requestData, cb) => { 
        let url = iitJeeUrl+"/overall-performance-analysis";

        var checksumString = requestData.user_id +':'+ requestData.student_type +':'+ requestData.board_id +':'+ requestData.type +':'+ requestData.paper_type +':'+ SALT +':'+ KEY;
        var checksumString = checksumString.toUpperCase();
        var checksum = md5(checksumString);
        requestData.checksum = checksum;

        request.post({
            headers: { 'content-type' : 'application/json'},
            url:     url,
            json:    requestData
            }, function(error, response, body){
                return cb(null, body);
            }
        );
    }

    Iitjeereport.remoteMethod(
        'performanceoverviewweekly',
        {
            http: {path: '/performanceoverviewweekly', verb: 'post'},
            description: 'Weekly Test Performance',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response', type: 'json' }]
        }
    );

    /*
    * Weekly test performance report
    */
    Iitjeereport.weeklytestperformance = (requestData, cb) => {
        let url = iitJeeUrl+"/weekly-report";

        var checksumString = requestData.weeklytest_Id +':'+ requestData.user_id +':'+ requestData.student_type +':'+ requestData.type +':'+ requestData.paper_type +':'+ SALT +':'+ KEY;
        var checksumString = checksumString.toUpperCase();
        var checksum = md5(checksumString);
        requestData.checksum = checksum;

        request.post({
            headers: { 'content-type' : 'application/json'},
            url: url,
            json: requestData
            }, function(error, response, body){
                return cb(null, body);
            }
        );
    }

    Iitjeereport.remoteMethod(
        'weeklytestperformance',
        {
            http: {path: '/weeklytestperformance', verb: 'post'},
            description: 'Weekly Test Performance',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response', type: 'json'}]
        }
    );


    /*
    * Subject Wise Weekly test report
    */
   Iitjeereport.subjectwiseweeklytestreport = (requestData, cb) => {
        let url = iitJeeUrl+"/subject-wise-weekly-report";

        var checksumString = requestData.weeklytest_Id +':'+ requestData.user_id +':'+ requestData.student_type +':'+ requestData.type +':'+ requestData.paper_type +':'+ SALT +':'+ KEY;
        var checksumString = checksumString.toUpperCase();
        var checksum = md5(checksumString);
        requestData.checksum = checksum;

        request.post({
            headers: { 'content-type' : 'application/json'},
            url: url,
            json: requestData
            }, function(error, response, body){
                return cb(null, body);
            }
        );
    }

    Iitjeereport.remoteMethod(
        'subjectwiseweeklytestreport',
        {
            http: {path: '/subjectwiseweeklytestreport', verb: 'post'},
            description: 'Weekly Test Performance',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response', type: 'json'}]
        }
);

};
