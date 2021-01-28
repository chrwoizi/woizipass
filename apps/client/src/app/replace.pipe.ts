import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {
  transform(value: string, a: RegExp, b: string): string {
    return value ? value.replace(new RegExp(a, 'g'), b) : undefined;
  }
}
