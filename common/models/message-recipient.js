'use strict';

module.exports = function(Messagerecipient) {

  Messagerecipient.markasimportant = function (data, cb) {

    Messagerecipient.find({
      where: {messageId: data.message_id, receiverId: data.user_id, placeholder: "Inbox"},
    },function (err, messDetail) {

      messDetail = messDetail[0];

      let param = {
        id: messDetail.id,
        messageId: messDetail.messageId,
        senderId: messDetail.senderId,
        receiverId: messDetail.receiverId,
        placeholder: messDetail.placeholder,
        user_type: messDetail.user_type,
        created_date: messDetail.created_date,
        userId: messDetail.userId,
      }

      if(data.markasread == "markasread"){
        param.message_isread = "Yes";
      
        param.message_isimportant = messDetail.message_isimportant;
      }else{
        param.message_isread = messDetail.message_isread;
        param.message_isimportant = data.isImportant;
      }
     
      Messagerecipient.updatemessagerecipient(param, (err, getUpdatedData)=>{
        cb(null, getUpdatedData)
      })
    });

};


Messagerecipient.movetoarchived =  (data, cb) => {


    Messagerecipient.find({
      where: {messageId: data.message_id, receiverId: data.user_id, placeholder: "Inbox"},
    },function (err, messDetail) {

      messDetail = messDetail[0];

      let param = {
        id: messDetail.id,
        messageId: messDetail.messageId,
        senderId: messDetail.senderId,
        receiverId: messDetail.receiverId,
        placeholder: "Archived",
        user_type: messDetail.user_type,
        created_date: messDetail.created_date,
        userId: messDetail.userId,
        message_isimportant: messDetail.message_isimportant,
        message_isread: "Yes",
      }

      Messagerecipient.updatemessagerecipient(param, (err, getUpdatedData)=>{
        cb(null, getUpdatedData);
      })
    });

};

Messagerecipient.updatemessagerecipient = (data, cb)=>{

  Messagerecipient.upsert(data, (err, result)=>{
    if (err) {
        cb(null, err);
    } else {
        cb(null, result);
    }
  });
};



Messagerecipient.remoteMethod(
    'markasimportant',
    {
        http: {path: '/markasimportant', verb: 'post'},
        description: 'Update message recipient',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response', type: 'json'}
    }
);

Messagerecipient.remoteMethod(
    'updatemessagerecipient',
    {
        http: {path: '/updatemessagerecipient', verb: 'post'},
        description: 'Update message recipient',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response', type: 'json'}
    }
);

Messagerecipient.remoteMethod(
    'movetoarchived',
    {
        http: {path: '/movetoarchived', verb: 'post'},
        description: 'Update message recipient',
        accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
        returns: {arg: 'response', type: 'json'}
    }
);

Messagerecipient.remoteMethod(
        'usermessages',
{

}
            );

};
