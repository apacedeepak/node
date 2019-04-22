import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItemMasterComponent } from './item-master/item-master.component';
import { RaiserequestComponent } from './raiserequest/raiserequest.component';
import { AppLayoutComponent } from '../app-layout/app-layout.component';
import { AuthLoginGuard } from '../auth-login.guard';
const routes: Routes = [
  {
    path: 'inventory',
    component: AppLayoutComponent,
    children: [
        {   path: '',
            redirectTo:'/inventory/item-master',
            pathMatch:'full'            
        },
        {
            path: 'item-master',
            component: ItemMasterComponent            
        },
        {
            path: 'raiserequest',
            component: RaiserequestComponent            
        },
         
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
