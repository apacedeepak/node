import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
/**
 * Generated class for the ClassSectionSubjectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-class-section-subject',
  templateUrl: 'class-section-subject.html',
})
export class ClassSectionSubjectPage {
  globalObj : any = {};
  //viewCtrl : ViewController;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: HttpClient,private myProvider: CommonProvider,
    public viewCtrl: ViewController,private toastCtrl: ToastController) {
    
  }

  ionViewDidLoad() {
    this.globalObj.classData = '';
    this.globalObj.sectionData = '';
    this.globalObj.subjectData = '';
    this.globalObj.isDisable = true;
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.getAssignedClass();
  }
  getAssignedClass()
  {
    let params  = {
      "user_id": this.globalObj.loginId,
       "school_id": this.globalObj.schoolId,
       "session_id": this.globalObj.sessionId,
       "token": this.globalObj.token
    }
 
    let url =  this.globalObj.serverUrl + '/users/assignedclass';
    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      this.globalObj.classList = data.response.assigned_classes;

    })
  }

  getAssignedSection(val)
  {
    this.globalObj.classId = val;
    this.globalObj.subjectList = [];
    
    this.globalObj.sectionData = '';
    this.globalObj.subjectData = '';
     if (val == '') { 
      this.globalObj.sectionId = '';
      this.globalObj.subjectId = '';
      this.globalObj.sectionList = [];
      
      this.globalObj.isDisable = true;
     }
    
    if (val != '') {
      let obj = this.globalObj.classList.find(o => o.class_id == val);

      this.globalObj.className = obj.class_name;
      const params = {
        "user_id": this.globalObj.loginId,
        "session_id": this.globalObj.sessionId,
        "class_id": val,
        "token": this.globalObj.token
      };
      let url =  this.globalObj.serverUrl + '/users/assignedsection';
      this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      this.globalObj.sectionList = data.response.assigned_sections;

    })
      
    }
  }
  getAssignedSubject(val)
  {
    this.globalObj.subjectData = '';
    this.globalObj.sectionId = val;
    this.globalObj.subjectList = [];
    // console.log(val);
     if (val == '') { 
        
        this.globalObj.isDisable = true;
     }
    
    if (val != '') { 
      let obj = this.globalObj.sectionList.find(o => o.section_id == val);

      this.globalObj.sectionName = obj.section_name;
      const params = {
        "user_id": this.globalObj.loginId,
        "session_id": this.globalObj.sessionId,
        "section_id": val,
        "token": this.globalObj.token
      };
      let url =  this.globalObj.serverUrl + '/user_subjects/assignedsubjects';
      this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      this.globalObj.subjectList = data.response.assigned_subjects;

    })
      
    }
  }
  selectSubject(val)
  {
    this.globalObj.subjectId = val;
    if(val)
    {
      this.globalObj.isDisable = false;
    }
    else
    {
      this.globalObj.isDisable = true;
    }
  }
  dismiss()
  {
    let finalObj = {
      classId:undefined,
      sectionId:undefined,
      subjectId:undefined,
    };
    this.viewCtrl.dismiss(finalObj);

  }
  redirectPage()
  {
    let msg = '';
    if(!this.globalObj.classId)
    msg = 'Please select class';
    if(!this.globalObj.sectionId  && !msg)
    msg = 'Please select section';
    if(!this.globalObj.subjectId  && !msg)
    msg = 'Please select subject';
    
    if(msg){
      this.presentToast(msg)
      return
    }
    let finalObj = {
      classId:this.globalObj.classId,
      sectionId:this.globalObj.sectionId,
      subjectId:this.globalObj.subjectId,
      classSectionName:this.globalObj.className+"-"+this.globalObj.sectionName
    };
    this.viewCtrl.dismiss(finalObj);
  }

  clearAll()
  {
    this.globalObj.classData = '';
    this.globalObj.sectionData = '';
    this.globalObj.subjectData = '';
  }
  presentToast(msg) {
    msg = (msg) ? msg: "some error" 
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      //console.log('Dismissed toast');
    });
  
    toast.present();
  }
}
