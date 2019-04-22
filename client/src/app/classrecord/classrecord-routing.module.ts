import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { ViewprofileComponent } from './viewprofile/viewprofile.component';

const routes: Routes = [
    {
        path: 'classrecord',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo:'/classrecord/main',
                pathMatch:'full'
            },
            {
                path: 'main',
                component: MainComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'viewprofile',
                component: ViewprofileComponent,
                canActivate: [AuthLoginGuard]
            }
        ]
    }
];

 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassrecordRoutingModule { }
