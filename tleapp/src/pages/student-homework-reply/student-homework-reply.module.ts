import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentHomeworkReplyPage } from './student-homework-reply';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    StudentHomeworkReplyPage,
  ],
  imports: [
    IonicPageModule.forChild(StudentHomeworkReplyPage),PipesModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class StudentHomeworkReplyPageModule {}
