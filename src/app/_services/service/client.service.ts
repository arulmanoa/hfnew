import { ServiceBase } from './servicebase';
import { ApiConstants, ControllerConstants } from '../model/Common/constants';
import { Injectable } from '@angular/core';
import { SessionData } from '../model/Common/sessionData';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import 'rxjs';

@Injectable({

  providedIn: 'root'
})

export class ClientService {
  constructor(private base: ServiceBase, private session: SessionData, private http: HttpService) { }

  GetClientBaseCodesByImplementationCompany(implCompId) {
    return this.base.getData(ControllerConstants.CLIENT, ApiConstants.GET_CLIENT_CODES_BY_IMPL_COMPANY, implCompId);
  }

  GetClientContractBaseCodesByClientId(clientId) {
    return this.base.getData(ControllerConstants.CLIENT, ApiConstants.GET_CLIENTCONTRACT_CODES_BY_CLIENTID, clientId);
  }

  LoadClientLookupDetails() {
    return this.http.get(appSettings.GET_LOOKUPCLIENTDETAILS)
      .map(data => data)
      .catch(err => (err));
  }
  LoadTeamLookupDetails() {
    return this.http.get(appSettings.GET_LOOKUPTEAMDETAILS)
      .map(data => data)
      .catch(err => (err));
  }
  GetTeamById(Id) {
    let req_param = `Id=${Id}`;
    return this.http.get(appSettings.GET_TEAMBYID + req_param)
      .map(res => res)
      .catch(err => (err));
  }
  GetPayPeriodListByPayCyleId(PayCycleId) {
    let req_param = `PayCycleId=${PayCycleId}`;
    return this.http.get(appSettings.GET_GETPAYPERIODBYPAYCYCLEID + req_param)
      .map(res => res)
      .catch(err => (err));
  }

  LoadCostCodeLookupDetailsbyClientId(ClientId) {
    let req_param = `ClientId=${ClientId}`;
    return this.http.get(appSettings.GET_COSTCODELOOKUPDETAILSBYCLIENTID + req_param)
      .map(res => res)
      .catch(err => (err));
  }
  
  GetCostCodeDetailsbyId(Id) {
    let req_param = `Id=${Id}`;
    return this.http.get(appSettings.GET_COSTCODEDETAILSBYID + req_param)
      .map(res => res)
      .catch(err => (err));
  }
  //http insert
  postClient(data) {
    return this.http.put(appSettings.POSTCLIENT, data)
      .map(res => res)
      .catch(err => (err));
  }

  UpsertTeamDetails(data) {
    return this.http.put(appSettings.PUT_UPSERTTEAMDETAILS, data)
      .map(res => res)
      .catch(err => (err));
  }

  UpsertCostCodeDetails(data) {
    return this.http.put(appSettings.PUT_COSTCODEDETAILS, data)
      .map(res => res)
      .catch(err => (err));
  }

  //http update
  putClient(data) {
    return this.http.put(appSettings.PUTCLIENT, data)
      .map(res => res)
      .catch(err => (err));

  }

  //http getCompany
  getCompany() {
    return this.http.get(appSettings.GETCOMPANY)
      .map(data => data.filter(x => x != null))
      .catch(err => (err));
  }
  getClient() {
    return this.http.get(appSettings.GETCLIENT)
      .map(data => data.filter(x => x != null))
      .catch(err => (err));
  }

  getClientById(ClientId: any) {
    let req_params = `Id=${ClientId}`
    return this.http.get(appSettings.GETClIENTBYID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  getTeamByClientAndContract(clientId: any, ContractId: any) {
    let req_param1 = `clientId=${clientId}`;
    let req_param2 = `clientContractId=${ContractId}`;
    return this.http.get(appSettings.GETTEAMBYCONTRACTANDCLIENT + req_param1 + '&' + req_param2)
      .map(res => res)
      .catch(err => (err));
  }

  getClientByCompanyId(CompanyId: any) {
    let req_params = `CompanyId=${CompanyId}`;
    return this.http.get(appSettings.GETCLIENTDETAILSBYCOMPANYID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  getAllInvestmentSubmissionSlots() {
    return this.http.get(appSettings.GET_INVESTMENTSUBMISSIONSLOTS)
      .map(res => res)
      .catch(err => (err));
  }

  loadInvestmentSubmissionSlot() {
    return this.http.get(appSettings.GET_LOADINVESTMENTSUBMISSIONSLOT)
      .map(res => res)
      .catch(err => (err));
  }

  getInvestmentSubmissionSlotsById(id: any) {
    const req_params = `Id=${id}`;
    return this.http.get(appSettings.GET_INVESTMENTSUBMISSIONSLOTSBYID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  upsertInvestmentSubmissionSlot(data) {
    return this.http.put(appSettings.PUT_UPSERTINVESTMENTSUBMISSIONSLOT, data)
      .map(res => res)
      .catch(err => (err));
  }

  inactiveInvestmentSubmissionSlot(data) {
    return this.http.put(appSettings.PUT_INACTIVEINVESTMENTSUBMISSIONSLOT, data)
      .map(res => res)
      .catch(err => (err));
  }

  deleteInvestmentSubmissionSlot(id) {
    const req_params = `Id=${id}`;
    return this.http.delete1(appSettings.DELETE_INVESTMENTSUBMISSIONSLOT + req_params)
      .map(res => res)
      .catch(err => (err));

  }

  loadFBPSubmissionSlot() {
    return this.http.get(appSettings.GET_LOADFBPSUBMISSIONSLOT)
      .map(res => res)
      .catch(err => (err));
  }

  getFBPSubmissionSlotsById(id: any) {
    const req_params = `Id=${id}`;
    return this.http.get(appSettings.GET_FBPSUBMISSIONSLOTSBYID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  upsertFBPSubmissionSlot(data) {
    return this.http.put(appSettings.PUT_UPSERTFBPSUBMISSIONSLOT, data)
      .map(res => res)
      .catch(err => (err));
  }

  inactiveFBPSubmissionSlot(data) {
    return this.http.put(appSettings.PUT_INACTIVEFBPSUBMISSIONSLOT, data)
      .map(res => res)
      .catch(err => (err));
  }

  deleteFBPSubmissionSlot(id) {
    const req_params = `Id=${id}`;
    return this.http.delete1(appSettings.DELETE_FBPSUBMISSIONSLOT + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetAllBranchDetails(clientId: any) {
    const req_params = `clientId=${clientId}`;
    return this.http.get(appSettings.GETALLBRANCHDETAILS + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetBranchGapReportForITC(roleId: any, userId: any, districtId: any, branchId: any, startDate: any,endDate: any) {

    const req_params = `roleId=${roleId}&userId=${userId}&districtId=${districtId}&branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`;
    return this.http.get(appSettings.GETBRANCHGAPREPORT + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  loadPayOutLookUpDetailsForITC(userId: any, roleId: any, distributorId: any, payPeriodId: any, type: any) {

    const req_params = `userId=${userId}&roleId=${roleId}&distributorId=${distributorId}&payPeriodId=${payPeriodId}&type=${type}`;
    return this.http.get(appSettings.GET_LOADPAYOUTLOOKUPDETAILSFORITC + req_params)
      .map(res => res)
      .catch(err => (err));
  }
  
  GetMappedClientListByUser() {
    return this.http.get(appSettings.GET_MAPPEDCLIENTLISTBYUSER)
      .map(res => res)
      .catch(err => (err));
  }

  GetMappedClientContractListByUser(clientId: number) {
    const req_params = `clientId=${clientId}`;
    return this.http.get(appSettings.GET_MAPPEDCLIENTCONTRACTLISTBYUSER+ req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetClientLocationByClientId(clientId: number) {
    const req_params = `ClientId=${clientId}`;
    return this.http.get(appSettings.GET_CLIENTLOCATIONBYCLIENTID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetCostCodeByTeamId(TeamId: number) {
    const req_params = `TeamId=${TeamId}`;
    return this.http.get(appSettings.GET_COSTCODEBYTEAMID + req_params)
      .map(res => res)
      .catch(err => (err));
  }

  GetGroupByClientId(clientId: number){
    const req_params = `clientId=${clientId}`;
    return this.http.get(appSettings.GET_GROUP_BY_CLIENTID + req_params)
      .map(res => res)
      .catch(err => (err));
  }


}