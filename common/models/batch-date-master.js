'use strict';
var dateFormat = require('dateformat');
module.exports = function (Batchdatemaster) {
  Batchdatemaster.save = function (data, cb) {
    Batchdatemaster.upsert(data, function (err, res) {
      if (err) {
        let res = {
          status: '201',
          message: err
        }
        cb(null, err);
      } else {
        let res = {
          status: '200',
          message: 'Session save successfully'
        }
        cb(null, res);
      }
    });
  };

  Batchdatemaster.remoteMethod(
    'save', {
      http: {
        path: '/save',
        verb: 'post'
      },
      description: 'Add New Batch Start Date',
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

  Batchdatemaster.list = function (data, cb) {
    Batchdatemaster.find(data, (err, res) => {
      if (err) {
        let result = {
          status: '201',
          message: 'Something went wrong'
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

  Batchdatemaster.remoteMethod(
    'list', {
      http: {
        path: '/list',
        verb: 'post'
      },
      description: 'Get All Batch Start Date',
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

  Batchdatemaster.getbatchstartrow = function (id, cb) {
    Batchdatemaster.findOne({
      where: {
        "id": id
      }
    }, function (err, res) {
      if (err) {
        cb(null, err);
      }
      cb(null, res)
    });
  }

  Batchdatemaster.remoteMethod(
    'getbatchstartrow', {
      http: {
        path: '/getbatchstartrow',
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

  Batchdatemaster.batchlist = function (params, cb) {

    var sql = "SELECT bdm.*, asm.session_name, asm.start_date, asm.end_date FROM batch_date_master as bdm";
    sql += " INNER JOIN academic_session_master as asm ON bdm.session_id = asm.id AND asm.status=1";
    //sql += " WHERE  bdm.status=1 order by bdm.id DESC";

    var ds = Batchdatemaster.dataSource;
    ds.connector.query(sql, params.arr, function (err, res) {

      if (err) {
        let result = {
          status: '201',
          message: 'Something went wrong'
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

  Batchdatemaster.remoteMethod(
    'batchlist', {
      http: {
        path: '/batchlist',
        verb: 'post'
      },
      description: 'Get All Batch Start Date',
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

  Batchdatemaster.getbatchdata = function (params, cb) {
    //console.log(params); 
    let sessionId = params.session_id;
    let batchStartDate = params.batch_start_date;
    let conditions = {
      where: {
        'session_id': sessionId,
        'batch_start_date': batchStartDate
      }
    }

    Batchdatemaster.findOne(conditions, function (err, res) {
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
          message: 'Fail'
        }
        cb(null, result);
      }
    });

  }

  Batchdatemaster.remoteMethod(
    'getbatchdata', {
      http: {
        path: '/getbatchdata',
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


  Batchdatemaster.sessionactivebatchstartdates = function (data, cb) {
    let sessionObj = Batchdatemaster.app.models.academic_session_master;
 
    
      sessionObj.getacitvesession({}, (err, sessionData) => {
        if (sessionData) {
      
    
 
          Batchdatemaster.find({where:{session_id:sessionData.data.id,status:1},
            fields:['id','batch_start_date']
          } , (err, res) => {
            if (err) {
              let result = {
                status: '201',
                message: 'Something went wrong'
              }
              cb(null, result);
            }
            if(res.length==0){
             
                let result = {
                  status: '200',
                  message: 'No Record Found'
                }
                cb(null, result);
            }
            if(res.length>0){
           var arr=[];
             res.forEach(element => {
                var obj={
                  "batch_start_date_id":element.id,
                  "batch_start_date":dateFormat(element.batch_start_date, "yyyy-mm-dd")
                }
                arr.push(obj)
             });
         
            cb(null, arr);
            }
          });

        } 
      });
    
  }

  Batchdatemaster.remoteMethod(
    'sessionactivebatchstartdates', {
      http: {
        path: '/sessionactivebatchstartdates',
        verb: 'post'
      },
      description: 'Get All Batch Start Date',
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



  Batchdatemaster.sessionbatchstartdates = function (data, cb) {
    let sessionObj = Batchdatemaster.app.models.session;
    let sessionId = data.session_id;
    if (sessionId > 0) {
      sessionObj.sessionfromsessionid(sessionId, (err, sessionData) => {
        if (sessionData) {
          let batchDateInputs = {
            where: {
              session_id: sessionData.session_id,
              status: '1'
            }
          };
          Batchdatemaster.find(batchDateInputs, (err, res) => {
            if (err) {
              let result = {
                status: '201',
                message: 'Something went wrong'
              }
              cb(null, result);
            }
            
            let result = {
              status: '200',
              message: 'Success',
              data: res
            }
            cb(null, result);
          });

        } else {
          let result = {
            status: '202',
            message: 'Something went wrong'
          }
          cb(null, result);
        }
      });
    } else { 
      let result = {
        status: '203',
        message: 'Something went wrong'
      }
      cb(null, result);
    }
  }

  Batchdatemaster.remoteMethod(
    'sessionbatchstartdates', {
      http: {
        path: '/sessionbatchstartdates',
        verb: 'post'
      },
      description: 'Get All Batch Start Date',
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
