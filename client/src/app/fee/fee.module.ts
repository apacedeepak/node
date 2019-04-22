import { NgModule } from '@angular/core';
import { AuthLoginGuard } from './../auth-login.guard';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FeeComponent } from './fee.component';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import { MainComponent } from './main/main.component';
import { ParentComponent } from './parent/parent.component';
import {CustompipeModule} from './../custompipe/custompipe.module';
import { ManagementComponent } from './management/management.component';
import { FullCalendarModule } from 'ng-fullcalendar';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MiscellaneousComponent } from './miscellaneous/miscellaneous.component';
import { DefaulterComponent } from './defaulter/defaulter.component';
import { SharedModule } from '../shared/shared.module';
import { TermmasterComponent } from './termmaster/termmaster.component';
import { FeeRoutingModule } from './fee-routing.module';
import { FeeheadComponent } from './feehead/feehead.component';
import { AddtermComponent } from './addterm/addterm.component';
import { FeestructureComponent } from './feestructure/feestructure.component';
import { StudentsearchComponent } from './studentsearch/studentsearch.component';
import { PaymentComponent } from './payment/payment.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { PaymentviaregistrationComponent } from './paymentviaregistration/paymentviaregistration.component';
import { DailycollectionreportComponent } from './dailycollectionreport/dailycollectionreport.component';
import { RefundDropoutComponent } from './refund-dropout/refund-dropout.component';
import { RefundRequestListComponent } from './refund-request-list/refund-request-list.component';
import { RefundConfigurationComponent } from './refund-configuration/refund-configuration.component';
import { StudentMigrationComponent } from './student-migration/student-migration.component';
import { CancelInvoiceComponent } from './cancel-invoice/cancel-invoice.component';

 

@NgModule({
  imports: [
  FullCalendarModule,
  FormsModule, 
  ReactiveFormsModule,
    CommonModule,
    CommonlayoutModule,
    SharedModule,
    CustompipeModule,
     NgbModule.forRoot(),
     FeeRoutingModule
  ],
  declarations: [FeeComponent, MainComponent, ParentComponent, ManagementComponent, MiscellaneousComponent, DefaulterComponent, TermmasterComponent,FeeheadComponent, AddtermComponent,FeestructureComponent, StudentsearchComponent, PaymentComponent, ReceiptComponent, PaymentviaregistrationComponent, DailycollectionreportComponent, RefundDropoutComponent, RefundRequestListComponent, RefundConfigurationComponent, StudentMigrationComponent, CancelInvoiceComponent],
  bootstrap: [FeeComponent],
})
export class FeeModule { }
