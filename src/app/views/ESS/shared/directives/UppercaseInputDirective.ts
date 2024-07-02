import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercaseInput]'
})
export class UppercaseInputDirective {

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    this.ngControl.control.setValue(value, { emitEvent: false });
  }
}