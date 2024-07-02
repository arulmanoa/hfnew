import { HramodalComponent } from 'src/app/shared/modals/employee/hramodal/hramodal.component';
import { RatesetProduct } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { OnBoardingInfo, ClientContractList } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { OfferInfo, ClientLocationList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { ManagerList, LeaveGroupList, CostCodeList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { Component, EventEmitter, OnInit, Input, Output, VERSION, Pipe, PipeTransform } from '@angular/core';
import { HeaderService } from 'src/app/_services/service/header.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Gender, Nationality, BloodGroup, MaritalStatus, GraduationType, CourseType, ScoringType, AcceptanceStatus } from 'src/app/_services/model/Base/HRSuiteEnums';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { DomSanitizer } from '@angular/platform-browser';
import { EmployeeDeductionModel } from "src/app/_services/model/Employee/employee-deduction-model";
import { EmployeeSuspendedDeductions, DeductionPayItemStatus } from "src/app/_services/model/Employee/employee-deduction-suspended-details";
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
import * as moment from 'moment';
import { MustMatch } from 'src/app/shared/directives/_helper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { UUID } from 'angular2-uuid'; import { ToastrService, ToastrConfig } from 'ngx-toastr';
import { UIMode } from 'src/app/_services/model/UIMode';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { EmployeeDetails, EmployeeInvestmentMaster, EmployeeStatus } from 'src/app/_services/model/Employee/EmployeeDetails';
import { EmployeeService } from 'src/app/_services/service/employee.service';
import { apiResult } from 'src/app/_services/model/apiResult';
// import { Relationship } from '../../../_services/model/Base/HRSuiteEnums';
import { FamilyInfo, FamilyDocumentCategoryist } from 'src/app/_services/model/OnBoarding/FamilyInfo';
import { CommunicationInfo, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { BankInfo, BankList, BankDocumentCategoryList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { CandidateInfo, CountryList } from 'src/app/_services/model/OnBoarding/CandidateInfo';
import { OnboardingService } from 'src/app/_services/service/onboarding.service';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionStorage } from 'src/app/_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ContactDetails, CommunicationDetails, AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CandidateDocuments, ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { Claim, CandidateFamilyDetails, Relationship, ClaimType, _CustomCandidateFamilyDetails } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { FamilyDetails } from 'src/app/_services/model/Employee/FamilyDetails';
import { EmployeeBankDetails } from 'src/app/_services/model/Employee/EmployeeBankDetails';
import { CandidateBankDetails, BankBranchIdentifierType, VerificationMode } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { CandidateDetails, CandidateStatus, DuplicateCandidateDetails, Approvals, ApprovalFor, ApproverType, ApprovalType } from 'src/app/_services/model/Candidates/CandidateDetails';
import { environment } from "src/environments/environment";


import { DatePipe } from '@angular/common';
import { AlertService } from 'src/app/_services/service/alert.service';
import Swal from "sweetalert2";

import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';





let previousValue = 0;
export function mixmaxcheck(control: FormControl): { [key: string]: boolean } {
  if (control.value > 100) {
    control.setValue(previousValue);
    return { invalid: true };
  } else if (control.value < 0) {
    control.setValue(previousValue);
    return { invalid: true };
  } else {
    previousValue = control.value;
    return null;
  }
}

import * as _ from 'lodash';
import { DataService } from 'src/app/_services/service/data.service';
import { CustomdrawerModalComponent } from 'src/app/shared/modals/investment/customdrawer-modal/customdrawer-modal.component';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { EmployeeInvestmentDeductions, EmployeeInvesmentDependentDetails, EmployeeInvestmentDocuments } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { EmployeeHouseRentDetails } from 'src/app/_services/model/Employee/EmployeeHouseRentDetails';
import { PageLayout } from 'src/app/views/personalised-display/models';
import { PagelayoutService, CommonService, SearchService, PayrollService } from 'src/app/_services/service';
import { SearchPanelType, DataSourceType } from 'src/app/views/personalised-display/enums';
import { Title } from '@angular/platform-browser';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { DocumentsModalComponent } from 'src/app/shared/modals/documents-modal/documents-modal.component';
import { AcademicModalComponent } from 'src/app/shared/modals/academic-modal/academic-modal.component';
import { Qualification, WorkExperience } from 'src/app/_services/model/Candidates/CandidateCareerDetails';
import { WorkexperienceModalComponent } from 'src/app/shared/modals/workexperience-modal/workexperience-modal.component';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { forEach } from 'lodash';
import { ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { DynamicFieldDetails, DynamicFieldsValue } from 'src/app/_services/model/OnBoarding/DynamicFIeldDetails';
import { ControlElement } from 'src/app/views/generic-form/form-models';
import { EmploymentDetails } from 'src/app/_services/model/Employee/EmploymentDetails';
import { DomesticPayment } from 'src/app/_services/model/Payroll/DomesticPayment';
import { DeductionStatus, DeductionType, EmployeeDeductions, EndStatus, PaymentSourceType, SuspensionType } from 'src/app/_services/model/Employee/EmployeeDeductions';
import { EmployeedeductionmodalComponent } from 'src/app/shared/modals/employeedeductionmodal/employeedeductionmodal.component';



@Component({
  selector: 'app-employee-deductions',
  templateUrl: './employee-deductions.component.html',
  styleUrls: ['./employee-deductions.component.css']
})
export class EmployeeDeductionsComponent implements OnInit {
  employeeExemptionDetails = []
  // Access control
  isESSEditCancel: boolean = true;
  isSave: boolean = true;
  isClose: boolean = true;
  isEnbleBankBtn: boolean = true;
  isEnbleNomineeBtn: boolean = true;

  MenuId: any;

  @Input() Id: number;
  employeeForm: FormGroup;
  @Output() DeductionDetailsChangeHandler = new EventEmitter();
  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  spinner: boolean = true;

  employeeModel: EmployeeModel = new EmployeeModel();
  Employee: EmployeeDetails;
  employeedetails: EmployeeDetails = {} as any;

  should_spin_onboarding: boolean = true;
  countryCode: any;
  LstcountryCode = [{
    id: 1,
    name: "91"
  }];

  /* #region  Bank Slick Grid */
  columnDefinitions_Bank: Column[] = [];
  gridOptions_Bank: GridOption = {};
  LstBank: any[] = [];
  angularGrid_Bank: AngularGridInstance;
  gridObj_Bank: any;
  /* #endregion */

  /* #region  Nominee Slick Grid */
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  LstNominees = [];
  angularGrid: AngularGridInstance;
  gridObj1: any;
  /* #endregion */

  /* #region  Experience Slick grid */
  columnDefinitions_Experience: Column[] = [];
  gridOptions_Experience: GridOption = {};
  LstExperience: any[] = [];
  angularGrid_Experience: AngularGridInstance;
  gridObj_Experience: any;
  /* #endregion */

  /* #region  Academic Slick Grid */
  columnDefinitions_Education: Column[] = [];
  gridOptions_Education: GridOption = {};
  LstEducation: any[] = [];
  angularGrid_Education: AngularGridInstance;
  gridObj_Education: any;
  /* #endregion */

  /* #region  Deduction Slick Grid */
  columnDefinitions_Deduc: Column[] = [];
  gridOptions_Deduction: GridOption = {};
  LstDeductions: Array<EmployeeDeductions>;
  angularGrid_Deduction: AngularGridInstance;
  pagination_Deduction = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };
  gridObj_Deduction: any;
  /* #endregion */


  image: any;
  gender: any = [];
  DOB: any;
  relationship: any = [];

  EmployeeId: number = 0;

  FamilyInofListGrp: FamilyInfo;
  FamilyDocumentCategoryList: FamilyDocumentCategoryist;
  spinnerText: string = "Uploading";
  isLoading: boolean = true;
  familyFileName: any;
  familyDocumentId: any;

  CommunicationListGrp: CommunicationInfo;
  CountryList: CountryList[] = [];
  StateList: StateList[] = [];
  StateList1: StateList[] = [];
  StateList2: StateList[] = [];
  lstEmployeeRateSet = [];

  Addressdetails: any = [];
  FamilyDetails: FamilyDetails[] = [];
  Claim: any = [];

  BankInfoListGrp: BankInfo;
  BankList: BankList[] = [];
  BranchList = [];
  ApprovalStatus: any;
  rejectedLst = [];
  BankDocumentCategoryList: BankDocumentCategoryList[] = [];
  BankBranchId: any;
  FileName: any;
  DocumentId: any;
  lstBankDetails: EmployeeBankDetails[] = [];

  is_spinner_ifsc: boolean = false;
  isrendering_spinner: boolean = false;

  CountryList_NonIndian: CountryList[] = [];
  UserId: any;
  RoleId: any;
  RoleCode: any;
  ImplementationCompanyId: any;

  _loginSessionDetails: LoginResponses;

  activeTabName: string;
  isSameAddress = false;
  CompanyId: any;
  unsavedDocumentLst = [];
  popupId: any;
  firstTimeDocumentId: any;
  invaid_fields = [];
  ELCTransactions = [];
  TeamList: any;
  EmploymentTypeList: any[] = [];
  ManagerList: ManagerList[] = [];
  LeaveGroupList: LeaveGroupList[] = [];
  CostCodeList: CostCodeList[] = [];
  MigrationInfoGrp: MigrationInfo;
  PayCycleDetails: any;
  OfferInfoListGrp: OfferInfo;
  ClientLocationList: ClientLocationList[] = [];
  OnBoardingInfoListGrp: OnBoardingInfo;
  ClientContractList: ClientContractList[] = [];
  ClientList: any[] = [];
  nomineeSubmitted: boolean = false; bankSubmitted: boolean = false;
  Current_RateSetList: any = [];
  DOBmaxDate: Date;
  deletedLstNominee = []; // for server delete 
  deletedLstEducation = [];
  deletedLstExperience = [];
  deletedLstInvestmentDeduction = [];
  deletedLstExemption = [];
  EffectiveDate_POP: Date = new Date();
  AnnualSalary_POP: number = 0;

  EntryTypeList = [{
    Id: 1, Name: "Month Wise"
  }, { Id: 2, Name: "Bi-Annual" }, { Id: 3, Name: "Custom" }];

  modalOption: NgbModalOptions = {};

  isSummary_panel: boolean = false;
  isInvestment_panel: boolean = false;
  isDeduction_panel: boolean = false;
  isAdditional_panel: boolean = false;
  employeeDeductionModel: EmployeeDeductionModel = new EmployeeDeductionModel();
  TaxationCategory_Investment = [
    // { id: 1, name: "Life Insurance Premium", icon: "https://image.flaticon.com/icons/svg/755/755186.svg", index: "4", section: "Section 80 C", isInvestment: true },
    // { id: 1, name: "Repayment of Housing Loan Principal (HLPR)", icon: "https://image.flaticon.com/icons/svg/755/755205.svg", index: "5", section: "", isInvestment: true },
    // { id: 1, name: "Mutual Funds", icon: "https://image.flaticon.com/icons/svg/755/755191.svg", index: "6", section: "Section 80 C", isInvestment: true },
    // { id: 1, name: "National Pension Scheme", icon: "https://image.flaticon.com/icons/svg/755/755173.svg", index: "7", section: "Section 80 CCD(1B)", isInvestment: true },
  ]
  TaxationOtherCategory_Investment = [];
  TaxationCategory = [
    // {
    //   ProductCode: "HRA",
    //   ProductId: 1001,
    //   ProductName: "HouseRentAllowance",
    //   b: [{
    //     Code: "Sec10",
    //     CreatedBy: "99",
    //     CreatedOn: "2020-06-01T20:29:34.890",
    //     Description: "House Rent Allowance",
    //     Id: 101,
    //     IsThresholdLimitApplicable: true,
    //     LastUpdatedBy: "99",
    //     LastUpdatedOn: "2020-06-01T20:29:34.890",
    //     ParentId: 0,
    //     Status: 1,
    //     TaxCodeTypeId: 2,
    //     ThresholdLimit: 150000
    //   }]
    // },

  ]
  TaxationOtherCategory = [
    // { id: 6, name: "Education Loan Interest Repayment", icon: "https://image.flaticon.com/icons/svg/993/993743.svg", index: "1", section: "Section 10", isInvestment: true },
    // { id: 4, name: "Medical Expenditure - Handicapped Dependent", icon: "https://image.flaticon.com/icons/svg/2809/2809768.svg", index: "1", section: "Section 10", isInvestment: true },
    // { id: 5, name: "Medical Expenditure - Self or Dependents", icon: "https://image.flaticon.com/icons/svg/754/754545.svg", index: "1", section: "Section 10", isInvestment: true },
    // { id: 7, name: "Self Disability", icon: "https://image.flaticon.com/icons/svg/1086/1086762.svg", index: "1", section: "Section 10", isInvestment: true },
    // { id: 8, name: "Donations", icon: "https://image.flaticon.com/icons/svg/1086/1086741.svg", index: "1", section: "Section 10", isInvestment: true },
  ]


  Lstdeduction_Exemption = [];

  Lstinvestment = [];
  LstEmploymentDet = [];
  collection = [];
  visible = false;
  nominee_sliderVisible = false;
  bank_slidervisible = false;
  previousemployment_slidervisible = false;
  deduction_sliderVisible = false;
  taxRegime: any;
  lstlookUpDetails: EmployeeLookUp;
  LstemployeeHouseRentDetails: EmployeeHouseRentDetails[] = [];
  LstEmployeeHousePropertyDetails: EmployeeHousePropertyDetails[] = [];
  LstemployeeInvestmentDeductions: EmployeeInvestmentDeductions[] = [];
  LstEmpInvDepDetails: EmployeeInvesmentDependentDetails[] = [];
  lstQualificationDetails: Qualification[] = [];
  lstExperienceDetails: WorkExperience[] = [];

  visible1 = false;
  FicalYearList = [];
  // Payment history 
  pageLayout: PageLayout = null;
  LstPaymentHistory = [];
  // ESS PORTAL
  activenavtab: any = null;
  isESSLogin: boolean = false;
  LstESSURLs = ['profile', 'bankInformation', 'nomineeInformation', 'investmentInformation', 'employmentInformation', 'paymentInformation', 'currentEmployment'];
  profileImageDocumentId: any;
  enableEditTxt: string = "Edit";
  deletedBanks = []; EnddateminDate: Date;
  LstemploymentDetails = [];
  TaxDeclaration: any;
  PFAmount: number = 0;
  PTAmount: number = 0;
  dynamicPFInvestments = [];
  shouldhide: boolean = true;
  isESICapplicable: boolean = false;
  IsESICApplicableForKeyIn: boolean = false;
  // documents
  documentTbl = [];
  duplicateDocumentTbl = [];
  DocumentList: any[] = [];
  DocumentCategoryist = [];
  lstDocumentDetails: CandidateDocuments[] = [];
  edit_document_lst = [];
  deleted_DocumentIds_List = [];
  _OldEmployeeDetails: any;
  employeeLetterTransactions: any[] = [];
  documentURL: any = null; // end
  DocumentTypeList = [];
  labelMobileNumber: any;
  labelEmail: any;

  graduationType: any = [];
  isBankUnderQC: boolean = false;
  LstInvestmentSubmissionSlot = [];
  isInvestmentUnderQC: boolean = false;
  isInvestmentQcRejected: boolean = false;
  delete_ProfileAvatarDocument: any[] = [];
  new_ProfileAvatarDocument: any[] = [];
  isAadhaarNotEditable: boolean = null;
  isPANNotEditable: boolean = null;
  documentURLId: any;
  processCategoryList: any = [];
  // custom pagination
  page = 1;
  pageSize = 8;
  collectionSize = 0;
  paginateData_PaymentHistory = [];
  selctedProcesscategoryId: any;
  selectedyear: any;
  yearrangeList: any = [];
  _EmployeeName: any;
  _EmployeeCode: any;
  _Designation: any;
  _OriginalAadhaarNumber: any;
  clientLogoLink: any;
  BusinessType: any;
  clientminiLogoLink: any;
  contentmodalurl: any = null;
  isActiveEmployee: any = 1;
  //dynamic field details
  icontoggle: boolean = true;
  icontogglepan: boolean = true;
  _OrginalPanNo: any


  DynamicFieldDetails: DynamicFieldDetails = new DynamicFieldDetails();
  Dynamicfieldvalue: DynamicFieldsValue = new DynamicFieldsValue();
  indicateSubmissionSlotEnddate: boolean = false;
  InvestmentClosedDate: any;

  // START PENNYDROP PAYMENT 

  internalRefId: any;
  IsPennyDropCheckRequired: boolean = false;
  GlbIsPennyDropCheckRequired: boolean = false;

  textSpin: any = "Finished";
  status: any = "finish";
  loadingicon: any = "check";
  desciption: any = "Initiating Process"

  textSpin1: any = "Finished";
  status1: any = "process";
  loadingicon1: any = "loading";
  desciption1: any = "Connecting with Bank Server"



  textSpin2: any = "Waiting";
  status2: any = "wait";
  loadingicon2: any = "question";
  desciption2: any = "Completed Process"

  payoutLogId: any;
  isFailedInitiateProcess: boolean = false;
  isSuccessInitiateProcess: boolean = false;
  FailedInitiateProcessMessage: any = '';
  pennydropLoading: boolean = false;
  pennydropspinnerText: string = "Checking..."
  VerificationAttempts: any = 0;
  count: any = 0;


  count1: any = 0;
  IsInitiatingPennyDropDone: boolean = false;
  IsYBStatus: boolean = false;
  initiatingObject: any = null;
  NameAsPerBank = '';
  manuallVerification: any;
  IsMultipleAttempts: boolean = false;
  IsManualModeEnabled: boolean = false;
  IsPaymentFailed: boolean = false;
  disableSelect: boolean = false;
  IsNameMisMatched: boolean = false;


  ActualAccountHolderName: any;
  mismatch: boolean = false;
  // END HERE PENNY DROP PAYMENT

  HRAAmount: number = 0;
  TPAAmount: number = 0;
  VRAmount: number = 0;
  PDRAmount: number = 0;
  LTAAmount: number = 0;
  FCAmount: number = 0;
  CAAmount: number = 0;
  CLAmount: number = 0;
  dynamicExeptions = [];


  paymentSourceType = PaymentSourceType;
  deductionSourceType = DeductionType;
  deductionStatus = DeductionStatus;
  suspensionType = SuspensionType;
  endStatus = EndStatus;
  paymentSourceTypeList = [];
  deductionTypeList = [];
  deductionStatusList = [];
  suspensionTypeList = [];
  endStatusList = [];
  productList = [];
  payperiodList = [];
  emplolyeeDeduction: EmployeeDeductions = null;
  TaxationOtherCategory_Exemption = []
  _exemptionList = [];
  isDuplicateBankInfo: any;
  popupTaxBills: any = [];
  officialEmailCannotEdit: any;
  enableAddDeductionBtn: boolean = false;
  timeCardStatus: apiResult;
  timeCardObj: any;
  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private headerService: HeaderService,
    public employeeService: EmployeeService,
    public onboardingService: OnboardingService,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private router: Router,
    public fileuploadService: FileUploadService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private drawerService: NzDrawerService,
    private pageLayoutService: PagelayoutService,
    private titleService: Title,
    private commonService: CommonService,
    public searchService: SearchService,
    public UIBuilderService: UIBuilderService,
    private sanitizer: DomSanitizer,
    private payrollService: PayrollService



  ) {
    this.createReactiveForm();
  }
  open(): void {

    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }
  get g() { return this.employeeForm.controls; } // reactive forms validation 
  createReactiveForm() {
    this.employeeForm = this.formBuilder.group({
      //GENERAL
      Name: ['', Validators.required],
      mobile: ['', Validators.required],
      gender: [null, Validators.required],
      email: ['', Validators.required],
      officialEmail: [''],
      dateOfBirth: ['', Validators.required],
      Status: [true],
      fatherName: ['', Validators.required],
      adhaarnumber: [''],
      PANNO: [''],
      UAN: [''],
      ESIC: [''],
      PFNumber: [''],
      //CURRENT EMPLOYMENT
      employername: [''],
      jobtype: [''],
      companyname: [''],
      employeecode: [''],
      teamname: [''],
      contractname: ['', !this.isESSLogin ? Validators.required : null],
      clientname: ['', !this.isESSLogin ? Validators.required : null],
      employmentType: [null],
      reportingmanager: [''],
      // dateofjoining: ['', Validators.required],
      employementstartdate: ['', !this.isESSLogin ? Validators.required : null],
      employementenddate: [''],
      Designation: ['', !this.isESSLogin ? Validators.required : null],
      LWD: [''],
      Department: [''],
      Grade: [''],
      Location: ['', !this.isESSLogin ? Validators.required : null],
      statename: ['', !this.isESSLogin ? Validators.required : null],
      Country: ['', !this.isESSLogin ? Validators.required : null],
      costcode: [''],
      //COMMUNICATION
      permanentCommunicationCategoryTypeId: [''],
      permanentAddressdetails: ['', Validators.required],
      permanentAddressdetails1: [''],
      permanentAddressdetails2: [''],
      permanentStateName: [null, Validators.required],
      permanentCountryName: [null, Validators.required],
      permanentPincode: ['', Validators.required],
      permanentCity: ['', Validators.required],
      presentCommunicationCategoryTypeId: [''],
      presentAddressdetails: ['', Validators.required],
      presentAddressdetails1: [''],
      presentAddressdetails2: [''],
      presentStateName: [null, Validators.required],
      presentCountryName: [null, Validators.required],
      presentPincode: ['', Validators.required],
      presentCity: ['', Validators.required],

      //BANK DETAILS

      bankdetailsId: [null],
      bankName: [null],
      IFSCCode: [null],
      accountHolderName: [''],
      accountNumber: [''],
      confirmAccountNumber: [''],
      allocation: ['100', [mixmaxcheck]],
      status: [true],
      proofType: [null],
      bankBranchId: [''],
      DocumentId: [null,],
      FileName: [null],
      IsDocumentDelete: [false], // extra prop
      //NOMINEE DETAILS
      nomineeId: [null],
      nomineeName: ['',],
      relationship: [null,],
      DOB: [''],
      // FamilyaAdhar: [''],
      idProoftype: [null],
      FamilyisEmployed: [false],
      FamilyPF: ['', [mixmaxcheck]],
      FamilyESIC: ['', [mixmaxcheck]],
      FamilyGratuity: ['', [mixmaxcheck]],
      mediclaim: [false],
      familyDocumentId: [null],
      familyFileName: [null],
      IsFamilyDocumentDelete: [false], // extra prop
      // INVESTMENT AND DEDUCTION
      financialYear: [this.sessionService.getSessionStorage('DefaultFinancialYearId')],
      IsNewTaxRegimeOpted: [false],
      // PREVIOUS EMPLOYMENT
      previousemploymentId: [''],
      companyName: [''],
      startdate: [''],
      enddate: [''],
      grossSalary: [''],
      previousPT: [''],
      previousPF: [''],
      taxDeducted: [''],
      IsESSRequired: [true],
      prevEmpfinancialYear: [null],
      prevEmpIsProposedMode: [false],

      VerificationMode: [null],
      VerificationAttempts: [0],
      PayoutLogId: [null],
      Remarks: ['']
    });

    if (this.isESSLogin == false) {

      this.updateValidation(false, this.employeeForm.get('teamname'));
      this.updateValidation(false, this.employeeForm.get('costcode'));
    } else {
      this.updateValidation(true, this.employeeForm.get('teamname'));
      this.updateValidation(true, this.employeeForm.get('costcode'));

    }




    let mode = 2; // add-1, edit-2, view, 3   
    this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    this.UIBuilderService.doApply(mode, this, this.MenuId, "");
    this.graduationType = this.utilsHelper.transform(GraduationType);
    this.processCategoryList = this.utilsHelper.transform(ProcessCategory);
    this.selctedProcesscategoryId = 1;

    this.processCategoryList = this.processCategoryList.filter(a => a.id != 4 && a.id != 0);

  }

  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }


  ngOnInit() {
    this.count = 0;
    this.headerService.setTitle('Employee Deductions');
    this.titleService.setTitle('Employee Deductions');
    this.contentmodalurl = null;
    this.activeTabName = 'Deductions';
    this.countryCode = "91";
    this.gender = this.utilsHelper.transform(Gender);
    this.relationship = this.utilsHelper.transform(Relationship);
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.EmployeeId = this._loginSessionDetails.EmployeeId
    // this.Id = 44961;
    this.clientLogoLink = 'logo.png';
    this.officialEmailCannotEdit = environment.environment.officialEmailEditRole.whoCannotEdit
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

    // this.Id = 42485;

    console.log('route', this.route);
    this.spinner = true;
    this.payrollService.getValidateTimeCardToProcess(this.Id).subscribe((result) => {
      let apiresult: apiResult = result;
      this.timeCardStatus =  apiresult;
      console.log('checkIsValidTimeCard',  this.timeCardStatus);
      if (apiresult.Status && apiresult.Result) {
        this.timeCardObj = apiresult.Result; 
        this.timeCardStatus.Status = true;
       // console.log('checkIsValidTimeCard',  this.timeCardObj);
      }
    }, err => {
      console.error('getValidateTimeCardToProcess' , err);
      this.spinner = false;
    });

    this.route.data.subscribe(data => {

      if (data.DataInterface.RowData) {
        this._EmployeeName = data.DataInterface.RowData.EmployeeName;
        this._EmployeeCode = data.DataInterface.RowData.EmployeeCode;
        this.Id = data.DataInterface.RowData.Id;
      }

      if (sessionStorage.getItem('IsFromBillEntry') == 'true' && this.isESSLogin == false) {
        var j = sessionStorage.getItem("RowDataInterface")
        console.log(JSON.parse(j));
        const routedata = JSON.parse(j);
        this._EmployeeName = routedata.dataInterface.RowData.EmployeeName;
        this._EmployeeCode = routedata.dataInterface.RowData.EmployeeCode;
        this.Id = routedata.dataInterface.RowData.Id;
      }

      this.rowDataService.dataInterface = {
        SearchElementValuesList: [],
        RowData: null
      }
      this.Id != null && this.autotrigger(), sessionStorage.removeItem('LstHRA'), this.invaid_fields.length = 0;
    });

    if (this.Id == null) {
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.activenavtab = params.get('tabid');
        this.activenavtab != null && (this.isESSLogin = true, this.employeeForm.disable());
        this.LstESSURLs.includes(this.activenavtab) == false ? this.router.navigate([`/app/${this.activenavtab}`]) : null;
        // console.log(this.LstESSURLs.includes(this.activenavtab));
        this.activenavtab == 'investmentInformation' && this.employeeForm.controls['IsNewTaxRegimeOpted'].enable(), this.employeeForm.controls['financialYear'].disable();
        // (this.activenavtab == 'profile' || this.activenavtab == 'bankInformation') && this.employeeForm.controls['dateOfBirth'].enable(); //unused after 10.2 changes 

        if (this.activenavtab != 'investmentInformation') {
          sessionStorage.removeItem('_StoreLstinvestment');
          sessionStorage.removeItem('_StoreLstDeductions');

        }

        if (this.isESSLogin == true) {
          this.isLoading = false;
          this.enableEditTxt = "Edit";

        }
      });
      this.dynamicPFInvestments = [];
      this.Lstdeduction_Exemption = [];
      this.dynamicExeptions = [];
      this.Lstinvestment = [];
      this.LstEmploymentDet = [];
      this.collection = [];
      this.invaid_fields.length = 0;
      sessionStorage.removeItem('LstHRA');
      this.autotrigger();

    }
    this.EnddateminDate = new Date();
    this.employeeService.getActiveTab(false);
    
    

  }
  EmitHandler() {
    console.log('component triggered');
    this.subscribeEmitter()
  }
  subscribeEmitter() {
    if (this.isESSLogin == false) {
     // this.EmitHandler();
      if (this.LstDeductions && this.LstDeductions.length) {
        this.employeedetails['IsEmployeeDeductionApplicable'] = true;
        this.DeductionDetailsChangeHandler.emit(this.employeedetails);
      } else {
        this.employeedetails['IsEmployeeDeductionApplicable'] = false;
        this.DeductionDetailsChangeHandler.emit(this.employeedetails);
      }
    }
  }
  autotrigger() {

    // this.employeeService.getpayment(15001).subscribe((res)=>{
    //   console.log('sss',res);

    // }
    // )
    // if (this.Id == undefined) {
    //   this.router.navigate(['/app/listing/ui/employeelist']);
    //   return;
    // }
    this.spinner = true;
    this.DOBmaxDate = new Date();
    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);

    this._loadEmpUILookUpDetails().then(answer => {

      this.edit_EmployeeDetails().then(res => {
        // this.doAcademicSlickGrid();
        // this.doExperienceSlickGrid();
        //this.doBankSlickGrid();
        // this.doNomineeSlickGrid();
        this.getDeductionControlList();
      });

    });


  }
  onChangeDOB(dobDate) {
    this.DOB = dobDate;
  }

  onChangeStartDate(event) {

    if (this.employeeForm.get('startdate').value != null || this.employeeForm.get('startdate').value != undefined || event != null || event != undefined) {
      this.employeeForm.controls['enddate'].setValue(null);
      var StartDate = new Date(event);
      this.EnddateminDate = new Date();
      this.EnddateminDate.setMonth(StartDate.getMonth());
      this.EnddateminDate.setDate(StartDate.getDate() + 1);
      this.EnddateminDate.setFullYear(StartDate.getFullYear());

    }

  }
  doBankSlickGrid() {

    let previewFormatter: Formatter;
    previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
  class="mdi mdi-eye m-r-xs"></i> View </button>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';

    this.columnDefinitions_Bank = [
      { id: 'bankFullName', name: 'Bank Name', field: 'bankFullName', sortable: true },
      { id: 'accountNumber', name: 'Account Number', field: 'accountNumber', sortable: true },
      { id: 'bankBranchId', name: 'IFSC Code', field: 'bankBranchId', sortable: true },
      { id: 'IsDefaultText', name: 'IsDefault', field: 'IsDefaultText', sortable: true },
      { id: 'allocation', name: 'Allocation', field: 'allocation', sortable: true },
      { id: 'StatusName', name: 'Status', field: 'StatusName', sortable: true, cssClass: `` },
      {
        id: 'preview',
        field: 'id',

        excludeFromHeaderMenu: true,
        formatter: previewFormatter,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          console.log('s', args);

          if (args.dataContext.CandidateDocument == null) {
            this.alertService.showInfo('Note: Preview of document not available.');
            return;
          }
          this.viewDocs(args.dataContext.CandidateDocument, 'Bank');
        }
      },
      {
        id: 'edit',
        field: 'id',

        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          if (this.isESSLogin && !this.isLoading) { this.alertService.showWarning("Do you want to keep editing, please activate edit mode on your screen?"); return; }

          if (args.dataContext.StatusName == 'Approved' && !this.isDuplicateBankInfo) {
            this.alertService.showInfo('Please note: The operation has been blocked.  For additional information, please consult our Knowledge Base.');
            return;
          }

          if (args.dataContext.StatusName == 'Approved' && this.isDuplicateBankInfo && this.isGuid(args.dataContext.Id) == false) {
            this.alertService.showInfo('Please note: The operation has been blocked.  For additional information, please consult our Knowledge Base.');
            return;
          }

          if (this.isDuplicateBankInfo && this.isGuid(args.dataContext.Id) == true) {
            this.addBank(args.dataContext);
            this.employeeForm.enable(), this.isLoading = true;

          }


          this.addBank(args.dataContext);
          this.employeeForm.enable(), this.isLoading = true;
        }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          // if (this.isESSLogin && !this.isLoading) { this.alertService.showWarning("Do you want to keep editing, please activate edit mode on your screen?"); return; }
          // if (args.dataContext.StatusName == 'Approved') {
          //   this.alertService.showInfo('Please note: The operation has been blocked.  For additional information, please consult our Knowledge Base.');
          //   return;
          // }
          this.alertService.confirmSwal("Are you sure you would like to remove that Record?", "After deleting this item, you will not be in a position to get this!", "Yes, Delete").then(result => {

            if (this.isGuid(args.dataContext.Id) == false) {
              var candidateBankDetails = new EmployeeBankDetails();
              candidateBankDetails.BankId = args.dataContext.Id.bankName;
              candidateBankDetails.BankBranchId = args.dataContext.Id.IFSCCode;
              candidateBankDetails.AccountNumber = args.dataContext.Id.accountNumber;
              candidateBankDetails.AccountHolderName = args.dataContext.Id.accountHolderName;
              candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
              candidateBankDetails.IdentifierValue = args.dataContext.Id.bankBranchId;
              candidateBankDetails.SalaryContributionPercentage = args.dataContext.Id.allocation;
              candidateBankDetails.IsDefault = true;
              candidateBankDetails.Status = ApprovalStatus.Pending;
              // this.candidateBankDetails.Modetype =  UIMode.Edit;;
              candidateBankDetails.Modetype = UIMode.Delete,
              candidateBankDetails.Id = args.dataContext.Id,
              candidateBankDetails.CandidateDocument = args.dataContext.Id.CandidateDocument
              this.deletedBanks.push(candidateBankDetails)
            }
            this.angularGrid_Bank.gridService.deleteDataGridItemById(args.dataContext.Id);
            this.angularGrid_Bank.gridService.highlightRow(args.row, 1500);
            this.angularGrid_Bank.gridService.setSelectedRow(args.row);
          }).catch(error => {

          });
        }

      },

    ];

    this.gridOptions_Bank = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      // enableFiltering: true,

      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
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

  doNomineeSlickGrid() {
    this.columnDefinitions = [
      { id: 'nomineeName', name: 'Nominee Name', field: 'nomineeName', sortable: true, },
      { id: 'RelationShip', name: 'Relationship', field: 'RelationShip', sortable: true, },
      { id: 'FamilyPF', name: 'PF (%)', field: 'FamilyPF', sortable: true },
      { id: 'FamilyGratuity', name: 'Gratuity  (%)', field: 'FamilyGratuity', sortable: true },
      // { id: 'IDProof', name: 'ID Proof', field: 'IDProof', sortable: true },
      {
        id: 'edit',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          this.addNominee(args.dataContext);
        }
      },
      {
        id: 'delete',
        field: 'id',


        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {


          var x = confirm("Are you sure you want to delete?");
          if (x) {
            this.removeSelectedRow(args.dataContext, "Nominee").then((result) => {

            });
            this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.Id);
            return true;
          }
          else
            return false;



        }
      },

    ];

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: 'Id',
      editable: true,

      forceFitColumns: true,
      // enableFiltering: true,

      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,
        // you can override the logic for showing (or not) the expand icon
        // for example, display the expand icon only on every 2nd row
        // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
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

  removeSelectedRow(args, whicharea) {
    return new Promise((resolve, reject) => {
      const isCheck = this.isGuid(args.Id);
      if (isCheck && args.DocumentId != null) {
        this.doDeleteFileNominee(args.DocumentId, null).then(() => {
          resolve(true);
        });
      }
      else {
        args.Modetype = UIMode.Delete;
        if (args.CandidateDocument != null && args.CandidateDocument.DocumentId != null) {
          args.CandidateDocument.Modetype = UIMode.Delete;
        }

        if (whicharea == "Nominee") {
          this.deletedLstNominee.push(args);

        } else if (whicharea == "Education") {
          this.deletedLstEducation.push(args);
        }
        else if (whicharea == "Experience") {
          this.deletedLstExperience.push(args);
        }
        resolve(true);
      }
    });
  }


  doDeleteFileNominee(Id, element) {


    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var candidateDocumentDelete = [];

        this.fileuploadService.deleteObjectStorage((Id)).subscribe((res) => {
          if (res.Status) {
            if (this.unsavedDocumentLst.length > 0) {
              var index = this.unsavedDocumentLst.map(function (el) {
                return el.Id
              }).indexOf(Id);

              // Delete  the item by index.
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
  }


  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }



  angularGridReady_Bank(angularGrid: AngularGridInstance) {
    this.angularGrid_Bank = angularGrid;
    this.gridOptions_Bank = angularGrid && angularGrid.slickGrid || {};
  }


  //#region Events

  loadData(event) {
    this.spinner = true;
    if (event.nextId == 'isCommunicationdetails') {
      // accordion_Name == "isCommunicationdetails"
      // alert(event.nextId )
      this.doAccordionLoading('isCommunicationdetails');
    }
    else if (event.nextId == 'isBankInfo') {
      this.BankInfoListGrp == undefined ? this.doAccordionLoading(event.nextId) : undefined;
    }
    else if (event.nextId == 'isFamilydetails') {
      this.FamilyInofListGrp == undefined ? this.doAccordionLoading(event.nextId) : undefined;
    }
    else if (event.nextId == 'EmployementDetails') {
      // this.doAccordionLoading("isMigrationInfo");
      this.doAccordionLoading("isOnboardingInfo");
      this.doAccordionLoading("isOfferInfo");
      this.doAccordionLoading("isCommunicationdetails");
      this.getMigrationMasterInfo(this.employeedetails.EmploymentContracts[0].ClientContractId);
    }
    else if (event.nextId == "isInvestmentInfo") {
      this.isSummary_panel = true;
      this.isInvestment_panel = false;
      this.isDeduction_panel = false;
      this.isAdditional_panel = false;
    }
    else if (event.nextId == "isDocumentInfo") {
      this.doAccordionLoading("isDocumentInfo");
    }
    setTimeout(() => {
      this.spinner = false;
    }, 1500);
    this.activeTabName = event.nextId;
  }

  activetabnameDynamic() {


    if (this.activenavtab == 'investmentInformation') {
      this.isSummary_panel = true;
      this.isInvestment_panel = false;
      this.isDeduction_panel = false;
      this.isAdditional_panel = false;
    } else if (this.activenavtab == 'profile') {

      this.CommunicationListGrp == undefined ? this.doAccordionLoading('isCommunicationdetails') : undefined;

    } else if (this.activenavtab == 'bankInformation') {
      this.BankInfoListGrp == undefined ? this.doAccordionLoading('isBankInfo') : undefined;

    }
    else if (this.activenavtab == 'nomineeInformation') {
      this.FamilyInofListGrp == undefined ? this.doAccordionLoading('isFamilydetails') : undefined;

    }
    else if (this.activenavtab == 'employmentInformation') {

    }
    else if (this.activenavtab == 'paymentInformation') {

    }
    else if (this.activenavtab == 'currentEmployment') {
      this.doAccordionLoading("isOnboardingInfo");
      this.doAccordionLoading("isOfferInfo");
    }

  }



  public doAccordionLoading(accordion_Name: any) {
    this.should_spin_onboarding = true;
    this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId, 0)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;

        if (apiResult.Status && apiResult.Result != "") {

          if (accordion_Name == "isCommunicationdetails") {
            this.CommunicationListGrp = JSON.parse(apiResult.Result);
            this.CountryList = _.orderBy(this.CommunicationListGrp.CountryList, ["Name"], ["asc"]);

            if (this.Id != 0) {
              try {
                var countryEventId = (this.employeeForm.get('presentCountryName').value == null || this.employeeForm.get('presentCountryName').value == 0 ? null : this.employeeForm.get('presentCountryName').value);
                var countryEvent1Id = (this.employeeForm.get('permanentCountryName').value == null || this.employeeForm.get('permanentCountryName').value == 0 ? null : this.employeeForm.get('permanentCountryName').value);
                this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);
                this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === Number(countryEvent1Id)), ["Name"], ["asc"]);
                this.StateList2 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);

                this.should_spin_onboarding = false;

              } catch (error) {
              }
            } else { this.should_spin_onboarding = false; }
          }

          if (accordion_Name == "isBankInfo") {
            // this.is_spinner_ifsc = true;
            this.BankInfoListGrp = JSON.parse(apiResult.Result);
            this.BankList = this.BankInfoListGrp.BankList;
            // console.log('bankslist',this.BankList);
            this.BankDocumentCategoryList = this.BankInfoListGrp.BankDocumentCategoryList;
            let BankName = this.employeeForm.get('bankName').value;
            // this.is_spinner_ifsc = false;
            this.isrendering_spinner = false;

            if (BankName != null) {
              this.isrendering_spinner = true;
              this.is_spinner_ifsc = true;

              let bankId = (this.BankList.find(z => z.Id == BankName)).Id;
              this.onboardingService.getBankBranchByBankId(bankId)
                .subscribe(authorized => {
                  const apiResponse: apiResponse = authorized;
                  this.BranchList = apiResponse.dynamicObject;
                  this.is_spinner_ifsc = false;
                  this.isrendering_spinner = false;
                }), ((err) => {

                });
            }

            else {
              this.isrendering_spinner = false;
            }
          }

          if (accordion_Name == "isFamilydetails") {
            this.FamilyInofListGrp = JSON.parse(apiResult.Result);
            this.FamilyDocumentCategoryList = this.FamilyInofListGrp.FamilyDocumentCategoryist;
          }

          if (accordion_Name == "isMigrationInfo") {
            this.getMigrationMasterInfo(this.employeedetails.EmploymentContracts[0].ClientContractId);
          }

          if (accordion_Name == "isOfferInfo") {

            this.OfferInfoListGrp = JSON.parse(apiResult.Result);
            this.ClientLocationList = _.orderBy(this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.employeedetails.EmploymentContracts[0].ClientId), ["LocationName"], ["asc"]);
            this.EmploymentTypeList = this.OfferInfoListGrp.EmploymentTypeList != null && this.OfferInfoListGrp.EmploymentTypeList.length > 0 ? this.OfferInfoListGrp.EmploymentTypeList : [];
            this.isESSLogin ? this.getMigrationMasterInfo(this.employeedetails.EmploymentContracts[0].ClientContractId) : true;

          }

          if (accordion_Name == "isOnboardingInfo") {
            this.OnBoardingInfoListGrp = JSON.parse(apiResult.Result);
            let i = this.OnBoardingInfoListGrp.ClientContractList.filter(a => a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId);
            this.ClientContractList = _.orderBy(i, ["Name"], ["asc"]);
            this.ClientList = _.orderBy(this.OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);

            if (this.BusinessType != 3) {
              this.ClientList = this.ClientList.filter(x => x.Id == this.sessionService.getSessionStorage('default_SME_ClientId'))
            }

          }

          if (accordion_Name == "isDocumentInfo") {
            var DocumentInfoListGrp = JSON.parse(apiResult.Result);
            this.DocumentCategoryist = DocumentInfoListGrp.DocumentCategoryist;

            try {
              this.onDocumentClick();

            } catch (error) { }

          }
        }

        else {
          // this.alertService.showWarning("Show Message for empty flatlist")
          this.should_spin_onboarding = false;
        }
      }, (error) => {
        this.should_spin_onboarding = false;
      });
  }

  /* #endregion */


  //  Offer Information details ** region start ** 

  onchangecountry(country) {
    this.employeeForm.controls['statename'].setValue(null);
    this.StateList2 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);


  }
  onChangeStateByCountryId(country) {

    this.employeeForm.controls['presentStateName'].setValue(null);
    this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);


  }
  onChangeStateByCountryId1(country) {
    this.employeeForm.controls['permanentStateName'].setValue(null);
    this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);

  }
  //  Offer Information details ** region end ** 

  public onSameAddressPresentChanged(value: boolean) {

    this.isSameAddress = value;

    if (this.isSameAddress) {

      this.employeeForm.controls['permanentAddressdetails'] != null ? this.employeeForm.controls['permanentAddressdetails'].setValue(this.employeeForm.get('presentAddressdetails').value) : null;
      this.employeeForm.controls['permanentAddressdetails1'] != null ? this.employeeForm.controls['permanentAddressdetails1'].setValue(this.employeeForm.get('presentAddressdetails1').value) : null;
      this.employeeForm.controls['permanentAddressdetails2'] != null ? this.employeeForm.controls['permanentAddressdetails2'].setValue(this.employeeForm.get('presentAddressdetails2').value) : null;
      this.employeeForm.controls['permanentCountryName'] != null ? this.employeeForm.controls['permanentCountryName'].setValue(this.employeeForm.get('presentCountryName').value) : null;
      this.employeeForm.controls['permanentPincode'] != null ? this.employeeForm.controls['permanentPincode'].setValue(this.employeeForm.get('presentPincode').value) : null;
      this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === this.employeeForm.get('presentCountryName').value), ["Name"], ["asc"]);
      this.employeeForm.controls['permanentStateName'] != null ? this.employeeForm.controls['permanentStateName'].setValue(this.employeeForm.get('presentStateName').value) : null;
      this.employeeForm.controls['permanentCity'] != null ? this.employeeForm.controls['permanentCity'].setValue(this.employeeForm.get('presentCity').value) : null;

    } else {


      this.employeeForm.controls['permanentAddressdetails'] != null ? this.employeeForm.controls['permanentAddressdetails'].setValue(null) : null;
      this.employeeForm.controls['permanentAddressdetails1'] != null ? this.employeeForm.controls['permanentAddressdetails1'].setValue(null) : null;
      this.employeeForm.controls['permanentAddressdetails2'] != null ? this.employeeForm.controls['permanentAddressdetails2'].setValue(null) : null;
      this.employeeForm.controls['permanentCountryName'] != null ? this.employeeForm.controls['permanentCountryName'].setValue(null) : null;
      this.employeeForm.controls['permanentStateName'] != null ? this.employeeForm.controls['permanentStateName'].setValue(null) : null;
      this.employeeForm.controls['permanentPincode'] != null ? this.employeeForm.controls['permanentPincode'].setValue(null) : null;
      this.employeeForm.controls['permanentCity'] != null ? this.employeeForm.controls['permanentCity'].setValue(null) : null;

      this.StateList1 = [];
    }
  }


  onChangeBank(bank) {

    this.is_spinner_ifsc = true;

    this.employeeForm.controls['IFSCCode'].setValue(null);
    this.BranchList = [];
    this.onboardingService.getBankBranchByBankId(bank.Id)
      .subscribe(authorized => {


        const apiResponse: apiResponse = authorized;
        this.BranchList = apiResponse.dynamicObject;
        this.is_spinner_ifsc = false;

      }), ((err) => {

      });

  }

  onChangeIFSC(event) {
    this.BankBranchId = event.FinancialSystemCode;
  }




  getEmployeeBasicInfo(Code) {
    this.delete_ProfileAvatarDocument = [];
    const promise = new Promise((resolve, reject) => {


      // alert(this.sessionService.getSessionStorage('DefaultFinancialYearId'))
      this.dynamicPFInvestments = [];
      this.PFAmount = 0;
      this.PTAmount = 0
      const req_params_Uri = Code;
      this.searchService.getESSDashboardDetails(req_params_Uri).subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          try {

            var jsonObj = JSON.parse(apiResult.Result);
            console.log('JSON BASIC ::', jsonObj);

            jsonObj.FinancialDetails != null && jsonObj.FinancialDetails.length > 0 && this.sessionService.setSesstionStorage('DefaultFinancialYearId', jsonObj.FinancialDetails[0].Id);
            jsonObj.TaxDeclaration != null && this.sessionService.setSesstionStorage('TaxDeclaration', jsonObj.TaxDeclaration);
            // jsonObj.SalaryBreakup.length > 0 && jsonObj.SalaryBreakup[0].Taxitemdata != null && this.sessionService.setSesstionStorage('HRA_Annual_Basic', (jsonObj.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'Basic').Amount));
            // jsonObj.SalaryBreakup.length > 0 && jsonObj.SalaryBreakup[0].Taxitemdata != null && this.sessionService.setSesstionStorage('HRA_Annual_HRA', (jsonObj.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'HRA').Amount));
            jsonObj.TaxDeclaration != null ? this.TaxDeclaration = jsonObj.TaxDeclaration : this.TaxDeclaration = this.sessionService.getSessionStorage('TaxDeclaration');

            if (jsonObj.SalaryBreakup.SalaryBreakup != null && jsonObj.SalaryBreakup.SalaryBreakup.length > 0 && jsonObj.SalaryBreakup.SalaryBreakup[0].hasOwnProperty('Taxitemdata')
            ) {
              jsonObj.SalaryBreakup.SalaryBreakup[0].Taxitemdata != null && jsonObj.SalaryBreakup.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode.toUpperCase() == 'BASIC') != undefined && this.sessionService.setSesstionStorage('HRA_Annual_Basic', (jsonObj.SalaryBreakup.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'Basic').Amount));
              jsonObj.SalaryBreakupSalaryBreakup[0].Taxitemdata != null && jsonObj.SalaryBreakup.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode.toUpperCase() == 'HRA') != undefined && this.sessionService.setSesstionStorage('HRA_Annual_HRA', (jsonObj.SalaryBreakup.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'HRA').Amount));

            } else {
              this.sessionService.setSesstionStorage('HRA_Annual_Basic', 0);
              this.sessionService.setSesstionStorage('HRA_Annual_HRA', 0);
            }


            jsonObj.SalaryBreakup.length > 0 && jsonObj.SalaryBreakup.forEach(element => {

              if (element.Taxitemdata != null && element.Taxitemdata.length > 0) {
                let isPFExists = element.Taxitemdata.find(z => z.PayTransactionHead.toUpperCase() == 'SAVINGS' && z.ProductCode == 'PF');
                if (isPFExists != undefined) {
                  this.PFAmount += parseInt(isPFExists.Amount)
                }
                // this.PFAmount += parseInt(element.Taxitemdata.find(z => z.PayTransactionHead.toUpperCase() == 'SAVINGS' && z.ProductCode.toUpperCase() == 'PF').Amount);
                var isPTExists = element.Taxitemdata.find(z => z.PayTransactionHead.toUpperCase() == 'DEDUCTIONS' && z.ProductCode == 'PT');
                if (isPTExists != undefined) {
                  this.PTAmount += parseInt(isPTExists.Amount)
                }
                // this.PTAmount += parseInt(element.Taxitemdata.find(z => z.PayTransactionHead.toUpperCase() == 'SAVINGS' && z.ProductCode.toUpperCase() == 'PT').Amount)
              }
            });

            // if (jsonObj.SalaryBreakup.length > 0) {

            //   //let _exemptionList = [];
            //   this._exemptionList = jsonObj.SalaryBreakup[0].Taxitemdata.filter(z => z.PayTransactionHead.toUpperCase() == 'GROSSSALARY');
            //   let isHRAExist = this._exemptionList.find(e => e.ProductCode == 'HRA')
            //   let isTPAExist = this._exemptionList.find(e => e.ProductCode == 'TelePhoneAllow')
            //   let isVRExist = this._exemptionList.find(e => e.ProductCode == 'VehicleReimb')
            //   let isPDRExist = this._exemptionList.find(e => e.ProductCode == 'PDR')
            //   let isLTAExist = this._exemptionList.find(e => e.ProductCode == 'LTA')
            //   let isCLExist = this._exemptionList.find(e => e.ProductCode == 'CarLease')
            //   let isFCExist = this._exemptionList.find(e => e.ProductCode == 'FoodCoupon')
            //   let isCAExist = this._exemptionList.find(e => e.ProductCode == 'CAR_ALLOW')  


            //   if (jsonObj.SalaryBreakup[0].Taxitemdata != null && jsonObj.SalaryBreakup[0].Taxitemdata.length > 0) {
            //     let isPFExists = jsonObj.SalaryBreakup[0].Taxitemdata.find(z => z.PayTransactionHead.toUpperCase() == 'SAVINGS' && z.ProductCode == 'PF');
            //     if (isPFExists != undefined) {
            //       this.PFAmount += parseInt(isPFExists.Amount)
            //     }
            //     var isPTExists = jsonObj.SalaryBreakup[0].Taxitemdata.find(z => z.PayTransactionHead.toUpperCase() == 'DEDUCTIONS' && z.ProductCode == 'PT');
            //     if (isPTExists != undefined) {
            //       this.PTAmount += parseInt(isPTExists.Amount)
            //     }

            //   }
            // }



            jsonObj.FinancialDetails != null && jsonObj.FinancialDetails.length > 0 && this.employeeForm.controls['financialYear'].setValue(this.sessionService.getSessionStorage('DefaultFinancialYearId'));
            jsonObj.SalaryBreakup.length > 0 &&
              this.dynamicPFInvestments.push({

                Name: 'PF',
                AmtInvested: this.PFAmount,
                AmtApproved: 0,
                Status: "Pending"
              },
                {

                  Name: 'PT',
                  AmtInvested: this.PTAmount,
                  AmtApproved: 0,
                  Status: "Pending"
                }
              )



            resolve(true);

          } catch (error) {

            console.log('Exception :', error);

          }

        }
      }, err => {

      });

    })
    return promise;
  }




  edit_EmployeeDetails() {
    return new Promise((res, rej) => {

      this.spinner = true;
      if (this.isESSLogin == true) {
        this.employeeService.getEmployeeDetailsById(this.EmployeeId).subscribe((result) => {
          console.log('EMP RESULT :', result);
          this.post_BindingEMPRecord(result);
          this.spinner = false;
          res(true);
        }, err => {
          console.log('EMP RESULT ERR:', err);
          rej();
        })
      } else {
        this.employeeService.getEmployeeDetailsById(this.Id).subscribe((result) => {
          console.log('EMP RESULT :', result);
          this.post_BindingEMPRecord(result);
          this.spinner = false;
          res(true);
        }, err => {
          console.log('EMP RESULT ERR:', err);
          rej();
        })
      }
    });
    

  }


  async post_BindingEMPRecord(result) {
    this.spinner = true;
    let apiResult: apiResult = (result);

    this._OldEmployeeDetails = result.Result;
    this.employeedetails = result.Result;
    this.isActiveEmployee = this.employeedetails.EmploymentContracts[0].Status;
    this.enableAddDeductionBtn = this.isActiveEmployee == 0 ? false : true;
    this.isESSLogin && setTimeout(() => {
      //this.activetabnameDynamic();
    }, 1500);

    //this.GetEmployeeTaxItem(this.employeedetails.Id).then((res => { console.log('EMPLOYEE TAX ITEM COMPLETED') }));

    this.isESSLogin == true ? this._EmployeeName = this.employeedetails.FirstName : true;
    this.isESSLogin == true ? this._EmployeeCode = this.employeedetails.Code : true;
    this._Designation = this.employeedetails.EmploymentContracts[0].Designation;
    this.Employee = result.Result;
    var dojYear = new Date(this.employeedetails.EmploymentContracts[0].StartDate)
    this.yearrange_builder(dojYear.getFullYear());
    let currentYear = new Date().getFullYear();
    this.selectedyear = this.yearrangeList.find(a => a.label == currentYear).value;

    this.employeeModel.oldobj = Object.assign({}, result.Result);
    this.spinner = false;
    if (apiResult.Result != null && false) {
      this.getEmployeeBasicInfo(this.employeedetails.Code).then((result) => {
        this._OriginalAadhaarNumber = this.employeedetails.Aadhaar;
        this._OrginalPanNo = this.employeedetails.PAN
        this.employeeForm.patchValue(this.employeedetails);
        this.Id = this.employeedetails.Id;
        this.isActiveEmployee = this.employeedetails.EmploymentContracts[0].Status;

        this.employeeForm.controls['Name'].setValue(this.employeedetails.FirstName);
        this.employeeForm.controls['Status'].setValue(this.employeedetails.Status);
        this.employeeForm.controls['gender'].setValue(this.employeedetails.Gender);
        this.employeeForm.controls['dateOfBirth'].setValue(new Date(this.employeedetails.DateOfBirth));
        this.employeeForm.controls['fatherName'].setValue((this.employeedetails.FatherName == null || this.employeedetails.FatherName == 'NULL') ? '' : this.employeedetails.FatherName);
        this.employeeForm.controls['PANNO'].setValue((this.employeedetails.PAN == null || this.employeedetails.PAN == 'NULL') ? '' : this.employeedetails.PAN);
        this.employeeForm.controls['UAN'].setValue((this.employeedetails.UAN == null || this.employeedetails.UAN == 'NULL') ? '' : this.employeedetails.UAN);
        this.employeeForm.controls['ESIC'].setValue((this.employeedetails.ESIC == null || this.employeedetails.ESIC == 'NULL') ? '' : this.employeedetails.ESIC);
        this.employeeForm.controls['PFNumber'].setValue((this.employeedetails.EmploymentContracts[0]['PFNumber'] == null) ? '' : this.employeedetails.EmploymentContracts[0]['PFNumber']);

        this.employeeForm.controls['adhaarnumber'].setValue(this.employeedetails.Aadhaar != null ? this._aadhaar_inputMask(this.employeedetails.Aadhaar) : null);
        this.labelMobileNumber = this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile : null;
        this.labelEmail = this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail : null;
        this.employeeForm.controls['mobile'].setValue(this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile : null);
        this.employeeForm.controls['email'].setValue(this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail : null);

        if (this.employeedetails && this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
          let officialmailId = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2);
          if (officialmailId) {
            this.employeeForm.controls['officialEmail'].setValue(officialmailId.PrimaryEmail);
          }

        }



        // EMPLOYMENT DETAILS 
        this.employeeForm.controls['contractname'].setValue(this.employeedetails.EmploymentContracts[0].ClientContractId == 0 ? null : this.employeedetails.EmploymentContracts[0].ClientContractId);
        this.employeeForm.controls['employmentType'].setValue(this.employeedetails.EmploymentContracts[0].EmploymentType == 0 ? null : this.employeedetails.EmploymentContracts[0].EmploymentType);
        this.employeeForm.controls['IsESSRequired'].setValue(this.employeedetails.EmploymentContracts[0].IsESSRequired == null ? true : this.employeedetails.EmploymentContracts[0].IsESSRequired);

        this.employeeForm.controls['clientname'].setValue(this.employeedetails.EmploymentContracts[0].ClientId == 0 ? null : this.employeedetails.EmploymentContracts[0].ClientId);
        this.employeeForm.controls['employername'].setValue(this.employeedetails.FirstName);
        this.employeeForm.controls['employeecode'].setValue(this.employeedetails.Code);
        this.employeeForm.controls['teamname'].setValue(this.employeedetails.EmploymentContracts[0].TeamId == 0 ? null : this.employeedetails.EmploymentContracts[0].TeamId);
        this.employeeForm.controls['reportingmanager'].setValue(this.employeedetails.EmploymentContracts[0].ManagerId == 0 ? null : this.employeedetails.EmploymentContracts[0].ManagerId);
        // this.employeeForm.controls['dateofjoining'].setValue(this.datePipe.transform(this.employeedetails.EmploymentContracts[0].StartDate, "dd-MM-yyyy"));
        this.employeeForm.controls['employementstartdate'].setValue(new Date(this.employeedetails.EmploymentContracts[0].StartDate));
        this.employeeForm.controls['employementenddate'].setValue(this.employeedetails.EmploymentContracts[0].EndDate == "0001-01-01T00:00:00" ? null : new Date(this.employeedetails.EmploymentContracts[0].EndDate));
        this.employeeForm.controls['LWD'].setValue(this.employeedetails.EmploymentContracts[0].LWD == null ? null : moment(new Date(this.employeedetails.EmploymentContracts[0].LWD)).format('DD-MM-YYYY'));

        this.employeeForm.controls['Designation'].setValue(this.employeedetails.EmploymentContracts[0].Designation);
        this.employeeForm.controls['Department'].setValue(this.employeedetails.EmploymentContracts[0].Department);
        this.employeeForm.controls['Grade'].setValue(this.employeedetails.EmploymentContracts[0].Grade);
        this.employeeForm.controls['Location'].setValue(Number(this.employeedetails.EmploymentContracts[0].WorkLocation));
        this.employeeForm.controls['statename'].setValue(this.employeedetails.EmploymentContracts[0].StateId);
        this.employeeForm.controls['Country'].setValue(100);
        this.employeeForm.controls['costcode'].setValue(this.employeedetails.EmploymentContracts[0].CostCodeId == 0 ? null : this.employeedetails.EmploymentContracts[0].CostCodeId);
        this.employeeForm.controls['jobtype'].setValue(null);
        this.employeeForm.controls['companyname'].setValue(null);

        this.employeeForm.controls['financialYear'].setValue(this.sessionService.getSessionStorage('DefaultFinancialYearId'));
        this.employeeForm.controls['IsNewTaxRegimeOpted'].setValue(this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted);
        this.getDynamicFieldDetailsConfig(this.CompanyId, this.employeeForm.get('clientname').value, this.employeeForm.get('contractname').value).then(() => console.log("Task Complete!"));

        this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? this.employeeForm.controls['IsNewTaxRegimeOpted'].disable() : this.employeeForm.controls['IsNewTaxRegimeOpted'].enable();
        this.IsESICApplicableForKeyIn = this.employeedetails.EmploymentContracts[0].IsESICApplicable;

        this.ELCTransactions = this.employeedetails.ELCTransactions.length > 0 ? this.employeedetails.ELCTransactions : [];
        var tst = this.ELCTransactions != null && this.ELCTransactions.length > 0 &&
          this.ELCTransactions.find(a => a.IsLatest == true);

        this.isESICapplicable = tst != undefined && tst != null && tst.EmployeeRatesets != null && tst.EmployeeRatesets.length > 0 && tst.EmployeeRatesets[0].RatesetProducts != null && tst.EmployeeRatesets[0].RatesetProducts != undefined && tst.EmployeeRatesets[0].RatesetProducts.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;
        // this.LstemploymentDetails = this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(z => z.FinancialYearId == this.employeeForm.get('financialYear').value); old code 
        this.LstemploymentDetails = this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails;

        this.LstemploymentDetails != null && this.LstemploymentDetails.length > 0 && this.LstemploymentDetails.forEach(element => {
          element['FinancialYearName'] = this.FicalYearList.find(a => a.Id == element.FinancialYearId).code;
        });
        this.LstemploymentDetails != null && this.LstemploymentDetails.length > 0 ? this.LstemploymentDetails = _.orderBy(this.LstemploymentDetails, ['FinancialYearId', 'StartDate'],
          ['desc', 'asc']) : true;
        this.isESSLogin ? (this.shouldhide = true) : true;
        // this.isESSLogin && this.activenavtab == 'employmentInformation' && (this.LstemploymentDetails.length == undefined || this.LstemploymentDetails.length == 0) ? (this.shouldhide = false) : true;
        // this.isESSLogin && this.activenavtab == 'employmentInformation' && this.LstemploymentDetails.length != undefined && this.LstemploymentDetails.length > 0 ? (this.shouldhide = true) : true;
        this.get_EmployeePaymentHistory();

        if (this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.FinancialYearId == this.employeeForm.get('financialYear').value) {
          this.isInvestmentUnderQC = this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.Status == ApprovalStatus.Pending ? true : false;
          this.isInvestmentQcRejected = this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.Status == ApprovalStatus.Rejected ? true : false;
        }
        //AADHAAR NUMBER (AUTO)
        if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
          var isAadhaarExist = this.employeedetails.CandidateDocuments.find(lst => lst.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && lst.Status == ApprovalStatus.Approved);
          isAadhaarExist != undefined && (this.employeeForm.controls['adhaarnumber'].setValue(isAadhaarExist.DocumentNumber != null ? this._aadhaar_inputMask(isAadhaarExist.DocumentNumber) : null), this._OriginalAadhaarNumber = isAadhaarExist.DocumentNumber);
          isAadhaarExist != undefined ? (this.isAadhaarNotEditable = true) : this.isAadhaarNotEditable = null;

          var isPANExist = this.employeedetails.CandidateDocuments.find(lst => lst.DocumentTypeId == environment.environment.PANDocumentTypeId && lst.Status == ApprovalStatus.Approved);
          isPANExist != undefined && this.employeeForm.controls['PANNO'].setValue(isPANExist.DocumentNumber);
          isPANExist != undefined ? (this.isPANNotEditable = true) : this.isPANNotEditable = null;
        }

        // For Candidate Communication accordion  (Edit)
        if (this.employeedetails.EmployeeCommunicationDetails != null) {
          let _addressDetails: AddressDetails[] = [];
          _addressDetails = this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails;
          try {
            _addressDetails.forEach(element => {
              if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Present) {
                this.employeeForm.controls['presentAddressdetails'] != null ? this.employeeForm.controls['presentAddressdetails'].setValue(element.Address1) : null;
                this.employeeForm.controls['presentAddressdetails1'] != null ? this.employeeForm.controls['presentAddressdetails1'].setValue(element.Address2) : null;
                this.employeeForm.controls['presentAddressdetails2'] != null ? this.employeeForm.controls['presentAddressdetails2'].setValue(element.Address3) : null;
                this.employeeForm.controls['presentCountryName'] != null ? this.employeeForm.controls['presentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
                this.employeeForm.controls['presentPincode'] != null ? this.employeeForm.controls['presentPincode'].setValue(element.PinCode) : null;
                this.employeeForm.controls['presentStateName'] != null ? this.employeeForm.controls['presentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
                this.employeeForm.controls['presentCity'] != null ? this.employeeForm.controls['presentCity'].setValue(element.City) : null;
              }
              if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Permanent) {
                this.employeeForm.controls['permanentAddressdetails'] != null ? this.employeeForm.controls['permanentAddressdetails'].setValue(element.Address1) : null;
                this.employeeForm.controls['permanentAddressdetails1'] != null ? this.employeeForm.controls['permanentAddressdetails1'].setValue(element.Address2) : null;
                this.employeeForm.controls['permanentAddressdetails2'] != null ? this.employeeForm.controls['permanentAddressdetails2'].setValue(element.Address3) : null;
                this.employeeForm.controls['permanentCountryName'] != null ? this.employeeForm.controls['permanentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
                this.employeeForm.controls['permanentPincode'] != null ? this.employeeForm.controls['permanentPincode'].setValue(element.PinCode) : null;
                this.employeeForm.controls['permanentStateName'] != null ? this.employeeForm.controls['permanentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
                this.employeeForm.controls['permanentCity'] != null ? this.employeeForm.controls['permanentCity'].setValue(element.City) : null;
              }
            });

          }
          catch (error) { }
        }

        try {
          // For Bank Information accordion (Edit)
          if (this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
            this.LstBank = [];
            this.employeedetails.lstEmployeeBankDetails.forEach(element => {
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
                StatusName: element.Status == 1 ? 'Approved' : element.Status == 2 ? "Rejected" : 'Pending',
                proofType: "",
                CandidateDocument: element.CandidateDocument,
                DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
                isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
                Modetype: UIMode.None,
                bankFullName: element.BankName,
                IsDefault: element.IsDefault,
                IsDefaultText: element.IsDefault == true ? 'Yes' : 'No',
                VerificationMode: element.VerificationMode,
                VerificationAttempts: element.VerificationAttempts,
                PayoutLogId: element.PayoutLogId,
                Remarks: element.Remarks
              })

              element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Bank_Details");

            });

            this.isBankUnderQC = this.employeedetails.lstEmployeeBankDetails.filter(a => a.ModuleProcessTransactionId > 0 && a.Status == 0).length > 0 ? true : false;
          }
        } catch (error) { }

        // For Family Details accordion (Edit)
        if (this.employeedetails.EmpFamilyDtls != null && this.employeedetails.EmpFamilyDtls.length > 0) {
          this.LstNominees = [];
          this.employeedetails.EmpFamilyDtls.forEach(element => {
            if (element.CandidateDocument != null) {
              element.CandidateDocument.Modetype = UIMode.Edit;
            }
            this.LstNominees.push({
              Id: element.Id,
              id: element.Id,
              nomineeName: (element.Name),
              RelationShip: this.relationship.find(a => a.id == element.RelationshipId).name,
              DOB: element.DOB == "1900-01-01T00:00:00" ? null : element.DOB,
              IDProof: "",
              FamilyPF: element.LstClaims.find(a => a.ClaimType == ClaimType.PF) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.PF).Percentage : null,
              FamilyGratuity: element.LstClaims.find(a => a.ClaimType == ClaimType.Gratuity) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.Gratuity).Percentage : null,
              FamilyESIC: element.LstClaims.find(a => a.ClaimType == ClaimType.ESIC) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.ESIC).Percentage : null,
              FamilyaAdhar: "",
              FamilyisEmployed: element.IsEmployed,
              mediclaim: false,
              idProoftype: "",
              relationship: element.RelationshipId,
              Age: 0,
              CandidateDocument: element.CandidateDocument,
              DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
              isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
              Modetype: UIMode.Edit,
              DateofBirth: element.DOB == "1900-01-01T00:00:00" ? null : element.DOB,
            })
            element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Family_Details");
          });
        }

        // For Candidate Education Information accordion (Edit)

        if (this.employeedetails.Qualifications != null) {
          this.LstEducation = [];
          this.employeedetails.Qualifications.forEach(element => {
            if (element.CandidateDocument != null) {
              element.CandidateDocument.Modetype = UIMode.Edit;
            }

            this.LstEducation.push({
              Id: element.Id,
              id: element.Id,
              GraduationType: this.graduationType.find(a => a.id == element.GraduationType).name,
              educationDegree: element.EducationDegree,
              yearOfPassing: element.YearOfPassing,
              scoringValue: element.ScoringValue,
              courseType: element.CourseType,
              graduationType: element.GraduationType,
              institutaion: element.InstitutionName,
              scoringType: element.ScoringType,
              universityName: element.UniversityName,
              CandidateDocument: element.CandidateDocument,
              DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
              isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
              Modetype: UIMode.Edit
            })
            element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Education_Details");

          });
        }

        // For Candidate Experience Information accordion (Edit)
        if (this.employeedetails.WorkExperiences != null) {
          this.LstExperience = [];
          this.employeedetails.WorkExperiences.forEach(element => {
            if (element.CandidateDocument != null) {
              element.CandidateDocument.Modetype = UIMode.Edit;
            } this.LstExperience.push({
              Id: element.Id,
              id: element.Id,
              companyName: element.CompanyName,
              enddate: element.EndDate,
              fucntionalArea: null,
              isCurrentCompany: element.IsCurrentCompany,
              isFresher: false,
              lastDrawnSalary: element.LastDrawnSalary,
              noticePeriod: element.NoticePeriod == 0 ? null : element.NoticePeriod,
              rolesAndResponsiabilities: element.ResponsibleFor,
              startdate: element.StartDate,
              title: element.DesignationHeld,
              workLocation: element.WorkLocation,
              CandidateDocument: element.CandidateDocument,
              DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
              isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
              Modetype: UIMode.Edit,
              StartDate: this.datePipe.transform(element.StartDate, "dd-MM-yyyy"),
              EndDate: this.datePipe.transform(element.EndDate, "dd-MM-yyyy")
            })

            element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Experience_Details");

          });
        }


        // For Candidate Documents accordion (Edit)
        if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
          this.employeedetails.CandidateDocuments.forEach(element => {

            console.log(element.DocumentTypeId);
            // console.log(this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id);
            // console.log(element.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id);

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

            } else if (this.DocumentTypeList != null && this.DocumentTypeList.length > 0 && element.IsSelfDocument == false && this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar') != undefined && (element.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id) == true) {

              var contentType = this.fileuploadService.getContentType(element.FileName);
              if (contentType === 'application/pdf' || contentType.includes('image')) {
                try {

                  this.fileuploadService.getObjectById(element.DocumentId)
                    .subscribe(dataRes => {

                      try {


                        console.log('S3 BUKCKET DATA ::', dataRes);

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
                          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
                          console.log(this.contentmodalurl);
                        }
                      } catch (error) {
                        alert(error)
                      }
                    });
                } catch (error) {

                  alert('ERROR :: ' + error)
                }

              }

            } //http://cielhr.integrumapps.com/hrsuite/#/candidatelogin?Idx=s1hKlgoCdTnwGiBYUkuDlDppEIAXw4J28fprxwtg+hPiFrocE2irRu52fUkwvyVG
          });
        }
        if (this.employeedetails.LstEmployeeLetterTransactions != null && this.employeedetails.LstEmployeeLetterTransactions.length > 0) {
          this.employeeLetterTransactions = this.employeedetails.LstEmployeeLetterTransactions;
          this.employeeLetterTransactions.forEach(e => {
            e['TemplateCategroyDescription'] = this.lstlookUpDetails != null && this.lstlookUpDetails.TemplatecategoryList.find(a => a.Id == e.TemplateCategoryId).Description;
            e['TemplateCategroyCode'] = this.lstlookUpDetails != null && this.lstlookUpDetails.TemplatecategoryList.find(a => a.Id == e.TemplateCategoryId).Code;
          });
        }
        // let clientnameId = this.employeedetails.EmploymentContracts[0].ClientId;
        // let clientcontractnameid =  this.employeedetails.EmploymentContracts[0].ClientContractId;
        // this.employeeForm.controls['clientname'].setValue(clientnameId); 
        // this.employeeForm.controls['clientname'].setValue(clientnameId);


        this.load_preinsertedRecords();
        this.onChangeTaxRegime();
        this.doCheckSubmissionSlotDate();

        this.GetCompanySettings(this.CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId).then(() => console.log("GET COMPANY SETTINGS- Task Complete!"));

        if (environment.environment.IsClientDisableRequiredInEmploymentContract == true) {
          this.employeeForm.controls['clientname'].disable();
          this.employeeForm.controls['contractname'].disable();

        } else {
          this.employeeForm.controls['clientname'].enable();
          this.employeeForm.controls['contractname'].enable();

        }
        if (environment.environment.IsReportingManagerDisableRequiredInEmploymentContract == true) {
          this.employeeForm.controls['teamname'].disable();
          this.employeeForm.controls['reportingmanager'].disable();


        } else {
          this.employeeForm.controls['teamname'].enable();
          this.employeeForm.controls['reportingmanager'].disable();

        }
        // await this.getPF_records();

        this.spinner = false;
      })
      this.getAllEmployeeDeductionManagementbyEmployeeId(this.employeedetails.Id);
    } else {
      this.spinner = false;
    }

    // let list = []

    // for (let _exemptionitem of this.TaxationOtherCategory_Exemption) {
    //   let item = empRateSets.find(TaxationItem => TaxationItem.ProductId == _exemptionitem.ProductId)

    //   if (item && item.Value > 0 && _exemptionitem.ProductId !== 2) {
    //   }

    //   //   this.popupTaxBills.push({
    //   //       ProductName:item.DisplayName,
    //   //       Amount: item.Value,
    //   //       ApprovedAmount: 0,
    //   //       Status: "Pending"
    //   //   })
    //   // }
    // }
    //this.dynamicExeptions = [];

    //console.log("list",list)


    // this.TaxationOtherCategory_Exemption = list;


  }
  doCheckSubmissionSlotDate() {

    // Declaration = 1,
    // Proof = 2
    //    var _md: any = this.TaxDeclaration == 1 ? 1 : 2;

    var mode: any = this.TaxDeclaration != 1 ? 2 : 1;
    var SlotClosureDate: any = null;
    var SlotStartDate: any = null;
    this.indicateSubmissionSlotEnddate = false;
    var currentDate = moment().format('YYYY-MM-DD');
    if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
      (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
      SlotClosureDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
        (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == mode)[0].EndDay;
    } else {
      SlotClosureDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == mode).EndDay;
    }

    if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
      (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
      SlotStartDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
        (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == mode)[0].StartDay;
    } else {
      SlotStartDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == mode).StartDay;
    }
    this.indicateSubmissionSlotEnddate = moment(currentDate).isBetween(moment(SlotStartDate).format('YYYY-MM-DD'), moment(SlotClosureDate).format('YYYY-MM-DD')); // true

    console.log(SlotStartDate);

    if (moment(currentDate)
      .isSame(moment(SlotStartDate).format('YYYY-MM-DD'))) {
      this.indicateSubmissionSlotEnddate = true;
    }
    if (moment(currentDate)
      .isSame(moment(SlotClosureDate).format('YYYY-MM-DD'))) {
      this.indicateSubmissionSlotEnddate = true;
    }
    this.InvestmentClosedDate = SlotClosureDate;
  }

  rejectedDocs_init(element, AccordionName) {

    this.rejectedLst.push({

      CandidateId: AccordionName == "Client_Approvals" ? element.EntityId : element.CandidateId,
      FileName: element.DocumentName,
      Remarks: AccordionName == "Client_Approvals" ? element.RejectionRemarks : element.Remarks,
      Accordion: AccordionName
    });
  }



  onfamilyFileUpload(e) {

    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }

      // if (!file.type.match(pattern)) {
      //   this.isLoading = true;
      //   alert('You are trying to upload not Image. Please choose image.');
      //   return;
      // }


      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {

        this.spinnerText = "Uploading";
        this.familyFileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.familydocumentdoAsyncUpload(FileUrl, this.familyFileName)

      };

    }

  }

  familydocumentdoAsyncUpload(filebytes, filename) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = this.employeedetails.Id;
      objStorage.ClientContractCode = "";
      objStorage.ClientCode = "";
      objStorage.CompanyCode = this.CompanyId;
      objStorage.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
      objStorage.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
      objStorage.CompanyId = this.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";

      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {

        let apiResult: apiResult = (res);
        try {

          if (apiResult.Status && apiResult.Result != "") {


            this.employeeForm.controls['familyDocumentId'].setValue(apiResult.Result);
            this.employeeForm.controls['familyFileName'].setValue(this.FileName);
            this.familyDocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            });
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")
          }
          else {
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }

        } catch (error) {
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }


      }), ((err) => {

      })

    } catch (error) {
      this.FileName = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }


  }


  doDeleteFamilyFile() {
    // this.spinnerStarOver();
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "This item will be deleted immediately. You can't undo this file.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {

      if (result.value) {
        if (this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument != null) {
          this.familyFileName = null;
          this.employeeForm.controls['IsFamilyDocumentDelete'].setValue(true);
          this.employeeForm.controls['familyFileName'].setValue(null);
        }
        else if (this.employeeForm.get('nomineeId').value != null || this.isGuid(this.employeeForm.get('nomineeId').value)) {
          this.familydocumentdeleteAsync();
        }
        else if (this.employeeForm.get('nomineeId').value == null) {
          this.familydocumentdeleteAsync();
        }
        else if (this.firstTimeDocumentId != this.familyDocumentId) {
          this.familydocumentdeleteAsync();
        }
        else {


        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }


  familydocumentdeleteAsync() {


    this.isLoading = false;
    this.spinnerText = "Deleting";
    this.fileuploadService.deleteObjectStorage((this.familyDocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.familyDocumentId)
          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.employeeForm.controls['familyDocumentId'].setValue(null);
          this.employeeForm.controls['familyFileName'].setValue(null);
          this.familyFileName = null;
          this.familyDocumentId = null;
          this.employeeForm.controls['IsFamilyDocumentDelete'].setValue(false);
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
        }
      } catch (error) {

        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }

    }), ((err) => {

    })

  }


  onFileUpload(e) {
    // unknown fact i have commented this condition
    // if (this.DocumentTypeList == null || this.DocumentTypeList.length == 0) {
    //   this.alertService.showWarning("An error occurred during the attempt to upload the profile avatar!.  Please get in touch with administrative support.")
    //   return;
    // }
    // else 
    // if (this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar') == undefined || this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar') == null) {
    //   this.alertService.showWarning("An error occurred during the attempt to upload the profile avatar!.  Please get in touch with administrative support.")
    //   return;
    // }

    this.loadingScreenService.startLoading();
    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      // if (!file.type.match(pattern)) {
      //   this.isLoading = true;
      //   alert('You are trying to upload not Image. Please choose image.');
      //   return;
      // }


      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.spinnerText = "Uploading";
        this.FileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, this.FileName, 'Bank')

      };

    }

  }

  doAsyncUpload(filebytes, filename, whichSection) {


    try {
      this.loadingScreenService.startLoading();
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = this.employeedetails.Id;
      objStorage.ClientContractCode = "";
      objStorage.ClientCode = "";
      objStorage.CompanyCode = this.CompanyId;
      objStorage.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
      objStorage.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
      objStorage.CompanyId = this.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";

      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {
            if (whichSection == 'Bank') {
              this.employeeForm.controls['DocumentId'].setValue(apiResult.Result);
              this.employeeForm.controls['FileName'].setValue(this.FileName);
              this.DocumentId = apiResult.Result;
              this.unsavedDocumentLst.push({
                Id: apiResult.Result
              })
            } else {
              this.profileImageDocumentId = apiResult.Result;
              if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
                this.employeedetails.CandidateDocuments.forEach(element => {
                  if (element.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id) {
                    element.Modetype = UIMode.Delete;
                    this.delete_ProfileAvatarDocument.push(element);
                  }
                });
              }
              if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {

                if (this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id) == true) {
                  this.unsavedDocumentLst.push(this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id).DocumentId);
                } else {
                  let ListDocumentList: CandidateDocuments = new CandidateDocuments();
                  ListDocumentList.Id = 0;
                  ListDocumentList.CandidateId = this.employeedetails.CandidateId;
                  ListDocumentList.IsSelfDocument = false;
                  ListDocumentList.DocumentId = this.profileImageDocumentId;
                  ListDocumentList.DocumentCategoryId = 0;
                  ListDocumentList.DocumentTypeId = this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id;
                  ListDocumentList.DocumentNumber = '';
                  ListDocumentList.FileName = `profileavatar_${this.employeedetails.FirstName}.png`;
                  ListDocumentList.ValidFrom = null;
                  ListDocumentList.ValidTill = null;
                  ListDocumentList.Status = ApprovalStatus.Approved;
                  ListDocumentList.IsOtherDocument = true;
                  ListDocumentList.Modetype = UIMode.Edit;
                  ListDocumentList.DocumentCategoryName = "";
                  ListDocumentList.StorageDetails = null;
                  ListDocumentList.EmployeeId = this.employeedetails.Id;
                  this.new_ProfileAvatarDocument.push(ListDocumentList);
                }
              } else {
                let ListDocumentList: CandidateDocuments = new CandidateDocuments();
                ListDocumentList.Id = 0;
                ListDocumentList.CandidateId = this.employeedetails.CandidateId;
                ListDocumentList.IsSelfDocument = false;
                ListDocumentList.DocumentId = this.profileImageDocumentId;
                ListDocumentList.DocumentCategoryId = 0;
                ListDocumentList.DocumentTypeId = this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id;
                ListDocumentList.DocumentNumber = '';
                ListDocumentList.FileName = `profileavatar_${this.employeedetails.FirstName}.png`;
                ListDocumentList.ValidFrom = null;
                ListDocumentList.ValidTill = null;
                ListDocumentList.Status = ApprovalStatus.Approved;
                ListDocumentList.IsOtherDocument = true;
                ListDocumentList.Modetype = UIMode.Edit;
                ListDocumentList.DocumentCategoryName = "";
                ListDocumentList.StorageDetails = null;
                ListDocumentList.EmployeeId = this.employeedetails.Id;
                this.new_ProfileAvatarDocument.push(ListDocumentList);
              }


            }
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess("Awesome..., You have successfully uploaded this file")
            this.isLoading = true;

          }
          else {
            this.loadingScreenService.stopLoading();
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to upload! " + error)
        }

      }), ((err) => {

      })

    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.FileName = null;
      this.alertService.showWarning("An error occurred while trying to upload! " + error)
      this.isLoading = true;
    }

  }

  doDeleteFile() {
    // this.spinnerStarOver();

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "Once deleted, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {

      if (result.value) {
        if (this.isGuid(this.popupId)) {

          this.deleteAsync();
        }
        else if (this.firstTimeDocumentId != this.DocumentId) {

          this.deleteAsync();

        }

        else {
          this.FileName = null;
          this.employeeForm.controls['IsDocumentDelete'].setValue(true);
          this.employeeForm.controls['FileName'].setValue(null);

        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }

  deleteProfileImgFile() {
    this.fileuploadService.deleteObjectStorage((this.profileImageDocumentId)).subscribe((res) => {
      var index = this.unsavedDocumentLst.map(function (el) {
        return el.Id
      }).indexOf(this.DocumentId);
      this.unsavedDocumentLst.splice(index, 1)
      this.profileImageDocumentId = null;
    }), ((err) => {

    })

  }

  deleteAsync() {


    this.isLoading = false;
    this.spinnerText = "Deleting";

    this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.employeeForm.controls['DocumentId'].setValue(null);
          this.employeeForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.employeeForm.controls['IsDocumentDelete'].setValue(false);
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
        }
      } catch (error) {

        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }

    }), ((err) => {

    })

  }



  addBank(json_edit_object) {
    console.log('json_edit_object', json_edit_object);

    this.count = 0;
    this.BankBranchId = null;
    this.isFailedInitiateProcess = false;
    this.doAccordionLoading("isBankInfo");   // For Bank Information Pre-loading data
    this.pennydropLoading = false;
    this.IsManualModeEnabled = true;
    this.IsMultipleAttempts = false;
    this.NameAsPerBank = '';
    this.IsInitiatingPennyDropDone = false;
    this.IsYBStatus = false;
    this.initiatingObject = null;
    this.count = 0;
    this.count1 = 0;
    this.isFailedInitiateProcess = false;

    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {

      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
      json_edit_object.proofType = json_edit_object.CandidateDocument.DocumentTypeId;
    }


    this.popupId = json_edit_object.Id;
    this.firstTimeDocumentId = json_edit_object.DocumentId;
    this.employeeForm.controls['bankdetailsId'].setValue(json_edit_object.Id);
    this.employeeForm.controls['bankName'].setValue(json_edit_object.bankName);
    this.employeeForm.controls['IFSCCode'].setValue(json_edit_object.IFSCCode);
    this.employeeForm.controls['accountHolderName'].setValue(json_edit_object.accountHolderName);
    this.employeeForm.controls['accountNumber'].setValue(json_edit_object.accountNumber);
    this.employeeForm.controls['confirmAccountNumber'].setValue(json_edit_object.accountNumber);
    this.employeeForm.controls['allocation'].setValue(json_edit_object.allocation);
    this.employeeForm.controls['status'].setValue(json_edit_object.status);
    this.employeeForm.controls['proofType'].setValue(json_edit_object.proofType);
    this.employeeForm.controls['bankBranchId'].setValue(json_edit_object.bankBranchId);
    this.employeeForm.controls['VerificationMode'].setValue(json_edit_object.VerificationMode);
    this.employeeForm.controls['PayoutLogId'].setValue(json_edit_object.PayoutLogId);
    this.employeeForm.controls['VerificationAttempts'].setValue(json_edit_object.VerificationAttempts);
    this.employeeForm.controls['Remarks'].setValue(json_edit_object.Remarks);


    this.BankBranchId = json_edit_object.bankBranchId;

    if (json_edit_object.DocumentId) {

      this.FileName = json_edit_object.FileName;
      this.DocumentId = json_edit_object.DocumentId;
    }
    this.IsPennyDropCheckRequired = this.GlbIsPennyDropCheckRequired;
    if (this.employeeForm.value.DocumentId == 0 || this.employeeForm.value.DocumentId == null || this.employeeForm.value.DocumentId == '') {
      this.IsPennyDropCheckRequired = true;
    }
    else {
      this.IsPennyDropCheckRequired = false;
    }

    this.bank_slidervisible = true;

  }

  openBankSlider() {
    this.IsManualModeEnabled = true;
    this.IsMultipleAttempts = false;
    this.NameAsPerBank = '';
    this.IsInitiatingPennyDropDone = false;
    this.IsYBStatus = false;
    this.initiatingObject = null;
    this.count = 0;
    this.count1 = 0;
    this.isFailedInitiateProcess = false;
    this.IsPennyDropCheckRequired = this.GlbIsPennyDropCheckRequired;
    this.employeeForm.controls['bankdetailsId'].reset();
    this.employeeForm.controls['bankName'].reset();
    this.employeeForm.controls['accountNumber'].reset();
    this.employeeForm.controls['confirmAccountNumber'].reset();
    this.employeeForm.controls['IFSCCode'].reset();
    this.employeeForm.controls['accountHolderName'].reset();
    this.employeeForm.controls['proofType'].reset();
    this.employeeForm.controls['bankBranchId'].reset();
    this.employeeForm.controls['DocumentId'].reset();
    this.employeeForm.controls['FileName'].reset();
    this.employeeForm.controls['IsDocumentDelete'].reset();
    this.employeeForm.controls['VerificationMode'].reset();
    this.employeeForm.controls['PayoutLogId'].reset();
    this.employeeForm.controls['VerificationAttempts'].reset();
    this.employeeForm.controls['Remarks'].reset();
    this.isESSLogin && this.employeeForm.enable();
    this.DocumentId = null;
    this.FileName = null;
    this.doAccordionLoading("isBankInfo");   // For Bank Information Pre-loading data
    this.bank_slidervisible = true;

  }

  GetCompanySettings(_companyId, _clientId, _clientContractId) {

    // this.IsPennyDropCheckRequired =  true;
    // this.GlbIsPennyDropCheckRequired = true;
    // this.updateValidation(false, this.employeeForm.get('DocumentId'));
    // this.updateValidation(false, this.employeeForm.get('proofType'));

    const promise = new Promise((res, rej) => {

      this.payrollService.GetCompanySettings(_companyId, _clientId, _clientContractId, 'IsPennyDropCheckRequired')
        .subscribe((result) => {
          let apiR: apiResult = result;
          console.log('PENNY DROP STATUS ::', apiR);

          if (apiR.Status && apiR.Result != null) {
            var jobject = apiR.Result as any;
            var jSettingValue = JSON.parse(jobject.SettingValue);
            console.log('Setting Value : ', jSettingValue);
            this.IsPennyDropCheckRequired = false; // jSettingValue == '1' ? true : false;
            this.GlbIsPennyDropCheckRequired = false; // jSettingValue == '1' ? true : false;

            if (jSettingValue == '1' && environment.environment.IsPennyDropCheckRequired) {
              this.IsPennyDropCheckRequired = true;
              this.GlbIsPennyDropCheckRequired = true;
            }
            this.updateValidation(false, this.employeeForm.get('DocumentId'));
            this.updateValidation(false, this.employeeForm.get('proofType'));

            res(true);
            // this.IsPennyDropCheckRequired  = environment.environment.IsPennyDropCheckRequired;
            // this.GlbIsPennyDropCheckRequired =  environment.environment.IsPennyDropCheckRequired;
            // this.updateValidation(true, this.employeeForm.get('DocumentId'));
            // this.updateValidation(true, this.employeeForm.get('proofType'));

          }

        })
    })
    return promise;
  }



  onChangeManual(event) {
    if (event.target.checked) {

      this.IsManualModeEnabled = true;
    } else {

      this.IsManualModeEnabled = false;
    }
  }

  initiatePennyDropPayment() {
    this.employeeForm.controls['bankName'].disable();
    this.employeeForm.controls['IFSCCode'].disable();
    this.IsNameMisMatched = false;

    this.count1 = this.count1 + 1;
    this.IsManualModeEnabled = false;
    this.pennydropLoading = true;

    this.IsPaymentFailed = false;
    this.disableSelect = true;
    this.isFailedInitiateProcess = false;
    this.FailedInitiateProcessMessage = '';
    this.textSpin = "In Progress";
    this.status = "process";
    this.loadingicon = "loading";
    this.desciption = "Initiating Process"


    this.textSpin1 = "Waiting";
    this.status1 = "wait";
    this.loadingicon1 = "question";
    this.desciption1 = "Waiting to Connect Bank"


    this.textSpin2 = "Waiting";
    this.status2 = "wait";
    this.loadingicon2 = "question";
    this.desciption2 = "Waiting to Responding Bank"





    this.employeeForm.controls['VerificationMode'].setValue(this.IsPennyDropCheckRequired == true ? VerificationMode.PennyDrop : VerificationMode.QcVerification)


    this.pennydropspinnerText = "Initiating...";
    const promise = new Promise((res, rej) => {
      this.internalRefId = `${this.employeeForm.value.accountHolderName.substring(0, 4).toUpperCase()}${this.employeeForm.value.accountNumber.substring(0, 5)}${new Date().getTime()}`;
      this.internalRefId = this.internalRefId.replace(/\./g, ' ');
      var domesticPayment = new DomesticPayment();
      domesticPayment.Status = '';
      domesticPayment.NameAsPerBank = '';
      domesticPayment.Identification = '';
      domesticPayment.SchemeName = '';
      domesticPayment.CompanyBankAccountId = 0;
      domesticPayment.IsPaymentDone = false;
      domesticPayment.AcknowledgmentDetail = '';
      domesticPayment.MobileNumber = this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile : '1234567890';
      domesticPayment.ErrorMessage = '';
      domesticPayment.EmailId = this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail : 'test@gmail.com';
      domesticPayment.CreditorReferenceInformation = 'Initiating Penny Drop';
      domesticPayment.AccountHolderName = this.employeeForm.value.accountHolderName;
      domesticPayment.Amount = 0;
      domesticPayment.IFSCCode = this.BankBranchId;
      domesticPayment.AccountNumber = this.employeeForm.value.accountNumber;
      domesticPayment.ExternalRefId = '';
      domesticPayment.BankRefId = '';
      domesticPayment.InternalRefId = this.internalRefId;
      domesticPayment.PayoutStatus = 7500;
      domesticPayment.payoutlogs = [];
      domesticPayment.CandidateId = 0;
      domesticPayment.EmployeeId = this.employeedetails.Id;
      domesticPayment.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;

      console.log('test', domesticPayment);

      this.payrollService.initiatePennyDropPayment(domesticPayment)
        .subscribe((resObject) => {
          console.log('INIT PENNY DROP AMOUNT ::', resObject);

          let apiR: apiResult = resObject;
          // apiR.Status = true;
          // apiR.Result = {
          //   "InternalRefId": "IntegrumPennyDropTest2",
          //   "BankRefId": "TIMPSIntegrumPennyDropTest2",
          //   "ExternalRefId": "f394b26c29a511eca9e40a0047330000",
          //   "AccountNumber": "000901523569",
          //   "IFSCCode": "ICIC0000009",
          //   "Amount": 1.0,
          //   "AccountHolderName": "Kiran",
          //   "CreditorReferenceInformation": "Penny Drop Payment testing",
          //   "PayoutStatus": 7800,
          //   "EmailId": "test@gmail.com",
          //   "MobileNumber": "9840419175",
          //   "AcknowledgmentDetail": "",
          //   "IsPaymentDone": true,
          //   "CompanyBankAccountId": 5,
          //   "SchemeName": "string",
          //   "Identification": "string",
          //   "NameAsPerBank": null,
          //   "Status": "string",
          //   "ErrorMessage": null,
          //   "payoutlogs": [
          //     {
          //       "Id": 354883,
          //       "PayoutRequestIds": null,
          //       "PaytransactionIds": null,
          //       "ObjectStorageId": 0,
          //       "NoOfRecords": 1,
          //       "LastUpdatedBy": null,
          //       "LastUpdatedOn": "0001-01-01T00:00:00",
          //       "SourceData": "{\"Data\":{\"ConsentId\":\"11861849\",\"Initiation\":{\"InstructionIdentification\":\"TIMPSIntegrumPennyDropTest2\",\"EndToEndIdentification\":\"\",\"InstructedAmount\":{\"Amount\":\"1\",\"Currency\":\"INR\"},\"DebtorAccount\":{\"Identification\":\"065363300001791\",\"SecondaryIdentification\":\"11861849\"},\"CreditorAccount\":{\"SchemeName\":\"ICIC0000009\",\"Identification\":\"000901523569\",\"Name\":\"Kiran\",\"Unstructured\":{\"ContactInformation\":{\"EmailAddress\":\"test@gmail.com\",\"MobileNumber\":\"9840419175\"}}},\"RemittanceInformation\":{\"Reference\":\"Penny Drop Payment testing\",\"Unstructured\":{\"CreditorReferenceInformation\":\"Penny Drop Payment testing\"}},\"ClearingSystemIdentification\":\"IMPS\"}},\"Risk\":{\"DeliveryAddress\":{\"AddressLine\":[\"Flat 7\",\"Acacia Lodge\"],\"StreetName\":\"Acacia Avenue\",\"BuildingNumber\":\"27\",\"PostCode\":\"600524\",\"TownName\":\"MUM\",\"CountySubDivision\":[\"MH\"],\"Country\":\"IN\"}}}",
          //       "LogData": "{\"Data\":{\"ConsentId\":\"11861849\",\"TransactionIdentification\":\"f394b26c29a511eca9e40a0047330000\",\"Status\":\"Received\",\"CreationDateTime\":\"2021-10-10T14:12:07.243+05:30\",\"StatusUpdateDateTime\":\"2021-10-10T14:12:07.243+05:30\",\"Initiation\":{\"InstructionIdentification\":\"TIMPSIntegrumPennyDropTest2\",\"EndToEndIdentification\":\"\",\"InstructedAmount\":{\"Amount\":\"1\",\"Currency\":\"INR\"},\"DebtorAccount\":{\"Identification\":\"065363300001791\",\"SecondaryIdentification\":\"11861849\"},\"CreditorAccount\":{\"SchemeName\":\"ICIC0000009\",\"Identification\":\"000901523569\",\"Name\":\"Kiran\",\"Unstructured\":{\"ContactInformation\":{\"EmailAddress\":\"test@gmail.com\",\"MobileNumber\":\"9840419175\"}}},\"RemittanceInformation\":{\"Reference\":\"Penny Drop Payment testing\",\"Unstructured\":{\"CreditorReferenceInformation\":\"Penny Drop Payment testing\"}},\"ClearingSystemIdentification\":\"IMPS\"}},\"Risk\":{\"DeliveryAddress\":{\"AddressLine\":[\"Flat 7\",\"Acacia Lodge\"],\"StreetName\":\"Acacia Avenue\",\"BuildingNumber\":\"27\",\"PostCode\":\"600524\",\"TownName\":\"MUM\",\"CountySubDivision\":[\"MH\"],\"Country\":\"IN\"}},\"Links\":{\"Self\":\"https:\/\/esbtrans.yesbank.com:7085\/api-banking\/v2.0\/domestic-payments\/payment-details\"}}",
          //       "IsSuccess": true,
          //       "PayTransactionId": 0,
          //       "PayoutInformationDetailsId": 0,
          //       "APIType": 1,
          //       "APIName": "OutBound | Penny Drop | Domestic Payment",
          //       "InternalRefId": "TIMPSIntegrumPennyDropTest2",
          //       "ExternalRefId": "f394b26c29a511eca9e40a0047330000",
          //       "ResponseStatus": "Received",
          //       "CreationDateTime": "2021-10-10T14:12:07.243+05:30",
          //       "StatusUpdateDateTime": "2021-10-10T14:12:07.243+05:30",
          //       "ErrorMessage": null,
          //       "UserMessage": null
          //     }
          //   ]
          // } as any;
          // apiR.Message = "Requested data has been submitted for penny drop integration";

          if (!apiR.Status && apiR.Result != null) {
            let _obj = apiR.Result as any
            if (_obj.IsPaymentDone || _obj.PayoutStatus == 10000) {
              this.disableSelect = false;
              this.employeeForm.controls['bankName'].enable();
              this.employeeForm.controls['IFSCCode'].enable();
              this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
              this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = _obj;
              this.IsYBStatus = true;
              this.isSuccessInitiateProcess = true;
              this.NameAsPerBank = _obj.NameAsPerBank;

              var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
              var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
              rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
              rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

              if (rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Account Holder Name is mismatched;"; // apiR.Message;
                return;
              }
              else {
                this.pennydropLoading = false;

                var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
                var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
                rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");
                rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)
                // if(this.mismatch  == true)
                {
                  this.confirmationPennydrop();
                  return;
                }
                // this.IsPennyDropCheckRequired = false;
                this.updateBankGridTable();
                // this.alertService.showSuccess("Great! Bank details has been added.");

              }


            }
          }

          if (apiR.Status && apiR.Result != null) {

            this.textSpin = "Initialiation Done";
            this.status = "finish";
            this.loadingicon = "check";
            this.desciption = "Initiation phase carried out"


            this.textSpin1 = "In Progress";
            this.status1 = "process";
            this.loadingicon1 = "loading";
            this.desciption1 = "Accessing the Bank Server."


            this.textSpin2 = "Waiting";
            this.status2 = "wait";
            this.loadingicon2 = "question";
            this.desciption2 = "Waiting for bank response"


            var res = apiR.Result as any;
            this.payoutLogId = res.payoutlogs != null && res.payoutlogs.length > 0 ? res.payoutlogs[0].Id : 0;
            this.employeeForm.controls['PayoutLogId'].setValue(this.payoutLogId);
            this.pennydropspinnerText = "Checking with Bank Account";
            setTimeout(() => {
              var jObject = apiR.Result as any;
              jObject.InternalRefId = jObject.BankRefId as any;
              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = jObject;
              this.GetYBPennyDropStatus(jObject);
            }, 15000);
          } else {

            this.disableSelect = false;
            this.employeeForm.controls['bankName'].enable();
            this.employeeForm.controls['IFSCCode'].enable();
            this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
            this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

            if (this.count1 > 2) {
              this.IsMultipleAttempts = true;
              this.IsPennyDropCheckRequired = false;
              this.updateValidation(true, this.employeeForm.get('DocumentId'));
              this.updateValidation(true, this.employeeForm.get('proofType'));
            }

            this.textSpin = "Failed";
            this.status = "error";
            this.desciption = "Initiation failed"

            // this.loadingicon = "warning";

            this.textSpin1 = "Waiting";
            this.status1 = "wait";
            this.loadingicon1 = "question";

            this.textSpin2 = "Waiting";
            this.status2 = "wait";
            this.loadingicon2 = "question";

            this.pennydropLoading = false;
            this.isFailedInitiateProcess = true;
            this.FailedInitiateProcessMessage = apiR.Message;
            this.IsInitiatingPennyDropDone = false;
            this.IsYBStatus = false;
            this.initiatingObject = null;
            // this.alertService.showWarning(apiR.Message);
            return;

          }
          // res(true);

        })
    });
    return promise;
  }

  GetYBPennyDropStatus(domesticPayment) {
    this.employeeForm.controls['bankName'].disable();
    this.employeeForm.controls['IFSCCode'].disable();
    // this.bankForm.controls['accountNumber'].disable();
    // this.bankForm.controls['accountHolderName'].disable();
    this.disableSelect = true;

    this.IsNameMisMatched = false;
    this.IsManualModeEnabled = false;
    this.pennydropLoading = true;
    this.isFailedInitiateProcess = false;
    this.FailedInitiateProcessMessage = '';
    this.IsPaymentFailed = false;

    this.count = this.count + 1;
    this.textSpin = "initialization  Done";
    this.status = "finish";
    this.loadingicon = "check";
    this.desciption = "Initiation phase carried out"

    this.textSpin1 = "In Progress";
    this.status1 = "process";
    this.loadingicon1 = "loading";
    this.desciption1 = "Accessing the Bank Server."

    this.textSpin2 = "Awaiting";
    this.status2 = "wait";
    this.loadingicon2 = "question";
    this.desciption2 = "Waiting for Bank status"

    const promise = new Promise((res, rej) => {

      this.payrollService.GetYBPennyDropStatus(domesticPayment)
        .subscribe((resObject) => {
          console.log('STATUS PENNY DROP AMOUNT ::', resObject);

          let apiR: apiResult = resObject;
          // apiR.Status = true;
          // apiR.Result = {
          //   "InternalRefId": "IntegrumPennyDropTest2",
          //   "BankRefId": "TIMPSIntegrumPennyDropTest2",
          //   "ExternalRefId": null,
          //   "AccountNumber": "602701514756",
          //   "IFSCCode": "ICIC0006027",
          //   "Amount": 1.0,
          //   "AccountHolderName": "Balaji",
          //   "CreditorReferenceInformation": "Penny Drop Payment testing",
          //   "PayoutStatus": 10000,
          //   "EmailId": "test@gmail.com",
          //   "MobileNumber": "9840419175",
          //   "AcknowledgmentDetail": "128314662224",
          //   "IsPaymentDone": true,
          //   "CompanyBankAccountId": 5,
          //   "SchemeName": "ICIC0000009",
          //   "Identification": "000901523569",
          //   "NameAsPerBank": "KIRAN KUMAR SHETTY",
          //   "Status": "Payment Done",
          //   "ErrorMessage": "string",
          //   "payoutlogs": [
          //     {
          //       "Id": 354884,
          //       "PayoutRequestIds": null,
          //       "PaytransactionIds": null,
          //       "ObjectStorageId": 0,
          //       "NoOfRecords": 1,
          //       "LastUpdatedBy": null,
          //       "LastUpdatedOn": "0001-01-01T00:00:00",
          //       "SourceData": "{\"Data\":{\"ConsentId\":\"11861849\",\"InstrId\":\"TIMPSIntegrumPennyDropTest2\",\"SecondaryIdentification\":\"11861849\"}}",
          //       "LogData": "{\"Data\":{\"ConsentId\":\"11861849\",\"TransactionIdentification\":\"f67eb23429a511eca9e40a0047330000\",\"Status\":\"SettlementCompleted\",\"CreationDateTime\":\"2021-10-10T14:12:11.000+05:30\",\"StatusUpdateDateTime\":\"2021-10-10T14:12:12.000+05:30\",\"Initiation\":{\"InstructionIdentification\":\"TIMPSIntegrumPennyDropTest2\",\"EndToEndIdentification\":\"128314662224\",\"InstructedAmount\":{\"Amount\":1E+0,\"Currency\":\"INR\"},\"DebtorAccount\":{\"Identification\":\"065363300001791\",\"SecondaryIdentification\":\"11861849\"},\"CreditorAccount\":{\"SchemeName\":\"ICIC0000009\",\"Identification\":\"000901523569\",\"Name\":\"KIRAN KUMAR SHETTY\",\"BeneficiaryCode\":null,\"Unstructured\":{\"ContactInformation\":{\"EmailAddress\":\"test@gmail.com\",\"MobileNumber\":\"9840419175\"}},\"RemittanceInformation\":{\"Unstructured\":{\"CreditorReferenceInformation\":\"Penny Drop Payment testing\"}},\"ClearingSystemIdentification\":\"IMPS\"}}},\"Risk\":{\"PaymentContextCode\":null,\"DeliveryAddress\":{\"AddressLine\":\"Flat 7,Acacia Lodge\",\"StreetName\":\"Acacia Avenue\",\"BuildingNumber\":\"27\",\"PostCode\":\"600524\",\"TownName\":\"MUM\",\"CountySubDivision\":\"MH\",\"Country\":\"IN\"}},\"Links\":{\"Self\":\"https:\/\/esbtrans.yesbank.com:7085\/api-banking\/v2.0\/domestic-payments\/payment-details\"}}",
          //       "IsSuccess": true,
          //       "PayTransactionId": 0,
          //       "PayoutInformationDetailsId": 0,
          //       "APIType": 2,
          //       "APIName": "OutBound | Penny Drop | Payment Status",
          //       "InternalRefId": "TIMPSIntegrumPennyDropTest2",
          //       "ExternalRefId": "f67eb23429a511eca9e40a0047330000",
          //       "ResponseStatus": "SettlementCompleted",
          //       "CreationDateTime": "2021-10-10T14:12:11+05:30",
          //       "StatusUpdateDateTime": "2021-10-10T14:12:12+05:30",
          //       "ErrorMessage": null,
          //       "UserMessage": null
          //     }
          //   ]
          // } as any;
          // apiR.Message = "Account Holder Name mismatched;Penny drop has been paid sucessfully";


          var jObject = apiR.Result as any;
          this.NameAsPerBank = jObject.NameAsPerBank;
          this.IsYBStatus = true;

          if (apiR.Result != null) {
            if (jObject.IsPaymentDone == false || jObject.PayoutStatus == 7849) {

              if (this.count > 2) {
                this.IsMultipleAttempts = true;
                this.IsPennyDropCheckRequired = false;
                this.updateValidation(true, this.employeeForm.get('DocumentId'));
                this.updateValidation(true, this.employeeForm.get('proofType'));
              }
              this.textSpin = "Finished";
              this.status = "finish";
              this.loadingicon = "check";

              this.textSpin1 = "Failed";
              this.status1 = "error";
              // this.loadingicon1 = "warning";

              this.textSpin2 = "Awaiting";
              this.status2 = "wait";
              this.loadingicon2 = "question";
              this.IsPaymentFailed = true;
              // this.IsYBStatus = false;
              this.pennydropLoading = false;
              this.isFailedInitiateProcess = true;
              this.FailedInitiateProcessMessage = jObject.ErrorMessage == null ? "Invalid Account Number | Invalid Benificiary MMID" : jObject.ErrorMessage;
              return;

            }

            if (jObject.IsPaymentDone || jObject.PayoutStatus == 10000) {
              this.disableSelect = false;
              this.employeeForm.controls['bankName'].enable();
              this.employeeForm.controls['IFSCCode'].enable();
              this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
              this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = jObject;
              this.IsYBStatus = true;
              this.isSuccessInitiateProcess = true;
              this.NameAsPerBank = jObject.NameAsPerBank;
              var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
              var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
              rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
              rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

              if (rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Account Holder Name is mismatched"// apiR.Message;
                return;
              }
              else {
                this.pennydropLoading = false;
                var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
                var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
                rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");
                rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)
                // if(this.mismatch  == true)
                {
                  this.confirmationPennydrop();
                  return;
                }
                // this.IsPennyDropCheckRequired = false;
                this.updateBankGridTable();
                // this.alertService.showSuccess("Great! Bank details has been added.");

              }

            }



            this.textSpin = "initialization Done";
            this.status = "finish";
            this.loadingicon = "check";
            this.desciption = "Initiation phase done"


            this.textSpin1 = "Completed";
            this.status1 = "finish";
            this.loadingicon1 = "check";
            this.desciption1 = "Bank responded"


            this.textSpin2 = "In Progress";
            this.status2 = "process";
            this.loadingicon2 = "loading";
            this.desciption2 = "Finalizing status"


            setTimeout(() => {

              this.textSpin = "initialization  Done";
              this.status = "finish";
              this.loadingicon = "check";

              this.textSpin1 = "Completed";
              this.status1 = "finish";
              this.loadingicon1 = "check";

              this.textSpin2 = "Finished";
              this.status2 = "finish";
              this.loadingicon2 = "check";
              this.desciption2 = "Process Completed"



              setTimeout(() => {

                this.disableSelect = false;
                this.employeeForm.controls['bankName'].enable();
                this.employeeForm.controls['IFSCCode'].enable();
                this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
                this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

                var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
                var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
                rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
                rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

                if (rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {
                  this.pennydropLoading = false;
                  this.isFailedInitiateProcess = true;
                  this.IsNameMisMatched = true;
                  this.FailedInitiateProcessMessage = apiR.Message;
                  return;

                }
                else {
                  this.pennydropLoading = false;
                  this.bank_slidervisible = false;
                  var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
                  var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
                  rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");
                  rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                  if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)
                  // if(this.mismatch  == true)
                  {
                    this.confirmationPennydrop();
                    return;
                  }
                  // this.IsPennyDropCheckRequired = false;
                  this.updateBankGridTable();
                }

                // this.activeModal.close(this.bankForm.value);

              }, 500);



            }, 10000);




          }
          //  else {
          //   if (this.count > 2) {
          //     this.IsMultipleAttempts = true;
          //     this.IsPennyDropCheckRequired = false;
          //     this.updateValidation(true, this.employeeForm.get('DocumentId'));
          //     this.updateValidation(true, this.employeeForm.get('proofType'));
          //   }

          //   this.textSpin = "Finished";
          //   this.status = "finish";
          //   this.loadingicon = "check";

          //   this.textSpin1 = "Failed";
          //   this.status1 = "error";
          //   // this.loadingicon1 = "warning";

          //   this.textSpin2 = "Awaiting";
          //   this.status2 = "wait";
          //   this.loadingicon2 = "question";


          //   this.pennydropLoading = false;
          //   this.isFailedInitiateProcess = true;
          //   this.FailedInitiateProcessMessage = apiR.Message;
          //   return;

          // }
          res(true);

        })

    });
    return promise;
  }



  addNominee(nominee_json_edit_object) {

    if (nominee_json_edit_object != undefined && nominee_json_edit_object.CandidateDocument != null) {

      nominee_json_edit_object.DocumentId = nominee_json_edit_object.CandidateDocument.DocumentId;
      nominee_json_edit_object.FileName = nominee_json_edit_object.CandidateDocument.FileName;
      nominee_json_edit_object.idProoftype = nominee_json_edit_object.CandidateDocument.DocumentTypeId;
    }

    this.popupId = nominee_json_edit_object.Id;
    this.employeeForm.controls['nomineeId'].setValue(nominee_json_edit_object.Id);
    this.employeeForm.controls['nomineeName'].setValue(nominee_json_edit_object.nomineeName);
    this.employeeForm.controls['relationship'].setValue(nominee_json_edit_object.relationship);
    this.employeeForm.controls['DOB'].setValue(nominee_json_edit_object.DOB == null ? null : moment(nominee_json_edit_object.DOB).format('DD-MM-YYYY'));
    this.employeeForm.controls['idProoftype'].setValue(nominee_json_edit_object.idProoftype);
    this.employeeForm.controls['FamilyisEmployed'].setValue(nominee_json_edit_object.FamilyisEmployed);
    this.employeeForm.controls['mediclaim'].setValue(nominee_json_edit_object.mediclaim);
    this.employeeForm.controls['FamilyPF'].setValue(nominee_json_edit_object.FamilyPF);
    this.employeeForm.controls['FamilyESIC'].setValue(nominee_json_edit_object.FamilyESIC);
    this.employeeForm.controls['FamilyGratuity'].setValue(nominee_json_edit_object.FamilyGratuity);
    if (nominee_json_edit_object.DocumentId) {
      this.firstTimeDocumentId = nominee_json_edit_object.DocumentId;
      this.familyFileName = nominee_json_edit_object.FileName;
      this.familyDocumentId = nominee_json_edit_object.DocumentId;

    }
    this.nominee_sliderVisible = true;


  }
  close_BankSlider() {
    if (this.pennydropLoading == false) {
      this.isESSLogin && this.employeeForm.disable();
      this.isLoading = true;
      this.bank_slidervisible = false;
    }

  }

  close_nominee() {
    this.isESSLogin && this.employeeForm.disable();
    this.nominee_sliderVisible = false;
  }
  openNomineeSlider() {
    this.employeeForm.controls['nomineeId'].reset();
    this.employeeForm.controls['nomineeName'].reset();
    this.employeeForm.controls['relationship'].reset();
    this.employeeForm.controls['DOB'].reset();
    this.employeeForm.controls['FamilyPF'].reset();
    this.employeeForm.controls['FamilyESIC'].reset();

    this.employeeForm.controls['FamilyGratuity'].reset();
    this.employeeForm.controls['FamilyisEmployed'].reset();
    this.employeeForm.controls['mediclaim'].reset();
    this.employeeForm.controls['idProoftype'].reset();
    this.employeeForm.controls['familyDocumentId'].reset();
    this.employeeForm.controls['IsFamilyDocumentDelete'].reset();
    this.familyDocumentId = null;
    this.familyFileName = null;
    this.isESSLogin && this.employeeForm.enable(), this.employeeForm.controls['financialYear'].disable();
    this.nominee_sliderVisible = true;

  }

  addNewNominee() {

    this.nomineeSubmitted = true;
    if (this.employeeForm.get('nomineeName').value == null || this.employeeForm.get('nomineeName').value == '' || this.employeeForm.get('nomineeName').value == undefined) {
      this.employeeForm.controls['nomineeName'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('relationship').value == null || this.employeeForm.get('relationship').value == '' || this.employeeForm.get('relationship').value == undefined) {
      this.employeeForm.controls['relationship'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('FamilyPF').value == null || this.employeeForm.get('FamilyPF').value == '' || this.employeeForm.get('FamilyPF').value == undefined) {
      this.employeeForm.controls['FamilyPF'].setErrors({ 'incorrect': true });

    }

    else if (this.isESICapplicable === true && (this.employeeForm.get('FamilyESIC').value == null || this.employeeForm.get('FamilyESIC').value == '' || this.employeeForm.get('FamilyESIC').value == undefined)) {
      this.alertService.showWarning("ESIC Coverage is required");
      return;
    }

    else if (this.employeeForm.get('FamilyGratuity').value == null || this.employeeForm.get('FamilyGratuity').value == '' || this.employeeForm.get('FamilyGratuity').value == undefined) {
      this.employeeForm.controls['FamilyGratuity'].setErrors({ 'incorrect': true });

    }

    else if (this.familyFileName != null && (this.employeeForm.get('idProoftype').value == null || this.employeeForm.get('idProoftype').value == '')) {
      this.employeeForm.controls['idProoftype'].setErrors({ 'incorrect': true });
    }
    else {
      // this.nomineeSubmitted = false;
      //first nomineeid = null
      //if nomineeid == null ? uuid : nomineeId

      var db = moment(this.employeeForm.get('DOB').value, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const newItem = {
        Id: this.employeeForm.get('nomineeId').value == null ? UUID.UUID() : this.employeeForm.get('nomineeId').value,
        id: 0,
        nomineeName: this.employeeForm.get('nomineeName').value,
        RelationShip: this.relationship.find(a => a.id == this.employeeForm.get('relationship').value).name,
        DOB: this.employeeForm.get('DOB').value == 'Invalid date' ? '1900-01-01' : this.employeeForm.get('DOB').value,
        IDProof: "",
        FamilyPF: this.employeeForm.get('FamilyPF').value,
        FamilyGratuity: this.employeeForm.get('FamilyGratuity').value,
        FamilyaAdhar: "",
        FamilyESIC: this.employeeForm.get('FamilyESIC').value,
        FamilyisEmployed: this.employeeForm.get('FamilyisEmployed').value,
        mediclaim: this.employeeForm.get('mediclaim').value,
        idProoftype: this.employeeForm.get('idProoftype').value,
        relationship: this.employeeForm.get('relationship').value,
        familyDocumentId: this.employeeForm.get('familyDocumentId').value,
        familyFileName: this.familyFileName,
        FileName: this.familyFileName,
        IsFamilyDocumentDelete: this.employeeForm.get('IsFamilyDocumentDelete').value,
        Age: 0,
        CandidateDocument: null,
        DocumentStatus: null,
        isDocumentStatus: null,
        Modetype: UIMode.Edit,
        DateofBirth: db == 'Invalid date' ? '1900-01-01' : db,
      };

      if (newItem != null) {

        if (newItem.familyDocumentId != null && newItem.familyDocumentId != 0 && newItem.IsFamilyDocumentDelete == false) {
          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(newItem.Id) == true ? 0 : newItem.CandidateDocument == null ? 0 : newItem.CandidateDocument.Id;
          candidateDets.CandidateId = this.employeedetails.Id;
          candidateDets.IsSelfDocument = false;
          candidateDets.DocumentId = newItem.familyDocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = newItem.idProoftype;
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = newItem.familyFileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending // 
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          newItem.CandidateDocument = candidateDets;
          newItem.Modetype = UIMode.Edit;


        }
        else if (newItem.IsFamilyDocumentDelete == true && !this.isGuid(newItem.Id)) {


          var candidateDets = new CandidateDocuments();


          candidateDets.Id = this.employeedetails.EmpFamilyDtls.length > 0 &&
            this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.Id
          candidateDets.CandidateId = this.employeedetails.Id;
          candidateDets.IsSelfDocument = false;
          candidateDets.DocumentId = newItem.familyFileName == null ? 0 : this.employeedetails.EmpFamilyDtls.length > 0 &&
            this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = this.employeedetails.EmpFamilyDtls.length > 0 &&
            this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.DocumentTypeId
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = this.employeedetails.EmpFamilyDtls.length > 0 &&
            this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending // 
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          newItem.CandidateDocument = candidateDets;
          newItem.Modetype = UIMode.Edit;


        }

        else {

          newItem.CandidateDocument = null;

          newItem.Modetype = this.isGuid(newItem.Id) == true ? UIMode.Edit : UIMode.Edit;
          newItem.isDocumentStatus = null;
          newItem.DocumentStatus = null;

        }

        newItem.isDocumentStatus = ApprovalStatus.Pending;
        newItem.DocumentStatus = "Pending";
        newItem.id = newItem.Id
        newItem.Age = this.AgeCalculator(newItem.DOB)
      }

      let isAlreadyExists = false;
      let totalPF = 0;
      let totalESIC = 0;
      let totalGratuity = 0;

      isAlreadyExists = _.find(this.LstNominees, (a) => a.Id != newItem.Id && a.relationship == newItem.relationship) != null ? true : false;

      if (isAlreadyExists) {

        this.alertService.showWarning("The specified Nominee detail already exists");
        return;
      } else {

        let isSameResult = false;

        if ((newItem.familyDocumentId != null) && (newItem.idProoftype == null || newItem.idProoftype == '')) {
          this.alertService.showWarning("ID Proof Type is required");
          // this.employeeForm.controls['idProoftype'].setErrors({ 'incorrect': true });
          return;
        }
        // else if ((newItem.familyDocumentId == null) && (newItem.idProoftype != null && newItem.idProoftype != "")) {
        //   // this.employeeForm.controls['familyDocumentId'].setErrors({ 'incorrect': true });
        //   this.alertService.showWarning("Attachment is required");
        //   return;
        // }

        this.LstNominees.forEach(element => {

          if (element.Id != (newItem.Id)) {
            totalPF = +Number(element.FamilyPF);
            totalESIC = +Number(element.FamilyESIC);
            totalGratuity = +Number(element.FamilyGratuity);
          }

        });


        if (totalPF + Number(newItem.FamilyPF) > 100) {
          this.alertService.showWarning("Heads Up!. You cannot exceed your PF coverage of  100%");
          return;

        } else if (totalESIC + Number(newItem.FamilyESIC) > 100) {
          this.alertService.showWarning("You cannot exceed your ESIC coverage of  100%");
          return;
        }
        else if (totalGratuity + Number(newItem.FamilyGratuity) > 100) {
          this.alertService.showWarning("You cannot exceed your Gratuity coverage of  100%");
          return;
        }
        else if (newItem.familyDocumentId != null) {
          if (newItem.idProoftype == null) {
            this.alertService.showWarning("Oh... Snap! This alert needs your attention, because ID Proof type is required.");
            return;
          }
        }


        isSameResult = _.find(this.LstNominees, (a) => a.Id == newItem.Id) != null ? true : false;
        if (isSameResult) {

          this.angularGrid.gridService.updateDataGridItemById(newItem.Id, newItem, true, true);

        } else {
          this.angularGrid.gridService.addItemToDatagrid(newItem);
        }

      }

      this.employeeForm.controls['nomineeId'].reset();
      this.employeeForm.controls['nomineeName'].reset();
      this.employeeForm.controls['relationship'].reset();
      this.employeeForm.controls['relationship'].reset();
      this.employeeForm.controls['DOB'].reset();
      this.employeeForm.controls['idProoftype'].reset();
      this.employeeForm.controls['FamilyisEmployed'].reset();
      this.employeeForm.controls['FamilyPF'].reset();
      this.employeeForm.controls['FamilyESIC'].reset();
      this.employeeForm.controls['FamilyGratuity'].reset();
      this.employeeForm.controls['mediclaim'].reset();
      this.employeeForm.controls['familyDocumentId'].reset();
      this.employeeForm.controls['familyFileName'].reset();
      this.employeeForm.controls['IsFamilyDocumentDelete'].reset();
      this.familyDocumentId = null;
      this.familyFileName = null;
      this.nominee_sliderVisible = false;
    }


    // this.employeeForm.reset()
    // this.angularGrid.gridService.addItem(newItem);

  }


  addnewbankdetails() {
    if (this.employeeForm.get('bankName').value == null || this.employeeForm.get('bankName').value == '' || this.employeeForm.get('bankName').value == undefined) {
      this.employeeForm.controls['bankName'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('IFSCCode').value == null || this.employeeForm.get('IFSCCode').value == '' || this.employeeForm.get('IFSCCode').value == undefined) {
      this.employeeForm.controls['IFSCCode'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('accountNumber').value == null || this.employeeForm.get('accountNumber').value == '' || this.employeeForm.get('accountNumber').value == undefined) {
      this.employeeForm.controls['accountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('confirmAccountNumber').value == null || this.employeeForm.get('confirmAccountNumber').value == '' || this.employeeForm.get('confirmAccountNumber').value == undefined) {
      this.employeeForm.controls['confirmAccountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('confirmAccountNumber').value != this.employeeForm.get('accountNumber').value) {
      this.employeeForm.controls['confirmAccountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('accountHolderName').value == null || this.employeeForm.get('accountHolderName').value == '' || this.employeeForm.get('accountHolderName').value == undefined) {
      this.employeeForm.controls['accountHolderName'].setErrors({ 'incorrect': true });

    }

    else if ((this.IsPennyDropCheckRequired == false && this.employeeForm.get('proofType').value == null || this.employeeForm.get('proofType').value == '')) {
      this.employeeForm.controls['proofType'].setErrors({ 'incorrect': true });
    }
    else if ((this.IsPennyDropCheckRequired == false && this.FileName == null)) {
      this.employeeForm.controls['DocumentId'].setErrors({ 'incorrect': true });
    }
    else {

      var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
      var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
      rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
      rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");


      if (this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {
        // this.alertService.showWarning("Account Holder Name is mismatched.");
        this.alertService.showWarning(`${this.employeeForm.value.accountHolderName} : The Account holder name is incorrect. Re-enter the account holder name as per bank and try again`);

        return;
      }

      this.isFailedInitiateProcess = false;
      this.isSuccessInitiateProcess = false;

      if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && this.initiatingObject.AccountNumber != '' && this.initiatingObject.AccountNumber != null && (this.initiatingObject.AccountNumber.toString() != this.employeeForm.value.accountNumber.toString() || this.initiatingObject.IFSCCode != this.BankBranchId)) {
        this.count = 0;
        this.count1 = 0;
        this.IsInitiatingPennyDropDone = false;
      }

      // var rplStr_NameAsPerBank1 = this.initiatingObject.NameAsPerBank.toUpperCase().toString();
      // var rplStr_accountholdername1 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
      // rplStr_NameAsPerBank1 =  rplStr_NameAsPerBank1.replace(/\s/g, "");
      // rplStr_accountholdername1 =  rplStr_accountholdername1.replace(/\s/g, "");

      // if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && rplStr_NameAsPerBank1 != '' && rplStr_NameAsPerBank1 != null && (rplStr_NameAsPerBank1 != rplStr_accountholdername1)) {
      //   // this.count1 = 0;
      //   this.IsYBStatus = false;
      // }

      if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && this.initiatingObject.NameAsPerBank != '' && this.initiatingObject.NameAsPerBank != null) {
        var rplStr_NameAsPerBank1 = this.initiatingObject.NameAsPerBank.toUpperCase().toString();
        var rplStr_accountholdername1 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
        rplStr_NameAsPerBank1 = rplStr_NameAsPerBank1.replace(/\s/g, "");
        rplStr_accountholdername1 = rplStr_accountholdername1.replace(/\s/g, "");

        if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && rplStr_NameAsPerBank1 != '' && rplStr_NameAsPerBank1 != null && (rplStr_NameAsPerBank1 != rplStr_accountholdername1)) {
          this.IsYBStatus = false;
        }

      }


      if (this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == false) {
        this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!"));
        return;
      }
      if (this.IsPennyDropCheckRequired == true && this.IsPaymentFailed) {
        this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!"));
        return;
      }
      else if (this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && (this.IsYBStatus == false)) {
        this.GetYBPennyDropStatus(this.initiatingObject);
        return;
      } else {

        var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
        var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
        rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");
        rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

        if (this.IsPennyDropCheckRequired == true && rplStr_NameAsPerBank2 != rplStr_accountholdername2)
        // if(this.mismatch  == true)
        {
          this.confirmationPennydrop();
          return;
        }


        this.updateBankGridTable();
        // this.alertService.showSuccess("Great! Bank details has been added.");
        return;
      }


      // if (this.IsPennyDropCheckRequired == true) {
      //   this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!"))
      // }
      // else {
      //   this.updateBankGridTable();

      // }
    }

  }


  confirmationPennydrop() {
    var inputElement1 = null
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: `The account holder name entered by user, does not match with Employee name. Do you want to Continue. `,
      html: "<div class='b'></div><div class='b'><label style='color: #464646 !important;display: block !important;font-size: 13px !important;font-weight: 500;float: left;margin-top: 12px;'>Enter a Reason </label></div><textarea class='form-control' rows='2' placeholder='Type your message here...' style='margin-bottom:5px !important' spellcheck='false'id='swal-textarea'></textarea>",
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      allowEscapeKey: false,
      showCancelButton: true,
      preConfirm: () => {
        // this.inputElement = document.getElementById('swal-input2') as HTMLInputElement
        inputElement1 = document.getElementById('swal-textarea') as HTMLInputElement



        if (inputElement1.value.length >= 120) {
          Swal.showValidationMessage(
            `Maximum 120 characters allowed.`
          )

        } else if ((inputElement1.value == "") || (inputElement1.value == '') || ((inputElement1.value == null))) {
          Swal.showValidationMessage(
            `Reason is required. You need to write something!`
          )

        }
      }
    }).then((result) => {
      if (result.value) {
        this.employeeForm.value.Remarks = inputElement1.value;
        this.employeeForm.controls['Remarks'].setValue(inputElement1.value);
        this.updateBankGridTable();
        // this.alertService.showSuccess("Great! Bank details has been added.");
        return;
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });


  }
  updateBankGridTable() {


    var candidateDets = new CandidateDocuments();
    candidateDets.Id = 0;
    candidateDets.EmployeeId = this.Id;
    candidateDets.IsSelfDocument = true;
    candidateDets.DocumentId = this.DocumentId;
    candidateDets.DocumentCategoryId = 0;
    candidateDets.DocumentTypeId = this.employeeForm.get('proofType').value,
      candidateDets.DocumentNumber = "0";
    candidateDets.FileName = this.FileName;
    candidateDets.ValidFrom = null;
    candidateDets.ValidTill = null;
    candidateDets.Status = this.IsPennyDropCheckRequired == true ? ApprovalStatus.Approved : ApprovalStatus.Pending;
    candidateDets.IsOtherDocument = true;
    candidateDets.Modetype = UIMode.Edit;
    candidateDets.DocumentCategoryName = "";
    candidateDets.StorageDetails = null;

    const newbankItem = {
      Id: this.employeeForm.get('bankdetailsId').value == null ? UUID.UUID() : this.employeeForm.get('bankdetailsId').value,
      id: 0,
      bankName: this.employeeForm.get('bankName').value,
      accountNumber: this.employeeForm.get('accountNumber').value,
      IFSCCode: this.employeeForm.get('IFSCCode').value,
      allocation: this.employeeForm.get('allocation').value,
      accountHolderName: this.employeeForm.get('accountHolderName').value,
      bankBranchId: this.BankBranchId,
      status: 0,
      IsDefault: this.employeeForm.get('status').value == true ? true : false, // this.employeeForm.get('status').value,
      IsDefaultText: this.employeeForm.get('status').value == true ? 'Yes' : 'No',
      proofType: this.employeeForm.get('proofType').value,
      CandidateDocument: this.IsPennyDropCheckRequired == true ? null : candidateDets,
      DocumentStatus: this.IsPennyDropCheckRequired == true ? "Approved" : 'Pending',
      StatusName: this.IsPennyDropCheckRequired == true ? "Approved" : 'Pending',
      isDocumentStatus: this.IsPennyDropCheckRequired == true ? ApprovalStatus.Approved : ApprovalStatus.Pending,
      Modetype: UIMode.Edit,
      bankFullName: this.BankList.find(a => a.Id == this.employeeForm.get('bankName').value).Name,
      VerificationMode: this.IsPennyDropCheckRequired == true ? VerificationMode.PennyDrop : VerificationMode.QcVerification,
      VerificationAttempts: this.count1, // this.employeeForm.get('VerificationAttempts').value == null ? this.cou,
      PayoutLogId: this.employeeForm.get('PayoutLogId').value,
      Remarks: this.employeeForm.get('Remarks').value

    }

    console.log('newbankItem', newbankItem);


    if (newbankItem != null) {

      newbankItem.id = newbankItem.Id;
    }


    let isAlreadyExists = false;

    isAlreadyExists = _.find(this.LstBank, (a) => a.Id != this.employeeForm.get('bankdetailsId').value && a.accountNumber == this.employeeForm.get('accountNumber').value && a.IFSCCode == this.employeeForm.get('IFSCCode').value) != null ? true : false;
    if (this.LstBank.length >= 1 && this.LstBank.filter(z => z.status == ApprovalStatus.Pending).length > 1) {

      this.alertService.showWarning("You are only allowed to enter one item");
      return;

    } else {

      if (isAlreadyExists) {
        this.alertService.showWarning("The specified Bank detail already exists");
        return;
      }
      else {

        let isSameResult = false;
        isSameResult = _.find(this.LstBank, (a) => a.Id == newbankItem.Id) != null ? true : false;

        if (isSameResult) {
          if (newbankItem.VerificationMode == VerificationMode.PennyDrop) {
            newbankItem.IsDefault = true;
            newbankItem.IsDefaultText = 'Yes';
          }
          this.angularGrid_Bank.gridService.updateDataGridItemById(newbankItem.Id, newbankItem, true, true);

        } else {
          if (newbankItem.VerificationMode == VerificationMode.PennyDrop) {
            this.LstBank.forEach(element => {
              element.IsDefault = false;
              element.IsDefaultText = 'No';
            });
          }
          this.angularGrid_Bank.gridService.addItemToDatagrid(newbankItem);
        }

      }
    }
    this.alertService.showSuccess("Great! Bank details has been added.");

    this.isDuplicateBankInfo = false;
    // this.angularGrid_Bank.gridService.addItem(newbankItem);
    this.employeeForm.controls['bankdetailsId'].reset();
    this.employeeForm.controls['bankName'].reset();
    this.employeeForm.controls['accountNumber'].reset();
    this.employeeForm.controls['confirmAccountNumber'].reset();
    this.employeeForm.controls['IFSCCode'].reset();
    this.employeeForm.controls['accountHolderName'].reset();
    this.employeeForm.controls['proofType'].reset();
    this.employeeForm.controls['bankBranchId'].reset();
    this.employeeForm.controls['DocumentId'].reset();
    this.employeeForm.controls['FileName'].reset();
    this.employeeForm.controls['IsDocumentDelete'].reset();
    this.employeeForm.controls['VerificationMode'].reset();
    this.employeeForm.controls['VerificationAttempts'].reset();
    this.employeeForm.controls['PayoutLogId'].reset();
    this.employeeForm.controls['Remarks'].reset();

    this.bank_slidervisible = false;


    console.log('this.LstBank', this.LstBank);


  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }


  discardchanges() {
    this.edit_EmployeeDetails();
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
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.router.navigate(['/app/listing/ui/employeelist']);

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }

  AgeCalculator(birthdate) {

    if (birthdate) {
      var timeDiff = Math.abs(Date.now() - new Date(birthdate).getTime());
      return Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);

    }
  }

  /* #endregion */


  public findInvalidControls() {
    this.invaid_fields = [];
    const invalid = [];
    const controls = this.employeeForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        this.invaid_fields.push(name)
      }
    }

    return this.invaid_fields;
  }

  validateEmployeeInvestment() {
    const promise = new Promise((res, rej) => {
      this.loadingScreenService.startLoading();
      this.employeeService.getValidateSubmitInvestmentProof(this.Id)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            let jobj = JSON.parse(apiResult.Result);
            res(jobj)

          } else {
            res(null)
          }
        }, err => {

        })
    });
    return promise;

  }

  finalSubmit(isProofMode, isSubmit) {

    try {
      this.submitted = true;

      if (isSubmit) {
        // this.findInvalidControls();
        // if (this.employeeForm.invalid) {
        //   // this.alertService.showWarning("Please complete all required fields!")
        //   return;
        // }
      } else {
        if (this.employeeForm.get('fatherName').value == null || this.employeeForm.get('fatherName').value == '') {
          this.employeeForm.controls['fatherName'].setValue('.');
        }

      }

      if (this.isESSLogin && this.activeTabName == 'profile' && this.IsESICApplicableForKeyIn == true && (this.employeeForm.get('ESIC').value == null || this.employeeForm.get('ESIC').value == '')) {
        this.alertService.showWarning("General Tab : ESIC No is required");
        return;
      }

      if (!this.isESSLogin && this.IsESICApplicableForKeyIn && (this.employeeForm.get('ESIC').value == null || this.employeeForm.get('ESIC').value == '')) {
        this.alertService.showWarning("General Tab : ESIC No is required");
        return;
      }


      // GET INVESTMENT SUBMISSION SLOT CLOSURE DATE
      if (isSubmit == true && isProofMode && this.TaxDeclaration != 1) {

        var SlotClosureDate: any = null;
        var SlotStartDate: any = null;
        if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
          (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
          SlotClosureDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
            (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 2)[0].EndDay;
        } else {
          SlotClosureDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 2).EndDay;
        }

        if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
          (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
          SlotStartDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
            (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 2)[0].StartDay;
        } else {
          SlotStartDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 2).StartDay;
        }


        if (isProofMode && SlotClosureDate == null) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("There is no active investment slot sheet. Please contact support admin.");
          return;
        }
        var currentDate = new Date();
        let A = moment(currentDate).format('YYYY-MM-DD');
        let B = moment(SlotClosureDate).format('YYYY-MM-DD');
        let C = moment(SlotStartDate).format('YYYY-MM-DD');

        if (isProofMode && A < C) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("Submission time not yet underway. Please contact the Technical Assistance Administration.");
          return;
        }

        if (isProofMode && B < A) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("Submission time has been closed.  Please contact the Technical Assistance Administration.");
          return;
        }
      }
      else if (isSubmit == true) {
        var SlotClosureDate: any = null;
        var SlotStartDate: any = null;
        if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
          (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
          SlotClosureDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
            (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 1)[0].EndDay;
        } else {
          SlotClosureDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 1).EndDay;
        }

        if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
          (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
          SlotStartDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
            (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 1)[0].StartDay;
        } else {
          SlotStartDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 1).StartDay;
        }


        if (SlotClosureDate == null) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("There is no active investment slot sheet. Please contact support admin.");
          return;
        }
        var currentDate = new Date();
        let A = moment(currentDate).format('YYYY-MM-DD');
        let B = moment(SlotClosureDate).format('YYYY-MM-DD');
        let C = moment(SlotStartDate).format('YYYY-MM-DD');

        if (A < C) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("Submission time not yet underway. Please contact the Technical Assistance Administration.");
          return;
        }

        if (B < A) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("Submission time has been closed.  Please contact the Technical Assistance Administration.");
          return;
        }
      }

      //   if (isProofMode && this.TaxDeclaration == 0) {
      //   var SlotClosureDate_declaration: any = null;
      //   var SlotStartDate_declaration: any = null;
      //   if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
      //     (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
      //       SlotClosureDate_declaration = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
      //       (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 1)[0].EndDay;
      //   } else {
      //     SlotClosureDate_declaration = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 1).EndDay;
      //   }

      //   if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
      //     (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
      //       SlotStartDate_declaration = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
      //       (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == 1)[0].StartDay;
      //   } else {
      //     SlotStartDate_declaration = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == 1).StartDay;
      //   }

      //   console.log('SLOT CLOSURE DATE DEC:', new Date(SlotClosureDate_declaration));
      //   console.log('SLOT START DATE DEC :', new Date(SlotStartDate_declaration));

      //   if (isProofMode && SlotClosureDate_declaration == null) {
      //     this.loadingScreenService.stopLoading();
      //     this.alertService.showWarning("There is no active investment slot sheet. Please contact support admin.");
      //     return;
      //   }
      //   var currentDate1 = new Date();
      //   let AA = moment(currentDate1).format('YYYY-MM-DD');
      //   let BB = moment(SlotClosureDate_declaration).format('YYYY-MM-DD');
      //   let CC = moment(SlotStartDate_declaration).format('YYYY-MM-DD');

      //   console.log('A :', AA);
      //   console.log('B :', BB);

      //   if (isProofMode && AA < CC) {
      //     this.loadingScreenService.stopLoading();
      //     this.alertService.showWarning("submission time not yet started. Please contact support admin.");
      //     return;
      //   }

      //   if (isProofMode && BB < AA) {
      //     this.loadingScreenService.stopLoading();
      //     this.alertService.showWarning("submission time has been closed. Please contact support admin.");
      //     return;
      //   }
      // }


      // else if(B < A){
      //   console.log('date2 is Less than date1');
      // }else{
      //   console.log('Both date are same');
      // } 

      // if (isProofMode && moment(new Date()).isAfter(new Date(SlotClosureDate))) {

      // }


      // if ((!this.isESSLogin || this.activenavtab == 'nomineeInformaton') && this.LstNominees.length == 0) {
      //   this.alertService.showWarning("Oops!  Please provide at least One Nominee to confirm it. You cannot save without Nominee (minimum one detail is required)");
      //   return;
      // } else if ((!this.isESSLogin || this.activenavtab == 'bankInformation') && this.LstBank.length == 0) {
      //   this.alertService.showWarning("Oops!  Please provide at least One Bank to confirm it. You cannot save without Bank Details (minimum one detail is required)");
      //   return;
      // }


      if (this._OriginalAadhaarNumber != null && this._OriginalAadhaarNumber != '' && this._OriginalAadhaarNumber != 'NULL') {
        let isnum = /^\d+$/.test(this._OriginalAadhaarNumber);
        if (isnum == false) {
          this.alertService.showWarning("Aadhaar Number is invalid or Please match the requested format. (Ex: 1012 3456 7891)");
          return;
        }
      }

      // if (this.isESSLogin == true && isSubmit == true && isProofMode && this.activenavtab == 'investmentInformation') {
      //   var isFailedItems_Exemptions = [];
      //   var isFailedItems_Deductions = [];
      //   var isFailedItems_Investments = [];

      //   isFailedItems_Exemptions = this.dynamicExeptions != null && this.dynamicExeptions.length > 0 && this.dynamicExeptions.filter(a => a.FinancialYearId == this.employeeForm.get('financialYear').value && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && this.getStatusCount1(a.LstEmployeeExemptionBillDetails, 2) > 0);
      //   if (isFailedItems_Exemptions.length > 0) {
      //     this.alertService.showWarning(" There are some rejected file(s) in your  :) Exemptions cart");
      //     return;
      //   }
      //   isFailedItems_Deductions = this.Lstdeduction_Exemption != null && this.Lstdeduction_Exemption.length > 0 && this.Lstdeduction_Exemption.filter(a =>a.DocumentDetails != null && a.DocumentDetails.length > 0 && this.getStatusCount1(a.DocumentDetails, 2) > 0);
      //   if (isFailedItems_Deductions.length > 0) {
      //     this.alertService.showWarning(" There are some rejected file(s) in your  :) Deductions cart");
      //     return;
      //   }
      //   isFailedItems_Investments = this.Lstinvestment != null && this.Lstinvestment.length > 0 && this.Lstinvestment.filter(a => a.DocumentDetails != null && a.DocumentDetails.length > 0 && this.getStatusCount1(a.DocumentDetails, 2) > 0);
      //   if (isFailedItems_Investments.length > 0) {
      //     this.alertService.showWarning(" There are some rejected file(s) in your  :) Investment cart");
      //     return;
      //   }
      //   this.loadingScreenService.stopLoading();
      // }

      // if (this.isESSLogin == false && isSubmit == true && isProofMode) {

      //   var isFailedItems_Exemptions = [];
      //   var isFailedItems_Deductions = [];
      //   var isFailedItems_Investments = [];

      //   isFailedItems_Exemptions = this.dynamicExeptions != null && this.dynamicExeptions.length > 0 && this.dynamicExeptions.filter(a => a.FinancialYearId == this.employeeForm.get('financialYear').value && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && this.getStatusCount1(a.LstEmployeeExemptionBillDetails, 2) > 0);
      //   if (isFailedItems_Exemptions.length > 0) {
      //     this.alertService.showWarning(" There are some rejected file(s) in your  :) Exemptions cart");
      //     return;
      //   }
      //   isFailedItems_Deductions = this.Lstdeduction_Exemption != null && this.Lstdeduction_Exemption.length > 0 && this.Lstdeduction_Exemption.filter(a =>a.DocumentDetails != null && a.DocumentDetails.length > 0 && this.getStatusCount1(a.DocumentDetails, 2) > 0);
      //   if (isFailedItems_Deductions.length > 0) {
      //     this.alertService.showWarning(" There are some rejected file(s) in your  :) Deductions cart");
      //     return;
      //   }
      //   isFailedItems_Investments = this.Lstinvestment != null && this.Lstinvestment.length > 0 && this.Lstinvestment.filter(a => a.DocumentDetails != null && a.DocumentDetails.length > 0 && this.getStatusCount1(a.DocumentDetails, 2) > 0);
      //   if (isFailedItems_Investments.length > 0) {
      //     this.alertService.showWarning(" There are some rejected file(s) in your  :) Investment cart");
      //     return;
      //   }
      //   this.loadingScreenService.stopLoading();

      // }

      // if (this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0 && b.Status == 2).length > 0).length == 0) {
      //   this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode);
      //   return; 
      // }
      console.log('this.employeedetails.LstEmployeeTaxExemptionDetails', this.employeedetails.LstEmployeeTaxExemptionDetails);

      let isRejectPendingCombined = false;
      this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 && this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(element => {

        for (let h = 0; h < element.LstEmployeeExemptionBillDetails.length; h++) {
          if (element.LstEmployeeExemptionBillDetails[h].Status == 2 && element.LstEmployeeExemptionBillDetails.find(a => a.Status == 0) != undefined) {

            isRejectPendingCombined = true;
          }

        }
      });

      // alert(isRejectPendingCombined);


      if (isSubmit == true && isRejectPendingCombined == true as any) {
        this.alertService.confirmSwal1("Confirm Stage?", "There are some rejected file(s) in your :) Exemptions Cart. Are you sure you want to submit?", "Ok", "Cancel").then((result) => {
          this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode);
          return;
        }).catch(cancel => {
          this.loadingScreenService.stopLoading();
          return;
        });
      }

      if (isRejectPendingCombined == false || isRejectPendingCombined == undefined || isRejectPendingCombined == null) {
        // alert('bb')

        this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode);
        return;
      }




      // if (this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0 ).length > 0).length > 0  && this.isESSLogin == true && isSubmit == true && isProofMode && this.activenavtab == 'investmentInformation') {

      //   this.alertService.confirmSwal1("Confirm Stage?", "There are some rejected file(s) in your :) Exemptions Cart. Are you sure you want to submit?", "Ok", "Cancel").then((result) => {
      //     this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode);
      //     return;
      //   }).catch(cancel => {
      //     this.loadingScreenService.stopLoading();
      //     return;
      //   });
      // }
      // if (this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0 && b.Status == 2).length > 0).length > 0 && this.isESSLogin == false && isSubmit == true && isProofMode) {

      //   this.alertService.confirmSwal1("Confirm Stage?", "There are some rejected file(s) in your :) Exemptions Cart. Are you sure you want to submit?", "Ok", "Cancel").then((result) => {
      //     this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode);
      //     return;
      //   }).catch(cancel => {
      //     this.loadingScreenService.stopLoading();
      //     return;
      //   });
      // }
      // this.loadingScreenService.stopLoading();
      // alert('sss')

      // return;


    }
    catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }

  confirmSubmit(SlotClosureDate, isSubmit, isProofMode) {

    try {

      this.loadingScreenService.stopLoading();
      this.loadingScreenService.startLoading();
      this.clearListofItems();

      //general
      this.test();
      this.Employee.FirstName = this.employeeForm.get('Name').value;
      this.Employee.Status = this.employeeForm.get('Status').value;
      if (this.Employee.EmployeeCommunicationDetails == null) {
        var _Communication = {
          Id: 0,
          EmployeeId: this.Id,
          CandidateId: 0,
          EntityType: { Id: 0, Name: '' },
          EntityId: 0,
          AddressDetails: '',
          ContactDetails: '',
          LstAddressdetails: [],
          LstContactDetails: [],
          IsEditable: true,
          Modetype: UIMode.Edit,
        }
        this.Employee.EmployeeCommunicationDetails = _Communication;
        this.Employee.EmployeeCommunicationDetails.LstContactDetails = [];
        this.Employee.EmployeeCommunicationDetails.LstContactDetails.push({
          PrimaryMobile: this.employeeForm.get('mobile').value,
          PrimaryEmail: this.employeeForm.get('email').value,
          CommunicationCategoryTypeId: CommunicationCategoryType.Personal,
          PrimaryMobileCountryCode: "+91",
          AlternateMobile: '',
          AlternateMobileCountryCode: '',
          AlternateEmail: '',
          EmergencyContactNo: '',
          LandlineStd: '',
          LandLine: '',
          LandLineExtension: '',
          PrimaryFax: '',
          AlternateFax: '',
          IsDefault: true,
        })

        this.Employee.EmployeeCommunicationDetails.LstContactDetails.push({
          PrimaryMobile: "",
          PrimaryEmail: this.employeeForm.get('officialEmail').value,
          CommunicationCategoryTypeId: CommunicationCategoryType.Official,
          PrimaryMobileCountryCode: "+91",
          AlternateMobile: '',
          AlternateMobileCountryCode: '',
          AlternateEmail: '',
          EmergencyContactNo: '',
          LandlineStd: '',
          LandLine: '',
          LandLineExtension: '',
          PrimaryFax: '',
          AlternateFax: '',
          IsDefault: true,

        })


      } else {

        this.Employee.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile = this.employeeForm.get('mobile').value;
        this.Employee.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail = this.employeeForm.get('email').value;

        if (this.employeedetails && this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
          let _obj = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2)
          if (_obj) {

            this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2 ? val.PrimaryEmail = this.employeeForm.get('officialEmail').value : null)
          }
          else {
            this.Employee.EmployeeCommunicationDetails.LstContactDetails.push({
              PrimaryMobile: "",
              PrimaryEmail: this.employeeForm.get('officialEmail').value,
              CommunicationCategoryTypeId: CommunicationCategoryType.Official,
              PrimaryMobileCountryCode: "+91",
              AlternateMobile: '',
              AlternateMobileCountryCode: '',
              AlternateEmail: '',
              EmergencyContactNo: '',
              LandlineStd: '',
              LandLine: '',
              LandLineExtension: '',
              PrimaryFax: '',
              AlternateFax: '',
              IsDefault: true,

            })
          }
          //this.employeeForm.get('officialEmail').value;
        }

        // this.Employee.EmployeeCommunicationDetails.LstContactDetails[0].OfficialEmail = this.employeeForm.get('officialEmail').value;


      }
      this.Employee.EmployeeCommunicationDetails.Modetype = UIMode.Edit;

      this.Employee.Gender = this.employeeForm.get('gender').value;
      var dob = new Date(this.employeeForm.get('dateOfBirth').value);

      this.Employee.DateOfBirth = moment(dob).format('YYYY-MM-DD');
      this.Employee.FatherName = this.employeeForm.get('fatherName').value;
      this.Employee.Aadhaar = this._OriginalAadhaarNumber == 'NULL' ? null : this._OriginalAadhaarNumber; // this.employeeForm.get('adhaarnumber').value;
      this.Employee.PAN = this._OrginalPanNo == 'NULL' ? null : this._OrginalPanNo//this.employeeForm.get('PANNO').value;
      this.Employee.UAN = this.employeeForm.get('UAN').value;
      this.IsESICApplicableForKeyIn ? this.Employee.ESIC = this.employeeForm.get('ESIC').value : true;
      this.Employee.EmploymentContracts[0]['PFNumber'] = this.employeeForm.get('PFNumber').value;
      let lstemploymentdet = [];
      // lstemploymentdet.push({
      //   EmployeeId : this.Id,
      //   FinancialYearId: this.employeeForm.get('financialYear').value,
      //   Modetype: UIMode.Edit
      // })
      // this.Employee.LstemploymentDetails = lstemploymentdet;
      var startdate = new Date(this.employeeForm.get('employementstartdate').value);
      var enddate = new Date(this.employeeForm.get('employementenddate').value);
      this.Employee.EmploymentContracts[0].ClientContractId = this.employeeForm.get('contractname').value;
      this.Employee.EmploymentContracts[0].EmploymentType = this.employeeForm.get('employmentType').value == null ? 0 : this.employeeForm.get('employmentType').value;
      this.Employee.EmploymentContracts[0].IsESSRequired = this.employeeForm.get('IsESSRequired').value;

      this.Employee.EmploymentContracts[0].Department = this.employeeForm.get('Department').value;
      this.Employee.EmploymentContracts[0].StartDate = moment(startdate).format('YYYY-MM-DD');
      this.Employee.EmploymentContracts[0].EndDate = moment(enddate).format('YYYY-MM-DD');
      this.Employee.EmploymentContracts[0].Designation = this.employeeForm.get('Designation').value;
      this.Employee.EmploymentContracts[0].WorkLocation = this.employeeForm.get('Location').value;
      this.Employee.EmploymentContracts[0].StateId = this.employeeForm.get('statename').value;
      this.Employee.EmploymentContracts[0].CostCodeId = this.employeeForm.get('costcode').value == null ? 0 : this.employeeForm.get('costcode').value;
      this.Employee.EmploymentContracts[0].IsNewTaxRegimeOpted = this.employeeForm.get('IsNewTaxRegimeOpted').value;
      this.Employee.EmploymentContracts[0].Modetype = UIMode.Edit;
      this.Employee.EmploymentContracts[0].TeamId = this.employeeForm.get('teamname').value == null ? 0 : this.employeeForm.get('teamname').value;
      this.Employee.EmploymentContracts[0].ManagerId = this.employeeForm.get('reportingmanager').value == null ? 0 : this.employeeForm.get('reportingmanager').value;

      this.Addressdetails.push({
        CommunicationCategoryTypeId: CommunicationCategoryType.Present,
        Address1: this.employeeForm.get('presentAddressdetails').value,
        Address2: this.employeeForm.get('presentAddressdetails1').value,
        Address3: this.employeeForm.get('presentAddressdetails2').value,
        CountryName: this.employeeForm.get('presentCountryName').value,
        StateName: this.employeeForm.get('presentStateName').value,
        City: this.employeeForm.get('presentCity').value,
        PinCode: this.employeeForm.get('presentPincode').value,
        CountryId: 0,
        CityId: 0,
        StateId: 0,
        DistrictId: 0,

      })
      this.Addressdetails.push({
        CommunicationCategoryTypeId: CommunicationCategoryType.Permanent,
        Address1: this.employeeForm.get('permanentAddressdetails').value,
        Address2: this.employeeForm.get('permanentAddressdetails1').value,
        Address3: this.employeeForm.get('permanentAddressdetails2').value,
        CountryName: this.employeeForm.get('permanentCountryName').value,
        StateName: this.employeeForm.get('permanentStateName').value,
        City: this.employeeForm.get('permanentCity').value,
        PinCode: this.employeeForm.get('permanentPincode').value,
        CountryId: 0,
        CityId: 0,
        StateId: 0,
        DistrictId: 0,

      });
      this.Employee.EmployeeCommunicationDetails.LstAddressdetails = this.Addressdetails;

      //nominee details
      if (this.LstNominees.length > 0) {
        this.LstNominees.forEach(element => {
          element["lstClaim"] = []
          if (element.FamilyPF) {
            element.lstClaim.push({ ClaimType: ClaimType.PF, Percentage: element.FamilyPF, Remarks: '' })
          }
          if (element.FamilyESIC) {
            element.lstClaim.push({ ClaimType: ClaimType.ESIC, Percentage: element.FamilyESIC, Remarks: '' })
          }
          if (element.FamilyGratuity) {
            element.lstClaim.push({ ClaimType: ClaimType.Gratuity, Percentage: element.FamilyGratuity, Remarks: '' })
          }
        });
        this.LstNominees.forEach(element => {
          var familyDets = new FamilyDetails();
          console.log('eme', element);

          familyDets.Name = element.nomineeName,
            familyDets.RelationshipId = element.relationship,
            familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01" : moment(new Date(element.DOB)).format('YYYY-MM-DD'),
            familyDets.LstClaims = element.lstClaim,
            familyDets.IsEmployed = element.FamilyisEmployed == null ? false : element.FamilyisEmployed,
            familyDets.EmployeeId = this.employeedetails.Id,
            familyDets.Modetype = element.Modetype,
            familyDets.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
            familyDets.CandidateDocument = element.CandidateDocument
          this.FamilyDetails.push(familyDets)
        });
        this.Employee.EmpFamilyDtls = this.FamilyDetails;
      }

      if (this.deletedLstNominee.length > 0) {
        var lstFamilyDetails = [];
        this.deletedLstNominee.forEach(element => {

          var familyDets = new CandidateFamilyDetails();
          familyDets.Name = element.nomineeName,
            familyDets.RelationshipId = element.relationship,
            familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01" : element.DOB,
            familyDets.LstClaims = element.lstClaim,
            familyDets.IsEmployed = element.FamilyisEmployed,
            familyDets.Modetype = element.Modetype,
            familyDets.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
            familyDets.CandidateDocument = element.CandidateDocument;
          lstFamilyDetails.push(familyDets);
        });

        this.Employee.EmpFamilyDtls = this.Employee.EmpFamilyDtls.concat(lstFamilyDetails);
      }



      //bankdetails
      this.LstBank.forEach(element => {
        var candidateBankDetails = new EmployeeBankDetails();
        candidateBankDetails.BankId = element.bankName;
        candidateBankDetails.BankBranchId = element.IFSCCode;
        candidateBankDetails.AccountNumber = element.accountNumber;
        candidateBankDetails.AccountHolderName = element.accountHolderName;
        candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
        candidateBankDetails.IdentifierValue = element.bankBranchId;
        candidateBankDetails.SalaryContributionPercentage = element.allocation;
        candidateBankDetails.IsDefault = element.CandidateDocument != null && element.CandidateDocument.Status == 0 ? false : element.IsDefault;
        candidateBankDetails.Status = element.status;
        // this.candidateBankDetails.Modetype =  UIMode.Edit;;
        // candidateBankDetails.Modetype = element.Modetype,
        candidateBankDetails.Modetype = UIMode.Edit;  // element.Modetype,
        candidateBankDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          candidateBankDetails.CandidateDocument = element.CandidateDocument,
          candidateBankDetails.VerificationMode = element.VerificationMode
        candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
          element.PayoutLogId = 0
        }
        candidateBankDetails.PayoutLogId = element.PayoutLogId
        candidateBankDetails.Remarks = element.Remarks

        this.lstBankDetails.push(candidateBankDetails)
      });

      this.deletedBanks.forEach(element => {
        var candidateBankDetails = new EmployeeBankDetails();
        candidateBankDetails.BankId = element.bankName;
        candidateBankDetails.BankBranchId = element.IFSCCode;
        candidateBankDetails.AccountNumber = element.accountNumber;
        candidateBankDetails.AccountHolderName = element.accountHolderName;
        candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
        candidateBankDetails.IdentifierValue = element.bankBranchId;
        candidateBankDetails.SalaryContributionPercentage = element.allocation;
        candidateBankDetails.IsDefault = true;
        candidateBankDetails.Status = element.status,
          // this.candidateBankDetails.Modetype =  UIMode.Edit;;
          candidateBankDetails.Modetype = element.Modetype,
          candidateBankDetails.Id = element.Id,
          candidateBankDetails.CandidateDocument = element.CandidateDocument,
          candidateBankDetails.VerificationMode = element.VerificationMode
        candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
          element.PayoutLogId = 0
        }
        candidateBankDetails.PayoutLogId = element.PayoutLogId
        this.lstBankDetails.push(candidateBankDetails)
      });

      this.lstDocumentDetails.forEach(element => {
        element.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
      });
      this.LstEducation.forEach(element => {
        var candidateQualificationDetails = new Qualification();
        candidateQualificationDetails.GraduationType = element.graduationType;
        candidateQualificationDetails.EducationDegree = element.educationDegree;
        candidateQualificationDetails.CourseType = element.courseType;
        candidateQualificationDetails.InstitutionName = element.institutaion;
        candidateQualificationDetails.UniversityName = element.universityName;
        candidateQualificationDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
        candidateQualificationDetails.ScoringType = element.scoringType;
        candidateQualificationDetails.ScoringValue = element.scoringValue;
        candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
        // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
        candidateQualificationDetails.EmployeeId = this.Id;
        candidateQualificationDetails.Modetype = element.Modetype,
          candidateQualificationDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          candidateQualificationDetails.CandidateDocument = element.CandidateDocument
        this.lstQualificationDetails.push(
          candidateQualificationDetails
        )
      });
      this.deletedLstEducation.forEach(element => {
        var candidateQualificationDetails = new Qualification();
        candidateQualificationDetails.GraduationType = element.graduationType;
        candidateQualificationDetails.EducationDegree = element.educationDegree;
        candidateQualificationDetails.CourseType = element.courseType;
        candidateQualificationDetails.InstitutionName = element.institutaion;
        candidateQualificationDetails.UniversityName = element.universityName;
        candidateQualificationDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
        candidateQualificationDetails.ScoringType = element.scoringType;
        candidateQualificationDetails.ScoringValue = element.scoringValue;
        candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
        // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
        candidateQualificationDetails.Modetype = element.Modetype,
          candidateQualificationDetails.EmployeeId = this.Id;
        candidateQualificationDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          candidateQualificationDetails.CandidateDocument = element.CandidateDocument
        this.lstQualificationDetails.push(
          candidateQualificationDetails
        )
      });

      this.LstExperience.forEach(element => {
        var candidateExperienceDetails = new WorkExperience();
        candidateExperienceDetails.CompanyName = element.companyName;
        candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
        candidateExperienceDetails.DesignationHeld = element.title;
        candidateExperienceDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateExperienceDetails.WorkLocation = element.workLocation;
        candidateExperienceDetails.StartDate = element.startdate;
        candidateExperienceDetails.EndDate = element.enddate;
        candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
        candidateExperienceDetails.FunctionalArea = null;
        candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
        candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
        // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
        candidateExperienceDetails.Modetype = element.Modetype,
          candidateExperienceDetails.EmployeeId = this.Id
        candidateExperienceDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          candidateExperienceDetails.CandidateDocument = element.CandidateDocument
        this.lstExperienceDetails.push(
          candidateExperienceDetails
        )
      });
      this.deletedLstExperience.forEach(element => {
        var candidateExperienceDetails = new WorkExperience();
        candidateExperienceDetails.CompanyName = element.companyName;
        candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
        candidateExperienceDetails.DesignationHeld = element.title;
        candidateExperienceDetails.WorkLocation = element.workLocation;
        candidateExperienceDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateExperienceDetails.StartDate = element.startdate;
        candidateExperienceDetails.EndDate = element.enddate;
        candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
        candidateExperienceDetails.FunctionalArea = null;
        candidateExperienceDetails.EmployeeId = this.Id
        candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
        candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
        // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
        candidateExperienceDetails.Modetype = element.Modetype,
          candidateExperienceDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          candidateExperienceDetails.CandidateDocument = element.CandidateDocument
        this.lstExperienceDetails.push(
          candidateExperienceDetails
        )
      });

      var employeeinvestmentMaster = new EmployeeInvestmentMaster();
      employeeinvestmentMaster.PersonId = 0;
      employeeinvestmentMaster.EmployeeId = this.Id;
      employeeinvestmentMaster.FinancialYearId = this.employeeForm.get('financialYear').value;
      employeeinvestmentMaster.ModuleProcessTransactionId = 0;
      employeeinvestmentMaster.SlotClosureDate = SlotClosureDate;
      employeeinvestmentMaster.Status = 0;
      employeeinvestmentMaster.Id = this.employeedetails.EmployeeInvestmentMaster != null ? this.employeedetails.EmployeeInvestmentMaster.Id : 0;

      isProofMode ? this.Employee.EmployeeInvestmentMaster = employeeinvestmentMaster : null;

      this.Employee.WorkExperiences = this.lstExperienceDetails;
      this.Employee.Qualifications = this.lstQualificationDetails;
      this.Employee.CandidateDocuments = this.lstDocumentDetails;
      // this.Employee.CandidateDocuments
      // Profile avatar document objet updation happening here..
      if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {
        this.Employee.CandidateDocuments = this.Employee.CandidateDocuments.concat(this.new_ProfileAvatarDocument);
      }
      if (this.delete_ProfileAvatarDocument != null && this.delete_ProfileAvatarDocument.length > 0) {
        this.Employee.CandidateDocuments = this.Employee.CandidateDocuments.concat(this.delete_ProfileAvatarDocument);
      }

      if (this.Employee.LstemploymentDetails != null && this.Employee.LstemploymentDetails.length > 0) {
        this.Employee.LstemploymentDetails.forEach(element => {
          element.Id = this.isGuid(element.Id) == true ? 0 : element.Id
        });
      }

      // ONLY FOR POS AND SME - BANK WORKFLOW HAS BEEN SUSPENDED HERE
      if (this.isESSLogin == false && this.BusinessType != 3 && this.lstBankDetails.length > 0 && this.lstBankDetails.filter(a => a.Id == 0).length > 0) {
        this.lstBankDetails.forEach(e => {

          if (e.Status == 0) {
            e.IsDefault = true;
            e.Status = 1;
            e.Modetype = UIMode.Edit;
          }
          else {
            e.IsDefault = false;
            e.Status = 1;
            e.Modetype = UIMode.Edit;
          }
        });
      }
      this.Employee.lstEmployeeBankDetails = this.lstBankDetails;
      this.Employee.Modetype = UIMode.Edit;
      this.Employee.LstEmployeeHousePropertyDetails = this.LstEmployeeHousePropertyDetails;
      this.Employee.LstemployeeHouseRentDetails = this.LstemployeeHouseRentDetails;
      this.Employee.LstemployeeInvestmentDeductions = this.LstemployeeInvestmentDeductions;

      // if verification mode is penny drop the bank details default status value has been updated 

      if (this.isESSLogin == true && this.Employee.lstEmployeeBankDetails.length > 0) {
        this.Employee.lstEmployeeBankDetails.forEach(e => {
          if (e.Status == 0) {
            e.Modetype = UIMode.Edit;
          }
          if (e.VerificationMode == 2) {
            if (e.Status == 0) {

              e.IsDefault = true;
            } else {
              e.IsDefault = false;
            }
          }
        });
      }
      else if (this.isESSLogin == false && this.BusinessType == 3 && this.Employee.lstEmployeeBankDetails.length > 0 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried == false) {
        this.Employee.lstEmployeeBankDetails.forEach(e => {
          if (e.Status == 0) {
            e.Modetype = UIMode.Edit;
          }
          if (e.VerificationMode == 2) {
            if (e.Status == 0) {
              e.IsDefault = true;
            } else {
              e.IsDefault = false;
            }
          }
        });
      }

      if (this.BusinessType == 3 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried == false) {
        this.Employee.lstEmployeeBankDetails.length > 0 && this.Employee.lstEmployeeBankDetails.forEach(em => {
          if (em.VerificationMode == 2) {
            em.Status = 1
          }
        });
      }

      if (this.BusinessType != 3) {
        this.Employee.lstEmployeeBankDetails.length > 0 && this.Employee.lstEmployeeBankDetails.forEach(em => {
          if (em.VerificationMode == 2) {
            em.Status = 1
          }
        });

      }

      // var empObj = {
      //   Id: this.employeedetails.Id,
      //   FirstName: this.employeedetails.FirstName,
      //   FatherName: this.employeedetails.FatherName,
      //   DateofBirth:this.employeedetails.DateOfBirth,
      //   LstEmployeeTaxExemptionDetails: [],
      //   Modetype : UIMode.Edit
      // }

      // this.employeeModel.newobj = empObj;

      console.log('UPDATE EMPLOYEE DETAILS JSON ::', this.Employee);

      this.employeeModel.newobj = this.Employee;
      var Employee_request_param = JSON.stringify(this.employeeModel);

      if (this.Employee.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.isDuplicateBankInfo = false;
          this.loadingScreenService.stopLoading();

          if (data.Status == false && data.Message == "Account number already exists") {
            this.isDuplicateBankInfo = true;
          }
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
            sessionStorage.removeItem('_StoreLstinvestment');
            sessionStorage.removeItem('_StoreLstDeductions');

            if (this.isESSLogin == true && this.Employee.lstEmployeeBankDetails.length > 0) {
              this.Employee.lstEmployeeBankDetails.forEach(e => {
                if (e.Status == 0) {
                  data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
                }

              });
            }
            else if (this.isESSLogin == false && this.BusinessType == 3 && this.Employee.lstEmployeeBankDetails.length > 0) {
              this.Employee.lstEmployeeBankDetails.forEach(e => {
                if (e.Status == 0) {
                  data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
                }
              });
            }

            this.icontoggle = true;
            this.icontogglepan = true;

            // return;
            // return;
            if (this.isESSLogin == true && data.dynamicObject.newobj.lstEmployeeBankDetails != null && data.dynamicObject.newobj.lstEmployeeBankDetails.length > 0 && data.dynamicObject.newobj.lstEmployeeBankDetails.find(a => a.Status == 0 && a.ModuleProcessTransactionId == 0) != undefined) {
              this.triggerWorkFlowProcess(data.dynamicObject.newobj);
            }
            else if (this.isESSLogin == false && this.BusinessType == 3 && data.dynamicObject.newobj.lstEmployeeBankDetails != null && data.dynamicObject.newobj.lstEmployeeBankDetails.length > 0 && data.dynamicObject.newobj.lstEmployeeBankDetails.find(a => a.Status == 0 && a.ModuleProcessTransactionId == 0) != undefined) {
              this.triggerWorkFlowProcess(data.dynamicObject.newobj);

            }



            if (this.isESSLogin == true && isSubmit == true) { // when click on submit button then only the worflow will be triggering...
              if (isProofMode && (this.employeedetails.LstemployeeInvestmentDeductions.length > 0 || this.employeedetails.LstemployeeHouseRentDetails.length > 0 ||
                this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 || this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) && this.TaxDeclaration != 1) {
                if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0
                ) {
                  this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
                }


              }
            }
            else if (this.isESSLogin == false) {
              if (isProofMode && (this.employeedetails.LstemployeeInvestmentDeductions.length > 0 || this.employeedetails.LstemployeeHouseRentDetails.length > 0 ||
                this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 || this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) && this.TaxDeclaration != 1) {
                // this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
                if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0) {
                  //  alert('ssss')
                  this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
                }
              }
            }

            if (isProofMode == false && this.isESSLogin == false) {
              this.router.navigate(['/app/listing/ui/employeelist']);
              return;
            } else {
              this.ESS_Clear_ReupateRecord();
            }


          }
          else {
            this.alertService.showWarning(data.Message);
          }
        },
          (err) => {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);
          });
      }




    } catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }

  doSaveOrSubmit(isSubmit) {

    let isProofMode: boolean = false;
    if (this.TaxDeclaration != 1) {
      isProofMode = true;
    } else {
      isProofMode = false;
    }

    // this.employeeForm.controls['costcode'].setValue(2); //temp 
    // this.toastr.warning('<ul style="margin-left:10px"><li *ngFor="let i of this.invaid_fields">{{i}}</li></ul>',
    //   'Please complete all required fields', {
    //   enableHtml: true,
    //   closeButton: true,
    //   timeOut: 10000
    // });

    isProofMode && this.validateEmployeeInvestment().then((result) => {
      if (result != null && result[0].IsValid != true) {
        this.alertService.showWarning(result[0].Message);
        this.loadingScreenService.stopLoading();
        return;
      } else {
        this.loadingScreenService.stopLoading();
        this.finalSubmit(isProofMode, isSubmit)

      }

    })

    !isProofMode && this.finalSubmit(isProofMode, isSubmit)


  }

  async ESS_Clear_ReupateRecord() {
    this.activenavtab == 'investmentInformation' && await this.call_TimecardCalculation();
    sessionStorage.removeItem('LstHRA');
    this.clearListofItems();
    this.spinner = true;
    this.enableEditTxt = "Edit";
    this.edit_EmployeeDetails();
    this.employeeForm.disable()
    this.doBankSlickGrid();
    this.doNomineeSlickGrid();
    this.doAcademicSlickGrid();
    this.doExperienceSlickGrid();
    this.doDeductionSlickGrid();
    this.Lstinvestment = [];
    this.dynamicPFInvestments = [];
    this.activenavtab == 'investmentInformation' && this.employeeForm.controls['IsNewTaxRegimeOpted'].enable();
    this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? this.employeeForm.controls['IsNewTaxRegimeOpted'].disable() : this.employeeForm.controls['IsNewTaxRegimeOpted'].enable();

    this.Lstdeduction_Exemption = [];
    this.dynamicExeptions = [];
    this.employeeForm.controls['financialYear'].disable();
  }

  call_TimecardCalculation() {
    this.employeeService.UpdateEmployeeMarkedForCalculation(this.Id)
      .subscribe((result) => {


      })
  }

  spinnerStarOver() {

    (<HTMLInputElement>document.getElementById('overlay')).style.display = "flex";

  }


  spinnerEnd() {

    (<HTMLInputElement>document.getElementById('overlay')).style.display = "none";

  }


  clearListofItems() {

    this.Addressdetails = [];
    this.FamilyDetails = [];
    this.lstBankDetails = [];
    this.LstEmployeeHousePropertyDetails = [];
    this.LstemployeeHouseRentDetails = [];
    this.LstemployeeInvestmentDeductions = [];
    this.lstQualificationDetails = [];
    this.lstExperienceDetails = [];
    // this.new_ProfileAvatarDocument = [];
    // this.delete_ProfileAvatarDocument = [];
  }

  // EMPLOYEE DETAILS

  readURL(input) {
    if (this.profileImageDocumentId != null) {
      this.deleteProfileImgFile();
    }

    if (input.target.files && input.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.target.files[0]);
      reader.onloadend = (e) => {
        const FileName = input.target.files[0].name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, FileName, 'Profile')
        this.contentmodalurl = reader.result;
        // $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
        $('#imagePreview').hide();
        $('#imagePreview').fadeIn(650);

      }
    }
  }

  // EMPLOYMENT DETAILS

  getMigrationMasterInfo(ClientContractId) {

    this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {
      let apiResult: apiResult = (result);

      if (apiResult.Status && apiResult.Result != null) {
        this.MigrationInfoGrp = JSON.parse(apiResult.Result);
        this.TeamList = this.MigrationInfoGrp;
        this.MigrationInfoGrp != null && this.BusinessType != 3 ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList : true;

        if (this.Id != 0 && this.employeeForm.get('teamname').value != null) {
          let temp_TeamList = this.TeamList.find(a => a.Id == this.employeeForm.get('teamname').value).PayCycleDetails;
          let item = { Id: this.employeeForm.get('teamname').value, PayCycleDetails: temp_TeamList.PayCycleDetails };
          this.MigrationInfoGrp != null && this.BusinessType != 3 && this.MigrationInfoGrp[0].ReportingManagerList != null ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList.filter(a => a.TeamId == this.employeeForm.get('teamname').value) : true;

          this.onChangeTeam(item, 'other');
        }


      } else {

      }

    }), ((error) => {

    })
  }

  onChangeTeam(item, from_action) {

    this.PayCycleDetails = item.PayCycleDetails;
    if (from_action == "DOM") {

      this.BusinessType == 3 ? this.employeeForm.controls['reportingmanager'].setValue(null) : true;
      this.employeeForm.controls['costcode'].setValue(null);
    }

    this.BusinessType == 3 ? this.ManagerList = [] : true;
    this.LeaveGroupList = [];
    this.CostCodeList = [];

    let filterList = this.TeamList.find(a => a.Id == item.Id);
    this.BusinessType == 3 ? this.ManagerList = filterList.ManagerList : true;
    this.LeaveGroupList = filterList.LeaveGroupList;
    this.CostCodeList = filterList.CostCodeList;
    this.MigrationInfoGrp != null && this.BusinessType != 3 && this.MigrationInfoGrp[0].ReportingManagerList != null ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList.filter(a => a.TeamId == this.employeeForm.get('teamname').value) : true;

  }

  /* #region  EMPLOYMENT CONTRACT DETAILS TAB SET */

  currentCTC() {

    this.Current_RateSetList = null;
    if (this.employeedetails.ELCTransactions.find(z => z.IsLatest == false) != undefined) {
      const isLatestELC = (this.employeedetails.ELCTransactions.find(z => z.IsLatest == false)).EmployeeRatesets;
      if (isLatestELC == null || isLatestELC.length == 0) {
        this.alertService.showWarning(">. There seems to be no data available to show")
        return;
      }
      this.Current_RateSetList = isLatestELC[0].RatesetProducts;
      this.EffectiveDate_POP = isLatestELC[0].EffectiveDate as Date;
      this.AnnualSalary_POP = isLatestELC[0].AnnualSalary;

      if (this.Current_RateSetList == null || this.Current_RateSetList.length == 0) {
        this.alertService.showWarning("> There seems to be no data available to show");
        return;
      }

      $('#popup_currentCTC').modal('show');
    } else {
      this.alertService.showWarning(">. There seems to be no data available to show")
      return;
    }
  }
  modal_dismiss() {
    $('#popup_currentCTC').modal('hide');
  }
  viewHistory() {
    alert('On my way...')
  }

  viewLifeCycle() {
    $('#popup_lifeCycle').modal('show');
  }
  modal_dismiss1() {
    $('#popup_lifeCycle').modal('hide');
  }
  /* #endregion */


  /* #region  INVESTMENT AND DEDUCTION PROOF */
  addInvestmentCategory() {
    $('#popup_chooseCategory_investment').modal('show');
  }

  addExceptionCategory() {
    // const modalRef = this.modalService.open(BillEntryModalsComponent);
    // modalRef.componentInstance.exemptionsList = this.Lstdeduction_Exemption;
    // modalRef.result.then((result) => {
    // });
    $('#popup_chooseCategory_Exemptions').modal('show');
  }

  modal_dismiss2(closeActivity) {
    closeActivity === 'investment' && $('#popup_chooseCategory_investment').modal('hide') || closeActivity === 'deduction' && $('#popup_chooseCategoryDeduction').modal('hide') || closeActivity === 'exemptions' && $('#popup_chooseCategory_Exemptions').modal('hide');
    ;

  }
  addDeductionCategory() {
    $('#popup_chooseCategoryDeduction').modal('show');
  }
  /* #endregion */

  picked_lifeInsurance() {

    $('#popup_chooseCategoryDeduction').modal('hide');
    this.shouldUpdate_panel_flag(false, true, false, false);
  }
  picked_HRA() {
    $('#popup_chooseCategoryDeduction').modal('hide');
    this.shouldUpdate_panel_flag(false, false, true, false);
  }
  picked_HouseProperty() {
    $('#popup_chooseCategoryDeduction').modal('hide');
    this.shouldUpdate_panel_flag(false, false, false, true);
  }

  savebutton_deduction() {
    this.shouldUpdate_panel_flag(true, false, false, false);
  }

  savebutton_investment() {
    this.shouldUpdate_panel_flag(true, false, false, false);
  }

  savebutton_additional() {
    this.shouldUpdate_panel_flag(true, false, false, false);
  }




  shouldUpdate_panel_flag(summary: boolean, investment: boolean, deduction: boolean, additional: boolean) {
    this.isSummary_panel = summary;
    this.isInvestment_panel = investment;
    this.isDeduction_panel = deduction;
    this.isAdditional_panel = additional;
  }



  _loadEmpUILookUpDetails() {
    return new Promise((res, rej) => {
      this.employeeService.get_LoadEmployeeUILookUpDetails(this.Id)
        .subscribe((result) => {
          let apiResponse: apiResponse = result;
          if (apiResponse.Status) {
            this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
            this.LstInvestmentSubmissionSlot = this.lstlookUpDetails.InvestmentSubmissionSlotList != null && this.lstlookUpDetails.InvestmentSubmissionSlotList.length > 0 ?
              this.lstlookUpDetails.InvestmentSubmissionSlotList : [];
            console.log('SUBMISSION SLOT ::', this.LstInvestmentSubmissionSlot);

            this.trigger_investmentproducts_binding();

            res(true);
          }

        }, err => {
          rej();
        })
    });
  }
  trigger_investmentproducts_binding() {
    console.log('LOOK UP DETAILS EMP :', this.lstlookUpDetails);

    this.DocumentTypeList = this.lstlookUpDetails.DocumentTypeList;
    this.collection = this.lstlookUpDetails.InvesmentProductList;
    this.FicalYearList = this.lstlookUpDetails.FicalYearList;

    this.TaxationCategory = [];
    this.TaxationCategory = environment.environment.HousePropertyDetails_Static;
    this.collection = [...this.TaxationCategory, ...this.collection];
    let hra = [];
    hra = _.filter(this.collection, item => item.ProductId == environment.environment.HRA_DynamicProductId);
    this.TaxationCategory = [...this.TaxationCategory, ...hra];
    const collections = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Investment });
    });
    this.TaxationOtherCategory = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Deductions });
    });
    this.TaxationOtherCategory_Exemption = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Exemptions });
    });

    console.log('ddd', this.TaxationOtherCategory_Exemption);


    console.log('fff', this.employeedetails)

    let list = []
    // for (let _exemptionitem of this._exemptionList) {
    //   let item = this.TaxationOtherCategory_Exemption.find(TaxationItem => TaxationItem.ProductId == _exemptionitem.ProductId)
    //   if (item) list.push(item);
    // }
    // let empRateSets=this.employeedetails['EmployeeRatesets']
    // for(let _exemptionitem of empRateSets){
    //   let item = this.TaxationOtherCategory_Exemption.find(TaxationItem => TaxationItem.ProductId == _exemptionitem.ProductId)
    //   if (item) list.push(item);
    // }
    // console.log("list",list)
    // this.TaxationOtherCategory_Exemption = list;

    console.log('eee', this.employeedetails['EmployeeRatesets'])
    this.TaxationOtherCategory = this.TaxationOtherCategory.filter(pro => pro.ProductCode.toUpperCase() != 'PT');
    this.TaxationCategory_Investment = _(collections)
      .keyBy('ProductId')
      .at(environment.environment.CommonlyUsedItemsForInvestment)
      .value();
    this.TaxationOtherCategory_Investment = _.filter(collections, item => environment.environment.CommonlyUsedItemsForInvestment.indexOf(item.ProductId) === -1);
    this.TaxationOtherCategory_Investment = this.TaxationOtherCategory_Investment.filter(pro => pro.ProductCode.toUpperCase() != 'PF');

  }

  getLetterSpace(string) {
    return string != null ? string.replace(/([a-z])([A-Z])/g, '$1 $2') : '';
  }

  chooseCategory(item: any, which: any) {
    // if (item.ProductCode.toUpperCase() == 'PF') {
    //   this.alertService.showWarning("You do not have access such Investment Product. Please contact your support admin.");
    //   return;
    // }
    which == "investment" && $('#popup_chooseCategory_investment').modal('hide');
    which == "duduction" && $('#popup_chooseCategoryDeduction').modal('hide');
    which == "exemption" && $('#popup_chooseCategory_Exemptions').modal('hide');
    if (which == "duduction" && this.Lstdeduction_Exemption.length > 0) {
      var isExist = [];

      isExist = this.Lstdeduction_Exemption.filter(z => z.ProductId === (item.ProductId) && z.Section == 'Sec10');
      if (isExist.length > 0) {
        this.alertService.showWarning("The selected product category already exist!");
        return;
      } else {
        this.openDrawer(item, which, null)
      }

    }
    else if (which == "exemption" && this.TaxationOtherCategory_Exemption.length > 0) {
      let _eId = (this.isESSLogin ? this.EmployeeId : this.Id);

      console.log('this.Lstinvestment', this.Lstinvestment);

      sessionStorage.removeItem("_StoreLstinvestment");
      sessionStorage.removeItem("_StoreLstDeductions");
      if (this.isESSLogin == false) {
        sessionStorage.removeItem("IsFromBillEntry");
        sessionStorage.setItem('IsFromBillEntry', "true");
      }
      if (this.Lstinvestment.length > 0 && this.Lstinvestment.find(c => c.Id == 0 || this.isGuid(c.Id) == true)) {
        var _store = [];
        var _store = this.Lstinvestment.filter(c => c.Id == 0 || this.isGuid(c.Id) == true);
        console.log(' var _store', _store);
        sessionStorage.setItem('_StoreLstinvestment', JSON.stringify(_store));
      }
      if (this.Lstdeduction_Exemption.length > 0 && this.Lstdeduction_Exemption.find(c => c.Id == 0 || this.isGuid(c.Id) == true)) {
        var _store1 = [];
        var _store1 = this.Lstdeduction_Exemption.filter(c => c.Id == 0 || this.isGuid(c.Id) == true);
        console.log(' var _store', _store1);
        sessionStorage.setItem('_StoreLstDeductions', JSON.stringify(_store1));
      }

      sessionStorage.removeItem("TaxDeclarationMode");
      sessionStorage.removeItem("IsBillEntryEss");

      sessionStorage.setItem('TaxDeclarationMode', this.TaxDeclaration.toString());
      sessionStorage.setItem('IsBillEntryEss', this.isESSLogin.toString());
      this.router.navigate(['app/ess/expenseBillEntry'], {
        queryParams: {
          "Idx": btoa(item.ProductId),
          "Fdx": btoa(this.employeeForm.get('financialYear').value),
          "Edx": btoa(_eId as any),
          // "IsE" : this.isESSLogin
        }

        // queryParams: { id: item.ProductId, }


      });

    }
    else { this.openDrawer(item, which, null) }
  }



  openDrawer(item, which, editableObj) {

    // var mode: boolean = (<HTMLInputElement>document.getElementById('toggle')).checked;
    var mode: boolean = this.TaxDeclaration == 1 ? true : false;
    // mode = true;
    const drawerRef = this.drawerService.create<CustomdrawerModalComponent, { categoryJson: any, whichCategory: any, Mode: boolean, editableObj: any, objStorageJson, CityList }, string>({
      nzTitle: this.getLetterSpace(item.ProductName),
      nzContent: CustomdrawerModalComponent,
      nzWidth: item.b[0].Code === 'Sec10' ? 840 : 640,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        categoryJson: item,
        whichCategory: item.b[0].Code.toUpperCase() === 'SEC24' ? 'duduction_Additional' : (item.b[0].Code.toUpperCase() === 'SEC80D' || item.b[0].Code.toUpperCase() === 'SEC80DD' || item.b[0].Code.toUpperCase() === 'SEC80DDB') ? 'duduction_Medical' :
          (item.b[0].Code.toUpperCase() === '80 E' || item.b[0].Code.toUpperCase() === 'SEC80G') ? 'deduction_Loan' : item.b[0].Code.toUpperCase() === 'SEC80U' ? 'deduction_Self'
            : which,
        Mode: mode,//this.isESSLogin == true ? true : mode,
        editableObj: editableObj === null ? null : JSON.stringify(editableObj),
        objStorageJson: JSON.stringify({
          empName: this.employeeForm.get('Name').value,
          email: this.employeeForm.get('email').value,
          EmployeeId: this.Id, CompanyId: this.CompanyId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId,
          ClientId: this.employeedetails.EmploymentContracts[0].ClientId
        }),
        CityList: JSON.stringify(this.lstlookUpDetails.CityList)
      }
    });

    drawerRef.afterOpen.subscribe(() => {
    });

    drawerRef.afterClose.subscribe(data => {

      var modalResult = (data) as any;
      if (data != undefined) {


        if (which == "investment") {
          var foundIndex = this.Lstinvestment.findIndex(z => z.Id == (modalResult.Id));
          if (foundIndex === -1) {
            this.Lstinvestment.push(data);
          } else {
            this.Lstinvestment[foundIndex] = data;
          }

          // var isExist = this.Lstinvestment.find(z => z.Id == (modalResult.Id));
          // isExist !== undefined && (isExist.AmtInvested = (modalResult.AmtInvested))
          // isExist === undefined && this.Lstinvestment.push(data)
        }

        else if (which == "duduction") {
          var foundIndex = this.Lstdeduction_Exemption.findIndex(z => z.Id == (modalResult.Id));
          if (foundIndex === -1) {
            this.Lstdeduction_Exemption.push(data);
          } else {
            this.Lstdeduction_Exemption[foundIndex] = data;
          }

          // var isExist = this.Lstdeduction_Exemption.find(z => z.Id == (modalResult.Id));
          // isExist !== undefined && (isExist.AmtInvested = (modalResult.AmtInvested))
          // isExist === undefined && this.Lstdeduction_Exemption.push(data)
          // console.log('lst', this.Lstdeduction_Exemption);

          if (modalResult.Section === 'Sec10') {

          }
        };

      }

    });
  }

  deleteInvestment(object) {

    if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length > 0) {
      this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
      return;
    }

    this.alertService.confirmSwal("Are you sure?", "Are you sure you want to delete this investment product?", "Yes, Delete").then(result => {
      if (!this.isGuid(object.Id)) {

        this.deletedLstInvestmentDeduction.push(object);
      }
      const indexs: number = this.Lstinvestment.indexOf(object);
      if (indexs !== -1) {
        this.Lstinvestment.splice(indexs, 1);
      }

    })
      .catch(error => { });

  }

  editInvestment(object) {
    if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length == object.DocumentDetails.length) {
      this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
      return;
    }
    this.openDrawer(this.collection.find(a => a.ProductId === object.ProductId), 'investment', (object));
  }
  editDeduction(object) {
    if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length == object.DocumentDetails.length) {
      this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
      return;
    }

    this.openDrawer(this.collection.find(a => a.ProductId === object.ProductId), 'duduction', (object));
  }

  deleteDeduction(object) {


    if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length > 0) {
      this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
      return;
    }

    this.alertService.confirmSwal("Are you sure?", "Are you sure you want to delete this investment product?", "Yes, Delete").then(result => {
      const indexs: number = this.Lstdeduction_Exemption.indexOf(object);
      if (this.isGuid(object.Id) && object.Section == 'Sec10' && !this.isGuid(object.AdditionalList[0].Id)) {
        object.AdditionalList.forEach(e => {
          e['Section'] = object.Section;
          this.deletedLstExemption.push(e);
        });
      }
      if (!this.isGuid(object.Id)) {
        this.deletedLstExemption.push(object);
      }
      if (indexs !== -1) {
        this.Lstdeduction_Exemption.splice(indexs, 1);
      }


    })
      .catch(error => { });

  }


  test() {

    // var mode: boolean = (<HTMLInputElement>document.getElementById('toggle')).checked;
    // Declaration = 1,
    // Proof = 2
    //    var _md: any = this.TaxDeclaration == 1 ? 1 : 2;
    // isproposed = mode == declaretion = fasle == true 
    var mode: boolean = this.TaxDeclaration == 1 ? false : true;

    this.Lstinvestment.forEach(item => {

      var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      empInvestmentDeduction.EmployeeId = this.Id;
      empInvestmentDeduction.FinancialYearId = this.employeeForm.get('financialYear').value;
      empInvestmentDeduction.ProductID = item.ProductId;
      empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
      empInvestmentDeduction.IsDifferentlyabled = false;
      empInvestmentDeduction.Amount = item.AmtInvested;
      empInvestmentDeduction.Details = '';
      empInvestmentDeduction.IsProposed = (item.DocumentDetails != null && mode == true) ? false : true;
      empInvestmentDeduction.InputsRemarks = item.Remarks;
      empInvestmentDeduction.ApprovedAmount = item.AmtApproved;
      empInvestmentDeduction.ApproverRemarks = ''
      empInvestmentDeduction.Status = 1;
      empInvestmentDeduction.DocumentId = 0;
      empInvestmentDeduction.LstEmpInvDepDetails = [];
      empInvestmentDeduction.Modetype = UIMode.Edit;
      empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;
      empInvestmentDeduction.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
      this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
    })


    this.deletedLstInvestmentDeduction.forEach(item => {
      var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      empInvestmentDeduction.EmployeeId = this.Id;
      empInvestmentDeduction.FinancialYearId = this.employeeForm.get('financialYear').value;
      empInvestmentDeduction.ProductID = item.ProductId;
      empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
      empInvestmentDeduction.IsDifferentlyabled = false;
      empInvestmentDeduction.Amount = item.AmtInvested;
      empInvestmentDeduction.Details = '';
      empInvestmentDeduction.IsProposed = mode == false ? true : false;
      empInvestmentDeduction.InputsRemarks = item.Remarks;
      empInvestmentDeduction.ApprovedAmount = item.AmtApproved;
      empInvestmentDeduction.ApproverRemarks = ''
      empInvestmentDeduction.Status = 1;
      empInvestmentDeduction.DocumentId = 0;
      empInvestmentDeduction.LstEmpInvDepDetails = [];
      empInvestmentDeduction.Modetype = UIMode.Delete;
      empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;
      empInvestmentDeduction.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
      this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
    })

    this.deletedLstExemption.forEach(item => {

      if (item.Section === "Sec10") {
        // item.AdditionalList.forEach(element => {         
        var hraObj = new EmployeeHouseRentDetails();
        var LandLordDetails = {
          "Name": item.NameofLandlord,
          "AddressDetails": JSON.stringify({ LandlordAddress: item.LandlordAddress, NameofCity: item.NameofCity, RentalHouseAddress: item.RentalHouseAddress }),
          "PAN": item.PANofLandlord
        }
        hraObj.Id = this.isGuid(item.Id) == true ? 0 : item.Id,
          hraObj.EmployeeId = this.Id,
          hraObj.FinancialYearId = this.employeeForm.get('financialYear').value,
          hraObj.StartDate = moment((item.StartDate)).format('YYYY-MM-DD'),
          hraObj.EndDate = moment(new Date(item.EndDate)).format('YYYY-MM-DD'),
          hraObj.RentAmount = item.RentAmountPaid,
          hraObj.ApprovedAmount = 0,
          hraObj.AddressDetails = item.RentalHouseAddress,
          hraObj.IsMetro = item.isChecked == true ? true : false,
          hraObj.IsProposed = mode == false ? true : false;
        hraObj.LandLordDetails = LandLordDetails,
          hraObj.DocumentId = 0,
          hraObj.InputsRemarks = item.Remarks,
          hraObj.ApproverRemarks = '',
          hraObj.Status = 1,
          hraObj.Modetype = UIMode.Delete,
          // hraObj.LstEmployeeInvestmentDocuments = item.DocumentDetails;
          this.LstemployeeHouseRentDetails.push(hraObj)

        // });
      }
      else if (item.Section === "Sec80G" || item.Section === "Sec80U" || item.Section == "80 E") {
        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.Id;
        empInvestmentDeduction.FinancialYearId = this.employeeForm.get('financialYear').value;
        empInvestmentDeduction.ProductID = item.ProductId;
        empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
        empInvestmentDeduction.IsDifferentlyabled = false;
        empInvestmentDeduction.Amount = item.AmtInvested;
        empInvestmentDeduction.Details = '';
        empInvestmentDeduction.IsProposed = mode == false ? true : false;
        empInvestmentDeduction.InputsRemarks = item.Remarks;
        empInvestmentDeduction.ApprovedAmount = item.AmtApproved;
        empInvestmentDeduction.ApproverRemarks = ''
        empInvestmentDeduction.Status = 1;
        empInvestmentDeduction.DocumentId = 0;
        empInvestmentDeduction.LstEmpInvDepDetails = [];
        empInvestmentDeduction.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.Modetype = UIMode.Delete;
        empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;

        this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
      }
      else if (item.Section === "Sec24") {
        var empHousePropDetails = new EmployeeHousePropertyDetails();
        empHousePropDetails.EmployeeId = this.Id,
          empHousePropDetails.FinancialYearId = this.employeeForm.get('financialYear').value,
          empHousePropDetails.LetOut = item.AdditionalDetailsObject.occupanyType == 'rentedOut' ? true : false;
        empHousePropDetails.GrossAnnualValue = item.AdditionalDetailsObject.AnnualRent;
        empHousePropDetails.MunicipalTax = item.AdditionalDetailsObject.MunicipalTaxesPaid;
        empHousePropDetails.InterestAmount = item.AdditionalDetailsObject.InterestPaid;
        empHousePropDetails.PreConstructionInterestAmount = item.AdditionalDetailsObject.Pre_ConstructionInterest;
        empHousePropDetails.InstallmentNumber = item.AdditionalDetailsObject.InstallmentNumber;
        empHousePropDetails.LoanDate = moment(item.AdditionalDetailsObject.LoanAvailedDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        empHousePropDetails.PossessionDate = moment(item.AdditionalDetailsObject.PropertyPossessionDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        empHousePropDetails.IsProposed = mode == false ? true : false;
        empHousePropDetails.DocumentId = 0;
        empHousePropDetails.InputsRemarks = item.Remarks;
        empHousePropDetails.AddressOfLender = item.AdditionalDetailsObject.addressOfLender;
        empHousePropDetails.GrossAnnualValueApprovedAmount = item.AdditionalDetailsObject.GrossAnnualValueApprovedAmount;
        empHousePropDetails.MunicipalTaxApprovedAmount = item.AdditionalDetailsObject.MunicipalTaxApprovedAmount;
        empHousePropDetails.InterestAmountApprovedAmount = item.AdditionalDetailsObject.InterestAmountApprovedAmount;
        empHousePropDetails.PreConstructionInterestApprovedAmount = item.AdditionalDetailsObject.PreConstructionInterestApprovedAmount;
        empHousePropDetails.ApproverRemarks = '';
        empHousePropDetails.PrincipalAmount = item.AdditionalDetailsObject.PrincipalAmount;
        empHousePropDetails.AddressDetails = item.AdditionalDetailsObject.addressOfProperty;
        empHousePropDetails.Status = 1;
        empHousePropDetails.FirstTimeHomeOwner = item.AdditionalDetailsObject.isFirstTime;
        empHousePropDetails.OwnershipPercentage = item.AdditionalDetailsObject.ownership;
        empHousePropDetails.LenderPANNO = item.AdditionalDetailsObject.PANofLender;
        empHousePropDetails.Modetype = UIMode.Delete;
        empHousePropDetails.NameOfLender = item.AdditionalDetailsObject.NameOfLender;
        empHousePropDetails.LstEmployeeInvestmentDocuments = item.DocumentDetails;
        empHousePropDetails.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
        this.LstEmployeeHousePropertyDetails.push(empHousePropDetails)
      }
      else if (item.Section === "Sec80D" || item.Section === "Sec80DD" || item.Section === "Sec80DDB") {

        item.AdditionalList.forEach(e => {
          var empinvDepdetails = new EmployeeInvesmentDependentDetails();
          empinvDepdetails.EmpInvestmentDeductionId = item.ProductId;
          empinvDepdetails.EmployeeId = this.Id;
          empinvDepdetails.DependentType = e.DependentTypes === null ? 0 : e.DependentTypes
          empinvDepdetails.DisabilityPercentage = e.DisabilityPercentage != null ? e.DisabilityPercentage : 0;
          empinvDepdetails.DependentAge = 0;
          empinvDepdetails.Relationship = e.relationship === null ? 0 : e.relationship;
          empinvDepdetails.DependentName = e.NameofDependent;
          empinvDepdetails.DependentDateOfBirth = e.DOB;
          empinvDepdetails.Amount = e.Amount;
          empinvDepdetails.Details = '';
          empinvDepdetails.InputsRemarks = item.Remarks;
          empinvDepdetails.ApprovedAmount = e.ApprovedAmount;
          empinvDepdetails.ApproverRemarks = '';
          empinvDepdetails.Status = 1;
          empinvDepdetails.DocumentId = 0;
          empinvDepdetails.Modetype = UIMode.Delete;
          empinvDepdetails.Id = this.isGuid(e.Id) == true ? 0 : e.Id;
          this.LstEmpInvDepDetails.push(empinvDepdetails)
        });

        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.Id;
        empInvestmentDeduction.FinancialYearId = this.employeeForm.get('financialYear').value;
        empInvestmentDeduction.ProductID = item.ProductId;
        empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
        empInvestmentDeduction.IsDifferentlyabled = false;
        empInvestmentDeduction.Amount = item.AmtInvested;
        empInvestmentDeduction.Details = '';
        empInvestmentDeduction.IsProposed = mode == false ? true : false;
        empInvestmentDeduction.InputsRemarks = item.Remarks;
        empInvestmentDeduction.ApprovedAmount = item.AmtApproved;
        empInvestmentDeduction.ApproverRemarks = ''
        empInvestmentDeduction.Status = 1;
        empInvestmentDeduction.DocumentId = 0;
        empInvestmentDeduction.LstEmpInvDepDetails = this.LstEmpInvDepDetails;
        empInvestmentDeduction.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.Modetype = UIMode.Delete;
        empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;

        this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
      }
    });

    this.Lstdeduction_Exemption.forEach(item => {


      if (item.Section === "Sec10") {
        // var et = null;
        item.AdditionalList.forEach(element => {
          // et = JSON.parse(element.UIData);
          // var tempitem = [];
          // item.AdditionalList.forEach(function (item) {  tempitem.push(item) });

          //         if(element.EntryType == 2){
          //           var startdate = moment((element.StartDate)).format('YYYY-MM-DD');

          //             for (let i = 0; i < 12; i++) {
          //               var futureMonth = moment(startdate).add(i, 'M');
          //               const startOfMonth = moment(futureMonth).startOf('month').format('YYYY-MM-DD');
          //               const endOfMonth = moment(futureMonth).endOf('month').format('YYYY-MM-DD');

          //               var hraObj = new EmployeeHouseRentDetails();
          //             var LandLordDetails = {
          //             "Name": element.NameofLandlord,
          //             "AddressDetails": JSON.stringify({ LandlordAddress: element.LandlordAddress, NameofCity: element.NameofCity, RentalHouseAddress: element.RentalHouseAddress }),
          //             "PAN": element.PANofLandlord
          //           }
          //             hraObj.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          //             hraObj.EmployeeId = this.Id,
          //             hraObj.FinancialYearId = this.employeeForm.get('financialYear').value,
          //             hraObj.StartDate = moment((element.StartDate)).format('YYYY-MM-DD'),
          //             hraObj.EndDate = moment(new Date(element.EndDate)).format('YYYY-MM-DD'),
          //             hraObj.RentAmount = ( i < 6 ?  item.AdditionalList[0].RentAmountPaid/6 : item.AdditionalList[1].RentAmountPaid/6),
          //             hraObj.ApprovedAmount = 0,
          //             hraObj.AddressDetails = element.RentalHouseAddress,
          //             hraObj.IsMetro = element.isChecked == true ? true : false,
          //             hraObj.IsProposed = false,
          //             hraObj.LandLordDetails = LandLordDetails,
          //             hraObj.DocumentId = 0,
          //             hraObj.InputsRemarks = item.Remarks,
          //             hraObj.ApproverRemarks = '',
          //             hraObj.Status = 1,
          //             hraObj.Modetype = UIMode.Edit,
          //             hraObj.UIData = JSON.stringify({EntryType : element.EntryType, Data :hraObj})
          //             this.LstemployeeHouseRentDetails.push(hraObj)

          //             }

          //         }else if (element.EntryType == 1){
          //  var hraObj = new EmployeeHouseRentDetails();
          //           var LandLordDetails = {
          //             "Name": element.NameofLandlord,
          //             "AddressDetails": JSON.stringify({ LandlordAddress: element.LandlordAddress, NameofCity: element.NameofCity, RentalHouseAddress: element.RentalHouseAddress }),
          //             "PAN": element.PANofLandlord
          //           }
          //             hraObj.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          //             hraObj.EmployeeId = this.Id,
          //             hraObj.FinancialYearId = this.employeeForm.get('financialYear').value,
          //             hraObj.StartDate = moment((element.StartDate)).format('YYYY-MM-DD'),
          //             hraObj.EndDate = moment(new Date(element.EndDate)).format('YYYY-MM-DD'),
          //             hraObj.RentAmount = element.RentAmountPaid,
          //             hraObj.ApprovedAmount = 0,
          //             hraObj.AddressDetails = element.RentalHouseAddress,
          //             hraObj.IsMetro = element.isChecked == true ? true : false,
          //             hraObj.IsProposed = false,
          //             hraObj.LandLordDetails = LandLordDetails,
          //             hraObj.DocumentId = 0,
          //             hraObj.InputsRemarks = item.Remarks,
          //             hraObj.ApproverRemarks = '',
          //             hraObj.Status = 1,
          //             hraObj.Modetype = UIMode.Edit,
          //             hraObj.UIData = JSON.stringify({EntryType : element.EntryType, Data : hraObj})
          //             this.LstemployeeHouseRentDetails.push(hraObj)
          //         }else {



          var hraObj = new EmployeeHouseRentDetails();
          var LandLordDetails = {
            "Name": element.NameofLandlord,
            "AddressDetails": JSON.stringify({ LandlordAddress: element.LandlordAddress, NameofCity: element.NameofCity, RentalHouseAddress: element.RentalHouseAddress }),
            "PAN": element.PANofLandlord
          }
          hraObj.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
            hraObj.EmployeeId = this.Id,
            hraObj.FinancialYearId = this.employeeForm.get('financialYear').value,
            hraObj.StartDate = moment((element.StartDate)).format('YYYY-MM-DD'),
            hraObj.EndDate = moment(new Date(element.EndDate)).format('YYYY-MM-DD'),
            hraObj.RentAmount = element.RentAmountPaid,
            hraObj.ApprovedAmount = element.ApprovedAmount,
            hraObj.AddressDetails = element.RentalHouseAddress,
            hraObj.IsMetro = element.isChecked == true ? true : false,
            hraObj.IsProposed = (item.DocumentDetails != null && mode == true) ? false : true;
          hraObj.LandLordDetails = LandLordDetails,
            hraObj.DocumentId = 0,
            hraObj.InputsRemarks = item.Remarks,
            hraObj.ApproverRemarks = '',
            hraObj.Status = 1,
            hraObj.Modetype = UIMode.Edit,
            hraObj.LstEmployeeInvestmentDocuments = item.DocumentDetails;

          // hraObj.UIData = JSON.stringify({EntryType : element.EntryType, Data : hraObj})
          this.LstemployeeHouseRentDetails.push(hraObj)
          // }
        });
        // var tempitem = [];
        //       this.LstemployeeHouseRentDetails.forEach(function (item) {  tempitem.push(item) });
        // this.LstemployeeHouseRentDetails.forEach(element => {
        //   element['UIDatea']=  JSON.stringify({EntryType : et.EntryType, Data : tempitem})
        // });

        // console.log('this.LstemployeeHouseRentDetails', this.LstemployeeHouseRentDetails);


      }
      else if (item.Section === "Sec80G" || item.Section === "Sec80U" || item.Section == '80 E') {
        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.Id;
        empInvestmentDeduction.FinancialYearId = this.employeeForm.get('financialYear').value;
        empInvestmentDeduction.ProductID = item.ProductId;
        empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
        empInvestmentDeduction.IsDifferentlyabled = false;
        empInvestmentDeduction.Amount = item.AmtInvested;
        empInvestmentDeduction.Details = '';
        empInvestmentDeduction.IsProposed = (item.DocumentDetails != null && mode == true) ? false : true;
        empInvestmentDeduction.InputsRemarks = item.Remarks;
        empInvestmentDeduction.ApprovedAmount = item.AmtApproved;
        empInvestmentDeduction.ApproverRemarks = ''
        empInvestmentDeduction.Status = 1;
        empInvestmentDeduction.DocumentId = 0;
        empInvestmentDeduction.LstEmpInvDepDetails = [];
        empInvestmentDeduction.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.Modetype = UIMode.Edit;
        empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;

        this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
      }
      else if (item.Section === "Sec24") {
        var empHousePropDetails = new EmployeeHousePropertyDetails();
        empHousePropDetails.EmployeeId = this.Id,
          empHousePropDetails.FinancialYearId = this.employeeForm.get('financialYear').value,
          empHousePropDetails.LetOut = item.AdditionalDetailsObject.occupanyType == 'rentedOut' ? true : false;
        empHousePropDetails.GrossAnnualValue = item.AdditionalDetailsObject.AnnualRent;
        empHousePropDetails.MunicipalTax = item.AdditionalDetailsObject.MunicipalTaxesPaid;
        empHousePropDetails.InterestAmount = item.AdditionalDetailsObject.InterestPaid;
        empHousePropDetails.PreConstructionInterestAmount = item.AdditionalDetailsObject.Pre_ConstructionInterest;
        empHousePropDetails.InstallmentNumber = item.AdditionalDetailsObject.InstallmentNumber;
        empHousePropDetails.LoanDate = moment(item.AdditionalDetailsObject.LoanAvailedDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        empHousePropDetails.PossessionDate = moment(item.AdditionalDetailsObject.PropertyPossessionDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
        empHousePropDetails.IsProposed = (item.DocumentDetails != null && mode == true) ? false : true;
        empHousePropDetails.DocumentId = 0;
        empHousePropDetails.InputsRemarks = item.Remarks;
        empHousePropDetails.AddressOfLender = item.AdditionalDetailsObject.addressOfLender;
        empHousePropDetails.GrossAnnualValueApprovedAmount = item.AdditionalDetailsObject.GrossAnnualValueApprovedAmount;
        empHousePropDetails.MunicipalTaxApprovedAmount = item.AdditionalDetailsObject.MunicipalTaxApprovedAmount;
        empHousePropDetails.InterestAmountApprovedAmount = item.AdditionalDetailsObject.InterestAmountApprovedAmount;
        empHousePropDetails.PreConstructionInterestApprovedAmount = item.AdditionalDetailsObject.PreConstructionInterestApprovedAmount;
        empHousePropDetails.ApproverRemarks = '';
        empHousePropDetails.PrincipalAmount = item.AdditionalDetailsObject.PrincipalAmount;
        empHousePropDetails.AddressDetails = item.AdditionalDetailsObject.addressOfProperty;
        empHousePropDetails.Status = 1;
        empHousePropDetails.FirstTimeHomeOwner = item.AdditionalDetailsObject.isFirstTime;
        empHousePropDetails.OwnershipPercentage = item.AdditionalDetailsObject.ownership;
        empHousePropDetails.LenderPANNO = item.AdditionalDetailsObject.PANofLender;
        empHousePropDetails.Modetype = UIMode.Edit;
        empHousePropDetails.NameOfLender = item.AdditionalDetailsObject.NameOfLender;
        empHousePropDetails.LstEmployeeInvestmentDocuments = item.DocumentDetails;

        empHousePropDetails.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
        this.LstEmployeeHousePropertyDetails.push(empHousePropDetails)
      }
      else if (item.Section === "Sec80D" || item.Section === "Sec80DD" || item.Section === "Sec80DDB") {
        this.LstEmpInvDepDetails = [];
        item.AdditionalList.forEach(e => {
          var empinvDepdetails = new EmployeeInvesmentDependentDetails();
          empinvDepdetails.EmpInvestmentDeductionId = item.ProductId;
          empinvDepdetails.EmployeeId = this.Id;
          empinvDepdetails.DependentType = e.DependentTypes === null ? 0 : e.DependentTypes
          empinvDepdetails.DisabilityPercentage = e.DisabilityPercentage != null ? e.DisabilityPercentage : 0;
          empinvDepdetails.DependentAge = 0;
          empinvDepdetails.Relationship = e.relationship === null ? 0 : e.relationship;
          empinvDepdetails.DependentName = e.NameofDependent;
          empinvDepdetails.DependentDateOfBirth = e.DOB;
          empinvDepdetails.Amount = e.Amount;
          empinvDepdetails.Details = '';
          empinvDepdetails.InputsRemarks = item.Remarks;
          empinvDepdetails.ApprovedAmount = e.ApprovedAmount;
          empinvDepdetails.ApproverRemarks = '';
          empinvDepdetails.Status = 1;
          empinvDepdetails.DocumentId = 0;
          empinvDepdetails.Modetype = UIMode.Edit;
          empinvDepdetails.Id = this.isGuid(e.Id) == true ? 0 : e.Id;
          this.LstEmpInvDepDetails.push(empinvDepdetails)
        });

        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.Id;
        empInvestmentDeduction.FinancialYearId = this.employeeForm.get('financialYear').value;
        empInvestmentDeduction.ProductID = item.ProductId;
        empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
        empInvestmentDeduction.IsDifferentlyabled = false;
        empInvestmentDeduction.Amount = item.AmtInvested;
        empInvestmentDeduction.Details = '';
        empInvestmentDeduction.IsProposed = (item.DocumentDetails != null && mode == true) ? false : true;
        empInvestmentDeduction.InputsRemarks = item.Remarks;
        empInvestmentDeduction.ApprovedAmount = item.AmtApproved;
        empInvestmentDeduction.ApproverRemarks = ''
        empInvestmentDeduction.Status = 1;
        empInvestmentDeduction.DocumentId = 0;
        empInvestmentDeduction.LstEmpInvDepDetails = this.LstEmpInvDepDetails;
        empInvestmentDeduction.Id = this.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.Modetype = UIMode.Edit;
        empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;

        this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
      }
    });


    let deleteHRA = [];
    deleteHRA = JSON.parse((sessionStorage.getItem('LstHRA')));
    if (deleteHRA != null) {
      deleteHRA.forEach(element => {
        var hraObj = new EmployeeHouseRentDetails();
        var LandLordDetails = {
          "Name": element.NameofLandlord,
          "AddressDetails": JSON.stringify({ LandlordAddress: element.LandlordAddress, NameofCity: element.NameofCity, RentalHouseAddress: element.RentalHouseAddress }),
          "PAN": element.PANofLandlord
        }
        hraObj.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          hraObj.EmployeeId = this.Id,
          hraObj.FinancialYearId = this.employeeForm.get('financialYear').value,
          hraObj.StartDate = moment((element.StartDate)).format('YYYY-MM-DD'),
          hraObj.EndDate = moment(new Date(element.EndDate)).format('YYYY-MM-DD'),
          hraObj.RentAmount = element.RentAmountPaid,
          hraObj.ApprovedAmount = element.ApprovedAmount,
          hraObj.AddressDetails = element.RentalHouseAddress,
          hraObj.IsMetro = false,
          hraObj.IsProposed = mode == false ? true : false;
        hraObj.LandLordDetails = LandLordDetails,
          hraObj.DocumentId = 0,
          hraObj.InputsRemarks = '',
          hraObj.ApproverRemarks = '',
          hraObj.Status = 1,
          hraObj.Modetype = UIMode.Delete,

          // hraObj.UIData = JSON.stringify({EntryType : 1, Data : hraObj})
          this.LstemployeeHouseRentDetails.push(hraObj)
      });
    }


  }

  load_preinsertedRecords() {
    this.Lstinvestment = [];
    this.Lstdeduction_Exemption = [];
    var additinalLstForHRA = [];
    this.dynamicExeptions = [];
    // this.TaxDeclaration != 1 && this.Employee.LstemployeeInvestmentDeductions.length > 0 ?  this.Employee.LstemployeeInvestmentDeductions =   this.Employee.LstemployeeInvestmentDeductions.filter(a=>a.IsProposed == false) :    this.Employee.LstemployeeInvestmentDeductions.filter(a=>a.IsProposed == true);
    // this.TaxDeclaration != 1 && this.Employee.LstemployeeHouseRentDetails.length > 0 ?  this.Employee.LstemployeeHouseRentDetails =  this.Employee.LstemployeeHouseRentDetails.filter(a=>a.IsProposed == false) :    this.Employee.LstemployeeHouseRentDetails.filter(a=>a.IsProposed == true);    
    // this.TaxDeclaration != 1 && this.Employee.LstEmployeeHousePropertyDetails.length > 0 ? this.Employee.LstEmployeeHousePropertyDetails =   this.Employee.LstEmployeeHousePropertyDetails.filter(a=>a.IsProposed == false) :    this.Employee.LstEmployeeHousePropertyDetails.filter(a=>a.IsProposed == true);

    console.log('this.Employee.LstEmployeeTaxExemptionDetails', this.Employee.LstEmployeeTaxExemptionDetails);



    // this.dynamicExeptions=Response.LstEmployeeTaxExemptionDetails

    this.Employee.LstemployeeHouseRentDetails.forEach(e => {

      if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {
        additinalLstForHRA.push({
          EndDate: new Date(e.EndDate),
          Id: e.Id,
          // UIData: e.UIData,
          isChecked: e.IsMetro == true ? true : false,
          // LandlordAddress: e.LandLordDetails.AddressDetails,
          NameofCity: e.LandLordDetails != null && (e.LandLordDetails.AddressDetails != null && (JSON.parse(e.LandLordDetails.AddressDetails).NameofCity)),
          NameofLandlord: e.LandLordDetails != null && e.LandLordDetails.Name,
          ObjectStorageId: e.DocumentId,
          PANofLandlord: e.LandLordDetails != null && e.LandLordDetails.PAN,
          RentAmountPaid: e.RentAmount,
          RentalHouseAddress: e.AddressDetails,
          StartDate: new Date(e.StartDate),
          ApprovedAmount: e.ApprovedAmount
        })
      }

    });
    if (this.Employee.LstemployeeHouseRentDetails.length > 0 && additinalLstForHRA.length > 0) {
      var sum = 0
      this.Employee.LstemployeeHouseRentDetails.forEach(e => {
        if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {

          sum += (e.RentAmount)
        }
      });
      var sum1 = 0
      this.Employee.LstemployeeHouseRentDetails.forEach(e => {
        if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {
          sum1 += (e.ApprovedAmount)
        }
      });
      this.Lstdeduction_Exemption.push(
        {
          Id: UUID.UUID(),
          ProductId: this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductId,
          Name: this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductName,
          AmtInvested: sum,
          AmtApproved: sum1,
          Section: "Sec10",
          Remarks: this.Employee.LstemployeeHouseRentDetails[0].InputsRemarks,
          Status: "Pending",
          DocumentId: this.Employee.LstemployeeHouseRentDetails[0].DocumentId,
          AdditionalList: additinalLstForHRA,
          DocumentDetails: this.Employee.LstemployeeHouseRentDetails[0].LstEmployeeInvestmentDocuments

          // UIData : additinalLstForHRA[0].UIData,
        });
    }


    this.Employee.LstemployeeInvestmentDeductions.forEach(e => {
      if (this.collection.find(z => z.ProductId === e.ProductID).ProductName.toUpperCase() != 'PF') {
        if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {
          var areaOfBinding = this.collection.find(z => z.ProductId === e.ProductID).b[0].TaxCodeTypeId === TaxCodeType.Deductions;
          if (areaOfBinding == true) {
            var additionalList = [];
            e.LstEmpInvDepDetails.forEach(child => {
              additionalList.push({
                AgeofDependent: null,
                Amount: child.Amount,
                DOB: new Date(child.DependentDateOfBirth),
                DependentTypes: child.DependentType,
                DisabilityPercentage: child.DisabilityPercentage,
                Id: child.Id,
                NameofDependent: child.DependentName,
                relationship: child.Relationship,
                EmpInvestmentDeductionId: child.EmpInvestmentDeductionId,
                EmployeeId: child.EmployeeId,
                DocumentId: child.DocumentId
              });

            });
            this.Lstdeduction_Exemption.push(
              {
                Id: e.Id,
                ProductId: this.collection.find(z => z.ProductId === e.ProductID).ProductId,
                Name: this.collection.find(z => z.ProductId === e.ProductID).ProductName,
                AmtInvested: e.Amount,
                AmtApproved: e.ApprovedAmount,
                Section: this.collection.find(z => z.ProductId === e.ProductID).b[0].Code,
                Remarks: e.InputsRemarks,
                Status: "Pending",
                DocumentId: e.DocumentId,
                AdditionalList: additionalList,
                DocumentDetails: e.LstEmployeeInvestmentDocuments
              })

          } else {

            this.Lstinvestment.push(
              {
                Id: e.Id,
                ProductId: this.collection.find(z => z.ProductId === e.ProductID).ProductId,
                Name: this.collection.find(z => z.ProductId === e.ProductID).ProductName,
                AmtInvested: e.Amount,
                AmtApproved: e.ApprovedAmount,
                Section: this.collection.find(z => z.ProductId === e.ProductID).b[0].Code,
                Remarks: e.InputsRemarks,
                Status: "Pending",
                DocumentId: e.DocumentId,
                DocumentDetails: e.LstEmployeeInvestmentDocuments
              });


          }
        }
      }
    });
    var _storItems = [];
    _storItems = JSON.parse(sessionStorage.getItem('_StoreLstinvestment'));
    console.log('_storItems', _storItems);

    if (_storItems != null && _storItems != undefined && _storItems.length > 0) {
      this.Lstinvestment = this.Lstinvestment.concat(_storItems);
      // sessionStorage.removeItem('_StoreLstinvestment');
    }

    var _storItems1 = [];
    _storItems1 = JSON.parse(sessionStorage.getItem('_StoreLstDeductions'));
    console.log('_storItems1', _storItems1);

    if (_storItems1 != null && _storItems1 != undefined && _storItems1.length > 0) {
      this.Lstdeduction_Exemption = this.Lstdeduction_Exemption.concat(_storItems1);
      // sessionStorage.removeItem('_StoreLstDeductions');
    }
    // //this.dynamicExeptions = [];
    // this.Employee.LstEmployeeTaxExemptionDetails != null && this.Employee.LstEmployeeTaxExemptionDetails.length > 0 && this.Employee.LstEmployeeTaxExemptionDetails.forEach(e => {
    //   this.dynamicExeptions.push(e)
    // });
    // for (let obj of this.dynamicExeptions) {
    //   let eObj = this.TaxationOtherCategory_Exemption.find(e => e.ProductId == obj.ProductId)
    //   if (eObj && eObj.ProductCode != null) {
    //     obj['ProductName'] = eObj.ProductName
    //   }
    // }

    this.Employee.LstEmployeeHousePropertyDetails.forEach(e => {
      if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {

        this.Lstdeduction_Exemption.push(
          {
            AdditionalDetailsObject: {
              AnnualRent: e.GrossAnnualValue,
              Id: e.Id,
              InstallmentNumber: e.InstallmentNumber,
              InterestPaid: e.InterestAmount,
              LoanAvailedDate: e.LoanDate,
              MunicipalTaxesPaid: e.MunicipalTax,
              NameOfLender: e.NameOfLender,
              PANofLender: e.LenderPANNO,
              Pre_ConstructionInterest: e.PreConstructionInterestAmount,
              PrincipalAmount: e.PrincipalAmount,
              PropertyPossessionDate: e.PossessionDate,
              addressOfLender: e.AddressOfLender,
              addressOfProperty: e.AddressDetails,
              isFirstTime: e.FirstTimeHomeOwner,
              occupanyType: e.LetOut == true ? "rentedOut" : "selfOccupied",
              ownership: e.OwnershipPercentage,
              DocumentId: e.DocumentId,
              GrossAnnualValueApprovedAmount: e.GrossAnnualValueApprovedAmount,
              InterestAmountApprovedAmount: e.InterestAmountApprovedAmount,
              MunicipalTaxApprovedAmount: e.MunicipalTaxApprovedAmount,
              PreConstructionInterestApprovedAmount: e.PreConstructionInterestApprovedAmount

            },
            AmtApproved: e.LetOut == true ? e.GrossAnnualValueApprovedAmount : e.InterestAmountApprovedAmount,
            AmtInvested: e.LetOut == true ? e.GrossAnnualValue : e.InterestAmount,
            DocumentId: 0,
            Id: e.Id,
            Name: this.collection.find(z => z.ProductId === -100).ProductName,
            ProductId: -100,
            Remarks: e.InputsRemarks,
            Section: "Sec24",
            Status: "Pending",
            DocumentDetails: e.LstEmployeeInvestmentDocuments

          });
      }
    });

    let empRateSets = [];
    this.popupTaxBills = [];
    empRateSets = this.employeedetails['EmployeeRatesets'][0].RatesetProducts

    console.log('RATESET ::', empRateSets);

    console.log('EXEM PROD ::', this.TaxationOtherCategory_Exemption);

    empRateSets != null && empRateSets.length > 0 && this.TaxationOtherCategory_Exemption != null && empRateSets.forEach(element => {
      var category = this.TaxationOtherCategory_Exemption.find(a => a.ProductCode.toUpperCase() == element.ProductCode.toUpperCase());
      console.log('category', category);

      if (category != undefined && category.ProductCode.toUpperCase() != 'HRA' && element.Value > 0) {
        this.popupTaxBills.push(category)
      }
    });


    this.Employee.LstEmployeeTaxExemptionDetails != null && this.Employee.LstEmployeeTaxExemptionDetails.length > 0 && this.Employee.LstEmployeeTaxExemptionDetails.forEach(e => {

      if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {
        this.dynamicExeptions.push(e)
      }
    });
    for (let obj of this.dynamicExeptions) {
      let eObj = this.TaxationOtherCategory_Exemption.find(e => e.ProductId == obj.ProductId)
      if (eObj && eObj.ProductCode != null) {
        obj['ProductName'] = eObj.ProductName
      }
    }

  }
  ViewRateset(item) {
    if (item.EmployeeRatesets == null || item.EmployeeRatesets.length === 0) {
      this.alertService.showInfo("There is no rateset involved in this transaction!");
      return;
    }

    this.Current_RateSetList = null;
    const isLatestELC = item.EmployeeRatesets;

    this.Current_RateSetList = isLatestELC[0].RatesetProducts;
    this.EffectiveDate_POP = isLatestELC[0].EffectiveDate as Date;
    this.AnnualSalary_POP = isLatestELC[0].AnnualSalary;

    if (this.Current_RateSetList == null || this.Current_RateSetList.length == 0) {
      this.alertService.showWarning(">. There seems to be no data available to show");
      return;
    }
    // $('#popup_lifeCycle').modal('hide');
    this.visible1 = true;
  }

  close1() {
    // $('#popup_lifeCycle').modal('show');
    this.visible1 = false;

  }
  addPreviousEmployment() {
    this.employeeForm.controls['previousemploymentId'].reset();
    this.employeeForm.controls['companyName'].reset();
    this.employeeForm.controls['startdate'].reset();
    this.employeeForm.controls['enddate'].reset();
    this.employeeForm.controls['grossSalary'].reset();
    this.employeeForm.controls['previousPT'].reset();
    this.employeeForm.controls['previousPF'].reset();
    this.employeeForm.controls['taxDeducted'].reset();
    this.employeeForm.controls['prevEmpIsProposedMode'].reset();
    this.employeeForm.controls['prevEmpfinancialYear'].reset();

    this.isESSLogin && this.employeeForm.enable();
    this.employeeForm.controls['employeecode'].disable();
    this.previousemployment_slidervisible = true;

  }
  editPreviousEmployment(item) {

    this.employeeForm.controls['previousemploymentId'].setValue(item.Id);
    this.employeeForm.controls['companyName'].setValue(item.CompanyName);
    this.employeeForm.controls['startdate'].setValue(new Date(item.StartDate));
    this.employeeForm.controls['enddate'].setValue(new Date(item.EndDate));
    this.employeeForm.controls['grossSalary'].setValue(item.GrossSalary);
    this.employeeForm.controls['previousPT'].setValue(item.PreviousPT);
    this.employeeForm.controls['previousPF'].setValue(item.PreviousPF);
    this.employeeForm.controls['taxDeducted'].setValue(item.TaxDeducted);
    this.employeeForm.controls['employeecode'].disable();
    this.employeeForm.controls['prevEmpIsProposedMode'].setValue(item.IsProposed);
    this.employeeForm.controls['prevEmpfinancialYear'].setValue(item.FinancialYearId);


    this.previousemployment_slidervisible = true;
  }
  updatePreviousEmplyment() {
    this.submitted = true;

    if (this.employeeForm.get('prevEmpfinancialYear').value == null || this.employeeForm.get('prevEmpfinancialYear').value == undefined) {
      this.employeeForm.controls['prevEmpfinancialYear'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('companyName').value == null || this.employeeForm.get('companyName').value == '' || this.employeeForm.get('companyName').value == undefined) {
      this.employeeForm.controls['companyName'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('startdate').value == null || this.employeeForm.get('startdate').value == undefined) {
      this.employeeForm.controls['startdate'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('enddate').value == null || this.employeeForm.get('enddate').value == undefined) {
      this.employeeForm.controls['enddate'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('grossSalary').value == null || this.employeeForm.get('grossSalary').value == undefined) {
      this.employeeForm.controls['grossSalary'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('previousPT').value == null || this.employeeForm.get('previousPT').value == undefined) {
      this.employeeForm.controls['previousPT'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('previousPF').value == null || this.employeeForm.get('previousPF').value == undefined) {
      this.employeeForm.controls['previousPF'].setErrors({ 'incorrect': true });

    }



    else if ((this.employeeForm.get('taxDeducted').value == null)) {
      this.employeeForm.controls['taxDeducted'].setErrors({ 'incorrect': true });
    }
    else {
      var mode: boolean = this.TaxDeclaration == 1 ? false : true;

      var foundIndex = this.employeedetails.LstemploymentDetails.find(z => z.Id == (this.employeeForm.get('previousemploymentId').value));
      if (foundIndex != undefined && foundIndex != null) {
        foundIndex.FinancialYearId = this.employeeForm.get('prevEmpfinancialYear').value;
        foundIndex.CompanyName = (this.employeeForm.get('companyName').value);
        foundIndex.StartDate = (this.employeeForm.get('startdate').value);
        foundIndex.EndDate = (this.employeeForm.get('enddate').value);
        foundIndex.GrossSalary = (this.employeeForm.get('grossSalary').value) || 0;
        foundIndex.PreviousPT = (this.employeeForm.get('previousPT').value) || 0;
        foundIndex.PreviousPF = (this.employeeForm.get('previousPF').value) || 0;
        foundIndex.TaxDeducted = (this.employeeForm.get('taxDeducted').value) || 0;
        foundIndex.IsProposed = (this.employeeForm.get('prevEmpIsProposedMode').value);
        foundIndex.Modetype = UIMode.Edit;
        foundIndex['FinancialYearName'] = this.FicalYearList.find(a => a.Id == this.employeeForm.get('prevEmpfinancialYear').value).code;
      } else {
        var employmentDetails = new EmploymentDetails();
        employmentDetails.Id = UUID.UUID() as any;
        employmentDetails.FinancialYearId = this.employeeForm.get('prevEmpfinancialYear').value;
        employmentDetails.CompanyName = (this.employeeForm.get('companyName').value);
        employmentDetails.StartDate = (this.employeeForm.get('startdate').value);
        employmentDetails.EndDate = (this.employeeForm.get('enddate').value);
        employmentDetails.GrossSalary = (this.employeeForm.get('grossSalary').value) || 0;
        employmentDetails.PreviousPT = (this.employeeForm.get('previousPT').value) || 0;
        employmentDetails.PreviousPF = (this.employeeForm.get('previousPF').value) || 0;
        employmentDetails.TaxDeducted = (this.employeeForm.get('taxDeducted').value) || 0;
        employmentDetails.IsProposed = mode == false ? true : false;
        employmentDetails['FinancialYearName'] = this.FicalYearList.find(a => a.Id == this.employeeForm.get('prevEmpfinancialYear').value).code;

        employmentDetails.Modetype = UIMode.Edit;
        this.employeedetails.LstemploymentDetails.push(employmentDetails);
      }

      this.LstemploymentDetails = this.employeedetails.LstemploymentDetails;
      this.employeeForm.controls['companyName'].reset();
      this.employeeForm.controls['startdate'].reset();
      this.employeeForm.controls['enddate'].reset();
      this.employeeForm.controls['grossSalary'].reset();
      this.employeeForm.controls['previousPT'].reset();
      this.employeeForm.controls['previousPF'].reset();
      this.employeeForm.controls['taxDeducted'].reset();
      this.employeeForm.controls['prevEmpfinancialYear'].reset();
      this.employeeForm.controls['prevEmpIsProposedMode'].reset();
      this.LstemploymentDetails != null && this.LstemploymentDetails.length > 0 ? this.LstemploymentDetails = _.orderBy(this.LstemploymentDetails, ['FinancialYearId', 'StartDate'],
        ['desc', 'asc']) : true;
      this.previousemployment_slidervisible = false;
      this.submitted = false;

    }
  }





  close_preEmploymentSlider() {
    this.previousemployment_slidervisible = false;
  }

  get_EmployeePaymentHistory() {
    this.pageLayout = {
      Description: "Any",
      Code: "Any",
      CompanyId: 1,
      ClientId: 2,
      SearchConfiguration: {
        SearchElementList: [
        ],
        SearchPanelType: SearchPanelType.Panel
      },
      GridConfiguration: {
        ColumnDefinitionList: [
        ],
        DataSource: {
          Type: DataSourceType.View,
          Name: 'Any'
        },
        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,
        IsSummaryRequired: true,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"],
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,
      },
      PageProperties: {
        PageTitle: "Any List",
        BannerText: "Any",
      }
    }
    this.pageLayout.GridConfiguration.DataSource = null;
    this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'GETPAYMENTHISTORY' }
    this.pageLayout.SearchConfiguration.SearchElementList.push(

      {
        "DisplayName": "@employeeId",
        "FieldName": "@employeeId",
        "InputControlType": 0,
        "Value": this.employeedetails.Id,
        "MultipleValues": null,
        "RelationalOperatorsRequired": false,
        "RelationalOperatorValue": null,
        "DataSource": {
          "Type": 0,
          "Name": null,
          "EntityType": 0,
          "IsCoreEntity": false
        },
        "IsIncludedInDefaultSearch": true,
        "DropDownList": [],
        "ForeignKeyColumnNameInDataset": null,
        "DisplayFieldInDataset": null,
        "ParentFields": null,
        "ReadOnly": false,
        "TriggerSearchOnChange": false
      });

    this.LstPaymentHistory = [];
    this.paginateData_PaymentHistory = [];
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        dataset = JSON.parse(dataset.dynamicObject);

        this.LstPaymentHistory = dataset;
        // this.LstPaymentHistory.forEach(element => {
        //   var last2 = element.PayPeriodName.slice(-2);
        //   element['YearOfPayment'] = `20${last2}`
        // });
        this.LstPaymentHistory = _.orderBy(this.LstPaymentHistory, ["PayTransactionId"], ["desc"]);
        this.paginateData_PaymentHistory = this.LstPaymentHistory;
        // .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
        // this.getPremiumData();
        this.onChangeProcessCategory({ id: 1 });
        this.onChangeYearOfPayment({ label: new Date().getFullYear() })
      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      console.log(error);
    })


  }

  // getPremiumData(){

  //   this.paginateData_PaymentHistory =  this.LstPaymentHistory
  //    .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);

  //  }

  yearrange_builder(earliestYear) {

    var year = new Date(environment.environment.YearRangeFromStaringYear).getFullYear();
    this.yearrangeList = [];

    let currentYear = new Date().getFullYear();
    // let earliestYear = 1970;

    while (currentYear >= earliestYear) {
      this.yearrangeList.push({
        label: currentYear,
        value: parseInt(String(currentYear))
      });
      currentYear -= 1;
    }



    // for (var i = 0; i < 7; i++) {
    //   this.yearrangeList.push({
    //     label: year + i,
    //     value: parseInt(String(year + i))
    //   });
    // }

  }

  onChangeProcessCategory(event: any) {
    var str1 = '20';
    var res = str1.concat(this.selectedyear);

    this.paginateData_PaymentHistory = [];
    this.paginateData_PaymentHistory = this.LstPaymentHistory.filter(x => x.ProcessCategoryId == event.id && (x.YearOfPayment) == this.selectedyear);
    // this.paginateData_PaymentHistory = this.paginateData_PaymentHistory
    //   .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    // this.collectionSize = this.paginateData_PaymentHistory.length;


  }
  onChangeYearOfPayment(event: any) {

    this.paginateData_PaymentHistory = [];
    this.paginateData_PaymentHistory = this.LstPaymentHistory.filter(x => x.ProcessCategoryId == this.selctedProcesscategoryId && (x.YearOfPayment) == event.label);
    // this.paginateData_PaymentHistory = this.paginateData_PaymentHistory
    //   .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    // this.collectionSize = this.paginateData_PaymentHistory.length;

  }


  downloadPaySlip(item) {
    this.loadingScreenService.startLoading();
    if (item.ObjectStorageId != 0) {
      this.fileuploadService.downloadObjectAsBlob(item.ObjectStorageId)
        .subscribe(res => {
          if (res == null || res == undefined) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
            return;
          }
          saveAs(res);
          this.loadingScreenService.stopLoading();
        });
    }
    else {
      this.employeeService.downloadPaySlip(item.PayTransactionId)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            this.commonService.openNewtab(apiResult.Result, `PaySlip_${this.employeedetails.FirstName}_${item.PayPeriodName}`);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, err => {

        });
    }
  }

  downloadAllPayslip() {
    this.loadingScreenService.startLoading();
    this.LstPaymentHistory.forEach(element => {

      this.employeeService.downloadPaySlip(element.PayTransactionId)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            this.commonService.openNewtab(apiResult.Result, `PaySlip_${this.employeedetails.FirstName}_${element.PayPeriodName}`);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, err => {

        });
    });
  }
  ngOnDestroy() {
  }

  enableEdit() {


    if (this.isInvestmentUnderQC && this.activenavtab == 'investmentInformation') {
      this.alertService.showWarning("Your Investment Proof verification is underway. Please wait until it is completed");
      return;
    }

    this.enableEditTxt == 'Cancel' ?
      (this.enableEditTxt = 'Edit', this.employeeForm.disable(),
        this.isLoading = false, this.ESS_Clear_ReupateRecord()) :
      (this.enableEditTxt = 'Cancel', this.employeeForm.enable(),
        this.employeeForm.controls['PANNO'].disable(),
        this.employeeForm.controls['adhaarnumber'].disable(),
        this.employeeForm.controls['financialYear'].disable(), this.isLoading = true);

    this.employeedetails.EmploymentContracts != null &&
      this.employeedetails.EmploymentContracts.length > 0 &&
      this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ?
      this.employeeForm.controls['IsNewTaxRegimeOpted'].disable() :
      this.employeeForm.controls['IsNewTaxRegimeOpted'].enable();

    // (this.activenavtab == 'profile' || this.activenavtab == 'bankInformation') && this.employeeForm.controls['dateOfBirth'].enable();
    if (this.officialEmailCannotEdit == this.RoleCode) {
      this.employeeForm.controls['officialEmail'].disable();
    }


    if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
      var isAadhaarExist = this.employeedetails.CandidateDocuments.find(lst => lst.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && lst.Status == ApprovalStatus.Approved);
      isAadhaarExist != undefined && (this.employeeForm.controls['adhaarnumber'].setValue(isAadhaarExist.DocumentNumber != null ? this._aadhaar_inputMask(isAadhaarExist.DocumentNumber) : null), this._OriginalAadhaarNumber = isAadhaarExist.DocumentNumber);
      isAadhaarExist != undefined ? (this.isAadhaarNotEditable = true) : this.isAadhaarNotEditable = null;
      isAadhaarExist != undefined ? this.employeeForm.controls['adhaarnumber'].disable() : this.employeeForm.controls['adhaarnumber'].enable()

      var isPANExist = this.employeedetails.CandidateDocuments.find(lst => lst.DocumentTypeId == environment.environment.PANDocumentTypeId && lst.Status == ApprovalStatus.Approved);
      isPANExist != undefined && this.employeeForm.controls['PANNO'].setValue(isPANExist.DocumentNumber);
      isPANExist != undefined ? (this.isPANNotEditable = true) : this.isPANNotEditable = null;
      isPANExist != undefined ? this.employeeForm.controls['PANNO'].disable() : this.employeeForm.controls['PANNO'].enable();
    }

    // if (this.isESSLogin) {

    //   var disableFields = ["employername",
    //     "employeecode",
    //     "clientname",
    //     "contractname",
    //     "employmentType",
    //     "teamname",
    //     "reportingmanager",
    //     "employementstartdate",
    //     "employementenddate",
    //     "Designation",
    //     "Department",
    //     "Location",
    //     "Country",
    //     "statename",
    //     "costcode",
    //     "LWD"];
    //   this.reactiveFormDisableEnable(disableFields, true);

    // }

  }

  reactiveFormDisableEnable(disableFields, controlMode) {
    for (let form = 0; form < disableFields.length; form++) {
      const element = disableFields[form];
      this.employeeForm.controls[element].disable();

    }

  }

  do_hideUnwantedCategories() {
    this.TaxationCategory = environment.environment.HousePropertyDetails_Static;
  }
  onChangeTaxRegime() {
    if (this.employeeForm.get('IsNewTaxRegimeOpted').value == true) {
      this.Lstinvestment = [];
      // this.Lstdeduction_Exemption = []
      this.Lstdeduction_Exemption = this.Lstdeduction_Exemption.filter(a => a.ProductId == -100);
      this.TaxationCategory_Investment = [];
      this.TaxationOtherCategory_Investment = [];
      this.TaxationCategory = [];
      this.TaxationOtherCategory = [];
      this.popupTaxBills = [];
      this.dynamicExeptions = [];
      this.TaxationCategory = environment.environment.HousePropertyDetails_Static;
    } else {
      this.trigger_investmentproducts_binding();
      this.load_preinsertedRecords();
    }

  }


  // FOR DOCUMENT UPLOAD, EDIT AND WORKFLOW

  onDocumentClick() {


    this.onboardingService.getDocumentList(this.employeedetails.EmploymentContracts[0].CandidateId, this.CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId)
      .subscribe(authorized => {

        let apiResult: apiResult = (authorized);
        try {
          this.DocumentList = JSON.parse(apiResult.Result);


          this.DocumentList.forEach(element => {

            element['DocumentId'] = null;
            element['CategoryType'] = null;
            element['FileName'] = null;
            // element['Id'] = 0;
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


          if (this.Id != 0) {

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
                  // element_new.Id = ele_edit.Id
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

  getCategoryValues(docTypeId,) {

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

    var objStorageJson = JSON.stringify({ IsCandidate: false, EmployeeId: this.employeedetails.EmploymentContracts[0].EmployeeId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId })
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
      ListDocumentList.CandidateId = this.Id != 0 ? this.employeedetails.EmploymentContracts[0].CandidateId : 0;
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


  /// ACADEMIC INFORMATION TAB AND SLIDER

  angularGridReady_Education(angularGrid: AngularGridInstance) {
    this.angularGrid_Education = angularGrid;
    this.gridObj_Education = angularGrid && angularGrid.slickGrid || {};
  }


  doAcademicSlickGrid() {

    this.columnDefinitions_Education = [

      { id: 'GraduationType', name: 'Graduation Type', field: 'GraduationType', sortable: true },
      { id: 'educationDegree', name: 'Education Degree', field: 'educationDegree', sortable: true },
      { id: 'yearOfPassing', name: 'Year of Passing', field: 'yearOfPassing', sortable: true },
      { id: 'scoringValue', name: 'Scoring Value', field: 'scoringValue', sortable: true },
      { id: 'DocumentStatus', name: 'Status', field: 'DocumentStatus', sortable: true, cssClass: `` },
      {
        id: 'edit',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e, args: OnEventArgs) => {
          this.addEducation(args.dataContext);
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
          this.removeSelectedRow(args.dataContext, "Education").then((result) => {
          });
          this.angularGrid_Education.gridService.deleteDataGridItemById(args.dataContext.Id);
          this.angularGrid_Education.gridService.highlightRow(args.row, 1500);
          this.angularGrid_Education.gridService.setSelectedRow(args.row);
        }
      },

    ];

    this.gridOptions_Education = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      enableColumnReorder: false,
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
      },
      asyncEditorLoading: false,
      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
    };

  }
  // EDUCATION INFORMAITON POPUP

  addEducation(json_edit_object) {
    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {
      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
    }
    const modalRef = this.modalService.open(AcademicModalComponent, this.modalOption);
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    var objStorageJson = JSON.stringify({ CandidateId: this.employeedetails.EmploymentContracts[0].CandidateId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.componentInstance.LstEducation = this.LstEducation;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {

        if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {


          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;


        }
        else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending // 
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

        result.isDocumentStatus = ApprovalStatus.Pending;
        result.DocumentStatus = "Pending";
        result.id = result.Id
        let isAlreadyExists = false;
        let graduationLst: any;

        graduationLst = this.utilsHelper.transform(GraduationType);
        result.GraduationType = graduationLst.find(a => a.id == result.graduationType).name;


        isAlreadyExists = _.find(this.LstEducation, (a) => a.Id != result.Id && a.graduationType == result.graduationType) != null ? true : false; // not working

        if (isAlreadyExists) {

          this.alertService.showWarning("The specified Education detail already exists");

        } else {

          let isSameResult = false;
          isSameResult = _.find(this.LstEducation, (a) => a.Id == result.Id) != null ? true : false;

          if (isSameResult) {

            this.angularGrid_Education.gridService.updateDataGridItemById(result.Id, result, true, true);

          } else {
            this.angularGrid_Education.gridService.addItemToDatagrid(result);
          }

        }
      }

    }).catch((error) => {
      console.log(error);
    });
  }


  ///  EXPERIENCE TAB AND WIDNOW POPUP

  angularGridReady_Experience(angularGrid: AngularGridInstance) {
    this.angularGrid_Experience = angularGrid;
    this.gridObj_Experience = angularGrid && angularGrid.slickGrid || {};
  }
  doExperienceSlickGrid() {

    this.columnDefinitions_Experience = [

      { id: 'companyName', name: 'Company Name', field: 'companyName', sortable: true },
      { id: 'title', name: 'Designation', field: 'title', sortable: true },
      { id: 'StartDate', name: 'Start date', field: 'StartDate', sortable: true },
      { id: 'EndDate', name: 'End date', field: 'EndDate', sortable: true },
      { id: 'workLocation', name: 'Work Location', field: 'workLocation' },
      { id: 'DocumentStatus', name: 'Status', field: 'DocumentStatus', sortable: true, cssClass: `` },
      {
        id: 'edit',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          console.log(args.dataContext);
          this.addExperience(args.dataContext);;
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
          console.log(args);
          this.removeSelectedRow(args.dataContext, "Experience").then((result) => {
          });
          this.angularGrid_Experience.gridService.deleteDataGridItemById(args.dataContext.Id);
          this.angularGrid_Experience.gridService.highlightRow(args.row, 1500);
          this.angularGrid_Experience.gridService.setSelectedRow(args.row);
        }
      },

    ];

    this.gridOptions_Experience = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      enableColumnReorder: false,
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
      },
      asyncEditorLoading: false,
      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
    };
  }

  addExperience(json_edit_object) {

    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {
      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
    }
    const modalRef = this.modalService.open(WorkexperienceModalComponent, this.modalOption);

    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    modalRef.componentInstance.LstExperience = this.LstExperience;
    var objStorageJson = JSON.stringify({ IsCandidate: false, EmployeeId: this.employeedetails.EmploymentContracts[0].EmployeeId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;

    modalRef.result.then((result) => {

      if (result != "Modal Closed") {

        result.StartDate = this.datePipe.transform(result.startdate, "dd-MM-yyyy");
        result.EndDate = this.datePipe.transform(result.enddate, "dd-MM-yyyy");

        if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;

        }

        else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {
          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending // 
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
        result.isDocumentStatus = ApprovalStatus.Pending;
        result.DocumentStatus = "Pending";
        result.id = result.Id
        let isAlreadyExists = false;
        let isSameResult = false;
        isSameResult = _.find(this.LstExperience, (a) => a.Id == result.Id) != null ? true : false;
        if (isSameResult) {
          this.angularGrid_Experience.gridService.updateDataGridItemById(result.Id, result, true, true);
        } else {
          this.angularGrid_Experience.gridService.addItemToDatagrid(result);
        }
      }
    }).catch((error) => {
      console.log(error);
    });
  }


  triggerWorkFlowProcess(newObject: any) {
    if (newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit) != undefined) {

      let _editItem = newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit);
      if (_editItem.VerificationMode == 1) {
        this.callbankWorkflow(newObject);
      } else if (this.BusinessType == 3 && _editItem.VerificationMode == 2 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried) {
        this.callbankWorkflow(newObject);
      }
      else {

      }


    }
  }

  callbankWorkflow(newObject) {
    let entityId = newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit).Id;
    var accessControl_submit = {
      AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
        : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
      ViewValue: null
    };
    var workFlowInitiation = new WorkFlowInitiation()
    workFlowInitiation.Remarks = "";
    workFlowInitiation.EntityId = entityId; // newObject.Id;
    workFlowInitiation.EntityType = EntityType.EmployeeBankDetails;
    workFlowInitiation.CompanyId = this.CompanyId;
    workFlowInitiation.ClientContractId = newObject.EmploymentContracts[0].ClientContractId;
    workFlowInitiation.ClientId = newObject.EmploymentContracts[0].ClientId;
    workFlowInitiation.ActionProcessingStatus = 25000; // BankDetailsRequestSubmitted
    workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
    workFlowInitiation.WorkFlowAction = 20;
    workFlowInitiation.RoleId = this.RoleId;
    workFlowInitiation.DependentObject = (newObject);
    workFlowInitiation.UserInterfaceControlLst = accessControl_submit;

    this.employeeService.post_BankDetailsWorkFlow(JSON.stringify(workFlowInitiation)).subscribe((response) => {


      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {

          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(`Your employee has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');

        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');

        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to submission}!` + error);

      }


    }), ((error) => {

    });

  }

  getStatusCount(list, status) {
    // console.log('list', list);

    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;

  }

  getStatusCount1(list, status) {

    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;

  }

  triggerInvestmentWorkFlowProcess(newObject: any) {
    this.loadingScreenService.startLoading();

    var accessControl_submit = {
      AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
        : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
      ViewValue: null
    };

    var workFlowInitiation = new WorkFlowInitiation()
    workFlowInitiation.Remarks = "";
    workFlowInitiation.EntityId = newObject.EmployeeInvestmentMaster.Id;
    workFlowInitiation.EntityType = EntityType.Employee;
    workFlowInitiation.CompanyId = this.CompanyId;
    workFlowInitiation.ClientContractId = newObject.EmploymentContracts[0].ClientContractId;
    workFlowInitiation.ClientId = newObject.EmploymentContracts[0].ClientId;
    workFlowInitiation.ActionProcessingStatus = 29000; // BankDetailsRequestSubmitted
    workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
    workFlowInitiation.WorkFlowAction = 28;
    workFlowInitiation.RoleId = this.RoleId;
    workFlowInitiation.DependentObject = (newObject);
    workFlowInitiation.UserInterfaceControlLst = accessControl_submit;

    this.employeeService.post_InvestmentWorkFlow(JSON.stringify(workFlowInitiation)).subscribe((response) => {
      try {
        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
          this.isESSLogin == false ? this.router.navigate(['/app/listing/ui/employeelist']) : this.ESS_Clear_ReupateRecord();
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(`Your employee has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');
          this.isESSLogin == false ? this.router.navigate(['/app/listing/ui/employeelist']) : this.ESS_Clear_ReupateRecord();
        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to submission}!` + error);
        this.isESSLogin == false ? this.router.navigate(['/app/listing/ui/employeelist']) : this.ESS_Clear_ReupateRecord();
      }


    }), ((error) => {

    });
  }

  document_file_view1(item, whichdocs) {

    $("#popup_viewDocs").modal('show');
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

  document_file_view(item, whichdocs) {

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


  getDynamicFieldDetailsConfig(_companyId, _clientId, _clientContractId) {
    var promise = new Promise((resolve, reject) => {
      this.should_spin_onboarding = true;
      this.onboardingService.getDynamicFieldDetails(_companyId, _clientId, _clientContractId, null)
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

  onChangeAadhaarNumber(event) {
    if (this.icontoggle) {
      this._OriginalAadhaarNumber = this._aadhaar_removeinputMask(event.target.value)
    } else {
      this._OriginalAadhaarNumber = event.target.value;

    }
  }
  onChangePanNo(event) {
    this._OrginalPanNo = event.target.value.toUpperCase();
  }

  // _pan_inputMask(inputstring) {
  //   this.employeeForm.controls['PANNO'].disable();
  //   let reg = /.{1,7}/
  //   let string = (inputstring).toString();
  //   let maskedPanNo = string.replace(reg, (m) => "X".repeat(m.length));
  //   return maskedPanNo;
  // }

  // _pan_removeinputMask(panNo) {
  //   this.employeeForm.controls['PANNO'].disable();


  //   return panNo;
  // }
  _aadhaar_inputMask(inputstring) {
    this.employeeForm.controls['adhaarnumber'].disable();
    let reg = /.{1,7}/
    let string = (inputstring).toString();
    let maskedAadhaarNumber = string.replace(reg, (m) => "X".repeat(m.length));
    return maskedAadhaarNumber;
  }

  _aadhaar_removeinputMask(_OriginalAadhaarNumber) {

    this.employeeForm.controls['adhaarnumber'].enable();
    return _OriginalAadhaarNumber;
  }

  icontogglechange() {
    this.icontoggle = !this.icontoggle;
    if (this.icontoggle) {
      this.employeeForm.controls['adhaarnumber'].setValue(this._aadhaar_inputMask(this._OriginalAadhaarNumber));
    } else {
      this.employeeForm.controls['adhaarnumber'].setValue(this._aadhaar_removeinputMask(this._OriginalAadhaarNumber));
    }
  }
  // icontogglechangePan() {
  //   this.icontogglepan = !this.icontogglepan;
  //   if (this.icontogglepan) {
  //     this.employeeForm.controls['PANNO'].setValue(this._pan_inputMask(this._OrginalPanNo));
  //   }
  //   else {
  //     this.employeeForm.controls['PANNO'].setValue(this._pan_removeinputMask(this._OrginalPanNo));
  //   }

  // }

  //#region Employee Deduction

  openDediuctionSlider() {
    if (this.isActiveEmployee == 0 || this.employeedetails.EmploymentContracts[0].Status == 0) {
      return this.alertService.showWarning('Cannot add deduction since the employee status is IN-ACTIVE');
    }
    if (this.emplolyeeDeduction != null) {
      this.emplolyeeDeduction = null
    }
    this.openEmployeeDeductionSlider("Add Deduction", this.emplolyeeDeduction);
  }


  close_deduction() {
    this.isESSLogin && this.employeeForm.disable();
    this.deduction_sliderVisible = false;
  }

  getAllEmployeeDeductionManagementbyEmployeeId(employeeId) {
    this.spinner = true;
    this.employeeService.getAllEmployeeDeductionManagementbyEmployeeId(employeeId).subscribe((result) => {
      //debugger;
      let apiresult: apiResult = result;
     
     if (apiresult.Status && apiresult.Result) {
      let deductionList = JSON.parse(JSON.stringify(apiresult.Result)) as Array<EmployeeDeductions>;
      this.LstDeductions = new Array<EmployeeDeductions>();
      deductionList.forEach(element => {
        let empDed = element;
        const deductionArr = element.EmployeeDednScheduleDetails;
        empDed.EmployeeSuspndDeductions.forEach(obj1 => {
          deductionArr.forEach(obj2 => {
            if (obj1.EmployeeDeductionManagementId == obj2.EmployeeDeductionManagementId && obj1.PayPeriodId == obj2.DeductionPeriodId) {
              obj2['IsSuspended'] = true;
            }
            else {
              obj2['IsSuspended'] = false;
            }
          })
        });
        const IsDeducted = obj => obj.IsDeducted === true;
        const IsSuspended = obj => obj.IsSuspended === true;
        empDed.PaymentTypeName = this.paymentSourceTypeList.find(p => p.Id == element.PaymentType) ? this.paymentSourceTypeList.find(p => p.Id == element.PaymentType).Name : null;
        empDed.DeductionTypeName = this.deductionTypeList.find(p => p.Id == element.DeductionType) ? this.deductionTypeList.find(p => p.Id == element.DeductionType).Name : null;
        empDed.EndStatusName = this.endStatusList.find(p => p.Id == element.EndStatus) ? this.endStatusList.find(p => p.Id == element.EndStatus).Name : null;
        empDed.PayperiodName = this.payperiodList.find(p => p.Id == element.PayPeriodId) ? this.payperiodList.find(p => p.Id == element.PayPeriodId).PayCyclePeriodName : null;
        empDed.DeductionProductName = this.productList.find(p => p.Id == element.DeductionProductId) ? this.productList.find(p => p.Id == element.DeductionProductId).Name : null;
        empDed['Select_Val'] = false;
        empDed.PaymentDate = moment(empDed.PaymentDate).format('YYYY-MM-DD');
        empDed.SuspensionTypeId = empDed.SuspensionType;
        empDed.checkIsAllDeducted = deductionArr.every(IsDeducted);
        empDed.checkIsAllSuspended = deductionArr.every(IsSuspended);
        
        this.enableAddDeductionBtn = this.isActiveEmployee == 0 || !empDed.checkIsAllDeducted || !this.timeCardStatus.Status  ? false : true;
        
        this.LstDeductions.push(empDed);
        
        this.spinner = false;
      });
     } else {
      this.spinner = false;
      this.LstDeductions = undefined;
      if (this.isActiveEmployee != 0 && (this.LstDeductions == null || this.LstDeductions == undefined)) {
        this.enableAddDeductionBtn = this.timeCardStatus.Status;
      }
     }
      this.spinner = false;
      console.log('Deductions Grid', this.LstDeductions);
    });
  }

  getDeductionControlList() {
    this.spinner = true;
    this.paymentSourceTypeList = Object.keys(this.paymentSourceType)
      .map((key) => ({ Id: parseInt(key), Name: this.paymentSourceType[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.deductionTypeList = Object.keys(this.deductionSourceType)
      .map((key) => ({
        Id: parseInt(key),
        Name: this.deductionSourceType[key],
      }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.deductionStatusList = Object.keys(this.deductionStatus)
      .map((key) => ({ Id: parseInt(key), Name: this.deductionStatus[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.suspensionTypeList = Object.keys(this.suspensionType)
      .map((key) => ({ Id: parseInt(key), Name: this.suspensionType[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.endStatusList = Object.keys(this.endStatus)
      .map((key) => ({ Id: parseInt(key), Name: this.endStatus[key] }))
      .filter((f) => !isNaN(Number(f.Id)));
    this.employeeService.LoadEmployeeDeductionManagementLookupDetails(this.Id).subscribe((result) => {
        let apiresult: apiResult = result;
        let lookUpDetails = JSON.parse(apiresult.Result);
        this.productList = lookUpDetails.EarningProducts;
        this.payperiodList = lookUpDetails.PayperiodList;
        this.spinner = false;
        this.getAllEmployeeDeductionManagementbyEmployeeId(this.Id);
        console.log('calling slick grid for deduction');
        this.doDeductionSlickGrid();
      });
  }

  angularGridReady_Deduction(angularGrid: AngularGridInstance) {
    this.angularGrid_Deduction = angularGrid;
    this.gridOptions_Deduction = angularGrid && angularGrid.slickGrid || {};
  }


  doDeductionSlickGrid() {
    this.columnDefinitions_Deduc = [{
      id: "PaymentDate",
      name: "Payment Date",
      field: "PaymentDate",
      formatter: Formatters.dateIso,
      type: FieldType.date,
      sortable: true,
    },
    {
      id: "TotalDeductionAmount",
      name: "Total Deduction Amount",
      field: "TotalDeductionAmount",
      sortable: true
    },
    {
      id: "DeductionProduct",
      name: "Deduction Product",
      field: "PaymentTypeName",
      sortable: true,
    },
    {
      id: "DeductionSchedule",
      name: "Deduction Schedule",
      field: "DeductionTypeName",
      sortable: true,
    },
    {
      id: "DeductionType",
      name: "Deduction Type",
      field: "EndStatusName",
      sortable: true,
    },
    {
      id: "PayPeriod",
      name: "PayPeriod",
      field: "PayperiodName",
      sortable: true,
    },
    {
      id: "edit",
      field: "id",
      excludeFromHeaderMenu: true,
      formatter: Formatters.editIcon,
      minWidth: 30,
      maxWidth: 30,
      onCellClick: (e, args: OnEventArgs) => {
        this.emplolyeeDeduction = args.dataContext;
        // isActiveEmployee == 0
        if (this.isActiveEmployee == 0 || this.employeedetails.EmploymentContracts[0].Status == 0) {
          return this.alertService.showWarning('NOTE: the employee status is IN-ACTIVE');
        } else if (this.emplolyeeDeduction.checkIsAllSuspended || !this.timeCardStatus.Status) {
          const message = this.emplolyeeDeduction.checkIsAllSuspended ? 'record is already suspended' : this.timeCardStatus.Message;
          return this.alertService.showWarning('Cannot edit the record because ' + message);
        } else {
          this.openEmployeeDeductionSlider("Update Deduction", this.emplolyeeDeduction);
        }
      },
    },
    {
      id: "delete",
      field: "id",
      excludeFromHeaderMenu: true,
      formatter: Formatters.deleteIcon,
      minWidth: 30,
      maxWidth: 30,
      onCellClick: (e, args: OnEventArgs) => {
        const deductionArr = args.dataContext.EmployeeDednScheduleDetails;
        const IsDeducted = obj => obj.IsDeducted === true;
        const checkIsDeducted = deductionArr.some(IsDeducted);
        if (this.isActiveEmployee == 0 || this.employeedetails.EmploymentContracts[0].Status == 0) {
          return this.alertService.showWarning('NOTE: the employee status is IN-ACTIVE');
        } else if (checkIsDeducted || !this.timeCardStatus.Status) {
          const message = checkIsDeducted ? 'amount is already deducted !' : this.timeCardStatus.Message;
          this.alertService.showWarning('Cannot delete the record because ' + message);
          return;
        } else {
          this.deletedeductionSlider(args.dataContext);
        }
      },
    }
    ];

    this.gridOptions_Deduction = {
      enableAutoResize: true, // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      // enableFiltering: true,
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false,
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: "demo-container",
        sidePadding: 15,
      },
      asyncEditorLoading: false,

      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };
    this.gridOptions_Deduction.enablePagination = true;
    this.gridOptions_Deduction.pagination = this.pagination_Deduction;
  }

  onGridCellClicked(e, args) {
    console.log('&&&&', e , args)
  }
  deletedeductionSlider(obj) {
    var anyRecordDeducted = false;
    for (var i in obj.EmployeeDednScheduleDetails) {
      if (obj.EmployeeDednScheduleDetails[i].IsDeducted == true) {
        anyRecordDeducted = true;
        break;
      }
    }
    if (anyRecordDeducted) {
      this.alertService.confirmSwal(
        "Records are partially suspended. Are you sure you would like to remove the remaining records?",
        "After deleting this item, you will not be in a position to get this!",
        "Yes, Delete"
      ).then((result) => {
          if (this.isGuid(obj.Id) == false) {
            this.employeeDeductionModel.OldDetails = obj;
            this.employeeDeductionModel.NewDetails = obj;
            //if (employeeDedForm.valid && this.lstEmployeeScheduleDetails.length > 0) {
            this.employeeDeductionModel.OldDetails.EmployeeDednScheduleDetails.forEach(ele => {
              delete ele['Select_Val'];
              this.employeeDeductionModel.NewDetails.Modetype = UIMode.Delete;
              this.employeeDeductionModel.OldDetails.Modetype = UIMode.Delete;
              var parms = {
                employeeDeductionManagementId: ele.EmployeeDeductionManagementId,
                employeeDeductionScheduleDetailsId: ele.Id,
                employeeId: ele.EmployeeId,
                payPeriodId: ele.DeductionPeriodId,
                isSuspended: true,
                suspensionType: 1,
                suspensionToPeriodId: ele.DeductionPeriodId,//this.employeeDeductionModel.NewDetails.SuspensionToPeriodId,
                SuspensionFromPeriodId: ele.DeductionPeriodId,
                status: DeductionPayItemStatus.Suspended,
                modetype: UIMode.Delete
              };
            });
            this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach(ele => {
              delete ele['Select_Val'];
              //ele.Modetype = UIMode.Edit;
              if (ele.IsDeducted != true) {
                var parms = {
                  employeeDeductionManagementId: ele.EmployeeDeductionManagementId,
                  employeeDeductionScheduleDetailsId: ele.Id,
                  employeeId: ele.EmployeeId,
                  payPeriodId: ele.DeductionPeriodId,
                  isSuspended: true,
                  suspensionType: 1,
                  suspensionToPeriodId: ele.DeductionPeriodId,//this.employeeDeductionModel.NewDetails.SuspensionToPeriodId,
                  SuspensionFromPeriodId: ele.DeductionPeriodId,
                  status: DeductionPayItemStatus.Suspended,
                  modetype: UIMode.Delete
                };
                this.employeeDeductionModel.NewDetails.EmployeeSuspndDeductions.push(parms);
              }
            })
            console.log('Delete deducted Record', this.employeeDeductionModel);
          }
          this.spinner = true;
          this.loadingScreenService.startLoading();
          this.employeeService.Delete_EmployeeDeductionManagementById(obj.Id).subscribe((result) => {
            const rep = result as apiResult;
            if (rep.Status) {
              // to enable 'add deduction' button
              this.enableAddDeductionBtn = true;
              // api call to check timecard status
              this.payrollService.getValidateTimeCardToProcess(this.Id).subscribe((result) => {
                let apiresult: apiResult = result;
                this.spinner = false;
                console.log('checkIsValidTimeCard',  apiresult);
                if (apiresult.Status && apiresult.Result !== null) {
                  // alert to process salary
                  this.alertService.showSuccess("You have successfully Deleted the Employee deduction!");
                  this.loadingScreenService.stopLoading();
                  this.alertService.confirmSwal("Would you like to process salary ?", "", "Yes").then((res) => {
                    this.payrollService.postProcessTimeCard(apiresult.Result).subscribe((timeCard) => console.log('postProcessTimeCard',timeCard));
                  });
                }
              }, err => {
                this.loadingScreenService.stopLoading();
                this.spinner = false;
                console.error('getValidateTimeCardToProcess' , err);
              });
              this.doDeductionSlickGrid();
              this.getAllEmployeeDeductionManagementbyEmployeeId(this.employeedetails.Id);
            } else {
              this.spinner = false;
              this.alertService.showWarning(rep.Message);
            }
          });
        }).catch((error) => { });
    } else {
      this.alertService.confirmSwal(
        "Are you sure you would like to remove the record?",
        "After deleting this item, you will not be in a position to get this!",
        "Yes, Delete"
      ).then((result) => {
          if (this.isGuid(obj.Id) == false) {
            this.employeeDeductionModel.OldDetails = obj;
            this.employeeDeductionModel.NewDetails = obj;
            //if (employeeDedForm.valid && this.lstEmployeeScheduleDetails.length > 0) {
            this.employeeDeductionModel.OldDetails.EmployeeDednScheduleDetails.forEach(ele => {
              delete ele['Select_Val'];
              this.employeeDeductionModel.NewDetails.Modetype = UIMode.Delete;
              this.employeeDeductionModel.OldDetails.Modetype = UIMode.Delete;
              var parms = {
                employeeDeductionManagementId: ele.EmployeeDeductionManagementId,
                employeeDeductionScheduleDetailsId: ele.Id,
                employeeId: ele.EmployeeId,
                payPeriodId: ele.DeductionPeriodId,
                isSuspended: true,
                suspensionType: 1,
                suspensionToPeriodId: ele.DeductionPeriodId,//this.employeeDeductionModel.NewDetails.SuspensionToPeriodId,
                SuspensionFromPeriodId: ele.DeductionPeriodId,
                status: DeductionPayItemStatus.Suspended,
                modetype: UIMode.Delete
              };
            });
            this.employeeDeductionModel.NewDetails.EmployeeDednScheduleDetails.forEach(ele => {
              delete ele['Select_Val'];
              //ele.Modetype = UIMode.Edit;
              //if (ele.DeductionPeriodId >= this.SusStartPeriodId && ele.DeductionPeriodId <= this.SusEndPayPeriodId) {
              var parms = {
                employeeDeductionManagementId: ele.EmployeeDeductionManagementId,
                employeeDeductionScheduleDetailsId: ele.Id,
                employeeId: ele.EmployeeId,
                payPeriodId: ele.DeductionPeriodId,
                isSuspended: true,
                suspensionType: 1,
                suspensionToPeriodId: ele.DeductionPeriodId,//this.employeeDeductionModel.NewDetails.SuspensionToPeriodId,
                SuspensionFromPeriodId: ele.DeductionPeriodId,
                status: DeductionPayItemStatus.Suspended,
                modetype: UIMode.Delete
              };
              this.employeeDeductionModel.NewDetails.EmployeeSuspndDeductions.push(parms);
            })
            //}
            console.log('Delete deducted Record', this.employeeDeductionModel);
          }
          this.spinner = true;
          this.loadingScreenService.startLoading();
          this.employeeService.Delete_EmployeeDeductionManagementById(obj.Id).subscribe((result) => {
            const rep = result as apiResult;
            if (rep.Status) {
              // to enable 'add deduction' button
              this.enableAddDeductionBtn = true;
              this.spinner = false;
              this.angularGrid_Deduction.gridService.deleteDataGridItemById(obj.Id);
              // this.angularGrid_Deduction.dataView.doRefresh();
              // alert to process salary
              this.payrollService.getValidateTimeCardToProcess(this.Id).subscribe((result) => {
                let apiresult: apiResult = result;
                console.log('checkIsValidTimeCard',  apiresult);
                this.spinner = false;
                if (apiresult.Status && apiresult.Result) {
                  this.alertService.showSuccess("You have successfully Deleted the Employee deduction!");
                  this.loadingScreenService.stopLoading();
                  // alert to process salary
                  this.alertService.confirmSwal("Would you like to process salary ?", "", "Yes").then((res) => {
                    this.payrollService.postProcessTimeCard(apiresult.Result).subscribe((timeCard) => console.log('postProcessTimeCard',timeCard));
                  });
                  this.doDeductionSlickGrid();
                  this.getAllEmployeeDeductionManagementbyEmployeeId(this.employeedetails.Id);
                }
              }, err => {
                this.loadingScreenService.stopLoading();
                console.error('getValidateTimeCardToProcess' , err);
                this.doDeductionSlickGrid();
                this.getAllEmployeeDeductionManagementbyEmployeeId(this.employeedetails.Id);
              });
            } else {
              this.spinner = false;
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(rep.Message);
            }
          });
      });
    }
    

  }
  openEmployeeDeductionSlider(mode, employeeDeductionDetails) {

    const drawerRef = this.drawerService.create<EmployeedeductionmodalComponent,
      { id: number, employeeDetails: EmployeeDetails, employeeDeductionDetails: EmployeeDeductions, timeCardObj: any, gridId: string, AddDeductionType: string }, string>({
        nzTitle: mode,
        nzContent: EmployeedeductionmodalComponent,
        nzWidth: 1125,
        nzClosable: true,
        // nzMaskClosable: false,
        nzContentParams: {
          AddDeductionType: mode,
          id: this.Id,
          employeeDetails: this.employeedetails,
          employeeDeductionDetails: employeeDeductionDetails,
          timeCardObj: this.timeCardObj,
          gridId: "gridEmployeeDeduction"
        }
      });

      drawerRef.afterOpen.subscribe(() => {
        console.log('Drawer(Template) open');
      });

    drawerRef.afterClose.subscribe(data => {
      this.doDeductionSlickGrid();
      this.getAllEmployeeDeductionManagementbyEmployeeId(this.Id);
    });
  }
  closeupdate_InstallmentamntPopup() {
    $('#update_InstallmentamntPopup').modal('hide');
  }
  //#endregion

  GetEmployeeTaxItem(employeeId) {
    const promise = new Promise((resolve, reject) => {
      this.employeeService.
        GetEmployeeTaxItem(employeeId)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result != null) {
            resolve(apiResult.Result)
          } else {
            reject(false);
          }

        }, err => {
          reject(false);
        })
    });
    return promise;
  }

}



// @Component({
//   selector: 'nz-drawer-custom-component',
//   template: `
//     <div>
//       <input nz-input [(ngModel)]="value" />
//       <nz-divider></nz-divider>
//       <button nzType="primary" (click)="close()" nz-button>Confirm</button>
//     </div>
//   `
// })
// export class DrawerCustomComponent {
//   @Input() value = '';

//   constructor(private drawerRef: NzDrawerRef<string>) {

//     alert(this.value)
//   }

//   close(): void {
//     this.drawerRef.close(this.value);
//   }
// }