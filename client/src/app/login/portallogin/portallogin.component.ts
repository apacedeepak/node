import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlatformLocation } from '@angular/common';
import { BackendApiService } from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-portallogin',
    templateUrl: './portallogin.component.html',
    styleUrls: ['./portallogin.component.css']
})
export class PortalloginComponent implements OnInit {


    loginForm: FormGroup;
    loginDetails: any = '';
    loginResponse: any = '';
    commonUrl: string = '';
    indexUrl: string = '';
    url: string = '';
    urlstaff: string = '';
    schoolerpConst: string = '';
    checkSession: any;
    callfrom: string;
    userType: any;
    public token: any;
    message: any;


    constructor(private http: HttpClient,
        platformLocation: PlatformLocation,
        private router: Router,
        private myService: BackendApiService) {
        this.userType = window.localStorage.getItem('user_type');
        this.token = window.localStorage.getItem('token');

        if (this.userType != undefined && this.userType != null && this.userType != '') {
            this.dasboardRedirect(this.userType);
        }
    }
    ngOnInit() {

        this.loginForm = new FormGroup({
            username: new FormControl('', [Validators.required, Validators.pattern("/^[a-zA-Z]*$/")]),
            password: new FormControl('', [Validators.required])
        });



    }
    onSubmit = function (form: void) {
      
        //  this.myService.checkToken().then((token) =>{
        const params = {
            "username": form["username"],
            "password": form["password"],
            "product_id": '',
            "macid": '',
            "device_type": 'web',
            "network_id": '1234'
        };
         this.http.post(this.myService.constant.apiURL+"login/login", params).subscribe(data => {
        //this.http.post(this.myService.details.erpUrl, params).subscribe(data => {
            const details: any = data;
             
            if(details.response_status.status == 200){
                var responseUserData = details.response.user_detail;
                var responseSchoolData = details.response.school_detail;
                window.localStorage.setItem('session_id', responseSchoolData.session_id);
                window.localStorage.setItem('school_id', responseSchoolData.school_id);
                window.localStorage.setItem('user_id', responseUserData.logined_id);
                window.localStorage.setItem('student_user_id', responseUserData.user_id);
                window.localStorage.setItem('user_type', responseUserData.user_type);
                window.localStorage.setItem('product_type', responseSchoolData.product_type);
                window.localStorage.setItem('ldap_status', responseUserData.ssa_login);
                window.localStorage.setItem('web_redirect_url', responseUserData.ssa_webpath_url);
                window.localStorage.setItem('token', responseUserData.token);
                window.localStorage.setItem('username', responseUserData.username);
                window.localStorage.setItem('role_name', responseUserData.role_name);
                window.localStorage.setItem('name', responseUserData.name);
                window.localStorage.setItem('student_section_id', responseUserData.section_id);
                

                /* My Hr login */
                this.myhrlogin(responseUserData.username);

                this.userType = window.localStorage.getItem('user_type');
                const sessionId = window.localStorage.getItem('session_id');

                /*  zend session creation */
                this.http.post(this.myService.constant.apiURL + 'user_types/getusertype',{"type":this.userType}).subscribe(details => {
                    const responseDetail: any = details;
                    let userTypeId = responseDetail.response.id;
                    
                    this.http.post(this.myService.constant.apiURL + 'masteruserlog/usermasterlog',{"user_id":responseUserData.logined_id}).subscribe(details => {
                    const logDetail: any = details;
                    var logId = "";
                    if(logDetail.response == null){
                        logId = "";
                    }else{
                        logId = logDetail.response.id;
                    }
                    var urlZend = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME + '/default/login/sessionsetzendstorage';
                    
                    let postjson = { 
                        "user_id": responseUserData.logined_id, 
                        "school_id": responseSchoolData.school_id, 
                        "role_id": "", 
                        "username": responseUserData.username, 
                        "password": "", 
                        "status": "Active", 
                        "user_type_id": userTypeId, 
                        "new_user_id": responseUserData.logined_id, 
                        "user_login_id": responseUserData.logined_id,
                        "user_type" : this.userType,
                        "session_id" : responseUserData.session_id,
                        "token" : responseUserData.token,
                        "name" : responseUserData.name,
                        "log_id": logId
                    }
                    this.http.post(urlZend,postjson).subscribe(data => {
                        let details = data;
                    });
                    });
                });
             
                if (responseUserData.role_name != 'Superadmin' && (responseSchoolData.session_id == null || responseSchoolData.session_id == '')) {
                    window.localStorage.clear();
                    window.location.href = this.constant.domainName + "portal/login/portallogin";
                }
                setTimeout(() =>{ this.dasboardRedirect(this.userType); }, 500);
                
                
            }else{
                this.message = details.response_status.message;
                window.localStorage.setItem('messages', this.message);
            }

            // if (details.responseCode == 200) {
            //     window.localStorage.setItem('session_id', details.data.session_id);
            //     window.localStorage.setItem('token', details.data.token);
            //     window.localStorage.setItem('school_id', details.data.school_id);
            //     window.localStorage.setItem('student_user_id', details.data.student_user_id);
            //     window.localStorage.setItem('web_redirect_url', details.data.redirect_url);
            //     window.localStorage.setItem('ldap_status', details.data.ldap_status);
            //     window.localStorage.setItem('ldap_token', details.data.ldap_token);

            //     window.localStorage.setItem('user_id', details.data.logined_id);
            //     window.localStorage.setItem('user_type', details.data.user_type);


            //     window.localStorage.setItem('user_id_php', details.data.user_id_php);
            //     window.localStorage.setItem('product_type', details.data.product_type);
            //     window.localStorage.setItem('username', details.data.username);
            //     this.userType = window.localStorage.getItem('user_type');
            //     const session_id = window.localStorage.getItem('session_id');
            //     if (details.data.session_id == null || details.data.session_id == '') {
            //         window.localStorage.clear();
            //         window.location.href = this.constant.domainName + "portal/login/portallogin";
            //     }
            //     if (details.data.user_id_php == '' || details.data.user_id_php == 'loggedin_id' ||
            //         details.data.user_id_php == null || details.data.user_id_php == undefined) {
            //         window.localStorage.clear();
            //         window.location.href = this.constant.domainName + "portal/login/portallogin";
            //     }
            //     this.dasboardRedirect(this.userType);
            // } else if (this.loginResponse.response_status.status == 201) {
            //     this.message = this.loginResponse.response_status.message;
            // }
        });

        this.loginForm.reset();



    }

    dasboardRedirect(userType) {
       // alert(userType);
        if (userType !== null) {
            this.router.navigate(["dashboard"]);

        }
    }

    myhrlogin(userName) { 
        if (userName != "") {
            
          const url = this.myService.constant.apiURL + 'users/getuserdetails?userName=' + userName;
           this.http.get(url).subscribe(details => {
            const data: any = details;
            window.localStorage.setItem('myhrLoginUrl', data.response);
            // this.http.get(data.response).subscribe(details => {
               
            // });
   
          });
        }
      }

}
