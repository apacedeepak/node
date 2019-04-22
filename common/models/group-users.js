'use strict';
var dateFormat = require('dateformat');
module.exports = function (Groupusers) {
    Groupusers.assigngrouptouser = function (data, cb) {
        Groupusers.upsert(data, function (err, result) {
            if (err) {
                return cb(null, err);
            } else {
                return cb(null, result);
            }
        });

    };

    Groupusers.grouplist = function (cb) {

        Groupusers.find({ where: { status: 'Active' } }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            return cb(null, result);
        });

    };

    Groupusers.getusertogroup = (data, cb) => {
        Groupusers.find({ where: { groupsId: data.channelId } }, function (err, result) {
            if (err) {
                return cb(null, err);
            }
            return cb(null, result);
        });
    };


    Groupusers.removegroup = function (cb) {
        Groupusers.destroyAll(function (err, result) {
            if (err) {
                cb(null, err);
            }
            cb(null, result);
        })
    };
    Groupusers.groupusers = function (request, cb) {
        var groupId = request.groupId;
        var user_type = request.user_type;
        var sessionId = request.sessionId;
        var subjectId = request.subjectId;
        Groupusers.find(
            {
                fields: ["userId","groupsId"],
                where: { groupsId: { inq: groupId }, user_type: user_type, subjectId: subjectId, sessionId: sessionId, status: "Active" }
            }, function (err, res) {
                cb(null, res);
            });

    };

    Groupusers.getuseridbygroup = function (request, cb) {
        var userId = request.userId;
        var sessionId = request.sessionId;
        var errorMessage = {};
        var responseArray = [];
        if (!userId) {
            errorMessage.status = '201';
            errorMessage.message = "User id cannot blank";
            cb(null, errorMessage);
            return;
        }
        Groupusers.find(
            {
                include: {
                    relation: "group_users",
                    scope: {
                        fields:['id','group_name','created_date','updated_date_time'],
                        //where : {status: "Active"},
                    },
                    
                    
                },
                where: { userId: userId, status: "Active" },
                order :'id DESC',
            }, function (err, res) {
                
                var responseObj = {};
                var successMessage = {};
                var promise = [];
                res.forEach(function (data) {
                    
                    promise.push(Groupusers.getmemberdata(data.groupsId,data.created_by).then(responsedata=>{
                        //console.log(responsedata);console.log("**************************");
                     responseObj = {};
                     var temparr = [];
                     
                    responseObj.groupId = data.groupsId;
                    responseObj.id = data.id;
                    responseObj.created_by_id = data.created_by;
                    responseObj.status = data.status;
                    responseObj.group_name = data.group_users().group_name;
                    responseObj.created_date = dateFormat(data.group_users().created_date, "yyyy-mm-dd");
                    responseObj.created_by_name = responsedata[1];
                    responseObj.updated_date_time = dateFormat(data.group_users().updated_date_time, "yyyy-mm-dd HH:MM:ss");
                     
            
                    responsedata[0].forEach(studata=>{
                    var finaldata = {};
                    finaldata.name = studata.students().name;
                    finaldata.userId = studata.students().userId;
                    temparr.push(finaldata);
                    })
                      responseObj.member_list = temparr;
                     responseArray.push(responseObj);
                    }))
                    
                })
                Promise.all(promise).then(function(finalres){
                successMessage.status = '200';
                successMessage.message = "Group list fetched successfully";
                cb(null, successMessage, responseArray);
                })
               
            });
    };
    Groupusers.getmemberdata = function(groupid,userId)
    {
        var Groups = Groupusers.app.models.groups;
        return new Promise(function (resolve, reject) {
        Groups.findById(groupid,
            {
                include: [{
                    relation: "have_users",
                    scope: {
                        fields: ["user_name", "id"],
                        include: {
                            relation: "students",
                            scope: {
                                fields: ["name", "admission_no", "userId"]
                            }
                        }
                    },
                    //where: { 'user_type': userType }
                }
        ],
            },function(err,response)
        {  
           let totalstu = response.have_users();
           var temparr = [];
           var StaffModel = Groupusers.app.models.staff;
                    StaffModel.find({
                        where : {userId:userId}
                    },function(err,staffdata){
                        
                        temparr.push(totalstu);
                        temparr.push(staffdata[0].name);
                        resolve(temparr);
                    })
            
        })
        })
    }
    Groupusers.remoteMethod(
        'getuseridbygroup',
        {
            http: { path: '/getuseridbygroup', verb: 'post' },
            description: 'users by group',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_message', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

    Groupusers.remoteMethod(
        'assigngrouptouser',
        {
            http: { path: '/assigngrouptouser', verb: 'post' },
            description: 'create group',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );

    Groupusers.remoteMethod(
        'getusertogroup',
        {
            http: { path: '/getusertogroup', verb: 'post' },
            description: 'get assign user to a group',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Groupusers.remoteMethod(
        'groupusers',
        {
            http: { path: '/groupusers', verb: 'post' },
            description: 'Users list group wise',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }

        }
    );

    Groupusers.remoteMethod(
        'grouplist',
        {
            http: { path: '/grouplist', verb: 'post' },
            description: 'Group List',
            returns: { arg: 'response', type: 'json' }
        }
    );
    Groupusers.remoteMethod(
        'removegroup',
        {
            http: { path: '/removegroup', verb: 'post' },
            description: 'Group List',
            returns: { arg: 'response', type: 'json' }
        }
    );

};
