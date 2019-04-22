import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {BackendApiService} from './services/backend-api.service';
import { Observable } from 'rxjs/Observable';
import {RouterModule, Router} from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
 private token: any;
 private urlArr = ['loginapi/','schools/schoollist','login/login','/login/contactus','ctpconfiguration/gethocontactdetails'];
  constructor(public myService: BackendApiService,private router: Router) {
   
  }


   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { 
       
 
      let urlSplit = req.url.split( '/' );
     
      let rUrl =function(url) {return url==urlSplit[ urlSplit.length - 2 ]+"/"+urlSplit[ urlSplit.length - 1 ]}
   
if(!(this.urlArr.find(rUrl))){   
  this.token= window.localStorage.getItem('token')
      req = req.clone({
      setHeaders: {
        Authorization:   this.token,
        url:this.router.url
      }
    });}
         return next.handle(req).map(event => {
        if (event instanceof HttpResponse ) {
           
            if(event.body.response_status!= undefined && event.body.response_status.status=='000')
            {
                window.localStorage.clear();
                window.location.href = this.myService.constant.domainName+"schoolerp/login/logout";
            }else if(  event.body.response_status!= undefined && event.body.response_status.status=='0000'){
                this.router.navigate(["dashboard"]);
            }
        }         
        return event;
    });
    }
}
