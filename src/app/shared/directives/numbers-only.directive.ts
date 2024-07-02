import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Console } from '@angular/core/src/console';

@Directive({
  selector: 'input[numbersOnly]'
})
// DIRECTIVE THAT ACCEPTS ONLY NUMBER ON INPUT FIELD
export class NumberDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value.trim();   
    this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    if ( initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}

// 12 34567 89 012