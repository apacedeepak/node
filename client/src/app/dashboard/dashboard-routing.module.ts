import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';

const routes: Routes = [
    {
        path: 'dashboard',
        component: AppLayoutComponent,
        children: [
            {   path: '',
                redirectTo:'/dashboard/main',
                pathMatch:'full',
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'main',
                component: MainComponent,
                canActivate: [AuthLoginGuard]
            },
             
        ]
    }
];
 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
