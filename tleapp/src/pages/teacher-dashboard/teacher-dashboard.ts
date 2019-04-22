import { Component,OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import {FormGroup, FormControl} from '@angular/forms';
import { NotificationPage } from '../notification/notification';

@IonicPage()
@Component({
  selector: 'page-teacher-dashboard',
  templateUrl: 'teacher-dashboard.html',
})
export class TeacherDashboardPage implements OnInit {
  public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,private http: HttpClient,private myProvider: CommonProvider) {
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.homeworkExist = true;
    this.globalObj.messageExist = true;
    this.globalObj.noticeCircularExist = true;
    this.globalObj.showdashboard = false;
    this.globalObj.schoolName = window.localStorage.getItem('schoolName');
    this.getLocalStorageValues();
  }
  ngOnInit() {

       
        this.getDashboardData();
   }

  ionViewDidLoad() {
   // console.log('ionViewDidLoad ParentDashboardPage');
  }
    getLocalStorageValues()
  {
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.loginName = window.localStorage.getItem('loginName');
    this.globalObj.ProfileImage = window.localStorage.getItem('ProfileImage');
    this.globalObj.schoolContact = window.localStorage.getItem('schoolContact');
    this.globalObj.designation = window.localStorage.getItem('designation');
    this.globalObj.department = window.localStorage.getItem('department');
    
  }
  getDashboardData()
  {
   let params = {
              login_id:this.globalObj.loginId,
              student_user_id:this.globalObj.studentUserId,
              user_type:this.globalObj.userType,
              school_id:this.globalObj.schoolId,
              session_id:this.globalObj.sessionId,
              callfrom:"mobile",
              token:this.globalObj.token
   } 
            
            this.http.post(this.globalObj.serverUrl+"dashboards/dashboard", params).subscribe(data => {
              let responsedata: any  = data;
              if(responsedata.response_status.status=='200')
                {
                 this.setDashBoardData('online',responsedata);
                }
              
            }, error => {
                      if(window.localStorage.getItem('teacherDashboard'))
                        {
                          
                          let responsedata: any  = JSON.parse(window.localStorage.getItem('teacherDashboard'));
                          this.setDashBoardData('offline',responsedata);
                          
                        }
                        else
                          {
                      let errormsg = "Could not connect to server";
                      this.myProvider.toasterError(errormsg);
                          }
                    })
  }
    doRefresh(event){
  this.getDashboardData();
  event.complete();

}
  messageDetails(messageId, placeHolder){
        this.navCtrl.push('MessagedetailsPage',{id:messageId, place:placeHolder});
    }

    setDashBoardData(mode,responsedata)
      {
                  this.globalObj.message = responsedata.response.communication;
                  this.globalObj.messagecount = responsedata.response.messagecount;
                  this.globalObj.homework = responsedata.response.homework;
                  this.globalObj.homeworkcount = responsedata.response.homeworkcount;
                  this.globalObj.noticeCircular = responsedata.response.noticeCircular;
                  this.globalObj.noticeCircularCount = responsedata.response.allNotCirCount;
                  if(responsedata.response.noticeCircular.length==0)
                  this.globalObj.noticeCircularExist = false;
                  
                  if(responsedata.response.homework.length==0)
                  this.globalObj.homeworkExist = false;
                  if(responsedata.response.communication.length==0)
                  this.globalObj.messageExist = false;
                  this.globalObj.showdashboard = true;
                  if(mode=='online')
                    {
                     window.localStorage.setItem('teacherDashboard',JSON.stringify(responsedata));
                    }
      }

      redirectLocation(path,linkname="")
      {
        this.navCtrl.setRoot(path, {linkname: linkname});
        
      }
      announceDetails(announceId, placeHolder){ 
        this.navCtrl.push('NoticeCircularDetailPage',{id:announceId, place:placeHolder});
    }
    goToHomeworkDetail(item){
      this.navCtrl.push('HomeworkDetailPage', { data: item })
    }

}
