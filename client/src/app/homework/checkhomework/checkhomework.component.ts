import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-checkhomework',
  templateUrl: './checkhomework.component.html',
  styleUrls: ['./checkhomework.component.css']
})
export class CheckhomeworkComponent implements OnInit {
 public homeworkId : any;
   public detaildata : any;
   public id : any;
   public token: any;
    public userid : any;
   public studentName : any;
    public submitremark : any;
    public homedetail : any;
      public title:any;
   public subject:any;
   public clsSectionName:any;
   public targetdate:any;
   public studentdetail : any;
   public attachment : any;
   public content : any;
   public creationdate : any;
 
   public subexist : any;
   public remarksexist : any;
   public submitdate : any;
   public submitcontent : any;
   public submitattachment : any;
   public remarkcontent : any;
   public remarkdate : any;
   public imagespath : any;
   public teacherimage :any = '';
   public studentimage :any = '';
   public remarkhide : any;
   public serverurl :any = '';
   mylang:any=''; 

  constructor(private route: ActivatedRoute, private http: HttpClient, private myService:BackendApiService,private translate: TranslateService ) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
       this.token = window.localStorage.getItem('token');
       this.route.params.subscribe((data:any) => {
       this.homeworkId = data.homeId;
       this.userid = data.userId;
       this.studentName = data.name;
       this.serverurl = this.myService.commonUrl;
       
          }) 
 
   }
      public apiurldetails = 'homework/homeworksubmitandremarkdetail';
     
  ngOnInit() { 
      this.subexist = false;
      this.remarksexist = false;
      this.imagespath= this.myService.constant.imageslocalpath; 
     // this.userid = window.localStorage.getItem('user_id');
      // this.studentName = window.localStorage.getItem('stud_name');
    const param = {
            'user_id' : this.userid,
            'homework_id': this.homeworkId,
            'token': this.token
       };
     this.http.post(this.myService.constant.apiURL + this.apiurldetails, param).subscribe(details => {
      this.detaildata = details;
      this.studentimage = this.detaildata.response.student_image?this.myService.constant.domainName+this.detaildata.response.student_image:'assets/images/profile_img.jpg';
      this.homedetail  = this.detaildata.response.teacher_homework_detail;
      this.submitremark  = this.detaildata.response.submit_remark_detail;
      this.subject =  this.homedetail.subject_name;
      this.title =  this.homedetail.title;
      this.attachment = this.homedetail.attachments;
      this.creationdate = this.homedetail.creation_date;
      this.targetdate = this.homedetail.target_date;
      this.content = this.homedetail.content;
      this.teacherimage = this.homedetail.teacher_image?this.myService.constant.domainName+this.homedetail.teacher_image:'assets/images/profile_img.jpg';
      window.localStorage.setItem('title', this.title);
      window.localStorage.setItem('subject', this.subject);
                

        if(this.submitremark.submitted_date != undefined && this.submitremark.submitted_date != '')
         { 
            this.subexist = true;
            this.remarkhide = true;
             this.submitdate = this.submitremark.submitted_date;
              this.submitcontent = this.submitremark.submitted_content;
               this.submitattachment = this.submitremark.submitted_attachment;
         }

        if(this.submitremark.remark_date != undefined && this.submitremark.remark_date != ''  )
         { 
         this.remarksexist = true;
          this.remarkhide = false;
         this.remarkcontent= this.submitremark.remark_content;
         this.remarkdate= this.submitremark.remark_date;
         }
        
     });
  }

}
