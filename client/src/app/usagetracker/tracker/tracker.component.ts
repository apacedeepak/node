import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
    
    public globalObj: any = {};
    public usageDetailArr: any = {};
    public userlist: any = [];
    public userListArr: any = [];
    mylang:any='';
  constructor(private myService: BackendApiService,
              private http: HttpClient,private translate: TranslateService) {
                this.mylang= window.localStorage.getItem('language');
   
                if(this.mylang){
                 translate.setDefaultLang( this.mylang);}
                 else{
                   translate.setDefaultLang( 'en');
                 }
               }

  ngOnInit() {
    this.globalObj.sessionid = window.localStorage.getItem('session_id');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    
    this.globalObj.message = '';
    
    this.globalObj.student = true; 
    this.globalObj.parent = true; 
    this.globalObj.teacher = true;
    this.globalObj.user_type = "Student";
     
    this.getUsage(this.globalObj.user_type);
    
    
    
  }
  
  getUsage(userType){
      
      const usageParam = {
          school_id: this.globalObj.schoolid,
          session_id: this.globalObj.sessionid,
          user_type: userType,
          token: this.globalObj.token
      }
      
    const url = this.myService.constant.apiURL + "users/usagetracker";
        this.http.post(url, usageParam).subscribe( trackerDetail => {
            var data: any = trackerDetail;
            this.usageDetailArr = data.response;
            //console.log(data.response);
        });
  }
  
    clickOn(flag){
        $(".showall").removeClass('btn-info');
        if(flag == 'student'){
            $("#"+flag).addClass('btn-info');
            this.globalObj.student = true; 
            this.globalObj.parent = false; 
            this.globalObj.teacher = false; 
            this.globalObj.user_type = "Student";
        }else if(flag == 'parent'){
            $("#"+flag).addClass('btn-info');
            this.globalObj.student = false; 
            this.globalObj.parent =  true; 
            this.globalObj.teacher = false; 
            this.globalObj.user_type = "Parent";
        }else if(flag == 'teacher'){
            $("#"+flag).addClass('btn-info');
            this.globalObj.student = false; 
            this.globalObj.parent =  true; 
            this.globalObj.teaher = true; 
            this.globalObj.user_type = "Teacher";
        }    
        this.getUsage(this.globalObj.user_type);
    }
    
    
    showPopUp(classSectionId, status, deviceType, userType){
        const param = {
          session_id: this.globalObj.sessionid,
          //token: this.globalObj.token,
          section_id:classSectionId,
          user_type:userType,
          status:status,
          device_type:deviceType
        }
      
        const url = this.myService.constant.apiURL + "user_sections/usersbysection";
        this.http.post(url, param).subscribe( response => {
            var data: any = response;
            this.userlist = data.response;
            (<any>$('#showpopup')).modal('show');
            
            this.userListArr = [];
            for(var i in this.userlist){
                if(this.userlist[i].assigned_users){
                    if(userType == 'Teacher'){
                        this.userListArr.push({
                            name: this.userlist[i].assigned_users.staff.name,
                            mobile_no: this.userlist[i].assigned_users.staff.mobile,
                            email: this.userlist[i].assigned_users.staff.email,
                            username: this.userlist[i].assigned_users.user_name
                        })
                    }else if(userType == 'Student'){
                        this.userListArr.push({
                            name: this.userlist[i].assigned_users.students.name,
                            mobile_no: this.userlist[i].assigned_users.students.student_phone,
                            email: this.userlist[i].assigned_users.students.student_email,
                            username: this.userlist[i].assigned_users.user_name
                        })
                        console.log(this.userListArr);
                    }else if(userType == 'Parent'){
                        if(this.userlist[i].assigned_users.students.studentbelongtoparent.parentidbyuser){
                            this.userListArr.push({
                                name: this.userlist[i].assigned_users.students.studentbelongtoparent.father_name,
                                mobile_no: this.userlist[i].assigned_users.students.studentbelongtoparent.father_contact,
                                email: this.userlist[i].assigned_users.students.studentbelongtoparent.father_email,
                                username: this.userlist[i].assigned_users.students.studentbelongtoparent.parentidbyuser.user_name
                            });
                        }
                    }
                }
            }
        });
    }

}
