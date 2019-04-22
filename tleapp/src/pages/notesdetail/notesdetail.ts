import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';

/**
 * Generated class for the NotesdetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notesdetail',
  templateUrl: 'notesdetail.html',
})
export class NotesdetailPage {
    
    public globalObj: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private myProvider: CommonProvider, private http: HttpClient) {
      
      this.globalObj.notesId = navParams.get('id');
      this.globalObj.placeholder = navParams.get('placeholder');
      
      this.globalObj.userType = window.localStorage.getItem('userType');
        this.globalObj.loginId = window.localStorage.getItem('loginId');
        this.globalObj.sessionId = window.localStorage.getItem('sessionId');
        this.globalObj.schoolId = window.localStorage.getItem('schoolId');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
        this.globalObj.downloadUrl = this.myProvider.globalObj.constant.domainUrl+"/";
  }

  ionViewDidLoad() {
      
      let params = {
            "notes_id":this.globalObj.notesId,
            "token":this.globalObj.token
        };
     this.http.post(this.globalObj.serverUrl+"notes/getnotesdetails", params).subscribe(res => {
            const data: any = res;
            let notesdetail = data.response.data;
            this.globalObj.notesTitle = notesdetail.notes_title;
            this.globalObj.author = notesdetail.author;
            this.globalObj.created_date = notesdetail.created_date;
            
            var nameArray = [];
            for(let i in notesdetail.users){
                nameArray.push(notesdetail.users[i].name)
            }
            this.globalObj.name = nameArray.join(', ');
            this.globalObj.notesText = notesdetail.notes_text;
            this.globalObj.attachmentCount = notesdetail.attachments.length;
            this.globalObj.attachments = notesdetail.attachments;
     });
  }
  
  sharedDraftNote(){
      this.navCtrl.push('CreatenotesPage', {place: 'draft',notesId:this.globalObj.notesId})
  }
  viewImage(item){
    
          let path = this.globalObj.downloadUrl+item;
          this.navCtrl.push('ImageviewerPage',{path:path});
    
}

}
