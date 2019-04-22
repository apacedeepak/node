import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StudentDashboardPage } from './student-dashboard';
import {NotificationPageModule} from '../../pages/notification/notification.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    StudentDashboardPage,
  ],
  imports: [NotificationPageModule,
    IonicPageModule.forChild(StudentDashboardPage),
    TranslateModule.forChild()
  ],
})
export class StudentDashboardPageModule {}
