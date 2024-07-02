import {ServiceBase} from './servicebase';
import {ApiConstants, ControllerConstants} from '../model/Common/constants';
import { Injectable } from '@angular/core';
import {SessionData} from '../model/Common/sessionData';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})

export class TemplateService
{
  constructor(private base:HttpService, private session:SessionData){}

  getActiveTemplateCategoriesForAllCompanies()
  {
      return this.base.get(ControllerConstants.TEMPLATE + ApiConstants.GET_ACTIVE_TEMPLATE_CATEGORIES_FOR_ALL_COMPANIES);
  }

  getTemplatesByImplementation()
  {
    return this.base.get(ControllerConstants.TEMPLATE+ApiConstants.GET_TEMPLATES_BY_IMPLEMENTATION);

  }

  upsertTemplate(template)
  {
    return this.base.put(ControllerConstants.TEMPLATE + ApiConstants.UPSERT_TEMPLATE, template);
  }

  getTemplateById(templateId)
  {
    return this.base.get(ControllerConstants.TEMPLATE + ApiConstants.GET_TEMPLATE_BY_ID + '\\' + templateId);

  }

}