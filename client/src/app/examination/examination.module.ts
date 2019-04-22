import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { ExaminationComponent } from './examination.component';
import { MainComponent } from './main/main.component';
import { TeacherComponent } from './teacher/teacher.component';
import { ExaminationRoutingModule } from './examination-routing.module';
 
@NgModule({
  imports: [
    CommonModule,
    CustompipeModule,
    FormsModule,
    ReactiveFormsModule,
  
  ],
  declarations: [ExaminationComponent,
   MainComponent,
    TeacherComponent,
 
     ],
  bootstrap: [ExaminationComponent],
})
export class ExaminationModule { }
