import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FormGroup, FormControl } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage implements OnInit {
  globalObj: any = {};
  profileData:any;
  serverUrl: any;
  domainUrl: any = '';
  tabIdentifier: any = 'ward';
  imageuri: any;
  sectionArr: any = [];
  section: any;
  subject: any = [];
  parentflag: boolean = false
  editUpdateFlag: boolean = false;
  public profileForm: FormGroup;
  


  constructor(public navCtrl: NavController, public navParams: NavParams, private http: HttpClient
    , private myProvider: CommonProvider, private translate: TranslateService,
    private toastCtrl: ToastController, private camera: Camera,
    private alertCtrl: AlertController) {
      this.domainUrl = this.myProvider.globalObj.constant.domainUrl;
      
      this.profileForm = new FormGroup({
            father_email: new FormControl(''),
            mother_contact: new FormControl(''),
            mother_email: new FormControl(''),
            father_contact: new FormControl('')
          })
     this.globalObj.profileImage = '';
     this.globalObj.photos = [];
     this.globalObj.fileuploaddata = [];
  }
  
  ngOnInit() {
       
     //  this.myProvider.currentMessage.subscribe((message) => {this.globalObj.profileImage = message})
  }
  
//  demo(){
//      this.myProvider.currentMessage.subscribe((message) => {this.globalObj.profileImage = message})
//  }
  
//  initTranslate() {
//    // Set the default language for translation strings, and the current language.
//    this.translate.setDefaultLang('en');
//    const browserLang = this.translate.getBrowserLang();
//    
//    //  this.translate.use('en'); // Set your language here
//    
//
//    this.translate.get(['NAME']).subscribe(values => {
//      console.log(values)
//    });
//  }

  ionViewCanEnter(){
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.studUserId = window.localStorage.getItem('studentUserId');
    
    var userId = this.globalObj.loginId;
    
    if(this.globalObj.userType.toLowerCase() == 'parent') 
    {
      this.parentflag = true;
      userId = this.globalObj.studUserId
      this.globalObj.userType = 'Student'
    }
    this.serverUrl = this.myProvider.globalObj.constant.apiURL;

    const url = this.serverUrl + 'users/userdetail';
    const params = {
      "user_id": userId,
      "session_id": this.globalObj.sessionId,
      "token": this.globalObj.token,
      "type": this.globalObj.userType,
      "school_id": this.globalObj.schoolId
    };

    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      this.profileData = data.response;
      if(this.globalObj.userType.toLowerCase() == 'student'){
        this.imageuri = this.profileData.student_photo;
        this.globalObj.studProfileImage = this.profileData.student_photo;
        this.globalObj.profileImage = this.domainUrl+'/'+this.profileData.student_photo;
        
        this.globalObj.parentProfileImage = this.profileData.father_photo;
        this.globalObj.guardProfileImage = this.profileData.guardian_photo;
        
      } else if(this.globalObj.userType.toLowerCase() == 'teacher'){
        this.imageuri = this.profileData.staffdetail.profile_image 
        this.globalObj.profileImage = this.domainUrl+'/'+this.profileData.staffdetail.profile_image;
        
        this.sectionArr = this.profileData.staffdetail.sectionlist;
        
        let classSection = [];
        let subjectArr = [];
        for(let index in this.sectionArr){
          classSection.push(this.sectionArr[index].class_section_name);
          for(let key in this.sectionArr[index].subjectlist){
            subjectArr.push(this.sectionArr[index].subjectlist[key].subject_name);
          }
        }
        this.section = classSection.join(', ');
        this.subject = subjectArr.join(', ');
      } 
    }, error=>{
      console.log(error)
    })
    
  }
  
  wardType(flag){
      this.globalObj.profileImage = '';
      this.globalObj.wardType = flag;
      if(flag == 'ward'){
          if(this.globalObj.studProfileImage){
              this.globalObj.profileImage = this.domainUrl+'/'+this.globalObj.studProfileImage;
          }else{
              this.globalObj.profileImage = "assets/imgs/profile_img.jpg";
          }
          
      }else if(flag == 'parent'){
            if(this.globalObj.parentProfileImage){
                this.globalObj.profileImage = this.domainUrl+'/'+this.globalObj.parentProfileImage;
            }else{
                this.globalObj.profileImage = "assets/imgs/profile_img.jpg";
            }
      }else if(flag == 'guardian'){
            if(this.globalObj.guardProfileImage){
                this.globalObj.profileImage = this.domainUrl+'/'+this.globalObj.guardProfileImage;
            }else{
                this.globalObj.profileImage = 'assets/imgs/profile_img.jpg';
            }
       }
  }

  segmentChanged(e){
    this.tabIdentifier = e.value;
  }

  toggleEditUpdate(){ 
      if(this.editUpdateFlag){
          this.onProfileSubmit();
          this.editUpdateFlag = false;
      }else{
          this.editUpdateFlag = true;
      }
    
  }

  onProfileSubmit(){
    const form_value = this.profileForm.value
    
    var attr_pattern_email = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    attr_pattern_email = new RegExp(attr_pattern_email);

    var attr_pattern_phone = /^\d{10}$/;
    attr_pattern_phone = new RegExp(attr_pattern_phone);
    
    if(form_value.father_contact){
        if(!attr_pattern_phone.test(form_value.father_contact)){
                 this.presentToast('Entered mobile no is invalid');
                 return false;
             }
    }
    if(form_value.mother_contact){
        if(!attr_pattern_phone.test(form_value.mother_contact)){
                 this.presentToast('Entered mobile no is invalid');
                 return false;
             }
    }
    if(form_value.father_email){
        if(!attr_pattern_email.test(form_value.father_email)){
                 this.presentToast('Entered email id is invalid');
                 return false;
             }
    }
    if(form_value.mother_email){
        if(!attr_pattern_email.test(form_value.mother_email)){
                 this.presentToast('Entered email id is invalid');
                 return false;
             }
    }
    
    
    this.profileForm.patchValue({
      father_email: form_value.father_email,
      mother_contact: form_value.mother_contact,
      mother_email: form_value.mother_email,
      father_contact: form_value.father_contact
    })
    const url = this.serverUrl + 'parents/updateparentprofilerecord';
    
    const params = {
      "user_id": this.globalObj.loginId,
      "father_mobile": form_value.father_contact,
      "father_email": form_value.father_email,
      "mother_mobile": form_value.mother_contact,
      "mother_email": form_value.mother_email,
      "token": this.globalObj.token
    }

    this.http.post(url, params)
    .subscribe(details => {
      const data: any = details;
      this.ionViewCanEnter();
    }, error => console.log(error))
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
  
  
  profileImage(){
      this.globalObj.photos = [];
     this.globalObj.fileuploaddata = [];
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
            //console.log(fileName)
           
           const blob = this.convertBase64ToBlob(this.globalObj.base64Image);
           this.globalObj.fileuploaddata.push(blob);
           
           var formData = new FormData();
           
           for(let key in this.globalObj.fileuploaddata)
            {
                formData.append(key, this.globalObj.fileuploaddata[key], this.globalObj.photos[key]);

            }
            
          formData.append("user_id", this.globalObj.loginId);
         formData.append("token", this.globalObj.token);
         formData.append("user_id_php", '');
         formData.append("session_id", this.globalObj.sessionId);
         
         this.http.post(this.serverUrl+"parents/updateprofileimage", formData).subscribe(data => {
            const details: any = data;
            this.globalObj.profileImage = this.domainUrl+'/'+details.path;
            this.globalObj.parentProfileImage = details.path;
            this.myProvider.changeMessage(this.globalObj.profileImage);
            //this.ngOnInit();
          });


     }, (err) => {
     // Handle error
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

  

}
