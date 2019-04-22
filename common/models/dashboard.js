'use strict';
var constantval = require('./constant');
var rp = require('request-promise');
var arraySort = require('array-sort');
var Dedupe = require('array-dedupe')
module.exports = function (Dashboard) {
    var errorMessage = {};
    var successMessage = {};
    Dashboard.dashboard = function (req, cb) {
        if(req.user_type.toLowerCase() != "management"){
        if (req.login_id == undefined || req.login_id == '' || req.login_id == null) {
            errorMessage.status = "201";
            errorMessage.message = "Login id can't blank";
            return cb(null, errorMessage);
        }
        if (req.user_type == undefined || req.user_type == '' || req.user_type == null) {
            errorMessage.status = "201";
            errorMessage.message = "User type can't blank";
            return cb(null, errorMessage);
        }
        if (req.user_type.toLowerCase() == 'parent' && (req.student_user_id == undefined || req.student_user_id == '' || req.student_user_id == null)) {
            errorMessage.status = "201";
            errorMessage.message = "Student user Id can't blank";
            return cb(null, errorMessage);
        }
        if (req.school_id == undefined || req.school_id == '' || req.school_id == null) {
            errorMessage.status = "201";
            errorMessage.message = "School Id can't blank";
            return cb(null, errorMessage);
        }
        if (req.session_id == undefined || req.session_id == '' || req.session_id == null) {
            errorMessage.status = "201";
            errorMessage.message = "Session Id can't blank";
            return cb(null, errorMessage);
        }
        if (req.token == undefined || req.token == '' || req.token == null) {
            errorMessage.status = "201";
            errorMessage.message = "Token Id can't blank";
            return cb(null, errorMessage);
        }
         if (req.callfrom == undefined || req.callfrom == '' || req.callfrom == null) {
            errorMessage.status = "201";
            errorMessage.message = "Callfrom can't blank";
            return cb(null, errorMessage);
         }
        }
        var displaycount = 4;
        if(req.callfrom.toLowerCase()=='mobile')
            {
                displaycount = 3;
            }
        var promise = [];
        var alldashboarddata = {};
        var Homework = Dashboard.app.models.homework;
        var Communication = Dashboard.app.models.communication;
        var Announcement = Dashboard.app.models.announcement_assign;

        successMessage.status = "200";
        successMessage.message = "Information fetched Successfully";
        if (req.user_type.toLowerCase() == 'teacher') {
            var requestdata = {
                user_id: req.login_id,
                user_type: req.user_type,
                school_id: req.school_id,
                search_id: {},
                token: req.token
            }

            Homework.homework(requestdata, function (err, responsemsg, responsedata) {

                var homeunreadcount = 0;
                var messageunreadcount = 0;
                for (let key in responsedata.homework) {
                    if (responsedata.homework[key].homework_received_count == 0) {
                        homeunreadcount++;
                    }
                }
                alldashboarddata.homework = responsedata.homework.length > displaycount ? responsedata.homework.slice(0, displaycount) : responsedata.homework;
                alldashboarddata.homeworkcount = homeunreadcount;
                Communication.inboxdata(requestdata, function (err, responsemsg, responsedata) {
                    for (let key in responsedata.inbox) {
                        if (responsedata.inbox[key].message_isread.toLowerCase() == 'no') {
                            messageunreadcount++;
                        }
                    }
                    alldashboarddata.communication = responsedata.inbox.length > displaycount ? responsedata.inbox.slice(0, displaycount) : responsedata.inbox;
                    alldashboarddata.messagecount = messageunreadcount;
                    Announcement.assignedannouncments(requestdata, function (err, responsemsg, responsedata) {
                        alldashboarddata.notice = responsedata.notice.length > displaycount ? responsedata.notice.slice(0, displaycount) : responsedata.notice;
                        alldashboarddata.circular = responsedata.circular.length > displaycount ? responsedata.circular.slice(0, displaycount) : responsedata.circular;
                        alldashboarddata.noticeCircular = responsedata.noticeCircular.length > displaycount ? responsedata.noticeCircular.slice(0, displaycount) : responsedata.noticeCircular;
                        alldashboarddata.noticeCount = responsedata.noticeCount;
                        alldashboarddata.circularCount = responsedata.circularCount;
                        alldashboarddata.allNotCirCount = responsedata.allNotCirCount;
                        alldashboarddata.class_teacher = '';
                        alldashboarddata.school_phone = '';
                        cb(null, successMessage, alldashboarddata);
                    })
                })



            })

        }
        if (req.user_type.toLowerCase() == 'student') {
            var requestdata = {
                user_id: req.login_id,
                user_type: req.user_type,
                search_id: {},
                school_id: req.school_id,
                token: req.token,
                section_id : req.section_id
            }

            Homework.studenthomework(requestdata, function (err, responsemsg, responsedata) {
                var homeunreadcount = 0;
                var messageunreadcount = 0;
                for (let key in responsedata) {
                    if (responsedata[key].submitted == 1 && responsedata[key].checked == 0) {
                        homeunreadcount++;
                    }
                }
                alldashboarddata.homework = responsedata.length > displaycount ? responsedata.slice(0, displaycount) : responsedata;
                alldashboarddata.homeworkcount = homeunreadcount;
                Communication.inboxdata(requestdata, function (err, responsemsg, responsedata) {

                    for (let key in responsedata.inbox) {
                        if (responsedata.inbox[key].message_isread.toLowerCase() == 'no') {
                            messageunreadcount++;
                        }
                    }
                    alldashboarddata.communication = responsedata.inbox.length > displaycount ? responsedata.inbox.slice(0, displaycount) : responsedata.inbox;
                    alldashboarddata.messagecount = messageunreadcount;
                    Announcement.assignedannouncments(requestdata, function (err, responsemsg, responsedata) {

                        alldashboarddata.notice = responsedata.notice.length > displaycount ? responsedata.notice.slice(0, displaycount) : responsedata.notice;
                        alldashboarddata.circular = responsedata.circular.length > displaycount ? responsedata.circular.slice(0, displaycount) : responsedata.circular;
                        alldashboarddata.noticeCircular = responsedata.noticeCircular.length > displaycount ? responsedata.noticeCircular.slice(0, displaycount) : responsedata.noticeCircular;
                        alldashboarddata.noticeCount = responsedata.noticeCount;
                        alldashboarddata.circularCount = responsedata.circularCount;
                        alldashboarddata.allNotCirCount = responsedata.allNotCirCount;
                        var Usersection = Dashboard.app.models.user_sections;
                        Usersection.getsectionbyuserid({ "user_id": req.login_id }, function (err, result) {
                            var assign_section = result[0].section_id;
                            Usersection.getsectionteachers({ "section_id": assign_section, "user_type": "Teacher" }, function (err, result) {
                                if (result.length == 0) {
                                    alldashboarddata.class_teacher = '';
                                }
                                else {
                                    var class_teacher = ''
                                    for (let key in result) {
                                        if (result[key].class_teacher.toLowerCase() == 'yes') {
                                            class_teacher = result[key].name;
                                        }
                                    }
                                    alldashboarddata.class_teacher = class_teacher;
                                }
                                var School = Dashboard.app.models.school;
                                School.findById(req.school_id, function (err, result) {
                                    alldashboarddata.school_phone = result.contact_no;
                                    cb(null, successMessage, alldashboarddata);
                                })
                            })
                        });

                    })
                })



            })

        }
        if (req.user_type.toLowerCase() == 'parent') {
            var requestdata = {
                user_id: req.student_user_id,
                school_id: req.school_id,
                token: req.token
            }

            Homework.studenthomework(requestdata, function (err, responsemsg, responsedata) {
                var homeunreadcount = 0;
                var messageunreadcount = 0;
                for (let key in responsedata) {
                    if (responsedata[key].submitted == 1 && responsedata[key].checked == 0) {
                        homeunreadcount++;
                    }
                }
                alldashboarddata.homework = responsedata.length > displaycount ? responsedata.slice(0, displaycount) : responsedata;
                alldashboarddata.homeworkcount = homeunreadcount;
                requestdata = {};
                requestdata = {
                    user_id: req.login_id,
                    user_type: req.user_type,
                    school_id: req.school_id,
                    search_id: {},
                    token: req.token,
                    student_user_id: req.student_user_id
                }
                Communication.inboxdata(requestdata, function (err, responsemsg, responsedata) {
                    for (let key in responsedata.inbox) {
                        if (responsedata.inbox[key].message_isread.toLowerCase() == 'no') {
                            messageunreadcount++;
                        }
                    }
                    alldashboarddata.communication = responsedata.inbox.length > displaycount ? responsedata.inbox.slice(0, displaycount) : responsedata.inbox;
                    alldashboarddata.messagecount = messageunreadcount;
                    requestdata = {};
                    requestdata = {
                        user_id: req.student_user_id,
                        user_type: "Parent",
                       // limit: displaycount,
                        school_id: req.school_id,
                        token: req.token
                    }
                    Announcement.assignedannouncments(requestdata, function (err, responsemsg, responsedata) {
                        alldashboarddata.notice = responsedata.notice.length > displaycount ? responsedata.notice.slice(0, displaycount) : responsedata.notice;
                        alldashboarddata.circular = responsedata.circular.length > displaycount ? responsedata.circular.slice(0, displaycount) : responsedata.circular;
                        alldashboarddata.noticeCircular = responsedata.noticeCircular.length > displaycount ? responsedata.noticeCircular.slice(0, displaycount) : responsedata.noticeCircular;
                        alldashboarddata.noticeCount = responsedata.noticeCount;
                        alldashboarddata.circularCount = responsedata.circularCount;
                        alldashboarddata.allNotCirCount = responsedata.allNotCirCount;
                        requestdata = {};
                        requestdata = {
                            user_id: req.login_id,
                            session_id: req.session_id,
                            school_id: req.school_id,
                            user_type: req.user_type,
                            type: req.user_type,
                            token: req.token
                        }
                        var User = Dashboard.app.models.user;
                        User.userdetail(requestdata, function (err, responsemsg, responsedata) {
                            //alldashboarddata.childlist = responsedata.child_list;

                            var promise = [];
                            var childlist = [];
                            for (let key in responsedata.child_list) {
                                promise.push(Dashboard.getalldata(responsedata.child_list[key].user_id).then(function (response) {
                                    //   responsedata.child_list[key].class_teacher = response.school_phone;
                                    var tempobj = responsedata.child_list[key];
                                    tempobj.class_teacher = response.class_teacher;
                                    childlist.push(tempobj);

                                }))

                            }
                            //cb(null, successMessage, alldashboarddata);
                            Promise.all(promise).then(function (respnse) {
                                var School = Dashboard.app.models.school;
                                School.findById(req.school_id, function (err, result) {
                                    alldashboarddata.school_phone = result.contact_no;
                                    alldashboarddata.childlist = childlist;

                                    cb(null, successMessage, alldashboarddata);
                                })

                            })
                        })
                    })
                })
            })

        }
        /* Management dashboard code by arjun sisodia */
        if (req.user_type.toLowerCase() == 'management') {
            if(req.viewtype == "table"){
                let res = [], promises = [];

                /* Attendance part */
                const objectdata = {
                    "Session id": req.session_id, 
                    "School id": req.school_id
                };

                Dashboard.validatereq(objectdata, cb);
                let iterator = daterange();
                
                let attendance = Dashboard.app.models.student_subject_attendance;

                const data ={
                                "session_id": req.session_id,
                                "school_id": req.school_id
                                }
                promises.push(Dashboard.attendancepromise(data, attendance, res)); 
                /* ends */

                /* Fee starts */
                let feedataobj = dataobj().next().value;
                let fee = Dashboard.app.models.fee_defaulter;
                let receipt = Dashboard.app.models.receipt;
                let imprest_collection = Dashboard.app.models.imprest_collection;
                const data_1 = {
                                "session_id": req.session_id
                            }                    
                promises.push(Dashboard.feepromise(data_1, fee, receipt, imprest_collection, feedataobj, res))    
                /* ends */

                /* communication starts */
                const data_2 = {
                    "placeholder": "message"
                }
                let communication = Dashboard.app.models.communication;
                promises.push(Dashboard.commpromise(data_2, communication, res)) 
                /*ends*/

                /*doubt start */
                let params ={
                    "session_id": req.session_id,
                    "school_id": req.school_id,
                    "to_date":new Date()
                    }
                let Doubtsmaster=Dashboard.app.models.doubts_master;
                promises.push(Dashboard.doubtpromise(params, Doubtsmaster, res))

                /*Doubt End */
                
                Promise.all(promises).then( data => {
                return cb(null, {status: "200", message: "Information fetched successfully"}, res);
                }).catch( err => { return cb(err, {status: "201", message: "some error"}, err) } );
            }
            else if(req.viewtype == "graph"){
                let res = [], promises = [];
                /* Attendance part */
                const objectdata = {
                    "Session id": req.session_id, 
                    "School id": req.school_id
                };

                Dashboard.validatereq(objectdata, cb);

                if(req.moduletype == 'all' || req.moduletype == 'attend'){
                    let attendance = Dashboard.app.models.student_subject_attendance;
                    const data = { 
                                    "from_date": Dashboard.getisoDate(new Date(req.from_date)), 
                                    "to_date": Dashboard.getisoDate(new Date(req.to_date)),
                                    "session_id": req.session_id,
                                    "school_id": req.school_id,
                                    "user_type": "management",
                                    "management_flag": "1",
                                    "subject_id": "0",
                                    "range": this.range
                                }
                    promises.push(Dashboard.attendancepercentpromise(data, attendance, res)); 
                    /* ends */
                }
                if(req.moduletype == 'all' || req.moduletype == 'fee'){
                    let fee = Dashboard.app.models.fee_defaulter;
                    let receipt = Dashboard.app.models.receipt;
                    let imprest_collection = Dashboard.app.models.imprest_collection;
                    let data_1 = { 
                        "from_date": Dashboard.getisoDate(new Date(req.from_date)), 
                        "to_date": Dashboard.getisoDate(new Date(req.to_date)),
                        "session_id": req.session_id,
                    }
                    promises.push(Dashboard.feepercentpromise(data_1, fee, receipt, imprest_collection, res))
                }
                if(req.moduletype == 'all' || req.moduletype == 'comm'){
                    /* communication starts */
                    let data_2 = {
                        "placeholder": "message",
                        "from_date": Dashboard.getisoDate(new Date(req.from_date)), 
                        "to_date": Dashboard.getisoDate(new Date(req.to_date))
                    }
                    
                    let communication = Dashboard.app.models.communication;
                    promises.push(Dashboard.commpercentpromise(data_2, communication, res)) 
                    /*ends*/
                }

                Promise.all(promises).then( data => { 
                    return cb(null, {status: "200", message: "Information fetched successfully"}, res);
                }).catch( err => { return cb(null, {status: "201", message: "some error"}, err) } );
            }
        } 
    }

    Dashboard.feepromise = (data, fee, receipt, imprest_collection, feedataobj, res) => {
        return new Promise((resolve, reject) => {
            fee.defaulter(data, (err, msg, response) => {
                if(err) reject(err);
                if(response){
                    feedataobj.defaulter.today = response.defaulter_count;
                    feedataobj.defaulter.last_month = "NA";
                    feedataobj.defaulter.till_date = "NA";

                    imprest_collection.miscellaneous(data, (err, msg, response) => {
                        if(err) reject(err);
                        if(response){
                            feedataobj.misc_collection.today = response.misc_collection.today;
                            feedataobj.misc_collection.last_month = response.misc_collection.last_month;
                            feedataobj.misc_collection.till_date = response.misc_collection.till_date;

                            receipt.feecollection(data, (err, msg, response) => {
                                if(err) reject(err);
                                if(response){
                                    feedataobj.fee_collection.today = response.fee_collection.today;
                                    feedataobj.fee_collection.last_month = response.fee_collection.last_month;
                                    feedataobj.fee_collection.till_date = response.fee_collection.till_date;
                                    res.push( {fee: feedataobj} );
                                    resolve("success");
                                }
                            })
                            
                        }
                    })
                }
            }) 
        });
    }

    Dashboard.feepercentpromise = (data, fee, receipt, imprest_collection, res) => {
        let feedataobj = {
            "fee_collection": 0,
            "misc_collection": 0,
            "defaulter": 0
        }; 
        return new Promise((resolve, reject) => {
            imprest_collection.miscellaneouspercent(data, (err, msg, response) => {
                if(err) reject(err);
                if(response){
                    feedataobj.misc_collection = response.misc_collection;
                    fee.defaulter(data, (err, msg, response) => {
                        let usersection = Dashboard.app.models.user_sections;
                        let defaultercount = 0;
                        if(err) reject(err);
                        if(response) defaultercount = response.defaulter_count;
                        usersection.usercount({session_id: data.session_id, user_type: 'Student'}, (err, msg, response) => {
                            if(err) reject(err);
                            if(response) { 
                                feedataobj.defaulter = defaultercount;
                                receipt.feecollectionpercent(data, (err, msg, response) => {
                                    if(err) reject(err);
                                    if(response){
                                        feedataobj.fee_collection = response.fee_collection;
                                        res.push( {feepercent: feedataobj} );
                                        resolve("success");
                                    }
                                })
                            }
                        }) 
                    }) 
                }
            })
        });
    }

    Dashboard.attendancepromise = (data, attendance, res) => {
        return new Promise((resolve, reject) => {
            attendance.dashboardattendance(data, (err, msg, response) => {
                if(err) reject(err);
                if(response){
                    res.push( {attendance: response} );
                    resolve("success");
                } 
            });
        });
    }

    Dashboard.attendancepercentpromise = (data, attendance, res) => {
        return new Promise((resolve, reject) => {
            attendance.attendancepercent(data, (err, msg, response) => {
                if(err) reject(err);
                if(response){
                    res.push( {attendancepercent: response} );
                    resolve("success");
                } 
            });
        });
    }

    Dashboard.commpromise = (data, communication, res) => {
        return new Promise((resolve, reject) => {
            communication.countmessage(data, (err, msg, response) => {
                if(err) reject(err);
                if(response){
                    res.push( {communication: response} );
                    resolve("success");
                } 
            });
        });
    }

    Dashboard.commpercentpromise = (data, communication, res) => {
        return new Promise((resolve, reject) => {
            communication.commgraph(data, (err, response) => {
                if(err) reject(err);
                if(response){
                    res.push( {communicationpercent: response} );
                    resolve("success");
                } 
            });
        });
    }


    Dashboard.doubtpromise = (data, doubtmaster, res) => {
        return new Promise((resolve, reject) => {
            doubtmaster.getDashboardData(data, (err, response) => {
                if(err) reject(err);
                if(response){
                    res.push( {doubt: response} );
                    resolve("success");
                } 
            });
        });
    }

    function* dataobj() {
        let obj = {
            "fee_collection": {
                "today": "",
                "last_month": "",
                "till_date": ""
            },
            "misc_collection": {
                "today": "",
                "last_month": "",
                "till_date": ""
            },
            "defaulter": {
                "today": "",
                "last_month": "",
                "till_date": ""
            }
        };
        yield obj;
    }

    function* dataobj1() {
        let obj = {
            "today": {
                "message": "",
                "notice": "",
                "circular": ""
            },
            "current_month": {
                "message": "",
                "notice": "",
                "circular": ""
            },
            "last_month": {
                "message": "",
                "notice": "",
                "circular": ""
            }
        };
        yield obj;
    }

    Dashboard.validatereq = (objectdata, cb) => {
        let msg = {};
        for (var key in objectdata) {
            if (objectdata.hasOwnProperty(key)) {
                if(!objectdata[key]){
                    msg.status = "201";
                    msg.message = `${key} cannot be blank`;
                    cb(null, msg);
                    return;
                }
            }
        }
    }
    Dashboard.isValidDate = d => {
        return d instanceof Date && !isNaN(d);
    } 
    Dashboard.getisoDate = dateobj => {
    	if(!Dashboard.isValidDate(dateobj)){
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

    function* daterange(){
        let d = new Date();
        let current_month = d.getMonth()+1;
        let last_month = current_month-1;
        let current_date = d.toISOString();
        let current_year = d.getFullYear();

        if(last_month.toString().length == 1){
            last_month = '0'+last_month;
        }
        let from_date = current_year + '-' + last_month + '-' + '01';
        let to_date = new Date(current_year, current_month, 0);

        yield from_date;
        yield to_date;
        yield current_month;
        yield current_date;
    }

    Dashboard.getalldata = function (userid) {
        return new Promise(function (resolve, reject) {
            var Usersection = Dashboard.app.models.user_sections;

            var returnobj = {};
            Usersection.getsectionbyuserid({ "user_id": userid }, function (err, result) {
                var assign_section = result[0].section_id;
                Usersection.getsectionteachers({ "section_id": assign_section, "user_type": "Teacher" }, function (err, result) {
                    if (result.length == 0) {
                        returnobj.class_teacher = '';
                    }
                    else {
                        var class_teacher = ''
                        for (let key in result) {
                            if (result[key].class_teacher.toLowerCase() == 'yes') {
                                class_teacher = result[key].name;
                            }
                        }
                        returnobj.class_teacher = class_teacher;
                    }
                    resolve(returnobj);

                })
            });
        })
    }
    Dashboard.remoteMethod(
        'dashboard',
        {
            http: { verb: 'post' },
            description: 'Dashboard List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );
    
    Dashboard.classteacherdashboard = (req, cb)=>{
        if (!req.user_id) {
            errorMessage.status = "201";
            errorMessage.message = "User id can't blank";
            return cb(null, errorMessage);
        }
        if (!req.user_type) {
            errorMessage.status = "201";
            errorMessage.message = "User type can't blank";
            return cb(null, errorMessage);
        }
        
        if (!req.school_id) {
            errorMessage.status = "201";
            errorMessage.message = "School Id can't blank";
            return cb(null, errorMessage);
        }
        if (!req.session_id) {
            errorMessage.status = "201";
            errorMessage.message = "Session Id can't blank";
            return cb(null, errorMessage);
        }
        if (!req.token) {
            errorMessage.status = "201";
            errorMessage.message = "Token Id can't blank";
            return cb(null, errorMessage);
        }
        var sessionStartDate = {};
        var resData = {}
        var respDataArr = [];
        let sessionObj = Dashboard.app.models.session;
        let student_subject_attendanceObj = Dashboard.app.models.student_subject_attendance;
        var allAssignedSection = [];
        let param = {
            user_id: req.user_id,
            user_type: req.user_type,
            token: req.token
        }
        const gen = Dashboard.generatorclassrecord(sessionObj, req, param, cb); 
        let i = 0; 
        for(const obj of gen){
            if(typeof obj == 'object'){
                obj.value
                .then(res => {
                    switch(obj.key) {
                        case 'session_date':
                            sessionStartDate['start_date'] = res
                            break;
                        case 'section_by_userid':{
                            allAssignedSection = res
                            Dashboard.getuserlistbysectionExecute(allAssignedSection, sessionStartDate, cb, req)
                            }
                            break;    
                        default:
                            
                    }  
                })
                .catch(err => console.log(err))
            }
            i++;
        }
    }
    Dashboard.generatorclassrecord = function* (sessionObj, req, param, cb) {
        yield {key: "session_date", value: Dashboard.getdaysbtwactiveschoolsessionExecute(sessionObj, req.school_id)}
        yield {key: "section_by_userid", value: Dashboard.getsectionbyuseridExecute(param)}
    }

    Dashboard.getsectionbyuseridExecute = param => {
        let user_sectionsObj = Dashboard.app.models.user_sections;
        return new Promise((resolve, reject) => {
            user_sectionsObj.getsectionbyuserid(param, (err, allAssignedSection)=>{
                if(err) reject(err)
                if(allAssignedSection.length > 0){
                    resolve(allAssignedSection)
                }else{
                    reject('No section assign.') 
                }
            })
        })
    }

    Dashboard.getuserlistbysectionExecute = (allAssignedSection, sessionStartDate, cb, req) => {
            var classSection = {}, promises = [];
            for(let key in allAssignedSection){
                if(allAssignedSection[key].class_teacher.toLowerCase() == 'yes'){
                    classSection.className = allAssignedSection[key].class_name;
                    classSection.section = allAssignedSection[key].section;
                    let param = {
                        user_type: 'Student',
                        section_id: allAssignedSection[key].section_id
                    };
                    promises.push(Dashboard.allAssignedSectionExecute(param, req, cb, sessionStartDate, classSection)); 
                }
            }

            Promise.all(promises).then(getAllUserList => { 
                if(getAllUserList[0]){ 
                    let promise = []
                    successMessage.status = "200";
                    successMessage.message = "Users fetched";
                    let studentData = getAllUserList[0].data.section_have_users();
                    for (let key in studentData) {
                        promise.push(Dashboard.lastExecute(studentData, key, req, sessionStartDate));
                    }
                    Promise.all(promise).then(function (final) { 
                    var finalArr= Dedupe(final, ['admission_no']);
                    var dataSort = arraySort(finalArr, ['roll_no','admission_no']);
                    let datafinal = {
                        dashboardData: dataSort,
                        classSection: classSection,
                    };
                    return cb(null, successMessage, datafinal);
                    });
    
                    if(promise.length == 0)
                    {
                        successMessage.status = "200";
                        successMessage.message = "Nothing fetched2";
                        let datafinal = {
                            dashboardData: [],
                            classSection: {},
                        };
                        return cb(null, successMessage, datafinal);  
                    }
                }else{
                    successMessage.status = "200";
                        successMessage.message = "Nothing fetched3";
                        let datafinal = {
                            dashboardData: [],
                            classSection: {},
                        };
                    return cb(null, successMessage, datafinal);
                }
            })
    }

    Dashboard.lastExecute = (studentData, key, req, sessionStartDate) => {
        var respData = {};
        return new Promise((resolve, reject) => {   
            if(studentData[key]){
                respData.name = (studentData[key].students()) ? studentData[key].students().name: '';
                respData.student_photo = (studentData[key].students()) ? studentData[key].students().student_photo: '';
                respData.admission_no = (studentData[key].students()) ? studentData[key].students().admission_no: '';
                respData.userId = (studentData[key].students()) ? studentData[key].students().userId: 0;
                respData.roll_no = (studentData[key].user_have_section())? studentData[key].user_have_section().roll_no: '';
            } else{
                respData = {
                    name: '',
                    student_photo: '',
                    admission_no: '',
                    userId: 0,
                    roll_no: ''
                } 
            }     
            resolve(respData)
        }).then((respData)=>{
            var resData = {};
            let userid;
            return new Promise(function(resolve, reject){
                resData.name = respData.name;
                resData.student_photo = respData.student_photo;
                resData.admission_no = respData.admission_no;
                resData.userId = respData.userId;
                resData.roll_no = respData.roll_no;
                resData.totalPresent = 0;
                resData.totalAttendenceCount = 0;
                resData.fee = 0;
                resData.indiscipline = 0;
                userid = (studentData[key].students()) ? studentData[key].students().userId: 0
                Dashboard.getUserAttendance(userid, req.school_id,req.session_id,sessionStartDate.start_date).then((attendence)=>{
                    if(attendence){
                        resData.totalPresent = attendence.response.Present;
                        resData.totalAttendenceCount = resData.totalPresent + attendence.response.Absent + attendence.response.Leave;
                        Dashboard.getfeedues(userid,req.session_id).then((feedues)=>{
                            resData.fee = feedues.response.totalDues;
                            Dashboard.getremarks(userid).then((getremark)=>{
                                resData.indiscipline = getremark.response.length;
                                resolve(resData)
                            })
                        })
                    }else{
                        resolve(resData)
                    }
                   
                })
            });
        }).catch(err => console.log(err))
    }

    Dashboard.allAssignedSectionExecute = (param, req, cb, sessionStartDate, classSection) => {
        let sectionObj = Dashboard.app.models.section;
        return new Promise((resolve, reject) => {
            sectionObj.getuserlistbysection(param, (errs, getAllUserList)=>{
                    if(errs) reject(console.log(errs))
                    if(getAllUserList) resolve(getAllUserList) 
            }); 
        })
          
    }
    
    Dashboard.getdaysbtwactiveschoolsessionExecute = function(sessionObj, school_id){
        return new Promise((resolve, reject)=>{
            sessionObj.getdaysbtwactiveschoolsession(school_id, (err, session)=>{ 
                if(err) reject(err)
                if(session){ 
                    if(session.start_date) resolve(session.start_date)
                    else reject('nostartdate')
                }else{
                    reject('nosession')
                }
            })
        })
    }
    
    Dashboard.getremarks = (userId, sessionId)=>{
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'post',
                uri: constantval.LOCAL_URL+':'+constantval.LOCAL_PORT + '/'+'api/student_remark/getremarkbyuserid',
                body: {
                    "user_id": userId
                },
                json: true
            };
            rp(options)
                .then(function (response) {

                    resolve(response);

                })

        });
    }
    
    
    
    Dashboard.getfeedues = (userId, sessionId)=>{
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'post',
                uri: constantval.LOCAL_URL+':'+constantval.LOCAL_PORT + '/'+'api/fee_defaulters/duefee',
                body: {
                    "user_id": userId,
                    "session_id": sessionId
                },
                json: true
            };
            rp(options)
                .then(function (response) {

                    resolve(response);

                })

        });
    }
    
    
    
    Dashboard.getUserAttendance = (userId, schoolId, sessionId, startDate)=>{
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'post',
                uri: constantval.LOCAL_URL+':'+constantval.LOCAL_PORT + '/'+'api/student_subject_attendances/studentattendance',
                body: {
                    "user_id": userId,
                    "school_id": schoolId,
                    "session_id": sessionId,
                    "from_date": startDate,  
                    "to_date": new Date().toISOString()
                },
                json: true
            };
            rp(options)
                .then(function (response) {

                    resolve(response);

                })

        });
    }
    
    Dashboard.remoteMethod(
        'classteacherdashboard',
        {
            http: { path: '/classteacherdashboard',verb: 'post' },
            description: 'Class Teacher Dashboard List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response_status', type: 'json' }, { arg: 'response', type: 'json' }]
        }
    );

};
