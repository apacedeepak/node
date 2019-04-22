import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the SeparatorPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'separator',
})
export class SeparatorPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
   transform(value: any, separator: string, index: number, args?: any): any {
    return value.split(separator)[index];
  }
}
