import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {BackendApiService} from './services/backend-api.service';
import {RouterModule, Router} from '@angular/router';


@Injectable()
export class AuthLoginGuard implements CanActivate {
  constructor(private myService: BackendApiService, private router: Router){
   
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      let token="";
    token= window.localStorage.getItem('token');

    if (!token) {
  
        this.router.navigate(["/login/portallogin"]);

    
    return false;
//                window.location.href = this.urlstaff+"login/portallogin";
}
//this.router.navigate(["/login/portallogin"]);
  return true;


  }
}
