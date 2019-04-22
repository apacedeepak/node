import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotesrecepientPage } from './notesrecepient';
import { NgHttpLoaderModule } from 'ng-http-loader/ng-http-loader.module'

@NgModule({
  declarations: [
    NotesrecepientPage,
  ],
  imports: [
  NgHttpLoaderModule,
    IonicPageModule.forChild(NotesrecepientPage),
  ],
})
export class NotesrecepientPageModule {}
