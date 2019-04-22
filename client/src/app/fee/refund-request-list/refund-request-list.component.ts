import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';
@Component({
  selector: 'app-refund-request-list',
  templateUrl: './refund-request-list.component.html',
  styleUrls: ['./refund-request-list.component.css']
})
export class RefundRequestListComponent implements OnInit {

  searchForm: FormGroup;
  successmsg: any = '';
  errormsg: any = '';
  params: any;
  searchParam: any;
  requestForm: any;
  action: any;
  refundrequestlist:any;
  
  constructor(private http: HttpClient, private myservice: BackendApiService, private router: Router) { }

  ngOnInit() {
    
    this.searchForm = new FormGroup({
      admission_number: new FormControl(''),
      refund_status : new FormControl('')
    });
  }

  onSubmit(value){
    this.refundrequestlist = [];
    
    var jsonSearch = value;
    var url = this.myservice.constant.apiURL + "fee_refund_request_masters/refundrequestlist";
    this.http.post(url, jsonSearch).subscribe(data => {
      const result: any = data;
      
      if (result.response_status.status == 200) {
        this.refundrequestlist = result.response;
      }
    });


  }

  // msgRemoval() {

  //   setTimeout(() => {
  //     this.successmsg = "";
  //     this.errormsg = "";
  //   }, 3000);
  // }

  approve(id){

    if(confirm("Are you sure to approve the refund request")){
      
      // hit api to update the request
    
    var url = this.myservice.constant.apiURL + "fee_refund_request_masters/updaterequest";
    this.http.post(url, {id:id,refund_status:"Approved",action_by:window.localStorage.getItem('user_id')}).subscribe(data => {
      const result: any = data;
      
      if (result.response_status.status == 200) {
        alert("Request has been approved");
        location.reload()
      }
    });
    }
  }


  reject(id){
    if(confirm("Are you sure to reject the refund request")){
      
      // hit api to update the request
    
    var url = this.myservice.constant.apiURL + "fee_refund_request_masters/updaterequest";
    this.http.post(url, {id:id,refund_status:"Rejected",action_by:window.localStorage.getItem('user_id')}).subscribe(data => {
      const result: any = data;
      
      if (result.response_status.status == 200) {
        alert("Request has been rejected");
        location.reload()
      }
    });
    }
  }



}
