import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppLayoutComponent} from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { RevenueTargetComponent } from './revenue-target/revenue-target.component';
import { RevenueTargetAdminComponent } from './revenue-target-admin/revenue-target-admin.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';

const routes: Routes = [
      { 
        path: 'businessplan', 
        component: AppLayoutComponent,
        children: [
          {path:'',redirectTo:'/businessplan/revenue-target',pathMatch:'full',canActivate: [AuthLoginGuard]},
          {path:'revenue-target',component:RevenueTargetComponent,canActivate: [AuthLoginGuard]},
          {path:'revenue-target-admin',component:RevenueTargetAdminComponent,canActivate: [AuthLoginGuard]},
          {path:'profit-loss',component:ProfitLossComponent,canActivate: [AuthLoginGuard]}
                   
        ]
    },
     
];


                
               

@NgModule({
  declarations: [],
  imports: [
   RouterModule.forChild(routes)
  ],
  exports: [ RouterModule ]
})
export class BusinessplanRoutingModule { }
