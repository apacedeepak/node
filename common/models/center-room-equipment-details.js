'use strict';

module.exports = function (Centerroomequipmentdetails) {

  Centerroomequipmentdetails.save = function (data, cb) {
    Centerroomequipmentdetails.upsert(data, function (err, res) {
      if (err) {
        let result = {
          status: '201',
          message: err,
          data: null
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

  Centerroomequipmentdetails.remoteMethod(
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

  Centerroomequipmentdetails.list = function (data, cb) {
    Centerroomequipmentdetails.find(data, (err, res) => {
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

  Centerroomequipmentdetails.remoteMethod(
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

  Centerroomequipmentdetails.getrowdata = function (id, cb) {
    Centerroomequipmentdetails.findOne({
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

  Centerroomequipmentdetails.remoteMethod(
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

  Centerroomequipmentdetails.getdata = function (params, cb) {
    Centerroomequipmentdetails.find(params, function (err, res) {
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

  Centerroomequipmentdetails.remoteMethod(
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

  Centerroomequipmentdetails.updatedetails = function (data, cb) {

    let whereData = data.whereConditons; //{ where: {'room_id': 3 } };
    let updateData = data.updateParams;
  Centerroomequipmentdetails.update(whereData, updateData, function (err, res) {
      if (err) {
        let result = {
          status: '201',
          message: err,
          data: ''
        }
        cb(null, result);

      } else {
        let msg = 'Equpment detail updated successfully';
        let result = {
          status: '200',
          message: msg,
          data: res
        }
        cb(null, result);
      }
    });
  };

  Centerroomequipmentdetails.remoteMethod(
    'updatedetails', {
      http: {
        path: '/updatedetails',
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

};
