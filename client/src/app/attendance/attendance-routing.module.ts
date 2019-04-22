import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AttendanceComponent } from './attendance.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { FullcalendarComponent } from './fullcalendar/fullcalendar.component';
import { TakeattendanceComponent } from './takeattendance/takeattendance.component';
import { BatchattendanceComponent } from './batchattendance/batchattendance.component';
import { ViewallComponent } from './viewall/viewall.component';
import { StaffattendanceComponent } from './staffattendance/staffattendance.component';
import { ApplyleaveComponent } from './applyleave/applyleave.component';
import { ApplyleavestatusComponent } from './applyleavestatus/applyleavestatus.component';

const routes: Routes = [
    {
        path: 'attendance',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: '/attendance/main',
                pathMatch: 'full',
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'main',
                component: MainComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'detail',
                component: MainComponent
            },
            {
                path: 'subjectwiseattendance',
                component: FullcalendarComponent,
                canActivate: [AuthLoginGuard]
            },
            {
              path: 'takeattendance', 
              component: TakeattendanceComponent, 
              canActivate: [AuthLoginGuard] 
            },
            {
              path: 'batchattendance',
              component: BatchattendanceComponent,
              canActivate: [AuthLoginGuard] 
            },
            {
              path: 'viewall', 
              component: ViewallComponent, 
              canActivate: [AuthLoginGuard]
            },
            {
              path: 'staffattendance', 
              component: StaffattendanceComponent,
              canActivate: [AuthLoginGuard] 
            },
            {
                 path: 'applyleave',
                 component: ApplyleaveComponent,
                 canActivate: [AuthLoginGuard] 
            },
            { 
                path: 'applyleavestatus', 
                component: ApplyleavestatusComponent, 
                canActivate: [AuthLoginGuard] 
            },
        ]
    }

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AttendanceRoutingModule { }
