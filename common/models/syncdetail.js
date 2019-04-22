'use strict';
var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe')
module.exports = function (Syncdetail) {
    var Homework;
    var SyncDataObj;
    Syncdetail.adddetail = function (moduletype, data, cb) {

        let temparr = [];
        let promise = [];
        temparr = Dedupe(data, ['module_key_id']);
        if (temparr.length == 1) {
            Syncdetail.find({
                where: { module_type: moduletype, module_key_id: temparr[0].module_key_id }
            }, function (err, response) {
                if (response.length > 0) {
                    Syncdetail.upsert({ status: 0,id:response[0].id }, function (err, response) { })
                }
                else {
                    for (let key in temparr) {
                        let syncData = {};
                        syncData.module_type = moduletype;
                        syncData.module_key_id = temparr[key].module_key_id;
                        syncData.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                        promise.push(Syncdetail.adddetailexecute(syncData));
                    }
                    Promise.all(promise).then(function (response) {

                    })
                }
            })
        }
        else {
            for (let key in temparr) {
                let syncData = {};
                syncData.module_type = moduletype;
                syncData.module_key_id = temparr[key].module_key_id;
                syncData.created_date = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                promise.push(Syncdetail.adddetailexecute(syncData));
            }
            Promise.all(promise).then(function (response) {

            })

        }

    }

    Syncdetail.adddetailexecute = function (syncData) {
        return new Promise(function (resolve, reject) {
            Syncdetail.upsert(syncData, function (err, response) {
                if (err) {
                    var errorObj = {};
                    errorObj.status = '201';
                    errorObj.message = 'error';
                    resolve(null, errorObj);
                }
                var successObj = {};
                successObj.status = '200';
                successObj.message = 'success';
                resolve(null, successObj);
            })
        });
    }

    Syncdetail.getsyncdata = function () {
        Homework = Syncdetail.app.models.homework;
        SyncDataObj = Syncdetail.app.models.syncdata;
        Syncdetail.find({
            where: {
                status: 0
            }
        }, function (err, response) {
            if (response.length > 0) {
                let homearr = [];
                for (let key in response) {

                    if (response[key].module_type == 4) {
                        let sync_id = 0;
                        if (response[key].response_data) {
                            let tempdata = JSON.parse(response[key].response_data);
                            sync_id = tempdata.id;
                        }
                        let homekey = { module_key_id: response[key].module_key_id, syncid: sync_id, syncdata_id: response[key].id }
                        homearr.push(homekey);
                    }
                }
                if (homearr.length > 0) {
                    Syncdetail.synchomedata(homearr);
                }
            }
        })
    }

    Syncdetail.synchomedata = function (allhomework) {
        let promise = [];
        for (let key in allhomework) {

            promise.push(Syncdetail.sendhomedata(allhomework[key].module_key_id, allhomework[key].syncid, allhomework[key].syncdata_id));
        }
        Promise.all(promise).then(function (response) {


        })
    }

    Syncdetail.sendhomedata = function (homeid, syncid, syncdata_id) {
        return new Promise(function (resolve, reject) {

            Homework.find({
                include: [{
                    relation: "homework_assign",
                    scope: {}

                },
                {
                    relation: "homework_submit",
                    scope: {}
                }
                ],
                where: { id: homeid }
            }, function (err, response) {
                SyncDataObj.sendhometoserver(response[0], syncid, syncdata_id);
                resolve('success');

            }
            )
        })
    }

};
