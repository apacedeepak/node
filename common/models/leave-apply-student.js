'use strict';
var dateFormat = require('dateformat');
var arraySort = require('array-sort');

module.exports = function(Leaveapplystudent) {
    Leaveapplystudent.markleave = function (data, cb) {
        var msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        } 
        
        if(!data.user_id){
            msg.status = "201";
            msg.message = "User id cannot be blank";
            return cb(null, msg);  
        }
        if(!data.school_id){
            msg.status = "201";
            msg.message = "school id cannot be blank";
            return cb(null, msg);  
        }
        if(!data.session_id){
            msg.status = "201";
            msg.message = "session id cannot be blank";
            return cb(null, msg);  
        }
        if(!data.from_date){
            msg.status = "201";
            msg.message = "From date cannot be blank";
            return cb(null, msg);  
        }
        if(!data.to_date){
            msg.status = "201";
            msg.message = "To date cannot be blank";
            return cb(null, msg);  
        }
        if(!data.reason){
            msg.status = "201";
            msg.message = "Reason cannot be blank";
            return cb(null, msg);  
        }
        if(!data.details){
            msg.status = "201";
            msg.message = "Details cannot be blank";
            return cb(null, msg);  
        }
        if(data.details == null || data.details == undefined){
            data.details = data.reason;
        }

        var params = {
                        "user_id": data.user_id,
                        "school_id": data.school_id,
                        "session_id": data.session_id,
                        "from_date": data.from_date,
                        "to_date": data.to_date,
                        "subject_id": 0
                    }

        Leaveapplystudent.checkattendexecute(params, cb).then( response => {
           
            msg.status = "201";
            msg.message = "Attendance already marked";
            if(response == "yes")
                return cb(null, msg);  
            
            let applyparam = {
                fromDate: data.from_date,
                toDate: data.to_date,
                user_id: data.user_id,
                session_id: data.session_id,
                id: data.leave_id
            }
            
            Leaveapplystudent.checkLeaveAlreadyApply(applyparam, (applyerr, applyresponse)=>{
                    
                    if(applyresponse.length > 0){
                        msg.status = "202";
                        msg.message = "Leave already applied in this date range";
                        
                        return cb(null, msg);  
                    }else{
         

                        let insertobj = {
                                            "userId": data.user_id,
                                            "schoolId": data.school_id,
                                            "sessionId": data.session_id,
                                            "fromDate": data.from_date,
                                            "toDate": data.to_date,
                                            "reason": data.reason,
                                            "detail": data.details,
                                            "addedBy": data.added_by,
                                            "addedDate": data.addedDate,
                                            "action": 1,
                                            "status": data.status
                                        };

                        if(data.id != null && data.id != undefined){
                            insertobj = {"id": data.id, "status": data.status};
                        }  
                        else if(data.leave_id){
                            insertobj = {
                                "id": data.leave_id,
                                "fromDate": data.from_date,
                                "toDate": data.to_date,
                                "reason": data.reason,
                                "detail": data.details,
                                "modefiedDate": data.modefiedDate,
                                "modifiedBy": data.modifiedBy
                            };
                        }     

                        Leaveapplystudent.upsert(insertobj, (err, response)=> {
                            if(err){
                                msg.status = '201';
                                msg.message = "Error Occurred";
                                return cb(null, msg);  
                            }
                            if(response){
                                msg.status = '200';
                                msg.message = "Leave applied successfully";
                                if(data.id || data.leave_id){
                                    msg.status = '200';
                                    msg.message = "Leave updated successfully"; 
                                }

                                let id = (data.leave_id) ? data.leave_id : response.id;

                                /* for getting teacher user id and sending notification */

                                let obj = {
                                    school_id: data.school_id, 
                                    session_id: data.session_id,
                                    user_id: data.user_id
                                }
                                Leaveapplystudent.getsectionid(obj).then( section_id => {
                                    let obj1 = {
                                        school_id: data.school_id, 
                                        session_id: data.session_id,
                                        section_id: section_id
                                    }
                                    Leaveapplystudent.getteacherid(obj1).then( teacher_id => {
                                        data['teacher_id'] = teacher_id;
                                        Leaveapplystudent.leavenotif(data, id);
                                    });

                                });
                                /* ends */

                                return cb(null, msg);
                            }

                        }); 
                    }
                });
    });
    }
    
    Leaveapplystudent.checkLeaveAlreadyApply = (data, cb)=>{
        let id = undefined;
        
        if(data.id){
            id = data.id;
        }
        
        Leaveapplystudent.find({
            where: {
                fromDate: { gte: dateFormat(data.fromDate, "isoDateTime") },
                toDate: { lte: dateFormat(data.toDate, "yyyy-mm-dd'T'23:59:59") },
                status: {nin: ['Deleted']},
                userId: data.user_id,
                sessionId: data.session_id,
                id: {nin: [id]},
            }
        },(err, resp)=>{
            return cb(null, resp);
        });
    }

    Leaveapplystudent.getsectionid = (data) => {
        return new Promise((resolve, reject) => {
            let Usersections = Leaveapplystudent.app.models.user_sections;
            Usersections.findOne({
                where : {
                    schoolId: data.school_id,
                    sessionId: data.session_id,
                    userId: data.user_id,
                    status: "Active",
                    user_type: "Student"
                }
            },(err, res) => {
                if(err) reject(err);
                if(res) {
                    resolve(res.sectionId);
                }
            })
        }).catch(err => console.log(err));
    }

    Leaveapplystudent.getteacherid = (data) => {
        return new Promise((resolve, reject) => {
            let Usersections = Leaveapplystudent.app.models.user_sections;
            Usersections.findOne({
                fields: "userId",
                where : {
                            schoolId: data.school_id,
                            sessionId: data.session_id,
                            sectionId: data.section_id,
                            class_teacher: "Yes",
                            status: "Active",
                            user_type: "Teacher"
                        }
                },(err, res) => {
                    if(err) reject(err);
                    if(res) resolve(res.userId);
            })
        }).catch(err => console.log(err));
    }

    Leaveapplystudent.remoteMethod(
        'markleave',
        {
            http: {path: '/markleave', verb: 'post'},
            description: 'Mark student leave',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Leaveapplystudent.leavenotif = (data, id) => {
        return new Promise ( (resolve, reject) => {
                var Notification = Leaveapplystudent.app.models.notification;
                var notificationobj = {};
                
                notificationobj.user_id = data.teacher_id;
                notificationobj.module_key_id = id;
                notificationobj.type = 6;
                notificationobj.title = "Leave Applied";
                notificationobj.notification_text = "Leave applied from " + data.from_date + " to " + data.to_date;
                notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");

                let notificationarr = [];
                notificationarr.push(notificationobj);
                
                Notification.pushnotification(notificationarr);
        }).catch( err => console.log(err));     
    }

    Leaveapplystudent.checkattendexecute = (params, cb) => {

        let student_subject_attendance = Leaveapplystudent.app.models.student_subject_attendance;
        return new Promise(  (resolve, reject) => {

            student_subject_attendance.checkattend(params, (err, res) => {
                if(err) reject("error");
                if(res) {
                    resolve(res.attend);
                }
            })

        }).catch(error => console.log(error))
    }

    Leaveapplystudent.leavelist = function (data, cb) {
        let whereobj = {sessionId: data.session_id, userId: data.user_id, schoolId: data.school_id};
        if(data.session_id == null){
            whereobj = {id: data.id};
        }
        if(data.schoolId == null && data.id == null && data.user_id == null && data.student_id != null){
            whereobj = {sessionId: data.session_id, userId: data.student_id}; 
        }
        if(data.checkstudentleaveentryflag == null && data.user_id == null && data.school_id == null  && data.id == null && data.checkstudentleaveentryflag == undefined){
            whereobj = {sessionId: data.session_id, status: data.status}; 
        }

        if(data.checkstudentleaveentryflag != undefined && data.checkstudentleaveentryflag != null){
            whereobj = {userId: data.student_id, from_date: {between: [data.from_date, data.to_date]}
            };
        }

        if(data.checkstudentleaveentryflag != undefined && data.checkstudentleaveentryflag != null){
            whereobj = {userId: data.student_id, from_date: {between: [data.from_date, data.to_date]}
            };
        }

        if(data.section_id != null){
            whereobj = {and:[{sessionId: data.session_id}]};
        }

        let msg = {};
        
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }

        Leaveapplystudent.find({
            include :{
                relation : "leave_belongs_user",
                scope:{
                    fields :['id'],
                include : [{
                    relation : "students",
                        scope : {
                            fields:['name', 'admission_no'],
                        }
                    },
                    {
                        relation : "user_have_sections",
                        scope : {
                            fields:['section_name'],
                            where: {and:[{id: data.section_id}]}  
                        } 
                    }]
                }
            },
            where: whereobj
        }, function (err, res) { 
            if (err)
                throw(err);
            var Arr = [];
            let name = 'Nil';
            let admission_no = 'Nil';
            res.forEach(function(value){
                value = value.toJSON();
                if(value.leave_belongs_user != undefined && value.leave_belongs_user.students != undefined){
                    name = value.leave_belongs_user.students.name; 
                    admission_no = value.leave_belongs_user.students.admission_no;
                }
                if(value.status != "Deleted"){
                var obj = {
                    from_date: dateFormat(value.fromDate,"isoDate"),
                    to_date: dateFormat(value.toDate,"isoDate"),
                    reason: value.reason,
                    detail: value.detail,
                    name: name,
                    admission_no: admission_no,
                    cause: value.reason,
                    status: value.status,
                    leave_apply_id: value.id,
                    session_id: value.sessionId,
                    student_id: value.userId,
                    attachment: '',
                    roll_no: '',
                    section_name: '',
                    id: value.id
                    };
                Arr.push(obj);
                }
            });
                msg.status = '200';
                msg.message = "Information Fetched Successfully.";
                cb(null, msg, Arr);
        });
    }

    Leaveapplystudent.remoteMethod(
        'leavelist',
        {
            http: {path: '/leavelist', verb: 'post'},
            description: 'Student leave list',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );

    Leaveapplystudent.getstudentuserid = (data) => {
        return new Promise((resolve, reject) => {
            let Usersections = Leaveapplystudent.app.models.user_sections;
            Usersections.find({
                fields: "userId",
                where: { sectionId: data.section_id, sessionId: data.session_id, schoolId: data.school_id, user_type: "Student", status: "Active" }
            }, (err, res) => {
                if(err) reject(err);
                if(res) {
                    let arr = [];
                    res.forEach(obj => {
                        arr.push(obj['userId']);
                    })
                    resolve(arr);
                }
            })
        }).catch( err => console.log(err) )
    }


    Leaveapplystudent.getmarkedleave = function (data, cb) {

        let msg = {};
        
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        else if(!data.section_id){
            msg.status = "201";
            msg.message = "Section id cannot be null";
            return cb(null, msg);
        }
        else if(!data.session_id){
            msg.status = "201";
            msg.message = "Session id cannot be null";
            return cb(null, msg);
        }
        else if(!data.school_id){
            msg.status = "201";
            msg.message = "School id cannot be null";
            return cb(null, msg);
        }
        
        
        let datapass = {
                section_id: data.section_id,
                session_id: data.session_id,
                school_id: data.school_id 
        }
       
        Leaveapplystudent.getstudentuserid(datapass).then( userid => {
        let whereobj = {sessionId: data.session_id, userId: data.user_id, schoolId: data.school_id};
        if(data.session_id == null){
            whereobj = {id: data.id};
        }
        if(data.schoolId == null && data.id == null && data.user_id == null && data.student_id != null){
            whereobj = {sessionId: data.session_id, userId: data.student_id}; 
        }
        if(data.checkstudentleaveentryflag == null && data.user_id == null && data.school_id == null  && data.id == null && data.checkstudentleaveentryflag == undefined){
            whereobj = {sessionId: data.session_id, status: data.status}; 
        }

        if(data.checkstudentleaveentryflag != undefined && data.checkstudentleaveentryflag != null){
            whereobj = {userId: data.student_id, from_date: {between: [data.from_date, data.to_date]}
            };
        }

        if(data.checkstudentleaveentryflag != undefined && data.checkstudentleaveentryflag != null){
            whereobj = {userId: data.student_id, from_date: {between: [data.from_date, data.to_date]}
            };
        }

        if(data.section_id != null && data.teacherflag != 1){
            whereobj = {and:[{sessionId: data.session_id, userId: data.user_id, schoolId: data.school_id}]};
        }

        if(data.teacherflag == 1){
            whereobj = {and:[{sessionId: data.session_id, schoolId: data.school_id, userId: { inq: userid} }]};
        }
        
        Leaveapplystudent.find({
            include :{
                relation : "leave_belongs_user",
                scope:{
                    fields :['id'],
                include : [{
                    relation : "students",
                        scope : {
                            fields:['name', 'admission_no'],
                        }
                    },
                    {
                        relation : "user_have_sections",
                        scope : {
                            fields:['section_name'],
                            where: {and:[{id: data.section_id}]}  
                        } 
                    }]
                }
            },
            where: whereobj
        }, function (err, res) { 
            if (err)
                throw(err);
            var Arr = [];
            let name = 'Nil';
            let admission_no = 'Nil';
            res.forEach(function(value){
                value = value.toJSON();
                if(value.leave_belongs_user != undefined && value.leave_belongs_user.students != undefined){
                    name = value.leave_belongs_user.students.name; 
                    admission_no = value.leave_belongs_user.students.admission_no;
                }
               if(value.status != "Deleted"){
                var obj = {
                    from_date: dateFormat(value.fromDate,"isoDate"),
                    to_date: dateFormat(value.toDate,"isoDate"),
                    reason: value.reason,
                    detail: value.detail,
                    name: name,
                    admission_no: admission_no,
                    cause: value.reason,
                    status: value.status,
                    leave_apply_id: value.id,
                    session_id: value.sessionId,
                    student_id: value.userId,
                    reject_reason: value.rejectReason,
                    attachment: '',
                    roll_no: '',
                    section_name: '',
                    id: value.id
                    };
                Arr.push(obj);
                }
                
            });
                msg.status = '200';
                msg.message = "Information Fetched Successfully.";
                var arrSort = arraySort(Arr, 'id', {reverse: true});
                cb(null, msg, arrSort);
        });
    })
    }

    Leaveapplystudent.remoteMethod(
        'getmarkedleave',
        {
            http: {path: '/getmarkedleave', verb: 'post'},
            description: 'Get marked student leaves',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
        }
    );
    Leaveapplystudent.removeleaveapply = function (data, cb) {
        
        Leaveapplystudent.destroyById(data.id, 
            function(err, res) {
            if (err) {
                throw err;
            }
            cb(null, res);
        })
    }   
    Leaveapplystudent.remoteMethod(
        'removeleaveapply',
        {
            http: {path: '/removeleaveapply', verb: 'post'},
            description: 'Remove leave apply',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    ); 

    Leaveapplystudent.setleavestatus = (data, cb) => {
        let msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        else if(!data.status){
            msg.status = "201";
            msg.message = "Status cannot be blank";
            return cb(null, msg);
        }
        let where = {id: data.id}, dataobj = {};
        if(data.leave_flag != undefined && data.leave_flag == 1){
            where = {id: { inq: data.id}};
        }
        dataobj = {status: data.status};
        let modified_date = new Date();
        if(data.status == 'Rejected'){
            if(!data.reject_reason){
                msg.status = "201";
                msg.message = "Reject reason cannot be blank";
                return cb(null, msg);   
            }
        }
        if(data.user_type != undefined){
        if(data.user_type.toLowerCase() == "student"){
            if(!data.from_date){
                msg.status = "201";
                msg.message = "From date cannot be blank";
                return cb(null, msg);   
            }

            if(!data.to_date){
                msg.status = "201";
                msg.message = "To date cannot be blank";
                return cb(null, msg);   
            }

            if(!data.modified_by){
                msg.status = "201";
                msg.message = "Modified by cannot be blank";
                return cb(null, msg);   
            }

            if(!data.reason){
                msg.status = "201";
                msg.message = "Reason cannot be blank";
                return cb(null, msg);   
            }

            if(!data.detail){
                msg.status = "201";
                msg.message = "Detail cannot be blank";
                return cb(null, msg);   
            }

            if(!data.leave_id){
                msg.status = "201";
                msg.message = "Leave Id cannot be blank";
                return cb(null, msg);   
            }

            dataobj = {
                "fromDate": data.from_date,
                "toDate": data.to_date,
                "modifiedBy": data.modified_by,
                "modefiedDate": modified_date,
                "reason": data.reason,
                "detail": data.detail,
                "id": data.leave_id
                };
            where = {
                        "id": data.leave_id
                    };    
             }
        }
        if(data.status == 'Rejected'){
            dataobj.rejectReason = data.reject_reason;                    
            Leaveapplystudent.findById(data.id, (err, leavedata) => { 
            Leaveapplystudent.getuserid(data.id).then( val => {
                var notif_data = {
                    user_id: val.userId,
                    module_key_id: data.id,
                    title: "Leave " + data.status,
                    notification_text: "Leave " + data.status + " from " + Leaveapplystudent.getisoDate(leavedata.fromDate) + " to " + Leaveapplystudent.getisoDate(leavedata.toDate)
                };
                Leaveapplystudent.leavenotifation(notif_data).then(value => {
                    
                }) 
                data['from_date'] = Leaveapplystudent.getisoDate(leavedata.fromDate)
                data['to_date'] = Leaveapplystudent.getisoDate(leavedata.toDate)
                Leaveapplystudent.sendparentnotif(val.userId, data);
            })
        })
        }
      
        if(data.status == 'Approved'){
            let student_subject_attendance = Leaveapplystudent.app.models.student_subject_attendance;
           
            if(!data.section_id){
                msg.status = "201";
                msg.message = "Section Id cannot be blank";
                return cb(null, msg); 
            }
            else if(!data.id){
                msg.status = "201";
                msg.message = "Leave Id cannot be blank";
                return cb(null, msg);       
            }
            var insertobj = {};
            Leaveapplystudent.findById(data.id, (err, leavedata) => { 
                let prev = '';
                for (var d = new Date(leavedata.fromDate); d <= new Date(leavedata.toDate); d.setDate(d.getDate() + 1)) {

                    if(leavedata.userId != prev || prev == ''){
                        var notif_data = {
                            user_id: leavedata.userId,
                            module_key_id: leavedata.id,
                            title: "Leave " + data.status,
                            notification_text: "Leave " + data.status + " from " + Leaveapplystudent.getisoDate(leavedata.fromDate) + " to " + Leaveapplystudent.getisoDate(leavedata.toDate)
                        };
                        Leaveapplystudent.leavenotifation(notif_data).then(value => {
                            
                        })
                        data['from_date'] = Leaveapplystudent.getisoDate(leavedata.fromDate)
                        data['to_date'] = Leaveapplystudent.getisoDate(leavedata.toDate)
                        Leaveapplystudent.sendparentnotif(leavedata.userId, data);
                    }
               
                    insertobj = {
                                userId: leavedata.userId, 
                                sectionId: data.section_id,
                                subjectId: 0,
                                schoolId: leavedata.schoolId,
                                sessionId: leavedata.sessionId,
                                attendance_date: dateFormat(new Date(d), "isoDate"),
                                attendance_status: 'L',
                                added_by: leavedata.addedBy,
                                added_date: dateFormat(new Date(), "isoDate"),
                                leaveapplyId: data.id
                            };      
                    student_subject_attendance.upsert(insertobj, (err, response)=> {
                        if(err){
                            msg.status = '201';
                            msg.message = "Error Occurred";
                            return cb(null, msg);  
                        }
                    }); 
                    prev = leavedata.userId; 
                }   
            });
        }
       
        Leaveapplystudent.updateAll(where, dataobj, function(err, response) {
            if (err) {
                throw err;
            }
            if(response){
                msg.status = '200';
                msg.message = "Leave "+ data.status;
                if(data.user_type != undefined){
                    if(data.user_type.toLowerCase() == "student"){
                        msg.message = "Leave updated successfully";
                    }
                }
            }
            cb(null, msg); 
        });
    } 

    Leaveapplystudent.isValidDate = d => {
        return d instanceof Date && !isNaN(d);
    } 
    Leaveapplystudent.getisoDate = dateobj => {
    	if(!Leaveapplystudent.isValidDate(dateobj)){
            dateobj = new Date(dateobj);
        }    
        var dd = dateobj.getDate();
        var mm = dateobj.getMonth()+1; 
        var yyyy = dateobj.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        } 

        return yyyy + '-' + mm + '-' + dd;
    }
    
    Leaveapplystudent.sendparentnotif = (stuuserId, data) => {
        /* parent notification */

        new Promise ( (resolve, reject) => { 
            var User = Leaveapplystudent.app.models.user;
           
           let username_data = {
                user_type: "Student",
                status: "Active",
                student_user_id: stuuserId 
            };

           Leaveapplystudent.getusernameother(username_data).then( val => {
           let username = "p" + val.user_name.substr(4, val.user_name.length);
          
            User.findOne({
                fields: "id",
                where: { user_type: "Parent", status: "Active", user_name: username }
            }, (err, res) => {
                if(err) throw err;
                if(res){
                    var notif_data = {
                        user_id: res.id,
                        module_key_id: data.id,
                        title: "Leave " + data.status,
                        notification_text: "Leave " + data.status + " from " + data.from_date + " to " + data.to_date
                    };
                  
                    Leaveapplystudent.leavenotifation(notif_data).then(value => {
                        
                    })
                }
            })
            })  

        }).catch(err => console.log(err));
        /* ends */
    }

    Leaveapplystudent.getusernameother = (data) => {
        return new Promise( (resolve, reject) => {
            var User = Leaveapplystudent.app.models.user;
            User.findOne({
                fields: "user_name",
                where: { user_type: data.user_type, status: data.status, id: data.student_user_id }
            }, (err, res) => {
                if(err) reject(err);
                if(res) resolve(res);
            })
        }).catch(err => console.log(err))
    }

    Leaveapplystudent.remoteMethod(
        'setleavestatus',
        {
            http: {path: '/setleavestatus', verb: 'post'},
            description: 'Set leave apply status',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Leaveapplystudent.getuserid = data => {
        return new Promise ( (resolve, reject) => {
            Leaveapplystudent.findOne({
                where: {id: data},
                fields: "userId",
            },(err, res) => {
               if(err) reject(err);
               if(res){
                resolve(res);
               }     
            });
        });
    }

    Leaveapplystudent.leavenotifation = data => {
        return new Promise ( (resolve, reject) => {
                var Notification = Leaveapplystudent.app.models.notification;
                var notificationobj = {};
                
                notificationobj.user_id = data.user_id;
                notificationobj.module_key_id = data.module_key_id;
                notificationobj.type = 6;
                notificationobj.title = data.title;
                notificationobj.notification_text = data.notification_text;
                notificationobj.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");

                let notificationarr = [];
                notificationarr.push(notificationobj);
                
                Notification.pushnotification(notificationarr);
        }).catch( err => console.log(err));     
    }

    Leaveapplystudent.studentleavelist = function (data, cb) {
        let msg = {};
        
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        if(!data.section_id){
            msg.status = "201";
            msg.message = "Section Id cannot be blank";
            return cb(null, msg);
        }
        if(!data.session_id){
            msg.status = "201";
            msg.message = "Session Id cannot be blank";
            return cb(null, msg);
        }

        if(!data.school_id){
            msg.status = "201";
            msg.message = "School Id cannot be blank";
            return cb(null, msg);
        }

        var user_section = Leaveapplystudent.app.models.user_sections;
        user_section.find({
            where: {status: "Active", user_type: "Student", sectionId: data.section_id},
            fields: "userId",
            include:{
                relation: "assigned_users",
                scope: {
                    fields: "id",
                    include: [{
                        relation: "user_have_leaves",
                        scope:{
                            fields: ["id", "userId", "fromDate", "toDate", "reason", "detail", "status"],
                            where: {status: { inq: ['Rejected', 'Pending', 'Approved']}},
                        }
                    },
                   {
                        relation: "students",
                        scope: {
                           fields: "name" 
                        }
                   }]
                }
            }
        },function(err, res){
            if(err)
                throw(err);
            let arr = [];
            
            res.forEach((value)=>{
                value = value.toJSON();
                if(value.assigned_users.user_have_leaves.length != 0){
                    value.assigned_users.user_have_leaves.forEach((val)=>{
                        let obj = {
                            "student_name": value.assigned_users.students.name,
                            "user_id": val.userId,
                            "from_date": val.fromDate,
                            "to_date": val.toDate,
                            "reason": val.reason,
                            "detail": val.detail,
                            "status": val.status,
                            "leave_id": val.id
                        }
                        arr.push(obj);
                    })
                }
            });
            
            msg.status = '200';
            msg.message = 'Information fetched successfully';    
            cb(null, msg, arr);     
        })
    }

    Leaveapplystudent.remoteMethod(
        'studentleavelist',
        {
            http: {path: '/studentleavelist', verb: 'post'},
            description: 'Student leave list',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_type', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );


    Leaveapplystudent.checkleave = (data, cb) => {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.user_id) return cb(null, {status: "201", message: "User id cannot be blank"});
        else if(!data.school_id) return cb(null, {status: "201", message: "School id cannot be blank"});
        else if(!data.session_id) return cb(null, {status: "201", message: "Session id cannot be blank"});
        else if(!data.status) return cb(null, {status: "201", message: "Status cannot be blank"});
        else if(!data.attendance_date) return cb(null, {status: "201", message: "Attendance date cannot be blank"});
       
        Leaveapplystudent.find({
            fields: "id",
            where: {
                userId: data.user_id,
                schoolId: data.school_id,
                sessionid: data.session_id,
                status: data.status,
                fromDate: { gte: dateFormat(data.attendance_date, "isoDateTime") },
                toDate: { lte: dateFormat(data.attendance_date, "yyyy-mm-dd'T'23:59:59") }
            }
        }, (err, res) => {
            if(err) throw err;
            if(res){
                let response = (res.length > 0) ? "yes" : "no";
                return cb(null, {"leave_applied": response})
            }
        })
    }

    Leaveapplystudent.remoteMethod(
        'checkleave',
        {
            http: {path: '/checkleave', verb: 'post'},
            description: 'check student leave',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Leaveapplystudent.checkleavestatus = (data, cb) => {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.user_id) return cb(null, {status: "201", message: "User id cannot be blank"});
        else if(!data.school_id) return cb(null, {status: "201", message: "School id cannot be blank"});
        else if(!data.session_id) return cb(null, {status: "201", message: "Session id cannot be blank"});
        else if(!data.attendance_date) return cb(null, {status: "201", message: "Attendance date cannot be blank"});
       
        Leaveapplystudent.find({
            fields: ["id", "fromDate", "toDate"],
            where: {
                userId: data.user_id,
                schoolId: data.school_id,
                sessionid: data.session_id
            }
        }, (err, res) => {
            if(err) throw err;
            if(res){
                let response = (res.length > 0) ? "yes" : "no";
                return cb(null, {"leave_applied": response, "result": res})
            }
        })
    }

    Leaveapplystudent.remoteMethod(
        'checkleavestatus',
        {
            http: {path: '/checkleavestatus', verb: 'post'},
            description: 'check student leave status',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Leaveapplystudent.updateleavestatus = (data, cb) => {
        if(!data) return cb(null, {status: "201", message: "Bad Request"});
        else if(!data.id) return cb(null, {status: "201", message: "Id cannot be blank"});
        else if(!data.status) return cb(null, {status: "201", message: "Status cannot be blank"});

        let where = { id: data.id };
        let dataobj = { status: data.status };

        if(data.reject_reason){
           dataobj['rejectReason'] = data.reject_reason;
        }
       
        Leaveapplystudent.updateAll(where, dataobj, (err, response) => {
            if (err)
                throw err;

            if(response){
                var msg = {}
                msg.status = '200';
                msg.message = "Leave "+ data.status;
            }
            cb(null, msg);
        })
    }

    Leaveapplystudent.remoteMethod(
        'updateleavestatus',
        {
            http: {path: '/updateleavestatus', verb: 'post'},
            description: 'Update leave status',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

};

