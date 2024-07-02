import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { NgxSpinnerService } from "ngx-spinner";

import * as html2pdf from 'html2pdf.js';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, EmployeeService, ESSService, FileUploadService, HeaderService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeInvestmentMaster, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
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
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { environment } from 'src/environments/environment';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { CustomdrawerModalComponent } from 'src/app/shared/modals/investment/customdrawer-modal/customdrawer-modal.component';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { EmployeeHouseRentDetails } from 'src/app/_services/model/Employee/EmployeeHouseRentDetails';
import { EmployeeInvestmentDeductions, EmployeeInvesmentDependentDetails, EmployeeInvestmentDocuments } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';

import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { InvestmentInfo } from 'src/app/_services/model/Employee/EmployeeExcemptions';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { T } from '@angular/cdk/keycodes';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { startOfISOWeekYear } from 'date-fns';
@Component({
  selector: 'app-myinvestment',
  templateUrl: './myinvestment.component.html',
  styleUrls: ['./myinvestment.component.css', '../essexternalstyle.scss']
})
export class MyinvestmentComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() InvestmetnListGrp: InvestmentInfo;
  @Output() investmentChangeHandler = new EventEmitter();
  @Output() investmentStatusHandler = new EventEmitter();
  @Input() lstlookUpDetails: EmployeeLookUp;
  @Output() IspendingInvestmentExistHandler = new EventEmitter();



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
  // INVESTMENT

  indicateSubmissionSlotEnddate: boolean = false;
  indicateSubmissionSlotIsAfter: boolean = false;
  indicateSubmissionSlotIsBefore: boolean = false;
  LstInvestmentSubmissionSlot = [];
  isInvestmentUnderQC: boolean = false;
  isInvestmentQcRejected: boolean = false;
  TaxDeclaration: any;
  PFAmount: number = 0;
  PTAmount: number = 0;
  dynamicPFInvestments = [];

  TaxationCategory_Investment = [];
  TaxationOtherCategory_Investment = [];
  TaxationCategory = [];
  TaxationOtherCategory = [];
  TaxationOtherCategory_Exemption = [];

  Lstinvestment = [];
  Lstdeduction_Exemption = [];
  dynamicExeptions = [];
  popupTaxBills: any = [];

  DocumentTypeList = [];
  collection = [];
  FicalYearList = [];

  enableEditTxt: any;
  isSummary_panel: boolean = false;
  isInvestment_panel: boolean = false;
  isDeduction_panel: boolean = false;
  isAdditional_panel: boolean = false;

  deletedLstInvestmentDeduction = [];
  deletedLstExemption = [];


  LstemployeeHouseRentDetails: EmployeeHouseRentDetails[] = [];
  LstEmployeeHousePropertyDetails: EmployeeHousePropertyDetails[] = [];
  LstemployeeInvestmentDeductions: EmployeeInvestmentDeductions[] = [];
  LstEmpInvDepDetails: EmployeeInvesmentDependentDetails[] = [];

  documentURL = null;
  documentURLId = null;
  employeeModel: EmployeeModel = new EmployeeModel();
  InvestmentClosedDate: any;
  ExemptionRateSetProducts = [];
  FinId: any;
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
  _formSumbitStatus: boolean;
  FileName: any;
  FileUrl: any;
  DocumentId: any;
  employeeInvestmentMaster: any;
  _SlotClosureDate: any;
  _isSubmit: any
  _isProofMode: any
  _ispendingInvestmentExist: any
  ispendingInvestmentExist: boolean = false;
  isPreviewButtonRequired: boolean = false;
  summaryDocumentId: any = 0;
  _otherSecDetails: any = []
  enableUploadPopup: boolean = false;
  _rowSpan: any;
  exceptionList: any = []
  ltaRowspan: any
  modalOption: NgbModalOptions = {};
  sec10NameForForm12BB: any
  finalArray: any = [];
  _empAddress: any = ""
  CurrentFinancialYearId: number = 0;
  _SelectedFinId: any;
  IsPriorDOJ: boolean = false;

  //spinnerText: string = "Uploading";
  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    public essService: ESSService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    private router: Router,
    private drawerService: NzDrawerService,
    private loadingScreenService: LoadingScreenService,
    private employeeService: EmployeeService,
    private sanitizer: DomSanitizer,
    private Customloadingspinner: NgxSpinnerService,
    private objectApi: FileUploadService,
    private modalService: NgbModal,


  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 


  createReactiveForm() {

    this.employeeForm = this.formBuilder.group({

      // INVESTMENT AND DEDUCTION
      financialYear: [0],
      IsNewTaxRegimeOpted: [false],

    });
  }


  ngOnInit() {
    this.isInvestmentUnderQC = false;
    this.isInvestmentQcRejected = false;
    this.doRefresh();
    // this.employeeForm.valueChanges.subscribe((changedObj: any) => {
    //   this.subscribeEmitter();
    // });

  }

  doRefresh() {
    this.isInvestmentUnderQC = false;
    this.ispendingInvestmentExist = false;
    this.isPreviewButtonRequired = false;
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
    this.sec10NameForForm12BB = environment.environment.sec10NameForForm12BB;

    // let companyLogos = this.essService.GetCompanyLogoByBusinessType(this._loginSessionDetails, this.BusinessType);
    // this.clientLogoLink = companyLogos.clientLogoLink;
    // this.clientminiLogoLink = companyLogos.clientminiLogoLink;
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      this.enableEditTxt = 'Cencel';
      this.EmployeeLookUpDetailsByEmployeeId().then((obj) => {
        this.GetEmployeeRequiredInvestmentDetails().then((obj1) => {
          this._loadEmpUILookUpDetails().then((obj2) => {
            this.dataMapping();
            this.patchEmployeeDetails();

            this.trigger_investmentproducts_binding();
            this.load_preinsertedRecords();
            this.doCheckSubmissionSlotDate();
          });
        });
      });

    } else {
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
      this.dataMapping();
      this.patchEmployeeDetails();
      this.trigger_investmentproducts_binding();
      this.load_preinsertedRecords();
      this.doCheckSubmissionSlotDate();
      this.spinner = false;
    }
    this.employeeService.getActiveTab(false);
  }

  patchEmployeeDetails() {
    if (this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.FinancialYearId == this.employeeForm.get('financialYear').value) {
      this.isInvestmentUnderQC = this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.Status == ApprovalStatus.Pending ? true : false;
      this.isInvestmentQcRejected = this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.Status == ApprovalStatus.Rejected ? true : false;
      this.summaryDocumentId = this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.Status == ApprovalStatus.Pending ? this.employeedetails.EmployeeInvestmentMaster.SummaryDocumentId : 0;

    }
    if (this.isESSLogin == false) {
      this.investmentStatusHandler.emit(this.isInvestmentUnderQC);
    }

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

  dataMapping() {
    this.isSummary_panel = true;
    this.isInvestment_panel = false;
    this.isDeduction_panel = false;
    this.isAdditional_panel = false;

    this.dynamicPFInvestments = [];
    this.PFAmount = 0;
    this.PTAmount = 0
    this.TaxDeclaration = this.InvestmetnListGrp.TaxDeclaration;
    this.ExemptionRateSetProducts = this.InvestmetnListGrp.ApplicableExemptionProducts;
    this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 && this.sessionService.setSesstionStorage('DefaultFinancialYearId', this.InvestmetnListGrp.FinancialDetails[0].Id);
    this.FinId = this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 ? this.InvestmetnListGrp.FinancialDetails[0].Id : 0;
    this.CurrentFinancialYearId = this.InvestmetnListGrp.CurrentFinancialYearId;
    this._SelectedFinId = this.FinId;
    this.InvestmetnListGrp.TaxItems != null && this.InvestmetnListGrp.TaxItems.length > 0 && this.dynamicPFInvestments.push({

      Name: 'PF',
      AmtInvested: this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode == 'PF') != undefined ? this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode == 'PF').Amount : 0,
      AmtApproved: 0,
      Status: "Pending"
    },
      {

        Name: 'PT',
        AmtInvested: this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode == 'PT') != undefined ? this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode == 'PT').Amount : 0,
        AmtApproved: 0,
        Status: "Pending"
      }
    )
    if (this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode.toUpperCase() == 'BASIC') != undefined) {
      let Basic_amt = 0;
      Basic_amt = this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode.toUpperCase() == 'BASIC') != undefined ? this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode.toUpperCase() == 'BASIC').Amount : 0;
      this.sessionService.setSesstionStorage('HRA_Annual_Basic', Basic_amt);
    }
    if (this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode.toUpperCase() == 'HRA') != undefined) {
      let HRA_amt = 0;
      HRA_amt = this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode.toUpperCase() == 'HRA') != undefined ? this.InvestmetnListGrp.TaxItems.find(a => a.ProductCode.toUpperCase() == 'HRA').Amount : 0;
      this.sessionService.setSesstionStorage('HRA_Annual_HRA', HRA_amt);

    }
    this.employeeForm.controls['financialYear'].setValue(this.sessionService.getSessionStorage('DefaultFinancialYearId'));
    this.employeeForm.controls['IsNewTaxRegimeOpted'].setValue(this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted);
    if (this.employeedetails.EmploymentContracts[0].IsFirstMonthPayoutdone && this.TaxDeclaration != 1) {
      this.employeeForm.controls['IsNewTaxRegimeOpted'].disable()
    }
    if(this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted){
      this.onChangeTaxRegime();
    }
    this.IsPriorDOJ = false;
    if(this.TaxDeclaration == 1){
      this.CheckNewJoineeDeclaratinModeDOJ();

    }
    // this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? this.employeeForm.controls['IsNewTaxRegimeOpted'].disable() : this.employeeForm.controls['IsNewTaxRegimeOpted'].enable();

  }

  trigger_investmentproducts_binding() {
    console.log('LOOK UP DETAILS EMP :', this.lstlookUpDetails);

    this.DocumentTypeList = this.lstlookUpDetails.DocumentTypeList;
    this.collection = this.lstlookUpDetails.InvesmentProductList;
    this.FicalYearList = this.lstlookUpDetails.FicalYearList;
    this.LstInvestmentSubmissionSlot = this.lstlookUpDetails.InvestmentSubmissionSlotList != null && this.lstlookUpDetails.InvestmentSubmissionSlotList.length > 0 ?
      this.lstlookUpDetails.InvestmentSubmissionSlotList : [];

    this.TaxationCategory = [];
    this.TaxationCategory = environment.environment.HousePropertyDetails_Static;
    this.collection = [...this.TaxationCategory, ...this.collection];
    let hra = [];
    hra = _.filter(this.collection, item => item.ProductId == environment.environment.HRA_DynamicProductId);
    this.TaxationCategory = [...this.TaxationCategory, ...hra];
    //console.log("this.TaxationCategory", this.TaxationCategory)
    const collections = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Investment });
    });
    this.TaxationOtherCategory = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Deductions });
    });
    this.TaxationOtherCategory_Exemption = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
      return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Exemptions });
    });
    this.TaxationOtherCategory = this.TaxationOtherCategory.filter(pro => pro.ProductCode.toUpperCase() != 'PT' &&  pro.ProductCode.toUpperCase() != "INT_HL_FB" &&  pro.ProductCode.toUpperCase() != "INT_HL_AH");
    //&& !pro.ProductCode.toUpperCase().include(environment.environment.HideProductFromDeductionCategory)
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
  doCheckSubmissionSlotDate() {

    // Declaration = 1,
    // Proof = 2
    // var _md: any = this.TaxDeclaration == 1 ? 1 : 2;

    var mode: any = this.TaxDeclaration != 1 ? 2 : 1;
    var SlotClosureDate: any = null;
    var SlotStartDate: any = null;
    this.indicateSubmissionSlotEnddate = false;
    this.indicateSubmissionSlotIsAfter = false;
    this.indicateSubmissionSlotIsBefore = false; var currentDate = moment().format('YYYY-MM-DD');
    if (this.InvestmetnListGrp != null && this.InvestmetnListGrp.InvestmentSubmissionSlotList != null && this.InvestmetnListGrp.InvestmentSubmissionSlotList.length > 0 &&
      this.InvestmetnListGrp.InvestmentSubmissionSlotList.find(a => a.Mode == mode) != undefined) {
      SlotClosureDate = new Date(this.InvestmetnListGrp.InvestmentSubmissionSlotList.find(a => a.Mode == mode).EndDay);
    }
    if (this.InvestmetnListGrp != null && this.InvestmetnListGrp.InvestmentSubmissionSlotList != null && this.InvestmetnListGrp.InvestmentSubmissionSlotList.length > 0 &&
      this.InvestmetnListGrp.InvestmentSubmissionSlotList.find(a => a.Mode == mode) != undefined) {
      SlotStartDate = new Date(this.InvestmetnListGrp.InvestmentSubmissionSlotList.find(a => a.Mode == mode).StartDay);
    }
    // InvestmentSubmissionSlotList

    // if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
    //   (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
    //   SlotClosureDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
    //     (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == mode)[0].EndDay;
    // } else {
    //   SlotClosureDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == mode).EndDay;
    // }

    // if (this.LstInvestmentSubmissionSlot.length > 0 && (this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
    //   (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId)).length > 0)) {
    //   SlotStartDate = this.LstInvestmentSubmissionSlot.filter(a => (a.ClientId == this.employeedetails.EmploymentContracts[0].ClientId) &&
    //     (a.ClientContractId == this.employeedetails.EmploymentContracts[0].ClientContractId) && a.Mode == mode)[0].StartDay;
    // } else {
    //   SlotStartDate = this.LstInvestmentSubmissionSlot.find(z => z.ClientId == 0 && z.ClientContractId == 0 && z.Mode == mode).StartDay;
    // }
    SlotStartDate = moment(SlotStartDate).format('YYYY-MM-DD');
    SlotClosureDate = moment(SlotClosureDate).format('YYYY-MM-DD');
    this.indicateSubmissionSlotEnddate = (moment(currentDate).isBetween(moment(SlotStartDate).format('YYYY-MM-DD'), moment(SlotClosureDate).format('YYYY-MM-DD'))); // true
    this.indicateSubmissionSlotIsAfter = moment(SlotStartDate).isAfter(currentDate) || moment(SlotClosureDate).isAfter(currentDate) ; 
    this.indicateSubmissionSlotIsBefore = (moment(currentDate)
      .isBefore(SlotStartDate) || moment(currentDate)
        .isBefore(SlotClosureDate));

    console.log(SlotStartDate);

    if (moment(currentDate)
      .isSame(moment(SlotStartDate).format('YYYY-MM-DD'))) {
      this.indicateSubmissionSlotEnddate = true;
      this.indicateSubmissionSlotIsAfter = false
      this.indicateSubmissionSlotIsBefore = false
    }
    if (moment(currentDate)
      .isSame(moment(SlotClosureDate).format('YYYY-MM-DD'))) {
      this.indicateSubmissionSlotEnddate = true;
      this.indicateSubmissionSlotIsAfter = false
      this.indicateSubmissionSlotIsBefore = false
    }
    this.InvestmentClosedDate = SlotClosureDate;
    console.log('vcbcvcv', this.InvestmentClosedDate);

  }

  load_preinsertedRecords() {
    this.Lstinvestment = [];
    this.Lstdeduction_Exemption = [];
    this.deletedLstInvestmentDeduction = [];
    this.deletedLstExemption = [];
    var additinalLstForHRA = [];
    this.dynamicExeptions = [];
    // this.TaxDeclaration != 1 && this.Employee.LstemployeeInvestmentDeductions.length > 0 ?  this.Employee.LstemployeeInvestmentDeductions =   this.Employee.LstemployeeInvestmentDeductions.filter(a=>a.IsProposed == false) :    this.Employee.LstemployeeInvestmentDeductions.filter(a=>a.IsProposed == true);
    // this.TaxDeclaration != 1 && this.Employee.LstemployeeHouseRentDetails.length > 0 ?  this.Employee.LstemployeeHouseRentDetails =  this.Employee.LstemployeeHouseRentDetails.filter(a=>a.IsProposed == false) :    this.Employee.LstemployeeHouseRentDetails.filter(a=>a.IsProposed == true);    
    // this.TaxDeclaration != 1 && this.Employee.LstEmployeeHousePropertyDetails.length > 0 ? this.Employee.LstEmployeeHousePropertyDetails =   this.Employee.LstEmployeeHousePropertyDetails.filter(a=>a.IsProposed == false) :    this.Employee.LstEmployeeHousePropertyDetails.filter(a=>a.IsProposed == true);

    console.log('this.Employee.LstEmployeeTaxExemptionDetails', this.employeedetails.LstEmployeeTaxExemptionDetails);

    var _storeDeletedItems = [];
    _storeDeletedItems = JSON.parse(sessionStorage.getItem('_StoreLstinvestment_Deleted'));
    console.log('_storeDeletedItems', _storeDeletedItems);
    if (_storeDeletedItems != null && _storeDeletedItems != undefined && _storeDeletedItems.length > 0) {
      this.deletedLstInvestmentDeduction = this.deletedLstInvestmentDeduction.concat(_storeDeletedItems);
    }

    var _storeDeletedItems1 = [];
    _storeDeletedItems1 = JSON.parse(sessionStorage.getItem('_StoreLstDeductions_Deleted'));
    console.log('_storeDeletedItems1', _storeDeletedItems1);
    if (_storeDeletedItems1 != null && _storeDeletedItems1 != undefined && _storeDeletedItems1.length > 0) {
      this.deletedLstExemption = this.deletedLstExemption.concat(_storeDeletedItems1);
    }

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

    // this.dynamicExeptions=Response.LstEmployeeTaxExemptionDetails

    this.employeedetails.LstemployeeHouseRentDetails.forEach(e => {


      if (e.FinancialYearId == this.employeeForm.get('financialYear').value && e.Modetype != 2) {

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
    if (this.employeedetails.LstemployeeHouseRentDetails.length > 0 && additinalLstForHRA.length > 0) {
      var sum = 0
      this.employeedetails.LstemployeeHouseRentDetails.forEach(e => {
        if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {

          sum += (e.RentAmount)
        }
      });
      var sum1 = 0
      this.employeedetails.LstemployeeHouseRentDetails.forEach(e => {
        if (e.FinancialYearId == this.employeeForm.get('financialYear').value) {
          sum1 += (e.ApprovedAmount)
        }
      });

      var isValidToPush3 = false;
      if (this.Lstdeduction_Exemption.find(a => this.employeeForm.get('financialYear').value && a.ProductId == this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductId)) {
        isValidToPush3 = true;
      }

      if (this.deletedLstExemption != null && this.deletedLstExemption.length > 0) {
        if (this.deletedLstExemption.find(a => a.Section == 'Sec10') != undefined) {
          isValidToPush3 = true;
        }
      }

      if (isValidToPush3 == false) {


        let _definedObject = this.employeedetails.LstemployeeHouseRentDetails.length > 0 &&

          this.employeedetails.LstemployeeHouseRentDetails.find(a => a.FinancialYearId == this.employeeForm.get('financialYear').value) != undefined ?
          this.employeedetails.LstemployeeHouseRentDetails.find(a => a.FinancialYearId == this.employeeForm.get('financialYear').value) : null

        this.Lstdeduction_Exemption.push(
          {
            Id: UUID.UUID(),
            ProductId: this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductId,
            ProductCode: this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductCode,

            Name: this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductName,
            AmtInvested: sum,
            AmtApproved: sum1,
            Section: "Sec10",
            Remarks: _definedObject == null ? '' : _definedObject.InputsRemarks,
            Status: "Pending",
            DocumentId: _definedObject == null ? 0 : _definedObject.DocumentId,
            AdditionalList: _definedObject == null ? [] : additinalLstForHRA,
            DocumentDetails: _definedObject == null ? [] : _definedObject.LstEmployeeInvestmentDocuments,
            ChildProductJson : null
            // UIData : additinalLstForHRA[0].UIData,
          });
      }
    }

    var Lstinvestment_ChildProductJson  : any;

    this.employeedetails.LstemployeeInvestmentDeductions.forEach(e => {
      console.log('eeeee >>>>>>>>>>>', e);
      
      if (this.collection.find(z => z.ProductId === e.ProductID).ProductCode.toUpperCase() != 'PF' && this.collection.find(z => z.ProductId === e.ProductID).ProductCode.toUpperCase() != 'INT_HL_AH' && this.collection.find(z => z.ProductId === e.ProductID).ProductCode.toUpperCase() != 'INT_HL_FB') {
        if (e.FinancialYearId == this.employeeForm.get('financialYear').value && e.Modetype != 2) {
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

            var isValidToPush1 = false;
            if (this.deletedLstExemption != null && this.deletedLstExemption.length > 0) {
              if (this.deletedLstExemption.find(a => a.Id == e.Id) != undefined) {
                isValidToPush1 = true;
              }
            }

            if (this.Lstdeduction_Exemption != null && this.Lstdeduction_Exemption.length > 0) {
              if (this.Lstdeduction_Exemption.find(a => a.Id == e.Id) != undefined) {
                isValidToPush1 = true;
              }
            }


            if (isValidToPush1 == false) {

              this.Lstdeduction_Exemption.push(
                {
                  Id: e.Id,
                  ProductId: this.collection.find(z => z.ProductId === e.ProductID).ProductId,
                  Name: this.collection.find(z => z.ProductId === e.ProductID).ProductName,
                  ProductCode: this.collection.find(z => z.ProductId === e.ProductID).ProductCode,
                  AmtInvested: e.Amount,
                  AmtApproved: e.ApprovedAmount,
                  Section: this.collection.find(z => z.ProductId === e.ProductID).b[0].Code,
                  Remarks: e.InputsRemarks,
                  Status: "Pending",
                  DocumentId: e.DocumentId,
                  AdditionalList: additionalList,
                  DocumentDetails: e.LstEmployeeInvestmentDocuments,
                  ChildProductJson : null
                })
            }

          } else {

            var isValidToPush = false;
            if (this.deletedLstInvestmentDeduction != null && this.deletedLstInvestmentDeduction.length > 0) {
              if (this.deletedLstInvestmentDeduction.find(a => a.Id == e.Id) != undefined) {
                isValidToPush = true;
              }
            }

            if (this.Lstinvestment != null && this.Lstinvestment.length > 0) {
              if (this.Lstinvestment.find(a => a.Id == e.Id) != undefined) {
                isValidToPush = true;
              }
            }

            if (isValidToPush == false) {

              this.Lstinvestment.push(
                {
                  Id: e.Id,
                  ProductId: this.collection.find(z => z.ProductId === e.ProductID).ProductId,
                  ProductCode: this.collection.find(z => z.ProductId === e.ProductID).ProductCode,
                  Name: this.collection.find(z => z.ProductId === e.ProductID).ProductName,
                  AmtInvested: e.Amount,
                  AmtApproved: e.ApprovedAmount,
                  Section: this.collection.find(z => z.ProductId === e.ProductID).b[0].Code,
                  Remarks: e.InputsRemarks,
                  Status: "Pending",
                  DocumentId: e.DocumentId,
                  DocumentDetails: e.LstEmployeeInvestmentDocuments,
                  ChildProductJson : null
                });
            }

          }
        }
      }else if(this.collection.find(z => z.ProductId === e.ProductID).ProductCode.toUpperCase() == 'INT_HL_FB' || this.collection.find(z => z.ProductId === e.ProductID).ProductCode.toUpperCase() == 'INT_HL_AH'){
       
        Lstinvestment_ChildProductJson =
          {
            Id: e.Id,
            ProductId: this.collection.find(z => z.ProductId === e.ProductID).ProductId,
            ProductCode: this.collection.find(z => z.ProductId === e.ProductID).ProductCode,
            Name: this.collection.find(z => z.ProductId === e.ProductID).ProductName,
            AmtInvested: e.Amount,
            AmtApproved: e.ApprovedAmount,
            Section: this.collection.find(z => z.ProductId === e.ProductID).b[0].Code,
            Remarks: e.InputsRemarks,
            Status: "Pending",
            DocumentId: e.DocumentId,
            DocumentDetails: e.LstEmployeeInvestmentDocuments,
            ChildProductJson : null
          };
      }
    });

    //// -=========================-

    console.log('this.Lstinvestment 4343 ', this.Lstinvestment);

    this.form12bbInvestments = [...this.Lstinvestment]
    console.log('this.Lstinvestment 4343 ', this.Lstdeduction_Exemption);

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

    this.employeedetails.LstEmployeeHousePropertyDetails.forEach(e => {
      if (e.FinancialYearId == this.employeeForm.get('financialYear').value && e.Modetype != 2) {

        var isValidToPush11 = false;
        if (this.deletedLstExemption != null && this.deletedLstExemption.length > 0) {
          if (this.deletedLstExemption.find(a => a.Id == e.Id) != undefined) {
            isValidToPush11 = true;
          }
        }

        if (this.Lstdeduction_Exemption != null && this.Lstdeduction_Exemption.length > 0) {
          if (this.Lstdeduction_Exemption.find(a => a.Id == e.Id) != undefined) {
            isValidToPush11 = true;
          }
        }

        if (isValidToPush11 == false) {

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
              DocumentDetails: e.LstEmployeeInvestmentDocuments,
              ChildProductJson : Lstinvestment_ChildProductJson
            });
        }
      }
    });

    let empRateSets = [];
    this.popupTaxBills = [];
    // empRateSets = this.employeedetails['EmployeeRatesets'][0].RatesetProducts

    empRateSets = this.ExemptionRateSetProducts;
    console.log('EXEM PROD ::', this.TaxationOtherCategory_Exemption);
    console.log('RATESET ::', empRateSets);

    empRateSets != null && empRateSets.length > 0 && this.TaxationOtherCategory_Exemption != null && empRateSets.forEach(element => {
      var category = this.TaxationOtherCategory_Exemption.find(a => a.ProductCode.toUpperCase() == element.ProductCode.toUpperCase());
      console.log('category', category);

      if (category != undefined && category.ProductCode.toUpperCase() != 'HRA') {
        this.popupTaxBills.push(category)
      }
    });


    this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 && this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(e => {

      if (e.FinancialYearId == this.employeeForm.get('financialYear').value && e.Status == 1) {
        this.dynamicExeptions.push(e)
      }
    });
    for (let obj of this.dynamicExeptions) {
      let eObj = this.TaxationOtherCategory_Exemption.find(e => e.ProductId == obj.ProductId)
      if (eObj && eObj.ProductCode != null) {
        obj['ProductName'] = eObj.ProductName
      }
    }


    this.toenableSaveAndSubmitButton();


  }

  check_addingNewProduct() {
    const promise = new Promise((resolve, reject) => {
      if (!this.IsPriorDOJ && this.TaxDeclaration == 1 && this.indicateSubmissionSlotIsAfter && !this.indicateSubmissionSlotIsBefore) { // declaration mode only
        this.alertService.showInfo('Submission time has been closed.  Please contact the Technical Assistance Administration');
        reject(false);
      } else if (!this.IsPriorDOJ && this.TaxDeclaration == 1 && !this.indicateSubmissionSlotIsAfter && this.indicateSubmissionSlotIsBefore) { // declaration mode only
        this.alertService.showInfo('Submission time not yet underway. Please contact the Technical Assistance Administration');
        reject(false);
      } else {
        resolve(true);
      }
    })
    return promise;
  }


  /* #region  INVESTMENT AND DEDUCTION PROOF */
  async addInvestmentCategory() {
    await this.check_addingNewProduct().then((result) => {
      result == true ? $('#popup_chooseCategory_investment').modal('show') : false;
    });

  }


  addExceptionCategory() {
    // const modalRef = this.modalService.open(BillEntryModalsComponent);
    // modalRef.componentInstance.exemptionsList = this.Lstdeduction_Exemption;
    // modalRef.result.then((result) => {
    // });
    this.check_addingNewProduct().then((result) => {
      if (result == true) {
        $('#popup_chooseCategory_Exemptions').modal('show');
      }
    });
  }


  modal_dismiss2(closeActivity) {
    closeActivity === 'investment' && $('#popup_chooseCategory_investment').modal('hide') || closeActivity === 'deduction' && $('#popup_chooseCategoryDeduction').modal('hide') || closeActivity === 'exemptions' && $('#popup_chooseCategory_Exemptions').modal('hide');
    ;

  }
  addDeductionCategory() {
    this.check_addingNewProduct().then((result) => {
      if (result == true) {
        $('#popup_chooseCategoryDeduction').modal('show');
      }
    });

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

  chooseCategory(item: any, which: any) {
    // if (item.ProductCode.toUpperCase() == 'PF') {
    //   this.alertService.showWarning("You do not have access such Investment Product. Please contact your support admin.");
    //   return;
    // }
    this.check_addingNewProduct().then((result) => {
      if (result == true) {

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
          // let _eId = (this.isESSLogin ? this.EmployeeId : this.Id); // creq
          let _eId = (this.isESSLogin ? this.EmployeeId : this.EmployeeId);
          console.log('this.Lstinvestment', this.Lstinvestment);

          sessionStorage.removeItem("_StoreLstinvestment");
          sessionStorage.removeItem("_StoreLstDeductions");

          sessionStorage.removeItem("_StoreLstinvestment_Deleted");
          sessionStorage.removeItem("_StoreLstDeductions_Deleted");

          if (this.isESSLogin == false) {
            sessionStorage.removeItem("IsFromBillEntry");
            sessionStorage.setItem('IsFromBillEntry', "true");
          }
          // if (this.Lstinvestment.length > 0 && this.Lstinvestment.find(c => (c.Id == 0 || this.isGuid(c.Id) == true))) {
          if (this.Lstinvestment.length > 0) {
            var _store = [];
            var _store = this.Lstinvestment; //.filter(c => c.Id == 0 || this.isGuid(c.Id) == true);
            console.log(' var _store', _store);
            sessionStorage.setItem('_StoreLstinvestment', JSON.stringify(_store));
          }
          if (this.Lstdeduction_Exemption.length > 0) {
            // if (this.Lstdeduction_Exemption.length > 0 && this.Lstdeduction_Exemption.find(c => c.Id == 0 || this.isGuid(c.Id) == true)) {
            var _store1 = [];
            var _store1 = this.Lstdeduction_Exemption; //_Exemption.filter(c => c.Id == 0 || this.isGuid(c.Id) == true);
            console.log(' var _store', _store1);
            sessionStorage.setItem('_StoreLstDeductions', JSON.stringify(_store1));
          }

          if (this.deletedLstInvestmentDeduction != null && this.deletedLstInvestmentDeduction.length > 0) {
            sessionStorage.setItem('_StoreLstinvestment_Deleted', JSON.stringify(this.deletedLstInvestmentDeduction));
          }

          if (this.deletedLstExemption != null && this.deletedLstExemption.length > 0) {
            sessionStorage.setItem('_StoreLstDeductions_Deleted', JSON.stringify(this.deletedLstExemption));
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
        this.toenableSaveAndSubmitButton();
      }
    });
  }


 
  openDrawer(item, which, editableObj) {

    // var mode: boolean = (<HTMLInputElement>document.getElementById('toggle')).checked;
    var mode: boolean = this.TaxDeclaration == 1 ? true : false;
    // mode = true;
    const drawerRef = this.drawerService.create<CustomdrawerModalComponent, { categoryJson: any, whichCategory: any, Mode: boolean, editableObj: any,  objStorageJson, CityList ,ChildProductJson : any}, string>({
      nzTitle: this.getLetterSpace(item.ProductName),
      nzContent: CustomdrawerModalComponent,
      nzWidth: item.b[0].Code === 'Sec10' ? 840 : 640,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        categoryJson: item,
        whichCategory: item.b[0].Code.toUpperCase() === 'SEC24' ? 'duduction_Additional' : (item.b[0].Code.toUpperCase() === 'SEC80D' || item.b[0].Code.toUpperCase() === 'SEC80DD' || item.b[0].Code.toUpperCase() === 'SEC80DDB') ? 'duduction_Medical' :
        (item.b[0].Code.toUpperCase() === '80 E' || item.b[0].Code.toUpperCase() === 'SEC80G' || item.b[0].Code.toUpperCase() === 'SEC80G_MEMORIALFUND' || item.b[0].Code.toUpperCase() === 'SEC80G_LOCALGOVT' || item.b[0].Code.toUpperCase() === 'SEC80G_TRUST') ? 'deduction_Loan' : item.b[0].Code.toUpperCase() === 'SEC80U' ? 'deduction_Self'
            : which,
        Mode: mode,//this.isESSLogin == true ? true : mode, // creq
        editableObj: editableObj === null ? null : JSON.stringify(editableObj),
        objStorageJson: JSON.stringify({
          empName: this.employeedetails.FirstName, // this.employeeForm.get('Name').value, // creq
          email: '---', //this.employeeForm.get('email').value, // creq
          EmployeeId: this.EmployeeId, CompanyId: this.CompanyId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId,
          ClientId: this.employeedetails.EmploymentContracts[0].ClientId
        }),
        ChildProductJson :  item.b[0].Code.toUpperCase() === 'SEC24' ? this.lstlookUpDetails.InvesmentProductList.filter(pro =>  pro.ProductCode.toUpperCase() == "INT_HL_FB" ||  pro.ProductCode.toUpperCase() == "INT_HL_AH") : [],
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

          if(this.Lstdeduction_Exemption.find(a=>a.ChildProductJson != null)){
            console.log('yyyyyyyyyyyyyyyyyyyyy');
            
          }
          // var isExist = this.Lstdeduction_Exemption.find(z => z.Id == (modalResult.Id));
          // isExist !== undefined && (isExist.AmtInvested = (modalResult.AmtInvested))
          // isExist === undefined && this.Lstdeduction_Exemption.push(data)
          // console.log('lst', this.Lstdeduction_Exemption);

          if (modalResult.Section === 'Sec10') {

          }
        };

        this.subscribeEmitter();
      }

      this.toenableSaveAndSubmitButton();
    });
  }

  deleteInvestment(object) {
    this.check_addingNewProduct().then((result) => {
      if (result == true) {
        if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length > 0) {
          this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
          return;
        }

        this.alertService.confirmSwal("Are you sure?", "Are you sure you want to delete this investment product?", "Yes, Delete").then(result => {
          if (!this.essService.isGuid(object.Id)) {

            this.deletedLstInvestmentDeduction.push(object);
            this.toenableSaveAndSubmitButton();
          }
          const indexs: number = this.Lstinvestment.indexOf(object);
          if (indexs !== -1) {
            this.Lstinvestment.splice(indexs, 1);
            this.toenableSaveAndSubmitButton();
          }

        })
          .catch(error => { });

      }
    });

  }

  editInvestment(object) {
    this.check_addingNewProduct().then((result) => {
      if (result == true) {
        if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length == object.DocumentDetails.length) {
          this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
          return;
        }
        this.openDrawer(this.collection.find(a => a.ProductId === object.ProductId), 'investment', (object));
      }
    });
  }
  editDeduction(object) {
    console.log('vvv');
    
    this.check_addingNewProduct().then((result) => {
      if (result == true) {
        if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length == object.DocumentDetails.length) {
          this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
          return;
        }

        this.openDrawer(this.collection.find(a => a.ProductId === object.ProductId), 'duduction', (object));
      }
    });
  }

  deleteDeduction(object) {
    this.check_addingNewProduct().then((result) => {
      if (result == true) {

        if (object.DocumentDetails != null && object.DocumentDetails.length > 0 && object.DocumentDetails.filter(a => a.Status == 1).length > 0) {
          this.alertService.showWarning("Attention : This action was blocked. One or more product items cannot be deleted because the status is in an invalid state.");
          return;
        }

        this.alertService.confirmSwal("Are you sure?", "Are you sure you want to delete this investment product?", "Yes, Delete").then(result => {
          const indexs: number = this.Lstdeduction_Exemption.indexOf(object);
          if (this.essService.isGuid(object.Id) && object.Section == 'Sec10' && !this.essService.isGuid(object.AdditionalList[0].Id)) {
            object.AdditionalList.forEach(e => {
              e['Section'] = object.Section;
              this.deletedLstExemption.push(e);
            });
          }
          if (!this.essService.isGuid(object.Id)) {
           
            if(object.ChildProductJson != null){
            this.deletedLstInvestmentDeduction.push(object.ChildProductJson); ``
           }
          
            this.deletedLstExemption.push(object);
          }
          if (indexs !== -1) {
            this.Lstdeduction_Exemption.splice(indexs, 1);
          }


        })
          .catch(error => { });
      }
    });
  }


  getStatusCount(list, status) {
    // console.log('list', list);

    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;

  }

  getStatusCount1(list, status) {

    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;

  }

  toCheckDocumentCount(list) {
    return list != null && list.length > 0 ? true : false;
  }
  triggerInvestmentWorkFlowProcess(newObject: any) {
    this.loadingScreenService.startLoading();
    // this.Customloadingspinner.show();

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

    this.employeeService.post_InvestmentWorkFlow(JSON.stringify(workFlowInitiation)).subscribe((response) => {
      try {
        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
          this.isESSLogin == false ? this.router.navigate(['/app/listing/ui/employeelist']) : this.ESS_Clear_ReupateRecord();
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          this.alertService.showSuccess(`Your employee has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');
        } else {
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');
          this.isESSLogin == false ? this.router.navigate(['/app/listing/ui/employeelist']) : this.ESS_Clear_ReupateRecord();
        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        //this.Customloadingspinner.hide();
        this.alertService.showWarning(`An error occurred while trying to submission}!` + error);
        this.isESSLogin == false ? this.router.navigate(['/app/listing/ui/employeelist']) : this.ESS_Clear_ReupateRecord();
      }


    }), ((error) => {

    });
  }

  async ESS_Clear_ReupateRecord() {
    this.spinner = true;
    // await this.call_TimecardCalculation();
    sessionStorage.removeItem('LstHRA');
    this.clearListofItems();
    this.Lstinvestment = [];
    this.dynamicPFInvestments = [];
    // this.isESSLogin == true ?  this.employeeForm.controls['IsNewTaxRegimeOpted'].enable() : true;
    // this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? this.employeeForm.controls['IsNewTaxRegimeOpted'].disable() : this.employeeForm.controls['IsNewTaxRegimeOpted'].enable();
    if (this.employeedetails.EmploymentContracts[0].IsFirstMonthPayoutdone && this.TaxDeclaration != 1) {
      this.employeeForm.controls['IsNewTaxRegimeOpted'].disable()
    }
    this.Lstdeduction_Exemption = [];
    this.dynamicExeptions = [];
    this.deletedLstInvestmentDeduction = [];
    this.deletedLstExemption = [];
    this.doRefresh();
    // this.employeeForm.controls['financialYear'].disable();
  }

  clearListofItems() {

    this.LstEmployeeHousePropertyDetails = [];
    this.LstemployeeHouseRentDetails = [];
    this.LstemployeeInvestmentDeductions = [];

  }

  call_TimecardCalculation() {
    this.employeeService.UpdateEmployeeMarkedForCalculation(this.EmployeeId)
      .subscribe((result) => {

      })
  }


  document_file_view1(item, whichdocs) {
    item['DocumentId'] = item.BillId;
    const modalRef = this.modalService.open(PreviewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.docsObject = item;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });
    return;
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
    const modalRef = this.modalService.open(PreviewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.docsObject = item;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });
    return;

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


  // SAVE and SUBMIT
  test() {
    this.LstemployeeInvestmentDeductions = [];
    this.LstemployeeHouseRentDetails = [];
    this.LstEmployeeHousePropertyDetails = [];
    this.LstEmpInvDepDetails = [];
    // var mode: boolean = (<HTMLInputElement>document.getElementById('toggle')).checked;
    // Declaration = 1,
    // Proof = 2
    //    var _md: any = this.TaxDeclaration == 1 ? 1 : 2;
    // isproposed = mode == declaretion = fasle == true 
    var mode: boolean = this.TaxDeclaration == 1 ? false : true;

    this.Lstinvestment.forEach(item => {

      var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      empInvestmentDeduction.EmployeeId = this.EmployeeId;
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
      empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
      this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
    })
    


    this.deletedLstInvestmentDeduction.forEach(item => {
      
      var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      empInvestmentDeduction.EmployeeId = this.EmployeeId;
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
      empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
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
        hraObj.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id,
          hraObj.EmployeeId = this.EmployeeId,
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
      else if (item.Section === "Sec80G" || item.Section === "Sec80U" || item.Section == "80 E"  || item.Section == 'Sec80EE' || item.Section == 'Sec80EEA' 
      
      || item.Section.toUpperCase() === "SEC80G_MEMORIALFUND" || item.Section.toUpperCase() === "SEC80G_LOCALGOVT" || item.Section.toUpperCase() == "SEC80G_TRUST") {
        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.EmployeeId;
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
        empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.Modetype = UIMode.Delete;
        empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;

        this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
      }
      else if (item.Section === "Sec24") {
        var empHousePropDetails = new EmployeeHousePropertyDetails();
        empHousePropDetails.EmployeeId = this.EmployeeId,
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
        empHousePropDetails.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
        this.LstEmployeeHousePropertyDetails.push(empHousePropDetails)
      }
      else if (item.Section === "Sec80D" || item.Section === "Sec80DD" || item.Section === "Sec80DDB") {

        item.AdditionalList.forEach(e => {
          var empinvDepdetails = new EmployeeInvesmentDependentDetails();
          empinvDepdetails.EmpInvestmentDeductionId = item.ProductId;
          empinvDepdetails.EmployeeId = this.EmployeeId;
          empinvDepdetails.DependentType = e.DependentTypes === null ? 0 : e.DependentTypes
          empinvDepdetails.DisabilityPercentage = e.DisabilityPercentage != null ? e.DisabilityPercentage : 0;
          empinvDepdetails.DependentAge = 0;
          empinvDepdetails.Relationship = e.relationship === null ? 0 : e.relationship;
          empinvDepdetails.DependentName = e.NameofDependent;
          empinvDepdetails.DependentDateOfBirth = moment(e.DOB).format('YYYY-MM-DD');
          empinvDepdetails.Amount = e.Amount;
          empinvDepdetails.Details = '';
          empinvDepdetails.InputsRemarks = item.Remarks;
          empinvDepdetails.ApprovedAmount = e.ApprovedAmount;
          empinvDepdetails.ApproverRemarks = '';
          empinvDepdetails.Status = 1;
          empinvDepdetails.DocumentId = 0;
          empinvDepdetails.Modetype = UIMode.Delete;
          empinvDepdetails.Id = this.essService.isGuid(e.Id) == true ? 0 : e.Id;
          this.LstEmpInvDepDetails.push(empinvDepdetails)
        });

        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.EmployeeId;
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
        empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
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
          hraObj.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
            hraObj.EmployeeId = this.EmployeeId,
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
      else if (item.Section === "Sec80G" || item.Section === "Sec80U" || item.Section == '80 E' || item.Section == 'Sec80EE' || item.Section == 'Sec80EEA'
      || item.Section.toUpperCase() === "SEC80G_MEMORIALFUND" || item.Section.toUpperCase() === "SEC80G_LOCALGOVT" || item.Section.toUpperCase() == "SEC80G_TRUST") {
      
        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.EmployeeId;
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
        empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.Modetype = UIMode.Edit;
        empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.DocumentDetails;

        this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
      }
      else if (item.Section === "Sec24") {
        var empHousePropDetails = new EmployeeHousePropertyDetails();
        empHousePropDetails.EmployeeId = this.EmployeeId,
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

        empHousePropDetails.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
        this.LstEmployeeHousePropertyDetails.push(empHousePropDetails)

        if(item.ChildProductJson){
          var empInvestmentDeduction = new EmployeeInvestmentDeductions();
          empInvestmentDeduction.EmployeeId = this.EmployeeId;
          empInvestmentDeduction.FinancialYearId = this.employeeForm.get('financialYear').value;
          empInvestmentDeduction.ProductID =  item.ChildProductJson.ProductId;
          empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
          empInvestmentDeduction.IsDifferentlyabled = false;
          empInvestmentDeduction.Amount = item.ChildProductJson.AmtInvested;
          empInvestmentDeduction.Details = '';
          empInvestmentDeduction.IsProposed = (item.DocumentDetails != null && mode == true) ? false : true;
          empInvestmentDeduction.InputsRemarks = item.Remarks;
          empInvestmentDeduction.ApprovedAmount = item.ChildProductJson.AmtApproved;
          empInvestmentDeduction.ApproverRemarks = ''
          empInvestmentDeduction.Status = 1;
          empInvestmentDeduction.DocumentId = 0;
          empInvestmentDeduction.LstEmpInvDepDetails = [];
          empInvestmentDeduction.Id = this.essService.isGuid(item.ChildProductJson.Id) == true ? 0 : item.ChildProductJson.Id;
          empInvestmentDeduction.Modetype =item.ChildProductJson.Modetype ==  UIMode.Delete ? UIMode.Delete : UIMode.Edit;
          empInvestmentDeduction.LstEmployeeInvestmentDocuments = item.ChildProductJson.DocumentDetails;
  
          this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
        }
      }
      else if (item.Section === "Sec80D" || item.Section === "Sec80DD" || item.Section === "Sec80DDB") {
        this.LstEmpInvDepDetails = [];
        item.AdditionalList.forEach(e => {
          var empinvDepdetails = new EmployeeInvesmentDependentDetails();
          empinvDepdetails.EmpInvestmentDeductionId = item.ProductId;
          empinvDepdetails.EmployeeId = this.EmployeeId;
          empinvDepdetails.DependentType = e.DependentTypes === null ? 0 : e.DependentTypes
          empinvDepdetails.DisabilityPercentage = e.DisabilityPercentage != null ? e.DisabilityPercentage : 0;
          empinvDepdetails.DependentAge = 0;
          empinvDepdetails.Relationship = e.relationship === null ? 0 : e.relationship;
          empinvDepdetails.DependentName = e.NameofDependent;
          empinvDepdetails.DependentDateOfBirth = moment(e.DOB).format('YYYY-MM-DD');
          empinvDepdetails.Amount = e.Amount;
          empinvDepdetails.Details = '';
          empinvDepdetails.InputsRemarks = item.Remarks;
          empinvDepdetails.ApprovedAmount = e.ApprovedAmount;
          empinvDepdetails.ApproverRemarks = '';
          empinvDepdetails.Status = 1;
          empinvDepdetails.DocumentId = 0;
          empinvDepdetails.Modetype = UIMode.Edit;
          empinvDepdetails.Id = this.essService.isGuid(e.Id) == true ? 0 : e.Id;
          this.LstEmpInvDepDetails.push(empinvDepdetails)
        });

        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.EmployeeId;
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
        empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
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
        hraObj.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
          hraObj.EmployeeId = this.EmployeeId,
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

  // ESS SAVE AND SUBMIT

  
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

  GetEmployeeRequiredInvestmentDetails() {
    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments, this._SelectedFinId).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let investmentObject: EmployeeDetails = apiR.Result as any;
            this.employeedetails = investmentObject;
            if (this.isESSLogin) {
              this.sessionService.delSessionStorage('_EmployeeRequiredBasicDetails');
              this.sessionService.setSesstionStorage('_EmployeeRequiredBasicDetails', this.employeedetails);
            }
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


  EmployeeLookUpDetailsByEmployeeId() {

    const promise = new Promise((resolve, reject) => {
      if (this.sessionService.getSessionStorage('InvestmetnListGrp') != null && this.sessionService.getSessionStorage('LookUpDInvestmetnListGrpetails') != undefined) {
        this.InvestmetnListGrp = JSON.parse(this.sessionService.getSessionStorage('InvestmetnListGrp'));
        this.FinId = this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 ? this.InvestmetnListGrp.FinancialDetails[0].Id : 0;

        // this.spinner = false;
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
              this.FinId = this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 ? this.InvestmetnListGrp.FinancialDetails[0].Id : 0;

              // this.InvestmetnListGrp = lookupObject.TaxDeclaration;
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
    })
    return promise;
  }


  _loadEmpUILookUpDetails() {

    return new Promise((res, rej) => {
      if (this.sessionService.getSessionStorage('LookUpDetails') != null && this.sessionService.getSessionStorage('LookUpDetails') != undefined) {
        this.lstlookUpDetails = JSON.parse(this.sessionService.getSessionStorage('LookUpDetails'));
        this.spinner = false;
        res(true);
        return;
      } else {
        this.employeeService.get_LoadEmployeeUILookUpDetails(this.EmployeeId)
          .subscribe((result) => {

            let apiResponse: apiResponse = result;
            if (apiResponse.Status) {
              this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
              this.spinner = false;
              res(true);
            } else {
              this.spinner = false;
            }
          }, err => {
            rej();
          })
      }
    });
  }


  uploadFormPopup(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist) {
    this._SlotClosureDate = SlotClosureDate
    this._isSubmit = isSubmit
    this._isProofMode = isProofMode
    this._ispendingInvestmentExist = ispendingInvestmentExist
    $("#popup_Form12BBUpload").modal('show');
  }

  uploadFormPoppopClose() {
    this._formSumbitStatus = false;
    this.FileName = null;
    $("#popup_Form12BBUpload").modal('hide');
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

  doAsyncUpload(filebytes, filename) {
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

      //"Proofs";
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);


        try {
          if (apiResult.Status && apiResult.Result != "") {
            this.DocumentId = apiResult.Result;
            this.confirmSubmit(this._SlotClosureDate, this._isSubmit, this._isProofMode, this._ispendingInvestmentExist, this.DocumentId);
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

  toenableSaveAndSubmitButton() {
    this.ispendingInvestmentExist = false;
    this.isPreviewButtonRequired = false;
    if ((this.Lstinvestment != null && this.Lstinvestment.length > 0) ||
      (this.Lstdeduction_Exemption != null && this.Lstdeduction_Exemption.length > 0) ||
      (this.dynamicExeptions != null && this.dynamicExeptions.length > 0)) {

      if ((this.Lstinvestment.filter(a => a.DocumentDetails != null && a.DocumentDetails.length > 0 && a.DocumentDetails.filter(z => z.Status == 0).length > 0).length > 0) ||
        (this.Lstdeduction_Exemption.filter(a => a.DocumentDetails != null && a.DocumentDetails.length > 0 && a.DocumentDetails.filter(z => z.Status == 0).length > 0).length > 0) ||
        (this.dynamicExeptions.filter(a => a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(z => z.Status == 0).length > 0).length > 0)

      ) {
        this.ispendingInvestmentExist = true;
        this.isPreviewButtonRequired = true;

      }

    }
    if (this.isESSLogin == false) {
      this.IspendingInvestmentExistHandler.emit({
        investmentbehaviourData:
        {

          IsPendingItems: this.ispendingInvestmentExist,
          IsItInQc: this.isInvestmentUnderQC
        }
      });

    }

  }

  doSaveOrSubmit(isSubmit) {


    let isProofMode: boolean = false;
    if (this.TaxDeclaration != 1) {
      isProofMode = true;
    } else {
      isProofMode = false;
    }

    if (isSubmit == true) {
      if (this.employeedetails.Status == 0) {
        this.alertService.showWarning("The employee's status is inactive. It will not be possible to submit your investment information.");
        this.loadingScreenService.stopLoading();
        //this.Customloadingspinner.hide();
        return;
      }
    }
    // isProofMode && this.validateEmployeeInvestment().then((result) => {
    //   if (result != null && result[0].IsValid != true) {
    //     this.alertService.showWarning(result[0].Message);
    //     this.Customloadingspinner.hide();
    //     return;
    //   } else {
    //     this.Customloadingspinner.hide();
    //     this.finalSubmit(isProofMode, isSubmit)

    //   }

    // })

    // !isProofMode && this.finalSubmit(isProofMode, isSubmit)

    this.finalSubmit(isProofMode, isSubmit);

  }

  validateEmployeeInvestment() {
    const promise = new Promise((res, rej) => {
      this.loadingScreenService.startLoading();
      //this.Customloadingspinner.show();
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


      this.submitted = true;
      var SlotClosureDate: any = null;

      this.toenableSaveAndSubmitButton();

      if (this.ispendingInvestmentExist == true  && !this.IsPriorDOJ) {

        this.validateEmployeeInvestment().then((result) => {
          console.log('result', result);

          if (result != null && result[0].IsValid != true) {
            this.alertService.showWarning(result[0].Message);
            this.loadingScreenService.stopLoading();
            // this.Customloadingspinner.hide();
            return;
          } else {
            SlotClosureDate = (result[0].result);
            this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, this.ispendingInvestmentExist);
            this.loadingScreenService.stopLoading();
            //this.Customloadingspinner.hide();
            // this.finalSubmit(isProofMode, isSubmit)

          }
        });
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
        this.afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, this.ispendingInvestmentExist)
      }
    }
    catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      this.loadingScreenService.stopLoading();
      // this.Customloadingspinner.hide();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }

  afterSubmisssionSlotCheck(SlotClosureDate, isProofMode, isSubmit, ispendingInvestmentExist) {
    try {


      let isRejectPendingCombined = false;
      this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 && this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(element => {

        for (let h = 0; h < element.LstEmployeeExemptionBillDetails.length; h++) {
          if (this.FinId = element.FinancialYearId && element.LstEmployeeExemptionBillDetails[h].Status == 2 && element.LstEmployeeExemptionBillDetails.find(a => a.Status == 0) != undefined) {

            isRejectPendingCombined = true;
          }

        }
      });
      let isPendingPreviousEmploymentExists = false;
      if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(b => b.FinancialYearId == this.FinId &&
        b.ApprovalStatus == 0)) {
        isPendingPreviousEmploymentExists = true;
      }

      let confirmationTxt = "";
      if (isSubmit == true && isPendingPreviousEmploymentExists == true && isRejectPendingCombined == true as any) {
        confirmationTxt = "There are some rejected file(s) in your :) Exemptions Cart and some saved file(s) in your Previous employment.";
      }
      else if (isSubmit == true && isPendingPreviousEmploymentExists == true && isRejectPendingCombined == false as any) {
        confirmationTxt = "There are some saved file(s) in your :) Previous Employment.";
      } else if (isSubmit == true && isRejectPendingCombined == true as any && isPendingPreviousEmploymentExists == false) {
        confirmationTxt = "There are some rejected file(s) in your :) Exemptions Cart. Are you sure you want to submit?";
      } else {
        confirmationTxt = "";
      }

      if (isSubmit == true && confirmationTxt != "" as any) {
        this.alertService.confirmSwal1("Confirm Stage?", `${confirmationTxt} `, "Ok", "Cancel").then((result) => {
          if (isSubmit) {
            this.enableUploadPopup = true
            this.uploadFormPopup(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist);
          }
          else {
            this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, 0);
          } return;
        }).catch(cancel => {
          this.loadingScreenService.stopLoading();
          // this.Customloadingspinner.hide();
          return;
        });
      }

      if (confirmationTxt == "") {
        if (isSubmit) {
          this.enableUploadPopup = true
          this.uploadFormPopup(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist);
        }
        else {
          this.confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, 0);
        }

        return;
      }
    }
    catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }

  confirmSubmit(SlotClosureDate, isSubmit, isProofMode, ispendingInvestmentExist, documentid) {


    try {
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.loadingScreenService.startLoading();
      //this.Customloadingspinner.show();
      this.clearListofItems();
      this.test();
      this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted = this.employeeForm.get('IsNewTaxRegimeOpted').value;
      var employeeinvestmentMaster = new EmployeeInvestmentMaster();
      employeeinvestmentMaster.PersonId = 0;
      employeeinvestmentMaster.EmployeeId = this.EmployeeId;
      employeeinvestmentMaster.FinancialYearId = this.employeeForm.get('financialYear').value;
      employeeinvestmentMaster.ModuleProcessTransactionId = 0;
      employeeinvestmentMaster.SlotClosureDate = SlotClosureDate == null ? '1900-01-01' : SlotClosureDate;
      employeeinvestmentMaster.Status = 0;
      employeeinvestmentMaster.SummaryDocumentId = documentid
      employeeinvestmentMaster.Id = this.employeedetails.EmployeeInvestmentMaster != null ? this.employeedetails.EmployeeInvestmentMaster.Id : 0;
      console.log('ddsd', employeeinvestmentMaster);

      isProofMode && isSubmit == true && ispendingInvestmentExist == true ? this.employeedetails.EmployeeInvestmentMaster = employeeinvestmentMaster : null;
      this.employeedetails.LstEmployeeHousePropertyDetails = this.LstEmployeeHousePropertyDetails;
      this.employeedetails.LstemployeeHouseRentDetails = this.LstemployeeHouseRentDetails;
      this.employeedetails.LstemployeeInvestmentDeductions = this.LstemployeeInvestmentDeductions;
      this.employeedetails.Gender = (this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender) as any;


      this.employeeModel.oldobj = this.employeedetails;
      this.employeeModel.newobj = this.employeedetails;
      console.log('MY INV ::', this.employeedetails);
      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.loadingScreenService.stopLoading();
          // this.Customloadingspinner.hide();
          if (data.Status) {
            sessionStorage.removeItem('_StoreLstinvestment');
            sessionStorage.removeItem('_StoreLstDeductions');
            sessionStorage.removeItem("_StoreLstinvestment_Deleted");
            sessionStorage.removeItem("_StoreLstDeductions_Deleted");
            this.alertService.showSuccess(data.Message);
            if (this.isESSLogin == true && isSubmit == true) { // when click on submit button then only the worflow will be triggering...
              if (isProofMode && (this.employeedetails.LstemployeeInvestmentDeductions.length > 0 || this.employeedetails.LstemployeeHouseRentDetails.length > 0 ||
                this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 || this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) && this.TaxDeclaration != 1) {
                if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstemployeeHouseRentDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => this.FinId = a.FinancialYearId && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0
                ) {
                  this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
                }


              }
            }
            else if (this.isESSLogin == false && isSubmit == true) {
              if (isProofMode && (this.employeedetails.LstemployeeInvestmentDeductions.length > 0 || this.employeedetails.LstemployeeHouseRentDetails.length > 0 ||
                this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 || this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) && this.TaxDeclaration != 1) {
                // this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
                if (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstemployeeHouseRentDetails.filter(a => this.FinId = a.FinancialYearId && a.Modetype != UIMode.Delete && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(b => b.Status == 0).length > 0).length > 0 ||
                  this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => this.FinId = a.FinancialYearId && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0) {
                  this.triggerInvestmentWorkFlowProcess(data.dynamicObject.newobj);
                }
              }
            }

            this.ESS_Clear_ReupateRecord();
            this.uploadFormPoppopClose();

          }
          else {
            this.alertService.showWarning(data.Message);
          }
        },
          (err) => {
            this.loadingScreenService.stopLoading();
            //this.Customloadingspinner.hide();
            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);
          });

      }

    } catch (err) {
      console.log('EXCEPTION ERROR ::', err);
      this.loadingScreenService.stopLoading();
      // this.Customloadingspinner.hide();
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }

  }


  EmitHandler() {
    this.test();

    this.employeedetails.LstEmployeeHousePropertyDetails = this.LstEmployeeHousePropertyDetails;
    this.employeedetails.LstemployeeHouseRentDetails = this.LstemployeeHouseRentDetails;
    this.employeedetails.LstemployeeInvestmentDeductions = this.LstemployeeInvestmentDeductions;

  }

  ngOnDestroy() {
    this.subscribeEmitter();


  }

  getInvmentStatus() {
    if (this.isESSLogin == false) {
      return this.isInvestmentUnderQC

    }
  }


  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();

      this.investmentChangeHandler.emit({
        empDet: this.employeedetails, others: {
          _inv: this.Lstinvestment,
          _ded: this.Lstdeduction_Exemption,
          _exem: this.dynamicExeptions,
          _dynPFInv: this.dynamicPFInvestments,
          _isInvestUnderQC: this.isInvestmentUnderQC,
          _ispendingExist: this.ispendingInvestmentExist
        }
      });
    }
  }



  preview12BBForm(status) {
    if (status == 'parent') {
      this.enableUploadPopup = true
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
    this.uploadFormPoppopClose()

    this._financialYear = this.InvestmetnListGrp && this.InvestmetnListGrp.FinancialDetails.length > 0 && this.InvestmetnListGrp.FinancialDetails[0].FinancialCode ? this.InvestmetnListGrp.FinancialDetails[0].FinancialCode : 0

    // if (this.Lstdeduction_Exemption && this.Lstdeduction_Exemption.length > 0) {
    //   this._hraDetails = this.Lstdeduction_Exemption.find(a => (a.ProductId == 2));
    //   if (this._hraDetails && this._hraDetails.DocumentDetails.length > 0 && this._hraDetails.DocumentDetails[0].Status != 2) {
    //     let totalHraRent = 0
    //     for (let obj of this._hraDetails.AdditionalList) {
    //       totalHraRent += obj.RentAmountPaid
    //     }
    //     this._totalHraRent = totalHraRent
    //   }
    //   else {
    //     this._hraDetails = {}
    //   }
    // }


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
    $("#popup_preview_12BB_from").modal('show');
    console.log("rowspan value", this._rowSpan);

  }
  preview12BBClose() {
    if (this.enableUploadPopup == false) {
      $("#popup_preview_12BB_from").modal('hide');

    }
    else {
      $("#popup_preview_12BB_from").modal('hide');
      $("#popup_Form12BBUpload").modal('show');

    }
    this.enableUploadPopup = false;
  }



  modal_dismiss_docs() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs1").modal('hide');
  }




  form12BBDownload() {
    var data = document.getElementById('printid');
    const options = {
      margin: [30, 30, 30, 30],
      filename: "form_12bb.pdf",
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: {},
      jsPDF: { unit: 'pt', format: 'a4', orientation: "portrait" }
    }
    const content: Element = document.getElementById('printid');

    html2pdf().from(content).set(options).then(function (doc) {
      // $("#printid").css( { "font-size":"12px !important" });

    }).save();
  }

  doDeleteFile() {
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
          this.deleteAsync();

        }
        else {
          this.FileName = null;
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
  deleteAsync() {
    this.loadingScreenService.startLoading();
    //this.Customloadingspinner.show();
    //this.isLoading = false;
    // this.spinnerText = "Deleting";
    this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          this.FileName = null;
          this.DocumentId = 0;
          var employeeinvestmentMaster = new EmployeeInvestmentMaster();
          employeeinvestmentMaster.PersonId = 0;
          employeeinvestmentMaster.EmployeeId = this.EmployeeId;
          employeeinvestmentMaster.FinancialYearId = this.employeeForm.get('financialYear').value,
            employeeinvestmentMaster.ModuleProcessTransactionId = 0;
          employeeinvestmentMaster.SlotClosureDate = '1900-01-01'
          employeeinvestmentMaster.Status = 1;
          employeeinvestmentMaster.Id = 0;
          employeeinvestmentMaster.SummaryDocumentId = this.DocumentId
          let EmpDetails = new EmployeeModel();
          EmpDetails.oldobj = { ...this.employeedetails }
          this.employeedetails.EmployeeInvestmentMaster = employeeinvestmentMaster;
          EmpDetails.newobj = { ...this.employeedetails }

          var Employee_request_param = JSON.stringify(EmpDetails);

          this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {

            if (data && data.Status) {
              this.loadingScreenService.stopLoading();
              // this.Customloadingspinner.hide();

              // this.isLoading = true;
              this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
            }
            else {
              this.loadingScreenService.stopLoading();
              //this.Customloadingspinner.hide();
              this.alertService.showWarning(`Something is wrong!  ${data.Message}`);
              console.log("Something is wrong! : ", data.Message);
            }
          },
            (err) => {
              this.loadingScreenService.stopLoading();
              //this.Customloadingspinner.hide();
              this.alertService.showWarning(`Something is wrong!  ${err}`);
              console.log("Something is wrong! : ", err);
            });


        } else {
          this.loadingScreenService.stopLoading();
          // this.Customloadingspinner.hide();
          //this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
        }
      } catch (error) {
        this.loadingScreenService.stopLoading();
        //this.Customloadingspinner.hide();
        //this.isLoading = true;
        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }
    }), ((err) => {
    })
  }
  Formupload(status) {
    this._formSumbitStatus = status;
  }
  fileUploadConfirmation(filebytes, filename) {
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
          this.doAsyncUpload(filebytes, filename);

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
    this.objectApi.downloadObjectAsBlob(this.summaryDocumentId)
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


  // 17.1
  OnChangeFinYear(eventValue) {
    // this.FinId = eventValue
    this._SelectedFinId = eventValue;
    this.GetEmployeeRequiredInvestmentDetails().then((obj1) => {
      this._loadEmpUILookUpDetails().then((obj2) => {
        this.employeeForm.controls['financialYear'].setValue(eventValue);
        this.patchEmployeeDetails();
        this.trigger_investmentproducts_binding();
        this.load_preinsertedRecords();
      });
    });

  }

}
