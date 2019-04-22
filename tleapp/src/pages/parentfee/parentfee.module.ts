import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParentfeePage } from './parentfee';
import { PipesModule } from '../../pipes/pipes.module';
import {NotificationPageModule} from '../../pages/notification/notification.module';

import {SiblingPageModule} from '../../pages/sibling/sibling.module';
@NgModule({
  declarations: [
    ParentfeePage,
  ],
  imports: [SiblingPageModule,PipesModule,
  NotificationPageModule,
    IonicPageModule.forChild(ParentfeePage),
  ],
})
export class ParentfeePageModule {}
