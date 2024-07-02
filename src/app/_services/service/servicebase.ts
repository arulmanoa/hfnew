import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RequestOptions, Response } from '@angular/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {SessionData} from '../model/Common/sessionData';
import {ImplementationProperties} from '../model/Common/constants';
import { HttpParams } from '@angular/common/http';


import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


@Injectable({
  providedIn: 'root'
})

export class ServiceBase
{
  httpOptions:any;
  //  endpoint = 'http://localhost:49961/api/values/';

    constructor(private http: HttpClient, private session:SessionData){
       
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            
          })
        };
    }

    private extractData(res: Response) {
        let body = res;
        // console.log(res);
        return body || { };
      }

      getDataByUrl(url):Observable<any>
      {
        return this.http.get(url ,
          {
            headers: this.httpOptions.headers,
            responseType: 'json'
        }).pipe(catchError(this.handleError)
        );
      }

      getData(controllerKey, actionKey,data="", useImplEndPoint = false):Observable<any>{
        var options = new RequestOptions();
        options.headers = this.httpOptions;

        var ip = ImplementationProperties;

        var url  = (useImplEndPoint ? this.session.Properties[ip.IMPLEMENTATION_END_POINT] : this.session.Properties[ip.ADMIN_END_POINT]) 
        + controllerKey + actionKey + (data === "" ? "" : "/" + data);

        return this.http.get(url ,
          {
            headers: this.httpOptions.headers,
            responseType: 'json'
        }).pipe(catchError(this.handleError)
        );
        // .map((res:Response)=> 
        //   {
        //     return <any>res.json();
        //   }).catch(this.handleError);  ;
          // .map(response => response.json())
          // .pipe(
          //   map(this.extractData));
      }
      private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
      }
      // getData(controllerKey, actionKey, data, useImplEndPoint = false):Observable<any>{
      //   return this.http.get(
      //     useImplEndPoint ? this.session.Properties[ImplementationProperties.IMPLEMENTATION_END_POINT] : this.session.Properties[ImplementationProperties.ADMIN_END_POINT] 
      //     + controllerKey + actionKey).pipe(
      //       map(this.extractData));
      // }

      postData(controllerKey, actionKey, data, useImplEndPoint = false): Observable<any> {
        return this.http.post(
          (useImplEndPoint ? this.session.Properties[ImplementationProperties.IMPLEMENTATION_END_POINT] : this.session.Properties[ImplementationProperties.ADMIN_END_POINT])
          + controllerKey + actionKey, data, this.httpOptions).pipe(catchError(this.handleError)
        );
      }

      putData(controllerKey, actionKey, data, useImplEndPoint = false) :Observable<any> {
        return this.http.put(
          (useImplEndPoint ? this.session.Properties[ImplementationProperties.IMPLEMENTATION_END_POINT] : this.session.Properties[ImplementationProperties.ADMIN_END_POINT])
          + controllerKey + actionKey, data, this.httpOptions).pipe(
        );
      }

      getDataTemp():Observable<any>{
        var options = new RequestOptions();
        options.headers = this.httpOptions;

        var ip = ImplementationProperties;
        const para = new HttpParams().set('DocumentId', '323');

        // const url = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_GETDOCUMENT_ENDPOINT + params;
        var url  = "http://35.196.231.3/mint.api/api/download?" + para;

        // this.getRequestHeader();
        // return this._httpclient.get(url, this.httpOptions).pipe(
        //   tap(_ => console.log(`updated done`), map(this.extractData)));

        return this.http.get(url ,
          {
            headers: this.httpOptions.headers,
            responseType: 'json'
        }).pipe(catchError(this.handleError)
        );
        // .map((res:Response)=> 
        //   {
        //     return <any>res.json();
        //   }).catch(this.handleError);  ;
          // .map(response => response.json())
          // .pipe(
          //   map(this.extractData));
      }

     
}