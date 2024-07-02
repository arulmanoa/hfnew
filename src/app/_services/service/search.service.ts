import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { HttpService } from './http.service';
import {appSettings} from '../../_services/configs/app-settings.config';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private http: HttpService,
  ) { }

  updateClaimOnBoardRequest(data) {

    return this.http.post_text(appSettings.UPDATE_CLAIMONBOARDINGREQUEST, data)
    .map(res => res)
    .catch(err => (err));

  }
  _GetRecentWOWRequests(req){
    return this.http.get(appSettings.GETRECENTWOWREQUESTSMETHOD + req)
    .map(res => res)
    .catch(err => (err));
  }

  updateVoidOnBoardRequest(data) {

    return this.http.post_text(appSettings.UPDATE_VOIDONBOARDINGREQUEST, data)
    .map(res => res)
    .catch(err => (err));

  }

  updateCandidateOfferDetailAsNotJoined(data) {

    return this.http.post_text(appSettings.UPDATE_CANDIDATENOTJOINED, data)
    .map(res => res)
    .catch(err => (err));

  }
  ValidateAndUpdateToMakeOfferForSeparation(data) {

    return this.http.post_text(appSettings.UPDATE_ANDVALIDATETOMAKEOFFERFORSEPARATION, data)
    .map(res => res)
    .catch(err => (err));

  }

  ReUpdateSeparatedCandidateOfferAsActive(data){
    return this.http.post_text(appSettings.UPDATE_SEPARATEDCANDIDATEOFFERASACTIVE, data)
    .map(res => res)
    .catch(err => (err));

  }
  

  getValidToMakeOffer(data) {

    return this.http.get(appSettings.GET_ISVALIDTOMAKEOFFER + data)
    .map(res => res)
    .catch(err => (err));

  }


  getDashboardDetails(req_params_Uri){
    return this.http.get(appSettings.GET_DASHBOARD_DETAILS + req_params_Uri)
    .map(res => res)
    .catch(err => (err));
  }

  getESSDashboardDetails(req_params_Uri){
    return this.http.get(appSettings.GET_ESS_DASHBOARD_DETAILS + req_params_Uri)
    .map(res => res)
    .catch(err => (err));
  }

  ValidateCandidateToCancelOffer(data) {
    return this.http.post_text(appSettings.POST_VALIDATECANDIDATETOCANCELOFFER, data)
    .map(res => res)
    .catch(err => (err));

  }
  GetESSDashboardDetailsByEmployeeId(employeeId){
    let req_params_Uri = `${employeeId}`;
    return this.http.get(appSettings.GET_ESS_DASHBOARD_DETAILSBYEMPLOYEEID + req_params_Uri)
    .map(res => res)
    .catch(err => (err));
  } 
}
