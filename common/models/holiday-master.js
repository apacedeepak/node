'use strict';
var dateFormat = require('dateformat');
module.exports = function (Holidaymaster) {
    /*Create Holiday*/
    Holidaymaster.assignholiday = function (request, cb) {
        request.applicable_date = dateFormat(request.applicable_date, "isoDate");
        request.status = "Active";
        request.added_date = dateFormat(new Date(), "isoDateTime");
        Holidaymaster.upsert(request, function (err, res) {
            cb(null, res);
        });
    }

    Holidaymaster.remoteMethod(
            'assignholiday',
            {
                http: {verb: 'post'},
                description: 'Create holiday and assign to users',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response_status', type: 'json'}
            }
    );

    /*Get Holiday List */

    Holidaymaster.getholidays = function (request, cb) {
        var msg = {};
        var resp = {};
        var holidayFor = 'Both';
        if (!request.school_id) {
            msg.status = '201';
            msg.message = "School id cannot be blank";
            cb(null, msg);
            return;
        }

        if (!request.applicable_for) {
            msg.status = '201';
            msg.message = 'Applicable for cannot be blank';
            cb(null, msg);
            return;
        }


        Holidaymaster.find( 
                {
                    include: {
                        relation: "assigned_holidays",
                    },
                    where: {sessionId: request.session_id, schoolId: request.school_id, 
                        applicable_date: {between: [dateFormat(request.from_date, "isoDate"), dateFormat(request.to_date, "isoDate")]},
                        holiday_for: {or: [{holiday_for: "Both"}, {holiday_for: holidayFor}]}, status: "Active"}
                }
        , function (err, res) {
            if (res) {
                var holidayList = [];
                var weeklyOffList = [];
                var eventList = [];
                res.forEach(function (value) {
                    if (value.category == "Holiday") {
                        var obj = {
                            holiday_remark: value.name,
                            description: value.description,
                            holiday_date: dateFormat(value.applicable_date, "isoDate"),
                            holiday_id: value.id,
                        };
                        holidayList.push(obj);
                    } else if(value.category == "Weekly Off") {
                        var obj = {
                            event_remark: value.name,
                            description: value.description,
                            event_date: dateFormat(value.applicable_date, "isoDate"),
                            event_id: value.id,
                        };
                        weeklyOffList.push(obj);
                    }else {
                        var obj = {
                            event_remark: value.name,
                            description: value.description,
                            event_date: dateFormat(value.applicable_date, "isoDate"),
                            event_id: value.id,
                        };
                        eventList.push(obj);
                    }

                });
                msg.status = '200';
                msg.message = 'Data fetched successfully';
                resp.eventList = eventList;
                resp.holidayList = holidayList;
                resp.weeklyOffList = weeklyOffList;
                
            }
          return  cb(null, msg, resp);
        });
    }
    Holidaymaster.remoteMethod(
            'getholidays',
            {
                http: {verb: 'post'},
                description: 'Get holiday and assign to users',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );

    Holidaymaster.checkHoliday = function (request, cb) {
        
        var msg = {}, holiday_masterId_Arr = [];
        if(!request.section_id){
            msg.status = '201';
            msg.message = "Section id cannot blank";
            cb(null, msg);
        }
        if(!request.session_id){
            msg.status = '201';
            msg.message = "Session id cannot blank";
            cb(null, msg);
        }
        if(!request.applicable_date){
            msg.status = '201';
            msg.message = "Applicable date cannot blank";
            cb(null, msg);
        }  
            Holidaymaster.find({ 
                fields: ["id"],
                where: {
                    "and":[
                        {attendance_applicable: 'Yes'},
                        {status:'Active'},
                        {sessionId: request.session_id},
                        {applicable_date: dateFormat(request.applicable_date, "isoDate")},
                        {"or":
                        [{attendance_applicable_for: 'Both'},
                        {attendance_applicable_for: 'Student'}
                        ]}
                    ]
                },
                include: {
                    relation: "assigned_holidays",
                    scope:{
                   // fields:["holiday_masterId"],
                    where: {sectionId: request.section_id, status: 'Active'}
                    },
                    
                }
            }, function(err, res){
                if (err)
                    throw(err);
                var obj = {};
                if(res.length == 0){
                    obj = {applicable_date: request.applicable_date, 'flag': 'Yes'};
                }
                res.forEach(function(value){
                    if(value.assigned_holidays().length > 0){
                        obj = {applicable_date: request.applicable_date, 'flag': 'No'};
                    }else{
                        obj = {applicable_date: request.applicable_date, 'flag': 'Yes'}; 
                    }
                });
                
                cb(null, obj);
            })
    }  

    Holidaymaster.remoteMethod(
        'checkHoliday',
        {
            http: {verb: 'post'},
            description: 'Check holidays assigned to users',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );
    
    Holidaymaster.getHolidaysList = function(data, cb){
        
        if(data.from_date && !data.to_date){
            data.to_date = data.from_date
        }
        Holidaymaster.find({
            where:{
                and: [
                    {sessionId: data.session_id},
                    {schoolId: data.school_id},
                    {attendance_applicable: "No"},
                    {applicable_date: {gte: dateFormat(data.from_date, "isoDateTime")}},
                    {applicable_date: {lte: dateFormat(data.to_date, "yyyy-mm-dd'T'23:59:59")}}
                ]
            }
        },function(err, res){
            
            var holidate = [];
            
            for(var i in res){
                holidate.push(res[i].applicable_date);
            }
            return cb(null, holidate)
        });
    }
    
};
