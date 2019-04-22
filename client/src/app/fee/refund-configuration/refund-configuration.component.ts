import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';
@Component({
  selector: 'app-refund-configuration',
  templateUrl: './refund-configuration.component.html',
  styleUrls: ['./refund-configuration.component.css']
})
export class RefundConfigurationComponent implements OnInit {

  configForm: FormGroup;
  feeheadtypelistdata:any=[];
  feeheadlistdata:any = [];
  fee_head_type_json: any;
  fee_head_type_object: any;
  fee_head_type_arr: any = [];
  fee_head_type_array: any = [];
  fee_head_list:any = [];
  successmsg: any = '';
  errormsg: any = '';
  params:any;
  searchParam:any;
  tax_details_json:any;
  tax_details_object:any={};
  refundconfiglist:any=[];
  constructor(private http: HttpClient, private myservice: BackendApiService) { }

  ngOnInit() {

      this.configForm = new FormGroup({
      id: new FormControl(''),
      fee_head_id: new FormControl(''),
      refund_on: new FormControl(''),
      refund_ratio: new FormControl(''),
      day_of_refund_in_days : new FormControl(''),
      percentage_or_amount: new FormControl(''),
    });
    
    this.searchParam = {"is_refundable":1,"status":"Active","school_id": window.localStorage.getItem('school_id')};
    this.getFeeHeadList();
    this.getRefundConfigList();


  }
 
  onSubmit(value) {

    
    var postdata: any = '';
    postdata = {
      fee_head_id: value.fee_head_id,
      refund_on: value.refund_on,
      refund_ratio: value.refund_ratio,
      day_of_refund_in_days: value.day_of_refund_in_days,
      percentage_or_amount: value.percentage_or_amount
    }

    if(value.id != ""){
      postdata.id = value.id;
    }
    
    var url = value.id == ""  ? this.myservice.constant.apiURL + "refund_configurations/addconfig" : this.myservice.constant.apiURL + "refund_configurations/editconfig";
    // hit post API to add/edit refund config
  
    this.http.post(url, postdata).subscribe(data => {


      const details: any = data;

      if (details.response_status.status == "200") {
        this.configForm.patchValue({
          id:"",
          fee_head_id: "",
          refund_on: "",
          refund_ratio: "",
          day_of_refund_in_days: "",
          percentage_or_amount: "",
          
        });
        this.successmsg = details.response_status.messasge;
        this.errormsg = '';

        
        this.getRefundConfigList();
        this.msgRemoval();
      }
      else if (details.response_status.status == "202") {
        this.successmsg = '';
        this.errormsg = details.response_status.messasge;
        this.msgRemoval();
      }
      else {
        this.successmsg = '';
        this.errormsg = details.response_status.messasge;
        this.msgRemoval();
      }

    });

    
  }


  /*
  Delete the Fee Head 
  */

 deleteconfig(id){
   if(confirm("Are you sure to delete this config")){
  var url = this.myservice.constant.apiURL + "refund_configurations/deleteconfig";
  var postdata = {"id":id};
  this.http.post(url, postdata).subscribe(data => {
    const details: any = data;
    if (details.response_status.status == "200") {
      this.successmsg = details.response_status.messasge;
      this.errormsg = '';
      
      this.getRefundConfigList();
      this.msgRemoval();
    }else{
      this.successmsg = "";
      this.errormsg = 'Something went wrong...';
      this.msgRemoval();
    }
    
 });
}else{
  return false;
}
}

/*
Details of refund config by id
*/

configdetails(id){
  var url = this.myservice.constant.apiURL + "refund_configurations/configdetails";
  var postdata = {"id":id};
  this.http.post(url, postdata).subscribe(data => {
    const details: any = data;
    
    if (details.response_status.status == "200") {
      
      // auto fill data...
      this.configForm.patchValue({
        id:details.response.id,
        fee_head_id: details.response.fee_head_id,
        refund_on: details.response.refund_on,
        refund_ratio: details.response.refund_ratio,
        day_of_refund_in_days: details.response.day_of_refund_in_days,
        percentage_or_amount: details.response.percentage_or_amount,
      });
      
    }else{
      this.successmsg = "";
      this.errormsg = 'Something went wrong...';
    }

 });


}


getFeeHeadList(){

  
    var url = this.myservice.constant.apiURL + "fee_head_masters/getfeeheadlist";
    // hit post API to add/edit fee head
    // fee_head_masters/addfeehead
    this.http.post(url, this.searchParam).subscribe(data => {
      const result: any = data;

      if (result.response_status.status == "200") {
        this.feeheadlistdata = result.response;
      }

    });

}

msgRemoval(){

  setTimeout(()=>{
    this.successmsg = "";
    this.errormsg = "";
  },3000);
}

getRefundConfigList(){
var url = this.myservice.constant.apiURL + "refund_configurations/getrefundconfiguration";
    
    this.http.post(url, {status:"Active"}).subscribe(data => {
      const result: any = data;

      if (result.response_status.status == "200") {
        this.refundconfiglist = result.response;
      }

    });


}

}
