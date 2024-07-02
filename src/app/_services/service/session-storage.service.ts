// import { Injectable } from '@angular/core';
// import { SessionStorageService } from 'ngx-webstorage';

// import * as CryptoJS from 'crypto-js';

// import { LoginSessionDetails } from '../../components/Models/LoginSessionDetails';
// import { SessionKeys } from '../../configs/app.config';


import { Injectable } from '@angular/core';
import { SessionStorageService } from 'ngx-webstorage';
import * as CryptoJS from 'crypto-js';

//model
// import { LoginSessionDetails } from '../models/Common/';
import { SessionKeys } from '../configs/app.config'; // app config 
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionStorage {

  private storageSub= new Subject<String>();

  EncrpytKey = '7061737323313233';

  constructor(
    private sessionStorageService: SessionStorageService
  ) {

  }

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  setItem(key: string, data: any) {
    sessionStorage.setItem(key, data);
    this.storageSub.next( sessionStorage.getItem('isEmployee'));
  }

  removeItem(key) {
    sessionStorage.removeItem(key);
    this.storageSub.next(sessionStorage.getItem('isEmployee'));
  }




  setSesstionStorage(key, value) {
    let ciphertext;

    if (this.toJson(value)) {

      ciphertext = CryptoJS.AES.encrypt(JSON.stringify(value), this.EncrpytKey);
    } else {

      ciphertext = CryptoJS.AES.encrypt(value.toString(), this.EncrpytKey);
    }
    this.sessionStorageService.store(key, ciphertext.toString());

  }

  getSessionStorage(key) {

    let decryptedData = null;
    let bytes;

    const value = this.sessionStorageService.retrieve(key);
    if (value != null) {
      if (this.toJson(value)) {
        bytes = CryptoJS.AES.decrypt(value.toString(), this.EncrpytKey);
        decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      } else {
        bytes = CryptoJS.AES.decrypt(value.toString(), this.EncrpytKey);
        decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      }
    }
    return decryptedData;
  }

  delSessionStorage(key) {

    this.sessionStorageService.clear(key);

  }

  clearSessionStorage() {

    this.sessionStorageService.clear();
  }


  toJson(item) {
    item = typeof item !== 'string'
      ? JSON.stringify(item)
      : item;

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === 'object' && item !== null) {
      return true;
    }

    return false;
  }


  // getLoginSessionDetailsValues(): LoginSessionDetails {
  //   return JSON.parse(this.getSessionStorage(SessionKeys.LoginResponses));

  // }

}
