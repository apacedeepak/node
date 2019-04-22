import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeworkPage } from './homework';
import { PipesModule } from '../../pipes/pipes.module';
import {NotificationPageModule} from '../../pages/notification/notification.module';
import {SiblingPageModule} from '../../pages/sibling/sibling.module';

@NgModule({
  declarations: [
    HomeworkPage,
  ],
  imports: [NotificationPageModule,
    IonicPageModule.forChild(HomeworkPage),
    PipesModule,
    SiblingPageModule
  ],
})
export class HomeworkPageModule {}
