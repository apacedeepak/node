import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateHomeworkPage } from './create-homework';
import { PipesModule } from '../../pipes/pipes.module';
@NgModule({
  declarations: [
    CreateHomeworkPage,
  ],
  imports: [PipesModule,
    IonicPageModule.forChild(CreateHomeworkPage),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateHomeworkPageModule {}
