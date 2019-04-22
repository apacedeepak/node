import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupStudentListPage } from './group-student-list';
import {NotificationPageModule} from '../../pages/notification/notification.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    GroupStudentListPage,
  ],
  imports: [NotificationPageModule,
    PipesModule,
    IonicPageModule.forChild(GroupStudentListPage),
  ],
})
export class GroupStudentListPageModule {}
