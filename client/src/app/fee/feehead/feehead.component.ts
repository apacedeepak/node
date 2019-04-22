import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';
@Component({
  selector: 'app-feehead',
  templateUrl: './feehead.component.html',
  styleUrls: ['./feehead.component.css']
})
export class FeeheadComponent implements OnInit {

  addFeeHeadForm: FormGroup;
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
  
  constructor(private http: HttpClient, private myservice: BackendApiService) { }

  ngOnInit() {

    this.params = {"tag":"fee_head_type"};
    var url = this.myservice.constant.apiURL + "ctpconfiguration/gethocontactdetails";
    // hit post API to add/edit fee head
    // fee_head_masters/addfeehead
    this.http.post(url, this.params).subscribe(data => {
      const result: any = data;

      if(result.response_status.status == "200") {
          this.fee_head_type_json = result.response.value;
      }
      this.fee_head_type_object = JSON.parse(this.fee_head_type_json);
    });

    this.params = {"tag":"tax"};
    this.http.post(url, this.params).subscribe(data => {
      const tax_details: any = data;
  //console.log(tax_details.response);
      if(tax_details.response_status.status == "200") {
          this.tax_details_json = tax_details.response.value;
      }
      this.tax_details_object = JSON.parse(this.tax_details_json);

      //console.log(this.tax_details_json);
      //console.log(this.tax_details_object.CGST);
    });



    //this.fee_head_type_json = '{"1" :"School","2" :"Caution","3" :"Transport","4" :"Transport Other","5" :"Hostel","6" :"Hostel Other","7" :"Miscellaneous"}';
    

    this.fee_head_list = '';


    this.addFeeHeadForm = new FormGroup({
      id: new FormControl(''),
      fee_head_name: new FormControl('', Validators.required),
      fee_head_short_name: new FormControl('', Validators.required),
      priority: new FormControl('', [Validators.pattern("^[0-9]*$")]),
      type_of_fee: new FormControl('', Validators.required),
      cgst: new FormControl('', Validators.required),
      sgst: new FormControl('', Validators.required),
      igst: new FormControl('', Validators.required),
      apply_cgst: new FormControl(''),
      apply_sgst: new FormControl(''),
      apply_igst: new FormControl(''),
      sac_hsn_code: new FormControl(''),
      is_optional: new FormControl(''),
      is_refundable: new FormControl(''),
      is_offer_applicable: new FormControl(''),
      is_included_in_certificate: new FormControl(''),
    });
    
    this.searchParam = {"status":"Active","school_id": window.localStorage.getItem('school_id')};
    this.getFeeHeadList();
    //console.log(this.feeheadlistdata);


  }
 
  onSubmit(value) {

    if(this.addFeeHeadForm.controls.priority.invalid){
      this.successmsg = '';
      this.errormsg = "Priority should be a number";
      this.msgRemoval();
      return false;  
    }
    var postdata: any = '';
    postdata = {
      "fee_head_name": value.fee_head_name,
      "sac_hsn_code": value.sac_hsn_code,
      "fee_head_short_name": value.fee_head_short_name,
      "fee_head_type_id": value.type_of_fee,
      "priority": value.priority,
      "status": "Active",
      "added_by": window.localStorage.getItem('user_id'),
      "added_date": new Date(),
      "school_id": window.localStorage.getItem('school_id'),
      "cgst": value.apply_cgst ? this.tax_details_object.CGST: "0.00",
      "sgst": value.apply_sgst ? this.tax_details_object.SGST: "0.00",
      "igst": value.apply_igst ? this.tax_details_object.IGST: "0.00"
    }

    if(value.id != ""){
      postdata.id = value.id;
      postdata.modified_by =  window.localStorage.getItem('user_id');
      postdata.modified_date =  new Date();
    }
    postdata.is_optional = value.is_optional ? "1" : "0";
    postdata.is_refundable = value.is_refundable ? "1" : "0";
    postdata.is_offer_applicable = value.is_offer_applicable ? "1" : "0";
    postdata.is_included_in_certificate = value.is_included_in_certificate ? "1" : "0";



    var url = value.id == ""  ? this.myservice.constant.apiURL + "fee_head_masters/addfeehead" : this.myservice.constant.apiURL + "fee_head_masters/editfeehead";
    // hit post API to add/edit fee head
    // fee_head_masters/addfeehead
    this.http.post(url, postdata).subscribe(data => {


      const details: any = data;

      if (details.response_status.status == "200") {
        this.addFeeHeadForm.patchValue({
          id:"",
          fee_head_name: "",
          fee_head_short_name: "",
          priority: "",
          type_of_fee: "",
          apply_cgst: "",
          apply_sgst: "",
          apply_igst: "",
          sac_hsn_code: "",
          is_optional: "",
          is_refundable: "",
          is_offer_applicable: "",
          is_included_in_certificate: ""
        });
        this.successmsg = details.response_status.messasge;
        this.errormsg = '';

        
        this.getFeeHeadList();
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

 deletefeehead(id){
   if(confirm("Are you sure you want to delete this fee head")){
  var url = this.myservice.constant.apiURL + "fee_head_masters/deletefeehead";
  var postdata = {"id":id};
  this.http.post(url, postdata).subscribe(data => {
    const details: any = data;
    if (details.response_status.status == "200") {
      this.successmsg = details.response_status.messasge;
      this.errormsg = '';
      
      this.getFeeHeadList();
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
Details of Fee Head by id
*/

feeheaddetails(id){
  var url = this.myservice.constant.apiURL + "fee_head_masters/feeheaddetails";
  var postdata = {"id":id};
  this.http.post(url, postdata).subscribe(data => {
    const details: any = data;
    console.log(details);
    if (details.response_status.status == "200") {
       var apply_cgst = details.response.cgst > 0 ? 1 : 0;
       var apply_sgst = details.response.sgst > 0 ? 1 : 0;
       var apply_igst = details.response.igst > 0 ? 1 : 0;
      // auto fill data...
      this.addFeeHeadForm.patchValue({
        id:details.response.id,
        fee_head_name: details.response.fee_head_name,
        fee_head_short_name: details.response.fee_head_short_name,
        priority: details.response.priority,
        type_of_fee: details.response.fee_head_type_id,
        apply_cgst: apply_cgst,
        apply_sgst: apply_sgst,
        apply_igst: apply_igst,
        sac_hsn_code: details.response.sac_hsn_code,
        is_optional: details.response.is_optional,
        is_refundable: details.response.is_refundable,
        is_offer_applicable: details.response.is_offer_applicable,
        is_included_in_certificate: details.response.is_included_in_certificate
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

}
