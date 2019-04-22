import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autosearch'
})
export class AutosearchPipe implements PipeTransform {

  transform(items: any[], criteria: any): any {

            return items.filter(item => {
               for (let key in item ) {
                 if (('' + item[key]).toLowerCase().includes(criteria)) {
                    return true;
                 }
               }
               return false;
            });
        }

}
