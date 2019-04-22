import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ExpenseService } from '../services/expense.service';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
@Component({
  selector: 'app-imprest-approval',
  templateUrl: './imprest-approval.component.html',
  styleUrls: ['./imprest-approval.component.css']
})
export class ImprestApprovalComponent implements OnInit {
  public imprestSearchForm: FormGroup;
  public imprestApprovalForm: FormGroup;
  public globalObj: any = {};
  public mylang: any = "";
  public userId: any = "";
  public button_name: any = "Add";
  public imprest_approval_title: any = "Imprest Approval Form";
  public params: any = {};
  public saveparams: any = {};
  public searchPostParams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public imprestRequestData: any = "";
  public serverurl: any = "";
  public FormCenterSearch: any = "0";
  public FormStatusSearch: any = "1";
  public FormApprovalStatus: any = "0";
  public approvalAmountArr: FormArray;
  public approvalStatusArr: FormArray;
  public imprestIdsArr: FormArray;
  private Searchparams: any = { "center_id": 0, "approval_status": 1 };
  public isEditable: boolean = true;
  public imprestRequestList: any = [];
  public approvalSearchStatus = [
    { "id": 1, "status_name": 'Pending' }, { "id": 2, "status_name": 'Approved' }, { "id": 3, "status_name": 'Reject' }
  ];
  ngOnInit() {
    this.imprestSearchForm = new FormGroup({
      center_id: new FormControl(""),
      approval_search_status: new FormControl("")
    });

    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private expenseService: ExpenseService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private http: HttpClient,
  ) {
    this.imprest_approval_title = 'Imprest Approval Form';
    this.mylang = window.localStorage.getItem("language");
    if (this.mylang) {
      translate.setDefaultLang(this.mylang);
    } else {
      translate.setDefaultLang("en");
    }
    //this.allImprestRequestList(this.Searchparams);
    //this.getUserCenterList(); 
    //this.serverurl = this.myService.commonUrl + 'schoolerp/';
  }
  onAccept(file: any) {
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.allImprestRequestList(this.Searchparams);
    this.getUserCenterList();
  }

  onSearchSubmit(formValue) {
    var searchPostParams = {
      "user_id": window.localStorage.getItem("user_id"),
      "approval_status": formValue.approval_search_status,
      "center_id": formValue.center_id
    }
    this.allImprestRequestList(searchPostParams);
  }
  getFromSet() {
    this.imprestSearchForm = new FormGroup({
      center_id: new FormControl(""),
      approval_search_status: new FormControl("")
    });
  }

  getFromClose() {
    this.imprest_approval_title = "Imprest Approval Form";
    this.getFromSet();
  }
  allImprestRequestList(params) {
    if (params.approval_status > 1) {
      this.isEditable = false;
    } else {
      this.isEditable = true;
    }
    this.approvalAmountArr = new FormArray([]);
    this.approvalStatusArr = new FormArray([]);
    this.imprestIdsArr = new FormArray([]);
    this.imprestApprovalForm = this.fb.group({
      approved_amount: this.approvalAmountArr,
      approval_status: this.approvalStatusArr,
      imprest_id: this.imprestIdsArr
    });
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "imprest_requests/getallImprestApproval?userId=" +
      this.userId +
      "&approval_status=" +
      params.approval_status +
      "&center_id=" +
      params.center_id;;
    this.http.get(url).subscribe(responsedata => {
      const data: any = responsedata;
      //console.log(data.response);
      for (let imprestData of data.response) {
        this.imprestIdsArr.push(new FormControl(imprestData.id));
        this.approvalStatusArr.push(new FormControl(imprestData.approved_status));
        this.approvalAmountArr.push(new FormControl(imprestData.approved_amount));
      }
      this.imprestRequestList = data.response;

    });
  }
  getUserCenterList() {
    this.userId = window.localStorage.getItem("user_id");
    this.params = {
      userId: this.userId
    };
    const url = this.myService.constant.apiURL + "user_schools/assignedSchoolListByUserId";
    this.http.post(url, this.params).subscribe(response => {
      const data: any = response;
      this.globalObj.userAssignCenterList = data.response;
    });
  }
  approvalStatusUpdate(postdata) {
    this.userId = window.localStorage.getItem("user_id");
    postdata.user_id = this.userId;
    this.http
      .post(
        this.myService.constant.apiURL + "imprest_requests/imprestapprovalupdate",
        postdata
      )
      .subscribe(data => {
        const details: any = data;
        if (details.response.status == "200") {
          this.successMessage.message = details.response.message;
          setTimeout(() => { this.successMessage.message = ''; }, 3000);
        } else {
          this.errorMessage.message = details.response.message;
          setTimeout(() => { this.errorMessage.message = ''; }, 3000);
        }
        this.imprest_approval_title = "Imprest Approval Form";
        this.allImprestRequestList(this.Searchparams);
      });

  }
  public captureScreen() {
    this.errorMessage.message = '';
    var data = document.getElementById('content');
    html2canvas(data).then(canvas => {
      // Few necessary setting options
      var imgWidth = 208;
      var pageHeight = 295;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      //alert(contentDataURL);
      //console.log(contentDataURL)
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      var position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save('imprest_approval.pdf'); // Generated PDF
    });
  }
}
