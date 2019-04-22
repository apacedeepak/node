'use strict';

module.exports = function(Equipment) {
    /* 
    * Create Equipment 
    */
    Equipment.createequipment = function(data, cb){  
        
        if(!data) return cb(null, {response_status: "201", response: "Invalid data"});
        
        Equipment.upsert(data, function (err, res) { 
            if(err) { return console.log(err) }
            if(data.id){
                var message = "Equipment updated successfully";
            }else{
                var message = "Equipment added successfully";
            }
            return cb(null, {response_status: "200", response: message});
        }) 
    }

    Equipment.remoteMethod(
        'createequipment',
        {
            http: {path: '/createequipment', verb: 'post'},
            description: 'Create Equipment Master',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_status', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );
    
    /*
    * Get All Equipment Data
    */
    Equipment.getequipment = function (cb) {  
        Equipment.find({
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });
    };

    Equipment.remoteMethod(
        'getequipment',
        {
            http: {path: '/getequipment', verb: 'get'},
            description: 'Get Equipment',
            returns: {arg: 'response', type: 'json'}
        }
    );
    
    /*
    * Get Equipment By Id
    */
    Equipment.getequipmentbyid = function (equipmentId, cb) {  
        Equipment.findOne({
            where: {id: equipmentId},
        }, function (err, stdObj) {
            return cb(null, stdObj);
        });
    };

    Equipment.remoteMethod(
        'getequipmentbyid',
        {
            http: {path: '/getequipmentbyid', verb: 'get'},
            description: 'Get Equipment By Id',
            accepts: {arg: 'equipmentId', type: 'string', required: true},
            returns: {arg: 'response', type: 'json'}
        }
    );

    /*
    * Get Equipment By Name
    */ 
   Equipment.getequipmentbyname = function (req, cb){
        Equipment.findOne({
            where: {equipment_name: req.equipment_name},
        }, function(err, result){
            if(err){ return err;}
            cb(null, result);
        });
   };

   Equipment.remoteMethod(
       'getequipmentbyname',
       {
           http: {path: '/getequipmentbyname', verb: 'post'},
           description: 'Get Equipment By Name',
           accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
           returns: {arg: 'response', type: 'json'}
       }
   );
   
   /*
    * Get Equipment List
    */
    Equipment.roomequipmentslist = function (data, cb) {  
        Equipment.find(data, function (err, stdObj) {
            return cb(null, stdObj);
        });
    };

    Equipment.remoteMethod (
        'roomequipmentslist', {
            http: {path: '/roomequipmentslist', verb: 'post'},
            description: 'Get Equipment List',
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: {arg: 'response', type: 'json'}
        }
    ); 
};
