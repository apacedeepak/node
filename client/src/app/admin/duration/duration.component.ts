import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { BackendApiService } from "./../../services/backend-api.service";
var md5 = require("md5");

@Component({
  selector: "app-duration",
  templateUrl: "./duration.component.html",
  styleUrls: ["./duration.component.css"]
})
export class DurationComponent implements OnInit {
  public id: any;
  public duration_name: any;
  public duration_time: any;
  public editOrUpadte: any = '';
  public durationData: any = '';
  public schoolIdLocal: any = '';

  public globalObj: any = {};
  public durationList: any = [];
  public mylang: any = '';
  durationForm: FormGroup;
  public params: any = {};
  public userName: any = {};
  public centerId: any = '';
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.mylang = window.localStorage.getItem("language");
    this.schoolIdLocal = window.localStorage.getItem("school_id");
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang("en");
    }
  }

  private newMethod(): string {
    return 'app-duration';
  }

  ngOnInit() {
    this.userName = window.localStorage.getItem("username");
    this.centerId = window.localStorage.getItem("school_id");
    this.getFromSet();
    this.getDurationList(this.centerId);
  }

  getHrlogin() {
    var UserName = this.userName;
    if (UserName != "") {
      const url = this.myService.constant.apiURL + 'users/getuserdetails?userName=' + UserName;
      this.http.get(url).subscribe(details => {
        const data: any = details;
        const responseDate = data.response;
        var passwordData = responseDate.password;
        var checkSum = md5(UserName + ':' + this.myService.constant.SaultKey);
        var pchecksum = md5(UserName + ':' + passwordData);
        var loginUrl = this.myService.constant.HRLoginUrl + '/apis/auth/get/username/' + UserName + '/checksum/' + checkSum + '/pchecksum/' + pchecksum;
        window.open(loginUrl, '_blank');

      });
    }
  }

  getFromSet() {
    this.durationForm = new FormGroup({
      id: new FormControl(''),
      duration_name: new FormControl('', Validators.required),
      duration_time: new FormControl('', Validators.required)
    });
  }

  getDurationList(schoolId = 0) {
    const url =
      this.myService.constant.apiURL + 'duration_masters/getalldurationschool?school_id=' + schoolId;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.durationList = data.response;
    });
  }

  onSubmit(formValue) {
    this.params = {
      duration_name: formValue.duration_name,
      duration_time: formValue.duration_time,
      school_id: this.schoolIdLocal
    };

    if (formValue.id > 0) {
      this.params = {
        duration_name: formValue.duration_name,
        duration_time: formValue.duration_time,
        school_id: this.schoolIdLocal,
        id: formValue.id
      };
    }

    const url = this.myService.constant.apiURL + 'duration_masters/addduration';
    this.http.post(url, this.params).subscribe(details => {
      const data: any = details;
      const status = data.response.status;
      this.globalObj.message = data.response.message;
      this.getDurationList(this.centerId);
      this.clearForm();
      setTimeout(() => { this.globalObj.message = ''; }, 4000);
    });
  }

  durationEdit(DurationId) {
    if (DurationId) {
      this.editOrUpadte = 1;
      this.http
        .get(this.myService.constant.apiURL + 'duration_masters/getdurationrow?id=' + DurationId).subscribe(detail => {
          const data: any = detail;
          this.durationData = data.response;

          this.durationForm.patchValue({
            id: this.durationData.id,
            duration_name: this.durationData.duration_name,
            duration_time: this.durationData.duration_time,
            status
          });
          this.id = this.durationData.id;
        });
    }
  }

  durationStatusUpdate(DurationId, status, DurationName) {
    var vStatus = 'Inactive';
    if (status === 1) { vStatus = 'Active'; }
    if (confirm("Are you sure to " + vStatus + " '" + DurationName + "'")) {
      if (DurationId !== '') {
        this.params = {
          id: DurationId,
          status
        };
      }

      const url = this.myService.constant.apiURL + 'duration_masters/addduration';
      this.http.post(url, this.params).subscribe(details => {
        const data: any = details;
        const status = data.response.status;
        this.globalObj.message = 'Status updated successfully';
        this.getDurationList(this.centerId);
      });
    }
  }

  clearForm() {
    this.id = 0;
    this.durationForm.patchValue({
      id: 0,
      duration_name: '',
      duration_time: ''
    });
  }

  getUserPassword(UserName) {
    const url = this.myService.constant.apiURL + 'users/getuserdetails?userName=' + UserName;
    this.http.get(url).subscribe(details => {
      const data: any = details;
      console.log(details);
    });

  }
}
