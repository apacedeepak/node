import { Component, OnInit } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { NgForm, ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, FormArray, FormControl, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-updategroup',
  templateUrl: './updategroup.component.html',
  styleUrls: ['./updategroup.component.css']
})
export class UpdategroupComponent implements OnInit {
  form: FormGroup;
  public sessionid: any;
  public userid: any;
  public token: any;
  public classlist: any;
  public groupid: any;
  public groupdetails: any;
  public updateddatetime: any;
  public subjectname: any;
  public sectionname: any;
  public studentdetail: any;
  public ckdval: boolean = false;
  public userIdvals: any;
  public emailFormArray: any;
  public prev: any = 0;
  public studentIds: any;
  public schoolId: any;
  public selectedAll: any;
  public checkedids: Array<any> = new Array<any>();
  public subgrouparr: Array<any> = new Array<any>();
  public indexes: Array<any> = new Array<any>();
  public popmessage: any = '';
  public grpdetail:any = '';
  public studentdetailss: any = [];
  public responseMessage: boolean = false;
  public product_type: any = '';
  mylang:any='';


  constructor(private route: ActivatedRoute, private http: HttpClient, private myService: BackendApiService, private fb: FormBuilder, private activatedRoute: ActivatedRoute,private translate: TranslateService) {

    this.route.params.subscribe((data: any) => {
      this.userid = data.userId;
      this.groupid = data.Id;
    })
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

  ngOnInit() {
    this.form = this.fb.group({
      admincheck: this.fb.array([]),
    })

    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.schoolId = window.localStorage.getItem('school_id');
    this.product_type = window.localStorage.getItem('product_type');
    this.getassignedclass();
  }


  adminchange(user_id, value){
    if(!value) $("#allcheck").prop("checked", false);
  }

  allstudentckd(isChecked: boolean) {
    for (let ind in this.studentdetail) {
      if (isChecked) {
        (<FormArray>this.form.get("admincheck")).controls[ind].setValue(true);
        this.checkedids.push(this.studentdetail[ind].user_id);
      } else {
        (<FormArray>this.form.get("admincheck")).controls[ind].setValue(false);
        this.checkedids = [];
      }
    }
  }
  getassignedclass() {

    const params = {
      "user_id": this.userid,
      "token": this.token,
      "group_id": this.groupid,
      "user_type": "student"
    };
    this.http.post(this.myService.constant.apiURL + "groups/groupidbydetail", params).subscribe(details => {
      this.grpdetail = details;
      this.groupdetails = this.grpdetail.response;
      this.studentdetail = this.groupdetails.data;
      this.updateddatetime = this.groupdetails.groupdata.updated_date_time;
      this.subjectname = this.groupdetails.belgons_to_subject.subject_name;
      this.sectionname = this.groupdetails.belgons_to_section.section_name;

      let userIdval = [];

      this.studentdetail.forEach(obj => {
        if (obj.chkflag == true) {
          let control = new FormControl(true);
          (<FormArray>this.form.get("admincheck")).push(control);
        } else {
          let control = new FormControl(false);
          (<FormArray>this.form.get("admincheck")).push(control);
        }
      });
    });
  }
  
  closeme() {
    this.responseMessage = false;
  }

  updategroup() {
    this.checkedids = [];
    this.studentIds = this.form.get('admincheck').value;
    for (let selectedids in this.studentIds) {
      if (this.studentIds[selectedids] == true) {
        this.checkedids.push(this.studentdetail[selectedids].user_id);
      }
    }
    if (this.checkedids.length == 0) {
      
      alert(this.translate.instant('please_select_student'));
      return false;
    }
    const param = {
      "session_id": this.sessionid,
      "school_id": this.schoolId,
      "user_type": "Student",
      "created_by": this.userid,
      "user_ids": this.checkedids,
      "group_id": this.groupid,
      "token": this.token
    }
    this.http.post(this.myService.constant.apiURL + "groups/creategroup", param).subscribe(details => {
      this.popmessage = details;
      if (this.popmessage.response.status == '200') {
        this.responseMessage = true;
        this.popmessage = this.translate.instant(this.popmessage.response.message);
      }
    });

  }
}
