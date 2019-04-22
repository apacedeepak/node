import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupPage } from './group';
import {NotificationPageModule} from '../../pages/notification/notification.module';

@NgModule({
  declarations: [
    GroupPage,
  ],
  imports: [NotificationPageModule,
    IonicPageModule.forChild(GroupPage),
  ],
})
export class GroupPageModule {}
