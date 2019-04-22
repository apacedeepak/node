import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NativefeaturePage } from './nativefeature';

@NgModule({
  declarations: [
    NativefeaturePage,
  ],
  imports: [
    IonicPageModule.forChild(NativefeaturePage),
  ],
})
export class NativefeaturePageModule {}
