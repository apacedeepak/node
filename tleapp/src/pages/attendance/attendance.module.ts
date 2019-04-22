import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AttendancePage } from './attendance';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    AttendancePage,
  ],
  imports: [
  PipesModule,
    IonicPageModule.forChild(AttendancePage),
  ],
})
export class AttendancePageModule {}
