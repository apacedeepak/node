import { Component, OnInit, AfterContentInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-takeattendance',
  templateUrl: './takeattendance.component.html',
  styleUrls: ['./takeattendance.component.css']
})
export class TakeattendanceComponent implements OnInit,AfterContentInit {
  public globalObj: any = {};
  public today: any;
  public dd: any;
  public mm: any;
  public yyyy: any;
  public classection: any;
  public total: any;
  public pcount: any;
  public ppcount: any;
  public acount: any;
  public dp: any;
  public userlist: any = {};
  public setattendancestatuslist : Array<any> = new Array<any>();
  public response: any;
  public token: any;
  public attendstatusother : Array<any> = new Array<any>();
  public pselected: boolean = false;
  public aselected: boolean = false;
  public ppselected: boolean = false;
  public conditionbasedattendstatus: any;
  public ttlcount: any = 0;
  dpField: FormControl;
  mylang:any='';
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }

  constructor(private myService: BackendApiService, private http: HttpClient,private translate: TranslateService) { 
    this.token = window.localStorage.getItem('token');
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

    ngOnInit() {
      this.globalObj.sessionid = window.localStorage.getItem('session_id');  
      this.globalObj.userid = window.localStorage.getItem('user_id');
      this.globalObj.token = window.localStorage.getItem('token');
      
      this.classection = '-';
      this.ttlcount = 0;
      this.acount = 0;
      this.pcount = 0;
      this.ppcount = 0;
      
      this.today = new Date();
      this.dd = this.today.getDate();
      this.mm = this.today.getMonth()+1; 
      this.yyyy = this.today.getFullYear();
      
      this.dp = this.getdate(this.dd, this.mm, this.yyyy);
      
      this.dpField = new FormControl();
      this.dpField.valueChanges
          .subscribe(term => {
            this.dp = this.getdate(term.day, term.month, term.year);
            this.passdpvalue(this.dp);
          }); 
          
      this.getuserlist();
     
    }
    
    passdpvalue(dp){
        console.log(dp);
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
    
    setattendancestatus(value, userid, index){
      if(this.setattendancestatuslist[index] != undefined){
        if(this.setattendancestatuslist[index].user_id == userid){
           this.setattendancestatuslist[index].attend_status = value; 
        } 
      }
      else{
         this.attendstatusother[index] = value;
      }
    }
    
    setAttendancefilter(value){
        if(value == "Default Attendance") {
           this.ppselected = false;
           this.aselected = false;
           this.pselected = false;
        }
        else if(value == 'Present'){
           this.ppselected = false;
           this.aselected = false;
           this.pselected = true;
           this.acount = 0;
           this.ppcount = 0;
           this.pcount = this.ttlcount;
        }
        else if(value == 'Absent'){
            this.pselected = false;
            this.ppselected = false;
            this.aselected = true;
            this.pcount = 0;
            this.ppcount = 0;
            this.acount = this.ttlcount;  
        }
        else if(value == 'Partial Present'){
            this.pselected = false;
            this.aselected = false;
            this.ppselected = true;
            this.acount = 0;
            this.pcount = 0;
            this.ppcount = this.ttlcount;
        }
  }
  
    getuserlist(){
      const url = this.myService.constant.apiURL + "user_subjects/getusers";
      const params = {
                        'user_id': this.globalObj.userid,
                        'section_id': "10",
                        'session_id': this.globalObj.sessionid,
                        'user_type': "Student",
                        "token": this.token
                     };
      this.http.post(url, params).subscribe(details => {
        this.userlist = details;
        if(this.userlist.response_status.status == "200"){
            this.userlist = this.userlist.response;
            this.ttlcount = this.userlist.length; 
        }    
      }); 
            
    }
    onSubmit(event){
      event.preventDefault();
    }
}