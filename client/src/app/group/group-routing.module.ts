import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { GrouplistComponent } from './grouplist/grouplist.component';
import { CreategroupComponent } from './creategroup/creategroup.component';
import { UpdategroupComponent } from './updategroup/updategroup.component';

const routes: Routes = [
    {
        path: 'group',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo:'/group/main',
                pathMatch:'full',
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'main',
                component: MainComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'grouplist',
                component: GrouplistComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'creategroup',
                component: CreategroupComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'updategroup/:Id',
                component: UpdategroupComponent,
                canActivate: [AuthLoginGuard]
            }
        ]
    }
];

 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule { }
