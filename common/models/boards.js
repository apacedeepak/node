'use strict';
module.exports = function (Boards) {
    Boards.updateall = function (data, cb) {
        // console.log(data)
        Boards.update(data, function (err, res) {
            if (err) {
                return cb(null, err);
            }
            return cb(null, res);
        });
    };
    Boards.remoteMethod(
        'updateall',
        {
            http: { path: '/updateall', verb: 'post' },
            description: 'updateall',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Boards.updateboard = function (data, cb) {

        var obj = {
            "board_name": data.board_name,
            "status": data.status
        }

        Boards.upsertWithWhere({ boardId: data.boardId }, obj, function (err, res) {
            if (err) {

                return cb(null, err);
            }

            return cb(null, res);
        });
    };
    Boards.remoteMethod(
        'updateboard',
        {
            http: { path: '/updateboard', verb: 'post' },
            description: 'updateboard',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Boards.insertdata = function (data, cb) {
        Boards.upsert(data, function (err, res) {
            if (err) {
                return cb(null, err);
            }
            return cb(null, res);
        });
    };
    Boards.remoteMethod(
        'insertdata',
        {
            http: { path: '/insertdata', verb: 'post' },
            description: 'insertdata',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


    Boards.getboardname = function (data, cb) {
        Boards.findOne({
            where: { boardId: data.boardId },


        }, function (err, result) {
            if (err) {

                return cb(null, err);
            } else {

                return cb(null, result);
            }
        });

    };
    Boards.remoteMethod(
        'getboardname',
        {
            http: { path: '/getboardname', verb: 'post' },
            description: 'getboardname',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    Boards.getactiveboard = function (cb) {
        Boards.find({
            where: { status: "Active" },
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            } else {
                return cb(null, result);
            }
        });

    };
    Boards.remoteMethod(
        'getactiveboard',
        {
            http: { path: '/getactiveboard', verb: 'get' },
            description: 'Get All Active Board',
            //accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    Boards.getallboard = function (cb) {
        //let conditions = { where: { status: 'Active' } };
        Boards.find({
        }, function (err, result) {
            if (err) {
                return cb(null, err);
            } else {
                return cb(null, result);
            }
        });

    };
    Boards.remoteMethod(
        'getallboard',
        {
            http: { path: '/getallboard', verb: 'get' },
            description: 'Get All Active Board',
            returns: { arg: 'response', type: 'json' }
        }
    );

    Boards.assignunassigncourse = function (data, cb) {
        var tempBoardArray = data.postvalue;
        var dbBoardData = data.dbvalue;
        var errorMessage = {};
        var successMessage = {};
         
        tempBoardArray.forEach(element => {
            var params = {
              "boardId" : element.board_id,
              "board_name" :  element.board_name,
              "status" : "Active"
            };
            var updateParam = {"status":"Active"};
            Boards.update(updateParam, function(err, result){
                if (err) { return cb(null, err);}
                if( dbBoardData.includes(element.board_id)){
                    delete params.boardId;
                    Boards.upsertWithWhere({ boardId: element.board_id }, params, function (err, res) {
                        if (err) { return cb(null, err);}
                        
                        successMessage.status = 200;
                        successMessage.message = "Course Assigned/Unassigned Successfully.";
                        //return cb(null, successMessage);
                    });
                }else{
                    Boards.upsert(params, function (err, res) {
                        if (err) { return cb(null, err);}
                        successMessage.status = 200;
                        successMessage.message = "Course Assigned/Unassigned Successfully.";
                        //return cb(null, successMessage);
                    });
                }
            });
          });
          successMessage.message = "Course Assigned/Unassigned Successfully.";
        return cb(null, successMessage);
    }
    Boards.remoteMethod(
        'assignunassigncourse',
        {
            http: { path: '/assignunassigncourse', verb: 'post' },
            description: 'Assign Unassign Course',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
};
