import { Component,OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import {FormGroup, FormControl} from '@angular/forms';
import { NotificationPage } from '../notification/notification';
import { AppAvailability } from '@ionic-native/app-availability';
import { WebIntent } from '@ionic-native/web-intent';
import { Market } from '@ionic-native/market';
@IonicPage()
@Component({
  selector: 'page-student-dashboard',
  templateUrl: 'student-dashboard.html',
})
export class StudentDashboardPage implements OnInit {
    public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
             private http: HttpClient,private myProvider: CommonProvider,
             private appAvailability: AppAvailability,private platform: Platform,
             private webIntent: WebIntent,private market: Market) {
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.homeworkExist = true;
    this.globalObj.messageExist = true;
    this.globalObj.showdashboard = false;
    this.globalObj.schoolName = window.localStorage.getItem('schoolName');
    this.getLocalStorageValues();
  }
  ngOnInit() {

       
        this.getDashboardData();
   }

  ionViewDidLoad() {
   // console.log('ionViewDidLoad StudentDashboardPage');
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
    this.globalObj.classTeacher = window.localStorage.getItem('classTeacherName');
  }
  getDashboardData()
  {
   let params = {
              login_id:this.globalObj.loginId,
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
                      if(window.localStorage.getItem('studentDashboard'))
                        {
                          
                          let responsedata: any  = JSON.parse(window.localStorage.getItem('studentDashboard'));
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
homeworkDetail(homeworkId){
        this.navCtrl.push('StudentHomeworkDetailPage',{id:homeworkId});
    }
      setDashBoardData(mode,responsedata)
      {
                  this.globalObj.message = responsedata.response.communication;
                  this.globalObj.messagecount = responsedata.response.messagecount;
                  this.globalObj.homework = responsedata.response.homework;
                  this.globalObj.homeworkcount = responsedata.response.homeworkcount;
                  if(responsedata.response.homework.length==0)
                  this.globalObj.homeworkExist = false;
                  if(responsedata.response.communication.length==0)
                  this.globalObj.messageExist = false;
                  this.globalObj.showdashboard = true;
                  if(mode=='online')
                    {
                  window.localStorage.setItem('studentDashboard',JSON.stringify(responsedata));
                    }
      }
      redirectLocation(path)
      {
        this.navCtrl.setRoot(path);
        
      }

      getAppList()
      { 
        
//window.open("https://play.google.com/store/apps/details?id=com.Extramarks.Smartstudy&hl=en","_system"),
        
        let app;
        let playstorePath ;

            if (this.platform.is('ios')) {
              app = 'extramarks-smart-study';
              playstorePath = "https://itunes.apple.com/us/app/extramarks-smart-study/id1232323918?mt=8​";

              // app = 'facebook://';
              // playstorePath = "http://play.google.com/store/apps/details?id=com.Extramarks.Smartstudy";

            } else if (this.platform.is('android')) {
              app = 'com.Extramarks.Smartstudy';
              playstorePath = "https://play.google.com/store/apps/details?id=com.Extramarks.Smartstudy&hl=en","_system";
            }
            
            this.appAvailability.check(app)
              .then(
                (yes: boolean) => window.open("http://google.com"),
                (no: boolean) => window.open("http://facebook.com")
              );
      }
}
