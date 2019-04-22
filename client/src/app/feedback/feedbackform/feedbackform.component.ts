import { Component, OnInit, AfterContentInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
// import { Router } from '@angular/router'; 
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-feedbackform',
  templateUrl: './feedbackform.component.html',
  styleUrls: ['./feedbackform.component.css']
})
export class FeedbackformComponent implements OnInit ,AfterContentInit{
  myForm: FormGroup;
  keyofsubject: any = '';
  conceptdelery: any = '';
  doubtsolving: any = '';
  posttest: any = '';
  topiccoverrage: any = '';
  classdiscipline: any = '';
  commskills: any = '';
  motivationalskills: any = '';
  boardcoverrage: any = '';
  coursequality: any = '';
  classroom: any = '';
  staff: any = '';
  transportation: any = '';
  washroom: any = '';
  others: any = '';
  faculty_user_id: any;
  student_user_id: any;
  subjectName: any;
  subjectId: any;
  success: boolean = false;
  responseMessage: boolean = false;
  resMessage: boolean = false;
  popmsg: boolean = false;
  popmessage: any;
  apiurl: any = 'http://test.emscc.extramarks.com/admin/';
  firstflag: boolean = true;
  secondflag: boolean = false;
  thirdflag: boolean = false;
  flagpopup: any = '';
  public popmessagegrp: any = '';
  public responseMessagegrpexit: boolean = false;
  mylang:any='';
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }
  constructor(private location: Location,private myService: BackendApiService,private route: ActivatedRoute, private http: HttpClient, private formBuilder: FormBuilder,private translate: TranslateService) {

  this.route.params.subscribe((data: any) => {
      this.subjectName = data.subname;
      this.subjectId = data.subid;
      this.faculty_user_id = data.staffid;

    })
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      keyofsubject: [null, [Validators.required]],
      conceptdelery: [null, [Validators.required]],
      doubtsolving: [null, [Validators.required]],
      posttest: [null, [Validators.required]],
      topiccoverrage: [null, [Validators.required]],
      classdiscipline: [null, [Validators.required]],
      commskills: [null, [Validators.required]],  
      motivationalskills: [null, [Validators.required]],
      boardcoverrage: [null, [Validators.required]],
      coursequality: [null, [Validators.required]],
      classroom: [null, [Validators.required]],
      staff: [null, [Validators.required]],
      transportation: [null, [Validators.required]],
      washroom: [null, [Validators.required]],
      others: [null, [Validators.required]],
    });
    this.myForm.valueChanges
          .subscribe(term => {
             this.keyofsubject = this.myForm.value.keyofsubject;
             this.conceptdelery = this.myForm.value.conceptdelery;
             this.doubtsolving = this.myForm.value.doubtsolving;
             this.posttest = this.myForm.value.posttest;
             this.topiccoverrage = this.myForm.value.topiccoverrage;
             this.classdiscipline = this.myForm.value.classdiscipline;
             this.commskills = this.myForm.value.commskills;
             this.motivationalskills = this.myForm.value.motivationalskills;
             this.boardcoverrage = this.myForm.value.boardcoverrage;
             this.coursequality = this.myForm.value.coursequality;
             this.classroom = this.myForm.value.classroom;
             this.staff = this.myForm.value.staff;
             this.transportation = this.myForm.value.transportation;
             this.washroom = this.myForm.value.washroom;
             this.others = this.myForm.value.others;
          }); 
            
    this.student_user_id = window.localStorage.getItem('student_emscc_id');

  }

  closeme(){
     this.responseMessagegrpexit = false;
   
  }

  // massegepopup(){
  //   this.responseMessage = true;
  //   this.popmessage = "Please select all options";
  //   // this.flagpopup = "1";
  // }
checkcount(i, checkarr){
  let count = 0;
  while (i--) {
    if (checkarr[i] == null || checkarr[i] == "")
       count++;
  }
  return count;
}

secondeflagfun()
{
let checkarr = [this.keyofsubject,
                  this.conceptdelery,
                  this.doubtsolving,
                  this.posttest,
                  this.topiccoverrage,
                  this.classdiscipline,
                  this.commskills,
                  this.motivationalskills];
var count, i = checkarr.length;

count = this.checkcount(i, checkarr);   

if(count >0){
  // this.massegepopup()
   this.responseMessagegrpexit = true;
   this.popmessagegrp = this.translate.instant("Please select all options");
}else{
  this.thirdflag = false;
  this.firstflag = false;
  this.secondflag = true;
}
}

thirdflagfun()
{

let checkarr = [this.boardcoverrage,
                  this.coursequality];
var count, i = checkarr.length;
count = this.checkcount(i, checkarr);

if(count >0){
  this.responseMessagegrpexit = true;
  this.popmessagegrp = this.translate.instant("Please select all options");
  // this.massegepopup()
}else{
this.thirdflag = true;
this.firstflag = false;
this.secondflag = false;
}
}

firstflagfun(){
this.thirdflag = false;
this.firstflag = true;
this.secondflag = false;
}

  onsubmit(event){
    event.preventDefault();

    const fbvalue = [this.keyofsubject, this.conceptdelery, this.doubtsolving, this.posttest, this.topiccoverrage, this.classdiscipline, this.boardcoverrage
    ,this.commskills, this.motivationalskills, this.coursequality, this.classroom, 
    this.staff, this.transportation, this.washroom, this.others];
    let count = 0;  
    for(let i=0; i < fbvalue.length; i++){
      if(fbvalue[i] == null || fbvalue[i] == ''){
          count++;
      }
    }
    if(count == 0){
      const params = {
              "detail": {
                "subjectId": this.subjectId,
                "subjectName": this.subjectName,
                "student_user_id": this.student_user_id,
                "faculty_user_id": this.faculty_user_id
              },
              "feedback": [{
                "quality": {
                  "subject_knowledge": this.keyofsubject,
                  "concept_delivery": this.conceptdelery,
                  "doubt_solving": this.doubtsolving,
                  "post_test": this.posttest,
                  "pace": this.topiccoverrage,
                  "discipline": this.classdiscipline
                },
                "course": {
                  "board_coverage": this.boardcoverrage,
                  "communication": this.commskills,
                  "motivational": this.motivationalskills,
                  "course_quality": this.coursequality
                },
                "Admin_and_facilities": {
                  "classroom": this.classroom,
                  "staff": this.staff,
                  "transportation": this.transportation,
                  "washroom": this.washroom,
                  "others": this.others
                }
              }]
            };
          
          this.http.post(this.myService.commonUrl + "admin/schedulertle/feedback/userfeedbackform", params).subscribe(details => {
            const data: any = details;
            if(data.starus == 'success'){
              
              // this.success = true;
              // // this.flagpopup = '0';
              // this.responseMessage = true;
              // this.popmessage = "Feedback has been successfully submitted";
               this.responseMessage = true;
               this.popmessage = this.translate.instant("Feedback has been successfully submitted");
            }else{
              alert(this.translate.instant('Some error'));
            }
          });
      }
      else{
        alert(this.translate.instant('Ratings can not be empty'));
      }
    }
}
