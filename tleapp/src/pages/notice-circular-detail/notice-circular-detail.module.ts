import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NoticeCircularDetailPage } from './notice-circular-detail';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    NoticeCircularDetailPage
    
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(NoticeCircularDetailPage),
  ],
})
export class NoticeCircularDetailPageModule {}
