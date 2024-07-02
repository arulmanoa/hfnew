import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { HttpService } from './http.service';
import {appSettings} from '../../_services/configs/app-settings.config';
import { ScaleListComponent } from 'src/app/views/scale-list/scale-list.component';

@Injectable({
  providedIn: 'root'
})
export class ScaleService {

  constructor( private http: HttpService  ) { }


  getAllScale() {
      
 
    return this.http.get(appSettings.GET_ALLSCALES)
    .map(res => res)
    .catch(err => (err));
 
   }

   editScale(Id:any){
    let req_params = `Id=${Id} `
    return this.http.get(appSettings.GETSCALEBY_ID + req_params)
    .map(res => res)
    .catch(err => (err));
  }


  postScale(data) {

    return this.http.put(appSettings.POSTSCALE, data)
    .map(res => res)
    .catch(err => (err));

  }
  
  putScale(data) {

    return this.http.put(appSettings.PUTSCALE, data)
    .map(res => res)
    .catch(err => (err));

  }


   deleteScale(data) {
         return this.http.put(appSettings.GETSCALEBY_ID, data)
    .map(res => res)
    .catch(err => (err));

  }
   scalelist : ScaleListComponent;

  DeleteScaleDetailesByScaleId(data){
    return this.http.put(appSettings.DELETE_SCALE,data)
    .map(res => res)
    .catch(err => (err));
  }
  

}
