import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ErrorModel, CustomErrorModel } from '../Models/ErrorModel';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private ErrorSubject = new Subject<ErrorModel>();
  private CustomErrorSubject = new Subject<CustomErrorModel>();
  errorModel = this.ErrorSubject.asObservable();
  customErrorModel = this.CustomErrorSubject.asObservable();
  constructor() { }
  show() {
    this.ErrorSubject.next(<ErrorModel>{ show: true });
  }
  WebApiCustomErrorShow(status, message) {
    console.log(status);
    this.CustomErrorSubject.next(<CustomErrorModel>{ ErrorStatus: status, ErrorMessage: message });
  }
  customErrorShow(status) {
    this.ErrorSubject.next(<ErrorModel>{ ErrorTypeValue: status });
  }
  hide() {
    this.ErrorSubject.next(<ErrorModel>{ show: false });
  }
}
