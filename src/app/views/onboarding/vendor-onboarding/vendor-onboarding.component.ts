import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";

export enum PaymentType {
  Hourly = 1,
  Daily = 2,
  Monthly = 3
}

import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UIBuilderService } from '../../../_services/service//UIBuilder.service';
import * as moment from 'moment';

import { ClientList, ClientContactList, ClientContractList, OnBoardingInfo } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { AlertService, OnboardingService, PagelayoutService } from 'src/app/_services/service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { ClientLocationList, IndustryList, LetterTemplateList, OfferInfo, PayGroupList, SkillCategoryList, ZoneList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { ClientLocationAllList } from 'src/app/_services/model/ClientLocationAllList';

import { CandidateOfferDetails, TenureType } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { CommunicationInfo } from '../../../_services/model/OnBoarding/CommunicationInfo';
import { BankInfo, BankList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { DocumentInfo } from 'src/app/_services/model/OnBoarding/DocumentInfo';
import { MigrationInfo, ManagerList, LeaveGroupList, CostCodeList, PayPeriodList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { UIMode } from '../../../_services/model/UIMode';
import { CandidateDocuments, ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { FileUploadService } from '../../../_services/service/fileUpload.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { Gender, Nationality, BloodGroup, MaritalStatus, GraduationType, CourseType, ScoringType, AcceptanceStatus,  } from '../../../_services/model/Base/HRSuiteEnums';
import { SourceType, RequestType, OnBoardingType, IsClientApprovedBasedOn, OfferStatus } from 'src/app/_services/model/Candidates/CandidateOfferDetails';

import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
  Formatter,

} from 'angular-slickgrid';
import { BankModalComponent } from 'src/app/shared/modals/bank-modal/bank-modal.component';
import { DatePipe } from '@angular/common';
import { DocumentsModalComponent } from 'src/app/shared/modals/documents-modal/documents-modal.component';
import { CountryList } from 'src/app/_services/model/OnBoarding/CandidateInfo';
import { CandidateModel, _CandidateModel } from 'src/app/_services/model/Candidates/CandidateModel';
import { ApprovalFor, CandidateDetails, CandidateStatus } from 'src/app/_services/model/Candidates/CandidateDetails';
import { WorkPermit } from 'src/app/_services/model/Candidates/CandidateCareerDetails';
import { CandidateRateset } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { CandidateOtherData, CandidateStatutoryDetails } from 'src/app/_services/model/Candidates/CandidateOtherData';
import { AddressDetails, CommunicationCategoryType, ContactDetails } from 'src/app/_services/model/Communication/CommunicationType';
import { CandidateCommunicationDetails } from 'src/app/_services/model/Candidates/CandidateCommunicationDetails';
import { CandidateFamilyDetails } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { BankBranchIdentifierType, CandidateBankDetails } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { environment } from 'src/environments/environment';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { PreviewCtcModalComponent } from 'src/app/shared/modals/preview-ctc-modal/preview-ctc-modal.component';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { WorklocationModalComponent } from 'src/app/shared/modals/worklocation-modal/worklocation-modal.component';
import { UserInterfaceControlLst, WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { ControlElement } from '../../generic-form/form-models';
import { DynamicFieldDetails, DynamicFieldsValue } from 'src/app/_services/model/OnBoarding/DynamicFIeldDetails';
import { panNumberValidator } from 'src/app/_validators/panNumberValidator';

@Component({
  selector: 'app-vendor-onboarding',
  templateUrl: './vendor-onboarding.component.html',
  styleUrls: ['./vendor-onboarding.component.scss']
})
export class VendorOnboardingComponent implements OnInit {
  _loginSessionDetails: LoginResponses;
  UserId: any;
  UserName: any;
  RoleId: any;
  CompanyId: any;
  BusinessType: any;
  RoleCode: any;
  clientLogoLink: any;
  clientminiLogoLink: any;
  ImplementationCompanyId: any;
  // COMMON PROPS
  should_spin_onboarding: boolean = false;
  candidatesForm: FormGroup;
  modalOption: NgbModalOptions = {};
  CandidateId: number = 0;
  activeTabName: string;
  spinner: boolean = false;
  submitted: boolean = false;
  invaid_fields = [];
  disableBtn = false;
  isEditMode: boolean = true;
  userAccessControl;
  GroupControlName: any;
  MenuId: any;

  // GENERAL TAB
  ClientList?: ClientList[] = [];
  ClientContactList: ClientContactList[] = [];
  ClientContractList: ClientContractList[] = [];
  ClientId: any;
  ClientContractId: any;
  StateList: StateList[] = [];
  StateList1: StateList[] = [];
  IndustryList: IndustryList[] = [];
  ClientLocationList: ClientLocationList[] = [];
  PayGroupList: PayGroupList[] = [];
  SkillCategoryList: SkillCategoryList[] = [];
  ZoneList: ZoneList[] = [];
  DocumentList: any[] = [];
  DocumentCategoryist = [];
  LetterTemplateList: LetterTemplateList[] = [];
  LetterTemplateListOL: LetterTemplateList[] = [];
  LetterTemplateListAL: LetterTemplateList[] = [];
  NoticePeriodDaysList: any[] = [];
  InsuranceList: any[] = [];
  BankList: BankList[] = [];
  CountryList: CountryList[] = [];
  CountryList_NonIndian: CountryList[] = [];
  ClientContractOperationList: any[] = [];

  //
  isDocumentInfo: boolean = true;
  isOfferInfo: boolean = true;
  isBankInfo: boolean = true;
  //
  countryCode: any;
  gender: any = [];
  nationality: any = [];
  salaryType: any = [];
  tenureType: any = [];
  bloodGroup: any = [];
  paymentType: any = [];
  maritialStatus: any = [];
  DOB: any;
  DOBmaxDate: Date;
  DOJminDate: Date;
  DOJmaxDate: Date;
  TenureminDate: Date;
  ActualDOJminDate: Date;
  ActualDOJmaxDate: Date;
  workPermitminDate: Date;

  OnBoardingInfoListGrp: OnBoardingInfo;
  OfferInfoListGrp: OfferInfo;
  OfferInfoListGrp1: OfferInfo; // Handle for spliting two seprate list Skills and Zone list
  CommunicationListGrp: CommunicationInfo;
  BankInfoListGrp: BankInfo;
  DocumentInfoListGrp: DocumentInfo;
  MigrationInfoGrp: MigrationInfo;

  // COMMUNICATIO INFORMATION

  isSameAddress = false;


  /* #region  Bank Slick Grid */
  columnDefinitions_Bank: Column[] = [];
  gridOptions_Bank: GridOption = {};
  LstBank: any[] = [];
  angularGrid_Bank: AngularGridInstance;
  gridObj_Bank: any;
  /* #endregion */

  documentURL: any;
  documentURLId: any;
  edit_document_lst = [];
  unsavedDocumentLst = [];

  deletedLstBank = [];
  deletedLstCandidateDocument = [];
  deleted_DocumentIds_List = [];

  // DOCUMENTS
  documentTbl = [];
  duplicateDocumentTbl = [];
  lstDocumentDetails: CandidateDocuments[] = [];
  _OldEmployeeDetails: any;
  employeeLetterTransactions: any[] = [];
  DocumentTypeList = [];

  // SAVE  
  candidateModel: CandidateModel = new CandidateModel();
  candidateDetails: CandidateDetails = new CandidateDetails;
  candidateOfferDetails: CandidateOfferDetails = new CandidateOfferDetails;
  OldcandidateOfferDetails: CandidateOfferDetails = new CandidateOfferDetails;

  workPermitDetails: WorkPermit = new WorkPermit;
  candidateRateSetDetails: CandidateRateset = new CandidateRateset;
  candidateOtherDetails: CandidateOtherData = new CandidateOtherData();
  candidateStatutoryDetails: CandidateStatutoryDetails = new CandidateStatutoryDetails;
  candidateContactDetails: ContactDetails = new ContactDetails;
  candidateCommunicationDetails: CandidateCommunicationDetails = new CandidateCommunicationDetails;
  candidateAddressDetails: AddressDetails = new AddressDetails;
  candidateFamilyDetails: CandidateFamilyDetails = new CandidateFamilyDetails();

  _NewCandidateDetails: CandidateDetails = new CandidateDetails();
  _OldCandidateDetails: CandidateDetails = new CandidateDetails();

  lstContactDetails: ContactDetails[] = [];
  lstRateSetDetails: CandidateRateset[] = []
  lstAddressDetails: AddressDetails[] = [];
  lstBankDetails: CandidateBankDetails[] = [];
  lstCandidateOfferDetails: CandidateOfferDetails[] = [];
  lstWorkPermitDetails: WorkPermit[] = [];
  lstStatutoryDetails: CandidateStatutoryDetails[] = [];
  previewCTC_OfferDetails: CandidateOfferDetails = new CandidateOfferDetails();
  Id: any = 0;
  DateOfJoining: any;
  StateId: any; CityId: any;

  previewLetter: boolean = true;
  previewCTC: boolean = true;
  ApprovalStatus: any;
  TransactionRemarks: any;


  isAssamState: boolean = false;
  rejectedLst = [];
  _LstRateSet: any[] = [];


  workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation;
  accessControl_submit: UserInterfaceControlLst = new UserInterfaceControlLst;
  accessControl_reject: UserInterfaceControlLst = new UserInterfaceControlLst;

  EmploymentTypeList: any[] = [];
  DynamicFieldDetails: DynamicFieldDetails = new DynamicFieldDetails();
  Dynamicfieldvalue: DynamicFieldsValue = new DynamicFieldsValue();

  TeamList: any;
  isESICapplicable: boolean = false;

  constructor(
    private onboardingService: OnboardingService,
    public sessionService: SessionStorage,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private alertService: AlertService,
    private utilsHelper: enumHelper,
    private fileuploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    public modalService: NgbModal,
    private datePipe: DatePipe,
    private loadingScreenService: LoadingScreenService,
    public UIBuilderService: UIBuilderService,
    private utitlityService: UtilityService,
    private pageLayoutService : PagelayoutService


  ) {
    this.createForm();
  }

  ngOnInit() {
    this.CandidateId = 0;
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.ClientList = [];
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.doCheckAccordion("isOnboardingInfo");
    this.countryCode = "91";
    this.MenuId = environment.environment.OnboardingMenuId;
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.accessControl_submit = this.userAccessControl.filter(a => a.ControlName == "btn_onboarding_submit");
    this.accessControl_reject = this.userAccessControl.filter(a => a.ControlName == "btn_Opsonboarding_reject");
    // console.log('this.accessControl_submit', this.accessControl_submit);
    // console.log('this.userAccessControl', this.accessControl_submit);
    this.clientLogoLink = 'logo.png';
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


    this.gender = this.utilsHelper.transform(Gender);
    console.log('ff', this.gender);

    this.nationality = this.utilsHelper.transform(Nationality);
    this.tenureType = this.utilsHelper.transform(TenureType)
    this.bloodGroup = this.utilsHelper.transform(BloodGroup)
    this.maritialStatus = this.utilsHelper.transform(MaritalStatus)
    this.paymentType = this.utilsHelper.transform(PaymentType);
    this.salaryType = this.utilsHelper.transform(SalaryBreakUpType);

    this.candidatesForm.controls['nationality'].setValue(this.nationality.find(a => a.id == 1).id);
    this.DOBmaxDate = new Date();
    this.workPermitminDate = new Date();
    this.TenureminDate = new Date();
    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Idx"]);
        var encodedCdx = atob(params["Cdx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.CandidateId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);

      }
    });

    // var i = JSON.stringify({
    //   "Id": 0,
    //   "EmployeeId": 15001,
    //   "FinancialYearId": 3,
    //   "ProductId": 6,
    //   "BillAmount": "1200",
    //   "InputsRemarks": "testing",
    //   "ApproverRemarks": null,
    //   "IsProposed": true,
    //   "ApprovedAmount": 0,
    //   "Status": 0,
    //   "DocumentId": 4167,
    //   "BillNo": "123",
    //   "BillName": null,
    //   "BillDate": "2021-11-03T09:49:47Z",
    //   "RejectedRemarks": null,
    //   "Modetype": 1
    // });

    //   this.onboardingService.putdummy(i).subscribe(authorized => {
    //   console.log('at', authorized);

    // });

    // this.onboardingService.getdummy().subscribe(authorized => {
    //   console.log('at f', authorized);
    // });

    // this.Id = 15054;
    // this.CandidateId = 15054;
    this.init()
  }
  get g() { return this.candidatesForm.controls; } // reactive forms validation 


  createForm() {

    this.candidatesForm = this.formBuilder.group({
      requestFor: ['AL'],
      onboardingType: ['Detailed'],
      requestBy: ['self'],
      sourceType: [2],

      clientName: [null],
      clientContract: [null],
      clientSPOC: [null],

      firstName: [''],
      newName: [''],
      isNameChange: [false],
      gender: [null],
      email: [''],
      mobile: [''],
      dateOfBirth: [null],
      isDifferentlyabled: [false],
      differentlyabledPercentage: ['', [Validators.max(100), Validators.min(0)]],
      nationality: [null],
      fatherName: [''],
      country: [null],
      isValidFrom: [''],
      isValidTill: [''],
      workPermitType: [''],

      industryType: [null],
      locationLabel: [''],
      location: [null],
      skillCategory: [null],
      designation: [''],
      Remarks: [''],
      zone: [null],
      salaryType: [null],
      annualSalary: [''],
      monthlyAmount: [''],
      forMonthlyValue: [false],
      MonthlySalary: [''],
      paystructure: [null],
      // letterTemplate: [null],
      // expectedDOJ: [''],
      // tenureType: [null],
      // tenureMonth: [''],
      // tenureEndate: [''],
      // insurance: [null],
      // insuranceplan: [null],
      // onCostInsuranceAmount: [''],
      // fixedDeductionAmount: [''],
      // isOLcandidateacceptance: [false],
      paymentType: [null],
      payableRate: [''],
      billableRate: [''],
      TeamId:[null],
      permanentCommunicationCategoryTypeId: [''],
      permanentAddressdetails: [''],
      permanentAddressdetails1: [''],
      permanentAddressdetails2: [''],
      permanentStateName: [null],
      permanentCountryName: [null],
      permanentPincode: [''],
      permanentCity: [''],

      presentCommunicationCategoryTypeId: [''],
      presentAddressdetails: [''],
      presentAddressdetails1: [''],
      presentAddressdetails2: [''],
      presentStateName: [null],
      presentCountryName: [null],
      presentPincode: [''],
      presentCity: [''],

      PANNO: ['', panNumberValidator()],
      aadhaarNumber: [''],

      AppointmentLetterTemplateId: [null],
      employmentType: [null],
      ActualDOJ: [null],
    });


  }

  removeValidation() {

    Object.keys(this.candidatesForm.controls).forEach(key => {

      this.candidatesForm.get(key).clearValidators();
      this.candidatesForm.get(key).setErrors(null);
      this.candidatesForm.get(key).updateValueAndValidity();

    });


  }

  init() {


    try {

      this.removeValidation();
      let mode = this.Id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.isEditMode = this.Id == 0 ? true : false;

      // var isExistsGroupControl = false;
      // isExistsGroupControl = this.userAccessControl != undefined && this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      this.GroupControlName = "Detailed";
      this.UIBuilderService.doApply(mode, this, this.MenuId, this.GroupControlName);

      if (this.BusinessType == 3) {
        this.candidatesForm.controls['sourceType'].setValue(2);

      }

    } catch (Exception) {

      console.error("ON INIT METHOD EXCEPTION :: ", Exception);

    }

    this.check_ActualDOJ_minDate();

    try {

      this.should_spin_onboarding = true;
      if (this.CandidateId != 0) {
        try {
          this.doCheckAccordion("isBankInfo");   // For Bank Information Pre-loading data
        } catch (error) { }

        this.do_Edit();
      }
      setTimeout(() => {
        this.doCheckAccordion("isOnboardingInfo"); // for edit pre loading - Returns a function to use in accordion data for buttons click 
        this.doAccordionLoading("isOfferInfo").then(() => console.log("Onboarding isOfferInfo - Task Complete!"));

      }, 2500);
      setTimeout(() => {
        this.disableBtn = true;
      }, 1500);



    } catch (error) {
    }

    // this.headerService.remarks.subscribe(remarks => {
    //   this.TransactionRemarks = remarks;
    // });

    this.updateValidation(false, this.candidatesForm.get('skillCategory'));
    this.updateValidation(false, this.candidatesForm.get('zone'));
    this.updateValidation(false, this.candidatesForm.get('annualSalary'));
    this.updateValidation(false, this.candidatesForm.get('industryType'));

    this.candidatesForm.get('sourceType').value == 2 && this.Id == 0 && this.BusinessType == 3 ? this.candidatesForm.controls['requestFor'].setValue('AL') : null;
    if (this.candidatesForm.get('requestFor').value != null && this.candidatesForm.get('requestFor').value.toString() === "AL") {
      this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(false, this.candidatesForm.get('letterTemplate'));
      this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(true, this.candidatesForm.get('payableRate'));
      this.updateValidation(true, this.candidatesForm.get('billableRate'));
      this.updateValidation(true, this.candidatesForm.get('paymentType'));
      this.updateValidation(true, this.candidatesForm.get('TeamId'));

      // this.updateValidation(true, this.candidatesForm.get('TeamId'));
      // this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
      // this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));
    }
    else {
      // this.updateValidation(true, this.candidatesForm.get('expectedDOJ'));
      // this.updateValidation(true, this.candidatesForm.get('letterTemplate'));

      // this.updateValidation(false, this.candidatesForm.get('ActualDOJ'));
      // this.updateValidation(false, this.candidatesForm.get('AppointmentLetterTemplateId'));
      // this.updateValidation(false, this.candidatesForm.get('TeamId'));
      // this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
      // this.updateValidation(false, this.candidatesForm.get('EffectivePayPeriod'));


    }
  }

  updateValidation(value, control: AbstractControl) {
    try {
      if (value) {
        control.setValidators([Validators.required]);
      } else {
        control.clearValidators();
        control.setErrors(null);
      }
      control.updateValueAndValidity();
    } catch (error) {

    }
  }


  loadData(event) {
    this.spinner = true;
    if (event.nextId == 'isCommunicationdetails') {
      this.doAccordionLoading('isCommunicationdetails');
    }
    else if (event.nextId == 'isBankInfo') {
      this.BankInfoListGrp == undefined ? this.doAccordionLoading(event.nextId) : undefined;
      this.doBankSlickGrid();
    }

    else if (event.nextId == "isDocumentInfo") {
      this.doAccordionLoading("isDocumentInfo");
    }
    setTimeout(() => {
      this.spinner = false;
    }, 1500);
    this.activeTabName = event.nextId;
  }

  check_ActualDOJ_minDate() {

    this.ActualDOJminDate = new Date();
    this.ActualDOJmaxDate = new Date();

    this.ActualDOJminDate.setDate(this.ActualDOJminDate.getDate() - (!this.isESICapplicable ? environment.environment.ActualDOJminDate : environment.environment.ActualDOJminDate_withESIC));
    this.ActualDOJminDate.setMonth(this.ActualDOJminDate.getMonth());
    this.ActualDOJminDate.setFullYear(this.ActualDOJminDate.getFullYear());


    this.ActualDOJmaxDate.setDate(this.ActualDOJmaxDate.getDate() + environment.environment.ActualDOJmaxDate);
    this.ActualDOJmaxDate.setMonth(this.ActualDOJmaxDate.getMonth());
    this.ActualDOJmaxDate.setFullYear(this.ActualDOJmaxDate.getFullYear());
  }

  public doCheckAccordion(accordion_Name: any): void {

    if (accordion_Name == "isOnboardingInfo") {
      this.doAccordionLoading(accordion_Name).then(() => console.log("Onboarding Info - Task Complete!"));
    }
    else if (accordion_Name == "isOfferInfo") {
      this.OfferInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isCommunicationdetails") {
      this.CommunicationListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isBankInfo") {
      this.BankInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isDocumentInfo") {
      this.DocumentInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
  }

  public doAccordionLoading(accordion_Name: any) {

    const promise = new Promise((res, rej) => {

      try {


        this.should_spin_onboarding = true;
        this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
          .subscribe(authorized => {
            const apiResult: apiResult = authorized;
            // console.log('RESULT OF ACCORD ::', (apiResult.Result));


            if (apiResult.Status && apiResult.Result != "") {
              if (accordion_Name == "isOnboardingInfo") {
                this.OnBoardingInfoListGrp = (JSON.parse((apiResult.Result)));
                this.ClientList = _.orderBy(this.OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);
                if(this.BusinessType != 3){
                  let _industryId= this.ClientList.length > 0 && this.ClientList.find(a=>a.Id == this.sessionService.getSessionStorage("default_SME_ClientId")).industryId as any; 
                  this.candidatesForm.controls['industryType'].setValue(_industryId);
                }
                this.disableBtn = true;
                if (this.Id) {
                  try {
                    this.refreshContractAndContact(this.ClientId);

                  } catch (error) { }
                } else {
                  this.should_spin_onboarding = false;
                }
                this.Id != NaN && this.BusinessType != 3 ? this._load_SME_Properties() : null;
              }

              else if (accordion_Name == "isOfferInfo") {
                this.ClientContractId = (this.candidatesForm.get('clientContract').value);
                this.OfferInfoListGrp = JSON.parse(apiResult.Result);
                console.log('Off Info List :', this.OfferInfoListGrp);
                this.IndustryList = _.orderBy(this.OfferInfoListGrp.IndustryList, ["Name"], ["asc"]);
                this.EmploymentTypeList = this.OfferInfoListGrp.EmploymentTypeList != null && this.OfferInfoListGrp.EmploymentTypeList.length > 0 ? this.OfferInfoListGrp.EmploymentTypeList : [];
                console.log('CID ::',this.ClientId)
                this.OfferInfoListGrp.ClientLocationList != null && this.OfferInfoListGrp.ClientLocationList.length > 0 ? this.ClientLocationList = _.orderBy(this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.ClientId), ["LocationName"], ["asc"]) : true;
                console.log('CLOC ::',this.ClientLocationList)
                let exists = this.ClientContractList.find(a => a.Id == this.ClientContractId);
                if (exists != null) {
                  this.onChangeContract(exists);

                }
                this.ClientContractId != null ? this.doletterTemplate() : true;
                if (this.Id) {
                  this.onChangeOfferLocation(null);
                  try {
                    var payEvent = {
                      id: 0
                    }
                    payEvent.id = (this.candidatesForm.get('salaryType').value == null || this.candidatesForm.get('salaryType').value == 0) ? 0 : this.candidatesForm.get('salaryType').value;
                    // this.editOnChangeSalary(payEvent);


                  } catch (error) {
                    console.log('err : ', error);

                  }

                  this.should_spin_onboarding = false;

                } else { this.should_spin_onboarding = false; }

                this.should_spin_onboarding = false;
              }


              else if (accordion_Name == "isCommunicationdetails") {
                this.CommunicationListGrp = JSON.parse(apiResult.Result);
                this.CountryList = _.orderBy(this.CommunicationListGrp.CountryList, ["Name"], ["asc"]);
                if (this.CandidateId != 0) {
                  try {
                    var countryEventId = (this.candidatesForm.get('presentCountryName').value == null || this.candidatesForm.get('presentCountryName').value == 0 ? null : this.candidatesForm.get('presentCountryName').value);
                    var countryEvent1Id = (this.candidatesForm.get('permanentCountryName').value == null || this.candidatesForm.get('permanentCountryName').value == 0 ? null : this.candidatesForm.get('permanentCountryName').value);
                    this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);
                    this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === Number(countryEvent1Id)), ["Name"], ["asc"]);
                    this.should_spin_onboarding = false;

                  } catch (error) { }
                } else { this.should_spin_onboarding = false; }
              }

              else if (accordion_Name == "isBankInfo") {
                this.BankInfoListGrp = JSON.parse(apiResult.Result);
                this.BankList = this.BankInfoListGrp.BankList;
                this.should_spin_onboarding = false;
              }

              else if (accordion_Name == "isDocumentInfo") {
                this.DocumentInfoListGrp = JSON.parse(apiResult.Result);
                this.DocumentCategoryist = this.DocumentInfoListGrp.DocumentCategoryist;
                try {
                  this.onDocumentClick();
                } catch (error) { }
              }

            }

            else {
              // this.alertService.showWarning("Show Message for empty flatlist")
              this.should_spin_onboarding = false;
            }
            this.should_spin_onboarding = false;
          }, (error) => {
            this.should_spin_onboarding = false;
          });
      } catch (error) {

      }

    })
    return promise;
  }
  onChangeClient(item: any) {

    console.log('C :', item)
    this.ClientContractId = null;
    this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(null) : null;
    this.candidatesForm.controls['clientSPOC'] != null ? this.candidatesForm.controls['clientSPOC'].setValue(null) : null;
    this.candidatesForm.controls['location'] != null ? this.candidatesForm.controls['location'].setValue(null) : null;
    this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(null) : null;
    this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(null) : null;
    this.OfferInfoListGrp1 = null;
    this.SkillCategoryList = [];
    this.ClientLocationList = [];
    this.ZoneList = [];
    if (item != null) {
      this.candidatesForm.controls['industryType'].setValue(item.IndustryId);
      this.Id == 0 ? this.doAccordionLoading("isOfferInfo").then(() => console.log("Onboarding isOfferInfo - Task Complete!")) : true;
      this.refreshContractAndContact(item.Id);
    }
  }

  onChangeContract(item: ClientContractList) {

    this.ClientContractId = item.Id;
    console.log('CCL :', item);

    console.log('Off Info List 1:', this.OfferInfoListGrp);
    this.candidatesForm.controls['salaryType'].setValue(item.DefaultSalaryType);
    this.candidatesForm.controls['paystructure'].setValue(item.DefaultPayStructureId);
        this.OfferInfoListGrp != undefined ? this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId) : true;
    this.getMigrationMasterInfo(this.ClientContractId);
    this.getDynamicFieldDetailsConfig(this.CompanyId, this.ClientId, this.ClientContractId).then(() => console.log("Task Complete!"));

  }
  refreshContractAndContact(ClientId): any {
    return new Promise((resolve, reject) => {
      this.ClientId = ClientId;
      if ((this.OnBoardingInfoListGrp.ClientContractList != null && this.OnBoardingInfoListGrp.ClientContractList.length > 0)) {
        let i = this.OnBoardingInfoListGrp.ClientContractList.filter(a => a.ClientId == ClientId);
        let filterd = _.filter(this.OnBoardingInfoListGrp.ClientContractList, (a) => a.ClientId === ClientId);
        this.ClientContractList = _.orderBy(i, ["Name"], ["asc"]);
        this.ClientContactList = _.orderBy(this.OnBoardingInfoListGrp.ClientContactList.filter(a => a.ClientId == ClientId), ["Name"], ["asc"]);
        let exists = this.ClientContractList.find(a => a.Id == this.ClientContractId);
        if (exists != null) {
          this.onChangeContract(exists)
        }
      }
      resolve(true);
    });
  }

  getMigrationMasterInfo(ClientContractId) {

    this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {
      let apiResult: apiResult = (result);

      if (apiResult.Status && apiResult.Result != null) {
        this.MigrationInfoGrp = JSON.parse(apiResult.Result);
        this.TeamList = this.MigrationInfoGrp;
        console.log('MigrationInfoGrp', this.MigrationInfoGrp);
        this.ClientContractOperationList = this.MigrationInfoGrp != null && this.MigrationInfoGrp[0].ClientContractOperationList != null && this.MigrationInfoGrp[0].ClientContractOperationList.length > 0 ? this.MigrationInfoGrp[0].ClientContractOperationList : [];
        console.log('ClientContractOperationList', this.ClientContractOperationList);

       

        // this.candidatesForm.controls['paymentType'].setValue(this.ClientContractOperationList[0].PaymentType == 0 ? null : this.ClientContractOperationList[0].PaymentType);
        if (this.ClientContractId != 0) {
          this.doletterTemplate();
        }

      } else {

      }

    }), ((error) => {

    })
  }


  doletterTemplate() {

    this.onboardingService.getLetterTemplate(this.CompanyId, this.ClientId, this.ClientContractId)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;
        if (apiResult.Status && apiResult.Result != "") {
          this.LetterTemplateList = JSON.parse(apiResult.Result);
          console.log('LETTERS :', this.LetterTemplateList);

          // this.LetterTemplateListOL = this.LetterTemplateList.filter(a => a.RequestType == ApprovalFor.OL);
          this.LetterTemplateListAL = this.LetterTemplateList.filter(a => a.RequestType == ApprovalFor.AL);
        }
      }), ((err) => {

      })
  }

  onChangeDOB(dobDate) {

    this.DOB = dobDate;

  }


  onChangeDOJ(dojDate) {
    //  this.counter = this.counter + 1;

    //  if (this.counter > 2 && dojDate.length != 0) {

    if (dojDate != null)

      var including = dojDate.toString().includes("-");

    if (including) {
      var dateParts = dojDate.split("-");
      var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
      this.DateOfJoining = dateObject;
      dojDate = dateObject;
    } else {

      this.DateOfJoining = new Date(dojDate);
    }

    if (this.candidatesForm.get('requestFor').value == "OL" && this.candidatesForm.controls['expectedDOJ'] != null != undefined && this.candidatesForm.controls['expectedDOJ'] != null ? this.candidatesForm.get('expectedDOJ').value != null || this.candidatesForm.get('expectedDOJ').value != undefined : null) {

      this.DateOfJoining = new Date(dojDate);
      var tenureEndDate = new Date(dojDate);
      this.TenureminDate.setDate(tenureEndDate.getDate() + 1);
      this.TenureminDate.setMonth(tenureEndDate.getMonth());
      this.TenureminDate.setFullYear(tenureEndDate.getFullYear());
      // }
    }

    if (this.candidatesForm.get('requestFor').value == "AL" && this.candidatesForm.controls['ActualDOJ'] != null && this.candidatesForm.get('ActualDOJ').value != null && this.candidatesForm.get('ActualDOJ').value != undefined) {

      this.DateOfJoining = new Date(dojDate);
      var tenureEndDate = new Date(dojDate);
      this.TenureminDate.setDate(tenureEndDate.getDate() + 1);
      this.TenureminDate.setMonth(tenureEndDate.getMonth());
      this.TenureminDate.setFullYear(tenureEndDate.getFullYear());

      // }
    }


    if (this.datePipe.transform((this.DateOfJoining).toString(), 'yyyy-MM-dd') == "1970-01-01") {
      this.DateOfJoining = null;
    }


    // }
  }


  createNew() {

    const modalRef = this.modalService.open(WorklocationModalComponent, this.modalOption);
    modalRef.componentInstance.id = 0;
    var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;

    modalRef.result.then((result) => {

      console.log(result);
      if (result != "Modal Closed") {
        this.doAccordionLoading("isOfferInfo");
        this.candidatesForm.controls['location'] != null ? this.candidatesForm.controls['location'].setValue(result.Id) : null;
      }
    }).catch((error) => {
      console.log(error);
    });


  }

  onChangePayGroup(event) {

    event != null && (this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) ?
      this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId), 'paystructure') : null;

  }

  onChangeSalary(event) {
    if (event != undefined) {

      this.PayGroupList = [];
      this.candidatesForm.controls['paystructure'].setValue(null);
      this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
      this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == event.id);
      event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('salaryType').value), 'salaryType') : null;

    }
  }
  editOnChangeSalary(event) {

    if (this.OfferInfoListGrp != null && this.OfferInfoListGrp != undefined && this.OfferInfoListGrp.PayGroupList != null && this.OfferInfoListGrp.PayGroupList.length > 0) {
      this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
      console.log('this.PayGroupList', this.PayGroupList);

      this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == event.id);
      let payGrpId = this.candidatesForm.get('paystructure').value;
      if (payGrpId != null && this.PayGroupList.length != 0 && payGrpId != undefined) {
        var payGrpFilterd = _.find(this.PayGroupList, (item) => item.PayGroupId == payGrpId);
        this.candidatesForm.controls['paystructure'].setValue(payGrpFilterd.PayGroupId);
      }
    }
  }

  onChangeAnnaulSalary(event) {

    this.candidatesForm.controls['MonthlySalary'].setValue(Math.floor(this.candidatesForm.get('payableRate').value / 12))
    event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('payableRate').value), 'payableRate') : null;

  }


  onFocus_OfferAccordion(newValue, Formindex) {


    return new Promise((resolve, reject) => {

      if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
        this._LstRateSet = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet;
      }


      if (this._LstRateSet != null && this._LstRateSet.length > 0) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true,
        })

        swalWithBootstrapButtons.fire({
          title: 'Confirmation!',
          text: "The change you made as an impact on the salary calculation hence please re-calculate the salary by clicking  'View Salary Breakup' button ",
          type: 'warning',
          showCancelButton: false,
          confirmButtonText: 'Ok!',
          cancelButtonText: 'No, cancel!',
          allowOutsideClick: false,
          reverseButtons: true
        }).then((result) => {

          this._LstRateSet = null;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = null;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = [];
        })



      }

    });




  }



  // COMMUNICATION INFORMATION

  public onSameAddressPresentChanged(value: boolean) {

    this.isSameAddress = value;

    if (this.isSameAddress) {

      this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(this.candidatesForm.get('presentAddressdetails').value) : null;
      this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(this.candidatesForm.get('presentAddressdetails1').value) : null;
      this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(this.candidatesForm.get('presentAddressdetails2').value) : null;
      this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue(this.candidatesForm.get('presentCountryName').value) : null;
      this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(this.candidatesForm.get('presentPincode').value) : null;
      this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === this.candidatesForm.get('presentCountryName').value), ["Name"], ["asc"]);
      this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue(this.candidatesForm.get('presentStateName').value) : null;
      this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue(this.candidatesForm.get('presentCity').value) : null;

    } else {


      this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(null) : null;
      this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(null) : null;
      this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(null) : null;
      this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue(null) : null;
      this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue(null) : null;
      this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(null) : null;
      this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue(null) : null;

      this.StateList1 = [];
    }
  }

  onChangeStateByCountryId(country) {

    this.candidatesForm.controls['presentStateName'].setValue(null);
    this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);


  }
  onChangeStateByCountryId1(country) {
    this.candidatesForm.controls['permanentStateName'].setValue(null);
    this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);

  }



  // BANK INFORMATION  

  doBankSlickGrid() {

    let previewFormatter: Formatter;
    previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
      class="mdi mdi-eye m-r-xs"></i> View </button>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';


    this.columnDefinitions_Bank = [

      { id: 'bankFullName', name: 'Bank Name', field: 'bankFullName', sortable: true },
      { id: 'accountNumber', name: 'Account Number', field: 'accountNumber', sortable: true },
      { id: 'bankBranchId', name: 'IFSC Code', field: 'bankBranchId', sortable: true },
      { id: 'allocation', name: 'Allocation', field: 'allocation', sortable: true },
      { id: 'DocumentStatus', name: 'Status', field: 'DocumentStatus', sortable: true, cssClass: `` },
      {
        id: 'preview',
        field: 'id',
        name: 'Preview',
        excludeFromHeaderMenu: true,
        formatter: previewFormatter,
        onCellClick: (e, args: OnEventArgs) => {
          if (args.dataContext.CandidateDocument == null) {
            this.alertService.showInfo('Note: Preview of document not available.');
            return;
          }

          this.document_file_view(args.dataContext.CandidateDocument, 'Bank');
        }
      },
      {
        id: 'edit',
        field: 'id',

        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e, args: OnEventArgs) => {
          console.log(args);

          if (args.dataContext.DocumentStatus != "Approved") {
            this.addBank(args.dataContext);
          } else {
            this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
            return;
          }
        }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e, args: OnEventArgs) => {
          if (args.dataContext.DocumentStatus != "Approved") {
            this.removeSelectedRow(args.dataContext, "Bank").then((result) => {
            });
            this.angularGrid_Bank.gridService.deleteDataGridItemById(args.dataContext.Id);

            // this.alertWarning = `Editing: ${args.dataContext.title}`;
            this.angularGrid_Bank.gridService.highlightRow(args.row, 1500);
            this.angularGrid_Bank.gridService.setSelectedRow(args.row);

          } else {
            this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
            return;
          }
        }
      },

    ];

    this.gridOptions_Bank = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      presets: {
        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        hideSelectAllCheckbox: true,
      },
      rowSelectionOptions: {
        selectActiveRow: false
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      asyncEditorLoading: false,

      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };

  }


  angularGridReady_Bank(angularGrid: AngularGridInstance) {
    this.angularGrid_Bank = angularGrid;
    this.gridOptions_Bank = angularGrid && angularGrid.slickGrid || {};
  }


  document_file_view(item, whichdocs) {
    console.log('item', item);
    if (item == null) {
      this.alertService.showWarning("No document found!.");
      return;
    }
    $("#popup_viewDocs").modal('show');
    this.documentURL = null;
    this.documentURLId = null;
    this.documentURLId = item.DocumentId;
    var contentType = whichdocs != 'official' ? this.fileuploadService.getContentType(item.FileName) : 'application/pdf';
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.fileuploadService.getObjectById(item.DocumentId)
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
            console.log(' DOCUMENT URL :', this.documentURL);

          }
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }

  }

  modal_dismiss4() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs").modal('hide');
  }

  // open Bank info popup modal screen



  addBank(json_edit_object) {




    if (this.Id != 0) {

      if (json_edit_object != undefined && json_edit_object.CandidateDocument != null && json_edit_object.CandidateDocument.Status == 1) {
        this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
        return;
      }

      if (json_edit_object == undefined && this.LstBank.length > 0 && this.LstBank.filter(a => a.DocumentStatus == "Approved" || a.DocumentStatus == "Pending").length > 0) {
        this.alertService.showWarning("You are only allowed to enter one more item");
        return;
      }

      this.doCheckAccordion("isBankInfo");   // For Bank Information Pre-loading data

      console.log(json_edit_object);

      if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {

        json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
        json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
        json_edit_object.proofType = json_edit_object.CandidateDocument.DocumentTypeId;
      }

      const modalRef = this.modalService.open(BankModalComponent, this.modalOption);
      modalRef.componentInstance.UserId = this.UserId;
      modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
      modalRef.componentInstance.jsonObj = json_edit_object;
      modalRef.componentInstance.OT = this.candidatesForm.get('onboardingType').value;
      modalRef.componentInstance.candidateDetailsBasic = { CandidateName: this.candidatesForm.get('firstName').value, MobileNumber: this.candidatesForm.get('mobile').value, EmailId: this.candidatesForm.get('email').value };

      var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
      modalRef.componentInstance.objStorageJson = objStorageJson;
      modalRef.result.then((result) => {
        console.log(result);

        if (result != "Modal Closed") {


          if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {
            var candidateDets = new CandidateDocuments();
            candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
            candidateDets.CandidateId = this.CandidateId;
            candidateDets.IsSelfDocument = true;
            candidateDets.DocumentId = result.DocumentId;
            candidateDets.DocumentCategoryId = 0;
            candidateDets.DocumentTypeId = result.proofType
            candidateDets.DocumentNumber = "0";
            candidateDets.FileName = result.FileName;
            candidateDets.ValidFrom = null;
            candidateDets.ValidTill = null;
            candidateDets.Status = result.VerificationMode == 2 ? ApprovalStatus.Approved : ApprovalStatus.Pending;;
            candidateDets.IsOtherDocument = true;
            candidateDets.Modetype = UIMode.Edit;
            candidateDets.DocumentCategoryName = "";
            candidateDets.StorageDetails = null;
            result.CandidateDocument = candidateDets;
            result.Modetype = UIMode.Edit;
            console.log(candidateDets);

          }
          else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {

            var candidateDets = new CandidateDocuments();
            candidateDets.Id = result.CandidateDocument.Id;
            candidateDets.CandidateId = result.CandidateDocument.CandidateId;
            candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
            candidateDets.DocumentId = result.DocumentId;
            candidateDets.DocumentCategoryId = 0;
            candidateDets.DocumentTypeId = result.proofType
            candidateDets.DocumentNumber = "0";
            candidateDets.FileName = result.FileName;
            candidateDets.ValidFrom = null;
            candidateDets.ValidTill = null;
            candidateDets.Status = result.VerificationMode == 2 ? ApprovalStatus.Approved : ApprovalStatus.Pending; //  
            candidateDets.IsOtherDocument = true;
            candidateDets.Modetype = UIMode.Edit;
            candidateDets.DocumentCategoryName = "";
            candidateDets.StorageDetails = null;
            result.CandidateDocument = candidateDets;
            result.Modetype = UIMode.Edit;

          }

          else {

            result.CandidateDocument = null;
            result.Modetype = this.isGuid(result.Id) == true ? UIMode.Edit : UIMode.Edit;
            result.isDocumentStatus = null;
            result.DocumentStatus = null;
          }

          result.isDocumentStatus = result.VerificationMode == 2 ? ApprovalStatus.Approved : ApprovalStatus.Pending;;
          result.DocumentStatus = result.VerificationMode == 2 ? "Approved" : "Pending";
          result.id = result.Id

          result.bankFullName = this.BankList.find(a => a.Id == result.bankName).Name;
          let isAlreadyExists = false;

          if (this.LstBank.length >= 1 && this.LstBank.find(z => z.Id != result.Id)) {

            this.alertService.showWarning("You are only allowed to enter one more item");

          } else {

            let isSameResult = false;
            isSameResult = _.find(this.LstBank, (a) => a.Id == result.Id) != null ? true : false;

            if (isSameResult) {

              this.angularGrid_Bank.gridService.updateDataGridItemById(result.Id, result, true, true);

            } else {
              this.angularGrid_Bank.gridService.addItemToDatagrid(result);
            }


          }
        }
        // this.LstBank = (result);


      }).catch((error) => {
        console.log(error);
      });

    }
    else {
      this.alertService.showWarning("You must be recorded the basic details of the candidate and try to add the bank information.");
      return;
    }
  }



  removeSelectedRow(args, whicharea) {

    return new Promise((resolve, reject) => {
      const isCheck = this.isGuid(args.Id);
      if (isCheck && args.DocumentId != null) {
        this.doDeleteFile(args.DocumentId, null).then(() => {
          resolve(true);
        });
      }
      else {
        args.Modetype = UIMode.Delete;
        if (args.CandidateDocument != null && args.CandidateDocument.DocumentId != null) {
          args.CandidateDocument.Modetype = UIMode.Delete;
        }
        else if (whicharea == "Bank") {
          this.deletedLstBank.push(args);
        }

        resolve(true);
      }
    });
  }

  /* #region  DOCUMENT SECTION UPLOAD/DELETE/EDIT */


  onDocumentClick() {



    // this.onboardingService.geydummycall().subscribe(authorized => {
    //   console.log('at', authorized);

    // });

    this.onboardingService.getDocumentList(this.CandidateId, this.CompanyId, this.ClientId, this.ClientContractId)
      .subscribe(authorized => {

        let apiResult: apiResult = (authorized);
        try {
          this.DocumentList = JSON.parse(apiResult.Result);
          this.DocumentList.forEach(element => {
            element['DocumentId'] = null;
            element['CategoryType'] = null;
            element['FileName'] = null;
            element['DeletedIds'] = null;
          });
          this.documentTbl = [];
          this.DocumentList.forEach(element => {
            this.documentTbl.push(element);
          });
          this.documentTbl.forEach(element_new => {
            let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == element_new.DocumentTypeId)).ApplicableCategories;
            (Object.keys(element_new).forEach(key => {
              let i = tem_c.find(a => a.Name == key);
              if (i != undefined) {
                i['isChecked'] = element_new[key] == 1 ? true : false;
              }
            }));
            element_new.CategoryType = tem_c;
          });
          if (this.CandidateId != 0) {
            this.documentTbl.forEach(element_new => {
              this.edit_document_lst.forEach(ele_edit => {
                if (element_new.DocumentTypeId == ele_edit.DocumentTypeId) {
                  let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == ele_edit.DocumentTypeId)).ApplicableCategories;
                  (Object.keys(element_new).forEach(key => {
                    let i = tem_c.find(a => a.Name == key);
                    if (i != undefined) {
                      i['isChecked'] = element_new[key] == 1 ? true : false;
                    }
                  }));
                  element_new.DocumentId = ele_edit.DocumentId
                  element_new.DocumentNumber = ele_edit.DocumentNumber
                  element_new.CandidateId = ele_edit.CandidateId
                  element_new.FileName = ele_edit.FileName
                  element_new.ValidFrom = (this.datePipe.transform(ele_edit.ValidFrom, "yyyy-MM-dd"))
                  element_new.ValidTill = (this.datePipe.transform(ele_edit.ValidTill, "yyyy-MM-dd"))
                  element_new.Status = ele_edit.Status
                  element_new.CategoryType = tem_c;// element_new[tem_c.find(d=>d.Name)]
                }
              });
            });
            this.documentTbl = _.orderBy(this.documentTbl, ["DocumentNumber"], ["asc"]);
          }
          this.should_spin_onboarding = false;
        } catch (error) {
          this.should_spin_onboarding = false;
        }
      }), ((err) => {

      });

  }

  document_file_edit(item) {
    this.document_file_upload(item);
  }

  document_file_delete(item) {
    this.alertService.confirmSwal("Are you sure you want to delete this document?", "Do you really want to delete these document?  After you delete this item you will not able to get this!", "Yes, Delete").then(result => {
      try {
        item.CategoryType.forEach(element_doc => {
          var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id);
          if (doc != undefined && doc.Id != 0) {
            doc.Modetype = UIMode.Delete;
          }
          else {
            const index = this.lstDocumentDetails.indexOf(doc);
            this.lstDocumentDetails.splice(index, 1);
          }
        });

        let OldDocumentDetails = this._OldEmployeeDetails != null && this._OldEmployeeDetails.CandidateDocuments != null && this._OldEmployeeDetails.CandidateDocuments.length > 0 ? this._OldEmployeeDetails.CandidateDocuments : null;
        if (OldDocumentDetails != null) {
          let alreadyExists = OldDocumentDetails.find(a => a.DocumentId == item.DocumentId) != null ? true : false;
          if (alreadyExists == false) {
            this.deleted_DocumentIds_List.push({ Id: item.DocumentId });
          }
        }
        var table_doc = this.documentTbl.find(a => a.CandidateDocumentId == item.CandidateDocumentId && a.DocumentTypeId == item.DocumentTypeId);
        table_doc.DocumentId = null;
        table_doc.CandidateId = null;
        table_doc.CandidateDocumentId = null;
        table_doc.DeletedIds = null;
        table_doc.FileName = null;
        table_doc.DocumentNumber = null;
        table_doc.ValidFrom = null;
        table_doc.ValidTill = null;
        table_doc.Status = null;
        table_doc.ValidTill = null;
        table_doc.CategoryType.forEach(element => {
          element.isChecked = false;
        });

      } catch (error) {
        console.log('exceptions ', error);
      }

    }).catch(error => {

    });

  }



  document_file_upload(item) {
    let OldDocumentDetails = this._OldEmployeeDetails != null && this._OldEmployeeDetails.CandidateDocuments != null && this._OldEmployeeDetails.CandidateDocuments.length > 0 ? this._OldEmployeeDetails.CandidateDocuments : null;
    const modalRef = this.modalService.open(DocumentsModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.jsonObj = item;
    modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;

    var objStorageJson = JSON.stringify({ IsCandidate : true,  CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.result.then((result) => {

      if (result != "Modal Closed") {
        item.Status = result.Status;
        item.DocumentNumber = result.DocumentNumber;
        item.CategoryType = result.CategoryType;
        item.FileName = result.FileName;
        item.DocumentId = result.DocumentId;
        item.ValidTill = result.ValidTill;
        item.ValidFrom = result.ValidFrom;



        result.CategoryType.forEach(element_doc => {


          var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id && a.Modetype != UIMode.Delete);

          if (doc == null && element_doc.isChecked == true) {

            this.add_edit_document_details(result, element_doc, item, true)
          }
          if (doc != null && element_doc.isChecked == true) {

            // doc.Id = result.Id;
            doc.DocumentId = result.DocumentId;
            doc.DocumentNumber = result.DocumentNumber;
            doc.FileName = result.FileName;
            doc.ValidTill = result.ValidTill;
            doc.ValidFrom = result.ValidFrom;
            doc.Modetype = UIMode.Edit;
            doc.Status = doc.Status != ApprovalStatus.Approved ? ApprovalStatus.Pending : doc.Status;

          }
          if (doc != null && element_doc.isChecked == false) {

            let alreadyExists = OldDocumentDetails.find(a => a.DocumentId == result.DocumentId) != null ? true : false;
            if (alreadyExists) {
              doc.Modetype = UIMode.Delete;
            }
            else {
              const index = this.lstDocumentDetails.indexOf(doc);
              this.lstDocumentDetails.splice(index, 1);
            }

          }

        });



      }
    }).catch((error) => {
      console.log(error);
    });

  }
  // Candidate information details ** region begin **

  add_edit_document_details(result, element_doc, item, area: any) {

    if (area) {

      let ListDocumentList: CandidateDocuments = new CandidateDocuments();
      ListDocumentList.Id = 0;
      ListDocumentList.CandidateId = this.CandidateId != 0 ? this.CandidateId : 0;
      ListDocumentList.IsSelfDocument = true;
      ListDocumentList.DocumentId = result.DocumentId;
      ListDocumentList.DocumentCategoryId = element_doc.Id;
      ListDocumentList.DocumentTypeId = item.DocumentTypeId;
      ListDocumentList.DocumentNumber = result.DocumentNumber;
      ListDocumentList.FileName = result.FileName;
      ListDocumentList.ValidFrom = result.ValidFrom;
      ListDocumentList.ValidTill = result.ValidTill;
      ListDocumentList.Status = ApprovalStatus.Pending;
      ListDocumentList.IsOtherDocument = false;
      ListDocumentList.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
      ListDocumentList.DocumentCategoryName = "";
      ListDocumentList.StorageDetails = null;
      this.addCandidateDocumentList(ListDocumentList);

    }
    else {

      if (this.isGuid(result.Id) && !area) {

        let already_exists = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId) != null ? true : false;
        if (already_exists == false) {
        } else {

          let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)

          if (isexists != null) {

            // alert('xxx')
            // isexists.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
            // isexists.DocumentId = result.DocumentId;
            const index = this.lstDocumentDetails.indexOf(isexists);
            this.lstDocumentDetails.splice(index, 1);
          }



        }

      }
      else {

        let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)

        if (isexists != null) {


          isexists.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
          isexists.DocumentId = result.DocumentId;

        }
      }

    }

  }
  public async addCandidateDocumentList(listDocs) {
    await this.lstDocumentDetails.push(listDocs);
  }

  downloadDocs(item, whichdocs) {
    this.loadingScreenService.startLoading();
    this.fileuploadService.downloadObjectAsBlob(item.DocumentId)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          return;
        }
        saveAs(res, whichdocs == 'official' ? item.TemplateCategroyCode : item.DocumentTypeName);
        this.loadingScreenService.stopLoading();
      });
  }

  viewDocs(item, whichdocs) {
    $("#popup_viewDocs1").modal('show');
    this.documentURL = null;
    this.documentURLId = null;
    this.documentURLId = item.DocumentId;
    var contentType = whichdocs != 'official' ? this.fileuploadService.getContentType(item.FileName) : 'application/pdf';
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.fileuploadService.getObjectById(item.DocumentId)
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
      var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }
  }

  modal_dismiss_docs() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs1").modal('hide');
  }
  /* #endregion */

  public findInvalidControls() {
    this.invaid_fields = [];
    const invalid = [];
    const controls = this.candidatesForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        this.invaid_fields.push(name)
      }
    }
    console.log('invalid', invalid);
    this.invaid_fields = invalid;
    return this.invaid_fields;
  }


  clearListofItems() {

    this.lstAddressDetails = [];
    this.lstBankDetails = [];
    this.lstWorkPermitDetails = [];
    this.lstStatutoryDetails = [];
    this.lstContactDetails = [];
    this.lstRateSetDetails = [];
    this.lstCandidateOfferDetails = [];

  }

  doSaveOrSubmit(index: any): void {



    if (index == "Submit") {
      this.submitted = true;
      this.findInvalidControls();
      if (this.candidatesForm.invalid) {
        this.alertService.showWarning("Oops! Please fill in all required fields ")
        return;
      }

    }

    if (index == "Submit" && (this.candidatesForm.get('skillCategory').value == "" || this.candidatesForm.get('skillCategory').value == null || this.candidatesForm.get('zone').value == "" || this.candidatesForm.get('zone').value == null)) {
      this.alertService.showWarning("Skill Category and Zone details not found. Please contact support admin.")
      return;
    }


    if (index == "onlySave") {
      console.log(this.candidatesForm.get('email').valid);

      if ((this.candidatesForm.controls['clientName'].value == null) ||
        (this.candidatesForm.controls['clientContract'].value == null) ||
        (this.candidatesForm.controls['email'].value == "") ||
        (this.candidatesForm.controls['mobile'].value == "") ||
        (this.candidatesForm.controls['firstName'].value == "")
      ) {
        if (this.BusinessType == 3) {
          this.alertService.showWarning("Some information was missing. There were problems with the following fields : Client, Client Contract, Candidate Name, Email and Mobile number")
          return;
        } else {
          this.alertService.showWarning("Some information was missing. There were problems with the following fields : Candidate Name, Email and Mobile number")
          return;
        }

      }

      if ((this.candidatesForm.controls['mobile'].value).length != 10) {
        this.alertService.showWarning("Mobile Number should be minimum 10 characters")
        return;
      }


    }

    if ((this.candidatesForm.get('permanentCountryName').value == 100) && (this.candidatesForm.get('permanentStateName').value == 4)) {
      this.isAssamState = true;
    } else {
      this.isAssamState = false;

    }

    if (this.isOfferInfo && this.previewCTC && index == "Submit") {
      if (this._NewCandidateDetails.LstCandidateOfferDetails != null
        && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0
        && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null
        && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0
        && (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length == 0)) {
        this.alertService.showWarning("Oops! You must preview candidate CTC before submitting")
        return;
      }

    }


    if (this.isDocumentInfo && index == "Submit" && !this.utitlityService.isNullOrUndefined(this.candidatesForm.get('isDifferentlyabled').value) && this.candidatesForm.get('isDifferentlyabled').value == true) {
      if (this.candidatesForm.get('differentlyabledPercentage').value < 0 || this.candidatesForm.get('differentlyabledPercentage').value > 100) {
        this.alertService.showWarning("Spend some time to making your differently abled percentage.");
        return;
      }
      else if (this.candidatesForm.get('differentlyabledPercentage').value >= environment.environment.AmountOfDifferentlyabled && this.DocumentList != null && this.DocumentList.length > 0 && !this.utitlityService.isNullOrUndefined(this.DocumentList.find(a => a.IsDisablityProof == 0)) && this.DocumentList.find(a => a.IsDisablityProof == 0).DocumentId == null) {
        this.alertService.showWarning("You are required to upload a document for people with other abilities.");
        return;
      }
    }



    if (this.isDocumentInfo && index == "Submit") {
      let isdocsFiles = false;
      if (this.lstDocumentDetails.length != 0) {
        for (let index = 0; index < this.documentTbl.length; index++) {
          const element_new = this.documentTbl[index];

          if (element_new.IsMandatory == "True" && !this.isAssamState) {
            if (element_new.DocumentNumber == null || element_new.DocumentNumber == "") {
              const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
              parent.style.background = '#f9ecda'
              parent.style.borderLeft = '4px solid red'
              isdocsFiles = true;
              break;
            }
          }
          if (element_new.Status == ApprovalStatus.Rejected && this.ApprovalStatus) {
            this.alertService.showWarning(" There are some rejected file(s) in your  :) Document Details");
            return;
          }
        }
      }

      else if (!this.isAssamState) {
        this.alertService.showWarning(" This alert is to inform you about your pending documents.  :) Document Details");
        return;
      }

      if (isdocsFiles) {
        this.alertService.showWarning("This alert is to inform you about your pending documents.  :) Document Details");
        return;
      }


    }



    if (this.isBankInfo && index == "Submit" && this.LstBank.length == 0) {
      this.alertService.showWarning("Oops!  Please provide at least One Bank Details to confirm it. You cannot publish without Bank Details (minimum one detail is required)");
      return;
    }

    let rejectedBankList = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
    if (this.isBankInfo && rejectedBankList && this.ApprovalStatus) {
      this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Bank Information");
      return;
    }

    if (this.DOB != null) {
      var birth = new Date(this.DOB);
      var today = new Date(this.candidatesForm.get('ActualDOJ').value).toString() as any;
      today = new Date(today);
      console.log('today', today);
      var years = moment(birth).diff(today, 'years');
      console.log('years', years);;

      if (years.toString() < '-18') {
        this.alertService.showWarning("The action was blocked. We require candidate to be 18 years old or over. Please confirm your DOJ")
        return;
      }

    }

    this.sweetalertConfirm(index);

  }
  // confirmation dialog from sweet alert

  sweetalertConfirm(index: any): void {

    if (index == "Submit") {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true,
      })

      swalWithBootstrapButtons.fire({
        title: 'Confirm?',
        text: "Are you sure you want to proceed?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ok!',
        cancelButtonText: 'No, cancel!',
        allowOutsideClick: false,
        reverseButtons: true
      }).then((result) => {
        console.log(result);

        if (result.value) {

          this.triggerSaveOrSubmitAPI(index)

        } else if (result.dismiss === Swal.DismissReason.cancel) {

          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your request has been cancelled',
            'error'
          )
        }
      })
    } else {
      this.triggerSaveOrSubmitAPI(index)
    }


  }
  triggerSaveOrSubmitAPI(index: any) {

    try {
      this.loadingScreenService.startLoading();
      this.clearListofItems();
      if (this.CandidateId != 0) {

        // this.candidateDetails.Id = this._NewCandidateDetails.Id;
        // this.candidateDetails.LastUpdatedBy = this.UserId;
        // this.candidateOfferDetails = this._NewCandidateDetails.LstCandidateOfferDetails[0];
      }
      else {

        this.candidateDetails.Id = 0;
        this.candidateDetails.LastUpdatedBy = this.UserId;

      }

      this.candidatesForm.controls['firstName'] != null ? this.candidateDetails.FirstName = this.candidatesForm.get('firstName').value == null || this.candidatesForm.get('firstName').value == "" ? "" : this.candidatesForm.get('firstName').value : null;
      this.candidateDetails.LastName = "";
      this.candidatesForm.controls['gender'] != null ? this.candidateDetails.Gender = this.candidatesForm.get('gender').value == 1 ? Gender.Male : this.candidatesForm.get('gender').value == 2 ? Gender.Female : this.candidatesForm.get('gender').value == 3 ? Gender.TransGender : 0 : null;
      this.candidatesForm.controls['dateOfBirth'] != null ? this.candidateDetails.DateOfBirth = this.candidatesForm.get('dateOfBirth').value == null ? null : this.datePipe.transform(new Date(this.DOB).toString(), "yyyy-MM-dd") : null;

      this.candidatesForm.controls['isDifferentlyabled'] != null ? this.candidateDetails.IsDifferentlyabled = this.candidatesForm.get('isDifferentlyabled').value : null;
      this.candidatesForm.controls['differentlyabledPercentage'] != null ? this.candidateDetails.DisabilityPercentage = this.candidateDetails.IsDifferentlyabled == true ? this.candidatesForm.get('differentlyabledPercentage').value : 0 : null;
      this.candidatesForm.controls['nationality'] != null ? this.candidateDetails.Nationality = this.candidatesForm.get('nationality').value == 1 ? Nationality.Indian : Nationality.Non_Indian : null;
      this.candidatesForm.controls['country'] != null ? this.candidateDetails.CountryOfOrigin = this.candidateDetails.Nationality == 1 ? 1 : this.candidatesForm.get('country').value : null;
      this.candidatesForm.controls['bloodGroup'] != null ? this.candidateDetails.BloodGroup = this.candidatesForm.get('bloodGroup').value == null || this.candidatesForm.get('bloodGroup').value == "" ? 0 : this.candidatesForm.get('bloodGroup').value : null;
      this.candidatesForm.controls['maritialStatus'] != null ? this.candidateDetails.MaritalStatus = this.candidatesForm.get('maritialStatus').value == null || this.candidatesForm.get('maritialStatus').value == "" ? 0 : this.candidatesForm.get('maritialStatus').value : null;
      this.candidateDetails.Status = CandidateStatus.Active;
 

      this.candidatesForm.controls['workPermitType'] != null ? this.workPermitDetails.WorkPermitType = this.candidatesForm.get('workPermitType').value : null;
      this.candidatesForm.controls['isValidFrom'] != null ? this.workPermitDetails.ValidFrom = this.candidatesForm.get('isValidFrom').value : null;;
      this.candidatesForm.controls['isValidTill'] != null ? this.workPermitDetails.ValidTill = this.candidatesForm.get('isValidTill').value : null;;
      this.workPermitDetails.Modetype = UIMode.Edit;;
      this.workPermitDetails.Id = this.CandidateId != 0 ? (this._NewCandidateDetails != null && this._NewCandidateDetails.WorkPermits != null && this._NewCandidateDetails.WorkPermits.length > 0) ? this._NewCandidateDetails.WorkPermits[0].Id : 0 : 0;

      this.candidatesForm.controls['email'] != null ? this.candidateContactDetails.PrimaryEmail = this.candidatesForm.get('email').value : null;;
      this.candidatesForm.controls['mobile'] != null ? this.candidateContactDetails.PrimaryMobile = this.candidatesForm.get('mobile').value : null;;

      this.candidateContactDetails.PrimaryMobileCountryCode = this.countryCode;
      this.candidateContactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Personal;
      this.candidateOfferDetails.IsSelfRequest = true;
      this.candidateOfferDetails.RequestedBy = this.UserId;
      this.candidateOfferDetails.RequestType = RequestType.AL;
      this.candidateOfferDetails.OnBoardingType = OnBoardingType.Proxy;
      // this.candidateOfferDetails.Status = 1;
      this.candidateOfferDetails.Status = (this.Id != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].Status : OfferStatus.Active;
      this.candidateOfferDetails.FatherName = this.candidatesForm.get('fatherName').value;;
      this.candidateOfferDetails.ClientId = this.candidatesForm.get('clientName').value;
      this.candidateOfferDetails.ClientContractId = this.candidatesForm.get('clientContract').value == null || this.candidatesForm.get('clientContract').value == "" ? 0 : this.candidatesForm.get('clientContract').value;
      this.candidateOfferDetails.ClientContactId = this.candidatesForm.get('clientSPOC').value == null || this.candidatesForm.get('clientSPOC').value == "" ? 0 : this.candidatesForm.get('clientSPOC').value;
      this.candidateOfferDetails.IndustryId = this.candidatesForm.get('industryType').value == "" || this.candidatesForm.get('industryType').value == null ? 0 : this.candidatesForm.get('industryType').value;
      this.candidateOfferDetails.Location = this.candidatesForm.get('location').value;
      this.candidateOfferDetails.SkillCategory = this.candidatesForm.get('skillCategory').value == "" || this.candidatesForm.get('skillCategory').value == null ? 0 : this.candidatesForm.get('skillCategory').value;
      this.candidateOfferDetails.Designation = this.candidatesForm.get('designation').value;
      this.candidateOfferDetails.Zone = this.candidatesForm.get('zone').value == "" || this.candidatesForm.get('zone').value == null ? 0 : this.candidatesForm.get('zone').value;

      // this.candidatesForm.controls['monthlyAmount'] != null ? this.candidateOfferDetails.MonthlyBillingAmount = this.candidatesForm.get('monthlyAmount').value == "" || this.candidatesForm.get('monthlyAmount').value == null ? 0 : this.candidatesForm.get('annualSalary').value : null;
      this.candidateOfferDetails.ModuleTransactionId = (this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId : 0;
      this.candidateOfferDetails.Modetype = UIMode.Edit;;
      this.candidateOfferDetails.Id = this.CandidateId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].Id : 0 : 0;
      if (this._NewCandidateDetails != null) {
        this.candidateOfferDetails.AcceptanceStatus = this.CandidateId != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != 0 as any && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus : 0;
        this.candidateOfferDetails.AcceptanceRemarks = this.CandidateId != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks : null;
      }

      this.candidateOfferDetails.EmploymentType = this.EmploymentTypeList.length > 0 && this.EmploymentTypeList.find(a=>a.Code.toUpperCase() == "VENDOR") != undefined && this.EmploymentTypeList.find(a=>a.Code.toUpperCase() == "VENDOR").Id; // harcoded value
      this.candidateOfferDetails.State = this.StateId;
      this.candidateOfferDetails.CityId = this.CityId;
      this.candidateOfferDetails.IsFresher = false;
      this.candidateOfferDetails.SourceType = SourceType.Transfer;
      // this.candidateOfferDetails.IsRateSetValid = this.isRateSetValid;

      this.candidatesForm.controls['salaryType'] != null ? this.candidateRateSetDetails.SalaryBreakUpType = this.candidatesForm.get('salaryType').value == null ? 0 : this.candidatesForm.get('salaryType').value : null;
      this.candidatesForm.controls['paystructure'] != null ? this.candidateRateSetDetails.PayGroupdId = this.candidatesForm.get('paystructure').value == null ? 0 : this.candidatesForm.get('paystructure').value : null;
      this.candidateRateSetDetails.MonthlySalary = this.candidatesForm.get('MonthlySalary').value == null || this.candidatesForm.get('MonthlySalary').value == "" ? 0 : this.candidatesForm.get('MonthlySalary').value;
      this.candidateRateSetDetails.IsMonthlyValue = false;// this.candidatesForm.get('forMonthlyValue').value : null;
      this.candidateRateSetDetails.PaymentType = this.candidatesForm.get('paymentType').value == null ? 0 : this.candidatesForm.get('paymentType').value
      this.candidateRateSetDetails.PayableRate = (this.candidatesForm.get('payableRate').value == null || this.candidatesForm.get('payableRate').value == "") ? 0 : this.candidatesForm.get('payableRate').value
      this.candidateRateSetDetails.BillableRate = (this.candidatesForm.get('billableRate').value == null || this.candidatesForm.get('billableRate').value == "") ? 0 : this.candidatesForm.get('billableRate').value
      this.candidateRateSetDetails.AnnualSalary = this.candidatesForm.get('annualSalary').value;

      this.candidateRateSetDetails.Modetype = UIMode.Edit;;
      this.candidateRateSetDetails.Status = 1;
      this.candidateRateSetDetails.Id = this.CandidateId != 0 ? (this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null
        && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].Id : 0 : 0;

      this.candidateRateSetDetails.LstRateSet = null;
      this.candidateOfferDetails.Aadhaar = this.candidatesForm.get('aadhaarNumber').value;


      this.candidatesForm.controls['PANNO'] != null ? this.candidateStatutoryDetails.PAN = this.candidatesForm.get('PANNO').value : null;
      this.candidatesForm.controls['ActualDOJ'] != null && this.candidatesForm.controls['ActualDOJ'] != undefined ? this.candidateOfferDetails.ActualDateOfJoining = this.candidatesForm.get('ActualDOJ').value == null ? null : this.datePipe.transform(new Date(this.candidatesForm.get('ActualDOJ').value).toString(), "yyyy-MM-dd") : null;
      this.candidatesForm.controls['ActualDOJ'] != null && this.candidatesForm.controls['ActualDOJ'] != undefined ? this.candidateOfferDetails.DateOfJoining = this.candidatesForm.get('ActualDOJ').value == null ? null : this.datePipe.transform(new Date(this.candidatesForm.get('ActualDOJ').value).toString(), "yyyy-MM-dd") : null;
      this.candidatesForm.controls['TeamId'] != null ? this.candidateOfferDetails.TeamId = this.candidatesForm.get('TeamId') != null && this.candidatesForm.get('TeamId').value != null ? this.candidatesForm.get('TeamId').value : 0 : null;

      this.candidateOfferDetails.AppointmentLetterTemplateId = (this.candidatesForm.get('AppointmentLetterTemplateId').value == null || this.candidatesForm.get('AppointmentLetterTemplateId').value == "") ? 0 : this.candidatesForm.get('AppointmentLetterTemplateId').value;
      // this.candidatesForm.controls['PANNO'] != null ? this.candidateStatutoryDetails.aadhaa = this.candidatesForm.get('PANNO').value : null;
      if (this.candidatesForm.controls['salaryType'] != null && this.candidatesForm.get('salaryType').value != null) {
        if (this.candidateRateSetDetails.LstRateSet != null && this.candidateRateSetDetails.LstRateSet.length > 0) {
          var _CTC = this.candidateRateSetDetails.LstRateSet.find(s => s.ProductCode == 'CTC').Value;
          this.candidatesForm.controls['AnnualCTC'] != null ? this.candidateRateSetDetails.AnnualCTC = (_CTC * 12) : true;
          this.candidatesForm.controls['MonthlyCTC'] != null ? this.candidateRateSetDetails.MonthlyCTC = (_CTC) : true;

          var _NetPay = this.candidateRateSetDetails.LstRateSet.find(s => s.ProductCode == 'NetPay').Value;
          this.candidatesForm.controls['AnnualNTH'] != null ? this.candidateRateSetDetails.AnnualNTH = (_NetPay * 12) : true;
          this.candidatesForm.controls['MonthlyNTH'] != null ? this.candidateRateSetDetails.MonthlyNTH = (_NetPay) : true;

          var _Gross = this.candidateRateSetDetails.LstRateSet.find(s => s.ProductCode == 'GrossEarn').Value;
          this.candidatesForm.controls['AnnualGross'] != null ? (this.candidateRateSetDetails.AnnualGross = (_Gross * 12)) : true;
          this.candidatesForm.controls['MonthlyGross'] != null ? (this.candidateRateSetDetails.MonthlyGross = (_Gross)) : true;

        }

        this.candidatesForm.controls['annualSalary'] != null ? this.candidateRateSetDetails.AnnualSalary = (this.candidatesForm.get('annualSalary').value == null || this.candidatesForm.get('annualSalary').value == "")
          ? 0 : this.candidatesForm.get('annualSalary').value : null;

      } else {
        this.candidatesForm.controls['annualSalary'] != null ? this.candidateRateSetDetails.AnnualSalary = (this.candidatesForm.get('annualSalary').value == null || this.candidatesForm.get('annualSalary').value == "")
          ? 0 : this.candidatesForm.get('annualSalary').value : null;

      }

      if ((this.BusinessType == 1 || this.BusinessType == 2)) {
        this.candidateRateSetDetails.LstRateSet = this._NewCandidateDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null ?
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet :

          this.candidatesForm.get('sourceType').value == 2 && this._NewCandidateDetails.Id != undefined &&
            this._NewCandidateDetails.LstCandidateOfferDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0
            ? (

              this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet

            ) : null
      }
      else {
        this.candidateRateSetDetails.LstRateSet = this.Id != 0 && this._NewCandidateDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0 ?
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet :
          this.candidatesForm.get('sourceType').value == 2 && this._NewCandidateDetails.Id != undefined &&
            this._NewCandidateDetails.LstCandidateOfferDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0
            ? (

              this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet

            ) : null

      }

      /* #region  Communication Details  */
      this.lstAddressDetails.push({
        Address1: this.candidatesForm.controls['presentAddressdetails'] != null ? this.candidatesForm.get('presentAddressdetails').value : null,
        Address2: this.candidatesForm.controls['presentAddressdetails1'] != null ? this.candidatesForm.get('presentAddressdetails1').value : null,
        Address3: this.candidatesForm.controls['presentAddressdetails2'] != null ? this.candidatesForm.get('presentAddressdetails2').value : null,
        CountryName: this.candidatesForm.controls['presentCountryName'] != null ? this.candidatesForm.get('presentCountryName').value : null,
        StateName: this.candidatesForm.controls['presentStateName'] != null ? this.candidatesForm.get('presentStateName').value : null,
        City: this.candidatesForm.controls['presentCity'] != null ? this.candidatesForm.get('presentCity').value : null,
        PinCode: this.candidatesForm.controls['presentPincode'] != null ? this.candidatesForm.get('presentPincode').value : null,
        CommunicationCategoryTypeId: this.candidatesForm.controls['presentAddressdetails'] != null ? CommunicationCategoryType.Present : null
      })
      this.lstAddressDetails.push({
        Address1: this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.get('permanentAddressdetails').value : null,
        Address2: this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.get('permanentAddressdetails1').value : null,
        Address3: this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.get('permanentAddressdetails2').value : null,
        CountryName: this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.get('permanentCountryName').value : null,
        StateName: this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.get('permanentStateName').value : null,
        City: this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.get('permanentCity').value : null,
        PinCode: this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.get('permanentPincode').value : null,
        CommunicationCategoryTypeId: this.candidatesForm.controls['permanentAddressdetails'] != null ? CommunicationCategoryType.Permanent : null
      })
      this.candidateCommunicationDetails.LstAddressdetails = this.lstAddressDetails;
      // this.candidateCommunicationDetails.Id = 0;
      if (this._NewCandidateDetails != null && this._NewCandidateDetails.CandidateCommunicationDtls != null) {

        if (this._NewCandidateDetails.CandidateCommunicationDtls.Id != null) {
          this.candidateCommunicationDetails.Id = this._NewCandidateDetails.CandidateCommunicationDtls.Id;
        }
      } else {
        this.candidateCommunicationDetails.Id = 0;
      }
      // this.candidateCommunicationDetails.Id = this.Id != 0 ? this._NewCandidateDetails.CandidateCommunicationDtls != null &&  this._NewCandidateDetails.CandidateCommunicationDtls.Id != null ? 0 : this._NewCandidateDetails.CandidateCommunicationDtls.Id : 0;


      /* #endregion */
      /* #region  Bank information */


      this.LstBank.forEach(element => {

        var candidateBankDetails = new CandidateBankDetails();

        candidateBankDetails.BankId = element.bankName;
        candidateBankDetails.BankBranchId = element.IFSCCode;
        candidateBankDetails.AccountNumber = element.accountNumber;
        candidateBankDetails.AccountHolderName = element.accountHolderName;
        candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;

        candidateBankDetails.IdentifierValue = element.bankBranchId;
        candidateBankDetails.SalaryContributionPercentage = element.allocation;
        candidateBankDetails.IsDefault = true;
        candidateBankDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
        // this.candidateBankDetails.Modetype =  UIMode.Edit;;
        candidateBankDetails.Modetype = element.Modetype,
          candidateBankDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          candidateBankDetails.CandidateDocument = element.CandidateDocument
        candidateBankDetails.VerificationMode = element.VerificationMode
        candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        candidateBankDetails.PayoutLogId = element.PayoutLogId
        candidateBankDetails.Remarks = element.Remarks

        this.lstBankDetails.push(

          candidateBankDetails
        )

      });

      this.deletedLstBank.forEach(element => {


        var candidateBankDetails = new CandidateBankDetails();

        candidateBankDetails.BankId = element.bankName;
        candidateBankDetails.BankBranchId = element.IFSCCode;
        candidateBankDetails.AccountNumber = element.accountNumber;
        candidateBankDetails.AccountHolderName = element.accountHolderName;
        candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;

        candidateBankDetails.IdentifierValue = element.bankBranchId;
        candidateBankDetails.SalaryContributionPercentage = element.allocation;
        candidateBankDetails.IsDefault = true;
        candidateBankDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
        // this.candidateBankDetails.Modetype =  UIMode.Edit;;
        candidateBankDetails.Modetype = element.Modetype,
          candidateBankDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          candidateBankDetails.CandidateDocument = element.CandidateDocument
        candidateBankDetails.VerificationMode = element.VerificationMode
        candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        candidateBankDetails.PayoutLogId = element.Payout
        this.lstBankDetails.push(

          candidateBankDetails
        )

      });

      this.candidateDetails.LstCandidateBankDetails = this.lstBankDetails;


      /* #endregion */


      /* #endregion  document details*/


      this.lstDocumentDetails.forEach(element => {
        element.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
      });

      console.log('CANDIDATE DOCUMENTS :', this.lstDocumentDetails);
      var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
      isAadhaarExists != undefined && ((isAadhaarExists.DocumentNumber != undefined && isAadhaarExists.DocumentNumber != null ? this.candidateOfferDetails.Aadhaar = Number(isAadhaarExists.DocumentNumber) : true));

      var isPANNOExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.PANDocumentTypeId && a.DocumentCategoryId != 0)
      isPANNOExists != undefined && (this.candidateOfferDetails.IsPANExists = true, (isPANNOExists.DocumentNumber != undefined && isPANNOExists.DocumentNumber != null ? this.candidateStatutoryDetails.PAN = (isPANNOExists.DocumentNumber) : true));


      this.candidateDetails.LstCandidateDocuments = this.lstDocumentDetails;


      /* #endregion */


      this.lstCandidateOfferDetails.push(this.candidateOfferDetails);
      if (this.candidateDetails.Nationality != 1) {

        this.lstWorkPermitDetails.push(this.workPermitDetails);

      }
      if (this.candidateStatutoryDetails.PAN != "" || this.candidateStatutoryDetails.PFNumber != "" || this.candidateStatutoryDetails.UAN != "" || this.candidateStatutoryDetails.ESICNumber != "") {

        this.lstStatutoryDetails.push(this.candidateStatutoryDetails);
      }

      this.lstContactDetails.push(this.candidateContactDetails);

      this.lstRateSetDetails.push(this.candidateRateSetDetails);

      this.candidateDetails.WorkPermits = this.lstWorkPermitDetails;
      this.candidateDetails.LstCandidateOfferDetails = this.lstCandidateOfferDetails;
      // this.IsReOffer == true ? this.candidateDetails.LstCandidateOfferDetails[0].Id = 0 : null;

      // this.candidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL = false;
      // this.candidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL = false;

      this.candidateCommunicationDetails.LstContactDetails = this.lstContactDetails;
      this.candidateCommunicationDetails.Modetype = UIMode.Edit;

      this.candidateOtherDetails.Modetype = UIMode.Edit;;
      this.candidateOtherDetails.Id = (this.CandidateId != 0 && this._NewCandidateDetails.CandidateOtherData != null) ? this._NewCandidateDetails.CandidateOtherData.Id : 0;
      this.candidateOtherDetails.LstCandidateStatutoryDtls = (this.lstStatutoryDetails.length != 0 ? this.lstStatutoryDetails : null);


      this.candidateOfferDetails.LstCandidateRateSet = this.lstRateSetDetails;
      this.candidateDetails.CandidateOtherData = this.candidateOtherDetails;
      this.candidateDetails.CandidateCommunicationDtls = this.candidateCommunicationDetails;
      console.log('reactiveForm', this.candidateDetails);
      // this.loadingScreenService.stopLoading();
      // return; 

      if (this.CandidateId != 0) {

        this.candidateDetails.Modetype = UIMode.Edit;
        this.candidateModel.NewCandidateDetails = this.candidateDetails;

      }
      else {
        this.candidateDetails.Modetype = UIMode.None;
        this.candidateModel = _CandidateModel;
        this.candidateModel.NewCandidateDetails = this.candidateDetails;

      }
      let candidate_req_json = this.candidateModel;
      this.onboardingService.putCandidate(JSON.stringify(candidate_req_json)).subscribe((data: any) => {
        this.loadingScreenService.stopLoading();
        let apiResponse: apiResponse = data;
        try {
          if (apiResponse.Status) {


            if (index == "Submit") {
              this.loadingScreenService.startLoading();

              this.candidateModel = apiResponse.dynamicObject;
              let _NewCandidateDetails: CandidateDetails = this.candidateModel.NewCandidateDetails;

              this.workFlowInitiation.Remarks = "";
              this.workFlowInitiation.EntityId = _NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
              this.workFlowInitiation.EntityType = EntityType.CandidateDetails;
              this.workFlowInitiation.CompanyId = this.CompanyId;
              this.workFlowInitiation.ClientContractId = _NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId;
              this.workFlowInitiation.ClientId = _NewCandidateDetails.LstCandidateOfferDetails[0].ClientId;

              this.workFlowInitiation.ActionProcessingStatus = 4000;
              this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
              this.workFlowInitiation.WorkFlowAction = 1;
              this.workFlowInitiation.RoleId = this.RoleId;
              this.workFlowInitiation.DependentObject = (this.candidateModel.NewCandidateDetails);
              this.workFlowInitiation.UserInterfaceControlLst = this.accessControl_submit;

              this.finalSubmit(this.workFlowInitiation, "submit");
            }
            else {

              if (this.deleted_DocumentIds_List.length > 0) {
                this.deleted_DocumentIds_List.forEach(e => {
                  this.doDeleteFile(e.Id, e);
                });
              }

              var dynamicobj = {} as any;
              dynamicobj = (apiResponse.dynamicObject);
              var objString = dynamicobj["NewCandidateDetails"];
              this._NewCandidateDetails = dynamicobj["NewCandidateDetails"];
              this.Id = Number(objString.Id);
              this.candidateModel = (apiResponse.dynamicObject);
              console.log('NEW CANDIDATE :', this._NewCandidateDetails);
              this.loadingScreenService.stopLoading();

              this.alertService.showSuccess("Your details has been saved successfully!");
              this.router.routeReuseStrategy.shouldReuseRoute = () => false;
              this.router.onSameUrlNavigation = 'reload';
              let _CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
              this.router.navigate(['app/onboarding/vendorOnboarding'], {
                queryParams: {
                  "Idx": btoa(this.Id.toString()),
                  "Cdx": btoa(_CandidateId.toString()),
                }
              });
              this.LstBank = [];
              this.alertService.confirmSwal("Are you sure you want to navigate away from this page?", "The data was saved successfully, Press OK to continue, or Cancel to stay on the current page.", "Yes, OK").then(result => {
                // this._location.back();
                var path = (this.RoleCode == 'OpsMember' || this.RoleCode == 'PayrollOps') ? '/app/onboarding/onboarding_ops' : '/app/onboarding/onboarding_ops' // localStorage.getItem('previousPath');
                this.router.navigateByUrl(path);
              })
                .catch(error => {

                });

            // this.alertService.showSuccess("Your details has been saved successfully!");
            // this.router.navigateByUrl('/app/onboarding/onboarding_ops');
            // this.router.navigate(['app/onboarding/vendorOnboarding'], {
            //   queryParams: {
            //     "Idx": btoa(this.Id.toString()),
            //     "Cdx": btoa(this.Id.toString()),
            //   }
            // });
            
              }
            }
          else {

            this.alertService.showWarning("Failed!   Vendor save wasn't completed " + apiResponse.Message != null ? apiResponse.Message : ''), this.loadingScreenService.stopLoading()
          };
        } catch (error) {

          { this.alertService.showWarning(error + " Failed!   Vendor save wasn't completed "), this.loadingScreenService.stopLoading() };
        }

      },
        (err) => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! :  ", err);

        });
      // }
    } catch (error) {

      { this.alertService.showWarning(error + " Failed!   Vendor save wasn't completed"), this.loadingScreenService.stopLoading() };

    }
  }

  
  finalSubmit(workFlowJsonObj: WorkFlowInitiation, fromWhich: any): void {

    console.log(workFlowJsonObj);
    this.onboardingService.postWorkFlow(JSON.stringify(workFlowJsonObj)).subscribe((response) => {

      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
        
            this.loadingScreenService.stopLoading();
            // this._location.back();
            var path = (this.RoleCode == 'OpsMember' || this.RoleCode == 'PayrollOps') ? '/app/onboarding/onboarding_ops' : '/app/onboarding/onboarding_ops' // localStorage.getItem('previousPath');
            this.router.navigateByUrl(path);
            this.alertService.showSuccess(`Your Vendor has been ${fromWhich == "submit" ? "submitted" : "rejected"} successfully! ` + apiResult.Message != null ? apiResult.Message : '');


        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to ${fromWhich == "submit" ? "submission" : "reject"}!  ` + apiResult.Message != null ? apiResult.Message : '');

        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to ${fromWhich == "submit" ? "submission" : "reject"}!` + error);

      }


    }), ((error) => {

    });


  }
  /* #region  common methods */

  doDeleteFile(Id, element) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var candidateDocumentDelete = [];
        this.fileuploadService.deleteObjectStorage((Id)).subscribe((res) => {
          if (res.Status) {
            if (this.unsavedDocumentLst.length > 0) {
              var index = this.unsavedDocumentLst.map(function (el) {
                return el.Id
              }).indexOf(Id);

              this.unsavedDocumentLst.splice(index, 1);

            }

            resolve(true);
          } else {
            reject();
          }
          console.log('aysnc funciond delte');
        }), ((err) => {
          reject();
        })


      }, 1000);
    });
    // return promise;
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }
  /* #endregion */



  //-----------------------------------------------------------------//

  _load_SME_Properties() {
    console.log('Cleint id ', this.ClientId);

    if (this.BusinessType != 3) {
      this.ClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
      if (this.ClientId != null && this.ClientId != undefined) {
        this.ClientContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
        this.refreshContractAndContact(this.ClientId);
        this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this.ClientContractId) : null;
        let _clientIdAsNum = parseFloat(this.ClientId);
        this.candidatesForm.controls['clientName'].setValue(_clientIdAsNum);

      }

    }
  }

  // Pre laoding api calls for edit
  do_Edit() {


    let req_param_uri = `Id=${this.CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingService.getCandidate(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      if (apiResponse.Status) {
        this.candidateModel = (apiResponse.dynamicObject);
        this._NewCandidateDetails = this.candidateModel.NewCandidateDetails;
        this._OldCandidateDetails = this.candidateModel.OldCandidateDetails;
        console.log('test', this.candidateModel);

        this.DataBinding_for_Edit();
      }
      else {

        this.alertService.showWarning(`Something is wrong!  ${apiResponse.Message}`);

      }
    },
      (err) => {
        this.alertService.showWarning(`Something is wrong!  ${err}`);
      });
  }

  DataBinding_for_Edit(): void {


    // this.isDocumentInfo == true ? this.doCheckAccordion("isDocumentInfo") : null;

    this.candidateDetails = this._NewCandidateDetails;
    this.OldcandidateOfferDetails[0] = this._NewCandidateDetails.LstCandidateOfferDetails;
    this.ApprovalStatus = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus == ApprovalStatus.Rejected ? true : false;

    this.candidatesForm.controls['firstName'].setValue(this._NewCandidateDetails.FirstName);
    this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(this._NewCandidateDetails.Gender == null ? null : this._NewCandidateDetails.Gender) : null;
    this.candidatesForm.controls['dateOfBirth'] != null ? this.candidatesForm.controls['dateOfBirth'].setValue((this._NewCandidateDetails.DateOfBirth == null ? null : this.datePipe.transform(new Date(this._NewCandidateDetails.DateOfBirth).toString(), "dd-MM-yyyy"))) : null;
    this.DOB = this._NewCandidateDetails != null && this._NewCandidateDetails.DateOfBirth != null ? this._NewCandidateDetails.DateOfBirth : null;
    this.candidatesForm.controls['isDifferentlyabled'] != null ? this.candidatesForm.controls['isDifferentlyabled'].setValue(this._NewCandidateDetails.IsDifferentlyabled) : null;
    this.candidatesForm.controls['differentlyabledPercentage'] != null ? this.candidatesForm.controls['differentlyabledPercentage'].setValue(this._NewCandidateDetails.DisabilityPercentage) : null;
    this.candidatesForm.controls['nationality'] != null ? this.candidatesForm.controls['nationality'].setValue(this._NewCandidateDetails.Nationality) : null;
    this.candidatesForm.controls['country'] != null ? this.candidatesForm.controls['country'].setValue(this._NewCandidateDetails.CountryOfOrigin) : null;
    this.candidateDetails.Status = CandidateStatus.Active;
    this.candidateDetails.Modetype = UIMode.Edit;
    if (this._NewCandidateDetails.WorkPermits != null && this._NewCandidateDetails.WorkPermits.length > 0) {
      this.candidatesForm.controls['workPermitType'] != null ? this.candidatesForm.controls['workPermitType'].setValue(this._NewCandidateDetails.WorkPermits.length != 0 ? this._NewCandidateDetails.WorkPermits[0].WorkPermitType : 0) : null;
      this.candidatesForm.controls['isValidFrom'] != null ? this.candidatesForm.controls['isValidFrom'].setValue(this._NewCandidateDetails.WorkPermits.length != 0 && this._NewCandidateDetails.WorkPermits[0].ValidFrom != "0001-01-01T00:00:00" ? new Date(this._NewCandidateDetails.WorkPermits[0].ValidFrom) : null) : null;
      this.candidatesForm.controls['isValidTill'] != null ? this.candidatesForm.controls['isValidTill'].setValue(this._NewCandidateDetails.WorkPermits.length != 0 && this._NewCandidateDetails.WorkPermits[0].ValidTill != "0001-01-01T00:00:00" ? new Date(this._NewCandidateDetails.WorkPermits[0].ValidTill) : null) : null;
    }
    if (this._NewCandidateDetails.CandidateCommunicationDtls != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.length > 0) {
      this.candidatesForm.controls['email'] != null ? this.candidatesForm.controls['email'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails[0].PrimaryEmail) : null;
      this.candidatesForm.controls['mobile'] != null ? this.candidatesForm.controls['mobile'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails[0].PrimaryMobile) : null;
      this.countryCode = this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails[0].PrimaryMobileCountryCode;
    }

    if (this._NewCandidateDetails.LstCandidateOfferDetails != null) {

      // (this._NewCandidateDetails.LstCandidateOfferDetails[0].IsSelfRequest == false ? this.onC("onbehalfof") : null)
      // For Onbaording accordion  (Edit)

      this.candidatesForm.controls['requestBy'] != null ? this.candidatesForm.controls['requestBy'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsSelfRequest == true ? "self" : "onbehalfof") : null;
      this.candidatesForm.controls['recruiterName'] != null ? this.candidatesForm.controls['recruiterName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsSelfRequest == true ? this.UserId : this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestedBy) : null;
      this.candidatesForm.controls['requestFor'] != null ? this.candidatesForm.controls['requestFor'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType == 1 ? "OL" : "AL") : null;
      this.candidatesForm.controls['onboardingType'] != null ? this.candidatesForm.controls['onboardingType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].OnBoardingType == 1 ? "flash" : "proxy") : null;
      this.candidatesForm.controls['fatherName'] != null ? this.candidatesForm.controls['fatherName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].FatherName) : null;
      // this.candidatesForm.controls['isOLcandidateacceptance'] != null ? this.candidatesForm.controls['isOLcandidateacceptance'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL : false) : false;
      // this.candidatesForm.controls['isAlaccept'] != null ? this.candidatesForm.controls['isAlaccept'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL : false) : false;

      this.ClientId = this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId; // 3rd Party
      this.candidatesForm.controls['onBehalfRemarks'] != null ? this.candidatesForm.controls['onBehalfRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamProxyRequest) : null;
      this.candidatesForm.controls['proxyRemarks'] != null ? this.candidatesForm.controls['proxyRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ProxyRemarks) : null;
      this.candidatesForm.controls['clientName'] != null ? this.candidatesForm.controls['clientName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId) : null;
      this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId) : null;
      this.ClientContractId = (this.candidatesForm.get('clientContract').value);


 

      this.candidatesForm.controls['mandateName'] != null ? this.candidatesForm.controls['mandateName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId) : null;
      this.candidatesForm.controls['candidateName'] != null ? this.candidatesForm.controls['candidateName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId) : null;
      this.candidatesForm.controls['clientSPOC'] != null ? this.candidatesForm.controls['clientSPOC'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId) : null;
      this.candidatesForm.controls['onApprovalType'] != null ? this.candidatesForm.controls['onApprovalType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsClientApprovedBasedOn == 1 ? "online" : "attachment") : null;
      this.candidatesForm.controls['sourceType'] != null ? this.candidatesForm.controls['sourceType'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType != 0 as any) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType : null) : null;
      // this.candidatesForm.controls['sourceType'].setValue(1);
      // For Offer Information accordion (Edit)
      this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.controls['industryType'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId) == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId) : null;
      this.candidatesForm.controls['location'] != null ? this.candidatesForm.controls['location'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Location) : null;
      this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory) : null;
      this.candidatesForm.controls['designation'] != null ? this.candidatesForm.controls['designation'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation) : null;
      this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone) : null;
      this.candidatesForm.controls['Remarks'] != null ? this.candidatesForm.controls['Remarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SalaryRemarks) : null;

      if (this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType == 1) {
        this.DateOfJoining = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining != "0001-01-01T00:00:00" ? this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining : null;
      } else {
        this.DateOfJoining = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != "0001-01-01T00:00:00" ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining : null;
      }
      this.candidatesForm.controls['insuranceplan'] != null ? this.candidatesForm.controls['insuranceplan'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].InsurancePlan) : null;

      this.candidatesForm.controls['Gmc'] != null ? this.candidatesForm.controls['Gmc'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount) : 0;
      this.candidatesForm.controls['Gpa'] != null ? this.candidatesForm.controls['Gpa'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount) : 0;
      this.candidatesForm.controls['NoticePeriod'] != null ? this.candidatesForm.controls['NoticePeriod'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays) : null;
      this.candidatesForm.controls['expectedDOJ'] != null ? this.candidatesForm.controls['expectedDOJ'].setValue((this.datePipe.transform(this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining, "dd-MM-yyyy"))) : null;
      // if (this.candidatesForm.controls['expectedDOJ'].value == "01-01-0001") {
      //   this.candidatesForm.controls['expectedDOJ'].setValue(null);
      // }
      this.candidatesForm.controls['aadhaarNumber'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Aadhaar);
      this.candidatesForm.controls['tenureType'] != null ? this.candidatesForm.controls['tenureType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType == null || (this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType == -1 as any) ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType) : null;
      this.candidatesForm.controls['tenureEndate'] != null ? this.candidatesForm.controls['tenureEndate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate) : null) : null;
      this.candidatesForm.controls['tenureMonth'] != null ? this.candidatesForm.controls['tenureMonth'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval : null) : null;
      var tenureEvent = {
        id: 0
      }
      this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.controls['tenureType'] != undefined ? tenureEvent.id = (this.candidatesForm.get('tenureType').value == null || this.candidatesForm.get('tenureType').value == -1 ? null : this.candidatesForm.get('tenureType').value) : null;
      // this.candidatesForm.controls['tenureType'] != null && this.onchangeTenureValidation(tenureEvent);

      this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidatesForm.controls['onCostInsuranceAmount'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance != null || this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance != "" as any) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance : null) : null;
      this.candidatesForm.controls['fixedDeductionAmount'] != null ? this.candidatesForm.controls['fixedDeductionAmount'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].FixedInsuranceDeduction) : null;
      this.candidatesForm.controls['monthlyAmount'] != null ? this.candidatesForm.controls['monthlyAmount'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount) : null;

      this.candidatesForm.controls['ActualDOJ'] != null ? this.candidatesForm.controls['ActualDOJ'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining) : null) : null;
      // if (this.candidatesForm.controls['ActualDOJ'].value == "01-01-0001") {
      //   this.candidatesForm.controls['ActualDOJ'].setValue(null);
      // }


      // this.candidatesForm.controls['EffectivePayPeriod'] != null ? this.candidatesForm.controls['EffectivePayPeriod'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId : null) : null;
      this.candidatesForm.controls['TeamId'] != null ? this.candidatesForm.controls['TeamId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null) : null;
      // this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId : null) : null;
      // this.candidatesForm.controls['LeaveGroupId'] != null ? this.candidatesForm.controls['LeaveGroupId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId : null) : null;
      // this.candidatesForm.controls['CostCodeId'] != null ? this.candidatesForm.controls['CostCodeId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId : null) : null;
      this.candidatesForm.controls['AppointmentLetterTemplateId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId : null)
      this.candidatesForm.controls['employmentType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType != 0 as any ? this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType : null)

      this.StateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].State;
      this.CityId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CityId;
      // this.isRateSetValid = true;
      this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = true;
      // this.IsMinimumwageAdhere = this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere;
      if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
        this.candidatesForm.controls['salaryType'] != null ? this.candidatesForm.controls['salaryType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType == 0 as any || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType) : null;

        this.candidatesForm.controls['annualSalary'] != null ? this.candidatesForm.controls['annualSalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary) : null;
        this.candidatesForm.controls['paystructure'] != null ? this.candidatesForm.controls['paystructure'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId) : null;
        this.candidatesForm.controls['MonthlySalary'] != null ? this.candidatesForm.controls['MonthlySalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary) : null;
        this.candidatesForm.controls['forMonthlyValue'] != null ? this.candidatesForm.controls['forMonthlyValue'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].IsMonthlyValue) : null;
        this.isESICapplicable = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;
        this.candidatesForm.controls['paymentType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PaymentType);
        this.candidatesForm.controls['payableRate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayableRate);
        this.candidatesForm.controls['billableRate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].BillableRate);
      }
      this.candidatesForm.controls['letterTemplate'] != null ? this.candidatesForm.controls['letterTemplate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId : null) : null;

      // For Candidate other details accordion (Edit)
      this.candidatesForm.controls['isAadharExemptedState'] != null ? this.candidatesForm.controls['isAadharExemptedState'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsAadhaarExemptedState) : null;
      this.candidatesForm.controls['isPANNoExists'] != null ? this.candidatesForm.controls['isPANNoExists'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsPANExists) : null;
      this.candidatesForm.controls['haveApplied'] != null ? this.candidatesForm.controls['haveApplied'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsPanApplied) : null;
      this.candidatesForm.controls['ackowledgmentNumber'] != null ? this.candidatesForm.controls['ackowledgmentNumber'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].PANAckowlegementNumber) : null;
      this.candidatesForm.controls['bloodGroup'] != null ? this.candidatesForm.controls['bloodGroup'].setValue(this._NewCandidateDetails.BloodGroup) : null;
      this.candidatesForm.controls['maritialStatus'] != null ? this.candidatesForm.controls['maritialStatus'].setValue(this._NewCandidateDetails.MaritalStatus) : null;

    }
    if (this._NewCandidateDetails.CandidateOtherData != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls.length > 0) {
      this.candidatesForm.controls['PANNO'] != null ? this.candidatesForm.controls['PANNO'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PAN) : null;
      this.candidatesForm.controls['UAN'] != null ? this.candidatesForm.controls['UAN'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].UAN) : null;
      // this.candidatesForm.controls['PFNumber'] != null ? this.candidatesForm.controls['PFNumber'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PFNumber) : null;
      this.candidatesForm.controls['ESICNumber'] != null ? this.candidatesForm.controls['ESICNumber'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].ESICNumber) : null;
    }

    // For Candidate Communication accordion  (Edit)
    if (this._NewCandidateDetails.CandidateCommunicationDtls != null) {
      let _addressDetails: AddressDetails[] = [];
      _addressDetails = this._NewCandidateDetails.CandidateCommunicationDtls.LstAddressdetails;
      console.log(this._NewCandidateDetails.CandidateCommunicationDtls.LstAddressdetails);
      try {
        _addressDetails.forEach(element => {
          if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Present) {
            this.candidatesForm.controls['presentAddressdetails'] != null ? this.candidatesForm.controls['presentAddressdetails'].setValue(element.Address1) : null;
            this.candidatesForm.controls['presentAddressdetails1'] != null ? this.candidatesForm.controls['presentAddressdetails1'].setValue(element.Address2) : null;
            this.candidatesForm.controls['presentAddressdetails2'] != null ? this.candidatesForm.controls['presentAddressdetails2'].setValue(element.Address3) : null;
            this.candidatesForm.controls['presentCountryName'] != null ? this.candidatesForm.controls['presentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
            this.candidatesForm.controls['presentPincode'] != null ? this.candidatesForm.controls['presentPincode'].setValue(element.PinCode) : null;
            this.candidatesForm.controls['presentStateName'] != null ? this.candidatesForm.controls['presentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
            this.candidatesForm.controls['presentCity'] != null ? this.candidatesForm.controls['presentCity'].setValue(element.City) : null;
          }
          if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Permanent) {
            this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(element.Address1) : null;
            this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(element.Address2) : null;
            this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(element.Address3) : null;
            this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
            this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(element.PinCode) : null;
            this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
            this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue(element.City) : null;
          }
        });
      }
      catch (error) { }
    }


    try {
      // For Bank Information accordion (Edit)
      if (this._NewCandidateDetails.LstCandidateBankDetails != null && this._NewCandidateDetails.LstCandidateBankDetails.length > 0) {
        this.LstBank = [];
        this._NewCandidateDetails.LstCandidateBankDetails.forEach(element => {
          if (element.CandidateDocument != null) {
            element.CandidateDocument.Modetype = UIMode.Edit;
          }
          this.LstBank.push({
            Id: element.Id,
            id: element.Id,
            bankName: (element.BankId),
            accountNumber: element.AccountNumber,
            IFSCCode: element.BankBranchId,
            allocation: element.SalaryContributionPercentage,
            accountHolderName: element.AccountHolderName,
            bankBranchId: element.IdentifierValue,
            status: element.Status,
            proofType: "",
            CandidateDocument: element.CandidateDocument,
            DocumentStatus: element.CandidateDocument == null ? 'Approved' : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
            isDocumentStatus: element.CandidateDocument == null ? 1 : element.CandidateDocument.Status,
            Modetype: UIMode.Edit,
            bankFullName: this.BankList.find(a => a.Id == element.BankId) != null ? this.BankList.find(a => a.Id == element.BankId).Name : '',
            VerificationMode: element.VerificationMode,
            VerificationAttempts: element.VerificationAttempts,
            PayoutLogId: element.PayoutLogId,
            Remarks: element.Remarks

          })

          element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Bank_Details");



        });
      }
      console.log('dd', this.BankList);
    } catch (error) { }

    // For Candidate Documents accordion (Edit)
    if (this._NewCandidateDetails.LstCandidateDocuments != null) {
      this._NewCandidateDetails.LstCandidateDocuments.forEach(element => {
        if (element.IsSelfDocument == true) {
          this.lstDocumentDetails.push(element);
          this.edit_document_lst.push(
            {
              CandidateId: element.CandidateId,
              DocumentId: element.DocumentId,
              DocumentTypeId: element.DocumentTypeId,
              DocumentNumber: element.DocumentNumber,
              FileName: element.FileName,
              ValidFrom: element.ValidFrom,
              ValidTill: element.ValidTill,
              Id: element.Id,
              Status: element.Status,
              Modetype: element.Modetype
            }
          )

          element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Document_Details");


        }
      });
    }


    if (this.candidatesForm.get('requestFor').value != null && this.candidatesForm.get('requestFor').value.toString() === "AL") {
      this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(false, this.candidatesForm.get('letterTemplate'));
      this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(true, this.candidatesForm.get('payableRate'));
      this.updateValidation(true, this.candidatesForm.get('billableRate'));
      this.updateValidation(true, this.candidatesForm.get('paymentType'));
      this.updateValidation(false, this.candidatesForm.get('skillCategory'));
      this.updateValidation(false, this.candidatesForm.get('zone'));
      this.updateValidation(true, this.candidatesForm.get('TeamId'));
      // this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
      // this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));
    }
  }

  rejectedDocs_init(element, AccordionName) {

    this.rejectedLst.push({

      CandidateId: AccordionName == "Client_Approvals" ? element.EntityId : element.CandidateId,
      FileName: element.DocumentName,
      Remarks: AccordionName == "Client_Approvals" ? element.RejectionRemarks : element.Remarks,
      Accordion: AccordionName
    });
    console.log('reject', this.rejectedLst);
  }



  onChangeOfferLocation(event: any) {
    console.log('location event', event);

    if (event != null) {

      this.candidatesForm.controls['skillCategory'].setValue(0);
      this.candidatesForm.controls['zone'].setValue(0);
      this.StateId = 0;
      this.CityId = 0; 

      if (event.DefaultSkillCategoryId == 0 || event.DefaultZoneId == 0) {
        this.alertService.showWarning('Skill Category and Zone details not found. Please contact support admin.');
        return;
      }
      this.candidatesForm.controls['skillCategory'].setValue(event.DefaultSkillCategoryId);
      this.candidatesForm.controls['zone'].setValue(event.DefaultZoneId);
      this.StateId = event.StateId;
      this.CityId = event.CityId;
    }
    event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('location').value), 'location') : null;

  }



  PreviewCTC(): void {

    let isValid = false;
    let isDirty = false;
    console.log('CTC Check :', this.candidatesForm.value);
    let customizedAmount = 0;
    if (this.ClientContractOperationList.length > 0) {
      if (this.candidatesForm.value.paymentType == '1') {
        customizedAmount = (this.candidatesForm.get('payableRate').value * this.ClientContractOperationList[0].WorkableHours * this.ClientContractOperationList[0].TotalNoofDaysInaMonth * 12)
      }
      else if (this.candidatesForm.value.paymentType == '2') {
        customizedAmount = (this.candidatesForm.get('payableRate').value * this.ClientContractOperationList[0].TotalNoofDaysInaMonth * 12)

      }
      else if (this.candidatesForm.value.paymentType == '3') {
        customizedAmount = (this.candidatesForm.get('payableRate').value * 12)

      } else {
        customizedAmount = 0;
      }
    }
    else {
      customizedAmount = 0
    }

    this.candidatesForm.controls['annualSalary'].setValue(customizedAmount)
    this.candidatesForm.controls['MonthlySalary'].setValue(customizedAmount / 12);
    this.candidatesForm.controls['salaryType'].setValue(2);

    if ((this.candidatesForm.get('skillCategory').value == "" || this.candidatesForm.get('skillCategory').value == null || this.candidatesForm.get('zone').value == "" || this.candidatesForm.get('zone').value == null)) {
      this.alertService.showWarning("Skill Category and Zone details not found. Please contact support admin.")
      return;
    }

    if (

      this.candidatesForm.controls['industryType'].valid &&
      this.candidatesForm.controls['location'].valid &&
      this.candidatesForm.controls['skillCategory'].valid &&
      this.candidatesForm.controls['zone'].valid &&
      this.candidatesForm.controls['paymentType'].valid &&
      this.candidatesForm.controls['annualSalary'].valid &&
      this.candidatesForm.controls['paystructure'].valid
      // &&
      // this.candidatesForm.get('annualSalary').value > 0
      // this.candidatesForm.get('onCostInsuranceAmount').value > 0 &&
      // this.DateOfJoining != null

    ) {

      // if (this.candidatesForm.get('requestFor').value.toString() === "AL" && (this.candidatesForm.get('ActualDOJ').value == null || this.candidatesForm.get('ActualDOJ').value == undefined)) {

      //   isValid = false;
      //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
      //   return;
      // }
      // else if (this.candidatesForm.get('requestFor').value.toString() === "OL" && (this.candidatesForm.get('expectedDOJ').value == null || this.candidatesForm.get('expectedDOJ').value == undefined)) {
      //   isValid = false;
      //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
      //   return;
      // }

      // else {
      isValid = true;
      // }
    } else {

      isValid = false;
      this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again. Fields : Location, PaymentType, Payable Rate,  Salary Type, Pay Structure ")
      return;
    }

    if (this.candidatesForm.controls['industryType'].dirty ||
      this.candidatesForm.controls['location'].dirty ||
      this.candidatesForm.controls['skillCategory'].dirty ||
      this.candidatesForm.controls['zone'].dirty ||
      this.candidatesForm.controls['paymentType'].dirty ||
      this.candidatesForm.controls['annualSalary'].dirty ||
      this.candidatesForm.controls['paystructure'].dirty
      // ||
      // this.candidatesForm.controls['expectedDOJ'] != null ? this.candidatesForm.controls['expectedDOJ'].dirty : null ||
      // this.candidatesForm.controls['onCostInsuranceAmount'].dirty
    ) {
      isDirty = true;
    } else { isDirty = false; }



    if (isValid) {

      let DOJ = new Date(this.candidatesForm.get("ActualDOJ").value) as any;
      this.previewCTC_OfferDetails.IndustryId = this.candidatesForm.get('industryType').value;
      this.previewCTC_OfferDetails.State = Number(this.StateId)
      this.previewCTC_OfferDetails.CityId = Number(this.CityId)
      this.previewCTC_OfferDetails.ClientContractId = Number(this.ClientContractId);
      this.previewCTC_OfferDetails.ClientId = Number(this.ClientId);
      this.previewCTC_OfferDetails.SkillCategory = this.candidatesForm.get('skillCategory').value;
      this.previewCTC_OfferDetails.Zone = this.candidatesForm.get('zone').value;
      this.previewCTC_OfferDetails.Location = this.candidatesForm.get('location').value;
      this.previewCTC_OfferDetails.DateOfJoining = DOJ;

      this.previewCTC_OfferDetails.ActualDateOfJoining = DOJ;
      this.previewCTC_OfferDetails.GMCAmount = 0;//this.candidatesForm.get('Gmc').value == null ? 0 : this.candidatesForm.get('Gmc').value;;
      this.previewCTC_OfferDetails.GPAAmount = 0;// this.candidatesForm.get('Gpa').value == null ? 0 : this.candidatesForm.get('Gpa').value;;
      this.previewCTC_OfferDetails.NoticePeriodDays = 0 // this.candidatesForm.get('NoticePeriod').value == null ? 0 : this.candidatesForm.get('NoticePeriod').value;;
      this.previewCTC_OfferDetails.OnCostInsurance = 0// this.candidatesForm.get('onCostInsuranceAmount').value == null || this.candidatesForm.get('onCostInsuranceAmount').value == '' ? 0 : this.candidatesForm.get('onCostInsuranceAmount').value;
      this.previewCTC_OfferDetails.IsRateSetValid = this._NewCandidateDetails.Id == undefined ? true : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid;

      this.previewCTC_OfferDetails.IsMinimumwageAdhere = this._NewCandidateDetails.Id == undefined ? true : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere;

      this.previewCTC_OfferDetails.CalculationRemarks = this._NewCandidateDetails.Id == undefined ? "" : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks;

      this.previewCTC_OfferDetails.LstPayGroupProductOverrRides =
        this._NewCandidateDetails.Id == undefined ? [] : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides;

      // CalculationRemarks

      // this.previewCTC_OfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount').value;
      this.previewCTC_OfferDetails.FixedInsuranceDeduction = 0 // this.candidatesForm.get('fixedDeductionAmount').value != null && this.candidatesForm.get('fixedDeductionAmount').value != "" ? this.candidatesForm.get('fixedDeductionAmount').value : 0;
      this.previewCTC_OfferDetails.LetterTemplateId = this.candidatesForm.get('AppointmentLetterTemplateId').value != null && this.candidatesForm.get('AppointmentLetterTemplateId').value != 0 ? this.candidatesForm.get('AppointmentLetterTemplateId').value : 0;
      // this.candidatesForm.controls['letterTemplate'] != null ? this.candidatesForm.get('letterTemplate').value != null && this.candidatesForm.get('letterTemplate').value != 0 ? this.candidatesForm.get('letterTemplate').value : 0 : this.candidatesForm.controls['AppointmentLetterTemplateId'] != null ? this.candidatesForm.get('AppointmentLetterTemplateId').value != null && this.candidatesForm.get('AppointmentLetterTemplateId').value != 0 ? this.candidatesForm.get('AppointmentLetterTemplateId').value : 0 : null;
      console.log('before', this._NewCandidateDetails);

      let ListRateSet = [];
      // ListRateSet = this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      // this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      // this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
      // this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet;
      // console.log('after', this._NewCandidateDetails);

      ListRateSet.push({
        AnnualSalary: this.candidatesForm.get('annualSalary').value,
        Salary: this.candidatesForm.get('annualSalary').value,
        SalaryBreakUpType: this.candidatesForm.get('salaryType').value,
        PayGroupdId: this.candidatesForm.get('paystructure').value,
        IsMonthlyValue: this.candidatesForm.get('forMonthlyValue').value,
        MonthlySalary: this.candidatesForm.get('MonthlySalary').value,
        LstRateSet: this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet : null,
      })


      console.log(ListRateSet);

      this.previewCTC_OfferDetails.LstCandidateRateSet = (ListRateSet);

      console.log('after', this.previewCTC_OfferDetails);

      // this.previewCTC_OfferDetails.LstCandidateRateSet[0].LstRateSet = this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet : null;

      if (this._NewCandidateDetails.Id == undefined) {
        this._NewCandidateDetails.Id = 0;
        this._NewCandidateDetails.LstCandidateOfferDetails = []
        this._NewCandidateDetails.LstCandidateOfferDetails[0] = (this.previewCTC_OfferDetails);
      }

      console.log(this._NewCandidateDetails);

      this.loadingScreenService.startLoading();
      this.confirmPrevieCTC();


    } else {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Preview is not available!");
    }
  }

  confirmPrevieCTC() {
    console.log('MINIM', this._NewCandidateDetails.LstCandidateOfferDetails[0]);

    if ((this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {

      sessionStorage.removeItem('LstRateSet');
      sessionStorage.setItem('LstRateSet', JSON.stringify(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet));
      this.loadingScreenService.stopLoading();
      const modalRef = this.modalService.open(PreviewCtcModalComponent, this.modalOption);
      modalRef.componentInstance.id = 0;
      modalRef.componentInstance.PayGroupId = this.candidatesForm.get('paystructure').value;
      modalRef.componentInstance.ClientContractId = this.ClientContractId;
      modalRef.componentInstance.jsonObj = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet;
      modalRef.componentInstance.newCandidateOfferObj = this._NewCandidateDetails.LstCandidateOfferDetails[0];


      modalRef.result.then((result) => {

        console.log('ss', result);
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = result.LstPayGroupProductOverrRides;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere = result.IsMinimumwageAdhere;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks = result.CalculationRemarks;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = result.RequestType;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = result.LetterTemplateId;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = result.IsRateSetValid;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
        // this._NewCandidateDetails.LstCandidateOfferDetails[0] =(result);
        this._LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
        // this.isRateSetValid = result.IsRateSetValid;
        // this.IsMinimumwageAdhere = result.IsMinimumwageAdhere;
        this.isESICapplicable = result.LstCandidateRateSet[0].LstRateSet != null && result.LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;

        console.log(this._NewCandidateDetails, 'ddd');

      }).catch((error) => {
        console.log(error);
      });

    } else {

      this.getPaygroupProductOverrideItems().then((result) => {
        console.log('rsult', result);
        if (result != null) {
          this.previewCTC_OfferDetails.LstPayGroupProductOverrRides = result as any;
        } else {
          this.previewCTC_OfferDetails.LstPayGroupProductOverrRides = null
        }

        console.log('dada', this.previewCTC_OfferDetails);

        this.previewCTC_OfferDetails.DateOfJoining = this.datePipe.transform(new Date(this.previewCTC_OfferDetails.DateOfJoining).toString(), "yyyy-MM-dd")
        this.previewCTC_OfferDetails.ActualDateOfJoining = this.datePipe.transform(new Date(this.previewCTC_OfferDetails.DateOfJoining).toString(), "yyyy-MM-dd")
        this.onboardingService.postCalculateSalaryBreakUp((JSON.stringify(this.previewCTC_OfferDetails))).subscribe((res) => {
          let apiResult: apiResult = res;
          console.log('ggh', apiResult);

          try {

            if (apiResult.Status && apiResult.Result != null) {

              var _LstSalaryBreakUp: any;
              _LstSalaryBreakUp = (apiResult.Result)
              let LstRateSet = _LstSalaryBreakUp.LstCandidateRateSet[0].LstRateSet;
              sessionStorage.removeItem('LstRateSet');
              sessionStorage.setItem('LstRateSet', JSON.stringify(LstRateSet));
              this.loadingScreenService.stopLoading();
              const modalRef = this.modalService.open(PreviewCtcModalComponent, this.modalOption);
              modalRef.componentInstance.id = 0;
              modalRef.componentInstance.PayGroupId = this.candidatesForm.get('paystructure').value;
              modalRef.componentInstance.ClientContractId = this.ClientContractId;
              modalRef.componentInstance.jsonObj = LstRateSet;
              modalRef.componentInstance.newCandidateOfferObj = apiResult.Result;

              modalRef.result.then((result) => {

                console.log('ss', result);
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = result.LstPayGroupProductOverrRides;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere = result.IsMinimumwageAdhere;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks = result.CalculationRemarks;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = result.RequestType;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = result.LetterTemplateId;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = result.IsRateSetValid;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = result.LstCandidateRateSet[0].LstRateSet;

                // this.isRateSetValid = result.IsRateSetValid;
                // this.IsMinimumwageAdhere = result.IsMinimumwageAdhere;
                this.isESICapplicable = result.LstCandidateRateSet[0].LstRateSet != null && result.LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;

                console.log(this._NewCandidateDetails, 'testet');

              }).catch((error) => {
                console.log(error);
              });


            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message)
            }
          } catch (error) {

            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(error);
          }

          console.log(apiResult.Result);


        }), ((err) => {

        })
      });
    }

  }
  getPaygroupProductOverrideItems() {
    return new Promise((resolve, reject) => {
      this.onboardingService.getMigrationMasterInfo(this.ClientContractId).subscribe((result) => {
        let apiResult: apiResult = (result);
        console.log(apiResult);
        var lstOfPaygroupOverrideProducts = [];
        if (apiResult.Status && apiResult.Result != null) {
          var offerMasterInfo = JSON.parse(apiResult.Result);
          var MigrationInfoGrp = offerMasterInfo[0];
          var lstOfPaygroupOverrideProducts = [];
          if (MigrationInfoGrp.PaygroupProductOverridesList != null && MigrationInfoGrp.PaygroupProductOverridesList.length > 0) {
            lstOfPaygroupOverrideProducts = MigrationInfoGrp.PaygroupProductOverridesList;
            var lstOfPaygroupOverrideProducts = lstOfPaygroupOverrideProducts.filter(item => item.PayGroupId == this.candidatesForm.get('paystructure').value);
            lstOfPaygroupOverrideProducts = lstOfPaygroupOverrideProducts.filter(a => a.IsDefault == true);
          }
          resolve(lstOfPaygroupOverrideProducts);

        } else {
          resolve(lstOfPaygroupOverrideProducts);
        }

      }), ((error) => {
      })
    });
  }



  PreviewLetter(): void {

    if (this.CandidateId != 0 && this.Id != 0) {

      let isValid = false;
      let customizedAmount = 0;
      if (this.ClientContractOperationList.length > 0) {
        if (this.candidatesForm.value.paymentType == '1') {
          customizedAmount = (this.candidatesForm.get('payableRate').value * this.ClientContractOperationList[0].WorkableHours * this.ClientContractOperationList[0].TotalNoofDaysInaMonth * 12)
        }
        else if (this.candidatesForm.value.paymentType == '2') {
          customizedAmount = (this.candidatesForm.get('payableRate').value * this.ClientContractOperationList[0].TotalNoofDaysInaMonth * 12)

        }
        else if (this.candidatesForm.value.paymentType == '3') {
          customizedAmount = (this.candidatesForm.get('payableRate').value * 12)

        } else {
          customizedAmount = 0;
        }
      }
      else {
        customizedAmount = 0
      }

      this.candidatesForm.controls['annualSalary'].setValue(customizedAmount)
      this.candidatesForm.controls['MonthlySalary'].setValue(customizedAmount / 12);
      this.candidatesForm.controls['salaryType'].setValue(2);

      if (
        this.candidatesForm.controls['designation'].valid &&
        this.candidatesForm.controls['industryType'].valid &&
        this.candidatesForm.controls['location'].valid &&
        this.candidatesForm.controls['skillCategory'].valid &&
        this.candidatesForm.controls['zone'].valid &&
        this.candidatesForm.controls['paymentType'].valid &&
        this.candidatesForm.controls['annualSalary'].valid &&
        this.candidatesForm.controls['ActualDOJ'].valid &&
        this.candidatesForm.get('annualSalary').value > 0 &&
        this.candidatesForm.controls['paystructure'].valid
        // this.DateOfJoining != null
        // this.candidatesForm.get('onCostInsuranceAmount').value > 0 &&


      ) {

        // if (this.candidatesForm.get('tenureType').value == 1 && this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.get('tenureEndate').value == null) {
        //   isValid = false;
        //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        //   return;
        // }
        // else if (this.candidatesForm.get('tenureType').value == 2 && this.candidatesForm.controls['tenureMonth'] != null && this.candidatesForm.get('tenureMonth').value == null || this.candidatesForm.get('tenureMonth').value == '') {

        //   isValid = false;
        //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        //   return;
        // }
        // else if (this.candidatesForm.get('requestFor').value.toString() === "OL" && this.candidatesForm.get('letterTemplate').value == null || this.candidatesForm.get('letterTemplate').value == 0) {
        //   isValid = false;
        //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        //   return;
        // }
        // else if (this.candidatesForm.get('requestFor').value.toString() === "AL" && this.candidatesForm.get('AppointmentLetterTemplateId').value == null || this.candidatesForm.get('AppointmentLetterTemplateId').value == 0) {
        //   isValid = false;
        //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        //   return;
        // }
        // else if (this.candidatesForm.get('requestFor').value.toString() === "AL" && (this.candidatesForm.get('ActualDOJ').value == null || this.candidatesForm.get('ActualDOJ').value == undefined)) {

        //   isValid = false;
        //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        //   return;
        // }
        // else if (this.candidatesForm.get('requestFor').value.toString() === "OL" && (this.candidatesForm.get('expectedDOJ').value == null || this.candidatesForm.get('expectedDOJ').value == undefined)) {
        //   isValid = false;
        //   this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        //   return;
        // }
        // else {

        isValid = true;
        // }
      } else {
        isValid = false;
        this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again. Fields : Location, PaymentType, Payable Rate,  Salary Type, Pay Structure, Letter Template, Designation, DOJ ")
        return;
      }


      this.loadingScreenService.startLoading();
      if (isValid) {

        console.log(this._NewCandidateDetails.LstCandidateOfferDetails, 'kkkk');

        if (this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
          this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = this.candidatesForm.get('requestFor').value;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount = 0// this.candidatesForm.get('Gpa').value == null ? 0 : this.candidatesForm.get('Gpa').value;;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount = 0// this.candidatesForm.get('Gmc').value == null ? 0 : this.candidatesForm.get('Gmc').value;;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays = 0// this.candidatesForm.get('NoticePeriod').value == null ? 0 : this.candidatesForm.get('NoticePeriod').value;;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType = 0// this.candidatesForm.get('tenureType').value;
          // this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining = this.candidatesForm.get('ActualDOJ').value;           // no need
          this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate = null //this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.get('tenureEndate').value != null ? this.datePipe.transform(new Date(this.candidatesForm.get('tenureEndate').value).toString(), "yyyy-MM-dd") : null;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId = this.candidatesForm.get('AppointmentLetterTemplateId').value;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval = null// this.candidatesForm.controls['tenureMonth'] != null ? Number(this.candidatesForm.get('tenureMonth').value) : null;


          var req_post_param = JSON.stringify({

            ModuleProcessTranscId: this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId,
            CandidateDetails: this._NewCandidateDetails
          });
          console.log(JSON.stringify(req_post_param));
          this.onboardingService.postPreviewLetter(req_post_param)
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
              else
                this.alertService.showWarning(apiResult.Message)
            }),

            ((error) => {

            });


        }
        else {

          this.loadingScreenService.stopLoading();

          this.alertService.showWarning("Please update your CTC breakup ")
        }

      } else { this.loadingScreenService.stopLoading(); this.alertService.showWarning("Preview letter is not available!") }
    }
    else {
      this.alertService.showInfo("Please save this form to preview the letter")
    }

  }



  onClose() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        try {
          this.loadingScreenService.startLoading();
          if (this.unsavedDocumentLst.length > 0) {

            this.unsavedDocumentLst.forEach(e => {

              this.doDeleteFile(e.Id, e);
            });

          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
        }

        this.loadingScreenService.stopLoading();
        var path = (this.RoleCode == 'OpsMember' || this.RoleCode == 'PayrollOps') ? '/app/onboarding/onboarding_ops' : '/app/onboarding/onboarding_ops' // localStorage.getItem('previousPath');
        this.router.navigateByUrl('/app/onboarding/onboarding_ops');


      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }


  getLetterSpace(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2')
  }

  

  getDynamicFieldDetailsConfig(_companyId, _clientId, _clientContractId) {
    var promise = new Promise((resolve, reject) => {
      this.should_spin_onboarding = true;
      this.onboardingService.getDynamicFieldDetails(_companyId, _clientId, _clientContractId,'VENDOR')
        .subscribe((response) => {
          console.log('DFD RES ::', response);
          let apiresult: apiResult = response;
          if (apiresult.Status && apiresult.Result != null) {
            this.DynamicFieldDetails = apiresult.Result as any;
            var filteredItems = [];
            filteredItems = this.DynamicFieldDetails.ControlElemetsList.filter(z => z.ExtraProperities.ViewableRoleCodes.includes(this.RoleCode) == true);
            this.DynamicFieldDetails.ControlElemetsList = filteredItems;
            this.DynamicFieldDetails.ControlElemetsList.forEach(ele => {
              ele.LoadDataOnPageLoad == true ? this.getDropDownList(ele) : true;
            });
            console.log('DFD ::', filteredItems);
            this.Id != 0 && this.onboardingService.GetDynamicFieldsValue(this.Id)
              .subscribe((getValue) => {
                console.log('DFD VALUES ::', getValue);
                let apires: apiResult = getValue;
                if (apires.Status && apires.Result != null) {
                  this.Dynamicfieldvalue = apires.Result as any;
                  if (filteredItems.length > 0 && this.Dynamicfieldvalue != null && this.Dynamicfieldvalue.FieldValues != null && this.Dynamicfieldvalue.FieldValues.length > 0) {
                    this.Dynamicfieldvalue.FieldValues.forEach(ee => {
                      var isexsit = this.DynamicFieldDetails.ControlElemetsList.find(a => a.FieldName == ee.FieldName)
                      isexsit != null && isexsit != undefined && (isexsit.Value = ee.Value != null ? isexsit.InputControlType == 3 ? Number(ee.Value) as any : ee.Value : null);
                    });
                  }
                  this.should_spin_onboarding = false;
                } else {
                  this.should_spin_onboarding = false;
                }
              })
            this.should_spin_onboarding = false;
          }
          else {
            this.should_spin_onboarding = false;
          }

        }, error => {
          this.should_spin_onboarding = false;
        })
    });
    return promise;
  }

  isDynamicAccordionAvailable(AccordionName) {

    return this.DynamicFieldDetails.ControlElemetsList.find(item => item.TabName == AccordionName) != undefined ? true : false;
  }

  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  getDynamicAccordionFields(AccordionName) {
    return this.DynamicFieldDetails.ControlElemetsList;
  }


  getDropDownList(controlElement: ControlElement) {
    controlElement.DropDownList = null;
    let parentElementList: any[] = null;
    this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {
      if (dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '')
        controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);
      controlElement.DropDownList = _.orderBy(controlElement.DropDownList, [controlElement.DisplayField], ["asc"]);
      if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
        controlElement.DropDownList = [];
      }
    }, error => {
      console.log(error);
      controlElement.DropDownList = [];
    })
  }

}
