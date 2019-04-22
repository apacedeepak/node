'use strict';
var dateFormat = require('dateformat');
module.exports = function (Medical) {

    Medical.illness = function (req, cb) {
        var errorMessage = {};
        if (!req.userId) {
            errorMessage.status = "201";
            errorMessage.message = "User id can't blank";
            return cb(null, errorMessage);
        }

        if (!req.action) {
            errorMessage.status = "201";
            errorMessage.message = "Action can't blank";
            return cb(null, errorMessage);
        }
        if (req.action.toLowerCase() == 'delete') {
            if (!req.id) {
                errorMessage.status = "201";
                errorMessage.message = "Id can't blank";
                return cb(null, errorMessage);
            }
        }
        if (req.action.toLowerCase() == 'update') {
            if (!req.id) {
                errorMessage.status = "201";
                errorMessage.message = "Id can't blank";
                return cb(null, errorMessage);
            }
            if (!req.name) {
                errorMessage.status = "201";
                errorMessage.message = "Illness name can't blank";
                return cb(null, errorMessage);
            }
            if (!req.status) {
                errorMessage.status = "201";
                errorMessage.message = "Status can't blank";
                return cb(null, errorMessage);
            }
        }
        if (req.action.toLowerCase() == 'add') {
            if (!req.name) {
                errorMessage.status = "201";
                errorMessage.message = "Illness name can't blank";
                return cb(null, errorMessage);
            }
            if (!req.status) {
                errorMessage.status = "201";
                errorMessage.message = "Status can't blank";
                return cb(null, errorMessage);
            }
        }


        var successMessage = {};
        var actionType = req.action.toLowerCase();
        var illnessData = {};
        var illNessObj = Medical.app.models.illness;
        switch (actionType) {

            case 'add':
                illnessData.name = req.name;
                illnessData.status = req.status;
                illnessData.added_by = req.userId;
                illnessData.added_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                illNessObj.addillness(illnessData, function (err, response) {
                    return cb(null, response);

                })
                break;
            case 'update':
                illnessData.id = req.id;
                illnessData.name = req.name;
                illnessData.status = req.status;
                illnessData.modified_by = req.userId;
                illNessObj.updateillness(illnessData, function (err, response) {
                    return cb(null, response);

                })
                break;
            case 'list':

                illnessData.added_by = req.userId;
                illnessData.id = req.id;
                illNessObj.getillness(illnessData, function (err, response, responsedata) {
                    return cb(null, response, responsedata);

                })
                break;
            case 'delete':
                illnessData.id = req.id;
                illnessData.status = 2;
                illnessData.modified_by = req.userId;
                illNessObj.deleteillness(illnessData, function (err, response) {
                    return cb(null, response);

                })
                break;
        }
    }

    Medical.remoteMethod(
        'illness',
        {
            http: { path: '/illness', verb: 'post' },
            description: 'get Illness List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

};
