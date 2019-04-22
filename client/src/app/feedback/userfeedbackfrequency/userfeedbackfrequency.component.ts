import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-userfeedbackfrequency',
  templateUrl: './userfeedbackfrequency.component.html',
  styleUrls: ['./userfeedbackfrequency.component.css']
})
export class UserfeedbackfrequencyComponent implements OnInit {
  userfeedbackfrequencyForm: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public title: any = "Feedback Frequency";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public userfeedbackfrequencyData: any = "";
  public serverurl: any = "";
  public isEditable:boolean = false; 
  public userfeedbackfrequencyList:any=[];
  ngOnInit() {
    this.userfeedbackfrequencyForm = new FormGroup({
      id: new FormControl(""),
      no_of_days: new FormControl("", Validators.required)
    });
    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    //this.allUserfeedbackfrequencyList();    
    this.serverurl = this.myService.commonUrl + 'schoolerp/';
  }
  onAccept(file: any) {
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.allUserfeedbackfrequencyList();   
  }
  toggle() {
    this.show_add_item_master = !this.show_add_item_master;
    this.show_add_item_master = true;
    this.show_item_master_list = false;
  }
  onSubmit(formValue) {
    var saveparams = {
      "user_id":window.localStorage.getItem("user_id"),
      "center_id":window.localStorage.getItem("school_id"),
      "no_of_days":formValue.no_of_days,
      "id":formValue.id
    }
    this.http
      .post(
        this.myService.constant.apiURL + "user_feedback_frequencies/addUserfeedbackfrequency",
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
        this.title = "Feedback Frequency";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
  }
  getFromSet() {
    this.userfeedbackfrequencyForm = new FormGroup({
      id: new FormControl(""),
      no_of_days: new FormControl("")
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.title = "Feedback Frequency";
    this.getFromSet();
  }
  allUserfeedbackfrequencyList() {    
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "user_feedback_frequencies/getallUserfeedbackfrequency";
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.userfeedbackfrequencyList = data.response;
    });
  }
  userfeedbackfrequencyEdit(UserfeedbackfrequencyId) {
    if (UserfeedbackfrequencyId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.title = "Edit Feedback Frequency";
      this.editOrUpadte = 1;
      this.http
        .get(
          this.myService.constant.apiURL +
          "user_feedback_frequencies/getUserfeedbackfrequency?id=" +
          UserfeedbackfrequencyId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.userfeedbackfrequencyData = data.response;         
          this.userfeedbackfrequencyForm.patchValue({
            id: this.userfeedbackfrequencyData.id,
            no_of_days: this.userfeedbackfrequencyData.no_of_days
          });
        });
    }
  }  
}
