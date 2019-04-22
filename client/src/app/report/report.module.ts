import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { MyperformanceComponent } from './myperformance/myperformance.component';
import { ReportComponent } from './report.component';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { SubjectwiseperformanceComponent } from './subjectwiseperformance/subjectwiseperformance.component';
import { QuestionwiseanalysisComponent } from './questionwiseanalysis/questionwiseanalysis.component';
import { QuestionsubjectanalysisComponent } from './questionsubjectanalysis/questionsubjectanalysis.component';
import { WeeklytestperformanceComponent } from './weeklytestperformance/weeklytestperformance.component';
import {ChartModule} from 'primeng/chart';
import { PerformanceoverviewComponent } from './performanceoverview/performanceoverview.component';

@NgModule({
  imports: [
    CommonModule,
    ReportRoutingModule,
    CommonlayoutModule,
    NgbModule.forRoot(),
    ChartModule,
  ],
  declarations: [ReportComponent, MyperformanceComponent, SubjectwiseperformanceComponent, QuestionwiseanalysisComponent, QuestionsubjectanalysisComponent, WeeklytestperformanceComponent, PerformanceoverviewComponent],
  bootstrap: [ReportComponent],
})
export class ReportModule { }
