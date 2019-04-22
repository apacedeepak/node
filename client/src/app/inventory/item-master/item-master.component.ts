import { Component, OnInit } from '@angular/core';
import { NgForm} from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
@Component({
  selector: 'app-item-master',
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.css']
})
export class ItemMasterComponent implements OnInit {
  itemMasterForm: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public item_master_title: any = "Item Master";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public itemmasterData: any = "";  
  public serverurl:any="";
  ngOnInit() {
    this.itemMasterForm = new FormGroup({
      id: new FormControl(""),
      category_id: new FormControl("", Validators.required),
      item_name: new FormControl("", Validators.required),
      item_unit: new FormControl("", Validators.required),
      item_unit_price: new FormControl("",[Validators.pattern("^[0-9]*$")]),
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
    this.getItemUnitList();
    this.getItemMasterList();
    this.serverurl = this.myService.commonUrl+'schoolerp/';
  }
  onAccept(file:any){
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.getItemCategoryList();
    this.getItemUnitList();
    this.getItemMasterList();
  }
  getItemCategoryList() {
    this.userId = window.localStorage.getItem("user_id");
    this.params = {
      user_id: this.userId
    };
    const url =
      this.myService.constant.apiURL + "inv_category_masters/itemcategorylist";
    this.http.post(url, this.params).subscribe(response => {
      const data: any = response;
      this.globalObj.itemCategoryMasterData = data.item_category_list;
    });
  }
  getItemUnitList() {
    this.userId = window.localStorage.getItem("user_id");
    this.params = {
      user_id: this.userId
    };
    const url =
      this.myService.constant.apiURL + "inv_item_unit_masters/itemunitlist";
    this.http.post(url, this.params).subscribe(response => {
      const data: any = response;
      this.globalObj.itemUnitMasterData = data.item_unit_list;
    });
  }
  toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
  }
  onSubmit(formValue) {
    var formData = new FormData();
    var item_image_upload = formValue.item_image_upload;
    // this.saveparams = {
    //   user_id: window.localStorage.getItem("user_id"),
    //   inv_category_master_id: formValue.category_id,
    //   item_name: formValue.item_name,
    //   unit_id: formValue.item_unit,
    //   price: formValue.item_unit_price,
    //   description: formValue.item_description
    // };
    // if (formValue.id !== "") {      
    //   this.saveparams.id = formValue.id    
    // }
    // for (var i in item_image_upload) {
    //   formData.append(i, item_image_upload[i].file);
    // } 
    formData.append("user_id", window.localStorage.getItem("user_id"));
    formData.append("inv_category_master_id", formValue.category_id);
    formData.append("item_name", formValue.item_name);
    formData.append("unit_id", formValue.item_unit);
    formData.append("price", formValue.item_unit_price);
    formData.append("description", formValue.item_description);
    formData.append("id", formValue.id);
    for (var i in item_image_upload) {
       formData.append(i, item_image_upload[i].file);
    } 
    this.http
      .post(
        this.myService.constant.apiURL + "inv_item_masters/additemmaster",
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
        this.item_master_title = "Item Master";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
  }
  getFromSet() {
    this.itemMasterForm = new FormGroup({
      id: new FormControl(""),
      category_id: new FormControl("", Validators.required),
      item_name: new FormControl("", Validators.required),
      item_unit: new FormControl("", Validators.required),
      item_unit_price: new FormControl("", Validators.required),
      item_description: new FormControl("", Validators.required),
      item_image_upload: new FormControl("")
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.item_master_title = "Item Master";
    this.getFromSet();
  }
  getItemMasterList() {
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "inv_item_masters/getallitemmaster?userId=" + this.userId;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.globalObj.itemmasterList = data.response;
    });
  }
  itemMasterEdit(itemMasterId) {
    if (itemMasterId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.item_master_title = "Edit Item Master";
      this.editOrUpadte = 1;
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
            id: this.itemmasterData.id,
            category_id: this.itemmasterData.inv_category_master_id,
            item_name: this.itemmasterData.item_name,
            item_unit: this.itemmasterData.unit_id,
            item_unit_price: this.itemmasterData.price,
            item_description:this.itemmasterData.description
          });
        });
    }
  }
  deleteItemMaster(itemMasterId) {
    if (itemMasterId) {
      this.saveparams = {        
        status: 0,
        id:itemMasterId
      };              
      this.http
        .post(
          this.myService.constant.apiURL + "inv_item_masters/deleteitemmasterdata",
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
          this.item_master_title = "Item Master";
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
  }
}
