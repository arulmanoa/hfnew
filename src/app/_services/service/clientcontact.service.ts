import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class ClientContactService {

   
    constructor(

        private http: HttpService,

    ) { }

    getClientContact() {
      
        return this.http.get(appSettings.GETCLIENTCONTACT)
        .map(res => res)
        .catch(err => (err));
     
       }
          
       // HTTPPUT Insert
       postClientContact(data) {
     
         return this.http.put(appSettings.POSTCLIENTCONTACT, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       
         
       // HTTPPUT update
       putClientContact(data) {
     
         return this.http.put(appSettings.PUTCLIENTCONTACT, data)
         .map(res => res)
         .catch(err => (err));
     
       }
     
       deleteClientContact(data) {
     
         return this.http.put(appSettings.DELETECLIENTCONTACT, data)
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
      
       getclientbyid(req_param_uri) {              
        return this.http.get(appSettings.GETClIENTBYID+req_param_uri )
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
         
       getClientContactbyClientId(data){
        let req_param = `Id=${data}`;
          return this.http.get(appSettings.GETCLIENTCONTACTBYCLIENTID+req_param)
          .map(res=>res)
          .catch(err=>(err));
       }

       getUserMappedClientList(roleId, userId) {

        let req_params = `roleId=${roleId}&userId=${userId}`
        return this.http.get(appSettings.GET_USERMAPPEDCLIENTLIST + req_params)
            .map(res => res)
            .catch(err => (err));
      }
}