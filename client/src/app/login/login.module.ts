import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {BackendApiService} from './../services/backend-api.service';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from './login.component';
import { PortalloginComponent } from './portallogin/portallogin.component';
import {CustompipeModule} from './../custompipe/custompipe.module';




const appRoutes: Routes = [

//            {path: 'login',component:LoginComponent,
//          children:[
//            {path: '',redirectTo:'/login/portallogin',pathMatch:'full'},
//            {path: 'portallogin', component: PortalloginComponent}
//          ]
//        }
       ];

@NgModule({
  declarations: [
    //Layout1Component,
    LoginComponent,
    PortalloginComponent,
  
    ],
  imports: [
    BrowserModule,
    CommonlayoutModule,
    FormsModule,
    ReactiveFormsModule,
    CustompipeModule,
    NgbModule.forRoot(),
    RouterModule.forChild(appRoutes)
  ],
  providers: [BackendApiService],
  bootstrap: [LoginComponent],
  exports:[LoginComponent,RouterModule,PortalloginComponent]
})
export class LoginModule { }
