import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-batchattendance',
  templateUrl: './batchattendance.component.html',
  styleUrls: ['./batchattendance.component.css']
})
export class BatchattendanceComponent implements OnInit {
  public eventdata : Array<any> = new Array<any>(); 
  public userType : any; 
  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(private myService: BackendApiService, private http: HttpClient) {
        this.userType = window.localStorage.getItem('user_type').toLowerCase();
  }

  ngOnInit() {
       this.calendarOptions = {
        editable: true,
        eventLimit: false,
        header: {
          left: 'prev,next',
          center: 'title',
          right: 'month'
        },
        events: this.eventdata
      };
  }
}
