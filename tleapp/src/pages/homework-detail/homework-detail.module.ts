import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeworkDetailPage } from './homework-detail';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    HomeworkDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(HomeworkDetailPage),
    PipesModule
  ],
})
export class HomeworkDetailPageModule {}
