import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import {HomeworkModule} from './../homework/homework.module';
import {CommunicationModule} from './../communication/communication.module';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { TeacherComponent } from './teacher/teacher.component';
import { MainComponent } from './main/main.component';
import { StudentComponent } from './student/student.component';
import { ParentComponent } from './parent/parent.component';
import { ManagementComponent } from './management/management.component';
import {CustompipeModule} from './../custompipe/custompipe.module';
import {ChartModule} from 'primeng/chart';
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

//const appRoutes: Routes = [
//
////             {path: 'dashboard',component:DashboardComponent,
////          children:[
////            {path: '',redirectTo:'/dashboard/main',pathMatch:'full'},
////            {path: 'main', component: MainComponent}
////          ]
////         }
//       ];

@NgModule({
  imports: [
    ChartModule,
    CommonModule,
    CommonlayoutModule,
    HomeworkModule,
    ReactiveFormsModule,
    FormsModule,
    CommunicationModule,
    CustompipeModule,
    DashboardRoutingModule,
   NgbModule.forRoot(),
  //  RouterModule.forChild(appRoutes),
   
   SharedModule
  ],
  declarations: [
     DashboardComponent,
    MainComponent,
     TeacherComponent,
      StudentComponent,
       ParentComponent,
       ManagementComponent
      ],
  bootstrap: [DashboardComponent],
  exports:[]
})
export class DashboardModule { }
