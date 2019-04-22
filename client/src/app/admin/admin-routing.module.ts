import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AdminComponent } from "./admin/admin.component";

import { CreatecenterComponent } from "./createcenter/createcenter.component";
import { CoursemodeComponent } from "./coursemode/coursemode.component";
import { EquipmentmasterComponent } from "./equipmentmaster/equipmentmaster.component";
import { AppLayoutComponent } from "../app-layout/app-layout.component";
import { ClassmasterComponent } from "./classmaster/classmaster.component";
import { DurationComponent } from "./duration/duration.component";
import { CourseassignmentComponent } from "./courseassignment/courseassignment.component";
import { StaffcenterassignmentComponent } from "./staffcenterassignment/staffcenterassignment.component";
import { AcademicSessionComponent } from "./academic-session/academic-session.component";
import { InquiryComponent } from './inquiry/inquiry.component';
import { RegistrationComponent } from './registration/registration.component';
import { CategoryComponent } from './category/category.component';
import { StudentlistComponent } from './studentlist/studentlist.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { StudentdetailsComponent } from './studentdetails/studentdetails.component';
/**
 * Route constant
 */
const routes: Routes = [
  {
    path: "admin",
    component: AppLayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "/admin/admin",
        pathMatch: "full"
      },
      {
        path: "admin",
        component: AdminComponent
      },
      {
        path: "createcenter",
        component: CreatecenterComponent 
      },
      {
        path: "coursemode",
        component: CoursemodeComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: "equipmentmaster",
        component: EquipmentmasterComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: "classmaster",
        component: ClassmasterComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: "duration",
        component: DurationComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: "courseassignment",
        component: CourseassignmentComponent
      },
      {
        path: "staffcenterassignment",
        component: StaffcenterassignmentComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: "academic-session",
        component: AcademicSessionComponent
      }, {
        path: 'inquiry',
        component: InquiryComponent,
        canActivate: [AuthLoginGuard]
      }, {
        path: 'registration',
        component: RegistrationComponent,
        canActivate: [AuthLoginGuard]
      },{
        path: 'category',
        component: CategoryComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: 'studentlist',
        component: StudentlistComponent,
        canActivate: [AuthLoginGuard]
      },
      {
        path: 'studentdetails',
        component: StudentdetailsComponent,
        canActivate: [AuthLoginGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
