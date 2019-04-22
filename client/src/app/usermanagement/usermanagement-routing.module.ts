import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthLoginGuard } from '../auth-login.guard';
import {AppLayoutComponent} from '../app-layout/app-layout.component';
import { RoleComponent } from './role/role.component';
import { MenuassignmentComponent } from './menuassignment/menuassignment.component';


/**
 * Route constant
 */
const routes: Routes = [
  {
    path: "usermanagement",
    component: AppLayoutComponent,
    children: [
      { path:'',redirectTo:'/usermanagement/role',pathMatch:'full',canActivate: [AuthLoginGuard] },
      { path:'role',component:RoleComponent,canActivate: [AuthLoginGuard] },
      { path:'menuassignment',component:MenuassignmentComponent,canActivate: [AuthLoginGuard] },  
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsermanagementRoutingModule { }
