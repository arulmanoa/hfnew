import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUpperCaseInput]'
})
export class UpperCaseInputDirective {

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    this.ngControl.control.setValue(value, { emitEvent: false });
  }
}