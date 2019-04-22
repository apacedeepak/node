'use strict';
var dateFormat = require('dateformat');

module.exports = function(Ctpconfiguration) {
    /* API for CTP Configuration */
    
    Ctpconfiguration.configuration = function (data, cb) {
        var errorMessage = {};
        var successMessage = {};

        if(!data) {
            return cb(null, {status: "201", message: "Bad Request"})
        }  
        let whereobj = {}

        if(data.school_id && data.tag){
            whereobj = { tag: data.tag, schoolId: data.school_id, status:'Active' }
        }
        else if(data.school_id && !data.tag){
            return cb(null, {status: "201", message: "Tag cannot be empty"})
        }  
        else if(!data.school_id && data.tag){
            return cb(null, {status: "201", message: "School Id cannot be empty"})
        }else{
            whereobj = { status:'Active' }  
        }    

        Ctpconfiguration.find({
            fields:["id", "tag", "value", "date", "description", "status"],
            where: whereobj
        }, (err, configuration) => { 
            if(err) 
                return console.log(err);
            var detailArr = [];    
            if(configuration){
                if(!data.tag && !data.school_id){
                    configuration.forEach(config => {
                        var configDate = ""
                        if(config.date)
                            configDate = dateFormat(config.date, "yyyy-mm-dd");

                        if(config.tag == 'MASTER_FEATURE')
                            config.value = (typeof config.value == 'string') ? JSON.parse(config.value) : config.value        
                           
                        
                        detailArr.push({
                            'id': config.id,
                            'tag': config.tag,
                            'value': config.value,
                            'date': configDate,
                            'description': config.description
                        });
                    });
                    successMessage.status = '200';
                    successMessage.message = "Information Fetched Successfully.";
                    return cb(null, successMessage, detailArr);
                }
                else{
                    let ret = {};
                    if(configuration.length > 0){
                        if(configuration[0].value){
                            ret = (typeof configuration[0].value == 'string') ? JSON.parse(configuration[0].value) : configuration[0].value    
                        }
                    }
                    return cb(null, {status: "200", message: "Information fetched successfully"}, ret);
                }
                
            }else{
                return cb(null, {status: "201", message: "No Record Found"});
            }
        });
    };

    Ctpconfiguration.remoteMethod(
        'configuration',
        {
            http: {verb: 'post'},
            description: 'API for ctp Configuration',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'},{arg: 'response', type: 'json'}]
        }
    );
    
    /** get ctp configuration by tag **/
    Ctpconfiguration.getconfigurationbytag = function (tag, cb) {
        
        Ctpconfiguration.findOne({
            fields:["id","tag", "value", "date", "description"],
            where: {tag: tag, status:'Active'}
        }, function (err, configuration) {
            if(err)return cb(err);
            
            if(configuration){
                return cb(null, configuration);
            }else{
                return cb(null, "No Record Found");
            }
        });
    };
    
    Ctpconfiguration.remoteMethod(
        'getconfigurationbytag',
        {
            http: {verb: 'get'},
            description: 'Get Configuration By Tag',
            accepts: [{arg: 'tag', type: 'string', required:true}],
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    
    /** ping API **/
    Ctpconfiguration.ping = function (cb) {
        var detail = {};
        detail.live = 1;
        var now = new Date();
        var today = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
        detail.today_date = today;
        cb(null, detail);
    };
    
    Ctpconfiguration.remoteMethod(
        'ping',
        {
            http: {path: '/ping', verb: 'get'},
            description: 'Ping API',
            returns: [{arg: 'response', type: 'json'}]
        }
    );

    Ctpconfiguration.setconfig = function(data, cb){  
        if(!data) return cb(null, {esponse_status: "201", response: "Invalid data"});
        Ctpconfiguration.create(data, function (err, res) { 
            if(err) { return console.log(err) }
            return cb(null, {response_status: "200", response: "Record Inserted successfully"});
        }) 
    }

    Ctpconfiguration.remoteMethod(
        'setconfig',
        {
            http: {path: '/setconfig', verb: 'post'},
            description: 'Set config',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
);

Ctpconfiguration.getconfiguration = function (data, cb) {
    if(!data) {
        return cb(null, {status: "201", message: "Bad Request"})
    } 
    else if(!data.tag) {
        return cb(null, {status: "201", message: "Tag cannot be empty"})
    }    
    let whereobj = { tag: data.tag, status:'Active' }
    if(data.school_id){
        whereobj = { tag: data.tag, schoolId: data.school_id, status:'Active' }
    }

    Ctpconfiguration.find({
        fields:["value"],
        where: whereobj,
        order: "id DESC",
        limit: 1
    }, function (err, configuration) { 
        if(err) 
            return console.log(err);
        if(configuration){
            let ret = {};
            if(configuration.length > 0){
                if(configuration[0].value){
                    ret = JSON.parse(configuration[0].value)    
                }
            }
            
            return cb(null, {status: "200", message: "Information fetched successfully"}, ret);
        }else{
            return cb(null, {status: "201", message: "No Record Found"});
        }
    });
};

Ctpconfiguration.remoteMethod(
    'getconfiguration',
    {
        http: {verb: 'post'},
        description: 'Get Configuration',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: [{arg: 'response_status', type: 'json'}, {arg: "response", type: "json"}]
    }
);

    Ctpconfiguration.updateconfig = function(data, cb){  
        if(!data) return cb(null, {esponse_status: "201", response: "Invalid data"});
        Ctpconfiguration.upsert(data, function (err, res) { 
            if(err) { return console.log(err) }
            return cb(null, {response_status: "200", response: "Record Updated successfully"});
        }) 
    }

    Ctpconfiguration.remoteMethod(
        'updateconfig',
        {
            http: {path: '/updateconfig', verb: 'post'},
            description: 'Set config',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );
    Ctpconfiguration.insertcontactho = function (req, cb) {
        var msg = {};
        Ctpconfiguration.find(
            {     
            where:{tag: 'Contact Head Office',status:"Active"
               
            },

   
             } ,
             (error, resp) => {
                
                if(error)
                {
                    msg.status = "201";
                    msg.message = "Error Occured";
                return cb(null,msg);
                }
                
                if(resp.length>0){
                    msg.status = "201";
                    msg.message = "Ho Address Already Exist";
                let responsearr=[];
              
                 cb(null,msg);
                }
                else{

                      
        var now = new Date();
        var obj={
            'tag' : 'Contact Head Office',
            'value' :  req,
            'date' : now,
            
        }

    
        Ctpconfiguration.upsert(obj, function (err, res) {
            if (err)
                throw(err);

            msg.status = "200";
            msg.message = "Ho Address added successfully";
            cb(null, msg, res);

    });}
}  )  
}
Ctpconfiguration.remoteMethod(
            'insertcontactho',
            {
                http: {path: '/insertcontactho', verb: 'post'},
                description: 'Add contact details',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
            }
    );
    Ctpconfiguration.gethocontactdetails = function (req, cb) {
     
        // return;
        let successMessageTotal = {};
     
       
        let errorMessageTotal = {};
       
    
        Ctpconfiguration.findOne(
            {     
            where:{tag: req.tag,status:"Active"
               
            },

   
             } ,
             (error, resp) => {
                
                if(error)
                {
                    errorMessageTotal.status = "201";
                    errorMessageTotal.message = "Error Occured";
                return cb(null,errorMessageTotal);
                }

                successMessageTotal.status = "200";
                successMessageTotal.message = "Information fetched successfully";
                let responsearr=[];
              
                return cb(null,successMessageTotal,resp);
               }  )      

                        
                    
                          
        }
        Ctpconfiguration.remoteMethod(
        'gethocontactdetails',
        {
            http: {path: '/gethocontactdetails',verb: 'post'},
            description: 'get all contacts',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
        });
        Ctpconfiguration.updatecontact = function (req, cb) {
            var msg = {};
        
    var obj={
       'value': req
    }
        
    Ctpconfiguration.upsertWithWhere({tag: 'Contact Head Office',status:"Active"}, obj, function (err, data) {
        if(err)
        {   
            msg.status = "201";
            msg.message = "Error Occured";
        return cb(null,msg);
        }
   
        msg.status = "200";
        msg.message = "Ho Address updated successfully";
                cb(null, msg, data);
    
        });
    }
    Ctpconfiguration.remoteMethod(
                'updatecontact',
                {
                    http: {path: '/updatecontact', verb: 'post'},
                    description: 'Update contact details',
                    accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                    returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
                }
        );
        Ctpconfiguration.deactivatecontact = function (req, cb) {
            var msg = {};
        
    var obj={
        status:req.status
    }
        
    Ctpconfiguration.upsertWithWhere({tag: 'Contact Head Office',status:"Active"}, obj, function (err, data) {
        if(err)
        {   
            msg.status = "201";
            msg.message = "Error Occured";
        return cb(null,msg);
        }
   
        msg.status = "200";
        msg.message = "Ho Address deleted successfully";
                cb(null, msg, data);
    
        });
    }
    Ctpconfiguration.remoteMethod(
                'deactivatecontact',
                {
                    http: {path: '/deactivatecontact', verb: 'post'},
                    description: 'Delete details',
                    accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                    returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
                }
        );
        Ctpconfiguration.getallstates = function (req, cb) {
     
            // return;
            let successMessageTotal = {};
         
           
            let errorMessageTotal = {};
           
        
            Ctpconfiguration.findOne(
                {     
                where:{tag: req.tag
                   
                },
    
       
                 } ,
                 (error, resp) => {
                    
                    if(error)
                    {
                        errorMessageTotal.status = "201";
                        errorMessageTotal.message = "Error Occured";
                    return cb(null,errorMessageTotal);
                    }
    
                    successMessageTotal.status = "200";
                    successMessageTotal.message = "Information fetched successfully";
                    let responsearr=[];
                  
                    return cb(null,successMessageTotal,resp);
                   }  )      
    
                            
                        
                              
            }
            Ctpconfiguration.remoteMethod(
            'getallstates',
            {
                http: {path: '/getallstates',verb: 'post'},
                description: 'get all states',
                accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
            });
            Ctpconfiguration.insertcategory = function (req, cb) {
                var msg = {};
                Ctpconfiguration.find(
                    {     
                    where:{tag: 'Category',status:"Active"
                       
                    },
        
           
                     } ,
                     (error, resp) => {
                        
                        if(error)
                        {
                            msg.status = "201";
                            msg.message = "Error Occured";
                        return cb(null,msg);
                        }
                   
                        if(resp.length>0){
                          var obj=JSON.parse(resp[0].value)
                        
                          if(obj.hasOwnProperty(req.category)){
                            msg.status = "202";
                                  msg.message = "Category Already exist";
                        //   for( let i in resp[0].value){
                        //       if(i==req.category){
                        //         msg.status = "200";
                        //         msg.message = "Category Already exist";
                        //         cb(null, msg);
                        //       }
                        //       else{
                        //          var obj= JSON.parse(resp[0].value)
                        //           var cat=req.category
                        //           var sub=req.sub_category
                        //       var oobject={"value":  obj[cat]=sub}
                        //         Ctpconfiguration.upsertWithWhere({tag: 'Category',status:"Active"},oobject, function (err, res) {
                              
                        //         });
                        //       }
                        //   }

                          cb(null, msg);
                          }
                          else{
                                  var obj= JSON.parse(resp[0].value)
                                  var cat=req.category
                                  console.log(cat)
                                            var sub=req.sub_category
                                        var oobject={"value":  obj[cat]=sub}
                                      
                                        console.log(obj)
                                        var objects={
                                          
                                            'value' :  obj,
                             
                                 
                                        }
                                        Ctpconfiguration.upsertWithWhere({tag: 'Category',status:"Active"},objects, function (err, res) {
                                            if (err)
                                            throw(err);
                            
                                        msg.status = "200";
                                        msg.message = "Category  added successfully";
                                        cb(null, msg, res);
                                              });    
                          }
                        }

                        else{
        var category=req.category
        console.log(category)      
        var subcategory=req.sub_category
                       var objects={
                        [category]:subcategory
                       } 
                         
                var now = new Date();
                var obj={
                    'tag' : 'Category',
                    'value' :  objects,
                    'date' : now,
                    
                }
        
            
                Ctpconfiguration.upsert(obj, function (err, res) {
                    if (err)
                        throw(err);
        
                    msg.status = "200";
                    msg.message = "Category  added successfully";
                    cb(null, msg, res);
        
            });}
        }  )  
        }
        Ctpconfiguration.remoteMethod(
                    'insertcategory',
                    {
                        http: {path: '/insertcategory', verb: 'post'},
                        description: 'Add contact details',
                        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                        returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
                    }
            );
            Ctpconfiguration.getcategory = function (req, cb) {
     
                // return;
                let successMessageTotal = {};
             
               
                let errorMessageTotal = {};
               
            
                Ctpconfiguration.findOne(
                    {     
                    where:{tag: req.tag,status:"Active"
                       
                    },
        
           
                     } ,
                     (error, resp) => {
                        
                        if(error)
                        {
                            errorMessageTotal.status = "201";
                            errorMessageTotal.message = "Error Occured";
                        return cb(null,errorMessageTotal);
                        }
        
                        successMessageTotal.status = "200";
                        successMessageTotal.message = "Information fetched successfully";
                        let responsearr=[];
                      
                        return cb(null,successMessageTotal,resp);
                       }  )      
        
                                
                            
                                  
                }
                Ctpconfiguration.remoteMethod(
                'getcategory',
                {
                    http: {path: '/getcategory',verb: 'post'},
                    description: 'get all contacts',
                    accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
                    returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'object'}]
                });
                
};
