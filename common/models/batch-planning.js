"use strict";

module.exports = function(Batchplanning) {
  //boards/boards_getactiveboard

  Batchplanning.addbatchplanmaster = function (data, cb) {
    Batchplanning.upsert(data, function (err, response) {
      if (err) {
        var msg = '{"status":0,"message":"fail"}';
      } else {
        var msg = '{"status":1,"message":"success"}';
      }
      cb(null, msg);
    });
  }

  Batchplanning.remoteMethod(
    'addbatchplanmaster', {
      http: {
        path: '/addbatchplanmaster',
        verb: 'post'
      },
      description: 'Assign Batch',
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


  Batchplanning.allbatchplanelist = function(status,cb){
    //let where_cond = {};

    Batchplanning.find(
      {
        where: { status: status },
        include:[
          {
            relation: "get_boards_info",
            scope: {
              fields: ["board_name"]
            }
          },{
            relation: "get_class_info",
            scope: {
              fields: ["class_name"]
            }
          },
          {
            relation:"get_section_info",
            scope:{
              fields: ["section"]
            }
          }
        ]
      },
      function(err, res) {
        /********** */
        let finalArr = [];
        res.forEach(function(element) {
          let finalObj = {};
          finalObj.addedDate =element.created_date;
          finalObj.id =element.id;

          if (element.get_section_info() != null) {
           finalObj.sectionName = element.get_section_info().section;
          } else {
            finalObj.sectionName = "";
          }

          if (element.get_class_info() != null) {
            finalObj.className = element.get_class_info().class_name;
          } else {
            finalObj.className = "";
          }

          if (element.get_boards_info() != null) {
            finalObj.courseName = element.get_boards_info().board_name;
          } else {
            finalObj.courseName = "";
          }
          finalArr.push(finalObj);

        });
        /*** */

        if (err) {
          cb(null, err);
        }
        cb(null, finalArr);
      }
    );
  }


  Batchplanning.remoteMethod("allbatchplanelist", {
    http: { path: "/allbatchplanelist", verb: "get" },
    description: "Get All all batch plane list",
    accepts:  { arg: "status", type: "string", required: true },
    returns: { arg: "response", type: "json" }
  });






};
