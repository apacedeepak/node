import { Component } from '@angular/core';
import { CommonProvider } from '../../providers/common/common';
import { IonicPage, NavController, NavParams, ViewController,AlertController,ModalController,PopoverController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ClassSectionSubjectPage } from '../class-section-subject/class-section-subject';
import { NotificationPage } from '../notification/notification';
import { GroupOptionPage } from '../group-option/group-option';
/**
 * Generated class for the GroupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-group',
  templateUrl: 'group.html',
})
export class GroupPage{
  globalObj : any = {};
  constructor(private navCtrl: NavController, private navParams: NavParams,
    private http: HttpClient,private myProvider: CommonProvider,
    private viewCtrl: ViewController,private alertCtrl: AlertController,
    private modalCtrl: ModalController,private popoverCtrl: PopoverController) {
      this.globalObj.groupExist = true;
      this.globalObj.redirectClick = false;
    
  }
  groupData=[];
  
  ionViewDidLoad() {
    
    this.getGroupData();
  
    
   
  }
  openPopup()
{
 
          let modal = this.globalObj.modalCtrl.create(ClassSectionSubjectPage);
     
          modal.onDidDismiss(data => {
            if(data && data.classId)
            this.navCtrl.push('CreateGroupPage',data);
                
            });
         modal.present();
          
       
}
groupDetail(groupId)
{ if(!this.globalObj.redirectClick)
  this.navCtrl.push('GroupDetailPage',{groupId:groupId});
  else
  this.globalObj.redirectClick = false;
}

redirectToModule(groupId,event)
{
  this.globalObj.popover = this.popoverCtrl.create('GroupOptionPage');
  this.globalObj.popover.present({
    ev: event
    
  });
  this.globalObj.popover.onDidDismiss(data => {
    this.globalObj.redirectClick = true;
    if(data)
    {
    if(data.action=='message')
    {
    this.navCtrl.push('ComposePage',{place:'group',groupId:groupId});
    }
    if(data.action=='homework')
    {
      this.navCtrl.push('CreateHomeworkPage',{place:'group',groupId:groupId});
    }
    if(data.action=='delete')
    {
      this.confirmDelete(groupId);
     
    }
  }
        
    });
    }
changeFlagValue()
{
  this.globalObj.redirectClick = true;
}

deleteGroup(groupId)
{
 let params = {
    "user_id": this.globalObj.loginId,
     "group_id": groupId,
     "token": this.globalObj.token
  }
  let url =  this.globalObj.serverUrl + '/groups/groupdeletebyid';
    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      let alert = this.alertCtrl.create({
        title: data.response.status=='200'?'Success':'Error',
        subTitle: data.response.message,
        buttons: [{
                text: 'ok',
                handler: () => {
                  this.navCtrl.setRoot('GroupPage')
                }
}]
    });
    alert.present();

    })

}
confirmDelete(groupId){
    
  let alert = this.alertCtrl.create({
    title: "Do you want to delete this group?",
    subTitle: '',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          
        }
      },
      { 
        text: 'Ok',
        handler: () => {
          this.deleteGroup(groupId);
        }
      }
    ]
  });
  alert.present();
}
getGroupData()
{
  let url = '', params = {};
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.alertCtrl = this.alertCtrl;
    this.globalObj.modalCtrl = this.modalCtrl;
   
    if(this.globalObj.userType.toLowerCase() == 'teacher'){
      params = {
        "user_id": this.globalObj.loginId,
         "school_id": this.globalObj.schoolId,
         "token": this.globalObj.token
      }
      let url =  this.globalObj.serverUrl + '/groups/getgroupbyuserid';
        this.http.post(url, params)
        .subscribe(details => {
          const data: any = details;
          if(data.response.length==0)
          {
          this.globalObj.groupExist = false ;
          }
          this.groupData = data.response;
    
        })

    }
}
doRefresh(event){
  this.getGroupData();
  event.complete();

}
ionViewWillLeave()
{
  //this.globalObj.popover.dismiss();
}
}
