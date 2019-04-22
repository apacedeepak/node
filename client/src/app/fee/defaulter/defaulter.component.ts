import { Component, OnInit } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-defaulter',
  templateUrl: './defaulter.component.html',
  styleUrls: ['./defaulter.component.css']
})
export class DefaulterComponent implements OnInit {

  pay_mode: FormControl = new FormControl('', Validators.required);
  public globalObj: any = {};
  public defaulterCollect:any = [];
  public detailerecipt:any=[];
  public totalamount=0;
  public totalamountdue=0;
  public term:any='';
  public feehead:any='';
  public classname:any='';
  public classes:any=[];
public headName:any=[];
public termnames:any=[];
mylang:any=''; 
  constructor(private myService: BackendApiService,
    private http: HttpClient,private translate: TranslateService) { 
      this.mylang= window.localStorage.getItem('language');
   
      if(this.mylang){
       translate.setDefaultLang( this.mylang);}
       else{
         translate.setDefaultLang( 'en');
       }
    }

  ngOnInit() {
    this.globalObj.sessionId = window.localStorage.getItem('session_id');
    // this.globalObj.token = window.localStorage.getItem('token');
    this.globalObj.fc = false; 
    this.globalObj.mc =  false; 
    this.globalObj.d = true; 
    this.globalObj.flag = '';
  
    
    this.defaultercollection(this.term,this.feehead,this.classname);
    this.headname();
    this.termname();
    this.classesnames();
  }
  defaultercollection (term,feehead,classname){
    this.totalamountdue=0;
  
                this.term = (term) ? term: ''; 
 
                this.feehead = (feehead) ? feehead: '';
                this.classname = (classname) ? classname: '';
            
              
    var param = {
       session_id:this.globalObj.sessionId,
      term:this.term,
      fee_head:this.feehead,
      class_name:this.classname
    }

   const url = this.myService.constant.apiURL + "fee_defaulters/sessionfeedefaulter";
     this.http.post(url, param).subscribe( response => {
         var data: any = response;
        if(data){
            this.defaulterCollect = data.response;
            data.response.forEach(element => {
           
              // this.classes.push(element.class_name);
              this.totalamountdue+=element.due_amount;
            });
        }
        // this.classes  = Array.from( new Set(this.classes) );
    
     });
}
classesnames(){
  

  this.http.get(this.myService.constant.apiURL+"sections/classesnames").subscribe(data => {
    const expense: any = data;


    expense.response.forEach((obj) => {
      this.classes.push(obj.class_name);
    });

    }); 


}
headname(){
  

  this.http.get(this.myService.constant.apiURL+"fee_defaulters/getHeadName").subscribe(data => {
    const expense: any = data;

    this.headName=expense.response;
   

      
    }); 


}
termname(){
  

  this.http.get(this.myService.constant.apiURL+"fee_defaulters/getTermname").subscribe(data => {
    const expense: any = data;

    this.termnames=expense.response;
   

   
    }); 


}
miscDetails(classname){
  (<any>$('#showpopupdef')).modal('show');
  this.totalamount=0;
  var param = {
    session_id:this.globalObj.sessionId,
    term:this.term,
      fee_head:this.feehead,
      class_name:this.classname
 }

const url = this.myService.constant.apiURL + "fee_defaulters/sessiondetaileddefaulter";
  this.http.post(url, param).subscribe( response => {
      var data: any = response;
     if(data){
      this.detailerecipt = [];
      let repeated = [], amt = 0;
      let prevUserId = 0, prevTermId = 0, flag = 0, count = 0;

      let userId, prevcount = 0;

       data.response.forEach((obj,i) => {
         if(obj.class==classname){

         this.detailerecipt.push(obj); 
         this.totalamount += obj.amount;
          
         }
        
       }); 
       
     }
     
  });
}
}
