import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutocompleteOff]'
})
export class AutocompleteOffDirective implements OnInit {

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    const inputElement = this.elementRef.nativeElement;
    inputElement.autocomplete = 'off';
  }
}