'use strict';

module.exports = function (Subject) {
    Subject.createsubject = function (data, cb) {
        Subject.upsert(data, function (err, response) {
            if (err) {
                var msg = '{"status":0,"message":"fail"}';
            } else {
                var msg = '{"status":1,"message":"success"}';
            }
            cb(null, msg);
        });
    }


    Subject.getsubjects = function (cb) {

        Subject.find(function (err, result) {
            if (err) {
                return  cb(null, err);
            }
            return  cb(null, result);
        });

    };

    Subject.remoteMethod(
            'createsubject',
            {
                http: {path: '/createsubject', verb: 'post'},
                description: 'Create Subject',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );
    Subject.remoteMethod(
            'getsubjects',
            {
                http: {path: '/getsubjects', verb: 'post'},
                description: 'Get notes',
                returns: {arg: 'response', type: 'array'}
            }
    );

    Subject.getsubjectbyname = function (data, cb) {

        Subject.find({
            fields: ["id"],
            where: {"subject_name": data.subject_name},
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });
    };

    Subject.remoteMethod(
            'getsubjectbyname',
            {
                http: {path: '/getsubjectbyname', verb: 'post'},
                description: 'Get section by section name',
                accepts: {arg: 'subject_name', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Subject.getschoolsubjects = function (schoolId, cb) {

        Subject.find({
            where: {"schoolId": schoolId},
        }, function (err, result) {
            if (err) {
                return  cb(null, err);
            }
            return  cb(null, result);
        });
    };

    Subject.remoteMethod(
        'getschoolsubjects',
        {
            http: {path: '/getschoolsubjects', verb: 'get'},
            description: 'Get notes',
            returns: {arg: 'response', type: 'array'}
        }
    );

    Subject.getsectionsubjects = function (req, cb) {

        Subject.findOne({
            where: {"schoolId": req.school_id,"subject_name":req.subject_name},
        }, function (err, result) {
            if (err) {
                return  cb(null, err);
            }
            return  cb(null, result);
        });
    };

    Subject.remoteMethod(
        'getsectionsubjects',
        {
            http: {path: '/getsectionsubjects', verb: 'post'},
            description: 'Get Section Subject',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'array'}
        }
    );

};
