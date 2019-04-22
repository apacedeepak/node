import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParentDashboardPage } from './parent-dashboard';
import {NotificationPageModule} from '../../pages/notification/notification.module';
import {SiblingPageModule} from '../../pages/sibling/sibling.module';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    ParentDashboardPage,
  ],
  imports: [NotificationPageModule,
          SiblingPageModule,
    IonicPageModule.forChild(ParentDashboardPage),
    TranslateModule.forChild()
  ],
})
export class ParentDashboardPageModule {}
