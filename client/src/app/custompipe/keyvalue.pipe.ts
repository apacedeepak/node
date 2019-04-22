import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyvalue'
})
export class KeyvaluePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let res = [];
    for (let key in value) {
      res.push({key: key, value: value[key]})
    }
    return res;
  }

}
