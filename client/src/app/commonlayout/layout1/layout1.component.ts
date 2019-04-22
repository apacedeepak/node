import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {FormGroup, FormBuilder ,FormArray,FormControl} from '@angular/forms';
import {BackendApiService} from './../../services/backend-api.service';
//import {GoogleAnalyticsEventsService} from './../../services/google-analytics-events.service';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as io from 'socket.io-client';
import { TranslateService } from '@ngx-translate/core';

declare let googleanalytics:Function;

@Component({
  selector: 'app-layout1',
  templateUrl: './layout1.component.html',
  styleUrls: ['./layout1.component.css']
 })
export class Layout1Component implements OnInit {


  socket: any;
  form: FormGroup;
  public newPass : any = {};
  public oldPass : any = {};
  public cnfPass : any = {};
  public alert_message : any  = '';
  public multi_select_val :any = '';
  public global: any = {};
  public menuList: any;
  public study_plan_alert : any = 0;
  public study_plan_alert_message : any;
  public notificationcount : any = 0;
  public notificationarray : any = [];
  public childArr : any = [];
  public multischoolArr : any = [];
   public classSection: any;
  public multischoolflag : any = false;
  public selectschool : any ;
  public lastlogintme:any;
  public ssoArr : any = [];
  class_section_name_from_common: any;
  section_id_from_common: any;
  domain: any;
  myClass = 'dropdown-position-user';
  languageDropdownVal:any='';
  languagechangeval: string = '';
  languageArr: any = [];
  transLang="en";
  multingual_enable:any;
  mylang='';
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
     
    this.translate.setDefaultLang( this.mylang);
    
    this.translate.use(this.mylang);
  }
  constructor(private router: Router, private myService: BackendApiService,
  private https: HttpClient,private http: Http, private fb: FormBuilder,private translate: TranslateService) {
    this.multingual_enable=this.myService.constant.Multingual;
    translate.setDefaultLang(this.transLang);
      this.global.project_name = this.myService.constant.PROJECT_NAME;
            
  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {
    this.translate.setDefaultLang(this.transLang);
   
    
   this.languageArr = [
      { identifier: 'en', name: 'English' },
      { identifier: 'hn', name: 'हिंदी' }

    ]
    this.transLang= window.localStorage.getItem('language');
    if(!this.transLang){
      this.transLang='en';  
    }
/*
    if(this.languageDropdownVal){
    this.languagechangeval = this.languageDropdownVal
  }
  else{
    this.languagechangeval = 'en';
  
  }*/
   

    this.domain = this.myService.commonUrl
    $('.userNotification .dropdown-menu').on({
        "click":function(e){
        e.stopPropagation();
        }
    });

    this.alert_message = '';
    this.global.success = 0;
    this.form = this.fb.group({
      oldPass: new FormControl(),
      newPass: new FormControl(),
      newcnfPass: new FormControl()
    })

//  this.myService.checkToken().then((token) =>{
   // alert(this.global.school_id);
    this.global.domain = this.myService.constant.domainName;
     this.global.userType = window.localStorage.getItem('user_type');
     this.global.userTypeData = "("+window.localStorage.getItem('user_type')+")";
      this.global.school_id = window.localStorage.getItem('school_id');
      this.global.token = window.localStorage.getItem('token');
      this.global.user_id = window.localStorage.getItem('user_id');
      this.global.old_user_id = window.localStorage.getItem('user_id_php');
      this.global.session_id = window.localStorage.getItem('session_id');
      this.global.ldap_status = window.localStorage.getItem('ldap_status');
      this.global.ldap_token = window.localStorage.getItem('ldap_token');
      //this.global.isClassTeacher = window.localStorage.getItem('isClassTeacher');
      this.global.port = window.localStorage.getItem('port');
      this.global.domainUrlwithSlash = this.myService.commonUrl;
        this.global.productName = this.myService.constant.PROJECT_NAME;
        this.global.domainWithProjectName = this.global.domainUrl+this.myService.constant.PROJECT_NAME;
      this.global.childImagePath = '';
      const productType = window.localStorage.getItem('product_type');
      //const productType = "schoolerp";

      this.global.product_type = productType.toLowerCase();
      
        this.global.appDownloadPath = 'http://49.249.236.39/tabletcontent/EMSCC.apk';
     
      this.global.student_user_id =  window.localStorage.getItem('student_user_id');

      const siblingUserId = window.localStorage.getItem('siblingUserId');
      
//      this.socket = io.connect(this.myService.commonUrl1+':'+this.global.port);
//            
//      this.socket.on('notify'+this.global.user_id, (userId) => {
//          
//          this.getallnotification();
//     
//         
//         
//      });
      let param = {
        "user_id" : this.global.user_id
      }
    
        if(this.global.userType.toLowerCase() == 'student'){
            this.global.setClass = "studentLogR";
        }else if(this.global.userType.toLowerCase() == 'parent'){
            this.global.setClass = "parentLogR";
        }else if(this.global.userType.toLowerCase() == 'Teacher'){
            this.global.setClass = "teacherLogR";
        }else if(this.global.userType.toLowerCase() == 'management'){
            this.global.setClass = "managementLogR";
        }
      
      this.https.post(this.myService.constant.apiURL + 'masteruserlog/lastlogin',param).subscribe(details => {
    
        const responseDetail: any = details;
        this.lastlogintme = '';
        if(responseDetail.response) this.lastlogintme=responseDetail.response.logout_time;
      });
      
      this.https.post(this.myService.constant.apiURL + 'sso_url_configurations/getssourl',{}).subscribe(ssoUrl => {
        this.ssoArr = ssoUrl['response'];
      });
      // console.log("hello");
      
      if(siblingUserId != '' && siblingUserId != null && siblingUserId != undefined){
        window.localStorage.setItem('student_user_id', siblingUserId);
        this.global.student_user_id =  window.localStorage.getItem('student_user_id');
      }
      
      var d = new Date();
    var n = d.getTime();
    //this.https.get(this.myService.constant.apiURL + 'layoutmenulist/layoutmenu?time='+n).subscribe(details => {
      var schoolId = window.localStorage.getItem('school_id');
      var utype = this.global.userType.toLowerCase();
    this.https.get(this.myService.constant.apiURL + 'leftmenu/leftmenu?product_type='+this.global.product_type+'&school_id='+schoolId+'&user_type='+utype+'&time='+n).subscribe(details => {
        const getData: any = details;
        
        if(this.global.userType.toLowerCase() == "teacher"){
            if(typeof getData.response.json_value == 'object'){
              this.menuList = getData.response.json_value.teacher;
            }else{
              this.menuList = JSON.parse(getData.response.json_value).teacher;
            }
           
        }
          if(this.global.userType.toLowerCase() == "student"){
            if(typeof getData.response.json_value == 'object'){
              this.menuList = getData.response.json_value.student;
            }else{
              this.menuList = JSON.parse(getData.response.json_value).student;
            }
            /*if(this.global.product_type != 'emscc'){
                this.menuList = this.menuList.filter(( obj ) => {
                  return obj.menu_name !== "Faculty Feedback";
              });
            }*/
        }
          if(this.global.userType.toLowerCase() == "parent"){
            if(typeof getData.response.json_value == 'object'){
              this.menuList = getData.response.json_value.parent;
            }else{
              this.menuList = JSON.parse(getData.response.json_value).parent;
            }
        }
        
        if(this.global.userType.toLowerCase() == "management"){
          this.myClass = 'dropdown-position-mgmnt';
          if(typeof getData.response.json_value == 'object'){
            this.menuList = getData.response.json_value.management;
          }else{
            this.menuList = JSON.parse(getData.response.json_value).management;
          }
        }  
   });

    const params = {"token": this.global.token, "school_id":window.localStorage.getItem('school_id')};

    this.https.post(this.myService.constant.apiURL + 'schools/schooldetail', params).subscribe(details => {
      const schoolDetail: any = details;
      const schoolArr = schoolDetail.response;
      this.global.school_name = schoolArr.school_name;
window.localStorage.setItem('school_name', this.global.school_name);
      this.global.school_logo = schoolArr.school_logo;
      this.global.sessions = schoolArr.has_many_sessions;


      for(let key in this.global.sessions){
        if(this.global.sessions[key].status == "Active"){
            window.localStorage.setItem('session_id', this.global.sessions[key].id);
            //window.localStorage.setItem('school_id', this.global.sessions[key].schoolId);
            let param = {
              "user_id": this.global.user_id,
              "session_id": this.global.session_id,
              "token": this.global.token,
              "type": this.global.userType,
              "school_id": this.global.school_id
            };
           //this.getallnotification();

      if(this.global.userType.toLowerCase() == 'parent'){ 

           const params = {
            "user_id":     this.global.student_user_id,
            "session_id": this.global.session_id,
            "token": this.global.token,
            "type": 'student',
            "school_id": this.global.school_id
          };
          
          this.https.post(this.myService.constant.apiURL + 'users/userdetail', params).subscribe(details => {
              let data: any = details;
              this.global.userClassSection = data.response.class_section;
         
        });
        }

            this.https.post(this.myService.constant.apiURL + 'users/userdetail', param).subscribe(details => {
                // const data = details;
                const data: any = details;
                
                window.localStorage.setItem('student_emscc_id', data.response.emsccId);
                
                const studentname = data.response.name;
                this.global.name = studentname;
                
                if(this.global.userType == "Teacher"){
                    window.localStorage.setItem('isClassTeacher', data.response.staffdetail.class_teacher);
                    this.global.isClassTeacher = data.response.staffdetail.class_teacher;
                    window.localStorage.setItem('class_teacher_section_id', data.response.staffdetail.class_teacher_section);
                  this.global.staffCode = data.response.staffdetail.staff_code;
                  
                    this.global.name = data.response.staffdetail.name;
                    this.global.profile_image = this.global.domainUrlwithSlash+data.response.staffdetail.profile_image;
                    this.global.profile_image_path = data.response.staffdetail.profile_image;
                    this.global.username = data.response.staffdetail.username;
                }
                if(this.global.userType.toLowerCase() == "student"){
                  // window.localStorage.setItem('student_class_section',data.response.class_section);
                  
                  this.global.profile_image = this.global.domainUrlwithSlash+data.response.student_photo;
                  this.global.profile_image_path = data.response.student_photo;
                  this.global.userClassSection = data.response.class_section;
                  this.global.name = data.response.name;
                  this.global.username = data.response.username;
                  window.localStorage.setItem('student_section_id', data.response.section_id);
                }
                
                if(this.global.userType.toLowerCase() == "parent"){
                  this.global.profile_image = this.global.domainUrlwithSlash+data.response.father_photo;
                  this.global.profile_image_path = data.response.father_photo;
                  this.global.name = data.response.name;
                  this.global.username = data.response.username;
                //  window.localStorage.setItem('student_class_section',data.response.class_section);
                
                //}
                //if(this.global.userType.toLowerCase() != "teacher"){
                    this.childArr = data.response.child_list;
                    this.childArr.forEach((obj)=>{
                      if(obj.user_id == window.localStorage.getItem('student_user_id')){
                        window.localStorage.setItem('student_name', obj.name);
                        window.localStorage.setItem('student_section_name', obj.section_name);
                        window.localStorage.setItem('student_adm_no', obj.admission_no);
                        this.global.childImagePath = obj.profile_image;
                        window.localStorage.setItem('student_section_id', obj.section_id);
                      }
                    })
                }
                
                this.multischoolArr = data.response.multi_school_detail;
                var currentlocation = JSON.stringify(window.location);
                if(this.multischoolArr!=undefined && this.multischoolArr.length>1 && currentlocation.indexOf("dashboard/main") != -1)
                {
                  
                  this.multischoolflag = true;
                  this.multi_select_val = this.multischoolArr[0].school_id;
                  if(this.multischoolArr.length>1 && window.localStorage.getItem("multi_pop")==null)
                    {
                  (<any>$('#multischoolpopup')).modal('show');
                    }
                  if(window.localStorage.getItem('multi_school_id')!='' && window.localStorage.getItem('multi_school_id')!=undefined && window.localStorage.getItem('multi_school_id')!=null)
                    {
                      window.localStorage.setItem('school_id', window.localStorage.getItem('multi_school_id'));
                      this.selectschool = window.localStorage.getItem('multi_school_id');
                    }
                    else
                      {
                   window.localStorage.setItem('school_id', this.multischoolArr[0].id);
                   this.selectschool = this.multischoolArr[0].id;
                      }
                }
                window.localStorage.setItem('stud_name', studentname);
                
                        if(this.global.userType.toLowerCase() == "student" && this.global.product_type == 'emscc')
                        {
                        //  this.studyplancheck();
                        }
            if(data.response.staffdetail && data.response.staffdetail.sectionlist.length > 0){
                this.class_section_name_from_common = data.response.staffdetail.sectionlist[0].class_section_name;
                this.section_id_from_common = data.response.staffdetail.sectionlist[0].section_id;
                window.localStorage.setItem('section_id_from_common', this.section_id_from_common);
                window.localStorage.setItem('class_section_name_from_common', this.class_section_name_from_common);
            }

                if(this.global.userType.toLowerCase() == 'teacher'){
                  this.global.name = data.response.staffdetail.name;
                }



            })


        }

      }


    });

//  });

  }

  logout(){
    window.localStorage.clear();
    if(environment.production)
    {
        window.location.href = this.myService.constant.domainName+"portal/login/portallogin";
    }else{
        this.router.navigate(["/login/portallogin"]);
    }
  }

  moveto(url){

    window.location.href = this.myService.constant.domainName+url;
  }

  sendTo(name,path){
  
      if(name == 'assessment' && this.global.product_type == 'emscc'){
          path = "school_lms/public/assessnew";
      }
     else if(name == 'assessment' && this.global.product_type != 'emscc'){
          path = "school_lms/public/assessnew";
      }
    //   else if(name == 'timetable' && this.global.product_type == 'emscc'){
    //     path = "/timetable/main";
    // }
    // else if(name== 'timetable'&& this.global.product_type!= 'emscc'){
    //   path="http://test.etl.extramarks.com/schoolerp/upload/teacher_timetable/E000001.pdf"
    // }            
    
    switch(name)
    {
       case "emscc":
       window.location.href = this.myService.constant.domainName+"admin/auth/user/userid/"+this.global.user_id;
       break;
       case "teach":
       window.open(this.myService.constant.domainName+path, '_blank');
      // window.location.href = ;
       break;
       case "viewcoverage":
       window.location.href = this.myService.constant.domainName+path;
       break;
       case "curriculum":
       window.location.href = this.myService.constant.domainName+path;
       break;
       case "assessment":
       window.location.href = this.myService.constant.domainName+path;
       break;
       case "studyprogress":
       window.open(window.localStorage.getItem('web_redirect_url'), '_blank');
       break;
      
       case "studyplan":
       if(this.study_plan_alert && this.study_plan_alert!=0 && this.study_plan_alert!=3)
        {

         (<any>$('#studyplanalert')).modal('show');

        }
        else if(this.study_plan_alert && this.study_plan_alert==0)
          {
            window.location.href = path;
          }

       break;

       case "timetable":
      
       if(this.global.product_type == 'emscc'){
        // alert("hello");
        this.router.navigate(["/timetable/main"]);
       }
       else{


     
         
        const params = {
          "userType": this.global.userType, 
          "olduserId":this.global.userType.toLowerCase()=='student'||this.global.userType.toLowerCase()=='parent'?'': this.global.old_user_id, 
          "classSection":this.global.userType.toLowerCase()=='student'||this.global.userType.toLowerCase()=='parent'? this.global.userClassSection :''
      
        };
console.log(params);
        this.https.post(this.myService.constant.apiURL + 'studyplans/timetable', params).subscribe(details => {
          const tymtable: any = details;
          if(tymtable.response_status.status == '200'){
          if(tymtable.response.filepath=="")
          {alert(this.translate.instant('file_not_exist'));return false;

          }
          window.open(tymtable.response.filepath, '_self', '');}
            //this.alert_message = tymtable.response.filepath;
         //   window.location.href = tymtable.response.filepath; } 
            // window.location.href= "http://test.etl.extramarks.com/schoolerp/upload/teacher_timetable/E000001.pdf";
          // else  if(tymtable.response_status.status != '200'){
          //   alert("status failed")
          // }
          

  //         this.global.status =tymtable.response_status ;
  //  this.global.responseMessage=tymtable.responseMessage;
  //  this.global.path=tymtable.response;
  //  window.location.href = this.myService.constant.domainName+path;       
   // window.localStorage.setItem('school_name', this.global.school_name);
    //       this.global.school_logo = schoolArr.school_logo;
    //       this.global.sessions = schoolArr.has_many_sessions;
    

       });
      
      //  
       
    }
  }
  }
  changeOfRoutes(){

    googleanalytics();
    
    var currentlocation = JSON.stringify(window.location);
    if (this.multischoolArr != undefined && this.multischoolArr.length > 1 && currentlocation.indexOf("dashboard/main") != -1) {
      this.multischoolflag = true;
    }
    else {
      this.multischoolflag = false;
    }

      if(this.global.userType != '' && this.global.userType != null && this.global.userType != undefined){
            this.getallnotification();
      }
  }

  getallnotification() {
    let param = {
              "user_id": this.global.user_id,
               "token": this.global.token,
               "old_user_id": this.global.old_user_id,

            };
    this.https.post(this.myService.constant.apiURL + 'notification/notification',param).subscribe(details => {
      const notificationDetail: any = details;

      if (notificationDetail.response_status.status == '200') {

        this.notificationcount = notificationDetail.response.notificationCount;
        this.notificationarray = notificationDetail.response.notificationArr;

      }



    });
  }
  updateallnotification() {
    if(this.notificationcount>0)
      {
    let param = {
              "user_id": this.global.user_id,
               "token": this.global.token,

            };
    this.https.post(this.myService.constant.apiURL + 'notification/updatenotificationall',param).subscribe(details => {
      const notificationUpdate: any = details;

      this.getallnotification();


    });
      }
  }

  switchToERP(type){
    if(type == 'emscc'){
      window.location.href = this.myService.constant.domainName+"admin/auth/user/userid/"+this.global.user_id;
    }else{
      window.location.href = this.myService.constant.domainName+"schoolerp/home/index";
    }


  }
  studyplancheck()
  {
    let param = {
      "user_id":this.global.user_id,
      "token": this.global.token
    };
      this.https.post(this.myService.constant.domainName + 'admin/schedulertle/sync/get-alert-type',param).subscribe(details => {
      const studyplanalert: any = details;
        if(studyplanalert.response_code==1)
          {
            this.study_plan_alert = studyplanalert.alert_type;
            if(studyplanalert.alert_type==1)
              {
              this.study_plan_alert_message = "Dear "+ window.localStorage.getItem('stud_name')+",<br> Due date for next installment is "+studyplanalert.due_date+",<br>kindly deposit the fees for uninterrupted services.<br>Regards,<br>Admin";
              }
            if(studyplanalert.alert_type==2)
              {
              this.study_plan_alert_message = "Dear "+ window.localStorage.getItem('stud_name')+",<br> kindly deposit your fees for the pending<br>installment to continue using the services.<br>Regards,<br>Admin";
              }

          }



    });


  }

  siblingChange(userId){
    window.localStorage.setItem("student_user_id", userId);
    window.location.reload();
  }

  multischoolChange(event){
    window.localStorage.setItem("multi_school_id", event.target.value);
    window.localStorage.setItem("school_id", event.target.value);
    window.localStorage.setItem('multi_pop', event.target.value);
    window.localStorage.removeItem('homework_section_id');
    window.localStorage.removeItem('homework_section_name');
    window.localStorage.removeItem('homework_subject_id');
    window.localStorage.removeItem('homework_class_id');
    

    let schoolParam = {
        school_id: event.target.value
    }
    var url = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME + '/erpapi/index/getlogincredential/school_id/'+event.target.value;
        this.https.get(url).subscribe(function (details) {
            console.log(details);
        });
    

    this.https.get(this.myService.constant.apiURL + 'sessions/getactiveschoolsession?school_id='+event.target.value).subscribe(details => {
      const getData: any = details;
        if(getData.response.id!=undefined){
          window.localStorage.setItem('session_id', getData.response.id);
            
            window.location.reload();
        }
    
    })
  }

  multischoolChangeVal(event){
    this.multi_select_val = event.target.value;
    
  }
  multischoolSubmit(){
    
    window.localStorage.setItem("multi_school_id", this.multi_select_val);
    window.localStorage.setItem("school_id", this.multi_select_val);
    window.localStorage.setItem('multi_pop', this.multi_select_val);
    window.localStorage.removeItem('homework_section_id');
    window.localStorage.removeItem('homework_section_name');
    window.localStorage.removeItem('homework_subject_id');
    window.localStorage.removeItem('homework_class_id');

    let schoolParam = {
        school_id: this.multi_select_val
    }
    var urls = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME + '/erpapi/index/getlogincredential/school_id/'+this.multi_select_val;
        this.https.get(urls).subscribe(function (details) {
            console.log(details);
        });

    this.https.get(this.myService.constant.apiURL + 'sessions/getactiveschoolsession?school_id='+this.multi_select_val).subscribe(details => {
      const getData: any = details;
        if(getData.response.id!=undefined){
          window.localStorage.setItem('session_id', getData.response.id);
            
            window.location.reload();
        }
    
    })
  }

  popUpOpen(){
    (<any>$('#changepass')).modal('show');
  }

  cancel(){
    (<any>$('#changepass')).modal('hide');
    this.form.patchValue({oldPass: '',newPass:'', newcnfPass: ''});
  }

  changePassword(value, event){
    this.newPass = value.newPass;
    this.oldPass = value.oldPass;
    this.cnfPass = value.newcnfPass;
    if (this.oldPass == undefined || this.oldPass == null || this.oldPass == '') {
      this.form.patchValue({oldPass: '',newPass:'', newcnfPass: ''});
      this.alert_message =  this.translate.instant('old_password_not_blank');
      setTimeout(() => {
        this.alert_message = '';
      }, 2000);
      return false;
    }
    if (this.newPass == undefined || this.newPass == null || this.newPass == '') {
      this.form.patchValue({newPass:'', newcnfPass: ''});
      this.alert_message = this.translate.instant('new_password_not_blank');
      setTimeout(() => {
        this.alert_message = '';
      }, 2000);
      return false; 
    }
    if (this.cnfPass == undefined || this.cnfPass == null || this.cnfPass == '') {
      this.form.patchValue({newcnfPass: ''});
      this.alert_message = this.translate.instant('confrim_password_not_blank');
      setTimeout(() => {
        this.alert_message = '';
      }, 2000);
      return false;
    }
    if (this.newPass === this.cnfPass) {
      let param = {
        "user_id" : this.global.user_id,
        "password" : this.newPass,
        "old_password" : this.oldPass,
        "user_type" : this.global.userType,
        "token": this.global.token
      }
      this.https.post(this.myService.constant.apiURL + 'users/changepassword',param).subscribe(details => {

         const responseDetail: any = details;
         
          if(responseDetail.response.responseCode == '200')
          {  
            this.global.success = 1;
            this.alert_message = this.translate.instant(responseDetail.response.responseMessage);
            this.form.patchValue({oldPass: '',newPass:'', newcnfPass: ''});
            window.location.href = this.myService.constant.domainName+"portal/login/portallogin";
            setTimeout(() => {
              this.alert_message = '';
              this.global.success = 0;
            }, 2000);
          }else{
            this.alert_message = this.translate.instant(responseDetail.response.responseMessage);
            setTimeout(() => {
              this.alert_message = '';
            }, 2000);
          }
       });
    }else {
      this.form.patchValue({newcnfPass: ''});
      this.alert_message =  this.translate.instant('confirm_new_not_same');
      setTimeout(() => {
        this.alert_message = '';
      }, 2000);
      return false;
  }
  }
  languagechange(){
  //  console.log(this.transLang);
    window.localStorage.setItem('language',this.transLang);   
  // window.location.reload();
   this.translate.use(this.transLang);
    // window.localStorage.setItem('language','en');
}
   
}
