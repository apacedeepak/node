import { Component, OnInit } from '@angular/core';
import { NgForm} from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit {
  fileExpenseForm: FormGroup;
  fileExpenseSearchForm: FormGroup;
  maxDate:any;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public add_expense_title: any = "File Expense";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public expenseRequestData: any = "";  
  public serverurl:any="";  
  public FormCenterSearch: any = "0";;  
  public FormApprovalStatus: any = "0";
  private Searchparams: any = {"center_id":0,"approval_status":0};
  public approvalSearchStatus = [
    {"id":1,"status_name":'Pending'},{"id":2,"status_name":'Approved'}, {"id":3,"status_name":'Reject'}
  ];
  public expDate: any="";
  public currentDate: any;
  public fileExpenseRequestList:any=[];
  ngOnInit() {
    this.globalObj.totalamount=0;
    this.globalObj.currentExpenseAmt=0;
    var enddate = new Date();
    this.maxDate = { year: enddate.getFullYear(), month: enddate.getMonth() + 1, day: enddate.getDate() };
    this.fileExpenseForm = new FormGroup({
      id: new FormControl(""),
      expense_date: new FormControl("",Validators.required),
      expense_for: new FormControl("1", Validators.required),
      expense_category: new FormControl("", Validators.required),      
      expense_name: new FormControl("",Validators.required),
      payment_mode: new FormControl("",Validators.required),
      expense_amount: new FormControl("",Validators.required),
      gst_amount: new FormControl("",Validators.required),
      expense_doc:new FormControl("")    
    });
    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    this.serverurl = this.myService.commonUrl+'schoolerp/';
  }
  onAccept(file:any){
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.getCategoryMasterList();
    this.getexpensepaymentmode();  
    this.getExpenseForList();
    this.onSearchSubmit(this.Searchparams);
    this.getUserCenterList();
    this.getCenterSessionExpenseAmount();  
    this.fileExpenseSearchForm = new FormGroup({
      from_date: new FormControl(""),
      to_date: new FormControl(""),
      center_id: new FormControl(""),
      approval_status: new FormControl("")
    });
  }
  getCategoryMasterList() {
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "expense_category_masters/getallcategorymaster?userId=" + this.userId;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.categoryMasterList = data.response;
    });
  }
  getExpenseMasterList(expense_category_id) {   
    const url =
      this.myService.constant.apiURL +
      "expense_masters/getexpensemasterbycategoryid?expense_category_id=" + expense_category_id;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.expenseMasterList = data.response;
    });
  }
  getExpenseForList() {
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "expense_fors/getallexpensefor";
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.expenseForList = data.response;
    });
  }
  getCenterSessionExpenseAmount() {
    this.userId = window.localStorage.getItem("user_id");
    let session_id = window.localStorage.getItem("session_id");
    let center_id = window.localStorage.getItem("school_id");
    this.params = {
      user_id: this.userId,
      center_id:center_id
    };
    const url = this.myService.constant.apiURL + "expense_requests/centerSessionExpenseAmount";
    this.http.post(url, this.params).subscribe(response => {
      const data: any = response;         
      let centersessionexpenseamount = data.response;
      this.globalObj.available_approved_amt=centersessionexpenseamount.available_approved_amt;
    });
  }
  getUserCenterList(){
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
  getexpensepaymentmode() {   
    const url =
      this.myService.constant.apiURL +
      "expense_payment_modes/getexpensepaymentmode";
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.expensemodeList = data.response;
    });
  }
  toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
  }
  onSubmit(formValue) {
    this.calTotalAmount(formValue.expense_amount,formValue.gst_amount);
    var formData = new FormData();  
    var expense_doc = formValue.expense_doc;
   
    let expenseYear = formValue.expense_date.year;
    let expenseMonth = formValue.expense_date.month;
    if (expenseMonth < 10) {
      expenseMonth = '0' + expenseMonth;
    }
    let expenseDay = formValue.expense_date.day;
    if (expenseDay < 10) {
      expenseDay = '0' + expenseDay;
    }
    let set_expense_date = expenseYear + '-' + expenseMonth + '-' + expenseDay;
    let tempTotalAmt=this.globalObj.available_approved_amt;
    if (formValue.id > 0) {
      set_expense_date = (expenseYear) ? set_expense_date : formValue.expense_date;
      tempTotalAmt=parseInt(this.globalObj.available_approved_amt) + parseInt(this.globalObj.currentExpenseAmt);
    }
    
    formData.append("user_id", window.localStorage.getItem("user_id"));
    formData.append("center_id", window.localStorage.getItem("school_id"));
    formData.append("session_id", window.localStorage.getItem("session_id"));
    formData.append("expense_date", set_expense_date);
    formData.append("expense_for", '1');    
    formData.append("expense_category", formValue.expense_category);
    formData.append("expense_name", formValue.expense_name);
    formData.append("payment_mode", formValue.payment_mode);
    formData.append("expense_amount", formValue.expense_amount);
    formData.append("gst_amount", formValue.gst_amount);
    formData.append("total_amount", this.globalObj.totalamount);
    formData.append("expense_type", '1');
    formData.append("id", formValue.id);   
    for (var i in expense_doc) {
       formData.append(i, expense_doc[i].file);
    } 
    if(parseInt(this.globalObj.totalamount) > 10000){
      this.errorMessage.message = "Total Expense is greater than 10000 , Please contact Finance HO";
      setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
    }else if(parseInt(this.globalObj.totalamount) > parseInt(tempTotalAmt)){
      this.errorMessage.message = "Total amount can not be grater than approved amount";
      setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
    }else{
    this.http
      .post(
        this.myService.constant.apiURL + "expense_requests/fileexpenserequest",
        formData
      )
      .subscribe(data => {
        const details: any = data;
        if (details.status == "200") {
          this.successMessage.message = "Expense filled sucessfully";
          setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
          this.show_add_item_master = false;
          this.show_item_master_list = true;
        } else {
          this.errorMessage.message = details.message;
          setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
        }
        this.add_expense_title = "File Expense List";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
    }
  }
  calTotalAmount(basic_amt,gst_amt){
    if(parseInt(basic_amt)>0 && parseInt(gst_amt)>0){
      this.globalObj.totalamount = parseInt(basic_amt) + parseInt(gst_amt);  
    }
  }
  getFromSet() {
    this.globalObj.totalamount=0;
    this.fileExpenseForm = new FormGroup({
      id: new FormControl(""),
      expense_date: new FormControl("",Validators.required),
      expense_for: new FormControl("1", Validators.required),
      expense_category: new FormControl("", Validators.required),      
      expense_name: new FormControl("",Validators.required),
      payment_mode: new FormControl("",Validators.required),
      expense_amount: new FormControl("",Validators.required),
      gst_amount: new FormControl("",Validators.required),
      expense_doc:new FormControl("") 
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.add_expense_title = "File Expense List";
    this.getFromSet();
  }
  onSearchSubmit(Searchparams) {
    this.userId = window.localStorage.getItem("user_id");
    var approval_status = Searchparams.approval_status;
    let center_id = window.localStorage.getItem("school_id");
    var searchparams = {
      "user_id": this.userId,
      "center_id":center_id,
      "approval_status":approval_status,
      "expense_type":1
    };
    const url = this.myService.constant.apiURL + "expense_requests/getserachexpense";
    this.http.post(url,searchparams).subscribe(response => {
      const data: any = response;
      this.fileExpenseRequestList = data.response;
    });
  }
  editExpenseRequest(expenseRequestId) {
    if (expenseRequestId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.add_expense_title = "Edit File Expense";
      this.editOrUpadte = 1;
      this.http
        .get(
          this.myService.constant.apiURL +
          "expense_requests/getfileexpensedetail?id=" +
          expenseRequestId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.expenseRequestData = data.response;    
          this.getExpenseMasterList(this.expenseRequestData.expense_category);     
          let expenseDate = new Date(this.expenseRequestData.expense_date);
          var expYeare = expenseDate.getFullYear();
          var expMonth = expenseDate.getMonth() +1;
          var expMonthStr = (expMonth>9)?expMonth: '0'+ expMonth;
          var tempExpDate = expenseDate.getDate();
          var expDateStr = (tempExpDate>9)?tempExpDate: '0'+tempExpDate;
          let expenseDateStr = expYeare +'-'+expMonthStr+'-'+expDateStr;   
          this.globalObj.totalamount =parseInt(this.expenseRequestData.total_amount);      
          this.globalObj.currentExpenseAmt=parseInt(this.expenseRequestData.total_amount);
          this.fileExpenseForm.patchValue({
            id: this.expenseRequestData.id,
            expense_date: expenseDateStr,
            expense_for: '1',
            expense_category: this.expenseRequestData.expense_category,
            expense_name: this.expenseRequestData.expense_master_id,
            payment_mode: this.expenseRequestData.payment_mode,
            expense_amount: this.expenseRequestData.amount,
            gst_amount:this.expenseRequestData.gst_amount  
          });
          this.expDate = expenseDateStr;
        });
    }
  }
  deleteexpenserequest(expenseRequestId) {
    if (expenseRequestId) {
      this.saveparams = {        
        status: 0,
        id:expenseRequestId
      };              
      this.http
        .post(
          this.myService.constant.apiURL + "expense_requests/deleteexpenserequest",
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
          this.add_expense_title = "File Expense List";
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
  }
}
