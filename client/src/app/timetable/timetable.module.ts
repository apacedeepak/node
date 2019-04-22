import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TimetableComponent } from './timetable.component';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import { MainComponent } from './main/main.component';
import { TeacherComponent } from './teacher/teacher.component';
import { FullCalendarModule } from 'ng-fullcalendar';
import { StudentComponent } from './student/student.component';
import { ParentComponent } from './parent/parent.component';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { SharedModule } from '../shared/shared.module';
import { TimetableRoutingModule } from './timetable-routing.module';

 

@NgModule({
  imports: [
    CommonModule,
    CommonlayoutModule,
    FullCalendarModule,
    CustompipeModule,
    SharedModule,
    ReactiveFormsModule,
    TimetableRoutingModule
  ],
  declarations: [TimetableComponent, MainComponent, TeacherComponent, StudentComponent, ParentComponent]
})
export class TimetableModule { }
