import { Component, OnInit, AfterContentInit } from '@angular/core';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit ,AfterContentInit {
     public globalObj: any = {};
     public subjectlist: any = [] ;
     public subjectlistother: any = [];
     public getattendancelist: any = {};
     public userlist : Array<any> = new Array<any>();
     public attendancelist : Array<any> = new Array<any>();
     public attendanceidlist : Array<any> = new Array<any>();
     public attendancestatuslist : Array<any> = new Array<any>();
     public ttlcount: any = 0;
     public index: any = 0;
     public pselected: boolean = false;
     public aselected: boolean = false;
     public ppselected: boolean = false;
     public targetdate: any;
     public attendance: any;
     public dp : any; 
     public today : any; 
     public todaydate : any; 
     public dd : any; 
     public mm : any; 
     public yyyy : any; 
     public class_id : any;
     public section_id : any;
     public subject_id : any;
     public userid : any;
     public sessionid : any;
     public token : any;
     public sectionlist: any = [];
     public classlist: any;
     public class_sec_list: any;
     public user_type: any;
     public status: any;
     public passstatus: any;
     public pcount: any = 0;
     public acount: any = 0;
     public ppcount: any = 0;
     public userids: any;
     public attendstatusforcount: any;
     public conditionbasedattendstatus: any;
     public attendstatusother : Array<any> = new Array<any>();
     public responseMessage : boolean = false;
     public popmessage : any = '';
     public setdate : any;
     public classsection : any = '';
     public classname : any = '';
     public subject_name : any = '';
     public optionSelected : Array<any> = new Array<any>();
     public ApiUrl = 'user_subjects/subjectwiseusers';   
     public studentnamelist : Array<any> = new Array<any>();
     public parentidlist : Array<any> = new Array<any>();
     public product_type : any = '';
     dpField: FormControl;
     mySwitch: FormControl;
     switchFlag: boolean = false;
     userlistLength: any = 0;
     sectionwiseuserlist: any = [];
     sectionwise_assigned_users: any;
     markedleavelist: any;
     markedleavelistCount: any;
     lselected: boolean = false;
     lcount: number = 0;
     hideswitch: boolean = true;
     check1: any;
     check2: any;
     check3: any;
     counter: any;
     leave_apply_id: any;
     reasontext: FormControl;
     start_time: FormControl;
     period_start_time: FormControl;
     batch_start_time: string = ""; 
     batch_end_time: string = ""; 
     lecture_id: string = "";
     hidedonebtnflag: boolean = false;
     batchtiminglist: any = [];
     subjectname: any = "";
     atten_flag: boolean;
     atten_flag_other: boolean = false;
     check_flag: boolean;
     assignedsectionflag: boolean;
     assignedsubjectflag: boolean;
     subjectdetailflag: boolean;
     classteacherflag: any = "";
     msgtype: any;
     periodtime: any = [];
     starttimeflag: any;
     mylang:any='';
     maxDate:any;
     ngAfterContentInit(){
        this.mylang= window.localStorage.getItem('language');
        if(!this.mylang){
          this.mylang = 'en';
        }
       
       
         this.translate.setDefaultLang( this.mylang);
        
         this.translate.use(this.mylang);
      }
  constructor(private activatedRoute: ActivatedRoute, private myService: BackendApiService, private http: HttpClient, private router: Router,private translate: TranslateService) {
    
    this.activatedRoute.queryParams.subscribe(params => {
        const { place } = params
        let type = (place) ? place: '';
        if(type == 'leave') { 
            //
        }
    });
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }

  ngOnInit() { 
    var enddate = new Date();
    this.maxDate = { year: enddate.getFullYear(), month: enddate.getMonth() + 1, day: enddate.getDate() };
      this.atten_flag = true;
    this.reasontext = new FormControl('', [Validators.required]);  
    this.start_time = new FormControl('', [Validators.required]);
    this.period_start_time = new FormControl('0', [Validators.required]);
    
    this.globalObj.sessionid = window.localStorage.getItem('session_id');  
    this.globalObj.userid = window.localStorage.getItem('user_id');
    this.globalObj.user_type = window.localStorage.getItem('user_type');
    this.globalObj.class_id = window.localStorage.getItem('class_id');
    this.globalObj.section_id = window.localStorage.getItem('section_id');
    this.globalObj.subject_id = window.localStorage.getItem('subject_id');
    this.product_type = window.localStorage.getItem('product_type');
    
    if(this.product_type != 'emscc'){
        this.globalObj.subject_id = 0;
    }

    if(this.product_type == 'emscc' ){
        this.assignedsectionflag = true;
        this.assignedsubjectflag = true;
        this.subjectdetailflag = true;
    }
    
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.subject_name = window.localStorage.getItem('subject_name');
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    
    this.globalObj.isClassTecher = window.localStorage.getItem('isClassTeacher');
    this.globalObj.class_teacher_section_id = window.localStorage.getItem('class_teacher_section_id');
    if(this.globalObj.section_id == null){
        this.globalObj.section_id = this.globalObj.class_teacher_section_id;
    }

    if(this.product_type != "emscc"){ 
        this.checkclassteacher();  
        this.getatten_flag();
    }
    
    if(this.globalObj.isClassTecher == null){
        this.hideswitch = false; 
    }
    
    if(this.classsection == ''){
        this.classsection = '-';
    }
      
    this.today = new Date();
    this.dd = this.today.getDate();
    this.mm = this.today.getMonth()+1; 
    this.yyyy = this.today.getFullYear();
    if(this.dd < 10){
        this.dd='0'+this.dd;
    } 
    if(this.mm < 10){
        this.mm='0'+this.mm;
    } 
    this.todaydate = this.yyyy+'-'+this.mm+'-'+this.dd;
    this.dp = this.yyyy + '-' + this.mm + '-' + this.dd;
      
    this.dpField = new FormControl();
    this.dpField.valueChanges
          .subscribe(term => { 
            $(".setAttendancefilterclass option:eq(0)").attr('selected', 'selected')
            if(term.day<10){
                term.day='0'+term.day;
            } 
            if(term.month<10){  
                term.month='0'+term.month;
            } 
            this.dp = term.year+'-'+term.month+'-'+term.day;
            if(this.check3 != null && this.check3 != undefined && this.check1 != null && this.check1 != undefined && this.check2 != null && this.check2 != undefined)
            {
               this.batch_timings_init();
               this.periodtimings();
               this.start_time.patchValue("0");
            }
            if(this.product_type != 'emscc' && !this.atten_flag_other){
                this.getDailyAttendanceList();
                this.period_start_time.patchValue("0");
            }else if(this.product_type != 'emscc' && this.atten_flag_other){
                this.periodtime.length = 0; 
                $("#subjectvalue option:first").attr("selected", "selected");
            }
          });   
    
    if(this.product_type != "emscc"){ 
        this.switchFlag = true;
        this.getDailyAttendanceList();
    }
    else{
        this.switchFlag = false;
        this.initialiazeCount(); 
        this.getsubjectwiselist(0); 
        this.start_time.patchValue("0"); 
    }    
    this.getassignedclass();
    
    if(this.product_type != 'emscc'){
        this.getleavelist();
        
    }
  }

  checkclassteacher(){
    const params = { 
                        school_id: this.globalObj.school_id,
                        user_id: this.globalObj.userid, 
                        session_id: this.globalObj.sessionid,
                        section_id: this.globalObj.section_id 
                    }
    this.http.post(this.myService.constant.apiURL + "user_sections/checkclassteacher", params).subscribe(details => {
        const data: any = details; 
        this.classteacherflag = data.response.class_teacher; 
        if(this.classteacherflag == 'No'){
            this.atten_flag_other = true;
            this.classsection = "-";
        }
    });
  }

  getatten_flag(){
    const params = { school_auto_id: this.globalObj.school_id }
    this.http.post(this.myService.constant.apiURL + "attendance_timetable_structures/getattenflag", params).subscribe(details => {
        const data: any = details;  
        if(data.response_type.status == "200"){
            let atten_flag = data.response.attend_flag;
            if(atten_flag == 1 || atten_flag == '1'){
                this.atten_flag = true;
            }
            else if(this.classteacherflag == 'No' && atten_flag == 0){
                this.responseMessage = true;
                this.popmessage = this.translate.instant('not_authorised_take_attendance'); 
                this.msgtype = 1;
            }
        }
    });
  }

  attenFlagFunc(){
    this.atten_flag_other = !this.atten_flag_other;  
    
    if(this.atten_flag_other == true){
        if(this.product_type != 'emscc' ){
            this.assignedsectionflag = true;
            this.assignedsubjectflag = true;
            this.subjectdetailflag = true;
        }
        /* lecture attendance case etl */
        this.classsection = '-';
        this.initvar();
    }else{
        this.getDailyAttendanceList();
    }
  }

  initvar(){
    this.subjectlistother.length = 0;
    this.pselected = false;
    this.aselected = false;
    this.lselected = false;
    this.ttlcount = 0;
    this.pcount = 0;
    this.acount = 0;
    this.lcount = 0;
    this.userlist.length = 0;
    this.attendanceidlist.length = 0;
    this.attendancelist.length = 0;
    $(".setAttendancefilterclass option:first").attr("selected", "selected");
  }

  batch_timings_init(){
    this.start_time.valueChanges
    .subscribe( data => {
        if(data == "0") {
            this.initvar();
        }else{
            let obj = document.querySelector("#start_time_value option[value='"+data+"']");
            if(obj){
                let a = obj.innerHTML;  
                let arr = a.split('-');
                this.batch_start_time = arr[0];
                this.batch_end_time = arr[1];
                this.lecture_id = data;
            }
            this.getsubjectwiselist(this.globalObj.subject_id);
        }
    })
  }

  period_timings_init(){
    this.period_start_time.valueChanges
    .subscribe( data => { 
        if(data == "0") {
            this.initvar();
        }else{
            let obj = document.querySelector("#period_start_time_value option[value='"+data+"']");
            if(obj){
                let a = obj.innerHTML;  
                this.batch_start_time = a;
                this.batch_end_time = a;
                this.lecture_id = data;
            }
            this.getsubjectwiselist(this.globalObj.subject_id);
        }
    })
  }

  getleavelist(){
    const params = {
        "session_id": this.globalObj.sessionid,
        "section_id": this.globalObj.class_teacher_section_id,
        "teacherflag": 1,
        "school_id": this.globalObj.school_id, 
        "token": this.globalObj.token
    };
    this.http.post(this.myService.constant.apiURL + "leaveApplyStudents/getmarkedleave", params).subscribe(details => {
            const data: any = details;  
            this.markedleavelist = data.response;
            this.markedleavelistCount = this.markedleavelist.length;
    });
  }

  leavevalue(leave_apply_id){
     this.leave_apply_id = leave_apply_id;
  }

  markstatus(leave_apply_id, identifier){
    let status = (identifier == 1) ? "Approved" : "Rejected";
    let data = {
                    "id": leave_apply_id, 
                    "status": status
                };
    if(status == "Approved"){
       data['section_id'] = this.globalObj.class_teacher_section_id; 
    }
    else if(status == "Rejected"){
        data['reject_reason'] = this.reasontext.value;
    }

    this.http.post(this.myService.constant.apiURL + "leaveApplyStudents/setleavestatus", data).subscribe(details => {
        const data: any = details; 
        if(data.response.status == '200'){
            this.responseMessage = true;
            this.popmessage = this.translate.instant(data.response.message);
        }
    });
  }

  getDailyAttendanceList(){
        this.showdonebtn();
        this.initialiazeCount();
        if(this.globalObj.isClassTecher != undefined && this.globalObj.isClassTecher != null){
            this.classsection = this.globalObj.isClassTecher;
        }
        this.userlist = [];  
        const parms = { 
            "section_id": this.globalObj.class_teacher_section_id, 
            "session_id": this.globalObj.sessionid, 
            "subject_id": 0, 
            "attendance_date": this.dp 
        };

        this.http.post(this.myService.constant.apiURL+ 'student_subject_attendances/attendanceuser', parms).subscribe(details => {
            const data: any = details;
            if(data.response_status.status == "200"){
                this.ttlcount = data.response.length;
                this.subjectlistother = [];
                this.attendancelist.length = 0;
                this.userlist.length = 0;
                this.attendanceidlist.length = 0;
                
                data.response.forEach((value, i)=>{
                    this.subjectlistother[i] = {user_id: value.user_id, student_name: value.student_name};
                    
                    this.userlist[i] = value.user_id;
                  
                    this.attendancelist[i] = value.attendance_status;
                    this.attendanceidlist[i] = value.id;
                    
                    this.pselected = false;
                    this.aselected = false;
                    this.lselected = false;
                   
                    if(value.attendance_status == "A"){
                        this.acount += 1;
                    } 
                    if(value.attendance_status == "P"){
                        this.pcount += 1;
                    }  
                    if(value.attendance_status == "L"){
                        this.lcount += 1;
                    }
                }); 
            }
        });
  }
  showdonebtn(){
    this.hidedonebtnflag = false;
    this.check_flag = true;
  }
  hidedonebtn(){
    this.hidedonebtnflag = true;
    this.check_flag = false;
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
  
 closeme(val){
  

    
      let msgs_arr = [
        this.translate.instant('batch_end_time_cannot_blank'),
        this.translate.instant('batch_start_time_cannot_blank'),
        this.translate.instant('attendance_for_future_date_not_allowed'),
        this.translate.instant('no_students_selected'),
        this.translate.instant('attendance_not_applicable_today'),
        this.translate.instant('attendance_for_future_date_not_allowed'),
        this.translate.instant('attendance_not_allowed_sunday'),
        this.translate.instant('information_fetched_successfully'),
        this.translate.instant('please_check_attendance'),
        this.translate.instant('select_all_student_attendance'),
        this.translate.instant('please_select_date'),
        this.translate.instant('please_select_course_type'),
        this.translate.instant('please_select_batch'),
        this.translate.instant('please_select_subject'),
        this.translate.instant('please_select_time_slot'),
        this.translate.instant('please_select_class'),
        this.translate.instant('please_select_section'),
        this.translate.instant('please_select_lecture'),
                    ];
      let a = msgs_arr.indexOf(val);
      if(a >= 0){
        this.responseMessage = false;
      }else if(this.msgtype == 1){
        this.router.navigate(['dashboard/main']);
      }
      else if(this.msgtype == 2){
        this.responseMessage = false;
        $("#getassignedsectionfilter option:first").attr("selected", "selected");
        this.classsection = '-';
        this.attendanceidlist.length = 0;
        this.attendancelist.length = 0;
        this.userlist.length = 0;
        this.subjectlist.length =0;
        this.periodtime.length =0;
        this.sectionlist.length =0;
        this.subjectlistother.length = 0;
        if(this.product_type != 'emscc')
        $("#getassignedsectionfilter").val(this.translate.instant("select_class"));
        this.ttlcount = 0
        this.pcount = 0
        this.acount = 0
        this.lcount = 0
        this.today = new Date();
   
        this.dd = this.today.getDate();
        this.mm = this.today.getMonth()+1; 
        this.yyyy = this.today.getFullYear();
        if(this.dd < 10){
            this.dd='0'+this.dd;
        } 
        if(this.mm < 10){
            this.mm='0'+this.mm;
        } 
        this.dp = this.yyyy+'-'+this.mm+'-'+this.dd;
        $(".setAttendancefilterclass option:first").attr("selected", "selected");
        this.msgtype = 0
      }
      else{
        location.reload();
      }
  }

  initializeattend(){
    this.attendancelist.length = 0;
    this.userlist.length = 0;
  }
  
 getassignedclass() {
    this.initializeattend();
    const params = {
      "user_id": this.globalObj.userid,
      "session_id": this.globalObj.sessionid,
      "school_id": this.globalObj.school_id,
      "token": this.globalObj.token
    };
    this.http.post(this.myService.constant.apiURL + "users/assignedclass", params).subscribe(details => {
      this.classlist = details;
      if (this.classlist.response_status.status == '200') {
        this.classlist = this.classlist.response.assigned_classes;
      }
    });
  }

  getassignedsection(event) {
    this.initializeattend();
    this.initialiazeCount();  
    this.getsubjectwiselist(0);  
    this.classname = event.target.options[event.target.selectedIndex].text; 
    let val = event.target.value; 
  
    if(val == 'Select Course type' || val == "Select Class"){
        this.assignedsectionflag = true;
        if(this.product_type != 'emscc') this.periodtime.length = 0;
    }else{
        this.assignedsectionflag = false;
        let batchfilterval = $("#getassignedsubjectvalue option:eq(0)").val();
        
        if(batchfilterval == "Select Section" || batchfilterval == "Select Batch"){
            this.assignedsubjectflag = true;
        } 
    }
    this.check1 = val; 
    this.globalObj.class_id = val;
    if(val!=''){
        
        const params = {
          "user_id": this.globalObj.userid,
          "session_id": this.globalObj.sessionid,
          "class_id":val,
          "token": this.globalObj.token
        };
         window.localStorage.setItem('class_id', val);

        this.http.post(this.myService.constant.apiURL + "users/assignedsection", params).subscribe(details => {
          this.sectionlist = details;
          if (this.sectionlist.response_status.status == '200') {
            this.sectionlist = this.sectionlist.response.assigned_sections;
            this.subjectlist = [];
          }
        });
     }
   }
  
   getassignedsubject(val,labelval) {
      this.initializeattend();
      this.getsubjectwiselist(0); 
      this.subject_name = labelval[labelval.selectedIndex].label;
      this.globalObj.section_id = val;
      this.check2 = val;

      if(val == 'Select Section' || val == "Select Batch"){
        this.assignedsubjectflag = true;
      }else{
        this.assignedsubjectflag = false;
        let subfilterval = $("#subjectvalue option:eq(0)").val();
        
        if(subfilterval == "0"){
            this.subjectdetailflag = true;
        } 
      }
      if(val!='')
      {
        const params = {
         "user_id": this.globalObj.userid,
         "session_id": this.globalObj.sessionid,
         "section_id":val,
         "token": this.globalObj.token,
         "class_id": this.globalObj.class_id
       };
       if(labelval!=undefined)
        {
            window.localStorage.setItem('subject_name', labelval[labelval.selectedIndex].label);
        }
       else if(labelval==undefined && this.globalObj.subject_name!=null  && this.globalObj.subject_name!='')
         {
             window.localStorage.setItem('section_name', this.globalObj.subject_name);
         }
         window.localStorage.setItem('section_id', val);
         
        this.http.post(this.myService.constant.apiURL + "user_subjects/assignedsubjects", params).subscribe(details => {
         this.subjectlist = details;
         if (this.subjectlist.response_status.status == '200') {
           this.subjectlist = this.subjectlist.response.assigned_subjects;
         }
       });
     }
   }

   subjectdetail(val){
      
        if(val != '0')
        {     this.period_start_time.patchValue("0");
            this.subjectdetailflag = false;
            this.globalObj.subject_id = val;
            window.localStorage.setItem('subject_id', val);
            let obj = document.querySelector("#subjectvalue option[value='"+val+"']");
           
            if(obj){
                this.subjectname = obj.innerHTML;
            } 
            
            this.periodtimings();
            this.period_timings_init(); 
           
        }else{
            this.subjectdetailflag = true; 
        }
        
        if(this.globalObj.class_id != undefined && this.subject_name != undefined){
            this.classsection = this.classname + '-' + this.subject_name;
       }
   }

   periodtimings(){
    this.period_start_time.patchValue("0");
       let params = {}
 
            params = {
                section_id: this.globalObj.section_id,
                user_id: this.globalObj.userid,
                subject_id: this.globalObj.subject_id,
                date:this.dp
            
        }

    this.http.post(this.myService.constant.apiURL + "student_subject_attendances/timeslot", params).subscribe(details => {
        const data: any = details; 
        this.periodtime = data.response; 
        if(this.product_type == 'emscc'){
                this.periodtime.forEach( obj => {
                    obj["start_time_lecture"] = obj.start_time + "-" + obj.lecture;
                    this.batchtiminglist.push(obj); 
                })
            // let periodtime = [{"start_time": "5:15 AM", "end_time": "5:30 AM", "lecture": "2"}, {"start_time": "4:15 AM", "end_time": "4:30 AM", "lecture": "3"}];
            // periodtime.forEach( obj => {
            //     obj["start_time_lecture"] = obj.start_time + "-" + obj.lecture;
            //     this.batchtiminglist.push(obj); 
            // })
        
            //to be commented in production 
        
            this.start_time.patchValue("0");
        }else
            this.period_start_time.patchValue("0");
    });
    
   }

  getsubjectwiselist(val){
    this.initializeattend(); 
    this.attendanceidlist.length = 0;
    this.attendancelist.length = 0;
    this.userlist.length = 0;

    this.check3 = val;
    this.counter = 1;  
    
    if(val != 0){
            this.userlist = [];
            $("#dp").val(this.dp);   
           if(this.dp != '' && this.dp != undefined){
               this.setdate = this.dp;
           }
           else{
               this.setdate = this.todaydate;
           }
           if(this.product_type != "emscc" && !this.atten_flag){
               val = 0;
           }
           let parms = {
            "section_id":this.globalObj.section_id,
            "session_id":this.globalObj.sessionid,
            "subject_id":val,
            "attendance_date":this.setdate,
            "start_time": this.batch_start_time,
            "end_time": this.batch_end_time
            }
            if(this.product_type == 'emscc'){
                parms['start_time'] = this.batch_start_time
                parms['end_time'] = this.batch_end_time
            }else{
                parms['start_time'] = ""
                parms['end_time'] = ""
                parms["lecture_id"]= this.lecture_id
           }
        console.log("hello")
            this.http.post(this.myService.constant.apiURL+ "student_subject_attendances/subjectattendance", parms).subscribe(details => {
               
                const data: any = details;
                this.subjectlistother = data.response.dataobj;
                this.ttlcount = this.subjectlistother.length;

                let attendcount = data.response.attendcount;
                this.lcount = attendcount.lcount;
                this.pcount = attendcount.pcount;
                this.acount = attendcount.acount;
                this.attendanceidlist.length = 0;
                this.attendancelist.length = 0;
                this.userlist.length = 0;
                    this.subjectlistother.forEach( obj => {
                        this.attendanceidlist.push(obj.id);
                        this.attendancelist.push(obj.attendance_status);
                        this.userlist.push(obj.user_id);
                    })
            });
  }else{
      this.classsection = '-'; 
      this.subjectlistother = []; 
      this.initialiazeCount();
  }
}

  initialiazeCount(){
      this.pcount = 0;
      this.acount = 0;
      this.ppcount = 0;
      this.lcount = 0;
      this.ttlcount = 0;
  }
  
  setAttendancefilter(value){
      
    this.ppselected = false;
    this.aselected = false;
    this.lselected = false;
    this.pselected = false;
  
    if(value == "Default Attendance") {
        this.conditionbasedattendstatus = '';
    }
    else if(value == 'Present'){
       this.pselected = true;
       this.conditionbasedattendstatus = 'P';
    }
    else if(value == 'Absent'){
        this.aselected = true;
        this.conditionbasedattendstatus = 'A';
    }
    else if(value == 'Leave'){
       this.lselected = true;
       this.conditionbasedattendstatus = 'L';
   }
   for(let i=0; i<this.ttlcount; i++){
       this.attendancelist[i] = this.conditionbasedattendstatus;
   }
  
   if(value == "Default Attendance") {
    
  
        this.getDailyAttendanceList(); 
        this.getsubjectwiselist(this.globalObj.subject_id);
    
   }
 } 

 setattendancestatus(value, userid, index){
    this.userlist.forEach((element, val)=>{
        if(element == userid) this.attendancelist[val] = value;
    });
 }
    
 onSubmit(event){
      event.preventDefault();
      let blankattendcount = false;
      this.dp = $("#dp").val();
      if(this.dp != undefined && this.dp != ''){  

        let d = new Date(this.dp);
            var d1: any = new Date(this.dp); 
            var d2: any = new Date();
            d1.setHours(0,0,0,0);
            d2.setHours(0,0,0,0);
            var diff = d2 - d1;
           
            if(diff < 0){
                this.responseMessage = true;
                this.popmessage = this.translate.instant('attendance_for_future_date_not_allowed');
                return;
            }
            this.starttimeflag = $("#start_time_value").val();
            blankattendcount = this.attendancelist.indexOf("")!=-1?true:false;
            
            if(blankattendcount){
                this.responseMessage = true; 
                this.popmessage =   this.translate.instant('select_all_student_attendance')
                return; 
            }
            
            if(this.product_type == "emscc" || this.atten_flag_other){
                if(this.assignedsectionflag){
                    this.responseMessage = true; 
                    this.popmessage = (this.product_type == "emscc")?   this.translate.instant('please_select_course_type'):   this.translate.instant('please_select_class'); 
                    return;
                }
                else if(this.assignedsubjectflag){
                    this.responseMessage = true; 
                    this.popmessage = (this.product_type == "emscc")?   this.translate.instant('please_select_batch'):  this.translate.instant('please_select_section');  
                    return;  
                }
                else if(this.subjectdetailflag){
                    this.responseMessage = true; 
                    this.popmessage =    this.translate.instant('please_select_subject')
                    return;  
                }
                if(this.product_type == "emscc"){
                    if(this.starttimeflag == '0'){
                        this.responseMessage = true; 
                        this.popmessage =  this.translate.instant('please_select_time_slot')
                        return;
                    }
                }else{
                    if(this.period_start_time.value == '0'){
                        this.responseMessage = true; 
                        this.popmessage = this.translate.instant('please_select_lecture')
                        return;  
                    }
                }
            }
                
                if(this.attendancelist.length != 0 && this.userlist.length != 0){ 
                 
                  let parms = {
                      "user_id":this.userlist,
                      "subject_id":this.globalObj.subject_id,
                      "section_id":this.globalObj.section_id,
                      "session_id":this.globalObj.sessionid,
                      "school_id":this.globalObj.school_id,
                      "attendanceid":this.attendanceidlist,
                      "attendance_status":this.attendancelist,
                      "attendance_date":this.dp,
                      "added_by":this.globalObj.userid,
                      "added_date":this.todaydate,
                      "token": this.globalObj.token
                  };

                  if(this.product_type == "emscc" || this.atten_flag){
                    parms['batch_start_time'] = this.batch_start_time;
                    parms['batch_end_time'] = this.batch_end_time;
                    parms['lecture_id'] = this.lecture_id;
                  }

                  if(!this.atten_flag_other && this.product_type != 'emscc'){
                    parms['subject_id'] = '0';
                  }

                  if(this.product_type != "emscc"){
                    parms['lecture_id'] = this.lecture_id; 
                  }
                 
                this.http.post(this.myService.constant.apiURL+ "student_subject_attendances/markattendance", parms).subscribe(details => {
                    const data: any = details;
                   console.log(data.response.message);
                    this.responseMessage = true; 
                    this.popmessage = this.translate.instant(data.response.message);
                    
                    if(this.product_type != 'emscc' && this.atten_flag_other)
                        this.msgtype = 2;
                 });
                }else{
                   this.responseMessage = true;
                   this.popmessage =  this.translate.instant('no_students_selected')
                }
        }else{
            this.responseMessage = true;
            this.popmessage = this.translate.instant('please_select_date')
        }  
  }  
}
