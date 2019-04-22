import { Injectable, OnInit } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Router, NavigationStart } from "@angular/router";
import { Observable } from "rxjs/Rx";
import { PlatformLocation } from "@angular/common";
import "rxjs/add/operator/toPromise";
import { environment } from "../../environments/environment";
@Injectable()
export class BackendApiService {
  public checkSession: any;
  public commonUrl: any;
  public commonUrl1: any;
  public urlstaff: any;
  public urlapi: any;
  public indexUrl: any;
  public url: any;
  public callfrom: string;
  public schoolerpConst: any;
  public apiConst: any;
  public userType: any;
  temp: string = "Hello";
  public constant: any = {};
  public details: any = {};
  public languageName: any = "";
  public SaultKey: any = "";
  public HRLoginUrl: any = "";
  public DownloadRootURL: any = "";

  constructor(
    private http: Http,
    platformLocation: PlatformLocation,
    private router: Router
  ) {
    this.commonUrl =
      (platformLocation as any).location.protocol +
      "//" +
      (platformLocation as any).location.hostname +
      "/";
    this.commonUrl1 =
      (platformLocation as any).location.protocol +
      "//" +
      (platformLocation as any).location.hostname;
    // this.commonUrl = "http://test.etl.extramarks.com/"
    // this.commonUrl1 = "http://test.etl.extramarks.com"
    if (environment.production) {
      this.constant = {
        apiURL: this.commonUrl1 + ":3000/api/",
        PROJECT_NAME: "/schoolerp",
        Multingual: 1,
      
        domainName: this.commonUrl
      };
    } else {
      this.constant = {
        apiURL: this.commonUrl1 + ":3000/api/",
        PROJECT_NAME: "/schoolerp",
        Multingual: 1,

        domainName: this.commonUrl
      };
    }

    this.details = {
      url: this.commonUrl1 + "/schoolerp/erpapi/examination/",
      indexUrl: this.commonUrl1 + "/schoolerp/erpapi/index/",
      defaultUrl: this.commonUrl1 + "/schoolerp/default/ajax/",
      erpUrl: this.commonUrl1 + "/schoolerp/login/loginapi/"
    };
  }

  apiService(url, param) {
    return this.http.post(url, param).map((res: Response) => res.json());
  }
  setLangauage(val) {
    this.languageName = val;
    this.getLangauage();
    // window.localStorage.setItem('language',this.languageName);
  }

  getLangauage() {
    // console.log(this.languageName);
    return this.languageName;
  }
}
