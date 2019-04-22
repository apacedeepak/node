import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginlayoutComponent } from './loginlayout/loginlayout.component';
import { PortalloginComponent } from './login/portallogin/portallogin.component';
import { ContactusComponent } from './contactus/contactus.component';
import { ContactComponent } from './contact/contact.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
const appRoutes: Routes = [

  { path: '', redirectTo: '/login/portallogin', pathMatch: 'full' },
  { path: 'contactus', component: ContactusComponent },
  {
    path: 'login', component: LoginlayoutComponent,
    children: [
      { path: '', redirectTo: '/login/portallogin', pathMatch: 'full' },
      { path: 'portallogin', component: PortalloginComponent },
     
    ]
  },
  {
    path: '', component: AppLayoutComponent,
    children: [
      {
        path: 'contact', component: ContactComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  declarations: [
    LoginlayoutComponent,
    
    // AppLayoutComponent
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {


}
