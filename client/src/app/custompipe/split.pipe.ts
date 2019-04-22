import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

   transform(value: any, separator: string, index: number, args?: any): any {
    return value.split(separator)[index];
  }

}
