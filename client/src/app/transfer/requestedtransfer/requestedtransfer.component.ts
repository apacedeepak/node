import { Component, OnInit, AfterContentInit } from '@angular/core';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-requestedtransfer',
  templateUrl: './requestedtransfer.component.html',
  styleUrls: ['./requestedtransfer.component.css']
})
export class RequestedtransferComponent implements OnInit, AfterContentInit {
  session_id: any;
  school_id: any;
  user_id: any;
  centerform: FormGroup
  batchform: FormGroup
  batch_accept_form: FormGroup
  radioFlag: any = 'center'
  searchParam: any
  center_table_data: any = []
  batch_table_data: any = []
  assign_section_fee_form: FormGroup
  admission_no_center: any = ''
  admission_no_batch: any = ''
  student_name_batch: any = ''
  student_name_center: any = ''
  table_enable: any = false
  userType: any;
  batch_accepted_user_id:any;
  open_modal:any=false
  status:any=''
  status_batch:any=''
  boardlistbatch:any=[]
  coursetype_list_batch:any=[]
  sectionlist_batch:any=[];
  current_class_id:any
  current_batch_id:any;
  fee_structure_list:any=[];
  role_name:any;
  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder) { }
  ngAfterContentInit() {

  }
  ngOnInit() {
    this.boardlistfunctionbatch();
    this.searchParam = { "status": "Active" };
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.role_name = window.localStorage.getItem('role_name');
    this.session_id = window.localStorage.getItem('session_id')
    this.school_id = window.localStorage.getItem('school_id')
    this.user_id = window.localStorage.getItem('user_id')
    this.centerform = new FormGroup({
      adm_no: new FormControl('', Validators.required),
      status: new FormControl('')
    })
    this.batchform = new FormGroup({
      adm_no: new FormControl('', Validators.required),
      status: new FormControl('')
    })
    this.batch_accept_form = new FormGroup({
      course: new FormControl("", Validators.required),
      course_type: new FormControl("", Validators.required),
      batch: new FormControl("", Validators.required),
      package:new FormControl("",Validators.required)
    
    })
  }
  transfertype(val) {
    this.radioFlag = val
  }
  onSubmitcenter(val) {
    if (val.adm_no) {
      this.status=val.status
      var admoNo =  val.adm_no
      this.admission_no_center = val.adm_no
      const admno = {
        "admission_no": admoNo,
        
      }
      console.log(admno)
      var userId
      this.http.post(this.myService.constant.apiURL + 'students/getstudentdetailbyadmno', admno).subscribe(details => {
        const data: any = details;
        var userIdarr = data.response[0];
        console.log(userIdarr)
        if (data.response.length > 0) {
          userId = data.response[0].userId;
            this.student_name_center = data.response[0].name
        }
        if (data.response.length == 0) {
          userId = 0.1
        }
        this.filtercenter(userId,this.status)
      });
    }
  }
  onSubmitbatch(val) {
    if (val.adm_no) {
      var admoNo =  val.adm_no
      this.admission_no_batch = val.adm_no
      this.status_batch=val.status
      const admno = {
        "admission_no": admoNo
      }

      var userId
      this.http.post(this.myService.constant.apiURL + 'students/getstudentdetailbyadmno', admno).subscribe(details => {
        const data: any = details;
        var userIdarr = data.response[0];

        if (data.response.length > 0) {
          userId = data.response[0].userId
          this.student_name_batch = data.response[0].name
        }
        if (data.response.length == 0) {
          userId = 0.1
        }
        this.filterbatch(userId,this.status_batch)
      });
    }
  }
  rejectrequest(userid) {
    const params = {
      'userId': userid,
      'status': 'reject'
    }
    this.http.post(this.myService.constant.apiURL + 'transfer/rejectrequest', params).subscribe(apidata => {
      const data: any = apidata;
      if (data.response_status.status == "200") {
        if (this.radioFlag == "batch") {
          this.filterbatch(userid,this.status_batch);
        }
        if (this.radioFlag == "center") {
          this.filtercenter(userid,this.status)
        }
      }
    });
  }
  filterbatch(userId ,status) {
    var params = {
      "userId": userId,
      "status":status,
      "school_id":this.school_id
    }
    this.http.post(this.myService.constant.apiURL + 'transfer/filterrecordsbatch', params).subscribe(apidata => {
      const data: any = apidata;
      this.batch_table_data = data.response
      this.table_enable = true

    });
  }
  filtercenter(userId,status) {
    var params = {
      "userId": userId,
      "status":status,
      "school_id":this.school_id
    }
    this.http.post(this.myService.constant.apiURL + 'transfer/filterrecordscenter', params).subscribe(apidata => {
      const data: any = apidata;
      this.center_table_data = data.response
      this.table_enable = true
    });
  }
  forwardrequest(userid) {
    const params = {
      'userId': userid,
      'status': 'forward',
    }
    this.http.post(this.myService.constant.apiURL + 'transfer/updateschool', params).subscribe(apidata => {
      const data: any = apidata;
      if (data.response_status.status == "200") {
        this.filtercenter(userid,this.status);
      }
    });
  }
  openmodal(userid,boardId,classId,sectionId){
    this.current_class_id=classId;
this.current_batch_id=sectionId
    this.classlistfunctionbatch(boardId,false)

    console.log(classId)
    this.onclasschangebatch(classId,false)
    this.packagelist(sectionId);
    this.batch_accepted_user_id=userid
    this.open_modal=true;
    console.log("openmod")
    this.batch_accept_form.patchValue({
      course: boardId
   
    })
  }
  boardlistfunctionbatch() {

    this.http.get(this.myService.constant.apiURL + "boards/getallboard").subscribe(data => {
      const boards: any = data;
      this.boardlistbatch = boards.response
      // this.batch_form.patchValue({
      //   course: this.current_board_id
      // })
    });
  }
  classlistfunctionbatch(boardId,val) {
  
    this.coursetype_list_batch=[];
    this.sectionlist_batch=[];
    this.fee_structure_list=[];
    const classparams = {
      "boardId": boardId,
      "school_id": this.school_id
    }

    this.http.post(this.myService.constant.apiURL + 'classes/getclasslistbyboardId', classparams).subscribe(details => {
      const data: any = details
      this.coursetype_list_batch = data.response
  if(this.coursetype_list_batch.length>0){
    console.log(this.coursetype_list_batch);
    console.log(this.current_class_id)
    if(val==false){
      this.batch_accept_form.patchValue({
        course_type: this.current_class_id
      })}else{
        this.batch_accept_form.patchValue({
          course_type: ""
        })
      }
    }
    });
  }
  onclasschangebatch(classId,val) {
    this.sectionlist_batch=[];
    this.fee_structure_list=[];
    const param = {
      "class_id": classId
    };

    this.http.post(this.myService.constant.apiURL + 'sections/allsectionbyclassid', param).subscribe(datas => {
      const section: any = datas;

      this.sectionlist_batch = section.response;
      if(val==false){
      this.batch_accept_form.patchValue({
        batch: this.current_batch_id
      })}
      else{
        this.batch_accept_form.patchValue({
          batch: ""
        })
      }
    })
  }
   packagelist(section_id){
  this.batch_accept_form.patchValue({
    package:""
  })
     this.fee_structure_list=[]
    const param={
      "section_id":section_id
    }
    this.http.post(this.myService.constant.apiURL + 'fee_structure_details/getfeestructurebysection', param).subscribe(details => {
      const data: any = details
      this.fee_structure_list =data.response

    })
  }
  onAccept(val){
    // var res = val.batch.split(",");
    // var sectionId=res[0]
    // var section_name=res[1]
    // console.log(val)
    const param={
      "userId":this.batch_accepted_user_id,
      "status":"Inactive",
      "reason":"Batch Transfer",

    "fee_structure_id":val.package,
    "section_id":val.batch,
    "session_id":this.session_id,
    "school_id":this.school_id
   
    }
    const obj={
      "userId":this.batch_accepted_user_id,
      "status":"approved",
      "sectionId":val.batch,
      "classId":val.course_type,
      "boardId":val.course
    }
    var sections = this.sectionlist_batch.find(
      index => index.id == val.batch
    );
    var section_name=sections.section_name;
    this.http.post(this.myService.constant.apiURL + 'student_fee_structures/assignnewpayemnt', param).subscribe(details => {
      const data: any = details
      
      if(data.response_status.status=="200"){
    
    

            var temp_arr:any=[]
            var trasnfer={
              "center_id":this.school_id,
              "class_section_name":section_name,
              "section_id":val.batch,
             "tle_user_id":this.batch_accepted_user_id,
             "admission_no":this.admission_no_batch
      
            }
            temp_arr.push(trasnfer)
          var transfer_obj={
            "student_details":temp_arr
          }
          this.http.post(this.myService.constant.apiURL + 'students/emscccentertransfer', transfer_obj).subscribe(resp => {
            const value: any = resp;
 if(value.response.responseCode=="200"){
  this.http.post(this.myService.constant.apiURL + 'transfer/approvebatch', obj).subscribe(datas => {
    const transfer: any = datas;
    
   alert("Batch Transfer Successfully");
   window.location.reload()
  });
 }
 else if(value.response.responseCode=="202"){
  alert("No batch transfer");
 
 }
 else{
  alert("error Occured");
 }
          });
            // console.log("ehllo")
          
        
      }
    })
  }
}

