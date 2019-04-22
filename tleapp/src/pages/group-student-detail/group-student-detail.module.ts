import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupStudentDetailPage } from './group-student-detail';
import { PipesModule } from '../../pipes/pipes.module';
@NgModule({
  declarations: [
    GroupStudentDetailPage,
  ],
  imports: [PipesModule,
    IonicPageModule.forChild(GroupStudentDetailPage),
  ],
})
export class GroupStudentDetailPageModule {}
