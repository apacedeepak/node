'use strict';

var config = require('../../server/config');

var port = config.port;


module.exports = Object.freeze({

    LOCAL_URL: 'http://localhost',
    LOCAL_PORT: port,
    PROJECT_NAME: 'schoolerp',
    FIREBASE_API_KEY:'AAAAWGGo470:APA91bFXOh7EHhN-iP9dUnDnURGFc0ZmHwW6n8Pj6lFro3cwVuY-rEvd3UsQ1az1fhm1x8cnXQEgtTt0jAOxa6_HjD16CCTCJg10LXTvbSYHDdGlAFrcJn-9rCEZthr0_Z3NMmycxntlcrw03TXQc_DM1FbLG0CuCQ',
    FCM_PUSH:'1',
    product_type:'emscc',
    SMS_URL1: 'http://www.smsjust.com/blank/sms/user/urlsms.php?username=emtrans&pass=4LhzJ3@$&senderid=EMSCCC',
    SMS_URL2: 'http://www.smsjust.com/blank/sms/user/response.php?Scheduleid=',
    creat_enquiry_URl:'http://test.loms.extramarks.com/EnquiryManagement/EnquiryCapture',
    retrieve_enquiry_URl:'http://test.loms.extramarks.com/EnquiryManagement/RetrieveEnquiry',
    enquiry_list_URl:"http://test.loms.extramarks.com/EnquiryManagement/RetrieveEnquiryCenterwise",
    dpp_lms_URL: "http://dev.emscc.extramarks.com/school_lms/public/assessnew/studentnew/daily-practice-paper-api",
    enquiry_status_update:"http://test.loms.extramarks.com/EnquiryManagement/EnquiryUpdate",
    ENVIRONMENT:'development',
    ADM:'S',
    BASE_URL: __dirname.split('api')[0],
    WEB_API_KEY : "A8AB80364005DD992E89978E8",
    WEB_API_SALT : "rmerp@1234",
    RABBITMQ_PUSH:'0',//Kindly make sure RabbitMq should be installed in server, otherwise set this value to Zero(0) to avoid error
    SYNC_PROCESS:'0',//Kindly change this value to 1, once master to master sync is require, also need to change below SERVER_CONFIG values
    SCHOOLERP_URL: 'http://localhost/schoolerp/',
    MYHR_API_KEY : "wa3r5h11JK8GONB7P3AMek0mngtpDXrH",
    MYHR_API_SALT : "viFaaN0vDEOQKcmVnJkx2qJamcD3VgSm",
    MYHR_API_URL:"http://test.myhr.extramarks.com",
    LMS_API_URL:"http://beta.emscc.extramarks.com/school_lms/public/api/v1.0/"
});
