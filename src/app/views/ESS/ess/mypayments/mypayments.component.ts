import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';
import { NgxSpinnerService } from "ngx-spinner";

import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, CommonService, EmployeeService, ESSService, FileUploadService, HeaderService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { FamilyDocumentCategoryist, FamilyInfo } from 'src/app/_services/model/OnBoarding/FamilyInfo';
import { LoginResponses } from 'src/app/_services/model';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ApprovalStatus } from 'src/app/_services/model/OnBoarding/QC';
import { ClaimType } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { Relationship } from 'src/app/_services/model/Base/HRSuiteEnums';
import { FamilyDetails } from 'src/app/_services/model/Employee/FamilyDetails';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { CandidateDocuments } from 'src/app/_services/model/Candidates/CandidateDocuments';
import * as moment from 'moment';
import { UUID } from 'angular2-uuid';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import Swal from 'sweetalert2';
import { ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { environment } from 'src/environments/environment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
@Component({
  selector: 'app-mypayments',
  templateUrl: './mypayments.component.html',
  styleUrls: ['./mypayments.component.css']
})
export class MypaymentsComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() FamilyInofListGrp: FamilyInfo;
  @Output() familyChangeHandler = new EventEmitter();

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  spinner: boolean = true;
  isEnbleNomineeBtn: boolean = true;
  // REACTIVE FORM 
  employeeForm: FormGroup;


  // GENERAL DECL.
  isESSLogin: boolean = false;
  EmployeeId: number = 0;
  _loginSessionDetails: LoginResponses;
  CompanyId: any = 0;
  UserId: any = 0;
  RoleId: any = 0;
  RoleCode: any;
  ImplementationCompanyId: any = 0;
  BusinessType: any = 0;

  clientLogoLink: any;
  clientminiLogoLink: any;
  //PAYMENT
  LstPaymentHistory = [];
  processCategoryList: any = [];
  selctedProcesscategoryId: any;
  selectedyear: any;
  yearrangeList: any = [];
  paginateData_PaymentHistory = [];

  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    public essService: ESSService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService,
    private commonService: CommonService,
    private Customloadingspinner: NgxSpinnerService
  ) { }

  ngOnInit() {

    this.doRefresh();

  }
  doRefresh() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.clientLogoLink = 'logo.png';
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.processCategoryList = this.utilsHelper.transform(ProcessCategory);
    this.processCategoryList = this.processCategoryList.filter(a => a.id != 4 && a.id != 0);

    // let companyLogos = this.essService.GetCompanyLogoByBusinessType(this._loginSessionDetails, this.BusinessType);
    // this.clientLogoLink = companyLogos.clientLogoLink;
    // this.clientminiLogoLink = companyLogos.clientminiLogoLink;
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      sessionStorage.removeItem('_StoreLstinvestment');
      sessionStorage.removeItem('_StoreLstDeductions');
      sessionStorage.removeItem("_StoreLstinvestment_Deleted");
      sessionStorage.removeItem("_StoreLstDeductions_Deleted");
      this.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).then((res) => {
        this.patchEmployeeForm();
      });
    } else {
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
      this.patchEmployeeForm();
    }



  }

  GetEmployeeRequiredDetailsById(employeeId, ctrlActivity) {
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .Common_GetEmployeeRequiredDetailsById(employeeId, ctrlActivity).then((result) => {
          if (result == true) {
            this.employeedetails = JSON.parse(this.sessionService.getSessionStorage('_EmployeeRequiredBasicDetails'));
            resolve(true);
          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting employee details`);
            return;
          }

        }, err => {
          resolve(false);
        })

    });

    return promise;
  }

  patchEmployeeForm() {

    this.LstPaymentHistory = [];
    this.paginateData_PaymentHistory = [];
    var dojYear = new Date(this.employeedetails.EmploymentContracts[0].StartDate)
    this.yearrange_builder(dojYear.getFullYear());
    let currentYear = new Date().getFullYear();
    this.selectedyear = this.yearrangeList.find(a => a.label == currentYear).value;
    this.selctedProcesscategoryId = 1;
    this.GetAnyPaymentHistory(this.EmployeeId, this.selctedProcesscategoryId, this.selectedyear);
    this.employeeService.getActiveTab(false);
  }

  yearrange_builder(earliestYear) {

    var year = new Date(environment.environment.YearRangeFromStaringYear).getFullYear();
    this.yearrangeList = [];
    let currentYear = new Date().getFullYear();

    while (currentYear >= earliestYear) {
      this.yearrangeList.push({
        label: currentYear,
        value: parseInt(String(currentYear))
      });
      currentYear -= 1;
    }
  }


  onChangeProcessCategory(event: any) {
    var str1 = '20';
    var res = str1.concat(this.selectedyear);
    this.paginateData_PaymentHistory = [];
    this.paginateData_PaymentHistory = this.LstPaymentHistory.filter(x => x.ProcessCategoryId == event.id && (x.YearOfPayment) == this.selectedyear);
    // this.paginateData_PaymentHistory = this.paginateData_PaymentHistory
    //   .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    // this.collectionSize = this.paginateData_PaymentHistory.length;
    console.log(event);

    this.GetAnyPaymentHistory(this.EmployeeId, this.selctedProcesscategoryId, this.selectedyear);

  }
  onChangeYearOfPayment(event: any) {
    this.paginateData_PaymentHistory = [];
    this.paginateData_PaymentHistory = this.LstPaymentHistory.filter(x => x.ProcessCategoryId == this.selctedProcesscategoryId && (x.YearOfPayment) == event.label);
    // this.paginateData_PaymentHistory = this.paginateData_PaymentHistory
    //   .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    // this.collectionSize = this.paginateData_PaymentHistory.length;
    console.log(event);

    this.GetAnyPaymentHistory(this.EmployeeId, this.selctedProcesscategoryId, this.selectedyear);
  }


  downloadPaySlip(item) {
    this.loadingScreenService.startLoading();
     // this.Customloadingspinner.show();
    if (item.ObjectStorageId != 0) {
      this.fileuploadService.downloadObjectAsBlob(item.ObjectStorageId)
        .subscribe(res => {
          if (res == null || res == undefined) {
            this.loadingScreenService.stopLoading();
           //this.Customloadingspinner.hide();
            this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
            return;
          }
          saveAs(res);
          
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
        });
    }
    else {
      this.employeeService.downloadPaySlip(item.PayTransactionId)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            // <!--  ! : 16.2 for panasonic  -->
            
            this.loadingScreenService.stopLoading();
            //this.Customloadingspinner.hide();
            //  <!--  ! : 16.2 for panasonic  -->
            this.commonService.openNewtab(apiResult.Result, `PaySlip_${this.employeedetails.FirstName}_${item.PayPeriodName}`);
          } else {
            // <!--  ! : 16.2 for panasonic  -->
            
            this.loadingScreenService.stopLoading();
           // this.Customloadingspinner.hide();
            //  <!--  ! : 16.2 for panasonic  -->
            this.alertService.showWarning(apiResult.Message);
          }
        }, err => {

        });
    }
  }


  GetAnyPaymentHistory(employeeId, processCategory, year) {
    this.spinner = true;
    this.LstPaymentHistory = [];
    this.paginateData_PaymentHistory = [];
    this.employeeService.GetAnyPaymentHistory(employeeId, processCategory, year)
      .subscribe((result) => {
        let apiR: apiResult = result;
        console.log('i', apiR);

        if (apiR.Status && apiR.Result != null && apiR.Result != '') {
          this.LstPaymentHistory = JSON.parse(apiR.Result);
          this.LstPaymentHistory = _.orderBy(this.LstPaymentHistory, ["PayTransactionId"], ["desc"]);
          this.paginateData_PaymentHistory = this.LstPaymentHistory;
          this.spinner = false;
        } else {
          this.spinner = false;
        }
      })

  }
}
