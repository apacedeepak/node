import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BackendApiService} from './../../services/backend-api.service';
import { error } from 'util';
import { Http, Headers, Response, RequestOptions, RequestMethod ,ResponseContentType } from '@angular/http';
import 'rxjs/Rx' ;
import { TranslateService } from '@ngx-translate/core';
var FileSaver = require('file-saver');

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {

  public globalObj: any = {}
  public paidArr: any = [];
  public totalfee: any;
  public dueArr: any;
  public total_due_fee: any;
  public feeDues: any = [];
  public feePaid: any = [];
  public feedetail: any= [];
  public feerecipts: any= [];
  public feereciptdwnld:any='';
  public product_type: any = '';
  public opendetailfee: any;
  mypdf : any="";
  options:any=[];
  receipthtml: any = "";
  pservice:any="";
  mylang:any=''; 

  constructor(private myService: BackendApiService, private http: HttpClient, private https: HttpClient,private translate: TranslateService) { 
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

  ngOnInit() {
    this.globalObj.user_id = window.localStorage.getItem('student_user_id');
    this.globalObj.session_id = window.localStorage.getItem('session_id');
    this.globalObj.school_id = window.localStorage.getItem('school_id');
    
    this.product_type = window.localStorage.getItem('product_type');
    this.globalObj.domainName = this.myService.commonUrl1;

    this.http.get(this.myService.commonUrl1+this.myService.constant.PROJECT_NAME + "/erpapi/fee/emsccfees/user_id/"+ this.globalObj.user_id).subscribe(details=>{
      const res: any = details;
      this.paidArr = res.data.paid_payment_history;;
      this.totalfee = res.data.total_fee;
       this.dueArr = res.data.pending_dues;
       this.total_due_fee = res.data.total_due_fee;
      
    })
      this.feeduepaid(); 
      this.feepaidfun();
      
  }

feeduepaid(){
  const feeDueParam = {
      "user_id": this.globalObj.user_id,
      "session_id": this.globalObj.session_id,
      "school_id": this.globalObj.school_id
    };
   
   this.http.post(this.myService.constant.apiURL+"fee_defaulters/duefee", feeDueParam).subscribe(feedues => {
            const fee: any = feedues;
         
            this.feeDues = fee.response.dueList;
        });

    }

feeduedetails(termId){
  (<any>$('#feereciptpop')).modal('hide');
  const termArr = [];
  termArr.push(termId);
  
  

  const feeDuedetailParam= {
    "user_id": this.globalObj.user_id,
    "session_id": this.globalObj.session_id,
    "school_id": this.globalObj.school_id,
     "term_id":termArr
  };
 
 this.http.post(this.myService.constant.apiURL+"fee_defaulters/termwiseduefee", feeDuedetailParam).subscribe(feeduesdetail => {
          const fees: any = feeduesdetail;
          
          this.feedetail=fees.response;
          
          (<any>$('#feedetailpop')).modal('show');

          // (<any>$('#feedetailpop')).modal('show');
      });

}



feepaidfun(){

     let feePaidParam = {
            "user_id": this.globalObj.user_id,
            "session_id": this.globalObj.session_id,
            "school_id": this.globalObj.school_id
        };
        this.http.post(this.myService.constant.apiURL+"receipts/studentreceipts", feePaidParam).subscribe(feepaid => {
            const fee: any = feepaid;
            this.feePaid = fee.response.receiptDetails;
            
        });
}
feereceipt(receiptId){
  
  this.feedetail = '';
  (<any>$('#feedetailpop')).modal('hide');
   (<any>$('#feereciptpop')).modal('show');

 
  const feereceiptParam = {
      "user_id": this.globalObj.user_id,
      "receipt_id": receiptId,
      "session_id": this.globalObj.session_id,
      "school_id": this.globalObj.school_id
    };
   
   this.http.post(this.myService.constant.apiURL+"receipts/receiptdetail", feereceiptParam).subscribe(feerecipt => {
            const fee: any = feerecipt;
           
            this.feerecipts = fee.response.html;
            this.feereciptdwnld=fee.response.pdf;
            $("#receipt_pdf").attr('href',fee.response.pdf);
            
            $.ajax({ url: this.feerecipts, success: result => $(".reciept").html(result) });
            
          });

    }
   
}
