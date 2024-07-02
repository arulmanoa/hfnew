import "rxjs/add/observable/throw";
import "rxjs/add/operator/catch";
import { Injectable } from "@angular/core";
import {
  ConnectionBackend,
  Headers,
  Http,
  Request,
  RequestMethod,
  RequestOptions,
  RequestOptionsArgs,
  Response,
  ResponseOptions
} from "@angular/http";
import { Subscriber } from "rxjs";
import { extend } from "lodash";
import { Observable, throwError } from 'rxjs';

import * as CryptoJS from 'crypto-js';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SessionStorageService } from 'ngx-webstorage';

import { environment } from "../../../environments/environment";
import { SessionStorage } from '../service/session-storage.service'
import { SessionKeys } from '../configs/app.config'; // app config  
import { Options } from "selenium-webdriver/chrome";
import { EncrDecrService } from "./encr-decr.service";
import { MatSnackBar } from '@angular/material';
import { apiResponse } from "../model/apiResponse";
import { NotFoundError } from "src/app/_guards/notFound";
import { AppError } from "src/app/common/app-error";

/**
 * Provides a base framework for http service extension.
 * The default extension adds support for API prefixing, request caching and default error handler.
 */
@Injectable()
export class HttpService {


  endpoint;
  httpOptions: any;
  API_URL = environment.environment.API_BASE_URL;
  INTEGRATION_API_URL = environment.environment.INTEGRATION_BASE_URL;
  API_URL2 = environment.environment.OBJECTSTORAGE_BASE_URL;
  FINANE_API_URL = environment.environment.FINANCE_BASE_URL;
  REPORTS_API_URL = environment.environment.REPORTS_BASE_URL;

  constructor(
    private _httpclient: HttpClient,
    private _sessionStorageService: SessionStorageService,
    private session: SessionStorage,
    private encryptDecryptService: EncrDecrService,
    public snackBar: MatSnackBar
  ) {


  }

  getToken() {
    return this.session.getSessionStorage(SessionKeys.Token);
  }

  get sessionDetails() {
    return JSON.parse(this.session.getSessionStorage(SessionKeys.LoginResponses));
  }

  getRequestHeader() {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }).append('Token',
        this.session.getSessionStorage(SessionKeys.Token) == null ? "0xAAE559341E96993160011A8AF4A1824202F0F47FF1AF528517B2185FFA91615B6221A3E9AA24B290BA960BA14CD65C6A92D1" : this.session.getSessionStorage(SessionKeys.Token))
    };
  }

  getBlobHeader(): any {

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'

      }).append('Token',
        this.session.getSessionStorage(SessionKeys.Token) == null ? "0xAAE559341E96993160011A8AF4A1824202F0F47FF1AF528517B2185FFA91615B6221A3E9AA24B290BA960BA14CD65C6A92D1" : this.session.getSessionStorage(SessionKeys.Token))
      , responseType: 'blob'
    };


  }

  basicGetApi(url) {
    return this._httpclient.get(url).pipe(
      tap(_ => console.log(`BASIC FETCH DONE`)),
      catchError(this.handleErrors)
    );
  }


  oldget(API_ENDPOINTS): Observable<any> {

    this.getRequestHeader();

    return this._httpclient.get<any>(this.API_URL + API_ENDPOINTS, this.httpOptions)
      .pipe(
        tap(_ => console.log(`FETCH DONE`)),
        catchError(this.handleErrors)
      );

  }

  getWithoutSecurity(API_ENDPOINTS): Observable<any> {
    this.getRequestHeader();
    return this._httpclient.get<any>(this.API_URL + API_ENDPOINTS, this.httpOptions)
      .pipe(
        tap(_ => console.log(`FETCH DONE`)),
        catchError(this.handleErrors)
      );
  }

  // encryptedGet(API_ENDPOINTS : string): Observable<any> {

  //   this.getRequestHeader();

  //   // console.log()

  //   return this._httpclient.get<any>(this.API_URL + API_ENDPOINTS, this.httpOptions)
  //     .pipe(
  //       tap(_ => console.log(`FETCH DONE`)),
  //       map( (x : any) =>  {   return this.encryptDecryptService.DecryptWithAES(this.sessionDetails , x) } ),
  //       catchError(this.handleErrors)
  //     );

  // }

  encryptedGet(API_ENDPOINTS: string): Observable<any> {

    this.getRequestHeader();

    let fullAPI = API_ENDPOINTS.split('/');

    let apiEndpoints = fullAPI.slice(0, 3);

    let params = fullAPI.slice(3);

    let encryptedParams: string[] = [];

    for (let param of params) {
      let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
      // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
      encryptedParams.push(encryptedParam);
    }

    let apiEndpointsStr: String = apiEndpoints.join('/');
    apiEndpointsStr = apiEndpointsStr + "/" + encryptedParams.join('/');

    // console.log()

    return this._httpclient.get<any>(this.API_URL + apiEndpointsStr, this.httpOptions)
      .pipe(
        tap(_ => console.log(`FETCH DONE`)),
        map((x: any) => { return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x) }),
        catchError(this.handleErrors)
      );

  }

  get(API_ENDPOINTS: string) {

    this.getRequestHeader();
    console.log('API END POINT ::', API_ENDPOINTS);

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {
      let url = new URL(this.API_URL + API_ENDPOINTS);

      // console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      // console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      // console.log("New Get URl" ,  newURL);

      return this._httpclient.get<any>(newURL, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
    else {
      return this._httpclient.get<any>(this.API_URL + API_ENDPOINTS, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
  }

  genericGet(API_ENDPOINTS): Observable<any> {

    this.getRequestHeader();
    console.log('API_ENDPOINTS', API_ENDPOINTS);
    return this._httpclient.get<any>(API_ENDPOINTS, this.httpOptions)
      .pipe(map(res => res),
        catchError(this.handlepostTokenError1));
  }

  getObjectAsBlob(apiEndPoint): Observable<any> {
    //this.getRequestHeader();

    return this._httpclient.get<any>(apiEndPoint, this.getBlobHeader())
      .pipe(map(res => res),

        catchError(this.handlepostTokenError));
  }

  oldpost(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();
    // return this._httpclient.post<any>(this.API_URL + API_ENDPOINTS, data, this.httpOptions)
    //   .pipe(map(res => res),
    //     catchError(this.handlepostTokenError));
    return this._httpclient.post(this.API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
      tap(_ => console.log(`INSERT DONE`)),
      catchError(this.handleError<any>('INSERT ERROR'))
    );
  }


  postWithoutSecurity(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();
    // return this._httpclient.post<any>(this.API_URL + API_ENDPOINTS, data, this.httpOptions)
    //   .pipe(map(res => res),
    //     catchError(this.handlepostTokenError));

    return this._httpclient.post(this.API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
      tap(_ => console.log(`INSERT DONE`)),
      catchError(this.handleError<any>('INSERT ERROR'))
    );
  }


  postObjectStorage(API_ENDPOINTS, data): Observable<any> {

    this.getRequestHeader();
    // return this._httpclient.post<any>(this.API_URL + API_ENDPOINTS, data, this.httpOptions)
    //   .pipe(map(res => res),
    //     catchError(this.handlepostTokenError));

    return this._httpclient.post(this.API_URL2 + API_ENDPOINTS, data, this.httpOptions).pipe(
      tap(_ => console.log(`INSERT DONE`)),
      catchError(this.handleError<any>('INSERT ERROR'))
    );
  }

  post(API_ENDPOINTS, data): Observable<any> {

    this.getRequestHeader();


    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {

      let url = new URL(this.API_URL + API_ENDPOINTS);



      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);


      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(data));

      if (cipherText == null) {
        return;
      }

      return this._httpclient.post<any>(newURL, cipherText, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          console.log('POST API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            this.callbackSubscribe(this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }
    else {
      return this._httpclient.post(this.API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          console.log('POST API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }

  }

  // plain/text(params) - content type
  post_text(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {
      let url = new URL(this.API_URL + API_ENDPOINTS + data);

      //  console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      //  console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      // console.log("New Get URl" ,  newURL);
      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(""));

      if (cipherText == null) {
        return;
      }

      return this._httpclient.post<any>(newURL, cipherText, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
    else {
      return this._httpclient.post<any>(this.API_URL + API_ENDPOINTS + data, "", this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }

    // return this._httpclient.post(this.API_URL + API_ENDPOINTS + data, "", this.httpOptions).pipe(
    //   tap(_ => console.log(`INSERT TEXT DONE`)),
    //   catchError(this.handleError<any>('INSERT TEXT ERROR'))
    // );
  }

  // plain/text(params) - content type
  oldpost_text(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();

    return this._httpclient.post(this.API_URL + API_ENDPOINTS + data, "", this.httpOptions).pipe(
      tap(_ => console.log(`INSERT TEXT DONE`)),
      catchError(this.handleError<any>('INSERT TEXT ERROR'))
    );
  }

  // application/json - content type
  oldput(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();
    console.log(this.httpOptions);

    return this._httpclient.put(this.API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
      tap(_ => console.log(`UPDATE DONE`)),
      catchError(this.handleError<any>('UPDATE ERROR'))
    );
  }

  putWithoutSecurity(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();

    return this._httpclient.put(this.API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
      tap(_ => console.log(`UPDATE DONE`)),
      catchError(this.handleError<any>('UPDATE ERROR'))
    );
  }

  put(API_ENDPOINTS, data): Observable<any> {

    this.getRequestHeader();

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {

      let url = new URL(this.API_URL + API_ENDPOINTS);

      // console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      // console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(data));

      if (cipherText == null) {
        return;
      }

      return this._httpclient.put(newURL, cipherText, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          console.log('PUT API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }
    else {
      return this._httpclient.put(this.API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
        tap(_ => console.log(`UPDATE DONE`)),
        map((x: any) => {
          console.log('PUT API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('UPDATE ERROR'))
      );
    }


  }


  put_integration(API_ENDPOINTS, data): Observable<any> {

    this.getRequestHeader();

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {

      let url = new URL(this.INTEGRATION_API_URL + API_ENDPOINTS);

      // console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      // console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(data));

      if (cipherText == null) {
        return;
      }

      return this._httpclient.put(newURL, cipherText, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          console.log('PUT API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }
    else {
      return this._httpclient.put(this.INTEGRATION_API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
        tap(_ => console.log(`UPDATE DONE`)),
        map((x: any) => {
          console.log('PUT API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('UPDATE ERROR'))
      );
    }


  }

  put_text(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();


    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {
      let url = new URL(this.API_URL + API_ENDPOINTS + data);

      //  console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      //  console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      // console.log("New Get URl" ,  newURL);

      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(""));

      if (cipherText == null) {
        return;
      }

      return this._httpclient.put<any>(newURL, cipherText, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
    else {
      return this._httpclient.put<any>(this.API_URL + API_ENDPOINTS + data, "", this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }

    // return this._httpclient.put(this.API_URL + API_ENDPOINTS + data, "", this.httpOptions).pipe(
    //   tap(_ => console.log(`UPDATE DONE`)),
    //   catchError(this.handleError<any>('UPDATE ERROR'))
    // );
  }

  // plain/text(params) - content type
  oldput_text(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();

    return this._httpclient.put(this.API_URL + API_ENDPOINTS + data, "", this.httpOptions).pipe(
      tap(_ => console.log(`UPDATE DONE`)),
      catchError(this.handleError<any>('UPDATE ERROR'))
    );
  }


  olddelete1(API_ENDPOINTS): Observable<any> {
    this.getRequestHeader();

    return this._httpclient.delete(this.API_URL + API_ENDPOINTS, this.httpOptions).pipe(
      tap(_ => console.log(`DELETE DONE`)),
      catchError(this.handleError<any>('DELETE ERROR'))
    );
  }

  deleteWithoutSecurity(API_ENDPOINTS): Observable<any> {
    this.getRequestHeader();

    return this._httpclient.delete(this.API_URL + API_ENDPOINTS, this.httpOptions).pipe(
      tap(_ => console.log(`DELETE DONE`)),
      catchError(this.handleError<any>('DELETE ERROR'))
    );
  }
  delete(API_ENDPOINTS): Observable<any> {
    this.getRequestHeader();

    return this._httpclient.delete(this.API_URL2 + API_ENDPOINTS, this.httpOptions).pipe(
      tap(_ => console.log(`DELETE DONE`)),
      catchError(this.handleError<any>('DELETE ERROR'))
    );
  }

  delete1(API_ENDPOINTS): Observable<any> {
    this.getRequestHeader();

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {
      let url = new URL(this.API_URL + API_ENDPOINTS);

      //  console.log("URl ::" , url);

      //#region Get New Path Name
      const pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      //  console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";


      return this._httpclient.delete(newURL, this.httpOptions).pipe(
        tap(_ => console.log(`DELETE DONE`)),
        map((x: any) => {
          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('DELETE ERROR'))
      );
    }
    else {
      return this._httpclient.delete(this.API_URL + API_ENDPOINTS, this.httpOptions)
        .pipe(
          tap(_ => console.log(`DELETE DONE`)),
          map((x: any) => {
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }


  }

  getS3(API_ENDPOINTS): Observable<any> {

    this.getRequestHeader();
    return this._httpclient.get<any>(this.API_URL2 + API_ENDPOINTS, this.httpOptions)
      .pipe(map(res => res),

        catchError(this.handlepostTokenError));
  }

  postUpload(url, data, parameters): Observable<any> {
    const httpOptionsupload = {
      headers: new HttpHeaders().append('Token', this.session.getSessionStorage(SessionKeys.Token)),
      reportProgress: true,
      params: parameters
    };
    return this._httpclient.post(url, data, httpOptionsupload).pipe(
      tap(() => console.log(`uploded files in to server w/`), map(this.extractData)),
      catchError(this.handleError<any>('postHttp'))
    );
  }

  get_finance(API_ENDPOINTS): Observable<any> {

    this.getRequestHeader();

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {
      let url = new URL(this.FINANE_API_URL + API_ENDPOINTS);

      //  console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      //  console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      // console.log("New Get URl" ,  newURL);

      return this._httpclient.get<any>(newURL, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
    else {
      return this._httpclient.get<any>(this.FINANE_API_URL + API_ENDPOINTS, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }

    // return this._httpclient.get<any>(this.FINANE_API_URL + API_ENDPOINTS, this.httpOptions)
    //   .pipe(
    //     tap(_ => console.log(`FETCH DONE`)),
    //     catchError(this.handleErrors)
    //   );

  }

  oldget_finance(API_ENDPOINTS): Observable<any> {

    this.getRequestHeader();

    return this._httpclient.get<any>(this.FINANE_API_URL + API_ENDPOINTS, this.httpOptions)
      .pipe(
        tap(_ => console.log(`FETCH DONE`)),
        catchError(this.handleErrors)
      );

  }

  put_finance(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {

      let url = new URL(this.FINANE_API_URL + API_ENDPOINTS);

      // console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      // console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(data));

      if (cipherText == null) {
        return;
      }

      return this._httpclient.put(newURL, cipherText, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          // console.log('PUT API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails , x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }
    else {
      return this._httpclient.put(this.FINANE_API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
        tap(_ => console.log(`UPDATE DONE`)),
        map((x: any) => {
          // console.log('PUT API NETWORK RESPONSE :: ',this.encryptDecryptService.DecryptWithAES(this.sessionDetails , x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('UPDATE ERROR'))
      );
    }
  }

  oldput_finance(API_ENDPOINTS, data): Observable<any> {
    this.getRequestHeader();
    return this._httpclient.put(this.FINANE_API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
      tap(_ => console.log(`UPDATE DONE`)),
      catchError(this.handleError<any>('UPDATE ERROR'))
    );
  }

  // upload(files, parameters): Observable<any> {


  //   let apiEndpoints: EndPointModel;
  //   apiEndpoints = (<EndPointModel>JSON.parse(this.GetEndPoints()));
  //   const url = apiEndpoints.BASE_URL + apiEndpoints.BASE_UPLOADDOCUMENT_ENDPOINT;


  //   return this.postUpload(url, files, parameters);
  // }

  downloadData(url: string, model: any): Observable<Object[]> {
    url = url;
    return Observable.create(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader(
        'Authorization',
        sessionStorage.getItem('token_type') +
        ' ' +
        sessionStorage.getItem('access_token')
      );
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.responseType = 'blob';
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const contentType =
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const blob = new Blob([xhr.response], { type: contentType });
            observer.next(blob);
            observer.complete();
          } else {
            if (xhr.status === 0) {
              observer.error('Server is unreachable');
            } else if (xhr.status === 404) {
              // tslint:disable-next-line:one-line
              observer.error('Data not available');
            } else if (xhr.status === 401) {
              observer.error('The caller is not authenticated');
            } else {
              // tslint:disable-next-line:one-line
              const errorMsg = xhr.response();
              observer.error(errorMsg);
            }
          }
        }
      };
      xhr.send(JSON.stringify(model));
    });
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
      console.log('result of sc', jsonPreview);
    } else if (instanceOfResult(b)) {
      console.log('result of sc', jsonPreview);
    } else {

    }


  }
  private handlepostTokenError1(error: HttpErrorResponse) {
    if (error.status == undefined)
      this.snackBar.open(`${error} `, '', {
        duration: 5000
      });

    else if (error.status == 404 || error.status == undefined)
      return Observable.throw(new NotFoundError())
    else
      return Observable.throw(new AppError(error))

    return Observable.throw(error);
  }

  private handlepostTokenError(error: HttpErrorResponse) {


    return Observable.throw(error);
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {


      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      window.alert(`${error}`)
      // this.snackBar.open(`${error} `, '', {
      //   duration: 5000
      // });
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  handleErrors(error) {

    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(errorMessage);
  }





  private extractData(res: Response) {
    const body = res;
    return body || {};
  }


  postForObjectStorage(API_ENDPOINTS, data): Observable<any> {

    this.getRequestHeader();


    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {

      let url = new URL(this.API_URL2 + API_ENDPOINTS);



      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);


      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(data));

      if (cipherText == null) {
        return;
      }

      console.log('newURL :: ', newURL);

      console.log('data :: ', data);
      console.log('cipherText :: ', cipherText);

      return this._httpclient.post<any>(newURL, cipherText, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          // console.log('POST API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
          // if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
          //   environment.environment.DecryptResponse === true) {
          //   this.callbackSubscribe(this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
          //   return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          // }
          // else {
          return x;
          // }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }
    else {
      return this._httpclient.post(this.API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          // console.log('POST API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));

          // if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
          //   environment.environment.DecryptResponse === true) {
          //   return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          // }
          // else {
          return x;
          // }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }

  }
  get_ExternalAPICall(fullAPI) {

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {
      let url = new URL(fullAPI);

      // console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      // console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      console.log("New Get URl" ,  newURL);

     return this._httpclient.get<any>(newURL, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
    else {
      return this._httpclient.get<any>(fullAPI, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
  }

  get_reports(API_ENDPOINTS): Observable<any> {

    this.getRequestHeader();

    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {
      let url = new URL(this.REPORTS_API_URL + API_ENDPOINTS);

      //  console.log("URL HEADER ::" , url);

      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);

      //  console.log("pathnames ::" , pathNames , apiEndpoints , params);

      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      // console.log("New Get URl" ,  newURL);

      return this._httpclient.get<any>(newURL, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }
    else {
      return this._httpclient.get<any>(this.REPORTS_API_URL + API_ENDPOINTS, this.httpOptions)
        .pipe(
          tap(_ => console.log(`FETCH DONE`)),
          map((x: any) => {
            console.log('GET API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
              environment.environment.DecryptResponse === true) {
              return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
            }
            else {
              return x;
            }
          }),
          catchError(this.handleErrors)
        );
    }

  }

  post_reports(API_ENDPOINTS, data): Observable<any> {

    this.getRequestHeader();


    if (environment.environment.EncryptRequest !== undefined && environment.environment.EncryptRequest !== null &&
      environment.environment.EncryptRequest === true) {

      let url = new URL(this.REPORTS_API_URL + API_ENDPOINTS);



      //#region Get New Path Name
      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);


      let encryptedParams: string[] = [];

      for (let param of params) {
        let encryptedParam = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, param);
        // encryptedParam = encryptedParam.replace('/' , '*').replace('+' , '-').replace('=' , '_');
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";

      //#endregion

      //#region Get New Search

      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encryptDecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();

      //#endregion

      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      let cipherText = this.encryptDecryptService.EncryptWithAES(this.sessionDetails, JSON.stringify(data));

      if (cipherText == null) {
        return;
      }

      return this._httpclient.post<any>(newURL, cipherText, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          console.log('POST API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            this.callbackSubscribe(this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }
    else {
      return this._httpclient.post(this.REPORTS_API_URL + API_ENDPOINTS, data, this.httpOptions).pipe(
        tap(_ => console.log(`INSERT DONE`)),
        map((x: any) => {
          console.log('POST API NETWORK RESPONSE :: ', this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x));

          if (environment.environment.DecryptResponse !== undefined && environment.environment.DecryptResponse !== null &&
            environment.environment.DecryptResponse === true) {
            return this.encryptDecryptService.DecryptWithAES(this.sessionDetails, x)
          }
          else {
            return x;
          }
        }),
        catchError(this.handleError<any>('INSERT ERROR'))
      );
    }

  }


}
