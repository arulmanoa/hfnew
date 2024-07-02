import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appPositiveNumber]'
})
export class PositiveNumberDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    let inputValue: number = +event.target.value; 

    
    if (isNaN(inputValue) || inputValue < 0) {
      this.el.nativeElement.value = ''; 
      event.preventDefault();
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any): void {
    let inputValue: number = +event.target.value; 

    if (inputValue < 0) {
      this.el.nativeElement.value = '';
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const inputValue: string = event.key;

    if (!/^[0-9]$/.test(inputValue) && inputValue != 'Backspace') {
      event.preventDefault();
    }
  }
}