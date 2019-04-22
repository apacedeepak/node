import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyperformanceComponent } from './myperformance/myperformance.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { PerformanceoverviewComponent } from './performanceoverview/performanceoverview.component';
import { QuestionsubjectanalysisComponent } from './questionsubjectanalysis/questionsubjectanalysis.component';
import { QuestionwiseanalysisComponent } from './questionwiseanalysis/questionwiseanalysis.component';
import { SubjectwiseperformanceComponent } from './subjectwiseperformance/subjectwiseperformance.component';
import { WeeklytestperformanceComponent } from './weeklytestperformance/weeklytestperformance.component';
const routes: Routes = [
  {
      path: 'report',
      component: AppLayoutComponent,
      children: [
        { path: '', redirectTo: "/report/myperformance",pathMatch:'full'},
        { path: "myperformance", component: MyperformanceComponent },
        { path: "performanceoverview", component: PerformanceoverviewComponent },
        { path: "questionsubjectanalysis", component: QuestionsubjectanalysisComponent},
        { path: "questionwiseanalysis", component: QuestionwiseanalysisComponent },
        { path: "subjectwiseperformance", component: SubjectwiseperformanceComponent },
        { path: "weeklytestperformance", component: WeeklytestperformanceComponent }
      ]
  }
];


@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
 
 
export class ReportRoutingModule { }
