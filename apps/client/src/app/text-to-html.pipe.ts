import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'textToHtml' })
export class TextToHtmlPipe implements PipeTransform {
  private escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  transform(value: string): number {
    return value ? this.escapeHtml(value).replace(/\n/g, '<br/>') : undefined;
  }
}
