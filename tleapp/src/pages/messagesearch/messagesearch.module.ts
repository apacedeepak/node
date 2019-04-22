import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagesearchPage } from './messagesearch';
import { CalendarModule } from "ion2-calendar";
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    MessagesearchPage,
  ],
  imports: [
    IonicPageModule.forChild(MessagesearchPage),
    CalendarModule,
    PipesModule
  ],
})
export class MessagesearchPageModule {}
