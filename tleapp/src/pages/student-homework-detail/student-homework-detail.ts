import { Component,OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams ,Platform} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';

/**
 * Generated class for the StudentHomeworkDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-student-homework-detail',
  templateUrl: 'student-homework-detail.html',
})
export class StudentHomeworkDetailPage implements OnInit{
public globalObj: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams,
  private http:HttpClient,private myProvider: CommonProvider,
  private transfer: FileTransfer, private file: File,
  private document: DocumentViewer,private platform: Platform, private photoViewer: PhotoViewer) {
    this.globalObj.homeworkId = navParams.get('id');
    this.globalObj.userType = window.localStorage.getItem('userType').toLowerCase();
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.domainUrl = this.myProvider.globalObj.constant.domainUrl
    this.globalObj.displayFlag = false;
    this.globalObj.subexist = false;
    this.globalObj.remarksexist = false;
    this.globalObj.downloadUrl = this.myProvider.globalObj.constant.domainUrl+"/";
  }
  ngOnInit() {

       
        this.getHomeworkDetail();
   }
      getHomeworkDetail()
      {
        
         let params = {
              user_id:this.globalObj.userType=='student'?window.localStorage.getItem('loginId'):window.localStorage.getItem('studentUserId'),
              homework_id:this.globalObj.homeworkId,
              token:this.globalObj.token
   } 
            
            this.http.post(this.globalObj.serverUrl+"homework/homeworksubmitandremarkdetail", params).subscribe(data => {
               let responsedata: any  = data;
              if(responsedata.response_status.status=='200')
                {
                  this.globalObj.homeworkData = responsedata.response;
                  this.globalObj.teacherName = responsedata.response.teacher_homework_detail.teacher_name;
                  this.globalObj.attachment = responsedata.response.teacher_homework_detail.attachments;
                  this.globalObj.teacherImage = responsedata.response.teacher_homework_detail.teacher_image? (this.globalObj.domainUrl + '/' + responsedata.response.teacher_homework_detail.teacher_image): 'assets/imgs/profile_img.jpg';;
                  this.globalObj.studentImage = responsedata.response.student_image? (this.globalObj.domainUrl + '/' + responsedata.response.student_image): 'assets/imgs/profile_img.jpg';;
                  this.globalObj.title = responsedata.response.teacher_homework_detail.title;
                  this.globalObj.subjectName = responsedata.response.teacher_homework_detail.subject_name;
                  this.globalObj.targetDate = responsedata.response.teacher_homework_detail.target_date_app;
                  this.globalObj.creationDate = responsedata.response.teacher_homework_detail.creation_date;
                  this.globalObj.content = responsedata.response.teacher_homework_detail.content;
                  this.globalObj.displayFlag = true;
                  if(responsedata.response.submit_remark_detail.submitted_date)
                  {
                    this.globalObj.subexist = true;
                    this.globalObj.submitDate = responsedata.response.submit_remark_detail.submitted_date;
                    this.globalObj.submittedAttachment = responsedata.response.submit_remark_detail.submitted_attachment;
                    this.globalObj.submittedContent = responsedata.response.submit_remark_detail.submitted_content;
                  }
                  if(responsedata.response.submit_remark_detail.remark_date)
                  {
                    this.globalObj.remarksexist = true;
                    this.globalObj.remarkDate = responsedata.response.submit_remark_detail.remark_date;
                    //this.globalObj.remarkAttachment = responsedata.response.submit_remark_detail.remark_attachment;
                    this.globalObj.remarkContent = responsedata.response.submit_remark_detail.remark_content;
                  }
                }
            })
      }
      

  ionViewDidLoad() {
    //console.log('ionViewDidLoad StudentHomeworkDetailPage');
  }
  replyMessage()
  {
    this.navCtrl.push('StudentHomeworkReplyPage',{homeworkData:this.globalObj.homeworkData,homeworkId:this.globalObj.homeworkId});
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
