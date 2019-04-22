import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagedetailsPage } from './messagedetails';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    MessagedetailsPage,
    
  ],
  imports: [PipesModule,
    IonicPageModule.forChild(MessagedetailsPage),
  ],
})
export class MessagedetailsPageModule {}
