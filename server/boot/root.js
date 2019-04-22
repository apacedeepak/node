
'use strict';
var constantval = require('../../common/models/constant');

module.exports = function(server) {

  var router = server.loopback.Router();
  var App = require("../../server/server");
 
  router.post('/api/*', (req,res,next)=>{  
    if(req.headers.authorization && (req.url != '/api/oauthclients/login' &&  req.url != '/api/ctpconfiguration/gethocontactdetails'   && req.url != '/api/login/login' && req.url != '/api/oauthclients/getsecretinformation' && req.url != '/api/schools/schoollist'))
      {
        if(req.headers.authorization.toLowerCase()=='app') 
          {
             next();
          }
            else{
        App.models.oauthaccestoken.gettoken(req.headers.authorization, req.headers.url,function(err,response){
          if(response.status=='000' || response.status=='0000')
            {
              var tempobj = {response_status:response};
             
           res.send(tempobj);
            }
          else if(response.status=='200')
          {
             next();
          } 
         })
            }
      }
         else if(req.body.token &&  (req.url != '/api/oauthclients/login' &&  req.url != '/api/ctpconfiguration/gethocontactdetails'   && req.url != '/api/login/login' && req.url != '/api/oauthclients/getsecretinformation' && req.url != '/api/schools/schoollist'))
          {
             App.models.oauthaccestoken.gettoken(req.body.token, req.body.url,function(err,response){
          if(response.status=='000' || response.status=='0000')
            {
              var tempobj = {response_status:response};
             
           res.send(tempobj);
            }
          else if(response.status=='200')
          {
             next();
          } 
         })

          }
        else if((!req.body.token) && (req.headers['content-type'].indexOf('multipart/form-data')==-1) &&  (req.url != '/api/oauthclients/login' &&  req.url != '/api/ctpconfiguration/gethocontactdetails'   && req.url != '/api/login/login' && req.url != '/api/oauthclients/getsecretinformation'&& req.url != '/api/schools/schoollist'))
          {
            var tempobj = {response_status:{status:'000',messge:'Token Required'}};
             
           res.send(tempobj);
          }
    else
      {
        next();
      }
   
      
  });
   router.get('/api/*', (req,res,next)=>{
     if(req.headers.authorization)
      {
         if(req.headers.authorization.toLowerCase()=='app') 
          {
             next();
          }
            else
              {
         App.models.oauthaccestoken.gettoken(req.headers.authorization, req.headers.url,function(err,response){
          if(response.status=='000' || response.status=='0000')
            {
           var tempobj = {response_status:response};
             
           res.send(tempobj);
            }
          else if(response.status=='200')
          {
             next();
          } 
         })
              }
      }
        else if(req.query.token)
          { 
             App.models.oauthaccestoken.gettoken(req.query.token, req.query.url,function(err,response){
          if(response.status=='000' || response.status=='0000')
            {
           var tempobj = {response_status:response};
             
           res.send(tempobj);
            }
          else if(response.status=='200')
          {
             next();
          } 
         })
          }
        // else if((!req.query.token) && req.url != '/api/oauthclients/getsecretinformation' && req.url != '/api//api/ctpconfiguration/ping' && req.url != '/api//api/ctpconfiguration/configuration')
        //   {
        //     var tempobj = {response_status:{status:'000',messge:'Token Required'}};
             
        //    res.send(tempobj);
        //   }
    else
      {
        next();
      }
      
  });
server.use(router);
 
};


