import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController ,Platform} from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpClient } from '@angular/common/http';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';
declare var jquery:any;
declare var $ :any;

/**
 * Generated class for the StudentHomeworkReplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-student-homework-reply',
  templateUrl: 'student-homework-reply.html',
})
export class StudentHomeworkReplyPage {
  public globalObj: any = {};

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private alertCtrl :AlertController,private camera: Camera,
              private myProvider: CommonProvider,private http: HttpClient,
              private transfer: FileTransfer, private file: File,
             private document: DocumentViewer,private platform: Platform, private photoViewer: PhotoViewer) {
                this.globalObj.photos = [];
                this.globalObj.fileuploaddata = [];
                this.globalObj.homeworkData = navParams.get('homeworkData');
                this.globalObj.homeworkId = navParams.get('homeworkId');
                this.globalObj.token = window.localStorage.getItem('token');
                this.globalObj.loginId = window.localStorage.getItem('loginId');
                this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
                this.globalObj.replyContent = '';
                this.globalObj.clearPlaceholder = false;
                this.globalObj.domainUrl = this.myProvider.globalObj.constant.domainUrl
                this.globalObj.teacherName = this.globalObj.homeworkData.teacher_homework_detail.teacher_name;
                this.globalObj.title = "Re:"+this.globalObj.homeworkData.teacher_homework_detail.title;
                this.globalObj.creationDate = this.globalObj.homeworkData.teacher_homework_detail.creation_date;
                this.globalObj.targetDate = this.globalObj.homeworkData.teacher_homework_detail.target_date;
                this.globalObj.content = this.globalObj.homeworkData.teacher_homework_detail.content;
                this.globalObj.attachment = this.globalObj.homeworkData.teacher_homework_detail.attachments;
                this.globalObj.teacherImage = this.globalObj.homeworkData.teacher_homework_detail.teacher_image? (this.globalObj.domainUrl + '/' + this.globalObj.homeworkData.teacher_homework_detail.teacher_image): 'assets/imgs/profile_img.jpg';;
                this.globalObj.studentImage = this.globalObj.homeworkData.student_image? (this.globalObj.domainUrl + '/' + this.globalObj.homeworkData.student_image): 'assets/imgs/profile_img.jpg';;
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

  ionViewDidLoad() {
    //console.log('ionViewDidLoad StudentHomeworkReplyPage');
  }
  onSubmit()
  {
    const url = this.globalObj.serverUrl + "homework/studenthomeworksubmit"
      const formData = new FormData();
      
     for(let key in this.globalObj.fileuploaddata)
      {
        
        formData.append(key, this.globalObj.fileuploaddata[key], this.globalObj.photos[key]);
      
      }
      // if(!this.globalObj.clearPlaceholder)
      // {
      //   this.globalObj.replyContent = '';
      // }
      // else
      // {
      // this.globalObj.replyContent = $('#contentText').html();
      // }
      formData.append("homework_id", this.globalObj.homeworkId);
      formData.append("user_id", this.globalObj.loginId);
      formData.append("token", this.globalObj.token);
      formData.append("content", this.globalObj.replyContent);
      this.http.post(url, formData).subscribe(details => {
        const detail: any = details
       
        let alert = this.alertCtrl.create({
          title: detail.status=='200'?'Success':'Error',
          subTitle: detail.message,
          buttons: [{
                  text: 'ok',
                  handler: () => {
                    this.navCtrl.setRoot('HomeworkPage')
                  }
                  }]
      });
      alert.present();
    
        
      });
  }
  removeAttachment(index)
  {
    this.globalObj.photos.splice(index, 1);
    this.globalObj.fileuploaddata.splice(index, 1);
  }
  clearPlaceholder()
  {
      if(!this.globalObj.clearPlaceholder)
      {
      this.globalObj.replyContent = '';
      this.globalObj.clearPlaceholder = true;
      }
      
    
  }
  viewImage(item){
          
    let filePath = this.globalObj.downloadUrl+item;
     //    this.navCtrl.push('ImageviewerPage',{path:path});
         
         
  let path = null;
     
  if(this.platform.is('ios')){
     path = this.file.documentsDirectory;
  }else{
     path = this.file.dataDirectory;
  }
  
  //this.presentToast("Download")
  
  const transfer = this.transfer.create();
  
  var splitPath = filePath.split('.');
  var totalLength = splitPath.length;
  
  var extension = splitPath[totalLength-1]
  
  transfer.download(filePath, path + filePath).then((entry) => { 
     let url = entry.toURL();
     if(extension.toLowerCase() == 'jpg' || extension.toLowerCase() == 'jpeg' || extension.toLowerCase() == 'png' || extension.toLowerCase() == 'gif'){
         this.photoViewer.show(url);
     }
     if(extension.toLowerCase() == 'pdf'){
       this.document.viewDocument(url, 'application/pdf', {})
     }
     if(extension.toLowerCase() == 'xlsx'){
         this.document.viewDocument(url, 'application/xlsx', {})
     }
     if(extension.toLowerCase() == 'xls'){
         this.document.viewDocument(url, 'application/vnd.ms-excel', {})
     }
     //this.photoViewer.show(url);
  
  });
   
  }

}
