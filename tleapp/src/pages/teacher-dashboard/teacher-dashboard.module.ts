import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeacherDashboardPage } from './teacher-dashboard';
import {NotificationPageModule} from '../../pages/notification/notification.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TeacherDashboardPage,
  ],
  imports: [NotificationPageModule,
    IonicPageModule.forChild(TeacherDashboardPage),
    TranslateModule.forChild()
  ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class TeacherDashboardPageModule {}
