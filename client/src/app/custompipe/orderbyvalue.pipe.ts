import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderbyvalue'
})
export class OrderbyvaluePipe implements PipeTransform {

  transform(value: any, ordervalue: any, args?: any): any {
    return value.sort(function(a, b){
      a.message_id-b.message_id;

    })
  }

}
