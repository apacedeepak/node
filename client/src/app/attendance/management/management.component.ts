import { Component, OnInit} from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {
    
    public globalObj: any = {}; 
    public attendanceList: any = []; 
    dpField: FormControl;
    public dp : any; 

  constructor(private myService: BackendApiService,
              private http: HttpClient,
              private activatedRoute: ActivatedRoute) { 
              
            this.activatedRoute.queryParams.subscribe(params => {
              this.globalObj.attenStatus = params['status'];
              
          });  
              
        }

  ngOnInit() {
    this.globalObj.sessionid = window.localStorage.getItem('session_id');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    
    this.globalObj.message = "";
    
    var today: any = new Date();
    var dd: any = today.getDate();
    var mm: any = today.getMonth()+1; //January is 0!
    var yyyy: any = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = yyyy + '-' + mm + '-' + dd;
    
    this.dpField = new FormControl();
    this.dpField.valueChanges.subscribe(term => {
        if(term.day<10){
            term.day='0'+term.day;
        } 
        if(term.month<10){
            term.month='0'+term.month;
        }
        this.dp = term.year+'-'+term.month+'-'+term.day;
    });
    if(!this.dp){
        this.dp = today;
    }
    this.getAttendanceList();
  }
  
  
  getAttendanceList(){
      
      
      const param = {
          session_id: this.globalObj.sessionid,
          school_id: this.globalObj.schoolid,
          token: this.globalObj.token,
          date: this.dp,
          attendanceStatus: this.globalObj.attenStatus,
      }
      
      const url = this.myService.constant.apiURL + "student_subject_attendances/getattendancelist";
        this.http.post(url, param).subscribe( response => {
            var data: any = response;
            this.attendanceList = data.response;
            if(this.attendanceList.length == 0){
                this.globalObj.message = "No record found"
            }
        });
  }

}
