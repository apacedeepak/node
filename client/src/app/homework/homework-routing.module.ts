import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { CreatehomeworkComponent } from './createhomework/createhomework.component';
import { HomeworkdetailsComponent } from './homeworkdetails/homeworkdetails.component';
import { ReplyhomeworkComponent } from './replyhomework/replyhomework.component';
import { TeacherdetailComponent } from './teacherdetail/teacherdetail.component';
import { CheckhomeworkComponent } from './checkhomework/checkhomework.component';
import { RemarkhomeworkComponent } from './remarkhomework/remarkhomework.component';
import { TeacherhomeworkdraftComponent } from './teacherhomeworkdraft/teacherhomeworkdraft.component';

const routes: Routes = [
    {
        path: 'homework',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo:'/homework/main',
                pathMatch:'full',
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'main',
                component: MainComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'createhomework',
                component: CreatehomeworkComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'homeworkdetails/:id/:calledfrom',
                component: HomeworkdetailsComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'homeworkdetails/:id/:calledfrom/:studuserid/:through/:studname/:classsec',
                component: HomeworkdetailsComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'replyhomework/:homeId',
                component: ReplyhomeworkComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'teacherdetail/:id',
                component: TeacherdetailComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'checkhomework/:userId/:name/:homeId',
                component: CheckhomeworkComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'remarkhomework/:homeId/:userId/:student',
                component: RemarkhomeworkComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'teacherdraftdetail/:id',
                component: TeacherhomeworkdraftComponent,
                canActivate: [AuthLoginGuard]
            }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeworkRoutingModule { }
