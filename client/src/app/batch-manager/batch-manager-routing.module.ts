import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppLayoutComponent } from "../app-layout/app-layout.component"
import { BatchManagerComponent } from './batch-manager.component';
import { BatchDateComponent } from './batch-date/batch-date.component';
import { BatchCreateComponent } from './batch-create/batch-create.component';
import { BatchPlanningComponent } from "./batch-planning/batch-planning.component";
import { BatchSummaryReportComponent } from './batch-summary-report/batch-summary-report.component';
import { SyllabusCoverageReportComponent } from './syllabus-coverage-report/syllabus-coverage-report.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { BatchcoordinatorComponent } from './batchcoordinator/batchcoordinator.component';

/**
 * Route constant
 */
const routes: Routes = [
  {
    path: "batch-manager",
    component: AppLayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "/batch-manager/batch-date",
        pathMatch: "full"
      },
      {
        path: "batch-manager",
        component: BatchManagerComponent
      },
      {
        path: "batch-date",
        component: BatchDateComponent
      },
      {
        path: 'batch-create',
        component: BatchCreateComponent
      },
      {
        path: "batch-planning",
        component: BatchPlanningComponent
      },
      {
        path: "batch-summary-report",
        component: BatchSummaryReportComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: "syllabus-coverage-report/:sectionId/:courseModeId/:boardId/:classId/:batchStartDateId",
        component: SyllabusCoverageReportComponent,
        canActivate: [AuthLoginGuard]
      }, {
        path: "batchcoordinator",
        component: BatchcoordinatorComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BatchManagerRoutingModule {}
