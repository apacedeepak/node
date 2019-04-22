'use strict';
var Dedupe = require('array-dedupe');
module.exports = function(Attendancetimetabledetail) {
    Attendancetimetabledetail.timetabledetail = (data, cb) => {
        let msg = {};
        if(!data){
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        else if(!data.section_id){
            msg.status = "201";
            msg.message = "Section id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.subject_id){
            msg.status = "201";
            msg.message = "Subject id cannot be blank";
            return cb(null, msg);
        }
        else if(!data.faculty_id){
            msg.status = "201";
            msg.message = "Faculty id cannot be blank";
            return cb(null, msg);
        }

        Attendancetimetabledetail.timetablemaster(data).then( masterdata => {

                if(!masterdata.id){
                    msg.status = "201";
                    msg.message = "Master id is blank";
                    return cb(null, msg);
                }
                let d = new Date(data.date);
                let day = d.getDay();
 
                Attendancetimetabledetail.find({
                    fields: ["period","start_time","end_time"],
                    where: {timetable_master_id: masterdata.id, day: day, subject: data.subject_id, faculty: data.faculty_id}
                }, (err, res) => {
                   if(err) throw err;
                   if(res){
                        msg.status = "200";
                        msg.message = "Information fetched successfully";
                        let arr = Dedupe(res, ['period']);
                        return cb(null, msg, arr);
                   }
                   else{
                        msg.status = "200";
                        msg.message = "No result";
                        return cb(null, msg);
                    }
                })
        })
    }

    Attendancetimetabledetail.remoteMethod(
        'timetabledetail',
        {
            http: {path: '/timetabledetail', verb: 'post'},
            description: 'Get attendance timetable detail',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );

    Attendancetimetabledetail.timetablemaster = (data) => {
        let attendance_timetable_master = Attendancetimetabledetail.app.models.attendance_timetable_master;

        return new Promise((resolve, reject) => {
            attendance_timetable_master.findOne({
                fields: "id",
                where: {section_id: data.section_id, status: "Active"},
                order:"id DESC"
            }, (err, res) => {
                if(err) reject("error");
                if(res) {
                    resolve(res);
                }else{
                    resolve("noresult");
                }
            })
        }).catch(err => console.log(err));


    }
    Attendancetimetabledetail.facultylistbystarttime = function(data, cb) {

        Attendancetimetabledetail.find({
          where:{day:{inq :data.day},start_time:data.start_time},
          fields:["faculty"]
        },function(err,res){
          if(err){
            console.log(err)
          return  cb(null,err)
          }
          if(res){
            var facultylist=[];
           var  uniquearray = Dedupe(res,['faculty']);
           uniquearray.forEach(element => {
             facultylist.push(element.faculty)
           });
          //  console.log(facultylist)
            return cb(null,facultylist)
          }
        })
      
      }
      Attendancetimetabledetail.remoteMethod("facultylistbystarttime", {
        http: { path: "/facultylistbystarttime", verb: "post" },
        description: "facultylistbystarttime",
        accepts: { arg: "data", type: "object", http: { source: "body" } },
        returns: { arg: "response", type: "json" }
      });
};
