import { Component, OnInit, ɵConsole } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { BackendApiService } from "./../../services/backend-api.service";
import { Router, ActivatedRoute } from '@angular/router';
import { parse } from 'path';
import { url } from 'inspector';

@Component({
  selector: "app-announcement",
  templateUrl: "./announcement.component.html",
  styleUrls: ["./announcement.component.css"]
})
export class AnnouncementComponent implements OnInit {
  public mylang: any = "";
  schoolIdLocal: any = "";
  sessionIdLocal: any = "";
  userIdLocal: any = "";
  userType: any = "";
  public editOrUpadte: any = "";
  public announcementData: any = "";
  public FormStatus: any = "0";
  public minDate: any;


  hostUrl: any = '';
  params: any;
  id: number;
  private sub: any;



  successmsg: any = "";
  errormsg: any = "";
  annnouncementForm: FormGroup;
  session_id: any;
  school_id: any;
  send_to_user_type: any;
  public globalObj: any = {};
  schoolListtable: any = [];
  public today: any;


  public typeSet: Array<Object> = [
    { id: 1, typeVal: "Notice" },
    { id: 2, typeVal: "Circular" }
  ];

  public currentDate: any;

  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.today = new Date();
    this.minDate = { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: this.today.getDate() };


    this.mylang = window.localStorage.getItem("language");

    this.schoolIdLocal = window.localStorage.getItem("school_id");
    this.sessionIdLocal = window.localStorage.getItem("session_id");
    this.userIdLocal = window.localStorage.getItem("user_id");
    this.userType = window.localStorage.getItem("user_type");

    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang("en");
    }

    var today = new Date();
    this.currentDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      if (this.id) {
        console.log("test amar edit --: " + this.id);
        this.announcementEdit(this.id);
      }
    });


    this.getFromSet();
    this.session_id = window.localStorage.getItem("session_id");
    this.school_id = window.localStorage.getItem("school_id");
    this.centerList();
    this.globalObj.typeSet = this.typeSet;
    console.log(this.globalObj.typeSet);

  }

  getFromSet() {
    this.annnouncementForm = new FormGroup({
      id: new FormControl(""),
      type: new FormControl(""),
      assign_centre: new FormControl(""),
      batch: new FormControl(""),
      title: new FormControl(""),
      description: new FormControl(""),
      start_date: new FormControl(""),
      end_date: new FormControl(""),
      // status: new FormControl(""),
      attachments: new FormControl("")
    });
  }

  onSubmit(formValue) {

    //console.log(JSON.stringify(formValue) + "check formValue");
    var formData = new FormData();

    var uploadFile = formValue.attachments;

    let StartYear = formValue.start_date.year;
    let StartMonth = formValue.start_date.month;
    if (StartMonth < 10) {
      StartMonth = "0" + StartMonth;
    }
    let StartDay = formValue.start_date.day;
    if (StartDay < 10) {
      StartDay = "0" + StartDay;
    }

    let set_start_date = StartYear + "-" + StartMonth + "-" + StartDay;

    let EndYear = formValue.end_date.year;
    let EndMonth = formValue.end_date.month;
    if (EndMonth < 10) {
      EndMonth = "0" + EndMonth;
    }
    let EndDay = formValue.end_date.day;
    if (EndDay < 10) {
      EndDay = "0" + EndDay;
    }

    let set_end_date = EndYear + "-" + EndMonth + "-" + EndDay;

    formData.append("userId", this.userIdLocal);
    formData.append("title", formValue.title);
    formData.append("type", formValue.type);
    formData.append("batch", formValue.batch);
    formData.append("assign_centre", formValue.assign_centre);
    formData.append("description", formValue.description);
    formData.append("start_date", set_start_date);
    formData.append("end_date", set_end_date);
    formData.append("status", "Active");
    JSON.stringify(formData);
    if (uploadFile.length != 0) {
      for (var i in uploadFile) {
        formData.append(i, uploadFile[i].file);
      }
    }

    this.http
      .post(
        this.myService.constant.apiURL + "announcements/addannouncement",
        formData
      )
      .subscribe(data => {
        // console.log("upload and file set ..." + JSON.stringify(data));
        alert("Announcement created successfully");
        this.router.navigate(["/communication/announcementlist"]);
        //window.location.reload();



      });
  }


  announcementEdit(addannouncementId) {
    /**DUMP ONLY */
    if (addannouncementId) {
      this.editOrUpadte = 1;
      const url = this.myService.constant.apiURL + "announcements/allannouncement";
      var params = {
        id: addannouncementId
      };
      this.http.post(url, params).subscribe(details => {

        const data: any = details;
        this.announcementData = data.response;
        this.globalObj.announcementViewData = this.announcementData;

        console.log(JSON.stringify(this.announcementData));
        console.log("store++++");

        this.annnouncementForm.patchValue({
          id: this.announcementData[0].id,
          title: this.announcementData[0].title,
          type: this.announcementData[0].type,
          description: this.announcementData[0].description
          // upload_file: this.doubtData.upload_file
        });
        console.log(this.annnouncementForm);
        console.log("okkkkk++");
      });
    }/*** */
  }



  usertype(val) {
    this.send_to_user_type = val;
    if (val == "teacher") {
    }
  }


  onAccept(file: any) {
    //console.log(file);
  }

  centerList() {
    let param = "";
    this.http
      .post(this.myService.constant.apiURL + "schools/getallschoollist", param)
      .subscribe(response => {
        const data: any = response;
        this.globalObj.centerList = data.response;
        this.globalObj.centerList.forEach(element => {
          var dispObj = {
            id: element.id,
            school_code: element.school_code,
            school_name: element.school_name
          };
          this.schoolListtable.push(dispObj);
        });
        // this.globalObj.schoolListtable = this.schoolListtable;
      });
  }


}
