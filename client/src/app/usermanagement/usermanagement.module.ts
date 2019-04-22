import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from './../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsermanagementRoutingModule } from './usermanagement-routing.module';
import { RoleComponent } from './role/role.component';
import { TreeviewModule } from 'ngx-treeview';
import { MenuassignmentComponent } from './menuassignment/menuassignment.component';

@NgModule({
  declarations: [RoleComponent, MenuassignmentComponent],
  imports: [
    CommonModule,
    UsermanagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TreeviewModule
  ]
})
export class UsermanagementModule { }
