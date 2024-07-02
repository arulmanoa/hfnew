import { Injectable } from 'node_modules/@angular/core';
import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class BankBranchService {


    constructor(

        private http: HttpService,

    ) { }

    getBankBranch() {
      
        return this.http.get(appSettings.GETBANKBRANCH)
        .map(res => res)
        .catch(err => (err));
     
       }

       getBankBranchById(req_params_Uri) {
      
        return this.http.get(appSettings.GETBANKBRANCHBYID + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }
       getBankBranchByBankId(req_params_Uri) {
      
        return this.http.get(appSettings.GETBANKBRANCHBYBANKID + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }
       getBankBranchByFSCode(req_params_Uri) {
      
        return this.http.get(appSettings.GETBANKBRANCHBYFSCODE + req_params_Uri)
        .map(res => res)
        .catch(err => (err));
     
       }
      
       // HTTPPUT Insert
       postBankBranch(data) {
     
         return this.http.put(appSettings.POSTBANKBRANCH, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       
         
       // HTTPPUT update
       putBankBranch(data) {
     
         return this.http.put(appSettings.PUTBANKBRANCH, data)
         .map(res => res)
         .catch(err => (err));
     
       }
     
       deleteBankBranch(data) {
     
         return this.http.put(appSettings.DELETEBANKBRANCH, data)
         .map(res => res)
         .catch(err => (err));
     
       }
       


}