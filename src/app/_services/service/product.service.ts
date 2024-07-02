import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

   
    constructor(

        private http: HttpService,

    ) { }

    getProduct() {
      
        return this.http.get(appSettings.GETPRODUCT)
        .map(res => res)
        .catch(err => (err));
     
       }

       getProductById(req_params_Uri) {
      
        return this.http.get(appSettings.GETPRODUCTBYID + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }

       getProductByGroupId(req_params_Uri) {
      
        return this.http.get(appSettings.GETPRODUCTBYGroupID + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }
       GetPayGroupDetailsbyId(req_params_Uri) {
      
        return this.http.get(appSettings.GETPAYGROUPDETAILSBYID + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }
       
       // HTTPPUT Insert
       postProduct(data) {
     
         return this.http.put(appSettings.POSTPRODUCT, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       
         
       // HTTPPUT update
       putProduct(data) {
     
         return this.http.put(appSettings.PUTPRODUCT, data)
         .map(res => res)
         .catch(err => (err));
     
       }
     
       deleteProduct(data) {
     
         return this.http.put(appSettings.DELETEPRODUCT, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       deleteProductApplicability(data) {
     
        return this.http.put(appSettings.DELETEPRODUCTAPPLICABILITY, data)
        .map(res => res)
        .catch(err => (err));
    
      }
      getalltaxcodes() {
      
        return this.http.get(appSettings.GETALLTAXCODES)
        .map(res => res)
        .catch(err => (err));
     
       }

       Get_LoadProductLooupDetails(){

        return this.http.get(appSettings.GET_LOADPRODUCTLOOUPDETAILS)
        .map(res => res)
        .catch(err => (err));
     
       }

       

}