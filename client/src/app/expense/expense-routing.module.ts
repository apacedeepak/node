import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryComponent } from './category/category.component';
import { ExpenseMasterComponent } from './expense-master/expense-master.component';
import { ImprestRequestComponent } from './imprest-request/imprest-request.component';
import { ImprestApprovalComponent } from './imprest-approval/imprest-approval.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpenseApprovalComponent } from './expense-approval/expense-approval.component';
import { ExpenseReimbursementComponent } from './expense-reimbursement/expense-reimbursement.component';
import { ReimbursementApprovalComponent } from './reimbursement-approval/reimbursement-approval.component';
import { VendorPaymentComponent } from './vendor-payment/vendor-payment.component';
import { VendorPaymentApprovalComponent } from './vendor-payment-approval/vendor-payment-approval.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
const routes: Routes = [
  { 
  path: 'expense',
  component: AppLayoutComponent,
  children: [
      {   path: '',
          redirectTo:'/expense/add-expense',
          pathMatch:'full',
          canActivate: [AuthLoginGuard]          
      },
      {
          path: 'category',
          component: CategoryComponent,
          canActivate: [AuthLoginGuard]            
      },      
      {
        path: 'expense-master',
        component: ExpenseMasterComponent,
        canActivate: [AuthLoginGuard]            
    },
    {
        path: 'imprest-request',
        component: ImprestRequestComponent,
        canActivate: [AuthLoginGuard]           
    },
    {
        path: 'imprest-approval',
        component: ImprestApprovalComponent,
        canActivate: [AuthLoginGuard]           
    },
    {
        path: 'add-expense',
        component: AddExpenseComponent,
        canActivate: [AuthLoginGuard]           
    },
    {
        path: 'expense-approval',
        component: ExpenseApprovalComponent,
        canActivate: [AuthLoginGuard]            
    },
    {
        path: 'expense-reimbursement',
        component: ExpenseReimbursementComponent,
        canActivate: [AuthLoginGuard]          
    },
    {
        path: 'reimbursement-approval',
        component: ReimbursementApprovalComponent,
        canActivate: [AuthLoginGuard]            
    }  ,
    {
        path: 'vendor-payment',
        component: VendorPaymentComponent,
        canActivate: [AuthLoginGuard]            
    },
    {
        path: 'vendor-payment-approval',
        component: VendorPaymentApprovalComponent,
        canActivate: [AuthLoginGuard]            
    }   
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseRoutingModule { }
