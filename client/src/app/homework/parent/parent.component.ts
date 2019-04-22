import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Headers, Http, Request, RequestOptions, Response, XHRBackend } from '@angular/http';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
import { BackendApiService } from './../../services/backend-api.service';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})

@Injectable()
export class ParentComponent implements OnInit {
  public data :any;
  public sessionid: any;
  public userid: any;
  public token: any;
  public homeId: any;
  public sectionlist: any;

    public ApiUrl = 'homework/studenthomework';
    public apiurldetails = 'homework/homeworkdetail';
  constructor(private http : HttpClient,private myService: BackendApiService) { 
         this.getdata();
         this.getContacte();
  }
 getdata(){
            this.sessionid = window.localStorage.getItem('session_id');
            this.userid = window.localStorage.getItem('student_user_id');
            
            this.token = window.localStorage.getItem('token');
                  const params = {
                        'user_id': this.userid,
                        'token': this.token
                    };
          return this.http.post(this.myService.constant.apiURL+ this.ApiUrl, params).map((res:Response) => res)
        }
        getContacte(){
              this.getdata().subscribe(data =>{
              this.data = data;
              //console.log(this.data);
            })
        }
  ngOnInit() {
  }

}
