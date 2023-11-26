import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterOutContentField'
})
export class FilterOutContentFieldPipe implements PipeTransform {
  transform(value: any): any {
    if (value && value.data && value.data.Content) {
      // Clone the value and exclude the 'Content' field
      const { data, metadata: {...rest} } = value;
      const { Content, ...restData } = data; 
      return { data: restData, metadata: rest };
    }
    return value;
  }
}