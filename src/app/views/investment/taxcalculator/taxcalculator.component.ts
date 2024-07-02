import { Component, OnInit, Input, TemplateRef, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';
import { id } from 'date-fns/locale';
import _, { min } from 'lodash';
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
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { EmployeeTaxCalculator, TaxCalculatorRequestType } from 'src/app/_services/model/Payroll/EmployeeTaxCalculator';
import { EmploymentContract } from 'src/app/_services/model/Employee/EmployementContract';
import { EmployeeOtherIncomeSources } from 'src/app/_services/model/Employee/EmployeeOtherIncomeSources';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';
import { EmployeeTaxExemptionDetails } from 'src/app/_services/model/Employee/EmployeeTaxExemptionDetails';
import { SharedDataService } from 'src/app/_services/service/share.service';


@Component({
  selector: 'app-taxcalculator',
  templateUrl: './taxcalculator.component.html',
  styleUrls: ['./taxcalculator.component.scss']
})
export class TaxcalculatorComponent implements OnInit {


  @Input() employeedetails: EmployeeDetails;
  @Input() currentTaxMode: number; // 1 : DECLARATION | 2: PROOF
  @Input() LstAllDeclarationProducts: any[] = [];
  @Input() selectedFinYear: any;
  @Input() IsNewTaxRegimeOpted: boolean;
  @Input() LstEmployeeInvestmentLookup: EmployeeLookUp;
  @Input() currentFinYear: number;
  @Input() currentEmployeeRateset: EmployeeRateset = new EmployeeRateset();

  @Input() RedirectPage: string;


  spinner: boolean = false;
  BusinessType: number = 0;
  CompanyId: number = 0;
  RoleCode: string = '';
  ImplementationCompanyId: number = 0;
  RoleId: number = 0;
  UserId: number = 0;
  loginSessionDetails: LoginResponses;

  // employeedetails: EmployeeDetails;
  EmployeeId: number = 0;
  // LstEmployeeInvestmentLookup: EmployeeLookUp;
  // LstAllDeclarationProducts = [];
  LstTaxExemptionProduct = [];
  // currentFinYear: number = 0;
  // selectedFinYear: number = 0;
  // currentTaxMode: number = 0; // 1 : DECLARATION | 2: PROOF
  FinancialYearDescription: string = '';
  TaxRegimeName: string = "";
  AgeSlabs = [];
  selectedAgeSlabs: number = 1;
  TotalGrossSalary: number = 0;
  hideRuleContent: boolean = false;
  workLocation: string = "";
  EmpAge: number = 0;
  IncomeDetailsParticulars = [
    {
      Heads: "Income",
      DisplayOrder: 1,
      Child: [
        {
          Name: "Income From Other Sources",
          SectionDescription: "",
          Placeholder: "₹ 0.00",
          DisplayOrder: 1,
          Amount: null,
          Code: 'OTHER',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: false,
          SectionCodes: []
        }
      ]
    },
    {
      Heads: "Rent Details",
      DisplayOrder: 2,
      Child: [
        {
          Name: "Annual Rent Paid",
          SectionDescription: "",
          Placeholder: "₹ 0.00",
          DisplayOrder: 1,
          Amount: null,
          Code: 'HRA',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: false,
          SectionCodes: []
        }
      ]
    },
    {
      Heads: "Interest on Housing Loan",
      DisplayOrder: 2,
      Child: [
        {
          Name: "Interest Paid on Housing Loan",
          SectionDescription: "",
          Placeholder: "₹ 0.00",
          DisplayOrder: 1,
          Amount: null,
          Code: 'HP',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: false,
          SectionCodes: []
        },
        {
          Name: "Interest Paid on Housing Loan availed on or after Apr 2020",
          SectionDescription: "Sec 80EEA",
          Placeholder: "₹ additional limit 1.5 lakh",
          DisplayOrder: 2,
          Amount: null,
          Code: 'HP_80EEA',
          ProductId: 0,
          Limit: 150000,
          IsSectionCodeRequired: true,
          SectionCodes: ["Sec80EEA"]
        },
        // {
        //   Name: "Interest Paid on House Loan ",
        //   SectionDescription: "Sec 80EE",
        //   Placeholder: "₹ Limit max 1.5 lakh per annum",
        //   DisplayOrder: 8,
        //   Amount: null,
        //   Code: '80EE',
        //   ProductId: 0,
        //   Limit: 150000,
        //   IsSectionCodeRequired: true,
        //   SectionCodes: ["Sec80EE"]
        // },
      ]
    },
    {
      Heads: "Deductions",
      DisplayOrder: 3,
      Child: [
        {
          Name: "Total Deductions",
          SectionDescription: "Include investment under sec 80C, 80CCC, 80CCD(1)",
          Placeholder: "₹ Limit 1.5 lakh",
          DisplayOrder: 1,
          Amount: null,
          Code: '80C',
          ProductId: 0,
          Limit: 150000,
          IsSectionCodeRequired: true,
          SectionCodes: ["Sec80C, Sec80CCG"]

        },
        {
          Name: "Additional Contribution to Pension Scheme",
          SectionDescription: "Sec 80CCD(1B)",
          Placeholder: "₹ Limit 50,000",
          DisplayOrder: 2,
          Amount: null,
          Code: '80CCD(1B)',
          ProductId: 0,
          Limit: 50000,
          IsSectionCodeRequired: true,
          SectionCodes: ["Sec80CCD(1B)", "'80 CCD(1B)'"]

        },
        {
          Name: "Employer Contribution to Pension Scheme",
          SectionDescription: "Sec 80CCD(2)",
          Placeholder: "₹ Limit 10% annual gross",
          DisplayOrder: 3,
          Amount: null,
          Code: '80CCD(2)',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: true,
          SectionCodes: ["Sec80CCD(2)"]
        },
        {
          Name: "Medical Claim ",
          SectionDescription: "Include Sec 80D, 80DDB",
          Placeholder: "₹ 0.00",
          DisplayOrder: 4,
          Amount: null,
          Code: '80D',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: true,
          SectionCodes: ['Sec80D', "Sec80DD", "Sec80DDB", "Sec80D_S", "Sec80D_P"]
        },
        {
          Name: "Higher Education Loan",
          SectionDescription: "Sec 80E",
          Placeholder: "₹ 0.00",
          DisplayOrder: 5,
          Amount: null,
          Code: '80E',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: true,
          SectionCodes: ["Sec80E", "80 E"]
        },
        {
          Name: "Donations",
          SectionDescription: "Sec 80G",
          Placeholder: "₹ 0.00",
          DisplayOrder: 6,
          Amount: null,
          Code: '80G',
          ProductId: 0,
          Limit: 10000,
          IsSectionCodeRequired: true,
          SectionCodes: ["Sec80G", "Sec80G_LocalGovt", "Sec80G_Trust", "Sec80G_MemorialFund"]
        },
        {
          Name: "Interest Deduction on Savings Account Deposit",
          SectionDescription: "Sec 80TTA",
          Placeholder: "₹ 0.00",
          DisplayOrder: 7,
          Amount: null,
          Code: '80TTA',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: true,
          SectionCodes: ["Sec80TTA(1)", "Sec80TTA"]
        }

      ]
    },
    {
      Heads: "Exemptions",
      DisplayOrder: 4,
      Child: [
        {
          Name: "Other Exemptions",
          SectionDescription: "Sec *****",
          Placeholder: "₹ 0.00",
          DisplayOrder: 1,
          Amount: null,
          Code: 'EXEP',
          ProductId: 0,
          Limit: 0,
          IsSectionCodeRequired: false,
          SectionCodes: []
        }
      ]
    },
  ];

  FYTaxSlabs = [

  ];

  PayGroupResult = [
    {
      Prop: "TaxableIncome",
      Name: 'Total Taxable Income',
      Old: '20000',
      New: "240000"
    },
    {
      Prop: "TaxOnIncome",
      Name: 'Tax on Total Income',
      Old: '100000',
      New: "120000"
    },
    {
      Prop: "TaxRebate",
      Name: 'Rebate - Sec 87A',
      Old: '2000',
      New: "2400"
    },
    {
      Prop: "Surcharge",
      Name: 'Surcharge',
      Old: '0',
      New: "2000"
    },
    {
      Prop: "EducationCess",
      Name: 'Health & Education Cess',
      Old: '1000',
      New: "2400"
    },
    {
      Prop: "TotalIncomeTax",
      Name: 'Tax Payable',
      Old: '200',
      New: "40000"
    },
    // {
    //   Prop : "TaxableIncome",
    //   Name: 'Relief - Sec 89',
    //   Old: '2100',
    //   New: "50000"
    // },
    {
      Prop: "TDS",
      Name: 'Monthly Net Tax',
      Old: '41000',
      New: "56000"
    }
  ];

  LstAdditionalInvestOptions = [

  ]
  isRecommendedOld: boolean = false;
  isCalculated: boolean = false;
  TotalExemptions: number = 0;
  TotalDeductions: number = 0;
  AmountDifferenece: number = 0;
  FinancialStartDate: any = moment();
  FinancialEndDate: any = moment();
  // currentEmployeeRateset: EmployeeRateset = new EmployeeRateset();
  // RedirectPage: string = "";
  ReDirectURL: string = "";
  Sec80CValue: number = 0;
  isRecommendedBoxRequired: boolean = true;

  IsValidToCalculate: boolean = false;
  CityName: string = "";
  exemptionTaxItems = [];
  totalAmount80D: number = 0;

  constructor(
    private drawerService: NzDrawerService, 
    private essService: ESSService, 
    private alertService: AlertService, 
    private sessionService: SessionStorage,
    private fileuploadService: FileUploadService, 
    private employeeService: EmployeeService, private loadingScreenService: LoadingScreenService,
    private utilityService: UtilityService, private modalService: NgbModal, private investmentService: InvestmentService, private utilsHelper: enumHelper,
    private headerService: HeaderService, private titleService: Title, private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private router: Router, private UtilityService: UtilityService,
    private excelService: ExcelService,
    private attendanceService: AttendanceService,
    private pageLayoutService: PagelayoutService,
    private payrollService: PayrollService,
    private sharedDataService: SharedDataService,
    private activeModal: NgbActiveModal,

  ) { }

  ngOnInit() {

    fetch('assets/json/FYTaxSlabs.json').then(res => res.json())
      .then(jsonData => {
        console.log('FYTaxSlabs :::::', jsonData);
        this.FYTaxSlabs = jsonData;
      });


    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
    this.RoleCode = this.loginSessionDetails.UIRoles[0].Role.Code;
    this.ImplementationCompanyId = this.loginSessionDetails.ImplementationCompanyId;
    this.RoleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.loginSessionDetails.UserSession.UserId;


    console.log(this.router.url);

    // this.sharedDataService.empTransferObject.subscribe((empObj) => {

    //   console.log('empObj :', empObj);

    //   this.EmployeeId = empObj.EmployeeId;
    //   this.RedirectPage = empObj.ActionMenuName;
    //   this.ReDirectURL = empObj.ReDirectURL;
    //   // this.EmployeeId = 99153;
    //   if (this.RedirectPage == 'FBP') {
    //     this.currentEmployeeRateset = empObj.EmployeeRateSet;
    //   }

    //   // this.EmployeeId = 99153;
    //   if (this.EmployeeId == 0 && this.RoleCode == 'Employee') {
    //     this.router.navigate(['/app/dashboard']);
    //   } else if (this.EmployeeId == 0 && this.RoleCode != 'Employee') {
    //     this.cancel_taxCalculation();
    //   }

    //   this.onRefresh();
    // })

    this.onRefresh();
  }

  // cancel_taxCalculation() {

  //   if (this.ReDirectURL == null) {
  //     this.router.navigate(['/app/dashboard']);
  //     return;
  //   }
  //   this.router.navigateByUrl(`/${this.ReDirectURL.toString()}`);

  // }

  cancel_taxCalculation() {

    this.activeModal.close('Modal Closed');
  }


  onRefresh() {

    try {


      this.AgeSlabs = [{ Id: 1, Name: "0 - 60" }, { Id: 2, Name: "61 - 80" }, { Id: 3, Name: "80+" }];

      this.headerService.setTitle("Tax Calculator");
      this.titleService.setTitle('Tax Calculator');
      this.spinner = true;
      console.log('this.employeedetails', this.employeedetails);
      this.isRecommendedOld = true;

      if (this.RedirectPage == 'FBP' || this.RedirectPage == "StandAlone") {

        this.LoadEmployeInvestmentUILookupDetails();

      } else {

        if (this.LstEmployeeInvestmentLookup.InvesmentProductList.find(a => a.ProductCode == 'PF') != undefined) {
          this.LstAllDeclarationProducts = this.LstEmployeeInvestmentLookup.InvesmentProductList.filter(a => a.ProductCode != 'PF')
        }

        // this.LstAllDeclarationProducts = this.LstEmployeeInvestmentLookup != null ? this.LstEmployeeInvestmentLookup.InvesmentProductList : [];
        this.LstTaxExemptionProduct = this.LstAllDeclarationProducts.filter(exe => exe.TaxCodeTypeId == TaxCodeType.Exemptions);

        this.FinancialYearDescription = this.LstEmployeeInvestmentLookup.FicalYearList.find(dt => dt.Id == this.currentFinYear).code.replace(/_/g, "-");
        this.FinancialStartDate = moment(this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id == this.selectedFinYear).StartDate).format('YYYY-MM-DD');
        this.FinancialEndDate = moment(this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id == this.selectedFinYear).EndDate).format('YYYY-MM-DD');

        this.TaxRegimeName = this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? "New Regime" : "Old Regime";

        if (this.IsNewTaxRegimeOpted) {
          this.TaxRegimeName = this.IsNewTaxRegimeOpted == true ? "New Regime" : "Old Regime";
        }

        let CityId = this.employeedetails.EmploymentContracts[0].CityId;
        let IsMetro = this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == CityId) != undefined ? '(Metro)' : '(Non-Metro)';
        this.CityName = `${this.LstEmployeeInvestmentLookup.CityName}${IsMetro}`;

        if (this.RedirectPage != 'FBP' && this.employeedetails && this.employeedetails.EmployeeRatesets) {
          this.currentEmployeeRateset = this.employeedetails.EmployeeRatesets.find(a => a.IsLatest && a.Status == 1) != undefined ? this.employeedetails.EmployeeRatesets.find(a => a.IsLatest && a.Status == 1) : null;

        }

        let timeDiff = Math.abs(Date.now() - new Date(this.employeedetails.DateOfBirth).getTime());
        this.EmpAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);

        if (this.EmpAge <= 60) {
          this.selectedAgeSlabs = 1;
        }
        else if (this.EmpAge >= 61 && this.EmpAge <= 80) {
          this.selectedAgeSlabs = 2;
        }
        else if (this.EmpAge >= 81) {
          this.selectedAgeSlabs = 3;
        }

        this.GetDefaultAmounts();
        this.spinner = false;

      }
      // this.EmployeeId = 99153;
      // this.LoadEmployeInvestmentUILookupDetails();





    } catch (error) {
      console.log('EXE ERR ::', error);

    }
  }

  LoadEmployeInvestmentUILookupDetails(): void {
    this.essService.LoadEmployeInvestmentUILookupDetails(this.EmployeeId).subscribe((result) => {
      let apiResponse: apiResponse = result;
      try {
        if (apiResponse.Status) {
          this.LstEmployeeInvestmentLookup = JSON.parse(apiResponse.dynamicObject);

          if (this.LstEmployeeInvestmentLookup.InvesmentProductList.find(a => a.ProductCode == 'PF') != undefined) {
            this.LstAllDeclarationProducts = this.LstEmployeeInvestmentLookup.InvesmentProductList.filter(a => a.ProductCode != 'PF')
          }

          // this.LstAllDeclarationProducts = this.LstEmployeeInvestmentLookup != null ? this.LstEmployeeInvestmentLookup.InvesmentProductList : [];

          console.log('this.LstEmployeeInvestmentLookup >>>>>>>>>>>>>>>>> ', this.LstAllDeclarationProducts);

          console.log('this.currentEmployeeRateset ', this.currentEmployeeRateset);

          this.LstTaxExemptionProduct = this.LstAllDeclarationProducts.filter(exe => exe.TaxCodeTypeId == TaxCodeType.Exemptions);
          this.currentFinYear = this.LstEmployeeInvestmentLookup.CurrentFinancialYear;

          this.FinancialYearDescription = this.LstEmployeeInvestmentLookup.FicalYearList.find(dt => dt.Id == this.currentFinYear).code.replace(/_/g, "-");
          this.selectedFinYear = this.currentFinYear;
          this.currentTaxMode = this.LstEmployeeInvestmentLookup.InvestmentMode;

          this.FinancialStartDate = moment(this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id == this.selectedFinYear).StartDate).format('YYYY-MM-DD');
          this.FinancialEndDate = moment(this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id == this.selectedFinYear).EndDate).format('YYYY-MM-DD');

          if (this.RedirectPage == "FBP") {
            this.TaxRegimeName = this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? "New Regime" : "Old Regime";
            let CityId = this.employeedetails.EmploymentContracts[0].CityId;
            let IsMetro = this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == CityId) != undefined ? '(Metro)' : '(Non-Metro)';
            this.CityName = `${this.LstEmployeeInvestmentLookup.CityName}${IsMetro}`;
            this.GetDefaultAmounts();
            this.spinner = false;

            let timeDiff = Math.abs(Date.now() - new Date(this.employeedetails.DateOfBirth).getTime());
            this.EmpAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);

            if (this.EmpAge <= 60) {
              this.selectedAgeSlabs = 1;
            }
            else if (this.EmpAge >= 61 && this.EmpAge <= 80) {
              this.selectedAgeSlabs = 2;
            }
            else if (this.EmpAge >= 81) {
              this.selectedAgeSlabs = 3;
            }
          }
          else if (this.RedirectPage == "StandAlone") {
            this.GetEmployeeRequiredDetailsById(this.currentFinYear);
          }

        } else {
        }
      } catch (error) {
        console.log('Exception LookUp Details :::: ', error);
      }
    });
  }
  GetEmployeeRequiredDetailsById(currentFinYear) {
    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments, currentFinYear).subscribe((result) => {
          this.spinner = false;
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            try {
              this.employeedetails = apiR.Result as any;
              this.TaxRegimeName = this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? "New Regime" : "Old Regime";
              let CityId = this.employeedetails.EmploymentContracts[0].CityId;
              let IsMetro = this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == CityId) != undefined ? '(Metro)' : '(Non-Metro)';
              this.CityName = `${this.LstEmployeeInvestmentLookup.CityName}${IsMetro}`;

              if (this.RedirectPage != 'FBP' && this.employeedetails && this.employeedetails.EmployeeRatesets) {
                this.currentEmployeeRateset = this.employeedetails.EmployeeRatesets.find(a => a.IsLatest && a.Status == 1) != undefined ? this.employeedetails.EmployeeRatesets.find(a => a.IsLatest && a.Status == 1) : null;

                // this.TotalGrossSalary = this.currentEmployeeRateset != null && this.currentEmployeeRateset.RatesetProducts.find(a => a.ProductCode == "GrossEarn") != undefined
                //   ? this.currentEmployeeRateset.RatesetProducts.find(a => a.ProductCode == "GrossEarn").Value : 0

                this.GetDefaultAmounts();
              }

              console.log('this.currentEmployeeRateset', this.currentEmployeeRateset);

              let timeDiff = Math.abs(Date.now() - new Date(this.employeedetails.DateOfBirth).getTime());
              this.EmpAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);

              if (this.EmpAge <= 60) {
                this.selectedAgeSlabs = 1;
              }
              else if (this.EmpAge >= 61 && this.EmpAge <= 80) {
                this.selectedAgeSlabs = 2;
              }
              else if (this.EmpAge >= 81) {
                this.selectedAgeSlabs = 3;
              }

              this.spinner = false;
              resolve(true);
              return;
            } catch (error) {
              console.log('EXE GET EMP REQUIRED DETAILS ::::', error);

            }

          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting an employee details`);
            return;
          }
        }, err => {
          resolve(false);
        })

    })
    return promise;
  }

  toggle() {
    this.hideRuleContent = !this.hideRuleContent;
  }

  onChangeAgeSlabs(value) {
    this.selectedAgeSlabs = value;
  }

  GetDefaultAmounts() {
    this.IncomeDetailsParticulars.forEach(e1 => {

      e1.Child.forEach(e2 => {

        if (e2.Code == 'OTHER') {
          e2.ProductId = 0;
          e2.Limit = 0;
          let OtherSourceIncome: number = 0;
          if (this.RedirectPage == "Investment") {
            this.employeedetails.LstemployeeOtherIncomeSources != null &&
              this.employeedetails.LstemployeeOtherIncomeSources.length > 0 &&
              this.employeedetails.LstemployeeOtherIncomeSources.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { OtherSourceIncome += (e.InterestIncomeType == 3 ? parseInt(Number(e.OtherIncomeAmount).toString()) : parseInt(Number(e.TotalInterestAmount).toString())) } });
            e2.Amount += OtherSourceIncome;
          }

        }
        else if (e2.Code == 'HRA') {
          let HRAAmount: number = 0;
          e2.ProductId = 0;
          e2.Limit = 0;
          if (this.RedirectPage == "Investment") {
            this.employeedetails.LstemployeeHouseRentDetails.length > 0 && this.employeedetails.LstemployeeHouseRentDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { HRAAmount += parseInt(e.RentAmount.toString()) } });
            e2.Amount = HRAAmount;
          }

        }
        else if (e2.Code == 'HP') {
          let HPAmount: number = 0;
          e2.ProductId = 0;
          e2.Limit = 200000;
          if (this.RedirectPage == "Investment") {
            this.employeedetails.LstEmployeeHousePropertyDetails != null &&
              this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 &&
              this.employeedetails.LstEmployeeHousePropertyDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { HPAmount += this.getCalculatedInvestedAmount(e) } });
            e2.Amount = HPAmount;
          }
        }
        else if (e2.Code == 'HP_80EEA') {
          let HP80EEAAmount: number = 0;

          let HP80EEA_PRODID: number = 0;

          HP80EEA_PRODID = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EEA') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EEA').ProductId : 0

          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EEA') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EEA').ThresholdLimit : 0

          e2.ProductId = HP80EEA_PRODID;
          if (this.RedirectPage == "Investment") {
            if (HP80EEA_PRODID > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80EEA = this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.ProductID == HP80EEA_PRODID).length > 0 ?
                this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.ProductID == HP80EEA_PRODID) : [];
              Product_80EEA.length > 0 && Product_80EEA.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { HP80EEAAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = HP80EEAAmount;
            }
          }
        }
        // else if (e2.Code == '80EE') {
        //   let HP80EEAmount: number = 0;

        //   let HP80EE_PRODID: number = 0;
        //   HP80EE_PRODID = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EEA') != undefined ?
        //     this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EE').ProductId : 0
        //   e2.ProductId = HP80EE_PRODID;

        //   if (HP80EE_PRODID > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
        //     let Product_80EEA = this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.ProductID == HP80EE_PRODID).length > 0 ?
        //       this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.ProductID == HP80EE_PRODID) : [];
        //     Product_80EEA.length > 0 && Product_80EEA.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { HP80EEAmount += parseInt(e.Amount.toString()) } })
        //     e2.Amount = HP80EEAmount;
        //   }
        // }
        else if (e2.Code == '80C') {
          let HP80C_PRODIDs = [];
          let HP80CAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80C' || e3.Code == 'Sec80CCC' || e3.Code == 'Sec80CCD(1)') {
              HP80C_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = HP80C_PRODIDs[0];
          });
          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80C') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80C').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (HP80C_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =
                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(HP80C_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(HP80C_PRODIDs, v.ProductID)) : [];

              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { HP80CAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = HP80CAmount;
            }
          }

        }

        else if (e2.Code == '80CCD(1B)') {
          let IN80CCD1B_PRODIDs = [];
          let IN880CCD1BAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80CCD(1B)' || e3.Code == '80 CCD(1B)') {
              IN80CCD1B_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN80CCD1B_PRODIDs[0];
          });
          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80CCD(1B)' || z.Code == '80 CCD(1B)') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80CCD(1B)' || z.Code == '80 CCD(1B)').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (IN80CCD1B_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =


                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80CCD1B_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80CCD1B_PRODIDs, v.ProductID)) : [];
              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN880CCD1BAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN880CCD1BAmount;
            }
          }

        }

        else if (e2.Code == '80CCD(2)') {
          let IN80CCD2_PRODIDs = [];
          let IN80CCD2BAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80CCD(2)') {
              IN80CCD2_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN80CCD2_PRODIDs[0];
          });
          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80CCD(2)') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80CCD(2)').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (IN80CCD2_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =

                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80CCD2_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80CCD2_PRODIDs, v.ProductID)) : [];

              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN80CCD2BAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN80CCD2BAmount;
            }
          }

        }


        else if (e2.Code == '80D') {
          let IN80D_PRODIDs = [];
          let IN80DAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80D' || e3.Code == 'Sec80DD' || e3.Code == 'Sec80DDB' || e3.Code == 'Sec80D_S' || e3.Code == 'Sec80D_P') {
              IN80D_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN80D_PRODIDs[0];
          });
          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80D' || z.Code == 'Sec80DD' || z.Code == 'Sec80DDB' || z.Code == 'Sec80D_S' || z.Code == 'Sec80D_P') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80D_S' || z.Code == 'Sec80DD' || z.Code == 'Sec80DDB' || z.Code == 'Sec80D' || z.Code == 'Sec80D_P').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (IN80D_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =

                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80D_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80D_PRODIDs, v.ProductID)) : [];
              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN80DAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN80DAmount;
            }
          }

        }

        else if (e2.Code == '80E') {
          let IN80B_PRODIDs = [];
          let IN80BAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80E' || e3.Code == '80 E') {
              IN80B_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN80B_PRODIDs[0];
          });
          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80E' || z.Code == '80 E') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80E' || z.Code == '80 E').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (IN80B_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =
                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80B_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80B_PRODIDs, v.ProductID)) : [];
              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN80BAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN80BAmount;
            }
          }

        }

        else if (e2.Code == '80G') {
          let IN80G_PRODIDs = [];
          let IN80GAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80G' || e3.Code == 'Sec80G_LocalGovt' || e3.Code == 'Sec80G_Trust' || e3.Code == 'Sec80G_MemorialFund') {
              IN80G_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN80G_PRODIDs[0];
          });
          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80G' || z.Code == 'Sec80G_LocalGovt' || z.Code == 'Sec80G_Trust' || z.Code == 'Sec80G_MemorialFund') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80G' || z.Code == 'Sec80G_LocalGovt' || z.Code == 'Sec80G_Trust' || z.Code == 'Sec80G_MemorialFund').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (IN80G_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =
                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80G_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80G_PRODIDs, v.ProductID)) : [];
              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN80GAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN80GAmount;
            }
          }

        }

        else if (e2.Code == '80TTA') {
          let IN80TTA_PRODIDs = [];
          let IN80TTAAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80TTA(1)' || e3.Code == 'Sec80TTA') {
              IN80TTA_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN80TTA_PRODIDs[0];
          });

          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80TTA(1)' || z.Code == 'Sec80TTA') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80TTA(1)' || z.Code == 'Sec80TTA').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (IN80TTA_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =
                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80TTA_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80TTA_PRODIDs, v.ProductID)) : [];
              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN80TTAAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN80TTAAmount;
            }
          }

        }

        else if (e2.Code == '80EE') {
          let IN80EE_PRODIDs = [];
          let IN80EEAmount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec80EE') {
              IN80EE_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN80EE_PRODIDs[0];
          });

          e2.Limit = this.LstAllDeclarationProducts && this.LstAllDeclarationProducts.length > 0 && this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EE') != undefined ?
            this.LstAllDeclarationProducts.find(z => z.Code == 'Sec80EE').ThresholdLimit : 0
          if (this.RedirectPage == "Investment") {
            if (IN80EE_PRODIDs.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let Product_80C =
                _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80EE_PRODIDs, v.ProductID)).length > 0 ?
                  _.filter(this.employeedetails.LstemployeeInvestmentDeductions, (v) => _.includes(IN80EE_PRODIDs, v.ProductID)) : [];
              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN80EEAmount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN80EEAmount;
            }
          }

        }

        else if (e2.Code == 'EXEP') {
          let IN10_PRODIDs = [];
          let IN10Amount: number = 0;
          this.LstAllDeclarationProducts.forEach(e3 => {
            if (e3.Code == 'Sec10') {
              IN10_PRODIDs.push(e3.ProductId);
            }
            e2.ProductId = IN10_PRODIDs[0];
          });
          if (this.RedirectPage == "Investment") {
            if (IN10_PRODIDs.length > 0 && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) {
              let Product_80C =


                _.filter(this.employeedetails.LstEmployeeTaxExemptionDetails, (v) => _.includes(IN10_PRODIDs, v.ProductId)).length > 0 ?
                  _.filter(this.employeedetails.LstEmployeeTaxExemptionDetails, (v) => _.includes(IN10_PRODIDs, v.ProductId)) : [];


              Product_80C.length > 0 && Product_80C.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { IN10Amount += parseInt(e.Amount.toString()) } })
              e2.Amount = IN10Amount;
            }
          }

        }

      });
    });

    console.log('this.IncomeDetailsParticulars', this.IncomeDetailsParticulars);


  }

  getCalculatedInvestedAmount(item) {
    return Math.round(Number(item.InterestAmount) * (Number(item.OwnershipPercentage) / 100));
  }

  doCalculateTax() {

    try {

      this.IsValidToCalculate = true;
      this.LstAdditionalInvestOptions = [];
      this.IncomeDetailsParticulars.forEach(ele => {

        for (let i = 0; i < ele.Child.length; i++) {
          const ele1 = ele.Child[i];
          if (ele1.Amount > 0 && ele1.Amount != null && ele1.Amount != '' && ele1.Limit > 0 && ele1.Limit > ele1.Amount) {
            this.IsValidToCalculate = false
            break;
          }
        }

      });

      // if (this.IsValidToCalculate = false) {
      //   this.alertService.showWarning('Please check the particulars and try to calculate. It should be equal to or less than the allowed amount.')
      //   return;
      // }
      this.loadingScreenService.startLoading();
      let IsProposed: boolean = false;
      var employeeTaxCalculator = new EmployeeTaxCalculator();
      employeeTaxCalculator.EmployeeId = this.EmployeeId;
      employeeTaxCalculator.FinancialYearId = this.currentFinYear;
      employeeTaxCalculator.CompanyId = this.CompanyId;
      employeeTaxCalculator.TaxCalculatorRequestType = this.RedirectPage == 'FBP' ? TaxCalculatorRequestType.FBP :
        this.RedirectPage == 'Investment' ? TaxCalculatorRequestType.Invesment : TaxCalculatorRequestType.StandAlone;
      employeeTaxCalculator.IsTaxBasedOnProof = this.RedirectPage == 'FBP' ? false : this.currentTaxMode == 2 ? true : false;

      IsProposed = this.RedirectPage == 'FBP' ? true : this.currentTaxMode == 1 ? true : false;


      employeeTaxCalculator.ClientId = this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 2).ClientId;
      var empDetails = new EmployeeDetails();

      empDetails.LstemployeeInvestmentDeductions = [];
      empDetails.LstemployeeHouseRentDetails = [];
      empDetails.EmployeeRatesets = [];
      empDetails.EmploymentContracts = [];

      empDetails.Code = this.employeedetails.Code;
      empDetails.PAN = this.employeedetails.PAN;
      empDetails.DateOfBirth = moment(this.employeedetails.DateOfBirth).format('YYYY-MM-DD');

      var empContract = new EmploymentContract();
      empContract.OpenPayPeriodId = this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 2).OpenPayPeriodId;
      empContract.PayCycleId = this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 2).PayCycleId;
      empContract.CityId = this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 2).CityId;
      empContract.StateId = this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 2).StateId;


      var empRateSet = new EmployeeRateset();

      if (this.currentEmployeeRateset == null || this.currentEmployeeRateset == undefined) {
        this.currentEmployeeRateset = this.employeedetails.EmployeeRatesets[0];
      }

      console.log('s', this.currentEmployeeRateset)
      empRateSet.IsLatest = true;
      empRateSet.PayGroupdId = this.RedirectPage == 'FBP' ? (this.currentEmployeeRateset.hasOwnProperty('PayGroupId') ? this.currentEmployeeRateset['PayGroupId'] : this.currentEmployeeRateset.hasOwnProperty('PayGroupdId') ? this.currentEmployeeRateset['PayGroupdId'] : this.currentEmployeeRateset.PayGroupdId) : this.currentEmployeeRateset.PayGroupdId;
      empRateSet.EffectiveDate = moment(this.currentEmployeeRateset.EffectiveDate).format('YYYY-MM-DD');
      empRateSet.Status = 1;
      empRateSet.RatesetProducts = this.currentEmployeeRateset.RatesetProducts;

      console.log('ss', empRateSet)
      // empDetails.EmployeeRatesets.push(empRateSet);
      // empDetails.EmploymentContracts.push(empContract);


      // if (this.RedirectPage == 'FBP') {
      //   this.currentEmployeeRateset['PayGroupdId'] = this.currentEmployeeRateset['PayGroupId'];
      // }


      // empDetails.EmployeeRatesets.push(this.currentEmployeeRateset);
      empDetails.EmployeeRatesets.push(empRateSet);
      empDetails.EmploymentContracts = this.employeedetails.EmploymentContracts;
      // empDetails.EmploymentContracts.push(empContract);

      if (this.RedirectPage == 'Investment') {
        empDetails.EmploymentContracts[0].IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;
      }


      empDetails.EmploymentContracts[0].LstRateSets = [];
      empDetails.EmploymentContracts[0].LstRateSets = empDetails.EmployeeRatesets;



      empDetails.LstemployeeHouseRentDetails = [];
      empDetails.LstemployeeOtherIncomeSources = [];
      empDetails.LstEmployeeHousePropertyDetails = [];
      empDetails.LstemployeeInvestmentDeductions = [];
      empDetails.LstEmployeeTaxExemptionDetails = [];

      //   empHouseRentDetails.StartDate = moment(firstItem).format('YYYY-MM-DD');
      //   empHouseRentDetails.EndDate = moment(lastItem).format('YYYY-MM-DD');
      //   empHouseRentDetails.FinancialYearId = this.currentFinYear;
      //   empHouseRentDetails.RentAmount = HRAAmount;
      //   empDetails.LstemployeeHouseRentDetails.push(empHouseRentDetails);

      // } 

      if (this.RedirectPage != 'FBP') {

        this.employeedetails.LstEmployeeTaxExemptionDetails && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0
          && this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(e3 => {
            if (e3.FinancialYearId == this.currentFinYear) {
              var empExemption = new EmployeeTaxExemptionDetails();
              empExemption.IsProposed = IsProposed;
              empExemption.EmployeeId = this.EmployeeId;
              empExemption.FinancialYearId = this.currentFinYear;
              empExemption.Amount = e3.Amount;
              empExemption.ProductId = e3.ProductId
              empDetails.LstEmployeeTaxExemptionDetails.push(empExemption);
            }
          });

      }


      this.IncomeDetailsParticulars.forEach(ele => {

        ele.Child.forEach(ele1 => {

          if (ele1.Amount > 0 && ele1.Amount != null && ele1.Amount != '') {

            var empOtherIncome = new EmployeeOtherIncomeSources();
            var empHouseRentDetails = new EmployeeHouseRentDetails();
            var empHouseInterest = new EmployeeHousePropertyDetails();
            var empInvestmentDeduction = new EmployeeInvestmentDeductions();

            var empDependentDetails = new EmployeeInvesmentDependentDetails();

            console.log('ele1', ele1);

            // House Rent Details
            if (ele1.Code == 'HRA') {
              empHouseRentDetails.StartDate = moment(this.FinancialStartDate).format('YYYY-MM-DD');
              empHouseRentDetails.EndDate = moment(this.FinancialEndDate).format('YYYY-MM-DD');
              empHouseRentDetails.FinancialYearId = this.currentFinYear;
              empHouseRentDetails.RentAmount = ele1.Amount;
              empHouseRentDetails.IsProposed = IsProposed;
              empDetails.LstemployeeHouseRentDetails.push(empHouseRentDetails);
            }
            // Other Income source 
            else if (ele1.Code == 'OTHER') {

              empOtherIncome.IsProposed = IsProposed;
              empOtherIncome.EmployeeId = this.EmployeeId;
              empOtherIncome.FinancialYearId = this.currentFinYear;
              empOtherIncome.OtherIncomeAmount = ele1.Amount;
              empOtherIncome.TotalInterestAmount = 0;
              empDetails.LstemployeeOtherIncomeSources.push(empOtherIncome);
            }

            //House Property
            else if (ele1.Code == 'HP') {
              empHouseInterest.IsProposed = IsProposed;
              empHouseInterest.LetOut = false,
                empHouseInterest.OwnershipPercentage = 100;
              empHouseInterest.EmployeeId = this.EmployeeId;
              empHouseInterest.FinancialYearId = this.currentFinYear;
              empHouseInterest.LoanDate = '2020-04-10';
              empHouseInterest.PossessionDate = '2020-04-10'
              empHouseInterest.InterestAmount = (ele1.Amount == null || ele1.Amount == '') ? 0 : ele1.Amount;
              empDetails.LstEmployeeHousePropertyDetails.push(empHouseInterest);
            }

            // House Property
            else if (ele1.Code == 'HP_80EEA') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }
            // test
            // LIC 
            else if (ele1.Code == '80C') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // Scheme
            else if (ele1.Code == '80CCD(1B)') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // Scheme
            else if (ele1.Code == '80CCD(2)') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // Medical
             // Check if the code is '80D' and the total amount matches
             if (ele1.Code == '80D' && this.totalAmount80D == ele1.Amount) {

              empInvestmentDeduction.LstEmpInvDepDetails = [];
              let medicalProductIds:any[] = [];

              // Filter out the declaration products for specific sections
              medicalProductIds = this.LstAllDeclarationProducts.filter(a => ['SEC80DD', 'SEC80DDB', 'SEC80D', 'SEC80D_P', 'SEC80D_S'].includes(a.Code.toUpperCase())).map(a => a.ProductId)

              // Extract product IDs from the filtered products
              // medicalProducts.forEach(element => {
              //   medicalProductIds.push(element.ProductId);
              // });

              const medicalProductInvestments = this.employeedetails.LstemployeeInvestmentDeductions.filter((v: any) => medicalProductIds.includes(v.ProductID));

              if (medicalProductInvestments.length > 0) {
                medicalProductInvestments.forEach(e => {
                  if (e.FinancialYearId == this.selectedFinYear && e.IsProposed == (this.currentTaxMode == 1)) {

                    empInvestmentDeduction = new EmployeeInvestmentDeductions();
                    empInvestmentDeduction.LstEmpInvDepDetails = [];

                    // Copy dependent details if available
                    if (e.LstEmpInvDepDetails) {
                      e.LstEmpInvDepDetails.forEach(e6 => {
                        let empDependentDetails = new EmployeeInvesmentDependentDetails();
                        empDependentDetails.Amount = e6.Amount;
                        empDependentDetails.DependentType = e6.DependentType;
                        empDependentDetails.Relationship = e6.Relationship;
                        empDependentDetails.EmployeeId = this.EmployeeId;
                        empInvestmentDeduction.LstEmpInvDepDetails.push(empDependentDetails);
                      });
                    }

                    // Set the main investment deduction properties
                    empInvestmentDeduction.EmployeeId = this.EmployeeId;
                    empInvestmentDeduction.FinancialYearId = this.currentFinYear;
                    empInvestmentDeduction.Amount = e.Amount;
                    empInvestmentDeduction.ProductID = e.ProductID;
                    empInvestmentDeduction.IsProposed = IsProposed;
                   
                    empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
                  }
                });
              }
            }
          // Check if the code is '80D' and the total amount if mismatches
          else if (ele1.Code == '80D' && this.totalAmount80D != ele1.Amount) {

              empInvestmentDeduction.LstEmpInvDepDetails = [];

              if (ele1.Amount < 50000 && this.selectedAgeSlabs == 1) {

                var empDependentDetails = new EmployeeInvesmentDependentDetails();
                empDependentDetails.Amount = ele1.Amount
                empDependentDetails.DependentType = 1;// self 
                empDependentDetails.Relationship = 0;
                empDependentDetails.EmployeeId = this.EmployeeId

                empInvestmentDeduction.LstEmpInvDepDetails.push(empDependentDetails);

              }
              else if (ele1.Amount > 50000 && this.selectedAgeSlabs == 1) {

                var empDependentDetails = new EmployeeInvesmentDependentDetails();
                empDependentDetails.Amount = 50000
                empDependentDetails.DependentType = 1;// self 
                empDependentDetails.Relationship = 0;
                empDependentDetails.EmployeeId = this.EmployeeId
                empInvestmentDeduction.LstEmpInvDepDetails.push(empDependentDetails);

                var empDependentDetails1 = new EmployeeInvesmentDependentDetails();

                empDependentDetails1.Amount = ele1.Amount - 50000
                empDependentDetails1.DependentType = 1;// self 
                empDependentDetails1.Relationship = 1;
                empDependentDetails1.EmployeeId = this.EmployeeId
                empInvestmentDeduction.LstEmpInvDepDetails.push(empDependentDetails1);

              }
              else if (ele1.Amount < 50000 && (this.selectedAgeSlabs == 2 || this.selectedAgeSlabs == 3)) {

                var empDependentDetails = new EmployeeInvesmentDependentDetails();
                empDependentDetails.Amount = ele1.Amount
                empDependentDetails.DependentType = 1;// self 
                empDependentDetails.Relationship = 1;
                empDependentDetails.EmployeeId = this.EmployeeId
                empInvestmentDeduction.LstEmpInvDepDetails.push(empDependentDetails);

              }
              else if (ele1.Amount > 50000 && (this.selectedAgeSlabs == 2 || this.selectedAgeSlabs == 3)) {

                var empDependentDetails = new EmployeeInvesmentDependentDetails();
                empDependentDetails.Amount = 50000
                empDependentDetails.DependentType = 1;// self 
                empDependentDetails.Relationship = 1;
                empDependentDetails.EmployeeId = this.EmployeeId
                empInvestmentDeduction.LstEmpInvDepDetails.push(empDependentDetails);

                var empDependentDetails1 = new EmployeeInvesmentDependentDetails();

                empDependentDetails1.Amount = ele1.Amount - 50000
                empDependentDetails1.DependentType = 1;// self 
                empDependentDetails1.Relationship = 2;
                empDependentDetails1.EmployeeId = this.EmployeeId
                empInvestmentDeduction.LstEmpInvDepDetails.push(empDependentDetails1);

              }

              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empInvestmentDeduction.IsProposed = IsProposed;
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // Education Loan
            else if (ele1.Code == '80E') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // Donations
            else if (ele1.Code == '80G') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // Savings
            else if (ele1.Code == '80TTA') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // House Interest Paid
            else if (ele1.Code == '80EE') {
              empInvestmentDeduction.IsProposed = IsProposed;
              empInvestmentDeduction.EmployeeId = this.EmployeeId;
              empInvestmentDeduction.FinancialYearId = this.currentFinYear;
              empInvestmentDeduction.Amount = ele1.Amount;
              empInvestmentDeduction.ProductID = ele1.ProductId
              empDetails.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
            }

            // Exemption
            // else if (ele1.Code == 'EXEP' && this.RedirectPage == 'Investment') {
            //   empExemption.IsProposed = IsProposed;
            //   empExemption.EmployeeId = this.EmployeeId;
            //   empExemption.FinancialYearId = this.currentFinYear;
            //   empExemption.Amount = ele1.Amount;
            //   empExemption.ProductId = ele1.ProductId
            //   empDetails.LstEmployeeTaxExemptionDetails.push(empExemption);
            // }
          }
        });

      });


      employeeTaxCalculator.EmployeeDetails = empDetails;

      console.log('INPUTS ::', employeeTaxCalculator);



      this.employeeService.CalculateTax(JSON.stringify(employeeTaxCalculator)).subscribe((result) => {
        let apiR: apiResult = result;
        console.log('apiR ::: ', apiR);
        this.loadingScreenService.stopLoading();

        if (apiR.Status) {
          this.isCalculated = true;
          this.alertService.showSuccess(apiR.Message);
          let calculatedOutput: EmployeeTaxCalculator = apiR.Result as any;

          if (calculatedOutput.PayTransaction && calculatedOutput.PayTransactionNewRegime) {
            this.PayGroupResult.forEach(e5 => {
              e5.Old = calculatedOutput.PayTransaction[e5.Prop],
                e5.New = calculatedOutput.PayTransactionNewRegime[e5.Prop]
              if (e5.Prop == 'TDS') {
                this.isRecommendedBoxRequired = calculatedOutput.PayTransaction[e5.Prop] == 0 && calculatedOutput.PayTransactionNewRegime[e5.Prop] == 0 ? false : true;
                this.AmountDifferenece = Math.abs(calculatedOutput.PayTransaction[e5.Prop] - calculatedOutput.PayTransactionNewRegime[e5.Prop])
                this.isRecommendedOld = calculatedOutput.PayTransaction[e5.Prop] > calculatedOutput.PayTransactionNewRegime[e5.Prop] ? false : true;
                console.log('RECMD >>>>>> ', this.isRecommendedOld)
              }
            });

          }

          if (calculatedOutput.PayTransactionNewRegime && this.TaxRegimeName == "New Regime") {
            this.TotalExemptions = calculatedOutput.PayTransactionNewRegime.Exemptions;
            this.TotalDeductions = calculatedOutput.PayTransactionNewRegime.Deductions;
            this.TotalGrossSalary = calculatedOutput.PayTransactionNewRegime.GrossSalary;

            if (calculatedOutput.PayTransactionNewRegime.TaxItemdata != null && calculatedOutput.PayTransactionNewRegime.TaxItemdata.length > 0) {
              var Obj3 = calculatedOutput.PayTransactionNewRegime.TaxItemdata.filter(item => item.PayTransactionHead.toUpperCase() == 'EXEMPTIONS');
              this.exemptionTaxItems = _.uniqBy(Obj3, function (e) {
                return e.ProductId;
              });
              this.exemptionTaxItems = this.exemptionTaxItems.filter(a => a.Amount > 0);
              console.log('Regime New Exemp', this.exemptionTaxItems);
            }


            this.IncomeDetailsParticulars.forEach(ele => {
              ele.Child.forEach(ele1 => {
                if (ele1.Code == '80C' && calculatedOutput.PayTransactionNewRegime.Savings < ele1.Limit) {
                  let additionalAmount = 0;
                  additionalAmount = Math.abs(calculatedOutput.PayTransactionNewRegime.Savings - ele1.Limit);


                  let newObj = {
                    ExtraAmount: additionalAmount,
                    SectionName: "80C",
                    TaxAmount: Math.abs(additionalAmount * calculatedOutput.PayTransactionNewRegime.TaxPercentage / 100),
                  }
                  this.LstAdditionalInvestOptions.push(newObj);

                }
                else if (ele1.Code == '80CCD(1B)' && ele1.Amount < ele1.Limit) {
                  let additionalAmount = 0;
                  additionalAmount = Math.abs(ele1.Amount - ele1.Limit);

                  let newObj = {
                    ExtraAmount: additionalAmount,
                    SectionName: "80CCD(1B)",
                    TaxAmount: Math.abs(additionalAmount * calculatedOutput.PayTransactionNewRegime.TaxPercentage / 100),
                  }
                  this.LstAdditionalInvestOptions.push(newObj);

                }
                else if (ele1.Code == '80D' && ele1.Amount < ele1.Limit) {
                  let additionalAmount = 0;
                  additionalAmount = Math.abs(ele1.Amount - ele1.Limit);

                  let newObj = {
                    ExtraAmount: additionalAmount,
                    SectionName: "80D",
                    TaxAmount: Math.abs(additionalAmount * calculatedOutput.PayTransactionNewRegime.TaxPercentage / 100),
                  }
                  this.LstAdditionalInvestOptions.push(newObj);

                }
              });

            });

            console.log('AdditionalInvestOptions', this.LstAdditionalInvestOptions);
          }

          if (calculatedOutput.PayTransaction && this.TaxRegimeName == "Old Regime") {


            this.TotalExemptions = calculatedOutput.PayTransaction.Exemptions;
            this.TotalDeductions = calculatedOutput.PayTransaction.Deductions;
            this.TotalGrossSalary = calculatedOutput.PayTransaction.GrossSalary;
            this.exemptionTaxItems = [];

            if (calculatedOutput.PayTransaction.TaxItemdata != null && calculatedOutput.PayTransaction.TaxItemdata.length > 0) {
              var Obj3 = calculatedOutput.PayTransaction.TaxItemdata.filter(item => item.PayTransactionHead.toUpperCase() == 'EXEMPTIONS');
              this.exemptionTaxItems = _.uniqBy(Obj3, function (e) {
                return e.ProductId;
              });
              this.exemptionTaxItems = this.exemptionTaxItems.filter(a => a.Amount > 0);
              console.log('Old Regime Exemp', this.exemptionTaxItems);
            }



            this.IncomeDetailsParticulars.forEach(ele => {
              ele.Child.forEach(ele1 => {
                if (ele1.Code == '80C' && calculatedOutput.PayTransaction.Savings < ele1.Limit) {
                  let additionalAmount = 0;
                  additionalAmount = Math.abs(calculatedOutput.PayTransaction.Savings - ele1.Limit);


                  let newObj = {
                    ExtraAmount: additionalAmount,
                    SectionName: "80C",
                    TaxAmount: Math.abs(additionalAmount * calculatedOutput.PayTransaction.TaxPercentage / 100),
                  }
                  this.LstAdditionalInvestOptions.push(newObj);

                }
                else if (ele1.Code == '80CCD(1B)' && ele1.Amount < ele1.Limit) {
                  let additionalAmount = 0;
                  additionalAmount = Math.abs(ele1.Amount - ele1.Limit);

                  let newObj = {
                    ExtraAmount: additionalAmount,
                    SectionName: "80CCD(1B)",
                    TaxAmount: Math.abs(additionalAmount * calculatedOutput.PayTransaction.TaxPercentage / 100),
                  }
                  this.LstAdditionalInvestOptions.push(newObj);

                }
                else if (ele1.Code == '80D' && ele1.Amount < ele1.Limit) {
                  let additionalAmount = 0;
                  additionalAmount = Math.abs(ele1.Amount - ele1.Limit);

                  let newObj = {
                    ExtraAmount: additionalAmount,
                    SectionName: "80D",
                    TaxAmount: Math.abs(additionalAmount * calculatedOutput.PayTransaction.TaxPercentage / 100),
                  }
                  this.LstAdditionalInvestOptions.push(newObj);

                }
              });

            });

            console.log('AdditionalInvestOptions', this.LstAdditionalInvestOptions);

          }

        } else {
          this.alertService.showWarning(apiR.Message);
        }

      })
    } catch (error) {
      console.log('EXE ERR ::', error);

    }
  }

  goToInvestment() {
    if (this.RedirectPage == 'Investment') {
      this.activeModal.close('Modal Closed');
    } else if (this.RedirectPage == 'FBP' && this.RoleCode == 'Employee') {
      this.activeModal.close('Modal Closed');
      this.router.navigate(['/app/investment/myinvestment']);
    }
  }

  close() {
    this.activeModal.close('Modal Closed');
  }

  toShowYellowBox() {
    return this.isRecommendedOld && this.PayGroupResult.filter(a => a.Prop == 'TDS' && 
    (a.Old == '0')).length ? false : true;
  }
}
