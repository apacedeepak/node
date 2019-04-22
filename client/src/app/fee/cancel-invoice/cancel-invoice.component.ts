import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { ExcelService } from './../../services/excel.service';
import { parse } from 'path';
import { url } from 'inspector';
@Component({
  selector: 'app-cancel-invoice',
  templateUrl: './cancel-invoice.component.html',
  styleUrls: ['./cancel-invoice.component.css']
})
export class CancelInvoiceComponent implements OnInit {

  searchForm: FormGroup;
  successmsg: any = '';
  errormsg: any = '';
  params: any;
  searchParam: any;
  invoiceList = [];
  paymentMode:any;
  paymentModeJson:any;
  constructor(private http: HttpClient, private myservice: BackendApiService, private excelService: ExcelService) { }

 

  ngOnInit() {
    this.params = { "school_id": window.localStorage.getItem('school_id') };       
    this.invoiceList = [];
    this.paymentModeJson = [];
    var url;


    url = this.myservice.constant.apiURL + "ctpconfiguration/gethocontactdetails";

    this.http.post(url, { "tag": "payment_mode" }).subscribe(data => {
      const result: any = data;

      if (result.response_status.status == "200") {
        this.paymentMode = result.response.value;
      }

      this.paymentModeJson = JSON.parse(this.paymentMode);//console.log(this.paymentModeJson);
    });



    this.searchForm = new FormGroup({
      payment_mode: new FormControl(''),
      cheque_dd_no: new FormControl('')

    });


    

  }


  onSubmit(value){

    var url;
    var param = {
      school_id:window.localStorage.getItem('school_id'),
      payment_mode:value.payment_mode,
      cheque_dd_no:value.cheque_dd_no
    };
    url = this.myservice.constant.apiURL + "receipts/list";


    this.http.post(url, param).subscribe(data => {
      const result: any = data;
      
      if(result.response_status.status == "200") {
        this.invoiceList = result.response;
        //console.log(this.invoiceList);
      }else{
        this.invoiceList = [];
      }


    });
  }

  cancelInvoice(id){

    var url;
    url = this.myservice.constant.apiURL + "receipts/cancelinvoice";

    this.http.post(url, this.params).subscribe(data => {
      const result: any = data;
      
      if(result.response_status.status == "200") {
        alert('Invoice cancelled');
        location.reload();
      }


    });

  }

}
