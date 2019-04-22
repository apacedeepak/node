import { Component,Input,OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';

/**
 * Generated class for the NotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage implements OnInit {
  @Input() callFromType: string;
 public globalObj: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams,private http: HttpClient,private myProvider: CommonProvider) {
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.displayBell = false;
    this.globalObj.display = false;
    this.globalObj.notfExist = true;
    this.globalObj.notificationImagePath = ['','../../assets/imgs/communication.png','../../assets/imgs/communication.png',
                                           '../../assets/imgs/communication.png','../../assets/imgs/communication.png',
                                           '../../assets/imgs/communication.png','../../assets/imgs/communication.png',
                                           '../../assets/imgs/communication.png','../../assets/imgs/communication.png',
                                          '../../assets/imgs/communication.png','../../assets/imgs/communication.png'];
                                          
    if(navParams.get('action') || localStorage.getItem('notificationback'))
      {
        this.globalObj.display = true;
        localStorage.removeItem('notificationback');
      }
      else{
        this.globalObj.displayBell = true;
      }
    
    
      
  }
  ngOnInit()
  {
    
    if(this.callFromType)
      {
       this.updateAndGetNotification(this.callFromType);
      }
      else{
    this.getAllNotification();
      }
    
  }

  ionViewDidLoad() {
    
  }
  updateAndGetNotification(type)
  {
   const params = {user_id:window.localStorage.getItem('loginId'),
                     type:[type],
                    token:window.localStorage.getItem('token')}
    this.http.post(this.globalObj.serverUrl+"notification/updatemodulenotification", params).subscribe(data => {
      this.getAllNotification();
      
    })
  }
  getAllNotification()
  {
    const params = {user_id:window.localStorage.getItem('loginId'),
                    token:window.localStorage.getItem('token')}
    this.http.post(this.globalObj.serverUrl+"notification/notification", params).subscribe(data => {
      let responsedata: any  = data;
              if(responsedata.response_status.status=='200')
                {
                 this.globalObj.notificationCount = responsedata.response.notificationCount;
                 this.globalObj.notification = responsedata.response.notificationArr;
                 if(responsedata.response.notificationArr.length==0)
                  {
                 this.globalObj.notfExist = false;
                  }
                }
    })
  }
  redirectToDetail(path)
  {
    this.navCtrl.setRoot(path,{action:'list'});
  }
  notificationRedirect(type,moduleKeyId)
  {
    let path = 'LayoutPage';
    let data;
    switch(type)
    { 
      case 1:
       path = 'MessagedetailsPage';
       data = {id:moduleKeyId,place:'Inbox'};
      
      break;
      case 2:
      path = 'NoticeCircularDetailPage';
      data = {id:moduleKeyId,place:'Notice'};
      break;
      case 3:
      path = 'NoticeCircularDetailPage';
      data = {id:moduleKeyId,place:'Circular'};
      break;
      case 4:
      let userType = window.localStorage.getItem('userType');
      path = userType.toLowerCase()=='teacher'?'HomeworkDetailPage':'StudentHomeworkDetailPage';
      data = {id:moduleKeyId,place:'Homework'};
      break;
      }
    this.updateModuleNotification(type,path,data)
    
  }
 updateModuleNotification(type,path,dataobj)
 {
     const params = {user_id:window.localStorage.getItem('loginId'),
                     type:[type],
                    token:window.localStorage.getItem('token')}
    this.http.post(this.globalObj.serverUrl+"notification/updatemodulenotification", params).subscribe(data => {
      //this.navCtrl.setRoot(path);
      this.navCtrl.push(path,dataobj);
    })
 }
}
