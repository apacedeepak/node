import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { NotificationPage } from '../notification/notification';
/**
 * Generated class for the HomeworkPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-homework',
  templateUrl: 'homework.html',
})
export class HomeworkPage {
  tabIdentifier: any = 'all';
  tabIdentifierTeacher: any = 'homework'
  domainUrl: any = '';
  serverUrl: any;
  globalObj: any = {};
  homeworkData: any = [];
  homework: any = []
  homeworkOriginal: any = []
  draftData: any = []
  draft: any = []  
  draftOriginal: any = [] 
  homework_draft_flag: boolean = true;
  subhomeworkarr: any = []
  filter: boolean = false
  unregisterBackButtonAction: any;
  noDataBoolean: boolean = false;
  selectionData = {classId:0,sectionId:0,subjectId:0};

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: HttpClient, 
      private myProvider: CommonProvider,private modalCtrl: ModalController) {
        this.domainUrl = this.myProvider.globalObj.constant.domainUrl;
        this.globalObj.modalCtrl = this.modalCtrl;
    
       this.getHomework();
   
       
      }

  ionViewCanEnter(){
    
  }

  gotoCreateHomework(){
    this.navCtrl.push('CreateHomeworkPage');
  }

  changeTeacherData(){
    switch(this.tabIdentifierTeacher){
      case 'homework':{
        this.homework = this.homeworkData
        this.homework_draft_flag = true  
        break;
      }
      case 'draft':{
        this.homework_draft_flag = false 
        break;
      }
      case 'homework_checked':{
        this.homework_draft_flag = true 
        this.homework = this.homeworkData.filter(obj => (obj.homework_checked_count === obj.homework_received_count && obj.homework_checked_count != 0))
        break;
      }
      case 'homework_unchecked':{
        this.homework_draft_flag = true 
        this.homework = this.homeworkData.filter(obj => (obj.homework_received_count > obj.homework_checked_count))
        break;
      }
      default:
      {
        // case not handled
        break;
      }
    }
  }

  changeData(){
    switch(this.tabIdentifier){
      case 'all':{
        this.homework = this.homeworkData
        break;
      }
      case 'pending':{
        this.homework = this.homeworkData.filter(obj => obj.submitted == 0);
        break;
      }
      case 'submitted':{
        this.homework = this.homeworkData.filter(obj => obj.submitted == 1);
        break;
      }
      case 'unchecked':{
        this.homework = this.homeworkData.filter(obj => (obj.checked == 0 && obj.submitted == 1));
        break;
      }
      case 'checked':{
        this.homework = this.homeworkData.filter(obj => obj.checked == 1);
        break;
      }
      default:
      {
        // case not handled
        break;
      }
    }
  }

  goToHomeworkDetail(item,userType){
    if(userType=='teacher')
    {
    this.navCtrl.push('HomeworkDetailPage', { data: item })
    }
    else{
      this.navCtrl.push('StudentHomeworkDetailPage',{id:item.homework_id});
    }
  }

  gotoFilter(userType){
    if(userType.toLowerCase()=='teacher')
    {
    let modal = this.globalObj.modalCtrl.create('HomeworkFilterPage', { data: this.homeworkOriginal, draftData: this.draftOriginal,selectionData:this.selectionData });
     
          modal.onDidDismiss(data => {
            if(data)
            {
            this.filter = data.filter;
    if(this.filter) {
      this.selectionData = data.selectionData;
      this.homework = data.data;
      if(this.homework.length == 0) this.noDataBoolean = true
      this.homeworkData = data.data;
      this.draft = data.draftData;
      this.draftData = data.draftData;
    }
          }
          });
          modal.present();
    //this.navCtrl.push('HomeworkFilterPage', { data: this.homeworkOriginal, draftData: this.draftOriginal })
    }
    else
    { 
      let modal = this.globalObj.modalCtrl.create('HomeworkFilterDateSubjectPage',{subjectData:this.globalObj.assignedSubject,homework:this.homeworkOriginal});
     
      modal.onDidDismiss(data => {
        if(data && data.dateData)
        { 
          if(data.dateData.fromDate!='' && data.dateData.toDate!='')
          {
            this.globalObj.searchDateFlag = true;
            this.globalObj.fromDate = data.dateData.fromDate;
            this.globalObj.toDate = data.dateData.toDate;
            this.globalObj.searchFor = data.searchFor;
          }
          else{
            this.globalObj.searchDateFlag = false;
          }
          if(data.subjectId.length>0)
          {
            
            this.globalObj.searchSubject = [];
            this.globalObj.searchSubjectId = data.subjectId;
            this.globalObj.searchSubject = data.subjectName;
          }
          else{
            this.globalObj.searchSubject = [];
          }
          
         let  url = this.serverUrl + 'homework/studenthomework';
      const params = {
        "user_id": this.globalObj.loginId,
        "search_for": (data.dateData.fromDate!='' && data.dateData.toDate!='')?data.searchFor:'',
        "from_date": (data.dateData.fromDate!='' && data.dateData.toDate!='')?data.dateData.fromDate:'',
        "to_date": (data.dateData.fromDate!='' && data.dateData.toDate!='')?data.dateData.toDate:'',
        "subject_id": data.subjectId.length==0?'':data.subjectId.join(),
        "token": this.globalObj.token
      }
      this.http.post(url, params)
      .subscribe(details => {
        const data: any = details
        this.homeworkData = [];
        this.homeworkData = data.response
        this.homework = [];
        this.homework = data.response
        
        if(this.homework.length == 0) this.noDataBoolean = true; 
        else this.noDataBoolean = false
      })
        }
      });
      modal.present();
      

    }
  }

  goToDraft(item){
    this.navCtrl.push('CreateHomeworkPage', { data: item, homeworkFormFlag: true })  
  }
  assignedSubject(){
   
    
    this.globalObj.sectionId = window.localStorage.getItem('studentSectionId');
 
    const params = {
      "user_id": this.globalObj.loginId,
      "session_id": this.globalObj.sessionId,
      "section_id": this.globalObj.sectionId,
      "token": this.globalObj.token
    }

    const url = this.serverUrl + 'user_subjects/assignedsubjects';
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        if(data.response_status.status=='200')
        {
          this.globalObj.assignedSubject = data.response.assigned_subjects;
        }
        
        
      })
   
  }
  removeDate()
  {
    this.globalObj.searchDateFlag = false;
    this.globalObj.fromDate = '';
    this.globalObj.toDate = '';
    this.globalObj.searchFor = ''
    let  url = this.serverUrl + 'homework/studenthomework';
      const params = {
        "user_id": this.globalObj.loginId,
        "search_for": '',
        "from_date": '',
        "to_date":'',
        "subject_id": this.globalObj.searchSubjectId.join(),
        "token": this.globalObj.token
      }
      this.http.post(url, params)
      .subscribe(details => {
        const data: any = details
        this.homeworkData = [];
        this.homeworkData = data.response
        this.homework = [];
        this.homework = data.response
        
        if(this.homework.length == 0) this.noDataBoolean = true; 
        else this.noDataBoolean = false
      })
  }
  removeSubject(subjectId)
  {
    var index = this.globalObj.searchSubjectId.indexOf(subjectId);
    if(index!=-1)
      {
      this.globalObj.searchSubjectId.splice(index,1);
      this.globalObj.searchSubject.splice(index,1);
      }
      let  url = this.serverUrl + 'homework/studenthomework';
      const params = {
        "user_id": this.globalObj.loginId,
        "search_for": this.globalObj.searchFor,
        "from_date": this.globalObj.fromDate,
        "to_date":this.globalObj.toDate,
        "subject_id": this.globalObj.searchSubjectId.join(),
        "token": this.globalObj.token
      }
      this.http.post(url, params)
      .subscribe(details => {
        const data: any = details
        this.homeworkData = [];
        this.homeworkData = data.response
        this.homework = [];
        this.homework = data.response
        
        if(this.homework.length == 0) this.noDataBoolean = true; 
        else this.noDataBoolean = false
      })
    
  }
  siblingChange(){
                
    this.getStudentHomework();
  }
  getTeacherHomework()
  {
    // if(!this.filter){
      let params = {
        "user_id": this.globalObj.loginId,
        "class_id": "",
        "section_id": "",
        "subject_id": "",
        "school_id": this.globalObj.schoolId,
        "from_date": "",
        "to_date": "",
        "token": this.globalObj.token
      }
      let url = this.serverUrl + 'homework/homework';
        this.http.post(url, params)
        .subscribe(details => {
          const data: any = details;
          this.homeworkData = data.response.homework;
          this.homework = data.response.homework
          this.homeworkOriginal = data.response.homework

          if(this.homework.length == 0) this.noDataBoolean = true; 
          else this.noDataBoolean = false;
          let url_draft = this.serverUrl + 'homework/draft';
          this.http.post(url_draft, params)
            .subscribe(details => {
              const data: any = details;
              this.draftData = data.response
              this.draft = data.response
              this.draftOriginal = data.response
            })
        })
    //}
  }
  getStudentHomework()
  {
    if(this.globalObj.userType.toLowerCase() == 'parent')
    {
      this.globalObj.loginId = window.localStorage.getItem('studentUserId');
    }
    this.assignedSubject();

    let url = this.serverUrl + 'homework/studenthomework';
    let params = {
      "user_id": this.globalObj.loginId,
      "search_for": "",
      "from_date": "",
      "to_date": "",
      "subject_id": "",
      "token": this.globalObj.token
    }
    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details
      this.homeworkData = data.response
      this.homework = data.response
      this.homeworkOriginal = data.response
      if(this.homework.length == 0) this.noDataBoolean = true; 
      else this.noDataBoolean = false
    })
  }

  getHomework()
  {
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.assignedSubject = [];
    this.globalObj.searchDateFlag = false;
    this.globalObj.searchSubject = [];
    this.globalObj.searchSubjectId = [];
    this.globalObj.fromDate = '';
    this.globalObj.toDate = '';
    this.globalObj.searchFor = '';

    

    if(this.globalObj.userType.toLowerCase() == 'teacher'){

      this.getTeacherHomework();
      
     

    }else{
      this.getStudentHomework();
     
    }
  }
  doRefresh(event){
    this.getHomework();
    event.complete();
  
  }

  ionViewDidLoad() {
    
  }

  ionViewWillEnter(){
    
  }

  ionViewWillLeave(){
  }

  ionViewDidEnter(){

  }

  ionViewDidLeave(){

  }

}
