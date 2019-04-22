import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { GroupComponent } from './group.component';
import { TeacherComponent } from './teacher/teacher.component';
import {BackendApiService} from './../services/backend-api.service';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxEditorModule } from 'ngx-editor';
import { InputFileModule } from 'ngx-input-file';
import { MainComponent } from './main/main.component';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { GrouplistComponent } from './grouplist/grouplist.component';
import { SharedModule } from '../shared/shared.module';
import { GroupRoutingModule } from './group-routing.module';

@NgModule({
  imports: [
    CommonModule,
    CommonlayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEditorModule,
    InputFileModule,
    CustompipeModule,
    SharedModule,
    NgbModule.forRoot(),
    GroupRoutingModule
  ],
  providers: [BackendApiService],
  declarations: [
    GroupComponent,
    TeacherComponent,
   GrouplistComponent,
    MainComponent,
    //  CreategroupComponent,
     // UpdategroupComponent
    ],
  bootstrap: [GroupComponent],
  exports :[]
})
export class GroupModule {GrouplistComponent}
