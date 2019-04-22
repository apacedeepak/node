import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { NotificationPage } from '../notification/notification';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the GroupStudentListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-group-student-list',
  templateUrl: 'group-student-list.html',
})
export class GroupStudentListPage {
  globalObj : any = {};
  constructor(private navCtrl: NavController, private navParams: NavParams,
    private myProvider: CommonProvider,private http: HttpClient) {
      
    this.getGroupData();
  }

  ionViewDidLoad() {
    
  }

  getGroupData()
  {
    this.globalObj.groupExist = true;
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    let params = {
      "userId": this.globalObj.loginId
       
    }
    let url =  this.globalObj.serverUrl + '/group_users/getuseridbygroup';
      this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        if(data.response_message.status=='200')
        { 
          if(data.response.length==0)
          {
          this.globalObj.groupExist = false ;
          }
          this.globalObj.groupData = data.response;

        }
  
      })
  }
  groupDetail(groupName,teacherName,memberList)
  {
    let data = {groupName:groupName,memberList:memberList,teacherName:teacherName};
    this.navCtrl.push('GroupStudentDetailPage',data);
  }
  doRefresh(event){
    this.getGroupData();
    event.complete();
  
  }

}
