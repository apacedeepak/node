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

@Component({
  selector: "app-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.css"]
})
export class StudentComponent implements OnInit {
  public globalObj: any = {};
  public errorMessage: any = {};
  public successMessage: any = {};

  public mylang: any = "";
  doubtsSearchFormGroup: FormGroup;
  doubtsForm: FormGroup;
  public params: any = {};
  public editOrUpadte: any = "";
  public doubtData: any = "";

  public title: any = "";
  public subjectId: any = "";
  public topic: any = "";
  public enter_doubts: any = "";
  public upload_file: any = "";
  public FormStatus: any = "0";

  public upload_file_set: any = "";

  public FormSubjectSearch: any = "0";
  public FormStatusSearch: any = "0";

  public sessionId: any = "";
  public schoolId: any = "";
  public userId: any = "";
  public sectionId: any = "";
  public token: any = "";

  public show_add_doubt: boolean = false;
  public show_view_doubt: boolean = false;
  public show_list_doubt: boolean = true;
  public show_reset: boolean = true;
  public button_name: any = "Add";
  public ask_doubts: any = "Ask Doubts";

  private Searchparams: any = "test";

  // public doubtsStatus : any = {"Doubt Raised","Doubt Owned","Doubt Solved"};

  public doubtsStatus: Array<Object> = [
    { id: 1, doubtStatusVal: "Doubt Raised" },
    { id: 2, doubtStatusVal: "Doubt Owned" },
    { id: 3, doubtStatusVal: "Doubt Solved" }
  ];

  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.mylang = window.localStorage.getItem("language");
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang("en");
    }
    this.getAssignSubject();
    this.ask_doubts = "Ask Doubts";
  }

  ngOnInit() {
    this.globalObj.DownloadRootURL = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME;
    this.getFromSet();
    this.getAutoLoadAfterEvent();

    this.sessionId = window.localStorage.getItem("session_id");
    this.schoolId = window.localStorage.getItem("school_id");
    this.sectionId = window.localStorage.getItem("student_section_id");
    // this.globalObj.doubtsStatusData = this.doubtsStatus;
  }

  private newMethod(): string {
    return "app-student";
  }

  toggle() {
    this.show_add_doubt = !this.show_add_doubt;

    this.show_add_doubt = true;
    this.show_list_doubt = false;
    this.show_view_doubt = false;
    this.show_reset = true;
    this.upload_file_set = '';
    // CHANGE THE TEXT OF THE BUTTON.
    //  if (this.show_add_doubt) this.button_name = "Hide Add";
    // else this.button_name = " Add";
  }

  getFromSet() {
    this.doubtsForm = new FormGroup({
      id: new FormControl(""),
      title: new FormControl("", Validators.required),
      subjectId: new FormControl("", Validators.required),
      topic: new FormControl("", Validators.required),
      enter_doubts: new FormControl("", Validators.required),
      upload_file: new FormControl(""),
      upload_file_old: new FormControl(""),
      sessionId: new FormControl(""),
      schoolId: new FormControl(""),
      sectionId: new FormControl("")
    });
  }

  getAutoLoadAfterEvent() {
    this.getDoubtsList(this.Searchparams);
    this.getAssignSubject();
    this.globalObj.doubtsStatus = this.doubtsStatus;

    this.doubtsSearchFormGroup = new FormGroup({
      status_data: new FormControl(""),
      subject_id: new FormControl("")
    });
  }

  getFromClose() {
    this.show_add_doubt = false;
    this.show_view_doubt = false;
    this.show_list_doubt = true;
    this.upload_file_set = '';
    this.ask_doubts = "Ask Doubt";
    this.getFromSet();
    this.getAutoLoadAfterEvent();
  }

  doubtEdit(DoubtId) {
    if (DoubtId) {
      this.show_add_doubt = true;
      this.show_view_doubt = false;
      this.show_list_doubt = false;
      this.show_reset = false;
      this.ask_doubts = "Edit Ask Doubt";

      this.editOrUpadte = 2;
      this.http
        .get(
          this.myService.constant.apiURL +
          "doubts_masters/getdoubtsrow?id=" +
          DoubtId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.doubtData = data.response;
          this.globalObj.doubtViewData = this.doubtData;
          this.upload_file_set = this.doubtData.upload_file;

          this.doubtsForm.patchValue({
            id: this.doubtData.id,
            title: this.doubtData.title,
            subjectId: this.doubtData.subjectId,
            topic: this.doubtData.topic,
            enter_doubts: this.doubtData.enter_doubts,
            upload_file_old: this.doubtData.upload_file
          });
        });
    }
  }

  doubtView(DoubtId) {
    if (DoubtId) {
      this.show_view_doubt = true;
      this.show_add_doubt = false;
      this.show_list_doubt = false;
      this.ask_doubts = "View/Ask your Doubt";

      this.editOrUpadte = 1;
      this.http
        .get(
          this.myService.constant.apiURL +
          "doubts_masters/getdoubtsrow?id=" +
          DoubtId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.globalObj.doubtViewData = data.response;
        });
    }
  }

  onAccept(file: any) {

  }

  onSubmitSearch(formValue) {
    this.userId = window.localStorage.getItem("user_id");

    var formData = new FormData();
    this.params = {
      userId: this.userId,
      status_data: formValue.status_data,
      subject_id: formValue.subject_id
    };

    this.getDoubtsList(this.params);
  }

  onSubmit(formValue) {
    var formData = new FormData();
    // var uploadFile = formValue.upload_file;



    this.userId = window.localStorage.getItem("user_id");

    formData.append("userId", this.userId);
    formData.append("title", formValue.title);
    formData.append("subjectId", formValue.subjectId);
    formData.append("topic", formValue.topic);
    formData.append("enter_doubts", formValue.enter_doubts);
    formData.append("sessionId", this.sessionId);
    formData.append("schoolId", this.schoolId);
    formData.append("sectionId", this.sectionId);

    if (formValue.id > 0) {
      formData.append("id", formValue.id);
      formData.append("userId", this.userId);
      formData.append("title", formValue.title);
      formData.append("subjectId", formValue.subjectId);
      formData.append("topic", formValue.topic);
      formData.append("enter_doubts", formValue.enter_doubts);
      formData.append("upload_file_old", formValue.upload_file_old);
      formData.append("sessionId", this.sessionId);
      formData.append("schoolId", this.schoolId);
      formData.append("sectionId", this.sectionId);
    }

    let uploadArr = formValue.upload_file;
    for (var i in uploadArr) {
      formData.append(i, uploadArr[i].file);
    }


    // if (formValue.upload_file != "" || formValue.upload_file != undefined) {
    //   if (uploadFile.length > 0) {
    //     alert("OH NO");
    //     for (var i in uploadFile) {
    //       formData.append(i, uploadFile[i].file);
    //     }
    //   }
    // }

    this.http
      .post(this.myService.constant.apiURL + "doubts_masters/adddoubts", formData).subscribe(data => {
        const details: any = data;
        if (details.status == "200") {
          this.show_add_doubt = false;
          this.show_view_doubt = false;

          this.successMessage.message = details.message;
        } else {
          this.errorMessage.message = details.message;
        }
        this.getFromSet();
        this.getAutoLoadAfterEvent();
        this.show_list_doubt = true;
      });
  }

  onSubmit_old(formValue) {
    this.userId = window.localStorage.getItem("user_id");

    this.params = {
      userId: this.userId,
      title: formValue.title,
      subjectId: 3,
      topic: formValue.topic,
      upload_file: formValue.upload_file,
      enter_doubts: formValue.enter_doubts
    };

    if (formValue.id !== "") {
      this.params = {
        userId: this.userId,
        title: formValue.title,
        //        subjectId: formValue.subjectId,
        subjectId: 3,
        topic: formValue.topic,
        upload_file: formValue.upload_file,
        enter_doubts: formValue.enter_doubts,
        id: formValue.id
      };
    }

    const url = this.myService.constant.apiURL + "doubts_masters/adddoubts";
    this.http.post(url, this.params).subscribe(details => {
      const data: any = details;
      const status = data.response.status;
      this.globalObj.message = "Save successfully";
      this.getFromSet();
      this.getDoubtsList(this.Searchparams);
    });
  }

  getDoubtsList(Searchparams) {
    this.userId = window.localStorage.getItem("user_id");

    var statusData = Searchparams.status_data;
    var subjectId = Searchparams.subject_id;

    // var paramsSet =Searchparams;
    //

    /***/
    const url =
      this.myService.constant.apiURL +
      "doubts_masters/getalldoubts?userId=" +
      this.userId +
      "&status=" +
      statusData +
      "&subjectId=" +
      subjectId;

    // const url = this.myService.constant.apiURL + "doubts_masters/getalldoubts";
    //,paramsSet
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.doubtsList = data.response;
      // if (this.durationList.length == 0) {
      //     this.globalObj.message = 'No record found';
      // }
    });
  }

  getAssignSubject() {
    this.sessionId = window.localStorage.getItem("session_id");
    this.userId = window.localStorage.getItem("user_id");
    this.sectionId = window.localStorage.getItem("student_section_id");
    this.token = window.localStorage.getItem("token");

    this.params = {
      session_id: this.sessionId,
      section_id: this.sectionId,
      user_id: this.userId,
      token: this.token
    };

    const url =
      this.myService.constant.apiURL + "user_subjects/assignedsubjects";
    this.http.post(url, this.params).subscribe(response => {
      const data: any = response;
      this.globalObj.assignSubjectData = data.response.assigned_subjects;
    });
  }
}
