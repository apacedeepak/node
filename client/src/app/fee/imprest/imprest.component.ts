import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BackendApiService} from './../../services/backend-api.service';
import { error } from 'util';
import { DomSanitizer} from '@angular/platform-browser';
import { Http, Headers, Response, RequestOptions, RequestMethod ,ResponseContentType } from '@angular/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import * as moment from 'moment';
import * as $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;
@Component({
  selector: 'app-imprest',
  templateUrl: './imprest.component.html',
  styleUrls: ['./imprest.component.css']
})
@ViewChild("tref", {read: ElementRef}) 

export class ImprestComponent implements OnInit {
public ledgerflag:boolean=false;
todate: any;
fromdate: any;
public today: any;
public dd: any;
public todaydate: any;
public mm : any;
public yyyy: any;
public globalObj: any = {};
public headName: any=[];
public totalExpense:any=[];
 public studentData :any=[];
public totalCollection :any=[];
public totalCollectionArr :any=[];
public schoolDetail :any=[];
public headNameArr :any=[];
dateA: any;
public hoveredDate: any;
public fromrange: any = '';
public torange: any = '';
public head_name: any = '';
public fromDate: any;
public toDate: any;
balance =0;
dr_total=0;
cr_total=0;
openingbalance:any=[];
amount_deposited: any;
amount_withdrawn: any;
receiptN0_sum: any = 0; 
bill_no_sum: any = 0;
totalbalance :any =0;
balancevalue:any=0;
depositvalue:any=[];
opening_balance: any=0;
withdrawnvalue:any=[];
pdf:any;
posthtml:any;
totalimprestamount: any=0;
totalexpenseamount:any=0;
balanceopen: any=0;
j=0;
k=0;
tref: ElementRef;
public showcalander: boolean = false;
public ledgerFlag: boolean = false;
  public showdaterange: boolean = false;
  public fromDateFlag: boolean = false;
  public toDateFlag: boolean = false;
  myDatePickerOptions:any;
  htmlContent:any;
  elementRef:any;
  gethtml:any;
  mylang:any=''; 
heads: FormControl = new FormControl('', Validators.required);
@ViewChild("tpl") tpl: ElementRef;
@ViewChild("tpl1") tpl1: ElementRef;
  constructor(private sanitizer: DomSanitizer,private elRef: ElementRef, private myService: BackendApiService, private http: HttpClient, private https: HttpClient,private translate: TranslateService) { 
    // this.htmlContent = this.sanitizer.bypassSecurityTrustHtml('<p>This is my <strong style="color:red">Paragraph</strong></p>');
    // this.elementRef.nativeElement.innerHTML ='<h1>Hello World</h1>';
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

  ngOnInit() {
    
     this.globalObj.userid = window.localStorage.getItem('student_user_id');
     this.globalObj.sessionid = window.localStorage.getItem('session_id'); 
     this.globalObj.schoolId = window.localStorage.getItem('school_id');
     this.globalObj.token = window.localStorage.getItem('token');
     this.today = new Date();
     this.dd = this.today.getDate();
     this.mm = this.today.getMonth()+1;
  
     this.dateA = moment().subtract('days', this.dd-1);
     this.fromrange = this.dateA;
     this.dateA.fromNow();

     
  
     this.yyyy = this.today.getFullYear();
     this.todaydate = this.dd+'-'+this.mm+'-'+this.yyyy;
    
console.log(this.todaydate);
     this.getheadname();
     this.totalexpense(this.head_name,this.dateA,this.toDate);
     
     this.schooldetail();
     this.studentdetails();
     
     
  }
  changeflag(){
    this.ledgerflag=true;
    this.imprestcollection(this.dateA,this.toDate);  
  }
  ledgerstatus(){
    this.ledgerFlag=true;
    
  }
  
 getheadname(){
      this.http.get(this.myService.constant.apiURL+"expenses/getHeadName").subscribe(data => {
          const expense: any = data;
     
       this.headName=expense.response;
       
     this.headName.forEach((key,value)=>
     {
      // console.log(key);
      // console.log(value);
        for(let i in key){
          // console.log(key[i]);
          this.headNameArr.push(key[i]);
        }

     })
       
        // console.log(this.headNameArr);
      });
}
displaycal() {
  this.showcalander = true;
this.fromDateFlag=true;
this.toDateFlag=false;
}
displaycal2() {
  this.showcalander = true;
this.toDateFlag=true;
this.fromDateFlag=false;
}

onDateChange(date: NgbDateStruct, type) {
  this.showcalander = false;
  if(type == 'from'){
    this.fromDate = date;
    let f_year = this.fromDate.year;
    let f_month = this.fromDate.month < 10 ? '0' + this.fromDate.month : this.fromDate.month;
    let f_day = this.fromDate.day < 10 ? '0' + this.fromDate.day : this.fromDate.day;
    this.dateA = f_year + "-" + f_month + "-" + f_day;
    if(this.toDate && this.dateA > this.today){
      alert(this.translate.instant("from_to_date_alert"));
     // this.dateA = this.toDate;
      return false;
    } 
    
  }
  if(type == 'to'){ 
    this.toDate = date;
    let t_year = this.toDate.year;
    let t_month = this.toDate.month < 10 ? '0' + this.toDate.month : this.toDate.month;
    let t_day = this.toDate.day < 10 ? '0' + this.toDate.day : this.toDate.day;
    this.today = t_year + "-" + t_month + "-" + t_day;
 
    if(this.dateA > this.today){
      alert(this.translate.instant("from_to_date_alert"));
      //this.toDate = this.dateA;
      return false;
    }
  }
  this.totalexpense(this.head_name,this.dateA,this.today);
if( this.ledgerflag==true){
this.imprestcollection(this.dateA,this.today);
}
}

totalexpense(headName,from_date,to_date){
  const params = {
      "userId": this.globalObj.userid,
      "sessionId": this.globalObj.sessionid,
       "headName": headName,
        "fromDate":this.dateA,
        "toDate": this.today
    };
   
   this.http.post(this.myService.constant.apiURL+"expenses/totalExpense", params).subscribe(data => {
            const expenses: any = data;
         
            this.totalExpense = expenses.response.billInfo;
            
            



            
        });

    }
    initializesum(){
      this.receiptN0_sum=0;
      this.bill_no_sum=0;
      this.totalbalance=0;
      this.totalimprestamount=0;
      this.totalexpenseamount=0;
      this.opening_balance=0;
    }
    imprestcollection(from_date,to_date){
      
      this.initializesum();
      this.depositvalue=[];
      this.withdrawnvalue=[];
      const params = {
          "userId": this.globalObj.userid,
          "sessionId": this.globalObj.sessionid,
      
            "fromDate":this.dateA,
            "toDate": this.today
        };
       
       this.http.post(this.myService.constant.apiURL+"imprest_collections/totalDeposit", params).subscribe(data => {
                const imprest: any = data;
             
                this.totalCollection = imprest.response.receipt;
            
      
this.opening_balance = imprest.response.openingbalance;
console.log(this.opening_balance );

this.balanceopen=this.opening_balance;
                this.totalCollection.forEach( (obj, i) => {
                
                  if(obj.receipt_no){
                    this.receiptN0_sum += obj.amount;
            
                   this.balanceopen += obj.amount;
                   
                  }
                  else{
                    this.bill_no_sum += obj.amount;
                    this.balanceopen -=   obj.amount;
                  } 
                  this.totalCollection[i]['balance'] =     this.balanceopen;
                  // this.opening_balance = obj['balance']; 
                })
                // balance[i] = (opening_balance + amount_deposited[i]) - amount_withdrawn[i];
                // console.log(this.opening_balance);
                this.receiptN0_sum+=this.opening_balance;
                 this.totalbalance = this.receiptN0_sum - this.bill_no_sum;
                 //this.posthtml = this.tpl1.nativeElement.innerHTML;
              
                  
                });
    
        }
        ledgerpdf(){
          this.gethtml=$( "#ledger" ).html();
             this.imprestcollection(this.dateA,this.today); 
          const params ={
            "posthtml":this.gethtml
           }
           this.http.post(this.myService.constant.apiURL+"imprest_collections/studentledger", params).subscribe(data => {
            const ledger: any = data;
            // console.log(data);
            this.pdf=ledger.response_status;
             $("#hiddentdown").attr('href',ledger.response_status);
            $("#hiddbutton").click();
           
            // this.imprestcollection(this.dateA,this.today); 
            // console.log(this.pdf);
            
          });
        }

        schooldetail(){
          const params = {
            "school_id": this.globalObj.schoolId
          }
          this.http.post(this.myService.constant.apiURL+"schools/schooldetail", params).subscribe(data => {
            const detail: any = data;
         
            this.schoolDetail = detail.response;
            
        });
        }
        studentdetails(){
          const params = {
            "user_id": this.globalObj.userid,
            "session_id": this.globalObj.sessionid,
            "token":    this.globalObj.token,
            "type": 'student',//this.userType,
            "school_id": this.globalObj.schoolId
          };
      
          this.http.post(this.myService.constant.apiURL + 'users/userdetail', params).subscribe(details => {
      
            const studentDetail: any = details;
            this.studentData = studentDetail.response;
            
          });
        }
        }

     