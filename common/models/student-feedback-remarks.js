'use strict';
var dateFormat = require('dateformat');
var Dedupe = require('array-dedupe');
module.exports = function(Studentfeedbackremarks) {
    
    Studentfeedbackremarks.behaviourfeedback = (data, cb) => {
        var feedback = {};
        Studentfeedbackremarks.find({
            include:
            [
                {
                    relation: 'assignedfeedback',
                    scope: {
                        
                    }
                },
                {
                    relation: 'userassignedfeedback',
                    scope: {
                        
                    }
                },
                {
                relation: 'user',
                scope: {
                    include:{
                        relation : "staff",
                        scope:{
                            fields: ["name"]
                        }
                    }
                }
            }],
            where: {userId: data.user_id, status: 1},
        }, (err, stdObj) => {
            let checkValue = []    
            let positiveObj = {}, negativeObj = {};
            stdObj.forEach(function (value, index) {
                if(value.remarks_category){
                let remarks_name = (value.isAdmin == 1)? value.assignedfeedback().remarks_name: value.userassignedfeedback().remarks_name

                let feedback = {
                    userId : value.userId,
                    feedbackmasterId : value.feedbackmasterId,
                    status : value.status,
                    added_date : value.added_date,
                    addedBy : value.addedBy,
                    comment : value.remark,
                    id : value.id,
                    remarks_name : remarks_name,
                    remarks_category : value.remarks_category,
                    name : value.user().staff().name
                }
                if(value.remarks_category.toLowerCase() == 'positive'){
                    if(checkValue.indexOf(remarks_name) != -1){
                        let tempArr = positiveObj[remarks_name]
                        tempArr.push(feedback)
                        positiveObj[remarks_name] = tempArr
                    }else{
                        let tempArr = []
                        tempArr.push(feedback)
                        positiveObj[remarks_name] = tempArr
                    }
                }else{
                    if(checkValue.indexOf(remarks_name) != -1){
                        let tempArr = negativeObj[remarks_name]
                        tempArr.push(feedback)
                        negativeObj[remarks_name] = tempArr
                    }else{
                        let tempArr = []
                        tempArr.push(feedback)
                        negativeObj[remarks_name] = tempArr
                    }
                }
                checkValue.push(remarks_name);
            }
            });
            let negativeArr = Object.keys(negativeObj).map(k => negativeObj[k])
            let positiveArr = Object.keys(positiveObj).map(k => positiveObj[k])
            
            positiveArr = positiveArr.sort((a, b) => {
                a = a[0].remarks_name.toLowerCase();
                b = b[0].remarks_name.toLowerCase();
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
              });

            negativeArr = negativeArr.sort((a, b) => {
                a = a[0].remarks_name.toLowerCase();
                b = b[0].remarks_name.toLowerCase();
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
              });

            positiveArr = positiveArr.sort((a, b) => {
                if (a.length < b.length) return 1;
                if (a.length > b.length) return -1;
                return 0;
              });

            negativeArr = negativeArr.sort((a, b) => {
                if (a.length < b.length) return 1;
                if (a.length > b.length) return -1;
                return 0;
              });

          
            return cb(null, {positive: positiveArr, negative: negativeArr});
        });

    };
        
    Studentfeedbackremarks.remoteMethod(
        'behaviourfeedback',
        {
            http: {path: '/behaviourfeedback', verb: 'post'},
            description: 'Get username of user',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: {arg: 'response', type: 'json'}
        }
    );

    Studentfeedbackremarks.addStudentFeedback = (data, cb) => {
        var msg = {};
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            cb(null, msg);
            return;
        }
        else if(data.remark_id.length == 0 && !data.remark_id){
            msg.status = "201";
            msg.message = "Remark id cannot be blank";
            cb(null, msg);
            return;
        }
        else if(!data.user_id){
            msg.status = "201";
            msg.message = "User id cannot be blank";
            cb(null, msg);
            return;
        } 
        else if(!data.remarks_category){
            msg.status = "201";
            msg.message = "Remarks category cannot be blank";
            cb(null, msg);
            return;
        } 
        else if(!data.remark_id){
            msg.status = "201";
            msg.message = "Remark id cannot be blank";
            cb(null, msg);
            return;
        } 
        
        if(!data.isAdmin){
            data.isAdmin = 1    
        } 
            
            let insertObj = {}, promise = []
            data.remark_id.forEach((feedbackmasterId, i) => {
                if(data.status.length == 0) data.status[i] = 1
               
                const objct = { feedbackmasterId: feedbackmasterId, user_id: data.user_id, status: data.status[i] }
                Studentfeedbackremarks.waitPromise(objct).next().value.then(res => {
                    // if(res && res.length > 0){
                    //     insertObj.id = res[0].id
                    // }
                    
                    promise.push(new Promise((resolve, reject) => {
                        insertObj = {
                            userId: data.user_id,
                            feedbackmasterId: feedbackmasterId,
                            status: data.status[i],
                            addedBy: data.addedBy,
                            remark: data.remark[i],
                            added_date: dateFormat(Date.now(), "isoDate"),
                            remarks_category: data.remarks_category,
                            isAdmin: data.isAdmin[i]
                        };
                       
                        Studentfeedbackremarks.upsert(insertObj, (err, response) => {
                            if(err) reject(err)
                            if(response) resolve('success')
                        })
                    }).catch(error => console.log(error))) 
                }).catch(error => console.log(error))    
            });

            Promise.all(promise).then(res => {
                msg.status = "200";
                msg.message = "Feedback added successfully";
                return cb(null, msg);
            }).catch(error => console.log(error))
       
    }

    Studentfeedbackremarks.waitPromise = function* (data){
        yield new Promise((resolve, reject) => 
            Studentfeedbackremarks.find({
                fields: ["id"],
                where: { and : [
                    {userId: data.user_id},
                    {status: data.status},
                    {feedbackmasterId: data.feedbackmasterId},
                    {isAdmin: data.isAdmin},
                    {added_date: {gte: dateFormat(Date.now(), "isoDate")}},
                    {added_date: {lte: dateFormat(Date.now(), "yyyy-mm-dd'T'23:59:59")}}
                ]}
            }, (err, result) => {
                if(err) reject('error')
                if(result) resolve(result)
            })
        )   
    }

    Studentfeedbackremarks.remoteMethod(
        'addStudentFeedback',
        {
            http: {path: '/addstudentfeedback', verb: 'post'},
            description: 'Add student feedback',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_type', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );

    // Studentfeedbackremarks.studentFeedback = (data, cb) => {
    //     let msg = {}
    //     if (!data) {
    //         msg.status = "201";
    //         msg.message = "Bad Request";
    //         return cb(null, msg);
    //     } 
    //     else if (!data.school_id) {
    //         msg.status = "201";
    //         msg.message = "School id cannot be blank";
    //         return cb(null, msg);
    //     }
    //     else if (!data.user_id) {
    //         msg.status = "201";
    //         msg.message = "User id cannot be blank";
    //         return cb(null, msg);
    //     }
    //     let feedbackmaster = Studentfeedbackremarks.app.models.feedback_master
        
    //     if(!data.status) data['status'] = 1 

    //     feedbackmaster.find({
    //         where: { status: data.status, schoolId: data.school_id },
    //         include: {
    //                     relation: "assignedfeedback",
    //                     scope: {
    //                              where: {
    //                                     userId: data.user_id
    //                                 },
    //                             order: 'id DESC',
    //                     }
    //                 }
    //     }, (err, result) => {
    //         if(err) console.log(err);
    //         if(result){
    //             let positiveArr = [], negativeArr = []
    //             result.forEach(obj => {
    //                 obj = obj.toJSON();
    //                 if(obj.remarks_category.toLowerCase() == 'positive'){
    //                    if(obj.assignedfeedback){ 
    //                         positiveArr.push({
    //                             id: (obj.assignedfeedback[0])? obj.assignedfeedback[0].feedbackmasterId: obj.id, 
    //                             icon: obj.remarks_icon, 
    //                             name: obj.remarks_name,
    //                             value: (obj.assignedfeedback[0])? obj.assignedfeedback[0].status: '',
    //                             remark: (obj.assignedfeedback[0])? obj.assignedfeedback[0].remark: ''
    //                         })
    //                    } 
    //                 }else{
    //                     if(obj.assignedfeedback){
    //                         negativeArr.push({
    //                             id: (obj.assignedfeedback[0])? obj.assignedfeedback[0].feedbackmasterId: obj.id, 
    //                             icon: obj.remarks_icon, 
    //                             name: obj.remarks_name,
    //                             value: (obj.assignedfeedback[0])? obj.assignedfeedback[0].status: '',
    //                             remark: (obj.assignedfeedback[0])? obj.assignedfeedback[0].remark: ''
    //                         })
    //                    } 
    //                 }
    //             })

    //             msg.status = "200";
    //             msg.message = "Feedback fetched successfully";
               
    //             return cb(null, msg, {
    //                 "positive": positiveArr,
    //                 "negative": negativeArr
    //             });
    //         }
    //         else{
    //             msg.status = "201";
    //             msg.message = "Some error";
    //             return cb(null, msg);
    //         }
    //     })    
    // }

    Studentfeedbackremarks.studentFeedback = (data, cb) => {
        let msg = {}
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        } 
        else if (!data.school_id) {
            msg.status = "201";
            msg.message = "School id cannot be blank";
            return cb(null, msg);
        }
        else if (!data.user_id) {
            msg.status = "201";
            msg.message = "User id cannot be blank";
            return cb(null, msg);
        }
        else if (!data.added_by) {
            msg.status = "201";
            msg.message = "Added by cannot be blank";
            return cb(null, msg);
        }
        let feedbackmaster = Studentfeedbackremarks.app.models.feedback_master
        
        if(!data.status) data['status'] = 1 

        feedbackmaster.find({
            //where: { status: data.status, schoolId: data.school_id },
            where: { status: data.status },
        }, (err, result) => {
            if(err) console.log(err);
            if(result){ 
                Studentfeedbackremarks.waitUserPromise(data).next().value.then(res => {
                result = [...result, ...res]   
                let positiveArr = [], negativeArr = []
                result.forEach(obj => {
                    obj = obj.toJSON();
                    
                    let obcjt = {
                        id: obj.id, 
                        icon: obj.remarks_icon, 
                        name: obj.remarks_name,
                        value: '',
                        remark: '',
                        isAdmin: obj.isAdmin
                    }
                    
                    if(obj.remarks_category.toLowerCase() == 'positive'){
                       positiveArr.push(obcjt)
                    }else{
                       negativeArr.push(obcjt)
                    }
                })

                msg.status = "200";
                msg.message = "Feedback fetched successfully";
               
                return cb(null, msg, {
                    "positive": positiveArr,
                    "negative": negativeArr
                });
            }).catch(err => console.log(err))
            }
            else{
                msg.status = "201";
                msg.message = "Some error";
                return cb(null, msg);
            }
        })    
    }

    Studentfeedbackremarks.waitUserPromise = function* (data){
        yield new Promise((resolve, reject) => {
            let userfeedbackmaster = Studentfeedbackremarks.app.models.user_feedback_master
         
            userfeedbackmaster.find({
                //where: { status: data.status, schoolId: data.school_id, added_by: data.added_by },
                where: { status: data.status,added_by: data.added_by },
            }, (err, result) => {
                if(err) reject(err);
                if(result) resolve(result)
            })
        }).catch(err => console.log(err))
    }

    Studentfeedbackremarks.remoteMethod(
        'studentFeedback',
        {
            http: {path: '/studentFeedback', verb: 'post'},
            description: 'Get student feedback',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_type', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );

    Studentfeedbackremarks.behaviourdatewise = (data, cb) => {
        let msg = {}
        if (!data) {
            msg.status = "201";
            msg.message = "Bad Request";
            return cb(null, msg);
        } 
        else if(!data.user_id) {
            msg.status = "201";
            msg.message = "User id cannot be empty";
            return cb(null, msg);
        } 
        if(!data.status) data.status = 1

        Studentfeedbackremarks.find({
            fields: ['feedbackmasterId', 'added_date', 'remarks_category'],
            where: { 
                        userId: data.user_id,
                        status: data.status 
                   },
            order: 'id ASC'               
        }, (err, res)=>{
            if(err) {
                msg.status = "201";
                msg.message = "Some error";
                return cb(null, msg);
            }
            if(res){ 
                let positiveDateArr = [], negativeDateArr = []
                for (let key in res) {
                    
                    if(res[key].remarks_category){
                        if(res[key].remarks_category.toLowerCase() == 'positive')
                            positiveDateArr.push(Math.floor(new Date(res[key].added_date) / 1000))
                        else if(res[key].remarks_category.toLowerCase() == 'negative')
                            negativeDateArr.push(Math.floor(new Date(res[key].added_date) / 1000))
                    }
                }
                positiveDateArr.sort();
                negativeDateArr.sort();
                
               
                let positiveCheckArr = [], positiveResArr = {}, negativeCheckArr = [], negativeResArr = {}
                for (let key in positiveDateArr) {
                    if(positiveCheckArr.indexOf(positiveDateArr[key]) == -1) positiveResArr[positiveDateArr[key]] = 1
                    else positiveResArr[positiveDateArr[key]] = positiveResArr[positiveDateArr[key]] + 1
                    
                    positiveCheckArr.push(positiveDateArr[key])
                } 

                for (let key in negativeDateArr) {
                    if(negativeCheckArr.indexOf(negativeDateArr[key]) == -1) negativeResArr[negativeDateArr[key]] = 1
                    else negativeResArr[negativeDateArr[key]] = negativeResArr[negativeDateArr[key]] + 1
                    
                    negativeCheckArr.push(negativeDateArr[key])
                } 

                let a = new Set(Object.keys(positiveResArr));
                let b = new Set(Object.keys(negativeResArr));
                let a_difference = new Set(
                    [...a].filter(x => !b.has(x)));

                let b_difference = new Set(
                        [...b].filter(x => !a.has(x)));    
                let a_difference_arr = Array.from(a_difference)
                let b_difference_arr = Array.from(b_difference)    

                a_difference_arr.forEach(timestamp => negativeResArr[timestamp] = 0 )
                b_difference_arr.forEach(timestamp => positiveResArr[timestamp] = 0 )
               
                msg.status = "200";
                msg.message = "Record fetched successfully";
                return cb(null, msg, { positive: positiveResArr, negative: negativeResArr })
            }
        })
    }   

    Studentfeedbackremarks.remoteMethod(
        'behaviourdatewise',
        {
            http: {path: '/behaviourdatewise', verb: 'post'},
            description: 'Get behaviour datewise',
            accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
            returns: [{arg: 'response_type', type: 'json'}, {arg: 'response', type: 'json'}]
        }
    );



};
