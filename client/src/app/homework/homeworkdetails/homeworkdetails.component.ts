import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-homeworkdetails',
  templateUrl: './homeworkdetails.component.html',
  styleUrls: ['./homeworkdetails.component.css']
})
export class HomeworkdetailsComponent implements OnInit {
   public homeId : any;
   public studuserid : any;
   public classsec : any;
   public through : any;
   public studname : any;
   public detaildata : any;
   public id : any;
   public token: any;
   public params: any;
   public homedetail:any;
   public title:any;
   public subject:any;
   public clsSectionName:any;
   public targetdate:any;
   public response : any;
   public studentdetail : any;
   public teachername : any;
   public attachment : any;
   public content : any;
   public creationdate : any;
   public userid : any;
   public submitremark : any;
   public subexist : any;
   public remarksexist : any;
   public submitdate : any;
   public submitcontent : any;
   public submitattachment : any;
   public remarkcontent : any;
   public remarkdate : any;
   public studentName : any;
   public name : any;
   public replyhide : any;
   public allimages : any;
   public usertype : any = '';
   public flag : any = '';
   public calledfrom : any = '';
   public serverurl :any = '';
   public teacherimage :any = '';
   public studentimage :any = '';
   mylang:any=''; 

    // public showcalander: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private myService:BackendApiService,private translate: TranslateService ) { 
   this.token = window.localStorage.getItem('token');
   this.route.params.subscribe((data:any) => {
            this.homeId = data.id;
            this.calledfrom = data.calledfrom;
            this.studuserid = data.studuserid;
            this.through = data.through;
            this.studname = data.studname;
            this.classsec = data.classsec;
            
          });   
          this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
          this.serverurl = this.myService.commonUrl;
  }
    public apiurldetails = 'homework/homeworksubmitandremarkdetail';

  ngOnInit() {
    this.updatemodulenotification();
    this.subexist = false;
    this.remarksexist = false;
    this.replyhide = false;
    
         
    window.localStorage.setItem('flagfor', this.flag);

    this.usertype = window.localStorage.getItem('user_type');
    if(this.usertype == 'Parent'){ 
        this.userid = window.localStorage.getItem('student_user_id');
        // this.replyhide = false;
    }else{ 
        this.userid = window.localStorage.getItem('user_id');
    }
     this.studentName = window.localStorage.getItem('stud_name');
     
     if(this.through == "classrecord"){
         this.userid = this.studuserid;
         this.studentName = this.studname;
     }
    const param = {
            'user_id' : this.userid,
            'homework_id': this.homeId,
            'token': this.token
       };
      this.http.post(this.myService.constant.apiURL + this.apiurldetails, param).subscribe(details => {
      this.detaildata = details;
      this.studentimage = this.detaildata.response.student_image?this.myService.constant.domainName+this.detaildata.response.student_image:'assets/images/profile_img.jpg';
      this.name = this.detaildata.response.student_name;
      this.homedetail  = this.detaildata.response.teacher_homework_detail;
      this.submitremark  = this.detaildata.response.submit_remark_detail;
      this.subject =  this.homedetail.subject_name;
      this.title =  this.homedetail.title;
      this.attachment = this.homedetail.attachments;
      this.creationdate = this.homedetail.creation_date;
      this.targetdate = this.homedetail.target_date;
      this.content = this.homedetail.content;
      this.teachername = this.homedetail.teacher_name;
      this.teacherimage = this.homedetail.teacher_image?this.myService.constant.domainName+this.homedetail.teacher_image:'assets/images/profile_img.jpg';



       if(this.submitremark.submitted_date != undefined && this.submitremark.submitted_date != '')
         { 
            this.subexist = true;
            this.replyhide = true;
             this.submitdate = this.submitremark.submitted_date;
              this.submitcontent = this.submitremark.submitted_content;
               this.submitattachment = this.submitremark.submitted_attachment;
         }
          if(this.submitremark.remark_date != undefined && this.submitremark.remark_date != '' )
         { 
         this.replyhide = true;
         this.remarksexist = true;
         this.remarkcontent= this.submitremark.remark_content;
         this.remarkdate= this.submitremark.remark_date;
         }
        if(this.usertype == 'Parent'){
         this.replyhide = true;
        }
    

        });
      };
      updatemodulenotification()
  {
    const param = {
            'user_id' : window.localStorage.getItem('user_id'),
            'type': [4],
            'token': this.token
       };
    this.http.post(this.myService.constant.apiURL + 'notification/updatemodulenotification', param).subscribe(details => {
    });
  }

}
