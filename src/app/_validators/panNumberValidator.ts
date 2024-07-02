import { AbstractControl, ValidatorFn } from "@angular/forms";

export function panNumberValidator(): ValidatorFn {
    return (control:AbstractControl): {[key:string]: any} | null => {
      // if input field is empty return as valid else test
      // let regex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
      // checks for First 5 digits Alphabet + 4th digit should be "P"+ 4 digits from 6th is numeric+last digit is Alphabet.
      let regex = /[a-zA-Z]{3}[pPcCHhaAbBgGlLfFTtjJ]{1}[a-zA-Z]{1}[0-9]{4}[a-zA-Z]{1}$/;
      const ret = (control.value !== '') ? regex.test(control.value) : true;
      console.log('ret0', ret, regex.test(control.value));
      return !ret ? {'invalid': {value: control.value}} : null;
    };
  }