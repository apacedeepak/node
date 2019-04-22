import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsagetrackerComponent } from './usagetracker.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  bootstrap: [UsagetrackerComponent],
  declarations: [UsagetrackerComponent]
})
export class UsagetrackerModule { }
