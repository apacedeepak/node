import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import { FullcalendarComponent } from '../fullcalendar/fullcalendar.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-schoolcalendar',
  templateUrl: './schoolcalendar.component.html',
  styleUrls: ['./schoolcalendar.component.css']
})
export class SchoolcalendarComponent implements OnInit {
  calendarOptions2: Options;
  public today: any;
  public dd: any;
  public mm : any;
  mylang:any='';
  
  monthNames: any = [];
  @Input() event_arr: FullcalendarComponent;
  @Input() holiday_arr: FullcalendarComponent;
  @Input() month: FullcalendarComponent;
  @Input() yyyy: FullcalendarComponent;

  @ViewChild(CalendarComponent) ucCalendar2: CalendarComponent;
  constructor(private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }
  
  ngOnInit() {
    this.monthNames = [   
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
    this.today = new Date();
    this.mm = this.today.getMonth();
    this.month =  this.monthNames[this.mm];
  }

// eventClick2(){
//    this.getholidayeventlist(this.mm, this.yyyy);
// }

// updateEvent2(){
//    this.getholidayeventlist(this.mm, this.yyyy);
// }

// clearEvents() {
//   this.events = [];
// }

// loadEvents() {
//   this.events = this.holidaydata;
// }

}
