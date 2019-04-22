import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController,ViewController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common'
import { HttpClient } from '@angular/common/http'

/**
 * Generated class for the HomeworkFilterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-homework-filter',
  templateUrl: 'homework-filter.html',
})
export class HomeworkFilterPage {
  classes: boolean = true;
  sections: boolean = false;
  globalObj: object = {}
  domailUrl: string = ''
  serverUrl: string = ''
  subjects: boolean = false;
  multiclass: boolean = false;
  group: boolean = false;
  class_id: any = 0
  section_id: any = 0
  subject_id: any = 0
  homework: any = []
  draft: any = [];
  selectionData = {classId:0,sectionId:0,subjectId:0};
  classSelectedFlag = false;
  sectionSelectedFlag = false;
  subjectSelectedFlag = false;
  constructor(private toastCtrl: ToastController, 
    public navCtrl: NavController, public navParams: NavParams, 
    private http: HttpClient, private myProvider: CommonProvider,private viewCtrl: ViewController) {
      if(this.navParams){ 
        this.homework = this.navParams.get('data')
        this.draft = this.navParams.get('draftData')
        this.selectionData = this.navParams.get('selectionData');
        this.domailUrl = this.myProvider.globalObj.constant.apiUrl
        this.serverUrl = this.myProvider.globalObj.constant.apiURL;
        this.globalObj['userType'] = window.localStorage.getItem('userType');
        this.globalObj['sessionId'] = window.localStorage.getItem('sessionId');
        this.globalObj['schoolId'] = window.localStorage.getItem('schoolId');
        this.globalObj['token'] = window.localStorage.getItem('token');
        this.globalObj['loginId'] = window.localStorage.getItem('loginId');
    if(this.selectionData.classId)
    {
      this.classSelectedFlag = true;
      this.setSelectedFilter(this.selectionData);
    }
    else{
    this.assignedClass()
    }
      }
  }

  ionViewDidLoad() {
    
  }

  assignedClass(){
    this.sections = false
    this.subjects = false
    this.classes = true

   
    // if(!this.class_id){
      const params = {
        "user_id": this.globalObj['loginId'],
        "session_id": this.globalObj['sessionId'],
        "school_id": this.globalObj['schoolId'],
        "token": this.globalObj['token']
      }

      const url = this.serverUrl + 'users/assignedclass';
      this.http.post(url, params)
        .subscribe(details => {
          const data: any = details;
          if(data.response)
            this.globalObj['assignedClassData'] = data.response.assigned_classes
          else
            this.globalObj['assignedClassData'] = []  
        })
    //}
  }

  assignedSection(){
    if(!this.class_id) return;
    
    
    // if(!this.section_id){
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "class_id": this.class_id,
      "token": this.globalObj['token']
    }

    const url = this.serverUrl + 'users/assignedsection';
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        this.globalObj['assignedSectionData'] = data.response.assigned_sections
      })
    //}
  }

  showSection()
  {
    this.classes = false
    this.subjects = false
    this.sections = true
  }

  assignedSubject(){
    if(!this.section_id) return
  

    // if(!this.subject_id){
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "section_id": this.section_id,
      "token": this.globalObj['token']
    }

    const url = this.serverUrl + 'user_subjects/assignedsubjects';
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        this.globalObj['assignedSubjectData'] = data.response.assigned_subjects
      })
    //}
  }
  showSubject()
  {
    this.classes = false
    this.sections = false
    this.subjects = true
  }
  clearAll(){
    this.class_id = 0;
    this.section_id = 0;
    this.subject_id = 0;
    this.selectionData.classId =   this.class_id;
    this.selectionData.sectionId = this.class_id;
    this.selectionData.subjectId = this.class_id;
    this.sections = false
    this.subjects = false
    this.classes = true
  }

  close(){
    this.navCtrl.pop();
     // this.navCtrl.push("HomeworkPage");
  }

  presentToast(msg) {
    msg = (msg) ? msg: "some error" 
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  onApply(){
    let msg = '';
    
    if(!this.class_id && !this.section_id && !this.subject_id)
    {
      this.homework = this.homework;
      this.draft = this.draft;
      this.selectionData.classId = 0;
      this.selectionData.sectionId = 0;
      this.selectionData.subjectId = 0;
    }
    else if(this.class_id && !this.section_id && !this.subject_id )
    {
      this.homework = this.homework.filter(obj => (obj.class_id == this.class_id));
      this.draft = this.draft.filter(draftObj => (draftObj.class_id == this.class_id));
      this.selectionData.classId = this.class_id;
      this.selectionData.sectionId = 0;
      this.selectionData.subjectId = 0;
    }
    else if(this.class_id && this.section_id && !this.subject_id )
    {
      this.homework = this.homework.filter(obj => (obj.class_id == this.class_id) && (obj.section_id == this.section_id))
      this.draft = this.draft.filter(draftObj => (draftObj.class_id == this.class_id) && (draftObj.section_id == this.section_id))
      this.selectionData.classId = this.class_id;
      this.selectionData.sectionId = this.section_id;
      this.selectionData.subjectId = 0;
    }
    else if(this.class_id && this.section_id && this.subject_id )
    {
      this.homework = this.homework.filter(obj => (obj.class_id == this.class_id) && (obj.section_id == this.section_id) && (obj.subject_id == this.subject_id) )
      this.draft = this.draft.filter(draftObj => (draftObj.class_id == this.class_id) && (draftObj.section_id == this.section_id) && (draftObj.subject_id == this.subject_id) )
      this.selectionData.classId =   this.class_id;
      this.selectionData.sectionId = this.section_id;
      this.selectionData.subjectId = this.subject_id;
    }
    
    
    if(msg){
      this.presentToast(msg)
      return
    }
   
    this.viewCtrl.dismiss({ selectionData:this.selectionData,data: this.homework, draftData: this.draft, filter: true });

  }
  setValue(setfor,val)
  { 
    if(setfor=='class')
    {
      if(this.classSelectedFlag && val!=this.class_id)
      {
        this.classSelectedFlag = false;
        this.sectionSelectedFlag = false;
        this.subjectSelectedFlag = false;
      }
    this.class_id = val;
    this.section_id = this.classSelectedFlag?this.selectionData.sectionId:0;
    this.subject_id = this.classSelectedFlag?this.selectionData.subjectId:0;
    this.globalObj['assignedSectionData'] = [];
    this.globalObj['assignedSubjectData'] = [];
    this.assignedSection();
    
    }
    if(setfor=='section')
    {
      if(this.sectionSelectedFlag && val!=this.section_id)
      {
        this.sectionSelectedFlag = false;
        this.subjectSelectedFlag = false;
      }
    this.section_id = val;
    this.subject_id = this.sectionSelectedFlag?this.selectionData.subjectId:0;
    this.globalObj['assignedSubjectData'] = [];
    this.assignedSubject()
    }
    if(setfor=='subject')
    {
      
      if(this.subjectSelectedFlag && val!=this.subject_id)
      {
        this.subjectSelectedFlag = false;
        
      }
      this.subject_id = val;
    }
  }
  setSelectedFilter(selectedObj)
  {
    this.class_id = selectedObj.classId;
    this.assignedClass()
    if(selectedObj.sectionId)
    {
      this.section_id = selectedObj.sectionId;
      this.sectionSelectedFlag = true;
      this.assignedSection()
    }
    if(selectedObj.subjectId)
    {
      this.subject_id = selectedObj.subjectId;
      this.subjectSelectedFlag = true;
      this.assignedSubject();
    }
  }
  }
