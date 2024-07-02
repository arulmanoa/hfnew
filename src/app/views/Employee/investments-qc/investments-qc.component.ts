import { Component, OnInit, HostListener, Output } from '@angular/core';
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
import { Lightbox } from 'ngx-lightbox';
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
import { sample } from 'lodash';
import { InvestmentInfo } from 'src/app/_services/model/Employee/EmployeeExcemptions';

@Component({
  selector: 'app-investments-qc',
  templateUrl: './investments-qc.component.html',
  styleUrls: ['./investments-qc.component.css']
})
export class InvestmentsQcComponent implements OnInit {
  taxExemptionStatusDetails: any
  _loginSessionDetails: LoginResponses;
  spinner: boolean = true;
  RoleId: any;
  UserId: any;
  url = "www.clickdimensions.com/links/TestPDFfile.pdf"
  CompanyId: any;
  UserName: any;
  newEmployeeDetails: EmployeeDetails = new EmployeeDetails();
  lstlookUpDetails: any;

  ApprovalStatusEnumValues: typeof
    ApprovalStatus = ApprovalStatus;
  documentItem: any;
  documentItem1: any;
  contentmodalurl: any;
  isExceed: boolean = false;
  Id: any;
  OverallRemarks: any;
  ApprovedAmount: any = 0;

  employeeModel: EmployeeModel = new EmployeeModel();
  workFlowDtls: WorkFlowInitiation = new WorkFlowInitiation;
  whicharea: any;

  LstemployeeHouseRentDetails = [];
  LstEmployeeHousePropertyDetails = [];
  _taxExemptionDetails = []
  isPreviousEmploymentAvailable: boolean = false;
  InvestmetnListGrp: InvestmentInfo;
  FinId: any;

  constructor(
    private onboardingApi: OnboardingService,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
    private workflowApi: WorkflowService,
    public loadingScreenService: LoadingScreenService,
    private _location: Location,
    private alertService: AlertService,
    private router: Router,
    public sessionService: SessionStorage,
    private fileuploadService: FileUploadService,
    private _lightbox: Lightbox,
    private route: ActivatedRoute,
    private employeeService: EmployeeService) {

    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });

  }
  ngOnInit() {
    
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


    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.UserName = this._loginSessionDetails.UserSession.PersonName;
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.EmployeeLookupDetailsByEmpId().then((r) => {
      this._loadEmpUILookUpDetails().then((result) => {
        this.getEmployeeDetails();
      });
    })

    this._taxExemptionDetails = [];
  }
  EmployeeLookupDetailsByEmpId() {
    const promise = new Promise((resolve, reject) => {

      this.employeeService
        .EmployeeLookUpDetailsByEmployeeId(this.Id).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            var lookupObject = JSON.parse(apiR.Result) as any;
            console.log('lookup', lookupObject);
            this.InvestmetnListGrp = lookupObject;
            this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 && (this.FinId = this.InvestmetnListGrp.FinancialDetails[0].Id);
            
            resolve(true);

          } else {
            resolve(false);
            // this.alertService.showWarning(`An error occurred while getting employee details`);
            return;
          }
        }, err => {
          resolve(false);
        })
    })
    return promise;

  }
  getEmployeeDetails() {

    // 
    this.employeeService.getEmployeeDetailsById(this.Id).subscribe((result) => {
      let apiResult: apiResult = (result);
      this.newEmployeeDetails = result.Result;
      this.newEmployeeDetails.ELCTransactions = null;
      this.newEmployeeDetails.EmpFamilyDtls = null;
      this.newEmployeeDetails.LstEmployeeLetterTransactions = null;
      this.newEmployeeDetails.lstEmployeeBankDetails = null;
      this.newEmployeeDetails.Qualifications = null;
      this.newEmployeeDetails.WorkExperiences = null;
      if (this.newEmployeeDetails.LstemploymentDetails != null && this.newEmployeeDetails.LstemploymentDetails.length > 0) {
        this.newEmployeeDetails.LstemploymentDetails = this.newEmployeeDetails.LstemploymentDetails != null && this.newEmployeeDetails.LstemploymentDetails.length > 0 &&
          this.newEmployeeDetails.LstemploymentDetails.filter(z => z.FinancialYearId == this.FinId);
        this.isPreviousEmploymentAvailable = (this.newEmployeeDetails.LstemploymentDetails != null && this.newEmployeeDetails.LstemploymentDetails.length > 0 && this.newEmployeeDetails.LstemploymentDetails.filter(a => a.IsProposed == false).length > 0 ? true : false);
      }


      this.employeeModel.oldobj = Object.assign({}, result.Result);
      console.log('EMPLOYEE DETAILS ::', this.newEmployeeDetails);
      if (this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0) {
        // let lastIndex = this.newEmployeeDetails.LstemployeeHouseRentDetails.length - 1;
        (this.LstemployeeHouseRentDetails = (this.newEmployeeDetails.LstemployeeHouseRentDetails) as any);
      }
      this.OverallRemarks = this.newEmployeeDetails.EmployeeInvestmentMaster.Remarks;
      console.log('LstemployeeHouseRentDetails', this.LstemployeeHouseRentDetails);
      console.log('LstemployeeHouseRentDetails', this.LstemployeeHouseRentDetails);
      this._taxExemptionDetails = this.newEmployeeDetails.LstEmployeeTaxExemptionDetails != null && this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.length > 0 ?
       this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.filter(a=>a.FinancialYearId == this.FinId) : []; 
      this.spinner = false;
    });

  }

  _loadEmpUILookUpDetails() {

    return new Promise((res, rej) => {
      this.employeeService.get_LoadEmployeeUILookUpDetails(this.Id)
        .subscribe((result) => {
          let apiResponse: apiResponse = result;
          if (apiResponse.Status) {
            this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
            console.log('EMPLOYEE LOOKUP DETAILS :: ', this.lstlookUpDetails);

            res(true);
          }

        }, err => {
          rej();
        })
    });
  }
  getProductName(ProductId) {

    var string = this.lstlookUpDetails.InvesmentProductList.find(a => a.ProductId == ProductId).ProductName.replace(/([A-Z])/g, ' $1').trim();
    string = _.startCase(string);
    return string;

  }
  openExemption_model(item, category) {
    $('#exemptionList_modal').modal('hide');
    this.loadingScreenService.startLoading();
    if (item != null && item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0) {
      item.LstEmployeeInvestmentDocuments.forEach(element => {
        if (element.hasOwnProperty('Url') == true && (element.Url == null || element.Url == undefined || element.Url == '')) {
          var i = this.getSourceContent(element.DocumentId, element.FileName).then((result) => {
            console.log('res', result);
            element["Url"] = result;

          })
        }
      });
    }
    setTimeout(() => {
      this.whicharea = category;
      this.documentItem = item;

      console.log('documentItem :', item);
      this.loadingScreenService.stopLoading();
      // setTimeout(() => {
      $('#exemptionItem_modal').modal('show');
    }, 2500);

  }
  openPreviousEmpDocModal(item, whicharea) {
    this.loadingScreenService.startLoading();
    this.documentItem1 = item;
    var i = this.getSourceContent(item.DocumentId, item.FileName).then((result) => {

      item["Url"] = result;
    })
    this.whicharea = whicharea;
    console.log('docs', this.documentItem1);
    setTimeout(() => {
      this.loadingScreenService.stopLoading();
      $('#documentItem_prevEmp_modal').modal('show');
    }, 2500);
  }

  async openDocumentAttention_modal(item, whicharea) {
    this.loadingScreenService.startLoading();
    if (item != null && item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0) {
      await item.LstEmployeeInvestmentDocuments.forEach(element => {
        var i = this.getSourceContent(element.DocumentId, element.FileName).then((result) => {
          console.log('res', result);

          element["Url"] = result;
        })
        //this.getSourceContent(element.DocumentId, element.FileName);
      });
    }


    setTimeout(() => {

      this.whicharea = whicharea;
      this.documentItem = item;

      if (whicharea == 'HRA') {
        // this.documentItem.ApprovedAmount = 0;
        // this.documentItem.Amount = this.getRentAmount();
        this.documentItem.Amount = item.RentAmount;
        // this.documentItem.ApprovedAmount = this.getRentApprovedAmount();
        // this.documentItem.LstEmployeeInvestmentDocuments
        // this.documentItem.LstEmployeeInvestmentDocuments.forEach(ee => {
        //   ee.Amount = this.documentItem.Amount;
        // });
      }

      console.log('documentItem :', item);

      this.loadingScreenService.stopLoading();
      // setTimeout(() => {


      if (whicharea == 'exemption') {
        $('#exemptionList_modal').modal('show');
      }
      else {
        $('#documentItem_modal').modal('show');
      }
    }, 2500);
    // }, 5000);

  }
  getfullAmount(amount) {
    return (Number(amount) * 12)
  }
  getUrl(post) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(post.Url);
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

  getCount(list, status) {
    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;

  }
  confirmExit1() {
    $('#documentItem_prevEmp_modal').modal('hide');
    this.documentItem1 = null;
  }
  confirmExit() {
    $('#documentItem_modal').modal('hide');
    this.documentItem = null;
  }
  closeExemptionItemModel() {
    $('#exemptionItem_modal').modal('hide');
  }
  close() {
    this.router.navigateByUrl("app/onboardingqc/investment_qc");
  }

  getMyPropertyAmount(parentite, ite) {
    console.log('parent', parentite);
    // console.log('ite', ite);

    if (ite.ApprovedAmount == null || ite.ApprovedAmount == 0) {
      var dividedValue = (this.whicharea == 'HRA' ? Number(ite.RentAmount) : Number(ite.Amount)) / parentite.LstEmployeeInvestmentDocuments.length;
      parentite.LstEmployeeInvestmentDocuments.forEach(e => {
        e.ApprovedAmount = Number(dividedValue)
      });
      return dividedValue;
    }
    else {
      return ite.ApprovedAmount;
    }
  }
  onChangeApprovedAmount(event, ite) {
    console.log('event', ite);
    if(this.whicharea == 'HRA'){
      this.documentItem.ApprovedAmount = Number(event.target.value);
    }
    // this.documentItem.ApprovedAmount = Number(event.target.value);

  }
 
  validateDocument_approve(actionprocess, ite) {
    ite.Modetype = UIMode.Edit;
    if (actionprocess == true) {
      ite.ApprovalStatus = ApprovalStatus.Approved;

      (this.documentItem1.ApprovedStandardDeduction == 0 || this.documentItem1.ApprovedStandardDeduction == null) ?  this.documentItem1.ApprovedStandardDeduction = this.documentItem1.StandardDeduction : true;
      (this.documentItem1.ApprovedTaxDeducted == 0  || this.documentItem1.ApprovedTaxDeducted == null )?  this.documentItem1.ApprovedTaxDeducted = this.documentItem1.TaxDeducted : true;
      (this.documentItem1.ApprovedPreviousPF == 0 || this.documentItem1.ApprovedPreviousPF == null) ? this.documentItem1.ApprovedPreviousPF = this.documentItem1.PreviousPF : true;
      (this.documentItem1.ApprovedPreviousPT == 0 || this.documentItem1.ApprovedPreviousPT == null)?  this.documentItem1.ApprovedPreviousPT = this.documentItem1.PreviousPT : true;
      (this.documentItem1.ApprovedGrossSalary ==0 || this.documentItem1.ApprovedGrossSalary == null) ?  this.documentItem1.ApprovedGrossSalary = this.documentItem1.GrossSalary : true;
    }
    else if (actionprocess == false) {
      if ((ite.ApproverRemarks == null || ite.ApproverRemarks == '')) {
        (this.alertService.showWarning('Please enter the rejection remarks.'));
        $('#documentItem_prevEmp_modal').modal('show');
        return;
      }

      ite.ApprovalStatus = ApprovalStatus.Rejected;
      this.documentItem1.ApprovedStandardDeduction = 0;
      this.documentItem1.ApprovedTaxDeducted = 0;
      this.documentItem1.ApprovedPreviousPF = 0;
      this.documentItem1.ApprovedPreviousPT = 0;
      this.documentItem1.ApprovedGrossSalary = 0;
    }

    // actionprocess == true ? ite.ApprovalStatus = ApprovalStatus.Approved : (ite.ApproverRemarks == null || ite.ApproverRemarks == '') ?
    //   (this.alertService.showWarning('Please ente the rejection remarks.')) : ite.ApprovalStatus = ApprovalStatus.Rejected;
  }
  validateDocument(actionprocess, ite, isFirst, index) {
    // if (this.ApprovedAmount == null || this.ApprovedAmount == '' || this.ApprovedAmount == undefined) {
    //   (this.alertService.showWarning('Please ente the approved amount.'))
    //   return;
    // }
    console.log('ite', ite);

    if (actionprocess == true && this.whicharea == 'HouseProperty') {
      ite.Status = ApprovalStatus.Approved;

  
      if (isFirst) {
        this.documentItem.PreConstructionInterestApprovedAmount == 0 ? this.documentItem.PreConstructionInterestApprovedAmount = this.documentItem.PreConstructionInterestAmount : true;
        this.documentItem.MunicipalTaxApprovedAmount == 0 ? this.documentItem.MunicipalTaxApprovedAmount = this.documentItem.MunicipalTax : true;
        this.documentItem.InterestAmountApprovedAmount == 0 ? this.documentItem.InterestAmountApprovedAmount = this.documentItem.InterestAmount : true;
        this.documentItem.GrossAnnualValueApprovedAmount == 0 ? this.documentItem.GrossAnnualValueApprovedAmount = this.documentItem.GrossAnnualValue : true;
        this.documentItem.ApprovedAmount == 0 ? this.documentItem.ApprovedAmount = this.documentItem.Amount : true;
        this.documentItem.ApprovedAmount == 0 ?  this.documentItem['QcDisplayAmount'] = this.documentItem.Amount : true;

  
      }


    }
    else if (actionprocess == false && this.whicharea == 'HouseProperty') {
      if ((ite.Remarks == null || ite.Remarks == '')) {
        (this.alertService.showWarning('Please enter the rejection remarks.'));
        return;
      }
      ite.Status = ApprovalStatus.Rejected;
      this.documentItem.PreConstructionInterestApprovedAmount = 0;
      this.documentItem.MunicipalTaxApprovedAmount = 0;
      this.documentItem.InterestAmountApprovedAmount = 0;
      this.documentItem.GrossAnnualValueApprovedAmount = 0;
      this.documentItem.ApprovedAmount = 0;
    }
    else if (actionprocess == true && this.whicharea == 'HRA') {
      ite.Status = ApprovalStatus.Approved;
      // this.documentItem.ApprovedAmount == 0 ? this.documentItem.ApprovedAmount = this.documentItem.RentAmount : true;
      // ite.ApprovedAmount == 0 ? ite.ApprovedAmount = this.documentItem.RentAmount * 12 : true;

      if (isFirst) {
        this.documentItem.ApprovedAmount == 0 ? this.documentItem.ApprovedAmount = this.documentItem.RentAmount : true;
        // ite.ApprovedAmount == 0 ? ite.ApprovedAmount = Number(this.documentItem.RentAmount) * 12 : true; 
        ite.ApprovedAmount == 0 ? ite.ApprovedAmount = Number(this.documentItem.RentAmount) : true;  

       this.documentItem.ApprovedAmount > 0 ? this.documentItem.ApprovedAmount = ite.ApprovedAmount : true;
       ite.ApprovedAmount > 0 ? ite.ApprovedAmount = Number(ite.ApprovedAmount) : true;
       this.documentItem['QcDisplayAmount'] = ite.ApprovedAmount 
      
      }

      // if (isFirst && ite.ApprovedAmount > 0) {
      //   this.documentItem.ApprovedAmount = this.documentItem.ApprovedAmount;
      // }

    }
    else if (actionprocess == false && this.whicharea == 'HRA') {
      if ((ite.Remarks == null || ite.Remarks == '')) {
        (this.alertService.showWarning('Please enter the rejection remarks.'));
        return;
      }

      ite.Status = ApprovalStatus.Rejected;
      this.documentItem.ApprovedAmount = 0;
      ite.ApprovedAmount = 0;

      if (isFirst) {
        this.documentItem['QcDisplayAmount'] = 0
      }  
    }
    else if (actionprocess == true && this.whicharea == 'Investment') {
      ite.Status = ApprovalStatus.Approved;
      
      this.documentItem.ApprovedAmount == 0 ? this.documentItem.ApprovedAmount = this.documentItem.Amount : true;
      ite.ApprovedAmount == 0 ? ite.ApprovedAmount = this.documentItem.Amount : true;
      if (isFirst) {
      this.documentItem['QcDisplayAmount'] = ite.ApprovedAmount
      }
      
      //this.documentItem.ApprovedAmount == 0 ? this.documentItem.ApprovedAmount = this.documentItem.Amount : true;
      
      if (ite.ApprovedAmount > 0) {
      this.documentItem.ApprovedAmount = ite.ApprovedAmount;
      }
      
      
      }
      else if (actionprocess == false && this.whicharea == 'Investment') {
      if ((ite.Remarks == null || ite.Remarks == '')) {
      (this.alertService.showWarning('Please enter the rejection remarks.'));
      return;
      }
      ite.Status = ApprovalStatus.Rejected;
      if (isFirst) {
      this.documentItem['QcDisplayAmount'] = 0
      }
      
      ite.ApprovedAmount = 0;
      this.documentItem.ApprovedAmount = 0;
      }
    console.log(' this.documentItem', this.documentItem);
    // actionprocess == true ? ite.Status = ApprovalStatus.Approved : (ite.Remarks == null || ite.Remarks == '') ?
    //   (this.alertService.showWarning('Please ente the rejection remarks.')) : ite.Status = ApprovalStatus.Rejected;
  }
  validateExemptionDocument(actionprocess, ite) {
    // if (this.ApprovedAmount == null || this.ApprovedAmount == '' || this.ApprovedAmount == undefined) {
    //   (this.alertService.showWarning('Please ente the approved amount.'))
    //   return;
    // }

    actionprocess == true ? ite.Status = ApprovalStatus.Approved : (ite.Remarks == null || ite.Remarks == '') ?
      (this.alertService.showWarning('Please enter the rejection remarks.')) : ite.Status = ApprovalStatus.Rejected;
  }
  saveChangesOfPreviousDocs() {

    if (this.documentItem1.ApprovedGrossSalary > this.documentItem1.GrossSalary) {
      this.alertService.showWarning(`Approved Gross Salary must be less than or equal to ${this.documentItem1.GrossSalary}`);
      return;
    }
    else if (this.documentItem1.ApprovedPreviousPT > this.documentItem1.PreviousPT) {
      this.alertService.showWarning(`Approved Previous PT must be less than or equal to ${this.documentItem1.PreviousPT}`);
      return;
    }
    else if (this.documentItem1.ApprovedPreviousPF > this.documentItem1.PreviousPF) {
      this.alertService.showWarning(`Approved Previous PF must be less than or equal to ${this.documentItem1.PreviousPF}`);
      return;
    }
    else if (this.documentItem1.ApprovedTaxDeducted > this.documentItem1.TaxDeducted) {
      this.alertService.showWarning(`Approved Tax Deducted must be less than or equal to ${this.documentItem1.TaxDeducted}`);
      return;
    }
    else if (this.documentItem1.ApprovedStandardDeduction > this.documentItem1.StandardDeduction) {
      this.alertService.showWarning(`Approved Standard Deduction must be less than or equal to ${this.documentItem1.StandardDeduction}`);
      return;
    } else {
      this.documentItem1 = null;
      $('#documentItem_prevEmp_modal').modal('hide');
    }
    console.log('ss');


  }

  saveDocumentChanges() {
    var sum = 0;
    this.isExceed = false;


    if (this.whicharea == 'HRA') {
      // this.LstemployeeHouseRentDetails[0].ApprovedAmount = this.documentItem.ApprovedAmount;
      // this.LstemployeeHouseRentDetails.forEach(el => {
      //   el.LstEmployeeInvestmentDocuments
      // });
      let isum = 0
      console.log(this.documentItem);
      
      // this.documentItem.LstEmployeeInvestmentDocuments.forEach(e => { if (e.Status == 1) { isum += parseInt(e.ApprovedAmount) } })
      // this.documentItem.ApprovedAmount = isum;
      this.documentItem.Amount < this.documentItem.ApprovedAmount ? this.isExceed = true : this.isExceed = false;
      
      // this.documentItem.ApproverRemarks = this.documentItem.LstEmployeeInvestmentDocuments[0].Remarks;
      // this.LstemployeeHouseRentDetails[0].ApprovedAmount = (this.documentItem.ApprovedAmount / 12);
      console.log('HRA :', this.LstemployeeHouseRentDetails);
      // this.documentItem['QcDisplayAmount'] = this.documentItem.ApprovedAmount * 12; 


      this.documentItem['QcDisplayAmount'] = this.documentItem.ApprovedAmount; 


      console.log('this.documentItem', this.documentItem);


    }
    else if (this.whicharea == 'Investment') {
      if (this.documentItem && this.documentItem.LstEmployeeInvestmentDocuments != null && this.documentItem.LstEmployeeInvestmentDocuments.length > 0) {
        if (this.documentItem && this.documentItem.LstEmployeeInvestmentDocuments != null && this.documentItem.LstEmployeeInvestmentDocuments.length > 0 && this.documentItem.LstEmployeeInvestmentDocuments[0].Status == 1)
          sum = this.documentItem.LstEmployeeInvestmentDocuments[0].ApprovedAmount
      }
      //  this.documentItem.LstEmployeeInvestmentDocuments.forEach(e => { if (e.Status == 1) { sum += parseInt(e.ApprovedAmount) } })

      this.documentItem.ApprovedAmount = sum;
      this.documentItem.Amount < this.documentItem.ApprovedAmount ? this.isExceed = true : this.isExceed = false;
      this.documentItem.ApproverRemarks = this.documentItem.LstEmployeeInvestmentDocuments[0].Remarks;

    }
    else if (this.whicharea == "HouseProperty") {
      this.documentItem.LstEmployeeInvestmentDocuments.forEach(e => { if (e.Status == 1) { sum += parseInt(e.ApprovedAmount) } })
      // this.documentItem.GrossAnnualValueApprovedAmount = sum;
      // this.documentItem.GrossAnnualValue < this.documentItem.GrossAnnualValueApprovedAmount ? this.isExceed = true : this.isExceed = false;
      this.documentItem.ApproverRemarks = this.documentItem.LstEmployeeInvestmentDocuments[0].Remarks;
      if (this.documentItem.LetOut == true && (this.documentItem.GrossAnnualValueApprovedAmount > this.documentItem.GrossAnnualValue ||
        this.documentItem.InterestAmountApprovedAmount > this.documentItem.InterestAmount ||
        this.documentItem.PreConstructionInterestApprovedAmount > this.documentItem.PreConstructionInterestAmount
      )) {
        this.alertService.showWarning('Please check your apprved amount');
        return;
      } else if (this.documentItem.LetOut == false && (this.documentItem.GrossAnnualValueApprovedAmount > this.documentItem.GrossAnnualValue ||
        this.documentItem.InterestAmountApprovedAmount > this.documentItem.InterestAmount || this.documentItem.MunicipalTaxApprovedAmount > this.documentItem.MunicipalTax ||
        this.documentItem.PreConstructionInterestApprovedAmount > this.documentItem.PreConstructionInterestAmount
      )) {
        this.alertService.showWarning('Please check your apprved amount');
        return;
      }
    }


    if (this.isExceed && this.whicharea != "HouseProperty") {
      this.alertService.showWarning('Please check your approved amount');
      return;
    }

    this.documentItem = null;
    $('#documentItem_modal').modal('hide');
  }

  isValidSubmission() {

    // arrayOfElements.map((element) => {
    //   return {...element, subElements: element.subElements.filter((subElement) => subElement.surname === 1)}
    // })

    if (this.newEmployeeDetails.LstemployeeInvestmentDeductions != null && this.newEmployeeDetails.LstemployeeInvestmentDeductions.length > 0) {
      let filteredArray = this.newEmployeeDetails.LstemployeeInvestmentDeductions.filter((element) => element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0 && element.LstEmployeeInvestmentDocuments.some((subElement) => subElement.Status === 0));
      if (filteredArray.length > 0) {
        this.alertService.showWarning('Please validate Investment Proof before submitting');
        return false;
      }
      return true;
    }



  }

  isvalidExemptionSubmission() {
    if (this.newEmployeeDetails.LstEmployeeTaxExemptionDetails != null && this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.length > 0) {
      let filteredArray = this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.filter((element) => element.FinancialYearId == this.FinId && element.LstEmployeeExemptionBillDetails != null && element.LstEmployeeExemptionBillDetails.length > 0 &&  element.LstEmployeeExemptionBillDetails.some((subElement) => subElement.Status === 0));
      if (filteredArray.length > 0) {
        this.alertService.showWarning('Please validate Exemption Proof before submitting');
        return false;
      }
      return true;
    }
    return true;
  }

  exemptionChangeHandler(event: any) {


    event != null && event.length > 0 && event.forEach(eee => {
      var totalAmount = 0;
      eee.LstEmployeeExemptionBillDetails != null && eee.LstEmployeeExemptionBillDetails.length > 0 && eee.LstEmployeeExemptionBillDetails.forEach(obj => {
        totalAmount = Number(totalAmount) + Number(obj.ApprovedAmount);
      });
      eee.ApprovedAmount = totalAmount;
    });
    // event[0].LstEmployeeExemptionBillDetails != null && event[0].LstEmployeeExemptionBillDetails.length > 0 && event[0].LstEmployeeExemptionBillDetails.forEach(obj => {


    //   // totalAmount += obj.ApprovedAmount; 
    // });
    // event[0].ApprovedAmount = totalAmount;
    this.taxExemptionStatusDetails = event
    console.log("exemptionChangeHandler", event)

    // this.isBtnDisabledRequired = true;
    // if (this.code == 'taxComputationList' || this.code == 'paysheetList') {
    //   this.loadingScreenService.startLoading();
    //   this.code == 'taxComputationList' ? this.callExternalAPI() : this.callExternalAPI_PaySheet()
    //   return;

  }

  updateCandidateQCInfo(isSubmit: boolean, isFinallyApproved: boolean) {
    //console.log(this.objCandidateQualityCheckModel);
    //return;   
    console.log("EMPM DET : ", this.newEmployeeDetails.LstemploymentDetails)



    this.newEmployeeDetails.LstEmployeeTaxExemptionDetails = (this.taxExemptionStatusDetails == undefined || this.taxExemptionStatusDetails == null) ? this.newEmployeeDetails.LstEmployeeTaxExemptionDetails : this.taxExemptionStatusDetails

    // if (isSubmit && !this.isValidSubmission()) {
    //   return;
    // }

    if (isSubmit) {
      if (this.isPreviousEmploymentAvailable && this.newEmployeeDetails.LstemploymentDetails != null && this.newEmployeeDetails.LstemploymentDetails.length > 0) {
        let filteredArray = this.newEmployeeDetails.LstemploymentDetails.filter((element) => element.IsProposed == false && element.FinancialYearId == this.FinId && element.ApprovalStatus === 0);
        if (filteredArray.length > 0) {
          this.alertService.showWarning('Please validate previous employment Proof before submitting');
          return;
        }

      }
    }


    if (isSubmit) {
      if (this.newEmployeeDetails.LstemployeeInvestmentDeductions != null && this.newEmployeeDetails.LstemployeeInvestmentDeductions.length > 0) {
        let filteredArray = this.newEmployeeDetails.LstemployeeInvestmentDeductions.filter((element) => element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0 && element.LstEmployeeInvestmentDocuments.some((subElement) => subElement.Status === 0));
        if (filteredArray.length > 0) {
          this.alertService.showWarning('Please validate Investment Proof before submitting');
          return false;
        }
      }
    }


    if (isSubmit) {
      if (this.newEmployeeDetails.LstEmployeeTaxExemptionDetails != null && this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.length > 0) {
        let filteredArray = this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.filter((element) => element.FinancialYearId == this.FinId && element.IsProposed == false && element.LstEmployeeExemptionBillDetails != null && element.LstEmployeeExemptionBillDetails.length > 0 && element.LstEmployeeExemptionBillDetails.some((subElement) => subElement.Status === 0));
        if (filteredArray.length > 0) {
          this.alertService.showWarning('Please validate Exemption Proof before submitting');
          return;
        }

      }
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

    this.alertService.confirmSwal("Are you sure?", isSubmit ? ('Are you sure you want to ' + (isFinallyApproved ? 'Approve' : 'Reject') + ' this request?') : 'Are you sure you want to save the details you entered?', "Yes, Proceed").then(result => {
      this.loadingScreenService.startLoading();

      // this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0 && this.newEmployeeDetails.LstemployeeHouseRentDetails.forEach(emt => {
      //   emt.RentAmount = Math.floor(this.LstemployeeHouseRentDetails[0].Amount / 12);
      //   emt.ApprovedAmount = Math.floor(this.LstemployeeHouseRentDetails[0].ApprovedAmount / 12);
      //   emt.Modetype = UIMode.Edit;
      // });

      if (this.newEmployeeDetails.LstemployeeInvestmentDeductions != null && this.newEmployeeDetails.LstemployeeInvestmentDeductions.length > 0) {
        this.newEmployeeDetails.LstemployeeInvestmentDeductions.forEach(e => {
          (e.LstEmployeeInvestmentDocuments != null && e.LstEmployeeInvestmentDocuments.length > 0 &&
            e.LstEmployeeInvestmentDocuments.forEach(el => { el.hasOwnProperty('Url') == true ? el.Url = null : true }));

        });
      }

      if (this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0) {
        this.newEmployeeDetails.LstemployeeHouseRentDetails.forEach(e => {
          (e.LstEmployeeInvestmentDocuments != null && e.LstEmployeeInvestmentDocuments.length > 0 &&
            e.LstEmployeeInvestmentDocuments.forEach(el => { el.hasOwnProperty('Url') == true ? el.Url = null : true }));

        });
      }
      if (this.newEmployeeDetails.LstEmployeeHousePropertyDetails != null && this.newEmployeeDetails.LstEmployeeHousePropertyDetails.length > 0) {
        this.newEmployeeDetails.LstEmployeeHousePropertyDetails.forEach(e => {
          (e.LstEmployeeInvestmentDocuments != null && e.LstEmployeeInvestmentDocuments.length > 0 &&
            e.LstEmployeeInvestmentDocuments.forEach(el => { el.hasOwnProperty('Url') == true ? el.Url = null : true }));

        });
      }

      console.log('this.LstemployeeHouseRentDetails[0].ApprovedAmount', this.LstemployeeHouseRentDetails[0]);

      // if (this.LstemployeeHouseRentDetails != null && this.LstemployeeHouseRentDetails.length > 0) {
      //   var amtt = (this.LstemployeeHouseRentDetails[0].RentAmount);
      //   //var amtt1 = Math.floor(this.LstemployeeHouseRentDetails[0].ApprovedAmount / 12)
      //   var amtt1 = (this.LstemployeeHouseRentDetails[0].ApprovedAmount) as any;

      // }

      this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0 && this.newEmployeeDetails.LstemployeeHouseRentDetails.forEach(emt => {
        // emt.RentAmount = amtt;
        // emt.ApprovedAmount = Math.round(amtt1);
        emt.Modetype = UIMode.Edit;
      });



      this.newEmployeeDetails.LstemployeeInvestmentDeductions != null && this.newEmployeeDetails.LstemployeeInvestmentDeductions.length > 0 && this.newEmployeeDetails.LstemployeeInvestmentDeductions.forEach(emt => {

        emt.Modetype = UIMode.Edit;
      });

      this.newEmployeeDetails.LstEmployeeHousePropertyDetails != null && this.newEmployeeDetails.LstEmployeeHousePropertyDetails.length > 0 && this.newEmployeeDetails.LstEmployeeHousePropertyDetails.forEach(emt => {

        emt.Modetype = UIMode.Edit;
      });


      // this.taxExemptionStatusDetails != null && this.taxExemptionStatusDetails.length > 0 && this.taxExemptionStatusDetails.forEach(emt => {

      //   emt.Modetype = UIMode.Edit;
      // });

      this.newEmployeeDetails.LstEmployeeTaxExemptionDetails != null && this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.length > 0 && this.newEmployeeDetails.LstEmployeeTaxExemptionDetails.forEach(emt => {
        emt.Status = 1;
        emt.Modetype = UIMode.Edit;
      });

      isSubmit && (this.newEmployeeDetails.EmployeeInvestmentMaster.Status = isFinallyApproved ? ApprovalStatus.Approved : ApprovalStatus.Rejected)
      this.newEmployeeDetails.EmployeeInvestmentMaster.Remarks = this.OverallRemarks;
      this.newEmployeeDetails.Modetype = UIMode.Edit;
      this.newEmployeeDetails.ELCTransactions = null;
      this.newEmployeeDetails.EmpFamilyDtls = null;
      this.newEmployeeDetails.LstEmployeeLetterTransactions = null;
      this.newEmployeeDetails.lstEmployeeBankDetails = null;
      this.newEmployeeDetails.Qualifications = null;
      this.newEmployeeDetails.WorkExperiences = null;
      this.newEmployeeDetails.Aadhaar = (this.newEmployeeDetails.Aadhaar as any) == 'NULL' ? null : this.newEmployeeDetails.Aadhaar;

      // 
      this.employeeModel.newobj = this.newEmployeeDetails;
      console.log('PUT EMP REQ ::', this.newEmployeeDetails);
      var Employee_request_param = JSON.stringify(this.employeeModel);
      // this.loadingScreenService.stopLoading();

      // return;

      this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
        console.log(data);
        if (!isSubmit) {
          this.alertService.showSuccess('This Investment request is saved successfully');
          this.loadingScreenService.stopLoading();
          this.router.navigateByUrl("app/onboardingqc/investment_qc");

          //navigate to claimed requests
        }
        else {

          if (data.Status) {
            this.alertService.showSuccess(data.Message);
            var accessControl_submit = {
              AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
                : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
              ViewValue: null
            };
            this.workFlowDtls.Remarks = this.OverallRemarks;
            this.workFlowDtls.EntityId = data.dynamicObject.newobj.EmployeeInvestmentMaster.Id; this.Id;
            this.workFlowDtls.EntityType = EntityType.EmployeeInvestmentMaster;
            this.workFlowDtls.CompanyId = this.CompanyId;
            this.workFlowDtls.ClientContractId = this.newEmployeeDetails.EmploymentContracts[0].ClientContractId;
            this.workFlowDtls.ClientId = this.newEmployeeDetails.EmploymentContracts[0].ClientId;
            this.workFlowDtls.ActionProcessingStatus = 29500;
            this.workFlowDtls.ImplementationCompanyId = 0;
            this.workFlowDtls.WorkFlowAction = isFinallyApproved ? 29 : 38;
            this.workFlowDtls.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
            this.workFlowDtls.DependentObject = data.dynamicObject.newobj;
            this.workFlowDtls.UserInterfaceControlLst = accessControl_submit;
            console.log('workFlowDtls', this.workFlowDtls);
            
            this.employeeService.post_InvestmentWorkFlow(JSON.stringify(this.workFlowDtls)).subscribe((response) => {

              if (response != null && response != undefined && !response.Status) {
                this.alertService.showInfo(response != null && response != undefined ? response.Message : 'Data saved but unable to submit, please contact support team');
                this.loadingScreenService.stopLoading();
                return;
              }
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess('Response submitted successfully');
              this.router.navigateByUrl("app/onboardingqc/investment_qc");

            }), ((error) => {

            });
          }


          else {
            this.alertService.showWarning(data.Message);
          }
        }
      },
        (err) => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);
        });





    })
      .catch(error => this.loadingScreenService.stopLoading());


  }

  getRentAmount() {
    var sum = 0;
    this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0 &&
      this.newEmployeeDetails.LstemployeeHouseRentDetails.forEach(e => { sum += Number(e.RentAmount) });
    return sum;

    // var sum = 0;
    // this.LstemployeeHouseRentDetails != null && this.LstemployeeHouseRentDetails.length > 0 &&
    //   this.LstemployeeHouseRentDetails.forEach(e => { sum += (e.RentAmount) });
    // return sum;
  }
  getRentApprovedAmount() {
    var sum = 0;
    let amtt1 = 0;
    amtt1 = (this.LstemployeeHouseRentDetails[0].ApprovedAmount * 12) as any;
    this.newEmployeeDetails.LstemployeeHouseRentDetails != null && this.newEmployeeDetails.LstemployeeHouseRentDetails.length > 0 &&
      this.newEmployeeDetails.LstemployeeHouseRentDetails.forEach(e => { sum += (e.ApprovedAmount) });
    // console.log('APPROVED AMT : ', amtt1);

    return (amtt1);

  }
  closeExemptionListModel() {
    $('#exemptionList_modal').modal('hide');
  }



  downloadDocs(item, whichdocs) {
    this.loadingScreenService.startLoading();
    this.objectApi.downloadObjectAsBlob(item.SummaryDocumentId)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          this.loadingScreenService.stopLoading();
          return;
        }
        saveAs(res, whichdocs == 'official' ? "Form 12BB" : "Form 12BB");
        this.loadingScreenService.stopLoading();
      });
  }

  getlandlordAddressDetails(addressDetails) {
    if (addressDetails != null) {
      var jObject = JSON.parse(addressDetails);
      return `Name of City : ${jObject.NameofCity}  Rent House Address : ${jObject.RentalHouseAddress}`;
    } else {
      return "---";
    }
  }

}
