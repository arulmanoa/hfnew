import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { HttpService } from './http.service';
import {appSettings} from '../../_services/configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class WagesService {

  constructor(  private http: HttpService ) { }

  getWages() {
      
    return this.http.get(appSettings.GETMINIMUMWAGES)
    .map(res => res)
    .catch(err => (err));
 
  }

  editwages(Id:any){
    let req_params = `Id=${Id} `
    return this.http.get(appSettings.EDITMINIMUMWAGES + req_params)
    .map(res => res)
    .catch(err => (err));
  }

  deleteWages(data) {

    return this.http.put(appSettings.DELETEWAGES, data)
    .map(res => res)
    .catch(err => (err));

  }

  putWages(data) {

    return this.http.put(appSettings.PUTWAGES, data)
    .map(res => res)
    .catch(err => (err));

  }
  postWages(data) {

    return this.http.put(appSettings.POSTWAGES, data)
    .map(res => res)
    .catch(err => (err));

  }

  getSkillcategory(){
    return this.http.get(appSettings.GETSKILLCATEGORY)
    .map(res => res)
    .catch(err => (err));
  }

   getZones() {
      
    return this.http.get(appSettings.GETZONES)
    .map(res => res)
    .catch(err => (err));
 
   }

   getIndustrys() {
      
    return this.http.get(appSettings.GETINDUSTRYS)
    .map(res => res)
    .catch(err => (err));
 
   }

   getProducts() {
      
    return this.http.get(appSettings.GETPRODUCTS)
    .map(res => res)
    .catch(err => (err));
 
   }

}
