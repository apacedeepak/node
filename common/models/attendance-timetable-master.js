"use strict";
var Dedupe = require('array-dedupe');
module.exports = function(Attendancetimetablemaster) {
  Attendancetimetablemaster.addattendancemaster = function(data, cb) {
    Attendancetimetablemaster.upsert(data, (err, result) => {
      if (err) {
        cb(null, err);
      } else {
        cb(null, result);
      }
    });
  };

  Attendancetimetablemaster.remoteMethod("addattendancemaster", {
    http: { path: "/addattendancemaster", verb: "post" },
    description: "Add/Edit New add attendance  timetable master",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Attendancetimetablemaster.allattendancemasterlist = function(status, cb) {
    //let where_cond = {};

    Attendancetimetablemaster.find(
      {
        where: { status: status },
        include: [
          {
            relation: "get_section_info",
            scope: {
              fields: ["board_name"]
            }
          },
          {
            relation: "get_class_info",
            scope: {
              fields: ["class_name"]
            }
          },
          {
            relation: "get_school_info",
            scope: {
              fields: ["school_name"]
            }
          }
        ]
      },
      function(err, res) {
        let finalArr = [];
        res.forEach(function(element) {
          let finalObj = {};
          finalObj.addedDate = element.added_date;
          finalObj.id = element.id;

          if (element.get_section_info() != null) {
            finalObj.sectionName = element.get_section_info().board_name;
            // finalObj.sectionName = "";
          } else {
            finalObj.sectionName = "";
          }

          if (element.get_class_info() != null) {
            finalObj.className = element.get_class_info().class_name;
          } else {
            finalObj.className = "";
          }

          if (element.get_school_info() != null) {
            finalObj.schoolName = element.get_school_info().school_name;
          } else {
            finalObj.schoolName = "";
          }
          finalArr.push(finalObj);
        });

        if (err) {
          cb(null, err);
        }
        cb(null, finalArr);
      }
    );
  };

  Attendancetimetablemaster.remoteMethod("allattendancemasterlist", {
    http: { path: "/allattendancemasterlist", verb: "get" },
    description: "Get All all attendance master list",
    accepts: { arg: "status", type: "string", required: true },
    returns: { arg: "response", type: "json" }
  });

  Attendancetimetablemaster.allbatchplanlist = function(data, cb) {
    Attendancetimetablemaster.find(
      {
        where: { school_auto_id: data.school_id, status: "Active" },
        include: [
          { relation: "attendance_details", scope: { order: "id ASC" } },
          {
            relation: "section",
            scope: {
              include: [{ relation: "board" }]
            }
          }
        ]
      },
      function(err, result) {
        if (err) {
          return cb(null, err);
        } else {
          return cb(null, result);
        }
      }
    );
  };
  Attendancetimetablemaster.remoteMethod("allbatchplanlist", {
    http: { path: "/allbatchplanlist", verb: "post" },
    description: "allbatchplanlist",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });

  Attendancetimetablemaster.allbatchplandetail = function(data, cb) {
    Attendancetimetablemaster.find(
      {
        where: {
          school_auto_id: data.school_id,
          id: data.timetable_master_id,
          status: "Active"
        },
        include: [
          {
            relation: "attendance_details",
            scope: {
              order: "day ASC",
              include: [
                {
                  relation: "subject_info",
                  scope: {
                    include:{
                    relation:"subjects",
                    }
                  }
                },
                {
                  relation: "user_info",
                  scope: {
                    fields: ["id"],
                    include: {
                      relation: "user_belongs_to_staff",
                      scope: {
                        fields: ["name"]
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            relation: "section",
            scope: {
              include: [{ relation: "board" }]
            }
          }
        ]
      },
      function(err, result) {
        if (err) {
          return cb(null, err);
        } else {
        
          let finalArr = [];

          let setVal= 0;
          let SetPrimArr = {};
          let finalSetArr = {};
          result.forEach(function(element) {
            let SetPrimObj = {};
            let DaySet ='';

            // SetPrimObj.section_name = element.section().section_name;
            // SetPrimObj.stream_name = element.section().stream_name;
            // SetPrimObj.class_name = element.section().class_name;
            // SetPrimObj.section = element.section().section;
            // SetPrimObj.board_name = element.section().board().board_name;
      
            var attendanceDetails = element.attendance_details();
            attendanceDetails.forEach(function(elementAttendance) {
       
              let finalObj = {};

              finalObj.section_name = element.section().section_name;
              finalObj.stream_name = element.section().stream_name;
              finalObj.class_name = element.section().class_name;
              finalObj.section = element.section().section;
              finalObj.board_name = element.section().board().board_name;


              if (elementAttendance.day == 0) {
                DaySet = "Sunday"
              } else if (elementAttendance.day == 1) {
                DaySet ="Monday";
              } else if (elementAttendance.day == 2) {
                DaySet ="Tuesday";
              } else if (elementAttendance.day == 3) {
                DaySet ="WednesDay";
              } else if (elementAttendance.day == 4) {
                DaySet ="Thursday";
              } else if (elementAttendance.day == 5) {
                DaySet ="Friday";
              } else if (elementAttendance.day == 6) {
                DaySet ="Saturday";
              }

              finalObj.day = DaySet;
              finalObj.start_time = elementAttendance.start_time;
              finalObj.end_time = elementAttendance.end_time;
              finalObj.faculty_info = elementAttendance.user_info() ?elementAttendance.user_info().user_belongs_to_staff().name:"NA";
              // console.log(elementAttendance.subject_info().subjects().subject_name)
              finalObj.subject_name = elementAttendance.subject_info() ? elementAttendance.subject_info().subjects().subject_name:"Lunch Break";

              finalArr.push(finalObj);
              setVal=1;
            });

            // if(setVal>0){
            //   SetPrimArr.maininfo = SetPrimObj;
            //   finalArr.push(SetPrimArr);
            // }

          });
         // console.log(finalArr);
          return cb(null, finalArr);
        }
      }
    );
  };
  Attendancetimetablemaster.remoteMethod("allbatchplandetail", {
    http: { path: "/allbatchplandetail", verb: "post" },
    description: "allbatchplandetail",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });
  Attendancetimetablemaster.batchplanning = function(data, cb) {
    var UserSection = Attendancetimetablemaster.app.models.user_sections;
    var UserSubject = Attendancetimetablemaster.app.models.user_subject;
    var attendance_details = Attendancetimetablemaster.app.models.attendance_timetable_detail;

    // entry in attendance time table master
    //timetable master id attendance time table detail entry
    //entry in user section
    //entry in user subject
    var msg={}
    var promises = [];

    promises.push(new Promise((resolve, reject) => {

    var obj={
      "class_id":data.class_id,
      "section_id":data.section_id,
      "school_auto_id":data.school_auto_id,
      "status":data.status
    }
    Attendancetimetablemaster.findOne({
      where:{class_id:data.class_id,section_id:data.section_id,school_auto_id:data.school_auto_id,status:data.status}
    },function (errors,respo){
      if(errors){
        reject("failed")
      }
      if(!respo){
        Attendancetimetablemaster.create(obj,function(err,res){
          if(err){
          
          }
          if(res){
            data.days.forEach((key,value)=>{
              var i=0;
              // console.log(key)
              // console.log(value)
              if(key==true){
              data.batchPlanningPimetable.forEach(object=>{
    
                var attendanceDetails={
                  "day":value,
                  "timetable_master_id":res.id,
                  "period":object.lecher_type,
                  "subject":object.subject ? object.subject:0 ,
                  "faculty":object.teacher ? object.teacher:0,
                  "start_time":object.start_time,
                  "end_time":object.end_time,
                  "status":"1"
                }
             console.log(attendanceDetails);
                attendance_details.create(attendanceDetails)
               
              })
            }
        
            })
            resolve("success")
          }
    
        })
      }
      else{
        data.days.forEach((key,value)=>{
          var i=0;
          // console.log(key)
          // console.log(value)
          if(key==true){
          data.batchPlanningPimetable.forEach(object=>{

            var attendanceDetails={
              "day":value,
              "timetable_master_id":respo.id,
              "period":object.lecher_type,
              "subject":object.subject ? object.subject:0 ,
              "faculty":object.teacher ? object.teacher:0,
              "start_time":object.start_time,
              "end_time":object.end_time,
              "status":"1"
            }

            attendance_details.create(attendanceDetails)
           
          })
        }
    
        })
        resolve("success")
      }
    })

  }));
          promises.push(new Promise((resolve, reject) => {
    data.user_subjects.forEach(element=>{
   
      UserSubject.assignsubject(element,function(err,res){
      })
      })
      resolve("success")
    }))
    promises.push(new Promise((resolve, reject) => { 
      let user_section =  Dedupe(data.user_sections, ['userId']);
      user_section.forEach(element=>{

  UserSection.assignsection(element,function(err,res){

  })
})
resolve("success")
}));
Promise.all(promises).then(res => {

  msg.status = "200";
  msg.message = "Information inserted successfully";
  return cb(null, msg);
})  
  }
  Attendancetimetablemaster.remoteMethod("batchplanning", {
    http: { path: "/batchplanning", verb: "post" },
    description: "batchplanning",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });
  Attendancetimetablemaster.staffschedule = function(data, cb) {
    var weekday= new Date(data.date).getDay()


    Attendancetimetablemaster.find(
      {
        where: {
          school_auto_id: data.school_id,
       
          status: "Active"
        },
        include: [
          {
            relation: "attendance_details",
            scope: {
            where:{faculty:data.faculty,day:weekday},
              include: [
                {
                  relation: "subject_info",
                  scope: {
                    include:[{
                    relation:"subjects",
                    },{ relation:"class"}]
                  }
                }
            
              ]
            }
          },
          {
            relation: "section",
            scope:{
              include:[{
                relation:"board"
              }]
            }
          
          }
        ]
      },
      function(err, result) {
        if (err) {
          return cb(null, err);
        } else {
        
          var promises = [];

       
        result.forEach(element => {
          element.attendance_details().forEach(obj => {
            promises.push(new Promise((resolve, reject) => {
               Attendancetimetablemaster.find(
              {
                where: {
                  id: obj.timetable_master_id,
               
                  status: "Active"
                },
                include: [
                  {
                    relation: "attendance_details",
                    scope: {
                    where:{faculty:data.faculty,subject:obj.subject,start_time:obj.start_time },
                     
                    }
                  }
                ]
              },function(errrs,respo){
                var days=[]
                respo[0].attendance_details().forEach(eles => {
                  if(eles.day==0){
                  days.push("Sunday")
                }
                if(eles.day==1){
                  days.push("Monday")
                }

                if(eles.day==2){
                  days.push("Tuesday")
                }
                if(eles.day==3){
                  days.push("Wednesday")
                }
                if(eles.day==4){
                  days.push("Thursday")
                }
                if(eles.day==5){
                  days.push("Friday")
                }
                if(eles.day==6){
                  days.push("Saturday")
                }
  });
                var objects={
                  "batchId":element.section_id,
                  "batchName":element.section().section_name,
                  "className":element.section().class_name,
                  "classId":element.section().classId,
                  "subjectId":obj.subject_info().subjectId,
                  "lms_class_id":obj.subject_info().class().classId,
                  "subject_name":obj.subject_info().subjects().subject_name,
                  "start_time":obj.start_time,
                  "end_time":obj.end_time,
                  "days":days,
                  "batch_start_date":element.section().batch_start_date_id,
                  "lms_board_id":element.section().board().boardId
                }
                
                 resolve(objects)
              })
              
            }))
          })
        });
 
        Promise.all(promises).then(res => {
       
          return cb(null, res);
        }) 
        
        }
      }
    );
  };
  Attendancetimetablemaster.remoteMethod("staffschedule", {
    http: { path: "/staffschedule", verb: "post" },
    description: "staffschedule",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });




  Attendancetimetablemaster.studentschedule = function(data, cb) {
    var weekday= new Date(data.date).getDay()


    Attendancetimetablemaster.findOne(
      {
        where: {
          school_auto_id: data.school_id,
       
          status: "Active",
          section_id:data.section_id
        },
        include: [
          {
            relation: "attendance_details",
            scope: {
            where:{day:weekday},
              include: [
                {
                  relation: "subject_info",
                  scope: {
                    include:[{
                    relation:"subjects",
                    },{ relation:"class"}]
                  }
                },    {
                  relation: "user_info",
                  scope: {
                    fields: ["id"],
                    include: {
                      relation: "user_belongs_to_staff",
                      scope: {
                        fields: ["name"]
                      }
                    }
                  }
                }
            ,
            
              ]
            }
          },
          {
            relation: "section",
         
          
          }
        ]
      },
      function(err, result) {
        if (err) {
          return cb(null, err);
        }
        //  else {
        //   var finalArr=[]
        // result.forEach(element => {
        //   element.attendance_details().forEach(obj => {
        //     var objects={
        //       "batchId":element.section_id,
        //       "batchName":element.section().section_name,
        //       "className":element.section().class_name,
        //       "classId":element.section().classId,
        //       "subjectId":obj.subject_info().subjectId,
        //       "lms_class_id":obj.subject_info().class().classId,
        //       "subject_name":obj.subject_info().subjects().subject_name,
        //       "start_time":obj.start_time,
        //       "end_time":obj.end_time,
        //       "batch_start_date":element.section().batch_start_date_id,
        //       "lms_board_id":element.section().board().boardId
        //     }
        //      finalArr.push(objects)
        //   });
        // });
        //   return cb(null, finalArr);
        // }
        if(result){
          return cb(null, result);
        }
      }
    );
  };
  Attendancetimetablemaster.remoteMethod("studentschedule", {
    http: { path: "/studentschedule", verb: "post" },
    description: "studentschedule",
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "response", type: "json" }
  });
};
