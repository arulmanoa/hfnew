import { HramodalComponent } from './../../../shared/modals/employee/hramodal/hramodal.component';
import { RatesetProduct } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { OnBoardingInfo, ClientContractList, OnEmploymentInfo, AdditionalColumns, OnboardingAdditionalInfo } from './../../../_services/model/OnBoarding/OnBoardingInfo';
import { OfferInfo, ClientLocationList } from './../../../_services/model/OnBoarding/OfferInfo';
import { MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { ManagerList, LeaveGroupList, CostCodeList } from './../../../_services/model/OnBoarding/MigrationInfo';
import { Component, OnInit, ViewChild, Input, VERSION, Pipe, PipeTransform, ViewEncapsulation } from '@angular/core';
import { HeaderService } from 'src/app/_services/service/header.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Gender, Nationality, BloodGroup, MaritalStatus, GraduationType, CourseType, ScoringType, AcceptanceStatus } from '../../../_services/model/Base/HRSuiteEnums';
import { enumHelper } from '../../../shared/directives/_enumhelper';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { SalaryDetailsComponent } from './salary-details/salary-details.component';
import { EmployeeDeductionsComponent } from './employee-deductions/employee-deductions.component';
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
import { MustMatch } from '../../../shared/directives/_helper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { UUID } from 'angular2-uuid'; import { ToastrService, ToastrConfig } from 'ngx-toastr';
import { UIMode } from '../../../_services/model/UIMode';
import { RowDataService } from '../../personalised-display/row-data.service';
import { ActionName, ActionType, Addressdetails, EmployeeCommunicationDetail, EmployeeDetails, EmployeeInvestmentMaster, EmployeeMenuData, EmployeeStatus, _EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { EmployeeService } from '../../../_services/service/employee.service';
import { apiResult } from '../../../_services/model/apiResult';
import { FamilyInfo, FamilyDocumentCategoryist } from 'src/app/_services/model/OnBoarding/FamilyInfo';
import { CommunicationInfo, StateList } from '../../../_services/model/OnBoarding/CommunicationInfo';
import { BankInfo, BankList, BankDocumentCategoryList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { CandidateInfo, CountryList } from '../../../_services/model/OnBoarding/CandidateInfo';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ContactDetails, CommunicationDetails, AddressDetails, CommunicationCategoryType } from '../../../_services/model/Communication/CommunicationType';
import { CandidateDocuments, ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { Claim, CandidateFamilyDetails, Relationship, ClaimType, _CustomCandidateFamilyDetails } from '../../../_services/model/Candidates/CandidateFamilyDetails';
import { FamilyDetails } from 'src/app/_services/model/Employee/FamilyDetails';
import { EmployeeBankDetails } from 'src/app/_services/model/Employee/EmployeeBankDetails';
import { CandidateBankDetails, BankBranchIdentifierType, VerificationMode } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { CandidateDetails, CandidateStatus, DuplicateCandidateDetails, Approvals, ApprovalFor, ApproverType, ApprovalType } from '../../../_services/model/Candidates/CandidateDetails';
import { environment } from "../../../../environments/environment";
import { Location } from '@angular/common';

import { DatePipe } from '@angular/common';
import { AlertService } from '../../../_services/service/alert.service';
import Swal from "sweetalert2";

import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { EmployeeModel, EmployeeModel1 } from 'src/app/_services/model/Employee/EmployeeModel';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';

import * as _ from 'lodash';
import { DataService } from 'src/app/_services/service/data.service';
import { CustomdrawerModalComponent } from 'src/app/shared/modals/investment/customdrawer-modal/customdrawer-modal.component';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { EmployeeInvestmentDeductions, EmployeeInvesmentDependentDetails, EmployeeInvestmentDocuments } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { EmployeeHouseRentDetails } from 'src/app/_services/model/Employee/EmployeeHouseRentDetails';
import { PageLayout } from '../../personalised-display/models';
import { PagelayoutService, CommonService, SearchService, PayrollService, ESSService } from 'src/app/_services/service';
import { SearchPanelType, DataSourceType } from '../../personalised-display/enums';
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
import { DynamicFieldDetails, DynamicFieldsValue, FieldValues } from 'src/app/_services/model/OnBoarding/DynamicFIeldDetails';
import { ControlElement } from '../../generic-form/form-models';
import { EmploymentDetails } from 'src/app/_services/model/Employee/EmploymentDetails';
import { DomesticPayment } from 'src/app/_services/model/Payroll/DomesticPayment';
import { DeductionStatus, DeductionType, EmployeeDeductions, EndStatus, PaymentSourceType, SuspensionType } from 'src/app/_services/model/Employee/EmployeeDeductions';
import { EmployeedeductionmodalComponent } from 'src/app/shared/modals/employeedeductionmodal/employeedeductionmodal.component';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { MycommunicationsComponent } from './mycommunications/mycommunications.component';
import { I } from '@angular/cdk/keycodes';
import { ProfileComponent } from './profile/profile.component';
import { OfficialInformationComponent } from './official-information/official-information.component';
import { MybankComponent } from './mybank/mybank.component';
import { NomineeInformationComponent } from './nominee-information/nominee-information.component';
import { MyeducationComponent } from './myeducation/myeducation.component';
import { MyexperienceComponent } from './myexperience/myexperience.component';
import { MyinvestmentComponent } from './myinvestment/myinvestment.component';
import { PreviousEmploymentComponent } from './previous-employment/previous-employment.component';
import { MydocumentsComponent } from './mydocuments/mydocuments.component';
import { InvestmentInfo } from 'src/app/_services/model/Employee/EmployeeExcemptions';
import * as html2pdf from 'html2pdf.js';
import { Person } from 'src/app/_services/model/Migrations/Transition';
import { EmploymentContract } from 'src/app/_services/model/Employee/EmployementContract';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { AdditionaldetailsComponent } from './additionaldetails/additionaldetails.component';
import { OnboardingadditionalinfoComponent } from '../../onboarding/shared/modals/onboardingadditionalinfo/onboardingadditionalinfo.component';

// export class InvestmentInfo {
//   TaxDeclaration: any;
//   FinancialDetails: any;
//   TaxItems: any;
// }

@Component({
  selector: 'app-ess',
  templateUrl: './ess.component.html',
  styleUrls: ['./ess.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EssComponent implements OnInit {

  @ViewChild(MycommunicationsComponent) child: MycommunicationsComponent;

  // SESSION DETAILS DECL.
  CompanyId: any = 0;
  UserId: any = 0;
  RoleId: any = 0;
  RoleCode: any;
  ImplementationCompanyId: any = 0;
  _loginSessionDetails: LoginResponses;
  EmployeeId: any = 0;
  isESSLogin: boolean = false;
  employeeModel: EmployeeModel = new EmployeeModel();
  // BASIC DETAILS OF EMPLOYEE
  employeedetails: EmployeeDetails = {} as any;
  contentmodalurl: any = null; // profile avatar 
  _EmployeeName: any;
  _EmployeeCode: any;
  _Designation: any; _DOJ: any;
  _MobileNo: any;
  _Email: string = "";
  isActiveEmployee: any = 1;
  employeeContractStatus: any = 1;
  BusinessType: any;
  // TABSET
  activeTabName: any;
  commonSpinner: boolean = false;
  CommunicationListGrp: CommunicationInfo;
  BankInfoListGrp: BankInfo;
  OfferInfoListGrp: OnEmploymentInfo;
  FamilyInofListGrp: FamilyInfo;
  InvestmetnListGrp: InvestmentInfo;
  lstlookUpDetails: EmployeeLookUp;
  DocumentInfoListGrp: any;
  ExemptionRateSetProducts = [];

  spinner: boolean = false;
  Id: any = 0; // like as EmployeeId
  invaid_fields = [];
  LstInvestmentSubmissionSlot = [];
  TaxDeclaration: any;
  isDuplicateBankInfo: boolean = false;
  FinId: any;
  _SelectedFinId: any;
  spinnerLoading: boolean = false;
  MenuId: any;
  ispendingInvestmentExist: boolean = false;

  /* #region  Deduction Slick Grid */
  columnDefinitions_Deduc: Column[] = [];
  gridOptions_Deduction: GridOption = {};
  LstDeductions: Array<EmployeeDeductions>;
  angularGrid_Deduction: AngularGridInstance;
  gridObj_Deduction: any;

  rateSetDetails: any = []

  @ViewChild('profile') profile: ProfileComponent;
  @ViewChild('communication') communication: MycommunicationsComponent;
  @ViewChild('official') official: OfficialInformationComponent;
  @ViewChild('mybank') mybank: MybankComponent;
  @ViewChild('nominee') nominee: NomineeInformationComponent;
  @ViewChild('myeducation') myeducation: MyeducationComponent;
  @ViewChild('myexperience') myexperience: MyexperienceComponent;
  @ViewChild('myinvestment') myinvestment: MyinvestmentComponent;
  @ViewChild('previousemp') previousemp: PreviousEmploymentComponent;
  @ViewChild('mydocs') mydocs: MydocumentsComponent;
  @ViewChild('salarydetails') salarydetails: SalaryDetailsComponent;
  @ViewChild('deductions') deductions: EmployeeDeductionsComponent;
  @ViewChild('additional') additional: AdditionaldetailsComponent;

  @ViewChild('onboardingAdditionalViewChild') onboardingAdditionalViewChild: OnboardingadditionalinfoComponent;
  failedFieldsForAdditionalInformation = [];
  additionalColumns: AdditionalColumns = {
    MarriageDate: null,
    Religion: null,
    Department: null,
    JobProfile: null,
    SubEmploymentType: null,
    Division: null,
    Level: null,
    SubEmploymentCategory: null,
    CostCityCenter: null,
    Building: null,
    EmploymentZone: null,
  };
  onboardingAdditionalInfo: OnboardingAdditionalInfo = {
    LstEmployeeDivision: [],
    LstEmployeeDepartment: [],
    LstEmployeeDesignation: [],
    LstEmployeeLevel: [],
    LstEmployeeCategory: [],
    LstReligion: [],
    LstSubEmploymentType: [],
    LstSubEmploymentCategory: [],
    LstCostCityCenter: [],
    LstBuildings: [],
    LstJobProfile: [],
    LstClientZone: []
  };
  isAdditionalInfo: boolean = false;
  IsCandidate: boolean = false;
  apiCallMade: boolean = false;
  // 12 BB

  enableUploadPopup: boolean = false;
  _SlotClosureDate: any;
  _isSubmit: any
  _isProofMode: any
  _ispendingInvestmentExist: any
  summaryDocumentId: any = 0;
  _otherSecDetails: any = []
  _rowSpan: any;
  exceptionList: any = []
  ltaRowspan: any
  modalOption: NgbModalOptions = {};
  sec10NameForForm12BB: any
  _formSumbitStatus: boolean;
  FileName: any;
  FileUrl: any;
  DocumentId: any;

  _financialYear: any;
  _hraDetails: any;
  _totalHraRent: any;
  _totalLtaAmout: any;
  _hpDetails: any;
  _totalHpAomunt: any
  _form12BBDate: any
  _section80C: any = []
  _section80Ccc: any = []
  _section80CcD: any = []
  _otherSec: any = []
  _hraLandLordDetails: any;
  form12bbInvestments: any
  isUpload12BBForm: boolean = true;
  _empAddress: any = ""
  Lstinvestment = [];
  Lstdeduction_Exemption = [];
  dynamicExeptions = [];
  dynamicPFInvestments = [];
  isInvestmentUnderQC: boolean;
  salaryDetails: any = [];
  _isTaxDeclartion: any;
  IsPriorDOJ: boolean = false;
  isTabDisabled: boolean = false;

  OfficialTabMaster_MigrationInfoGrp: any = null;
  OfficialTabMaster_OfferSkillZoneInfo: any = null;
  OfficialTabMaster_DynamicFieldDetails: any = null;
  OfficialTabMaster_Dynamicfieldvalue: any = null;
  LstfieldValue = [];
  ESSDynamicFields: any = null;
  allowedToSave: boolean = true;
  ShouldShownDynamic: boolean = false;

  requiredAdditionalColumnSettingValue = [];
  currentRoleCode: string = "";
  currentEntityType: string = "Employee";
  isTabShown: any = {
    "General": true,
    "IsCommunicationdetails": true,
    "EmployementDetails": true,
    "OtherDetails": true,
    "AdditionalDetails": true,
    "IsBankInfo": true,
    "IsFamilydetails": true,
    "SalaryDetails": true,
    "IsAcademicInfo": true,
    "IsEmploymentInfo": true,
    "IsPreviousEmployment": true,
    "IsDocumentInfo": true,
    "IsPaymentHistory": true,
    "deductions": true
  };

  isSavedMode: boolean = false;
  newEmployeeTransactionStatus: any = 0;
  approveOrRejectText: string = "";
  IsMakerCheckerRequired: boolean = false;
  newEmployeeRejectionReason: string = "";
  isDocumentsRequiredToUpload: boolean = false;
  RequiredDocumentTypes = [];
  NotAccessibleFields = [];
  AccessibleButtons = [];
  DefaultPFLogicProductCode: string = "";
  DefaultRuleIdForPFWages: any[] = [];
  displayNameForEmployeeStatus: string = environment.environment.displayNameForEmployeeStatus;
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
    private payrollService: PayrollService,
    private UtilityService: UtilityService,
    private essService: ESSService,
    private Customloadingspinner: NgxSpinnerService,
    private location: Location


  ) {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    });

  }

  ngOnInit() {
    console.log('*********');
    this.ispendingInvestmentExist = false;
    this.sec10NameForForm12BB = environment.environment.sec10NameForForm12BB;
    this.doRefresh();

  }

  doRefresh() {
    this.spinner = true;
    this.activeTabName = "General";
    this.headerService.setTitle('Employee Self Service');
    this.titleService.setTitle('Employee Self Service');
    // check if tab is enabled or disabled
    this.employeeService.getActiveTab(true);
    this.employeeService.disabledTabAsObservable.subscribe(tab => this.isTabDisabled = tab);
    //this.loadingScreenService.startLoading();
    //this.Customloadingspinner.show();
    // Get the whole matched session element set as a clean json(array) via an session object
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baSed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baSed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baSed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.currentRoleCode = this.RoleCode;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    //this.isInvestmentUnderQC=this.myinvestment.getInvmentStatus();
    this.employeedetails = null;
    this.salaryDetails = null;


    if (this.RoleCode != "Employee") {
      this.isESSLogin = false;
      let savedEmployeeDetails: EmployeeDetails;
      this.route.data.subscribe(data => {
        if (data.DataInterface.RowData) {
          this._EmployeeName = data.DataInterface.RowData.EmployeeName;
          this._EmployeeCode = data.DataInterface.RowData.EmployeeCode;
          this.EmployeeId = data.DataInterface.RowData.Id;
          this.isSavedMode = data.DataInterface.RowData.IsSavedEmployee;
          this.newEmployeeTransactionStatus = data.DataInterface.RowData.TransactionStatus;
          this.newEmployeeRejectionReason = data.DataInterface.RowData.RejectionReason;
          if (this.isSavedMode) {
            this.EmployeeId = 0;
            savedEmployeeDetails = JSON.parse(data.DataInterface.RowData.NewValue);
            savedEmployeeDetails.MakerCheckerTransactionId = data.DataInterface.RowData.Id;
          }
        }

        if (sessionStorage.getItem('IsFromBillEntry') == 'true' && this.isESSLogin == false) {
          var j = sessionStorage.getItem("RowDataInterface")
          const routedata = JSON.parse(j);
          this._EmployeeName = routedata.dataInterface.RowData.EmployeeName;
          this._EmployeeCode = routedata.dataInterface.RowData.EmployeeCode;
          this.EmployeeId = routedata.dataInterface.RowData.Id;
        }

        this.rowDataService.dataInterface = {
          SearchElementValuesList: [],
          RowData: null
        };
        sessionStorage.removeItem('LstHRA'), this.invaid_fields.length = 0;
      });

      this.route.params.subscribe((data: any) => {
        if (!data.id) return;

        this.EmployeeId = atob(data.id);

        if (this.isSavedMode) {
          this.EmployeeId = 0;
        }
      })

      // NEW EMPLOYEE CREATION FORM

      if (this.EmployeeId == 0 && this.BusinessType != 3) {
        this.Reset();
        let constantvle: EmployeeDetails = this.isSavedMode ? savedEmployeeDetails : _EmployeeDetails;
        constantvle.DateOfBirth == '1970-01-01' ? constantvle.DateOfBirth = '' : true;
        constantvle.EmploymentContracts[0].StartDate == "Invalid date" ? constantvle.EmploymentContracts[0].StartDate = null : true;
        console.log('_EmployeeDetails', _EmployeeDetails);
        this.employeedetails = constantvle;
        if (this.employeedetails.EmploymentContracts[0].CompanyId == null) {
          this.employeedetails.EmploymentContracts[0].CompanyId = this.CompanyId;
        }

        if (this.BusinessType != 3 && this.employeedetails.Id == 0) {
          this.employeedetails.EmploymentContracts[0].ClientId = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
          this.employeedetails.EmploymentContracts[0].ClientContractId = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));

        }


        if (this.BusinessType !== 3) {
          const employee = this.employeedetails;
          const employmentContract = employee.Id === 0 ? employee.EmploymentContracts[0] : employee.EmploymentContracts[0];

          const companyId = this.CompanyId;
          const clientId = employmentContract.ClientId;
          const clientContractId = employmentContract.ClientContractId;

          this.getDynamicFieldDetailsConfig(companyId, clientId, clientContractId)
            .then(() => console.log("Task Complete!"));

          this.doCheckAdditionalColumns(clientId);
          this.getEmployeeConfiguration(clientContractId);
          this.EmployeeId > 0 && this.isTabVisible();
        }

        // PRE DEFINED ONCE AT A  TIME OF LOAD 

        if (this.employeedetails && this.employeedetails.Id == 0) {
          this._loadEmpUILookUpDetails();
        }


        this.spinner = false;
        return;
      } else if (this.EmployeeId == 0) {
        this.router.navigate(['/app/listing/ui/employeelist']);
      }

      this.EmployeeLookUpDetailsByEmployeeId();
      this._loadEmpUILookUpDetails();
      // this.Customloadingspinner.hide();
    } else {
      this.isESSLogin = false;
      this.EmployeeId = this._loginSessionDetails.EmployeeId;
      this.Id = this._loginSessionDetails.EmployeeId;

    };

    // this.allowedToSave = (this.employeedetails.Id == 0 ? true : environment.environment.AllowedRolesToSaveEmployeeDetails &&
    //   environment.environment.AllowedRolesToSaveEmployeeDetails.includes(this.RoleCode) ? true : false);

    this.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).then((res) => { });
    // let mode = 2; // add-1, edit-2, view, 3   
    // this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    // this.UIBuilderService.doApply(mode, this, this.MenuId, "");
  }

  getDynamicFieldDetailsConfig(_companyId, _clientId, _clientContractId) {
    this.ShouldShownDynamic = false;
    var promise = new Promise((resolve, reject) => {
      this.onboardingService.getDynamicFieldDetails(_companyId, _clientId, _clientContractId, null)
        .subscribe((response) => {
          console.log('DFD INI RES ::', response);
          let apiresult: apiResult = response;

          if (apiresult.Status && apiresult.Result != null) {
            this.ShouldShownDynamic = true;
            this.ESSDynamicFields = apiresult.Result as any;
          }
          resolve(true);
        }, error => {
        })
    });
    return promise;
  }

  isTabVisible() {
    this.employeeService.getEmployeeVisibleTabs.subscribe(tab => {
      let requiredEmployeeTabs = tab;
      for (let key in this.isTabShown) {
        this.isTabShown[key] = requiredEmployeeTabs.includes(key);
      }
      console.log('isTabShown', this.isTabShown);
    });
  }

  doCheckAdditionalColumns(clientId: Number) {
    try {


      const requiredColumns = environment.environment.RequiredClientIdsForOnboardingAdditionalColumns;
      if (requiredColumns && requiredColumns.length > 0) {
        const clientSetting = requiredColumns.find(a => a.ClientId === clientId);
        console.log('clientSetting', clientSetting);

        if (clientSetting && clientSetting.SettingValue && clientSetting.SettingValue.length > 0) {
          this.isAdditionalInfo = true;
          this.requiredAdditionalColumnSettingValue = clientSetting.SettingValue;
        }
      }

      if (this.isAdditionalInfo && this.employeedetails.Id == 0) {

        this.additionalColumns.MarriageDate = (this.employeedetails.MarriageDate == '0001-01-01T00:00:00' as any) ? null : this.employeedetails.MarriageDate;

        this.additionalColumns.Religion = this.employeedetails.Religion;
        // this.additionalColumns.Department = this.employeedetails.EmploymentContracts[0].DepartmentId == 0 ? null : this.employeedetails.EmploymentContracts[0].DepartmentId;
        // this.additionalColumns.Division = this.employeedetails.EmploymentContracts[0].Division == 0 ? null : this.employeedetails.EmploymentContracts[0].Division;
        this.additionalColumns.Level = this.employeedetails.EmploymentContracts[0].Level == 0 ? null : this.employeedetails.EmploymentContracts[0].Level;
        this.additionalColumns.SubEmploymentType = this.employeedetails.EmploymentContracts[0].SubEmploymentType == 0 ? null : this.employeedetails.EmploymentContracts[0].SubEmploymentType;

        this.additionalColumns.JobProfile = this.employeedetails.EmploymentContracts[0].JobProfileId == 0 ? null : this.employeedetails.EmploymentContracts[0].JobProfileId;


        // this.additionalColumns.Category = this.employeedetails.EmploymentContracts[0].Category == 0 ? null : this.employeedetails.EmploymentContracts[0].Category;
        this.additionalColumns.SubEmploymentCategory = this.employeedetails.EmploymentContracts[0].SubEmploymentCategory == 0 ? null : this.employeedetails.EmploymentContracts[0].SubEmploymentCategory;

        this.additionalColumns.CostCityCenter = this.employeedetails.EmploymentContracts[0].CostCityCenter == 0 ? null : this.employeedetails.EmploymentContracts[0].CostCityCenter;

        this.additionalColumns.EmploymentZone = this.employeedetails.EmploymentContracts[0].EmploymentZone == 0 ? null : this.employeedetails.EmploymentContracts[0].EmploymentZone;
      }

    } catch (additionalColumnError) {
      console.log('Additional Column Mapping Exception Error', additionalColumnError);
    }
  }

  // GET METHOD REGION
  GetEmployeeRequiredDetailsById(employeeId, ctrlActivity) {

    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .Common_GetEmployeeRequiredDetailsById(employeeId, ctrlActivity).then((result: any) => {
          if (result == true) {
            // CHECK HERE
            this.employeedetails = JSON.parse(this.sessionService.getSessionStorage('_EmployeeRequiredBasicDetails'));
            console.log('this.employeedetails', this.employeedetails);
            if (result.Status && result.Result != null) {
              this.employeeModel.oldobj = Object.assign({}, result.Result);
              this.employeedetails = result.Result as any;
              console.log('EMPLOYEE REQUIRED DETAILS ::', this.employeedetails);
            }
            this.employeeModel.oldobj = Object.assign({}, JSON.parse(this.sessionService.getSessionStorage('_EmployeeRequiredBasicDetails'))) //JSON.parse(this.sessionService.getSessionStorage('_EmployeeRequiredBasicDetails')));
            // ! : 16.2 for panasonic
            this._EmployeeName = this.employeedetails.FirstName;
            this._EmployeeCode = this.employeedetails.Code;
            this._Designation = this.UtilityService.isNotNullAndUndefined(this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2)) == true ? this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).Designation : '---';
            this._MobileNo = (this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile : null);

            let contactDetails = this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails || [];

            if (contactDetails && contactDetails.length > 0) {

              if (contactDetails.find(a => a.CommunicationCategoryTypeId == 2) != undefined) {
                this._Email = contactDetails.find(a => a.CommunicationCategoryTypeId == 2).PrimaryEmail as any;
              }
              if (this._Email == "" && contactDetails.find(a => a.CommunicationCategoryTypeId == 3) != undefined) {
                this._Email = contactDetails.find(a => a.CommunicationCategoryTypeId == 3).PrimaryEmail as any;
              }

            }






            (this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail : null);
            this.isActiveEmployee = this.employeedetails.Status;
            this.employeeContractStatus = this.employeedetails.EmploymentContracts[0].Status;

            this._DOJ = this.UtilityService.isNotNullAndUndefined(this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2)) == true ? this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).StartDate : '---';

            if (this.BusinessType != 3) {
              this.getEmployeeConfiguration(this.employeedetails.EmploymentContracts[0].ClientContractId);
              this.doCheckAdditionalColumns(this.employeedetails.EmploymentContracts[0].ClientId);
              this.EmployeeId > 0 && this.isTabVisible();
              this.getDynamicFieldDetailsConfig(this.CompanyId, (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientId : this.employeedetails.EmploymentContracts[0].ClientId), (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientContractId : this.employeedetails.EmploymentContracts[0].ClientContractId)).then(() => console.log("Task Complete!"));
            }

            // ADDITIONAL ONBOARDING INFO
            if (this.isAdditionalInfo) {

              this.additionalColumns.MarriageDate = (this.employeedetails.MarriageDate == '0001-01-01T00:00:00' as any) ? null : this.employeedetails.MarriageDate;

              this.additionalColumns.Religion = this.employeedetails.Religion;
              // this.additionalColumns.Department = this.employeedetails.EmploymentContracts[0].DepartmentId == 0 ? null : this.employeedetails.EmploymentContracts[0].DepartmentId;
              // this.additionalColumns.Division = this.employeedetails.EmploymentContracts[0].Division == 0 ? null : this.employeedetails.EmploymentContracts[0].Division;
              this.additionalColumns.Level = this.employeedetails.EmploymentContracts[0].Level == 0 ? null : this.employeedetails.EmploymentContracts[0].Level;
              this.additionalColumns.SubEmploymentType = this.employeedetails.EmploymentContracts[0].SubEmploymentType == 0 ? null : this.employeedetails.EmploymentContracts[0].SubEmploymentType;

              this.additionalColumns.JobProfile = this.employeedetails.EmploymentContracts[0].JobProfileId == 0 ? null : this.employeedetails.EmploymentContracts[0].JobProfileId;

              // this.additionalColumns.Category = this.employeedetails.EmploymentContracts[0].Category == 0 ? null : this.employeedetails.EmploymentContracts[0].Category;
              this.additionalColumns.SubEmploymentCategory = this.employeedetails.EmploymentContracts[0].SubEmploymentCategory == 0 ? null : this.employeedetails.EmploymentContracts[0].SubEmploymentCategory;


              this.additionalColumns.EmploymentZone = this.employeedetails.EmploymentContracts[0].EmploymentZone == 0 ? null : this.employeedetails.EmploymentContracts[0].EmploymentZone;


              this.additionalColumns.CostCityCenter = this.employeedetails.EmploymentContracts[0].CostCityCenter == 0 ? null : this.employeedetails.EmploymentContracts[0].CostCityCenter;
            }

            // ! : 16.2 for panasonic this.spinner = false;
          } else {
            this.spinner = false;
            this.alertService.showWarning(`An error occurred while getting employee details`);
            return;
          }
          this.spinner = false;

        }, err => {
          this.spinner = false;
        })
      // .subscribe((result) => {
      //   try {
      //     let apiresult: apiResult = result;
      //     if (apiresult.Status && apiresult.Result != null) {
      //       this.employeedetails = apiresult.Result as any;
      //       console.log('EMPLOYEE REQUIRED DETAILS ::', this.employeedetails);

      //       this._EmployeeName = this.employeedetails.FirstName;
      //       this._EmployeeCode = this.employeedetails.Code;
      //       this._Designation = this.employeedetails.EmploymentContracts[0].Designation;
      //       this._MobileNo = (this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile : null);
      //       this._Email = (this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail : null);
      //       this.isActiveEmployee = this.employeedetails.EmploymentContracts[0].Status;


      //     } else {
      //       console.info('AN ERROR OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', result);
      //       this.alertService.showWarning(`An error occurred while getting employee details : ${apiresult.Message}`);
      //     }
      //     resolve(true);
      //   } catch (error) {
      //     console.info('AN EXCEPTION OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', error);
      //     reject(true);
      //   }
      // }, err => {
      //   reject(true);
      // });

    });

    return promise;
  }


  CheckNewJoineeDeclaratinModeDOJ() {
    let DOJ = this.employeedetails != null && this.employeedetails.EmploymentContracts != null && this.employeedetails.EmploymentContracts.length > 0
      ? this.employeedetails.EmploymentContracts[0].StartDate : null;
    if (DOJ != null) {
      var new_date = moment(DOJ, 'YYYY-MM-DD').add('days', environment.environment.AmountOfNewJoineeDOJCheckForInvestmentSlot);
      var currentDate = moment().format('YYYY-MM-DD');
      this.IsPriorDOJ = (moment(currentDate).isBetween(moment(DOJ).format('YYYY-MM-DD'), moment(new_date).format('YYYY-MM-DD'))); // true
      if (moment(currentDate)
        .isSame(moment(new_date).format('YYYY-MM-DD'))) {
        this.IsPriorDOJ = true;
      }
    }

  }

  loadDataField(value: string) {

    this.loadData({ nextId: value });
    let screenSize = document.documentElement.clientHeight - 1;
    window.scrollTo({
      top: screenSize,
      behavior: "smooth",
    });
  }

  loadData(event) {
    this.employeeService.getActiveTab(true);
    this.commonSpinner = true;
    this.loadingScreenService.startLoading();

    console.log('additionalColumns ', this.additionalColumns);
    console.log('Tab Event : ', event);
    if (event.nextId == 'isCommunicationdetails') {
      if (this.CommunicationListGrp == undefined) {
        this.Common_GetEmployeeAccordionDetails('isCommunicationdetails');
      }
      else {
        this.commonSpinner = false;
      }
    }
    else if (event.nextId == 'General') {
      this.commonSpinner = false;
    }
    else if (event.nextId == 'isBankInfo') {

      if (this.employeedetails.Id == 0) {
        this.Common_GetEmployeeAccordionDetails('isBankInfo');
        return;
      }
      this.GetEmployeeRequiredBankDetails().then((obj) => {
        this.Common_GetEmployeeAccordionDetails('isBankInfo');
      })

    }
    else if (event.nextId == 'isFamilydetails') {
      if (this.employeedetails.Id == 0) {
        this.Common_GetEmployeeAccordionDetails('isFamilydetails');
        return;
      }

      this.GetEmployeeRequiredFamilyDetails().then((obj) => {
        this.Common_GetEmployeeAccordionDetails('isFamilydetails');
      })
    }
    else if (event.nextId == 'EmployementDetails') {
      if (this.OfferInfoListGrp == undefined) {
        this.Common_GetEmployeeAccordionDetails('isEmploymentDetails');
        const clientId = this.employeedetails.EmploymentContracts[0].ClientId;
        const clientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
        if (!this.apiCallMade) {
          this.onboardingService.GetOnboardingAdditionalInfo(clientId, clientContractId).subscribe((response: apiResult) => {
            this.apiCallMade = true;
            this.commonSpinner = false;
            if (response.Status) {
              this.onboardingAdditionalInfo = JSON.parse(response.Result);
              console.log('this.onboardingAdditionalInfo', this.onboardingAdditionalInfo);
            }
          }, (error) => {

          });
        } else {
          this.commonSpinner = false;
        }

      } else {
        this.commonSpinner = false;
      }
    }

    else if (event.nextId == 'AdditionalDetails') {

      this.commonSpinner = false;

    }
    else if (event.nextId == "isInvestmentInfo") {
      this.EmployeeLookUpDetailsByEmployeeId().then((obj) => {
        this.GetEmployeeRequiredInvestmentDetails().then((obj1) => {
          this._loadEmpUILookUpDetails();
        });
      })
    }
    else if (event.nextId == "isDocumentInfo") {



      if (this.employeedetails.Id == 0) {
        this.Common_GetEmployeeAccordionDetails('isDocumentInfo');

      } else {

        this.commonSpinner = true;
        this.GetEmployeeRequiredDocumentetails().then((obj) => {
          if (this.DocumentInfoListGrp == undefined) {
            this.Common_GetEmployeeAccordionDetails('isDocumentInfo');
          } else {
            this.commonSpinner = false;
          }
          // this._loadEmpUILookUpDetails();

        })
      }


    }
    else if (event.nextId == "isPreviousEmployment") {

      this.commonSpinner = true;
      this.EmployeeLookUpDetailsByEmployeeId().then((obj) => {
        this.GetEmployeeRequiredEmploymentDetails().then((obj1) => {
          this._loadEmpUILookUpDetails();
          this.commonSpinner = false;
        });
      })

    }
    else if (event.nextId == 'isPaymentHistory') {
      this.commonSpinner = false;
    }
    else if (event.nextId == 'isAcademicInfo') {
      this.GetEmployeeRequiredEducationDetails().then((obj) => {
        this.commonSpinner = false;
      });
    }
    else if (event.nextId == 'isEmploymentInfo') {
      this.GetEmployeeRequiredExperienceDetails().then((obj) => {
        this.commonSpinner = false;
      });
    }
    else if (event.nextId == 'SalaryDeatils') {
      this.getSalaryDetails().then((obj) => {

        this.commonSpinner = false;
      });

    }
    else if (event.nextId == 'deductions') {
      //this.EmployeeId = 15459;
      this.getdeductionDetails();
      this.commonSpinner = false;

    }

    else if (event.nextId == 'OtherDetails') {
      const clientId = this.employeedetails.EmploymentContracts[0].ClientId;
      const clientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
      if (!this.apiCallMade) {
        this.onboardingService.GetOnboardingAdditionalInfo(clientId, clientContractId).subscribe((response: apiResult) => {
          this.apiCallMade = true;
          this.commonSpinner = false;
          if (response.Status) {
            this.onboardingAdditionalInfo = JSON.parse(response.Result);
            console.log('this.onboardingAdditionalInfo', this.onboardingAdditionalInfo);
          }
        }, (error) => {

        });
      } else {
        this.commonSpinner = false;
      }
    }
    this.activeTabName = event.nextId;
    this.employeeService.getActiveTab(false);
    this.loadingScreenService.stopLoading();

  }
  getSalaryDetails() {
    const promise = new Promise((resolve, reject) => {
      if (this.salaryDetails == null || this.salaryDetails.length == 0) {
        this.employeeService
          .GetEmployeeActiveRatesets(this.EmployeeId).subscribe((result) => {
            var apiresult1 = result;

            if (apiresult1.Status && apiresult1.Result != null) {
              this.salaryDetails = JSON.parse(apiresult1.Result);

              resolve(true);
            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee details`);
              return;
            }

          }, err => {
            resolve(false);
          })
      }
      else {
        if (this.employeedetails && this.employeedetails.EmployeeRatesets)
          this.salaryDetails = this.employeedetails.EmployeeRatesets
        resolve(true);
      }
    })
    if (this.activeTabName == 'SalaryDeatils') {
      this.salarydetails.EmitHandler();
    }
    return promise;


  }
  getdeductionDetails() {
    if (this.activeTabName == 'deductions') {
      this.deductions.EmitHandler();
    }
  }

  Common_GetEmployeeAccordionDetails(accordionName) {
    this.commonSpinner = true;

    if (this.employeedetails.EmploymentContracts[0].CompanyId == null) {
      this.employeedetails.EmploymentContracts[0].CompanyId = this.CompanyId;
    }

    if (this.BusinessType != 3 && this.employeedetails.Id == 0) {
      this.employeedetails.EmploymentContracts[0].ClientId = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.employeedetails.EmploymentContracts[0].ClientContractId = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
    }

    this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, accordionName).then((Result) => {

      try {
        if (accordionName == "isCommunicationdetails") {
          this.CommunicationListGrp = Result as any;
          console.log('CommunicationListGrp', this.CommunicationListGrp);
        }
        else if (accordionName == "isBankInfo") {
          this.BankInfoListGrp = Result as any;
          console.log('BankInfoListGrp', this.BankInfoListGrp);
        }
        else if (accordionName == "isEmploymentDetails") {
          this.OfferInfoListGrp = Result as any;
          console.log('OfferInfoListGrp', this.OfferInfoListGrp);

        }
        else if (accordionName == "isFamilydetails") {
          this.FamilyInofListGrp = Result as any;
        }
        else if (accordionName == "isDocumentInfo") {
          this.DocumentInfoListGrp = Result as any;
        }
        this.commonSpinner = false;
        return true;

      } catch (error) {
        console.log(`EX GET ${accordionName} ACCORDION INFO :`, error);
      }

    });
  }

  GetEmployeeRequiredBankDetails() {
    const promise = new Promise((resolve, reject) => {
      if (this.employeedetails.lstEmployeeBankDetails == null || this.employeedetails.lstEmployeeBankDetails.length == 0) {
        this.employeeService
          .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.BankAccounts).subscribe((result) => {
            console.log('re', result);
            let apiR: apiResult = result;
            if (apiR.Status == true) {
              let bankObject: EmployeeDetails = apiR.Result as any;
              // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.lstEmployeeBankDetails = Object.assign({}, bankObject.lstEmployeeBankDetails));
              this.employeedetails.lstEmployeeBankDetails = bankObject.lstEmployeeBankDetails;
              resolve(true);
            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee details`);
              return;
            }

          }, err => {
            resolve(false);
          })
      } else {
        resolve(true);
      }
    })
    return promise;
  }

  GetEmployeeRequiredFamilyDetails() {
    const promise = new Promise((resolve, reject) => {
      if (this.employeedetails.EmpFamilyDtls == null || this.employeedetails.EmpFamilyDtls.length == 0) {
        this.employeeService
          .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.FamilyDetails).subscribe((result) => {
            console.log('re', result);
            let apiR: apiResult = result;
            if (apiR.Status == true) {
              let familyObject: EmployeeDetails = apiR.Result as any;
              // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.EmpFamilyDtls = Object.assign({}, familyObject.EmpFamilyDtls));
              this.employeeModel.oldobj = Object.assign({}, result.Result);
              this.employeedetails.EmpFamilyDtls = familyObject.EmpFamilyDtls;
              resolve(true);
            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee details`);
              return;
            }
          }, err => {
            resolve(false);
          })
      }
      else {
        resolve(true);
      }
    })

    return promise;
  }

  GetEmployeeRequiredInvestmentDetails() {
    this.commonSpinner = true;
    const promise = new Promise((resolve, reject) => {

      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments, this.FinId).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let investmentObject: EmployeeDetails = apiR.Result as any;
            if (this.employeedetails.LstEmployeeTaxExemptionDetails == null || this.employeedetails.LstEmployeeTaxExemptionDetails.length == 0) {
              this.employeedetails.LstEmployeeTaxExemptionDetails = investmentObject.LstEmployeeTaxExemptionDetails;
            }
            if (this.employeedetails.LstEmployeeHousePropertyDetails == null || this.employeedetails.LstEmployeeHousePropertyDetails.length == 0) {
              this.employeedetails.LstEmployeeHousePropertyDetails = investmentObject.LstEmployeeHousePropertyDetails;
            }
            if (this.employeedetails.LstemployeeHouseRentDetails == null || this.employeedetails.LstemployeeHouseRentDetails.length == 0) {
              this.employeedetails.LstemployeeHouseRentDetails = investmentObject.LstemployeeHouseRentDetails;
            }
            if (this.employeedetails.LstemployeeInvestmentDeductions == null || this.employeedetails.LstemployeeInvestmentDeductions.length == 0) {
              this.employeedetails.LstemployeeInvestmentDeductions = investmentObject.LstemployeeInvestmentDeductions;
            }
            if (this.employeedetails.EmployeeInvestmentMaster == null) {
              this.employeedetails.EmployeeInvestmentMaster = investmentObject.EmployeeInvestmentMaster;
            }

            // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.LstEmployeeTaxExemptionDetails = Object.assign({}, investmentObject.LstEmployeeTaxExemptionDetails));
            // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.LstEmployeeHousePropertyDetails = Object.assign({}, investmentObject.LstEmployeeHousePropertyDetails));
            // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.LstemployeeHouseRentDetails = Object.assign({}, investmentObject.LstemployeeHouseRentDetails));
            // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.LstemployeeInvestmentDeductions = Object.assign({}, investmentObject.LstemployeeInvestmentDeductions));

            resolve(true);

          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting employee details`);
            return;
          }
        }, err => {
          resolve(false);
        })
    })
    return promise;
  }

  GetEmployeeRequiredEmploymentDetails() {
    this.commonSpinner = true;
    const promise = new Promise((resolve, reject) => {
      if (this.employeedetails.LstemploymentDetails == null || this.employeedetails.LstemploymentDetails.length == 0) {
        this.employeeService
          .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.PreviousEmploymentDetails).subscribe((result) => {
            let apiR: apiResult = result;
            if (apiR.Status == true) {
              let employmentObject: EmployeeDetails = apiR.Result as any;
              // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.LstemploymentDetails = Object.assign({},  employmentObject.LstemploymentDetails));
              this.employeedetails.LstemploymentDetails = employmentObject.LstemploymentDetails;
              this.employeedetails.EmployeeInvestmentMaster = employmentObject.EmployeeInvestmentMaster;

              resolve(true);

            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee details`);
              return;
            }
          }, err => {
            resolve(false);
          })
      }
      else {
        resolve(true);
      }
    })
    return promise;
  }

  GetEmployeeRequiredEducationDetails() {
    this.commonSpinner = true;
    const promise = new Promise((resolve, reject) => {
      if (this.employeedetails.Qualifications == null || this.employeedetails.Qualifications.length == 0) {
        this.employeeService
          .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Education).subscribe((result) => {
            console.log('re', result);
            let apiR: apiResult = result;
            if (apiR.Status == true) {
              let educationObject: EmployeeDetails = apiR.Result as any;
              // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.Qualifications = Object.assign({},  educationObject.Qualifications));
              this.employeedetails.Qualifications = educationObject.Qualifications;
              resolve(true);
            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee details`);
              return;
            }

          }, err => {
            resolve(false);
          })
      }
      else {
        resolve(true);
      }
    })
    return promise;
  }


  GetEmployeeRequiredExperienceDetails() {
    this.commonSpinner = true;
    const promise = new Promise((resolve, reject) => {
      if (this.employeedetails.WorkExperiences == null || this.employeedetails.WorkExperiences.length == 0) {
        this.employeeService
          .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Experience).subscribe((result) => {
            console.log('re', result);
            let apiR: apiResult = result;
            if (apiR.Status == true) {
              let expObject: EmployeeDetails = apiR.Result as any;
              // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.WorkExperiences = Object.assign({},   expObject.WorkExperiences));
              this.employeedetails.WorkExperiences = expObject.WorkExperiences;
              resolve(true);
            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee details`);
              return;
            }

          }, err => {
            resolve(false);
          })
      }
      else {
        resolve(true);
      }
    })
    return promise;
  }

  GetEmployeeRequiredDocumentetails() {

    this.commonSpinner = true;
    const promise = new Promise((resolve, reject) => {
      // if (this.employeedetails.CandidateDocuments == null || this.employeedetails.CandidateDocuments.length == 0) {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.EmployeeDocuments).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let employmentObject: EmployeeDetails = apiR.Result as any;
            // this.employeeModel.oldobj != null && ( this.employeeModel.oldobj.CandidateDocuments = Object.assign({},   employmentObject.CandidateDocuments));
            this.employeedetails.CandidateDocuments = employmentObject.CandidateDocuments;
            this.employeedetails.LstEmployeeLetterTransactions = employmentObject.LstEmployeeLetterTransactions;
            resolve(true);

          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting employee details`);
            return;
          }
        }, err => {
          resolve(false);
        })
      // } else {
      //   resolve(true);
      // }
    })
    return promise;


  }

  EmployeeLookUpDetailsByEmployeeId() {
    this.commonSpinner = true;
    const promise = new Promise((resolve, reject) => {
      if (this.sessionService.getSessionStorage('InvestmetnListGrp') != null && this.sessionService.getSessionStorage('LookUpDInvestmetnListGrpetails') != undefined) {
        this.InvestmetnListGrp = JSON.parse(this.sessionService.getSessionStorage('InvestmetnListGrp'));
        this.FinId = this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 ? this.InvestmetnListGrp.FinancialDetails[0].Id : 0;

        this.commonSpinner = false;
        resolve(true);
        return;
      } else {
        this.employeeService
          .EmployeeLookUpDetailsByEmployeeId(this.EmployeeId).subscribe((result) => {
            let apiR: apiResult = result;

            if (apiR.Status == true) {

              var lookupObject = JSON.parse(apiR.Result) as any;
              console.log('lookup', lookupObject);

              this.InvestmetnListGrp = lookupObject;
              this._isTaxDeclartion = lookupObject.TaxDeclaration
              this.sessionService.setSesstionStorage('InvestmetnListGrp', this.InvestmetnListGrp);
              this.FinId = this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 ? this.InvestmetnListGrp.FinancialDetails[0].Id : 0;

              // this.InvestmetnListGrp = lookupObject.TaxDeclaration;
              resolve(true);

            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee other details`);
              return;
            }
          }, err => {
            resolve(false);
          })
      }
    })
    return promise;
  }

  GetEmployeeTaxItem() {
    this.commonSpinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeTaxItem(this.EmployeeId).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            console.log('lookup', result);

            var lookupObject = JSON.parse(apiR.Result) as any;
            this.InvestmetnListGrp.FinancialDetails = lookupObject.FinancialDetails as any;
            this.InvestmetnListGrp.TaxDeclaration = lookupObject.TaxDeclaration;
            this.InvestmetnListGrp.TaxItems = lookupObject.TaxItems;

            resolve(true);

          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting employee details`);
            return;
          }
        }, err => {
          resolve(false);
        })
    })
    return promise;
  }


  _loadEmpUILookUpDetails() {


    return new Promise((res, rej) => {
      this.commonSpinner = true;
      // if (this.sessionService.getSessionStorage('LookUpDetails') != null && this.sessionService.getSessionStorage('LookUpDetails') != undefined) {
      //   this.lstlookUpDetails = JSON.parse(this.sessionService.getSessionStorage('LookUpDetails'));
      //   this.commonSpinner = false;
      //   res(true);
      //   return;
      // } else {
      this.employeeService.get_LoadEmployeeUILookUpDetails(this.EmployeeId)
        .subscribe((result) => {

          let apiResponse: apiResponse = result;
          console.log('lookup details', result);

          if (apiResponse.Status) {
            this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
            this.sessionService.setSesstionStorage('LookUpDetails', this.lstlookUpDetails);
            this.commonSpinner = false;
            res(true);
          } else {
            this.commonSpinner = false;
          }
        }, err => {
          rej();
        })
      // }
    });

  }

  onboardingAdditionalInfoChangeHandler(obj: any) {
    let additionalInfo: AdditionalColumns = obj.additionalInfoForm;
    var employeeD: EmployeeDetails = obj.employeedetails
    this.employeedetails = employeeD;

    console.log("additionalInfo Handler : ", this.employeedetails)
    this.failedFieldsForAdditionalInformation = [];
    this.additionalColumns = additionalInfo;
    for (const prop of Object.keys(additionalInfo)) {
      if (additionalInfo[prop] == null) {
        this.failedFieldsForAdditionalInformation.push(prop);
      }
      console.log(`Property Name: ${prop}, Value: ${additionalInfo[prop]}`);
    }
  }

  communicationChangeHandler(employeeD: any) {
    console.log("communicationChangeHandler", employeeD)
  }

  mydocumentsChangeHandler(employeeD: EmployeeDetails) {
    console.log("mydocumentsChangeHandler", employeeD)
    this.employeedetails.CandidateDocuments = employeeD.CandidateDocuments;
  }
  employmentChangeHandler(employeeD: EmployeeDetails) {
    console.log("employmentChangeHandler", employeeD)
    this.employeedetails.LstemploymentDetails = employeeD.LstemploymentDetails;
  }
  familyChangeHandler(employeeD: EmployeeDetails) {
    console.log("familyChangeHandler", employeeD)
    this.employeedetails.EmpFamilyDtls = employeeD.EmpFamilyDtls;
  }
  officialChangeHandler(obj: any) {
    console.log("officialChangeHandler", obj)
    this.OfficialTabMaster_OfferSkillZoneInfo = obj.OfferSkillZoneInfo;
    this.OfficialTabMaster_MigrationInfoGrp = obj.MigrationInfoGrp;

    var employeeD: EmployeeDetails = obj.employeedetails

    this.employeedetails.EmploymentContracts = employeeD.EmploymentContracts;
    this.employeedetails.EmploymentContracts[0].Level != null && this.employeedetails.EmploymentContracts[0].Level != 0 ? this.additionalColumns.Level = this.employeedetails.EmploymentContracts[0].Level : true;

  }

  additionalDetailsChangeHandler(obj: any) {
    console.log("additionalDetailsChangeHandler", obj)

    if (sessionStorage.getItem('DynamicDetails') != null) {
      console.log(JSON.parse(sessionStorage.getItem('DynamicDetails')));
    }
    this.OfficialTabMaster_DynamicFieldDetails = obj.DynamicFieldDetails;
    this.OfficialTabMaster_Dynamicfieldvalue = obj.Dynamicfieldvalue;

  }

  educationChangeHandler(employeeD: EmployeeDetails) {
    console.log("educationChangeHandler", employeeD)
    this.employeedetails.Qualifications = employeeD.Qualifications;
  }
  experienceChangeHandler(employeeD: EmployeeDetails) {
    console.log("educationChangeHandler", employeeD)
    this.employeedetails.WorkExperiences = employeeD.WorkExperiences;
  }
  salaryDetailsChangeHandler(employeeD: any) {
    if (employeeD != null && employeeD.length > 0) {
      employeeD[0].Status = 1;
      employeeD[0].EmployeeLifeCycleTransactionId = this.employeedetails.ELCTransactions.find(a => a.Status == 2).Id;
    }
    this.employeedetails.EmployeeRatesets = employeeD
    console.log("salaryDetailsChangeHandler", employeeD)
  }
  DeductionDetailsChangeHandler(empDetails: any) {
    this.employeedetails = empDetails;
    if (this.employeedetails && this.employeedetails.DateOfBirth) {
      this.employeedetails.DateOfBirth = moment(this.employeedetails.DateOfBirth).format('YYYY-MM-DD');
    }
    this.employeedetails.EmploymentContracts[0].Modetype = UIMode.Edit;
    this.employeedetails.EmploymentContracts[0]['IsEmployeeDeductionApplicable'] = this.employeedetails['IsEmployeeDeductionApplicable'];
    console.log("EmployeeDeductionsComponent", this.employeedetails)
  }

  onToggle(employeeD: EmployeeDetails) {
    console.log("test lost viewerwe k", employeeD)

  }
  profileChangeHandler(employeeD: EmployeeDetails) {
    console.log("mydocumentsChangeHandler", employeeD)
    this.employeedetails.FirstName = employeeD.FirstName;
    this.employeedetails.Status = employeeD.Status;
    this.employeedetails.Gender = employeeD.Gender;
    this.employeedetails.DateOfBirth = employeeD.DateOfBirth;
    // this.employeedetails.FatherName = employeeD.FatherName;
    this.employeedetails.Aadhaar = employeeD.Aadhaar;
    this.employeedetails.PAN = employeeD.PAN;
    this.employeedetails.RelationshipName = employeeD.RelationshipName
    this.employeedetails.UAN = employeeD.UAN;
    this.employeedetails.ESIC = employeeD.ESIC;
    this.employeedetails.EmploymentContracts[0]["PFNumber"] = employeeD.EmploymentContracts[0]['PFNumber'];
    this.employeedetails.EmploymentContracts[0].IsESSRequired = employeeD.EmploymentContracts[0].IsESSRequired;
    this.employeedetails.Modetype = employeeD.Modetype;
    this.employeedetails.EmployeeCommunicationDetails = employeeD.EmployeeCommunicationDetails;

  }

  bankChangeHandler(employeeD: EmployeeDetails) {
    console.log("mydocumentsChangeHandler", employeeD)
    this.employeedetails.lstEmployeeBankDetails = employeeD.lstEmployeeBankDetails;
  }
  investmentChangeHandler(employeeD: any) {
    console.log("investmentChangeHandler", employeeD)

    var empDet = employeeD.empDet;
    var OtherRecords = employeeD.others;
    this.ispendingInvestmentExist = OtherRecords._ispendingExist;
    this.Lstinvestment = OtherRecords._inv;
    this.Lstdeduction_Exemption = OtherRecords._ded;
    this.dynamicExeptions = OtherRecords._exem;
    this.dynamicPFInvestments = OtherRecords._dynPFInv;
    this.isInvestmentUnderQC = OtherRecords._isInvestUnderQC

    this.employeedetails.LstEmployeeHousePropertyDetails = empDet.LstEmployeeHousePropertyDetails == null ? [] : empDet.LstEmployeeHousePropertyDetails;
    this.employeedetails.LstemployeeHouseRentDetails = empDet.LstemployeeHouseRentDetails == null ? [] : empDet.LstemployeeHouseRentDetails;
    this.employeedetails.LstemployeeInvestmentDeductions = empDet.LstemployeeInvestmentDeductions == null ? [] : empDet.LstemployeeInvestmentDeductions;
  }
  // investmentStatusHandler(InvestmentUnderQC){
  //   this.isInvestmentUnderQC=InvestmentUnderQC;
  // }
  IspendingInvestmentExistHandler(obj) {
    console.log("BEH OBJECT :", obj)
    this.ispendingInvestmentExist = false;
    this.ispendingInvestmentExist = obj.investmentbehaviourData.IsPendingItems;
    this.isInvestmentUnderQC = obj.investmentbehaviourData.IsItInQc
  }

  async doSaveOrSubmit(isSubmit) {



    if (this.activeTabName == 'General') {
      this.profile.EmitHandler();
    } else if (this.activeTabName == 'isCommunicationdetails') {
      this.communication.EmitHandler();
    }
    else if (this.activeTabName == 'EmployementDetails') {
      try {
        this.official.EmitHandler();
      } catch (error) {
        console.log('OFF EXE ::', error);

      }

    }
    else if (this.activeTabName == 'OtherDetails') {
      this.onboardingAdditionalViewChild.ngOnDestroy();
    }
    else if (this.activeTabName == 'isBankInfo') {
      this.mybank.EmitHandler();
    }
    else if (this.activeTabName == 'isFamilydetails') {
      this.nominee.EmitHandler();
    }
    else if (this.activeTabName == 'isAcademicInfo') {
      this.myeducation.EmitHandler();
    } else if (this.activeTabName == 'isEmploymentInfo') {
      this.myexperience.EmitHandler();
    }
    else if (this.activeTabName == 'AdditionalDetails') {
      this.additional.EmitHandler();
    }
    // else if (this.activeTabName == 'isInvestmentInfo') {
    //   this.myinvestment.EmitHandler();
    // } 
    else if (this.activeTabName == 'isPreviousEmployment') {
      this.previousemp.EmitHandler();
    } else if (this.activeTabName == 'isDocumentInfo') {
      this.mydocs.EmitHandler();
    }
    else if (this.activeTabName == 'SalaryDeatils') {
      this.salarydetails.EmitHandler();
    } else if (this.activeTabName == 'deductions') {
      this.deductions.EmitHandler();
    }


    console.log('EMP DETIAL CRET ::', this.employeedetails);

    this.LstfieldValue = [];

    if (this.OfficialTabMaster_DynamicFieldDetails == null || this.isEmptyObject(this.OfficialTabMaster_DynamicFieldDetails)) {

      this.ESSDynamicFields != null && !this.isEmptyObject(this.ESSDynamicFields) && this.ESSDynamicFields.ControlElemetsList.length > 0 && this.ESSDynamicFields.ControlElemetsList.forEach(element => {
        var fieldValue = new FieldValues();
        fieldValue.FieldName = element.FieldName;
        fieldValue.ParentFieldName = element.TabName;
        fieldValue.Value = element.Value;
        fieldValue.MultipleValues = element.MultipleValues;
        this.LstfieldValue.push(fieldValue);
      });

    }

    this.OfficialTabMaster_DynamicFieldDetails != null && !this.isEmptyObject(this.OfficialTabMaster_DynamicFieldDetails) && this.OfficialTabMaster_DynamicFieldDetails.ControlElemetsList.length > 0 && this.OfficialTabMaster_DynamicFieldDetails.ControlElemetsList.forEach(element => {
      var fieldValue = new FieldValues();
      fieldValue.FieldName = element.FieldName;
      fieldValue.ParentFieldName = element.TabName;
      fieldValue.Value = element.Value;
      fieldValue.MultipleValues = element.MultipleValues;
      this.LstfieldValue.push(fieldValue);
    });




    console.log('this.LstfieldValue', this.LstfieldValue);



    if (this.employeedetails.Id == 0) {

      this.employeedetails.EmploymentContracts[0].ClientId
      if ((this.employeedetails.EmploymentContracts[0].ClientId == null || this.employeedetails.EmploymentContracts[0].ClientId == 0) ||
        (this.employeedetails.EmploymentContracts[0].ClientContractId == null || this.employeedetails.EmploymentContracts[0].ClientContractId == 0) ||
        (this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == 3 || a.CommunicationCategoryTypeId == 2).PrimaryEmail == "" || this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == 3 || a.CommunicationCategoryTypeId == 2) == null) ||
        (this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == 3).PrimaryMobile == "" || this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == 3).PrimaryMobile == null || this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == 3).PrimaryEmail == null) ||
        ((this.employeedetails.FirstName == "" || this.employeedetails.FirstName == null))
        ||
        ((this.employeedetails.Gender == null || this.employeedetails.Gender == undefined))
        ||
        ((this.employeedetails.DateOfBirth == null || this.employeedetails.Gender == undefined))
        ||
        ((this.employeedetails.RelationshipName == "" || this.employeedetails.RelationshipName == null))
        ||
        ((this.employeedetails.MaritalStatus == "" || this.employeedetails.MaritalStatus == null || this.employeedetails.MaritalStatus == 0 || this.employeedetails.MaritalStatus == undefined))
        // ||
        //((this.employeedetails.Code == "" || this.employeedetails.Code == null))
      ) {

        if (this.BusinessType == 3) {
          this.alertService.showWarning("Some information was missing. There were problems with the following fields : Client, Client Contract, Employee Name, Employee Code,  Email and Mobile number")
          return;
        } else {
          this.loadDataField('General')
          this.alertService.showWarning("Some information was missing. There were problems with the following fields : Employee Name, DOB, Email, Mobile number, Father Name and Marital Status")
          return;
        }
      }



      if (this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == 3).PrimaryMobile.length != 10) {
        this.loadDataField('General')
        this.alertService.showWarning("Mobile Number should be min/max 10 characters")
        return;
      }

      if (this.RoleCode != 'Employee' && this.employeedetails.MaritalStatus != null
        && (this.employeedetails.MaritalStatus == 2 || this.employeedetails.MaritalStatus == 3) && this.employeedetails.MarriageDate == null) {
        this.loadDataField('General')
        this.alertService.showWarning("Since you have stated that you are an married, employee's wedding date must be provided. ");
        return;
      }

      if (this.employeedetails.EmployeeRatesets == null || this.employeedetails.EmployeeRatesets == undefined) {
        this.loadDataField('EmployementDetails')
        this.alertService.showWarning("Hold on! It seems you forgot to preview the employee CTC. Kindly take a moment to review and verify all details before submitting. ");
        return;
      }

      if (this.employeedetails.EmployeeRatesets != null && this.employeedetails.EmployeeRatesets.length == 0) {
        this.loadDataField('EmployementDetails')
        this.alertService.showWarning("Hold on! It seems you forgot to preview the employee CTC. Kindly take a moment to review and verify all details before submitting. ");
        return;
      }

      if (this.employeedetails.EmployeeRatesets != null &&
        (this.employeedetails.EmployeeRatesets.length > 0 &&
          !this.employeedetails.EmployeeRatesets[0].hasOwnProperty('RatesetProducts'))) {
        this.loadDataField('EmployementDetails')
        this.alertService.showWarning("Hold on! It seems you forgot to preview the employee CTC. Kindly take a moment to review and verify all details before submitting. ");
        return;
      }

      if (this.employeedetails.EmployeeRatesets != null &&
        (this.employeedetails.EmployeeRatesets.length > 0 &&
          this.employeedetails.EmployeeRatesets[0].hasOwnProperty('RatesetProducts')) &&
        this.employeedetails.EmployeeRatesets[0].RatesetProducts != null &&
        this.employeedetails.EmployeeRatesets[0].RatesetProducts.length == 0) {
        this.loadDataField('EmployementDetails')
        this.alertService.showWarning("Hold on! It seems you forgot to preview the employee CTC. Kindly take a moment to review and verify all details before submitting. ");
        return;
      }

      if (this.OfficialTabMaster_DynamicFieldDetails == null || this.isEmptyObject(this.OfficialTabMaster_DynamicFieldDetails)) {

        this.invaid_fields = [];
        this.ESSDynamicFields != null && this.ESSDynamicFields.ControlElemetsList.length > 0 && this.ESSDynamicFields.ControlElemetsList.forEach(a => {
          console.log(' a.Value', a.Value);

          if (a.Validators != null && a.Validators[0].Name == 'required' && a.Value == null) {
            this.invaid_fields.push(a.Label)
          }
          else {
            while (this.invaid_fields.indexOf(a.Label) !== -1) {
              delete this.invaid_fields[this.invaid_fields.indexOf(a.Label)];
            }
          }
        });

        if (this.invaid_fields.length > 0) {
          this.alertService.showWarning("Oops! In the Additional Details card, please fill out all essential fields.");
          return;
        }

      }



      this.invaid_fields = [];
      this.OfficialTabMaster_DynamicFieldDetails != null && this.OfficialTabMaster_DynamicFieldDetails.ControlElemetsList.length > 0 && this.OfficialTabMaster_DynamicFieldDetails.ControlElemetsList.forEach(a => {
        console.log(' a.Value', a.Value);

        if (a.Validators != null && a.Validators[0].Name == 'required' && a.Value == null) {
          this.invaid_fields.push(a.Label)
        }
        else {
          while (this.invaid_fields.indexOf(a.Label) !== -1) {
            delete this.invaid_fields[this.invaid_fields.indexOf(a.Label)];
          }
        }
      });

      if (this.invaid_fields.length > 0) {
        this.alertService.showWarning("Oops! In the Additional Details card, please fill out all essential fields.");
        return;
      }


      if (this.isAdditionalInfo) {
        let invaid_fields1 = [];
        const filteredValues = await this.requiredAdditionalColumnSettingValue
          .filter(setting => setting.DisplayRoleCodes.includes(this.currentRoleCode))
          .filter(setting => setting.EntityTypes.includes(this.currentEntityType))
          .filter(setting => setting.MandatoryRoleCodes.includes(this.currentRoleCode))

        console.log(filteredValues);

        if (!this.apiCallMade && this.isAdditionalInfo) {
          this.failedFieldsForAdditionalInformation = [];
          for (const prop of Object.keys(this.additionalColumns)) {
            if (this.additionalColumns[prop] == null || this.additionalColumns[prop] == 0 || this.additionalColumns[prop] == "") {
              this.failedFieldsForAdditionalInformation.push(prop);
            }
          }
        }

        if (this.apiCallMade && this.isAdditionalInfo) {
          this.failedFieldsForAdditionalInformation = [];
          for (const prop of Object.keys(this.additionalColumns)) {
            if (this.additionalColumns[prop] == null || this.additionalColumns[prop] == 0 || this.additionalColumns[prop] == "") {
              this.failedFieldsForAdditionalInformation.push(prop);
            }
          }
        }

        let invalidFieldFound = false;

        for (let i = 0; i < filteredValues.length; i++) {
          const e1 = filteredValues[i];

          if (this.failedFieldsForAdditionalInformation.find(a => a == e1.ColumnName) !== undefined) {
            invaid_fields1.push(this.failedFieldsForAdditionalInformation.find(a => a == e1.ColumnName));
            invalidFieldFound = true;
          }
        }

        if (invalidFieldFound) {
          this.loadDataField('OtherDetails')
          this.alertService.showWarning("Warning! Ensure you have entered information for all the required fields in the 'Extended Official' card");
          return;
        }
      }

      if (this.isTabShown.IsDocumentInfo && isSubmit && this.isDocumentsRequiredToUpload) {
        let candidateDocuments = this.employeedetails.CandidateDocuments;
        if (candidateDocuments.length === 0) {
          this.alertService.showWarning('Employee mandatory documents list is empty. Please upload required documents.');
          return;
        }
        let isConsultant: boolean = false;
        if (this.BusinessType == 1 && this.employeedetails.EmploymentContracts[0].ClientId == environment.environment.ACID) {

          isConsultant = this.employeedetails && this.employeedetails.EmploymentContracts != null && this.employeedetails.EmploymentContracts.length > 0 &&
            this.employeedetails.EmploymentContracts[0].EmploymentType != null && this.employeedetails.EmploymentContracts[0].EmploymentType > 0 && this.employeedetails.EmploymentContracts[0].EmploymentType == environment.environment.ConsultantEmploymentTypeId ? true : false;

        }


        for (const requiredDoc of this.RequiredDocumentTypes) {

          if (isConsultant && environment.environment.OtherMandatoryDocumentTypeForEmployee.includes(requiredDoc.DocumentTypeCode)) {
            return;
          }

          const matchingCandidateDoc = candidateDocuments.find(
            candidateDoc => candidateDoc.DocumentTypeId == requiredDoc.DocumentTypeId
          );

          if (!matchingCandidateDoc) {
            this.alertService.showWarning(`Warning! Ensure you have uploaded all the mandatory documents to the Documents card : ${requiredDoc.DocumentTypeName} is missing.`);
            return;
          }
        }

      }

    }

    if (!this.isESSLogin && this.employeedetails.Id > 0 && this.employeedetails.EmploymentContracts.length > 0 && (this.employeedetails.EmploymentContracts[0].ClientLocationId == 0 || this.employeedetails.EmploymentContracts[0].ClientLocationId == null || this.employeedetails.EmploymentContracts[0].WorkLocation == 0 as any || this.employeedetails.EmploymentContracts[0].WorkLocation == null)
    ) {
      this.alertService.showWarning("Note : Please choose the work location. Official Information :)")
      return;
    }


    this.employeedetails.DateOfBirth = moment(this.employeedetails.DateOfBirth).format('YYYY-MM-DD');

    if (this.employeedetails.Id == 0) {
      this.employeedetails.EmployeeRatesets[0].Modetype = UIMode.None;
    }

    if (this.employeedetails.DateOfBirth != null) {
      var birth = new Date(this.employeedetails.DateOfBirth).toLocaleDateString();
      var today = new Date();
      today = new Date(today);
      console.log('today', today);
      var years = moment(birth).diff(today, 'years');
      console.log('years', years.toString());;
      years = Math.abs(years)
      if (years.toString() < '18' || years.toString() == '0' || years < 18 || years == 0) {
        this.alertService.showWarning("Note : We require candidate to be 18 years old or over. Please confirm your DOJ/DOB")
        return;
      }
    }

    if (this.isAdditionalInfo) {

      // this.additionalColumns.MarriageDate != null ? this.employeedetails.MarriageDate = moment(this.additionalColumns.MarriageDate).format('YYYY-MM-DD') as any : true;
      // this.additionalColumns.Religion != null ? this.employeedetails.Religion = this.additionalColumns.Religion : true;

      if (this.onboardingAdditionalInfo.LstEmployeeDepartment != null &&
        this.onboardingAdditionalInfo.LstEmployeeDepartment.length > 0) {
        this.employeedetails.EmploymentContracts[0].Department =
          this.onboardingAdditionalInfo.LstEmployeeDepartment.find(a => a.Id == this.employeedetails.EmploymentContracts[0].DepartmentId) != undefined ? this.onboardingAdditionalInfo.LstEmployeeDepartment.find(a => a.Id == this.employeedetails.EmploymentContracts[0].DepartmentId).Name : "";
      }

      if (this.onboardingAdditionalInfo.LstJobProfile != null &&
        this.onboardingAdditionalInfo.LstJobProfile.length > 0) {
        this.employeedetails.EmploymentContracts[0].JobProfile =
          this.onboardingAdditionalInfo.LstJobProfile.find(a => a.Id == this.additionalColumns.JobProfile) != undefined ? this.onboardingAdditionalInfo.LstJobProfile.find(a => a.Id == this.additionalColumns.JobProfile).Name : "";
      }


      // this.additionalColumns.Department != null ? this.employeedetails.EmploymentContracts[0].DepartmentId = this.additionalColumns.Department == null ? 0 : this.additionalColumns.Department : true;

      // this.additionalColumns.Division != null ? this.employeedetails.EmploymentContracts[0].Division = this.additionalColumns.Division : true;
      this.employeedetails.EmploymentContracts[0].JobProfileId = (this.additionalColumns.JobProfile == null || this.additionalColumns.JobProfile == "" as any) ? 0 : this.additionalColumns.JobProfile;

      this.additionalColumns.SubEmploymentType != null ? this.employeedetails.EmploymentContracts[0].SubEmploymentType = this.additionalColumns.SubEmploymentType : true;
      // this.additionalColumns.Category != null ? this.employeedetails.EmploymentContracts[0].Category = this.additionalColumns.Category : true;
      this.additionalColumns.SubEmploymentCategory != null ? this.employeedetails.EmploymentContracts[0].SubEmploymentCategory = this.additionalColumns.SubEmploymentCategory : true;
      this.additionalColumns.Level != null ? this.employeedetails.EmploymentContracts[0].Level = this.additionalColumns.Level : true;
      this.additionalColumns.CostCityCenter != null ? this.employeedetails.EmploymentContracts[0].CostCityCenter = this.additionalColumns.CostCityCenter : true;

      this.additionalColumns.EmploymentZone != null ? this.employeedetails.EmploymentContracts[0].EmploymentZone = this.additionalColumns.EmploymentZone : true;
    }


    this.loadingScreenService.startLoading();
    //this.Customloadingspinner.show();



    // ADD EMPLOYEE - ACTIVITIES

    let isProofMode: boolean = false;
    if (this.InvestmetnListGrp != null && this.InvestmetnListGrp != undefined) {
      this.TaxDeclaration = this.InvestmetnListGrp.TaxDeclaration;
      this.ExemptionRateSetProducts = this.InvestmetnListGrp.ApplicableExemptionProducts;
      this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 && this.sessionService.setSesstionStorage('DefaultFinancialYearId', this.InvestmetnListGrp.FinancialDetails[0].Id);
      this.FinId = this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 ? this.InvestmetnListGrp.FinancialDetails[0].Id : 0;
      this.LstInvestmentSubmissionSlot = this.lstlookUpDetails.InvestmentSubmissionSlotList != null && this.lstlookUpDetails.InvestmentSubmissionSlotList.length > 0 ?
        this.lstlookUpDetails.InvestmentSubmissionSlotList : [];

      if (this.TaxDeclaration != 1) {
        isProofMode = true;
      } else {
        isProofMode = false;
      }
    }

    this.IsPriorDOJ = false;
    // if(this.TaxDeclaration == 1){
    //   this.CheckNewJoineeDeclaratinModeDOJ();

    // }
    // isProofMode && this.validateEmployeeInvestment().then((result) => {
    //   if (result != null && result[0].IsValid != true) {
    //     this.alertService.showWarning(result[0].Message);
    //     // this.Customloadingspinner.hide();
    //     this.Customloadingspinner.hide();
    //     return;
    //   } else {
    //     // this.Customloadingspinner.hide();
    //     this.Customloadingspinner.hide();
    //     this.finalSubmit(isProofMode, isSubmit)

    //   }

    // })
    this.finalSubmit(isProofMode, isSubmit);

    // !isProofMode && this.finalSubmit(isProofMode, isSubmit)


  }

  toenableSaveAndSubmitButton() {
    if ((this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) || (this.employeedetails.LstemployeeHouseRentDetails != null && this.employeedetails.LstemployeeHouseRentDetails.length > 0) ||
      (this.employeedetails.LstEmployeeHousePropertyDetails != null && this.employeedetails.LstEmployeeHousePropertyDetails.length) > 0 || (this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length) > 0) {
      if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
        this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
        this.employeedetails.LstemployeeHouseRentDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
        this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => this.FinId = a.FinancialYearId && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0
      ) {
        this.ispendingInvestmentExist = true;
      }
    }
  }

  validateEmployeeInvestment() {
    const promise = new Promise((res, rej) => {
      // this.loadingScreenService.startLoading();
      //this.loadingScreenService.startLoading();
      this.loadingScreenService.startLoading();
      // this.Customloadingspinner.show();
      this.employeeService.getValidateSubmitInvestmentProof(this.EmployeeId)
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

      if (isSubmit == true) {
        // if (this.employeedetails.FatherName == null || this.employeedetails.FatherName == '' || this.employeedetails.FatherName == "NULL") {
        //   this.employeedetails.FatherName = '.';
        // }
        if (this.employeedetails.Aadhaar == "NULL") {
          this.employeedetails.Aadhaar = null;
        }
        if (this.employeedetails.UAN == "NULL") {
          this.employeedetails.UAN = null;
        }
      }

      // this.submitted = true;
      if (isSubmit == true) {

        // this.findInvalidControls();
        if (this.employeedetails.Status == 0) {
          this.alertService.showWarning("The employee's status is inactive. It will not be possible to submit your investment information.");
          this.loadingScreenService.startLoading();
          //this.Customloadingspinner.hide();
          return;
        }
        this.employeedetails.Modetype = UIMode.None;

      }
      else {
        this.employeedetails.Modetype = UIMode.Edit;
      }
      // if (this.isESSLogin && this.employeedetails.EmploymentContracts[0].IsESICApplicable && this.employeedetails.ESIC == null || this.employeedetails.ESIC == '') {
      //   this.alertService.showWarning("General Tab : ESIC No is required");
      //   return;
      // }

      // if (!this.isESSLogin && this.employeedetails.EmploymentContracts[0].IsESICApplicable && this.employeedetails.ESIC == null || this.employeedetails.ESIC == '') {
      //   this.alertService.showWarning("General Tab : ESIC No is required");
      //   return;
      // }

      var SlotClosureDate: any = null;
      // if (isSubmit == true) {
      //   this.GetEmployeeTaxItem();

      //   this.essService.GetInvesementSlotSubmissionValidation(isSubmit, isProofMode, this.TaxDeclaration, this.LstInvestmentSubmissionSlot, this.employeedetails).then((res) => {
      //     if (res != false && res != null && res != undefined) {
      //       SlotClosureDate = res;
      //     } else {

      //     }
      //   })
      // }
      // this.toenableSaveAndSubmitButton();
      let ispendingInvestmentExist = false;

      if (!this.IsPriorDOJ && this.ispendingInvestmentExist == true && environment.environment.IsInvestmentSubmissionValidationRequiredForNonESS == true) {


        // this.validateEmployeeInvestment().then((result) => {
        //   console.log('result', result);

        //   if (result != null && result[0].IsValid != true) {
        //     this.alertService.showWarning(result[0].Message);
        //     this.loadingScreenService.stopLoading();
        //    // this.Customloadingspinner.hide();
        //     return;
        //   } else {
        //     SlotClosureDate = (result[0].result);
        this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, this.ispendingInvestmentExist);
        // <!--  ! : 16.2 for panasonic  -->
        // this.Customloadingspinner.hide();
        // <!--  ! : 16.2 for panasonic  -->
        // this.finalSubmit(isProofMode, isSubmit)

        //   }
        // });
        // return; 
        // this.essService.GetInvesementSlotSubmissionValidation(isSubmit, isProofMode, this.TaxDeclaration, this.LstInvestmentSubmissionSlot, this.employeedetails).then((res) => {
        //   if (res != false && res != null && res != undefined) {
        //     SlotClosureDate = res;
        //     this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, ispendingInvestmentExist);
        //   } else {
        //     this.Customloadingspinner.hide();
        //     return;
        //   }
        // })
      } else {
        this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, this.ispendingInvestmentExist);
        // <!--  ! : 16.2 for panasonic  -->
        // this.Customloadingspinner.hide();
        // <!--  ! : 16.2 for panasonic  -->

      }
      // if ((this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) || (this.employeedetails.LstemployeeHouseRentDetails != null && this.employeedetails.LstemployeeHouseRentDetails.length > 0) ||
      //   (this.employeedetails.LstEmployeeHousePropertyDetails != null && this.employeedetails.LstEmployeeHousePropertyDetails.length) > 0 || (this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length) > 0) {
      //   if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
      //     this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
      //     this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
      //     this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0
      //   ) {
      //     ispendingInvestmentExist = true;
      //   }
      // }

      // if (isSubmit == true && ispendingInvestmentExist == true) {
      //   this.essService.GetInvesementSlotSubmissionValidation(isSubmit, isProofMode, this.TaxDeclaration, this.LstInvestmentSubmissionSlot, this.employeedetails).then((res) => {
      //     if (res != false && res != null && res != undefined) {
      //       SlotClosureDate = res;
      //       this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, ispendingInvestmentExist);
      //     } else {
      //       SlotClosureDate = new Date();
      //       this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, ispendingInvestmentExist);
      //       // this.Customloadingspinner.hide();
      //       // return;
      //     }
      //   })
      // } else {
      //   this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, ispendingInvestmentExist)
      // }


    }
    catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      // this.Customloadingspinner.hide();
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }

  afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, ispendingInvestmentExist) {
    try {

      // let isRejectPendingCombined = false;
      // this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 && this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(element => {

      //   for (let h = 0; h < element.LstEmployeeExemptionBillDetails.length; h++) {
      //     if (this.FinId = element.FinancialYearId && element.LstEmployeeExemptionBillDetails[h].Status == 2 && element.LstEmployeeExemptionBillDetails.find(a => a.Status == 0) != undefined) {

      //       isRejectPendingCombined = true;
      //     }

      //   }
      // });

      // let isPendingPreviousEmploymentExists = false;
      // if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(b => b.FinancialYearId == this.FinId &&
      //   b.ApprovalStatus == 0)) {
      //   isPendingPreviousEmploymentExists = true;
      // }

      // let confirmationTxt = "";
      // if (isSubmit==true && isPendingPreviousEmploymentExists == true && isRejectPendingCombined == true as any) {
      //   confirmationTxt = "There are some rejected file(s) in your :) Exemptions Cart and some saved file(s) in your Previous employment";
      // }
      // else if (isSubmit==true &&  isPendingPreviousEmploymentExists == true && isRejectPendingCombined == false as any) {
      //   confirmationTxt = "There are some saved file(s) in your :) Previous Employment.";
      // } else if (isSubmit==true && isRejectPendingCombined == true as any && isPendingPreviousEmploymentExists == false) {
      //   confirmationTxt = "There are some rejected file(s) in your :) Exemptions Cart.";
      // } else {
      //   confirmationTxt = "";
      // }

      // if (isSubmit == true && confirmationTxt != "" as any) {
      //   this.alertService.confirmSwal1("Confirm Stage?", `${confirmationTxt}. Are you sure you want to submit?`, "Ok", "Cancel").then((result) => {
      //     if (isSubmit == true) {
      //       this.enableUploadPopup = true
      //       this.uploadFormPopup1(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist);
      //     }
      //     else {
      //       this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, 0);
      //     } return;
      //   }).catch(cancel => {
      //     // this.Customloadingspinner.hide();
      //     this.loadingScreenService.stopLoading();
      //     //this.Customloadingspinner.hide();
      //     return;
      //   });
      // }


      // if (confirmationTxt == "") {
      //   if (isSubmit == true) {
      //     this.enableUploadPopup = true
      //     this.uploadFormPopup1(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist);
      //   }
      //   else {
      //     this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, 0);
      //   }
      // }

      this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, 0);
    }
    catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      // this.Customloadingspinner.hide();
      this.loadingScreenService.stopLoading();
      // this.Customloadingspinner.hide();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }

  }


  uploadFormPopup1(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist) {
    // <!--  ! : 16.2 for panasonic  -->
    this.loadingScreenService.stopLoading();
    //this.Customloadingspinner.hide();
    // <!--  ! : 16.2 for panasonic  -->
    this._SlotClosureDate = SlotClosureDate
    this._isSubmit = isSubmit
    this._isProofMode = isProofMode
    this._ispendingInvestmentExist = ispendingInvestmentExist
    $("#popup_Form12BBUpload1").modal('show');
  }

  uploadFormPoppopClose1() {
    this._formSumbitStatus = false;
    this.FileName = null;
    $("#popup_Form12BBUpload1").modal('hide');
  }
  onFileUpload(e, isSubmit) {
    //this.spinnerText = "Uploading";
    //this.loadingScreenService.startLoading();
    // this.isLoading = false;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 5) {
        // this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');

        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        // this.spinnerText = "Uploading";

        this.FileName = file.name;
        this.FileUrl = (reader.result as string).split(",")[1];
        //this.fileUploadConfirmation(FileUrl,file.name);
        //this.doAsyncUpload(FileUrl, file.name)

      };
    }
  }

  doAsyncUpload(filebytes, filename, SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist) {
    try {
      //this.isLoading = false;
      this.loadingScreenService.startLoading();
      //this.Customloadingspinner.show();
      let objStorage = new ObjectStorageDetails();

      objStorage.Id = 0;
      objStorage.EmployeeId = this.EmployeeId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
      objStorage.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
      objStorage.CompanyId = this.employeedetails.EmploymentContracts[0].CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "EmpTransactions";

      console.log('objStorage', objStorage);

      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);


        try {
          if (apiResult.Status && apiResult.Result != "") {
            this.DocumentId = apiResult.Result;
            this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, this.DocumentId);
          }
          else {
            this.loadingScreenService.stopLoading();
            //this.Customloadingspinner.hide();
            //this.isLoading = true;
            this.FileName = null;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
            // this. uploadFormPopup();
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          //this.isLoading = true;
          this.FileName = null;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
          //this. popup_Form12BBUploadClose();
        }
      }), ((err) => {
      })
      console.log(objStorage);
    } catch (error) {
      //this.isLoading = true;
      this.FileName = null;
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      //this. popup_Form12BBUploadClose();
    }
  }



  confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, documentid) {
    try {
      //  ! : 16.2 for panasonic  -->
      // this.Customloadingspinner.hide();
      //this.loadingScreenService.startLoading();
      // this.Customloadingspinner.show();
      // this.Customloadingspinner.hide();
      // this.loadingScreenService.startLoading();
      //   ! : 16.2 for panasonic  -->

      if (this.employeedetails.PAN != null && this.employeedetails.PAN != '' && this.employeedetails.PAN != 'NULL') {
        let isValidPan = /[a-zA-Z]{3}[pPcCHhaAbBgGlLfFTtjJ]{1}[a-zA-Z]{1}[0-9]{4}[a-zA-Z]{1}$/.test(this.employeedetails.PAN);
        if (!isValidPan) {
          this.alertService.showWarning("PAN Number is invalid or Please match the requested format. (Ex: ABCPD1234E)");
          this.loadingScreenService.stopLoading();
          return;
        }
      }

      if (this.employeedetails.Aadhaar != null && this.employeedetails.Aadhaar != '' && this.employeedetails.Aadhaar != 'NULL') {
        let isnum = /^([0-9X]){12}?$/.test(this.employeedetails.Aadhaar);
        if (isnum == false) {
          this.alertService.showWarning("Aadhaar Number is invalid or Please match the requested format. (Ex: 1012 3456 7891)");
          this.loadingScreenService.stopLoading();
          return;
        }
      }

      if (isSubmit) {
        this.makerCheckerSubmission(isSubmit);
      } else {
        this.sumitEmployeeDetails("", isSubmit);
      }



    } catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }

  makerCheckerSubmission(isSubmit) {
    this.loadingScreenService.stopLoading();

    if (this.newEmployeeTransactionStatus == 2 && isSubmit) {
      this.loadingScreenService.startLoading();
      this.sumitEmployeeDetails("", isSubmit)
      return;
    }
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: "Are you sure you wish to submit the new employee request? Provide comments for your approver",
      animation: false,
      showCancelButton: true,
      input: 'textarea',
      inputValue: '',
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
        let jsonObj = inputValue;
        let jsonStr = jsonObj.value;
        this.loadingScreenService.startLoading();
        this.sumitEmployeeDetails(jsonStr, isSubmit)
      } else if (
        inputValue.dismiss === Swal.DismissReason.cancel

      ) {

      }
    })
  }

  sumitEmployeeDetails(remarks, isSubmit) {

    try {

      if (this.employeedetails.EmployeeRatesets != null && this.employeedetails.EmployeeRatesets.length > 0 &&
        this.employeedetails.EmploymentContracts != null && this.employeedetails.EmploymentContracts.length > 0 &&
        this.employeeModel != null && this.employeeModel != undefined && this.employeeModel.oldobj != null && this.employeeModel.oldobj != undefined &&
        this.employeeModel.oldobj.EmploymentContracts != null && this.employeeModel.oldobj.EmploymentContracts.length > 0 &&
        moment(this.employeeModel.oldobj.EmploymentContracts[0].StartDate).format('YYYY-MM-DD') != moment(this.employeedetails.EmploymentContracts[0].StartDate).format('YYYY-MM-DD') &&
        this.employeedetails.EmployeeRatesets.find(b => b.Status == 1) != undefined &&
        moment(this.employeeModel.oldobj.EmployeeRatesets.find(b => b.Status == 1).EffectiveDate).format('YYYY-MM-DD') != moment(this.employeedetails.EmploymentContracts[0].StartDate).format('YYYY-MM-DD')) {
        this.employeedetails.EmployeeRatesets.find(b => b.Status == 1).Modetype = UIMode.Edit;
        this.employeedetails.EmployeeRatesets.find(b => b.Status == 1).EffectiveDate = moment(this.employeedetails.EmploymentContracts[0].StartDate).format('YYYY-MM-DD')
      }

      //  ! : 16.2 for panasonic  -->

      if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0) {
        this.employeedetails.LstemploymentDetails.forEach(element => {
          element.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id
        });
      }

      // ONLY FOR POS AND SME - BANK WORKFLOW HAS BEEN SUSPENDED HERE
      // if (this.isESSLogin == false && this.BusinessType != 3 && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0 && this.employeedetails.lstEmployeeBankDetails.filter(a => a.Id == 0).length > 0) {
      //   this.employeedetails.lstEmployeeBankDetails.forEach(e => {

      //     if (e.Status == 0) {
      //       e.IsDefault = true;
      //       e.Status = 1;
      //       e.Modetype = UIMode.Edit;
      //     }
      //     else {
      //       e.IsDefault = false;
      //       e.Status = 1;
      //       e.Modetype = UIMode.Edit;
      //     }
      //   });
      // }
      // if verification mode is penny drop the bank details default status value has been updated 

      if (this.isESSLogin == true && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
        this.employeedetails.lstEmployeeBankDetails.forEach(e => {
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
      else if (this.isESSLogin == false && this.BusinessType == 3 && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried == false) {
        this.employeedetails.lstEmployeeBankDetails.forEach(e => {
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
        this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0 && this.employeedetails.lstEmployeeBankDetails.forEach(em => {
          if (em.VerificationMode == 2) {
            em.Status = 1
          }
        });
      }

      if (this.BusinessType != 3) {
        this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0 && this.employeedetails.lstEmployeeBankDetails.forEach(em => {
          if (em.VerificationMode == 2) {
            em.Status = 1
          }
        });

      }

      this.employeedetails.MarriageDate = this.employeedetails.MarriageDate != null ? this.employeedetails.MarriageDate : new Date('0001-01-01');

      // var employeeinvestmentMaster = new EmployeeInvestmentMaster();
      // employeeinvestmentMaster.PersonId = 0;
      // employeeinvestmentMaster.EmployeeId = this.EmployeeId;
      // employeeinvestmentMaster.FinancialYearId = this.FinId;
      // employeeinvestmentMaster.ModuleProcessTransactionId = 0;
      // employeeinvestmentMaster.SlotClosureDate = SlotClosureDate == null ? '1900-01-01' : SlotClosureDate;
      // employeeinvestmentMaster.Status = 0;
      // employeeinvestmentMaster.SummaryDocumentId = documentid
      // employeeinvestmentMaster.Id = this.employeedetails.EmployeeInvestmentMaster != null ? this.employeedetails.EmployeeInvestmentMaster.Id : 0;
      // isProofMode && isSubmit == true && ispendingInvestmentExist == true ? this.employeedetails.EmployeeInvestmentMaster = employeeinvestmentMaster : null;

      // this.employeedetails.EmployeeRatesets=this.rateSetDetails
      console.log('EMP DET UPSERT ::', this.employeedetails);
      // this.Customloadingspinner.hide();
      // this.Customloadingspinner.hide();

      // return;

      // ADD EMPLOYEE ACTIVITIES - DEFAULT VALUES

      if (this.employeedetails.Id == 0) {

        // PERSON


        var person = new Person();
        person.PrimaryMobile = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails
          && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0
          && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal).PrimaryMobile;
        person.PrimaryMobileCountryCode = "91";
        person.PrimaryEmail = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails
          && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0
          && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal).PrimaryEmail;
        person.FirstName = this.employeedetails.FirstName;
        person.FatherName = this.employeedetails.FatherName;
        person.DOB = this.employeedetails.DateOfBirth;
        this.employeedetails.PersonDetails != null && this.employeedetails.PersonDetails.Id > 0 ? true : this.employeedetails.PersonDetails = person;

        // EMPLOYEE DETAILS
        this.employeedetails.BloodGroup == null ? this.employeedetails.BloodGroup = 0 as any : true
        this.employeedetails.MaritalStatus == null ? this.employeedetails.MaritalStatus = 0 as any : true
        this.employeedetails.Gender == null ? this.employeedetails.Gender = 0 as any : true
        this.employeedetails.Nationality == null ? this.employeedetails.Nationality = 0 as any : true
        this.employeedetails.RelationshipId == null ? this.employeedetails.RelationshipId = 0 as any : true
        this.employeedetails.TransitionId == null ? this.employeedetails.TransitionId = 0 as any : true
        this.employeedetails.CountryOfOrigin == null ? this.employeedetails.CountryOfOrigin = environment.environment.DefaultCountryId_India as any : true

        // EMPLOYMENT CONTRACT 

        this.employeedetails.EmploymentContracts[0].NoticePeriodDays == null ? this.employeedetails.EmploymentContracts[0].NoticePeriodDays = 0 : true;
        this.employeedetails.EmploymentContracts[0].LastPaymentPeriodId == null ? this.employeedetails.EmploymentContracts[0].LastPaymentPeriodId = 0 : true;
        this.employeedetails.EmploymentContracts[0].ClientContactId == null ? this.employeedetails.EmploymentContracts[0].ClientContactId = 0 : true;
        this.employeedetails.EmploymentContracts[0].ClientLocationId == null ? this.employeedetails.EmploymentContracts[0].ClientLocationId = 0 : true;

        this.employeedetails.ActionName = isSubmit ? ActionName.submitEmployee : ActionName.saveEmployee;
        this.employeedetails.ActionType = ActionType.fullSave;

      }

      if (this.employeedetails.Religion == null || this.employeedetails.Religion == undefined) {
        this.employeedetails.Religion = 0;
      }

      if (this.doCheckAllenDigital()) {
        (this.employeedetails.EmploymentContracts.length > 0 && (this.employeedetails.EmploymentContracts[0].PFLogic == null || this.employeedetails.EmploymentContracts[0].PFLogic == "")) ?
          this.employeedetails.EmploymentContracts[0].PFLogic = this.DefaultPFLogicProductCode : true;
      }

      this.employeedetails.Remarks = remarks;

      this.employeedetails.BloodGroup = this.employeedetails.BloodGroup == null ? 0 : this.employeedetails.BloodGroup;
      this.employeedetails.MaritalStatus = this.employeedetails.MaritalStatus == null ? 0 : this.employeedetails.MaritalStatus;

      if (this.employeedetails.Id > 0 && this.IsMakerCheckerRequired) {
        this.employeedetails.ActionName = ActionName.updateEmployee;
        this.employeedetails.ActionType = ActionType.fullSave;
      }

      this.employeeModel.newobj = this.employeedetails;
      var Employee_request_param = JSON.stringify(this.employeeModel);
      console.log("this.employeeModel", Employee_request_param);
      // this.loadingScreenService.stopLoading();
      // return;
      // if (this.employeedetails.Id > 0) { -- commented when we got an add employee activity
      this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
        this.loadingScreenService.stopLoading();
        //this.Customloadingspinner.hide();
        //this.Customloadingspinner.hide();
        this.isDuplicateBankInfo = false;
        if (data.Status == false && data.Message == "Account number already exists") {
          this.isDuplicateBankInfo = true;
        }
        if (data.Status) {

          // if (this.employeedetails.Id == 0) {
          /* #region  dynamic field value  */

          var candidate_newObject: any = data.dynamicObject;
          var candidate_Id = candidate_newObject.newobj.Id as any;
          let LstdynamicFieldsValue = [];

          if (this.LstfieldValue != null && this.LstfieldValue.length > 0) {
            var dynamicFieldsValue = new DynamicFieldsValue();
            // dynamicFieldsValue.CandidateId = 0;
            dynamicFieldsValue.EmployeeId = candidate_Id as any;;
            dynamicFieldsValue.FieldValues = this.LstfieldValue;
            dynamicFieldsValue.Id = this.OfficialTabMaster_Dynamicfieldvalue != null && !this.isEmptyObject(this.OfficialTabMaster_Dynamicfieldvalue) ? this.OfficialTabMaster_Dynamicfieldvalue.Id : 0;
            LstdynamicFieldsValue.push(dynamicFieldsValue);
          }

          console.log('LstdynamicFieldsValue ::: ', LstdynamicFieldsValue);


          if (this.employeedetails.Id > 0 && LstdynamicFieldsValue.length > 0 && LstdynamicFieldsValue[0].Id > 0) {
            if (LstdynamicFieldsValue.length > 0) {
              this.onboardingService.UpsertDynamicFieldsValue(JSON.stringify(LstdynamicFieldsValue))
                .subscribe((rs) => {
                  console.log('DY RESPONSE :: ', rs);
                  this.OfficialTabMaster_DynamicFieldDetails = null;
                  this.OfficialTabMaster_Dynamicfieldvalue = null;
                })
            }
          }

          if (this.employeedetails.Id == 0 && LstdynamicFieldsValue.length > 0) {
            if (LstdynamicFieldsValue.length > 0) {
              this.onboardingService.UpsertDynamicFieldsValue(JSON.stringify(LstdynamicFieldsValue))
                .subscribe((rs) => {
                  console.log('DY RESPONSE :: ', rs);
                  this.OfficialTabMaster_DynamicFieldDetails = null;
                  this.OfficialTabMaster_Dynamicfieldvalue = null;
                })
            }
          }

          if (this.employeedetails.Id > 0 && this.OfficialTabMaster_Dynamicfieldvalue != null && LstdynamicFieldsValue.length > 0 && LstdynamicFieldsValue[0].Id == 0) {
            if (LstdynamicFieldsValue.length > 0) {
              this.onboardingService.UpsertDynamicFieldsValue(JSON.stringify(LstdynamicFieldsValue))
                .subscribe((rs) => {
                  console.log('DY RESPONSE 3:: ', rs);
                  this.OfficialTabMaster_DynamicFieldDetails = null;
                  this.OfficialTabMaster_Dynamicfieldvalue = null;
                })
            }
          }


          /* #endregion dynamic field value  */
          // }

          sessionStorage.removeItem('_StoreLstinvestment');
          sessionStorage.removeItem('_StoreLstDeductions');

          if (this.isESSLogin == true && this.employeedetails.lstEmployeeBankDetails.length > 0) {
            this.employeedetails.lstEmployeeBankDetails.forEach(e => {
              if (e.Status == 0) {
                data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
              }

            });
          }
          else if (this.isESSLogin == false && this.BusinessType == 3 && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
            this.employeedetails.lstEmployeeBankDetails.forEach(e => {
              if (e.Status == 0) {
                data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
              }
            });
          }
          else if (this.isESSLogin == false && this.BusinessType != 3 && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
            this.employeedetails.lstEmployeeBankDetails.forEach(e => {
              if (e.Status == 0) {
                data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
              }
            });
          }
          if (this.isESSLogin == true && data.dynamicObject.newobj.lstEmployeeBankDetails != null && data.dynamicObject.newobj.lstEmployeeBankDetails.length > 0 && data.dynamicObject.newobj.lstEmployeeBankDetails.find(a => a.Status == 0 && a.ModuleProcessTransactionId == 0) != undefined) {
            this.triggerWorkFlowProcess(data.dynamicObject.newobj);
          }
          else if (this.isESSLogin == false && data.dynamicObject.newobj.lstEmployeeBankDetails != null && data.dynamicObject.newobj.lstEmployeeBankDetails.length > 0 && data.dynamicObject.newobj.lstEmployeeBankDetails.find(a => a.Status == 0 && a.ModuleProcessTransactionId == 0) != undefined) {
            this.triggerWorkFlowProcess(data.dynamicObject.newobj);
          }
          // if (this.isESSLogin == true && isSubmit == true) { // when click on submit button then only the worflow will be triggering...
          //   if (isProofMode && ((this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) || (this.employeedetails.LstemployeeHouseRentDetails != null && this.employeedetails.LstemployeeHouseRentDetails.length > 0) ||
          //     (this.employeedetails.LstEmployeeHousePropertyDetails != null && this.employeedetails.LstEmployeeHousePropertyDetails.length) > 0 || (this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length) > 0) && this.TaxDeclaration != 1) {
          //     if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
          //       this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
          //       this.employeedetails.LstemployeeHouseRentDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
          //       this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a =>  this.FinId = a.FinancialYearId && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0
          //     ) {
          //       this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
          //     }

          //   }
          // }
          // else if (this.isESSLogin == false && isSubmit == true) {
          //   if (isProofMode && ((this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) || (this.employeedetails.LstemployeeHouseRentDetails != null && this.employeedetails.LstemployeeHouseRentDetails.length > 0) ||
          //     (this.employeedetails.LstEmployeeHousePropertyDetails != null && this.employeedetails.LstEmployeeHousePropertyDetails.length) > 0 || (this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length) > 0) && this.TaxDeclaration != 1) {
          //     if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
          //       this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
          //       this.employeedetails.LstemployeeHouseRentDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
          //       this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => this.FinId = a.FinancialYearId && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0) {
          //       this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
          //       this.uploadFormPoppopClose1();
          //     }
          //   }
          // }
          if (this.isESSLogin == false) {
            this.alertService.showSuccess(data.Message);

            if (this.approveOrRejectText == 'APPROVE' || this.approveOrRejectText == 'REJECT') {
              this.employeeRequestFinalSubmission('', (this.approveOrRejectText == 'APPROVE' ? true : false), data.dynamicObject.newobj.Id, data.dynamicObject.newobj.Code);
              return;
            }
            // if (isSubmit) {
            if (this.newEmployeeTransactionStatus == 0 || this.newEmployeeTransactionStatus == 1 || this.newEmployeeTransactionStatus == 3) {
              this.location.back();
              return;
            }
            else if (this.newEmployeeTransactionStatus == 2) {
              this.router.navigate(['/app/listing/ui/employeeRequest']);
              return;
            }
            // }
            if (this.employeedetails.Id == 0) {
              this.employeedetails = data.dynamicObject.newobj;
              this._EmployeeName = this.employeedetails.FirstName;
              this._EmployeeCode = this.employeedetails.Code;
              this.EmployeeId = this.employeedetails.Id;
              this.location.back();
            }
            this.doRefresh();
            this.uploadFormPoppopClose1();
            // this.router.navigate(['/app/listing/ui/employeelist']);
            return;
          }
          else if (this.isESSLogin == true) {
            this.alertService.showSuccess(data.Message);
            this.uploadFormPoppopClose1();
            this.doRefresh();
            return;
          }
          this.uploadFormPoppopClose1();
        }
        else {
          this.alertService.showWarning(data.Message);
        }
      },
        (err) => {
          // this.Customloadingspinner.hide();
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);
        });
      // } -- commented when we got an add employee activity

    } catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }


  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  triggerWorkFlowProcess(newObject: any) {
    if (newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit) != undefined) {

      let _editItem = newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit);
      if (_editItem.VerificationMode == 1 || _editItem.VerificationMode == 0) {
        this.callbankWorkflow(newObject);
      } else if (_editItem.VerificationMode == 2 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried) {
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
          // this.Customloadingspinner.hide();
          this.alertService.showSuccess(`Your employee has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');

        } else {
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');

        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        // this.Customloadingspinner.hide();
        this.alertService.showWarning(`An error occurred while trying to submission}!` + error);

      }


    }), ((error) => {

    });

  }


  triggerInvestmentWorkFlowProcess(newObject: any) {
    this.loadingScreenService.stopLoading();
    //this.Customloadingspinner.hide();

    var accessControl_submit = {
      AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
        : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
      ViewValue: null
    };

    var workFlowInitiation = new WorkFlowInitiation()
    workFlowInitiation.Remarks = "";
    workFlowInitiation.EntityId = newObject.EmployeeInvestmentMaster.Id;
    workFlowInitiation.EntityType = EntityType.EmployeeInvestmentMaster;
    workFlowInitiation.CompanyId = this.CompanyId;
    workFlowInitiation.ClientContractId = newObject.EmploymentContracts[0].ClientContractId;
    workFlowInitiation.ClientId = newObject.EmploymentContracts[0].ClientId;
    workFlowInitiation.ActionProcessingStatus = 29000; // BankDetailsRequestSubmitted
    workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
    workFlowInitiation.WorkFlowAction = 28;
    workFlowInitiation.RoleId = this.RoleId;
    workFlowInitiation.DependentObject = (newObject);
    workFlowInitiation.UserInterfaceControlLst = accessControl_submit;

    console.log('workFlowInitiation', workFlowInitiation);


    this.employeeService.post_InvestmentWorkFlow(JSON.stringify(workFlowInitiation)).subscribe((response) => {
      try {
        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
          this.router.navigate(['/app/listing/ui/employeelist'])
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          this.alertService.showSuccess(`Your employee has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');
        } else {
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');
          this.router.navigate(['/app/listing/ui/employeelist'])
        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        // this.Customloadingspinner.hide();
        this.alertService.showWarning(`An error occurred while trying to submission}!` + error);
        this.router.navigate(['/app/listing/ui/employeelist'])
      }


    }), ((error) => {

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
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        // const a = {};
        // const b = [];
        // const e = '';
        // for (var values in Object.values(_EmployeeDetails)) {

        //   if (typeof values === 'string') { 
        //     values = ''
        //   }
        //   if (typeof values === 'boolean') {

        //    }
        // }


        this.Reset();
        this.location.back();
        // this.router.navigate(['/app/listing/ui/employeelist']);

        // if (this.RoleCode.includes('HO_ITC') || this.RoleCode.includes('Branch_ITC') || this.RoleCode.includes('District_ITC')) {
        //   this.router.navigate(['/app/listing/ui/EmployeeDetailsITC']);
        // } else if (this.RoleCode.includes('Client')) {
        //   this.router.navigate(['/app/listing/ui/EmployeeClientList']);
        // } else {
        //   this.router.navigate(['/app/listing/ui/employeelist']);
        // }


      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })

  }
  Reset() {


    var employeeRateset = new EmployeeRateset();

    employeeRateset.Id = 0,
      employeeRateset.EmployeeId = 0,
      employeeRateset.EmployeeLifeCycleTransactionId = null,
      employeeRateset.PayGroupdId = null,
      employeeRateset.EffectiveDate = null,
      employeeRateset.IsMonthlyValue = false,
      employeeRateset.SalaryBreakUpType = null,
      employeeRateset.Salary = 0,
      employeeRateset.IsLatest = false,
      employeeRateset.RateSetData = null,
      employeeRateset.IsInsuranceApplicable = false,
      employeeRateset.InsuranceId = null,
      employeeRateset.MonthlySalary = 0,
      employeeRateset.AnnualSalary = 0,
      employeeRateset.InsuranceAmount = 0,
      employeeRateset.IsOveridable = false,
      employeeRateset.Status = 0,
      employeeRateset.RatesetProducts = [],
      employeeRateset.Modetype = 0,
      employeeRateset.EffectivePeriodId = null,
      employeeRateset.PaymentType = null,
      employeeRateset.WageType = null,
      employeeRateset.PayableRate = 0,
      employeeRateset.BillableRate = 0,
      employeeRateset.additionalApplicableProducts = null,
      employeeRateset.MinimumWagesApplicability = null

    var employmentContract = new EmploymentContract();
    employmentContract.Id = 0,
      employmentContract.CandidateId = 0,
      employmentContract.EmployeeId = 0,
      employmentContract.StartDate = null,
      employmentContract.EndDate = null,
      employmentContract.Status = 1,
      employmentContract.Designation = '',
      employmentContract.WorkLocation = '',
      employmentContract.StateId = null,
      employmentContract.CityId = null,
      employmentContract.CostCodeId = null,
      employmentContract.ClientContractId = null,
      employmentContract.ClientId = null,
      employmentContract.ClientLocationId = null,
      employmentContract.ClientContactId = null,
      employmentContract.IsNewTaxRegimeOpted = false,
      employmentContract.IsESICApplicable = false,
      employmentContract.IsResigned = false,
      employmentContract.PayCycleId = null,
      employmentContract.IsFirstMonthPayoutdone = false,
      employmentContract.LstRateSets = [employeeRateset],
      employmentContract.Modetype = 0,
      employmentContract.CompanyId = null,
      employmentContract.Department = null,
      employmentContract.Grade = '',
      employmentContract.ManagerId = null,
      employmentContract.TeamId = null,
      employmentContract.NoticePeriodDays = null,
      employmentContract.OpenPayPeriodId = null,
      employmentContract.LastPaymentPeriodId = null,
      employmentContract.LWD = null,
      employmentContract.EmploymentType = null,
      employmentContract.IsESSRequired = true,
      employmentContract.PFLogic = '',
      employmentContract.PFNumber = '',
      employmentContract.IsEmployeeDeductionApplicable = false,
      employmentContract.IsExemptionDeclarationApplicable = false,
      employmentContract.ResignationDate = null,
      employmentContract.PON = '',
      employmentContract.LeaveGroupId = null
    employmentContract.JobProfile = '',
      employmentContract.DesignationId = null,
      employmentContract.SubEmploymentType = null,
      employmentContract.Division = null,
      employmentContract.Category = null,
      employmentContract.SubEmploymentCategory = null,
      employmentContract.Level = null,
      employmentContract.JobProfileId = null,
      employmentContract.EmploymentZone = null,
      employmentContract.CostCityCenter = null




    var addressDetails = new Addressdetails();
    addressDetails.CommunicationCategoryTypeId = 0,
      addressDetails.CountryName = null,
      addressDetails.StateName = null,
      addressDetails.City = null,
      addressDetails.DistrictName = null,
      addressDetails.Address1 = '',
      addressDetails.Address2 = '',
      addressDetails.Address3 = '',
      addressDetails.PinCode = '',
      addressDetails.CountryId = 0,
      addressDetails.CityId = 0,
      addressDetails.StateId = 0,
      addressDetails.DistrictId = 0

    var contactDetails = new ContactDetails();
    contactDetails.CommunicationCategoryTypeId = 3,
      contactDetails.PrimaryMobile = null,
      contactDetails.PrimaryMobileCountryCode = null,
      contactDetails.AlternateMobile = null,
      contactDetails.AlternateMobileCountryCode = null,
      contactDetails.PrimaryEmail = null,
      contactDetails.AlternateEmail = null,
      contactDetails.EmergencyContactNo = null,
      contactDetails.EmergencyContactNoCountryCode = null,
      contactDetails.EmergencyContactPersonName = null,
      contactDetails.LandlineStd = null,
      contactDetails.LandLine = null,
      contactDetails.LandLineExtension = null,
      contactDetails.PrimaryFax = null,
      contactDetails.AlternateFax = null,
      contactDetails.IsDefault = false

    var employeeCommunication = new EmployeeCommunicationDetail();
    employeeCommunication.Id = 0,
      employeeCommunication.EmployeeId = 0,
      employeeCommunication.LstAddressdetails = [addressDetails, addressDetails],
      employeeCommunication.LstContactDetails = [contactDetails],
      employeeCommunication.Modetype = 0

    _EmployeeDetails.Id = 0,
      _EmployeeDetails.FirstName = '',
      _EmployeeDetails.LastName = '',
      _EmployeeDetails.PhotoStorage = '',
      _EmployeeDetails.DateOfBirth = null,
      _EmployeeDetails.Gender = null,
      _EmployeeDetails.Nationality = 1,
      _EmployeeDetails.CountryOfOrigin = null,
      _EmployeeDetails.MaritalStatus = null,
      _EmployeeDetails.BloodGroup = null,
      _EmployeeDetails.IsDifferentlyabled = false,
      _EmployeeDetails.DisabilityPercentage = 0,
      _EmployeeDetails.Status = 1,
      _EmployeeDetails.CandidateId = 0,
      _EmployeeDetails.PersonId = 0,
      _EmployeeDetails.Code = '',
      _EmployeeDetails.ClientEmployeeCode = '',
      _EmployeeDetails.TransitionId = null,
      _EmployeeDetails.EmployeeObjectData = null,
      _EmployeeDetails.ELCTransactions = [],
      _EmployeeDetails.EmpFamilyDtls = [],
      _EmployeeDetails.Modetype = 2,
      _EmployeeDetails.PersonDetails = null,
      _EmployeeDetails.lstEmployeeBankDetails = [],
      _EmployeeDetails.EmploymentContracts = [employmentContract],
      _EmployeeDetails.CandidateDocuments = [],
      _EmployeeDetails.LstEmployeeHousePropertyDetails = [],
      _EmployeeDetails.LstemployeeHouseRentDetails = [],
      _EmployeeDetails.LstemployeeInvestmentDeductions = [],
      _EmployeeDetails.LstemployeeOtherIncomeSources = [],
      _EmployeeDetails.LstemploymentDetails = [],
      _EmployeeDetails.FatherName = '',
      _EmployeeDetails.PAN = null,
      _EmployeeDetails.UAN = null,
      _EmployeeDetails.ESIC = null,
      _EmployeeDetails.Aadhaar = null,
      _EmployeeDetails.EmployeeCommunicationDetails = employeeCommunication,
      _EmployeeDetails.LstEmployeeLetterTransactions = [],
      _EmployeeDetails.Qualifications = [],
      _EmployeeDetails.WorkExperiences = [],
      _EmployeeDetails.EmployeeInvestmentMaster = null,
      _EmployeeDetails.LstEmployeeTaxExemptionDetails = [],
      _EmployeeDetails.EmployeeRatesets = [],
      _EmployeeDetails.RelationshipName = '',
      _EmployeeDetails.RelationshipId = 1,
      _EmployeeDetails.employeePayrollSummaryDetails = [],
      _EmployeeDetails.LstemployeePerquisitesDetails = [],
      _EmployeeDetails.MarriageDate = null,
      _EmployeeDetails.Religion = null,
      _EmployeeDetails.ActionName = ActionName.saveEmployee,
      _EmployeeDetails.ActionType = ActionType.fullSave


    console.log('_EmployeeDetails', _EmployeeDetails);

  }

  // Reset() {

  //   Object.prototype.reset = function() {
  //     for (var i in this) {
  //       if (typeof this[i] != 'function') {
  //         if (i == 'type') {
  //           i = this[i];
  //         } else {
  //           this[i] = 0;
  //         }
  //       }
  //     }
  //   }


  //   for (var property in this.employeedetails) {
  //     console.log(property); // Outputs: foo, fiz or fiz, foo
  //   }

  //   PropertyInfo[] properties = type.GetProperties();
  //   for (int i = 0; i < properties.Length; ++i) {
  //     //if dictionary has property name, use it to set the property
  //     properties[i].SetValue(this, _propertyValues.ContainsKey(properties[i].Name) ? _propertyValues[properties[i].Name] : null);
  //   }
  // }

  // FORM 12BB

  preview12BBForm(status) {

    // if (this.activeTabName == 'isInvestmentInfo') {
    //   $("#popup_Form12BBUpload1").modal('hide');
    //   this.myinvestment.preview12BBForm(status);
    //   return;
    //   // this.Lstinvestment = OtherRecords._inv;
    //   // this.Lstdeduction_Exemption = OtherRecords._ded;
    //   // this.dynamicExeptions = OtherRecords._exem;
    // }
    if (this.activeTabName == 'isInvestmentInfo') {

      this.myinvestment.subscribeEmitter();
    }

    if (this.activeTabName == 'isInvestmentInfo') {
      this.myinvestment.subscribeEmitter();
    }

    let HPDID = environment.environment.HousePropertyDetails_Static.find(item => item.ProductCode == "HPD").ProductId

    if (this.employeedetails && this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails && this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails.length > 0) {
      let _empcommunicationDet = this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails.find(x => (x.CommunicationCategoryTypeId == CommunicationCategoryType.Official || x.CommunicationCategoryTypeId == CommunicationCategoryType.Present || x.CommunicationCategoryTypeId == CommunicationCategoryType.Personal))
      if (_empcommunicationDet)
        this._empAddress = `${_empcommunicationDet.Address1},${_empcommunicationDet.Address2}`
    }
    this._rowSpan = 7;
    this.ltaRowspan = 1;




    this._otherSec = []
    this.uploadFormPoppopClose1()

    this._financialYear = this.InvestmetnListGrp && this.InvestmetnListGrp.FinancialDetails.length > 0 && this.InvestmetnListGrp.FinancialDetails[0].FinancialCode ? this.InvestmetnListGrp.FinancialDetails[0].FinancialCode : 0


    this._totalHraRent = 0
    this._hraDetails = {}
    if (this.Lstdeduction_Exemption && this.Lstdeduction_Exemption.length > 0) {
      this._hraDetails = this.Lstdeduction_Exemption.find(a => (a.ProductId == environment.environment.HRA_DynamicProductId));
      //if(document exists && if any document whose in (approved or pending)){
      if (this._hraDetails && this._hraDetails.DocumentDetails && this._hraDetails.DocumentDetails.length > 0) {
        let isApprovedExists: boolean = this._hraDetails.DocumentDetails.find(x => x.Status == 0 || x.Status == 1) != null ? true : false;
        if (isApprovedExists) {
          for (let obj of this._hraDetails.AdditionalList) {
            this._totalHraRent += obj.RentAmountPaid
          }
        }
      }

    }


    this._hpDetails = {
      InterestPaid: 0,
      NameOfLender: "",
      addressOfLender: "",
      PANofLender: ""
    }
    if (this.Lstdeduction_Exemption && this.Lstdeduction_Exemption.length > 0) {
      for (let deduObj of this.Lstdeduction_Exemption) {
        if (deduObj && (deduObj.ProductId != HPDID && deduObj.ProductId != environment.environment.HRA_DynamicProductId) && (deduObj && deduObj.DocumentDetails && deduObj.DocumentDetails.length > 0)) {
          if (deduObj && deduObj.DocumentDetails && deduObj.DocumentDetails.length > 0) {
            for (let docObj of deduObj.DocumentDetails) {
              if (docObj && (docObj.Status == 0 || docObj.Status == 1)) {
                this._otherSec.push(deduObj)
                break;
              }
            }
          }
          else {
            this._otherSec.push(deduObj)
          }

        }
      }

      let hplistOfDet = _.filter(this.Lstdeduction_Exemption, item => item.ProductId == HPDID);

      for (let obj of hplistOfDet) {

        if (obj && obj.DocumentDetails && obj.DocumentDetails.length > 0) {
          if (obj.AdditionalDetailsObject) {
            this._hpDetails.InterestPaid += obj.AdditionalDetailsObject.InterestPaid
            this._hpDetails.NameOfLender += ` | ${obj.AdditionalDetailsObject.NameOfLender}`
            this._hpDetails.addressOfLender += ` | ${obj.AdditionalDetailsObject.addressOfLender}`
            this._hpDetails.PANofLender += ` | ${obj.AdditionalDetailsObject.PANofLender}`
          }
        }
      }
      this._hpDetails.NameOfLender = this._hpDetails.NameOfLender == "" ? "" : this._hpDetails.NameOfLender.substring(3);
      this._hpDetails.addressOfLender = this._hpDetails.addressOfLender == "" ? "" : this._hpDetails.addressOfLender.substring(3);
      this._hpDetails.PANofLender = this._hpDetails.PANofLender = "" ? "" : this._hpDetails.PANofLender.substring(3);
    }
    this.exceptionList = []
    if (this.dynamicExeptions && this.dynamicExeptions.length > 0) {

      let ltaList = this.dynamicExeptions //_.filter(this.dynamicExeptions, item => item.ProductId == 8 && item.LstEmployeeExemptionBillDetails[0].Status != 2);
      for (let ltaObj of ltaList) {
        let exception = {
          Name: "",
          amount: 0
        }
        exception.Name = ltaObj.ProductName
        exception.amount = ltaObj.Amount
        this.exceptionList.push(exception)
      }
      if (this.exceptionList && this.exceptionList.length > 0) {
        for (let obj of this.exceptionList) {
          this.ltaRowspan += 1;
        }

      }


    }

    this._form12BBDate = moment(new Date()).format('DD/MM/YYYY');
    this._section80C = []
    this._section80Ccc = []
    this._section80CcD = []
    this._otherSecDetails = []
    if (this.dynamicPFInvestments && this.dynamicPFInvestments.length > 0) {
      for (let obj of this.dynamicPFInvestments) {
        this._rowSpan += 1;
        this._section80C.push(obj)
      }

    }
    if (this.Lstinvestment && this.Lstinvestment.length > 0) {

      let grouped80c: any = []
      let finalArray = [];
      grouped80c = _.filter(this.Lstinvestment, item => item.Section == 'Sec80C');
      if (grouped80c && grouped80c.length > 0) {
        for (let obj of grouped80c) {
          if (obj && obj.DocumentDetails && obj.DocumentDetails.length > 0) {
            for (let docObj of obj.DocumentDetails) {
              if (docObj && (docObj.Status == 0 || docObj.Status == 1)) {
                finalArray.push(obj)
                break;
              }
            }
          }
          else {
            finalArray.push(obj)
          }
        }
      }

      let groupedData = _.chain(finalArray).groupBy("ProductId").value()

      let values = Object.values(groupedData)
      console.log(values);

      for (let obj of values) {

        if (obj && obj.length == 1) {
          this._section80C.push(obj[0])
        }
        else if (obj && obj.length > 0) {
          let sum = 0
          let sec80Cobj = {
            AmtInvested: 0,
            Name: ""
          }
          for (let item of obj) {
            sec80Cobj.Name = item.Name
            sum += parseFloat(item.AmtInvested)

          }
          sec80Cobj.AmtInvested = sum
          this._section80C.push(sec80Cobj)
        }
      }
      if (this._section80C && this._section80C.length > 0) {
        for (let obj of this._section80C) {
          this._rowSpan += 1;
        }

      }


      console.log("this._section80C", this._section80C)
    }
    if (this.Lstinvestment && this.Lstinvestment.length > 0) {
      let grouped80Ccc: any = []
      let finalArray = [];
      grouped80Ccc = _.filter(this.Lstinvestment, item => item.Section == 'Sec80CCC');
      if (grouped80Ccc && grouped80Ccc.length > 0) {
        for (let obj of grouped80Ccc) {
          if (obj && obj.DocumentDetails && obj.DocumentDetails.length > 0) {
            for (let docObj of obj.DocumentDetails) {
              if (docObj && (docObj.Status == 0 || docObj.Status == 1)) {
                finalArray.push(obj)
                break;
              }
            }
          }
          else {
            finalArray.push(obj)
          }
        }
      }

      let grouped80cccData = _.chain(finalArray).groupBy("ProductId").value()

      let values80ccc = Object.values(grouped80cccData)
      console.log(values80ccc);

      for (let obj of values80ccc) {

        if (obj && obj.length == 1) {
          this._section80Ccc.push(obj[0])
        }
        else if (obj && obj.length > 0) {
          let sum = 0
          let sec80Cccobj = {
            AmtInvested: 0,
            Name: ""
          }
          for (let item of obj) {
            sec80Cccobj.Name = item.Name
            sum += parseFloat(item.AmtInvested)

          }
          sec80Cccobj.AmtInvested = sum
          this._section80Ccc.push(sec80Cccobj)
        }
      }
      if (this._section80Ccc && this._section80Ccc.length > 0) {
        this._rowSpan += 1;
      }

      console.log("this._section80Ccc", this._section80Ccc)
    };


    if (this.Lstinvestment && this.Lstinvestment.length > 0) {

      let grouped80Ccd: any = [];
      let finalArray = [];
      // grouped80Ccd = _.filter(this.Lstinvestment, item => (item.Section == 'Sec80CCD' && item.DocumentDetails[0].Status != 2) || (item.Section == '80 CCD(1B)' && item.DocumentDetails[0].Status != 2));
      grouped80Ccd = _.filter(this.Lstinvestment, item => (item.Section == 'Sec80CCD' || item.Section == '80 CCD(1B)'));
      if (grouped80Ccd && grouped80Ccd.length > 0) {
        for (let obj of grouped80Ccd) {
          if (obj && obj.DocumentDetails && obj.DocumentDetails.length > 0) {
            for (let docObj of obj.DocumentDetails) {
              if (docObj && (docObj.Status == 0 || docObj.Status == 1)) {
                finalArray.push(obj)
                break;
              }
            }
          }
          else {
            finalArray.push(obj)
          }
        }
      }
      let grouped80ccdData = _.chain(finalArray).groupBy("ProductId").value()

      let values80ccd = Object.values(grouped80ccdData)
      console.log(values80ccd);

      for (let obj of values80ccd) {

        if (obj && obj.length == 1) {
          this._section80CcD.push(obj[0])
        }
        else if (obj && obj.length > 0) {
          let sum = 0
          let sec80Ccdobj = {
            AmtInvested: 0,
            Name: ""
          }
          for (let item of obj) {
            sec80Ccdobj.Name = item.Name
            sum += parseFloat(item.AmtInvested)

          }
          sec80Ccdobj.AmtInvested = sum
          this._section80CcD.push(sec80Ccdobj)
        }
      }
      if (this._section80CcD && this._section80CcD.length > 0) {
        for (let obj of this._section80CcD) {
          this._rowSpan += 1;
        }

      }
      console.log("this._section80CcD", this._section80CcD)
    }




    /**push all othersection  from investments */


    if (this.Lstinvestment && this.Lstinvestment.length > 0) {
      let othSec = _.filter(this.Lstinvestment, item => item.Section !== 'Sec80C' && item.Section !== '80 CCD(1B)' && item.Section !== 'Sec80CCC' && item.Section !== 'Sec80CCD');
      if (othSec && othSec.length > 0) {
        for (let obj of othSec) {
          if (obj && obj.DocumentDetails && obj.DocumentDetails.length > 0) {
            for (let docObj of obj.DocumentDetails) {
              if (docObj && (docObj.Status == 0 || docObj.Status == 1)) {
                this._otherSec.push(obj)
                break;
              }
            }
          }
          else {
            this._otherSec.push(obj)
          }
        }
      }
    }

    if (this._otherSec && this._otherSec.length > 0) {
      let groupedOtherSecData = _.chain(this._otherSec).groupBy("ProductId").value()
      let valuesOtherSec = Object.values(groupedOtherSecData)
      console.log(valuesOtherSec);

      for (let obj of valuesOtherSec) {

        if (obj && obj.length == 1) {
          let secOther = {
            AmtInvested: obj[0].AmtInvested,
            Name: `${obj[0].Name} (${obj[0].Section})`
          }
          this._otherSecDetails.push(secOther)
        }
        else if (obj && obj.length > 0) {
          let sum = 0
          let secOther = {
            AmtInvested: 0,
            Name: ""
          }
          for (let item of obj) {
            secOther.Name = `${item.Name} (${item.Section})`
            sum += parseFloat(item.AmtInvested)

          }
          secOther.AmtInvested = sum
          this._otherSecDetails.push(secOther)
        }
      }

      if (this._otherSecDetails && this._otherSecDetails.length > 0) {
        for (let obj of this._otherSecDetails) {
          this._rowSpan += 1;
        }

      }
      console.log("this._otherSecDetails", this._otherSecDetails)

    }

    console.log("_section80C", this._section80C)
    console.log("Lstinvestment", this.Lstinvestment)
    $("#popup_Form12BBUpload2").modal('show');
    console.log("rowspan value", this._rowSpan);
  }

  preview12BBClose1() {
    if (this.enableUploadPopup) {
      $("#popup_Form12BBUpload2").modal('hide');
      $("#popup_Form12BBUpload1").modal('show');

    }
    else {
      $("#popup_Form12BBUpload2").modal('hide');
    }
    this.enableUploadPopup = false;
  }

  fileUploadConfirmation1(filebytes, filename, SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to submit ?',
      // text: "Once deleted, you cannot undo this action.",
      type: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {

      if (result.value) {

        if (this.FileName) {
          // if(true){
          this.doAsyncUpload(filebytes, filename, SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist);

        }
        else {
          this.FileName = null;
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        );
        this.FileName = null;
        this._formSumbitStatus = false;
      }
    })
  }

  download12BB() {
    this.loadingScreenService.startLoading();
    //this.Customloadingspinner.show();
    this.fileuploadService.downloadObjectAsBlob(this.summaryDocumentId)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          return;
        }
        saveAs(res, `${this.employeedetails.Code}_Form12BB`);
        this.loadingScreenService.stopLoading();
        //this.Customloadingspinner.hide();
      });
  }


  form12BBDownload() {
    var data = document.getElementById('printid1');
    const options = {
      margin: [30, 30, 30, 30],
      filename: "form_12bb.pdf",
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: {},
      jsPDF: { unit: 'pt', format: 'a4', orientation: "portrait" }
    }
    const content: Element = document.getElementById('printid1');

    html2pdf().from(content).set(options).then(function (doc) {
      // $("#printid1").css( { "font-size":"12px !important" });

    }).save();
  }
  doDeleteFile1() {
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

        if (this.DocumentId) {
          // if(true){
          console.log("delete file not working")

        }
        else {
          this.FileName = null;
          this.FileUrl = null;
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

  async getEmployeeConfiguration(clientContractId: number) {
    try {

      const data = await this.essService.GetEmployeeConfiguration(clientContractId, EntityType.Employee, this.employeedetails.Id == 0 ? 'Add' : 'Update').toPromise();
      console.log('CONFI', data);

      if (data.Status) {
        let AccessControlConfiguration = data.Result && data.Result.AccessControlConfiguration;
        console.log('Access Control Configuration :: ', AccessControlConfiguration);
        this.IsMakerCheckerRequired = AccessControlConfiguration.IsMakerCheckerRequired;
        this.RequiredDocumentTypes = AccessControlConfiguration.RequiredDocumentTypes;
        this.isDocumentsRequiredToUpload = AccessControlConfiguration.isDocumentsRequiredToUpload;
        this.NotAccessibleFields = JSON.parse(AccessControlConfiguration.NotAccessibleFields);
        this.AccessibleButtons = JSON.parse(AccessControlConfiguration.AccessibleButtons);
        this.DefaultPFLogicProductCode = AccessControlConfiguration.DefaultPFLogicProductCode;
        if (AccessControlConfiguration.DefaultRuleIdForPFWages != null) {
          const correctedResponse = AccessControlConfiguration.DefaultRuleIdForPFWages.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
          this.DefaultRuleIdForPFWages = JSON.parse(correctedResponse)
        }

      }
      this.loadingScreenService.stopLoading();
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(error);
    }
  }


  async doApproveReject(isApprove) {
    this.approveOrRejectText = isApprove ? 'APPROVE' : 'REJECT';
    if (!isApprove) {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: "Are you sure you wish to reject the new employee request? Please provide a rejection reason.",
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputValue: '',
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
          let jsonObj = inputValue;
          let jsonStr = jsonObj.value;
          this.loadingScreenService.startLoading();
          this.employeeRequestFinalSubmission(jsonStr, isApprove, 0)
        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
          $("#modal_employeepreview_aside_left").modal('show');
        }
      })
    }
    else {
      await this.doSaveOrSubmit(isApprove);
    }

  }

  employeeRequestFinalSubmission(remarks: string = '', isApprove, empId, empCode: string = "") {
    const empApprovalData = {
      "Comments": remarks,
      "MCTransactionId": this.employeedetails.MakerCheckerTransactionId,
      "Status": isApprove ? 'APPROVE' : 'REJECT',
      "EmployeeId": empId

    }
    console.log('PYD #0034 ::', empApprovalData);
    this.loadingScreenService.startLoading()
    this.employeeService.ValidateEmployeeRequestApprovalByHR(JSON.stringify(empApprovalData)).subscribe((result) => {
      let apiR: apiResult = result;
      this.loadingScreenService.stopLoading();
      if (apiR.Status) {
        this.alertService.showSuccess('The verification process for the new employee has been successfully completed. For your reference, Employee Code: ' + empCode);
        this.location.back();
        return;
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiR.Message);
        this.location.back();
        return;
      }
    })
  }

  doCheckAllenDigital() {

    return this.BusinessType == 1 && Number(environment.environment.ACID) == Number(this.employeedetails.EmploymentContracts[0].ClientId) ? true : false;

  }

  ngOnDestroy() {
    sessionStorage.removeItem('essEmpName');
  }


}
