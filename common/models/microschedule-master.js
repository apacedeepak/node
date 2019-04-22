'use strict';
var dateFormat = require('dateformat');
module.exports = function (Microschedulemaster) {

  Microschedulemaster.save = function (data, cb) {
    Microschedulemaster.upsert(data, function (err, res) {
      if (err) {
        let result = {
          status: '201',
          message: err
        }
        cb(null, result);
      } else {
        let msg = 'Microschedule detail added successfully';
        if (data.id > 0) {
          msg = "Microschedule details updated successfully"
        }

        let result = {
          status: '200',
          message: msg,
          data: res
        }
        cb(null, result);
      }
    });
  };

  Microschedulemaster.remoteMethod(
    'save', {
      http: {
        path: '/save',
        verb: 'post'
      },
      description: 'Add New Room',
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

  Microschedulemaster.list = function (data, cb) {

    let conditions = [{
        relation: "sessionData",
        scope: {
          fields: ['session_name']
        }
      },
      {
        relation: "batchdateData",
        scope: {
          fields: ['batch_start_date']
        }
      },
      {
        relation: "coursemodeData",
        scope: {
          fields: ['course_mode_name']
        }
      },
      {
        relation: "boardData",
        scope: {
          fields: ['board_name']
        }
      },
      {
        relation: "classData",
        scope: {
          fields: ['class_name', 'class_code', 'class_order']
        }
      },
      {
        relation: "subjectData",
        scope: {
          fields: ['subject_name', 'subject_code', 'subject_order']
        }
      }
    ];

    let inputArr = {
      where: data,
      include: conditions,
      order: 'id DESC'
    }

    Microschedulemaster.find(inputArr, (err, res) => {
      //console.log(res);
      if (err) {
        let result = {
          status: '201',
          message: 'Something went wrong',
          data: err
        }
        cb(null, result);
      }

      let result = {
        status: '200',
        message: 'Success',
        data: res
      }
      cb(null, result);
    })
  }

  Microschedulemaster.remoteMethod(
    'list', {
      http: {
        path: '/list',
        verb: 'post'
      },
      description: 'Get All Records',
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

  Microschedulemaster.getrowdata = function (id, cb) {
    Microschedulemaster.findOne({
      where: { "id": id },
      include: [
        {
          relation: "classData",
          scope: {
            fields: ['class_name']
          }
        },
        {
          relation: "subjectData",
          scope: {
            fields: ['subject_name']
          }
        }
      ]

    }, function (err, res) {
      if (err) {
        cb(null, err);
      }
      cb(null, res)
    });
  }

  Microschedulemaster.remoteMethod(
    'getrowdata', {
      http: {
        path: '/getrowdata',
        verb: 'get'
      },
      description: 'Get Row by Id',
      accepts: {
        arg: 'id',
        type: 'number',
        required: true
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Microschedulemaster.getdata = function (params, cb) {

    Microschedulemaster.findOne(params, function (err, res) {
      if (err) {
        let result = {
          status: '201',
          message: 'Something went wrong'
        }
        cb(null, result);
      }

      if (res) {
        let result = {
          status: '200',
          message: 'Success',
          data: res
        }
        cb(null, result);
      } else {
        let result = {
          status: '202',
          message: 'Fail',
          data: res
        }
        cb(null, result);
      }
    });

  }

  Microschedulemaster.remoteMethod(
    'getdata', {
      http: {
        path: '/getdata',
        verb: 'post'
      },
      description: 'Get Data',
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
  Microschedulemaster.getdetailsbysubjectandclass = function (data, cb) {
    Microschedulemaster.find({
    where:{	lms_classId:data.class_id,lms_subjectId:data.subject_id,batch_start_date_id:data.batch_start_date_id}
    }, function (err, result) {
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
  }

  Microschedulemaster.remoteMethod(
    'getdetailsbysubjectandclass', {
      http: {
        path: '/getdetailsbysubjectandclass',
        verb: 'post'
      },
      description: 'getdetailsbysubjectandclass',
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

  Microschedulemaster.gettestdateslist = function (data, cb) {
    var msg={};
    if(!data.class_id){
      msg.status = '201';
      msg.message = "class Id cannot be blank";
      return cb(null, msg);
    }
    if(!data.batch_start_date_id){
      msg.status = '201';
      msg.message = "Batch Start Date Id cannot be blank";
      return cb(null, msg);
    }
    if(!data.course_mode_id){
      msg.status = '201';
      msg.message = "Course Mode Id cannot be blank";
      return cb(null, msg);
    }
    if(!data.board_id){
      msg.status = '201';
      msg.message = "Board Id cannot be blank";
      return cb(null, msg);
    }
    Microschedulemaster.find({
    where:{	lms_classId:data.class_id,batch_start_date_id:data.batch_start_date_id,course_mode_id:data.course_mode_id,lms_boardId:data.board_id},
      fields:[ 'test_date']
  }, function (err, result) {
    var arr=[]
      let res = {};
      if (err) {
        res.status = '201';
        res.message = err;
        return cb(null, res);
      }
      if(result.length==0){
        res.status = '200';
        res.message = 'No record Found';
        return cb(null, res);
      }
      if(result.length>0){
        result.forEach(element => {
          var obj={
           
            "test_date":dateFormat(element.test_date, "yyyy-mm-dd")
          }
          arr.push(obj)
     });
      return cb(null, arr);
      }
    });
  }

  Microschedulemaster.remoteMethod(
    'gettestdateslist', {
      http: {
        path: '/gettestdateslist',
        verb: 'post'
      },
      description: 'gettestdateslist',
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
  Microschedulemaster.getalltopiclist = function (data, cb) {
    var msg={};
    if(!data.class_id){
      msg.status = '201';
      msg.message = "class Id cannot be blank";
      return cb(null, msg);
    }
    if(!data.batch_start_date_id){
      msg.status = '201';
      msg.message = "Batch Start Date Id cannot be blank";
      return cb(null, msg);
    }
    if(!data.course_mode_id){
      msg.status = '201';
      msg.message = "Course Mode Id cannot be blank";
      return cb(null, msg);
    }
    if(!data.board_id){
      msg.status = '201';
      msg.message = "Board Id cannot be blank";
      return cb(null, msg);
    }
    if(!data.test_date){
      msg.status = '201';
      msg.message = "Test Date cannot be blank";
      return cb(null, msg);
    }
    
    Microschedulemaster.find({
    where:{	lms_classId:data.class_id,batch_start_date_id:data.batch_start_date_id,course_mode_id:data.course_mode_id,lms_boardId:data.board_id,
      and:
      [
          {test_date: {gte: dateFormat(data.test_date, "yyyy-mm-dd'T'00:00:00")}},
          {test_date: {lte: dateFormat(data.test_date, "yyyy-mm-dd'T'23:59:59")}},
      ],
    
    },
      fields:[ 'syllabus_data']
  }, function (err, result) {
      let res = {};
      if (err) {
        res.status = '201';
        res.message = "error occured";
        return cb(null, res);
      }
      if(result.length==0){
        res.status = '200';
        res.message = 'No record Found';
        return cb(null, res);
      }
      if(result.length>0){
        var arr=[];
        result.forEach(element => {
          // console.log(element)
          var parse=JSON.parse(element.syllabus_data)
           arr= arr.concat(parse)
        });
        //  console.log(arr)
      return cb(null, arr);
      }
    });
  }

  Microschedulemaster.remoteMethod(
    'getalltopiclist', {
      http: {
        path: '/getalltopiclist',
        verb: 'post'
      },
      description: 'getalltopiclist',
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


  Microschedulemaster.getsyllabuslist = function (req) {
    var conditions={};var response={};
    if(req.course_mode_id) conditions.course_mode_id=req.course_mode_id;
    if(req.board_id) conditions.board_id=req.board_id;
    if(req.class_id) conditions.class_id=req.class_id;
    if(req.batch_start_date_id) conditions.batch_start_date_id=req.batch_start_date_id;
    if(req.subject_id) conditions.subject_id=req.subject_id;
  
    return new Promise(function(resolve,reject){
      Microschedulemaster.find({
        where:conditions
       }, function (err, result) {
        if(err) {
          reject(err)
        } else {
          var res=[];
          result.forEach(element => {
            // console.log(element)
            var parse=JSON.parse(element.syllabus_data)
            res= res.concat(parse)
          });
          response.syllabus=res;
          resolve(response)
        } 
          
        });
    }) 
  
  }
 


  Microschedulemaster.getSyllabusCoverage = function (req, cb) {

    var promises = []; var response = {}, msg = {};
    
    var dppObj = Microschedulemaster.app.models.dpp;
    
    promises.push(Microschedulemaster.getsyllabuslist(req));
     promises.push(dppObj.getBatchCoverage(req));
   

    Promise.all(promises).then(function(res){ 
        response.status= "200",
        response.message="Success"
        response.data=res;
        return cb(null, response);
    }).catch(function(err){
        return cb(err, null);
    });

 }


 Microschedulemaster.remoteMethod(
  'getSyllabusCoverage', {
    http: { path: '/getsyllabuscoverage', verb: 'post' },
    description: 'getSyllabusCoverage', 
    accepts: { arg: 'data', type: 'object',http: {source: 'body' } },
    returns: { arg: 'response', type: 'json'}
     
  }
);



};
