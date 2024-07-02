import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import { environment } from "../../../environments/environment";
@Injectable({
    providedIn: 'root'
})
export class CandidateService {


    constructor(

        private http: HttpService,

    ) { }

     getVerificationKey(EncryptedText : string): any {

        // let req_params = `EncryptedText=${EncryptedText} `
        return this.http.postWithoutSecurity(appSettings.VERIFICATION_LINK , JSON.stringify(EncryptedText))
            .map(res => res)
            .catch(
                err => (err)
            );
    }

     getUIOfferData(data) {

        return this.http.put_text(appSettings.GET_UIOFFERDATA ,data)
            .map(res => res)
            .catch(err => (err));
    }

    rejectAcceptanceLetter(data) {

        return this.http.put_text(appSettings.PUT_ACCEPTANCEREJECTION ,data)
            .map(res => res) 
            .catch(err => (err));
    }

    FetchSurveyQuestions(requestParameters) {
      return this.http.put_text(appSettings.FETCH_SURVEYQUESTIONS ,requestParameters)
        .map(res => res)
        .catch(err => (err));
    }

    RecordSurveyResponses(data) {

      return this.http.put(appSettings.PUT_RECORDSURVEYRESPONSES , data)
          .map(res => res)
          .catch(err => (err));
  }


}