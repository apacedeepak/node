import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';

import { BackendApiService } from "./../../services/backend-api.service";
var md5 = require("md5");

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  public urlPath: any;

  constructor(private router: Router, private myService: BackendApiService, private http: HttpClient) { }

  public userName: any = {};

  ngOnInit() {
    this.myhrlogin();
    this.urlPath = this.router.url.substr(this.router.url.lastIndexOf('/') + 1);

  }

  myhrloginOld() {
    this.userName = window.localStorage.getItem("username");
    var UserName = this.userName;
    var checkSum = md5(UserName + ":" + this.myService.constant.SaultKey);
    var loginUrl = this.myService.constant.HRLoginUrl + "/apis/auth/get/username/" + UserName + "/checksum/" + checkSum;
    window.open(loginUrl, "_blank");
  }

  myhrlogin() {
    this.userName = window.localStorage.getItem("username");
    var UserName = this.userName;
    if (UserName != "") {
      const url = this.myService.constant.apiURL + 'users/getuserdetails?userName=' + UserName;
      this.http.get(url).subscribe(details => {
        const data: any = details;
        const responseDate = data.response;
        var passwordData = responseDate.password;
        var checkSum = md5(UserName + ':' + this.myService.constant.SaultKey);
        var pchecksum = md5(UserName + ':' + passwordData);
        var loginUrl = this.myService.constant.HRLoginUrl + '/apis/auth/get/username/' + UserName + '/checksum/' + checkSum + '/pchecksum/' + pchecksum;
        window.open(loginUrl, '_blank');

      });
    }
  }

}
