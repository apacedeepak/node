import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { BackendApiService } from "./../../services/backend-api.service";
import { Router } from "@angular/router";
@Component({
  selector: "app-batch-planning",
  templateUrl: "./batch-planning.component.html",
  styleUrls: ["./batch-planning.component.css"]
})
export class BatchPlanningComponent implements OnInit {
  public batch_title: any = "Batch Planning";
  public globalObj: any = {};
  public errorMessage: any = {};
  public successMessage: any = {};

  public FormSubject: any = "0";
  public FormSelect: any = "0";
  public Searchparams: any = "";
  public params: any = {};
  public paramSet: any = {};
  public paramUserClass: any = {};
  public userType: any = {};
  public paramAddAttendanceMaster: any = {};
  public paramSetAttendance: any = {};
  public timetableMasterId: any = "";
  batchPlanningListtable: any = [];
  public show_add_batch_planning: boolean = false;
  public show_list_batch_planning: boolean = false;
  daysarr :any=[]
  temp_start_time:any
  public formSetDay: any = {};
  public formSet: any = {};
  public subjectList: any[];
  temp_arrray: any = [];
  disable_teacher_subject:any=[]
  public weekdaysList = [
    { id: 0, name: "Sunday" },
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" }
  ];

  public mylang: any = "";
  batchPlanningForm: FormGroup;
  weekdaysArr: FormArray;
  public weekdayDataArr: any = [];
  public schoolIdLocal: any = "";
  public sessionIdLocal: any = "";
  public sectionIdSet: any = "";
  public userIdLocal: any = "";
  public arrSetVal: any = [];
  lecher_type: FormArray;
  subject: FormArray;
  teacher: FormArray;
  start_time: FormArray;
  end_time: FormArray;
  length_arr: any = [];
  end_time_set: any;
  num = 0;
  errorchange: any = "";
  start_time_asign: any;
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.mylang = window.localStorage.getItem("language");

    this.schoolIdLocal = window.localStorage.getItem("school_id");
    this.sessionIdLocal = window.localStorage.getItem("session_id");
    this.userIdLocal = window.localStorage.getItem("user_id");
    this.userType = window.localStorage.getItem("user_type");

    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang("en");
    }
  }

  getFromSet() {
    this.weekdaysArr = new FormArray([]);
    this.globalObj.weekdaysList = this.weekdaysList;
    console.log(this.weekdaysList);
    this.weekdaysList.forEach(value => {
      this.weekdaysArr.push(new FormControl(""));
      this.weekdayDataArr.push(value.id);
      console.log(value.id + "----" + value.name);
      //this.equipDataArr.push(value.id);
    });
    this.lecher_type = new FormArray([]);
    this.subject = new FormArray([]);
    this.teacher = new FormArray([]);
    this.start_time = new FormArray([]);
    this.end_time = new FormArray([]);
    this.length_arr.push(this.num);
    this.lecher_type.push(new FormControl(""));
    this.subject.push(new FormControl(""));
    this.start_time.push(new FormControl(""));
    this.end_time.push(new FormControl(""));
    this.teacher.push(new FormControl(""));
    this.batchPlanningForm = new FormGroup({
      course: new FormControl(""),
      course_type: new FormControl(""),
      batch: new FormControl(""),
      days: this.weekdaysArr,

      lecher_type: this.lecher_type,
      subject: this.subject,
      teacher: this.teacher,
      start_time: this.start_time,
      end_time: this.end_time
    });

    // this.batchPlanningForm.patchValue({batchPlanningPimetable[0].end_time:'12:10'})

    console.log(this.weekdaysArr + "okkkkk" + this.weekdaysArr.length);
  }

  getFromReset() {
    this.batchPlanningForm.patchValue({
      course: "",
      course_type: "",
      batch: ""
    });
    console.log(this.weekdaysArr);
    if (this.weekdaysArr.length > 0) {
      for (let i in this.weekdaysArr) {
        (<FormArray>this.batchPlanningForm.get("days")).controls[i].setValue(
          false
        );
      }
    }

    // if (this.fb.array.length > 0) {
    //   for (let i in this.fb.array) {
    //     (<FormArray>(
    //       this.batchPlanningForm.get("batchPlanningPimetable")
    //     )).controls["lecher_type"].setValue("");
    //     (<FormArray>(
    //       this.batchPlanningForm.get("batchPlanningPimetable")
    //     )).controls["subject"].setValue("");
    //     (<FormArray>(
    //       this.batchPlanningForm.get("batchPlanningPimetable")
    //     )).controls["teacher"].setValue("");
    //     (<FormArray>(
    //       this.batchPlanningForm.get("batchPlanningPimetable")
    //     )).controls["start_time"].setValue("");
    //     (<FormArray>(
    //       this.batchPlanningForm.get("batchPlanningPimetable")
    //     )).controls["end_time"].setValue("");
    //   }
    // }
  }

  ngOnInit() {
    this.globalObj.successMessage='';
    this.globalObj.errorMessage='';
    this.getBoardList(this.Searchparams);
    this.getFromSet();
    this.show_add_batch_planning = false;
    this.show_list_batch_planning = false;

    this.getBatchPlanningList();
    // this.weekdaysArr = new FormArray([]);
    this.getDurationdList();
  }

  addToggle() {
    this.show_add_batch_planning = true;
    this.show_list_batch_planning = false;
    this.getFromSet();
  }

  onSubmitDetail(formValue) {
    console.log(formValue);

    var serWeekDay = this.weekdaysList;
    var arrSet = new Array();
    var arrSetVal = new Array();
    formValue.days.forEach(function(value, key) {
      //   console.log(key + ": " + value);
      if (value == true) {
        arrSet.push(key);
        var setName = serWeekDay.find(obj => obj.id == key).name;
        arrSetVal.push(setName);
      }
    });
    var batchplanarray: any = [];
    var user_subject_array:any=[];
    var user_section_array:any=[]
    var i = 0;
    for (i = 0; i < formValue.lecher_type.length; i++) {
      var res = formValue.subject[i].split(",");
      var class_subject_id=res[0]
      var subjectId=res[1]
      var obj = {
        'lecher_type': formValue.lecher_type[i],
        'subject': class_subject_id,
        'teacher': formValue.teacher[i],
        'start_time': formValue.start_time[i],
        'end_time': formValue.end_time[i]
      };
       batchplanarray.push(obj);
      // var class_subject_id= formValue.subject[i].substr(0,  formValue.subject[i].indexOf(","));
      // var subjectId= formValue.subject[i].substr( formValue.subject[i].indexOf(",") + 1,  formValue.subject[i].length - 1);
 if(formValue.lecher_type[i]=="Lecture"){
      var user_subject_object={
        'subjectId' :subjectId,
        'userId' :formValue.teacher[i],
        'sessionId' :this.sessionIdLocal,
        'sectionId' :formValue.batch,
        'schoolId' :this.schoolIdLocal,
        'status' : 'Active',
        'created_date' :new Date(),
        "class_subjectId" :class_subject_id,
        "user_type" : 'Teacher'
      }

      var user_section_obj={
        "userId" :formValue.teacher[i] ,
        "sectionId" :formValue.batch,
        "sessionId" : this.sessionIdLocal,
        "schoolId" : this.schoolIdLocal,
        "class_teacher" : "No",
        "roll_no" : '',
        "status" :"Active",
        "user_type" : 'Teacher'
      }
     
      user_subject_array.push(user_subject_object)
      user_section_array.push(user_section_obj)
    }
  }
    var arrSetDays = arrSet;

    var jsonArr = {
    "class_id":formValue.course_type,
    "section_id":formValue.batch,
    "school_auto_id":this.schoolIdLocal,
    "status":"Active",
    "days":formValue.days,
      "batchPlanningPimetable": batchplanarray,
      "user_subjects":user_subject_array,
      "user_sections":user_section_array
    };

console.log(jsonArr)

    const url =
      this.myService.constant.apiURL +
      "attendance_timetable_masters/batchplanning";
    this.http.post(url, jsonArr).subscribe(details => {
      const data: any = details;
      console.log(data.response);

      if (data.response.status == "200") {
        alert("batch plan created successfully");
        window.location.reload();
      } else {
        alert("error occured");
        console.log("wrong");
        this.getBatchPlanningList();
      }
    });
  }

  //

  getBatchPlanningList() {
    /*******
     * const url =
      this.myService.constant.apiURL +
      "attendance_timetable_masters/allattendancemasterlist?status=Active";
     *
     */

    console.log("okk11");
    const params = {
      school_id: this.schoolIdLocal
    };
    console.log("okk12222");

    this.http
      .post(
        this.myService.constant.apiURL +
          "attendance_timetable_masters/allbatchplanlist",
        params
      )
      .subscribe(data => {
        const datas: any = data;
        this.globalObj.batchPlanningList = datas.response;
        // console.log("okk1333333"+this.globalObj.batchPlanningList);

        this.globalObj.batchPlanningList.forEach(element => {
          // console.log("okk1144444");

          var days = [];
          // console.log(element.attendance_details[0].start_time);
          // console.log(
          //   element.attendance_details[element.attendance_details.length - 1]
          //     .end_time
          // );
          element.attendance_details.forEach(obj => {
            if (obj.day == 0) {
              days.push("Sunday");
            } else if (obj.day == 1) {
              days.push("Monday");
            } else if (obj.day == 2) {
              days.push("Tuesday");
            } else if (obj.day == 3) {
              days.push("WednesDay");
            } else if (obj.day == 4) {
              days.push("Thursday");
            } else if (obj.day == 5) {
              days.push("Friday");
            } else if (obj.day == 6) {
              days.push("Saturday");
            }
          });
          days = Array.from(new Set(days));
          var dispObj = {
            id: element.id,
            date: element.modified_date,
            course: element.section.board.board_name,
            batch: element.section.section_name,
            days: days,
            time:
              element.attendance_details[0].start_time +
              " to " +
              element.attendance_details[element.attendance_details.length - 1]
                .end_time
          };
          console.log(dispObj);
          this.batchPlanningListtable.push(dispObj);
          console.log(this.batchPlanningListtable)
        });
        //console.log("okk555");

        //  console.log(this.batchPlanningListtable + "batch Planning List table");
      });
    // console.log("okk116666666666666");
  }

  get sellingPoints() {
    return this.batchPlanningForm.get("batchPlanningPimetable") as FormArray;
  }

  /////// This is new /////////////////

  addSellingPoint() {
    this.lecher_type.push(new FormControl(""));
    this.subject.push(new FormControl(""));
    this.start_time.push(new FormControl(""));
    this.end_time.push(new FormControl(""));
    this.teacher.push(new FormControl(""));
    this.length_arr.push(this.num);
  }

  deleteSellingPoint() {
    this.lecher_type.removeAt(this.length_arr.length - 1);
    this.subject.removeAt(this.length_arr.length - 1);

    this.start_time.removeAt(this.length_arr.length - 1);
    this.end_time.removeAt(this.length_arr.length - 1);
    this.teacher.removeAt(this.length_arr.length - 1);

    this.length_arr.pop(this.num);
  }

  setEndTime() {
    // this.sellingPoints.push(
    //   this.fb.group({
    //     end_time: "10:30"
    //   })
    // );
    // this.sellingPoints.patchValue({end_time: '10:30'});
  }

  //////////// End ////////////////////

  getBoardList(Searchparams) {
    const url = this.myService.constant.apiURL + "boards/getactiveboard";
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.boardCourseList = data.response;
      console.log(this.globalObj.boardCourseList);
    });
  }

  getCourseTypeList(Searchparams = 0) {
    const url =
      this.myService.constant.apiURL +
      "classes/getschoolclassbyboard?boardId=" +
      Searchparams;

    this.http.get(url).subscribe(response => {
      const data: any = response;
      let filter = data.response.filter(
        index => index.schoolId == this.schoolIdLocal
      );
      this.globalObj.CoursetypeList = filter;
    });
  }

  getSectionList(Searchparams = 0) {
    const url =
      this.myService.constant.apiURL +
      "sections/getsectionbyclass?classId=" +
      Searchparams;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.sectionList = data.response;
    });
  }

  getSubjectListBySection(Searchparams = 0) {
    this.sectionIdSet = Searchparams;
    const url =
      this.myService.constant.apiURL +
      "class_subjects/getsubjectbysection?sectionId=" +
      Searchparams +
      "&sessionId=" +
      this.sessionIdLocal;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.subjectList = data.response;
      console.log(this.globalObj.subjectList);
    });
  }

  getSubjectListBySectionReturn(Searchparams = 0) {
    console.log("heloo return : " + Searchparams);
    this.sectionIdSet = Searchparams;
    const url =
      this.myService.constant.apiURL +
      "class_subjects/getsubjectbysection?sectionId=" +
      Searchparams +
      "&sessionId=" +
      this.sessionIdLocal;
    console.log(url);
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.subjectList = data.response;
      console.log(this.subjectList);
    });
  }

  getStaffListBySchool() {
    const url = this.myService.constant.apiURL +"user_schools/getalluserbyschoolid";
    let reqestParam = {
      school_id: this.schoolIdLocal,
      user_type: "Teacher",
      status: "Active"
    };
    this.http.post(url, reqestParam).subscribe(response => {
      const data: any = response;
      this.globalObj.staffList = data.response.data;
     
    });
  }

  getDurationdList() {
    const url =
      this.myService.constant.apiURL +
      "duration_masters/getalldurationschool?school_id=" +
      this.schoolIdLocal;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.getDurationList = data.response;
      this.globalObj.getDurationListFilter = this.globalObj.getDurationList.filter(
        index => index.duration_name != "Lecture Break"
      );
      console.log(this.globalObj.getDurationList);
    });
  }

  //==============================//
  setEndTimeOld(startTime, type, index,staff) {
    // alert(tartTime +'--------------'+ type);
    // if(!type||type==null){
    //   alert("please select lecture type first" );
    //   (<FormArray>this.batchPlanningForm.get("start_time")).controls[index].setValue("");
    // return
    // }
  this.teachercheck(startTime,staff,index)
    var feestruct = this.globalObj.getDurationList.find(
      index => index.duration_name == type
    );
    if (feestruct) {
      console.log(feestruct);

      var vale = this.addMinutes(startTime, feestruct.duration_time);
      this.temp_start_time=vale
      this.end_time_set = vale;
      (<FormArray>this.batchPlanningForm.get("end_time")).controls[
        index
      ].setValue(vale);
    } else {
      this.errorchange = "Please Select Lecture type First";
      (<FormArray>this.batchPlanningForm.get("start_time")).controls[
        index
      ].setValue("");
      setTimeout(() => {
        this.errorchange = "";
      }, 3000);
    }
    var j = 1;
    for (j = 1; j < this.length_arr.length; j++) {
      (<FormArray>this.batchPlanningForm.get("lecher_type")).controls[
        j
      ].setValue("");
      (<FormArray>this.batchPlanningForm.get("subject")).controls[j].setValue(
        ""
      );
      (<FormArray>this.batchPlanningForm.get("teacher")).controls[j].setValue(
        ""
      );
      (<FormArray>this.batchPlanningForm.get("start_time")).controls[
        j
      ].setValue("");
      (<FormArray>this.batchPlanningForm.get("end_time")).controls[j].setValue(
        ""
      );
      this.temp_arrray.splice(j, 1);
    }
  }
  addMinutes(time, minsToAdd) {
    function D(J) {
      return (J < 10 ? "0" : "") + J;
    }
    var piece = time.split(":");
    var mins = piece[0] * 60 + +piece[1] + +minsToAdd;

    return D(((mins % (24 * 60)) / 60) | 0) + ":" + D(mins % 60);
  }

  addstarttime(lecture, i) {
    if(lecture=="Lunch Break"){
      this.disable_teacher_subject.push(i)
    }
    if(lecture=="Lecture"){
      var temp = this.disable_teacher_subject.indexOf(i);
      if (temp > -1) {
        this.disable_teacher_subject.splice(temp, 1);
      }
    }
    var j;
    var count = 0;
    var obj = {
      index: i,
      lecture: lecture,
      end_time: this.end_time_set
    };
    for (j = 0; j < this.temp_arrray.length; j++) {
      if (i == this.temp_arrray[j].index) {
        this.temp_arrray[j].lecture = lecture;
        this.end_time_set = this.temp_arrray[j].end_time;
        count++;
        for (var k = i + 1; k < this.length_arr.length; k++) {
          (<FormArray>this.batchPlanningForm.get("lecher_type")).controls[
            k
          ].setValue("");
          (<FormArray>this.batchPlanningForm.get("subject")).controls[
            k
          ].setValue("");
          (<FormArray>this.batchPlanningForm.get("teacher")).controls[
            k
          ].setValue("");
          (<FormArray>this.batchPlanningForm.get("start_time")).controls[
            k
          ].setValue("");
          (<FormArray>this.batchPlanningForm.get("end_time")).controls[
            k
          ].setValue("");
          this.temp_arrray.splice(k, 1);
        }
      }
    }

    if (count == 0) {
      this.temp_arrray.push(obj);
    }
    console.log(this.temp_arrray);
    console.log(this.end_time_set);

    var temp_var = this.temp_arrray.find(index => index.index == i - 1);
    // var filt =this.temp_arrray.filter(index => index.lecture == "Lunch Break");

    if (i > 0) {
      var feestruct = this.globalObj.getDurationList.find(
        index => index.duration_name == lecture
      );
      if (feestruct) {
        if (lecture == "Lecture") {
          this.start_time_asign = this.end_time_set;
          if (temp_var) {
            if (temp_var.lecture == "Lunch Break") {
              // var break_time = this.globalObj.getDurationList.find(index => index.duration_name == "Lecture Break");
              var vale = this.addMinutes(this.end_time_set, 0);
              this.temp_start_time=vale;
              (<FormArray>this.batchPlanningForm.get("start_time")).controls[
                i
              ].setValue(vale);
              var endval = this.addMinutes(vale, feestruct.duration_time);
              (<FormArray>this.batchPlanningForm.get("end_time")).controls[
                i
              ].setValue(endval);
              this.end_time_set = endval;
            } else {
              var break_time = this.globalObj.getDurationList.find(
                index => index.duration_name == "Lecture Break"
              );
              var lecturebreak;
              if(break_time){
                lecturebreak=break_time.duration_time
              }
              else{
                lecturebreak=0;
              }
              var vale = this.addMinutes(
                this.end_time_set,  lecturebreak
              );
              this.temp_start_time=vale;
              (<FormArray>this.batchPlanningForm.get("start_time")).controls[
                i
              ].setValue(vale);
              var endval = this.addMinutes(vale, feestruct.duration_time);
              (<FormArray>this.batchPlanningForm.get("end_time")).controls[
                i
              ].setValue(endval);
              this.end_time_set = endval;
            }
          }
        }
        if (lecture == "Lunch Break") {
          var vale = this.addMinutes(this.end_time_set, "0");
          this.temp_start_time=vale;
          (<FormArray>this.batchPlanningForm.get("start_time")).controls[
            i
          ].setValue(vale);
          var endval = this.addMinutes(vale, feestruct.duration_time);
          (<FormArray>this.batchPlanningForm.get("end_time")).controls[
            i
          ].setValue(endval);
          this.end_time_set = endval;
        }
      }
    }

    //  var check=this.temp_arrray.find(index => index.index == i);
    //  if(check){
    //   (<FormArray>this.batchPlanningForm.get("start_time")).controls[i].setValue("");
    //   (<FormArray>this.batchPlanningForm.get("end_time")).controls[i].setValue("");
    //  }
  }

  showPopUp(timetable_master_id) {
    console.log(timetable_master_id + "");
    const param = {
      timetable_master_id: timetable_master_id,
      school_id: this.schoolIdLocal
    };

    const url =
      this.myService.constant.apiURL +
      "attendance_timetable_masters/allbatchplandetail";
    this.http.post(url, param).subscribe(response => {
      var data: any = response;
      var batchPlaningPopUpList = data.response;
      console.log(JSON.stringify(batchPlaningPopUpList)+"popUp");
      (<any>$("#showpopup")).modal("show");
      this.globalObj.batchPlaningPopUpListData =batchPlaningPopUpList;



    });
  }
  dayselect(value,index){
    console.log(index)
    console.log(value)
    if(value==true){
      this.daysarr.push(index);

    }
    if(value==false){
   
      var temp = this.daysarr.indexOf(index);
if (temp > -1) {
  this.daysarr.splice(temp, 1);
}
    }
    var j = 0;
    for (j = 0; j < this.length_arr.length; j++) {
      (<FormArray>this.batchPlanningForm.get("lecher_type")).controls[
        j
      ].setValue("");
      (<FormArray>this.batchPlanningForm.get("subject")).controls[j].setValue(
        ""
      );
      (<FormArray>this.batchPlanningForm.get("teacher")).controls[j].setValue(
        ""
      );
      (<FormArray>this.batchPlanningForm.get("start_time")).controls[
        j
      ].setValue("");
      (<FormArray>this.batchPlanningForm.get("end_time")).controls[j].setValue(
        ""
      );
      this.temp_arrray.splice(j, 1);
    }
  }
  teachercheck(startTime,staff,index){
    var staffs = parseInt(staff)
    const param={
      "day":this.daysarr,
      "start_time":startTime
    }
    this.http.post(this.myService.constant.apiURL + "attendance_timetable_details/facultylistbystarttime",param).subscribe(data => {
      const datas:any=data
  
if(datas.response.includes(staffs)){

  this.errorchange = "This Faculty already assigned to other batch at this time";
  (<FormArray>this.batchPlanningForm.get("start_time")).controls[
    index
  ].setValue("");
  (<FormArray>this.batchPlanningForm.get("teacher")).controls[
    index
  ].setValue("");
  (<FormArray>this.batchPlanningForm.get("end_time")).controls[
    index
  ].setValue("");
  setTimeout(() => {
    this.errorchange = "";
  }, 3000);
}

    })
  }
  teacherchange(staff,index){
    if(index>0){
    var staffs = parseInt(staff)
    const param={
      "day":this.daysarr,
      "start_time":this.temp_start_time
    }
    this.http.post(this.myService.constant.apiURL + "attendance_timetable_details/facultylistbystarttime",param).subscribe(data => {
      const datas:any=data
  
if(datas.response.includes(staffs)){

  this.errorchange = "This Faculty already assigned to other batch at this time";
 
  (<FormArray>this.batchPlanningForm.get("teacher")).controls[
    index
  ].setValue("");
  
  setTimeout(() => {
    this.errorchange = "";
  }, 3000);
}

    })}
  }
}
