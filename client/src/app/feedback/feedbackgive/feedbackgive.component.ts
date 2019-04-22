import { Component, OnInit } from '@angular/core';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-feedbackgive',
  templateUrl: './feedbackgive.component.html',
  styleUrls: ['./feedbackgive.component.css']
})
export class FeedbackgiveComponent implements OnInit {
  batch: FormControl = new FormControl('0', Validators.required);
  facultyid: FormControl = new FormControl('0', Validators.required);
  feedbackcomment: FormControl = new FormControl(null, Validators.required);
  myForm: FormGroup;
  date: any;
  monthname: any = '';
  batchname: any = '';
  globalObj: any = {};
  userlist: any = [];
  userlist2: any = [];
  subject_name_list: any = [];
  disableall: boolean = false;
  feedbackflag : boolean = false;
  submitted_sub: any;
  section_id: any = 0;
  submitted_sub_arr: any = [];
  monthNames : any = [];
  groupflag: boolean = false;
  adminstratorflag: boolean = true;
  facultyflag: boolean = false;
  faculty_id: any = 0;
  errorMessage : any = [];
  successMessage: any=[];
  closeflag: boolean = false;
  userlistdeduped: any = [];
  public staffname:any =[];
  grievance_sub_type: any = "";
  grievance_type: any = "Administration";
  mylang:any='';
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder,private translate: TranslateService) {
    this.feedbackflag = true;
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }    
  ngOnInit() {
    this.myForm = this.formBuilder.group({
      grivance_sub_type: [null, [Validators.required]],
      grivance_type: [null, [Validators.required]],
    
    });
    this.myForm.valueChanges
          .subscribe(term => {
             const {grivance_sub_type, grivance_type} = term;
             this.grievance_sub_type = grivance_sub_type;
             
             this.grievance_type = (grivance_type != null) ? grivance_type : "Administration";
          });

     this.batch.valueChanges.subscribe(term => {
          this.section_id = term;
          if(term != null && term != '0'){
            this.getsectionId(term);
          }else{
            this.userlist.length = 0;
            this.feedbackflag = true;
          }
        }); 

        this.facultyid.valueChanges.subscribe(term => {
          this.faculty_id = term;
        });     

     this.feedbackcomment.valueChanges.subscribe(term =>{
      this.globalObj.feedbackcomment = term;
     })   
     this.date = new Date();
     this.monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
     this.monthname = this.monthNames[this.date.getMonth()]; 
     this.globalObj.school_name = window.localStorage.getItem('school_name');
     this.globalObj.school_code = window.localStorage.getItem('school_code'); 
     this.globalObj.sessionid = window.localStorage.getItem('session_id'); 
     this.globalObj.token = window.localStorage.getItem('token');
     this.globalObj.userid = window.localStorage.getItem('user_id'); 
     this.globalObj.student_emscc_id = window.localStorage.getItem('student_emscc_id');
     
     this.getsectionId(this.section_id); 
     this.userlist = [];
  }


  getsectionId(section_id){
    const params_2: any = {"user_id": this.globalObj.userid,"token":this.globalObj.token};
     this.http.post(this.myService.constant.apiURL + "user_sections/sectionbyuserid", params_2).subscribe(details => {
        const data: any = details;
        if(data.response.length == 0){

        }else{
          this.section_id = data.response[0].sectionId;
        }

        const params_3 = {"user_id": this.globalObj.userid, "section_id": this.section_id,"token":this.globalObj.token}; 
        this.http.post(this.myService.constant.apiURL + "user_sections/getsectionbyuserid", params_3).subscribe(details => {
            const data: any = details;
             if(data.response.length == 0){

              }else{
                this.batchname = data.response;
                if(section_id != 0){
                  this.getSubjectList();
                } 
              }
        });
    });

  /*const params_3 = {"user_id": this.globalObj.userid, "section_id": section_id,"token":this.globalObj.token}; 
        this.http.post(this.myService.constant.apiURL + "user_sections/getsectionbyuserid", params_3).subscribe(details => {
            const data: any = details;
             if(data.response.length == 0){

              }else{
                this.batchname = data.response;
                 if(section_id != 0){
                  this.getSubjectList();
                }
              }
        }); */
  }

  generateArray(obj){
      return Object.keys(obj).map((key)=>{ return obj[key]});
  }

  getSubjectList(){
    const params_1 = { 
                      "section_id": this.section_id,
                      "user_type": "Teacher",
                      "session_id": this.globalObj.sessionid,
                   };
    this.http.post(this.myService.commonUrl + "admin/schedulertle/feedback/checkuserfeedback/emsccUserId/"+ this.globalObj.student_emscc_id, params_1).subscribe(details => {
        const data: any = details;
        if(data.feedbackLink == 0){
          this.disableall = true;
        }
        else if(data.feedbackLink == 1){
          this.submitted_sub_arr = data.submitted;
          this.disableall = false;
        }
     });
    if(this.section_id != null && this.section_id != undefined){ 
      const params = {  "user_id": this.globalObj.userid,
                        "section_id": this.section_id,
                        "user_type": "Student",
                        "session_id": this.globalObj.sessionid,
                        "token":this.globalObj.token
                    };
      this.http.post(this.myService.constant.apiURL + "user_subjects/getstaffcode", params).subscribe(details => {
          const data: any = details;
          if(this.facultyflag == true && this.adminstratorflag == false){
            this.userlist2 = data.response;
            
          this.userlist2.forEach(element => {
            this.staffname.push(element.staff_name);
            //  this.userlistdeduped = $.unique(this.staffname);
            // this.userlistdeduped = Array.from( new Set(this.userlist2) );
             this.staffname = Array.from( new Set(this.staffname) );
     
          });
    
          }
         else{
          this.userlist = data.response;
          this.userlistdeduped = Array.from( new Set(this.userlist) );
             if(this.userlist.length == 0){
            this.feedbackflag = true;
          }
          else{
            this.feedbackflag = false;
          }
        }
      });
    }
  }
   
  resetValues(){
    this.feedbackcomment.patchValue("");
    this.myForm.patchValue({grivance_sub_type: ""}); 
    this.facultyid.patchValue('0.1'); 
    this.successMessage ="";
    this.errorMessage="";
    this.closeflag=false;
  }
  activestatus(groupflag){ 
    this.resetValues();
    if(groupflag == 'Administration'){
      this.adminstratorflag = true;
      this.facultyflag = false;
    }else{
      this.facultyflag = true;
      this.adminstratorflag = false;
      this.getSubjectList();
    }
  }
  
  submitgrivance(){ 
      if(this.grievance_type == 'Faculty' && this.faculty_id == 0.1){ 
        this.errorMessage = this.translate.instant("Please select Faculty");
        $('#submitgrievance').removeAttr('data-dismiss');
       return false;
      }
   else{
      {let postdata = {
        "grievance_type"      : this.grievance_type,
        "grievance_sub_type"  : this.grievance_sub_type,
        "center_code"         : this.globalObj.school_code,
        "teacher_user_id"     : this.faculty_id,            
        "student_user_id"     : this.globalObj.student_emscc_id,            
        "feedback"            : this.globalObj.feedbackcomment
      };
      this.http.post(this.myService.commonUrl + "admin/schedulertle/feedback/centerfeedbackform'", postdata).subscribe(details => {
        const data: any = details;
      })
     
      this.resetValues();
      this.successMessage =this.translate.instant("Thank you for your Feedback")
      this.myForm.patchValue({grivance_type: "Administration"});
      this.adminstratorflag = true;
      this.facultyflag = false;
      this.closeflag=true;
      setTimeout( () => { 
         $(".modal-backdrop").remove();  
         $(".modal").hide();
         this.closeflag=false;
       }, 1000);
  }
  }}

}