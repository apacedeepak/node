import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'namefilter'
})
export class NamefilterPipe implements PipeTransform {
  transform(value: any, args: any): any { 
    if(!args) return value;
    let res = [];
    if(typeof value != 'object'){
      return res
    }
      res = value.filter(obj => { 
        if(obj.senderType.toLowerCase() == args.toLowerCase()){ 
          return obj;
        }
      });

    return res;
  }
}
