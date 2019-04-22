import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentHomeworkDetailPage } from './student-homework-detail';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    StudentHomeworkDetailPage,
  ],
  imports: [PipesModule,
    IonicPageModule.forChild(StudentHomeworkDetailPage),
  ],
})
export class StudentHomeworkDetailPageModule {}
