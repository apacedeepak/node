import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudyplanPage } from './studyplan';
import { PipesModule } from '../../pipes/pipes.module';
import {NotificationPageModule} from '../../pages/notification/notification.module';

@NgModule({
  declarations: [
    StudyplanPage,
  ],
  imports: [
  PipesModule,
  NotificationPageModule,
    IonicPageModule.forChild(StudyplanPage),
  ],
})
export class StudyplanPageModule {}
