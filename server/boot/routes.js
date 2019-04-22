
'use strict';
var constantval = require('../../common/models/constant');

module.exports = function(server) {
      var router = server.loopback.Router();
      var App = require("../../server/server");

      router.post('/api/student_attendances/attendance', function(req, res) {
        var attendanceObj = App.models.student_subject_attendance;
        attendanceObj.subjectattendance(req.body, function(err,msg,resp){
         var obj = {
            "response_status": msg,
            "response": resp
          }
        res.send(obj);
        });
      });  
      server.use(router);
};

