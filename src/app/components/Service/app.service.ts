import { Injectable } from '@angular/core';

import { ListOfMandatesDataSet } from '../Models/ListMandates';
import {
  Confidential, SelfAllocate, Category, MandateType, Client, LstContract,
  FunctionalArea, City, State, TargetIndustry, Gender, Country, GenricCode, LstClientLocation, Employee, ReqStatus, NoticePeriod
} from '../Models/look-up-model';
import {
  _confidential, _selfAllocate, _category, _mandateType, _client, _clientContract,
  _functionalArea, _city, _state, _targetIndustry, _gender, _GenricCode,
  _Country, _ClientContact, _mandateDatasourceSchedule, _Reqstatus, _NoticePeriod
} from '../constants/DropdownValues';
import { MandatesDetails, MandatesDetailsUpdate } from '../Models/MandatesDetails';
// tslint:disable-next-line:max-line-length
import { _MandatesDetailsValues, _RequirementDetailsDefaultValues, _employees, _MandatesDetailsUpdateValues, _MandatesRequirementDetailsViewDefaultValues, _MandateAssignmentDetailsUpdateValues } from '../constants/MandatesValues';

import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SessionStorageService } from 'ngx-webstorage';
import { LoginCredential } from '../Models/login-credential';
import {
  MandateRequirementDetails, MandatesRequirementDetailsView,
  MandateAssignmentDetailsUpdate
} from '../Models/MandateRequirementDetails';
import { SessionKeys, CountryCofig } from 'src/app/app.config';
import 'rxjs/add/operator/map';
import { LoginSessionDetails } from '../Models/LoginSessionDetails';
import { LeftNavigationMenu } from '../Models/LeftNavigationMenu';
import { MandateSchedule } from '../Models/MandateSchedule';

import { LeftNavigationMenuValues } from '../constants/LeftNavigationMenuValues';
import * as CryptoJS from 'crypto-js';
import { UserDetails } from '../Models/UserDetails';
import { EndPointModel } from '../Models/ConfigModel';


@Injectable({
  providedIn: 'root'
})

export class AppService {

  endpoint;
  httpOptions: any;
  httpposttokenOptions: any;
  _credential: LoginCredential;
  _loginSessionDetails: LoginSessionDetails;
  public MandateId: number;
  EncrpytKey = '7061737323313233';
  constructor(private _httpclient: HttpClient, private _sessionStorageService: SessionStorageService) {
    this.getRequestHeader();
    this.httpposttokenOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      })
    };
  }



  getRequestHeader() {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }).append('Authorization',
        this.getSessionStorage(SessionKeys.TokenType) +
        ' ' +
        this.getSessionStorage(SessionKeys.AccessToken))
    };
  }

  GetEndPoints() {

    return this.getSessionStorage(SessionKeys.Api_endpoints);
  }


  get(url): Observable<any> {
    this.getRequestHeader();
    return this._httpclient.get(url, this.httpOptions).pipe(
      tap(_ => console.log(`updated done`), map(this.extractData)));
  }

  post(url, data): Observable<any> {
    this.getRequestHeader();
    return this._httpclient.post(url, data, this.httpOptions).pipe(
      tap(() => console.log(`added data in to server w/`), map(this.extractData)),
      catchError(this.handleError<any>('postHttp'))
    );
  }

  putHttp(url, data): Observable<any> {
    this.getRequestHeader();
    return this._httpclient.put(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`updated done`)),
      catchError(this.handleError<any>('update error'))
    );
  }

  postUpload(url, data, parameters): Observable<any> {
    const httpOptionsupload = {
      headers: new HttpHeaders().append('Authorization',
        this.getSessionStorage(SessionKeys.TokenType) +
        ' ' +
        this.getSessionStorage(SessionKeys.AccessToken)),
      reportProgress: true,
      params: parameters
    };
    return this._httpclient.post(url, data, httpOptionsupload).pipe(
      tap(() => console.log(`uploded files in to server w/`), map(this.extractData)),
      catchError(this.handleError<any>('postHttp'))
    );
  }

  upload(files, parameters): Observable<any> {


    let apiEndpoints: EndPointModel;
    apiEndpoints = (<EndPointModel>JSON.parse(this.GetEndPoints()));
    const url = apiEndpoints.BASE_URL + apiEndpoints.BASE_UPLOADDOCUMENT_ENDPOINT;


    return this.postUpload(url, files, parameters);
  }

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


  private handlepostTokenError(error: HttpErrorResponse) {
    return Observable.throw(error.error.error || 'Server error');
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
  postToken(model: any): Observable<any> {
    let apiEndpoints: EndPointModel;
    apiEndpoints = (<EndPointModel>JSON.parse(this.GetEndPoints()));
    console.log(apiEndpoints.BASE_URL);
    const url = apiEndpoints.BASE_URL + apiEndpoints.BASE_GETTOKEN_ENDPOINT;
    console.log(url);
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'No-Auth': 'True', 'Access-Control-Allow-Origin': '*'
    });
    return this._httpclient
      .post<any>(url, model, this.httpposttokenOptions)
      .pipe(map(res => res), catchError(this.handlepostTokenError));
  }

  isJson(item) {
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

  setSesstionStorage(key, value) {
    // sessionStorage.setItem(key, JSON.stringify(value));
    let ciphertext;
    // Encrypt
    if (this.isJson(value)) {

      ciphertext = CryptoJS.AES.encrypt(JSON.stringify(value), this.EncrpytKey);
    } else {
      ciphertext = CryptoJS.AES.encrypt(value.toString(), this.EncrpytKey);
    }
    this._sessionStorageService.store(key, ciphertext.toString());

  }

  getSessionStorage(key) {
    let decryptedData = null;
    let bytes;
    const value = this._sessionStorageService.retrieve(key);
    if (value != null) {
      if (this.isJson(value)) {
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
    // sessionStorage.removeItem(key);
    this._sessionStorageService.clear(key);
  }



  private extractData(res: Response) {
    const body = res;
    return body || {};
  }


  getMandatesById(id): Observable<any> {
    return this._httpclient.get(this.endpoint + 'Mandates/' + id).pipe(
      map(this.extractData));
  }

  getDefaultMandatesValues(): MandatesDetails {
    return _MandatesDetailsValues;
  }

  getGenderValues(): Gender[] {
    return _gender;
  }

  getTargetIndustryValues(): TargetIndustry[] {
    return _targetIndustry;
  }

  getStateValues(): State[] {
    return _state;
  }

  getCityValues(): City[] {
    return _city;
  }
  getClientContactValues(): LstClientLocation[] {
    return _ClientContact;
  }

  getFunctionalAreaValues(): FunctionalArea[] {
    return _functionalArea;
  }

  getClientContractValues(): LstContract[] {
    return _clientContract;
  }
  getClientValues(): Client[] {
    return _client;
  }
  getMandateTypeValues(): MandateType[] {
    return _mandateType;
  }
  getCategoryValues(): Category[] {
    return _category;
  }
  getSelfAllocateValues(): SelfAllocate[] {
    return _selfAllocate;
  }
  getConfidentialValues(): Confidential[] {
    return _confidential;
  }

  getLeftNavigationMenuValues(): LeftNavigationMenu[] {
    return LeftNavigationMenuValues;
  }

  getQualificationValues(): GenricCode[] {
    return _GenricCode;
  }

  getCountryValues(): Country[] {
    return _Country;
  }
  GetRequirementStatus(): ReqStatus[] {
    return _Reqstatus;
  }

  GetNoticePeriodValues(): NoticePeriod[] {
    return _NoticePeriod;
  }
  getDefaultRequirementDetailsValues(): MandateRequirementDetails {
    return _RequirementDetailsDefaultValues;
  }

  getDefaultMandatesRequirementDetailsViewValues(): MandatesRequirementDetailsView {
    return _MandatesRequirementDetailsViewDefaultValues;
  }

  getMandateAssignmentDetailsUpdateValues(): MandateAssignmentDetailsUpdate {
    return _MandateAssignmentDetailsUpdateValues;
  }
  GetStateNameById(StateId): string {
    let _TempCountryList: Country[];
    let _TempStateList: State[];
    const _getCountryValues = <Country[]>JSON.parse(this.getSessionStorage(SessionKeys.LstCountry));
    if (_getCountryValues.length > 0) {
      _TempCountryList = _getCountryValues.filter(val => val.Name === CountryCofig);
    }

    _TempStateList = _TempCountryList[0].ListOfState;
    const StateListData = _TempStateList.filter(val => val.Id === StateId);
    return StateListData[0].Name;
  }

  GetCityNameByStateId(StateId, CityId) {
    let _TempCountryList: Country[];
    let _TempStateList: State[];
    let _TempCityList: City[];
    const _getCountryValues = <Country[]>JSON.parse(this.getSessionStorage(SessionKeys.LstCountry));
    if (_getCountryValues.length > 0) {
      _TempCountryList = _getCountryValues.filter(val => val.Name === CountryCofig);
    }

    _TempStateList = _TempCountryList[0].ListOfState;
    const StateListData = _TempStateList.filter(val => val.Id === StateId);
    _TempCityList = StateListData[0].ListOfCity.filter(val => val.StateID === StateId);
    return _TempCityList.find(val => val.Id === CityId).Name;
  }
  GetUserNameById(UserId) {
    const _userDetails = <UserDetails[]>JSON.parse(this.getSessionStorage(SessionKeys.LstUser));
    return _userDetails.find(val => val.UserId === UserId).Name;
  }

  getLoginSessionDetailsValues(): LoginSessionDetails {
    return JSON.parse(this.getSessionStorage(SessionKeys.LocalSessionDetails));

  }

  convertUtcToLocalDate(val: Date): Date {
    const d = new Date(val); // val is in UTC
    const localOffset = d.getTimezoneOffset() * 60000;
    const localTime = d.getTime() - localOffset;
    d.setTime(localTime);
    return d;
  }
  getDefaultMandatesDetailsUpdateValues(): MandatesDetailsUpdate {
    return _MandatesDetailsUpdateValues;
  }
  getRecuriterScudule(): MandateSchedule[] {
    return _mandateDatasourceSchedule;
  }



  removeDumplicateValue(myArray) {

    const newArray = [];
    myArray.forEach(function (value, key) {
      let exists = false;
      newArray.forEach(function (val2) {
        if (value.PersonID === val2.PersonID) {
          exists = true;
        }
      });
      if (exists === false && value.PersonID !== 0) {
        newArray.push(value);
      }
    });
    return newArray;
  }

  groupDocumentsByPersonId(myArray) {
    const groupByPersonID = {};
    myArray.forEach(function (a) {
      groupByPersonID[a.PersonID] = groupByPersonID[a.PersonID] || [];
      if (a.DocumentId !== null) {
        groupByPersonID[a.PersonID].push({ DocumentId: a.DocumentId });
      }

    });


    const myArrayTemp: any = [];

    myArray.forEach((item) => {
      // tslint:disable-next-line:curly
      item.LstDocumentDetails = [];
      item.IsCheckboxEnabled = false;
      groupByPersonID[item.PersonID].forEach((val) => {
        item.LstDocumentDetails.push({ DocumentId: val.DocumentId });
      });
      myArrayTemp.push(item);
    });
    return myArrayTemp;
  }

}
