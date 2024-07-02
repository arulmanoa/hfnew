import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'category'
})
export class CategoryPipe implements PipeTransform {
    transform(items: Array<any>, category: string): Array<any> {
        return items.filter(item => item.ProcessCategory === category);
    }
}