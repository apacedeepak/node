import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
/**
 * Generated class for the PipesRemovehtmltagsPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'pipesRemovehtmltags',
})
export class PipesRemovehtmltagsPipe implements PipeTransform {
  /**
   * Takes a value and remove html tags.
   */
  constructor(private sanitizer: DomSanitizer) {
  }
  transform(value) {
    if(value){
    //   var result = value.replace(/<\/?[^>]+>/gi, ""); //removing html tag using regex pattern
    //  return result;
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
  else{}
  }
}
