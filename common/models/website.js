'use strict';
var constantval = require('./constant');
var request = require('request');

module.exports = function(Website) {
    var errorMessage = {};
    var successMessage = {};
    const md5 = require('md5');
    Website.websiteloginapi = (req, cb) => { 
        Website.createuserchecksum(req, (err, data) => {
            if(err){ cb(null, err);}
            cb(null, data);
        });
    };

    Website.remoteMethod(
        'websiteloginapi', 
        {
          http: { path: '/websiteloginapi', verb: 'post' },
          description: 'Website Login API',
          accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
          returns: [{ arg: 'response', type: 'json' }]
        }
    );

    Website.createuserchecksum = async (requestData, cb) => {
        let userObj = Website.app.models.user;
        var webPath = requestData.path;

        userObj.findOne({
            where: { user_name: requestData.username},
        }, function (err, resultArr) {
            if(resultArr != null)
            {
                var userType = resultArr.user_type;   
                var userId = resultArr.id;

                let param = {
                    requestData : requestData,
                    userId : userId,
                    webPath : webPath
                }
                if(userType == 'Student'){
                    Website.studentTypeData(param, (err, data) => {
                        cb(null, data);
                    });
                }else if(userType == 'Parent'){
                    Website.parentTypeData(param, (err, data) => {
                        cb(null, data);
                    });
                }else{
                    Website.staffTypeData(param, (err, data) => {
                        cb(null, data);
                    });
                }
            }
        });
    };

    Website.studentTypeData =  async (requestArr, cb) => {
        var requestData = requestArr.requestData;
        var userId = requestArr.userId;
        var webPath = requestArr.webPath;

        let studentObj = Website.app.models.student;
        let sectionObj = Website.app.models.section;

        studentObj.getstudentbyuserid({ "user_id": userId }, function (err, studentArr) {
            var studentData = studentArr.student;
            var userSections = studentData.students().user_have_section();
            let sectionId = userSections.sectionId;
            let schoolId = userSections.schoolId;
            let sessionId = userSections.sessionId;
            
            let param = {
                sectionId : sectionId,
                schoolId : schoolId,
                sessionId : sessionId
            }
            var lmsClassId;
            var lmsBoardId;
            sectionObj.getassignedlmsboardclass(param, function (err, dataArr) {
                var lmsClassId = dataArr.section_class().classId;
                var lmsBoardId = dataArr.section_board().boardId;
                
                let gender = studentData.gender.charAt(0).toUpperCase() + studentData.gender.slice(1)
                let webChecsum = md5('erp' + ':' + '' + ':' + requestData.password + ':' + studentData.name + ':' + gender + ':' + 'erp' + ':' + requestData.username + ':' + requestData.web_api_key + ':' + requestData.web_api_salt);
                let postjson = {
                    action: "erp",
                    login_details: {
                        email_address: '',
                        password: requestData.password,
                        mobile_nu: '',
                        name: studentData.name,
                        gender: gender,
                        source: 'erp',
                        unique_id: requestData.username,
                        board_id : lmsBoardId,
                        class_id : lmsClassId
                    },
                    api_details: {
                        apikey: requestData.web_api_key,
                        checksum: webChecsum
                    }
                }
                let jsonParam = {
                    postjson : postjson,
                    webPath : webPath,
                    userId : userId
                }
                Website.websiteLoginAPICall(jsonParam, (err, data) => {
                    cb(null, data);
                });
            });
        });
    }

    Website.parentTypeData = async (requestArr, cb) => {
        var requestData = requestArr.requestData;
        var userId = requestArr.userId;
        var webPath = requestArr.webPath;

        let parentObj = Website.app.models.parent;
        parentObj.getparentbyuserid({ "user_id": userId }, function (err, parentArr) {
            let parentData = parentArr.parent;
            let webChecsum = md5('erp' + ':' + '' + ':' + requestData.password + ':' + parentData.father_name + ':' + 'Male' + ':' + 'erp' + ':' + requestData.username + ':' + requestData.web_api_key + ':' + requestData.web_api_salt);
            let postjson = {
                action: "erp",
                login_details: {
                    email_address: '',
                    password: requestData.password,
                    mobile_nu: '',
                    name: parentData.father_name,
                    gender: 'Male',
                    source: 'erp',
                    unique_id: requestData.username                            
                },
                api_details: {
                    apikey: requestData.web_api_key,
                    checksum: webChecsum
                }
            }
            let jsonParam = {
                postjson : postjson,
                webPath : webPath,
                userId : userId
            }
            Website.websiteLoginAPICall(jsonParam, (err, data) => {
                cb(null, data);
            });
        });
    }

    Website.staffTypeData = async (requestArr, cb) => {
        var requestData = requestArr.requestData;
        var userId = requestArr.userId;
        var webPath = requestArr.webPath;

        let userObj = Website.app.models.user;
        userObj.getuserbyid(userId, function (err, staffArr) {
            var stafflist = staffArr.user_belongs_to_staff();
            let gender = stafflist.gender.charAt(0).toUpperCase() + stafflist.gender.slice(1)
            let webChecsum = md5('erp'+':'+''+':'+requestData.password+':'+stafflist.name+':'+gender+':'+'erp'+':'+requestData.username+':'+requestData.web_api_key+':'+requestData.web_api_salt);
            let postjson = {
                "action": "erp",
                "login_details": {
                    "email_address": '',
                    "password": requestData.password,
                    "mobile_nu": stafflist.mobile,
                    "name": stafflist.name,
                    "gender": gender,
                    "source": 'erp',
                    "unique_id": requestData.username
                },
                "api_details": {
                    "apikey": requestData.web_api_key,
                    "checksum": webChecsum
                }
            }

            let jsonParam = {
                postjson : postjson,
                webPath : webPath,
                userId : userId
            }
            Website.websiteLoginAPICall(jsonParam, (err, data) => {
                cb(null, data);
            });
        });
    };

    Website.websiteLoginAPICall = (jsonParam, cb) => {
        let userObj = Website.app.models.user;
        var postjson = jsonParam.postjson;
        var path = jsonParam.webPath;
        var userId = jsonParam.userId;
        
        var url = path + 'v1.1/tabletregistration';
        request.post({
            headers: { 'content-type': 'application/json' },
            url: url,
            json: postjson
        }, function (error, response, body) {
            if (error) {
                cb(null, 'Error while website Login');
            }else{
                var webUserId = body.content.user_id;
                var webSessionId = body.content.session_id;
                if(userId!="" && webUserId!=""){
                    var updateArr = {"website_user_id" : webUserId, "web_session_key": webSessionId};
                    userObj.updateAll({id: userId}, updateArr, function (err, userData) {
                        if(err) return err;
                        cb(null, body);
                    });
                }else{
                    cb(null, error);
                }
            }
        });                
    };

};
