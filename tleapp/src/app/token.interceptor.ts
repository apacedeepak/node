import { Injectable } from '@angular/core';
import { CommonProvider } from '../providers/common/common';
import { ToastController } from 'ionic-angular';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
 public token: any;
  constructor(private myProvider: CommonProvider,private toastCtrl: ToastController) {
    this.token ='app';
  }

  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  //   //request = request.clone({headers: request.headers.set('Authorization', this.token)});

  //   request = request.clone({
  //     setHeaders: {
  //       Authorization: this.token
  //     }
  //   });

  //   return next.handle(request);
  // }

   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { 
       
       //this.myProvider.pingServer();
         
    req = req.clone({
      setHeaders: {
        Authorization: this.token
      }
    });
         return next.handle(req).map(event => {
        if (event instanceof HttpResponse ) {
            
           
            if(event.body.response_status!= undefined && event.body.response_status.status=='000')
            {
                              
                
            }
        }         
        return event;
    }).catch((err: any)=>{
      
      this.myProvider.toasterError('Could not connect to server');
      return Observable.throw(err);
    });
    }
}
