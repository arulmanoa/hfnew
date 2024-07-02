import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { HttpService } from './http.service';
import {appSettings} from '../../_services/configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor( private http: HttpService ) { }

  getCities(stateId: any) {
      
    let req_params = `StateId=${stateId} `
    return this.http.get(appSettings.GETCITIES + req_params)
    .map(res => res)
    .catch(err => (err));
 
  }

  postCities(data) {

    return this.http.put(appSettings.POSTCITIES, data)
    .map(res => res)
    .catch(err => (err));

  }
  
  putCities(data) {

    return this.http.put(appSettings.PUTCITIES, data)
    .map(res => res)
    .catch(err => (err));

  }


  deleteCities(data) {

    return this.http.put(appSettings.DELETECITIES, data)
    .map(res => res)
    .catch(err => (err));

  }


  editCity(Id:any){
    let req_params = `Id=${Id} `
    return this.http.get(appSettings.GETCITYBYID + req_params)
    .map(res => res)
    .catch(err => (err));
  }

  
  getAllScale() {
      
 
    return this.http.get(appSettings.GET_ALLSCALES)
    .map(res => res)
    .catch(err => (err));
 
   }
}
