import { Component ,OnInit} from '@angular/core';
import { CommonProvider } from '../../providers/common/common';
import { IonicPage ,NavParams,AlertController,NavController} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the CreateGroupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-group',
  templateUrl: 'create-group.html',
})
export class CreateGroupPage implements OnInit {

  globalObj : any = {};
  constructor(private http: HttpClient,private myProvider: CommonProvider,
              private navParams: NavParams,private alertCtrl: AlertController,
              private navCtrl: NavController) {
                this.globalObj.classId = navParams.get('classId');
                this.globalObj.sectionId = navParams.get('sectionId');
                this.globalObj.subjectId = navParams.get('subjectId');
                this.globalObj.classSectionName = navParams.get('classSectionName');
                this.globalObj.userType = 'student';
                this.globalObj.groupOf = 'Students';
                this.globalObj.groupName = '';
                this.globalObj.dataExist = true;
                this.globalObj.userId = [];
    
  }
  ngOnInit() {
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.createdBy = window.localStorage.getItem('loginId');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.getSubjectWiseUser();
  }

  ionViewDidLoad() {
   
  }

  getSubjectWiseUser()
  {
   let params = {
      "session_id": this.globalObj.sessionId,
       "section_id": this.globalObj.sectionId,
       "subject_id": this.globalObj.subjectId,
       "user_type": this.globalObj.userType,
       "token": this.globalObj.token
    }
    let url =  this.globalObj.serverUrl + '/user_subjects/subjectwiseusers';
      this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        if(data.response_status.status=='200')
        {
       
        if(data.response.length==0)
        this.globalObj.dataExist = false;
        else
        {
          let tempArr = [];
          data.response.map(obj=>{obj.chkflag = false;tempArr.push(obj);});
      
                this.globalObj.studentData = [];
                this.globalObj.studentData = tempArr;
        }
        }
        
  
      })
    
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
    this.globalObj.studentData.map(obj=>{
                          
              if(obj.user_id==userId){
               obj.chkflag = !obj.chkflag;
               tempArr.push(obj);  
              }
            else
          {
            tempArr.push(obj); 
          }});

          this.globalObj.studentData = [];
          this.globalObj.studentData = tempArr;
    
  }

  createGroup()
  {
  if(this.globalObj.groupName==''){
      let alert = this.alertCtrl.create({
                      title: 'alert',
                      subTitle: "Group name can not be blank",
                      buttons: [{
                              text: 'ok',
                              handler: () => {}
      }]
                  });
                  alert.present();
      return false;
  }
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
   "section_id": this.globalObj.sectionId,
   "subject_id": this.globalObj.subjectId,
   "school_id":this.globalObj.schoolId,
   "user_type": this.globalObj.userType,
   "group_name": this.globalObj.groupName,
   "user_id": this.globalObj.userId,
   "created_by" : this.globalObj.createdBy,
   "token": this.globalObj.token
}
let url =  this.globalObj.serverUrl + '/groups/creategroup';
  this.http.post(url, params)
  .subscribe(details => {
    const data: any = details;
    if(data.response.status=='200')
    {
      let alert = this.alertCtrl.create({
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
