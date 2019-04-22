
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {NgModule, ModuleWithProviders} from "@angular/core";
@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    TranslateModule,
  ],
  declarations: []
})
export class SharedModule { 
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
