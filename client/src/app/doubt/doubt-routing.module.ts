import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { DoubtComponent } from "./doubt/doubt.component";

import { AppLayoutComponent } from "../app-layout/app-layout.component";
import { StudentComponent } from "./student/student.component";
import { FacultyComponent } from "./faculty/faculty.component";

/**
 * Route constant
 */
const routes: Routes = [
  {
    path: "doubt",
    component: AppLayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "/doubt/doubt",
        pathMatch: "full"
      },
      {
        path: "doubt",
        component: DoubtComponent
      },
      {
        path: "student",
        component: StudentComponent
      },
      {
        path: "faculty",
        component: FacultyComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoubtRoutingModule {}
