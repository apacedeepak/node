import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AcademicComponent } from './academic.component';
import { CenterRoomComponent } from './center-room/center-room.component';
import { MicroscheduleComponent } from './microschedule/microschedule.component';

const routes: Routes = [
  {
    path: 'academic', component: AppLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/academic/microschedule',
        pathMatch: 'full'
      },
      {
        path: 'academic',
        component: AcademicComponent
      },
      {
        path: 'center-room',
        component: CenterRoomComponent
      },
      {
        path: 'microschedule',
        component: MicroscheduleComponent
      },
      {
        path: 'view-syllabus/:id',
        component: MicroscheduleComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AcademicRoutingModule { }
