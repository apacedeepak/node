import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { ImprestComponent } from './imprest/imprest.component';
import { AddtermComponent } from './addterm/addterm.component';
import { TermmasterComponent } from './termmaster/termmaster.component';
import { FeestructureComponent } from './feestructure/feestructure.component';
import { FeeheadComponent } from './feehead/feehead.component';
import { PaymentComponent } from './payment/payment.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { StudentsearchComponent } from './studentsearch/studentsearch.component';
import { DailycollectionreportComponent } from './dailycollectionreport/dailycollectionreport.component';
import { PaymentviaregistrationComponent } from './paymentviaregistration/paymentviaregistration.component';
import { RefundDropoutComponent } from './refund-dropout/refund-dropout.component';
import { RefundRequestListComponent } from './refund-request-list/refund-request-list.component';
import { RefundConfigurationComponent } from './refund-configuration/refund-configuration.component';
import { StudentMigrationComponent } from './student-migration/student-migration.component';
import { CancelInvoiceComponent } from './cancel-invoice/cancel-invoice.component';
const routes: Routes = [
    {
        path: 'fee',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                redirectTo:'/fee/main',
                pathMatch:'full',
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'main',
                component: MainComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'imprest',
                component: ImprestComponent,
                canActivate: [AuthLoginGuard]
            }, {
                path: 'addterm',
                component: AddtermComponent,
                canActivate: [AuthLoginGuard]
            }, {
                path: 'termmaster',
                component: TermmasterComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'feestructure',
                component: FeestructureComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'feehead',
                component: FeeheadComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                
                path: 'payment/:id',
                component: PaymentComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'studentsearch',
                component: StudentsearchComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                
                path: 'receipt/:id',
                component: ReceiptComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                
                path: 'paymentviaregistration/:id',
                component: PaymentviaregistrationComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'dailycollectionreport',
                component: DailycollectionreportComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'refund-dropout',
                component: RefundDropoutComponent,
                canActivate: [AuthLoginGuard]
            },

            {
                path: 'refund-request-list',
                component: RefundRequestListComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'refund-configuration',
                component: RefundConfigurationComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'student-migration',
                component: StudentMigrationComponent,
                canActivate: [AuthLoginGuard]
            },
            {
                path: 'cancel-invoice',
                component: CancelInvoiceComponent,
                canActivate: [AuthLoginGuard]
            }
            
        ]
    }
];
 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeRoutingModule { }
