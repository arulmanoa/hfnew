import { Injectable } from '@angular/core';

import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { AccountService } from '../_services/service/account.service'; 
import { BrandService } from '../_services/service/brand.service'; 
@Injectable({ providedIn: 'root' })
export class UsernameValidator {

  debouncer: any;

  constructor(
    private _accountService: AccountService, 

    private _brandService: BrandService, 
  ) {
  }


  
  // existBrand(identity: number): AsyncValidatorFn {
  //   return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
  //     return this._brandService.exist(identity, encodeURIComponent(control.value))
  //       .pipe(
  //         map(res => {
  //           if (res) {
  //             return { 'BrandInUse': true };
  //           }
  //         })
  //       );
  //   };
  // } 


}