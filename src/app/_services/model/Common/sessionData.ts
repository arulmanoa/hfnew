import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class SessionData {

    public storage: any;
    public Properties: { [key: string]: any };
    public constructor() 
    {
        this.Properties = {};
        // this.Properties["AdminAPI"] = 'https://localhost:44364/api/';
        this.Properties["ImplementationAPI"] = environment.environment.API_BASE_URL;
        this.Properties["AdminAPI"] = environment.environment.Admin_BASE_URL; 
    }

}