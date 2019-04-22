import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.css']
})
export class InquiryComponent implements OnInit {

  private mylang;
  public enquiryForm : FormGroup;
  boards_list:any=[];
  errormsg:any=''
  center_code:any=''
  enqList:any=[]
  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService) {
    this.appLanguage();
  }

  ngOnInit() {
 this.enquiryForm= new FormGroup({
      name : new FormControl('', Validators.required),
      mobile :new FormControl('', Validators.required),
      email :new FormControl('', Validators.required), 
      course : new FormControl('', Validators.required),
      serviceType : new FormControl('', Validators.required)
    })
    this.http.get(this.myService.constant.apiURL+ "boards/getactiveboard" ).subscribe(data => {
      const datas: any = data;
      this.boards_list =datas.response
     
    })
    const param={
      "school_id":window.localStorage.getItem('school_id')
    }
   this.http.post(this.myService.constant.apiURL+"schools/schooldetail",param).subscribe(detail=>{
     const data :any=detail
this.center_code=data.response.school_code
this.tablelist();
   });
   
  }
   createEnquiry(enquiryData){
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (reg.test(enquiryData.email) == false) 
    { 
        this.errormsg='Invalid  Email Id';
        return (false);
    }

     const enquiryFilterData={
       "name":enquiryData.name,
       "mobile":enquiryData.mobile,
       "email":enquiryData.email,
       "course":enquiryData.course,
       "service_type":enquiryData.serviceType,
       "center_code":this.center_code
     }
     this.http.post(this.myService.constant.apiURL+"enquiry/createennq",enquiryFilterData).subscribe(responseData=>{
     const enq :any=responseData
     console.log(enq)
     this.errormsg=''
     if(enq.response.result.Message[0].Message){
       alert( "Enquiry Created.  Your Enquiry No. is "+enq.response.result.Message[0].Message.enquiry_name);
      //  window.location.reload()
      this.enquiryForm.patchValue({
        name : "",
        mobile :"",
        email :"",
        course :"",
        serviceType : ""
      })}
      else{
        alert("Error Occured")
      }
      this.tablelist();
     })
    

    
  }
  appLanguage(){
    this.mylang= window.localStorage.getItem('language');
    if(this.mylang){
      this.translate.setDefaultLang( this.mylang);
    }
    else{
      this.translate.setDefaultLang( 'en');
    }
    return;
  }
  tablelist(){
const param={
  "center_code":this.center_code
}
this.http.post(this.myService.constant.apiURL+"enquiry/centerwiselist",param).subscribe(responseData=>{
  const enq :any=responseData
console.log(enq);
if(enq.response.result.data){
this.enqList =enq.response.result.data;}

});
  }
  
  isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }
}
