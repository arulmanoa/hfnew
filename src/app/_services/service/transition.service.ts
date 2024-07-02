import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';


@Injectable({
    providedIn: 'root'
})
export class TransitionService {

    constructor(

        private http: HttpService,

    ) { }


    putEmployeeTransition(data) {

        return this.http.put(appSettings.PUT_INITIATE_EMPLOYEETRANSITION, data)
            .map(res => res)
            .catch(err => (err));

    }
    postEmployeeMigrationSingle(data){
        return this.http.post(appSettings.Post_EMPLOYEE_MIGRATION, data)
        .map(res => res)
        .catch(err => (err));
    }

   

}