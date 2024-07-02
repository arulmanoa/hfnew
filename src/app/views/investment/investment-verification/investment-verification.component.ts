import { ViewportScroller } from '@angular/common';
import { Component, OnInit, Inject, Input, TemplateRef, ViewChild, ViewEncapsulation, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';
import { id } from 'date-fns/locale';
import _ from 'lodash';
import moment from 'moment';
import { NzDrawerPlacement, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { PaymentstatusComponent } from 'src/app/shared/modals/payroll/paymentstatus/paymentstatus.component';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { NotFoundError } from 'src/app/_guards/notFound';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { apiResult } from 'src/app/_services/model/apiResult';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { Relationship, RelationshipDependent } from 'src/app/_services/model/Base/HRSuiteEnums';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { EmployeeDetails, EmployeeInvestmentMaster, EmployeeMenuData, EmployeePayrollSummaryDetails, HouseRentType, HtmlToPDFSrc } from 'src/app/_services/model/Employee/EmployeeDetails';
import { EmployeeHouseRentDetails } from 'src/app/_services/model/Employee/EmployeeHouseRentDetails';
import { EmployeeInvesmentDependentDetails, EmployeeInvestmentDeductions, EmployeeInvestmentDocuments, InvestmentLogHistory } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { InterestIncomeType } from 'src/app/_services/model/Employee/EmployeeOtherIncomeSources';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { ApprovalStatus } from 'src/app/_services/model/OnBoarding/QC';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { AlertService, EmployeeService, ESSService, FileUploadService, HeaderService, PayrollService, SessionStorage } from 'src/app/_services/service';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RowDataService } from '../../personalised-display/row-data.service';
import { HousePropertyModalComponent } from '../shared/modals/house-property-modal/house-property-modal.component';
import { ManageinvestmentComponent } from '../shared/modals/manageinvestment/manageinvestment.component';

@Component({
  selector: 'app-investment-verification',
  templateUrl: './investment-verification.component.html',
  styleUrls: ['./investment-verification.component.scss'],
  // providers: [
  //   { provide: Window, useValue: window }
  // ],
})
export class InvestmentVerificationComponent implements OnInit {
  pageYoffset = 0;
  // @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;
  @HostListener('window:scroll', ['$event']) onScroll(event) {
    this.pageYoffset = window.pageYOffset;
  }
  spinner: boolean = false;
  BusinessType: number = 0;
  CompanyId: number = 0;
  RoleCode: string = '';
  ImplementationCompanyId: number = 0;
  RoleId: number = 0;
  UserId: number = 0;
  loginSessionDetails: LoginResponses;

  employeedetails: EmployeeDetails;
  employeeModel: EmployeeModel = new EmployeeModel();
  EmployeeId: number = 0;
  selectedCategory: number = 0;
  selectedStatus: number = 3;
  CategoryType = [];
  ApprovalStatus = [];
  LastUpdatedOn: any;

  LstEmployeeInvestmentLookup: EmployeeLookUp;
  currentFinYear: number = 0;
  selectedFinYear: number = 0;
  currentTaxMode: number = 0; // 1 : DECLARATION | 2: PROOF
  LstAllDeclarationProducts = [];
  PerquisitesProductList = [];
  _Designation: any;
  _DOJ: any;
  DeclarationRecords: any[] = [];
  TaxRegimeName: string = "";
  IsNewTaxRegimeOpted: boolean = false;
  FinancialYearDescription: string = "";
  // SLIDER
  selectedInvestmentItem: any;
  currentIndex: number = 0;
  IsDisablePrevIndexBasedBtn: boolean = false;
  IsDisableNextIndexBasedBtn: boolean = false;
  isCallingS3Bucket: boolean = false;
  IsEditable: boolean = false;

  IsInvestmentExists: boolean = false;
  // MEDICAL

  relationship: any = [];
  LstMedicalInsuranceProduct = [];
  IsMedicalDependentExists: boolean = false;
  DependentType = [{ Id: 1, Name: "Self" }, { Id: 2, Name: "Immediate Dependents" }, { Id: 3, Name: "Parents more than 60 years old" }];
  lstDisabilityPercentage = [{ Id: 1, Name: "more than 40% but less than 80%" }, { Id: 2, Name: "more than 80%" }];
  // TAX EXEMPTION
  LstTaxExemptionProduct = [];
  IsExemptionExists: boolean = false;
  IsLTAExemption : boolean = false;

  // HRA

  IsHRAExists: boolean = false;
  HRALandlordDetails: any;
  SelectedHRAId: any = 0;

  // HP
  IsHPExists: boolean = false;
  ExsitingChildProduct: any;
  Existing80CChildProduct: any;

  // PREVIOUS EMPLOYMENT
  previousEmploymentDetails: any;

  // Other Income 
  IsOtherIncomeExists: boolean = false;
  interestIncomeType: any = [];

  // perquisites

  perquisitesDetail: any;

  isReviewing: boolean = false;
  documentURL = null;
  documentURLId = null;

  workFlowDtls: WorkFlowInitiation = new WorkFlowInitiation;
  OverallRemarks: string = "";
  modalOption: NgbModalOptions = {};

  // HP Child Prod
  HPChildProducts = [];
  StampDutyFeeProduct = [];

  // 
  LstTravellerDetails = [];
  relationshipDependent : any =[];
  TravelTypes = [
    { id: 1, name: 'Bus' },
    { id: 2, name: 'Flight' },
    { id: 3, name: 'Train' },
    { id: 4, name: 'Cab' },
    { id: 5, name: 'Own vehicle' },
    { id: 6, name: 'Others' },
  ];

  constructor(
    //  @Inject(Window) private window: Window,
    private drawerService: NzDrawerService, private essService: ESSService, private alertService: AlertService, private sessionService: SessionStorage,
    private fileuploadService: FileUploadService, private employeeService: EmployeeService, private loadingScreenService: LoadingScreenService,
    private utilityService: UtilityService, private modalService: NgbModal, private investmentService: InvestmentService, private utilsHelper: enumHelper,
    private headerService: HeaderService, private titleService: Title, private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private router: Router, private UtilityService: UtilityService,
    private sanitizer: DomSanitizer,
    private scroll: ViewportScroller,
    private payrollService: PayrollService


  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        var encodedCdx = atob(params["Cdx"]);
        this.EmployeeId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);
      }
      else {
        alert('Invalid Url');
        this.router.navigateByUrl("app/onboardingqc/investment_qc");
        return;
      }
    });

    if (this.EmployeeId == 0) {
      alert('Invalid Employee Records');
      this.router.navigateByUrl("app/onboardingqc/investment_qc");
      return;
    }

    this.headerService.setTitle('Investment Verification');
    this.titleService.setTitle('Investment Verification');


    // this.EmployeeId = 15197;// 100038; 

    this.spinner = true;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
    this.RoleCode = this.loginSessionDetails.UIRoles[0].Role.Code;
    this.ImplementationCompanyId = this.loginSessionDetails.ImplementationCompanyId;
    this.RoleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.loginSessionDetails.UserSession.UserId;
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    this.onRefresh();
  }

  onRefresh() {
    this.CategoryType = [{ Id: 0, Name: "All" }, { Id: 1, Name: "Investment" }, { Id: 2, Name: "Deduction" }, { Id: 3, Name: "Exemptions" }, { Id: 4, Name: "Others" }];
    this.ApprovalStatus = [{ Id: 0, Name: "Pending" }, { Id: 1, Name: "Approved" }, { Id: 2, Name: "Rejected" }, { Id: 3, Name: "All" }];

    this.LoadEmployeInvestmentUILookupDetails();
    this.relationship = this.utilsHelper.transform(Relationship);
    this.interestIncomeType = this.utilsHelper.transform(InterestIncomeType);
    this.relationshipDependent = this.utilsHelper.transform(RelationshipDependent);

    this.relationship.push({ id: 0, name: 'Self' });
    this.relationship.sort((a, b) => a.id - b.id);
  }


  LoadEmployeInvestmentUILookupDetails(): void {
    this.essService.LoadEmployeInvestmentUILookupDetails(this.EmployeeId).subscribe((result) => {
      let apiResponse: apiResponse = result;
      try {
        if (apiResponse.Status) {
          this.LstEmployeeInvestmentLookup = JSON.parse(apiResponse.dynamicObject);
          console.log('Employee Investment Lookup >>>>>>>>>>>>>>>>> ', this.LstEmployeeInvestmentLookup);
          this.LstAllDeclarationProducts = this.LstEmployeeInvestmentLookup != null ? this.LstEmployeeInvestmentLookup.InvesmentProductList : [];
          this.PerquisitesProductList = this.LstEmployeeInvestmentLookup.PerquisitesProductList;
          this.LstTaxExemptionProduct = this.LstAllDeclarationProducts.filter(exe => exe.TaxCodeTypeId == TaxCodeType.Exemptions);
          this.currentFinYear = this.LstEmployeeInvestmentLookup.CurrentFinancialYear;
          this.currentTaxMode = this.LstEmployeeInvestmentLookup.InvestmentMode;
          this.LstMedicalInsuranceProduct = this.LstAllDeclarationProducts.filter(a => a.Code == 'Sec80DD' || a.Code == 'Sec80DDB' || a.Code == "Sec80D" || a.Code == 'Sec80D_S' || a.Code == "Sec80D_P");
          this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.forEach(j => {
            j["IsInvalid"] = false;
          });

          this.HPChildProducts = this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.filter(pro => environment.environment.HousePropertiesChildProductCodes.includes(pro.ProductCode.toUpperCase())) : [];
          this.StampDutyFeeProduct = this.HPChildProducts.length > 0 && this.HPChildProducts.filter(a => a.Code == 'Sec80C').length > 0
            ? this.HPChildProducts.filter(a => a.Code == 'Sec80C') : [];
          this.FinancialYearDescription = this.LstEmployeeInvestmentLookup.FicalYearList.find(dt => dt.Id == this.currentFinYear).code.replace(/_/g, "-");
          this.selectedFinYear = this.currentFinYear;
          this.GetEmployeeRequiredDetailsById(this.currentFinYear);

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
            this.employeedetails = apiR.Result as any;
            this.employeeModel.oldobj = Object.assign({}, result.Result);
            this._DOJ = this.UtilityService.isNotNullAndUndefined(this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2)) == true ? this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).StartDate : '---';
            this._Designation = this.UtilityService.isNotNullAndUndefined(this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2)) == true ? this.employeedetails.EmploymentContracts.find(a => a.Status == 1 || a.Status == 0 || a.Status == 2).Designation : '---';
            this._Designation = this._Designation == 'NULL' ? '---' : this._Designation; resolve(true);
            this.LastUpdatedOn = this.employeedetails != null && this.employeedetails.EmployeeInvestmentMaster != null ?
              this.employeedetails.EmployeeInvestmentMaster.LastUpdatedOn : null;
            this.TaxRegimeName = this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted == true ? "New Regime" : "Old Regime";
            this.IsNewTaxRegimeOpted = this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted;
            this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 ? this.employeedetails.LstemploymentDetails =
              this.employeedetails.LstemploymentDetails.filter(z => z.FinancialYearId == this.selectedFinYear) : true;
            this.doPushLandingCardRecord(0, 3); // category : all, status : all
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
  // --- THE FUNCTIONALITY OF A LANDING PAGE STARTS HERE --- 
  doPushLandingCardRecord(categoryId, statusId) {
    try {


      this.spinner = true;
      let DeclarationData = [];

      if (!this.IsNewTaxRegimeOpted) { // when old tax regime 


        this.employeedetails.LstemployeeOtherIncomeSources != null &&
          this.employeedetails.LstemployeeOtherIncomeSources.length > 0
        this.employeedetails.LstemployeeOtherIncomeSources.forEach(element => {
          if (!element.IsProposed && element.FinancialYearId == this.selectedFinYear)
            DeclarationData.push({
              ProductName: 'Other Income',
              ProductId: 0,
              ProductSection: null,
              ProductDescription: 'Includes interest from savings bank, deposits and other interest',
              ProductTaxCodeType: 'Other Income',
              ProductTaxCodeTypeId: 4,
              DeclaredAmount: element.InterestIncomeType == 3 ? element.OtherIncomeAmount : element.TotalInterestAmount,
              DeclaredRemarks: element.InputsRemarks,
              ApprovedAmount: element.InterestIncomeType == 3 ? element.ApprovedOtherIncomeAmount : element.TotalApprovedInterestAmount,
              ApproverRemarks: element.ApproverRemarks,
              DocumentPendingStatus: element.Status == 0 ? 1 : 0,
              DocumentApprovedStatus: element.Status == 1 ? 1 : 0,
              DocumentRejectedtatus: element.Status == 2 ? 1 : 0,
              DocumentList: [{ DocumentId: element.DocumentId, FileName: element.FileName }],
              Id: element.Id,
              Status: element.Status,
              IsProposed: element.IsProposed,
              FinancialYearId: element.FinancialYearId,
              DeclarationItem: element,
              IsMedical: false,
              IsHRA: false,
              IsExemptions: false,
              IsHP: false,
              IsInvestment: false,
              IsOtherIncome: true,
              ExsitingChildProduct: null,
              IsLTA : false
            })

        });


        this.employeedetails.LstemployeeInvestmentDeductions != null &&
          this.employeedetails.LstemployeeInvestmentDeductions.length > 0
        this.employeedetails.LstemployeeInvestmentDeductions.forEach(element => {
          if (!element.IsProposed && element.FinancialYearId == this.selectedFinYear && (element.EHPId == 0 || element.EHPId == null) && this.StampDutyFeeProduct.filter(y => y.ProductId == element.ProductID).length == 0 && !environment.environment.HousePropertiesChildProductCodes.includes(this.LstAllDeclarationProducts.find(a => a.ProductId != element.ProductID).ProductCode.toUpperCase()))
            DeclarationData.push({
              ProductName: this.getProductName(element.ProductID),
              ProductId: element.ProductID,
              ProductSection: this.getProductSection(element.ProductID),
              ProductDescription: this.getProductDescription(element.ProductID),
              ProductTaxCodeType: this.getProductTaxCodeEnum(element.ProductID),
              ProductTaxCodeTypeId: this.LstAllDeclarationProducts.find(z => z.ProductId == element.ProductID).TaxCodeTypeId,
              DeclaredAmount: element.Amount,
              DeclaredRemarks: element.InputsRemarks,
              ApprovedAmount: element.ApprovedAmount,
              ApproverRemarks: element.ApproverRemarks,
              DocumentPendingStatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 0) : null,
              DocumentApprovedStatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 1) : null,
              DocumentRejectedtatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 2) : null,
              DocumentList: element.LstEmployeeInvestmentDocuments,
              Id: element.Id,
              Status: element.Status,
              IsProposed: element.IsProposed,
              FinancialYearId: element.FinancialYearId,
              DeclarationItem: element,
              IsMedical: this.LstMedicalInsuranceProduct.find(med => med.ProductId == element.ProductID) && this.LstMedicalInsuranceProduct.find(med => med.ProductId == element.ProductID && element.LstEmpInvDepDetails.length > 0) ? true : false,
              IsHRA: false,
              IsExemptions: false,
              IsHP: false,
              IsInvestment: true,
              ExsitingChildProduct: null,
              Existing80CChildProduct: null,
              IsOtherIncome: false,
              IsLTA : false
            })

        });


        this.employeedetails.LstEmployeeTaxExemptionDetails != null &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0
        this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(element => {

          if (!element.IsProposed && element.FinancialYearId == this.selectedFinYear) {
            element.LstEmployeeExemptionBillDetails.length > 0 ? element.LstEmployeeExemptionBillDetails = element.LstEmployeeExemptionBillDetails.filter(z => z.BillId > 0) : true;
            if (element.LstEmployeeExemptionBillDetails.length > 0) {
              DeclarationData.push({
                ProductName: this.getProductName(element.ProductId),
                ProductId: element.ProductId,
                ProductSection: this.getProductSection(element.ProductId),
                ProductDescription: this.getProductDescription(element.ProductId),
                ProductTaxCodeType: this.getProductTaxCodeEnum(element.ProductId),
                ProductTaxCodeTypeId: 3,
                DeclaredAmount: element.Amount,
                DeclaredRemarks: element.InputsRemarks,
                ApprovedAmount: element.ApprovedAmount,
                ApproverRemarks: element.ApproverRemarks,
                DocumentPendingStatus: element.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(element.LstEmployeeExemptionBillDetails, 0) : 0,
                DocumentApprovedStatus: element.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(element.LstEmployeeExemptionBillDetails, 1) : 0,
                DocumentRejectedtatus: element.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(element.LstEmployeeExemptionBillDetails, 2) : 0,
                DocumentList: element.LstEmployeeExemptionBillDetails.filter(z => z.BillId > 0),
                Id: element.Id,
                Status: element.Status,
                IsProposed: element.IsProposed,
                FinancialYearId: element.FinancialYearId,
                DeclarationItem: element,
                IsMedical: false,
                IsHRA: false,
                IsExemptions: true,
                IsHP: false,
                IsInvestment: false,
                ExsitingChildProduct: null,
                Existing80CChildProduct: null,
                IsOtherIncome: false,
                IsLTA : this.getProductCode(element.ProductId) == 'LTA' ? true : false


              })
            }
          }

        });


        // this.employeedetails.LstemployeeHouseRentDetails != null &&
        //   this.employeedetails.LstemployeeHouseRentDetails.length > 0
        // this.employeedetails.LstemployeeHouseRentDetails.forEach(element => {
        //   if (!element.IsProposed)
        //     DeclarationData.push({
        //       ProductName: 'House Rent Paid',
        //       ProductId: this.LstAllDeclarationProducts.find(z => z.ProductCode == 'HRA'),
        //       ProductSection: 'Sec 10',
        //       ProductDescription: 'Exemptions',
        //       ProductTaxCodeType: 'Exemptions',
        //       ProductTaxCodeTypeId: 3,
        //       DeclaredAmount: element.RentAmount,
        //       DeclaredRemarks: element.InputsRemarks,
        //       ApprovedAmount: element.ApprovedAmount,
        //       ApproverRemarks: element.ApproverRemarks,
        //       DocumentPendingStatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 0) : null,
        //       DocumentApprovedStatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 1) : null,
        //       DocumentRejectedtatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 2) : null,
        //       DocumentList: element.LstEmployeeInvestmentDocuments,
        //       Id: element.Id,
        //       Status: element.Status,
        //       IsProposed: element.IsProposed,
        //       FinancialYearId: element.FinancialYearId,
        //       DeclarationItem: element,
        //       IsMedical: false,
        //       IsHRA: true,
        //       IsExemptions: false,
        //       IsHP: false,
        //       IsInvestment: false,
        //     })

        // });


        let DeclarationData_HRAObject: any;
        let DeclarationData_HRA = [];
        let RentAmount = 0;
        let TotalApprovedAmount = 0;
        let Pending = 0;
        let Approved = 0;
        let Rejected = 0;
        this.employeedetails.LstemployeeHouseRentDetails != null &&
          this.employeedetails.LstemployeeHouseRentDetails.length > 0
        this.employeedetails.LstemployeeHouseRentDetails.forEach(element => {

          if (!element.IsProposed && element.FinancialYearId == this.selectedFinYear)
            RentAmount = RentAmount + element.RentAmount;
          TotalApprovedAmount = TotalApprovedAmount + element.ApprovedAmount;
          Pending = Pending + (element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 0) : 0)
          Approved = Approved + (element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 1) : 0)
          Rejected = Rejected + (element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 2) : 0)

          DeclarationData_HRAObject = {
            ProductName: 'House Rent Paid',
            ProductId: this.LstAllDeclarationProducts.find(z => z.ProductCode == 'HRA'),
            ProductSection: 'Sec 10',
            ProductDescription: 'Exemptions',
            ProductTaxCodeType: 'Exemptions',
            ProductTaxCodeTypeId: 3,
            DeclaredAmount: RentAmount,
            DeclaredRemarks: '',
            ApprovedAmount: TotalApprovedAmount,
            ApproverRemarks: '',
            DocumentPendingStatus: Pending,
            DocumentApprovedStatus: Approved,
            DocumentRejectedtatus: Rejected,
            DocumentList: this.employeedetails.LstemployeeHouseRentDetails,
            Id: UUID.UUID(),
            Status: element.Status,
            IsProposed: element.IsProposed,
            FinancialYearId: element.FinancialYearId,
            DeclarationItem: this.employeedetails.LstemployeeHouseRentDetails,
            IsMedical: false,
            IsHRA: true,
            IsExemptions: false,
            IsHP: false,
            IsInvestment: false,
            ExsitingChildProduct: null,
            Existing80CChildProduct: null,
            IsOtherIncome: false,
            IsLTA : false
          };

        });
        DeclarationData_HRA.push(DeclarationData_HRAObject);
        this.employeedetails.LstemployeeHouseRentDetails != null && this.employeedetails.LstemployeeHouseRentDetails.length > 0 ? DeclarationData = DeclarationData.concat(DeclarationData_HRA) : true;

      }

      let ChildProductJson = [];
      let ChildProducts = [];
      let StampDutyFeeProduct = [];
      let ExsitingChildProduct = null;

      ChildProducts = this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.filter(pro => environment.environment.HousePropertiesChildProductCodes.includes(pro.ProductCode.toUpperCase())) : [];
      StampDutyFeeProduct = ChildProducts.length > 0 && ChildProducts.filter(a => a.Code == 'Sec80C').length > 0
        ? ChildProducts.filter(a => a.Code == 'Sec80C') : [];
      ChildProductJson = ChildProducts.filter(val => !StampDutyFeeProduct.includes(val));

      // if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
      //   ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear
      //     && ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
      //     this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null)

      // }

      this.employeedetails.LstEmployeeHousePropertyDetails != null &&
        this.employeedetails.LstEmployeeHousePropertyDetails.length > 0
      this.employeedetails.LstEmployeeHousePropertyDetails.forEach(element => {
        if (!element.IsProposed && element.FinancialYearId == this.selectedFinYear)
          DeclarationData.push({
            ProductName: 'House Property Details',
            ProductId: -101,
            ProductSection: 'Sec 24',
            ProductDescription: 'Deductions',
            ProductTaxCodeType: 'Deductions',
            ProductTaxCodeTypeId: 2,
            DeclaredAmount: this.getCalculatedInvestedAmount(element),
            DeclaredRemarks: element.InputsRemarks,
            ApprovedAmount: this.getCalculatedApprovedAmount(element),
            ApproverRemarks: element.ApproverRemarks,
            DocumentPendingStatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 0) : null,
            DocumentApprovedStatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 1) : null,
            DocumentRejectedtatus: element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 2) : null,
            DocumentList: element.LstEmployeeInvestmentDocuments,
            Id: element.Id,
            Status: element.Status,
            IsProposed: element.IsProposed,
            FinancialYearId: element.FinancialYearId,
            DeclarationItem: element,
            IsMedical: false,
            IsHRA: false,
            IsExemptions: false,
            IsHP: true,
            IsInvestment: false,
            ExsitingChildProduct: this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == element.Id && ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ? this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == element.Id && ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null,
            Existing80CChildProduct: element.LetOut == false ? this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ? this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) : null : null,
            IsOtherIncome: false,
            IsLTA : false
          })
      });


      if (categoryId == 0 && statusId == 3) { // All | All
        this.DeclarationRecords = DeclarationData
      }
      else if (categoryId != 0 && statusId == 3) { // Investment/Deduction/Exemptions/Others | // All
        this.DeclarationRecords = DeclarationData.filter(x => x.ProductTaxCodeTypeId == categoryId);
      }
      else if (categoryId != 0 && statusId != 3) { // Investment/Deduction/Exemptions/Others | // Pending/Approved/Rejected
        this.DeclarationRecords = DeclarationData.filter(x => x.ProductTaxCodeTypeId == categoryId && (statusId == 0 ? x.DocumentPendingStatus > 0 : statusId == 1 ? x.DocumentApprovedStatus > 0 : statusId == 2 ? x.DocumentRejectedtatus > 0 : true));
      }
      else if (categoryId == 0 && statusId != 3) { // All | // Pending/Approved/Rejected
        this.DeclarationRecords = DeclarationData.filter(a => (statusId == 0 ? a.DocumentPendingStatus > 0 : statusId == 1 ? a.DocumentApprovedStatus > 0 : statusId == 2 ? a.DocumentRejectedtatus > 0 : true));
      }
      console.log('LANDING RECD >>>>>>>>>>>>>>>', this.DeclarationRecords);

      this.spinner = false; // CLOSING SPINNER 
    } catch (error) {
      console.log('EXE PRELOAD :::', error);

    }
  }

  getCalculatedInvestedAmount(item) {
    var calculatedAmt = item.LetOut == true ?
      (Number(item.GrossAnnualValue) - Number(item.MunicipalTax)) - ((Number(item.GrossAnnualValue) - Number(item.MunicipalTax)) * 30 / 100) - Number(item.InterestAmount)
      : Number(item.InterestAmount);
    return calculatedAmt;
  }

  getCalculatedApprovedAmount(item) {
    var calculatedAmt = item.LetOut == true ?
      (Number(item.GrossAnnualValueApprovedAmount) - Number(item.MunicipalTaxApprovedAmount)) - ((Number(item.GrossAnnualValueApprovedAmount) - Number(item.MunicipalTaxApprovedAmount)) * 30 / 100) - Number(item.InterestAmountApprovedAmount)
      : Number(item.InterestAmountApprovedAmount);
    return calculatedAmt;
  }


  // functional data binding (to show the name based on the ID)
  getProductName(productId) {
    return productId == 0 ? null : this.LstAllDeclarationProducts != null && this.LstAllDeclarationProducts.length > 0 &&
      this.LstAllDeclarationProducts.find(z => z.ProductId == productId) ? this.LstAllDeclarationProducts.find(z => z.ProductId == productId).ProductName : '---'
  }
  getPerqProductName(productId) {
    return productId == 0 ? null : this.PerquisitesProductList != null && this.PerquisitesProductList.length > 0 &&
      this.PerquisitesProductList.find(z => z.ProductId == productId) ? this.PerquisitesProductList.find(z => z.ProductId == productId).ProductName : '---'
  }

  getProductSection(productId) {
    return productId == 0 ? null : this.LstAllDeclarationProducts != null && this.LstAllDeclarationProducts.length > 0 &&
      this.LstAllDeclarationProducts.find(z => z.ProductId == productId) ? this.LstAllDeclarationProducts.find(z => z.ProductId == productId).Code : '---'
  }
  getProductDescription(productId) {
    return this.LstAllDeclarationProducts != null && this.LstAllDeclarationProducts.length > 0 &&
      this.LstAllDeclarationProducts.find(z => z.ProductId == productId) ? this.LstAllDeclarationProducts.find(z => z.ProductId == productId).Description
      : '---'
  }
  getPerqProductDescription(productId) {
    return this.PerquisitesProductList != null && this.PerquisitesProductList.length > 0 &&
      this.PerquisitesProductList.find(z => z.ProductId == productId) ? this.PerquisitesProductList.find(z => z.ProductId == productId).Description
      : '---'
  }

  getProductTaxCodeEnum(productId) {
    let codeTypeId = this.LstAllDeclarationProducts != null && this.LstAllDeclarationProducts.length > 0 &&
      this.LstAllDeclarationProducts.find(z => z.ProductId == productId) ?
      this.LstAllDeclarationProducts.find(z => z.ProductId == productId).TaxCodeTypeId : null;
    return codeTypeId == 1 ? 'Investment' : codeTypeId == 2 ? 'Deductions' : codeTypeId == 3 ? 'Exemptions' : codeTypeId == 4 ? 'Other Income' : 'Other Income'

  }
  getProductCode(productId) {
    return productId == 0 ? null : this.LstAllDeclarationProducts != null && this.LstAllDeclarationProducts.length > 0 &&
      this.LstAllDeclarationProducts.find(z => z.ProductId == productId) ? this.LstAllDeclarationProducts.find(z => z.ProductId == productId).ProductCode : '---'
  }

  getStatusName(list, status) {
    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;
  }

  getExemptionStatusName(list, status) {
    return list != null && list.length > 0 ? list.filter(a => a.Status == status && a.BillId > 0).length : 0;
  }

  getImageType(fileName) {
    var splitArray = fileName.split('.');
    var ext = splitArray[splitArray.length - 1];
    return ext;
  }
  getCityName(currentItem) {
    let AddressDetails = JSON.parse(this.HRALandlordDetails.LandLordDetails.AddressDetails);
    return this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == AddressDetails.NameofCity).Name;
  }
  getHRAAddressDetails(currentItem, columnName) {
    let AddressDetails = JSON.parse(this.HRALandlordDetails.LandLordDetails.AddressDetails);
    return AddressDetails[columnName];
  }
  getHRADocumentStatus(_selectedInvestmentItem, value) {
    let ispendingDocs = false;
    for (let k = 0; k < _selectedInvestmentItem.length; k++) {
      const element = _selectedInvestmentItem[k];
      ispendingDocs = element.LstEmployeeInvestmentDocuments.filter(g => value == 0 ? g.Status == 0 : g.Status != 0).length > 0 ? true : false;
      if (ispendingDocs) {
        break;
      }
    }
    return ispendingDocs;
  }
  getIncomeTypeName(incomeTypeId) {
    return this.interestIncomeType.find(a => a.id == incomeTypeId).name;
  }

  getAdditionInvestmentSection(item, prop) {

    return prop == 'SectionName' && this.ExsitingChildProduct != null ? this.LstAllDeclarationProducts.find(z => z.ProductId == this.ExsitingChildProduct.ProductID).Code :
      prop == 'SectionDeclaredAmount' && this.ExsitingChildProduct != null ? this.ExsitingChildProduct.Amount : null;
  }

  getAdditionInvestment80CSection(item, prop) {

    return prop == 'SectionName' && this.Existing80CChildProduct != null ? this.LstAllDeclarationProducts.find(z => z.ProductId == this.Existing80CChildProduct.ProductID).Code :
      prop == 'SectionDeclaredAmount' && this.Existing80CChildProduct != null ? this.Existing80CChildProduct.Amount : null;
  }

  onChangeCategoryType(event): void {
    this.doPushLandingCardRecord(this.selectedCategory, this.selectedStatus);

  }
  onChangeApprovalStatus(event): void {
    this.doPushLandingCardRecord(this.selectedCategory, this.selectedStatus);
  }
  getRelationShipName(RId) {
    return this.relationship.find(a => a.id == RId).name;
  }
  getRelationShipName1(RId) {
    return this.relationshipDependent.find(a => a.id == RId).name;
  }

  getDependentTypeName(RId) {
    return this.DependentType.find(a => a.Id == RId).Name;
  }
  getDisabilityPercentageName(RId) {
    return this.lstDisabilityPercentage.find(a => a.Id == RId).Name;
  }

  getSectionCode(sectionCode) {
    let medicalPro = this.LstMedicalInsuranceProduct.find(x => x.ProductId == this.selectedInvestmentItem.ProductID);
    return medicalPro.Code == sectionCode ? true : false;
  }


  // --- THE FUNCTIONALITY OF A LANDING PAGE ENDS HERE --- 

  close_reviewer_slider() {
    this.validateAmountWhileClosing().then((result) => {
      if (result == true) {
        this.isReviewing = false;
        this.selectedInvestmentItem = null;
      }
    });
  }

  // validating the approver's amount while closing the slider if its invalid or does not meet the right criteria.

  validateAmountWhileClosing() {

    const promise = new Promise((resolve, reject) => {

      if (this.IsHPExists) {
        let isReject: boolean = false;
        let isPending: boolean = false;
        let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);
        if (locallyPreparedItem && (locallyPreparedItem.DocumentRejectedtatus > 0 || locallyPreparedItem.DocumentPendingStatus > 0)) {
          isReject = true;
          this.selectedInvestmentItem.GrossAnnualValueApprovedAmount = 0;
          this.selectedInvestmentItem.MunicipalTaxApprovedAmount = 0;
          this.selectedInvestmentItem.InterestAmountApprovedAmount = 0;
          this.selectedInvestmentItem.PreConstructionInterestApprovedAmount = 0;
          resolve(true);
          return;
        }

        if (this.selectedInvestmentItem.LetOut && this.selectedInvestmentItem.GrossAnnualValueApprovedAmount > this.selectedInvestmentItem.GrossAnnualValue) {
          // isReject ?  this.selectedInvestmentItem.GrossAnnualValueApprovedAmount = 0 : this.alertService.showWarning('Note : Gross Annual Approved Amount should be equal to or less than the invested amount.');
          // isReject ? resolve(true) : resolve(false);
          this.alertService.showWarning('Note : Gross Annual Approved Amount should be equal to or less than the invested amount.');
          resolve(false);
          return;
        }
        if (this.selectedInvestmentItem.MunicipalTaxApprovedAmount > this.selectedInvestmentItem.MunicipalTax) {
          this.alertService.showWarning('Note : Municipal Tax Approved Amount should be equal to or less than the invested amount.');
          resolve(false);
          return;
        }

        else if (this.selectedInvestmentItem.InterestAmountApprovedAmount > this.selectedInvestmentItem.InterestAmount) {
          this.alertService.showWarning('Note : Interest Approved Amount should be equal to or less than the invested amount.');
          resolve(false);
          return;
        }
        else if (this.selectedInvestmentItem.PreConstructionInterestApprovedAmount > this.selectedInvestmentItem.PreConstructionInterestAmount) {
          // isReject ?  this.selectedInvestmentItem.PreConstructionInterestApprovedAmount = 0 : this.alertService.showWarning('Note : PreConstruction Interest Approved Amount should be equal to or less than the invested amount.');
          // isReject ? resolve(true) : resolve(false);
          this.alertService.showWarning('Note : PreConstruction Interest Approved Amount should be equal to or less than the invested amount.');
          resolve(false);
          return;
        }
        else {
          resolve(true);
        }
      }
      else if (this.IsHRAExists) {
        let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.SelectedHRAId);
        if (locallyPreparedItem.DeclarationItem.length > 0) {

          for (let h = 0; h < locallyPreparedItem.DeclarationItem.length; h++) {
            const element = locallyPreparedItem.DeclarationItem[h];
            if (element.ApprovedAmount > element.RentAmount) {
              // element.ApprovedAmount= 0; // if required to validate the approved amount we can make it as 0 otherwise not required keep as it is
              this.alertService.showWarning('Note : Total approved amount should be equal to or less than the rental amount.');
              resolve(false);
              break;

            }

          }
          resolve(true);
          return;
        }
      }
      else if (this.IsExemptionExists) {
        let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);
        if (locallyPreparedItem && (locallyPreparedItem.DocumentRejectedtatus > 0 || locallyPreparedItem.DocumentPendingStatus > 0)) {
          for (let l = 0; l < locallyPreparedItem.DeclarationItem.LstEmployeeExemptionBillDetails.length; l++) {
            const e4 = locallyPreparedItem.DeclarationItem.LstEmployeeExemptionBillDetails[l];
            if (e4.Status == 2) {
              e4.ApprovedAmount = 0;
            }

          }
          resolve(true);
          return;
        }

        if (locallyPreparedItem.DeclarationItem.ApprovedAmount > locallyPreparedItem.DeclarationItem.Amount) {
          this.alertService.showWarning('Note : Total approved amount should be equal to or less than the claimed amount.');
          resolve(false);
          return;
        }
        if (locallyPreparedItem.DeclarationItem.LstEmployeeExemptionBillDetails.length > 0) {
          for (let k = 0; k < locallyPreparedItem.DeclarationItem.LstEmployeeExemptionBillDetails.length; k++) {
            const element = locallyPreparedItem.DeclarationItem.LstEmployeeExemptionBillDetails[k];
            if (element.ApprovedAmount > element.BillAmount) {
              // element.ApprovedAmount= 0; // if required to validate the approved amount we can make it as 0 otherwise not required keep as it is
              this.alertService.showWarning('Note : Bill Approving Amount should be equal to or less than the claimed amount.');
              resolve(false);
              break;
            }
          }
          resolve(true);
          return;
        }
      }
      else if (this.IsMedicalDependentExists) {

        let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);
        console.log('locallyPreparedItem', locallyPreparedItem);

        if (locallyPreparedItem && (locallyPreparedItem.DocumentRejectedtatus > 0 || locallyPreparedItem.DocumentPendingStatus > 0)) {
          this.selectedInvestmentItem.ApprovedAmount = 0
          for (let l = 0; l < locallyPreparedItem.DeclarationItem.LstEmpInvDepDetails.length; l++) {
            const e4 = locallyPreparedItem.DeclarationItem.LstEmpInvDepDetails[l];
            e4.ApprovedAmount = 0;
          }
          resolve(true);
          return;
        }

        if (locallyPreparedItem.DeclarationItem.ApprovedAmount > locallyPreparedItem.DeclarationItem.DeclaredAmount) {
          this.alertService.showWarning('Note : Total approved amount should be equal to or less than the claimed amount.');
          resolve(false);
          return;
        }
        if (locallyPreparedItem.DeclarationItem.LstEmpInvDepDetails.length > 0) {
          for (let k = 0; k < locallyPreparedItem.DeclarationItem.LstEmpInvDepDetails.length; k++) {
            const element = locallyPreparedItem.DeclarationItem.LstEmpInvDepDetails[k];
            if (element.ApprovedAmount > element.Amount) {
              // element.ApprovedAmount= 0; // if required to validate the approved amount we can make it as 0 otherwise not required keep as it is
              this.alertService.showWarning('Note : Bill Approving Amount should be equal to or less than the claimed amount.');
              resolve(false);
              break;
            }
          }
          resolve(true);
          return;
        }
      }
      else if (this.IsInvestmentExists) {
        let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);

        if (locallyPreparedItem && (locallyPreparedItem.DocumentRejectedtatus > 0 || locallyPreparedItem.DocumentPendingStatus > 0)) {
          this.selectedInvestmentItem.ApprovedAmount = 0
          if (this.selectedInvestmentItem.hasOwnProperty("LstEmployeeInvestmentDocuments") && this.selectedInvestmentItem.LstEmployeeInvestmentDocuments != null) {
            for (let l = 0; l < this.selectedInvestmentItem.LstEmployeeInvestmentDocuments.length; l++) {
              const e4 = this.selectedInvestmentItem.LstEmployeeInvestmentDocuments[l];
              e4.ApprovedAmount = 0;
            }
          }
          resolve(true);
          return;
        }
        if (this.selectedInvestmentItem.ApprovedAmount > this.selectedInvestmentItem.Amount) {
          this.alertService.showWarning('Note : Total approving amount should be equal to or less than the invested amount.');
          resolve(false);
          return;
        } else {
          this.selectedInvestmentItem.ApprovedAmount = locallyPreparedItem.ApprovedAmount;// =  this.selectedInvestmentItem.ApprovedAmount;
          this.selectedInvestmentItem.ApproverRemarks = locallyPreparedItem.ApproverRemarks;//=  this.selectedInvestmentItem.ApproverRemarks;
          resolve(true);
          return;
        }
      }
      else if (this.IsOtherIncomeExists) {
        let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);
        console.log('vvv', locallyPreparedItem);
        console.log('sss', this.selectedInvestmentItem);

        if (locallyPreparedItem && (locallyPreparedItem.DocumentRejectedtatus > 0 || locallyPreparedItem.DocumentPendingStatus > 0)) {
          this.selectedInvestmentItem.ApprovedAmount = 0;
          resolve(true);
          return;
        }
        if (this.selectedInvestmentItem.InterestIncomeType != 3 && this.selectedInvestmentItem.TotalApprovedInterestAmount > this.selectedInvestmentItem.TotalInterestAmount) {
          this.alertService.showWarning('Note : Total approving amount should be equal to or less than the total interest amount.');
          resolve(false);
          return;
        }
        else if (this.selectedInvestmentItem.InterestIncomeType == 3 && this.selectedInvestmentItem.ApprovedOtherIncomeAmount > this.selectedInvestmentItem.OtherIncomeAmount) {
          this.alertService.showWarning('Note : Total approving amount should be equal to or less than the total other income.');
          resolve(false);
          return;
        }
        else {
          this.selectedInvestmentItem.InterestIncomeType == 3 ? this.selectedInvestmentItem.ApprovedOtherIncomeAmount = locallyPreparedItem.ApprovedAmount : true;// =  this.selectedInvestmentItem.ApprovedAmount;
          this.selectedInvestmentItem.InterestIncomeType != 3 ? this.selectedInvestmentItem.TotalApprovedInterestAmount = locallyPreparedItem.ApprovedAmount : true;//=  this.selectedInvestmentItem.ApproverRemarks;
          resolve(true);
          return;
        }
      }
      else {
        resolve(true);
        return;
      }
    })
    return promise;
  }

  // tapping the card against each category of investment - OPENING SLIDER 

  doReviewInvestment(item, indx) {

    if (this.selectedInvestmentItem != null) {
      this.validateAmountWhileClosing().then((result) => {
        if (result == true) {
          this.currentMockItem(item, indx);
        } else {
          return;
        }
      });

    }

    else {
      this.currentMockItem(item, indx);
    }

  }
  currentMockItem(item, indx) {

    this.scroll.scrollToPosition([0, 0]); // When the card has been triggered, scroll to the top 
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    this.IsMedicalDependentExists = false;
    this.IsExemptionExists = false;
    this.IsHRAExists = false;
    this.IsHPExists = false;
    this.IsOtherIncomeExists = false;
    this.IsLTAExemption = false;

    this.SelectedHRAId = null; // HRA - SET BY DEFAULT ID WHEN WE OPEN TAP ON THE CARD (DUE TO COMBINED RECORDS)
    this.ExsitingChildProduct = null; // 80EE  | 80EEA
    this.Existing80CChildProduct = null;

    console.log('item', item);

    if (!item.IsMedical && item.IsInvestment) {
      this.IsInvestmentExists = true;
    }

    if (item.IsMedical) {
      this.IsMedicalDependentExists = true;
    }
    if (item.IsHRA) {
      this.IsHRAExists = true;
      this.SelectedHRAId = item.Id;
    }
    if (item.IsExemptions) {
      this.IsExemptionExists = true;
      this.IsLTAExemption = item.IsLTA ? true : false;
    }
    if (item.IsHP) {
      this.IsHPExists = true;
      this.ExsitingChildProduct = item.ExsitingChildProduct;
      this.Existing80CChildProduct = item.Existing80CChildProduct;
    }
    if (item.IsOtherIncome) {
      this.IsOtherIncomeExists = true;
    }

    this.currentIndex = indx;
    this.isReviewing = true;
    this.selectedInvestmentItem = item.DeclarationItem;

    this.IsEditable = item.DocumentPendingStatus > 0 ? true : false;
    this.IsDisablePrevIndexBasedBtn = 0 == this.currentIndex ? true : false;
    this.IsDisableNextIndexBasedBtn = this.currentIndex == this.DeclarationRecords.length;
    if (this.currentIndex == this.DeclarationRecords.length - 1) {
      this.IsDisableNextIndexBasedBtn = true;
      this.IsDisablePrevIndexBasedBtn = false;
    }
    if (this.currentIndex == 0) {
      this.IsDisableNextIndexBasedBtn = false;
      this.IsDisablePrevIndexBasedBtn = true;
    }

    this.documentURL = null;
    this.documentURLId = null;
    console.log('IsOtherIncomeExists', this.IsOtherIncomeExists);
    console.log('item', item);

    console.log(this.selectedInvestmentItem);

  }

  // NEXT BUTTON ACTION
  nextInvestmentItem() { // MOVE TO NEXT CARD
    if (this.selectedInvestmentItem != null) {
      this.validateAmountWhileClosing().then((result) => {
        if (result == true) {
          this.nextMockItem();
        } else {
          return;
        }
      });
    }

    else {
      this.nextMockItem();
    }

  }
  nextMockItem() {
    this.scroll.scrollToPosition([0, 0]); // When the card has been triggered, scroll to the top 
  window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    this.SelectedHRAId = null;
    this.currentIndex = this.currentIndex + 1;

    let item = this.DeclarationRecords[this.currentIndex];
    this.selectedInvestmentItem = item.DeclarationItem;

    this.IsMedicalDependentExists = false;
    this.IsExemptionExists = false;
    this.IsHRAExists = false;
    this.IsHPExists = false;
    this.IsOtherIncomeExists = false;
    this.IsLTAExemption = false;

    this.ExsitingChildProduct = null;
    this.Existing80CChildProduct = null;

    if (!item.IsMedical && item.IsInvestment) {
      this.IsInvestmentExists = true;
    }
    if (item.IsMedical) {
      this.IsMedicalDependentExists = true;
    }
    if (item.IsHRA) {
      this.IsHRAExists = true;
      this.SelectedHRAId = item.Id;
    }
    if (item.IsExemptions) {
      this.IsExemptionExists = true;
      this.IsLTAExemption = item.IsLTA ? true : false;
    }
    if (item.IsHP) {
      this.IsHPExists = true;
      this.ExsitingChildProduct = item.ExsitingChildProduct;
      this.Existing80CChildProduct = item.Existing80CChildProduct;
    }

    if (item.IsOtherIncome) {
      this.IsOtherIncomeExists = true;
    }
    this.IsEditable = item.DocumentPendingStatus > 0 ? true : false;

    if (this.currentIndex == (this.DeclarationRecords.length - 1)) {
      this.IsDisableNextIndexBasedBtn = true;
      this.IsDisablePrevIndexBasedBtn = false;
    } else {
      this.IsDisableNextIndexBasedBtn = false
      this.IsDisablePrevIndexBasedBtn = false;
    }

    this.documentURL = null;
    this.documentURLId = null;

    console.log('see;eccted 2', this.IsOtherIncomeExists);
  }

  //  PREVIOUSE BUTTON ACTION   - GO TO PREVIOUS CARD 
  previousInvestmentItem() {

    if (this.selectedInvestmentItem != null) {
      this.validateAmountWhileClosing().then((result) => {
        if (result == true) {
          this.previousmockItem();
        } else {
          return;
        }
      });
    }
    else {
      this.previousmockItem();
    }
  }
  previousmockItem() {
    this.scroll.scrollToPosition([0, 0]); // When the card has been triggered, scroll to the top 
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    this.currentIndex = this.currentIndex - 1;
    let item = this.DeclarationRecords[this.currentIndex];
    this.selectedInvestmentItem = item.DeclarationItem;

    this.SelectedHRAId = null;
    this.IsMedicalDependentExists = false;
    this.IsExemptionExists = false;
    this.IsHRAExists = false;
    this.IsHPExists = false;
    this.ExsitingChildProduct = null;
    this.Existing80CChildProduct = null;
    this.IsOtherIncomeExists = false;
    this.IsLTAExemption = false;

    if (!item.IsMedical && item.IsInvestment) {
      this.IsInvestmentExists = true;
    }
    if (item.IsMedical) {
      this.IsMedicalDependentExists = true;
    }
    if (item.IsHRA) {
      this.IsHRAExists = true;
      this.SelectedHRAId = item.Id;
    }
    if (item.IsExemptions) {
      this.IsExemptionExists = true;
      this.IsLTAExemption = item.IsLTA;
    }
    if (item.IsHP) {
      this.IsHPExists = true;
      this.ExsitingChildProduct = item.ExsitingChildProduct;
      this.Existing80CChildProduct = item.Existing80CChildProduct;
    }
    if (item.IsOtherIncome) {
      this.IsOtherIncomeExists = true;
    }

    this.IsEditable = item.DocumentPendingStatus > 0 ? true : false;

    if (this.currentIndex == 0) {
      this.IsDisablePrevIndexBasedBtn = true;
      this.IsDisableNextIndexBasedBtn = false

    } else {
      this.IsDisablePrevIndexBasedBtn = false
      this.IsDisableNextIndexBasedBtn = false
    }
    this.documentURL = null;
    this.documentURLId = null;

    console.log('see;eccted', this.IsOtherIncomeExists);

  }

  // SHOWING IMAGE/PDF/WORD FILE - TAP ON THE IMAGE CARD (INSIDE SLIDER)

  showImage(item, layout) {
    try {


      this.isCallingS3Bucket = true;

      this.documentURL = null;
      this.documentURLId = null;
      this.documentURLId = layout == 'NonExemptions' ? item.DocumentId : item.BillId;
      var contentType = this.fileuploadService.getContentType(item.FileName)
      if (contentType === 'application/pdf' || contentType.includes('image')) {
        this.fileuploadService.getObjectById(layout == 'NonExemptions' ? item.DocumentId : item.BillId)
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
            this.isCallingS3Bucket = false;
          },
            ((err: Error) => {
              if (err instanceof NotFoundError) {
                alert(err)
              }
            }));

      } else if (contentType === 'application/msword' ||
        contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        var appUrl = this.fileuploadService.getUrlToGetObject(layout == 'NonExemptions' ? item.DocumentId : item.BillId);
        var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
        this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
        this.isCallingS3Bucket = false;
      }
    } catch (error) {
      this.isCallingS3Bucket = false;
    }
  }

  downloadImage(item, layout) {
    layout == 'NonExemptions' ? item.DocumentId : item.BillId;
    try {
      this.loadingScreenService.startLoading();
      this.fileuploadService.downloadObjectAsBlob(layout == 'NonExemptions' ? item.DocumentId : item.BillId)
        .subscribe(res => {
          if (res == null || res == undefined) {
            this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
            return;
          }
          saveAs(res, item.FileName);
          this.loadingScreenService.stopLoading();
        });
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
      return;
    }
  }

  // SLIDER'S APPROVE OR REJECT BUTTON (TOP CORNER) TO EDIT 

  edit_Verification() {
    this.IsEditable = true;
  }
  // SLIDER'S APPROVE OR REJECT BUTTON TO EDIT (POPUP) : PREVIOUS EMPLOYMENT ONLY
  edit_Verification_prev() {
    this.IsEditable = true;
  }

  // SHOW THE REJECTION SWAL ALERT FOR ENTERING MESSAGE - GENERIC
  getRejectionRemarksSwal(rejectionremarks) {
    const promise = new Promise((res, rej) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Rejection Remarks',
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputValue: rejectionremarks,
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
          res(jsonStr);
        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
          res(null);
        }
      });
    })

    return promise;
  }

  // BILL SWAL ALERT - HRA 
  approverejectHRABills(hraItem, indx, approvalAction) {
    if (!approvalAction) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Rejection Remarks',
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputValue: hraItem.ApproverRemarks,
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
          hraItem.ApproverRemarks = jsonStr;
          hraItem.Modetype = UIMode.Edit;
          hraItem.ApprovedAmount = 0;
          hraItem.Status = 1;
          this.updateHRAListingTable(hraItem, approvalAction);

        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
        }
      });
    } else {
      if (hraItem.ApprovedAmount > hraItem.RentAmount) {
        hraItem.ApprovedAmount = 0;
        this.alertService.showWarning('Note : Total approved amount should be equal to or less than the invested amount.');
        return;
      }
      hraItem.ApproverRemarks = "";
      hraItem.Modetype = UIMode.Edit;
      hraItem.ApprovedAmount = hraItem.ApprovedAmount == 0 ? hraItem.RentAmount : hraItem.ApprovedAmount;
      hraItem.Status = 1;
      this.updateHRAListingTable(hraItem, approvalAction);

    }

    // hraItem
    // let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.SelectedHRAId.Id);

    // locallyPreparedItem.ApprovedAmount = item.ApprovedAmount;
    // locallyPreparedItem.ApproverRemarks = item.ApproverRemarks;
    // locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 0) : null,
    //   locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 1) : null,
    //   locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 2) : null,
    //   locallyPreparedItem.DocumentList = item.LstEmployeeInvestmentDocuments;
  }

  updateHRAListingTable(hraItem, approvalAction) {
    hraItem.LstEmployeeInvestmentDocuments.forEach(e2 => {
      e2.Status = approvalAction ? 1 : 2;
      e2.ApprovedAmount = approvalAction ? hraItem.ApprovedAmount : 0;
    });

    let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.SelectedHRAId);
    console.log('locallyPreparedItem', locallyPreparedItem);

    let DeclarationData_HRAObject: any;
    let DeclarationData_HRA = [];
    let RentAmount = 0;
    let TotalApprovedAmount = 0;
    let Pending = 0;
    let Approved = 0;
    let Rejected = 0;
    this.employeedetails.LstemployeeHouseRentDetails != null &&
      this.employeedetails.LstemployeeHouseRentDetails.length > 0
    this.employeedetails.LstemployeeHouseRentDetails.forEach(element => {

      if (!element.IsProposed && element.FinancialYearId == this.selectedFinYear)
        RentAmount = RentAmount + element.RentAmount;
      TotalApprovedAmount = TotalApprovedAmount + element.ApprovedAmount;
      Pending = Pending + (element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 0) : 0)
      Approved = Approved + (element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 1) : 0)
      Rejected = Rejected + (element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 2) : 0)


    });

    locallyPreparedItem.ApprovedAmount = TotalApprovedAmount;
    locallyPreparedItem.DocumentPendingStatus = Pending;
    locallyPreparedItem.DocumentApprovedStatus = Approved;
    locallyPreparedItem.DocumentRejectedtatus = Rejected;
    locallyPreparedItem.DocumentList = this.employeedetails.LstemployeeHouseRentDetails;
    locallyPreparedItem.DeclarationItem = this.employeedetails.LstemployeeHouseRentDetails;

  }

  // Medical BILLS SWAL ALERT - EXEMPTIONS
  approverejectMedicalBills(medicalItem, indx, approvalAction) {

    if (!approvalAction) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Rejection Remarks',
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputValue: medicalItem.ApproverRemarks,
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
          medicalItem.ApproverRemarks = jsonStr;
          medicalItem.Modetype = UIMode.Edit;
          medicalItem.ApprovedAmount = 0;
          medicalItem.Status = 2;

          this.selectedInvestmentItem.Modetype = UIMode.Edit;
          this.selectedInvestmentItem.ApprovedAmount = 0;

          if (this.selectedInvestmentItem.LstEmpInvDepDetails.length > 0) {
            this.selectedInvestmentItem.LstEmpInvDepDetails.forEach(e6 => {
              if (e6.Status == 1) {
                this.selectedInvestmentItem.ApprovedAmount += parseInt(e6.ApprovedAmount)
              }
            });
          }

          let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);

          locallyPreparedItem.ApprovedAmount = this.selectedInvestmentItem.ApprovedAmount;
          locallyPreparedItem.ApproverRemarks = this.selectedInvestmentItem.ApproverRemarks;


        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
        }
      });
    } else {

      if (medicalItem.ApprovedAmount > medicalItem.Amount) {
        this.alertService.showWarning(`Approving Medical Amount must be less than or equal to ${medicalItem.BillAmount}`);
        return;
      }

      medicalItem.Modetype = UIMode.Edit;
      medicalItem.ApprovedAmount = medicalItem.ApprovedAmount < 0 ? 0 : medicalItem.ApprovedAmount;
      medicalItem.Status = 1;

      this.selectedInvestmentItem.Modetype = UIMode.Edit;
      this.selectedInvestmentItem.ApprovedAmount = 0;

      if (this.selectedInvestmentItem.LstEmpInvDepDetails.length > 0) {
        this.selectedInvestmentItem.LstEmpInvDepDetails.forEach(e6 => {
          if (e6.Status == 1) {
            this.selectedInvestmentItem.ApprovedAmount += parseInt(e6.ApprovedAmount)
          }
        });
      }
      let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);

      // locallyPreparedItem.ApprovedAmount = this.selectedInvestmentItem.ApprovedAmount;
      // locallyPreparedItem.ApproverRemarks = this.selectedInvestmentItem.ApproverRemarks;

      // locallyPreparedItem.DocumentPendingStatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 0) : null,
      //   locallyPreparedItem.DocumentApprovedStatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 1) : null,
      //   locallyPreparedItem.DocumentRejectedtatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 2) : null,
      //   locallyPreparedItem.DocumentList = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails;



    }

  }

  // EXEMPTION BILLS SWAL ALERT - EXEMPTIONS
  approverejectExemptionBills(exemptionItem, indx, approvalAction) {

    if (!approvalAction) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Rejection Remarks',
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputValue: exemptionItem.RejectedRemarks,
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
          exemptionItem.RejectedOn = moment().format('YYYY-MM-DD');
          exemptionItem.RejectedBy = this.UserId;
          exemptionItem.RejectedRemarks = jsonStr;
          exemptionItem.Modetype = UIMode.Edit;
          exemptionItem.ApprovedAmount = 0;
          exemptionItem.Status = 2;
          exemptionItem.ApprovalStatus = 1;
          this.selectedInvestmentItem.Modetype = UIMode.Edit;
          this.selectedInvestmentItem.ApprovedAmount = 0;
          if (this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0) {
            this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.forEach(e6 => {
              if (e6.ApprovalStatus == 1) {
                this.selectedInvestmentItem.ApprovedAmount += parseInt(e6.ApprovedAmount)
              }
            });
          }

          let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);

          locallyPreparedItem.ApprovedAmount = this.selectedInvestmentItem.ApprovedAmount;
          locallyPreparedItem.ApproverRemarks = this.selectedInvestmentItem.ApproverRemarks;

          locallyPreparedItem.DocumentPendingStatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 0) : null,
            locallyPreparedItem.DocumentApprovedStatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 1) : null,
            locallyPreparedItem.DocumentRejectedtatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 2) : null,
            locallyPreparedItem.DocumentList = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails;

        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
        }
      });
    } else {

      if (exemptionItem.ApprovedAmount > exemptionItem.BillAmount) {
        this.alertService.showWarning(`Approving Bill Amount must be less than or equal to ${exemptionItem.BillAmount}`);
        return;
      }
      exemptionItem.ApprovedOn = moment().format('YYYY-MM-DD');
      exemptionItem.ApprovedBy = this.UserId;
      // exemptionItem.RejectedRemarks = '';
      exemptionItem.Modetype = UIMode.Edit;
      exemptionItem.ApprovedAmount = exemptionItem.ApprovedAmount == 0 ? exemptionItem.BillAmount : exemptionItem.ApprovedAmount;
      exemptionItem.Status = 1;
      exemptionItem.ApprovalStatus = 1;
      this.selectedInvestmentItem.Modetype = UIMode.Edit;
      this.selectedInvestmentItem.ApprovedAmount = 0;
      if (this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0) {
        this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.forEach(e6 => {
          if (e6.ApprovalStatus == 1) {
            this.selectedInvestmentItem.ApprovedAmount += parseInt(e6.ApprovedAmount)
          }
        });
      }
      let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.selectedInvestmentItem.Id);

      locallyPreparedItem.ApprovedAmount = this.selectedInvestmentItem.ApprovedAmount;
      locallyPreparedItem.ApproverRemarks = this.selectedInvestmentItem.ApproverRemarks;

      locallyPreparedItem.DocumentPendingStatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 0) : null,
        locallyPreparedItem.DocumentApprovedStatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 1) : null,
        locallyPreparedItem.DocumentRejectedtatus = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(this.selectedInvestmentItem.LstEmployeeExemptionBillDetails, 2) : null,
        locallyPreparedItem.DocumentList = this.selectedInvestmentItem.LstEmployeeExemptionBillDetails;



    }
  }

  doViewFile(item, indx) {
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
  }

  doViewLandlordDetails(hra, indx, longContent) {
    console.log('hrm', hra);
    this.HRALandlordDetails = null;
    this.HRALandlordDetails = hra;

    this.modalService.open(longContent, this.modalOption);
  }

  doReviewPreviousEmployment(prevEmpItem, indx, previousEmploymentContent) {
    this.selectedInvestmentItem = null;
    this.documentURL = null;
    if (this.selectedInvestmentItem != null) {
      this.validateAmountWhileClosing().then((result) => {
        if (result == true) {
          this.preEmploymentMockItem(prevEmpItem, indx, previousEmploymentContent);
        } else {
          return;
        }
      });
    }

    else {
      this.preEmploymentMockItem(prevEmpItem, indx, previousEmploymentContent);
    }
  }

  doReviewPerquisites(preqEmpItem, indx, PerquisitesContent) {
    this.selectedInvestmentItem = null;
    if (this.selectedInvestmentItem != null) {
      this.validateAmountWhileClosing().then((result) => {
        if (result == true) {
          this.perquisitesMockItem(preqEmpItem, indx, PerquisitesContent);
        } else {
          return;
        }
      });
    }

    else {
      this.perquisitesMockItem(preqEmpItem, indx, PerquisitesContent);
    }
  }

  preEmploymentMockItem(prevEmpItem, indx, previousEmploymentContent) {
    this.isReviewing = false;

    this.previousEmploymentDetails = prevEmpItem;
    this.IsEditable = false;
    this.modalService.open(previousEmploymentContent, this.modalOption);
    let photo = {
      "DocumentId": prevEmpItem.DocumentId,
      "FileName": prevEmpItem.FileName
    }
    prevEmpItem.DocumentId > 0 ? this.showImage(photo, 'NonExemptions') : true;
  }

  perquisitesMockItem(prevEmpItem, indx, PerquisitesContent) {
    this.isReviewing = false;

    this.perquisitesDetail = prevEmpItem;
    this.IsEditable = false;
    this.modalService.open(PerquisitesContent, this.modalOption);
    let photo = {
      "DocumentId": prevEmpItem.DocumentId,
      "FileName": prevEmpItem.FileName
    }
    prevEmpItem.DocumentId > 0 ? this.showImage(photo, 'NonExemptions') : true;
  }

  updatePreviousEmploymentAmount(approvalAction, item, layer) {

    item.Modetype = UIMode.Edit;

    if (!approvalAction && (item.ApproverRemarks == null || item.ApproverRemarks == '' || item.ApproverRemarks == undefined)) {
      this.alertService.showWarning('Please enter the rejection remarks.');
      return;
    }
    if (!approvalAction) {

      item.ApprovedGrossSalary = 0;
      item.ApprovedPreviousPT = 0;
      item.ApprovedPreviousPF = 0;
      item.ApprovedTaxDeducted = 0;
      item.ApprovedStandardDeduction = 0;
      item.ApprovalStatus = 2;

    }

    if (item.ApprovedGrossSalary > item.GrossSalary) {
      item.ApprovedGrossSalary = 0;
      this.alertService.showWarning(`Approved Gross Salary must be less than or equal to ${item.GrossSalary}`);
      return;
    }
    else if (item.ApprovedPreviousPT > item.PreviousPT) {
      item.ApprovedPreviousPT = 0;
      this.alertService.showWarning(`Approved Previous PT must be less than or equal to ${item.PreviousPT}`);
      return;
    }
    else if (item.ApprovedPreviousPF > item.PreviousPF) {
      item.ApprovedPreviousPF = 0;
      this.alertService.showWarning(`Approved Previous PF must be less than or equal to ${item.PreviousPF}`);
      return;
    }
    else if (item.ApprovedTaxDeducted > item.TaxDeducted) {
      item.ApprovedTaxDeducted = 0;
      this.alertService.showWarning(`Approved Tax Deducted must be less than or equal to ${item.TaxDeducted}`);
      return;
    }
    else if (item.ApprovedStandardDeduction > item.StandardDeduction) {
      item.ApprovedStandardDeduction = 0;
      this.alertService.showWarning(`Approved Standard Deduction must be less than or equal to ${item.StandardDeduction}`);
      return;
    } else {

      if (approvalAction) {

        item.ApprovedGrossSalary = (item.ApprovedGrossSalary == null || item.ApprovedGrossSalary == undefined) ? item.GrossSalary : item.ApprovedGrossSalary;
        item.ApprovedPreviousPT = (item.ApprovedPreviousPT == null || item.ApprovedPreviousPT == undefined) ? item.PreviousPT : item.ApprovedPreviousPT;;
        item.ApprovedPreviousPF = (item.ApprovedPreviousPF == null || item.ApprovedPreviousPF == undefined) ? item.PreviousPF : item.ApprovedPreviousPF;;
        item.ApprovedTaxDeducted = (item.ApprovedTaxDeducted == null || item.ApprovedTaxDeducted == undefined) ? item.TaxDeducted : item.ApprovedTaxDeducted;;
        item.ApprovedStandardDeduction = (item.ApprovedStandardDeduction == null || item.ApprovedStandardDeduction == undefined) ? item.StandardDeduction : item.ApprovedStandardDeduction;;
        item.ApproverRemarks = "";
        item.ApprovalStatus = 1;
      }
    }
    layer == 'Popup' ? this.modalService.dismissAll('Close click') : true;
  }

  updatePerquisitesAmount(approvalAction, item, layer) {

    item.Modetype = UIMode.Edit;

    if (!approvalAction && (item.ApproverRemarks == null || item.ApproverRemarks == '' || item.ApproverRemarks == undefined)) {
      this.alertService.showWarning('Please enter the rejection remarks.');
      return;
    }
    if (!approvalAction) {

      item.ApprovedAmount = 0;
      item.Status = 2;

    }
    if (approvalAction) {

      item.ApproverRemarks = "";
      item.Status = 1;
    }

    layer == 'Popup' ? this.modalService.dismissAll('Close click') : true;
  }



  approvereject_employment(item, approvalAction, layer) {

    console.log('approvalAction', approvalAction);

    !approvalAction && layer != 'Popup' ? this.getRejectionRemarksSwal('').then((result) => {
      if (result != null) {
        item.ApproverRemarks = result;
        this.updatePreviousEmploymentAmount(approvalAction, item, layer);
        return;
      } else {
        return;
      }
    }) : this.updatePreviousEmploymentAmount(approvalAction, item, layer);;

  }
  approvereject_perquisites(item, approvalAction, layer) {

    console.log('approvalAction', approvalAction);

    !approvalAction && layer != 'Popup' ? this.getRejectionRemarksSwal('').then((result) => {
      if (result != null) {
        item.ApproverRemarks = result;
        this.updatePerquisitesAmount(approvalAction, item, layer);
        return;
      } else {
        return;
      }
    }) : this.updatePerquisitesAmount(approvalAction, item, layer);;

  }

  close_prev_verification(item) {
    item.Modetype = UIMode.None;
    console.log('ite', item);
    console.log('em', this.employeedetails);

    if (item.Status == 2) {
      item.ApprovedGrossSalary = 0;
      item.ApprovedPreviousPT = 0;
      item.ApprovedPreviousPF = 0;
      item.ApprovedTaxDeducted = 0;
      item.ApprovedStandardDeduction = 0;
    }

    if (item.ApprovedGrossSalary > item.GrossSalary) {
      item.ApprovedGrossSalary = 0;
      this.alertService.showWarning(`Approved Gross Salary must be less than or equal to ${item.GrossSalary}`);
      return;
    }
    else if (item.ApprovedPreviousPT > item.PreviousPT) {
      item.ApprovedPreviousPT = 0;
      this.alertService.showWarning(`Approved Previous PT must be less than or equal to ${item.PreviousPT}`);
      return;
    }
    else if (item.ApprovedPreviousPF > item.PreviousPF) {
      item.ApprovedPreviousPF = 0;
      this.alertService.showWarning(`Approved Previous PF must be less than or equal to ${item.PreviousPF}`);
      return;
    }
    else if (item.ApprovedTaxDeducted > item.TaxDeducted) {
      item.ApprovedTaxDeducted = 0;
      this.alertService.showWarning(`Approved Tax Deducted must be less than or equal to ${item.TaxDeducted}`);
      return;
    }
    else if (item.ApprovedStandardDeduction > item.StandardDeduction) {
      item.ApprovedStandardDeduction = 0;
      this.alertService.showWarning(`Approved Standard Deduction must be less than or equal to ${item.StandardDeduction}`);
      return;
    }

    // if(item.ApprovalStatus == 1){
    //   item.ApprovedGrossSalary > item.GrossSalary  ?  item.ApprovedGrossSalary = item.GrossSalary : true;
    //   item.ApprovedPreviousPT > item.GrossSalary  ? item.ApprovedPreviousPT = item.PreviousPT : true;
    //   item.ApprovedPreviousPF > item.GrossSalary ?  item.ApprovedPreviousPF =item.PreviousPF : true;
    //   item.ApprovedTaxDeducted > item.GrossSalary  ? item.ApprovedTaxDeducted = item.TaxDeducted : true;
    //   item.ApprovedStandardDeduction > item.GrossSalary  ? item.ApprovedStandardDeduction =item.StandardDeduction : true;

    // }

    this.modalService.dismissAll();



  }

  close_perquisites_verification(item) {

    console.log('ite', item);
    console.log('em', this.employeedetails);

    if (item.Status == 2) {
      item.ApprovedAmount = 0;
    }
    this.modalService.dismissAll();

  }

  approvereject_employment_b() {

  }
  // ---- functinality operations ------ 



  updateHRAApprovedAmount(approvalAction, remarks) {

    this.employeedetails.LstemployeeHouseRentDetails.forEach(e3 => {
      if (e3.FinancialYearId == this.selectedFinYear) {
        e3.ApproverRemarks = approvalAction ? "" : remarks;
        e3.Modetype = UIMode.Edit;
        e3.ApprovedAmount = approvalAction ? e3.ApprovedAmount == 0 ? e3.RentAmount : e3.ApprovedAmount : 0;
        e3.LstEmployeeInvestmentDocuments.forEach(e2 => {
          e2.Status = approvalAction ? 1 : 2;
          e2.ApprovedAmount = approvalAction ? e3.ApprovedAmount : 0;
        });

      }

    });
    let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.SelectedHRAId);
    console.log('locallyPreparedItem', locallyPreparedItem);

    let DeclarationData_HRAObject: any;
    let DeclarationData_HRA = [];
    let RentAmount = 0;
    let TotalApprovedAmount = 0;
    let Pending = 0;
    let Approved = 0;
    let Rejected = 0;
    this.employeedetails.LstemployeeHouseRentDetails != null &&
      this.employeedetails.LstemployeeHouseRentDetails.length > 0
    this.employeedetails.LstemployeeHouseRentDetails.forEach(element => {

      if (!element.IsProposed && element.FinancialYearId == this.selectedFinYear)
        RentAmount = RentAmount + element.RentAmount;
      TotalApprovedAmount = TotalApprovedAmount + element.ApprovedAmount;
      Pending = Pending + (element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 0) : 0)
      Approved = Approved + (element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 1) : 0)
      Rejected = Rejected + (element.LstEmployeeInvestmentDocuments != null && element.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(element.LstEmployeeInvestmentDocuments, 2) : 0)


    });

    locallyPreparedItem.ApprovedAmount = TotalApprovedAmount;
    locallyPreparedItem.DocumentPendingStatus = Pending;
    locallyPreparedItem.DocumentApprovedStatus = Approved;
    locallyPreparedItem.DocumentRejectedtatus = Rejected;
    locallyPreparedItem.DocumentList = this.employeedetails.LstemployeeHouseRentDetails;
    locallyPreparedItem.DeclarationItem = this.employeedetails.LstemployeeHouseRentDetails;



  }

  approve_Verification(item, approvalAction) {

    try {

      if (this.IsOtherIncomeExists) {
        try {


          let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == item.Id);
          console.log('local items ', locallyPreparedItem);
          item.Modetype = UIMode.Edit;

          if (!approvalAction && (item.ApproverRemarks == null || item.ApproverRemarks == '' || item.ApproverRemarks == undefined)) {
            this.alertService.showWarning('Please enter the rejection remarks.');
            return;
          }
          if (!approvalAction) {
            item.TotalApprovedInterestAmount = 0;
            item.ApprovedOtherIncomeAmount = 0;
            item.Status = 2;
          }
          if (approvalAction && locallyPreparedItem.IsOtherIncome && item.InterestIncomeType == 3 && item.ApprovedOtherIncomeAmount > item.OtherIncomeAmount) {
            item.ApprovedOtherIncomeAmount = 0;
            this.alertService.showWarning('Note : Approved Other Income Amount should be equal to or less than the Other Income Amount.');
            return;
          }
          if (approvalAction && locallyPreparedItem.IsOtherIncome && item.InterestIncomeType != 3 && item.TotalApprovedInterestAmount > item.TotalInterestAmount) {
            item.TotalApprovedInterestAmount = 0;
            this.alertService.showWarning('Note : Total Approved Interest Amount should be equal to or less than the Interest Amount.');
            return;
          }


          if (approvalAction) {
            item.InterestIncomeType != 3 && (item.TotalApprovedInterestAmount == null || item.TotalApprovedInterestAmount == 0) ? item.TotalApprovedInterestAmount = item.TotalInterestAmount :
              item.InterestIncomeType == 3 && (item.ApprovedOtherIncomeAmount == null || item.ApprovedOtherIncomeAmount == 0) ? item.ApprovedOtherIncomeAmount = item.OtherIncomeAmount : true;
            item.Status = 1;

          }
          // this.selectedInvestmentItem  = item;
          // locallyPreparedItem.DeclarationItem = item;

          locallyPreparedItem.ApprovedAmount = item.InterestIncomeType != 3 ? item.TotalApprovedInterestAmount : item.ApprovedOtherIncomeAmount;
          locallyPreparedItem.ApproverRemarks = item.ApproverRemarks;
          locallyPreparedItem.DocumentPendingStatus = item.Status == 0 ? 1 : 0;
          locallyPreparedItem.DocumentApprovedStatus = item.Status == 1 ? 1 : 0;
          locallyPreparedItem.DocumentRejectedtatus = item.Status == 2 ? 1 : 0;




          this.IsEditable = false;
          return;
        } catch (error) {
          console.log('error income ::', error);

        }

      }

      if (this.IsHRAExists) {
        let isValidHRA: boolean = true;
        let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == this.SelectedHRAId);
        console.log('locallyPreparedItem', locallyPreparedItem);
        if (locallyPreparedItem.DeclarationItem.length > 0) {

          for (let h = 0; h < locallyPreparedItem.DeclarationItem.length; h++) {
            const element = locallyPreparedItem.DeclarationItem[h];
            if (element.ApprovedAmount > element.RentAmount) {
              element.ApprovedAmount = 0;
              this.alertService.showWarning('Note : Total approved amount should be equal to or less than the rental amount.');
              isValidHRA = false
              break;
            }

          }
        }
        if (!isValidHRA) {
          return;
        }

        if (isValidHRA) {
          !approvalAction ? this.getRejectionRemarksSwal('').then((result) => {
            if (result != null) {
              this.updateHRAApprovedAmount(approvalAction, result);
              return;
            } else {
              return;
            }
          }) : this.updateHRAApprovedAmount(approvalAction, '');
          this.IsEditable = false;
          return;
        }


      }

      let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == item.Id);
      item.Modetype = UIMode.Edit;

      console.log(item);

      // --- reject --- 
      if (!approvalAction && (item.ApproverRemarks == null || item.ApproverRemarks == '' || item.ApproverRemarks == undefined)) {
        this.alertService.showWarning('Please enter the rejection remarks.');
        return;
      }
      if (!approvalAction) {
        item.ApprovedAmount = 0;

        if (locallyPreparedItem.IsHP) {
          item.PreConstructionInterestApprovedAmount = 0;
          item.MunicipalTaxApprovedAmount = 0;
          item.InterestAmountApprovedAmount = 0;
          item.GrossAnnualValueApprovedAmount = 0;
          item.ApprovedAmount = 0;


          if (locallyPreparedItem.ExsitingChildProduct != null) {
            let exitSecEE = locallyPreparedItem.ExsitingChildProduct;
            exitSecEE.ApprovedAmount = exitSecEE.Amount;
            exitSecEE.ApproverRemarks = '';
          }
        }
      }
      // -- approve  ---
      if (approvalAction && (item.ApprovedAmount == 0 || item.ApprovedAmount == null || item.ApprovedAmount == '')) {

        if (!this.IsMedicalDependentExists && this.IsHPExists) {
          item.ApprovedAmount = item.Amount;
        }

      }
      console.log('INV ITEM ::', item);



      if (approvalAction && !locallyPreparedItem.IsHP && (locallyPreparedItem.IsInvestment ? item.ApprovedAmount > item.Amount : item.ApprovedAmount > item.RentAmount)) {
        item.ApprovedAmount = 0;
        this.alertService.showWarning('Note : Total approved amount should be equal to or less than the invested amount.');
        return;
      }
      if (approvalAction && locallyPreparedItem.IsHP && item.LetOut && item.GrossAnnualValueApprovedAmount > item.GrossAnnualValue) {
        item.ApprovedAmount = 0;
        this.alertService.showWarning('Note : Gross Annual Approved Amount should be equal to or less than the invested amount.');
        return;
      }
      if (approvalAction && locallyPreparedItem.IsHP && item.MunicipalTaxApprovedAmount > item.MunicipalTax) {
        item.ApprovedAmount = 0;
        this.alertService.showWarning('Note : Municipal Tax Approved Amount should be equal to or less than the invested amount.');
        return;
      }

      if (approvalAction && locallyPreparedItem.IsHP && item.InterestAmountApprovedAmount > item.InterestAmount) {
        item.ApprovedAmount = 0;
        this.alertService.showWarning('Note : Interest Approved Amount should be equal to or less than the invested amount.');
        return;
      }
      if (approvalAction && locallyPreparedItem.IsHP && item.PreConstructionInterestApprovedAmount > item.PreConstructionInterestAmount) {
        item.ApprovedAmount = 0;
        this.alertService.showWarning('Note : PreConstruction Interest Approved Amount should be equal to or less than the invested amount.');
        return;
      }

      if (locallyPreparedItem.IsMedical && item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 && item.LstEmpInvDepDetails != null && item.LstEmpInvDepDetails.length > 0) {
        console.log('medi', item);

        let isErrorOccurred: boolean = false;
        locallyPreparedItem.DeclarationItem.LstEmployeeInvestmentDocuments != null && locallyPreparedItem.DeclarationItem.LstEmployeeInvestmentDocuments.length > 0 && locallyPreparedItem.DeclarationItem.LstEmployeeInvestmentDocuments.forEach(e1 => {
          e1.ApprovedAmount = !approvalAction ? 0 : (item.ApprovedAmount > 0 ? item.ApprovedAmount : 0);
          e1.Remarks = item.ApproverRemarks != null && item.ApproverRemarks != '' ? item.ApproverRemarks : '';
          e1.Status = !approvalAction ? 2 : 1;
        });

        for (let h = 0; h < locallyPreparedItem.DeclarationItem.LstEmpInvDepDetails.length; h++) {
          const element = locallyPreparedItem.DeclarationItem.LstEmpInvDepDetails[h];
          element.Modetype = UIMode.Edit;
          if (approvalAction && element.ApprovedAmount > element.Amount) {
            isErrorOccurred = true;
            this.alertService.showWarning('Note : Total approving amount should be equal to or less than the claimed amount.');
            break;
          }

          else if (approvalAction && (element.ApprovedAmount <= element.Amount || element.ApprovedAmount == 0 || element.ApprovedAmount == null)) {
            element.ApprovedAmount = (element.ApprovedAmount == null || element.ApprovedAmount == 0) ? 0 : element.ApprovedAmount;
            element.ApproverRemarks = item.ApproverRemarks;
            element.Status = 1;

          }
          if (!approvalAction) {
            element.ApprovedAmount = 0;
            // element.Status = 2;
            element.ApproverRemarks = item.ApproverRemarks;
            console.log('eelmen element', locallyPreparedItem);

          }
        }

        console.log('sss', locallyPreparedItem);
        item.ApprovedAmount = 0;
        locallyPreparedItem.ApprovedAmount = 0;

        item.LstEmpInvDepDetails.forEach(e => { if (e.Status == 1) { item.ApprovedAmount += parseInt(e.ApprovedAmount.toString()) } });
        item.LstEmpInvDepDetails.forEach(e => { if (e.Status == 1) { locallyPreparedItem.ApprovedAmount += parseInt(e.ApprovedAmount.toString()) } });

        if (isErrorOccurred) {
          return;
        }

        locallyPreparedItem.ApproverRemarks = item.ApproverRemarks;
        locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 0) : null,
          locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 1) : null,
          locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 2) : null,
          locallyPreparedItem.DocumentList = item.LstEmployeeInvestmentDocuments;


      }


      if (!locallyPreparedItem.IsMedical && !locallyPreparedItem.IsExemptions && item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0) {
        console.log('ssssss', item);

        item.ApprovedAmount = approvalAction ? ((item.ApprovedAmount == 0 || item.ApprovedAmount == null) ? item.Amount : item.ApprovedAmount) : 0;
        item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 && item.LstEmployeeInvestmentDocuments.forEach(e1 => {
          e1.ApprovedAmount = !approvalAction ? 0 : (item.ApprovedAmount > 0 ? item.ApprovedAmount : e1.Amount);
          e1.Remarks = item.ApproverRemarks != null && item.ApproverRemarks != '' ? item.ApproverRemarks : '';
          e1.Status = !approvalAction ? 2 : 1;
        });

        if (locallyPreparedItem.ExsitingChildProduct != null) {
          let exitSecEE = locallyPreparedItem.ExsitingChildProduct;
          exitSecEE.Modetype = UIMode.Edit;
          exitSecEE.ApprovedAmount = !approvalAction ? 0 : exitSecEE.Amount;
          exitSecEE.LstEmployeeInvestmentDocuments != null && exitSecEE.LstEmployeeInvestmentDocuments.length > 0 && exitSecEE.LstEmployeeInvestmentDocuments.forEach(e1 => {
            e1.ApprovedAmount = !approvalAction ? 0 : (item.ApprovedAmount > 0 ? item.ApprovedAmount : e1.Amount);
            e1.Remarks = item.ApproverRemarks != null && item.ApproverRemarks != '' ? item.ApproverRemarks : '';
            e1.Status = !approvalAction ? 2 : 1;
          });
        }

        // if (locallyPreparedItem.ExsitingChildProduct != null) {
        //   let exitSecEE = locallyPreparedItem.ExsitingChildProduct;
        //   exitSecEE.Modetype = UIMode.Edit;
        //   exitSecEE.LstEmployeeInvestmentDocuments != null && exitSecEE.LstEmployeeInvestmentDocuments.length > 0 && exitSecEE.LstEmployeeInvestmentDocuments.forEach(e1 => {
        //     e1.ApprovedAmount = !approvalAction ? 0 : (item.ApprovedAmount > 0 ? item.ApprovedAmount : e1.Amount);
        //     e1.Remarks = item.ApproverRemarks != null && item.ApproverRemarks != '' ? item.ApproverRemarks : '';
        //     e1.Status = !approvalAction ? 2 : 1;
        //   });
        // }

        if (locallyPreparedItem.Existing80CChildProduct != null) {
          let exitSecEE = locallyPreparedItem.Existing80CChildProduct;
          exitSecEE.Modetype = UIMode.Edit;
          exitSecEE.ApprovedAmount = !approvalAction ? 0 : exitSecEE.Amount;
          exitSecEE.LstEmployeeInvestmentDocuments != null && exitSecEE.LstEmployeeInvestmentDocuments.length > 0 && exitSecEE.LstEmployeeInvestmentDocuments.forEach(e1 => {
            e1.ApprovedAmount = !approvalAction ? 0 : (item.ApprovedAmount > 0 ? item.ApprovedAmount : e1.Amount);
            e1.Remarks = item.ApproverRemarks != null && item.ApproverRemarks != '' ? item.ApproverRemarks : '';
            e1.Status = !approvalAction ? 2 : 1;
          });
        }
        // }
      }

      if (locallyPreparedItem.IsExemptions && item.LstEmployeeExemptionBillDetails != null && item.LstEmployeeExemptionBillDetails.length > 0) {

        item.LstEmployeeExemptionBillDetails.forEach(e1 => {

          if (!approvalAction) {
            e1.RejectedOn = moment().format('YYYY-MM-DD');
            e1.RejectedBy = this.UserId;
            e1.RejectedRemarks = (item.ApproverRemarks == null || item.ApproverRemarks == "") ? item.ApproverRemarks : e1.RejectedRemarks;
            e1.Modetype = UIMode.Edit;
            e1.ApprovedAmount = 0;
            e1.ApprovalStatus = 1;
            e1.Status = 2;
          }
          else {
            e1.ApprovedOn = moment().format('YYYY-MM-DD');
            e1.ApprovedBy = this.UserId;
            e1.RejectedRemarks = '';
            e1.Modetype = UIMode.Edit;
            e1.ApprovedAmount = (e1.ApprovedAmount == null || e1.ApprovedAmount == 0 || e1.ApprovedAmount > e1.BillAmount) ? e1.BillAmount : e1.ApprovedAmount;
            e1.ApprovalStatus = 1;
            e1.Status = 1;
          }

        });
      }

      item.Modetype = UIMode.Edit;

      console.log('locallyPreparedItem', locallyPreparedItem);

      if (!locallyPreparedItem.IsMedical && (locallyPreparedItem.IsInvestment || locallyPreparedItem.IsHRA)) {


        locallyPreparedItem.ApprovedAmount = item.ApprovedAmount;
        locallyPreparedItem.ApproverRemarks = item.ApproverRemarks;
        locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 0) : null,
          locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 1) : null,
          locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 2) : null,
          locallyPreparedItem.DocumentList = item.LstEmployeeInvestmentDocuments;
      }
      if (approvalAction && locallyPreparedItem.IsHP) { // HP only 
        console.log('HP ', item);

        // if (item.LetOut) {
        (item.GrossAnnualValueApprovedAmount == null || item.GrossAnnualValueApprovedAmount == 0) ? item.GrossAnnualValueApprovedAmount = item.GrossAnnualValue : true;
        (item.MunicipalTaxApprovedAmount == null || item.MunicipalTaxApprovedAmount == 0) ? item.MunicipalTaxApprovedAmount = item.MunicipalTax : true;
        item.ApprovedAmount = item.GrossAnnualValueApprovedAmount;
        locallyPreparedItem.ApprovedAmount = item.GrossAnnualValueApprovedAmount;
        // } else {
        (item.InterestAmountApprovedAmount == null || item.InterestAmountApprovedAmount == 0) ? item.InterestAmountApprovedAmount = item.InterestAmount : true;
        (item.PreConstructionInterestApprovedAmount == null || item.PreConstructionInterestApprovedAmount == 0) ? item.PreConstructionInterestApprovedAmount = item.PreConstructionInterestAmount : true;
        item.ApprovedAmount = item.InterestAmountApprovedAmount;
        locallyPreparedItem.ApprovedAmount = item.InterestAmountApprovedAmount;
        // }
        if (item.employeeInvestmentDeduction != null) {
          item.employeeInvestmentDeduction.ApprovedAmount = item.employeeInvestmentDeduction.Amount;
        }

        locallyPreparedItem.DeclarationItem.employeeInvestmentDeduction = item.employeeInvestmentDeduction

      }
      if (locallyPreparedItem.IsHP && !approvalAction) {
        locallyPreparedItem.ApprovedAmount = 0;
        if (item.employeeInvestmentDeduction != null) {
          item.employeeInvestmentDeduction.ApprovedAmount = 0;
        }

        locallyPreparedItem.DeclarationItem.employeeInvestmentDeduction = item.employeeInvestmentDeduction

      }

      if (locallyPreparedItem.IsHP) {
        locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 0) : null,
          locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 1) : null,
          locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 2) : null,
          locallyPreparedItem.DocumentList = item.LstEmployeeInvestmentDocuments;
      }

      if (locallyPreparedItem.IsExemptions) {
        locallyPreparedItem.ApprovedAmount = 0;
        item.ApprovedAmount = 0;
        item.LstEmployeeExemptionBillDetails.forEach(e => { item.ApprovedAmount += parseInt(e.ApprovedAmount.toString()) });
        item.LstEmployeeExemptionBillDetails.forEach(e => { locallyPreparedItem.ApprovedAmount += parseInt(e.ApprovedAmount.toString()) });

        // locallyPreparedItem.ApprovedAmount = item.ApprovedAmount;
        locallyPreparedItem.ApproverRemarks = item.ApproverRemarks;
        locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(item.LstEmployeeExemptionBillDetails, 0) : null,
          locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(item.LstEmployeeExemptionBillDetails, 1) : null,
          locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(item.LstEmployeeExemptionBillDetails, 2) : null,
          locallyPreparedItem.DocumentList = item.LstEmployeeExemptionBillDetails;
      }

      console.log(this.DeclarationRecords);
      console.log('emp ', this.employeedetails);

      this.IsEditable = false;

    } catch (error) {
      console.log('EXCEPTION OCCURRED WHILE APPROVE/REJECT PRODUCTS ::::', error);

    }
  }


  // -- listing approve / reject ---- 
  approverejectInvestment_cmn(item, indx, approvalAction) {


    if (!approvalAction) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Rejection Remarks',
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputValue: item.ApproverRemarks,
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
          this.updateRowwiseItem(item, jsonStr, approvalAction)
        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
        }
      });
    } else {
      this.updateRowwiseItem(item, '', approvalAction)
    }

  }

  updateRowwiseItem(jObject, rejectionRemarks, approvalAction) {

    if (jObject.IsHRA) {
      this.SelectedHRAId = jObject.Id;
      let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == jObject.Id);
      locallyPreparedItem.ApproverRemarks = rejectionRemarks;
      locallyPreparedItem.ApprovedAmount = approvalAction == true ? jObject.DeclaredAmount : 0;

      this.updateHRAApprovedAmount(approvalAction, rejectionRemarks);

      return;
    }


    let item = jObject.DeclarationItem;
    let locallyPreparedItem = this.DeclarationRecords.find(x => x.Id == item.Id);


    console.log('jObject', jObject);

    locallyPreparedItem.ApproverRemarks = rejectionRemarks;
    locallyPreparedItem.ApprovedAmount = approvalAction == true ? jObject.DeclaredAmount : 0;

    item.ApprovedAmount = approvalAction == true ? jObject.DeclaredAmount : 0;
    item.ApproverRemarks = approvalAction == true ? '' : rejectionRemarks;

    console.log('locallyPreparedItem', locallyPreparedItem);
    // -- exemption bills -- 
    if (locallyPreparedItem.IsExemptions) {

      if (item.LstEmployeeExemptionBillDetails != null && item.LstEmployeeExemptionBillDetails.length > 0) {

        item.LstEmployeeExemptionBillDetails.forEach(e1 => {
          e1.ApprovedAmount = approvalAction == true ? e1.BillAmount : 0;
          e1.Remarks = rejectionRemarks;
          e1.Status = !approvalAction ? 2 : 1;
          e1.Modetype = UIMode.Edit;
        });
      }

      locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeExemptionBillDetails != null && item.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(item.LstEmployeeExemptionBillDetails, 0) : null,
        locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeExemptionBillDetails != null && item.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(item.LstEmployeeExemptionBillDetails, 1) : null,
        locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeExemptionBillDetails != null && item.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(item.LstEmployeeExemptionBillDetails, 2) : null,
        locallyPreparedItem.DocumentList = item.LstEmployeeExemptionBillDetails;
    }

    // -- medical bills --
    if (locallyPreparedItem.IsMedical) {

      if (item.LstEmpInvDepDetails != null && item.LstEmpInvDepDetails.length > 0) {

        item.LstEmpInvDepDetails.forEach(e1 => {
          e1.ApprovedAmount = approvalAction == true ? e1.Amount : 0;
          e1.ApproverRemarks = rejectionRemarks;
          e1.Modetype = UIMode.Edit;
        });
      }

      console.log('MED ITEM ::', item);


    }

    if (!approvalAction && locallyPreparedItem.IsHP) {
      item.PreConstructionInterestApprovedAmount = 0;
      item.MunicipalTaxApprovedAmount = 0;
      item.InterestAmountApprovedAmount = 0;
      item.GrossAnnualValueApprovedAmount = 0;
      item.ApprovedAmount = 0;
    }

    if (approvalAction && locallyPreparedItem.IsHP) {
      item.PreConstructionInterestApprovedAmount = item.PreConstructionInterestAmount;
      item.MunicipalTaxApprovedAmount = item.MunicipalTax;
      item.InterestAmountApprovedAmount = item.InterestAmount;
      item.GrossAnnualValueApprovedAmount = item.GrossAnnualValue;
    }

    if (!approvalAction && locallyPreparedItem.IsOtherIncome) {
      item.TotalApprovedInterestAmount = 0;
      item.ApprovedOtherIncomeAmount = 0;
      item.Status = 2;
      locallyPreparedItem.DocumentPendingStatus = 0;
      locallyPreparedItem.DocumentApprovedStatus = 0;
      locallyPreparedItem.DocumentRejectedtatus = 1;
    }

    if (approvalAction && locallyPreparedItem.IsOtherIncome) {
      item.TotalApprovedInterestAmount = item.TotalInterestAmount;
      item.ApprovedOtherIncomeAmount = item.OtherIncomeAmount;
      item.Status = 1;
      locallyPreparedItem.DocumentPendingStatus = 0;
      locallyPreparedItem.DocumentApprovedStatus = 1;
      locallyPreparedItem.DocumentRejectedtatus = 0;
    }

    if (item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0) {

      item.LstEmployeeInvestmentDocuments.forEach(e1 => {
        e1.ApprovedAmount = approvalAction == true ? jObject.DeclaredAmount : 0;
        e1.Remarks = rejectionRemarks;
        e1.Status = !approvalAction ? 2 : 1;
      });
    }

    item.Modetype = UIMode.Edit;

    if (locallyPreparedItem.IsHP && locallyPreparedItem.DeclarationItem != null && locallyPreparedItem.DeclarationItem.employeeInvestmentDeduction != null) {
      locallyPreparedItem.DeclarationItem.employeeInvestmentDeduction.ApprovedAmount = approvalAction ? locallyPreparedItem.DeclarationItem.employeeInvestmentDeduction.Amount : 0;

    }

    if (locallyPreparedItem.IsInvestment || locallyPreparedItem.IsHRA) {

      console.log('locallyPreparedItem', locallyPreparedItem);

      locallyPreparedItem.ApprovedAmount = item.ApprovedAmount;
      locallyPreparedItem.ApproverRemarks = item.ApproverRemarks;
      locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 0) : null,
        locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 1) : null,
        locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 2) : null,
        locallyPreparedItem.DocumentList = item.LstEmployeeInvestmentDocuments;
    }
    if (locallyPreparedItem.IsHP) {
      locallyPreparedItem.ApprovedAmount = item.ApprovedAmount;
      locallyPreparedItem.ApproverRemarks = item.ApproverRemarks;
      locallyPreparedItem.DocumentPendingStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 0) : null,
        locallyPreparedItem.DocumentApprovedStatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 1) : null,
        locallyPreparedItem.DocumentRejectedtatus = item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? this.getStatusName(item.LstEmployeeInvestmentDocuments, 2) : null,
        locallyPreparedItem.DocumentList = item.LstEmployeeInvestmentDocuments;
    }

  }

  downloadForm12BB() {
    try {
      let _form12BB_SummaryDocumentId = this.employeedetails != null && this.employeedetails.EmployeeInvestmentMaster != null &&
        this.employeedetails.EmployeeInvestmentMaster.FinancialYearId == this.selectedFinYear &&
        this.employeedetails.EmployeeInvestmentMaster.SummaryDocumentId;

      this.loadingScreenService.startLoading();
      this.fileuploadService.downloadObjectAsBlob(_form12BB_SummaryDocumentId)
        .subscribe(res => {
          if (res == null || res == undefined) {
            this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
            return;
          }
          saveAs(res, `${this.employeedetails.Code}_Form12BB_${this.FinancialYearDescription}`);
          this.loadingScreenService.stopLoading();
        });
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
      return;
    }
  }

  doMapInvestmentLogHistoryBills(parentItem, item, Amount, Remarks, DeclaredUserId, DeclaredOn, ApprovedAmt, ApproverRemarks, sectionName) {
    let LstLogHistory = [];
    LstLogHistory = parentItem != null && parentItem.LstEmployeeExemptionBillDetails != null &&
      parentItem.LstEmployeeExemptionBillDetails.length > 0 &&
      parentItem.LstEmployeeExemptionBillDetails.filter(z => z.Id == item.Id).length > 0 &&
      parentItem.LstEmployeeExemptionBillDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? parentItem.LstEmployeeExemptionBillDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];

    LstLogHistory = LstLogHistory == null ? [] : LstLogHistory;
    var investmentLogHistory = new InvestmentLogHistory();
    investmentLogHistory.DeclaredAmount = Amount;
    investmentLogHistory.DeclaredRemarks = Remarks;
    investmentLogHistory.DeclaredBy = DeclaredUserId;
    investmentLogHistory.DeclaredOn = moment(new Date(DeclaredOn)).format('YYYY-MM-DD HH:mm:ss');
    investmentLogHistory.ApprovedAmount = ApprovedAmt;
    investmentLogHistory.ApproverRemarks = ApproverRemarks;
    investmentLogHistory.ApprovedBy = this.UserId;
    investmentLogHistory.ApprovedOn = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    LstLogHistory.push(investmentLogHistory);
    return LstLogHistory;
  }


  doMapInvestmentLogHistory(item, Amount, Remarks, DeclaredUserId, DeclaredOn, ApprovedAmt, ApproverRemarks, sectionName) {
    let LstLogHistory = [];
    let isNewRecord: boolean = false;
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
      else if (sectionName == 'HP') {
        LstLogHistory = this.employeedetails.LstEmployeeHousePropertyDetails != null &&
          this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 &&
          this.employeedetails.LstEmployeeHousePropertyDetails.filter(z => z.Id == item.Id).length > 0 &&
          this.employeedetails.LstEmployeeHousePropertyDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.employeedetails.LstEmployeeHousePropertyDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];

      }
      else if (sectionName == 'BILL') {
        LstLogHistory = this.employeedetails.LstEmployeeTaxExemptionDetails != null &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.filter(z => z.Id == item.Id).length > 0 &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.employeedetails.LstEmployeeTaxExemptionDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];

      }


      else if (sectionName == 'OTHER') {
        LstLogHistory = this.employeedetails.LstemployeeOtherIncomeSources != null &&
          this.employeedetails.LstemployeeOtherIncomeSources.length > 0 &&
          this.employeedetails.LstemployeeOtherIncomeSources.filter(z => z.Id == item.Id).length > 0 &&
          this.employeedetails.LstemployeeOtherIncomeSources.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.employeedetails.LstemployeeOtherIncomeSources.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];
      }
    }
    LstLogHistory = LstLogHistory == null ? [] : LstLogHistory;
    var investmentLogHistory = new InvestmentLogHistory();
    investmentLogHistory.DeclaredAmount = Amount;
    investmentLogHistory.DeclaredRemarks = Remarks;
    investmentLogHistory.DeclaredBy = DeclaredUserId;
    investmentLogHistory.DeclaredOn = moment(new Date(DeclaredOn)).format('YYYY-MM-DD HH:mm:ss');
    investmentLogHistory.ApprovedAmount = ApprovedAmt;
    investmentLogHistory.ApproverRemarks = ApproverRemarks;
    investmentLogHistory.ApprovedBy = this.UserId;
    investmentLogHistory.ApprovedOn = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    LstLogHistory.push(investmentLogHistory);
    return LstLogHistory;
  }

  save_Verification(actionIndx) {


    try {

      this.isReviewing = false;
      this.SelectedHRAId = null;
      this.selectedInvestmentItem = null;

      this.loadingScreenService.startLoading();
      console.log('actionIndx', actionIndx);

      // -- investment and deduction --
      if (this.employeedetails.LstemployeeInvestmentDeductions && this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {

        let editedExistingItems = [];
        editedExistingItems = this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.Modetype == UIMode.Edit);
        editedExistingItems && editedExistingItems.length > 0 && editedExistingItems.forEach(e3 => {
          e3.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(e3, e3.Amount, e3.InputsRemarks, e3.LastUpdatedBy, e3.LastUpdatedOn, e3.ApprovedAmount, e3.ApproverRemarks, 'INVT')
        });

      }

      if (this.employeedetails.LstemployeeHouseRentDetails && this.employeedetails.LstemployeeHouseRentDetails.length > 0) {

        let editedExistingItems = [];
        editedExistingItems = this.employeedetails.LstemployeeHouseRentDetails.filter(a => a.Modetype == UIMode.Edit);
        editedExistingItems && editedExistingItems.length > 0 && editedExistingItems.forEach(e3 => {
          e3.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(e3, e3.RentAmount, e3.InputsRemarks, e3.LastUpdatedBy, e3.LastUpdatedOn, e3.ApprovedAmount, e3.ApproverRemarks, 'HRA')
        });

      }

      if (this.employeedetails.LstEmployeeHousePropertyDetails && this.employeedetails.LstEmployeeHousePropertyDetails.length > 0) {

        let editedExistingItems = [];
        editedExistingItems = this.employeedetails.LstEmployeeHousePropertyDetails.filter(a => a.Modetype == UIMode.Edit);
        editedExistingItems && editedExistingItems.length > 0 && editedExistingItems.forEach(e3 => {
          e3.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(e3, this.getCalculatedInvestedAmount(e3), e3.InputsRemarks, e3.LastUpdatedBy, e3.LastUpdatedOn, this.getCalculatedApprovedAmount(e3), e3.ApproverRemarks, 'HP')
        });

      }

      if (this.employeedetails.LstEmployeeTaxExemptionDetails && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) {

        let editedExistingItems = [];
        editedExistingItems = this.employeedetails.LstEmployeeTaxExemptionDetails.filter(a => a.Modetype == UIMode.Edit);
        editedExistingItems && editedExistingItems.length > 0 && editedExistingItems.forEach(e3 => {
          e3.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(e3, e3.Amount, e3.InputsRemarks, e3.LastUpdatedBy, e3.LastUpdatedOn, e3.ApprovedAmount, e3.ApproverRemarks, 'BILL');

          e3.LstEmployeeExemptionBillDetails != null && e3.LstEmployeeExemptionBillDetails.length > 0 && e3.LstEmployeeExemptionBillDetails.forEach(e4 => {
            e4.LstInvestmentLogHistory = this.doMapInvestmentLogHistoryBills(e3, e4, e4.BillAmount, e3.Remarks, e3.LastUpdatedBy, e3.LastUpdatedOn, e4.ApprovedAmount, e3.RejectedRemarks, 'BILL');

          });
        });

      }
      if (this.employeedetails.LstemployeeOtherIncomeSources && this.employeedetails.LstemployeeOtherIncomeSources.length > 0) {

        let editedExistingItems = [];
        editedExistingItems = this.employeedetails.LstemployeeOtherIncomeSources.filter(a => a.Modetype == UIMode.Edit);
        editedExistingItems && editedExistingItems.length > 0 && editedExistingItems.forEach(e3 => {
          e3.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(e3, e3.InterestIncomeType == 3 ? e3.OtherIncomeAmount : e3.TotalInterestAmount, e3.InputsRemarks, e3.LastUpdatedBy, e3.LastUpdatedOn, e3.InterestIncomeType == 3 ? e3.ApprovedOtherIncomeAmount : e3.TotalApprovedInterestAmount, e3.ApproverRemarks, 'OTHER')
        });

      }

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

          this.loadingScreenService.stopLoading();
          if (data.Status) {
            if (actionIndx == null) {
              this.alertService.showSuccess(data.Message)
              this.onRefresh();
            }
            if (actionIndx != null) {
              // alert(actionIndx)
              // this.onRefresh();
              this.loadingScreenService.startLoading();
              this.callbackWorkflow(data, actionIndx);
            }


          }
          else {
            this.alertService.showWarning(data.Message);
          }
        },
          (err) => {

            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);
          });

      }


    } catch (err) {
      console.log('SAVE EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }


  }

  submit_Verification(actionIndx) {
    this.isReviewing = false;
    console.log('this.DeclarationRecords', this.DeclarationRecords);
    console.log('actionIndx', actionIndx);

    if (this.DeclarationRecords.filter(a => a.DocumentPendingStatus > 0).length > 0) {
      this.alertService.showWarning('Please validate all investment Proof before submitting');
      return false;
    }
    else if (this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails.filter(a => a.Status ==1 && a.FinancialYearId == this.selectedFinYear && a.ApprovalStatus == 0).length > 0) {
      this.alertService.showWarning('Please validate all previous employment Proof before submitting');
      return false;
    }

    else if (actionIndx == false && (this.OverallRemarks == null || this.OverallRemarks == '' || this.OverallRemarks == undefined)) {
      this.alertService.showWarning('Please give remarks/reasons for rejecting the request');
      return;
    }
    else {
      this.alertService.confirmSwal("Are you sure?", 'Are you sure you want to ' + (actionIndx ? 'Approve' : 'Reject') + ' this request?', "Yes, Proceed").then(result => {

        this.save_Verification(actionIndx);
      })
        .catch(error => this.loadingScreenService.stopLoading());
    }
  }

  callbackWorkflow(data, actionIndx) {
    var accessControl_submit = {
      AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
        : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
      ViewValue: null
    };
    this.workFlowDtls.Remarks = this.OverallRemarks;
    this.workFlowDtls.EntityId = data.dynamicObject.newobj.EmployeeInvestmentMaster.Id;
    this.workFlowDtls.EntityType = EntityType.EmployeeInvestmentMaster;
    this.workFlowDtls.CompanyId = this.CompanyId;
    this.workFlowDtls.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
    this.workFlowDtls.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
    this.workFlowDtls.ActionProcessingStatus = 29500;
    this.workFlowDtls.ImplementationCompanyId = 0;
    this.workFlowDtls.WorkFlowAction = actionIndx ? 29 : 38;
    this.workFlowDtls.RoleId = this.RoleId;
    this.workFlowDtls.DependentObject = data.dynamicObject.newobj;
    this.workFlowDtls.UserInterfaceControlLst = accessControl_submit;

    this.employeeService.post_InvestmentWorkFlow(JSON.stringify(this.workFlowDtls)).subscribe((response) => {

      if (response != null && response != undefined && !response.Status) {
        this.alertService.showInfo(response != null && response != undefined ? response.Message : 'Data saved but unable to submit, please contact support team');
        this.loadingScreenService.stopLoading();
        return;
      }
      if (actionIndx) {
        this.payrollService.ValidateAndPushToTimeCard(this.EmployeeId).then((result) => {
          console.log("VALIDATE AND PUSH TO TIMECARD - Task Complete!")
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess('Response submitted successfully');
          this.router.navigateByUrl("app/onboardingqc/investment_qc");
        })
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showSuccess('Response submitted successfully');
        this.router.navigateByUrl("app/onboardingqc/investment_qc");
      }

    }), ((error) => {

    });
  }

  cancel_Verification() {
    this.router.navigateByUrl("app/onboardingqc/investment_qc");
    return;
  }


  viewDependents(exemption, indx, dependentDetailsModal) {
    this.LstTravellerDetails  =[];
    this.LstTravellerDetails = exemption.LstTravellerDetails;
    this.modalService.open(dependentDetailsModal, this.modalOption);
  
  }

  getTransportMode(TMId){
    return TMId > 0 ? this.TravelTypes.find(a => a.id == TMId).name : '---';
  }
}

