'use strict';
var request = require('request');
var fs = require('fs');
var rp = require('request-promise');
var constantval = require('./constant');
var dateFormat = require('dateformat');
var loopback = require('loopback');
//mobile-1,email-2
module.exports = function (Otpinformation) {

  Otpinformation.sendotp = function (req, cb) {
    var errorMessage = {};
    var otp_number = Math.floor(100000 + Math.random() * 900000);
    var successMessage = {};
    if (req.otp_sendto == undefined || req.otp_sendto == null || req.otp_sendto == '') {
      errorMessage.status = "201";
      errorMessage.message = "Mobile number can't blank";
      return cb(null, errorMessage);
    }
    if (req.user_id == undefined || req.user_id == null || req.user_id == '') {
      errorMessage.status = "201";
      errorMessage.message = "User Id can't blank";
      return cb(null, errorMessage);
    }
    var otp_msg =  otp_number + ' is your OTP to update your mobile number. Do not share with anyone. Regards EMSCC Team';

    var options = {
      method: 'get',
      uri: constantval.SMS_URL1 + '&dest_mobileno=' + req.otp_sendto + '&message=' + otp_msg+'&response=Y',
    };
    var otpdata = {};
    var DEFAULT_TTL = 300000;
    var lastinserid = '';
    otpdata.user_id = req.user_id;
    otpdata.otp_for = 'mobile';
    otpdata.otp_number = otp_number;
    otpdata.otp_sendto = req.otp_sendto;
    otpdata.status = 'pending';
    otpdata.created_date_time = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
    // var currentTimeSecond = Date.now();
    // var currentsecond = Math.round(parseInt(currentTimeSecond) / 1000);
    var currentTimeSecond = new Date();
    var currentsecond = currentTimeSecond.getTime();
    var currentTtl = parseInt(currentsecond + DEFAULT_TTL);
    otpdata.expires = currentTtl;
    Otpinformation.upsert(otpdata, function (err, responsedata) {
      if (err) {

        errorMessage.status = "201";
        errorMessage.message = "Error Occurred";
        return cb(null, errorMessage);
      }

      lastinserid = responsedata.id;

      rp(options)
        .then(function (response) {
    //        var options = {
    //   method: 'get',
    //   uri: constantval.SMS_URL2 + response,
    // };
    // rp(options)
    //     .then(function (response) {

          //if (response.indexOf('DELIVRD') != -1) {
            if (response) {
            successMessage.status = "200";
            successMessage.message = "OTP sent successfully";
            cb(null, successMessage);
          }
          else {
            Otpinformation.destroyAll({ id: lastinserid }, function (err, res) {

              errorMessage.status = "201";
              errorMessage.message = "Error Occurred";
              errorMessage.message_detail = response;
              cb(null, errorMessage);

            })
          }


        // }).catch(function (error) {
        //   Otpinformation.destroyAll({ id: lastinserid }, function (err, res) {

        //     errorMessage.status = "201";
        //     errorMessage.message = "Error Occurred";
        //     errorMessage.message_detail = error;
        //     cb(null, errorMessage);

        //   })
        // })
         }).catch(function (error) {
          Otpinformation.destroyAll({ id: lastinserid }, function (err, res) {

            errorMessage.status = "201";
            errorMessage.message = "Error Occurred";
            errorMessage.message_detail = error;
            cb(null, errorMessage);

          })
        })
    })

  }
  Otpinformation.verifyotp = function (req, cb) {

    var errorMessage = {};
    var successMessage = {};

    if (req.user_id == undefined || req.user_id == null || req.user_id == '') {
      errorMessage.status = "201";
      errorMessage.message = "User Id can't blank";
      return cb(null, errorMessage);
    }
    if (req.otp_number == undefined || req.otp_number == null || req.otp_number == '') {
      errorMessage.status = "201";
      errorMessage.message = "OTP number can't blank";
      return cb(null, errorMessage);
    }
    if (req.otp_sendto == undefined || req.otp_sendto == null || req.otp_sendto == '') {
      errorMessage.status = "201";
      errorMessage.message = "OTP Send to can't blank";
      return cb(null, errorMessage);
    }
    if (req.user_type == undefined || req.user_type == null || req.user_type == '') {
      errorMessage.status = "201";
      errorMessage.message = "User Type can't blank";
      return cb(null, errorMessage);
    }
    // var currentTimeSecond = Date.now();
    // var currentTtl = Math.round(parseInt(currentTimeSecond) / 1000);
    var currentTimeSecond = new Date();
    var currentTtl = currentTimeSecond.getTime();
    // Otpinformation.findOne({
    //   where: {
    //     otp_number: req.otp_number,
    //     user_id: req.user_id,
    //     otp_for: 'mobile',
    //     otp_sendto: req.otp_sendto,
    //   }
    // }, function (err, validotp) {
    //   if (validotp) {
        Otpinformation.findOne({
          where: {
            otp_number: req.otp_number,
            user_id: req.tle_user_id,
            otp_for: 'mobile',
            otp_sendto: req.otp_sendto,
            status: 'pending'
          }
        }, function (err, response) {
          if (response) {
            if (parseInt(currentTtl) > parseInt(response.expires)) {
              errorMessage.status = "201";
              errorMessage.message = "Entered OTP is expired";
              var updatedata = {};
              updatedata.status = 'expired';
              Otpinformation.update({ user_id: req.tle_user_id, status: 'pending', otp_sendto: req.otp_sendto }, updatedata, function (err, updateresponse) {
                return cb(null, errorMessage);
              })
            }
            else {
              //console.log(currentTtl+'notexpied'+response.expires);
              var updatedata = {};
              //updatedata.id = response.id;
              updatedata.status = 'expired';
              Otpinformation.update({ user_id: req.user_id, status: 'pending', otp_sendto: req.otp_sendto }, updatedata, function (err, updateresponse) {
                updatedata.status = 'done';
                Otpinformation.update({ id: response.id, user_id: req.user_id, otp_sendto: req.otp_sendto }, updatedata, function (err, response) {
                  successMessage.status = "200";
                  successMessage.message = "Updated successfully";
        //           var options = {
        //             method: 'get',
        //             uri: constantval.LOCAL_URL + '/'+constantval.PROJECT_NAME+'/erpapi/index/updatewebauth/user_id/'+ req.user_id + '/status/1',
        //           };
        //            rp(options)
        // .then(function (response) {
        //    var options = {
        //             method: 'get',
        //             uri: constantval.LOCAL_URL + '/'+constantval.PROJECT_NAME+'/erpapi/index/updateloginusername/user_id/'+ req.user_id + '/user_name/' + req.otp_sendto+'/status/1'+ '/usertype/'+req.user_type,
        //           };
        //            rp(options)
        // .then(function (response) {
        //    cb(null, successMessage);
        // }).catch(function(error){
        //     errorMessage.status = "201";
        //     errorMessage.message = "Error Occurred";
        //     return cb(null, errorMessage);

        // })

        // }).catch(function(error){
        //   errorMessage.status = "201";
        //     errorMessage.message = "Error Occurred";
        //     return cb(null, errorMessage);

        // })
                 cb(null, successMessage);
                })
              })

            }

          }
          else {
            errorMessage.status = "201";
            errorMessage.message = "No Valid OTP found";
            return cb(null, errorMessage);
          }

        })
     // }
      // else {
      //   errorMessage.status = "201";
      //   errorMessage.message = "Entered OTP is incorrect";
      //   return cb(null, errorMessage);
      // }
    //})


  }
  Otpinformation.sendemail = function (req, cb) {
    var errorMessage = {};
    var otp_number = Math.floor(100000 + Math.random() * 900000);
    var successMessage = {};
    if (req.otp_sendto == undefined || req.otp_sendto == null || req.otp_sendto == '') {
      errorMessage.status = "201";
      errorMessage.message = "Email Id can't blank";
      return cb(null, errorMessage);
    }
    if (req.user_id == undefined || req.user_id == null || req.user_id == '') {
      errorMessage.status = "201";
      errorMessage.message = "User Id can't blank";
      return cb(null, errorMessage);
    }
    if (req.user_type == undefined || req.user_type == null || req.user_type == '') {
      errorMessage.status = "201";
      errorMessage.message = "User Type can't blank";
      return cb(null, errorMessage);
    }
    if (req.tle_user_id == undefined || req.tle_user_id == null || req.tle_user_id == '') {
      errorMessage.status = "201";
      errorMessage.message = "Tle Id can't blank";
      return cb(null, errorMessage);
    }
    var otpdata = {};
    var DEFAULT_TTL = 300000;
    var lastinserid = '';
    otpdata.user_id = req.tle_user_id;
    otpdata.otp_for = 'mail';
    otpdata.otp_number = otp_number;
    otpdata.otp_sendto = req.otp_sendto;
    otpdata.status = 'pending';
    otpdata.created_date_time = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
    // var currentTimeSecond = Date.now();
    // var currentsecond = Math.round(parseInt(currentTimeSecond) / 1000);

    var currentTimeSecond = new Date();
    var currentsecond = currentTimeSecond.getTime();
    var currentTtl = currentsecond + DEFAULT_TTL;
   // console.log(currentsecond);
    otpdata.expires = currentTtl;
    Otpinformation.upsert(otpdata, function (err, responsedata) {
      if (err) {

        errorMessage.status = "201";
        errorMessage.message = "Error Occurred";
        return cb(null, errorMessage);
      }

      lastinserid = responsedata.id;
      var updatelinkurl =constantval.LOCAL_URL + '/'+constantval.PROJECT_NAME+ "/erpapi/index/verifyemail/key/"+otp_number+"/user_id/"+req.user_id+"/user_type/"+req.user_type+"/tle_user_id/"+req.tle_user_id;
//      var updatelinkurl =constantval.LOCAL_URL+":"+constantval.LOCAL_PORT+ "/verifyemail?key="+otp_number+"&user_id="+req.user_id+"&user_type="+req.user_type+"&tle_user_id="+req.tle_user_id;
      // var sendmessage = "Dear User,<br>You have requested to set your EMSCC account email address as<br>"+req.otp_sendto+"<br> Kindly click on below link to update same<br>"+updatelinkurl;
      var sendmessage = "Dear User,<br>You have requested to set your EMSCC account email address as<br>"+req.otp_sendto+"<br>"+
      "<div style='margin-top: 25px; text-align: center;'><a style='border: 2px;border-style: double;padding: 5px;align-items: center;border-color: red;background-color: rgba(0, 114, 198, 1);color: white;text-decoration: none;' href='"+updatelinkurl+"'>Click here to confirm the change</a></div><br>"+
      "In case you are unable to view the button, kindly copy and paste the following link in the browser:<br><br>"+updatelinkurl+ "<br>"+
      "Regards,<br> EMSCC Team";
      loopback.Email.send({
        to: req.otp_sendto,
        from: "erp@extramarks.co.in",
        subject: "Email update request",
        text: "Email update request",
        html: sendmessage,
        // var: {
        //   myVar1: 'a custom value'
        // },
        // headers: {
        //   "X-My-Header": "My Custom header"
        // }
      })
        .then(function (err,response) { 

          if(err==undefined && response==undefined)
            {
            Otpinformation.destroyAll({ id: lastinserid }, function (err, res) {

            errorMessage.status = "201";
            errorMessage.message = "Error Occurred";
            errorMessage.message_detail = err;
            cb(null, errorMessage);

          })
            }
          else
            {
          successMessage.status = "200";
          successMessage.message = "Updation mail link sent successfully";
          cb(null, successMessage);
            }

        })
        .catch(function (err) {

          Otpinformation.destroyAll({ id: lastinserid }, function (err, res) {

            errorMessage.status = "201";
            errorMessage.message = "Error Occurred";
            errorMessage.message_detail = err;
            cb(null, errorMessage);

          })
        });
    });

  }
  Otpinformation.verifyemail = function (key,user_id,user_type,tle_user_id, cb) {

    var errorMessage = {};
    var successMessage = {};

    if (user_id == undefined || user_id == null || user_id == '') {
      errorMessage.status = "201";
      errorMessage.message = "User Id can't blank";
      return cb(null, errorMessage);
    }
    if (key == undefined || key == null || key == '') {
      errorMessage.status = "201";
      errorMessage.message = "Key can't blank";
      return cb(null, errorMessage);
    }
    // if (user_type == undefined || user_type == null || user_type == '') {
    //   errorMessage.status = "201";
    //   errorMessage.message = "User Type can't blank";
    //   return cb(null, errorMessage);
    // }
    // var currentTimeSecond = Date.now();
    // var currentTtl = Math.round(parseInt(currentTimeSecond) / 1000);
    var currentTimeSecond = new Date();
    var currentTtl = currentTimeSecond.getTime();
    var updatedemail = '';
        Otpinformation.findOne({
          where: {

            user_id: tle_user_id,
            otp_for: 'mail',
            otp_number: key,
            status: 'pending'
          }
        }, function (err, response) {
          if (response) {
            updatedemail = response.otp_sendto;
            if (parseInt(currentTtl) > parseInt(response.expires)) {
              errorMessage.status = "201";
              errorMessage.message = "URL has expired";
              var updatedata = {};
              updatedata.status = 'expired';
              Otpinformation.update({ user_id: tle_user_id, status: 'pending', otp_for: 'mail',otp_number: key }, updatedata, function (err, updateresponse) {
                return cb(null, errorMessage);
              })
            }
            else {

                  var options = {
                    method: 'post',
                     uri: constantval.LOCAL_URL+':'+constantval.LOCAL_PORT + '/'+'api/users/updateuserlogininfo',
                     body: {
                            user_id: tle_user_id,
                            user_type: user_type,
                            status: 2,
                            user_name: updatedemail
                     },
                     json: true
                  };
                   rp(options)
        .then(function (response) {
            var responseStatus = response;
            if(responseStatus.response_status.responseCode == '202'){
              successMessage.status = "201";
              successMessage.message = "Email Id is already exist";
              cb(null, successMessage);
            }else{
               var updatedata = {};

              updatedata.status = 'expired';
              Otpinformation.update({ user_id: tle_user_id, status: 'pending', otp_for: 'mail' }, updatedata, function (err, updateresponse) {
                updatedata.status = 'done';
                Otpinformation.update({ id: response.id, user_id: tle_user_id,otp_for: 'mail',otp_number: key }, updatedata, function (err, responsefinal) {
                  successMessage.status = "200";
                  successMessage.message = "Updated successfully";
                    cb(null, successMessage);
                   })
              })


            }



        }).catch(function(error){
          errorMessage.status = "201";
            errorMessage.message = "Error Occurred";
            return cb(null, errorMessage);

        })
               //return cb(null, successMessage);


            }

          }
          else {
            errorMessage.status = "201";
            errorMessage.message = "No Valid URL found";
            return cb(null, errorMessage);
          }

        })
     // }
    //   else {
    //     errorMessage.status = "201";
    //     errorMessage.message = "URL is incorrect";
    //     return cb(null, errorMessage);
    //   }
    // })

  }
  Otpinformation.remoteMethod(
    'sendotp',
    {
      http: { verb: 'post' },
      description: 'Send OTP API',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
    }
  );
  Otpinformation.remoteMethod(
    'verifyotp',
    {
      http: { verb: 'post' },
      description: 'Verify OTP API',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
    }
  );
  Otpinformation.remoteMethod(
    'sendemail',
    {
      http: { verb: 'post' },
      description: 'Send Email API',
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
    }
  );

  Otpinformation.remoteMethod(
    'verifyemail',
    {
      http: { verb: 'get' },
      description: 'Verify Email API',
      accepts: [{arg: 'key', type: 'string'},{arg: 'user_id', type: 'string'},{arg: 'user_type', type: 'string'},{arg: 'tle_user_id', type: 'string'}],
      returns: [{ arg: 'response_status', type: 'string' }, { arg: 'response', type: 'string' }]
    }
  );
};
