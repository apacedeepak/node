'use strict';

module.exports = function(Illness) {
    Illness.addillness = function(data,cb)
    {
         var filter = { name: data.name,status:{"neq":2} };
            Illness.find(
                {where:filter}
                , function (err, responsedata) {
                     if (err) {
                        var errorMessage = {};
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occured";
                        return cb(null, errorMessage);
                    }
                    if(responsedata.length==0)
                        {
                             Illness.upsert(data, function (err, response) {
                    if (err) {
                        var errorMessage = {};
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occured";
                        return cb(null, errorMessage);
                    }
                        var successMessage = {};    
                        successMessage.status = "200";
                        successMessage.message = "Data Saved Successfully";
                        return cb(null, successMessage);

                })
                        }
            else
                {
                        var successMessage = {};    
                        successMessage.status = "209";
                        successMessage.message = "Data Already Exist";
                        return cb(null, successMessage);

                }
                
            });  
       
    }

    Illness.updateillness = function(data,cb)
    {
         var filter = { name: data.name,status:{"neq":2},id:{"neq":data.id} };
            Illness.find(
                {where:filter}
                , function (err, responsedata) {
                     if (err) {
                        var errorMessage = {};
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occured";
                        return cb(null, errorMessage);
                    }
                    if(responsedata.length==0)
                        {
                             Illness.upsert(data, function (err, response) {
                    if (err) {
                        var errorMessage = {};
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occured";
                        return cb(null, errorMessage);
                    }
                        var successMessage = {};    
                        successMessage.status = "200";
                        successMessage.message = "Data Updated Successfully";
                        return cb(null, successMessage);

                })
                        }
            else
                {
                        var successMessage = {};    
                        successMessage.status = "209";
                        successMessage.message = "Data Already Exist";
                        return cb(null, successMessage);

                }
                
            });  
       
    }

    Illness.getillness = function(data,cb)
    {
         var filter = { added_by: data.added_by,status:{"neq":2},id:data.id};
            Illness.find(
                {where:filter}
                , function (err, responsedata) {
                     if (err) {
                        var errorMessage = {};
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occured";
                        return cb(null, errorMessage);
                    }
                   
                        var successMessage = {};    
                        successMessage.status = "200";
                        successMessage.message = "Data fetched Successfully";
                        return cb(null, successMessage,responsedata);

                })
                      
           
                
           
       
    }

    Illness.deleteillness = function(data,cb)
    {
         
                    Illness.upsert(data, function (err, response) {
                    if (err) {
                        var errorMessage = {};
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occured";
                        return cb(null, errorMessage);
                    }
                        var successMessage = {};    
                        successMessage.status = "200";
                        successMessage.message = "Data Deleted Successfully";
                        return cb(null, successMessage);

                })
                   
                
            
       
    }

};
