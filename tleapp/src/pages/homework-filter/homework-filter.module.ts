import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeworkFilterPage } from './homework-filter';

@NgModule({
  declarations: [
    HomeworkFilterPage,
  ],
  imports: [
    IonicPageModule.forChild(HomeworkFilterPage),
  ],
})
export class HomeworkFilterPageModule {}
