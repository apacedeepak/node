import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Navbar, Nav, Platform, ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { FileOpener } from '@ionic-native/file-opener';

/**
 * Generated class for the MessagedetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messagedetails',
  templateUrl: 'messagedetails.html',
})
export class MessagedetailsPage {
    
    public globalObj: any = {};
    public messageList: any = [];
    
    @ViewChild(Navbar) navBar: Navbar;
    @ViewChild(Nav) nav: Nav;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private http: HttpClient,private myProvider: CommonProvider,
      private transfer: FileTransfer, private file: File,
      private document: DocumentViewer,
      public platform: Platform, private photoViewer: PhotoViewer,
      private fileOpener: FileOpener, public toastCtrl: ToastController) {
      
      this.globalObj.messageId = navParams.get('id');
      this.globalObj.place = navParams.get('place');
     // this.navCtrl.popTo('MessagedetailsPage')
  }
  

  ionViewDidEnter(){
//        this.navBar.backButtonClick = ()=>{
//            this.navCtrl.setRoot('MessagelistPage')
//            
//        }
  }

  ionViewDidLoad() {
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.downloadUrl = this.myProvider.globalObj.constant.domainUrl+"/";
    this.getMessageList();
    
  }
  
  getMessageList(){
       
        const params = {
            "user_id":this.globalObj.loginId,
            "user_type":this.globalObj.userType,
            "place":this.globalObj.place,
            "search_id":[],
            "message_id": this.globalObj.messageId,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token
        }; 
        
        if(this.globalObj.userType.toLowerCase() == 'parent'){
            params['student_user_id'] = this.globalObj.student_user_id
        }   
       
        this.http.post(this.globalObj.serverUrl+"communication/communication", params).subscribe(res => {
            const details: any = res;
          let showdata = details.response.sent[0];
          
          if(this.globalObj.place.toLowerCase() == "inbox"){
            showdata = details.response.inbox[0];
            this.globalObj.countReceipent = 1;
            this.globalObj.displayHeader = "Inbox Message";
            this.globalObj.userId = showdata.display_id;
            this.globalObj.content = showdata.message_body;
            this.globalObj.subject = showdata.message_subject;
            this.globalObj.display_name = showdata.display_name;
          }else if(this.globalObj.place.toLowerCase() == "sent"){
            showdata = details.response.sent[0];
            this.globalObj.countReceipent = showdata.display_name.length;
            this.globalObj.displayHeader = "Sent Message";
            this.globalObj.display_name = showdata.display_name.join(', ');
          }else if(this.globalObj.place.toLowerCase() == "draft"){
            showdata = details.response.draft[0];
            this.globalObj.countReceipent = showdata.display_name.length;
            this.globalObj.displayHeader = "Draft Message";
            this.globalObj.display_name = showdata.display_name.join(', ');
          }else if(this.globalObj.place.toLowerCase() == "archived"){
            showdata = details.response.archived[0];
            this.globalObj.countReceipent = 1;
            this.globalObj.displayHeader = "Archived Message";
            this.globalObj.display_name = showdata.display_name;
          }

          this.globalObj.attachments = showdata.attachments;
          
          // var message_body = showdata.message_body.toString();
          // message_body = message_body.replace(/<\/?[^>]+>/gi, "");
          this.globalObj.message_body = showdata.message_body;
          this.globalObj.message_date = showdata.message_date;
          this.globalObj.message_subject = showdata.message_subject;
          this.globalObj.message_id = showdata.message_id;
          this.globalObj.message_isimportant = showdata.message_isimportant;
          this.globalObj.images = showdata.images;
          
          //this.globalObj.imagePrefix = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME+ '/';
            
        });
    }
      replyMessage()
      {
         this.navCtrl.push('ComposePage',{place:'reply',userId:this.globalObj.userId,
                                          userName:this.globalObj.display_name,
                                        subject:this.globalObj.subject,
                                      content:this.globalObj.content,messageDate:this.globalObj.message_date});
      }
      
      viewImage(item){
          
           let filePath = this.globalObj.downloadUrl+item;
            //    this.navCtrl.push('ImageviewerPage',{path:path});
                
                
        let path = null;
            
        if(this.platform.is('ios')){
            path = this.file.documentsDirectory;
//            path = this.file.syncedDataDirectory;
        }else{
            path = this.file.externalDataDirectory;
            
        }

        //this.presentToast("Download")

        const transfer = this.transfer.create();

        var splitPath = filePath.split('.');
        var totalLength = splitPath.length;

        var extension = splitPath[totalLength-1]
        
        
        transfer.download(filePath, path + filePath).then((entry) => { 
            
            let url = decodeURIComponent(entry.toURL());
            let url1 = entry.toInternalURL();
            if(extension.toLowerCase() == 'jpg' || extension.toLowerCase() == 'jpeg' || extension.toLowerCase() == 'png' || extension.toLowerCase() == 'gif'){
                this.photoViewer.show(url);
            }
            if(extension.toLowerCase() == 'pdf'){
              this.document.viewDocument(url, 'application/pdf', {})
            }
            if(extension.toLowerCase() == 'xlsx' || extension.toLowerCase() == 'xls'
                || extension.toLowerCase() == 'docx' || extension.toLowerCase() == 'doc'
                || extension.toLowerCase() == 'ppt' || extension.toLowerCase() == 'pptx'){
                var contentType = '';
                if(extension.toLowerCase() == 'xlsx'){
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                }
                if(extension.toLowerCase() == 'xls'){
                    contentType = 'application/vnd.ms-excel';
                }
                if(extension.toLowerCase() == 'docx'){
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                }
                if(extension.toLowerCase() == 'doc'){
                    contentType = 'application/msword';
                }
                if(extension.toLowerCase() == 'ppt'){
                    contentType = 'application/vnd.ms-powerpoint';
                }
                if(extension.toLowerCase() == 'pptx'){
                    contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                }
                
                
                this.fileOpener.open(url, contentType)
                    .then(() => console.log('File is opened'))
                    .catch(e => console.log(JSON.stringify(e)));
            }

        });
          
      }
      
     
      
      presentToast(url) {
        const toast = this.toastCtrl.create({
          message: url,
          duration: 10000,
          position:  "middle"
        });
        toast.present();
      }

}
