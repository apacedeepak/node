import { Component, OnInit } from '@angular/core';
import {Headers,  Response} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NgForm ,FormsModule,FormGroup, FormBuilder ,FormArray,FormControl} from '@angular/forms';
import { BackendApiService } from './../../services/backend-api.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {
  form: FormGroup;
  public globalObj: any = {};

  public userId: any;
  public userType: any;
  manageDetails:any;
  mangageData:any;
  public name:any='';
  public address:any='';
public  gender:any;
public mobile_number:any;
mylang:any='';
  constructor(private http: HttpClient, private myService: BackendApiService,private fb: FormBuilder ,private translate: TranslateService) { 
    this.mylang= window.localStorage.getItem('language');
   
    if(this.mylang){
     translate.setDefaultLang( this.mylang);}
     else{
       translate.setDefaultLang( 'en');
     }
  }

  ngOnInit() {
    this.userId=window.localStorage.getItem('user_id');
    const params = {
      "user_id": this.userId,

    };
    this.http.post(this.myService.constant.apiURL + 'other_registration/managementdetails', params).subscribe(details => {

      this.manageDetails = details;
      this.mangageData = this.manageDetails.response;
      this.name=this.mangageData[0].name;
      this.address=this.mangageData[0].address;
      this.gender=this.mangageData[0].gender;
      this.mobile_number=this.mangageData[0].mobile_number;

   
    });
  }

}
