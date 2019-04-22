import { Component, OnInit,Input } from '@angular/core';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Component({
  selector: 'app-miscellaneous',
  templateUrl: './miscellaneous.component.html',
  styleUrls: ['./miscellaneous.component.css']
})
export class MiscellaneousComponent implements OnInit {
  @Input()  datetype;
    public globalObj: any = {};
    fromDateField: FormControl;
    toDateField: FormControl;

    pay_mode: FormControl = new FormControl('', Validators.required);
    public fromDate : any; 
    monthstart:any='';
    monthend:any='';
    tillend:any='';
    tillstart:any='';
    public toDate : any; 
    public showcalander: boolean = false;
  public showdaterange: boolean = false;
  public fromrange: any = '';
  public torange: any = '';
  public incomeType: any = '';
  public createduser: any = '';
  public hoveredDate: any;
  public miscCollection:any = [];
  public detailerecipt:any=[];
  public totalamount=0;
  public reciptcreator:any=[];
public incomename:any=[];
public today: any='';
public dateA:any='';
public fromDateFlag: boolean = false;
public toDateFlag: boolean = false;
public amounttotal=0;
public mm:any;
public yyyy:any;
public todaydate:any;
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
       this.globalObj.token = window.localStorage.getItem('token');
       this.globalObj.fc = false; 
       this.globalObj.mc =  true; 
       this.globalObj.d = false; 
      //  this.today = new Date();
      //  this.dateA = new Date();
       this.globalObj.flag = '';
      
       this.todaydate= new Date();
    var dd =  this.todaydate.getDate();
    var mm=  this.todaydate.getMonth()+1; //January is 0!
    var yyyy =  this.todaydate.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    this.todaydate = yyyy + '-' + mm + '-' + dd;

         if(this.datetype=='tilldate'){
          
         this.today=this.todaydate;
     

         this.tillend=this.today;
         this.tillstart=this.dateA;
 
         }
         else if(this.datetype=='lastmonth'){
          var now = new Date();
          var prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0);
          var prevMonthFirstDate = new Date(now.getFullYear() - (now.getMonth() > 0 ? 0 : 1), (now.getMonth() - 1 + 12) % 12, 1);
          
          var preStartdate: any = prevMonthFirstDate.getDate();
          var preStartMonth: any = prevMonthFirstDate.getMonth()+1;
          var preStartYear: any = prevMonthFirstDate.getFullYear();
          
          var predate: any = prevMonthLastDate.getDate();
          var preMonth: any = prevMonthLastDate.getMonth()+1;
          var preYear: any = prevMonthLastDate.getFullYear();
          
          if(predate<10) {
              predate = '0'+predate;
          } 

          if(preMonth<10) {
              preMonth = '0'+preMonth
          } 
          if(preStartdate<10) {
              preStartdate = '0'+preStartdate;
          } 

          if(preStartMonth<10) {
              preStartMonth = '0'+preStartMonth
          } 
          
          this.dateA = preStartYear + '-' + preStartMonth + '-' + preStartdate;
          this.today = preYear + '-' + preMonth + '-' + predate;
          this.monthstart=this.dateA;
          this.monthend=this.today;
          
         }
         else{
          this.dateA= new Date();
          this.today=new Date();
        }
        console.log(this.dateA);
        console.log(this.today);
     
       this.miscellaneousCollection(this.dateA,this.today,this.incomeType,this.createduser);
      
       this.receiptcreator();
       this.incomenames();
     

       
      }
  


  removerange() {
    this.toDate = null;
    this.fromDate = null;
    this.showdaterange = false;
    if(this.datetype=='tilldate'){
      this.dateA= this.tillstart;
        this.today=this.tillend;
      
    }
    else if(this.datetype=='lastmonth'){
      this.dateA= this.monthstart;
        this.today=this.monthend;
      
    }
    else{
        this.dateA= new Date();
        this.today=new Date();
    }
   
    this.miscellaneousCollection(this.dateA,this.today,this.incomeType,this.createduser);
  }
  displaycal() {
    (<any>$('#showfromdate')).modal('show');
    this.showcalander = true;
  this.fromDateFlag=true;
  this.toDateFlag=false;
  }
  displaycal2() {
    (<any>$('#showtodate')).modal('show');
    this.showcalander = true;
  this.toDateFlag=true;
  this.fromDateFlag=false;
  }

  
   clickOn(flag){
      $(".showall").removeClass('btn-info');
      if(flag == 'fc'){
          $("#"+flag).addClass('btn-info');
        this.globalObj.fc = true; 
        this.globalObj.mc =  false; 
        this.globalObj.d = false; 
      }else if(flag == 'mc'){
          $("#"+flag).addClass('btn-info');
            this.globalObj.fc = false; 
            this.globalObj.mc =  true; 
            this.globalObj.d = false; 
      }else if(flag == 'd'){
          $("#"+flag).addClass('btn-info');
        this.globalObj.fc = false; 
        this.globalObj.mc =  false; 
        this.globalObj.d = true; 
       
      }
  }
  
   miscellaneousCollection (fromDate,toDate,incomeType,createduser){

     this.amounttotal=0;
     if(fromDate==''||fromDate==undefined){
      fromDate= this.dateA;}
    
      else{
        this.dateA=fromDate;
      }
      if(toDate==''||toDate==undefined){
      toDate=this.today;}
      else{
        this.today=new Date();
        this.today=toDate;
      }
 
          this.incomeType = (incomeType) ? incomeType: ''; 
 
    this.createduser = (createduser) ? createduser: '';

       var param = {
          session_id:this.globalObj.sessionId,
          token: this.globalObj.token,
          from_date:fromDate,
          to_date:toDate,
        income_type:this.incomeType,
          created_by:this.createduser
       }
       console.log(param);
      
      const url = this.myService.constant.apiURL + "imprest_collections/miscellaneouscollection";
        this.http.post(url, param).subscribe( response => {
            var data: any = response;
           if(data){
               this.miscCollection = data.response;
           data.response.forEach(element => {
 
          this.amounttotal+=element.receipt_amount         
           });
          
    
              }
           
        });
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
    (<any>$('#showfromdate')).modal('hide');
    (<any>$('#showtodate')).modal('hide');
this.miscellaneousCollection(this.dateA,this.today,this.incomeType,this.createduser);
  }
  displaycalc() {
    (<any>$('#showselectdate')).modal('show');
    this.showcalander = true;
  }
  onDateChanges(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    }  else if (this.fromDate && !this.toDate && equals(date, this.fromDate)) {
      this.toDate = this.fromDate;
    }
    else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.fromDate != null && this.fromDate != null != undefined && this.toDate != null && this.toDate != undefined) {
      this.showdaterange = true;
      this.showcalander = false;
      let f_year = this.fromDate.year;
      let f_month = this.fromDate.month < 10 ? '0' + this.fromDate.month : this.fromDate.month;
      let f_day = this.fromDate.day < 10 ? '0' + this.fromDate.day : this.fromDate.day;
      this.dateA = f_year + "-" + f_month + "-" + f_day;
      let t_year = this.toDate.year;
      let t_month = this.toDate.month < 10 ? '0' + this.toDate.month : this.toDate.month;
      let t_day = this.toDate.day < 10 ? '0' + this.toDate.day : this.toDate.day;
      this.today = t_year + "-" + t_month + "-" + t_day;
      (<any>$('#showselectdate')).modal('hide');
      this.miscellaneousCollection(this.dateA,this.today,this.incomeType,this.createduser);
    }
  
  }
  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
   miscDetails(incomeType){
        (<any>$('#showpopupmis')).modal('show');
        this.totalamount=0;
        var param = {
          session_id:this.globalObj.sessionId,
          from_date:this.dateA,
          to_date:this.today,
        income_type:this.incomeType,
          created_by:this.createduser
       }
      
      const url = this.myService.constant.apiURL + "imprest_collections/sessiondetailedreceipt";
        this.http.post(url, param).subscribe( response => {
            var data: any = response;
           if(data){
            this.detailerecipt = [];
            //  this.detailerecipt = data.response;
             data.response.forEach((obj,i) => {
         
               if(obj.income_name==incomeType){

                this.detailerecipt.push(obj);
                this.totalamount+=obj.amount
               }
             }); 
           }
           
        });
   }
   incomenames(){
  

    this.http.get(this.myService.constant.apiURL+"imprest_collections/incomename").subscribe(data => {
      const expense: any = data;
  

      expense.response.forEach((obj) => {
    
        this.incomename.push(obj.income_name);  
      });
  
        
      }); 
  
  
  }
   receiptcreator(){
    var param = {
      session_id:this.globalObj.sessionId,
   
   }
  
  const url = this.myService.constant.apiURL + "receipts/receiptcreatorname";
    this.http.post(url, param).subscribe( response => {
        var data: any = response;
       if(data){
  this.reciptcreator=data.response;
           
       }
    
   
    });
  }

}
