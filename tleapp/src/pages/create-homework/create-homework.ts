import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController ,ModalController} from 'ionic-angular';
import { FormGroup, FormControl, FormArray } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { CommonProvider } from '../../providers/common/common'
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HomeworkAssigntoPage } from '../homework-assignto/homework-assignto';
import { DatePicker } from '@ionic-native/date-picker'
declare var jquery:any;
declare var $ :any;

/**
 * Generated class for the CreateHomeworkPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-homework',
  templateUrl: 'create-homework.html',
})
export class CreateHomeworkPage {
  form: FormGroup;
  public sessionid: any;
  public token: any;
  public subject_id: any;
  public class_id: any;
  public section_id: any;
  public target_date: any;
  public title: any;
  public class_sec_list: any;
  public group_list: any;
  public sendtolist: Array<any> = new Array<any>();
  public subjectlabel: any;
  public homework_subject_id: any;
  public schoolid: any = '';
  public responseobj:any = '';
  public class_name : any = '';
  public place : any = 'homework';
  homeworkFormFlag: boolean = false;
  domailUrl: string = ''
  globalObj: any = {}
  serverUrl: string = ''
  validBtn: boolean = false;
  success_msg: string = ''
  contentvalue: any = '';
  //assigment_title: string = ''
  //enter_text: string = ''
  class_section_name: any;
  add_class: any = ''

  // createHomeWork = new FormGroup({
  //   send_to: new FormControl({value: '', disabled: true}),
  //   //assigment_title: new FormControl(''),
  //   add_class: new FormControl(),
  //   //enter_text: new FormControl(''),
  //   //pick_date: new FormControl(this.getIsoDate(new Date()))
  // })

  // filterHomework = new FormGroup({
  //   all_class: new FormControl(''),
  //   all_section: new FormControl(''),
  //   all_subject: new FormControl(''),
  //   assigned_groups: new FormControl(''),
  //   pick_date: new FormControl()
  // })

  constructor(private camera: Camera, private alertCtrl: AlertController, 
    public navCtrl: NavController, public navParams: NavParams, private http: HttpClient,
    private myProvider: CommonProvider,private modalCtrl: ModalController,
    private datePicker: DatePicker) {
    this.globalObj.photos = [];
    this.globalObj.fileuploaddata = [];
    this.globalObj.modalCtrl = this.modalCtrl;
    // this.globalObj.showClassSecSubject = false;
    // this.globalObj.showGroupSubject = false;
    this.globalObj.assigment_subject = '';
    this.globalObj.assigment_title = '';
    this.globalObj.enter_text = 'Enter Text here ...';
    this.globalObj.finalSendToList = '';
    this.globalObj.assignTo = '';
    this.globalObj.homeworkId = '';
    this.globalObj.homeworkSendTo = [];
    this.globalObj.draftAttachments = [];
    this.globalObj.showDraftAttachments = false;
    this.globalObj.clearPlaceholder = false;
    this.globalObj.pick_date = this.getIsoDate(new Date());
    this.globalObj.todatDate = this.getIsoDate(new Date());
    this.globalObj.sessionStartDate = window.localStorage.getItem('sessionStartDate');
    this.globalObj.sessionEndDate = window.localStorage.getItem('sessionEndDate');
    
  }

  getIsoDate(dateobj: any){  
    var dd = dateobj.getDate();
    var mm = dateobj.getMonth()+1; 
    var yyyy = dateobj.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 
    if(mm<10) {
        mm = '0'+mm
    } 
    return yyyy + '-' + mm + '-' + dd;
  }

  removeHtml(str){
    if(!str) return;
    else { return str.replace(/<\/?[^>]+>/gi, "") } 
  }

  ionViewCanEnter(){
    if(this.navParams){
      this.homeworkFormFlag = this.navParams.get('homeworkFormFlag')
      this.globalObj.data = this.navParams.get('data');
      //this.globalObj.createhomework = this.navParams.get('createhomework');
     // if(this.globalObj.createhomework)
      //{
        //this.homeworkSendTo(this.globalObj.createhomework);
     // }
      
      // if(this.globalObj.data){
      //   const { class_section_name, homework_title, homework_content, homework_id } = this.globalObj.data
      //   this.globalObj.class_section_name = class_section_name
      //   this.add_class = class_section_name
      //   this.globalObj.assigment_title = this.removeHtml(homework_title)
      //   this.globalObj.enter_text = this.removeHtml(homework_content)
      // }
    }
    this.globalObj.pickDate = this.getIsoDate(new Date())
    this.domailUrl = this.myProvider.globalObj.constant.apiUrl
    this.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj['userType'] = window.localStorage.getItem('userType');
    this.globalObj['sessionId'] = window.localStorage.getItem('sessionId');
    this.globalObj['schoolId'] = window.localStorage.getItem('schoolId');
    this.globalObj['token'] = window.localStorage.getItem('token');
    this.globalObj['loginId'] = window.localStorage.getItem('loginId');
    this.globalObj.callfrom = this.navParams.get('place');
    if(this.globalObj.callfrom && this.globalObj.callfrom=='group')
    {
      
      this.getGroupDetail(this.navParams.get('groupId'));
    }
    if(this.homeworkFormFlag)
    {
      this.globalObj.showDraftAttachments = true;
      this.globalObj.enter_text = '';
      this.draftDetail(this.globalObj.data.homework_id);
    }

    //this.assignedClass()

      // this.filterHomework.valueChanges
      // .pipe(
      //   debounceTime(500),
      //   distinctUntilChanged()
      // )
      // .subscribe(obj => { 
      //   if(obj.all_class && obj.all_section && obj.all_subject && obj.assigned_groups && obj.pick_date){
      //     this.globalObj.pickDate = (obj.pick_date)? obj.pick_date: this.getIsoDate(new Date())
      //     this.validBtn = true;
      //   }
      //   else if(obj.all_class && obj.all_section && obj.all_subject && obj.assigned_groups){
      //    this.globalObj.groupId = obj.assigned_groups.filter(val => val != "")
      //    this.assignedgroupsApi(this.globalObj.subjectId);
      //    this.validBtn = true;
      //   }
      //   else if(obj.all_class && obj.all_section && obj.all_subject){
      //     const class_name = this.globalObj.assignedClassData.filter(objct => obj.all_class == objct.class_id )
      //     const section_name = this.globalObj.assignedSectionData.filter(objct => obj.all_section == objct.section_id )
      //     this.globalObj.class_section_name = `${class_name[0].class_name}-${section_name[0].section_name}`
      //     this.globalObj.class_name = class_name[0].class_name
      //     this.globalObj.subjectId = obj.all_subject
      //     this.assignedGroup(obj.all_subject, this.globalObj.sectionId)
      //     this.validBtn = true;
      //     this.getassignedclasssecandgroup(this.globalObj.subjectId)
      //   }
      //   else if(obj.all_class && obj.all_section){
      //     this.globalObj.sectionId = obj.all_section
      //     this.assignedSubject(obj.all_section)
      //     this.validBtn = false;
      //   }
      //   else if(obj.all_class){
      //     this.assignedsection(obj.all_class)
      //     this.globalObj.classId = obj.all_class
      //     this.validBtn = false;
      //   }
      // })
  }

  // assignedClass(){
  //   const params = {
  //     "user_id": this.globalObj['loginId'],
  //     "session_id": this.globalObj['sessionId'],
  //     "school_id": this.globalObj['schoolId'],
  //     "token": this.globalObj['token']
  //   }

  //   const url = this.serverUrl + 'users/assignedclass';
  //   this.http.post(url, params)
  //     .subscribe(details => {
  //       const data: any = details;
  //       if(data.response)
  //         this.globalObj.assignedClassData = data.response.assigned_classes
  //       else
  //         this.globalObj.assignedClassData = []  
  //         if(this.globalObj.assignedClassData[0]){
  //           this.class_id = this.globalObj.assignedClassData[0].class_id
  //           this.class_name = this.globalObj.assignedClassData[0].class_name
  //           this.globalObj.classId = this.class_id
  //           this.assignedsection(this.class_id)
  //         }
  //     })
  // }

  assignedGroup(subject_id, section_id){
    const params = {
      "section_id": section_id,
      "session_id": this.globalObj['sessionId'],
      "subject_id": subject_id,
      "token": this.globalObj['token']
    }

    const url = this.serverUrl + 'groups/assignedgroups';
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        this.globalObj.assignedGroupData = data.response.data
      })
  }

  assignedsection(class_id){
    if(!class_id) return;
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "class_id": class_id,
      "token": this.globalObj['token']
    }

    const url = this.serverUrl + 'users/assignedsection';
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        this.globalObj.assignedSectionData = data.response.assigned_sections
      })
  }

  assignedSubject(section_id){
    this.globalObj.section_id = section_id
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "section_id": section_id,
      "token": this.globalObj['token']
    }

    const url = this.serverUrl + 'user_subjects/assignedsubjects';
    this.http.post(url, params)
      .subscribe(details => {
        const data: any = details;
        this.globalObj.assignedSubjectData = data.response.assigned_subjects
      })
  }

  getassignedclasssecandgroup(val) {
    this.subject_id = val;
    this.sendtolist = [];

    if (val) {
      if(this.globalObj.groupid == undefined){
        localStorage.setItem('homework_subject_id', val);
      }
      const param = {
        "session_id": this.globalObj['sessionId'],
        "section_id": this.globalObj.section_id,
        "user_type": 'student',
        "subject_id": this.subject_id,
        "token": this.globalObj['token']
      };

      this.http.post(this.serverUrl + "user_subjects/subjectwiseusers", param).subscribe(details => {
        this.responseobj = details;
        
        if (this.responseobj.response.length == 0) {
          this.sendtolist = [];
          alert("No Student assigned to this class, section, subject");
          return false;
        }
        else {
          this.subjectwisesectionsApi(val)
        }
      });
    }
    else {
      localStorage.removeItem('homework_subject_id');
      this.class_sec_list = [];
      this.group_list = [];
      this.sendtolist = [];
    }
  }

  subjectwisesectionsApi(val){
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "class_id": this.class_id,
      "subject_id": val,
      "token": this.globalObj['token']
    };
    this.sendtolist = []
    this.sendtolist.push({ 
      'type': 'classsec', 
      'unique_id': this.globalObj.section_id, 
      'value': this.globalObj.class_name + '-' + this.subjectlabel 
    });

    this.http.post(this.serverUrl + "user_subjects/subjectwisesections", params).subscribe(details => {
      this.class_sec_list = details;
      if (this.class_sec_list.response_status.status == '200') {
        this.class_sec_list = this.class_sec_list.response;
      }
     // this.assignedgroupsApi(val);
    });
  }

  assignedgroupsApi(val){
    const params = {
      "user_id": this.globalObj['loginId'],
      "session_id": this.globalObj['sessionId'],
      "section_id": this.globalObj.section_id,
      "subject_id": val,
      "token": this.globalObj['token']
    };
    this.http.post(this.serverUrl +  "groups/assignedgroups", params).subscribe(details => {
      this.group_list = details;
      if (this.group_list.response.status == '200') {
        this.group_list = this.group_list.response.data;

        this.sendtolist = [];
        this.globalObj.sendtoliststr = '';
          for(let key in this.group_list) {
              if(this.globalObj.groupId.indexOf(this.group_list[key].id) >= 0)
              {
                this.sendtolist.push({
                  'type': 'group',
                  'unique_id': this.group_list[key].id,
                  'value': this.group_list[key].group_name
                });
                this.globalObj.sendtoliststr += this.group_list[key].group_name + ',';
              }
          }
      }
    });
  }

  getAttachment(source)
  {
      const options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        targetWidth: 450,
        targetHeight: 450,
        saveToPhotoAlbum: false
      };
    if(source == 'gallery'){
      options.sourceType = this.camera.PictureSourceType.SAVEDPHOTOALBUM
    }
    this.camera.getPicture(options).then((imageData) => {
          this.globalObj.base64Image = "data:image/JPEG;base64," + imageData;
          let d = new Date();
          let n = d.getTime();

          let fileName = 'tleapp_'+n+'.jpg';
          this.globalObj.photo = fileName
          this.globalObj.photos.push(fileName);
          const blob = this.convertBase64ToBlob(this.globalObj.base64Image);
          this.globalObj.fileuploaddata.push(blob);
          
    }, (err) => {
    });
  }

  private convertBase64ToBlob(base64: string) {
    const info = this.getInfoFromBase64(base64);this.globalObj.outputdata = info;
    const sliceSize = 512;
    const byteCharacters = window.atob(info.rawBase64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: info.mime });
  }

  private getInfoFromBase64(base64: string) { 
    const meta = base64.split(',')[0];
    const rawBase64 = base64.split(',')[1].replace(/\s/g, '');
    const mime = /:([^;]+);/.exec(meta)[1];
    const extension = /\/([^;]+);/.exec(meta)[1];

    return {
      mime,
      extension,
      meta,
      rawBase64
    };
  }

  openAttachmentLocation()
  { 
    let confirm = this.alertCtrl.create({
      title: "Option",
      message: "",
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          handler: () => {
            this.getAttachment('camera');
          }
        },
        {
          text: 'Choose photo from Gallery',
          handler: () => {
            this.getAttachment('gallery');
          }
        },
      ]
    });
    confirm.present();
  }

  onsubmitHomework(type){


    //console.log( $('#contentText').html());return;
    let flag = 0
    let msg = ''
    if(this.globalObj.homeworkId=='' && !this.globalObj.clearPlaceholder)
    {
      this.globalObj.enter_text = '';
    }
    else
    {
    this.globalObj.enter_text = $('#contentText').html();
    }
    if(!this.globalObj.assigment_title) {
      flag = 1
      msg = "Assignment title cannot be empty"
    }
    // else if(!this.globalObj.enter_text){
    //   flag = 1
    //   msg = "Text cannot be empty"
    // }
    else if (this.globalObj.assignTo == 'classsection' && !this.globalObj.subjectId)
    {
      flag = 1
      msg = "Subject cannot be empty"
    }

    if(flag) {
      this.presentAlert(msg) 
      return false
    }

    let channel = '';
    let assignto = '';
    let classsec_ids = '';
    let group_ids = '';
    let alllist = '';
    
    // this.sendtolist.forEach(function (values) {
    //   alllist = alllist + values.unique_id + ',';
    // })
    // alllist = alllist.substring(0, alllist.length - 1);
    if (this.globalObj.assignTo == 'classsection') {
      channel = 'class-section';
      assignto = 'class';
      classsec_ids = this.globalObj.finalSendToList;
    }
    else {
      channel = 'group';
      assignto = 'group';
      group_ids = this.globalObj.finalSendToList;
    }

      const url = this.serverUrl + "homework/createhomework"
      const formData = new FormData();
      
     for(let key in this.globalObj.fileuploaddata)
      {
        
        formData.append(key, this.globalObj.fileuploaddata[key], this.globalObj.photos[key]);
      
      }
      let draftFiles = [];
      for(let i in this.globalObj.draftAttachments){
          const dfile = this.globalObj.draftAttachments[i].split(this.myProvider.globalObj.constant.projectName+"/");
            draftFiles.push(dfile[1]);
      }
      
      formData.append("user_id", this.globalObj['loginId']);
      formData.append("session_id", this.globalObj['sessionId']);
      formData.append("class_id", this.globalObj.classId);
      formData.append("section_id", this.globalObj.sectionId);
      formData.append("subject_id", this.globalObj.subjectId);
      formData.append("title", this.globalObj.assigment_title);
      formData.append("content", this.globalObj.enter_text);
      formData.append("channel", channel);
      formData.append("origin", 'app');
      formData.append("type", type);
      formData.append("homework_id", this.globalObj.homeworkId);
      formData.append("file_list", draftFiles.join(','));
      //formData.append("target_date", this.globalObj.pickDate);
      formData.append("target_date", this.globalObj.pick_date);
      formData.append("classsec_ids", classsec_ids);
      formData.append("group_ids", group_ids);
      formData.append("assign_to", assignto);
      formData.append("token", this.globalObj['token']);

      this.http.post(url, formData).subscribe(details => {
        const detail: any = details
        this.success_msg = detail.response_status.message
        let alert = this.alertCtrl.create({
          subTitle: this.success_msg,
          buttons: [{
                  text: 'ok',
                  handler: () => {
                    this.navCtrl.setRoot('HomeworkPage')
                  }
}]
      });
      alert.present();
        // let alert = this.presentAlert(this.success_msg) 
        // alert.didLeave
        //   .subscribe(res => this.createHomeWork.reset() )
      });
  }

  presentAlert(msg){
    msg = (msg) ? msg: 'Some error'
    let alert = this.alertCtrl.create({
      title: msg,
      subTitle: '',
      buttons: ['Dismiss']
    });
    alert.present();
    return alert
  }

  toggleHomeworkFormFlag(){
    this.homeworkFormFlag = !this.homeworkFormFlag
  }
  homeworkSendTo()
  { 
    let modal = this.globalObj.modalCtrl.create(HomeworkAssigntoPage);
     
          modal.onDidDismiss(data => {
            // if(data.classId)
            // this.navCtrl.push('CreateGroupPage',data);
            
            if(data && data.action=='done')
            {  this.globalObj.homeworkSendTo = [];
              this.globalObj.assignTo = data.assignTo;
              if(data.assignTo=='group')
              {
                
                this.globalObj.assigment_subject = data.subject;
                // this.globalObj.showGroupSubject = true;
                // this.globalObj.showClassSecSubject = false;
                this.globalObj.classId = data.classId;
                this.globalObj.sectionId = data.sectionId;
                this.globalObj.subjectId = data.subjectId;
                let sendlist = [];
                let groupIdList = "";
                for(let key in data.groupData)
                {
                  sendlist.push(data.groupData[key].groupName);
                  groupIdList = groupIdList+data.groupData[key].groupId+",";
                }
                this.globalObj.homeworkSendTo = sendlist;
                this.globalObj.finalSendToList = groupIdList.substring(0,groupIdList.length-1);
                
              }
              if(data.assignTo=='classsection')
              { 
                this.globalObj.assigment_subject = data.subject;
                
                // this.globalObj.showClassSecSubject = true;
                // this.globalObj.showGroupSubject = false;
                let sendlist = [];
                let classIdList = "";
                for(let key in data.classsectionData)
                {
                  sendlist.push(data.classsectionData[key].classSecName);
                  classIdList = classIdList+data.classsectionData[key].classSectionId+",";
                }
                
                this.globalObj.homeworkSendTo = sendlist;
                this.globalObj.classId = data.classsectionData[0].classId;
                this.globalObj.sectionId = data.classsectionData[0].sectionId;
                this.globalObj.subjectId = data.classsectionData[0].subjectId;
                this.globalObj.finalSendToList = classIdList.substring(0,classIdList.length-1);
                //this.assignedSubject(data.classsectionData[0].classSectionId);
              }
              
            }
            else{
              this.globalObj.assigment_subject = '';
              // this.globalObj.showGroupSubject = false;
              // this.globalObj.showClassSecSubject = false;
            }
                
            });
         modal.present();
  }

  setSubject(val)
  {
    this.globalObj.subjectId = val;
  }
  getGroupDetail(groupId)
  {
    let params = {"user_id":this.globalObj['loginId'],
    "token":this.globalObj['token'],
    "group_id" :groupId,
    "user_type":"student"};
    let url =  this.serverUrl + '/groups/groupidbydetail';
    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      if(data.response.status=='200')
        {
                let sendlist = [];
                sendlist.push(data.response.groupdata.groupname);
                this.globalObj.homeworkSendTo = sendlist;
                this.globalObj.assigment_subject = data.response.belgons_to_subject.subject_name;
                this.globalObj.showGroupSubject = true;
                this.globalObj.classId = data.response.belgons_to_section.classId;
                this.globalObj.sectionId = data.response.belgons_to_section.id;
                this.globalObj.subjectId = data.response.belgons_to_subject.id;
                this.globalObj.assignTo = 'group';
                this.globalObj.finalSendToList = groupId;
        
        }
      

    })
  }
  draftDetail(draftId)
  {
    this.globalObj.homeworkId = draftId;
    const params = {
      "user_id": this.globalObj['loginId'],
      "draft_id": draftId,
       "token": this.globalObj['token']

    };
    let url =  this.serverUrl + '/homework/draft';
    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      if(data.response_status.status=='200')
        {
          if(data.response.draft_data.assign_to=='class')
          {
            let sendTo = [];
          sendTo.push(data.response.class_section_name);
          this.globalObj.homeworkSendTo = sendTo;
          this.globalObj.assigment_subject = data.response.subject_name;
          // var str = data.response.homework_content.toString();
          // var result= str.replace(/<\/?[^>]+>/gi, "");
          this.globalObj.enter_text = data.response.homework_content;
          this.globalObj.assigment_title = data.response.homework_title;
          this.globalObj.showGroupSubject = true;
          this.globalObj.classId = data.response.draft_data.class_id;
          this.globalObj.sectionId = data.response.draft_data.section_id;
          this.globalObj.subjectId = data.response.draft_data.subject_id;
          this.globalObj.assignTo = 'classsection';
          this.globalObj.draftAttachments = data.response.attachments;
          this.globalObj.finalSendToList = data.response.draft_data.all_ids[0];  
          } 
          if(data.response.draft_data.assign_to=='group')
          {
            const params = {
              "user_id": this.globalObj['loginId'],
              "session_id": this.globalObj['sessionId'],
              "section_id": data.response.draft_data.section_id,
              "subject_id": data.response.draft_data.subject_id,
              "token": this.globalObj['token']
            };
            let url =  this.serverUrl + '/groups/assignedgroups';
            this.http.post(url, params)
          .subscribe(details => {
            const data1: any = details;
            
            if(data1.response.status=='200')
            {
              this.globalObj.groupData = data1.response.data;
              let sendTo = [];
              let finalList = '';
              for(let key in data.response.draft_data.all_ids)
              {
              let obj = this.globalObj.groupData.find(o => o.id == data.response.draft_data.all_ids[key]);
              sendTo.push(obj.group_name);
              finalList = finalList+obj.id+",";
              }
              finalList = finalList.substring(0,finalList.length-1);
              this.globalObj.homeworkSendTo = sendTo;
              this.globalObj.assigment_subject = data.response.subject_name;
              // var str = data.response.homework_content.toString();
              // var result= str.replace(/<\/?[^>]+>/gi, "");
              this.globalObj.enter_text = data.response.homework_content;
              this.globalObj.assigment_title = data.response.homework_title;
              this.globalObj.showGroupSubject = true;
              this.globalObj.classId = data.response.draft_data.class_id;
              this.globalObj.sectionId = data.response.draft_data.section_id;
              this.globalObj.subjectId = data.response.draft_data.subject_id;
              this.globalObj.assignTo = 'group';
              this.globalObj.draftAttachments = data.response.attachments;
              this.globalObj.finalSendToList = finalList;  
              
            }
            
        
          })
          
          }
        
        }
      

    })
  }
  removeDraftAttachment(index){
    this.globalObj.draftAttachments.splice(index, 1);
}
removeAttachment(index)
  {
    this.globalObj.photos.splice(index, 1);
    this.globalObj.fileuploaddata.splice(index, 1);
  }
  clearPlaceholder()
  {
    
    if(!this.homeworkFormFlag && !this.globalObj.clearPlaceholder){ 
      this.globalObj.enter_text = '';
      this.globalObj.clearPlaceholder = true;
      
    }
  }
  showCalendar()
  {
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      allowOldDates:false,
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => console.log('Got date: ', date),
      err => console.log('Error occurred while getting date: ', err)
    );
  }
  // gotoFilter(){
  //   this.navCtrl.push('HomeworkFilterPage', { callfrom: 'createhomework'})
  // }

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
