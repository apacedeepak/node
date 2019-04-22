import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { FeedbackformComponent } from './feedbackform/feedbackform.component';
import { StudentfeedbackComponent } from './studentfeedback/studentfeedback.component';
import { AddremarkComponent } from './addremark/addremark.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AddremovebehaviourComponent } from './addremovebehaviour/addremovebehaviour.component';
import { UserfeedbackComponent } from './userfeedback/userfeedback.component';
import { AddfeedbackmasterComponent } from './addfeedbackmaster/addfeedbackmaster.component';
import { UserfeedbackfrequencyComponent } from './userfeedbackfrequency/userfeedbackfrequency.component';
const routes: Routes = [
    {
        path: 'feedback',
        component: AppLayoutComponent,
        children: [
            {
                path: 'main/:subname/:subid/:staffid',
                component: FeedbackformComponent,
                canActivate: [AuthLoginGuard]
                
            },
            {
                path: 'studentfeedback',
                component: StudentfeedbackComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'submitfeedback',
                component: StudentfeedbackComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'addremark/:id',
                component: AddremarkComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'feedback',
                component: FeedbackComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'addremovebehaviour',
                component: AddremovebehaviourComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'userfeedback',
                component: UserfeedbackComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'addfeedbackmaster',
                component: AddfeedbackmasterComponent,
                canActivate: [AuthLoginGuard]
            } ,
            {
                path: 'userfeedbackfrequency',
                component: UserfeedbackfrequencyComponent,
                canActivate: [AuthLoginGuard]
            }                
            
        ]
    }
];
 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackRoutingModule { }
