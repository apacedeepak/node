import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

public userType : any;
public user_id : any;
public token : any;
public flag : any;
  constructor(private activatedRoute: ActivatedRoute,private http: HttpClient, private myService:BackendApiService) {
    this.userType = window.localStorage.getItem('user_type').toLowerCase();
    this.user_id = window.localStorage.getItem('user_id');
    this.token = window.localStorage.getItem('token');
     this.activatedRoute.queryParams.subscribe(params => {
              this.flag = params['flag'];
          // console.log(this.flag);
          });

  }

  ngOnInit() {
    this.updatemodulenotification();
  }

  updatemodulenotification()
  {
    const param = {
            'user_id' : this.user_id,
            'type': [4],
            'token': this.token
       };
    this.http.post(this.myService.constant.apiURL + 'notification/updatemodulenotification', param).subscribe(details => {
    });
  }

}
