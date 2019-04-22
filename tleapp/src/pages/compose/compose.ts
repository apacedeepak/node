import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,AlertController,ToastController } from 'ionic-angular';
import { RecepientpopupPage } from '../recepientpopup/recepientpopup';
import { FormControl, FormBuilder, FormGroup } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { Camera, CameraOptions } from '@ionic-native/camera';
declare var $ :any;
/**
 * Generated class for the ComposePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-compose',
  templateUrl: 'compose.html',
})
export class ComposePage implements OnInit {
    
    public globalObj: any = {};
    public form: FormGroup;
    public testRadioOpen: boolean;


  constructor(public navCtrl: NavController,
       public navParams: NavParams, public modalCtrl: ModalController,
       private fb: FormBuilder,private http: HttpClient,
       private myProvider: CommonProvider,
       private alertCtrl: AlertController,
      private camera: Camera, private toastCtrl: ToastController) {

         this.globalObj.photos = [];
         this.globalObj.fileuploaddata = [];
         this.globalObj.receipentName = [];
         this.globalObj.messageType = 'message';
         this.globalObj.callfrom = navParams.get('place');
         this.globalObj.messageId = navParams.get('messageId');
         this.globalObj.userId = navParams.get('userId');
         this.globalObj.userName = navParams.get('userName');
         this.globalObj.subject = "Re:"+navParams.get('subject');
         this.globalObj.content = navParams.get('content');
         this.globalObj.messageDate = navParams.get('messageDate');
         this.globalObj.groupId = navParams.get('groupId');
        this.globalObj.userType = window.localStorage.getItem('userType');
        this.globalObj.loginId = window.localStorage.getItem('loginId');
        this.globalObj.sessionId = window.localStorage.getItem('sessionId');
        this.globalObj.schoolId = window.localStorage.getItem('schoolId');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
        this.globalObj.studentUserId = window.localStorage.getItem('studentUserId');
        
        this.globalObj.replyFlag = 0;

        this.globalObj.enter_text = '&nbsp';
        
            this.form = new FormGroup({
        subject: new FormControl(''),
        htmlContent: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    
    this.globalObj.receipentFlag = false;
    
    this.globalObj.recepientFlag = false;
    this.globalObj.messageDraftId = '';
 
    this.getRecepientData();
    
  }
  
  ionViewWillLoad() {
    // this.form = new FormGroup({
    //     subject: new FormControl(''),
    //     htmlContent: new FormControl(''),
    // });
  }
  
  ngOnInit() {
      this.globalObj.selectedSection =[];
    if(this.globalObj.callfrom && this.globalObj.callfrom=='reply')
      {
        let temparr = [];
        let tempobj = {user_id:this.globalObj.userId,name:this.globalObj.userName};
        temparr.push(tempobj)
        this.globalObj.receipentName = temparr;
        this.form.get('subject').setValue(this.globalObj.subject);
//        this.form.get('htmlContent').setValue(this.globalObj.content);
        var str = this.globalObj.content.toString();
        var result= str.replace(/<\/?[^>]+>/gi, "");
        
        var dashStr = "<br><br>-----------------------------------------------------<br>"+
                        "From: "+this.globalObj.userName.toString()+'<br>'+
                        "Send on: "+this.globalObj.messageDate+'<br>';
        
        
        // this.form.patchValue({htmlContent: dashStr+result});
        this.globalObj.enter_text = dashStr+result;
        this.globalObj.replyFlag = 1;
      }
      if(this.globalObj.callfrom && this.globalObj.callfrom=='draft')
      {
        this.globalObj.messageType = 'draft';
        this.getDraftDetail(this.globalObj.messageId);
        this.globalObj.replyFlag = 1;
      }
      if(this.globalObj.callfrom && this.globalObj.callfrom=='group')
      {
        this.getGroupDetail();
      }
      
  }
  
  
  
  recepientFunct(){

    if(!this.globalObj.callfrom || (this.globalObj.callfrom && this.globalObj.callfrom!='reply'))
      {
   
     this.globalObj.recepientFlag = true;
     
     let dataObj = {
         receipent:this.globalObj.receipentName,
         parentStudCheck: this.globalObj.parentStudCheck,
         selectedType:this.globalObj.selectedType,
         selectedSection:this.globalObj.selectedSection,
         adminData: this.globalObj.admindata,
         parentData: this.globalObj.sectionlists,
         studentData: this.globalObj.sectionlist,
         teacherData: this.globalObj.assignteachers
     };
     
    let modal = this.modalCtrl.create(RecepientpopupPage, dataObj);
     
     modal.onDidDismiss(data => {
           this.globalObj.receipentName = data.receipent;
           this.globalObj.parentStudCheck = data.parentStudCheck;
           this.globalObj.selectedType = data.selectedType;
           this.globalObj.selectedSection = data.selectedSection;
           
       });
    modal.present();
   
      }
  }
  
  
  getRecepientData(){
      
      let userId = this.globalObj.loginId;
      let user_type = this.globalObj.userType;
    
    if(this.globalObj.userType.toLowerCase() == 'parent'){
        userId = this.globalObj.studentUserId;
        user_type = 'Student';
    }
      
      let params = {
        user_id: userId,
        user_type: user_type,
        school_id:this.globalObj.schoolId,
        token: this.globalObj.token,
        session_id: this.globalObj.sessionId
      };
      
      
    this.http.post(this.globalObj.serverUrl+"communication/getcomposepopdata", params).subscribe(data => {
        const details: any = data;
        this.globalObj.admindata = details.response[0].admin;
        this.globalObj.sectionlist = details.response[0].assignClass;
        this.globalObj.sectionlists = details.response[0].assignClass;
        this.globalObj.assignteachers = details.response[0].assignteachers;
    });
  }
  
  onSubmit(value,messageType){
      
      var formData = new FormData();
      
      var recipient = [];
      
      for(let k in this.globalObj.receipentName){
          recipient.push(this.globalObj.receipentName[k].user_id)
      }
      
      var flag= 'message'
      var draftId = this.globalObj.callfrom && this.globalObj.callfrom=='draft' ? this.globalObj.messageId :'';
      var messageId = this.globalObj.callfrom && this.globalObj.callfrom=='draft' && this.globalObj.messageId && messageType=='message' ? this.globalObj.messageId :'';
     
    let studentUserIDFlag = ''
    studentUserIDFlag = window.localStorage.getItem('userType').toLowerCase()=='parent'?window.localStorage.getItem('studentUserId'):'';
    let userType = window.localStorage.getItem('userType').charAt(0).toUpperCase() + window.localStorage.getItem('userType').slice(1);
    
    for(let key in this.globalObj.fileuploaddata)
    {
      
      formData.append(key, this.globalObj.fileuploaddata[key], this.globalObj.photos[key]);
    
    }
    
    var receipient_type = 'admin';
    var student_check: any = false;
    if(this.globalObj.selectedType == 'parent'){
        receipient_type = 'parent';
        if(this.globalObj.parentStudCheck){
            student_check = true;
        }
    }

    this.globalObj.enter_text = $('#contentText').html();
    
    if(recipient.length == 0 && !value.subject && !this.globalObj.enter_text){
        let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: "Nothing to save",
                        buttons: [{
                                text: 'ok',
                                handler: () => {
                                  this.navCtrl.setRoot('MessagelistPage')
                                }
        }]
                    });
                    alert.present();
        return false;
    }
    
    if(messageType=='message' && recipient.length == 0){
        this.presentToast('Please select any recipient.');
        return false;
    }
    
    if(messageType=='draft'){
        draftId = messageId;
        if(this.globalObj.messageDraftId){
            messageId = this.globalObj.messageDraftId;
            draftId= this.globalObj.messageDraftId;
        }

    }
    
    let draftFiles = [];
    for(let i in this.globalObj.draftAttachments){
        const dfile = this.globalObj.draftAttachments[i].split(this.myProvider.globalObj.constant.projectName+"/");
          draftFiles.push(dfile[1]);
    }
    
    formData.append("content", this.globalObj.enter_text);
    formData.append("receipient_id", recipient.join(','));
    formData.append("subject", value.subject);
    formData.append("message_type", messageType);
    formData.append("draft_id", draftId);
    formData.append("channel_name", "classsection"); //group,classsection
    formData.append("channel_id", "");
    formData.append("message_id", messageId);
    formData.append("user_id", this.globalObj.loginId);
    formData.append("school_id", this.globalObj.schoolId);
    formData.append("file_list", draftFiles.join(','));
    formData.append("user_type", userType);
    formData.append("student_check", student_check);
    formData.append("token", this.globalObj.token);
    formData.append("receipient_type", receipient_type);
    formData.append("student_user_id_flag", studentUserIDFlag);
    formData.append("post_by", "tleapp");
    
     this.http.post(this.globalObj.serverUrl+"communication/compose", formData).subscribe(data => {
        const details: any = data;
        
         if(details.status == '200'){
            if(flag == 'draft'){
              
            }else{
                         let alert = this.alertCtrl.create({
                        title: '',
                        subTitle: details.message,
                        buttons: [{
                                text: 'ok',
                                handler: () => {
                                    if(messageType=='draft'){
                                        this.navCtrl.setRoot('MessagelistPage', {messageType: 'Draft'})
                                    }else{
                                        this.navCtrl.setRoot('MessagelistPage', {messageType: 'Sent'})
                                    }
                                  
                                }
        }]
                    });
                    alert.present();
            }
            
        }
          else if(details.status == '201'){
             let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: details.message,
                        buttons: [{
                                text: 'ok',
                                handler: () => {
                                  this.navCtrl.setRoot('MessagelistPage')
                                }
        }]
                    });
                    alert.present();
            
            
        }

      });
      
  }

 
  removeReceipient(userId)
  {
    
     for(let key in this.globalObj.receipentName){
            if(this.globalObj.receipentName[key].user_id == userId){
                this.globalObj.receipentName.splice(key, 1);
                
            }
      }
  }
  removeAttachment(index)
  {
    this.globalObj.photos.splice(index, 1);
    this.globalObj.fileuploaddata.splice(index, 1);
  }
  
  removeDraftAttachment(index){
      this.globalObj.draftAttachments.splice(index, 1);
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
          //icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
          handler: () => {
            this.getAttachment('camera');
          }
        },
        {
          text: 'Choose photo from Gallery',
         // icon: !this.platform.is('ios') ? 'ios-images-outline' : null,
          handler: () => {
            this.getAttachment('gallery');
          }
        },
      ]
    });
    confirm.present();

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
      this.globalObj.photos.push(fileName);
      //this.globalObj.photos.reverse();
      const blob = this.convertBase64ToBlob(this.globalObj.base64Image);
      this.globalObj.fileuploaddata.push(blob);
      
      
}, (err) => {
// Handle error
});
  }

  deletePhoto(index) {
    let confirm = this.alertCtrl.create({
      title: "Sure you want to delete this photo? There is NO undo!",
      message: "",
      buttons: [
        {
          text: "No",
          handler: () => {
            console.log("Disagree clicked");
          }
        },
        {
          text: "Yes",
          handler: () => {
            console.log("Agree clicked");
            this.globalObj.photos.splice(index, 1);
          }
        }
      ]
    });
    confirm.present();
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

  getDraftDetail(draftId)
  {
    const params = {user_id:this.globalObj.loginId,
                   user_type:this.globalObj.userType,
                   place:"Draft",
                   message_id:draftId,
                   token:this.globalObj.token,
                   search_id:[],
                   student_user_id:""};

     this.http.post(this.globalObj.serverUrl+"communication/communication", params).subscribe(data => {
        const details: any = data;
         if(details.response_status.status == '200'){
        let temparr = [];
        let userName = [];
        let userId = [];
        userName = details.response.draft[0].display_name;
        userId = details.response.draft[0].display_id.split(",");
        this.globalObj.draftAttachments = details.response.draft[0].attachments;
        this.globalObj.messageDraftId = details.response.draft[0].message_id;
        for(let key in userName)
          {
             let tempobj = {user_id:userId[key],name:userName[key]};
            temparr.push(tempobj)
          }
       
        this.globalObj.receipentName = temparr;
        this.form.get('subject').setValue(details.response.draft[0].message_subject);
        this.globalObj.enter_text = details.response.draft[0].message_body;
        
        if(details.response.draft[0].draft_id.length > 0){
            temparr = [];
            this.globalObj.selectedType = 'parent';
            if(userId.length == details.response.draft[0].draft_id.length){ 
                this.globalObj.parentStudCheck = false;
            }else{
                this.globalObj.parentStudCheck = true; 
            }
            for(let key in details.response.draft[0].draftName)
            {
               let tempobj = {user_id:details.response.draft[0].draft_id[key],name:details.response.draft[0].draftName[key]};
              temparr.push(tempobj)
            }
            
            this.globalObj.receipentName = temparr;
            
        }
        
        
       // this.form.get('htmlContent').setValue(details.response.draft[0].message_body);
         }
     })
  }
  
  
  doRadio() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Share with');
    alert.addInput({
      type: 'radio',
      label: 'Admin',
      value: 'admin',
     // checked: true
    });

    
    
    if(this.globalObj.userType.toLowerCase() == 'student' || this.globalObj.userType.toLowerCase() == 'parent'){
        alert.addInput({
            type: 'radio',
            label: 'Class Teacher',
            value: 'classteach'
          });

          alert.addInput({
            type: 'radio',
            label: 'Subject Teacher',
            value: 'subteach'
          });
    }else if(this.globalObj.userType.toLowerCase() == 'teacher'){
        alert.addInput({
            type: 'radio',
            label: 'Parent',
            value: 'parent'
          });

          alert.addInput({
            type: 'radio',
            label: 'Student',
            value: 'student'
          });

          alert.addInput({
            type: 'radio',
            label: 'Staff',
            value: 'staff'
          });
          
          alert.addInput({
            type: 'radio',
            label: 'Group',
            value: 'group'
          });
    }

    
    
    //alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: data => {
        this.testRadioOpen = false;
        this.globalObj.selectedType = data;
        this.recepientFunct();
      }
    });

    alert.present().then(() => {
      this.testRadioOpen = true;
      
    });
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
        this.globalObj.updateDateTime = data.response.groupdata.updated_date_time;
        this.globalObj.subject = data.response.belgons_to_subject.subject_name;
        this.globalObj.classSection = data.response.belgons_to_section.section_name;
        this.globalObj.totalMember = data.response.data.length;
        this.globalObj.memberData = data.response.data;
        let temparr = [];
        for(let key in data.response.data)
        {
          if(data.response.data[key].chkflag)
          {
          let tempobj = {user_id:data.response.data[key].user_id,name:data.response.data[key].student_name};
          temparr.push(tempobj)
          }
          
          // if(data.response.data[key].chkflag)
          // {
          //   this.globalObj.userId.push(data.response.data[key].user_id);
          // }
        }
        this.globalObj.receipentName = temparr;
        }
      

    })
  }
  
  moreLess(flag){
      if(flag == 'more'){
          this.globalObj.receipentFlag = true;
      }else{
          this.globalObj.receipentFlag = false;
      }
  }
  
   presentToast(msg) {
    msg = (msg) ? msg: "some error" 
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  clearPlaceholder()
  {
      if(!this.globalObj.replyFlag){
        this.globalObj.enter_text = '';
      }
  }
  
  
}


