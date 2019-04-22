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
@Component({
  selector: 'app-applyleavestatus',
  templateUrl: './applyleavestatus.component.html',
  styleUrls: ['./applyleavestatus.component.css']
})
export class ApplyleavestatusComponent implements OnInit {
public user_id:any;
public levedetails:any=[];
public userType:any;
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.user_id=window.localStorage.getItem('user_id');
    const dataval = {
      'user_id': this.user_id
  };
  this.http.post(this.myService.constant.apiURL+"leave_applies/userleaves", dataval).subscribe(data => {
const details:any=data;
this.levedetails=details.response;



});
  }

}
