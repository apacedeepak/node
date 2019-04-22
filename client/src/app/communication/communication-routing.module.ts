import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { ComposeComponent } from './compose/compose.component';
import { CommdetailComponent } from './commdetail/commdetail.component';
import { ContacthoComponent } from './contactho/contactho.component';
import { ManagementComponent } from './management/management.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { AnnouncementlistComponent } from './announcementlist/announcementlist.component';


const routes: Routes = [
    {
        path: 'communication',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo:'/communication/main',
                pathMatch:'full',
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'main',
                canActivate: [AuthLoginGuard],
                component: MainComponent
            },
            {
                path: 'management/:type/:flag',
                canActivate: [AuthLoginGuard],
                component: ManagementComponent
            },
            {
                path: 'compose',
                canActivate: [AuthLoginGuard],
                component: ComposeComponent
            },
            {
                path: 'commdetail',
                canActivate: [AuthLoginGuard],
                component: CommdetailComponent
            },
            {
                path: 'contactho',
                canActivate: [AuthLoginGuard],
                component: ContacthoComponent
            },
            {
                path: 'announcement',
                canActivate: [AuthLoginGuard],
                component: AnnouncementComponent
            },
            {
                path: 'announcement/:id',
                canActivate: [AuthLoginGuard],
                component: AnnouncementComponent
            },
            {
                path: 'announcementlist',
                canActivate: [AuthLoginGuard],
                component: AnnouncementlistComponent
            }
        ]
    }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunicationRoutingModule { }
