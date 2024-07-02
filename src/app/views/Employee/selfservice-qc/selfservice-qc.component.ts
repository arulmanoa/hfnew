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
import { EmployeeService } from 'src/app/_services/service';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import * as JSZip from 'jszip'; //JSZip

@Component({
  selector: 'app-selfservice-qc',
  templateUrl: './selfservice-qc.component.html',
  styleUrls: ['./selfservice-qc.component.css']
})
export class SelfserviceQcComponent implements OnInit {

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
  employeeModel: EmployeeModel = new EmployeeModel();

  accessControl: UserInterfaceControlLst = new UserInterfaceControlLst;
  userAccessControl;
  Id: any;
  statutoryLabel: string;
  spinner: any;
  iframeContent: any;
  RoleId: any;
  UserId: any;
  CompanyId: any;
  UserName: any;
  newEmployeeDetails: EmployeeDetails = new EmployeeDetails();
  bankDetails = [];
  OverallRemarks: any;
  RejectionRemarks: any;
  _ModuleProcessId: any = 0;
  clientLogoLink: any;
  BusinessType: any;
  clientminiLogoLink: any;
  IsPennyDropVerificationMode: any;
  entityId: any;
   // JSZIP
   docList: any[];//jszip
   zipFileUrl: any;//JSZIP
   downLoadFileName: any;//JSZIP
   documentURL: any;
   DocumentId: any;

  constructor(private onboardingApi: OnboardingService, private objectApi: FileUploadService, private sanitizer: DomSanitizer,
    private workflowApi: WorkflowService, public loadingScreenService: LoadingScreenService, private _location: Location, private alertService: AlertService, private router: Router, public sessionService: SessionStorage, private route: ActivatedRoute,
    private employeeService: EmployeeService) {
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });

  }
  ngOnInit() {
    this.spinner = true;
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Cdx"]);
        this._ModuleProcessId = atob(params["Idx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        // this.CandidateId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);
      }
      else {
        alert('Invalid Url');
        this.router.navigateByUrl("app/onboardingqc/selfService_qc");
        return;
      }
    });


    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.UserName = this._loginSessionDetails.UserSession.PersonName;
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.contentmodalurl = null;
    this.clientLogoLink = 'logo.png';
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    if (this._loginSessionDetails.CompanyLogoLink != "" && this._loginSessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject = JSON.parse(this._loginSessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink = jsonObject.minilogo;
    } else if (this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
      if (isDefualtExist != null && isDefualtExist != undefined) {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      } else {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList[0].ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      }
    }

    this.getEmployeeDetails();
  }

  getEmployeeDetails() {



    this.employeeService.getEmployeeDetailsById(this.Id).subscribe((result) => {
      let apiResult: apiResult = (result);
      this.newEmployeeDetails = result.Result;
      this.employeeModel.oldobj = Object.assign({}, result.Result);
      this.bankDetails = this.newEmployeeDetails.lstEmployeeBankDetails;
      this.IsPennyDropVerificationMode = this.newEmployeeDetails.lstEmployeeBankDetails.find(a => a.ModuleProcessTransactionId == this._ModuleProcessId && a.VerificationMode == 2) != undefined ? true : false;
      this.entityId = this.newEmployeeDetails.lstEmployeeBankDetails.find(a => a.ModuleProcessTransactionId == this._ModuleProcessId && a.VerificationMode == 2) != undefined ? this.newEmployeeDetails.lstEmployeeBankDetails.find(a => a.ModuleProcessTransactionId == this._ModuleProcessId && a.VerificationMode == 2).Id : 0;
      this.spinner = false;

    });

  }

  clearUrl() {
    this.currentModalDetailsFormat = '';
    this.currentModalItem = null;
    this.currentModalHeading = '';
    this.contentmodalurl = null;
  }

  validateDocument(isApproval: boolean) {
    if (this.RejectionRemarks && this.RejectionRemarks !== null || this.RejectionRemarks !== undefined && (this.currentModalItem.Remarks == null || this.currentModalItem.Remarks == undefined)) {
      this.currentModalItem.Remarks = this.RejectionRemarks ? this.RejectionRemarks : this.currentModalItem.Remarks;
    }
    if (!isApproval) {
      if (this.RejectionRemarks == undefined && (this.currentModalItem.Remarks == null || this.currentModalItem.Remarks == undefined)) {
        if (this.RejectionRemarks == null || this.RejectionRemarks.trim() == '') {
          this.alertService.showWarning("Please give remarks/rejection reasons and try again!")
          return;
        }
      } else if (this.currentModalItem.Remarks == null || this.currentModalItem.Remarks == undefined || this.currentModalItem.Remarks.trim() == '') {
        this.alertService.showWarning("Please give remarks/rejection reasons and try again!")
        return;
      }
    }
    this.alertService.confirmSwal("Are you sure?", 'Are you sure you want to ' + (isApproval ? 'Approve' : 'Reject') + ' this record?', "Yes, Proceed").then(result => {
      this.loadingScreenService.startLoading();
      this.currentModalItem.Status = isApproval ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
      this.currentModalItem.Remarks = this.RejectionRemarks == undefined ? this.currentModalItem.Remarks : this.RejectionRemarks;
      $('#modaldocumentviewer').modal('hide');
      $('#documentviewer').modal('hide');
      this.loadingScreenService.stopLoading();
    }).catch(error => this.loadingScreenService.stopLoading());

    console.log('current modal :', this.currentModalItem);
    console.log('bank details :', this.newEmployeeDetails.lstEmployeeBankDetails);
    var isExist = this.newEmployeeDetails.lstEmployeeBankDetails.find(a => a.Id == this.currentModalItem.Id);
    if (isExist != undefined || isExist != null) {
      isExist.Modetype = UIMode.Edit;
      isExist.CandidateDocument.Status = isExist.Status;
      isExist.CandidateDocument.Modetype = isExist.Modetype;
    }
  }

  openmodalpopupdocument(type: string, item: any, format: string) {
    this.currentModalDetailsFormat = '';
    this.currentModalHeading = '';
    this.currentModalItem = null;
    this.contentmodalurl = null;
    this.currentModalItem = item;
    item = item.CandidateDocument;
    this.currentModalHeading = type;
    this.DocumentId =  item.ObjectStorageId !== undefined || item.ObjectStorageId !== null ? item.DocumentId : item.ObjectStorageId;
    this.currentModalDetailsFormat = format;
    console.log('currentModalItem', this.currentModalItem);
    $('#modaldocumentviewer').modal('show');
    var contentType = this.objectApi.getContentType(item.FileName);
    console.log('contentType', contentType);
    // contentType = contentType == 'image/jpg' ? 'image' : contentType;
    console.log('item.CandidateDocumentId', item);

    if (contentType === 'application/pdf' || contentType.includes('image') || contentType.includes('image/jpg')) {
      this.objectApi.getObjectById(item.DocumentId)
        .subscribe(dataRes => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
            //handle error
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
            this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
            console.log(this.contentmodalurl);
          }
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {

      var appUrl = this.objectApi.getUrlToGetObject(item.DocumentId);
      // tslint:disable-next-line:quotemark..change this
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
      console.log(this.contentmodalurl);

    }



  }

  isValidSubmission() {

    if (this.newEmployeeDetails.lstEmployeeBankDetails != null && this.newEmployeeDetails.lstEmployeeBankDetails.some(x => x.ModuleProcessTransactionId > 0 && x.Status == ApprovalStatus.Pending)) {
      this.alertService.showWarning('Please validate Bank details before submitting');
      return false;
    }

    return true;
  }

  updateCandidateQCInfo(isSubmit: boolean, isFinallyApproved: boolean) {
    //console.log(this.objCandidateQualityCheckModel);
    //return;

    if (isSubmit && this.IsPennyDropVerificationMode == false && !this.isValidSubmission()) {
      return;
    }

    var isApproval;
    isFinallyApproved ? ApprovalStatus.Approved : isSubmit ? ApprovalStatus.Rejected : ApprovalStatus.Pending;

    if (isSubmit && !isFinallyApproved && (this.OverallRemarks == null || this.OverallRemarks == undefined || this.OverallRemarks.trim() == '')) {
      this.alertService.showWarning('Please give remarks/reasons for rejecting the request');
      return;
    }
    // this.newEmployeeDetails.LstemployeeInvestmentDeductions != null && this.newEmployeeDetails.LstemployeeInvestmentDeductions.length > 0 &&
    //   this.newEmployeeDetails.LstemployeeInvestmentDeductions.forEach(e => {
    //     var sum = 0;
    //     (e.LstEmployeeInvestmentDocuments != null && e.LstEmployeeInvestmentDocuments.length > 0 && e.LstEmployeeInvestmentDocuments.forEach(el => { sum += (el.ApprovedAmount) }));
    //     e.ApprovedAmount = sum as any;
    //     e.Modetype = UIMode.Edit;
    //   });

    console.log('emplyee', this.newEmployeeDetails);

    if (this.IsPennyDropVerificationMode) {
      this.finalSubmit(isSubmit,isFinallyApproved);
    } else {
      this.alertService.confirmSwal("Are you sure?", isSubmit ? ('Are you sure you want to ' + (isFinallyApproved ? 'Approve' : 'Reject') + ' this request?') : 'Are you sure you want to save the details you entered?', "Yes, Proceed").then(result => {
        this.finalSubmit(isSubmit,isFinallyApproved);
      })
        .catch(error => this.loadingScreenService.stopLoading());
    }


  }


  finalSubmit(isSubmit, isFinallyApproved: boolean) {


    this.loadingScreenService.startLoading();

    // this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0 && this.newEmployeeDetails.LstemployeeHouseRentDetails.forEach(emt => {
    //   emt.RentAmount = Math.floor(this.LstemployeeHouseRentDetails[0].Amount / 12);
    //   emt.ApprovedAmount = Math.floor(this.LstemployeeHouseRentDetails[0].ApprovedAmount / 12);
    //   emt.Modetype = UIMode.Edit;
    // });     

    // isSubmit  &&  (this.newEmployeeDetails.EmployeeInvestmentMaster.Status = isFinallyApproved  ? ApprovalStatus.Approved : ApprovalStatus.Rejected)
    // isSubmit  &&  (this.newEmployeeDetails.EmployeeInvestmentMaster.Remarks = this.OverallRemarks);
    this.newEmployeeDetails.Modetype = UIMode.Edit;
    this.newEmployeeDetails.Aadhaar = (this.newEmployeeDetails.Aadhaar as any) == 'NULL' ? null : this.newEmployeeDetails.Aadhaar; 

    this.employeeModel.newobj = this.newEmployeeDetails;
    var Employee_request_param = JSON.stringify(this.employeeModel);
    this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
      console.log(data);
      let responded : apiResponse = data;
      if(responded.Status && responded.dynamicObject != null){
      if (!isSubmit) {
        this.alertService.showSuccess('This Investment request is saved successfully');
        this.loadingScreenService.stopLoading();
        this.router.navigateByUrl("app/onboardingqc/investment_qc");

        //navigate to claimed requests
      }
      else {

        if (this.newEmployeeDetails.lstEmployeeBankDetails.length > 0) {
          this.newEmployeeDetails.lstEmployeeBankDetails.forEach(e => {
            if (e.Modetype == 1) {
              data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.IdentifierValue == e.IdentifierValue).Modetype = UIMode.Edit;
            }
          });
        }
        // console.log('data.dynamicObject.newobj.lstEmployeeBankDetails', data.dynamicObject.newobj.lstEmployeeBankDetails);

        // return;

        if (data.Status) {
          let entityId = 0;
          if (this.IsPennyDropVerificationMode) {
            entityId = this.entityId
          }else {
            entityId = this.newEmployeeDetails.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit).Id;

          }

          this.alertService.showSuccess(data.Message);
          var accessControl_submit = {
            AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
              : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
            ViewValue: null
          };
          
          this.workFlowDtls.Remarks = this.OverallRemarks;
          this.workFlowDtls.EntityId = entityId;
          this.workFlowDtls.EntityType = EntityType.EmployeeBankDetails;
          this.workFlowDtls.CompanyId = this.CompanyId;
          this.workFlowDtls.ClientContractId = this.newEmployeeDetails.EmploymentContracts[0].ClientContractId;
          this.workFlowDtls.ClientId = this.newEmployeeDetails.EmploymentContracts[0].ClientId;
          this.workFlowDtls.ActionProcessingStatus = 25500;
          this.workFlowDtls.ImplementationCompanyId = 0;
          this.workFlowDtls.WorkFlowAction = isFinallyApproved ? 21 : 37;
          this.workFlowDtls.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
          this.workFlowDtls.DependentObject = this.newEmployeeDetails; // data.dynamicObject.newobj;
          this.workFlowDtls.UserInterfaceControlLst = accessControl_submit

          this.employeeService.post_BankDetailsWorkFlow(JSON.stringify(this.workFlowDtls)).subscribe((response) => {

            if (response != null && response != undefined && !response.Status) {
              this.alertService.showInfo(response != null && response != undefined ? response.Message : 'Data saved but unable to submit, please contact support team');
              this.loadingScreenService.stopLoading();
              return;
            }
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess('Response submitted successfully');
            this.router.navigateByUrl("app/onboardingqc/selfService_qc");

          }), ((error) => {

          });

        }


        else {
          this.alertService.showWarning(data.Message);
        }
      }
    }
    else {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(responded.Message);
    }
    },
      (err) => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
      });
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

        this.router.navigateByUrl("app/onboardingqc/selfService_qc");

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })

  }


  
  //NEW Change
  getFileList(type: string, item: any, format: string) {


    this.loadingScreenService.startLoading();
    console.log('item', item);
    this.currentModalDetailsFormat = '';
    this.currentModalHeading = '';
    this.contentmodalurl = null;

    this.currentModalItem = item;
    this.currentModalHeading = type;
    this.currentModalDetailsFormat = format;
    item = item.CandidateDocument;
    let DocId = item.DocumentId;
    this.DocumentId =  item.ObjectStorageId !== undefined || item.ObjectStorageId !== null ? item.DocumentId : item.ObjectStorageId;
    this.docList = [];
    try {


      this.objectApi.getObjectById(DocId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
          }
          var objDtls = dataRes.Result;
          console.log(objDtls);
          var zip = new JSZip();
          let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
          this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);

                  console.log('this.docList 1', this.docList);
                  this.loadingScreenService.stopLoading();
                  $("#documentviewer").modal('show');
                  $('#carouselExampleCaptions').carousel()

                });


                // let TempList = [];
                // TempList.push({
                //     contentType : 
                // })
              }
            });
          });
         

        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

  }

  getTargetOffSetImage(item: any) {

    const promise = new Promise((res, rej) => {
      var contentType = this.objectApi.getContentType(item.name);
      var blob = new Blob([item._data.compressedContent]);
      var file = new File([blob], item.name, {
        type: typeof item,
        lastModified: Date.now()
      });
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64String = (reader.result as string).split(",")[1];
        if (file !== null) {
          var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log(' DOCUMENT URL :', this.contentmodalurl);
          res({ ContentType: contentType, ImageURL: this.contentmodalurl })
        }
      }
    })


    return promise;
  }


  document_file_view(type: string, item: any, format: string) {

    console.log('item', item);
    


    $("#modaldocumentviewer").modal('show');
    this.downLoadFileName = item.name;

    var contentType = this.objectApi.getContentType(item.name);

    var blob = new Blob([item._data.compressedContent]);
    var file = new File([blob], item.name, {
      type: typeof item,
      lastModified: Date.now()
    });
    console.log(file);
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var base64String = (reader.result as string).split(",")[1];
      console.log(reader.result);
      if (file !== null) {
        var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
        console.log(' DOCUMENT URL :', this.contentmodalurl);

      }
    }


  }

  checkIsZipFile(item, whicharea) {
    // whicharea == 'ClientApproval' ? item['DocumentId'] = item.CandidateDocumentId : true;
    // whicharea == 'ClientApproval' ? item['FileName'] = item.DocumentName : true;
    item = item.CandidateDocument;
    var fileNameSplitsArray = item.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      return true;
    } else {
      return false;
    }
  }

}
