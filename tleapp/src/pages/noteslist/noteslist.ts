import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';

/**
 * Generated class for the NoteslistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-noteslist',
  templateUrl: 'noteslist.html',
})
export class NoteslistPage {
    
    public globalObj: any = {};
    public notesList: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private myProvider: CommonProvider, private http: HttpClient) {
      this.globalObj.tabSelected = 'sent'
      this.globalObj.userType = window.localStorage.getItem('userType');
        this.globalObj.loginId = window.localStorage.getItem('loginId');
        this.globalObj.sessionId = window.localStorage.getItem('sessionId');
        this.globalObj.schoolId = window.localStorage.getItem('schoolId');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
        
        this.globalObj.inboxCount = 0;
        this.globalObj.sentCount = 0;
        this.globalObj.draftCount = 0;
        this.globalObj.placeholder = '';
        //this.getNotes('inbox')
        this.getNotes('draft')
  }

  ionViewDidLoad() {
    
    this.getNotes('sent')
    
  }
  
  getNotes(placeholder){
      
      this.notesList = [];
      let params = {
            "user_id":this.globalObj.loginId,
            "school_id":this.globalObj.schoolId,
            "placeholder":placeholder,
            "token":this.globalObj.token
        };
      
      this.http.post(this.globalObj.serverUrl+"user_notes/getusernotes", params).subscribe(res => {
            const data: any = res;
            this.notesList = data.response.notes;
            if(placeholder == 'inbox'){
                this.globalObj.inboxCount = this.notesList.length;
            }
            if(placeholder == 'sent'){
                this.globalObj.sentCount = this.notesList.length;
            }
            if(placeholder == 'draft'){
                this.globalObj.draftCount = this.notesList.length;
            }
            this.globalObj.placeholder = placeholder;
            
      });
  }
  
  notesDetails(notesId, placeholder){
      this.navCtrl.push('NotesdetailPage',{id:notesId, placeholder: placeholder});
  }
  
  createNotes(){
      this.navCtrl.push('CreatenotesPage');
  }

}
