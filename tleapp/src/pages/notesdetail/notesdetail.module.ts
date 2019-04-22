import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotesdetailPage } from './notesdetail';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    NotesdetailPage,
  ],
  imports: [
  PipesModule,
    IonicPageModule.forChild(NotesdetailPage),
  ],
})
export class NotesdetailPageModule {}
