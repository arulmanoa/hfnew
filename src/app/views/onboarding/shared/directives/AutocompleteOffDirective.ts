import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoCompleteOff]'
})
export class AutoCompleteOffDirective implements OnInit {

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    const inputElement = this.elementRef.nativeElement;
    inputElement.autocomplete = 'off';
  }
}