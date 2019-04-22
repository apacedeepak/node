import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-outermenu',
  templateUrl: './outermenu.component.html',
  styleUrls: ['./outermenu.component.css']
})
export class OutermenuComponent implements OnInit {

  public globalObj: any = {};
  public allMessageList: any = [];
  public callfrom1: any = '';
  public flag: any;
  public search: any;
  public announcement:any = [];
  public val:any ;
  noticemesageFlage:boolean=false;
  circularmesageFlage:boolean=false;
  noticeflag:boolean=false;
  cicrularflag:boolean=false;
  mylang:any=''; 

  constructor(private myService: BackendApiService, private http: HttpClient,
  private activatedRoute: ActivatedRoute, private router: Router,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
      if(this.mylang){
       translate.setDefaultLang( this.mylang);}
       else{
         translate.setDefaultLang( 'en');
       }
      this.callfrom1 = window.localStorage.getItem('callfrom1');
      this.globalObj.token = window.localStorage.getItem('token');
      this.globalObj.school_id = window.localStorage.getItem('school_id');
            //alert(this.callfrom1);
            localStorage.removeItem('callfrom1');
            if(this.callfrom1=='dashboard')
             this.callfrom1 = true;
            else
              this.callfrom1 = false;

            this.activatedRoute.queryParams.subscribe(params => {
        this.globalObj.place = params['place'];


    });
   }

  ngOnInit() {

    this.globalObj.user_id = window.localStorage.getItem('user_id');
    this.globalObj.user_type = window.localStorage.getItem('user_type');
    this.globalObj.student_user_id = window.localStorage.getItem('student_user_id');
    
    this.globalObj.placeholder == "Inbox"

     //alert(his.globalObj.place)
        if(this.globalObj.place == "Sent"){
          $('#sent').addClass('active');
          $('#inboxing').removeClass('active');
          $('#draft').removeClass('active');
          $('#archive').removeClass('active');
          this.messagelist(this.globalObj.place);
        }else if(this.globalObj.place == 'Archived') {
          $('#archive').addClass('active');
          $('#sent').removeClass('active');
          $('#inboxing').removeClass('active');
          $('#draft').removeClass('active');
          this.messagelist(this.globalObj.place);
        }else if(this.globalObj.place == 'Notice') {
          $('#not a').addClass('active');
          $('#cir a').removeClass('active');
          $('#mess a').removeClass('active');
          $('#notice').addClass('active');
          $('#notice').removeClass('fade');
          $('#message').removeClass('active');
          $('#circular').removeClass('active');
          this.announcementtype(this.globalObj.place);
        }else if(this.globalObj.place == 'Circular') {
          this.announcementtype(this.globalObj.place);
          $('#not a').removeClass('active');
          $('#mess a').removeClass('active');
          $('#cir a').addClass('active');
           $('#circular').addClass('active');
           $('#circular').removeClass('fade');
          $('#message').removeClass('active');
          $('#notice').removeClass('active');

        }else if(this.globalObj.place == 'draft') {
          this.messagelist("Draft");
          $('#not a').removeClass('active');
          $('#mess a').removeClass('active');
          $('#cir a').removeClass('active');
           $('#circular').removeClass('active');
           $('#circular').removeClass('fade');
          $('#message').addClass('active');
          $('#notice').removeClass('active');
          $('#draft').addClass('active');

        }else{
          $('#mess a').addClass('active');
          $('#not a').removeClass('active');
          $('#cir a').removeClass('active');
          $('#inboxing').addClass('active');
          $('#sent').removeClass('active');
          $('#draft').removeClass('active');
          $('#archive').removeClass('active');
           $('#message').addClass('active');
          $('#notice').removeClass('active');
          $('#circular').removeClass('active');
          this.messagelist("Inbox");
        }


    
    const params = {
      user_id: this.globalObj.user_id,
      user_type: this.globalObj.user_type,
      search_id: [],
      school_id: this.globalObj.school_id,
      token: this.globalObj.token,
      place: 'Inbox'
    };
    
    
    this.globalObj.countInbox = 0;
    this.globalObj.noticeCount = 0;
    this.globalObj.circularCount = 0;
    let countsMess = 0; 
//     this.http.post(this.myService.constant.apiURL+"communication/communication", params).subscribe(data => {
//          const details: any = data;
//          const inboxData = details.response.inbox;
//          this.globalObj.countInbox = 0;
//          //this.allMessageList = [];
//          for(let key in inboxData){
//            let important = 'No';
//              if(inboxData[key].message_isimportant == 'Yes'){
//                 important = 'Yes';
//              }
//              if(inboxData[key].message_isread != 'Yes'){
//                countsMess++;
//              }
//
//          }
//         // this.globalObj.countInbox = countsMess;
//    });
    
    let param = {
        user_id: '',
        school_id: '',
        user_type:'',
        token:''
    };
    
    if(this.globalObj.user_type.toLowerCase() == "parent"){
        param.user_id = this.globalObj.student_user_id;
        param.school_id = this.globalObj.school_id;
        param.user_type = "Parent";
        param.token = this.globalObj.token;
        
    }else{
        param.user_id = this.globalObj.user_id;
        param.school_id = this.globalObj.school_id;
        param.user_type = this.globalObj.user_type;
        param.token = this.globalObj.token;
    }

   
    this.http.post(this.myService.constant.apiURL+"announcement_assign/assignedannouncments", param).subscribe(data => {
          const details: any = data;
          this.globalObj.noticeCount = details.response.noticeCount;
          this.globalObj.circularCount = details.response.circularCount;

     });


  }

  announcementtype(type){
  
    this.announcement = [];
    this.noticemesageFlage=false;
    this.circularmesageFlage=false;
    this.cicrularflag=false;
    this.noticeflag=false;
      let params = {
          user_id: '',
          school_id: '',
          user_type:'',
          token:'',
          type:''
      };
    
    if(this.globalObj.user_type.toLowerCase() == "parent"){
        params.user_id = this.globalObj.student_user_id;
        params.school_id = this.globalObj.school_id;
        params.user_type = "Parent";
        params.token = this.globalObj.token;
        params.type = type;
        
    }else{
        params.user_id = this.globalObj.user_id;
        params.school_id = this.globalObj.school_id;
        params.user_type = this.globalObj.user_type;
        params.token = this.globalObj.token;
        params.type = type;
    }
    
    this.http.post(this.myService.constant.apiURL+"announcement_assign/assignedannouncments", params).subscribe(data => {
          const details: any = data;
        
          if(type == 'Notice'){
            this.noticeflag=true;
            this.announcement = details.response.notice;
        //  console.log(this.announcement);
            if(this.announcement.length=="0"){
              this.noticemesageFlage=true;
            }
            this.globalObj.noticeCount = details.response.noticeCount;
          }else{
            this.announcement = details.response.circular;
            this.cicrularflag=true;
            this.globalObj.circularCount = details.response.circularCount;
            // console.log(this.announcement);
            if(this.announcement.length=="0"){
              this.circularmesageFlage=true;
            }
          }
          
     });
  }

  messagelist(placeholder){
    this.allMessageList = [];
    this.globalObj.message = "";
    //this.globalObj.countInbox = 0;
    this.globalObj.placeholder = placeholder;
    if(placeholder == "Inbox"){
      $('#inboxing').addClass('active');
      $('#sent').removeClass('active');
      $('#draft').removeClass('active');
      $('#archive').removeClass('active');
      
    }else if(placeholder == "Sent"){
      $('#sent').addClass('active');
      $('#inboxing').removeClass('active');
      $('#draft').removeClass('active');
      $('#archive').removeClass('active');
    }else if(placeholder == 'Draft'){
      $('#draft').addClass('active');
      $('#sent').removeClass('active');
      $('#inboxing').removeClass('active');
      $('#archive').removeClass('active');
    }else if(placeholder == 'Archived'){
      $('#archive').addClass('active');
      $('#sent').removeClass('active');
      $('#inboxing').removeClass('active');
      $('#draft').removeClass('active');
    }
    
    
    
    if(this.val && (this.val.name.length > 0 || this.val.date.length > 0)){
        this.filterData(this.val);
        return;
    }

    const params = {
      user_id: this.globalObj.user_id,
      user_type: this.globalObj.user_type,
      place: placeholder,
      search_id: [],
      school_id: this.globalObj.school_id,
      token: this.globalObj.token
    };
        if(this.globalObj.user_type.toLowerCase() == 'parent'){
            params['student_user_id'] = this.globalObj.student_user_id
        }

     this.http.post(this.myService.constant.apiURL+"communication/communication", params).subscribe(data => {
          const details: any = data;
          let inboxData: any = '';
          
          
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

            today = yyyy + '-' + mm + '-' + dd;
             
          
          const inboxDataCount = details.response.inbox;
          
          //this.allMessageList = [];
          
          
          
         // this.allMessageList = [];
          if(placeholder == "Inbox"){
            inboxData = details.response.inbox;
            this.globalObj.countInbox = 0;
            for(let key in inboxDataCount){
                
              if(inboxDataCount[key].message_isread != 'Yes'){
                this.globalObj.countInbox = this.globalObj.countInbox + 1;
              }

            }
          }else if(placeholder == "Sent"){
            inboxData = details.response.sent;
          }else if(placeholder == 'Draft'){
              inboxData = details.response.draft;
           }else if(placeholder == 'Archived'){
              inboxData = details.response.archived;
           }

           
          for(let key in inboxData){
             
             var showMessDate = "";  
            
            let important = 'No';
              if(inboxData[key].message_isimportant == 'Yes'){
                 important = 'Yes';
              }
            let name = inboxData[key].display_name;
            if(placeholder == "Sent"){
              name = inboxData[key].display_name.toString();
            }else if(placeholder == 'Draft'){
               name = inboxData[key].display_name.toString();
            }
            
            if(today == inboxData[key].message_onlydate){
                showMessDate = inboxData[key].message_time;
            }else{
                showMessDate = inboxData[key].message_onlydate;
            }
            this.allMessageList.push({
                attachment_count: inboxData[key].attachment_count,
                attachments: inboxData[key].attachments,
                display_name: name,
                message_body: inboxData[key].message_body,
                message_date: showMessDate,
                message_id: inboxData[key].message_id,
                message_searchdate: inboxData[key].message_onlydate,
                message_isread: inboxData[key].message_isread,
                message_subject: inboxData[key].message_subject,
                message_isimportant: inboxData[key].message_isimportant,
                msge_important_flag: important,
                place: placeholder
              });
              
          }
          if(this.allMessageList.length == 0){
              this.globalObj.message = "no_record_found"
          }
    });
  }

   countChangedHandler() {
    this.globalObj.message = "";
     this.allMessageList = [];
     const params = {
      user_id: this.globalObj.user_id,
      user_type: this.globalObj.user_type,
      search_id: [],
      school_id: this.globalObj.school_id,
      token: this.globalObj.token
     // place: 'Inbox'
    };
    if(this.globalObj.user_type.toLowerCase() == 'parent'){
            params['student_user_id'] = this.globalObj.student_user_id
    }

     this.http.post(this.myService.constant.apiURL+"communication/communication", params).subscribe(data => {
          const details: any = data;
          let inboxData = details.response.inbox;
          this.globalObj.countInbox = 0;
          if(this.globalObj.placeholder == "Inbox"){
            inboxData = details.response.inbox;
          }else if(this.globalObj.placeholder == "Sent"){
            inboxData = details.response.sent;
          }else if(this.globalObj.placeholder == 'Draft'){
              inboxData = details.response.draft;
           }else if(this.globalObj.placeholder == 'Archived'){
              inboxData = details.response.archived;
           }
           
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

            today = yyyy + '-' + mm + '-' + dd;

          for(let key in inboxData){
          var showMessDate = "";
            let important = 'No';
              if(inboxData[key].message_isimportant == 'Yes'){
                 important = 'Yes';
              }
              if(inboxData[key].message_isread != 'Yes'){
                this.globalObj.countInbox = this.globalObj.countInbox + 1;
              }
              
              let name = inboxData[key].display_name;
                if(this.globalObj.placeholder == "Sent"){
                  name = inboxData[key].display_name.toString();
                }else if(this.globalObj.placeholder == 'Draft'){
                   name = inboxData[key].display_name.toString();
                }
                
                if(today == inboxData[key].message_onlydate){
                    showMessDate = inboxData[key].message_time;
                }else{
                    showMessDate = inboxData[key].message_onlydate;
                }
                
              this.allMessageList.push({
                attachment_count: inboxData[key].attachment_count,
                attachments: inboxData[key].attachments,
                display_name: name,
                message_body: inboxData[key].message_body,
                message_date: showMessDate,
                message_id: inboxData[key].message_id,
                message_searchdate: inboxData[key].message_onlydate,
                message_isread: inboxData[key].message_isread,
                message_subject: inboxData[key].message_subject,
                message_isimportant: inboxData[key].message_isimportant,
                msge_important_flag: important,
                place: this.globalObj.placeholder
              });

          }
          if(this.allMessageList.length == 0){
              this.globalObj.message = "no_record_found"
          }
    });
  }

  filterData(val){
      
      this.val = val;
    this.globalObj.message = "";
   
    
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

    today = yyyy + '-' + mm + '-' + dd;
    
    
      if(val.name.length > 0 || val.date.length > 0){ 
       this.allMessageList = [];
     const params = {
      user_id: this.globalObj.user_id,
      user_type: this.globalObj.user_type,
      search_id: [],
      school_id: this.globalObj.school_id,
      token: this.globalObj.token
     // place: 'Inbox'
    };
    
    if(this.globalObj.user_type.toLowerCase() == 'parent'){
            params['student_user_id'] = this.globalObj.student_user_id
        }

     this.http.post(this.myService.constant.apiURL+"communication/communication", params).subscribe(data => {
          const details: any = data;
          let inboxData: any = '';
          if(this.globalObj.placeholder == "Inbox"){
            inboxData = details.response.inbox;
          }else if(this.globalObj.placeholder == "Sent"){
            inboxData = details.response.sent;
          }else if(this.globalObj.placeholder == 'Draft'){
              inboxData = details.response.draft;
           }else if(this.globalObj.placeholder == 'Archived'){
              inboxData = details.response.archived;
           }
           
           
           
          var datas = val.name;
          this.allMessageList = [];
          if(val.name.length > 0 && val.date.length == 0){
            for(let ind in datas){

            for(let key in inboxData){
              var showMessDate = "";
              if(datas[ind].user_id == inboxData[key].display_id){
              let important = 'No';
                if(inboxData[key].message_isimportant == 'Yes'){
                   important = 'Yes';
                }
              
                let name = inboxData[key].display_name;
                if(this.globalObj.placeholder == "Sent"){
                  name = inboxData[key].display_name.toString();
                }else if(this.globalObj.placeholder == 'Draft'){
                   name = inboxData[key].display_name.toString();
                }
                
                if(today == inboxData[key].message_onlydate){
                    showMessDate = inboxData[key].message_time;
                }else{
                    showMessDate = inboxData[key].message_onlydate;
                }

                this.allMessageList.push({
                  attachment_count: inboxData[key].attachment_count,
                  attachments: inboxData[key].attachments,
                  display_name: name,
                  message_body: inboxData[key].message_body,
                  message_date: showMessDate,
                  message_id: inboxData[key].message_id,
                  message_isread: inboxData[key].message_isread,
                  message_subject: inboxData[key].message_subject,
                  message_isimportant: inboxData[key].message_isimportant,
                  msge_important_flag: important,
                  place: this.globalObj.placeholder
                });
            }
              }
              if(this.allMessageList.length == 0){
                this.globalObj.message = "no_record_found"
            }
            }
        }else if(val.date.length > 0 && val.name.length == 0){
        
            for(let key in inboxData){
                var showMessDate = "";
             
               // console.log(val.date[0].todate)
              if(inboxData[key].message_onlydate >= val.date[0].fromdate && inboxData[key].message_onlydate <= val.date[0].todate){
                 
              let important = 'No';
                if(inboxData[key].message_isimportant == 'Yes'){
                   important = 'Yes';
                }
                let name = inboxData[key].display_name;
                if(this.globalObj.placeholder == "Sent"){
                  name = inboxData[key].display_name.toString();
                }else if(this.globalObj.placeholder == 'Draft'){
                   name = inboxData[key].display_name.toString();
                }
                if(today == inboxData[key].message_onlydate){
                    showMessDate = inboxData[key].message_time;
                }else{
                    showMessDate = inboxData[key].message_onlydate;
                }
                
                this.allMessageList.push({
                  attachment_count: inboxData[key].attachment_count,
                  attachments: inboxData[key].attachments,
                  display_name: name,
                  message_body: inboxData[key].message_body,
                  message_date: showMessDate,
                  message_searchdate: inboxData[key].message_onlydate,
                  message_id: inboxData[key].message_id,
                  message_isread: inboxData[key].message_isread,
                  message_subject: inboxData[key].message_subject,
                  message_isimportant: inboxData[key].message_isimportant,
                  msge_important_flag: important,
                  place: this.globalObj.placeholder
                });
               
            }
              }
              if(this.allMessageList.length == 0){
                this.globalObj.message = "no_record_found"
            }
           
        }else if(val.date.length > 0 && val.name.length > 0){
            for(let ind in datas){

            for(let key in inboxData){
            
                var showMessDate = "";
              
              if(datas[ind].user_id == inboxData[key].display_id && inboxData[key].message_onlydate >= val.date[0].fromdate && inboxData[key].message_onlydate <= val.date[0].todate){
              let important = 'No';
                if(inboxData[key].message_isimportant == 'Yes'){
                   important = 'Yes';
                }
                let name = inboxData[key].display_name;
                if(this.globalObj.placeholder == "Sent"){
                  name = inboxData[key].display_name.toString();
                }else if(this.globalObj.placeholder == 'Draft'){
                   name = inboxData[key].display_name.toString();
                }
                
                if(today == inboxData[key].message_onlydate){
                    showMessDate = inboxData[key].message_time;
                }else{
                    showMessDate = inboxData[key].message_onlydate;
                }

                this.allMessageList.push({
                  attachment_count: inboxData[key].attachment_count,
                  attachments: inboxData[key].attachments,
                  display_name: name,
                  message_body: inboxData[key].message_body,
                  message_date: showMessDate,
                  message_searchdate: inboxData[key].message_onlydate,
                  message_id: inboxData[key].message_id,
                  message_isread: inboxData[key].message_isread,
                  message_subject: inboxData[key].message_subject,
                  message_isimportant: inboxData[key].message_isimportant,
                  msge_important_flag: important,
                  place: this.globalObj.placeholder
                });
            }
              }
              if(this.allMessageList.length == 0){
                this.globalObj.message = "no_record_found"
            }
            }
        }
    });
      }else{
        this.allMessageList = [];
     const params = {
      user_id: this.globalObj.user_id,
      user_type: this.globalObj.user_type,
      search_id: [],
      school_id: this.globalObj.school_id,
      token: this.globalObj.token
     // place: 'Inbox'
    };
    
    if(this.globalObj.user_type.toLowerCase() == 'parent'){
            params['student_user_id'] = this.globalObj.student_user_id
        }

     this.http.post(this.myService.constant.apiURL+"communication/communication", params).subscribe(data => {
          const details: any = data;
          let inboxData = details.response.inbox;
          
          if(this.globalObj.placeholder == "Inbox"){
            inboxData = details.response.inbox;
          }else if(this.globalObj.placeholder == "Sent"){
            inboxData = details.response.sent;
          }else if(this.globalObj.placeholder == 'Draft'){
              inboxData = details.response.draft;
           }else if(this.globalObj.placeholder == 'Archived'){
              inboxData = details.response.archived;
           }

          for(let key in inboxData){
          
            var showMessDate = "";
            let important = 'No';
              if(inboxData[key].message_isimportant == 'Yes'){
                 important = 'Yes';
              }
              let name = inboxData[key].display_name;
                if(this.globalObj.placeholder == "Sent"){
                  name = inboxData[key].display_name.toString();
                }else if(this.globalObj.placeholder == 'Draft'){
                   name = inboxData[key].display_name.toString();
                }
                
                if(today == inboxData[key].message_onlydate){
                    showMessDate = inboxData[key].message_time;
                }else{
                    showMessDate = inboxData[key].message_onlydate;
                } 
              this.allMessageList.push({
                attachment_count: inboxData[key].attachment_count,
                attachments: inboxData[key].attachments,
                display_name: name,
                message_body: inboxData[key].message_body,
                message_date: showMessDate,
                message_id: inboxData[key].message_id,
                message_searchdate: inboxData[key].message_onlydate,
                message_isread: inboxData[key].message_isread,
                message_subject: inboxData[key].message_subject,
                message_isimportant: inboxData[key].message_isimportant,
                msge_important_flag: important,
                place: this.globalObj.placeholder
              });

          }
          if(this.allMessageList.length == 0){
              this.globalObj.message = "no_record_found"
          }
    });
      }
  }
  

  activeannouncment(){
    console.log("hell")

    this.noticemesageFlage=false;
    this.circularmesageFlage=false;
    this.cicrularflag=false;
    this.noticeflag=false;


  }

}
