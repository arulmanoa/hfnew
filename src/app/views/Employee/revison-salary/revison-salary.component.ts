import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';

import { find, pull } from 'lodash';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { UIMode } from '../../../_services/model/UIMode';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import * as moment from 'moment';


import { WagesService } from '../../../_services/service/wages.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import {  LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { WorkFlowInitiation, UserInterfaceControlLst } from '../../../_services/model/OnBoarding/WorkFlowInitiation';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingInfo, ClientList, ClientContactList, RecruiterList, ClientContractList, MandatesAssignment, ExternalCandidateInfo } from '../../../_services/model/OnBoarding/OnBoardingInfo';
import { OfferInfo, IndustryList, ClientLocationList, PayGroupList, ZoneList, SkillCategoryList, LetterTemplateList, LstCostCityCenter } from '../../../_services/model/OnBoarding/OfferInfo';


import { _CandidateModel } from '../../../_services/model/Candidates/CandidateModel';

import Swal from "sweetalert2";

import { EmployeeService } from 'src/app/_services/service/employee.service';
import { EmployeeStatus } from 'src/app/_services/model/Employee/EmployeeDetails';
import { EmployeeLifeCycleTransaction, ELCStatus, _EmployeeLifeCycleTransaction, _EmployeeRateset, ELCClientApproval } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { EmployeeLifeCycleTransactionModel } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransactionModel';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';

import { AdditionalPaymentProducts, RatesetProduct, RateType } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { ELCDetails } from 'src/app/_services/model/Employee/ELCDetails';
import { FileUploadService, PagelayoutService } from 'src/app/_services/service';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';
import { EmploymentContract } from 'src/app/_services/model/Employee/EmployementContract';
import { CandidateOfferDetails, OfferStatus, PaygroupProductOverrides } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { environment } from 'src/environments/environment';
import { ElcApprovalModalComponent } from 'src/app/shared/modals/elc-approval-modal/elc-approval-modal.component';
import { DocumentApprovalFor, DocumentApprovalStatus } from 'src/app/_services/model/Approval/DocumentApproval';
import { PaymentType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { NzDrawerService } from 'ng-zorro-antd';
import { AdditionalApplicableProductsComponent } from 'src/app/shared/modals/additional-applicable-products/additional-applicable-products.component';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-revison-salary',
  templateUrl: './revison-salary.component.html',
  styleUrls: ['./revison-salary.component.css']
})
export class RevisonSalaryComponent implements OnInit {

  header: any;
  Idx: any;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  RevisionForm: FormGroup;

  isAllenDigital : boolean = false
  // Session Details
  // ** Access control base prop desc
  _loginSessionDetails: LoginResponses;
  MenuId: any;
  UserId: any;
  UserName: any;
  RoleId: any;
  RoleCode: any;
  CompanyId: any;
  ImplementationCompanyId: any;
  workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation;
  accessControl_submit: UserInterfaceControlLst = new UserInterfaceControlLst;
  accessControl_reject: UserInterfaceControlLst = new UserInterfaceControlLst;
  userAccessControl;

  // spinner 
  should_spin_onboarding: boolean = true;
  isLoading: boolean = false;


  //  OnBoardingInfoListGrp: OnBoardingInfo;
  //  ClientList?: ClientList[] = [];

  //Client Approval 
  clientApprovalTbl: any[];
  DocumentApprovalIds: ELCClientApproval[];

  countryCode: any;
  StateName: any;
  CityName: any;
  IndustryId: any;
  StateId: any;
  CityId: any;
  IndustryList: IndustryList[] = [];
  SkillCategoryList: SkillCategoryList[] = [];
  ClientLocationList: ClientLocationList[] = [];
  ClientReportingLocationList: ClientLocationList[] = [];
  ClientCityList: any[] = [];
  LstCostCityCenter: LstCostCityCenter[] = [];
  DesignationList : any = [];
  ReportingManagerList : any [];
  DeignationLevel : number = 0;
  ZoneList: ZoneList[] = [];
  OfferInfoListGrp1: OfferInfo; // Handle for spliting two seprate list Skills and Zone list
  ClientList = [];
  MigrationInfoGrp: MigrationInfo;
  TeamList: any;
  ClientId: any;
  ClientContractId: any;
  MandateAssignmentId: any;
  OfferInfoListGrp: OfferInfo;
  skillCategory: any = [];
  zones: any = [];
  industrys: any = [];
  defaultIndustry : any = undefined;
  //COntract Extension


  Salarytype = [
    { Id: 1, Name: 'CTC' },
    { Id: 2, Name: 'GROSS' },
    { Id: 3, Name: 'NetPay' },

  ];

  hiketype = [
    { Id: 1, Name: 'Percentage' },
    { Id: 2, Name: 'Value' },
  ];

  extensionPeriodList = [
    { Id: 1, Name: '3 Months', NoOfMonths: 3 },
    { Id: 2, Name: '6 Months', NoOfMonths: 6 },
    { Id: 3, Name: '1 Year', NoOfMonths: 12 }
  ]

 
  EmployeeId: any;
  EmployeeObject: any;

  // employeeModel : EmployeeModel = new EmployeeModel();
  // newObj: EmployeeDetails = new EmployeeDetails();
  // oldObj: EmployeeDetails = new EmployeeDetails();

  newObj: ELCDetails = new ELCDetails();
  oldObj: ELCDetails = new ELCDetails();

  // ELC Transaction properties 
  PayGroupList: PayGroupList[] = [];
  ELCTransaction: EmployeeLifeCycleTransaction;
  EmployeeRatesets: EmployeeRateset[] = [];
  jStr_ELC: EmployeeLifeCycleTransaction;
  ELCModel: EmployeeLifeCycleTransactionModel = new EmployeeLifeCycleTransactionModel
  LetterTemplateList: LetterTemplateList[] = [];


  Label_LocationName: any;
  Label_Campus: any;
  Label_City : any;
  Label_Cost_City_Center: any;
  Label_PayGroupName: any;
  Label_IndustryName: any;
  Label_SkillCategoryName: any;
  Label_ZoneName: any;
  Label_ClientZoneName: any;
  Label_ClientName: any;
  Label_DOJ: any;
  Label_AnnualSalary: any;
  Label_Designation: any;
  Label_Division: any;
  Label_Department: any;
  Label_ReportingManager: any;
  Label_Type: any;
  Label_Level: any;
  Label_JobRole: any;
  Label_SubEmployementType: any;
  Label_MonthlySalary: any;
  Label_ContractEndDate: any;

  Current_RateSetList: any = []
  New_RateSetList: any = [];

  modalOption: NgbModalOptions = {};

  isSkeleton: boolean = true;
  _OldRateSetId: any = 0;
  _OldELCTransactionId: any = 0;
  Active_ELC_Obj: EmployeeLifeCycleTransaction;

  isminAmount: boolean = false;

  // only for CC email address book input ccmailtags
  @ViewChild('tagInput') tagInputRef: ElementRef;
  ccmailtags: string[] = [];
  CCemailMismatch: boolean = false;

  EmploymentContract: EmploymentContract;
  EmploymentContractId: any;
  EmploymentContractPayCycleId: any;
  CandidateOfferDetails: CandidateOfferDetails;
  minContractDate: Date | string;

  companySettings: any;

  isRecalculate: boolean = true;
  IsRateSetValue: boolean = false;
  isMinimumwageAdhered: boolean = false;

  EffectivePayPeriodList: any = [];
  EffectiveminDate: Date;
  EffectivemaxDate: Date;
  Id: any;

  IsMinimumwagesAdhere: boolean = false;

  //which controls to show
  SalaryRevision: boolean = false;
  ReLocation: boolean = false;
  ReDesignation: boolean = false;
  ContractExtension: boolean = false;

  //Insurance
  InsuranceList: any[] = [];
  // Salary-Daily wages
  BusinessType: any;
  additionalApplicableProducts: AdditionalPaymentProducts = null;
  baseDaysForAddlApplicableProduct: number = 0;
  baseHoursForAddlApplicableProduct: number = 1;
  isDailyOrHourlyWages: boolean = false;
  showDailyOrHourlyWageTable: boolean = false;
  wageType: string = '';
  isOverrideMonthlyValue: boolean = false;
  minimumWagesApplicableProductsList = [];
  Label_PFLogic: string = '';
  lstOfPaygroupOverrideProducts = [];
  reviewCancelled: boolean = false;
  newSkillCategory : string = '';

  constructor(

    private headerService: HeaderService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    public wagesService: WagesService,
    public onboardingService: OnboardingService,
    public sessionService: SessionStorage,
    public employeeService: EmployeeService,
    public loadingScreenService: LoadingScreenService,
    public modalService: NgbModal,
    private fileuploadService: FileUploadService,
    public pageLayoutService: PagelayoutService,
    private drawerService: NzDrawerService,
    private cookieService: CookieService,
  ) {

    this.createForm();
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;


  }


  /* #region  REACTIVE FORM INITIALIZATION AND VALIATION */

  get g() { return this.RevisionForm.controls; } // reactive forms validation
  createForm() {

    this.RevisionForm = this.formBuilder.group({
      // employeeCode: ['', Validators.required],
      // employeeName: ['', Validators.required],
      location: [null, Validators.required],
      city:[null, Validators.required],
      campus:[null, Validators.required],
      costCityCenter:[null, Validators.required],
      designation: [null, Validators.required],
      reportingManager: [null, Validators.required],
      division: [null, Validators.required],
      department: [null, Validators.required],
      type: [null, Validators.required],
      level: [null, Validators.required],
      jobRole: [null, Validators.required],
      subEmploymentType: [null, Validators.required],
      emailList: [null],
      industryType: [null, Validators.required],
      skillCategory: [null, Validators.required],
      zone: [null, Validators.required],
      employmentZone: [null, Validators.required],
      salaryType: [null, Validators.required],
      forMonthlyValue: [false],
      monthlyAmount: ['', Validators.required],
      annualSalary: ['', Validators.required],
      insuranceplan: [null, Validators.required],
      onCostInsuranceAmount: [0, Validators.required],
      fixedDeductionAmount: [0, Validators.required],
      // Gmc: ['', Validators.required],
      // Gpa: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      effectivePeriod: [null, Validators.required],
      revisionTemplate: [null, Validators.required],
      sendmailimmediately: [false],
      hiketype: [null],
      hiketypeinput: [''],
      payGroup: [null, Validators.required],
      contractEndDate: [{ value: null, disabled: true }, Validators.required],
      specifyExactDate: [false],
      extensionPeriod: [null],
      LetterRemarks: [''],
      minimumWagesApplicableProducts: [null]
    });

  }
  /* #endregion */

  /* #region  NGONINIT LIFE CYCLE HOOK  */

  ngOnInit() {
    this.reviewCancelled = false;

    this.headerService.setTitle('Employee Life Cycle Transaction');

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    

    this.route.queryParams.subscribe(params => {

      this.EmployeeObject = atob(params["Odx"]);
      this.EmployeeObject = JSON.parse(this.EmployeeObject);
      this.Idx = atob(params["Idx"]);
      this.EmployeeId = this.EmployeeObject.EmployeeId;
      this.ClientId = this.EmployeeObject.ClientId;
      this.ClientContractId = this.EmployeeObject.ClientContractId;

      console.log("EmployeeObject", this.EmployeeObject);

      if (this.Idx == 2) {
        this.header = "Salary Revision";
        this.SalaryRevision = true;
      }
      else if (this.Idx == 3) {
        this.header = "ReLocation";
        this.ReLocation = true;
      }
      else if (this.Idx == 4) {
        this.header = "ReDesignation";
        this.ReDesignation = true;
      }
      else if (this.Idx == 5) {
        this.header = "Salary Revision and ReLocation";
        this.SalaryRevision = true;
        this.ReLocation = true;
      }
      else if (this.Idx == 6) {
        this.header = "Salary Revision and ReDesignation";
        this.SalaryRevision = true;
        this.ReDesignation = true;

      }
      else if (this.Idx == 7) {
        this.header = "ReLocation and ReDesignation";
        this.ReLocation = true;
        this.ReDesignation = true;
      }
      else if (this.Idx == 8) {
        this.header = "Contract Extension";
        this.ContractExtension = true;
      }
      else if (this.Idx == 9) {
        this.header = "Salary Revision / ReLocation / ReDesignation";
        this.SalaryRevision = true;
        this.ReLocation = true;
        this.ReDesignation = true;
      }
      else if (this.Idx == 10) {
        this.header = "SalaryRevision and ContractExtension";
        this.SalaryRevision = true;
      }
      else if (this.Idx == 11) {
        this.header = "ReLocation and ContractExtension";
        this.ReLocation = true;
        this.ContractExtension = true;
      }
      else if (this.Idx == 12) {
        this.header = "ReDesignation and ContractExtension";
        this.ReDesignation = true;
        this.ContractExtension = true;
      }
      else if (this.Idx == 13) {
        this.header = "SalaryRevision / ReLocation / ContractExtension"
        this.SalaryRevision = true;
        this.ReLocation = true;
        this.ContractExtension = true;
      }
      else if (this.Idx == 14) {
        this.header = "SalaryRevision / ReDesignation / ContractExtension";
        this.SalaryRevision = true;
        this.ReDesignation = true;
        this.ContractExtension = true;
      }
      else if (this.Idx == 15) {
        this.header = "ReLocation / ReDesignation / ContractExtension";
        this.ReDesignation = true;
        this.ReLocation = true;
        this.ContractExtension = true;
      }
      else if (this.Idx == 17) {
        this.header = "SalaryRevision / ReLocation / ReDesignation / ContractExtension";
        this.SalaryRevision = true;
        this.ReLocation = true;
        this.ReDesignation = true;
        this.ContractExtension = true;
      }

    });

    console.log("ELC Type ::", this.SalaryRevision, this.ReLocation, this.ReDesignation, this.ContractExtension);


    const ACID = environment.environment.ACID;
    this.isAllenDigital = (Number(ACID) === 1988 && (this.BusinessType === 1 || this.BusinessType === 2)) ? true : false;

    // remove reactive form validation for particular fields

    if (!this.SalaryRevision) {

      this.updateValidation(false, this.RevisionForm.get('payGroup'));
      this.updateValidation(false, this.RevisionForm.get('salaryType'));
      this.updateValidation(false, this.RevisionForm.get('insuranceplan'));
      this.updateValidation(false, this.RevisionForm.get('onCostInsuranceAmount'));
      this.updateValidation(false, this.RevisionForm.get('fixedDeductionAmount'));
      this.updateValidation(false, this.RevisionForm.get('annualSalary'));
      this.updateValidation(false, this.RevisionForm.get('monthlyAmount'));
      this.updateValidation(false, this.RevisionForm.get('skillCategory'));
      // this.updateValidation(false, this.RevisionForm.get('revisionTemplate'));

    }

    if (!this.SalaryRevision && !this.ReLocation) {
      this.updateValidation(false, this.RevisionForm.get('industryType'));
      this.updateValidation(false, this.RevisionForm.get('skillCategory'));
      this.updateValidation(false, this.RevisionForm.get('zone'));
      this.updateValidation(false, this.RevisionForm.get('location'));
      this.updateValidation(false, this.RevisionForm.get('campus'));
      this.updateValidation(false, this.RevisionForm.get('city'));
      this.updateValidation(false, this.RevisionForm.get('costCityCenter'));
      this.updateValidation(false, this.RevisionForm.get('employmentZone'));
      
    }

    if (this.Idx == 8) {
      this.updateValidation(false, this.RevisionForm.get('effectivePeriod'));
      this.updateValidation(false, this.RevisionForm.get('effectiveDate'));
      this.updateValidation(false, this.RevisionForm.get('location'));
      this.updateValidation(false, this.RevisionForm.get('designation'));
      this.updateValidation(false, this.RevisionForm.get('reportingManager'));
      this.updateValidation(false, this.RevisionForm.get('division'));
      this.updateValidation(false, this.RevisionForm.get('department'));
      this.updateValidation(false, this.RevisionForm.get('type'));
      this.updateValidation(false, this.RevisionForm.get('level'));
      this.updateValidation(false, this.RevisionForm.get('jobRole'));
      this.updateValidation(false, this.RevisionForm.get('subEmploymentType'));
    }

    if(!this.ReDesignation){
      this.updateValidation(false, this.RevisionForm.get('designation'));
      this.updateValidation(false, this.RevisionForm.get('reportingManager'));
      this.updateValidation(false, this.RevisionForm.get('division'));
      this.updateValidation(false, this.RevisionForm.get('department'));
      this.updateValidation(false, this.RevisionForm.get('type'));
      this.updateValidation(false, this.RevisionForm.get('level'));
      this.updateValidation(false, this.RevisionForm.get('jobRole'));
      this.updateValidation(false, this.RevisionForm.get('subEmploymentType'));
    }




    // initial data loading 
    this.get_employeeDetailsById(this.EmployeeId);

    this.RevisionForm.get('specifyExactDate').valueChanges.subscribe(val => {
      if (val) {
        this.RevisionForm.get('contractEndDate').enable();
        this.RevisionForm.get('extensionPeriod').disable();
        this.RevisionForm.get('extensionPeriod').setValue(null);
        if (this.EmploymentContract != null) {
          this.RevisionForm.get('contractEndDate').setValue(moment(this.EmploymentContract.EndDate).format('DD-MM-YYYY'));
        }
      }
      else {
        this.RevisionForm.get('contractEndDate').disable();
        this.RevisionForm.get('extensionPeriod').enable();
      }
    })

    this.RevisionForm.get('extensionPeriod').valueChanges.subscribe(val => {
      if (!this.RevisionForm.get('specifyExactDate').value && this.EmploymentContract != null) {
        this.RevisionForm.get('contractEndDate').setValue(
          moment(this.EmploymentContract.EndDate).add(val, 'months').format('DD-MM-YYYY'));
        console.log("Contract ENd Date ::", this.RevisionForm.get('contractEndDate').value);
      }
    })
    this.RevisionForm.controls['level'].disable();
    this.RevisionForm.controls['subEmploymentType'].disable();
    
  }

  /* #endregion */

  /* #region  DATA INITIALIZATION AND INITIAL DATA LOADING (API) */

  get_employeeDetailsById(EmployeeId) {

    //this.employeeService.getEmployeeDetailsById(EmployeeId).subscribe(data=> {console.log("data" , data)});

    let datasource: DataSource = {
      Name: "GetELCDetailsUsingEmployeeId",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@employeeIds",
        Value: EmployeeId
      }
    ]

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      //let apiResult: apiResult = (result);
      console.log("ELCDetails ::", result);
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {

        // let apiResult = result.Result;
        // let oldapiResult = result.Result;

        let apiResult = JSON.parse(result.dynamicObject)[0];
        let oldapiResult = JSON.parse(result.dynamicObject)[0];

        this.newObj = apiResult;
        this.oldObj = oldapiResult;
        console.log("new obj ::", this.newObj);
        console.log("old Obj ::", this.oldObj);

        if (this.newObj.ELCTransactions == undefined || this.newObj.ELCTransactions == null) {
          this.newObj.ELCTransactions = [];
        }

        if (this.oldObj.ELCTransactions == undefined || this.oldObj.ELCTransactions == null) {
          this.oldObj.ELCTransactions = [];
        }

        this.EmploymentContract = this.newObj.EmploymentContracts != null && this.newObj.EmploymentContracts.length > 0 ? this.newObj.EmploymentContracts[0] : null;
        this.EmploymentContractId = this.EmploymentContract != null ? this.newObj.EmploymentContracts[0].Id : 0;
        this.EmploymentContractPayCycleId = this.EmploymentContract != null ? this.newObj.EmploymentContracts[0].PayCycleId : 0;
        this.CandidateOfferDetails = this.newObj.CandidateOfferDetails != undefined && this.newObj.CandidateOfferDetails != null && this.newObj.CandidateOfferDetails.length > 0 ? 
        _.orderBy(this.newObj.CandidateOfferDetails , ["Id"] , ["desc"]).find(x => x.Status == OfferStatus.Active) : null;
        let savedElcTransactions: EmployeeLifeCycleTransaction = this.oldObj.ELCTransactions.find(a => a.Status == ELCStatus.Saved);
        let rejectedELCTransaction: EmployeeLifeCycleTransaction = this.oldObj.ELCTransactions.find(a => a.Status == ELCStatus.Rejected);
        let filteredActiveELC: EmployeeLifeCycleTransaction[] = this.oldObj.ELCTransactions.filter(a => a.Status == ELCStatus.Active);
        this.Active_ELC_Obj = //savedElcTransactions != undefined && savedElcTransactions != null  ? savedElcTransactions :
          //rejectedELCTransaction != undefined && rejectedELCTransaction != null ? rejectedELCTransaction:
          filteredActiveELC != undefined && filteredActiveELC != null ?
            _.orderBy(this.newObj.ELCTransactions, ["Id"], ["desc"]).find(a => a.Status == ELCStatus.Active) :
            null;
        if (this.Active_ELC_Obj == undefined || this.Active_ELC_Obj == null) {
          this.Active_ELC_Obj = this.generateElcUsingMaster();
        }

        
        console.log("Active :: ", this.Active_ELC_Obj);

        this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && (this.Active_ELC_Obj.Status == ELCStatus.Saved || this.Active_ELC_Obj.Status == ELCStatus.Rejected) ? this._OldELCTransactionId = this.Active_ELC_Obj.Id : null;
        this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && (this.Active_ELC_Obj.Status == ELCStatus.Saved || this.Active_ELC_Obj.Status == ELCStatus.Rejected) ? this._OldRateSetId = this.Active_ELC_Obj.EmployeeRatesets.length > 0 ? this.Active_ELC_Obj.EmployeeRatesets[0].Id : 0 : null;
        console.log("Old ID :: ", this._OldELCTransactionId + " RateSetId :: " + this._OldRateSetId);

        //Check For Rateset in active elc
        if (this.Active_ELC_Obj != undefined && (this.Active_ELC_Obj.EmployeeRatesets == undefined ||
          this.Active_ELC_Obj.EmployeeRatesets === null || this.Active_ELC_Obj.EmployeeRatesets.length == 0)) {
          this.Active_ELC_Obj.EmployeeRatesets = [];

          if (this.newObj.EmployeeRatesets != null && this.newObj.EmployeeRatesets.length > 0) {
            console.log("Adding rateset from masters");
            let rateset = _.orderBy(this.newObj.EmployeeRatesets, ["Id"], ["desc"]).find(a => a.Status == EmployeeStatus.Active)
            console.log(rateset);
            if (rateset != undefined && rateset != null) {
              this.Active_ELC_Obj.EmployeeRatesets.push(rateset);
            }
          }

          if (this.Active_ELC_Obj.EmployeeRatesets == undefined || this.Active_ELC_Obj.EmployeeRatesets === null ||
            this.Active_ELC_Obj.EmployeeRatesets.length == 0) {
            console.log("Adding rateset from previous elc");
            this.Active_ELC_Obj.EmployeeRatesets = [];
            for (let k = 0; k < this.oldObj.ELCTransactions.length; k++) {
              const ele = this.oldObj.ELCTransactions[k].EmployeeRatesets;
              if (typeof ele != 'undefined' && ele.length > 0 && typeof ele[0] != 'undefined') {
                let ite = ele.find(x => x.Status == EmployeeStatus.Active);
                if (ite != null && ite != undefined) {
                  this.Active_ELC_Obj.EmployeeRatesets.push(ite)
                }
              }
            }
          }


        }

        console.log("Active RateSet ::", this.Active_ELC_Obj);
        console.log("employement contract ::",this.EmploymentContract);
        console.log("candidate offer::", this.CandidateOfferDetails);
    

        var initiatedELCTransaction: any = [];

        
        initiatedELCTransaction =  _.orderBy(this.newObj.ELCTransactions, ["Id"], ["desc"]).find(a => a.Status == ELCStatus.Saved);
        console.log('ELCTransaction intiated :: ', initiatedELCTransaction);


        //Get the current ELC. Priority : Saved -> Rejected -> active -> masters
        if (initiatedELCTransaction === undefined || initiatedELCTransaction === null || initiatedELCTransaction.length === 0) {
          let rejectedItem = this.newObj.ELCTransactions.filter(a => a.Status == ELCStatus.Rejected);
          console.log("rejected ELC", rejectedItem);
          if (rejectedItem != undefined && rejectedItem != null && rejectedItem.length > 0) {
            initiatedELCTransaction = _.orderBy(rejectedItem, ["Id"], ["desc"])[0];
            this.ELCTransaction = JSON.parse(JSON.stringify(initiatedELCTransaction));
          }
          else {
            let activeItem = this.newObj.ELCTransactions.filter(a => a.Status == ELCStatus.Active && a.IsLatest == true);
            console.log("Active ELC", activeItem);
            if (activeItem != undefined && activeItem != null && activeItem.length > 0) {
              initiatedELCTransaction = _.orderBy(activeItem, ["Id"], ["desc"])[0];
              this.ELCTransaction = JSON.parse(JSON.stringify(initiatedELCTransaction));
              this.ELCTransaction.IsRateSetValid = false;
              this.ELCTransaction.IsMinimumwageAdhere = false;
              this.ELCTransaction.DocumentApprovalIds = [];
              this.ELCTransaction.DocumentApprovalLst = [];
              this.ELCTransaction.SendMailImmediately = false;
              this.ELCTransaction.CCMailIds = '';
              this.ELCTransaction.Id = 0;
              this.ELCTransaction.LetterTemplateId = 0;
              this.ELCTransaction.EffectivePayPeriodId = 0;
              this.ELCTransaction.LetterRemarks = '';
            }
            else {
              this.ELCTransaction = this.generateElcUsingMaster();
            }
          }

        } else {
          this.ELCTransaction = JSON.parse(JSON.stringify(initiatedELCTransaction));
        }

        // If Idx is not matching with the saved transaction then generate from master  
        if (this.ELCTransaction.Status == ELCStatus.Saved) {
          if (Number(this.ELCTransaction.ELCTransactionTypeId) !== Number(this.Idx)) {
            console.log("Idx not matched ! Generating elc from masters", this.Idx, Number(this.ELCTransaction.ELCTransactionTypeId))
            let temp: EmployeeLifeCycleTransaction = JSON.parse(JSON.stringify(this.ELCTransaction));
            this.ELCTransaction = this.generateElcUsingMaster();
            this.ELCTransaction.Id = temp.Id;
            this.ELCTransaction.Status = ELCStatus.Saved;
          }
        }
        console.log('ELCTransactions ::', this.newObj.ELCTransactions);
        console.log('selected ELCTransaction ::', this.ELCTransaction);

        //Get israteset valid from elc transction
        this.IsRateSetValue = this.ELCTransaction.IsRateSetValid !== undefined && this.ELCTransaction.IsRateSetValid !== null ?
          this.ELCTransaction.IsRateSetValid : false;

        //Get isminimumwage adhere  from elc transction
        this.isMinimumwageAdhered = this.ELCTransaction.IsMinimumwageAdhere !== undefined && this.ELCTransaction.IsMinimumwageAdhere !== null ?
          this.ELCTransaction.IsMinimumwageAdhere : false;

        //Contract end date 

        //If Rateset there in transaction then get from transaction
        if (typeof this.ELCTransaction["EmployeeRateset"] == 'string' && this.ELCTransaction["EmployeeRateset"] != '[]' &&
          (this.ELCTransaction.EmployeeRatesets == undefined || this.ELCTransaction.EmployeeRatesets == null ||
            this.ELCTransaction.EmployeeRatesets.length <= 0)) {
          console.log("Adding Rateset from its own transaction");
          this.ELCTransaction.EmployeeRatesets = JSON.parse(this.ELCTransaction["EmployeeRateset"]);
        }

        //Get Document Approval list
        if (this.ELCTransaction.DocumentApprovalLst !== undefined && this.ELCTransaction.DocumentApprovalLst !== null) {
          this.clientApprovalTbl = _.cloneDeep(this.ELCTransaction.DocumentApprovalLst);

          for (let i = 0; i < this.clientApprovalTbl.length; ++i) {
            this.clientApprovalTbl[i].Idx = i + 1;
            this.clientApprovalTbl[i].UIStatus = this.clientApprovalTbl[i].Status;
          }
        }
        else {
          this.clientApprovalTbl = [];
        }

        // Get Document Approval Id
        if (this.ELCTransaction.DocumentApprovalIds !== undefined && this.ELCTransaction.DocumentApprovalIds !== null) {
          this.DocumentApprovalIds = _.cloneDeep(this.ELCTransaction.DocumentApprovalIds);
        }
        else {
          this.DocumentApprovalIds = [];
        }

        //If Rateset is null in elc transaction then take from active transaction.
        if ((this.ELCTransaction.EmployeeRatesets == null || this.ELCTransaction.EmployeeRatesets == undefined || this.ELCTransaction.EmployeeRatesets.length == 0) && this.Idx != 4 && this.Idx != 8 && this.Idx != 12) {
          //  if ((this.ELCTransaction.EmployeeRatesets == null || this.ELCTransaction.EmployeeRatesets == undefined || this.ELCTransaction.EmployeeRatesets.length == 0)) { 
          let collect_active_elc_transaction_rateset = [];

          if ((this.Active_ELC_Obj != null && this.Active_ELC_Obj != undefined && this.Active_ELC_Obj.EmployeeRatesets.length > 0)) {
            console.log("Adding Rateset from active elc");
            this.ELCTransaction.EmployeeRatesets = this.Active_ELC_Obj.EmployeeRatesets;
            this.ELCTransaction.EmployeeRatesets[0].Id = 0;
            this.ELCTransaction.EmployeeRatesets[0].EmployeeLifeCycleTransactionId = this.ELCTransaction.Id;
            this.ELCTransaction.EmployeeRatesets[0].Status = 0;
            this.ELCTransaction.EmployeeRatesets[0].IsLatest = false;
          }
          else {
            console.log('ELCTransactions 2 ::', this.newObj.ELCTransactions);
            console.log("Adding Rateset from old elc");

            let collect_active_employee_rateset = []
            for (let m = 0; m < this.newObj.ELCTransactions.length; m++) {
              const element = this.newObj.ELCTransactions[m].EmployeeRatesets;


              if (element.length > 0 && typeof element[0] != 'undefined') {
                let ite = element.find(x => x.Status == EmployeeStatus.Active);
                if (ite != null && ite != undefined) {
                  collect_active_elc_transaction_rateset.push(ite)
                }
              }

            }

            // for (let n = 0; n < collect_active_elc_transaction_rateset.length; n++) {
            //   const element = array[n];

            // }
            // console.log(collect_active_elc_transaction_rateset.find(a=>a.Status === 1))
            collect_active_employee_rateset.push(collect_active_elc_transaction_rateset.find(a => a.Status === EmployeeStatus.Active));


            // _.find(collect_active_employee_rateset,  function(a) {
            //    if(a.Status === EmployeeStatus.Active){
            //     a.Id  = Number(0),
            //     a.Status = 0,
            //     a.IsLatest = false
            //     return a;
            //    }
            // });

            collect_active_elc_transaction_rateset.map(e => e.Status == EmployeeStatus.Active ? (e.Id = 0, e.Status = 0, e.IsLatest = false, e) : e);

            console.log("collect_active_employee_rateset ", collect_active_employee_rateset);

            if (collect_active_employee_rateset != undefined && collect_active_employee_rateset != null) {

              this.ELCTransaction.EmployeeRatesets.push(collect_active_employee_rateset[0]);
              // this.Active_ELC_Obj.EmployeeRatesets.length == 0 && this.Active_ELC_Obj.EmployeeRatesets.push(collect_active_employee_rateset[0])

            } else {

              this.ELCTransaction.EmployeeRatesets.push(_EmployeeRateset);

            }

          }
        }

        if (this.Active_ELC_Obj != null && this.Active_ELC_Obj != undefined && this.Active_ELC_Obj.EmployeeRatesets.length > 0 && (typeof this.Active_ELC_Obj.EmployeeRatesets[0] == 'undefined' || typeof this.Active_ELC_Obj.EmployeeRatesets[0] == null)) {
          this.alertService.showWarning("There are no active employee breakup! Please contact your support admin for help.");
          this.router.navigate(['/app/elc/employeeLifecycleList']);
          return;
        }



        console.log('initiatedELCTransaction second :: ', initiatedELCTransaction);

        let jObj_ELC = JSON.stringify(this.ELCTransaction);
        this.jStr_ELC = JSON.parse(jObj_ELC);

        // PRE-DEFINED RECORDS FROM DATABASE 
        this.jStr_ELC.ClientContractId = this.ClientContractId;
        this.jStr_ELC.ClientId = this.ClientId;
        this.jStr_ELC.CompanyId = this.CompanyId;
        this.jStr_ELC.Country = this.newObj.CountryOfOrigin;
        this.jStr_ELC.CityId =  (this.jStr_ELC.CityId != 0 && this.jStr_ELC.CityId != null && this.jStr_ELC.CityId != undefined) ? this.jStr_ELC.CityId : this.newObj.EmploymentContracts[0].CityId;
        this.jStr_ELC.Gender = this.newObj.Gender  ? this.newObj.Gender : null;
        this.jStr_ELC.Department  = this.CandidateOfferDetails != undefined && (this.CandidateOfferDetails.Department != null || this.CandidateOfferDetails.Department != undefined)
          ? this.CandidateOfferDetails.Department : '';
        this.jStr_ELC.Grade  = this.CandidateOfferDetails != undefined && (this.CandidateOfferDetails.Grade != null || this.CandidateOfferDetails.Grade != undefined)
          ? this.CandidateOfferDetails.Grade : '';

        this.jStr_ELC.Attribute1 = this.CandidateOfferDetails != undefined && (this.CandidateOfferDetails.Attribute1 != null || this.CandidateOfferDetails.Attribute1 != undefined)
          ? this.CandidateOfferDetails.Attribute1 : '';
        this.jStr_ELC.Attribute2 = this.CandidateOfferDetails != undefined && (this.CandidateOfferDetails.Attribute2 != null || this.CandidateOfferDetails.Attribute2 != undefined)
          ? this.CandidateOfferDetails.Attribute2 : '';
        this.jStr_ELC.Attribute3 = this.CandidateOfferDetails != undefined && (this.CandidateOfferDetails.Attribute3 != null || this.CandidateOfferDetails.Attribute3 != undefined)
          ? this.CandidateOfferDetails.Attribute3 : '';
        this.jStr_ELC.Attribute4 = this.CandidateOfferDetails != undefined && (this.CandidateOfferDetails.Attribute4 != null || this.CandidateOfferDetails.Attribute4 != undefined)
          ? this.CandidateOfferDetails.Attribute4 : '';


        if (this.jStr_ELC.Status == ELCStatus.Active) {
          this.jStr_ELC.Id = 0;
          this.jStr_ELC.Status = ELCStatus.Initiated;
          this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].Id = 0 : null
          this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].EmployeeLifeCycleTransactionId = this.jStr_ELC.Id : null;
          this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].IsLatest = false : null;
          this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].RatesetProducts = [] : null;
          this.ELCModel.oldELCobj = null;
          this.jStr_ELC.EffectiveDate = "0001-01-01T00:00:00";
          this.jStr_ELC.ContractEndDate = this.EmploymentContract.EndDate !== undefined &&
            this.EmploymentContract.EndDate !== null ? this.EmploymentContract.EndDate : moment().format('YYYY-MM-DD');
          this.jStr_ELC.EndDate = this.EmploymentContract.EndDate;
          this.jStr_ELC.OldDesignation = this.EmploymentContract.Designation;
          this.jStr_ELC.OldLocation = parseInt(this.EmploymentContract.WorkLocation, 10);
          this.jStr_ELC.OldRatesetId = this.Active_ELC_Obj.EmployeeRatesets[0].Id;
          this.jStr_ELC.InsuranceplanId = null;
          // this.jStr_ELC.LetterRemarks = "";
        }


        // this.ELCModel.oldELCobj = this.jStr_ELC.Id == 0 ? this.Active_ELC_Obj : this.ELCTransaction;
        this.ELCModel.oldELCobj = this.jStr_ELC.Id == 0 ? null : this.ELCTransaction;
        console.log('Final ELC :: ', this.jStr_ELC);


        this.RevisionForm.patchValue({

          "city" : this.jStr_ELC.CityId == 0 ? null : this.jStr_ELC.CityId,
          "location": this.jStr_ELC.Location == 0 ? null : this.jStr_ELC.Location,
          "designation": this.jStr_ELC.Designation,
          "campus": this.jStr_ELC.ReportingLocation == 0 ? null :  this.jStr_ELC.ReportingLocation,
          "costCityCenter":  this.jStr_ELC.CostCityCenter == 0 ? null : this.jStr_ELC.CostCityCenter,
          "reportingManager": this.jStr_ELC.ManagerId == 0 ? null :this.jStr_ELC.ManagerId,
          "division": this.jStr_ELC.Division == 0 ? null: this.jStr_ELC.Division,
          "department": this.jStr_ELC.DepartmentId == 0 ? null : this.jStr_ELC.DepartmentId ,
          "type": this.jStr_ELC.Category == 0 ? null : this.jStr_ELC.Category,
          "level": this.jStr_ELC.Level == 0 ? null : this.jStr_ELC.Level,
          "jobRole": this.jStr_ELC.JobProfileId == 0 ? null :  this.jStr_ELC.JobProfileId,
          "subEmploymentType": (this.jStr_ELC.SubEmploymentType == 0 || this.jStr_ELC.SubEmploymentType == null || this.jStr_ELC.SubEmploymentType == undefined)  ? this.EmploymentContract.SubEmploymentType : this.jStr_ELC.SubEmploymentType,
          // "emailList": this.jStr_ELC.CCMailIds,
          "industryType": this.jStr_ELC.IndustryId == 0 ? null : this.jStr_ELC.IndustryId,
          "skillCategory": this.jStr_ELC.SkillCategory == 0 ? null : this.jStr_ELC.SkillCategory,
          "zone": this.jStr_ELC.Zone == 0 ? null : this.jStr_ELC.Zone,
          "employmentZone": this.isAllenDigital ? (this.jStr_ELC.EmploymentZone == 0  ? null : this.jStr_ELC.EmploymentZone) : 0,
          "salaryType": this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].SalaryBreakUpType : null,
          "forMonthlyValue": this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].IsMonthlyValue : false,
          "monthlyAmount": this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].MonthlySalary : 0,
          "annualSalary": this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].AnnualSalary : 0,
          "payGroup": this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].PayGroupdId : null,
          "insurance": this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ? this.jStr_ELC.EmployeeRatesets[0].InsuranceAmount : null,
          "insuranceplan": this.jStr_ELC.InsuranceplanId !== undefined && this.jStr_ELC.InsuranceplanId !== null ? this.jStr_ELC.InsuranceplanId : null,
          "onCostInsuranceAmount": this.jStr_ELC.OnCostInsurance !== undefined && this.jStr_ELC.OnCostInsurance !== null ? this.jStr_ELC.OnCostInsurance : 0,
          "fixedDeductionAmount": this.jStr_ELC.FixedInsuranceDeduction !== undefined && this.jStr_ELC.FixedInsuranceDeduction !== null ? this.jStr_ELC.FixedInsuranceDeduction : 0,
          // "GMC": this.jsonObj[0].IsBillingAddress,
          // "GPA": this.jsonObj[0].IsShippingAddress,
          "effectiveDate": (this.jStr_ELC.EffectiveDate),
          "revisionTemplate": this.jStr_ELC.LetterTemplateId != 0 ? this.jStr_ELC.LetterTemplateId : null,
          "ccmailids": this.jStr_ELC.CCMailIds,
          "sendmailimmediately": this.jStr_ELC.SendMailImmediately,
          "effectivePeriod": this.jStr_ELC.EffectivePayPeriodId == 0 ? null : this.jStr_ELC.EffectivePayPeriodId,
          "contractEndDate": (this.jStr_ELC.ContractEndDate !== null && this.jStr_ELC.ContractEndDate !== undefined) ?
            this.jStr_ELC.ContractEndDate : (this.EmploymentContract.EndDate !== null &&
              this.EmploymentContract.EndDate !== undefined) ?
              this.EmploymentContract.EndDate : moment().format('YYYY-MM-DD'),
          "LetterRemarks": this.jStr_ELC.LetterRemarks
          // "hiketype": this.jsonObj[0].IsShippingAddress,
          // "percentage": this.jsonObj[0].IsBillingAddress,
          // "Value": this.jsonObj[0].IsShippingAddress,
        });


        this.Id = this.jStr_ELC.Id;
        (this.RevisionForm.get('effectiveDate').value) == "0001-01-01T00:00:00" ? this.RevisionForm.controls['effectiveDate'].setValue(new Date()) : this.RevisionForm.controls['effectiveDate'].setValue(new Date(this.RevisionForm.get('effectiveDate').value));
        (this.RevisionForm.get('contractEndDate').value) == "0001-01-01T00:00:00" ? this.RevisionForm.controls['contractEndDate'].setValue(new Date()) : this.RevisionForm.controls['contractEndDate'].setValue(new Date(this.RevisionForm.get('contractEndDate').value));
        var temp = new Array();
        temp = this.jStr_ELC.CCMailIds != null && this.jStr_ELC.CCMailIds != "" && this.jStr_ELC.CCMailIds != undefined ? this.jStr_ELC.CCMailIds.split(",") : [];
        this.ccmailtags = temp;

        // ELC VIEW MODEL DATA BINDING 
        this.ELCModel.customObject1 = null;
        this.ELCModel.customObject2 = null;
        this.ELCModel.Id = 0;
        this.ELCModel.newELCobj = this.jStr_ELC;
        console.log('PRE ELC MODEL :: ', this.ELCModel);

        //Set Company Settings
        if (this.newObj.CompanySettings != undefined && this.newObj.CompanySettings != null) {
          this.companySettings = JSON.parse(this.newObj.CompanySettings);
          console.log("Company Settings ::", this.companySettings);
        }

        //Set Min Contract Date
        if (environment.environment.IsEmpContractTermReductionAllowed) {
          this.minContractDate = new Date();
        }
        else {
          this.minContractDate = new Date(this.EmploymentContract.EndDate);
        }

        //Get Insurance list
        if (this.newObj.InsuranceList !== undefined && this.newObj.InsuranceList !== null) {
          this.InsuranceList = this.newObj.InsuranceList;
        }
        else {
          this.InsuranceList = [];
        }

        if (this.Idx == 8) {
          this.RevisionForm.get('effectivePeriod').setValue(0);
        }

        // DROPDOWN LIST DATA MAPPING USING RESPECTIVE APIS
        this.Pre_loading_records("isOfferInfo");
        this.load_accordion_record();


      }

    });

  }
  /* #endregion */

  /* #region INITIAL BINDING - DROPDOWN LIST DATA MAPPING USING RESPECTIVE APIS */

  // ASYNC OPERATION LIKE PROMISE
  async load_accordion_record() {

    await this.Pre_loading_records("isOnboardingInfo");
    await this.getMasterInfo(this.EmployeeId);
  }

  generateElcUsingMaster(): EmployeeLifeCycleTransaction {
    let newELCTran: EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();

    newELCTran = JSON.parse(JSON.stringify(_EmployeeLifeCycleTransaction));

    newELCTran.EmployeeId = this.newObj.EmployeeId;
    newELCTran.EmploymentContractId = this.EmploymentContractId;
    newELCTran.ContractEndDate = this.EmploymentContract.EndDate;
    newELCTran.Designation = this.EmploymentContract.Designation;
    newELCTran.Location = Number(this.EmploymentContract.WorkLocation);
    newELCTran.State = this.EmploymentContract.StateId;
    newELCTran.DateOfJoining = this.EmploymentContract.StartDate;
    newELCTran.EndDate = this.EmploymentContract.EndDate;
    newELCTran.OldDesignation = this.EmploymentContract.Designation;
    newELCTran.OldLocation = parseInt(this.EmploymentContract.WorkLocation, 10);
    newELCTran.Status = ELCStatus.Active
    newELCTran.IsMinimumwageAdhere = false;
    newELCTran.IsRateSetValid = false;
    newELCTran.SendMailImmediately = false;
    newELCTran.CCMailIds = '';
    newELCTran.Level = this.EmploymentContract.Level
    newELCTran.IndustryId = this.EmploymentContract.IndustryId
    newELCTran.DepartmentId = this.EmploymentContract.DepartmentId
    newELCTran.SubEmploymentType = this.EmploymentContract.SubEmploymentType
    newELCTran.JobProfileId = this.EmploymentContract.JobProfileId
    newELCTran.Category = this.EmploymentContract.Category
    newELCTran.Division = this.EmploymentContract.Division
    newELCTran.ManagerId = this.EmploymentContract.ManagerId
    newELCTran.CostCityCenter = this.EmploymentContract.CostCityCenter
    newELCTran.ReportingLocation = this.EmploymentContract.ReportingLocation
    newELCTran.CityId = this.EmploymentContract.CityId
    

    //newELCTran.IndustryId = this.CandidateOfferDetails.IndustryId;      
    //newELCTran.SkillCategory = this.CandidateOfferDetails.SkillCategory;   
    //newELCTran.Zone = this.CandidateOfferDetails.Zone;           


    if (this.newObj.EmployeeRatesets != null && this.newObj.EmployeeRatesets.length > 0) {
      let rateset = _.orderBy(this.newObj.EmployeeRatesets, ["Id"], ["desc"]).find(a => a.Status == EmployeeStatus.Active && a.IsLatest == true)
      if (rateset != undefined && rateset != null) newELCTran.EmployeeRatesets.push(rateset);
    }

    newELCTran.OldRatesetId = newELCTran.EmployeeRatesets[0].Id;


    return newELCTran;

    // this.ELCTransaction = newELCTran;
    // this.Active_ELC_Obj =  JSON.parse(JSON.stringify(newELCTran));

  }

  // getMasterInfo(empid) {

  //   this.onboardingService.getMasterInfo(empid).subscribe((result) => {
  //     let apiResult: apiResult = (result);
  //     console.log(apiResult);
  //     if (apiResult.Status && apiResult.Result != null) {
  //       this.MigrationInfoGrp = JSON.parse(apiResult.Result);
  //       let EffectivePayPeriodList = this.MigrationInfoGrp[0].PayPeriodList;
  //       this.EffectivePayPeriodList = EffectivePayPeriodList.filter(a => a.PaycycleId == this.EmploymentContractPayCycleId);
  //       console.log('MIGRATION INFO :::', this.EffectivePayPeriodList);
  //     }

  //   }), ((error) => {

  //   })
  // }

  getMasterInfo(empid) {

    this.onboardingService.getMasterInfo(empid).subscribe((result) => {
      let apiResult = result;
      console.log(apiResult);
      if (apiResult.Status && apiResult.Result != null) {
        // this.MigrationInfoGrp = JSON.parse(apiResult.Result);
        let finalResult = apiResult.Result.Result
        this.MigrationInfoGrp = JSON.parse(finalResult);
        let EffectivePayPeriodList = this.MigrationInfoGrp[0].PayPeriodList;
        this.EffectivePayPeriodList = EffectivePayPeriodList.filter(a => a.PaycycleId == this.EmploymentContractPayCycleId);
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
          this.minimumWagesApplicableProductsList && this.minimumWagesApplicableProductsList.length > 0 ? this.RevisionForm.controls['minimumWagesApplicableProducts'].setValue(this.minimumWagesApplicableProductsList[0].Code)
          : this.RevisionForm.controls['minimumWagesApplicableProducts'].setValue(null);
        }
        let payGroup = this.Idx != 4 && this.Idx != 8 && this.Idx != 12 && this.PayGroupList.length > 0 && this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ?
        this.PayGroupList.find(a => a.PayGroupId == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0 ? this.Active_ELC_Obj.EmployeeRatesets[0].PayGroupdId : this.jStr_ELC.EmployeeRatesets[0].PayGroupdId)) : null;
        this.lstOfPaygroupOverrideProducts = this.MigrationInfoGrp[0].PaygroupProductOverridesList;
        payGroup != null && this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0 && 
        ( this.lstOfPaygroupOverrideProducts = this.lstOfPaygroupOverrideProducts.filter(item =>
          item.PayGroupId == payGroup.PayGroupId));

        console.log('MIGRATION INFO / EFFECTIVE PERIOD :::', this.MigrationInfoGrp, this.EffectivePayPeriodList);
      }

    }), ((error) => {

    })
  }

  onChangePayGroup(e,i): void {
    this.isRecalculate = false;
  }

  public Pre_loading_records(accordion_Name: string) {

    let dataSource: DataSource = {
      Name: 'GetOnboardingMasterInfobyClientIdAdditionalInfo',
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [
      {
        FieldName: '@controlSetName',
        Value: accordion_Name
      },
      {
        FieldName: '@userId',
        Value: this.UserId
      },
      {
        FieldName: '@companyId',
        Value: this.EmploymentContract.CompanyId
      },
      {
        FieldName: '@clientId',
        Value: this.EmploymentContract.ClientId
      },

    ]

    this.pageLayoutService.getDataset(dataSource, searchElements).subscribe(data => {
      // const apiResult: apiResult = authorized;
      console.log("Offer info ::", data);
      if (data.Status && data.dynamicObject !== null && data.dynamicObject != "") {

        if (accordion_Name == "isOfferInfo") {
          // if (this.Idx != 4) {
          this.OfferInfoListGrp = JSON.parse(data.dynamicObject);
          console.log("offer info", this.OfferInfoListGrp);
          this.ClientCityList = this.OfferInfoListGrp.ClientCityList
          this.IndustryList = _.orderBy(this.OfferInfoListGrp.IndustryList, ["Name"], ["asc"]);
          this.ClientLocationList = _.orderBy(this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.ClientId), ["LocationName"], ["asc"]);
          this.ClientReportingLocationList = _.orderBy(this.OfferInfoListGrp.ClientReportingLocationList.filter(z => z.ClientId == this.ClientId), ["LocationName"], ["asc"]);
          this.LstCostCityCenter = this.OfferInfoListGrp.LstCostCityCenter;
          this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
          this.DesignationList = this.OfferInfoListGrp.LstEmployeeDesignation;
          console.log('INDUSTRY LIST :: ', this.IndustryList);
          console.log('PAYGROUPD LIST :: ', this.PayGroupList);
          console.log('LOCATION LIST :: ', this.ClientLocationList);
          if(this.IndustryList.length == 1){
            this.defaultIndustry = this.IndustryList[0] ;
            let formIndustryValue = this.RevisionForm.get('industryType').value;
            if(formIndustryValue == 0 || formIndustryValue == null){
              this.RevisionForm.patchValue({
                "industryType": this.defaultIndustry.Id
              })
            }
          }
          // }

          let location = this.ClientLocationList.length > 0 ? this.ClientLocationList.find(a => a.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Location : this.jStr_ELC.Location)) : null;
          this.Label_LocationName = location && location.LocationName;
          this.Idx != 8 && this.Idx != 12 ? this.onChangeOfferLocation(this.ClientLocationList.find(z => z.Id == this.jStr_ELC.Location), 'firstTime') : this.label_binding();
          this.Idx != 4 && this.Idx != 8 && this.Idx != 12 ? this.onChangeOfferLocation_OLD(this.ClientLocationList.find(z => z.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Location : this.jStr_ELC.Location)), 'firstTime') : this.label_binding();

          // this.onChangeIndustryType(null);


        }
        else if (accordion_Name == "isOnboardingInfo") {
          let OnBoardingInfoListGrp: OnBoardingInfo = JSON.parse(data.dynamicObject);
          this.ClientList = _.orderBy(OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);
          console.log('CLIENT LIST ::', this.ClientList);
          this.Label_ClientName = this.ClientList.length > 0 ? this.ClientList.find(a => a.Id == this.ClientId).Name : null;

        }

      }
      setTimeout(() => {
        // STATIC DATA MAPING TS TO HTML ELEMENT
        this.label_binding();
      }, 2500);

    }, (error) => {

    });

    // this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId , this.BusinessType == 1  ? this.ClientId : 0)
    //   .subscribe(authorized => {
    //     const apiResult: apiResult = authorized;

    //     if (apiResult.Status && apiResult.Result != "") {

    //       if (accordion_Name == "isOfferInfo") {
    //         // if (this.Idx != 4) {
    //         this.OfferInfoListGrp = JSON.parse(apiResult.Result);
    //         console.log("offer info", this.OfferInfoListGrp);
    //         this.IndustryList = _.orderBy(this.OfferInfoListGrp.IndustryList, ["Name"], ["asc"]);
    //         this.ClientLocationList = _.orderBy(this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.ClientId), ["LocationName"], ["asc"]);
    //         this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
    //         console.log('INDUSTRY LIST :: ', this.IndustryList);
    //         console.log('PAYGROUPD LIST :: ', this.PayGroupList);
    //         console.log('LOCATION LIST :: ', this.ClientLocationList);
    //         // }

    //         let location = this.ClientLocationList.length > 0 ? this.ClientLocationList.find(a => a.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Location : this.jStr_ELC.Location)) : null;
    //         this.Label_LocationName = location && location.LocationName;
    //         this.Idx != 4 && this.Idx != 8 && this.Idx != 12 ? this.onChangeOfferLocation(this.ClientLocationList.find(z => z.Id == this.jStr_ELC.Location), 'firstTime') : this.label_binding();
    //         this.Idx != 4 && this.Idx != 8 && this.Idx != 12 ? this.onChangeOfferLocation_OLD(this.ClientLocationList.find(z => z.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Location : this.jStr_ELC.Location)), 'firstTime') : this.label_binding();


    //         // this.onChangeIndustryType(null);


    //       }
    //       else if (accordion_Name == "isOnboardingInfo") {
    //         let OnBoardingInfoListGrp: OnBoardingInfo = JSON.parse(apiResult.Result);
    //         this.ClientList = _.orderBy(OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);
    //         console.log('CLIENT LIST ::', this.ClientList);
    //         this.Label_ClientName = this.ClientList.length > 0 ? this.ClientList.find(a => a.Id == this.ClientId).Name : null;

    //       }

    //     }
    //     setTimeout(() => {
    //       // STATIC DATA MAPING TS TO HTML ELEMENT
    //       this.label_binding();
    //     }, 2500);

    //   }, (error) => {

    //   });


    this.doletterTemplate();
  }

  /* #endregion */

  /* #region  LETTER TEMPLATE FOR ELC TRANSACTION ONLY */

  doletterTemplate() {

    // this.onboardingService.getLetterTemplate(0, 0, 0)
    //   .subscribe(authorized => {
    //     const apiResult: apiResult = authorized;
    //     if (apiResult.Status && apiResult.Result != "") {
    //       this.LetterTemplateList = JSON.parse(apiResult.Result);
    //       console.log(this.LetterTemplateList);

    //       // this.LetterTemplateList = this.LetterTemplateList.filter(a => a.RequestType == ApprovalFor.OL);
    //     }
    //   }), ((err) => {

    //   })


    let dataSource: DataSource = {
      Name: 'GetTemplateDetails',
      Type: DataSourceType.SP,
      IsCoreEntity: false
    };

    let searchElements: SearchElement[] = [
      {
        FieldName: "@clientId",
        Value: this.ClientId
      },
      {

        FieldName: "@clientcontractId",
        Value: this.ClientContractId
      },
      {

        FieldName: "@companyId",
        Value: this.CompanyId
      },
      {
        FieldName: '@categoryCode',
        Value: 'Revision'
      },
    ];

    this.pageLayoutService.getDataset(dataSource, searchElements).subscribe(apiResponse => {
      if (apiResponse.Status && apiResponse.dynamicObject !== null && apiResponse.dynamicObject !== '') {
        this.LetterTemplateList = JSON.parse(apiResponse.dynamicObject);
      }
      else {
        this.LetterTemplateList = [];
      }

      console.log("letter template list ::", this.LetterTemplateList);
    }, error => {
      console.error(error);
    })
  }


  /* #endregion */

  /* #region  BASED ON CLIENT LOCATION TO FIND SKILLS AND ZONE LIST */

  onChangeOfferLocation(event: ClientLocationList, queue) {
    if (queue == 'secondtime') {
      this.RevisionForm.controls['skillCategory'] != null ? this.RevisionForm.controls['skillCategory'].setValue(null) : null;
      this.RevisionForm.controls['zone'] != null ? this.RevisionForm.controls['zone'].setValue(null) : null;
    }
    // if (event == null) {
    //   this.CityName = null;
    //   this.StateName = null;
    // }
    // else {
    //   this.CityName = event.CityName;
    //   this.StateName = event.StateName;
    //   // this.RevisionForm.controls['skillCategory'] != null ? this.RevisionForm.controls['skillCategory'].setValue(null) : null;
    //   // this.RevisionForm.controls['zone'] != null ? this.RevisionForm.controls['zone'].setValue(null) : null;
    // }

    console.log("Event ::", event);

    // this.IndustryId = (this.RevisionForm.controls['industryType'] != null ? (this.RevisionForm.get('industryType').value) : null);
    this.IndustryId = (this.RevisionForm.get('industryType').value);
    this.StateId = this.EmploymentContract.StateId;
    this.CityId = this.EmploymentContract.CityId;

    if (event != null) {
      this.StateId = event.StateId;
      this.CityId = event.CityId;

    }

    if (this.IndustryId && this.StateId) {
      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
        .subscribe(response => {

          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {

            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);
            this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
           
              this.RevisionForm.patchValue({
                "location": event.Id
              })
            

            console.log('SKILLS AND ZONE :: ', this.OfferInfoListGrp1);
              this.ZoneList = this.OfferInfoListGrp1.ZoneList;
              if(this.isAllenDigital){
                // setting default value to zone is required only for allen
                  this.RevisionForm.patchValue({
                    "zone": this.ZoneList[0].Id
                  })
                }
            this.newSkillCategory =  this.SkillCategoryList.length > 0 ?  this.SkillCategoryList.find(a => a.Id  == (this.jStr_ELC != undefined && this.jStr_ELC != null && this.jStr_ELC.SkillCategory ? this.jStr_ELC.SkillCategory : 0)).Name : "";
              
            // let skillCategory = this.SkillCategoryList.length > 0 ? this.SkillCategoryList.find(a => a.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.SkillCategory : this.jStr_ELC.SkillCategory)) : null;
            // this.Label_SkillCategoryName = skillCategory != null ? skillCategory.Name : '';
            // let zone = this.ZoneList.length > 0 ? this.ZoneList.find(a => a.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Zone : this.jStr_ELC.Zone)): null;
            // this.Label_ZoneName = zone != null ? zone.Name : '';


          }
        },
          ((err) => {

          }));




      //     if (queue == 'secondtime') {
      //  this.onFocus_OfferAccordion();
      //     }

    }

  }


  onChangeOfferLocation_OLD(event: ClientLocationList, queue) {


    this.IndustryId = (this.RevisionForm.get('industryType').value);
    // if (event != null) {
    //   this.StateId = event.StateId;
    //   this.CityId = event.CityId;
    // }

    console.log(event);
    let stateId: number;
    stateId = this.EmploymentContract.StateId;
    // if(event == undefined || event == null){
    //  stateId = this.Active_ELC_Obj.State;
    // }
    // else {
    //   stateId = event.StateId;
    // }

    if (this.IndustryId && stateId) {
      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, stateId)
        .subscribe(response => {

          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {

            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);
            let OldSkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
            let OldZoneList = this.OfferInfoListGrp1.ZoneList;

            console.log('SKILLS AND ZONE OLD :: ', this.OfferInfoListGrp1);

            let skillCategory = OldSkillCategoryList.length > 0 ? OldSkillCategoryList.find(a => a.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.SkillCategory ? this.Active_ELC_Obj.SkillCategory : 0)) : null;
            this.Label_SkillCategoryName = skillCategory != null ? skillCategory.Name : '';
            let zone = OldZoneList.length > 0 ? OldZoneList.find(a => a.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Zone : this.jStr_ELC.Zone)) : null;
            this.Label_ZoneName = zone != null ? zone.Name : '';

          }
        },
          ((err) => {

          }));


    }

  }
  /* #endregion */

  /* #region  STATIC LABEL BINDING */
  label_binding() {

    let industry = this.IndustryList.length > 0 ? this.IndustryList.find(a => a.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.IndustryId : 0)) : null;
         this.Label_IndustryName = industry != null ? industry.Name : '';
    let location = this.ClientLocationList.length > 0 ? this.ClientLocationList.find(a => a.Id == (this.EmploymentContract != undefined && this.EmploymentContract != null ? this.EmploymentContract.WorkLocation : this.Active_ELC_Obj.Location)) : null;
    this.Label_LocationName = location != undefined && location != null ? location.LocationName : null;
    let payGroup = this.Idx != 4 && this.Idx != 8 && this.Idx != 12 && this.PayGroupList.length > 0 && this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ?
      this.PayGroupList.find(a => a.PayGroupId == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0 ? this.Active_ELC_Obj.EmployeeRatesets[0].PayGroupdId : this.jStr_ELC.EmployeeRatesets[0].PayGroupdId)) : null;
    this.Label_PayGroupName = payGroup !== undefined && payGroup !== null ? payGroup.Name : '';
    this.Label_DOJ = (this.EmploymentContract.hasOwnProperty("StartDate") && this.EmploymentContract.StartDate != null && this.EmploymentContract.StartDate != undefined && this.EmploymentContract.StartDate != '') ? this.EmploymentContract.StartDate : this.Active_ELC_Obj != undefined ? this.Active_ELC_Obj.DateOfJoining : '';
    this.Label_AnnualSalary = this.Idx != 4 && this.Idx != 8 && this.Idx != 12 && this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0
      ? (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != undefined && this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0 ?
        this.Active_ELC_Obj.EmployeeRatesets[0].AnnualSalary : this.jStr_ELC.EmployeeRatesets[0].AnnualSalary) : 0;
    this.Label_MonthlySalary = this.Idx != 4 && this.Idx != 8 && this.Idx != 12 && this.jStr_ELC.EmployeeRatesets != null && this.jStr_ELC.EmployeeRatesets.length > 0 ?
      (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != undefined && this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0
        ? this.Active_ELC_Obj.EmployeeRatesets[0].MonthlySalary : this.jStr_ELC.EmployeeRatesets[0].MonthlySalary) : 0;
    this.Label_Designation = (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Designation : this.jStr_ELC.Designation);
    this.Label_ContractEndDate = this.EmploymentContract.EndDate;

    this.Label_PFLogic = this.newObj.EmploymentContracts && this.newObj.EmploymentContracts.length > 0 && this.newObj.EmploymentContracts[0].PFLogic ? this.newObj.EmploymentContracts[0].PFLogic : '';



    if( this.labelValidator(this.EmploymentContract, "ReportingLocation") ){
      let objFound = _.find(this.ClientReportingLocationList, {Id : this.EmploymentContract.ReportingLocation}) 
      this.Label_Campus = (objFound && objFound.LocationName)  ? objFound.LocationName : null;
    }else if(this.labelValidator(this.Active_ELC_Obj, "ReportingLocation")){
      let objFound = _.find(this.ClientReportingLocationList, {Id : this.Active_ELC_Obj.ReportingLocation}) 
      this.Label_Campus = (objFound && objFound.LocationName)  ? objFound.LocationName : null;
    }else {
      this.Label_Campus = null;
    }


    if( this.labelValidator(this.EmploymentContract, "CityId") ){
      let objFound = _.find(this.ClientCityList, {Id : this.EmploymentContract.CityId}) 
      this.Label_City = (objFound && objFound.Code)  ? objFound.Code : null;
    }else if(this.labelValidator(this.Active_ELC_Obj, "CityId")){
      let objFound = _.find(this.ClientCityList, {Id : this.Active_ELC_Obj.CityId}) 
      this.Label_City = (objFound && objFound.Code)  ? objFound.Code : null;
    }else {
      this.Label_City = null;
    }


    if( this.labelValidator( this.EmploymentContract , "CostCityCenter") ){
      let objFound = _.find(this.OfferInfoListGrp.LstCostCityCenter, {Id : this.EmploymentContract.CostCityCenter}) 
      this.Label_Cost_City_Center = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "CostCityCenter")){
      let objFound = _.find(this.OfferInfoListGrp.LstCostCityCenter, {Id : this.Active_ELC_Obj.CostCityCenter}) 
      this.Label_Cost_City_Center = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_Cost_City_Center = null
    }

  

    if( this.labelValidator( this.EmploymentContract , "EmploymentZone") ){
      let objFound = _.find(this.OfferInfoListGrp.LstClientZone, {Id : this.EmploymentContract.EmploymentZone}) 
      this.Label_ClientZoneName = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "EmploymentZone")){
      let objFound = _.find(this.OfferInfoListGrp.LstClientZone, {Id : this.Active_ELC_Obj.EmploymentZone}) 
      this.Label_ClientZoneName = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_ClientZoneName = null;
    }

   
    if( this.labelValidator( this.EmploymentContract , "Category") ){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeCategory, {Id : this.EmploymentContract.Category}) 
      this.Label_Type = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "Category")){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeCategory, {Id : this.Active_ELC_Obj.Category}) 
      this.Label_Type = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_Type = null;
    }
  
 
    if( this.labelValidator( this.EmploymentContract , "DepartmentId") ){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeDepartment, {Id : this.EmploymentContract.DepartmentId}) 
      this.Label_Department = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "DepartmentId")){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeDepartment, {Id : this.Active_ELC_Obj.DepartmentId}) 
      this.Label_Department = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_Department = null;
    }


 
    if( this.labelValidator( this.EmploymentContract , "ManagerId") ){
      let objFound = _.find(this.OfferInfoListGrp.ReportingManagerList, {ManagerId : this.EmploymentContract.ManagerId}) 
      this.Label_ReportingManager = (objFound && objFound.ManagerName) ? objFound.ManagerName : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "ManagerId")){
      let objFound = _.find(this.OfferInfoListGrp.ReportingManagerList, {ManagerId : this.Active_ELC_Obj.ManagerId}) 
      this.Label_ReportingManager = (objFound && objFound.ManagerName) ? objFound.ManagerName : null;
    }else {
      this.Label_ReportingManager = null
    }


    if( this.labelValidator( this.EmploymentContract , "Division") ){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeDivision, {Id : this.EmploymentContract.Division}) 
      this.Label_Division = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "Division")){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeDivision, {Id : this.Active_ELC_Obj.Division}) 
      this.Label_Division = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_Division = null
    }


    if( this.labelValidator( this.EmploymentContract , "Level") ){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeLevel, {Id : this.EmploymentContract.Level}) 
      this.Label_Level = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "Level")){
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeLevel, {Id : this.Active_ELC_Obj.Level}) 
      this.Label_Level = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_Level = null
    }


    if( this.labelValidator( this.EmploymentContract , "SubEmploymentType") ){
      let objFound = _.find(this.OfferInfoListGrp.LstSubEmploymentType, {Id : this.EmploymentContract.SubEmploymentType}) 
      this.Label_SubEmployementType = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "SubEmploymentType")){
      let objFound = _.find(this.OfferInfoListGrp.LstSubEmploymentType, {Id : this.Active_ELC_Obj.SubEmploymentType}) 
      this.Label_SubEmployementType = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_SubEmployementType = null
    }
    
    if( this.labelValidator( this.EmploymentContract , "JobProfileId") ){
      let objFound = _.find(this.OfferInfoListGrp.LstJobProfile, {Id : this.EmploymentContract.JobProfileId}) 
      this.Label_JobRole = (objFound && objFound.Name) ? objFound.Name : null;
    }else if(this.labelValidator( this.Active_ELC_Obj , "JobProfileId")){
      let objFound = _.find(this.OfferInfoListGrp.LstJobProfile, {Id : this.Active_ELC_Obj.JobProfileId}) 
      this.Label_JobRole = (objFound && objFound.Name) ? objFound.Name : null;
    }else {
      this.Label_JobRole = null;
    }


    this.isSkeleton = false;
    this.disableBtn = true;

    let effectivedate = new Date(this.Label_DOJ);
    this.EffectiveminDate = new Date();
    this.EffectiveminDate.setDate(effectivedate.getDate());
    this.EffectiveminDate.setMonth(effectivedate.getMonth());
    this.EffectiveminDate.setFullYear(effectivedate.getFullYear());

    var myDate = new Date();
    this.EffectivemaxDate = new Date();
    var newDate = moment(myDate);
    let nextMonth = newDate.add('month', Number(2));
    nextMonth.subtract(1, "days")

    let mxdate = moment(nextMonth).endOf('month').format('YYYY-MM-DD')
    console.log('nextMonth', mxdate);
    let effmxdate = new Date(mxdate);
    this.EffectivemaxDate.setDate(effmxdate.getDate());
    this.EffectivemaxDate.setMonth(effmxdate.getMonth());
    this.EffectivemaxDate.setFullYear(effmxdate.getFullYear());
  }

  /* #endregion */

  /* #region  DO ON CHANGE METHOD OF INDUSTRY LISTING DROPDOWN */
  onChangeIndustryType(event) {
    console.log('ofteridustrychange', event);
    if (event != null) {
      this.RevisionForm.controls['skillCategory'].setValue(null);
      this.RevisionForm.controls['zone'].setValue(null);
    }
    this.IndustryId = (this.RevisionForm.get('industryType').value);
    if (this.StateId && this.IndustryId)

      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
        .subscribe(response => {
          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {
            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);
            this.SkillCategoryList = [];
            this.ZoneList = [];
            this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
            this.ZoneList = this.OfferInfoListGrp1.ZoneList;
          }
        },
          ((err) => {
          }));


    event != null ? this.onFocus_OfferAccordion() : null;
  }

  /* #endregion */

  /* #region  PAGE EXIST WITH ALERT  */
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

        this.router.navigate(['/app/elc/employeeLifecycleList']);
        // swalWithBootstrapButtons.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // )
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        // swalWithBootstrapButtons.fire(
        //   'Cancelled',
        //   'Your imaginary file is safe :)',
        //   'error'
        // )
      }
    })

  }

  /* #endregion */

  /* #region  ON CHANGE FUNCTIONALITY FOR SALARY INPUTS */
  onChangeAnnaulSalary(event) {

    (event < this.Label_AnnualSalary ? this.isminAmount = true : this.isminAmount = false)

    this.RevisionForm.controls['monthlyAmount'].setValue(Math.floor(this.RevisionForm.get('annualSalary').value / 12))
    event != null ? this.onFocus_OfferAccordion() : null;
  }

  onChangeMonthlySalary(event) {
    (event < this.Label_MonthlySalary ? this.isminAmount = true : this.isminAmount = false)

    this.RevisionForm.controls['annualSalary'].setValue(Math.floor(this.RevisionForm.get('monthlyAmount').value * 12))
    event != null ? this.onFocus_OfferAccordion() : null;
  }
  /* #endregion */

  /* #region  SALARY BREAKUP CALCULATION AND CLEAR OUT RATESET PRODUCTS LIST BASED ON MENTIONED DORPDOWN AND INPUT FIELDS  */
  onFocus_OfferAccordion() {
    //console.log(this.RevisionForm);
    return new Promise((resolve, reject) => {

      if (this.ELCModel.newELCobj.EmployeeRatesets != null &&
        this.ELCModel.newELCobj.EmployeeRatesets.length > 0 &&
        this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts != null &&
        this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.length > 0) {


        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true,
        })

        swalWithBootstrapButtons.fire({
          title: 'Confirmation!',
          text: "The change you made as an impact on the salary calculation hence please re-calculate the salary by clicking  'Preview New CTC' button ",
          type: 'warning',
          showCancelButton: false,
          confirmButtonText: 'Ok!',
          cancelButtonText: 'No, cancel!',
          allowOutsideClick: false,
          reverseButtons: true
        }).then((result) => {

          this.New_RateSetList = null;
          this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts = [];
        })

      }

    });

  }

  /* #endregion */

  /* #region IT SEEMS CALCULATE PERCENT OF TWO INPUTS (HIKE TYPE DROPDOWN)  */

  onChangeHiketype(event: any) {

    this.onChangePercentage(this.RevisionForm.get('hiketypeinput').value);
  }

  onChangePercentage(hiketypeinput: any) {

    let hikeType = this.RevisionForm.get('hiketype').value;
    let isMonthly = this.RevisionForm.get('forMonthlyValue').value;
    let annualSalary = (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0) ? this.Active_ELC_Obj.EmployeeRatesets[0].AnnualSalary : (this.ELCModel.oldELCobj != null && this.ELCModel.oldELCobj.EmployeeRatesets.length > 0) ? this.ELCModel.oldELCobj.EmployeeRatesets[0].AnnualSalary : this.jStr_ELC.EmployeeRatesets[0].AnnualSalary;
    let monthlySalary = (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0) ? this.Active_ELC_Obj.EmployeeRatesets[0].MonthlySalary : (this.ELCModel.oldELCobj != null && this.ELCModel.oldELCobj.EmployeeRatesets.length > 0) ? this.ELCModel.oldELCobj.EmployeeRatesets[0].MonthlySalary : this.jStr_ELC.EmployeeRatesets[0].MonthlySalary;
    var result = 0;
    let totalAmount = 0;
    let totalMonthlyAmt = 0;

    // if(isMonthly){ 

    //     result = hikeType == 1 ? ((hiketypeinput / 100) * monthlySalary).toFixed(0) : hiketypeinput;
    //     totalMonthlyAmt  = Math.floor(Number(result) + Number(monthlySalary));
    //     totalAmount = Math.floor(Number(totalAmount * 12));
    //     (totalAmount < this.Label_MonthlySalary ? this.isminAmount = true : this.isminAmount = false)

    //  }else {

    result = hikeType == 1 ? ((hiketypeinput / 100) * annualSalary).toFixed(0) : hiketypeinput;
    totalAmount = Math.floor(Number(result) + Number(annualSalary));
    totalMonthlyAmt = Math.floor(Number(totalAmount / 12));
    (totalAmount < this.Label_AnnualSalary ? this.isminAmount = true : this.isminAmount = false)

    //  }

    this.RevisionForm.controls['annualSalary'].setValue(totalAmount);
    this.RevisionForm.controls['monthlyAmount'].setValue(totalMonthlyAmt);
    this.onFocus_OfferAccordion();

  }
  /* #endregion */

  /* #region  UNDERSTAND THE DETAILS OF CURRENT SALARY BREAKUP WITH VARIOUS RATESET PRODUCTS*/

  Current_SalaryBreakup() {

    this.loadingScreenService.startLoading();

    this.Current_RateSetList = null;
    this.Current_RateSetList = (this.Active_ELC_Obj != undefined &&
      this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != null &&
      this.Active_ELC_Obj.EmployeeRatesets.length > 0 &&
      this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts != null &&
      this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts.length > 0 ?
      this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts : this.jStr_ELC.EmployeeRatesets[0].RatesetProducts);
    
    console.log('current salary', this.Current_RateSetList);
    if (this.Current_RateSetList == null || this.Current_RateSetList.length == 0) {
      this.alertService.showWarning("> There seems to be no data available to show");
      return;
    }

    this.loadingScreenService.stopLoading();
    $('#popup_salary_breakup').modal('show');

  }

  modal_dismiss_Current_SalaryBreakup() {

    $('#popup_salary_breakup').modal('hide');
  }

  /* #endregion */

  /* #region  UNDERSTAND THE DETAILS OF NEW SALARY BREAKUP WITH VARIOUS RATESET PRODUCTS  */

  New_ViewSalaryBreakup() {

    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ?
      this.ELCModel.newELCobj.EmployeeRatesets[0].AnnualSalary = this.RevisionForm.get('annualSalary').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ?
      this.ELCModel.newELCobj.EmployeeRatesets[0].MonthlySalary = this.RevisionForm.get('monthlyAmount').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ?
      this.ELCModel.newELCobj.EmployeeRatesets[0].SalaryBreakUpType = this.RevisionForm.get('salaryType').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ?
      this.ELCModel.newELCobj.EmployeeRatesets[0].PayGroupdId = this.RevisionForm.get('payGroup').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ?
      this.ELCModel.newELCobj.EmployeeRatesets[0].EffectiveDate = this.datePipe.transform(new Date(this.RevisionForm.get('effectiveDate').value).toString(), "yyyy-MM-dd") : null;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ?
      this.ELCModel.newELCobj.EmployeeRatesets[0].EffectivePeriodId = this.RevisionForm.get('effectivePeriod').value : null;

    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ?
      this.ELCModel.newELCobj.EmployeeRatesets[0].Modetype = UIMode.Edit : UIMode.None;

    this.ELCModel.newELCobj.LetterTemplateId = this.RevisionForm.get('revisionTemplate').value != null && this.RevisionForm.get('revisionTemplate').value != undefined ? this.RevisionForm.get('revisionTemplate').value : 0;
    this.ELCModel.newELCobj.Location = this.RevisionForm.get('location').value != null && this.RevisionForm.get('location').value != undefined ? this.RevisionForm.get('location').value : 0;
    this.ELCModel.newELCobj.IndustryId = this.RevisionForm.get('industryType').value != null && this.RevisionForm.get('industryType').value != undefined ? this.RevisionForm.get('industryType').value : 0;
    this.ELCModel.newELCobj.SkillCategory = this.RevisionForm.get('skillCategory').value != null && this.RevisionForm.get('skillCategory').value != undefined ? this.RevisionForm.get('skillCategory').value : 0;
    this.ELCModel.newELCobj.Zone = this.RevisionForm.get('zone').value != null && this.RevisionForm.get('zone').value != undefined ? this.RevisionForm.get('zone').value : 0;
    this.ELCModel.newELCobj.State = this.StateId;
    this.ELCModel.newELCobj.CityId = this.CityId;
    this.ELCModel.newELCobj.ELCTransactionTypeId = this.Idx;
    this.ELCModel.newELCobj.DOB = moment(this.newObj.DateOfBirth).format('YYYY-MM-DD').toString();

    // this.ELCModel.newELCobj.EndDate = new Date();
    this.ELCModel.newELCobj.EffectiveDate = this.datePipe.transform(new Date(this.RevisionForm.get('effectiveDate').value).toString(), "yyyy-MM-dd");
    this.ELCModel.newELCobj.EffectivePayPeriodId = this.RevisionForm.get('effectivePeriod').value;
    this.ELCModel.newELCobj.Designation = this.RevisionForm.get('designation').value;

    //Insurance
    this.ELCModel.newELCobj.InsuranceplanId = this.RevisionForm.get('insuranceplan').value != undefined && this.RevisionForm.get('insuranceplan').value != null ? this.RevisionForm.get('insuranceplan').value : 0;
    this.ELCModel.newELCobj.OnCostInsurance = this.RevisionForm.get('onCostInsuranceAmount').value;
    this.ELCModel.newELCobj.FixedInsuranceDeduction = this.RevisionForm.get('fixedDeductionAmount').value;

    // Check Previous Rate set and insert into paygroup product overides.
    if (this.ELCModel.newELCobj && (this.ELCModel.newELCobj.LstPayGroupProductOverrRides == null || this.ELCModel.newELCobj.LstPayGroupProductOverrRides == undefined)) {
      this.ELCModel.newELCobj.LstPayGroupProductOverrRides = [];
      if (this.Active_ELC_Obj !== undefined && this.Active_ELC_Obj !== null && this.companySettings !== undefined
        && this.companySettings !== null && this.companySettings.length > 0) {
        let companySetting = this.companySettings[0];
        let activeRatesets = this.Active_ELC_Obj.EmployeeRatesets;
        if (activeRatesets !== undefined && activeRatesets !== null && activeRatesets.length > 0) {
          let activeRateset = activeRatesets[0];
          let productCodes: string[] = JSON.parse(companySetting.SettingValue);
          console.log("Company settings product codes ::", productCodes);
          for (let productCode of productCodes) {
            let activeProduct: RatesetProduct = activeRateset.RatesetProducts.find(x => x.ProductCode.toLowerCase() ===
              productCode.toLowerCase());
  
            console.log("Active PayrollRule Product ::", activeProduct, productCode);
  
            if (activeProduct !== undefined && activeProduct !== null && activeProduct.ProductCTCPayrollRuleMappingId > 0) {
              let paygroupProductOverrides: PaygroupProductOverrides = new PaygroupProductOverrides();
              paygroupProductOverrides.ProductId = activeProduct.ProductId;
              paygroupProductOverrides.ProductCode = activeProduct.ProductCode;
              paygroupProductOverrides.ProductCTCPayrollRuleMappingId = activeProduct.ProductCTCPayrollRuleMappingId;
  
              this.ELCModel.newELCobj.LstPayGroupProductOverrRides.push(paygroupProductOverrides);
            }
          }
        }
      }
    }


    if (

      this.RevisionForm.controls['industryType'].valid &&
      this.RevisionForm.controls['location'].valid &&
      this.RevisionForm.controls['skillCategory'].valid &&
      this.RevisionForm.controls['zone'].valid &&
      this.RevisionForm.controls['salaryType'].valid &&
      this.RevisionForm.controls['annualSalary'].valid &&
      this.RevisionForm.controls['payGroup'].valid &&
      this.RevisionForm.get('annualSalary').value > 0 &&
      // this.RevisionForm.controls['effectiveDate'].valid &&
      this.RevisionForm.get('industryType').value > 0 &&
      this.RevisionForm.get('location').value > 0 &&
      this.RevisionForm.get('skillCategory').value > 0 &&
      this.RevisionForm.get('effectivePeriod').value > 0



    ) {

      // if (this.isminAmount) {

      //   this.alertService.showWarning("Minimum amount of annual salary must be equal or greater than " + this.Label_AnnualSalary)
      //   return;
      // }

      this.loadingScreenService.startLoading();


      if (this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 &&
        this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts != null &&
        this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.length > 0) {
        this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.forEach(element => {
          let lstProductGroup = [];
          console.log('lst', this.lstOfPaygroupOverrideProducts);
          if (this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0) {
            var isExistProduct = this.lstOfPaygroupOverrideProducts.find(a => a.ProductId == element.ProductId);
            if (isExistProduct != undefined) {
              lstProductGroup = (this.lstOfPaygroupOverrideProducts.filter(a => a.ProductId == element.ProductId))
              // console.log('lst', lstProductGroup);

              element['IsOverridableProductGroup'] = true;
              element['lstOfProducts'] = lstProductGroup;
              element['defaultValue'] = element.ProductCTCPayrollRuleMappingId != undefined && element.ProductCTCPayrollRuleMappingId != null &&
              element.ProductCTCPayrollRuleMappingId > 0 && lstProductGroup.find(x => x.ProductCTCPayrollRuleMappingId == element.ProductCTCPayrollRuleMappingId) != undefined ? lstProductGroup.find(x => x.ProductCTCPayrollRuleMappingId == element.ProductCTCPayrollRuleMappingId).Id : lstProductGroup.find(x => x.IsDefault == true).Id;
              // this.Label_PFLogic && this.Label_PFLogic != '' ? lstProductGroup.find(x => x.Description === this.Label_PFLogic).Id : '';
              const overrides = this.ELCModel.newELCobj.LstPayGroupProductOverrRides;
              if (overrides && overrides.length > 0) {
                const override = overrides.find(x => x.ProductId === element.ProductId);
                if (override && override.Id) {
                  element['defaultValue'] = override.Id;
                }
              }
            } else {
              element['IsOverridableProductGroup'] = false;
            }
          }
          else {
            element['IsOverridableProductGroup'] = false;
    
          }
        });
        this.New_RateSetList = this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts;
        if (this.isDailyOrHourlyWages) {
          this.ELCModel.newELCobj.EmployeeRatesets[0].WageType = this.wageType == 'Hourly' ? RateType.Hourly : RateType.Daily;
          this.setDefaultValuesForWageRateSetProducts();
        }
        this.loadingScreenService.stopLoading();
        console.log('new salary', this.New_RateSetList);
        $('#popup_new_salary_breakup').modal('show');
      }
      else {

        this.doCalculateCTC(this.ELCModel.newELCobj);

      }
    }
    else {

      this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
      return;
    }
  }

  _build_PaygroupOverride() {
    return new Promise((resolve, reject) => {
      var tempList = [];
      this.New_RateSetList.forEach(obj => {
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
      this.ELCModel.newELCobj.LstPayGroupProductOverrRides = tempList;
      resolve(tempList);
    });

  }

  modal_dismiss_New_SalaryBreakup() {

    if (this.IsRateSetValue == false) {

      this.alertService.showInfo("Hi there!, Changes you made may not be valid");
      return;
    }
    if (!this.isRecalculate) {
      this.alertService.showInfo("Some Breakup products will not be avaliable until you re-calculate it.");
      return;
    } else {

      this.New_RateSetList = null;
      $('#popup_new_salary_breakup').modal('hide');
    }

  }

  doCalculateCTC(obj): void {

    console.log("Calculating salary ::", this.ELCModel.newELCobj);
    //console.log("Calculating salary : ", JSON.stringify(obj));
    this.employeeService.new_CalculateSalaryBreakup(obj).subscribe((result) => {

      let apiResult: apiResult = result;
      try {
        if (apiResult.Status && apiResult.Result != null) {
          console.log('Breakup Result :', apiResult);

          let New_SalaryBreakup_ELC: EmployeeLifeCycleTransaction = apiResult.Result as any;
          // console.log('Employee rateset ::', New_SalaryBreakup_ELC);

          this.IsRateSetValue = New_SalaryBreakup_ELC.IsRateSetValid;
          this.isMinimumwageAdhered = New_SalaryBreakup_ELC.IsMinimumwageAdhere;
          this.ELCModel.newELCobj.IsMinimumwageAdhere = New_SalaryBreakup_ELC.IsMinimumwageAdhere;
          this.ELCModel.newELCobj.IsRateSetValid = New_SalaryBreakup_ELC.IsRateSetValid;
          this.ELCModel.newELCobj.CalculationRemarks = New_SalaryBreakup_ELC.CalculationRemarks;
          this.ELCModel.newELCobj.EmployeeRatesets = null;
          this.ELCModel.newELCobj.EmployeeRatesets = New_SalaryBreakup_ELC.EmployeeRatesets;
          this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.forEach(element => {
            let lstProductGroup = [];
            // console.log('lst', this.lstOfPaygroupOverrideProducts);
            if (this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0) {
              var isExistProduct = this.lstOfPaygroupOverrideProducts.find(a => a.ProductId == element.ProductId);
              if (isExistProduct != undefined) {
                lstProductGroup = (this.lstOfPaygroupOverrideProducts.filter(a => a.ProductId == element.ProductId))
                console.log('lst', lstProductGroup);
                
                element['IsOverridableProductGroup'] = true;
                element['lstOfProducts'] = lstProductGroup;
                element['defaultValue'] = element.ProductCTCPayrollRuleMappingId != undefined && element.ProductCTCPayrollRuleMappingId != null &&
                element.ProductCTCPayrollRuleMappingId > 0 && lstProductGroup.find(x => x.ProductCTCPayrollRuleMappingId == element.ProductCTCPayrollRuleMappingId) != undefined ? lstProductGroup.find(x => x.ProductCTCPayrollRuleMappingId == element.ProductCTCPayrollRuleMappingId).Id : lstProductGroup.find(x => x.IsDefault == true).Id;  
                // this.Label_PFLogic && this.Label_PFLogic != '' ? lstProductGroup.find(x => x.Description == this.Label_PFLogic).Id : '';
                const overrides = this.ELCModel.newELCobj.LstPayGroupProductOverrRides;
                if (overrides && overrides.length > 0) {
                  const override = overrides.find(x => x.ProductId === element.ProductId);
                  if (override && override.Id) {
                    element['defaultValue'] = override.Id;
                  }
                }
              } else {
                element['IsOverridableProductGroup'] = false;
              }
            }
            else {
              element['IsOverridableProductGroup'] = false;
      
            }
          });
          
          this.New_RateSetList = this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts;
          if (this.isDailyOrHourlyWages) {
            this.ELCModel.newELCobj.EmployeeRatesets[0].WageType = this.wageType == 'Hourly' ? RateType.Hourly : RateType.Daily;
            this.setDefaultValuesForWageRateSetProducts();
          }
          this.loadingScreenService.stopLoading();

          $('#popup_new_salary_breakup').modal('show');

        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message)
        }
      } catch (error) {

        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(error);
      }

    })
  }

  recalculateCTC(): void {

    this.loadingScreenService.startLoading();
    this.isRecalculate = true;
    // this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts = [];
    this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts = this.New_RateSetList;
    console.log(this.ELCModel);

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
      this.minimumWagesApplicableProductsList && this.minimumWagesApplicableProductsList.length > 0 ? this.RevisionForm.controls['minimumWagesApplicableProducts'].setValue(this.minimumWagesApplicableProductsList[0].Code)
      : this.RevisionForm.controls['minimumWagesApplicableProducts'].setValue(null);
    }

    // if(this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 && 
    //     this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0){
    //   let newBasicProduct =  this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.find(x => x.ProductCode == 'Basic');
    //   let oldBasicProduct = this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts.find(x => x.ProductCode == 'Basic');
    //   console.log(newBasicProduct,oldBasicProduct);
    //   if(newBasicProduct != null && oldBasicProduct != null) {
    //     if(newBasicProduct.Value < oldBasicProduct.Value){
    //       //this.ELCModel.newELCobj.CalculationRemarks = "Basic should not be less than previous basic; " + this.ELCModel.newELCobj.CalculationRemarks;
    //       this.alertService.showWarning("Basic should not be less than current basic; Current Basic : " + oldBasicProduct.Value.toString())
    //       this.IsRateSetValue = false;
    //       this.loadingScreenService.stopLoading();
    //       return ;
    //     }
    //   }

    //  }

    this._build_PaygroupOverride().then((res) => {
      console.log(' this.ELCModel.newELCobj.LstPayGroupProductOverrRides', this.ELCModel.newELCobj.LstPayGroupProductOverrRides);

      this.reviewCancelled = false;

      this.doCalculateCTC(this.ELCModel.newELCobj);

    });

  }

  onChangeAmount(event, item): void {

    this.New_RateSetList.forEach(element => {

      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.Value = Number(event);
      }


    });

    this.isRecalculate = false;

  }

  reviewLater() {
    this.reviewCancelled = true;
    this.alertService.confirmSwal("Confirmation?", "This will clear the current salary breakup, however you must calculate breakup before submitting this request.", "OK, Yes").then(result => {

      if (this.Idx != 3 && this.Idx != 7) {
        this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts = [];
      }
      this.ELCModel.newELCobj.LstPayGroupProductOverrRides = [];
      this.ELCModel.newELCobj.IsMinimumwageAdhere = true;
      this.ELCModel.newELCobj.IsRateSetValid = true;
      this.New_RateSetList = null;
      $('#popup_new_salary_breakup').modal('hide');

    })
      .catch(error => {
        this.modal_dismiss_New_SalaryBreakup();
      });
  }



  do_check_minimuwages_and_Save_Submit() {
    this.IsMinimumwagesAdhere = false;
    return new Promise((resolve, reject) => {

      if (this.ELCModel.newELCobj.IndustryId && this.ELCModel.newELCobj.State && this.ELCModel.newELCobj.Zone && this.ELCModel.newELCobj.EffectiveDate && this.ELCModel.newELCobj.SkillCategory) {

        this.employeeService.getMinumumwagesDetails(this.ELCModel.newELCobj).subscribe((response) => {

          console.log('Minimum wages :: ', response);
          let apiResult: apiResult = response;
          var JStr: apiResult = (apiResult.Result) as any;

          if (JStr.Status) {
            let minimumWageProductList: any;
            minimumWageProductList = JStr.Result
            console.log("Ratese", minimumWageProductList);

            // let OldRateSet = JStr.Result;
            let activeRatesetProducts: RatesetProduct[];
            //(this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0 && this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts != null && this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts.length > 0 ? this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts :
            activeRatesetProducts = (this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 && this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts != null && this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.length > 0) ? this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts : [];
            console.log("ActiveRateSet", activeRatesetProducts);
            if (activeRatesetProducts != null && activeRatesetProducts.length > 0) {

              minimumWageProductList.forEach(minWageProd => {
                let minimumWageProduct = activeRatesetProducts.find(x => x.ProductId == minWageProd.ProductId && Math.floor(x.Value) < Math.floor(minWageProd.ProductValue))
                if (minimumWageProduct != undefined && minimumWageProduct != null) {
                  console.log("Minimum wage Product Not adhered::", minimumWageProduct);
                  if (this.Idx != 3 && this.Idx != 7) {
                    this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts = [];
                  }
                  this.New_RateSetList = null;
                  this.IsMinimumwagesAdhere = false;
                  reject(false);

                }
              });

              // ActiveRateSet.forEach(element => {
              //   console.log(element.ProductId);
              //   if (NewRateSet != null && NewRateSet.length > 0 && (NewRateSet.find(z => z.ProductId == element.ProductId && ((z.ProductValue) < (element.Value))))) {
              //     this.loadingScreenService.stopLoading();
              //     this.alertService.showWarning("Oh ho! Minimumwages adhere. You must preview employee salary breakup before submitting!");
              //     return;
              //   }
              // });
              this.IsMinimumwagesAdhere = true;
            }

            resolve(true);
          } else {

            this.New_RateSetList = null;
            this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts = [];
            resolve(false);
          }


        });
      }


    });




  }

  PreviewLetter() {

    // this.do_check_minimuwagesList();


    if (this.ELCModel.newELCobj.Id == 0) {
      this.alertService.showInfo("Please save this form to preview the letter")
      return;

    }
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].AnnualSalary = this.RevisionForm.get('annualSalary').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].MonthlySalary = this.RevisionForm.get('monthlyAmount').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].SalaryBreakUpType = this.RevisionForm.get('salaryType').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].PayGroupdId = this.RevisionForm.get('payGroup').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].EffectiveDate = this.datePipe.transform(new Date(this.RevisionForm.get('effectiveDate').value).toString(), "yyyy-MM-dd") : null;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].EffectivePeriodId = this.RevisionForm.get('effectivePeriod').value : null;

    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].Modetype = UIMode.Edit : UIMode.None;
    this.ELCModel.newELCobj.LetterTemplateId = this.RevisionForm.get('revisionTemplate').value != null && this.RevisionForm.get('revisionTemplate').value != undefined ? this.RevisionForm.get('revisionTemplate').value : 0;

    this.ELCModel.newELCobj.Location = this.RevisionForm.get('location').value != null && this.RevisionForm.get('location').value != undefined ? this.RevisionForm.get('location').value : 0;
    this.ELCModel.newELCobj.IndustryId = this.RevisionForm.get('industryType').value != undefined && this.RevisionForm.get('industryType').value != null ? this.RevisionForm.get('industryType').value : 0;
    this.ELCModel.newELCobj.SkillCategory = this.RevisionForm.get('skillCategory').value != undefined && this.RevisionForm.get('skillCategory').value != null ? this.RevisionForm.get('skillCategory').value : 0;
    this.ELCModel.newELCobj.Zone = this.RevisionForm.get('zone').value != null && this.RevisionForm.get('zone').value != undefined ? this.RevisionForm.get('zone').value : 0;
    this.ELCModel.newELCobj.State = this.StateId;
    this.ELCModel.newELCobj.CityId = this.CityId;
    this.ELCModel.newELCobj.ELCTransactionTypeId = this.Idx;
    // this.ELCModel.newELCobj.EndDate = new Date();
    this.ELCModel.newELCobj.EffectiveDate = this.datePipe.transform(new Date(this.RevisionForm.get('effectiveDate').value).toString(), "yyyy-MM-dd");
    this.ELCModel.newELCobj.EffectivePayPeriodId = this.RevisionForm.get('effectivePeriod').value == null ? 0 : this.RevisionForm.get('effectivePeriod').value;
    this.ELCModel.newELCobj.Designation = this.RevisionForm.get('designation').value;
    this.ELCModel.newELCobj.ContractEndDate = moment(this.RevisionForm.get('contractEndDate').value, 'DD-MM-YYYY').format('YYYY-MM-DD');

    if (
      this.RevisionForm.controls['revisionTemplate'].valid &&
      this.RevisionForm.controls['designation'].valid &&
      this.RevisionForm.get('designation').value != "" &&
      this.RevisionForm.controls['effectiveDate'].valid &&
      this.RevisionForm.get('revisionTemplate').value > 0
    ) {




      if (this.Idx != 4 && this.Idx != 8 && this.Idx != 12 && (this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts == null || this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.length == 0)) {

        this.alertService.showWarning("Preview is not available. Please try again after sometime!");
        return;

      } else {

        this.loadingScreenService.startLoading();

        let jsValue = JSON.stringify(
          { "ClientContractId": this.ClientContractId, "EmployeeLifeCycleTransaction": this.ELCModel.newELCobj }
        )
        this.employeeService.post_PreviewLetter(jsValue).subscribe((response) => {

          let apiResult: apiResult = response;
          console.log(apiResponse);
          try {
            if (apiResult.Status) {


              this.loadingScreenService.stopLoading();
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


                }
              }
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);

            }
          }
          catch (Expection) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(Expection);
          }


        },
          ((err) => {
            this.loadingScreenService.stopLoading();

          }));
      }

    }
    else {
      this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
      return;
    }

  }

  /* #endregion */

  /* #region  RE BIND YOUR CHANGED REACTIVE FORMS VALUES (COMMON) */

  Re_Binding_ReactiveForms_Value() {

    console.log(this.ELCModel);

    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].AnnualSalary = this.RevisionForm.get('annualSalary').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].MonthlySalary = this.RevisionForm.get('monthlyAmount').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].SalaryBreakUpType = this.RevisionForm.get('salaryType').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].PayGroupdId = this.RevisionForm.get('payGroup').value : 0;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].EffectiveDate = this.datePipe.transform(new Date(this.RevisionForm.get('effectiveDate').value).toString(), "yyyy-MM-dd") : null;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].EffectivePeriodId = this.RevisionForm.get('effectivePeriod').value == null ? 0 : this.RevisionForm.get('effectivePeriod').value : null;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].IsMonthlyValue = this.RevisionForm.get('forMonthlyValue').value : false;

    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].Modetype = UIMode.Edit : UIMode.None;

    this.ELCModel.newELCobj.LetterTemplateId = this.RevisionForm.get('revisionTemplate').value != null && this.RevisionForm.get('revisionTemplate').value != undefined ? this.RevisionForm.get('revisionTemplate').value : 0;
    this.ELCModel.newELCobj.Location = this.RevisionForm.get('location').value != null && this.RevisionForm.get('location').value != undefined ? this.RevisionForm.get('location').value : 0;
    this.ELCModel.newELCobj.IndustryId = this.RevisionForm.get('industryType').value != null && this.RevisionForm.get('industryType').value != undefined ? this.RevisionForm.get('industryType').value : 0;
    this.ELCModel.newELCobj.SkillCategory = this.RevisionForm.get('skillCategory').value != null && this.RevisionForm.get('skillCategory').value != undefined ? this.RevisionForm.get('skillCategory').value : 0;
    this.ELCModel.newELCobj.EmploymentZone = this.RevisionForm.get('employmentZone').value != null && this.RevisionForm.get('employmentZone').value != undefined ? this.RevisionForm.get('employmentZone').value : 0;
    this.ELCModel.newELCobj.Zone = this.RevisionForm.get('zone').value != null && this.RevisionForm.get('zone').value != undefined ? this.RevisionForm.get('zone').value : 0;
    this.ELCModel.newELCobj.State = this.StateId;
    this.ELCModel.newELCobj.CityId = this.CityId;
    this.ELCModel.newELCobj.ELCTransactionTypeId = this.Idx;
    // this.ELCModel.newELCobj.EndDate = new Date();
    this.ELCModel.newELCobj.EffectiveDate = this.datePipe.transform(new Date(this.RevisionForm.get('effectiveDate').value).toString(), "yyyy-MM-dd");
    this.ELCModel.newELCobj.EffectivePayPeriodId = this.RevisionForm.get('effectivePeriod').value == null ? 0 : this.RevisionForm.get('effectivePeriod').value;
    this.ELCModel.newELCobj.Designation = this.RevisionForm.get('designation').value;
    this.ELCModel.newELCobj.LetterRemarks = this.RevisionForm.get('LetterRemarks').value;
    this.ELCModel.newELCobj.IsRateSetValid = this.IsRateSetValue;
    this.ELCModel.newELCobj.DocumentApprovalLst = this.clientApprovalTbl;
    this.ELCModel.newELCobj.ContractEndDate = (this.RevisionForm.get('contractEndDate').value !== undefined && this.RevisionForm.get('contractEndDate').value !== null) ? moment(this.RevisionForm.get('contractEndDate').value, 'DD-MM-YYYY').format('YYYY-MM-DD') : null;

    console.log("saved contract end date", this.ELCModel.newELCobj.ContractEndDate, this.RevisionForm.get('contractEndDate').value, moment(this.RevisionForm.get('contractEndDate').value, 'DD-MM-YYYY').format('YYYY-MM-DD'))

    //Insurance
    this.ELCModel.newELCobj.InsuranceplanId = this.RevisionForm.get('insuranceplan').value !== undefined && this.RevisionForm.get('insuranceplan').value !== null ? this.RevisionForm.get('insuranceplan').value : 0;
    this.ELCModel.newELCobj.OnCostInsurance = this.RevisionForm.get('onCostInsuranceAmount').value;
    this.ELCModel.newELCobj.FixedInsuranceDeduction = this.RevisionForm.get('fixedDeductionAmount').value;


    this.ELCModel.newELCobj.Level = this.RevisionForm.get('level').value;
    this.ELCModel.newELCobj.ReportingLocation = this.RevisionForm.get('campus').value;
    this.ELCModel.newELCobj.CityId = this.RevisionForm.get('city').value;
    this.ELCModel.newELCobj.CostCityCenter = this.RevisionForm.get('costCityCenter').value;
    this.ELCModel.newELCobj.ManagerId = this.RevisionForm.get('reportingManager').value;
    this.ELCModel.newELCobj.Division = this.RevisionForm.get('division').value;
    this.ELCModel.newELCobj.DepartmentId = this.RevisionForm.get('department').value;
    this.ELCModel.newELCobj.Category = this.RevisionForm.get('type').value;
    this.ELCModel.newELCobj.JobProfileId = this.RevisionForm.get('jobRole').value;
    this.ELCModel.newELCobj.SubEmploymentType = this.RevisionForm.get('subEmploymentType').value;
    this.ELCModel.newELCobj.Gender = this.jStr_ELC.Gender;

    let DesignationId: number;
    let OldDesignationId: number;
    let Department_string: string;

    if (this.ELCModel.newELCobj.Designation) {
      let objFound = _.find(this.DesignationList, { Code: this.ELCModel.newELCobj.Designation })
      DesignationId =  objFound && objFound.Id ? objFound.Id : null;
    }

    if (this.jStr_ELC.OldDesignation) {
      let objFound = _.find(this.DesignationList, { Code: this.jStr_ELC.OldDesignation })
      OldDesignationId =  objFound && objFound.Id ? objFound.Id : null;
    }

    if (this.jStr_ELC.DepartmentId) {
      let objFound = _.find(this.OfferInfoListGrp.LstEmployeeDepartment, { Id: this.jStr_ELC.DepartmentId })
      Department_string =  objFound && objFound.Name ? objFound.Name : null;
    }

    this.ELCModel.newELCobj.DesignationId = DesignationId;
    this.ELCModel.newELCobj.OldDesignationId = OldDesignationId;
    this.ELCModel.newELCobj.Department = Department_string;


    // this.ELCModel.newELCobj.ContractEndDate = this.datePipe.transform(new Date(this.RevisionForm.get('contractEndDate').value).toString(), "yyyy-MM-dd");

    // this.ELCModel.newELCobj.JobTitle = "Testing";
    // this.ELCModel.newELCobj.CalculationRemarks = "Test DEMO";
  }

  /* #endregion */

  /* #region  CLICK ON SUBMIT OR SAVE ACTION BUTTON - DATA WILL BE SAVED IN DB WITH VALIDATION AND REQUIRED DATA'S */

  public findInvalidControls() {
    const invalid = [];
    const controls = this.RevisionForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log('INVALID FORMS FIELDS', invalid);
    return invalid;
  }



  async doSaveOrSubmit(index: string) {

    this.IsMinimumwagesAdhere = false;
    const value = await this.Re_Binding_ReactiveForms_Value();
    console.log(`async result: ${value}`);

    /// VALIDATION HAPPEND ONLY ON SUBMIT CLICK
    if (index == "Submit") {
      this.submitted = true;
      this.findInvalidControls();

      if (this.RevisionForm.invalid) {
        this.alertService.showWarning("Oops! Please fill in all required fields ")
        return;

      }
    }

    // IF ANNUAL OR MONTHLY SALARY AMOUNT SHOULD BE LESS THAN ACTIVE SALARY OR OLD OBJECT SALARY - ALERT WILL BE SHOWN
    // if (this.isminAmount) {
    //   this.alertService.showWarning("Minimum amount of annual salary must be equal or greater than " + this.Label_AnnualSalary)
    //   return;
    // }

    //Validate Minimum wage and Rateset
    if (this.SalaryRevision && index == "Submit") {     // Todo : change Idx value here
      // this.loadingScreenService.startLoading();

      console.log("ELCModel :: ", this.ELCModel);

      if (index == "Submit" && this.SalaryRevision && this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 && this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.length == 0) {
        this.alertService.showInfo("Oh ho! You must preview employee salary breakup before submitting!");
        return;
      }

      if (!this.IsRateSetValue) {
        this.alertService.showInfo("Oh ho! salary breakup not valid please click on preview new ctc before submitting!");
        return;
      }

      if (!this.isMinimumwageAdhered) {
        if (this.clientApprovalTbl !== undefined && this.clientApprovalTbl !== null && this.clientApprovalTbl.length > 0) {
          let minimumWageClientApproval = this.clientApprovalTbl.find(x => x.DocumentApprovalFor === DocumentApprovalFor.MinimumWagesNonAdherence);
          if (minimumWageClientApproval === undefined || minimumWageClientApproval === null) {
            this.alertService.showWarning("Minimum wage not adhered! Please attach a Minimum wage non - adherance proof.");
            return;
          }
        }
        else {
          this.alertService.showWarning("Minimum wage not adhered! Please attach a Minimum wage non - adherance proof.");
          return;
        }
      }







    }


    // CONFIMATION ACTION - OK OR CANCEL THE SAVE OR SUBMIT ACTION
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

        try {

          // SalaryRevision = 2,
          //   ReLocation = 3,
          //   ReDesignation = 4,
          //   SalaryRevision_ReLocation = 5,
          //   SalaryRevision_ReDesignation = 6,
          //   ReLocation_ReDesignation = 7,
          //   SalaryRevision_ReLocation_ReDesignation = 9

          // this.Idx != 4 && this.Idx != 8 && this.Idx != 12
          // if (this.SalaryRevision && index == "Submit") {     // Todo : change Idx value here
          //   // this.loadingScreenService.startLoading();

          //   console.log("ELCModel :: ",this.ELCModel);



          // //   if(this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 && 
          // //     this.Active_ELC_Obj.EmployeeRatesets != null && this.Active_ELC_Obj.EmployeeRatesets.length > 0){
          // //   let newBasicProduct =  this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.find(x => x.ProductCode == 'Basic');
          // //   let oldBasicProduct = this.Active_ELC_Obj.EmployeeRatesets[0].RatesetProducts.find(x => x.ProductCode == 'Basic');
          // //   console.log(newBasicProduct,oldBasicProduct);
          // //   if(newBasicProduct != null && oldBasicProduct != null) {
          // //     if(newBasicProduct.Value < oldBasicProduct.Value){
          // //       this.alertService.showWarning("Basic should not be less than previous basic");
          // //       this.loadingScreenService.stopLoading();
          // //       return ;
          // //     }
          // //   }
          // //  }


          //   // BEFORE WE SAVE OR SUBMIT WHTHERE THE DETAILS ARE MATCHED WITH DATA (MINIMUM WAGES)
          //   // this.do_check_minimuwages_and_Save_Submit().then((result) => {
          //   //   // this.loadingScreenService.stopLoading();

          //   //   console.log('RESULT OF MINIMUMWAGES FLAG RESPONSE  ::', result);
          //   //   if (result == true) {

          //   //     this.loadingScreenService.startLoading();
          //   //     this.validate_and_save(index);
          //   //   } else {

          //   //     // IF YOU NOT DOING NEW CTC BREAKUP OR MINIMUMWAGES ADHERE - WARNING ALERT FOR USER
          //   //     this.alertService.showWarning("Oh ho! Minimumwages details not found! Please contact your support admin for help.");
          //   //     this.loadingScreenService.stopLoading();
          //   //     return;
          //   //   }

          //   // })
          //   //   .catch(error => {
          //   //     this.loadingScreenService.stopLoading(),
          //   //     console.error(error);
          //   //       this.alertService.showWarning("Oh ho! Minimumwages not adhere. You must preview employee salary breakup before submitting!");
          //   //     return;
          //   //   }
          //   //   );

          //   if(!this.isMinimumwageAdhered){
          //     if(this.clientApprovalTbl !== undefined && this.clientApprovalTbl !== null && this.clientApprovalTbl.length > 0){
          //       let minimumWageClientApproval  = this.clientApprovalTbl.find(x => x.DocumentApprovalFor === DocumentApprovalFor.MinimumWagesNonAdherence);
          //       if(minimumWageClientApproval === undefined || minimumWageClientApproval === null){
          //         this.alertService.showWarning("Minimum wage not adhered! Please attach a Minimum wage non - adherance proof.");
          //         return;
          //       }
          //     }
          //     else{
          //       this.alertService.showWarning("Minimum wage not adhered! Please attach a Minimum wage non - adherance proof.");
          //       return;
          //     }
          //   }

          //   if(!this.IsRateSetValue){
          //     this.alertService.showInfo("Oh ho! You must preview employee salary breakup before submitting!");
          //     return;
          //   }

          // } else {
          //   this.loadingScreenService.startLoading();
          //   this.validate_and_save(index);
          // }
          // console.log('rsul', i);


          this.loadingScreenService.startLoading();
          this.validate_and_save(index);

        } catch (error) {

          { this.alertService.showWarning(error + " Failed!   Employee save wasn't completed"), this.loadingScreenService.stopLoading() };

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


  // ONCE THE VALIDATIONS ARE DONE PROCEED WITH HTTP PUT ACTION 
  validate_and_save(index) {


    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].IsLatest = index == "Submit" ? true : false : true;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].Modetype = UIMode.Edit : UIMode.None;

    console.log('ELC MODEL BEFORE SAVE FIRST:: ', this.ELCModel);
    console.log("IsMinimumAdhere", this.IsMinimumwagesAdhere);
    // if (!this.IsMinimumwagesAdhere && (this.Idx != 3 && this.Idx != 7 && this.Idx != 8) ) {
    //   if (index == "Submit" && (this.Idx != 4 && this.Idx != 12) && this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 && this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.length == 0) {
    //     this.loadingScreenService.stopLoading();
    //     this.alertService.showWarning("Oh ho! You must preview employee salary breakup before submitting!");
    //     return;
    //   }
    // }
    // else {
    // if (!this.IsMinimumwagesAdhere && (this.Idx == 3 || this.Idx == 7)) {

    //this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 && this.ELCModel.newELCobj.EmployeeRatesets[0].Id == 0 ? this.ELCModel.newELCobj.EmployeeRatesets = [] : this.ELCModel.newELCobj.EmployeeRatesets[0].Modetype = UIMode.Delete;
    // }
    // }
    // if (this.Idx == 4 && this.ELCModel.newELCobj.EmployeeRatesets.length > 0) {
    //   this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 && this.ELCModel.newELCobj.EmployeeRatesets[0].Id == 0 ? this.ELCModel.newELCobj.EmployeeRatesets = [] : this.ELCModel.newELCobj.EmployeeRatesets[0].Modetype = UIMode.Delete;
    // }
    // this.Idx == 4 &&

    // console.log("Checking Company Settings for OLD Product Ruel Id" , this.companySettings);
    // if(this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 
    //   && this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts != null && 
    //   this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts.length > 0) {
    //     if(this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null && this.companySettings != undefined 
    //       && this.companySettings != null && this.companySettings.length > 0){
    //       let companySetting = this.companySettings[0];
    //       let activeRatesets = this.Active_ELC_Obj.EmployeeRatesets;
    //       if(activeRatesets != undefined && activeRatesets != null && activeRatesets.length > 0){
    //         let activeRateset = activeRatesets[0];
    //         let productCodes : String[] = JSON.parse(JSON.stringify(companySetting.SettingValue ));
    //         for(let productCode of productCodes){
    //           let activeProduct : RatesetProduct = activeRateset.RatesetProducts.find(x => x.ProductCode == productCode);
    //           if (activeProduct != null && activeProduct.RuleId > 0){
    //             let newProduct : RatesetProduct = this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts
    //               .find(x => x.ProductId == activeProduct.ProductId);

    //               if (newProduct != null)
    //               {
    //                 newProduct.RuleId = activeProduct.RuleId;
    //                 newProduct.ProductCTCPayrollRuleMappingId = activeProduct.ProductCTCPayrollRuleMappingId;
    //                 // newProduct.Value = activeProduct.Value;
    //               }
    //           }
    //         }
    //       }


    //     }
    // } 

    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].Status = EmployeeStatus.Active : null;
    this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this.ELCModel.newELCobj.EmployeeRatesets[0].Id = 0 : null;
    this.ELCModel.newELCobj.CCMailIds = _.union(this.ccmailtags).join(",");
    this.ELCModel.newELCobj.SendMailImmediately = this.RevisionForm.get('sendmailimmediately').value;
    this.ELCModel.newELCobj.ELCTransactionTypeId = this.Idx;
    this.ELCModel.newELCobj.Status = this.ELCTransaction.Status == ELCStatus.Rejected ? ELCStatus.Rejected : ELCStatus.Saved; // ! Changed
    this.ELCModel.newELCobj.IsLatest = false;
    this.ELCModel.newELCobj.QcRemarks = "";
    this.ELCModel.newELCobj.Modetype = UIMode.Edit;
    this.ELCModel.OldRateSetId = this._OldRateSetId == null ? 0 : this._OldRateSetId;
    this.ELCModel.OldELCId = this._OldELCTransactionId == null ? 0 : this._OldELCTransactionId;
    this.ELCModel.newELCobj.EmploymentContractId = this.EmploymentContractId;
    this.ELCModel.newELCobj.DocumentApprovalLst = this.clientApprovalTbl;
    this.ELCModel.newELCobj.DocumentApprovalIds = this.DocumentApprovalIds;
   
    this.ELCModel.OldRateSetId = this.ELCModel.newELCobj.EmployeeRatesets != null && this.ELCModel.newELCobj.EmployeeRatesets.length > 0 ? this._OldRateSetId : 0;
    // this.loadingScreenService.stopLoading();

    delete this.ELCModel.newELCobj.DOB;
    this.elcModify(this.ELCModel);
    this.ELCModel.newELCobj = this.removeNullValues(this.ELCModel.newELCobj);
    this.ELCModel.oldELCobj = this.removeNullValues(this.ELCModel.oldELCobj);
    console.log('ELC MODEL BEFORE SAVE :: ', this.ELCModel);
    this.employeeService.put_ELCTransaction(this.ELCModel).subscribe((response) => {

      let apiResult: apiResult = response;
      var _NewELCTransaction: EmployeeLifeCycleTransaction = apiResult.Result as any;
      console.log('NEW ELC OBJECT FROM API RESPONSE ::', _NewELCTransaction);

      console.log(apiResponse);
      try {
        if (apiResult.Status) {

          // IF THE USER CLICK ON SUBMIT WE RR CALL THE WORKFLOW ACTION
          if (index == "Submit") {

            let jsonDependentObj = JSON.stringify(

              { "ClientContractId": this.ClientContractId, "EmployeeLifeCycleTransaction": _NewELCTransaction }
            )

            this.workFlowInitiation.Remarks = "";
            this.workFlowInitiation.EntityId = _NewELCTransaction.EmployeeId;
            this.workFlowInitiation.EntityType = EntityType.Employee;
            this.workFlowInitiation.CompanyId = this.CompanyId;
            this.workFlowInitiation.ClientContractId = _NewELCTransaction.ClientContractId;
            this.workFlowInitiation.ClientId = _NewELCTransaction.ClientId;

            this.workFlowInitiation.ActionProcessingStatus = 15000;
            this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
            // this.workFlowInitiation.WorkFlowAction = this.ELCTransaction.Status == ELCStatus.Rejected? 16 : 14;
            this.workFlowInitiation.WorkFlowAction = 14;
            this.workFlowInitiation.RoleId = this.RoleId;
            this.workFlowInitiation.DependentObject = { "ClientContractId": this.ClientContractId, "EmployeeLifeCycleTransaction": _NewELCTransaction };
            this.workFlowInitiation.UserInterfaceControlLst = {
              AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
                : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
              ViewValue: null
            };

            this.finalSubmit(this.workFlowInitiation);
          }
          else {
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            this.ELCModel.newELCobj.Id = _NewELCTransaction.Id;

            //Copy lastest of document approval Ids
            if (_NewELCTransaction.DocumentApprovalIds !== undefined && _NewELCTransaction.DocumentApprovalIds !== null) {
              this.DocumentApprovalIds = _.cloneDeep(_NewELCTransaction.DocumentApprovalIds);
            }

            //Copy lastest of document approval list
            if (_NewELCTransaction.DocumentApprovalLst !== undefined && _NewELCTransaction.DocumentApprovalLst !== null) {
              this.clientApprovalTbl = _.cloneDeep(_NewELCTransaction.DocumentApprovalLst);

              // update the status from document approval ids : this is done because we do soft delete 
              for (let i = 0; i < this.clientApprovalTbl.length; ++i) {
                this.clientApprovalTbl[i].Idx = i + 1;
                let documentApprovalId = this.DocumentApprovalIds.find(x => x.DocumentApprovalId === this.clientApprovalTbl[i].Id)
                this.clientApprovalTbl[i].Status = documentApprovalId !== undefined && documentApprovalId !== null ?
                  documentApprovalId.Status : this.clientApprovalTbl[i].Status;
                this.clientApprovalTbl[i].UIStatus = this.clientApprovalTbl[i].Status;
              }
            }
            // this.router.navigate(['/app/onboardingqc/employeeLifecycleList']);
          }
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);

        }
      }
      catch (Expection) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(Expection);
      }


    },
      ((err) => {
        this.loadingScreenService.stopLoading();

      }));
  }

  // WORKFLOW INITIATION 
  finalSubmit(workFlowJsonObj: WorkFlowInitiation): void {

    console.log(workFlowJsonObj);
    this.employeeService.post_ELCWorkFlow(JSON.stringify(workFlowJsonObj)).subscribe((response) => {

      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {

          this.loadingScreenService.stopLoading();
          this.router.navigate(['/app/elc/employeeLifecycleList']);
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
  /* #endregion */

  /* #region  CANCEL THE ELC TRANSACTION   */

  async cancel_transaction() {

    this.alertService.confirmSwal("Are you sure?", "Are you sure you want to Cancel this Transaction?", "Yes, Cancel").then(result => {

      this.loadingScreenService.startLoading();
      console.log('ELC Model List :: ', this.ELCModel);
      this.ELCModel.newELCobj.Status = ELCStatus.Voided;
      this.ELCModel.newELCobj.Modetype = UIMode.Edit;
      this.ELCModel.newELCobj.IsLatest = false;
      this.employeeService.put_ELCTransaction(this.ELCModel).subscribe((response) => {

        let apiResult: apiResult = response;
        console.log(apiResponse);
        try {
          if (apiResult.Status) {

            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            this.router.navigate(['/app/elc/employeeLifecycleList']);
          }
          else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);

          }
        }
        catch (Expection) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(Expection);
        }


      },
        ((err) => {
          this.loadingScreenService.stopLoading();

        }));

    })
      .catch(error => this.loadingScreenService.stopLoading());

  }
  /* #endregion */

  onClickingClientApprovalButton() {
    if (this.clientApprovalTbl === undefined || this.clientApprovalTbl === null) {
      this.clientApprovalTbl = [];
    }

    $('#popup_client_approval').modal('show');

  }

  editApprovalFile(item, indx) {

    console.log(item);


    // this.addAttachment(item);

    $('#popup_client_approval').modal('hide');
    let employeeDetails = {
      CompanyId: this.EmploymentContract.CompanyId,
      ClientId: this.EmploymentContract.ClientId,
      ClientContractId: this.EmploymentContract.ClientContractId,
      CandidateId: this.newObj.CandidateId !== undefined && this.newObj.CandidateId !== null ? this.newObj.CandidateId : 0,
      ELCIds: [this.jStr_ELC.Id],
      EmployeeId: this.EmployeeId
    }

    const modalRef = this.modalService.open(ElcApprovalModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.employeeDetails = employeeDetails;
    modalRef.componentInstance.LstClientApproval = this.clientApprovalTbl;
    modalRef.componentInstance.clientApprovalObj = item;
    modalRef.result.then((result) => {
      console.log("Approval Obj ::", result);

      if (result.Idx === 0) {
        result.Idx = this.clientApprovalTbl.length + 1;
        this.clientApprovalTbl.push(result);
      }
      else {
        this.clientApprovalTbl = this.clientApprovalTbl.map(obj => obj.Idx === result.Idx ? result : obj);
      }

      console.log("clientApprovalTbl", this.clientApprovalTbl);

      $('#popup_client_approval').modal('show');

    });

  }

  addAttachment() {


    $('#popup_client_approval').modal('hide');
    let employeeDetails = {
      CompanyId: this.EmploymentContract.CompanyId,
      ClientId: this.EmploymentContract.ClientId,
      ClientContractId: this.EmploymentContract.ClientContractId,
      CandidateId: this.newObj.CandidateId !== undefined && this.newObj.CandidateId !== null ? this.newObj.CandidateId : 0,
      ELCIds: [this.jStr_ELC.Id],
      EmployeeId: this.EmployeeId
    }

    const modalRef = this.modalService.open(ElcApprovalModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.employeeDetails = employeeDetails;
    modalRef.result.then((result) => {
      console.log("Approval Obj ::", result);

      if (result.Idx === 0) {
        result.Idx = this.clientApprovalTbl.length + 1;
        this.clientApprovalTbl.push(result);
      }
      else {
        this.clientApprovalTbl.map(obj => obj.Idx === result.Idx ? result : obj);
      }

      $('#popup_client_approval').modal('show');


    });
    // modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    // modalRef.componentInstance.RequestType = this.candidatesForm.get('requestFor').value == "OL" ? RequestType.OL : RequestType.AL;
    // var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId });
    // modalRef.componentInstance.objStorageJson = objStorageJson;
    // modalRef.componentInstance.LstClientApproval = this.clientApprovalTbl;
    // modalRef.componentInstance.ClientLocationList = this.ClientLocationList;
  }

  deleteApprovalFile(item) {
    // Check if the passed Approval can be deleted.
    // An approval can only be deleted if it doesnot containt refrence to any other elc. 
    let refrenceObject: number[] = item.RefrenceObject != undefined && item.RefrenceObject != null ?
      JSON.parse(item.RefrenceObject) : []

    console.log("Approval obj ::", item);
    console.log("refrenceObject", refrenceObject);

    if (refrenceObject.length > 1) {   //Not Allowed to delete
      refrenceObject.splice(refrenceObject.indexOf(this.jStr_ELC.Id), 1);
      item.RefrenceObject = JSON.stringify(refrenceObject);
      item.ModeType = UIMode.Edit;
      item.UIStatus = DocumentApprovalStatus.Deleted;

      let documentApprovalId = this.DocumentApprovalIds.find(x => x.DocumentApprovalId === item.Id);
      if (documentApprovalId !== undefined && documentApprovalId !== null) {
        documentApprovalId.Status = DocumentApprovalStatus.Deleted;
      }

    }
    else { //Allowed to delete
      if (item.Id === 0) {
        if (item.ObjectStorageId > 0) {
          this.loadingScreenService.startLoading();
          this.fileuploadService.deleteObjectStorage(item.ObjectStorageId).subscribe((res) => {
            console.log(res);
            let apiResult = (res);
            try {
              if (apiResult.Status) {
                //Remove from table.
                this.clientApprovalTbl.splice(this.clientApprovalTbl.findIndex(x => x.id === item.id), 1);
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess("Your file is deleted successfully!")
              } else {
                this.loadingScreenService.stopLoading();

                this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
              }
            } catch (error) {
              this.loadingScreenService.stopLoading();

              this.alertService.showWarning("An error occurred while trying to delete! " + error)
            }

          }), ((err) => {

          })
        }
        else {
          this.clientApprovalTbl.splice(this.clientApprovalTbl.findIndex(x => x.id === item.id), 1);
        }
      }
      else {

        refrenceObject = [];

        // if( item.ObjectStorageId > 0){
        //   this.loadingScreenService.startLoading();
        //   this.fileuploadService.deleteObjectStorage(item.ObjectStorageId).subscribe((res) => {
        //     console.log(res);
        //     let apiResult  = (res);
        //     try {
        //       if (apiResult.Status) {

        //         //Soft Delete
        //         let documentApprovalId = this.DocumentApprovalIds.find(x => x.DocumentApprovalId === item.Id);
        //         if(documentApprovalId !== undefined && documentApprovalId !== null){
        //           documentApprovalId.Status = DocumentApprovalStatus.Deleted;
        //         }
        //         item.ObjectStorageId = 0;
        //         item.RefrenceObject = JSON.stringify(refrenceObject);
        //         item.ModeType = UIMode.Edit;
        //         item.UIStatus = DocumentApprovalStatus.Deleted;

        //         this.loadingScreenService.stopLoading();
        //         this.alertService.showSuccess("Your file is deleted successfully!")
        //       } else {
        //         this.loadingScreenService.stopLoading();

        //         this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
        //       }
        //     } catch (error) {
        //       this.loadingScreenService.stopLoading();

        //       this.alertService.showWarning("An error occurred while trying to delete! " + error)
        //     }

        //   }), ((err) => {

        //   })
        // }
        // else{
        //Soft Delete
        let documentApprovalId = this.DocumentApprovalIds.find(x => x.DocumentApprovalId === item.Id);
        if (documentApprovalId !== undefined && documentApprovalId !== null) {
          documentApprovalId.Status = DocumentApprovalStatus.Deleted;
        }
        item.ObjectStorageId = 0;
        item.RefrenceObject = JSON.stringify(refrenceObject);
        item.ModeType = UIMode.Edit;
        item.UIStatus = DocumentApprovalStatus.Deleted;

        this.alertService.showSuccess("Your file is deleted successfully!")
        // }


        console.log("DocumentApprovalIds", this.DocumentApprovalIds);
      }
    }

    console.log("Approval Tbl ::", this.clientApprovalTbl);
  }

  deleteAsync(objectStorageId: number) {


    // this.isLoading = true;
    // this.spinnerText = "Deleting";

    this.loadingScreenService.startLoading();
    this.fileuploadService.deleteObjectStorage(objectStorageId).subscribe((res) => {
      console.log(res);
      let apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          // var index = this.unsavedDocumentLst.map(function (el) {
          //   return el.Id
          // }).indexOf(this.approvalForm.get('ObjectStorageId').value)

          // Delete  the item by index.
          // this.unsavedDocumentLst.splice(index, 1)
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess("Your file is deleted successfully!")
        } else {
          this.loadingScreenService.stopLoading();

          this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
        }
      } catch (error) {
        this.loadingScreenService.stopLoading();

        this.alertService.showWarning("An error occurred while trying to delete! " + error)
      }

    }), ((err) => {

    })

  }

  modal_dismiss_client_approval() {
    $('#popup_client_approval').modal('hide');

  }

  onChangeInsurancePlan(item) {
    console.log('item', item);

    if (item !== undefined && item !== null) {
      this.RevisionForm.controls['onCostInsuranceAmount'] !== null ? this.RevisionForm.controls['onCostInsuranceAmount'].setValue(item.InsuranceAmount) : null;
      this.RevisionForm.controls['fixedDeductionAmount'] !== null ? this.RevisionForm.controls['fixedDeductionAmount'].setValue(item.InsuranceDeductionAmount) : null;

    }
    else {
      this.RevisionForm.controls['onCostInsuranceAmount'] !== null ? this.RevisionForm.controls['onCostInsuranceAmount'].setValue(0) : null;
      this.RevisionForm.controls['fixedDeductionAmount'] !== null ? this.RevisionForm.controls['fixedDeductionAmount'].setValue(0) : null;

    }
    // this.RevisionForm.controls['Gmc'] != null ? this.RevisionForm.controls['Gmc'].setValue(item.GMC) : null;
    // this.RevisionForm.controls['Gpa'] != null ? this.RevisionForm.controls['Gpa'].setValue(item.GPA) : null;
    this.onFocus_OfferAccordion()

  }

  /* #region  CC EMAIL ADDRESS BOOK INPUTS METHOD */
  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent): void {
    this.CCemailMismatch = false;
    const inputValue: string = this.RevisionForm.controls.emailList.value;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addTag(inputValue);
        this.RevisionForm.controls.emailList.setValue('');
      }
    }
  }

  addTag(tag: any): void {
    console.log((tag));


    if (tag) {
      const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
      if (matches) {
        this.CCemailMismatch = false;
        if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
          tag = tag.slice(0, -1);
        }
        if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
          this.ccmailtags.push(tag);
        }
      } else {
        this.CCemailMismatch = true;
      }
      // return matches ? null : { 'invalidEmail': true };
    } else {

      return null;
    }


  }

  removeTag(tag?: string): void {
    if (!!tag) {
      pull(this.ccmailtags, tag); // lodash 
    } else {
      this.ccmailtags.splice(-1);
    }
  }


  onchangeCC(event) {

    let tag = event.target.value;
    const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    if (matches) {
      this.CCemailMismatch = false;
      if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
        tag = tag.slice(0, -1);
      }
      if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
        this.ccmailtags.push(tag);
        event.target.value = null;
      }
    } else {
      this.CCemailMismatch = true;
    }
  }


  /* #endregion */

  /* #region  //TODO: TO UPDATE FORMGROUP VALIDATION COMMON METHOD  */

  updateValidation(value, control: AbstractControl) {

    // console.log("Update validation ::" , value , control);

    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  /* #endregion */

  onChangePayRateAmount(event, item): void {
    console.log(event);
    this.New_RateSetList.forEach(element => {
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
    this.New_RateSetList.forEach(element => {
      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.BillingType = this.wageType == 'Hourly' ? PaymentType.Hourly : PaymentType.Daily;
        element.BillableRate = Number(event);
      }
    });
    this.isRecalculate = false;
  }

  showApplicableProductsFn() {
    console.log('Applicable Products Drawer');
    const drawerRef = this.drawerService.create<AdditionalApplicableProductsComponent, { data: any}, string>({
      nzTitle: 'APPLICABLE PRODUCTS',
      nzContent: AdditionalApplicableProductsComponent,
      nzWidth: 950,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        data: this.additionalApplicableProducts
      }
    });
    drawerRef.afterOpen.subscribe(() => {
      console.log('Applicable Products Drawer Opened');

    });
    drawerRef.afterClose.subscribe((data?: any) => {
      console.log('Applicable Products Drawer Closed', data);
      if(data) {
        this.additionalApplicableProducts = data;
      }
    });
  }

  applyFilter(showZeroValues: boolean) {
    if(!showZeroValues) {
      this.New_RateSetList = this.New_RateSetList.filter(a => a.Value !== 0);
    } 
    else {
      this.New_RateSetList = this.ELCModel.newELCobj.EmployeeRatesets[0].RatesetProducts;
    }
  }

  onWageTypeChangeFn(e): void {
    if (this.isDailyOrHourlyWages) {
      this.setDefaultValuesForWageRateSetProducts();
    }
  }

  setDefaultValuesForWageRateSetProducts() {
    for (const el of this.New_RateSetList) {
      const value = el.Value;
      if (value > 0) {
        const defaultDailyRate: any = (value / this.baseDaysForAddlApplicableProduct).toFixed(2);
        const defaultHourlyRate: any = (defaultDailyRate / this.baseHoursForAddlApplicableProduct).toFixed(2);
        el.Modetype = el.IsOveridable ? UIMode.Edit : el.Modetype;
        el.PaymentType = this.wageType == 'Hourly' ? PaymentType.Hourly : PaymentType.Daily;
        el.PayableRate = this.wageType == 'Hourly' ? defaultHourlyRate : defaultDailyRate;
        el.BillingType = this.wageType == 'Hourly' ? PaymentType.Hourly : PaymentType.Daily;
        el.BillableRate = this.wageType == 'Hourly' ? defaultHourlyRate : defaultDailyRate;
      } else if (value == 0) {
        el.PaymentType = this.wageType;
        el.PayableRate = value;
        el.BillingType = this.wageType;
        el.BillableRate = value;
      }
    }
  }

  onTypeChange(typeId){
    this.RevisionForm.get('designation').reset();
    this.RevisionForm.get('level').reset();
    this.DesignationList = _.filter(this.OfferInfoListGrp.LstEmployeeDesignation, { CategoryId: typeId });
  }

  onDesignationChange(value){

    if(value == null) this.RevisionForm.get('level').reset();

    let designation = _.find(this.DesignationList, {Code : value }) ;
    this.DeignationLevel = designation.LevelId;
    this.RevisionForm.get('level').setValue(this.DeignationLevel);

    let designationValue = this.RevisionForm.get('designation').value;
    let locationValue = this.RevisionForm.get('campus').value;
    let industryValue = this.RevisionForm.get('industryType').value;
    let skillCategories = this.SkillCategoryList;

    if (!['', null, undefined].includes(designationValue) && !['', null, undefined].includes(locationValue) && !['', null, undefined].includes(industryValue)) {
      const defaultSkillId = this.DesignationList.length > 0 && this.DesignationList.find(a => a.Code == designationValue).SkillCategoryId;
      if (!['', null, undefined].includes(defaultSkillId)) {
        let skillObj = skillCategories.find(a => a.Id == defaultSkillId)
        if(skillObj && Object.keys(skillObj).length > 0){
          this.RevisionForm.controls['skillCategory'].setValue(skillObj.Id)
          this.newSkillCategory = skillObj.Name;
        }
      }
    } 

    
  }

  removeNullValues(obj) {
    for (let key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        delete obj[key];
      }
    }
    return obj;
  }

  elcModify(elcObj) {
    console.log(elcObj);
    let currentLocationId: Number = elcObj.newELCobj.Location;
    this.ClientLocationList.map( obj=>{
      if(obj.Id === currentLocationId){
        elcObj.newELCobj["State"] = Number(obj.StateId);
        return elcObj;
      }
    })
  
  }

  onChangeJoiningLocation(event: any, queue) {
    const promise = new Promise((res, rej) => {

      console.log('JOINing Locatin :', event);

      if (queue == 'secondtime') {
        this.RevisionForm.controls['skillCategory'] != null ? this.RevisionForm.controls['skillCategory'].setValue(null) : null;
      
      }

      if (event != null) {
        this.CityId = event.Id;
        if (queue == 'secondtime') {
          this.RevisionForm.controls['campus'].setValue(null);
        }
      }
    })

    return promise;
  }

  GetClientLocationList() {

    let cityValue = this.RevisionForm.get('city').value;
    var workLocation = this.ClientReportingLocationList;
    return ['', null, undefined].includes(cityValue) ? workLocation :
      workLocation.filter(a => Number(a.CityId) == Number(cityValue));
  }

  labelValidator(dataObject, findAttribute){
    let exceptionList = [null, "", undefined, 0]
    if (dataObject.hasOwnProperty(findAttribute) && !exceptionList.includes(dataObject[findAttribute])){
      return true;
    }else {
      return false;
    }
  }

}
