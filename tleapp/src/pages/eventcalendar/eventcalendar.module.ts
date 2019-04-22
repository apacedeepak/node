import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventcalendarPage } from './eventcalendar';
import {NotificationPageModule} from '../../pages/notification/notification.module';

@NgModule({
  declarations: [
    EventcalendarPage,
  ],
  imports: [
    NotificationPageModule,
    IonicPageModule.forChild(EventcalendarPage),
  ],
})
export class EventcalendarPageModule {}
