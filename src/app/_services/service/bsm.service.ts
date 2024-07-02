import {ServiceBase} from './servicebase';
import {ApiConstants, ControllerConstants} from '../model/Common/constants';
import { Injectable } from 'node_modules/@angular/core';
import {SessionData} from '../model/Common/sessionData';

@Injectable({
  providedIn: 'root'
})

export class BSMService
{
  constructor(private base:ServiceBase, private session:SessionData){}

  GetBusinessSystemById(id)
  {
    return this.base.getData(ControllerConstants.BUSINESS_SYSTEM_MANAGER, ApiConstants.GET_BUSINESSSYSTEM_BY_ID, id);
  }

  GetBusinessSystemCodesByImplementation()
  {
      return this.base.getData(ControllerConstants.BUSINESS_SYSTEM_MANAGER, ApiConstants.GET_BUSINESSSYSTEM_CODES_BY_IMPLEMENTATION);
  }

  getBusinessSystemByImplementation(data) {
    return this.base.getData(ControllerConstants.BUSINESS_SYSTEM_MANAGER, ApiConstants.GET_BUSINESSSYSTEM_BY_IMPLEMENTATION,data);
  }

  getBusinessSystems() {
    return this.base.getData(ControllerConstants.BUSINESS_SYSTEM_MANAGER, ApiConstants.GET_BUSINESS_SYSTEMS);
  }

  upsertBusinessSystem(data) {
    return this.base.postData(ControllerConstants.BUSINESS_SYSTEM_MANAGER, ApiConstants.UPSERT_BUSINESS_SYSTEM,data);
  }

  deleteBusinessSystem(data){
    return this.base.putData(ControllerConstants.BUSINESS_SYSTEM_MANAGER, ApiConstants.DELETE_BUSINESS_SYSTEM,data);
  }

}