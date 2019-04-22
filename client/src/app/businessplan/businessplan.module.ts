import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RevenueTargetComponent } from './revenue-target/revenue-target.component';
import { BusinessplanRoutingModule } from './businessplan-routing.module';
import { RevenueTargetAdminComponent } from './revenue-target-admin/revenue-target-admin.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DirectivesModule } from './../directives/directives.module';



@NgModule({
  declarations: [RevenueTargetComponent, RevenueTargetAdminComponent, ProfitLossComponent],
  imports: [
    CommonModule,
    BusinessplanRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DirectivesModule,
    NgbModule.forRoot()
   
  ]
})
export class BusinessplanModule { }
