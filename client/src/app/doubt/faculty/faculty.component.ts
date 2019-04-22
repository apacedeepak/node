import { Component, OnInit, ɵConsole } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { BackendApiService } from "./../../services/backend-api.service";
import { resolve } from "dns";
import { reject } from "q";

@Component({
  selector: "app-faculty",
  templateUrl: "./faculty.component.html",
  styleUrls: ["./faculty.component.css"]
})
export class FacultyComponent implements OnInit {
  public doubts_solition: any = {};
  public mylang: any = "";

  public FormSubjectSearch: any = "0";
  public FormStatusSearch: any = "0";

  public globalObj: any = {};
  public errorMessage: any = {};
  public successMessage: any = {};

  public sessionId: any = "";
  public schoolId: any = "";
  public userId: any = "";
  public sectionId: any = "";
  public token: any = "";
  public subjectDataValue: any;
  public subjectId: any = {};
  modalopen: any = false
  public show_add_doubt: boolean = false;
  public show_view_doubt: boolean = false;
  public show_list_doubt: boolean = true;
  public editOrUpadte: any = "";

  public params: any = {};
  public askDoubtsSolution: any = "Doubts and Queries";

  public doubtsStatus: Array<Object> = [
    { id: 1, doubtStatusVal: "Doubt Raised" },
    { id: 2, doubtStatusVal: "Doubt Owned" },
    { id: 3, doubtStatusVal: "Doubt Solved" }
  ];

  public doubtsSearchFormGroup: any = "";
  public Searchparams: any = "";

  public doubtsSolutionFormGroup: FormGroup;

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
    this.askDoubtsSolution = "Doubts and Queries";
    this.globalObj.DownloadRootURL = this.myService.commonUrl1 + this.myService.constant.PROJECT_NAME;

  }

  ngOnInit() {
    this.subjectDataValue = "0";
    this.getAutoLoadAfterEvent();
    this.askDoubtsSolution = "Doubts and Queries";
  }

  private newMethod(): string {
    return "app-faculty";
  }

  getAutoLoadAfterEvent() {
    this.getAssignSubject()
      .then(response => {
        this.getDoubtsQuriesList(this.Searchparams);

        this.globalObj.doubtsStatus = this.doubtsStatus;
      })
      .catch(error => { });

    this.doubtsSearchFormGroup = new FormGroup({
      status_data: new FormControl(""),
      subject_id: new FormControl("")
    });

    this.doubtsSolutionFormGroup = new FormGroup({
      id: new FormControl(""),
      doubtsId: new FormControl(""),
      solution: new FormControl("", Validators.required),
      upload_file: new FormControl(""),
      sessionId: new FormControl(""),
      schoolId: new FormControl("")

    });
  }
  getAssignSubject() {
    return new Promise((resolve, reject) => {
      this.sessionId = window.localStorage.getItem("session_id");
      this.schoolId = window.localStorage.getItem("school_id");
      this.userId = window.localStorage.getItem("user_id");
      this.token = window.localStorage.getItem("token");

      this.params = {
        session_id: this.sessionId,
        user_id: this.userId,
        token: this.token
      };

      const url =
        this.myService.constant.apiURL +
        "user_subjects/assignedsubjectsteacher";
      this.http.post(url, this.params).subscribe(response => {
        const data: any = response;
        this.globalObj.assignSubjectData = data.response.assigned_subjects;

        var subjectData = new Array();
        var numVal = this.globalObj.assignSubjectData;
        numVal.forEach(function (subjectVal) {
          subjectData.push(subjectVal.subject_id);
        });
        this.subjectDataValue = subjectData;
        resolve("success");
      });
    });
  }

  onSubmitSearch(formValue) {
    this.userId = window.localStorage.getItem("user_id");
    var formData = new FormData();
    this.params = {
      userId: this.userId,
      status_data: formValue.status_data,
      subject_id: formValue.subject_id
    };
    this.getDoubtsQuriesList(this.params);
  }

  getDoubtsQuriesList(Searchparams) {
    this.userId = window.localStorage.getItem("user_id");

    if (
      Searchparams.status_data != undefined &&
      Searchparams.status_data != 0
    ) {
      var statusData = Searchparams.status_data;
    } else {
      statusData = "0";
    }

    if (Searchparams.subject_id != undefined && Searchparams.subject_id != 0) {
      var subjectDataValueSet = Searchparams.subject_id;
    } else {
      subjectDataValueSet = this.subjectDataValue;
    }
    const url = this.myService.constant.apiURL + "doubts_masters/getalldoubtsfaculty?facultyuserId=" + this.userId + "&subjectId=" + subjectDataValueSet + "&status=" + statusData + "&schoolId=" + this.schoolId;

    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.doubtsList = data.response;
    });
  }

  doubtView(DoubtId) {
    this.modalopen = true;
    this.userId = window.localStorage.getItem("user_id");
    this.globalObj.facultyUserId = this.userId;
    if (DoubtId) {
      // this.show_view_doubt = true;
      // this.show_add_doubt = false;
      // this.show_list_doubt = false;
      this.askDoubtsSolution = "View Doubts and Queries";

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
          this.globalObj.sudentDoubtsId = this.globalObj.doubtViewData.id;
        });
      this.doubtsSolutionFormGroup.patchValue({
        doubtsId: DoubtId
      });
    }
  }

  getOwnFaculty(DoubtId, facultyId) {
    if (confirm("Are you sure to Own")) {
      if (DoubtId !== "") {
        let today = new Date();
        this.params = {
          id: DoubtId,
          status: "Doubt Owned",
          facultyuserId: facultyId,
          faculty_own_date: today
        };
      }

      const url =
        this.myService.constant.apiURL + "doubts_masters/updatedoubts";
      this.http.post(url, this.params).subscribe(details => {
        const data: any = details;
        const status = data.response.status;
        this.globalObj.message = "Update successfully";

        this.show_view_doubt = false;
        this.show_list_doubt = true;
        this.askDoubtsSolution = "Doubts and Queries";
        var Searchparams = "";
        this.getDoubtsQuriesList(Searchparams);
        window.location.reload();
      });
    }
  }

  setStatusUpdate(DoubtId) {
    if (DoubtId !== "") {
      this.params = {
        id: DoubtId,
        status: "Doubt Solved"
      };
    }
    const url = this.myService.constant.apiURL + "doubts_masters/updatedoubts";
    this.http.post(url, this.params).subscribe(details => {
      const data: any = details;
    });
  }

  getFromClose() {
    this.show_add_doubt = false;
    this.show_view_doubt = false;
    this.show_list_doubt = true;
    //this.ask_doubts = "Ask Doubt";
    //this.getFromSet();
    this.getAutoLoadAfterEvent();
  }
  onSubmitSolution(formValue) {
    console.log(formValue)

    var formData = new FormData();
    var uploadFile = formValue.upload_file;

    this.userId = window.localStorage.getItem("user_id");

    formData.append("userId", this.userId);
    formData.append("doubtsId", formValue.doubtsId);
    formData.append("solution", formValue.solution);
    formData.append("schoolId", this.schoolId);
    formData.append("sessionId", this.sessionId);

    if (uploadFile.length != 0) {
      for (var i in uploadFile) {
        formData.append(i, uploadFile[i].file);
      }
    }

    this.http
      .post(
        this.myService.constant.apiURL + "doubts_solutions/addsolution",
        formData
      )
      .subscribe(data => {
        const details: any = data;
        if (details.status == "200") {

          this.show_view_doubt = false;
          this.setStatusUpdate(formValue.doubtsId);
          this.successMessage.message = details.message;
        } else {
          this.errorMessage.message = details.message;
        }
        // this.getFromSet();
        this.getAutoLoadAfterEvent();
        this.show_list_doubt = true;
        window.location.reload();
      });
  }
}
