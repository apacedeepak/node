import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InputFileModule } from 'ngx-input-file';
import { Headers, Http, Request, RequestOptions, Response, XHRBackend } from '@angular/http';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NgForm, FormsModule, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
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
  selector: 'app-homeworklist',
  templateUrl: './homeworklist.component.html',
  styleUrls: ['./homeworklist.component.css']
})
@Injectable()
export class HomeworklistComponent implements OnInit {
  form: FormGroup;
  public loadFlag: any;
  public data: any;
  public sessionid: any;
  public userid: any;
  public token: any;
  public homeId: any;
  public section_id: any;
  public allactive: any = "active";
  public allactivediv: any = "tab-pane active";
  public pendactive: any = '';
  public pendactivediv: any = 'tab-pane';
  public subactive: any = '';
  public subactivediv: any = 'tab-pane';
  public unchkactive: any = '';
  public unchkactivediv: any = 'tab-pane';
  public chkactive: any = '';
  public chkactivediv: any = 'tab-pane';
  public callfrom: any;
  public fromDate: any;
  public toDate: any;
  public hoveredDate: any;
  public showcalander: boolean = false;
  public showdaterange: boolean = false;
  public fromrange: any = '';
  public torange: any = '';
  public searchforval: any = 'assignment';
  public search_for: any = '';
  public subjectlist: any = '';
  public subject_id: any = '';
  public pendingcond: boolean = false;
  public allhomecond: boolean = false;
  public checkedcond: boolean = false;
  public uncheckedcond: boolean = false;
  public submittedcond: boolean = false;
  public currentDate: any = '';
  public usertype: any = '';
  public fromrangeset: any = '';
  public torangeset: any = '';
  public flagfor: any = '';
  public flag: any = '';
  public class_id : any;
  public subjectsearcharr = [];
  public ApiUrl = 'homework/studenthomework';
  public responsedataall:any = '';
  public assignclass :any = '';
  public schoolId :any = '';
  public studentSectionId : any = '';
  mylang:any=''; 

  //public apiurldetails = 'homework/homeworkdetail';

  constructor(private http: HttpClient, private myService: BackendApiService, activatedRoute: ActivatedRoute,private fb: FormBuilder,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
    activatedRoute.queryParams.subscribe(params => {
      this.flag = params['flag'];
      this.callfrom = params['calledfrom'];
      // alert(this.callfrom);

    });
     if (this.flag == 'back' && this.callfrom == 'normal') {
      
      if(window.localStorage.getItem('torangedate')!=null && window.localStorage.getItem('fromrangedate')!=null && window.localStorage.getItem('searchfor')!=null)
        {
          this.showdaterange = true;
      this.torange = window.localStorage.getItem('torangedate');
      this.fromrange = window.localStorage.getItem('fromrangedate');
      this.search_for = window.localStorage.getItem('searchfor');
      
        }
    if(window.localStorage.getItem('subjectsearch')!=null)
        {
          this.subjectsearcharr =JSON.parse(window.localStorage.getItem('subjectsearch'));
           let temparr = [];
            for(let key in this.subjectsearcharr)
              {
                temparr.push(this.subjectsearcharr[key].id);
              }
          this.subject_id = temparr.join();
      
      
      
        }
     
    }
    else{
      
      window.localStorage.removeItem('torangedate');
      window.localStorage.removeItem('fromrangedate');
      window.localStorage.removeItem('searchfor');
      window.localStorage.removeItem('subjectsearch');
      }
    if (this.flag == 'back' && this.callfrom == 'pending')
      {
        this.allactive = '';
        this.allactivediv = 'tab-pane';
        this.subactive = '';
        this.subactivediv = 'tab-pane';
        this.unchkactive = '';
        this.unchkactivediv = 'tab-pane';
        this.chkactive = '';
        this.chkactivediv = 'tab-pane';
        this.pendactive = 'active';
        this.pendactivediv = 'tab-pane active';
      }
      if (this.flag == 'back' && this.callfrom == 'submitted')
      {
        this.allactive = '';
        this.allactivediv = 'tab-pane';
        this.subactive = 'active';
        this.subactivediv = 'tab-pane active';
        this.unchkactive = '';
        this.unchkactivediv = 'tab-pane';
        this.chkactive = '';
        this.chkactivediv = 'tab-pane';
        this.pendactive = '';
        this.pendactivediv = 'tab-pane';
      }
      if (this.flag == 'back' && this.callfrom == 'unchecked')
      {
        this.allactive = '';
        this.allactivediv = 'tab-pane';
        this.subactive = '';
        this.subactivediv = 'tab-pane';
        this.unchkactive = 'active';
        this.unchkactivediv = 'tab-pane active';
        this.chkactive = '';
        this.chkactivediv = 'tab-pane';
        this.pendactive = '';
        this.pendactivediv = 'tab-pane';
      }
      if (this.flag == 'back' && this.callfrom == 'checked')
      {
        this.allactive = '';
        this.allactivediv = 'tab-pane';
        this.subactive = '';
        this.subactivediv = 'tab-pane';
        this.unchkactive = '';
        this.unchkactivediv = 'tab-pane';
        this.chkactive = 'active';
        this.chkactivediv = 'tab-pane active';
        this.pendactive = '';
        this.pendactivediv = 'tab-pane';
      }
    this.getdata();
  }

  getdata() {
    this.usertype = window.localStorage.getItem('user_type');
    if (this.usertype == 'Parent') {
      this.userid = window.localStorage.getItem('student_user_id');
    } else {
      this.userid = window.localStorage.getItem('user_id');
    }
    this.sessionid = window.localStorage.getItem('session_id');
    this.token = window.localStorage.getItem('token');

    this.flagfor = window.localStorage.getItem('flagfor');
    this.studentSectionId = window.localStorage.getItem('student_section_id');
    

    const params = {
      'user_id': this.userid,
      'search_for': this.search_for,
      'from_date': this.fromrange,
      'to_date': this.torange,
      'subject_id' : this.subject_id,
      'token': this.token,
      'section_id' : this.studentSectionId
    };

    this.http.post(this.myService.constant.apiURL + this.ApiUrl, params).subscribe(details => {
      this.responsedataall = details;
      this.data = this.responsedataall;
      let pendingflag = false;
      let submittedflag = false;
      let uncheckedflag = false;
      let checkedflag = false;
      if (this.data.response_status.status == '200') {
        if (this.data.response.length > 0) {
          this.allhomecond = true;
          this.responsedataall.response.forEach((responsedata) => {
        if (responsedata.submitted == 0) {
          pendingflag = true;

        }
        if (responsedata.submitted == 1 && responsedata.checked == 0) {
          submittedflag = true;
          
        }
        if (responsedata.submitted == 1 && responsedata.checked == 0) {
          uncheckedflag = true;
          
        }
        if (responsedata.submitted == 1 && responsedata.checked == 1) {
          checkedflag = true;
          
        }
      });
      if (pendingflag) {
        this.pendingcond = true;
      }
      else {
        this.pendingcond = false;
      }
      if (submittedflag) {
        this.submittedcond = true;
      }
      else {
        this.submittedcond = false;
      }
      if (uncheckedflag) {
        this.uncheckedcond = true;
      }
      else {
        this.uncheckedcond = false;
      }
      if (checkedflag) {
        this.checkedcond = true;
      }
      else {
        this.checkedcond = false;
      }

        }
        else {
          this.allhomecond = false;
          this.pendingcond = false;
          this.submittedcond = false;
          this.uncheckedcond = false;
          this.checkedcond = false;
        }
      }
      
    })

    // homelist.submitted == 1
  }
  ngOnInit() {
    
     this.schoolId = window.localStorage.getItem('school_id');
    this.form = this.fb.group({

      subjectlistcheckBox: this.fb.array([]),
      

    })
    this.getassignedsubject();
   
  }
  onDateChange(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    }else if (this.fromDate && !this.toDate && equals(date, this.fromDate)) {
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
     // this.showcalander = false;
      (<any>$('#allcalender')).modal('hide');
      let f_year = this.fromDate.year;
      let f_month = this.fromDate.month < 10 ? '0' + this.fromDate.month : this.fromDate.month;
      let f_day = this.fromDate.day < 10 ? '0' + this.fromDate.day : this.fromDate.day;
      this.fromrange = f_year + "-" + f_month + "-" + f_day;
      let t_year = this.toDate.year;
      let t_month = this.toDate.month < 10 ? '0' + this.toDate.month : this.toDate.month;
      let t_day = this.toDate.day < 10 ? '0' + this.toDate.day : this.toDate.day;
      this.torange = t_year + "-" + t_month + "-" + t_day;
      if (this.search_for == '')
        {
        this.search_for = 'assignment';
        }
      window.localStorage.setItem('fromrangedate', this.fromrange);
      window.localStorage.setItem('torangedate', this.torange);
      window.localStorage.setItem('searchfor', this.search_for);
      this.getdata();

    }
    

  }



  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  displaycal() {
      (<any>$('#allcalender')).modal('show');
    //this.showcalander = true;
  }
  removerange() {
    this.toDate = null;
    this.fromDate = null;
    this.showdaterange = false;
    this.fromrange = '';
    this.torange = '';
    this.search_for = '';
    window.localStorage.removeItem('torangedate');
    window.localStorage.removeItem('fromrangedate');
    window.localStorage.removeItem('searchfor');
    this.getdata();
  }
  //  removeSelection(){ alert('fdds')
  //   this.showdaterange = false;

  //   }
  searchfor(val) {
    if(this.searchforval!=val)
      {
        this.removerange();
        this.searchforval = val;
        this.search_for = val;
      }
  }
    getassignedsubject() {

      const params = {
      "user_id": this.userid,
      "session_id": this.sessionid,
      "school_id":this.schoolId,
      "token": this.token

    };
    //this.myService.checkToken().then((token) =>{
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {
     
    this.assignclass = details;
     if (this.assignclass.response_status.status == '200') {
       this.class_id = this.assignclass.response.assigned_classes[0].class_id;
       if(this.class_id)
        {
              const params = {
            "user_id": this.userid,
            "session_id": this.sessionid,
            "class_id":this.class_id,
             "token": this.token

        };
            this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {

      this.assignclass = details;
      if (this.assignclass.response_status.status == '200') {

        this.section_id = this.assignclass.response.assigned_sections[0].section_id;

        if(this.section_id)
          {
                  const params = {
            "user_id": this.userid,
            "session_id": this.sessionid,
            "section_id":this.section_id,
            "token": this.token
          };

          this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {

        this.subjectlist = details;
        if (this.subjectlist.response_status.status == '200') {

          this.subjectlist = this.subjectlist.response.assigned_subjects;
          this.subjectlist.forEach(element => {
                  const control1 = new FormControl(false);
                  (<FormArray>this.form.get('subjectlistcheckBox')).push(control1);

                });

        }
       });

      }
    
    }
       });


     }
           
    }
});
    }

    setsubject(subjectid, subjectname, event) {
      if (this.subjectsearcharr.length == 0 && event.target.checked) {
        this.subjectsearcharr.push({ 'id': subjectid, 'name': subjectname })
      }
      else {
        if (event.target.checked) {
          let existflag = false;
         
           for (let key in this.subjectsearcharr) {
          if(this.subjectsearcharr[key].id==subjectid)
            {
              existflag = true;
             
            }
          

        }
          if(!existflag)
            {
          this.subjectsearcharr.push({ 'id': subjectid, 'name': subjectname });
            }
        }
        else{
          let existflag = false;
          let existposition = 0;
          let counter = 0;
        for (let key in this.subjectsearcharr) {
          if(this.subjectsearcharr[key].id==subjectid)
            {
              existflag = true;
              existposition = counter;
            }
            counter++;

        }
          if(existflag)
              {
                this.subjectsearcharr.splice(existposition,1);
              }
        }
      }
      if(this.subjectsearcharr.length==0)
        {
           this.subject_id = '';
           window.localStorage.removeItem('subjectsearch');
        }
        else{
          let temparr = [];
            for(let key in this.subjectsearcharr)
              {
                temparr.push(this.subjectsearcharr[key].id);
              }
          this.subject_id = temparr.join();
          window.localStorage.setItem('subjectsearch', JSON.stringify(this.subjectsearcharr));
        }
      this.getdata();
    }

    removesubject(subjectid) {

      let existflag = false;
      let existposition = 0;
      let counter = 0;
      for (let key in this.subjectsearcharr) {
        if (this.subjectsearcharr[key].id == subjectid) {
          existflag = true;
          existposition = counter;
        }
        counter++;

      }
      if (existflag) {
        this.subjectsearcharr.splice(existposition, 1);
        
        
          this.subjectlist.forEach((element,key) => {
                  if(element.subject_id == subjectid){
                        (<FormArray>this.form.get('subjectlistcheckBox')).controls[key].setValue(false);
                  }

                });
      }

       if(this.subjectsearcharr.length==0)
        {
          this.subject_id = '';
          window.localStorage.removeItem('subjectsearch');
        }
        else{
           let temparr = [];
            for(let key in this.subjectsearcharr)
              {
                temparr.push(this.subjectsearcharr[key].id);
              }
          this.subject_id = temparr.join();
          window.localStorage.setItem('subjectsearch', JSON.stringify(this.subjectsearcharr));
        }
      this.getdata();

    }
}
