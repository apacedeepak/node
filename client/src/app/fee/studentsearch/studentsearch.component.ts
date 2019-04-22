import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators,FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';

@Component({
  selector: 'app-studentsearch',
  templateUrl: './studentsearch.component.html',
  styleUrls: ['./studentsearch.component.css']
})
export class StudentsearchComponent implements OnInit {


  searchForm: FormGroup;
  
  successmsg: any = '';
  errormsg: any = '';
  params:any;
  searchParam:any;
  classArrayList:any=[];
  sectionArrayList:any=[];
  studentlistdata:any=[];

  class_list_object:any;
  section_list_object:any;
  
  constructor(private http: HttpClient, private myservice: BackendApiService,private router:Router) { }

  ngOnInit() {

    this.params = {"schoolId":window.localStorage.getItem('school_id'),"status":"Active"};

    
    var url = this.myservice.constant.apiURL + "/classes/getclasslist";
    // hit post API to get class list
    
    this.http.post(url, {"school_id":window.localStorage.getItem('school_id'),"status":"Active"}).subscribe(data => {
      const result: any = data;
      
      if(result.response_status.status == "200") {
        this.class_list_object = result.response;
      }

      this.class_list_object.forEach(element => {
        var classlist = {
          'id': element.id,
          'class_name':element.board.board_name + " - " + element.class_name
        };
        this.classArrayList.push(classlist);
      });

    });


    this.searchForm = new FormGroup({
      
      student_name: new FormControl(''),
      admission_number: new FormControl(''),
      class_id: new FormControl(''),
      section_id: new FormControl(''),
    });
   

    this.searchParam = {"status":"Active"};
    this.getStudentList();


  }

  getStudentList(){
    this.studentlistdata = [];
  }

  getSectionList(value){
    this.sectionArrayList = [];
    this.searchForm.patchValue({
      
      section_id: "",
      
    });
    
    var class_id = value;
    var sectionparams = {"class_id":class_id};
    // hit API to get section list
    var url = this.myservice.constant.apiURL + "/sections/allsectionbyclassid";
    this.http.post(url, sectionparams).subscribe(data => {
      const result: any = data;
      
      if(result.response_status.status == "200") {
        console.log(this.section_list_object = result.response);
      }

      this.section_list_object.forEach(element => {
        var sectionlist = {
          'id': element.id,
          'section_name':element.section_name
        };
        this.sectionArrayList.push(sectionlist);
      });

    });





}

  onSubmit(value){

    this.searchParam = {};
    this.searchParam.school_id = window.localStorage.getItem('school_id');
    this.searchParam.status = "Active";

    if(value.admission_number){
      this.searchParam.admission_number = value.admission_number;
    }

    if(value.student_name){
      this.searchParam.student_name = value.student_name;
    }

    if(value.class_id){
      this.searchParam.class_id = value.class_id;
    }

    if(value.section_id){
      this.searchParam.section_id = value.section_id;
    }

    // if(value.school_id){
    //   this.searchParam.school_id = value.school_id;
    // }

    

    var url = this.myservice.constant.apiURL + "students/studentsearchlist";

    this.http.post(url, this.searchParam).subscribe(data => {
      
      const result: any = data;
      if(result.response_status.status == "200") {
        this.studentlistdata = result.response;
        console.log(this.studentlistdata);
      }

    });

  }

  

}
