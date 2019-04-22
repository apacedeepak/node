import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import {NotesrecepientPage} from '../notesrecepient/notesrecepient';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FormControl, FormBuilder, FormGroup } from "@angular/forms";
import { Camera, CameraOptions } from '@ionic-native/camera';
declare var $ :any;

/**
 * Generated class for the CreatenotesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createnotes',
  templateUrl: 'createnotes.html',
})
export class CreatenotesPage {
    
    public form: FormGroup;
    public testRadioOpen: boolean;
    
    public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public modalCtrl: ModalController, private alertCtrl: AlertController,
      private http: HttpClient,private myProvider: CommonProvider,
      private camera: Camera) {
      
      this.globalObj.place = navParams.get('place');
      this.globalObj.notesId = navParams.get('notesId');
      this.globalObj.photos = [];
      this.globalObj.fileuploaddata = [];
      this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
      this.globalObj.receipentName = [];
      this.globalObj.selectedType = '';
      this.globalObj.selectSubjectName = 'Select Subject';
      this.globalObj.enter_text = '&nbsp';
      
      this.form = new FormGroup({
        topic: new FormControl(''),
        htmlContent: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    if(this.globalObj.notesId){
        let params = {
            "notes_id":this.globalObj.notesId,
            "token":this.globalObj.token
        };
        this.http.post(this.globalObj.serverUrl+"notes/getnotesdetails", params).subscribe(res => {
               const data: any = res;
               let notesdetail = data.response.data;
        });
    }
  }
  
  notesRecepient(){
      let modal = this.modalCtrl.create(NotesrecepientPage);
     
     modal.onDidDismiss(data => {
         if(data)
         {
            this.globalObj.receipentName = data.receipent;
           this.globalObj.selectedType = data.selectedType;
           this.globalObj.subjectName = data.subjectName;
           this.globalObj.sectionId = data.sectionId;
           this.globalObj.subjectId = data.subjectId;
           this.globalObj.className = data.className;
           this.globalObj.sectionName = data.sectionName;
           }
        });
    modal.present();
  }
  
  getSubject(){
      if(this.globalObj.selectedType == 'individuals'){
      const params = {
            "user_id": this.globalObj.loginId,
            "session_id": this.globalObj.sessionId,
            "section_id": this.globalObj.sectionId,
            "token": this.globalObj.token
          }

          const url = this.globalObj.serverUrl + 'user_subjects/assignedsubjects';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
              this.globalObj.assignedSubjectData = data.response.assigned_subjects
              let alert = this.alertCtrl.create();
                alert.setTitle('Select Subject');
                
                for(let i in this.globalObj.assignedSubjectData){
                    alert.addInput({
                        type: 'radio',
                        label: this.globalObj.assignedSubjectData[i].subject_name,
                        value: this.globalObj.assignedSubjectData[i].subject_id
                    });
                }
                
                alert.addButton({
                    text: 'Ok',
                    handler: data => {
                      this.testRadioOpen = false;
                      this.globalObj.selectedSubject = data;
                      for(let i in this.globalObj.assignedSubjectData){
                        if(this.globalObj.assignedSubjectData[i].subject_id == data){
                                this.globalObj.selectSubjectName = this.globalObj.assignedSubjectData[i].subject_name;
                        }
                      }
                      
                    }
                  });
                  alert.present().then(() => {
                    this.testRadioOpen = true;

                  });
            });
      }
  }
  
  removeReceipient(userId)
  {
    
     for(let key in this.globalObj.receipentName){
            if(this.globalObj.receipentName[key].user_id == userId){
                this.globalObj.receipentName.splice(key, 1);
                
            }
      }
  }
  
  onSubmit(value,notesType){
      var formData = new FormData();
      
      var subjectId = this.globalObj.subjectId;
      
      if(!value.topic){
          let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: "Topic cannot be empty",
                        buttons: [{
                                text: 'ok',
                                handler: () => {
                                  
                                }
            }]
                    });
                    alert.present();
        return false;
      }
      
      this.globalObj.enter_text = $('#contentText').html();
      if(!this.globalObj.enter_text){
          let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: "Text cannot be empty",
                        buttons: [{
                                text: 'ok',
                                handler: () => {
                                  
                                }
            }]
                    });
                    alert.present();
        return false;
      }
      
      if(this.globalObj.selectedType == 'individuals' || this.globalObj.selectedType == 'teachers'){
          subjectId = this.globalObj.selectedSubject;
      }
      
        var today: any = new Date();
        var dd: any = today.getDate();
        var mm: any = today.getMonth()+1; //January is 0!
        var yyyy: any = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        } 

        this.globalObj.todayDate = yyyy + '-' + mm + '-' + dd;
      
      formData.append("notes_title", value.topic);
      formData.append("notes_text", this.globalObj.enter_text);
      formData.append("author", this.globalObj.loginId);
      formData.append("session_id", this.globalObj.sessionId);
      formData.append("created_date", this.globalObj.todayDate);
      formData.append("subject_id", subjectId);
      formData.append("token", this.globalObj.token);
      formData.append("attachments", '');
      formData.append("placeholder", "draft");
      formData.append("section_id", this.globalObj.sectionId);
      formData.append("school_id", this.globalObj.schoolId);
      formData.append("file_list", '');
      
        const url = this.globalObj.serverUrl + 'notes/createnotes';
            this.http.post(url, formData)
              .subscribe(details => {
                const data: any = details;
                
                if(data.status == "200"){
                    if(notesType == "created"){
                        let alert = this.alertCtrl.create({
                            title: 'Success',
                            subTitle: data.message,
                            buttons: [{
                                    text: 'ok',
                                    handler: () => {
                                        this.form.patchValue({topic:'',htmlContent: ""});
                                        this.navCtrl.setRoot('NoteslistPage');
                                    }
                            }]
                        });
                        alert.present();
                    }else{
                        this.sharedNotes(data.data);
                    }
                }
                
        });
  }
  
  sharedNotes(res){
      
      var shareWith = "";
      
      var groupId = [];
      var userId = [];
      
      if(this.globalObj.selectedType == 'individuals'){
          shareWith = "Individual";
          for(let key in this.globalObj.receipentName){
               userId.push(this.globalObj.receipentName[key].user_id);
           }
      }else if(this.globalObj.selectedType == 'classsection'){
          shareWith = "Section";
      }else if(this.globalObj.selectedType == 'teachers'){
           shareWith = "Teacher";
           for(let key in this.globalObj.receipentName){
               userId.push(this.globalObj.receipentName[key].user_id);
           }
      }else if(this.globalObj.selectedType == 'group'){
           shareWith = "Group";
           for(let key in this.globalObj.receipentName){
               groupId.push(this.globalObj.receipentName[key].user_id);
           }
      }
      
      var section = [];
      section.push(this.globalObj.sectionId)
      
        var params = {
                "notes_id": res.id,
                "share_with": shareWith,
                "section_id": section,
                "school_id": this.globalObj.schoolId,
                "sender": this.globalObj.loginId,
                "session_id":this.globalObj.sessionId,
                "group_id":groupId,
                "user_ids" : userId,
                "shared_date": this.globalObj.todayDate
            };
      
        const url = this.globalObj.serverUrl + 'user_notes/sharenotes';
            this.http.post(url, params)
              .subscribe(details => {
                const data: any = details;
                if(data.response.status == '200'){
                    let alert = this.alertCtrl.create({
                            title: 'Success',
                            subTitle: "Notes created successfully",
                            buttons: [{
                                    text: 'ok',
                                    handler: () => {
                                        this.form.patchValue({topic:'',htmlContent: ""});
                                        this.navCtrl.setRoot('NoteslistPage');
                                    }
                            }]
                        });
                        alert.present();
                    
                }
        });
  }
  removeAttachment(index)
  {
    this.globalObj.photos.splice(index, 1);
    this.globalObj.fileuploaddata.splice(index, 1);
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
  
  clearPlaceholder()
  {
     // if(!this.globalObj.draftFlag){
        this.globalObj.enter_text = '';
     // }
  }

}
