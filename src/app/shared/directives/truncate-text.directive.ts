import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appTruncateText]'
})
export class TruncateTextDirective implements OnChanges {
  @Input() appTruncateText: string = '';
  @Input() maxLength: number = 100;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appTruncateText) {
      this.truncateText();
    }
  }

  private truncateText() {
    const text = this.appTruncateText;
    if (text.length > this.maxLength) {
      const truncatedText = text.substring(0, this.maxLength) + '...';
      this.el.nativeElement.textContent = truncatedText;
    } else {
      this.el.nativeElement.textContent = text;
    }
  }
}
