'use strict';
var constant = require('./constant.js');
var request = require('request');
var os = require("os");

module.exports = function (Oauthaccestoken) {
    var DEFAULT_TTL = 1800000;//it is 30 min time
    var menuList;
    /* token detail */
    Oauthaccestoken.gettoken = function (token, url, cb) {
        var errorMessage = {};
        var successMessage = {};
        var userObj = Oauthaccestoken.app.models.user;
        if (!token) {
            errorMessage.status = "000";
            errorMessage.message = "Token Required";
            cb(null, errorMessage);
        } else {
            Oauthaccestoken.findOne({ where: { access_token: token } }, function (err, stdObj) {
              
                if (stdObj != null) {
                    var currentTimeSecond = new Date();
                    var currentTtl = currentTimeSecond.getTime();

                    if (stdObj.access_token != null && stdObj.access_token != "") {
                        if (stdObj.callfrom.toLowerCase() == "web" && (parseInt(currentTtl) > parseInt(stdObj.expires))) {
                            Oauthaccestoken.destroyAll({ access_token: token }, function (err, response) {
                                errorMessage.status = "000";
                                errorMessage.message = "Token Expired";
                                cb(null, errorMessage);
                            });
                        } else {


                            userObj.findOne({ where: { id: stdObj.user_id }, }, (err, userResult) => {

                                if (err) cb(null, err);
                                let roleName = userResult.role_name;
                                let params = { 'userId': stdObj.user_id, 'roleName': roleName, 'reqUrl': url };

                                Oauthaccestoken.getAccessUrl(params, function (err, accResult) {
                          
                                    if (parseInt(accResult) == 200) {
                                        var currentTimeSecond = new Date();
                                        var currentsecond = currentTimeSecond.getTime();
                                        var currentTtl = parseInt(currentsecond + DEFAULT_TTL);
                                        var updatedata = { id: stdObj.id, expires: currentTtl };

                                        Oauthaccestoken.upsert(updatedata, function (err, response) {

                                            successMessage.status = "200";
                                            successMessage.message = "Success";
                                            cb(null, successMessage);
                                        });

                                    } else {

                                        errorMessage.status = "0000";
                                        errorMessage.message = "Unauthorized Access";
                                        cb(null, errorMessage);

                                    }

                                });
                            });

                        }
                    }
                }
                else {
                    errorMessage.status = "000";
                    errorMessage.message = "Invalid Token";
                    cb(null, errorMessage);
                }
            });
        }

    };

    Oauthaccestoken.remoteMethod(
        'gettoken',
        {
            http: { verb: 'get' },
            description: 'Get list of token',
            accepts: [{ arg: 'token', type: 'string' }],
            returns: { arg: 'token', type: 'json' }
        }
    );

    Oauthaccestoken.getAccessUrl = function (data, cb) {


        
        var leftmenu = Oauthaccestoken.app.models.leftmenu
        
        var accessResponse="200"
        var accessFlag=false;
        var listMenu;
        leftmenu.find({ where: { product_type: { neq: "User_Type_Role" } } }, (err, allMenuList) => {
            if (err) {
                cb(err, null)
            } else {
                allMenuList.forEach(menuList => {

                    listMenu = JSON.parse(menuList.json_value);
                    var key = Object.keys(listMenu)
                    var jsonKey = key.pop()
                    listMenu = listMenu[jsonKey]
                    data.roleName= data.roleName.toLowerCase().replace(/ +/g, "");
            
           
                    listMenu.forEach(menu => {
                     
                        if (menu.sub_menu.find(subMenu => subMenu.path == data.reqUrl) || menu.path== data.reqUrl) {
                     
                            
                           if(jsonKey==data.roleName){
  
                            accessResponse="200"
                            accessFlag=true
                                                   
                           }else {
                               if(!accessFlag){
                            accessResponse="0000"
                               }
                           }


                        }  
                    })
                   

                }) 
            } cb(null, accessResponse);
        })


    };

};
