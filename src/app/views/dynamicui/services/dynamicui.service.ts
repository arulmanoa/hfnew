import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { appSettings, LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';



export interface VerificatinLogs {
  LogKey: string,
  TenantId: string,
  VisitorRandId: number,
  Xos: string,
  Uid: string,
  Zck: string,
  AuthCode: string,
  channel: string,
  EventCode: string,
  Format: string,
  Token: string,
  Session: string
}


@Injectable({
  providedIn: 'root'
})
export class DynamicuiService {

  httpOptions: any;
  LogFactor = ["Uid", "Xos", "Zck"];
  KeyVectorFactor = ["AuthCode", "Channel", "EventCode", "Format", "LogKey", "TenantId", "Token"];


  constructor(
    private _httpclient: HttpClient,
    private sessionService : SessionStorage
  ) {

    this.httpOptions = {
      headers: new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }),
    };

  }

  SendVerificationOTP(requestURL_params: any): Observable<any> {

    const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_SENDTOP;
    return this._httpclient.post<any>(url, requestURL_params, this.httpOptions)
      .pipe(map(res => res),
        catchError(this.handlepostTokenError));
  }

  VerifyRequestOTP(requestURL_params: any): Observable<any> {

    const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_VERIFYTOP;
    return this._httpclient.post<any>(url, requestURL_params, this.httpOptions)
      .pipe(map(res => res),
        catchError(this.handlepostTokenError));

  }
  private handlepostTokenError(error: HttpErrorResponse) {
    return Observable.throw(error.error);
  }



  DecryptHelper(key: string, vector: string, stringValue: string) {
    console.log('entered ');

    var myStr = stringValue.replace(/"/g, '');

    let reForPlus = /\*/g;
    let reForSlash = /\-/g;
    let charReplacedStringToDecrypt: string = myStr.replace(reForPlus, "+").replace(reForSlash, "/");

    let parsedkey = CryptoJS.enc.Latin1.parse(key);
    let parsedIV = CryptoJS.enc.Latin1.parse(vector);

    var decrypted;
    try {
      decrypted = CryptoJS.AES.decrypt(charReplacedStringToDecrypt, parsedkey, {
        keySize: 128 / 8,
        iv: parsedIV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
    }
    catch (ex) {
      decrypted = null;
    }

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

  }

  EncryptDecryptHelper(verificationLog : VerificatinLogs) {

    if (verificationLog != null) {

      let KeyVectorElementName = this.LogFactor[verificationLog.VisitorRandId];
     
      var digits = verificationLog[KeyVectorElementName].toString().split('').map(Number);
      let KeyElementName = this.KeyVectorFactor[digits[0]];
      let VectorElementName = this.KeyVectorFactor[digits[1]];

      let KeyElementValue = verificationLog[KeyElementName];
      let VectorElementValue = verificationLog[VectorElementName];

      let decryptedText  =  this.DecryptHelper(KeyElementValue, VectorElementValue, verificationLog.Session);
      this.Sessionsubscribtion(decryptedText);
      

    }
  }

  

  Sessionsubscribtion(result: LoginResponses) {

    result.UIRolesCopy = result.UIRoles;
    this.sessionService.setSesstionStorage(SessionKeys.Token, result.Token);
    this.sessionService.setSesstionStorage(SessionKeys.LoginResponses, result);
    sessionStorage.setItem('currentUser', result.UserSession.UserId.toString());


  }

}
