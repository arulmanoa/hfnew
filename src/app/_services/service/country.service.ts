import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { HttpService } from './http.service';
import {appSettings} from '../configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(

    private http: HttpService,
   

  ) {

    
  }

  getCountry() {
      
   return this.http.get(appSettings.GETCOUNTRY)
   .map(res => res)
   .catch(err => (err));

  }
  
  // HTTPPUT Insert
  postCountry(data) {

    return this.http.put(appSettings.POSTCOUNTRY, data)
    .map(res => res)
    .catch(err => (err));

  }
  
    
  // HTTPPUT update
  putCountry(data) {

    return this.http.put(appSettings.POSTCOUNTRY, data)
    .map(res => res)
    .catch(err => (err));

  }

  deleteCountry(data) {

    return this.http.put(appSettings.DELETECOUNTRY, data)
    .map(res => res)
    .catch(err => (err));

  }


}
