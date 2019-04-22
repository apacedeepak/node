import { Component, OnInit } from '@angular/core';
import { NgForm} from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-raiserequest',
  templateUrl: './raiserequest.component.html',
  styleUrls: ['./raiserequest.component.css']
})
export class RaiserequestComponent implements OnInit {
  itemMasterForm: FormGroup;
  raiseRequestSearchFormGroup: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public raise_master_title: any = "Raise Request";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public itemmasterData: any = "";  
  public serverurl:any="";
  public categoryItemList:any="";
  private Searchparams: any = "test";
  ngOnInit() {
    //console.log(window.localStorage);
    this.itemMasterForm = new FormGroup({
      id: new FormControl(""),
      inv_category_master_id: new FormControl("", Validators.required),
      item_id: new FormControl("", Validators.required),      
      item_unit_price: new FormControl("",[Validators.pattern("^[0-9]*$")]),
      item_quantity: new FormControl("",[Validators.pattern("^[0-9]*$")]),
      item_total_price: new FormControl("",[Validators.pattern("^[0-9]*$")]),
      item_description: new FormControl(""),
      item_image_upload: new FormControl("")
    });
    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    this.getItemCategoryList();   
    this.getRaiseRequestList(this.Searchparams);
    this.serverurl = this.myService.commonUrl+'schoolerp/';
  }
  onAccept(file:any){
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.getItemCategoryList();    
    this.getRaiseRequestList(this.Searchparams);
    this.raiseRequestSearchFormGroup = new FormGroup({
      request_id: new FormControl(""),
      center_id: new FormControl(""),
      item_id: new FormControl("")
    });
  }
  getItemCategoryList() {
    this.userId = window.localStorage.getItem("user_id");
    this.params = {
      user_id: this.userId
    };
    const url = this.myService.constant.apiURL + "inv_category_masters/itemcategorylist";
    this.http.post(url, this.params).subscribe(response => {
      const data: any = response;
      this.globalObj.itemCategoryMasterData = data.item_category_list;
    });
  }
  getCategoryItem(itemCategoryId){
    var params = {'item_category_id': itemCategoryId};
    this.http.post(this.myService.constant.apiURL+"inv_item_masters/getcategoryitem", params).subscribe(data => {
    const detail:any = data;
    this.globalObj.categoryItemList = detail.response;
    });
  }
  calTotalPrice(qty,itemprice){
    this.globalObj.totalItemPrice = qty * itemprice;  
  }
  getItemDetail(itemMasterId){
    this.http
    .get(
      this.myService.constant.apiURL +
      "inv_item_masters/getitemmaster?id=" +
      itemMasterId
    )
    .subscribe(detail => {
      const data: any = detail;
      this.itemmasterData = data.response;
      var item_image_upload=this.itemmasterData.item_image;          
      this.itemMasterForm.patchValue({        
        item_unit_price: this.itemmasterData.price               
      });
    });
  }
  toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
  }
  onSubmit(formValue) {
    var formData = new FormData();
    this.calTotalPrice(formValue.item_quantity,formValue.item_unit_price);
    var item_image_upload = formValue.item_image_upload;
    formData.append("user_id", window.localStorage.getItem("user_id"));
    formData.append("inv_category_master_id", formValue.inv_category_master_id);
    formData.append("item_id", formValue.item_id);    
    formData.append("price", formValue.item_unit_price);
    formData.append("item_quantity", formValue.item_quantity);
    formData.append("item_total_price", this.globalObj.totalItemPrice);
    formData.append("center_id", window.localStorage.getItem("school_id"));
    formData.append("description", formValue.item_description);
    formData.append("id", formValue.id);    
    for (var i in item_image_upload) {
       formData.append(i, item_image_upload[i].file);
    } 
    this.http
      .post(
        this.myService.constant.apiURL + "inv_raise_requests/raiserequest",
        formData
      )
      .subscribe(data => {
        const details: any = data;
        if (details.status == "200") {
          this.successMessage.message = details.message;
          this.show_add_item_master = false;
          this.show_item_master_list = true;
        } else {
          this.errorMessage.message = details.message;
        }
        this.raise_master_title = "Approval of Request";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
  }
  getFromSet() {
    this.itemMasterForm = new FormGroup({
      id: new FormControl(""),
      inv_category_master_id: new FormControl("", Validators.required),
      item_id: new FormControl("", Validators.required),
      item_unit: new FormControl("", Validators.required),
      item_unit_price: new FormControl("", Validators.required),
      item_quantity: new FormControl("", Validators.required),
      item_total_price: new FormControl("", Validators.required),
      item_description: new FormControl("", Validators.required),
      item_image_upload: new FormControl("")
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.raise_master_title = "Approval of Request";
    this.getFromSet();
  }
  getRaiseRequestList(Searchparams) {
    this.userId = window.localStorage.getItem("user_id");
    var raiseRequestId = Searchparams.raise_request_id;
    var centerId = Searchparams.center_id;
    var itemId = Searchparams.item_id;    
    /***/
    const url =
      this.myService.constant.apiURL +
      "inv_raise_requests/getallraiserequest?userId=" +
      this.userId +
      "&raiseRequestId=" +
      raiseRequestId +
      "&centerId=" +
      centerId +
      "&itemId=" +
      itemId;
    //console.log(url + "***" + JSON.stringify(Searchparams));
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.itemRaiseRequestList = data.response;
    });
  }
  editraiseRequest(raiseRequestId) {
    if (raiseRequestId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.raise_master_title = "Edit Raise Request";
      this.editOrUpadte = 1;
      this.http
        .get(
          this.myService.constant.apiURL +
          "inv_raise_requests/getraiserequestdetail?id=" +
          raiseRequestId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.itemmasterData = data.response;
          this.getCategoryItem(this.itemmasterData.inv_category_master_id);
          this.itemMasterForm.patchValue({
            id: this.itemmasterData.id,
            inv_category_master_id: this.itemmasterData.inv_category_master_id,
            item_id: this.itemmasterData.inv_item_master_id,
            item_unit: this.itemmasterData.unit_id,
            item_unit_price: this.itemmasterData.price,
            item_quantity: this.itemmasterData.quantity,
            item_total_price: this.itemmasterData.total_price,
            item_description:this.itemmasterData.description
            //item_image_upload:this.itemmasterData.item_image          
          });
        });
    }
  }
  deleteRaiserequest(raiseRequestId) {
    if (raiseRequestId) {
      this.saveparams = {        
        status: 0,
        id:raiseRequestId
      };              
      this.http
        .post(
          this.myService.constant.apiURL + "inv_raise_requests/deleteraiserequest",
          this.saveparams
        )
        .subscribe(data => {
          const details: any = data;
          if (details.response.status == "200") {
            this.successMessage.message = details.response.message;
            this.show_add_item_master = false;
            this.show_item_master_list = true;
          } else {
            this.errorMessage.message = details.response.message;
          }
          this.raise_master_title = "Approval of Request";
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
  }

}
