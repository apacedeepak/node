import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalPage } from './modal';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ModalPage,
  ],
  imports: [PipesModule,
    IonicPageModule.forChild(ModalPage),
  ],
})
export class ModalPageModule {}
