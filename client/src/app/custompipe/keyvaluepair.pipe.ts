import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyvaluepair'
})
export class KeyvaluepairPipe implements PipeTransform {

  transform(value, args: string[]): any {
    const keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }

}
