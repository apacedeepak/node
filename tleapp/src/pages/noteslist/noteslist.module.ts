import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NoteslistPage } from './noteslist';

@NgModule({
  declarations: [
    NoteslistPage,
  ],
  imports: [
    IonicPageModule.forChild(NoteslistPage),
  ],
})
export class NoteslistPageModule {}
