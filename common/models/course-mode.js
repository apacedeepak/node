'use strict';

module.exports = function(Coursemode) {
    Coursemode.createcoursemode = function(data, cb){  
        
        if(!data) return cb(null, {response_status: "201", response: "Invalid data"});
        
        Coursemode.upsert(data, function (err, res) { 
            if(err) { return console.log(err) }
            if(data.id){
                var message = "Course Mode updated successfully";
            }else{
                var message = "Course mode added successfully";
            }
            return cb(null, {response_status: "200", response: message});
        }) 
    }

    Coursemode.remoteMethod(
        'createcoursemode',
        {
            http: {path: '/createcoursemode', verb: 'post'},
            description: 'Create Course Mode',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );
    
    Coursemode.getcoursemode = function (cb) {  

        Coursemode.find({
            //where: {status:'Active'}
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });
    };

    Coursemode.remoteMethod(
        'getcoursemode',
        {
            http: {path: '/getcoursemode', verb: 'get'},
            description: 'Get Course Mode',
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    Coursemode.getcoursebyid = function (courseId, cb) {  
        Coursemode.findOne({
            where: {id: courseId},
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });
    };

    Coursemode.remoteMethod(
        'getcoursebyid',
        {
            http: {path: '/getcoursebyid', verb: 'get'},
            description: 'Get Course Mode',
            accepts: {arg: 'courseId', type: 'string', required: true},
            returns: {arg: 'response', type: 'json'}
        }
    );

    /* Check Duplicate Entry */
    Coursemode.coursemodebyname = function (req, cb) {  
        Coursemode.find({
            where: {course_mode_name: req.course_mode_name},
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });
    };

    Coursemode.remoteMethod(
        'coursemodebyname',
        {
            http: {path: '/coursemodebyname', verb: 'post'},
            description: 'Get Course Mode',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );
    Coursemode.getallactivecoursemode = function (cb) {  

        Coursemode.find({
            where: {status:'Active'}
        }, function (err, stdObj) {
         var msg={}
         if(err){
             msg.status="201",
             msg.message="Error Occcured"
             return cb(null, msg);
         }
         if(stdObj.length==0){
            msg.status="200",
            msg.message="No Record Found"
            return cb(null, msg);
        }
        if(stdObj.length>0){
            var arr=[];
            stdObj.forEach(element => {
                var obj ={
                    "course_mode_id":element.id,
                    "course_mode_name":element.course_mode_name
                }
                arr.push(obj)
            });
            return cb(null, arr);
        }
        });
    };

    Coursemode.remoteMethod(
        'getallactivecoursemode',
        {
            http: {path: '/getallactivecoursemode', verb: 'get'},
            description: 'Get all active Course Mode',
            returns: {arg: 'response', type: 'json'}
        }
    );
};
