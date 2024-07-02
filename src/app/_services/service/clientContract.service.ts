import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class ClientContractService {

  constructor(
    private http: HttpService,
  ) { }


  getClientContractById(clientId) {

    let req_params = `Id=${clientId} `
    return this.http.get(appSettings.GET_CLIENTCONTRACTBYID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  getPayPerdiodList() {
    return this.http.get(appSettings.GET_PAYPERIODLIST).map(res => res).catch(err => (err));
  }

  GetGenericMasterListByMasterType(typeId) {

    let req_params = `genericMasterType=${typeId} `
    return this.http.get(appSettings.GET_GENERICMASTERBYMASTERTYPE + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetGenericMasterDataById(TypId) {
    let req_params = `Id=${TypId} `
    return this.http.get(appSettings.GET_GENERICMASTERBYMASTERDATABYID + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetAllGenericMasterData() {
    return this.http.get(appSettings.GETGENERICMASTER)
      .map(res => res)
      .catch(err => (err));
  }


  postClientContractdetils(data) {

    return this.http.put(appSettings.POSTCLIENTCONTRACTDETAILS, data)
      .map(res => res)
      .catch(err => (err));

  }

  putClientContractdetils(data) {

    return this.http.put(appSettings.PUSTCLIENTCONTRACTDETAILS, data)
      .map(res => res)
      .catch(err => (err));

  }

  getclient() {
    return this.http.get(appSettings.GETCLIENT)
      .map(res => res)
      .catch(err => (err));

  }


  getClientContact() {

    return this.http.get(appSettings.GETCLIENTCONTACT)
      .map(res => res)
      .catch(err => (err));

  }

  getclientcontractlookupDetails() {

    return this.http.get(appSettings.LOADCLIENTCONTRACTLOOKUPDETAILS)
      .map(res => res)
      .catch(err => (err));

  }

  //MARKUP MAPPING DETAILS

  get_AllMarkupMappingList() {

    return this.http.get(appSettings.GET_MARKUPMAPPINGLIST)
      .map(res => res)
      .catch(err => (err));
  }

  Get_MarkupMappingDetails(Id) {

    let req_params = `Id=${Id} `
    return this.http.get(appSettings.GET_MARKUPMAPPINGDETAILSBYCONTRACTID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  Put_UpsertClientContract(data) {
    return this.http.put(appSettings.PUT_UPSERCLIENTCONTRACTDETAILS, data)
      .map(res => res)
      .catch(err => (err));
  }

  Put_UpsertBillingProductGroup(data) {
    return this.http.put(appSettings.PUT_UPSERTBILLINGPRODUCTGROUP, data)
      .map(res => res)
      .catch(err => (err));
  }

  Get_ProductBillingGroupByClientContractId(ClientContractId: any) {

    let req_params = `clientContractId=${ClientContractId} `
    return this.http.get(appSettings.GET_PRODUCTBILLINGGROUPCONTRACTID + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetProductWiseInvoiceGroupByContractId(ClientContractId: any) {

    let req_params = `clientContractId=${ClientContractId} `
    return this.http.get(appSettings.GET_PRODUCTWISEINVOICEGROUP + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  GetClientSaleOrderGroupingByContractId(ClientContractId: any) {

    let req_params = `clientContractId=${ClientContractId} `
    return this.http.get(appSettings.GET_CLIENTSALEORDERGROUPINGBYCONTRACTID + req_params)
      .map(res => res)
      .catch(err => (err));
  }


  Put_Put_UpsertProductWiseInvoiceGroup(data) {
    return this.http.put(appSettings.PUT_UPSERTPRODUCTWISEINVOICEGROUP, data)
      .map(res => res)
      .catch(err => (err));
  }

  GetAllClientSaleOrderGroupingField() {

    return this.http.get(appSettings.GET_ALLSALEORDERGROUPINGFIELD)
      .map(res => res)
      .catch(err => (err));
  }

  Put_UpsertClientSaleOrderGrouping(data) {
    return this.http.put(appSettings.PUT_UPSERTCLIENTSALEORDERGROUPING, data)
      .map(res => res)
      .catch(err => (err));
  }

  // shashank
  getClientContract(clientId) {

    let req_params = `clientId=${clientId} `
    return this.http.get(appSettings.GETCLIENTCONTRACT + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  getUserMappedClientContractList(roleId, userId, clientId) {

    let req_params = `roleId=${roleId}&userId=${userId}&clientId=${clientId}`
    return this.http.get(appSettings.GET_USERMAPPEDCLIENTCONTRACTLIST + req_params)
      .map(res => res)
      .catch(err => (err));
  }

}
