import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeacherHomeworkDetailPage } from './teacher-homework-detail';

@NgModule({
  declarations: [
    TeacherHomeworkDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(TeacherHomeworkDetailPage),
  ],
})
export class TeacherHomeworkDetailPageModule {}
