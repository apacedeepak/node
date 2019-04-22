import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClassrecordComponent } from './classrecord.component';
import { MainComponent } from './main/main.component';
import { TeacherComponent } from './teacher/teacher.component';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { SharedModule } from '../shared/shared.module';
import {ClassrecordRoutingModule} from './classrecord-routing.module'



@NgModule({
  imports: [
    CommonModule,
    CustompipeModule,
    SharedModule,
    ClassrecordRoutingModule
      ],
  declarations: [
        ClassrecordComponent,
        MainComponent,
        TeacherComponent,
    ]
})
export class ClassrecordModule { }
