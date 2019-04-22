import { Component, OnInit } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgForm, FormsModule, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.component.html',
  styleUrls: ['./grouplist.component.css']
})
export class GrouplistComponent implements OnInit {
  public sessionid: any;
  public userid: any;
  public token: any;
  public classlist: any;
  public sectionlist: any;
  public subjectlist: any;
  public group_list : any;
  public sendtolist : any;
  public subject_id : any;
  public section_id : any;
  public class_id : any;
  public class_sec_list : any;
  public grouplists : any = [];
  public popmessage: any = '';
  public responseMessage: boolean = false;
  public schoolId: any;  
  public grplist : any ; 
  public product_type : any = '';   
  mylang:any='';
  public grouplistsdisplay : any = false;
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
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.schoolId = window.localStorage.getItem('school_id');
    this.product_type = window.localStorage.getItem('product_type');
    this.getassignedclass();
    this.groupslist();
  }

  getassignedclass() {
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
   this.class_id = val;
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

  getassignedsubject(val, labelval) { //alert(val)
    if (val != '') {
      if (labelval != undefined) {

        const params = {
          "user_id": this.userid,
          "session_id": this.sessionid,
          "section_id": val,
          "token": this.token

        };
        window.localStorage.setItem('homework_section_id', val);
        window.localStorage.removeItem('homework_subject_id');
        this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

          this.subjectlist = details;
          if (this.subjectlist.response_status.status == '200') {
            this.subjectlist = this.subjectlist.response.assigned_subjects;
            // console.log(this.subjectlist);
          }
        });
      }
    }
  }
  getassignedclasssecandgroup(val)
  
  { this.subject_id = val;
   if(val!='')
      {
      const params = {

      "session_id": this.sessionid,
      "section_id":this.section_id,
      "subject_id":val,
      "token": this.token

    };
      this.http.post(this.myService.constant.apiURL + "groups/assignedgroups", params).subscribe(details => {

       this.group_list = details;
      if (this.group_list.response.status == '200') {

        this.group_list = this.group_list.response.data;
        // console.log(this.group_list);

      }
    });
    
   
  }

  }

  groupslist(){
        const params = {
     "user_id": this.userid,
     "school_id":this.schoolId,
     "token": this.token
    };
    this.http.post(this.myService.constant.apiURL + "groups/getgroupbyuserid", params).subscribe(details => {
       this.grplist = details;
       this.grouplists = this.grplist.response;
       this.grouplistsdisplay = true;
    });

  }
closeme(){
  this.responseMessage = false;
    const params = {
     "user_id": this.userid,
     "school_id":this.schoolId,
     "token": this.token
    };
    this.http.post(this.myService.constant.apiURL + "groups/getgroupbyuserid", params).subscribe(details => {
       this.grplist = details;
       this.grouplists = this.grplist.response;
       this.grouplistsdisplay = true;
    });
}
  deletegroup(groupId)
{
     const params = {
     "user_id": this.userid,
     "group_id":groupId,
     "token": this.token
    };

 this.http.post(this.myService.constant.apiURL + "groups/groupdeletebyid", params).subscribe(details => {
        this.popmessage = details;
      if (this.popmessage.response.status == '200') {
        this.responseMessage = true;
        this.popmessage = this.translate.instant(this.popmessage.response.message);
      }
    });
}

}
