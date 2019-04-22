import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TransferComponent } from './transfer/transfer.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
import { RequestedtransferComponent } from './requestedtransfer/requestedtransfer.component';
import { ForwardtransferComponent } from './forwardtransfer/forwardtransfer.component';
const routes: Routes = [
  {

      path: 'transfer',
      component: AppLayoutComponent,
      children: [
          {   path: '',
              redirectTo:'/transfer/transfer',
              pathMatch:'full',
              canActivate: [AuthLoginGuard]
          },
       
          {   path: 'transfer',
          component: TransferComponent,
          canActivate: [AuthLoginGuard]
      },
      {   path: 'requestedtransfer',
      component: RequestedtransferComponent,
      canActivate: [AuthLoginGuard]
  },
  {   path: 'forwardtransfer',
  component: ForwardtransferComponent,
  canActivate: [AuthLoginGuard]
}
      ]
  },
 
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule, [RouterModule.forChild(routes)],
  ],
  exports: [RouterModule]
})
export class TransferRoutingModule { }
