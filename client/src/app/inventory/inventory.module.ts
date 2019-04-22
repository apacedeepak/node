import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFileModule } from 'ngx-input-file';
import { InventoryRoutingModule } from './inventory-routing.module';
import { ItemMasterComponent } from './item-master/item-master.component';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RaiserequestComponent } from './raiserequest/raiserequest.component';
import { RequestapprovalComponent } from './requestapproval/requestapproval.component';
import { CategorymasterComponent } from './categorymaster/categorymaster.component';
@NgModule({
  declarations: [ItemMasterComponent, RaiserequestComponent, RequestapprovalComponent, CategorymasterComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InputFileModule,
    NgbModule.forRoot(),
  ]
})
export class InventoryModule { }
