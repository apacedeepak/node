import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,PopoverController,ToastController, Content } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { HttpClient } from '@angular/common/http'
import { DatepickercalendarPage } from '../datepickercalendar/datepickercalendar';
/**
 * Generated class for the AttendancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-attendance',
  templateUrl: 'attendance.html',
})
export class AttendancePage  {
    
    @ViewChild(Content) content: Content;
  public globalObj: any = {};
  date: any;
  data :any={};
   daysInThisMonth: any;
  daysInLastMonth: any;
  daysInNextMonth: any;
  monthNames: string[];
  currentMonth: any;
  currentYear: any;
  currentDate: any;
  
  
  
  constructor(private http: HttpClient,private popCtrl: PopoverController,
      private myProvider: CommonProvider,private toastCtrl: ToastController) {
         this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
         this.globalObj.userType = window.localStorage.getItem('userType');
        this.globalObj.loginId = window.localStorage.getItem('loginId');
        this.globalObj.sessionId = window.localStorage.getItem('sessionId');
        this.globalObj.schoolId = window.localStorage.getItem('schoolId');
        this.globalObj.token = window.localStorage.getItem('token');
        this.globalObj.studSectionId = window.localStorage.getItem('studSectionId');
        this.globalObj.studentUserId = window.localStorage.getItem('studentUserId');
     }
  
   ionViewDidLoad() {
       
       if(this.globalObj.userType.toLowerCase() == 'parent'){
           this.globalObj.loginId = this.globalObj.studentUserId;
           this.globalObj.userType = 'Student';
       }
       
    this.globalObj.tabSelected = 'attendance'
    
    this.globalObj.reasonList = [];
    this.globalObj.leave_reason = '';
    this.globalObj.reasonDesc = '';
    this.globalObj.reasonDeatils = [];
    this.globalObj.editFlag = 0;
    this.globalObj.present = 0;
    this.globalObj.leave = 0;
    this.globalObj.absent = 0;
    //this.globalObj.editFlag = 0;
    
    this.globalObj.eventCount = 0;
    this.globalObj.holidayCount = 0;
    
    this.getLeaveReason();
    this.appliedLeaved();
    
    this.globalObj.eventDays = [];
    
    this.date = new Date();
    this.monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    //this.getDaysOfMonth();
    this.monthlyAttendance();
    
    
    let dd = this.date.getDate();
    let mm = this.date.getMonth()+1; 
    let yyyy = this.date.getFullYear();
    if(dd < 10){
         dd='0'+ dd;
    } 
    if(mm < 10){
        mm='0'+mm;
    } 
    this.globalObj.todaydate = yyyy+'-'+mm+'-'+dd;
    this.globalObj.fromDate = this.globalObj.todaydate;
    this.globalObj.toDate = this.globalObj.todaydate;
    
  }
  
  
  
    monthlyAttendance(){
    
    var y = this.date.getFullYear(), m = this.date.getMonth();
    var fromDate = new Date(y, m, 1);
    var toDate = new Date(y, m + 1, 0);
    
    let userId = this.globalObj.loginId;
    
    if(this.globalObj.userType.toLowerCase() == 'parent'){
        userId = this.globalObj.studentUserId;
    }
    
    let params = {
      from_date : fromDate,
      to_date   : toDate,
      user_id   :userId,
      session_id:this.globalObj.sessionId,
      school_id : this.globalObj.schoolId,
      }
     let url = this.globalObj.serverUrl+'student_subject_attendances/studentattendance';

     this.http.post(url,params).subscribe(resp => {
      const details: any = resp;
      this.data = details.response;
      
       console.log(this.data);
        this.getDaysOfMonth(resp);
      return resp;
     })
    
  }
  
  
  

  getDaysOfMonth(resp) {
    //var data = this.monthlyAttendance();
    this.globalObj.eventDays = [];
    
    this.daysInThisMonth = new Array();
    this.daysInLastMonth = new Array();
    this.daysInNextMonth = new Array();
  
    
    
    this.currentMonth = this.monthNames[this.date.getMonth()];
    this.currentYear = this.date.getFullYear();
    if(this.date.getMonth() === new Date().getMonth()) {
      this.currentDate = new Date().getDate();
    } else {
      this.currentDate = 999;
    }
  
    var firstDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
    var prevNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
    for(var i = prevNumOfDays-(firstDayThisMonth-1); i <= prevNumOfDays; i++) {
      this.daysInLastMonth.push(i);
    }
  
    var thisNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDate();
    for (var i = 0; i < thisNumOfDays; i++) {
      this.daysInThisMonth.push(i+1);
    }
  
    var lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDay();
    var nextNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0).getDate();
    for (var i = 0; i < (6-lastDayThisMonth); i++) {
      this.daysInNextMonth.push(i+1);
    }
    var totalDays = this.daysInLastMonth.length+this.daysInThisMonth.length+this.daysInNextMonth.length;
    if(totalDays<36) {
      for(var i = (7-lastDayThisMonth); i < ((7-lastDayThisMonth)+7); i++) {
        this.daysInNextMonth.push(i);
      }
    }
    
   
    for(let i in this.daysInThisMonth){
        var flag = false;
        var color = '';
        var date = '';
        var attendance_status = '';
        let dateCheck = [];
        for(let k in this.data.datewise){
            
            let dateSplit = this.data.datewise[k].attendance_date.split('-');
            let day = this.daysInThisMonth[i];
            if(this.daysInThisMonth[i] <= 9){
                day = '0'+this.daysInThisMonth[i];
            }
            
            if(dateSplit[2] == day){
                flag = true;
                date = this.data.datewise[k].attendance_date;
                
                if(this.data.datewise[k].attendance_status == 'P'){
                    color = 'presentcolor';
                    dateCheck.push(day);
                    attendance_status = this.data.datewise[k].attendance_status;
                }else if(this.data.datewise[k].attendance_status == 'L'){
                    color = 'leavecolor';
                    attendance_status = this.data.datewise[k].attendance_status;
                }else if(this.data.datewise[k].attendance_status == 'A'){
                    if(dateCheck.indexOf(day) == -1){
                        color = 'absentcolor';
                        attendance_status = this.data.datewise[k].attendance_status;
                    }
                }
            }
        }
        if(flag){
            this.globalObj.eventDays.push({day:this.daysInThisMonth[i],color:color, date: date, attendance_status:attendance_status})
        }else{
            this.globalObj.eventDays.push({day:this.daysInThisMonth[i],color:'', date: '', attendance_status:''})
        }
    }
    this.globalObj.present = 0;
    this.globalObj.absent = 0;
    this.globalObj.leave = 0;
    
    //console.log(this.globalObj.eventDays)
    
    for(let k in this.globalObj.eventDays){
        if(this.globalObj.eventDays[k].attendance_status == 'P'){
            this.globalObj.present = this.globalObj.present + 1;
        }
        if(this.globalObj.eventDays[k].attendance_status == 'A'){
            this.globalObj.absent = this.globalObj.absent + 1;
        }
        if(this.globalObj.eventDays[k].attendance_status == 'L'){
            this.globalObj.leave = this.globalObj.leave + 1;
        }
    }
    
    
    this.getHolidays();
    
    
  }
  
  
  getHolidays(){
      var y = this.date.getFullYear(), m = this.date.getMonth();
    var fromDate = new Date(y, m, 1);
    var toDate = new Date(y, m + 1, 0);
      
      let params = {
                "applicable_for":"Student",
                "school_id":this.globalObj.schoolId,
                "from_date":fromDate,
                "to_date":toDate
            }
      let url = this.globalObj.serverUrl+'holiday_masters/getholidays';

     this.http.post(url,params).subscribe(resp => {
      const details: any = resp;
      var eventList = details.response.eventList;
      var holidayList = details.response.holidayList;
      
      let eventArr = [];
      let eventDateArr = [];
      let holidayDateArr = [];
      let holidayArr = [];
      
        this.globalObj.eventCount = eventList.length;
        this.globalObj.holidayCount = holidayList.length;
        
        
        
        for(let k in this.globalObj.eventDays){
            for(let e in eventList){
                let splitdate = eventList[e].event_date.split('-');
                if(splitdate[2] == this.globalObj.eventDays[k].day && this.globalObj.eventDays[k].attendance_status != 'P'){
                    eventArr.push(k);
                    eventDateArr.push(eventList[e].event_date);
                }
            }
            
            for(let h in holidayList){
                let splitdate = holidayList[h].holiday_date.split('-');
                if(splitdate[2]== this.globalObj.eventDays[k].day && this.globalObj.eventDays[k].attendance_status != 'P'){
                    holidayArr.push(k);
                     holidayDateArr.push(holidayList[h].holiday_date);
                }
            }
        }
        
       // console.log(holidayArr)
        
        for(let e in eventArr){
            let k = eventArr[e];
            this.globalObj.eventDays[k].color = 'eventcolor';
            this.globalObj.eventDays[k].date = eventDateArr[e];
        }
        
        for(let e in holidayArr){
            let k = holidayArr[e];
            this.globalObj.eventDays[k].color = 'holidaycolor';
            this.globalObj.eventDays[k].date = holidayDateArr[e];
        }
         //console.log(this.globalObj.eventDays)
        
     })
  }
  

  goToLastMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
   // this.getDaysOfMonth();
   this.monthlyAttendance();
  }
  goToNextMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0);
  //  this.getDaysOfMonth();
  this.monthlyAttendance();
  }
  
  openCalendar(flag){
      let modal = this.popCtrl.create(DatepickercalendarPage,{},{cssClass: 'contact-popover', showBackdrop: true});
      modal.onDidDismiss(data => {
          if(data){
              if(flag == 'fromdate'){ 
                  if(data.date > this.globalObj.toDate){
                      //this.presentToast('Please select from date less or equal to date.');
                      this.globalObj.fromDate =data.date;
                      this.globalObj.toDate =data.date;

                  }else if(data.date < this.globalObj.todaydate){ 
                      this.presentToast('Please select from date equal or greater than today date.');
                      this.globalObj.fromDate =this.globalObj.fromDate;
                  }else{
                        this.globalObj.fromDate = data.date;
                  }
              }else{
                if(this.globalObj.fromDate > data.date){
                    this.presentToast('Please select to date greater or equal to from date.');
                    this.globalObj.toDate = this.globalObj.toDate;
                }else if(this.globalObj.toDate < this.globalObj.todaydate){
                      this.presentToast('Please select to date equal or greater than today date.');
                      this.globalObj.toDate =this.globalObj.toDate;
                  }else{
                    this.globalObj.toDate = data.date;
                }
                  
              }
            
          }
        });
      modal.present();
  }
  
  
  getLeaveReason(){
      
      let params = {"school_id":this.globalObj.schoolId}
      let url = this.globalObj.serverUrl+'leave_reasons/leavereason';

        this.http.post(url,params).subscribe(resp => {
         const details: any = resp;
         this.globalObj.reasonList = details.response.reason;
        });
  }
  
  submitLeave(){
      
      if(!this.globalObj.leave_reason){
          this.presentToast("Reason cannot be empty");
          return false;
      }
      if(!this.globalObj.reasonDesc){
          this.presentToast("Detail cannot be empty");
          return false;
      }
      
      let userId = this.globalObj.loginId;
    
        if(this.globalObj.userType.toLowerCase() == 'parent'){
            userId = this.globalObj.studentUserId;
        }
      
      let params = {
            "user_id":userId,
            "to_date":this.globalObj.toDate,
            "from_date":this.globalObj.fromDate,
            "session_id":this.globalObj.sessionId,
            "reason":this.globalObj.leave_reason,
            "details":this.globalObj.reasonDesc,
            "addedDate":this.globalObj.todaydate,
            "school_id":this.globalObj.schoolId,
            "added_by":this.globalObj.loginId,
            "token":this.globalObj.token
            }
            
        if(this.globalObj.editFlag){
          params['leave_id'] = this.globalObj.editId;
          params['modefiedDate'] = this.globalObj.todaydate;
          params['modifiedBy'] = this.globalObj.loginId;
        }
        
      let url = this.globalObj.serverUrl+'leaveApplyStudents/markleave';

        this.http.post(url,params).subscribe(resp => {
         const details: any = resp;
         this.globalObj.editFlag = 0;
         
         if(details.response.status == '201' && details.response.message == 'Attendance already marked'){
             this.presentToast("Attendance already marked");
         }else if(details.response.status == '202'){
             this.presentToast("Leave already applied in this date range");
//             this.globalObj.fromDate = this.globalObj.fromDate;
//            this.globalObj.toDate = this.globalObj.toDate;
//            this.globalObj.leave_reason = '';
//            this.globalObj.reasonDesc = '';
         }else{
             this.presentToast("Leave applied successfully");
             this.globalObj.fromDate = this.globalObj.todaydate;
            this.globalObj.toDate = this.globalObj.todaydate;
            this.globalObj.leave_reason = '';
            this.globalObj.reasonDesc = '';
         }
         
         this.appliedLeaved();
         
        });
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
  
  appliedLeaved(){
      
      let userId = this.globalObj.loginId;
    
        if(this.globalObj.userType.toLowerCase() == 'parent'){
            userId = this.globalObj.studentUserId;
        }
      
      let params = {
        "session_id":this.globalObj.sessionId,
        "section_id":this.globalObj.studSectionId,
        "user_id":userId,
        "school_id":this.globalObj.schoolId,
        "token":this.globalObj.token
        }
      let url = this.globalObj.serverUrl+'leaveApplyStudents/getmarkedleave';

        this.http.post(url,params).subscribe(resp => {
         const details: any = resp;
         this.globalObj.reasonDeatils = details.response;
        });
  }
  
   doRefresh(event){
        this.appliedLeaved();
        event.complete();

}
  
  deleteLeave(id){
      
      let params = {
        id: id,
        status: 'Deleted'
      }
      let url = this.globalObj.serverUrl+'leaveApplyStudents/setleavestatus';

        this.http.post(url,params).subscribe(resp => {
         const details: any = resp;
         this.presentToast("Leave delete successfully");
           this.appliedLeaved();
        });
  }
  
  editLeave(id){
      this.globalObj.editFlag = 1;
      this.globalObj.editId = id;
      this.content.scrollTo(0, 0, 100);
      for(let k in this.globalObj.reasonDeatils){
          if(this.globalObj.reasonDeatils[k].id == id){
              this.globalObj.fromDate = this.globalObj.reasonDeatils[k].from_date;
                this.globalObj.toDate = this.globalObj.reasonDeatils[k].to_date;
                this.globalObj.leave_reason = this.globalObj.reasonDeatils[k].reason;
                this.globalObj.reasonDesc = this.globalObj.reasonDeatils[k].detail;
          }
      }
  }
  
//  leaveApplyRefesh(){
//      this.globalObj.fromDate = 
//  }

}
