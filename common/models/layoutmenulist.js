'use strict';

module.exports = function(Layoutmenulist) {

  Layoutmenulist.layoutmenu = (cb) =>{
      let menu = [{
          teacher : [
              {
                menu_name: 'Profile', linkfor:'in', linkname:'', priority: 1, color: '', path: '', color: 'tabColor1', icon:'assets/images/icons/profile-new.png',
                sub_menu: [
                  {submenu_name: 'View Profile', linkfor:'in', linkname:'', priority: 1, path:'/profile/main', color: 'tabColor2', icon:'assets/images/icons/view-profile.png'},
                  {submenu_name: 'Attendance', linkfor:'in', linkname:'', priority: 2, path:'/attendance/main', color: 'tabColor3', icon:'assets/images/icons/attendance.png'},
                  // {submenu_name: 'My Attendance', linkfor:'in', linkname:'', priority: 3, path:'', color: 'tabColor4', icon:'assets/images/icons/attendance.png'},
                  // {submenu_name: 'Apply Leave', linkfor:'in', linkname:'', priority: 4, path:'', color: 'tabColor5', icon:'assets/images/icons/attendance.png'},
                  // {submenu_name: 'Applied Leave Status', linkfor:'in', linkname:'', priority: 5, path:'', color: 'tabColor6', icon:'assets/images/icons/attendance.png'},
                   {submenu_name: 'Class Record', linkfor:'in', linkname:'classrecord', priority: 6, path:'/classrecord/main', color: 'tabColor7', icon:'assets/images/icons/attendance.png'},
                 // {submenu_name: 'Take Attendance', linkfor:'in', linkname:'', priority: 7, path:'/attendance/takeattendance', color: 'tabColor8', icon:'assets/images/icons/attendance.png'},
                  ]
              },
              {menu_name: 'Communication', linkfor:'in', linkname:'', priority: 2, color: '', path: '', color: 'tabColor2', icon:'assets/images/icons/communication.png',
                sub_menu: [
                  {submenu_name: 'Message & Circular', linkfor:'in', linkname:'', priority: 1, path:'/communication/main', color: 'tabColor3', icon:'assets/images/icons/communication.png'},
                  {submenu_name: 'Homework', linkfor:'in', linkname:'', priority: 2, path:'/homework/main', color: 'tabColor5', icon:'assets/images/icons/homework.png'}

                ]
              },
              {menu_name: 'Coverage', linkfor:'in', linkname:'', priority: 3, color: '', path: '', color: 'tabColor3', icon:'assets/images/icons/study-coverage.png',
                sub_menu: [
                  {submenu_name: 'Teach', linkfor:'out', linkname:'teach', priority: 1, path:'school_lms/public', color: 'tabColor4', icon:'assets/images/icons/attendance.png'},
                   {submenu_name: 'Time Table', linkfor:'out', linkname:'timetable', priority: 2, path:'/timetable/main', color: 'tabColor5', icon:'assets/images/icons/time-table.png'},
                  {submenu_name: 'View Coverage', linkfor:'out', linkname:'viewcoverage', priority: 3, path:'school_lms/public/mis/subjectwiseserviceusage', color: 'tabColor6', icon:'assets/images/icons/study-coverage.png'},
                  {submenu_name: 'Plan My Curriculum', linkfor:'out', linkname:'curriculum', priority: 4, path:'school_lms/public/curriculum/index/calendarview', color: 'tabColor7', icon:'assets/images/icons/homework.png'},
                  {submenu_name: 'Assessment Center', linkfor:'out', linkname:'assessment', priority: 5, path:'school_lms/public/assessnew', color: 'tabColor8', icon:'assets/images/icons/homework.png'},

                  {submenu_name: 'Study Plan', linkfor:'in', linkname:'', priority: 6, path:'/coverage/main', color: 'tabColor9', icon:'assets/images/icons/homework.png'}
                ]
              },
             {menu_name: 'Groups', linkfor:'in', linkname:'', priority: 4, color: '', path: '/group/main', color: 'tabColor3', icon:'assets/images/icons/homework.png',
				  sub_menu: []
			 }
      ],
      student: [{
                menu_name: 'Profile', linkfor:'in', linkname:'', priority: 1, color: '', path: '', color: 'tabColor1', icon:'assets/images/icons/profile-new.png',
                sub_menu: [
                  {submenu_name: 'View Profile', linkfor:'in', linkname:'', priority: 1, path:'/profile/main', color: 'tabColor2', icon:'assets/images/icons/view-profile.png'},
                  {submenu_name: 'Attendance', linkfor:'in', linkname:'', priority: 2, path:'/attendance/subjectwiseattendance', color: 'tabColor3', icon:'assets/images/icons/attendance.png'}
                  // {submenu_name: 'Take Attendance', linkfor:'in', linkname:'', priority: 2, path:'', color: 'tabColor3', icon:'assets/images/icons/attendance.png'}
                ]
              },
               {
                menu_name: 'Communication', linkfor:'in', linkname:'', priority: 2, color: '', path: '', color: 'tabColor2', icon:'assets/images/icons/communication.png',
                sub_menu: [
                  {submenu_name: 'Message & Circular', linkfor:'in', linkname:'', priority: 1, path:'/communication/main', color: 'tabColor3', icon:'assets/images/icons/communication.png'},
                  {submenu_name: 'Homework', linkfor:'in', linkname:'', priority: 2, path:'/homework/main', color: 'tabColor5', icon:'assets/images/icons/homework.png'}
                ]
              },
                {
                menu_name: 'Study Coverage', linkfor:'in', linkname:'', priority: 3, color: '', path: '', color: 'tabColor3', icon:'assets/images/icons/study-coverage.png',
                sub_menu: [
              //    {submenu_name: 'Study Progress', linkfor:'in', linkname:'', priority: 2, path:'', color: 'tabColor8', icon:''},
              //  {submenu_name: 'Study Plan', linkfor:'out', linkname:'studyplan', priority: 2, path:'http://www.extramarks.com', color: 'tabColor8', icon:'assets/images/icons/homework.png'},  
//              {submenu_name: 'Study Plan', linkfor:'in', linkname:'studyplan', priority: 2, path:'/coverage/main', color: 'tabColor8', icon:'assets/images/icons/homework.png'},
                  {submenu_name: 'Time Table', linkfor:'out', linkname:'timetable', priority: 1, path:'/timetable/main', color: 'tabColor7', icon:'assets/images/icons/time-table.png'},
                  {submenu_name: 'Assessment Center', linkfor:'out', linkname:'assessment', priority: 5, path:'school_lms/public/assessnew', color: 'tabColor8', icon:'assets/images/icons/homework.png'}
                ]
              },
              {menu_name: 'Faculty Feedback', linkfor:'in', linkname:'', priority: 4, color: '', path: '/feedback/givefeedback', color: 'tabColor3', icon:'assets/images/icons/homework.png',
                  sub_menu: []
              }
            ],
      parent: [
        {
                menu_name: 'Profile', linkfor:'in', linkname:'', priority: 1, color: '', path: '', color: 'tabColor1', icon:'assets/images/icons/profile-new.png',
                sub_menu: [
                  {submenu_name: 'View Profile', linkfor:'in', linkname:'', priority: 1, path:'/profile/main', color: 'tabColor2', icon:'assets/images/icons/view-profile.png'},
	{submenu_name: 'Attendance', linkfor:'in', linkname:'', priority: 2, path:'/attendance/subjectwiseattendance', color: 'tabColor3', icon:'assets/images/icons/attendance.png'},
                  {submenu_name: 'Fee', linkfor:'in', linkname:'', priority: 1, path:'/fee/main', color: 'tabColor2', icon:'assets/images/icons/fee-collection.png'},
//                  {submenu_name: 'Medical', linkfor:'in', linkname:'', priority: 4, path:'/medical/main', color: 'tabColor3', icon:'assets/images/icons/fee-collection.png'},
                  // {submenu_name: 'Take Attendance', linkfor:'in', linkname:'', priority: 2, path:'', color: 'tabColor3', icon:'assets/images/icons/attendance.png'}
                ]
              },
               {
                menu_name: 'Communication', linkfor:'in', linkname:'', priority: 2, color: '', path: '', color: 'tabColor2', icon:'assets/images/icons/communication.png',
                sub_menu: [
                  {submenu_name: 'Message & Circular', linkfor:'in', linkname:'', priority: 1, path:'/communication/main', color: 'tabColor3', icon:'assets/images/icons/communication.png'},
                  {submenu_name: 'Homework', linkfor:'in', linkname:'', priority: 2, path:'/homework/main', color: 'tabColor5', icon:'assets/images/icons/homework.png'},
                 // {submenu_name: 'EMSCC', linkfor:'out', linkname:'emscc', priority: 3, path:'', color: 'tabColor5', icon:'assets/images/icons/usage.png'}
                ]
              },
                {
                menu_name: 'Study Coverage', linkfor:'in', linkname:'', priority: 3, color: '', path: '', color: 'tabColor3', icon:'assets/images/icons/study-coverage.png',
                sub_menu: [
                // {submenu_name: 'Study Progress', linkfor:'in', linkname:'', priority: 2, path:'', color: 'tabColor8', icon:'assets/images/icons/usage.png'},
//                 {submenu_name: 'Study Plan', linkfor:'in', linkname:'', priority: 2, path:'/coverage/main', color: 'tabColor8', icon:'assets/images/icons/homework.png'},
                  {submenu_name: 'Time Table', linkfor:'out', linkname:'timetable', priority: 1, path:'/timetable/main', color: 'tabColor7', icon:'assets/images/icons/time-table.png'},
                  {submenu_name: 'Assessment Center', linkfor:'out', linkname:'assessment', priority: 5, path:'school_lms/public/assessnew', color: 'tabColor8', icon:'assets/images/icons/homework.png'}
                ]
              },

      ],
      management: [{
        "menu_name": "Home",
        "linkfor": "in",
        "linkname": "",
        "priority": 4,
        "color": "",
        "path": "LayoutPage",
        "color": "tabColor3",
        "icon": "assets/images/icons/homework.png",
        "sub_menu": []
      }, {
        "menu_name": "Communication",
        "linkfor": "in",
        "linkname": "",
        "priority": 1,
        "color": "",
        "path": "/communication/main",
        "color": "tabColor1",
        "icon": "assets/images/icons/communication.png",
        "sub_menu": []
      }, {
        "menu_name": "Fee Collection",
        "linkfor": "in",
        "linkname": "",
        "priority": 2,
        "color": "",
        "path": "/fee/main",
        "color": "tabColor2",
        "icon": "assets/images/icons/fee-collection.png",
        "sub_menu": []
      }, {
        "menu_name": "Student Attendance",
        "linkfor": "in",
        "linkname": "",
        "priority": 3,
        "color": "",
        "path": "/attendance/viewall",
        "color": "tabColor3",
        "icon": "assets/images/icons/attendance.png",
        "sub_menu": []
      }, {
        "menu_name": "Usage Tracker",
        "linkfor": "in",
        "linkname": "",
        "priority": 4,
        "color": "",
        "path": "/dashboard/main",
        "color": "tabColor4",
        "icon": "assets/images/icons/usage.png",
        "sub_menu": []
      }, {
        "menu_name": "Library",
        "linkfor": "in",
        "linkname": "",
        "priority": 5,
        "color": "",
        "path": "/dashboard/main",
        "color": "tabColor5",
        "icon": "assets/images/icons/libarary.png",
        "sub_menu": []
      }, {
        "menu_name": "Change Password",
        "linkfor": "in",
        "linkname": "",
        "priority": 4,
        "color": "",
        "path": "ChangePasswordPage",
        "color": "tabColor3",
        "icon": "assets/images/icons/homework.png",
        "sub_menu": []
      },
      {
        "menu_name": "Log Out",
        "linkfor": "in",
        "linkname": "",
        "priority": 4,
        "color": "",
        "path": "LogOutPage",
        "color": "tabColor3",
        "icon": "assets/images/icons/homework.png",
        "sub_menu": []
      }]
      }];


      cb(null, menu)
  };

   Layoutmenulist.remoteMethod(
            'layoutmenu',
            {
                http: {path: '/layoutmenu', verb: 'get'},
                description: 'Get menu ',
                returns: {arg: 'response', type: 'object'}
            }
    );
};
