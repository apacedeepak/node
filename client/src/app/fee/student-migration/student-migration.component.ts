import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';

@Component({
  selector: 'app-student-migration',
  templateUrl: './student-migration.component.html',
  styleUrls: ['./student-migration.component.css']
})
export class StudentMigrationComponent implements OnInit {




  successmsg: any = '';
  errormsg: any = '';
  params: any;
  searchParam: any;
  studentlistdata: any = [];
  hostUrl: any;
  studentDetails: any = [];
  showStudentDetails: any = false;
  requestForm: any;
  action: any;
  refundAmount: FormArray;
  refundArr: FormArray;
  refundrequest: any;
  totalRefundableFee: any;
  isRefundMode: any;
  refundConfiguration: any = [];

  migrationForm: FormGroup;
  migrationdata: any = [];
  schoolIdArr: FormArray;
  courseModeArr: FormArray;
  boardArr: FormArray;
  classArr: FormArray;
  sectionArr : FormArray;
  feestructureArr : FormArray;
  sessionArr: FormArray;
  schoollist: any = [];
  course_modes_list = [];
  boards_list: any = [];
  class_list: any = [];
  section_list: any = [];
  fee_structure_list:any = [];
  constructor(private http: HttpClient, private myservice: BackendApiService, private router: Router) { }

  ngOnInit() {



    this.schoolIdArr = new FormArray([]);
    this.courseModeArr = new FormArray([]);
    this.boardArr = new FormArray([]);
    this.classArr = new FormArray([]);
    this.sectionArr = new FormArray([]);
    this.feestructureArr = new FormArray([]);
    this.sessionArr = new FormArray([]);
    
    this.migrationForm = new FormGroup({

      school_id: this.schoolIdArr,
      course_mode_id: this.courseModeArr,
      board_id: this.boardArr,
      class_id: this.classArr,
      section_id: this.sectionArr,
      fee_structure_id: this.feestructureArr,
      session_id: this.sessionArr,
    });

    var url = this.myservice.constant.apiURL + "migrations/getstudentlist";

    this.http.post(url, { migration_status: 0 }).subscribe(data => {
      const result: any = data;
      // console.log(result);
      if (result.response.length > 0) {
        this.migrationdata = result.response;
        console.log(this.migrationdata);
        this.migrationdata.forEach((om) => {

          this.schoolIdArr.push(new FormControl(""));
          this.courseModeArr.push(new FormControl(''));
          this.boardArr.push(new FormControl(''));
          this.classArr.push(new FormControl(''));
          this.sectionArr.push(new FormControl(''));
          this.feestructureArr.push(new FormControl(''));
          this.sessionArr.push(new FormControl(''));
        });
        
      }

    });




    this.http.get(this.myservice.constant.apiURL + "course_modes/getcoursemode").subscribe(data => {
      const datas: any = data;
      this.course_modes_list = datas.response

    });

    




    //get All center list

    var url = this.myservice.constant.apiURL + "schools/getallschoollist";

    this.http.post(url, {}).subscribe(data => {
      const result: any = data;
      // console.log(result);
      if (result.response.length > 0) {
        this.schoollist = result.response;
        console.log(this.schoollist);
      }
    });

    this.hostUrl = this.myservice.constant.domainName;

  }

  onSubmit(value) {
    // nothing
  }

  getActiveSession(row) {

    //alert(row);
    var session_id = this.fee_structure_list[row].find(o=>o.fee_structure_id == (<FormArray>this.migrationForm.get('fee_structure_id')).controls[row].value).fee_structure_master.session_id
    //alert(session_id);
    (<FormArray>this.migrationForm.get('session_id')).controls[row].setValue(session_id);
  }

  getCourseList(row){

    if((<FormArray>this.migrationForm.get('course_mode_id')).controls[row].value){
    this.http.get(this.myservice.constant.apiURL + "boards/getactiveboard").subscribe(data => {
      const datas: any = data;
      this.boards_list[row] = datas.response

    });
    }
  
  }

  getCourseTypeList(row){

    if((<FormArray>this.migrationForm.get('board_id')).controls[row].value){
      const classparams = {
        "boardId": (<FormArray>this.migrationForm.get('board_id')).controls[row].value,
        "school_id": (<FormArray>this.migrationForm.get('school_id')).controls[row].value
      }
      this.http.post(this.myservice.constant.apiURL + 'classes/getclasslistbyboardId', classparams).subscribe(details => {
      const datas: any = details;
      this.class_list[row] = datas.response
  
  
      });
    }
  
  }


  getSectionList(row){

    this.section_list[row] = [];
    const param = {
      "class_id": (<FormArray>this.migrationForm.get('class_id')).controls[row].value,
      "course_mode_id":(<FormArray>this.migrationForm.get('course_mode_id')).controls[row].value
    };

    this.http.post(this.myservice.constant.apiURL + 'sections/allsectionbyclassid', param).subscribe(datas => {
      const section: any = datas;
      
      this.section_list[row] = section.response;
    });


  }


  getFeeStructureList(row){

    this.fee_structure_list[row] = [];
    if((<FormArray>this.migrationForm.get('section_id')).controls[row].value){
      const param={
        "section_id":(<FormArray>this.migrationForm.get('section_id')).controls[row].value
      }
      this.http.post(this.myservice.constant.apiURL + 'fee_structure_details/getfeestructurebysection', param).subscribe(details => {
        const data: any = details
        //console.log(data.response);
        this.fee_structure_list[row] =data.response
        
      });
  
  
     
    }
  
  }

  migrate(row){

  //alert(row);

  //console.log(this.migrationForm.value);
  //console.log(this.migrationForm.value.board_id[row]);
  
  var session_id = this.migrationForm.value.session_id[row];
  var school_id = this.migrationForm.value.school_id[row];
  var section_id = this.migrationForm.value.section_id[row];
  var course_mode_id = this.migrationForm.value.course_mode_id[row];
  var board_id = this.migrationForm.value.board_id[row];
  var class_id = this.migrationForm.value.class_id[row];
  var fee_structure_id = this.migrationForm.value.fee_structure_id[row];

  var jsonArr = {
    "session_id":session_id,
    "school_id":school_id,
    "section_id":section_id,
    "course_mode_id":course_mode_id,
    "board_id":board_id,
    "class_id":class_id,
    "fee_structure_id":fee_structure_id,
    "type":"student",
    "gender":this.migrationdata[row].gender,
    "mobile":this.migrationdata[row].contact_number,
    "email":this.migrationdata[row].student_email,
    "fname" : this.migrationdata[row].first_name,
    "mname" : " ",
    "lname" : this.migrationdata[row].last_name,
    "admission_no": this.migrationdata[row].admission_number,
    "father_name":this.migrationdata[row].father_name,
    "mother_name":this.migrationdata[row].mother_name,
    "father_email":this.migrationdata[row].student_email,
    "due_fee": this.migrationdata[row].due_fee,
    "paid_fee": this.migrationdata[row].paid_fee,
    "dob": this.migrationdata[row].due_fee,
    "admission_date": this.migrationdata[row].admission_date,
    "migration_id" : this.migrationdata[row].id
  }
  console.log(jsonArr);


  // Migrate API hit 

  this.http.post(this.myservice.constant.apiURL + 'registration/userregistrationmigration', jsonArr).subscribe(data => {
    const result: any = data;
    console.log(result.response);
    if(result.response.responseCode == 200){
      // migrated...
      alert("Migrated successfully");
      location.reload();
    }
    else{
      alert("Not migrated");
    }
  });


  }

}
