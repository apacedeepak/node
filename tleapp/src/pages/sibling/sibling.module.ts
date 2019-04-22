import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SiblingPage } from './sibling';

@NgModule({
  declarations: [
    SiblingPage,
  ],
  imports: [
    IonicPageModule.forChild(SiblingPage),
  ],
  exports :[SiblingPage]
})
export class SiblingPageModule {}
