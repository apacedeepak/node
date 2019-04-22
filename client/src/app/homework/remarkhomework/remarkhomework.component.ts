import { Component, OnInit } from '@angular/core';
import { Routes, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-remarkhomework',
  templateUrl: './remarkhomework.component.html',
  styleUrls: ['./remarkhomework.component.css']
})
export class RemarkhomeworkComponent implements OnInit {
  public userid: any;
  public token: any;
  public homeId: any;
  public teachername: any;
  public subject: any;
  public detaildata: any;
  public htmlContent: any;
  public title: any;
  public discardremk: any;
  public studentName : any;
  public temdata : any;
  public message : any;
  public responseMessage : boolean = false;
  public popmessage : any = '';
  public studentrecord : any = '';
  mylang:any=''; 

  public apiUrl = 'homework/homeworksubmitandcheck';

  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient, private myService: BackendApiService,private translate: TranslateService) {
    // this.userid = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
    this.activatedRoute.params.subscribe((data: any) => {
      this.homeId = data.homeId;
       this.userid= data.userId;
       this.studentName = data.student;
     
    })
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }
  ngOnInit() {
    this.discardremk = false;
    this.subject = window.localStorage.getItem('subject');
    //console.log(this.subject);
    this.title = window.localStorage.getItem('title');
  }
  remarkhomework() {
    if(this.htmlContent==null || this.htmlContent=='' || this.htmlContent==undefined)
      {
        alert( this.translate.instant("Kindly provide the remark"));
        return false;
      }
    const param = {
      'user_id': this.userid,
      'homework_id': this.homeId,
      'check_uncheck': "1",
      'remark': this.htmlContent,
      'token': this.token
    };
    this.http.post(this.myService.constant.apiURL + this.apiUrl, param).subscribe(details => {
     this.studentrecord = details;
      this.temdata  = this.studentrecord.response_status;
      if (this.temdata.status == '200') { 
     this.responseMessage = true;
     var response = details;
     this.popmessage = this.translate.instant(this.temdata.message);
       }
    })
  }

  discardremark() {
    this.discardremk = true;

  }
  rmkcancel() {
    this.discardremk = false;
  }

  rmkdiscard() {
    this.discardremk = false;
  }

}
