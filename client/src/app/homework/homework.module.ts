import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import {BackendApiService} from './../services/backend-api.service';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import {CustompipeModule} from './../custompipe/custompipe.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeworkComponent } from './homework.component';
import { MainComponent } from './main/main.component';
import { TeacherComponent } from './teacher/teacher.component';
import { RouterModule, Routes } from '@angular/router';
import { StudentComponent } from './student/student.component';
import { ParentComponent } from './parent/parent.component';
import { NgxEditorModule } from 'ngx-editor';
import { InputFileModule } from 'ngx-input-file';
import { HomeworklistComponent } from './homeworklist/homeworklist.component';
import { SharedModule } from '../shared/shared.module';
import { HomeworkRoutingModule } from './homework-routing.module';
 

@NgModule({
  imports: [
    CommonModule,
    CustompipeModule,
    CommonlayoutModule,
    SharedModule,
    NgxEditorModule,
    InputFileModule,FormsModule, ReactiveFormsModule,
    NgbModule.forRoot(),
    HomeworkRoutingModule
  ],
  declarations: [
    HomeworkComponent,
     MainComponent,
      TeacherComponent,
       StudentComponent,
        ParentComponent,
      HomeworklistComponent,
      ],
  bootstrap: [HomeworkComponent],
  exports: [HomeworklistComponent]
})
export class HomeworkModule { }
