import { Component, OnInit } from '@angular/core';
import { NgForm, FormControlName } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-userfeedback',
  templateUrl: './userfeedback.component.html',
  styleUrls: ['./userfeedback.component.css']
})
export class UserfeedbackComponent implements OnInit {
  public facultyFeedbackForm: FormGroup;
  public courseFeedbackForm: FormGroup;
  public facilitiesFeedbackForm: FormGroup;
  public boardSyllabusFeedbackArr: FormArray;
  public qualityCourseFeedbackArr: FormArray;
  public subjectIdsArr: FormArray;
  public globalObj: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public staffArr: any = {};
  public schoolList: any = {};
  public assignedSchool: any = {};
  public facultyArr: any = {};
  public assignedUser: any = {};
  public mylang: any = '';
  public sessionid: any;
  public userid: any;
  public school_id: any;
  public token: any;
  public section_id_list: any = {};
  public student_section_id:any;
  public section_id:any;
  public facultyfeedbackui:boolean;
  public facultyfeedbackview:boolean;
  public coursefeedbackui:boolean;
  public coursefeedbackview:boolean;
  public administrationfeedbackui:boolean;
  public administrationfeedbackview:boolean;
  public feedbackDefinefacultyparameter = ["Poor", "Average", "Good", "Very Good", "Excellent"];
  public feedbackDefineCourseparameter = ["P", "A", "G", "V", "E"];
  public fromCurrentMonthDate:any;
  public toCurrentMonthDate:any;
  public facultyFeedbackList:any=[];
  public administrationFeedbackList:any=[];
  public assignSubjectList:any=[];
  public model: any = {};
  public userfeedbackfrequencyList:any=[];
  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService, private fb: FormBuilder) {
    this.mylang = window.localStorage.getItem('language');
    this.student_section_id=window.localStorage.getItem('student_section_id');
    this.token = window.localStorage.getItem('token');
    this.boardSyllabusFeedbackArr = new FormArray([]);
    this.qualityCourseFeedbackArr = new FormArray([]);
    this.subjectIdsArr = new FormArray([]);
    this.getassignedstudentsubject();
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    }
    else {
      translate.setDefaultLang('en');
    }

    //   const parms = {
  //     "user_id": this.globalObj.userid,
  //     "token": this.token
  //  }

  //  this.http.post(this.myService.constant.apiURL + "user_sections/sectionbyuserid", parms).subscribe(details => {
  //      this.section_id_list = details;
  //      for(let i in this.section_id_list.response){
  //          if(this.section_id_list.response[i].status == "Active"){
  //             this.section_id = this.section_id_list.response[i].sectionId;
  //          }
  //      }
  //     });
  }

  ngOnInit() {   
    this.model.subjectFacultyModel='';
    this.facultyfeedbackui=false;
    this.facultyfeedbackview=false;
    this.coursefeedbackui=false;
    this.coursefeedbackview=false;
    this.administrationfeedbackui=false;
    this.administrationfeedbackview=false;
    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.school_id = window.localStorage.getItem('school_id');  
    let nowto = new Date();
    let nowfrom = new Date();
    this.toCurrentMonthDate=nowto;  
      
    const url =
      this.myService.constant.apiURL +
      "user_feedback_frequencies/getallUserfeedbackfrequency";
    this.http.get(url).subscribe(response => {
      const data: any = response;
      let nowfrom = new Date();
      this.userfeedbackfrequencyList = data.response;
      if(this.userfeedbackfrequencyList.length>0){
        let no_of_days=this.userfeedbackfrequencyList[0]['no_of_days'];
        let fromdays = new Date(nowfrom.setDate(nowfrom.getDate() - no_of_days));
        this.fromCurrentMonthDate=fromdays;        
      }else{        
        this.fromCurrentMonthDate='';
      }
      this.getAdministrationFeedback();
      this.getCourseFeedback();
    });
    
   

    this.getFacultyFeedbackSet();
    this.getFacilitiesFeedbackSet();
    this.getCourseFeedbackSet();
    // var now = new Date();
    // var currentMonthLastDate = new Date(now.getFullYear(), now.getMonth()+1, 0);
    // var currentMonthFirstDate = new Date(now.getFullYear() - (now.getMonth() > 0 ? 0 : 1), (now.getMonth()  + 12) % 12, 1);
    
    // var fromYear = currentMonthFirstDate.getFullYear();
    // var fromMonth = currentMonthFirstDate.getMonth() + 1;
    // var fromMonthStr = (fromMonth>9)?fromMonth: '0'+ fromMonth;
    // var tempFromDate = currentMonthFirstDate.getDate();
    // var fromDateStr = (tempFromDate>9)?tempFromDate: '0'+tempFromDate;
    // this.fromCurrentMonthDate = fromYear +'-'+fromMonthStr+'-'+fromDateStr; 

    // var toYear = currentMonthLastDate.getFullYear();
    // var toMonth = currentMonthLastDate.getMonth() + 1;
    // var toMonthStr = (toMonth>9)?toMonth: '0'+ toMonth;
    // var temptoDate = currentMonthLastDate.getDate();
    // var toDateStr = (temptoDate>9)?temptoDate: '0'+temptoDate;
    // this.toCurrentMonthDate = toYear +'-'+toMonthStr+'-'+toDateStr;


    //let formatted_date = currentMonthFirstDate.getFullYear() + "-" + (currentMonthFirstDate.getMonth() + 1) + "-" + currentMonthFirstDate.getDate()
    //console.log(formatted_date);
  }

  getFacultyFeedbackSet() {
    this.facultyFeedbackForm = new FormGroup({
      studentsubject: new FormControl("", Validators.required),
      subjectfaculty: new FormControl("", Validators.required),
      knowledgeOfSubject: new FormControl("", Validators.required),
      conceptDelivery: new FormControl("", Validators.required),
      doubtSolvingAbility: new FormControl("", Validators.required),
      postTestDiscussion: new FormControl("", Validators.required),
      paceOfTopicCoverage: new FormControl("", Validators.required),
      disciplineInClass: new FormControl("", Validators.required),
      communicationSkills: new FormControl("", Validators.required),
      motivationalSkills: new FormControl("", Validators.required)
    });
  }
  getFacilitiesFeedbackSet() {
    this.facilitiesFeedbackForm = new FormGroup({
      classroom: new FormControl("", Validators.required),
      staff: new FormControl("", Validators.required),
      transportation: new FormControl("", Validators.required),
      washroom: new FormControl("", Validators.required),
      others: new FormControl("", Validators.required)
    });
  }
  getCourseFeedbackSet() {    
    this.courseFeedbackForm = this.fb.group({
      boardSyllabusFeedback: this.boardSyllabusFeedbackArr,
      qualityCourseFeedback: this.qualityCourseFeedbackArr,
      subjectIds: this.subjectIdsArr
    });
  }
  getassignedstudentsubject() {    
    const param = {
      "session_id": this.sessionid,
      "user_type": 'student',
      "user_id": this.userid,
      "schoolId": this.school_id,
      "section_id":this.student_section_id
    };
    this.http.post(this.myService.constant.apiURL + "user_subjects/userassignsubject", param).subscribe(details => {
      const data: any = details;
      this.globalObj.studentassignsubject = data.response;
      let subjectObjectList = data.response;
      subjectObjectList.forEach(subjectdata => {
        this.qualityCourseFeedbackArr.push(new FormControl(''));
        this.boardSyllabusFeedbackArr.push(new FormControl(''));
        this.subjectIdsArr.push(new FormControl(subjectdata.subject_id));
      });
    });
  }
  getsubjectassignedfaculty(subjectId) {
    this.facultyfeedbackui=false;
    this.facultyfeedbackview=false;
    this.model.subjectFacultyModel='';
    if(subjectId>0){
      this.assignSubjectList=[];
      const param = {
        "session_id": this.sessionid,
        "user_type": 'Teacher',
        "subject_id": subjectId,
        "schoolId": this.school_id,
        "section_id":this.student_section_id
      };
      this.http.post(this.myService.constant.apiURL + "user_subjects/facultyassignsubject", param).subscribe(details => {
        const data: any = details;
        this.assignSubjectList = data.response;

      });
    }  
  }
  facultyFeedbackSubmit(formValue) {
    let isConfirm = confirm('Once you submit,You will not be able to make changes in feedback.Do you still want to submit');
    if (isConfirm) {
    formValue.user_id = this.userid;
    formValue.feedback_type = "1";
    this.http
      .post(
        this.myService.constant.apiURL + "user_feedbacks/addFacultyFeedback",
        formValue
      )
      .subscribe(data => {
        const responsedetails: any = data;
        const details = responsedetails.response;               
        if (details.status == "200") {
          this.facultyfeedbackui=false;
          this.facultyfeedbackview=true;
          this.successMessage.message = details.message;
          setTimeout(() => { this.successMessage.message = ''; }, 5000);
          this.getFacultyFeedback(details.detail.feedback_subject_id,details.detail.feedback_for_id);
        } else {
          this.facultyfeedbackui=true;
          this.facultyfeedbackview=false;
          this.errorMessage.message = details.message;
          setTimeout(() => { this.errorMessage.message = ''; }, 5000);
        }
      });
    }else {
      return false;
    }
  }
  courseFeedbackSubmit(formValue) {
    let isConfirm = confirm('Once you submit,You will not be able to make changes in feedback.Do you still want to submit');
    if (isConfirm) {
    formValue.user_id = this.userid;
    formValue.feedback_type = "2";
    this.http
      .post(
        this.myService.constant.apiURL + "user_feedbacks/addCoureseFeedback",
        formValue
      )
      .subscribe(data => {
        const responsedetails: any = data;
        const details = responsedetails.response;        
        if (details.status == "200") {
          this.coursefeedbackui=true;
          this.coursefeedbackview=false;
          this.successMessage.message = details.message;
          setTimeout(() => { this.successMessage.message = ''; }, 3000);
          this.getCourseFeedback();
        } else {
          this.coursefeedbackui=true;
          this.coursefeedbackview=false;
          this.errorMessage.message = details.message;
          setTimeout(() => { this.errorMessage.message = ''; }, 3000);
        }
      });
    }else {
      return false;
    }
  }
  facilitiesFeedbackSubmit(formValue) {
    let isConfirm = confirm('Once you submit,You will not be able to make changes in feedback.Do you still want to submit');
    if (isConfirm) {
    formValue.user_id = this.userid;
    formValue.feedback_type = "3";
    this.http
      .post(
        this.myService.constant.apiURL + "user_feedbacks/addAdministartionFeedback",
        formValue
      )
      .subscribe(data => {
        const responsedetails: any = data;
        const details = responsedetails.response;
        this.getFacilitiesFeedbackSet();
        if (details.status == "200") {
          this.administrationfeedbackui=false;
          this.administrationfeedbackview=true;
          this.successMessage.message = details.message;
          setTimeout(() => { this.successMessage.message = ''; }, 3000);
          this.getAdministrationFeedback();
        } else {
          this.administrationfeedbackui=true;
          this.administrationfeedbackview=false;
          this.errorMessage.message = details.message;
          setTimeout(() => { this.errorMessage.message = ''; }, 3000);
        }
      });
    }else {
      return false;
    }
  }
  getFacultyFeedback(subjectId,facultyId) {
    const param = {     
      "feedback_type": '1',
      "subjectId": subjectId,
      "facultyId": facultyId,
      "user_id": this.userid,
      "fromCurrentMonthDate":this.fromCurrentMonthDate,
      "toCurrentMonthDate":this.toCurrentMonthDate
    };
    if(subjectId>0 && facultyId>0){
    this.http.post(this.myService.constant.apiURL + "user_feedbacks/getFacultyFeedback", param).subscribe(details => {
      const data: any = details;
      this.globalObj.facultyFeedbackParameterList=[];
      
      var tempFacultyFeedbackParameterList:any=[];
      if(data.response.length>0){   
        data.response.forEach((key, value) => { 
          var tempFacultyData:any={};
          if(key.user.user_belongs_to_staff !=null){
            tempFacultyData.staff_name=key.user.user_belongs_to_staff.name;
          }        
          tempFacultyData.feedback_date=key.feedback_date;
          tempFacultyData.feedback_json=JSON.parse(key.feedback_json);
          tempFacultyFeedbackParameterList.push(tempFacultyData);
        });     
        this.facultyFeedbackList = tempFacultyFeedbackParameterList;         
        this.facultyfeedbackui=false;
        this.facultyfeedbackview=true;
      }else{
        this.facultyfeedbackui=true;
        this.facultyfeedbackview=false;
      } 
    });
  }else{
    this.facultyfeedbackui=false;
    this.facultyfeedbackview=false;
  }
  }

  getAdministrationFeedback() {
    const param = {     
      "feedback_type": '3',
      "user_id": this.userid,
      "fromCurrentMonthDate":this.fromCurrentMonthDate,
      "toCurrentMonthDate":this.toCurrentMonthDate
    };
    this.http.post(this.myService.constant.apiURL + "user_feedbacks/getAdministrationFeedback", param).subscribe(details => {
      const data: any = details;
      this.globalObj.facultyFeedbackParameterList=[];
      
      var tempAdministrationFeedbackParameterList:any=[];
      if(data.response.length>0){   
        data.response.forEach((key, value) => {  
          var tempAdministrationData:any={};              
          tempAdministrationData.feedback_date=key.feedback_date;
          tempAdministrationData.feedback_json=JSON.parse(key.feedback_json);
          tempAdministrationFeedbackParameterList.push(tempAdministrationData);
        });     
        this.administrationFeedbackList = tempAdministrationFeedbackParameterList;         
        this.administrationfeedbackui=false;
        this.administrationfeedbackview=true;
      }else{
        this.administrationfeedbackui=true;
        this.administrationfeedbackview=false;
      }
      
    });
  }
  
  getCourseFeedback() {
    const param = {     
      "feedback_type": '2',
      "user_id": this.userid,
      "fromCurrentMonthDate":this.fromCurrentMonthDate,
      "toCurrentMonthDate":this.toCurrentMonthDate
    };
    this.http.post(this.myService.constant.apiURL + "user_feedbacks/getCourseFeedback", param).subscribe(details => {
      const data: any = details;
      this.globalObj.facultyFeedbackParameterList=[];      
      var tempCourseFeedbackParameterList:any=[];
      var subjectName:any=[];
      if(data.response.length>0){   
        data.response.forEach((key, value) => { 
          var tempCourseData:any={}; 
          if(key.subjects !=null){
            tempCourseData.subject_name=key.subjects.subject_name;
            subjectName.push(key.subjects.subject_name);
            tempCourseData.feedback_date=key.feedback_date;
            tempCourseData.feedback_json=JSON.parse(key.feedback_json);
            tempCourseFeedbackParameterList.push(tempCourseData);
          }                         
        });     
        this.globalObj.courseFeedbackList = tempCourseFeedbackParameterList;
        this.globalObj.courseStringList = subjectName.join();    
       // console.log(this.globalObj.courseFeedbackList);       
        this.coursefeedbackui=false;
        this.coursefeedbackview=true;
      }else{
        this.coursefeedbackui=true;
        this.coursefeedbackview=false;
      }
      
    });
  }
}
