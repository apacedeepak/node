import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {
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
  //public prevsubId: any = 0;
  public ApiUrl = 'user_subjects/subjectwiseusers'; 
  popupmessage: any = '';
  popupflag: boolean = false;
  todate: any;
  fromdate: any;
  details: any;
  reason: any;
  markedleavelist: any = [];
  markedleavelistCount: any = 0;
  dponeField: FormControl;
  dptwoField: FormControl;
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
  mylang:any='';

  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder,private translate: TranslateService) {
      this.userType = window.localStorage.getItem('user_type').toLowerCase();
      this.token = window.localStorage.getItem('token');
      this.mylang= window.localStorage.getItem('language');
   
      if(this.mylang){
       translate.setDefaultLang( this.mylang);}
       else{
         translate.setDefaultLang( 'en');
       }
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
    this.product_type = window.localStorage.getItem('product_type');
    this.globalObj.sessionid = window.localStorage.getItem('session_id');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    this.globalObj.userid = window.localStorage.getItem('student_user_id');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.class_teacher_section_id = window.localStorage.getItem('class_teacher_section_id');
    //this.globalObj.subject_id = window.localStorage.getItem('subject_id');
    //this.subject_id = window.localStorage.getItem('subject_id');
    this.today = new Date();
    this.dd = this.today.getDate();
    this.mm = this.today.getMonth();
    this.yyyy = this.today.getFullYear();
    this.todaydate = this.yyyy+'-'+this.mm+'-'+this.dd;
    this.getmonthlyattendance(this.mm, this.yyyy);
    this.dpone = this.getdate(this.dd, this.mm+1, this.yyyy);
    this.dptwo = this.getdate(this.dd, this.mm+1, this.yyyy);
    this.dponeField = new FormControl();
    this.dponeField.valueChanges
          .subscribe(term => {
            this.dpone = this.getdate(term.day, term.month, term.year);
          });

    this.dptwoField = new FormControl();
    this.dptwoField.valueChanges
           .subscribe(term => {
                this.dptwo = this.getdate(term.day, term.month, term.year);
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
        "section_id": this.globalObj.class_teacher_section_id,
        "token": this.globalObj.token
    };
      this.http.post(this.myService.constant.apiURL + "leaveApplyStudents/getmarkedleave", params).subscribe(details => {
            const data: any = details;    
            this.markedleavelist = data.response;
            this.markedleavelistCount = this.markedleavelist.length;
            for(let i=0; i<this.markedleavelistCount; i++){
                this.alreadyleavecheck.push(this.markedleavelist[i].from_date);
            }
      });
  }

  closeme(msg){
      if(msg == "Please input details" || msg == "Please select reason" || msg == "Leave already applied in this date range."){
        this.popupflag = false;
      }else{
        location.reload();
      } 
  }

  leaveapply(){
    let check = this.alreadyleavecheck.indexOf(this.dpone);
    
    if(check >= 0){
        this.popupmessage = "Leave already applied in this date range.";
        this.popupflag = true;
    }
    else{
        const params = {
            "user_id": this.globalObj.userid,
            "to_date": this.dptwo,
            "from_date": this.dpone,
            "session_id": this.globalObj.sessionid,
            "cause": this.reason,
            "details": this.details,
            "added_date": this.todaydate,
            "schoolId": this.globalObj.schoolid,
            "token": this.token
        };
        if(this.reason != null && this.reason != undefined){
            if(this.details != null && this.details != undefined){  
                this.http.post(this.myService.constant.apiURL + "leaveApplyStudents/markleave", params).subscribe(details => {
                    const data: any = details;
                    if(data.response.status == '200'){
                        this.popupmessage = data.response.message;
                        this.popupflag = true;
                    }
                });
            }
            else{
                this.popupmessage = "Please input details";
                this.popupflag = true;
            }   
        }
        else{
            this.popupmessage = "Please select reason";
            this.popupflag = true;
        }
    }
  }

  clickButton(val){
      let date = val.data._d;
      this.mm = date.getMonth();
      this.yyyy = date.getFullYear();
      if(val.buttonType == 'next'){
        this.val = '1';
      }
      if(val.buttonType == 'prev'){
        this.val = '0';
      }
      this.getmonthlyattendance(this.mm, this.yyyy);
  }
//   eventClick(){
//      this.getmonthlyattendance(this.mm, this.yyyy);
//   }

//   updateEvent(){
//      this.getmonthlyattendance(this.mm, this.yyyy);
//   }

//   getsubjectid(subjectid){
//       if(subjectid != undefined && subjectid != ''){
//          this.subject_id = subjectid;
//          window.localStorage.setItem('subject_id', this.subject_id);
//          this.globalObj.subject_id = window.localStorage.getItem('subject_id');
//          this.getmonthlyattendance(this.mm, this.yyyy);
//       }
//   }
  
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

  getmonthlyattendance(month, year){
    let firstDay = new Date(year, month, 1);
    let lastDay = new Date(year, month + 1, 0);
    this.pcount = 0;
    this.ppcount = 0;
    this.acount = 0;
    this.lcount = 0;
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

    //let subId = +this.subject_id;

    const params = {
            "user_id":this.globalObj.userid,
            "school_id":this.globalObj.schoolid,
            "session_id":this.globalObj.sessionid,
            //"subject_id":subId,
            "token": this.token,
            "first_day": firstDay,
            "last_day": lastDay
            };

      console.log(params);     
   // this.http.post(this.myService.constant.apiURL+ "student_subject_attendances/getsubjectattendancedetails", params).subscribe(details => {
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
            this.attendancelist = data.response;
            const values = this.attendancelist;
            this.eventdata = [];
            let checkarr = [], count = 0, count_attendance_status = 0;
            
            values.sort((a,b)=>
            {
                    if (a.attendance_date < b.attendance_date) {
                          return -1;
                    } else   if (a.attendance_date > b.attendance_date)  {
                          return 1; 
                    } else {
                          return 0;
                     }
             } );
            var tempcount = 0;
            for (var i in values) {
                if (values.hasOwnProperty(i)) {
                     
                     attendance_date = values[i].attendance_date;
                     attendance_status = values[i].attendance_status;
                     let res = this.getparamsforcheckmm(attendance_date);
                     checkmm = attendance_date.substr(res.firstparam,res.secparam)-1;
                     checkyr = attendance_date.substr(0,4);
                     count = values.filter((obj) => obj.attendance_date === attendance_date).length;

                    
                     if(checkmm == month && checkyr == year){ 
                     // this.countslag[month] = this.val; 
                     if(checkarr.indexOf(attendance_date)>=0){
                         continue;
                     }      

                     if(tempcount > 0 && ((attendance_date == values[tempcount-1].attendance_date) && this.product_type == "emscc")){
                        
                        if((attendance_status == 'A' && values[tempcount-1].attendance_status == 'P') || (attendance_status == 'P' && values[tempcount-1].attendance_status == 'A')){
                            color = 'rgba(0,0,255,0.3)';
                            checkarr.push(attendance_date);
                        }
                        if((attendance_status == 'A' && values[tempcount-1].attendance_status == 'A') ){
                            color = 'rgba(255,152,0,0.6)';
                            checkarr.push(attendance_date);
                        }
                        if((attendance_status == 'P' && values[tempcount-1].attendance_status == 'P') ){
                            color = 'rgba(0,255,0,0.3)';
                            checkarr.push(attendance_date);
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

                      //  else if(values[i].attendance_status == 'P'){
                    //      color = 'rgba(0,255,0,0.3)';
                    //  }
                    //  else if(values[i].attendance_status == 'A'){
                    //     //color = 'rgba(255,0,0,0.3)';
                    //     color = 'rgba(255,152,0,0.6)';
                    //  }
                     
                    
                  
                    //  else if(values[i].attendance_status == 'L' && this.product_type != "emscc"){
                    //     color = 'rgba(0,0,255,0.3)';
                    //  }
                    //  else{
                    //     color = 'rgba(255,255,0,0.3)';
                    //  }
                     eventobj = {
                                   color : color,
                                   start: attendance_date
                                };
                     this.eventdata.push(eventobj);
                }
            }
            tempcount++;
             }
             let checkarrother = [];
             tempcount = 0;
             for (var i in values) {
                     attendance_date = values[i].attendance_date;
                     count = values.filter((obj) => obj.attendance_date === attendance_date).length;  
                      
                     let res = this.getparamsforcheckmm(attendance_date);
                     checkmm = attendance_date.substr(res.firstparam,res.secparam)-1;
                     checkyr = attendance_date.substr(0,4);

                if(checkmm == month && checkyr == year){
                     attendance_status = values[i].attendance_status;
                     index = new Date(attendance_date).getMonth();

                     monthName = monthNames[index];

                     if(checkarrother.indexOf(attendance_date)>=0){
                        continue;
                     }  
                     if(tempcount > 0 && ((values[i].attendance_date == values[tempcount-1].attendance_date) && this.product_type == "emscc")){
                        if(prevmonth === monthName || prevmonth === ''){
                            if((values[i].attendance_status == 'A' && values[tempcount-1].attendance_status == 'P') || (values[i].attendance_status == 'P' && values[tempcount-1].attendance_status == 'A')){
                                this.ppcount += 1;
                                checkarrother.push(attendance_date);
                            }
                         }else{
                             continue;
                         }
                         if(prevmonth === monthName || prevmonth === ''){
                            if(values[i].attendance_status == 'P' && values[tempcount-1].attendance_status == 'P'){
                                this.pcount += 1;
                                checkarrother.push(attendance_date);
                            }
                         }else{
                             continue;
                         }
                        if(prevmonth === monthName || prevmonth === ''){
                            if(values[i].attendance_status == 'A' && values[tempcount-1].attendance_status == 'A'){
                                this.acount += 1;
                                checkarrother.push(attendance_date);
                            }
                         }else{
                             continue;
                         }
                     }  
                     
                     if(count == 1 && this.product_type == "emscc"){
                        if(attendance_status == 'A'){
                            this.acount += 1;
                        }
                        else if(attendance_status == 'P'){
                            this.pcount += 1;
                        }
                    }

                     //  else if(values[i].attendance_status == 'P'){
                    //      if(prevmonth === monthName || prevmonth === ''){
                    //         this.pcount += 1;
                    //      }else{
                    //          continue;
                    //      }
                    //  }
                    //  else if(values[i].attendance_status == 'A'){
                    //     if(prevmonth === monthName || prevmonth === ''){
                    //         this.acount += 1;
                    //      }else{
                    //          continue;
                    //      }
                    //  }
                  
                    //  else if(values[i].attendance_status == 'L' && this.product_type != "emscc"){
                    //     if(prevmonth === monthName || prevmonth === ''){
                    //         this.lcount += 1;
                    //      }else{
                    //          continue;
                    //      }
                    //  }

                     prevmonth = monthName;
             }
             tempcount++;
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
                                    console.log("4=====");
              console.log(this.eventdata);                  
             this.ucCalendar.fullCalendar( 'addEventSource', this.eventdata );
             if(this.pcount == 0 && this.acount == 0 ){
                if((this.ppcount == 0  && this.product_type == 'emscc') || (this.lcount == 0  && this.product_type != 'emscc')){
                    this.ucCalendar.fullCalendar( 'removeEvents' );
                }
            }
             //this.prevsubId = subId; 
         }
     });
    }

    ucfirst(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

