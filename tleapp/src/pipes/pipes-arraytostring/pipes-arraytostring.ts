import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the PipesRemovehtmltagsPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'pipesArraytostring',
})
export class PipesArraytostringPipe implements PipeTransform {

  transform(value, args: string[]): any {
    let name = '';
    for (let key in value) {
      name = name+value[key].name+",";
    }
    return name.substring(0,name.length-1);
  }
}
