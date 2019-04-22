import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecepientpopupPage } from './recepientpopup';
import { NgHttpLoaderModule } from 'ng-http-loader/ng-http-loader.module'

@NgModule({
  declarations: [
    RecepientpopupPage,
  ],
  imports: [
  NgHttpLoaderModule,
    IonicPageModule.forChild(RecepientpopupPage),
  ],
  
})
export class RecepientpopupPageModule {}
