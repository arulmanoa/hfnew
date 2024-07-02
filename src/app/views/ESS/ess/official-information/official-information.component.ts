import { Component, OnInit, EventEmitter, AfterViewInit, Input, Output, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import * as moment from 'moment';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { LoginResponses } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { AlertService, ClientService, EmployeeService, OnboardingService, PagelayoutService, ProductService, SessionStorage } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ESSService } from 'src/app/_services/service/ess.service';
import { PaymentType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { ClientContractList, OnEmploymentInfo, OnboardingAdditionalInfo } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { ClientLocationList, IndustryList, OfferInfo, PayGroupList, ZoneList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { CostCodeList, LeaveGroupList, ManagerList, MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ControlElement } from 'src/app/views/generic-form/form-models';
import { DynamicFieldDetails, DynamicFieldsValue, FieldValues } from 'src/app/_services/model/OnBoarding/DynamicFIeldDetails';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { ClientList } from 'src/app/_services/model/ClientLocationAllList';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import { EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { ELCTRANSACTIONTYPE } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { AdditionalPaymentProducts, RateType } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { PaygroupProductOverrides } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { environment } from 'src/environments/environment';
import { DynamicfieldformComponent } from 'src/app/views/generic-form/dynamicfieldform/dynamicfieldform.component';
import { EmploymentContract } from 'src/app/_services/model/Employee/EmployementContract';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SalarybreakupmodalComponent } from 'src/app/views/ESS/shared/salarybreakupmodal/salarybreakupmodal.component';
import { CookieService } from 'ngx-cookie-service';
import { apiResponse } from '@services/model/apiResponse';


@Component({
  selector: 'app-official-information',
  templateUrl: './official-information.component.html',
  styleUrls: ['./official-information.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,


})
export class OfficialInformationComponent implements OnInit {

  @ViewChild('validateChildComponentForm') private DynamicfieldformComponent: DynamicfieldformComponent;

  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() OfferInfoListGrp: OnEmploymentInfo;
  @Input() OfficialTabMaster_MigrationInfoGrp: MigrationInfo;
  @Input() OfficialTabMaster_OfferSkillZoneInfo: OfferInfo;
  @Output() officialChangeHandler = new EventEmitter();
  @Output() toggle = new EventEmitter<Object>();
  @Input() onboardingAdditionalInfo: OnboardingAdditionalInfo;
  @Input() NotAccessibleFields = [];
  @Input() DefaultRuleIdForPFWages = [];
  @Input() DefaultPFLogicProductCode: string = "";
  // ** forms on submit validation ** //
  submitted: boolean = false;
  disableBtn: boolean = false;
  spinner: boolean = true;

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
  employeeModel: EmployeeModel = new EmployeeModel();

  // EMPLOYMENT

  isESICapplicable: boolean = false;
  IsESICApplicableForKeyIn: boolean = false;
  ClientLocationList: ClientLocationList[] = [];
  ClientReportingLocationList: ClientLocationList[] = [];
  ClientCityList: any[] = [];
  ClientContractList: ClientContractList[] = [];
  ClientList: any[] = [];
  TeamList: any;
  EmploymentTypeList: any[] = [];
  DesignationList: any[] = [];

  ManagerList: ManagerList[] = [];
  LeaveGroupList: LeaveGroupList[] = [];
  CostCodeList: CostCodeList[] = [];
  NoticePeriodDaysList: any[] = [];
  MigrationInfoGrp: MigrationInfo;
  PayCycleDetails: any;
  StateList2: any[] = [];
  CountryList: any[] = [];

  Current_RateSetList: any = [];
  EffectiveDate_POP: Date = new Date();
  AnnualSalary_POP: number = 0;
  MenuId: any;

  DynamicFieldDetails: DynamicFieldDetails = null;
  Dynamicfieldvalue: DynamicFieldsValue = null;

  ngselectLoader: boolean = false;

  //PREVIEW CTC 
  New_RateSetList: any[] = [];

  isRecalculate: boolean = true;
  IsRateSetValue: boolean = false;
  isMinimumwageAdhered: boolean = false;
  isDailyOrHourlyWages: boolean = false;

  NewELCTransaction: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();

  additionalApplicableProducts: AdditionalPaymentProducts = null;
  baseDaysForAddlApplicableProduct: number = 0;
  baseHoursForAddlApplicableProduct: number = 1;
  showDailyOrHourlyWageTable: boolean = false;
  wageType: string = '';
  isOverrideMonthlyValue: boolean = false;
  minimumWagesApplicableProductsList: any[] = [];
  Label_PFLogic: string = '';
  lstOfPaygroupOverrideProducts: any[] = [];
  reviewCancelled: boolean = false;

  SalaryBreakupType: any = [];
  PayGroupList: PayGroupList[] = [];
  IndustryList: IndustryList[] = [];
  SkillCategoryList: any[] = [];
  ZoneList: ZoneList[] = [];
  EffectivePayPeriodList: any[] = [];

  IndustryId: number | string = 0;
  StateId: number | string = 0;
  CityId: number | string = 0;

  OfferSkillZoneInfo: OfferInfo;


  // DEFAULT ITEMS 
  contractObject: any = null;
  locationObject: any = null;
  teamObject: any = null;
  NoticePeriodDaysName: string = "---";
  LeaveGroupIdName: string = "---";
  ManagerIdName: string = "---";
  ActualDOJminDate: Date;
  ActualDOJmaxDate: Date;
  wageTypeString: string = 'Daily';
  NewRt: any[] = [];

  payCyleId: number = 0;
  IsReportingManagerRequired: boolean = false;
  modalOption: NgbModalOptions = {};

  IsDFDLoaded: boolean = false;
  IsEditMode: boolean = false;
  IsReporingManagerRequired: boolean = false;

  worklocationCityName: string = "";
  worklocationStateName: string = "";

  reportingStateName: any;
  reportingCityName: any;

  @ViewChild('myDropdownField') myDropdownField: ElementRef;
  isAllenDigital: boolean = false;
  AttendanceStartDate: Date;
  designationLevelDisplayName: string = "";
  IsRecalculateButtonRequiredOnEmployee = environment.environment.IsRecalculateButtonRequiredOnEmployee;
  IsAutoSalaryConfirmRequiredOnEmployee = environment.environment.IsAutoSalaryConfirmRequiredOnEmployee;
  IsZeroBasedCalculationRequired = environment.environment.IsZeroBasedCalculationRequired;
  @ViewChild('myButton') myButton: ElementRef;
  timeOutSec = 3000;
  EditableAnnualPayComponent = environment.environment.EditableAnnualPayComponent;
  isConsultantEmployee: boolean = false;
  DisabledProductsComponentsList = environment.environment.DisabledProductsComponentsList;
  roundingMethod = environment.environment.DefaultRoundingFunctionForSalary;
  TotalCTC: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private loadingScreenService: LoadingScreenService,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    public essService: ESSService,
    public onboardingService: OnboardingService,
    private pageLayoutService: PagelayoutService,
    private UIBuilderService: UIBuilderService,
    private clientService: ClientService,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private cookieService: CookieService,
    private productService: ProductService
  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 

  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({

      //CURRENT EMPLOYMENT
      employername: [''],
      jobtype: [''],
      companyname: [''],
      employeecode: [''],
      teamname: [null, !this.isESSLogin ? Validators.required : null],
      contractname: ['', !this.isESSLogin ? Validators.required : null],
      clientname: ['', !this.isESSLogin ? Validators.required : null],
      employmentType: [null],
      reportingmanager: [null, !this.isESSLogin ? Validators.required : null],
      // dateofjoining: ['', Validators.required],
      employementstartdate: ['', !this.isESSLogin ? Validators.required : null],
      employementenddate: [''],
      Designation: ['', !this.isESSLogin ? Validators.required : null],
      Category: [null],
      LWD: [''],
      Department: [''],
      Grade: [''],
      Location: [null, !this.isESSLogin ? Validators.required : null],
      CityId: [null, !this.isESSLogin ? Validators.required : null],
      ReportingLocation: [null, !this.isESSLogin ? Validators.required : null],
      statename: [null, !this.isESSLogin ? Validators.required : null],
      Country: [null, !this.isESSLogin ? Validators.required : null],
      costcode: [null],
      noticePeriodDays: [null],
      leaveGroup: [null],
      annualSalary: [''],
      minimumWagesApplicableProducts: [null],
      MonthlySalary: [''],
      forMonthlyValue: [false],
      isMinimumwages: [this.BusinessType == 3 ? true : false],
      industryType: [null],
      skillCategory: [null],
      zone: [null],
      salaryType: [null],
      payGroup: [null],
      insuranceplan: [null],
      onCostInsuranceAmount: [''],
      fixedDeductionAmount: [''],
      effectivePeriod: [null],
      CustomData1: [''],
      CustomData2: [''],
      CustomData3: [''],
      CustomData4: [''],
      DepartmentId: [null],
      Division: [null]



    });
  }


  ngOnInit() {
    this.SalaryBreakupType = this.utilsHelper.transform(SalaryBreakUpType);
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
    let mode = 2; // add-1, edit-2, view, 3   
    this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    const cookieValue = this.cookieService.get('clientCode');
    this.isAllenDigital = (cookieValue.toUpperCase() == 'ALLEN' && (this.BusinessType === 1 || this.BusinessType === 2)) ? true : false;

    var disableFields = ["employername",
      "employeecode",
      "clientname",
      "contractname",
      "employmentType",
      "teamname",
      "reportingmanager",
      "employementstartdate",
      "employementenddate",
      "Designation",
      "Department",
      "Grade",
      "Location",
      "CityId",
      "Country",
      "statename",
      "costcode",
      "noticePeriodDays",
      "leaveGroup",
      "LWD", "Category", "ReportingLocation", "DepartmentId", "Division"];

    if (Number(this.BusinessType) === Number(3)) {
      // disable all input fields for staffing
      if (this.employeedetails && this.employeedetails.Id > 0) {
        this.reactiveFormDisableEnable(disableFields, true);
      }
    }
    try {
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");

    } catch (error) {
      console.log('UI BUILDER ::', error);
    }

    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      sessionStorage.removeItem('_StoreLstinvestment');
      sessionStorage.removeItem('_StoreLstDeductions');
      sessionStorage.removeItem("_StoreLstinvestment_Deleted");
      sessionStorage.removeItem("_StoreLstDeductions_Deleted");
      this.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).then((res) => {

        this.Common_GetEmployeeAccordionDetails('isEmploymentDetails').then((obj1) => {

          this.reactiveFormDisableEnable(disableFields, true);

          this.patchEmployeeForm();
          this.cd.detectChanges();

        });
      });

    } else {
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;

      this.doCheckAllenDigital() ? this.isAllenDigital = true : this.isAllenDigital = false;

      this.isAllenDigital && this.essService.updateValidation(true, this.employeeForm.get('Category'))

      if (this.employeedetails.Id == 0) {
        console.log('Client List :', this.OfferInfoListGrp);

        this.MigrationInfoGrp = this.OfficialTabMaster_MigrationInfoGrp;
        this.OfferSkillZoneInfo = this.OfficialTabMaster_OfferSkillZoneInfo;

        if (this.OfferInfoListGrp == undefined) {

          this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, 'isEmploymentDetails').then((Result) => {

            this.OfferInfoListGrp = Result as any;
            try {

              this.timeOutSec = 5000;
              this.ClientLocationList = this.OfferInfoListGrp.ClientLocationList;
              this.ClientReportingLocationList = this.OfferInfoListGrp.ClientReportingLocationList;
              this.ClientCityList = this.OfferInfoListGrp.ClientCityList;
              this.ClientContractList = this.OfferInfoListGrp.ClientContractList;
              this.PayGroupList = this.OfferInfoListGrp.PayGroupList;
              this.IndustryList = this.OfferInfoListGrp.IndustryList;
              (this.employeedetails.EmploymentContracts[0].ClientId == 0 || this.employeedetails.EmploymentContracts[0].ClientId == null || this.employeedetails.EmploymentContracts[0].ClientId == "" as any) ? this.getClientMasterDropdown('Client') : true;
              this.doMapMasterInfo();
              this.cd.detectChanges();


              if (this.IndustryList.length === 1) {
                this.employeeForm.get('industryType').setValue(this.IndustryList[0].Id);
                this.onChangeIndustryType(this.IndustryList[0].Id);
              }

              this.disableFormControls();
              this.patchEmployeeForm();


            } catch (error) {
              console.log('EX GET EMPLOYMENT INFO :', error);

            }

          });
        } else {
          // -- duplicate code (refactor this set of snipperts)

          this.ClientLocationList = this.OfferInfoListGrp.ClientLocationList;
          this.ClientReportingLocationList = this.OfferInfoListGrp.ClientReportingLocationList;
          this.ClientCityList = this.OfferInfoListGrp.ClientCityList;
          this.ClientContractList = this.OfferInfoListGrp.ClientContractList;
          this.PayGroupList = this.OfferInfoListGrp.PayGroupList;
          this.IndustryList = this.OfferInfoListGrp.IndustryList;
          (this.employeedetails.EmploymentContracts[0].ClientId == 0 || this.employeedetails.EmploymentContracts[0].ClientId == null || this.employeedetails.EmploymentContracts[0].ClientId == "" as any) ? this.getClientMasterDropdown('Client') : true;
          this.doMapMasterInfo();
          this.cd.detectChanges();


          if (this.IndustryList.length === 1) {
            this.employeeForm.get('industryType').setValue(this.IndustryList[0].Id);
            this.onChangeIndustryType(this.IndustryList[0].Id);
          }
          this.disableFormControls();
          this.patchEmployeeForm();

        }


      }

      if (this.employeedetails.Id > 0) {
        if (environment.environment.ClientsNotAllowedToEditDOJInOfficialInformationTab && environment.environment.ClientsNotAllowedToEditDOJInOfficialInformationTab.includes(this.employeedetails.EmploymentContracts[0].ClientId)) {
          this.reactiveFormDisableEnable(["employementstartdate"], true);
        }

        if (this.OfferInfoListGrp == undefined) {

          this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, 'isEmploymentDetails').then((Result) => {

            this.OfferInfoListGrp = Result as any;

            try {
              this.timeOutSec = 5000;
              this.ClientLocationList = this.OfferInfoListGrp.ClientLocationList;
              this.ClientReportingLocationList = this.OfferInfoListGrp.ClientReportingLocationList;
              this.ClientCityList = this.OfferInfoListGrp.ClientCityList;
              this.ClientContractList = this.OfferInfoListGrp.ClientContractList;
              this.PayGroupList = this.OfferInfoListGrp.PayGroupList;
              this.IndustryList = this.OfferInfoListGrp.IndustryList;
              (this.employeedetails.EmploymentContracts[0].ClientId == 0 || this.employeedetails.EmploymentContracts[0].ClientId == null || this.employeedetails.EmploymentContracts[0].ClientId == "" as any) ? this.getClientMasterDropdown('Client') : true;
              this.doMapMasterInfo();
              this.cd.detectChanges();


              if (this.IndustryList.length === 1) {
                this.employeeForm.get('industryType').setValue(this.IndustryList[0].Id);
                this.onChangeIndustryType(this.IndustryList[0].Id);
              }

              this.disableFormControls();
              this.patchEmployeeForm();

            } catch (error) {
              console.log('EX GET EMPLOYMENT INFO :', error);

            }

          });

        }

        this.ClientLocationList = this.OfferInfoListGrp.ClientLocationList;
        this.ClientReportingLocationList = this.OfferInfoListGrp.ClientReportingLocationList;
        this.ClientCityList = this.OfferInfoListGrp.ClientCityList;
        this.ClientContractList = this.OfferInfoListGrp.ClientContractList;
        this.PayGroupList = this.OfferInfoListGrp.PayGroupList;
        this.IndustryList = this.OfferInfoListGrp.IndustryList;
        (this.employeedetails.EmploymentContracts[0].ClientId == 0 || this.employeedetails.EmploymentContracts[0].ClientId == null || this.employeedetails.EmploymentContracts[0].ClientId == "" as any) ? this.getClientMasterDropdown('Client') : true;
        this.doMapMasterInfo();
        this.cd.detectChanges();


        if (this.IndustryList.length === 1) {
          this.employeeForm.get('industryType').setValue(this.IndustryList[0].Id);
          this.onChangeIndustryType(this.IndustryList[0].Id);
        }
        this.disableFormControls();
        this.patchEmployeeForm();
      }


    }

    this.check_ActualDOJ_minDate();
  }

  // doRefresh() {
  //   this.spinner = true;

  //   this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
  //   this.UserId = this._loginSessionDetails.UserSession.UserId;
  //   this.CompanyId = this._loginSessionDetails.Company.Id;
  //   this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId;
  //   this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
  //   this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
  //   this.EmployeeId = this._loginSessionDetails.EmployeeId;
  //   this.clientLogoLink = 'logo.png';
  //   this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

  //   // Rest of your code...

  //   if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
  //     this.isESSLogin = true;
  //     sessionStorage.removeItem('_StoreLstinvestment');
  //     sessionStorage.removeItem('_StoreLstDeductions');
  //     sessionStorage.removeItem("_StoreLstinvestment_Deleted");
  //     sessionStorage.removeItem("_StoreLstDeductions_Deleted");
  //     this.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile)
  //       .then((res) => {
  //         // Your asynchronous code here...
  //         this.Common_GetEmployeeAccordionDetails('isEmploymentDetails').then((obj1) => {
  //           this.patchEmployeeForm();
  //           // this.spinner = false; // Set spinner to false when the asynchronous operations are complete
  //           this.cd.detectChanges(); // Trigger change detection
  //         });

  //       })
  //       .catch((error) => {
  //         // Handle errors and still set the spinner to false
  //         this.spinner = false;
  //         this.cd.detectChanges();
  //       });
  //   } else {
  //     this.isESSLogin = false;
  //     this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;

  //     if (this.employeedetails.Id == 0) {
  //       // Your code...

  //       this.spinner = false; // Set spinner to false when the asynchronous operations are complete
  //       this.cd.detectChanges(); // Trigger change detection
  //     }

  //     this.patchEmployeeForm();
  //   }

  //   this.check_ActualDOJ_minDate();
  // }

  onChangeMonthlySalary(event) {

    this.employeeForm.controls['annualSalary'].setValue(Math.floor(this.employeeForm.get('MonthlySalary').value * 12))
    event != null ? this.onFocus_OfferAccordion((this.employeeForm.get('MonthlySalary').value), 'MonthlySalary') : null;

  }


  check_ActualDOJ_minDate() {

    this.ActualDOJminDate = new Date();
    this.ActualDOJmaxDate = new Date();

    let currentDate = new Date()
    const newMinDate = moment(currentDate).add(!this.isESICapplicable ? environment.environment.ActualDOJminDate : environment.environment.ActualDOJminDate_withESIC, 'days').format("YYYY-MM-DD");
    this.ActualDOJminDate = new Date(newMinDate.toString());
    const newMiaxDate = moment(currentDate).add(environment.environment.ActualDOJmaxDate, 'days').format("YYYY-MM-DD");
    this.ActualDOJmaxDate = new Date(newMiaxDate.toString());

  }

  GetEmployeeRequiredDetailsById(employeeId, ctrlActivity) {
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .Common_GetEmployeeRequiredDetailsById(employeeId, ctrlActivity).then((result) => {
          if (result == true) {

            this.employeedetails = JSON.parse(this.sessionService.getSessionStorage('_EmployeeRequiredBasicDetails'));
            this.employeeModel.oldobj = Object.assign({}, JSON.parse(this.sessionService.getSessionStorage('_EmployeeRequiredBasicDetails')))
            this.employeedetails.EmploymentContracts[0].ClientContractId > 0 ? this.getMigrationMasterInfo(this.employeedetails.EmploymentContracts[0].ClientContractId).then((dt) => {
              resolve(true);
            }) : true

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
  reactiveFormDisableEnable(disableFields, controlMode) {
    // for (let form = 0; form < disableFields.length; form++) {
    //   const element = disableFields[form];
    //   console.log('element', element);

    //   this.employeeForm.controls[element].disable();
    // }
  }

  patchEmployeeForm() {

    this.employeeService.getActiveTab(false);
    try {

      if (this.employeedetails != null) {

        console.log('Initial Data :', this.employeedetails);

        try {
          if (this.employeedetails && this.employeedetails.ELCTransactions != null && this.employeedetails.ELCTransactions.length > 0 &&
            this.employeedetails.ELCTransactions[0].EmployeeRatesets != null && this.employeedetails.ELCTransactions[0].EmployeeRatesets.length > 0
            && this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts && this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts.length > 0) {
            this.NewELCTransaction = this.employeedetails.ELCTransactions[0];
          }
        } catch (error) {

        }

        this.IsEditMode = this.employeedetails && this.employeedetails.Id > 0 ? true : false;

        this.employeeForm.controls['CustomData1'].setValue(this.employeedetails.EmploymentContracts[0].CustomData1);
        this.employeeForm.controls['CustomData2'].setValue(this.employeedetails.EmploymentContracts[0].CustomData2);
        this.employeeForm.controls['CustomData3'].setValue(this.employeedetails.EmploymentContracts[0].CustomData3);
        this.employeeForm.controls['CustomData4'].setValue(this.employeedetails.EmploymentContracts[0].CustomData4);


        // EMPLOYMENT DETAILS 
        this.employeeForm.controls['contractname'].setValue(this.employeedetails.EmploymentContracts[0].ClientContractId == 0 ? null : this.employeedetails.EmploymentContracts[0].ClientContractId);

        this.employeeForm.controls['employmentType'].setValue(this.employeedetails.EmploymentContracts[0].EmploymentType == 0 ? null : this.employeedetails.EmploymentContracts[0].EmploymentType);

        this.employeeForm.controls['clientname'].setValue(this.employeedetails.EmploymentContracts[0].ClientId == 0 ? null : this.employeedetails.EmploymentContracts[0].ClientId);
        this.employeeForm.controls['employername'].setValue(this.employeedetails.FirstName);
        this.employeeForm.controls['employeecode'].setValue(this.employeedetails.Code);
        this.employeeForm.controls['teamname'].setValue((this.employeedetails.EmploymentContracts[0].TeamId == 0 || this.employeedetails.EmploymentContracts[0].TeamId == null) ? null : Number(this.employeedetails.EmploymentContracts[0].TeamId));
        this.employeeForm.controls['reportingmanager'].setValue((this.employeedetails.EmploymentContracts[0].ManagerId == null || this.employeedetails.EmploymentContracts[0].ManagerId == 0) ? null : Number(this.employeedetails.EmploymentContracts[0].ManagerId));
        // this.employeeForm.controls['dateofjoining'].setValue(this.datePipe.transform(this.employeedetails.EmploymentContracts[0].StartDate, "dd-MM-yyyy"));
        this.employeeForm.controls['employementstartdate'].setValue((this.employeedetails.EmploymentContracts[0].StartDate == null || this.employeedetails.EmploymentContracts[0].StartDate == '1970-01-01T00:00:00') ? '' : new Date(this.employeedetails.EmploymentContracts[0].StartDate));
        this.employeeForm.controls['employementenddate'].setValue(this.employeedetails.EmploymentContracts[0].EndDate == "0001-01-01T00:00:00" ? null : new Date(this.employeedetails.EmploymentContracts[0].EndDate));
        this.employeeForm.controls['LWD'].setValue(this.employeedetails.EmploymentContracts[0].LWD == null ? null : moment(new Date(this.employeedetails.EmploymentContracts[0].LWD)).format('DD-MM-YYYY'));

        this.employeeForm.controls['Designation'].setValue(this.employeedetails.EmploymentContracts[0].DesignationId);

        this.employeeForm.controls['Category'].setValue(this.employeedetails.EmploymentContracts[0].Category == 0 ? null : this.employeedetails.EmploymentContracts[0].Category);


        this.employeeForm.controls['Department'].setValue(this.employeedetails.EmploymentContracts[0].Department);

        this.employeeForm.controls['DepartmentId'].setValue(this.employeedetails.EmploymentContracts[0].DepartmentId == 0 ? null : this.employeedetails.EmploymentContracts[0].DepartmentId);

        this.employeeForm.controls['Division'].setValue(this.employeedetails.EmploymentContracts[0].Division == 0 ? null : this.employeedetails.EmploymentContracts[0].Division);

        this.employeeForm.controls['Grade'].setValue(this.employeedetails.EmploymentContracts[0].Grade);
        this.employeeForm.controls['Location'].setValue((this.employeedetails.EmploymentContracts[0].WorkLocation == "" || this.employeedetails.EmploymentContracts[0].WorkLocation == '0') ? null : Number(this.employeedetails.EmploymentContracts[0].WorkLocation));

        this.employeeForm.controls['CityId'].setValue((this.employeedetails.EmploymentContracts[0].CityId == null || this.employeedetails.EmploymentContracts[0].CityId == 0) ? null : Number(this.employeedetails.EmploymentContracts[0].CityId));

        this.employeeForm.controls['ReportingLocation'].setValue((this.employeedetails.EmploymentContracts[0].ReportingLocation == 0 || this.employeedetails.EmploymentContracts[0].ReportingLocation == null) ? null : Number(this.employeedetails.EmploymentContracts[0].ReportingLocation));


        this.employeeForm.controls['statename'].setValue(this.employeedetails.EmploymentContracts[0].StateId);
        this.employeeForm.controls['Country'].setValue(100);
        this.employeeForm.controls['costcode'].setValue(this.employeedetails.EmploymentContracts[0].CostCodeId == 0 ? null : this.employeedetails.EmploymentContracts[0].CostCodeId);
        this.employeeForm.controls['noticePeriodDays'].setValue((this.employeedetails.EmploymentContracts[0].NoticePeriodDays == null || this.employeedetails.EmploymentContracts[0].NoticePeriodDays == "null") ? null : (this.employeedetails.EmploymentContracts[0].NoticePeriodDays));
        this.employeeForm.controls['leaveGroup'].setValue((this.employeedetails.EmploymentContracts[0].LeaveGroupId == null || this.employeedetails.EmploymentContracts[0].LeaveGroupId == 0) ? null : (this.employeedetails.EmploymentContracts[0].LeaveGroupId));


        this.employeeForm.controls['jobtype'].setValue(null);
        this.employeeForm.controls['companyname'].setValue(null);

        if (this.employeedetails.Id == 0 && this.employeedetails.ELCTransactions.length > 0) {

          // this.getMigrationMasterInfo(this.employeeForm.value.contractname);

          this.employeeForm.controls['industryType'].setValue(this.employeedetails.ELCTransactions[0].IndustryId == 0 ? null : this.employeedetails.ELCTransactions[0].IndustryId);


          this.onChangeOfferLocation(this.OfferInfoListGrp.ClientLocationList.find(z => z.Id == Number(this.employeedetails.EmploymentContracts[0].WorkLocation)), 'firstTime').then((result) => {


            if (this.employeedetails.EmploymentContracts[0].CityId > 0 && this.employeedetails.EmploymentContracts[0].CityId != null) {
              this.onChangeJoiningLocation(this.OfferInfoListGrp.ClientCityList.find(z => z.Id == Number(this.employeedetails.EmploymentContracts[0].CityId)), 'firstTime');
            }


            // if (this.employeedetails.EmploymentContracts[0].ReportingLocation > 0 && this.employeedetails.EmploymentContracts[0].ReportingLocation != null) {
            //   this.onChangeWorkLocation(this.OfferInfoListGrp.ClientReportingLocationList.find(z => z.Id == Number(this.employeedetails.EmploymentContracts[0].ReportingLocation)));

            // }


            this.employeeForm.controls['skillCategory'].setValue(this.employeedetails.ELCTransactions[0].SkillCategory == 0 ? null : this.employeedetails.ELCTransactions[0].SkillCategory);
            this.employeeForm.controls['zone'].setValue(this.employeedetails.ELCTransactions[0].Zone == 0 ? null : this.employeedetails.ELCTransactions[0].Zone);
            // this.employeeForm.controls['effectivePeriod'].setValue(this.employeedetails.ELCTransactions[0].EffectivePayPeriodId == 0 ? null : this.employeedetails.ELCTransactions[0].EffectivePayPeriodId);

            this.employeeForm.controls['annualSalary'].setValue(this.employeedetails.EmployeeRatesets[0].AnnualSalary == 0 ? null : this.employeedetails.EmployeeRatesets[0].AnnualSalary);

            this.employeeForm.controls['MonthlySalary'] != null ? this.employeeForm.controls['MonthlySalary'].setValue(this.employeedetails.EmployeeRatesets[0].MonthlySalary) : null;

            this.employeeForm.controls['forMonthlyValue'] != null ? this.employeeForm.controls['forMonthlyValue'].setValue(this.employeedetails.EmployeeRatesets[0].IsMonthlyValue) : null;


            this.employeeForm.controls['salaryType'].setValue(this.employeedetails.EmployeeRatesets[0].SalaryBreakUpType);
            this.employeeForm.controls['payGroup'].setValue(this.employeedetails.EmployeeRatesets[0].PayGroupdId == 0 ? null : this.employeedetails.EmployeeRatesets[0].PayGroupdId);
            this.employeeForm.controls['effectivePeriod'].setValue(this.employeedetails.EmployeeRatesets[0].EffectivePeriodId == 0 ? null : this.employeedetails.EmployeeRatesets[0].EffectivePeriodId);
            console.warn(this.employeedetails);

            this.payCyleId = this.employeedetails.EmploymentContracts[0].PayCycleId;

          })
          this.New_RateSetList = [];
          this.IsRateSetValue = this.employeedetails.ELCTransactions[0].IsRateSetValid;
          this.NewRt = this.employeedetails.EmployeeRatesets[0].RatesetProducts;

        }

        this.IsESICApplicableForKeyIn = this.employeedetails.EmploymentContracts[0].IsESICApplicable;

        console.log('TEST OFFER ::', this.OfferInfoListGrp);


        if (this.OfferInfoListGrp == undefined) {

          this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, 'isEmploymentDetails').then((Result) => {
            console.log('redfdfdfdf', Result)

            this.OfferInfoListGrp = Result as any;
            try {
              this.dataMapping();
            } catch (error) {
              console.log('EX GET EMPLOYMENT INFO :', error);

            }

          });
        } else {
          this.dataMapping();
        }

        this.spinner = false;

        console.log('Form Values : ', this.employeeForm.value);
        this.spinner = false;
      }

    } catch (error) {
      this.spinner = false;
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY EMPLOYMENT DETAILS :', error);

    }
  }

  dataMapping() {
    // if (this.isESSLogin == false) {

    //   // this.essService.updateValidation(false, this.employeeForm.get('teamname'));
    //   this.employeeForm.controls['costcode'] != null ?   this.essService.updateValidation(false, this.employeeForm.get('costcode')) : true;
    // } else {
    //   this.employeeForm.controls['teamname'] != null ?   this.essService.updateValidation(true, this.employeeForm.get('teamname')) : true;
    //   this.employeeForm.controls['costcode'] != null ?   this.essService.updateValidation(true, this.employeeForm.get('costcode')) : true;

    // }

    console.log('this.OfferInfoListGrp', this.OfferInfoListGrp);


    this.ClientLocationList = this.OfferInfoListGrp.ClientLocationList && this.OfferInfoListGrp.ClientLocationList.length > 0 ? (this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.employeedetails.EmploymentContracts[0].ClientId)) : [];

    this.ClientReportingLocationList = this.OfferInfoListGrp.ClientReportingLocationList && this.OfferInfoListGrp.ClientReportingLocationList.length > 0 ? (this.OfferInfoListGrp.ClientReportingLocationList.filter(z => z.ClientId == this.employeedetails.EmploymentContracts[0].ClientId)) : [];

    this.EmploymentTypeList = this.OfferInfoListGrp.EmploymentTypeList != null && this.OfferInfoListGrp.EmploymentTypeList.length > 0 ? this.OfferInfoListGrp.EmploymentTypeList : [];
    this.ClientList = this.OfferInfoListGrp.ClientList && this.OfferInfoListGrp.ClientList.length > 0 ? _.orderBy(this.OfferInfoListGrp.ClientList, ["Name"], ["asc"]) : [];
    this.CountryList = this.OfferInfoListGrp.CountryList;

    if (this.BusinessType != 3) {
      this.ClientList = this.ClientList.filter(x => x.Id == this.sessionService.getSessionStorage('default_SME_ClientId'))
    }

    this.CountryList && this.CountryList.length > 0 ? this.onchangecountry(this.CountryList.find(a => a.Id == 100), 'Other') : true;
    this.MigrationInfoGrp == null && !this.isESSLogin ? this.employeedetails.EmploymentContracts[0].ClientContractId > 0 ? this.getMigrationMasterInfo(this.employeedetails.EmploymentContracts[0].ClientContractId) : true : true;

    console.log('this.DynamicFieldDetails', _.isEmpty(this.DynamicFieldDetails));

    // if (this.employeedetails.Id == 0 && (this.DynamicFieldDetails == null || _.isEmpty(this.DynamicFieldDetails))) {
    //   this.getDynamicFieldDetailsConfig(this.CompanyId, (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientId : this.employeeForm.get('clientname').value), (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientContractId : this.employeeForm.get('contractname').value)).then(() => console.log("Task Complete!"));
    // } else if (this.DynamicFieldDetails == null || _.isEmpty(this.DynamicFieldDetails)) {
    //   this.getDynamicFieldDetailsConfig(this.CompanyId, (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientId : this.employeeForm.get('clientname').value), (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientContractId : this.employeeForm.get('contractname').value)).then(() => console.log("Task Complete!"));

    // }

    this.spinner = false;
  }

  /* #region EMPLOYMENT CONTRACT DETAILS TAB SET */

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

  // KEY IN ACTITVITES - 

  doMapMasterInfo() {

    // if (this.OfficialTabMaster_DynamicFieldDetails != null && !_.isEmpty(this.DynamicFieldDetails)) {
    //   this.isEmptyObject(this.OfficialTabMaster_DynamicFieldDetails);
    //   this.DynamicFieldDetails = this.OfficialTabMaster_DynamicFieldDetails;
    // }

    // isEmptyObject

    if (this.employeedetails.Id == 0 && this.employeedetails.EmploymentContracts[0].WorkLocation != '0' && this.employeedetails.EmploymentContracts[0].WorkLocation != '' && this.employeedetails.EmploymentContracts[0].WorkLocation != null && this.ClientLocationList.length > 0) {


      let location = this.ClientLocationList.find(a => a.Id == this.employeedetails.EmploymentContracts[0].WorkLocation as any);
      console.log('location', location);

      this.locationObject = location;
      this.StateId = location.StateId;
      this.CityId = location.CityId;
      this.employeeForm.controls['CityId'].setValue(this.CityId);
     

    }

    if (this.OfferSkillZoneInfo) {

      this.SkillCategoryList = this.OfferSkillZoneInfo.SkillCategoryList;
      this.ZoneList = this.OfferSkillZoneInfo.ZoneList;
    }
    if (this.MigrationInfoGrp) {

      console.log('have MG data',);

      this.TeamList = this.MigrationInfoGrp;
      this.DesignationList = this.MigrationInfoGrp[0].LstEmployeeDesignation;
      // this.NoticePeriodDaysList = this.MigrationInfoGrp[0].NoticePeriodDaysList;

      this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
      this.NoticePeriodDaysList.forEach(element => {
        element.Description = Number(element.Description);
      });

      // this.MigrationInfoGrp != null && this.BusinessType != 3 ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList : true;
      this.MigrationInfoGrp[0].AttendanceStartDate != null ? this.AttendanceStartDate = new Date(this.MigrationInfoGrp[0].AttendanceStartDate) : true;

      this.EffectivePayPeriodList = this.MigrationInfoGrp[0].PayPeriodList;
      this.lstOfPaygroupOverrideProducts = this.MigrationInfoGrp[0].PaygroupProductOverridesList;

      if (this.employeedetails.Id == 0 && this.employeedetails.EmploymentContracts[0].TeamId > 0 && this.employeedetails.EmploymentContracts[0].TeamId != null) {
        let filterList = this.TeamList.find(a => a.Id == this.employeedetails.EmploymentContracts[0].TeamId);
        this.teamObject = filterList;
        this.PayCycleDetails = filterList.PayCycleDetails;

        this.BusinessType == 3 ? this.ManagerList = filterList.ManagerList : true;
        this.LeaveGroupList = filterList.LeaveGroupList;
        this.CostCodeList = filterList.CostCodeList;
        // this.NoticePeriodDaysList = filterList.NoticePeriodDaysList;
        this.MigrationInfoGrp != null && this.BusinessType != 3 && this.MigrationInfoGrp[0].ReportingManagerList != null ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList
          // .filter(a => a.TeamId == this.employeedetails.EmploymentContracts[0].TeamId) 
          : true;

      }
    }


  }

  // EMPLOYMENT DETAILS

  getMigrationMasterInfo(ClientContractId) {
    const promise = new Promise((res, rej) => {
      this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {
        let apiResult: apiResult = (result);
        console.log('migration data :: ', apiResult);


        if (apiResult.Status && apiResult.Result != null) {
          this.MigrationInfoGrp = JSON.parse(apiResult.Result);
          this.TeamList = this.MigrationInfoGrp;
          this.cd.detectChanges(); // Trigger change detection
          this.DesignationList = this.MigrationInfoGrp[0].LstEmployeeDesignation;
          // this.NoticePeriodDaysList = this.MigrationInfoGrp[0].NoticePeriodDaysList;

          this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
          this.NoticePeriodDaysList.forEach(element => {
            element.Description = Number(element.Description);
          });

          // this.MigrationInfoGrp != null && this.BusinessType != 3 ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList : true;
          this.EffectivePayPeriodList = this.MigrationInfoGrp[0].PayPeriodList;

          this.MigrationInfoGrp[0].AttendanceStartDate != null ? this.AttendanceStartDate = new Date(this.MigrationInfoGrp[0].AttendanceStartDate) : true;


          if (this.MigrationInfoGrp && this.MigrationInfoGrp[0].ClientContractOperationList
            && this.MigrationInfoGrp[0].ClientContractOperationList.length) {

            const clientContractOperationObj = this.MigrationInfoGrp[0].ClientContractOperationList[0];

            // check BreakupBasedays key is present in the object
            this.baseDaysForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasedays') ?
              clientContractOperationObj.BreakupBasedays : 0;

            // check BreakupBasehours key is present in the object
            this.baseHoursForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasehours') ?
              clientContractOperationObj.BreakupBasehours : 1;

            // check WageType key is present in the object
            const wageTypeNumber = clientContractOperationObj.hasOwnProperty('WageType') ?
              clientContractOperationObj.WageType : 0;

            if (wageTypeNumber === 1) {
              this.wageType = 'Hourly';
              this.isDailyOrHourlyWages = true;
            } else if (wageTypeNumber === 2) {
              this.wageType = 'Daily';
              this.isDailyOrHourlyWages = true;
            } else {
              this.wageType = 'Monthly';
              this.isDailyOrHourlyWages = false;
              this.baseDaysForAddlApplicableProduct = 0;
            }

            // check MinimumWagesApplicableProducts key is present in the object
            this.minimumWagesApplicableProductsList = clientContractOperationObj.hasOwnProperty('MinimumWagesApplicableProducts') ?
              clientContractOperationObj.MinimumWagesApplicableProducts : [];

            // set value in minimumWagesApplicableProducts - form control
            this.minimumWagesApplicableProductsList && this.minimumWagesApplicableProductsList.length > 0 ? this.employeeForm.controls['minimumWagesApplicableProducts'].setValue(this.minimumWagesApplicableProductsList[0].Code)
              : this.employeeForm.controls['minimumWagesApplicableProducts'].setValue(null);
          }

          this.lstOfPaygroupOverrideProducts = this.MigrationInfoGrp[0].PaygroupProductOverridesList;

          if (this.employeedetails.Id == 0 && this.NoticePeriodDaysList.length > 0 && (this.employeeForm.get('noticePeriodDays').value == null || this.employeeForm.get('noticePeriodDays').value == undefined)) {
            // console.log('sdfsdfadfas', this.NoticePeriodDaysList.find(a => a.Description == "60").Id);

            this.employeeForm.get('noticePeriodDays').setValue(this.NoticePeriodDaysList.find(a => a.Description == environment.environment.DefaultNoticePeriodDays).Description);
          }

          if (this.EmployeeId != 0 && this.employeeForm.get('teamname').value != null) { // creq ; this.Id acta
            let temp_TeamList = this.TeamList.find(a => a.Id == this.employeeForm.get('teamname').value).PayCycleDetails;
            let item = { Id: this.employeeForm.get('teamname').value, PayCycleDetails: temp_TeamList.PayCycleDetails };
            this.MigrationInfoGrp != null && this.BusinessType != 3 && this.MigrationInfoGrp[0].ReportingManagerList != null ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList
              // .filter(a => a.TeamId == this.employeeForm.get('teamname').value)
              : true;

            this.onChangeTeam(item, 'other');
          }

          if (this.employeedetails.Id == 0 && this.employeeForm.get('teamname').value != null) { // creq ; this.Id acta
            let temp_TeamList = this.TeamList.find(a => a.Id == this.employeeForm.get('teamname').value);
            this.onChangeTeam(temp_TeamList, 'other');
          }
          res(true);

        } else {
          res(true);
        }

      })
    })
    return promise;
  }

  onChangePayPeriod(item) {
    console.log('PP Ev :', item);
    if (this.employeedetails && this.employeedetails.EmploymentContracts.length > 0)
      this.employeedetails.EmploymentContracts[0].PayCycleId = item.PaycycleId;
    this.payCyleId = item.PaycycleId;
  }

  onChangeTeam(item, from_action) {
    console.log('Team Ev :', item);
    this.teamObject = item;
    this.PayCycleDetails = item.PayCycleDetails;
    if (from_action == "DOM") {
      // this.employeeForm.controls['reportingmanager'].setValue(null);
      this.employeeForm.controls['costcode'].setValue(null);
      !this.isAllenDigital ? this.employeeForm.controls['noticePeriodDays'].setValue(null) : true;
      this.employeeForm.controls['leaveGroup'].setValue(null);
    }

    this.BusinessType == 3 ? this.ManagerList = [] : true;
    this.LeaveGroupList = [];
    this.CostCodeList = [];
    // this.NoticePeriodDaysList = [];
    let filterList = this.TeamList.find(a => a.Id == item.Id);

    this.IsReporingManagerRequired = false; ///  If the selected client wants to or candidate wants to do the attendance or leave, you must be referred to this flag.
    if (filterList.IsReportingManagerRequired) {
      this.IsReporingManagerRequired = true;
    }


    this.BusinessType == 3 ? this.ManagerList = filterList.ManagerList : true;
    this.LeaveGroupList = filterList.LeaveGroupList;
    this.CostCodeList = filterList.CostCodeList;


    this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
    this.NoticePeriodDaysList.forEach(element => {
      element.Description = Number(element.Description);
    });

    this.MigrationInfoGrp != null && this.BusinessType != 3 && this.MigrationInfoGrp[0].ReportingManagerList != null ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList
      // .filter(a => a.TeamId == this.employeeForm.get('teamname').value)
      // we have taken this bcoz a manager from another team can bceccome a manager for this team
      : true;

    const expectedDOJValue = this.employeeForm.get('employementstartdate').value;

    if (this.EffectivePayPeriodList.length > 0) {
      if (expectedDOJValue != null && expectedDOJValue != undefined && expectedDOJValue != '') {
        var expectedDOJDate = new Date(expectedDOJValue);
        let PPDI = this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList)
        if (PPDI == null) {
          this.shouldShowEPP(false);
        }
        console.log('EFPPID :: ', PPDI);
        this.employeeForm.controls['effectivePeriod'].setValue(this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
      }
    }

  }

  getDateOfJoiningPeriod(dateOfJoining: string, payPeriods): number | null {
    const joiningDate = new Date(dateOfJoining);

    for (const payPeriod of payPeriods) {
      const startDate = new Date(payPeriod.StartDate);
      const endDate = new Date(payPeriod.EndDate);

      if (moment(joiningDate).format('YYYY-MM-DD') as any >= moment(startDate).format('YYYY-MM-DD') as any && moment(joiningDate).format('YYYY-MM-DD') as any <= moment(endDate).format('YYYY-MM-DD') as any) {
        this.payCyleId = payPeriod.PaycycleId;
        this.employeedetails.EmploymentContracts[0].PayCycleId = payPeriod.PaycycleId;
        return payPeriod.Id;
      }
    }
    this.shouldShowEPP(false);
    return null;
  }

  onChangeDOJ(dojDate) {

    if (this.EffectivePayPeriodList.length > 0) {
      if (dojDate != null) {
        var expectedDOJDate = new Date(dojDate);

        let PPDI = this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList)
        if (PPDI == null) {
          this.shouldShowEPP(false);
        }

        this.employeeForm.controls['effectivePeriod'].setValue(this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
      }
    }


  }

  onchangecountry(country, act) {

    act == 'DOM' ? this.employeeForm.controls['statename'].setValue(null) : true;
    this.StateList2 = _.orderBy(_.filter(this.OfferInfoListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);

  }

  onChangeJoiningLocation(event: any, queue) {
    const promise = new Promise((res, rej) => {
      this.worklocationStateName = null;

      console.log('JOINing Locatin :', event);

      if (queue == 'secondtime') {
        this.employeeForm.controls['skillCategory'] != null ? this.employeeForm.controls['skillCategory'].setValue(null) : null;
        this.employeeForm.controls['zone'] != null ? this.employeeForm.controls['zone'].setValue(null) : null;
      }


      if (event != null) {
        this.CityId = event.Id;
        this.worklocationStateName = event.StateName;
        if (queue == 'secondtime') {
          this.employeeForm.controls['Location'].setValue(null);
          this.worklocationCityName = null;
          this.worklocationStateName = null;
          this.GetClientLocationList();
        }
      }
    })
    // event != null && this.NewRt.length > 0 ? this.onFocus_OfferAccordion(null, 'joiningLocation') : null;
    return promise;
  }

  GetClientLocationList() {

    let cityValue = this.employeeForm.get('CityId').value;
    var workLocation = this.ClientLocationList;
    return ['', null, undefined].includes(cityValue) ? workLocation :
      workLocation.filter(a => Number(a.CityId) == Number(cityValue));
  }


  onChangeOfferLocation(event: ClientLocationList, queue) {

    const promise = new Promise((res, rej) => {

      console.log('Location Ev :', event);
      console.log('queue ', queue);

      this.worklocationCityName = null;
      this.worklocationStateName = null;


      if (queue == 'secondtime') {
        this.employeeForm.controls['skillCategory'] != null ? this.employeeForm.controls['skillCategory'].setValue(null) : null;
        this.employeeForm.controls['zone'] != null ? this.employeeForm.controls['zone'].setValue(null) : null;

      }
      this.IndustryId = (this.employeeForm.get('industryType').value);
      this.SkillCategoryList = []; this.ZoneList = [];

      if (event != null) {
        this.locationObject = event;
        this.StateId = event.StateId;
        this.CityId = event.CityId;
        this.employeeForm.controls['CityId'].setValue(Number(this.CityId));
        this.employeeForm.controls['statename'].setValue(Number(this.StateId));
        this.worklocationCityName = event.CityName;
        this.worklocationStateName = event.StateName;

      }

      if (this.IndustryId && this.StateId) {
        this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
          .subscribe(response => {
            const apiResult: apiResult = response;
            if (apiResult.Status && apiResult.Result != "") {
              this.OfferSkillZoneInfo = JSON.parse(apiResult.Result);
              console.log('this.OfferSkillZoneInfo', this.OfferSkillZoneInfo);
              this.SkillCategoryList = this.OfferSkillZoneInfo.SkillCategoryList;
              this.ZoneList = this.OfferSkillZoneInfo.ZoneList;
              if (this.ZoneList.length > 0) {
                this.employeeForm.get('zone').setValue(this.ZoneList[0].Id);
              }
            }
          });
        res(true);
      }
      res(true);
    })
    event != null && this.employeedetails.Id == 0 && this.NewRt.length > 0 ? this.onFocus_OfferAccordion(null, 'location') : null;
    return promise;
  }

  onChangeWorkLocation(event: ClientLocationList) {
    if (event == null) {
      this.reportingCityName = null
      this.reportingStateName = null;
    } else {
      // this.GetSkillCategoryList();
      this.reportingCityName = event.CityName
      this.reportingStateName = event.StateName
    }
  }

  onChangeAnnaulSalary(event) {
    event != null && this.NewRt.length > 0 ? this.onFocus_OfferAccordion(null, 'salary') : null;
  }

  onPayGroupChange(event) {
    console.log('PayGroup Ev :', event);
    this.lstOfPaygroupOverrideProducts = this.MigrationInfoGrp[0].PaygroupProductOverridesList;
    this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0 && (this.lstOfPaygroupOverrideProducts = this.lstOfPaygroupOverrideProducts.filter(item => item.PayGroupId == event.PayGroupId));
    event != null && this.NewRt.length > 0 ? this.onFocus_OfferAccordion(null, 'paygroup') : null;

  }

  onChangeIndustryType(event) {
    console.log('Industry Ev :', event);
    if (event != null) {
      this.employeeForm.controls['skillCategory'].setValue(null);
      this.employeeForm.controls['zone'].setValue(null);
      this.SkillCategoryList = [];
      this.ZoneList = [];
    }

    this.IndustryId = (this.employeeForm.get('industryType').value);
    if (this.StateId && this.IndustryId)

      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
        .subscribe(response => {
          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {
            this.OfferSkillZoneInfo = JSON.parse(apiResult.Result);
            this.SkillCategoryList = this.OfferSkillZoneInfo.SkillCategoryList;
            this.ZoneList = this.OfferSkillZoneInfo.ZoneList;
            if (this.ZoneList.length > 0) {
              this.employeeForm.get('zone').setValue(this.ZoneList[0].Id);
            }
          }
        });

    event != null && this.NewRt.length > 0 ? this.onFocus_OfferAccordion(null, 'industry') : null;
  }


  Common_GetEmployeeAccordionDetails(accordionName) {
    const promise = new Promise((resolve, reject) => {
      this.employeedetails.Id > 0 ? this.spinner = true : true;
      this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, accordionName).then((Result) => {
        try {
          let employmentInfo = Result as OnEmploymentInfo;

          console.log('employmentInfo', employmentInfo);

          if (this.employeedetails.Id == 0) {
            this.OfferInfoListGrp.ClientContactList = employmentInfo.ClientContactList;
            this.OfferInfoListGrp.ClientContractList = employmentInfo.ClientContractList;
            this.OfferInfoListGrp.ClientLocationList = employmentInfo.ClientLocationList;
            this.OfferInfoListGrp.ClientReportingLocationList = employmentInfo.ClientReportingLocationList;
            this.OfferInfoListGrp.ClientCityList = employmentInfo.ClientCityList;

            this.OfferInfoListGrp.PayGroupList = employmentInfo.PayGroupList;
            this.OfferInfoListGrp.IndustryList = employmentInfo.IndustryList;
            this.ClientContractList = employmentInfo.ClientContractList;
            this.ClientLocationList = employmentInfo.ClientLocationList;
            this.ClientReportingLocationList = employmentInfo.ClientReportingLocationList;
            this.ClientCityList = employmentInfo.ClientCityList;
            this.PayGroupList = employmentInfo.PayGroupList;
            this.IndustryList = employmentInfo.IndustryList;
            resolve(true)
            return true;
          } else {
            this.OfferInfoListGrp = employmentInfo;
            this.spinner = false;
            resolve(true)
            return true;
          }


        } catch (error) {
          console.log(`EX GET ${accordionName} ACCORDION INFO :`, error);
        }

      });
    })
    return promise;
  }


  doSaveOrSubmit(isSubmit) {

    try {
      this.loadingScreenService.startLoading();

      let LstdynamicFieldsValue = [];
      let LstfieldValue = [];

      !this.isEmptyObject(this.DynamicFieldDetails) && this.DynamicFieldDetails.ControlElemetsList.length > 0 && this.DynamicFieldDetails.ControlElemetsList.forEach(element => {
        var fieldValue = new FieldValues();
        fieldValue.FieldName = element.FieldName;
        fieldValue.ParentFieldName = element.TabName;
        fieldValue.Value = element.Value;
        fieldValue.MultipleValues = element.MultipleValues;
        LstfieldValue.push(fieldValue);
      });

      var startdate = new Date(this.employeeForm.get('employementstartdate').value);
      var enddate = new Date(this.employeeForm.get('employementenddate').value);
      this.employeedetails.EmploymentContracts[0].ClientContractId = this.employeeForm.get('contractname').value;
      this.employeedetails.EmploymentContracts[0].EmploymentType = this.employeeForm.get('employmentType').value == null ? 0 : this.employeeForm.get('employmentType').value;

      this.employeedetails.EmploymentContracts[0].Department = this.employeeForm.get('Department').value;

      this.employeedetails.EmploymentContracts[0].DepartmentId = this.employeeForm.get('DepartmentId').value == null || this.employeeForm.get('DepartmentId').value == undefined || this.employeeForm.get('DepartmentId').value == "" ? 0 : this.employeeForm.get('DepartmentId').value;

      this.employeedetails.EmploymentContracts[0].Grade = this.employeeForm.get('Grade').value;

      this.employeedetails.EmploymentContracts[0].StartDate = moment(startdate).format('YYYY-MM-DD');
      this.employeedetails.EmploymentContracts[0].EndDate = moment(enddate).format('YYYY-MM-DD');

      this.employeedetails.EmploymentContracts[0].Designation = this.employeeForm.get('Designation').value != null && this.employeeForm.get('Designation').value != undefined && this.employeeForm.get('Designation').value != 0 ? this.DesignationList.length > 0 ? this.DesignationList.find(a => a.Id == this.employeeForm.get('Designation').value).Name : "" : "";
      this.employeedetails.EmploymentContracts[0].DesignationId = this.employeeForm.get('Designation').value;

      this.employeedetails.EmploymentContracts[0].Category = this.employeeForm.get('Category').value;


      this.employeedetails.EmploymentContracts[0].WorkLocation = this.employeeForm.get('Location').value == null ? 0 : this.employeeForm.get('Location').value;

      this.employeedetails.EmploymentContracts[0].ReportingLocation = this.employeeForm.get('ReportingLocation').value == null ? 0 : this.employeeForm.get('ReportingLocation').value;

      this.employeedetails.EmploymentContracts[0].StateId = this.employeeForm.get('statename').value == null ? 0 : this.employeeForm.get('statename').value;
      this.employeedetails.EmploymentContracts[0].CostCodeId = this.employeeForm.get('costcode').value == null ? 0 : this.employeeForm.get('costcode').value;
      this.employeedetails.EmploymentContracts[0].NoticePeriodDays = this.employeeForm.get('noticePeriodDays').value == null ? 0 : this.employeeForm.get('noticePeriodDays').value;

      this.employeedetails.EmploymentContracts[0].LeaveGroupId = this.employeeForm.get('leaveGroup').value == null ? 0 : this.employeeForm.get('leaveGroup').value;

      this.employeedetails.EmploymentContracts[0].Modetype = UIMode.Edit;
      this.employeedetails.EmploymentContracts[0].TeamId = this.employeeForm.get('teamname').value == null ? 0 : this.employeeForm.get('teamname').value;
      this.employeedetails.EmploymentContracts[0].ManagerId = this.employeeForm.get('reportingmanager').value == null ? 0 : this.employeeForm.get('reportingmanager').value;
      this.employeedetails.EmploymentContracts[0].EmploymentType = this.employeeForm.get('employmentType').value == null ? 0 : this.employeeForm.get('employmentType').value;
      this.employeedetails.EmploymentContracts[0].CustomData1 = this.employeeForm.get('CustomData1').value;
      this.employeedetails.EmploymentContracts[0].CustomData2 = this.employeeForm.get('CustomData2').value;
      this.employeedetails.EmploymentContracts[0].CustomData3 = this.employeeForm.get('CustomData3').value;
      this.employeedetails.EmploymentContracts[0].CustomData4 = this.employeeForm.get('CustomData4').value;

      if (this.employeedetails.EmployeeRatesets != null && this.employeedetails.EmployeeRatesets.length > 0 &&
        this.employeedetails.EmploymentContracts != null && this.employeedetails.EmploymentContracts.length > 0 &&
        this.employeeModel.oldobj.EmploymentContracts != null && this.employeeModel.oldobj.EmploymentContracts.length > 0 &&
        moment(this.employeeModel.oldobj.EmploymentContracts[0].StartDate).format('YYYY-MM-DD') != moment(this.employeedetails.EmploymentContracts[0].StartDate).format('YYYY-MM-DD') &&
        this.employeedetails.EmployeeRatesets.find(b => b.Status == 1) != undefined &&
        moment(this.employeeModel.oldobj.EmployeeRatesets.find(b => b.Status == 1).EffectiveDate).format('YYYY-MM-DD') != moment(this.employeedetails.EmploymentContracts[0].StartDate).format('YYYY-MM-DD')) {
        this.employeedetails.EmployeeRatesets.find(b => b.Status == 1).Modetype = UIMode.Edit;
        this.employeedetails.EmployeeRatesets.find(b => b.Status == 1).EffectiveDate = moment(this.employeedetails.EmploymentContracts[0].StartDate).format('YYYY-MM-DD')
      }
      this.employeeModel.newobj = this.employeedetails;
      this.employeeModel.oldobj = this.employeedetails;
      console.log('EMP DET UPSERT ::', this.employeedetails);

      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {

          this.loadingScreenService.stopLoading();
          if (data.Status) {
            if (LstfieldValue != null && LstfieldValue.length > 0) {
              var dynamicFieldsValue = new DynamicFieldsValue();
              dynamicFieldsValue.CandidateId = 0;
              dynamicFieldsValue.EmployeeId = this.EmployeeId;
              dynamicFieldsValue.FieldValues = LstfieldValue;
              dynamicFieldsValue.Id = this.Dynamicfieldvalue != null ? this.Dynamicfieldvalue.Id : 0;
              LstdynamicFieldsValue.push(dynamicFieldsValue);
            }

            this.onboardingService.UpsertDynamicFieldsValue(JSON.stringify(LstdynamicFieldsValue))
              .subscribe((rs) => {
                console.log('DY RESPONSE :: ', rs);
              })

            this.alertService.showSuccess(data.Message);
            this.doRefresh();
          } else {
            this.alertService.showWarning(data.Message);
          }
        });
      }
    }
    catch (e) {
      console.log('e', e);
    }
  }



  /// FINAL HANDLER 

  EmitHandler() {
    console.log('off entered');

    try {


      var startdate = new Date(this.employeeForm.get('employementstartdate').value);


      var enddate = new Date(this.employeeForm.get('employementenddate').value);
      this.employeedetails.EmploymentContracts[0].ClientContractId = this.employeeForm.get('contractname').value;
      this.employeedetails.EmploymentContracts[0].EmploymentType = this.employeeForm.get('employmentType').value == null ? 0 : this.employeeForm.get('employmentType').value;

      this.employeedetails.EmploymentContracts[0].Department = this.employeeForm.get('Department').value;

      this.employeedetails.EmploymentContracts[0].DepartmentId = this.employeeForm.get('DepartmentId').value == null || this.employeeForm.get('DepartmentId').value == undefined || this.employeeForm.get('DepartmentId').value == "" ? 0 : this.employeeForm.get('DepartmentId').value;

      this.employeedetails.EmploymentContracts[0].Division = this.employeeForm.get('Division').value == null || this.employeeForm.get('Division').value == undefined || this.employeeForm.get('Division').value == "" ? 0 : this.employeeForm.get('Division').value;


      this.employeedetails.EmploymentContracts[0].Grade = this.employeeForm.get('Grade').value;

      this.employeedetails.EmploymentContracts[0].StartDate = startdate as any == "Invalid Date" ? null : moment(startdate).format('YYYY-MM-DD');
      this.employeedetails.EmploymentContracts[0].EndDate = startdate as any == "Invalid Date" ? null : moment(enddate).format('YYYY-MM-DD');
      this.employeedetails.EmploymentContracts[0].Designation = this.employeeForm.get('Designation').value != null && this.employeeForm.get('Designation').value != undefined && this.employeeForm.get('Designation').value != 0 ? this.DesignationList.length > 0 ? this.DesignationList.find(a => a.Id == this.employeeForm.get('Designation').value).Name : "" : "";
      this.employeedetails.EmploymentContracts[0].DesignationId = this.employeeForm.get('Designation').value;

      this.employeedetails.EmploymentContracts[0].Category = this.employeeForm.get('Category').value;

      this.employeedetails.EmploymentContracts[0].WorkLocation = this.employeeForm.get('Location').value == null ? 0 : this.employeeForm.get('Location').value;
      this.employeedetails.EmploymentContracts[0].ClientLocationId = this.employeeForm.get('Location').value == null ? 0 : this.employeeForm.get('Location').value;
      this.employeedetails.EmploymentContracts[0].ReportingLocation = this.employeeForm.get('ReportingLocation').value == null ? 0 : this.employeeForm.get('ReportingLocation').value;
      this.employeedetails.EmploymentContracts[0].StateId = this.StateId as any;
      this.employeedetails.EmploymentContracts[0].CityId = this.employeeForm.get('CityId').value == null ? 0 : this.employeeForm.get('CityId').value;
      this.employeedetails.EmploymentContracts[0].CostCodeId = this.employeeForm.get('costcode').value == null ? 0 : this.employeeForm.get('costcode').value;
      // this.employeedetails.EmploymentContracts[0].LeaveGroupId = this.employeeForm.get('noticePeriodDays').value == null ? 0 : this.employeeForm.get('noticePeriodDays').value;

      this.employeedetails.EmploymentContracts[0].NoticePeriodDays = this.employeeForm.get('noticePeriodDays').value == null ? 0 : this.employeeForm.get('noticePeriodDays').value;

      this.employeedetails.EmploymentContracts[0].Modetype = UIMode.Edit;
      this.employeedetails.EmploymentContracts[0].TeamId = this.employeeForm.get('teamname').value == null ? 0 : this.employeeForm.get('teamname').value;
      this.employeedetails.EmploymentContracts[0].ManagerId = this.employeeForm.get('reportingmanager').value == null ? 0 : this.employeeForm.get('reportingmanager').value;
      console.log(this.employeeForm.value)
      this.employeedetails.EmploymentContracts[0].CustomData1 = this.employeeForm.get('CustomData1').value;
      this.employeedetails.EmploymentContracts[0].CustomData2 = this.employeeForm.get('CustomData2').value;
      this.employeedetails.EmploymentContracts[0].CustomData3 = this.employeeForm.get('CustomData3').value;
      this.employeedetails.EmploymentContracts[0].CustomData4 = this.employeeForm.get('CustomData4').value;

      if (this.employeedetails.Id > 0 && this.employeedetails.ELCTransactions != null && this.employeedetails.ELCTransactions.length > 0 && this.employeedetails.ELCTransactions[0].Id > 0) {
        this.employeedetails.ELCTransactions[0].Location = this.employeeForm.get('Location').value == null ? 0 : this.employeeForm.get('Location').value;
        this.employeedetails.ELCTransactions[0].State = this.StateId as any;
        this.employeedetails.ELCTransactions[0].CityId = this.employeeForm.get('CityId').value == null ? 0 : this.employeeForm.get('CityId').value;
        this.employeedetails.ELCTransactions[0].Modetype = UIMode.Edit;
      }

      if (this.employeedetails.Id == 0) {

        this.employeedetails.Code = this.employeeForm.value.employeecode;
        this.employeedetails.EmploymentContracts[0].ClientId = this.employeeForm.value.clientname
        this.employeedetails.EmploymentContracts[0].ClientContractId = this.employeeForm.value.contractname
        this.employeedetails.EmploymentContracts[0].ClientLocationId = this.employeeForm.value.Location
        this.employeedetails.EmploymentContracts[0].ReportingLocation = this.employeeForm.value.ReportingLocation
        this.employeedetails.EmploymentContracts[0].OpenPayPeriodId = this.employeeForm.value.effectivePeriod; // this.teamObject != null ? this.teamObject.OpenPayPeriodId : 0;
        this.employeedetails.EmploymentContracts[0].StateId = this.StateId as any
        this.employeedetails.EmploymentContracts[0].CityId = this.CityId as any
        this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted = false
        this.employeedetails.EmploymentContracts[0].IsESICApplicable = false
        this.employeedetails.EmploymentContracts[0].IsResigned = false
        this.employeedetails.EmploymentContracts[0].IsFirstMonthPayoutdone = false;
        this.employeedetails.EmploymentContracts[0].Department = this.employeeForm.value.Department;
        this.employeedetails.EmploymentContracts[0].DepartmentId = this.employeeForm.value.DepartmentId == null ? 0 : this.employeeForm.value.DepartmentId;

        this.employeedetails.EmploymentContracts[0].Division = this.employeeForm.value.Division == null ? 0 : this.employeeForm.value.Division;

        this.employeedetails.EmploymentContracts[0].PayCycleId = this.payCyleId;
        this.employeedetails.EmploymentContracts[0].LeaveGroupId = this.employeeForm.value.leaveGroup == null ? 0 : this.employeeForm.value.leaveGroup;
        // ELC TRANSACTION

        console.log('this.employeeForm.value', this.employeeForm.value);

        // if (this.employeedetails.ELCTransactions.length == 0) {
        var rlcTrans: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();
        rlcTrans.SkillCategory = this.employeeForm.value.skillCategory;
        rlcTrans.IndustryId = this.employeeForm.value.industryType;
        rlcTrans.Zone = this.employeeForm.value.zone;
        rlcTrans.ELCTransactionTypeId = ELCTRANSACTIONTYPE.SalaryRevision;
        rlcTrans.Location = this.employeeForm.get('Location').value == null ? 0 : this.employeeForm.get('Location').value;
        rlcTrans.State = this.StateId as any;
        rlcTrans.CityId = this.CityId as any;
        rlcTrans.EffectiveDate = moment(startdate).format('YYYY-MM-DD');
        rlcTrans.EffectivePayPeriodId = this.employeeForm.value.effectivePeriod;
        // rlcTrans.Designation = this.employeeForm.value.Designation;
        rlcTrans.Designation = this.employeeForm.get('Designation').value != null && this.employeeForm.get('Designation').value != undefined && this.employeeForm.get('Designation').value != 0 ? this.DesignationList.length > 0 ? this.DesignationList.find(a => a.Id == this.employeeForm.value.Designation).Name : "" : "";
        rlcTrans.Status = 2;
        rlcTrans.DateOfJoining = moment(startdate).format('YYYY-MM-DD');
        rlcTrans.EndDate = moment(enddate).format('YYYY-MM-DD');
        this.employeedetails.EmploymentContracts[0].NoticePeriodDays != null ? rlcTrans.NoticePeriodDays = this.employeedetails.EmploymentContracts[0].NoticePeriodDays : true;
        rlcTrans.EmploymentType = this.employeedetails.EmploymentContracts[0].EmploymentType == null ? 0 : this.employeedetails.EmploymentContracts[0].EmploymentType;
        rlcTrans.IsLatest = true;
        rlcTrans.CompanyId = this.CompanyId;
        rlcTrans.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
        rlcTrans.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
        // rlcTrans.Gender = Gender.Male;
        rlcTrans.LstPayGroupProductOverrRides = [];
        this.employeedetails.ELCTransactions = [];
        this.employeedetails.ELCTransactions.push(rlcTrans);
        // }

        var _employeeRateset: EmployeeRateset = new EmployeeRateset();
        // if (this.employeedetails.EmployeeRatesets == null || this.employeedetails.EmployeeRatesets == undefined || this.employeedetails.EmployeeRatesets.length == 0) {
        this.employeedetails.EmployeeRatesets = [];
        _employeeRateset.IsMonthlyValue = this.employeeForm.get('forMonthlyValue').value == true ? true : false;
        _employeeRateset.AnnualSalary = this.employeeForm.get('annualSalary').value;
        _employeeRateset.MonthlySalary = this.employeeForm.get('forMonthlyValue').value == true ? this.employeeForm.get('MonthlySalary').value : this.employeeForm.get('annualSalary').value / 12;

        _employeeRateset.SalaryBreakUpType = this.employeeForm.get('salaryType').value
        _employeeRateset.PayGroupdId = this.employeeForm.get('payGroup').value;
        _employeeRateset.EffectiveDate = moment(startdate).format('YYYY-MM-DD');
        _employeeRateset.EffectivePeriodId = this.employeeForm.value.effectivePeriod;
        _employeeRateset.Modetype = UIMode.Edit;
        _employeeRateset.IsLatest = true;
        _employeeRateset.Status = 1;

        this.employeedetails.EmployeeRatesets[0] = _employeeRateset;
        this.employeedetails.ELCTransactions[0].EmployeeRatesets = this.employeedetails.EmployeeRatesets;
        // }
        console.log('this.NewELCTransaction', Object.keys(this.NewELCTransaction).length);
        if (Object.keys(this.NewELCTransaction).length > 0) {
          // if (this.NewELCTransaction != null) {
          this.employeedetails.EmploymentContracts[0].LstRateSets = this.NewELCTransaction.EmployeeRatesets;
          this.employeedetails.EmployeeRatesets = []
          this.employeedetails.EmployeeRatesets = this.NewELCTransaction.EmployeeRatesets
          this.employeedetails.ELCTransactions = [];
          this.employeedetails.ELCTransactions.push(this.NewELCTransaction);
        }


        var obj = { Dynamicfieldvalue: this.Dynamicfieldvalue, DynamicFieldDetails: this.DynamicFieldDetails, employeedetails: this.employeedetails, OfferSkillZoneInfo: this.OfferSkillZoneInfo, MigrationInfoGrp: this.MigrationInfoGrp };
        this.officialChangeHandler.emit(obj);

      }
    } catch (error) {
      console.log('Emit handler - EXE ERR :: ', error);

    }


  }

  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();
      var obj = { Dynamicfieldvalue: this.Dynamicfieldvalue, DynamicFieldDetails: this.DynamicFieldDetails, employeedetails: this.employeedetails, OfferSkillZoneInfo: this.OfferSkillZoneInfo, MigrationInfoGrp: this.MigrationInfoGrp };
      this.officialChangeHandler.emit(obj);

    }
  }

  getDynamicFieldDetailsConfig(_companyId, _clientId, _clientContractId) {
    this.IsDFDLoaded = false;
    var promise = new Promise((resolve, reject) => {
      this.spinner = true;
      this.onboardingService.getDynamicFieldDetails(_companyId, _clientId, _clientContractId, null)
        .subscribe((response) => {
          console.log('DFD RES ::', response);
          this.IsDFDLoaded = true;
          console.log('IsDFDLoaded', this.IsDFDLoaded);

          let apiresult: apiResult = response;
          try {


            if (apiresult.Status && apiresult.Result != null) {
              this.DynamicFieldDetails = apiresult.Result as any;
              var filteredItems = [];
              filteredItems = this.DynamicFieldDetails.ControlElemetsList.filter(z => z.ExtraProperities.ViewableRoleCodes.includes(this.RoleCode) == true);
              this.DynamicFieldDetails.ControlElemetsList = filteredItems;
              this.DynamicFieldDetails.ControlElemetsList.forEach(ele => {
                ele.LoadDataOnPageLoad == true ? this.getDropDownList(ele) : true;
              });
              console.log('DFD ::', filteredItems);

              // this.EmployeeId != 0 && this.onboardingService.GetDynamicFieldsValue(this.EmployeeId, 6)
              //   .subscribe((getValue) => {
              //     console.log('DFD VALUES ::', getValue);
              //     let apires: apiResult = getValue;
              //     if (apires.Status && apires.Result != null) {
              //       this.Dynamicfieldvalue = apires.Result as any;
              //       if (filteredItems.length > 0 && this.Dynamicfieldvalue != null && this.Dynamicfieldvalue.FieldValues != null && this.Dynamicfieldvalue.FieldValues.length > 0) {
              //         this.Dynamicfieldvalue.FieldValues.forEach(ee => {
              //           var isexsit = this.DynamicFieldDetails.ControlElemetsList.find(a => a.FieldName == ee.FieldName)
              //           isexsit != null && isexsit != undefined && (isexsit.Value = ee.Value != null ? isexsit.InputControlType == 3 ? Number(ee.Value) as any : ee.Value : null);
              //         });
              //         console.log('UPD DFD VAL :', this.Dynamicfieldvalue);
              //       }
              //       this.spinner = false;

              //     } else {
              //       this.spinner = false;
              //     }
              //   })
              this.spinner = false;
            }
            else {
              this.spinner = false;
            }
          } catch (error) {
            console.log(
              "DFD EXC ::", error
            );

          }

        }, error => {
          this.spinner = false;
        })
    });
    return promise;
  }

  isDynamicAccordionAvailable(AccordionName) {

    return this.DynamicFieldDetails.ControlElemetsList.find(item => item.TabName == AccordionName) != undefined ? true : false;
  }

  isEmptyObject(obj) {
    console.log('obj obj', obj);

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

  getClientMasterDropdown(propName) {
    this.ngselectLoader = true;
    console.log('coming...');

    try {
      if (propName == 'Client' && this.ClientList.length == 0) {
        this.clientService.GetMappedClientListByUser().subscribe((data) => {
          let apiR: apiResult = data;
          if (apiR.Status && apiR.Result != null) {
            this.ClientList = JSON.parse(apiR.Result);
            this.OfferInfoListGrp.ClientList = this.ClientList;
          }
          this.ngselectLoader = false;
        })
      }

      // else if (propName == "ClientContract" && this.employeeForm.value.clientname) {
      //   this.clientService.GetMappedClientContractListByUser(this.employeeForm.value.clientname).subscribe((data) => {
      //     let apiR: apiResult = data;
      //     if (apiR.Status && apiR.Result != null) {
      //       this.ClientContractList = JSON.parse(apiR.Result);
      //     }
      //     this.ngselectLoader = false;
      //   })
      // }
      // else if (propName == "ClientLocation" && this.employeeForm.value.clientname) {
      //   this.clientService.GetClientLocationByClientId(this.employeeForm.value.clientname).subscribe((data) => {
      //     let apiR: apiResponse = data;
      //     console.log('sss', apiR)
      //     if (apiR.Status && apiR.dynamicObject != null) {
      //       this.ClientLocationList = (apiR.dynamicObject);
      //     }
      //     this.ngselectLoader = false;
      //   })
      // }
    } catch (error) {
      console.log('EXEPTION ERR ::', error);

    }

  }

  onChangeClient(item: ClientList) {
    console.log('Client Ev ::', item);

    // if (this.employeedetails.Id == 0 && this.employeeForm.value.isMinimumwages == false) {
    //   this.employeeForm.controls['industryType'].setValue(item.IndustryId);
    // }

    this.ClientContractList = [];
    this.OfferInfoListGrp.ClientContractList = [];
    this.ClientLocationList = [];
    this.ClientReportingLocationList = [];
    this.ClientCityList = [];
    this.OfferInfoListGrp.ClientLocationList = [];
    this.OfferInfoListGrp.ClientReportingLocationList = [];

    // this.employeeForm.controls['clientname'].setValue(item.Id);
    this.employeeForm.controls['contractname'] != null ? this.employeeForm.controls['contractname'].setValue(null) : null;
    this.employeeForm.controls['Location'] != null ? this.employeeForm.controls['Location'].setValue(null) : null;
    this.employeedetails.EmploymentContracts[0].ClientId = this.employeeForm.value.clientname;
    this.Common_GetEmployeeAccordionDetails('isEmploymentDetails');
  }
  onChangeClientContract(item: ClientContractList) {
    console.log('Contract Ev ::', item);
    this.contractObject = item;
    this.getMigrationMasterInfo(this.employeeForm.value.contractname);
  }


  onFocus_OfferAccordion(newValue, Formindex) {


    return new Promise((resolve, reject) => {

      // if (this.NewRt != null && this.NewRt.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
      //   this._LstRateSet = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet;
      // }


      if (this.NewRt != null && this.NewRt.length > 0) {

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


          if (this.NewRt.length > 0) {
            this.NewRt = [];
            try {
              console.log('CLER Confirm :', this.employeedetails)
              if (this.employeedetails.EmployeeRatesets.length > 0) {
                this.employeedetails.EmployeeRatesets[0].RatesetProducts = [];
                this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = [];
                this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts = [];
              } else {
                this.employeedetails.EmployeeRatesets = [];
              }

              if (this.employeedetails.EmploymentContracts.length > 0 &&
                this.employeedetails.EmploymentContracts[0].LstRateSets.length > 0 &&
                this.employeedetails.EmploymentContracts[0].LstRateSets[0]) {
                this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = [];
              }

              if (this.employeedetails.ELCTransactions.length > 0 && this.employeedetails.ELCTransactions[0].EmployeeRatesets.length > 0) {
                this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts = [];
              }

            } catch (error) {
              console.log('CLER ISS :', error);

            }
          }


        })



      }

    });

  }


  doSalaryBreakup() {

    // console.log('sstar', this.employeeForm.get('employementstartdate').value);

    // const modalRef = this.modalService.open(SalarybreakupmodalComponent, this.modalOption);
    // modalRef.componentInstance.NewRt = this.NewRt;
    // modalRef.result.then((result) => {
    //   console.log('modal closed ', result);
    //   if (result != "Modal Closed") {

    //   } else {
    //   }
    // }).catch((error) => {
    //   console.log(error);
    // });

    // return;

    if (
      // true
      this.employeeForm.controls['industryType'].valid
      &&
      this.employeeForm.controls['employementstartdate'].valid
      &&
      this.employeeForm.controls['Designation'].valid
      &&

      // this.employeeForm.controls['reportingmanager'].valid
      // &&
      this.employeeForm.controls['Location'].valid &&
      this.employeeForm.controls['skillCategory'].valid &&
      this.employeeForm.controls['zone'].valid &&
      this.employeeForm.controls['salaryType'].valid &&
      this.employeeForm.controls['annualSalary'].valid &&
      this.employeeForm.controls['payGroup'].valid &&
      this.employeeForm.get('annualSalary').value > 0 &&
      this.employeeForm.get('industryType').value > 0 &&
      this.employeeForm.get('Location').value > 0 &&
      this.employeeForm.get('skillCategory').value > 0 &&
      this.employeeForm.get('effectivePeriod').value > 0 &&
      this.employeeForm.get('payGroup').value > 0 &&
      this.employeeForm.get('salaryType').value > 0 &&
      this.employeeForm.get('Designation').value != "" &&
      this.employeeForm.get('Designation').value != null &&
      this.employeeForm.get('Designation').value != undefined &&
      this.employeeForm.get('employementstartdate').value != "" &&
      this.employeeForm.get('employementstartdate').value != "Invalid Date"
      // &&
      // this.employeeForm.get('reportingmanager').value > 0

    ) {

      if (this.isAllenDigital && (!this.employeeForm.controls['CityId'].valid || this.employeeForm.get('CityId').value <= 0)) {
        this.alertService.showWarning("Joining Location is required. Please check the form and Preview again.")
        return;
      }


      if (this.IsReportingManagerRequired && (!this.employeeForm.controls['reportingmanager'].valid || this.employeeForm.get('reportingmanager').value <= 0)) {
        this.alertService.showWarning("(Reporting Manager is required. Please check the form and Preview again.")
        return;
      }

      if (this.isAllenDigital && (!this.employeeForm.controls['DepartmentId'].valid || this.employeeForm.get('DepartmentId').value <= 0)) {
        this.alertService.showWarning("Department is required. Please check the form and Preview again.")
        return;
      }

      if (this.isAllenDigital && (!this.employeeForm.controls['Division'].valid || this.employeeForm.get('Division').value <= 0)) {
        this.alertService.showWarning("Division is required. Please check the form and Preview again.")
        return;
      }

      if (this.isAllenDigital && (!this.employeeForm.controls['Category'].valid || this.employeeForm.get('Category').value <= 0)) {
        this.alertService.showWarning("Category is required. Please check the form and Preview again.")
        return;
      }

      // if (this.isAllenDigital && (!this.employeeForm.controls['ReportingLocation'].valid || this.employeeForm.get('ReportingLocation').value <= 0)) {
      //   this.alertService.showWarning("Reporting Location is required. Please check the form and Preview again.")
      //   return;
      // }

      if (this.isAllenDigital && (!this.employeeForm.controls['employmentType'].valid || this.employeeForm.get('employmentType').value <= 0)) {
        this.alertService.showWarning("Employment Type is required. Please check the form and Preview again.")
        return;
      }

      // if (this.employeedetails.EmployeeRatesets != null && this.employeedetails.EmployeeRatesets.length > 0) {
      // this.employeedetails.EmployeeRatesets[0].AnnualSalary = this.employeeForm.get('annualSalary').value;
      // this.employeedetails.EmployeeRatesets[0].MonthlySalary = this.employeedetails.EmploymentContracts[0].LstRateSets[0].AnnualSalary / 12;
      // this.employeedetails.EmployeeRatesets[0].SalaryBreakUpType = SalaryBreakUpType.CTC;
      // this.employeedetails.EmployeeRatesets[0].PayGroupdId = 5;
      // this.employeedetails.EmployeeRatesets[0].EffectiveDate = '2023-06-01';
      // this.employeedetails.EmployeeRatesets[0].EffectivePeriodId = 82;
      // this.employeedetails.EmployeeRatesets[0].Modetype = UIMode.Edit;
      // this.employeedetails.Gender = 1 as any;

      if (this.IsZeroBasedCalculationRequired) {
        this.loadingScreenService.startLoading();


        if (this.NewRt == null && this.NewRt == undefined || this.NewRt.length == 0) {

          var rlcTrans: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();
          var _employeeRateset: EmployeeRateset = new EmployeeRateset();
          // if (this.employeedetails.EmployeeRatesets == null || this.employeedetails.EmployeeRatesets == undefined || this.employeedetails.EmployeeRatesets.length == 0) {
          this.employeedetails.EmployeeRatesets = [];

          _employeeRateset.IsMonthlyValue = this.employeeForm.get('forMonthlyValue').value == true ? true : false;
          _employeeRateset.AnnualSalary = this.employeeForm.get('annualSalary').value;
          _employeeRateset.MonthlySalary = this.employeeForm.get('forMonthlyValue').value == true ? this.employeeForm.get('MonthlySalary').value : this.employeeForm.get('annualSalary').value / 12;

          _employeeRateset.SalaryBreakUpType = this.employeeForm.get('salaryType').value
          _employeeRateset.PayGroupdId = this.employeeForm.get('payGroup').value;
          _employeeRateset.EffectiveDate = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
          _employeeRateset.EffectivePeriodId = this.employeeForm.value.effectivePeriod;
          _employeeRateset.Modetype = UIMode.Edit;
          _employeeRateset.IsLatest = true;
          _employeeRateset.Status = 1;
          rlcTrans.EmployeeRatesets = [];
          rlcTrans.EmployeeRatesets[0] = _employeeRateset;

          rlcTrans.Id = 0;
          rlcTrans.SkillCategory = this.employeeForm.value.skillCategory;
          rlcTrans.IndustryId = this.employeeForm.value.industryType;
          rlcTrans.Zone = this.employeeForm.value.zone;
          rlcTrans.ELCTransactionTypeId = ELCTRANSACTIONTYPE.SalaryRevision;
          rlcTrans.DOB = this.employeedetails.DateOfBirth != null && this.employeedetails.DateOfBirth == '1970-01-01' ? '1970-01-01' : moment(this.employeedetails.DateOfBirth).format('YYYY-MM-DD')
          rlcTrans.Location = this.employeeForm.get('Location').value == null ? 0 : this.employeeForm.get('Location').value;
          rlcTrans.State = this.StateId as any;
          rlcTrans.CityId = this.CityId as any;
          rlcTrans.EffectiveDate = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
          rlcTrans.EffectivePayPeriodId = this.employeeForm.value.effectivePeriod;
          // rlcTrans.Designation = this.employeeForm.value.Designation;
          rlcTrans.Designation = this.DesignationList.length > 0 ? this.DesignationList.find(a => a.Id == this.employeeForm.value.Designation).Name : "";

          rlcTrans.Status = 2;
          rlcTrans.DateOfJoining = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
          rlcTrans.EndDate = moment(this.employeeForm.value.employementenddate).format('YYYY-MM-DD')
          rlcTrans.NoticePeriodDays = this.employeeForm.value.noticePeriodDays == null ? 0 : this.employeeForm.value.noticePeriodDays;
          rlcTrans.EmploymentType = this.employeeForm.value.employmentType == null ? 0 : this.employeeForm.value.employmentType;
          rlcTrans.IsLatest = true;
          rlcTrans.CompanyId = this.CompanyId;
          rlcTrans.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
          rlcTrans.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
          rlcTrans.DepartmentId = this.employeeForm.value.DepartmentId;
          rlcTrans.Division = this.employeeForm.value.Division;
          // rlcTrans.Gender = Gender.Male;
          rlcTrans.LstPayGroupProductOverrRides = this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0 ? this.lstOfPaygroupOverrideProducts : [];
          this.employeedetails.ELCTransactions = [];
          this.employeedetails.ELCTransactions.push(rlcTrans);

          this.productService.GetPayGroupDetailsbyId(this.employeeForm.get('payGroup').value).subscribe((result) => {
            console.log('resut', result);

            try {
              let actualprops = ["BillableRate", "BillingType", "CandidateId", "ClientId", "DisplayName", "DisplayOrder", "EmployeeId", "EmployeeRatesetId", "Id", "IsDisplayRequired", "IsOveridable", "IsOverridableProductGroup", "Modetype", "PayableRate", "PaymentType", "ProductCTCPayrollRuleMappingId", "ProductCode", "ProductId", "ProductTypeCode", "ProductTypeId", "RuleId", "Value"];
              let apiR: apiResponse = result;
              if (apiR.Status && apiR.dynamicObject != null) {
                let LstPayGroupProduct = apiR.dynamicObject.LstPayGroupProduct;
                if (LstPayGroupProduct.length > 0) {

                  LstPayGroupProduct.forEach(element => {
                    element['ProductCode'] = element.product.Code;
                    element['ProductTypeCode'] = element.product.ProductType.Code
                  });

                  let filteredObjects = LstPayGroupProduct.map(obj => {
                    let newObj = {};
                    for (let prop of actualprops) {
                      if (obj.hasOwnProperty(prop)) {
                        newObj[prop] = obj[prop];
                      }
                      else {
                        switch (prop) {
                          case "BillableRate":
                          case "BillingType":
                          case "CandidateId":
                          case "ClientId":
                          case "DisplayOrder":
                          case "EmployeeId":
                          case "EmployeeRatesetId":
                          case "Id":
                          case "Modetype":
                          case "PayableRate":
                          case "PaymentType":
                          case "ProductCTCPayrollRuleMappingId":
                          case "ProductId":
                          case "ProductTypeId":
                          case "RuleId":
                          case "Value":
                            newObj[prop] = 0;
                            break;
                          case "IsDisplayRequired":
                          case "IsOveridable":
                          case "IsOverridableProductGroup":
                            newObj[prop] = true;
                            break;
                          default:
                            newObj[prop] = null;
                            break;
                        }
                      }
                    }
                    return newObj;
                  });
                  console.log('filteredObjects', filteredObjects);
                  if (filteredObjects.length > 0) {
                    filteredObjects.forEach(e3 => {
                      e3.Id = 0;
                    });
                  }
                  this.NewRt = [];
                  this.NewRt = filteredObjects;
                  if (this.NewRt != undefined && this.NewRt != null && this.NewRt.length > 0) {
                    this.NewRt = _.orderBy(this.NewRt, ["DisplayOrder"], ["asc"]);
                  }
                  console.log('NewRt PREVIEW :', this.NewRt);
                  this.loadingScreenService.stopLoading();

                  rlcTrans.IsRateSetValid = true;
                  rlcTrans.IsMinimumwageAdhere = true;
                  rlcTrans.CalculationRemarks = "";


                  rlcTrans.EmployeeRatesets.length > 0 ? rlcTrans.EmployeeRatesets[0].RatesetProducts = this.NewRt : true;
                  this.NewELCTransaction = rlcTrans;


                  const modalRef = this.modalService.open(SalarybreakupmodalComponent, this.modalOption);
                  modalRef.componentInstance.NewRt = this.NewRt;
                  modalRef.componentInstance.NewELCTransaction = this.NewELCTransaction;
                  modalRef.componentInstance.employeedetails = this.employeedetails;
                  modalRef.componentInstance.lstOfPaygroupOverrideProducts = this.lstOfPaygroupOverrideProducts;
                  modalRef.result.then((result) => {
                    console.log('modal closed ', result);

                    //Setting the monthly salary and annual salary after the salary breakdown is done
                    let getCategoryType = this.employeeForm.get('Category').value
                    if (getCategoryType == 1) {//Executive
                      result.NewRt.forEach((item) => {
                        if (item.ProductCode == 'CTC') {
                          this.employeeForm.controls['MonthlySalary'].setValue(item.Value)
                          this.employeeForm.controls['annualSalary'].setValue(item.Value * 12)
                        }
                      })
                    } else if (getCategoryType == 2) {//Staff
                      result.NewRt.forEach((item) => {
                        if (item.ProductCode == 'GrossEarn') {
                          this.employeeForm.controls['MonthlySalary'].setValue(item.Value)
                          this.employeeForm.controls['annualSalary'].setValue(item.Value * 12)
                        }
                      })
                    }

                    if (result != "Modal Closed") {
                      if (result.Activity == 'RecalculateCTC') {
                        this.NewRt = result.NewRt;
                        // this.recalculateCTC();
                      }
                      else if (result.Activity == 'ReviewLater') {
                        this.NewRt = [];
                        try {

                          // this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts = [];
                          // this.employeedetails.EmployeeRatesets && this.employeedetails.EmployeeRatesets.length > 0 ? this.employeedetails.EmployeeRatesets[0].RatesetProducts = [] : true;

                          if (this.employeedetails.EmployeeRatesets.length > 0) {
                            this.employeedetails.EmployeeRatesets[0].RatesetProducts = [];
                            this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = [];
                            this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts = [];
                          } else {
                            this.employeedetails.EmployeeRatesets = [];
                          }

                          if (this.employeedetails.EmploymentContracts.length > 0 &&
                            this.employeedetails.EmploymentContracts[0].LstRateSets.length > 0 &&
                            this.employeedetails.EmploymentContracts[0].LstRateSets[0]) {
                            this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = [];
                          }

                          if (this.employeedetails.ELCTransactions.length > 0 && this.employeedetails.ELCTransactions[0].EmployeeRatesets.length > 0) {
                            this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts = [];
                          }


                        } catch (error) {
                          console.log('CLER ISS 2 :', error);

                        }

                      }
                      else if (result.Activity == "Confirm") {
                        this.NewRt = result.NewRt;
                        const annualSalary = (this.employeeForm.get('annualSalary').value);
                        const monthlySalary = (this.employeeForm.get('MonthlySalary').value);
                        const defaultRuleAndMappingIds = this.DefaultRuleIdForPFWages != null && this.DefaultRuleIdForPFWages != undefined && this.DefaultRuleIdForPFWages.length > 0 ?
                          this.DefaultRuleIdForPFWages.find(a => a.Category == getCategoryType) : null

                        if (this.NewRt.length > 0) {
                          for (let m = 0; m < this.NewRt.length; m++) {
                            const element = this.NewRt[m];
                            if (element.ProductCode.toUpperCase() == 'PFWAGES') {
                              element.RuleId = defaultRuleAndMappingIds != null ? defaultRuleAndMappingIds.RuleId : 397;
                            }
                          }
                        }

                        this.employeedetails.EmploymentContracts.length > 0 ?
                          this.employeedetails.EmploymentContracts[0].PFLogic = this.DefaultPFLogicProductCode : true;

                        if (this.NewELCTransaction.EmployeeRatesets.length > 0) {
                          this.NewELCTransaction.EmployeeRatesets[0].AnnualSalary = annualSalary
                          this.NewELCTransaction.EmployeeRatesets[0].MonthlySalary = monthlySalary;
                          this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts = this.NewRt;
                        }

                        if (this.employeedetails.EmployeeRatesets && this.employeedetails.EmployeeRatesets.length > 0) {
                          this.employeedetails.EmployeeRatesets[0].AnnualSalary = annualSalary;
                          this.employeedetails.EmployeeRatesets[0].MonthlySalary = monthlySalary;
                          this.employeedetails.EmployeeRatesets[0].RatesetProducts = this.NewRt
                        }

                        if (this.employeedetails.EmploymentContracts.length > 0 &&
                          this.employeedetails.EmploymentContracts[0].LstRateSets.length > 0 &&
                          this.employeedetails.EmploymentContracts[0].LstRateSets[0]) {
                          this.employeedetails.EmploymentContracts[0].LstRateSets[0].AnnualSalary = annualSalary;
                          this.employeedetails.EmploymentContracts[0].LstRateSets[0].MonthlySalary = monthlySalary;
                          this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = this.NewRt;
                        }
                      }
                    } else {
                    }
                  }).catch((error) => {
                    console.log(error);
                  });

                  // $('#popup_new_salary_breakup').modal('show');
                  return;
                }

              }
              else {

              }

            } catch (error) {
              console.log('ERR PREVIEW :', error);
              this.loadingScreenService.stopLoading();
            }

          })
          return;
        }
        else {
          if (this.NewRt && this.NewRt.length > 0) {

            this.NewRt.forEach(element => {
              if (element.ProductCode == "CTC") {
                // element.Value = Number(element.Value) * 12;
                this.TotalCTC = Number(element.Value) * 12;
              }
            })

            this.loadingScreenService.stopLoading();
            $('#popup_new_salary_breakup').modal('show');
            return;
          }
        }
      }



      try {


        if (this.NewRt && this.NewRt.length > 0) {
          this.loadingScreenService.stopLoading();
          $('#popup_new_salary_breakup').modal('show');
          return;
        }

        // if (!this.isRecalculate && this.NewELCTransaction && this.NewELCTransaction.EmployeeRatesets && this.NewELCTransaction.EmployeeRatesets.length > 0 &&
        //   this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts && this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts.length > 0) {
        //   this.doCalculateCTC(this.NewELCTransaction);
        //   return;
        // }

        // var _elcTransaction: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();
        // _elcTransaction.Id = 0;
        // _elcTransaction.Location = 7158
        // _elcTransaction.IndustryId = 38 // default industry type 
        // _elcTransaction.SkillCategory =
        //   15
        // _elcTransaction.Zone = 2
        // _elcTransaction.State = 22; // this.StateId as any;
        // _elcTransaction.CityId = 3486
        // _elcTransaction.ELCTransactionTypeId = ELCTRANSACTIONTYPE.SalaryRevision;
        // _elcTransaction.DOB = '2000-01-01'
        // _elcTransaction.EffectiveDate = '2023-06-01'
        // _elcTransaction.EffectivePayPeriodId =
        //   122
        // _elcTransaction.Designation = 'sdfsd'
        // _elcTransaction.Gender = Gender.Male;
        // _elcTransaction.LstPayGroupProductOverrRides = [];
        // var _employeeRateset: EmployeeRateset = new EmployeeRateset();
        // _employeeRateset.AnnualSalary =
        //   440630
        // _employeeRateset.MonthlySalary =
        //   440630 / 12;
        // _employeeRateset.SalaryBreakUpType = SalaryBreakUpType.CTC;
        // _employeeRateset.PayGroupdId = 5;
        // _employeeRateset.EffectiveDate = '2023-06-01';
        // _employeeRateset.EffectivePeriodId =
        //   122;
        // _employeeRateset.Modetype = UIMode.Edit;
        // _elcTransaction.EmployeeRatesets = [];
        // _elcTransaction.EmployeeRatesets[0] = _employeeRateset;
        // this.employeedetails.ELCTransactions.push(_elcTransaction);

        // }




        // var _elcTransaction: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();
        // _elcTransaction.Id = 0;
        // _elcTransaction.Location = this.employeeForm.value.Location
        // _elcTransaction.IndustryId = this.employeeForm.value.industryType // default industry type 
        // _elcTransaction.SkillCategory = this.employeeForm.value.skillCategory; // this.employeeForm.value.isMinimumwages == false ?  this.locationObject.DefaultSkillCategoryId : this.employeeForm.value.skillCategory
        // _elcTransaction.Zone = this.employeeForm.value.zone; // this.employeeForm.value.isMinimumwages == false ? this.locationObject.DefaultZoneId : this.employeeForm.value.zone
        // _elcTransaction.State = this.StateId as any;
        // _elcTransaction.CityId = this.CityId as any;
        // _elcTransaction.ELCTransactionTypeId = ELCTRANSACTIONTYPE.SalaryRevision;
        // _elcTransaction.DOB = this.employeedetails.DateOfBirth != null && this.employeedetails.DateOfBirth == '1970-01-01' ? '1970-01-01' : moment(this.employeedetails.DateOfBirth).format('YYYY-MM-DD')
        // _elcTransaction.EffectiveDate = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
        // _elcTransaction.EffectivePayPeriodId = this.employeeForm.value.effectivePeriod;
        // _elcTransaction.Designation = this.employeeForm.value.Designation;
        // _elcTransaction.Gender = Gender.Male;
        // _elcTransaction.LstPayGroupProductOverrRides = [];
        // var _employeeRateset: EmployeeRateset = new EmployeeRateset();
        // _employeeRateset.AnnualSalary = this.employeeForm.get('annualSalary').value;
        // _employeeRateset.MonthlySalary = this.employeeForm.get('annualSalary').value / 12;
        // _employeeRateset.SalaryBreakUpType = this.employeeForm.value.salaryType;// this.employeeForm.value.isMinimumwages == false ? this.contractObject.DefaultSalaryType : this.employeeForm.value.salaryType
        // _employeeRateset.PayGroupdId =   this.employeeForm.value.payGroup;; //this.employeeForm.value.isMinimumwages == false ? this.teamObject.PayGroupId : this.employeeForm.value.payGroup;
        // _employeeRateset.EffectiveDate = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
        // _employeeRateset.EffectivePeriodId =  this.employeeForm.value.effectivePeriod; // this.teamObject.OpenPayPeriodId;
        // _employeeRateset.Modetype = UIMode.Edit;
        // _elcTransaction.EmployeeRatesets = [];
        // _elcTransaction.EmployeeRatesets[0] = _employeeRateset;
        // this.employeedetails.ELCTransactions.push(_elcTransaction);



        var rlcTrans: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();
        var _employeeRateset: EmployeeRateset = new EmployeeRateset();
        // if (this.employeedetails.EmployeeRatesets == null || this.employeedetails.EmployeeRatesets == undefined || this.employeedetails.EmployeeRatesets.length == 0) {
        this.employeedetails.EmployeeRatesets = [];

        _employeeRateset.IsMonthlyValue = this.employeeForm.get('forMonthlyValue').value == true ? true : false;
        _employeeRateset.AnnualSalary = this.employeeForm.get('annualSalary').value;
        _employeeRateset.MonthlySalary = this.employeeForm.get('forMonthlyValue').value == true ? this.employeeForm.get('MonthlySalary').value : this.employeeForm.get('annualSalary').value / 12;

        _employeeRateset.SalaryBreakUpType = this.employeeForm.get('salaryType').value
        _employeeRateset.PayGroupdId = this.employeeForm.get('payGroup').value;
        _employeeRateset.EffectiveDate = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
        _employeeRateset.EffectivePeriodId = this.employeeForm.value.effectivePeriod;
        _employeeRateset.Modetype = UIMode.Edit;
        _employeeRateset.IsLatest = true;
        _employeeRateset.Status = 1;
        rlcTrans.EmployeeRatesets = [];
        rlcTrans.EmployeeRatesets[0] = _employeeRateset;

        rlcTrans.Id = 0;
        rlcTrans.SkillCategory = this.employeeForm.value.skillCategory;
        rlcTrans.IndustryId = this.employeeForm.value.industryType;
        rlcTrans.Zone = this.employeeForm.value.zone;
        rlcTrans.ELCTransactionTypeId = ELCTRANSACTIONTYPE.SalaryRevision;
        rlcTrans.DOB = this.employeedetails.DateOfBirth != null && this.employeedetails.DateOfBirth == '1970-01-01' ? '1970-01-01' : moment(this.employeedetails.DateOfBirth).format('YYYY-MM-DD')
        rlcTrans.Location = this.employeeForm.get('Location').value == null ? 0 : this.employeeForm.get('Location').value;
        rlcTrans.State = this.StateId as any;
        rlcTrans.CityId = this.CityId as any;
        rlcTrans.EffectiveDate = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
        rlcTrans.EffectivePayPeriodId = this.employeeForm.value.effectivePeriod;
        // rlcTrans.Designation = this.employeeForm.value.Designation;
        rlcTrans.Designation = this.DesignationList.length > 0 ? this.DesignationList.find(a => a.Id == this.employeeForm.value.Designation).Name : "";

        rlcTrans.Status = 2;
        rlcTrans.DateOfJoining = moment(this.employeeForm.value.employementstartdate).format('YYYY-MM-DD')
        rlcTrans.EndDate = moment(this.employeeForm.value.employementenddate).format('YYYY-MM-DD')
        rlcTrans.NoticePeriodDays = this.employeeForm.value.noticePeriodDays == null ? 0 : this.employeeForm.value.noticePeriodDays;
        rlcTrans.EmploymentType = this.employeeForm.value.employmentType == null ? 0 : this.employeeForm.value.employmentType;
        rlcTrans.IsLatest = true;
        rlcTrans.CompanyId = this.CompanyId;
        rlcTrans.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
        rlcTrans.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
        rlcTrans.DepartmentId = this.employeeForm.value.DepartmentId;
        rlcTrans.Division = this.employeeForm.value.Division;
        // rlcTrans.Gender = Gender.Male;
        rlcTrans.LstPayGroupProductOverrRides = this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0 ? this.lstOfPaygroupOverrideProducts : [];
        this.employeedetails.ELCTransactions = [];
        this.employeedetails.ELCTransactions.push(rlcTrans);
        // }




        // var _elcTransaction: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();
        // _elcTransaction.Id = 0;
        // _elcTransaction.Location = 7158
        // _elcTransaction.IndustryId = 38 // default industry type 
        // _elcTransaction.SkillCategory =
        //   15
        // _elcTransaction.Zone = 2
        // _elcTransaction.State = 22; // this.StateId as any;
        // _elcTransaction.CityId = 3486
        // _elcTransaction.ELCTransactionTypeId = ELCTRANSACTIONTYPE.SalaryRevision;
        // _elcTransaction.DOB = '2000-01-01'
        // _elcTransaction.EffectiveDate = '2023-06-01'
        // _elcTransaction.EffectivePayPeriodId =
        //   122
        // _elcTransaction.Designation = 'sdfsd'
        // _elcTransaction.Gender = Gender.Male;
        // _elcTransaction.LstPayGroupProductOverrRides = this.lstOfPaygroupOverrideProducts;
        // var _employeeRateset: EmployeeRateset = new EmployeeRateset();
        // _employeeRateset.AnnualSalary =
        //   500000
        // _employeeRateset.MonthlySalary =
        //   440630 / 12;
        // _employeeRateset.SalaryBreakUpType = SalaryBreakUpType.CTC;
        // _employeeRateset.PayGroupdId = 5;
        // _employeeRateset.EffectiveDate = '2023-06-01';
        // _employeeRateset.EffectivePeriodId =
        //   122;
        // _employeeRateset.Modetype = UIMode.Edit;
        // _employeeRateset.RatesetProducts = this.NewRt && this.NewRt.length > 0 ? this.NewRt : [];
        // _elcTransaction.EmployeeRatesets = [];
        // _elcTransaction.EmployeeRatesets[0] = _employeeRateset;
        // this.employeedetails.ELCTransactions.push(_elcTransaction);

        this.loadingScreenService.startLoading();
        this.doCalculateCTC(rlcTrans);

      } catch (error) {
        console.log('ERR PREVIEW :', error);

        this.loadingScreenService.stopLoading();
      }

    }


    else {
      this.salaryBreakError();
      this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
      return;
    }


  }

  onWageTypeChangeFn(e): void {
    if (this.isDailyOrHourlyWages) {
      this.employeedetails.EmployeeRatesets[0].WageType = this.wageTypeString == 'Hourly' ? RateType.Hourly : RateType.Daily;
      this.setDefaultValuesForWageRateSetProducts();
    }
  }


  _update_tableStructure() {
    var lstProductGroup = [];
    this.NewRt.forEach(element => {
      lstProductGroup = [];

      if (this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0) {
        var isExistProduct = this.lstOfPaygroupOverrideProducts.find(a => a.ProductId == element.ProductId);
        if (isExistProduct != undefined) {
          lstProductGroup = (this.lstOfPaygroupOverrideProducts.filter(a => a.ProductId == element.ProductId))
          console.log('PGROUPV:::::', lstProductGroup);
          console.log('isExistProduct:::::', isExistProduct);
          console.log('element:::::', element);

          element['IsOverridableProductGroup'] = true;
          element['lstOfProducts'] = lstProductGroup;


          if (element.ProductCTCPayrollRuleMappingId != null && element.ProductCTCPayrollRuleMappingId > 0) {
            element['defaultValue'] = lstProductGroup.find(x => x.ProductCTCPayrollRuleMappingId == element.ProductCTCPayrollRuleMappingId).Id;
          } else {
            element['defaultValue'] = lstProductGroup.find(x => x.IsDefault == true).Id;
          }



          this.employeedetails.ELCTransactions[0].LstPayGroupProductOverrRides != null && this.employeedetails.ELCTransactions[0].LstPayGroupProductOverrRides.length > 0 && (element.defaultValue = this.employeedetails.ELCTransactions[0].LstPayGroupProductOverrRides.find(x => x.ProductId == element.ProductId).Id);
        } else {
          element['IsOverridableProductGroup'] = false;
        }
      }
      else {
        element['IsOverridableProductGroup'] = false;

      }
    });

    console.log('sdsfd', this.employeedetails);

    this.employeedetails.ELCTransactions[0].LstPayGroupProductOverrRides
    if (this.isDailyOrHourlyWages) {
      this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].WageType = this.wageTypeString == 'Hourly' ? RateType.Hourly : RateType.Daily;
      this.setDefaultValuesForWageRateSetProducts();
    }
    console.log('list of obj', this.NewRt);
  }

  setDefaultValuesForWageRateSetProducts() {

    console.log('this.NewRt', this.NewRt);

    for (const el of this.NewRt) {
      const value = el.Value;
      if (value > 0) {
        const defaultDailyRate: any = (value / this.baseDaysForAddlApplicableProduct).toFixed(2);
        const defaultHourlyRate: any = (defaultDailyRate / this.baseHoursForAddlApplicableProduct).toFixed(2);
        el.Modetype = el.IsOveridable ? UIMode.Edit : el.Modetype;
        el.PaymentType = this.wageType;
        el.PayableRate = this.wageTypeString == 'Hourly' ? defaultHourlyRate : defaultDailyRate;
        el.BillingType = this.wageType;
        el.BillableRate = this.wageTypeString == 'Hourly' ? defaultHourlyRate : defaultDailyRate;
      } else if (value == 0) {
        el.PaymentType = this.wageType;
        el.PayableRate = value;
        el.BillingType = this.wageType;
        el.BillableRate = value;
      }
    }
  }

  doCalculateCTC(_elcTransaction) {

    console.log('Breakup Input :', _elcTransaction);


    this.employeeService.new_CalculateSalaryBreakup(_elcTransaction).subscribe((result) => {
      let apiResult: apiResult = result;
      try {
        if (apiResult.Status && apiResult.Result != null) {
          console.log('Breakup Result :', apiResult);

          let New_SalaryBreakup_ELC: EmployeeLifeCycleTransaction = apiResult.Result as any;
          // console.log('Employee rateset ::', New_SalaryBreakup_ELC);

          this.IsRateSetValue = New_SalaryBreakup_ELC.IsRateSetValid;
          this.isMinimumwageAdhered = New_SalaryBreakup_ELC.IsMinimumwageAdhere;
          _elcTransaction.IsMinimumwageAdhere = New_SalaryBreakup_ELC.IsMinimumwageAdhere;
          _elcTransaction.IsRateSetValid = New_SalaryBreakup_ELC.IsRateSetValid;
          _elcTransaction.CalculationRemarks = New_SalaryBreakup_ELC.CalculationRemarks;
          _elcTransaction.EmployeeRatesets = null;
          _elcTransaction.EmployeeRatesets = New_SalaryBreakup_ELC.EmployeeRatesets;
          _elcTransaction.EmployeeRatesets[0].RatesetProducts.forEach(element => {
            let lstProductGroup = [];
            element['IsOverridableProductGroup'] = false;
          });
          this.New_RateSetList = [];
          this.NewRt = _elcTransaction.EmployeeRatesets[0].RatesetProducts;
          this._update_tableStructure()
          this.NewELCTransaction = New_SalaryBreakup_ELC;

          console.log('New Rate Set Item :: ', this.NewRt);
          this.loadingScreenService.stopLoading();

          // $('#popup_new_salary_breakup').modal('show');

          const modalRef = this.modalService.open(SalarybreakupmodalComponent, this.modalOption);
          modalRef.componentInstance.NewRt = this.NewRt;
          modalRef.componentInstance.NewELCTransaction = this.NewELCTransaction;
          modalRef.componentInstance.employeedetails = this.employeedetails;
          modalRef.componentInstance.lstOfPaygroupOverrideProducts = this.lstOfPaygroupOverrideProducts;
          modalRef.result.then((result) => {
            console.log('modal closed ', result);
            if (result != "Modal Closed") {
              if (result.Activity == 'RecalculateCTC') {
                this.NewRt = result.NewRt;
                this.recalculateCTC();
              }
              else if (result.Activity == 'ReviewLater') {
                this.NewRt = [];
                try {


                  this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts = [];
                  this.employeedetails.EmployeeRatesets && this.employeedetails.EmployeeRatesets.length > 0 ? this.employeedetails.EmployeeRatesets[0].RatesetProducts = [] : true;

                  // this.employeedetails.EmploymentContracts[0].LstRateSets && this.employeedetails.EmploymentContracts[0].LstRateSets.length > 0 &&
                  //   this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts != null && this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts.length > 0 ? this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = [] : true;
                  // this.employeedetails.ELCTransactions[0].EmployeeRatesets && this.employeedetails.ELCTransactions[0].EmployeeRatesets.length > 0 &&
                  //   this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts ? this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts = [] : true;

                } catch (error) {
                  console.log('CLER ISS 2 :', error);

                }

              }
              else if (result.Activity == "Confirm") {
                this.NewRt = result.NewRt;
              }
            } else {
            }
          }).catch((error) => {
            console.log(error);
          });



        } else {
          this.alertService.showWarning(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.NewRt = [];
          try {
            this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts = [];
            this.employeedetails.EmployeeRatesets && this.employeedetails.EmployeeRatesets.length > 0 ? this.employeedetails.EmployeeRatesets[0].RatesetProducts = [] : true;
          } catch (error) {
            console.log('CLER ISS 3 :', error);
          }
        }
      } catch (error) {

        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(error);
      }

    })
  }

  recalculateCTC(): void {

    this.loadingScreenService.startLoading();
    $('#popup_new_salary_breakup').modal('hide');
    this.isRecalculate = true;
    console.log('MGRGRP :: ', this.MigrationInfoGrp);

    // this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts = [];
    this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts = this.NewRt;

    if (this.MigrationInfoGrp && this.MigrationInfoGrp[0].ClientContractOperationList
      && this.MigrationInfoGrp[0].ClientContractOperationList.length) {

      const clientContractOperationObj = this.MigrationInfoGrp[0].ClientContractOperationList[0];

      // check BreakupBasedays key is present in the object
      this.baseDaysForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasedays') ?
        clientContractOperationObj.BreakupBasedays : 0;

      // check BreakupBasehours key is present in the object
      this.baseHoursForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasehours') ?
        clientContractOperationObj.BreakupBasehours : 1;

      // check WageType key is present in the object
      const wageTypeNumber = clientContractOperationObj.hasOwnProperty('WageType') ?
        clientContractOperationObj.WageType : 0;


      if (this.isDailyOrHourlyWages == true) {
        if (wageTypeNumber === 1) {
          this.wageType = 'Hourly';
          this.isDailyOrHourlyWages = true;
        } else if (wageTypeNumber === 2) {
          this.wageType = 'Daily';
          this.isDailyOrHourlyWages = true;
        } else {
          this.wageType = 'Monthly';
          this.isDailyOrHourlyWages = false;
          this.baseDaysForAddlApplicableProduct = 0;
        }
      } else {
        this.wageType = 'Monthly';
        this.baseDaysForAddlApplicableProduct = 0;
      }

      // check MinimumWagesApplicableProducts key is present in the object
      this.minimumWagesApplicableProductsList = clientContractOperationObj.hasOwnProperty('MinimumWagesApplicableProducts') ?
        clientContractOperationObj.MinimumWagesApplicableProducts : [];

      // set value in minimumWagesApplicableProducts - form control
      this.minimumWagesApplicableProductsList && this.minimumWagesApplicableProductsList.length > 0 ? this.employeeForm.controls['minimumWagesApplicableProducts'].setValue(this.minimumWagesApplicableProductsList[0].Code)
        : this.employeeForm.controls['minimumWagesApplicableProducts'].setValue(null);
    }


    this._build_PaygroupOverride().then((res) => {
      this.reviewCancelled = false;
      this.doCalculateCTC(this.NewELCTransaction);
    });

  }

  onChangePayGroup(e, i): void {
    this.isRecalculate = false;
  }

  onChangeAmount(event, item): void {
    this.NewRt.forEach(element => {
      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.Value = Number(event);
      }
    });
    if (this.IsAutoSalaryConfirmRequiredOnEmployee) {
      this.calculateGrossEarning();
      this.isRecalculate = true;
    } else {
      this.isRecalculate = false
    }
  }

  calculateGrossEarning() {
    //Sum of all products whose type is Earning
    let grossPay = 0;
    this.NewRt.forEach(element => {
      if (element.ProductTypeCode == "Earning" && element.ProductCode !== "Total") {
        grossPay = grossPay + element.Value
      }
    })
    this.NewRt.forEach(element => {
      if (element.ProductCode == "GrossEarn") {
        element.Value = Number(grossPay);
      }
    })
    this.calculateCTC()
  }

  calculateCTC() {
    // //Sum of all products which includes the foll types: Earning, OnCost and Deductions 
    // let ctc = 0;
    // this.NewRt.forEach(element => {
    //   if (element.ProductTypeCode !== "Total") {
    //     ctc = ctc + (this.doCheckEditableAnnualPayComponent(element) ? 0 : element.Value)
    //   }
    // })
    //  // Apply rounding method based on config
    // //  if (this.roundingMethod === 'down') {
    // //   ctc = Math.floor(ctc);
    // // } else if (this.roundingMethod === 'up') {
    // //   ctc = Math.ceil(ctc);
    // // } else if (this.roundingMethod === 'nearest') {
    // //   ctc = Math.round(ctc);
    // // }

    // this.NewRt.forEach(element => {
    //   if (element.ProductCode == "CTC") {
    //     element.Value = Number(ctc);
    //   }
    // })


    this.getTotalCTCAmount();
  }

  getTotalCTCAmount() {
    // let ii = 0;
    // this.TotalCTC = 0;
    // this.TotalCTC = this.NewRt.reduce((acc, element) => {
    //   const valueToAdd = element.Value * 12;
    //   return acc + valueToAdd;
    // }, 0);

    // return this.TotalCTC;

    let totalCTCAmount = 0;

    this.NewRt.forEach(element => {
      if (this.doCheckEditableAnnualPayComponent(element) && element.Value > 0) {
        totalCTCAmount += element.Value;
      } else if (element.Value > 0 && element.ProductCode != "GrossEarn" && element.ProductCode != "CTC") {
        totalCTCAmount += element.Value * 12;
      }
    });

    this.NewRt.forEach(element => {
      if (element.ProductCode == "CTC") {
        element.Value = Number(totalCTCAmount) / 12;
      }
    })

    this.TotalCTC = totalCTCAmount;
    console.log("Total CTC amount:", totalCTCAmount); // For debugging
    return totalCTCAmount;

  }
  onChangeAnnualAmount(event, item): void {
    this.NewRt.forEach(element => {
      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.Value = Number(event);
      }
    });
    if (this.IsAutoSalaryConfirmRequiredOnEmployee) {
      this.calculateGrossEarning();
      this.getTotalCTCAmount();
      this.isRecalculate = true;
    } else {
      this.isRecalculate = false
    }
  }


  onChangePayRateAmount(event, item): void {
    console.log(event);
    this.NewRt.forEach(element => {
      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.PaymentType = this.wageType == 'Hourly' ? PaymentType.Hourly : PaymentType.Daily;
        element.PayableRate = Number(event);
        // update billing type
        element.BillingType = this.wageType == 'Hourly' ? PaymentType.Hourly : PaymentType.Daily;
        element.BillableRate = Number(event);

        if (this.isOverrideMonthlyValue) {
          element.Value = Number(event) * this.baseDaysForAddlApplicableProduct * this.baseHoursForAddlApplicableProduct;
        }
      }
    });
    this.isRecalculate = false;
  }

  onChangeBillRateAmount(event, item): void {
    console.log(event);
    this.NewRt.forEach(element => {
      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.BillingType = this.wageType == 'Hourly' ? PaymentType.Hourly : PaymentType.Daily;
        element.BillableRate = Number(event);
      }
    });
    this.isRecalculate = false;
  }

  reviewLater() {
    this.reviewCancelled = true;
    this.alertService.confirmSwal("Confirmation?", "This will clear the current salary breakup, however you must calculate breakup before submitting this request.", "OK, Yes").then(result => {

      this.NewRt = [];
      try {
        console.log('CLER Review', this.employeedetails)
        this.employeedetails.EmployeeRatesets[0].RatesetProducts = [];
        this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = [];
        this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts = [];
      } catch (error) {
        console.log('CLER ISS 2 :', error);

      }
      $('#popup_new_salary_breakup').modal('hide');

    })
      .catch(error => {
        this.modal_dismiss_New_SalaryBreakup();
      });
  }



  _build_PaygroupOverride() {
    return new Promise((resolve, reject) => {
      var tempList = [];
      this.NewRt.forEach(obj => {
        if (obj.IsOverridableProductGroup) {
          var e = obj.lstOfProducts.find(q => q.Id == obj.defaultValue)
          var lstPaygroupProductOverrides = new PaygroupProductOverrides();
          lstPaygroupProductOverrides.Id = e.Id;
          lstPaygroupProductOverrides.CompanyId = e.CompanyId;
          lstPaygroupProductOverrides.ClientId = e.ClientId;
          lstPaygroupProductOverrides.ClientContractId = e.ClientContractId;
          lstPaygroupProductOverrides.TeamId = e.TeamId;
          lstPaygroupProductOverrides.PayGroupId = e.PayGroupId;
          lstPaygroupProductOverrides.ProductId = e.ProductId;
          lstPaygroupProductOverrides.ProductCTCPayrollRuleMappingId = e.ProductCTCPayrollRuleMappingId;
          lstPaygroupProductOverrides.EffectiveDate = e.EffectiveDate;
          lstPaygroupProductOverrides.EffectivePeriod = e.EffectivePeriod;
          lstPaygroupProductOverrides.Status = e.Status;
          lstPaygroupProductOverrides.IsDefault = e.IsDefault;
          lstPaygroupProductOverrides.ProductApplicabilityCode = e.ProductApplicabilityCode;
          lstPaygroupProductOverrides.ProductCode = obj.ProductCode;
          tempList.push(lstPaygroupProductOverrides);
        }
      });
      this.NewELCTransaction.LstPayGroupProductOverrRides = tempList;
      resolve(tempList);
    });

  }

  modal_dismiss_New_SalaryBreakup() {


    if (this.IsAutoSalaryConfirmRequiredOnEmployee) {

      let selectedSalaryBreakupType = this.employeeForm.get('salaryType').value;
      console.log('selectedSalaryBreakupType', selectedSalaryBreakupType);
      let annualSalaryAmount = this.employeeForm.get('annualSalary').value;
      //Setting the monthly salary and annual salary after the salary breakdown is done
      let getCategoryType = this.employeeForm.get('Category').value
      if (getCategoryType == 1) {//Executive
        this.NewRt.forEach((item) => {
          if (item.ProductCode == 'CTC') {
            this.employeeForm.controls['MonthlySalary'].setValue(item.Value)
            this.employeeForm.controls['annualSalary'].setValue(item.Value * 12)
          }
        })
      } else if (getCategoryType == 2) {//Staff
        this.NewRt.forEach((item) => {
          if (item.ProductCode == 'GrossEarn') {
            this.employeeForm.controls['MonthlySalary'].setValue(item.Value)
            this.employeeForm.controls['annualSalary'].setValue(item.Value * 12)
          }
        })
      }
      if (this.NewRt && this.NewRt.length > 0 && selectedSalaryBreakupType == 2) {
        var GrossEarnAmount = 0;
        GrossEarnAmount = this.NewRt.find(a => a.ProductCode.toUpperCase() == 'GROSSEARN') ? this.NewRt.find(a => a.ProductCode.toUpperCase() == 'GROSSEARN').Value * 12 : 0;

        // if (GrossEarnAmount != annualSalaryAmount) {
        //   this.alertService.showInfo("The Gross Earning amount is not same as your annual salary. Please review and update");
        //   return;
        // }
      }
      if (this.NewRt && this.NewRt.length > 0 && selectedSalaryBreakupType == 1) {
        var CTCAmount = 0;
        CTCAmount = this.NewRt.find(a => a.ProductCode.toUpperCase() == 'CTC') ? this.NewRt.find(a => a.ProductCode.toUpperCase() == 'CTC').Value * 12 : 0;

        // if (CTCAmount != annualSalaryAmount) {
        //   this.alertService.showInfo("The CTC amount is not same as your annual salary. Please review and update");
        //   return;
        // }

      }

      if (this.NewRt && this.NewRt.length > 0 && selectedSalaryBreakupType == 3) {
        var NetPayAmount = 0;
        NetPayAmount = this.NewRt.find(a => a.ProductCode.toUpperCase() == 'NETPAY') ? this.NewRt.find(a => a.ProductCode.toUpperCase() == 'NETPAY').Value * 12 : 0;
        // if (NetPayAmount != annualSalaryAmount) {
        //   this.alertService.showInfo("Your annually salary and the NetPay amount are not the same. Please verify and make changes.");
        //   return;
        // }
      }

      let finalValue = selectedSalaryBreakupType == 2 ? GrossEarnAmount : selectedSalaryBreakupType == 1 ? CTCAmount : selectedSalaryBreakupType == 3 ? NetPayAmount : 0;

      if (finalValue == 0) {
        this.alertService.showWarning('The annual effective pay is 0.00. Kindly try making changes and verify again.');
        return;
      }


      this.alertService.confirmSwal1(`Confirmation? The salary will be ${selectedSalaryBreakupType == 2 ? GrossEarnAmount : selectedSalaryBreakupType == 1 ? CTCAmount : selectedSalaryBreakupType == 3 ? NetPayAmount : ''} per year (${selectedSalaryBreakupType == 2 ? 'Gross' : selectedSalaryBreakupType == 1 ? 'CTC' : selectedSalaryBreakupType == 3 ? 'NetPay' : ''})`, `Are you sure you would like to confirm these salary breakup details?`, "Yes, Confirm", "No, Reivew Again").then(result => {
        console.log('RATE ', this.NewRt);

        const annualSalary = (this.employeeForm.get('annualSalary').value);
        const monthlySalary = (this.employeeForm.get('MonthlySalary').value);

        if (this.NewELCTransaction.EmployeeRatesets.length > 0) {
          this.NewELCTransaction.EmployeeRatesets[0].AnnualSalary = annualSalary;
          this.NewELCTransaction.EmployeeRatesets[0].MonthlySalary = monthlySalary;
          this.NewELCTransaction.EmployeeRatesets[0].RatesetProducts = this.NewRt;
        }

        if (this.employeedetails.EmployeeRatesets && this.employeedetails.EmployeeRatesets.length > 0) {
          this.employeedetails.EmployeeRatesets[0].AnnualSalary = annualSalary;
          this.employeedetails.EmployeeRatesets[0].MonthlySalary = monthlySalary;
          this.employeedetails.EmployeeRatesets[0].RatesetProducts = this.NewRt
        }

        if (this.employeedetails.EmploymentContracts.length > 0 &&
          this.employeedetails.EmploymentContracts[0].LstRateSets.length > 0 &&
          this.employeedetails.EmploymentContracts[0].LstRateSets[0]) {
          this.employeedetails.EmploymentContracts[0].LstRateSets[0].AnnualSalary = annualSalary;
          this.employeedetails.EmploymentContracts[0].LstRateSets[0].MonthlySalary = monthlySalary;
          this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = this.NewRt;
        }

        $('#popup_new_salary_breakup').modal('hide');

      }).catch(error => {
        $('#popup_new_salary_breakup').modal('show');
        return;
      });

      return;

    }



    if (this.IsRateSetValue == false) {

      this.alertService.showInfo("Hi there!, Changes you made may not be valid");
      return;
    }
    if (!this.isRecalculate) {
      this.alertService.showInfo("Some Breakup products will not be avaliable until you re-calculate it.");
      return;
    } else {

      $('#popup_new_salary_breakup').modal('hide');
    }

  }

  tst() {
    $('#popup_new_salary_breakup').modal('show');
    return;
  }

  getWorkLocation(LocationId) {
    return this.ClientLocationList.length > 0 ?
      this.ClientLocationList.find(a => a.Id == LocationId).LocationName : '---'
  }

  getEmploymentType(empTypeId) {
    if (this.EmploymentTypeList.length > 0) {
      let empTypeObj = this.EmploymentTypeList.find(a => a.Id == empTypeId);
      return empTypeObj ? empTypeObj.Name : '---'

    } else {
      return '---'
    }

  }
  getTeam(contractObject) {
    try {

      let employmentContract: EmploymentContract = contractObject;
      let teamObj = this.TeamList.length > 0 ? this.TeamList.find(a => a.Id == employmentContract.TeamId) : null;


      if (teamObj) {
        // this.NoticePeriodDaysList = teamObj.NoticePeriodDaysList;

        this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
        this.NoticePeriodDaysList.forEach(element => {
          element.Description = Number(element.Description);
        });

        this.LeaveGroupList = teamObj.LeaveGroupList;
        this.EffectivePayPeriodList = teamObj.PayPeriodList;
        this.BusinessType == 3 ? this.ManagerList = teamObj.ManagerList : true;
        this.BusinessType != 3 && teamObj.ReportingManagerList != null ? this.ManagerList = teamObj.ReportingManagerList
          // .filter(a => a.TeamId == employmentContract.TeamId)
          : true;
        this.showOtherMasterItems(employmentContract.NoticePeriodDays, 'NoticePeriodDays');
        this.showOtherMasterItems(employmentContract.LeaveGroupId, 'LeaveGroupId');
        this.showOtherMasterItems(employmentContract.ManagerId, 'ManagerId');
      }

      return this.TeamList.length > 0 ?
        this.TeamList.find(a => a.Id == employmentContract.TeamId).Name : '---'
    } catch (error) {
      console.log('error', error);

    }
  }


  // ngAfterViewInit() {

  //   setTimeout(() => {
  //     this.myDropdownField.nativeElement.focus();
  //   });
  //   // this.NoticePeriodDaysName = this.NoticePeriodDaysList.length > 0 ?
  //   // this.NoticePeriodDaysList.find(a => a.Description == FieldId.toString()).Name : '000'

  //   // this.showOtherMasterItems(employmentContract.NoticePeriodDays, 'NoticePeriodDays');
  //   // this.showOtherMasterItems(employmentContract.LeaveGroupId, 'LeaveGroupId');
  //   // this.showOtherMasterItems(employmentContract.ManagerId, 'ManagerId');
  // }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log('Executing code before clicking button...');
      this.myButton.nativeElement.click();
    }, this.timeOutSec);
  }

  buttonClicked() {
    console.log('Button clicked!');
    // Add any actions you want to occur when the button is clicked
  }



  showOtherMasterItems(FieldId, PropName) {
    if (PropName == 'NoticePeriodDays' && FieldId > 0 && FieldId) {
      this.NoticePeriodDaysName = this.NoticePeriodDaysList.length > 0 ?
        this.NoticePeriodDaysList.find(a => a.Description == FieldId.toString()).Name : '---'
    };

    if (PropName == 'LeaveGroupId' && FieldId && FieldId > 0) {
      this.LeaveGroupIdName = this.LeaveGroupList.length > 0 ?
        this.LeaveGroupList.find(a => a.Id == FieldId).Name : '---'
    };

    if (PropName == 'ManagerId' && FieldId && FieldId > 0) {
      return this.ManagerIdName = this.ManagerList.length > 0 ?
        this.ManagerList.find(a => a.ManagerId == FieldId).ManagerName : '---'
      // return this.EffectivePayPeriodList.length > 0 ?
      //   this.EffectivePayPeriodList.find(a => a.Id == FieldId).PayCyclePeriodName : '---'
    }
  }

  scrollSalary(value) {
    let scrollValues = ['Location', 'employementstartdate', 'Designation', 'annualSalary', 'salaryType', 'payGroup', 'industryType', 'skillCategory']
    let findScroll = scrollValues.find(item => item == value)
    if (findScroll) {
      let formattedMessage = findScroll.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^([a-z])/, (match, group1) => group1.toUpperCase()); // Convert camelCase to Camel Case
      let capitalizedMessage = formattedMessage.charAt(0).toUpperCase() + formattedMessage.slice(1);
      this.alertService.showWarning(capitalizedMessage + " is required field. Please check the form and Preview again.");
      let screenSize = document.documentElement.clientHeight / -2;
      window.scrollTo({
        top: screenSize,
        behavior: "smooth",
      });
    }
    else {
      let formattedMessage = value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^([a-z])/, (match, group1) => group1.toUpperCase()); // Convert camelCase to Camel Case
      let capitalizedMessage = formattedMessage.charAt(0).toUpperCase() + formattedMessage.slice(1);
      this.alertService.showWarning(capitalizedMessage + " required field. Please check the form and Preview again.");

      let screenSize = document.documentElement.clientHeight;
      window.scrollTo({
        top: screenSize,
        behavior: "smooth",
      });
    }
  }

  salaryBreakError() {
    this.submitted = true;
    let validValues = ['Location', 'employementstartdate', 'Designation', 'annualSalary', 'salaryType', 'payGroup', 'industryType', 'skillCategory', 'zone', 'teamname']
    let emptyString = ['employementstartdate', 'Designation',]
    let moreThanZero = ['Location', 'annualSalary', 'industryType', 'skillCategory', 'effectivePeriod']
    if (this.employeeForm.get('employementstartdate').value == "Invalid Date") {
      this.scrollSalary('employementstartdate')
      return this.alertService.showWarning("Employement Start Date is required field. Please check the form and Preview again.")
    } else {
      for (let i = 0; i < validValues.length; i++) {
        if (this.employeeForm.controls[validValues[i]].invalid) {
          this.scrollSalary(validValues[i])
          break;
        }
        else if (i < emptyString.length) {
          if (this.employeeForm.get(emptyString[i]).value == "") {
            this.scrollSalary(emptyString[i])
            break;
          }
        }
        else if (i < moreThanZero.length) {
          if (this.employeeForm.get(moreThanZero[i]).value <= 0) {
            this.scrollSalary(moreThanZero[i])
            break;
          }
        }

      }

    }
  }

  doCheckAllenDigital() {

    return this.BusinessType == 1 && Number(environment.environment.ACID) == Number(this.employeedetails.EmploymentContracts[0].ClientId) ? true : false;

  }

  onChangeOfficialFields(event, fieldName) {
    console.log('eve', event);

    if (fieldName == 'Category') {
      this.employeedetails.EmploymentContracts[0].Level = null;
      this.designationLevelDisplayName = "";
      this.employeeForm.controls['Designation'].setValue(null);
      this.employeeForm.controls['salaryType'].setValue(null);
      this.GetDesignationList();
      this.GetSalaryBreakupType(event.Code);
    }
    else if (fieldName == "Designation") {
      this.employeedetails.EmploymentContracts[0].Level = event.LevelId;
      this.GetSkillCategoryList();
      this.GetDesignationLevelDisplayName(event.LevelId);
      // let categoryValue = this.employeeForm.get('Category').value;
    }
    else if (fieldName == "employmentType") {
      this.isConsultantEmployee = false;
      this.isConsultantEmployee = event.Code == 'Contractual' && this.isAllenDigital ? true : false;
    }
  }

  GetDesignationLevelDisplayName(levelId) {

    return levelId != null && levelId != 0 && this.onboardingAdditionalInfo.LstEmployeeLevel &&
      this.onboardingAdditionalInfo.LstEmployeeLevel.length > 0 && this.onboardingAdditionalInfo.LstEmployeeLevel.find(a => a.Id == levelId) ?
      this.onboardingAdditionalInfo.LstEmployeeLevel.find(a => a.Id == levelId).Name : "";

  }



  GetDesignationList() {
    let categoryValue = this.employeeForm.get('Category').value;
    var designations = this.DesignationList;
    return ['', null, undefined].includes(categoryValue) ? designations :
      designations.filter(a => a.CategoryId == categoryValue);
  }

  onChangeSalaryType(eventValue) {
    this.employeeForm.controls['payGroup'].setValue(null);
    this.onFocus_OfferAccordion(null, 'salaryType');
  }

  GetSalaryBreakupType(categoryCode: string = "") {
    let salaryTypes = this.SalaryBreakupType;
    let filteredSalaryTypes = ['', null, undefined].includes(categoryCode) ? salaryTypes :
      categoryCode.toUpperCase() == 'EXECUTIVE' ? salaryTypes.filter(a => a.id == 1) : salaryTypes;
    return filteredSalaryTypes.length == 1 ? this.employeeForm.controls['salaryType'].setValue(filteredSalaryTypes[0].id) : filteredSalaryTypes;
  }

  GetPayGroupList() {
    let salaryTypeValue = this.employeeForm.get('salaryType').value;
    let payGroups = this.PayGroupList;
    return ['', null, undefined].includes(salaryTypeValue) ? payGroups : payGroups.filter(a => a.SalaryBreakupType == salaryTypeValue);
  }

  GetSkillCategoryList() {

    let designationValue = this.employeeForm.get('Designation').value;
    let locationValue = this.employeeForm.get('Location').value;
    let industryValue = this.employeeForm.get('industryType').value;
    let skillCategories = this.SkillCategoryList;

    if (!['', null, undefined].includes(designationValue) && !['', null, undefined].includes(locationValue) && !['', null, undefined].includes(industryValue)) {
      const defaultSkillId = this.DesignationList.length > 0 && this.DesignationList.find(a => a.Id == designationValue).SkillCategoryId;
      if (defaultSkillId > 0 && defaultSkillId != undefined && defaultSkillId != null) {
        this.employeeForm.controls['skillCategory'].setValue(skillCategories.find(a => a.Id == defaultSkillId).Id)
        // this.employeeForm.controls['skillCategory'].disable();
        return skillCategories;
      }

    } else {
      return skillCategories;
    }
  }

  disableFormControls() {
    try {

      for (const field of this.NotAccessibleFields) {
        console.log('element', field)
        if (this.employeeForm.get(field)) {
          this.employeeForm.get(field).disable();
        }
      }
    } catch (error) {
      console.log('Disable For ::', error);

    }
  }

  shouldShowEPP(isAllenDigital) {
    return isAllenDigital ? false : true
  }

  showRecalculateButton() {

    return this.IsRecalculateButtonRequiredOnEmployee == null || this.IsRecalculateButtonRequiredOnEmployee ? true : false;
  }

  doCheckEditableAnnualPayComponent(item) {

    if (this.EditableAnnualPayComponent != null && this.EditableAnnualPayComponent.length > 0) {
      return item.IsOveridable && this.EditableAnnualPayComponent.includes(item.ProductCode) ? true : false;
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.subscribeEmitter();
  }
}