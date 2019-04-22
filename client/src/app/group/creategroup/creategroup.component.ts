import { Component, OnInit } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgForm, ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, FormArray, FormControl, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-creategroup',
  templateUrl: './creategroup.component.html',
  styleUrls: ['./creategroup.component.css']
})
export class CreategroupComponent implements OnInit {
  form: FormGroup;

  public sessionid: any;
  public userid: any;
  public token: any;
  public classlist: any;
  public sectionlist: any;
  public subjectlist: any;
  public group_list: any;
  public sendtolist: any;
  public subject_id: any;
  public section_id: any;
  public class_id: any;
  public class_sec_list: any;
  public discardremk: any;
  public userType: any;
  public studentdata: any;
  public studentdataall: any;
  public emailFormArray: any;
  public studentIds: any;
  public schoolId: any;
  public groupname: any;
  public popmessage: any = '';
  public popmessagegrp: any = '';
  public responseMessage: boolean = false;
  public responseMessagegrpexit: boolean = false;
  public containerchk: any = '';
  public product_type: any = '';
  public classids : any = '';
  public checkedids: Array<any> = new Array<any>();
  mylang:any='';
  constructor(private http: HttpClient, private myService: BackendApiService, private fb: FormBuilder, private activatedRoute: ActivatedRoute,private translate: TranslateService) { 
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

  ngOnInit() {
    this.containerchk = false;
    this.form = this.fb.group({
      admincheck: this.fb.array([]),
      subject: new FormControl(),
    })

    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.userType = window.localStorage.getItem('user_type');
    this.schoolId = window.localStorage.getItem('school_id');
    this.product_type = window.localStorage.getItem('product_type');
    this.getassignedclass();
  }
  adminchange(admin: string, isChecked: boolean) {
    this.emailFormArray = [];
    this.emailFormArray = <FormArray>this.form.controls.admincheck;
    if (isChecked) {
      this.emailFormArray.push(new FormControl(admin));
    } else {
      let index = this.emailFormArray.controls.findIndex(x => x.value == admin)
      this.emailFormArray.removeAt(index);
    }
    this.checkedids = this.form.get('admincheck').value;
  }

  getassignedclass() {
    this.studentdata = [];
    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id":this.schoolId,
      "token": this.token
    };
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {
      this.classlist = details;
      if (this.classlist.response_status.status == '200') {
        this.classlist = this.classlist.response.assigned_classes;
      }

    });
  }

  getassignedsection(val) {
    this.classids = val;
    // console.log(val);
     if (val == '') { 
       this.studentdata = [];
       this.subject_id = '';
       this.section_id = '';
     }
    this.studentdata = [];
    if (val != '') {
      const params = {
        "user_id": this.userid,
        "session_id": this.sessionid,
        "class_id": val,
        "token": this.token
      };
      this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {
       this.sectionlist = details;
        if (this.sectionlist.response_status.status == '200') {
          this.sectionlist = this.sectionlist.response.assigned_sections;
          this.subjectlist = [];
        }
      });
    }

  }

  getassignedsubject(val, labelval) {
    this.subject_id = [];
    this.section_id = val;
    if(val=='')
    this.studentdata = [];
    if (val != '') {
      if (labelval != undefined) {

        const params = {
          "user_id": this.userid,
          "session_id": this.sessionid,
          "section_id": val,
          "token": this.token
        };
        this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

          this.subjectlist = details;
          if (this.subjectlist.response_status.status == '200') {
            this.subjectlist = this.subjectlist.response.assigned_subjects;
          }
        });
      }
    }
  }
  getassignedclasssecandgroup(val) {
    this.subject_id = val;
    this.studentlist();
  }

  studentlist() {
    const param = {
      "session_id": this.sessionid,
      "section_id": this.section_id,
      "user_type": 'student',
      "subject_id": this.subject_id,
      "token": this.token
    };
    this.http.post(this.myService.constant.apiURL + "user_subjects/subjectwiseusers", param).subscribe(details => {
      this.studentdataall = details;
      if (this.studentdataall.response_status.status == '200' ) {
        this.containerchk = true;
        this.studentdata = this.studentdataall.response;
        this.studentdata = new Set(this.studentdata);
        this.studentdata.forEach(obj => {
          let control = new FormControl(false);
          (<FormArray>this.form.get("admincheck")).push(control);
        });
      }
    });
  }

  allstudentckd(isChecked: boolean) {
    this.checkedids = [];
    for (let ind in this.studentdata) {
      if (isChecked) {
        (<FormArray>this.form.get("admincheck")).controls[ind].setValue(true);
        this.checkedids.push(this.studentdata[ind].user_id);
      } else {
        (<FormArray>this.form.get("admincheck")).controls[ind].setValue(false);
        this.checkedids = [];
      }
    }
  }
  discardremark() {
    this.discardremk = true;

  }
  rmkcancel() {
    this.discardremk = false;
  }
  rmkdiscard() {
    this.discardremk = false;
  }
  closeme() {
    this.responseMessagegrpexit = false;
  }

  creategroup() {

    this.checkedids = [];
    this.studentIds = this.form.get('admincheck').value;
    let i = 0;
    this.studentdata.forEach(objval => {
      if(this.studentIds[i]) {  
        this.checkedids.push(objval.user_id);
      };
      i++;
    });

      if (!this.classids && !this.section_id && !this.subject_id && this.product_type == 'emscc') {
        
          alert(this.translate.instant("please_select_class_batch_subject"));
         
           return false;
         }else if (!this.classids && !this.section_id && !this.subject_id) {

          alert(this.translate.instant("please_select_class_section_subject"));
           return false;
        }
        
    if (this.section_id == undefined || this.section_id == '') {
      if(this.product_type == 'emscc')
        {
     
        alert(this.translate.instant("please_select_batch"));
        return false;
        }
      else
        {
   
      alert(this.translate.instant("please_select_section"));
      return false;
        }
    }
    if (this.subject_id == undefined || this.subject_id == '') {

      alert(this.translate.instant("please_select_subject"));
      return false;
    }
    if (this.form.get('subject').value == undefined || this.form.get('subject').value == '') {
    
      alert(this.translate.instant("please_enter_group_name"));
      return false;
    }
    if (this.checkedids.length == 0) {
    
      alert(this.translate.instant("please_select_student"));
      return false;
    }

    const param = {
      "session_id": this.sessionid,
      "section_id": this.section_id,
      "subject_id": this.subject_id,
      "school_id": this.schoolId,
      "group_name": this.form.get('subject').value,
      "user_type": "Student",
      "created_by": this.userid,
      "user_id": this.checkedids,
      "token": this.token
    }
    this.http.post(this.myService.constant.apiURL + "groups/creategroup", param).subscribe(details => {
      this.popmessage = details;
      if (this.popmessage.response.status == '203') {
        this.responseMessagegrpexit = true;
        this.popmessagegrp = this.popmessage.response.message;
      }
      if (this.popmessage.response.status == '200') {
        this.responseMessage = true;
        this.popmessage = this.translate.instant(this.popmessage.response.message);
      }
    });

  }
}
