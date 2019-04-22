
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController ,ViewController} from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common'
import { HttpClient } from '@angular/common/http'

@IonicPage()
@Component({
  selector: 'page-homework-assignto',
  templateUrl: 'homework-assignto.html',
})
export class HomeworkAssigntoPage {
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
  draft: any = []
  constructor(private toastCtrl: ToastController, 
    public navCtrl: NavController, public navParams: NavParams, 
    private http: HttpClient, private myProvider: CommonProvider,private viewCtrl: ViewController) {
      if(this.navParams){ 
        this.homework = this.navParams.get('data')
        this.draft = this.navParams.get('draftData')
      }
  }

  ionViewDidLoad() {
    this.domailUrl = this.myProvider.globalObj.constant.apiUrl
    this.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj['userType'] = window.localStorage.getItem('userType');
    this.globalObj['sessionId'] = window.localStorage.getItem('sessionId');
    this.globalObj['schoolId'] = window.localStorage.getItem('schoolId');
    this.globalObj['token'] = window.localStorage.getItem('token');
    this.globalObj['loginId'] = window.localStorage.getItem('loginId');
    this.globalObj['currentClassId'] = '';
    this.globalObj['currentSectionId'] = '';
    this.globalObj['currentSubjectId'] = '';
    this.globalObj['multiClassSection'] = [];
    this.globalObj['groupSelect'] = [];
    this.globalObj['groupinfoData'] = [];
    this.globalObj['classsectionData'] = [];
    

    this.assignedClass()
  }

  assignedClass(){
    this.sections = false
    this.subjects = false
    this.group = false;
    this.multiclass = false;
    this.classes = true

   
    if(!this.class_id){
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
    }
  }

  assignedSection(){
    if(!this.class_id) return;
   
    
    if(!this.section_id){
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
    }
  }

  showSection()
  {
    this.classes = false
    this.subjects = false
    this.group = false;
    this.multiclass = false
    this.sections = true
  }

  assignedSubject(){
    if(!this.section_id) return
    

    if(!this.subject_id){
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
    }
  }
  showSubject()
  {
    this.classes = false
    this.sections = false
    this.group = false;
    this.multiclass = false
    this.subjects = true
  }

  clearAll(){
    this.class_id = 0;
    this.section_id = 0;
    this.subject_id = 0;
    this.globalObj['assignTo'] = '';
    this.globalObj['groupinfoData'] = [];
    this.globalObj['classsectionData'] = [];
    this.classes = true
    this.sections = false
    this.group = false;
    this.multiclass = false
    this.subjects = false
   }

  close(){
    this.navCtrl.pop();
    //this.navCtrl.push("CreateHomeworkPage");
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
    if(!this.class_id) msg = 'Please select a class'
    else if(!this.section_id) msg = 'Please select a section'
    else if(!this.subject_id) msg = 'Please select a subject'
    else if(this.globalObj['groupinfoData'].length==0 && this.globalObj['classsectionData'].length==0) msg = 'Please select at class-section or group'
    
    if(msg){
      this.presentToast(msg)
      return
    }
    // if(!this.homework){
    //   this.presentToast('Some Error')
    //   return
    // }
    this.sendData();

    // this.homework = this.homework.filter(obj => (obj.class_id == this.class_id) && (obj.section_id == this.section_id) && (obj.subject_id == this.subject_id) )
    
    // this.draft = this.draft.filter(draftObj => (draftObj.class_id == this.class_id) && (draftObj.section_id == this.section_id) && (draftObj.subject_id == this.subject_id) )
    // this.navCtrl.push("HomeworkPage", { data: this.homework, draftData: this.draft, filter: true })

  }
  setValue(setfor,val)
  { 
    if(setfor=='class')
    {
    this.globalObj['currentClassId'] = val;
    this.section_id = 0;
    this.subject_id = 0;
    this.globalObj['assignedSectionData'] = [];
    this.globalObj['assignedSubjectData'] = [];
    this.globalObj['assignedMultiSectionData'] = [];
    this.globalObj['assignedGroupData'] = [];
    this.assignedSection();
    
    }
    if(setfor=='section')
    {
    this.globalObj['currentSectionId'] = val;
    this.subject_id = 0;
    this.globalObj['assignedSubjectData'] = [];
    this.globalObj['assignedMultiSectionData'] = [];
    this.globalObj['assignedGroupData'] = [];
    this.assignedSubject();
    }
    if(setfor=='subject')
    {
    this.globalObj['currentSubjectId'] = val;
    this.globalObj['assignedMultiSectionData'] = [];
    this.globalObj['assignedGroupData'] = [];
    this.assignedClassSection();
    this.assignedGroup();
    }
  }

  assignedClassSection()
  {
    if(!this.subject_id) return
  
    let obj = this.globalObj['assignedSubjectData'].find(o => o.subject_id == this.subject_id);
    this.globalObj['subjectName'] = obj.subject_name;
    
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "class_id": this.class_id,
      "subject_id": this.subject_id,
      "token": this.globalObj['token']
    }

    const url = this.serverUrl + 'user_subjects/subjectwisesections';
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        this.globalObj['assignedMultiSectionData'] = data.response
      })
    
  }
  showClassSection()
  {
    this.classes = false
    this.sections = false
    this.subjects = false;
    this.group = false;
    this.multiclass = true;
  }

  assignedGroup()
  {
    if(!this.subject_id) return
    
    let obj = this.globalObj['assignedSubjectData'].find(o => o.subject_id == this.subject_id);
    this.globalObj['subjectName'] = obj.subject_name;
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "section_id": this.section_id,
      "subject_id": this.subject_id,
      "token": this.globalObj['token']
    };
    let url =  this.serverUrl + '/groups/assignedgroups';
    this.http.post(url, params)
  .subscribe(details => {
    const data: any = details;
    
    if(data.response.status=='200')
    {
      this.globalObj['assignedGroupData'] = data.response.data;
      
    }
    

  })
  }

  showGroup()
  {
    this.classes = false
    this.sections = false
    this.subjects = false;
    this.group = true;
    this.multiclass = false;
  }
  setHomeworkData(assignTo,data)
  { 
    this.globalObj['assignTo'] = assignTo;
    if(assignTo=='group')
    {
      
    if(this.globalObj['groupinfoData'].find(o => o.groupId == data.id))
    {
      
      
      var returnarr = this.globalObj['groupinfoData'].map(o => o.groupId == data.id);
      let index = returnarr.indexOf(true);
      this.globalObj['groupinfoData'].splice(index,1);
    }
    else{
      this.globalObj['groupinfoData'].push({groupId:data.id,groupName:data.group_name});
    }
    }
    if(assignTo=='classsection')
    { 
      if(this.globalObj['classsectionData'].find(o => o.classSectionId == data.section_id))
      {
        
        
        var returnarr = this.globalObj['classsectionData'].map(o => o.classSectionId == data.section_id);
        let index = returnarr.indexOf(true);
        this.globalObj['classsectionData'].splice(index,1);
      }
      else{
        this.globalObj['classsectionData'].push({classId:this.class_id,sectionId:this.section_id,subjectId:this.subject_id,classSectionId:data.section_id,classSecName:data.section_name});
      }
      // this.globalObj.classsectionData = [];
      // let temarr = [];
      // temarr.push({classId:data.classId,classSectionId:data.classSectionId,classSecName:data.classSecName});
      // this.globalObj.classsectionData = temarr;
    }
    
  }
  sendData()
  {
    if(this.globalObj['assignTo'])
    { 
      if(this.globalObj['assignTo']=='group' && this.globalObj['groupinfoData'].length>0)
      {
        let finalObj = {
                     action:'done',
                     assignTo:this.globalObj['assignTo'],
                     subject:this.globalObj['subjectName'],
                     classId:this.class_id,
                     sectionId:this.section_id,
                     subjectId:this.subject_id,
                     groupData:this.globalObj['groupinfoData']
                    };
                    this.viewCtrl.dismiss(finalObj);
                    //this.navCtrl.push("CreateHomeworkPage", {'createhomework':finalObj})
      }
     
      else if(this.globalObj['assignTo']=='classsection' && this.globalObj['classsectionData'].length>0)
      {
        let finalObj = {
                     action:'done',
                     assignTo:this.globalObj['assignTo'],
                     subject:this.globalObj['subjectName'],
                     subjectId:this.subject_id,
                     classsectionData:this.globalObj['classsectionData']
                    };
                    this.viewCtrl.dismiss(finalObj);
                   // this.navCtrl.push("CreateHomeworkPage", {'createhomework':finalObj})
      }
      else{
        let finalObj = {action:'dismiss'};
            this.viewCtrl.dismiss(finalObj);
            //this.navCtrl.push("CreateHomeworkPage", {'createhomework':finalObj})
      }
    }
          else
          {
            let finalObj = {action:'dismiss'};
            this.viewCtrl.dismiss(finalObj);
            //this.navCtrl.push("CreateHomeworkPage", {'createhomework':finalObj})
            
          }
          

  }
}
