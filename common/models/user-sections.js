'use strict';
var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe');
module.exports = function (Usersections) {
    Usersections.assignsection = function (data, cb) {
        Usersections.findOne({
            where: {userId: data.userId, sessionId: data.sessionId, sectionId: data.sectionId}
        }, function (err, res) {

            if(err){
                return cb(null,err);
            }

            if (!res) {
                Usersections.create(data, function (err, section) {
                    if (err) {
                     return    cb(null, err);
                    } else {
                       return  cb(null, section);
                    }
                });
            }else {
                data['id'] = res.id;
                if(res.class_teacher == "No" && data.class_teacher == 'Yes'){
                    Usersections.upsert(data, function (err, section) {
                        if (err) {
                         return    cb(null, err);
                        } else {
                           return  cb(null, section);
                        }
                    });
                } else{
                    return cb(null);
                }

            }
        })



    };


    Usersections.usersectionlist = function (cb) {
        Usersections.find(function (err, section) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, section);
            }
        });

    };
    Usersections.sectionusers = function (request, cb) {
        var sectionId = request.sectionId;
        var user_type = request.user_type;
        var sessionId = request.sessionId;

        Usersections.find(
                {
                    fields: "userId",
                    where: {sectionId: sectionId, user_type: user_type, sessionId: sessionId, status: "Active"}
                }
        , function (err, resp) {
            cb(null, resp)
        });

    };
    Usersections.usersectionsbyid = function (userId, cb) {
        Usersections.find({
            fields: [""],
            include:
                    {
                        relation: 'assigned_sections',
                        scope: {
                            fields: ["section_name", "class_name"],
                        },
                        relation: 'section_groups',

                    },
            where: {userId: userId}
        }, function (err, res) {
            if (err) {
                cb(null, err);
            } else {
                var resparr = [];

                res.forEach(function (assignedSection) {
                    // console.log(typeof assignedSection.assigned_sections);
                    assignedSection = assignedSection.toJSON();
                    // console.log(typeof assignedSection.assigned_sections);
                    // resp[key] = assignedSection.assigned_sections;

                    resparr.push(assignedSection.assigned_sections);
                });
                cb(null, resparr);
            }
        });

    };

    Usersections.remoteMethod(
            'assignsection',
            {
                http: {path: '/assignsection', verb: 'post'},
                description: 'Assign Usersections',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Usersections.remoteMethod(
            'sectionusers',
            {
                http: {path: '/sectionusers', verb: 'post'},
                description: 'Get Users',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Usersections.remoteMethod(
            'usersectionlist',
            {
                http: {path: '/usersectionlist', verb: 'post'},
                description: 'Usersections list',
                returns: {arg: 'response', type: 'json'}
            }
    );
    Usersections.remoteMethod(
            'usersectionsbyid',
            {
                http: {path: '/usersectionsbyid', verb: 'get'},
                description: 'Usersections list by user',
                accepts: [{arg: 'user_id', type: 'string'}],
                returns: {arg: 'response', type: 'json'}
            }
    );



    Usersections.usersbysection = function (data, cb) {
        var sectionId = data.section_id;
        var userType = data.user_type;
        var sessionId = data.session_id;
        var status = data.status;
        var deviceType = data.device_type;

        var message = {};
        if (!sectionId) {
            message.status = '201';
            message.message = "section_id cannot blank";
            return cb(null, message);
        }
        if (!userType) {
            message.status = '201';
            message.message = "user_type cannot blank";
            return cb(null, message);
        }
        if (!sessionId) {
            message.status = '201';
            message.message = "session_id cannot blank";
            return cb(null, message);
        }

        var wherecond = {};
        if(deviceType == 'M'){
            wherecond = {user_login_mobileapp:status,status:'Active'};
        }else if(deviceType == 'E'){
            wherecond = {user_login_erp:status};
        }
        var userRelations = {};

        if (userType == 'Student') {
            userRelations.include = {
                                relation: "students"
                            };
        }else if(userType == 'Teacher'){
            userRelations.include = {
                                relation: "staff"
                            };
        }else if(userType == 'Parent'){
            userType = "Student";
            userRelations.include = {
                                relation: "students",
                                where:{status:'Active'},
                                scope: {
                                    fields: ["parentId","name", "admission_no"],
                                    include:{
                                        relation :"studentbelongtoparent",
                                        scope :{
                                            include :{
                                                relation : "parentidbyuser",
                                                scope:{
                                                    where : wherecond
                                                }
                                            }
                                        }
                                    }
                                }
                            };

            if(deviceType == 'M'){
                wherecond = {user_login_mobileapp:undefined,status:'Active'};
            }else if(deviceType == 'E'){
                wherecond = {user_login_erp:undefined};
            }
        }
        Usersections.find({
            fields: ['userId'],
            include:
                    {
                        relation: "assigned_users",
                        scope: {
                            //fields: ['user_name'],
                            where : wherecond,
                            include: userRelations.include
                        }

                    },
            where: {sectionId: sectionId, sessionId: sessionId, user_type: userType}

        }, function (err, section) {

            if (err) {
                message.status = '201';
                message.message = "Fail";
                cb(null, message, message);
            } else {

                message.status = '200';
                message.message = "success";
                //message.data = section;
                cb(null, message, section);

            }
        });

    };

    Usersections.remoteMethod(
            'usersbysection',
            {
                http: {path: '/usersbysection', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
            }
    );

    Usersections.sectionbysectionid = function (data, cb) {

        var sectionIdArr = [];


        if(data.flag){
            sectionIdArr = data.section_id;
        }else{
            sectionIdArr.push(data.section_id);
        }


        Usersections.find({
            where: {"sectionId": {inq: sectionIdArr}, "user_type": data.user_type, "sessionId": data.session_id, schoolId: data.school_id},
            include: {
                relation: "users",
                scope: {
                    where:{status: 'Active'},
                    include: {
                        relation: "students",
                        scope: {
                            include: {
                                relation: "studentbelongtoparent"
                            }
                        }
                    }
                }
            }
        }, function (err, result) {
            if (err) {
                cb(null, err)
            }

            cb(null, result);
        });
    }

    Usersections.sectionbyuserid = function (data, cb) {
        Usersections.find({
            where: {"userId": data.user_id, "status":"Active"},
            groupby: 'sectionId',

        }, function (err, result) {
            if (err) {
                cb(null, err)
            }
            cb(null, result);
        });
    }

    Usersections.getsectionbyuserid = function (data, cb) {
        Usersections.find({
            where: {"userId": data.user_id, sectionId: data.section_id, sessionId: data.session_id, status: "Active", schoolId: data.school_id},
            include: {
                relation: "assigned_sections",
                scope: {},
                where: {schoolId: data.school_id},
            }
        }, function (err, result) {

            let res = [];
            if (err) {
                cb(null, err)
            }
            if (result.length == 0) {
                return cb(null, res);
            } else {
                for (let key in result) {
                    if( result[key].assigned_sections()){
                    res.push({
                        section_name: result[key].assigned_sections().section_name,
                        section_id: result[key].assigned_sections().id,
                        class_teacher: result[key].class_teacher,
                        section: result[key].assigned_sections().section,
                        class_name: result[key].assigned_sections().class_name,
                        roll_no: result[key].roll_no,
                        class_id:result[key].assigned_sections().classId,
                        boardId:result[key].boardId,
                        emscc_class_id:result[key].emscc_class_id
                    });}
                }

                cb(null, res);
            }
        });
    }

    Usersections.usersbysectionid = function (data, cb) {
        var sectionId = data.section_id;
        var message = {};


        Usersections.find({
            //fields: 'id',
            where: {sectionId: sectionId},
        }, function (err, section) {
            if (err) {
                message.status = '201';
                message.message = "Fail";
                cb(null, message);
            } else {
                message.status = '200';
                message.message = "success";
                cb(null, section);
            }
        });

    };
    Usersections.getStudentRollNo = function (userid, sessionid, sectionid)
    {
        return new Promise(function (resolve, reject) {
            Usersections.find({
                fields: ['roll_no'],
                where: {userId: userid, sessionId: sessionid, sectionId: sectionid, status: 'Active'},
            }, function (err, rolldata) {
                resolve(rolldata);
            })
        });
    }
    Usersections.remoteMethod(
            'usersbysectionid',
            {
                http: {path: '/usersbysectionid', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Usersections.remoteMethod(
            'sectionbyuserid',
            {
                http: {path: '/sectionbyuserid', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Usersections.remoteMethod(
            'sectionbysectionid',
            {
                http: {path: '/sectionbysectionid', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Usersections.remoteMethod(
            'getsectionbyuserid',
            {
                http: {path: '/getsectionbyuserid', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Usersections.getsectionteachers = (data, cb)=>{

        var sectionIdArr = [];


        if(data.flag){
            sectionIdArr = data.section_id;
        }else{
            sectionIdArr.push(data.section_id);
        }

      Usersections.find({
        where: {sectionId: {inq:sectionIdArr}, user_type: data.user_type, schoolId: data.school_id, status: 'Active'},
        include:{
          relation: "assigned_users",
          scope:{
            include:{relation:"staff"}
          }
        }
      },(err, res)=>{

        const staffArr = [];
        for(let key in res){
           if(res[key].assigned_users() != null) {
           if(res[key].assigned_users().staff()){
            staffArr.push({
              name: res[key].assigned_users().staff().name,
              user_id: res[key].userId,
              class_teacher: res[key].class_teacher
            });
            } }
        }
          cb(null, staffArr);
      });
    };

    Usersections.remoteMethod(
            'getsectionteachers',
            {
                http: {path: '/getsectionteachers', verb: 'post'},
                description: 'Section list',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Usersections.updatedata = (data, cb) => {
        var updateRequest = {"roll_no": data.roll_no};
        Usersections.updateAll({userId: data.user_id}, updateRequest, function (err, result) {
            if (err) {
                return err;
            } else {
                cb(null, result);
            }
        });
    };

    Usersections.remoteMethod(
            'updatedata',
            {
                http: {path: '/updatedata', verb: 'post'},
                description: 'Update Data',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );


    Usersections.studentlistbysection = (data, cb) => {
        let sectionId = data.section_id;
        let sessionId = data.session_id;
        let schoolId = data.school_id;

        let message = {}, response = [];
        if (!sectionId) {
            message.status = '201';
            message.message = "Section id cannot be blank";
            return cb(null, message);
        }
        else if (!sessionId) {
            message.status = '201';
            message.message = "Session_id cannot be blank";
            return cb(null, message);
        }
        else if(!schoolId){
            message.status = '201';
            message.message = "School id cannot be blank";
            return cb(null, message);
        }

        Usersections.find({
            fields: "userId",
            where: {user_type: "Student"},
            include:
                    {
                        relation: "assigned_users",
                        scope: {
                            fields: "",
                            include: {
                                relation: "students",
                                scope: {
                                    fields: ["name", "admission_no"]
                                }
                            }
                        }
                    },
            where: { sectionId: sectionId, sessionId: sessionId, schoolId: schoolId, user_type: "Student", status: "Active" }
        }, (err, section) => {
            if (err) {
                message.status = '201';
                message.message = "Fail";
                cb(null, message);
            } else {
                message.status = '200';
                message.message = "success";

                section.forEach((obj)=>{
                    response.push({
                            "user_id": obj.userId,
                            "student_name": obj.assigned_users().students().name
                        });
                })
                cb(null, message, response);
            }
        });
    };

    Usersections.promotionorfail = (data, cb) => {
        let olduserid = [];
        let sectionid = [];
        let sectionname = [];
        let old_session_id = '';
        var new_session_id = '';
        for(let key in data)
            {
                olduserid.push(data[key].userId);
                sectionid.push(data[key].sectionId);
                sectionname.push(data[key].section_name);
                old_session_id = data[key].sessionId;

            }
            if(olduserid.length>0)
                {
                 var User =Usersections.app.models.user;
                 User.find(
                     {
                         where : {old_user_id:{inq:olduserid}}
                     },function(err,response)
                        {
                           var Session =Usersections.app.models.session;
                             Session.findOne({
                                            where: {session_id:old_session_id}
                                        }, function (err, res) {
                                            if(err){
                                            cb(null,err);
                                            }
                                            new_session_id = res.id;
                                            var Section =Usersections.app.models.section;
                                            Section.find(
                                                {
                                                    where : {section_name:{inq:sectionname}}
                                                },function(err,secidlist)
                                                    {
                                                        if(err)
                                                        cb(null,err);

                            var counter = 0;
                            var promise = [];
                            for(let key in data)
                            {
                                data[key].userId = response[counter].id;
                                data[key].sessionId = new_session_id;
                                data[key].sectionId = secidlist[counter].id;
                                promise.push(Usersections.insertusersection(data[key]));
                                promise.push(Usersections.insertusersubject(data[key]));
                                counter++;
                            }
                            Promise.all(promise).then(function(result){


                            })

                        }
                 )
                     })
                                        });
                }
    }

    Usersections.insertusersection = (data) => {
        return new Promise(function(resolve,reject){
             Usersections.upsert(data,function(err,response){
                 if(err) reject('error');
                 else resolve('success');

        })

        })

    }
     Usersections.insertusersubject = (data) => {
        return new Promise(function(resolve,reject){
            var ClassSubject = Usersections.app.models.class_subject;
            var UserSubject = Usersections.app.models.user_subject;
            ClassSubject.find(
                {
                    where : {sectionId:data.sectionId,subject_type:'Main'}},function(err,responsedata)
                    {
                        if(err) reject('error');
                        else if(responsedata.length>0)
                            {
                                for(let j in responsedata)
                                    {
                                        let insertdata = {
                                            subjectId : responsedata[j].subjectId,
                                            class_subjectId : responsedata[j].id,
                                            userId : data.userId,
                                            user_type : 'Student',
                                            sessionId : data.sessionId,
                                            sectionId : data.sectionId,
                                            schoolId : data.schoolId,
                                            status : 'Active',
                                            created_date : dateFormat(Date(), "yyyy-mm-dd HH:MM:ss")
                                        }
                                        UserSubject.upsert(insertdata,function(err,finalresult){
                                            if(err) reject('error');
                                            else resolve(finalresult)

                                        })
                                    }
                            }
                                else{
                                    resolve('success');
                                }

                }
            )


        })

    }

    Usersections.remoteMethod(
            'studentlistbysection',
            {
                http: {path: '/studentlistbysection', verb: 'post'},
                description: 'Student list by class section',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
            }
    );
         Usersections.remoteMethod(
            'promotionorfail',
            {
                http: {path: '/promotionorfail', verb: 'post'},
                description: 'Add Student promotion or fail',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
            }
    );

    Usersections.getteacherid = (data, cb) => {
        var msg = {};
        if(!data){
            msg.status = "201";
            msg.message = "invalid data";
            cb(null, msg);
            return;
        }
        else if(!data.school_id){
            msg.status = "201";
            msg.message = "School id cannot be blank";
            cb(null, msg);
            return;
        }
        else if(!data.session_id){
            msg.status = "201";
            msg.message = "session id cannot be blank";
            cb(null, msg);
            return;
        }
        else if(!data.section_id){
            msg.status = "201";
            msg.message = "Section id cannot be blank";
            cb(null, msg);
            return;
        }

        Usersections.findOne({
            where : {
                        schoolId: data.school_id,
                        sessionId: data.session_id,
                        sectionId: data.section_id,
                      //  class_teacher: "Yes",
                        status: "Active",
                        user_type: "Teacher"
                    }
            },(err, res) => {
                if(err) throw(err);
                if(res){
                    return cb(null, "200", res);
                }
        })

    }

    Usersections.remoteMethod("getteacherid",
        {
            http: {path: '/getteacherid', verb: 'post'},
            description: 'Get class teacher Id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
        }
    )

   Usersections.getsectionid = (data, cb) => {
        let msg = {};
        if(!data){
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
            return;
        }
        else if(!data.user_id){
            msg.status = "201";
            msg.message = "User Id cannot be blank";
            cb(null, msg);
            return;
        }
        else if(!data.school_id){
            msg.status = "201";
            msg.message = "School Id cannot be blank";
            cb(null, msg);
            return;
        }
        else if(!data.session_id){
            msg.status = "201";
            msg.message = "Session Id cannot be blank";
            cb(null, msg);
            return;
        }

        Usersections.findOne({
            fields: "sectionId",
            where : {
                schoolId: data.school_id,
                sessionId: data.session_id,
                userId: data.user_id,
                status: "Active",
                user_type: "Student"
            }
        },(err, res) => {
            if(err) throw(err);
            if(res){
                return cb(null, "200", res);
            }
        })
   }

   Usersections.remoteMethod("getsectionid",
                    {
                        http: {path: '/getsectionid', verb: 'post'},
                        description: 'Get section Id',
                        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                        returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
                    }
                )


    Usersections.getsectionid = (data, cb) => {
        let msg = {};
        if(!data){
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
            return;
        }
        else if(!data.user_id){
            msg.status = "201";
            msg.message = "User Id cannot be blank";
            cb(null, msg);
            return;
        }
        else if(!data.school_id){
            msg.status = "201";
            msg.message = "School Id cannot be blank";
            cb(null, msg);
            return;
        }
        else if(!data.session_id){
            msg.status = "201";
            msg.message = "Session Id cannot be blank";
            cb(null, msg);
            return;
        }

        Usersections.findOne({
            fields: "sectionId",
            where : {
                schoolId: data.school_id,
                sessionId: data.session_id,
                userId: data.user_id,
                status: "Active",
                user_type: "Student"
            }
        },(err, res) => {
            if(err) throw(err);
            if(res){
                return cb(null, "200", res);
            }
        })
   }

   Usersections.remoteMethod("getsectionid",
                    {
                        http: {path: '/getsectionid', verb: 'post'},
                        description: 'Get section Id',
                        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                        returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
                    }
                )

    Usersections.checkclassteacher = (data, cb) => {
        let msg = {};
        if(!data){
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }else if(!data.user_id){
            msg.status = "201";
            msg.message = "User id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.section_id){
            msg.status = "201";
            msg.message = "Section id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.session_id){
            msg.status = "201";
            msg.message = "Session id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.school_id){
            msg.status = "201";
            msg.message = "School id cannot be blank";
            return cb(null, msg);
        }

        Usersections.findOne({
         fields: "class_teacher",
         where: {userId: data.user_id, sectionId: data.section_id, sessionId: data.session_id, schoolId: data.school_id}
        }, (err, res) => {
            if(err) throw err;
            if(res){
                msg.status = "200";
                msg.message = "Information fetched successfully";
                return cb(null, msg, res);
            }
        })
    }

    Usersections.remoteMethod("checkclassteacher",
        {
            http: {path: '/checkclassteacher', verb: 'post'},
            description: 'Check class teacher',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
        }
    )

    Usersections.usercount = (data, cb) => {
        let msg = {};
        if(!data){
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }else if(!data.session_id){
            msg.status = "201";
            msg.message = "User id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.user_type){
            msg.status = "201";
            msg.message = "User type cannot be blank";
            return cb(null, msg);
        }

        Usersections.find({
         fields: "userId",
         where: {sessionId: data.session_id, user_type: data.user_type, status: 'Active'}
        }, (err, res) => {
            if(err) throw err;
            if(res){
                msg.status = "200";
                msg.message = "Information fetched successfully";
                let respnse =  Dedupe(res, ['userId']);
                return cb(null, msg, {count: respnse.length});
            }
        })
    }

    Usersections.sendalert = (data, cb) => {
        let msg = {};
        if(!data){
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }else if(!data.session_id){
            msg.status = "201";
            msg.message = "Session id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.section_id){
            msg.status = "201";
            msg.message = "Section id cannot be blank";
            return cb(null, msg);
        }
         else if(!data.school_id){
            msg.status = "201";
            msg.message = "School id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.type){
            msg.status = "201";
            msg.message = "Type cannot be blank";
            return cb(null, msg);
        }
        else if(!data.alerttype){
            msg.status = "201";
            msg.message = "Alert Type cannot be blank";
            return cb(null, msg);
        }
        var reqobj = {

            section_id:data.section_id,
            school_id:data.school_id,
            session_id:data.session_id
        }
        Usersections.studentlistbysection(reqobj,function(err,message,response){
            if(err)
                {
                  msg.status = "201";
                  msg.message = "Error Occurred";
                  return cb(null, msg);
                }
                if(response.length>0)
                    {
                     let notificationarr = [];
                     for(let key in response)
                        {
                        var notificationobj = {};
                        notificationobj.user_id = response[key].user_id;
                        notificationobj.module_key_id = '';
                        notificationobj.type = data.type;
                        notificationobj.title = data.alerttype;
                        notificationobj.notification_text = '';
                        notificationarr.push(notificationobj);
                        }
                    if(notificationarr.length>0)
                        {
                            var Notification = Usersections.app.models.notification;
                            Notification.sendnotification(notificationarr);
                            msg.status = "200";
                            msg.message = "Successfully sent";
                            return cb(null, msg);
                        }
                    }
                else
                    {
                        msg.status = "200";
                        msg.message = "No student found";
                        return cb(null, msg);
                    }

        })

    }

    Usersections.remoteMethod("usercount",
        {
            http: {path: '/usercount', verb: 'post'},
            description: 'Current session user count',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'string'}, {arg: 'response', type: 'string'}]
        }
    )
    Usersections.remoteMethod(
            'sendalert',
            {
                http: {path: '/sendalert', verb: 'post'},
                description: 'Send Alert to students',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    /*
     * Get User section
     */
    Usersections.usersectiondetail = function (request, cb) {
        var user_type = request.user_type;
        var sessionId = request.sessionId;
        var schoolId = request.schoolId;
        var userId = request.userId;

        Usersections.find(
        {
            where: {schoolId: schoolId, user_type: user_type, sessionId: sessionId, status: "Active", userId:userId}
        }, function (err, resp) {
            cb(null, resp)
        });
    };

    Usersections.remoteMethod(
            'usersectiondetail',
            {
                http: {path: '/usersectiondetail', verb: 'post'},
                description: 'Get Users',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Usersections.batchusercount = function (request, cb) {
        var sectionId = request.sectionId;
        var user_type = request.user_type;
        var sessionId = request.sessionId;

        Usersections.find(
                {
                    fields: "COUNT(userId) AS total_users",
                    where: {sectionId: sectionId, user_type: user_type, sessionId: sessionId, status: "Active"}
                }
        , function (err, resp) {
            cb(null, resp)
        });

    };
    Usersections.updatestatus = function (data, cb) {
        var param={
            "status":"Active"
        }
        var msg={};
        Usersections.upsertWithWhere({ userId: data.user_id }, param, function (err, updatedUser) {
                if(err)return err
                if(updatedUser){
                    msg.status="200"
                    msg.message="Updated"
                    cb(null,msg)
                }
            });

        };
        Usersections.remoteMethod(
            'updatestatus',
            {
                http: { path: '/updatestatus', verb: 'post' },
                description: 'updatestatus',
                accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
                returns: { arg: 'response_status', type: 'json' }
            }
        );
        Usersections.allteachersofrequestedbatch = function (data, cb) {
           var msg={};
            Usersections.find({
                where:{schoolId:data.schoolId,sectionId:data.sectionId,user_type:"Teacher"},
                include:{relation:"users",
                scope:{
                    include:{relation:"staff"}
                }        
            }
            },function(err,res){
                if(err){
                    msg.status="201";
                    msg.message="error occured";
                    cb(null,msg)
                }
                if(res){
                 cb(null,res)
                }
            })
    
            };
            Usersections.remoteMethod(
                'allteachersofrequestedbatch',
                {
                    http: { path: '/allteachersofrequestedbatch', verb: 'post' },
                    description: 'allteachersofrequestedbatch',
                    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
                    returns: { arg: 'response', type: 'json' }
                }
            );

            Usersections.updatebatchcoordinator = function (data, cb) {
                var msg={};
                 Usersections.find({
                     where:{schoolId:data.schoolId,sectionId:data.sectionId,user_type:"Teacher",class_teacher:"Yes"},
                 
                 },function(err,res){
                     if(err){
                        
                         msg.status="201";
                         msg.message="error occured";
                         cb(null,msg)
                     }
                     if(res.length>0){
                         if(data.userId==res[0].userId){
                        msg.status="202";
                        msg.message="This faculty is already a batch coordinator of this batch ";
                        cb(null,msg)    
                    }
                         else{
                            msg.status="202";
                            msg.message="Other faculty is already a batch coordinator of this batch ";
                            cb(null,msg)    
                         }
                      
                     }
                     if(res.length==0){
                         var update={
                             "class_teacher":"Yes"
                         }
                         Usersections.updateAll({userId:data.userId,sectionId:data.sectionId,schoolId:data.schoolId},update,function(errs,resp){
                             if(errs){
                          
                                msg.status="201";
                                msg.message="error occured";
                                cb(null,msg)
                             }
                             else{
                                msg.status="200";
                                msg.message="Batch Coodinator Assigned Successfully";
                                cb(null,msg)    
                             }
                         }) 
                     }
                 })
         
                 };
                 Usersections.remoteMethod(
                     'updatebatchcoordinator',
                     {
                         http: { path: '/updatebatchcoordinator', verb: 'post' },
                         description: 'updatebatchcoordinator',
                         accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
                         returns: { arg: 'response_status', type: 'json' }
                     }
                 );
};
