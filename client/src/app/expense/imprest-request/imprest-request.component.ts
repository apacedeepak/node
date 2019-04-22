import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Headers, Response } from '@angular/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule, FormArray, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
@Component({
  selector: 'app-imprest-request',
  templateUrl: './imprest-request.component.html',
  styleUrls: ['./imprest-request.component.css']
})
export class ImprestRequestComponent implements OnInit {
  imprestRequestForm: FormGroup;
  public globalObj: any = {};
  public userId: any = "";
  public show_add_item_master: boolean = false;
  public show_item_master_list: boolean = true;
  public button_name: any = "Add";
  public title: any = "Imprest Form";
  public params: any = {};
  public saveparams: any = {};
  public successMessage: any = {};
  public errorMessage: any = {};
  public editOrUpadte: any = "";
  public imprestRequestData: any = "";
  public serverurl: any = "";
  public isEditable:boolean = false; 
  public imprestRequestList:any=[];
  ngOnInit() {
    this.imprestRequestForm = new FormGroup({
      id: new FormControl(""),
      imprest_amount: new FormControl("", Validators.required)
    });
    this.getAutoLoadAfterEvent();
  }
  constructor(
    private myService: BackendApiService,
    private http: HttpClient,
  ) {
    this.allImprestRequestList();    
    this.serverurl = this.myService.commonUrl + 'schoolerp/';
  }
  onAccept(file: any) {
    //console.log(file);
  }
  getAutoLoadAfterEvent() {
    this.allImprestRequestList();   
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
      "session_id":window.localStorage.getItem("session_id"),
      "imprest_amount":formValue.imprest_amount,
      "approved_amount":formValue.imprest_amount,
      "id":formValue.id
    }
    this.http
      .post(
        this.myService.constant.apiURL + "imprest_requests/addImprestrequest",
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
        this.title = "Imprest Form";
        this.getFromSet();
        this.getAutoLoadAfterEvent();
      });
  }
  getFromSet() {
    this.imprestRequestForm = new FormGroup({
      id: new FormControl(""),
      imprest_amount: new FormControl("")
    });
  }

  getFromClose() {
    this.show_add_item_master = false;
    this.show_item_master_list = true;
    this.title = "Imprest Form";
    this.getFromSet();
  }
  allImprestRequestList() {    
    this.userId = window.localStorage.getItem("user_id");
    const url =
      this.myService.constant.apiURL +
      "imprest_requests/getallImprestrequest?userId=" + this.userId;
    this.http.get(url).subscribe(response => {
      const data: any = response;
      this.imprestRequestList = data.response;
    });
  }
  imprestRequestEdit(imprestRequestId) {
    if (imprestRequestId) {
      this.show_add_item_master = true;
      this.show_item_master_list = false;
      this.title = "Edit Imprest Form";
      this.editOrUpadte = 1;
      this.http
        .get(
          this.myService.constant.apiURL +
          "imprest_requests/getImprestrequest?id=" +
          imprestRequestId
        )
        .subscribe(detail => {
          const data: any = detail;
          this.imprestRequestData = data.response;         
          this.imprestRequestForm.patchValue({
            id: this.imprestRequestData.id,
            imprest_amount: this.imprestRequestData.amount
          });
        });
    }
  }
  deleteImprestRequest(imprestRequestId) {
    if (imprestRequestId) {
      this.saveparams = {
        status: 0,
        id: imprestRequestId
      };
      this.http
        .post(
          this.myService.constant.apiURL + "imprest_requests/deletecategorymasterdata",
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
          this.title = "Imprest Form";
          this.getFromSet();
          this.getAutoLoadAfterEvent();
        });
    }
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
      pdf.save('imprest_request.pdf'); // Generated PDF
    });
  }
}
