import { Component, OnInit } from '@angular/core';
import { NgForm} from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { OnChange } from 'ngx-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-addfeedbackmaster',
  templateUrl: './addfeedbackmaster.component.html',
  styleUrls: ['./addfeedbackmaster.component.css']
})
export class AddfeedbackmasterComponent implements OnInit {
  addFeedBackForm: FormGroup;
  searchFeedbackMasterForm: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public feedback_master_title: any = "Feedback Master";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public expenseRequestData: any = "";  
  public serverurl:any="";  
  public FormCenterSearch: any = "0";;  
  public FormApprovalStatus: any = "0";
  private Searchparams: any = {"remark_category":''};  
  public remarkCategoryJsonArr = [{"category_name":"positive"},{"category_name":"negative"}];
  public expDate: any="";
  public currentDate: any;
  public feedbackMasterList:any=[];
  public currentPage: number = 1;
  public itemsPerPage: number = 20;

  ngOnInit() {
    this.globalObj.totalamount=0;
    this.addFeedBackForm = new FormGroup({
      id: new FormControl(""),
      remark_name: new FormControl("", Validators.required),      
      remark_category: new FormControl("",Validators.required),
      remark_icon:new FormControl("")    
    });
    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    this.serverurl = this.myService.commonUrl+'schoolerp';
  }
  onAccept(file:any){
    //console.log(file);
  }
  getAutoLoadAfterEvent() {    
    this.onSearchSubmit(this.Searchparams);   
    this.searchFeedbackMasterForm = new FormGroup({
      remark_category: new FormControl("")
    });
  }
 
toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
  }
  onSubmit(formValue) {
    var formData = new FormData();  
    var remark_icon = formValue.remark_icon;      
    formData.append("id", formValue.id);  
    formData.append("added_by", window.localStorage.getItem("user_id"));
    formData.append("school_id", window.localStorage.getItem("school_id"));    
    formData.append("name", formValue.remark_name);    
    formData.append("remarks_category", formValue.remark_category);    
    for (var i in remark_icon) {
       formData.append(i, remark_icon[i].file);
    } 
    this.http
      .post(
        this.myService.constant.apiURL + "feedback_masters/createfeedbackmaster",
        formData
      )
      .subscribe(data => {
        const details: any = data;
        if (details.status == "200") {
          this.successMessage.message = "Feedback master added sucessfully";
          setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
          this.show_add_item_master = false;
          this.show_item_master_list = true;
        } else {
          this.errorMessage.message = "Feedback master added failed";
          setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
        }
        this.feedback_master_title = "Feedback Master";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
  
  }
  calTotalAmount(basic_amt,gst_amt){
    if(parseInt(basic_amt)>0 && parseInt(gst_amt)>0){
      this.globalObj.totalamount = parseInt(basic_amt) + parseInt(gst_amt);  
    }
  }
  getFromSet() {
    this.addFeedBackForm = new FormGroup({
      id: new FormControl(""),
      remark_name: new FormControl("", Validators.required),      
      remark_category: new FormControl("",Validators.required),
      remark_icon:new FormControl("") 
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.feedback_master_title = "Feedback Master";
    this.getFromSet();
  }

  onSearchSubmit(Searchparams) {
    this.userId = window.localStorage.getItem("user_id");
    var remark_category = Searchparams.remark_category;   
    const url = this.myService.constant.apiURL + "feedback_masters/getallremarks";
    this.http
        .get(
          url
        ).subscribe(response => {
          const data: any = response;
          this.feedbackMasterList = data.response;
        });
  }

  editFeedbackMaster(feedbackMasterId) {
    if (feedbackMasterId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.feedback_master_title = "Edit Feedback Master";
      this.editOrUpadte = 1;
      this.saveparams = {        
        id:feedbackMasterId
      };              
      this.http
        .post(
          this.myService.constant.apiURL + "feedback_masters/getremarkbyid",
          this.saveparams
        )
        .subscribe(detail => {
          const data: any = detail;
          this.expenseRequestData = data.response;                       
          this.addFeedBackForm.patchValue({
            id: this.expenseRequestData.id,
            remark_name: this.expenseRequestData.remarks_name,            
            remark_category: this.expenseRequestData.remarks_category         
          });  

        });    
    }
  }
  deleteFeedbackMaster(expenseRequestId) {
    if (expenseRequestId) {
      this.saveparams = {        
        status: 0,
        id:expenseRequestId
      };              
      this.http
        .post(
          this.myService.constant.apiURL + "feedback_masters/deletefeedback",
          this.saveparams
        )
        .subscribe(data => {
          const details: any = data;
          if (details.responseCode == "200") {
            this.successMessage.message = details.responseMessage;
            setTimeout(() =>{ this.successMessage.message = ''; }, 3000);
            this.show_add_item_master = false;
            this.show_item_master_list = true;
          } else {
            this.errorMessage.message = details.responseMessage;
            setTimeout(() =>{ this.errorMessage.message = ''; }, 3000);
          }
          this.feedback_master_title = "Feedback Master";          
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
  }
}
