'use strict';

module.exports = function (Centerroommaster) {

  Centerroommaster.save = function (data, cb) {
    Centerroommaster.upsert(data, function (err, res) {
      if (err) {
        let result = {
          status: '201',
          message: err
        }
        cb(null, result);
      } else {
        let msg = 'Room detail added successfully';
        if (data.id > 0) {
          msg = "Room details updated successfully"
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

  Centerroommaster.remoteMethod(
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

  Centerroommaster.list = function (data, cb) {
    Centerroommaster.find(data, (err, res) => {
      if (err) {
        let result = {
          status: '201',
          message: 'Something went wrong',
          data: ''
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

  Centerroommaster.remoteMethod(
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

  Centerroommaster.getrowdata = function (id, cb) {
    Centerroommaster.findOne({
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

  Centerroommaster.remoteMethod(
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

  Centerroommaster.getdata = function (params, cb) {
    //console.log(params); 
    //let startDateStr = params.start_date;
    //let endDateStr = params.end_date;
    //let conditions = { where: { 'start_date': startDateStr, 'end_date': endDateStr} }

    Centerroommaster.findOne(params, function (err, res) {
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

  Centerroommaster.remoteMethod(
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

};
