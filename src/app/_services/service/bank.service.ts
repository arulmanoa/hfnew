import { Injectable } from 'node_modules/@angular/core';
import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class BankService {


    constructor(

        private http: HttpService,

    ) { }

    getBank() {
      
        return this.http.get(appSettings.GETBANK)
        .map(res => res)
        .catch(err => (err));
     
       }

       getBankById(req_params_Uri) {
      
        return this.http.get(appSettings.GETBANKBYID + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }
       getBankByCode(req_params_Uri) {
      
        return this.http.get(appSettings.GETBANKBYCODE + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }
      
       // HTTPPUT Insert
       postBank(data) {
     
         return this.http.put(appSettings.POSTBANK, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       
         
       // HTTPPUT update
       putBank(data) {
     
         return this.http.put(appSettings.PUTBANK, data)
         .map(res => res)
         .catch(err => (err));
     
       }
     
       deleteBank(data) {
     
         return this.http.put(appSettings.DELETEBANK, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       


}