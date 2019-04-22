import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DatepickercalendarPage } from './datepickercalendar';
import { CalendarModule } from "ion2-calendar";

@NgModule({
  declarations: [
    DatepickercalendarPage,
  ],
  imports: [
  CalendarModule,
    IonicPageModule.forChild(DatepickercalendarPage),
  ],
})
export class DatepickercalendarPageModule {}
