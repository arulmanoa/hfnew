import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class PaygroupService {

  constructor(
    private http: HttpService,
  ) { }


  

   getProduct() {
      
    return this.http.get(appSettings.GETPRODUCTWITHALLDATA)
    .map(res => res)
    .catch(err => (err));
 
   }


   getProductType() {
      
    return this.http.get(appSettings.GETPRODUCTTYPE)
    .map(res => res)
    .catch(err => (err));
 
   }

   getalltaxcodes() {
      
    return this.http.get(appSettings.GETALLTAXCODES)
    .map(res => res)
    .catch(err => (err));
 
   }


   getAllPaygroup() {
      
 
    return this.http.get(appSettings.GETALLPAYGROUPS)
    .map(res => res)
    .catch(err => (err));
 
   }

  

  editPaygroupproduct(req_params_Uri) {
      
    return this.http.get(appSettings.GETPAYGROUPPRODUCTBY_ID + req_params_Uri)
    .map(res => res)
    .catch(err => (err));
 
   }


   postPaygroupProduct(data) {

    return this.http.put(appSettings.POSTPAYGROUPPRODUCT, data)
    .map(res => res)
    .catch(err => (err));

  }
  
  putPaygroupProduct(data) {

    return this.http.put(appSettings.PUTPAYGROUPPRODUCT, data)
    .map(res => res)
    .catch(err => (err));

  }


  deletePaygroup(data) {
     
    return this.http.put(appSettings.DELETEPAYGROUPPRODUCT, data)
    .map(res => res)
    .catch(err => (err));

  }

}
