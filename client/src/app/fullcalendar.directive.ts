import { Directive, Input, AfterViewInit, ElementRef, OnInit , ViewChild} from '@angular/core';
import * as $ from 'jquery';
import {BackendApiService} from './services/backend-api.service';
import { HttpClient } from '@angular/common/http';

@Directive({
  selector: '[appFullcalendar]',
  exportAs:'appFullcalendar' 
})

export class FullcalendarDirective {
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
  todate: any;
  fromdate: any;
  details: any;
  countslag: any = [];
  product_type : any = '';
  holidayList: any = [];
  eventList: any = [];
  holidaydata: any = [];
  month: any;
  events: any;
  monthNames: any = [];
  @Input('config') config: object = {};
  @Input('event_arr') event_arr: any = [];
  @Input('holiday_arr') holiday_arr: any = [];
  
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
    
  constructor(private el: ElementRef, private myService: BackendApiService, private http: HttpClient) { }
  
  ngOnInit(){
    this.monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]; 
    this.userType = window.localStorage.getItem('user_type').toLowerCase();  
    this.globalObj.sessionid = window.localStorage.getItem('session_id');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    this.globalObj.userid = window.localStorage.getItem('user_id');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.class_teacher_section_id = window.localStorage.getItem('class_teacher_section_id');
    
    this.today = new Date();
    this.dd = this.today.getDate();
    this.mm = this.today.getMonth();
    this.month =  this.monthNames[this.mm];
    this.yyyy = this.today.getFullYear();
    this.todaydate = this.yyyy+'-'+this.mm+'-'+this.dd;

    //this.getholidayeventlist(this.yyyy, this.mm);
  }
  
  ucfirst(str){
     return str.charAt(0).toUpperCase() + str.slice(0);
  }
  
  getholidayeventlist(year, month){
    let firstDay = new Date(year, month, 1);
    let lastDay = new Date(year, month + 1, 0);

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
            let eventobj = {}, holiday_obj = {};
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
                holiday_obj = {
                    color : "rgba(0,0,255,0.3)",
                    start: obj.holiday_date
                 };
                this.holidaydata.push(holiday_obj);
              
            });
            this.defaultConfig['events'] = this.holidaydata;
           
            Object.assign(this.defaultConfig, this.config);
            $(this.el.nativeElement).fullCalendar(this.defaultConfig);
        }
    });
  }

  ngAfterViewInit()
  {
    
      
      // $('.fc-prev-button span').click((e) => {
      //   let mnth = $('.fc-center').text().split(" ")[0];
      //   let yr = $('.fc-center').text().split(" ")[1];
      //   this.getholidayeventlist(yr, this.monthNames.indexOf(mnth));
      // });

      // $('.fc-next-button span').click((e) => {
      //   let mnth = $('.fc-center').text().split(" ")[0];
      //   let yr = $('.fc-center').text().split(" ")[1];
      //   this.getholidayeventlist(yr, this.monthNames.indexOf(mnth));
      // });
  }

}
