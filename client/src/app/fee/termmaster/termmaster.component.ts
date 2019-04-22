import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-termmaster',
  templateUrl: './termmaster.component.html',
  styleUrls: ['./termmaster.component.css']
})
export class TermmasterComponent implements OnInit {
termform:FormGroup;
user_id:any;
termlist:any=[];
successmsg:any='';
errorsmsg:any='';
session_id:any;
school_id:any;

  constructor(private myService: BackendApiService, private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.user_id=window.localStorage.getItem('user_id');
    this.session_id=window.localStorage.getItem('session_id');
    this.school_id=window.localStorage.getItem('school_id');
    this.termform = new FormGroup(
      {
        id: new FormControl(''),
      termname: new FormControl('', Validators.required),
      status: new FormControl(true),
      prioity:new FormControl('')
    
  });
  this.termList();
  }
  onSubmitDetail(value){
    var status 
    if(value.status==true){
        status ="Active"
      
    }
    else{
      status ="Inactive"
    }
 const params={
   'term_name':value.termname,
   'status':status,
   'added_by':this.user_id,
   'added_date':new Date(),
   'session_id':this.session_id,
   'school_id':this.school_id,
   "prioity":value.prioity
 }
 var url;
 if(value.id!=""){
  console.log("if"+value.id)
   params['id']=value.id
  url=this.myService.constant.apiURL + 'term_name/editterm'
 }
 else{
   console.log("else"+value.id)
  url=this.myService.constant.apiURL + 'term_name/addterm'
 }
 
 this.http.post(url, params).subscribe(details => {
   const data:any=details;
   console.log(data)
   if(data.response_status.status=="200"){
     console.log(data.response_status)
    this.successmsg=data.response_status.message
    this.termform.patchValue({
      id:"",
      termname:"",
      status: true
    })
    this.termList();
   }
   else{
     this.errorsmsg=data.response_status.message
   }
   setTimeout(() => {
    this.successmsg=''
    this.errorsmsg=''
  },3000)
 
 });
  }
  termList(){
    const params={
     
      'school_id':this.school_id
    }
    this.http.post(this.myService.constant.apiURL + 'term_name/termlist', params).subscribe(details => {
      const data:any=details;
 console.log(data.response)
 this.termlist=data.response
    });
  }
  editerm(val){
    const params={
      'id':val
    }
    this.http.post(this.myService.constant.apiURL + 'term_name/termbyid', params).subscribe(details => {
      const data:any=details;
 console.log(data.response)
this.termform.patchValue({
  id:data.response.id,
  termname:data.response.term_name,
  prioity:data.response.prioity,
  status: data.response.status=="Active" ? true :0
})

    });
  }
}
