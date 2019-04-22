import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFileModule } from 'ngx-input-file';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { ExpenseRoutingModule } from './expense-routing.module';
import { CategoryComponent } from './category/category.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpenseMasterComponent } from './expense-master/expense-master.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ImprestRequestComponent } from './imprest-request/imprest-request.component';
import { ImprestApprovalComponent } from './imprest-approval/imprest-approval.component';
import { ExpenseApprovalComponent } from './expense-approval/expense-approval.component';

import { ExpenseReimbursementComponent } from './expense-reimbursement/expense-reimbursement.component';
import { ReimbursementApprovalComponent } from './reimbursement-approval/reimbursement-approval.component';
import { VendorPaymentComponent } from './vendor-payment/vendor-payment.component';
import { VendorPaymentApprovalComponent } from './vendor-payment-approval/vendor-payment-approval.component';
import { DirectivesModule } from './../directives/directives.module';
import {NgxPaginationModule} from 'ngx-pagination';
@NgModule({
  declarations: [CategoryComponent, AddExpenseComponent, ExpenseMasterComponent, ImprestRequestComponent, ImprestApprovalComponent, ExpenseApprovalComponent, ExpenseReimbursementComponent, ReimbursementApprovalComponent, VendorPaymentComponent, VendorPaymentApprovalComponent],
  imports: [
    CommonModule,
    ExpenseRoutingModule,
    FormsModule,
    DirectivesModule,
    ReactiveFormsModule,
    InputFileModule,
    NgbModule.forRoot(),
    NgxPaginationModule
  ]
})
export class ExpenseModule { }
