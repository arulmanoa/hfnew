import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { CandidateService } from 'src/app/_services/service/candidate.service';
import { AlertService } from '../../../_services/service/alert.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { CandidateUIOffer } from 'src/app/_services/model/CandidateUI/CandidateUIOffer';
import { Location } from '@angular/common';

import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';

import { enumHelper } from '../../../shared/directives/_enumhelper';
import { RejectionReason, AcceptanceStatus } from 'src/app/_services/model/Base/HRSuiteEnums';
import { Alert } from 'selenium-webdriver';
import { ApprovalFor } from 'src/app/_services/model/Candidates/CandidateDetails';
import { FileUploadService } from '../../../_services/service/fileUpload.service'
import { saveAs } from 'file-saver';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { OnboardingService } from 'src/app/_services/service/onboarding.service';
import { OnBoardingType } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AadhaarVerificationComponent } from '../../onboarding/shared/modals/aadhaar-verification/aadhaar-verification.component';
import { IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { HeaderService } from 'src/app/_services/service';
import { SurveyComponent } from '../../onboarding/shared/survey/survey.component';

export interface DefaultSearchInputs {
  ClientId: number;
  ClientContractId: number;
  ClientName: string;
  ClientContractName: string;
  IsNapBased: boolean,
  Client?: any,
  ClientContract?: any
}
@Component({
  selector: 'app-candidate-acceptance',
  templateUrl: './candidate-acceptance.component.html',
  styleUrls: ['./candidate-acceptance.component.css']
})
export class CandidateAcceptanceComponent implements OnInit {
  _loginSessionDetails: LoginResponses;
  isMobileResolution: boolean;

  AnnualSalary: any;
  DOJ: any;
  WorkLocation: any;
  Client: any;
  ApprovalFor: any;

  isAuthorized: boolean = false;
  isFailed: boolean = false;
  CanidateUI: any;
  RateSetList: any;
  approvalForList: any;

  // Rejection
  remarks: any;
  reason: any;
  acceptanceStatusId: any;

  rejectReasons;
  workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation;
  RoleId: any;
  UserId: any;
  CompanyId: any;
  ImplementationCompanyId: any;
  userAccessControl;
  accessControl_reject: UserInterfaceControlLst = new UserInterfaceControlLst;
  accessControl_accept: UserInterfaceControlLst = new UserInterfaceControlLst;
  isChecked: boolean = false;
  isCheckedS: boolean = false;
  isCheckedWL: boolean = false;
  isCheckedD: boolean = false;
  isCheckedO: boolean = false;
  isCheckedDOJ: boolean = false;
  BusinessType: number;

  modalOption: NgbModalOptions = {};
  defaultSearchInputs: DefaultSearchInputs = {
    ClientContractId: 0,
    ClientId: -1,
    ClientName: "",
    ClientContractName: "",
    IsNapBased: false,
    Client: null,
    ClientContract: null,
  };

  SurveyResponded: boolean = false;

  constructor(

    private sessionService: SessionStorage,
    public candidateService: CandidateService,
    private router: Router,
    private _location: Location,
    private utilsHelper: enumHelper,
    public alertService: AlertService,
    private objectApi: FileUploadService,
    public onboardingService: OnboardingService,
    public loadingScreenService: LoadingScreenService,
    private modalService: NgbModal,
    private headerService: HeaderService
  ) {


    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }

    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });

  }
  ngAfterViewInit() {
    this.detectScreenSize();
  }
  private detectScreenSize() {

    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }

  ngOnInit() {

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;


    this.loadingScreenService.startLoading();

    this.getUIOfferData().then(() => {


    });


    this.rejectReasons = this.utilsHelper.transform(RejectionReason);
    this.approvalForList = this.utilsHelper.transform(ApprovalFor);

  }


  getUIOfferData(): Promise<any> {
    return new Promise((resolve, reject) => {

      let req_params = `Encryptedtext=${this.sessionService.getSessionStorage("Encryptedtext")}`;
      this.candidateService.getUIOfferData(req_params).subscribe((response) => {

        let apiResult: apiResult = response;
        console.log('apiResult', apiResult);

        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.isAuthorized = true;
            this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
            this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
            this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
            this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard
            let companyCode = this._loginSessionDetails.Company.Code;
            this.sessionService.setSesstionStorage("CompanyCode", companyCode);
            this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
            this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
            this.accessControl_reject = this.userAccessControl.filter(a => a.ControlName == "btnCandRejectOffer");
            this.accessControl_accept = this.userAccessControl.filter(a => a.ControlName == "btnCandAcceptOffer");
            this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

            this.CanidateUI = JSON.parse(apiResult.Result)[0];
            console.log(this.CanidateUI);
            this.defaultSearchInputs.ClientId = this.CanidateUI.ClientId;
            this.defaultSearchInputs.ClientContractId = this.CanidateUI.ClientContractId;
            this.defaultSearchInputs.ClientName = this.CanidateUI.ClientName;
            this.defaultSearchInputs.ClientContractName = this.CanidateUI.CandidateName;

            if (this.CanidateUI.RedirectCandidatePage == true) {


              if (this.CanidateUI.OnboardingType == OnBoardingType.Flash) {


                // const modalRef = this.modalService.open(AadhaarVerificationComponent, this.modalOption);
                // modalRef.componentInstance.CompanyId = this.CompanyId;
                // modalRef.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
                // modalRef.result.then((result) => {
                //   console.log('result', result);
                //   if (result != 'Modal Closed') {
                //   }

                // }).catch((error) => {
                //   console.log(error);
                // });

                // return;

                // }
                this.loadingScreenService.stopLoading();
                this.router.navigate(['candidate_information'], {
                  queryParams: {
                    "Idx": btoa(this.CanidateUI.OfferDetailId),
                    "Cdx": btoa(this.CanidateUI.CandidateId)
                  }
                });
              }
              else if (this.CanidateUI.OnboardingType == OnBoardingType.Proxy) {
                sessionStorage.setItem('isAllenDigital', (this.CanidateUI.ClientId == 1988 || this.CanidateUI.ClientId == '1988') ? 'true' : 'false')
                this.loadingScreenService.stopLoading();
                // this.router.navigateByUrl('success');
                this.router.navigate(['success'], {
                  queryParams: {
                    "Cdx": btoa(this.CanidateUI.ClientId)
                  }
                });

              }

            } else {


              this.RateSetList = JSON.parse(this.CanidateUI.RatesetData);
              this.RateSetList = _.filter(this.RateSetList, (a => a.IsDisplayRequired && Number(a.Value) != Number(0)));
              this.RateSetList = _.orderBy(this.RateSetList, ["DisplayOrder"], ["asc"]);
              this.ApprovalFor = this.approvalForList.find(a => a.id == this.CanidateUI.ApprovalFor).name;
              resolve(this.CanidateUI.RedirectCandidatePage);
              this.loadingScreenService.stopLoading();
              if (this.CanidateUI.IsSurveyQuestionsModalRequired) {
                this.SurveyResponded = false;
                this.openSurveyQuestions();
              }
            }
          }
          else {
            this.loadingScreenService.stopLoading();
            this.isFailed = true;

          }
        } catch (error) {

          this.isFailed = true;
          this.loadingScreenService.stopLoading();
        }


      }), ((error) => {
        this.loadingScreenService.stopLoading();
      });

    });
  }


  // AnnualSalary: 90000
  // ApprovalFor: 1
  // CandidateId: 40
  // ClientName: "Mavin Agency India Private Limited"
  // DateOfJoining: "2019-11-20T00:00:00"
  // Designation: "FR"
  // LocationName: "Surat"
  // OfferDetailId: 40
  // RatesetData: "[{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":1,"ProductCode":"Basic","DisplayName":"Basic","Value":200000.0,"IsOveridable":true,"DisplayOrder":1,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":2,"ProductCode":"HRA","DisplayName":"House Rent Allowance","Value":100000.0,"IsOveridable":false,"DisplayOrder":2,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":3,"ProductCode":"Bonus","DisplayName":"Bonus","Value":0.0,"IsOveridable":false,"DisplayOrder":3,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":5,"ProductCode":"TelePhoneAllow","DisplayName":"Telephone Allowance","Value":700.0,"IsOveridable":true,"DisplayOrder":4,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":6,"ProductCode":"VehicleReimb","DisplayName":"Vehicle Reimbursement","Value":0.0,"IsOveridable":false,"DisplayOrder":6,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":7,"ProductCode":"PDR","DisplayName":"PDR","Value":0.0,"IsOveridable":false,"DisplayOrder":7,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":8,"ProductCode":"LTA","DisplayName":"Leave Travel Allowance","Value":0.0,"IsOveridable":false,"DisplayOrder":8,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":9,"ProductCode":"WashingAllow","DisplayName":"Washing Allowance","Value":0.0,"IsOveridable":false,"DisplayOrder":9,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":10,"ProductCode":"DepAllow","DisplayName":"Deputation Allowance","Value":185880.0,"IsOveridable":true,"DisplayOrder":10,"IsDisplayRequired":true,"ProductTypeCode":"Earning","ProductTypeId":1,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":11,"ProductCode":"GrossEarn","DisplayName":"Gross Earning","Value":486580.0,"IsOveridable":false,"DisplayOrder":11,"IsDisplayRequired":true,"ProductTypeCode":"Total","ProductTypeId":6,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":12,"ProductCode":"EmployerESI","DisplayName":"Employer ESI","Value":0.0,"IsOveridable":false,"DisplayOrder":12,"IsDisplayRequired":true,"ProductTypeCode":"OnCost","ProductTypeId":4,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":13,"ProductCode":"EmployerPF","DisplayName":"Employer PF","Value":1800.0,"IsOveridable":false,"DisplayOrder":13,"IsDisplayRequired":true,"ProductTypeCode":"OnCost","ProductTypeId":4,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":14,"ProductCode":"Insurance","DisplayName":"Insurance","Value":0.0,"IsOveridable":false,"DisplayOrder":14,"IsDisplayRequired":true,"ProductTypeCode":"OnCost","ProductTypeId":4,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":15,"ProductCode":"Gratuity","DisplayName":"Gratuity","Value":9620.0,"IsOveridable":false,"DisplayOrder":15,"IsDisplayRequired":true,"ProductTypeCode":"OnCost","ProductTypeId":4,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":16,"ProductCode":"PFAdmin","DisplayName":"PF Admin","Value":2000.0,"IsOveridable":false,"DisplayOrder":16,"IsDisplayRequired":true,"ProductTypeCode":"OnCost","ProductTypeId":4,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":17,"ProductCode":"CTC","DisplayName":"CTC","Value":500000.0,"IsOveridable":false,"DisplayOrder":17,"IsDisplayRequired":true,"ProductTypeCode":"Total","ProductTypeId":6,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":18,"ProductCode":"PF","DisplayName":"PF","Value":1800.0,"IsOveridable":false,"DisplayOrder":18,"IsDisplayRequired":true,"ProductTypeCode":"Deductions","ProductTypeId":2,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":19,"ProductCode":"ESIC","DisplayName":"ESIC","Value":0.0,"IsOveridable":false,"DisplayOrder":19,"IsDisplayRequired":true,"ProductTypeCode":"Deductions","ProductTypeId":2,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":20,"ProductCode":"PT","DisplayName":"PT","Value":0.0,"IsOveridable":false,"DisplayOrder":20,"IsDisplayRequired":true,"ProductTypeCode":"Deductions","ProductTypeId":2,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":40,"ProductCode":"FixedInsurance","DisplayName":"FixedInsurance","Value":0.0,"IsOveridable":false,"DisplayOrder":21,"IsDisplayRequired":true,"ProductTypeCode":"Deductions","ProductTypeId":2,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":21,"ProductCode":"GrossDedn","DisplayName":"Gross Deduction","Value":1800.0,"IsOveridable":false,"DisplayOrder":34,"IsDisplayRequired":true,"ProductTypeCode":"Total","ProductTypeId":6,"Modetype":0},{"Id":0,"EmployeeRatesetId":0,"EmployeeId":0,"ProductId":22,"ProductCode":"NetPay","DisplayName":"NetPay","Value":484780.0,"IsOveridable":false,"DisplayOrder":35,"IsDisplayRequired":true,"ProductTypeCode":"Total","ProductTypeId":6,"Modetype":0}]"
  // RedirectCandidatePage: true

  /* #region  Preview CTC */
  previewCTC() {

    $('#popup_preview_ctc').modal('show');

  }
  getAnnualValue(value) {
    return Number(value * 12)
  }
  /* #endregion */

  /* #region  Reject offer */

  rejectLetter() {
    $('#popup_reject').modal('show');
  }

  modal_dismiss() {

    $('#popup_preview_ctc').modal('hide');
  }

  modal_dismiss1() {
    this.loadingScreenService.stopLoading();
    $('#popup_reject').modal('hide');
  }

  rejectreason(indx) {

    if (this.isCheckedD || this.isCheckedS || this.isCheckedWL || this.isCheckedDOJ) {

      this.reason = 1;
    }
    else if (this.isCheckedD || this.isCheckedS || this.isCheckedWL || this.isCheckedDOJ && this.isCheckedO) {

      this.reason = 1;
    }
    else if (!this.isCheckedD && !this.isCheckedS && !this.isCheckedWL && !this.isCheckedDOJ && this.isCheckedO) {

      this.reason = 2;
    }
    else if (this.isCheckedO) {

      this.reason = 2;
    }
    else {

      this.reason = null;
    }

  }

  confirmReject() {

    if (this.reason === undefined || this.reason === null || this.reason === "") {
      this.alertService.showInfo("Oops...  Pleaes choose your rejection reason!");
      return;
    }
    else if (this.remarks === undefined || this.remarks === null || this.remarks === "") {
      this.alertService.showInfo("Oops... Remark is required");
      return;
    }
    else {

      this.acceptanceStatusId = this.ApprovalFor = "OL" ? AcceptanceStatus.OL_Rejected : AcceptanceStatus.AL_Rejected;
      this.alertService.confirmSwal("Confirm Rejection?", "Are you sure you would like to start the rejection process for this offer?  The offer may not be available should you make it.", "Yes, Confirm").then(result => {
        this.loadingScreenService.startLoading();
        let req_params = `candidateId=${this.CanidateUI.CandidateId}&acceptanceStatus=${this.acceptanceStatusId}&rejectionReason=${this.reason}&remarks=${this.remarks}`;
        this.candidateService.rejectAcceptanceLetter(req_params).subscribe((res) => {
          console.log('res', res);
          let apiResult: apiResult = res;
          try {
            if (apiResult.Status && apiResult.Result != "") {

              this.workFlowInitiation.Remarks = this.remarks;
              this.workFlowInitiation.EntityId = this.CanidateUI.CandidateId;
              this.workFlowInitiation.EntityType = EntityType.CandidateDetails;
              this.workFlowInitiation.CompanyId = this.CompanyId;
              this.workFlowInitiation.ClientContractId = this.CanidateUI.ClientContractId;
              this.workFlowInitiation.ClientId = this.CanidateUI.ClientId;
              this.workFlowInitiation.ActionProcessingStatus = 4000;
              this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
              this.workFlowInitiation.WorkFlowAction = 1;
              this.workFlowInitiation.RoleId = this.RoleId;
              this.workFlowInitiation.DependentObject = this.CanidateUI;
              this.workFlowInitiation.UserInterfaceControlLst = this.accessControl_reject;

              console.log(this.workFlowInitiation);

              this.finalWorkFlow(this.workFlowInitiation, "Rejection");

              $('#popup_reject').modal('hide');
              this.loadingScreenService.stopLoading();
            } else { this.alertService.showWarning(apiResult.Message), this.loadingScreenService.stopLoading(); }

          } catch (error) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(error)
          }


        });

      })
        .catch(error => { this.loadingScreenService.stopLoading(); });

    }
  }

  finalWorkFlow(workFlowJsonObj: WorkFlowInitiation, fromWhich: any): void {

    console.log(workFlowJsonObj);
    this.onboardingService.postWorkFlow(JSON.stringify(workFlowJsonObj)).subscribe((response) => {

      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
          sessionStorage.setItem('isAllenDigital', (this.CanidateUI.ClientId == 1988 || this.CanidateUI.ClientId == '1988') ? 'true' : 'false')
          // this.router.navigateByUrl('success');
          this.router.navigate(['success'], {
            queryParams: {
              "Cdx": btoa(this.CanidateUI.ClientId)
            }
          });
          this.loadingScreenService.stopLoading();

        } else {
          this.alertService.showWarning(`An error occurred while trying to ${fromWhich}!` + apiResult.Message);
          this.loadingScreenService.stopLoading();
        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to ${fromWhich}! ` + error);

      }


    }), ((error) => {

      this.loadingScreenService.stopLoading();
    });


  }

  downloadLetter() {

    this.loadingScreenService.startLoading();
    this.objectApi.getObjectById(this.CanidateUI.ObjectStorageId)
      .subscribe(data => {

        //this.spinnerEnd();


        let apiResult: any = data;

        console.log(apiResult.Result);
        //     var blob = new Blob([apiResult.Result.Content], { type: 'application/pdf' });

        //  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        //   window.navigator.msSaveOrOpenBlob(blob, "letter.pdf");
        //  } else {
        //   var a = document.createElement('a');
        //   a.href = URL.createObjectURL(blob);
        //   a.download = "letter.pdf";
        //   document.body.appendChild(a);
        //   a.click();
        //   document.body.removeChild(a);
        //  }


        if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {
          //console.log(apiResult.Result);
          let base64 = apiResult.Result.Content;
          let contentType = 'application/pdf';
          let fileName = "letter";
          // let file = null;

          const byteCharacters = atob(base64);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);

          const blob = new Blob([byteArray], { type: contentType });

          const blobUrl = URL.createObjectURL(blob);
          console.log(blobUrl);
          this.loadingScreenService.stopLoading();
          window.open(blobUrl);

          // saveAs(apiResult.Result.Content, 'testing.pdf');
        }
        else {
          this.loadingScreenService.stopLoading();
        }
      });


    // let file = new File([blob], fileName, {
    //   type: contentType,
    //   lastModified: Date.now()
    // });


  }

  /* #endregion */


  acceptLetter() {


    // const modalRef = this.modalService.open(AadhaarVerificationComponent, this.modalOption);
    // modalRef.componentInstance.CompanyId = this.CompanyId;
    // modalRef.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
    // modalRef.result.then((result) => {
    //   console.log('result', result);
    //   if (result != 'Modal Closed') {

    //     let integ = new IntegrationTransactionalDetails();
    //     integ = result;
    //     const sourceData = JSON.parse(integ.SourceData);
    //     const responseData = JSON.parse(integ.ResponseData);
    //     console.log('responseDate', responseData);
    //     responseData.data.result.dataFromAadhaar.maskedAadhaarNumber = sourceData.aadhaarNo;

    //     this.headerService.setCandidateDetailsForAadhaar(responseData.data.result.dataFromAadhaar);
    //     this.headerService.setDefaultClientObject(this.defaultSearchInputs);

    //     this.headerService.setCandidateBasicInformation(result);
    //     this.router.navigate(['candidate_information'], {
    //       queryParams: {
    //         "Idx": btoa(this.CanidateUI.OfferDetailId),
    //         "Cdx": btoa(this.CanidateUI.CandidateId)
    //       }
    //     });
    //   }

    // }).catch((error) => {
    //   console.log(error);
    // });

    // return;

    this.loadingScreenService.startLoading();
    this.acceptanceStatusId = this.ApprovalFor = "OL" ? AcceptanceStatus.OL_Accepted : AcceptanceStatus.AL_Accepted;
    // this.alertService.confirmSwal("Confirm Accept?", "Are you sure you want to reject? If you reject now you'll not revert this offer.", "Yes, Confirm").then(result => {
    let req_params = `candidateId=${this.CanidateUI.CandidateId}&acceptanceStatus=${this.acceptanceStatusId}&rejectionReason=${0}&remarks=${null}`;
    this.candidateService.rejectAcceptanceLetter(req_params).subscribe((res) => {
      console.log('res', res);
      let apiResult: apiResult = res;
      if (apiResult.Status && apiResult.Result != "" && apiResult != undefined) {

        if (this.CanidateUI.OnboardingType == OnBoardingType.Flash) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();

          if (this.CanidateUI.hasOwnProperty("AadhaarVerificationRequired") && this.CanidateUI.AadhaarVerificationRequired) {
            const modalRef = this.modalService.open(AadhaarVerificationComponent, this.modalOption);
            modalRef.componentInstance.CompanyId = this.CompanyId;
            modalRef.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
            modalRef.result.then((result) => {
              console.log('result', result);
              if (result != 'Modal Closed') {

                let integ = new IntegrationTransactionalDetails();
                integ = result;
                const sourceData = JSON.parse(integ.SourceData);
                const responseData = JSON.parse(integ.ResponseData);
                console.log('responseDate', responseData);
                responseData.data.result.dataFromAadhaar.maskedAadhaarNumber = sourceData.aadhaarNo;

                this.headerService.setCandidateDetailsForAadhaar(responseData.data.result.dataFromAadhaar);
                this.headerService.setDefaultClientObject(this.defaultSearchInputs);

                this.headerService.setCandidateBasicInformation(result);
                this.router.navigate(['candidate_information'], {
                  queryParams: {
                    "Idx": btoa(this.CanidateUI.OfferDetailId),
                    "Cdx": btoa(this.CanidateUI.CandidateId)
                  }
                });
              }

            }).catch((error) => {
              console.log(error);
            });

            return;
          }
          else {
            this.router.navigate(['candidate_information'], {
              queryParams: {
                "Idx": btoa(this.CanidateUI.OfferDetailId),
                "Cdx": btoa(this.CanidateUI.CandidateId)
              }
            });
          }


        }
        else if (this.CanidateUI.OnboardingType == OnBoardingType.Proxy) {

          this.workFlowInitiation.Remarks = "";
          this.workFlowInitiation.EntityId = this.CanidateUI.CandidateId;
          this.workFlowInitiation.EntityType = EntityType.CandidateDetails;
          this.workFlowInitiation.CompanyId = this.CompanyId;
          this.workFlowInitiation.ClientContractId = this.CanidateUI.ClientContractId;
          this.workFlowInitiation.ClientId = this.CanidateUI.ClientId;
          this.workFlowInitiation.ActionProcessingStatus = 4000;
          this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
          this.workFlowInitiation.WorkFlowAction = 1;
          this.workFlowInitiation.RoleId = this.RoleId;
          this.workFlowInitiation.DependentObject = this.CanidateUI;
          this.workFlowInitiation.UserInterfaceControlLst = this.accessControl_accept;

          this.finalWorkFlow(this.workFlowInitiation, "Accepting");

        }

      } else {
        this.alertService.showWarning(apiResult.Message), this.loadingScreenService.stopLoading();
      }

    });

    // })
    //   .catch(error => { this.spinnerEnd() });

  }

  onNavigate() {
    window.open("https://hfactor.app/", "_blank");
  }


  openSurveyQuestions() {

    const modalRef = this.modalService.open(SurveyComponent, this.modalOption);
    modalRef.componentInstance.entityData = { EntityId: this.CanidateUI.CandidateId, EntityType: EntityType.CandidateDetails };
    modalRef.result.then((result) => {
      console.log('result', result);
      if (result != 'Modal Closed') {
        this.SurveyResponded = true;
      }

    }).catch((error) => {
      console.log(error);
    });
  }

  doCheckAgree(){
    return this.CanidateUI && !this.CanidateUI.hasOwnProperty('IsSurveyQuestionsModalRequired') ? true : this.CanidateUI && this.CanidateUI.hasOwnProperty('IsSurveyQuestionsModalRequired') && !this.CanidateUI.IsSurveyQuestionsModalRequired ? true : this.CanidateUI && this.CanidateUI.hasOwnProperty('IsSurveyQuestionsModalRequired') && this.CanidateUI.IsSurveyQuestionsModalRequired && this.SurveyResponded ? true : false;
  }

}
