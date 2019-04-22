import { Component, OnInit } from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {BackendApiService} from './../services/backend-api.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-loginlayout',
  templateUrl: './loginlayout.component.html',
  styleUrls: ['./loginlayout.component.css']
})
export class LoginlayoutComponent implements OnInit {
  public school: any={};
  public schoolDetails: any;
  public messages: any = {};
  constructor(private router: Router, private myService: BackendApiService,
  private http: HttpClient){ }

  ngOnInit() { 

    this.messages = window.localStorage.getItem('messages');
 
    setTimeout(() =>{ 
      this.messages = ''; 
      window.localStorage.removeItem('messages');
    }, 3000);

    this.http.post(this.myService.constant.apiURL + 'schools/schoollist',{}).subscribe(details => {
        this.schoolDetails = details;
        var count= this.schoolDetails.response.length;

        if(count > 1 || count ==0){
            this.school = {"school_name":"Extramarks Total Learning","school_logo":"/upload/school_logo/logo.png","slider_images":""};
        }else{
          this.school = this.schoolDetails.response[0];

        }
    });
  }

}
