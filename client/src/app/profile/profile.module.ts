import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import {CustompipeModule} from './../custompipe/custompipe.module';
import {BackendApiService} from './../services/backend-api.service';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';

import { MainComponent } from './main/main.component';
import { ProfileComponent } from './profile.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { TeacherComponent } from './teacher/teacher.component';
import { StudentComponent } from './student/student.component';
import { ParentComponent } from './parent/parent.component';
import { ManagementComponent } from './management/management.component';
import { SharedModule } from '../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
 
@NgModule({
  imports: [
    CommonModule,CustompipeModule,
    ReactiveFormsModule, FormsModule,
    CommonlayoutModule,
    SharedModule,
    NgbModule.forRoot(),
    ProfileRoutingModule
  ],
  declarations: [ProfileComponent,MainComponent, TeacherComponent, StudentComponent, ParentComponent, ManagementComponent]
})
export class ProfileModule { }
