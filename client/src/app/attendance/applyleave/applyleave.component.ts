import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as Rx from 'rxjs';

import * as $ from 'jquery';
import * as moment from 'moment';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Component({
  selector: 'app-applyleave',
  templateUrl: './applyleave.component.html',
  styleUrls: ['./applyleave.component.css']
})
export class ApplyleaveComponent implements OnInit {
  public emplid = '';
    public yearId = '';
    public submittedTo = '';
    public submittedId = '';
    public staffName = '';
    public yearSession = '';
    public departmentId = '';
    public leaveSchemeId = '';
    public userId = '';
    public departmentName = '';
    public designationName = '';
    public staffCode = '';
    public leaveAppliedDetails: any = '';
    public details: any = '';
    public halfday = 0;
    public leaveAlreadyFlag = 0;
    public leaveTypeFlag = 0;
    public fromDateFlag = 0;
    public leavedetails:any=[];
    public toDateFlag = 0;
    public reasonFlag = 0
    public levedetails:any=[];
    public fromDate: any;
    public fromDateFlags: boolean = false;
    public toDateFlags: boolean = false;
    public showcalander: boolean = false;
    public callflag: boolean = false;

public toDate: any;
    public dateError = 0;
    public dateRangeError = 0;
    public minDaysError = 0;
    public staffdet :any=[];
    rForm: FormGroup;
    tableForm: FormGroup;
    loggedinId = '';
    schoolAutoId = '';
    public staffdetails:any;
    staffcodeflag = 0;
    staffCodeError = 0;
    ldetails: any = '';
    dateA:any='';
    comparisonfllag:any='';
    today:any='';
    loadFlag: any = '';
   public leaveflag = false;
   public staffid:any;
   public appliedLeaveFlag = false;
   public user_id:any;
   public rolename:any = '';
   public yyyy:any;
public date:any;
financeid:any;
startdate:any;
enddate:any;
public userType:any;
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder) { }
  
  ngOnInit() {
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.date=new Date();
    this.yyyy = this.date.getFullYear();
    this.loggedinId = window.localStorage.getItem('current_user');
    this.schoolAutoId = window.localStorage.getItem('school_id');
    this.user_id=window.localStorage.getItem('user_id');
    this.rForm = new FormGroup({
        empCode: new FormControl('', [Validators.required, Validators.pattern("/^[a-zA-Z]*$/")])
    });
    this.tableForm = new FormGroup({
        leavetypeid: new FormControl(''),
        fromdate: new FormControl(''),
        todate: new FormControl(''),
        leaveyear: new FormControl('', Validators.required),
        reason: new FormControl(''),
        rolename: new FormControl(''),
        submittedid: new FormControl(''),
        halfdayStart: new FormControl(0),
        halfdayEnd: new FormControl(0),
    });
    const dataval = {
      'user_id': this.user_id
  };
  this.http.post(this.myService.constant.apiURL+"staffs/staffdetailsbyuserid", dataval).subscribe(data => {
const details:any=data;
this.staffdetails=details.response;


this.rolename=this.staffdetails.reporter.role_name;
  this.tableForm.patchValue({rolename: this.rolename});
    console.log(this.rolename);
    this.submittedId=this.staffdetails.reporter.id;
  
  this.http.post(this.myService.constant.apiURL+"leave_details/userbalanceleaves", dataval).subscribe(data => {
    const expenses: any = data;   

        this.details=expenses.response;
       console.log( this.details);
  
        if (this.details.length == 0) {
            this.staffCodeError = 1;
            this.appliedLeaveFlag = false;
            this.leaveflag = false;
            this.loadFlag = 0;
            return;
        }
   
        this.staffcodeflag = 0;
        this.leaveflag = true;
        this.loadFlag = 0;
        this.appliedLeaveFlag = true;
        this.staffCodeError = 0;
        // this.details.forEach(element => {
            this.details.forEach(element => {
                this.leaveSchemeId=element.leave_schemeId;
            });
        // });
        this.emplid = this.details.staffdetails.staff_id;
        this.yearId = this.details.yeardetails.id;

        this.userId = this.details.staffdetails.user_id;
        this.departmentId = this.details.staffdetails.department_id;
      
     
      

    });
    
  });
  var date=new Date();
  var yy=date.getFullYear();
  var mm=date.getMonth()+1;
  var dd=date.getDate();
   var datevar= yy+'-'+mm+'-'+dd;
  var dateparse=Date.parse(datevar);
  this.http.get(this.myService.constant.apiURL+"financial_years/getleaveyear").subscribe(data => {
      

    const yeardetails = data['response'];
    const val=yeardetails['staffYearDetails']
    console.log(val);
    var arr= val;
    arr.forEach(element => {
        console.log(element);
        var parsestart=Date.parse(element.start_date);
        var parsesend=Date.parse(element.end_date);
       if(parsestart<dateparse && dateparse<parsesend){
         this.financeid=element.id
         this.startdate=element.start_date.substring(0, 4);;
         this.enddate=element.start_date.substring(0, 4);
       }
    });
});
  }
  onSubmit(form: any): void {

    form['empCode'] = form['empCode'].replace(/\s+/g, ' ').trim();
    if (form['empCode'] == '') {
        this.staffcodeflag = 1;
        this.appliedLeaveFlag = false;
            this.leaveflag = false;
        return;
    }
    this.staffCode = form['empCode'];
    // const data = {
    //     'staff_code': form['empCode']
    // };

    // const reqst = this.http.post(this.useridbystaffcode, data);
    // reqst.subscribe(data => {
    //     this.staffdet=data;
    //     this.staffdetails=this.staffdet.response;
     
    //     this.submittedId=this.staffdet.response.reporting_role
    //     this.staffdet=this.staffdet.response.userId;
    //     this.loadFlag = 1;
       

  
     
    // });
   
  

}
onSubmitDetail(tform: any): void {
  console.log("hello");
    this.leaveTypeFlag = 0;
    this.fromDateFlag = 0;
    this.toDateFlag = 0;
    this.reasonFlag = 0;
    this.dateError = 0;
    this.dateRangeError = 0;
    this.minDaysError = 0;
    this.leaveAlreadyFlag = 0;
   
    (<HTMLInputElement> document.getElementById("leave_erro")).textContent = "";
    if (tform['leavetypeid'] == '') {
        this.leaveTypeFlag = 1;
        return;
    } else if (tform['fromdate'] == '') {
        this.fromDateFlag = 1;
        return;
    } else if (tform['todate'] == '') {
        this.toDateFlag = 1;
        return;
    } else if (tform['reason'] == '') {
        this.reasonFlag = 1;
        return;
    }
    if(tform['fromdate'] > tform['todate']){
        this.comparisonfllag="notvalid";
        return;
    }
    else{
        this.comparisonfllag="";
    }

    const data = {
        'leave_masterId': tform['leavetypeid'],
        'halfday_start': tform['halfdayStart'],
        'halfday_end': tform['halfdayEnd'],
      
        'leave_schemeId': this.leaveSchemeId,
        'userId':  this.user_id,
        'from_date': tform['fromdate'],
        'to_date': tform['todate'],
        'cause': tform['reason'],
        'financial_yearId': tform['leaveyear'],
        'reporting_to': this.submittedId,
        'logginid': this.loggedinId,
        'school_auto_id': this.schoolAutoId,
    }

    this.loadFlag = 1;
    this.http.post(this.myService.constant.apiURL+"leave_applies/applyleave", data).subscribe(data => {
      const datas: any = data;   
  
    

        this.ldetails = datas;
 
        console.log(this.ldetails.response_status.message);
       
        if (this.ldetails.response_status.message == "leave marked successfully") {
            this.details = this.ldetails;
            this.halfday = 0;
            this.leaveTypeFlag = 0;
            this.fromDateFlag = 0;
            this.toDateFlag = 0;
            this.reasonFlag = 0;

        }

        this.loadFlag = 0;
        if (this.ldetails.response_status.message == "Leave already applied") {
            this.leaveAlreadyFlag = 1;
            return;
        } else if (this.ldetails.response_status.message == "leave marked successfully") {
           
            this.tableForm = new FormGroup({
                leavetypeid: new FormControl(''),
                fromdate: new FormControl(''),
                todate: new FormControl(''),
                reason: new FormControl(''),
                submittedid: new FormControl(''),
                halfdayStart: new FormControl(0),
                halfdayEnd: new FormControl(0),
            });
            alert("leave applied successfully");
            window.location.reload();
        }else if (this.ldetails.response_status.message  == "cannot apply leave") {
            console.log("hi");
            alert("you dont have enough leaves");
            // (<HTMLInputElement> document.getElementById("leave_erro")).textContent = "Leave can't be apply";
            return;
        }  
        else if (this.ldetails.responseMessage == "End date can't be less then start date") {
            this.dateError = 1;
            return;
        } else if (this.ldetails.responseMessage == "You are exceeding your leave limits") {
            this.dateRangeError = 1;
            return;
        } else if (this.ldetails.responseMessage == "Cannot apply for leave") {
            (<HTMLInputElement> document.getElementById("leave_erro")).textContent = "Leave can't be apply ";
            return;
        } 

        // window.location.reload();

    });

   
}
getHalfday(val, json) {

    this.halfday = 0;
    
    for (let i = 0; i < json.length; i++) {
        if (json[i].leave_id == val) {
            if (json[i].halfday_applicable == true) {
                this.halfday = 1;
            }
        }
    }
}
displaycal() {
    this.showcalander = true;
  this.fromDateFlags=true;
  this.toDateFlags=false;
  }
  displaycal2() {
    this.showcalander = true;
  this.toDateFlags=true;
  this.fromDateFlags=false;
  }
onDateChange(date: NgbDateStruct, type) {
    this.showcalander = false;
    if(type == 'from'){
      this.fromDate = date;
      let f_year = this.fromDate.year;
      let f_month = this.fromDate.month < 10 ? '0' + this.fromDate.month : this.fromDate.month;
      let f_day = this.fromDate.day < 10 ? '0' + this.fromDate.day : this.fromDate.day;
      this.dateA = f_year + "-" + f_month + "-" + f_day;
    //   if(this.toDate && this.dateA > this.today){
    //     alert('Please select to date more than or equal to from date');
    //    // this.dateA = this.toDate;
    //     return false;
    //   }
      
    }
    if(type == 'to'){ 
      this.toDate = date;
      let t_year = this.toDate.year;
      let t_month = this.toDate.month < 10 ? '0' + this.toDate.month : this.toDate.month;
      let t_day = this.toDate.day < 10 ? '0' + this.toDate.day : this.toDate.day;
      this.today = t_year + "-" + t_month + "-" + t_day;
   
    //   if(this.dateA > this.today){
    //     alert('Please select to date more than or equal to from date');
    //     //this.toDate = this.dateA;
    //     return false;
    //   }
    }
    console.log(this.dateA);
    console.log(this.today);
    this.tableForm.patchValue({fromdate: this.dateA,todate: this.today});
    
  }
 
}
