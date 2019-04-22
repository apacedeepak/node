import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, ControlValueAccessor } from '@angular/forms';
import { FullCalendarModule } from 'ng-fullcalendar';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AcademicComponent } from './academic.component';
import { CenterRoomComponent } from './center-room/center-room.component';
import { AcademicRoutingModule } from './academic-routing.module';
import { MicroscheduleComponent } from './microschedule/microschedule.component';
import { TreeviewModule } from 'ngx-treeview';
import { SyllabusListComponent } from './syllabus-list/syllabus-list.component';
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [AcademicComponent, CenterRoomComponent, MicroscheduleComponent, SyllabusListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    AcademicRoutingModule,
    TreeviewModule,
    NgxPaginationModule

  ]
})
export class AcademicModule { }
