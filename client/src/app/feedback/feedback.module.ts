import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFileModule } from 'ngx-input-file';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackComponent } from './feedback.component';
import { FeedbackRoutingModule } from './feedback-routing.module';
import { UserfeedbackComponent } from './userfeedback/userfeedback.component';
import { AddfeedbackmasterComponent } from './addfeedbackmaster/addfeedbackmaster.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { UserfeedbackfrequencyComponent } from './userfeedbackfrequency/userfeedbackfrequency.component';
import { DirectivesModule } from './../directives/directives.module';
@NgModule({
  imports: [
    CommonModule,
    CommonlayoutModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CustompipeModule,
    InputFileModule,
    NgbModule.forRoot(),
    FeedbackRoutingModule,
    NgxPaginationModule,
    DirectivesModule
  ],
  declarations: [
       FeedbackComponent,
       UserfeedbackComponent,
       AddfeedbackmasterComponent,
       UserfeedbackfrequencyComponent,
       ],
  bootstrap: [FeedbackComponent],
})
export class FeedbackModule { }
