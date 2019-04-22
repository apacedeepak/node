import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, RequiredValidator } from '@angular/forms';
import * as Rx from 'rxjs';
@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  public transferFlag: any = "";
  userType: any = "";
  user_id: any;
  sessionId: any;
  student_user_id: any;
  school_id: any;
  userId: any;
  jsonobj: any = {}
  arrcity: any = []
  successmsg: any = '';
  errormsg: any = '';
  state: any = ''
  center_form: FormGroup
  batch_form: FormGroup
  center_batch_selection: any = false
  schooldetail: any;
  transfer_center_id: any;
  current_class_id: any;
  current_section_id: any;
  current_board_id: any;
  boardlist: any = []
  coursetype_list_center: any = []
  sectionlist_center: any = []
  boardlistbatch: any = []
  coursetype_list_batch: any = [];
  sectionlist_batch: any = []
  batch_transfer_details:any=[]
center_transfer_details:any=[]
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.transferFlag = "center";
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.user_id = window.localStorage.getItem('user_id');
    this.sessionId = window.localStorage.getItem('session_id');
    this.student_user_id = window.localStorage.getItem('student_user_id');
    this.school_id = window.localStorage.getItem('school_id');
    if (this.userType == 'parent') {
      this.userId = this.student_user_id
    }
    if (this.userType == 'student') {
      this.userId = this.user_id

    }
    const param = {
      "tag": "StatesCity"
    }
    this.http.post(this.myService.constant.apiURL + 'ctpconfiguration/getallstates', param).subscribe(datas => {
      const dataval: any = datas;
      var jsonval = dataval.response.value;
      this.jsonobj = JSON.parse(jsonval);
    });
    this.center_form = new FormGroup({
      course: new FormControl("", Validators.required),
      course_type: new FormControl('', Validators.required),
      batch: new FormControl("", Validators.required),
      reason: new FormControl("", Validators.required),
      start_date: new FormControl("", Validators.required)
    })
    this.batch_form = new FormGroup({
      course: new FormControl("", Validators.required),
      course_type: new FormControl('', Validators.required),
      batch: new FormControl("", Validators.required),
      reason: new FormControl("", Validators.required),

    })
    const params = {
      "user_id": this.userId,
      "session_id": this.sessionId,

      "school_id": this.school_id
    };

    this.http.post(this.myService.constant.apiURL + 'users/assignedclass', params).subscribe(details => {

      const data: any = details;

      var studentData = data.response.assigned_classes;

      this.current_class_id = studentData[0].class_id;
      this.current_section_id = studentData[0].section_id;
      this.current_board_id = studentData[0].boardId;
      this.boardlistfunctionbatch()
      this.classlistfunctionbatch(this.current_board_id, this.school_id)
      this.onclasschangebatch(this.current_class_id)
    });
   this.transferlistfunction()
  }

  transfertype(val) {
    if (val == "center") {
      this.transferFlag = "center"
    }
    if (val == "batch") {
      this.transferFlag = "batch";

    }
  }
  selectcity(val) {
    this.state = val
    this.arrcity = this.jsonobj[val]

  }
  selectcenter(val) {
    const param = {
      "state": this.state,
      "city": val
    }
    this.http.post(this.myService.constant.apiURL + 'schools/getcenterbycity', param).subscribe(datas => {
      const details: any = datas;
      this.schooldetail = details.response;

    });
  }
  selectnewbatch(schoolid) {
    if (schoolid) {
      this.transfer_center_id = schoolid;
      this.center_batch_selection = true
      this.boardlistfunction();
      this.classlistfunction(schoolid, this.current_board_id)
    }
    else {
      this.center_batch_selection = false
    }
  }
  boardlistfunction() {
    this.http.get(this.myService.constant.apiURL + "boards/getallboard").subscribe(data => {
      const boards: any = data;
      this.boardlist = boards.response
      this.center_form.patchValue({
        course: this.current_board_id
      })
    });
  }

  classlistfunction(schoolid, boardId) {
    const classparams = {
      "boardId": boardId,
      "school_id": schoolid
    }
    this.http.post(this.myService.constant.apiURL + 'classes/getclasslistbyboardId', classparams).subscribe(details => {
      const data: any = details
      this.coursetype_list_center = data.response


    });
  }
  onboardchange(boardid) {
    if(this.transferFlag=="center"){
    this.classlistfunction(this.transfer_center_id, boardid)}
    else{
      this.classlistfunctionbatch(boardid,this.school_id)
    }
  }
  onclasschange(classid) {

    const param = {
      "class_id": classid
    };

    this.http.post(this.myService.constant.apiURL + 'sections/allsectionbyclassid', param).subscribe(datas => {
      const section: any = datas;

      this.sectionlist_center = section.response;
    })
  }
  boardlistfunctionbatch() {
    this.http.get(this.myService.constant.apiURL + "boards/getallboard").subscribe(data => {
      const boards: any = data;
      this.boardlistbatch = boards.response
      this.batch_form.patchValue({
        course: this.current_board_id
      })
    });
  }
  classlistfunctionbatch(boardId, schoolid) {
    this.sectionlist_batch=[]
    const classparams = {
      "boardId": boardId,
      "school_id": schoolid
    }

    this.http.post(this.myService.constant.apiURL + 'classes/getclasslistbyboardId', classparams).subscribe(details => {
      const data: any = details
      this.coursetype_list_batch = data.response

      this.batch_form.patchValue({
        course_type: this.current_class_id
      })

    });
  }
  onclasschangebatch(classId) {
    const param = {
      "class_id": classId
    };

    this.http.post(this.myService.constant.apiURL + 'sections/allsectionbyclassid', param).subscribe(datas => {
      const section: any = datas;

      this.sectionlist_batch = section.response;

    })
  }
  onSubmitcenter(value) {
    console.log(value)
    var centerobj={
      "userId":this.userId,
      "sessionId":this.sessionId,
      "transfer_type":"Center Transfer",
      "status":"pending",
      "request_date":new Date(),
      "reason":value.reason,
      "start_date":value.propose_start_date,
      "assigned_classId":this.current_class_id,
      "assigned_sectionId":this.current_section_id,
      "assign_boardId":this.current_board_id,
      "assigned_school_id":this.school_id,
      "requested_classId":value.course_type,
      "requested_sectionId":value.batch,
      "requested_boardId":value.course,
      "requested_school_id":this.transfer_center_id
    }
this.submitrequestfunction(centerobj)
  }
  onSubmitbatch(value) {
    var batchobj={
      "userId":this.userId,
      "sessionId":this.sessionId,
      "transfer_type":"Batch Transfer",
      "status":"pending",
      "request_date":new Date(),
      "reason":value.reason,
      "assigned_classId":this.current_class_id,
      "assigned_sectionId":this.current_section_id,
      "assign_boardId":this.current_board_id,
      "assigned_school_id":this.school_id,
      "requested_classId":value.course_type,
      "requested_sectionId":value.batch,
      "requested_boardId":value.course,
      "requested_school_id":this.school_id
    }
    this.submitrequestfunction(batchobj)
  }
  submitrequestfunction(requestobj){
    this.http.post(this.myService.constant.apiURL + 'transfer/addtransfer', requestobj).subscribe(datas => {
      const data:any = datas;
      var responsemg=data.response.message;
      // console.log(this.responsemg)
    if(responsemg=="successful"){
    
      this.center_form.patchValue({
        course:this.current_board_id,
        course_type:"",
        batch:"",
        reason:"",
        start_date:""
      })
      this.batch_form.patchValue({
        course: "",
        course_type: "",
        batch: "",
        reason: "",
  
      })
    this.successmsg="Request Raised Successfully"
    this.errormsg=''
   
    // this.center_batch_flag=false;
     this.transferlistfunction();
    } 
    if(responsemg=="error occured"){
    
      this.successmsg=""
      this.errormsg='Error Occured'
    }
    if(responsemg=="more than 1"){
      this.successmsg=""
      this.errormsg='You Cant raise More Than 1 Request'
    
      
    }
    setTimeout(() => {
      this.successmsg=''
      this.errormsg=''
    },3000)
   
    });
  }
  transferlistfunction(){
    const obj={
      "userId":this.userId
    }
    this.http.post(this.myService.constant.apiURL + 'transfer/transferdetails', obj).subscribe(datas => {
      const data :any = datas;
      var transferdetails=data.response

      transferdetails.forEach(element => {
     
        if(element.transfer_type=="Batch Transfer"){
          var batchobj={
            "transfer_type":element.transfer_type,
            "assigned_batch":element.assigned_sections.section_name,
            "requested_batch":element.requested_sections.section_name,
            "request_date":element.request_date,
            "status":element.status,
            "approve_reject_date":element.approve_reject_date
          }
          this.batch_transfer_details.push(batchobj)
        }
        if(element.transfer_type=="Center Transfer"){
          console.log(element)
          var centerobj={
            "transfer_type":element.transfer_type,
            "assigned_batch":element.assigned_sections.section_name,
            "requested_batch":element.requested_sections.section_name,
            "request_date":element.request_date,
            "status":element.status,
            "approve_reject_date":element.approve_reject_date,
            "assigned_center":element.assigned_center.school_code,
            "requested_center":element.requested_center.school_code
          }
          console.log(centerobj)
          this.center_transfer_details.push(centerobj)
        }
      });
    })

  }
}
