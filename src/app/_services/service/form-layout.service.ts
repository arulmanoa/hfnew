import { Injectable } from '@angular/core';
import { FormLayout, DataSourceTreeNode, FormAuditModel } from 'src/app/views/generic-form/form-models';
import { DataSource } from 'src/app/views/personalised-display/models';
import { HttpService } from './http.service';
import { appSettings } from '../model';
import { ApiRequestType } from 'src/app/views/generic-import/import-enums';

@Injectable({
  providedIn: 'root'
})
export class FormLayoutService {
  formLayout : FormLayout;
  node : DataSourceTreeNode;
  ColumnNamesObject : {};
  editing : boolean = false;
  
  constructor(private http : HttpService) { }

  getFormLayout(code : string){
    let req_params = `code=${code}`;
    return this.http.get(appSettings.GETFORMLAYOUT + req_params)
    .catch(err => (err));
  }

  postFormLayout(formLayout : FormLayout){
    //this.updatePageLayoutDB(pageLayout);
   return this.http.post(appSettings.POSTFORMLAYOUT , formLayout )
  }

  upsertFormDetails(formAuditmodel :FormAuditModel , dataSource : DataSource = null){
    return this.http.put(appSettings.UPSERTFORMDETAILS , {FormAuditModel : formAuditmodel , DataSource : dataSource});
  }

  uploadDataToCustomApi(apiName : string , data :any , requestType : ApiRequestType = null ){
    if(requestType == null){
      requestType = ApiRequestType.post
    }
    let request : string = ApiRequestType[requestType];
    // console.log("Request" , request);
    return this.http[request](apiName , data);
  }
  
  uploadFormDataToCustomSP(formLayoutCode : string , data :any  ){
    return this.http.put(appSettings.UPLOADFORMDATATOCUSTOMSP , {Code : formLayoutCode , Data :  data});
  }


}
