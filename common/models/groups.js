'use strict';
var dateFormat = require('dateformat');
var arraySort = require('array-sort');
var Dedupe = require('array-dedupe')
module.exports = function (Groups) {
    Groups.creategroup = function (data, cb) {

        if (data.group_id) {
            var msg = {};
            var created_by = data.created_by;
            var userArr = data.user_ids;
            var group_id = data.group_id;
            var groupUsersObj = Groups.app.models.group_users;
             groupUsersObj.destroyAll({groupsId: group_id},function(err, res){
                 if(err)
                    {
                        msg.status = '201';
                        msg.message = "Error Occurred";
                        return cb(null, msg);
                    }
                     var req = {
                                id: data.group_id,
                                updated_date_time: dateFormat(Date(), "yyyy-mm-dd HH:MM:ss")
                            
                             };
                    Groups.upsert(req, function (err, result) {
                        if(err)
                    {
                        msg.status = '201';
                        msg.message = "Error Occurred";
                       return cb(null, msg);
                    }
                    })
                 userArr.forEach(function (user_id) {
                            var insertObj = {
                                userId: user_id,
                                groupsId: group_id,
                                created_by: created_by
                            };
                            groupUsersObj.upsert(insertObj, function (err, res) {
                                if(err)
                                {
                                    msg.status = '201';
                                    msg.message = "Error Occurred";
                                    cb(null, msg);
                                }
                            });
                        });
                        msg.status = '200';
                        msg.message = "Group updated successfully";
                        cb(null, msg);

              })

        }else{
        var req = {
            sectionId: data.section_id,
            subjectId: data.subject_id,
            schoolId: data.school_id,
            sessionId: data.session_id,
            group_name: data.group_name,
            user_type: data.user_type,
            created_date: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
            updated_date_time: dateFormat(Date(), "yyyy-mm-dd HH:MM:ss"),
            created_by: data.created_by
        };
        var msg = {};
        var userIdArr = data.user_id;

        var groupUsersObj = Groups.app.models.group_users;
          Groups.find({
            where:{group_name:data.group_name,sectionId:data.section_id,subjectId:data.subject_id}
          },
             function (err, reqst) {
                
                   if (err) {
                     return cb(null, err);
                     }else{
                         
                         var filter = reqst.find(function (obj) { 
                             if(obj.group_name === data.group_name && obj.status != 'Deleted'){
                                 return 1;
                             } 
                            
                            });
                     if((reqst.length != 0 && reqst[0].status != "Deleted") || (filter != 1 && filter != undefined)){
                        msg.status = '203';
                        msg.message = "Group name already exists";
                          cb(null, msg); 
                          return;
                         }else{
                               Groups.upsert(req, function (err, result) {
                                if (err) {
                                    return cb(null, err);
                                } else {
                                    userIdArr.forEach(function (userId) {
                                        var insertObj = {
                                            userId: userId,
                                            groupsId: result.id,
                                            created_by: data.created_by
                                        };
                                        groupUsersObj.upsert(insertObj, function (err, res) {
                                        });
                                    });
                                    msg.status = '200';
                                    msg.message = "Group created successfully";
                                    cb(null, msg);
                                    return;
            }
        });

                         }

                    }
        });


        }
    };

    Groups.grouplist = function (cb) {

        Groups.find(function (err, groupUsers) {
            if (err)
                throw (err);
            cb(null, groupUsers);
        });

    };

    Groups.removegroup = function (cb) {
        Groups.destroyAll(function (err, result) {
            if (err) {
                cb(null, err);
            }
            cb(null, result);
        })
    };

    Groups.refresh = function (cb) {
        Groups.find(function (err, result) {
            if (err) {
                cb(null, err);
            }
            cb(null, result);
        })
    };

    Groups.assignedgroups = function (data, cb) {
        
        var sectionId = data.section_id;
        var subjectId = data.subject_id;
        var sessionId = data.session_id;
        var token = data.token;
        var errorMessage = {};
        var successMessage = {};
        if (!sectionId) {
            errorMessage.status = '201';
            errorMessage.message = "Section cannot blank";
            cb(null, errorMessage);
            return;
        }
        if (!sessionId) {
            errorMessage.status = '201';
            errorMessage.message = "Session cannot blank";
            cb(null, errorMessage);
            return;
        }
        if (!subjectId) {
            errorMessage.status = '201';
            errorMessage.message = "Subject cannot blank";
            cb(null, errorMessage);
            return;
        }

        Groups.find(
            {
                fields: ['group_name', 'id'],
                where: { sectionId: sectionId, subjectId: subjectId, sessionId: sessionId,status:'Active', created_by: data.user_id },
            },
            function (err, resp) {

                successMessage.status = '200';
                successMessage.message = "message fetched successfully";
                var uniqueArray = Dedupe(resp, ['group_name'])
                successMessage.data = uniqueArray;
                cb(null, successMessage);

            })

    };


    Groups.assignedgroupbyid = function (data, cb) {
        if (!data) {
            errorMessage.status = '201';
            errorMessage.message = "Request cannot be blank";
            cb(null, errorMessage);
            return;
        }


        var groupId = data.group_id;
        var userType = data.user_type;
        var token = data.token;
        var errorMessage = {};
        var successMessage = {};

        if (!groupId) {
            errorMessage.status = '201';
            errorMessage.message = "Group id cannot be blank";
            cb(null, errorMessage);
            return;
        }
        if (!userType) {
            errorMessage.status = '201';
            errorMessage.message = "user type cannot be blank";
            cb(null, errorMessage);
            return;
        }

        Groups.findById(groupId,
            {
                include: {
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
                    where: { 'user_type': userType }
                },
            },
            function (err, resp) {

                if (err) {
                    errorMessage.status = '201';
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);
                    return;
                } else if (resp == null) {
                    errorMessage.status = '201';
                    errorMessage.message = "No member exist";
                    cb(null, errorMessage);
                    return;
                } else {
                    var responseArray = [];
                    var responseObj = {};

                    resp.have_users().forEach(function (data) {
                        data = data.toJSON();
                        responseObj = {};
                        responseObj.userId = data.students.userId;
                        responseObj.userName = data.students.name;
                        responseArray.push(responseObj);
                    })
                    cb(null, responseArray);
                }

            })

    };

    Groups.remoteMethod(
        'assignedgroupbyid',
        {
            http: { path: '/assignedgroupbyid', verb: 'post' },
            description: 'Assigned users',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );



    Groups.remoteMethod(
        'creategroup',
        {
            http: { path: '/creategroup', verb: 'post' },
            description: 'create group',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );
    Groups.remoteMethod(
        'grouplist',
        {
            http: { path: '/grouplist', verb: 'post' },
            description: 'Groups List',
            returns: { arg: 'response', type: 'json' }
        }
    );
    Groups.remoteMethod(
        'removegroup',
        {
            http: { path: '/removegroup', verb: 'post' },
            description: 'Remove Groups',
            returns: { arg: 'response', type: 'json' }
        }
    );
    Groups.remoteMethod(
        'assignedgroups',
        {
            http: { path: '/assignedgroups', verb: 'post' },
            description: 'Assigned group list',
            accepts: [{ arg: 'data', type: 'object', http: { source: 'body' } }],
            returns: { arg: 'response', type: 'json' }
        }
    );

    Groups.getgroupbyuserid = (data, cb) => {
        var errorMessage = {};
            if(!data.user_id)
                {
            errorMessage.status = '201';
            errorMessage.message = "User Id can't be blank";
            cb(null, errorMessage);
                }
            if(!data.school_id)
                {
            errorMessage.status = '201';
            errorMessage.message = "school Id can't be blank";
            cb(null, errorMessage);
                }
        Groups.find({
            where: { created_by: data.user_id, sectionId: data.section_id,schoolId:data.school_id },
            include: [{
                relation: 'group_users',
                scope: {
                },
            }, {
                relation: 'belgons_to_subject',
                scope: {
                    fields: ["subject_name"],
                }
            }, {
                relation: 'belgons_to_section',
                scpoe: {
                    fields: ["section_name"],
                }
            }],
        }, (err, detail) => { 
             if (err) {
                 return cb(null, err);
                }else{
                    var StaffModel = Groups.app.models.staff;
                    StaffModel.find({
                        where : {userId:data.user_id}
                    },function(err,staffdata){
                       
                   
            var responseArray = [];
            var responseObj = {};
            var successMessage = {};
            var groupSort = arraySort(detail, 'created_date', {reverse: true});
            groupSort.forEach(function (data) {
            if(data.status == 'Active'){ 
                responseObj = {};
                responseObj.group_name = data.group_name;
                responseObj.created_date = dateFormat(data.created_date, "yyyy-mm-dd");
                responseObj.created_on = dateFormat(data.created_date, "isoDateTime");
                responseObj.created_by = staffdata[0].name;
                responseObj.updated_date_time = dateFormat(data.updated_date_time, "yyyy-mm-dd");
                responseObj.updated_date_time_app = dateFormat(data.updated_date_time, "isoDateTime");
                responseObj.count = data.group_users().length;
                responseObj.groupId = data.group_users()[0].groupsId;
                responseObj.subject_name = data.belgons_to_subject().subject_name;
                responseObj.section_name = data.belgons_to_section().section_name;
                responseObj.subject_id = data.belgons_to_subject().id;
                responseObj.section_id = data.belgons_to_section().id;
                responseObj.class_id = data.belgons_to_section().classId;
                responseArray.push(responseObj);
               };
            })
                successMessage.status = '200';
                successMessage.message = "Group list fetched successfully";
                cb(null, successMessage,responseArray);
             })
        }
        });

    };
    Groups.remoteMethod(
        'getgroupbyuserid',
        {
            http: { path: '/getgroupbyuserid', verb: 'post' },
            description: 'get assign user to a group',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_message', type: 'json' },{ arg: 'response', type: 'json' }]
        }
    );

    Groups.groupidbydetail = (data, cb) => {
        if (!data) {
            errorMessage.status = '201';
            errorMessage.message = "Request cannot be blank";
            cb(null, errorMessage);
            return;
        }

        var groupId = data.group_id;
        var userType = data.user_type;
        var token = data.token;
        var errorMessage = {};
        var successMessage = {};

        if (!groupId) {
            errorMessage.status = '201';
            errorMessage.message = "Group id cannot be blank";
            cb(null, errorMessage);
            return;
        }
        if (!userType) {
            errorMessage.status = '201';
            errorMessage.message = "user type cannot be blank";
            cb(null, errorMessage);
            return;
        }
        var responseArray = [];

        Groups.findById(groupId,
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
                    where: { 'user_type': userType }
                },{
                relation: 'group_users',
                scope: {
                },
                },{
                relation: 'belgons_to_subject',
                scope: {
                    fields: ["subject_name"],
                }
                }, {
                relation: 'belgons_to_section',
                scpoe: {
                    fields: ["section_name"],
                }
            }
        ],
            },
            function (err, resp) {
                if (err) {
                    errorMessage.status = '201';
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);
                    return;
                } else if (resp == null) {
                    errorMessage.status = '201';
                    errorMessage.message = "No member exist";
                    cb(null, errorMessage);
                    //return;
                } else {
                    var responseObj = {};
                    responseObj.sectionId = resp.sectionId;
                    responseObj.subjectId = resp.subjectId;
                    responseObj.sessionId = resp.sessionId;
                    var GroupUser = Groups.app.models.user_subject;
                    var sendobj = { 'section_id': responseObj.sectionId, 'session_id': responseObj.sessionId, 'subject_id': responseObj.subjectId, 'user_type': 'Student' }

                    GroupUser.subjectwiseusers(sendobj, function (err, message, userdata) {
                        if (err) {
                            Groups.errMessage(cb);
                        }
                        else {
                            var chkflag = false;
                            userdata.forEach(function (data) {

                                resp.have_users().forEach(function (selectedata) {
                                    selectedata = selectedata.toJSON();
                                    var chkflag = false;
                                    if (data.user_id == selectedata.students.userId) {
                                        data.chkflag = true;
                                    }
                                })
                                responseArray.push(data);
                            });
                            var respo = {};
                            respo.status = '200';
                            respo.message = "Group detail fetched successfully";
                            respo.groupdata = {groupname:resp.group_name,updated_date_time:dateFormat(resp.updated_date_time,"yyyy-mm-dd HH:MM:ss"),updated_date_time_app:dateFormat(resp.updated_date_time,"isoDateTime"),groupid:resp.id};
                            respo.belgons_to_subject = resp.belgons_to_subject();
                            respo.belgons_to_section = resp.belgons_to_section();
                            respo.data = responseArray;
                            
                            cb(null, respo);
                        }
                    });
                }

            })
    };

    Groups.remoteMethod(
        'groupidbydetail',
        {
            http: { path: '/groupidbydetail', verb: 'post' },
            description: 'get group id to a group detail',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


 Groups.groupdeletebyid = function (data, cb) {
        if (data.group_id) {
            var msg = {};
            var group_id = data.group_id;
            var groupUsersObj = Groups.app.models.group_users;
            var param = {};
            param.status = 'Deleted';
                   Groups.updateAll( {id: group_id}, param, function (err, res) {
                       
                       if(err)
                            {
                                msg.status = '201';
                                msg.message = "Error Occurred";
                                return cb(null, msg);
                            }
                       
                   groupUsersObj.updateAll( {groupsId: group_id}, param, function (err, res) {
                      if(err)
                            {
                                msg.status = '201';
                                msg.message = "Error Occurred";
                                cb(null, msg);
                            }
                        msg.status = '200';
                        msg.message = "Group deleted successfully";
                        cb(null, msg);
              });
              });
        }
    };

     Groups.remoteMethod(
        'groupdeletebyid',
        {
            http: { path: '/groupdeletebyid', verb: 'post' },
            description: 'group id to a group delete',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { arg: 'response', type: 'json' }
        }
    );


};
