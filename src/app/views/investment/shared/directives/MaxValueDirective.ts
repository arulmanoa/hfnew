import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMaxValue]'
})
export class MaxValueDirective {
  @Input('appMaxValue') maxValue: number;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const inputValue = event.target.valueAsNumber;

    if (inputValue > this.maxValue) {
      this.el.nativeElement.value = this.maxValue;
      event.preventDefault();
    }
  }
  @HostListener('keypress', ['$event'])
  onKeyPress(event: any): void {
    const inputValue = event.target.valueAsNumber;

    if (inputValue > this.maxValue) {
      this.el.nativeElement.value = this.maxValue;
      event.preventDefault();
    }
  }
}