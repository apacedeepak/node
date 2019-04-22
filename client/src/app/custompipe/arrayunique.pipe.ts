import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayunique'
})
export class ArrayuniquePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.reduce((acc, value) => !acc.includes(value) ? acc.concat(value) : acc, []).join(',');
  }

}
