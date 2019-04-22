import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { TeachermarkentryComponent } from './teachermarkentry/teachermarkentry.component';

const routes: Routes = [
    {
        path: 'examination',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo:'/examination/main',
                pathMatch:'full',
                canActivate: [AuthLoginGuard]
            },
            
            {
                path: 'main',
                component: MainComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'markentry',
                component: TeachermarkentryComponent,
                canActivate: [AuthLoginGuard]
            },
           
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExaminationRoutingModule { }
