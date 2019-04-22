import { Component, OnInit } from '@angular/core';
import { NgForm, FormControlName } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-staffcenterassignment',
  templateUrl: './staffcenterassignment.component.html',
  styleUrls: ['./staffcenterassignment.component.css']
})
export class StaffcenterassignmentComponent implements OnInit {

  staffWiseForm : FormGroup;
  centerWiseForm : FormGroup;
  staffArray : FormArray;
  centerArray : FormArray;
  public successMessage: any = {};
  public errorMessage: any = {};
  public staffArr:any = {};
  public schoolList:any = {};
  public assignedSchool: any = {};
  public facultyArr: any = {};
  public assignedUser: any = {};
  mylang: any = '';
  public userTypeList : any = {};
  public roleList: any = {};
  public roleArr: any = {};
  public userRoleAssinged: any = {};

  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService) {
    this.mylang = window.localStorage.getItem('language');
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    }
    else {
      translate.setDefaultLang('en');
    }
  }

  ngOnInit() {

    this.staffArray = new FormArray([]);
    this.centerArray = new FormArray([]);

    
    this.getStaffFromSet();
    
    this.getCenterFromSet();

    this.schoollist();

    this.getFacultyList();

    this.getAllUserType();

  }

  getStaffFromSet() {
    this.staffWiseForm = new FormGroup({
      staff: new FormControl('', Validators.required),
      id: new FormControl(''),
      centerlist:  this.centerArray,
      user_type: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required)
    });
  }

  getCenterFromSet() {
    this.centerWiseForm = new FormGroup({
      staffrecord: this.staffArray,
      id: new FormControl(''),
      center: new FormControl('', Validators.required),
      center_user_type: new FormControl('', Validators.required),
      center_role: new FormControl('', Validators.required)
    });
  }

 
  staffCenterAssignment(value){

    let today = new Date();
    var k=0;
    var tempCenterArray:any = [];
    var dbCenterData:any = [];

    for(k=0;k<value.centerlist.length;k++){
      if(value.centerlist[k]){
        // collect data of check boxes if checked...
        tempCenterArray.push({
          school_id: this.schoolList[k].id,
          school_name : this.schoolList[k].school_name,
          user_id : value.staff,
          date : today
        });
      }
    }

    var staffDetail = this.facultyArr.find(dataObj => dataObj.emp_code==value.staff);

    var j=0;
    for(j=0;j<this.assignedSchool.length;j++){
      if(this.assignedSchool[j]){
        dbCenterData.push(this.assignedSchool[j].schoolId);
      }
    }
    
    var paramArr = {
      'postvalue' : tempCenterArray,
      'dbvalue' : dbCenterData,
      'staff_detail' : staffDetail,
      'source' : "staff",
      'date' : today,
      'user_type' : value.user_type,
      'role' : value.role
    };
    
    this.http.post(this.myService.constant.apiURL + "user_schools/assignusercenter", paramArr).subscribe(data => {
      const detail:any = data;
      this.successMessage.message = detail.response.message;
      setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
      this.getStaffFromSet();
    });

  }

  /*
  * Center Wise center assignment to staff
  */
  centerStaffAssignment(value){
    let today = new Date();
    var j = 0;
    var tempStaffArray:any = [];
    var dbStaffData:any = [];
    
    for(j=0;j<value.staffrecord.length;j++){
      if(value.staffrecord[j]){
        // collect data of check boxes if checked...
        tempStaffArray.push({
          type : "staff",
          staff_code: this.facultyArr[j].emp_code,
          name : this.facultyArr[j].emp_name,
          school_id : value.center,
          date : today,
          //personal_email : this.facultyArr[j].personal_email,
          email : this.facultyArr[j].official_email,
          gender : this.facultyArr[j].emp_gender,
          dob : this.facultyArr[j].emp_dob,
          date_of_join : this.facultyArr[j].emp_doj,
          mobile : this.facultyArr[j].emp_mobile_no,
          //dep_deg_id : this.facultyArr[j].dep_deg_id,
          //emp_releiving_status : this.facultyArr[j].emp_releiving_status,
          emp_status : this.facultyArr[j].emp_status,
          //emscc_role_id : this.facultyArr[j].emscc_role_id,
          //emp_type : this.facultyArr[j].emp_type,
          //band_id : this.facultyArr[j].band_id,
          //dep_id : this.facultyArr[j].dep_id,
          //deg_id : this.facultyArr[j].deg_id,
          department_name : this.facultyArr[j].dep_name,
          designation_name : this.facultyArr[j].deg_name,
          user_type : value.center_user_type,
          role : value.center_role,
        });
      }
    }

    var j=0;
    for(j=0;j<this.assignedUser.length;j++){
      if(this.assignedUser[j]){
        dbStaffData.push(this.assignedUser[j].staff_code);
      }
    }
    
    var paramArr = {
      'postvalue' : tempStaffArray,
      'dbvalue' : dbStaffData,
      'source' : "center"
    };
    
    this.http.post(this.myService.constant.apiURL + "user_schools/assignusercenter", paramArr).subscribe(data => {
      const detail:any = data;
      this.successMessage.message = detail.response.message;
      setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
      //this.getCenterFromSet();
    });

  }

  /*
  * Get Faculty list from MYHR
  */

 getFacultyList(){
  this.http.post(this.myService.constant.apiURL+"myhrs/getfaculty", null).subscribe(data => {
    const facultyData: any = data;
    this.facultyArr = facultyData.response;
    this.facultyArr.forEach(data => {
      this.staffArray.push(new FormControl(''));
    });
  });
}

  schoollist(){
    this.http.post(this.myService.constant.apiURL+"schools/getallschoollist", null).subscribe(data => {
      this.schoolList = data;
      this.schoolList = this.schoolList.response;
      this.schoolList.forEach(data => {
        this.centerArray.push(new FormControl(''));
      });

      
    });
  }

  checkboxChecked(staffCode){
    for(let i in  this.schoolList){
    (<FormArray>this.staffWiseForm.get("centerlist")).controls[i].setValue(false);
    }
    this.getActiveAssignedSchool(staffCode);
  }

  getActiveAssignedSchool(staffCode){
    var param = {"staff_code" : staffCode};
    this.http.post(this.myService.constant.apiURL+"staffs/getstaffcodebyassignschool", param).subscribe(data => {
      this.assignedSchool = data;
      
      if(this.assignedSchool.response != null){
        let userTypeVal = this.assignedSchool.response.assigned_user.user_type;
        if(this.userTypeList.includes(userTypeVal)){
          this.staffWiseForm.patchValue({
            user_type: userTypeVal
          });
          this.getUserRole(userTypeVal);
        }

        let roleName = this.assignedSchool.response.assigned_user.role_name;if(this.userTypeList.includes(userTypeVal)){
        this.staffWiseForm.patchValue({
          role: roleName
          });
        }
       
        this.assignedSchool = this.assignedSchool.response.assigned_user.user_have_assign_schools;
        var boardActiveData= this.assignedSchool.filter(data=>data.status=="Active");
        this.schoolList.forEach( (schoolArr, i) => {
          let rUrl =function(url) {return url.schoolId==schoolArr.id}
          if(boardActiveData.find(rUrl)){
            (<FormArray>this.staffWiseForm.get("centerlist")).controls[i].setValue(true);
          }
        });
      }else{
        this.staffWiseForm.patchValue({
          user_type: ""
        });
        this.staffWiseForm.patchValue({
          role: ""
          });
      }
    });
  }

  centerChecboxChecked(schoolId){
    for(let i in  this.facultyArr){
    (<FormArray>this.centerWiseForm.get("staffrecord")).controls[i].setValue(false);
    }
    
    this.getalluserbyschoolid(schoolId);
  }

  getalluserbyschoolid(schoolId){
    var param = {"school_id" : schoolId};
    this.http.post(this.myService.constant.apiURL+"user_schools/getalluserbyschoolid", param).subscribe(data => {
      this.assignedUser = data;
      this.assignedUser = this.assignedUser.response.data;
      
      var staffActiveData= this.assignedUser.filter(data=>data.status=="Active");
      this.facultyArr.forEach( (faculty, i) => { 
        let rUrl =function(url) {return url.staff_code==faculty.emp_code}
        if(staffActiveData.find(rUrl)){
           (<FormArray>this.centerWiseForm.get("staffrecord")).controls[i].setValue(true);
         }
      });

    });
  }


  /*
  * Get All User Type
  */

  getAllUserType(){
    this.http.get(this.myService.constant.apiURL+"leftmenu/usertypelist").subscribe(data => {
      const userTypeList: any = data;
      this.userTypeList = userTypeList.user_type;
      this.userTypeList = this.userTypeList.filter(data=>data!="Student");
      this.userTypeList = this.userTypeList.filter(data=>data!="Parent");
    });
  }

  /*
  * Get User Type Wise role
  */
  getRole(userType){ 
    this.http.get(this.myService.constant.apiURL+"leftmenu/userrolelist").subscribe(data => {
      const roleList: any = data;
      this.roleList = roleList.user_role;
      this.roleList = this.roleList[userType]
    });
  }

  getUserRole(userType){
    this.http.get(this.myService.constant.apiURL+"leftmenu/userrolelist").subscribe(data => {
      const roleArr: any = data;
      this.roleArr = roleArr.user_role;
      this.roleArr = this.roleArr[userType]
    });
  }

}
