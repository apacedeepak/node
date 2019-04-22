import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-expense-master',
  templateUrl: './expense-master.component.html',
  styleUrls: ['./expense-master.component.css']
})
export class ExpenseMasterComponent implements OnInit {
  categoryMasterForm: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public expense_master_title: any = "Expense Master";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public expenseMasterData: any = "";
  public serverurl: any = ""; 
  public expenseMasterList:any=[];
  ngOnInit() {
    this.categoryMasterForm = new FormGroup({
      id: new FormControl(""),
      // expense_for: new FormControl("", Validators.required),
      expense_category: new FormControl("", Validators.required),
      expense_name: new FormControl("", Validators.required)
    });
    this.getAutoLoadAfterEvent();    
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    //this.getExpenseMasterList();
    //this.getCategoryMasterList();
    //this.getExpenseForList();
    this.serverurl = this.myService.commonUrl + 'schoolerp/';
  }
  onAccept(file: any) {
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.getExpenseMasterList();
    this.getCategoryMasterList();
    this.getExpenseForList();
  }
  toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
  }
  onSubmit(formValue) {
    var saveparams = {
      "user_id":window.localStorage.getItem("user_id"),
      "expense_for":'1',
      "expense_category":formValue.expense_category,
      "expense_name":formValue.expense_name,
      "id":formValue.id
    }
    this.http
      .post(
        this.myService.constant.apiURL + "expense_masters/addexpensemaster",
        saveparams
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
        this.expense_master_title = "Expense Master";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
  }
  getFromSet() {
    this.categoryMasterForm = new FormGroup({     
      id: new FormControl(""),
      // expense_for: new FormControl(""),
      expense_category: new FormControl(""),
      expense_name: new FormControl("")
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.expense_master_title = "Expense Master";
    this.getFromSet();
  }
  getExpenseMasterList() {
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "expense_masters/getallexpensemaster?userId=" + this.userId;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.expenseMasterList = data.response;
    });
  }
  expenseMasterEdit(expenseMasterId) {
    if (expenseMasterId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.expense_master_title = "Edit Expense Master";
      this.editOrUpadte = 1;
      this.http
        .get(
          this.myService.constant.apiURL +
          "expense_masters/getexpensemaster?id=" +
          expenseMasterId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.expenseMasterData = data.response;         
          this.categoryMasterForm.patchValue({
            id: this.expenseMasterData.id,
            // expense_for: this.expenseMasterData.expense_for,
            expense_category: this.expenseMasterData.expense_category,
            expense_name: this.expenseMasterData.expense_name
          });
        });
    }
  }
  deleteExpenseMaster(expenseMasterId) {
    if (expenseMasterId) {
      this.saveparams = {
        status: 0,
        id: expenseMasterId
      };
      this.http
        .post(
          this.myService.constant.apiURL + "expense_masters/deleteexpensemaster",
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
          this.expense_master_title = "Expense Master";
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
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
}
