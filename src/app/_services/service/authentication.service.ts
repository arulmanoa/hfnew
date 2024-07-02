// import { Injectable } from '@angular/core';
// import { AuthService } from "angularx-social-login";
// import { EndPointModel } from '../../_services//model/ConfigModel';
// import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
// import { Observable, of, Subject } from 'rxjs';
// import { map, catchError, tap } from 'rxjs/operators';
// import { SessionKeys } from '../../configs/app.config';
// import { environment.environment } from "../../../environment.environments/environment.environment";
// import { SessionStorage } from '../utils/session-storage.service';
// import { appSettings } from '../../configs/app-settings.config';
// import { ForgotPassword } from 'src/app/components/Models/login-credential';

import { Injectable } from '@angular/core';
import { AuthService } from "angularx-social-login";
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
//services 
import { SessionStorage } from '../service/session-storage.service';
//models 
import { environment } from "../../../environments/environment";
import { appSettings, ForgotPassword, } from '../../_services/model/index';
import { SessionKeys ,VerificatinLogs } from '../configs/app.config'; // app config  
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { apiResult } from 'src/app/_services/model/apiResult';
import { EncrDecrService } from './encr-decr.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    httpOptions: any;
    httpOptions2: any;
    tokenHttpOptions: any;

    HFK = "zvj51koevcsjujj6";
    HFV = "t873mpnx8x3wo464";
    LogFactor = ["Uid", "Xos", "Zck"];
    KeyVectorFactor = ["AuthCode", "Channel", "EventCode", "Format", "LogKey", "TenantId", "Token"];
    constructor(
        private _httpclient: HttpClient,
        private _sessionStoreage: SessionStorage,
        private googleService: AuthService,
        private cookieService: CookieService,
        private session: SessionStorage,
        private encryptDecryptService : EncrDecrService

    ) {


        this.httpOptions = {
            headers: new HttpHeaders({
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }),
        };



    }



    /** 
    * Authenticates the user.
    * @param context The login parameters.
    * @return The user credentials.
    */

    login(credentials: any): Observable<any> {


        // const options = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };

        // let apiEndpoints: EndPointModel;
        // apiEndpoints = (<EndPointModel>JSON.parse(this._sessionStoreage.getSessionStorage(SessionKeys.Api_endpoints)));
        // const url = apiEndpoints.BASE_URL + apiEndpoints.BASE_GETTOKEN_ENDPOINT;

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_AUTHENTICATION;
        // return this._httpclient.post<any>(url, credentials, this.httpOptions)
        //     .pipe(map(res => res),
        //         catchError(this.handlepostTokenError));

                return this._httpclient.post<any>(url, credentials, this.httpOptions).pipe(
                  tap(_ => console.log(`**API REQUEST `)),
                  map((x: any) => {
                    var apiR: apiResult = {
                      Result : x['Result'],
                      Message : x.Message,
                      Status: x.Status
                    }

                    if(x['Status'] && x['Result']){
                    var decryptedResult = this.DecryptResponseByAES(x['Result']);
                    console.log('**API RESPONSE  :: ', decryptedResult);
                    //                   this.callbackSubscribe(this.DecryptResponseByAES(x['Result']));
                                             
                      apiR.Result =  decryptedResult as any
                  }
                        
                    return apiR;
                   
                  }),
                  catchError(this.handleError<any>('::::::::: API ERROR STATUS ::::::::::'))
                );

    }

   
    isAuthenticated(): boolean {
        return true;       
    }

    logout(): Observable<any> {

        let _httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }).append('Token',
                this._sessionStoreage.getSessionStorage(SessionKeys.Token) == null ? "0xAAE559341E96993160011A8AF4A1824202F0F47FF1AF528517B2185FFA91615B6221A3E9AA24B290BA960BA14CD65C6A92D1" : this._sessionStoreage.getSessionStorage(SessionKeys.Token))
        };
        // Customize session storage cleared here
        this.cookieService.getAll();
        sessionStorage.removeItem("SearchPanel");
        sessionStorage.clear();
        this._sessionStoreage.clearSessionStorage();

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_LOGOUT;
        return this._httpclient.post(url, "", _httpOptions).pipe(
            tap(_ => console.log(`INSERT DONE`)),
            catchError(this.handleError<any>('INSERT ERROR'))
        );
    }

    private handlepostTokenError(error: HttpErrorResponse) {
        console.log(error)
        return Observable.throw(error.error);
    }

    getRoleIds(): Observable<any> {
        return of('assets/config.json');
    }

    get(): Observable<any> {
        return this._httpclient.get('assets/config.json').pipe(
            map(this.extractData),
            catchError(this.handleError<any>('update error')));
    }

    private extractData(res: Response) {
        const body = res;
        return body || {};
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead
            // TODO: better job of transforming error for user consumption
            console.log(`${operation} failed: ${error.message}`);
            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }



    handleHttpRequest(show, res, err) {
        if (res == null && err == null) {
            return null;
        } else if (res != null && err == null) {
            return res;
        } else if (res == null && err != null) {
            return err;
        }
    }




    getAuthenticationConfiguration(requestURL_params: any): Observable<any> {
        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_ENDPOINT;
        return this._httpclient.get<any>(url + requestURL_params)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));

    }



    GenerateQRCode() {

        const url = environment.environment.API_BASE_URL + appSettings.SECURITY_GENERATESECRETKEY;
        console.log('url ', url)
        return this._httpclient.post<any>(url, "", this.httpOptions)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    VerifyCode(code: any) {
        const url = environment.environment.API_BASE_URL + appSettings.SECURITY_VERIFYCODE;
        console.log('url ', url)
        return this._httpclient.post<any>(url, JSON.stringify(code), this.httpOptions)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }
   
    getAuthConfigDataByCompanyAndClient(requestURL_params: any): Observable<any> {
        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_COMPANYANDCLIENT_ENDPOINT;
        return this._httpclient.get<any>(url + requestURL_params)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    // HTTP GET 
    getUserOTP(requestURL_params: any): Observable<any> {

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_REQUESTOTP;
        return this._httpclient.get<any>(url + requestURL_params)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));

    }

    // HTTP POST
    validateOTP(data): Observable<any> {

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_VALIDATEOTP;
        return this._httpclient.post<any>(url, data, this.httpOptions)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    //HTTP POST
    updatePassword(data): Observable<any> {

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_UPDATEPASSWORD;
        return this._httpclient.post<any>(url, data, this.httpOptions)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }
    //HTTP POST
    changePassword(data): Observable<any> {
        this.httpOptions2 = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }).append('Token', this._sessionStoreage.getSessionStorage(SessionKeys.Token))
        };
        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_CHANGEPASSWORD;
        return this._httpclient.post<any>(url, data, this.httpOptions2)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    SendOTPForMFA(): Observable<any> {
        this.httpOptions2 = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }).append('Token', this._sessionStoreage.getSessionStorage(SessionKeys.Token))
        };
        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_SENDOTPFORMFA;
        return this._httpclient.post<any>(url, "", this.httpOptions2)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    GetQRCodeForMFA(OTP: number)
        : Observable<any> {

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_GENERATEQRCODEFORMFA;
        return this._httpclient.get<any>(url + OTP, this.httpOptions2)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    EnableMFA(data)
        : Observable<any> {

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_ENABLEMFA;
        return this._httpclient.post<any>(url, data, this.httpOptions2)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }
    DisableMFA(data)
        : Observable<any> {
        this.httpOptions2 = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }).append('Token', this._sessionStoreage.getSessionStorage(SessionKeys.Token))
        };
        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_DISABLEMFA;
        return this._httpclient.post<any>(url, data, this.httpOptions2)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    VerifyMFA(TFACode)
        : Observable<any> {
        this.httpOptions2 = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }).append('Token', this._sessionStoreage.getSessionStorage(SessionKeys.Token))
        };
        const req_pay = `${TFACode}`
        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_VERIFYMFA;
        return this._httpclient.get<any>(url + req_pay, this.httpOptions2)
            // .pipe(map(res => res),
            //     catchError(this.handlepostTokenError));
                .pipe(tap(_ => console.log(`**API REQUEST `)),
                map((x: any) => {
                  var apiR: apiResult = {
                    Result : x['Result'],
                    Message : x.Message,
                    Status: x.Status
                  }

                  if(x['Status'] && x['Result']){
                  var decryptedResult = this.DecryptResponseByAES(x['Result']);
                  console.log('**API RESPONSE  :: ', decryptedResult);
                                                            
                    apiR.Result =  decryptedResult as any
                }
                      
                  return apiR;
                 
                }),
                catchError(this.handleError<any>('::::::::: API ERROR STATUS ::::::::::'))
              );
    }


    // HTTP PUT 

    candidateLogin(credentials: any): Observable<any> {

        const url = environment.environment.SECURITY_BASE_URL + appSettings.CANDIDATE_LOGIN;
        return this._httpclient.put<any>(url + credentials, this.httpOptions)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));

    }


    google_signOut(): void {

        // this.googleService.signOut();
    }

    google_signIn(): void {

    }


    public getJSON(): Observable<any> {

        return this._httpclient.get('assets/json/config.json').pipe(
            map(res => res
                , this.extractData),
            catchError(this.handleError<any>('update error')));
    }

    getRequestHeader() {

        // this.httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'
        //   }).append('Authorization',
        //     this.session.getSessionStorage(SessionKeys.TokenType) +
        //     ' ' +
        //     this.session.getSessionStorage(SessionKeys.Token))
        // };

        // this.httpOptions = {
        //   headers: new HttpHeaders({
        //     'accept': 'application/json',
        //     'Content-Type': 'application/json'
        //   }).append('Token',  this.session.getSessionStorage(SessionKeys.Token))    
        // };

        // console.log(this.session.getSessionStorage(SessionKeys.Token));

        this.tokenHttpOptions = {
            headers: new HttpHeaders({
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }).append('Token',
                this._sessionStoreage.getSessionStorage(SessionKeys.Token) == null ? "0xAAE559341E96993160011A8AF4A1824202F0F47FF1AF528517B2185FFA91615B6221A3E9AA24B290BA960BA14CD65C6A92D1" : this._sessionStoreage.getSessionStorage(SessionKeys.Token))
        };


    }
    public UpdateRoleInSession(role: any): Observable<any> {
        this.getRequestHeader();

        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_UPDATEROLEINSESSION;
        return this._httpclient.put<any>(url, role, this.tokenHttpOptions)
            .pipe(map(res => res),
                catchError(this.handlepostTokenError));
    }

    get sessionDetails() {
      return JSON.parse(this.session.getSessionStorage(SessionKeys.LoginResponses));
    }

    public GetMenuByUserAndClient(roleCode: string, clientId, clientContractId): Observable<any> {
        this.getRequestHeader();
        const payload = `roleCode=${roleCode}&clientId=${clientId}&clientContractId=${clientContractId}`;
        const url = environment.environment.SECURITY_BASE_URL + appSettings.SECURITY_GETMENUITEMSBYCLIENTID;
        // return this._httpclient.get<any>(url + payload, this.tokenHttpOptions)
        //     .pipe(map(res => res),
        //         catchError(this.handlepostTokenError));

          return this._httpclient.get<any>(url + payload, this.tokenHttpOptions)
        .pipe(
          tap(_ => console.log(`**API REQUEST `)),
          map((x: any) => {
    
            var apiR: apiResult = {
              Result : x['Result'],
              Message : x.Message,
              Status: x.Status
            }

            if(x['Status'] && x['Result']){
              var decryptedResult = this.encryptDecryptService.DecryptWithAES(this.sessionDetails,  x['Result']);
              console.log('**API RESPONSE  :: ', decryptedResult);                                                        
              apiR.Result =  decryptedResult as any
            }                 
              return apiR;

            // if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            //   environment.environment.DecryptResponse === true) {
            //   return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            // }
            // else {
            //   return x;
            // }
          }),
          catchError(this.handlepostTokenError)
        );
    }

   public DecryptResponseByAES(strToDecrypt : string){

      let reForPlus = /\*/g;
      let reForSlash = /\-/g;
      let charReplacedStringToDecrypt : string = strToDecrypt.replace(reForPlus, "+").replace(reForSlash,"/");      
  
      const key = CryptoJS.enc.Utf8.parse(this.HFK);
      const vector = CryptoJS.enc.Utf8.parse(this.HFV);
      var decrypted;  
  
      try{
        decrypted = CryptoJS.AES.decrypt(charReplacedStringToDecrypt, key, {
          keySize: 128 / 8,
          iv: vector,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
      }
      catch(ex){
        decrypted = null;
        console.log(ex);
      }      
      return this.EncryptDecryptHelper(JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));
  
    }

    EncryptDecryptHelper(verificationLog : VerificatinLogs) {

      if (verificationLog != null) {

        const decodedRanIdString = atob(verificationLog.VisitorRandId.toString());

        let KeyVectorElementName = this.LogFactor[decodedRanIdString];
        const decodedLogFactorString = atob(verificationLog[KeyVectorElementName].toString());

        var digits = decodedLogFactorString.toString().split('').map(Number);
        let KeyElementName = this.KeyVectorFactor[digits[0]];
        let VectorElementName = this.KeyVectorFactor[digits[1]];
  
        let KeyElementValue = verificationLog[KeyElementName];
        let VectorElementValue = verificationLog[VectorElementName];
  
        let decryptedText  =  this.DecryptHelper(KeyElementValue, VectorElementValue, verificationLog.MfiLog);
        console.log('decryptedText ::', decryptedText);
        return decryptedText;
  
      }
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

    private callbackSubscribe(jsonPreview) {

      interface apiResponse {
  
        Error: string;
        InsertedId: number;
        Message: string;
        RowsAffected: number;
        Status: boolean;
        dynamicObject: null;
  
      }
      interface apiResult {
  
        Result: string;
        Message: string;
        Status: boolean;
      }
  
  
      function instanceOfDynamicObject(object: any): object is apiResponse {
        return 'dynamicObject' in object;
      }
  
      function instanceOfResult(object: any): object is apiResult {
        return 'Result' in object;
      }
  
      var a: any = { Error: '', InsertedId: 0, Message: '', RowsAffected: 0, Status: false, dynamicObject: null };
      var b: any = { Result: '', Message: '', Status: false };
  
      if (instanceOfDynamicObject(a)) {
        console.log('COMEBACK :: ', jsonPreview);
      } else if (instanceOfResult(b)) {
        console.log('COMEBACK ::', jsonPreview);
      } else {
  
      }
  
  
    }

    public getSessionDetailsForSSO(referenceId): Observable<any> {
      this.getRequestHeader();
      const params = `${referenceId}`;
      const url = environment.environment.SAML_BASE_URL + appSettings.SECURITY_GETSESSION;
      return this._httpclient.get<any>(url + params, this.httpOptions).pipe(
        tap(_ => console.log(`**API REQUEST `)),
        map((x: any) => {
          var apiR: apiResult = {
            Result : x['Result'],
            Message : x.Message,
            Status: x.Status
          }

          if(x['Status'] && x['Result']){
          var decryptedResult = this.DecryptResponseByAES(x['Result']);
          console.log('**API RESPONSE  :: ', decryptedResult);
          //                   this.callbackSubscribe(this.DecryptResponseByAES(x['Result']));
                                   
            apiR.Result =  decryptedResult as any
        }
              
          return apiR;
         
        }),
        catchError(this.handleError<any>('::::::::: API ERROR STATUS ::::::::::'))
      );

    }
}
