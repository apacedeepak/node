import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CustompipeModule} from './../custompipe/custompipe.module';
import {BackendApiService} from './../services/backend-api.service';
import { ReactiveFormsModule, FormsModule,ControlValueAccessor } from '@angular/forms';
import { CommonlayoutModule } from './../commonlayout/commonlayout.module';
import{TransferComponent} from  './transfer/transfer.component';
import { SharedModule } from '../shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { AuthLoginGuard } from './../auth-login.guard';
import { TransferRoutingModule } from './transfer-routing.module';
import { RequestedtransferComponent } from './requestedtransfer/requestedtransfer.component';
import { ForwardtransferComponent } from './forwardtransfer/forwardtransfer.component';
// const appRoutes: Routes = [

//   {path: 'transfer',component:TransferComponent,
// children:[
//   {path: '',redirectTo:'/transfer',pathMatch:'full',canActivate: [AuthLoginGuard]},
 
// ]
// }
// ];
@NgModule({
  imports: [
    CommonModule,CustompipeModule,
    ReactiveFormsModule, FormsModule,
    CommonlayoutModule,
    SharedModule,
    TransferRoutingModule,
    NgbModule.forRoot(),
   // RouterModule.forChild(appRoutes)
  ],
  declarations: [TransferComponent, RequestedtransferComponent, ForwardtransferComponent]
})
export class TransferModule { }
