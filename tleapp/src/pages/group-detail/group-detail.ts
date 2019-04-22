import { Component ,OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { HttpClient } from '@angular/common/http';
/**
 * Generated class for the GroupDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-group-detail',
  templateUrl: 'group-detail.html',
})
export class GroupDetailPage implements OnInit{
  public globalObj: any = {};
  
  constructor(private navCtrl: NavController, private navParams: NavParams,
             private myProvider: CommonProvider,private http: HttpClient,
             private alertCtrl: AlertController) {
                    this.globalObj.groupId = navParams.get('groupId');
                    this.globalObj.setClass = 'showColumn';
                    this.globalObj.userId = [];
            
  }

  ionViewDidLoad() {
    
  }
  ngOnInit() {
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.isDisable = true;
    this.globalObj.userType = 'Student';
    
    
    this.getGroupDetail();
  }

  getGroupDetail()
  {
    let params = {"user_id":this.globalObj.loginId,
    "token":this.globalObj.token,
    "group_id" :this.globalObj.groupId,
    "user_type":"student"};
    let url =  this.globalObj.serverUrl + '/groups/groupidbydetail';
    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      if(data.response.status=='200')
        {
        this.globalObj.groupName = data.response.groupdata.groupname;
        this.globalObj.updateDateTime = data.response.groupdata.updated_date_time_app;
        this.globalObj.subject = data.response.belgons_to_subject.subject_name;
        this.globalObj.classSection = data.response.belgons_to_section.section_name;
        this.globalObj.memberData = data.response.data;
        let memberCount = 0;
        for(let key in data.response.data)
        {
          if(data.response.data[key].chkflag)
          {
            this.globalObj.userId.push(data.response.data[key].user_id);
            memberCount++;
          }
        }
        this.globalObj.totalMember = memberCount;
        }
      

    })
  }

  EditData()
  {
    this.globalObj.setClass = 'showColumn';
    this.globalObj.isDisable = false;
  }
  getValue(userId)
  {
    if(this.globalObj.userId.indexOf(userId)!=-1)
    {
      let index = this.globalObj.userId.indexOf(userId);
      this.globalObj.userId.splice(index,1);
    }
    else{
      this.globalObj.userId.push(userId);
    }
    let tempArr = [];
    this.globalObj.memberData.map(obj=>{
                          
              if(obj.user_id==userId){
               obj.chkflag = !obj.chkflag;
               tempArr.push(obj);  
              }
            else
          {
            tempArr.push(obj); 
          }});

          this.globalObj.memberData = [];
          this.globalObj.memberData = tempArr;
    
  }

  updateGroup()
  {

  if(this.globalObj.userId.length==0){
    let alert = this.alertCtrl.create({
                    title: 'alert',
                    subTitle: "Group can not be empty. Select at least one student",
                    buttons: [{
                            text: 'ok',
                            handler: () => {}
    }]
                });
                alert.present();
    return false;
}
let params = {
  "session_id": this.globalObj.sessionId,
   "group_id": this.globalObj.groupId,
   "school_id":this.globalObj.schoolId,
   "user_type": this.globalObj.userType,
   "group_name": this.globalObj.groupName,
   "user_ids": this.globalObj.userId,
   "created_by" : this.globalObj.loginId,
   "token": this.globalObj.token
}
let url =  this.globalObj.serverUrl + '/groups/creategroup';
  this.http.post(url, params)
  .subscribe(details => {
    const data: any = details;
    if(data.response.status=='200')
    {
      let alert = this.alertCtrl.create({
        title: 'Success',
        subTitle: data.response.message,
        buttons: [{
                text: 'ok',
                handler: () => {
                  this.navCtrl.setRoot('GroupPage')
                }
}]
    });
    alert.present();
    }
    else if(data.response.status=='201')
    {
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: data.response.message,
        buttons: [{
                text: 'ok',
                handler: () => {
                  this.navCtrl.setRoot('GroupPage')
                }
}]
    });
    alert.present();
    }
    

  })

  }

}
