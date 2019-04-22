import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Params } from "@angular/router";

@Component({
  selector: 'app-coursemode',
  templateUrl: './coursemode.component.html',
  styleUrls: ['./coursemode.component.css']
})
export class CoursemodeComponent implements OnInit {

  coursemodeForm : FormGroup;
  public errorMessage: any = {};
  public successMessage: any = {};
  public courseModeArr: any = [];
  public courseModeId: any = {};
  public courseData: any = {};
  public editOrUpadte = 0;
  mylang:any='';
  public postJson: any = {};

  constructor(private http: HttpClient, private myService: BackendApiService,private translate: TranslateService, private activatedRoute: ActivatedRoute, private elem: ElementRef) {
      this.mylang= window.localStorage.getItem('language');
      if(this.mylang){
        translate.setDefaultLang( this.mylang);
      }
      else{
        translate.setDefaultLang( 'en');
      }
  }

  ngOnInit() {  

      this.editOrUpadte = 0;

      this.getFromSet();

      /* Get All Course Mode Master List */
      this.getCourseModeList();
  }


  getFromSet() {
    this.coursemodeForm = new FormGroup({
      course_mode_name: new FormControl(''),
      status: new FormControl(true),
      id: new FormControl('')
    });
  }

  /* Insert in database */
  saveCourseMode(courseArr){
    if (courseArr.status == 1) {
      var status = "Active";
    } else {
      var status = "Inactive";
    }
    let today = new Date();
   
    
    if(courseArr.id){
      this.postJson = {
        "id" : courseArr.id,
        "course_mode_name" : courseArr.course_mode_name,
        "status" : status,
        "added_date": today
      }
    } else{
      this.postJson = {
        "course_mode_name" : courseArr.course_mode_name,
        "status" : status,
        "added_date": today
      };
    }


    if(courseArr.course_mode_name){
      let param = {"course_mode_name": courseArr.course_mode_name};
      this.http.post(this.myService.constant.apiURL+ "course_modes/coursemodebyname", param).subscribe(data => {
        const datas: any = data;
        if(datas.response.length > 0 && !courseArr.id){
          this.errorMessage.message = "Course mode already exist.";
          setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
        }else{
          this.saveCourse(this.postJson);
        }
      });
    }
  
     
  }

  saveCourse(postJson){
    this.http.post(this.myService.constant.apiURL+ "course_modes/createcoursemode", postJson).subscribe(data => {
      const datas: any = data;
      if(datas.response_status.response_status == 200){
        this.successMessage.message = datas.response_status.response;
        setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
        this.getFromSet();
      }else{
        this.errorMessage.message = "Error Occured";
        setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
      }
      this.getCourseModeList();
    });
  }

  /* Get edit data from database base of course mode id*/
  editCourse(courseModeId){  
    if(courseModeId){ 
      this.editOrUpadte = 1;
      this.http.get(this.myService.constant.apiURL+ "course_modes/getcoursebyid?courseId="+ courseModeId).subscribe(detail => {
        const data: any = detail;
        this.courseData = data.response;
        
        if(this.courseData.status == 'Active'){
          var status = true;
        }else{
          var status = false;
        }
     
        this.coursemodeForm.patchValue({
          id: this.courseData.id,
          course_mode_name: this.courseData.course_mode_name,
          status: status
        });
        this.getCourseModeList();
      });
    }
  }
  
  getCourseModeList(){
    this.http.get(this.myService.constant.apiURL+ "course_modes/getcoursemode").subscribe(detail => {
      this.courseModeArr = detail;
      this.courseModeArr = this.courseModeArr.response;
    });
  }

}
