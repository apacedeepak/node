import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import * as $ from 'jquery'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-viewprofile',
  templateUrl: './viewprofile.component.html',
  styleUrls: ['./viewprofile.component.css']
})
export class ViewprofileComponent implements OnInit {
    
    
//    defaultConfig : object = {
//        header: {
//            left: 'prev',
//            center: 'title',
//            right: 'next'
//        },
//        editable: true,
//        eventLimit: true, // allow "more" link when too many events
//        navLinks: true,
//    }
    
    calendarOptions: Options;
    //displayEvent: any;
    @ViewChild(CalendarComponent) ucCalendar4: CalendarComponent;

    public today: any;
    public dd: any;
    public mm : any;
    public yyyy: any;
    public todaydate: any;
    public mon: any;
    public global: any = {};
    public timetablelist: any = [];
    public eventdata: any = [];
    public feeDues: any = [];
    public feePaid: any = [];
    public monthData: any = [];
    public config: any = [];
    public globalObj: any = {};
    public allHomework: any = [];
    public remarksList: any = [];
    studentData: any = [];
    percentage: any;
    numerator: any;
    denomenator: any;
    from_date: any;
    total: any = 0;
    counts: any = {};
    pcount: any = 0;
    acount: any = 0;
    lcount: any = 0;
    mylang:any='';
    public currentMonthFirstDate: any;
    public containerEl: JQuery;

    
  constructor(private http: HttpClient, private myService: BackendApiService, activatedRoute: ActivatedRoute, private el: ElementRef,private translate: TranslateService) {
        activatedRoute.queryParams.subscribe(params => {
        this.globalObj.id = params['id'];
        this.globalObj.classSec = params['section'];
        this.globalObj.calledfrom = params['calledfrom'];
        this.globalObj.revertby = params['revertby'];
        // alert(this.callfrom);
    });
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }
  calcpercentage(){
      return (this.numerator / this.denomenator)*100;
  }
  
//  ngAfterViewInit()
//    {
//        Object.assign(this.defaultConfig, this.config);
//        $(this.el.nativeElement).fullCalendar(this.defaultConfig);
//    }

  ngOnInit() {
    this.globalObj.user_id = window.localStorage.getItem('user_id');
    this.globalObj.user_type = window.localStorage.getItem('user_type');
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    this.globalObj.session_id = window.localStorage.getItem('session_id');

    this.numerator = 200;
    this.denomenator = 220;
    this.percentage = this.calcpercentage();
    
    this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.school_id = window.localStorage.getItem('school_id');
      
    this.today = new Date();
    this.dd = this.today.getDate();
    this.mm = this.today.getMonth();
    this.yyyy = this.today.getFullYear();
    //this.todaydate = this.yyyy+'-'+this.mm+'-'+this.dd;
    let month = this.today.getMonth() + 1;

    let date = this.dd;
    if(month < 10){
        month = "0"+month;
      }

      if(this.dd < 10){
        date = "0"+this.dd;
      }

      this.todaydate = this.yyyy+"-"+month+"-"+date;
      
      this.currentMonthFirstDate = new Date(this.today.getFullYear(), this.mm, 1);
    var firstDay = new Date(this.today.getFullYear(), this.mm, 1);
    var lastDay = new Date(this.today.getFullYear(), month, 0);
    
      
      
      if(this.globalObj.revertby == 'homework'){
          $('#homeworkrecord').addClass('active');
          $('#homework a').addClass('active');
          $('#feerecord').removeClass('active');
          $('#fee a').removeClass('active');
          $('#examrecord').removeClass('active');
          $('#exam a').removeClass('active');
          $('#inDisciplinerecord').removeClass('active');
          $('#indis a').removeClass('active');
          $('#libraryrecord').removeClass('active');
          $('#library a').removeClass('active');
          $('#attendancerecord').removeClass('active');
          $('#atten a').removeClass('active');
          if(this.globalObj.calledfrom == 'normal'){
                $('#allhome a').addClass('active');
                $('#all').addClass('active');
                $('#allpending a').removeClass('active');
                $('#pending').removeClass('active');
                $('#allsubmitted a').removeClass('active');
                $('#submitted').removeClass('active');
                $('#alluncheck a').removeClass('active');
                $('#unchecked').removeClass('active');
                $('#allcheck a').removeClass('active');
                $('#checked').removeClass('active');
          }else if(this.globalObj.calledfrom == 'pending'){
              $('#allhome a').removeClass('active');
                $('#all').removeClass('active');
                $('#allpending a').addClass('active');
                $('#pending').addClass('active');
                $('#allsubmitted a').removeClass('active');
                $('#submitted').removeClass('active');
                $('#alluncheck a').removeClass('active');
                $('#unchecked').removeClass('active');
                $('#allcheck a').removeClass('active');
                $('#checked').removeClass('active');
          }else if(this.globalObj.calledfrom == 'submitted'){
              $('#allhome a').removeClass('active');
                $('#all').removeClass('active');
                $('#allpending a').removeClass('active');
                $('#pending').removeClass('active');
                $('#allsubmitted a').addClass('active');
                $('#submitted').addClass('active');
                $('#alluncheck a').removeClass('active');
                $('#unchecked').removeClass('active');
                $('#allcheck a').removeClass('active');
                $('#checked').removeClass('active');
          }else if(this.globalObj.calledfrom == 'unchecked'){
              $('#allhome a').removeClass('active');
                $('#all').removeClass('active');
                $('#allpending a').removeClass('active');
                $('#pending').removeClass('active');
                $('#allsubmitted a').removeClass('active');
                $('#submitted').removeClass('active');
                $('#alluncheck a').addClass('active');
                $('#unchecked').addClass('active');
                $('#allcheck a').removeClass('active');
                $('#checked').removeClass('active');
          }else if(this.globalObj.calledfrom == 'checked'){
              $('#allhome a').removeClass('active');
                $('#all').removeClass('active');
                $('#allpending a').removeClass('active');
                $('#pending').removeClass('active');
                $('#allsubmitted a').removeClass('active');
                $('#submitted').removeClass('active');
                $('#alluncheck a').removeClass('active');
                $('#unchecked').removeClass('active');
                $('#allcheck a').addClass('active');
                $('#checked').addClass('active');
          }
      }
      
      const params2 = {
                        "school_id": this.globalObj.school_id,
                        "applicable_for": "Student"
                    };  

        this.http.post(this.myService.constant.apiURL+"holiday_masters/getholidays", params2).subscribe(holidays => {
            const holiday: any = holidays;
            this.globalObj.holidays = holiday.response.holidayList.length;
            const weekOffCount = holiday.response.weeklyOffList.length;
            this.http.get(this.myService.constant.apiURL+"sessions/getdaysbtwactiveschoolsession?school_id="+ this.globalObj.school_id).subscribe(sessions => {
                const session: any = sessions;
                this.globalObj.start_date = session.response.start_date;
                this.globalObj.end_date = session.response.end_date
               // this.globalObj.total = session.response.diffBtwSessionDates - (this.globalObj.holidays + weekOffCount);
           
            
            });
        });
        
        let feeDueParam = {
            "user_id": this.globalObj.id,
            "session_id": this.globalObj.session_id
        };
        this.http.post(this.myService.constant.apiURL+"fee_defaulters/duefee", feeDueParam).subscribe(feedues => {
            const fee: any = feedues;
            this.feeDues = fee.response.dueList;
        });
        
        
        let feePaidParam = {
            "user_id": this.globalObj.id,
            "session_id": this.globalObj.session_id,
            "school_id": this.globalObj.school_id,
        };
        this.http.post(this.myService.constant.apiURL+"receipts/studentreceipts", feePaidParam).subscribe(feepaid => {
            const fee: any = feepaid;
            this.feePaid = fee.response.receiptDetails;
        });
        
      let params = {
          from_date: '',
          search_for: '',
          subject_id: '',
          to_date: '',
          token: this.globalObj.token,
          user_id: this.globalObj.id,
      };
      this.http.post(this.myService.constant.apiURL+"homework/studenthomework", params).subscribe(data => {
          const detail: any = data; 
          this.allHomework = detail.response;
          this.globalObj.allHomeworkCount = "("+this.allHomework.length+")";
            let pendingflag = false;
            let submittedflag = false;
            let uncheckedflag = false;
            let checkedflag = false;
            if (detail.response_status.status == '200') {
              if (this.allHomework.length > 0) {
               
            this.allHomework.forEach((responsedata) => {
              if (responsedata.submitted == 0) {
                pendingflag = true;

              }
              if (responsedata.submitted == 1 && responsedata.checked == 0) {
                submittedflag = true;

              }
              if (responsedata.submitted == 1 && responsedata.checked == 0) {
                uncheckedflag = true;

              }
              if (responsedata.submitted == 1 && responsedata.checked == 1) {
                checkedflag = true;

              }
            });
            if (pendingflag) {
              this.globalObj.pendingcond = true;
            }
            else {
              this.globalObj.pendingcond = false;
            }
            if (submittedflag) {
              this.globalObj.submittedcond = true;
            }
            else {
              this.globalObj.submittedcond = false;
            }
            if (uncheckedflag) {
              this.globalObj.uncheckedcond = true;
            }
            else {
              this.globalObj.uncheckedcond = false;
            }
            if (checkedflag) {
              this.globalObj.checkedcond = true;
            }
            else {
              this.globalObj.checkedcond = false;
            }

              }
              else {
                this.globalObj.allhomecond = false;
                this.globalObj.pendingcond = false;
                this.globalObj.submittedcond = false;
                this.globalObj.uncheckedcond = false;
                this.globalObj.checkedcond = false;
              }
            }
      });
      let param = {
          user_id: this.globalObj.id
      }
      this.http.post(this.myService.constant.apiURL+"students/getstudentbyuserid", param).subscribe(data => {
          const detail: any = data; 
          this.globalObj.name = detail.response.student.name;
          this.globalObj.admission_no = detail.response.student.admission_no;
          this.globalObj.basepath = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME+'/';
          this.globalObj.student_photo = this.globalObj.basepath + detail.response.student.student_photo;
          this.globalObj.student_photo_path = detail.response.student.student_photo;
          this.globalObj.roll_no = detail.response.student.students.user_have_section.roll_no;
          this.globalObj.school_id = window.localStorage.getItem('school_id');
          this.globalObj.session_id = window.localStorage.getItem('session_id');
      });
      this.globalObj.remarkFlag = 0;
//      let para = {
//            user_id: this.globalObj.id
//        }
//        this.http.post(this.myService.constant.apiURL+"student_remark/getremarkbyuseridandfetchaccdate", para).subscribe(remark => {
//            const getremak: any = remark;
//            this.remarksList = getremak.response;
//            setTimeout(() => {
//                $(".aaa"+0).addClass('minussign');
//                $(".bbb"+0).show();
//            },300);
//      });
      
     // this.getMonthSelect();
      this.globalObj.indexFlag = 0;
      this.globalObj.signFlag = 0;
      this.getattendance();
      this.containerEl = $('#calendar');
      //var monthss = containerEl.fullCalendar('getDate');
//      console.log("dfsvgrfe")
      
      
        this.containerEl.fullCalendar({
            viewRender: () => {
                this.buildMonthList();
            }
        });
        //this.buildMonthList();
      
  }
  
  
  specialRemarks(type){
      this.globalObj.remarkFlag = 1;
      let para = {
            user_id: this.globalObj.id,
            category: type
        }
        this.http.post(this.myService.constant.apiURL+"student_remark/getremarkbyuseridandfetchaccdate", para).subscribe(remark => {
            const getremak: any = remark;
            this.remarksList = getremak.response;
            setTimeout(() => {
                $(".aaa"+0).addClass('minussign');
                $(".bbb"+0).show();
            },300);
      });
  }
  
  buildMonthList(){
      var $months = $('#months');
       $('#months').empty();
        var month: any = this.containerEl.fullCalendar('getDate');
       var initial = month.format('YYYY-MM');
       var preMon = month.format('MM');
        preMon = preMon-1;
        month.add(-preMon, 'month');
        for (var i = 0; i < 12; i++) {
            var opt = document.createElement('option');
            opt.value = month.format('YYYY-MM-01');
            opt.text = month.format('MMM YYYY');
            opt.selected = initial === month.format('YYYY-MM');
            $months.append(opt);
            month.add(1, 'month');
        }
  }
  
  monthChange(){
      var monthsVal = $('#months').val();
    //  this.containerEl.fullCalendar('gotoDate', monthsVah);
      this.ucCalendar4.fullCalendar('gotoDate', monthsVal);
      this.counts = {'pcount': 0, 'acount': 0, 'lcount': 0};
      monthsVal = monthsVal.toString();
      let dates: any  = new Date(monthsVal);
     let months = dates.getMonth() + 1;
      
     let yyyy = dates.getFullYear();
     let from_date = new Date(yyyy, months, 1);
    let lastDay = new Date(yyyy, months, 0);
    
    if(months < 10){
        months = "0"+months;
    }
    
    const fromDate = yyyy+"-"+months+"-01";
    const toDate = yyyy+"-"+months+"-"+ lastDay.getDate();
      
      
      
      const params1 = {
            "user_id": this.globalObj.id,
            "school_id": this.globalObj.school_id,
            "session_id": this.globalObj.session_id,
            "from_date": fromDate,  
            "to_date": toDate
        }; 
        this.http.post(this.myService.constant.apiURL+"student_subject_attendances/studentattendance", params1).subscribe(details => {
            const data: any = details;
            this.globalObj.present = data.response.Present;
            this.globalObj.absent = data.response.Absent;
            this.globalObj.leave = data.response.Leave;
            this.counts = {'pcount': this.globalObj.present, 'acount': this.globalObj.absent, 'lcount': this.globalObj.leave}
        });
      
  }
  
  getHolidaysMonthWise(fromDate , toDate){
      const params2 = {
            "school_id": this.globalObj.school_id,
            "applicable_for": "Student",
            "from_date": fromDate,
            "to_date": toDate
        };  

        this.http.post(this.myService.constant.apiURL+"holiday_masters/getholidays", params2).subscribe(holidays => {
            const holiday: any = holidays;
            const holidayCount = holiday.response.holidayList.length;
            const weekOffCount = holiday.response.weeklyOffList.length;
        });
  }

  getattendance(){ 
    this.http.get(this.myService.constant.apiURL+"sessions/getdaysbtwactiveschoolsession?school_id="+this.globalObj.school_id).subscribe(session => {
        const getsession: any = session;
        const startDate = getsession.response.start_date;
        const endDate = getsession.response.end_date;

        this.from_date = startDate;

        const to_date = new Date().toISOString();

        const params1 = {
            "user_id": this.globalObj.id,
            "school_id": this.globalObj.school_id,
            "session_id": this.globalObj.session_id,
            "from_date": this.from_date,  
            "to_date": this.todaydate
        }; 
        this.http.post(this.myService.constant.apiURL+"student_subject_attendances/studentattendance", params1).subscribe(details => {
            const data: any = details;
            this.globalObj.totalpresent = data.response.Present;
            this.globalObj.total = data.response.Present + data.response.Absent + data.response.Leave;
            this.globalObj.percentage = (this.globalObj.totalpresent/this.globalObj.total) * 100;
            const showAttendanceColor = data.response.datewise;
            
            this.eventdata = [];
            var color = '';
            
            for (var i in showAttendanceColor) {
                
                  
                if(showAttendanceColor[i].attendance_status == 'P'){
                    color = 'rgba(0,255,0,0.3)';
                }
                else if(showAttendanceColor[i].attendance_status == 'A'){
                   color = 'rgba(251,122,103,0.6)';
                }
                else if(showAttendanceColor[i].attendance_status == 'L'){
                   color = 'rgba(248, 202,85,0.6)';
                }
              
                var eventobj = {
                              color : color,
                              start: showAttendanceColor[i].attendance_date
                           };
                                    
                this.eventdata.push(eventobj);
                
                
            }
            
            let month =  this.currentMonthFirstDate.getMonth() + 1;
            let date =  this.currentMonthFirstDate.getDate();
            if(month < 10){
                month = "0"+month;
              } 
              if(date < 10){
                date = "0"+date;
              } 
            const fromDate = this.currentMonthFirstDate.getFullYear()+'-'+month+'-'+date;
            
            const params1 = {
                "user_id": this.globalObj.id,
                "school_id": this.globalObj.school_id,
                "session_id": this.globalObj.session_id,
                "from_date": fromDate,  
                "to_date": this.todaydate
            }; 
            this.http.post(this.myService.constant.apiURL+"student_subject_attendances/studentattendance", params1).subscribe(details => {
                const data: any = details;
                this.globalObj.present = data.response.Present;
                this.globalObj.absent = data.response.Absent;
                this.globalObj.leave = data.response.Leave;
                this.counts = {'pcount': this.globalObj.present, 'acount': this.globalObj.absent, 'lcount': this.globalObj.leave}
            });

          
            //var tilel = "Janvary";
           
            // this.eventdata.push({title: this.globalObj.month})  
            this.calendarOptions = {
                editable: true,
                eventLimit: true,
                header: {
                  left: 'prevYear prev',
                  right: 'next nextYear',
                  center: ''
                },
                //titleFormat: '['+this.globalObj.month+']',
                events:  this.eventdata
              };
              
              //this.ucCalendar4.fullCalendar( 'updateEvent', this.eventdata );
        }); 
  });
  }

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
  
  clickButton4(val){
      
     
       var $months = $('#months');
       $('#months').empty();
       console.log(val)
        var month = val.data;
       var initial = month.format('YYYY-MM');
       var preMon = month.format('MM');
       var preMons = month.format('MM');
       
        preMon = preMon-1;
        month.add(-preMon, 'month');
        for (var i = 0; i < 12; i++) {
            var opt = document.createElement('option');
            opt.value = month.format('YYYY-MM-01');
            opt.text = month.format('MMM YYYY');
            opt.selected = initial === month.format('YYYY-MM');
            $months.append(opt);
            month.add(1, 'month');
        }
      
      
      this.counts = {'pcount': 0, 'acount': 0, 'lcount': 0, 'total': 0}
      let date = val.data._d;
      this.mm = date.getMonth();
      let getDate = date.getDate();
      //let month = date.getMonth();
      let months = date.getMonth() + 1;
     
      this.yyyy = date.getFullYear() - 1;
      this.from_date = new Date(this.yyyy, preMons, 1);
      var lastDay = new Date(this.yyyy, preMons, 0);
      if(months < 10){
            months = "0"+months;
          }

          if(getDate < 10){
            getDate = "0"+getDate;
          }

  
        
      const fromDate = this.yyyy+"-"+preMons+"-"+getDate;
      
      const toDate = this.yyyy+"-"+preMons+"-"+ lastDay.getDate();
      
      
      
      const params1 = {
            "user_id": this.globalObj.id,
            "school_id": this.globalObj.school_id,
            "session_id": this.globalObj.session_id,
            "from_date": fromDate,  
            "to_date": toDate
        }; 
        this.http.post(this.myService.constant.apiURL+"student_subject_attendances/studentattendance", params1).subscribe(details => {
            const data: any = details;
            this.globalObj.present = data.response.Present;
            this.globalObj.absent = data.response.Absent;
            this.globalObj.leave = data.response.Leave;
            this.counts = {'pcount': this.globalObj.present, 'acount': this.globalObj.absent, 'lcount': this.globalObj.leave}
        });
      
      if(val.buttonType == 'next'){
        
      }
      if(val.buttonType == 'prev'){
            
      }
    
  }
    
    togledata(index){
        
        
        if(this.globalObj.indexFlag == index){
            if(this.globalObj.signFlag == 0){
                $(".aaa"+index).removeClass('minussign');
                this.globalObj.signFlag = 1;
            }else if(this.globalObj.signFlag == 1){
                $(".aaa"+index).addClass('minussign');
                this.globalObj.signFlag = 0;
            }
            $(".bbb"+index).toggle();
        }else{
            $(".accordion_body").hide();
            $('.accordion_head').removeClass('minussign');
            $(".aaa"+index).addClass('minussign');
            $(".bbb"+index).show();
            this.globalObj.indexFlag = index;
            this.globalObj.signFlag = 0;
        }
            
//        $(".accordion_body").hide();
//        $('.accordion_head').removeClass('minussign');
//        $(".aaa"+index).addClass('minussign');
//        $(".aaa"+index).show();

    }
    
    
//    getMonthSelect(){
//        this.monthData = [
//            {name: 'January', value: '0'},
//            {name: 'February', value: '1'},
//            {name: 'March', value: '2'},
//            {name: 'April', value: '3'},
//            {name: 'May', value: '4'},
//            {name: 'June', value: '5'},
//            {name: 'July', value: '6'},
//            {name: 'August', value: '7'},
//            {name: 'September', value: '8'},
//            {name: 'October', value: '9'},
//            {name: 'November', value: '10'},
//            {name: 'December', value: '11'},
//        ];
//        for(let k in this.monthData){
//            if(this.mm == this.monthData[k].value){
//                this.globalObj.month = this.monthData[k].name;
////                
//            }
//        }
//    }
    
//    getselectMonth(month){ 
//        this.globalObj.month = month;
//       
//       this.getattendance();
//    }
    
    

}
