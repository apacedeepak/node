'use strict';

var constantval = require('./constant');
var rp = require('request-promise');

module.exports = function(Parent) {
    
    var errorMessage = {};
    var successMessage = {};
Parent.addparent = function (data, cb) {
   Parent.create(data, function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });

    };


    Parent.parentlist = function (cb) {
        Parent.find(function (err, result) {
            if (err) {
                cb(null, err);
            } else {
                cb(null, result);
            }
        });

    };

    Parent.removeparents = function (cb) {
      Parent.destroyAll(function (err, result) {
          return cb(result);
      })
  };

  Parent.getparentbyid = (data, cb)=>{
    Parent.findById(data.id,(err, getParentDetails)=>{
        if(err){
          cb(null, err);
        }else{
          cb(null,getParentDetails);
        }
    });
  };


  Parent.getparentbyuserid = (data,cb)=>{
    var detail = {};

    Parent.findOne({
      where: {userId: data.user_id},
    },(err, parentDetail)=>{
        if(err){
          cb(null, err);
        }else{
           let studentModel = Parent.app.models.student;
           let param = {
             parent_id: parentDetail.id
           };

          detail.parent = parentDetail;

          studentModel.getstudentbyparentid(param,(err, getstudent)=>{
            detail.student = getstudent;
            cb(null, detail);
          });

        }
    });
  }

  Parent.updateparentrecord = function (data, cb) {
      let param = {};
       if(data.flag == 'mobile'){
          param.father_contact = data.updateData;
       }else if(data.flag == 'email'){
          param.father_email = data.updateData;
       }
        Parent.upsertWithWhere({userId : data.user_id} , param, function(err, data){
            cb(null, data);
        });

    }
      Parent.remoteMethod(
            'updateparentrecord',
            {
                http: {path: '/updateparentrecord', verb: 'post'},
                description: 'update parent record',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Parent.remoteMethod(
            'addparent',
            {
                http: {path: '/addparent', verb: 'post'},
                description: 'add Parent',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: {arg: 'response', type: 'json'}
            }
    );

    Parent.remoteMethod(
        'getparentbyuserid',
        {
            http: {path: '/getparentbyuserid', verb: 'post'},
            description: 'Get Parent Detail',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Parent.remoteMethod(
        'getparentbyid',
        {
            http: {path: '/getparentbyid', verb: 'post'},
            description: 'get parent by id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Parent.remoteMethod(
            'parentlist',
            {
                http: {path: '/parentlist', verb: 'post'},
                description: 'Parent list',
                returns: {arg: 'response', type: 'json'}
            }
    );

    Parent.remoteMethod(
      'removeparents',
      {
          http: {path: '/removeparents', verb: 'post'},
          description: 'Remove parents',
          returns: {arg: 'response', type: 'json'}
      }
);


   Parent.getidbyoldid = (data, cb) => {
       let msg = {};
       if(!data.parent_id){
           msg.status = '201';
           msg.message = 'Parent id cannot be null';
           cb(null, msg);
           return; 
       }
        Parent.findOne({
            where: {"old_parent_id": data.parent_id},
            order: 'id DESC',
        }, (err, res) => {
            if(err){
                msg.status = '201';
                msg.message = 'Error occurred';
                cb(null, msg);
                return;  
            }
            else if(res){
                let dataobj = {"id": res.id};
                msg.status = '200';
                msg.message = 'Information fetched successfully';
                cb(null, msg, dataobj);
            }
        });
   } 

   Parent.remoteMethod(
       'getidbyoldid',
       {
           http: { path:'/getidbyoldid', verb: 'post' },
           desciption: 'Get Id by old Id',
           accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
           returns: [{ arg: 'response_type', type: 'json'}, { arg: 'response', type: 'json'}]
       }
   ) 
   
   Parent.updateparentprofilerecord = function (data, cb) {
      let param = {};
      var userObj = Parent.app.models.user;
      if(!data){
          errorMessage.responseCode = "201";
          errorMessage.responseMessage = "No user_id, mobile, email found";
          return cb(null, errorMessage);
      }
      if(!data.token){
          errorMessage.responseCode = "201";
          errorMessage.responseMessage = "Token cannot be empty";
          return cb(null, errorMessage);
      }
      if(!data.user_id){
          errorMessage.responseCode = "201";
          errorMessage.responseMessage = "UserId cannot be empty";
          return cb(null, errorMessage);
      }
      if(!data.father_mobile && !data.father_email && !data.mother_mobile && !data.mother_email){
          errorMessage.responseCode = "201";
          errorMessage.responseMessage = "Mobile number and Email both cannot be empty";
          return cb(null, errorMessage);
      }
      
      if(data.father_mobile){
          param['father_contact'] = data.father_mobile;
      }
      if(data.father_email){
          param['father_email'] = data.father_email;
      }
      if(data.mother_mobile){
          param['mother_contact'] = data.mother_mobile;
      }
      if(data.mother_email){
          param['mother_email'] = data.mother_email;
      }
  
        
        Parent.upsertWithWhere({userId : data.user_id} , param, function(err, updatedData){
            if(err){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error Occur";
                return cb(null, errorMessage, err);
            }
             if(constantval.product_type.toLowerCase() != 'emscc'){
                    userObj.getuserbyid(data.user_id, (err,res)=>{
                  var options = {
                    method: 'post',
                     uri: constantval.LOCAL_URL+ '/'+constantval.PROJECT_NAME+'/erpapi/index/updateparentprofilerecord',
                     body: {
                            user_id_php: res.old_user_id,
                            father_contact: data.father_mobile,
                            father_email: data.father_email,
                            mother_contact: data.mother_mobile,
                            mother_email: data.mother_email,
                     },
                     json: true
                 };
                   rp(options)
                .then(function (response) {
                    //console.log(response)
                    successMessage.responseCode = '200';
                    successMessage.responseMessage = "Record updated";
                    return cb(null, successMessage, updatedData);
                }).catch(function(error){
                    errorMessage.status = "201";
                      errorMessage.message = "Error Occurred";
                      return cb(null, errorMessage);

                  })
                });
              }else{
                  successMessage.responseCode = '200';
                    successMessage.responseMessage = "Record updated";
                    return cb(null, successMessage, updatedData);
              }
        });

    }
      Parent.remoteMethod(
            'updateparentprofilerecord',
            {
                http: {path: '/updateparentprofilerecord', verb: 'post'},
                description: 'update parent record',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'json' }]
            }
    );

    Parent.deleteparent = (data, cb) => {
        Parent.destroyAll({id : data.id}, (err, result) => {
            if(result)
                return cb(null, "200", "Deleted successfully");
        })
    };

    Parent.remoteMethod('deleteparent', {
        http: {path: '/deleteparent', verb: 'post'},
        description: 'Delete parent',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'responseMessage', type: 'json' }]
    });
    
    
    Parent.updateprofileimage = function (ctx, options, cb) {
        var FileUpload = Parent.app.models.fileupload;
        var userObj = Parent.app.models.user;
        FileUpload.fileupload(ctx, options, 'profileimage', function (error, data) {
            if(error){
                errorMessage.responseCode = "201";
                errorMessage.responseMessage = "Error to upload file";
                var finalResponse = {
                    path : constantval.PROJECT_NAME+'/'+data.file_path[0],
                    sucessResponse : errorMessage,
                }
                
                return cb(null, finalResponse);
            }
            
             Parent.upsertWithWhere({userId : data.user_id} , {father_photo: data.file_path}, function(err, updatedData){
                if(err){
                    errorMessage.responseCode = "201";
                    errorMessage.responseMessage = "Error Occur";
                    var finalResponse = {
                        path : constantval.PROJECT_NAME+'/'+data.file_path[0],
                        sucessResponse : errorMessage,
                    }
                    return cb(null, finalResponse);
                }
                if(constantval.product_type.toLowerCase() != 'emscc'){
                    userObj.getuserbyid(data.user_id, (err,res)=>{
                  var options = {
                    method: 'post',
                     uri: constantval.LOCAL_URL+ '/'+constantval.PROJECT_NAME+'/erpapi/index/changeprofileimage',
                     body: {
                            user_id_php: res.old_user_id,
                            filepath: data.file_path,
                            session_id: data.session_id
                     },
                     json: true
                 };
                   rp(options)
                .then(function (response) {
                    
                    //console.log(response)
                    successMessage.responseCode = '200';
                    successMessage.responseMessage = "Record updated";
                    
                    var finalResponse = {
                        path : constantval.PROJECT_NAME+'/'+data.file_path[0],
                        sucessResponse : successMessage,
                    }
                    
                    return cb(null, finalResponse);
                }).catch(function(error){
                    
                    errorMessage.status = "201";
                      errorMessage.message = "Error Occurred";
                      
                      var finalResponse = {
                        path : '',
                        sucessResponse : errorMessage,
                    }
                      return cb(null, finalResponse);

                  })
                });
              }else{
                  successMessage.responseCode = '200';
                    successMessage.responseMessage = "Record updated";
                    var finalResponse = {
                        path : constantval.PROJECT_NAME+'/'+data.file_path[0],
                        sucessResponse : successMessage,
                    }
                    return cb(null, finalResponse);
              }
            });
        });
    }
    
    Parent.remoteMethod(
            'updateprofileimage',
            {

                accepts: [
                    {arg: 'ctx', type: 'object', http: {source: 'context'}},
                    {arg: 'options', type: 'object', http: {source: 'query'}},
                ],
                returns: {
                    arg: 'fileObject', type: 'object', root: true
                },
                http: {verb: 'post'}
            }
    );

    Parent.checkparentrow = (data, cb) => {
        if(!data) return cb(null, { status: "201", message: "Bad Request" });
        else if(!data.user_id) return cb(null, { status: "201", message: "User Id cannot be blank" });
        Parent.find({
            fields: "id",
            where: { "userId" : data.user_id } 
        }, 
        (err, result) => {
            if(err) throw err;
            if(result){
                cb(null, { status: "200", message: "Information fetched successfully" }, { "id": result } );
            }
        })
    }

    Parent.remoteMethod(
        'checkparentrow',
        {
            http: {path: '/checkparentrow', verb: 'post'},
            description: 'Check parent row',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: "response", type: "json"}]
        }
    );


    Parent.checkparentbyoldid = (data, cb) => {
        if(!data) return cb(null, { status: "201", message: "Bad Request" });
        else if(!data.old_parent_id) return cb(null, { status: "201", message: "Parent Id cannot be blank" });
        Parent.find({
            fields: "id",
            where: { "old_parent_id" : data.old_parent_id } 
        }, 
        (err, result) => {
            if(err) throw err;
            if(result){
                cb(null, { status: "200", message: "Information fetched successfully" }, { "id": result } );
            }
        })
    }

    Parent.remoteMethod(
        'checkparentbyoldid',
        {
            http: {path: '/checkparentbyoldid', verb: 'post'},
            description: 'Check parent by old id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: "response", type: "json"}]
        }
    );

    Parent.updteparentprime = (data, cb) => {
        if(!data){
            cb(null, {status: "201", message: "Bad Request"})
            return;
        }
        else if(!data.oldparentId){
            cb(null, {status: "201", message: "Old parent Id cannot blank"})
            return;
        }
        else if(!data.primeid){
            cb(null, {status: "201", message: "Parent primary id cannot be blank"});
            return;
        }

        Parent.updateAll({id: data.primeid}, {old_parent_id: data.oldparentId}, (err, res) => {
            if(err) throw err;
            if(res){
                cb(null, {status: "200", message: "updated successfully"});
                return;
            }
        });

    }

    Parent.remoteMethod('updteparentprime', {  
        http: {path: '/updteparentprime', verb: 'post'},
        description: 'update parent prime id',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{ arg: 'responseCode', type: 'json' }, { arg: 'responseMessage', type: 'json' }]
    });


    Parent.parentbyid = (data, cb) => {
        if(!data) return cb(null, { status: "201", message: "Bad Request" });
        else if(!data.id) return cb(null, { status: "201", message: "Id cannot be blank" });
        Parent.find({
            where: { "id" : data.id } 
        }, 
        (err, result) => {
            if(err) throw err;
            if(result){
                cb(null, { status: "200", message: "Information fetched successfully" }, result );
            }
        })
    }

    Parent.remoteMethod(
        'parentbyid',
        {
            http: {path: '/parentbyid', verb: 'post'},
            description: 'Get parent by id',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: "response", type: "json"}]
        }
    );

    Parent.parentprofile = (data, cb) => {
        var msg = {};
        if(!data){
            msg.status_code = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        }
        else if(!data.school_id){
            msg.status_code = "201";
            msg.message = "School Id cannot be blank";
            return cb(null, msg);
        } 
        else if(!data.user_id){
            msg.status_code = "201";
            msg.message = "User Id cannot be blank";
            return cb(null, msg);
        }
        var Student = Parent.app.models.student;
        var user = Parent.app.models.user;

        user.find(
            {
                where:{ id:data.user_id},
                order: ["id DESC"],
                limit: 1
            },
            (err,resp)=>{
                if(err){
                    console.log("The error occured ", err);
                    return;
                }
                if(resp.length > 0){
                    var user_type = resp[0].user_type.toLowerCase();
                    switch(user_type) {
                        case 'student':{
                      
                            Student.find({
                               
                                where: {schoolId: data.school_id, userId: data.user_id},
                                order: ["id DESC"],
                                limit: 1
                            }, (err, res) => { 
                            if(err){
                                console.log("The error occured ", err);
                                return;
                            }
                            if(res){ 
                      
                                var parent_id  = (res.length >0)? res[0].parentId: null;
                               
                                if(parent_id){
                                    Parent.parentinfo(data.school_id, parent_id).then(res=>{
                                        msg.status_code = "200";
                                        msg.message = "Information fetched successfully";
                                        return cb(null, msg, res);
                                    }).catch(err=> console.log(err))
                                }else{
                                    msg.status_code = "201";
                                    msg.message = "some error";
                                    return cb(null, msg);
                                }
                                
                                }
                            })
                            break;
                        }
                        case 'parent':{
                            Parent.find({
                                where: {schoolId: data.school_id, userId: data.user_id},
                                order: ["id DESC"],
                                limit: 1
                            }, (err, res) => { 
                            if(err){
                                console.log("The error occured ", err);
                                return;
                            }
                            if(res){ 
                                msg.status_code = "200";
                                msg.message = "Information fetched successfully";
                                return cb(null, msg, res);
                                }
                            })
                            break;
                        }
                        default:{
                            if(res){ 
                                msg.status_code = "201";
                                msg.message = "some error";
                                return cb(null, msg);
                            }
                        }
                    } 
                }else{

                }
            }
        )
    }

    Parent.parentinfo = (school_id, parent_id) => {
        return new Promise((resolve, reject)=>{
            if(!parent_id || !school_id) reject("id cannot be empty");
            Parent.find({
                where: {schoolId: school_id, id: parent_id},
                order: ["id DESC"],
                limit: 1  
            }, (err, res)=>{ 
                if(err) reject(err);
                if(res) resolve(res)
            })  
        })
        
    }

    Parent.remoteMethod(
        'parentprofile',
        {
            http: {path: '/parentprofile', verb: 'post'},
            description: 'Parent profile',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );

    Parent.updateschoolid = function (req, cb) {
        var msg = {};
     
    
    var obj={
   
    "schoolId":req.schoolId
    }
    
    Parent.upsertWithWhere({userId: req.userId}, obj, function (err, data) {
            if (err)
            {
                throw(err);
            }
            msg.status = "200";
            msg.message = "data added successfully";
            cb(null, msg, data);
    
    });
    }
    Parent.remoteMethod(
            'updateschoolid',
            {
                http: {path: '/updateschoolid', verb: 'post'},
                description: 'updateschoolid',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
}; 
