import { Component, OnInit, ViewChild, AfterContentInit } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as Rx from 'rxjs';
import * as $ from 'jquery';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-fullcalendar',
  templateUrl: './fullcalendar.component.html',
  styleUrls: ['./fullcalendar.component.css']
})
export class FullcalendarComponent implements OnInit,AfterContentInit {
  myForm: FormGroup;
  public userType : any;
  public pcount : any = 0;
  public acount : any = 0;
  public ppcount : any = 0;
  public lcount : any = 0;
  public total : any = 0;
  public globalObj: any = {};
  public today: any;
  public dd: any;
  public mm : any;
  public yyyy: any;
  public index: any;
  public todaydate: any;
  public attendance_date: any;
  public monthName: any;
  public attendance_status: any;
  public subject_id: any = '';
  public attendancelist: any = {};
  public eventobj: any = {};
  public counts: any = {};
  public eventdata : Array<any> = new Array<any>();
  public subjectlist: any = {};
  public section_id_list: any = {};
  public section_id: any;
  public token: any;
  popupmessage: any = '';
  popupflag: boolean = false;
  todate: any;
  fromdate: any;
  details: any = "";
  reason: any = "";
  markedleavelist: any = [];
  markedleavelistCount: any = 0;
  dponeField: FormControl;
  dptwoField: FormControl;
  reasonField: FormControl;
  detailsField: FormControl;
  dpone: any;
  dptwo: any;
  selectedreason: boolean = false;
  countslag: any = [];
  alreadyleavecheck: any = [];
  product_type : any = '';
  holidayList: any = [];
  eventList: any = [];
  public event_arr : Array<any> = new Array<any>();
  public holiday_arr : Array<any> = new Array<any>();
  holidaydata: any = [];
  val: any;
  events: any = [];
  leave_reason_list: any = [];
  reasonlist: any = [];
  btnflag: boolean = false;
  msgtype: any;
  calendarOptions: Options;
  month: any = "";
  mylang:any='';
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }
  @ViewChild(CalendarComponent) ucCalendar1: CalendarComponent;
  holiday_obj:any={};
  defaultConfig : object = {
    header: {
        left: "prev",
        right: "next",
        center: "title"
    },
    editable: true,
    eventLimit: true, 
    navLinks: true,
    events: [
      {
        start: ""
      }
    ]
  };

  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder,private translate: TranslateService) {
      this.userType = window.localStorage.getItem('user_type').toLowerCase();
      this.product_type = window.localStorage.getItem('product_type');
      //this.product_type = 'emscc'; // to be commented on production
      this.token = window.localStorage.getItem('token');
      this.mylang= window.localStorage.getItem('language');
   
      if(this.mylang){
       translate.setDefaultLang( this.mylang);}
       else{
         translate.setDefaultLang( 'en');
       }
  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {
    this.selectedreason = true;

    this.myForm = this.formBuilder.group({
        reason: [null, [Validators.required]],
        details: [null, [Validators.required]],
    });
    this.myForm.valueChanges
        .subscribe(term => {
        this.reason = this.myForm.value.reason;
        this.details = this.myForm.value.details;
    }); 

    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.globalObj.sessionid = window.localStorage.getItem('session_id');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    if(this.userType == "student"){
        this.globalObj.userid = window.localStorage.getItem('user_id');
    }
    else{
        this.globalObj.userid = window.localStorage.getItem('student_user_id');
    }
    
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.class_teacher_section_id = window.localStorage.getItem('class_teacher_section_id');
   
    this.setleavedaterange();

    this.dponeField = new FormControl();
    this.dponeField.valueChanges
          .subscribe(term => {
            this.dpone = this.getdate(term.day, term.month, term.year);
          });

    this.dptwoField = new FormControl();
    this.dptwoField.valueChanges
           .subscribe(term => {
                this.dptwo = this.getdate(term.day, term.month, term.year);
                if(this.dptwo<this.dpone){
                   
                    this.popupmessage =     this.translate.instant('to_date_cannot_greater_from_date');
                    this.popupflag = true;
         
                    // this.dptwo=
                 
                    return;
                   
                }
            });

    const parms = {
       "user_id": this.globalObj.userid,
       "token": this.token
    }

    this.http.post(this.myService.constant.apiURL + "user_sections/sectionbyuserid", parms).subscribe(details => {
        this.section_id_list = details;
        for(let i in this.section_id_list.response){
            if(this.section_id_list.response[i].status == "Active"){
               this.section_id = this.section_id_list.response[i].sectionId;
            }
        }

        const params = {
         "user_id": this.globalObj.userid,
         "session_id": this.globalObj.sessionid,
         "section_id": this.section_id,
         "token": this.token
       };


        this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {
         this.subjectlist = details;
         if (this.subjectlist.response_status.status == '200') {
           this.subjectlist = this.subjectlist.response.assigned_subjects;
         }
       });
    });

    this.getleavelist();
    this.getreasonlist();
    this.getholidayeventlist(this.yyyy, this.mm);
  }


  setleavedaterange(){
    this.today = new Date();
    this.dd = this.today.getDate();
    this.mm = this.today.getMonth();
    this.yyyy = this.today.getFullYear();
    this.todaydate = this.yyyy+'-'+this.mm+'-'+this.dd;
    this.getmonthlyattendance(this.mm, this.yyyy);
    this.dpone = this.getdate(this.dd, this.mm+1, this.yyyy);
    this.dptwo = this.getdate(this.dd, this.mm+1, this.yyyy);
  }

  getreasonlist(){
    const parms = { 
            "school_id": window.localStorage.getItem('school_id') 
        }
 
     this.http.post(this.myService.constant.apiURL + "leave_reasons/leavereason", parms).subscribe(details => {
         this.leave_reason_list = details;

         if(this.leave_reason_list.response_status.status == '200'){
            this.reasonlist = this.leave_reason_list.response.reason
         }
     });  
  }

  getdate(day, month, year){
    let todaydate;
    if(day<10){
        day='0'+day;
    } 
    if(month<10){
        month='0'+month;
    } 
    todaydate = year+'-'+month+'-'+day;
    return todaydate;  
  }

  getleavelist(){

    const params = {
        "session_id": this.globalObj.sessionid,
        "user_id": this.globalObj.userid,
        "school_id": this.globalObj.schoolid,
        "token": this.globalObj.token
    };
      this.http.post(this.myService.constant.apiURL + "user_sections/getsectionid", params).subscribe(details => {
        const data: any = details;  
        if(data.response_status == "200"){
            const params = {
                "session_id": this.globalObj.sessionid,
                "section_id": data.response.sectionId,
                "user_id": this.globalObj.userid,
                "school_id": this.globalObj.schoolid,
                "token": this.globalObj.token
            };
              this.http.post(this.myService.constant.apiURL + "leaveApplyStudents/getmarkedleave", params).subscribe(details => {
                    const data: any = details;    
                    this.markedleavelist = data.response;
                    this.markedleavelistCount = this.markedleavelist.length;
                    this.alreadyleavecheck.length = 0;
                    for(let i=0; i<this.markedleavelistCount; i++){
                        this.alreadyleavecheck.push(this.markedleavelist[i].from_date);
                    }
              });
        }
      });
    
  }

  closeme(msg){
    
      

      let msgarr = [
        this.translate.instant('attendance_already_marked'),
        this.translate.instant('leave_already_applied_date_range'),
        this.translate.instant('details_cannot_blank'),
        this.translate.instant('reason_cannot_blank'),
        this.translate.instant('to_date_cannot_greater_from_date')
        ];
        var today = new Date();
        var predate=today.getDate();
        var preMonth=today.getMonth()+1;
        var preYear=today.getFullYear();
        if(preMonth<10){
            this.dpone= preYear+'-0'+preMonth+'-'+predate;
        this.dptwo= preYear+'-0'+preMonth+'-'+predate;
        }
        else{
            this.dpone= preYear+'-0'+preMonth+'-'+predate;
            this.dptwo= preYear+'-'+preMonth+'-'+predate;
        }
      if(msgarr.indexOf(msg) >= 0) { 
        this.popupflag = false;
      }
      else if(this.msgtype == 1){
        this.popupflag = false;
        this.myForm.patchValue({reason: '', details: ''});  
        this.setleavedaterange();
        this.getleavelist(); 
        this.msgtype = 0;
        if(this.globalObj.editid){
            this.globalObj.editid = 0;
        }
      }
      else{
        location.reload();
      } 
  }

    markleaveexecute(params){
        return new Promise( (resolve, reject) => {
            this.http.post(this.myService.constant.apiURL + "leaveApplyStudents/markleave", params).subscribe(details => {
                resolve(details);
            });
        }).catch(err => console.log(err));
    }

    date_diff_indays (date1, date2) {
        let dt1 = new Date(date1);
        let dt2 = new Date(date2);
       
        return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
    }

  leaveapply(){
    let check = this.alreadyleavecheck.indexOf(this.dpone);
    
    if(check >= 0 && !this.globalObj.editid){ 
        this.popupmessage = this.translate.instant("leave_already_applied_date_range");
        this.popupflag = true;
        return;
    }
    else{
        if(!(this.date_diff_indays(this.dpone, this.dptwo) >= 0)){
            this.popupmessage =   this.translate.instant('to_date_cannot_greater_from_date');
            this.popupflag = true;
            return;
        }
        else if(!this.reason){ 
            this.popupmessage =    this.translate.instant('reason_cannot_blank');
            this.popupflag = true;
            return;
        }
        else if(!this.details){
            this.popupmessage =   this.translate.instant('details_cannot_blank');
            this.popupflag = true;
            return;
        }
               
                let params = {
                    "user_id": this.globalObj.userid,
                    "to_date": this.dptwo,
                    "from_date": this.dpone,
                    "session_id": this.globalObj.sessionid,
                    "reason": this.reason,
                    "details": this.details,
                    "addedDate": this.todaydate,
                    "school_id": this.globalObj.schoolid,
                    "added_by": this.globalObj.userid,
                    "token": this.token
                };
        
                if(this.globalObj.editid){
                    params['leave_id'] = this.globalObj.editid;
                    params['modefiedDate'] = this.todaydate;
                    params['modifiedBy'] = this.globalObj.userid;
                }
               
                        this.markleaveexecute(params).then( details => {
                            const data: any = details;
                            if(data.response.status == '200'){

                                this.popupmessage = this.translate.instant(data.response.message);
                                this.msgtype = 1;
                                this.popupflag = true;
                                this.btnflag = false;
                            }
                            else if(data.response.status == '201'){
                                this.popupmessage = this.translate.instant(data.response.message);
                                this.popupflag = true;
                            }
                        })
    
    }
  }


  clickButton1(val){


        let mnth, yr;
        const monthNames = [
            "January",
            "February",
            "March",
           "April",
            "May",
            "June",
            "July",
            "August",
           "September",
            "October",
           "November",
           "December",
        
                           ];
        let date = val.data._d;
        this.mm = date.getMonth();
        this.yyyy = date.getFullYear();
        let value = $('.fc-center').text().split(" ");
        if(val.buttonType == 'next'){
            this.val = '1'; 
        }
        if(val.buttonType == 'prev'){
            this.val = '0';
        }

        mnth = value[1].substr(4, value[1].length-1);
        yr = value[2];
     
        this.month = this.mm; 
        this.ucCalendar1.fullCalendar( 'removeEvents',this.holiday_obj );
        // $('#schoolcalendarbasic').fullCalendar('updateEvents');
        // console.log(this.mm +""+this.yyyy)
        // console.log(yr +monthNames.indexOf(mnth))

    $('#schoolcalendarbasic').fullCalendar('removeEvents');
    $('#schoolcalendarbasic').fullCalendar('removeEvents', this.holiday_obj);

        this.getmonthlyattendance(this.mm, this.yyyy);
        this.getholidayeventlist(yr, monthNames.indexOf(mnth));
  }  

  getinitialdates(year, month){
    var firstDay = moment([year, month]);
    var lastDay = moment(firstDay).endOf('month');
    return {"firstDay": firstDay, "lastDay": lastDay};
  }

  getholidayeventlist(year, month){

    this.event_arr.length = 0;
    this.holiday_arr=[];
    this.eventList.length = 0;
    this.holidayList.length = 0;
    this.holidaydata = [];
    
    let initialdates = this.getinitialdates(year, month);
    
    let firstDay = initialdates.firstDay;
    let lastDay = initialdates.lastDay;
    this.month =  moment(lastDay).format('MMMM');
    this.yyyy  =   moment(lastDay).format('YYYY');  

    const params = {
                        "applicable_for": "Student",
                        "school_id": this.globalObj.schoolid,
                        "from_date": firstDay,
                        "to_date": lastDay,
                    };
    this.http.post(this.myService.constant.apiURL+ "holiday_masters/getholidays", params).subscribe(details => {
      const data: any = details;
        if(data.response_status.status == "200"){
          
            this.eventList = data.response.eventList;
            this.holidayList = data.response.holidayList;
            let eventobj = {};
             this.holiday_obj = {};
   
            this.eventList.forEach((obj)=>{
                this.event_arr.push({"event_remark": this.ucfirst(obj.description), "event_date": obj.event_date});
                eventobj = {
                    color : "rgba(10, 153, 236, 0.6)",
                    start: obj.event_date
                 };
                this.holidaydata.push(eventobj);
            });
            this.holidayList.forEach((obj)=>{
                this.holiday_arr.push({"holiday_remark": this.ucfirst(obj.description), "holiday_date": obj.holiday_date});
                this.holiday_obj = {
                    color : "rgba(0,0,255,0.3)",
                    start: obj.holiday_date
                 };
                this.holidaydata.push(this.holiday_obj);
            });
            
            this.defaultConfig['events'] = this.holidaydata;
              
            $('#schoolcalendarbasic').fullCalendar(this.defaultConfig);
            $('#schoolcalendarbasic').fullCalendar('renderEvents', this.holidaydata, true);
            $('#schoolcalendarbasic').fullCalendar('addEventSource', this.holidaydata);
           
        }
    });
  }
  
  getparamsforcheckmm(date){
      let firstparam;
      let secparam;
      if(date.substr(5,1) == '0'){
            firstparam = 6;
            secparam = 1;
       }else{
            firstparam = 5;
            secparam = 2; 
       }
       return {'firstparam': firstparam, 'secparam': secparam};
  }

  deleteleave(id){
    const params = {
        "id": id,
        "status": "Deleted"
    };   
    this.http.post(this.myService.constant.apiURL+ "leaveApplyStudents/setleavestatus", params).subscribe(details => {   
        this.popupflag = true;
        this.popupmessage =  this.translate.instant("leave_deleted_successfully");
        this.msgtype = 1;
    });
  }

  getmonthlyattendance(month, year){
   let nowdate  = new Date(year,month,1);
   let firstDay = moment(new Date(nowdate.getFullYear(), nowdate.getMonth(), 1)).format('YYYY-MM-DD');
    let lastDay =  moment(new Date(nowdate.getFullYear(), nowdate.getMonth() + 1, 0)).format('YYYY-MM-DD');
   
    this.pcount = 0;
    this.ppcount = 0;
    this.acount = 0;
    this.lcount = 0;
    const monthNames = [
        "January",
        "February",
        "March",
       "April",
        "May",
        "June",
        "July",
        "August",
       "September",
        "October",
       "November",
       "December",
    
                       ];
     
    const params = {
            "user_id":this.globalObj.userid,
            "school_id":this.globalObj.schoolid,
            "session_id":this.globalObj.sessionid,
            "token": this.token,
            "first_day": firstDay,
            "last_day": lastDay
    }; 
 
   this.http.post(this.myService.constant.apiURL+ "student_subject_attendances/getsubjectattendancedetailswithoutsubjectid", params).subscribe(details => {    
        const data: any = details;
        let attendance_date: any = '';
        let index: any = '';
        let attendance_status: any = '';
        let monthName: any = '';
        let prevmonth: any = '';
        let color: any = '';
        let checkmm: any;
        let checkyr: any;
        let eventobj: any = {};
       
        if(data.response_status.status == '200'){
            this.attendancelist = data.response.attendance_list;
            this.ppcount  = data.response.partial_present_count;
            this.acount = data.response.absent_count;
            this.pcount = data.response.present_count;
            this.lcount = data.response.leave_count;
            
            const values = this.attendancelist;
            this.eventdata = [];
            let checkarr = [], count = 0, count_attendance_status = 0;
           
            var tempcount = 0;
            for (var i in values) {
                if (values.hasOwnProperty(i)) {
                         
                     attendance_date = values[i].attendance_date;
                     attendance_status = values[i].attendance_status;
                        if(this.product_type == "emscc"){
                        if(attendance_status == 'PP'){
                            color = 'rgba(0,0,255,0.3)';
                        }
                        else if(attendance_status == 'A'){
                            color = 'rgba(255,152,0,0.6)';
                        }
                        if(attendance_status == 'P'){
                            color = 'rgba(0,255,0,0.3)';
                        }
                      }

                     if(count == 1 && this.product_type == "emscc"){
                         if(attendance_status == 'A'){
                            color = 'rgba(255,152,0,0.6)';
                         }
                         else if(attendance_status == 'P'){
                            color = 'rgba(0,255,0,0.3)';
                         }
                     }
                    if(this.product_type != "emscc"){
                     if(attendance_status == 'P'){
                         color = 'rgba(0,255,0,0.3)';
                     }
                     else if(attendance_status == 'A'){
                        color = 'rgba(255,152,0,0.6)';
                     }
                  
                     else if(attendance_status == 'L'){
                        color = 'rgba(0,0,255,0.3)';
                     }
                   
                    }
                     eventobj = {
                                   color : color,
                                   start: attendance_date
                                };
                     this.eventdata.push(eventobj);
                }
             }

            if(this.product_type == "emscc"){
                this.total =  this.ppcount + this.acount + this.pcount;
                this.counts = {'monthName': monthNames[this.mm], 'pcount': this.pcount, 'acount': this.acount, 'ppcount': this.ppcount, 'total': this.total}    
               
            }
            else if(this.product_type != "emscc"){
                this.total =  this.lcount + this.acount + this.pcount;
                this.counts = {'monthName': monthNames[this.mm], 'pcount': this.pcount, 'acount': this.acount, 'lcount': this.lcount, 'total': this.total}    
            }
            this.calendarOptions = {
                editable: true,
                eventLimit: true,
                header: {
                  left: 'prev',
                  right: 'next',
                  center: 'title'
                },
                events:  this.eventdata
            };
            if(this.ucCalendar1){
            this.ucCalendar1.fullCalendar( 'addEventSource', this.eventdata );
            
            if(this.pcount == 0 && this.acount == 0 ){
                    if((this.ppcount == 0  && this.product_type == 'emscc') || (this.lcount == 0  && this.product_type != 'emscc')){
                        this.ucCalendar1.fullCalendar( 'removeEvents' );
                    }
                }
            }
            
         }
     });
   
    }
    ucfirst(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    editleave(from_date, to_date, reason, detail, id){
        this.selectedreason = false;
        this.dpone = from_date;
        this.dptwo = to_date;
        this.details = detail;
        this.reason = reason;
        this.btnflag = true;
        this.globalObj.editid = id;

        this.myForm.patchValue({reason: this.reason, details: this.details});
    }
    
   

}

