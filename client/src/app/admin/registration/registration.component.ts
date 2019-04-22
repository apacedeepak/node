import { Component, OnInit, SecurityContext } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import {Router, NavigationStart} from '@angular/router';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  search_type:any='enquiry'
  searchform:FormGroup
  session_id:any;
  school_id:any;
  fee_structure_list:any=[]
  course_modes_list:any=[]
  registrationForm:FormGroup
  section_list:any=[]
  filter_batch:any=[]
  filteredsection:any=[]
  allclasssection:any=[]
  boards_list:any=[]
  discount_heads:any=[]
  optional_heads:any=[]
  discountarray:FormArray
  feeheadaarr:FormArray
  optionalarray:FormArray
  feeheadaarroptional:FormArray
  categoryobj:any={}
  subcat:any=[]
  adm_no:any
  discountflag:any=false
  classListArr:any;
  showoptional:any=false;
  errormsg:any=''
  dateA:any;
  enuqiry_no:any=''
  enqire:any=false
  center_code:any=''
  showcalander:any=false
  selected_course_mode:any;
  constructor(private router: Router,private http: HttpClient, private myService: BackendApiService, private translate: TranslateService) { }

  ngOnInit() {
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
var firstDay = new Date(y, m, 1);
var lastDay = new Date(y, m + 1, 0);
var preStartdate: any = lastDay.getDate();
var preStartMonth: any = lastDay.getMonth()+1;
var preStartYear: any = lastDay.getFullYear();
var dates=preStartYear + '-' + preStartMonth + '-' + preStartdate;
console.log(dates +"    "+ lastDay)
    const paramses={
      "school_id":window.localStorage.getItem('school_id')
    }
   this.http.post(this.myService.constant.apiURL+"schools/schooldetail",paramses).subscribe(detail=>{
     const data :any=detail
this.center_code=data.response.school_code

   });
    this.session_id=window.localStorage.getItem('session_id')
    this.school_id=window.localStorage.getItem('school_id')
    const paramss={
      "tag":"Category"
    }
    this.http.post(this.myService.constant.apiURL+ "ctpconfiguration/getcategory",paramss ).subscribe(data => {
      const datas: any = data;
      var json=datas.response.value
      this.categoryobj=JSON.parse(json)
     console.log(this.categoryobj)
     
    })
//     const obj={
// "school_id":this.school_id

//     }

    this.searchform=new FormGroup({
      enquiry:new FormControl(''),
      mobile:new FormControl('')
    })
    this.discountarray=new FormArray([])
    this.feeheadaarr=new FormArray([])
    this.optionalarray=new FormArray([])
    this.feeheadaarroptional=new FormArray([])
    this.registrationForm= new FormGroup({
      package:new FormControl(''),
      course_mode:new FormControl(''),
      course_type:new FormControl(''),
      batch: new FormControl(''),
  
      fname:new FormControl(''),
      lname:new FormControl(''),
      dob:new FormControl(''),
      gender:new FormControl(''),
      mobile_no:new FormControl(''),
      email_id:new FormControl(''),
      course:new FormControl(''),
      service:new FormControl(''),
      dicounts:this.discountarray,
      father_name:new FormControl(''),
      mother_name:new FormControl(''),
      father_email:new FormControl(''),
      discount_cat:new FormControl(''),
      discount_sub_cat:new FormControl(''),
      feeheadarr:this.feeheadaarr,
      optional:this.optionalarray,
      optionalfeehead:this.feeheadaarroptional

    })

    const paramsss={
      "school_id":this.school_id
    }
    // this.http.post(this.myService.constant.apiURL+"students/studentlist", paramsss).subscribe(data => {
    //   const detail:any=data
    // // this.adm_no=detail.response.length+1;
    // this.registrationForm.patchValue({
    //   username:this.adm_no
    // })
    // })
    // const params={
    //   "school_id":this.school_id,
    //   "session_id":this.session_id
    // }

    // this.http.post(this.myService.constant.apiURL+ "fee_structure_masters/getfeestructurelist", params).subscribe(data => {
    //   const datas: any = data;
    //   this.fee_structure_list =datas.response
     
    // })
    const param={
      "school_id":this.school_id,
      "session_id":this.session_id
    }
    this.http.post(this.myService.constant.apiURL+ "sections/schoolwisesectionlist", param).subscribe(data => {
      const datas: any = data;
      this.section_list =datas.response

    })
    this.http.get(this.myService.constant.apiURL+ "course_modes/getcoursemode" ).subscribe(data => {
      const datas: any = data;
      this.course_modes_list =datas.response
     
    })
    this.http.get(this.myService.constant.apiURL+ "boards/getactiveboard" ).subscribe(data => {
      const datas: any = data;
      this.boards_list =datas.response
     
    })

    
  }
  searchtype(val){
    this.search_type=val;
  }
  searchstudent(value){

var searchvar:any;
var param={}
if(this.search_type=='enquiry'){
  searchvar=value.enquiry
  param={
    "enquiry_number":  searchvar
  }
}
if(this.search_type=='mobile'){
  searchvar=value.mobile
  param={
    "mobile_no":  searchvar
  }
}
console.log(param)
this.http.post(this.myService.constant.apiURL+"enquiry/retrieve",param).subscribe(responseData=>{
  const enq :any=responseData
var det=enq.response.body.result[0];
if(det){
  if(det.enquiry_name){
    this.enqire=true;
    this.enuqiry_no=det.enquiry_name
  }
  else{
    this.enqire=false
    this.enuqiry_no=''
  }
  this.errormsg=''
  var student=det.student_name.split(" ")
var fname=student[0];
var lname=student[1];
this.registrationForm.patchValue({
  fname:fname,
  lname:lname,
  mobile_no:det.mobile_no,
  email_id:det.email_id
})
}
else{
  this.errormsg='Enquiry NUmber Not Found'
}
})
  }
  onsubmit(val){


var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

if (reg.test(val.father_email) == false) 
{
    this.errormsg='Invalid  Father Email Address';
    return (false);
}
if (reg.test(val.email_id) == false) 
{
    this.errormsg='Invalid  Candidate Email Address';
    return (false);
}
  
    var j=0;
    var discountarr:any=[]
    for(j=0;j<val.feeheadarr.length;j++){
      var obj= {
        "fee_head_id":val.feeheadarr[j],
        "discount_percent":val.dicounts[j]
      }
      discountarr.push(obj)

    }
var x=0;
var optionalarr:any=[]
for(x=0;x<val.optionalfeehead.length;x++){
  // var objects={
  //   "fee_head_id":val.optionalfeehead[x],
  //   "is_optional":val.optional[x]
  // }
  if(val.optional[x]==false){
  optionalarr.push(val.optionalfeehead[x])}
}

    var section_id=val.batch.substr(0,val.batch.indexOf(","))
section_id=parseInt(section_id)
    var section_name=val.batch.substr(val.batch.indexOf(",")+1,val.batch.length-1)
 
    const register={
      "type":"student",
      "student_email":val.email_id,
   
      "fname":val.fname,
      "mname":"",
      "lname":val.lname,
      "dob":val.dob,
      "gender":val.gender,
      "mobile":val.mobile_no,
      "class_section":section_name,
      "class_id":val.course_type,
      "board_id":val.course,
      "source":"EMSCC",
      "school_id":this.school_id,
      "father_name":val.father_name,
      "mother_name":val.mother_name,
      "father_email":val.father_email,
      "status":"Unpaid"
    }
   

    this.http.post(this.myService.constant.apiURL+ "registration/userregistration",register ).subscribe(data => {
   const datas:any=data
if(datas.responseCode=="200"){
  if(this.enqire==true){
    var obj={"enquiry_number":this.enuqiry_no,"enq_regis_status":"2"}
    this.http.post(this.myService.constant.apiURL+"enquiry/updatestatus",obj).subscribe(responseData=>{
      const enq :any=responseData});
   }
   if(this.enqire==false){
    const enquiryFilterData={
      "name":val.fname+" "+val.lname,
      "mobile":val.mobile_no,
      "email":val.email_id,
      "course":val.course,
      "service_type":"center_visit",
      "center_code":this.center_code
    }
    this.http.post(this.myService.constant.apiURL+"enquiry/createennq",enquiryFilterData).subscribe(responseData=>{
      const enq :any=responseData});
   }
  const param={
    "userId":datas.user_id,
    "fee_structure_id":val.package,
    "section_id":section_id,
    "session_id":this.session_id,
    "school_id":this.school_id,
     "discount":discountarr,
     "discount_category":val.discount_cat,
     "discount_subCategory":val.discount_sub_cat,
     "optional":optionalarr
  }

  this.http.post(this.myService.constant.apiURL+ "student_fee_structures/savestudentfee",param ).subscribe(detail => {
    const dataval:any=detail
    console.log(dataval)
    this.router.navigate(["fee/paymentviaregistration",datas.user_id]);
  })
}
else if(datas.response.responseMessage="user name already exist."){
  alert('user name already exist.')
}
else{
  alert("error occured")
}
  });
  }
  getfeeheads(fee_struct_id){
    this.registrationForm.patchValue({
     
      discount_cat:"",
      discount_sub_cat:"",
    })
    this.discount_heads=[];
    this.optional_heads=[];
    if(fee_struct_id){
      this.showoptional=true
      this.filteredsection=[]
      this.allclasssection=[]
     
      while (this.discountarray.length !== 0) {
        this.discountarray.removeAt(0)
      }
      while (this.feeheadaarr.length !== 0) {
        this.feeheadaarr.removeAt(0)
      }
 
    var temparr=[]
    var feestruct = this.fee_structure_list.find(fee => fee.fee_structure_id == fee_struct_id);
   const params={
     "fee_structure_id": feestruct.fee_structure_id
   } 
   this.http.post(this.myService.constant.apiURL+ "assign_term_fee/getfeeheadsbyfeestructure",params ).subscribe(data => {
    const datas: any = data;
    var feeheads =datas.response
   console.log(feeheads)
   var temparray:any=[]
   var temparray2:any=[]
   var i=0;
   feeheads.forEach(element => {

     if(element.fee_head.is_offer_applicable==1){
      
      if(temparray.indexOf(element.fee_head.id)==-1){
        temparray.push(element.fee_head.id)
       this.discount_heads.push(element.fee_head)
       this.discountarray.push(new FormControl(0));
       this.feeheadaarr.push(new FormControl(''));
       (<FormArray>this.registrationForm.get("feeheadarr")).controls[i].setValue(element.fee_head.id);
       i++;
      }
     }
     if(element.fee_head.is_optional==1){
      
      if(temparray2.indexOf(element.fee_head.id)==-1){
        temparray2.push(element.fee_head.id)
       this.optional_heads.push(element.fee_head)
       this.optionalarray.push(new FormControl(0));
       this.feeheadaarroptional.push(new FormControl(''));
       (<FormArray>this.registrationForm.get("optionalfeehead")).controls[i].setValue(element.fee_head.id);
       i++;
      }
     }

   });
  })
 

}
else{
  this.showoptional=false
  this.filteredsection=[]
  this.allclasssection=[]
 
  this.discountarray=new FormArray([])
}
  }
  getsectionlist(classId){
    this.registrationForm.patchValue({
     
      batch: "",
      package:"",
      discount_cat:"",
      discount_sub_cat:"",
    })
    this.discount_heads=[];
    this.optional_heads=[];
    const param = {
      "class_id": classId,
      "course_mode_id":this.selected_course_mode
    };

    this.http.post(this.myService.constant.apiURL + 'sections/allsectionbyclassid', param).subscribe(datas => {
      const section: any = datas;

      this.filter_batch = section.response;
    })
  }
  changecat(val){
this.subcat=this.categoryobj[val]
if(val){
  this.discountflag=true 
}
else{
 this.discountflag=false 
}
  }
  getclasslist(board_id){
    this.registrationForm.patchValue({
     
      course_type:"",
      batch: "",
      package:"",
      discount_cat:"",
      discount_sub_cat:"",
    })
    this.discount_heads=[];
    this.optional_heads=[];
    const classparams = {
      "boardId": board_id,
      "school_id": this.school_id
    }
    this.http.post(this.myService.constant.apiURL + 'classes/getclasslistbyboardId', classparams).subscribe(details => {
      const data: any = details
      this.classListArr = data.response


    });
  }
  getpackageList(sectionId){
    this.registrationForm.patchValue({
     
      package:"",
      discount_cat:"",
      discount_sub_cat:"",
    })
    this.discount_heads=[];
    this.optional_heads=[];
// console.log(sectionId)
if(sectionId){
var section_id=sectionId.substr(0,sectionId.indexOf(","))
section_id=parseInt(section_id)
const param={
  "section_id":section_id
}
this.http.post(this.myService.constant.apiURL + 'fee_structure_details/getfeestructurebysection', param).subscribe(details => {
  const data: any = details
  this.fee_structure_list =data.response
  console.log(this.fee_structure_list)
});}
else{
  this.fee_structure_list=[]
}
  }
  isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }
  resetfront(val){
    this.selected_course_mode=val
    this.registrationForm.patchValue({
      course:"",
      course_type:"",
      batch: "",
      package:"",
      discount_cat:"",
      discount_sub_cat:"",
    })
    this.discount_heads=[];
    this.optional_heads=[];
  }
  onDateChange(date: NgbDateStruct) {

 this.showcalander=false
      let f_year = date.year;
      let f_month = date.month < 10 ? '0' + date.month : date.month;
      let f_day = date.day < 10 ? '0' + date.day : date.day;
      this.dateA = f_year + "-" + f_month + "-" + f_day;
    //   if(this.toDate && this.dateA > this.today){
    //     alert('Please select to date more than or equal to from date');
    //    // this.dateA = this.toDate;
    //     return false;
    //   }
      

    this.registrationForm.patchValue({dob: this.dateA});
    
  }
  displaycal() {
    this.showcalander = true;

  }
}
