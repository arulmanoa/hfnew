import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class ClientLocationService {

   
    constructor(

        private http: HttpService,

    ) { }
    
    getClientLocation() {
      
        return this.http.get(appSettings.GETCLIENTLOCATION)
        .map(res => res)
        .catch(err => (err));
     
       }
       getClientLocationByClientId( ClientId: any) {   
        let req_params = `ClientId=${ClientId} `           
        return this.http.get(appSettings.GETCLIENTLOCATIONBYCLIENTID +req_params )
        .map(res => res)
        .catch(err => (err));
     
       }

       getClientLocationName() {
      
        return this.http.get(appSettings.GETCLIENTLOCATIONName)
        .map(res => res)
        .catch(err => (err));
     
       }
       // HTTPPUT Insert
       postClientLocation(data) {
     
         return this.http.put(appSettings.POSTCLIENTLOCATION, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       
         
       // HTTPPUT update
       putClientLocation(data) {
     
         return this.http.put(appSettings.PUTCLIENTLOCATION, data)
         .map(res => res)
         .catch(err => (err));
     
       }
     
       deleteClientLocation(data) {
     
         return this.http.put(appSettings.DELETECLIENTLOCATION, data)
         .map(res => res)
         .catch(err => (err));
     
       }



       getclient() {              
        return this.http.get(appSettings.GETCLIENT )
        .map(res => res)
        .catch(err => (err));
     
       }

       getclientList() {              
        return this.http.get(appSettings.GETCLIENTLIST )
        .map(res => res)
        .catch(err => (err));
     
       }


       getcountry() {              
        return this.http.get(appSettings.GETCOUNTRY )
        .map(res => res)
        .catch(err => (err));
     
       }

     getstate( CountryId: any) {   
        let req_params = `CountryId=${CountryId} `           
        return this.http.get(appSettings.GETSTATES +req_params )
        .map(res => res)
        .catch(err => (err));
     
       }

       getcity( StateId: any) {   
        let req_params = `StateId=${StateId} `           
        return this.http.get(appSettings.GETCITY +req_params )
        .map(res => res)
        .catch(err => (err));
     
       }

       getdistrict( StateId: any) {   
        let req_params = `StateId=${StateId} `           
        return this.http.get(appSettings.GETDISTRICT +req_params )
        .map(res => res)
        .catch(err => (err));
     
       }

       getUserMappedClientList(roleId, userId) {

        let req_params = `roleId=${roleId}&userId=${userId}`
        return this.http.get(appSettings.GET_USERMAPPEDCLIENTLIST + req_params)
            .map(res => res)
            .catch(err => (err));
      }

       getUserMappedClientLocationList(roleId, userId) {

        let req_params = `roleId=${roleId}&userId=${userId}`
        return this.http.get(appSettings.GET_USERMAPPEDCLIENTLOCATIONLIST + req_params)
            .map(res => res)
            .catch(err => (err));
      }

    
   

             

}