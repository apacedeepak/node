import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the PipesSplitPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'split',
})
export class PipesSplitPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    if(args.length == 0) return
    return value.split(args[0])[args[1]];
  }
}
