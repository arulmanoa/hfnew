import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {

   
    constructor(

        private http: HttpService,

    ) { }

   
    public getDocumentCategory(req_params_Uri): any {
      
        return this.http.get(appSettings.GET_DOCUMENTCATEGORY + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public getDocumentDuplicate(req_params_Uri): any {
      
        return this.http.get(appSettings.GET_CANDIDATEDOCUMENTCHECK + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }


}