'use strict';

module.exports = function (Classsubject) {

  Classsubject.assignsubject = function (data, cb) {
    Classsubject.upsert(data, function (err, response) {
      if (err) {
        var msg = '{"status":0,"message":"fail"}';
      } else {
        var msg = '{"status":1,"message":"success"}';
      }
      cb(null, msg);
    });
  }

  Classsubject.remoteMethod(
    'assignsubject', {
      http: {
        path: '/assignsubject',
        verb: 'post'
      },
      description: 'Assign Subject',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Classsubject.getsubjects = function (cb) {

    Classsubject.find(function (err, result) {
      if (err) {
        return cb(null, err);
      }
      return cb(null, result);
    });
  };

  Classsubject.remoteMethod(
    'getsubjects', {
      http: {
        path: '/getsubjects',
        verb: 'post'
      },
      description: 'Get notes',
      returns: {
        arg: 'response',
        type: 'array'
      }
    }
  );

  Classsubject.getassignedsubject = function (data, cb) {

    Classsubject.find({
      where: {
        "sectionId": data.section_id,
        "status": "Active",
        "subject_type": 'Main'
      },
    }, function (err, stdObj) {

      return cb(null, stdObj);
    });
  };

  Classsubject.remoteMethod(
    'getassignedsubject', {
      http: {
        path: '/getassignedsubject',
        verb: 'post'
      },
      description: 'Get assign by subject',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Classsubject.getclasssubjectid = (data, cb) => {
    Classsubject.findOne({
      where: {
        sectionId: data.section_id,
        subjectId: data.subject_id,
        schoolId: data.school_id,
        sessionId: data.session_id
      }
    }, (err, clasSubjectId) => {
      if (err) {
        return cb(null, err);
      } else {
        return cb(null, clasSubjectId);
      }
    });
  };

  Classsubject.remoteMethod(
    'getclasssubjectid', {
      http: {
        path: '/getclasssubjectid',
        verb: 'post'
      },
      description: 'Get class subject Id',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Classsubject.insertAssignSubject = function (data, cb) {
    var errorMessage = {};
    var successMessage = {};
    var sectionObj = Classsubject.app.models.section;
    sectionObj.find({
      where: {
        class_name: data.className
      }
    }, function (err, allclasssection) {
      if (err) {
        errorMessage.responseCode = "201";
        errorMessage.responseMessage = "Error";
        return cb(null, errorMessage, err);
      }
      if (allclasssection.length > 0) {
        for (var i in allclasssection) {

          var param = {
            "sectionId": allclasssection[i].id,
            "classId": allclasssection[i].classId,
            "subjectId": data.subjectId,
            "subject_type": data.subject_type,
            "sessionId": data.sessionId,
            "schoolId": data.schoolId,
            "status": "Active",
            "created_date": data.created_date,
            "subject_code": data.subject_code
          }

          Classsubject.upsert(param, function (err, res) {

          })
        }
        successMessage.responseCode = "200";
        successMessage.responseMessage = "Data Inserted Successfully";
        return cb(null, successMessage);
      } else {
        successMessage.responseCode = "200";
        successMessage.responseMessage = "No Data found";
        return cb(null, successMessage);
      }

    });
  }

  Classsubject.remoteMethod(
    'insertAssignSubject', {
      http: {
        path: '/insertAssignSubject',
        verb: 'post'
      },
      description: 'insert assign subject',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response_status',
        type: 'json'
      }, {
        arg: 'response',
        type: 'json'
      }]
    }
  );

  Classsubject.classsubjectList = function (data, cb) {
    Classsubject.find(data, function (err, result) {
      let res = {};
      if (err) {
        res.status = '201';
        res.message = err;
        return cb(null, res);
      }
      res.status = '200';
      res.message = 'Success';
      res.data = result;
      return cb(null, res);
    });
  };

  Classsubject.remoteMethod(
    'classsubjectList', {
      http: {
        path: '/classsubjectList',
        verb: 'post'
      },
      description: 'Get notes',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Classsubject.savedata = (data, cb) => {
    Classsubject.upsert(data, (err, res) => {
      let result = {};
      if (err) {
        result.status = '201';
        result.message = 'Fail'
        result.err_msg = err;
        cb(null, result);
      } else {
        result.status = '200';
        result.message = 'Success'
        result.data = res;
        cb(null, result);
      }
    });
  };

  Classsubject.remoteMethod('savedata', {
    http: {
      path: '/savedata',
      verb: 'post'
    },
    description: 'Save Class Subject Data',
    accepts: {
      arg: 'data',
      type: 'object',
      http: {
        source: 'body'
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  })


  Classsubject.updateclasssubjects = function (data, cb) {

    Classsubject.update(data.where, data.params, function (err, res) {
      let result = '';
      if (err) {
        result = {
          status: '201',
          message: 'Something went wrong',
          data: err
        };
        console.error("", result);
      } else {
        if (res.length > 0) {
          result = {
            status: '200',
            message: 'Success',
            data: res
          };
        } else {
          result = {
            status: '202',
            message: 'Fail',
            data: res
          };
        }
        cb(null, result);
      }
    });
  };

  Classsubject.remoteMethod(
    'updateclasssubjects', {
      http: {
        path: '/updateclasssubjects',
        verb: 'post'
      },
      description: 'Get Batch Details',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: [{
        arg: 'response',
        type: 'json'
      }]
    }
  );


/***Get All Subject by Section Id** */

Classsubject.getsubjectbysection = function(sectionId,sessionId, cb) {
  Classsubject.find(
    {

      where: { sectionId: sectionId,sessionId:sessionId },
      include:{
        relation: "subjects",
        fields: ["id", "subject_name"],
      }
    },
    function(err, result) {
     // console.log(element+"*--*-*-*-*-*-*-*-*-*-");

      let finalArr = [];
      result.forEach(function(element) {
        let finalObj = {};
        finalObj.subjectName        =  element.subjects().subject_name;
        finalObj.subjectId          =  element.subjects().id;
        finalObj.class_subjectId    =  element.id;
        finalObj.subjectId_class_subjectId    = element.subjects().id+"#"+element.id;

        finalArr.push(finalObj);
      })
      console.log(finalArr);
      if (err) {
        return cb(null, err);
      }
      return cb(null, finalArr);
    }
  );
};

Classsubject.remoteMethod("getsubjectbysection", {
  http: { path: "/getsubjectbysection", verb: "get" },
  description: "Get Subject by section Id",
  accepts: [
    { arg: "sectionId", type: "number", required: true },
    { arg: "sessionId", type: "number", required: true }
  ],
  returns: { arg: "response", type: "array" }
});

Classsubject.getclasssubjectdata = (data, cb) => {
  Classsubject.find({
    where: {
      sectionId: data.section_id,
      schoolId: data.school_id,
      sessionId: data.session_id
    }
  }, (err, clasSubjectId) => { console.log(clasSubjectId);
    if (err) {
      return cb(null, err);
    } else {
      return cb(null, clasSubjectId);
    }
  });
};

Classsubject.remoteMethod(
  'getclasssubjectdata', {
    http: {
      path: '/getclasssubjectdata',
      verb: 'post'
    },
    description: 'Get class subject Id',
    accepts: {
      arg: 'data',
      type: 'object',
      http: {
        source: 'body'
      }
    },
    returns: {
      arg: 'response',
      type: 'json'
    }
  }
);

};
