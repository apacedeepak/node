'use strict';
var constantval = require('./constant');
var dateFormat = require('dateformat');
module.exports = function (Fileupload) {
    var errorMessage = {};
    var successMessage = {};
    Fileupload.fileupload = function (ctx, options, location, cb) {


        var Oauthtoken = Fileupload.app.models.oauthaccestoken;
        var Notes = Fileupload.app.models.notes;


        if (!options)
            options = {};
        if (location == 'studyplan') {
            ctx.req.params.container = 'attachment';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {

                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        cb(null, errorMessage);
                    } else {
                        var column = fileObj.fields;
                        Fileupload.checkTokenValidation(column, cb).then(function (responseobj)
                        {

                            if (responseobj.status == '000')
                            {
                                errorMessage.status = "000";
                                errorMessage.message = responseobj.message;
                                return cb(null, errorMessage);
                            }

                            var fileInfo = fileObj.files;
                            var uploadArr = [];
                            if (column.id[0] == '') {
                                var id = column.id[0];
                                var subject_id = column.subject_id[0];
                                var user_id = column.user_id[0];
                                var session_id = column.session_id[0];
                                var section_id = column.section_id[0];
                                var schoolId = column.schoolId[0];
                                var token = column.token[0];
                                var class_id = column.class_id[0];
                            } else {
                                var id = column.id[0];
                            }
                            for (var i = 0; i < 100; i++) {
                                if (fileInfo[i] == undefined) {
                                    break;
                                } else {
                                    uploadArr.push("upload/attachment/" + fileInfo[i][0].name);
                                }
                            }
                            var request = {
                                "id": id, "file_path": uploadArr
                            };
                            if (column.id[0] == '') {
                                var request = {
                                    "subject_id": subject_id, "session_id": session_id, "section_id": section_id, "schoolId": schoolId,
                                    "user_id": user_id, "class_id": class_id, "file_path": uploadArr, "id": id
                                };
                            }
                            cb(null, request);
                        })


                    }
                }
            });
        }

        if (location == 'notes')
        {
            ctx.req.params.container = 'notes';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {

                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        cb(null, errorMessage);
                    } else {
                        var column = fileObj.fields;
                        Fileupload.checkTokenValidation(column, cb).then(function (responseobj)
                        {
                            if (responseobj.status == '000')
                            {
                                errorMessage.status = "000";
                                errorMessage.message = responseobj.message;
                                return cb(null, errorMessage);
                            }

                            console.log(column);

                            var notes_id = '';
                            if (column.id) {
                                notes_id = column.id[0];
                            }

                            var notes_title = column.notes_title[0];
                            var notes_text = column.notes_text[0];
                            var author = column.author[0];
                            var session_id = column.session_id[0];
                            var school_id = column.school_id[0];
                            var section_id = column.section_id[0];
                            var created_date = dateFormat(column.created_date[0], "yyyy-mm-dd HH:MM:ss");
                            var subject_id = column.subject_id[0];
                            var file_listall = [];
                            var validate = {
                                "notes_title": notes_title, "notes_text": notes_text, "author": author, "session_id": session_id, "school_id": school_id,
                                "section_id": section_id, "created_date": created_date, "subject_id": subject_id
                            };
                            var response = Notes.validaterequest(validate);
                            if (response.status == '201') {
                                cb(null, response);
                            }

                            var fileInfo = fileObj.files;
                            var uploadArr = [];

                            if (column.file_list[0] != '')
                                {
                                    file_listall = column.file_list[0].split(',');

                                }


                            for (var i = 0; i < 100; i++) {
                                if (fileInfo[i] == undefined) {
                                    break;
                                } else {
                                    uploadArr.push("upload/notes/" + fileInfo[i][0].name);
                                }
                            }

                            if (file_listall.length > 0)
                                {
                                    file_listall.forEach(function (filepath)
                                    {
                                        uploadArr.push(filepath);
                                    });
                                }

                            var request = {
                                "notes_id": notes_id, "notes_title": notes_title, "notes_text": notes_text, "author": author, "sessionId": session_id, "schoolId": school_id,
                                "subjectId": subject_id, "share_status": 'Active', "notes_type": "Shared", "created_date": created_date, "sectionId": section_id, "attachments": uploadArr
                            };
                            cb(null, request);
                        })



                    }
                }
            });
        }

        if (location == 'homework')
        {
            ctx.req.params.container = 'attachment';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {

                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        cb(null, errorMessage);
                    } else {
                        var column = fileObj.fields;
                        Fileupload.checkTokenValidation(column, cb).then(function (responseobj)
                        {
                            if (responseobj.status == '000')
                            {
                                errorMessage.status = "000";
                                errorMessage.message = responseobj.message;
                                return cb(null, errorMessage);
                            }

                            Fileupload.validateCheck(location, column, cb);

                            var fileInfo = fileObj.files;
                            var uploadArr = [];


                            var file_listall = [];
                            if (column.file_list[0] != '')
                            {
                                file_listall = column.file_list[0].split(',');

                            }
                            var subject_id = column.subject_id[0];
                            var content = column.content[0];
                            var title = column.title[0];
                            var origin = column.origin[0];
                            var channel = column.channel[0];
                            var type = column.type[0];
                            var homework_id = column.homework_id[0];
                            var timestamp = dateFormat(Date(), "yyyy-mm-dd HH:MM:ss");
                            var createdById = column.user_id[0];
                            var target_date = column.target_date[0];
                            var created_date = dateFormat(Date(), "yyyy-mm-dd");
                            var classsec_ids = column.classsec_ids[0];
                            var group_ids = column.group_ids[0];
                            var user_id = column.user_id[0];
                            var assign_to = column.assign_to[0];
                            var session_id = column.session_id[0];
                            var section_id = column.section_id[0];
                            var class_id = column.class_id[0];
                            //var user_type = column.user_type[0];
                            var token = column.token[0];

                            for (var i = 0; i < 100; i++) {
                                if (fileInfo[i] == undefined) {
                                    break;
                                } else {

                                    uploadArr.push("upload/attachment/" + fileInfo[i][0].name);
                                }
                            }
                            if (file_listall.length > 0)
                            {
                                file_listall.forEach(function (filepath)
                                {
                                    uploadArr.push(filepath);
                                });
                            }

                            var request = {
                                "subject_id": subject_id, "title": title, "origin": origin, "created_date": created_date, "assign_to": assign_to, "token": token,
                                "content": content, "channel": channel, "type": type, "homework_id": homework_id, "target_date": target_date,
                                "group_ids": group_ids, "classsec_ids": classsec_ids, "session_id": session_id, "section_id": section_id, "class_id": class_id,
                                "user_id": user_id, "timestamp": timestamp, "createdById": createdById, "file_path": uploadArr
                            };

                            cb(null, request);


                        });






                    }
                }
            });
        }
        /* Kindly note Dheeraj has commented the library code to avoid the error in below files
         node_modules/loopback-component-storage/lib/storage-handler.js in upload function
         kindly comment that code if anytime you update this package
         **/
        if (location == 'message')
        {
            ctx.req.params.container = 'attachment';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
              console.log(fileObj.fields);
            console.log(fileObj.files);
                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        cb(null, errorMessage);
                    } else {
                        var column = fileObj.fields;
                        Fileupload.checkTokenValidation(column, cb).then(function (responseobj)
                        {
                            if (responseobj.status == '000')
                            {
                                errorMessage.status = "000";
                                errorMessage.message = responseobj.message;
                                return cb(null, errorMessage);
                            }


                            var fileInfo = fileObj.files;
                            var uploadArr = [];

                            if (location == 'message')
                            {
                                var receipient_id = [];
                                var receipient_type = [];
                                var file_listall = [];
                                var student_flag = [];

                                let promise = new Promise((resolve, reject) => {
                                    if (column.receipient_id[0] != '' && column.receipient_type[0] != '')
                                    {
                                        receipient_id = column.receipient_id[0].split(',');
                                        receipient_type = column.receipient_type[0].split(',');

                                        resolve(receipient_id);
                                    } else if (column.receipient_id[0] == '' && column.channel_name[0] != '') {
                                        if (column.channel_name[0] == 'group') {
                                            let groupModel = Fileupload.app.models.group_users;
                                            let data = {
                                                channelId: column.channel_id[0]
                                            };

                                            groupModel.getusertogroup(data, (err, getData) => {
                                                getData.forEach((getGroup) => {
                                                    receipient_id.push(getGroup.userId);
                                                });
                                            });
                                        } else if (column.channel_name[0] == 'classsection') {
                                            let usrerSectionModel = Fileupload.app.models.user_sections;
                                            let data = {
                                                section_id: column.channel_id[0]
                                            };
                                            usrerSectionModel.usersbysectionid(data, (err, getData) => {

                                                getData.forEach((getSection) => {
                                                    receipient_id.push(getSection.userId);
                                                });
                                            });
                                        }

                                        resolve(receipient_id);
                                    }

                                }).then((receipient_id) => {

                                    return new Promise((resolve, reject) => {
                                        let studentModel = Fileupload.app.models.student;
                                        if (column.student_check[0] == "true" && column.receipient_type[0].toLowerCase() == 'parent') {


                                            let param = {
                                                userArr: receipient_id
                                            };

                                            var studentUserIdArr =  receipient_id;

                                            studentModel.studentparentsdetail(param, (err, getstudentData) => {
                                                receipient_id = [];
                                                for (let i in getstudentData) {
                                                    if(getstudentData[i].studentbelongtoparent()){
                                                        receipient_id.push(getstudentData[i].studentbelongtoparent().userId);
                                                        student_flag.push(getstudentData[i].userId);
                                                    }
                                                }

                                                for(let i in studentUserIdArr){
                                                    receipient_id.push(studentUserIdArr[i])
                                                    student_flag.push('');
                                                }
                                                resolve(receipient_id);
                                            });
                                        } else if (column.receipient_type[0].toLowerCase() == 'parent') {
                                            let param = {
                                                userArr: receipient_id
                                            };
                                            studentModel.studentparentsdetail(param, (err, getstudentData) => {
                                                receipient_id = [];
                                                for (let i in getstudentData) {
                                                    if(getstudentData[i].studentbelongtoparent()){
                                                        receipient_id.push(getstudentData[i].studentbelongtoparent().userId);
                                                        student_flag.push(getstudentData[i].userId);
                                                    }
                                                }
                                                resolve(receipient_id);
                                            });
                                        } else {
                                            resolve(receipient_id);
                                        }
                                    });
                                });





                                if (column.file_list[0] != '')
                                {
                                    file_listall = column.file_list[0].split(',');

                                }
                                var channel = {};
                                channel.channel_name = column.channel_name[0];
                                channel.channel_id = column.channel_id[0];

                                var student_user_id_flag = '';

                                if (column.receipient_type[0].toLowerCase() == 'parent') {
                                    student_user_id_flag = student_flag;
                                }else{
                                    student_user_id_flag = column.student_user_id_flag[0].split(',');
                                }

                                var subject = column.subject[0];
                                var content = column.content[0];

                                var message_type = column.message_type[0];
                                var draft_id = '';
                                if (message_type.toLowerCase() == 'draft')
                                    draft_id = column.draft_id[0];
                                var message_id = '';
                                if (message_type.toLowerCase() == 'message')
                                    message_id = column.message_id[0];
                                var user_id = column.user_id[0];
                                var school_id = column.school_id[0];
                                var user_type = column.user_type[0];
                                var student_check = column.student_check[0];
                                var token = column.token[0];
                                var post_by = "Other";
                                if (column.post_by) {
                                    post_by = column.post_by[0];
                                }

                                for (var i = 0; i < 100; i++) {
                                    if (fileInfo[i] == undefined) {
                                        break;
                                    } else {

                                        uploadArr.push("upload/attachment/" + fileInfo[i][0].name);
                                    }
                                }
                                if (file_listall.length > 0)
                                {
                                    file_listall.forEach(function (filepath)
                                    {
                                        uploadArr.push(filepath);
                                    });
                                }

                                Promise.all([promise]).then((receipient_id) => {
                                    var request = {
                                        "receipient_id": receipient_id, "student_user_id_flag": student_user_id_flag, "receipient_type": receipient_type, "subject": subject,
                                        "content": content, "message_type": message_type, "draft_id": draft_id, "message_id": message_id,
                                        "post_by": post_by, "user_id": user_id, "channel": channel, "school_id": school_id, "user_type": user_type, "student_check": student_check, "token": token, "file_path": uploadArr
                                    };

                                    cb(null, request);
                                });

                                // promise.then((receipient_id) => {
                                //   var request = {
                                //     "receipient_id": receipient_id, "receipient_type": receipient_type, "subject": subject,
                                //     "content": content, "message_type": message_type, "draft_id": draft_id, "message_id": message_id,
                                //     "user_id": user_id, "channel": channel, "school_id": school_id, "user_type": user_type, "student_check": student_check, "token": token, "file_path": uploadArr
                                // };

                                //   cb(null, request);
                                // });


                            }


                            // }
                            // });
                        })





                    }
                }
            });
        }
        if (location == 'studenthomeworksubmit')
        {
            ctx.req.params.container = 'attachment';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {

                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        cb(null, errorMessage);
                    } else {
                        var column = fileObj.fields;
                        Fileupload.checkTokenValidation(column, cb).then(function (responseobj)
                        {
                            if (responseobj.status == '000')
                            {
                                errorMessage.status = "000";
                                errorMessage.message = responseobj.message;
                                return cb(null, errorMessage);
                            }

                            Fileupload.validateCheck(location, column, cb);

                            var fileInfo = fileObj.files;
                            var uploadArr = [];


                            var homework_id = column.homework_id[0];
                            var user_id = column.user_id[0];
                            var content = column.content[0];


                            for (var i = 0; i < 100; i++) {
                                if (fileInfo[i] == undefined) {
                                    break;
                                } else {

                                    uploadArr.push("upload/attachment/" + fileInfo[i][0].name);
                                }
                            }


                            var request = {
                                "homework_id": homework_id, "user_id": user_id, "content": content, "file_path": uploadArr
                            };

                            cb(null, request);
                        })

                    }
                }
            });
        }
        if (location == 'profileimage')
        {
            ctx.req.params.container = 'student_image';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {

                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        return cb(null, errorMessage);
                    } else {

                        var column = fileObj.fields;
                        Fileupload.checkTokenValidation(column, cb).then(function (responseobj)
                        {

                            if (responseobj.status == '000')
                            {
                                errorMessage.status = "000";
                                errorMessage.message = "Error";
                                // return cb(null, errorMessage);
                            }


                            var fileInfo = fileObj.files;

                            var uploadArr = [];
                            var user_id = column.user_id[0];
                            var user_id_php = '';
                            var session_id = column.session_id[0];
                            for (var i = 0; i < 100; i++) {
                                if (fileInfo[i] == undefined) {
                                    break;

                                } else {

                                    uploadArr.push("upload/student_image/" + fileInfo[i][0].name);
                                }
                            }
                            var request = {
                                "user_id": user_id, "file_path": uploadArr, "user_id_php": user_id_php, "session_id": session_id
                            };

                            cb(null, request);
                        })
                    }
                }
            });
        }
        if (location == 'chat') {
            ctx.req.params.container = 'attachment';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {

                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        return cb(null, errorMessage);
                    } else {

                        var column = fileObj.fields;
                        Fileupload.checkTokenValidation(column, cb).then(function (responseobj)
                        {

                            if (responseobj.status == '000')
                            {
                                errorMessage.status = "000";
                                errorMessage.message = "Error";
                                // return cb(null, errorMessage);
                            }


                            var fileInfo = fileObj.files;

                            var uploadArr = [];
                            var user_id = column.user_id[0];
                            var session_id = column.session_id[0];
                            var school_id = column.school_id[0];
                            var chat_message = column.chat_message[0];
                            var group_id = column.group_id[0];
                            var user_type = column.user_type[0];


                            for (var i = 0; i < 100; i++) {
                                if (fileInfo[i] == undefined) {
                                    break;

                                } else {

                                    uploadArr.push("upload/attachment/" + fileInfo[i][0].name);
                                }
                            }
                            var request = {
                                "user_id": user_id, "attachment": uploadArr, "session_id": session_id,
                                "school_id": school_id, "chat_message": chat_message, "group_id": group_id,
                                "user_type": user_type
                            };

                            cb(null, request);
                        })
                    }
                }
            });
        }

        if(location == 'feedback'){
            ctx.req.params.container = 'student_feedback';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, (err, fileObj) => {
               console.log(fileObj)
                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        return cb(null, errorMessage);
                    } else {

                            var column = fileObj.fields;
                            var fileInfo = fileObj.files;

                            var uploadArr = [];
                            let name = column.name[0];
                            let school_id = column.school_id[0];
                            let added_by = column.added_by[0];
                            let remarks_category = column.remarks_category[0];
                            let id = 0
                            if(column.id && column.id.length > 0) id = column.id[0];

                            for (var i = 0; i < 100; i++) {
                                if (fileInfo[i] == undefined) {
                                    break;

                                } else {

                                    uploadArr.push("/upload/student_feedback/" + fileInfo[i][0].name);
                                }
                            }
                            var request = {
                                "remarks_icon": uploadArr[0],
                                "remarks_name": name,
                                "status": 1,
                                "added_date": dateFormat(Date(), "isoDateTime"),
                                "schoolId": school_id,
                                "added_by": added_by,
                                "remarks_category": remarks_category
                            };

                            if(+id) request['id'] = id

                            cb(null, request);
                    }
                }
            })
        }
        if (location == 'feedback_master') {
            ctx.req.params.container = 'student_feedback';
            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {            
                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);
    
                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        return cb(null, errorMessage);
                    } else {
                        var column = fileObj.fields; 
                       //console.log(column);                   
                        var fileInfo = fileObj.files;
                        var uploadArr = [];               
                            let name = column.name[0];
                            let school_id = column.school_id[0];
                            let added_by = column.added_by[0];
                            let remarks_category = column.remarks_category[0];                    
                        var id=column.id[0];       
    
                        for (var i = 0; i < 100; i++) {
                            if (fileInfo[i] == undefined) {                         
                                break;
                            } else {
                                uploadArr.push("/upload/student_feedback/" + fileInfo[i][0].name);
                            }
                        }
                        var request = {
                                "id":id,
                                "file_path": uploadArr,
                                "remarks_name": name,
                                "status": 1,                                
                                "schoolId": school_id,
                                "added_by": added_by,
                                "remarks_category": remarks_category
                            };                          
                        cb(null, request);
                    }
                }
            });
        }
        if (location == 'center') {
            ctx.req.params.container = 'school_logo';

            Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
                if (!fileObj) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);

                } else {
                    if (err) {
                        errorMessage.status = "201";
                        errorMessage.message = "Error Occurred";
                        return cb(null, errorMessage);
                    } else {
                        var column = fileObj.fields;
                        var fileInfo = fileObj.files;

                        var uploadArr = [];
                        var state = column.state[0];
                        var city = column.city[0];
                        var center_code = column.center_code[0];
                        var center_name = column.center_name[0];
                        var address = column.address[0];
                        var mobile = column.mobile[0];
                        var contact_person = column.contact_person[0];
                        var gstin_no = column.gstin_no[0];
                        var id = column.id[0];
                        var image_path = column.image_path[0];
                        var school_email = column.school_email[0];


                        for (var i = 0; i < 100; i++) {
                            if (fileInfo[i] == undefined) {
                                break;
                            } else {
                                uploadArr.push("upload/school_logo/" + fileInfo[i][0].name);
                            }
                        }
                        var request = {
                            "state": state, "file_path": uploadArr, "city": city,
                            "center_code": center_code, "center_name": center_name, "address": address,
                            "mobile": mobile, "contact_person" : contact_person, "gstin_no" : gstin_no,
                            "id": id, "image_path": image_path, "school_email": school_email
                        };

                        cb(null, request);
                    }
                }
            });
        }

      if (location == 'doubts') {
        ctx.req.params.container = 'student_doubts';
        Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
          if (!fileObj) {
            errorMessage.status = "201";
            errorMessage.message = "Error Occurred";
            return cb(null, errorMessage);

          } else {
            if (err) {
              errorMessage.status = "201";
              errorMessage.message = "Error Occurred";
              return cb(null, errorMessage);
            } else {
              var column = fileObj.fields;
              var fileInfo = fileObj.files;

              var uploadArr = [];


              var userId = column.userId[0];
              var title = column.title[0];
              var subjectId = column.subjectId[0];
              var topic = column.topic[0];
              var enter_doubts = column.enter_doubts[0];

              var sessionId = column.sessionId[0];
              var schoolId = column.schoolId[0];
              var sectionId = column.sectionId[0];
              
              if(column["id"]!=undefined){
                 var id=column.id[0];
              }else{
                 var id = "";
              }

             if(column["upload_file_old"]!=undefined){
                var upload_file_old=column.upload_file_old[0];
             }else{
                var upload_file_old = "";
             }
              

              for (var i = 0; i < 100; i++) {
                if (fileInfo[i] == undefined) {
                 // console.log("file upload fail..");
                  break;
                } else {
                  uploadArr.push("upload/student_doubts/" + fileInfo[i][0].name);
                }
              }
              var request = {
                "id": id,"userId": userId, "title": title, "file_path": uploadArr,
                "subjectId": subjectId, "topic": topic, "enter_doubts": enter_doubts, "upload_file_old":upload_file_old, 
                "sessionId": sessionId, "schoolId": schoolId, "sectionId": sectionId
              };
              cb(null, request);
            }
          }
        });
      }

      if (location == 'doubtsolution') {
          ctx.req.params.container = 'student_doubts_solution';
          Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
              if (!fileObj) {
                  errorMessage.status = "201";
                  errorMessage.message = "Error Occurred";
                  return cb(null, errorMessage);
              } else {
                  if (err) {
                      errorMessage.status = "201";
                      errorMessage.message = "Error Occurred";
                      return cb(null, errorMessage);
                  } else {
                      var column = fileObj.fields;
                      var fileInfo = fileObj.files;

                      var uploadArr = [];

                      var userId = column.userId[0];
                      var doubtsId = column.doubtsId[0];
                      var solution = column.solution[0];

                      var sessionId = column.sessionId[0];
                      var schoolId = column.schoolId[0];

                      for (var i = 0; i < 100; i++) {
                          if (fileInfo[i] == undefined) {
                           // console.log("file upload fail.");
                              break;
                          } else {
                              uploadArr.push("upload/student_doubts_solution/" + fileInfo[i][0].name);
                          }
                      }

                      var request = {
                          "userId":userId, "doubtsId": doubtsId, "file_path": uploadArr,
                          "solution": solution, "schoolId":schoolId,"sessionId":sessionId
                      };
                      cb(null, request);
                  }
              }
          });
      }
      if (location == 'inventory_item_master') {
        ctx.req.params.container = 'inventory';
        Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
            if (!fileObj) {
                errorMessage.status = "201";
                errorMessage.message = "Error Occurred";
                return cb(null, errorMessage);

            } else {
                if (err) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);
                } else {
                    var column = fileObj.fields;                    
                    var fileInfo = fileObj.files;
                    var uploadArr = [];
                    var user_id = column.user_id[0];
                    var inv_category_master_id=column.inv_category_master_id[0];
                    var item_name=column.item_name[0];
                    var unit_id=column.unit_id[0];
                    var price=column.price[0];
                    var description=column.description[0];
                    var id=column.id[0];

                    for (var i = 0; i < 100; i++) {
                        if (fileInfo[i] == undefined) {
                            break;
                        } else {
                            uploadArr.push("upload/inventory/" + fileInfo[i][0].name);
                        }
                    }
                    var request = {
                        'id':id,
                        "user_id":user_id,
                        "file_path": uploadArr,
                        "inv_category_master_id":inv_category_master_id,
                        "item_name":item_name,
                        "unit_id":unit_id,
                        "price":price,
                        "description":description
                    };
                    cb(null, request);
                }
            }
        });
    }
    if (location == 'inventory_raise_request') {
        ctx.req.params.container = 'inventory';
        Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
            if (!fileObj) {
                errorMessage.status = "201";
                errorMessage.message = "Error Occurred";
                return cb(null, errorMessage);

            } else {
                if (err) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);
                } else {
                    var column = fileObj.fields;
                    var fileInfo = fileObj.files;
                    var uploadArr = [];
                    var user_id = column.user_id[0];
                    var inv_category_master_id=column.inv_category_master_id[0];
                    var item_total_price=column.item_total_price[0];
                    var price=column.price[0];
                    var center_id=column.center_id[0];
                    var item_id=column.item_id[0];
                    var item_quantity=column.item_quantity[0];
                    var description=column.description[0];
                    var id=column.id[0];

                    for (var i = 0; i < 100; i++) {
                        if (fileInfo[i] == undefined) {
                            break;
                        } else {
                            uploadArr.push("upload/inventory/" + fileInfo[i][0].name);
                        }
                    }
                    var request = {
                        'id':id,
                        "user_id":user_id,
                        "file_path": uploadArr,
                        "inv_category_master_id":inv_category_master_id,
                        "inv_item_master_id":item_id,
                        "price":price,
                        "item_total_price":item_total_price,
                        "center_id":center_id,
                        "quantity":item_quantity,
                        "description":description
                    };
                    cb(null, request);
                }
            }
        });
    }



    if (location == 'announcement') {
      ctx.req.params.container = 'announcement';
      Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
        if (!fileObj) {
          errorMessage.status = "201";
          errorMessage.message = "Error Occurred";
          return cb(null, errorMessage);

        } else {
          if (err) {
            errorMessage.status = "201";
            errorMessage.message = "Error Occurred";
            return cb(null, errorMessage);
          } else {
            var column = fileObj.fields;
            var fileInfo = fileObj.files;
            var uploadArr = [];

            var userId = column.userId[0];
            var title = column.title[0];
            var type = column.type[0];
            var batch = column.batch[0];
            var assign_centre = column.assign_centre[0];
            var description = column.description[0];
            var start_date = column.start_date[0];
            var end_date = column.end_date[0];
            var status = column.status[0];
       


            for (var i = 0; i < 100; i++) {
              if (fileInfo[i] == undefined) {
                console.log("file upload fail.....!");
                //break;
              } else {
                uploadArr.push("upload/announcement/" + fileInfo[i][0].name);
              }
            }
            var request = {
                "senderId": userId, "title": title, "file_path": uploadArr,
                "batch": batch, "type": type, "assign_centre": assign_centre, "description":description,
                 "start_date":start_date, "end_date":end_date, "status":status
            };
            cb(null, request);
          }
        }
      });
    }




    if (location == 'expense_request') {
        ctx.req.params.container = 'expense';
        Fileupload.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {            
            if (!fileObj) {
                errorMessage.status = "201";
                errorMessage.message = "Error Occurred";
                return cb(null, errorMessage);

            } else {
                if (err) {
                    errorMessage.status = "201";
                    errorMessage.message = "Error Occurred";
                    return cb(null, errorMessage);
                } else {
                    var column = fileObj.fields;                    
                    var fileInfo = fileObj.files;
                    var uploadArr = [];
                    
                    var user_id = column.user_id[0];                   
                    var session_id=column.session_id[0];
                    var center_id=column.center_id[0];
                    var expense_date=column.expense_date[0];
                    var expense_for=column.expense_for[0];
                    var expense_category=column.expense_category[0];
                    var expense_master_id=column.expense_name[0];
                    var payment_mode=column.payment_mode[0]; 
                    var amount=column.expense_amount[0]; 
                    var gst_amount=column.gst_amount[0]; 
                    var total_amount=column.total_amount[0]; 
                    var expense_type=column.expense_type[0];                     
                    var id=column.id[0];       

                    for (var i = 0; i < 100; i++) {
                        if (fileInfo[i] == undefined) {                         
                            break;
                        } else {
                            uploadArr.push("upload/expense/" + fileInfo[i][0].name);
                        }
                    }
                    var request = {
                        'id':id,
                        "user_id":user_id, 
                        "file_path": uploadArr,
                        "session_id":session_id,
                        "center_id":center_id,
                        "expense_date":expense_date,
                        "expense_for":expense_for,
                        "expense_category":expense_category,
                        "expense_master_id":expense_master_id,                       
                        "payment_mode":payment_mode,
                        "amount":amount,
                        "gst_amount":gst_amount,
                        "total_amount":total_amount,
                        "expense_type":expense_type
                    };                  
                    cb(null, request);
                }
            }
        });
    }
    };
    Fileupload.validateCheck = function (callfrom, req, cb) {
        switch (callfrom) {

            case "homework":
                if (req.user_id[0] == undefined || req.user_id[0] == '' || req.user_id[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "User id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.type[0] == undefined || req.type[0] == '' || req.type[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Type can't blank";
                    return cb(null, errorMessage);
                }
                if (req.class_id[0] == undefined || req.class_id[0] == '' || req.class_id[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Class id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.section_id[0] == undefined || req.section_id[0] == '' || req.section_id[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Section id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.subject_id[0] == undefined || req.subject_id[0] == '' || req.subject_id[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Subject id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.type[0] != undefined && req.type[0] == 'draft' && (req.class_id[0] == undefined || req.class_id[0] == '')) {
                    errorMessage.status = "201";
                    errorMessage.message = "Class Id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.channel[0] == undefined || req.channel[0] == '' || req.channel[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Channel can't blank";
                    return cb(null, errorMessage);
                }
                if (req.origin[0] == undefined || req.origin[0] == '' || req.origin[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Origin id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.file_list[0] == undefined) {
                    errorMessage.status = "201";
                    errorMessage.message = "File list can't blank";
                    return cb(null, errorMessage);
                }
                if (req.homework_id[0] == undefined) {
                    errorMessage.status = "201";
                    errorMessage.message = "Homework id can't blank";
                    return cb(null, errorMessage);
                }
//                if (req.subject_id[0] == undefined || req.subject_id[0] == '' || req.subject_id[0] == null) {
//                    errorMessage.status = "201";
//                    errorMessage.message = "Subject id can't blank";
//                    return cb(null, errorMessage);
//                }
                if (req.target_date[0] == undefined || req.target_date[0] == '' || req.target_date[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Submission date can't blank";
                    return cb(null, errorMessage);
                }
                if (req.assign_to[0] == undefined || req.assign_to[0] == '' || req.assign_to[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Assign To can't blank";
                    return cb(null, errorMessage);
                }
                if (req.assign_to[0] != undefined && req.assign_to[0].toLowerCase() == 'class' &&
                        (req.classsec_ids[0] == undefined || req.classsec_ids[0] == '' || req.classsec_ids[0] == null)) {
                    errorMessage.status = "201";
                    errorMessage.message = "Section Id's can't blank";
                    return cb(null, errorMessage);
                }
                if (req.assign_to[0] != undefined && req.assign_to[0].toLowerCase() == 'group' &&
                        (req.group_ids[0] == undefined || req.group_ids[0] == '' || req.group_ids[0] == null)) {
                    errorMessage.status = "201";
                    errorMessage.message = "Group Id's can't blank";
                    return cb(null, errorMessage);
                }
                break;
            case "studenthomeworksubmit":
                if (req.user_id[0] == undefined || req.user_id[0] == '' || req.user_id[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "User id can't blank";
                    return cb(null, errorMessage);
                }
                if (req.homework_id[0] == undefined || req.homework_id[0] == '' || req.homework_id[0] == null) {
                    errorMessage.status = "201";
                    errorMessage.message = "Homework Id can't blank";
                    return cb(null, errorMessage);
                }

        }

    }

    Fileupload.checkTokenValidation = function (allfields, cb) {
        return new Promise(function (resolve, reject)
        {
            if (constantval.ENVIRONMENT == 'development')
            {
                successMessage.status = '200';
                successMessage.message = 'success';
                resolve(successMessage);
            } else {
                if (allfields.token == undefined || allfields.token == '' || allfields.token == null)
                {
                    errorMessage.status = "000";
                    errorMessage.message = "Token Required";
                    resolve(errorMessage);
                }
                var Oauthtoken = Fileupload.app.models.oauthaccestoken;
                let tempurl = '';
                Oauthtoken.gettoken(allfields.token[0],tempurl, function (err, tokenArr) {
                    if (tokenArr.status == '000')
                    {
                        errorMessage.status = "000";
                        errorMessage.message = tokenArr.message;
                        resolve(errorMessage);
                    } else {
                        successMessage.status = '200';
                        successMessage.message = 'success';
                        resolve(successMessage);
                    }

                });
            }
        });
    }
    Fileupload.remoteMethod(
            'fileupload',
            {
                description: 'Files Upload',
                accepts: [
                    {arg: 'ctx', type: 'object', http: {source: 'context'}},
                    {arg: 'options', type: 'object', http: {source: 'query'}},
                ],
                returns: {
                    arg: 'fileObject', type: 'object', root: true
                },
                http: {verb: 'post'}
            }
    );

};
