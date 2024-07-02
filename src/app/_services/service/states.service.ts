import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { HttpService } from './http.service';
import {appSettings} from '../../_services/configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class StatesService {

  constructor(
    private http: HttpService,
  ) { }

  
  getStates(countryId: any) {
      
    let req_params = `CountryId=${countryId} `
    return this.http.get(appSettings.GETSTATES + req_params)
    .map(res => res)
    .catch(err => (err));
 
   }

    
  editState(Id:any){
    let req_params = `Id=${Id} `
    return this.http.get(appSettings.GET_STATEBYID + req_params)
    .map(res => res)
    .catch(err => (err));
  }

   postStates(data) {

    return this.http.put(appSettings.POSTSTATES, data)
    .map(res => res)
    .catch(err => (err));

  }
  
  putStates(data) {

    return this.http.put(appSettings.PUTSTATES, data)
    .map(res => res)
    .catch(err => (err));

  }


  deleteStates(data) {

    return this.http.put(appSettings.DELETESTATES, data)
    .map(res => res)
    .catch(err => (err));

  }



  
  getAllScale() {
      
 
    return this.http.get(appSettings.GET_ALLSCALES)
    .map(res => res)
    .catch(err => (err));
 
   }

   getStateById(Id) {
      
    let req_params = `Id=${Id} `
    return this.http.get(appSettings.GET_STATEBYID + req_params)
    .map(res => res)
    .catch(err => (err));
 
   }

  
}
