import { NgModule } from '@angular/core'; 
import { AuthLoginGuard } from './../auth-login.guard';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import { CoverageComponent } from './../coverage/coverage.component';
import { MainComponent } from './main/main.component';
import { TeacherComponent } from './teacher/teacher.component';
import { InputFileModule } from 'ngx-input-file';
import { StudentComponent } from './student/student.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CoverageRoutingModule} from './coverage-routing.module'

@NgModule({
  imports: [
    CommonModule,
    CustompipeModule,
    CommonlayoutModule,
    InputFileModule,
    SharedModule,
    FormsModule,
    CoverageRoutingModule,
  ],
  declarations: [
    CoverageComponent,
    MainComponent,
    TeacherComponent,
    StudentComponent
  ]
})
export class CoverageModule { }
