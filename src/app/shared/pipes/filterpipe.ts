import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'filter_custom'})
export class FilterCustomPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (!args) {
          return value;
        }
        return value.filter((val) => {
          let rVal = (val.Name.toLocaleLowerCase().includes(args));
          return rVal;
        })
    
      }
}