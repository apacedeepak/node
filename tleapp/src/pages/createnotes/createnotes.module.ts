import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatenotesPage } from './createnotes';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    CreatenotesPage,
  ],
  imports: [
  PipesModule,
    IonicPageModule.forChild(CreatenotesPage),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class CreatenotesPageModule {}
