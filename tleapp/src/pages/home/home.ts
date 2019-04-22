import { Component, OnInit } from '@angular/core';
import { NavController,AlertController,IonicPage,ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import {FormGroup, FormControl} from '@angular/forms';
import { CommonProvider } from '../../providers/common/common';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
    
    public loginForm: FormGroup;
    public globalObj: any = {};

  constructor(private navCtrl: NavController,private http: HttpClient,private myProvider: CommonProvider,private alertCtrl: AlertController,private toastCtrl: ToastController) {
      this.globalObj.serverUrl = this.myProvider.globalObj.constant.apiURL;
      this.globalObj.domainUrl = this.myProvider.globalObj.constant.domainUrl;
      this.globalObj.projectName = this.myProvider.globalObj.constant.projectName;
      this.globalObj.passwordType = 'password';
      this.globalObj.passwordIcon = 'eye-off';
      this.globalObj.deviceId = window.localStorage.getItem('deviceId');
      
    this.generateToken();
        
  }
  
   ngOnInit() {

       this.loginForm = new FormGroup({
            username: new FormControl(''),
            password: new FormControl('')
        });
        this.getSchoolDetail();
   }
  
  onSubmit(value){
      let chkFlag = false;
      let message = '';
      if(value.username=='')
      {
        chkFlag = true;
        message = 'Username cannot be blank';
      }
      if(value.password=='')
      {
        chkFlag = true;
        message = 'Password cannot be blank';
      }
      if(value.username=='' && value.password=='')
      {
        chkFlag = true;
        message = 'Username and Password cannot be blank';
      }
      if(chkFlag)
      {     chkFlag = false; 
            const toast = this.toastCtrl.create({
                message: message,
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
            return;
    }
      
       const params = {
            "username": value.username,
            "password": value.password,
            "token": this.globalObj.token,
            "product_id": 'tleapp',
            "macid": 'tleapp',
            "device_type": 'mobile',
            "network_id": 'tleapp',
            "refrence_id": this.globalObj.deviceId
        };
         this.http.post(this.globalObj.serverUrl+"login/login", params).subscribe(data => {
           var loginres: any  = data;
           if(loginres.response_status.status=='200')
            { 
                window.localStorage.setItem('isClassTecher', loginres.response.user_detail.isClassTecher);
                window.localStorage.setItem('class_section', loginres.response.user_detail.class_section);
                window.localStorage.setItem('classTeacherSectionId', loginres.response.user_detail.class_teacher_section_id);
                window.localStorage.setItem('userType', loginres.response.user_detail.user_type);
                window.localStorage.setItem('productType', 'app');
                window.localStorage.setItem('sessionId', loginres.response.school_detail.session_id);
                window.localStorage.setItem('schoolId', loginres.response.school_detail.school_id);
                window.localStorage.setItem('loginId', loginres.response.user_detail.logined_id);
                window.localStorage.setItem('loginName', loginres.response.user_detail.name);
                window.localStorage.setItem('profileName', loginres.response.user_detail.name);
                window.localStorage.setItem('studSectionId', loginres.response.user_detail.section_id);
                window.localStorage.setItem('sessionStartDate', loginres.response.school_detail.session_start_date);
                window.localStorage.setItem('sessionEndDate', loginres.response.school_detail.session_end_date);
                let schoolContact = loginres.response.school_detail.contact_no?loginres.response.school_detail.contact_no:'NA';
                window.localStorage.setItem('schoolContact', schoolContact);
                let profileImage = loginres.response.user_detail.profile_image?this.globalObj.domainUrl+"/"+loginres.response.user_detail.profile_image:"assets/imgs/profile_img.jpg";
                
                window.localStorage.setItem('ProfileImage', profileImage);
                this.myProvider.changeMessage(profileImage);
                if(loginres.response.user_detail.user_type.toLowerCase()=='teacher')
                    {
                        
                      this.setTeacherLoginData(loginres);
                    }   
                
                if(loginres.response.user_detail.user_type.toLowerCase()=='parent')
                    {
                        this.setParentLoginData(loginres);
                        
                    }
                    if(loginres.response.user_detail.user_type.toLowerCase()=='student')
                    {
                    
                        this.setStudentLoginData(loginres);
                        
                    }
               
            }
            else
                {
                   
                    let alert = this.alertCtrl.create({
                        title: 'Login failed',
                        subTitle: 'Invalid username or password',
                        buttons: ['Dismiss']
                    });
                    alert.present();
                    
                }
      })
  }

  generateToken()
  {

    const tokenEmail = "erp@extramarks.com";
        const tokenPassword = "Extra@123";
        const calledfrom = "mobile";
        const params = {
            email: tokenEmail,
            password: tokenPassword,
            callfrom:calledfrom
        };
        
        this.http.post(this.globalObj.serverUrl+"oauthclients/login", params).subscribe(details =>{
            var tokenres: any  = details;
            window.localStorage.setItem('token', tokenres.response.token);
            this.globalObj.token = tokenres.response.token;
            
        },error => {
                    let errormsg = "Could not connect to server";
                    this.myProvider.toasterError(errormsg);
     }
        );
  }
    getSchoolDetail()
    {
     this.http.post(this.globalObj.serverUrl+"schools/schoollist", {}).subscribe(details =>{
         var schoolres: any  = details;
         if(schoolres.response && schoolres.response.length>1)
            {
                this.globalObj.schoolName = schoolres.response[0].school_name;
                this.globalObj.schoolLogo = schoolres.response[0].school_logo?this.globalObj.domainUrl+"/"+this.globalObj.projectName+"/"+schoolres.response[0].school_logo:'';
                window.localStorage.setItem('schoolName', this.globalObj.schoolName);
                window.localStorage.setItem('schoolLogo', this.globalObj.schoolLogo);
                
            }
            else
                {
                    this.globalObj.schoolName = "Total Learning Ecosystem";
                    this.globalObj.schoolLogo = "assets/imgs/schoollogo.png";
                    window.localStorage.setItem('schoolName', this.globalObj.schoolName);
                    window.localStorage.setItem('schoolLogo', this.globalObj.schoolLogo);
                }
     },error => {
                    this.globalObj.schoolName = "Total Learning Ecosystem";
                    this.globalObj.schoolLogo = "assets/imgs/schoollogo.png";
                    window.localStorage.setItem('schoolName', this.globalObj.schoolName);
                    window.localStorage.setItem('schoolLogo', this.globalObj.schoolLogo);
     }
     )   
    }
   hideShowPassword() {
     this.globalObj.passwordType = this.globalObj.passwordType === 'text' ? 'password' : 'text';
     this.globalObj.passwordIcon = this.globalObj.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
 }

 setTeacherLoginData(loginres)
 {
     let department = loginres.response.user_detail.department_Name;  
                      window.localStorage.setItem('department', department);
                      let designation = loginres.response.user_detail.designation_Name;
                      window.localStorage.setItem('designation', designation);
                      this.navCtrl.setRoot('LayoutPage');

                      let params = {
                          "user_id": loginres.response.user_detail.user_id,
                          "session_id":loginres.response.school_detail.session_id,
                          "type": "Teacher",
                          "school_id":loginres.response.school_detail.school_id
                        }

                      this.http.post(this.globalObj.serverUrl + "users/userdetail", params).subscribe(data => {
                        var userdetail: any  = data;
                        if(userdetail.response_status.status=='200')
                        { 
                            let sectionList = userdetail.response.staffdetail.sectionlist;
                            let temarr = [];
                            
                                for(let key in sectionList)
                                {
                                    
                                    temarr.push({classId:sectionList[key].class_id,classSectionId:sectionList[key].section_id,classSecName:sectionList[key].class_section_name})
                                }
                                window.localStorage.setItem('allsectiondata', JSON.stringify(temarr));
                           
                            window.localStorage.setItem('sectionId', userdetail.response.staffdetail.sectionlist[0].section_id);
                        }
                      })

 }

  setParentLoginData(loginres)
 {
                        window.localStorage.setItem('siblingData', JSON.stringify(loginres.response.child_list));
                        window.localStorage.setItem('studentUserId', loginres.response.child_list[0].user_id);
                        window.localStorage.setItem('studentSectionId', loginres.response.child_list[0].section_id);
                                            
                        let params = {"user_id":loginres.response.child_list[0].user_id,
                        "session_id":loginres.response.school_detail.session_id,
                        "type":"Student",
                        "school_id":loginres.response.school_detail.school_id};
                        this.http.post(this.globalObj.serverUrl+"users/userdetail", params).subscribe(data => {
                            var userdetail: any  = data;
                            if(userdetail.response_status.status=='200')
                            {
                                let classTeacher = userdetail.response.classTeacher_name?userdetail.response.classTeacher_name:'NA';
                             window.localStorage.setItem('classTeacherName', classTeacher);
                             window.localStorage.setItem('class_section', userdetail.response.class_section);
                            }
                            let admissionNo = userdetail.response.admission_no;
                            window.localStorage.setItem('admissionNo', admissionNo);
                            window.localStorage.setItem('loginName', userdetail.response.name);
                            window.localStorage.setItem('profileName', userdetail.response.father_name);
                             let profileImage = userdetail.response.student_photo?this.globalObj.domainUrl+"/"+userdetail.response.student_photo:"assets/imgs/profile_img.jpg";
                             window.localStorage.setItem('ProfileImage', profileImage);
                            this.navCtrl.setRoot('LayoutPage');
                            
                        })

 }
    setStudentLoginData(loginres)
 {
     window.localStorage.setItem('studentSectionId', loginres.response.user_detail.section_id);
     let params = {"user_id":loginres.response.user_detail.logined_id,
                        "session_id":loginres.response.school_detail.session_id,
                        "type":"Student",
                        "school_id":loginres.response.school_detail.school_id};
                        this.http.post(this.globalObj.serverUrl+"users/userdetail", params).subscribe(data => {
                            var userdetail: any  = data;
                            if(userdetail.response_status.status=='200')
                            {
                                let classTeacher = userdetail.response.classTeacher_name?userdetail.response.classTeacher_name:'NA';
                             window.localStorage.setItem('classTeacherName', classTeacher);
                            }
                            let admissionNo = userdetail.response.admission_no;
                            window.localStorage.setItem('admissionNo', admissionNo);
                            window.localStorage.setItem('loginName', userdetail.response.name);
                            this.navCtrl.setRoot('LayoutPage');
                            
                        })

 }

}
