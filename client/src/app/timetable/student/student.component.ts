import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import {BackendApiService} from './../../services/backend-api.service';
import { Options } from 'fullcalendar';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  calendarOptions: Options;
 displayEvent: any;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  public today: any;
  public dd: any;
  public mm : any;
  public yyyy: any;
  public todaydate: any;
  public mon: any;
  public global: any = {};
  public timetablelist: any = [];
  public eventdata: any = [];
  mylang:any='';
  section_name:any=''
  constructor(private myService: BackendApiService, private http: HttpClient,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() {
    this.global.user_id = window.localStorage.getItem('user_id');
    this.global.school_id = window.localStorage.getItem('school_id');
    this.today = new Date();
    this.dd = this.today.getDate();
    this.mm = this.today.getMonth();
    this.yyyy = this.today.getFullYear();
    this.todaydate = this.yyyy+'-'+this.mm+'-'+this.dd;
    
    
    
    let month = this.today.getMonth() + 1;

    let date = this.dd;
    if(month < 10){
        month = "0"+month;
      }

      if(this.dd < 10){
        date = "0"+this.dd;
      }
      const param={

      }
      const finalDate = this.yyyy+"-"+month+"-"+date;
      this.getBatchSchedule(finalDate);
      this.getmonthlyattendance(this.mm, this.yyyy);
  }

  clickButton(val){
      let date = val.data._d;
      this.mm = date.getMonth();
      this.yyyy = date.getFullYear();
      if(val.buttonType == 'next'){

      }
      if(val.buttonType == 'prev'){

      }

      this.getmonthlyattendance(this.mm, this.yyyy);
  }

  getmonthlyattendance(month, year){

    //   const currentDate = new Date();
    // if()

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      this.mon = monthNames[month];

    this.calendarOptions = {
        editable: true,
        eventLimit: false,
        header: {
          left: 'prevYear prev',
          right: 'next nextYear',
          center: 'title'
        },
        events:  this.eventdata
      };

      this.ucCalendar.fullCalendar( 'addEventSource', this.eventdata );

    }

    onDayCLick(value){
      let date = value.date._d.getDate();
      this.dd = date;
      const year = value.date._d.getFullYear();
      let month = value.date._d.getMonth() + 1;
      if(month < 10){
        month = "0"+month;
      }

      if(date < 10){
        date = "0"+date;
      }
      const finalDate = year+"-"+month+"-"+date;
      this.ucCalendar.fullCalendar( 'removeEvents' );

      this.eventdata = [];
       this.eventdata.push({ color : 'rgba(182, 175, 189,0.50)', start: finalDate});

       this.getmonthlyattendance(this.mm, this.yyyy);
       this.getBatchSchedule(finalDate);
    }

    getBatchSchedule(currentDate){
      console.log(currentDate)
      var sectionId=window.localStorage.getItem('student_section_id')
      var obj={
        "school_id":window.localStorage.getItem('school_id'),
        "section_id":sectionId,
        "date":currentDate
    }
    console.log(obj)

    this.http.post(this.myService.constant.apiURL+"attendance_timetable_masters/studentschedule", obj).subscribe(getData=>{
        const data :any=getData;
        if(data.response){
          this.timetablelist=data.response.attendance_details;
          this.section_name=data.response.section.section_name
        }
    })

  }


}
