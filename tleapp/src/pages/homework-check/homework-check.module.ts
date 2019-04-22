import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeworkCheckPage } from './homework-check';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    HomeworkCheckPage,
  ],
  imports: [
    IonicPageModule.forChild(HomeworkCheckPage),
    PipesModule
  ],
})
export class HomeworkCheckPageModule {}
