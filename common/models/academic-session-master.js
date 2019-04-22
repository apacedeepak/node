'use strict';
var dateFormat = require('dateformat');
var DateDiff = require('date-diff');
module.exports = function (Academicsessionmaster) {
  Academicsessionmaster.addnewsession = function (data, cb) {
    Academicsessionmaster.upsert(data, function (err, res) {
      if (err) {
        let result = {
          status: '201',
          message: err,
          data: ''
        }
        cb(null, result);
      } else {

        var Session = Academicsessionmaster.app.models.session;
        var School = Academicsessionmaster.app.models.school;
        if(data.id){
          
          var update_session_object={
            "session_name": res.session_name,
                "start_date": res.start_date,
                "end_date": res.end_date,
                "status": res.status==1 ? "Active" :"Inactive"
          }
          Session.updateAll({where:{session_id:res.id}},update_session_object, function (err, session) {
            //let result = { status: '200', message: 'Session save successfully'}
            // cb(null, result);
            if(session){
            let result = { status: '200',message: 'session created successfully'}
            cb(null, result);
            }
          });
        }else{
        School.getallschoollist(function (err, resp) {
          if (resp) {
            resp.forEach(element => {
              var sessionObj = {
                "schoolId": element.id,
                "session_id": res.id,
                "session_name": res.session_name,
                "start_date": res.start_date,
                "end_date": res.end_date,
                "status": 'Inactive'
              };

              Session.upsert(sessionObj, function (err, session) {
                //let result = { status: '200', message: 'Session save successfully'}
                // cb(null, result);
              });
            });
          }  
          let result = { status: '200',message: 'session created successfully'}
          cb(null, result);
        });
      }
      }
    });
  };

  Academicsessionmaster.remoteMethod(
    'addnewsession', {
      http: {
        path: '/addnewsession',
        verb: 'post'
      },
      description: 'Add New Academic Session',
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


  Academicsessionmaster.list = function (data, cb) {
    Academicsessionmaster.find(data, (err, res) => {
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

  Academicsessionmaster.remoteMethod(
    'list', {
      http: {
        path: '/list',
        verb: 'post'
      },
      description: 'Get All Academic Session',
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

  Academicsessionmaster.getsessionrow = function (id, cb) {
    Academicsessionmaster.findOne({
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

  Academicsessionmaster.remoteMethod(
    'getsessionrow', {
      http: {
        path: '/getsessionrow',
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

  Academicsessionmaster.getsessiondata = function (params, cb) {
    //console.log(params); 
    let startDateStr = params.start_date;
    let endDateStr = params.end_date;
    let conditions = {
      where: {
        'start_date': startDateStr,
        'end_date': endDateStr
      }
    }

    Academicsessionmaster.findOne(conditions, function (err, res) {
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

  Academicsessionmaster.remoteMethod(
    'getsessiondata', {
      http: {
        path: '/getsessiondata',
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


  Academicsessionmaster.getactivefuturesession = function (cb) {
    var today = new Date();
    var currentDatess = dateFormat(today, "yyyy-mm-dd");

    Academicsessionmaster.find({
      where: {
        or: [{
            start_date: {
              gte: currentDatess
            }
          },
          {
            end_date: {
              gte: currentDatess
            }
          }
        ]
      },
    }, function (err, res) {
      if (err) {
        cb(null, err);
      }
      cb(null, res)
    });
  };

  Academicsessionmaster.remoteMethod(
    'getactivefuturesession', {
      http: {
        path: '/getactivefuturesession',
        verb: 'get'
      },
      description: 'Session list',
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );
  Academicsessionmaster.updatesession = function (data, cb) {

    var obj = {
      status: data.status
    }
    var obj2 = {
      status: "Active"
    }
    var objcts = {
      status: 0
    }
    var obj_inactive = {
      status: "Inactive"
    }
    var msg = {}
    Academicsessionmaster.update(objcts, function (err1, res1) {
      if (err1) {
        msg.status = "201"
        msg.message = "Error Occured in academic session master"
        cb(null, msg)
      }
      if (res1) {
        Academicsessionmaster.updateAll({
          id: data.id
        }, obj, function (err2, res2) {
          if (err2) {
            msg.status = "201"
            msg.message = "Error Occured in academic session master"
            cb(null, msg)
          }
          if (res2) {
            var Session = Academicsessionmaster.app.models.session;
            Session.updateAll(obj_inactive, function (err3, res3) {
              if (err3) {
                msg.status = "201"
                msg.message = "Error Occured in  session "
                cb(null, msg)
              }
              if (res3) {
                Session.updateAll({
                  session_id: data.id
                }, obj2, function (err4, res4) {
                  if (err4) {
                    console.log(err4)
                    msg.status = "201"
                    msg.message = "Error Occured in  session "
                    cb(null, msg)
                  }
                  if (res4) {
                    msg.status = "200"
                    msg.message = "Session Updated Successfully"
                    cb(null, msg)
                  }
                });
              }
            })
          };
        })
      }
    });
  }
  Academicsessionmaster.remoteMethod(
    'updatesession', {
      http: {
        path: '/updatesession',
        verb: 'post'
      },
      description: 'updatesession',
      accepts: {
        arg: 'data',
        type: 'object',
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'response_status',
        type: 'json'
      }
    }
  );

  Academicsessionmaster.getsessiondetails = function (params, cb) {
    Academicsessionmaster.find(params, function (err, res) {
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

  Academicsessionmaster.remoteMethod(
    'getsessiondetails', {
      http: {
        path: '/getsessiondetails',
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
  Academicsessionmaster.getacitvesession = function (params, cb) {
    Academicsessionmaster.findOne(
      {where:{status:1}}, function (err, res) {
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

  Academicsessionmaster.remoteMethod(
    'getacitvesession', {
      http: {
        path: '/getacitvesession',
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

};
