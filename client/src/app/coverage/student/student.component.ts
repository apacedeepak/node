import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {
  public sessionid: any;
  public userid: any;
  public token: any;
  public serverurl: any;
  public schoolId: any;
  public studydetail: any;
  public renderTimetable : any;
  public subjectarr : any = [];
  public subjectnamearr:any=[];
  public classlist:any=[];
  public class:any=[];
  public userClassSection:any;
  public classId:any;
  attacharr: any = [];
  public userType:any='';
  public studentuser:any;
  public user_id:any;
  mylang:any='';

//    tempkey :any;
//  temparr :any;
//    tempobj:any;
  public attachmentsarr:any=[];
  constructor(private http: HttpClient, private myService: BackendApiService,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
         this.sessionid = window.localStorage.getItem('session_id');
         this.user_id = window.localStorage.getItem('user_id');
         this.studentuser=window.localStorage.getItem('student_user_id');
         this.token = window.localStorage.getItem('token');
         this.schoolId = window.localStorage.getItem('school_id');
         this.serverurl = this.myService.commonUrl;
        this.userType=window.localStorage.getItem('user_type');
        if(this.userType=="Parent"){
          this.userid=this.studentuser;
        }
        if(this.userType=="Student"){
          this.userid=this.user_id;
          
        }
        
         this.getassignedclass();
         this.getsection();
  }

  //  togledata(index){ alert(index);
  //           $(".accordion_body").hide();
  //           $('.accordion_head').removeClass('minussign');
  //           $(".aaa"+index).addClass('minussign');
  //           $(".bbb"+index).show();
  //   }



     toggling(count){ //alert('#dowing'+count)
        // $('#dowing'+count).slideToggle();
        $('#dowing'+count).show('slow');
        $('#pi'+count).css('display','none');
        $('#mi'+count).css('display','block');
    } 
    
    accodfunc(index){
      $(document).ready(function() {
        //$('.accordion_body').eq(0).show();
        //$('.accordion_head').eq(0).addClass('minussign');
        $(".accordion_head").click(function(){
        $(this).siblings(".accordion_body").hide();
        $(".accordion_head").removeClass('minussign');
        $(this).addClass('minussign');
        $(".accordion_body").hide();
        $(this).next(".accordion_body").show();        
         });
         $(".bbb"+index).toggle();
        });}
        getassignedclass() {

          const params = {
            "user_id": this.userid,
            "session_id": this.sessionid,
            "school_id": this.schoolId,
            "token": this.token
          };
          this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {
            this.classlist = details;
            if (this.classlist.response_status.status == '200') {
              this.class = this.classlist.response.assigned_classes;
             
              this.class.forEach(obj => {
              
              this.classId=obj.class_id;
          
              }); 
           
            }
          });
        }
        getsection(){
          const param = {
            "user_id":      this.userid,
            "session_id": this.sessionid,
            "token": this.token,
            "type": 'student',
            "school_id": this.schoolId
          };
          
          this.http.post(this.myService.constant.apiURL + 'users/userdetail', param).subscribe(detailss => {
              let data: any = detailss;
              this.userClassSection = data.response.section_id;
  
       
   
    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id": this.schoolId,
      "token": this.token
    };
    this.http.post(this.myService.constant.apiURL + "studyplans/studyplanlist", params).subscribe(details => {
         this.studydetail = details;
   
        
          this.renderTimetable = this.studydetail.response;
          let key;
         this.renderTimetable.forEach(object => {
         
          key = Object.keys(object)[0];
          object[key].forEach(obj => {
     
            if(obj.sectionId==this.userClassSection){

            this.attacharr.push(obj.attachments);
            }
          });
          // if(this.attacharr!=[]){
          this.subjectnamearr.push({name: key, attacharr: this.attacharr});
          this.attacharr = [];
          // }
        }); 
        this.subjectnamearr.forEach(element => {
          if(element.attacharr.length!=0){
            
            this.subjectarr.push({name: element.name, attacharr: element.attacharr});
          }
        });
      });
    
    });

  }
}
