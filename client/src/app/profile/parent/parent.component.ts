import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {Headers,  Response} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgForm ,FormsModule,FormGroup, FormBuilder ,FormArray,FormControl} from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {
    
    @ViewChild('fileInput') fileInput: ElementRef;

form: FormGroup;
formprofile: FormGroup;
profilePhotoForm: FormGroup;

public globalObj: any = {};
public global: any = {};
  public sessionId: any;
  public userId: any;
  public userType: any;
  public schoolId: any;
  public token: any;
  public studentDetail:any;
  public studentData:any;
  public studentUserId:any;
  public groupflag: boolean = false;
  public category: any='';
  achieve_count: any = 0; 
  indiscipline_count: any = 0;
  count=0;
  mylang:any='';
  myflag: boolean=false;
  public user_id_php:any;
  public responsedata : any = '';
  teacherflag : boolean=true;
 public section_id: any ;
  public inDisciplineflag: boolean=true;
  public achiveval:boolean=false;
  public displineval:boolean=false;
  public arr:any=[];
  
userlist: any=[];
userlistdeduped: any=[];
  public file: any=[];
 public remarksList: any=[];
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
      });
     this.formprofile = this.fb.group({
        fatherMobile: new FormControl(),
        fatherEmail: new FormControl(),
        motherMobile: new FormControl(),
        motherEmail: new FormControl(),
      });
      
     this.profilePhotoForm = this.fb.group({
        upload: null
      });
      
      
      if(window.localStorage.getItem('parentFlag')){
          $('#parentt').addClass('active show');
          $('#parent a').addClass('active');
          $('#ward a').removeClass('active');
          $('#guard a').removeClass('active');
          $('#wards').removeClass('active');
          $('#guardian').removeClass('active');
          window.localStorage.removeItem('parentFlag');
      }

      
      this.globalObj.emailUpdate = 0;
      this.globalObj.profileData = 0;
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
    // this.globalObj.token = window.localStorage.getItem('token');
    this.token = window.localStorage.getItem('token');
    this.category=window.localStorage.getItem('category');
    this.studentUserId = window.localStorage.getItem('student_user_id');
    this.user_id_php = window.localStorage.getItem('user_id_php');
    this.global.product_type = window.localStorage.getItem('product_type');
    this.global.userNumber = window.localStorage.getItem('userNumber');
    this.global.userEmail = window.localStorage.getItem('userEmail');
    const productType = window.localStorage.getItem('product_type');
    this.global.product_type = productType.toLowerCase();
    this.global.domainUrl = this.myService.commonUrl1;
    this.global.domainUrlwithSlash = this.myService.commonUrl;
    this.global.productName = this.myService.constant.PROJECT_NAME;
    this.global.domainWithProjectName = this.global.domainUrl+this.myService.constant.PROJECT_NAME;
  // this.global.section_id=window.localStorage.getItem('section_id');
   this.getsectionId(this.section_id); 
  // this.userlist=[];
  //   this.userlistdeduped=[];
    this.globalObj.indexFlag = 0;
    this.globalObj.signFlag = 0;
this.newfunction();

this.myfunc();
if(this.myflag==false){
  this.count++;
}


    const params = {
      "user_id": this.studentUserId,
      "session_id": this.sessionId,
      "token": this.token,
      "type": 'student',//this.userType,
      "school_id": this.schoolId
    };

    this.http.post(this.myService.constant.apiURL + 'users/userdetail', params).subscribe(details => {

      this.studentDetail = details;
      this.studentData = this.studentDetail.response;
       this.global.father_photo = this.global.domainUrlwithSlash+this.studentData.father_photo;
    });


}

getissue(groupflag){
  if(groupflag=='In-discipline')
  {
this.category="In-discipline";
this.inDisciplineflag=true;
  }
  else if(groupflag=='Achievements'){
    this.category="Achievements";
    this.inDisciplineflag=false;
  }
}

getsectionId(section_id){

  const params_2: any = {"user_id": this.studentUserId,"token":this.token};
   this.http.post(this.myService.constant.apiURL + "user_sections/sectionbyuserid", params_2).subscribe(details => {
      const data: any = details;
     
        this.section_id = data.response[0].sectionId;
        this.newfunction();
      

      // const params_3 = {"user_id": this.studentUserId, "section_id": this.section_id,"token":this.globalObj.token}; 
      // this.http.post(this.myService.constant.apiURL + "user_sections/getsectionbyuserid", params_3).subscribe(details => {
      //     const data: any = details;
      //      if(data.response.length == 0){

      //       }else{

      //         // this.batchname = data.response[0].section_name;
      //         // this.batchname = data.response;
      //         if(section_id != 0){
      //           this.newfunction();
      //         }
              
      //       }
      // });
  });

  
}
accodfunc(){
  $(document).ready(function() {
    $('.accordion_body').eq(0).show();
    $('.accordion_head').eq(0).addClass('minussign');
    $(".accordion_head").click(function(){
    $(".accordion_head").removeClass('minussign');
    $(this).addClass('minussign');
    $(".accordion_body").hide();
    $(this).toggleClass("open").next().slideToggle('minussign');
    $(this).next(".accordion_body").show();
     });
    });
    
}
myfunc(){
  const para = {
   "user_id": this.studentUserId,
  "category":this.category
}
this.http.post(this.myService.constant.apiURL+"student_remark/getremarkbyuseridandfetchaccdate", para).subscribe(remark => {
    const getremak: any = remark;
  
    this.remarksList = getremak.response;
    let key;
    this.remarksList.forEach(obj => { 
         
      key = Object.keys(obj)[0];
      obj[key].forEach(object => {
        console.log(object);

         if(object.category=="Achievements"){
this.achiveval=true;
        // this.attacharr.push(obj.attachments);
         }
         if(object.category=="In-discipline"){
          this.displineval=true;
                  // this.attacharr.push(obj.attachments);
                   }

      });
      // if(this.attacharr!=[]){
      // this.subjectnamearr.push({name: key, attacharr: this.attacharr});
      // this.attacharr = [];

      // this.achieve_count = Object.values(obj).reduce((n, elem) => {
      //   if(elem.category == "Achievements")
      //     return n+1;
      // }, 0) 
      // this.indiscipline_count = Object.values(obj)[0].reduce((n, elem) => {
      //   if(elem.category == "In-discipline")
      //     return n+1;
      // }, 0)     
    })

});
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

newfunction(){
  
  const params1 = { 
                    "user_id": this.studentUserId,
                    "section_id": this.section_id,
                    "user_type": "Teacher",
                    "session_id": this.sessionId 
                  };

this.http.post(this.myService.constant.apiURL + "user_subjects/getstaffcodelist", params1).subscribe(details => {
const data: any = details;



// $('#dvallElements').html(this.userlist.join("<br>"));
// this.userlist = $.unique(this.userlist);

this.userlistdeduped = data.response;
this.userlist = Array.from( new Set(this.userlistdeduped) );


}); 
  

}
  popUpOpen(){
    let param ={
          user_id: this.userId,
          user_type: this.userType,
          school_id: this.schoolId,
          student_user_id: this.studentUserId
      };
    this.http.post(this.myService.constant.apiURL + 'users/getuserinfobyuserid', param).subscribe(details => {
        const data: any = details;
        const webAuth = data.response.website_auth;
        this.globalObj.phone = data.response.phone;
        this.globalObj.name = data.response.name;
        this.globalObj.email = data.response.email;
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
                  "token": this.token,
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
  
  editProfile(){
      this.globalObj.profileData = 1;
  }
  updateProfile(val){
      
        var attr_pattern_email = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        attr_pattern_email = new RegExp(attr_pattern_email);
        
        if(val.fatherEmail){
            if(!attr_pattern_email.test(val.fatherEmail)){
                alert(this.translate.instant("Please enter correct father email id"));
                return false;
            }
        }
        if(val.motherEmail){
            if(!attr_pattern_email.test(val.motherEmail)){
                alert(this.translate.instant("Please enter correct mother email id"));
                return false;
            }
        }
        
        var attr_pattern_phone = /^\d{10}$/;
        attr_pattern_phone = new RegExp(attr_pattern_phone);
            
        if(val.fatherMobile){
            if(!attr_pattern_phone.test(val.fatherMobile)){
                alert(this.translate.instant("Please enter correct father mobile number"));
                return false;
            }
        }
        if(val.motherMobile){
            if(!attr_pattern_phone.test(val.motherMobile)){
                alert(this.translate.instant("Please enter correct mother mobile number"));
                return false;
            }
        }
        if(!val.fatherEmail && !val.motherEmail && !val.fatherMobile && !val.motherMobile){
            this.globalObj.profileData = 0;
            return false;
        }
        
        let param = {
            user_id: this.userId,
            token: this.token,
            father_mobile: val.fatherMobile,
            father_email: val.fatherEmail,
            mother_mobile:val.motherMobile,
            mother_email: val.motherEmail
        }
        this.http.post(this.myService.constant.apiURL +'parents/updateparentprofilerecord',param).subscribe(detail => {
         const data:any = detail;
            if(data.response_status.responseCode == '200'){
                const params = {
                    "user_id": this.studentUserId,
                    "session_id": this.sessionId,
                    "token": this.token,
                    "type": 'student',//this.userType,
                    "school_id": this.schoolId
                };

                this.http.post(this.myService.constant.apiURL + 'users/userdetail', params).subscribe(details => {

                  this.studentDetail = details;
                  this.studentData = this.studentDetail.response;
                 
                  this.formprofile.patchValue({fatherMobile: null, fatherEmail: null, motherMobile: null, motherEmail: null});
                  this.globalObj.profileData = 0;
                });
            }
              
        })
        
       
      
  }
  
  
  onFileChange(event){
      this.file = [];
      let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      var file = event.target.files[0];
      
      this.file.push(event.target.files[0]);
      
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.profilePhotoForm.get('upload').setValue({
          filename: file.name,
          filetype: file.type,
          value: (<string>reader.result).split(',')[1]
        })
      };
    }
  }
  
  cancelUpload(){
        this.profilePhotoForm.get('upload').setValue(null);
        this.fileInput.nativeElement.value = '';
  }
  
  okUpload(){
      
        var formData = new FormData();
        
        for (var i in this.file) {
              formData.append(i, this.file[i]);
         }
         
         formData.append("user_id", this.userId);
         formData.append("token", this.token);
         formData.append("user_id_php", this.user_id_php);
         formData.append("session_id", this.sessionId);
         
         this.http.post(this.myService.constant.apiURL+"parents/updateprofileimage", formData).subscribe(data => {
            const details: any = data;
            this.profilePhotoForm.get('upload').setValue(null);
            this.fileInput.nativeElement.value = '';
            if(details.sucessResponse.responseCode == '200'){
                window.localStorage.setItem('parentFlag', '1');
                window.location.reload();
            }

          });
      
  }

}
