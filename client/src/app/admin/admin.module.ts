import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFileModule } from 'ngx-input-file';
import { SharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin/admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { CreatecenterComponent } from './createcenter/createcenter.component';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { CoursemodeComponent } from './coursemode/coursemode.component';
import { EquipmentmasterComponent } from './equipmentmaster/equipmentmaster.component';
import { ClassmasterComponent } from './classmaster/classmaster.component';
import { DurationComponent } from './duration/duration.component';
import { CourseassignmentComponent } from './courseassignment/courseassignment.component';
import { StaffcenterassignmentComponent } from './staffcenterassignment/staffcenterassignment.component';

import { AcademicSessionComponent } from './academic-session/academic-session.component';
import { FullCalendarModule } from 'ng-fullcalendar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InquiryComponent } from './inquiry/inquiry.component';
import { RegistrationComponent } from './registration/registration.component';
import { CategoryComponent } from './category/category.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { StudentlistComponent } from './studentlist/studentlist.component';
import { StudentdetailsComponent } from './studentdetails/studentdetails.component';


@NgModule({
  declarations: [AdminComponent, CreatecenterComponent, CoursemodeComponent, EquipmentmasterComponent, DurationComponent, ClassmasterComponent, AcademicSessionComponent, CourseassignmentComponent, StaffcenterassignmentComponent, InquiryComponent, RegistrationComponent, CategoryComponent, StudentlistComponent, StudentdetailsComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    InputFileModule,
    NgbModule.forRoot(),
    FullCalendarModule,
    NgxPaginationModule
    
  ]
})
export class AdminModule { }
