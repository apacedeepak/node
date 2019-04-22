'use strict';

module.exports = function (Holidayassigndetails) {
    Holidayassigndetails.assignholiday = function (request, cb) {
        Holidayassigndetails.upsert(request, function (err, res) {
            cb(null, res);
        });
    }
    Holidayassigndetails.remoteMethod(
            'assignholiday',
            {
                http: {verb: 'post'},
                description: 'Create holiday and assign to users',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response_status', type: 'json'}
            }
    );

    Holidayassigndetails.getassignholiday = function (request, cb) {
        var msg = {};
        if(!request.section_id){
            msg.status = '201';
            msg.message = "Section id cannot blank";
            cb(null, msg);
        }
        Holidayassigndetails.find({
            where: {sectionId: request.section_id, status: 'Active'},
            fields: "holiday_masterId",
        }, function (err, res) {
            if (err)
                throw(err);
            var Arr = [];
            
            res.forEach(function(value){
                value = value.toJSON();
                Arr.push({"holiday_masterId": value.holiday_masterId});
            });

            msg.status = '200';
            msg.message = "Success";
            cb(null, msg, Arr);
        });
    }

    Holidayassigndetails.remoteMethod(
        'getassignholiday',
        {
            http: {verb: 'post'},
            description: 'Get holiday assigned to users',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );

    Holidayassigndetails.assignholidaymult = (request, cb) => {
        request.sectionId.forEach( sectionid => {
            request.sectionId = sectionid;
            request.status = "Active";
            Holidayassigndetails.upsert(request, (err, res) => {
               
            });
        });
        cb(null, {status: "200", message: "Saved successfully"});
    }
    Holidayassigndetails.remoteMethod(
            'assignholidaymult',
            {
                http: {verb: 'post'},
                description: 'Create holiday and assign to users multiple sections',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Holidayassigndetails.holidayevent = (request, cb) => {
        const objectdata = {
            "Name": request.name,
            "Category": request.category,
            "Description": request.description,
            "Applicable date": request.applicable_date,
            "Attendance applicable": request.attendance_applicable,
            "Attendance applicable for": request.attendance_applicable_for,
            "School Id": request.schoolId,
            "Added by": request.added_by,
            "Section id": request.sectionId
        };

        Holidayassigndetails.validatereq(objectdata, cb);

        Holidayassigndetails.getactivesessionexecute().then(session_id => {
            let holiday_master = Holidayassigndetails.app.models.holiday_master;
            request['session_id'] = session_id;
            Holidayassigndetails.Holidaymaster(request, holiday_master).then( id => {
                let req = {};
                request.sectionId.forEach( sectionid => {
                    req.sectionId = sectionid;
                    req.status = "Active";
                    req.holiday_masterId = id;
                    Holidayassigndetails.upsert(req, (err, res) => {
                    
                    });
                });
            })
        })
        
        cb(null, {status: "200", message: "Saved successfully"});
    }
    Holidayassigndetails.remoteMethod(
            'holidayevent',
            {
                http: {verb: 'post'},
                description: 'Create holiday, event and assign to users multiple sections',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Holidayassigndetails.getactivesessionexecute = () => {
        return new Promise((resolve, reject) => {
            let session = Holidayassigndetails.app.models.session;
           
            session.getactivesession((err, response) => {
                if(err) reject(err);
                if(response){
                    resolve(response[0].id);
                } 
            });
        });
    }

    Holidayassigndetails.Holidaymaster = (data, holiday_master) => {
        return new Promise((resolve, reject) => {
            holiday_master.assignholiday(data, (err, response) => {
                if(err) reject(err);
                if(response){
                    
                    resolve(response.id);
                } 
            });
        });
    }

    Holidayassigndetails.validatereq = (objectdata, cb) => {
        let msg = {};
        for (var key in objectdata) {
            if (objectdata.hasOwnProperty(key)) {
                if (!objectdata[key]) {
                    msg.status = "201";
                    msg.message = `${key} cannot be blank`;
                    cb(null, msg);
                    return;
                }
            }
        }
    }

};
