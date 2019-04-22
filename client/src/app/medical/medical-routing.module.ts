import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';

const routes: Routes = [
    {
        path: 'medical',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo:'/medical/main',
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
export class MedicalRoutingModule { }
