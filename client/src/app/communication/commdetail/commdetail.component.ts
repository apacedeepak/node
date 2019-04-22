import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { saveAs } from 'file-saver';
import 'rxjs/Rx' ;
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-commdetail',
  templateUrl: './commdetail.component.html',
  styleUrls: ['./commdetail.component.css']
})
export class CommdetailComponent implements OnInit {

    public globalObj: any = {};
    public user_id : any ;
    public token : any ;
    mylang:any=''; 
  constructor(private myService: BackendApiService, private http: HttpClient,
  private activatedRoute: ActivatedRoute, private router: Router,private translate: TranslateService) {
    this.activatedRoute.queryParams.subscribe(params => {
        this.globalObj.message_id = params['messageId'];
        this.globalObj.place = params['place'];
    });
    this.token = window.localStorage.getItem('token');
    this.user_id = window.localStorage.getItem('user_id');
    this.mylang= window.localStorage.getItem('language');
   
      if(this.mylang){
       translate.setDefaultLang( this.mylang);}
       else{
         translate.setDefaultLang( 'en');
       }
  }

  ngOnInit() {
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    this.globalObj.user_type = window.localStorage.getItem('user_type');
    this.globalObj.student_user_id = window.localStorage.getItem('student_user_id');
    this.globalObj.product_type = window.localStorage.getItem('product_type');
    this.globalObj.token = window.localStorage.getItem('token');
      if(this.globalObj.place == 'Notice')
        {
     const param = {
            'user_id' : this.user_id,
            'type': [2],
            'token': this.token,
            "user_type": this.globalObj.user_type
       };
          this.updatemodulenotification(param);
        }
      else  if(this.globalObj.place == 'Circular')
        {
     const param = {
            'user_id' : this.user_id,
            'type': [3],
            'token': this.token,
            "user_type": this.globalObj.user_type
       };
          this.updatemodulenotification(param);
        }
      else

        {
     const param = {
            'user_id' : this.user_id,
            'type': [1],
            'token': this.token
       };
          this.updatemodulenotification(param);
        }
    this.globalObj.user_id = window.localStorage.getItem('user_id');
    this.globalObj.user_type = window.localStorage.getItem('user_type');
    this.globalObj.domainName = this.myService.constant.domainName;
    this.globalObj.domainName1 = this.myService.commonUrl1;
    this.globalObj.projectName = this.myService.constant.PROJECT_NAME;

    if(this.globalObj.place == 'Notice' || this.globalObj.place == 'Circular'){
        let params = {
            user_id: '',
            school_id: '',
            user_type:'',
            token:'',
            type:'',
            announce_id:''
        };
        if(this.globalObj.user_type.toLowerCase() == "parent"){
            
                params.user_id = this.globalObj.student_user_id;
                params.school_id = this.globalObj.school_id;
                params.user_type = "Parent";
                params.token= this.token;
                params.type=this.globalObj.place;
                params.announce_id=this.globalObj.message_id;
           
        }else{
            params.user_id = this.globalObj.user_id;
            params.school_id = this.globalObj.school_id;
            params.user_type = this.globalObj.user_type;
            params.token= this.token;
            params.type=this.globalObj.place;
            params.announce_id=this.globalObj.message_id;
        }

      
    this.http.post(this.myService.constant.apiURL+"announcement_assign/assignedannouncments", params).subscribe(data => {
          const details: any = data;
          if(this.globalObj.place == 'Notice'){
            this.globalObj.displayHeader = 'Notice';
            const not = details.response.notice;
            this.globalObj.display_name = 'Notice';
            this.globalObj.description = not[0].description;
            this.globalObj.start_date = not[0].start_date;
            this.globalObj.title = not[0].title;
            this.globalObj.attachments = not[0].attachments;
          }else{
            this.globalObj.displayHeader = "Circular";
            const circular = details.response.circular;
            this.globalObj.display_name = 'Circular';
            this.globalObj.description = circular[0].description;
            this.globalObj.start_date = circular[0].start_date;
            this.globalObj.title = circular[0].title;
            this.globalObj.attachments = circular[0].attachments;
          }
          console.log(details)
     });

    }else if(this.globalObj.place == 'Draft'){
     // this.router.navigate(["/communication/compose", {mesgeId: this.globalObj.message_id, flag: "Draft"}]);

    }else{

    const params = {
      user_id: this.globalObj.user_id,
      user_type: this.globalObj.user_type,
      place: this.globalObj.place,
      message_id: this.globalObj.message_id,
      search_id: [],
      token: this.token
    };
    if(this.globalObj.user_type.toLowerCase() == 'parent'){
            params['student_user_id'] = this.globalObj.student_user_id
    }

    this.http.post(this.myService.constant.apiURL+"communication/communication", params).subscribe(data => {
          const details: any = data;
          let showdata = details.response.sent[0];
          
          if(this.globalObj.place.toLowerCase() == "inbox"){
            showdata = details.response.inbox[0];
            this.globalObj.countReceipent = 1;
            this.globalObj.displayHeader = "Inbox Message";
          }else if(this.globalObj.place.toLowerCase() == "sent"){
            showdata = details.response.sent[0];
            this.globalObj.countReceipent = showdata.display_name.length;
            this.globalObj.displayHeader = "Sent Message";
          }else if(this.globalObj.place.toLowerCase() == "draft"){
            showdata = details.response.draft[0];
            this.globalObj.countReceipent = showdata.display_name.length;
            this.globalObj.displayHeader = "Draft Message";
          }else if(this.globalObj.place.toLowerCase() == "archived"){
            showdata = details.response.archived[0];
            this.globalObj.countReceipent = 1;
            this.globalObj.displayHeader = this.translate.instant("Archived Message");
          }

          this.globalObj.attachments = showdata.attachments;
          this.globalObj.display_name = showdata.display_name.toString();
          this.globalObj.message_body = showdata.message_body;
          this.globalObj.message_date = showdata.message_date;
          this.globalObj.message_subject = showdata.message_subject;
          this.globalObj.message_id = showdata.message_id;
          this.globalObj.message_isimportant = showdata.message_isimportant;
          this.globalObj.images = showdata.images;
          this.globalObj.imagePrefix = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME+ '/';
    });
    }
  }

  markasimp(){
    let param = {
      user_id: this.globalObj.user_id,
      message_id: this.globalObj.message_id,
      isImportant: 'Yes',
      token: this.token
    };
    if(this.globalObj.message_isimportant == "Yes"){
            param.isImportant = "No";
    }

     this.http.post(this.myService.constant.apiURL+"message_recipients/markasimportant", param).subscribe(data => {
          const details: any = data;
          if(this.globalObj.message_isimportant == "Yes"){
            this.globalObj.message_isimportant = "No";
          }else{
              this.globalObj.message_isimportant= "Yes";
          }
     });
  }

  downloadall(attachments){
      let param = 
      {
        "filename": "test",
        "file_paths": attachments,
        "token": this.globalObj.token
        }
        
        
        this.http.post(this.myService.constant.apiURL + 'common/generatezip', param).subscribe(details => {
            const detail: any = details;
            
//            var blob = new Blob([detail.response], {type: 'application/zip'});
//            var url= window.URL.createObjectURL(blob);
//            window.open(url);
           //  window.open(detail.response, '_self', '');
//            console.log(detail)
        });
      // var downloadPath = this.myService.constant.domainName+'schoolerp/erpapi/index/filedown/mesgid/'+this.globalObj.message_id+'/flag/apicomm';
       
  }
  
  
      updatemodulenotification(param)
  {

    this.http.post(this.myService.constant.apiURL + 'notification/updatemodulenotification', param).subscribe(details => {
    });
  }
}
