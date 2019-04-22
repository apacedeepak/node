'use strict';

module.exports = function (Lmsclasssubject) {

  Lmsclasssubject.savedata = function (data, cb) {
    Lmsclasssubject.upsert(data, function (err, res) {
      let result = {};
      if (err) {
        result.status = '201';
        result.message = 'Fail';
        result.data = [];
        cb(null, result)
      }
      result.status = '202';
      result.message = 'Success';
      result.data = res;
      cb(null, result)
    });
  };


  Lmsclasssubject.remoteMethod('savedata', {
    http: {
      path: '/savedata',
      verb: 'post'
    },
    description: 'Save Subject data',
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
  });

  Lmsclasssubject.classsubjectList = function (data, cb) {
    Lmsclasssubject.find(data, function (err, result) {
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

  Lmsclasssubject.remoteMethod(
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

  Lmsclasssubject.getlmssubjectlist = function (data, cb) {
    let boardObj = Lmsclasssubject.app.models.boards;
    


    Lmsclasssubject.find(data, function (err, result) {
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

  Lmsclasssubject.remoteMethod(
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

  Lmsclasssubject.getlmssubjectid = function (data, cb) {
    Lmsclasssubject.findOne({
    where:{classId:data.classId,subjectId:data.subjectId}
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

  Lmsclasssubject.remoteMethod(
    'getlmssubjectid', {
      http: {
        path: '/getlmssubjectid',
        verb: 'post'
      },
      description: 'Get lms subjectid',
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
