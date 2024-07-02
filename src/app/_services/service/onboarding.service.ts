import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";

import 'rxjs/add/observable/of';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import { OnboardingGrid } from '../model/OnboardingGrid.model';

@Injectable({
    providedIn: 'root'
})
export class OnboardingService {

    onbIMBRecs: OnboardingGrid[];
    constructor(

        private http: HttpService,

    ) { }

    getRecordsInMyBucket(data) {

        // get currenrtRoleid from session
        // get userId from session


        // return this.http.get(appSettings.RECRUITER_CANDIDATE_WORKFLOW_DETAILS + "/" + data + "/"+ 0 + "/" + "''")
        // .map(res => res)
        // .catch(err => (err));


        this.onbIMBRecs =
            [
                {
                    id: 1,
                    ProcessTransactionId: 1,
                    ActionTransactionId: 11,//
                    ClientId: 1,
                    ClientName: 'IBM India',
                    ContractId: 10,
                    ContractName: 'IBM India',
                    MandateAssignmentId: 24,
                    Mandate: 'Java 2-4, 5LPA',
                    CandidateId: 500,
                    CandidateName: 'Chris Nolan',
                    RequestedFor: 'Self',
                    ExpectedDOJ: new Date('25-10-2019'),
                    RequestedOn: new Date('2019-10-06'),
                    StatusId: 0,
                    Status: 'RecrSavedOLRRequest',
                    PendingAtUserId: 22,
                    PendingAtUserName: 'Arjit',
                    RejectedByUserId: 0,
                    RejectedByUserName: '',
                    RejectionReason: ''
                },
                {
                    id: 2,
                    ProcessTransactionId: 2,
                    ActionTransactionId: 12,//ActionTransactionId
                    ClientId: 1,
                    ClientName: 'IBM India',
                    ContractId: 10,
                    ContractName: 'IBM India',
                    MandateAssignmentId: 24,
                    Mandate: 'Java 2-4, 5LPA',
                    CandidateId: 501,
                    CandidateName: 'Anabelle',
                    RequestedFor: 'Self',
                    ExpectedDOJ: new Date('2019-10-25'),
                    RequestedOn: new Date('2019-10-06'),
                    StatusId: 0,
                    Status: 'RecrSavedALRRequest',
                    PendingAtUserId: 22,
                    PendingAtUserName: 'Arjit',
                    RejectedByUserId: 0,
                    RejectedByUserName: '',
                    RejectionReason: ''
                }
            ]

        return Observable.of(this.onbIMBRecs).map(o => JSON.stringify(this.onbIMBRecs));
    }

    public getCandidate(req_params_Uri): any {

        return this.http.get(appSettings.GETCANDIDATE + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }
    public FetchCandidateDataUsingCandidateId(req_params_Uri): any {
      return this.http.get(appSettings.GETCANDIDATEDATAUSINGCANDIDATEID + req_params_Uri)
          .map(res => res)
          .catch(
              err => (err)
          );
  }

    public getOnboardingQCInfo(tranId): any {
        return this.http.get(appSettings.GET_CANDIDATE_QC_INFO + tranId)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public getCandidateViewsDetails(): any {
        return this.http.get(appSettings.GET_CANDIDATEVIEWSDETAILS)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public updateOnboardingQCInfo(data) {
        return this.http.post(appSettings.POST_CANDIDATE_QC_INFO, data)
            .map(res => res)
            .catch(err => (err));

    }

    public getOnboardingListingInfo(ScreenType: any, RoleId: any, searchParameter: any): any {

        let req_params_Uri = `${ScreenType}/${RoleId}/${searchParameter}`;
        return this.http.get(appSettings.GET_ONBOARDING_LISTING + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }
    public GetOnboardingCandidates(ScreenType: any, RoleId: any, searchParameter: any, clientId: number = 0, clientContractId: number = 0): any {
        let req_params_Uri = `${ScreenType}/${RoleId}/${searchParameter}/${clientId}/${clientContractId}`;
        return this.http.get(appSettings.GET_ONBOARDING_CANDIDATES + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    public GetAllenOnboardingCandidates(requestParameters): any {
      return this.http.get(appSettings.GET_ONBOARDING_ALLCANDIDATES + requestParameters)
          .map(res => res)
          .catch(
              err => (err)
          );
  }


    GetPayGroupDetails(ClientContractId: any): any {
        let req_params_Uri = `${ClientContractId}`;
        return this.http.get(appSettings.GET_PAYGROUPDETAILSBYCONTRACTID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }




    public GetSeparatedCandidateList(_clientId: any, _clientContractId: any, RoleCode): any {

        let req_params_Uri = `${_clientId}/${_clientContractId}/${RoleCode}`;
        return this.http.get(appSettings.GET_SEPARATEDCANDIDATELIST + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public getOnboardingInfo(controlSetName: any, userId: any, clientId): any {

        let req_params_Uri = `${controlSetName}/${userId}/${clientId}`;
        return this.http.get(appSettings.GET_ONBOARDING_MASTER_INFO + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }


    public getMandatesForOnboarding(userId: any, clientId: any) {

        let req_params_Uri = `${userId}/${clientId}`;
        return this.http.get(appSettings.GET_MANDATESFOR_ONBOARDING_BYUSERID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public getCandidateByAssignmentId(mandateAssignmentId: any) {

        let req_params_Uri = `${mandateAssignmentId}`;
        return this.http.get(appSettings.GET_CANDIDATE_BYASSIGNMENTID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }
    public getAllCandidateInfo(CandidateId: any) {

        let req_params_Uri = `${CandidateId}`;
        return this.http.get(appSettings.GETONBOARDINGCANDIDATEVIEW + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }
    public getSkillaAndZoneByStateAndIndustry(IndustryId: any, StateId: any) {

        let req_params_Uri = `${IndustryId}/${StateId}`;
        return this.http.get(appSettings.GET_SKILANDZONE_BYSTATEANDINDUSTRY + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }


    public putCandidate(data) {

        return this.http.put(appSettings.UPSERTCANDIDATE, data)
            .map(res => res)
            .catch(err => (err));

    }

    public postWorkFlow(data) {

        return this.http.post(appSettings.POSTWORKFLOW, data)
            .map(res => res)
            .catch(err => (err));

    }

    public getBankBranchByBankId(BankId) {

        let req_params = `BankId=${BankId} `
        return this.http.get(appSettings.GET_BRANCH_BY_BANKID + req_params)
            .map(res => res)
            .catch(err => (err));

    }

    public getLetterTemplate(CompanyId: any, ClientId: any, ContractId: any): any {

        let req_params_Uri = `${CompanyId}/${ClientId}/${ContractId}`;
        return this.http.get(appSettings.GET_LETTERTEMPLATE + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }


    public getDocumentList(EntityId: any, CompanyId: any, ClientId: any, ContractId: any, RoleId: any = 0, IsNapBased: boolean = false, Entitytype : number  = 11): any {

      let req_params_Uri = `${EntityId}/${CompanyId}/${ClientId}/${ContractId}/${RoleId}/${IsNapBased}/${Entitytype}`;
      return this.http.get(appSettings.GET_DOCUMENTDETAILS + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }


    public postCalculateSalaryBreakUp(data): any {

        return this.http.post(appSettings.POST_CALCULATESALARYBREAKUP, data)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public postPreviewLetter(data): any {

        return this.http.post(appSettings.POST_PREVIEWLETTER, data)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public getMigrationMasterInfo(clientContractId): any {

        let req_params_Uri = `${clientContractId}`;
        return this.http.get(appSettings.GET_MIGRATIONMASTERINFO + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }
    public GetLookUpDetailsForSB(clientContractId): any {

        let req_params = `ContractId=${clientContractId} `
        return this.http.get(appSettings.GET_SBLOOKUPDETAILS + req_params)
            .map(res => res)
            .catch(
                err => (err)
            );

    }
    public getMasterInfo(empId): any {

        let req_params_Uri = `${empId}`;
        return this.http.get(appSettings.GET_MASTERINFO + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public postMigrateEmployeeReport(data) {
        return this.http.post(appSettings.POSTEMPLOYEEMIGRATEREPORT, data)
            .map(res => res)
            .catch(err => (err));

    }

    public bulkCandidateUpload(parama, data) {

        return this.http.post(appSettings.BULK_CANDIDATE_UPLOAD + parama, data)
            .map(res => res)
            .catch(err => (err));


    }
    public getOnboardingSubmissionListInfo(RoleId: any) {

        let req_params_Uri = `${RoleId}`;
        return this.http.get(appSettings.GET_ONBOARDINGSUBMISSION_LISTING + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );

    }


    public getClientLocationByClientId(ClientId: any) {
        let req_params = `ClientId=${ClientId} `
        return this.http.get(appSettings.GETCLIENTLOCATIONBYCLIENTID + req_params)
            .map(res => res)
            .catch(err => (err));

    }

    public GetOnboardingInfoForRegenerateAL() {
        return this.http.get(appSettings.GET_ONBOARDING_REGENERATEAL_INFO)
            .map(res => res)
            .catch(err => (err));

    }

    ValidateCandidateToRegenerateAL(data) {
        return this.http.post_text(appSettings.POST_VALIDATECANDIDATETOREGENERATEAL, data)
            .map(res => res)
            .catch(err => (err));

    }

    public getDynamicFieldDetails(companyId, clientId, clientContractId, EmploymentType) {
        let req_params_Uri = `${companyId}/${clientId}/${clientContractId}/${EmploymentType}`;
        return this.http.get(appSettings.GET_DYNAMICFIELDDETAILS + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }

    public GetDynamicFieldsValue(candidateId, entityType = 0) {
        let req_params_Uri = `${candidateId}/${entityType}`;
        return this.http.get(appSettings.GET_DYNAMICFIELDDETAILSBYCANDIDATEID + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }



    public UpsertDynamicFieldsValue(data) {

        return this.http.post(appSettings.POST_DYNAMICFIELDVALUE, data)
            .map(res => res)
            .catch(err => (err));

    }

    public geydummycall(): any {
        let req_params_Uri = `${15001}/${1}`;
        return this.http.get(appSettings.GETCLIENTLOCATIONBYCLIENTID1 + req_params_Uri)
            .map(res => res)
            .catch(err => (err));

    }

    public putdummy(data): any {
        return this.http.put(appSettings.post_billentry, data)
            .map(res => res)
            .catch(err => (err));

    }
    public getdummy(): any {
        let req_params_Uri = `${15001}`;
        return this.http.get(appSettings.get_billentry + req_params_Uri)
            .map(res => res)
            .catch(err => (err));

    }
    public getProcessLog(transactionId) {
        let req_params_Uri = `${transactionId}`;
        return this.http.get(appSettings.GETPROCESSLOG + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }

    public getCandidateDetailsForProcessLogUi(clientId, searchInput) {

        let req_params_Uri = `clientId=${clientId}&searchInput=${searchInput}`;
        return this.http.get(appSettings.GETCANDIDATEDETAILSFORPROCESSLOGUI + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }
    public DownloadCandidateEntireInformation(cId, ccId, candidateId) {

        let req_params_Uri = `${cId}/${ccId}/${candidateId}`;
        return this.http.get(appSettings.GET_DOWNLOADCANDIDATEENTIREINFORMATION + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }

    public ValidateCandidateInformation(data): any {

        return this.http.post(appSettings.POST_VALIDATECANDIDATEINFORMATION, data)
            .map(res => res)
            .catch(
                err => (err)
            );

    }

    public CreateLoginUserDetails(data): any {
        return this.http.put(appSettings.
            PUT_CREATELOGINUSERDETAILS, data)
            .map(res => res)
            .catch(err => (err));
    }

    public GetLoginUserDetails(userId): any {
        let req_params_Uri = `${userId}`;
        return this.http.get(appSettings.GET_LOGINUSERDETAILS + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }

    public GetCandidateNewDOJRequestHistorybyCandidateId(candidateId: number): any {
        let req_params_Uri = `${candidateId}`;
        return this.http.get(appSettings.GETCANDIDATENEWDOJREQUESTHISTORYBYID + req_params_Uri)
            .map(res => res)
            .catch(
                err => (err)
            );
    }
    public UpdateCandidateOfferNewDOJ(data): any {
        return this.http.post(appSettings.POST_CANDIDATEOFFERNEWDOJ, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    }

    // AADHAAR INTEGRATION

    SendAadhaarOTP(data): any {
        return this.http.put_integration(appSettings.
            PUT_SENDAADHAAROTP, data)
            .map(res => res)
            .catch(err => (err));
    }

    VerifyAadhaar(data): any {
        return this.http.put_integration(appSettings.
            PUT_VERIFYAADHAAR, data)
            .map(res => res)
            .catch(err => (err));
    }
    VerifyUniqueNumber(data): any {
        return this.http.put_integration(appSettings.
            PUT_VERIFYUNIQUENUMBER, data)
            .map(res => res)
            .catch(err => (err));
    }

    GetStateListByCountryId(CountryId) {
        let req_params_Uri = `CountryId=${CountryId}`;
        return this.http.get(appSettings.GET_STATELISTBYCOUNTRYID + req_params_Uri)
            .map(res => res)
            .catch(err => (err));
    }

    public GetOnboardingConfiguration(clientContractId : number= 0, entityType :string = "") {
      let req_params_Uri = `${clientContractId}/${entityType}`;
      return this.http.get(appSettings.GET_ONBOARDINGCONFIGURATION + req_params_Uri)
          .map(res => res)
          .catch(err => (err));
  }


    GetBase64ofHTML(candidate_Id){
        return of(`PGRpdiBzdHlsZT0idGV4dC1hbGlnbjogbGVmdDsiPiZuYnNwOyAmbmJzcDsgJm5ic3A7Jm5ic3A7PC9kaXY+PGRpdiBzdHlsZT0idGV4dC1hbGlnbjogbGVmdDsiPiZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7PGltZyBzcmM9Imh0dHBzOi8vd3d3LmNpZWxoci5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMTcvMTIvQ0lFTGxvZ28tMS5wbmciIHdpZHRoPSIxNjgiIGhlaWdodD0iNDgiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgY29sb3I6IHJnYigwLCAwLCAwKTsgZm9udC1mYW1pbHk6IENhbGlicmksIHNhbnMtc2VyaWY7IGZvbnQtc2l6ZTogMTFwdDsgd2hpdGUtc3BhY2U6IHByZS13cmFwOyBtYXJnaW4tbGVmdDogMHB4OyBtYXJnaW4tdG9wOiAwcHg7Ij48YnI+PC9kaXY+DQoNCiAgPHN0eWxlPnRhYmxlLCB0aCx0ZHtib3JkZXI6MXB4IHNvbGlkIGJsYWNrO2JvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7fXRoLHRkIHtwYWRkZGluZzogMTVweDt9LnRleHQtY2VudGVye3RleHQtYWxpZ246Y2VudGVyO308L3N0eWxlPjx0YWJsZSBzdHlsZT0id2lkdGg6MTAwJTtib3JkZXI6bm9uZSI+PHRib2R5Pjx0ciBzdHlsZT0iYm9yZGVyOm5vbmUiPjx0ZCBzdHlsZT0iYm9yZGVyOm5vbmUiPkNJRUwvMTEyMjMzNDQ1NS9PTC80NTY8L3RkPjx0ZCBzdHlsZT0iZmxvYXQ6cmlnaHQ7Ym9yZGVyOm5vbmUiPjxiPjE1IGp1bHkgMjAyMzwvYj48L3RkPjwvdHI+PC90Ym9keT48L3RhYmxlPjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+PGJyPjxicj4gICAgICAgIDwvZm9udD48ZGl2IGNsYXNzPSJ0ZXh0LWNlbnRlciI+ICA8Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxiPjx1Pk9GRkVSIExFVFRFUjwvdT48L2I+PC9mb250PjwvZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+PGJyPiAgICA8L2ZvbnQ+PGRpdj5EZWFyIDxiPkFzaXI8L2I+LDwvZGl2PjxkaXY+PGJyPg0KICA8ZGl2PldlIGFyZSBwbGVhc2VkIHRvIG9mZmVyIHlvdSBlbXBsb3ltZW50IGluIG91ciBvcmdhbml6YXRpb24gYXMgU0RFLTE8Yj4sPC9iPiAgIDxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+YW5kIHRoYXQgeW91ciBzZXJ2aWNlcyBhcmUgYmVpbmcgZGVwdXRlZCB0byA8L2ZvbnQ+PGI+Q2llbCZuYnNwOzwvYj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPm9uIHRoZSBmb2xsb3dpbmcgdGVybXMgYW5kIGNvbmRpdGlvbnM8L2ZvbnQ+PC9kaXY+PGZvbnQgZmFjZT0iVGltZXMgTmV3IFJvbWFuIj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxicj48YnI+ICAgICAgICA8L2ZvbnQ+PGRpdj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPllvdXIgZW1wbG95bWVudCB3aWxsIGJlIHZhbGlkIGZyb20gPGI+MTIvMTIvMjAyMzwvYj48L2ZvbnQ+PGZvbnQgZmFjZT0iVGltZXMgTmV3IFJvbWFuIj4uIHVubGVzcyBhbmQgdW50aWwgaXQgaXMgc3BlY2lmaWNhbGx5IGV4dGVuZGVkIGluIHdyaXRpbmcuJm5ic3A7PC9mb250PjwvZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+PGJyPjxicj4gICAgPC9mb250PjxkaXY+PGZvbnQgZmFjZT0iVGltZXMgTmV3IFJvbWFuIj4gRHVyaW5nIHRoZSBhYm92ZSBtZW50aW9uZWQgcGVyaW9kLCB5b3VyIHNlcnZpY2VzIG1heSBiZSBkZXB1dGVkIHRvIG91ciBjbGllbnQgdG8gZG8gd29yayBwZXJ0YWluaW5nIHRvIGluY2lkZW50YWwgdG8gdGhlIGNsaWVudOKAmXMgYnVzaW5lc3MsIGF0IGFueSBvZiB0aGVpciBsb2NhdGlvbnMgd2l0aGluIEluZGlhLjwvZm9udD48L2Rpdj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxicj48YnI+ICAgIDwvZm9udD48ZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+IFlvdXIgQW5udWFsIDxiPlR3ZWx2ZSBMYWtoczwvYj4mbmJzcDt3aWxsIGJlIFJzJm5ic3A7PC9mb250PjxzcGFuIHN0eWxlPSJmb250LXdlaWdodDogYm9sZGVyOyBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsiPjEyLDAwLDAwMC48L3NwYW4+PC9kaXY+PC9mb250Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+PGZvbnQgZmFjZT0iVGltZXMgTmV3IFJvbWFuIj48YnI+PGJyPiAgICA8L2ZvbnQ+PGRpdj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPiBZb3VyIGVtcGxveW1lbnQgaXMgc3ViamVjdCB0bzo8L2ZvbnQ+PC9kaXY+PGZvbnQgZmFjZT0iVGltZXMgTmV3IFJvbWFuIj48YnI+PGJyPiAgICA8L2ZvbnQ+PGRpdj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPiBhLiBQcm9vZiBvZiB5b3VyIGVkdWNhdGlvbmFsIGNlcnRpZmljYXRlcyAoT3B0aW9uYWwpLCBBYWRoYXIgcHJvb2YsIEFnZSBQcm9vZiwgYW5kIFBhc3Nwb3J0IHNpemUgcGhvdG9ncmFwaHMuPC9mb250PjwvZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+PGJyPjxicj4gIDwvZm9udD48ZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+IGIuIFlvdSBoYXZlIHRvIGZpbGwgam9pbmluZyBGb3JtLCBBcHBsaWNhbnQgUHJvZmlsZSBmb3JtIGFuZCBQRiBOb21pbmF0aW9uIGZvcm0sIGV0Yy4gYW5kIGFycmFuZ2UgdG8gc3VibWl0IGl0IG9uIG9yIGJlZm9yZSBqb2luaW5nLjwvZm9udD48L2Rpdj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxicj48YnI+ICAgIDwvZm9udD48ZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+IFBsZWFzZSBub3RlIHRoYXQgdGhpcyBpcyBvbmx5IGEgb2ZmZXIgb2YgZW1wbG95bWVudCBmb3IgYSBmaXhlZCB0ZXJtIGFuZCBpcyBub3QgdG8gYmUgY29uc3RydWN0ZWQgYXMgYW4gYXBwb2ludG1lbnQgbGV0dGVyLiBBbiBhcHBvaW50bWVudCBsZXR0ZXIgd291bGQgYmUgaXNzdWVkIHRvIHlvdSBvbiB5b3VyIGFjY2VwdGluZyB0aGlzIG9mZmVyLjwvZm9udD48L2Rpdj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxicj48YnI+ICAgIDwvZm9udD48ZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+IEtpbmRseSBzaWduIHRoZSBkdXBsaWNhdGUgY29weSBvZiB0aGlzIGxldHRlciBhcyBhIHRva2VuIG9mIHlvdXIgYWNjZXB0YW5jZSBvZiB0aGUgb2ZmZXIsIGEgZGV0YWlsZWQgYXBwb2ludG1lbnQgbGV0dGVyIHdvdWxkIGJlIHNlbnQgdG8geW91IG9uY2UgeW91IGZ1bGZpbGwgb3VyIGVtcGxveW1lbnQgY29uZGl0aW9ucyBhbmQgam9pbiBkdXR5LjwvZm9udD48L2Rpdj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxicj48YnI+ICAgIDwvZm9udD48ZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+IFdpc2hpbmcgeW91IHRoZSB2ZXJ5IGJlc3QhPC9mb250PjwvZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+PGJyPjxicj4gICAgPC9mb250PjxkaXY+PGZvbnQgZmFjZT0iVGltZXMgTmV3IFJvbWFuIj4gV2l0aCB3YXJtIHJlZ2FyZHMsPC9mb250PjwvZGl2Pjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiI+PGJyPjxicj4gICAgPC9mb250PjxkaXY+PGZvbnQgZmFjZT0iVGltZXMgTmV3IFJvbWFuIj4gWW91cnMgdHJ1bHksPC9mb250PjwvZGl2PiAgICA8ZGl2PkZvciBDSUVMIEhSIFNlcnZpY2VzIFB2dCBMdGQuPC9kaXY+PHNwYW4gaWQ9ImRvY3MtaW50ZXJuYWwtZ3VpZC0wNGM3MmVmNi03ZmZmLWFiZjYtOGVmZC1kYzBlZWQxMmQ3MjMiPjxzcGFuIHN0eWxlPSJmb250LXNpemU6IDEwcHQ7IGZvbnQtZmFtaWx5OiAmcXVvdDtUaW1lcyBOZXcgUm9tYW4mcXVvdDs7IGNvbG9yOiByZ2IoMCwgMCwgMCk7IGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyBmb250LXZhcmlhbnQtbnVtZXJpYzogbm9ybWFsOyBmb250LXZhcmlhbnQtZWFzdC1hc2lhbjogbm9ybWFsOyB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsiPjxzcGFuIHN0eWxlPSJib3JkZXI6IG5vbmU7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgb3ZlcmZsb3c6IGhpZGRlbjsgd2lkdGg6IDExNHB4OyBoZWlnaHQ6IDczcHgiPjxpbWcgc3JjPSJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vRW5lMk94R1J4Z0RkNmwzSXZJanJJTHdtSXVkcExtNmlrVWpYeTMyd1pxbXlwbkpoR29NRC15UlpRTGM2LVhMR1VNNVh1cndycHdjOGtkRnVVTXZJdXlYZGVYM3VrbkFEeE00RnZ4eDZjVlBXNEZYamlmRWVPcE5MR1dMLWpmY0I2WVRLNjZ5Y3BCd25KOUlJMXciIHdpZHRoPSIxMTQiIGhlaWdodD0iNzMiIHN0eWxlPSJtYXJnaW4tbGVmdDogMHB4OyBtYXJnaW4tdG9wOiAwcHg7Ij48L3NwYW4+PC9zcGFuPjwvc3Bhbj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxicj4gICAgICA8L2ZvbnQ+PGRpdj48Yj48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPkFkaXR5YSBOYXJheWFuIE1pc2hyYTwvZm9udD48L2I+PC9kaXY+ICA8ZGl2PiA8Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iPjxiPkNFTyZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsgJm5ic3A7ICZuYnNwOyAmbmJzcDsmbmJzcDs8L2I+PC9mb250PjxzcGFuIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgY29sb3I6IHJnYigwLCAwLCAwKTsgZm9udC1mYW1pbHk6ICZxdW90O1RpbWVzIE5ldyBSb21hbiZxdW90OzsgZm9udC1zaXplOiAxMHB0OyB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7Ij4mbmJzcDs8L3NwYW4+PHNwYW4gc3R5bGU9ImJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyBjb2xvcjogcmdiKDAsIDAsIDApOyB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7Ij48Zm9udCBmYWNlPSJUaW1lcyBOZXcgUm9tYW4iIHN0eWxlPSIiIHNpemU9IjMiPiZuYnNwOyZuYnNwOzwvZm9udD48L3NwYW4+PC9kaXY+PGRpdj48c3BhbiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IGNvbG9yOiByZ2IoMCwgMCwgMCk7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsiPjxmb250IGZhY2U9IlRpbWVzIE5ldyBSb21hbiIgc3R5bGU9IiIgc2l6ZT0iMyI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChBY2NlcHRhbmNlIFNpZ25hdHVyZSBhbmQgRGF0ZSk8L2ZvbnQ+PC9zcGFuPjwvZGl2PjxkaXY+PGJyPiAgPC9kaXY+PC9mb250PjwvZGl2Pg0KICA8cCBzdHlsZT0iUGFnZS1icmVhay1hZnRlcjphbHdheXMiPjwvcD4NCiAgPGRpdiBjbGFzcz0idGV4dC1jZW50ZXIiPiA8Yj48dT5BTk5FWFVSRTwvdT48L2I+PC9kaXY+DQogIA0KICA8dGFibGUgYm9yZGVyPSIxIiB3aWR0aD0iODAlIiBoZWlnaHQ9IjEwJSIgYWxpZ249ImNlbnRlciI+DQogIDx0Ym9keT4NCiAgPHRyPg0KICA8dGQ+TmFtZTwvdGQ+DQogIDx0ZD48Yj5Bc2lmPC9iPjwvdGQ+DQogIDx0ZD5Mb2NhdGlvbjwvdGQ+DQogIDx0ZD48Yj5CYW5nYWxvcmU8L2I+PC90ZD48L3RyPg0KICA8dHI+PHRkPkRlc2lnbmF0aW9uPC90ZD4NCiAgPHRkPjxiPlNERS0xPC9iPjwvdGQ+DQogIDx0ZD4gRE9CIDwvdGQ+DQogIDx0ZD48Yj4xNi8xMC8xOTk0PC9iPjwvdGQ+PC90cj4NCiAgPHRyPg0KICA8dGQ+RmF0aGVyIE5hbWU8L3RkPg0KICA8dGQ+PGI+QWJkdXJyYWhtYW48L2I+PC90ZD48dGQ+RE9KPC90ZD4NCiAgPHRkPjxiPjEyLzEyLzIwMjM8L2I+PC90ZD4NCiAgPC90cj4NCiAgDQogIDwvdGJvZHk+PC90YWJsZT48YnI+DQogIDxzcGFuIGNvbnRlbnRlZGl0YWJsZT0iZmFsc2UiIHN0eWxlPSIgYm9yZGVyLXN0eWxlOiBzb2xpZDtib3JkZXItd2lkdGg6IHRoaW47Ym9yZGVyLWNvbG9yOiAjYjliOWI5O3BhZGRpbmctbGVmdDogNXB4O3BhZGRpbmctcmlnaHQ6IDVweDtwYWRkaW5nLXRvcDogMnB4O3BhZGRpbmctYm90dG9tOiAycHg7Ym9yZGVyLXJhZGl1czogMTVweDttYXJnaW4tbGVmdDogMHB4O21hcmdpbi1yaWdodDogMnB4O2JhY2tncm91bmQtY29sb3I6IGxpZ2h0Y3lhbjsiPn5+Q1RDQnJlYWtVcH5+PC9zcGFuPjxicj48c3BhbiBjb250ZW50ZWRpdGFibGU9ImZhbHNlIiBzdHlsZT0iIGJvcmRlci1zdHlsZTogc29saWQ7Ym9yZGVyLXdpZHRoOiB0aGluO2JvcmRlci1jb2xvcjogI2I5YjliOTtwYWRkaW5nLWxlZnQ6IDVweDtwYWRkaW5nLXJpZ2h0OiA1cHg7cGFkZGluZy10b3A6IDJweDtwYWRkaW5nLWJvdHRvbTogMnB4O2JvcmRlci1yYWRpdXM6IDE1cHg7bWFyZ2luLWxlZnQ6IDBweDttYXJnaW4tcmlnaHQ6IDJweDtiYWNrZ3JvdW5kLWNvbG9yOiBsaWdodGN5YW47Ij5+flNhbGFyeVJlbWFya3N+fjwvc3Bhbj4NCiAgPGJyPg0KICANCiAgPGRpdj48YnI+PC9kaXY+PGRpdj4gV2l0aCB3YXJtIHJlZ2FyZHMsPC9kaXY+PGRpdj48YnI+PC9kaXY+DQogIA0KICA8ZGl2PiBZb3VycyB0cnVseSw8L2Rpdj4NCiAgDQogIDxkaXY+IEZvciBDSUVMIEhSIFNlcnZpY2VzIFB2dCBMdGQuPC9kaXY+PHNwYW4gY29udGVudGVkaXRhYmxlPSJmYWxzZSIgc3R5bGU9IiBib3JkZXItc3R5bGU6IHNvbGlkO2JvcmRlci13aWR0aDogdGhpbjtib3JkZXItY29sb3I6ICNiOWI5Yjk7cGFkZGluZy1sZWZ0OiA1cHg7cGFkZGluZy1yaWdodDogNXB4O3BhZGRpbmctdG9wOiAycHg7cGFkZGluZy1ib3R0b206IDJweDtib3JkZXItcmFkaXVzOiAxNXB4O21hcmdpbi1sZWZ0OiAwcHg7bWFyZ2luLXJpZ2h0OiAycHg7YmFja2dyb3VuZC1jb2xvcjogbGlnaHRjeWFuOyI+fn5PZmZlckxldHRlclNpZ25hdG9yeX5+PC9zcGFuPjxicj4NCiAgDQogIA0KICA8ZGl2PjxiPkFkaXR5YSBOYXJheWFuIE1pc2hyYTwvYj48L2Rpdj4NCiAgPGRpdj4gPGI+Q0VPPC9iPjwvZGl2PjxkaXY+PGI+PGJyPjwvYj48L2Rpdj4NCiAgPGRpdj5JIGhlcmVieSBhY2NlcHQgdGhlIGFib3ZlLW1lbnRpb25lZCB0ZXJtcyBhbmQgY29uZGl0aW9uczwvZGl2PjxkaXY+IDxiPlNpZ25hdHVyZTo8L2I+PC9kaXY+PGRpdj48ZGl2PiA8Yj5EYXRlOjwvYj48L2Rpdj48ZGl2Pjxicj48L2Rpdj4gDQogIDwvZGl2Pg0KICANCiAgPGhyPiA8c3BhbiBpZD0iZG9jcy1pbnRlcm5hbC1ndWlkLTI1YjAxZjRjLTdmZmYtNmRkZS1jNGJhLTI1NzA1ZTcxMTkxMyI+PHAgZGlyPSJsdHIiIHN0eWxlPSJsaW5lLWhlaWdodDoxLjI5NTttYXJnaW4tbGVmdDogMzAuNDVwdDttYXJnaW4tcmlnaHQ6IC0yNy4zcHQ7bWFyZ2luLXRvcDowcHQ7bWFyZ2luLWJvdHRvbTowLjJwdDsiPjxzcGFuIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgZm9udC1zaXplOiA4LjVwdDsgZm9udC1mYW1pbHk6IEFyaWFsOyBjb2xvcjogcmdiKDAsIDAsIDApOyBmb250LXdlaWdodDogNzAwOyBmb250LXZhcmlhbnQtbnVtZXJpYzogbm9ybWFsOyBmb250LXZhcmlhbnQtZWFzdC1hc2lhbjogbm9ybWFsOyB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsiPiAgICAgICAgICAgQ0lFTCBIUiBTZXJ2aWNlcyBQcml2YXRlIExpbWl0ZWQ8L3NwYW4+PHNwYW4gc3R5bGU9ImJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OyBmb250LXNpemU6IDExcHQ7IGZvbnQtZmFtaWx5OiBDYWxpYnJpLCBzYW5zLXNlcmlmOyBjb2xvcjogcmdiKDAsIDAsIDApOyBmb250LXZhcmlhbnQtbnVtZXJpYzogbm9ybWFsOyBmb250LXZhcmlhbnQtZWFzdC1hc2lhbjogbm9ybWFsOyB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsiPiZuYnNwOzwvc3Bhbj48L3A+PHAgZGlyPSJsdHIiIHN0eWxlPSJsaW5lLWhlaWdodDoxLjI5NTttYXJnaW4tbGVmdDogNTcuOTVwdDt0ZXh0LWluZGVudDogMC4yNXB0O21hcmdpbi10b3A6MHB0O21hcmdpbi1ib3R0b206Mi4ycHQ7Ij48c3BhbiBzdHlsZT0idGV4dC1pbmRlbnQ6IDAuMjVwdDsgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IGNvbG9yOiByZ2IoMCwgMCwgMCk7IGZvbnQtdmFyaWFudC1udW1lcmljOiBub3JtYWw7IGZvbnQtdmFyaWFudC1lYXN0LWFzaWFuOiBub3JtYWw7IHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsgd2hpdGUtc3BhY2U6IHByZS13cmFwOyBmb250LXNpemU6IDguNXB0OyBmb250LWZhbWlseTogQXJpYWw7Ij4jMjgwMiAybmQgYW5kIDNyZCBGbG9vciwgQnJvYWR3YXkgQnVpbGRheSwgMjd0aCBNYWluIFJvYWQsIEhTUiBMYXlvdXQgU2VjdG9yIDEsIEJhbmdhbG9yZS01NjAxMDIgIFRlbDogKzkxIDc4MTYwMDAxMTE8L3NwYW4+PC9wPjxwIGRpcj0ibHRyIiBzdHlsZT0ibGluZS1oZWlnaHQ6MS4yOTU7bWFyZ2luLWxlZnQ6IDU3Ljk1cHQ7dGV4dC1pbmRlbnQ6IDAuMjVwdDttYXJnaW4tdG9wOjBwdDttYXJnaW4tYm90dG9tOjAuNnB0OyI+PHNwYW4gc3R5bGU9ImZvbnQtc2l6ZTogOC41cHQ7IGZvbnQtZmFtaWx5OiBBcmlhbDsgY29sb3I6IHJnYigwLCAwLCAwKTsgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IGZvbnQtdmFyaWFudC1udW1lcmljOiBub3JtYWw7IGZvbnQtdmFyaWFudC1lYXN0LWFzaWFuOiBub3JtYWw7IHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsgd2hpdGUtc3BhY2U6IHByZS13cmFwOyI+UmVnZCBPZmY6IERvb3IgTm8gNDEsIHBsb3QgTm8gMzcyNiwgUSBCbG9jaywgNnRoIEF2ZW51ZSwgQW5uYSBOYWdhciwgQ2hlbm5haSAtNjAwMDQwPC9zcGFuPjxzcGFuIHN0eWxlPSJmb250LXNpemU6IDExcHQ7IGZvbnQtZmFtaWx5OiBDYWxpYnJpLCBzYW5zLXNlcmlmOyBjb2xvcjogcmdiKDAsIDAsIDApOyBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgZm9udC12YXJpYW50LW51bWVyaWM6IG5vcm1hbDsgZm9udC12YXJpYW50LWVhc3QtYXNpYW46IG5vcm1hbDsgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lOyB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7Ij4sIDwvc3Bhbj48L3A+PHAgZGlyPSJsdHIiIHN0eWxlPSJsaW5lLWhlaWdodDoxLjI5NTttYXJnaW4tbGVmdDogNTcuOTVwdDt0ZXh0LWluZGVudDogMC4yNXB0O21hcmdpbi10b3A6MHB0O21hcmdpbi1ib3R0b206MC42cHQ7Ij48c3BhbiBzdHlsZT0iZm9udC1zaXplOiA4LjVwdDsgZm9udC1mYW1pbHk6IEFyaWFsOyBjb2xvcjogcmdiKDAsIDAsIDApOyBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgZm9udC12YXJpYW50LW51bWVyaWM6IG5vcm1hbDsgZm9udC12YXJpYW50LWVhc3QtYXNpYW46IG5vcm1hbDsgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lOyB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7Ij5UZWw6ICs5MS00NC00OTEwIDk5OTkgRS1tYWlsOiBpbmZvQGNpZWxoci5jb20gV2ViOiB3d3cuY2llbGhyLmNvbSAoQ0lOIE5vOjc0MTQwVE4yMDEwUFRDMDc3MDk1KTwvc3Bhbj48c3BhbiBzdHlsZT0iZm9udC1zaXplOiAxMXB0OyBmb250LWZhbWlseTogQ2FsaWJyaSwgc2Fucy1zZXJpZjsgY29sb3I6IHJnYigwLCAwLCAwKTsgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IGZvbnQtdmFyaWFudC1udW1lcmljOiBub3JtYWw7IGZvbnQtdmFyaWFudC1lYXN0LWFzaWFuOiBub3JtYWw7IHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsgd2hpdGUtc3BhY2U6IHByZS13cmFwOyI+Jm5ic3A7PC9zcGFuPjwvcD48L3NwYW4+`);
        // return this.http.get(appSettings.GET_STATELISTBYCOUNTRYID + candidate_Id)
        // .map(res => res)
        // .catch(err => (err));
    }

    
    GetOnboardingAdditionalInfo(clientId: number, clientContractId: number) {
        let request_payload = `${clientId}/${clientContractId}`;
        return this.http.get(appSettings.GET_ONBOARDINGADDITIONALINFO + request_payload)
            .map(res => res)
            .catch(err => (err));
    }



}