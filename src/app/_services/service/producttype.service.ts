import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class ProductTypeService {

   
    constructor(

        private http: HttpService,

    ) { }
    
    getProductType() {
      
        return this.http.get(appSettings.GETPRODUCTTYPE)
        .map(res => res)
        .catch(err => (err));
     
       }
       getProductTypeById(req_param_uri) {
      
        return this.http.get(appSettings.GETPRODUCTTYPEBYID+ req_param_uri)
        .map(res => res)
        .catch(err => (err));
     
       }
       
       // HTTPPUT Insert
       postProductType(data) {
     
         return this.http.put(appSettings.POSTPRODUCTTYPE, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       
         
       // HTTPPUT update
       putProductType(data) {
     
         return this.http.put(appSettings.PUTPRODUCTTYPE, data)
         .map(res => res)
         .catch(err => (err));
     
       }
     
       deleteProductType(data) {
     
         return this.http.put(appSettings.DELETEPRODUCTTYPE, data)
         .map(res => res)
         .catch(err => (err));
     
       }


}