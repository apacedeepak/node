'use strict';
var dateFormat = require('dateformat');

module.exports = function (Termname) {
    Termname.addterm = function (data, cb) {

        let msg={};

        Termname.find({
            where: {term_name: data.term_name,school_id:data.school_id},
          
        }, function (err, result) {
            if (err) {
    
                msg.status="201";
                msg.message="error occured";
                return cb(null, msg);
            }  if(result.length >0) {
            
                msg.status="200";
                msg.message="Term Name Already Present";
                return cb(null, msg);
            }
        
            Termname.upsert(data, function (error, res) {
            if(error){
                console.log(error)
                msg.status="201";
                msg.message="error occured";
                return cb(null, msg);
            }
            
            msg.status="200";
            msg.message="Term Added Successful";
         
            return cb(null, msg);
        });
    });
    };
    Termname.remoteMethod(
        'addterm',
        {
            http: {path: '/addterm', verb: 'post'},
            description: 'Add term ',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response_status', type: 'json'}
        }
);
Termname.editterm = function (data, cb) {

    let msg={};
  var id =data.id
    Termname.find({
        where: {term_name: data.term_name,school_id:data.school_id,
    id:{"neq":data.id}
        },
      
    }, function (err, result) {
        if (err) {
            console.log(err)
            msg.status="201";
            msg.message="error occured";
            return cb(null, msg);
        }  if(result.length >0) {
      
            msg.status="201";
            msg.message="Term Name Already Present";
            return cb(null, msg);
        }
    var updatedata=data;
    delete updatedata.id
   
        Termname.upsertWithWhere({id:id},updatedata, function (error, res) {
        if(error){
            console.log(error)
            msg.status="201";
            msg.message="error occured";
            return cb(null, msg);
        }
        
        msg.status="200";
        msg.message="Term Updated Successful";
     
        return cb(null, msg);
    });
});
};
Termname.remoteMethod(
    'editterm',
    {
        http: {path: '/editterm', verb: 'post'},
        description: 'Edit term ',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response_status', type: 'json'}
    }
);
Termname.termlist = function (data, cb) {

    let msg={};

    Termname.find({
       where:{status:data.status,school_id:data.school_id}
      
    }, function (err, result) {
        if (err) {

            msg.status="201";
            msg.message="error occured";
            return cb(null, msg);
        }  if(result) {
            msg.status="200";
            msg.message="Data fetched Successfully";
            return cb(null,result);
        }
  
});
};
Termname.remoteMethod(
    'termlist',
    {
        http: {path: '/termlist', verb: 'post'},
        description: 'Get term list',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response', type: 'json'}
    }
);
Termname.termbyid = function (data, cb) {

    let msg={};

    Termname.findOne({
       where:{id:data.id}
      
    }, function (err, result) {
        if (err) {

            msg.status="201";
            msg.message="error occured";
            return cb(null, msg);
        }  if(result) {
            msg.status="200";
            msg.message="Data fetched Successfully";
            return cb(null,result);
        }
  
});
};
Termname.remoteMethod(
    'termbyid',
    {
        http: {path: '/termbyid', verb: 'post'},
        description: 'Get term by id',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response', type: 'json'}
    }
);
};
