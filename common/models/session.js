'use strict';
var dateFormat = require('dateformat');
var DateDiff = require('date-diff');
module.exports = function (Session) {

  Session.createsession = function (data, cb) {
    Session.upsert(data, function (err, session) {
      if (err) {
        cb(null, err);
      } else {
        cb(null, session);
      }
    });

  };


  Session.sessionlist = function (cb) {
    Session.find({
      include: {
        relation: ['school_session']
      }
    }, function (err, session) {

      if (err) {
        cb(null, err);
      } else {
        cb(null, session);
      }
    });

  };


    Session.getallsession = function (req,cb) {
        var condition = {};
        if(req.schoolId){
            condition.schoolId = req.schoolId;
        }
        if(req.session_id){
          condition.session_id = req.session_id;
      }
        Session.find({
            include: {
              relation :"school_session"
            },
            where:condition

        },function (err, result) {
          
            if(err) {
              cb(null, err);
            } else {
              cb(null,result);
            }

                  
        });

  
  };

  Session.removesession = function (cb) {
    Session.destroyAll(function (err, result) {
      return cb(result);
    })
  };

  Session.remoteMethod(
    'createsession', {
      http: {
        path: '/createsession',
        verb: 'post'
      },
      description: 'Create Session',
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
  Session.remoteMethod(
    'editsession', {
      http: {
        path: '/editsession',
        verb: 'post'
      },
      description: 'Edit Session',
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
  Session.remoteMethod(
    'sessionlist', {
      http: {
        path: '/sessionlist',
        verb: 'post'
      },
      description: 'Session list',
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );
  Session.remoteMethod(
    'getallsession', {
      http: {
        path: '/getallsession',
        verb: 'post'
      },
      description: 'Get notes',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Session.remoteMethod(
    'removesession', {
      http: {
        path: '/removesession',
        verb: 'post'
      },
      description: 'Remove users',
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Session.getactivesession = function (cb) {
    Session.find({
      //fields: 'id',
      where: {
        "status": "Active"
      }
    }, function (err, res) {
      if (err) {
        cb(null, err);
      }
      cb(null, res)
    });
  }

  Session.remoteMethod(
    'getactivesession', {
      http: {
        path: '/getactivesession',
        verb: 'post'
      },
      description: 'Remove users',
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Session.getactiveschoolsession = function (schoolId, cb) {
    Session.findOne({
      where: {
        "status": "Active",
        "schoolId": schoolId
      }
    }, function (err, res) {
      if (err) {
        cb(null, err);
      }
      cb(null, res)
    });
  }

  Session.remoteMethod(
    'getactiveschoolsession', {
      http: {
        path: '/getactiveschoolsession',
        verb: 'get'
      },
      description: 'Get School Wise Active Session',
      accepts: {
        arg: 'school_id',
        type: 'number',
        required: true
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );
  Session.sessionfromerpsessionid = function (sessionId, cb) {
    Session.findOne({
      where: {
        session_id: sessionId
      }
    }, function (err, res) {
      if (err) {
        cb(null, err);
      }
      cb(null, res)
    });
  }

  Session.remoteMethod(
    'sessionfromerpsessionid', {
      http: {
        path: '/sessionfromerpsessionid',
        verb: 'get'
      },
      description: 'Get Erp Session Wise Session',
      accepts: {
        arg: 'erp_session_id',
        type: 'number',
        required: true
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Session.sessionfromsessionid = function (sessionId, cb) {
    Session.findOne({
      where: {
        id: sessionId
      }
    }, function (err, res) {
      if (err) {
        cb(null, err);
      }

      var obj = {
        schoolId: res.schoolId,
        session_id: res.session_id,
        session_name: res.session_name,
        start_date: dateFormat(res.start_date, "yyyy-mm-dd"),
        end_date: dateFormat(res.end_date, "yyyy-mm-dd"),
        status: res.status,
        id: res.id
      }
      cb(null, obj)
    });
  }

  Session.remoteMethod(
    'sessionfromsessionid', {
      http: {
        path: '/sessionfromsessionid',
        verb: 'get'
      },
      description: 'Get Session Wise Session',
      accepts: {
        arg: 'erp_session_id',
        type: 'number',
        required: true
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );

  Session.getdaysbtwactiveschoolsession = function (schoolId, cb) {
    Session.findOne({
      where: {
        "status": "Active",
        "schoolId": schoolId
      }
    }, function (err, res) {
      if (err) {
        cb(null, err);
      }
      let data = {};

      data.start_date = dateFormat(res.start_date, "yyyy-mm-dd");
      data.end_date = dateFormat(res.end_date, "yyyy-mm-dd");
      var date1 = new Date(data.start_date);
      var date2 = new Date(data.end_date);
      var currDate = new Date();
      currDate = dateFormat(currDate, "yyyy-mm-dd");
      var currDates = new Date(currDate);
      data.diffBtwSessionDates = new DateDiff(date2, date1).days();
      data.diffBtwStartToCurrent = new DateDiff(currDates, date1).days();

      cb(null, data)
    });
  }

  Session.editsession = function (data, cb) {
    if (data && data.schoolId) {
      let updatestatus = {
        status: 'Inactive'
      };
      Session.updateAll({
        schoolId: data.schoolId
      }, updatestatus, function (err, result) {
        if (err) {
          cb(null, err);
        } else {
          let updatestatus = {
            status: 'Active'
          };
          Session.update({
            session_id: data.session_id
          }, updatestatus, function (err, result) {
            if (err) {
              cb(null, err);
            } else {
              cb(null, 'success');
            }
          });

        }
      });
    } else if (data && !data.schoolId) {
      let updatestatus = {
        status: 'Inactive'
      };
      Session.update({
        session_id: data.session_id
      }, updatestatus, function (err, result) {
        if (err) {
          cb(null, err);
        } else {
          cb(null, 'success');
        }
      });
    }

  };

  Session.remoteMethod(
    'getdaysbtwactiveschoolsession', {
      http: {
        path: '/getdaysbtwactiveschoolsession',
        verb: 'get'
      },
      description: 'Get School Wise Active Session',
      accepts: {
        arg: 'school_id',
        type: 'number',
        required: true
      },
      returns: {
        arg: 'response',
        type: 'json'
      }
    }
  );
  Session.allsessionofacademicsession = function (data, cb) {
    Session.findOne({
      where:{id:data.id}},
    function(err,res){
    if(res){
      Session.find({where:{session_id:res.session_id,status:"Active"},fields:"id"},function(errs,resp){
        if(resp){
          var arr=[];
          resp.forEach(element => {
            arr.push(element.id)
          });
          cb(null,arr)
        }
      })
    }
    }
    )
  }
  Session.remoteMethod(
    'allsessionofacademicsession', {
      http: {
        path: '/allsessionofacademicsession',
        verb: 'post'
      },
      description: 'allsessionofacademicsession',
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
