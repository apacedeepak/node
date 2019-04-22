import { Component,ViewChild,OnInit } from '@angular/core';
import { IonicPage, NavController,Nav, NavParams, Navbar, FabContainer, ModalController, PopoverController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CacheService } from 'ionic-cache';
import { CommonProvider } from '../../providers/common/common';
import { NotificationPage } from '../notification/notification';
import { MessagesearchPage } from '../messagesearch/messagesearch';
import { Observable } from 'rxjs/Observable';

/**
 * Generated class for the MessagelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messagelist',
  templateUrl: 'messagelist.html',
})
export class MessagelistPage implements OnInit {
    public fabButtonOpened: Boolean = false;
    public globalObj: any = {};
    public messageList: any = [];
    
    @ViewChild(Nav) nav: Nav;
    @ViewChild(Navbar) navBar: Navbar;
    
  constructor(public navCtrl: NavController, public navParams: NavParams,
      private http: HttpClient,private myProvider: CommonProvider,
      public modalCtrl: ModalController, public popCtrl: PopoverController) {
      
      this.globalObj.linkname = navParams.get('linkname');
      this.globalObj.messageType = navParams.get('messageType');
      
     
  }
  
//  ionViewWillEnter(){
//      alert("123");
//  }
  
  ionViewWillEnter() {
      this.globalObj.noticeCircular = [];
    
    if(this.globalObj.messageType == 'Sent'){
        this.globalObj.placeholder = "Sent";
    }else if(this.globalObj.messageType == "Draft"){
        this.globalObj.placeholder = "Draft";
    }else{
        this.globalObj.placeholder = "Inbox";
    }
    this.getCommunicationAll();

  }
  
  
  ngOnInit() {

   }
  
  openFabButton(){
      
        this.globalObj.fabFlag = false;
        this.fabButtonOpened=!this.fabButtonOpened;
//        this.fabButtonOpened=true;
        this.fabClose();
        
    }
    
    getMessageList(placeholder,place, fab: FabContainer){
       // console.log(fab);
        if(fab){
            fab.close();
        }
        this.globalObj.placeholder = placeholder;
        
        var searchIds = [];
        
        if(this.globalObj.receipentName.length > 0){
            for(let i in this.globalObj.receipentName){
                searchIds.push(this.globalObj.receipentName[i].user_id);
            }
        }
       
        const params = {
            "user_id":this.globalObj.loginId,
            "user_type":this.globalObj.userType,
            "place":placeholder,
            "search_id":searchIds,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token
        }; 
        
        
        if(this.globalObj.fromDate){
            params['from_date'] = this.globalObj.fromDate;
        }
        if(this.globalObj.toDate){
            params['to_date'] = this.globalObj.toDate;
        }
        if(this.globalObj.fromDate && !this.globalObj.toDate){
            params['to_date'] = this.globalObj.fromDate;
        }
       this.globalObj.messageExist = true;
        this.http.post(this.globalObj.serverUrl+"communication/communication", params).subscribe(res => {
            const data: any = res;
            this.globalObj.inboxCount = data.response.inboxUnreadCount;
            this.messageList = [];
            if(data.response_status.status == '200'){
                this.setMessageList('online',data,placeholder,place);
                
            }
            
        }, error => {
                      if(window.localStorage.getItem('messageList'))
                        {
                          
                          let responsedata: any  = JSON.parse(window.localStorage.getItem('messageList'));
                          this.setMessageList('offline',responsedata,placeholder,place);
                          
                        }
                        else
                          {
                      let errormsg = "Could not connect to server";
                      this.myProvider.toasterError(errormsg);
                          }
                    });
    }
    
    fabClose(){
//        (<HTMLInputElement> document.getElementById("fabbutton")).classList.add("fab-close-active");
//        (<HTMLInputElement> document.getElementById("fablist")).classList.add("fab-list-active")
    }
    
    redirectTo(fab: FabContainer){
        this.fabButtonOpened=true;
        fab.close();
//         (<HTMLInputElement> document.getElementById("fabbutton")).classList.remove("fab-close-active");
//        (<HTMLInputElement> document.getElementById("fablist")).classList.remove("fab-list-active")
        this.navCtrl.push('ComposePage');
    }
    
    messageDetails(messageId, placeHolder){
        if(placeHolder.toLowerCase()=='draft')
            {
                this.getDraftDetail(messageId);
            }
        else{
            this.navCtrl.push('MessagedetailsPage',{id:messageId, place:placeHolder});
        }
    }
    announceDetails(announceId, placeHolder){ 
        this.navCtrl.push('NoticeCircularDetailPage',{id:announceId, place:placeHolder});
    }
    setMessageList(mode,data,placeholder,place)
        {
            this.globalObj.placeholder = placeholder;
            let messageList = [];
                if(placeholder == "Inbox"){
                    messageList = data.response.inbox;
                }else if(placeholder == "Sent"){
                    messageList = data.response.sent;
                }else if(placeholder == 'Draft'){
                    messageList = data.response.draft;
                }else if(placeholder == 'Archived'){
                    messageList = data.response.archived;
                }
                if(messageList.length==0)
                        {
                            this.globalObj.messageExist = false;
                        }
                        
                var searchName = [];
                        
                for(let k in this.globalObj.receipentName){
                    searchName.push(this.globalObj.receipentName[k].name)
                }
                
                for(let key in messageList){
                    
                    let showMessDate = "";
                    let important = 'No';
                    if(messageList[key].message_isimportant == 'Yes'){
                       important = 'Yes';
                    }
                    
                    
                    
                    let name = messageList[key].display_name;
                    
                    if(placeholder == "Sent" || placeholder == 'Draft'){
                        name = messageList[key].display_name.toString();
                        if(searchName.length > 0){
                            var searchFlag = false;
                            
                            for(let k in searchName){
                                for(let i in messageList[key].display_name){
                                    if(messageList[key].display_name[i] == searchName[i]){
                                        searchFlag = true;
                                    }
                                }
                            }
                            if(searchFlag){
                                this.messageList.push({
                                attachment_count: messageList[key].attachment_count,
                                attachments: messageList[key].attachments,
                                display_name: name,
                                message_body: messageList[key].message_body,
                                message_date: messageList[key].message_date,
                                message_id: messageList[key].message_id,
                                message_searchdate: messageList[key].message_date,
                                message_isread: messageList[key].message_isread,
                                message_subject: messageList[key].message_subject,
                                message_isimportant: messageList[key].message_isimportant,
                                msge_important_flag: important,
                                place: placeholder,
                                displayTime: messageList[key].displayTime
                            });
                            }
                            
                        }else{
                            
                            this.messageList.push({
                                attachment_count: messageList[key].attachment_count,
                                attachments: messageList[key].attachments,
                                display_name: name,
                                message_body: messageList[key].message_body,
                                message_date: messageList[key].message_date,
                                message_id: messageList[key].message_id,
                                message_searchdate: messageList[key].message_date,
                                message_isread: messageList[key].message_isread,
                                message_subject: messageList[key].message_subject,
                                message_isimportant: messageList[key].message_isimportant,
                                msge_important_flag: important,
                                place: placeholder,
                                displayTime: messageList[key].displayTime
                            });
                        }
                     }else{
                        if(searchName.length > 0 && searchName.indexOf(name) != -1){
                            this.messageList.push({
                                attachment_count: messageList[key].attachment_count,
                                attachments: messageList[key].attachments,
                                display_name: name,
                                message_body: messageList[key].message_body,
                                message_date: messageList[key].message_date,
                                message_id: messageList[key].message_id,
                                message_searchdate: messageList[key].message_date,
                                message_isread: messageList[key].message_isread,
                                message_subject: messageList[key].message_subject,
                                message_isimportant: messageList[key].message_isimportant,
                                msge_important_flag: important,
                                place: placeholder,
                                displayTime: messageList[key].displayTime
                            });
                        }else
                            this.messageList.push({
                                attachment_count: messageList[key].attachment_count,
                                attachments: messageList[key].attachments,
                                display_name: name,
                                message_body: messageList[key].message_body,
                                message_date: messageList[key].message_date,
                                message_id: messageList[key].message_id,
                                message_searchdate: messageList[key].message_date,
                                message_isread: messageList[key].message_isread,
                                message_subject: messageList[key].message_subject,
                                message_isimportant: messageList[key].message_isimportant,
                                msge_important_flag: important,
                                place: placeholder,
                                displayTime: messageList[key].displayTime
                            });
                        }
                        
                    }
                
                this.fabButtonOpened=true;
                this.globalObj.fabFlag = true;
               
               if(place=='click')
                {
                 
//                    (<HTMLInputElement> document.getElementById("fabbutton")).classList.remove("fab-close-active");
//                    (<HTMLInputElement> document.getElementById("fablist")).classList.remove("fab-list-active");
//                    this.openFabButton();
//                    this.fabButtonOpened=true;
//                   this.globalObj.fabFlag = false;
//                    this.fabClose();
                }
        if(mode=='online')
                    {
                     window.localStorage.setItem('messageList',JSON.stringify(data));
                    }
        }
    doRefresh(event){
        this.getMessageList(this.globalObj.placeholder,'load',null);
        this.getAnnouncementList();
        event.complete();

}

getAnnouncementList()
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
            "user_type":this.globalObj.userType,
            "school_id":this.globalObj.schoolId,
            "token":this.globalObj.token
        }; 
       
        this.http.post(this.globalObj.serverUrl+"announcement_assign/assignedannouncments", params).subscribe(data => {
            let responsedata: any  = data;
              if(responsedata.response_status.status=='200')
                {
                 //this.setDashBoardData('online',responsedata);
                 if(responsedata.response.notice.length==0)
                    {
                        this.globalObj.noticeExist = false;
                    }
                    if(responsedata.response.circular.length==0)
                    {
                        this.globalObj.circularExist = false;
                    }
                 this.globalObj.notice = responsedata.response.notice;
                 this.globalObj.circular = responsedata.response.circular;
                 this.globalObj.noticeCircular = responsedata.response.noticeCircular;
                 this.globalObj.noticeCirCount = responsedata.response.allNotCirCount;
                }
        })

}

 getDraftDetail(messageId)
      {
         this.navCtrl.push('ComposePage',{place:'draft',messageId:messageId});
      }
      
    search(){
        let modal = this.popCtrl.create(MessagesearchPage,{},{cssClass: 'contact-popover', showBackdrop: false});
        modal.onDidDismiss(data => {
           this.globalObj.receipentName = data.receipent;
           this.globalObj.selectedType = data.selectedType;
           this.globalObj.fromDate = data.fromDate;
           this.globalObj.toDate = data.toDate;
           this.getMessageList(this.globalObj.placeholder,'load',null);
        });
        modal.present();
    }
    
    removeReceipient(userId)
    {

       for(let key in this.globalObj.receipentName){
              if(this.globalObj.receipentName[key].user_id == userId){
                  this.globalObj.receipentName.splice(key, 1);

              }
        }
        this.getMessageList(this.globalObj.placeholder,'load',null);
    }
    
    removeDate(){
        this.globalObj.fromDate = '';
        this.globalObj.toDate = '';
        this.getMessageList(this.globalObj.placeholder,'load',null);
    }
    siblingChange(){
                
        this.getCommunicationAll();
      }
    getCommunicationAll()
    {
        if(this.globalObj.linkname == 'notice'){
            this.globalObj.tabSelected = 'noticeCircular'
        }else{
            this.globalObj.tabSelected = 'message'
        }
        
            
          this.globalObj.messageExist = true;
          this.globalObj.noticeExist = true;
          this.globalObj.circularExist = true;
          this.globalObj.userType = window.localStorage.getItem('userType');
          this.globalObj.loginId = window.localStorage.getItem('loginId');
          this.globalObj.sessionId = window.localStorage.getItem('sessionId');
          this.globalObj.schoolId = window.localStorage.getItem('schoolId');
          this.globalObj.token = window.localStorage.getItem('token');
          this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
        //  this.globalObj.placeholder = "Inbox";
          this.globalObj.fabFlag = false;
          this.globalObj.inboxCount = 0;
          this.globalObj.noticeCirCount = 0;
         
         
         var today: any = new Date();
          var dd: any = today.getDate();
          var mm: any = today.getMonth()+1;
          var yyyy: any = today.getFullYear();
  
          if(dd<10) {
              dd = '0'+dd
          } 
  
          if(mm<10) {
              mm = '0'+mm
          } 
  
          this.globalObj.todayDate = yyyy + '-' + mm + '-' + dd;
          this.globalObj.receipentName = [];
          this.getMessageList(this.globalObj.placeholder,'load',null);
          this.getAnnouncementList();
    }

}
