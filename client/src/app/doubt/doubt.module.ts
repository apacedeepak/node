import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InputFileModule } from "ngx-input-file";
import { SharedModule } from "../shared/shared.module";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { FullCalendarModule } from "ng-fullcalendar";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StudentComponent } from "./student/student.component";
import { DoubtComponent } from "./doubt/doubt.component";
import { DoubtRoutingModule } from "./doubt-routing.module";
import { FacultyComponent } from "./faculty/faculty.component";
import {NgxPaginationModule} from 'ngx-pagination';


@NgModule({
  declarations: [
    DoubtComponent,
    DoubtComponent,
    StudentComponent,
    FacultyComponent
  ],
  imports: [
    CommonModule,
    DoubtRoutingModule,
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
export class DoubtModule {}
