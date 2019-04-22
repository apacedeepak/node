import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams,Platform,ModalController} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { HomeworkRemarkPage } from '../homework-remark/homework-remark';

/**
 * Generated class for the HomeworkCheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-homework-check',
  templateUrl: 'homework-check.html',
})
export class HomeworkCheckPage {
  globalObj: object = {}
    public homeworkId : any;
    public detaildata : any;
    public id : any;
    public token: any;
    public userid : any;
    public studentName : any;
    public submitremark : any;
    public homedetail : any;
    public title:any;
   public subject:any;
   public targetdate:any;
   public attachment : any;
   public content : any;
   public creationdate : any;
   public subexist : any;
   public remarksexist : any;
   public submitdate : any;
   public submitcontent : any;
   public submitattachment : any;
   public remarkcontent : any;
   public remarkdate : any;
   public teacherimage :any = '';
   public studentimage :any = '';
   public remarkhide : any;
   name: any = '';
   public serverurl :string = '';
   public domainUrl: string = '';
   public downloadUrl: string = '';
   
  constructor(private myProvider: CommonProvider, private http: HttpClient,
              public navCtrl: NavController, public navParams: NavParams,
              private transfer: FileTransfer, private file: File,
              private document: DocumentViewer,private platform: Platform,
              private photoViewer: PhotoViewer,private modalCtrl: ModalController) {
    this.userid = navParams.get('user_id')
    this.homeworkId = navParams.get('homework_id')
    this.studentName = navParams.get('name');
    this.downloadUrl = this.myProvider.globalObj.constant.domainUrl+"/";
  }

  ionViewDidLoad() {
    this.subexist = false;
    this.remarksexist = false;
    this.serverurl = this.myProvider.globalObj.constant.apiURL;
    this.domainUrl = this.myProvider.globalObj.constant.domainUrl
    const param = {
            'user_id' : this.userid,
            'homework_id': this.homeworkId,
            'token': this.token
       };
     this.http.post(this.serverurl + 'homework/homeworksubmitandremarkdetail', param).subscribe(details => {
      this.detaildata = details;
      this.studentimage = this.detaildata.response.student_image? (this.domainUrl + '/' + this.detaildata.response.student_image): 'assets/imgs/profile_img.jpg';
      this.homedetail  = this.detaildata.response.teacher_homework_detail; 
      this.submitremark  = this.detaildata.response.submit_remark_detail;
      this.subject =  this.homedetail.subject_name;
      this.title =  this.homedetail.title;
      this.attachment = this.homedetail.attachments;
      this.creationdate = this.homedetail.creation_date;
      this.targetdate = this.homedetail.target_date;
      this.content = this.homedetail.content;
      this.teacherimage = this.homedetail.teacher_image? (this.domainUrl + '/' + this.homedetail.teacher_image): 'assets/images/profile_img.jpg';
      localStorage.setItem('title', this.title);
      localStorage.setItem('subject', this.subject);    

        if(this.submitremark.submitted_date != undefined && this.submitremark.submitted_date != '')
         { 
            this.subexist = true;
            this.remarkhide = true;
             this.submitdate = this.submitremark.submitted_date;
              this.submitcontent = this.submitremark.submitted_content;
               this.submitattachment = this.submitremark.submitted_attachment;
         }

        if(this.submitremark.remark_date != undefined && this.submitremark.remark_date != ''  )
         { 
         this.remarksexist = true;
          this.remarkhide = false;
         this.remarkcontent= this.submitremark.remark_content;
         this.remarkdate= this.submitremark.remark_date;
         }
        
     });
  }

  addRemark(){
    //this.navCtrl.push('HomeworkRemarkPage', { studentName: this.studentName, homeworkId: this.homeworkId,userId:this.userid,title:this.title,subject:this.subject })
    let modal = this.modalCtrl.create(HomeworkRemarkPage,{ studentName: this.studentName, homeworkId: this.homeworkId,userId:this.userid,title:this.title,subject:this.subject });
     
    modal.onDidDismiss(data => {
     
      
      if(data && data.id)
      {
      //  this.navCtrl.pop();
      //  this.navCtrl.pop();
       //this.navCtrl.push('HomeworkPage', {id:data.id});
       this.navCtrl.setRoot('HomeworkPage');
      }
      
      });
   modal.present();
  }
  viewImage(item){
          
    let filePath = this.downloadUrl+item;
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
