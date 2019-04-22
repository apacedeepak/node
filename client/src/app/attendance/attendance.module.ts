import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule, ControlValueAccessor } from '@angular/forms';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceComponent } from './attendance.component';
import { MainComponent } from './main/main.component';
import { TeacherComponent } from './teacher/teacher.component';
import { ParentComponent } from './parent/parent.component';
import { StudentComponent } from './student/student.component';
import { FullCalendarModule } from 'ng-fullcalendar';
import { ManagementComponent } from './management/management.component';
import { SharedModule } from '../shared/shared.module';
import {AttendanceRoutingModule} from './attendance-routing.module'

@NgModule({
  imports: [
    FullCalendarModule,
    CommonModule,
    CommonlayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    CustompipeModule,
    SharedModule,
    AttendanceRoutingModule,
  ],
  declarations: [
    AttendanceComponent,
     MainComponent,
      TeacherComponent,
       ParentComponent,
        StudentComponent,
        ManagementComponent,
        ],

})
export class AttendanceModule { }
