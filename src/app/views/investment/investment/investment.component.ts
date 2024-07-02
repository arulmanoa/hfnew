import { Component, OnInit, Input, TemplateRef, ViewChild, ViewEncapsulation, ElementRef, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';
import { id } from 'date-fns/locale';
import _, { min, propertyOf } from 'lodash';
import moment from 'moment';
import { NzDrawerPlacement, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { PaymentstatusComponent } from 'src/app/shared/modals/payroll/paymentstatus/paymentstatus.component';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { apiResult } from 'src/app/_services/model/apiResult';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { Relationship } from 'src/app/_services/model/Base/HRSuiteEnums';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { EmployeeDetails, EmployeeInvestmentMaster, EmployeeMenuData, EmployeePayrollSummaryDetails, HouseRentType, HtmlToPDFSrc } from 'src/app/_services/model/Employee/EmployeeDetails';
import { EmployeeHouseRentDetails } from 'src/app/_services/model/Employee/EmployeeHouseRentDetails';
import { EmployeeInvesmentDependentDetails, EmployeeInvestmentDeductions, EmployeeInvestmentDocuments, InvestmentLogHistory } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { ApprovalStatus } from 'src/app/_services/model/OnBoarding/QC';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { AlertService, EmployeeService, ESSService, ExcelService, FileUploadService, HeaderService, PagelayoutService, PayrollService, SessionStorage } from 'src/app/_services/service';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { environment } from 'src/environments/environment';
import { RowDataService } from '../../personalised-display/row-data.service';
import { HousePropertyModalComponent } from '../shared/modals/house-property-modal/house-property-modal.component';
import { ManageinvestmentComponent } from '../shared/modals/manageinvestment/manageinvestment.component';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FileSaver from 'file-saver';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { PageLayout } from '../../personalised-display/models';
import { DataSourceType, SearchPanelType } from '../../personalised-display/enums';
import { ExemptionModalComponent } from '../shared/modals/exemption-modal/exemption-modal.component';
import { PerquisitesModalComponent } from '../shared/modals/perquisites-modal/perquisites-modal.component';
import { OtherincomeModalComponent } from '../shared/modals/otherincome-modal/otherincome-modal.component';
import { InvestmentpreviewmodalComponent } from '../shared/modals/investmentpreviewmodal/investmentpreviewmodal.component';
import { SharedDataService } from 'src/app/_services/service/share.service';
import { TaxcalculatorComponent } from '../taxcalculator/taxcalculator.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PreviousEmploymentComponent } from '../../ESS/ess/previous-employment/previous-employment.component';
import { PreviousEmploymentModalComponent } from '../shared/modals/previous-employment-modal/previous-employment-modal.component';

export interface multipleDocsObject {
  FileName: any;
  DocumentId: any;
  Status: number;
  ApprovedAmount: any
}

export interface TaxInvestmentsSummary {
  TaxInvestmentName: string;
  Text: string;
  QualifyingAmount: number | any,
  AmountDeclared: number | any,
  AmountApproved: number | any,
  ImgURL: any;
  ColorCode: any;
  Code: string;
  IsRejected: boolean,

}

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
  // encapsulation: ViewEncapsulation.Emulated
})

export class InvestmentComponent implements OnInit, OnDestroy {


  @ViewChild('myInput')
  myInputVariable: ElementRef;
  private destroy$: Subject<void> = new Subject<void>();


  LstTaxInvestmentsSummary: TaxInvestmentsSummary[] = [
    {
      TaxInvestmentName: "Investment",
      Text: `Use this provision to submit your investment details related to Sections 80C, 80CCC, 80CCD (1), 80CCD (1B)  like LIC, NSC, HLPR, NPS, etc
      The total Amount Invested will be shown against the Qualifying Amount. `,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'investment-img.svg',
      ColorCode: '#20BB9D',
      Code: 'INVT',
      IsRejected: false,

    },
    {
      TaxInvestmentName: "Medi Claim Deductions",
      Text: `Use this provision to claim deductions in respect to mediclaim, health check up, medical expenditure details under Sections 80D, 80DD
      The total Amount Claimed will be shown against the Qualifying Amount.`,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'deduction-img.svg',
      ColorCode: '#FFC872',
      Code: 'DEDUT',
      IsRejected: false,

    },
    {
      TaxInvestmentName: "Exemptions",
      Text: `Use this provision to claim exemptions related to Section 10 like LTA, Vehicle Reimbursement, PDR, etc.
      Note: HRA exemption claim has to be done under the House Rent Allowance option`,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'exemption-img.svg',
      ColorCode: '#E1E1E1',
      Code: 'EXMPT',
      IsRejected: false,

    },
    {
      TaxInvestmentName: "House Rent Allowance",
      Text: `Use this provision to claim HRA exemption. The qualifying amount is the least of the below three conditions,
      (1) Annual HRA Received
      (2) Annual Rent - (1/10th) of Annual Basic
      (3) 40% or 50% of Annual Basic depending on Metro city`,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'hra-img.svg',
      ColorCode: '#E1E1E1',
      Code: 'HRA',
      IsRejected: false,

    },
    {
      TaxInvestmentName: "House Property",
      Text: `Use this provision to claim Loss from House Property. First time house buyers who have availed housing loans between 1st April 2019 and 31st March 2022 are eligible to claim an additional deduction of interest payment 1,50,000/- under Section 80 EEA. Loans availed from 1st April 2017 by first time home buyers are eligible to claim an additional deduction of interest payment 50,000/- under Section 80EE.`,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'houseproperty-img.svg',
      ColorCode: '#20BB9D',
      Code: 'HP',
      IsRejected: false,

    },
    {
      TaxInvestmentName: "Perquisites",
      Text: `Use this provision to claim Loss from House Property. First time house buyers who have availed housing loans between 1st April 2019 and 31st March 2022 are eligible to claim an additional deduction of interest payment 1,50,000/- under Section 80 EEA. Loans availed from 1st April 2017 by first time home buyers are eligible to claim an additional deduction of interest payment 50,000/- under Section 80EE.`,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'perquisites-img.png',
      ColorCode: '#20BB9D',
      Code: 'PERQ',
      IsRejected: false,

    },
    {
      TaxInvestmentName: "Other Income",
      Text: `Use this provision to claim Loss from House Property. First time house buyers who have availed housing loans between 1st April 2019 and 31st March 2022 are eligible to claim an additional deduction of interest payment 1,50,000/- under Section 80 EEA. Loans availed from 1st April 2017 by first time home buyers are eligible to claim an additional deduction of interest payment 50,000/- under Section 80EE.`,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'other-income-img.png',
      ColorCode: '#20BB9D',
      Code: 'INCM',
      IsRejected: false,

    },
    {
      TaxInvestmentName: "Previous Employment",
      Text: `Previous employment details refer to the information about an employee's work history before joining the current organization. The information includes details such as the name of the previous employer, job title, employment dates, income and deductions done by the previous employer pertaining to the current financial year.`,
      QualifyingAmount: 0,
      AmountDeclared: 0,
      AmountApproved: 0,
      ImgURL: 'prev-emp.png',
      ColorCode: '#81b5e6',
      Code: 'PE',
      IsRejected: false,

    }
  ];

  TaxTotalQualifyingAmount: number = 0;
  TaxTotalDeclaredAmount: number = 0;
  TaxTotalApprovedAmount: number = 0;
  IsNewTaxRegimeOpted: boolean = false;
  IsTaxRegimeDisabled: boolean = false;
  _Designation: any; _DOJ: any;
  isResigned: boolean = false;
  // LISTING COMPONENT DECLARATIONS
  EmployeeId: number = 0;
  LstEmployeeInvestmentLookup: EmployeeLookUp;
  currentFinYear: number = 0;
  selectedFinYear: number = 0;
  currentTaxMode: number = 0; // 1 : DECLARATION | 2: PROOF
  BusinessType: number = 0;
  CompanyId: number = 0;
  RoleCode: string = '';
  ImplementationCompanyId: number = 0;
  RoleId: number = 0;
  UserId: number = 0;
  loginSessionDetails: LoginResponses;
  employeedetails: EmployeeDetails;
  employeeModel: EmployeeModel = new EmployeeModel();
  spinner: boolean = true;
  isESSLogin: boolean = false;
  FinancialStartDate: any = moment();
  FinancialEndDate: any = moment();
  InvalidFields = [];
  modalOption: NgbModalOptions = {};
  IsSaved: boolean = false;
  // DRAWER COMPONENT DECLARATIONS
  visible_slider: boolean = false;
  visible_slider_hra: boolean = false;
  visible_slider_medical: boolean = false;

  DeclarationTitle: string = '';
  drawerWidth: string = "0";
  LstAllDeclarationProducts = [];
  LstDeclarationCategories = [];
  selectedCategory: any = null;
  sectionName: string = "-";
  sectionDescription: string = "-";
  sectionQualifyingAmount: number = 0;
  DeclaredAmount: number = 0;
  DeclaredAmountRemarks: string = "";
  tobeShown: number = 8;
  seeMoreText: any = "See more";

  DeclarationItems = [];
  isLoading: boolean = true;
  LstmultipleDocs: multipleDocsObject[] = [];
  unsavedDocumentLst = [];
  selectedRow: number;
  selectedUploadIndex: number;
  selectedTaxDeclaration: TaxCodeType;
  TotalDeclaredAmount: number = 0;
  TotalApprovedAmount: number = 0;
  LstemployeeInvestmentDeductions: EmployeeInvestmentDeductions[] = [];
  docSpinnerText: string = "Uploading";

  // HOUSE RENT
  LstHouseRentAllowance: any[] = [];
  EntryType = [{ Id: 1, Name: "Annual" }, { Id: 2, Name: "Quarter" }, { Id: 3, Name: "Month" }, { Id: 4, Name: "Custom" }];
  selectedEntryType: string = "annual";
  HRA_Annual_Basic: number = 0;
  HRA_Annual: number = 0;
  LstemployeeHouseRentDetails: EmployeeHouseRentDetails[] = [];
  previousselectedEntryType: string = "annual";
  HRAminDate = new Date();
  HRAmaxDate = new Date();
  deletedLstHouseRentAllowance = [];
  IsFailedToValidate: boolean = false;
  isPanMandatoryForHRA: boolean = false;
  IsHRADataExists: boolean = false;
  isHRAAllowedToEdit: boolean = true;
  isDuplicateRange: boolean = false;

  // MEDICAL EXPENDITURE
  relationship: any = [];
  LstDependent = [];
  DependentName: string = "";
  Relationship: string = null;
  DateOfBirth: any;
  MedicalDependentId: any;
  IsDependentAdded: boolean = false;
  selectedMedicalInsurantTab: any = "";
  LstMedicalInsuranceProduct = [];
  LstMedicalDependent = [];
  DependentType = [{ Id: 1, Name: "Self" }, { Id: 2, Name: "Immediate Dependents" }, { Id: 3, Name: "Parents more than 60 years old" }];
  lstDisabilityPercentage = [{
    Id: 1, Name: "more than 40% but less than 80%"
  }, { Id: 2, Name: "more than 80%" }];
  lstAgeofDependent = [{ Id: 2, Name: "less than or equal to 60 years of age" }, { Id: 3, Name: "more than 60 years of age" }];
  LstEmpInvDepDetails: EmployeeInvesmentDependentDetails[] = [];
  IsOpenDependentCard: boolean = false;


  // WORKFLOW
  ispendingInvestmentExist: boolean = false;
  isInvestmentUnderQC: boolean = false;
  isInvestmentQcRejected: boolean = false;
  summaryDocumentId: number = 0;
  indicateSubmissionSlotEnddate: boolean = false;
  indicateSubmissionSlotIsAfter: boolean = false;
  indicateSubmissionSlotIsBefore: boolean = false;
  LstInvestmentSubmissionSlot = [];
  InvestmentClosedDate = new Date();
  IsPriorDOJ: boolean = false;
  IsNoSubmissionSlotExists: boolean = false;

  // TAX EXEMPTION 
  LstTaxExemptionProduct = [];
  popupTaxBills: any = [];

  HPChildProducts = [];
  StampDutyFeeProduct = [];
  IsExemptionCardRequired: boolean = true;
  // FORM 12BB
  _empAddress: any = ""
  jsonObject = {
    rowSpan: 7,
    _totalHRAAmount: 0,
    _exemptionDetails: [],
    _hpDetails: [],
    _otherSec: [],
    _section80CPFPT: [],
    Section80C_Output: [],
    Section80CCC_Output: [],
    Section80CCD_Output: [],
    NotSection80C_Output: [],
    _hraDetails: []
  };
  sec10NameForForm12BB: string = environment.environment.sec10NameForForm12BB;
  ltaRowspan: any;
  visible_slider_form12bb: boolean = false;
  FinancialYearDescription: string = '';
  Form12BBGeneratedDate = moment(new Date()).format('DD/MM/YYYY');
  Form12BBFileName: string = "";
  Form12BBFileUrl: any = null;

  ISTTime = new Date();
  EnddateminDate = new Date()
  // tax slip
  CompanyName: any;
  monthList = [{ id: 1, name: 'January' }, { id: 2, name: "February" }, { id: 3, name: "March" },
  { id: 4, name: "April" }, { id: 5, name: "May" }, { id: 6, name: "June" }, { id: 7, name: "July" }, { id: 8, name: "August" },
  { id: 9, name: "September" }, { id: 10, name: "October" }, { id: 11, name: "November" }, { id: 12, name: "December" }];
  yearList = [{ id: 2019, name: '2019' }, { id: 2020, name: "2020" }, { id: 2021, name: "2021" }]
  month: any; year: any; period: any;
  pageLayout: PageLayout = null;
  dataset = [];
  EmployeeTaxSlipRecords: any;
  LstAnnualSalary = [];
  LstHRA: any
  LstDeductions = [];
  LstIncomeFromHouseProperty = [];
  LstSavings = []; LstSavingsWithGroupBy = [];
  HRAExemption = [];
  GrossHRAExemption = [];
  OtherExemption = [];
  EmpDetails: any;
  TaxCodeList = [];
  ProductList = [];
  diffDuration: any = 0;
  IsNewTaxRegime: boolean = false;
  empCode: any;
  isEssLogin: boolean = false;
  locationhref: string = "";
  finacialYearId: any;
  showSliderForTaxSlip: boolean = false;

  currentMonth: number = 0;
  CurrentFinRegimeCount: number = 0;
  isJoiningWithinFinancialYear: boolean = false;
  InvestmentWarningMessage = environment.environment.InvestmentWarningMessage;

  IsAllen: boolean = false;
  ExemptionCardText = environment.environment.ExemptionCardText;
  HRASectionText: string = "Section 10 (13A)";
  addNewConfigNewRegime: Array<string> = environment.environment.AllowableInvestmentCodeForAddNewBtnWithNewRegime || [];

  constructor(private drawerService: NzDrawerService,
    private essService: ESSService,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private fileuploadService: FileUploadService,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private investmentService: InvestmentService,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private router: Router,
    private UtilityService: UtilityService,
    private excelService: ExcelService,
    private attendanceService: AttendanceService,
    private pageLayoutService: PagelayoutService,
    private payrollService: PayrollService,
    private sharedDataService: SharedDataService
  ) {
    this.pageLayout = {
      Description: "PageLayout",
      Code: "PageLayout",
      CompanyId: 1,
      ClientId: 2,
      SearchConfiguration: {
        SearchElementList: [
        ],
        SearchPanelType: SearchPanelType.Panel
      },
      GridConfiguration: {
        ColumnDefinitionList: [],
        DataSource: {
          Type: DataSourceType.View,
          Name: 'PageLayout'
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
        PageTitle: "PageLayout",
        BannerText: "PageLayout",
      }
    }
  }

  ngOnInit() {

    console.log('Entered');

    this.spinner = true;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
    this.RoleCode = this.loginSessionDetails.UIRoles[0].Role.Code;

    this.ImplementationCompanyId = this.loginSessionDetails.ImplementationCompanyId;
    this.RoleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.loginSessionDetails.UserSession.UserId;
    this.GetISTServerTime().then(() => console.log("GET IST TIME - Task Complete!"));
    this.onRefresh();
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    //this.modalOption.windowClass = 'modal-aside-left';
  }

  onRefresh() {
    this.isInvestmentUnderQC = false;

    if (this.RoleCode !== 'Employee') {
      this.isESSLogin = false;
      this.route.data.subscribe(data => {

        if (data.DataInterface.RowData) {
          this.EmployeeId = data.DataInterface.RowData.Id;
        }

        if (sessionStorage.getItem('IsFromBillEntry') == 'true' && this.isESSLogin == false) {
          var j = sessionStorage.getItem("RowDataInterface")
          const routedata = JSON.parse(j);
          // this._EmployeeName = routedata.dataInterface.RowData.EmployeeName;
          // this._EmployeeCode = routedata.dataInterface.RowData.EmployeeCode;
          this.EmployeeId = routedata.dataInterface.RowData.Id;
        }

        this.rowDataService.dataInterface = {
          SearchElementValuesList: [],
          RowData: null
        }

      });
    } else {
      this.isESSLogin = true;
      this.EmployeeId = this.loginSessionDetails.EmployeeId;
    }

    // this.EmployeeId = 44307;
    this.isESSLogin == true ? this.empCode = sessionStorage.getItem('loginUserId') : null;
    if (this.EmployeeId == 0 && this.RoleCode == 'Employee') {
      this.router.navigate(['/app/dashboard']);
    } else if (this.EmployeeId == 0 && this.RoleCode != 'Employee') {
      this.confirmExit();
    }

    this.headerService.setTitle(this.isESSLogin ? 'My Investment' : 'Employee Investment');
    this.titleService.setTitle(this.isESSLogin ? 'My Investment' : 'Employee Investment');
    this.spinner = true;
    this.DeclarationItems = [];
    this.LoadEmployeInvestmentUILookupDetails();
    this.relationship = this.utilsHelper.transform(Relationship);
    this.relationship.push({ id: 0, name: 'Self' });
    this.relationship.sort((a, b) => a.id - b.id);
    // this.RoleCode = 'PayrollAdmin'; 
  }

  LoadEmployeInvestmentUILookupDetails(): void {
    this.essService.LoadEmployeInvestmentUILookupDetails(this.EmployeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        let apiResponse: apiResponse = result;

        try {
          if (apiResponse.Status) {
            this.handleApiResponseSuccess(apiResponse);
          } else {
          }
        } catch (error) {
          console.log('Exception LookUp Details :::: ', error);
        }
      });
  }

  private handleApiResponseSuccess(apiResponse: apiResponse): void {
    this.IsExemptionCardRequired = true;
    this.LstEmployeeInvestmentLookup = JSON.parse(apiResponse.dynamicObject);
    console.log('this.LstEmployeeInvestmentLookup >>>>>>>>>>>>>>>>> ', this.LstEmployeeInvestmentLookup);

    this.LstAllDeclarationProducts = this.LstEmployeeInvestmentLookup != null ? this.LstEmployeeInvestmentLookup.InvesmentProductList : [];
    this.LstTaxExemptionProduct = this.LstAllDeclarationProducts.filter(exe => exe.TaxCodeTypeId == TaxCodeType.Exemptions);
    this.currentFinYear = this.LstEmployeeInvestmentLookup.CurrentFinancialYear;

    this.currentTaxMode = this.LstEmployeeInvestmentLookup.InvestmentMode;
    this.LstMedicalInsuranceProduct = this.LstAllDeclarationProducts.filter(a => a.Code.toUpperCase().toString() == 'SEC80DD' || a.Code.toUpperCase().toString() == 'SEC80DDB' || a.Code.toUpperCase().toString() == "SEC80D" || a.Code.toUpperCase().toString() == 'SEC80D_S' || a.Code.toUpperCase().toString() == 'SEC80D_P');
    this.LstMedicalInsuranceProduct = this.LstMedicalInsuranceProduct.filter(b => b.ProductCode.toUpperCase().toString() != 'FIXEDINSURANCE');

    this.LstMedicalInsuranceProduct = _.orderBy(this.LstMedicalInsuranceProduct, ['DisplayOrder'],
      ['asc']);

    this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.forEach(j => {
      j["IsInvalid"] = false;
    });

    console.log('this.LstMedicalInsuranceProduct', this.LstMedicalInsuranceProduct);

    this.CurrentFinRegimeCount = this.LstEmployeeInvestmentLookup.CurrentFinRegimeCount;
    this.HPChildProducts = this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.filter(pro => environment.environment.HousePropertiesChildProductCodes.includes(pro.ProductCode.toUpperCase())) : [];
    this.StampDutyFeeProduct = this.HPChildProducts.length > 0 && this.HPChildProducts.filter(a => a.Code.toUpperCase().toString() == 'SEC80C').length > 0
      ? this.HPChildProducts.filter(a => a.Code.toUpperCase().toString() == 'SEC80C') : [];

    if (this.currentTaxMode == 1 && this.BusinessType != 3 && this.RoleCode == 'Employee') { // Declaration only
      this.IsExemptionCardRequired = this.LstEmployeeInvestmentLookup.IsExemptionCardRequired;
    }
    this.isJoiningWithinFinancialYear = false;
    this.selectedFinYear = this.currentFinYear;
    this.GetCurrentFinancialYearStartEndDate();
    this.GetHRATaxItems();
    this.GetEmployeeRequiredDetailsById(this.currentFinYear);
  }


  CalculateQualifyingAmount() {

    try {

      this.LstTaxInvestmentsSummary.forEach(i => {
        var sum = 0;
        var sum1 = 0;
        if (i.Code == 'INVT') {
          let Product = this.LstAllDeclarationProducts.find(a => a.Code.toUpperCase().toString() == 'SEC80C');
          // this.DeclarationItems.forEach(e => { if (e.Declarations.TaxCodeTypeId == TaxCodeType.Investment) { sum += parseInt(e.DeclaredAmount) } });
          // this.DeclarationItems.forEach(e => { if (e.Declarations.TaxCodeTypeId == TaxCodeType.Investment) { sum1 += parseInt(e.ApprovedAmount) } });

          let _investmentProduct = this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.find(x => x.ProductId != a.ProductID))

          _investmentProduct.length > 0 ? _investmentProduct = _investmentProduct.filter(x => !this.StampDutyFeeProduct.filter(y => y.ProductId == x.ProductID).length) : true;
          // _investmentProduct.length > 0 ?  _investmentProduct = _investmentProduct.filter(a => .includes(a.ProductID)) : true;
          _investmentProduct.length > 0 && _investmentProduct.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.LstEmpInvDepDetails.length == 0 && (e.EHPId == null || e.EHPId <= 0)) { sum += parseInt(e.Amount.toString()) } });
          _investmentProduct.length > 0 && _investmentProduct.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.LstEmpInvDepDetails.length == 0 && e.ApprovedAmount != null && (e.EHPId == null || e.EHPId <= 0)) { sum1 += parseInt(e.ApprovedAmount.toString()) } });

          i.QualifyingAmount = Product.ThresholdLimit,
            i.AmountDeclared = sum,
            i.AmountApproved = sum1
        }
        else if (i.Code == 'DEDUT') {
          // this.LstMedicalDependent.forEach(e => { sum += parseInt(e.MedicalAmount) });
          // this.LstMedicalDependent.forEach(e => { sum1 += parseInt(e.ApprovedAmount) });

          let _mediclaimProduct = this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.find(x => x.ProductId == a.ProductID))
          _mediclaimProduct.length > 0 && _mediclaimProduct.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { sum += parseInt(e.Amount.toString()) } });
          _mediclaimProduct.length > 0 && _mediclaimProduct.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.ApprovedAmount != null) { sum1 += parseInt(e.ApprovedAmount.toString()) } });

          console.log('_investmentProduct', _mediclaimProduct);
          i.QualifyingAmount = this.LstMedicalInsuranceProduct[0].ThresholdLimit;
          i.AmountDeclared = sum,
            i.AmountApproved = sum1
        }
        else if (i.Code == 'HRA') {

          this.employeedetails.LstemployeeHouseRentDetails.length > 0 && this.employeedetails.LstemployeeHouseRentDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { sum += parseInt(e.RentAmount.toString()) } });
          this.employeedetails.LstemployeeHouseRentDetails.length > 0 && this.employeedetails.LstemployeeHouseRentDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.ApprovedAmount != null) { sum1 += parseInt(e.ApprovedAmount.toString()) } });

          i.QualifyingAmount = this.HRA_Annual;
          i.AmountDeclared = sum,
            i.AmountApproved = sum1
        }
        else if (i.Code == "EXMPT") {

          this.employeedetails.LstEmployeeTaxExemptionDetails != null &&
            this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 &&
            this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { sum += parseInt(Number(e.Amount).toString()) } });

          this.employeedetails.LstEmployeeTaxExemptionDetails != null &&
            this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 &&
            this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.ApprovedAmount != null) { sum1 += parseInt(Number(e.ApprovedAmount).toString()) } });

          i.QualifyingAmount = 0;
          i.AmountDeclared = sum,
            i.AmountApproved = sum1
        }
        else if (i.Code == 'HP') {
          this.employeedetails.LstEmployeeHousePropertyDetails != null &&
            this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 &&
            this.employeedetails.LstEmployeeHousePropertyDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { sum += this.getCalculatedInvestedAmount(e) } });

          this.employeedetails.LstEmployeeHousePropertyDetails != null &&
            this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 &&
            this.employeedetails.LstEmployeeHousePropertyDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.GrossAnnualValueApprovedAmount != null) { sum1 += this.getCalculatedApprovedAmount(e) } });

          i.QualifyingAmount = 200000;
          i.AmountDeclared = sum,
            i.AmountApproved = sum1 > i.QualifyingAmount ? i.QualifyingAmount : sum1


        }
        else if (i.Code == 'PERQ') {

          this.employeedetails.LstemployeePerquisitesDetails != null &&
            this.employeedetails.LstemployeePerquisitesDetails.length > 0 &&
            this.employeedetails.LstemployeePerquisitesDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.ApprovedAmount != null) { sum1 += (parseInt(Number(e.ApprovedAmount).toString())) } });

          i.QualifyingAmount = 0;
          i.AmountDeclared = 0,
            i.AmountApproved = sum1


        }
        else if (i.Code == 'INCM') {

          this.employeedetails.LstemployeeOtherIncomeSources != null &&
            this.employeedetails.LstemployeeOtherIncomeSources.length > 0 &&
            this.employeedetails.LstemployeeOtherIncomeSources.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { sum += (e.InterestIncomeType == 3 ? parseInt(Number(e.OtherIncomeAmount).toString()) : parseInt(Number(e.TotalInterestAmount).toString())) } });

          this.employeedetails.LstemployeeOtherIncomeSources != null &&
            this.employeedetails.LstemployeeOtherIncomeSources.length > 0 &&
            this.employeedetails.LstemployeeOtherIncomeSources.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.TotalApprovedInterestAmount != null) { sum1 += (e.InterestIncomeType == 3 ? parseInt(Number(e.ApprovedOtherIncomeAmount).toString()) : parseInt(Number(e.TotalApprovedInterestAmount).toString())) } });

          i.QualifyingAmount = 0;
          i.AmountDeclared = sum,
            i.AmountApproved = sum1


        }
      });
      this.TaxTotalQualifyingAmount = 0;
      this.TaxTotalDeclaredAmount = 0;
      this.TaxTotalApprovedAmount = 0;
      this.LstTaxInvestmentsSummary.forEach(e => { this.TaxTotalQualifyingAmount += parseInt(e.QualifyingAmount) });
      this.LstTaxInvestmentsSummary.forEach(e => { this.TaxTotalDeclaredAmount += parseInt(e.AmountDeclared) });
      this.LstTaxInvestmentsSummary.forEach(e => { this.TaxTotalApprovedAmount += parseInt(e.AmountApproved) });

      this.toenableRejectionText();
    } catch (error) {
      console.log('EXE SUMMARY :::', error);

    }
  }

  getCalculatedInvestedAmount(item) {
    const { LetOut, GrossAnnualValue, MunicipalTax, InterestAmount } = item;
    const calculatedAmt = LetOut
      ? Math.abs((GrossAnnualValue - MunicipalTax) - ((GrossAnnualValue - MunicipalTax) * 0.3) - InterestAmount)
      : Math.abs(InterestAmount);

    return calculatedAmt;
  }

  getCalculatedApprovedAmount(item) {
    const { LetOut, GrossAnnualValueApprovedAmount, MunicipalTaxApprovedAmount, InterestAmountApprovedAmount } = item;
    const calculatedAmt = LetOut
      ? Math.abs((GrossAnnualValueApprovedAmount - MunicipalTaxApprovedAmount) - ((GrossAnnualValueApprovedAmount - MunicipalTaxApprovedAmount) * 0.3) - InterestAmountApprovedAmount)
      : Math.abs(InterestAmountApprovedAmount);

    return calculatedAmt;
  }

  // getCalculatedInvestedAmount(item) {
  //   var calculatedAmt = item.LetOut == true ?
  //     (Number(item.GrossAnnualValue) - Number(item.MunicipalTax)) - ((Number(item.GrossAnnualValue) - Number(item.MunicipalTax)) * 30 / 100) - Number(item.InterestAmount)
  //     : Number(item.InterestAmount);
  //   return Math.abs(calculatedAmt);
  // }

  // getCalculatedApprovedAmount(item) {
  //   var calculatedAmt = item.LetOut == true ?
  //     (Number(item.GrossAnnualValueApprovedAmount) - Number(item.MunicipalTaxApprovedAmount)) - ((Number(item.GrossAnnualValueApprovedAmount) - Number(item.MunicipalTaxApprovedAmount)) * 30 / 100) - Number(item.InterestAmountApprovedAmount)
  //     : Number(item.InterestAmountApprovedAmount);
  //   return Math.abs(calculatedAmt);
  // }



  getColor(index: number): string {
    switch (index) {
      case 0: return "#20BB9D"
      case 1: return "#727fff"
      case 2: return "#FFC872"
      case 3: return "#E1E1E1"
      case 4: return "#20BB9D"
      case 5: return "#ff7272"
      case 6: return "#ffbb72"
      default: return "#E1E1E1"
    }
  }

  getColorCodeValueEvent(D, Q, A, layer) {
    var DA_percentage = layer == 'A' ? Number(A) == 0 ? 0 : (Number(A) / Number(Q) * 100 % 100) == 0 ? 100 : (Number(A) / Number(Q) * 100 % 100) : Number(D) == 0 ? 0 : (Number(D) > Number(Q)) ? 100 : (Number(D) / Number(Q) * 100 % 100);
    return { 'width': DA_percentage + '%' };
  }

  GetISTServerTime() {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetISTServerTime()
        .pipe(takeUntil(this.destroy$))
        .subscribe((response) => {

          let apiR: apiResult = response;
          if (apiR.Status) {
            this.ISTTime = new Date(apiR.Result);
          }
          res(true);

        })
    });
    return promise;
  }

  //   GetCurrentFinancialYearStartEndDate() {
  //     console.log('IST TIME ::', this.ISTTime);
  //     const today = new Date(this.ISTTime);

  //     let stdate;
  //     let endate;
  //     if (today.getMonth() > 2) {
  //       stdate = new Date(today.getFullYear(), 3, 1);
  //       endate = new Date(today.getFullYear() + 1, 2, 1);
  //     } else {
  //       const year = today.getFullYear() - 1;
  //       stdate = new Date(year, 3, 1);
  //       endate = new Date(year + 1, 2, 1);
  //     }

  //     const selectedFiscalYear = this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id === this.selectedFinYear);

  //     this.FinancialStartDate = moment(selectedFiscalYear.StartDate).format('YYYY-MM-DD');
  //     this.FinancialEndDate = moment(selectedFiscalYear.EndDate).format('YYYY-MM-DD');

  //     this.FinancialStartDate = new Date(this.FinancialStartDate);
  //     this.FinancialEndDate = new Date(this.FinancialEndDate);

  //     // this.FinancialStartDate = moment(stdate).startOf('month').format('YYYY-MM-DD');
  //     // this.FinancialEndDate = moment(endate).endOf('month').format('YYYY-MM-DD');

  //     this.HRAminDate = new Date(this.FinancialStartDate);
  //     this.HRAmaxDate = new Date(this.FinancialEndDate);

  //     this.HRAmaxDate.setFullYear(this.FinancialEndDate.getFullYear());
  //     this.HRAminDate.setFullYear(this.FinancialStartDate.getFullYear());
  // }



  GetCurrentFinancialYearStartEndDate() {  // modified
    console.log('IST TIME ::', this.ISTTime);
    let today = new Date(this.ISTTime);
    let currentMonth = today.getMonth() + 1;
    console.log('Current Month ::: ', currentMonth);

    let startMonth = currentMonth > 2 ? 3 : 4;
    const endMonth = currentMonth > 2 ? 2 : 3;
    const startYear = currentMonth > 2 ? today.getFullYear() : today.getFullYear() - 1;

    const stdate = new Date(startYear, startMonth, 1);
    const endate = new Date(startYear + 1, endMonth, 1);

    this.FinancialStartDate = moment(this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id == this.selectedFinYear).StartDate).format('YYYY-MM-DD');
    this.FinancialEndDate = moment(this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id == this.selectedFinYear).EndDate).format('YYYY-MM-DD');
    this.FinancialStartDate = new Date(this.FinancialStartDate);
    this.FinancialEndDate = new Date(this.FinancialEndDate);

    const isInRange = moment(this._DOJ).isBetween(this.FinancialStartDate, this.FinancialEndDate, null, '[]');
    const isSameAsStartDate = moment(this._DOJ).isSame(this.FinancialStartDate);
    const isSameAsEndDate = moment(this._DOJ).isSame(this.FinancialEndDate);
    if (isInRange || isSameAsStartDate || isSameAsEndDate) {
      this.isJoiningWithinFinancialYear = true;
    }

    this.HRAminDate = new Date(this.FinancialStartDate);
    this.HRAmaxDate = new Date(this.FinancialEndDate);



    console.log('Start Date:', this.HRAminDate);
    console.log('End Date:', this.HRAmaxDate);
  }

  // Get HRA Tax Items: Annual Basic, Annual HRA 

  GetHRATaxItems() {
    if (this.LstEmployeeInvestmentLookup.TaxItems.find(a => a.ProductCode.toUpperCase() == 'BASIC') != undefined) {
      this.HRA_Annual_Basic = 0;
      this.HRA_Annual_Basic = this.getAmountForProductCode('BASIC');
    }
    if (this.LstEmployeeInvestmentLookup.TaxItems.find(a => a.ProductCode.toUpperCase() == 'HRA') != undefined) {
      this.HRA_Annual = 0;
      this.HRA_Annual = this.getAmountForProductCode('HRA');
    }
  }

  getAmountForProductCode(productCode: string): number {
    const taxItem = this.LstEmployeeInvestmentLookup.TaxItems.find(item => item.ProductCode.toUpperCase() == productCode);
    return taxItem ? taxItem.Amount : 0;
  }


  getValidToShowInvestment(product) {
    return (this.BusinessType == 1 && Number(environment.environment.ACID) == Number(this.employeedetails.EmploymentContracts[0].ClientId) && environment.environment.NotRequiredInvestmentCards.includes(product.Code)) ? false :

      (product.Code == 'PE' && !this.isJoiningWithinFinancialYear) ? false : (this.RoleCode == 'Employee' && product.Code == 'PERQ') ? false : true;
  }


  showExemptionCard(product) {
    return product.Code == 'EXMPT' ? this.IsExemptionCardRequired : true;
  }

  GetEmployeeRequiredDetailsById(currentFinYear) {
    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments, currentFinYear)
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          this.spinner = false;
          const apiR: apiResult = result;
          if (apiR.Status === true) {
            try {
              this.employeedetails = apiR.Result as any;
              this.employeeModel.oldobj = Object.assign({}, result.Result);

              const employmentContract = this.employeedetails.EmploymentContracts.find(a => [1, 0, 2].includes(a.Status));
              this._DOJ = this.UtilityService.isNotNullAndUndefined(employmentContract) ? employmentContract.StartDate : '---';
              this._Designation = this.UtilityService.isNotNullAndUndefined(employmentContract) ? employmentContract.Designation : '---';
              this._Designation = this._Designation === 'NULL' ? '---' : this._Designation;
              this.isResigned = this.employeedetails.EmploymentContracts[0].IsResigned;

              const isCurrentMonth =
                this.LstEmployeeInvestmentLookup.InvestmentSlotMonthsForResignedEmployee != null &&
                this.LstEmployeeInvestmentLookup.InvestmentSlotMonthsForResignedEmployee.includes(this.currentMonth);

              if (this.isResigned && isCurrentMonth) {
                this.isResigned = false;
              }

              this.IsPriorDOJ = false;
              if (this.currentTaxMode === 1) {
                this.CheckNewJoineeDeclaratinModeDOJ();
              }

              this.IsAllen = this.BusinessType == 1 && Number(environment.environment.ACID) == Number(this.employeedetails.EmploymentContracts[0].ClientId) ? true : false;

              this.doPushOldDeclarationData();
              this.doPushOldHRAData();
              this.doPushOldMedicalExpenditureData();
              this.CalculateQualifyingAmount();

              console.log('EMP GET :::: ', this.employeedetails);
              this.getInvestmentWorkflowStatus();
              this.doCheckSubmissionSlotDate();

              this.IsNewTaxRegimeOpted =
                this.employeedetails != null &&
                  this.employeedetails.EmploymentContracts.length > 0 ?
                  this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted :
                  true;

              this.IsTaxRegimeDisabled = this.CurrentFinRegimeCount > 0;

              this.toenableSaveAndSubmitButton();

              resolve(true);
              return;
            } catch (error) {
              console.log('EXE GET EMP REQUIRED DETAILS ::::', error);
            }
          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting an employee details`);
            this.confirmExit();
            return;
          }
        }, err => {
          resolve(false);
        });
    });
    return promise;
  }


  getInvestmentWorkflowStatus() {
    const investmentMaster = this.employeedetails.EmployeeInvestmentMaster;
    if (investmentMaster != null && investmentMaster.ModuleProcessTransactionId > 0 && investmentMaster.FinancialYearId == this.selectedFinYear) {
      this.isInvestmentUnderQC = investmentMaster.Status === ApprovalStatus.Pending;
      this.isInvestmentQcRejected = investmentMaster.Status === ApprovalStatus.Rejected;
      this.summaryDocumentId = this.isInvestmentUnderQC ? investmentMaster.SummaryDocumentId : 0 as any;
    }
  }

  // Declaration = 1,
  // Proof = 2

  doCheckSubmissionSlotDate() {


    var mode: any = this.currentTaxMode;
    var SlotClosureDate: any = null;
    var SlotStartDate: any = null;
    this.indicateSubmissionSlotEnddate = false;
    this.indicateSubmissionSlotIsAfter = false;
    this.IsNoSubmissionSlotExists = false;
    this.indicateSubmissionSlotIsBefore = false;
    var currentDate = moment(new Date(this.ISTTime)).format('YYYY-MM-DD');



    if (this.LstEmployeeInvestmentLookup != null && this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot != null && this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.length > 0 &&
      this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.find(a => a.Mode == mode) == undefined) {
      this.IsNoSubmissionSlotExists = true;
    }

    if (this.LstEmployeeInvestmentLookup != null && this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot != null && this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.length > 0 &&
      this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.find(a => a.Mode == mode) != undefined) {
      SlotClosureDate = new Date(this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.find(a => a.Mode == mode).EndDay);
    }
    if (this.LstEmployeeInvestmentLookup != null && this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot != null && this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.length > 0 &&
      this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.find(a => a.Mode == mode) != undefined) {
      SlotStartDate = new Date(this.LstEmployeeInvestmentLookup.InvestmentSubmissionSlot.find(a => a.Mode == mode).StartDay);
    }

    SlotStartDate = moment(SlotStartDate).format('YYYY-MM-DD');
    SlotClosureDate = moment(SlotClosureDate).format('YYYY-MM-DD');
    this.indicateSubmissionSlotEnddate = (moment(currentDate).isBetween(moment(SlotStartDate).format('YYYY-MM-DD'), moment(SlotClosureDate).format('YYYY-MM-DD'))); // true
    this.indicateSubmissionSlotIsAfter = (moment(SlotStartDate).isAfter() || moment(SlotClosureDate).isAfter(currentDate));
    this.indicateSubmissionSlotIsBefore = (moment(SlotStartDate)
      .isBefore(currentDate) || moment(SlotClosureDate)
        .isBefore(currentDate));

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
    this.InvestmentClosedDate = SlotClosureDate == 'Invalid date' ? '1900-01-01' : SlotClosureDate;

  }

  CheckNewJoineeDeclaratinModeDOJ() {
    let DOJ = this.employeedetails != null && this.employeedetails.EmploymentContracts != null && this.employeedetails.EmploymentContracts.length > 0
      ? this.employeedetails.EmploymentContracts[0].StartDate : null;
    if (DOJ != null) {
      var new_date = moment(DOJ, 'YYYY-MM-DD').add('days', environment.environment.AmountOfNewJoineeDOJCheckForInvestmentSlot);
      var currentDate = moment(new Date(this.ISTTime)).format('YYYY-MM-DD');
      this.IsPriorDOJ = (moment(currentDate).isBetween(moment(DOJ).format('YYYY-MM-DD'), moment(new_date).format('YYYY-MM-DD'))); // true
      if (moment(currentDate)
        .isSame(moment(new_date).format('YYYY-MM-DD'))) {
        this.IsPriorDOJ = true;
      }
    }
  }


  check_addingNewProduct() {
    const promise = new Promise((resolve, reject) => {
      if (this.isResigned) {
        resolve(true);
        return;
      }
      if (this.investmentService.PermissibleRoles(this.RoleCode)) {
        resolve(true);
        return;
      }

      if (!this.IsPriorDOJ && this.currentTaxMode == 1 && this.indicateSubmissionSlotIsAfter && !this.indicateSubmissionSlotIsBefore) { // declaration mode only
        this.alertService.showInfo('This financial years submission period has ended. Please wait until specialists reopen the time slot.');
        reject(false);
      } else if (!this.IsPriorDOJ && this.currentTaxMode == 1 && !this.indicateSubmissionSlotIsAfter && this.indicateSubmissionSlotIsBefore) { // declaration mode only
        // this.alertService.showInfo('The submission start time for this financial year has not yet started. Please wait until specialists open up the time slot.');
        this.alertService.showInfo('Investment submission time closed');
        reject(false);
      } else {
        resolve(true);
      }

    })
    return promise;
  }

  seeMore() {
    if (this.seeMoreText == 'See more') {
      this.tobeShown = this.LstAllDeclarationProducts.length;
      this.seeMoreText = 'See less';
    } else {
      this.tobeShown = 8;
      this.seeMoreText = 'See more';
    }
  }

  onChangeFinancialYear(eventTargetValue) {
    this.selectedFinYear = eventTargetValue;
    let finlist = this.LstEmployeeInvestmentLookup.FicalYearList;
    this.FinancialStartDate = moment(finlist.find(a => a.Id == this.selectedFinYear).StartDate).format('YYYY-MM-DD');
    this.FinancialEndDate = moment(finlist.find(a => a.Id == this.selectedFinYear).EndDate).format('YYYY-MM-DD');
    this.FinancialStartDate = new Date(this.FinancialStartDate);
    this.FinancialEndDate = new Date(this.FinancialEndDate);
    this.GetEmployeeRequiredDetailsById(eventTargetValue);
    this.GetCurrentFinancialYearStartEndDate();

  }

  onChangeTaxRegime(event) {

    if (event == 'newregime') {
      this.alertService.confirmSwal1("Confirmation", `The current financial year data will be deleted when you switch to the new tax regime mode. That information cannot be modified back. Are you sure you want to Change the tax regime?`, "Yes, Confirm", "Cancel").then((result) => {
        this.loadingScreenService.startLoading();
        this.finalSave('TaxRegimeChange');

      }).catch(cancel => {
        this.IsNewTaxRegimeOpted = false;
      });

      this.IsNewTaxRegimeOpted = true;
    } else {
      this.alertService.confirmSwal1("Confirmation", `Are you sure you want to Change the Tax Regime`, "Yes, Confirm", "Cancel").then((result) => {
        this.loadingScreenService.startLoading();
        this.finalSave('TaxRegimeChange');

      }).catch(cancel => {
        this.IsNewTaxRegimeOpted = true;
      });
      this.IsNewTaxRegimeOpted = false;
    }

  }


  addItem(item): void {

    var index = this.DeclarationItems.length;
    this.selectedRow = index;
    this.DeclarationItems.push({
      Declarations: item,
      DeclaredAmount: 0,
      DeclaredAmountRemarks: "",
      DeclarationAttachments: [],
      Id: UUID.UUID(),
      ApprovedAmount: 0, // INITIAL AMOUNT 
      Status: 0, // PENDING,
      IsError: false,
      Modetype: UIMode.Edit,
      IsDeleted: false,
      IsProposed: this.currentTaxMode == 1 ? true : false,
      ApproverRemarks: "",
      ActualStatus: 1
    })
  }

  OnChangeInvestmentProducts(item) {
    item.Modetype = UIMode.Edit;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
    item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
      !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 0 : true;
      !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.ApprovedAmount = 0 : true;
    });
  }

  onChangeApprovedAmount(item) {
    item.Modetype = UIMode.Edit;
    item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
      e1.Status = 1;
      e1.ApprovedAmount = item.ApprovedAmount;
    });
  }



  onChangeDeclaredAmount(item) {
    item.Modetype = UIMode.Edit;
    this.TotalDeclaredAmount = 0;
    if (!this.investmentService.PermissibleRoles(this.RoleCode)) {
      item.ApprovedAmount = 0;
      item.Status = 0;
    }

    this.TotalDeclaredAmount = this.DeclarationItems.length > 0 ? this.DeclarationItems
      .filter(e => !e.IsDeleted && (e.Modetype === UIMode.Edit || e.Modetype === UIMode.None))
      .reduce((sum, element) => sum + Number(element.DeclaredAmount), 0) : 0;

    item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
      if (!this.investmentService.PermissibleRoles(this.RoleCode)) {
        e1.Status = 0;
        e1.ApprovedAmount = 0;
      }
    });
  }



  onChangeHRADeclaredAmount() {
    var sum = 0
    this.isPanMandatoryForHRA = false;
    this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.forEach(e => { if (!e.IsDeleted) { sum += parseInt(e.HRAAmount) } })
    this.TotalDeclaredAmount = sum;
    if (this.TotalDeclaredAmount >= environment.environment.HRAMaximumAmountForValidation) {
      this.isPanMandatoryForHRA = true;
    } else {
      this.isPanMandatoryForHRA = false;
    }

  }
  onChangeHRAAnnualDeclaredAmount(item) {
    var sum = 0
    this.isPanMandatoryForHRA = false;
    this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.forEach(e => {
      if (!e.IsDeleted) { sum += parseInt(e.HRAAmount) }
    })

    item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
      if (!this.investmentService.PermissibleRoles(this.RoleCode)) {
        e1.Status = 0;
        e1.ApprovedAmount = 0;
      }
    });

    this.TotalDeclaredAmount = sum;
    if (this.TotalDeclaredAmount >= environment.environment.HRAMaximumAmountForValidation) {
      this.isPanMandatoryForHRA = true;
    } else {
      this.isPanMandatoryForHRA = false;
    }
    item.Modetype = UIMode.Edit;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
    this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 1 : item.Status = 0;
  }
  onChangeIsMetroCity(i, e) {
    i.Modetype = UIMode.Edit;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? i.ApprovedAmount = 0 : true;
    i.CityName = null;
    this.investmentService.PermissibleRoles(this.RoleCode) ? i.Status = 1 : i.Status = 0;

    i.DeclarationAttachments != null && i.DeclarationAttachments.length > 0 && i.DeclarationAttachments.forEach(e1 => {
      if (!this.investmentService.PermissibleRoles(this.RoleCode)) {
        e1.Status = 0;
        e1.ApprovedAmount = 0;
      }
    });
  }

  onChangeHRAAnnualApprovedAmount(item) {
    item.Modetype = UIMode.Edit;
  }
  onChangeHRABulkDeclaredAmount() {
    var sum = 0
    this.isPanMandatoryForHRA = false;

    this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.forEach(e => { if (!e.IsDeleted) { sum += parseInt(e.HRAAmount) } })
    this.TotalDeclaredAmount = sum;

    if (this.TotalDeclaredAmount >= environment.environment.HRAMaximumAmountForValidation) {
      this.isPanMandatoryForHRA = true;
    } else {
      this.isPanMandatoryForHRA = false;
    }
  }
  getDocumentStatus(lstDocument) {
    return lstDocument != null && lstDocument.length > 0 && (lstDocument.filter(a => a.Status == 1 && a.Status == 2).length > 0)
      ? 3 : (lstDocument.filter(a => a.Status == 1).length > 0) ? 1 : (lstDocument.filter(a => a.Status == 2).length > 0) ? 2 : 0

  }

  doPushOldDeclarationData() {
    let PFPT = [];
    PFPT = this.LstAllDeclarationProducts.filter(pro => pro.ProductCode.toUpperCase() == 'PF' || pro.ProductCode.toUpperCase() == 'PT');
    this.DeclarationItems = [];
    this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0 &&
      this.employeedetails.LstemployeeInvestmentDeductions.forEach(elem => {
        if (this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(a => a.ProductId == elem.ProductID) != undefined) {
          if (this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.find(x => x.ProductId != elem.ProductID) != undefined)

            if ((elem.LstEmpInvDepDetails.length == 0 || elem.LstEmpInvDepDetails == null) && elem.FinancialYearId == this.selectedFinYear) {

              if (this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.find(x => x.ProductId == elem.ProductID) != undefined) {

              } else {

                console.log('elem.LstEmployeeInvestmentDocuments', elem.LstEmployeeInvestmentDocuments);

                if ((elem.EHPId == 0 || elem.EHPId == null) && this.StampDutyFeeProduct.filter(y => y.ProductId == elem.ProductID).length == 0) {
                  this.DeclarationItems.push({
                    Declarations: this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.find(a => a.ProductId == elem.ProductID) : null,
                    DeclaredAmount: elem.Amount,
                    DeclaredAmountRemarks: elem.InputsRemarks,
                    DeclarationAttachments: elem.LstEmployeeInvestmentDocuments == null ? [] : elem.LstEmployeeInvestmentDocuments,
                    Id: elem.Id,
                    ApprovedAmount: elem.ApprovedAmount,
                    Status: elem.LstEmployeeInvestmentDocuments != null && elem.LstEmployeeInvestmentDocuments.length > 0 ? this.getDocumentStatus(elem.LstEmployeeInvestmentDocuments) : 0,
                    IsError: false,
                    Modetype: UIMode.None,
                    IsDeleted: false,
                    IsProposed: elem.IsProposed,
                    ApproverRemarks: elem.ApproverRemarks,
                    ActualStatus: elem.Status
                  })
                }
              }
            }
        }
      });

    console.log('DeclarationItems >>>>>>>>>>>', this.DeclarationItems);

  }

  doPushOldHRAData() {
    var inx = 0;
    this.LstHouseRentAllowance = [];
    let _employeePayrollSummaryDetails = this.employeedetails.employeePayrollSummaryDetails.find(a => a.FinancialYearId == this.selectedFinYear && a.IsProposed == (this.currentTaxMode == 1 ? true : false));

    this.employeedetails.LstemployeeHouseRentDetails != null && this.employeedetails.LstemployeeHouseRentDetails.length > 0 &&
      this.employeedetails.LstemployeeHouseRentDetails.forEach(elem => {
        if (elem.FinancialYearId == this.selectedFinYear) {


          if (_employeePayrollSummaryDetails) {
            this.selectedEntryType = (_employeePayrollSummaryDetails.HouseRentType == HouseRentType.Manual ? 'custom' :
              _employeePayrollSummaryDetails.HouseRentType == HouseRentType.Yearly ? 'annual' : _employeePayrollSummaryDetails.HouseRentType == HouseRentType.Monthly ?
                'month' : _employeePayrollSummaryDetails.HouseRentType == HouseRentType.Quartely ? 'quarter' : 'month');

            if (this.selectedEntryType == 'quarter') {
              const obj = this.getQuarter('april');
              const start = new Date(obj[`quarter${inx + 1}`].start);
              const end = new Date(obj[`quarter${inx + 1}`].end);
            }

            this.LstHouseRentAllowance.push({
              HRAAmount: elem.RentAmount,
              IsMetro: elem.IsMetro,
              CityName: elem.LandLordDetails != null && (elem.LandLordDetails.AddressDetails != null && (JSON.parse(elem.LandLordDetails.AddressDetails).NameofCity)),
              QuarterRange: (this.selectedEntryType == 'quarter' || this.selectedEntryType == 'custom') ? [new Date(elem.StartDate), new Date(elem.EndDate)] : null,
              StartDate: new Date(elem.StartDate),
              EndDate: new Date(elem.EndDate),
              RentalHouseAddress: elem.AddressDetails,
              AddressOfLandlord: elem.LandLordDetails != null && (elem.LandLordDetails.AddressDetails != null && (JSON.parse(elem.LandLordDetails.AddressDetails).LandlordAddress)),
              NameOfLandlord: elem.LandLordDetails != null && elem.LandLordDetails.Name,
              PANOfLandlord: elem.LandLordDetails != null && elem.LandLordDetails.PAN,
              HRARemarks: elem.InputsRemarks,
              Id: elem.Id,
              DeclarationAttachments: elem.LstEmployeeInvestmentDocuments == null ? [] : elem.LstEmployeeInvestmentDocuments,
              IsDeleted: false,
              Modetype: UIMode.None,
              EntryType: this.selectedEntryType,
              ApprovedAmount: elem.ApprovedAmount,
              ApproverRemarks: elem.ApproverRemarks,
              IsProposed: elem.IsProposed,
              Status: elem.LstEmployeeInvestmentDocuments != null && elem.LstEmployeeInvestmentDocuments.length > 0 ? this.getDocumentStatus(elem.LstEmployeeInvestmentDocuments) : 0
            })
            inx++;

          } else {
            this.selectedEntryType = 'month';

            this.LstHouseRentAllowance.push({
              HRAAmount: elem.RentAmount,
              IsMetro: elem.IsMetro,
              CityName: elem.LandLordDetails != null && (elem.LandLordDetails.AddressDetails != null && (JSON.parse(elem.LandLordDetails.AddressDetails).NameofCity)),
              QuarterRange: (this.selectedEntryType == 'quarter' || this.selectedEntryType == 'custom') ? [new Date(elem.StartDate), new Date(elem.EndDate)] : null,
              StartDate: new Date(elem.StartDate),
              EndDate: new Date(elem.EndDate),
              RentalHouseAddress: elem.AddressDetails,
              AddressOfLandlord: elem.LandLordDetails != null && (elem.LandLordDetails.AddressDetails != null && (JSON.parse(elem.LandLordDetails.AddressDetails).LandlordAddress)),
              NameOfLandlord: elem.LandLordDetails != null && elem.LandLordDetails.Name,
              PANOfLandlord: elem.LandLordDetails != null && elem.LandLordDetails.PAN,
              HRARemarks: elem.InputsRemarks,
              Id: elem.Id,
              DeclarationAttachments: elem.LstEmployeeInvestmentDocuments == null ? [] : elem.LstEmployeeInvestmentDocuments,
              IsDeleted: false,
              Modetype: UIMode.None,
              EntryType: this.selectedEntryType,
              ApprovedAmount: elem.ApprovedAmount,
              ApproverRemarks: elem.ApproverRemarks,
              IsProposed: elem.IsProposed,
              Status: elem.LstEmployeeInvestmentDocuments != null && elem.LstEmployeeInvestmentDocuments.length > 0 ? this.getDocumentStatus(elem.LstEmployeeInvestmentDocuments) : 0
            })
            inx++;
          }

          this.LstHouseRentAllowance.length > 0 ? this.IsHRADataExists = true : this.IsHRADataExists = false;

        }

        // if (elem.FinancialYearId == this.selectedFinYear) {
        //   if (this.employeedetails.LstemployeeHouseRentDetails.filter(post => post.FinancialYearId == this.selectedFinYear && post.Status).length == 1 &&
        //     this.employeedetails.LstemployeeHouseRentDetails.find(b => moment(b.StartDate).format('YYYY-MM-DD') == moment(this.FinancialStartDate).format('YYYY-MM-DD') && moment(b.EndDate).format('YYYY-MM-DD') == moment(this.FinancialEndDate).format('YYYY-MM-DD') != undefined)
        //   ) {

        //     this.selectedEntryType = 'annual';

        //   } else if (this.employeedetails.LstemployeeHouseRentDetails.filter(post => post.FinancialYearId == this.selectedFinYear && post.Status).length == 4) {


        //     if (moment(elem.StartDate).format('YYYY-MM-DD') == (moment(start).format('YYYY-MM-DD')) && moment(elem.EndDate).format('YYYY-MM-DD') == (moment(end).format('YYYY-MM-DD'))) {
        //       this.selectedEntryType = 'quarter';
        //     }

        //   } else if (this.employeedetails.LstemployeeHouseRentDetails.filter(post => post.FinancialYearId == this.selectedFinYear && post.Status).length == 12) {
        //     this.selectedEntryType = 'month';
        //   }

        //   this.LstHouseRentAllowance.push({
        //     HRAAmount: elem.RentAmount,
        //     IsMetro: elem.IsMetro,
        //     CityName: elem.LandLordDetails != null && (elem.LandLordDetails.AddressDetails != null && (JSON.parse(elem.LandLordDetails.AddressDetails).NameofCity)),
        //     QuarterRange: this.selectedEntryType == 'quarter' ? [new Date(elem.StartDate), new Date(elem.EndDate)] : null,
        //     StartDate: new Date(elem.StartDate),
        //     EndDate: new Date(elem.EndDate),
        //     RentalHouseAddress: elem.AddressDetails,
        //     AddressOfLandlord: elem.LandLordDetails != null && (elem.LandLordDetails.AddressDetails != null && (JSON.parse(elem.LandLordDetails.AddressDetails).LandlordAddress)),
        //     NameOfLandlord: elem.LandLordDetails != null && elem.LandLordDetails.Name,
        //     PANOfLandlord: elem.LandLordDetails != null && elem.LandLordDetails.PAN,
        //     HRARemarks: elem.InputsRemarks,
        //     Id: elem.Id,
        //     DeclarationAttachments: elem.LstEmployeeInvestmentDocuments,
        //     IsDeleted: false,
        //     Modetype: UIMode.Edit,
        //     EntryType: this.selectedEntryType,
        //     ApprovedAmount: elem.ApprovedAmount,
        //     ApproverRemarks: elem.ApproverRemarks
        //   })
        //   inx++;
        // }
      });

    for (let k = 0; k < this.LstHouseRentAllowance.length; k++) {
      const element = this.LstHouseRentAllowance[k];

      if (element.DeclarationAttachments != null && element.DeclarationAttachments.length > 0) {

        if (this.investmentService.PermissibleRoles(this.RoleCode)) {
          this.isHRAAllowedToEdit = true;
          return;
        }
        if (element.DeclarationAttachments.filter(z => (z.Status == 0 || z.Status == 2)).length > 0) {
          this.isHRAAllowedToEdit = true;
          break;
        } else {
          this.isHRAAllowedToEdit = false
        }
      }
    }



    this.selectedEntryType == 'month' ? this.onChangeHRABulkDeclaredAmount() : this.onChangeHRADeclaredAmount();
  }

  doPushOldMedicalExpenditureData() {
    var inx = 0;
    this.LstMedicalDependent = [];
    this.LstDependent = [];
    this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0 &&
      this.employeedetails.LstemployeeInvestmentDeductions.forEach(elem => {

        if (elem.FinancialYearId == this.selectedFinYear && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(a => a.ProductId == elem.ProductID) != undefined) {

          // if(this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.find(x=>x.ProductId == elem.ProductID)){\

          if (elem.LstEmpInvDepDetails.length > 0) {
            elem.LstEmpInvDepDetails.forEach(child => {

              var obje = {
                DependentType: null, MedicalAmount: null, DisabilityPercentage: null, SelectedMedicalInsurantTab: null, MedicalRemarks: null,
                DeclarationAttachments: [], Id: null, Relationship: null, DependentName: null, DateOfBirth: null, IsDeleted: false, isError: false,
                Modetype: UIMode.None, ApprovedAmount: 0, ApproverRemarks: null, EmpInvestmentDeductionId: null, Status: 0, IsProposed: this.currentTaxMode == 1 ? true : false
              };

              obje.DependentType = child.DependentType,
                obje.MedicalAmount = child.Amount,
                obje.DisabilityPercentage = child.DisabilityPercentage,
                obje.SelectedMedicalInsurantTab = this.LstAllDeclarationProducts.find(c => c.ProductId == elem.ProductID),
                obje.MedicalRemarks = child.InputsRemarks,
                obje.DeclarationAttachments = elem.LstEmployeeInvestmentDocuments == null ? [] : elem.LstEmployeeInvestmentDocuments,
                obje.Id = child.Id,
                obje.Relationship = child.Relationship,
                obje.DependentName = child.DependentName,
                obje.DateOfBirth = new Date(child.DependentDateOfBirth),
                obje.IsDeleted = false,
                obje.isError = false,
                obje.Modetype = UIMode.None,
                obje.ApprovedAmount = child.ApprovedAmount,
                obje.ApproverRemarks = child.ApproverRemarks,
                obje.EmpInvestmentDeductionId = child.EmpInvestmentDeductionId,
                obje.Status = elem.LstEmployeeInvestmentDocuments != null && elem.LstEmployeeInvestmentDocuments.length > 0 ? this.getDocumentStatus(elem.LstEmployeeInvestmentDocuments) : 0
              obje.IsProposed = elem.IsProposed
              this.LstMedicalDependent.push(obje);

              if (this.LstDependent.length == 0) {
                this.LstDependent.push({
                  Id: UUID.UUID(),
                  DependentName: child.DependentName,
                  Relationship: child.Relationship,
                  DateOfBirth: new Date(child.DependentDateOfBirth)
                });
              }
              else if (this.LstDependent.length > 0 && this.LstDependent.filter(q => (q.Relationship == child.Relationship) && moment(new Date(q.DateOfBirth)).format('YYYY-MM-DD') == moment(new Date(child.DependentDateOfBirth)).format('YYYY-MM-DD') && q.DependentName == child.DependentName).length > 0) {
                return
              } else {

                this.LstDependent.push({
                  Id: UUID.UUID(),
                  DependentName: child.DependentName,
                  Relationship: child.Relationship,
                  DateOfBirth: new Date(child.DependentDateOfBirth)
                });
              }



              // if (this.LstDependent.length > 0 && (this.LstDependent.find(q =>  child.Relationship != 4 && child.Relationship != 5 && q.Relationship == child.Relationship) == null || this.LstDependent.find(q => child.Relationship != 4 && child.Relationship != 5 && q.Relationship == child.Relationship) == undefined)) {
              //   this.LstDependent.push({
              //     Id: UUID.UUID(),
              //     DependentName: child.DependentName,
              //     Relationship: child.Relationship,
              //     DateOfBirth: new Date(child.DependentDateOfBirth)
              //   });
              // } 
              //   else if (this.LstDependent.length == 0) {
              //   this.LstDependent.push({
              //     Id: UUID.UUID(),
              //     DependentName: child.DependentName,
              //     Relationship: child.Relationship,
              //     DateOfBirth: new Date(child.DependentDateOfBirth)
              //   });
              // }

            });
          }
        }
      });


  }


  doMapInvestmentLogHistory(item, Amount, Remarks, ApprovedAmount, ApproverRemarks, sectionName) {
    let LstLogHistory = [];
    let isNewRecord: boolean = false;
    console.log('EX item', item);

    if (item.Id == 0) {
      isNewRecord = true;
    } else {
      isNewRecord = false;
      if (sectionName == 'HRA') {
        LstLogHistory = this.employeedetails.LstemployeeHouseRentDetails != null &&
          this.employeedetails.LstemployeeHouseRentDetails.length > 0 &&
          this.employeedetails.LstemployeeHouseRentDetails.filter(z => z.Id == item.Id).length > 0 &&
          this.employeedetails.LstemployeeHouseRentDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.employeedetails.LstemployeeHouseRentDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];

      } else if (sectionName == 'INVT') {
        LstLogHistory = this.employeedetails.LstemployeeInvestmentDeductions != null &&
          this.employeedetails.LstemployeeInvestmentDeductions.length > 0 &&
          this.employeedetails.LstemployeeInvestmentDeductions.filter(z => z.Id == item.Id).length > 0 &&
          this.employeedetails.LstemployeeInvestmentDeductions.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.employeedetails.LstemployeeInvestmentDeductions.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];

      }
    }
    LstLogHistory = LstLogHistory == null ? [] : LstLogHistory;
    var investmentLogHistory = new InvestmentLogHistory();
    investmentLogHistory.DeclaredAmount = Amount;
    investmentLogHistory.DeclaredRemarks = Remarks;
    investmentLogHistory.DeclaredBy = this.UserId;
    investmentLogHistory.DeclaredOn = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    investmentLogHistory.ApprovedAmount = ApprovedAmount == null ? 0 : ApprovedAmount;
    investmentLogHistory.ApproverRemarks = ApproverRemarks == null ? "" : ApproverRemarks;
    investmentLogHistory.ApprovedBy = this.investmentService.PermissibleRoles(this.RoleCode) ? this.UserId : 0;
    investmentLogHistory.ApprovedOn = this.investmentService.PermissibleRoles(this.RoleCode) ? moment(new Date()).format('YYYY-MM-DD HH:mm:ss') : null;

    LstLogHistory.push(investmentLogHistory);
    return LstLogHistory;
  }

  doMapEmployeeInvestmentDocuments(DeclarationItems, isAutoApprove: boolean) {
    let LstAttachments = [];

    DeclarationItems != null && DeclarationItems.DeclarationAttachments != null && DeclarationItems.DeclarationAttachments.length > 0
      && DeclarationItems.DeclarationAttachments.forEach(el => {

        var employeeInvestmentDocuments = new EmployeeInvestmentDocuments();
        employeeInvestmentDocuments.EmployeeId = this.EmployeeId;
        employeeInvestmentDocuments.ProductId = DeclarationItems.ProductId;
        employeeInvestmentDocuments.Date = new Date();
        employeeInvestmentDocuments.DocumentNumber = "0";
        employeeInvestmentDocuments.DocumentId = el.DocumentId;
        employeeInvestmentDocuments.FileName = el.FileName;
        employeeInvestmentDocuments.Amount = DeclarationItems.DeclaredAmount;
        employeeInvestmentDocuments.ApprovedAmount = el.ApprovedAmount;
        employeeInvestmentDocuments.OtherInfo = "";
        employeeInvestmentDocuments.FromDate = new Date();
        employeeInvestmentDocuments.ToDate = new Date();
        employeeInvestmentDocuments.Remarks = '';
        employeeInvestmentDocuments.Status = (this.investmentService.PermissibleRoles(this.RoleCode) || isAutoApprove) ? 1 : (el.Status == 2 ? 0 : el.Status);
        LstAttachments.push(employeeInvestmentDocuments);
      });
    return LstAttachments;
  }

  CalCulateDeductionOfMedical(list) {
    var sum = 0;

    list.length > 0 && list.forEach(e => { if (e.Modetype != UIMode.Delete) { sum += parseInt(e.Amount) } })
    return sum;
  }
  CalCulateDeductionOfApprovedMedical(list) {
    var sum = 0;

    list.length > 0 && list.forEach(e => { if (e.Modetype != UIMode.Delete) { sum += parseInt(e.ApprovedAmount) } })
    return sum;
  }

  doPushNewMedicalExpenditure() {
    try {
      console.log(' this.LstMedicalDependent', this.LstMedicalDependent);

      this.LstemployeeInvestmentDeductions = [];
      if (this.LstMedicalDependent.length > 0)
        this.LstMedicalDependent.forEach(item => {
          this.LstEmpInvDepDetails = [];
          if (item.Modetype != 0) {


            var empinvDepdetails = new EmployeeInvesmentDependentDetails();
            empinvDepdetails.EmpInvestmentDeductionId = item.EmpInvestmentDeductionId;
            empinvDepdetails.EmployeeId = this.EmployeeId;
            empinvDepdetails.DependentType = item.DependentType === null ? 0 : item.DependentType
            empinvDepdetails.DisabilityPercentage = item.DisabilityPercentage != null ? item.DisabilityPercentage : 0;
            empinvDepdetails.DependentAge = 0;
            empinvDepdetails.Relationship = item.Relationship === null ? 0 : item.Relationship;
            empinvDepdetails.DependentName = item.DependentName;
            empinvDepdetails.DependentDateOfBirth = moment(new Date(item.DateOfBirth)).format('YYYY-MM-DD');
            empinvDepdetails.Amount = Number(item.MedicalAmount);
            empinvDepdetails.Details = '';
            empinvDepdetails.InputsRemarks = item.MedicalRemarks;
            empinvDepdetails.ApprovedAmount = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? ((this.essService.isGuid(item.Id) == true && this.investmentService.PermissibleRoles(this.RoleCode)) ? empinvDepdetails.Amount : (!this.investmentService.PermissibleRoles(this.RoleCode) && item.Modetype == UIMode.Edit) ? 0 : item.ApprovedAmount) : 0;
            empinvDepdetails.ApproverRemarks = item.ApproverRemarks;
            empinvDepdetails.Status = 1; // item.Status;
            empinvDepdetails.DocumentId = 0;
            empinvDepdetails.Modetype = item.Modetype; //  item.IsDeleted ? UIMode.Delete : UIMode.Edit;
            empinvDepdetails.Id = item.Id;// this.essService.isGuid(item.Id) == true ? 0 : item.Id;
            this.LstEmpInvDepDetails.push(empinvDepdetails);



            // if (this.LstemployeeInvestmentDeductions.length > 0) {
            //   let isExist = this.LstemployeeInvestmentDeductions.find(a => a.ProductID == item.SelectedMedicalInsurantTab.ProductId);
            //   if (isExist) {
            //     isExist.Amount = Number(isExist.Amount) + Number(item.MedicalAmount);
            //     isExist.ApprovedAmount = Number(isExist.ApprovedAmount) + Number(item.ApprovedAmount);
            //     isExist.LstEmpInvDepDetails = isExist.LstEmpInvDepDetails.concat(empinvDepdetails);
            //     return;
            //   }
            // }

            if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0 && this.LstMedicalInsuranceProduct.filter(b => this.employeedetails.LstemployeeInvestmentDeductions.filter(c => c.ProductID == b.ProductId).length > 0)) {
              let isExist = this.employeedetails.LstemployeeInvestmentDeductions.find(a => a.ProductID == item.SelectedMedicalInsurantTab.ProductId);

              if (isExist) {

                var isChildExist = (isExist.LstEmpInvDepDetails.find(m => m.Id == empinvDepdetails.Id));

                if (isChildExist) {
                  isExist.LstEmpInvDepDetails.length > 0 && isExist.LstEmpInvDepDetails.forEach(v => {
                    if (v.Id == empinvDepdetails.Id) {

                      v.EmpInvestmentDeductionId = empinvDepdetails.EmpInvestmentDeductionId;
                      v.DependentType = empinvDepdetails.DependentType;
                      v.DisabilityPercentage = empinvDepdetails.DisabilityPercentage;
                      v.Relationship = empinvDepdetails.Relationship;
                      v.DependentDateOfBirth = empinvDepdetails.DependentDateOfBirth;
                      v.Amount = empinvDepdetails.Amount;
                      v.InputsRemarks = empinvDepdetails.InputsRemarks;
                      v.Modetype = empinvDepdetails.Modetype;
                      v.Status = empinvDepdetails.Status;
                      v.Id = empinvDepdetails.Id;
                      v.ApprovedAmount = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? (item.ApprovedAmount) : 0;
                      // _.remove(isExist.LstEmpInvDepDetails, o => v.Id == empinvDepdetails.Id);
                    }
                  });

                } else {
                  isExist.LstEmpInvDepDetails = isExist.LstEmpInvDepDetails.concat(empinvDepdetails);
                }

                let isAutoApprove: boolean = false;
                isAutoApprove = this.essService.isGuid(isExist.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;

                isExist.Amount = this.CalCulateDeductionOfMedical(isExist.LstEmpInvDepDetails);
                isExist.Modetype = UIMode.Edit;
                isExist.ApprovedAmount = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? (this.investmentService.PermissibleRoles(this.RoleCode) ? this.CalCulateDeductionOfApprovedMedical(isExist.LstEmpInvDepDetails) : 0) : 0;
                isExist.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(item, isAutoApprove);
                isExist.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(isExist, isExist.Amount, isExist.InputsRemarks, isExist.ApprovedAmount, isExist.ApproverRemarks, 'INVT');
                isExist.IsProposed = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? false : item.IsProposed;
                return;
              }
            }


            let isAutoApprove: boolean = false;
            isAutoApprove = this.essService.isGuid(item.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;

            console.log('isAutoApprove', isAutoApprove);


            var empInvestmentDeduction = new EmployeeInvestmentDeductions();
            empInvestmentDeduction.EmployeeId = this.EmployeeId;
            empInvestmentDeduction.FinancialYearId = this.currentFinYear;
            empInvestmentDeduction.ProductID = item.SelectedMedicalInsurantTab.ProductId;
            empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
            empInvestmentDeduction.IsDifferentlyabled = false;
            empInvestmentDeduction.Amount = item.MedicalAmount;
            empInvestmentDeduction.Details = '';
            empInvestmentDeduction.IsProposed = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? false : item.IsProposed, // item.IsProposed; // this.currentTaxMode == 1 ? true : false;
              empInvestmentDeduction.InputsRemarks = item.MedicalRemarks;
            empInvestmentDeduction.ApprovedAmount = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? ((item.ApprovedAmount) ? item.ApprovedAmount : 0) : 0;
            empInvestmentDeduction.ApproverRemarks = (item.ApproverRemarks) ? item.ApproverRemarks : '';
            empInvestmentDeduction.Status = 1;
            empInvestmentDeduction.DocumentId = 0;
            empInvestmentDeduction.LstEmpInvDepDetails = this.LstEmpInvDepDetails;
            empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
            empInvestmentDeduction.Modetype = item.Modetype; // item.IsDeleted ? UIMode.Delete : UIMode.Edit;
            empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(item, isAutoApprove);
            empInvestmentDeduction.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empInvestmentDeduction, item.MedicalAmount, item.MedicalRemarks, empInvestmentDeduction.ApprovedAmount, empInvestmentDeduction.ApproverRemarks, 'INVT');

            this.employeedetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);

          }
        });

      this.employeedetails.LstemployeeInvestmentDeductions.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.forEach(med => {

        med.Id = this.essService.isGuid(med.Id) == true ? 0 : med.Id;


      });
      this.employeedetails.LstemployeeInvestmentDeductions.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.forEach(med => {

        med.LstEmpInvDepDetails.length > 0 && med.LstEmpInvDepDetails.forEach(med1 => {
          med1.Id = this.essService.isGuid(med1.Id) == true ? 0 : med1.Id;
        });

        med.Id = this.essService.isGuid(med.Id) == true ? 0 : med.Id;
        if ((med.Amount == 0 || med.Amount == null) && this.LstMedicalInsuranceProduct.find(b => b.ProductId == med.ProductID)) {
          med.Modetype = UIMode.Delete;
        }


      });
      // this.employeedetails.LstemployeeInvestmentDeductions = this.LstemployeeInvestmentDeductions;
      this.finalSave('NormalSave');

    } catch (err) {
      console.log('MEDICAL EXPENDITURE EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
      this.loadingScreenService.stopLoading();
    }

  }

  isGuidId(Id) {
    return this.essService.isGuid(Id);
  }


  doPushNewHRA(actionName) {
    try {


      this.LstemployeeHouseRentDetails = [];
      if (this.selectedEntryType != 'month' && this.LstHouseRentAllowance.length > 0) {
        this.LstHouseRentAllowance.forEach(item => {
          if (!item.IsDeleted && item.Modetype == UIMode.None) {

          }

          else {
            var hraObj = new EmployeeHouseRentDetails();
            var LandLordDetails = {
              "Name": item.NameOfLandlord,
              "AddressDetails": JSON.stringify({ LandlordAddress: item.AddressOfLandlord, NameofCity: item.CityName, RentalHouseAddress: item.RentalHouseAddress }),
              "PAN": item.PANOfLandlord
            }
            let isAutoApprove: boolean = false;
            isAutoApprove = this.essService.isGuid(item.Id) == true && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;
            hraObj.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id,
              hraObj.EmployeeId = this.EmployeeId,
              hraObj.FinancialYearId = this.currentFinYear,
              hraObj.StartDate = moment((item.StartDate)).format('YYYY-MM-DD'),
              hraObj.EndDate = moment(new Date(item.EndDate)).format('YYYY-MM-DD'),
              hraObj.RentAmount = item.HRAAmount,
              hraObj.ApprovedAmount = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? (this.essService.isGuid(item.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? item.HRAAmount : !this.essService.isGuid(item.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? (item.ApprovedAmount == null || item.ApprovedAmount) == undefined ? 0 : item.ApprovedAmount : 0) : 0;

            hraObj.AddressDetails = item.RentalHouseAddress,
              hraObj.IsMetro = item.IsMetro == true ? true : false,
              hraObj.IsProposed = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? false : item.IsProposed, // this.currentTaxMode == 1 ? true : false,
              hraObj.LandLordDetails = LandLordDetails,
              hraObj.DocumentId = 0,
              hraObj.InputsRemarks = item.HRARemarks,
              hraObj.ApproverRemarks = item.ApproverRemarks,
              hraObj.Status = 1; //item.Status,
            hraObj.Modetype = actionName == 'delete' ? UIMode.Delete : item.Modetype,
              hraObj.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(item, isAutoApprove);
            hraObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(item, item.HRAAmount, item.HRARemarks, hraObj.ApprovedAmount, hraObj.ApproverRemarks, 'HRA');

            actionName == 'delete' && hraObj.Id == 0 ? true : this.LstemployeeHouseRentDetails.push(hraObj);
          }
        });

      }
      else if (this.selectedEntryType == 'month') {
        this.LstHouseRentAllowance.forEach(item => {
          var hraObj = new EmployeeHouseRentDetails();
          var LandLordDetails = {
            "Name": item.NameOfLandlord,
            "AddressDetails": JSON.stringify({ LandlordAddress: item.AddressOfLandlord, NameofCity: item.CityName, RentalHouseAddress: item.RentalHouseAddress }),
            "PAN": item.PANOfLandlord
          }
          let isAutoApprove: boolean = false;
          isAutoApprove = this.essService.isGuid(item.Id) == true && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;

          hraObj.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id,
            hraObj.EmployeeId = this.EmployeeId,
            hraObj.FinancialYearId = this.currentFinYear,
            hraObj.StartDate = moment((item.StartDate)).format('YYYY-MM-DD'),
            hraObj.EndDate = moment(new Date(item.EndDate)).format('YYYY-MM-DD'),
            hraObj.RentAmount = item.HRAAmount,
            hraObj.ApprovedAmount = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? (this.essService.isGuid(item.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? item.HRAAmount : !this.essService.isGuid(item.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? (item.ApprovedAmount == null || item.ApprovedAmount) == undefined ? 0 : item.ApprovedAmount : 0) : 0;
          hraObj.AddressDetails = item.RentalHouseAddress,
            hraObj.IsMetro = item.IsMetro == true ? true : false,
            hraObj.IsProposed = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? false : item.IsProposed, // this.currentTaxMode == 1 ? true : false,
            hraObj.LandLordDetails = LandLordDetails,
            hraObj.DocumentId = 0,
            hraObj.InputsRemarks = item.HRARemarks,
            hraObj.ApproverRemarks = item.ApproverRemarks,
            hraObj.Status = 1; // item.Status,
          hraObj.Modetype = actionName == 'delete' ? UIMode.Delete : item.Modetype,
            hraObj.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(item, isAutoApprove);
          hraObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(item, item.HRAAmount, item.HRARemarks, hraObj.ApprovedAmount, hraObj.ApproverRemarks, 'HRA');

          actionName == 'delete' && hraObj.Id == 0 ? true : this.LstemployeeHouseRentDetails.push(hraObj);

        });
      }

      this.employeedetails.LstemployeeHouseRentDetails = this.LstemployeeHouseRentDetails;
      if (this.employeedetails.LstemployeeHouseRentDetails.length > 0) {

        // let _employeePayrollSummaryDetails = this.employeedetails.employeePayrollSummaryDetails.find(a => a.FinancialYearId == this.selectedFinYear && a.IsProposed == (this.currentTaxMode == 1 ? true : false));
        let _employeePayrollSummaryDetails = this.employeedetails.employeePayrollSummaryDetails.find(a => a.FinancialYearId == this.selectedFinYear);
        console.log('a', _employeePayrollSummaryDetails);

        var payrollSummaryDetails = new EmployeePayrollSummaryDetails();
        payrollSummaryDetails.Id = _employeePayrollSummaryDetails != null && _employeePayrollSummaryDetails != undefined ? _employeePayrollSummaryDetails.Id : 0
        payrollSummaryDetails.EmployeeId = this.EmployeeId;
        payrollSummaryDetails.EmployeeCode = this.employeedetails.Code;
        payrollSummaryDetails.EmployeeName = this.employeedetails.FirstName;
        payrollSummaryDetails.FinancialYearId = this.selectedFinYear;
        payrollSummaryDetails.PayperiodId = this.employeedetails.EmploymentContracts[0].OpenPayPeriodId;
        payrollSummaryDetails.IsProposed = this.currentTaxMode == 1 ? true : false;
        payrollSummaryDetails.HouseRentType = (this.selectedEntryType == 'annual' ? HouseRentType.Yearly : this.selectedEntryType == 'quarter' ? HouseRentType.Quartely :
          this.selectedEntryType == 'month' ? HouseRentType.Monthly : this.selectedEntryType == 'custom' ? HouseRentType.Manual : 3);
        payrollSummaryDetails.HouseRentDefaultValue = "";
        payrollSummaryDetails.TotalInvestmentAmount = this.TotalDeclaredAmount;
        payrollSummaryDetails.TotalInvestmentApprovedAmount = 0;
        payrollSummaryDetails.TotalPerquisitesAmount = 0;
        payrollSummaryDetails.Modetype = actionName == 'delete' ? UIMode.Delete : UIMode.Edit;
        // if (_employeePayrollSummaryDetails != null) {
        //   alert('sdfasdfas')
        //   if (this.employeedetails.employeePayrollSummaryDetails.find(a => a.Id == _employeePayrollSummaryDetails.Id) != null) {
        //     this.employeedetails.employeePayrollSummaryDetails.find(a => a.Id == _employeePayrollSummaryDetails.Id).Modetype = UIMode.Delete;
        //     this.employeedetails.employeePayrollSummaryDetails.find(a => a.Id == _employeePayrollSummaryDetails.Id).Modetype = UIMode.Delete;

        //   }

        // } else {
        //   alert('dfasd')
        //   alert(payrollSummaryDetails.HouseRentType)
        this.employeedetails.employeePayrollSummaryDetails.push(payrollSummaryDetails);
        // }
      }
      // this.employeedetails.employeePayrollSummaryDetails.length > 0 && this.employeedetails.employeePayrollSummaryDetails.forEach(element => {
      //   if(element.Modetype == UIMode.None){
      //   element.HouseRentType = (this.selectedEntryType == 'annual' ? HouseRentType.Yearly : this.selectedEntryType == 'quarter' ? HouseRentType.Quartely :
      //   this.selectedEntryType == 'month' ? HouseRentType.Monthly : this.selectedEntryType == 'custom' ? HouseRentType.Manual : 3);
      //   element.Modetype = UIMode.Edit;
      //   }
      // });

      this.finalSave('NormalSave');

    } catch (err) {
      console.log('HRA EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
      this.loadingScreenService.stopLoading();
    }

  }

  doPushNewDeclarationData() {
    try {

      this.LstemployeeInvestmentDeductions = [];
      this.DeclarationItems.forEach(item => {
        let isAutoApprove: boolean = false;
        isAutoApprove = (this.essService.isGuid(item.Id) == true && this.investmentService.PermissibleRoles(this.RoleCode)) ? true : false
        var empInvestmentDeduction = new EmployeeInvestmentDeductions();
        empInvestmentDeduction.EmployeeId = this.EmployeeId;
        empInvestmentDeduction.FinancialYearId = this.currentFinYear;
        empInvestmentDeduction.ProductID = item.Declarations.ProductId;
        empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
        empInvestmentDeduction.IsDifferentlyabled = false;
        empInvestmentDeduction.Amount = item.DeclaredAmount;
        empInvestmentDeduction.Details = '';
        empInvestmentDeduction.IsProposed = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? false : item.IsProposed, // item.IsProposed; // this.currentTaxMode == 1 ? true : false;
          empInvestmentDeduction.InputsRemarks = item.DeclaredAmountRemarks;
        empInvestmentDeduction.ApprovedAmount = item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 ? ((this.essService.isGuid(item.Id) == true && this.investmentService.PermissibleRoles(this.RoleCode)) ? item.DeclaredAmount : (!this.essService.isGuid(item.Id) == true && this.investmentService.PermissibleRoles(this.RoleCode)) ? item.ApprovedAmount : item.ApprovedAmount) : 0;
        empInvestmentDeduction.ApproverRemarks = item.ApproverRemarks;
        empInvestmentDeduction.Status = 1; // item.ActualStatus;
        empInvestmentDeduction.DocumentId = 0;
        empInvestmentDeduction.LstEmpInvDepDetails = [];
        empInvestmentDeduction.Modetype = item.Modetype;
        empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(item, isAutoApprove);
        empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(item, item.DeclaredAmount, item.DeclaredAmountRemarks, empInvestmentDeduction.ApprovedAmount, empInvestmentDeduction.ApproverRemarks, 'INVT');

        this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction)
      });

      this.employeedetails.LstemployeeInvestmentDeductions = this.LstemployeeInvestmentDeductions;
      this.finalSave('NormalSave');

    } catch (err) {
      console.log('INVESTMENT EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
      this.loadingScreenService.stopLoading();
    }

  }

  doFieldValidationAmount(column) {
    return this.IsSaved && (column <= 0 || column == null || column == undefined || column == "") ? false : true;
  }

  doFieldValidation(column) {
    return this.IsSaved && !this.utilityService.isNullOrUndefined(column) ? true : false;
  }


  saveDeclarations(layout) {
    this.IsSaved = true;
    let DoesErrorOccurred: boolean = false;
    this.IsFailedToValidate = false;

    if (layout == 'Investment') {

      if (this.DeclarationItems.length == 0) {
        this.alertService.showInfo(`To continue, please add at least one item. `);
        return;
      }

      this.DeclarationItems.forEach(obj => {
        if (!obj.IsDeleted) {
          if (obj.DeclaredAmount == 0 || obj.DeclaredAmount == null || obj.DeclaredAmount == undefined || obj.DeclaredAmount == '') {
            obj.IsError = true;
            DoesErrorOccurred = true;
          }
          if (!obj.IsProposed && obj.DeclarationAttachments.length == 0) {
            obj.IsError = true;
            DoesErrorOccurred = true;
          }
        }
      });

      if (DoesErrorOccurred) {
        this.IsFailedToValidate = true;
        return;
      }

      // if (this.currentTaxMode == 2 && this.TotalDeclaredAmount > this.LstTaxInvestmentsSummary.find(v => v.Code == 'INVT').QualifyingAmount) {
      //   this.alertService.showWarning('Note : Total declared amount should be equal to or less than the qualifying amount.');
      //   return;
      // }
      this.loadingScreenService.startLoading();
      this.doPushNewDeclarationData();

    }
    else if (layout == 'HRA') {

      console.log('this.LstHouseRentAllowance', this.LstHouseRentAllowance);

      if (this.LstHouseRentAllowance != null && this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.filter(x => !x.IsDeleted).length == 0) {
        this.alertService.confirmSwal("Are you sure?", "There's not a record in your entry, after you click the OK button, the previous record will be removed..", "Ok").then((result) => {
          this.validateHRAEntry(DoesErrorOccurred);
        }).catch(cancel => {

        });
      }
      else {
        this.validateHRAEntry(DoesErrorOccurred);
      }

    }
    else if (layout == 'Medical') {

      if (this.LstMedicalDependent.length == 0) {
        this.alertService.showInfo(`To continue, please add at least one item. `);
        return;
      }


      DoesErrorOccurred = false;

      this.LstMedicalDependent.forEach(element => {
        if (!element.IsDeleted) {
          element.isError = false;


          if (element.MedicalAmount <= 0 || element.MedicalAmount == null || element.MedicalAmount == '' || element.MedicalAmount == undefined) {
            element.isError = true;
            DoesErrorOccurred = true;

          }
          else if ((element.SelectedMedicalInsurantTab.Code.toUpperCase().toString() == 'SEC80D' || element.SelectedMedicalInsurantTab.Code.toUpperCase().toString() == 'SEC80D_P' || element.SelectedMedicalInsurantTab.Code.toUpperCase().toString() == 'SEC80D_S') && element.DependentType == null) {
            element.isError = true;
            DoesErrorOccurred = true;
          }
          else if (element.SelectedMedicalInsurantTab.Code.toUpperCase().toString() == 'SEC80DD' && element.DisabilityPercentage == null) {
            element.isError = true;
            DoesErrorOccurred = true;
          }
          else if (!element.IsProposed && this.currentTaxMode == 2 && element.DeclarationAttachments.length == 0) {
            element.isError = true;
            DoesErrorOccurred = true;
          }

          this.CheckFieldValidationOnMedical();
        }
      });

      if (DoesErrorOccurred) {
        this.IsFailedToValidate = true;
        // this.alertService.showWarning('Please fill in the required fields and try to save.');
        return;
      }
      this.loadingScreenService.startLoading();
      this.doPushNewMedicalExpenditure();
    }

  }

  validateHRAEntry(DoesErrorOccurred) {

    this.onChangeHRADeclaredAmount();
    let MaxRentAmount: number = 0;
    MaxRentAmount =
      this.selectedEntryType == 'month' ? 8333 :
        this.selectedEntryType == 'annual' ? 8333 * 12 :
          this.selectedEntryType == 'quarter' ? 8333 * 4 : 0
    if (this.isDuplicateRange) {
      this.alertService.showWarning("A certain date range is already persistent. Please choose the specific start and end dates.");
      return;
    }


    this.LstHouseRentAllowance.forEach(obj => {

      if (obj.EntryType == this.selectedEntryType && !obj.IsDeleted) {
        obj.IsError = false;

        if (obj.QuarterRange != null) {
          obj.StartDate = obj.QuarterRange[0];
          obj.EndDate = obj.QuarterRange[1];
        }
        if (obj.StartDate == null || obj.EndDate == null) {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }

        if (obj.HRAAmount == 0 || obj.HRAAmount == null || obj.HRAAmount == "") {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        else if (obj.CityName == null || obj.CityName == "") {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        else if (obj.RentalHouseAddress == null || obj.RentalHouseAddress == "") {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        else if (obj.AddressOfLandlord == null || obj.AddressOfLandlord == "") {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        else if (obj.NameOfLandlord == null || obj.NameOfLandlord == "") {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }

        else if (obj.NameOfLandlord == null || obj.NameOfLandlord == "") {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        else if (!obj.IsProposed && this.currentTaxMode == 2 && obj.DeclarationAttachments.length == 0) {

          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        // suddenly came 
        else if (obj.PANOfLandlord != null && (obj.PANOfLandlord == true || obj.PANOfLandlord == false || obj.PANOfLandlord == 'TRUE' || obj.PANOfLandlord == "FALSE" || obj.PANOfLandlord == 'true' || obj.PANOfLandlord == 'false')) {
          obj.PANOfLandlord = null;
        }
        else if (obj.PANOfLandlord != null && obj.PANOfLandlord != "") {
          const panRegex = /^([a-zA-Z]){3}([pPcCHhaAbBgGlLfFTtjJ]){1}([a-zA-Z]){1}([0-9]){4}([a-zA-Z]){1}?$/;
          const checkPanValid = panRegex.test(obj.PANOfLandlord);
          if (!checkPanValid) {
            obj.IsError = true;
            DoesErrorOccurred = true;
            return this.alertService.showWarning("Please match the requested format. (Ex: ABCPD1234E)");
          }

        }

        else {
          obj.IsError = false;
          DoesErrorOccurred = false;
        }
      }
    });



    if (this.TotalDeclaredAmount >= environment.environment.HRAMaximumAmountForValidation) {
      this.isPanMandatoryForHRA = true;
    } else {
      this.isPanMandatoryForHRA = false;
    }



    if (this.isPanMandatoryForHRA && this.LstHouseRentAllowance.filter(a => !a.IsDeleted && (a.PANOfLandlord == null || a.PANOfLandlord == '' || a.PANOfLandlord == undefined)).length > 0) {
      this.alertService.showWarning("According to a government notification, sharing a landlord's PAN is required. If the rent paid exceeds Rs." + environment.environment.HRAMaximumAmountForValidation + " pa.");
      return;
    } else {
      this.isPanMandatoryForHRA = false;
    }

    if (DoesErrorOccurred) {
      this.IsFailedToValidate = true;
      return;
    }


    this.loadingScreenService.startLoading();
    this.doPushNewHRA('new');
    // this.CheckRequiredValidation(layout);
  }
  // getValiationForValidList(tab) {
  //   return this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(c => c.selectedMedicalInsurantTab.ProductId == tab.ProductId).isError ? true : false;

  // }



  finalSave(mode) {
    try {

      this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
      if (this.IsNewTaxRegimeOpted) {

        if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {

          this.employeedetails.LstemployeeInvestmentDeductions = this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.Id != 0)
          this.employeedetails.LstemployeeInvestmentDeductions.forEach(e1 => {
            if (e1.FinancialYearId == this.selectedFinYear && (e1.EHPId <= 0 || e1.EHPId == null) && this.StampDutyFeeProduct.filter(y => y.ProductId == e1.ProductID).length == 0) {
              e1.Modetype = UIMode.Delete;
            }
          });
        }

        if (this.employeedetails.LstemployeeHouseRentDetails.length > 0) {
          this.employeedetails.LstemployeeHouseRentDetails = this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.Id != 0)

          this.employeedetails.LstemployeeHouseRentDetails.forEach(e1 => {
            if (e1.FinancialYearId == this.selectedFinYear) {
              e1.Modetype = UIMode.Delete;
            }
          });
        }

        if (this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) {
          this.employeedetails.LstEmployeeTaxExemptionDetails = this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.Id != 0)

          this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(e1 => {
            if (e1.FinancialYearId == this.selectedFinYear) {
              e1.Modetype = UIMode.Delete;
              if (e1.LstEmployeeExemptionBillDetails && e1.LstEmployeeExemptionBillDetails.length > 0) {
                e1.LstEmployeeExemptionBillDetails.forEach(e2 => {
                  e2.Modetype = UIMode.Delete;
                });
              }
            }


          });
        }

        if (this.employeedetails.LstemployeeOtherIncomeSources.length > 0) {
          this.employeedetails.LstemployeeOtherIncomeSources = this.employeedetails.LstemployeeOtherIncomeSources.filter(a => a.Id != 0)
          this.employeedetails.LstemployeeOtherIncomeSources.forEach(e1 => {
            if (e1.FinancialYearId == this.selectedFinYear) {
              e1.Modetype = UIMode.Delete;
            }
          });
        }

      }

      this.employeedetails.EmploymentContracts[0].Modetype = UIMode.Edit;
      this.employeedetails.Modetype = UIMode.Edit;
      this.employeeModel.oldobj = this.employeedetails;
      this.employeeModel.newobj = this.employeedetails;
      console.log('Employee Details ::', this.employeedetails);
      // this.loadingScreenService.stopLoading();
      // return;
      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.UpsertEmployeeInvestmentDetails(Employee_request_param).subscribe((data: any) => {
          console.log('RESULT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.', data);
          if (mode == 'TaxRegimeChange') {
            this.onRefresh();
          } else {

            this.visible_slider_medical == true ? true : this.onRefresh();
            if (data.Status) {
              this.visible_slider == true ? this.close_slider() : true;
              this.visible_slider_hra == true ? this.close_slider_hra() : true;
              this.visible_slider_medical == true ? this.close_slider_medical() : true;
            }
            else {
              this.alertService.showWarning(data.Message);
            }

          }
          this.loadingScreenService.stopLoading();
        },
          (err) => {

            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);
          });

      }

    } catch (err) {
      console.log('SAVEVEXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }


  CheckRequiredValidation(layout) {

    let RequiredFields = ["HRAAmount", "CityName", "StartDate", "EndDate", "AddressOfLandlord", "RentalHouseAddress", "NameOfLandlord"];
    this.IsFailedToValidate = false;
    this.InvalidFields = [];
    if (layout == 'HRA' && this.selectedEntryType == 'annual' && this.LstHouseRentAllowance.length > 0) {
      this.LstHouseRentAllowance.forEach(element => {
        RequiredFields.forEach(reqItems => {
          if (element.hasOwnProperty(reqItems) && (this.utilityService.isNullOrUndefined(element[reqItems]) || element[reqItems] == 0)) {
            this.InvalidFields.push(reqItems.replace(/[A-Z]/g, ' $&').trim());
          }
        });
      });
    }

    if (this.InvalidFields.length > 0) {
      this.IsFailedToValidate = true;
    }

  }

  viewInvestmentDetails(product: TaxInvestmentsSummary): void {

    if (product.Code == 'INVT') {
      this.visible_slider = true;
      this.DeclarationTitle = "Declaration : Investment/Deductions";
      this.drawerWidth = "640";
      var lstDeclarationCategories = [];

      lstDeclarationCategories = this.LstAllDeclarationProducts.filter(post => post.TaxCodeTypeId == TaxCodeType.Investment || post.TaxCodeTypeId == TaxCodeType.Deductions);
      this.selectedTaxDeclaration = TaxCodeType.Investment;
      this.LstDeclarationCategories = lstDeclarationCategories.filter(pro => pro.ProductCode.toUpperCase() != 'PF' && pro.ProductCode.toUpperCase() != 'PT' && pro.Code.toUpperCase().toString() != 'SEC80DD' && pro.Code.toUpperCase().toString() != 'SEC80DDB' && pro.Code.toUpperCase().toString() != 'SEC80D' && pro.Code.toUpperCase().toString() != 'SEC80D_S' && pro.Code.toUpperCase().toString() != 'SEC80D_P');
      // this.selectedItems.filter(a => !invalidEmployees.includes(a.EmployeeCode));
      // this.LstDeclarationCategories = _.filter(this.LstDeclarationCategories, item => environment.environment.MedicalExpendituresProductCodes.indexOf(item.ProductCode) === -1);
      this.doPushOldDeclarationData();
      this.TotalDeclaredAmount = 0;
      this.TotalApprovedAmount = 0;
      this.DeclarationItems.forEach(e => { if (e.DeclaredAmount > 0) { this.TotalDeclaredAmount += parseInt(e.DeclaredAmount) } })
      this.DeclarationItems.forEach(e => { if (e.ApprovedAmount > 0) { this.TotalApprovedAmount += parseInt(e.ApprovedAmount) } })

    }
    else if (product.Code == 'DEDUT') {
      this.addMedicalExpenditure();
      this.doPushOldMedicalExpenditureData();
    }
    else if (product.Code == 'HRA') {
      this.visible_slider_hra = true;
      this.doPushOldHRAData();
      this.LstHouseRentAllowance.length == 0 ? this.LstHouseRentAllowance = [] : true;
      this.addNewHRA(this.selectedEntryType, 'Old');
      this.selectedTaxDeclaration = TaxCodeType.Deductions;
    }

  }

  getCityName(CityId) {
    return this.LstEmployeeInvestmentLookup.CityList.length > 0 && this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == CityId).Code != undefined ? this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == CityId).Code : '';
  }

  doHideIgnoredProducts(product) {
    return environment.environment.NotAllowedInvestmentProducts.includes(product.ProductCode) ? false : true;
  }


  addNewTaxProductItem(product: TaxInvestmentsSummary): void {
    try {
      this.check_addingNewProduct().then((result) => {
        if (result) {
          this.IsDependentAdded = false;
          this.IsFailedToValidate = false;
          switch (product.Code) {
            case 'INVT':
              this.handleInvestmentDeclaration();
              break;
            case 'HRA':
              this.handleHRADeclaration();
              break;
            case 'DEDUT':
              this.handleMedicalExpenditureDeclaration();
              break;
            case 'HP':
              this.OpenHousePropertyModal();
              break;
            case 'EXMPT':
              this.doShowExemptionModal();
              break;
            case 'PERQ':
              this.openPerquisitesModal();
              break;
            case 'INCM':
              this.openOtherIncomeModal();
              break;
            case 'PE':
              this.openPreviousEmploymentModal();
              break;
            default:
              break;
          }
        }
      });
    } catch (error) {
      console.log('EXCEPTION ADD NEW :::', error);
    }
  }

  private handleInvestmentDeclaration(): void {
    this.visible_slider = true;
    this.DeclarationTitle = 'Declaration: Investment/Deductions';
    this.drawerWidth = '640';
    var lstDeclarationCategories = [];
    lstDeclarationCategories = this.LstAllDeclarationProducts.filter(post => post.TaxCodeTypeId === TaxCodeType.Investment || post.TaxCodeTypeId === TaxCodeType.Deductions);
    this.selectedTaxDeclaration = TaxCodeType.Investment;
    this.LstDeclarationCategories = lstDeclarationCategories.length > 0 && lstDeclarationCategories.filter(pro => pro.ProductCode.toUpperCase() != 'PF' && pro.ProductCode.toUpperCase() != 'PT' && pro.Code.toUpperCase().toString() != 'SEC80DD' && pro.Code.toUpperCase().toString() != 'SEC80DDB' && pro.Code.toUpperCase().toString() != 'SEC80D' && pro.Code.toUpperCase().toString() != 'SEC80D_S' && pro.Code.toUpperCase().toString() != 'SEC80D_P');

    this.doPushOldDeclarationData();
    this.calculateTotalDeclarationAmounts();
  }

  private handleHRADeclaration(): void {
    this.visible_slider_hra = true;
    this.doPushOldHRAData();
    this.LstHouseRentAllowance.length == 0 ? this.LstHouseRentAllowance = [] : true;
    this.addNewHRA(this.selectedEntryType, 'Old');
    this.selectedTaxDeclaration = TaxCodeType.Deductions;
  }

  private handleMedicalExpenditureDeclaration(): void {
    this.addMedicalExpenditure();
    this.doPushOldMedicalExpenditureData();
  }

  private calculateTotalDeclarationAmounts(): void {
    this.TotalDeclaredAmount = this.DeclarationItems.filter(e => e.DeclaredAmount > 0).reduce((sum, e) => sum + parseInt(e.DeclaredAmount), 0);
    this.TotalApprovedAmount = this.DeclarationItems.filter(e => e.ApprovedAmount > 0).reduce((sum, e) => sum + parseInt(e.ApprovedAmount), 0);
  }
  OpenHousePropertyModal() {
    let obje = Object.assign({}, this.employeeModel.oldobj);

    let CurrentFinYearHouseProperty = this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 && this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.FinancialYearId == this.selectedFinYear).length > 0 ? this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.FinancialYearId == this.selectedFinYear) : [];


    const modalRef = this.modalService.open(HousePropertyModalComponent, this.modalOption);
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = obje;
    modalRef.componentInstance.CurrentFinYearHouseProperty = CurrentFinYearHouseProperty;
    modalRef.componentInstance.LstAllDeclarationProducts = this.LstAllDeclarationProducts;
    modalRef.componentInstance.selectedFinYear = this.selectedFinYear;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.RoleCode = this.RoleCode;
    modalRef.componentInstance.HousePropertyDisclaimer = this.LstEmployeeInvestmentLookup.HousePropertyDisclaimer;


    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.onRefresh();
      } else {
        console.log('this.employeedetails', this.employeedetails);

      }
    }).catch((error) => {
      console.log(error);
    });
  }


  previewInvestmentItesm() {
    let obje = Object.assign({}, this.employeeModel.oldobj);
    const modalRef = this.modalService.open(InvestmentpreviewmodalComponent, this.modalOption);
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = obje;
    modalRef.componentInstance.LstAllDeclarationProducts = this.LstAllDeclarationProducts;
    modalRef.componentInstance.selectedFinYear = this.selectedFinYear;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = this.LstEmployeeInvestmentLookup;
    modalRef.componentInstance.TaxTotalDeclaredAmount = this.TaxTotalDeclaredAmount;
    modalRef.componentInstance.TaxTotalApprovedAmount = this.TaxTotalApprovedAmount;
    modalRef.componentInstance.TaxTotalQualifyingAmount = this.TaxTotalQualifyingAmount;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.RoleCode = this.RoleCode;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }


  openExemptionModal() {
    let obje = Object.assign({}, this.employeeModel.oldobj);
    const modalRef = this.modalService.open(ExemptionModalComponent, this.modalOption);
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = obje;
    modalRef.componentInstance.LstAllDeclarationProducts = this.LstAllDeclarationProducts;
    modalRef.componentInstance.selectedFinYear = this.selectedFinYear;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = this.LstEmployeeInvestmentLookup;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.RoleCode = this.RoleCode;


    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.onRefresh();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  openPerquisitesModal() {
    let obje = Object.assign({}, this.employeeModel.oldobj);
    const modalRef = this.modalService.open(PerquisitesModalComponent, this.modalOption);
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = obje;
    modalRef.componentInstance.LstAllDeclarationProducts = this.LstAllDeclarationProducts;
    modalRef.componentInstance.selectedFinYear = this.selectedFinYear;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = this.LstEmployeeInvestmentLookup;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.RoleCode = this.RoleCode;


    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.onRefresh();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  openOtherIncomeModal() {
    let obje = Object.assign({}, this.employeeModel.oldobj);
    const modalRef = this.modalService.open(OtherincomeModalComponent, this.modalOption);
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = obje;
    modalRef.componentInstance.LstAllDeclarationProducts = this.LstAllDeclarationProducts;
    modalRef.componentInstance.selectedFinYear = this.selectedFinYear;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = this.LstEmployeeInvestmentLookup;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.RoleCode = this.RoleCode;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.onRefresh();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  productNameWithLetterSpace(ProductName) {
    return ProductName.replace(/[A-Z]/g, ' $&').trim();
  }

  addCategory(): void { // unsed method
    try {

      this.visible_slider_hra = true;
      this.LstHouseRentAllowance.length == 0 ? this.LstHouseRentAllowance = [] : true;
      // this.addNewHRA(this.selectedEntryType);
      // this.visible_slider = true;
      // this.DeclarationTitle = "Declaration : Investment";
      // this.drawerWidth = "640";
      // this.selectedTaxDeclaration = TaxCodeType.Deductions;
      // // this.LstDeclarationCategories = this.LstAllDeclarationProducts.filter(post => post.TaxCodeTypeId == TaxCodeType.Investment);
      // this.LstDeclarationCategories = this.LstAllDeclarationProducts.filter(post => post.TaxCodeTypeId == TaxCodeType.Deductions);

      // this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.forEach(element => {
      //   element['CategoryNameSection'] = `${element.ProductName.replace(/[A-Z]/g, ' $&').trim()} - ${element.b[0].Code}`;
      // });
      // this.onSelectDeclarationMode('investments');
    }
    catch (exception) {
      console.log('Exception :::: ', exception);
    }

  }

  deleteInvestmentProduct(item) {


    if (this.essService.isGuid(item.Id)) {
      var index = this.DeclarationItems.indexOf(item);
      if (index !== -1) {
        this.DeclarationItems.splice(index, 1);
      }
    } else {
      this.alertService.confirmSwal("Are you sure?", "This item will be deleted immediately. You can't undo this record.", "Ok").then((result) => {

        item.IsDeleted = true;
        item.Modetype = UIMode.Delete;
        console.log('DeclarationItems :::::::::::', this.DeclarationItems);
        this.TotalDeclaredAmount = this.TotalDeclaredAmount > 0 ? Number(this.TotalDeclaredAmount) - Number(item.DeclaredAmount) : 0

      }).catch(cancel => {

      });
    }


  }


  // HOUSE RENT ALLOWANCE

  getQuarter(startMonth) {

    var obj = { quarter1: null, quarter2: null, quarter3: null, quarter4: null };
    if (startMonth == 'january') {

      obj.quarter1 = { start: moment().month(0).startOf('month'), end: moment().month(2).endOf('month') }
      obj.quarter2 = { start: moment().month(3).startOf('month'), end: moment().month(5).endOf('month') }
      obj.quarter3 = { start: moment().month(6).startOf('month'), end: moment().month(8).endOf('month') }
      obj.quarter4 = { start: moment().month(9).startOf('month'), end: moment().month(11).endOf('month') }
      return obj;
    }
    else if (startMonth == 'april') {

      obj.quarter1 = { start: moment(new Date(this.FinancialStartDate)).month(3).startOf('month'), end: moment(new Date(this.FinancialStartDate)).month(5).endOf('month') }
      obj.quarter2 = { start: moment(new Date(this.FinancialStartDate)).month(6).startOf('month'), end: moment(new Date(this.FinancialStartDate)).month(8).endOf('month') }
      obj.quarter3 = { start: moment(new Date(this.FinancialStartDate)).month(9).startOf('month'), end: moment(new Date(this.FinancialStartDate)).month(11).endOf('month') }
      obj.quarter4 = { start: moment(new Date(this.FinancialStartDate)).month(0).startOf('month').add('years', 1), end: moment(new Date(this.FinancialStartDate)).month(2).endOf('month').add('years', 1) }

      return obj;
    }
  }

  getQuarterRange(quarter) {
    const start = moment().quarter(quarter).startOf('quarter');
    const end = moment().quarter(quarter).endOf('quarter');


    return { start, end };
  }

  doChangeHRAFinancialQuarterDate(event, item) {
    console.log('eve', event);
    console.log('item', item);
    let customHRAs = [];
    this.isDuplicateRange = false;
    customHRAs = this.LstHouseRentAllowance.filter(a => !a.IsDeleted && a.EntryType == this.selectedEntryType && a.Id != item.Id);

    for (let index = 0; index < customHRAs.length; index++) {
      const e1 = customHRAs[index];
      let startDt = new Date(moment(e1.StartDate).format('YYYY-MM-DD'));
      let endDt = new Date(moment(e1.EndDate).format('YYYY-MM-DD'));
      let event_startDt = new Date(moment(event[0]).format('YYYY-MM-DD'));
      let event_endDt = new Date(moment(event[1]).format('YYYY-MM-DD'));

      this.isDuplicateRange = moment(event_startDt).isBetween(moment(startDt).format('YYYY-MM-DD'), moment(endDt).format('YYYY-MM-DD')); // true
      this.isDuplicateRange == false ? this.isDuplicateRange = moment(event_endDt).isBetween(moment(startDt).format('YYYY-MM-DD'), moment(endDt).format('YYYY-MM-DD')) : true; // true
      this.isDuplicateRange == false ? this.isDuplicateRange = moment(event_startDt).isSame(moment(startDt).format('YYYY-MM-DD')) : null;
      this.isDuplicateRange == false ? this.isDuplicateRange = moment(event_startDt).isSame(moment(endDt).format('YYYY-MM-DD')) : null;
      this.isDuplicateRange == false ? this.isDuplicateRange = moment(event_endDt).isSame(moment(startDt).format('YYYY-MM-DD')) : null;
      this.isDuplicateRange == false ? this.isDuplicateRange = moment(event_endDt).isSame(moment(endDt).format('YYYY-MM-DD')) : null;

      if (this.isDuplicateRange) {
        event.length = 0;
        event = null;
        this.alertService.showWarning("A certain date range is already persistent. Please choose the specific start and end dates.");
        item.QuarterRange = null;
        item.StartDate = null;
        item.EndDate = null;
        let currentRow = this.LstHouseRentAllowance.find(dt => dt.Id == item.Id);
        console.log('currentRow', currentRow);
        currentRow.QuarterRange = null;
        console.log('item', item);

        break;
      }
    }
    if (this.isDuplicateRange) {
      item.QuarterRange = null;
      item.StartDate = null;
      item.EndDate = null;
      event.length = 0;
      event = null;
      return;
    }

    if (event != null && event.length > 0) {
      item.StartDate = new Date(event[0]);
      item.EndDate = new Date(event[1])
      item.Modetype = UIMode.Edit;
      item.ApprovedAmount = 0;
    }
  }




  addNewHRA(EntryType, action) {
    this.isDuplicateRange = false;
    if (action == 'Old' && this.selectedEntryType == 'custom' && this.LstHouseRentAllowance.filter(z => !this.essService.isGuid(z.Id) && z.EntryType == this.selectedEntryType && !z.IsDeleted).length > 0) {
      return;
    }


    this.isPanMandatoryForHRA = false;
    if (this.LstHouseRentAllowance.length > 0) {

      _.remove(this.LstHouseRentAllowance, o => this.essService.isGuid(o.Id) === true && o.EntryType != this.selectedEntryType); // removing the guid-based old records 
      // _.remove(this.LstHouseRentAllowance, o => this.essService.isGuid(o.Id) == true );
      // this.LstHouseRentAllowance.forEach(i => {
      //   if(this.essService.isGuid(i.Id)){
      //     console.log(i.Id);

      //     this.LstHouseRentAllowance.splice(i, 1);
      //   }

      // });

    }

    if (EntryType == 'quarter') {


      if (this.LstHouseRentAllowance.filter(a => a.IsDeleted == false).length == 4 && this.LstHouseRentAllowance.filter(a => a.IsDeleted).length > 0) {
        this.LstHouseRentAllowance.forEach(row => {
          if (row.EntryType == 'quarter' && row.IsDeleted == true) {
            row.IsDeleted = false;
            row.Modetype = UIMode.Edit;
          }
        });

      } else if (this.LstHouseRentAllowance.filter(a => a.IsDeleted == false).length < 4) {
        const obj = this.getQuarter('april');
        for (let i = 0; i < 4; i++) {
          this.LstHouseRentAllowance.push({
            HRAAmount: 0,
            IsMetro: false,
            CityName: "",
            QuarterRange: [new Date(obj[`quarter${i + 1}`].start), new Date(obj[`quarter${i + 1}`].end)],
            StartDate: new Date(obj[`quarter${i + 1}`].start),
            EndDate: new Date(obj[`quarter${i + 1}`].end),
            RentalHouseAddress: "",
            AddressOfLandlord: "",
            NameOfLandlord: "",
            PANOfLandlord: null,
            HRARemarks: "",
            Id: UUID.UUID(),
            DeclarationAttachments: [],
            IsDeleted: false,
            Modetype: UIMode.Edit,
            EntryType: EntryType,
            ApprovedAmount: 0,
            ApproverRemarks: '',
            IsProposed: this.currentTaxMode == 1 ? true : false,
            Status: 0
          });
        }
      }
    } else if (EntryType == 'annual' || EntryType == 'custom') {
      if (this.LstHouseRentAllowance.filter(a => a.IsDeleted == false).length == 0) {
        this.LstHouseRentAllowance.push({
          HRAAmount: 0,
          IsMetro: false,
          CityName: "",
          QuarterRange: null,
          StartDate: EntryType == 'annual' ? new Date(this.FinancialStartDate) : null,
          EndDate: EntryType == 'annual' ? new Date(this.FinancialEndDate) : null,
          RentalHouseAddress: "",
          AddressOfLandlord: "",
          NameOfLandlord: "",
          PANOfLandlord: null,
          HRARemarks: "",
          Id: UUID.UUID(),
          DeclarationAttachments: [],
          IsDeleted: false,
          Modetype: UIMode.Edit,
          EntryType: EntryType,
          ApprovedAmount: 0,
          ApproverRemarks: '',
          IsProposed: this.currentTaxMode == 1 ? true : false,
          Status: 0
        });
      } else if (EntryType == 'custom') {
        this.LstHouseRentAllowance.push({
          HRAAmount: 0,
          IsMetro: false,
          CityName: "",
          QuarterRange: null,
          StartDate: EntryType == 'annual' ? new Date(this.FinancialStartDate) : null,
          EndDate: EntryType == 'annual' ? new Date(this.FinancialEndDate) : null,
          RentalHouseAddress: "",
          AddressOfLandlord: "",
          NameOfLandlord: "",
          PANOfLandlord: null,
          HRARemarks: "",
          Id: UUID.UUID(),
          DeclarationAttachments: [],
          IsDeleted: false,
          Modetype: UIMode.Edit,
          EntryType: EntryType,
          ApprovedAmount: 0,
          ApproverRemarks: '',
          IsProposed: this.currentTaxMode == 1 ? true : false,
          Status: 0
        });
      }
    }
    else if (EntryType == 'month' && this.LstHouseRentAllowance.filter(a => a.IsDeleted == false && a.EntryType == EntryType).length == 0) {

      let today = new Date(this.ISTTime);
      let stdate = new Date(this.ISTTime);
      if (today.getMonth() > 2) {
        stdate = new Date(today.getFullYear(), 3, 1);
      } else {
        let year = (today.getFullYear() - 1);
        stdate = new Date(year, 3, 1);
      }
      let istdate = moment(stdate).format('YYYY-MM-DD');
      var currentDate = moment(new Date(this.FinancialStartDate));

      for (let i = 0; i < 12; i++) {
        var futureMonth = moment(currentDate).add(i, 'M');
        const startOfMonth = moment(futureMonth).startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment(futureMonth).endOf('month').format('YYYY-MM-DD');
        console.log('startOfMonth :', startOfMonth);
        console.log('endOfMonth :', endOfMonth);
        this.LstHouseRentAllowance.push({
          EntryType: this.selectedEntryType,
          Id: UUID.UUID(),
          QuarterRange: null,
          StartDate: new Date(startOfMonth),
          EndDate: new Date(endOfMonth),
          CityName: null,
          HRAAmount: null,
          PANOfLandlord: '',
          AddressOfLandlord: '',
          NameOfLandlord: '',
          RentalHouseAddress: '',
          HRARemarks: '',
          IsMetro: false,
          IsDeleted: false,
          DeclarationAttachments: [],
          Modetype: UIMode.Edit,
          ApprovedAmount: 0,
          ApproverRemarks: '',
          IsProposed: this.currentTaxMode == 1 ? true : false,
          Status: 0


        })
        console.log('LST HRA', this.LstHouseRentAllowance);
      }
    }


    console.log('Lst House Rent Allowance', this.LstHouseRentAllowance);

  }

  OnChangeEntryType(enums) {

    console.log('max ::', this.HRAmaxDate);

    // OLD
    this.IsHRADataExists = false;
    this.IsFailedToValidate = false;
    this.isPanMandatoryForHRA = false;

    if (this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.filter(a => this.essService.isGuid(a.Id) == false).length > 0) {
      this.LstHouseRentAllowance.forEach(e => {
        if (!this.essService.isGuid(e.Id))
          e.Modetype = UIMode.Delete;
        e.IsDeleted = true;
      });
    }

    // NEW
    // this.previousselectedEntryType = this.selectedEntryType;
    // this.alertService.confirmSwal("Are you sure?", "Before altering the entity type : remember that changing an entity type might lost some or all of the data in a field", "Ok").then((result) => { 
    this.TotalDeclaredAmount = 0;
    this.selectedEntryType = enums;
    this.previousselectedEntryType = enums;
    this.LstHouseRentAllowance.length == 0 ? this.LstHouseRentAllowance = [] : true;
    this.addNewHRA(enums, 'New');


    // if (this.LstHouseRentAllowance.length > 0 && this.selectedEntryType != this.oldEntryType) {
    //   this.alertService.confirmSwal("Are you sure you want clear previously added items?", "Observer you actions - If you are sure they are no longer editing this data.", "Yes, Clear").then(result => {

    //     this.deleteAll(null);
    //   })
    //     .catch(error => {

    //       this.EntryType = this.oldEntryType;
    //     });
    //   return;
    // } else {




    // }).catch(cancel => {
    //   alert(this.previousselectedEntryType);
    //   this.selectedEntryType = this.previousselectedEntryType;
    //   alert(this.selectedEntryType)
    // });


  }
  getLimitedHRA() {

    return this.LstHouseRentAllowance.filter(a => !a.IsDeleted && a.EntryType == this.selectedEntryType);
  }

  deleteNewHRA(item, index) {
    if (!this.essService.isGuid(item.Id)) {
      item.Modetype = UIMode.Delete;
    } else {
      item.Modetype = UIMode.None;
    }
    item.IsDeleted = true;
  }
  addLandloadAddress(item) {
    const modalRef = this.modalService.open(ManageinvestmentComponent, this.modalOption);
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.componentInstance.TotalDeclaredAmount = this.TotalDeclaredAmount;
    modalRef.componentInstance.isPanMandatoryForHRA = this.isPanMandatoryForHRA;
    modalRef.componentInstance.RoleCode = this.RoleCode;

    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });
  }

  viewLandloadAddress(item) {
    const modalRef = this.modalService.open(ManageinvestmentComponent, this.modalOption);
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.componentInstance.TotalDeclaredAmount = this.TotalDeclaredAmount;
    modalRef.componentInstance.isPanMandatoryForHRA = this.isPanMandatoryForHRA;
    modalRef.componentInstance.RoleCode = this.RoleCode;


    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });
  }

  deleteCustomItem(item, index) {

    this.alertService.confirmSwal("Are you sure?", "This item will be deleted immediately. You can't undo this record.", "Ok").then((result) => {

      if (!this.essService.isGuid(item.Id)) {
        item.Modetype = UIMode.Delete;
        item.IsDeleted = true;
      } else {
        var index1 = this.LstHouseRentAllowance.map(function (el) {
          return el.Id
        }).indexOf(item.Id)

        this.LstHouseRentAllowance.splice(index1, 1);

      }
    }).catch(cancel => {

    });


  }







  onChangeHRA_table(item) {

    if (this.TotalDeclaredAmount >= environment.environment.HRAMaximumAmountForValidation) {
      this.isPanMandatoryForHRA = true;
    } else {
      this.isPanMandatoryForHRA = false;
    }

    // this.LstHouseRentAllowance.filter(a => !a.IsDeleted);
    this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.forEach(element => {
      if (!element.IsDeleted && (element.Status == 0 || element.Status == 2) && element.Modetype != UIMode.Delete) {
        if (!element.IsDeleted && element.Modetype != UIMode.Delete) {
          element.Modetype = UIMode.Edit;

        }
      }
    });

    this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 1 : item.Status = 0;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
    item.Modetype = UIMode.Edit;

    item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
      this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 1 : e1.Status = 0;
      !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.ApprovedAmount = 0 : true;
    });
  }

  fillBelow(item) {


    this.LstHouseRentAllowance.forEach(element => {
      if (element.EntryType == this.selectedEntryType && element.Modetype != UIMode.Delete && !element.IsDeleted) {

        element.AddressOfLandlord = item.AddressOfLandlord;
        this.investmentService.PermissibleRoles(this.RoleCode) ? element.Status = 1 : element.Status = 0;

        item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
          this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 1 : e1.Status = 0;
          !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.ApprovedAmount = 0 : true;
        });

        element.CityName = item.CityName;
        element.DeclarationAttachments = item.DeclarationAttachments;
        element.EntryType = this.selectedEntryType;
        element.HRAAmount = item.HRAAmount;
        element.HRARemarks = item.HRARemarks;
        element.IsMetro = item.IsMetro;
        element.NameOfLandlord = item.NameOfLandlord;
        element.PANOfLandlord = item.PANOfLandlord;
        element.RentalHouseAddress = item.RentalHouseAddress;
        element.Modetype = UIMode.Edit;
        this.investmentService.PermissibleRoles(this.RoleCode) ? element.ApprovedAmount = item.ApprovedAmount : true;
      }
    });


    this.onChangeHRABulkDeclaredAmount();
  }



  doChangeAnnualHRA(item) {
    item.Modetype = UIMode.Edit;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
  }
  doChangeHRAStartDate(HRAStartDate, HRAItem) {


  }

  checkIsAnyValidRecordToDeleteHRA() {

    this.LstHouseRentAllowance.filter(a => !a.IsDeleted && !this.isGuidId(a.Id)).length > 0 ? true : false
  }

  delete_hra() {
    this.alertService.confirmSwal("Are you sure?", "This item will be deleted immediately. You can't undo this record.", "Ok").then((result) => {
      this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.forEach(item => {
        item.Modetype = UIMode.Delete;
      });
      this.loadingScreenService.startLoading();
      this.doPushNewHRA('delete');
    }).catch(cancel => {
      // alert(this.previousselectedEntryType);
      // this.selectedEntryType = this.previousselectedEntryType;
      // alert(this.selectedEntryType)
    });
  }

  // CalcHRA() {
  //   var sum = 0
  //   this.LstHouseRentAllowance.forEach(e => { sum += parseInt(e.RentAmountPaid) })
  //   this.KeyAmount = sum;
  //   return sum;
  // }
  // onChangeHRA_table() {
  //   var sum = 0
  //   this.LstHouseRentAllowance.forEach(e => { sum += parseInt(e.RentAmountPaid) })
  //   console.log('SUM OF AMOUNT :', sum);

  //   if (sum >= environment.environment.HRAMaximumAmountForValidation) {
  //     this.isPanMandatoryForHRA = true;
  //   } else {
  //     this.isPanMandatoryForHRA = false;
  //   }

  // }

  // MEDICAL EXPENDITURE
  getAllowableCodeForDependent(selectedMedical) {
    // return  selectedMedical.Code.some(item => item === 'Sec80DDB' || item === 'Sec80D' || item === 'Sec80D_S' || item === 'Sec80D_P') ? true : false;
    return (selectedMedical.Code.toUpperCase().toString() == 'SEC80DDB' || selectedMedical.Code.toUpperCase().toString() == 'SEC80D' || selectedMedical.Code.toUpperCase().toString() == 'SEC80D_S' || selectedMedical.Code.toUpperCase().toString() == 'SEC80D_P') ? true : false;
  }
  getAllowableCodeForDisability(selectedMedical) {
    return selectedMedical.Code.toUpperCase().toString() == ('SEC80DD') ? true : false;

  }
  addMedicalExpenditure() {
    this.visible_slider_medical = true;
    this.LstMedicalInsuranceProduct = this.LstAllDeclarationProducts.filter(a => a.Code.toUpperCase().toString() == 'SEC80DD' || a.Code.toUpperCase().toString() == 'SEC80DDB' || a.Code.toUpperCase().toString() == "SEC80D" || a.Code.toUpperCase().toString() == "SEC80D_P" || a.Code.toUpperCase().toString() == "SEC80D_S");
    this.LstMedicalInsuranceProduct = this.LstMedicalInsuranceProduct.filter(b => b.ProductCode.toUpperCase().toString() != 'FIXEDINSURANCE');

    this.LstMedicalInsuranceProduct.sort((a, b) => a.DisplayOrder - b.DisplayOrder);

    this.LstMedicalInsuranceProduct.length > 0 ? this.selectedMedicalInsurantTab = this.LstMedicalInsuranceProduct[0] : true;
  }
  AddDependent(targetValue) {
    this.IsOpenDependentCard = targetValue;
  }

  PushDependent() {
    this.IsDependentAdded = true;

    if (!this.utilityService.isNullOrUndefined(this.DependentName) && !this.utilityService.isNullOrUndefined(this.Relationship) && !this.utilityService.isNullOrUndefined(this.DateOfBirth)) {
      if (this.Relationship != '5' && this.Relationship != '4' && this.LstDependent.length > 0 && _.find(this.LstDependent, (a) => a.Id != this.MedicalDependentId && a.Relationship == this.Relationship) != null

      ) {
        this.IsDependentAdded = false;
        this.alertService.showWarning("The required dependant relationship details is already there");
        return;
      }


      this.LstDependent.push({
        Id: UUID.UUID(),
        DependentName: this.DependentName,
        Relationship: this.Relationship,
        DateOfBirth: this.DateOfBirth
      });

      this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(x => this.Relationship != '5' && this.Relationship != '4' && x.Relationship == this.Relationship) ? this.LstMedicalDependent.find(x => this.Relationship != '5' && this.Relationship != '4' && x.Relationship == this.Relationship).DependentName = this.DependentName : true;

      this.IsDependentAdded = false;
      this.DependentName = null;
      this.Relationship = null;
      this.DateOfBirth = null;
    }


  }

  editDependent(item, indx) {
    this.DependentName = item.DependentName;
    this.Relationship = item.Relationship;
    this.DateOfBirth = item.DateOfBirth;
    this.MedicalDependentId = item.Id;
    this.LstDependent.splice(indx, 1);


  }

  deleteDependent(item, indx) {
    this.LstDependent.splice(indx, 1);
  }
  CHeckIsNull() {
    return this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab).length > 0 ? true : false;
  }

  deleteMedicalDependent(medicalItem, indx) {

    console.log('medicalItem', medicalItem);

    if (this.essService.isGuid(medicalItem.Id)) {
      this.LstMedicalDependent.splice(indx, 1);
    } else {
      medicalItem.IsDeleted = true;
      medicalItem.Modetype = UIMode.Delete;
      medicalItem.Amount = 0;

    }
    if (!this.investmentService.PermissibleRoles(this.RoleCode) && this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab).length > 0) {
      let isParentItemExists = this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab);

      console.log('isParentItemExists', isParentItemExists);

      isParentItemExists != null && isParentItemExists.length > 0 && isParentItemExists.forEach(e3 => {

        e3.Modetype = UIMode.Edit;
        e3.Status = 0;
        e3.ApprovedAmount = 0;
        e3.DeclarationAttachments != null && e3.DeclarationAttachments.length > 0 && e3.DeclarationAttachments.forEach(e1 => {
          e1.Status = 0;
        });

      });
    }


  }

  CheckIsNullOrEmpty(FieldName) {
    return this.utilityService.isNullOrUndefined(FieldName);
  }

  getRelationShipName(RId) {
    return this.relationship.find(a => a.id == RId).name;
  }
  getDateOfBirthFormat(DateOfBirth) {
    return moment(new Date(DateOfBirth)).format('DD-MM-YYYY');
  }

  handleTabClick(tab) {

    this.selectedMedicalInsurantTab = tab;
  }
  OnChangeMedicalApprovedData(medical) {
    medical.Modetype = UIMode.Edit;
    medical.DeclarationAttachments != null && medical.DeclarationAttachments.length > 0 && medical.DeclarationAttachments.forEach(e1 => {
      e1.Status = 1;
    });

    // if (this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab).length > 0) {
    //   let isParentItemExists = this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab);

    //   console.log('isParentItemExists', isParentItemExists);

    //   isParentItemExists != null && isParentItemExists.length > 0 && isParentItemExists.forEach(e3 => {

    //     e3.Modetype = UIMode.Edit;
    //     e3.Status = 1;
    //     // e3.ApprovedAmount = medical.ApprovedAmount;
    //     e3.DeclarationAttachments != null && e3.DeclarationAttachments.length > 0 && e3.DeclarationAttachments.forEach(e1 => {
    //       e1.Status = 1;
    //     });

    //   });
    // }
  }

  OnChangeMedicalData(medical) {
    medical.Modetype = UIMode.Edit;



    this.investmentService.PermissibleRoles(this.RoleCode) ? medical.Status = 1 : medical.Status = 0;
    this.investmentService.PermissibleRoles(this.RoleCode) ? medical.ApprovedAmount = medical.MedicalAmount : medical.ApprovedAmount = 0;
    medical.DeclarationAttachments != null && medical.DeclarationAttachments.length > 0 && medical.DeclarationAttachments.forEach(e1 => {
      this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 1 : e1.Status = 0;
    });


    if (!this.investmentService.PermissibleRoles(this.RoleCode) && this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab).length > 0) {
      let isParentItemExists = this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab);

      console.log('isParentItemExists', isParentItemExists);

      isParentItemExists != null && isParentItemExists.length > 0 && isParentItemExists.forEach(e3 => {

        e3.Modetype = UIMode.Edit;
        this.investmentService.PermissibleRoles(this.RoleCode) ? e3.Status = 1 : e3.Status = 0;
        this.investmentService.PermissibleRoles(this.RoleCode) ? e3.ApprovedAmount = e3.MedicalAmount : e3.ApprovedAmount = 0;
        e3.DeclarationAttachments != null && e3.DeclarationAttachments.length > 0 && e3.DeclarationAttachments.forEach(e1 => {
          this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 1 : e1.Status = 0;
        });

      });
    }

  }

  CheckFieldValidationOnMedical() {
    this.LstMedicalInsuranceProduct.forEach(prod => {

      if (this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(medical => medical.SelectedMedicalInsurantTab.ProductId == prod.ProductId && medical.IsDeleted == false && medical.isError)) {
        prod.IsInvalid = true;
      } else {
        prod.IsInvalid = false;
      }
    });


    //     if (this.LstMedicalDependent.length > 0) {
    //       for (let q = 0; q < this.LstMedicalDependent.length; q++) {
    //         const medical = this.LstMedicalDependent[q];
    //         if (medical.SelectedMedicalInsurantTab.ProductId
    //           == tab.ProductId && !medical.IsDeleted && medical.isError) {
    //           return true;
    //         } else
    //           return false;
    //       }
    //     }


  }
  getMedicalExpenditureStatus(selectedTab) {

    if (this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == selectedTab.ProductId && a.IsDeleted == false) != undefined) {
      if (this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == selectedTab.ProductId && a.IsDeleted == false && a.IsProposed == false)) {
        return this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == selectedTab.ProductId && a.IsDeleted == false && a.IsProposed == false).Status
      } else {
        return 5;
      }

    }

    // return this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == selectedTab.ProductId) != undefined
    //   ? this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == selectedTab.ProductId).Status :  9 ;

  }
  getMedicalExpenditureStatusRemarks(selectedTab) {
    return this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == selectedTab.ProductId) != undefined
      ? this.LstMedicalDependent.find(a => !a.IsProposed && a.SelectedMedicalInsurantTab.ProductId == selectedTab.ProductId).ApproverRemarks : 5
  }

  isApprovedRejectedMedicalItems() {


    if (this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId.toString() == (this.selectedMedicalInsurantTab.ProductId.toString())) != undefined) {
      if (this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == this.selectedMedicalInsurantTab.ProductId && a.IsDeleted == false && a.IsProposed == false)) {
        return (this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == this.selectedMedicalInsurantTab.ProductId && a.IsDeleted == false && a.IsProposed == false).Status == 1 || this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab.ProductId == this.selectedMedicalInsurantTab.ProductId && a.IsDeleted == false && a.IsProposed == false).Status == 2) ? true : false
      } else {
        return false;
      }

    }
  }


  UseListedDependents() {

    if (this.LstDependent.length == 0) {
      this.alertService.showWarning("Please add at least one Insured Person relationship and try again.");
      return;
    }
    if (this.LstDependent.length > 0) {
      let toBeAdded = [];
      // this.LstMedicalDependent = this.LstMedicalDependent.concat(this.LstDependent.map(x => ({

      //   Relationship : x.RelationShip,
      //   DependentName : x.DependentName,
      //   DateOfBirth : new Date(x.DateOfBirth),
      //   Id : UUID.UUID(),
      //   DependentType: null,
      //   MedicalAmount: null,
      //   DisabilityPercentage: null,
      //   SelectedMedicalInsurantTab: this.selectedMedicalInsurantTab,
      //   MedicalRemarks: '',
      //   DeclarationAttachments: [],
      // })));

      this.LstDependent.forEach(element => {
        var obje = {
          DependentType: null, MedicalAmount: null, DisabilityPercentage: null, SelectedMedicalInsurantTab: null, MedicalRemarks: null,
          DeclarationAttachments: [], Id: null, Relationship: null, DependentName: null, DateOfBirth: null, IsDeleted: false, isError: false,
          Modetype: UIMode.None, ApprovedAmount: 0, ApproverRemarks: null, EmpInvestmentDeductionId: null, Status: 0, IsProposed: this.currentTaxMode == 1 ? true : false
        };

        if (this.LstMedicalDependent.find(x => x.Relationship != 5 && x.Relationship != 4 && !x.IsDeleted && x.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab && x.Relationship == element.Relationship)) {
          return;
        }
        else if (this.LstMedicalDependent.filter(x => x.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab).length >= this.LstDependent.length) {
          return;
        }

        else {
          obje.DependentType = null,
            obje.MedicalAmount = null,
            obje.DisabilityPercentage = null,
            obje.SelectedMedicalInsurantTab = this.selectedMedicalInsurantTab,
            obje.MedicalRemarks = '',
            obje.DeclarationAttachments = [],
            obje.Id = UUID.UUID(),
            obje.Relationship = element.Relationship,
            obje.DependentName = element.DependentName,
            obje.DateOfBirth = new Date(element.DateOfBirth),
            obje.IsDeleted = false,
            obje.isError = false,
            obje.Modetype = UIMode.Edit,
            obje.ApprovedAmount = 0,
            obje.ApproverRemarks = null,
            obje.EmpInvestmentDeductionId = 0,
            obje.Status = 0,
            obje.IsProposed = this.currentTaxMode == 1 ? true : false;

          if (this.LstMedicalDependent.find(a => a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab &&
            a.Relationship == obje.Relationship && a.DependentName == obje.DependentName && moment(new Date(obje.DateOfBirth)).format('YYYY-MM-DD') == moment(new Date(obje.DateOfBirth)).format('YYYY-MM-DD'))) {
            console.log('bbbb', obje);

            return;
          }
          toBeAdded.push(obje);
        }
      });



      this.LstMedicalDependent = this.LstMedicalDependent.concat(toBeAdded);

      console.log('selectedMedicalInsurantTab', this.selectedMedicalInsurantTab);

      if (!this.investmentService.PermissibleRoles(this.RoleCode)) {
        // allow to approve
        if (this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab).length > 0) {
          let isParentItemExists = this.LstMedicalDependent.filter(a => !a.IsDeleted && a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab);

          console.log('isParentItemExists', isParentItemExists);

          isParentItemExists != null && isParentItemExists.length > 0 && isParentItemExists.forEach(e3 => {

            e3.Modetype = UIMode.Edit;
            e3.Status = 0;
            e3.ApprovedAmount = 0;
            e3.DeclarationAttachments != null && e3.DeclarationAttachments.length > 0 && e3.DeclarationAttachments.forEach(e1 => {
              e1.Status = 0;
            });

          });
        }
      }

      console.log('Lst Medical Dependent', this.LstMedicalDependent);
      console.log('Lst Medical Dependent', this.LstMedicalInsuranceProduct);

    }
  }
  getLimitedDependents() {

    return this.LstMedicalDependent.filter(a => a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab);
  }

  IsMedicalDependentExists() {
    return this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.filter(z => z.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab).length > 0 ? true : false;
  }

  CheckApprovedOrRejected() {

    return this.LstMedicalDependent.filter(a => a.SelectedMedicalInsurantTab == this.selectedMedicalInsurantTab && (a.Status == 0 || a.Status == 2)).length > 0 ? true : false;

  }

  onSelectDeclarationMode(decl_mode): void {
    this.selectedCategory = null;
    try {
      if (decl_mode == 'investments') {
        this.LstDeclarationCategories = _.filter(this.LstAllDeclarationProducts, function (post) {
          return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Investment });
        });
      } else {
        this.LstDeclarationCategories = _.filter(this.LstAllDeclarationProducts, function (post) {
          return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Deductions });
        });

      }
    }
    catch (exception) {
      console.log('Exception :::: ', exception);

    }
  }
  onChangeDeclarations(event: any): void {

    this.sectionName = event.b[0].Code;
    this.sectionDescription = event.b[0].Description;
    this.sectionQualifyingAmount = event.b[0].ThresholdLimit;

  }
  close_slider() {
    this.visible_slider = false;
  }

  close_slider_hra() {
    this.visible_slider_hra = false;
  }
  close_slider_medical() {
    this.onRefresh();
    this.visible_slider_medical = false;
  }





  /* #region  Document Upload/Delete */

  onFileUpload(e, item, layout) {
    // for (var i = 0; i < e.files.length; i++) {
    this.isLoading = false;
    item.Modetype = UIMode.Edit;
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
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.docSpinnerText = "Uploading";
      this.selectedUploadIndex = item.Id;
      let FileUrl = (reader.result as string).split(",")[1];
      // this.doAsyncUpload(FileUrl, file.name, item);
      this.investmentService.doAsyncUpload(FileUrl, file.name, item, this.employeedetails.Id).then((s3DocumentId) => {

        if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
          console.log('item', item);

          let LstAttachments = [{
            FileName: file.name,
            DocumentId: s3DocumentId,
            Status: 0,
            ApprovedAmount: 0
          }];
          if (layout == 'Medical') {
            var _tmpList = this.LstMedicalDependent.filter(a => a.SelectedMedicalInsurantTab.ProductId == item.SelectedMedicalInsurantTab.ProductId);
            if (_tmpList.length > 0) {
              _tmpList.forEach(element => {
                element.Status = 0;
                element.Modetype = UIMode.Edit;
                element.DeclarationAttachments = element.DeclarationAttachments.concat(LstAttachments)
              });
            }
          } else {
            !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
            !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
            !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
            item.Modetype = UIMode.Edit;
            item.DeclarationAttachments = item.DeclarationAttachments.concat(LstAttachments);

          }

          item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
            !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 0 : true;
            !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.ApprovedAmount = 0 : true;
          });


          this.unsavedDocumentLst.push({
            Id: s3DocumentId
          })
          this.isLoading = true;
          !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
          !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
          this.isLoading = true;
          this.alertService.showSuccess("You have successfully uploaded this file!")
          this.selectedUploadIndex = null;
        }
        else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to delete! ");

        }
      });
    };
    // }


  }

  // doAsyncUpload(filebytes, filename, item) {

  //   try {
  //     let objStorage = new ObjectStorageDetails();
  //     objStorage.Id = 0;
  //     objStorage.EmployeeId = this.EmployeeId;
  //     objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
  //     objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
  //     objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
  //     objStorage.ClientContractId = 0;
  //     objStorage.ClientId = 0;
  //     objStorage.CompanyId = this.CompanyId;
  //     objStorage.Status = true;
  //     objStorage.Content = filebytes;
  //     objStorage.SizeInKB = 12;
  //     objStorage.ObjectName = filename;
  //     objStorage.OriginalObjectName = filename;
  //     objStorage.Type = 0;
  //     objStorage.ObjectCategoryName = "EmpTransactions";
  //     this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
  //       let apiResult: apiResult = (res);
  //       try {
  //         if (apiResult.Status && apiResult.Result != "") {

  //           let LstAttachments = [{
  //             FileName: filename,
  //             DocumentId: apiResult.Result,
  //             Status: 0,
  //             ApprovedAmount: 0
  //           }];
  //           item.DeclarationAttachments = item.DeclarationAttachments.concat(LstAttachments);
  //           this.unsavedDocumentLst.push({
  //             Id: apiResult.Result
  //           })
  //           this.isLoading = true;
  //           this.alertService.showSuccess("You have successfully uploaded this file!")
  //           this.selectedUploadIndex = null;
  //         }
  //         else {
  //           this.isLoading = true;
  //           this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
  //         }
  //       } catch (error) {
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while  trying to upload! " + error)
  //       }
  //     }), ((err) => {

  //     })

  //   } catch (error) {
  //     this.alertService.showWarning("An error occurred while  trying to upload! " + error)
  //     this.isLoading = true;
  //   }

  // }



  doDeleteFile(item, photo, layout) {


    if (photo.Status == 1) {
      this.alertService.showWarning("There is a problem with this action; There are one or more attachments that cannot be deleted due to an invalid status.");
      return;
    }
    // if (photo.Status == 1) {
    //   this.alertService.showWarning("Attention : This action was blocked. One or more attachement cannot be deleted because the status is in an invalid state.");
    //   return;
    // }

    this.alertService.confirmSwal("Are you sure you want to delete?", "This item will be deleted immediately. You can't undo this file.", "Yes, Delete").then(result => {
      this.isLoading = false;


      this.docSpinnerText = "Deleting";
      this.selectedUploadIndex = item.Id;
      item.Modetype = UIMode.Edit;


      if (!this.essService.isGuid(item.Id)) {
        var index = this.unsavedDocumentLst.map(function (el) {
          return el.Id
        }).indexOf(photo.DocumentId)
        this.unsavedDocumentLst.splice(index, 1);

        if (layout == 'Medical') {

          var _tmpList = this.LstMedicalDependent.filter(a => a.SelectedMedicalInsurantTab.ProductId == item.SelectedMedicalInsurantTab.ProductId);
          if (_tmpList.length > 0) {
            _tmpList.forEach(element => {
              var index1 = element.DeclarationAttachments.map(function (el) {
                return el.DocumentId
              }).indexOf(photo.DocumentId)
              element.DeclarationAttachments.splice(index1, 1)

            });
          }


        } else {
          var index1 = item.DeclarationAttachments.map(function (el) {
            return el.DocumentId
          }).indexOf(photo.DocumentId)
          item.DeclarationAttachments.splice(index1, 1)

          item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
            !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 0 : true;
            !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.ApprovedAmount = 0 : true;
          });

        }
        !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
        !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
        this.selectedUploadIndex = null;
        this.isLoading = true;
        this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
      }
      else {

        this.investmentService.deleteAsync(photo.DocumentId).then((s3DeleteObjectResult) => {

          if (s3DeleteObjectResult == true) {
            var index = this.unsavedDocumentLst.map(function (el) {
              return el.Id
            }).indexOf(photo.DocumentId)
            this.unsavedDocumentLst.splice(index, 1);

            if (layout == 'Medical') {

              var _tmpList = this.LstMedicalDependent.filter(a => a.SelectedMedicalInsurantTab.ProductId == item.SelectedMedicalInsurantTab.ProductId);
              if (_tmpList.length > 0) {
                _tmpList.forEach(element => {
                  var index1 = element.DeclarationAttachments.map(function (el) {
                    return el.DocumentId
                  }).indexOf(photo.DocumentId)
                  element.DeclarationAttachments.splice(index1, 1)

                });
              }

            } else {
              var index1 = item.DeclarationAttachments.map(function (el) {
                return el.DocumentId
              }).indexOf(photo.DocumentId)
              item.DeclarationAttachments.splice(index1, 1);

              item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
                e1.Status = 0;
                e1.ApprovedAmount = 0;
              });

            }
            !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
            !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
            this.selectedUploadIndex = null;
            this.isLoading = true;
            this.myInputVariable.nativeElement.value = "";

            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
          } else {
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to delete! ")
          }
        });
      }

    })
      .catch(error => { });

  }

  // doViewFile(item, photo, layout) {
  //   console.log('IMAGE ::::::',photo);

  //   this.loadingScreenService.startLoading();
  //   this.fileuploadService.downloadObjectAsBlob(photo.DocumentId)
  //     .subscribe(res => {
  //       if (res == null || res == undefined) {
  //         this.loadingScreenService.stopLoading();
  //         this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
  //         return;
  //       }
  //       FileSaver.saveAs(res, photo.FileName);
  //       this.loadingScreenService.stopLoading();
  //     },error => {
  //       this.loadingScreenService.stopLoading();
  //     });
  // }

  doViewFile(item, photo, layout) {

    const modalRef = this.modalService.open(PreviewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.docsObject = photo;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });
    return;
  }



  // deleteAsync(item, photo, layout) {
  //   this.isLoading = false;
  //   this.docSpinnerText = "Deleting";
  //   this.selectedUploadIndex = item.Id;
  //   this.fileuploadService.deleteObjectStorage((photo.DocumentId)).subscribe((res) => {
  //     let apiResult: apiResult = (res);
  //     try {
  //       if (apiResult.Status) {
  //         var index = this.unsavedDocumentLst.map(function (el) {
  //           return el.Id
  //         }).indexOf(photo.DocumentId)
  //         this.unsavedDocumentLst.splice(index, 1);

  //         var index1 = item.DeclarationAttachments.map(function (el) {
  //           return el.DocumentId
  //         }).indexOf(photo.DocumentId)
  //         item.DeclarationAttachments.splice(index1, 1)
  //         this.selectedUploadIndex = null;
  //         this.isLoading = true;
  //         this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
  //       } else {
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
  //       }
  //     } catch (error) {

  //       this.alertService.showWarning("An error occurred while  trying to delete! " + error)
  //     }

  //   }), ((err) => {

  //   })

  // }

  unsavedDeleteFile(_DocumentId) {
    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(_DocumentId)
          this.unsavedDocumentLst.splice(index, 1)
        } else {
        }
      } catch (error) {
      }
    }), ((err) => {
    })
  }


  /* #endregion */

  confirmExit() {
    this.router.navigate(['/app/listing/ui/employeeInvestment']);

  }




  // EXEMPTION

  doShowExemptionModal() {

    this.openExemptionModal();

    // let empRateSets = [];
    // this.popupTaxBills = [];

    // empRateSets = this.LstEmployeeInvestmentLookup.ApplicableExemptionProducts;
    // console.log('EXEM PROD ::', this.LstTaxExemptionProduct);
    // console.log('RATESET ::', empRateSets);

    // empRateSets != null && empRateSets.length > 0 && this.LstTaxExemptionProduct != null && empRateSets.forEach(element => {
    //   var category = this.LstTaxExemptionProduct.find(a => a.ProductCode.toUpperCase() == element.ProductCode.toUpperCase());
    //   console.log('category', category);

    //   if (category != undefined && category.ProductCode.toUpperCase() != 'HRA') {
    //     this.popupTaxBills.push(category)
    //   }
    // });

    // this.openExemptionModal();

    // this.popupTaxBills = this.LstTaxExemptionProduct;

    // $('#popup_chooseCategory_Exemptions').modal('show');
  }
  modal_dismiss2(which) {
    $('#popup_chooseCategory_Exemptions').modal('hide');
  }

  chooseCategory(item: any, which: any) {
    which == "exemption" && $('#popup_chooseCategory_Exemptions').modal('hide');
    if (this.isESSLogin == false) {
      sessionStorage.removeItem("IsFromBillEntry");
      sessionStorage.setItem('IsFromBillEntry', "true");
    }
    sessionStorage.removeItem("TaxDeclarationMode");
    sessionStorage.removeItem("IsBillEntryEss");

    sessionStorage.setItem('TaxDeclarationMode', this.currentTaxMode.toString());
    sessionStorage.setItem('IsBillEntryEss', this.isESSLogin.toString());
    this.router.navigate(['app/ess/expenseBillEntry'], {
      queryParams: {
        "Idx": btoa(item.ProductId),
        "Fdx": btoa(this.selectedFinYear as any),
        "Edx": btoa(this.EmployeeId as any),
      }


    });
  }

  getrowspan() {
    return this.jsonObject._hraDetails.length == 1 ? this.jsonObject._hraDetails.length * 5 : (this.jsonObject._hraDetails.length * 4) + 1
  }

  gethprowspan() {
    return this.jsonObject._hpDetails.length > 0 ? this.jsonObject._hpDetails.length * 4 + 4 : 4;
  }

  getHRAAddressDetails(currentItem, columnName) {
    let AddressDetails = JSON.parse(currentItem.LandLordDetails.AddressDetails);
    return AddressDetails[columnName];
  }


  preview12BBForm(direction) {

    if (this.employeedetails && this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails && this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails.length > 0) {
      let _empcommunicationDet = this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails.find(x => (x.CommunicationCategoryTypeId == CommunicationCategoryType.Official || x.CommunicationCategoryTypeId == CommunicationCategoryType.Present || x.CommunicationCategoryTypeId == CommunicationCategoryType.Personal))
      if (_empcommunicationDet)
        this._empAddress = `${_empcommunicationDet.Address1},${_empcommunicationDet.Address2}`
    }
    this.ltaRowspan = 1;
    this.sec10NameForForm12BB = environment.environment.sec10NameForForm12BB;

    this.jsonObject = {
      rowSpan: 7,
      _totalHRAAmount: 0,
      _exemptionDetails: [],
      _hpDetails: [],
      _otherSec: [],
      _section80CPFPT: [],
      Section80C_Output: [],
      Section80CCC_Output: [],
      Section80CCD_Output: [],
      NotSection80C_Output: [],
      _hraDetails: []

    }

    try {



      let rowSpan = 7;
      let _totalHRAAmount = 0;

      let _exemptionDetails = [];

      if (this.employeedetails.LstemployeeHouseRentDetails.length > 0) {
        for (let i = 0; i < this.employeedetails.LstemployeeHouseRentDetails.length; i++) {
          const element = this.employeedetails.LstemployeeHouseRentDetails[i];
          if (element.FinancialYearId == this.selectedFinYear && element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0 && element.LstEmployeeInvestmentDocuments.find(z => z.Status == 1 || z.Status == 0)) {
            _totalHRAAmount += element.RentAmount;
          }
        }
      }


      if (this.employeedetails && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) {

        for (let j = 0; j < this.employeedetails.LstEmployeeTaxExemptionDetails.length; j++) {
          const element = this.employeedetails.LstEmployeeTaxExemptionDetails[j];

          if (element.FinancialYearId == this.selectedFinYear && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(a => a.ProductId == element.ProductId) != undefined && !element.IsProposed && element.LstEmployeeExemptionBillDetails.find(z => z.ApprovalStatus != 0 && (z.Status == 1 || z.Status == 0))) {

            console.log('element', element);

            if (_exemptionDetails.length > 0) {
              var isExists = _exemptionDetails.find(a => a.ProductId == element.ProductId);
              console.log('isExists', isExists);

              if (isExists) {
                element.LstEmployeeExemptionBillDetails != null && element.LstEmployeeExemptionBillDetails.forEach(z => {
                  if (z.Status == 1 || z.Status == 0) {
                    isExists.DeclaredAmount += z.BillAmount;
                  }
                });

                // isExists.DeclaredAmount += element.Amount;

              } else {
                let _DeclaredAmount = 0;
                element.LstEmployeeExemptionBillDetails != null && element.LstEmployeeExemptionBillDetails.forEach(z => {
                  if (z.Status == 1 || z.Status == 0) {
                    _DeclaredAmount += z.BillAmount;
                  }
                });

                _exemptionDetails.push({
                  ProductId: element.ProductId,
                  ProductName: this.LstAllDeclarationProducts.find(v => v.ProductId == element.ProductId).ProductName,
                  DeclaredAmount: _DeclaredAmount
                })
                rowSpan += 1;
                this.ltaRowspan += 1;
              }
            } else {
              let _DeclaredAmount = 0;
              element.LstEmployeeExemptionBillDetails != null && element.LstEmployeeExemptionBillDetails.forEach(z => {
                if (z.Status == 1 || z.Status == 0) {
                  _DeclaredAmount += z.BillAmount;
                }
              });

              _exemptionDetails.push({
                ProductId: element.ProductId,
                ProductName: this.LstAllDeclarationProducts.find(v => v.ProductId == element.ProductId).ProductName,
                DeclaredAmount: _DeclaredAmount
              })
              rowSpan += 1;
              this.ltaRowspan += 1;
            }


          }
        }
      }

      console.log('ltaRowspan', this.ltaRowspan);


      let _hraDetails = [];
      let GroupedHRA = [];
      if (this.employeedetails.LstemployeeHouseRentDetails.length > 0) {
        GroupedHRA = _.chain(this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.FinancialYearId == this.selectedFinYear && !a.IsProposed && a.LstEmployeeInvestmentDocuments !=null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.find(z => z.Status == 1 || z.Status == 0)))
          .groupBy("AddressDetails")
          .map((value, key) => ({ GroupName: key, GroupList: value }))
          .value();

        console.log('GroupedHRA', GroupedHRA);

        GroupedHRA && GroupedHRA.length > 0 && GroupedHRA.forEach(em => {
          let sum = 0;
          em.GroupList.forEach(child => {
            sum += child.RentAmount
          });
          _hraDetails.push({
            NameOfLandlord: em.GroupList[0].LandLordDetails.Name,
            RentHouseAddress: this.getHRAAddressDetails(em.GroupList[0],'LandlordAddress'),
            PAN: em.GroupList[0].LandLordDetails.PAN,
            DeclaredAmount: sum,

          })

        });
      }

      console.log('GroupedHRA', _hraDetails);

      let _hpDetails = []; // { InterestPaid: 0, NameOfLender: '', addressOfLender: '', PANofLender: '' }

      // let _hpDetails = { InterestPaid: 0, NameOfLender: '', addressOfLender: '', PANofLender: '' }
      let _otherSec = [];
      if (this.employeedetails.LstEmployeeHousePropertyDetails.length > 0) {
        for (let i = 0; i < this.employeedetails.LstEmployeeHousePropertyDetails.length; i++) {
          const element = this.employeedetails.LstEmployeeHousePropertyDetails[i];

          if (element.FinancialYearId == this.selectedFinYear && this.LstAllDeclarationProducts.length > 0 && !element.IsProposed && element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0 && element.LstEmployeeInvestmentDocuments.find(z => z.Status == 1 || z.Status == 0)) {
            // _hpDetails.InterestPaid = elementX.InterestAmount;
            // _hpDetails.NameOfLender = element.NameOfLender
            // _hpDetails.addressOfLender = element.AddressOfLender
            // _hpDetails.PANofLender = element.LenderPANNO
            _hpDetails.push({
              InterestPaid: element.InterestAmount, NameOfLender: element.NameOfLender, addressOfLender: element.AddressOfLender,
              PANofLender: element.LenderPANNO,
              IsOtherSectionAvailable: element.employeeInvestmentDeduction != null && element.employeeInvestmentDeduction.Amount > 0 ? true : false,
              SectionName: element.employeeInvestmentDeduction != null && element.employeeInvestmentDeduction.Amount > 0
                ? `(${this.LstAllDeclarationProducts.find(a => a.ProductId == element.employeeInvestmentDeduction.ProductID) != undefined ? this.LstAllDeclarationProducts.find(a => a.ProductId == element.employeeInvestmentDeduction.ProductID).Code : ''})` : null,
              SectionDeclaredAmount: element.employeeInvestmentDeduction != null && element.employeeInvestmentDeduction.Amount > 0
                ? `${element.employeeInvestmentDeduction.Amount}` : null
            });
          }
          if (element.FinancialYearId == this.selectedFinYear && element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0) {
            _otherSec.push(element)
          }
        }
      }

      let _section80CPFPT = [];

      if (this.LstEmployeeInvestmentLookup.TaxItems != null && this.LstEmployeeInvestmentLookup.TaxItems.length > 0) {

        if (this.LstEmployeeInvestmentLookup.TaxItems.find(a => a.ProductCode.toUpperCase() == 'PF') != undefined) {
          _section80CPFPT.push({
            Name: 'PF',
            AmtInvested: this.LstEmployeeInvestmentLookup.TaxItems.find(a => a.ProductCode.toUpperCase() == 'PF').Amount,
            AmtApproved: 0,
            Status: "Pending"
          })
          rowSpan += 1;
        }


        if (this.LstEmployeeInvestmentLookup.TaxItems.find(a => a.ProductCode.toUpperCase() == 'PT') != undefined) {
          _section80CPFPT.push({
            Name: 'PT',
            AmtInvested: this.LstEmployeeInvestmentLookup.TaxItems.find(a => a.ProductCode.toUpperCase() == 'PT').Amount,
            AmtApproved: 0,
            Status: "Pending"
          })
          rowSpan += 1;
        }

      }


      let Section80C = _.filter(this.LstAllDeclarationProducts, function (p) {
        return _.includes(['Sec80C'], p.Code);
      });

      let Section80CCC = _.filter(this.LstAllDeclarationProducts, function (p) {
        return _.includes(['Sec80CCC'], p.Code);
      });

      let Section80CCD = _.filter(this.LstAllDeclarationProducts, function (p) {
        return _.includes(['Sec80CCD', '80 CCD(1B)'], p.Code);
      });

      let NotSection80C = _.filter(this.LstAllDeclarationProducts, function (p) {
        return !_.includes(['Sec80CCD', '80 CCD(1B)', 'Sec80CCC', 'Sec80C'], p.Code);
      });


      let Section80C_filtern = _.filter(this.employeedetails.LstemployeeInvestmentDeductions, ({ ProductID }) => {
        return _.findIndex(Section80C, ({ ProductId: filterProductId }) => { return (ProductID == filterProductId) }) >= 0;
      })

      let Section80CCC_filtern = _.filter(this.employeedetails.LstemployeeInvestmentDeductions, ({ ProductID }) => {
        return _.findIndex(Section80CCC, ({ ProductId: filterProductId }) => { return (ProductID == filterProductId) }) >= 0;
      })

      let Section80CCD_filtern = _.filter(this.employeedetails.LstemployeeInvestmentDeductions, ({ ProductID }) => {
        return _.findIndex(Section80CCD, ({ ProductId: filterProductId }) => { return (ProductID == filterProductId) }) >= 0;
      })

      let NotSection80C_filtern = _.filter(this.employeedetails.LstemployeeInvestmentDeductions, ({ ProductID }) => {
        return _.findIndex(NotSection80C, ({ ProductId: filterProductId }) => { return (ProductID == filterProductId) }) >= 0;
      })



      let Section80C_Output = [];
      let Section80CCC_Output = [];
      let Section80CCD_Output = [];
      let NotSection80C_Output = [];

      Section80C_filtern && Section80C_filtern.length > 0 && Section80C_filtern.forEach(el => {

        if (!el.IsProposed && el.LstEmployeeInvestmentDocuments != null && el.LstEmployeeInvestmentDocuments.length > 0 && el.LstEmployeeInvestmentDocuments.filter(a => a.Status == 1 || a.Status == 0).length > 0)
          if (Section80C_Output.length > 0) {
            var isExists = Section80C_Output.find(a => a.ProductId == el.ProductID);
            if (isExists) {
              isExists.DeclaredAmount += el.Amount;

            } else {
              Section80C_Output.push({
                ProductId: el.ProductID,
                ProductName: Section80C.find(v => v.ProductId == el.ProductID).ProductName,
                DeclaredAmount: el.Amount
              })
              rowSpan += 1;
            }
          } else {
            Section80C_Output.push({
              ProductId: el.ProductID,
              ProductName: Section80C.find(v => v.ProductId == el.ProductID).ProductName,
              DeclaredAmount: el.Amount
            })
            rowSpan += 1;
          }
      });

      Section80CCC_filtern && Section80CCC_filtern.length > 0 && Section80CCC_filtern.forEach(el => {

        if (!el.IsProposed && el.LstEmployeeInvestmentDocuments != null && el.LstEmployeeInvestmentDocuments.length > 0 && el.LstEmployeeInvestmentDocuments.filter(a => a.Status == 1 || a.Status == 0).length > 0)

          if (Section80CCC_Output.length > 0) {
            var isExists = Section80CCC_Output.find(a => a.ProductId == el.ProductID);
            if (isExists) {
              isExists.DeclaredAmount += el.Amount;

            } else {
              Section80CCC_Output.push({
                ProductId: el.ProductID,
                ProductName: Section80CCC.find(v => v.ProductId == el.ProductID).ProductName,
                DeclaredAmount: el.Amount
              })
              rowSpan += 1;
            }
          } else {
            Section80CCC_Output.push({
              ProductId: el.ProductID,
              ProductName: Section80CCC.find(v => v.ProductId == el.ProductID).ProductName,
              DeclaredAmount: el.Amount
            })
            rowSpan += 1;
          }
      });

      Section80CCD_filtern && Section80CCD_filtern.length > 0 && Section80CCD_filtern.forEach(el => {

        if (!el.IsProposed && el.LstEmployeeInvestmentDocuments != null && el.LstEmployeeInvestmentDocuments.length > 0 && el.LstEmployeeInvestmentDocuments.filter(a => a.Status == 1 || a.Status == 0).length > 0)

          if (Section80CCD_Output.length > 0) {
            var isExists = Section80CCD_Output.find(a => a.ProductId == el.ProductID);
            if (isExists) {
              isExists.DeclaredAmount += el.Amount;
            } else {
              Section80CCD_Output.push({
                ProductId: el.ProductID,
                ProductName: Section80CCD.find(v => v.ProductId == el.ProductID).ProductName,
                DeclaredAmount: el.Amount
              })
              rowSpan += 1;
            }
          } else {
            Section80CCD_Output.push({
              ProductId: el.ProductID,
              ProductName: Section80CCD.find(v => v.ProductId == el.ProductID).ProductName,
              DeclaredAmount: el.Amount
            })
            rowSpan += 1;
          }
      });

      NotSection80C_filtern && NotSection80C_filtern.length > 0 && NotSection80C_filtern.forEach(el => {
        try {

          if (!el.IsProposed && el.LstEmployeeInvestmentDocuments != null && el.LstEmployeeInvestmentDocuments.length > 0 && el.LstEmployeeInvestmentDocuments.filter(a => a.Status == 1 || a.Status == 0).length > 0) {
            if (NotSection80C_Output.length > 0) {
              var isExists = NotSection80C_Output.find(a => a.ProductId == el.ProductID);
              if (isExists) {
                isExists.DeclaredAmount += el.Amount;
              } else {
                NotSection80C_Output.push({
                  ProductId: el.ProductID,
                  ProductName: NotSection80C.find(v => v.ProductId == el.ProductID).ProductName,
                  DeclaredAmount: el.Amount
                })
                rowSpan += 1;
              }
            } else {
              NotSection80C_Output.push({
                ProductId: el.ProductID,
                ProductName: NotSection80C.find(v => v.ProductId == el.ProductID).ProductName,
                DeclaredAmount: el.Amount
              })
              rowSpan += 1;
            }
          }
        } catch (error) {
          console.log('ddd', error);

        }
      });



      console.log('NotSection80C_Output', NotSection80C_Output);
      console.log('Section80C_Output', Section80C_Output);
      console.log('Section80CCC_Output', Section80CCC_Output);
      console.log('Section80CCD_Output', Section80CCD_Output);


      this.jsonObject = {
        rowSpan: rowSpan,
        _totalHRAAmount: _totalHRAAmount,
        _exemptionDetails: _exemptionDetails,
        _hpDetails: _hpDetails,
        _otherSec: _otherSec,
        _section80CPFPT: _section80CPFPT,
        Section80C_Output: Section80C_Output,
        Section80CCC_Output: Section80CCC_Output,
        Section80CCD_Output: Section80CCD_Output,
        NotSection80C_Output: NotSection80C_Output,
        _hraDetails: _hraDetails

      }
    } catch (error) {
      console.log('EXE 12BB ::', error);

    }

    console.log('jsonObject', this.jsonObject);
    this.FinancialYearDescription = this.LstEmployeeInvestmentLookup.FicalYearList.find(dt => dt.Id == this.selectedFinYear).code.replace(/_/g, "-");
    // direction == 'nonDownload' ? this.visible_slider_form12bb = true : this.downloadForm12BB();
    if (direction == 'nonDownload') {
      this.visible_slider_form12bb = true
    } else {
      this.loadingScreenService.startLoading();
      setTimeout(() => {
        this.loadingScreenService.startLoading();
        this.downloadForm12BB();
      }, 1000);
    }

  }

  close_slider_form12bb() {
    this.visible_slider_form12bb = false;
  }

  downloadForm12BB() {


    var myInnerHtml = document.getElementById("printid").innerHTML;
    console.log('myInnerHtml', myInnerHtml);

    this.loadingScreenService.startLoading();

    var htmlToPDFSrc = new HtmlToPDFSrc()
    htmlToPDFSrc.htmldata = myInnerHtml.toString();
    htmlToPDFSrc.footer = "";
    htmlToPDFSrc.header = "";
    htmlToPDFSrc.hasHeader = true;
    htmlToPDFSrc.hasFooter = true;
    htmlToPDFSrc.headerHeight = 30;
    htmlToPDFSrc.footerHeight = 30;
    htmlToPDFSrc.baseUrlForCssAndImgs = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css";
    htmlToPDFSrc.putHeaderOnFirstPage = true;
    htmlToPDFSrc.putHeaderOnOddPages = true;
    htmlToPDFSrc.putHeaderOnEvenPages = true;
    htmlToPDFSrc.putFooterOnFirstPage = true;
    htmlToPDFSrc.putFooterOnOddPages = true;
    htmlToPDFSrc.putFooterOnEvenPages = true;
    htmlToPDFSrc.isPageNumRequired = true;
    let req = JSON.stringify(htmlToPDFSrc);
    this.employeeService.GeneratePDFDocument(req).subscribe((result) => {
      const linkSource = 'data:application/pdf;base64,' + result.Result;
      const downloadLink = document.createElement("a");
      const fileName = `${this.employeedetails.Code}_${this.FinancialYearDescription}_FormNo12BB.pdf`;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
      this.loadingScreenService.stopLoading();
    }, er => {

    })

  }
  doDeleteForm12BBFile() {
    this.Form12BBFileName = null;
    this.Form12BBFileUrl = null;
  }


  fileUpload_Form12BB(e, isSubmit) {

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 5) {
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {

        this.Form12BBFileName = file.name;
        this.Form12BBFileUrl = (reader.result as string).split(",")[1];

      };
    }
  }

  ConfirmSubmit(_Form12BBFileUrl, _Form12BBFileName) {
    if (this.Form12BBFileName) {
      this.loadingScreenService.startLoading();
      this.investmentService.doAsyncUpload(_Form12BBFileUrl, _Form12BBFileName, '', this.employeedetails.Id).then((s3DocumentId) => {
        if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {

          // auto-updating previous employment proposal mode when the current mode is in proof

          if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(b => b.FinancialYearId == this.selectedFinYear &&
            b.ApprovalStatus == 0).length > 0) {
            this.employeedetails.LstemploymentDetails.forEach(element => {
              if (element.FinancialYearId == this.selectedFinYear && element.ApprovalStatus == 0) {
                element.IsProposed = false;
                element.Modetype = UIMode.Edit;
              }
            });
          }

          var employeeinvestmentMaster = new EmployeeInvestmentMaster();
          employeeinvestmentMaster.PersonId = 0;
          employeeinvestmentMaster.EmployeeId = this.EmployeeId;
          employeeinvestmentMaster.FinancialYearId = this.selectedFinYear;
          employeeinvestmentMaster.ModuleProcessTransactionId = 0;
          employeeinvestmentMaster.SlotClosureDate = (this.InvestmentClosedDate == null) ? '1900-01-01' : moment(this.InvestmentClosedDate).format('YYYY-MM-DD');
          employeeinvestmentMaster.Status = 0;
          employeeinvestmentMaster.SummaryDocumentId = s3DocumentId.toString();
          employeeinvestmentMaster.Id = this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.FinancialYearId == this.selectedFinYear ? this.employeedetails.EmployeeInvestmentMaster.Id : 0;
          this.employeedetails.EmployeeInvestmentMaster = employeeinvestmentMaster;

          this.employeedetails.Modetype = UIMode.Edit;
          this.employeeModel.oldobj = this.employeedetails;
          this.employeeModel.newobj = this.employeedetails;
          console.log('Workflow Employee Details ::::::::::::::::::', this.employeedetails);
          var request_payload = JSON.stringify(this.employeeModel);
          this.employeeService.UpsertEmployeeInvestmentDetails(request_payload).subscribe((data: any) => {

            if (data.Status) {
              this.callbackWorkFlow(data.dynamicObject.newobj);
              $("#popup_Form12BBUpload").modal('hide');
              this.onRefresh();

            }
            else {
              this.alertService.showWarning(data.Message);
              $("#popup_Form12BBUpload").modal('hide');
              this.loadingScreenService.stopLoading();
            }
          },
            (err) => {

              this.alertService.showWarning(`Something is wrong!  ${err}`);
              console.log("Something is wrong! : ", err);
            });

        }
      });
    }
  }

  close_slider_form12bbUpload() {
    $("#popup_Form12BBUpload").modal('hide');
  }



  toenableSaveAndSubmitButton() {
    this.ispendingInvestmentExist = false;

    if ((this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 0).length > 0).length > 0) ||
      (this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 0).length > 0).length > 0) ||
      (this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 0).length > 0).length > 0) ||
      (this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => this.selectedFinYear == a.FinancialYearId && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 0).length > 0).length > 0) ||
      (this.employeedetails.LstemployeeOtherIncomeSources.filter(a => this.selectedFinYear == a.FinancialYearId && a.DocumentId != null && a.DocumentId > 0 && a.Status == 2 || a.Status == 0).length > 0) ||
      (this.isJoiningWithinFinancialYear && this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.Status == 2) ||
      (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(a => a.FinancialYearId == this.selectedFinYear && a.Status != 0 && a.DocumentId != null && a.DocumentId > 0 && a.ApprovalStatus != 1).length > 0)

    ) {
      this.ispendingInvestmentExist = true;
    }

  }
  toenableRejectionText() {

    this.LstTaxInvestmentsSummary.forEach(e2 => {
      if (e2.Code == 'INVT') {

        let nonMedicalItems = [];
        nonMedicalItems = this.employeedetails.LstemployeeInvestmentDeductions.filter(it => !it.IsProposed && (it.EHPId == 0 || it.EHPId == null) && this.StampDutyFeeProduct.filter(y => y.ProductId == it.ProductID).length == 0 && (it.LstEmpInvDepDetails == null || it.LstEmpInvDepDetails.length == 0))
        console.log('nonMedicalItems', nonMedicalItems);

        e2.IsRejected = nonMedicalItems.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 2).length > 0).length > 0 ? true : false;
      }
      else if (e2.Code == 'DEDUT') {
        let medicalItems = [];
        medicalItems = this.employeedetails.LstemployeeInvestmentDeductions.filter(it => !it.IsProposed && (it.EHPId == 0 || it.EHPId == null) && this.StampDutyFeeProduct.filter(y => y.ProductId == it.ProductID).length == 0 && (it.LstEmpInvDepDetails != null && it.LstEmpInvDepDetails.length > 0))
        console.log('medicalItems', medicalItems.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 2).length > 0));

        // e2.IsRejected = (this.employeedetails.LstemployeeInvestmentDeductions.filter(a => this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.find(x => x.ProductId == a.ProductID) && a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z =>
        // z.Status == 2).length > 0).length > 0) ? true : false;
        e2.IsRejected = medicalItems.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 2).length > 0).length > 0 ? true : false;
      }
      else if (e2.Code == 'EXMPT') {
        e2.IsRejected = (this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => this.selectedFinYear == a.FinancialYearId && a.LstEmployeeExemptionBillDetails != null && a.LstEmployeeExemptionBillDetails.length > 0 && a.LstEmployeeExemptionBillDetails.filter(b => b.Status == 2).length > 0).length > 0) ? true : false;
      }
      else if (e2.Code == 'HRA') {
        e2.IsRejected = (this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 2).length > 0).length > 0) ? true : false;
      }
      else if (e2.Code == 'HP') {
        e2.IsRejected = (this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.LstEmployeeInvestmentDocuments != null && a.LstEmployeeInvestmentDocuments.length > 0 && a.LstEmployeeInvestmentDocuments.filter(z => z.Status == 2).length > 0).length > 0) ? true : false;
      }


      else if (e2.Code == 'PERQ' && this.employeedetails.LstemployeePerquisitesDetails.length > 0) {
        e2.IsRejected = (this.employeedetails.LstemployeePerquisitesDetails.filter(a => a.DocumentId != null && a.DocumentId > 0 && a.Status == 2).length > 0) ? true : false;
      }

      else if (e2.Code == 'INCM' && this.employeedetails.LstemployeeOtherIncomeSources.length > 0) {
        e2.IsRejected = (this.employeedetails.LstemployeeOtherIncomeSources.filter(a => a.DocumentId != null && a.DocumentId > 0 && a.Status == 2).length > 0) ? true : false;
      }
    });


  }

  onWorkFlowSubmit() {
    if (this.employeedetails.Status == 0) {
      this.alertService.showWarning("The employee's status is inactive. It will not be possible to submit your investment information.");
      return;
    }

    //Due to an invalid submission slot  this submission request cannot be executed.
    if (!this.isResigned && this.IsNoSubmissionSlotExists) {
      this.alertService.showWarning("This submission request cannot be processed because of an invalid submission slot or a lack of valid records.");
      return;
    }

    if (!this.IsPriorDOJ && !this.isResigned && !this.indicateSubmissionSlotEnddate && this.indicateSubmissionSlotIsAfter && !this.indicateSubmissionSlotIsBefore && !this.isInvestmentUnderQC && this.currentTaxMode == 2 && this.currentFinYear == this.selectedFinYear) {
      this.alertService.showWarning("This financial years submission period has ended. Please wait until specialists reopen the time slot.");
      return;
    }

    if (!this.IsPriorDOJ && !this.isResigned && !this.indicateSubmissionSlotEnddate && !this.indicateSubmissionSlotIsAfter && this.indicateSubmissionSlotIsBefore && !this.isInvestmentUnderQC && this.currentTaxMode == 2 && this.currentFinYear == this.selectedFinYear) {
      // this.alertService.showWarning("The submission start time for this financial year has not yet started. Please wait until specialists open up the time slot.");
      this.alertService.showInfo('Investment submission time closed');
      return;
    }

    this.check_addingNewProduct().then((result) => {
      if (result == true) {
        this.Form12BBFileName = "";
        this.Form12BBFileUrl = null;

        this.onCheckRejectionDocuments();

        // $("#popup_Form12BBUpload").modal('show');
      }
    });




  }

  onCheckRejectionDocuments() {
    try {

      let isRejectPendingCombined = false;
      let isRejectPendingInvestmentCombined = false;
      let isRejectPendingHRACombined = false;
      let isRejectPendingHPCombined = false;
      let isRejectPendingPreviousEmpCombined = false;
      this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 && this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(element => {

        for (let h = 0; h < element.LstEmployeeExemptionBillDetails.length; h++) {
          if (this.selectedFinYear == element.FinancialYearId && element.LstEmployeeExemptionBillDetails[h].Status == 2 && element.LstEmployeeExemptionBillDetails.find(a => a.Status == 0) != undefined) {
            isRejectPendingCombined = true;
          }
        }
      });

      this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.forEach(element => {

        if (element.FinancialYearId == this.selectedFinYear && !environment.environment.NotAllowedInvestmentProducts.includes(this.LstAllDeclarationProducts.find(a => a.ProductId == element.ProductID).ProductCode)) {

          if (element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0) {
            for (let h = 0; h < element.LstEmployeeInvestmentDocuments.length; h++) {
              if (this.selectedFinYear == element.FinancialYearId && element.LstEmployeeInvestmentDocuments[h].Status == 2) {
                isRejectPendingInvestmentCombined = true;
              }
            }
          }
        }
      });


      this.employeedetails.LstemployeeHouseRentDetails != null && this.employeedetails.LstemployeeHouseRentDetails.length > 0 && this.employeedetails.LstemployeeHouseRentDetails.forEach(element => {
        if (element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0) {
          for (let h = 0; h < element.LstEmployeeInvestmentDocuments.length; h++) {
            if (this.selectedFinYear == element.FinancialYearId && element.LstEmployeeInvestmentDocuments[h].Status == 2) {
              isRejectPendingHRACombined = true;
            }
          }
        }
      });


      this.employeedetails.LstEmployeeHousePropertyDetails != null && this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 && this.employeedetails.LstEmployeeHousePropertyDetails.forEach(element => {
        if (element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0) {
        for (let h = 0; h < element.LstEmployeeInvestmentDocuments.length; h++) {
          if (this.selectedFinYear == element.FinancialYearId && element.LstEmployeeInvestmentDocuments[h].Status == 2) {
            isRejectPendingHPCombined = true;
          }
        }
        }
      });



      let isPendingPreviousEmploymentExists = false;
      if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(b => b.FinancialYearId == this.selectedFinYear &&
        b.ApprovalStatus == 0).length > 0) {
        isPendingPreviousEmploymentExists = true;
      }


      if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(b => b.FinancialYearId == this.selectedFinYear &&
        b.ApprovalStatus == 2).length > 0) {
        isRejectPendingPreviousEmpCombined = true;
      }


      let confirmationTxt = "";
      if (isRejectPendingInvestmentCombined) {
        confirmationTxt = "There are some rejected file(s) in your :) Investment | Medi Claim Cart. Are you sure you want to submit?";
      }
      else if (isRejectPendingHRACombined) {
        confirmationTxt = "There are some rejected file(s) in your :) House Rent Paid Cart. Are you sure you want to submit?";
      }
      else if (isRejectPendingHPCombined) {
        confirmationTxt = "There are some rejected file(s) in your :) House Property Cart. Are you sure you want to submit? ";
      }
      // else  if (isPendingPreviousEmploymentExists == true && isRejectPendingCombined == true as any) {
      //   confirmationTxt = "There are some rejected file(s) in your :) Exemptions Cart and some saved file(s) in your Previous employment.";
      // }
      else if (isRejectPendingPreviousEmpCombined) {
        confirmationTxt = "There are some saved file(s) in your :) Previous Employment. Are you sure you want to submit? ";
      }
      else if (isRejectPendingCombined == true as any) {
        confirmationTxt = "There are some rejected file(s) in your :) Exemptions Cart. Are you sure you want to submit?";
      } else {
        confirmationTxt = "";
      }



      if (confirmationTxt != "" as any) {
        this.alertService.confirmSwal1("Confirm Stage?", `${confirmationTxt} `, "Ok", "Cancel").then((result) => {

          $("#popup_Form12BBUpload").modal('show');
          return;


        }).catch(cancel => {
          this.loadingScreenService.stopLoading();
          return;
        });
      }

      if (confirmationTxt == "") {
        $("#popup_Form12BBUpload").modal('show');

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



  callbackWorkFlow(newObject: any) {

    this.loadingScreenService.startLoading();

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
          this.isESSLogin == false ? this.confirmExit() : this.onRefresh();
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(`Your employee has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');
          this.isESSLogin == false ? this.confirmExit() : this.onRefresh();
        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to submission}!` + error);
        this.isESSLogin == false ? this.confirmExit() : this.onRefresh();
      }

    }), ((error) => {

    });
  }

  download12BB() {
    this.loadingScreenService.startLoading();
    this.fileuploadService.downloadObjectAsBlob(this.summaryDocumentId)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          return;
        }
        saveAs(res, `${this.employeedetails.Code}_Form12BB`);
        this.loadingScreenService.stopLoading();
      });
  }

  downloadExcel() {

    let exportExcelDate = [];
    let exportExcelDate_HRA = [];
    let exportExcelDate_medical = [];

    this.DeclarationItems.length > 0 && this.DeclarationItems.forEach(e1 => {
      exportExcelDate.push({
        EmployeeCode: this.employeedetails.Code,
        EmployeeName: this.employeedetails.FirstName,
        Section: e1.Declarations.Code,
        ProductName: e1.Declarations.ProductName,
        DeclaredAmount: e1.DeclaredAmount,
        ApprovedAmount: e1.ApprovedAmount,
        TaxMode: e1.IsProposed == false ? 'Proof' : 'Declaration'
      });
    });

    this.LstHouseRentAllowance.length > 0 && this.LstHouseRentAllowance.forEach(e2 => {
      exportExcelDate_HRA.push({
        EmployeeCode: this.employeedetails.Code,
        EmployeeName: this.employeedetails.FirstName,
        Section: "Sec 10",
        ProductName: 'House Rent Paid',
        StartDate: moment(e2.StartDate).format('DD-MM-YYYY'),
        EndDate: moment(e2.EndDate).format('DD-MM-YYYY'),
        IsMetro: e2.IsMetro ? 'Yes' : 'No',
        City: e2.IsMetro ? this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == e2.CityName).Code : e2.CityName,
        NameOfLandlord: e2.NameOfLandlord,
        PANOfLandlord: e2.PANOfLandlord,
        RentalHouseAddress: e2.RentalHouseAddress,
        AddressOfLandlord: e2.AddressOfLandlord,
        DeclaredAmount: e2.HRAAmount,
        ApprovedAmount: e2.ApprovedAmount,
        TaxMode: e2.IsProposed == false ? 'Proof' : 'Declaration'
      });
    });


    this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.forEach(e3 => {
      exportExcelDate_medical.push({
        EmployeeCode: this.employeedetails.Code,
        EmployeeName: this.employeedetails.FirstName,
        Section: e3.SelectedMedicalInsurantTab.Code,
        ProductName: e3.SelectedMedicalInsurantTab.ProductName,
        DependentName: e3.DependentName,
        DependentType: this.getRelationShipName(e3.DependentType),
        DisabilityPercentage: e3.DisabilityPercentage,
        DeclaredAmount: e3.MedicalAmount,
        ApprovedAmount: e3.ApprovedAmount,
        TaxMode: e3.IsProposed == false ? 'Proof' : 'Declaration'
      })
    });


    let reportData = [
      {
        sheet_title: 'Investmetn and Deductions',
        sheet_data: exportExcelDate
      },
      {
        sheet_title: 'HRA',
        sheet_data: exportExcelDate_HRA,
      },
    ];

    this.FinancialYearDescription = this.LstEmployeeInvestmentLookup.FicalYearList.find(dt => dt.Id == this.selectedFinYear).code.replace(/_/g, "-");

    this.excelService.exportToExcel(reportData, `${this.employeedetails.Code}_${this.FinancialYearDescription}`);

  }

  // FOR FORCESCOUT
  doViewTaxSlip() {
    this.alertService.confirmSwalWithCancelAction('Confirmation!', 'Would you like to Calculate ?', "Yes, Do", "No, Cancel").then((result) => {
      if (result) {
        this.loadingScreenService.startLoading();
        this.payrollService.ProcessTimeCardWOQ(this.EmployeeId).subscribe(response => {
          console.log('response', response);
          if (response) {
            this.getTaxSlipData();
          }
        });
      } else {
        this.getTaxSlipData();
      }
    });
  }

  close_slider_tax_slip() {
    this.showSliderForTaxSlip = false;
  }

  getTaxSlipData() {
    this.loadingScreenService.startLoading();
    this.pageLayout.GridConfiguration.DataSource = null;
    this.pageLayout.SearchConfiguration.SearchElementList = [];
    this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'GetPaytransactionDataForTaxSlip' }
    this.pageLayout.SearchConfiguration.SearchElementList.push(
      {
        FieldName: '@userId',
        Value: this.UserId,
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        FieldName: '@roleCode',
        Value: this.RoleCode,
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        FieldName: '@clientId',
        Value: this.BusinessType == 3 ? null : this.sessionService.getSessionStorage('default_SME_ClientId'),
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        FieldName: '@clientContractId',
        Value: this.BusinessType == 3 ? null : this.sessionService.getSessionStorage('default_SME_ContractId'),
        IsIncludedInDefaultSearch: true,
        ReadOnly: false,
      },
      {
        "DisplayName": "@EmployeeId",
        "FieldName": "@EmployeeId",
        "InputControlType": 0,
        "Value": this.isESSLogin == true ? sessionStorage.getItem('loginUserId') : this.empCode,
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
      },
      {
        "DisplayName": "@month",
        "FieldName": "@month",
        "InputControlType": 0,
        "Value": 0,
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
      },
      {
        "DisplayName": "@year",
        "FieldName": "@year",
        "InputControlType": 0,
        "Value": 0,
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
    if (this.BusinessType !== 3) {
      this.pageLayoutService.fillSearchElementsForSME(this.pageLayout.SearchConfiguration.SearchElementList);
      if (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID") != undefined) {
        this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionService.getSessionStorage('default_SME_ContractId')
      }
    }

    console.log("Search Elements ::", this.pageLayout.SearchConfiguration.SearchElementList);

    this.dataset = [];
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      console.log('DATASET', dataset);
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {

        var tempListofRecords;
        tempListofRecords = JSON.parse(dataset.dynamicObject);
        console.log('tempListofRecords', tempListofRecords);
        this.EmpDetails = tempListofRecords;

        if (environment.environment.TaxSlipLogoForStaffing != null && environment.environment.TaxSlipLogoForStaffing.length > 0 &&
          environment.environment.TaxSlipLogoForStaffing.find(z => z.ClientId == tempListofRecords.ClientId) != undefined) {
          let logoURL = environment.environment.TaxSlipLogoForStaffing.find(z => z.ClientId == tempListofRecords.ClientId).LogoURL;
          let jsonObject = JSON.parse(logoURL);
        }

        if (tempListofRecords.PayTransactionList != null && tempListofRecords.PayTransactionList.length > 0) {
          this.EmployeeTaxSlipRecords = tempListofRecords.PayTransactionList[0];
          this.TaxCodeList = tempListofRecords.TaxCodeList;
          this.ProductList = tempListofRecords.ProductList;
          if (this.EmployeeTaxSlipRecords) {
            this.finacialYearId = this.EmployeeTaxSlipRecords.FinancialyearId;
            this.EmployeeId = this.EmployeeTaxSlipRecords.EmployeeId;
          }
          console.log('response', this.EmployeeTaxSlipRecords);

          if (this.EmployeeTaxSlipRecords.hasOwnProperty('TaxItemdata') == false) {
            this.EmployeeTaxSlipRecords = null;
            this.loadingScreenService.stopLoading();
            this.alertService.showInfo("No records found!");
            return;

          }

          this.LstAnnualSalary = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'GROSSSALARY');
          this.LstAnnualSalary = _.orderBy((this.LstAnnualSalary), ["ProductId"], ["asc"]);
          console.log('LST OF ANNUAL SALARY :', this.LstAnnualSalary);

          let HRAList = [];
          HRAList = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'GROSSSALARY' && a.ProductCode == 'HRA');
          HRAList != undefined && HRAList.length > 0 && (this.LstHRA = HRAList[0].LstTaxBreakUp)
          console.log('LstHRA', this.LstHRA);

          this.LstDeductions = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == "DEDUCTIONS" && a.ProductCode == 'PT');
          this.LstIncomeFromHouseProperty = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'INCOMEFROMHOUSEPROPERTY');



          if (this.LstIncomeFromHouseProperty.length == 0) {
            this.LstIncomeFromHouseProperty.push({
              InterestAmount: 0,
              GrossAnnualRent: 0,
              HouseMaintenanceAmount: 0,
              MunicipalTaxAmount: 0
            }) //sec, prod
          }

          var InvestmentRecords = [];
          InvestmentRecords = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'SAVINGS' && a.ProductCode != 'PF' && a.ProductCode != 'VPF');
          this.LstSavingsWithGroupBy = _.chain(InvestmentRecords)
            .groupBy("TaxCodeId")
            .map((element, id) => ({
              TaxCodeId: id,
              TaxAmount: this.calculcateTaxAmount(element),
            }))
            .value();

          this.LstSavingsWithGroupBy = _.orderBy((this.LstSavingsWithGroupBy), ["TaxCodeId"], ["asc"]);
          var LstINCOMEFROMHOUSEPROPERTY = [];
          this.LstSavings = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'SAVINGS');
          LstINCOMEFROMHOUSEPROPERTY = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == 'INCOMEFROMHOUSEPROPERTY');
          this.LstSavings = this.LstSavings.concat(LstINCOMEFROMHOUSEPROPERTY);
          console.log('LstSavings :: ', this.LstSavings);
          this.GrossHRAExemption = [];
          this.HRAExemption = [];
          this.OtherExemption = [];
          this.EmployeeTaxSlipRecords.TaxItemdata.forEach(element => {
            if (element.ProductCode == 'HRA' && element.PayTransactionHead.toUpperCase() == 'EXEMPTIONS') {
              this.HRAExemption = element.LstTaxBreakUp;
            }
            if (element.ProductCode == 'HRA' && element.PayTransactionHead.toUpperCase() == 'EXEMPTIONS') {
              this.GrossHRAExemption.push(element);
            }
            if (element.ProductCode != 'HRA' && element.PayTransactionHead.toUpperCase() == 'EXEMPTIONS') {
              this.OtherExemption.push(element);
            }


          });

          console.log('GrossHRAExemption', this.GrossHRAExemption);
          console.log('HRAExemption', this.HRAExemption);
          console.log('OtherExemption', this.OtherExemption);

          let a = moment(this.EmployeeTaxSlipRecords.PayrollDate).format('YYYY-MM-DD');
          let b = moment(this.EmployeeTaxSlipRecords.FinEndDate).format('YYYY-MM-DD');
          this.diffDuration = moment(b).diff(a, "months");

          // if(this.LstSavings != null && this.LstSavings.length > 0){

          //   this.LstSavings = this.LstSavings.filter(a=>a.LstTaxBreakUp != null && a.LstTaxBreakUp.length > 0 && a.LstTaxBreakUp.filter(z=>z.PayTransactionHead != null && z.ProductId != 0));
          //   console.log('vvvv', this.LstSavings);

          // }

          if (this.EmployeeTaxSlipRecords == undefined || this.EmployeeTaxSlipRecords == null) {
            this.loadingScreenService.stopLoading();
          } else {
            this.showSliderForTaxSlip = true;
            this.loadingScreenService.stopLoading();
          }
        }
        else {
          this.EmployeeTaxSlipRecords = null;
          this.loadingScreenService.stopLoading();
          this.alertService.showInfo("No records found!");
          console.log('Sorry! Could not Fetch Data|', dataset);
        }
      } else {
        this.EmployeeTaxSlipRecords = null;
        this.loadingScreenService.stopLoading();
        this.alertService.showInfo("No records found!");
      }
    }, error => {
      console.log(error);
    });
  }

  getAmount(PayTransactionHead) {
    if (PayTransactionHead.toUpperCase() == 'STANDARDDEDUCTION') {
      let isExists = [];
      isExists = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())
      return isExists.length > 0 ? isExists[0].Amount : 0;
    }
    else if (PayTransactionHead.toUpperCase() == 'PREVIOUSGROSSSALARY') {
      let isExists1 = [];;
      isExists1 = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase());
      return (isExists1 != null && isExists1 != undefined && isExists1.length > 0) ? isExists1[0].Amount : isExists1.length == 0 ? 0 : 0;
    }
    else if (PayTransactionHead.toUpperCase() == 'TAXDEDUCTED') {
      let isExists1 = [];
      isExists1 = this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase());
      return (isExists1 != null && isExists1 != undefined && isExists1.length) > 0 ?
        isExists1[0].Amount : isExists1.length == 0 ? 0 : 0;
    }
    else if (this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0) {
      return (this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0 &&
        this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp != null &&
        this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp.length > 0) ?
        this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp[0].Amount : 0;
    } else {
      return 0;
    }
    // return (this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTra nsactionHead.toUpperCase()).length > 0 ?  (this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase())[0].LstTaxBreakUp[0].Amount) : 0);
  }

  getTotalAmount(PayTransactionHead) {

    if (PayTransactionHead.toUpperCase() == 'PREVIOUSGROSSSALARY') {
      return this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0 ?
        (Number(this.EmployeeTaxSlipRecords.GrossSalary) + Number(this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].Amount)) : (Number(this.EmployeeTaxSlipRecords.GrossSalary) + 0)
    }
    else if (PayTransactionHead.toUpperCase() == "PT") {
      var sum = 0;
      this.LstDeductions.forEach(e => { sum += parseInt(e.Amount) })
      return sum;
    }
    else if (PayTransactionHead.toUpperCase() == 'PREVIOUSDEDUCTION') {
      return this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() == PayTransactionHead.toUpperCase()).length > 0 ?
        Number((this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].LstTaxBreakUp != null &&
          this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].LstTaxBreakUp.length > 0) ? this.EmployeeTaxSlipRecords.TaxItemdata.filter(a => a.PayTransactionHead.toUpperCase() === PayTransactionHead.toUpperCase())[0].LstTaxBreakUp[0].Amount : 0) : 0;
    }
    else {
      return 0;
    }
  }

  getDeductionUnderChapter(taxcodeId) {
    const codeName = this.getTaxCodeName(taxcodeId);
    const codeSec = this.getTaxCodeSec(taxcodeId);
    const name = codeName + '-' + codeSec;
    return name;
  }

  calculcateTaxAmount(item) {
    var sum = 0;
    item.forEach(e => { sum += parseInt(e.Amount) })
    return sum;
  }

  getProductName(productId) {
    const name = this.ProductList.find(x => x.Id == productId).Name;
    return name;
  }

  getTaxCodeName(taxcodeId) {
    const description = this.TaxCodeList.find(x => x.Id == taxcodeId).Description;
    return description;
  }

  getTaxCodeSec(taxcodeId) {
    const code = this.TaxCodeList.find(x => x.Id == taxcodeId).Code;
    return code;
  }

  doCheckValidProductId(item) {
    return item.LstTaxBreakUp.length > 0 && item.LstTaxBreakUp.find(a => a.Amount > 0) ? true : false;

  }

  IsValidToShow() {

    // if (!this.investmentService.PermissibleRoles(this.RoleCode) && this.currentTaxMode == 2 && this.currentFinYear == this.selectedFinYear) {
    //   return !(!this.IsPriorDOJ && !this.isResigned && !this.indicateSubmissionSlotEnddate && (this.indicateSubmissionSlotIsAfter || this.indicateSubmissionSlotIsBefore) && !this.isInvestmentUnderQC);
    // } else {
    //   return true;
    // }


    if (!this.investmentService.PermissibleRoles(this.RoleCode)) {
      if (this.currentTaxMode == 2) {
        if (!this.IsPriorDOJ && !this.isResigned && !this.indicateSubmissionSlotEnddate && this.indicateSubmissionSlotIsAfter && !this.indicateSubmissionSlotIsBefore && !this.isInvestmentUnderQC && this.currentTaxMode == 2 && this.currentFinYear == this.selectedFinYear) {
          return false;
        }
        else if (!this.IsPriorDOJ && !this.isResigned && !this.indicateSubmissionSlotEnddate && !this.indicateSubmissionSlotIsAfter && this.indicateSubmissionSlotIsBefore && !this.isInvestmentUnderQC && this.currentTaxMode == 2 && this.currentFinYear == this.selectedFinYear) {
          return false;
        }
        else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }

  }
  getCalculatedAmountOfTDS() {
    return this.EmployeeTaxSlipRecords.TaxPaid - this.EmployeeTaxSlipRecords.PreviousTDS

  }


  editApprovedAmount(item, layout) {

  }

  PermissibleRoles() {
    const authorizedRoles = environment.environment['AuthorizedRolesToAdjustApprovedAmount'];
    return authorizedRoles && authorizedRoles.includes(this.RoleCode) ? true : false;
  }


  // doTaxCalculator() {
  //   let empTransObject = {
  //     ActionMenuName: "Investment",
  //     EmployeeId: this.EmployeeId,
  //     EmployeeRateSet: null,
  //     ReDirectURL : this.router.url
  //   }
  //   this.sharedDataService.SetEmployeeObjecct(empTransObject);
  //   this.router.navigate(['/app/investment/taxCalculator']);
  // }

  doTaxCalculator() {

    // let empTransObject = {
    //   ActionMenuName: "FBP",
    //   EmployeeId: this.employeeId,
    //   EmployeeRateSet: this.currentEmployeeRateSet,
    //   ReDirectURL: this.router.url
    // }

    let obje = Object.assign({}, this.employeeModel.oldobj);
    const modalRef = this.modalService.open(TaxcalculatorComponent, this.modalOption);
    modalRef.componentInstance.EmployeeId = this.EmployeeId;
    modalRef.componentInstance.employeedetails = obje;
    modalRef.componentInstance.RedirectPage = 'Investment';
    modalRef.componentInstance.LstAllDeclarationProducts = this.LstAllDeclarationProducts;
    modalRef.componentInstance.selectedFinYear = this.selectedFinYear;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
    modalRef.componentInstance.currentFinYear = this.currentFinYear;
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.currentEmployeeRateset = null;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = this.LstEmployeeInvestmentLookup;
    // modalRef.componentInstance.UserId = this.UserId;
    // modalRef.componentInstance.RoleCode = this.RoleCode;


    modalRef.result.then((result) => {
      if (result != "Modal Closed") {

      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  openPreviousEmploymentModal() {
    let obje = Object.assign({}, this.employeeModel.oldobj);
    const modalRef = this.modalService.open(PreviousEmploymentModalComponent, this.modalOption);
    modalRef.componentInstance.currentTaxMode = this.currentTaxMode;
    modalRef.componentInstance.employeedetails = obje;
    modalRef.componentInstance.LstAllDeclarationProducts = this.LstAllDeclarationProducts;
    modalRef.componentInstance.selectedFinYear = this.selectedFinYear;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = this.LstEmployeeInvestmentLookup;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.RoleCode = this.RoleCode;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('result', result);

        this.employeedetails.LstemploymentDetails = result;
        this.onRefresh();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

