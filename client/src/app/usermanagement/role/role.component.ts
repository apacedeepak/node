import { Component, OnInit } from '@angular/core';

import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Params } from "@angular/router";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  mylang: any = '';
  roleForm: FormGroup;
  public errorMessage: any = {};
  public successMessage: any = {};
  public editOrUpadte = 0;
  public userTypeList: any = {};
  public roleList: any = {};
  public roleArr: any = {};
  public roleData = [];
  public menuListArr: any = {};
  public mainMenu: any = {};
  public menuArr: any = [];
  public roleListVal: any = {};


  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService, private activatedRoute: ActivatedRoute) {
    this.mylang = window.localStorage.getItem('language');
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang('en');
    }
  }

  ngOnInit() {
    this.editOrUpadte = 0;
    this.getFromSet();

    this.getAllUserType();

    this.getRoleList();
    
  }

  getFromSet() {
    this.roleForm = new FormGroup({
      user_type: new FormControl('', Validators.required),
      role_name: new FormControl('', Validators.required),
      id: new FormControl('')
    });
  }

  /*
  * Get All User Type
  */

  getAllUserType() {
    this.http.get(this.myService.constant.apiURL + "leftmenu/usertypelist").subscribe(data => {
      const userTypeList: any = data;
      this.userTypeList = userTypeList.user_type;
    });
  }

  /*
  * Get User Type Wise role
  */
  getRole(userType) {
    this.http.get(this.myService.constant.apiURL + "leftmenu/userrolelist").subscribe(data => {
      const roleList: any = data;
      this.roleList = roleList.user_role;
      return this.roleList[userType];
    });
  }


  saveRole(rolePost) {
   
    this.http.get(this.myService.constant.apiURL + "leftmenu/userrolelist").subscribe(data => {
      const roleList: any = data;
      this.roleList = roleList.user_role;
      this.roleArr = this.roleList[rolePost.user_type];
      let userType = rolePost.user_type;
      let roleName = rolePost.role_name
      this.roleArr.push(roleName);

      this.roleList[userType] = this.roleArr;
      let params = {
        product_type: "User_Type_Role",
        json_value: this.roleList
      };
      this.http.post(this.myService.constant.apiURL + "leftmenu/createupdate", params).subscribe(data => {
        const returnResp: any = data;
        if (returnResp.response.status == 200) {
            this.successMessage.message = returnResp.response.message;
        } else {
          this.errorMessage.message = returnResp.response.message;
        }
        setTimeout(() => { this.successMessage.message = ''; }, 3000);
        this.getFromSet();
      });

    });
  }

  getRoleList(){
    this.http.get(this.myService.constant.apiURL + "leftmenu/userrolelist").subscribe(data => {
      const roleList: any = data;
      this.roleListVal = roleList.user_role;
      console.log(this.roleListVal);
    });
  }

}
