import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitPipe } from './split.pipe';
import { ArrayuniquePipe } from './arrayunique.pipe';
import { OrderbyvaluePipe } from './orderbyvalue.pipe';
import { KeyvaluepairPipe } from './keyvaluepair.pipe';
import { AutosearchPipe } from './autosearch.pipe';
import { NamefilterPipe } from './namefilter.pipe';
import { KeyvaluePipe } from './keyvalue.pipe';
import { UcfirstPipe } from './ucfirst.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SplitPipe, ArrayuniquePipe, OrderbyvaluePipe, KeyvaluepairPipe, AutosearchPipe, NamefilterPipe, KeyvaluePipe, UcfirstPipe],
  exports: [SplitPipe, ArrayuniquePipe, OrderbyvaluePipe, KeyvaluepairPipe, AutosearchPipe, NamefilterPipe, KeyvaluePipe, UcfirstPipe]
})
export class CustompipeModule { }
