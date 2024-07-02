import { Component, OnInit, HostListener, Inject, Input, Output, EventEmitter } from '@angular/core';
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
import * as moment from 'moment';

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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EmployeeTaxExemptionDetails } from 'src/app/_services/model/Employee/EmployeeTaxExemptionDetails';
import { isNgTemplate } from '@angular/compiler';



export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-exemption-qc',
  templateUrl: './exemption-qc.component.html',
  styleUrls: ['./exemption-qc.component.css']
})
export class ExemptionQcComponent implements OnInit {

  @Input() taxExemptionDetails: any;
  @Input() lstlookUpDetails: any;
  @Output() exemptionChangeHandler = new EventEmitter();
  Id: any;
  _loginSessionDetails: LoginResponses;
  spinner: boolean = true;
  RoleId: any;
  UserId: any;
  url: any
  urlSafe: any
  CompanyId: any;
  UserName: any;
  newEmployeeDetails: EmployeeDetails = new EmployeeDetails();

  ApprovalStatusEnumValues: typeof
    ApprovalStatus = ApprovalStatus;
  documentItem: any;
  contentmodalurl: any;
  isExceed: boolean = false;

  OverallRemarks: any;
  ApprovedAmount: any = 0;

  employeeModel: EmployeeModel = new EmployeeModel();
  workFlowDtls: WorkFlowInitiation = new WorkFlowInitiation;
  whicharea: any;

  LstemployeeHouseRentDetails = [];
  LstEmployeeHousePropertyDetails = [];
  _LstEmployeeExemptionBillDetails: any
  _indexPosition: any
  documentURL : any;
  documentURLId : any;
  constructor(private onboardingApi: OnboardingService,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
    private workflowApi: WorkflowService,
    public loadingScreenService: LoadingScreenService,
    private _location: Location,
    private alertService: AlertService,
    private router: Router,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private fileuploadService: FileUploadService,
    public dialogRef: MatDialogRef<ExemptionQcComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }


  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
    this.spinner = true;

    this.route.queryParams.subscribe(params => {

      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Cdx"]);
        // var encodedCdx = atob(params["Cdx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        // this.CandidateId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);
      }
      else {
        alert('Invalid Url');
        this.router.navigateByUrl("app/onboardingqc/investment_qc");
        return;
      }
    });

    console.log('Tex Exemption :', this.taxExemptionDetails);

    // this._LstEmployeeExemptionBillDetails = null;
    this.spinner = false;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    // this.UserName = this._loginSessionDetails.UserSession.PersonName;
    // this.CompanyId = this._loginSessionDetails.Company.Id;
    // this._loadEmpUILookUpDetails().then((result) => {
    //   this.getEmployeeDetails();
    // });
  }


  // getEmployeeDetails() {

  //   this.employeeService.getEmployeeDetailsById(this.Id).subscribe((result) => {
  //     let apiResult: apiResult = (result);
  //     this.newEmployeeDetails = result.Result;
  //     this.employeeModel.oldobj = Object.assign({}, result.Result);
  //     console.log('EMPLOYEE DETAILS ::', this.newEmployeeDetails);
  //     this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0 && this.LstemployeeHouseRentDetails.push(this.newEmployeeDetails.LstemployeeHouseRentDetails[0]) as any;
  //     console.log('LstemployeeHouseRentDetails', this.LstemployeeHouseRentDetails);

  //     this.spinner = false;
  //   });

  // }
  // _loadEmpUILookUpDetails() {

  //   return new Promise((res, rej) => {
  //     this.employeeService.get_LoadEmployeeUILookUpDetails()
  //       .subscribe((result) => {
  //         let apiResponse: apiResponse = result;
  //         if (apiResponse.Status) {
  //           this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
  //           console.log('EMPLOYEE LOOKUP DETAILS :: ', this.lstlookUpDetails);

  //           res(true);
  //         }

  //       }, err => {
  //         rej();
  //       })
  //   });
  // }

  updateCandidateQCInfo(a, b) {

  }
  getCount(list, status) {
    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;

  }

  getProductName(ProductId) {

    var string = this.lstlookUpDetails.InvesmentProductList.find(a => a.ProductId == ProductId).ProductName.replace(/([A-Z])/g, ' $1').trim();
    string = _.startCase(string);
    return string;

  }
  getSourceContent(DocumentId, FileName) {
    const promise = new Promise((res, rej) => {
      var iframeURL = null;
      var contentType = this.objectApi.getContentType(FileName);
      if (contentType === 'application/pdf' || contentType.includes('image')) {
        console.log('content type :', contentType);

        this.objectApi.getObjectById(DocumentId)
          .subscribe(dataRes => {
            if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
              return 'about:blank';
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
              console.log('this.sanitizer.bypassSecurityTrustResourceUrl(urll)', this.sanitizer.bypassSecurityTrustResourceUrl(urll));
              iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              res(iframeURL);

            }

          });
      } else if (contentType === 'application/msword' ||
        contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {

        var appUrl = this.objectApi.getUrlToGetObject(DocumentId);
        // tslint:disable-next-line:quotemark..change this
        var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
        iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
        res(iframeURL);

      }
    })
    return promise;

  }
  async openDocumentAttention_modal(item: EmployeeTaxExemptionDetails, whicharea, idx) {
    // this.loadingScreenService.startLoading();
    // if (item != null && item.LstEmployeeExemptionBillDetails != null && item.LstEmployeeExemptionBillDetails.length > 0) {
    //   await item.LstEmployeeExemptionBillDetails.forEach(element => {
    //     if (element.BillId != null && element.BillId > 0) {
    //       var i = this.getSourceContent(element.BillId, element.FileName).then((result) => {
    //         console.log('res', result);
    //         element["Url"] = result;

    //       })
    //     } else {
    //       element["Url"] = null;
    //     }
    //     //this.getSourceContent(element.DocumentId, element.FileName);
    //   });
    // }


    // setTimeout(() => {
    this.documentItem = null;
    this.whicharea = whicharea;
    this._indexPosition = idx;
    this.documentItem = item;
    console.log('documentItem :', item);
    this._LstEmployeeExemptionBillDetails = null;
    if (item.LstEmployeeExemptionBillDetails.length > 0) {
      this._LstEmployeeExemptionBillDetails = item
     
      // this.loadingScreenService.stopLoading();
      //setTimeout(() => {
      if (whicharea == 'exemption') {
        $('#exemptionList_modal').modal('show');
      }
      else {
        alert('there are no records found!');
      }

      //  }, 2500);
      // }, 5000);

    }
  }
  saveExemptionBillchanges() {
    //var isexists : EmployeeTaxExemptionDetails = this.taxExemptionDetails.find(a=>a.Id == this._LstEmployeeExemptionBillDetails.Id);



    var isValid = true;
    var isexists = this.taxExemptionDetails.find(a => a.Id == this._LstEmployeeExemptionBillDetails.Id);
    if (isexists != undefined && isexists.LstEmployeeExemptionBillDetails != null && isexists.LstEmployeeExemptionBillDetails.length > 0) {

      for (let j = 0; j < isexists.LstEmployeeExemptionBillDetails.length; j++) {
        const element = isexists.LstEmployeeExemptionBillDetails[j];
        if (element.ApprovedAmount > element.BillAmount) {
          isValid = false;
          break;
        }

      }
    }

    if (isValid == false) {
      (this.alertService.showWarning('Please enter the valid amount and try again.'))
      return;
    }

    // if (isexists != undefined) {
    //   isexists.LstEmployeeExemptionBillDetails = this._LstEmployeeExemptionBillDetails.LstEmployeeExemptionBillDetails;
    // }
    // close the modal
    
    this.exemptionChangeHandler.emit(this.taxExemptionDetails);
    $('#exemptionList_modal').modal('hide');

  }
  closeExemptionListModel() {
    var isexists = this.taxExemptionDetails.find(a => a.Id == this._LstEmployeeExemptionBillDetails.Id);
    if (isexists != undefined) {
      this._LstEmployeeExemptionBillDetails.LstEmployeeExemptionBillDetails = isexists.LstEmployeeExemptionBillDetails;
    }
    $('#exemptionList_modal').modal('hide');
  }
  popupApproveRejectButton(actionprocess, item) {
    if (actionprocess) {
      if (item.ApprovedAmount > item.BillAmount) {
        (this.alertService.showWarning('Please enter the valid amount'))
        return;
        // $('#exemptionList_modal').modal('show');
      }
      else {
        item.Status = ApprovalStatus.Approved;
        item.Modetype = UIMode.Edit;
        item.ApprovedBy = this.UserId;
        item.ApprovedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
        item.RejectedBy = null;
        item.RejectedOn = null;
        item.RejectedRemarks = null;
        if (item.ApprovedAmount == 0) {
         
          item.ApprovedAmount = item.BillAmount
         
        
        }
        // item.LstEmployeeExemptionBillDetails.forEach(element => {
        //   element.Status = ApprovalStatus.Approved;
        // });
        this.alertService.showSuccess(`Approved successfully with Amount :${item.ApprovedAmount}`);
        return;
        // $('#exemptionList_modal').modal('show');
      }

    }
    else {
      if (item.Remarks == null || item.Remarks == '') {
        (this.alertService.showWarning('Please enter the rejection remarks.'))
        return;
        // $('#exemptionList_modal').modal('show');

      }
      else {
        item.Status = ApprovalStatus.Rejected;
        item.ApprovedAmount = 0;
        item.Modetype = UIMode.Edit;
        item.ApprovedBy = null;
        item.ApprovedOn = null;
        item.RejectedBy = this.UserId;
        item.RejectedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
        item.RejectedRemarks = item.Remarks;
        // item.LstEmployeeExemptionBillDetails.forEach(element => {
        //   element.Status = ApprovalStatus.Rejected;
        // });
        (this.alertService.showSuccess('Rejected successfully'))
        return;
        // $('#exemptionList_modal').modal('show');
      }
    }
    this.exemptionChangeHandler.emit(this.taxExemptionDetails);
    $('#exemptionList_modal').modal('show');
  }
  ApproveRejectButton(actionprocess, item) {
    if (actionprocess) {
      // if (item.Status == ApprovalStatus.Approved) {
      //   this.alertService.showSuccess(`The exemption was already approved.`);
      //   return;
      // }
      // item.Status = ApprovalStatus.Approved;
      item.ApprovedAmount = item.Amount
      item.Modetype = UIMode.Edit;

      let arrlist = item.LstEmployeeExemptionBillDetails
      arrlist.forEach(element => {
        element.Status = ApprovalStatus.Approved
        element.ApprovedAmount = element.BillAmount
        element.Modetype = UIMode.Edit;
        element.ApprovedBy = this.UserId;
        element.ApprovedOn  =  moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
        element.RejectedBy = null;
        element.RejectedRemarks = null;
        element.RejectedOn  =  null;
      });
      this.getCount(item.LstEmployeeExemptionBillDetails, 1);
      this.alertService.showSuccess(`Approved successfully with Amount :${item.Amount}`);
    }
    else {
      // if (item.Status == ApprovalStatus.Rejected) {
      //   this.alertService.showSuccess(`The exemption was already rejected.`);
      //   return;
      // }
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Rejection Remarks',
        animation: false,
        showCancelButton: true, // There won't be any cancel button
        input: 'textarea',
        // inputValue:  result.ApproverRemarks ,
        inputPlaceholder: 'Type your message here...',
        allowEscapeKey: false,
        inputAttributes: {
          autocorrect: 'off',
          autocapitalize: 'on',
          maxlength: '120',
          'aria-label': 'Type your message here',
        },
        allowOutsideClick: false,
        inputValidator: (value) => {
          if (value.length >= 120) {
            return 'Maximum 120 characters allowed.'
          }
          if (!value) {
            return 'You need to write something!'
          }
        },

      }).then((inputValue) => { 
        if (inputValue.value) {
          item.InputsRemarks = inputValue.value;
          item.ApprovedAmount = 0;
          item.Modetype = UIMode.Edit;
          item.LstEmployeeExemptionBillDetails.forEach(element => {
            element.Status = ApprovalStatus.Rejected
            element.ApprovedAmount = 0
            element.Modetype = UIMode.Edit;
            element.ApprovedBy = null;
            element.ApprovedOn  =  null;
            element.RejectedBy = this.UserId;
            element.RejectedOn  =  moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            element.RejectedRemarks = inputValue.value;
          });
          this.getCount(item.LstEmployeeExemptionBillDetails, 2);
          (this.alertService.showSuccess('Rejected successfully'))
        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });

      item.Status = ApprovalStatus.Rejected;

    }

    // actionprocess == true ? item.Status = ApprovalStatus.Approved : (item.Remarks == null || item.Remarks == '') ?
    //   (this.alertService.showWarning('Please ente the rejection remarks.')) : item.Status = ApprovalStatus.Rejected;

    this.exemptionChangeHandler.emit(this.taxExemptionDetails);
  }
  loadDocument(i) {
    if (i)
      this.url = "https://angular.io/api/router/RouterLink";
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  emptydoc(i) {
    console.log('i', i);

    this.alertService.showWarning("Preview is not available!");

  }


  viewDocs(item, whichdocs) {
    $('#exemptionList_modal').modal('hide');
    $("#popup_viewDocs1").modal('show');
    this.documentURL = null;
    this.documentURLId = null;
    this.documentURLId = item.BillId;
    var contentType = whichdocs != 'official' ? this.fileuploadService.getContentType(item.FileName) : 'application/pdf';
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.fileuploadService.getObjectById(item.BillId)
        .subscribe(dataRes => {

          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
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
            this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);

          }
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      var appUrl = this.fileuploadService.getUrlToGetObject(item.BillId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }
  }

  modal_dismiss_docs() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs1").modal('hide');
    $('#exemptionList_modal').modal('show');
    this.openDocumentAttention_modal(this.documentItem, this.whicharea, this._indexPosition);
  }


  // var i =  this.getSourceContent(billId, fileName).then((result) => {
  //         console.log('res', result);
  //         this.url = "www.clickdimensions.com/links/TestPDFfile.pdf";
  //        })
  //  this.url = "www.clickdimensions.com/links/TestPDFfile.pdf";
  //}

}




