import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as Rx from 'rxjs';
import * as $ from 'jquery';
import * as moment from 'moment';

@Component({
  selector: 'app-staffattendance',
  templateUrl: './staffattendance.component.html',
  styleUrls: ['./staffattendance.component.css']
})
export class StaffattendanceComponent implements OnInit {
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
  @ViewChild(CalendarComponent) ucCalendar1: CalendarComponent;

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

  config: object = {};
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder) {

   }

  ngOnInit() {
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.product_type = window.localStorage.getItem('product_type');
    //this.product_type = 'emscc'; // to be commented on production
    this.token = window.localStorage.getItem('token');
    this.selectedreason = true;

    
    this.globalObj.sessionid = window.localStorage.getItem('session_id');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    if(this.userType == "teacher"){
        this.globalObj.userid = window.localStorage.getItem('user_id');
    }
  this.globalObj.token = window.localStorage.getItem('token');  
    this.setleavedaterange();
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




 

    date_diff_indays (date1, date2) {
        let dt1 = new Date(date1);
        let dt2 = new Date(date2);
       
        return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
    }

  

  clickButton1(val){

        let mnth, yr;
        const monthNames = [
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
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
        this.ucCalendar1.fullCalendar( 'removeEvents' );
        console.log(this.yyyy);
        console.log(this.mm);
        this.getmonthlyattendance(this.mm, this.yyyy);
        // this.getholidayeventlist(yr, monthNames.indexOf(mnth));
  }  


  
 

  getmonthlyattendance(month, year){
   let nowdate  = new Date(year,month,1);
   let firstDay = moment(new Date(nowdate.getFullYear(), nowdate.getMonth(), 1)).format('YYYY-MM-DD');
    let lastDay =  moment(new Date(nowdate.getFullYear(), nowdate.getMonth() + 1, 0)).format('YYYY-MM-DD');
   
    this.pcount = 0;
    this.ppcount = 0;
    this.acount = 0;
    this.lcount = 0;
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
     
    const params = {
            "user_id":this.globalObj.userid,
            "school_id":this.globalObj.schoolid,
         
            "token": this.token,
          
    }; 
 
   this.http.post(this.myService.constant.apiURL+ "user_attendances/userattendance", params).subscribe(details => {    
        const data: any = details;
        let staffattendanceObj=data.response.staffAttnDetails;
        console.log(staffattendanceObj);

        let attendance_date: any = '';
        let leave_date: any = '';
        let index: any = '';
        let attendance_status: any = '';
        let statleave:any='';
        let monthName: any = '';
        let prevmonth: any = '';
        let color: any = '';
        let checkmm: any;
        let checkyr: any;
        let eventobj: any = {};
        let eventobject: any = {};
        let holiday_date:any='';
        let holidayobj :any={};
       
        if(data.response_status.status == '200'){
            this.attendancelist = staffattendanceObj;
            this.ppcount  = data.response.partial_present_count;
            // this.acount = data.response.absent_count;
            // this.pcount = data.response.present_count;
            // this.lcount = data.response.leave_count;
            
            const values = this.attendancelist;
            const valuesleave=data.response.leaveList;
            const valueholiday=data.response.holidayList;
            this.eventdata = [];
            let checkarr = [], count = 0, count_attendance_status = 0;
           
            var tempcount = 0;
            for (var i in values) {
          
                         this.pcount++;
                     attendance_date = values[i].fix_date;
                     attendance_status = values[i].leave_status;
                 
                    if(this.product_type != "emscc"){
                     if(attendance_status == 'Present'){
                         color = 'rgba(0,255,0,0.3)';
                     }
                    
                    }
                     eventobj = {
                                   color : color,
                                   start: attendance_date
                                };
                     this.eventdata.push(eventobj);

                
             }
             for (var i in valueholiday) {
          
              this.acount++;
          holiday_date = valueholiday[i].holiday_date;

    console.log(holiday_date);
     
              color =  'rgba(14, 14, 107, 0.3)';
         
          holidayobj = {
                        color : color,
                        start: holiday_date
                     };
          this.eventdata.push(holidayobj);

     
  }
             for (var i in valuesleave) {
          
                        this.lcount++; 
              leave_date = valuesleave[i].fix_date;
              statleave = valuesleave[i].leave_status;
          
             if(this.product_type != "emscc"){
     
              if(statleave == 'Applied'||statleave=="Granted"){
                color = 'rgba(255,152,0,0.6)';
              }
            //   else if(attendance_status == 'A'){
            //     color = 'rgba(255,152,0,0.6)';
            //  }
          
            //  else if(attendance_status == 'L'){
            //     color = 'rgba(0,0,255,0.3)';
            //  }
           
             }
             eventobject = {
                            color : color,
                            start: leave_date
                         };
              this.eventdata.push(eventobject);
         
      }

      console.log(this.eventdata);
             if(this.product_type != "emscc"){
                this.total =  this.lcount  + this.pcount+this.acount;;
                this.counts = {'monthName': monthNames[this.mm], 'pcount': this.pcount,  'lcount': this.lcount,'acount':this.acount}    
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
            
            if(this.pcount == 0 ){
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


}
