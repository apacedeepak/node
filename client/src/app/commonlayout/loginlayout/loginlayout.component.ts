import { Component, OnInit } from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {BackendApiService} from './../../services/backend-api.service';
import { HttpClient } from '@angular/common/http';
import {Http} from '@angular/http';

@Component({
  selector: 'app-loginlayout',
  templateUrl: './loginlayout.component.html',
  styleUrls: ['./loginlayout.component.css']
})
export class LoginlayoutComponent implements OnInit {
  public school: any={};
  public schoolDetails: any;

  constructor(private router: Router, private myService: BackendApiService,
  private http: HttpClient){ }

  ngOnInit() { 
    this.http.post(this.myService.constant.apiURL + 'schools/schoollist',{}).subscribe(details => {
        this.schoolDetails = details;
        var count= this.schoolDetails.response.length;
console.log(details);
        if(count > 1 || count==0){ console.log(count);
            this.school = {"school_name":"Extramarks Total Learning","school_logo":"/upload/logo.png","slider_images":""};
        }else{
          this.school = this.schoolDetails.response[0];

        }
    });
  }

}
