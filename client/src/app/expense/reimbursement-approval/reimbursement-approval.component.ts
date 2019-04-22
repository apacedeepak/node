import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-reimbursement-approval',
  templateUrl: './reimbursement-approval.component.html',
  styleUrls: ['./reimbursement-approval.component.css']
})
export class ReimbursementApprovalComponent implements OnInit {
  fileExpenseSearchForm: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public reimbursement_approval_title: any = "Approve Reimbursement";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public expenseRequestData: any = "";
  public serverurl: any = "";
  public FormCenterSearch: any = "0";;
  public FormApprovalStatus: any = "0";
  private Searchparams: any = { "center_id": 0, "approval_status": 0,"from_date":"","to_date":""};
  public approvalSearchStatus = [
    { "id": 1, "status_name": 'Pending' }, { "id": 2, "status_name": 'Approved' }, { "id": 3, "status_name": 'Reject' }
  ];
  public expDate: any = "";
  public currentDate: any;
  public fileExpenseRequestList:any=[];
  public currentPage: number = 1;
  public itemsPerPage: number = 20;
  ngOnInit() {
    this.globalObj.totalamount = 0;
    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    this.serverurl = this.myService.commonUrl + 'schoolerp/';
  }
  onAccept(file: any) {
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.onSearchSubmit(this.Searchparams);
    this.getUserCenterList();

    this.fileExpenseSearchForm = new FormGroup({
      from_date: new FormControl(""),
      to_date: new FormControl(""),
      center_id: new FormControl("0"),
      approval_status: new FormControl("0")
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
  toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
  }
  getFromSet() {
    this.fileExpenseSearchForm = new FormGroup({
      from_date: new FormControl(""),
      to_date: new FormControl(""),
      center_id: new FormControl("0"),
      approval_status: new FormControl("0")
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.reimbursement_approval_title = "Approve Reimbursement";
    this.getFromSet();
  }
  onSearchSubmit(Searchparams) {
    this.userId = window.localStorage.getItem("user_id");
    var center_id = Searchparams.center_id;
    var approval_status = Searchparams.approval_status;
    var from_date = Searchparams.from_date;
    var to_date = Searchparams.to_date; 
    var fromDate="";
    var toDate="";
    if(from_date !=""){
      var fromYear = from_date.year;
      var fromMonth = from_date.month;
      var fromMonthStr = (fromMonth>9)?fromMonth: '0'+ fromMonth;
      var tempFromDate = from_date.day;
      var fromDateStr = (tempFromDate>9)?tempFromDate: '0'+tempFromDate;
      fromDate = fromYear +'-'+fromMonthStr+'-'+fromDateStr;              
    }
    if(to_date !=""){
      var toYear = to_date.year;
      var toMonth = to_date.month;
      var toMonthStr = (toMonth>9)?toMonth: '0'+ toMonth;
      var tempTodate = to_date.day;
      var toDateStr = (tempTodate>9)?tempTodate: '0'+tempTodate;
      toDate = toYear +'-'+toMonthStr+'-'+toDateStr; 
    }
    var searchParams = {
      "user_id":this.userId,
      "center_id": center_id,
      "approval_status": approval_status,
      "from_date":fromDate,
      "to_date":toDate,
      "expense_type":2
    };
    this.http
      .post(
        this.myService.constant.apiURL + "expense_requests/getapprovalexpenselist",
        searchParams
      ).subscribe(response => {
      const data: any = response;
      this.fileExpenseRequestList = data.response;
    });
  }
  updateApprovalStatus(expenseRequestId, approvalStatus) {
    if (expenseRequestId) {
      this.saveparams = {
        approval_status: approvalStatus,
        id: expenseRequestId
      };
      this.http
        .post(
          this.myService.constant.apiURL + "expense_requests/updateexpenseapproval",
          this.saveparams
        )
        .subscribe(data => {
          const details: any = data;
          if (details.response.status == "200") {
            this.successMessage.message = details.response.message;
            setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
            this.show_add_item_master = false;
            this.show_item_master_list = true;
          } else {
            this.errorMessage.message = details.response.message;
            setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
          }
          this.reimbursement_approval_title = "Approve Reimbursement";
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
  }

}
