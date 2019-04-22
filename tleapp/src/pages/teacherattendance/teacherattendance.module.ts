import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeacherattendancePage } from './teacherattendance';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    TeacherattendancePage,
  ],
  imports: [
  PipesModule,
    IonicPageModule.forChild(TeacherattendancePage),
  ],
})
export class TeacherattendancePageModule {}
