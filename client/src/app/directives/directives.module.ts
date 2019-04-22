import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectivesRoutingModule } from './directives-routing.module';
import { NumbersOnlyDirective } from './numbers-only.directive';

@NgModule({
  declarations: [NumbersOnlyDirective],
  imports: [
    CommonModule,
    DirectivesRoutingModule
  ],
  exports: [NumbersOnlyDirective]
})
export class DirectivesModule { }
