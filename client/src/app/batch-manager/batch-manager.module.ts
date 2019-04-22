import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, ControlValueAccessor } from '@angular/forms';
import { FullCalendarModule } from 'ng-fullcalendar';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BatchDateComponent } from './batch-date/batch-date.component';
import { BatchManagerComponent } from './batch-manager.component';
import { BatchManagerRoutingModule } from './batch-manager-routing.module';
import { BatchCreateComponent } from './batch-create/batch-create.component';
import { SharedModule } from '../shared/shared.module';
import {ChartModule} from 'primeng/chart';
import { BatchPlanningComponent } from './batch-planning/batch-planning.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { BatchSummaryReportComponent } from './batch-summary-report/batch-summary-report.component';
import { SyllabusCoverageReportComponent } from './syllabus-coverage-report/syllabus-coverage-report.component';
import { BatchcoordinatorComponent } from './batchcoordinator/batchcoordinator.component';

@NgModule({
  declarations: [BatchManagerComponent, BatchDateComponent, BatchCreateComponent, BatchPlanningComponent, BatchSummaryReportComponent,BatchcoordinatorComponent, SyllabusCoverageReportComponent],

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    NgbModule.forRoot(),
    BatchManagerRoutingModule,
    SharedModule,
    NgxPaginationModule,
    ChartModule
  ]
})
export class BatchManagerModule {

}
