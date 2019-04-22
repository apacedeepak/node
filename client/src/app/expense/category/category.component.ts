import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categoryMasterForm: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public category_master_title: any = "Category Master";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public categoryMasterData: any = "";
  public serverurl: any = "";
  public categoryMasterList:any=[];
  ngOnInit() {
    this.categoryMasterForm = new FormGroup({
      id: new FormControl(""),
      category_name: new FormControl("", Validators.required),
      category_for: new FormControl("", Validators.required)
    });
    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    this.getCategoryMasterList();
    this.serverurl = this.myService.commonUrl + 'schoolerp/';
  }
  onAccept(file: any) {
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.getCategoryMasterList();
  }
  toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
    this.category_master_title = "Add Expense Category";    
  }
  onSubmit(formValue) {
    var saveparams = {
      "user_id":window.localStorage.getItem("user_id"),
      "category_name":formValue.category_name,
      "category_for":formValue.category_for,
      "id":formValue.id
    }
    this.http
      .post(
        this.myService.constant.apiURL + "expense_category_masters/addcategorymaster",
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
        this.category_master_title = "category Master";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
  }
  getFromSet() {
    this.categoryMasterForm = new FormGroup({
      id: new FormControl(""),
      category_name: new FormControl("", Validators.required),
      category_for: new FormControl("", Validators.required)
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.category_master_title = "Category Master";
    this.getFromSet();
  }
  getCategoryMasterList() {
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "expense_category_masters/getallcategorymaster?userId=" + this.userId;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.categoryMasterList = data.response;
    });
  }
  categoryMasterEdit(categoryMasterId) {
    if (categoryMasterId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.category_master_title = "Edit Category Master";
      this.editOrUpadte = 1;
      this.http
        .get(
          this.myService.constant.apiURL +
          "expense_category_masters/getcategorymaster?id=" +
          categoryMasterId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.categoryMasterData = data.response;         
          this.categoryMasterForm.patchValue({
            id: this.categoryMasterData.id,
            category_name: this.categoryMasterData.category_name,
            category_for: this.categoryMasterData.category_for
          });
        });
    }
  }
  deleteCategoryMaster(categoryMasterId) {
    if (categoryMasterId) {
      this.saveparams = {
        status: 0,
        id: categoryMasterId
      };
      this.http
        .post(
          this.myService.constant.apiURL + "expense_category_masters/deletecategorymasterdata",
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
          this.category_master_title = "Item Master";
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
  }

}
