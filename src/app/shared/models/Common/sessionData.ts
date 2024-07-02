import { Injectable } from '@angular/core';

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
        this.Properties["ImplementationAPI"] = 'http://34.67.27.23/hrsuite.api/api/';
        this.Properties["AdminAPI"] = 'http://35.206.110.6/AdminApi/api/';
    }

}