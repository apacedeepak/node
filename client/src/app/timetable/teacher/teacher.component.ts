import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import {BackendApiService} from './../../services/backend-api.service';
import { Options } from 'fullcalendar';
import { HttpClient } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {ReactiveFormsModule, FormGroup, FormControl,Validators, FormsModule, FormArray, FormBuilder} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {

    calendarOptions: Options;
    calendarOptionsCal: Options;
 displayEvent: any;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  @ViewChild(CalendarComponent) ucCalendarCal: CalendarComponent;
  
 form: FormGroup;

  public today: any;
  public dd: any;
  public mm : any;
  public yyyy: any;
  public todaydate: any;
  public mon: any;
  public global: any = {};
  public timetablelist: any = [];
  public timetablelistReplica: any = [];
  public eventdata: any = [];
  public assignSection: any = [];
  public assignSubject: any = [];
  dpp_form:FormGroup
  topic_id:FormArray
  topic_select:FormArray
  public containerEl: JQuery;
  mylang:any='';
  schedule_list:any;
  microschedule_data:any=[]
  topic_list:any=[]
  donetopics:any=[]
  covered_topic:any=[]
    ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }
  constructor(private myService: BackendApiService, private http: HttpClient,
  private activatedRoute: ActivatedRoute, private router: Router,private el: ElementRef,
  private fb: FormBuilder,private translate: TranslateService) { 
    this.mylang= window.localStorage.getItem('language');
    
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   
    this.activatedRoute.queryParams.subscribe(params => {
        if(params['flag'] != undefined){
            this.global.url_teacher_paper_id = params['teacher_paper_id'];
            this.global.flag = params['flag'];
        }
        
    });
  }

  ngOnInit() {

    this.global.user_id = window.localStorage.getItem('user_id');
    this.global.school_id = window.localStorage.getItem('school_id');
    this.global.user_id_php = window.localStorage.getItem('user_id_php');
    this.global.user_type = window.localStorage.getItem('user_type');
    this.global.token = window.localStorage.getItem('token');
    this.global.session_id = window.localStorage.getItem('session_id');
    this.schedulledetails(new Date())
    this.global.dayMonthWise = true;
    this.global.dayMonthType = "daily";
    
    this.form = this.fb.group({
        sectionList: [[''], Validators.required],
        subjectList: [[''], Validators.required]
    });
    this.topic_id=new FormArray([])
    this.topic_select=new FormArray([])
    this.dpp_form=new FormGroup({
        id:this.topic_id,
        selectbox:this.topic_select
    })
    
    this.today = new Date();
    this.dd = this.today.getDate();
    this.mm = this.today.getMonth();
    this.yyyy = this.today.getFullYear();
    this.todaydate = this.yyyy+'-'+this.mm+'-'+this.dd;
    let month = this.today.getMonth() + 1;

    let date = this.dd;
    if(month < 10){
        month = "0"+month;
      }

      if(this.dd < 10){
        date = "0"+this.dd;
      }

      const finalDate = this.yyyy+"-"+month+"-"+date;
      this.global.finalDate = finalDate;
    this.getBatchSchedule(finalDate);
    
    
    this.getmonthlyattendanceCal(this.mm, this.yyyy);
    this.getmonthlyattendance(this.mm, this.yyyy);
   
    
  }
  
  
  
  
  showHide(i,j,flag){
      if(flag == 'more'){
        $("#con"+i+j).removeClass('textLimit');
        $("#less"+i+j).css('display', '');
        $("#more"+i+j).css('display', 'none');
      }else{
          $("#con"+i+j).addClass('textLimit');
          $("#more"+i+j).css('display', '');
          $("#less"+i+j).css('display', 'none');
      }
  }
  
  
  clickButton(val){
      
      
      var $months = $('#months');
       $('#months').empty();
       
        var month = val.data;
       var initial = month.format('YYYY-MM');
       var preMon = month.format('MM');
       var preMons = month.format('MM');
       
       
       var newDate = initial+"-01";
       
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
      
      let date = val.data._d;
      
      if(val.buttonType == 'next'){

      }
      if(val.buttonType == 'prev'){

      }
      
      var dateArr = val.data._i;
      
      var dateMon = dateArr[1];
      var dateYear = dateArr[0];
      
      this.getmonthlyattendance(dateMon, dateYear);
      
      
      if(this.global.dayMonthType == "batch"){
          
          
          this.getBatchSchedule(newDate);
      }
      
  }
  
  clickButtonCal(val){
      
      
      var $months = $('#months');
       $('#months').empty();
       
        var month = val.data;
       var initial = month.format('YYYY-MM');
       var preMon = month.format('MM');
       var preMons = month.format('MM');
       
       var newDate = initial+"-01";
       
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
      
      let date = val.data._d;
      //this.mm = date.getMonth();
      //this.yyyy = date.getFullYear();
      
      
      if(val.buttonType == 'next'){

      }
      if(val.buttonType == 'prev'){

      }
      
      var dateArr = val.data._i;
      
      this.mm = dateArr[1];
      this.yyyy = dateArr[0];
      
      this.getmonthlyattendanceCal(this.mm, this.yyyy);
      
      
      if(this.global.dayMonthType == "batch"){
          
          this.getBatchSchedule(newDate);
      }
      
  }

  getmonthlyattendanceCal(month, year){

    

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      this.mon = monthNames[month];

    
    this.calendarOptionsCal = {
        editable: true,
        eventLimit: false,
        header: {
          left: 'prevYear prev',
          right: 'next nextYear',
          center: 'title'
        },
        events:  this.eventdata
      };
     this.ucCalendarCal.fullCalendar( 'addEventSource', this.eventdata );

    }
    
    getmonthlyattendance(month, year){

   
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      this.mon = monthNames[month];

    this.calendarOptions = {
        editable: true,
        eventLimit: false,
        header: {
          left: 'prevYear prev',
          right: 'next nextYear',
          center: 'title'
        },
        events:  this.eventdata
      };
  
      this.ucCalendar.fullCalendar( 'addEventSource', this.eventdata );
      

    }

    onDayCLick(value){
      let date = value.date._d.getDate();
      this.dd = date;
      const year = value.date._d.getFullYear();
      let month = value.date._d.getMonth() + 1;
      if(month < 10){
        month = "0"+month;
      }

      if(date < 10){
        date = "0"+date;
      }
      const finalDate = year+"-"+month+"-"+date;
      this.ucCalendarCal.fullCalendar( 'removeEvents' );

      this.eventdata = [];
       this.eventdata.push({ color : 'rgba(182, 175, 189,0.50)', start: finalDate});

       this.getmonthlyattendanceCal(this.mm, this.yyyy);
       this.global.currentDate = finalDate;
       this.schedulledetails(finalDate)
       this.getBatchSchedule(finalDate);

    }

    getBatchSchedule(currentDate){

        
      this.global.currentDate = currentDate;
      if(this.global.flag == 'success' && this.global.url_teacher_paper_id > 0){
            let paperId = window.localStorage.getItem('paperId');
            let status = window.localStorage.getItem('status');
            let sectionName = window.localStorage.getItem('sectionName');
            let scheduleId = window.localStorage.getItem('scheduleId');
            let batchId = window.localStorage.getItem('batchId');
            let day = window.localStorage.getItem('day');
            let teacherPaperId = this.global.url_teacher_paper_id;
            let facultyUserId = window.localStorage.getItem('facultyUserId');
          this.completeDPP(paperId, 0, sectionName, scheduleId, batchId, day, teacherPaperId, facultyUserId);
      }else{
     // const URL = 'schoolerp/erpapi/index/emscctimetable/type/student/input_date/'+currentDate+'/user_id/'+this.global.user_id;
      const URL = 'schoolerp/erpapi/index/emscctimetable/type/faculty/input_date/'+currentDate+'/user_id/'+this.global.user_id+'/school_id/'+this.global.school_id+'/category/'+this.global.dayMonthType;
        this.http.get(this.myService.constant.domainName+URL).subscribe(details=>{
              const data: any = details;
              this.timetablelist = data.data;
              this.timetablelistReplica = data.data;
              setTimeout(()=>{
                    $('.hideless').css('display', 'none');
                },100);

        });
      }
    }
    
    
    

    isComplete(paperId, status, sectionName, scheduleId, batchId, day, teacherPaperId, facultyUserId){
        
        this.global.paperId = paperId;
        this.global.status = status;
        this.global.sectionName = sectionName;
        this.global.scheduleId = scheduleId;
        this.global.batchId = batchId;
        this.global.day = day;
        this.global.teacherPaperId = teacherPaperId;
        this.global.facultyUserId = facultyUserId;
        window.localStorage.setItem('paperId', paperId);
        window.localStorage.setItem('status', status);
        window.localStorage.setItem('sectionName', sectionName);
        window.localStorage.setItem('scheduleId', scheduleId);
        window.localStorage.setItem('batchId', batchId);
        window.localStorage.setItem('day', day);
        window.localStorage.setItem('teacherPaperId', teacherPaperId);
        window.localStorage.setItem('facultyUserId', facultyUserId);
        if(status != 1){
            (<any>$('#timetablelay')).modal('show');
        }
    }
    
    redirecttoassesment(){
        window.location.href = this.myService.constant.domainName+"school_lms/public/assessnew/teachernew/create-dpp/"+window.btoa(this.global.paperId)+"/"+window.btoa(this.global.scheduleId+"#"+this.global.day+"#"+this.global.facultyUserId+"#"+this.global.batchId)+"/"+window.btoa(this.global.school_id) ;
        (<any>$('#timetablelay')).modal('hide');
    }
    
    completeDPP(paperId, status, sectionName, scheduleId, batchId, day, teacherPaperId, facultyUserId){
        this.global.paperId = paperId;
        this.global.status = status;
        this.global.sectionName = sectionName;
        this.global.scheduleId = scheduleId;
        this.global.batchId = batchId;
        this.global.day = day;
        this.global.teacherPaperId = teacherPaperId;
        this.global.facultyUserId = facultyUserId;
        
         if(this.global.status == 0 || this.global.status == '0'){
        (<any>$('#timetablelay')).modal('hide');
       let param = {
          "paper_id":'',
          "teacher_id":this.global.user_id,
          "class_id":"",
          "class_name":"",
          "section_id":"",
          "section_name":"",
          "center_id": this.global.school_id,
          "student_id":"",
          "is_completed": 1,
          "schedule_id": this.global.scheduleId,
          "batch_id": this.global.batchId,
          "day": this.global.day,
          "teacher_paper_id": this.global.teacherPaperId,
          "lecture_date": this.global.finalDate
        };
     let paramforGetSec = {
            "user_id": this.global.user_id,
            "school_id": this.global.school_id
        }
     this.http.post(this.myService.constant.apiURL+"user_sections/getsectionbyuserid", paramforGetSec).subscribe(getData=>{
       const data: any = getData;
       const conceptArr = data.response;
       var flagBatch = true;
       for(let key in conceptArr){
           if(conceptArr[key].section.toLowerCase() == this.global.sectionName.toLowerCase()){
               flagBatch = false;
               let paramforgetstud = {
                   "section_id": conceptArr[key].section_id,
                    "user_type": "Student" 
               };
              this.http.post(this.myService.constant.apiURL+"sections/getuserbysection", paramforgetstud).subscribe(getDatas=>{
                const studentList: any = getDatas;
                const allStudentList = studentList.response.data.section_have_users;
                const classInfo = studentList.response.data;
                let studentUserId = [];
                for(let j in allStudentList){
                  studentUserId.push(allStudentList[j].id);
                }

                      param.paper_id = this.global.paperId;
                      param.teacher_id = this.global.user_id;
                      param.class_id = classInfo.classId;
                      param.class_name = classInfo.class_name;
                      param.section_id = conceptArr[key].section_id;
                      param.section_name = conceptArr[key].section_name;
                      param.center_id = this.global.school_id;
                      param.student_id = studentUserId.join(',');
                      param.is_completed = 1;
                      param.schedule_id = this.global.scheduleId;
                      param.batch_id = this.global.batchId;
                      param.day = this.global.day;
                      param.teacher_paper_id = this.global.teacherPaperId;
                      param.lecture_date =  this.global.finalDate;
                      
                      if(studentUserId.length == 0){
                            alert(this.translate.instant('No student is assigned to this batch'));
                            this.global.flag == '';
                            this.global.url_teacher_paper_id = '';
                            this.getBatchSchedule(this.global.finalDate);
                            this.router.navigate(["/timetable/main"]);
                            return false;
                        }

                      this.http.post(this.myService.constant.domainName+"admin/schedulertle/sync/concept-complete", param).subscribe(detail=>{
                         const URL = 'schoolerp/erpapi/index/emscctimetable/type/faculty/input_date/'+this.global.currentDate+'/user_id/'+this.global.user_id+'/school_id/'+this.global.school_id+'/category/'+this.global.dayMonthType;
                          this.http.get(this.myService.constant.domainName+URL).subscribe(details=>{
                                const data: any = details;
                                this.timetablelist = data.data;
                                this.timetablelistReplica = data.data;
                                window.localStorage.setItem('paperId', '');
                                window.localStorage.setItem('status', '');
                                window.localStorage.setItem('sectionName', '');
                                window.localStorage.setItem('scheduleId', '');
                                window.localStorage.setItem('batchId', '');
                                window.localStorage.setItem('day', '');
                                window.localStorage.setItem('teacherPaperId', '');
                                window.localStorage.setItem('facultyUserId', '');
                                this.global.flag == '';
                                this.global.url_teacher_paper_id = '';
                                this.router.navigate(["/timetable/main"]);
                                setTimeout(()=>{
                                    $('.hideless').css('display', 'none');
                                },100);
                          });
                      });


              })
           }
       }
       if(flagBatch){
           this.global.flag == '';
           this.global.url_teacher_paper_id = '';
           this.getBatchSchedule(this.global.finalDate);
       }
       
     });
      }
    }
    
    finalComplete(){
        window.localStorage.setItem('paperId', '');
        window.localStorage.setItem('status', '');
        window.localStorage.setItem('sectionName', '');
        window.localStorage.setItem('scheduleId', '');
        window.localStorage.setItem('batchId', '');
        window.localStorage.setItem('day', '');
        window.localStorage.setItem('teacherPaperId', '');
        window.localStorage.setItem('facultyUserId', '');
        if(this.global.status == 0 || this.global.status == '0'){
        (<any>$('#timetablelay')).modal('hide');
       let param = {
          "paper_id":'',
          "teacher_id":this.global.user_id,
          "class_id":"",
          "class_name":"",
          "section_id":"",
          "section_name":"",
          "center_id": this.global.school_id,
          "student_id":"",
          "is_completed": 1,
          "schedule_id": this.global.scheduleId,
          "batch_id": this.global.batchId,
          "day": this.global.day,
          "teacher_paper_id": this.global.teacherPaperId,
          "lecture_date": this.global.finalDate
        };
        
        let paramforGetSec = {
            "user_id": this.global.user_id,
            "school_id": this.global.school_id
        }
        var flagBatch = true;
     this.http.post(this.myService.constant.apiURL+"user_sections/getsectionbyuserid", paramforGetSec).subscribe(getData=>{
       const data: any = getData;
       const conceptArr = data.response;
       for(let key in conceptArr){
           if(conceptArr[key].section.toLowerCase() == this.global.sectionName.toLowerCase()){
              flagBatch = false;
                  let paramforgetstud = {
                   "section_id": conceptArr[key].section_id,
                    "user_type": "Student" 
               };
              this.http.post(this.myService.constant.apiURL+"sections/getuserbysection", paramforgetstud).subscribe(getDatas=>{
                const studentList: any = getDatas;
                const allStudentList = studentList.response.data.section_have_users;
                const classInfo = studentList.response.data;
                let studentUserId = [];
                for(let j in allStudentList){
                  studentUserId.push(allStudentList[j].id);
                }
                

                      param.paper_id = this.global.paperId;
                      param.teacher_id = this.global.user_id;
                      param.class_id = classInfo.classId;
                      param.class_name = classInfo.class_name;
                      param.section_id = conceptArr[key].section_id;
                      param.section_name = conceptArr[key].section_name;
                      param.center_id = this.global.school_id;
                      param.student_id = studentUserId.join(',');
                      param.is_completed = 1;
                      param.schedule_id = this.global.scheduleId;
                      param.batch_id = this.global.batchId;
                      param.day = this.global.day;
                      param.teacher_paper_id = this.global.teacherPaperId;
                      param.lecture_date = this.global.finalDate;
                      if(studentUserId.length == 0){
                            alert(this.translate.instant('No student is assigned to this batch'));
                            return false;
                        }

                      this.http.post(this.myService.constant.domainName+"admin/schedulertle/sync/concept-complete", param).subscribe(detail=>{
                         const URL = 'schoolerp/erpapi/index/emscctimetable/type/faculty/input_date/'+this.global.currentDate+'/user_id/'+this.global.user_id+'/school_id/'+this.global.school_id+'/category/'+this.global.dayMonthType;
                          this.http.get(this.myService.constant.domainName+URL).subscribe(details=>{
                                const data: any = details;
                                this.timetablelist = data.data;
                                this.timetablelistReplica = data.data;
                                setTimeout(()=>{
                                    $('.hideless').css('display', 'none');
                                },100);
                          });
                      });


              })
           }
       }
       if(flagBatch){
           this.global.flag == '';
           this.global.url_teacher_paper_id = '';
           this.getBatchSchedule(this.global.finalDate);
       }
     });
      }
    }
    
    onDayMonth(flag){ 
        if(flag=='day'){
            this.global.dayMonthWise = true;
            $("#daily").addClass('btn-info');
            $("#batchwise").removeClass('btn-info');
            this.global.dayMonthType = "daily";
            this.today = new Date();
            this.dd = this.today.getDate();
            this.mm = this.today.getMonth();
            this.yyyy = this.today.getFullYear();
            this.getmonthlyattendanceCal(this.mm,this.yyyy)
            
            
            this.getBatchSchedule(this.global.finalDate);
            
        }else{
            this.global.dayMonthWise = false;
            $("#daily").removeClass('btn-info');
            $("#batchwise").addClass('btn-info');
            this.global.dayMonthType = "batch";
            this.getBatchSchedule(this.global.finalDate);
            setTimeout(()=>{
            this.containerEl = $('#calendar');
            
                this.containerEl.fullCalendar({
                viewRender: () => { 
                    this.buildMonthList();
                }
            });
            
            },10);
        }
       
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
      this.ucCalendar.fullCalendar('gotoDate', monthsVal);
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
     this.getBatchSchedule(fromDate);
  }
  
 
  
  getAssignSubjects(){ 
      
      let selectSecArr = this.form.get('sectionList').value;
      let selectSec = selectSecArr.join(',');
      const param = {
        "user_id":this.global.user_id,
        "session_id":this.global.session_id,
        "section_id":selectSec,
        "token":this.global.token,
        "time_table": 1
      }
      this.http.post(this.myService.constant.apiURL+"user_subjects/assignedsubjects", param).subscribe(response => {
          const data: any = response;
          this.assignSubject = data.response.assigned_subjects;
          
      })
  }
  
// 
  
  clearSearch(){
      this.form.patchValue({sectionList:[], subjectList:[]});
      this.getBatchSchedule(this.global.currentDate);
  }
    
  schedulledetails(date){
      this.microschedule_data=[];
      this.topic_list=[];
            var obj={
          "school_id":window.localStorage.getItem('school_id'),
          "faculty":window.localStorage.getItem('user_id'),
          "date":date
      }
      this.http.post(this.myService.constant.apiURL+"attendance_timetable_masters/staffschedule", obj).subscribe(getData=>{
          const data :any=getData;
    //  this.schedule_list=data.response
    // data.response.forEach(element => {
    //     element.attendance_details.forEach(obj => {
    //         var object={

    //         }
    //     });
    // });
    this.schedule_list=data.response
      });
  }
  getlmssubjectid(lmsclass,subject,batch_start_date,batch,board_lms ,classname,classid,batch_name){
this.covered_topic=[];

while (this.topic_select.length !== 0) {
    this.topic_select.removeAt(0)
  }
      this.topic_list=[]
      this.global.classId=classid
      this.global.className=classname
      this.global.lms_board=board_lms
      this.global.sectionId=batch;
      this.global.subjectId=subject;
      this.global.lmsclass=lmsclass;
      this.global.sectionName=batch_name
    var param={  
    
    "classId":lmsclass,
    "subjectId":subject,
    
    }
    this.http.post(this.myService.constant.apiURL+"lms_class_subjects/getlmssubjectid", param).subscribe(getData=>{
        const data :any=getData;
        // console.log(data.response.data)
        var lms_subject_id=data.response.data.lms_subjectId;
        this.global.lms_subject_id=lms_subject_id
        const params={
            "class_id":lmsclass,
            "subject_id":lms_subject_id,
            "batch_start_date_id":batch_start_date
        }
        this.http.post(this.myService.constant.apiURL+"microschedule_masters/getdetailsbysubjectandclass", params).subscribe(detail=>{
            const datas :any=detail;
        // console.log(datas)
        this.microschedule_data=datas.response.data

        // this.microschedule_data.forEach(element => {
            
        // });
        })
    })
  }
  ondatechange(date){
      this.global.testDate =date;
      this.topic_list=[]
  
   const param={
    "status":"Done",
    "userId":this.global.user_id,
    "schoolId":this.global.school_id,
    "sectionId":this.global.sectionId,
    "subjectId":this.global.subjectId,
    "test_date":this.global.testDate,
   }
   
   this.http.post(this.myService.constant.apiURL+"dpp/getalldonetopics", param).subscribe(detail=>{
    const datas :any=detail;

    this.donetopics=datas.response;
    this.donetopics.forEach(element => {
        this.covered_topic.push(element.topicId)
    });
    var data = this.microschedule_data.find(micro => micro.test_date == date);

    var syallbus_arr=JSON.parse(data.syllabus_data)
 //    console.log(typeof(syallbus_arr))
 //    console.log(syallbus_arr)
    var i=0;
    syallbus_arr.forEach(element => {
     //    console.log(element)
     var res =element.split("###");
   
     var obj={
         "topic_id":parseInt(res[0]),
         "topic_name":res[1]
     }
     this.topic_list.push(obj)
     this.topic_select.push(new FormControl(''));
     this.topic_id.push(new FormControl(''));
     (<FormArray>this.dpp_form.get("id")).controls[i].setValue(res[0]);
    //  if(this.donetopics.includes(parseInt(res[0]))){
    //     (<FormArray>this.dpp_form.get("selectbox")).controls[i].setValue(true);
    //  }
       i++;
    });
   });
  }
  onSubmitDetail(value){
     
      var x=0;
      var selected_topcics:any=[]
      for(x=0;x<value.id.length;x++){
        if(value.selectbox[x]==true){
            selected_topcics.push(value.id[x])
        }
      }
      var lms_param={
          "center_id":parseInt(this.global.school_id),
          "board_id": parseInt(this.global.lms_board),
          "class_id": parseInt(this.global.lmsclass),
          "class_name": this.global.className,
        "erp_class_id":parseInt(this.global.classId),
        "subject_id":  parseInt(this.global.lms_subject_id),
        "batch_id":parseInt(this.global.sectionId),
        "batch_name":this.global.sectionName,
        "teacher_id":parseInt(this.global.user_id),
        "topic_ids":selected_topcics.toString(),
      
        }
    
  
      var i=0;
      var postArr:any=[];
      for (i=0;i<value.id.length;i++){
          if(value.selectbox[i]==true){
              console.log(value)
              var obj={
                  "topicId":value.id[i],
                  "status":"Done",
                  "userId":this.global.user_id,
                  "schoolId":this.global.school_id,
                  "sectionId":this.global.sectionId,
                  "subjectId":this.global.subjectId,
                  "test_date":this.global.testDate,
                  "added_date":new Date()
              }
              postArr.push(obj);
          }

      }
const param ={
    "data":postArr,
    "lms_data":lms_param,
}
console.log(param);
this.http.post(this.myService.constant.apiURL+"dpp/adddailypracticepaper", param).subscribe(detail=>{
    const datas :any=detail;
    if(datas.response_status.status=="200"){
        alert("Topics Marked Successfully");
        window.location.reload();
    }
    else{
        alert("'Paper is not created.Questions are not available");
        window.location.reload();
    }
})
  }
}
