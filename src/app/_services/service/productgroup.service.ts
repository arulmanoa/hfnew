import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class ProductGroupService {

   
    constructor(

        private http: HttpService,

    ) { }

    getProductGroup() {
      
        return this.http.get(appSettings.GETPRODUCTGROUP)
        .map(res => res)
        .catch(err => (err));
     
       }
       
       // HTTPPUT Insert
       postProductGroup(data) {
     
         return this.http.put(appSettings.POSTPRODUCTGROUP, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       
         
       // HTTPPUT update
       putProductGroup(data) {
     
         return this.http.put(appSettings.PUTPRODUCTGROUP, data)
         .map(res => res)
         .catch(err => (err));
     
       }
     
       deleteProductGroup(data) {
     
         return this.http.put(appSettings.DELETEPRODUCTGROUP, data)
         .map(res => res)
         .catch(err => (err));
     
       }

       getProductGroupById(req_param_uri) {
      
        return this.http.get(appSettings.GETPRODUCTGROUPBYID+ req_param_uri)
        .map(res => res)
        .catch(err => (err));
     
       }


}