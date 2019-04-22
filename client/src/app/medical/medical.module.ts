import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { ParentComponent } from './parent/parent.component';
import { MedicalComponent } from './medical.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InputFileModule } from 'ngx-input-file';
import { SharedModule } from '../shared/shared.module';
import { MedicalRoutingModule } from './medical-routing.module';

@NgModule({
  imports: [
    CommonModule,
    CommonModule,
    CommonlayoutModule,
    InputFileModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgbModule.forRoot(),
    MedicalRoutingModule
  ],
  declarations: [MainComponent, ParentComponent, MedicalComponent]
})
export class MedicalModule { }
