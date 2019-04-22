import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-createcenter',
  templateUrl: './createcenter.component.html',
  styleUrls: ['./createcenter.component.css']
})
export class CreatecenterComponent implements OnInit {

  centerForm: FormGroup;
  public errorMessage: any = {};
  public successMessage: any = {};
  mylang: any = '';
  public staffArr: any = {};
  public stateCity: any = {};
  public allstates: any = [];
  public cityArr: any = [];
  public schoolList: any = {};
  public facultyArr: any = {};
  public userTypeList : any = {};
  public roleList: any = {};
  public schoolDetail:any = {};
  public global: any = {};

  page: number = 1;
  
  constructor(private http: HttpClient, private myService: BackendApiService, private translate: TranslateService) {
      this.mylang= window.localStorage.getItem('language');
      if(this.mylang){
        translate.setDefaultLang( this.mylang);
      }
      else{
        translate.setDefaultLang( 'en');
      }
  }

  ngOnInit() {

    this.global.domainUrlwithSlash = this.myService.commonUrl;

    this.getFromSet();

    /* Get All State City List */
    this.getAllState();

    /* Get All School List */
    this.schoollist();

    /* Get All Faculty List */
    this.getFacultyList();

    /* Get All User Type List */
    this.getAllUserType();
  }

  getFromSet() {
    this.centerForm = new FormGroup({
      id: new FormControl(''),
      center_name: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      center_code: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      mobile: new FormControl('', Validators.required),
      school_logo: new FormControl('', Validators.required),
      contact_person: new FormControl('', Validators.required),
      code: new FormControl(''),
      user_type: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required),
      gstin_no : new FormControl('', Validators.required),
      image_path: new FormControl('')
    });
  }

  createCenter(schoolData) {  
    var formData = new FormData();
    var schoolLogo = schoolData.school_logo;
    
    var staffArrData= this.facultyArr.find(data=>data.emp_code==schoolData.contact_person);
    let today = new Date();
    var tempObj = {
      type : "staff",
      staff_code: staffArrData.emp_code,
      name : staffArrData.emp_name,
      date : today,
      email : staffArrData.official_email,
      gender : staffArrData.emp_gender,
      dob : staffArrData.emp_dob,
      date_of_join : staffArrData.emp_doj,
      mobile : staffArrData.emp_mobile_no,
      emp_status : staffArrData.emp_status,
      department_name : staffArrData.dep_name,
      designation_name : staffArrData.deg_name,
      user_type : schoolData.user_type,
      role : schoolData.role,
      password: staffArrData.password
    }
    
    formData.append("state", schoolData.state);
    formData.append("city", schoolData.city);
    var centerCode = schoolData.center_code;
    formData.append("center_code", centerCode);
    formData.append("center_name", schoolData.center_name);
    formData.append("address", schoolData.address);
    formData.append("mobile", schoolData.mobile);
    formData.append("contact_person", schoolData.contact_person);
    formData.append("gstin_no", schoolData.gstin_no);
    formData.append("image_path", schoolData.image_path);
    formData.append("id", schoolData.id);
    formData.append("school_email", staffArrData.official_email);
     
    for (var i in schoolLogo) {
      formData.append(i, schoolLogo[i].file);
    }
    this.http.post(this.myService.constant.apiURL+"schools/addcenter", formData).subscribe(data => {
      const details: any = data;
      
      if(details.status == '200'){
        var schoolId = details.detail.id;
        tempObj['school_id'] = schoolId;
        this.http.post(this.myService.constant.apiURL+"staffs/assignandcreatestaff", tempObj).subscribe(data => {
          //this.successMessage.message = details.message;
          
          this.schoollist();
        });
        this.successMessage.message = details.message;
        setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
        this.getFromSet();
      }else{
        this.errorMessage.message = details.message;
        setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
      }
    });
  }

  onAccept(file:any){
    //console.log(file);
  }


  getAllState(){
    let params = {"tag":"StatesCity"};
    this.http.post(this.myService.constant.apiURL+"ctpconfiguration/getallstates", params).subscribe(data => {
      this.stateCity = data;
      var jsonval=this.stateCity.response.value;
      this.stateCity = JSON.parse(jsonval);
      this.allstates = Object.keys(this.stateCity);
       
    });
  }

  selectcity(stateValue){ 
    this.cityArr = this.stateCity[stateValue]
  }

  selectCenterCode(cityValue){
    var code = cityValue.substr(0, 2);
    var params = { "city" : cityValue };
    this.http.post(this.myService.constant.apiURL+"schools/getcenterbycity", params).subscribe(data => {
      const cityArr:any = data;
      let numCode = cityArr.response.length;
      var centerNo = "01";
      var count = 0;
      if(numCode > 0){
        count = cityArr.response.length + 1;
        centerNo = "0"+count;
      }
      var centerName = code+centerNo;

      this.http.post(this.myService.constant.apiURL+"schools/getschoolbystaffcode", {"school_code":centerName}).subscribe(resp => {
        const schoolsData:any = resp;
        if(schoolsData.response.length > 0){
          var centervalue = schoolsData.response.length + 1;
          centerName = code+"0"+centervalue;
          this.centerForm.patchValue({
            code: code,
            center_code: centerName.toUpperCase()
          });
        }else{
          this.centerForm.patchValue({
            code: code,
            center_code: centerName.toUpperCase()
          });
        }
      });

      
    });

    
  }

  schoollist(){
    this.http.post(this.myService.constant.apiURL+"schools/getallschoollist", null).subscribe(data => {
      this.schoolList = data;
      this.schoolList = this.schoolList.response;
    });
  }

  getContactNo(empCode){
    let dataObj = this.facultyArr.find(staffObj=> staffObj.emp_code == empCode);
    this.centerForm.patchValue({
      mobile: dataObj.emp_mobile_no
    });
  }

  /*
  * Get Faculty list from MYHR
  */

  getFacultyList(){
    this.http.post(this.myService.constant.apiURL+"myhrs/getfaculty", null).subscribe(data => {
      const facultyData: any = data;
      this.facultyArr = facultyData.response;
    });
  }

  editCenter(centerId){
    if(centerId){ 
      let requestParam = { "school_id": centerId };
      this.http.post(this.myService.constant.apiURL+"schools/schooldetail", requestParam).subscribe(data => {
        const schoolDetail: any = data;
        this.schoolDetail = schoolDetail.response;
        var mobile = "";
        var staffCode = "";
        var userType = "";
        var rolename = "";

        if(this.schoolDetail.school_have_contact_users){
          mobile = this.schoolDetail.school_have_contact_users.staff.mobile;
          staffCode = this.schoolDetail.school_have_contact_users.staff.staff_code;
          userType = this.schoolDetail.school_have_contact_users.user_type;
          rolename = this.schoolDetail.school_have_contact_users.role_name;
        }
        this.roleList = this.getRole(userType);        
        this.cityArr = this.stateCity[this.schoolDetail.state];
        
        this.centerForm.patchValue({
          id: this.schoolDetail.id,
          state: this.schoolDetail.state,
          city: this.schoolDetail.city,
          center_name: this.schoolDetail.school_name,
          center_code: this.schoolDetail.school_code,
          gstin_no: this.schoolDetail.gstin_no,
          address: this.schoolDetail.school_address,
          contact_person: staffCode,
          mobile: mobile,
          image_path: this.schoolDetail.school_logo,
          user_type: userType,
          role: rolename
        });
        this.centerForm.controls['state'].disable();
        this.centerForm.controls['city'].disable();
        
        this.global.logo = this.schoolDetail.school_logo;

      });
    }
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


}
