import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { NgbDatepickerConfig, NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-viewall',
  templateUrl: './viewall.component.html',
  styleUrls: ['./viewall.component.css'],
  providers: [NgbDatepickerConfig]
})
export class ViewallComponent implements OnInit {
    
    model: NgbDateStruct;
    
    public globalObj: any = {};
    public attendanceList: any = [];
    public attendancePopUpList: any = [];
    public sectionArr: any = [];
    public classList: any = [];
    public attendanceNotTakenList: any = [];
    dpField: FormControl;
    dpFieldToDate: FormControl;
    public dp : any; 
    public todate : any;
    mylang:any=''; 

  constructor(private myService: BackendApiService,
              private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              config: NgbDatepickerConfig, calendar: NgbCalendar,private translate: TranslateService) { 
                this.mylang= window.localStorage.getItem('language');
   
                if(this.mylang){
                 translate.setDefaultLang( this.mylang);}
                 else{
                   translate.setDefaultLang( 'en');
                 }
        }

  ngOnInit() {
    this.globalObj.sessionid = window.localStorage.getItem('session_id');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.schoolid = window.localStorage.getItem('school_id');
    
    
    this.globalObj.viewToken = window.localStorage.getItem('view_token');
    this.globalObj.viewFlag = window.localStorage.getItem('view_flag');
    
    this.globalObj.pt = true; 
    this.globalObj.ab = true; 
    this.globalObj.le = true; 
    this.globalObj.nottaken = false; 
    this.globalObj.reason = true; 
    this.globalObj.leaveStatus = false; 
    this.globalObj.classFlag = true; 
    this.globalObj.classPopUpName = ''; 
    this.globalObj.message = '';
    
    
    
    
    
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
    
    this.globalObj.todayDate = today;
    
    var currentMonthStartDate = yyyy + '-' + mm + '-01';
    
    this.dpField = new FormControl();
    this.dpFieldToDate = new FormControl();
    
    this.dpField.valueChanges.subscribe(term => {
        if(term.day<10){
            term.day='0'+term.day;
        } 
        if(term.month<10){
            term.month='0'+term.month;
        }
        this.dp = term.year+'-'+term.month+'-'+term.day;
        this.getAllAttendance();
        this.getAttendanceNotTaken();
    });
    
    
    this.dpFieldToDate.valueChanges.subscribe(term => {
        if(term.day<10){
            term.day='0'+term.day;
        } 
        if(term.month<10){
            term.month='0'+term.month;
        }
        this.todate = term.year+'-'+term.month+'-'+term.day;
        this.getAllAttendance();
        this.getAttendanceNotTaken();
    });
    
    
    
    
    
    
    if(this.globalObj.viewToken == 'dashboard'){
        $(".showall").removeClass('btn-info');
        $("#nottaken").addClass('btn-info');
        this.globalObj.pt = false; 
        this.globalObj.ab =  false; 
        this.globalObj.le = false; 
        this.globalObj.nottaken = true; 
        this.globalObj.reason = false;
        
        if(this.globalObj.viewFlag == "today"){
            this.dp = today;
            this.todate = today;
            this.getAttendanceNotTaken();
        }else if(this.globalObj.viewFlag == "current"){
            this.dp = today;
            this.todate = currentMonthStartDate;
            this.getAttendanceNotTaken();
        }else if(this.globalObj.viewFlag == "previous"){
            
            var now = new Date();
            var prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0);
            var prevMonthFirstDate = new Date(now.getFullYear() - (now.getMonth() > 0 ? 0 : 1), (now.getMonth() - 1 + 12) % 12, 1);
            
            var preStartdate: any = prevMonthFirstDate.getDate();
            var preStartMonth: any = prevMonthFirstDate.getMonth()+1;
            var preStartYear: any = prevMonthFirstDate.getFullYear();
            
            var predate: any = prevMonthLastDate.getDate();
            var preMonth: any = prevMonthLastDate.getMonth()+1;
            var preYear: any = prevMonthLastDate.getFullYear();
            
            if(predate<10) {
                predate = '0'+predate;
            } 

            if(preMonth<10) {
                preMonth = '0'+preMonth
            } 
            if(preStartdate<10) {
                preStartdate = '0'+preStartdate;
            } 

            if(preStartMonth<10) {
                preStartMonth = '0'+preStartMonth
            } 
            
            this.dp = preStartYear + '-' + preStartMonth + '-' + preStartdate;
            this.todate = preYear + '-' + preMonth + '-' + predate;
            this.getAttendanceNotTaken();
        }else if(this.globalObj.viewFlag == "till"){
            const url = this.myService.constant.apiURL + "sessions/sessionfromsessionid?erp_session_id="+this.globalObj.sessionid;
            this.http.get(url).subscribe( response => {
                var data: any = response;
                this.dp = data.response.start_date;
                this.todate = today;
                this.getAttendanceNotTaken();
            })
            
        }
        window.localStorage.removeItem('view_token');
        window.localStorage.removeItem('view_flag');
    }else{
        window.localStorage.removeItem('view_token');
        window.localStorage.removeItem('view_flag');
    
    }

    if(!this.dp){
        this.dp = today;
    }
    if(!this.todate){
        this.todate = today;
    }
    
    
    this.getAllAttendance();
    
    
  }
  
  getAllAttendance(){
      var param = {
          school_id:this.globalObj.schoolid,
          session_id: this.globalObj.sessionid,
          from_date: this.dp,
          sectionArr: this.sectionArr,
          token: this.globalObj.token
      }
      
      const url = this.myService.constant.apiURL + "student_subject_attendances/viewallattendance";
        this.http.post(url, param).subscribe( response => {
            var data: any = response;
            this.attendanceList = data.response;
            if(this.globalObj.classFlag){
                this.classList = [];
                for(var i in this.attendanceList){
                    this.classList.push({
                        classSectionId: this.attendanceList[i].classSectionId,
                        classSection: this.attendanceList[i].classSection
                    })
                }
            }
        });
  }
  
  clickOn(flag){
      $(".showall").removeClass('btn-info');
      this.getAllAttendance()
      if(flag == 'all'){
          $("#"+flag).addClass('btn-info');
          this.globalObj.pt = true; 
        this.globalObj.ab = true; 
        this.globalObj.le = true; 
        this.globalObj.nottaken = false; 
        this.globalObj.reason = true;
      }else if(flag == 'pt'){
          $("#"+flag).addClass('btn-info');
        this.globalObj.pt = true; 
        this.globalObj.ab =  false; 
        this.globalObj.le = false; 
        this.globalObj.nottaken = false; 
        this.globalObj.reason = false;
          
      }else if(flag == 'ab'){
          $("#"+flag).addClass('btn-info');
            this.globalObj.pt = false; 
            this.globalObj.ab =  true; 
            this.globalObj.le = false; 
            this.globalObj.nottaken = false; 
            this.globalObj.reason = true;
      }else if(flag == 'le'){
          $("#"+flag).addClass('btn-info');
        this.globalObj.pt = false; 
        this.globalObj.ab =  false; 
        this.globalObj.le = true; 
        this.globalObj.nottaken = false; 
        this.globalObj.reason = true;
      }else if(flag == 'nottaken'){
          $("#"+flag).addClass('btn-info');
          this.globalObj.pt = false; 
        this.globalObj.ab =  false; 
        this.globalObj.le = false; 
        this.globalObj.nottaken = true; 
        this.globalObj.reason = false;
        this.dp = this.globalObj.todayDate;
        this.todate = this.globalObj.todayDate;
        this.sectionArr = [];
        this.getAttendanceNotTaken();
      }
  }
  
  showPopUp(sectionId, attendStatus, sectionName){
      
      const param = {
          session_id: this.globalObj.sessionid,
          school_id: this.globalObj.schoolid,
          token: this.globalObj.token,
          date: this.dp,
          attendanceStatus: attendStatus,
          section_id:sectionId
      }
      
      const url = this.myService.constant.apiURL + "student_subject_attendances/getattendancelist";
        this.http.post(url, param).subscribe( response => {
            var data: any = response;
            this.attendancePopUpList = data.response;
            
             (<any>$('#showpopup')).modal('show');
            if(this.attendancePopUpList.length == 0){
                this.globalObj.message = "No record found"
            }
           if(attendStatus == "L"){
               this.globalObj.classPopUpName = this.translate.instant("class")+" "+ sectionName +" "+ this.translate.instant("leave_details");
               this.globalObj.leaveStatus = true;
               this.globalObj.colspan = 7;
           }else if(attendStatus == "P"){
                this.globalObj.classPopUpName = this.translate.instant("class")+" "+ sectionName +" "+ this.translate.instant("Present Details");
               this.globalObj.leaveStatus = false;
               this.globalObj.colspan = 3;
           }else if(attendStatus == "A"){
               this.globalObj.classPopUpName = this.translate.instant("class")+" "+ sectionName + " "+ this.translate.instant("Absent Details");
               this.globalObj.leaveStatus = false;
               this.globalObj.colspan = 3;
           }
            
        });
     
  }
  
  selectClass(section){
      if(this.sectionArr.indexOf(section) == -1){
          this.sectionArr.push(section)
      }else{
          this.sectionArr.splice(this.sectionArr.indexOf(section), 1)
      }
      this.globalObj.classFlag = false;
      this.getAllAttendance();
  }
  
  getAttendanceNotTaken(){
      const param = {
          session_id: this.globalObj.sessionid,
          school_id: this.globalObj.schoolid,
          token: this.globalObj.token,
          from_date: this.dp,
          to_date: this.todate
      }
      const url = this.myService.constant.apiURL + "student_subject_attendances/attendancenottaken";
      this.http.post(url, param).subscribe( response => {
            var data: any = response;
            this.attendanceNotTakenList = data.response.notTakenList;
      });
  }

}
