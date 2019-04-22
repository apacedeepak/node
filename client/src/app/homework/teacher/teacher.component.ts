import { Component, OnInit } from '@angular/core';
import { Headers,  Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {

  public homework_class_id: any;
  public homework_section_id: any;
  public homework_subject_id: any;
  public homework_section_name: any;
  public sessionid: any;
  public userid: any;
  public token: any;
  public homeworklist: any;
  public draftlist: any;
  public classlist: any;
  public sectionlist: any;
  public subjectlist: any;
  public homeworkDetail: any;
  public subject_id: any;
  public class_id: any;
  public class_name: any;
  public section_id: any;
  public class_sec_list: any;
  public ishomeworkexist: boolean = false;
  public displayafter: boolean = false;
  public isdraftexist: boolean = false;
  public calval: any = {};
  public fromDate: any;
  public toDate: any;
  public hoveredDate: any;
  public showcalander: boolean = false;
  public showdaterange: boolean = false;
  public fromrange: any = '';
  public torange: any = '';
  public schoolid: any = '';
  public responsedata: any = '';
  public product_type : any = '';
  public place : any = 'homework';
 public homeclass : any = 'active';
 public draftclass : any = '';
 public homeclassdiv : any = 'tab-pane active';
 public draftclassdiv : any = 'tab-pane';
 mylang:any=''; 


  constructor(private http: HttpClient, private myService: BackendApiService, calendar: NgbCalendar,private activatedRoute: ActivatedRoute,private translate: TranslateService) {
    // this.fromDate = calendar.getToday();
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
     this.activatedRoute.queryParams.subscribe(params => {
              this.place = params['place'];
          });
  }

  ngOnInit() {
    // this.homeworkexist = true;
    //  this.draftexist = false;
    if(this.place && this.place=='draft')
      {
        this.draftclass = 'active';
        this.homeclass = '';
        this.homeclassdiv = 'tab-pane';
        this.draftclassdiv = 'tab-pane active';
      }
    this.sessionid = window.localStorage.getItem('session_id');
    this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.homework_class_id = window.localStorage.getItem('homework_class_id');
    this.homework_section_id = window.localStorage.getItem('homework_section_id');
    this.homework_subject_id = window.localStorage.getItem('homework_subject_id');
    this.homework_section_name = window.localStorage.getItem('homework_section_name');
    this.class_name = window.localStorage.getItem('homework_class_name');
    this.schoolid = window.localStorage.getItem('school_id');
    this.product_type = window.localStorage.getItem('product_type');
    this.ishomeworkexist = false;
    if (this.homework_class_id != null && this.homework_section_id == null && this.homework_subject_id == null) {

      this.setalldropdown(this.homework_class_id, undefined, undefined);

    }
    else if (this.homework_class_id != null && this.homework_section_id != null && this.homework_subject_id == null) {

      this.setalldropdown(this.homework_class_id, this.homework_section_id, undefined);

    }
    else if (this.homework_class_id != null && this.homework_section_id != null && this.homework_subject_id != null) {

      this.setalldropdown(this.homework_class_id, this.homework_section_id, this.homework_subject_id);

    }
    else {
      this.class_id = '';
      this.section_id = '';
      this.subject_id = '';
      this.getassignedclass();
      this.getallhomework();
      this.getalldraft();
    }


  }
  onDateChange(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    }  else if (this.fromDate && !this.toDate && equals(date, this.fromDate)) {
      this.toDate = this.fromDate;
    }
    else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.fromDate != null && this.fromDate != null != undefined && this.toDate != null && this.toDate != undefined) {
      this.showdaterange = true;
      this.showcalander = false;
      let f_year = this.fromDate.year;
      let f_month = this.fromDate.month < 10 ? '0' + this.fromDate.month : this.fromDate.month;
      let f_day = this.fromDate.day < 10 ? '0' + this.fromDate.day : this.fromDate.day;
      this.fromrange = f_year + "-" + f_month + "-" + f_day;
      let t_year = this.toDate.year;
      let t_month = this.toDate.month < 10 ? '0' + this.toDate.month : this.toDate.month;
      let t_day = this.toDate.day < 10 ? '0' + this.toDate.day : this.toDate.day;
      this.torange = t_year + "-" + t_month + "-" + t_day;
      this.getallhomework();
      this.getalldraft();

    }

  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  getassignedclass() {


    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id":this.schoolid,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {

      this.classlist = details;
      if (this.classlist.response_status.status == '200') {

        this.classlist = this.classlist.response.assigned_classes;
       



      }


    });
    //});
  }
  getassignedsection(val) {
    this.class_id = val;
    
    this.section_id = '';
    this.subject_id = '';
    if (val != '') {
      const params = {
        "user_id": this.userid,
        "session_id": this.sessionid,
        "class_id": val,
        "token": this.token

      };
       for(let key in this.classlist)
          {
            if(this.classlist[key].class_id==val)
              {
                this.class_name = this.classlist[key].class_name;
                window.localStorage.setItem('homework_class_name',this.class_name);
              }
          }
      window.localStorage.setItem('homework_class_id', val);
      window.localStorage.removeItem('homework_section_id');
      window.localStorage.removeItem('homework_section_name');
      window.localStorage.removeItem('homework_subject_id');
      //this.myService.checkToken().then((token) =>{
      this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

        this.sectionlist = details;
        if (this.sectionlist.response_status.status == '200') {

          this.sectionlist = this.sectionlist.response.assigned_sections;

          this.subjectlist = [];

        }



      });
      //});
    }
    else {
      window.localStorage.removeItem('homework_class_id');
      window.localStorage.removeItem('homework_class_name');
      window.localStorage.removeItem('homework_section_id');
      window.localStorage.removeItem('homework_section_name');
      window.localStorage.removeItem('homework_subject_id');
      this.class_id = val;
      this.sectionlist = [];
      this.subjectlist = [];
      this.class_sec_list = [];
    }
    this.getallhomework();
    this.getalldraft();
  }

  getassignedsubject(val, labelval) {
    this.section_id = val;

    this.subject_id = '';
    if (val != '') {
      const params = {
        "user_id": this.userid,
        "session_id": this.sessionid,
        "section_id": val,
        "token": this.token

      };
      if (labelval != undefined) {
         
        window.localStorage.setItem('homework_section_name', labelval[labelval.selectedIndex].label);
      }
      // else if (labelval == undefined && this.homework_section_name != null && this.homework_section_name != '') {
      //   window.localStorage.setItem('homework_section_name', this.homework_section_name);
      // }
      window.localStorage.setItem('homework_section_id', val);
      window.localStorage.removeItem('homework_subject_id');
      //this.myService.checkToken().then((token) =>{
      this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

        this.subjectlist = details;
        if (this.subjectlist.response_status.status == '200') {

          this.subjectlist = this.subjectlist.response.assigned_subjects;



        }



      });
      //});
    }
    else {
      this.subjectlist = [];
      this.class_sec_list = [];
      window.localStorage.removeItem('homework_section_id');
      window.localStorage.removeItem('homework_section_name');
      window.localStorage.removeItem('homework_subject_id');
    }
    this.getallhomework();
    this.getalldraft();
  }
  setsubject(val) {
    this.subject_id = val;
    if (val != '') {
      window.localStorage.setItem('homework_subject_id', val);
    }
    else {
      window.localStorage.removeItem('homework_subject_id');
    }
    this.getallhomework();
    this.getalldraft();
  }
  getallhomework() {
    const params = {
      "user_id": this.userid,
      "class_id": this.class_id,
      "section_id": this.section_id,
      "subject_id": this.subject_id,
      "school_id":this.schoolid,
      "from_date": this.fromrange,
      "to_date": this.torange,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "homework/homework", params).subscribe(details => {

      
      this.homeworklist = details;
      if (this.homeworklist.response_status.status == '200') {

        this.homeworklist = this.homeworklist.response.homework;
        if (this.homeworklist.length > 0) {
          this.ishomeworkexist = true;
        }
        else {
          this.ishomeworkexist = false;
        }

      }



    });


  }

  getalldraft() {
    const params = {
      "user_id": this.userid,
      "class_id": this.class_id,
      "section_id": this.section_id,
      "subject_id": this.subject_id,
      "school_id":this.schoolid,
      "from_date": this.fromrange,
      "to_date": this.torange,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "homework/draft", params).subscribe(details => {
      this.responsedata = details;
      this.displayafter = true;
      if (this.responsedata.response_status.status == '200') {

        this.draftlist = this.responsedata.response;
        if (this.draftlist.length > 0) {
          this.isdraftexist = true;
        }
        else{
          this.isdraftexist = false;
        }

      }
    });


  }

  displaycal() {
    this.showcalander = true;
  }
  removerange() {
    this.toDate = null;
    this.fromDate = null;
    this.showdaterange = false;
    this.fromrange = '';
    this.torange = '';
    this.getallhomework();
    this.getalldraft();
  }

  setalldropdown(classid, sectionid, subjectid) {

    const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id":this.schoolid,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {

      this.responsedata = details;
      
      if (this.responsedata.response_status.status == '200') {
        this.class_id = classid;
        this.classlist = this.responsedata.response.assigned_classes;
        for(let key in this.classlist)
          {
            if(this.classlist[key].class_id==this.class_id)
              {
                this.class_name = this.classlist[key].class_name;
                window.localStorage.setItem('homework_class_name',this.class_name);
              }
          }
         if(classid)
          {
        const params = {
          "user_id": this.userid,
          "session_id": this.sessionid,
          "class_id": this.class_id,
           "token": this.token

        };
        this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

          this.responsedata = details;
          if (this.responsedata.response_status.status == '200') {

            if (sectionid) {
              this.section_id = sectionid;


            }
            this.sectionlist = this.responsedata.response.assigned_sections;

            if(sectionid)
              {
            const params = {
              "user_id": this.userid,
              "session_id": this.sessionid,
              "section_id": this.section_id,
               "token": this.token
            };

            this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

              this.subjectlist = details;
              if (this.subjectlist.response_status.status == '200') {

                this.subjectlist = this.subjectlist.response.assigned_subjects;
                if (subjectid) {
                  this.subject_id = subjectid;

                }
                this.getallhomework();
                this.getalldraft();
              }
            });

             }
          else
        {
              this.getallhomework();
              this.getalldraft();
        }

          }
        });


        }
      else
        {
              this.getallhomework();
              this.getalldraft();
        }

      }
    });
  }

}
