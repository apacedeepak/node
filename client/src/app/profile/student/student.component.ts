import { Component, OnInit } from '@angular/core';
import {Headers,  Response} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgForm ,FormsModule,FormGroup, FormBuilder ,FormArray,FormControl} from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';

import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  form: FormGroup;
  public globalObj: any = {};
  public global: any = {};
  public sessionId: any;
  public userId: any;
  public userType: any;
  public schoolId: any;
  public token: any;
  public studentDetail:any;
  public studentData:any;
  public user_id_php:any;
  public responsedata:any;
  mylang:any='';
  ngAfterContentInit(){
    this.mylang= window.localStorage.getItem('language');
    if(!this.mylang){
      this.mylang = 'en';
    }
   
   
     this.translate.setDefaultLang( this.mylang);
    
     this.translate.use(this.mylang);
  }
  constructor(private http: HttpClient, private myService: BackendApiService,private fb: FormBuilder,private translate: TranslateService) {
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
   }
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {

    this.form = this.fb.group({
        radiobutton: new FormControl(),
        updateEmail: new FormControl(),
        updatePhone: new FormControl(),
        otptext: new FormControl(),
      })
      this.globalObj.emailUpdate = 0;
    this.globalObj.admin = 1;
    this.globalObj.emailAlert = 0;
    this.globalObj.phoneAlert = 0;
    this.globalObj.phoneUpdate = 0;
    this.globalObj.mobileUpdateShow = 0;
    this.globalObj.emailUpdateShow = 0;
    this.sessionId = window.localStorage.getItem('session_id');
    this.userId = window.localStorage.getItem('user_id');
    this.userType = window.localStorage.getItem('user_type');
    this.schoolId = window.localStorage.getItem('school_id');
    this.token = window.localStorage.getItem('token');
    this.user_id_php = window.localStorage.getItem('user_id_php');
    this.global.product_type = window.localStorage.getItem('product_type');
    this.global.userNumber = window.localStorage.getItem('userNumber');
    this.global.userEmail = window.localStorage.getItem('userEmail');
    const productType = window.localStorage.getItem('product_type');
    this.globalObj.student_user_id = window.localStorage.getItem('student_user_id');
    this.global.product_type = productType.toLowerCase();
    this.global.domainUrl = this.myService.commonUrl1;
    this.global.domainUrlwithSlash = this.myService.commonUrl;
    this.global.productName = this.myService.constant.PROJECT_NAME;
    this.global.domainWithProjectName = this.global.domainUrl+this.myService.constant.PROJECT_NAME;

    const params = {
      "user_id": this.userId,
      "session_id": this.sessionId,
      "token": this.token,
      "type": this.userType,
      "school_id": this.schoolId
    };

    this.http.post(this.myService.constant.apiURL + 'users/userdetail', params).subscribe(details => {

      this.studentDetail = details;
      this.studentData = this.studentDetail.response;
      console.log(this.studentData);
    });

  }

  popUpOpen(){
    let param ={
          user_id: this.userId,
          user_type: this.userType,
          school_id: this.schoolId,
          student_user_id: this.globalObj.student_user_id
      };
    this.http.post(this.myService.constant.apiURL + 'users/getuserinfobyuserid', param).subscribe(details => {
        const data: any = details;
        const webAuth = data.response.website_auth;
        this.globalObj.phone = data.response.phone;
        this.globalObj.name = data.response.name;
        this.globalObj.email = data.response.email
        if(!this.globalObj.phone){
            this.globalObj.phone = '';
            this.globalObj.phone1 = 2;
        }else{
            this.globalObj.phone1 = this.globalObj.phone;
        }
        
        if(!this.globalObj.email){
            this.globalObj.email = '';
            this.globalObj.email1 = 3;
        }else{
            this.globalObj.email1 = this.globalObj.email;
        }
        this.globalObj.phoneUpdate = 0;
        this.globalObj.emailUpdate = 0;
        this.globalObj.phoneCheck = 0;
        this.globalObj.emailCheck = 0;
        this.globalObj.onAdmissionUpdate = 1;
        this.globalObj.onMobileUpdate = 0;
        this.globalObj.finalUpdateMobile = 0;
        this.globalObj.onEmailUpdate = 0;
        this.globalObj.otpConfirmBox = 0;
        this.globalObj.onEmailSentMessage = 0;
        this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});
        this.globalObj.adminNo = data.response.admission_no +'@'+data.response.school_code;
        //this.form.patchValue({'radiobutton':this.globalObj.adminNo})
          if(webAuth == 1){
              this.globalObj.phoneCheck = 1;
              this.globalObj.emailCheck = 0;
              this.globalObj.admin = 0;
              this.globalObj.mobileUpdateShow = 1;
              this.globalObj.phone = data.response.current_userName;
          }else if(webAuth == 2){
              this.globalObj.emailCheck = 1;
              this.globalObj.phoneCheck = 0;
              this.globalObj.admin = 0;
              this.globalObj.emailUpdateShow = 1;
              this.globalObj.email = data.response.current_userName;
          }else{
            this.globalObj.emailCheck = 0;
              this.globalObj.phoneCheck = 0;
              this.globalObj.admin = 1;
              this.globalObj.adminNo = data.response.current_userName;
          }
            (<any>$('#overlay')).modal('show');

    });


  }


checkExist(type){
      if(type == 'email'){
        this.globalObj.emailCheck = 1;
        this.globalObj.phoneCheck = 0;
        this.globalObj.mobileUpdateShow = 0;
        this.globalObj.emailUpdateShow = 1;
         if(this.globalObj.email == '' || this.globalObj.email == null || this.globalObj.email == undefined){
            this.globalObj.emailUpdate = 0;
            this.globalObj.phoneUpdate = 0;
            this.globalObj.admin = 0;
         }
      }
      if(type == "phone"){
        this.globalObj.phoneCheck = 1;
        this.globalObj.emailCheck = 0;
        this.globalObj.mobileUpdateShow = 1;
        this.globalObj.emailUpdateShow = 0;
          if(this.globalObj.phone == '' || this.globalObj.phone == null || this.globalObj.phone == undefined){
            this.globalObj.phoneUpdate = 0;
            this.globalObj.emailUpdate = 0;
            this.globalObj.admin = 0;
         }
      }
      if(type == "phoneUp"){
        this.globalObj.phoneUpdate = 1;
        this.globalObj.emailUpdate = 0;
        this.globalObj.admin = 0;
        this.globalObj.onAdmissionUpdate = 0;
        this.globalObj.onMobileUpdate = 1;
        this.globalObj.otpConfirmBox = 0;
        this.globalObj.onEmailUpdate = 0;
        this.globalObj.sendOTP = 1;
        this.globalObj.verified = 0;
        this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});
      }
      if(type == "emailUp"){
        this.globalObj.emailUpdate = 1;
        this.globalObj.phoneUpdate = 0;
        this.globalObj.admin = 0;
        this.globalObj.onMobileUpdate = 0;
        this.globalObj.otpConfirmBox = 0;
        this.globalObj.onEmailUpdate = 1;
        this.globalObj.onAdmissionUpdate = 0;
        this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});
      }
      if(type == "admin"){
        this.globalObj.emailUpdate = 0;
        this.globalObj.phoneUpdate = 0;
        this.globalObj.phoneCheck = 0;
        this.globalObj.emailCheck = 0;
        this.globalObj.mobileUpdateShow = 0;
        this.globalObj.emailUpdateShow = 0;
        this.globalObj.admin = 1;
      }
  }

   closePersonal(){

        this.globalObj.emailUpdate = 0;
        this.globalObj.phoneUpdate = 0;
        this.globalObj.phoneCheck = 0;
        this.globalObj.emailCheck = 0;
         this.globalObj.mobileUpdateShow = 0;
        this.globalObj.emailUpdateShow = 0;

  }

  onSubmit(value, event){

     var attr_pattern_email = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
      attr_pattern_email = new RegExp(attr_pattern_email);

      var attr_pattern_phone = /^\d{10}$/;
      attr_pattern_phone = new RegExp(attr_pattern_phone);
    let status = 3;
    if(this.globalObj.phoneCheck  == 1){
        if(this.globalObj.phoneUpdate == 1){
             if(!attr_pattern_phone.test(value.updatePhone)){
                 this.globalObj.phoneAlert = 1;
                 return false;
             }

        }
        status = 1;
    }

    if(this.globalObj.emailCheck  == 1){
      if(this.globalObj.emailUpdate == 1){
        if(!attr_pattern_email.test(value.updateEmail)){
             this.globalObj.emailAlert = 1;
             return false;
         }

      }
        status = 2;
    }
      let userName = this.globalObj.adminNo;
      if(this.globalObj.phoneCheck == 1 && value.updatePhone != '' && value.updatePhone != null){
              userName = value.updatePhone;
          }else if(this.globalObj.phoneCheck == 1 && (value.updatePhone == '' || value.updatePhone == null)){
              if(this.globalObj.phone == '' || this.globalObj.phone == null){
                this.globalObj.phoneAlert = 1;
                return false;
              }else{
                userName = this.globalObj.phone;
              }
          }

          if(this.globalObj.emailCheck == 1 && value.updateEmail != ''  && value.updateEmail != null){
              userName = value.updateEmail;
          }else if(this.globalObj.emailCheck == 1 && (value.updateEmail == '' || value.updateEmail == null)){
              if(this.globalObj.email == '' || this.globalObj.email == null){
                this.globalObj.emailAlert = 1;
                return false;
              }else{
                userName = this.globalObj.email;
              }
          }
       let param = {
                user_id: this.userId,
                user_type: this.userType,
                status: status,
                user_name: userName
          };
          
        this.http.post(this.myService.constant.apiURL + 'users/updateuserlogininfo', param).subscribe(detail => {
           const data:any = detail;
        if(data.response_status.responseCode == '200'){
         
    
              (<any>$('#overlay')).modal('hide');
              this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: ''});

              this.globalObj.admin = 1;
        
        }else if(data.response_status.responseCode == '202'){
            if(data.response.status == 1){
                this.globalObj.message = "Mobile number already exist.";
               setTimeout(() => {
                 this.globalObj.message = '';
               }, 2000);
                return false;
            }else if(data.response.status == 2){
                this.globalObj.message = "Email id already exist.";
               setTimeout(() => {
                 this.globalObj.message = '';
               }, 2000);
                return false;
            }else if(data.response.status == 3){
                (<any>$('#overlay')).modal('hide');
                return false;
            }

        }else{
            (<any>$('#overlay')).modal('hide');
        }
        setTimeout(()=>{
              this.globalObj.emailAlert = 0;
              this.globalObj.phoneAlert = 0;
          },3000);

      });
  }

   cancel(type){
    if(type == 'mobile'){
        this.globalObj.onAdmissionUpdate = 1;
        this.globalObj.onMobileUpdate = 0;
        this.globalObj.onEmailUpdate = 0;
    }else if(type == 'email'){
        this.globalObj.onAdmissionUpdate = 1;
        this.globalObj.onMobileUpdate = 0;
        this.globalObj.onEmailUpdate = 0;
    }

  }


  sendOTP(){


    if(this.form.get('updatePhone').value == null || this.form.get('updatePhone').value == ''){
          this.globalObj.message = "Please enter mobile number."
          setTimeout(() => {
            this.globalObj.message = '';
          }, 2000);
          return false;
    }

    var attr_pattern_phone = /^\d{10}$/;
      attr_pattern_phone = new RegExp(attr_pattern_phone);

      if(!attr_pattern_phone.test(this.form.get('updatePhone').value)){
                 this.globalObj.message = "Please enter only number."
                 setTimeout(() => {
                    this.globalObj.message = '';
                  }, 2000);
                 return false;
      }
                this.globalObj.viewMobile =  this.form.get('updatePhone').value;
                let param = {

                  "user_id":this.user_id_php,
                  "otp_sendto":this.form.get('updatePhone').value,
                  "token": this.token
                }
                this.http.post(this.myService.constant.apiURL +'otp_informations/sendotp',param).subscribe(detail => {
                })

        this.globalObj.onMobileUpdate = 0;
        this.globalObj.otpConfirmBox = 1;


  }

  confirmVaildData(type){
    if(type == 'mobile'){

        if(this.form.get('otptext').value == null || this.form.get('otptext').value == ''){
          this.globalObj.message = "Please enter otp number."
          setTimeout(() => {
            this.globalObj.message = '';
          }, 2000);
          return false;
    }

        let param = {

          "user_id":this.user_id_php,
          "otp_sendto":this.form.get('updatePhone').value,
          "otp_number": this.form.get('otptext').value,
          "user_type": this.userType,
          "token": this.token
        }

        this.http.post(this.myService.constant.apiURL +'otp_informations/verifyotp',param).subscribe(detail => {
         const data:any = detail;
        if(data.response_status.status == '200'){
          this.globalObj.sendOTP = 0;
          this.globalObj.verified = 1;
            this.globalObj.otpConfirmBox = 0;
            this.globalObj.onMobileUpdate = 1;
            this.globalObj.finalUpdateMobile = 1;
          }else if(data.response_status.status == '201' && data.response_status.message == 'No Valid OTP found'){
            this.globalObj.message = "Entered otp is incorrect."
              setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
              return false;
          }else if(data.response_status.status == '201' && data.response_status.message == 'Entered OTP is expired'){
            this.globalObj.message = "Entered otp is expired."
              setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
              return false;
          }
        })
    }

  }

  updateFinal(type){
    if(type == 'mobile'){

          let param = {
                user_id: this.userId,
                user_type: this.userType,
                status: 1,
                user_name: this.form.get('updatePhone').value
          };
          
      this.http.post(this.myService.constant.apiURL + 'users/updateuserlogininfo', param).subscribe(detail => {
            this.responsedata = detail;
            if(this.responsedata.response_status.responseCode == '202'){
         
              this.globalObj.message = "Mobile number already exist."
              this.globalObj.sendOTP = 1;
              this.globalObj.verified = 0;
              this.globalObj.finalUpdateMobile = 0;
              this.form.patchValue({updatePhone: '', otptext: ''});
              setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
              return false;
            }else if(this.responsedata.response_status.responseCode == '200'){
          //  this.http.get(this.myService.commonUrl1+this.myService.constant.PROJECT_NAME+'/erpapi/index/updatewebauth/user_id/'+ this.user_id_php + '/status/1').subscribe(details => {
              this.globalObj.userNumber = this.form.get('updatePhone').value;
            (<any>$('#overlay')).modal('hide');
              this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});

              this.globalObj.admin = 1;
            }
      });
    }
  }

  verifyEmail(){
    if(this.form.get('updateEmail').value == null || this.form.get('updateEmail').value == ''){
          this.globalObj.message = "Please enter email id."
          setTimeout(() => {
            this.globalObj.message = '';
          }, 2000);
          return false;
    }

    var attr_pattern_email = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
      attr_pattern_email = new RegExp(attr_pattern_email);

      if(!attr_pattern_email.test(this.form.get('updateEmail').value)){
                 this.globalObj.message = "Please enter correct email id."
                 setTimeout(() => {
              this.globalObj.message = '';
            }, 2000);
                 return false;
      }

      let param = {

        "user_id":this.user_id_php,
        "otp_sendto":this.form.get('updateEmail').value,
        "user_type": this.userType,
        "tle_user_id": this.userId,
        "token": this.token
      }

     this.globalObj.showEmail = this.form.get('updateEmail').value;
      this.globalObj.onEmailUpdate = 0;
         this.globalObj.onEmailSentMessage = 1;
      this.http.post(this.myService.constant.apiURL +'otp_informations/sendemail',param).subscribe(detail => {
         const data:any = detail;

              // (<any>$('#overlay')).modal('hide');
              this.form.patchValue({radiobutton: '',updateEmail:'', updatePhone: '', otptext: ''});
        })



  }

  popupdisplay(){
    (<any>$('#overlay')).modal('hide');
  }

}
