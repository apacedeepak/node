import { Component ,OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { FileOpener } from '@ionic-native/file-opener';

/**
 * Generated class for the NoticeCircularDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notice-circular-detail',
  templateUrl: 'notice-circular-detail.html',
})
export class NoticeCircularDetailPage implements OnInit{
  public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: HttpClient,private myProvider: CommonProvider,
    private transfer: FileTransfer, private file: File,
    private document: DocumentViewer,
    public platform: Platform, private photoViewer: PhotoViewer,
    private fileOpener: FileOpener) {
    this.globalObj.announceId = navParams.get('id');
    this.globalObj.place = navParams.get('place');
    this.globalObj.userType = window.localStorage.getItem('userType');
    this.globalObj.loginId = window.localStorage.getItem('loginId');
    this.globalObj.sessionId = window.localStorage.getItem('sessionId');
    this.globalObj.schoolId = window.localStorage.getItem('schoolId');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
    this.globalObj.downloadUrl = this.myProvider.globalObj.constant.domainUrl+"/"+this.myProvider.globalObj.constant.projectName;
    
    
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NoticeCircularDetailPage');
  }
    ngOnInit() {
      this.getAnnouncementDetail();

   }
getAnnouncementDetail()
{
   if(this.globalObj.userType.toLowerCase()=='parent')
            {
                var userId = window.localStorage.getItem('studentUserId');
            }
        else
            {
                var userId = window.localStorage.getItem('loginId');
            }
    const params = {
            "user_id":userId,
            "announce_id":this.globalObj.announceId,
            "type":this.globalObj.place,
            "user_type":this.globalObj.userType,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token
        }; 
       
        this.http.post(this.globalObj.serverUrl+"announcement_assign/assignedannouncments", params).subscribe(data => {
            let responsedata: any  = data;
              if(responsedata.response_status.status=='200')
                {
                 //this.setDashBoardData('online',responsedata);
                 if(this.globalObj.place.toLowerCase()=='notice')
                  {
                 this.globalObj.title = responsedata.response.notice[0].title;
                 this.globalObj.created_date = responsedata.response.notice[0].created_date_app;
                 this.globalObj.description = responsedata.response.notice[0].description;
                 this.globalObj.attachments = responsedata.response.notice[0].attachments;
                  }

                 if(this.globalObj.place.toLowerCase()=='circular')
                  {
                 this.globalObj.title = responsedata.response.circular[0].title;
                 this.globalObj.created_date = responsedata.response.circular[0].created_date_app;
                 this.globalObj.description = responsedata.response.circular[0].description;
                 this.globalObj.attachments = responsedata.response.circular[0].attachments;
                  }
                 
                }
        })
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

}
