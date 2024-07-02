import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';


@Injectable({
    providedIn: 'root'
})
export class WorkflowService {

    constructor(

        private http: HttpService,

    ) { }


    public postWorkFlow(data) {

        return this.http.post(appSettings.POSTWORKFLOW, data)
            .map(res => res)
            .catch(err => (err));

    }

    public postWorkFlowForDOJRequest(data) {

        return this.http.post(appSettings.POSTWORKFLOWDOJREQ, data)
            .map(res => res)
            .catch(err => (err));

    }

    

    public UpdatePendingAtUserId(data)
    {
        return this.http.post(appSettings.UPDATE_PENDING_AT_USERID, data)
                                .map(res=>res)
                                .catch(err=>(err));
    }
    


}