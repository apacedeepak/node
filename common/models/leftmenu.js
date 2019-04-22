'use strict';
var constantval = require('./constant');
module.exports = function(Leftmenu) {
    var userRoleType='User_Type_Role';
    Leftmenu.leftmenu = function (productType, schoolId, userType, cb) {
        Leftmenu.findOne({
            where: {product_type: productType},
        },function (err, res) {
            if(err){
                cb(null,err)
            }else{
                var myHrUrl=constantval.MYHR_API_URL;
                var myJSON = JSON.stringify(res);
                 
                res = myJSON.replace('/admin/admin', myHrUrl);
                res = JSON.parse(res);
                cb(null,res);
            }
            
        });
    };

    Leftmenu.remoteMethod(
        'leftmenu',
        {
            http: {path: '/leftmenu', verb: 'get'},
            description: 'Get menu ',
            accepts: [{arg: 'product_type', type: 'string', required: true}, {arg: 'school_id', type: 'number', required: false}, {arg: 'user_type', type: 'string', required: false}],
            returns: {arg: 'response', type: 'object'}
        }
    )

    Leftmenu.usertypelist = function (cb) {

        Leftmenu.findOne({
            where: {product_type: userRoleType},
        },function (err, res) {
            if(err) return err;
            if (res != null && res != undefined) {
                //res = res.toJSON();
                var userRoleArr = [];
                 var setValue =JSON.parse(res.json_value);
               
                for(let key in setValue){
                    userRoleArr.push(key)

                }                 
                cb(null, userRoleArr);   

            }

                      
        });
    }

    Leftmenu.remoteMethod(
        'usertypelist',
        {
            http: {path: '/usertypelist', verb: 'get'},
            description: 'Get menu ',
            accepts: [],
            returns: [{ arg: 'user_type', type: 'json' }]
        }
    )
    Leftmenu.userrolelist = function (cb) {
        Leftmenu.findOne({
            where: {product_type: userRoleType},
        },function (err, res) {
            if(err) return err;

            if (res != null && res != undefined) {
                var userRoleArr = [];
                var setValue =JSON.parse(res.json_value);                                
                cb(null, setValue);   
            }                      
        });
    };

    Leftmenu.remoteMethod(
        'userrolelist',
        {
            http: {path: '/userrolelist', verb: 'get'},
            description: 'Get menu ',
            accepts: [],
            returns: [{ arg: 'user_role', type: 'json' }]
        }
    );

    Leftmenu.createupdate = (param, cb) => {
        let messages = {};
        let productName = param.product_type;
        delete param.product_type;
        Leftmenu.upsertWithWhere({"product_type":productName},param,(err, response)=>{
            if(err){
                messages.status = "201";
                messages.message = "Error Occured";
                return cb(null, messages);
            }
            messages.status = "200";
            messages.message = "Record inserted successfully";
            cb(null, messages);
        });
    }

    Leftmenu.remoteMethod(
        "createupdate",
        {
            http: {path: '/createupdate', verb: 'post'},
            description: 'Get menu ',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' }},
            returns: [{ arg: 'response', type: 'json' }]
        }
    );


    Leftmenu.createleftmenu = function (req, cb) {
        var successMessage = {};
        Leftmenu.upsert(req, function (error, inserted) {
          if (error) {
            return cb(null, error);
          }
  
          successMessage.status = '200';
          successMessage.message = "Leftmenu Created Successfully";
          return cb(null, successMessage);
        })
      }
  
      Leftmenu.remoteMethod(
        'createleftmenu', { 
            http: { path: '/createleftmenu', verb: 'post' },
            description: 'Create Left Menu',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: [{ arg: 'response', type: 'json' }]
        }
      );

      Leftmenu.getproductwiseleftmenu = function (req, cb) {
        Leftmenu.findOne({
            where: {product_type: req.product_type},
        },function (err, res) {
            if(err){
                cb(null,err)
            }else{
                cb(null,res);
            }
        });
    };

    Leftmenu.remoteMethod(
        'getproductwiseleftmenu',
        {
            http: {path: '/getproductwiseleftmenu', verb: 'post'},
            description: 'Get menu ',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' }},
            returns: {arg: 'response', type: 'object'}
        }
    )

};
