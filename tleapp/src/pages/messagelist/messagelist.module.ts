import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagelistPage } from './messagelist';
import {NotificationPageModule} from '../../pages/notification/notification.module';
import { PipesModule } from '../../pipes/pipes.module';
import {SiblingPageModule} from '../../pages/sibling/sibling.module';
@NgModule({
  declarations: [
    MessagelistPage
  ],
  imports: [NotificationPageModule,PipesModule,
    SiblingPageModule,
    IonicPageModule.forChild(MessagelistPage),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
})
export class MessagelistPageModule {}
