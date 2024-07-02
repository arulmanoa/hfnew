import { Component, OnInit, HostListener } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { Pipe, PipeTransform } from '@angular/core';
import { ApprovalStatus } from '../../../_services/model/Candidates/CandidateDocuments'
import {
  CandidateQualityCheckModel, ClientApproval, DocumentApprovalData, ApprovalFor, ApprovalType
} from 'src/app/_services/model/OnBoarding/QC';
import { FileUploadService } from '../../../_services/service/fileUpload.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { OnBoardingType, } from "src/app/_services/model//Base/HRSuiteEnums";
import { ObjectStorageDetails } from '../../../_services/model/Candidates/ObjectStorageDetails';
import { DomSanitizer } from '@angular/platform-browser';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { ActivatedRoute, Router, Event, NavigationStart, RoutesRecognized } from '@angular/router';
import { WorkflowService } from '../../../_services/service/workflow.service';
import { AlertService } from '../../../_services/service/alert.service';
import Swal from "sweetalert2";
import { Location } from '@angular/common';

import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';

import * as _ from 'lodash';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { CandidateModel } from 'src/app/_services/model/Candidates/CandidateModel';
import { apiResult } from 'src/app/_services/model/apiResult';
import { CandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';


@Component({
  selector: 'app-vendor-qc',
  templateUrl: './vendor-qc.component.html',
  styleUrls: ['./vendor-qc.component.css']
})
export class VendorQcComponent implements OnInit {

  objCandidateQualityCheckModel: CandidateQualityCheckModel = new CandidateQualityCheckModel();
  // lstClientApproval: ClientApproval[] = [] as any;
  // objClientApproval: ClientApproval = new ClientApproval;

  //   OverallApprovalStatus: ApprovalStatus;

  //   OverallRemarks: string;
  // }

  OverallRemarks: string = '#';
  ApprovalStatusEnumValues: typeof
    ApprovalStatus = ApprovalStatus;

  ApprovalTypeEnumValues: typeof
    ApprovalType = ApprovalType;

  ApprovalForEnumValues: typeof
    ApprovalFor = ApprovalFor;

  currentModalItem: any;//DocumentApprovalData;
  contentmodalurl: any;
  currentModalHeading: any;
  currentModalDetailsFormat: any;
  workFlowDtls: WorkFlowInitiation = new WorkFlowInitiation;
  _loginSessionDetails: LoginResponses;

  accessControl: UserInterfaceControlLst = new UserInterfaceControlLst;
  userAccessControl;
  Id: any;
  statutoryLabel: string;

  iframeContent: any;
  RoleId: any;
  UserId: any;
  UserName: any;
  _NewCandidateDetails: CandidateDetails = new CandidateDetails();
  clientLogoLink: any;
  clientminiLogoLink: any;
  BusinessType : any;
  constructor(private onboardingApi: OnboardingService, private objectApi: FileUploadService, private sanitizer: DomSanitizer,
    private workflowApi: WorkflowService, public loadingScreenService: LoadingScreenService, private _location: Location, private alertService: AlertService, private router: Router, public sessionService: SessionStorage, private route: ActivatedRoute,) {
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });

  }

  ngOnInit() {
    
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        // var encodedCdx = atob(params["Cdx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        // this.CandidateId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);
      }
      else {
        alert('Invalid Url');
        this.router.navigateByUrl("app/onboardingqc/onbqclist");
        return;
      }
    });
    this.loadingScreenService.startLoading();
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.UserName = this._loginSessionDetails.UserSession.PersonName;
    this.contentmodalurl = null;  
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.clientLogoLink = 'logo.png';
    if (this._loginSessionDetails.CompanyLogoLink != "" && this._loginSessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject =  JSON.parse(this._loginSessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink =  jsonObject.minilogo;
    } else if (this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
      if (isDefualtExist != null && isDefualtExist != undefined) {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);       
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink =  jsonObject.minilogo;
      } else {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList[0].ClientLogoURL);       
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink =  jsonObject.minilogo;
      } 
    } 
    // this.objCandidateQualityCheckModel.ClientName = "ClientName";
    // this.objCandidateQualityCheckModel.InitiatedDetails = "InitiatedDetails";
    // this.objCandidateQualityCheckModel.CandidateName = "CandidateName";
    // this.objCandidateQualityCheckModel.OnBoardingType = 1;
    // let a = OnBoardingType[this.objCandidateQualityCheckModel.OnBoardingType]
    // console.log(a);
    // // this.objCandidateQualityCheckModel.ClientName = "A";
    // this.objCandidateQualityCheckModel.SubmittedDetails = "SubmittedDetails";

    // // this.objClientApproval.ApprovalFor
    // // this.lstClientApproval.push();
    // // this.objCandidateQualityCheckModel.ClientApprovals = this.lstClientApproval;
    // console.log(JSON.stringify(this.objCandidateQualityCheckModel));
    this.onboardingApi.getOnboardingQCInfo(this.Id)
      .subscribe((data: any) => {
        this.objCandidateQualityCheckModel = data.Result;
        this.get_candidateRecord(this.objCandidateQualityCheckModel);
        this.statutoryLabel = '';
        if (this.objCandidateQualityCheckModel != null && this.objCandidateQualityCheckModel != undefined
          && this.objCandidateQualityCheckModel.LstStatutory != null &&
          this.objCandidateQualityCheckModel.LstStatutory.length > 0) {
          if (this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].UAN != null &&
            this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].UAN == '') {
            this.statutoryLabel = this.statutoryLabel + "UAN - " + this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].UAN;
          }

          if (this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].ESICNumber != null &&
            this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].ESICNumber == '') {
            this.statutoryLabel = this.statutoryLabel + "ESIC - " + this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].ESICNumber;
          }

          if (this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].PAN != null &&
            this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].PAN == '') {
            this.statutoryLabel = this.statutoryLabel + "PAN - " + this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].PAN;
          }

          if (this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].PFNumber != null &&
            this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].PFNumber == '') {
            this.statutoryLabel = this.statutoryLabel + "PFN - " + this.objCandidateQualityCheckModel.LstCandidateStatutoryDtls[0].PFNumber;
          }

        }

        this.objCandidateQualityCheckModel.LstRateSet = _.filter(this.objCandidateQualityCheckModel.LstRateSet, (a => a.IsDisplayRequired && Number(a.Value) != Number(0)));
        this.objCandidateQualityCheckModel.LstRateSet = _.orderBy(this.objCandidateQualityCheckModel.LstRateSet, ["DisplayOrder"], ["asc"]);


        console.log(this.objCandidateQualityCheckModel);
        this.loadingScreenService.stopLoading();
      }); 


  }

  isValidSubmission() {
    if (this.objCandidateQualityCheckModel.ClientApprovals != null && this.objCandidateQualityCheckModel.ClientApprovals.some(x => x.ApprovalStatus == ApprovalStatus.Pending)) {
      this.alertService.showWarning('Please validate all Approvals before submitting');
      return false;
    }

    if (this.objCandidateQualityCheckModel.LstGeneral != null && this.objCandidateQualityCheckModel.LstGeneral.some(x => x.ApprovalStatus == ApprovalStatus.Pending)) {
      this.alertService.showWarning('Please validate all General details before submitting');
      return false;
    }

    if (this.objCandidateQualityCheckModel.LstBankDetails != null && this.objCandidateQualityCheckModel.LstBankDetails.some(x => x.ApprovalStatus == ApprovalStatus.Pending)) {
      this.alertService.showWarning('Please validate Bank details before submitting');
      return false;
    }

    if (this.objCandidateQualityCheckModel.LstWorkExperiences != null && this.objCandidateQualityCheckModel.LstWorkExperiences.some(x => x.ApprovalStatus == ApprovalStatus.Pending)) {
      this.alertService.showWarning('Please validate Work experiences before submitting');
      return false;
    }

    if (this.objCandidateQualityCheckModel.LstEducation != null && this.objCandidateQualityCheckModel.LstEducation.some(x => x.ApprovalStatus == ApprovalStatus.Pending)) {
      this.alertService.showWarning('Please validate Education details before submitting');
      return false;
    }

    return true;
  }

  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Any unsaved data will be lost!, Are you sure you want to close this form?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.router.navigateByUrl("app/onboardingqc/onbqclist");

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })
    // if (confirm('Any unsaved data will be lost, Are you sure you want to close this form?')) {
    //   var path = localStorage.getItem('previousPath');
    //   if (path != null && path != undefined) {
    //     this.router.navigate([path]);
    //   }
    // }
  }

  updateCandidateQCInfo(isSubmit: boolean, isFinallyApproved: boolean) {
    //console.log(this.objCandidateQualityCheckModel);
    //return;
    if (isSubmit && !this.isValidSubmission()) {
      return;
    }

    var isApproval;
    this.objCandidateQualityCheckModel.OverallApprovalStatus = isFinallyApproved ? ApprovalStatus.Approved : isSubmit ? ApprovalStatus.Rejected : ApprovalStatus.Pending;
    isApproval = this.objCandidateQualityCheckModel.OverallApprovalStatus;

    if (isSubmit && !isFinallyApproved && (this.objCandidateQualityCheckModel.OverallRemarks == null || this.objCandidateQualityCheckModel.OverallRemarks == undefined || this.objCandidateQualityCheckModel.OverallRemarks.trim() == '')) {
      this.alertService.showWarning('Please give remarks/reasons for rejecting the request');
      return;
    }

    this.alertService.confirmSwal("Are you sure?", isSubmit ? ('Are you sure you want to ' + (isFinallyApproved ? 'Approve' : 'Reject') + ' this request?') : 'Are you sure you want to save the details you entered?', "Yes, Proceed").then(result => {
      this.loadingScreenService.startLoading();
      if (isSubmit) {
        this.objCandidateQualityCheckModel.OverallApprovalStatus = isFinallyApproved ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
      }
      this.onboardingApi.updateOnboardingQCInfo(this.objCandidateQualityCheckModel).subscribe(data => {
        if (data != null && data != undefined && data.Status) {
          if (!isSubmit) {
            this.alertService.showSuccess('This QC request is saved successfully');
            this.loadingScreenService.stopLoading();
            //navigate to claimed requests
          }
          else {
            this.workFlowDtls.Remarks = '';//this.objCandidateQualityCheckModel.OverallRemarks;
            this.workFlowDtls.EntityId = this.objCandidateQualityCheckModel.CandidateId;
            this.workFlowDtls.EntityType = 11;
            this.workFlowDtls.CompanyId = this._loginSessionDetails.Company.Id;
            this.workFlowDtls.ClientContractId = this.objCandidateQualityCheckModel.ClientContractId;
            this.workFlowDtls.ClientId = this.objCandidateQualityCheckModel.ClientId;

            this.workFlowDtls.ActionProcessingStatus = 4000;
            this.workFlowDtls.ImplementationCompanyId = 0;
            this.workFlowDtls.WorkFlowAction = 1;
            this.workFlowDtls.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
            this.workFlowDtls.DependentObject = (this.objCandidateQualityCheckModel);
            this.workFlowDtls.UserInterfaceControlLst = this.userAccessControl.filter(a => isFinallyApproved ? a.ControlName == "btn_qc_submit" : a.ControlName == "btn_qc_reject");

            this.workflowApi.postWorkFlow(JSON.stringify(this.workFlowDtls)).subscribe((response) => {

              if (response != null && response != undefined && !response.Status) {
                this.alertService.showInfo(response != null && response != undefined ? response.Message : 'Data saved but unable to submit, please contact support team');
                this.loadingScreenService.stopLoading();
                return;
              }
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess('Response submitted successfully');
              this.router.navigateByUrl("app/onboardingqc/onbqclist");

            }), ((error) => {

            });

          }
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showInfo(data != null && data != undefined ? data.Message : 'Unable to process this request, please contact support team');
        }
      });

    })
      .catch(error => this.loadingScreenService.stopLoading());


  }

  clearUrl() {
    this.currentModalDetailsFormat = '';
    this.currentModalItem = null;
    this.currentModalHeading = '';
    this.contentmodalurl = null;
  }

  validateDocument(isApproval: boolean) {
    if (!isApproval) {

      if (this.currentModalItem.RejectionRemarks != undefined) {
        if (this.currentModalItem.RejectionRemarks == null || this.currentModalItem.RejectionRemarks.trim() == '') {
          this.alertService.showWarning("Please give remarks/rejection reasons and try again!")
          return;
        }
      }
      else if (this.currentModalItem.Remarks == null || this.currentModalItem.Remarks == undefined || this.currentModalItem.Remarks.trim() == '') {
        this.alertService.showWarning("Please give remarks/rejection reasons and try again!")
        return;
      }
    }

    this.alertService.confirmSwal("Are you sure?", 'Are you sure you want to ' + (isApproval ? 'Approve' : 'Reject') + ' this record?', "Yes, Proceed").then(result => {
      this.loadingScreenService.startLoading();
      this.currentModalItem.ApprovalStatus = isApproval ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
      $('#modaldocumentviewer').modal('hide');
      this.loadingScreenService.stopLoading()
    })
      .catch(error => this.loadingScreenService.stopLoading());



  }

  openmodalpopupdocument(type: string, item: any, format: string) {
    this.currentModalDetailsFormat = '';
    this.currentModalHeading = '';
    this.currentModalItem = null;
    this.contentmodalurl = null;

    this.currentModalItem = item;
    this.currentModalHeading = type;
    this.currentModalDetailsFormat = format;

    $('#modaldocumentviewer').modal('show');

    var contentType = this.objectApi.getContentType(item.DocumentName);
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.objectApi.getObjectById(item.ObjectStorageId)
        .subscribe(dataRes => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
            //handle error
          }
          let file = null;

          var objDtls = dataRes.Result;
          // var contentType = this.objectApi.getContentType(objDtls.ObjectName);
          // if(contentType == '')
          // {
          //   contentType = objDtls.Attribute1;
          // }

          const byteArray = atob(objDtls.Content);
          const blob = new Blob([byteArray], { type: contentType });
          file = new File([blob], objDtls.ObjectName, {
            type: contentType,
            lastModified: Date.now()
          });


          if (file !== null) {

            //const newPdfWindow = window.open('', '');
            var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
            // this.sanitizer.sanitize(SecurityContext.URL, urll);
            this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
            console.log(this.contentmodalurl);
          }
          // // tslint:disable-next-line:max-line-length
          // const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

          // const iframeEnd = '\'><\/iframe>';

          // newPdfWindow.document.write(iframeStart + content + iframeEnd);
          // newPdfWindow.document.title = data.OriginalFileName;
          // // fileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // alert('Preview not avilable for word document. please download instead...');

      //const newPdfWindow = window.open('', '');

      //const content = DocumentId;
      var appUrl = this.objectApi.getUrlToGetObject(item.ObjectStorageId);
      // tslint:disable-next-line:quotemark..change this
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
      console.log(this.contentmodalurl);
      // this.contentmodalurl = "'https://docs.google.com/gview?url='http://localhost:59271/api/GetObject/GetObject/556/0x7E09A16E7FE8EFCA39219EDC035BBC4DD8116DF1FC4AB062CC6AA3E79AD224359416DA6D5E0689F221E1A1EB9D143B38BE05&embedded=true'"
      // const srcUrl = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_FETCHDOCUMENTBYTES_ENDPOINT;
      // const iframeUrlParams = 'DocumentId=';
      // // tslint:disable-next-line:quotemark
      //const iframeEnd = "&embedded=true'";
      // newPdfWindow.document.write(iframeStart + srcUrl + iframeUrlParams + content + iframeEnd);
      // newPdfWindow.document.title = data.OriginalFileName;


    }

    //---------------------------------




  }

  /* #region  Preview CTC */
  previewCTC() {

    $('#popup_preview_ctc').modal('show');

  }
  getAnnualValue(value) {
    return Number(value * 12)
  }
  modal_dismiss() {

    $('#popup_preview_ctc').modal('hide');
  }


  /* #endregion */



  /* #region  Preview AL Letter (Popup) */
  previewLetter(myObject) {
    this.iframeContent = null;
    $('#popup_previewLetter').modal('show');
    var contentType = 'application/pdf';
    this.objectApi.getObjectById(myObject.DocumentId)
      .subscribe(dataRes => {
        if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
          this.alertService.showWarning("Preview not available. try after sometimes!")
          return;
        }
        let file = null;
        var objDtls = dataRes.Result;

        const byteArray = atob(objDtls.Content);
        const blob = new Blob([byteArray], { type: contentType });
        file = new File([blob], objDtls.ObjectName, {
          type: contentType,
          lastModified: Date.now()
        });


        if (file !== null) {
          var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
          this.iframeContent = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log(this.contentmodalurl);
        }

      });

  }

  modal_dismiss_letter() {
    $('#popup_previewLetter').modal('hide');
    this.iframeContent = null;
  }
  /* #endregion */

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {

    if (window.pageYOffset > 350) {
      let element = document.getElementById('navbar');
      element.classList.add('sticky');
    } else {
      let element = document.getElementById('navbar');
      element.classList.remove('sticky');
    }
  }

  get_candidateRecord(dataSet) {
    this.loadingScreenService.startLoading();
    console.log(dataSet);
    let req_param_uri = `Id=${dataSet.CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingApi.getCandidate(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      if (apiResponse.Status) {
        let candidateModel: CandidateModel = (apiResponse.dynamicObject);
        this._NewCandidateDetails = candidateModel.NewCandidateDetails;

        console.log(this._NewCandidateDetails);
        this.loadingScreenService.stopLoading();
      }
      else {
        this._location.back();
        this.alertService.showWarning(`Something is wrong!  ${apiResponse.Message}`);
        this.loadingScreenService.stopLoading();
      }
    },
      (err) => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
      });

  }

  PreviewALOLLetter(index: any) {

    this.loadingScreenService.startLoading();

    let temp_CandidateDetails = this._NewCandidateDetails;

    if (index == 'OL') {
      temp_CandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId = 0;
    }
    else {
      temp_CandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = 0;
    }

    var req_post_param = JSON.stringify({

      ModuleProcessTranscId: this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId,
      CandidateDetails: temp_CandidateDetails
    });

    ;


    this.onboardingApi.postPreviewLetter(req_post_param)
      .subscribe(data => {

        this.loadingScreenService.stopLoading();
        let apiResult: apiResult = data;

        if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {
          console.log(apiResult.Result);
          let base64 = apiResult.Result;
          let contentType = 'application/pdf';
          let fileName = "integrum_previewLetter";
          // let file = null;

          const byteArray = atob(base64);
          const blob = new Blob([byteArray], { type: contentType });
          let file = new File([blob], fileName, {
            type: contentType,
            lastModified: Date.now()
          });

          this.loadingScreenService.stopLoading();
          if (file !== null) {
            let fileURL = null;

            const newPdfWindow = window.open('', '');

            const content = encodeURIComponent(base64);

            // tslint:disable-next-line:max-line-length
            const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

            const iframeEnd = '\'><\/iframe>';

            newPdfWindow.document.write(iframeStart + content + iframeEnd);
            newPdfWindow.document.title = fileName;
            // fileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));


          }
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }),

      ((error) => {
        this.loadingScreenService.stopLoading();

      });
  }

}