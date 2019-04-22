'use strict';

var async = require('async');
module.exports = function (Menumaster) {

    /*
   * Get Menu Master list
   */
    Menumaster.menulist = (cb) => {
        Menumaster.find({
            where: {status:"Active"},
        }, function (err, masterMenu) {
            if (err) { 
                cb(null, err);
            } else {
                cb(null, masterMenu);
            }
        });
    }
    
    Menumaster.remoteMethod(
        'menulist', {
            http: { path: '/menulist', verb: 'get' },
            description: 'Master Menu List',
            //accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response', type: 'json' }]
        }
    );

    Menumaster.addmenu = (cb) => {
        var leftmenu = Menumaster.app.models.leftmenu;

       leftmenu.find({ where: { product_type: { neq: "User_Type_Role" } } }, (err, allMenuList) => {
            if (err) {
                cb(err, null)
            } else {
                allMenuList.forEach(menuList => {
                    var listMenu = JSON.parse(menuList.json_value);
                    var key = Object.keys(listMenu)
                    var jsonKey = key.pop()
                    listMenu = listMenu[jsonKey]
                 
            
                    async.each(listMenu, menu => {
                    //listMenu.forEach(menu => {
                        
                        let param = {
                            menu_name : menu.menu_name,
                            linkfor: menu.linkfor,
                            linkname: menu.linkname,
                            priority: menu.priority,
                            status: "Active",
                            path: menu.path,
                            icon: menu.icon,
                            color: menu.color,
                            parentId: 0
                        };
                        Menumaster.create(param,function(err,data){
                          
                            if(err){cb(null,err);}else{
                                menu.sub_menu.forEach(subMenu=>{
                                    if(subMenu.submenu_name!= undefined){
                                        let subParam = {
                                            menu_name : subMenu.submenu_name,
                                            linkfor: subMenu.linkfor,
                                            linkname: subMenu.linkname,
                                            priority: subMenu.priority,
                                            status: "Active",
                                            path: subMenu.path,
                                            icon: subMenu.icon,
                                            color: subMenu.color,
                                            parentId: data.id
                                        };
                                        Menumaster.create(subParam,function(err,data){
                                            if(err){cb(null,err)}
                                        })
                                    }
                                })
                            }
                        });
                    })
                   

                }) 
                cb(null,"menu inserted");
            }  
        })
    }

    Menumaster.remoteMethod(
        'addmenu', {
            http: { path: '/addmenu', verb: 'get' },
            description: 'Menu Master creation',
            //accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{ arg: 'response', type: 'json' }]
        }
    );

};
