import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, PopoverController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { CommonProvider } from '../../providers/common/common';
import { DatePicker } from '@ionic-native/date-picker';
import { DatepickercalendarPage } from '../datepickercalendar/datepickercalendar';

/**
 * Generated class for the TeacherattendancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-teacherattendance',
  templateUrl: 'teacherattendance.html',
})
export class TeacherattendancePage {

  tabbed: string = 'attendance';
  attendance_switch: string = 'daily';
  rows: any = []
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
  domainUrl: any = '';
  serverUrl: any = '';
  attendance_value: string = '';
  
  public testRadioOpen: boolean;
  
  constructor(private toastCtrl: ToastController, private myProvider: CommonProvider,
   private http: HttpClient, public navCtrl: NavController,
     public navParams: NavParams,private datePicker: DatePicker,
     public popCtrl: PopoverController, private alertCtrl: AlertController) {
     this.globalObj.leavedetail = [];
  }

  ionViewCanEnter() {
    this.globalObj.sessionid = window.localStorage.getItem('sessionId');  
    this.globalObj.school_id = window.localStorage.getItem('schoolId'); 
    this.globalObj.userid = window.localStorage.getItem('loginId');
    this.globalObj.user_type = window.localStorage.getItem('userType');
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.section_id = window.localStorage.getItem('sectionId');
    this.globalObj.class_teacher_section_id = localStorage.getItem('classTeacherSectionId');
    this.globalObj.isClassTecher = localStorage.getItem('isClassTecher');
    this.domainUrl = this.myProvider.globalObj.constant.domainUrl;
    this.serverUrl = this.myProvider.globalObj.constant.apiURL;
    
    this.globalObj.selectClass = '';
    this.globalObj.selectSec = '';
    this.globalObj.selectSub = '';
    this.globalObj.lecture = '';
    this.globalObj.lectureTotCount = 0;
    this.globalObj.lecturePresent = 0;
    this.globalObj.assignedClassData =[];
    this.globalObj.assignedSectionData =[];
    this.globalObj.assignedSubjectData =[];
    this.globalObj.assignedLecture =[];
    this.globalObj.lectureAtten =[];
    this.globalObj.allAttendaceStatus ='';
    this.globalObj.popUpFlag = true;
    
    
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
    this.dp = this.yyyy+'-'+this.mm+'-'+this.dd;
    this.globalObj.date = this.dp;
    this.globalObj.lectureDate = this.dp;
    this.getDailyAttendanceList();  
    
    this.getClass();
    this.leaveDetail();
    
  }

  setAttendance(){
    if(this.globalObj.dailyAttendanceData){
      this.rows = []
      this.globalObj.status = this.setStatusBtn(this.attendance_value)
      let attend_status = (this.globalObj.status.toLowerCase() == 'close') ? 'A': 'P'; 
      this.globalObj.dailyAttendanceData.forEach((value, i)=>{
        this.rows[i] = {
          "name": value.student_name,
          "status": this.globalObj.status,
          "roll": value.roll_no,
          "user_id": value.user_id,
          "index": i,
          "attend_status": attend_status
        }
      })
    }
  }
  
  pickDate(){
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => console.log('Got date: ', date),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  setStatusBtn(status): string{
    return (status.toLowerCase() == 'a') ? 'close': 'checkmark'
  }

  changeAttendStatus(e, user_id, current_status): void{
    current_status = (current_status.toLowerCase() == 'close')? 'checkmark': 'close' //toggle
    this.rows.map(obj => {
      if(obj.user_id == user_id) {
        obj.status = current_status
        obj.attend_status = (current_status.toLowerCase() == 'close')? 'A': 'P'   
      } 
    })
  }

  initialiazeCount(){
    this.pcount = 0;
    this.ttlcount = 0;
    this.userlist = []
    this.attendancelist = []
    this.attendanceidlist = []
  }

  getDailyAttendanceList(){
    this.initialiazeCount();
    if(this.globalObj.isClassTecher) this.classsection = this.globalObj.isClassTecher; 
    const parms = { 
        "section_id": this.globalObj.class_teacher_section_id, 
        "session_id": this.globalObj.sessionid, 
        "subject_id": 0, 
        "attendance_date": this.dp
    };

    this.http.post(this.serverUrl+ 'student_subject_attendances/attendanceuser', parms).subscribe(details => {
        const data: any = details;
        if(data.response_status.status == "200"){
            this.ttlcount = data.response.length;
            this.globalObj.dailyAttendanceData = data.response;
            let attend_status = 'P';
            data.response.forEach((value, i)=>{
                if(value.attendance_status == "P"){
                    this.pcount += 1;
                } 
                this.userlist[i] = value.user_id;
                this.attendancelist[i] = (value.attendance_status) ? value.attendance_status: 'P';
                this.attendanceidlist[i] = value.id;
                value.attendance_status = this.setStatusBtn(value.attendance_status)

                this.rows[i] = {
                  "name": value.student_name,
                  "status": value.attendance_status,
                  "roll": value.roll_no,
                  "user_id": value.user_id,
                  "index": i,
                  "attend_status": this.attendancelist[i]
                }
            }); 
        }
    });
  }

  segmentChanged(e){
    
  }

  toggleAttendance(){
    
  }

  presentToast(msg) {
    msg = (msg) ? msg: "some error" 
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  onSubmit(event){
    event.preventDefault()

    this.globalObj.subject_id = (this.attendance_switch == 'lecture') ? this.globalObj.subject_id: 0
    this.attendancelist = this.rows
                            .map(obj => obj.attend_status)
    let parms = {
      "user_id": this.userlist,
      "subject_id": this.globalObj.subject_id,
      "section_id": this.globalObj.class_teacher_section_id,
      "session_id": this.globalObj.sessionid,
      "school_id": this.globalObj.school_id,
      "attendanceid": this.attendanceidlist,
      "attendance_status": this.attendancelist,
      "attendance_date": this.dp,
      "added_by": this.globalObj.userid,
      "added_date": this.todaydate,
      "token": this.globalObj.token
    };

    this.http.post(this.serverUrl + "student_subject_attendances/markattendance", parms).subscribe(details => {
        const data: any = details;
        this.getDailyAttendanceList();
        this.presentToast("Attendance marked successfully")
     });
  }
  
  openCalendar(){
      let modal = this.popCtrl.create(DatepickercalendarPage,{},{cssClass: 'contact-popover', showBackdrop: true});
      modal.onDidDismiss(data => {
          if(data){
              if(data.date > this.todaydate ){
                    this.presentToast("Date is less than or equal to today's date.");
                    this.globalObj.date = this.globalObj.date;
              }else{
                    this.globalObj.date = data.date;
                    this.dp=data.date;
                    this.getDailyAttendanceList();
                }
          }
        });
      modal.present();
  }
  
  openLectureCalendar(){
      let modal = this.popCtrl.create(DatepickercalendarPage,{},{cssClass: 'contact-popover', showBackdrop: true});
      modal.onDidDismiss(data => {
          if(data){
              if(data.date > this.todaydate ){
                    this.presentToast("Date is less than or equal to today's date.");
                    this.globalObj.lectureDate = this.globalObj.lectureDate;
              }else{
                    this.globalObj.lectureDate = data.date;
                    this.globalObj.lecture = '';
                }
            
           }
        });
      modal.present();
  }
  
  
  leaveDetail(){
      
      let params = {
            "session_id":this.globalObj.sessionid,
            "section_id":this.globalObj.class_teacher_section_id,
            "teacherflag":1,
            "school_id":this.globalObj.school_id,
            "token":this.globalObj.token
            };
      
      this.http.post(this.serverUrl + "leaveApplyStudents/getmarkedleave", params).subscribe(details => {
        const data: any = details;
        this.globalObj.leavedetail = data.response;
        
     });
  }
  
  
  approvReject(leaveApplyId){
      let popover = this.popCtrl.create('LeaveapprovPage',{option: 'radio'});
    popover.present({
      ev: event

    });
    popover.onDidDismiss(data => {
        if(data){
            this.globalObj.leaveappliedStatus = data.status;
            if(data.status == 'approve'){
                this.leaveApprove(leaveApplyId);
            }else{
                this.rejectAlert(leaveApplyId);
            }
        }
    });
  }
  
  leaveApprove(leaveApplyId){
      let params = {
            "id":leaveApplyId,
            "section_id":this.globalObj.class_teacher_section_id,
            "status":'Approved',
            "school_id":this.globalObj.school_id,
            "token":this.globalObj.token
            };
      
      this.http.post(this.serverUrl + "leaveApplyStudents/setleavestatus", params).subscribe(details => {
        const data: any = details;
        if(data.response.status == '200'){
            this.leaveDetail();
        }
        
     });
  }
  
  
  rejectAlert(leaveApplyId){
      let popover = this.popCtrl.create('LeaveapprovPage',{option: 'reason'});
        
        popover.onDidDismiss(data => {
            if(data){
                if(data.rejectedFlag == 'rejected'){
                    this.leaveReject(leaveApplyId, data.rejectedReason);
                }
            }
        });
        popover.present();
      }
      
      leaveReject(leaveApplyId, reason){
          
          let params = {
                "id":leaveApplyId,
                "section_id":this.globalObj.class_teacher_section_id,
                "status":'Rejected',
                "school_id":this.globalObj.school_id,
                "token":this.globalObj.token,
                "reject_reason": reason
          }
          this.http.post(this.serverUrl + "leaveApplyStudents/setleavestatus", params).subscribe(details => {
                const data: any = details;
                if(data.response.status == '200'){
                    this.leaveDetail();
                }

             });
      }
      
      getClass(){ 
         
        const params = {
            "user_id": this.globalObj.userid,
            "session_id": this.globalObj.sessionid,
            "school_id": this.globalObj.school_id,
            "token": this.globalObj.token
          }
          const url = this.serverUrl + 'users/assignedclass';
            this.http.post(url, params)
              .subscribe(details => {
                const data: any = details;
                if(data.response){
                  this.globalObj.assignedClassData = data.response.assigned_classes;
                }
              });
      }
      
      getSection(){
          if(this.globalObj.popUpFlag){
              this.globalObj.popUpFlag = false;
            this.globalObj.assignedSectionData = [];
            this.globalObj.selectSec = '';
            this.globalObj.assignedSubjectData = [];
            this.globalObj.selectSub = '';
            this.globalObj.assignedLecture = [];
            this.globalObj.lecture = '';


            if(this.globalObj.selectClass){
              const params = {
                  "user_id": this.globalObj.userid,
                  "session_id": this.globalObj.sessionid,
                  "class_id": this.globalObj.selectClass,
                  "token": this.globalObj.token
                }

                const url = this.serverUrl + 'users/assignedsection';
                this.http.post(url, params)
                  .subscribe(details => {
                    const data: any = details;
                    this.globalObj.assignedSectionData = data.response.assigned_sections;
                    this.globalObj.popUpFlag = true;
                  });
            }else{
                this.globalObj.assignedSectionData = [];
                this.globalObj.popUpFlag = true;
            }
          }
      }
      
      getSubject(){
          this.globalObj.assignedSubjectData = [];
          this.globalObj.selectSub = '';
          this.globalObj.assignedLecture = [];
          this.globalObj.lecture = '';
          
          if(this.globalObj.selectSec){
        const params = {
            "user_id": this.globalObj.userid,
            "session_id": this.globalObj.sessionid,
            "section_id": this.globalObj.selectSec,
            "token": this.globalObj.token
          }

          const url = this.serverUrl + 'user_subjects/assignedsubjects';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
              this.globalObj.assignedSubjectData = data.response.assigned_subjects
            });
          }else{
              this.globalObj.assignedSubjectData = [];
          }
      }
      
      getLecture(){
          
          this.globalObj.assignedLecture = [];
          this.globalObj.lecture = '';
          
          if(this.globalObj.selectSub){
        const params = {
            "user_id": this.globalObj.userid,
            "session_id": this.globalObj.sessionid,
            "section_id": this.globalObj.selectSec,
            "token": this.globalObj.token,
            "subject_id": this.globalObj.selectSub
          }

          const url = this.serverUrl + 'student_subject_attendances/timeslot';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
              this.globalObj.assignedLecture = data.response
            });
          }else{
              this.globalObj.assignedLecture = [];
          }
      }
      
      getStudentList(){
          if(this.globalObj.lecture){
              this.globalObj.lectureAtten = [];
            const params =  {
                   "section_id":this.globalObj.selectSec,
                   "session_id":this.globalObj.sessionid,
                   "subject_id":this.globalObj.selectSub,
                   "attendance_date":this.globalObj.lectureDate,
                   "start_time":"",
                   "end_time":"",
                   "lecture_id":this.globalObj.lecture,
                   "token": this.globalObj.token,
               }
        
          const url = this.serverUrl + 'student_subject_attendances/subjectattendance';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
             
               this.globalObj.lectureTotCount = data.response.dataobj.length;
                this.globalObj.lecturePresent = data.response.attendcount.pcount;
                
                const lectAtt = data.response.dataobj;
                
                for(let k in lectAtt){
                    var name = 'checkmark';
                    if(lectAtt[k].attendance_status == 'A'){
                        name = 'close';
                    }
                    this.globalObj.lectureAtten.push({
                        'id':lectAtt[k].id,
                        'attendance_status':lectAtt[k].attendance_status,
                        'user_id':lectAtt[k].user_id,
                        'admission_no':lectAtt[k].admission_no,
                        'student_name':lectAtt[k].student_name,
                        'iconName': name
                    });
                }
                
                
            });
          }else{
              this.globalObj.lectureAtten = [];
          }
      }
      
      setLectureAttendance(){
          if(this.globalObj.allAttendaceStatus == 'a'){
              for(let k in this.globalObj.lectureAtten){
                  this.globalObj.lectureAtten[k].iconName = 'close';
                  this.globalObj.lectureAtten[k].attendance_status = 'A';
                  
              }
          }else{
               for(let k in this.globalObj.lectureAtten){
                  this.globalObj.lectureAtten[k].iconName = 'checkmark';
                  this.globalObj.lectureAtten[k].attendance_status = 'P';
              }
          }
          this.globalObj.lectureAtten = this.globalObj.lectureAtten;
      }
      
      changeAttendanceStatus(index){
          if(this.globalObj.lectureAtten[index].iconName == 'checkmark'){
              this.globalObj.lectureAtten[index].iconName = 'close';
              this.globalObj.lectureAtten[index].attendance_status = 'A';
          }else if(this.globalObj.lectureAtten[index].iconName == 'close'){
              this.globalObj.lectureAtten[index].iconName = 'checkmark';
              this.globalObj.lectureAtten[index].attendance_status = 'P';
          }
          this.globalObj.lectureAtten = this.globalObj.lectureAtten;
      }
      
      
      onSubmitLectureAttend(event){
          
            var lectureName = '';
            
            for(let k in this.globalObj.assignedLecture){
                if(this.globalObj.assignedLecture[k].lecture_id == this.globalObj.lecture){
                    lectureName = this.globalObj.assignedLecture[k].lecture_name;
                }
            }
            
            let userArr = [];
            let attendanceid = [];
            let attendance_status = [];
            
            for(let k in this.globalObj.lectureAtten){
                userArr.push(this.globalObj.lectureAtten[k].user_id)
                attendanceid.push(this.globalObj.lectureAtten[k].id)
                attendance_status.push(this.globalObj.lectureAtten[k].attendance_status)
            }
            
            const params =
                {
                    "user_id":userArr,
                    "subject_id":this.globalObj.selectSub,
                    "section_id":this.globalObj.selectSec,
                    "session_id":this.globalObj.sessionid,
                    "school_id":this.globalObj.school_id,
                    "attendanceid":attendanceid,
                    "attendance_status":attendance_status,
                    "attendance_date":this.globalObj.lectureDate,
                    "added_by":this.globalObj.userid,
                    "added_date":this.dp,
                    "token":this.globalObj.token,
                    "batch_start_time":lectureName,
                    "batch_end_time":lectureName,
                    "lecture_id":this.globalObj.lecture
                }
                
            const url = this.serverUrl + 'student_subject_attendances/markattendance';
          this.http.post(url, params)
            .subscribe(details => {
              const data: any = details;
              const status = data.response.status;
              const statu1s = data.response.message;
              this.globalObj.lecture='';
              this.presentToast("Attendance marked successfully")
            });
      
      }
      
      
      doRefresh(event){
        this.leaveDetail();
        event.complete();

        }

  

}
