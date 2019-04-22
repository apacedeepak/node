import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComposePage } from './compose';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ComposePage,
  ],
  imports: [
  FormsModule,
  ReactiveFormsModule,
  PipesModule,
  IonicPageModule.forChild(ComposePage),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class ComposePageModule {}
