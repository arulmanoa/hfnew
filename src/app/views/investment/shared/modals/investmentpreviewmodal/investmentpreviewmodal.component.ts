import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { AlertService, EmployeeService, ESSService, FileUploadService } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { UIMode } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { EmployeeInvestmentDeductions, EmployeeInvestmentDocuments } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { E, I, X, Z } from '@angular/cdk/keycodes';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { apiResult } from 'src/app/_services/model/apiResult';
import _ from 'lodash';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { EmployeeExemptionDetails } from 'src/app/_services/model/Employee/EmployeeExcemptions';
import { ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { EmployeeExemptionBillDetails, EmployeeTaxExemptionDetails } from 'src/app/_services/model/Employee/EmployeeTaxExemptionDetails';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Relationship } from 'src/app/_services/model/Base/HRSuiteEnums';
import { InterestIncomeType } from 'src/app/_services/model/Employee/EmployeeOtherIncomeSources';

@Component({
  selector: 'app-investmentpreviewmodal',
  templateUrl: './investmentpreviewmodal.component.html',
  styleUrls: ['./investmentpreviewmodal.component.scss']
})
export class InvestmentpreviewmodalComponent implements OnInit {


  @Input() employeedetails: EmployeeDetails;
  @Input() currentTaxMode: number;
  @Input() LstAllDeclarationProducts: any[] = [];
  @Input() selectedFinYear: any;
  @Input() IsNewTaxRegimeOpted: boolean;
  @Input() LstEmployeeInvestmentLookup: EmployeeLookUp;
  @Input() TaxTotalDeclaredAmount: number;
  @Input() TaxTotalApprovedAmount: number;
  @Input() TaxTotalQualifyingAmount: number;
  relationship: any = [];
  interestIncomeType: any = [];
  modalOption: NgbModalOptions = {};

  PerquisitesProductList = [];
  LstTaxExemptionProduct = [];

  LstMedicalInsuranceProduct = [];
  IsMedicalDependentExists: boolean = false;
  DependentType = [{ Id: 1, Name: "Self" }, { Id: 2, Name: "Immediate Dependents" }, { Id: 3, Name: "Parents more than 60 years old" }];
  lstDisabilityPercentage = [{ Id: 1, Name: "more than 40% but less than 80%" }, { Id: 2, Name: "more than 80%" }];

  // HP Child Prod
  HPChildProducts = [];
  StampDutyFeeProduct = [];

  FinancialYearDescription: string = "";

  spinner: boolean = false;

  HRALandlordDetails: any;

  ExsitingChildProduct: any;
  Existing80CChildProduct: any;

  DeclarationRecords: any[] = [];
  public hideRuleContent: boolean[] = [];
  public hideRuleContent_HRA: boolean[] = [];

  constructor(
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private loadingScreenService: LoadingScreenService,
    private essService: ESSService,
    private employeeService: EmployeeService,
    private investmentService: InvestmentService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private fileuploadService: FileUploadService,
    private utilsHelper: enumHelper,
  ) { }

  ngOnInit() {
    this.spinner = true;
    this.onRefresh();
  }

  onRefresh() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.LstAllDeclarationProducts = this.LstEmployeeInvestmentLookup != null ? this.LstEmployeeInvestmentLookup.InvesmentProductList : [];
    this.PerquisitesProductList = this.LstEmployeeInvestmentLookup.PerquisitesProductList;
    this.LstTaxExemptionProduct = this.LstAllDeclarationProducts.filter(exe => exe.TaxCodeTypeId == TaxCodeType.Exemptions);
    this.currentTaxMode = this.LstEmployeeInvestmentLookup.InvestmentMode;
    this.LstMedicalInsuranceProduct = this.LstAllDeclarationProducts.filter(a => a.Code == 'Sec80DD' || a.Code == 'Sec80DDB' || a.Code == "Sec80D" || a.Code == 'Sec80D_S' || a.Code == "Sec80D_P");
    this.LstMedicalInsuranceProduct.length > 0 && this.LstMedicalInsuranceProduct.forEach(j => {
      j["IsInvalid"] = false;
    });

    this.HPChildProducts = this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.filter(pro => environment.environment.HousePropertiesChildProductCodes.includes(pro.ProductCode.toUpperCase())) : [];
    this.StampDutyFeeProduct = this.HPChildProducts.length > 0 && this.HPChildProducts.filter(a => a.Code == 'Sec80C').length > 0
      ? this.HPChildProducts.filter(a => a.Code == 'Sec80C') : [];
    this.FinancialYearDescription = this.LstEmployeeInvestmentLookup.FicalYearList.find(dt => dt.Id == this.selectedFinYear).code.replace(/_/g, "-");

    this.relationship = this.utilsHelper.transform(Relationship);
    this.interestIncomeType = this.utilsHelper.transform(InterestIncomeType);

    this.relationship.push({ id: 0, name: 'Self' });
    this.relationship.sort((a, b) => a.id - b.id);

    this.doPushLandingCardRecord(0, 3); // category : all, status : all
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
          if (element.FinancialYearId == this.selectedFinYear)
            DeclarationData.push({
              ProductName: 'Other Income',
              ProductId: 0,
              ProductSection: null,
              ProductDescription: 'Includes interest from savings bank, deposits and other interest',
              ProductTaxCodeType: 'Other Income',
              ProductTaxCodeTypeId: 4,
              DeclaredAmount: element.InterestIncomeType == 3 ? element.OtherIncomeAmount : element.TotalInterestAmount,
              DeclaredRemarks: element.InputsRemarks,
              ApprovedAmount: element.InterestIncomeType == 3 ? element.ApprovedOtherIncomeAmount == null ? 0 : element.ApprovedOtherIncomeAmount : element.TotalApprovedInterestAmount == null ? 0 : element.TotalApprovedInterestAmount,
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
              ExsitingChildProduct: null
            })

        });


        this.employeedetails.LstemployeeInvestmentDeductions != null &&
          this.employeedetails.LstemployeeInvestmentDeductions.length > 0
        this.employeedetails.LstemployeeInvestmentDeductions.forEach(element => {
          if (element.FinancialYearId == this.selectedFinYear && (element.EHPId == 0 || element.EHPId == null) && this.StampDutyFeeProduct.filter(y => y.ProductId == element.ProductID).length == 0 && !environment.environment.HousePropertiesChildProductCodes.includes(this.LstAllDeclarationProducts.find(a => a.ProductId != element.ProductID).ProductCode.toUpperCase()))
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
            })

        });


        this.employeedetails.LstEmployeeTaxExemptionDetails != null &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0
        this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(element => {

          if (element.FinancialYearId == this.selectedFinYear) {
            console.log('element fdgdfgs', element);

            // element.LstEmployeeExemptionBillDetails.length > 0 ? element.LstEmployeeExemptionBillDetails = element.LstEmployeeExemptionBillDetails.filter(z => z.BillId > 0) : true;
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
                DocumentPendingStatus: element.LstEmployeeExemptionBillDetails && element.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(element.LstEmployeeExemptionBillDetails, 0) : 0,
                DocumentApprovedStatus: element.LstEmployeeExemptionBillDetails && element.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(element.LstEmployeeExemptionBillDetails, 1) : 0,
                DocumentRejectedtatus: element.LstEmployeeExemptionBillDetails && element.LstEmployeeExemptionBillDetails.length > 0 ? this.getExemptionStatusName(element.LstEmployeeExemptionBillDetails, 2) : 0,
                DocumentList: element.LstEmployeeExemptionBillDetails && element.LstEmployeeExemptionBillDetails.length > 0 ? element.LstEmployeeExemptionBillDetails.filter(z => z.BillId > 0) : [],
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


              })
            }
          }

        });



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

          if (element.FinancialYearId == this.selectedFinYear)
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



      this.employeedetails.LstEmployeeHousePropertyDetails != null &&
        this.employeedetails.LstEmployeeHousePropertyDetails.length > 0
      this.employeedetails.LstEmployeeHousePropertyDetails.forEach(element => {
        if (element.FinancialYearId == this.selectedFinYear)
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
          })
      });

      this.DeclarationRecords = DeclarationData
      console.log('EXE DeclarationRecords :::', DeclarationData);
      this.spinner = false; // CLOSING SPINNER 
    } catch (error) {
      console.log('EXE PRELOAD :::', error);

    }
  }

  toggle(index) {
    this.hideRuleContent[index] = !this.hideRuleContent[index];
  }
  toggle_HRA(index) {
    this.hideRuleContent_HRA[index] = !this.hideRuleContent_HRA[index];
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
  getStatusName(list, status) {
    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;
  }

  getStatus(item, status) {
    console.log('item', item);
    return item.LstEmployeeInvestmentDocuments != null && item.LstEmployeeInvestmentDocuments.length > 0 ? item.LstEmployeeInvestmentDocuments.filter(a => a.Status == status).length : 0;

  }

  getCount(list, status) {
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
    let AddressDetails = JSON.parse(currentItem.LandLordDetails.AddressDetails);
    return this.LstEmployeeInvestmentLookup.CityList.find(a => a.Id == AddressDetails.NameofCity).Name;
  }
  getHRAAddressDetails(currentItem, columnName) {
    let AddressDetails = JSON.parse(currentItem.LandLordDetails.AddressDetails);
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

  getHRAItems() {
    return this.DeclarationRecords && this.DeclarationRecords.length > 0 && this.DeclarationRecords.filter(a => a.IsHRA).length > 0 ? this.DeclarationRecords.find(a => a.IsHRA).DeclarationItem : [];

  }

  getHRADetails() {
    return this.DeclarationRecords && this.DeclarationRecords.length > 0 && this.DeclarationRecords.filter(a => a.IsHRA).length > 0 ? true : false;

  }

  getHPAdditionalSecCode(ExsitingChildProduct) {
    let medicalPro = this.LstAllDeclarationProducts.find(x => x.ProductId == ExsitingChildProduct.ProductID);
    return medicalPro.Code;
  }

  getRelationShipName(RId) {
    return this.relationship.find(a => a.id == RId).name;
  }

  getDependentTypeName(RId) {
    return this.DependentType.find(a => a.Id == RId).Name;
  }
  getDisabilityPercentageName(RId) {
    return this.lstDisabilityPercentage.find(a => a.Id == RId).Name;
  }
  getDependentsItems(DeclarationItem) {


    return DeclarationItem.LstEmpInvDepDetails && DeclarationItem.LstEmpInvDepDetails.length > 0 ? DeclarationItem.LstEmpInvDepDetails : [];


  }

  getExemptionBills(DeclarationItem) {
    return DeclarationItem.LstEmployeeExemptionBillDetails && DeclarationItem.LstEmployeeExemptionBillDetails.length > 0 ? DeclarationItem.LstEmployeeExemptionBillDetails : [];

  }

  getSectionCode(sectionCode, ite) {
    let medicalPro = this.LstMedicalInsuranceProduct.find(x => x.ProductId == ite.ProductID);
    return medicalPro.Code == sectionCode ? true : false;
  }

  doViewFile(photo, item) {
    console.log('photo', item);
    if (item.IsExemptions) {
      photo['DocumentId'] = photo.BillId
    }
    var fileNameSplitsArray = photo.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      let item = { BillId: photo.BillId, FileName: photo.FileName };
      this.downloadBillDocument(item);

      return;
    } else {

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
  }


  downloadBillDocument(item) {
    try {

      this.loadingScreenService.startLoading();
      this.fileuploadService.downloadObjectAsBlob(item.BillId)
        .subscribe(res => {
          if (res == null || res == undefined) {
            this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
            return;
          }
          saveAs(res, `${this.employeedetails.Code}_${item.FileName}`);
          this.loadingScreenService.stopLoading();
        });
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
      return;
    }
  }
  close_preview_investments() {
    this.activeModal.close('Modal Closed');
  }

}
