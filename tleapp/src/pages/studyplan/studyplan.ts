import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { WebIntent } from '@ionic-native/web-intent';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';  
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
/**
 * Generated class for the StudyplanPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-studyplan',
  templateUrl: 'studyplan.html',
})
export class StudyplanPage {
    
    globalObj: any = {};
    public subjectarr : any = [];
    domainUrl: any = '';
    serverUrl: any;
    public sessionid: any;
    public userid: any;
    public token: any;
    public schoolId: any;
    public studydetail: any;
    public renderStudyPlan : any;
    public subjectnamearr:any=[];
    public classlist:any=[];
    public class:any=[];
    public userClassSection:any;
    public classId:any;
    attacharr: any = [];
    public attachmentsarr:any=[];
    
  constructor(public navCtrl: NavController, public navParams: NavParams,private http: HttpClient,
   private myProvider: CommonProvider, private webIntent: WebIntent,
    private transfer: FileTransfer, private file: File,
      private document: DocumentViewer,public platform: Platform,
      private toastCtrl: ToastController) {
    
    this.domainUrl = this.myProvider.globalObj.constant.domainUrl;
  }

    ionViewDidLoad() {
      
        this.globalObj.userType = window.localStorage.getItem('userType');
        this.globalObj.sessionId = window.localStorage.getItem('sessionId');
        this.globalObj.schoolId = window.localStorage.getItem('schoolId');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.loginId = window.localStorage.getItem('loginId');
        this.globalObj.studentUserId = window.localStorage.getItem('studentUserId');
        this.serverUrl = this.myProvider.globalObj.constant.apiURL;
        
        const param = {
          "user_id": this.globalObj.loginId,
          "session_id": this.globalObj.sessionId,
          "token": this.globalObj.token,
          "type": this.globalObj.userType,
          "school_id": this.globalObj.schoolId
        };
        
        let userId = this.globalObj.loginId;
    
        if(this.globalObj.userType.toLowerCase() == 'parent'){
            userId = this.globalObj.studentUserId;
        }

        const params = {
            "user_id": userId,
            "session_id": this.globalObj.sessionId,
            "token": this.globalObj.token,
            "school_id": this.globalObj.schoolId
        };

        this.http.post(this.serverUrl + 'users/userdetail', param).subscribe(detail => {
            let data: any = detail;
            this.userClassSection = data.response.section_id;
            
            if(this.globalObj.userType.toLowerCase() == 'parent'){
                let childList = data.response.child_list;
                for(let k in childList){
                    if(childList[k].user_id == userId){
                        this.userClassSection = childList[k].section_id;
                    }
                }
            }


            this.http.post(this.serverUrl + "studyplans/studyplanlist", params).subscribe(details => {
                this.studydetail = details;

                this.renderStudyPlan = this.studydetail.response;
                let key;
                
                
                this.renderStudyPlan.forEach(object => {
                    key = Object.keys(object)[0];
                    object[key].forEach(obj => {
                        if(obj.sectionId==this.userClassSection){
                            this.attacharr.push(obj.attachments);
                        }
                    });
                    this.subjectnamearr.push({name: key, attacharr: this.attacharr});
                    this.attacharr = [];
                }); 
                
                for(let k in this.subjectnamearr){
                    if(this.subjectnamearr[k].attacharr.length!=0){
                        this.subjectarr.push({name: this.subjectnamearr[k].name, attacharr: this.subjectnamearr[k].attacharr, check: true});
                    }
                }
                
            });
        });
    
    }
  
    accodfunc(index){ 
        if(this.subjectarr[index].check){
            this.subjectarr[index].check = false;
        }else{
            this.subjectarr[index].check = true;
        }
        this.subjectarr = this.subjectarr;
    }
    
//    openURL(url){
//        window.open(url, "_system", "location=yes")
//    }
    
    downloadplan(urlPath){
        let path = null;
        if(this.platform.is('ios')){
                path = this.file.documentsDirectory;
            }else{
                path = this.file.dataDirectory;
            }
            
        const transfer = this.transfer.create();
        
        let k = urlPath.replace(/ /g,"%20");
        transfer.download(k, path + k).then((entry) => { 
        let url = decodeURIComponent(entry.toURL());
        url = url.replace(/ /g,"%20");
        this.document.viewDocument(url, 'application/pdf', {})
        });
    }
    
    presentToast(msg) {
    msg = (msg) ? msg: "some error" 
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 7000,
      position: 'middle'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }
  

}
