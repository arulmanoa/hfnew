import {ServiceBase} from './servicebase';
import {ApiConstants, ControllerConstants} from '../model/Common/constants';
import { Injectable } from 'node_modules/@angular/core';
import {SessionData} from '../model/Common/sessionData';

@Injectable({
  providedIn: 'root'
})

export class ApplicationService
{
  constructor(private base:ServiceBase, private session:SessionData){}

  GetImplementationCompanyCodesByImplementation()
  {
      return this.base.getData(ControllerConstants.APPLICATION, ApiConstants.GET_IMPL_COMPANY_CODES_BY_IMPLEMENTATION);
  }

}