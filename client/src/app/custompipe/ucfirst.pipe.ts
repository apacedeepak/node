import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ucfirst'
})
export class UcfirstPipe implements PipeTransform {

  transform(str: any): any {
    if(!str) return 
    return str.charAt(0).toUpperCase() + str.slice(1, str.length);
  }

}
