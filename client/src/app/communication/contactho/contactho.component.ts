import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { parse } from 'path';
import { url } from 'inspector';
import { response } from 'express';
@Component({
  selector: 'app-contactho',
  templateUrl: './contactho.component.html',
  styleUrls: ['./contactho.component.css']
})
export class ContacthoComponent implements OnInit {
  successmsg:any=''
  errormsg:any=''
  contactho:FormGroup
  contactdetail:any=[]
  editflag:any=false
  constructor( private http: HttpClient, private myservice: BackendApiService) { }

  ngOnInit() {
this.contactho=new FormGroup({
  header:new FormControl(''),
  address:new FormControl(''),
  call:new FormControl('',[Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
  email:new FormControl('',[Validators.required, Validators.pattern( /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)])
 
})
this.details();
  }
  onSubmit(val){
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    //var address = document.getElementById[email].value;
    if (reg.test(val.email) == false) 
    {
        alert('Invalid Email Address');
        return (false);
    }

    const params ={
      'head_name' :val.header,
      'address' :val.address,
      'contact_no' :val.call,
      'email':val.email,
    }
if(this.editflag==false){
    this.http.post(this.myservice.constant.apiURL + "ctpconfiguration/insertcontactho",params).subscribe(data => {
      const result: any = data;
      if(result.response_status.status=="200"){
        this.details();
        this.successmsg=result.response_status.message
        this.errormsg = "";
      }
      if(result.response_status.status=="201"){
        this.errormsg=result.response_status.message
        this.successmsg = "";
      }
      
  setTimeout(()=>{
    this.successmsg = "";
    this.errormsg = "";
  },3000);
    })}
    if(this.editflag==true){
      this.http.post(this.myservice.constant.apiURL + "ctpconfiguration/updatecontact",params).subscribe(datas => {
        const result: any = datas;
    
        if(result.response_status.status=="200"){
          this.details();
          this.successmsg=result.response_status.message
          this.errormsg = "";
        }
        if(result.response_status.status=="201"){
      
          this.errormsg=result.response_status.message
          this.successmsg = "";
        }
        
    setTimeout(()=>{
      this.successmsg = "";
      this.errormsg = "";
    },3000);
      })
    }
  }
  editcontact(){
    
this.editflag=true;
this.contactho.patchValue({
  header:this.contactdetail[0].head_name,
 address:this.contactdetail[0].address,
 call:this.contactdetail[0].contact_no,
 email:this.contactdetail[0].email 
})
  }
  details(){
    this.contactdetail=[]
    const params ={
      'tag':"Contact Head Office"
    }
    this.http.post(this.myservice.constant.apiURL + "ctpconfiguration/gethocontactdetails",params).subscribe(data => {
      const result: any = data;
      if(result.response){
    var json= result.response.value
    this.contactdetail.push(JSON.parse(json))
      }  

  });
  }
  deletecontact(){
    if(confirm("Are you sure you want to delete the HO contact ")){
    const params={
      status:"Inactive"
    }
    this.http.post(this.myservice.constant.apiURL + "ctpconfiguration/deactivatecontact",params).subscribe(data => {
      const result: any = data;
      if(result.response_status.status=="200"){
        this.details();
        this.successmsg=result.response_status.message
        this.errormsg = "";
      }
      if(result.response_status.status=="201"){
    
        this.errormsg=result.response_status.message
        this.successmsg = "";
      }
      
  setTimeout(()=>{
    this.successmsg = "";
    this.errormsg = "";
  },3000);
    
    });}
  }
  isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }
  
}
