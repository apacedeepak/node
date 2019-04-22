import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-studentlist',
  templateUrl: './studentlist.component.html',
  styleUrls: ['./studentlist.component.css']
})
export class StudentlistComponent implements OnInit {
  mylang: any = '';
  page: number = 1;
  school_id:any;
  session_id:any;
  student_list:any;
  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
    if(this.mylang){
      translate.setDefaultLang( this.mylang);
    }
    else{
      translate.setDefaultLang( 'en');
    }
   }

  ngOnInit() {
    this.school_id= window.localStorage.getItem('school_id');
    this.session_id= window.localStorage.getItem('session_id');
   
    this.studentList();
  }
  studentList(){
const param={
  "school_id":this.school_id
}
this.http.post(this.myService.constant.apiURL+"students/studentlist", param).subscribe(data => {
  const detail:any=data
this.student_list=detail.response;

})
}
}
